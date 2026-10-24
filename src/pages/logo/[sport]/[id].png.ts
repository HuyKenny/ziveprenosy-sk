import type { APIRoute } from 'astro';

export const prerender = false;

/** Team crests by provider id, served from our own domain (one fetch per crest and colo, then cached for a month). */
const SPORTS = new Set(['football', 'hockey', 'basketball', 'volleyball', 'handball']);
const ORIGIN = ['https://media', 'api-sports', 'io'];

export const GET: APIRoute = async ({ params }) => {
  const sport = params.sport ?? '';
  const id = /^\d{1,7}$/.test(params.id ?? '') ? params.id : undefined;
  if (!SPORTS.has(sport) || !id) return new Response('Not found', { status: 404 });
  const res = await fetch(`${ORIGIN[0]}.${ORIGIN[1]}.${ORIGIN[2]}/${sport}/teams/${id}.png`, { cf: { cacheEverything: true, cacheTtl: 2_592_000 } } as RequestInit);
  if (!res.ok || !(res.headers.get('content-type') ?? '').startsWith('image/')) return new Response('Not found', { status: 404, headers: { 'Cache-Control': 'public, s-maxage=86400' } });
  return new Response(res.body, { headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=2592000, s-maxage=2592000, immutable', 'X-Robots-Tag': 'noindex' } });
};
