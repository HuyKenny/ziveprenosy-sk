import type { Match } from './types';

/**
 * Team pages (/<sport>/tim/<slug>/): Slovak clubs of Niké liga and Tipsport liga plus the national teams. Only these
 * get a page — a registry, not every team in the feed, so there are no thin pages. `feed` is the name exactly as the
 * Czech feed and the results database write it (checked against both on 24. 10. 2026); women's sides ("(ž)") never match.
 */
/** `q` = how people search for the club ("hokej Prešov dnes online", Ahrefs SK 24. 11. 2026) → front of the page title. */
export interface Team { sp: number; slug: string; feed: string; name: string; comp?: string; national?: boolean; q?: string }

export const TEAMS: Team[] = [
  // Futbal – Niké liga 2026/27
  { sp: 16, slug: 'slovan-bratislava', feed: 'Slovan Bratislava', name: 'ŠK Slovan Bratislava', comp: 'nike-liga' },
  { sp: 16, slug: 'spartak-trnava', feed: 'Trnava', name: 'Spartak Trnava', comp: 'nike-liga' },
  { sp: 16, slug: 'zilina', feed: 'Žilina', name: 'MŠK Žilina', comp: 'nike-liga' },
  { sp: 16, slug: 'dac-dunajska-streda', feed: 'Dunajská Streda', name: 'FC DAC 1904 Dunajská Streda', comp: 'nike-liga' },
  { sp: 16, slug: 'fc-kosice', feed: 'FC Košice', name: 'FC Košice', comp: 'nike-liga' },
  { sp: 16, slug: 'podbrezova', feed: 'Podbrezová', name: 'Železiarne Podbrezová', comp: 'nike-liga' },
  { sp: 16, slug: 'ruzomberok', feed: 'Ružomberok', name: 'MFK Ružomberok', comp: 'nike-liga' },
  { sp: 16, slug: 'zemplin-michalovce', feed: 'Michalovce', name: 'Zemplín Michalovce', comp: 'nike-liga' },
  { sp: 16, slug: 'as-trencin', feed: 'Trenčín', name: 'AS Trenčín', comp: 'nike-liga' },
  { sp: 16, slug: 'skalica', feed: 'Skalica', name: 'MFK Skalica', comp: 'nike-liga' },
  { sp: 16, slug: 'komarno', feed: 'Komárno', name: 'KFC Komárno', comp: 'nike-liga' },
  { sp: 16, slug: 'dukla-banska-bystrica', feed: 'Banská Bystrica', name: 'Dukla Banská Bystrica', comp: 'nike-liga' },
  { sp: 16, slug: 'slovensko', feed: 'Slovensko', name: 'Slovensko', national: true },
  // Hokej – Tipsport liga 2026/27
  { sp: 23, slug: 'slovan-bratislava', feed: 'Slovan Bratislava', name: 'HC Slovan Bratislava', comp: 'slovenska-extraliga' , q: 'Hokej Slovan'},
  { sp: 23, slug: 'hk-nitra', feed: 'Nitra', name: 'HK Nitra', comp: 'slovenska-extraliga' , q: 'Hokej Nitra'},
  { sp: 23, slug: 'hc-kosice', feed: 'Košice', name: 'HC Košice', comp: 'slovenska-extraliga' , q: 'Hokej Košice'},
  { sp: 23, slug: 'zilina', feed: 'Žilina', name: 'Vlci Žilina', comp: 'slovenska-extraliga' , q: 'Hokej Žilina'},
  { sp: 23, slug: 'zvolen', feed: 'Zvolen', name: 'HKM Zvolen', comp: 'slovenska-extraliga' , q: 'Hokej Zvolen'},
  { sp: 23, slug: 'banska-bystrica', feed: 'Banská Bystrica', name: 'HC 05 Banská Bystrica', comp: 'slovenska-extraliga' , q: 'Hokej Banská Bystrica'},
  { sp: 23, slug: 'michalovce', feed: 'Michalovce', name: 'HK Dukla Michalovce', comp: 'slovenska-extraliga' , q: 'Hokej Michalovce'},
  { sp: 23, slug: 'spisska-nova-ves', feed: 'Spišská Nová Ves', name: 'HK Spišská Nová Ves', comp: 'slovenska-extraliga' , q: 'Hokej Spišská Nová Ves'},
  { sp: 23, slug: 'liptovsky-mikulas', feed: 'Liptovský Mikuláš', name: 'MHk 32 Liptovský Mikuláš', comp: 'slovenska-extraliga' , q: 'Hokej Liptovský Mikuláš'},
  { sp: 23, slug: 'presov', feed: 'Prešov', name: 'HC Prešov', comp: 'slovenska-extraliga' , q: 'Hokej Prešov'},
  { sp: 23, slug: 'dukla-trencin', feed: 'Trenčín', name: 'HK Dukla Trenčín', comp: 'slovenska-extraliga' , q: 'Hokej Trenčín'},
  { sp: 23, slug: 'hk-poprad', feed: 'HK Poprad', name: 'HK Poprad', comp: 'slovenska-extraliga' , q: 'Hokej Poprad'},
  { sp: 23, slug: 'slovensko', feed: 'Slovensko', name: 'Slovensko', national: true },
];

const BY_KEY = new Map(TEAMS.map((t) => [`${t.sp}|${t.slug}`, t]));
const BY_FEED = new Map(TEAMS.map((t) => [`${t.sp}|${t.feed}`, t]));
export const teamBySlug = (sp: number, slug: string) => BY_KEY.get(`${sp}|${slug}`);
/** The registered team behind a feed name (exact; "(ž)", "B", "U20" sides are different teams and do not match). */
export const teamOf = (sp: number, feedName: string) => BY_FEED.get(`${sp}|${feedName}`);
export const teamsOfComp = (id: string) => TEAMS.filter((t) => t.comp === id);
export const plays = (t: Team, m: Match) => m.sp === t.sp && (m.h === t.feed || m.a === t.feed);

/** Name for titles and text: the registered (official) name when known, otherwise the Slovak feed name. */
export function officialName(sp: number, feedName: string, fallback: string): string {
  return teamOf(sp, feedName)?.name ?? fallback;
}
