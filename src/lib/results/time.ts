import { dayKey } from '../text';

const TZ = 'Europe/Bratislava';
const parts = new Intl.DateTimeFormat('en-US', { timeZone: TZ, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });

/** Bratislava's UTC offset (ms) at a given instant: +1 h in winter, +2 h in summer. */
function offsetAt(ms: number): number {
  const p = Object.fromEntries(parts.formatToParts(ms).map((x) => [x.type, x.value]));
  const asUtc = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
  return asUtc - Math.floor(ms / 1000) * 1000;
}

const nextKey = (key: string) => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + 1)).toISOString().slice(0, 10);
};

/** UTC instant of local midnight in Bratislava for YYYY-MM-DD. */
export function localMidnight(key: string): number {
  const [y, m, d] = key.split('-').map(Number);
  const utc = Date.UTC(y, m - 1, d);
  return utc - offsetAt(utc - offsetAt(utc));
}

/** [start, end) of a Bratislava calendar day in UTC ms — 23 or 25 hours long on DST change days. */
export const localDay = (key: string): [number, number] => [localMidnight(key), localMidnight(nextKey(key))];

export const isDayKey = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && dayKey(localMidnight(s) + 3600_000) === s;

