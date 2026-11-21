/** Port of the app's scripts/inject-web-hit-config.test.mjs. Fake url/key only. */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describeHitResult, hitConfigScript, injectHitConfig, injectHitConfigDir } from './inject-web-hit-config.mjs';

const scriptPath = fileURLToPath(new URL('./inject-web-hit-config.mjs', import.meta.url));
const page = '<head><script src="/mg.js?v=1" defer></script>\n<script type="module" src="/mg-attr.js?v=1"></script></head>';
const URL_ENV = 'https://fake-project.example.test';
const KEY = 'fake-anon-key-0123456789';
const env = { EXPO_PUBLIC_SUPABASE_URL: URL_ENV, EXPO_PUBLIC_SUPABASE_ANON_KEY: KEY };

// The inline script: origin only, < escaped, bad URLs refused.
const script = hitConfigScript('https://fake-project.example.test/', KEY);
assert.equal(script, `<script>window.__MG_HIT__={"url":"https://fake-project.example.test","key":"${KEY}"};</script>`);
const escaped = hitConfigScript(URL_ENV, 'anon</script><key');
assert.match(escaped, /\\u003c/);
assert.equal(escaped.includes('</script><key'), false);
assert.equal(escaped.indexOf('</script>'), escaped.length - '</script>'.length, 'the key cannot close the script tag');
assert.equal(hitConfigScript(`  ${URL_ENV}  `, `  ${KEY}\n`), script, 'values are trimmed');
for (const bad of ['http://fake-project.example.test', `${URL_ENV}/rest/v1`, `${URL_ENV}?x=1`, `${URL_ENV}#x`, 'https://user:pw@fake-project.example.test', 'not a url', '']) {
  assert.equal(hitConfigScript(bad, KEY), null, bad);
}
assert.equal(hitConfigScript(URL_ENV, '  '), null);

// One injection per page, in front of the module tag.
const once = injectHitConfig(page, script);
assert.ok(once.indexOf('window.__MG_HIT__') < once.indexOf('<script type="module" src="/mg-attr.js'));
assert.ok(once.indexOf('/mg.js') < once.indexOf('window.__MG_HIT__'), 'mg.js stays first');
assert.equal(injectHitConfig(once, script), once, 'no duplicate');
assert.equal(injectHitConfig('<html></html>', script), '<html></html>');
assert.equal(injectHitConfig(page, null), page);

const tmp = mkdtempSync(path.join(tmpdir(), 'mg-hit-'));
function folder(files) {
  const dir = mkdtempSync(path.join(tmp, 'site-'));
  for (const [rel, text] of Object.entries(files)) {
    mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
    writeFileSync(path.join(dir, rel), text);
  }
  return dir;
}
function run(dir, extraEnv) {
  return spawnSync(process.execPath, [scriptPath, dir], { encoding: 'utf8', env: { ...process.env, ...extraEnv } });
}
const read = (dir, rel) => readFileSync(path.join(dir, rel), 'utf8');

try {
  // Library: skip, partial config, bad URL, no pages, success.
  const dir = folder({ 'index.html': page, 'en/index.html': page, 'app/index.html': '<html>app</html>', 'notes.txt': page });
  assert.deepEqual(injectHitConfigDir(dir, {}), { skipped: true });
  assert.deepEqual(injectHitConfigDir(dir, { EXPO_PUBLIC_SUPABASE_URL: ' ', EXPO_PUBLIC_SUPABASE_ANON_KEY: '' }), { skipped: true });
  assert.equal(read(dir, 'index.html'), page);
  assert.match(describeHitResult({ skipped: true }), /not injected/);
  for (const partial of [{ EXPO_PUBLIC_SUPABASE_URL: URL_ENV }, { EXPO_PUBLIC_SUPABASE_ANON_KEY: KEY }]) {
    assert.throws(() => injectHitConfigDir(dir, partial), (error) => /Set both/.test(error.message) && !error.message.includes(KEY) && !error.message.includes(URL_ENV));
  }
  assert.throws(
    () => injectHitConfigDir(dir, { ...env, EXPO_PUBLIC_SUPABASE_URL: 'http://fake-project.example.test' }),
    (error) => /bare https origin/.test(error.message) && !error.message.includes('fake-project') && !error.message.includes(KEY)
  );
  assert.equal(read(dir, 'index.html'), page, 'a refused config writes nothing');
  assert.throws(() => injectHitConfigDir(folder({ 'plain.html': '<html></html>' }), env), /No HTML page/);

  const result = injectHitConfigDir(dir, env);
  assert.deepEqual(result, { skipped: false, pages: 2, updated: 2 });
  assert.equal(describeHitResult(result).includes(KEY), false);
  assert.equal(describeHitResult(result).includes(URL_ENV), false);
  for (const rel of ['index.html', 'en/index.html']) {
    assert.equal(read(dir, rel), `<head><script src="/mg.js?v=1" defer></script>\n${script}\n<script type="module" src="/mg-attr.js?v=1"></script></head>`);
  }
  assert.equal(read(dir, 'app/index.html'), '<html>app</html>');
  assert.equal(read(dir, 'notes.txt'), page, 'only .html files');
  assert.deepEqual(injectHitConfigDir(dir, env), { skipped: false, pages: 2, updated: 0 }, 'a second run changes nothing');
  assert.equal((read(dir, 'index.html').match(/__MG_HIT__/g) ?? []).length, 1);

  // Command line: same rules, exit codes, and the key is never printed.
  const cliSkip = folder({ 'index.html': page });
  const skipped = run(cliSkip, { EXPO_PUBLIC_SUPABASE_URL: '', EXPO_PUBLIC_SUPABASE_ANON_KEY: '' });
  assert.equal(skipped.status, 0, skipped.stderr);
  assert.match(skipped.stdout, /not injected/);
  assert.equal(read(cliSkip, 'index.html'), page);

  const cliEmpty = folder({ 'plain.html': '<html></html>' });
  const empty = run(cliEmpty, env);
  assert.equal(empty.status, 1);
  assert.match(empty.stderr, /No HTML page/);
  assert.equal(`${empty.stdout}${empty.stderr}`.includes(KEY), false);

  const cliPartial = run(folder({ 'index.html': page }), { EXPO_PUBLIC_SUPABASE_URL: URL_ENV, EXPO_PUBLIC_SUPABASE_ANON_KEY: '' });
  assert.equal(cliPartial.status, 1);
  assert.equal(`${cliPartial.stdout}${cliPartial.stderr}`.includes(URL_ENV), false);

  const cliDir = folder({ 'index.html': page, 'plain.html': '<html></html>' });
  const ok = run(cliDir, env);
  assert.equal(ok.status, 0, ok.stderr);
  assert.match(ok.stdout, /injected into 1 of 1 pages/);
  assert.equal(`${ok.stdout}${ok.stderr}`.includes(KEY), false);
  assert.equal(`${ok.stdout}${ok.stderr}`.includes(URL_ENV), false);
  const html = read(cliDir, 'index.html');
  assert.ok(html.includes(`window.__MG_HIT__={"url":"${URL_ENV}","key":"${KEY}"}`));
  assert.equal(read(cliDir, 'plain.html'), '<html></html>');
  const again = run(cliDir, env);
  assert.equal(again.status, 0, again.stderr);
  assert.equal(read(cliDir, 'index.html'), html);

  assert.equal(spawnSync(process.execPath, [scriptPath], { encoding: 'utf8' }).status, 2, 'usage');
  console.log('scripts/inject-web-hit-config.test.mjs passed');
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
