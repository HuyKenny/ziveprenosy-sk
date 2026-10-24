const MAP: Record<string, string> = { ß: 'ss', ł: 'l', đ: 'd', ø: 'o', æ: 'ae', œ: 'oe' };

/** URL slug without diacritics. */
export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[ßłđøæœ]/g, (c) => MAP[c])
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70);
}

export const TZ = 'Europe/Bratislava';
const dayFmt = new Intl.DateTimeFormat('sv-SE', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' });
const timeFmt = new Intl.DateTimeFormat('sk-SK', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false });
const longFmt = new Intl.DateTimeFormat('sk-SK', { timeZone: TZ, weekday: 'long', day: 'numeric', month: 'long' });
const shortFmt = new Intl.DateTimeFormat('sk-SK', { timeZone: TZ, day: 'numeric', month: 'numeric' });
const wdFmt = new Intl.DateTimeFormat('sk-SK', { timeZone: TZ, weekday: 'short' });

/** YYYY-MM-DD in Slovak time. */
export const dayKey = (ms: number) => dayFmt.format(ms);
export const hhmm = (ms: number) => timeFmt.format(ms);
/** "sobota 24. októbra" */
export const longDay = (ms: number) => longFmt.format(ms);
/** "24. 10." */
export const shortDay = (ms: number) => shortFmt.format(ms);
/** "so" */
export const weekday = (ms: number) => wdFmt.format(ms);
export const addDays = (ms: number, n: number) => ms + n * 86_400_000;

/** "Dnes" / "Zajtra" / "pondelok 26. októbra". */
export function dayLabel(ms: number, now: number): string {
  const k = dayKey(ms);
  if (k === dayKey(now)) return 'Dnes';
  if (k === dayKey(addDays(now, 1))) return 'Zajtra';
  return longFmt.format(ms);
}

/** Slovak plural: 1 zápas, 2–4 zápasy, 5+ zápasov. */
export function plural(n: number, one: string, few: string, many: string): string {
  if (n === 1) return one;
  if (n >= 2 && n <= 4) return few;
  return many;
}
