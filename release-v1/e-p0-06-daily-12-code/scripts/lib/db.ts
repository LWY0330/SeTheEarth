/**
 * SEE EARTH V1 · E-P0-06 · Tiny DB client abstraction
 *
 * Vercel / Node environments may use:
 *   • node-postgres (pg)  — production cron worker
 *   • @supabase/supabase-js — admin client
 *   • Mock client         — local 14-day drill (tests/14-day-test.ts)
 *
 * This abstraction unifies them with a minimal `query<T>(sql, params)` API.
 * Use `createDbFromEnv()` to pick a real client in production.
 */

export interface QueryResult<T = Record<string, unknown>> {
  rows: T[];
  rowCount?: number;
}

export interface DbClient {
  query<T = Record<string, unknown>>(
    sql: string,
    params?: unknown[],
  ): Promise<QueryResult<T>>;

  /** Begin a transaction.  Returns a new DbClient scoped to the txn. */
  begin(): Promise<DbClient>;

  /** Commit the current transaction (no-op if not in txn). */
  commit(): Promise<void>;

  /** Roll back the current transaction. */
  rollback(): Promise<void>;
}

/**
 * In-memory mock used by the 14-day drill + unit tests.
 *
 * Accepts a list of pre-registered tables; queries are dispatched by
 * matching `FROM <table>` in the SQL.  INSERT / UPDATE / DELETE statements
 * mutate the table data; SELECT returns matching rows.
 */
export class InMemoryDb implements DbClient {
  readonly tables = new Map<string, Array<Record<string, unknown>>>();
  private inTxn = false;
  private txnBackup: Map<string, Array<Record<string, unknown>>> | null = null;

  registerTable(name: string, rows: Array<Record<string, unknown>>): void {
    this.tables.set(name.toLowerCase(), [...rows]);
  }

  async query<T = Record<string, unknown>>(
    sql: string,
    params: unknown[] = [],
  ): Promise<QueryResult<T>> {
    const stmt = sql.trim();
    const upper = stmt.toUpperCase();

    // Transaction control ------------------------------------------------
    if (upper.startsWith('BEGIN')) {
      this.inTxn = true;
      this.txnBackup = new Map();
      for (const [k, v] of this.tables) {
        this.txnBackup.set(k, [...v]);
      }
      return { rows: [] as T[] };
    }
    if (upper.startsWith('COMMIT')) {
      this.inTxn = false;
      this.txnBackup = null;
      return { rows: [] as T[] };
    }
    if (upper.startsWith('ROLLBACK')) {
      if (this.txnBackup) {
        this.tables.clear();
        for (const [k, v] of this.txnBackup) this.tables.set(k, v);
      }
      this.inTxn = false;
      this.txnBackup = null;
      return { rows: [] as T[] };
    }
    if (upper.startsWith('SET LOCAL')) {
      return { rows: [] as T[] };
    }

    // pg_try_advisory_lock / unlock ---------------------------------------
    if (/pg_try_advisory_lock/i.test(stmt)) {
      return { rows: [{ ok: true } as T] };
    }
    if (/pg_advisory_unlock/i.test(stmt)) {
      return { rows: [] as T[] };
    }

    // Table name extraction ----------------------------------------------
    const tableMatch = stmt.match(/(?:FROM|INTO|UPDATE|TABLE)\s+([a-z_][a-z0-9_]*)/i);
    if (!tableMatch) {
      return { rows: [] as T[] };
    }
    const table = tableMatch[1].toLowerCase();
    const data = this.tables.get(table) ?? [];

    // SELECT --------------------------------------------------------------
    if (upper.startsWith('SELECT')) {
      // Parse WHERE: collect all column = $N AND column = $M predicates.
      const whereClauses: Array<{ col: string; idx: number }> = [];
      const wherePart = stmt.match(/WHERE\s+(.+?)(?:\s+ORDER|\s+LIMIT|$)/i);
      if (wherePart) {
        const re = /([a-z_][a-z0-9_]*)\s*=\s*\$(\d+)/gi;
        let m: RegExpExecArray | null;
        while ((m = re.exec(wherePart[1])) !== null) {
          whereClauses.push({ col: m[1].toLowerCase(), idx: Number(m[2]) - 1 });
        }
      }

      let filtered = data;
      for (const w of whereClauses) {
        const val = params[w.idx];
        filtered = filtered.filter((r) => r[w.col] === val);
      }

      // Handle additional WHERE clauses like `IS NOT NULL` / `IS NULL`.
      const isNotNull = /([a-z_][a-z0-9_]*)\s+IS\s+NOT\s+NULL/i;
      const isNull = /([a-z_][a-z0-9_]*)\s+IS\s+NULL/i;
      const mNotNull = stmt.match(isNotNull);
      const mIsNull = stmt.match(isNull);
      if (mNotNull) {
        const col = mNotNull[1].toLowerCase();
        filtered = filtered.filter((r) => r[col] !== null && r[col] !== undefined);
      }
      if (mIsNull) {
        const col = mIsNull[1].toLowerCase();
        filtered = filtered.filter((r) => r[col] === null || r[col] === undefined);
      }

      // Handle aggregate COUNT(*) :: int AS count
      if (/SELECT\s+COUNT\(\*\)/i.test(stmt)) {
        const aliasMatch = stmt.match(/COUNT\(\*\)\s*(?:::int)?\s+AS\s+([a-z_][a-z0-9_]*)/i);
        const alias = aliasMatch ? aliasMatch[1] : 'count';
        return { rows: [{ [alias]: filtered.length } as unknown as T] };
      }

      // ORDER BY col DESC
      const orderMatch = stmt.match(/ORDER BY\s+([a-z_][a-z0-9_]*)(?:\s+ASC|\s+DESC)?/i);
      if (orderMatch) {
        const col = orderMatch[1].toLowerCase();
        const desc = /ORDER BY\s+[a-z_][a-z0-9_]*\s+DESC/i.test(stmt);
        filtered = [...filtered].sort((a, b) => {
          const av = a[col]; const bv = b[col];
          if (av === bv) return 0;
          if (desc) return av < bv ? 1 : -1;
          return av > bv ? 1 : -1;
        });
      }

      // LIMIT N
      const limitMatch = stmt.match(/LIMIT\s+(\d+)/i);
      if (limitMatch) {
        filtered = filtered.slice(0, Number(limitMatch[1]));
      }

      return { rows: filtered as T[] };
    }

    // INSERT ... RETURNING * ---------------------------------------------
    if (upper.startsWith('INSERT')) {
      const colMatch = stmt.match(/INSERT\s+INTO\s+[a-z_][a-z0-9_]*\s*\(([^)]+)\)/i);
      const valuesMatch = stmt.match(/VALUES\s*\(([^)]+)\)/i);
      const newRow: Record<string, unknown> = {};

