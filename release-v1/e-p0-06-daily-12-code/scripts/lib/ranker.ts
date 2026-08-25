/**
 * SEE EARTH V1 · E-P0-06 · Ranker (4-level weight scoring)
 * Source: eligibility-v1.md §5
 *
 * Stable, deterministic scoring.  No randomness.  Tie-breaker falls through
 * to (captured_at DESC, published_at DESC, id ASC).
 */

import type { MomentRow } from './types';

interface RankedMoment extends MomentRow {
  score: number;
}

/**
 * P0 · source_type weight.
 *  witness=1000  ·  editorial=500  ·  seed=0
 */
function sourceTypeScore(m: MomentRow): number {
  switch (m.source_type) {
    case 'witness':   return 1000;
    case 'editorial': return 500;
    case 'seed':      return 0;
    default:          return 0;
  }
}

/**
 * P2 · rights quality bonus.
 *  cleared > editorial_owned > cc_* > public_domain
 *  In our schema: 'all_rights_reserved' ~= 'editorial_owned'
 *  'cc0' / 'cc_by' / 'cc_by_sa' ~= 'cc_*' bucket.
 */
function rightsBonus(m: MomentRow): number {
  switch (m.rights) {
    case 'all_rights_reserved':  return 80;
    case 'cc_by':
    case 'cc_by_sa':             return 60;
    case 'cc0':                  return 40;
    case 'unknown':              return 0;
    default:                     return 0;
  }
}

/**
 * P1 · captured_at recency.
 *   -1 per hour of age (smaller = more recent → higher score).
 *   `referenceNow - captured_at` is in ms; divide by 3_600_000.
 *
 * NOTE: hours-floor (Math.floor) keeps the value monotonic so the ranker
 * remains a strict total order (no equal-tie collisions from float jitter).
 */
function recencyScore(m: MomentRow, referenceNow: Date): number {
  const ageMs = referenceNow.getTime() - new Date(m.captured_at).getTime();
  const hours = ageMs / 3_600_000;
  return -Math.floor(hours);
}

/**
 * Tie-breaker comparator (after score equality).
 *  1. captured_at DESC (more recent wins)
 *  2. published_at DESC (more recent wins)
 *  3. moment id ASC (deterministic)
 */
function tieBreak(a: RankedMoment, b: RankedMoment): number {
  const captA = new Date(a.captured_at).getTime();
  const captB = new Date(b.captured_at).getTime();
  if (captA !== captB) return captB - captA;

  const pubA = a.published_at ? new Date(a.published_at).getTime() : 0;
  const pubB = b.published_at ? new Date(b.published_at).getTime() : 0;
  if (pubA !== pubB) return pubB - pubA;

  return a.id.localeCompare(b.id);
}

/**
 * Score a single candidate.
 */
export function scoreCandidate(m: MomentRow, referenceNow: Date): number {
  return sourceTypeScore(m) + rightsBonus(m) + recencyScore(m, referenceNow);
}

/**
 * Rank the candidate pool.
 *  - Filters out non-approved / unknown source_type (defence in depth).
 *  - Stable: identical scores are ordered by tieBreak.
 */
export function rankCandidates(
  candidates: readonly MomentRow[],
  referenceNow: Date = new Date(),
): RankedMoment[] {
  const filtered = candidates.filter(
    (m) => m.source_type === 'witness'
       || m.source_type === 'seed'
       || m.source_type === 'editorial',
  );

  const scored: RankedMoment[] = filtered
    .map((m) => ({ ...m, score: scoreCandidate(m, referenceNow) }));

  // primary sort: score DESC
  scored.sort((a, b) => {
    if (a.score !== b.score) return b.score - a.score;
    return tieBreak(a, b);
  });

  return scored;
}

/**
 * Group candidates by city (preserves score order within each group).
 */
export function groupByCity(
  ranked: readonly RankedMoment[],
): Map<string, RankedMoment[]> {
  const out = new Map<string, RankedMoment[]>();
  for (const m of ranked) {
    const arr = out.get(m.city_id);
    if (arr) arr.push(m);
    else out.set(m.city_id, [m]);
  }
  return out;
}