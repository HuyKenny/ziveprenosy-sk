import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import type { Env, Match } from '../../lib/types';
import { view, tier, rank } from '../../lib/matches';
import { matchPath, matchTitle, home, away, leaguePathOf } from '../../lib/url';
import { SPORT_BY_ID } from '../../lib/sports';
import { COMPETITIONS, competitionOf, leagueName } from '../../lib/competitions';
import { leagues } from '../../lib/page';
import { resultsDb } from '../../lib/results/config';
import { logoMap, crestOf } from '../../lib/results/logos';
import { skClockShort } from '../../lib/names';

export const prerender = false;

/**
 * Compact search index: matches as [title, league, url, start, live, sport, sport slug, video 0/1, league url, home, away,
 * home crest, away crest, live score, live clock, tier, sport rank, badge [short, colour] or 0, starts soon 0/1], competitions as
 * [name, sport, url]. The header suggest reads the first six fields; the static /hladat/ page renders full result rows
 * (LeagueList / MatchRow markup) from all of them, because the frozen site has no server to run the query.
 */
export const GET: APIRoute = async () => {
  const v = await view(env as unknown as Env);
  const now = Date.now();
  let logos: Map<string, string> | null = null;
  try { logos = await logoMap(resultsDb(env as unknown as Env)); } catch { /* no results DB: initials only */ }
  const crest = (sp: number, name: string) => (logos && name ? crestOf(logos, sp, name, 22)?.src ?? '' : '');
  const row = (live: number) => (x: Match) => {
    const c = competitionOf(x.sp, x.lg);
    return [
      matchTitle(x), leagueName(x.sp, x.lg), matchPath(x), x.st, live, SPORT_BY_ID.get(x.sp)?.name ?? '',
      SPORT_BY_ID.get(x.sp)?.slug ?? '', x.stream ? 1 : 0, leaguePathOf(x), home(x), away(x), crest(x.sp, x.h), crest(x.sp, x.a),
      live ? x.sc ?? '' : '', live ? skClockShort(x.ti ?? '') : '', tier(x), rank(x), c ? [c.short, c.color] : 0, live && /^(Za|O) /.test(x.ti ?? '') ? 1 : 0,
    ];
  };
  const m = [...v.live.map(row(1)), ...v.upcoming.filter((x) => x.st - now < 7 * 86_400_000).map(row(0))];
  const seen = new Set<string>();
  const c: [string, string, string][] = [];
  for (const x of COMPETITIONS) { const s = SPORT_BY_ID.get(x.sp)!; c.push([x.name, s.name, `/${s.slug}/${x.slug}/`]); seen.add(`${s.slug}/${x.slug}`); }
  for (const l of leagues(v)) { const s = SPORT_BY_ID.get(l.sp)!; if (l.n >= 2 && !seen.has(`${s.slug}/${l.slug}`)) c.push([l.name, s.name, `/${s.slug}/${l.slug}/`]); }
  return new Response(JSON.stringify({ m, c }), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, s-maxage=120', 'X-Robots-Tag': 'noindex' } });
};
