/* ============================================================
   SEE EARTH V1 · E-P0-07 Analytics · Trigger Dedupe Logic
   ------------------------------------------------------------
   - Source of truth: 07-设计师设计参考/release-v1/analytics-events/
       event-map-v1.md §6 防重复规则总表
   - Storage strategy (per trigger-diagram-v1.md §9):
       sessionStorage  → session-scoped dedupe (default)
       localStorage     → lifecycle dedupe (unknown_revealed / witness_submitted)
   - Dedupe is enforced BEFORE sending to the analytics receiver.
   ============================================================ */

import { AnalyticsEventName } from './schema';

/* ---------- Dedup table per event (mirrors event-map §6) ---------- */

interface DedupSpec {
  /** Dedupe window length in ms (Infinity for lifetime). */
  windowMs: number;
  /** Build the dedupe key from event props. Return null to disable dedupe. */
  buildKey: (props: Record<string, unknown>, sessionId: string) => string | null;
  /** Persistence backend. */
  store: 'session' | 'local';
}

/** Anonymous session id (rotates on page load, no cross-session identity). */
export type SessionId = string;

const MIN = 60 * 1000;
const HOUR = 60 * MIN;

export const DEDUP_SPECS: Readonly<Record<AnalyticsEventName, DedupSpec>> = Object.freeze({
  edition_viewed: {
    windowMs: Infinity, // session-scoped per §6; persists across reload until edition_id changes
    store: 'session',
    buildKey: (p, s) => `${s}::${p.edition_id ?? '?'}::${p.app_surface ?? '?'}`,
  },
  moment_impression: {
    windowMs: 30 * MIN,
    store: 'session',
    buildKey: (p, s) =>
      `${s}::${p.moment_id ?? '?'}::${(p as { edition_id?: string }).edition_id ?? '?'}`,
  },
  moment_opened: {
    windowMs: 30 * MIN,
    store: 'session',
    buildKey: (p, s) => `${s}::${p.moment_id ?? '?'}::${p.entry_point ?? '?'}`,
  },
  city_opened: {
    windowMs: 15 * MIN,
    store: 'session',
    buildKey: (p, s) => `${s}::${p.city_id ?? '?'}::${p.entry_point ?? '?'}`,
  },
  city_section_viewed: {
    windowMs: 15 * MIN,
    store: 'session',
    buildKey: (p, s) => `${s}::${p.city_id ?? '?'}::${p.section ?? '?'}`,
  },
  unknown_started: {
    windowMs: HOUR,
    store: 'session',
    buildKey: (p, s) => `${s}::${p.unknown_id ?? '?'}`,
  },
  unknown_revealed: {
    windowMs: Infinity,
    store: 'local',
    buildKey: (p) => `lifetime::${p.unknown_id ?? '?'}`,
  },
  echo_started: {
    windowMs: HOUR,
    store: 'session',
    buildKey: (p, s) => `${s}::${p.city_id ?? '?'}`,
  },
  echo_submitted: {
    windowMs: Infinity,
    store: 'local',
    buildKey: () => null, // server-side 1:1 confirmation; SDK does not dedupe
  },
  witness_started: {
    windowMs: Infinity,
    store: 'session',
    buildKey: (_, s) => `witness_session::${s}`,
  },
  witness_permission_result: {
    windowMs: Infinity,
    store: 'session',
    buildKey: (p, s) => `witness_session::${s}::${p.permission_type ?? '?'}`,
  },
  witness_upload_started: {
    windowMs: 0, // not deduped (server-side per Submit); only fires once per fetch start
    store: 'session',
    buildKey: () => null,
  },
  witness_submitted: {
    windowMs: Infinity,
    store: 'local',
    buildKey: (p) => `lifetime::submission::${p.submission_id ?? '?'}`,
  },
  witness_submit_failed: {
    windowMs: Infinity,
    store: 'local',
    buildKey: (p) => {
      const sid = (p as { submission_id?: string }).submission_id;
      if (sid) return `lifetime::submission::${sid}`;
      return null;
    },
  },
});

/* ---------- Storage adapter (browser) ---------- */

interface KVStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  key?(index: number): string | null;
  length?: number;
}

function getStore(kind: 'session' | 'local'): KVStore | null {
  if (typeof window === 'undefined' || typeof window.sessionStorage === 'undefined') {
    return null;
  }
  return (kind === 'local' ? window.localStorage : window.sessionStorage) as KVStore;
}

/* ---------- Dedup API ---------- */

export interface DedupDecision {
  /** True if the event is allowed to fire (not seen within window). */
  fire: boolean;
  /** The storage key (useful for tests / debug). */
  key: string | null;
}

/**
 * Checks whether the event should fire given the dedup spec.
 * Records the key on fire; returns fire=false on dedup hit.
 */
export function shouldFire(
  event: AnalyticsEventName,
  props: Record<string, unknown>,
  sessionId: SessionId,
): DedupDecision {
  const spec = DEDUP_SPECS[event];
  const key = spec.buildKey(props, sessionId);
  if (key === null) return { fire: true, key: null };

  const store = getStore(spec.store);
  if (!store) {
    // No storage (SSR / node test) → allow fire; tests must inject mock store separately.
    return { fire: true, key };
  }

  const now = Date.now();
  const raw = store.getItem(key);
  if (raw) {
    const last = Number(raw);
    if (Number.isFinite(last) && now - last < spec.windowMs) {
      return { fire: false, key };
    }
  }
  store.setItem(key, String(now));
  return { fire: true, key };
}

/** Manually clear a dedupe key (used by user actions like Refresh). */
export function clearDedupKey(event: AnalyticsEventName, key: string): void {
  const spec = DEDUP_SPECS[event];
  const store = getStore(spec.store);
  if (store) store.removeItem(key);
}

/** Clear ALL analytics dedupe keys in the chosen scope.
 *  Used by dev tools; in production called only when session is destroyed. */
export function clearAllDedup(scope: 'session' | 'local' = 'session'): void {
  const store = getStore(scope);
  if (!store) return;
  const toRemove: string[] = [];
  const len = store.length ?? 0;
  for (let i = 0; i < len; i += 1) {
    const k = store.key?.(i);
    if (!k) continue;
    if (scope === 'session' ? k.startsWith('witness_session::') || /^[a-f0-9-]+::/.test(k) : k.startsWith('lifetime::')) {
      toRemove.push(k);
    }
  }
  for (const k of toRemove) store.removeItem(k);
}