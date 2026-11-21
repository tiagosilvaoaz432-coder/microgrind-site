/**
 * Bundles marketing/mg-attr-boot.mjs and the two lib modules it uses into /mg-attr.js.
 *
 * No dependencies on purpose: the "Publicar site" workflow in MicroGrind runs `npm run build` and
 * `npm test` in this repo without `npm ci`, so a bundler from node_modules would not be there.
 * Output: one IIFE (nothing leaks to window), ES2020 syntax as written, no comments at all
 * (so no legal comments) and no indentation or blank lines. Names are not mangled.
 *
 * The bundled files must follow these rules; the build stops with an error otherwise:
 *   - imports are `import { a, b } from './x.mjs';` of an earlier file in MG_ATTR_MODULES;
 *   - exports are `export function` / `export const` declarations;
 *   - comments sit on their own lines;
 *   - top-level names are unique across the files.
 */
import { readFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Dependencies first. */
export const MG_ATTR_MODULES = ['lib/attribution.mjs', 'lib/web-hit.mjs', 'marketing/mg-attr-boot.mjs'];

const IMPORT_RE = /^import\s*\{([^}]*)\}\s*from\s*'([^']+)';[ \t]*$/gm;
const EXPORT_RE = /^export\s+(?=(?:function|const)\s)/gm;
const TOP_LEVEL_RE = /^(?:function|const|let|var|class)\s+([A-Za-z_$][\w$]*)/gm;

function fail(file, message) {
  throw new Error(`mg-attr bundle: ${file}: ${message}`);
}

/** Drops comment lines, then trims every line and drops the empty ones. */
export function stripCommentsAndSpace(source, file = 'source') {
  const kept = [];
  let inBlock = false;
  for (const line of source.split('\n')) {
    const text = line.trim();
    if (inBlock) {
      if (text.includes('*/')) {
        if (!text.endsWith('*/')) fail(file, `code after a comment: ${text}`);
        inBlock = false;
      }
      continue;
    }
    if (text.startsWith('/*')) {
      if (!text.includes('*/', 2)) inBlock = true;
      else if (!text.endsWith('*/')) fail(file, `code after a comment: ${text}`);
      continue;
    }
    if (text.startsWith('//')) continue;
    if (/\s\/\/\s|\s\/\*/.test(text)) fail(file, `put comments on their own line: ${text}`);
    if (text) kept.push(text);
  }
  if (inBlock) fail(file, 'unterminated comment');
  return kept.join('\n');
}

function toRepoPath(abs, root) {
  return relative(root, abs).split(sep).join('/');
}

export function bundleMgAttr({ root = REPO_ROOT, modules = MG_ATTR_MODULES } = {}) {
  const exportsOf = new Map();
  const topLevel = new Map();
  const parts = [];
  modules.forEach((file, index) => {
    let source = readFileSync(join(root, file), 'utf8').replace(/\r\n/g, '\n');
    source = source.replace(IMPORT_RE, (_match, names, specifier) => {
      const target = toRepoPath(resolve(dirname(join(root, file)), specifier), root);
      const at = modules.indexOf(target);
      if (at < 0 || at >= index) fail(file, `imports ${specifier}, which is not an earlier bundled module`);
      for (const name of names.split(',').map((n) => n.trim()).filter(Boolean)) {
        if (!/^[A-Za-z_$][\w$]*$/.test(name)) fail(file, `unsupported import "${name}" (no aliases or types)`);
        if (!exportsOf.get(target).has(name)) fail(file, `${target} does not export ${name}`);
      }
      return '';
    });
    if (/^\s*import\b/m.test(source)) fail(file, 'unsupported import form');
    const exported = new Set();
    for (const match of source.matchAll(/^export\s+(?:function|const)\s+([A-Za-z_$][\w$]*)/gm)) exported.add(match[1]);
    source = source.replace(EXPORT_RE, '');
    if (/^\s*export\b/m.test(source)) fail(file, 'only `export function` and `export const` are supported');
    exportsOf.set(file, exported);
    for (const match of source.matchAll(TOP_LEVEL_RE)) {
      const name = match[1];
      if (topLevel.has(name)) fail(file, `top-level name ${name} is also declared in ${topLevel.get(name)}`);
      topLevel.set(name, file);
    }
    parts.push(stripCommentsAndSpace(source, file));
  });
  return `(()=>{\n"use strict";\n${parts.join('\n')}\n})();\n`;
}
