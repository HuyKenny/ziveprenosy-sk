import { xml } from '../lib/sitemap';
import { SITE } from '../lib/seo';
export const prerender = false;
export const GET = () => {
  const now = new Date().toISOString();
  const maps = ['sitemap-pages.xml', 'sitemap-matches.xml'];
  return xml(`<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${maps.map((m) => `<sitemap><loc>${SITE}/${m}</loc><lastmod>${now}</lastmod></sitemap>`).join('\n')}\n</sitemapindex>`);
};
