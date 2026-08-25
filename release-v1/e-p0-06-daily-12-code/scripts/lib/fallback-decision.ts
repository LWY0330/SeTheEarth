/**
 * SEE EARTH V1 · E-P0-06 · Fallback decision
 * Source: fallback-v1.md §2.1
 *
 * Pure decision function — given slots_with_moment, decide whether the
 * resulting Edition should be flagged as is_fallback.
 */

import type { FallbackReason } from './types';

export type FallbackTier = 'none' | 'partial_fallback' | 'full_fallback';

export interface FallbackDecision {
  is_fallback: boolean;
  fallback_reason: FallbackReason | null;
  /** UI hint (D-P0-04 state matrix alignment). */
  tier: FallbackTier;
}

/**
 * §2.1 trigger table:
 *   slots_with_moment >= 8   → status='preview' (no fallback)
 *   4 ≤ slots_with_moment < 8 → is_fallback=TRUE, reason='no_sufficient_candidates'
 *   slots_with_moment < 4    → full fallback (handled by caller; returns 'full_fallback')
 */
export function decideFallback(
  filled_count: number,
  options: { reason?: FallbackReason } = {},
): FallbackDecision {
  const reason: FallbackReason = options.reason ?? 'no_sufficient_candidates';

  if (filled_count >= 8) {
    return { is_fallback: false, fallback_reason: null, tier: 'none' };
  }
  if (filled_count >= 4) {
    return { is_fallback: true, fallback_reason: reason, tier: 'partial_fallback' };
  }
  return { is_fallback: true, fallback_reason: reason, tier: 'full_fallback' };
}