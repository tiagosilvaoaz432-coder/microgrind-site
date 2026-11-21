(()=>{
"use strict";
const ATTRIBUTION_STORAGE_KEY = 'mg-attr';
const ATTR_LIMITS = {
source: 32,
medium: 64,
campaign: 120,
content: 120,
term: 120,
host: 253,
path: 200,
};
const CLICK_ID_SOURCES = [
['gclid', 'google'],
['gbraid', 'google'],
['wbraid', 'google'],
['dclid', 'google'],
['gad_source', 'google'],
['fbclid', 'facebook'],
['igshid', 'instagram'],
['msclkid', 'bing'],
['ttclid', 'tiktok'],
['twclid', 'x'],
['li_fat_id', 'linkedin'],
['epik', 'pinterest'],
['sccid', 'snapchat'],
['irclickid', 'impact'],
['mc_cid', 'mailchimp'],
['yclid', 'yahoo'],
];
const SOURCE_PATTERN = /^[a-z0-9_-]{1,32}$/;
const HOST_PATTERN = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/;
const PATH_PATTERN = /^\/[A-Za-z0-9/_.-]*$/;
const UTM_PARAM_NAMES = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
function stripControls(value) {
return value.replace(/[\u0000-\u001F\u007F]/g, '');
}
function clampSource(value) {
const cleaned = stripControls(value ?? '').trim().toLowerCase();
if (!cleaned) return 'direct';
if (SOURCE_PATTERN.test(cleaned)) return cleaned;
return 'other';
}
function looksLikeEmailOrPhone(value) {
if (value.includes('@')) return true;
const compact = value.replace(/[ ().-]/g, '');
if (!/^\+?\d{7,15}$/.test(compact)) return false;
if (value.includes('+') || value.includes('(') || value.includes(')')) return true;
if (/\d{7,}/.test(value)) return true;
if (/^\d{4}[-./]\d{1,2}[-./]\d{1,2}$/.test(value)) return false;
if (/^\d{1,2}[-./]\d{1,2}[-./]\d{4}$/.test(value)) return false;
return true;
}
function cleanText(value, max) {
if (value == null) return null;
const cleaned = stripControls(value).replace(/[<>]/g, '').trim();
if (!cleaned || looksLikeEmailOrPhone(cleaned)) return null;
return cleaned.slice(0, Math.max(0, max));
}
function cleanHost(value) {
if (value == null) return null;
const host = stripControls(value).trim().toLowerCase();
if (!host || host.length > ATTR_LIMITS.host) return null;
if (host === 'localhost') return host;
if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(host)) return null;
if (!HOST_PATTERN.test(host)) return null;
return host;
}
function cleanPath(value) {
if (value == null) return null;
const cut = stripControls(value).trim().split('?')[0]?.split('#')[0]?.slice(0, ATTR_LIMITS.path) ?? '';
if (!PATH_PATTERN.test(cut)) return null;
return cut;
}
function bareHost(host) {
return host.toLowerCase().replace(/^www\./, '');
}
function referrerHost(referrer, pageHost) {
if (!referrer) return null;
let url;
try {
url = new URL(referrer);
} catch {
return null;
}
if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
const host = cleanHost(url.hostname);
if (!host) return null;
if (bareHost(host) === bareHost(pageHost)) return null;
return host;
}
function paramsOf(search) {
const raw = search.startsWith('?') ? search.slice(1) : search;
return new URLSearchParams(raw);
}
function sourceFromClickIds(params) {
const present = new Set();
for (const [key, value] of params) {
if (value.trim()) present.add(key.toLowerCase());
}
for (const [name, source] of CLICK_ID_SOURCES) {
if (present.has(name)) return source;
}
return 'direct';
}
function parseAttribution(input) {
const params = paramsOf(input.search);
const rawSource = params.get('utm_source');
const hasUtmSource = rawSource != null && rawSource.trim() !== '';
const mgLand = cleanPath(params.get('mg_land'));
const mgRef = cleanHost(params.get('mg_ref'));
return {
source: hasUtmSource ? clampSource(rawSource) : sourceFromClickIds(params),
medium: cleanText(params.get('utm_medium'), ATTR_LIMITS.medium),
campaign: cleanText(params.get('utm_campaign'), ATTR_LIMITS.campaign),
content: cleanText(params.get('utm_content'), ATTR_LIMITS.content),
term: cleanText(params.get('utm_term'), ATTR_LIMITS.term),
referrer_host: mgRef ?? referrerHost(input.referrer, input.pageHost),
landing_path: mgLand ?? cleanPath(input.pathname),
};
}
function isAttribution(value) {
if (!value || typeof value !== 'object') return false;
return typeof value.source === 'string';
}
function sanitizeAttribution(value) {
return {
source: clampSource(value.source),
medium: cleanText(value.medium, ATTR_LIMITS.medium),
campaign: cleanText(value.campaign, ATTR_LIMITS.campaign),
content: cleanText(value.content, ATTR_LIMITS.content),
term: cleanText(value.term, ATTR_LIMITS.term),
referrer_host: cleanHost(value.referrer_host),
landing_path: cleanPath(value.landing_path),
};
}
function readStoredAttribution(storage) {
if (!storage) return null;
try {
const raw = storage.getItem(ATTRIBUTION_STORAGE_KEY);
if (!raw) return null;
const parsed = JSON.parse(raw);
if (!isAttribution(parsed)) return null;
return sanitizeAttribution(parsed);
} catch {
return null;
}
}
function writeStoredAttribution(storage, value) {
if (!storage) return;
try {
storage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(sanitizeAttribution(value)));
} catch {
}
}
function captureSessionAttribution(input) {
const existing = readStoredAttribution(input.storage);
if (existing) return existing;
const parsed = parseAttribution(input);
writeStoredAttribution(input.storage, parsed);
return parsed;
}
function isOurAppUrl(url, baseHref) {
if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
if (url.pathname !== '/app' && !url.pathname.startsWith('/app/')) return false;
let base;
try {
base = new URL(baseHref);
} catch {
return false;
}
return bareHost(url.hostname) === bareHost(base.hostname);
}
function withForwardedUtms(href, baseHref, attr) {
let url;
try {
url = new URL(href, baseHref);
} catch {
return href;
}
if (!isOurAppUrl(url, baseHref)) return href;
const before = url.search;
const set = (key, value) => {
if (!value || url.searchParams.has(key)) return;
url.searchParams.set(key, value);
};
const clean = sanitizeAttribution(attr);
if (clean.source !== 'direct') set('utm_source', clean.source);
set('utm_medium', clean.medium);
set('utm_campaign', clean.campaign);
set('utm_content', clean.content);
set('utm_term', clean.term);
set('mg_land', clean.landing_path);
set('mg_ref', clean.referrer_host);
if (url.search === before) return href;
return url.toString();
}
function forwardAppLinks(doc, baseHref, attr) {
for (const anchor of doc.querySelectorAll('a[href]')) {
const href = anchor.getAttribute('href');
if (!href) continue;
const next = withForwardedUtms(href, baseHref, attr);
if (next !== href) anchor.setAttribute('href', next);
}
}
function webHitPathGroup(pathname) {
const path = (pathname || '/').toLowerCase();
if (path === '/mapa-da-materia' || path.startsWith('/mapa-da-materia/')) return 'mapa';
if (path === '/en/subject-map' || path.startsWith('/en/subject-map/')) return 'mapa';
return 'site';
}
const WEB_HIT_RPC_PATH = '/rest/v1/rpc/record_web_hit';
function webHitDedupeKey(pathGroup, pathname) {
return `mg-hit:${pathGroup}:${pathname || '/'}`;
}
function claimWebHit(storage, key, stamp) {
if (!storage) return true;
try {
if (storage.getItem(key) === stamp) return false;
storage.setItem(key, stamp);
return true;
} catch {
return true;
}
}
function endpointUrl(base) {
const trimmed = base.trim().replace(/\/$/, '');
if (!/^https:\/\//i.test(trimmed)) return null;
return `${trimmed}${WEB_HIT_RPC_PATH}`;
}
function settle(result) {
if (!result || typeof result.then !== 'function') return;
void Promise.resolve(result).catch(() => undefined);
}
function recordWebHit(input) {
try {
const key = webHitDedupeKey(input.pathGroup, input.pathname);
if (!claimWebHit(input.storage, key, input.stamp || '1')) return;
const body = {
p_path_group: input.pathGroup,
p_source: clampSource(input.source),
};
if (input.post) {
try {
settle(input.post(body));
} catch {
}
return;
}
const target = input.endpoint;
if (!target?.url || !target.apiKey) return;
const url = endpointUrl(target.url);
if (!url) return;
const run = input.fetchImpl ?? fetch;
try {
settle(
run(url, {
method: 'POST',
headers: {
'Content-Type': 'application/json',
apikey: target.apiKey,
Authorization: `Bearer ${target.apiKey}`,
},
body: JSON.stringify(body),
keepalive: true,
credentials: 'omit',
mode: 'cors',
})
);
} catch {
}
} catch {
}
}
const APP_URL_ATTRS = ['data-web', 'data-ig-copy'];
function storageOf(win) {
try {
return win.sessionStorage ?? null;
} catch {
return null;
}
}
function rewriteNamedUrl(el, name, baseHref, attr) {
const href = el.getAttribute(name);
if (!href) return;
const next = withForwardedUtms(href, baseHref, attr);
if (next !== href) el.setAttribute(name, next);
}
function rewriteAppUrlAttributes(doc, baseHref, attr) {
for (const name of APP_URL_ATTRS) {
for (const el of doc.querySelectorAll(`[${name}]`)) {
rewriteNamedUrl(el, name, baseHref, attr);
}
}
}
function documentStamp(win) {
try {
return String(win.performance?.timeOrigin ?? 'site');
} catch {
return 'site';
}
}
function bootSiteAttribution(win) {
try {
const attr = captureSessionAttribution({
storage: storageOf(win),
search: win.location.search,
referrer: win.document.referrer,
pathname: win.location.pathname,
pageHost: win.location.hostname,
});
const baseHref = win.location.href;
forwardAppLinks(win.document, baseHref, attr);
rewriteAppUrlAttributes(win.document, baseHref, attr);
win.document.addEventListener(
'click',
(event) => {
const target = event.target;
const anchor = target?.closest?.('a[href]');
if (anchor) rewriteNamedUrl(anchor, 'href', baseHref, attr);
const carrier = target?.closest?.('[data-web], [data-ig-copy]');
if (!carrier) return;
for (const name of APP_URL_ATTRS) rewriteNamedUrl(carrier, name, baseHref, attr);
},
true
);
const hit = win.__MG_HIT__;
recordWebHit({
pathGroup: webHitPathGroup(win.location.pathname),
source: attr.source,
pathname: win.location.pathname,
stamp: documentStamp(win),
storage: storageOf(win),
endpoint: hit?.url && hit.key ? { url: hit.url, apiKey: hit.key } : null,
fetchImpl: typeof win.fetch === 'function' ? win.fetch.bind(win) : undefined,
});
} catch {
}
}
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
bootSiteAttribution(window);
}
})();
