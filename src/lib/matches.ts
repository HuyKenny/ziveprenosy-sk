import type { Env, Match, Snapshot } from './types';
import { dayKey, addDays } from './text';
import { SPORTS } from './sports';
import { competitionOf } from './competitions';
import { lgOf } from './names';
import { SK_LIVE, SK_PRE } from './tipsport';

export interface View {
  /** In play now: start has passed and the live feed still has it. */
  live: Match[];
  /** Not started yet, sorted by start. */
  upcoming: Match[];
  /** Started within the last 3 h but gone from the live feed. */
  recent: Match[];
  at: number;
}

const ORDER = new Map(SPORTS.map((s, i) => [s.id, s.main ? i : 100 + i]));
/** Lower = shown first: main sports in menu order, then the rest. */
export const rank = (m: Match) => ORDER.get(m.sp) ?? 999;

/** Low-interest feeds that would otherwise fill the lists: ITF/UTR/Challenger tennis, Setka-style leagues, virtual sports. */
const LOW = /\bITF\b|\bUTR\b|Challenger|challenger|Setka|eSports|e-sport|Cyber|Battle|Liga Pro|Virtu|simul|\(\d+x\d+ min\)/i;
/** Slovak teams and national side in any competition (feed names are Czech: "Slovensko", "Slovan Bratislava"…). */
const SK_TEAM = /^Slovensko\b|Slovan Bratislava|Žilina|Trnava|Ružomberok|Košice|Podbrezová|Michalovce|Dunajská Streda|Zvolen|Nitra|Banská Bystrica|Poprad|Trenčín|Prešov|Skalica|Komárno|Liptovský Mikuláš|Spišská Nová Ves|Detva/;

export const isSlovak = (m: Match) => !!competitionOf(m.sp, m.lg)?.sk || /^Slovensk/.test(m.lg) || SK_TEAM.test(m.h) || SK_TEAM.test(m.a);

/**
 * 0 = Slovak (competition or team), 1 = curated top competition, 2 = main sport, 3 = the rest.
 * Lists sort by tier first, so Slovak fans see Niké liga and Tipsport liga before ITF tennis.
 */
export const tier = (m: Match) => (isSlovak(m) ? 0 : competitionOf(m.sp, m.lg)?.top ? 1 : LOW.test(m.lg) ? 3 : rank(m) < 100 ? 2 : 3);

export const featured = (items: Match[]) => [...items].sort((a, b) => tier(a) - tier(b) || a.st - b.st || a.id - b.id);

let cache: { at: number; v: View } | undefined;

/** Merge live + prematch snapshots. Tipsport flags matches "live" hours early, so live also requires start <= now. */
export async function view(env: Env, now = Date.now()): Promise<View> {
  if (cache && now - cache.at < 15_000) return cache.v;
  const get = (k: string) => env.DATA.get<Snapshot<Match>>(k, 'json');
  // Own Tipsport.sk feed (Slovak names, tipsport.sk paths); the Czech feed of sportstreamy only when ours is missing or stale.
  const [sl, sp] = await Promise.all([get(SK_LIVE), get(SK_PRE)]);
  const fresh = (s: Snapshot<Match> | null) => !!s && now - s.at < 2 * 3600_000;
  const [l, p] = fresh(sl) && fresh(sp) ? [sl, sp] : await Promise.all([get('live'), get('pre')]);
  const liveFeed = new Map((l?.items ?? []).map((m) => [m.id, m]));
  const all = new Map<number, Match>();
  for (const m of p?.items ?? []) all.set(m.id, { ...m, lg: lgOf(m.lg, m.h, m.a) });
  for (const m of liveFeed.values()) all.set(m.id, { ...all.get(m.id), ...m, lg: lgOf(m.lg, m.h, m.a) });
  const live: Match[] = [];
  const upcoming: Match[] = [];
  const recent: Match[] = [];
  for (const m of all.values()) {
    if (m.st > now) upcoming.push(m);
    else if (liveFeed.has(m.id)) live.push(m);
    else if (now - m.st < 3 * 3600_000) recent.push(m);
  }
  const bySt = (a: Match, b: Match) => a.st - b.st || a.id - b.id;
  upcoming.sort(bySt);
  recent.sort((a, b) => b.st - a.st);
  live.sort((a, b) => tier(a) - tier(b) || Number(b.stream) - Number(a.stream) || rank(a) - rank(b) || bySt(a, b));
  const v = { live, upcoming, recent, at: Math.max(l?.at ?? 0, p?.at ?? 0) };
  cache = { at: now, v };
  return v;
}

export const matchesOn = (v: View, key: string) => v.upcoming.filter((m) => dayKey(m.st) === key);
export { dayKey, addDays };

/** Round-robin across sports, so a short list is not five tennis matches in a row. */
export function mixSports(items: Match[], n: number): Match[] {
  const by = new Map<number, Match[]>();
  for (const m of items) by.set(m.sp, [...(by.get(m.sp) ?? []), m]);
  const queues = [...by.values()];
  const out: Match[] = [];
  while (out.length < n && queues.some((q) => q.length)) for (const q of queues) { const m = q.shift(); if (m && out.length < n) out.push(m); }
  return out;
}
