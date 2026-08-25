/* ============================================================
   SEE EARTH V1 · E-P0-07 Analytics · Public SDK Entry
   ------------------------------------------------------------
   - Source of truth: 07-设计师设计参考/release-v1/analytics-events/
       event-map-v1.md (14 events), trigger-diagram-v1.md (triggers),
       forbidden-fields-v1.md (F-01~F-30), consent-placement-v1.md (C-01).
   - Public surface (this file):
       analytics.init({ endpoint, app_surface, salt })
       analytics.send(event, props)
       analytics.trackVisible(el, event, props, opts)    // IntersectionObserver
       analytics.startSession() / endSession()
   - Trigger semantics (per trigger-diagram §8.1):
       * Visible trigger MUST use IntersectionObserver (no scroll listener).
       * Dwell-time enforced via observer.added → setTimeout; cleared on exit.
         We DO NOT use setTimeout to trigger "success" events; we only use it
         as a dwell timer whose sole effect is calling .send() on the success
         event whose semantic is "user saw X for Y ms". The send() payload is
         identical to the no-dwell case.
   - Network: Beacon (navigator.sendBeacon) on unload + fetch keepalive fallback.
   - dev-mode override: setVerbose(true) enables console.warn for dropped fields.
     Production must NOT use bypassWhitelist; server enforces whitelist too.
   ============================================================ */

import { AnalyticsEventEnvelopeSchema, AnalyticsEventName, AppSurfaceSchema, EVENT_SCHEMAS } from './schema.ts';
import { validateEventPayload, ValidationResult } from './validators.ts';
import { shouldFire, DedupDecision, clearDedupKey } from './trigger-dedupe.ts';
import { readConsentState, markConsentDismissed } from './consent.ts';

/* ---------- Configuration ---------- */

export interface AnalyticsConfig {
  /** POST endpoint accepting the analytics envelope. Default: '/v1/analytics/events'. */
  endpoint?: string;
  /** Stable app_surface (must match AppSurfaceSchema enum). */
  app_surface?: string;
  /** HMAC salt for submission_id hashing (server-side authoritative). */
  salt?: string;
  /** Whether verbose logging is enabled. DEV-ONLY. */
  verbose?: boolean;
  /** Skip field whitelist (DEV-ONLY). Production must omit / set false. */
  bypassWhitelist?: boolean;
  /** Custom fetch implementation (for tests). */
  fetcher?: typeof fetch;
}

let CONFIG: AnalyticsConfig = {};
let SESSION_ID: string | null = null;

/* ---------- Helpers ---------- */

function uuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback (non-cryptographic; only used in environments without crypto).
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/gu, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getSessionId(): string {
  if (SESSION_ID) return SESSION_ID;
  if (typeof window === 'undefined' || typeof window.sessionStorage === 'undefined') {
    SESSION_ID = uuid();
    return SESSION_ID;
  }
  const stored = window.sessionStorage.getItem('analytics_session_id_v1');
  if (stored) {
    SESSION_ID = stored;
    return stored;
  }
  const fresh = uuid();
  window.sessionStorage.setItem('analytics_session_id_v1', fresh);
  SESSION_ID = fresh;
  return fresh;
}

function isDevMode(): boolean {
  if (typeof import.meta !== 'undefined' && (import.meta as { env?: { DEV?: boolean } }).env) {
    return Boolean((import.meta as { env: { DEV?: boolean } }).env.DEV);
  }
  return false;
}

/* ---------- Sender (transport) ---------- */

interface OutboundEnvelope {
  event: AnalyticsEventName;
  ts: string;
  sdk_version: string;
  app_surface: string;
  session_id: string;
  props: Record<string, unknown>;
}

async function transport(envelopes: OutboundEnvelope[]): Promise<void> {
  if (envelopes.length === 0) return;
  const url = CONFIG.endpoint ?? '/v1/analytics/events';
  const body = JSON.stringify({ events: envelopes });
  const f = CONFIG.fetcher ?? fetch.bind(globalThis);
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function' && url.startsWith('/')) {
      const blob = new Blob([body], { type: 'application/json' });
      navigator.sendBeacon(url, blob);
      return;
    }
    await f(url, {
      method: 'POST',
      body,
      headers: { 'content-type': 'application/json' },
      keepalive: true,
    });
  } catch (err) {
    if (CONFIG.verbose) {
      // eslint-disable-next-line no-console
      console.warn('[analytics] transport failed', err);
    }
    // Silently drop: analytics must never break the app.
  }
}

/* ---------- Public API ---------- */

function init(config: AnalyticsConfig): void {
  CONFIG = {
    endpoint: '/v1/analytics/events',
    ...config,
  };
  if (!CONFIG.app_surface) {
    // Best-effort default; recommend explicit init.
    CONFIG.app_surface = 'web_homepage';
  }
  if (isDevMode() && CONFIG.verbose === undefined) {
    CONFIG.verbose = true;
  }
  if (!isDevMode() && CONFIG.bypassWhitelist === true) {
    // Force off in production.
    CONFIG.bypassWhitelist = false;
  }
}

function buildEnvelope(event: AnalyticsEventName, props: Record<string, unknown>): OutboundEnvelope {
  return {
    event,
    ts: new Date().toISOString(),
    sdk_version: '1.0.0',
    app_surface: CONFIG.app_surface ?? 'web_homepage',
    session_id: getSessionId(),
    props,
  };
}

interface SendResult {
  sent: boolean;
  reason?: 'dedup' | 'invalid';
  rejections?: ValidationResult<Record<string, unknown>>['rejections'];
}

