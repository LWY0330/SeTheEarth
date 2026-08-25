// SEE EARTH V1 · Phase 2 · alpha-api · /api/health
// -------------------------------------------------
// Liveness check endpoint. Verifies:
//   1. Deployment is reachable
//   2. Sentry init succeeded (if SENTRY_DSN is set)
//   3. Required env vars are present
//
// Returns 200 on healthy, 503 on missing critical config.
//
// Reference:
//   - release-v1/api-contract/contract-decisions-v1.md §6 (Universal Error Envelope)
//   - api/_lib/sentry-server.ts (ErrorCategory enum)

import { NextResponse } from 'next/server';
import {
  initServerSentry,
  ErrorCategorySchema,
  type ErrorCategory,
} from '../../../_lib/sentry-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic'; // Never cache health checks

interface HealthStatus {
  status: 'ok' | 'degraded';
  service: 'see-earth-api';
  version: string;
  env: string;
  commit: string | null;
  uptime_seconds: number;
  checks: {
    sentry_initialized: boolean;
    supabase_url_present: boolean;
    service_role_key_present: boolean;
    direct_url_present: boolean;
    node_env: string;
  };
}

const REQUIRED_ENV: ReadonlyArray<keyof HealthStatus['checks']> = [
  'supabase_url_present',
  'service_role_key_present',
  'direct_url_present',
];

/** Process start timestamp captured at module load */
const PROCESS_START = Date.now();

export async function GET(): Promise<NextResponse> {
  // Ensure Sentry is initialized in this runtime (idempotent)
  const sentryActive = initServerSentry();

  const supabaseUrl = process.env['SUPABASE_URL'];
  const serviceRoleKey = process.env['SUPABASE_SERVICE_ROLE_KEY'];
  const directUrl = process.env['DIRECT_URL'];
  const nodeEnv = process.env['NODE_ENV'] ?? 'development';

  const checks: HealthStatus['checks'] = {
    sentry_initialized: sentryActive,
    supabase_url_present: Boolean(supabaseUrl),
    service_role_key_present: Boolean(serviceRoleKey),
    direct_url_present: Boolean(directUrl),
    node_env: nodeEnv,
  };

  const missingRequired = REQUIRED_ENV.filter((k) => !checks[k]);

  const body: HealthStatus = {
    status: missingRequired.length === 0 ? 'ok' : 'degraded',
    service: 'see-earth-api',
    version: '0.1.0-alpha',
    env: process.env['VERCEL_ENV'] ?? process.env['VITE_ENV'] ?? 'development',
    commit: process.env['VERCEL_GIT_COMMIT_SHA'] ?? null,
    uptime_seconds: Math.round((Date.now() - PROCESS_START) / 1000),
    checks,
  };

  if (missingRequired.length > 0) {
    const category: ErrorCategory = ErrorCategorySchema.SERVER_5XX;
    // Log degraded state via Sentry (if available) + console
    try {
      const { logServerError } = await import('../../../_lib/sentry-server');
      logServerError({
        category,
        error: new Error(
          `/api/health: missing required env vars: ${missingRequired.join(', ')}`,
        ),
        component: 'health-api',
        httpStatus: 503,
        context: { missing: missingRequired },
      });
    } catch {
      // logServerError itself failed — fall back to console
      // eslint-disable-next-line no-console
      console.error('[health-api] degraded', { missing: missingRequired });
    }

    return NextResponse.json(body, { status: 503 });
  }

  return NextResponse.json(body, { status: 200 });
}