      if (colMatch && valuesMatch) {
        const cols = colMatch[1].split(',').map((s) => s.trim().toLowerCase());
        const valueTokens = valuesMatch[1].split(',').map((s) => s.trim());
        // Each token is either $N, a literal (number / string / function), or NULL.
        let paramIdx = 0;
        valueTokens.forEach((tok, i) => {
          const m = tok.match(/^\$(\d+)$/);
          if (m) {
            newRow[cols[i]] = params[Number(m[1]) - 1];
            paramIdx++;
          } else if (/^NOW\(\)$/i.test(tok) || /^gen_random_uuid\(\)/i.test(tok)) {
            // skip — auto-handled below
          } else if (/^NULL$/i.test(tok)) {
            newRow[cols[i]] = null;
          } else {
            // literal (number / string / TRUE / FALSE)
            newRow[cols[i]] = parseLiteral(tok);
          }
        });
      } else {
        // INSERT without column list: assume param order matches schema.
        const cols = data[0] ? Object.keys(data[0]) : [];
        cols.forEach((c, i) => { newRow[c] = params[i]; });
      }
      // Auto-generate `id` if absent and uuid() is in the script
      if (!newRow.id && /gen_random_uuid/.test(stmt)) {
        newRow.id = uuid();
      }
      if (!newRow.id) newRow.id = uuid();
      // Auto-fill timestamps if present in schema
      if (data[0] && 'created_at' in data[0] && !newRow.created_at) {
        newRow.created_at = new Date().toISOString();
      }
      if (data[0] && 'updated_at' in data[0] && !newRow.updated_at) {
        newRow.updated_at = new Date().toISOString();
      }
      if (data[0] && 'occurred_at' in data[0] && !newRow.occurred_at) {
        newRow.occurred_at = new Date().toISOString();
      }
      data.push(newRow);
      this.tables.set(table, data);
      return { rows: [newRow as T], rowCount: 1 };
    }

    // UPDATE ... ----------------------------------------------------------
    if (upper.startsWith('UPDATE')) {
      // UPDATE table SET col = $1, col2 = $2 WHERE id = $N
      const whereEq = stmt.match(/WHERE\s+([a-z_][a-z0-9_]*)\s*=\s*\$(\d+)/i);
      const setMatch = stmt.match(/SET\s+(.+)\s+WHERE/i);
      if (whereEq && setMatch) {
        const whereCol = whereEq[1].toLowerCase();
        const whereVal = params[Number(whereEq[2]) - 1];
        const setClauses = setMatch[1].split(',').map((s) => s.trim());
        const updated: Array<Record<string, unknown>> = [];
        for (let i = 0; i < data.length; i++) {
          if (data[i][whereCol] !== whereVal) continue;
          const row = { ...data[i] };
          setClauses.forEach((clause) => {
            const m = clause.match(/^([a-z_][a-z0-9_]*)\s*=\s*\$(\d+)/i);
            if (m) {
              const col = m[1].toLowerCase();
              const pIdx = Number(m[2]) - 1;
              row[col] = params[pIdx];
            }
          });
          if ('updated_at' in row) row.updated_at = new Date().toISOString();
          data[i] = row;
          updated.push(row);
        }
        this.tables.set(table, data);
        return { rows: updated as T[] };
      }
      return { rows: [] as T[] };
    }

    // DELETE --------------------------------------------------------------
    if (upper.startsWith('DELETE')) {
      const remaining = data.filter((r) => !JSON.stringify(r).includes(String(params[0] ?? '')));
      this.tables.set(table, remaining);
      return { rows: [], rowCount: data.length - remaining.length };
    }

    return { rows: [] as T[] };
  }

  async begin(): Promise<DbClient> {
    return new InMemoryTxn(this);
  }

  async commit(): Promise<void> {
    /* no-op (mock) */
  }

  async rollback(): Promise<void> {
    /* no-op (mock) */
  }
}

