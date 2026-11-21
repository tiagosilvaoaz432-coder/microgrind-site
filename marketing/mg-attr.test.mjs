/**
 * mg-attr-boot.mjs (port of the app's marketing/mg-attr.test.ts), then the real bundle from
 * bundle-mg-attr.mjs run in a sandbox, then the bundler's own rules.
 */
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

import { bundleMgAttr, stripCommentsAndSpace } from './bundle-mg-attr.mjs';
import { bootSiteAttribution } from './mg-attr-boot.mjs';

function element(attrs) {
  const node = {
    href: attrs.href ?? '',
    attrs: { ...attrs },
    getAttribute(name) {
      if (name === 'href') return node.href || null;
      return node.attrs[name] ?? null;
    },
    setAttribute(name, value) {
      node.attrs[name] = value;
      if (name === 'href') node.href = value;
    },
    closest(selector) {
      if (selector === 'a[href]' && node.href) return node;
      if (selector === '[data-web], [data-ig-copy]' && (node.attrs['data-web'] || node.attrs['data-ig-copy'])) return node;
      return null;
    },
  };
  return node;
}

function page(options) {
  const data = new Map();
  const anchors = options.hrefs.map((href) => element({ href }));
  const extras = (options.extras ?? []).map((attrs) => element(attrs));
  const listeners = [];
  const calls = [];
  let fetchStarted = false;
  const pathname = options.pathname ?? '/mapa-da-materia/';
  const win = {
    location: {
      href: `https://microgrind.app${pathname}${options.search}`,
      search: options.search,
      pathname,
      hostname: 'microgrind.app',
    },
    document: {
      referrer: options.referrer ?? '',
      querySelectorAll: (selector) => {
        if (selector === 'a[href]') return anchors;
        if (selector === '[data-web]') return extras.filter((el) => el.getAttribute('data-web'));
        if (selector === '[data-ig-copy]') return extras.filter((el) => el.getAttribute('data-ig-copy'));
        return [];
      },
      addEventListener: (type, listener, capture) => {
        listeners.push({ type, listener, capture });
      },
    },
    sessionStorage: {
      getItem: (key) => data.get(key) ?? null,
      setItem: (key, value) => {
        data.set(key, value);
      },
      removeItem: (key) => {
        data.delete(key);
      },
    },
    performance: { timeOrigin: options.stamp ?? 10 },
    fetch: (url, init) => {
      fetchStarted = true;
      calls.push({ url, body: String(init.body ?? ''), init });
      return new Promise(() => undefined);
    },
    __MG_HIT__: options.hit === false ? undefined : (options.hit ?? { url: 'https://example.test', key: 'anon-key' }),
  };
  return { win, anchors, extras, listeners, calls, started: () => fetchStarted, storage: data };
}

const ad = page({
  search: '?utm_source=chatgpt&gclid=SECRET',
  referrer: 'https://www.google.com/search?q=secret',
  hrefs: ['https://microgrind.app/app/', 'https://microgrind.app/planos/', 'https://evil.example/app/', '/app/register?utm_source=praticar'],
});
bootSiteAttribution(ad.win);
assert.match(ad.anchors[0].href, /utm_source=chatgpt/);
assert.match(ad.anchors[0].href, /mg_ref=www\.google\.com/);
assert.match(ad.anchors[0].href, /mg_land=%2Fmapa-da-materia%2F/);
assert.equal(ad.anchors[0].href.includes('SECRET'), false);
assert.equal(ad.anchors[0].href.includes('gclid'), false);
assert.equal(ad.anchors[0].href.includes('secret'), false);
assert.equal(ad.anchors[1].href, 'https://microgrind.app/planos/');
assert.equal(ad.anchors[2].href, 'https://evil.example/app/');
assert.match(ad.anchors[3].href, /utm_source=praticar/, 'a link that already has utm_source keeps it');
assert.equal(ad.anchors[3].href.includes('utm_source=chatgpt'), false);
assert.equal(ad.calls.length, 1);
assert.equal(ad.calls[0].url, 'https://example.test/rest/v1/rpc/record_web_hit');
assert.deepEqual(JSON.parse(ad.calls[0].body), { p_path_group: 'mapa', p_source: 'chatgpt' });
assert.equal(ad.calls[0].init.credentials, 'omit');
assert.equal(ad.calls[0].init.keepalive, true);
assert.equal(ad.calls[0].init.headers.apikey, 'anon-key');
assert.equal(ad.started(), true);
assert.equal(ad.listeners.length, 1);
assert.equal(ad.listeners[0].type, 'click');
assert.equal(ad.listeners[0].capture, true, 'the click listener runs in the capture phase');
assert.equal(JSON.parse(ad.storage.get('mg-attr')).source, 'chatgpt');
assert.equal(ad.storage.get('mg-hit:mapa:/mapa-da-materia/'), '10');

