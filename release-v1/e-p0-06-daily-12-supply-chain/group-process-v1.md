---
title: SEE EARTH V1 · 每日组版流程 + Cron 时序图 · E-P0-06 D3
type: engineering-process
tags: [release-v1, engineering, e-p0-06, daily-12, cron, group-process, see-earth]
task_id: E-P0-06
brief_anchor: §5 E-P0-06 §B (组版流程) + §I (数据流) / 任务卡 §B
track: engineering
owner: Engineer Agent (Backend / Infra)
created: 2026-08-24
status: IN REVIEW
target_gate: Gate B · Closed Beta
related_docs:
  - ./edition-entity-v1.md
  - ./eligibility-v1.md
  - ./fallback-v1.md
  - ./scheduling-v1.md
  - ./14-day-test-plan-v1.md
  - ../alpha-environment/env-decision-v1.md (Vercel Cron)
  - ../alpha-environment/deployment-guide-v1.md
depends_on: [E-P0-09 LOCKED ✓, E-P0-04 LOCKED ✓]
blocks: [E-P0-10 Monitoring]
source_brief: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/SEE-EARTH-Release-Strategy-v1-Design-Engineering-Task-Brief.md §5 E-P0-06
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/e-p0-06-daily-12-supply-chain/group-process-v1.md
workspace_canonical_path: /Users/lwy/Documents/ChatGPT/看见地球/release-v1/e-p0-06-daily-12-supply-chain/group-process-v1.md
note: 本文件已就绪，需 PM Agent 由 Obsidian 写入权限落地到 canonical 路径。
---

# SEE EARTH V1 · 每日组版流程 + Cron 时序图

