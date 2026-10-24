import type { Match } from '../types';
import type { ResultRow } from './store';
import { isFinal, isInPlay } from './status';
import { competitionById } from '../competitions';
import { matchPath } from '../url';

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
  lg: r.lg,
  lid: 0,
  st: r.start_utc,
  stream: !!r.stream,
  path: r.path,
  live: isInPlay(r.status),
  ...(scoreText(r) && !isFinal(r.status) ? { sc: scoreText(r)! } : {}),
  ...(r.minute_raw ? { ti: r.minute_raw } : {}),
});

export const compName = (id: string) => competitionById(id)?.name ?? id;
