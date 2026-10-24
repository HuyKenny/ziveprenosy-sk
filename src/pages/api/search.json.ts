import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import type { Env, Match } from '../../lib/types';
import { view } from '../../lib/matches';
import { matchPath, matchTitle } from '../../lib/url';
import { SPORT_BY_ID } from '../../lib/sports';
import { COMPETITIONS, leagueName } from '../../lib/competitions';
import { leagues } from '../../lib/page';

export const prerender = false;

/** Compact search index: matches as [title, league, url, start, live, sport], competitions as [name, sport, url]. */
export const GET: APIRoute = async () => {
  const v = await view(env as unknown as Env);
  const now = Date.now();
  const row = (live: number) => (x: Match) => [matchTitle(x), leagueName(x.sp, x.lg), matchPath(x), x.st, live, SPORT_BY_ID.get(x.sp)?.name ?? ''];
  const m = [...v.live.map(row(1)), ...v.upcoming.filter((x) => x.st - now < 7 * 86_400_000).map(row(0))];
  const seen = new Set<string>();
  const c: [string, string, string][] = [];
  for (const x of COMPETITIONS) { const s = SPORT_BY_ID.get(x.sp)!; c.push([x.name, s.name, `/${s.slug}/${x.slug}/`]); seen.add(`${s.slug}/${x.slug}`); }
  for (const l of leagues(v)) { const s = SPORT_BY_ID.get(l.sp)!; if (l.n >= 2 && !seen.has(`${s.slug}/${l.slug}`)) c.push([l.name, s.name, `/${s.slug}/${l.slug}/`]); }
  return new Response(JSON.stringify({ m, c }), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, s-maxage=120', 'X-Robots-Tag': 'noindex' } });
};
