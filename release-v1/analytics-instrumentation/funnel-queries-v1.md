---
title: SEE EARTH V1 · Funnel Queries · 关键漏斗 SQL Query 模板
type: analytics-funnel-queries
tags: [release-v1, e-p0-07, analytics, sql, funnel, queries, see-earth]
task_id: E-P0-07
track: engineering
created: 2026-08-22
status: DRAFT · IN REVIEW
target_gate: Gate A · Internal Alpha
source_inputs:
  - /Users/lwy/Documents/ChatGPT/看见地球/07-设计师设计参考/release-v1/analytics-events/event-map-v1.md §7
  - ./server-receiver-v1.md §4 (存储 schema)
  - ./sdk-integration-v1.md §12 (与 V1 必答问题对应)
related_docs:
  - ./server-receiver-v1.md
  - ./sdk-integration-v1.md
workspace_canonical_path: /Users/lwy/Documents/ChatGPT/看见地球/release-v1/analytics-instrumentation/funnel-queries-v1.md
note: 本文件已就绪，需 PM Agent 由 workspace 复制到 Obsidian canonical 路径。
---

# SEE EARTH V1 · Funnel Queries · 关键漏斗 SQL Query 模板

> **作者**：Engineer Agent（E-P0-07）
> **目标读者**：E-P0-10 monitoring owner / 数据分析师 / PM / Product
> **目的**：交付 Brief §1.2 提到的 5 个 V1 必答问题对应的 SQL query 模板。
> **存储 schema**：`analytics_events_v1`（详见 `server-receiver-v1.md §4.2`）
> **必答问题对应**：每个 query 标注对应 V1 问题编号（#1 ~ #5）。

---

## 0. 一句话结论

**5 个核心 funnel query 模板覆盖 V1 必答问题 #1 ~ #5，存储于 `analytics_events_v1` 表（事件级 + JSONB props + session_id_hash + env 隔离）。每个 query 包含：用途 / 输入参数 / 输出 schema / 性能预期。Phase 1 mock JSONL 同样适用（用 `jq` 替代 SQL）。**

---

## 1. 存储 schema 回顾（来自 `server-receiver-v1.md §4.2`）

```sql
CREATE TABLE analytics_events_v1 (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event           TEXT NOT NULL,
  ts              TIMESTAMPTZ NOT NULL,
  received_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sdk_version     TEXT NOT NULL,
  app_surface     TEXT NOT NULL,
  session_id_hash TEXT NOT NULL,
  ip_hash         TEXT,
  user_agent_class TEXT,
  env             TEXT NOT NULL DEFAULT 'production',
  props           JSONB NOT NULL
);

CREATE INDEX idx_events_event_ts ON analytics_events_v1 (event, ts DESC);
CREATE INDEX idx_events_session ON analytics_events_v1 (session_id_hash);
CREATE INDEX idx_events_app_surface_ts ON analytics_events_v1 (app_surface, ts DESC);
CREATE INDEX idx_events_env_ts ON analytics_events_v1 (env, ts DESC);
CREATE INDEX idx_events_props_gin ON analytics_events_v1 USING GIN (props);
```

---

## 2. Query 概览

| # | Query 名 | V1 问题 | 主支撑事件 | 关键维度 |
|---|---|:---:|---|---|
| 1 | Daily 12 浏览深度 | #1 | `edition_viewed` + `moment_impression` | `position` 分布 + 中位浏览深度 |
| 2 | Moment → City 转化漏斗 | #2 | `moment_opened` → `city_opened` → `city_section_viewed` | 转化率 + section 深度 |
| 3 | Unknown 完成率 | #3 | `unknown_started` → `unknown_revealed` → `city_opened.entry_point=unknown_reveal` | 完成率 + Reveal → City |
| 4 | Witness 全漏斗 | #4 | `witness_started` → `witness_permission_result` → `witness_upload_started` → `witness_submitted` | 错误分类 |
| 5 | 供应稳定性 | #5 | `edition_viewed`（连续天数）+ `witness_submitted`（来源）+ `moment_impression.source_type` | 连续天数 + 来源占比 |

