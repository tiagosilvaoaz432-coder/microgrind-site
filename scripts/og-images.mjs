#!/usr/bin/env node
/**
 * Draws one share image per page into deploy/site-root/og/<key>.jpg (1200×630) and records the
 * text it used in og/manifest.json. Run it after adding a page or changing a heading:
 *   npm run og            only pages whose text changed or that have no image
 *   npm run og -- --all   every page
 * Needs Playwright with Chromium (not part of the build or the tests, which only read the files).
 * Then run `npm run build` so the pages point at the new images.
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { renderAllPages } from '../marketing/build-seo-site.mjs';
import { OG_DIR, OG_HEIGHT, OG_MANIFEST, OG_WIDTH, ogFile, ogText, ogTextHash, readOgManifest } from '../marketing/og.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
// Fonts as data URLs: a page loaded with setContent cannot read file:// URLs.
const fontUrl = (name) => `data:font/woff2;base64,${readFileSync(join(ROOT, 'marketing', 'fonts', name)).toString('base64')}`;
const logo = `data:image/png;base64,${readFileSync(join(ROOT, 'deploy', 'site-root', 'logo-mark.png')).toString('base64')}`;

const FOOT = {
  pt: 'Sessões curtas. Progresso real.',
  en: 'Short sessions. Real progress.',
};

function esc(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

export function ogHtml(text) {
  const size = text.title.length > 70 ? 58 : text.title.length > 48 ? 66 : 76;
  return `<!DOCTYPE html><html lang="${text.locale === 'en' ? 'en' : 'pt-PT'}"><head><meta charset="utf-8"><style>
@font-face { font-family: 'Bricolage Grotesque'; src: url('${fontUrl('bricolage.woff2')}') format('woff2'); font-weight: 200 800; }
@font-face { font-family: 'Geist'; src: url('${fontUrl('geist.woff2')}') format('woff2'); font-weight: 100 900; }
@font-face { font-family: 'Geist Mono'; src: url('${fontUrl('geist-mono.woff2')}') format('woff2'); font-weight: 100 900; }
* { box-sizing: border-box; margin: 0; }
html, body { width: ${OG_WIDTH}px; height: ${OG_HEIGHT}px; }
body { position: relative; overflow: hidden; background: #07090d; color: #f4f6fb; font-family: 'Geist', sans-serif; }
.glow { position: absolute; border-radius: 50%; filter: blur(90px); opacity: 0.55; }
.glow.a { width: 620px; height: 620px; right: -160px; top: -260px; background: #3b82f6; }
.glow.b { width: 520px; height: 520px; right: 140px; bottom: -380px; background: #6d6bff; opacity: 0.35; }
.grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(148,163,184,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.07) 1px, transparent 1px); background-size: 48px 48px; mask-image: linear-gradient(90deg, transparent, #000 55%); }
.wrap { position: absolute; inset: 72px 84px 64px; display: flex; flex-direction: column; }
.brand { display: flex; align-items: center; gap: 18px; font-family: 'Bricolage Grotesque', sans-serif; font-weight: 700; font-size: 34px; letter-spacing: -0.03em; }
.brand img { width: 64px; height: 64px; border-radius: 16px; }
.kicker { margin-top: auto; font-family: 'Geist Mono', monospace; font-size: 24px; font-weight: 500; letter-spacing: 0.14em; text-transform: uppercase; color: #f3d25a; }
h1 { margin-top: 18px; max-width: 980px; font-family: 'Bricolage Grotesque', sans-serif; font-weight: 700; font-size: ${size}px; line-height: 1.04; letter-spacing: -0.035em; text-wrap: balance; }
.foot { display: flex; justify-content: space-between; margin-top: 40px; font-size: 26px; color: #aab3c5; }
.foot b { color: #f4f6fb; font-weight: 600; }
</style></head><body>
<div class="glow a"></div><div class="glow b"></div><div class="grid"></div>
<div class="wrap">
<div class="brand"><img src="${logo}" alt="">MicroGrind</div>
<p class="kicker">${esc(text.kicker)}</p>
<h1>${esc(text.title)}</h1>
<div class="foot"><span>${esc(FOOT[text.locale] ?? FOOT.pt)}</span><b>microgrind.app</b></div>
</div>
</body></html>`;
}

async function main() {
  const all = process.argv.includes('--all');
  const require = createRequire(import.meta.url);
  let chromium;
  try {
    ({ chromium } = require('playwright'));
  } catch {
    console.error('npm run og needs Playwright with Chromium (require("playwright") failed).');
    process.exit(2);
  }
  mkdirSync(OG_DIR, { recursive: true });
  const manifest = readOgManifest();
  const next = {};
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: OG_WIDTH, height: OG_HEIGHT }, deviceScaleFactor: 1 });
  let drawn = 0;
  for (const [path, html] of renderAllPages()) {
    const text = ogText(path, html);
    const hash = ogTextHash(text);
    next[text.key] = { hash, kicker: text.kicker, title: text.title };
    if (!all && manifest[text.key]?.hash === hash && existsSync(ogFile(path))) continue;
    await page.setContent(ogHtml(text), { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: ogFile(path), type: 'jpeg', quality: 82 });
    drawn += 1;
    console.log(`drew og/${text.key}.jpg`);
  }
  await browser.close();
  const sorted = Object.fromEntries(Object.entries(next).sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(OG_MANIFEST, `${JSON.stringify(sorted, null, 2)}\n`);
  console.log(`${drawn} image(s) drawn, ${Object.keys(sorted).length} in og/manifest.json. Now run npm run build.`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) await main();
