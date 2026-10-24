#!/usr/bin/env node
// Sport photos from Pexels. Two steps so a human picks the shots:
//   node scripts/pexels.mjs search            → contact sheets in $OUT (default /tmp) per sport, ids printed
//   node scripts/pexels.mjs fetch             → downloads ids listed in PICKS below into public/img/sport/, writes src/data/photos.json
// Key: PEXELS_API_KEY from ~/ai/credentials/.sportstreamy-credentials.env (never committed).
import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const KEY = readFileSync('/home/kenny/ai/credentials/.sportstreamy-credentials.env', 'utf8').match(/^PEXELS_API_KEY="?([^"\n]+)/m)?.[1];
if (!KEY) throw new Error('PEXELS_API_KEY missing');
const OUT = process.env.OUT ?? '/tmp';

/** Search query per sport slug (English queries give far better Pexels results). Worded differently from sportstreamy.cz
 * and its photo ids are excluded, so the two sites never share a picture. */
const QUERIES = {
  stadion: 'stadium floodlights evening match',
  futbal: 'soccer players ball duel grass',
  hokej: 'ice hockey players puck rink',
  tenis: 'tennis serve professional court',
  basketbal: 'basketball players dunk game',
  volejbal: 'volleyball spike net players',
  hadzana: 'handball player throw',
  florbal: 'floorball game',
  futsal: 'indoor football futsal',
  'stolny-tenis': 'ping pong player table tennis',
  esporty: 'gamer esports headset',
  snooker: 'snooker player cue',
  sipky: 'darts player throwing',
  mma: 'mma fighters octagon',
  box: 'boxers boxing ring fight',
  motorsport: 'race car motorsport',
};
const SPORTSTREAMY = new Set([35898730, 32285228, 6468928, 18421042, 31177171, 31044958, 25048028, 9708234, 37097046, 38446269, 9072212, 11354500, 12150231, 28560751, 31485125, 30054776, 32285161, 6847914, 36231026, 30555514, 34544419, 13699258, 9072275]);

/** Chosen photo id per slug (filled after looking at the contact sheets). */
const PICKS = {
  stadion: 28827841, futbal: 29719243, hokej: 13978860, tenis: 171568, basketbal: 30555531, volejbal: 6203587,
  hadzana: 37097043, florbal: 29804128, futsal: 13521967, 'stolny-tenis': 32843102, esporty: 7849511, snooker: 13036112,
  sipky: 32623458, mma: 5616855, box: 28304202, motorsport: 10342587,
  // second shots for the busiest sports, so neighbouring cards do not repeat one picture
  'futbal-2': 3651672, 'hokej-2': 11135751, 'tenis-2': 13602337, 'basketbal-2': 71103, 'volejbal-2': 6180399,
};

const api = (path) => fetch(`https://api.pexels.com/v1${path}`, { headers: { Authorization: KEY } }).then((r) => {
  if (!r.ok) throw new Error(`pexels ${r.status} ${path}`);
  return r.json();
});

async function search() {
  for (const [slug, q] of Object.entries(QUERIES)) {
    const d = await api(`/search?query=${encodeURIComponent(q)}&per_page=12&orientation=landscape`);
    d.photos = d.photos.filter((p) => !SPORTSTREAMY.has(p.id)).slice(0, 8);
    const tiles = await Promise.all(d.photos.map(async (p) => sharp(Buffer.from(await (await fetch(p.src.medium)).arrayBuffer())).resize(320, 180, { fit: 'cover' }).png().toBuffer()));
    const sheet = sharp({ create: { width: 320 * 4, height: 180 * 2, channels: 3, background: '#000' } })
      .composite(tiles.map((input, i) => ({ input, left: (i % 4) * 320, top: Math.floor(i / 4) * 180 })));
    await sheet.jpeg({ quality: 70 }).toFile(`${OUT}/pexels-${slug}.jpg`);
    console.log(slug, d.photos.map((p) => p.id).join(' '));
  }
}

async function fetchPicks() {
  mkdirSync('public/img/sport', { recursive: true });
  const meta = {};
  let old = {};
  try { old = JSON.parse(readFileSync('src/data/photos.json', 'utf8')); } catch { /* first run */ }
  for (const [slug, id] of Object.entries(PICKS)) {
    if (old[slug]?.id === id && !process.env.FORCE) { meta[slug] = old[slug]; continue; }
    const p = await api(`/photos/${id}`);
    const buf = Buffer.from(await (await fetch(p.src.original)).arrayBuffer());
    const base = sharp(buf).rotate();
    // 16:9 crops; attention keeps the action in frame.
    for (const w of [1600, 800, 480]) {
      if (w === 1600 && slug.endsWith('-2')) continue; // seconds are only used in cards
      const img = base.clone().resize(w, Math.round((w * 9) / 16), { fit: 'cover', position: sharp.strategy.attention });
      await img.clone().avif({ quality: 48 }).toFile(`public/img/sport/${slug}-${w}.avif`);
      if (w === 800) await img.clone().jpeg({ quality: 72, mozjpeg: true }).toFile(`public/img/sport/${slug}-${w}.jpg`); // fallback only
    }
    meta[slug] = { id, author: p.photographer, authorUrl: p.photographer_url, url: p.url, alt: p.alt || '' };
    console.log(slug, id, p.photographer);
  }
  mkdirSync('src/data', { recursive: true });
  writeFileSync('src/data/photos.json', JSON.stringify(meta, null, 1) + '\n');
}

const cmd = process.argv[2];
if (cmd === 'search') await search();
else if (cmd === 'fetch') await fetchPicks();
else console.log('usage: pexels.mjs search|fetch');
