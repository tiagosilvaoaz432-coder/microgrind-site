#!/usr/bin/env node
/**
 * Checks the files copied to the site root from site-static/.
 * Not part of `npm run check`: assetlinks.json still has a SHA-256 placeholder.
 * Run this after replacing the placeholder, and before copying the files to the site.
 */
import { realpathSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

/** Any file under site-static/app/ would sit on top of the exported /app routes. */
export async function collidingAppFiles(siteRoot) {
  const appDir = join(siteRoot, 'app');
  const found = [];
  async function walk(dir) {
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch (error) {
      if (error?.code === 'ENOENT') return;
      throw error;
    }
    for (const entry of entries) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) await walk(path);
      else if (entry.isFile()) found.push(relative(siteRoot, path));
    }
  }
  await walk(appDir);
  return found.sort();
}

const placeholder = 'COLOCA_AQUI';

function isDirectRun() {
  const entry = process.argv[1];
  if (!entry) return false;
  return import.meta.url === pathToFileURL(realpathSync(entry)).href;
}

async function main() {
const siteRoot = join(dirname(fileURLToPath(import.meta.url)), '..', 'site-static');
const assetlinks = join(siteRoot, '.well-known', 'assetlinks.json');
const headersFile = join(siteRoot, '_headers');
let failed = false;

try {
  const colliding = await collidingAppFiles(siteRoot);
  if (colliding.length > 0) {
    console.error(
      'site-static/app/ colide com as rotas exportadas em /app. Apaga estes ficheiros:\n' +
        colliding.map((path) => `  ${path}`).join('\n')
    );
    failed = true;
  }
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Não consegui ler site-static/app: ${message}`);
  failed = true;
}

let headers = '';
try {
  headers = await readFile(headersFile, 'utf8');
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Não encontrei ${headersFile}: ${message}`);
  failed = true;
}
if (headers && (!headers.includes('/app/auth/confirm*') || !/Referrer-Policy:\s*no-referrer/i.test(headers))) {
  console.error(
    'site-static/_headers tem de definir Referrer-Policy: no-referrer para /app/auth/confirm*.'
  );
  failed = true;
}

let text = '';
try {
  text = await readFile(assetlinks, 'utf8');
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Não encontrei ${assetlinks}: ${message}`);
  failed = true;
}
if (text.includes(placeholder)) {
  console.error(
    'site-static/.well-known/assetlinks.json ainda contém COLOCA_AQUI. ' +
      'Substitui o placeholder pelo SHA-256 do certificado de assinatura antes de publicar ' +
      'https://microgrind.app/.well-known/assetlinks.json. ' +
      'O npm run check habitual não corre esta verificação.'
  );
  failed = true;
}

if (failed) process.exit(1);
console.log('site-static está pronto a publicar: sem ficheiros em app/ e sem placeholder.');
}

if (isDirectRun()) {
  await main();
}
