/**
 * Confirms what the site copied from the app still matches it:
 *   - lib/app-limits.mjs and lib/ga4.mjs (plan numbers, GA4 / pixel IDs);
 *   - lib/attribution.mjs and lib/web-hit.mjs (mg-attr.js) against the app's lib/attribution.ts and
 *     lib/web-hit.ts: constants, patterns, and the same output for a set of tricky inputs;
 *   - the cleaning rules against the SQL helpers in the app's migrations (private.ads_clamp_source,
 *     ads_clean_text, ads_clean_host, ads_clean_path) and record_web_hit accepting "site" and "mapa";
 *   - the cookie banner (chrome.mjs) against the app's cookieBanner in locales/<pt-PT|en>/common.json.
 * Run from the publish workflow with the app checkout:
 *   node scripts/check-app-parity.mjs <path-to-MicroGrind/appfiles>
 * Needs Node.js with TypeScript type stripping and module.registerHooks (22.18+ or 24).
 */
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { registerHooks } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { EXAM_SIMULATIONS, TUTOR_AVERAGE_MESSAGE_TOKENS, TUTOR_PLAN_TOKEN_WINDOWS } from '../lib/app-limits.mjs';
import * as siteAttr from '../lib/attribution.mjs';
import { GA4_CONSENT_KEY, GA4_MEASUREMENT_ID_PRODUCTION, OAIQ_PIXEL_ID } from '../lib/ga4.mjs';
import * as siteHit from '../lib/web-hit.mjs';
import { COOKIES } from '../marketing/chrome.mjs';

const appRoot = process.argv[2];
if (!appRoot) {
  console.error('Usage: node scripts/check-app-parity.mjs <path-to-appfiles>');
  process.exit(2);
}

