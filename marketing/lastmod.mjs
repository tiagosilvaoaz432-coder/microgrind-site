/**
 * Real last-modified dates for the sitemap (and dateModified in the guides' structured data).
 *
 * marketing/lastmod.json stores, per page, a hash of its <main> content and the date that content
 * last changed. On each build a page keeps its stored date while its <main> is unchanged; when it
 * changes, the page gets the build date (UTC). Header, footer, <head> and asset versions are left
 * out, so a CSS fix does not make every page look "updated".
 *
 * `npm run build` writes the manifest. The test build only reads it, so a page edited without
 * running the build shows up as a stale sitemap.
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const LASTMOD_FILE = fileURLToPath(new URL('./lastmod.json', import.meta.url));

/** Placeholder a page can put where its own date goes (e.g. JSON-LD dateModified). */
export const LASTMOD_TOKEN = '__MG_LASTMOD__';

export function mainHash(html) {
  const main = html.match(/<main[\s>][\s\S]*<\/main>/);
  return createHash('sha256').update(main ? main[0] : html).digest('hex').slice(0, 16);
}

export function todayUtc(now = new Date()) {
  return now.toISOString().slice(0, 10);
}

export function readLastmod(file = LASTMOD_FILE) {
  return existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : {};
}

/**
 * Resolves dates for a set of rendered pages. Returns { dates, manifest }: dates maps each path to
 * YYYY-MM-DD; manifest is the new lastmod.json content (only the given paths, sorted).
 */
export function resolveLastmod(rendered, stored, today = todayUtc()) {
  const manifest = {};
  for (const path of [...rendered.keys()].sort()) {
    const hash = mainHash(rendered.get(path));
    const prev = stored[path];
    manifest[path] = prev && prev.hash === hash ? prev : { hash, date: today };
  }
  const dates = new Map(Object.entries(manifest).map(([path, entry]) => [path, entry.date]));
  return { dates, manifest };
}

export function writeLastmod(manifest, file = LASTMOD_FILE) {
  const text = `${JSON.stringify(manifest, null, 2)}\n`;
  if (!existsSync(file) || readFileSync(file, 'utf8') !== text) writeFileSync(file, text);
}
