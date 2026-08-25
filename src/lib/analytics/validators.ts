/* ============================================================
   SEE EARTH V1 · E-P0-07 Analytics · Field Whitelist + PII Guards
   ------------------------------------------------------------
   - Source of truth: 07-设计师设计参考/release-v1/analytics-events/
       forbidden-fields-v1.md (F-01 ~ F-30)
   - Two-layer defense:
       Layer 1 (this file): drop forbidden field names + block obvious PII patterns
       Layer 2 (server-receiver-v1.md): re-scan before persisting
   - V1 Production behavior: whitelist + PII regex are ALWAYS on.
       Developer override only allowed when import.meta.env.DEV === true
       AND the calling site has explicitly opted in via setVerbose(true).
   ============================================================ */

import { z } from 'zod';
import {
  EVENT_SCHEMAS,
} from './schema.ts';
import type { AnalyticsEventName } from './schema.ts';

/* ---------- F-01 ~ F-30: forbidden field names (lowercase) ---------- */

/** Field name fragments that MUST NEVER appear in any payload.
 *  Compared case-insensitively against keys (top-level AND nested). */
const FORBIDDEN_FIELD_FRAGMENTS: ReadonlyArray<string> = Object.freeze([
  // F-01 ~ F-05 precise location
  'latitude', 'longitude', 'lat', 'lng', 'lon',
  'accuracy_meters', 'accuracy_m', 'accuracy',
  'geojson', 'geo_json', 'place_id',
  // F-06 ~ F-11 raw EXIF
  'exif', 'gps_latitude', 'gps_longitude', 'gps_altitude',
  'camera_serial', 'camera_model', 'camera_make',
  'user_comment', 'description_exif', 'copyright',
  'host_software', 'software', 'date_time_original',
  'raw_exif',
  // F-12 ~ F-16 free text (Echo body, Witness short description, comments, search)
  'echo_text', 'echo_content', 'echo_body',
  'description_text', 'witness_description', 'witness_caption',
  'description', 'caption', 'note', 'body', 'content', 'text', 'message',
  'answer', 'guess', 'user_guess', 'reply', 'feedback_text',
  'comment', 'review_text', 'comments',
  'query', 'keyword', 'search_query',
  // F-17 ~ F-21 identifiers
  'user_id', 'uid', 'device_id', 'persistent_user_id',
  'email', 'e_mail', 'phone', 'mobile', 'msisdn',
  'ip_address', 'ip', 'remote_addr', 'x_forwarded_for',
  'session_id_persistent', 'persistent_session_id',
  'cookie', 'cookie_value',
  // F-22 ~ F-24 network / URL tokens
  'image_token', 'cdn_token', 'signed_url',
  'upload_url_full', 'endpoint_url',
  'cdn_url', 'cdn_path', 'image_url_full',
  // F-25 ~ F-27 device fingerprint
  'user_agent', 'user_agent_full', 'ua_string',
  'screen_width', 'screen_height',
  'canvas_fingerprint', 'webgl_fingerprint', 'fingerprint',
  // F-28 device state
  'battery_level', 'battery_charging',
  // F-29 ~ F-30 behavior
  'mouse_path', 'scroll_depth', 'scroll_y',
  'click_x', 'click_y', 'click_coordinates',
]);

/** Maps a forbidden field fragment → its forbidden-fields ID for diagnostics. */
const FORBIDDEN_FIELD_REASON: Readonly<Record<string, string>> = Object.freeze({
  latitude: 'F-01',
  longitude: 'F-02',
  lat: 'F-01',
  lng: 'F-02',
  lon: 'F-02',
  accuracy_meters: 'F-03',
  accuracy_m: 'F-03',
  accuracy: 'F-03',
  geojson: 'F-04',
  geo_json: 'F-04',
  place_id: 'F-05',
  exif: 'F-11',
  gps_latitude: 'F-06',
  gps_longitude: 'F-06',
  camera_serial: 'F-07',
  camera_model: 'F-07',
  user_comment: 'F-08',
  host_software: 'F-09',
  software: 'F-09',
  date_time_original: 'F-10',
  raw_exif: 'F-11',
  echo_text: 'F-12',
  echo_content: 'F-12',
  echo_body: 'F-12',
  description_text: 'F-13',
  witness_description: 'F-13',
  answer: 'F-14',
  guess: 'F-14',
  comment: 'F-15',
  query: 'F-16',
  keyword: 'F-16',
  user_id: 'F-17',
  uid: 'F-17',
  device_id: 'F-17',
  email: 'F-18',
  phone: 'F-18',
  mobile: 'F-18',
  ip_address: 'F-19',
  ip: 'F-19',
  cookie: 'F-21',
  image_token: 'F-22',
  cdn_token: 'F-22',
  upload_url_full: 'F-23',
  endpoint_url: 'F-23',
  cdn_url: 'F-24',
  user_agent: 'F-25',
  canvas_fingerprint: 'F-27',
  webgl_fingerprint: 'F-27',
  battery_level: 'F-28',
  mouse_path: 'F-29',
  scroll_depth: 'F-29',
  click_x: 'F-30',
  click_y: 'F-30',
});