---

## 3. Query 1 · Daily 12 浏览深度（V1 问题 #1）

### 3.1 用途

回答"用户是否会浏览 Daily 12，而不是只看首屏"：
- Daily 12 slot 1-12 的 `moment_impression` 占比
- 中位浏览深度（中位用户在第几格停下滑动）

### 3.2 输入参数

| 参数 | 必填 | 默认 | 描述 |
|---|:---:|:---:|---|
| `p_date_from` | ✓ | — | 起始日期（UTC） |
| `p_date_to` | ✓ | — | 结束日期（UTC） |
| `p_app_surface` | ❌ | 全部 | e.g. `web_homepage` |
| `p_env` | ❌ | `production` | alpha / beta / production |

### 3.3 SQL

```sql
WITH daily AS (
  SELECT
    date_trunc('day', ts) AS day,
    session_id_hash,
    MAX((props->>'position')::int) AS deepest_position
  FROM analytics_events_v1
  WHERE event = 'moment_impression'
    AND ts >= p_date_from::timestamptz
    AND ts <  p_date_to::timestamptz
    AND app_surface = COALESCE(p_app_surface, app_surface)
    AND env = COALESCE(p_env, 'production')
  GROUP BY day, session_id_hash
),
distribution AS (
  SELECT
    deepest_position,
    COUNT(*) AS session_count
  FROM daily
  GROUP BY deepest_position
)
SELECT
  deepest_position AS position,
  session_count,
  ROUND(100.0 * session_count / SUM(session_count) OVER (), 2) AS pct
FROM distribution
ORDER BY deepest_position ASC;
```

### 3.4 输出 schema

```typescript
interface DailyBrowsingDepthRow {
  position: number;       // 1..12 (the deepest slot reached)
  session_count: number;
  pct: number;            // 0..100
}
```

### 3.5 性能预期

- 索引：`idx_events_event_ts`
- 假设 30 天 × 1000 sessions/day = 30K rows scanned
- 预期执行时间：< 200 ms（PostgreSQL 14 + GIN index）

---

## 4. Query 2 · Moment → City 转化漏斗（V1 问题 #2）

### 4.1 用途

回答"用户从 Moment 进入 City Detail 并继续探索"：
- `moment_opened` → `city_opened` 转化率
- `city_opened` → `city_section_viewed` 转化率
- 各 section 深度分布

### 4.2 输入参数

| 参数 | 必填 | 默认 |
|---|:---:|:---:|
| `p_date_from` | ✓ | — |
| `p_date_to` | ✓ | — |
| `p_entry_point` | ❌ | 全部（`moment_detail` 等） |
| `p_env` | ❌ | `production` |

### 4.3 SQL — Funnel 总览

```sql
WITH sessions AS (
  SELECT DISTINCT session_id_hash
  FROM analytics_events_v1
  WHERE event = 'moment_opened'
    AND ts >= p_date_from::timestamptz
    AND ts <  p_date_to::timestamptz
    AND env = COALESCE(p_env, 'production')
),
funnel AS (
  SELECT
    (SELECT COUNT(DISTINCT session_id_hash)
     FROM analytics_events_v1
     WHERE event = 'moment_opened'
       AND ts >= p_date_from::timestamptz
       AND ts <  p_date_to::timestamptz
       AND env = COALESCE(p_env, 'production')
    ) AS moment_opened_sessions,
    (SELECT COUNT(DISTINCT session_id_hash)
     FROM analytics_events_v1
     WHERE event = 'city_opened'
       AND (props->>'entry_point') = COALESCE(p_entry_point, props->>'entry_point')
       AND ts >= p_date_from::timestamptz
       AND ts <  p_date_to::timestamptz
       AND env = COALESCE(p_env, 'production')
    ) AS city_opened_sessions,
    (SELECT COUNT(DISTINCT session_id_hash)
     FROM analytics_events_v1
     WHERE event = 'city_section_viewed'
       AND ts >= p_date_from::timestamptz
       AND ts <  p_date_to::timestamptz
       AND env = COALESCE(p_env, 'production')
    ) AS city_section_viewed_sessions
)
SELECT
  moment_opened_sessions,
  city_opened_sessions,
  city_section_viewed_sessions,
  ROUND(100.0 * city_opened_sessions / NULLIF(moment_opened_sessions, 0), 2) AS moment_to_city_pct,
  ROUND(100.0 * city_section_viewed_sessions / NULLIF(city_opened_sessions, 0), 2) AS city_to_section_pct
FROM funnel;
```

