/**
 * Google Analytics 4 + OpenAI Ads pixel for the marketing pages of https://microgrind.app.
 *
 * Site copy of the app's lib/ga4.ts and lib/oaiq.ts (MicroGrind repo): the /app/ shell keeps
 * its own copy there. Both read the same consent key, so keep the IDs and the key in step.
 *
 * Production measurement ID: G-MXG7DRQWRG (public, printed in the page HTML).
 * Set GA_MEASUREMENT_ID at build time to point a preview build at another stream.
 * No Google or OpenAI script loads until the visitor accepts the cookie banner (mg.js).
 */

export const GA4_MEASUREMENT_ID_PRODUCTION = 'G-MXG7DRQWRG';
export const GA4_CONSENT_KEY = 'mg-consent';
export const OAIQ_PIXEL_ID = 'AVdC7CzexyzwxBqEcygmLY';
export const OAIQ_LOADER_SRC = 'https://bzrcdn.openai.com/sdk/oaiq.min.js';

const ID_PATTERN = /^G-[A-Z0-9]+$/;

function assertMeasurementId(measurementId) {
  if (!ID_PATTERN.test(measurementId)) {
    throw new Error(`GA measurement ID must look like G-XXXXXXXX (got ${measurementId}).`);
  }
  return measurementId;
}

export function ga4MeasurementId(env) {
  const source = env ?? process.env;
  const raw = source.GA_MEASUREMENT_ID ?? source.EXPO_PUBLIC_GA_MEASUREMENT_ID ?? '';
  const id = raw.trim();
  if (!id) return GA4_MEASUREMENT_ID_PRODUCTION;
  return assertMeasurementId(id);
}

export function ga4LoaderSrc(measurementId) {
  return `https://www.googletagmanager.com/gtag/js?id=${assertMeasurementId(measurementId)}`;
}

export function oaiqLoadBody(pixelId = OAIQ_PIXEL_ID) {
  return `!function(w,d,s,u){if(w.oaiq)return;var q=function(){q.q.push(arguments)};q.q=[];w.oaiq=q;var j=d.createElement(s);j.async=1;j.src=u;d.head.appendChild(j)}(window,document,"script",${JSON.stringify(OAIQ_LOADER_SRC)});
oaiq("init",{pixelId:${JSON.stringify(pixelId)},debug:false});`;
}

export function ga4ConfigBody(measurementId) {
  const id = assertMeasurementId(measurementId);
  return `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied' });
gtag('js', new Date());
gtag('config', '${id}');`;
}

function consentGranted() {
  return `(function () { try { return window.localStorage.getItem('${GA4_CONSENT_KEY}') === 'granted'; } catch (e) { return false; } })()`;
}

/** Google tag for the marketing pages, placed right after `<head>`. Loader only after consent. */
export function ga4HeadSnippet(measurementId = ga4MeasurementId()) {
  const id = assertMeasurementId(measurementId);
  return `<!-- Google tag (gtag.js): loaded only after cookie consent -->
<script>
${ga4ConfigBody(id)}
window.mgLoadAnalytics = function () {
  if (window.mgAnalyticsLoaded) return;
  window.mgAnalyticsLoaded = true;
  gtag('consent', 'update', { analytics_storage: 'granted' });
  var loader = document.createElement('script');
  loader.async = true;
  loader.src = '${ga4LoaderSrc(id)}';
  document.head.appendChild(loader);
  ${oaiqLoadBody()}
};
if (${consentGranted()}) window.mgLoadAnalytics();
</script>
`;
}
