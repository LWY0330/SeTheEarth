/**
 * SEE EARTH V1 · E-P0-06 · Eligibility check (5 hard filters)
 * Source: eligibility-v1.md §3
 *
 * Pure-function implementation — given a Moment row, decide whether it may
 * appear in today's Edition candidate pool.
 */

import type { MomentRow } from './types';
import { RIGHTS_WHITELIST, CITIES_12 } from './types';

export type DropReason =
  | 'future_timestamp'
  | 'city_not_in_seed'
  | 'not_published_yet'
  | 'missing_image_variants'
  | 'rights_conflict'
  | 'moderation_pending';

export interface DroppedMoment {
  moment_id: string;
  reason: DropReason;
}

/**
 * 5 hard filters · eligibility-v1.md §3.
 * Returns `null` if moment passes; a DropReason otherwise.
 */
export function checkEligibility(
  m: MomentRow,
  referenceNow: Date = new Date(),
): DropReason | null {
  // 1. captured_at < reference_now (not <=, prevents same-second duplicates)
  if (new Date(m.captured_at).getTime() >= referenceNow.getTime()) {
    return 'future_timestamp';
  }

  // 2. city_id in 12-city whitelist
  if (!CITIES_12.includes(m.city_id)) {
    return 'city_not_in_seed';
  }

  // 3. published_at non-null AND ≤ now
  if (!m.published_at) return 'not_published_yet';
  if (new Date(m.published_at).getTime() > referenceNow.getTime()) {
    return 'not_published_yet';
  }

  // 4. image_variants length ≥ 1
  if (!Array.isArray(m.image_variants) || m.image_variants.length < 1) {
    return 'missing_image_variants';
  }

  // 5. rights in whitelist + moderation approved
  if (!RIGHTS_WHITELIST.has(m.rights)) {
    return 'rights_conflict';
  }
  if (m.moderation_status !== 'approved') {
    return 'moderation_pending';
  }

  return null;
}

/**
 * Filter a raw moment pool down to the eligible subset.
 * Returns { candidates, dropped[] }.
 */
export function filterEligible(
  pool: readonly MomentRow[],
  referenceNow: Date = new Date(),
): { candidates: MomentRow[]; dropped: DroppedMoment[] } {
  const candidates: MomentRow[] = [];
  const dropped: DroppedMoment[] = [];
  const seen = new Set<string>();

  for (const m of pool) {
    if (seen.has(m.id)) continue;     // soft dedup
    seen.add(m.id);

    const reason = checkEligibility(m, referenceNow);
    if (reason === null) {
      candidates.push(m);
    } else {
      dropped.push({ moment_id: m.id, reason });
    }
  }

  return { candidates, dropped };
}