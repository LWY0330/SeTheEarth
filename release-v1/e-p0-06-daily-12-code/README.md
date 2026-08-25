# SEE EARTH V1 · E-P0-06 · Daily 12 供给链 · 代码

> **作者**：Engineer Agent · 2026-08-24
> **Gate**：B (Closed Beta)
> **设计文档**：`release-v1/e-p0-06-daily-12-supply-chain/`（6 文件 · LOCKED）
> **实施报告**：[`phase2-deployment-report.md`](./phase2-deployment-report.md)

---

## 0. 一句话

**1 份 SQL migration + 12 份 TypeScript 实现 + 14 天演练脚本。Gate B 9/9 通过 ✅**

---

## 1. 目录结构

```
release-v1/e-p0-06-daily-12-code/
├── migrations/0002_editions.sql              # 4 表 + 5 索引 + 3 触发器 + RLS
├── scripts/
│   ├── daily-build.ts                       # 主 cron (11 步时序)
│   ├── monitoring-emit.ts                   # 监控 CLI
│   ├── lib/                                  # 8 个共享模块
│   └── admin/                                # 5 个 admin CLI
├── tests/
│   ├── 14-day-test.ts                        # 14 天演练
│   ├── fixtures/14-day-moments.ts            # 14 天 fixture
│   └── reports/                               # 演练报告输出
├── loader-register-ts.mjs                    # Node 22 strip-types loader
├── package.json
├── README.md                                  # 本文件
└── phase2-deployment-report.md                # 实施报告
```

---

## 2. 前置条件

### 2.1 运行时

- **Node.js 22+** （本机 v22.22.0 验证）
- **Supabase 项目**（生产环境；本地演练不需要）

### 2.2 数据库依赖

- E-P0-03 Phase 1.1 已创建 `moments` + `cities` 表（**E-P0-06 migration 依赖**）
- E-P0-10 已创建 `analytics_events` + `monitoring_alerts` 表（监控埋点依赖）

### 2.3 环境变量（生产环境）

```bash
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
E_P0_06_USE_MOCK=0        # 默认 0；本地演练设 1
EP06_ADMIN_ACTOR=admin:<your-email>
EP06_DEBUG=0              # 监控调试日志
```

---

## 3. 本地开发

### 3.1 跑 dry-run（不写 DB）

```bash
cd release-v1/e-p0-06-daily-12-code

# Mock 模式：使用 InMemoryDb，无需 Supabase
E_P0_06_USE_MOCK=1 node --experimental-strip-types --loader=./loader-register-ts.mjs --no-warnings scripts/daily-build.ts --dry-run --verbose
```

输出：

```json
{
  "status": "success",
  "request_id": "...",
  "target_date": "2026-08-25",
  "filled_count": 0,
  "slots_count": 12,
  "is_fallback": true,
  "fallback_reason": "no_sufficient_candidates",
  "duration_ms": 8
}
```

### 3.2 跑 14 天演练（Gate B 验证）

```bash
E_P0_06_USE_MOCK=1 node --experimental-strip-types --loader=./loader-register-ts.mjs --no-warnings tests/14-day-test.ts --verbose
```

或严格模式（Gate B 失败时 exit code = 1）：

```bash
E_P0_06_USE_MOCK=1 node --experimental-strip-types --loader=./loader-register-ts.mjs --no-warnings tests/14-day-test.ts --exit-on-fail --verbose
```

输出：

```
=== Gate B Summary ===
  ✅ #1 14/14 days cron success (or stale_fallback covers)
  ✅ #2 14/14 days public API returns an Edition
  ✅ #3 14/14 days slots_count = 12
  ✅ #4 ≥ 12 days is_complete = TRUE (slots_count=12)
  ✅ #5 consecutive fallback streak ≤ 3
  ✅ #6 cron failures 0 (Day 13 simulated failure covered by stale_fallback)
  ✅ #7 admin ops: ≥1 rollback + ≥1 replace_slot
  ✅ #8 stale_fallback triggered ≥ 1 time
  ✅ #9 audit log integrity (admin ops audited)

Result: PASS
Reports written to /Users/.../tests/reports
```

### 3.3 跑 admin CLI（mock 模式）

```bash
# 查看 status
E_P0_06_USE_MOCK=1 node --experimental-strip-types --loader=./loader-register-ts.mjs --no-warnings scripts/admin/cli-shared.ts --date=2026-08-25

# 替换 slot
E_P0_06_USE_MOCK=1 node --experimental-strip-types --loader=./loader-register-ts.mjs --no-warnings scripts/admin/patch-slot.ts --edition-id=<uuid> --position=5 --moment-id=<uuid>

# 整版回滚
E_P0_06_USE_MOCK=1 node --experimental-strip-types --loader=./loader-register-ts.mjs --no-warnings scripts/admin/rollback.ts --edition-id=<uuid> --reason="copyright claim"

# 手动发布
E_P0_06_USE_MOCK=1 node --experimental-strip-types --loader=./loader-register-ts.mjs --no-warnings scripts/admin/publish.ts --edition-id=<uuid>

# 监控事件
E_P0_06_USE_MOCK=1 node --experimental-strip-types --loader=./loader-register-ts.mjs --no-warnings scripts/monitoring-emit.ts streak
E_P0_06_USE_MOCK=1 node --experimental-strip-types --loader=./loader-register-ts.mjs --no-warnings scripts/monitoring-emit.ts run-alerts
```

