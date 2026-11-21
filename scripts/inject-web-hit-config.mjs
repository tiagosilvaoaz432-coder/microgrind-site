#!/usr/bin/env node
/**
 * Writes window.__MG_HIT__ = { url, key } in front of /mg-attr.js in the assembled Pages folder,
 * so the cookieless counter (public.record_web_hit) can post. assemble-pages-site.mjs calls it;
 * it can also run alone: node scripts/inject-web-hit-config.mjs <pages-folder>
 *
 * Reads EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY from the environment.
 * The anon key is public (the app bundle carries it) but it is never committed: not in git,
 * not in site-static/, not in mg-attr.js. Nothing here prints the URL or the key.
 *   - neither set: no-op (local builds, Site CI);
 *   - only one set, or a URL that is not a bare https origin: error;
 *   - set, but no page loads /mg-attr.js: error (a publish that lost the script).
 */
import { readdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const HIT_MARKER = '<script type="module" src="/mg-attr.js';
export const HIT_URL_ENV = 'EXPO_PUBLIC_SUPABASE_URL';
export const HIT_KEY_ENV = 'EXPO_PUBLIC_SUPABASE_ANON_KEY';
const HIT_ASSIGNMENT = 'window.__MG_HIT__=';

/** Returns the inline script, or null when the URL is not a bare https origin or a value is empty. */
export function hitConfigScript(url, key) {
  const cleanUrl = String(url ?? '').trim().replace(/\/+$/, '');
  const cleanKey = String(key ?? '').trim();
  if (!cleanUrl || !cleanKey) return null;
  let parsed;
  try {
    parsed = new URL(cleanUrl);
  } catch {
    return null;
  }
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password || parsed.search || parsed.hash || parsed.pathname !== '/') {
    return null;
  }
  const json = JSON.stringify({ url: parsed.origin, key: cleanKey }).replaceAll('<', '\\u003c');
  return `<script>${HIT_ASSIGNMENT}${json};</script>`;
}

/** Puts `script` in front of every mg-attr.js tag. A page that already has the config is left alone. */
export function injectHitConfig(html, script) {
  if (!script || typeof html !== 'string') return html;
  if (html.includes(HIT_ASSIGNMENT)) return html;
  if (!html.includes(HIT_MARKER)) return html;
  return html.replaceAll(HIT_MARKER, `${script}\n${HIT_MARKER}`);
}

function htmlFiles(dir, acc = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) htmlFiles(full, acc);
    else if (entry.isFile() && entry.name.endsWith('.html')) acc.push(full);
  }
  return acc;
}

/**
 * @returns {{ skipped: true } | { skipped: false, pages: number, updated: number }}
 * `pages` counts the HTML files that load mg-attr.js; `updated` the ones written now.
 */
export function injectHitConfigDir(dir, env = process.env) {
  const url = String(env[HIT_URL_ENV] ?? '').trim();
  const key = String(env[HIT_KEY_ENV] ?? '').trim();
  if (!url && !key) return { skipped: true };
  if (!url || !key) {
    throw new Error(`Set both ${HIT_URL_ENV} and ${HIT_KEY_ENV}, or neither (${url ? HIT_KEY_ENV : HIT_URL_ENV} is empty).`);
  }
  const script = hitConfigScript(url, key);
  if (!script) throw new Error(`${HIT_URL_ENV} must be a bare https origin, such as https://<project>.supabase.co (value not shown).`);
  let pages = 0;
  let updated = 0;
  for (const file of htmlFiles(dir)) {
    const html = readFileSync(file, 'utf8');
    if (!html.includes(HIT_MARKER)) continue;
    pages += 1;
    const next = injectHitConfig(html, script);
    if (next !== html) {
      writeFileSync(file, next);
      updated += 1;
    }
  }
  if (pages < 1) throw new Error(`No HTML page in the Pages folder loads /mg-attr.js, so the counter config was not injected.`);
  return { skipped: false, pages, updated };
}

/** One line for the publish log. Never includes the URL or the key. */
export function describeHitResult(result) {
  if (result.skipped) return `Cookieless counter config not injected: ${HIT_URL_ENV} and ${HIT_KEY_ENV} are not set, so the site pages will not count visits (fine for a local build; a publish needs both).`;
  return `Cookieless counter config injected into ${result.updated} of ${result.pages} pages that load /mg-attr.js.`;
}

function isDirectRun() {
  const entry = process.argv[1];
  return Boolean(entry) && import.meta.url === pathToFileURL(realpathSync(entry)).href;
}

if (isDirectRun()) {
  const dir = process.argv[2];
  if (!dir) {
    console.error('Usage: node scripts/inject-web-hit-config.mjs <pages-folder>');
    process.exit(2);
  }
  try {
    console.log(describeHitResult(injectHitConfigDir(path.resolve(dir))));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
