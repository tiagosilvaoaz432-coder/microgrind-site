import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { assemblePagesSite, checkPagesFolder, mergeRedirects } from './assemble-pages-site.mjs';

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
  for (const rel of ['index.html', 'en/index.html']) put(path.join(appRoot, 'site-static'), rel, '<link href="/mg.css">');
  for (const rel of ['mg.css', 'mg.js', 'fonts/geist.woff2']) put(path.join(appRoot, 'site-static'), rel);
  put(path.join(appRoot, 'site-static'), '.well-known/assetlinks.json', 'COLOCA_AQUI');
  put(path.join(appRoot, 'site-static'), '_headers', '/app/auth/confirm*\n  Referrer-Policy: no-referrer\n');
  put(path.join(appRoot, 'site-static'), '_redirects', '# old\n/direito / 301\n/en/law /en/ 301\n');
  for (const rel of ['app/index.html', 'app/plans.html', 'app/sw.js']) put(dist, rel);
  put(dist, '.well-known/assetlinks.json', '["07:F2"]');
  put(dist, '_headers', '/app/auth/confirm*\n  Referrer-Policy: no-referrer\n\n/app/*\n  X-Content-Type-Options: nosniff\n');
  put(dist, '_redirects', '/app/_expo/* /app/_expo/:splat 200\n/app/* /app/ 200\n');

  const out = path.join(tmp, 'out');
  assemblePagesSite({ repoRoot: appRoot, dist, out });
  const redirects = readFileSync(path.join(out, '_redirects'), 'utf8').trim().split('\n').slice(1);
  assert.deepEqual(redirects, ['/direito / 301', '/en/law /en/ 301', '/app/_expo/* /app/_expo/:splat 200', '/app/* /app/ 200']);
  assert.match(readFileSync(path.join(out, '_headers'), 'utf8'), /X-Content-Type-Options/);
  assert.equal(readFileSync(path.join(out, '.well-known/assetlinks.json'), 'utf8'), '["07:F2"]', 'app export wins over the placeholder');
  assert.equal(readFileSync(path.join(out, 'privacidade/index.html'), 'utf8'), 'root privacidade/index.html');
  assert.match(readFileSync(path.join(out, 'index.html'), 'utf8'), /mg\.css/, 'site-static wins over site-root');
  assert.deepEqual(checkPagesFolder(out), []);
  assert.throws(() => readFileSync(path.join(out, 'README.md')));

  rmSync(path.join(out, 'app/index.html'));
  assert.deepEqual(checkPagesFolder(out), ['missing app/index.html']);

  assert.throws(() => mergeRedirects('', '/app/_expo/* /app/_expo/:splat 200\n'), /fallback/);
  const many = Array.from({ length: 101 }, (_, i) => `/r${i} / 301`).join('\n');
  assert.throws(() => mergeRedirects(many, '/app/* /app/ 200\n'), /rules/);

  rmSync(dist, { recursive: true });
  assert.throws(() => assemblePagesSite({ repoRoot: appRoot, dist, out }), /npm run dist/);
  console.log('assemble-pages-site.test.mjs passed');
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
