#!/usr/bin/env tsx
/**
 * SEE EARTH V1 · E-P0-06 · Admin CLI · Preview approve
 * Source: scheduling-v1.md §6 + group-process-v1.md Step 9
 *
 * Manually approve a preview Edition and promote it to status='published'.
 * If V1 default (auto-publish) is in effect, this CLI is rarely needed —
 * it's here for editorial override of a stuck draft / preview state.
 *
 * Usage:
 *   tsx preview.ts --edition-id=<uuid>
 */

import type { DbClient } from '../lib/db';
import { createDbFromEnv } from '../lib/db';
import { isMain } from '../lib/entry-check';
import { setupMockDb } from '../daily-build';
import { uuid } from '../lib/types';
import { emitEditionPublished } from '../lib/monitoring';

function parseArgs(argv: readonly string[]): { edition_id?: string; verbose: boolean } {
  const out = { verbose: false } as { edition_id?: string; verbose: boolean };
  for (const a of argv.slice(2)) {
    if (a === '--verbose' || a === '-v') out.verbose = true;
    else if (a.startsWith('--edition-id=')) out.edition_id = a.split('=')[1];
    else if (a === '--help' || a === '-h') {
      console.log('Usage: tsx preview.ts --edition-id=<uuid> [--verbose]');
      process.exit(0);
    }
  }
  if (!out.edition_id) throw new Error('missing --edition-id=<uuid>');
  return out;
}

export async function approvePreview(
  db: DbClient,
  editionId: string,
  actor: string,
): Promise<{ ok: boolean; from_status: string; to_status: string; published_at: string | null }> {
  // Read current status
  const { rows } = await db.query<{ id: string; status: string; slots_count: number; is_complete: boolean; date: string }>(
    `SELECT id, status, slots_count, is_complete, date::text AS date
       FROM editions WHERE id = $1`,
    [editionId],
  );
  const edition = rows[0];
  if (!edition) throw new Error(`edition_not_found: ${editionId}`);

  if (!['draft', 'preview', 'scheduled'].includes(edition.status)) {
    throw new Error(`invalid_state_for_publish: ${edition.status}`);
  }
  if (edition.slots_count !== 12 || !edition.is_complete) {
    throw new Error(`incomplete_slots: ${edition.slots_count}/12`);
  }

  const published_at = new Date().toISOString();

  await db.query("SET LOCAL app.actor = $1", [actor]);

  await db.query(
    `UPDATE editions
        SET status = 'published',
            published_at = $1,
            last_status_at = NOW()
      WHERE id = $2`,
    [published_at, editionId],
  );

  await db.query(
    `INSERT INTO edition_audit_log (edition_id, action, actor, payload, request_id, occurred_at)
     VALUES ($1, 'publish', $2, '{}'::jsonb, $3, NOW())`,
    [editionId, actor, uuid()],
  );

  await emitEditionPublished(db, {
    request_id: uuid(),
    edition_id: editionId,
    date: edition.date,
    published_at,
  });

  return {
    ok: true,
    from_status: edition.status,
    to_status: 'published',
    published_at,
  };
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv);
  const db = process.env.E_P0_06_USE_MOCK === '1'
    ? await setupMockDb()
    : await createDbFromEnv();

  const actor = process.env.EP06_ADMIN_ACTOR ?? 'admin:cli-preview';
  const result = await approvePreview(db, args.edition_id!, actor);
  console.log(JSON.stringify(result, null, 2));
}

if (isMain(import.meta.url)) {
  main().catch((err) => { console.error('[preview] fatal:', err); process.exit(1); });
}