// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

// Server-rendered on Workers: match lists come from sportstreamy.cz's KV (shared binding, read only),
// the Worker caches HTML in the colo cache (src/worker.ts).
export default defineConfig({
  site: 'https://ziveprenosy.sk',
  output: 'server',
  adapter: cloudflare({ imageService: 'passthrough' }),
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'always' },
  compressHTML: true,
  // Prefetch only links marked data-astro-prefetch (navigation, match rows): never /go/ redirects, which would count
  // a click that nobody made. 'hover' fires on touchstart on phones.
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
  // Every client script as an external file, so the CSP can drop 'unsafe-inline' for scripts.
  vite: { build: { assetsInlineLimit: 0 } },
});
