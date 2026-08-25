#!/usr/bin/env tsx
/**
 * SEE EARTH V1 · E-P0-06 · Admin CLI · edition-build (alias of cron daily-build)
 * Source: scheduling-v1.md §4.2 (CLI #1)
 *
 * Manual trigger for the daily Edition builder.  Identical code path to
 * the cron job, but injects --trigger=admin-manual so monitoring can
 * distinguish scheduled vs ad-hoc runs.
 *
 * Usage:
 *   tsx edition-build.ts                              # build tomorrow's Edition
 *   tsx edition-build.ts --target-date=2026-09-01     # specific date
 *   tsx edition-build.ts --dry-run                    # no DB writes
 */

import { runDailyBuild, setupMockDb } from '../daily-build';
import { createDbFromEnv } from '../lib/db';
import { isMain } from '../lib/entry-check';

function parseArgs(argv: readonly string[]): {
  target_date?: string;
  dry_run: boolean;
  trigger: string;
  verbose: boolean;
} {
  const opts = { dry_run: false, trigger: 'admin-manual', verbose: false } as {
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
    } else if (arg === '--help' || arg === '-h') {
      console.log('Usage: tsx edition-build.ts [--target-date=YYYY-MM-DD] [--dry-run] [--verbose]');
      process.exit(0);
    } else if (arg.startsWith('--trigger=')) {
      opts.trigger = arg.split('=')[1];
    }
  }
  return opts;
}

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

if (isMain(import.meta.url)) {
  main().catch((err) => { console.error('[edition-build] fatal:', err); process.exit(1); });
}