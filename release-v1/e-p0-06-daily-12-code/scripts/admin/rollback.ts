#!/usr/bin/env tsx
/**
 * SEE EARTH V1 · E-P0-06 · Admin CLI · Rollback (full Edition rollback)
 * Source: scheduling-v1.md §8 + fallback-v1.md §2.3
 *
 * Replace a published Edition with a new fallback Edition that copies the
 * original 12 slots.  The original Edition is marked status='replaced'.
 *
 * Usage:
 *   tsx rollback.ts --edition-id=<uuid> --reason="copyright claim"
 */

import type { DbClient } from '../lib/db';
import { createDbFromEnv } from '../lib/db';
import { setupMockDb } from '../daily-build';
import { uuid } from '../lib/types';
import { emitEditionCreated } from '../lib/monitoring';
import { isMain } from '../lib/entry-check';

function parseArgs(argv: readonly string[]): {
  edition_id?: string; reason?: string; verbose: boolean;
} {
  const out = { verbose: false } as { edition_id?: string; reason?: string; verbose: boolean };
  for (const a of argv.slice(2)) {
    if (a === '--verbose' || a === '-v') out.verbose = true;
    else if (a.startsWith('--edition-id=')) out.edition_id = a.split('=')[1];
    else if (a.startsWith('--reason=')) out.reason = a.split('=')[1];
    else if (a === '--help' || a === '-h') {
      console.log('Usage: tsx rollback.ts --edition-id=<uuid> --reason="..."');
      process.exit(0);
    }
  }
  if (!out.edition_id) throw new Error('missing --edition-id=<uuid>');
  if (!out.reason) throw new Error('missing --reason="..." (required for audit log)');
  return out;
}

export interface RollbackResult {
  ok: boolean;
  original_edition_id: string;
  fallback_edition_id: string;
  new_status: 'replaced';
  reason: string;
}

export async function rollbackEdition(
  db: DbClient,
  editionId: string,
  reason: string,
  actor: string,
): Promise<RollbackResult> {
  // 1. Read original
  const { rows: originals } = await db.query<{
    id: string; date: string; version: number; status: string;
    slots_count: number; is_complete: boolean;
  }>(
    `SELECT id, date::text AS date, version, status, slots_count, is_complete
       FROM editions WHERE id = $1`,
    [editionId],
  );
  const orig = originals[0];
  if (!orig) throw new Error(`edition_not_found: ${editionId}`);
  if (!['published', 'replaced'].includes(orig.status)) {
    throw new Error(`invalid_state_for_rollback: ${orig.status}`);
  }

  // 2. Create the fallback Edition (is_fallback=true, version + 1)
  const fallbackId = uuid();
  const requestId = uuid();

  await db.query("SET LOCAL app.actor = $1", [actor]);

  await db.query(
    `INSERT INTO editions (
       id, date, version, status, is_fallback, fallback_reason,
       replaces_edition_id, slots_count, is_complete,
       published_at, last_status_at
     ) VALUES (
       $1, $2, $3, 'published', TRUE, 'editorial_rollback',
       $4, $5, $6, NOW(), NOW()
     )`,
    [
      fallbackId,
      orig.date,
      orig.version + 1,
      orig.id,
      orig.slots_count,
      orig.is_complete,
    ],
  );

  // 3. Copy the 12 slots
  const { rows: slotRows } = await db.query<{
    position: number; moment_id: string | null; city_id: string | null;
    source_type: string; fallback_reason: string | null; is_editorial_fill: boolean;
  }>(
    `SELECT position, moment_id, city_id, source_type, fallback_reason, is_editorial_fill
       FROM edition_slots
      WHERE edition_id = $1
      ORDER BY position`,
    [editionId],
  );

  for (const s of slotRows) {
    await db.query(
      `INSERT INTO edition_slots (edition_id, position, moment_id, city_id, source_type, fallback_reason, is_editorial_fill)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [fallbackId, s.position, s.moment_id, s.city_id, s.source_type, s.fallback_reason, s.is_editorial_fill],
    );
  }

  // 4. Mark original as replaced
  await db.query(
    `UPDATE editions SET status = 'replaced', last_status_at = NOW() WHERE id = $1`,
    [editionId],
  );

  // 5. Audit log
  await db.query(
    `INSERT INTO edition_audit_log (edition_id, action, actor, payload, request_id, occurred_at)
     VALUES ($1, 'rollback', $2, $3::jsonb, $4, NOW())`,
    [
      editionId,
      actor,
      JSON.stringify({ reason, fallback_edition_id: fallbackId }),
      requestId,
    ],
  );

  await emitEditionCreated(db, {
    request_id: requestId,
    edition_id: fallbackId,
    date: orig.date,
    slots_count: orig.slots_count,
    is_fallback: true,
    version: orig.version + 1,
  });

  return {
    ok: true,
    original_edition_id: editionId,
    fallback_edition_id: fallbackId,
    new_status: 'replaced',
    reason,
  };
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv);
  const db = process.env.E_P0_06_USE_MOCK === '1'
    ? await setupMockDb()
    : await createDbFromEnv();

  const actor = process.env.EP06_ADMIN_ACTOR ?? 'admin:cli-rollback';
  const result = await rollbackEdition(db, args.edition_id!, args.reason!, actor);
  console.log(JSON.stringify(result, null, 2));
}

if (isMain(import.meta.url)) {
  main().catch((err) => { console.error('[rollback] fatal:', err); process.exit(1); });
}