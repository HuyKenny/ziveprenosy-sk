import type { Env, Match, Snapshot } from './types';
import { SPORT_BY_ID } from './sports';
import { competitionOf } from './competitions';

/**
 * Tipsport.sk Partner API (this site's own account, approved 24. 11. 2026). Host partners.tipsport.sk, login
 * "Prihlásenie partnera" (username + password + productId) → session token. Every later call needs the token
 * (Authorization: Bearer) AND the JSESSIONID cookie of the server that issued it.
 * Runs only in the GitHub Actions live job (sportstreamy repo, scripts/static/run.sh) through the scheduled handler.
 */
const HOST = 'partners.tipsport.sk';
const UA = 'Mozilla/5.0 (compatible; ZivePrenosy/1.0; +https://ziveprenosy.sk)';

interface Session { token: string; cookie: string }

export async function login(user: string, pass: string, productId: string): Promise<Session> {
  const res = await fetch(`https://${HOST}/rest/external/common/v2/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'User-Agent': UA },
    body: JSON.stringify({ username: user, password: pass, productId: Number(productId) }),
  });
  if (!res.ok) throw new Error(`${HOST} login ${res.status}`);
  const j = (await res.json()) as { sessionToken?: string };
  const cookie = /JSESSIONID=[^;]+/.exec(res.headers.get('set-cookie') ?? '')?.[0];
  if (!j.sessionToken || !cookie) throw new Error(`${HOST} login: no token/session`);
  return { token: j.sessionToken, cookie };
}

async function get<T>(s: Session, path: string): Promise<T> {
  const res = await fetch(`https://${HOST}${path}`, {
    headers: { Authorization: `Bearer ${s.token}`, Cookie: s.cookie, 'User-Agent': UA, Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`${HOST}${path.split('?')[0]} ${res.status}`);
  return (await res.json()) as T;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Raw = Record<string, any>;

const iso = (ms: number) => new Date(ms).toISOString().slice(0, 19);

const liveMatches = (s: Session) => get<{ matches: Raw[] }>(s, '/rest/external/offer/v2/live/matches').then((r) => r.matches ?? []);
const upcomingMatches = (s: Session, days = 7) => {
  const from = Date.now() - 3 * 3600_000;
  return get<{ matches: Raw[] }>(s, `/rest/external/offer/v1/matches?fromDate=${iso(from)}&toDate=${iso(from + days * 86_400_000)}`).then((r) => r.matches ?? []);
};

/** Same shape as sportstreamy's records (ids are shared across the Tipsport platform, so results still join by id). */
export function toMatch(raw: Raw): Match | null {
  if (!raw?.id || raw.ended) return null;
  let h = String(raw.homeParticipant ?? '').trim();
  const a = String(raw.visitingParticipant ?? '').trim();
  if (!h && !a) h = String(raw.nameFull ?? raw.name ?? '').trim(); // outright / single entity: no fake "A vs B"
  if (!h) return null;
  const fix = (s: string) => s.replace(/\sŽ$/, ' (ž)'); // women's sides: trailing " Ž" → "(ž)" as on the rest of the site
  const st = Number(raw.dateStart);
  if (!st) return null;
  const m: Match = {
    id: raw.id,
    h: fix(h),
    a: fix(a),
    sp: raw.idSuperSport ?? 0,
    lg: String(raw.nameCompetition ?? ''),
    lid: raw.idCompetition ?? 0,
    st,
    stream: !!raw.stream,
    path: String(raw.matchUrl ?? ''),
    live: String(raw.matchType ?? '').toUpperCase().includes('LIVE'),
  };
  if (m.live) {
    if (raw.home !== undefined && raw.away !== undefined && raw.home !== '' && raw.away !== '') m.sc = `${raw.home}:${raw.away}`;
    if (raw.statusOffer) m.ti = String(raw.statusOffer);
  }
  return m;
}

/** Season-long markets ("… celkovo", "po 30. kole", top scorer…) are not matches. */
const OUTRIGHT = /celkov|dlhodob|víťaz skupiny|víťaz súťaže|po \d+\.\s?kol|najlepší strelec|zostup|postup/i;

/** On the site: anything with video, plus head-to-head matches of curated competitions (live stats only). */
const keep = (m: Match | null): m is Match =>
  !!m && SPORT_BY_ID.has(m.sp) && !OUTRIGHT.test(m.h) && (m.stream || (!!m.a && !!competitionOf(m.sp, m.lg)));

export const SK_LIVE = 'sk:live';
export const SK_PRE = 'sk:pre';

const put = (env: Env, key: string, items: Match[]) => env.DATA.put(key, JSON.stringify({ at: Date.now(), items } satisfies Snapshot<Match>));

/** One live-job run: live + next 7 days. An empty answer is far more likely an outage: the previous snapshot stays. */
export async function refresh(env: Env): Promise<{ live: number; pre: number }> {
  if (!env.TIPSPORT_SK_USER || !env.TIPSPORT_SK_PASS) throw new Error('TIPSPORT_SK_* not set');
  const s = await login(env.TIPSPORT_SK_USER, env.TIPSPORT_SK_PASS, env.TIPSPORT_SK_PRODUCT_ID ?? '3');
  const [l, p] = await Promise.all([liveMatches(s), upcomingMatches(s)]);
  const live = l.map(toMatch).filter(keep);
  const pre = p.map(toMatch).filter(keep);
  if (live.length) await put(env, SK_LIVE, live);
  if (pre.length) await put(env, SK_PRE, pre);
  return { live: live.length, pre: pre.length };
}