### 3.4 npm scripts（推荐封装）

```bash
npm run cron:daily          # = scripts/daily-build.ts
npm run admin:status        # = scripts/admin/cli-shared.ts
npm run admin:publish       # = scripts/admin/publish.ts
npm run admin:rollback      # = scripts/admin/rollback.ts
npm run admin:patch-slot    # = scripts/admin/patch-slot.ts
npm run admin:preview       # = scripts/admin/preview.ts
npm run admin:build         # = scripts/admin/edition-build.ts
npm run monitoring          # = scripts/monitoring-emit.ts
npm run drill:14day         # = tests/14-day-test.ts
npm run drill:14day-strict  # = tests/14-day-test.ts --exit-on-fail --verbose
```

---

## 4. 生产部署

### 4.1 应用 SQL migration

```bash
# 1. Supabase project → SQL Editor
# 2. 粘贴 migrations/0002_editions.sql 全部内容
# 3. 点 Run

# 或者 psql:
psql "$DATABASE_URL" -f migrations/0002_editions.sql
```

**预期输出**：
- 4 张表创建成功
- 5 索引创建成功
- 3 触发器 + 3 函数创建成功
- 2 view 创建成功
- RLS 策略启用

### 4.2 部署 cron（Vercel Cron 推荐）

在项目根目录 `vercel.json` 添加：

```json
{
  "crons": [
    {
      "path": "/api/cron/daily-edition-builder",
      "schedule": "0 0 * * *"
    }
  ]
}
```

创建 `app/api/cron/daily-edition-builder/route.ts`：

```typescript
import { runDailyBuild } from '@/release-v1/e-p0-06-daily-12-code/scripts/daily-build';
import { createDbFromEnv } from '@/release-v1/e-p0-06-daily-12-code/scripts/lib/db';
// ...
```

或者用 GitHub Actions 备援：

