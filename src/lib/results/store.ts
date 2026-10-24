import type { Db } from './db';
import { FINAL } from './status';

/**
 * Read-only view of the sportstreamy.cz results database (D1 `sportstreamy-results`, shared binding).
 * This site never writes to it: the sync runs on sportstreamy's cron.
 */
export interface ResultRow {
  id: number;
  provider: string;
  sport: number;
  ext_id: string;
  comp: string;
  lg: string;
  season: string | null;
  home: string;
  away: string;
  start_utc: number;
  status: string;
  status_raw: string | null;
  minute_raw: string | null;
  sh: number | null;
  sa: number | null;
  periods: string | null;
  pen_h: number | null;
  pen_a: number | null;
  stream: number;
  path: string;
  slug: string;
  checked_at: number;
  final_at: number | null;
}

const q = (list: readonly string[]) => list.map((s) => `'${s}'`).join(',');
const FIN = q(FINAL);

const PUBLIC = `provider = 'tipsport' AND review = 0`;
const inList = (n: number) => Array(n).fill('?').join(',');

/** One query for a whole day / sport / set of competitions (index matches_sport_start). */
export async function rowsBetween(db: Db, from: number, to: number, comps: string[], sport?: number): Promise<ResultRow[]> {
  if (!comps.length) return [];
  const r = await db
    .prepare(`SELECT * FROM matches WHERE ${PUBLIC} AND start_utc >= ? AND start_utc < ? AND comp IN (${inList(comps.length)})${sport ? ' AND sport = ?' : ''} ORDER BY start_utc, id`)
    .bind(from, to, ...comps, ...(sport ? [sport] : []))
    .all<ResultRow>();
  return r.results;
}

export async function rowByExt(db: Db, extId: string | number): Promise<ResultRow | null> {
  return db.prepare(`SELECT * FROM matches WHERE ${PUBLIC} AND ext_id = ? LIMIT 1`).bind(String(extId)).first<ResultRow>();
}

/** Latest finished (or unverified) matches of a competition, newest first. */
export async function recentOfComp(db: Db, comp: string, now: number, limit = 10): Promise<ResultRow[]> {
  const r = await db
    .prepare(`SELECT * FROM matches WHERE ${PUBLIC} AND comp = ? AND start_utc < ? AND status IN (${q([...FINAL, 'unconfirmed', 'cancelled', 'interrupted'])}) ORDER BY start_utc DESC LIMIT ?`)
    .bind(comp, now, limit)
    .all<ResultRow>();
  return r.results;
}

/** Finished matches for the sitemap; lastmod = when the result became final (or was corrected). */
export async function finalsSince(db: Db, since: number, comps: string[]): Promise<Pick<ResultRow, 'ext_id' | 'home' | 'away' | 'final_at'>[]> {
  if (!comps.length) return [];
  const r = await db
    .prepare(`SELECT ext_id, home, away, final_at FROM matches WHERE ${PUBLIC} AND status IN (${FIN}) AND start_utc >= ? AND comp IN (${inList(comps.length)}) ORDER BY start_utc DESC LIMIT 5000`)
    .bind(since, ...comps)
    .all<Pick<ResultRow, 'ext_id' | 'home' | 'away' | 'final_at'>>();
  return r.results;
}
