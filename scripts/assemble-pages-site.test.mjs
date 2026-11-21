import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { assemblePagesSite, checkPagesFolder, mergeHeaders, mergeRedirects } from './assemble-pages-site.mjs';

const REPO_ROOT = path.join(import.meta.dirname, '..');
// Fake values only: the real ones exist only as publish secrets.
const FAKE_URL = 'https://fake-project.example.test';
const FAKE_KEY = 'fake-anon-key-for-assemble-test';
const FAKE_ENV = { EXPO_PUBLIC_SUPABASE_URL: FAKE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY: FAKE_KEY };
const MODULE_TAG = '<script type="module" src="/mg-attr.js?v=1"></script>';
const SITE_PAGE = `<link href="/mg.css">\n<script src="/mg.js?v=1" defer></script>\n${MODULE_TAG}`;

function files(dir, acc = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files(full, acc);
    else acc.push(full);
  }
  return acc;
}

function put(root, rel, text = 'x') {
  const file = path.join(root, rel);
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, text);
}

const tmp = mkdtempSync(path.join(tmpdir(), 'mg-pages-'));
try {
  const appRoot = path.join(tmp, 'site');
  const dist = path.join(tmp, 'app-dist');
  for (const rel of ['privacidade/index.html', 'en/privacy/index.html', 'logo-mark.png', 'favicon.ico', 'og.png', '_astro/a.css']) {
    put(path.join(appRoot, 'deploy/site-root'), rel, `root ${rel}`);
  }
  put(path.join(appRoot, 'deploy/site-root'), 'README.md', 'notes');
  for (const rel of ['index.html', 'en/index.html', 'mapa-da-materia/index.html']) put(path.join(appRoot, 'site-static'), rel, SITE_PAGE);
  for (const rel of ['mg.css', 'mg.js', 'mg-attr.js', 'fonts/geist.woff2']) put(path.join(appRoot, 'site-static'), rel);
  put(path.join(appRoot, 'site-static'), '404.html', 'not found');
  put(path.join(appRoot, 'site-static'), '.well-known/assetlinks.json', 'COLOCA_AQUI');
  put(
    path.join(appRoot, 'site-static'),
    '_headers',
    '# site\n/app/auth/confirm*\n  Referrer-Policy: no-referrer\n\n/app/*\n  X-Robots-Tag: noindex\n\nhttps://:project.pages.dev/*\n  X-Robots-Tag: noindex\n\n/mg.css\n  Cache-Control: public, max-age=31536000, immutable\n'
  );
  put(path.join(appRoot, 'site-static'), '_redirects', '# old\n/direito / 301\n/en/law /en/ 301\n');
  for (const rel of ['app/index.html', 'app/plans.html', 'app/sw.js']) put(dist, rel);
  put(dist, '.well-known/assetlinks.json', '["07:F2"]');
  put(dist, '_headers', '/app/auth/confirm*\n  Referrer-Policy: no-referrer\n\n/app/*\n  X-Content-Type-Options: nosniff\n');
  put(dist, '_redirects', '/app/_expo/* /app/_expo/:splat 200\n/app/* /app/ 200\n');

  // No env (local runs, Site CI): the pages are copied as they are.
  const out = path.join(tmp, 'out');
  const local = assemblePagesSite({ repoRoot: appRoot, dist, out, env: {} });
  assert.deepEqual(local, { out, hit: { skipped: true } });
  assert.equal(readFileSync(path.join(out, 'index.html'), 'utf8'), SITE_PAGE, 'no env: no counter config');
  const redirects = readFileSync(path.join(out, '_redirects'), 'utf8').trim().split('\n').slice(1);
  assert.deepEqual(redirects, ['/direito / 301', '/en/law /en/ 301', '/app/_expo/* /app/_expo/:splat 200', '/app/* /app/ 200']);
  const headers = readFileSync(path.join(out, '_headers'), 'utf8');
  assert.match(headers, /X-Content-Type-Options/);
  assert.match(headers, /\/app\/\*\n  X-Content-Type-Options: nosniff\n  X-Robots-Tag: noindex\n/, 'site noindex joins the app block');
  assert.equal((headers.match(/Referrer-Policy: no-referrer/g) ?? []).length, 1, 'the same header is not repeated on a path');
  assert.match(headers, /https:\/\/:project\.pages\.dev\/\*\n  X-Robots-Tag: noindex/);
  assert.match(headers, /\/mg\.css\n  Cache-Control: public, max-age=31536000, immutable/);
  assert.equal(readFileSync(path.join(out, '404.html'), 'utf8'), 'not found', '404.html reaches the Pages root');
  assert.equal(readFileSync(path.join(out, '.well-known/assetlinks.json'), 'utf8'), '["07:F2"]', 'app export wins over the placeholder');
  assert.equal(readFileSync(path.join(out, 'privacidade/index.html'), 'utf8'), 'root privacidade/index.html');
  assert.match(readFileSync(path.join(out, 'index.html'), 'utf8'), /mg\.css/, 'site-static wins over site-root');
  assert.deepEqual(checkPagesFolder(out), []);
  assert.throws(() => readFileSync(path.join(out, 'README.md')));

  rmSync(path.join(out, 'app/index.html'));
  assert.deepEqual(checkPagesFolder(out), ['missing app/index.html']);
  rmSync(path.join(out, 'mg-attr.js'));
  writeFileSync(path.join(out, 'index.html'), '<link href="/mg.css">');
  assert.deepEqual(checkPagesFolder(out), ['missing mg-attr.js', 'missing app/index.html', 'index.html does not load /mg-attr.js']);

  // With the publish env: the config goes in front of mg-attr.js on every site page, once,
  // only in the assembled folder. site-static/, site-root and the app export stay untouched.
  const published = path.join(tmp, 'published');
  const withEnv = assemblePagesSite({ repoRoot: appRoot, dist, out: published, env: FAKE_ENV });
  assert.deepEqual(withEnv.hit, { skipped: false, pages: 3, updated: 3 });
  const config = `<script>window.__MG_HIT__={"url":"${FAKE_URL}","key":"${FAKE_KEY}"};</script>`;
  for (const rel of ['index.html', 'en/index.html', 'mapa-da-materia/index.html']) {
    const html = readFileSync(path.join(published, rel), 'utf8');
    assert.equal(html, SITE_PAGE.replace(MODULE_TAG, `${config}\n${MODULE_TAG}`), rel);
  }
  assert.equal(readFileSync(path.join(published, 'privacidade/index.html'), 'utf8'), 'root privacidade/index.html');
  assert.equal(readFileSync(path.join(published, 'app/index.html'), 'utf8'), 'x', 'the app export is not touched');
  for (const file of files(appRoot)) {
    assert.equal(readFileSync(file, 'utf8').includes(FAKE_KEY), false, `the key must not reach ${path.relative(appRoot, file)}`);
  }
  assert.ok(files(published).some((file) => readFileSync(file, 'utf8').includes(FAKE_KEY)));

  // Env present but broken, or no page that loads mg-attr.js: refuse to assemble.
  assert.throws(() => assemblePagesSite({ repoRoot: appRoot, dist, out: published, env: { EXPO_PUBLIC_SUPABASE_URL: FAKE_URL } }), /Set both/);
  assert.throws(() => assemblePagesSite({ repoRoot: appRoot, dist, out: published, env: { ...FAKE_ENV, EXPO_PUBLIC_SUPABASE_URL: 'http://x.example.test' } }), /bare https origin/);
  for (const rel of ['index.html', 'en/index.html', 'mapa-da-materia/index.html']) put(path.join(appRoot, 'site-static'), rel, '<link href="/mg.css">');
  assert.throws(() => assemblePagesSite({ repoRoot: appRoot, dist, out: published, env: FAKE_ENV }), /No HTML page in the Pages folder loads \/mg-attr\.js/);
  assert.throws(() => assemblePagesSite({ repoRoot: appRoot, dist, out: published, env: {} }), /index\.html does not load \/mg-attr\.js/);

  // This repo's real site-static/ (npm run build): every page gets the config, and the key stays out of git.
  const realOut = path.join(tmp, 'real');
  const siteStatic = path.join(REPO_ROOT, 'site-static');
  const sitePages = files(siteStatic).filter((file) => file.endsWith('.html'));
  const before = new Map(sitePages.map((file) => [file, readFileSync(file, 'utf8')]));
  const real = assemblePagesSite({ dist, out: realOut, env: FAKE_ENV });
  assert.deepEqual(real.hit, { skipped: false, pages: sitePages.length, updated: sitePages.length }, 'every site page loads mg-attr.js');
  for (const file of sitePages) {
    const rel = path.relative(siteStatic, file);
    assert.equal(readFileSync(file, 'utf8'), before.get(file), `site-static/${rel} must not change`);
    assert.equal(before.get(file).includes('__MG_HIT__'), false, `site-static/${rel} has no counter config`);
    const html = readFileSync(path.join(realOut, rel), 'utf8');
    assert.equal((html.match(/window\.__MG_HIT__=/g) ?? []).length, 1, `${rel} gets the config once`);
    const at = html.indexOf('window.__MG_HIT__=');
    assert.ok(html.indexOf('/mg.js?v=') < at && at < html.indexOf('<script type="module" src="/mg-attr.js'), `${rel}: mg.js, config, then mg-attr.js`);
    assert.ok(at < html.indexOf('</head>'), `${rel}: config in <head>`);
  }
  for (const file of files(path.join(REPO_ROOT, 'deploy'))) {
    assert.equal(readFileSync(file).includes(FAKE_KEY), false);
  }

  assert.equal(
    mergeHeaders('/a\n  X-One: 1\n', '/a\n  x-one: 2\n  X-Two: 2\n\n/b\n  X-Three: 3\n'),
    '# Generated by scripts/assemble-pages-site.mjs. App export rules first, then site-static/_headers.\n/a\n  X-One: 1\n  X-Two: 2\n\n/b\n  X-Three: 3\n'
  );
  assert.throws(() => mergeHeaders('  X-Orphan: 1\n', ''), /Bad _headers line/);

  assert.throws(() => mergeRedirects('', '/app/_expo/* /app/_expo/:splat 200\n'), /fallback/);
  const many = Array.from({ length: 101 }, (_, i) => `/r${i} / 301`).join('\n');
  assert.throws(() => mergeRedirects(many, '/app/* /app/ 200\n'), /rules/);

  rmSync(dist, { recursive: true });
  assert.throws(() => assemblePagesSite({ repoRoot: appRoot, dist, out }), /npm run dist/);
  console.log('assemble-pages-site.test.mjs passed');
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