// A link added or changed after the boot is rewritten when clicked.
const late = element({ href: '/app/' });
ad.listeners[0].listener({ target: late });
assert.match(late.href, /utm_source=chatgpt/);
assert.equal(late.href.includes('SECRET'), false);
const other = element({ href: '/planos/' });
ad.listeners[0].listener({ target: other });
assert.equal(other.href, '/planos/');
assert.doesNotThrow(() => ad.listeners[0].listener({ target: null }));
assert.doesNotThrow(() => ad.listeners[0].listener({ target: {} }));

bootSiteAttribution(ad.win);
assert.equal(ad.calls.length, 1, 'the same document does not count twice');

const direct = page({ search: '', referrer: 'https://www.google.com/search?q=secret', pathname: '/', hrefs: ['/app/'], hit: false });
bootSiteAttribution(direct.win);
assert.equal(direct.anchors[0].href.includes('utm_source='), false);
assert.match(direct.anchors[0].href, /mg_ref=www\.google\.com/);
assert.equal(direct.anchors[0].href.includes('secret'), false);
assert.equal(direct.calls.length, 0, 'without a publish config the counter does nothing');

const halfConfig = page({ search: '?utm_source=chatgpt', hrefs: [], hit: { url: 'https://example.test', key: '' } });
bootSiteAttribution(halfConfig.win);
assert.equal(halfConfig.calls.length, 0, 'a config without a key does nothing');

const offline = page({ search: '?utm_source=chatgpt', hrefs: [], stamp: 20 });
offline.win.fetch = () => {
  throw new Error('offline');
};
assert.doesNotThrow(() => bootSiteAttribution(offline.win));

const rejected = page({ search: '?utm_source=chatgpt', hrefs: [], stamp: 21 });
rejected.win.fetch = () => Promise.reject(new Error('offline'));
assert.doesNotThrow(() => bootSiteAttribution(rejected.win));

const noStorage = page({ search: '?utm_source=chatgpt', hrefs: ['/app/'], stamp: 22 });
Object.defineProperty(noStorage.win, 'sessionStorage', {
  get() {
    throw new Error('SecurityError');
  },
});
assert.doesNotThrow(() => bootSiteAttribution(noStorage.win));
assert.match(noStorage.anchors[0].href, /utm_source=chatgpt/, 'blocked storage still forwards the source');
assert.equal(noStorage.calls.length, 1, 'blocked storage still counts');

const brokenDoc = page({ search: '?utm_source=chatgpt', hrefs: [] });
brokenDoc.win.document.querySelectorAll = () => {
  throw new Error('boom');
};
assert.doesNotThrow(() => bootSiteAttribution(brokenDoc.win), 'attribution never breaks the page');

const pending = page({ search: '?utm_source=chatgpt', hrefs: [], stamp: 30 });
let resolved = false;
pending.win.fetch = () =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolved = true;
      resolve(null);
    }, 30);
  });
bootSiteAttribution(pending.win);
assert.equal(resolved, false, 'the page does not wait for the counter');

