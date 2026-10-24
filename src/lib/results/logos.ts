import type { Db } from './db';
import manifest from '../../data/logos.json';

/** Sports whose crests exist (path segment of /logo/<sport>/…). */
const LOGO_SPORT: Record<number, string> = { 16: 'football', 23: 'hockey', 7: 'basketball', 47: 'volleyball', 20: 'handball' };
const TTL = 3600_000;
let cache: { at: number; map: Promise<Map<string, string>> } | undefined;
const HAVE = new Set(Object.entries((manifest as { have: Record<string, string[]> }).have).flatMap(([sp, ids]) => ids.map((id) => `${sp}|${id}`)));
const NONE = new Set(Object.entries((manifest as { none: Record<string, string[]> }).none).flatMap(([sp, ids]) => ids.map((id) => `${sp}|${id}`)));

/**
 * Crest ids of the teams sportstreamy's results sync has linked (team_link), keyed by sport + the team name exactly
 * as the Czech feed writes it — the KV feed has no team ids, so lists match by name. One query per isolate per hour.
 */
function load(db: Db): Promise<Map<string, string>> {
  return db
    .prepare('SELECT DISTINCT tl.tip_name AS name, tl.af_id AS id, m.sport AS sport FROM team_link tl JOIN matches m ON m.home_ext = tl.tip_id OR m.away_ext = tl.tip_id')
    .all<{ name: string; id: string; sport: number }>()
    .then((r) => new Map(r.results.filter((x) => x.name && x.id).map((x) => [`${x.sport}|${x.name}`, x.id])))
    .catch(() => new Map());
}

export function logoMap(db: Db | null, now = Date.now()): Promise<Map<string, string>> {
  if (!db) return Promise.resolve(new Map());
  if (!cache || now - cache.at > TTL) cache = { at: now, map: load(db) };
  return cache.map;
}

export interface CrestSrc { src: string; srcset?: string }

/**
 * Crest for a team: the small static WebP (scripts/logos.mjs) when we have it, the proxied provider PNG for a team
 * linked since the last run, null when there is none (initials).
 */
export function crestOf(map: Map<string, string>, sp: number, name: string, size = 22): CrestSrc | null {
  const s = LOGO_SPORT[sp];
  const id = s ? map.get(`${sp}|${name}`) : undefined;
  if (!s || !id || NONE.has(`${sp}|${id}`)) return null;
  if (HAVE.has(`${sp}|${id}`)) {
    const small = `/logo/${s}/${id}-64.webp`;
    const big = `/logo/${s}/${id}-128.webp`;
    return size > 32 ? { src: big } : { src: small, srcset: `${small} 1x, ${big} 2x` };
  }
  return { src: `/logo/${s}/${id}.png` };
}
