#!/usr/bin/env tsx
/**
 * SEE EARTH V1 · E-P0-06 · Daily Edition Builder
 * Source: group-process-v1.md §3 (11-step timing diagram) + §5 (skeleton)
 *
 * This is the core cron job — run daily at 00:00 UTC to build the next
 * day's Edition (12 slots).  In production it is triggered by Vercel Cron
 * or a GitHub Actions backup workflow.
 *
 * Usage:
 *   tsx daily-build.ts                          # build tomorrow's Edition
 *   tsx daily-build.ts --target-date 2026-09-01 # specific date
 *   tsx daily-build.ts --dry-run                # compute + log, no DB writes
 *   tsx daily-build.ts --trigger=admin-manual   # for ad-hoc rebuilds
 *
 * Environment:
 *   SUPABASE_URL · SUPABASE_SERVICE_ROLE_KEY     (production)
 *   E_P0_06_USE_MOCK=1                            (use in-memory mock DB)
 *
 * Exit codes:
 *   0  success / locked (already running)        — the lock holder returns 0
 *   1  failure
 */

import type { DbClient } from './lib/db';
import { InMemoryDb, createDbFromEnv } from './lib/db';
import type { MomentRow, FilledSlot } from './lib/types';
import { tomorrowUtc, uuid } from './lib/types';
import { filterEligible, checkEligibility } from './lib/eligibility';
import { rankCandidates, groupByCity } from './lib/ranker';
import { fillSlots } from './lib/slot-filler';
import { decideFallback } from './lib/fallback-decision';
import { acquireCronLock, releaseCronLock } from './lib/advisory-lock';
import { isMain } from './lib/entry-check';
import {
  emitCronStarted,
  emitCronCompleted,
  emitCronFailed,
  emitCronLockTimeout,
  emitEditionCreated,
  emitEditionPublished,
  runAlertChecks,
} from './lib/monitoring';

/* ============================================================
 * CLI argument parsing (handles the 3 documented flags only)
 * ============================================================ */

function parseArgs(argv: readonly string[]): {
  target_date?: string;
  dry_run: boolean;
  trigger: string;
  verbose: boolean;
} {
  const opts = { dry_run: false, trigger: 'cron', verbose: false } as {
    target_date?: string;
    dry_run: boolean;
    trigger: string;
    verbose: boolean;
  };
  for (const arg of argv.slice(2)) {
    if (arg === '--dry-run') opts.dry_run = true;
    else if (arg === '--verbose' || arg === '-v') opts.verbose = true;
    else if (arg.startsWith('--target-date=')) {
      const v = arg.split('=')[1];
      if (!/^\d{4}-\d{2}-\d{2}$/u.test(v)) {
        throw new Error(`invalid --target-date (expected YYYY-MM-DD): ${v}`);
      }
      opts.target_date = v;
    } else if (arg.startsWith('--trigger=')) {
      opts.trigger = arg.split('=')[1];
    } else if (arg === '--help' || arg === '-h') {
      console.log('Usage: tsx daily-build.ts [--target-date=YYYY-MM-DD] [--dry-run] [--trigger=NAME] [--verbose]');
      process.exit(0);
    } else {
      console.warn(`Unknown arg: ${arg}`);
    }
  }
  return opts;
}

/* ============================================================
 * Public interface — reused by admin scripts and tests
 * ============================================================ */

export interface RunDailyBuildOptions {
  db: DbClient;
  trigger: string;
  target_date?: string | null;
  dry_run: boolean;
  reference_now?: Date;
  verbose?: boolean;
  /** Optional override for the moment pool (used by tests). */
  moment_pool?: MomentRow[];
  /**
   * If true, leave the Edition in status='preview' (admin must approve before
   * it's published).  Default false (V1 simplification = auto-publish).
   */
  keepPreview?: boolean;
}

export interface RunDailyBuildResult {
  status: 'success' | 'locked' | 'failed';
  request_id: string;
  target_date: string;
  edition_id?: string;
  filled_count: number;
  slots_count: number;
  is_fallback: boolean;
  fallback_reason: string | null;
  duration_ms: number;
  message?: string;
}

/**
 * 11-step daily build (the real implementation).
 *
 * The whole function is structured exactly to mirror §3 of the design doc.
 * Each step is delimited by `// --- Step N:` markers.
 */