> **作者**：Engineer Agent · E-P0-06 Owner
> **目标读者**：PM Agent · E-P0-09 Contract Owner · E-P0-10 Monitoring Owner · 后端工程师 · Vercel Cron Owner · QA
> **目的**：把 Brief §B + §I 的"每日组版"流程**变成可执行的 cron job + 时序图**——每天 00:00 UTC 自动跑（Vercel Cron），生成 next-day Edition draft，admin 预览确认后发布。
> **完成时间**：2026-08-24
> **配套文件**：`edition-entity-v1.md` ` `eligibility-v1.md` ` `fallback-v1.md` ` `scheduling-v1.md`

---

## 0. 一句话总结

**每日 00:00 UTC**（Vercel Cron `0 0 * * *`）触发 `daily-edition-builder.ts`：拉候选池 → 5 项资格校验 → 4 级权重排序 → 12 槽位填充 → 创建 Edition draft → 通知 admin 预览。**整版 < 90 秒完成**（避免 cron 重叠）。

---

## 1. 阅读指南

- **§3 时序图**（11 步 + 错误分支）
- **§4 cron 实现**：Vercel Cron Jobs 配置 + 文件位置 + 实现语言
- **§5 实现代码骨架**（TypeScript / Node 20+）
- **§6 触发时机**：UTC 00:00 vs 本地时区取舍
- **§7 失败处理**：cron 失败 → 自动 fallback Edition
- **§8 监控埋点**（与 E-P0-10 对齐）
- **§9 重叠与锁**：并发保护
- **§10 不做的事**

---

## 2. 文件 / 路径约定

| 资源 | 路径 |
|---|---|
| Cron 实现文件 | `scripts/cron/daily-edition-builder.ts` |
| 资格校验 | `src/lib/edition/eligibility.ts` |
| 排序算法 | `src/lib/edition/ranker.ts` |
| 槽位填充 | `src/lib/edition/slot-filler.ts` |
| Vercel Cron 配置 | `vercel.json`（顶层配置） |
| Admin 通知 | `scripts/cron/notify-admin.ts`（Slack/Email webhook） |
| 监控埋点 | `src/lib/monitoring/cron.ts`（E-P0-10） |

> **不引入新依赖**：用现有 Vercel Cron（Alpha 决策）+ Postgres 客户端 + Slack Webhook（已就绪）。

---

## 3. 时序图（每日 00:00 UTC 全流程）

```text
┌─────────────────────────────────────────────────────────────────────┐
│ Vercel Cron Trigger                                                  │
│ Schedule: 0 0 * * * (UTC)                                            │
│ Target: POST /api/cron/daily-edition-builder                         │
│ Auth: Bearer <CRON_SECRET> (Vercel env)                              │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ Step 1 · Lock 抢占 (advisory lock · Postgres pg_try_advisory_lock)   │
│ - 防止 cron 重叠（如 23:59 触发 + 00:00 触发）                       │
│ - lock_timeout = 60s · 失败立即返回 409                              │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ Step 2 · SET LOCAL app.actor='cron'                                  │
│ - 触发器自动写入 edition_status_history (actor='cron')              │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ Step 3 · 拉候选池（eligibility.ts）                                  │
│ SQL:                                                                │
│   SELECT * FROM moments                                              │
│   WHERE status='published'                                          │
│     AND moderation_status='approved'                                 │
│     AND published_at <= NOW()                                        │
│     AND captured_at < NOW()                                          │
│     AND city_id IN (12 cities)                                       │
│     AND jsonb_array_length(image_variants) >= 1                     │
│     AND rights IN (...white_list)                                    │
│   ORDER BY captured_at DESC                                          │
│ Result: candidate_pool (typical N = 30~80)                           │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ Step 4 · 应用软约束 (eligibility.ts)                                 │
│   - 候选池内 DISTINCT moment_id                                      │
│   - 按 city_id 分组，统计每城候选数                                  │
│ Result: grouped_by_city[city] → [moment...]                          │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ Step 5 · 4 级权重排序 (ranker.ts)                                    │
│   - P0: witness > editorial > seed                                  │
│   - P1: captured_at DESC                                             │
│   - P2: rights quality                                               │
│   - P3: tie-breaker (captured_at DESC → published_at DESC → id ASC) │
│ Result: candidates_ranked[]                                          │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ Step 6 · 12 槽位填充 (slot-filler.ts)                                │
│   - Step 6a: 12 城各选最优 1 张                                      │
│   - Step 6b: 剩余 slot 填次优候选（同城最多 2 张）                   │
│   - Step 6c: 不足 12 → 补 placeholder slot (fallback_reason=...)    │
│ Result: filled_slots[12] + dropped_moments[] + warnings[]             │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ Step 7 · 检查是否需要 fallback Edition (fallback-v1.md §3)          │
│   - slots_with_moment >= 8 → status='preview' (no fallback)         │
│   - 4 <= slots_with_moment < 8 → is_fallback=TRUE                   │
│   - slots_with_moment < 4 → 触发全自动 fallback (见 fallback-v1.md)│
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ Step 8 · 创建 Edition + 12 slots                                     │
│ SQL:                                                                │
│   BEGIN;                                                            │
│   INSERT INTO editions (date, status, is_fallback, ...)             │
│     VALUES (CURRENT_DATE+1, 'preview', ...);                        │
│   -- INSERT 12 slot rows                                            │
│   INSERT INTO edition_slots (edition_id, position, ...)             │
│     VALUES (...), (...), ...;                                       │
│   COMMIT;                                                           │
│ - 触发器自动维护 slots_count + is_complete + status_history         │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ Step 9 · 发布确认（V1: 自动 publish）                                │
│   - V1 默认 cron 直接 status='published'                            │
│   - V1.x 预留：发送 admin 通知 → admin 在 24h 内 approve 才 publish│
│   - 但本设计为「cron → preview → 自动 publish at 00:00」组合        │
│   - admin 替换 / rollback 见 scheduling-v1.md §3                    │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ Step 10 · 监控埋点 (E-P0-10 monitoring/cron)                         │
│   - cron_started{request_id, target_date, trigger_source}            │
│   - cron_completed{request_id, duration_ms, filled_count,           │
│                    dropped_count, is_fallback, fallback_reason}      │
│   - cron_failed{request_id, error_category, error_message}           │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ Step 11 · Release Lock (advisory unlock)                           │
│   - pg_advisory_unlock()                                             │
│   - 释放 advisory lock                                              │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ Step 12 · Admin 通知（如 slots_with_moment < 12）                   │
│   - Slack webhook: #see-earth-cron-alerts                           │
│   - Email: editorial-team@see-earth.example                         │
│   - 内容：date / filled_count / fallback_reason / 详细日志链接        │
└─────────────────────────────────────────────────────────────────────┘
```

**总耗时**：30~80 张候选池（典型情况）→ 全流程 **< 90 秒**。

---

## 4. Cron 实现细节

### 4.1 Vercel Cron Jobs 配置（`vercel.json`）

```json
{
  "crons": [
    {
      "path": "/api/cron/daily-edition-builder",
      "schedule": "0 0 * * *"
    },
    {
      "path": "/api/cron/14-day-drill-runner",
      "schedule": "0 2 * * *",
      "comment": "E-P0-06 14 day continuous drill runner (Closed Beta gate, runs nightly during drill)"
    }
  ]
}
```

> **Vercel Cron 限制**：Hobby plan 仅支持每日 1 次 + 每周 1 次；如需每日 2 次（00:00 + 02:00 backup）需 Pro plan。
> **V1 推荐**：每日 1 次 00:00 UTC；备援由 GitHub Actions 提供（见 §4.2）。

### 4.2 备援机制（GitHub Actions · P1 推荐）

```yaml
# .github/workflows/daily-edition-builder-backup.yml
name: Daily Edition Builder Backup
on:
  schedule:
    - cron: '0 1 * * *'   # 1 小时后跑（Vercel 失败兜底）
  workflow_dispatch:        # 手动触发（admin 按钮 / 演练）
