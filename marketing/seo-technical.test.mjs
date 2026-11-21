/**
 * Technical SEO checks: 404 page, _headers (noindex, cache), content-hash asset URLs,
 * per-page sitemap dates, title length, and the CSS minifier.
 */
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import { test } from 'node:test';

import { FONTS, contentVersion, fontUrl } from './assets.mjs';
import { buildSeoSite } from './build-seo-site.mjs';
import { LASTMOD_TOKEN, mainHash, readLastmod, resolveLastmod } from './lastmod.mjs';
import { minifyCss } from './minify-css.mjs';
import { IMMUTABLE_PATHS } from './render.mjs';

const out = mkdtempSync(join(tmpdir(), 'mg-seo-tech-'));
buildSeoSite(out);
process.on('exit', () => rmSync(out, { recursive: true, force: true }));

const read = (rel) => readFileSync(join(out, rel), 'utf8');

function htmlFiles(dir = out, acc = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) htmlFiles(path, acc);
    else if (name.endsWith('.html')) acc.push(relative(out, path));
  }
  return acc;
}

const decode = (s) => s.replaceAll('&amp;', '&').replaceAll('&#39;', "'").replaceAll('&quot;', '"').replaceAll('&lt;', '<').replaceAll('&gt;', '>');

test('minifyCss keeps meaning and drops only safe whitespace', () => {
  assert.equal(minifyCss('a  >  b , c { color : red ; }'), 'a>b,c{color : red}');
  assert.equal(minifyCss('/* x */ .a { margin: 0 } /* y */'), '.a{margin: 0}');
  assert.equal(minifyCss("@media (max-width: 860px) and (prefers-reduced-motion: reduce) { .a { b: c; } }"), '@media (max-width: 860px) and (prefers-reduced-motion: reduce){.a{b: c}}');
  assert.equal(minifyCss('.a { width: calc( 100% - ( 2 * 8px ) ); }'), '.a{width: calc(100% - (2 * 8px))}');
  assert.equal(minifyCss(".a::before { content: '  a , b  { } ' ; }"), ".a::before{content: '  a , b  { } '}");
  assert.equal(minifyCss('.a { background: url( /x y.png ) ; }'), '.a{background: url( /x y.png )}');
  assert.equal(minifyCss('.a { --g: url("data:a  b"); }'), '.a{--g: url("data:a  b")}');
});

test('404.html is a real not-found page', () => {
  const html = read('404.html');
  assert.match(html, /<meta name="robots" content="noindex">/);
  assert.doesNotMatch(html, /rel="canonical"/);
  assert.equal((html.match(/<h1[\s>]/g) ?? []).length, 1);
  assert.match(html, /href="\/"/);
  assert.match(html, /href="\/en\/"/);
});

test('_headers keeps the app out of search, noindexes pages.dev and caches versioned files', () => {
  const headers = read('_headers');
  assert.match(headers, /^\/app\/auth\/confirm\*\n  Referrer-Policy: no-referrer$/m);
  assert.match(headers, /^\/app\/\*\n  X-Robots-Tag: noindex$/m);
  assert.match(headers, /^https:\/\/:project\.pages\.dev\/\*\n  X-Robots-Tag: noindex$/m);
  assert.match(headers, /^https:\/\/:version\.:project\.pages\.dev\/\*\n  X-Robots-Tag: noindex$/m);
  for (const path of IMMUTABLE_PATHS) {
    assert.match(headers, new RegExp(`^${path.replace(/[.*]/g, (c) => `\\${c}`)}\\n  Cache-Control: public, max-age=31536000, immutable$`, 'm'), path);
  }
});

