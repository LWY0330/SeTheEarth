/* ============================================================
   SEE EARTH V1 · E-P0-07 Analytics · Consent / Privacy Banner Logic
   ------------------------------------------------------------
   - Source of truth: 07-设计师设计参考/release-v1/analytics-events/
       consent-placement-v1.md (C-01 ~ C-08)
   - C-01: First-visit Privacy summary banner (dismissible).
     Session storage marker: "privacy_summary_dismissed_v1".
     The SDK EXPOSES show / wasDismissed helpers so the banner UI can
     coordinate without coupling.
   - C-02 ~ C-08: No analytics coupling required (per §5 of consent-placement).
   - Important: showing the banner DOES NOT block analytics. Analytics is
     allowed to fire from the very first edition_viewed (per consent-placement
     §3 C-01 "埋点联动"). Closing the banner does not create an event.
   ============================================================ */

const CONSENT_KEY = 'privacy_summary_dismissed_v1';

export interface ConsentState {
  /** True if the user has dismissed the C-01 banner this session. */
  dismissed: boolean;
  /** True if this is the very first visit (no sessionStorage marker at all). */
  firstVisit: boolean;
}

/** Read current consent state from sessionStorage (no side effects). */
export function readConsentState(): ConsentState {
  if (typeof window === 'undefined' || typeof window.sessionStorage === 'undefined') {
    return { dismissed: false, firstVisit: true };
  }
  const raw = window.sessionStorage.getItem(CONSENT_KEY);
  return {
    dismissed: raw === '1',
    firstVisit: raw === null,
  };
}

/** Mark C-01 as dismissed for this session. Idempotent. */
export function markConsentDismissed(): void {
  if (typeof window === 'undefined' || typeof window.sessionStorage === 'undefined') return;
  window.sessionStorage.setItem(CONSENT_KEY, '1');
}

/** Reset C-01 (used by dev tools only; never call in production UI). */
export function resetConsent(): void {
  if (typeof window === 'undefined' || typeof window.sessionStorage === 'undefined') return;
  window.sessionStorage.removeItem(CONSENT_KEY);
}