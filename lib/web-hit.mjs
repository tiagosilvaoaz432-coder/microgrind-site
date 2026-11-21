/**
 * One cookieless page-view ping to public.record_web_hit. Copy of the app's lib/web-hit.ts
 * (scripts/check-app-parity.mjs compares them).
 *
 * sessionStorage only stops the same document from sending twice (a second script run).
 * A reload has a new performance.timeOrigin, so it counts again.
 * The call never throws and never waits on the network.
 *
 * Browser code: plain ES2020, no dependencies. marketing/bundle-mg-attr.mjs bundles it.
 */
import { clampSource } from './attribution.mjs';

export const WEB_HIT_RPC_PATH = '/rest/v1/rpc/record_web_hit';

/** @param {'site' | 'mapa' | 'app'} pathGroup */
export function webHitDedupeKey(pathGroup, pathname) {
  return `mg-hit:${pathGroup}:${pathname || '/'}`;
}

/** True the first time this document claims the key. */
export function claimWebHit(storage, key, stamp) {
  if (!storage) return true;
  try {
    if (storage.getItem(key) === stamp) return false;
    storage.setItem(key, stamp);
    return true;
  } catch {
    return true;
  }
}

function endpointUrl(base) {
  const trimmed = base.trim().replace(/\/$/, '');
  if (!/^https:\/\//i.test(trimmed)) return null;
  return `${trimmed}${WEB_HIT_RPC_PATH}`;
}

/**
 * supabase-js builders are thenable-only: the request starts inside then(),
 * and the object has no catch. Calling catch on it throws and the ping never leaves.
 */
function settle(result) {
  if (!result || typeof result.then !== 'function') return;
  void Promise.resolve(result).catch(() => undefined);
}

/**
 * Fire-and-forget. Returns before the request finishes. A thrown or rejected
 * post is swallowed so a missing network cannot break the page.
 *
 * @param {{
 *   pathGroup: 'site' | 'mapa' | 'app',
 *   source: string,
 *   pathname: string,
 *   stamp: string,
 *   storage: { getItem(key: string): string | null, setItem(key: string, value: string): void } | null,
 *   post?: (body: { p_path_group: string, p_source: string }) => unknown,
 *   endpoint?: { url: string, apiKey: string } | null,
 *   fetchImpl?: (input: string, init: RequestInit) => Promise<unknown>,
 * }} input
 */
export function recordWebHit(input) {
  try {
    const key = webHitDedupeKey(input.pathGroup, input.pathname);
    if (!claimWebHit(input.storage, key, input.stamp || '1')) return;
    const body = {
      p_path_group: input.pathGroup,
      p_source: clampSource(input.source),
    };
    if (input.post) {
      try {
        settle(input.post(body));
      } catch {
        /* offline */
      }
      return;
    }
    const target = input.endpoint;
    if (!target?.url || !target.apiKey) return;
    const url = endpointUrl(target.url);
    if (!url) return;
    const run = input.fetchImpl ?? fetch;
    try {
      settle(
        run(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: target.apiKey,
            Authorization: `Bearer ${target.apiKey}`,
          },
          body: JSON.stringify(body),
          keepalive: true,
          credentials: 'omit',
          mode: 'cors',
        })
      );
    } catch {
      /* offline */
    }
  } catch {
    /* never break rendering */
  }
}
