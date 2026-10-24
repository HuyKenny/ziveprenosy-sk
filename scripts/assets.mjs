// Brand assets from the SVG mark + Schibsted Grotesk: OG image, touch icons, manifest. Run: node scripts/assets.mjs
import satori from 'satori';
import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const f = (n) => readFileSync(require.resolve(`@fontsource/schibsted-grotesk/files/${n}`));
const fonts = [
  { name: 'S', data: f('schibsted-grotesk-latin-900-normal.woff'), weight: 900, style: 'normal' },
  { name: 'SE', data: f('schibsted-grotesk-latin-ext-900-normal.woff'), weight: 900, style: 'normal' },
  { name: 'S', data: f('schibsted-grotesk-latin-500-normal.woff'), weight: 500, style: 'normal' },
  { name: 'SE', data: f('schibsted-grotesk-latin-ext-500-normal.woff'), weight: 500, style: 'normal' },
];
const h = (type, style, children) => ({ type, props: { style: { display: 'flex', ...style }, children } });
const INK = '#0f1b2d', RED = '#e1251b', BLUE = '#0b4ea2', PAPER = '#f2f3ee';
const mark = (size) => h('div', { width: size, height: size, borderRadius: size * 0.14, background: RED, border: `${Math.round(size / 15)}px solid ${INK}`, alignItems: 'center', justifyContent: 'center' },
  h('div', { width: 0, height: 0, borderTop: `${size * 0.21}px solid transparent`, borderBottom: `${size * 0.21}px solid transparent`, borderLeft: `${size * 0.33}px solid #fff`, marginLeft: size * 0.08 }));
const row = (time, a, b, live) => h('div', { alignItems: 'center', gap: 14, padding: '14px 18px', borderTop: `2px solid #d9ddd4`, background: live ? '#fdeceb' : '#fff' }, [
  h('div', { width: 106, fontSize: 22, fontWeight: 900, color: live ? RED : INK }, time),
  h('div', { flexDirection: 'column', flex: 1, fontSize: 24, fontWeight: 500 }, [h('span', {}, a), h('span', {}, b)]),
  h('div', { background: RED, color: '#fff', border: `2px solid ${INK}`, borderRadius: 6, padding: '6px 12px', fontSize: 20, fontWeight: 900 }, 'Pozerať'),
]);
const tree = h('div', { width: 1200, height: 630, background: PAPER, color: INK, fontFamily: 'S, SE', padding: '56px 60px', gap: 40 }, [
  h('div', { flexDirection: 'column', justifyContent: 'space-between', width: 540 }, [
    h('div', { alignItems: 'center', gap: 16, fontSize: 44, fontWeight: 900, letterSpacing: -1 }, [mark(58), h('div', {}, [h('span', {}, 'živé'), h('span', { color: RED }, 'prenosy'), h('span', { color: BLUE, fontSize: 34, marginTop: 8 }, '.sk')])]),
    h('div', { flexDirection: 'column', gap: 18 }, [
      h('div', { fontSize: 82, fontWeight: 900, lineHeight: 0.98, letterSpacing: -2, flexDirection: 'column' }, [h('span', {}, 'Živé prenosy'), h('span', {}, 'dnes')]),
      h('div', { fontSize: 30, fontWeight: 500, color: '#4b5567' }, 'Niké liga, Tipsport liga, Liga majstrov, NHL a tenis – program a skóre naživo'),
    ]),
    h('div', { fontSize: 22, fontWeight: 500, color: '#7a8394' }, 'ziveprenosy.sk · len 18+'),
  ]),
  h('div', { flexDirection: 'column', width: 480, alignSelf: 'center', background: '#fff', border: `3px solid ${INK}`, borderRadius: 8, boxShadow: `8px 8px 0 ${INK}`, overflow: 'hidden' }, [
    h('div', { alignItems: 'center', gap: 12, padding: '12px 22px', background: '#f7f8f4', fontSize: 24, fontWeight: 900 }, [h('div', { background: BLUE, color: '#fff', borderRadius: 4, padding: '2px 8px', fontSize: 18 }, 'NL'), 'Niké liga']),
    row('NAŽIVO', 'Slovan Bratislava', 'Žilina', true),
    row('18:00', 'Trnava', 'Košice', false),
    row('20:30', 'Ružomberok', 'Podbrezová', false),
  ]),
]);
const svg = await satori(tree, { width: 1200, height: 630, fonts });
await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile('public/og.png');
const fav = readFileSync('public/favicon.svg');
await sharp(fav, { density: 512 }).resize(32, 32).png().toFile('public/favicon-32.png');
// App icons are full-bleed (iOS/Android crop their own corners).
const app = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="${RED}"/><path d="M25 19v26l21-13z" fill="#fff"/></svg>`);
for (const [name, size] of [['apple-touch-icon.png', 180], ['icon-192.png', 192], ['icon-512.png', 512]]) {
  await sharp(app, { density: 600 }).resize(size, size).png().toFile(`public/${name}`);
}
writeFileSync('public/site.webmanifest', JSON.stringify({ name: 'ŽivéPrenosy.sk – živé prenosy dnes', short_name: 'ŽivéPrenosy', start_url: '/', display: 'standalone', background_color: PAPER, theme_color: INK, lang: 'sk', icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' }, { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }] }));
console.log('assets ok');
