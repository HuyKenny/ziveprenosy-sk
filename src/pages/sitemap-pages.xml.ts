import { env } from 'cloudflare:workers';
import type { Env } from '../lib/types';
import { view } from '../lib/matches';
import { leagues } from '../lib/page';
import { xml, urlset, type Url } from '../lib/sitemap';
import { SPORTS, SPORT_BY_ID } from '../lib/sports';
import { COMPETITIONS } from '../lib/competitions';
import { TODAY_SPORTS } from '../lib/sport-text';
import { dayKey, addDays } from '../lib/text';
import { resultsConfig } from '../lib/results/config';
import { resultSports } from '../lib/results/sports';
import { TEAMS } from '../lib/teams';
import { getCollection } from 'astro:content';
export const prerender = false;
/** Hubs, sports, curated competitions, competitions currently in the feed (2+ matches), programme days, guides. */
export const GET = async () => {
  const v = await view(env as unknown as Env);
  const now = Date.now();
  const urls: Url[] = ['/', '/teraz-nazivo/', '/program/', '/program/zajtra/', '/vysledky/', '/vysledky/vcera/', '/kurzy-dnes/', '/tipsport-tv/', '/tipsport-bonus/', '/tipsport-prihlasenie/'].map((loc) => ({ loc }));
  for (const s of resultSports(resultsConfig(env as unknown as Env).comps)) urls.push({ loc: `/vysledky/${s.slug}/` }, { loc: `/vysledky/${s.slug}/vcera/` });
  for (let i = 2; i < 7; i++) urls.push({ loc: `/program/${dayKey(addDays(now, i))}/` });
  for (const s of SPORTS) {
    urls.push({ loc: `/${s.slug}/` });
    if (TODAY_SPORTS.has(s.slug)) urls.push({ loc: `/${s.slug}/dnes/` });
  }
  const seen = new Set<string>();
  for (const c of COMPETITIONS) { const loc = `/${SPORT_BY_ID.get(c.sp)!.slug}/${c.slug}/`; seen.add(loc); urls.push({ loc }); }
  for (const l of leagues(v)) {
    const loc = `/${SPORT_BY_ID.get(l.sp)!.slug}/${l.slug}/`;
    if (l.n >= 2 && !seen.has(loc)) { seen.add(loc); urls.push({ loc }); }
  }
  for (const t of TEAMS) urls.push({ loc: `/${SPORT_BY_ID.get(t.sp)!.slug}/tim/${t.slug}/` });
  const rcomps = resultsConfig(env as unknown as Env).comps;
  for (const c of COMPETITIONS) if (rcomps.includes(c.id)) urls.push({ loc: `/${SPORT_BY_ID.get(c.sp)!.slug}/${c.slug}/vysledky/` });
  urls.push({ loc: '/clanky/' }, { loc: '/ako-pozerat/' });
  for (const p of await getCollection('nahlady')) urls.push({ loc: `/ako-pozerat/${p.id}/` });
  for (const a of await getCollection('clanky')) urls.push({ loc: `/clanky/${a.id}/` });
  for (const p of ['/o-nas/', '/kontakt/', '/zodpovedne-hranie/', '/ochrana-osobnych-udajov/', '/podmienky/', '/zdroje-fotiek/']) urls.push({ loc: p });
  return xml(urlset(urls), 900);
};