### 4.4 SQL — Section 深度分布

```sql
SELECT
  props->>'section' AS section,
  COUNT(DISTINCT session_id_hash) AS sessions,
  COUNT(*) AS total_views
FROM analytics_events_v1
WHERE event = 'city_section_viewed'
  AND ts >= p_date_from::timestamptz
  AND ts <  p_date_to::timestamptz
  AND env = COALESCE(p_env, 'production')
GROUP BY section
ORDER BY sessions DESC;
```

### 4.5 输出 schema

```typescript
interface MomentToCityFunnelRow {
  moment_opened_sessions: number;
  city_opened_sessions: number;
  city_section_viewed_sessions: number;
  moment_to_city_pct: number;        // 0..100
  city_to_section_pct: number;       // 0..100
}

interface SectionDistributionRow {
  section: 'arrival' | 'one_scene' | 'same_second' | 'echo';
  sessions: number;
  total_views: number;
}
```

### 4.6 性能预期

- 索引：`idx_events_event_ts` + `idx_events_props_gin`
- 预期执行时间：< 500 ms

---

## 5. Query 3 · Unknown 完成率（V1 问题 #3）

### 5.1 用途

回答"Unknown 是否能激发观察、Reveal 与后续城市访问"：
- Unknown 完成率（started → revealed）
- Reveal → City 转化率

### 5.2 输入参数

| 参数 | 必填 | 默认 |
|---|:---:|:---:|
| `p_date_from` | ✓ | — |
| `p_date_to` | ✓ | — |
| `p_env` | ❌ | `production` |

### 5.3 SQL

```sql
WITH started AS (
  SELECT
    (props->>'unknown_id') AS unknown_id,
    COUNT(DISTINCT session_id_hash) AS started_sessions
  FROM analytics_events_v1
  WHERE event = 'unknown_started'
    AND ts >= p_date_from::timestamptz
    AND ts <  p_date_to::timestamptz
    AND env = COALESCE(p_env, 'production')
  GROUP BY unknown_id
),
revealed AS (
  SELECT
    (props->>'unknown_id') AS unknown_id,
    COUNT(DISTINCT session_id_hash) AS revealed_sessions
  FROM analytics_events_v1
  WHERE event = 'unknown_revealed'
    AND ts >= p_date_from::timestamptz
    AND ts <  p_date_to::timestamptz
    AND env = COALESCE(p_env, 'production')
  GROUP BY unknown_id
),
city_from_reveal AS (
  SELECT
    COUNT(DISTINCT session_id_hash) AS city_opened_sessions
  FROM analytics_events_v1
  WHERE event = 'city_opened'
    AND (props->>'entry_point') = 'unknown_reveal'
    AND ts >= p_date_from::timestamptz
    AND ts <  p_date_to::timestamptz
    AND env = COALESCE(p_env, 'production')
)
SELECT
  COUNT(s.unknown_id) AS total_unknowns,
  SUM(s.started_sessions) AS total_started,
  SUM(COALESCE(r.revealed_sessions, 0)) AS total_revealed,
  ROUND(100.0 * SUM(COALESCE(r.revealed_sessions, 0)) / NULLIF(SUM(s.started_sessions), 0), 2) AS unknown_completion_pct,
  (SELECT city_opened_sessions FROM city_from_reveal) AS city_opened_from_reveal,
  ROUND(100.0 * (SELECT city_opened_sessions FROM city_from_reveal) / NULLIF(SUM(COALESCE(r.revealed_sessions, 0)), 0), 2) AS reveal_to_city_pct
FROM started s
LEFT JOIN revealed r USING (unknown_id);
```