// The app's lib files import each other without an extension (`from './attribution'`).
registerHooks({
  resolve(specifier, context, nextResolve) {
    try {
      return nextResolve(specifier, context);
    } catch (error) {
      if (error?.code !== 'ERR_MODULE_NOT_FOUND' || !/^\.\.?\//.test(specifier) || path.extname(specifier)) throw error;
      return nextResolve(`${specifier}.ts`, context);
    }
  },
});

function appFile(rel) {
  const file = path.resolve(appRoot, rel);
  if (!existsSync(file)) {
    throw new Error(`The app checkout has no ${rel}. The site's copy depends on it (for attribution: MicroGrind PR #255).`);
  }
  return file;
}
const load = (rel) => import(pathToFileURL(appFile(rel)).href);

const budget = await load('lib/tutor-message-budget.ts');
const exams = await load('supabase/functions/_shared/ai-exam/limits.ts');
const ga4 = await load('lib/ga4.ts');
const oaiq = await load('lib/oaiq.ts');

assert.equal(TUTOR_AVERAGE_MESSAGE_TOKENS, budget.TUTOR_AVERAGE_MESSAGE_TOKENS, 'tutor message divisor');
assert.deepEqual(TUTOR_PLAN_TOKEN_WINDOWS, { ...budget.TUTOR_PLAN_TOKEN_WINDOWS }, 'tutor token windows');
assert.deepEqual(
  EXAM_SIMULATIONS,
  Object.fromEntries(Object.entries(exams.EXAM_SIMULATION_ALLOWANCE).map(([code, v]) => [code, v.simulations])),
  'exam simulations'
);
assert.equal(GA4_MEASUREMENT_ID_PRODUCTION, ga4.GA4_MEASUREMENT_ID_PRODUCTION, 'GA4 measurement ID');
assert.equal(GA4_CONSENT_KEY, ga4.GA4_CONSENT_KEY, 'consent key');
assert.equal(OAIQ_PIXEL_ID, oaiq.OAIQ_PIXEL_ID, 'OpenAI pixel ID');

// ---------- Attribution (lib/attribution.mjs ↔ app lib/attribution.ts) ----------
const appAttr = await load('lib/attribution.ts');
const appHit = await load('lib/web-hit.ts');

assert.equal(siteAttr.ATTRIBUTION_STORAGE_KEY, appAttr.ATTRIBUTION_STORAGE_KEY, 'attribution storage key');
assert.deepEqual(siteAttr.ATTR_LIMITS, { ...appAttr.ATTR_LIMITS }, 'attribution limits');
assert.deepEqual(siteAttr.CLICK_ID_SOURCES, appAttr.CLICK_ID_SOURCES.map((pair) => [...pair]), 'click id sources');
assert.deepEqual(siteAttr.UTM_PARAM_NAMES, [...appAttr.UTM_PARAM_NAMES], 'utm names');

const appAttrSource = readFileSync(appFile('lib/attribution.ts'), 'utf8');
for (const name of ['SOURCE_PATTERN', 'HOST_PATTERN', 'PATH_PATTERN']) {
  const match = appAttrSource.match(new RegExp(`const ${name}\\s*=\\s*\\/(.+)\\/([a-z]*);`));
  assert.ok(match, `app lib/attribution.ts defines ${name}`);
  assert.equal(siteAttr[name].source, match[1], `${name} pattern`);
  assert.equal(siteAttr[name].flags, match[2], `${name} flags`);
}

/** Same output from the site copy and the app for every input. */
function same(label, siteFn, appFn, inputs) {
  for (const args of inputs) {
    const shown = args.map((arg) => JSON.stringify(arg)?.slice(0, 80)).join(', ');
    assert.deepEqual(siteFn(...args), appFn(...args), `${label}(${shown}) differs from the app`);
  }
}

const TEXTS = [
  null,
  undefined,
  '',
  '   ',
  'ChatGPT',
  ' chatgpt ',
  'chat gpt',
  'google_ads-1',
  'a'.repeat(32),
  'a'.repeat(33),
  'x\u0000y\u001Fz\u007F',
  'Hello\nWorld',
  'Ünïcode',
  '<b>bold</b>',
  '<>',
  'ana@example.com',
  'hello ana@example.com there',
  '+351 912 345 678',
  '912345678',
  '(415) 555-1212',
  '415-555-1212',
  '415.555.1212',
  '1234567',
  '123456',
  '12.34.56',
  '2026-11-10',
  '2026.11.10',
  '10/11/2026',
  '1/2/2026',
  '2026-11-10-1',
  'summer-2026',
  'z'.repeat(150),
  'localhost',
  'LOCALHOST',
  '192.168.0.1',
  '1.2.3',
  '999.999.999.999',
  'www.google.com',
  'ChatGPT.com',
  'chatgpt.com.',
  '-bad.com',
  'bad-.com',
  'a..b',
  'xn--bcher-kva.example',
  `${'a'.repeat(63)}.com`,
  `${'a'.repeat(64)}.com`,
  `${'a.'.repeat(126)}com`,
  'https://evil.com/path',
  '/mapa-da-materia/',
  '/mapa-da-materia',
  '/MAPA-DA-MATERIA/',
  '/en/subject-map/x',
  '/app/?x=1#y',
  '/app/auth/confirm?token=secret',
  '#only-hash',
  '?only=query',
  'javascript:alert(1)',
  '/a b',
  '/ç',
  `/${'p'.repeat(250)}`,
  `/${'p'.repeat(199)}`,
  '\t/x\n',
  '/',
  'relative/path',
];
same('clampSource', siteAttr.clampSource, appAttr.clampSource, TEXTS.map((t) => [t]));
for (const max of [0, 5, 64, 120]) same('cleanText', siteAttr.cleanText, appAttr.cleanText, TEXTS.map((t) => [t, max]));
same('cleanHost', siteAttr.cleanHost, appAttr.cleanHost, TEXTS.map((t) => [t]));
same('cleanPath', siteAttr.cleanPath, appAttr.cleanPath, TEXTS.map((t) => [t]));
same('webHitPathGroup', siteAttr.webHitPathGroup, appAttr.webHitPathGroup, TEXTS.filter((t) => typeof t === 'string').map((t) => [t]));

const HOSTS = ['microgrind.app', 'www.microgrind.app', 'preview.microgrind.pages.dev', 'localhost'];
const REFERRERS = [
  '',
  'https://www.google.com/search?q=secret',
  'https://chatgpt.com/share/private-token',
  'http://news.ycombinator.com/item?id=1',
  'https://www.microgrind.app/planos/',
  'https://microgrind.app/',
  'https://192.168.0.1/a',
  'https://1.2.3/a',
  'javascript:alert(1)',
  'ftp://files.example.com/',
  'not a url',
  'https://user:pw@evil.example:8443/x',
  'android-app://com.google.android.gm/',
];
same('referrerHost', siteAttr.referrerHost, appAttr.referrerHost, REFERRERS.flatMap((r) => HOSTS.map((h) => [r, h])));

const SEARCHES = [
  '',
  '?',
  'utm_source=no-question-mark',
  '?utm_source=chatgpt',
  '?utm_source=ChatGPT&utm_medium=cpc&utm_campaign=mapa&utm_content=banner&utm_term=estudar',
  '?utm_source=not a source&fbclid=SECRET',
  '?utm_source=&gclid=SECRET',
  '?utm_source=%20&msclkid=1',
  '?utm_source=chatgpt&utm_source=other',
  '?GCLID=1',
  '?gclid=',
  '?gclid=%20',
  '?fbclid=1&gclid=2',
  ...siteAttr.CLICK_ID_SOURCES.map(([name]) => `?${name}=SECRET`),
  '?mg_land=/mapa-da-materia/&mg_ref=chatgpt.com',
  '?mg_land=javascript:x&mg_ref=1.2.3.4',
  '?mg_land=%2Fplanos%2F%3Fx%3D1&mg_ref=WWW.Google.com',
  '?utm_medium=ana@example.com&utm_term=%2B351912345678&utm_content=2026-11-10',
  `?utm_campaign=${'z'.repeat(150)}`,
  '?utm_campaign=%3Cscript%3E',
  '?utm_medium=%00cpc%0A',
];
const PATHS = ['/', '/mapa-da-materia/', '/app/', '/a b', ''];
const captures = SEARCHES.flatMap((search) =>
  REFERRERS.slice(0, 6).flatMap((referrer) => PATHS.map((pathname) => ({ search, referrer, pathname, pageHost: 'microgrind.app' })))
);
same('parseAttribution', siteAttr.parseAttribution, appAttr.parseAttribution, captures.map((c) => [c]));

const attrs = [
  ...SEARCHES.map((search) => siteAttr.parseAttribution({ search, referrer: 'https://www.google.com/', pathname: '/mapa-da-materia/', pageHost: 'microgrind.app' })),
  { source: 'direct', medium: null, campaign: null, content: null, term: null, referrer_host: null, landing_path: null },
  { source: 'Bad Source!', medium: 'ana@example.com', campaign: '<x>', content: 'y'.repeat(300), term: '912345678', referrer_host: 'https://evil.com', landing_path: 'javascript:x' },
  { source: 'CHATGPT', medium: ' cpc ', campaign: null, content: undefined, term: '', referrer_host: 'ChatGPT.com', landing_path: '/x?y#z' },
];
same('sanitizeAttribution', siteAttr.sanitizeAttribution, appAttr.sanitizeAttribution, attrs.map((a) => [a]));

const HREFS = [
  'https://microgrind.app/app/',
  'https://microgrind.app/app',
  'https://microgrind.app/app/register?utm_source=praticar&utm_medium=seo&utm_campaign=x',
  'https://microgrind.app/app/plans',
  'https://www.microgrind.app/app/',
  'http://microgrind.app/app/',
  'https://microgrind.app:8443/app/',
  '//microgrind.app/app/',
  '/app/',
  '/app',
  'app/',
  '../app/',
  '/app/?mg_land=/x&mg_ref=y.com',
  '/app/#top',
  '/application/',
  '/planos/',
  'https://evil.example/app/',
  'https://microgrind.app.evil.example/app/',
  'mailto:ola@microgrind.app',
  'javascript:alert(1)',
  '#top',
  '',
];
const BASES = [
  'https://microgrind.app/mapa-da-materia/?utm_source=chatgpt',
  'https://www.microgrind.app/',
  'https://preview.microgrind.pages.dev/sobre/',
  'not a url',
];
same('withForwardedUtms', siteAttr.withForwardedUtms, appAttr.withForwardedUtms, HREFS.flatMap((href) => BASES.flatMap((base) => attrs.map((attr) => [href, base, attr]))));

function forwardedHrefs(impl, base, attr) {
  const rows = HREFS.map((href) => ({ href }));
  const doc = {
    querySelectorAll: () =>
      rows.map((row) => ({
        getAttribute: () => row.href || null,
        setAttribute: (_name, value) => {
          row.href = value;
        },
      })),
  };
  impl.forwardAppLinks(doc, base, attr);
  return rows.map((row) => row.href);
}
for (const base of BASES) {
  for (const attr of attrs) assert.deepEqual(forwardedHrefs(siteAttr, base, attr), forwardedHrefs(appAttr, base, attr), `forwardAppLinks(${base})`);
}

function memory(entries = []) {
  const data = new Map(entries);
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
    removeItem: (key) => {
      data.delete(key);
    },
  };
}
// Same tab, same origin: the app reads what the site stored, so the stored JSON must match too.
const STORED = [
  null,
  '{',
  '"text"',
  '{"source":1}',
  JSON.stringify({ source: 'chatgpt', landing_path: '/mapa-da-materia/' }),
  JSON.stringify(attrs.at(-2)),
];
for (const stored of STORED) {
  for (const capture of captures.filter((_, index) => index % 7 === 0)) {
    const key = siteAttr.ATTRIBUTION_STORAGE_KEY;
    const siteStore = memory(stored == null ? [] : [[key, stored]]);
    const appStore = memory(stored == null ? [] : [[key, stored]]);
    const label = `captureSessionAttribution(${stored}, ${capture.search})`;
    assert.deepEqual(siteAttr.captureSessionAttribution({ ...capture, storage: siteStore }), appAttr.captureSessionAttribution({ ...capture, storage: appStore }), label);
    assert.deepEqual([...siteStore.data], [...appStore.data], `${label}: stored value`);
    assert.deepEqual(appAttr.readStoredAttribution(siteStore), siteAttr.readStoredAttribution(siteStore), `${label}: the app reads the site's value`);
  }
}

