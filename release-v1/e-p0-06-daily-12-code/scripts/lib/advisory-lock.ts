/**
 * SEE EARTH V1 · E-P0-06 · Postgres advisory lock
 * Source: group-process-v1.md §9
 *
 * The cron job is global — only one daily-build can run at a time across
 * the whole cluster.  We use `pg_try_advisory_lock(<key>)` and release
 * via `pg_advisory_unlock(<key>)`.
 *
 * Lock key:  987654321  (arbitrary fixed constant · group-process §9.1)
 * Timeout:   60 seconds  (we use try_lock; the caller decides the policy)
 */

import type { DbClient } from './db';

export const CRON_LOCK_KEY = 987654321;

/**
 * Try to acquire the global cron lock.
 * Returns true if acquired; false if another holder already owns it.
 */
export async function acquireCronLock(db: DbClient): Promise<boolean> {
  const { rows } = await db.query<{ ok: boolean }>(
    'SELECT pg_try_advisory_lock($1) AS ok',
    [CRON_LOCK_KEY],
  );
  return rows[0]?.ok === true;
}

/**
 * Release the global cron lock.
 * Idempotent — safe to call multiple times.
 */
export async function releaseCronLock(db: DbClient): Promise<void> {
  await db.query('SELECT pg_advisory_unlock($1)', [CRON_LOCK_KEY]);
}

/**
 * Convenience: run a critical section under the cron lock.
 *
 *   await withCronLock(db, async () => { ... });
 *
 * Throws if the lock cannot be acquired.
 */
export async function withCronLock<T>(
  db: DbClient,
  fn: () => Promise<T>,
): Promise<T> {
  const ok = await acquireCronLock(db);
  if (!ok) {
    throw new Error('cron_lock_held: another daily-build is running');
  }
  try {
    return await fn();
  } finally {
    await releaseCronLock(db);
  }
}