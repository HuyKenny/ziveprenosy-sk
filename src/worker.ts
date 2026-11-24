import { handle } from '@astrojs/cloudflare/handler';
import { SECURITY_HEADERS } from './lib/security';
import { legacyTarget } from './lib/redirects';
import { refresh } from './lib/tipsport';
import type { Env } from './lib/types';

/** Paths that are never cached: tracked redirects, live score feed, Cloudflare internals. */
const NO_CACHE = /^\/(go|cdn-cgi)\/|^\/api\/live\.json$/;
/** Query parameters our pages use: sport filter, results state, search query. */
const KEEP = ['sport', 'stav', 'q'];

/** Security headers on every SSR response, and an explicit charset on HTML. */
function finish(res: Response): Response {
  const out = new Response(res.body, res);
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) out.headers.set(k, v);
  const ct = out.headers.get('Content-Type') ?? '';
  if (ct.startsWith('text/html') && !/charset/i.test(ct)) out.headers.set('Content-Type', 'text/html; charset=utf-8');
  return out;
}

/** How long past its TTL a cached page may still be served while a fresh copy renders in the background. */
const STALE_FACTOR = 10;

/**
 * Pages are server-rendered from KV (sportstreamy.cz's namespace, read only), so every uncached hit costs CPU and ~400 ms. Public GET responses that carry
 * `s-maxage` (set in layouts/Base.astro) go to the colo cache with a longer lifetime; within the TTL they are served
 * as is, after it they are still served instantly while ctx.waitUntil renders and stores a fresh copy
 * (stale-while-revalidate — the Cache API does not do that by itself). Only HTML pages are looked up:
 * a lookup for /go/ or the live feed would always miss (and shows up as a 504 "edgeWorkerCacheAPI" in analytics).
 */
async function serve(request: Request, env: unknown, ctx: ExecutionContext): Promise<Response> {
  const url = new URL(request.url);
  // One canonical spelling: /Futbal/ → /futbal/ (all our slugs are lowercase).
  if (url.hostname === 'www.ziveprenosy.sk') {
    url.hostname = 'ziveprenosy.sk';
    return new Response(null, { status: 301, headers: { Location: url.toString() } });
  }
  if (/[A-Z]/.test(url.pathname)) {
    url.pathname = url.pathname.toLowerCase();
    return new Response(null, { status: 301, headers: { Location: url.toString() } });
  }
  const legacy = legacyTarget(url.pathname);
  if (legacy && (request.method === 'GET' || request.method === 'HEAD')) return new Response(null, { status: 301, headers: { Location: legacy, 'Cache-Control': 'public, max-age=86400' } });
  if (request.method !== 'GET' || NO_CACHE.test(url.pathname)) return finish(await handle(request, env as never, ctx));
  // Pages read only these parameters; anything else (utm_*, fbclid, random cache busters) is dropped, so it can
  // neither create a new cache entry nor force a fresh render.
  const clean = new URL(url.origin + url.pathname);
  for (const k of KEEP) for (const v of url.searchParams.getAll(k)) clean.searchParams.append(k, v);
  clean.searchParams.sort();
  if (clean.search !== url.search) request = new Request(clean.toString(), request);
  const cache = (caches as unknown as { default: Cache }).default;
  const render = async () => {
    const res = await handle(request, env as never, ctx);
    const cc = res.headers.get('Cache-Control') ?? '';
    const ttl = Number(/s-maxage=(\d+)/.exec(cc)?.[1] ?? 0);
    if (res.status === 200 && ttl > 0) {
      const stored = new Response(res.clone().body, res);
      stored.headers.set('Cache-Control', `public, s-maxage=${ttl * STALE_FACTOR}`);
      stored.headers.set('X-ZP-Stored', String(Date.now()));
      stored.headers.set('X-ZP-TTL', String(ttl));
      stored.headers.set('X-ZP-CC', cc);
      ctx.waitUntil(cache.put(request, stored));
    }
    return res;
  };
  const hit = await cache.match(request);
  if (!hit) return finish(await render());
  const age = (Date.now() - Number(hit.headers.get('X-ZP-Stored') ?? 0)) / 1000;
  if (age > Number(hit.headers.get('X-ZP-TTL') ?? 0)) ctx.waitUntil(render().catch(() => undefined));
  const out = new Response(hit.body, hit);
  out.headers.set('Cache-Control', hit.headers.get('X-ZP-CC') ?? 'public, max-age=0');
  for (const h of ['X-ZP-Stored', 'X-ZP-TTL', 'X-ZP-CC']) out.headers.delete(h);
  out.headers.set('Age', String(Math.round(age)));
  return finish(out);
}

/**
 * Scheduled handler = refresh from the Tipsport.sk Partner API. No cron triggers: only the GitHub Actions live job
 * (sportstreamy repo, scripts/static/run.sh) calls it on its local dev server before rendering this site.
 */
async function scheduled(_c: ScheduledController, env: Env): Promise<void> {
  const r = await refresh(env);
  console.log(`tipsport.sk: ${r.live} live, ${r.pre} upcoming`);
}

export default { fetch: serve, scheduled };