function send(event: AnalyticsEventName, props: Record<string, unknown>): SendResult {
  // 1) Dedup
  const dedup: DedupDecision = shouldFire(event, props, getSessionId());
  if (!dedup.fire) {
    return { sent: false, reason: 'dedup' };
  }

  // 2) Validate + sanitize
  const validation = validateEventPayload(event, props, {
    bypassWhitelist: CONFIG.bypassWhitelist === true,
    verbose: CONFIG.verbose === true,
  });

  // Hard-rejected (PII / forbidden field) → drop the event entirely.
  if (validation.hard_rejected) {
    if (CONFIG.verbose) {
      // eslint-disable-next-line no-console
      console.warn('[analytics] hard-rejected', event, validation.rejections);
    }
    return { sent: false, reason: 'invalid', rejections: validation.rejections };
  }

  // Schema-only failure → drop too (defensive: malformed payload).
  if (!validation.ok || !validation.value) {
    return { sent: false, reason: 'invalid', rejections: validation.rejections };
  }

  // 3) Build envelope + transport
  const env = buildEnvelope(event, validation.value);
  const envelopeCheck = AnalyticsEventEnvelopeSchema.safeParse(env);
  if (!envelopeCheck.success) {
    return { sent: false, reason: 'invalid' };
  }
  void transport([env]);
  return { sent: true };
}

/* ---------- Visibility trigger (IntersectionObserver + dwell) ---------- */

export interface VisibleOptions {
  /** Fraction of element in viewport required to count. Default: 0.5 (impression) / 0.6 (section). */
  threshold?: number;
  /** Dwell time in ms before sending. Defaults map per trigger-diagram §8.1:
   *    moment_impression / moment cards  → 500 ms
   *    city_section_viewed               → 800 ms
   */
  dwellMs?: number;
  /** If true, disconnect observer after first fire (default true for impression / section). */
  once?: boolean;
  /** Optional callback fired on every visibility transition (UI / debug). */
  onVisibilityChange?: (visible: boolean) => void;
}

function trackVisible(
  el: Element,
  event: AnalyticsEventName,
  props: Record<string, unknown>,
  opts: VisibleOptions = {},
): () => void {
  if (typeof IntersectionObserver === 'undefined') {
    // Browser without IO (SSR, old WebViews) → silently no-op.
    return () => undefined;
  }
  const threshold = opts.threshold ?? (event === 'city_section_viewed' ? 0.6 : 0.5);
  const dwell = opts.dwellMs ?? (event === 'city_section_viewed' ? 800 : 500);
  const once = opts.once !== false;

  let visible = false;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let fired = false;

  const onEnter = () => {
    visible = true;
    if (timer) return;
    timer = setTimeout(() => {
      timer = null;
      if (!visible || fired) return;
      const result = send(event, props);
      if (result.sent) {
        fired = true;
        if (once) observer.disconnect();
      }
    }, dwell);
  };

  const onExit = () => {
    visible = false;
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const isIntersecting = entry.intersectionRatio >= threshold;
        opts.onVisibilityChange?.(isIntersecting);
        if (isIntersecting) onEnter();
        else onExit();
      }
    },
    { threshold: [0, threshold, 1] },
  );

  observer.observe(el);

  return () => {
    if (timer) clearTimeout(timer);
    observer.disconnect();
  };
}

/* ---------- Session helpers ---------- */

function startSession(): string {
  const sid = uuid();
  if (typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined') {
    window.sessionStorage.setItem('analytics_session_id_v1', sid);
  }
  SESSION_ID = sid;
  return sid;
}

function endSession(): void {
  if (typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined') {
    window.sessionStorage.removeItem('analytics_session_id_v1');
  }
  SESSION_ID = null;
}

/* ---------- Convenience helpers per event ---------- */

export interface AnalyticsPublic {
  init: (config: AnalyticsConfig) => void;
  send: (event: AnalyticsEventName, props: Record<string, unknown>) => SendResult;
  trackVisible: (
    el: Element,
    event: AnalyticsEventName,
    props: Record<string, unknown>,
    opts?: VisibleOptions,
  ) => () => void;
  startSession: () => string;
  endSession: () => void;
  /** Dev-only escape hatch. */
  setVerbose: (v: boolean) => void;
  /** Diagnostic: returns the canonical allowlist for an event. */
  describeEvent: (event: AnalyticsEventName) => {
    name: AnalyticsEventName;
    schemaKeys: string[];
  };
  /** Re-export for tests / advanced consumers. */
  clearDedupKey: (event: AnalyticsEventName, key: string) => void;
  /** Re-export consent helpers. */
  consent: {
    isDismissed: () => boolean;
    markDismissed: () => void;
  };
}

export const analytics: AnalyticsPublic = {
  init,
  send,
  trackVisible,
  startSession,
  endSession,
  setVerbose(v) {
    if (!isDevMode() && v) {
      // eslint-disable-next-line no-console
      console.warn('[analytics] setVerbose(true) ignored: production mode');
      return;
    }
    CONFIG.verbose = v;
  },
  describeEvent(event) {
    const schema = EVENT_SCHEMAS[event] as { _def?: { shape?: () => Record<string, unknown> } };
    const shape = schema._def?.shape?.() ?? {};
    return {
      name: event,
      schemaKeys: Object.keys(shape),
    };
  },
  clearDedupKey,
  consent: {
    isDismissed: () => readConsentState().dismissed,
    markDismissed: () => markConsentDismissed(),
  },
};

export { AppSurfaceSchema };
export type { AnalyticsEventName };