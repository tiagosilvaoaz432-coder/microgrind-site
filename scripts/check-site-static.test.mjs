import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { collidingAppFiles } from './check-site-static.mjs';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const root = await mkdtemp(join(tmpdir(), 'site-static-'));
try {
  const missing = await collidingAppFiles(root);
  assert(missing.length === 0, 'a site-static without app/ is fine');

  await mkdir(join(root, 'app', 'auth', 'confirm'), { recursive: true });
  await writeFile(join(root, 'app', 'note.txt'), 'x');
  await writeFile(join(root, 'app', 'auth', 'confirm', 'index.html'), '<html></html>');
  const found = await collidingAppFiles(root);
  assert(
    found.length === 2 && found.some((path) => path.endsWith('note.txt')) && found.some((path) => path.endsWith('index.html')),
    `any file under app/ collides, got ${found.join(', ')}`
  );
} finally {
  await rm(root, { recursive: true, force: true });
}

console.log('check-site-static.test.mjs passed');
