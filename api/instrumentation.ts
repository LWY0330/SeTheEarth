// SEE EARTH V1 · Phase 2 · alpha-api · Next.js instrumentation
// -------------------------------------------------------------
// Triggered once on server startup (Next.js 13+ App Router).
// Source of truth: api/_lib/sentry-server.ts (Phase 1 prep, LOCKED)
//
// Reference:
//   - Next.js instrumentation: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
//   - release-v1/api-contract/contract-decisions-v1.md (Zod + OpenAPI contract)
//   - api/_lib/sentry-server.ts (initServerSentry, ErrorCategory enum mirror)
//
// Behavior:
//   - Production environment is intentionally a no-op (V1.1 will enable alerting).
//   - SENTRY_DSN missing → silent no-op (Phase 1 contract preserved).
//   - Errors logged via logServerError() → tagged with error_category + error_id.

export async function register(): Promise<void> {
  // Dynamic import avoids bundling @sentry/node into client bundles
  const { initServerSentry } = await import('./_lib/sentry-server.js');

  const activated = initServerSentry();

  // eslint-disable-next-line no-console
  console.info(
    `[instrumentation] alpha-api Sentry ${activated ? 'ACTIVATED' : 'skipped (no DSN or production)'}`,
    {
      env: process.env['VERCEL_ENV'] ?? process.env['VITE_ENV'] ?? 'development',
      commit: process.env['VERCEL_GIT_COMMIT_SHA'] ?? 'local',
    },
  );
}