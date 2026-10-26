import { env } from 'cloudflare:workers';
import type { Env, Match } from '../lib/types';
import { view } from '../lib/matches';
import { matchPath } from '../lib/url';
import { xml, urlset } from '../lib/sitemap';
import { resultsConfig, resultsDb } from '../lib/results/config';
import { finalsSince } from '../lib/results/store';
export const prerender = false;
/** Live + upcoming matches; finished ones drop out (410) — except matches with a stored result. */
export const GET = async () => {
  const e = env as unknown as Env;
  const v = await view(e);
  const lastmod = new Date(v.at || Date.now()).toISOString();
  const urls = [...v.live, ...v.upcoming].slice(0, 5000).map((m) => ({ loc: matchPath(m), lastmod }));
  const db = resultsDb(e);
  if (db) {
    const seen = new Set(urls.map((u) => u.loc));
    for (const r of await finalsSince(db, Date.now() - 60 * 86_400_000, resultsConfig(e).comps)) {
      const loc = matchPath({ id: Number(r.ext_id), h: r.home, a: r.away } as Match);
      if (!seen.has(loc)) urls.push({ loc, lastmod: new Date(r.final_at ?? Date.now()).toISOString() });
    }
  }
  return xml(urlset(urls), 120);
};
