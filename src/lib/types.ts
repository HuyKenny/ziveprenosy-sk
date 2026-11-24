import type { ResultsEnv } from './results/config';

/** Match record (same shape as sportstreamy.cz's). Since 24. 11. 2026 from our own Tipsport.sk feed (`sk:live` / `sk:pre`),
 *  the Czech feed (`live` / `pre`) is only the fallback. Times are epoch ms. */
export interface Match {
  id: number;
  h: string; // home participant (or whole event name)
  a: string; // away participant, '' for single-entity events
  sp: number; // idSuperSport
  lg: string; // competition name (Slovak from the SK feed, Czech in the fallback)
  lid: number; // competition id
  st: number; // start, epoch ms
  stream: boolean; // video available on Tipsport
  path: string; // Tipsport matchUrl path (tipsport.sk; tipsport.cz in the fallback)
  live: boolean; // Tipsport says it is in play (verify with st <= now)
  sc?: string; // "2:1" when live
  ti?: string; // minute / period text when live
  /** Czech odds in the fallback feed — never shown here. */
  o?: unknown;
  /** Tipsport.sk 1 / X / 2 of the main market (own SK feed only; X is null without a draw). Shown on the site. */
  k?: [number, number | null, number];
}

export interface Snapshot<T> {
  at: number;
  items: T[];
}

export interface Env extends ResultsEnv {
  /** Shared KV of the live job: `sk:live` / `sk:pre` written by our scheduled handler (lib/tipsport.ts), `live` / `pre` by sportstreamy. */
  DATA: KVNamespace;
  /** Tipsport.sk Partner API login (secrets of the live job, never in the repo). */
  TIPSPORT_SK_USER?: string;
  TIPSPORT_SK_PASS?: string;
  TIPSPORT_SK_PRODUCT_ID?: string;
  ASSETS: Fetcher;
  CLICKS?: AnalyticsEngineDataset;
  TIPSPORT_TV_URL: string;
  TIPSPORT_REG_URL: string;
}