/* ---------- PII regex patterns (F-18 / F-19) ---------- */

/** Email regex — RFC 5322 simplified subset. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;

/** International phone regex — digits, spaces, +, -, parentheses; min 7 digits. */
const PHONE_PATTERN = /^\+?[0-9()\-.\s]{7,20}$/u;

/** IPv4 address regex. */
const IPV4_PATTERN = /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/u;

/* ---------- Validation result types ---------- */

export interface FieldRejection {
  path: string;
  field: string;
  reason_code: string; // F-XX
  reason: string;
}

export interface ValidationResult<T> {
  ok: boolean;
  value?: T;
  rejections: FieldRejection[];
  /** True if rejected for PII / EXIF / forbidden name (vs. schema-only failure). */
  hard_rejected: boolean;
}

export class AnalyticsValidationError extends Error {
  readonly rejections: FieldRejection[];
  constructor(rejections: FieldRejection[]) {
    super(`Analytics payload rejected: ${rejections.length} violation(s)`);
    this.name = 'AnalyticsValidationError';
    this.rejections = rejections;
  }
}

/* ---------- Allowed fields per event (whitelist source) ---------- */

function getAllowedFields(event: AnalyticsEventName): ReadonlySet<string> {
  const schema = EVENT_SCHEMAS[event] as z.ZodObject<z.ZodRawShape> | undefined;
  if (!schema || !schema._def || typeof schema._def.shape !== 'function') {
    return new Set<string>();
  }
  const shape = schema._def.shape();
  const out = new Set<string>(Object.keys(shape));
  // Common envelope fields are also allowed at top level (added later by sender).
  for (const k of ['event', 'ts', 'sdk_version', 'app_surface', 'session_id']) {
    out.add(k);
  }
  return out;
}

/* ---------- Field name filter ---------- */

function isForbiddenFieldName(name: string): { forbidden: boolean; code?: string } {
  const lower = name.toLowerCase();
  if (FORBIDDEN_FIELD_FRAGMENTS.includes(lower)) {
    return { forbidden: true, code: FORBIDDEN_FIELD_REASON[lower] };
  }
  // Substring check for 'exif' / 'cookie' / 'fingerprint' etc that may appear in compound names
  for (const frag of FORBIDDEN_FIELD_FRAGMENTS) {
    if (frag.length >= 5 && lower.includes(frag)) {
      return { forbidden: true, code: FORBIDDEN_FIELD_REASON[frag] };
    }
  }
  return { forbidden: false };
}

/* ---------- PII value pattern detection ---------- */

function detectPII(value: unknown): { pii: boolean; pattern?: string } {
  if (typeof value !== 'string') return { pii: false };
  if (EMAIL_PATTERN.test(value)) return { pii: true, pattern: 'email' };
  // Phone: strip non-digits and check length to reduce false positives
  const digits = value.replace(/\D/g, '');
  if (digits.length >= 7 && PHONE_PATTERN.test(value)) {
    return { pii: true, pattern: 'phone' };
  }
  if (IPV4_PATTERN.test(value)) return { pii: true, pattern: 'ipv4' };
  return { pii: false };
}

/* ---------- Deep field name + value validator ---------- */

/**
 * Walks payload, removes forbidden field names and PII-looking values,
 * returns surviving props + a rejection report.
 *
 * Verbose mode = dev only. Production MUST NOT pass `bypassWhitelist=true`.
 */
