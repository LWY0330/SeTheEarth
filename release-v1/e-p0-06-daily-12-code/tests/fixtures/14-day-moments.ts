/**
 * SEE EARTH V1 · E-P0-06 · 14-day drill fixtures
 * Source: 14-day-test-plan-v1.md §5.3 + §6 (the locked day-by-day scenario table).
 *
 * For each day, `fixtureForDay(n)` returns a deterministic Moment pool
 * mirroring the LIVE events in src/data/liveMoments.ts (12 cities, 12 base
 * events) plus day-specific mutations:
 *
 *   Day 1  : perfect 12 cities
 *   Day 2  : drop Kyoto candidates → 11 slots + 1 placeholder
 *   Day 3  : perfect
 *   Day 4  : drop Kyoto/Lisbon/Tokyo → 7 slots + 5 placeholders (partial fallback)
 *   Day 5  : perfect
 *   Day 6  : all editorial (no witness)
 *   Day 7  : perfect
 *   Day 8  : drop 8 cities → 4 slots + 8 placeholders (full fallback)
 *   Day 9  : perfect
 *   Day 10 : 3 candidates with rights=pending → dropped
 *   Day 11 : perfect + admin rollback on Day 11 edition
 *   Day 12 : perfect + admin replace_slot on slot 5
 *   Day 13 : cron simulated failure → stale_fallback
 *   Day 14 : perfect + stale_fallback threshold verification
 *
 * Each Moment has the LOCKED schema shape (see MomentRow in scripts/lib/types.ts).
 */

import type { MomentRow } from '../../scripts/lib/types';
import { CITIES_12 } from '../../scripts/lib/types';

/**
 * Canonical 12 base moments — one per LOCKED city.
 * IDs are deterministic (`day0-{city}`) for stable ordering + audit.
 *
 * We synthesise these from the existing v2-phase15 liveMoments.ts in the
 * test runner; the canonical fields (title/description) come from there
 * but the V1 schema needs: id, city_id, public_city_name, captured_at,
 * source_type, rights, moderation_status, image_variants, published_at.
 *
 * Defaults:
 *   source_type    : witness
 *   rights         : cc_by
 *   moderation     : approved
 *   captured_at    : day base time (varies per day for ordering)
 *   image_variants : 1 variant
 */

const DAY_BASE_MS = Date.UTC(2026, 7, 24, 12, 0, 0);   // 2026-08-24T12:00:00Z

const DEFAULT_BASE_ROWS: ReadonlyArray<Omit<MomentRow, 'captured_at' | 'published_at'>> = [
  // id,        city_id,      public_city_name,    source_type, rights
  ['day0-kyoto',      'kyoto',      'Kyoto',     'witness', 'cc_by'],
  ['day0-lisbon',     'lisbon',     'Lisbon',    'witness', 'cc_by'],
  ['day0-shanghai',   'shanghai',   'Shanghai',  'witness', 'cc_by'],
  ['day0-mexico',     'mexico-city','Mexico City','witness','cc_by'],
  ['day0-tokyo',      'tokyo',      'Tokyo',     'witness', 'cc_by'],
  ['day0-rio',        'rio',        'Rio de Janeiro','witness','cc_by'],
  ['day0-reykjavik',  'reykjavik',  'Reykjavík', 'witness', 'cc_by'],
  ['day0-cape',       'cape-town',  'Cape Town', 'witness', 'cc_by'],
  ['day0-london',     'london',     'London',    'witness', 'cc_by'],
  ['day0-berlin',     'berlin',     'Berlin',    'witness', 'cc_by'],
  ['day0-rome',       'rome',       'Rome',      'witness', 'cc_by'],
  ['day0-sydney',     'sydney',     'Sydney',    'witness', 'cc_by'],
].map(([id, city_id, public_city_name, source_type, rights]) => ({
  id,
  city_id,
  public_city_name,
  source_type,
  rights,
  moderation_status: 'approved' as const,
  image_variants: [{ variant: 'card_640', url: `https://cdn.example.com/moments/${id}.jpg` }],
  provenance_status: 'self_reported' as const,
}));

