/** Port of the app's lib/attribution.test.ts (the parts the site uses), plus the site's path groups. */
import assert from 'node:assert/strict';

import {
  ATTRIBUTION_STORAGE_KEY,
  captureSessionAttribution,
  clampSource,
  cleanHost,
  cleanPath,
  cleanText,
  forwardAppLinks,
  parseAttribution,
  readStoredAttribution,
  referrerHost,
  webHitPathGroup,
  withForwardedUtms,
} from './attribution.mjs';

function memory() {
  const data = new Map();
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

const empty = { source: 'direct', medium: null, campaign: null, content: null, term: null, referrer_host: null, landing_path: null };

function parse(search, extra = {}) {
  return parseAttribution({
    search,
    referrer: extra.referrer ?? '',
    pathname: extra.pathname ?? '/mapa-da-materia/',
    pageHost: extra.pageHost ?? 'microgrind.app',
  });
}

assert.equal(clampSource('ChatGPT'), 'chatgpt');
assert.equal(clampSource(''), 'direct');
assert.equal(clampSource('   '), 'direct');
assert.equal(clampSource(null), 'direct');
assert.equal(clampSource('not a source'), 'other');
assert.equal(clampSource('gclid-secret-' + 'x'.repeat(40)), 'other');
assert.equal(clampSource('Hello\nWorld'), 'helloworld');

assert.equal(cleanText('  banner <x> ', 120), 'banner x');
assert.equal(cleanText('hello\nworld', 120), 'helloworld');
assert.equal(cleanText('z'.repeat(150), 120)?.length, 120);
assert.equal(cleanText('   ', 64), null);
assert.equal(cleanText(null, 64), null);
assert.equal(cleanText('ana@example.com', 64), null);
assert.equal(cleanText('hello ana@example.com there', 120), null);
assert.equal(cleanText('+351 912 345 678', 64), null);
assert.equal(cleanText('912345678', 64), null);
assert.equal(cleanText('(415) 555-1212', 64), null);
assert.equal(cleanText('415-555-1212', 64), null);
assert.equal(cleanText('summer-2026', 64), 'summer-2026');
assert.equal(cleanText('2026-11-10', 64), '2026-11-10');
assert.equal(cleanText('10/11/2026', 64), '10/11/2026');

assert.equal(cleanHost('ChatGPT.com'), 'chatgpt.com');
assert.equal(cleanHost('localhost'), 'localhost');
assert.equal(cleanHost('192.168.0.1'), null);
assert.equal(cleanHost('https://evil.com/path'), null);
assert.equal(cleanHost('a'.repeat(250) + '.com'), null, 'longer than 253 characters');
assert.equal(cleanPath('/mapa-da-materia/?utm_source=chatgpt#top'), '/mapa-da-materia/');
assert.equal(cleanPath('javascript:alert(1)'), null);
assert.equal(cleanPath('/app/auth/confirm?token=secret'), '/app/auth/confirm');
assert.equal(cleanPath('/' + 'a'.repeat(300))?.length, 200);

assert.equal(referrerHost('https://www.google.com/search?q=secret', 'microgrind.app'), 'www.google.com');
assert.equal(referrerHost('https://www.microgrind.app/planos/', 'microgrind.app'), null);
assert.equal(referrerHost('https://192.168.0.1/a', 'microgrind.app'), null);
assert.equal(referrerHost('javascript:alert(1)', 'microgrind.app'), null);

const fromAd = parse('?utm_source=ChatGPT&utm_medium=cpc&utm_campaign=' + 'z'.repeat(150) + '&gclid=SECRET', {
  referrer: 'https://chatgpt.com/share/private-token',
});
assert.equal(fromAd.source, 'chatgpt');
assert.equal(fromAd.medium, 'cpc');
assert.equal(fromAd.campaign?.length, 120);
assert.equal(fromAd.referrer_host, 'chatgpt.com');
assert.equal(fromAd.landing_path, '/mapa-da-materia/');
assert.equal(JSON.stringify(fromAd).includes('SECRET'), false);
assert.equal(JSON.stringify(fromAd).includes('private-token'), false);

const fromClick = parse('?gclid=SECRET');
assert.equal(fromClick.source, 'google');
assert.equal(JSON.stringify(fromClick).includes('SECRET'), false);
assert.equal(parse('?FBCLID=x').source, 'facebook', 'click id names are case-insensitive');
assert.equal(parse('?gclid=').source, 'direct', 'an empty click id is ignored');

const utmWins = parse('?utm_source=not a source&fbclid=SECRET');
assert.equal(utmWins.source, 'other');
assert.equal(JSON.stringify(utmWins).includes('SECRET'), false);

const direct = parse('', { referrer: 'https://news.ycombinator.com/item?id=1', pathname: '/' });
assert.equal(direct.source, 'direct');
assert.equal(direct.referrer_host, 'news.ycombinator.com');
assert.equal(direct.landing_path, '/');

const forwarded = parse('?mg_land=/mapa-da-materia/&mg_ref=chatgpt.com', { pathname: '/app/', referrer: '' });
assert.equal(forwarded.landing_path, '/mapa-da-materia/');
assert.equal(forwarded.referrer_host, 'chatgpt.com');

// First touch wins in the tab; the stored value is the same JSON the app reads (same origin).
const store = memory();
const first = captureSessionAttribution({
  storage: store,
  search: '?utm_source=chatgpt',
  referrer: '',
  pathname: '/mapa-da-materia/',
  pageHost: 'microgrind.app',
});
const second = captureSessionAttribution({
  storage: store,
  search: '?utm_source=partner',
  referrer: 'https://evil.example/',
  pathname: '/planos/',
  pageHost: 'microgrind.app',
});
assert.equal(first.source, 'chatgpt');
assert.equal(second.source, 'chatgpt');
assert.equal(second.landing_path, '/mapa-da-materia/');
assert.deepEqual(JSON.parse(store.getItem(ATTRIBUTION_STORAGE_KEY)), { ...empty, source: 'chatgpt', landing_path: '/mapa-da-materia/' });
assert.deepEqual(readStoredAttribution(store), first);

const broken = memory();
broken.setItem(ATTRIBUTION_STORAGE_KEY, '{');
const recovered = captureSessionAttribution({ storage: broken, search: '?utm_source=partner', referrer: '', pathname: '/', pageHost: 'microgrind.app' });
assert.equal(recovered.source, 'partner');

const tampered = memory();
tampered.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify({ source: 'Bad Source!', medium: 'ana@example.com', landing_path: 'javascript:x' }));
assert.deepEqual(readStoredAttribution(tampered), { ...empty, source: 'other' }, 'a stored value is cleaned again before use');

