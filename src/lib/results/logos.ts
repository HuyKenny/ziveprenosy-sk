import type { Db } from './db';

/** Sports whose crests the logo route can serve (path segment of /logo/<sport>/<id>.png). */
const LOGO_SPORT: Record<number, string> = { 16: 'football', 23: 'hockey', 7: 'basketball', 47: 'volleyball', 20: 'handball' };
const TTL = 3600_000;
let cache: { at: number; map: Promise<Map<string, string>> } | undefined;

/**
 * Crest ids of the teams sportstreamy's results sync has linked (team_link), keyed by sport + the team name exactly
 * as the Czech feed writes it — the KV feed has no team ids, so lists match by name. One query per isolate per hour.
 */
function load(db: Db): Promise<Map<string, string>> {
  return db
    .prepare('SELECT DISTINCT tl.tip_name AS name, tl.af_id AS id, m.sport AS sport FROM team_link tl JOIN matches m ON m.home_ext = tl.tip_id OR m.away_ext = tl.tip_id')
    .all<{ name: string; id: string; sport: number }>()
    .then((r) => new Map(r.results.filter((x) => x.name && x.id).map((x) => [`${x.sport}|${x.name}`, `/logo/${LOGO_SPORT[x.sport] ?? 'football'}/${x.id}.png`])))
    .catch(() => new Map());
}

export function logoMap(db: Db | null, now = Date.now()): Promise<Map<string, string>> {
  if (!db) return Promise.resolve(new Map());
  if (!cache || now - cache.at > TTL) cache = { at: now, map: load(db) };
  return cache.map;
}

/** Crest URL for a team in a sport, or null. */
export const crestOf = (map: Map<string, string>, sp: number, name: string) => (LOGO_SPORT[sp] ? map.get(`${sp}|${name}`) ?? null : null);
