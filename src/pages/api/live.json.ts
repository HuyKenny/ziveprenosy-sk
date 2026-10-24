import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import type { Env } from '../../lib/types';
import { view } from '../../lib/matches';
import { skClock, skClockShort } from '../../lib/names';

export const prerender = false;

/** id → [score, short clock for rows, full clock for the match page]. */
export const GET: APIRoute = async () => {
  const v = await view(env as unknown as Env);
  const out: Record<number, [string, string, string]> = {};
  for (const m of v.live) out[m.id] = [m.sc ?? '', skClockShort(m.ti ?? ''), skClock(m.ti ?? '')];
  return new Response(JSON.stringify(out), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, s-maxage=20', 'X-Robots-Tag': 'noindex' } });
};
