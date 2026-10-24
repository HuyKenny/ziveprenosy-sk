import type { Db } from './db';

/** Results are read from sportstreamy's D1 (shared, read-only). Vars in wrangler.jsonc. */
export interface ResultsEnv {
  RESULTS?: unknown; // D1 binding
  RESULTS_ENABLED?: string;
  RESULTS_COMPETITIONS?: string; // comma-separated competition ids (competitions.ts `id`)
  RESULTS_STALE_MIN?: string;
}

export interface ResultsConfig { enabled: boolean; comps: string[]; staleMs: number }

const on = (v?: string) => /^(on|1|true|yes)$/i.test(v ?? '');

export function resultsConfig(env: ResultsEnv): ResultsConfig {
  return {
    enabled: on(env.RESULTS_ENABLED) && !!env.RESULTS,
    comps: (env.RESULTS_COMPETITIONS ?? '').split(',').map((s) => s.trim()).filter(Boolean),
    staleMs: (Number(env.RESULTS_STALE_MIN) || 10) * 60_000,
  };
}

/** D1 for public pages, or null when results are off. */
export const resultsDb = (env: ResultsEnv): Db | null => (resultsConfig(env).enabled ? (env.RESULTS as Db) : null);