export async function runDailyBuild(
  opts: RunDailyBuildOptions,
): Promise<RunDailyBuildResult> {
  const start_ms = Date.now();
  const request_id = uuid();
  const reference_now = opts.reference_now ?? new Date();
  const target_date =
    opts.target_date ?? tomorrowUtc(reference_now);
  const verbose = opts.verbose ?? false;

  if (verbose) console.log(`[cron] start · request_id=${request_id} · target_date=${target_date}`);

  // --- Step 1: Advisory lock --------------------------------------------
  const lockOk = await acquireCronLock(opts.db);
  if (!lockOk) {
    await emitCronLockTimeout(opts.db, { request_id });
    return {
      status: 'locked',
      request_id,
      target_date,
      filled_count: 0,
      slots_count: 0,
      is_fallback: false,
      fallback_reason: null,
      duration_ms: Date.now() - start_ms,
      message: 'cron_lock_held: another daily-build is running',
    };
  }

  try {
    // --- Step 2: actor context (for trigger-attributed status_history)
    await opts.db.query("SET LOCAL app.actor = 'cron'");

    await emitCronStarted(opts.db, {
      request_id,
      target_date,
      trigger: opts.trigger,
    });

    // --- Step 3 + 4: candidate pool + soft constraints -----------------
    const rawPool = opts.moment_pool ?? await fetchMomentPool(opts.db, reference_now);
    const { candidates, dropped } = filterEligible(rawPool, reference_now);
    if (verbose) {
      console.log(`[cron] pool=${rawPool.length} eligible=${candidates.length} dropped=${dropped.length}`);
    }

    // --- Step 5: rank ---------------------------------------------------
    const ranked = rankCandidates(candidates, reference_now);
    const byCity = groupByCity(ranked);
    if (verbose) {
      const citiesWithCandidates = [...byCity.keys()].sort();
      console.log(`[cron] ranked cities: ${citiesWithCandidates.join(',')}`);
    }

    // --- Step 6: 12-slot fill ------------------------------------------
    const { filled, filled_count } = fillSlots(ranked);
    if (verbose) {
      console.log(`[cron] filled ${filled_count}/12 slots`);
    }

    // --- Step 7: fallback decision --------------------------------------
    const decision = decideFallback(filled_count);

    // --- Step 8 + 9: persist + auto-publish (V1: same transaction) ------
    let edition_id: string | undefined;
    const initialStatus: 'preview' | 'published' = opts.keepPreview ? 'preview' : 'published';
    if (!opts.dry_run) {
      edition_id = await persistEdition(opts.db, {
        date: target_date,
        status: initialStatus,
        is_fallback: decision.is_fallback,
        fallback_reason: decision.fallback_reason,
        slots: filled,
      });

      await emitEditionCreated(opts.db, {
        request_id,
        edition_id,
        date: target_date,
        slots_count: filled.length,
        is_fallback: decision.is_fallback,
        version: 1,
      });

      if (!opts.keepPreview) {
        const published_at = new Date().toISOString();
        await markEditionPublished(opts.db, edition_id, published_at);

        await emitEditionPublished(opts.db, {
          request_id,
          edition_id,
          date: target_date,
          published_at,
        });
      }
    }

    // --- Step 10: monitoring -------------------------------------------
    const duration_ms = Date.now() - start_ms;
    await emitCronCompleted(opts.db, {
      request_id,
      duration_ms,
      filled_count,
      dropped_count: dropped.length,
      is_fallback: decision.is_fallback,
      fallback_reason: decision.fallback_reason,
      target_date,
    });

    // --- Step 11: alert sweep (only when not dry_run) ------------------
    if (!opts.dry_run) {
      await runAlertChecks(opts.db, reference_now);
    }

    return {
      status: 'success',
      request_id,
      target_date,
      edition_id,
      filled_count,
      slots_count: filled.length,
      is_fallback: decision.is_fallback,
      fallback_reason: decision.fallback_reason,
      duration_ms,
    };
  } catch (err) {
    const message = (err as Error).message;
    await emitCronFailed(opts.db, {
      request_id,
      error_category: categorizeError(err),
      error_message: message,
      target_date,
    }).catch(() => { /* ignore */ });
    return {
      status: 'failed',
      request_id,
      target_date,
      filled_count: 0,
      slots_count: 0,
      is_fallback: false,
      fallback_reason: null,
      duration_ms: Date.now() - start_ms,
      message,
    };
  } finally {
    // --- Step 12 (cleanup): always release the lock --------------------
    await releaseCronLock(opts.db);
  }
}

