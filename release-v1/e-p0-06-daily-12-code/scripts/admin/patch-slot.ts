#!/usr/bin/env tsx
/**
 * SEE EARTH V1 · E-P0-06 · Admin CLI · Patch slot (replace single Moment)
 * Source: scheduling-v1.md §7 + §4.2 (CLI #3)
 *
 * Replace the moment_id on a single slot.  Used for editorial swaps
 * before the Edition is published.  Once an Edition is published, the
 * caller must use rollback.ts first (which creates a new fallback Edition),
 * then patch-slot on the new fallback Edition.
 *
 * Usage:
 *   tsx patch-slot.ts --edition-id=<uuid> --position=5 --moment-id=<uuid>
 */

import type { DbClient } from '../lib/db';
import { createDbFromEnv } from '../lib/db';
import { setupMockDb } from '../daily-build';
import { uuid } from '../lib/types';
import { checkEligibility } from '../lib/eligibility';
import type { MomentRow } from '../lib/types';
import { isMain } from '../lib/entry-check';

function parseArgs(argv: readonly string[]): {
  edition_id?: string; position?: number; moment_id?: string; verbose: boolean;
} {
  const out = { verbose: false } as {
    edition_id?: string; position?: number; moment_id?: string; verbose: boolean;
  };
  for (const a of argv.slice(2)) {
    if (a === '--verbose' || a === '-v') out.verbose = true;
    else if (a.startsWith('--edition-id=')) out.edition_id = a.split('=')[1];
    else if (a.startsWith('--position=')) out.position = Number(a.split('=')[1]);
    else if (a.startsWith('--moment-id=')) out.moment_id = a.split('=')[1];
    else if (a === '--help' || a === '-h') {
      console.log('Usage: tsx patch-slot.ts --edition-id=<uuid> --position=1..12 --moment-id=<uuid>');
      process.exit(0);
    }
  }
  if (!out.edition_id || out.position === undefined || !out.moment_id) {
    throw new Error('missing required flag(s): --edition-id --position --moment-id');
  }
  if (out.position < 1 || out.position > 12) {
    throw new Error(`--position must be 1..12 (got ${out.position})`);
  }
  return out;
}

export interface PatchSlotResult {
  ok: boolean;
  edition_id: string;
  position: number;
  old_moment_id: string | null;
  new_moment_id: string;
  city_id: string;
}

export async function patchSlot(
  db: DbClient,
  editionId: string,
  position: number,
  newMomentId: string,
  actor: string,
  referenceNow: Date = new Date(),
): Promise<PatchSlotResult> {
  // 1. fetch Edition
  const { rows: editions } = await db.query<{
    id: string; status: string; date: string;
  }>(
    `SELECT id, status, date::text AS date
       FROM editions WHERE id = $1`,
    [editionId],
  );
  const edition = editions[0];
  if (!edition) throw new Error(`edition_not_found: ${editionId}`);
  if (!['draft', 'preview'].includes(edition.status)) {
    throw new Error('cannot_replace_published_slot: run rollback first');
  }

  // 2. fetch new moment + run eligibility
  const { rows: moments } = await db.query<MomentRow>(
    `SELECT id, city_id, public_city_name, captured_at, published_at,
            source_type, rights, moderation_status, image_variants
       FROM moments WHERE id = $1`,
    [newMomentId],
  );
  const moment = moments[0];
  if (!moment) throw new Error(`moment_not_found: ${newMomentId}`);
  const reason = checkEligibility(moment, referenceNow);
  if (reason) {
    throw new Error(`moment_ineligible: ${reason}`);
  }

  // 3. duplicate check (same Edition, different position, same moment_id)
  const { rows: dup } = await db.query<{ count: number }>(
    `SELECT COUNT(*)::int AS count
       FROM edition_slots
      WHERE edition_id = $1 AND moment_id = $2 AND position <> $3`,
    [editionId, newMomentId, position],
  );
  if ((dup[0]?.count ?? 0) > 0) {
    throw new Error('duplicate_in_edition');
  }

  // 4. read old slot for audit payload
  const { rows: oldSlot } = await db.query<{ moment_id: string | null }>(
    `SELECT moment_id FROM edition_slots WHERE edition_id = $1 AND position = $2`,
    [editionId, position],
  );
  const oldMomentId = oldSlot[0]?.moment_id ?? null;

  // 5. transaction: UPDATE + INSERT audit
  await db.query("SET LOCAL app.actor = $1", [actor]);

  await db.query(
    `UPDATE edition_slots
        SET moment_id    = $1,
            city_id      = $2,
            source_type  = $3,
            fallback_reason = NULL,
            is_editorial_fill = $4
      WHERE edition_id = $5 AND position = $6`,
    [newMomentId, moment.city_id, moment.source_type,
     moment.source_type !== 'witness', editionId, position],
  );

  await db.query(
    `INSERT INTO edition_audit_log (edition_id, action, actor, payload, request_id, occurred_at)
     VALUES ($1, 'replace_slot', $2, $3::jsonb, $4, NOW())`,
    [
      editionId,
      actor,
      JSON.stringify({
        position,
        old_moment_id: oldMomentId,
        new_moment_id: newMomentId,
      }),
      uuid(),
    ],
  );

  return {
    ok: true,
    edition_id: editionId,
    position,
    old_moment_id: oldMomentId,
    new_moment_id: newMomentId,
    city_id: moment.city_id,
  };
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv);
  const db = process.env.E_P0_06_USE_MOCK === '1'
    ? await setupMockDb()
    : await createDbFromEnv();

  const actor = process.env.EP06_ADMIN_ACTOR ?? 'admin:cli-patch-slot';
  const result = await patchSlot(
    db,
    args.edition_id!,
    args.position!,
    args.moment_id!,
    actor,
  );
  console.log(JSON.stringify(result, null, 2));
}

if (isMain(import.meta.url)) {
  main().catch((err) => { console.error('[patch-slot] fatal:', err); process.exit(1); });
}