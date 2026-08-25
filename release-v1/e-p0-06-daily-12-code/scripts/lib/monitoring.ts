/**
 * SEE EARTH V1 · E-P0-06 · Monitoring event emitter
 * Source: group-process-v1.md §8 + fallback-v1.md §5
 *
 * 6 cron/edition events + 3 alerts.  Events are written to an
 * `analytics_events` table (shape mirror to E-P0-10 analytics-instrumentation).
 * Alerts go to a separate `monitoring_alerts` table.
 *
 * Pure functions + a tiny `emit()` writer — no network calls; the underlying
 * DB client handles persistence.
 */

import type { DbClient } from './db';

export type CronEventName =
  | 'cron_started'
  | 'cron_completed'
  | 'cron_failed'
  | 'cron_lock_timeout'
  | 'edition_created'
  | 'edition_published';

export type AlertName =
  | 'fallback_streak'
  | 'cron_failed_streak'
  | 'stale_fallback_threshold';

export type AlertSeverity = 'info' | 'warn' | 'critical' | 'critical_plus';

interface EventBase {
  event_name: CronEventName;
  request_id: string;
  occurred_at: string;
  trigger_source?: string;
  duration_ms?: number;
  payload?: Record<string, unknown>;
}

/**
 * Emit a cron event to analytics_events.
 */
export async function emitCronEvent(
  db: DbClient,
  event: EventBase,
): Promise<void> {
  try {
    await db.query(
      `INSERT INTO analytics_events (event_name, request_id, occurred_at, trigger_source, duration_ms, payload)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        event.event_name,
        event.request_id,
        event.occurred_at,
        event.trigger_source ?? null,
        event.duration_ms ?? null,
        JSON.stringify(event.payload ?? {}),
      ],
    );
  } catch (err) {
    if (process.env.EP06_DEBUG === '1') {
      console.error('[monitoring] emit failed:', (err as Error).message);
    }
  }
}

/**
 * Emit a monitoring alert.
 */
export async function emitAlert(
  db: DbClient,
  alert: {
    alert_name: AlertName;
    severity: AlertSeverity;
    request_id?: string;
    payload: Record<string, unknown>;
  },
): Promise<void> {
  try {
    await db.query(
      `INSERT INTO monitoring_alerts (alert_name, severity, request_id, payload, occurred_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        alert.alert_name,
        alert.severity,
        alert.request_id ?? null,
        JSON.stringify(alert.payload),
        new Date().toISOString(),
      ],
    );
  } catch (err) {
    if (process.env.EP06_DEBUG === '1') {
      console.error('[monitoring] alert failed:', (err as Error).message);
    }
  }
}

/* ============================================================
 * 6 events helpers
 * ============================================================ */

export async function emitCronStarted(
  db: DbClient, p: { request_id: string; target_date: string; trigger: string },
): Promise<void> {
  await emitCronEvent(db, {
    event_name: 'cron_started',
    request_id: p.request_id,
    occurred_at: new Date().toISOString(),
    trigger_source: p.trigger,
    payload: { target_date: p.target_date },
  });
}

export async function emitCronCompleted(
  db: DbClient,
  p: {
    request_id: string;
    duration_ms: number;
    filled_count: number;
    dropped_count: number;
    is_fallback: boolean;
    fallback_reason: string | null;
    target_date: string;
  },
): Promise<void> {
  await emitCronEvent(db, {
    event_name: 'cron_completed',
    request_id: p.request_id,
    occurred_at: new Date().toISOString(),
    duration_ms: p.duration_ms,
    payload: {
      filled_count: p.filled_count,
      dropped_count: p.dropped_count,
      is_fallback: p.is_fallback,
      fallback_reason: p.fallback_reason,
      target_date: p.target_date,
    },
  });
}

export async function emitCronFailed(
  db: DbClient,
  p: { request_id: string; error_category: string; error_message: string; target_date: string },
): Promise<void> {
  await emitCronEvent(db, {
    event_name: 'cron_failed',
    request_id: p.request_id,
    occurred_at: new Date().toISOString(),
    payload: {
      error_category: p.error_category,
      error_message: p.error_message.slice(0, 256),
      target_date: p.target_date,
    },
  });
}

export async function emitCronLockTimeout(
  db: DbClient, p: { request_id: string; previous_request_id?: string },
): Promise<void> {
  await emitCronEvent(db, {
    event_name: 'cron_lock_timeout',
    request_id: p.request_id,
    occurred_at: new Date().toISOString(),
    payload: { previous_request_id: p.previous_request_id ?? null },
  });
}

export async function emitEditionCreated(
  db: DbClient,
  p: { request_id: string; edition_id: string; date: string; slots_count: number; is_fallback: boolean; version: number },
): Promise<void> {
  await emitCronEvent(db, {
    event_name: 'edition_created',
    request_id: p.request_id,
    occurred_at: new Date().toISOString(),
    payload: {
      edition_id: p.edition_id,
      date: p.date,
      slots_count: p.slots_count,
      is_fallback: p.is_fallback,
      version: p.version,
    },
  });
}

export async function emitEditionPublished(
  db: DbClient,
  p: { request_id: string; edition_id: string; date: string; published_at: string },
): Promise<void> {
  await emitCronEvent(db, {
    event_name: 'edition_published',
    request_id: p.request_id,
    occurred_at: new Date().toISOString(),
    payload: {
      edition_id: p.edition_id,
      date: p.date,
      published_at: p.published_at,
    },
  });
}

/* ============================================================
 * Alert helpers · fallback-v1.md §5
 * ============================================================ */

export function severityForStreak(streakDays: number): AlertSeverity | null {
  if (streakDays >= 5) return 'critical_plus';
  if (streakDays >= 3) return 'critical';
  if (streakDays >= 2) return 'warn';
  if (streakDays >= 1) return 'info';
  return null;
}

export async function computeFallbackStreak(
  db: DbClient, today: Date = new Date(),
): Promise<{ streak: number; dates: string[] }> {
  const since = new Date(today);
  since.setUTCDate(since.getUTCDate() - 7);
  const sinceStr = since.toISOString().slice(0, 10);

  const { rows } = await db.query<{ date: string; is_fallback: boolean }>(
    `SELECT date::text AS date, is_fallback
       FROM editions
      WHERE date >= $1 AND status = 'published'
      ORDER BY date DESC`,
    [sinceStr],
  );

  let streak = 0;
  const dates: string[] = [];
  for (const r of rows) {
    if (r.is_fallback) {
      streak++;
      dates.push(r.date);
    } else {
      break;
    }
  }
  return { streak, dates };
}

export async function runAlertChecks(
  db: DbClient, today: Date = new Date(),
): Promise<number> {
  let emitted = 0;

  const { streak, dates } = await computeFallbackStreak(db, today);
  const severity = severityForStreak(streak);
  if (severity) {
    await emitAlert(db, {
      alert_name: 'fallback_streak',
      severity,
      payload: {
        streak_days: streak,
        fallback_dates: dates,
        today: today.toISOString().slice(0, 10),
      },
    });
    emitted++;
  }

  return emitted;
}