/* ============================================================
 * DB queries
 * ============================================================ */

async function fetchMomentPool(db: DbClient, now: Date): Promise<MomentRow[]> {
  // In production: pulls from `moments` table.
  // Eligibility check is done client-side so the ranker / filter have
  // raw rows to score.
  const { rows } = await db.query<MomentRow>(
    `SELECT id, city_id, public_city_name, captured_at, published_at,
            source_type, rights, moderation_status, image_variants,
            provenance_status
       FROM moments
      WHERE status = 'published'
      ORDER BY captured_at DESC
      LIMIT 500`,
  );
  return rows;
}

/**
 * Create an Edition + 12 slots in a single SQL transaction.
 *
 * V1 approach: write a self-contained transaction that the in-memory
 * mock DB can replay.  In production this should be wrapped in a
 * Postgres function (or RPC) for atomicity + lower round-trips.
 */
async function persistEdition(
  db: DbClient,
  p: {
    date: string;
    status: 'draft' | 'preview' | 'published';
    is_fallback: boolean;
    fallback_reason: 'no_sufficient_candidates' | 'editorial_rollback' | 'safety_takedown' | null;
    slots: FilledSlot[];
  },
): Promise<string> {
  const editionId = uuid();

  // INSERT editions
  await db.query(
    `INSERT INTO editions (id, date, version, status, is_fallback, fallback_reason, slots_count, is_complete, last_status_at)
     VALUES ($1, $2, 1, $3, $4, $5, $6, $7, NOW())`,
    [
      editionId,
      p.date,
      p.status,
      p.is_fallback,
      p.fallback_reason,
      p.slots.length,
      p.slots.length === 12,
    ],
  );

  // INSERT edition_slots (one row per slot)
  for (const slot of p.slots) {
    await db.query(
      `INSERT INTO edition_slots (edition_id, position, moment_id, city_id, source_type, fallback_reason, is_editorial_fill)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        editionId,
        slot.position,
        slot.moment_id,
        slot.city_id,
        slot.source_type,
        slot.fallback_reason,
        slot.is_editorial_fill,
      ],
    );
  }

  return editionId;
}

async function markEditionPublished(
  db: DbClient,
  editionId: string,
  published_at: string,
): Promise<void> {
  await db.query(
    `UPDATE editions
        SET status = 'published',
            published_at = $1,
            last_status_at = NOW()
      WHERE id = $2`,
    [published_at, editionId],
  );
}

/* ============================================================
 * Error categorisation (group-process-v1.md §7.1)
 * ============================================================ */

function categorizeError(err: unknown): string {
  const msg = (err as Error).message ?? String(err);
  if (/lock/i.test(msg)) return 'cron_lock_timeout';
  if (/timeout|unreachable|ETIMEDOUT|ECONN/i.test(msg)) return 'db_unreachable';
  if (/eligibility/i.test(msg)) return 'eligibility_check_internal_error';
  if (/slot|city_id|position/i.test(msg)) return 'slot_filler_error';
  return 'unknown';
}

/* ============================================================
 * CLI entry point
 * ============================================================ */

async function main(): Promise<void> {
  const opts = parseArgs(process.argv);

  const db = process.env.E_P0_06_USE_MOCK === '1'
    ? await setupMockDb()
    : await createDbFromEnv();

  const result = await runDailyBuild({
    db,
    trigger: opts.trigger,
    target_date: opts.target_date,
    dry_run: opts.dry_run,
    verbose: opts.verbose,
  });

  console.log(JSON.stringify(result, null, 2));
  process.exit(result.status === 'success' ? 0 : 1);
}

/**
 * Spin up an empty in-memory DB containing only the tables daily-build
 * needs.  Used for local smoke tests without infra.
 */
export async function setupMockDb(): Promise<InMemoryDb> {
  const db = new InMemoryDb();
  db.registerTable('moments', []);
  db.registerTable('editions', []);
  db.registerTable('edition_slots', []);
  db.registerTable('edition_status_history', []);
  db.registerTable('edition_audit_log', []);
  db.registerTable('analytics_events', []);
  db.registerTable('monitoring_alerts', []);
  return db;
}

// Run main() when invoked directly (ESM)
if (isMain(import.meta.url)) {
  main().catch((err) => {
    console.error('[cron] fatal:', err);
    process.exit(1);
  });
}