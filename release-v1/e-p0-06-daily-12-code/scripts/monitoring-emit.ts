#!/usr/bin/env tsx
/**
 * SEE EARTH V1 · E-P0-06 · Monitoring emitter CLI
 * Source: group-process-v1.md §8 + fallback-v1.md §5
 *
 * CLI for manually emitting / inspecting the 6 cron events and
 * 3 monitoring alerts defined for E-P0-06.
 *
 * Sub-commands:
 *   events                — dump all analytics_events for the last 7 days
 *   alerts                — dump all monitoring_alerts for the last 7 days
 *   streak                — compute current fallback_streak (live)
 *   emit <event_name>     — emit a single event (rare; mainly for testing)
 *   run-alerts            — run alert checks now and emit fresh alerts
 *
 * Usage:
 *   tsx monitoring-emit.ts events
 *   tsx monitoring-emit.ts streak
 *   tsx monitoring-emit.ts run-alerts
 */

import type { DbClient } from './lib/db';
import { createDbFromEnv } from './lib/db';
import { setupMockDb } from './daily-build';
import { isMain } from './lib/entry-check';
import {
  emitCronStarted,
  emitCronCompleted,
  emitCronFailed,
  emitCronLockTimeout,
  emitEditionCreated,
  emitEditionPublished,
  computeFallbackStreak,
  runAlertChecks,
  severityForStreak,
} from './lib/monitoring';

const USAGE = `Usage: tsx monitoring-emit.ts <events|alerts|streak|run-alerts|emit <event>>`;

async function dumpEvents(db: DbClient): Promise<void> {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { rows } = await db.query<{
    event_name: string;
    request_id: string;
    occurred_at: string;
    duration_ms: number | null;
    payload: Record<string, unknown>;
  }>(
    `SELECT event_name, request_id, occurred_at::text AS occurred_at,
            duration_ms, payload
       FROM analytics_events
      WHERE occurred_at >= datetime($1)
      ORDER BY occurred_at DESC
      LIMIT 200`,
    [since],
  );
  if (rows.length === 0) {
    console.log('(no events in last 7 days)');
    return;
  }
  for (const r of rows) {
    console.log(`${r.occurred_at}  ${r.event_name.padEnd(22)}  ${r.request_id.slice(0, 8)}  ${r.duration_ms ?? '-'}ms`);
    if (Object.keys(r.payload ?? {}).length) {
      console.log(`    payload: ${JSON.stringify(r.payload)}`);
    }
  }
}

async function dumpAlerts(db: DbClient): Promise<void> {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { rows } = await db.query<{
    alert_name: string;
    severity: string;
    request_id: string | null;
    payload: Record<string, unknown>;
    occurred_at: string;
  }>(
    `SELECT alert_name, severity, request_id, payload, occurred_at::text AS occurred_at
       FROM monitoring_alerts
      WHERE occurred_at >= datetime($1)
      ORDER BY occurred_at DESC
      LIMIT 200`,
    [since],
  );
  if (rows.length === 0) {
    console.log('(no alerts in last 7 days)');
    return;
  }
  for (const r of rows) {
    console.log(`${r.occurred_at}  ${r.severity.padEnd(13)}  ${r.alert_name}`);
    if (Object.keys(r.payload ?? {}).length) {
      console.log(`    payload: ${JSON.stringify(r.payload)}`);
    }
  }
}

async function showStreak(db: DbClient): Promise<void> {
  const { streak, dates } = await computeFallbackStreak(db);
  const severity = severityForStreak(streak);
  console.log(JSON.stringify({
    streak,
    severity,
    fallback_dates: dates,
  }, null, 2));
}

async function runAlerts(db: DbClient): Promise<void> {
  const emitted = await runAlertChecks(db);
  console.log(JSON.stringify({ emitted }, null, 2));
}

async function emitEvent(db: DbClient, eventName: string): Promise<void> {
  const request_id = `cli-${Date.now()}`;
  const basePayload = { source: 'cli-manual', at: new Date().toISOString() };

  switch (eventName) {
    case 'cron_started':
      await emitCronStarted(db, { request_id, target_date: '2026-08-24', trigger: 'cli-manual' });
      break;
    case 'cron_completed':
      await emitCronCompleted(db, {
        request_id, duration_ms: 1234, filled_count: 12, dropped_count: 0,
        is_fallback: false, fallback_reason: null, target_date: '2026-08-24',
      });
      break;
    case 'cron_failed':
      await emitCronFailed(db, {
        request_id, error_category: 'db_unreachable',
        error_message: 'manual test', target_date: '2026-08-24',
      });
      break;
    case 'cron_lock_timeout':
      await emitCronLockTimeout(db, { request_id });
      break;
    case 'edition_created':
      await emitEditionCreated(db, {
        request_id, edition_id: '00000000-0000-0000-0000-000000000000',
        date: '2026-08-24', slots_count: 12, is_fallback: false, version: 1,
      });
      break;
    case 'edition_published':
      await emitEditionPublished(db, {
        request_id, edition_id: '00000000-0000-0000-0000-000000000000',
        date: '2026-08-24', published_at: new Date().toISOString(),
      });
      break;
    default:
      console.error(`Unknown event: ${eventName}`);
      console.error(USAGE);
      process.exit(1);
  }
  console.log(JSON.stringify({ event_name: eventName, request_id, payload: basePayload }, null, 2));
}

async function main(): Promise<void> {
  const [, , subcmd, ...rest] = process.argv;
  if (!subcmd || subcmd === '--help' || subcmd === '-h') {
    console.log(USAGE);
    process.exit(0);
  }
  const db = process.env.E_P0_06_USE_MOCK === '1'
    ? await setupMockDb()
    : await createDbFromEnv();

  switch (subcmd) {
    case 'events':      return dumpEvents(db);
    case 'alerts':      return dumpAlerts(db);
    case 'streak':      return showStreak(db);
    case 'run-alerts':  return runAlerts(db);
    case 'emit':        return emitEvent(db, rest[0]);
    default:
      console.error(USAGE);
      process.exit(1);
  }
}

if (isMain(import.meta.url)) {
  main().catch((err) => { console.error('[monitoring] fatal:', err); process.exit(1); });
}