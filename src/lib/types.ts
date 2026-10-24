import type { ResultsEnv } from './results/config';

/** Match record as sportstreamy.cz's cron stores it in the shared KV (Czech Tipsport feed). Times are epoch ms. */
export interface Match {
  id: number;
  h: string; // home participant (or whole event name)
  a: string; // away participant, '' for single-entity events
  sp: number; // idSuperSport
  lg: string; // competition name (Czech)
  lid: number; // competition id
  st: number; // start, epoch ms
  stream: boolean; // video available on Tipsport
  path: string; // Tipsport matchUrl path (tipsport.cz)
  live: boolean; // Tipsport says it is in play (verify with st <= now)
  sc?: string; // "2:1" when live
  ti?: string; // minute / period text when live
  /** Czech odds — never shown here (Slovak odds differ). */
  o?: unknown;
}

export interface Snapshot<T> {
  at: number;
  items: T[];
}

export interface Env extends ResultsEnv {
  /** sportstreamy.cz's KV namespace (shared binding). READ ONLY — written by sportstreamy's cron. */
  DATA: KVNamespace;
  ASSETS: Fetcher;
  CLICKS?: AnalyticsEngineDataset;
  TIPSPORT_TV_URL: string;
  TIPSPORT_REG_URL: string;
}
