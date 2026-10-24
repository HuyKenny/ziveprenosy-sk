import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import type { Env } from '../../lib/types';
import { target } from '../../lib/partner';

export const prerender = false;

/** Tracked redirect: /go/<tipsport|registracia>/?m=<matchId>&p=<placement>. One Analytics Engine point per click, no cookies. */
export const GET: APIRoute = async ({ params, url, request }) => {
  const e = env as unknown as Env;
  const book = params.book ?? '';
  if (book !== 'tipsport' && book !== 'registracia') return new Response('Not found', { status: 404 });
  try {
    const ua = request.headers.get('user-agent') ?? '';
    const device = /bot|crawl|spider|slurp|preview|headless/i.test(ua) ? 'bot' : /Mobi|Android|iPhone/i.test(ua) ? 'mobile' : 'desktop';
    let page = '';
    try { page = new URL(request.headers.get('referer') ?? '').pathname; } catch { /* no referer */ }
    e.CLICKS?.writeDataPoint({
      indexes: [book],
      blobs: [book, (url.searchParams.get('p') ?? '').slice(0, 40), page.slice(0, 120), url.searchParams.get('m')?.slice(0, 12) ?? '', device],
      doubles: [1],
    });
  } catch { /* measuring must never block the redirect */ }
  return new Response(null, {
    status: 302,
    headers: { Location: target(e, book), 'X-Robots-Tag': 'noindex, nofollow', 'Cache-Control': 'private, no-store', 'Referrer-Policy': 'no-referrer-when-downgrade' },
  });
};
