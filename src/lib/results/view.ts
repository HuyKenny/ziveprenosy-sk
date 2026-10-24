import type { Match } from '../types';
import type { ResultRow } from './store';
import { isFinal, isInPlay } from './status';
import { competitionById } from '../competitions';
import { matchPath } from '../url';
import type { Detail, Meeting } from './afdata';
import { lgOf } from '../names';

/** Same URL as a live match page, so a match keeps one address before, during and after the game. */
export const resultPath = (r: ResultRow) => matchPath(asMatch(r));

/** "2:1" when both sides are known, otherwise null — a missing score is never shown as 0:0. */
export const scoreText = (r: Pick<ResultRow, 'sh' | 'sa'>) => (r.sh != null && r.sa != null ? `${r.sh}:${r.sa}` : null);

function periodsOf(r: Pick<ResultRow, 'periods'>): [number, number][] {
  try {
    const p = JSON.parse(r.periods ?? 'null');
    return Array.isArray(p) ? p : [];
  } catch {
    return [];
  }
}

const PERIOD: Record<number, string> = { 23: 'tretiny', 7: 'štvrtiny', 47: 'sety', 43: 'sety' };

/** "1. polčas 1:0" / "tretiny 1:0, 0:2, 1:1" (+ predĺženie, nájazdy/penalty) from what the source published. */
export function detailText(r: ResultRow): string {
  const p = periodsOf(r);
  const pair = (x: [number, number]) => `${x[0]}:${x[1]}`;
  const out: string[] = [];
  if (r.sport === 16 || r.sport === 20) {
    if (p[0]) out.push(`1. polčas ${pair(p[0])}`);
    if ((r.status === 'aet' || r.status === 'pen') && p.length > 2) out.push(`predĺženie ${p.slice(2).map(pair).join(', ')}`);
  } else if (p.length) {
    const regular = r.sport === 23 ? 3 : r.sport === 7 ? 4 : p.length;
    out.push(`${PERIOD[r.sport] ?? 'časti'} ${p.slice(0, regular).map(pair).join(', ')}`);
    if (p.length > regular) out.push(`predĺženie ${p.slice(regular).map(pair).join(', ')}`);
  }
  if (r.pen_h != null && r.pen_a != null) out.push(`${r.sport === 23 ? 'nájazdy' : 'penalty'} ${r.pen_h}:${r.pen_a}`);
  return out.join(' · ');
}

/** In play, but not confirmed by the source for longer than the threshold. */
export const isStale = (r: ResultRow, now: number, staleMs: number) => isInPlay(r.status) && now - r.checked_at > staleMs;

/** Stored row in the shape of a feed match. */
export const asMatch = (r: ResultRow): Match => ({
  id: Number(r.ext_id),
  h: r.home,
  a: r.away,
  sp: r.sport,
  lg: lgOf(r.lg, r.home, r.away),
  lid: 0,
  st: r.start_utc,
  stream: !!r.stream,
  path: r.path,
  live: isInPlay(r.status),
  ...(scoreText(r) && !isFinal(r.status) ? { sc: scoreText(r)! } : {}),
  ...(r.minute_raw ? { ti: r.minute_raw } : {}),
});

export const compName = (id: string) => competitionById(id)?.name ?? id;

export const STAT_LABELS: Record<string, string> = {
  'Ball Possession': 'Držanie lopty', 'Total Shots': 'Strely', 'Shots on Goal': 'Strely na bránku', 'Corner Kicks': 'Rohy',
  Fouls: 'Fauly', Offsides: 'Ofsajdy', 'Yellow Cards': 'Žlté karty', 'Red Cards': 'Červené karty',
  'Goalkeeper Saves': 'Zákroky brankára', expected_goals: 'Očakávané góly (xG)',
};
export const EVENT_LABELS: Record<Detail['events'][number]['kind'], string> = {
  goal: 'Gól', own: 'Vlastný gól', pen: 'Gól z penalty', missed: 'Nepremenená penalta', red: 'Červená karta', yellowred: 'Druhá žltá a červená', yellow: 'Žltá karta', sub: 'Striedanie', var: 'VAR', pim: 'Vylúčenie',
};
/** VAR decisions as the source words them → Slovak. */
export const VAR_LABELS: Record<string, string> = {
  'Goal cancelled': 'gól neuznaný', 'Goal Disallowed - offside': 'gól neuznaný – ofsajd', 'Penalty confirmed': 'penalta potvrdená',
  'Penalty cancelled': 'penalta zrušená', 'Card upgrade': 'karta sprísnená', 'Goal confirmed': 'gól potvrdený',
};
/** Hockey: kind of goal and infraction → Slovak (unknown words are left out). */
export const HOCKEY_NOTES: Record<string, string> = {
  'Power-play': 'v presilovke', 'Short-handed': 'v oslabení', 'Empty-net': 'do prázdnej bránky', 'Penalty shot': 'trestné strieľanie',
  Hooking: 'hákovanie', Holding: 'držanie', 'Holding the stick': 'držanie hokejky', Slashing: 'sekanie', Tripping: 'podrazenie',
  Roughing: 'hrubosť', Interference: 'bránenie v hre', 'High-sticking': 'vysoká hokejka', 'Cross-checking': 'krosček',
  Fighting: 'bitka', Boarding: 'narazenie na mantinel', Charging: 'napadnutie', Elbowing: 'lakeť', 'Delay of game': 'zdržiavanie hry',
  Unsportsmanlike: 'nešportové správanie', 'Unsportsmanlike conduct': 'nešportové správanie',
  Misconduct: 'osobný trest', 'Game misconduct': 'osobný trest do konca zápasu', Kneeing: 'koleno', Diving: 'simulovanie', Spearing: 'pichnutie hokejkou',
};

/** Stored details, or null when there are none (never an empty shell). */
export function detailOf(r: Pick<ResultRow, 'stats'>): Detail | null {
  try {
    const d = JSON.parse(r.stats ?? 'null');
    return d && !d.none && (d.events?.length || d.stats?.length || d.lineups?.length) ? (d as Detail) : null;
  } catch {
    return null;
  }
}

export function meetingsOf(r: Pick<ResultRow, 'h2h'>): Meeting[] {
  try {
    const m = JSON.parse(r.h2h ?? 'null');
    return Array.isArray(m) ? m : [];
  } catch {
    return [];
  }
}

/** Numeric value of a statistic ("49%" → 49), null when missing. */
export const statNum = (v: string | null) => (v == null ? null : Number.parseFloat(v.replace('%', '')) || 0);

/** Goals and red cards per side for the scorecard (own goals already carry the scoring side). */
export function scorers(d: Detail | null): { h: Detail['events']; a: Detail['events']; redH: number; redA: number } {
  // Events without a player name would read as a bare minute ("7'").
  const ev = (d?.events ?? []).filter((e) => e.player?.trim());
  const goal = (e: Detail['events'][number]) => e.kind === 'goal' || e.kind === 'pen' || e.kind === 'own';
  const red = (e: Detail['events'][number]) => e.kind === 'red' || e.kind === 'yellowred';
  return { h: ev.filter((e) => goal(e) && e.side === 'h'), a: ev.filter((e) => goal(e) && e.side === 'a'), redH: ev.filter((e) => red(e) && e.side === 'h').length, redA: ev.filter((e) => red(e) && e.side === 'a').length };
}
