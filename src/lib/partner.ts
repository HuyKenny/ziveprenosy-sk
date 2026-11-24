import type { Env } from './types';

/** Tipsport.sk partner links (pid 12487 / sid 17272, Kenny's account from spiny.sk) from wrangler.jsonc vars. */
export function target(env: Env, book: 'tipsport' | 'registracia'): string {
  return book === 'registracia' ? env.TIPSPORT_REG_URL : env.TIPSPORT_TV_URL;
}

/**
 * Deeplink to one match on tipsport.sk with the tracking parameters of the TV link (pid/sid/bid/tid), the same method
 * sportstreamy.cz uses on tipsport.cz. `path` is the matchUrl of our own Tipsport.sk feed (since 24. 11. 2026);
 * anything that does not look like a tipsport.sk match path falls back to the plain TV link.
 */
export function deeplink(env: Env, path: string): string {
  if (!/^\/(live|kurzy)\/zapas\/[a-z0-9-]+\/\d+$/.test(path)) return env.TIPSPORT_TV_URL;
  const from = new URL(env.TIPSPORT_TV_URL);
  const u = new URL('https://www.tipsport.sk' + path);
  for (const k of ['pid', 'sid', 'bid', 'tid']) {
    const v = from.searchParams.get(k);
    if (v) u.searchParams.set(k, v);
  }
  return u.toString();
}