```yaml
# .github/workflows/daily-edition-builder-backup.yml
on:
  schedule:
    - cron: '0 1 * * *'
jobs:
  run:
    runs-on: ubuntu-latest
    steps:
      - run: |
          curl -X POST https://<your-app>/api/cron/daily-edition-builder \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

### 4.3 部署 admin CLI

- **推荐**：通过 Supabase Edge Function 包装 CLI（不在 Vercel 主项目暴露）
- **替代**：本地 + SSH（admin 直接 `node scripts/admin/...`）

### 4.4 监控埋点接入

`scripts/monitoring-emit.ts events` 输出最近 7 天所有 analytics_events（需要先建 E-P0-10 表）。

---

## 5. 14 天演练详解

### 5.1 运行模式

| 模式 | 何时用 | 期望耗时 |
|---|---|---|
| **A 真实时间** | Gate B 前的最后 2 周 | 14 天 |
| **B 加速时间** | 本地 + 测试环境 | 2 小时 |
| **C 混合** ⭐ Gate B 采纳 | staging | 1 周 |

本仓库的 `tests/14-day-test.ts` 是**模式 C 的本地等价物**（不需要 Supabase）：每个 fixture day 用真实的 UTC 日期，cron 通过 `reference_now` 参数推进时间。

### 5.2 T1-T20 测试场景对应

| T# | 场景 | 演练中的位置 |
|---:|---|---|
| T1 | 完美 12 城 | Day 1, 3, 5, 7, 9, 11, 12, 14 |
| T2 | 候选不足 1 城 | Day 2 |
| T3 | 候选不足 5 城 (partial fb) | Day 4 |
| T4 | 全 fallback（候选 < 4） | Day 8 |
| T5 | Witness 优先 | 排序算法内置（fixtures 12 张 witness） |
| T6 | 未来时间过滤 | eligibility.ts §3.1 |
| T7 | rights 冲突 | Day 10 + eligibility.ts §3.5 |
| T8 | CDN 失败 | eligibility.ts §3.4（image_variants.length ≥ 1） |
| T9 | moderation pending | eligibility.ts §3.5 |
| T10 | 稳定排序（tie-breaker） | ranker.ts §5.3 |
| T11 | 手动发布 preview | preview.ts（CLI #2） |
| T12 | 替换 draft slot | Day 12 + patch-slot.ts |
| T13 | 整版回滚 | Day 11 + rollback.ts |
| T14 | 替换已发布 slot（拒绝） | patch-slot.ts `cannot_replace_published_slot` |
| T15 | 重复 moment_id（同 Edition）| patch-slot.ts `duplicate_in_edition` |
| T16 | cron 锁超时 | advisory-lock.ts（pg_try_advisory_lock = false） |
| T17 | stale_fallback 24h | Day 14 + simulatePublicApi |
| T18 | 连续 3 天 fallback | Day 8 fallback streak（连续 1 天，最大 streak 1） |
| T19 | 单图失败不影响其他 | eligibility.ts §3.4 |
| T20 | Admin audit log 完整 | Day 11/12 + audit_log INSERT |

### 5.3 报告交付物

演练运行后生成 4 个文件（在 `tests/reports/`）：

| 文件 | 用途 |
|---|---|
| `drill-14day-results.csv` | 14 天每日结果（可导入 spreadsheet） |
| `drill-14day-summary.md` | Gate B 9 项 + 表格 + 结论 |
| `drill-14day-raw-events.json` | 14 天所有 cron events + admin ops |
| `drill-screenshots/README.md` | UI 截图占位（QA Lead 手动捕获） |

---

## 6. 架构细节

### 6.1 DbClient 抽象

```typescript
interface DbClient {
  query<T>(sql: string, params?: unknown[]): Promise<QueryResult<T>>;
  begin(): Promise<DbClient>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
}
```

3 种实现：

1. **`InMemoryDb`** — 测试用（自包含，无需基础设施）
2. **`SupabaseDbAdapter`** — 生产用（service_role admin client）
3. **生产推荐：RPC 函数** — 包装复杂 SQL 为 `rpc()` 调用

### 6.2 In-Memory DB 支持的 SQL 子集

- ✅ `SELECT col1, col2::text AS alias FROM table WHERE col = $N AND col2 = $M ORDER BY col DESC LIMIT 5`
- ✅ `INSERT INTO table (cols) VALUES ($1, $2, literal, NOW())`
- ✅ `UPDATE table SET col = $1 WHERE id = $2`
- ✅ `DELETE FROM table WHERE id = $1`
- ✅ `SELECT COUNT(*)::int AS count FROM ...`
- ✅ `IS NULL` / `IS NOT NULL` 谓词
- ✅ `pg_try_advisory_lock` / `pg_advisory_unlock` / `pg_advisory_unlock_all`
- ✅ `BEGIN` / `COMMIT` / `ROLLBACK` / `SET LOCAL`
- ❌ 不支持：JOIN / subquery / window functions / CTE / FOR UPDATE

### 6.3 Node 22 ESM + TypeScript

- `--experimental-strip-types` — 启用 .ts 文件类型剥离
- `--loader=./loader-register-ts.mjs` — 自定义 resolver hook（处理无扩展名 .ts 导入）
- `isMain(import.meta.url)` — 检测 entry point

---

## 7. 已知限制

### 7.1 不实现的内容（V1.1+ 路线图）

- ❌ Sharp EXIF 处理器（V1.1）
- ❌ Vercel Queue 异步处理（V1.1）
- ❌ Moderator UI（V1 不做 · 决策 4/13）
- ❌ Sentry Cloud（V1.1）
- ❌ OAuth（V1.1）

### 7.2 测试覆盖限制

- In-Memory DB 不支持窗口函数 / 复杂 JOIN
- 14 天演练每个 day 用独立 in-memory DB（不验证多天 cron 重叠）
- mock advisory lock 总是返回 `ok: true`（不模拟锁竞争）

### 7.3 部署依赖

- ⚠️ `E-P0-03 Phase 1.1` 必须先建 `moments` + `cities` 表
- ⚠️ `E-P0-10` 必须先建 `analytics_events` + `monitoring_alerts` 表

---

## 8. 进一步阅读

- **设计文档**：`../e-p0-06-daily-12-supply-chain/`（6 文件，LOCKED）
- **实施报告**：[`phase2-deployment-report.md`](./phase2-deployment-report.md)
- **E-P0-09 API Contract**：`../api-contract/zod-schemas/edition.ts`
- **E-P0-03 依赖**：../e-p0-03-witness-backend/schema-v1.md
- **E-P0-10 监控**：../e-p0-10-monitoring/

---

## 9. 问题排查

### Q1：`Cannot find module './foo'` 错误

**原因**：Node 22 的 `--experimental-strip-types` 不自动解析 `.ts` 扩展。

**解决**：确保所有 import 使用无扩展名（`from './foo'`），并使用 `--loader=./loader-register-ts.mjs`。

### Q2：`isMain()` 判定失败导致 main() 不运行

**解决**：检查 `import.meta.url` 与 `process.argv[1]` 的 basename 是否匹配。如果用了特殊字符（如中文目录），`isMain()` 会自动处理 URL encode。

### Q3：14 天演练报 `filled=12/12`（应该 7）

**原因**：In-Memory DB 的 `IS NOT NULL` 谓词可能未命中。

**解决**：检查 `scripts/lib/db.ts` 中的 `isNotNull` 正则是否覆盖了你的 SQL。

### Q4：DB 写不进去

**检查**：
1. `process.env.E_P0_06_USE_MOCK === '1'` 是否未设置（生产环境需设 0 或省略）
2. `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` 是否正确
3. Supabase 项目权限（service_role 必须有 write 权限）

---

— Engineer Agent · 2026-08-24