import type { Match } from './types';

/** Odds as people read them on a Slovak betting slip: "2,38". */
export const fmtOdd = (x: number) => x.toFixed(2).replace('.', ',');

/** Implied probabilities from decimal odds, normalised to 100 % (the bookmaker's margin removed). */
export function impliedProb(k: (number | null)[]): number[] {
  const inv = k.map((x) => (x ? 1 / x : 0));
  const s = inv.reduce((a, b) => a + b, 0) || 1;
  return inv.map((x) => Math.round((x / s) * 100));
}

/** Odds worth showing: only from our own Tipsport.sk feed (`k`), never the Czech fallback (`o`), and only before the start. */
export const oddsOf = (m: Match, now: number) => (m.k && m.st > now ? m.k : null);