function iso(ms: number): string {
  return new Date(ms).toISOString();
}

function buildBasePool(dayIndex: number): MomentRow[] {
  const offset = dayIndex * 86_400_000;       // 1 day
  return DEFAULT_BASE_ROWS.map((b) => ({
    ...b,
    captured_at: iso(DAY_BASE_MS + offset - 3_600_000),  // 1h before noon
    published_at: iso(DAY_BASE_MS + offset - 1_800_000), // 30min before noon
  }));
}

/**
 * The 14-day fixture schedule (locked).
 */
export interface DayFixture {
  day: number;
  description: string;
  expectedFilled: number;
  expectFallback: boolean;
  expectFallbackReason: 'no_sufficient_candidates' | 'editorial_rollback' | null;
  adminOps: AdminOp[];
  /** If true, simulate cron failure (stale_fallback + last_known_good). */
  simulateCronFailure: boolean;
  /** If true, mark edition published_at 25h ago for stale threshold test. */
  makeStale: boolean;
}

export type AdminOp =
  | { type: 'rollback'; onDay: number; reason: string }
  | { type: 'replace_slot'; onDay: number; position: number; newMomentId: string };

/** If true, the cron leaves the Edition in status='preview' (not 'published'). */
export interface DayFixtureExtended extends DayFixture {
  /** When true, do NOT auto-publish — leave Edition in preview for admin ops. */
  keepPreview?: boolean;
}

export const DAY_SCHEDULE: ReadonlyArray<DayFixtureExtended> = [
  { day: 1,  description: 'Perfect 12 cities',     expectedFilled: 12, expectFallback: false, expectFallbackReason: null,                                            adminOps: [], simulateCronFailure: false, makeStale: false },
  { day: 2,  description: 'Drop Kyoto',              expectedFilled: 11, expectFallback: false, expectFallbackReason: null,                                            adminOps: [], simulateCronFailure: false, makeStale: false },
  { day: 3,  description: 'Perfect',                 expectedFilled: 12, expectFallback: false, expectFallbackReason: null,                                            adminOps: [], simulateCronFailure: false, makeStale: false },
  { day: 4,  description: 'Drop 5 cities (partial fallback)', expectedFilled: 7,  expectFallback: true,  expectFallbackReason: 'no_sufficient_candidates',                       adminOps: [], simulateCronFailure: false, makeStale: false },
  { day: 5,  description: 'Perfect',                 expectedFilled: 12, expectFallback: false, expectFallbackReason: null,                                            adminOps: [], simulateCronFailure: false, makeStale: false },
  { day: 6,  description: 'All editorial',           expectedFilled: 12, expectFallback: false, expectFallbackReason: null,                                            adminOps: [], simulateCronFailure: false, makeStale: false },
  { day: 7,  description: 'Perfect',                 expectedFilled: 12, expectFallback: false, expectFallbackReason: null,                                            adminOps: [], simulateCronFailure: false, makeStale: false },
  { day: 8,  description: 'Drop 8 cities (full fallback)', expectedFilled: 4,  expectFallback: true,  expectFallbackReason: 'no_sufficient_candidates',                       adminOps: [], simulateCronFailure: false, makeStale: false },
  { day: 9,  description: 'Perfect',                 expectedFilled: 12, expectFallback: false, expectFallbackReason: null,                                            adminOps: [], simulateCronFailure: false, makeStale: false },
  { day: 10, description: '3 rights=pending',        expectedFilled: 9,  expectFallback: false, expectFallbackReason: null,                                            adminOps: [], simulateCronFailure: false, makeStale: false },
  { day: 11, description: 'Perfect + rollback',      expectedFilled: 12, expectFallback: false, expectFallbackReason: null,                                            adminOps: [{ type: 'rollback', onDay: 11, reason: 'editorial review' }], simulateCronFailure: false, makeStale: false },
  { day: 12, description: 'Perfect + replace slot 5',expectedFilled: 12, expectFallback: false, expectFallbackReason: null,                                            adminOps: [{ type: 'replace_slot', onDay: 12, position: 5, newMomentId: 'day12-replacement-kyoto' }], simulateCronFailure: false, makeStale: false, keepPreview: true },
  { day: 13, description: 'Cron failure (stale)',    expectedFilled: 0,  expectFallback: true,  expectFallbackReason: 'editorial_rollback',                            adminOps: [], simulateCronFailure: true, makeStale: false },
  { day: 14, description: 'Perfect + stale 25h',     expectedFilled: 12, expectFallback: false, expectFallbackReason: null,                                            adminOps: [], simulateCronFailure: false, makeStale: true },
];