export function sanitizePayload(
  props: Record<string, unknown>,
  allowedFields: ReadonlySet<string>,
  options: { bypassWhitelist?: boolean; verbose?: boolean } = {},
): { cleaned: Record<string, unknown>; rejections: FieldRejection[] } {
  const cleaned: Record<string, unknown> = {};
  const rejections: FieldRejection[] = [];

  const visit = (input: unknown, path: string): unknown => {
    if (input === null || input === undefined) return input;
    if (Array.isArray(input)) {
      return input.map((v, idx) => visit(v, `${path}[${idx}]`));
    }
    if (typeof input === 'object') {
      const obj = input as Record<string, unknown>;
      const out: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(obj)) {
        const childPath = path ? `${path}.${k}` : k;
        const { forbidden, code } = isForbiddenFieldName(k);
        if (forbidden) {
          rejections.push({
            path: childPath,
            field: k,
            reason_code: code ?? 'F-?',
            reason: `forbidden field name (${code ?? 'F-?'})`,
          });
          if (options.verbose) {
            // eslint-disable-next-line no-console
            console.warn(`[analytics] dropped field ${childPath} (${code})`);
          }
          continue;
        }
        // Top-level enforcement of whitelist: only for top-level keys inside props
        if (path === '' && !options.bypassWhitelist && !allowedFields.has(k)) {
          rejections.push({
            path: childPath,
            field: k,
            reason_code: 'WHITELIST',
            reason: 'field not in event schema whitelist',
          });
          if (options.verbose) {
            // eslint-disable-next-line no-console
            console.warn(`[analytics] dropped field ${childPath} (not whitelisted)`);
          }
          continue;
        }
        const visited = visit(v, childPath);
        if (visited !== undefined) out[k] = visited;
      }
      return out;
    }
    // primitive: PII regex
    const { pii, pattern } = detectPII(input);
    if (pii) {
      rejections.push({
        path,
        field: path,
        reason_code: 'PII_PATTERN',
        reason: `value matches ${pattern} pattern`,
      });
      if (options.verbose) {
        // eslint-disable-next-line no-console
        console.warn(`[analytics] dropped PII value at ${path} (${pattern})`);
      }
      return undefined;
    }
    return input;
  };

  const result = visit(props, '') as Record<string, unknown>;
  for (const [k, v] of Object.entries(result)) {
    if (v !== undefined) cleaned[k] = v;
  }
  return { cleaned, rejections };
}

/* ---------- Submission-id HMAC hash (forbidden-fields §5) ---------- */

/**
 * Hashes a raw submission_id into the 8-char hex form used in analytics payloads.
 *
 * Algorithm (per forbidden-fields-v1.md §5):
 *   hash = HMAC-SHA256(submission_id, ANALYTICS_SALT).slice(0, 8)
 *
 * Phase 1: the SDK accepts a pre-hashed value from the backend (the hash is
 *   computed by the analytics receiver, not the client). The client only carries
 *   the 8-char hash. This helper is exported so unit tests + dev tools can
 *   produce hashes locally given the salt.
 *
 * Web Crypto availability: browser-only. Server-side hashing is preferred.
 */
export async function hashSubmissionId(
  submissionId: string,
  salt: string,
): Promise<string> {
  if (typeof crypto === 'undefined' || !crypto.subtle) {
    throw new Error('hashSubmissionId: Web Crypto unavailable');
  }
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(salt),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(submissionId));
  const hex = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return hex.slice(0, 8);
}

/* ---------- Top-level validateAndClean (used by index.ts) ---------- */

export interface ValidateOptions {
  /** When true, skip field whitelist check. DEV-ONLY. Production must NOT use this. */
  bypassWhitelist?: boolean;
  /** When true, log rejections to console. DEV-ONLY. */
  verbose?: boolean;
  /** When true, throw AnalyticsValidationError if hard_rejected. */
  throwOnReject?: boolean;
}

export function validateEventPayload(
  event: AnalyticsEventName,
  props: Record<string, unknown>,
  options: ValidateOptions = {},
): ValidationResult<Record<string, unknown>> {
  const allowed = getAllowedFields(event);
  const { cleaned, rejections } = sanitizePayload(props, allowed, {
    bypassWhitelist: options.bypassWhitelist === true,
    verbose: options.verbose === true,
  });

  const hard =
    rejections.some(
      (r) =>
        r.reason_code !== 'WHITELIST' &&
        r.reason_code !== 'SCHEMA',
    );

  // Run Zod schema against cleaned props for type-level validation.
  const schema = EVENT_SCHEMAS[event] as z.ZodObject<z.ZodRawShape> | undefined;
  if (!schema || typeof schema.safeParse !== 'function') {
    rejections.push({
      path: '',
      field: 'event',
      reason_code: 'SCHEMA',
      reason: 'unknown event name',
    });
    return {
      ok: false,
      rejections,
      hard_rejected: true,
    };
  }
  const parsed = schema.safeParse(cleaned);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      rejections.push({
        path: issue.path.join('.'),
        field: issue.path[issue.path.length - 1]?.toString() ?? '?',
        reason_code: 'SCHEMA',
        reason: issue.message,
      });
    }
  }

  if (options.throwOnReject && hard) {
    throw new AnalyticsValidationError(rejections);
  }

  return {
    ok: parsed.success && rejections.length === 0,
    value: parsed.success ? (parsed.data as Record<string, unknown>) : undefined,
    rejections,
    hard_rejected: hard,
  };
}