class InMemoryTxn implements DbClient {
  private readonly parent: InMemoryDb;
  constructor(parent: InMemoryDb) { this.parent = parent; }
  async query<T>(sql: string, params?: unknown[]): Promise<QueryResult<T>> {
    return this.parent.query<T>(sql, params ?? []);
  }
  async begin(): Promise<DbClient> { return this; }
  async commit(): Promise<void> { await this.parent.commit(); }
  async rollback(): Promise<void> { await this.parent.rollback(); }
}

/* ---------- tiny uuid helper (avoid runtime import of types.ts here) --- */
function uuid(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Parse a SQL literal token into its JS value.
 * Supports:  numbers (1, 1.5), strings ('foo', "bar"), TRUE/FALSE, NULL.
 */
function parseLiteral(tok: string): unknown {
  const s = tok.trim();
  if (/^NULL$/i.test(s)) return null;
  if (/^TRUE$/i.test(s)) return true;
  if (/^FALSE$/i.test(s)) return false;
  if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s);
  if (/^'(.*)'$/.test(s)) return s.slice(1, -1).replace(/''/g, "'");
  if (/^"(.*)"$/.test(s)) return s.slice(1, -1).replace(/""/g, '"');
  return s;
}

/**
 * Production DB factory.
 *
 * For V1, the cron script targets Supabase.  We wrap the @supabase/supabase-js
 * admin client behind a minimal adapter.  If neither pg nor Supabase JS is
 * available, we fall back to the in-memory mock (so unit tests / dry-runs
 * work locally without infrastructure).
 */
export async function createDbFromEnv(): Promise<DbClient> {
  // Lazy require so the file loads even without these deps installed.
  try {
    // @ts-ignore - optional
    const supabase = await import('@supabase/supabase-js');
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (url && key) {
      const client = supabase.createClient(url, key, {
        auth: { persistSession: false },
      });
      return new SupabaseDbAdapter(client);
    }
  } catch {
    /* fall through */
  }
  return new InMemoryDb();
}

/**
 * Lightweight Supabase adapter — uses the `.rpc` SQL channel and
 * `.from(table).select/insert/update/delete` REST API for SQL ops.
 */
class SupabaseDbAdapter implements DbClient {
  private readonly client: any;
  // deno-lint-ignore no-explicit-any
  constructor(client: any) { this.client = client; }

  async query<T>(sql: string, params: unknown[] = []): Promise<QueryResult<T>> {
    // Most E-P0-06 SQL is complex enough that the RPC channel is the
    // right tool.  We dispatch via rpc() if the SQL contains an RPC name.
    const rpcMatch = sql.match(/^--\s*rpc:([a-z_][a-z0-9_]*)/i);
    if (rpcMatch) {
      const rpcName = rpcMatch[1];
      const { data, error } = await this.client.rpc(rpcName, { args: params });
      if (error) throw new Error(error.message);
      return { rows: (data ?? []) as T[] };
    }

    // Fallback: very simple SELECT / INSERT heuristics (rarely used in prod).
    const fromMatch = sql.match(/FROM\s+([a-z_][a-z0-9_]*)/i);
    if (fromMatch) {
      const table = fromMatch[1];
      const { data, error } = await this.client.from(table).select('*');
      if (error) throw new Error(error.message);
      // Best-effort param filtering.
      let filtered = data ?? [];
      if (params[0] !== undefined) {
        filtered = filtered.filter((r: Record<string, unknown>) =>
          Object.values(r).some((v) => String(v) === String(params[0])),
        );
      }
      return { rows: filtered as T[] };
    }
    throw new Error('Supabase adapter: complex SQL not supported inline; use RPC.');
  }

  async begin(): Promise<DbClient> { return this; }
  async commit(): Promise<void> { /* no-op (use Postgres functions) */ }
  async rollback(): Promise<void> { /* no-op */ }
}