### 5.4 输出 schema

```typescript
interface UnknownCompletionRow {
  total_unknowns: number;
  total_started: number;
  total_revealed: number;
  unknown_completion_pct: number;     // 0..100
  city_opened_from_reveal: number;
  reveal_to_city_pct: number;         // 0..100
}
```

### 5.5 性能预期

- 索引：`idx_events_event_ts` + `idx_events_props_gin`（GIN 用于 `props->>'unknown_id'`）
- 预期执行时间：< 800 ms（窗口期 30 天）

---

## 6. Query 4 · Witness 全漏斗（V1 问题 #4）

### 6.1 用途

回答"Witness 是否能完成一次真实、可信、隐私安全的 Moment 提交"：
- Witness 全漏斗（started → permission → upload → submitted）
- `error_category` 分类（fail 原因）
- `retryable` 占比

### 6.2 输入参数

| 参数 | 必填 | 默认 |
|---|:---:|:---:|
| `p_date_from` | ✓ | — |
| `p_date_to` | ✓ | — |
| `p_entry_point` | ❌ | 全部 |
| `p_env` | ❌ | `production` |

### 6.3 SQL — Funnel 总览

```sql
WITH funnel AS (
  SELECT
    (SELECT COUNT(DISTINCT session_id_hash)
     FROM analytics_events_v1
     WHERE event = 'witness_started'
       AND (props->>'entry_point') = COALESCE(p_entry_point, props->>'entry_point')
       AND ts >= p_date_from::timestamptz
       AND ts <  p_date_to::timestamptz
       AND env = COALESCE(p_env, 'production')
    ) AS started_sessions,
    (SELECT COUNT(*)
     FROM analytics_events_v1
     WHERE event = 'witness_permission_result'
       AND ts >= p_date_from::timestamptz
       AND ts <  p_date_to::timestamptz
       AND env = COALESCE(p_env, 'production')
    ) AS permission_results,
    (SELECT COUNT(*)
     FROM analytics_events_v1
     WHERE event = 'witness_upload_started'
       AND ts >= p_date_from::timestamptz
       AND ts <  p_date_to::timestamptz
       AND env = COALESCE(p_env, 'production')
    ) AS upload_started,
    (SELECT COUNT(*)
     FROM analytics_events_v1
     WHERE event = 'witness_submitted'
       AND ts >= p_date_from::timestamptz
       AND ts <  p_date_to::timestamptz
       AND env = COALESCE(p_env, 'production')
    ) AS submitted,
    (SELECT COUNT(*)
     FROM analytics_events_v1
     WHERE event = 'witness_submit_failed'
       AND ts >= p_date_from::timestamptz
       AND ts <  p_date_to::timestamptz
       AND env = COALESCE(p_env, 'production')
    ) AS failed
)
SELECT
  started_sessions,
  permission_results,
  upload_started,
  submitted,
  failed,
  ROUND(100.0 * upload_started / NULLIF(permission_results, 0), 2) AS permission_to_upload_pct,
  ROUND(100.0 * submitted / NULLIF(upload_started, 0), 2) AS upload_to_submitted_pct,
  ROUND(100.0 * failed / NULLIF(upload_started, 0), 2) AS upload_failed_pct
FROM funnel;
```

### 6.4 SQL — Error Category 分布

```sql
SELECT
  props->>'error_category' AS error_category,
  COUNT(*) AS fail_count,
  SUM(CASE WHEN (props->>'retryable')::boolean THEN 1 ELSE 0 END) AS retryable_count,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) AS pct
FROM analytics_events_v1
WHERE event = 'witness_submit_failed'
  AND ts >= p_date_from::timestamptz
  AND ts <  p_date_to::timestamptz
  AND env = COALESCE(p_env, 'production')
GROUP BY error_category
ORDER BY fail_count DESC;
```

### 6.5 SQL — Permission Denied 分析