/**
 * Generate the Moment pool for a given day (per the LOCKED schedule).
 *
 * Returns the pool that should be returned by Step 3 of group-process-v1.md.
 */
export function fixtureForDay(day: number): MomentRow[] {
  const fixture = DAY_SCHEDULE[day - 1];
  if (!fixture) throw new Error(`no fixture for day ${day}`);

  let pool = buildBasePool(day);

  switch (day) {
    case 2:
      pool = pool.filter((m) => m.city_id !== 'kyoto');
      break;
    case 4:
      // Test plan §6 says filled=7 + fallback=TRUE.  Drop 5 cities so 7 remain
      // (Kyoto, Lisbon, Tokyo + 2 more to match expected count).
      pool = pool.filter((m) => !['kyoto', 'lisbon', 'tokyo', 'mexico-city', 'shanghai'].includes(m.city_id));
      break;
    case 6:
      pool = pool.map((m) => ({ ...m, source_type: 'editorial' as const }));
      break;
    case 8:
      // Drop 8 cities → keep only 4 (rome, london, berlin, sydney).
      pool = pool.filter((m) => ['rome', 'london', 'berlin', 'sydney'].includes(m.city_id));
      break;
    case 10: {
      // Mark 3 candidates with rights=unknown (should be dropped).
      const dropCities = ['mexico-city', 'rome', 'sydney'];
      pool = pool.map((m) => {
        if (dropCities.includes(m.city_id)) {
          return { ...m, rights: 'unknown' as const };
        }
        return m;
      });
      break;
    }
    case 12: {
      // Inject a replacement candidate for slot 5 (tokyo) — older captured_at so
      // cron picks day0-tokyo for slot 5; admin then PATCHes slot 5 → day12-replacement-kyoto.
      // The new moment is eligible (rights cc_by) but loses ranking to day0-tokyo.
      pool.push({
        id: 'day12-replacement-kyoto',
        city_id: 'kyoto',
        public_city_name: 'Kyoto',
        source_type: 'witness',
        rights: 'cc_by',
        moderation_status: 'approved',
        image_variants: [{ variant: 'card_640', url: 'https://cdn.example.com/moments/day12-replacement-kyoto.jpg' }],
        provenance_status: 'self_reported',
        // Older than day0-kyoto (which is captured 1h before noon) — 2h before noon.
        captured_at: iso(DAY_BASE_MS + 12 * 86_400_000 - 7_200_000),
        published_at: iso(DAY_BASE_MS + 12 * 86_400_000 - 6_000_000),
      });
      break;
    }
  }

  return pool;
}

/**
 * Map of `city_id → Moment id` for the canonical pool, for use by tests
 * that want to assert which Moment ended up in which slot.
 */
export function canonicalIdsByCity(pool: readonly MomentRow[]): Map<string, string> {
  const out = new Map<string, string>();
  for (const m of pool) out.set(m.city_id, m.id);
  return out;
}

export const ALL_CITY_IDS = CITIES_12;