// ---------- Visit counter (lib/web-hit.mjs ↔ app lib/web-hit.ts) ----------
function hitRun(impl, input) {
  const calls = [];
  const posts = [];
  const storage = memory();
  for (let n = 0; n < 2; n += 1) {
    impl.recordWebHit({
      ...input,
      storage: input.storage === null ? null : storage,
      fetchImpl: (url, init) => {
        calls.push([url, init]);
        return Promise.resolve(null);
      },
      post: input.usePost ? (body) => posts.push(body) : undefined,
    });
  }
  return { calls, posts, stored: [...storage.data] };
}
const ENDPOINTS = [
  null,
  { url: 'https://project.example.test', apiKey: 'anon' },
  { url: ' https://project.example.test/ ', apiKey: 'anon' },
  { url: 'http://project.example.test', apiKey: 'anon' },
  { url: 'https://project.example.test', apiKey: '' },
  { url: '', apiKey: 'anon' },
];
for (const pathGroup of ['site', 'mapa', 'app']) {
  for (const source of ['ChatGPT', '', 'bad source', null]) {
    for (const [pathname, stamp] of [['/', '1'], ['', ''], ['/mapa-da-materia/', '1700000000000.5']]) {
      for (const endpoint of ENDPOINTS) {
        for (const extra of [{}, { usePost: true }, { storage: null }]) {
          const input = { pathGroup, source, pathname, stamp, endpoint, ...extra };
          assert.deepEqual(hitRun(siteHit, input), hitRun(appHit, input), `recordWebHit(${JSON.stringify(input)})`);
        }
      }
    }
  }
}
for (const [group, pathname] of [['site', '/'], ['mapa', ''], ['app', '/app/x']]) {
  assert.equal(siteHit.webHitDedupeKey(group, pathname), appHit.webHitDedupeKey(group, pathname), 'web hit dedupe key');
}

