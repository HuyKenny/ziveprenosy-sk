import { SITE } from './seo';

export interface Url { loc: string; lastmod?: string; priority?: number }

export const xml = (body: string, ttl = 900) =>
  new Response(`<?xml version="1.0" encoding="UTF-8"?>\n${body}\n`, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': `public, s-maxage=${ttl}` } });

export const urlset = (urls: Url[]) =>
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `<url><loc>${SITE}${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}${u.priority ? `<priority>${u.priority.toFixed(1)}</priority>` : ''}</url>`)
    .join('\n')}\n</urlset>`;
