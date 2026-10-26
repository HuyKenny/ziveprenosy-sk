import { slugify } from './text';
import { TEAMS } from './teams';
import { SPORT_BY_ID } from './sports';
import { skTeam } from './names';
import { teamPath } from './url';

/**
 * Old or guessed addresses that people, bots and other sites still request, mapped to the closest live page.
 * Scanner probes (/wp-json/, /credentials.yaml, …) are deliberately not here: they stay 404.
 */
const LEGACY = new Map<string, string>([
  ['/favicon.ico', '/favicon-32.png'],
  ['/favicon.png', '/favicon-32.png'],
  ['/sitemap_index.xml', '/sitemap.xml'],
  ['/sitemap-index.xml', '/sitemap.xml'],
  ['/wp-sitemap.xml', '/sitemap.xml'],
  ['/blog', '/'],
  ['/news', '/'],
  ['/clanky', '/'],
  ['/novinky', '/'],
  ['/zive', '/teraz-nazivo/'],
  ['/live', '/teraz-nazivo/'],
  ['/bonus', '/tipsport-bonus/'],
  ['/tipsport-bonus-20', '/tipsport-bonus/'],
  ['/login', '/tipsport-prihlasenie/'],
  ['/prihlasenie', '/tipsport-prihlasenie/'],
  ['/registracia', '/tipsport-prihlasenie/'],
]);

export function legacyTarget(pathname: string): string | undefined {
  return LEGACY.get(pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname);
}

const TEAM_TOKENS = TEAMS.map((t) => ({ t, tok: slugify(skTeam(t.feed)) })).filter((x) => x.tok);

/**
 * A match page whose event has left the feed and has no stored result: send visitors to the club page when the slug
 * names a registered club (and only one sport fits), otherwise to the live overview. Never to the home page.
 */
export function goneMatchTarget(slug: string): string {
  const rest = slug.replace(/^\d+-?/, '');
  const hits = TEAM_TOKENS.filter(({ tok }) => rest === tok || rest.startsWith(`${tok}-`) || rest.endsWith(`-${tok}`) || rest.includes(`-${tok}-`));
  const sports = new Set(hits.map((h) => h.t.sp));
  if (hits.length && sports.size === 1) {
    const first = hits.find(({ tok }) => rest.startsWith(`${tok}-`) || rest === tok) ?? hits[0];
    const sport = SPORT_BY_ID.get(first.t.sp);
    if (sport) return teamPath(sport.slug, first.t.slug);
  }
  return '/teraz-nazivo/';
}
