---
title: SEE EARTH V1 · 兜底 Edition · 自动 fallback + 警告阈值 · E-P0-06 D4
type: engineering-fallback
tags: [release-v1, engineering, e-p0-06, daily-12, fallback, stale, see-earth]
task_id: E-P0-06
brief_anchor: §5 E-P0-06 §C (兜底 Edition) + §G (fallback 规则) / 任务卡 §C
track: engineering
owner: Engineer Agent (Backend / Monitoring)
created: 2026-08-24
status: IN REVIEW
target_gate: Gate B · Closed Beta
related_docs:
  - ./edition-entity-v1.md
  - ./eligibility-v1.md
  - ./group-process-v1.md
  - ./scheduling-v1.md
  - ./14-day-test-plan-v1.md
  - ../api-contract/openapi.yaml (§1057–1118)
  - ../system-states/state-matrix-v1.md (§1.1 #5 stale_fallback / #4 fully_unavailable)
depends_on: [E-P0-09 LOCKED ✓, E-P0-10 IN PROGRESS]
blocks: [Gate B Beta readiness]
source_brief: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/SEE-EARTH-Release-Strategy-v1-Design-Engineering-Task-Brief.md §5 E-P0-06
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/e-p0-06-daily-12-supply-chain/fallback-v1.md
workspace_canonical_path: /Users/lwy/Documents/ChatGPT/看见地球/release-v1/e-p0-06-daily-12-supply-chain/fallback-v1.md
note: 本文件已就绪，需 PM Agent 由 Obsidian 写入权限落地到 canonical 路径。
---

# SEE EARTH V1 · 兜底 Edition · 自动 fallback + 警告阈值

> **作者**：Engineer Agent · E-P0-06 Owner
> **目标读者**：PM Agent · E-P0-09 Contract Owner · E-P0-10 Monitoring Owner · 后端工程师 · Editorial Team · QA
> **目的**：把 Brief §C + §G 的"兜底 Edition"**算法化**——什么时候触发 fallback / 怎么标 / 怎么回退 / 何时告警。**关键原则**：**fallback 仍展示内容但 UI 显式标注"内容待补充"**，**不假装是正常 Edition**，**连续 3 天 fallback 必触发 admin 介入**。
> **完成时间**：2026-08-24
> **配套文件**：`edition-entity-v1.md` ` `eligibility-v1.md` ` `group-process-v1.md`

---

## 0. 一句话总结

**Fallback Edition = 同 date 的次优 Edition，标记 `is_fallback=true`，UI 显式标注。触发条件 3 个：① 候选不足 8 张 ② cron 失败 ③ 整版回滚（admin 操作）。连续 3 天 fallback → monitoring 告警 admin 介入。**

---

## 1. 阅读指南

- **§2 触发条件（3 类）**
- **§3 fallback Edition 创建规则**
- **§4 UI 行为（D-P0-04 §1.1 stale_fallback / partial_missing 对齐）**
- **§5 连续 N 天告警机制**
- **§6 stale_fallback 阈值（24h）**
- **§7 last_known_good Edition（最终兜底）**
- **§8 与 D-P0-04 状态矩阵的衔接**
- **§9 不做的事**

---

## 2. 触发条件（3 类）

| # | 触发 | fallback_reason | 触发方 |
|---|---|---|---|
| 1 | **候选不足**：`slots_with_moment < 8` | `no_sufficient_candidates` | Cron 自动 |
| 2 | **cron 完全失败**（如 DB unreachable）| `editorial_rollback`（**注**：cron 失败视作"运营不可抗力"，标 rollback 触发 stale_fallback）| Cron 失败链 |
| 3 | **手动回滚**（admin 操作）| `editorial_rollback` | Admin API |

### 2.1 触发条件 1（候选不足 · 自动）

```text
slots_with_moment = filled.filter(s => s.moment_id != null).length

if slots_with_moment >= 8:
  → status='preview' (no fallback)
elif 4 <= slots_with_moment < 8:
  → is_fallback=TRUE, fallback_reason='no_sufficient_candidates'
elif slots_with_moment < 4:
  → 全 fallback（last_known_good 兜底 §7）
```

### 2.2 触发条件 2（cron 失败 · stale_fallback）

```text
Cron 失败（连续 2 次：00:00 + 01:00 备援）
  ↓
  公开 API 自动回退到 last_known_good_edition
  ↓
  UI 显示 stale_fallback（D-P0-04 §1.1 #5）
```

### 2.3 触发条件 3（手动回滚 · admin 介入）

```text
admin 点击"整版回滚"按钮
  ↓
  POST /api/admin/editions/{id}/rollback
  ↓
  创建新 Edition (is_fallback=TRUE, replaces_edition_id=原id)
  ↓
  原 Edition status='replaced'
```

详见 `scheduling-v1.md §4`。

---

## 3. fallback Edition 创建规则

### 3.1 SQL（与 `edition-entity-v1.md §3` 字段对齐）

```sql
-- ============================================================
-- SEE EARTH V1 · 自动 fallback Edition 创建
-- 触发方：CROn (Step 7 of group-process-v1.md) 或 admin API
-- ============================================================
INSERT INTO editions (
  date, version, status, is_fallback, fallback_reason, slots_count, is_complete
)
SELECT
  COALESCE(:target_date, CURRENT_DATE + INTERVAL '1 day'),  -- 默认明日 UTC
  1,                                                          -- fallback 版视为 v1
  'published',                                                -- 直接发布（无 preview 阶段）
  TRUE,
  :fallback_reason,                                           -- 'no_sufficient_candidates' / 'editorial_rollback' / 'safety_takedown'
  0,                                                          -- 触发时 slots_count=0（fallback 的 fallback Edition 无 slot）
  FALSE
WHERE NOT EXISTS (
  SELECT 1 FROM editions
  WHERE date = COALESCE(:target_date, CURRENT_DATE + INTERVAL '1 day')
    AND status IN ('draft','preview','scheduled','published')
);
```

### 3.2 触发后行为

| 行为 | 规则 |
|---|---|
| **fallback Edition 仍展示内容** | UI 必须显式标注"内容待补充"（D-P0-04 §1.1 #5） |
| **slot 全部为 placeholder** | 12 个 slot 都是 fallback slot，`moment_id=null, fallback_reason='no_candidate_for_city'` |
| **UI 不显示"今晨来自..."** | 仅显示"今天这里还没有切片"（D-P0-04 §1.1 partial_missing 文案） |
| **不参与 ranking** | fallback Edition 自身不作为下一日 cron 候选池 |

### 3.3 fallback Edition 的"slot 内容"

V1 决策：**fallback Edition 的 12 个 slot 全部为 placeholder**——而非用历史 Moment 填充。

**理由**：
- ❌ 用历史 Moment 填充会"假装是新一天"（违反 D-P0-04 §1.1 #5 DO NOT）
- ❌ 历史 Moment 跨 Edition 引用会破坏 `edition_slots.moment_id` 唯一性诉求
- ✅ Placeholder + UI 文案 = 诚实表达"今天还没有"

**回退链路**：若 fallback Edition 触发，UI 显示"今日尚未更新；这里显示的是 [YYYY-MM-DD] 的切片"——但**该"切片"是 last_known_good Edition（§7）**，不是 fallback Edition 本身。

---

## 4. UI 行为（与 D-P0-04 §1 对齐）

### 4.1 fallback Edition 渲染（`is_fallback=true`）

| UI 元素 | 行为 |
|---|---|
| 顶部 banner | "今天来自 [N] 个城市的切片"（N = slots_with_moment） |
| 占位 tile | 12 - N 个 tile 显示"今日来自 [城市名] 的内容尚未发布"（D-P0-04 §1.1 #3 partial_missing 文案） |
| Layer 标记 | 主图右下角小字"待补充"（仅 fallback Edition 显示） |
| 12 区块底部 | 不显示"今日更新"时间戳 |
| 路由 | `/today` 路由不区分 fallback vs normal，统一返回 |

### 4.2 stale_fallback 渲染（`api 返回的是 last_known_good`）

| UI 元素 | 行为 |
|---|---|
| 顶部一行 | "今日尚未更新；这里显示的是 [YYYY-MM-DD] 的切片"（D-P0-04 §1.1 #5 stale_fallback 文案） |
| 12 个 tile | 渲染 last_known_good Edition 内容 |
| 主图 | 渲染 last_known_good 主图（**与今日主图**不同） |
| "刷新"按钮 | 启用，刷新可重试（可能 cron 修好） |

### 4.3 fully_unavailable 渲染（API 5xx / network）

| UI 元素 | 行为 |
|---|---|
| 整版 | 12 个 tile 全部为"远方暂时连不上"占位（D-P0-04 §1.1 #4） |
| 错误 ID | 底部小字显示 short_id |
| "重试"按钮 | 启用（最多 2 自动 + 1 手动） |
| "返回首页"链接 | 启用 |

### 4.4 状态机闭环

```text
[任意状态] → loading_skeleton → ready
                              ↓ (1 slot 缺失)
                        partial_missing (D-P0-04 §1.1 #3)
                              ↓ (API 失败)
                        fully_unavailable → retrying → ready
                                            → fully_unavailable
                              ↓ (stale)
                        stale_fallback → ready (refresh 成功)
                              ↓ (全空)
                              empty → ready
                              ↓ (组件抛错)
                        error_boundary → ready (refresh 成功)
```

---

## 5. 连续 N 天告警机制

### 5.1 阈值定义（与 Brief §G 对齐）

| 连续天数 | 告警级别 | 触发动作 |
|---|---|---|
| **1 天** | 🟢 INFO | monitoring 记录 `fallback_streak=1` |
| **2 天** | 🟡 WARN | Slack `#see-earth-cron-alerts` 通知 |
| **3 天** | 🔴 CRITICAL | Slack + Email + PagerDuty（admin 强制介入） |
| **5 天** | 🔴 CRITICAL+ | 同时触发 `escalation@see-earth.example` |

### 5.2 实现位置

| 层 | 实现 |
|---|---|
| **DB** | **不存连续 fallback 天数**（避免状态爆炸） |
| **Monitoring（E-P0-10）** | 实时查询 `editions` 最近 N 天数据 → 计算 streak |
| **告警** | E-P0-10 alert manager（与现有 cron 告警复用） |

### 5.3 监控查询

```sql
-- 最近 N 天 fallback Edition 计数（E-P0-10 monitoring 用）
WITH RECENT_DAYS AS (
  SELECT generate_series(
    CURRENT_DATE - INTERVAL '5 days',
    CURRENT_DATE,
    INTERVAL '1 day'
  )::DATE AS day
),
DAILY_FALLBACK AS (
  SELECT
    d.day,
    EXISTS (
      SELECT 1 FROM editions e
      WHERE e.date = d.day
        AND e.is_fallback = TRUE
        AND e.status = 'published'
    ) AS is_fallback_day
  FROM RECENT_DAYS d
)
SELECT
  day,
  is_fallback_day,
  -- 计算连续 streak（从最新日往回数）
  SUM(CASE WHEN is_fallback_day THEN 1 ELSE 0 END)
    OVER (ORDER BY day DESC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS streak
FROM DAILY_FALLBACK
ORDER BY day DESC;
```

### 5.4 告警 payload

```json
{
  "alert": "fallback_streak",
  "severity": "critical",
  "streak_days": 3,
  "fallback_dates": ["2026-08-20", "2026-08-21", "2026-08-22"],
  "common_reasons": ["no_sufficient_candidates"],
  "recommendation": "Run: scripts/cron/manual-fill-candidates.ts --days 3",
  "runbook_url": "https://wiki.see-earth.example/runbooks/fallback-streak"
}
```

---

## 6. stale_fallback 阈值（24h）

### 6.1 定义（与 D-P0-04 §1.1 #5 对齐）

> **stale_fallback = 同一 date 的 Edition 超过 24h 未刷新**（API 返回的 edition_id 与上次相同且超过 fallback 阈值 24h）

### 6.2 实现

```typescript
// API 路由：/api/editions/today
const today = new Date();
const twentyFourHoursAgo = new Date(today.getTime() - 24 * 60 * 60 * 1000);

// 拉取今日 Edition（含 fallback）
const edition = await fetchTodayEdition({ include_fallback: true });

// stale 判断
const isStale = edition.published_at && (new Date(edition.published_at) < twentyFourHoursAgo);
```

### 6.3 UI 行为

- `isStale = true` → UI 显式标注 stale_fallback 文案（D-P0-04 §1.1 #5）
- `isStale = false` → 正常 ready 状态

---

## 7. last_known_good Edition（最终兜底）

### 7.1 触发条件

```text
今日 Edition 不存在（或 is_fallback 但 slots 全空）
  ↓
  公开 API 返回 last_known_good Edition
  ↓
  UI 标注 stale_fallback 文案
```

### 7.2 候选 last_known_good 规则

```sql
-- last_known_good = 最近的 status='published' AND is_fallback=FALSE AND is_complete=TRUE 的 Edition
SELECT e.*
FROM editions e
WHERE e.status = 'published'
  AND e.is_fallback = FALSE
  AND e.is_complete = TRUE
ORDER BY e.date DESC, e.published_at DESC
LIMIT 1;
```

### 7.3 优先级链

```text
1. 今日 PUBLISHED Edition (is_fallback=FALSE, is_complete=TRUE)   ← 正常情况
2. 今日 FALLBACK Edition (is_fallback=TRUE)                       ← 候选不足
3. last_known_good Edition (历史完整 Edition)                     ← cron 失败 / 全 fallback
4. null + UI fully_unavailable 文案                                ← last_known_good 也不可用
```

### 7.4 公开 API 路由实现

```typescript
// app/api/editions/today/route.ts (E-P0-09 一致)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const target_date = searchParams.get('date') ?? computeToUTC();
  const include_fallback = searchParams.get('include_fallback') !== 'false';

  // Step 1: 尝试今日 Edition
  let edition = await fetchTodayEdition({ target_date, include_fallback: true });
  if (edition && edition.is_complete) return ok(edition);

  // Step 2: 今日 fallback Edition
  if (include_fallback) {
    edition = await fetchTodayEdition({ target_date, is_fallback: true });
    if (edition) return ok(edition);
  }

  // Step 3: last_known_good
  const last_known = await fetchLastKnownGoodEdition();
  if (last_known) return ok(last_known, { source: 'last_known_good', is_stale: true });

  // Step 4: 全部不可用
  return notFound({ error_code: 'no_edition_available' });
}
```

---

## 8. 与 D-P0-04 状态矩阵的衔接

| E-P0-06 fallback 行为 | D-P0-04 状态 | 视觉 |
|---|---|---|
| 今日 PUBLISHED Edition (12 slots 全填) | `state.daily12 = ready` | 完整 12 tile |
| 今日 Edition 1 slot 缺失（候选不足） | `state.daily12 = partial_missing` | 11 tile + 1 placeholder |
| 今日 Edition ≥ 4 slot 缺失 | `state.daily12 = partial_missing` + Edition `is_fallback=true` | 4~7 tile + 5~8 placeholder + "内容待补充"banner |
| 今日 Edition 全 fallback | `state.daily12 = stale_fallback` + `last_known_good` Edition | last_known tile + stale 文案 |
| API 失败 | `state.daily12 = fully_unavailable` | 12 placeholder + "远方暂时连不上" |

**字段一致性**：D-P0-04 `state.daily12 = stale_fallback` ↔ E-P0-06 `is_stale = true` ↔ E-P0-10 monitoring alert `fallback_streak`。

---

## 9. 不做的事

- ❌ **不存连续 fallback 天数在 DB** —— monitoring 实时算（避免状态爆炸）
- ❌ **不引入新告警系统** —— 复用 E-P0-10 现有 alert manager
- ❌ **不做"自动 Editorial 兜底"** —— fallback Edition 自身 slot 全 placeholder，**不用历史 Moment 填充**（避免"假装是新一天"）
- ❌ **不做"完美回退"** —— fallback Edition 不继承任何 prior content；保留诚实
- ❌ **不修改 D-P0-04 状态矩阵** —— 8 个状态已锁；E-P0-06 仅在 DB/API 层实现，不改前端状态
- ❌ **不做"连续 fallback 暂停发布"** —— 连续 3 天 fallback 仍发布（**运营不阻断 Daily 12**，仅告警）

---

## 10. 自验收 Checklist（fallback Edition）

- [x] 3 类触发条件明确
- [x] fallback Edition 创建 SQL（含 NOT EXISTS 防重复）
- [x] UI 行为 4 状态与 D-P0-04 对齐
- [x] 连续 N 天告警阈值（1/2/3/5 天）
- [x] 监控查询 SQL（连续 streak 计算）
- [x] 告警 payload 格式
- [x] stale_fallback 24h 阈值
- [x] last_known_good Edition 优先级链
- [x] 公开 API 4 级回退实现
- [x] 与 D-P0-04 状态矩阵字段一致性

---

> **下一步**：阅读 `scheduling-v1.md`，理解定时 / 手动发布 / 替换 / 回滚的 admin 流程。