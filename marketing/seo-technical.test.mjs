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