```sql
SELECT
  props->>'permission_type' AS permission_type,
  props->>'result' AS result,
  COUNT(*) AS count
FROM analytics_events_v1
WHERE event = 'witness_permission_result'
  AND ts >= p_date_from::timestamptz
  AND ts <  p_date_to::timestamptz
  AND env = COALESCE(p_env, 'production')
GROUP BY permission_type, result
ORDER BY count DESC;
```

### 6.6 输出 schema

```typescript
interface WitnessFunnelRow {
  started_sessions: number;
  permission_results: number;
  upload_started: number;
  submitted: number;
  failed: number;
  permission_to_upload_pct: number;  // 0..100
  upload_to_submitted_pct: number;   // 0..100
  upload_failed_pct: number;         // 0..100
}

interface ErrorCategoryRow {
  error_category: 'validation' | 'upload_network' | 'upload_timeout' | 'server_5xx'
                | 'permission_blocked' | 'captured_at_invalid' | 'exif_untrusted'
                | 'rate_limited' | 'duplicate_submission';
  fail_count: number;
  retryable_count: number;
  pct: number;
}

interface PermissionBreakdownRow {
  permission_type: 'camera' | 'photo_library' | 'location';
  result: 'granted' | 'denied' | 'restricted' | 'not_determined';
  count: number;
}
```

### 6.7 性能预期

- 索引：`idx_events_event_ts` + `idx_events_props_gin`
- 预期执行时间：< 800 ms

---

## 7. Query 5 · 供应稳定性（V1 问题 #5）

### 7.1 用途

回答"Daily 12 是否能持续、稳定、合法地供应"：
- `edition_viewed` 连续天数（不间断供应）
- `witness_submitted` 来源占比
- `moment_impression.source_type` 分布
- `location_mode` 分布

### 7.2 输入参数

| 参数 | 必填 | 默认 |
|---|:---:|:---:|
| `p_date_from` | ✓ | — |
| `p_date_to` | ✓ | — |
| `p_env` | ❌ | `production` |

### 7.3 SQL — Edition 连续可见天数

```sql
WITH daily_editions AS (
  SELECT DISTINCT date_trunc('day', ts) AS day
  FROM analytics_events_v1
  WHERE event = 'edition_viewed'
    AND ts >= p_date_from::timestamptz
    AND ts <  p_date_to::timestamptz
    AND env = COALESCE(p_env, 'production')
),
gaps AS (
  SELECT
    day,
    LAG(day) OVER (ORDER BY day) AS prev_day,
    (day - LAG(day) OVER (ORDER BY day)) AS gap_days
  FROM daily_editions
),
streaks AS (
  SELECT
    COUNT(*) FILTER (WHERE gap_days IS NULL OR gap_days > INTERVAL '1 day') AS break_count,
    COUNT(*) AS total_days
  FROM gaps
)
SELECT
  total_days AS days_with_editions,
  break_count AS gap_count,
  total_days - break_count AS effective_days,
  ROUND(100.0 * (total_days - break_count) / NULLIF(EXTRACT(DAY FROM (p_date_to::timestamptz - p_date_from::timestamptz)), 0), 2) AS edition_availability_pct
FROM streaks;
```

### 7.4 SQL — 来源占比（moment_impression.source_type）

```sql
SELECT
  props->>'source_type' AS source_type,
  COUNT(*) AS impression_count,
  COUNT(DISTINCT session_id_hash) AS session_count,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) AS pct
FROM analytics_events_v1
WHERE event = 'moment_impression'
  AND ts >= p_date_from::timestamptz
  AND ts <  p_date_to::timestamptz
  AND env = COALESCE(p_env, 'production')
GROUP BY source_type
ORDER BY impression_count DESC;
```

### 7.5 SQL — Witness 来源占比

```sql
SELECT
  props->>'location_mode' AS location_mode,
  COUNT(*) AS witness_submission_count,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) AS pct
FROM analytics_events_v1
WHERE event = 'witness_submitted'
  AND ts >= p_date_from::timestamptz
  AND ts <  p_date_to::timestamptz
  AND env = COALESCE(p_env, 'production')
GROUP BY location_mode
ORDER BY witness_submission_count DESC;
```

