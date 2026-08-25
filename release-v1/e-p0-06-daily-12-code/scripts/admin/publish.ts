#!/usr/bin/env tsx
/**
 * SEE EARTH V1 · E-P0-06 · Admin CLI · Publish (alias of preview-approve)
 * Source: scheduling-v1.md §6.3
 *
 * V1 alias of preview.ts — both promote a draft/preview/scheduled Edition
 * to status='published'.  Kept as a separate CLI per the design doc
 * (5 separate commands).
 *
 * Usage:
 *   tsx publish.ts --edition-id=<uuid>
 */

import { approvePreview } from './preview';
import { createDbFromEnv } from '../lib/db';
import { setupMockDb } from '../daily-build';
import { isMain } from '../lib/entry-check';

function parseArgs(argv: readonly string[]): { edition_id?: string; verbose: boolean } {
  const out = { verbose: false } as { edition_id?: string; verbose: boolean };
  for (const a of argv.slice(2)) {
    if (a === '--verbose' || a === '-v') out.verbose = true;
    else if (a.startsWith('--edition-id=')) out.edition_id = a.split('=')[1];
    else if (a === '--help' || a === '-h') {
      console.log('Usage: tsx publish.ts --edition-id=<uuid> [--verbose]');
      process.exit(0);
    }
  }
  if (!out.edition_id) throw new Error('missing --edition-id=<uuid>');
  return out;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv);
  const db = process.env.E_P0_06_USE_MOCK === '1'
    ? await setupMockDb()
    : await createDbFromEnv();

  const actor = process.env.EP06_ADMIN_ACTOR ?? 'admin:cli-publish';
  const result = await approvePreview(db, args.edition_id!, actor);
  console.log(JSON.stringify(result, null, 2));
}

if (isMain(import.meta.url)) {
  main().catch((err) => { console.error('[publish] fatal:', err); process.exit(1); });
}