for (const [pathname, group] of [
  ['/', 'site'],
  ['/planos/', 'site'],
  ['/praticar/direito-penal-teoria-do-crime/', 'site'],
  ['/mapa-da-materia/', 'mapa'],
  ['/en/subject-map/', 'mapa'],
  ['/en/', 'site'],
]) {
  const visit = page({ search: '?utm_source=chatgpt', pathname, hrefs: [], stamp: 40 });
  bootSiteAttribution(visit.win);
  assert.deepEqual(JSON.parse(visit.calls[0].body), { p_path_group: group, p_source: 'chatgpt' }, pathname);
}

const install = page({
  search: '?utm_source=chatgpt&utm_medium=cpc&gclid=SECRET',
  hrefs: [],
  extras: [
    { 'data-web': 'https://microgrind.app/app/' },
    { 'data-ig-copy': 'https://microgrind.app/app/' },
    { 'data-ig-copy': 'https://microgrind.app/planos/' },
    { 'data-web': 'https://evil.example/app/' },
  ],
  stamp: 50,
});
bootSiteAttribution(install.win);
assert.match(install.extras[0].getAttribute('data-web'), /utm_source=chatgpt/);
assert.match(install.extras[0].getAttribute('data-web'), /utm_medium=cpc/);
assert.equal(install.extras[0].getAttribute('data-web').includes('SECRET'), false);
assert.equal(install.extras[0].getAttribute('data-web').includes('gclid'), false);
assert.match(install.extras[1].getAttribute('data-ig-copy'), /utm_source=chatgpt/);
assert.equal(install.extras[2].getAttribute('data-ig-copy'), 'https://microgrind.app/planos/');
assert.equal(install.extras[3].getAttribute('data-web'), 'https://evil.example/app/');

const lateCopy = element({ 'data-ig-copy': 'https://microgrind.app/app/' });
install.listeners[0].listener({ target: lateCopy });
assert.match(lateCopy.getAttribute('data-ig-copy'), /utm_source=chatgpt/);
assert.equal(lateCopy.getAttribute('data-ig-copy').includes('gclid'), false);
const lateDialog = element({ 'data-web': 'https://microgrind.app/app/', 'data-ig-copy': 'https://microgrind.app/app/' });
install.listeners[0].listener({ target: lateDialog });
assert.match(lateDialog.getAttribute('data-web'), /utm_medium=cpc/);
assert.match(lateDialog.getAttribute('data-ig-copy'), /utm_medium=cpc/);

