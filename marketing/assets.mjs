/**
 * Static assets of the public site and their versions.
 *
 * Each URL carries ?v=<first 10 hex chars of the SHA-256 of the file as published>, so a file that
 * changes always gets a new URL. That is what lets _headers cache these files for a year
 * (immutable) without visitors ever getting a stale stylesheet or script after a deploy.
 * The fonts are versioned too, and mg.css points at the versioned font URLs, so the preload links
 * and the @font-face rules ask for the same URL.
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { minifyCss } from './minify-css.mjs';

const here = dirname(fileURLToPath(import.meta.url));

export function contentVersion(data) {
  return createHash('sha256').update(data).digest('hex').slice(0, 10);
}

export const FONTS = ['geist.woff2', 'geist-mono.woff2', 'bricolage.woff2'];

const fontVersion = Object.fromEntries(FONTS.map((name) => [name, contentVersion(readFileSync(join(here, 'fonts', name)))]));

/** Versioned URL of a font, e.g. /fonts/geist.woff2?v=1a2b3c4d5e. */
export function fontUrl(name) {
  if (!fontVersion[name]) throw new Error(`Unknown font ${name}`);
  return `/fonts/${name}?v=${fontVersion[name]}`;
}

function withVersionedFonts(css) {
  return css.replace(/url\((['"]?)\/fonts\/([\w.-]+\.woff2)\1\)/g, (_, quote, name) => `url(${quote}${fontUrl(name)}${quote})`);
}

/** Published path → source file and how it is transformed on the way out. */
const SOURCES = {
  'mg.css': { file: 'mg.css', css: true },
  'marketing.css': { file: 'site.css', css: true },
  'motion.css': { file: 'motion.css', css: true },
  'practice.css': { file: 'practice.css', css: true },
  'mg.js': { file: 'mg.js' },
  'practice.js': { file: 'practice.js' },
};

/** The bytes written to site-static/<name>. CSS is minified and points at the versioned fonts. */
export const ASSETS = Object.fromEntries(
  Object.entries(SOURCES).map(([name, { file, css }]) => {
    const source = readFileSync(join(here, file), 'utf8');
    const content = css ? `${minifyCss(withVersionedFonts(source))}\n` : source;
    return [name, { content, version: contentVersion(content) }];
  })
);

/** Root-absolute, versioned URL of a published asset, e.g. /mg.css?v=1a2b3c4d5e. */
export function assetUrl(name) {
  const asset = ASSETS[name];
  if (!asset) throw new Error(`Unknown asset ${name}`);
  return `/${name}?v=${asset.version}`;
}
