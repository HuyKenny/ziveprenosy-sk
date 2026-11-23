#!/usr/bin/env node
// Team crests as small WebP files served as static assets: node scripts/logos.mjs
// The provider's PNGs are 150×150 and up to 130 kB; we show them at 20–56 px. This writes
// public/logo/<sport>/<id>-64.webp and -128.webp (a few kB each) for every team the shared results database has
// linked, plus src/data/logos.json (which ids exist). Crest.astro uses the WebP when listed and falls back to the
// /logo/<sport>/<id>.png proxy otherwise, so a team linked after the last run still gets its crest. Ids the
// provider has no crest for are listed under `none` and shown as initials.
// Reads the linked teams from sportstreamy.cz/_data/team-logos.json (fallback: D1 with wrangler, read only).
// Prints CHANGED when the set of files changed (bin/ziveprenosy-logos.sh deploys only then).
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';

const SPORT = { 16: 'football', 23: 'hockey', 7: 'basketball', 47: 'volleyball', 20: 'handball' };
const ORIGIN = ['https://media', 'api-sports', 'io'].join('.');
const creds = Object.fromEntries(readFileSync('/home/kenny/ai/credentials/.cloudflare-credentials.env', 'utf8').split('\n').filter((l) => l.includes('=') && !l.startsWith('#')).map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).replace(/^["']|["']$/g, '')]));
const env = { ...process.env, CLOUDFLARE_API_KEY: creds.CF_API_KEY, CLOUDFLARE_EMAIL: creds.CF_EMAIL };

// Since 23. 11. 2026 the results live in the GitHub Actions job of sportstreamy, which publishes the linked teams as
// https://sportstreamy.cz/_data/team-logos.json; D1 is only the fallback for the SSR era.
async function linked() {
  try {
    const r = await fetch('https://sportstreamy.cz/_data/team-logos.json', { headers: { 'User-Agent': 'ziveprenosy-logos/1.0' } });
    if (r.ok) return await r.json();
  } catch { /* fall back to D1 */ }
  const out = execFileSync('pnpm', ['exec', 'wrangler', 'd1', 'execute', 'sportstreamy-results', '--remote', '--json', '--command',
    'SELECT DISTINCT m.sport AS sport, tl.af_id AS id FROM team_link tl JOIN matches m ON m.home_ext = tl.tip_id OR m.away_ext = tl.tip_id'], { env, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  return JSON.parse(out)[0].results;
}
const rows = (await linked()).filter((r) => SPORT[r.sport] && /^\d{1,7}$/.test(String(r.id))).map((r) => ({ sport: r.sport, id: String(r.id) }));

const MANIFEST = 'src/data/logos.json';
const before = existsSync(MANIFEST) ? readFileSync(MANIFEST, 'utf8') : '';
const have = {};
const none = {}; // the provider has no crest for these: show initials, do not try the proxy
let made = 0;
let failed = 0;
for (const { sport, id } of rows) {
  const dir = `public/logo/${SPORT[sport]}`;
  const small = `${dir}/${id}-64.webp`;
  if (!existsSync(small)) {
    try {
      const res = await fetch(`${ORIGIN}/${SPORT[sport]}/teams/${id}.png`);
      if (!res.ok || !(res.headers.get('content-type') ?? '').startsWith('image/')) throw new Error(String(res.status));
      const buf = Buffer.from(await res.arrayBuffer());
      mkdirSync(dir, { recursive: true });
      for (const w of [64, 128]) {
        await sharp(buf).resize(w, w, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).webp({ quality: 82, effort: 6 }).toFile(`${dir}/${id}-${w}.webp`);
      }
      made++;
    } catch {
      failed++;
      (none[sport] ??= []).push(id);
      continue;
    }
  }
  (have[sport] ??= []).push(id);
}
for (const k of Object.keys(have)) have[k] = [...new Set(have[k])].sort((a, b) => Number(a) - Number(b));
const after = JSON.stringify({ have, none }) + '\n';
writeFileSync(MANIFEST, after);
console.log(`logos: ${rows.length} linked, ${made} new, ${failed} failed`);
if (after !== before) console.log('CHANGED');
