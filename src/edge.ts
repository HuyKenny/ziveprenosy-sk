/**
 * Production Worker since 23. 11. 2026 (Cloudflare Workers Free): every page is a static asset rendered by the
 * GitHub Actions job in the sportstreamy repo (.github/workflows/live.yml → scripts/static/). Static asset hits never
 * run this code; it only runs for what has no file:
 *   /go/<book>/            tracked affiliate redirect (+ Analytics Engine point)
 *   /logo/<sport>/<id>.png crest proxy for crests that have no WebP yet
 *   /teraz-nazivo/, /program/*, /vysledky/*  (run_worker_first) ?sport= / ?stav= → the copy stored under /_q/
 *   legacy addresses, uppercase paths, finished matches (301 like before), everything else (404).
 * Keep it light: the Free plan allows 10 ms CPU per request.
 */
import type { Env as AppEnv } from './lib/types';
import { target } from './lib/partner';
import { legacyTarget, goneMatchTarget } from './lib/redirects';

interface Env extends AppEnv {
  ASSETS: Fetcher;
}

/** Must match scripts/static/snapshot.py in the sportstreamy repo (SHARDS). */
const SHARDS = 64;
/** Query parameters that select a pre-rendered variant (same order and encoding as snapshot.py's variant path). */
const VARIANT_KEYS = ['sport', 'stav'];

const asset = (env: Env, url: URL, path: string) => env.ASSETS.fetch(new Request(new URL(path, url.origin)));

function redirect(to: string, status = 301, cache = 'public, max-age=3600'): Response {
  return new Response(null, { status, headers: { Location: to, 'Cache-Control': cache } });
}

async function page(env: Env, url: URL, path: string, status: number): Promise<Response> {
  const r = await asset(env, url, path);
  return new Response(r.body, { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=300', 'X-Robots-Tag': 'noindex' } });
}

function go(env: Env, url: URL, request: Request, book: string): Response | null {
  if (book !== 'tipsport' && book !== 'registracia') return null;
  try {
    const ua = request.headers.get('user-agent') ?? '';
    const device = /bot|crawl|spider|slurp|preview|headless/i.test(ua) ? 'bot' : /Mobi|Android|iPhone/i.test(ua) ? 'mobile' : 'desktop';
    let from = '';
    try { from = new URL(request.headers.get('referer') ?? '').pathname; } catch { /* no referer */ }
    env.CLICKS?.writeDataPoint({ indexes: [book], blobs: [book, (url.searchParams.get('p') ?? '').slice(0, 40), from.slice(0, 120), url.searchParams.get('m')?.slice(0, 12) ?? '', device], doubles: [1] });
  } catch { /* measuring must never block the redirect */ }
  return new Response(null, { status: 302, headers: { Location: target(env, book), 'X-Robots-Tag': 'noindex, nofollow', 'Cache-Control': 'private, no-store', 'Referrer-Policy': 'no-referrer-when-downgrade' } });
}

const LOGO_SPORTS = new Set(['football', 'hockey', 'basketball', 'volleyball', 'handball']);
async function logo(sport: string, id: string): Promise<Response> {
  if (!LOGO_SPORTS.has(sport) || !/^\d{1,7}$/.test(id)) return new Response('Not found', { status: 404 });
  const res = await fetch(`https://media.api-sports.io/${sport}/teams/${id}.png`, { cf: { cacheEverything: true, cacheTtl: 2_592_000 } } as RequestInit);
  if (!res.ok || !(res.headers.get('content-type') ?? '').startsWith('image/')) return new Response('Not found', { status: 404, headers: { 'Cache-Control': 'public, s-maxage=86400' } });
  return new Response(res.body, { headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=2592000, immutable', 'X-Robots-Tag': 'noindex' } });
}

/** Path of the pre-rendered variant of a filtered page, or null when the query selects none. */
function variant(url: URL): string | null {
  const parts: string[] = [];
  for (const k of VARIANT_KEYS) {
    const v = url.searchParams.get(k);
    if (v && /^[a-z0-9-]{1,40}$/.test(v)) parts.push(`${k}-${v}`);
  }
  return parts.length ? `/_q${url.pathname}${parts.join('_')}/` : null;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.hostname.startsWith('www.')) return redirect(`https://${url.hostname.slice(4)}${url.pathname}${url.search}`, 301, 'public, max-age=86400');
    const p = url.pathname;
    if (/[A-Z]/.test(p)) return redirect(p.toLowerCase() + url.search);
    const legacy = legacyTarget(p);
    if (legacy) return redirect(legacy, 301, 'public, max-age=86400');
    if (/^\/(teraz-nazivo|program|vysledky)\//.test(p)) {
      const v = variant(url);
      if (v) {
        const r = await asset(env, url, v);
        if (r.ok) return r;
      }
      const r = await env.ASSETS.fetch(request);
      if (r.status !== 404) return r;
    }
    const seg = p.split('/');
    if (seg[1] === 'go') return go(env, url, request, seg[2] ?? '') ?? page(env, url, '/_404/', 404);
    if (seg[1] === 'logo' && seg.length === 4) return logo(seg[2], seg[3].replace(/\.png$/, ''));
    if (seg[1] === 'prenos' && seg[2]) {
      // A match page without a file: a renamed slug of a match we still have → its page; otherwise the club page
      // or the live overview, as the SSR site did.
      const id = Number(seg[2].split('-')[0]);
      if (id > 0) {
        const r = await asset(env, url, `/_m/${id % SHARDS}.json`);
        const info = r.ok ? ((await r.json()) as Record<string, [string, string]>)[id] : undefined;
        if (info?.[0] && info[0] !== p) return redirect(info[0]);
        return redirect(goneMatchTarget(seg[2]));
      }
    }
    return page(env, url, '/_404/', 404);
  },
};
