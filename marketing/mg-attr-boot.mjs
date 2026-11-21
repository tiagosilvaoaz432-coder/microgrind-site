/**
 * Browser entry for every site page. Bundled to /mg-attr.js by marketing/bundle-mg-attr.mjs
 * (npm run build), loaded with <script type="module"> right after mg.js (chrome.mjs, headAssets).
 *
 * 1. Keeps the tab's first ad source in sessionStorage['mg-attr'] (lib/attribution.mjs).
 * 2. Forwards utm_* (plus mg_land / mg_ref) to same-host /app links: href, and the install
 *    dialog's data-web and data-ig-copy. A capture-phase click listener catches links that
 *    were added or changed after this ran.
 * 3. Counts the visit once per document with public.record_web_hit (lib/web-hit.mjs):
 *    no cookies, no identifiers, so it runs without cookie consent. GA4 and the ChatGPT ads
 *    pixel stay behind mg-consent=granted (lib/ga4.mjs, mg.js).
 *
 * No secrets live in this file or in the bundle: scripts/inject-web-hit-config.mjs sets
 * window.__MG_HIT__ = { url, key } on the assembled Pages folder at publish time only.
 * Without it, nothing is sent (local builds, previews without the env).
 */
import { captureSessionAttribution, forwardAppLinks, webHitPathGroup, withForwardedUtms } from '../lib/attribution.mjs';
import { recordWebHit } from '../lib/web-hit.mjs';

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

/** The install dialog keeps the web-app URL on data-web and data-ig-copy, not on href. */
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

/** @param {Window & { __MG_HIT__?: { url?: string, key?: string } }} win */
export function bootSiteAttribution(win) {
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
    /* Attribution must never break the page. */
  }
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  bootSiteAttribution(window);
}