### 7.6 输出 schema

```typescript
interface EditionAvailabilityRow {
  days_with_editions: number;
  gap_count: number;
  effective_days: number;
  edition_availability_pct: number;  // 0..100
}

interface SourceTypeDistributionRow {
  source_type: 'witness' | 'seed' | 'editorial';
  impression_count: number;
  session_count: number;
  pct: number;
}

interface WitnessLocationModeRow {
  location_mode: 'auto_gps_city' | 'manual_city' | 'denied_fallback_manual';
  witness_submission_count: number;
  pct: number;
}
```

### 7.7 性能预期

- Edition availability: 索引 `idx_events_event_ts`，预期 < 500 ms
- Source distribution: 索引 `idx_events_props_gin`，预期 < 800 ms

---

## 8. 通用查询模式

### 8.1 按 `app_surface` 切分

每个 query 都可附加 `AND app_surface = 'web_homepage'` 切分平台。

### 8.2 按 `entry_point` 切分

```sql
AND (props->>'entry_point') = 'unknown_reveal'
```

### 8.3 按 `city_id` 切分

```sql
AND (props->>'city_id') = 'kyoto'
```

### 8.4 按 `edition_id` 切分

```sql
AND (props->>'edition_id') = 'ed_2026_08_22'
```

### 8.5 Alpha vs Production 切分

```sql
AND env = 'production'  -- 排除 alpha 流量
```

> **默认行为**：所有 query 默认 `env = 'production'`；分析 Alpha 数据时显式 `env = 'alpha'`。

---

## 9. Phase 1 临时查询（mock JSONL 模式）

在 Phase 1 mock 模式下（数据在 `analytics.phase1.jsonl`），可用 `jq` 替代 SQL：

### 9.1 浏览深度分布

```bash
cat analytics.phase1.jsonl | \
  jq -c 'select(.event == "moment_impression") | {sid: .session_id_hash, pos: .props.position}' | \
  jq -s 'group_by(.sid) | map({deepest: (map(.pos) | max)}) | group_by(.deepest) | map({position: .[0].deepest, sessions: length})'
```

### 9.2 Witness 全漏斗

```bash
cat analytics.phase1.jsonl | \
  jq -c 'select(.event | startswith("witness_")) | {event: .event, sid: .session_id_hash}' | \
  jq -s 'group_by(.sid) | map({sid: .[0].sid, events: [.[].event]})'
```

### 9.3 错误分类

```bash
cat analytics.phase1.jsonl | \
  jq -c 'select(.event == "witness_submit_failed") | .props.error_category' | \
  sort | uniq -c | sort -rn
```

---

## 10. 与 E-P0-10 监控基线对齐

| Query | E-P0-10 监控项 |
|---|---|
| Query 1 · 浏览深度 | `daily.browsing_depth_median`（中位数应 ≥ 4） |
| Query 2 · Moment → City | `funnel.moment_to_city_pct`（目标 ≥ 30%） |
| Query 3 · Unknown 完成率 | `funnel.unknown_completion_pct`（目标 ≥ 50%） |
| Query 4 · Witness 全漏斗 | `funnel.upload_to_submitted_pct`（目标 ≥ 80%） |
| Query 5 · 供应稳定性 | `supply.edition_availability_pct`（目标 ≥ 95%） |

> 阈值待 E-P0-10 锁定；Phase 1 暂不设告警阈值。

---

## 11. 自验收 Acceptance Criteria

- [x] 5 个 query 模板覆盖 V1 必答问题 #1 ~ #5
- [x] 每个 query 含：用途 / 输入参数 / SQL / 输出 schema / 性能预期
- [x] 与 `analytics_events_v1` 存储 schema 对齐
- [x] 与 `event-map §7` 映射表对齐
- [x] 通用查询模式（按 app_surface / entry_point / city_id / edition_id 切分）明确
- [x] Phase 1 mock JSONL 模式可用 jq 查询
- [x] 与 E-P0-10 监控维度对齐

---

**End of funnel-queries-v1.md**