// The real bundle, as served at /mg-attr.js: runs on its own and leaks nothing to window.
const bundle = bundleMgAttr();
assert.equal(bundleMgAttr(), bundle, 'the bundle is deterministic');
assert.match(bundle, /^\(\(\)=>\{\n"use strict";\n/);
assert.match(bundle, /\n\}\)\(\);\n$/);
assert.doesNotMatch(bundle, /\/\*|^\s*\/\//m, 'no comments, so no legal comments');
assert.doesNotMatch(bundle, /^\s*(import|export)\b/m, 'no module syntax left');
assert.doesNotMatch(bundle, /^[ \t]|\n\n/m, 'no indentation or blank lines');
for (const newer of ['??=', '||=', '&&=', '.at(', 'replaceAll(', 'Object.hasOwn', 'structuredClone']) {
  assert.equal(bundle.includes(newer), false, `ES2020 target: the bundle uses ${newer}`);
}
assert.doesNotMatch(bundle, /#[A-Za-z_$][\w$]*\s*[=(;]/, 'ES2020 target: no private class members');

function runBundle(win) {
  const globals = { window: win, document: win.document, URL, URLSearchParams };
  const context = vm.createContext({ ...globals });
  vm.runInContext(bundle, context, { filename: 'mg-attr.js' });
  assert.deepEqual(Object.keys(context).sort(), Object.keys(globals).sort(), 'the bundle defines no globals');
}

const live = page({ search: '?utm_source=chatgpt&utm_campaign=mapa&gclid=SECRET', hrefs: ['https://microgrind.app/app/', '/sobre/'], stamp: 60, extras: [{ 'data-web': 'https://microgrind.app/app/', 'data-ig-copy': 'https://microgrind.app/app/' }] });
runBundle(live.win);
assert.match(live.anchors[0].href, /utm_source=chatgpt&utm_campaign=mapa&mg_land=%2Fmapa-da-materia%2F$/);
assert.equal(live.anchors[1].href, '/sobre/');
assert.match(live.extras[0].getAttribute('data-web'), /utm_source=chatgpt/);
assert.match(live.extras[0].getAttribute('data-ig-copy'), /utm_source=chatgpt/);
assert.equal(live.calls.length, 1);
assert.equal(live.calls[0].url, 'https://example.test/rest/v1/rpc/record_web_hit');
assert.deepEqual(JSON.parse(live.calls[0].body), { p_path_group: 'mapa', p_source: 'chatgpt' });
assert.equal(live.calls[0].init.mode, 'cors');
assert.equal(live.listeners[0].capture, true);
runBundle(live.win);
assert.equal(live.calls.length, 1, 'bundle: a second run in the same document does not count');

const liveLocal = page({ search: '', pathname: '/', hrefs: ['/app/'], hit: false, stamp: 61 });
runBundle(liveLocal.win);
assert.equal(liveLocal.calls.length, 0, 'bundle: no __MG_HIT__, no request');

const headless = vm.createContext({ URL, URLSearchParams });
assert.doesNotThrow(() => vm.runInContext(bundle, headless), 'bundle: no window, no work');

// Bundler rules: anything it cannot bundle safely stops the build.
assert.equal(stripCommentsAndSpace('/**\n * a\n */\n  const a = 1;\n\n  // b\n  /* c */\nfoo(a);\n'), 'const a = 1;\nfoo(a);');
assert.throws(() => stripCommentsAndSpace('const a = 1; // trailing\n'), /own line/);
assert.throws(() => stripCommentsAndSpace('/* a */ const a = 1;\n'), /code after a comment/);
assert.throws(() => stripCommentsAndSpace('/*\n * open\n'), /unterminated/);
const tmp = mkdtempSync(join(tmpdir(), 'mg-attr-bundle-'));
try {
  function bundleOf(files) {
    rmSync(tmp, { recursive: true, force: true });
    for (const [rel, text] of Object.entries(files)) {
      mkdirSync(dirname(join(tmp, rel)), { recursive: true });
      writeFileSync(join(tmp, rel), text);
    }
    return () => bundleMgAttr({ root: tmp, modules: Object.keys(files) });
  }
  assert.match(bundleOf({ 'a.mjs': 'export const a = 1;\n', 'b.mjs': "import { a } from './a.mjs';\nconst b = a + 1;\n" })(), /const a = 1;\nconst b = a \+ 1;/);
  assert.throws(bundleOf({ 'a.mjs': 'export const a = 1;\n', 'b.mjs': "import { a as c } from './a.mjs';\n" }), /unsupported import/);
  assert.throws(bundleOf({ 'a.mjs': 'export const a = 1;\n', 'b.mjs': "import { z } from './a.mjs';\n" }), /does not export z/);
  assert.throws(bundleOf({ 'b.mjs': "import { a } from './a.mjs';\n", 'a.mjs': 'export const a = 1;\n' }), /not an earlier bundled module/);
  assert.throws(bundleOf({ 'a.mjs': "import x from 'node:fs';\n" }), /unsupported import form/);
  assert.throws(bundleOf({ 'a.mjs': 'export default 1;\n' }), /only `export function`/);
  assert.throws(bundleOf({ 'a.mjs': 'const a = 1;\nexport { a };\n' }), /only `export function`/);
  assert.throws(bundleOf({ 'a.mjs': 'export function f() {}\n', 'b.mjs': 'function f() {}\n' }), /top-level name f/);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}

setTimeout(() => {
  assert.equal(resolved, true);
  console.log('marketing/mg-attr.test.mjs passed');
}, 40);
