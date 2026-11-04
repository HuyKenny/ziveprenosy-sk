import type { Match } from './types';
import { matchPath, matchTitle, sportOf, home, away } from './url';
import { leagueName } from './competitions';
import { photoFor } from './photos';
import { officialName } from './teams';

export const SITE = 'https://ziveprenosy.sk';
export const BRAND = 'ŽivéPrenosy.sk';
const abs = (p: string) => (p.startsWith('http') ? p : SITE + p);

export interface Crumb { name: string; href?: string }

export const breadcrumbLd = (items: Crumb[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, ...(c.href ? { item: abs(c.href) } : {}) })),
});

export const faqLd = (items: { q: string; a: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
});

export const itemListLd = (items: Match[], name: string) => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name,
  numberOfItems: Math.min(items.length, 20),
  itemListElement: items.slice(0, 20).map((m, i) => ({ '@type': 'ListItem', position: i + 1, url: abs(matchPath(m)), name: matchTitle(m) })),
});

export const siteLd = () => [
  { '@context': 'https://schema.org', '@type': 'WebSite', '@id': `${SITE}/#web`, name: BRAND, url: `${SITE}/`, inLanguage: 'sk-SK', potentialAction: { '@type': 'SearchAction', target: `${SITE}/hladat/?q={q}`, 'query-input': 'required name=q' } },
  { '@context': 'https://schema.org', '@type': 'Organization', '@id': `${SITE}/#org`, name: BRAND, url: `${SITE}/`, logo: `${SITE}/icon-512.png`, founder: { '@type': 'Person', '@id': 'https://huy.cz/#kenny', name: 'Ha Duy Huy', alternateName: 'Kenny', url: 'https://huy.cz/', jobTitle: 'SEO konzultant' } },
];

export function sportsEventLd(m: Match, status?: string, result?: string) {
  const s = sportOf(m);
  const H = officialName(m.sp, m.h, home(m));
  const A = m.a ? officialName(m.sp, m.a, away(m)) : '';
  const name = A ? `${H} – ${A}` : H;
  const lg = leagueName(m.sp, m.lg);
  const url = abs(matchPath(m));
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name,
    description: result ? `${name} ${result} – ${lg}. Výsledok zápasu.` : `${name} – ${s?.name ?? 'šport'}, ${lg}. Živý prenos a skóre.`,
    url,
    startDate: new Date(m.st).toISOString(),
    eventStatus: `https://schema.org/${status === 'postponed' ? 'EventPostponed' : status === 'cancelled' ? 'EventCancelled' : 'EventScheduled'}`,
    eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
    location: { '@type': 'VirtualLocation', url },
    sport: s?.name,
    image: [abs(`/img/sport/${photoFor(s?.slug).slug}-800.jpg`)],
    organizer: { '@type': 'Organization', name: lg },
    superEvent: { '@type': 'SportsEvent', name: lg },
    ...(m.a ? { homeTeam: { '@type': 'SportsTeam', name: H }, awayTeam: { '@type': 'SportsTeam', name: A }, competitor: [{ '@type': 'SportsTeam', name: H }, { '@type': 'SportsTeam', name: A }] } : {}),
  };
}

/** Trim to a length without cutting a word in half. */
export function clip(s: string, n: number): string {
  if (s.length <= n) return s;
  const cut = s.slice(0, n - 1);
  return cut.slice(0, cut.lastIndexOf(' ')) + '…';
}