const throwing = {
  getItem() {
    throw new Error('blocked');
  },
  setItem() {
    throw new Error('blocked');
  },
  removeItem() {},
};
assert.equal(captureSessionAttribution({ storage: throwing, search: '?utm_source=chatgpt', referrer: '', pathname: '/', pageHost: 'microgrind.app' }).source, 'chatgpt');
assert.equal(captureSessionAttribution({ storage: null, search: '', referrer: '', pathname: '/', pageHost: 'microgrind.app' }).source, 'direct');

const base = 'https://microgrind.app/mapa-da-materia/?utm_source=chatgpt';
const appHref = 'https://microgrind.app/app/';
const rewritten = withForwardedUtms(appHref, base, fromAd);
assert.match(rewritten, /utm_source=chatgpt/);
assert.match(rewritten, /utm_medium=cpc/);
assert.match(rewritten, /mg_land=%2Fmapa-da-materia%2F|mg_land=\/mapa-da-materia\//);
assert.match(rewritten, /mg_ref=chatgpt\.com/);
assert.equal(rewritten.includes('SECRET'), false);
assert.equal(rewritten.includes('gclid'), false);

const kept = withForwardedUtms('https://microgrind.app/app/?utm_source=keep', base, fromAd);
assert.match(kept, /utm_source=keep/);
assert.equal(kept.includes('utm_source=chatgpt'), false);
assert.match(kept, /utm_medium=cpc/);

assert.equal(withForwardedUtms('https://microgrind.app/planos/', base, fromAd), 'https://microgrind.app/planos/');
assert.equal(withForwardedUtms('https://microgrind.app/application/', base, fromAd), 'https://microgrind.app/application/');
assert.equal(withForwardedUtms('https://evil.example/app/', base, fromAd), 'https://evil.example/app/');
assert.equal(withForwardedUtms('/sobre/', base, fromAd), '/sobre/');
assert.equal(withForwardedUtms('mailto:ola@microgrind.app', base, fromAd), 'mailto:ola@microgrind.app');
assert.match(withForwardedUtms('/app/register', base, fromAd), /^https:\/\/microgrind\.app\/app\/register\?utm_source=chatgpt/);

const wwwApp = withForwardedUtms('https://www.microgrind.app/app', 'https://microgrind.app/', fromAd);
assert.match(wwwApp, /utm_source=chatgpt/);

assert.equal(withForwardedUtms(appHref, base, empty), appHref);

const directVisit = parse('', { referrer: 'https://www.google.com/search?q=secret', pathname: '/' });
const directLink = withForwardedUtms('/app/', 'https://microgrind.app/', directVisit);
assert.equal(directLink.includes('utm_source='), false);
assert.match(directLink, /mg_ref=www\.google\.com/);
assert.equal(directLink.includes('secret'), false);

const anchors = [{ href: 'https://microgrind.app/app/' }, { href: 'https://microgrind.app/planos/' }, { href: null }];
forwardAppLinks(
  {
    querySelectorAll: () =>
      anchors.map((row) => ({
        getAttribute: () => row.href,
        setAttribute: (_name, value) => {
          row.href = value;
        },
      })),
  },
  base,
  fromAd
);
assert.match(anchors[0]?.href ?? '', /utm_source=chatgpt/);
assert.equal(anchors[1]?.href, 'https://microgrind.app/planos/');
assert.equal(anchors[2]?.href, null);

// The ad landing pages count as "mapa"; everything else on the site as "site".
assert.equal(webHitPathGroup('/mapa-da-materia/'), 'mapa');
assert.equal(webHitPathGroup('/mapa-da-materia'), 'mapa');
assert.equal(webHitPathGroup('/MAPA-DA-MATERIA/'), 'mapa');
assert.equal(webHitPathGroup('/en/subject-map/'), 'mapa');
assert.equal(webHitPathGroup('/en/subject-map'), 'mapa');
assert.equal(webHitPathGroup('/mapa-da-materia-extra/'), 'site');
assert.equal(webHitPathGroup('/planos/'), 'site');
assert.equal(webHitPathGroup('/en/'), 'site');
assert.equal(webHitPathGroup('/'), 'site');
assert.equal(webHitPathGroup(''), 'site');

console.log('lib/attribution.test.mjs passed');
