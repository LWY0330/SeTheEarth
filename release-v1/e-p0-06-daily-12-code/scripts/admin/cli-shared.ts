#!/usr/bin/env tsx
/**
 * SEE EARTH V1 · E-P0-06 · Admin CLI · Status query
 * Source: scheduling-v1.md §4.2 (CLI #2)
 *
 * Show the current Edition (or one by date / id), including slot count,
 * fallback flag, status, and admin audit trail.
 *
 * Usage:
 *   tsx status.ts                       # today's Edition
 *   tsx status.ts --date=2026-09-01
 *   tsx status.ts --edition-id=<uuid>
 *   tsx status.ts --include-history     # also dump edition_status_history
 */

import type { DbClient, QueryResult } from '../lib/db';
import { createDbFromEnv } from '../lib/db';
import { setupMockDb } from '../daily-build';
import { isMain } from '../lib/entry-check';

function parseArgs(argv: readonly string[]): {
  date?: string;
  edition_id?: string;
  include_history: boolean;
  verbose: boolean;
} {
  const out = { include_history: false, verbose: false } as {
    date?: string; edition_id?: string; include_history: boolean; verbose: boolean;
  };
  for (const a of argv.slice(2)) {
    if (a === '--include-history') out.include_history = true;
    else if (a === '--verbose' || a === '-v') out.verbose = true;
    else if (a.startsWith('--date=')) {
      const v = a.split('=')[1];
      if (!/^\d{4}-\d{2}-\d{2}$/u.test(v)) throw new Error(`bad --date: ${v}`);
      out.date = v;
    } else if (a.startsWith('--edition-id=')) out.edition_id = a.split('=')[1];
    else if (a === '--help' || a === '-h') {
      console.log('Usage: tsx status.ts [--date=YYYY-MM-DD] [--edition-id=UUID] [--include-history] [--verbose]');
      process.exit(0);
    }
  }
  return out;
}

export interface EditionSummary {
  id: string;
  date: string;
  version: number;
  status: string;
  is_fallback: boolean;
  fallback_reason: string | null;
  slots_count: number;
  is_complete: boolean;
  published_at: string | null;
  last_status_at: string | null;
}

export interface SlotSummary {
  position: number;
  moment_id: string | null;
  city_id: string | null;
  source_type: string;
  fallback_reason: string | null;
  is_filled: boolean;
}

export interface StatusReport {
  edition: EditionSummary | null;
  slots: SlotSummary[];
  history?: Array<{
    from_status: string | null;
    to_status: string;
    actor: string;
    reason: string | null;
    occurred_at: string;
  }>;
}

export async function getStatusReport(
  db: DbClient,
  opts: { date?: string; edition_id?: string; include_history?: boolean },
): Promise<StatusReport> {
  let edition: EditionSummary | null = null;

  if (opts.edition_id) {
    const { rows } = await db.query<EditionSummary>(
      `SELECT id, date::text AS date, version, status, is_fallback, fallback_reason,
              slots_count, is_complete, published_at::text AS published_at, last_status_at::text AS last_status_at
         FROM editions
        WHERE id = $1`,
      [opts.edition_id],
    );
    edition = rows[0] ?? null;
  } else {
    const targetDate = opts.date ?? new Date().toISOString().slice(0, 10);
    const { rows } = await db.query<EditionSummary>(
      `SELECT id, date::text AS date, version, status, is_fallback, fallback_reason,
              slots_count, is_complete, published_at::text AS published_at, last_status_at::text AS last_status_at
         FROM editions
        WHERE date = $1
        ORDER BY version DESC
        LIMIT 1`,
      [targetDate],
    );
    edition = rows[0] ?? null;
  }

  if (!edition) return { edition: null, slots: [] };

  const { rows: slotRows } = await db.query<SlotSummary>(
    `SELECT position, moment_id, city_id, source_type, fallback_reason, is_filled
       FROM edition_slots
      WHERE edition_id = $1
      ORDER BY position`,
    [edition.id],
  );

  const report: StatusReport = { edition, slots: slotRows };

  if (opts.include_history) {
    const { rows: hist } = await db.query<{
      from_status: string | null;
      to_status: string;
      actor: string;
      reason: string | null;
      occurred_at: string;
    }>(
      `SELECT from_status, to_status, actor, reason, occurred_at::text AS occurred_at
         FROM edition_status_history
        WHERE edition_id = $1
        ORDER BY occurred_at DESC
        LIMIT 50`,
      [edition.id],
    );
    report.history = hist;
  }

  return report;
}

function renderReport(report: StatusReport): string {
  const e = report.edition;
  if (!e) {
    return 'No Edition found for that date / id.';
  }
  const lines: string[] = [];
  lines.push(`Edition ${e.id}  (v${e.version})`);
  lines.push(`  date              : ${e.date}`);
  lines.push(`  status            : ${e.status}`);
  lines.push(`  is_fallback       : ${e.is_fallback}${e.fallback_reason ? ` (${e.fallback_reason})` : ''}`);
  lines.push(`  slots             : ${e.slots_count}/12  complete=${e.is_complete}`);
  lines.push(`  published_at      : ${e.published_at ?? '—'}`);
  lines.push(`  last_status_at    : ${e.last_status_at ?? '—'}`);
  lines.push('');
  lines.push(`Slots:`);
  for (const s of report.slots) {
    if (s.is_filled) {
      lines.push(`  ${String(s.position).padStart(2)}. ${s.city_id ?? '?'}  moment=${s.moment_id}  source=${s.source_type}`);
    } else {
      lines.push(`  ${String(s.position).padStart(2)}. PLACEHOLDER  reason=${s.fallback_reason ?? '—'}`);
    }
  }
  if (report.history && report.history.length) {
    lines.push('');
    lines.push('Recent status history:');
    for (const h of report.history) {
      lines.push(`  ${h.occurred_at}  ${h.from_status ?? '∅'} → ${h.to_status}  by ${h.actor}  ${h.reason ?? ''}`);
    }
  }
  return lines.join('\n');
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv);
  const db = process.env.E_P0_06_USE_MOCK === '1'
    ? await setupMockDb()
    : await createDbFromEnv();

  const report = await getStatusReport(db, {
    date: args.date,
    edition_id: args.edition_id,
    include_history: args.include_history,
  });

  if (args.verbose || process.stdout.isTTY) {
    console.log(renderReport(report));
  } else {
    console.log(JSON.stringify(report, null, 2));
  }
}

if (isMain(import.meta.url)) {
  main().catch((err) => { console.error('[status] fatal:', err); process.exit(1); });
}