// ---------- Database rules (latest definition of each function in supabase/migrations) ----------
const migrationsDir = appFile('supabase/migrations');
const migrations = readdirSync(migrationsDir)
  .filter((name) => name.endsWith('.sql'))
  .sort()
  .map((name) => readFileSync(path.join(migrationsDir, name), 'utf8'));
function latestFunction(qualified) {
  const re = new RegExp(`create\\s+or\\s+replace\\s+function\\s+${qualified.replace('.', '\\.')}\\s*\\(([\\s\\S]*?)\\$\\$\\s*;`, 'gi');
  let body = null;
  for (const sql of migrations) for (const match of sql.matchAll(re)) body = match[1];
  assert.ok(body, `no migration defines ${qualified}`);
  return body;
}
const { ATTR_LIMITS, HOST_PATTERN, PATH_PATTERN, SOURCE_PATTERN } = siteAttr;
const SQL_RULES = {
  'private.ads_clamp_source': [`'${SOURCE_PATTERN.source}'`, "then 'direct'", "else 'other'", "'[[:cntrl:]]'", 'lower(btrim('],
  // cleanText / looksLikeEmailOrPhone, with \d written as [0-9].
  'private.ads_clean_text': [
    "position('@' in v) > 0",
    "'[ ().-]'",
    String.raw`'^\+?[0-9]{7,15}$'`,
    "'[0-9]{7,}'",
    "'^[0-9]{4}[-./][0-9]{1,2}[-./][0-9]{1,2}$'",
    "'^[0-9]{1,2}[-./][0-9]{1,2}[-./][0-9]{4}$'",
    "'[<>]'",
    "'[[:cntrl:]]'",
    'left(v, greatest(p_max, 0))',
  ],
  // The database drops any all-digits-and-dots host; the app (and this copy) drop dotted quads,
  // and the host pattern rejects the rest that matter. Update both sides together.
  'private.ads_clean_host': [`'${HOST_PATTERN.source}'`, `char_length(v) <= ${ATTR_LIMITS.host}`, "v = 'localhost'", "'^[0-9.]+$'", 'lower(btrim('],
  'private.ads_clean_path': [`'${PATH_PATTERN.source.replace('\\/', '/').replace(/\*\$$/, `{0,${ATTR_LIMITS.path - 1}}$`)}'`, `${ATTR_LIMITS.path}\n`, "'?'", "'#'", "'[[:cntrl:]]'"],
  'private.capture_signup_attribution': [
    'private.ads_clamp_source(',
    ...['medium', 'campaign', 'content', 'term'].map((field) => `private.ads_clean_text(p_meta ->> 'attr_${field}', ${ATTR_LIMITS[field]})`),
    "private.ads_clean_host(p_meta ->> 'attr_referrer_host')",
    "private.ads_clean_path(p_meta ->> 'attr_landing_path')",
  ],
  'public.record_web_hit': ['private.ads_clamp_source(p_source)', "v_group not in ('site', 'mapa', 'app')"],
};
for (const [fn, fragments] of Object.entries(SQL_RULES)) {
  const body = latestFunction(fn);
  for (const fragment of fragments) assert.ok(body.includes(fragment), `${fn} no longer has ${JSON.stringify(fragment)}; update lib/attribution.mjs and this check`);
}
const sqlGroups = latestFunction('public.record_web_hit').match(/v_group not in \(([^)]*)\)/)[1];
for (const group of new Set(['/', '/mapa-da-materia/'].map(siteAttr.webHitPathGroup))) {
  assert.ok(sqlGroups.includes(`'${group}'`), `record_web_hit accepts path group ${group}`);
}

// ---------- Cookie banner (chrome.mjs ↔ app cookieBanner) ----------
for (const [locale, folder] of [['pt', 'pt-PT'], ['en', 'en']]) {
  const banner = JSON.parse(readFileSync(appFile(`locales/${folder}/common.json`), 'utf8')).cookieBanner;
  assert.ok(banner, `app locales/${folder}/common.json has cookieBanner`);
  for (const field of ['label', 'text', 'policy', 'accept', 'decline']) {
    assert.equal(COOKIES[locale][field], banner[field], `cookie banner ${locale}.${field}`);
  }
}

console.log('Site numbers, attribution and counter rules, SQL helpers and cookie banner match the app.');
