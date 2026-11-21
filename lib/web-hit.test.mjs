/** Port of the app's lib/web-hit.test.ts. */
import assert from 'node:assert/strict';

import { recordWebHit, webHitDedupeKey } from './web-hit.mjs';

function memory() {
  const data = new Map();
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
  };
}

function hit(overrides = {}) {
  return { pathGroup: 'site', source: 'ChatGPT', pathname: '/', stamp: '1', storage: memory(), ...overrides };
}

const posts = [];
const storage = memory();
recordWebHit(hit({ storage, post: (body) => posts.push(body) }));
recordWebHit(hit({ storage, post: (body) => posts.push(body) }));
assert.equal(posts.length, 1);
assert.deepEqual(posts[0], { p_path_group: 'site', p_source: 'chatgpt' });
assert.equal(storage.getItem(webHitDedupeKey('site', '/')), '1');
assert.equal(webHitDedupeKey('mapa', ''), 'mg-hit:mapa:/');

recordWebHit(hit({ storage, stamp: '2', post: (body) => posts.push(body) }));
assert.equal(posts.length, 2, 'a reload uses a new stamp and counts again');

recordWebHit(hit({ storage, stamp: '2', pathGroup: 'mapa', pathname: '/mapa-da-materia/', source: '', post: (body) => posts.push(body) }));
assert.equal(posts.length, 3);
assert.deepEqual(posts[2], { p_path_group: 'mapa', p_source: 'direct' });

recordWebHit(
  hit({
    storage: null,
    post: () => {
      throw new Error('offline');
    },
  })
);
recordWebHit(hit({ storage: null, post: () => Promise.reject(new Error('offline')) }));

const blocked = {
  getItem() {
    throw new Error('blocked');
  },
  setItem() {
    throw new Error('blocked');
  },
};
recordWebHit(hit({ storage: blocked, post: (body) => posts.push(body) }));
assert.equal(posts.length, 4, 'storage that throws still counts');

let settled = false;
recordWebHit(
  hit({
    storage: memory(),
    post: () =>
      new Promise((resolve) => {
        setTimeout(() => {
          settled = true;
          resolve(null);
        }, 30);
      }),
  })
);
assert.equal(settled, false, 'the counter returns before the network finishes');

const calls = [];
recordWebHit(
  hit({
    storage: memory(),
    endpoint: { url: 'http://example.test', apiKey: 'secret-key' },
    fetchImpl: (url) => {
      calls.push(url);
      return Promise.resolve(null);
    },
  })
);
assert.deepEqual(calls, [], 'only https endpoints are called');

recordWebHit(hit({ storage: memory(), endpoint: { url: 'https://example.test', apiKey: '' }, fetchImpl: (url) => calls.push(url) }));
recordWebHit(hit({ storage: memory(), endpoint: null, fetchImpl: (url) => calls.push(url) }));
assert.deepEqual(calls, [], 'no endpoint or no key: no request');

recordWebHit(
  hit({
    storage: memory(),
    source: 'not a source',
    endpoint: { url: 'https://example.test/', apiKey: 'anon-key' },
    fetchImpl: (url, init) => {
      calls.push(url);
      calls.push(init.body);
      assert.equal(init.method, 'POST');
      assert.equal(init.headers.apikey, 'anon-key');
      assert.equal(init.headers.Authorization, 'Bearer anon-key');
      assert.equal(init.headers['Content-Type'], 'application/json');
      assert.equal(init.credentials, 'omit');
      assert.equal(init.keepalive, true);
      assert.equal(init.mode, 'cors');
      return Promise.reject(new Error('offline'));
    },
  })
);
assert.equal(calls[0], 'https://example.test/rest/v1/rpc/record_web_hit');
assert.equal(calls[1], '{"p_path_group":"site","p_source":"other"}');

recordWebHit(
  hit({
    storage: memory(),
    endpoint: { url: 'https://example.test', apiKey: 'anon-key' },
    fetchImpl: () => {
      throw new Error('offline');
    },
  })
);

// supabase-js builders only have then(): calling catch() on them throws.
let thenOnlyStarts = 0;
const thenOnly = {
  then(onFulfilled) {
    thenOnlyStarts += 1;
    onFulfilled?.({ data: null, error: null });
  },
};
assert.equal('catch' in thenOnly, false);
assert.doesNotThrow(() => recordWebHit(hit({ storage: memory(), post: () => thenOnly })));

let rejectionStarts = 0;
const rejecting = {
  then(_onFulfilled, onRejected) {
    rejectionStarts += 1;
    onRejected?.(new Error('offline'));
  },
};
assert.doesNotThrow(() => recordWebHit(hit({ storage: memory(), post: () => rejecting })));

setTimeout(() => {
  assert.equal(settled, true);
  assert.equal(thenOnlyStarts, 1, 'a then-only builder starts the request through then()');
  assert.equal(rejectionStarts, 1, 'a rejected then-only builder still starts the request');
  console.log('lib/web-hit.test.mjs passed');
}, 40);
