/**
 * Share images (og:image / twitter:image), one per page: /og/<key>.jpg, 1200×630.
 *
 * The images live in deploy/site-root/og/ (copied to the site root when the Pages folder is
 * assembled) and are made by `npm run og` (scripts/og-images.mjs, needs Playwright), which draws
 * each page's section and heading on the site's dark background. og/manifest.json stores the
 * text each image was drawn with, so the test can tell when a heading changed and the image is
 * out of date. A page without an image falls back to /og.png.
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { ORIGIN } from './content.mjs';

export const OG_DIR = fileURLToPath(new URL('../deploy/site-root/og/', import.meta.url));
export const OG_MANIFEST = `${OG_DIR}manifest.json`;
export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

/** File name (without extension) of a page's image: '/' → 'home', '/en/pricing/' → 'en-pricing'. */
export function ogKey(path) {
  return path.replace(/^\/|\/$/g, '').replaceAll('/', '-') || 'home';
}

export function ogFile(path) {
  return `${OG_DIR}${ogKey(path)}.jpg`;
}

/** Absolute URL of the page's share image, or the site-wide /og.png when it has none yet. */
export function ogImageUrl(path) {
  return existsSync(ogFile(path)) ? `${ORIGIN}/og/${ogKey(path)}.jpg` : `${ORIGIN}/og.png`;
}

function decode(text) {
  return text
    .replace(/<[^>]+>/g, ' ')
    .replaceAll('&nbsp;', ' ')
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replace(/\s+/g, ' ')
    .trim();
}

/** What a page's image shows: section (first kicker), heading (h1) and language. */
export function ogText(path, html) {
  // The homepage h1 starts with the brand (span.h1-brand), which the image already shows.
  const h1 = html.replace(/<span class="(?:h1-brand|visually-hidden)">[\s\S]*?<\/span>/g, '').match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
  const kicker = html.match(/<p class="kicker">([\s\S]*?)<\/p>/);
  const locale = /<html lang="en"/.test(html) ? 'en' : 'pt';
  const home = locale === 'en' ? 'Study app' : 'App de estudo';
  return {
    key: ogKey(path),
    locale,
    kicker: path === '/' || path === '/en/' ? home : kicker ? decode(kicker[1]) : 'MicroGrind',
    title: h1 ? decode(h1[1]) : 'MicroGrind',
  };
}

export function ogTextHash(text) {
  return createHash('sha256').update(JSON.stringify([text.locale, text.kicker, text.title])).digest('hex').slice(0, 12);
}

export function readOgManifest() {
  return existsSync(OG_MANIFEST) ? JSON.parse(readFileSync(OG_MANIFEST, 'utf8')) : {};
}

/** og:image tags (width, height and alt included), shared by every page template. */
export function ogImageTags(path, alt, esc) {
  const url = ogImageUrl(path);
  return `<meta property="og:image" content="${url}">
<meta property="og:image:width" content="${OG_WIDTH}">
<meta property="og:image:height" content="${OG_HEIGHT}">
<meta property="og:image:alt" content="${esc(alt)}">`;
}
