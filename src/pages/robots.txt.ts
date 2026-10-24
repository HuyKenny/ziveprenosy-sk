export const prerender = true;
export const GET = () =>
  new Response(`User-agent: *\nAllow: /\nDisallow: /go/\nDisallow: /api/\nDisallow: /hladat/\n\nSitemap: https://ziveprenosy.sk/sitemap.xml\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
