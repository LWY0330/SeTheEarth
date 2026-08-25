/**
 * SEE EARTH V1 · E-P0-06 · Shared types
 * Source: edition-entity-v1.md + E-P0-09 zod-schemas/edition.ts + moment.ts
 *
 * Plain TypeScript types (no zod dependency at runtime to keep scripts
 * 100% self-contained).  Hand-aligned 1:1 with zod schemas — DO NOT
 * silently diverge.
 */

export type EditionStatus =
  | 'draft' | 'preview' | 'scheduled'
  | 'published' | 'replaced' | 'retracted';

export type FallbackReason =
  | 'no_sufficient_candidates'
  | 'editorial_rollback'
  | 'safety_takedown';

export type SourceType = 'witness' | 'seed' | 'editorial';

export type SlotFallbackReason =
  | 'no_candidate_for_city'
  | 'withdrawn_by_author'
  | 'moderation_rejected'
  | 'missing_rights'
  | 'duplicate_in_edition'
  | 'time_bucket_invalid'
  | 'fallback_curated';

export type CityId = string;

/**
 * PublicMoment shape (subset used by daily-build).
 * Mirrors PublicMomentSchema from zod-schemas/moment.ts.
 */
export interface PublicMoment {
  id: string;
  city_id: CityId;
  public_city_name: string;
  captured_at: string;        // RFC3339 with offset
  captured_at_tz?: string;
  published_at?: string;
  source_type: SourceType;
  rights: 'cc_by' | 'cc_by_sa' | 'cc0' | 'all_rights_reserved' | 'unknown';
  moderation_status: 'pending' | 'approved' | 'rejected' | 'flagged';
  /** minimal: at least one variant.  V1 only counts the array length. */
  image_variants: Array<{ variant: string; url: string }>;
}

/**
 * Internal Moment row shape (read directly from moments table by cron).
 */
export interface MomentRow {
  id: string;
  city_id: string;
  public_city_name: string;
  captured_at: string;          // timestamptz -> string
  published_at: string | null;
  source_type: SourceType;
  rights: PublicMoment['rights'];
  moderation_status: PublicMoment['moderation_status'];
  image_variants: unknown[];    // jsonb
  /** for ranking */
  provenance_status?: 'self_reported' | 'trusted_source' | 'editorial' | 'unknown';
}

export interface FilledSlot {
  position: number;             // 1..12
  moment_id: string | null;
  city_id: string | null;
  source_type: SourceType;
  fallback_reason: SlotFallbackReason | null;
  is_editorial_fill: boolean;
}

export interface EditionRow {
  id: string;
  date: string;                 // 'YYYY-MM-DD'
  version: number;
  status: EditionStatus;
  is_fallback: boolean;
  fallback_reason: FallbackReason | null;
  replaces_edition_id: string | null;
  slots_count: number;
  is_complete: boolean;
  published_at: string | null;
  last_status_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * 12-city LOCKED roster (V1).
 * Source: eligibility-v1.md §3.2 + Brief §B-2.
 * ORDER IS LOCKED — used as the default rotation for slot 6a.
 */
export const CITIES_12: readonly CityId[] = [
  'kyoto',
  'lisbon',
  'shanghai',
  'mexico-city',
  'tokyo',
  'rio',
  'reykjavik',
  'cape-town',
  'london',
  'berlin',
  'rome',
  'sydney',
] as const;

/**
 * Rights whitelist (LOCKED 5 values · eligibility-v1.md §3.5).
 * NOTE: 'public_domain' from eligibility-v1.md is normalised to 'cc0' in DB.
 */
export const RIGHTS_WHITELIST = new Set<PublicMoment['rights']>([
  'cc_by', 'cc_by_sa', 'cc0', 'all_rights_reserved',
]);

/**
 * Helper: today's UTC date string 'YYYY-MM-DD'.
 */
export function todayUtc(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

/**
 * Helper: tomorrow's UTC date string.
 */
export function tomorrowUtc(now: Date = new Date()): string {
  const d = new Date(now);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

/**
 * Generate a UUID v4 (or fall back to crypto.randomUUID shim).
 * Browsers + modern Node have crypto.randomUUID; this is a safety net.
 */
export function uuid(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  // RFC4122 v4 fallback (no crypto API)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}