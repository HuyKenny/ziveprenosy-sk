import type { Env } from './types';

/**
 * Tipsport.sk partner links (Kenny's account from spiny.sk, pid 12487 / sid 17272) until Tipsport SK approves its
 * own API for this site. No per-match deeplinks yet: the match paths in the shared feed belong to tipsport.cz.
 */
export function target(env: Env, book: 'tipsport' | 'registracia'): string {
  return book === 'registracia' ? env.TIPSPORT_REG_URL : env.TIPSPORT_TV_URL;
}
