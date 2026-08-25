/**
 * SEE EARTH V1 · E-P0-06 · Slot filler (12-position packer)
 * Source: eligibility-v1.md §6 + group-process-v1.md Step 6
 *
 * Deterministic algorithm:
 *   1.  For each city in LOCKED rotation, pick the top-ranked candidate.
 *   2.  Backfill remaining slots with the next-best candidates (≤2 per city).
 *   3.  Top up to 12 with placeholder fallback slots.
 *
 * Input: ranked & grouped candidates.
 * Output: exactly 12 FilledSlot rows.
 */

import type { FilledSlot, SourceType, SlotFallbackReason } from './types';
import { CITIES_12 } from './types';
import type { RankedMoment } from './ranker';

export interface SlotFillResult {
  filled: FilledSlot[];
  /** IDs that weren't used (for diagnostic / dropped reporting). */
  unused: string[];
  /** Total non-placeholder slots (slots_with_moment). */
  filled_count: number;
}

const MAX_PER_CITY = 2;

function makePlaceholder(position: number): FilledSlot {
  return {
    position,
    moment_id: null,
    city_id: null,
    source_type: 'editorial',
    fallback_reason: 'no_candidate_for_city',
    is_editorial_fill: false,
  };
}

/**
 * Fill 12 slots from a ranked candidate pool.
 */
export function fillSlots(
  ranked: readonly RankedMoment[],
  cityRotation: readonly string[] = CITIES_12,
): SlotFillResult {
  const filled: FilledSlot[] = [];
  const usedMomentIds = new Set<string>();
  const usedPerCity = new Map<string, number>();
  const unused: string[] = [];

  // ---- Step 1: 12-city rotation, one per city if available
  for (const city of cityRotation) {
    const best = ranked.find(
      (m) => m.city_id === city && !usedMomentIds.has(m.id),
    );
    if (!best) continue;

    filled.push({
      position: filled.length + 1,
      moment_id: best.id,
      city_id: best.city_id,
      source_type: best.source_type as SourceType,
      fallback_reason: null,
      is_editorial_fill: best.source_type !== 'witness',
    });
    usedMomentIds.add(best.id);
    usedPerCity.set(city, 1);
    if (filled.length === 12) break;
  }

  // ---- Step 2: backfill (≤2 per city)
  if (filled.length < 12) {
    for (const candidate of ranked) {
      if (filled.length >= 12) break;
      if (usedMomentIds.has(candidate.id)) continue;

      const used = usedPerCity.get(candidate.city_id) ?? 0;
      if (used >= MAX_PER_CITY) continue;

      filled.push({
        position: filled.length + 1,
        moment_id: candidate.id,
        city_id: candidate.city_id,
        source_type: candidate.source_type as SourceType,
        fallback_reason: null,
        is_editorial_fill: candidate.source_type !== 'witness',
      });
      usedMomentIds.add(candidate.id);
      usedPerCity.set(candidate.city_id, used + 1);
    }
  }

  // ---- Step 3: top up to 12 with placeholders
  while (filled.length < 12) {
    filled.push(makePlaceholder(filled.length + 1));
  }

  // ---- Unused diagnostics
  for (const m of ranked) {
    if (!usedMomentIds.has(m.id)) unused.push(m.id);
  }

  return {
    filled,
    unused,
    filled_count: filled.filter((s) => s.moment_id !== null).length,
  };
}