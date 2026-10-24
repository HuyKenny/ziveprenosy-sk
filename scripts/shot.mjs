#!/usr/bin/env node
// Viewport screenshots for visual review (Malina: system Chromium + puppeteer-core from ~/ai).
// node scripts/shot.mjs <url> <out.png> [mobile|desktop] [scrollY] [fullPage]
import { createRequire } from 'node:module';
const require = createRequire('/home/kenny/ai/package.json');
const puppeteer = require('puppeteer-core');

const [url, out, mode = 'desktop', scrollY = '0', full = ''] = process.argv.slice(2);
const browser = await puppeteer.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--hide-scrollbars'] });
const page = await browser.newPage();
if (mode === 'mobile') {
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1');
} else {
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
}
page.on('pageerror', (e) => console.error('PAGEERROR', e.message));
page.on('console', (m) => { if (m.type() === 'error') console.error('CONSOLE', m.text()); });
await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
await page.evaluate((y) => window.scrollTo(0, Number(y)), scrollY);
await new Promise((r) => setTimeout(r, 1600));
await page.screenshot({ path: out, fullPage: full === 'full' });
await browser.close();
console.log(out);