jobs:
  run:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger cron
        run: |
          curl -X POST https://api.see-earth.example/api/cron/daily-edition-builder \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            -H "Content-Type: application/json" \
            -d '{"trigger":"github-actions","target_date":"$(date -u +%Y-%m-%d -d +1 day)"}'
```

> **职责**：
> - **Vercel Cron**：主路径（每日 00:00 UTC）
> - **GitHub Actions**：备援（01:00 UTC） + 手动 trigger（演练 / admin 手动组版）

### 4.3 路由处理（`/api/cron/daily-edition-builder`）

```typescript
// app/api/cron/daily-edition-builder/route.ts (Next.js Route Handler · E-P0-09 一致)
import { NextRequest, NextResponse } from 'next/server';
import { runDailyEditionBuilder } from '@/scripts/cron/daily-edition-builder';
import { verifyCronSecret } from '@/lib/auth/cron';

export async function POST(req: NextRequest) {
  // Auth：CRON_SECRET（Vercel env）
  if (!verifyCronSecret(req.headers.get('authorization'))) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  // Body: { trigger?: string, target_date?: string, dry_run?: boolean }
  const body = await req.json().catch(() => ({}));

  const result = await runDailyEditionBuilder({
    trigger: body.trigger ?? 'vercel-cron',
    target_date: body.target_date ?? null,  // null = tomorrow UTC
    dry_run: body.dry_run ?? false,
  });

  return NextResponse.json(result);
}
```

---

## 5. 实现代码骨架（TypeScript）

```typescript
// scripts/cron/daily-edition-builder.ts
import { Pool } from 'pg';
import { fetchCandidatePool } from '@/lib/edition/eligibility';
import { rankCandidates } from '@/lib/edition/ranker';
import { fillSlots } from '@/lib/edition/slot-filler';
import { shouldCreateFallback } from '@/lib/edition/fallback-decision';
import { monitor } from '@/lib/monitoring';

