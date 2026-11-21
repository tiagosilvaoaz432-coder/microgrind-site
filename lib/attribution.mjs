/**
 * First-touch ad attribution for one browser tab. Copy of the parts of the app's lib/attribution.ts
 * that the site pages use (mg-attr.js). Keep the cleaning rules identical: scripts/check-app-parity.mjs
 * compares this file with the app and with the SQL helpers (private.ads_clamp_source, ads_clean_text,
 * ads_clean_host, ads_clean_path) when the publish workflow passes the app checkout.
 *
 * Reads utm_* and the presence of known ad click ids. Click-id values are
 * cross-site identifiers, so they are never stored or forwarded. The only
 * leftover is a source name such as "google" or "chatgpt". Referrer is kept
 * as a hostname. Nothing here is written to a cookie or to localStorage:
 * only sessionStorage['mg-attr'], which the app (same origin) reads too.
 *
 * Browser code: plain ES2020, no dependencies. marketing/bundle-mg-attr.mjs bundles it.
 */

export const ATTRIBUTION_STORAGE_KEY = 'mg-attr';

export const ATTR_LIMITS = {
  source: 32,
  medium: 64,
  campaign: 120,
  content: 120,
  term: 120,
  host: 253,
  path: 200,
};

/** Parameter name (lowercase) → source label. The parameter value is ignored. */
export const CLICK_ID_SOURCES = [
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

export const SOURCE_PATTERN = /^[a-z0-9_-]{1,32}$/;
export const HOST_PATTERN = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/;
export const PATH_PATTERN = /^\/[A-Za-z0-9/_.-]*$/;

export const UTM_PARAM_NAMES = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

function stripControls(value) {
  return value.replace(/[\u0000-\u001F\u007F]/g, '');
}

/** Same rules as private.ads_clamp_source. */
export function clampSource(value) {
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

/**
 * Same rules as private.ads_clean_text.
 * An email (any @) or a phone-shaped value is dropped. A calendar date such as 2026-11-10 is kept.
 */
export function cleanText(value, max) {
  if (value == null) return null;
  const cleaned = stripControls(value).replace(/[<>]/g, '').trim();
  if (!cleaned || looksLikeEmailOrPhone(cleaned)) return null;
  return cleaned.slice(0, Math.max(0, max));
}

/** Same rules as private.ads_clean_host. A URL is rejected; pass a hostname. */
export function cleanHost(value) {
  if (value == null) return null;
  const host = stripControls(value).trim().toLowerCase();
  if (!host || host.length > ATTR_LIMITS.host) return null;
  if (host === 'localhost') return host;
  if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(host)) return null;
  if (!HOST_PATTERN.test(host)) return null;
  return host;
}

/** Same rules as private.ads_clean_path. Query and hash are dropped. */
export function cleanPath(value) {
  if (value == null) return null;
  const cut = stripControls(value).trim().split('?')[0]?.split('#')[0]?.slice(0, ATTR_LIMITS.path) ?? '';
  if (!PATH_PATTERN.test(cut)) return null;
  return cut;
}

function bareHost(host) {
  return host.toLowerCase().replace(/^www\./, '');
}

export function referrerHost(referrer, pageHost) {
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

/** @param {{ search: string, referrer: string, pathname: string, pageHost: string }} input */
export function parseAttribution(input) {
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

/** Re-applies the length and character limits before the value is trusted. */
export function sanitizeAttribution(value) {
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

export function readStoredAttribution(storage) {
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

export function writeStoredAttribution(storage, value) {
  if (!storage) return;
  try {
    storage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(sanitizeAttribution(value)));
  } catch {
    /* Private mode: the visit still works, this tab just won't remember. */
  }
}

/**
 * First touch in this tab wins. A later URL does not replace it.
 * @param {{ storage: Storage | null, search: string, referrer: string, pathname: string, pageHost: string }} input
 */
export function captureSessionAttribution(input) {
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

/**
 * Adds the tab's utm params (and the landing path / referrer host) to an
 * /app/ link on the same host. Existing params on the link are left as they
 * are. Click ids are not copied.
 */
export function withForwardedUtms(href, baseHref, attr) {
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

/** Rewrites every same-host a[href] that points at /app or /app/…. */
export function forwardAppLinks(doc, baseHref, attr) {
  for (const anchor of doc.querySelectorAll('a[href]')) {
    const href = anchor.getAttribute('href');
    if (!href) continue;
    const next = withForwardedUtms(href, baseHref, attr);
    if (next !== href) anchor.setAttribute('href', next);
  }
}

/** /mapa-da-materia/… and /en/subject-map/… (the ad landing pages) count as "mapa", the rest as "site". */
export function webHitPathGroup(pathname) {
  const path = (pathname || '/').toLowerCase();
  if (path === '/mapa-da-materia' || path.startsWith('/mapa-da-materia/')) return 'mapa';
  if (path === '/en/subject-map' || path.startsWith('/en/subject-map/')) return 'mapa';
  return 'site';
}