test('every stylesheet, script and font URL carries the content hash of the published file', () => {
  const pages = htmlFiles();
  assert.ok(pages.length >= 48, `${pages.length} pages`);
  for (const rel of pages) {
    const html = read(rel);
    const refs = [...html.matchAll(/(?:href|src)="(\/(?:[\w-]+\.(?:css|js)|fonts\/[\w.-]+\.woff2))(?:\?v=([0-9a-f]+))?"/g)];
    assert.ok(refs.length >= 4, `${rel} loads the site assets`);
    for (const [, path, version] of refs) {
      assert.ok(version, `${rel}: ${path} has no ?v=`);
      assert.equal(version, contentVersion(readFileSync(join(out, path))), `${rel}: ${path}?v= is not the file's hash`);
    }
  }
  const css = read('mg.css');
  for (const font of FONTS) {
    assert.ok(css.includes(`url('${fontUrl(font)}')`) || css.includes(`url(${fontUrl(font)})`), `mg.css asks for ${fontUrl(font)}`);
    assert.equal(fontUrl(font).split('?v=')[1], contentVersion(readFileSync(join(out, 'fonts', font))), font);
  }
  assert.doesNotMatch(css, /\/fonts\/[\w-]+\.woff2['")]/, 'no unversioned font URL left in mg.css');
  assert.ok(read('index.html').includes(`<link rel="preload" href="${fontUrl('geist.woff2')}"`), 'preload asks for the same URL as @font-face');
});

test('titles fit in a search result and stay unique', () => {
  const seen = new Set();
  for (const rel of htmlFiles().filter((r) => r !== '404.html')) {
    const title = decode(read(rel).match(/<title>(.*?)<\/title>/)[1]);
    assert.ok(title.length <= 60, `${rel}: title has ${title.length} characters: ${title}`);
    assert.ok(!seen.has(title), `${rel}: duplicate title`);
    seen.add(title);
  }
});

test('sitemap dates come from lastmod.json and match each page', () => {
  const manifest = readLastmod();
  const sitemap = read('sitemap.xml');
  const urls = [...sitemap.matchAll(/<loc>https:\/\/microgrind\.app([^<]*)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/g)];
  assert.ok(urls.length >= 47);
  assert.deepEqual(urls.map(([, path]) => path).sort(), Object.keys(manifest).sort(), 'lastmod.json lists exactly the sitemap pages');
  for (const [, path, date] of urls) {
    assert.match(date, /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(date, manifest[path].date, `${path} lastmod`);
    const html = read(path === '/' ? 'index.html' : `${path.slice(1)}index.html`);
    assert.equal(mainHash(html), manifest[path].hash, `${path}: <main> changed but lastmod.json was not updated (run npm run build)`);
  }
  for (const rel of htmlFiles()) assert.ok(!read(rel).includes(LASTMOD_TOKEN), `${rel} still has the lastmod placeholder`);
  const guide = read('estudar/direito-penal/index.html');
  assert.ok(guide.includes(`"dateModified":"${manifest['/estudar/direito-penal/'].date}"`), 'guide dateModified follows the page date');
});

test('resolveLastmod keeps a date until the page content changes', () => {
  const page = (body) => `<html><head><title>${Math.random()}</title></head><body><main>${body}</main></body></html>`;
  const stored = { '/a/': { hash: mainHash(page('A')), date: '2026-01-01' } };
  const { manifest, dates } = resolveLastmod(new Map([['/a/', page('A')], ['/b/', page('B')]]), stored, '2026-11-21');
  assert.equal(dates.get('/a/'), '2026-01-01', 'head changes do not count');
  assert.equal(dates.get('/b/'), '2026-11-21', 'new pages get the build date');
  const next = resolveLastmod(new Map([['/a/', page('A2')]]), manifest, '2026-12-01');
  assert.equal(next.dates.get('/a/'), '2026-12-01', 'a content change moves the date');
  assert.deepEqual(Object.keys(next.manifest), ['/a/'], 'removed pages leave the manifest');
});

test('English practice and study pages are complete, paired with Portuguese and free of Portuguese UI text', async () => {
  const { practicePagesEn, PRACTICE_HUB_EN } = await import('./practice-en/index.mjs');
  const { studyGuidesEn, STUDY_HUB_EN } = await import('./study-en/index.mjs');
  const { practicePath, practicePair } = await import('./practice-page.mjs');
  const { studyPath, studyPair } = await import('./study-page.mjs');
  const sitemap = read('sitemap.xml');
  const deferred = ['exact passage', 'exact excerpt', 'checked against', 'validated', 'concept-by-concept', 'does not invent', 'invent things', 'outside info', 'general knowledge', 'health degree', 'medical school'];
  const portuguese = /Pergunta \d|Cartão \d|Ver resposta|Resposta certa|Perguntas frequentes|Recomeçar|Experimentar o MicroGrind|>Início<|cadeira|sebenta/;
  const hubEn = read('en/practice/index.html');
  const studyHubEn = read('en/study/index.html');
  assert.equal(practicePagesEn.length, 10);
  assert.equal(studyGuidesEn.length, 5);
  const entries = [
    ...practicePagesEn.map((p) => [practicePath(p), practicePair(p), hubEn]),
    ...studyGuidesEn.map((g) => [studyPath(g), studyPair(g), studyHubEn]),
    [PRACTICE_HUB_EN.path, { pt: '/praticar/', en: PRACTICE_HUB_EN.path }, null],
    [STUDY_HUB_EN.path, { pt: '/estudar/', en: STUDY_HUB_EN.path }, null],
  ];
  for (const [path, pair, hub] of entries) {
    const html = read(`${path.slice(1)}index.html`);
    assert.match(html, /<html lang="en">/, path);
    assert.ok(pair, `${path} has a Portuguese pair`);
    assert.ok(html.includes(`<link rel="alternate" hreflang="en" href="https://microgrind.app${pair.en}">`), `${path} hreflang en`);
    assert.ok(html.includes(`<link rel="alternate" hreflang="pt-PT" href="https://microgrind.app${pair.pt}">`), `${path} hreflang pt-PT`);
    const ptHtml = read(`${pair.pt.slice(1)}index.html`);
    assert.ok(ptHtml.includes(`<link rel="alternate" hreflang="en" href="https://microgrind.app${pair.en}">`), `${pair.pt} points back at ${path}`);
    assert.ok(html.includes(`href="${pair.pt}" hreflang="pt-PT"`) || html.includes(`href="${pair.pt}"`), `${path} language switch goes to ${pair.pt}`);
    assert.ok(sitemap.includes(`<loc>https://microgrind.app${path}</loc>`), `${path} in sitemap`);
    if (hub) assert.ok(hub.includes(`href="${path}"`), `${path} linked from its hub`);
    const text = html.toLowerCase();
    for (const phrase of deferred) assert.equal(text.includes(phrase), false, `${path} contains deferred claim: ${phrase}`);
    assert.doesNotMatch(html.replace(/<link rel="alternate"[^>]*>/g, '').replace(/hreflang="pt-PT"[^>]*>[^<]*</g, ''), portuguese, `${path} has Portuguese interface text`);
    if (hub) assert.match(html, /utm_source=practice/, `${path} sign-up link is tagged as English practice`);
  }
  const quiz = read(`${practicePath(practicePagesEn[0]).slice(1)}index.html`);
  assert.match(quiz, /Question 1 of 10/);
  assert.match(quiz, /<summary>Show answer<\/summary>/);
  assert.match(quiz, /"inLanguage":"en"/);
  assert.ok(read('en/index.html').includes('href="/en/practice/"'), 'English homepage links the practice hub');
  assert.ok(read('en/index.html').includes('href="/en/study/"'), 'English homepage links the study guides');
  const js = read('practice.js');
  assert.match(js, /scoreQuiz: function \(r, t\) \{ return 'You got '/, 'practice.js speaks English on English pages');
});

test('every page has its own share image, drawn with its current heading', async () => {
  const { renderAllPages } = await import('./build-seo-site.mjs');
  const { ogFile, ogKey, ogText, ogTextHash, readOgManifest, OG_WIDTH, OG_HEIGHT } = await import('./og.mjs');
  const manifest = readOgManifest();
  const rendered = renderAllPages();
  assert.deepEqual(Object.keys(manifest).sort(), [...rendered.keys()].map(ogKey).sort(), 'og/manifest.json lists exactly the site pages (run npm run og)');
  for (const [path, html] of rendered) {
    const key = ogKey(path);
    assert.ok(html.includes(`<meta property="og:image" content="https://microgrind.app/og/${key}.jpg">`), `${path} og:image`);
    assert.ok(html.includes(`<meta name="twitter:image" content="https://microgrind.app/og/${key}.jpg">`), `${path} twitter:image`);
    assert.match(html, /<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">\n<meta property="og:image:alt" content="[^"]+">/, `${path} og:image size and alt`);
    assert.equal(manifest[key].hash, ogTextHash(ogText(path, html)), `${path}: heading changed since og/${key}.jpg was drawn (run npm run og)`);
    const jpg = readFileSync(ogFile(path));
    assert.equal(jpg.readUInt16BE(0), 0xffd8, `og/${key}.jpg is a JPEG`);
    let i = 2;
    let size = null;
    while (i < jpg.length) {
      const marker = jpg.readUInt16BE(i);
      if (marker >= 0xffc0 && marker <= 0xffc2) {
        size = [jpg.readUInt16BE(i + 7), jpg.readUInt16BE(i + 5)];
        break;
      }
      i += 2 + jpg.readUInt16BE(i + 2);
    }
    assert.deepEqual(size, [OG_WIDTH, OG_HEIGHT], `og/${key}.jpg is ${OG_WIDTH}×${OG_HEIGHT}`);
    assert.ok(jpg.length < 150_000, `og/${key}.jpg is ${jpg.length} bytes`);
  }
});