export async function runDailyEditionBuilder(opts: {
  trigger: string;
  target_date?: string | null;
  dry_run?: boolean;
}) {
  const start_ms = Date.now();
  const request_id = crypto.randomUUID();
  const target_date = opts.target_date ?? computeTomorrowUTC();

  // Step 1: Advisory lock
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const lockAcquired = await pool.query('SELECT pg_try_advisory_lock(?) AS ok', [cronLockKey]);
  if (!lockAcquired.rows[0].ok) {
    return { status: 'locked', message: 'Another cron is running', request_id };
  }

  try {
    // Step 2: Actor
    await pool.query("SET LOCAL app.actor = 'cron'");

    monitor.emit('cron_started', { request_id, target_date, trigger: opts.trigger });

    // Step 3-4: 候选池 + 软约束
    const candidates = await fetchCandidatePool(pool, { target_date });

    // Step 5: 排序
    const ranked = rankCandidates(candidates, { reference_now: new Date() });

    // Step 6: 槽位填充
    const { filled, dropped, warnings } = fillSlots(ranked);

    // Step 7: fallback 决策
    const fallback_decision = shouldCreateFallback(filled);

    // Step 8-9: 创建 + 发布（事务）
    if (!opts.dry_run) {
      await pool.query('BEGIN');
      const edition = await pool.query(
        `INSERT INTO editions (date, status, is_fallback, fallback_reason, ...)
         VALUES ($1, 'published', $2, $3, ...) RETURNING *`,
        [target_date, fallback_decision.is_fallback, fallback_decision.reason]
      );
      const edition_id = edition.rows[0].id;
      for (const slot of filled) {
        await pool.query(
          `INSERT INTO edition_slots (edition_id, position, moment_id, city_id,
                                       source_type, fallback_reason, is_editorial_fill)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [edition_id, slot.position, slot.moment_id, slot.city_id,
           slot.source_type, slot.fallback_reason, slot.is_editorial_fill]
        );
      }
      await pool.query('COMMIT');
    }

    // Step 10: 监控
    monitor.emit('cron_completed', {
      request_id,
      duration_ms: Date.now() - start_ms,
      filled_count: filled.filter(s => s.moment_id).length,
      dropped_count: dropped.length,
      is_fallback: fallback_decision.is_fallback,
      fallback_reason: fallback_decision.reason,
    });

    return {
      status: 'success',
      request_id,
      edition_date: target_date,
      filled_count: filled.filter(s => s.moment_id).length,
      is_fallback: fallback_decision.is_fallback,
    };
  } catch (err) {
    monitor.emit('cron_failed', {
      request_id,
      error_category: categorizeError(err),
      error_message: err.message,
    });
    await pool.query('ROLLBACK');
    throw err;
  } finally {
    await pool.query('SELECT pg_advisory_unlock(?)', [cronLockKey]);
  }
}
```

---

## 6. 触发时机：UTC 00:00 vs 本地时区

### 6.1 决策：**UTC 00:00**（与 Brief §B 一致）

| 方案 | 优点 | 缺点 |
|---|---|---|
| ✅ **UTC 00:00**（V1 采纳） | 简单 / 一致 / 全球唯一 | 用户感知"新一天"不在 0 点本地 |
| 本地 0:00（每城各自）| 用户感知"今晨 0 点"自然 | 12 城 12 个时区，12 个 cron → 复杂度爆炸 |

### 6.2 折中方案（V1 不启用，V1.x 评估）

- Edition `date` 用 UTC（cron / DB 视角）
- Web 客户端按用户**浏览器时区**渲染（前端 E-P0-05 负责）
- "今天" 在 -12 时区用户看到昨日 12:00 → 仍可用（用户体验边缘 case）

### 6.3 跨时区 fallback 边界

```text
场景：UTC 2026-08-22 00:00 cron 跑 → 创建 date=2026-08-22 的 Edition

- 东京 (+9) 用户：08-22 09:00 → 看到 date=2026-08-22 ✅
- 纽约 (-4) 用户：08-21 20:00 → 看到 date=2026-08-21 Edition（昨天）
   - 此时 08-22 Edition 已生成但还未到本地 0:00
   - V1 可接受（用户感知"昨日"为最新）
- LA (-7) 用户：08-21 17:00 → 看到 date=2026-08-21（昨日）
   - 同上
```

**V1 决策**：UTC 00:00 cron 即可，**前端时区渲染** + **stale_fallback 阈值 24h** 覆盖边缘 case（D-P0-04 §1.1 #5）。

---

## 7. 失败处理（cron 失败 → 自动 fallback）

### 7.1 失败分类

| 错误类别 | 处理 |
|---|---|
| `db_unreachable` | 5 分钟重试 1 次 → 仍失败则触发 stale_fallback |
| `cron_lock_timeout` | 跳过本次 → 下次 cron 接管 |
| `eligibility_check_internal_error` | 中止 cron → admin 手动组版 |
| `slot_filler_error`（如 city_id 缺失）| 单 slot fallback，其余继续 |
| `monitoring_error` | 不影响 cron（监控是 best-effort） |

### 7.2 fallback 兜底链路

```text
cron 失败
  ↓
  ├─ 重试 1 次（5 分钟后，由 GitHub Actions 触发）
  │    ↓
  │    ├─ 成功 → 完成
  │    └─ 失败 → 进入 fallback 链路
  ↓
  触发 stale_fallback（D-P0-04 §1.1 #5）
  ↓
  公开 API 返回 last_known_good_edition
  ↓
  UI 显示"今日尚未更新；这里显示的是 [YYYY-MM-DD] 的切片"
```

详见 `fallback-v1.md §4`。

---

## 8. 监控埋点（与 E-P0-10 对齐）

| 事件名 | 触发时机 | 字段 |
|---|---|---|
| `cron_started` | Step 3 入口 | `request_id` · `target_date` · `trigger` (vercel-cron / github-actions / admin-manual) |
| `cron_completed` | Step 11 成功 | `request_id` · `duration_ms` · `filled_count` · `dropped_count` · `is_fallback` · `fallback_reason` |
| `cron_failed` | catch 块 | `request_id` · `error_category` · `error_message` · `stack_hash` |
| `cron_lock_timeout` | Step 1 失败 | `request_id` · `previous_request_id`（如有） |
| `edition_created` | Step 8 成功 | `edition_id` · `date` · `slots_count` · `is_fallback` · `version` |
| `edition_published` | Step 9 成功 | `edition_id` · `date` · `published_at` |

> **不发送禁采字段**：完全遵循 E-P0-10 `forbidden-fields-v1.md`（无 raw_location / 无 EXIF / 无 free text 主体）。

---

## 9. 重叠与锁

### 9.1 Postgres advisory lock

```sql
-- 单一 lock key（全局共享）
SELECT pg_try_advisory_lock(987654321);  -- cron_lock_key
```

| 项 | 规则 |
|---|---|
| **lock key** | 固定值（避免冲突） |
| **超时** | 60s（pg_try_advisory_lock + timeout） |
| **失败行为** | 立即返回 409（"Another cron is running"） |
| **监控** | `cron_lock_timeout` 事件 → admin 告警 |

### 9.2 手动触发 vs cron 触发

| 触发方 | 行为 |
|---|---|
| Vercel Cron (00:00) | 主路径 |
| GitHub Actions (01:00) | 备援 |
| Admin 手动 | `workflow_dispatch` 或 CLI → 跳过 lock 检查（admin 强制） |

---

## 10. 不做的事

- ❌ **不引入新 cron 调度器**（如 BullMQ / Temporal）—— 用 Vercel Cron + GitHub Actions
- ❌ **不做"全球多时区 cron"** —— 12 城版本统一 UTC 00:00（§6.1）
- ❌ **不写入 raw_location / raw_exif 到 Edition** —— slot.moment_id 仅引用 ID
- ❌ **不做媒体预加载** —— 媒体由 CDN 按需拉取
- ❌ **不做 i18n 文案预生成** —— 客户端按 locale 实时翻译（D-P0-01 LOCKED）
- ❌ **不做"周末 / 节假日特殊版"** —— V1 简化，所有 date 同算法

---

## 11. 自验收 Checklist（每日组版流程）

- [x] 11 步时序图完整（含错误分支）
- [x] Vercel Cron 配置 + GitHub Actions 备援
- [x] TypeScript 代码骨架（含 advisory lock + monitoring）
- [x] UTC 00:00 vs 本地时区决策
- [x] 失败处理（4 类错误 + stale_fallback 兜底）
- [x] 监控埋点 6 个事件
- [x] 并发保护（advisory lock）

---

> **下一步**：阅读 `fallback-v1.md`，理解 fallback Edition 的自动创建与连续 N 天告警。