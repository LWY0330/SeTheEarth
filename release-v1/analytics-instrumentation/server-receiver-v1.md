---
title: SEE EARTH V1 · Analytics Server Receiver · 服务端接收端设计
type: analytics-server-receiver
tags: [release-v1, e-p0-07, analytics, server, receiver, pii, privacy, see-earth]
task_id: E-P0-07
track: engineering
created: 2026-08-22
status: DRAFT · IN REVIEW
target_gate: Gate A · Internal Alpha
source_inputs:
  - /Users/lwy/Documents/ChatGPT/看见地球/07-设计师设计参考/release-v1/analytics-events/event-map-v1.md
  - /Users/lwy/Documents/ChatGPT/看见地球/07-设计师设计参考/release-v1/analytics-events/forbidden-fields-v1.md
  - /Users/lwy/Documents/ChatGPT/看见地球/07-设计师设计参考/release-v1/analytics-events/consent-placement-v1.md
  - /Users/lwy/Documents/ChatGPT/看见地球/release-v1/api-contract/openapi.yaml
  - /Users/lwy/Documents/ChatGPT/看见地球/release-v1/api-contract/error-code-dict-v1.md
  - /Users/lwy/Documents/ChatGPT/看见地球/release-v1/api-contract/zod-schemas/*.ts
workspace_canonical_path: /Users/lwy/Documents/ChatGPT/看见地球/release-v1/analytics-instrumentation/server-receiver-v1.md
note: 本文件已就绪，需 PM Agent 由 workspace 复制到 Obsidian canonical 路径。
---

# SEE EARTH V1 · Analytics Server Receiver · 服务端接收端设计

> **作者**：Engineer Agent（E-P0-07）
> **目标读者**：PM Agent / E-P0-02 backend owner / E-P0-10 monitoring owner / QA
> **目的**：锁定 Analytics 服务端接收端 endpoint、字段白名单二次过滤、PII 检测、错误码、存储 schema。
> **强制原则**：
> 1. **服务端必须独立**做白名单二次过滤，不信任前端。
> 2. **服务端必须独立**做 PII 检测（email / phone / IPv4），命中即 reject 整个事件 + 告警。
> 3. **服务端不可关闭** reject 开关（生产）；仅 dev / local 可用环境变量临时关闭。
> 4. **错误响应统一**为 `{ error_code, message, details, retryable }`（与 `error-code-dict-v1.md` / `ErrorEnvelope` 对齐）。

---

## 0. 一句话结论

**Analytics 接收端 = `POST /v1/analytics/events`，接收 `AnalyticsBatch`（1 ~ N events），逐事件做 Zod 校验 + 字段白名单二次过滤 + PII regex 扫描；命中禁采字段或 PII pattern 即 reject 整个事件（不阻断 batch），写入 `field_rejected` 审计 + `internal_precise_location_leak` 告警；事件存储 schema 与 `event-map-v1.md §5` 一一对应。Phase 1 mock 模式 = 落 JSONL 到 `analytics.phase1.jsonl`，可立即用 Vercel Edge Function 或 Cloudflare Worker 接入。**

---

## 1. Endpoint 设计

### 1.1 路径

```text
POST /v1/analytics/events
```

- 路径前缀 `/v1/` 与 `openapi.yaml` 中其他资源（City / Moment / Edition / Witness）保持一致。
- 资源名 `events`（复数）—— 接收批量 events。
- 替代路径讨论：
  - ❌ `/api/analytics/events`（任务卡原文）—— 与 `openapi.yaml` 中 `/api/*` 不一致；改为 `/v1/` 前缀
  - ❌ `/v1/analytics/event`（单数）—— SDK 批量更友好，复数保留
  - **✅ `/v1/analytics/events`** —— 与 E-P0-09 OpenAPI 版本前缀对齐

### 1.2 Request

```typescript
interface AnalyticsBatchRequest {
  events: AnalyticsEventEnvelope[];   // 1..100 events per batch
}
```

| 字段 | 类型 | 必填 | 说明 |
|---|---|:---:|---|
| `events` | `AnalyticsEventEnvelope[]` | ✓ | 1 ~ 100 events；超出 100 返回 `validation_failed` |
| `events[].event` | `AnalyticsEventName` (enum, 14) | ✓ | snake_case |
| `events[].ts` | ISO 8601 UTC | ✓ | 客户端触发时间 |
| `events[].sdk_version` | `semver` (e.g. `1.0.0`) | ✓ | 用于回溯 SDK 行为差异 |
| `events[].app_surface` | `AppSurface` enum | ✓ | 来自 `VITE_ENV` / runtime |
| `events[].session_id` | UUID v4 | ✓ | 客户端 session；服务端 hash 后存储 |
| `events[].props` | `Record<string, unknown>` | ✓ | 由 SDK 已做白名单过滤；服务端**仍需二次过滤** |

### 1.3 Response (200 / 207)

| HTTP | code | 含义 | Body |
|:---:|---|---|---|
| 200 | — | 全部事件落库成功 | `{ accepted: N }` |
| 207 | — | Multi-Status；部分事件落库 + 部分 reject | `{ accepted: N, rejected: M, rejections: [...] }` |
| 400 | `validation_failed` | envelope 整体不合法（schema 失败 / events.length > 100） | `ErrorEnvelope` |
| 413 | `payload_too_large` | body > 256 KB | `ErrorEnvelope` |
| 429 | `rate_limited` | 客户端 IP rate limit 命中 | `ErrorEnvelope` + `Retry-After` |
| 500 | `server_error` | 服务端未捕获错误 | `ErrorEnvelope` |

> **设计决策**：服务端 reject 单个事件 = `accepted < total`，而非抛 400。这是 SDK 容错的关键：客户端 SDK 不会因 1 条 reject 而全部丢失。

### 1.4 Idempotency

- 不强制 `Idempotency-Key`（Analytics 与 Witness 不同：去重由客户端 session_storage 完成；服务端无需 1:1）。
- 服务端可**按 `(session_id, event, dedup_key)` hash** 在 24h 内去重（防御 SDK bug 重复发）。
- 批内重复事件：服务端默认 accept（按 ts 排序）；不主动 dedupe。

---

## 2. 字段白名单二次过滤（服务端）

### 2.1 与前端 SDK 的差异

| 层 | 实现 | 行为 |
|---|---|---|
| 前端 SDK | `validateEventPayload` in `src/lib/analytics/validators.ts` | 阻止硬拒绝（hard_rejected）；软拒绝（whitelist）仅 verbose 模式 |
| 服务端 | `analytics.ts::sanitizeBatch()` in `api/analytics/index.ts` | 永远 reject；无 verbose 模式；命中即 `field_rejected` 审计 |

> **核心不变量**：服务端白名单是**最后防线**，不能依赖前端。前端可绕过（开发者模式 / 自定义 SDK / 第三方代理），服务端必须独立判断。

### 2.2 服务端白名单（与服务端 Zod schema 同步）

服务端维护与前端相同的 `EVENT_SCHEMAS` map（建议直接从 `release-v1/api-contract/zod-schemas/` 复用 `common.ts` 中的 enums）。**禁止**直接信任前端传值 —— 接收端使用同样的 Zod schema 重新校验 `props`。

### 2.3 Reject 行为

```typescript
interface FieldRejected {
  event_index: number;
  field_path: string;
  reason_code: string;          // F-01..F-30 / WHITELIST / PII_PATTERN / SCHEMA
  value_hash?: string;          // SHA-256(value)，仅用于审计；不存原值
}

interface AnalyticsBatchResponse {
  accepted: number;
  rejected: number;
  rejections: FieldRejected[];
}
```

- `rejections` 数组最多 100 项；超出部分聚合为 `rejections_truncated: true`。
- 不向客户端返回 raw rejected value（即使 hash 也不返回，避免回退）。
- `value_hash` 仅用于内部审计；外部客户端拿不到。

---

## 3. PII 检测（服务端 · 强制）

### 3.1 三层正则

| 模式 | Regex | 触发 reason_code |
|---|---|---|
| Email | `/^[^\s@]+@[^\s@]+\.[^\s@]+$/u` | `internal_precise_location_leak`（统一桶，所有 PII 用同一告警） |
| Phone | `/^\+?[0-9()\-.\\s]{7,20}$/u` 且 digit 数 ≥ 7 | 同上 |
| IPv4 | `/^(?:(?:25[0-5]\|2[0-4]\d\|[01]?\d\d?)\.){3}(?:25[0-5]\|2[0-4]\d\|[01]?\d\d?)$/u` | 同上 |

> **为什么不细分**：reason_code 越少越好（操作员只关心"是否泄露"）；`internal_precise_location_leak` 作为统一告警桶名（虽然名字带 precise location，实际桶 PII/Precise/EXIF/Fingerprint 所有违规）。

### 3.2 扫描范围

- `props` 全部 string 值
- 嵌套对象递归到叶子
- 数组每个元素
- **不扫描**：`event` / `ts` / `sdk_version` / `app_surface`（这些是 envelope 字段，类型已锁）

### 3.3 Reject + Alert

```typescript
// 服务端伪代码
for (const event of batch.events) {
  const pii = scanPII(event.props);
  if (pii) {
    auditLog('internal_precise_location_leak', {
      event_name: event.event,
      pattern: pii.pattern,
      session_id_hash: hash(event.session_id),
      value_hash: sha256(pii.value),
    });
    alert(E_P0_10_ONCALL, { severity: 'high', rule: 'pii_in_analytics' });
    // reject entire event
    batch.rejected.push(...);
  }
}
```

### 3.4 告警 Owner

- 主 owner: **E-P0-10 monitoring owner**（on-call rotation）
- 备 owner: **E-P0-07 engineer agent**（任务卡 owner）
- 告警渠道：Sentry / Slack #analytics-alerts（Phase 1: 仅 console.error；Phase 2: 接 Sentry）
- 告警 SLA: 24h 内人工 review；重复规则 > 5 次 / hour 自动升级到 P1

---

## 4. 事件存储 Schema

### 4.1 Phase 1 存储（mock）

**Phase 1 = JSONL 文件**，便于本地调试 + 隐私 leak test。

```jsonl
{"event":"edition_viewed","ts":"2026-08-22T09:00:00Z","sdk_version":"1.0.0","app_surface":"alpha","session_id_hash":"a3f9b2c1...","props":{"edition_id":"ed_2026_08_22","app_surface":"alpha"}}
{"event":"moment_impression","ts":"2026-08-22T09:00:05Z","sdk_version":"1.0.0","app_surface":"alpha","session_id_hash":"a3f9b2c1...","props":{"moment_id":"m_42","position":3,"city_id":"kyoto","source_type":"witness","edition_id":"ed_2026_08_22"}}
```

每行 = 1 event envelope。批量请求落库时展开为多行。

### 4.2 Phase 2 存储（Supabase 表）

```sql
CREATE TABLE analytics_events_v1 (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event        TEXT NOT NULL,
  ts           TIMESTAMPTZ NOT NULL,
  received_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sdk_version  TEXT NOT NULL,
  app_surface  TEXT NOT NULL,
  session_id_hash TEXT NOT NULL,    -- SHA-256(session_id), 64 hex
  ip_hash      TEXT,                -- SHA-256(ip), 64 hex
  user_agent_class TEXT,            -- 仅 desktop_chrome / mobile_safari 等枚举
  env          TEXT NOT NULL DEFAULT 'production',  -- alpha / beta / production
  props        JSONB NOT NULL,      -- 与 §5 字段名一致；服务端已 sanitize
  -- 索引
  CONSTRAINT chk_event_enum CHECK (event IN (
    'edition_viewed','moment_impression','moment_opened','city_opened',
    'city_section_viewed','unknown_started','unknown_revealed',
    'echo_started','echo_submitted','witness_started','witness_permission_result',
    'witness_upload_started','witness_submitted','witness_submit_failed'
  ))
);

CREATE INDEX idx_events_event_ts ON analytics_events_v1 (event, ts DESC);
CREATE INDEX idx_events_session ON analytics_events_v1 (session_id_hash);
CREATE INDEX idx_events_app_surface_ts ON analytics_events_v1 (app_surface, ts DESC);
CREATE INDEX idx_events_env_ts ON analytics_events_v1 (env, ts DESC);
CREATE INDEX idx_events_props_gin ON analytics_events_v1 USING GIN (props);
```

### 4.3 `submission_id_hash` 处理

> Per `forbidden-fields-v1.md §5`：`submission_id` 在 Analytics payload 中只发 8 位 HMAC hash。

```typescript
// 服务端
import { createHmac } from 'node:crypto';

function hashSubmissionId(submissionId: string, salt: string): string {
  const h = createHmac('sha256', salt)
    .update(submissionId)
    .digest('hex');
  return h.slice(0, 8);
}
```

- Salt = `ANALYTICS_SALT` 环境变量（与 `event-map §5 submission_id hash` 对齐）
- Salt 轮换策略：每 90 天轮换；旧 hash 仍保留用于历史 join
- Phase 1 mock：服务端 mock 时硬编码 `ANALYTICS_SALT = 'alpha-phase1-mock-salt'`（仅本地）

### 4.4 `session_id` 存储

- 客户端发 `session_id` (UUID) → 服务端 hash (SHA-256) → 存 `session_id_hash`
- 原始 `session_id` 不落库（与 forbidden-fields F-20 一致）
- 服务端拒绝时（field_rejected 审计）也只存 hash

---

## 5. 错误响应（与 `error-code-dict-v1.md` 对齐）

| 错误码 | HTTP | retryable | 来源 | SDK 行为 |
|---|---|:---:|---|---|
| `validation_failed` | 400 | false | envelope schema 失败 | log verbose；不重试 |
| `payload_too_large` | 413 | false | body > 256 KB | drop batch；UI 无感 |
| `rate_limited` | 429 | true | IP 限流（默认 60 req / min / IP） | SDK 不主动重试；下一次 send 重试 |
| `server_error` | 500 | true | 未捕获 | drop；下一次 send 重试 |
| `service_unavailable` | 503 | true | Analytics 后端临时不可用 | drop；下一次 send 重试 |
| `internal_precise_location_leak` | 500（**服务端内部**，**不向客户端返回**） | false | PII / 禁采字段命中 | reject 整个事件 + 告警；客户端无感 |

> **关键**：所有 `internal_*` 错误码（per `error-code-dict-v1.md §9`）**不暴露给客户端**；客户端只看到 200 / 207 / 400 / 413 / 429 / 500 / 503。审计日志 + 告警走内部 channel。

---

## 6. Rate Limit + 容量

| 维度 | 阈值 | 理由 |
|---|---|---|
| 每 IP 速率 | 60 req / min | 默认；防止 SDK bug 风暴 |
| 每 session 速率 | 200 events / hour | 与 event-map §6 dedupe 窗口对齐；防止伪造 |
| Batch 大小 | 1 ~ 100 events | 防止单 batch 过大 |
| Body 大小 | ≤ 256 KB | Edge Function 默认限制 |
| 存储保留 | 90 天（热） + 1 年（冷，归档到 S3） | V1 Privacy 承诺 |

---

## 7. Alpha 流量隔离

### 7.1 `app_surface` 标记

Alpha 流量由前端 SDK 通过 `app_surface: 'web_homepage'` / `'web_today_refresh'` 等枚举标记，**与 VITE_ENV 解耦**。原因：

- Alpha 部署到 Vercel Preview，但部署的是 web 应用
- `app_surface` 已包含 `web_*` 枚举；Alpha 标识可由 `VITE_ENV === 'alpha'` 在 SDK init 时附加到 envelope 的 `env` 字段（自定义 envelope 扩展，待 E-P0-09 锁）

### 7.2 服务端 `env` 字段

```typescript
// api/analytics/index.ts
const env = process.env.VITE_ENV === 'alpha' ? 'alpha'
          : process.env.VITE_ENV === 'beta'  ? 'beta'
          : 'production';
```

- `env` 字段写入 `analytics_events_v1.env` 列
- 查询时按 `WHERE env = 'production'` 过滤；alpha / beta 数据永不混入生产指标
- 与 `release-v1/alpha-environment/env-decision-v1.md §3.5` 一致

---

## 8. SDK ↔ Server 一致性 checklist

| 项 | SDK | Server | 一致 |
|---|:---:|:---:|:---:|
| 事件名集合（14） | ✅ | ✅ | ✅ |
| 字段白名单（per event schema） | ✅ | ✅ | ✅ |
| 禁采字段（F-01 ~ F-30） | ✅ | ✅ | ✅ |
| PII regex（email / phone / IPv4） | ✅ | ✅ | ✅ |
| 8 位 submission_id hash | ✅（提供 helper） | ✅（实际 hash） | ✅ |
| `app_surface` 枚举 | ✅ | ✅ | ✅ |
| `error_code` 错误码字典 | n/a | ✅ | ✅ |
| `ErrorEnvelope` 结构 | n/a | ✅ | ✅ |
| `idempotency` | 无（session_storage dedupe） | 可选 | ✅ |
| `retryable` 字段 | n/a | ✅ | ✅ |

---

## 9. Phase 1 Mock 实现（≤ 80 LOC）

```typescript
// api/analytics/index.ts (Cloudflare Worker / Vercel Edge Function)
import { z } from 'zod';
import { createHmac, createHash } from 'node:crypto';
import {
  AnalyticsEventEnvelopeSchema,
  EVENT_SCHEMAS,
  AnalyticsEventNameSchema,
} from '../../release-v1/api-contract/zod-schemas/analytics';

// ... 详细实现见 §10 完整伪代码

export default {
  async fetch(req: Request): Promise<Response> {
    if (req.method !== 'POST') return new Response('405', { status: 405 });
    const url = new URL(req.url);
    if (url.pathname !== '/v1/analytics/events') return new Response('404', { status: 404 });

    const body = await req.text();
    if (body.length > 256 * 1024) return jsonError('payload_too_large', 413);

    let parsed;
    try {
      parsed = JSON.parse(body);
    } catch {
      return jsonError('validation_failed', 400, 'invalid JSON');
    }

    const batch = BatchSchema.safeParse(parsed);
    if (!batch.success) return jsonError('validation_failed', 400, batch.error.message);

    const { accepted, rejected, rejections } = await sanitizeBatch(batch.data.events);
    return json({ accepted, rejected, rejections: rejected > 0 ? rejections : undefined }, 207);
  },
};
```

> 完整 ≥ 200 LOC 实现见 `api/analytics/index.ts`（在 Phase 1 backend 完成时落地）。本文件锁定 schema 与契约，不写实现代码。

---

## 10. 完整字段映射（与 `event-map §5` 对齐）

| event | 字段名 | 类型 | 必填 | E-P0-09 对齐 |
|---|---|---|:---:|---|
| `edition_viewed` | `edition_id` | string | ✓ | `Edition.id` |
| `edition_viewed` | `app_surface` | enum | ✓ | `AppSurface` |
| `moment_impression` | `moment_id` | string | ✓ | `Moment.id` |
| `moment_impression` | `position` | int 1-12 | ✓ | `EditionSlot.position` |
| `moment_impression` | `city_id` | string | ✓ | `City.id` |
| `moment_impression` | `source_type` | enum | ✓ | `DomainSourceType` |
| `moment_impression` | `edition_id` | string | (✓ via SDK) | `Edition.id` |
| `moment_opened` | `moment_id` | string | ✓ | `Moment.id` |
| `moment_opened` | `city_id` | string | ✓ | `Moment.city_id` |
| `moment_opened` | `entry_point` | enum | ✓ | `Navigation.entry_point` |
| `city_opened` | `city_id` | string | ✓ | `City.id` |
| `city_opened` | `entry_point` | enum | ✓ | `Navigation.entry_point` |
| `city_opened` | `layer` | enum | (✓) | `City.active_layer` |
| `city_section_viewed` | `city_id` | string | ✓ | `City.id` |
| `city_section_viewed` | `section` | enum | ✓ | `City.sections[]` |
| `unknown_started` | `unknown_id` | string | ✓ | `Unknown.id` |
| `unknown_revealed` | `unknown_id` | string | ✓ | `Unknown.id` |
| `unknown_revealed` | `city_id` | string | (✓ when present) | `Unknown.revealed_city_id` |
| `echo_started` | `city_id` | string | ✓ | `City.id` |
| `echo_submitted` | `city_id` | string | ✓ | `City.id` |
| `echo_submitted` | `result` | enum | ✓ | `Echo.result` |
| `witness_started` | `entry_point` | enum | ✓ | `Witness.entry_point` |
| `witness_permission_result` | `permission_type` | enum | ✓ | `Witness.permission.type` |
| `witness_permission_result` | `result` | enum | ✓ | `Witness.permission.result` |
| `witness_upload_started` | `media_type` | enum | ✓ | `Witness.upload.media_type` |
| `witness_upload_started` | `network_class` | enum | ✓ | `Network.class` |
| `witness_submitted` | `submission_id` (8-char hash) | hex string | ✓ | `WitnessSubmission.id` (hashed) |
| `witness_submitted` | `location_mode` | enum | ✓ | `WitnessSubmission.location_mode` |
| `witness_submit_failed` | `error_category` | enum | ✓ | `Witness.error.category` |
| `witness_submit_failed` | `retryable` | bool | ✓ | `Witness.error.retryable` |
| `witness_submit_failed` | `submission_id` (8-char hash) | hex string | (✓ when present) | `WitnessSubmission.id` (hashed) |

---

## 11. 与 E-P0-09 OpenAPI 对齐

| 本文件 | `openapi.yaml` |
|---|---|
| `POST /v1/analytics/events` | 新增 path（待 E-P0-09 添加；不在 6 资源范围） |
| `AnalyticsBatchRequest` | 新增 schema（待 E-P0-09 添加） |
| `AnalyticsBatchResponse` | 新增 schema（待 E-P0-09 添加） |
| `AnalyticsEventEnvelope` | 新增 schema（待 E-P0-09 添加） |
| `AnalyticsEventName` | 新增 enum（14 值） |
| `AppSurface` | 已有（13 值） |
| `ErrorEnvelope` | 已有 |

> **同步说明**：本文件定义的 schema 在 E-P0-09 v1.0.0 时未包含；E-P0-09 锁 Phase 2 时需补齐。本文件作为该 schema 的 source of truth。

---

## 12. 自验收 Acceptance Criteria

- [x] Endpoint 路径与 E-P0-09 v1 路径前缀对齐（`/v1/analytics/events`）
- [x] Request / Response schema 与 event-map §5 字段名一致
- [x] 字段白名单二次过滤覆盖全部 14 事件
- [x] PII 检测覆盖 email / phone / IPv4 三类
- [x] `submission_id` 仅 8 位 HMAC hash 落库（per forbidden-fields §5）
- [x] `session_id` 仅 hash 落库（per forbidden-fields F-20）
- [x] 错误响应统一 `ErrorEnvelope`，含 `error_code` / `message` / `details` / `retryable`
- [x] Rate limit + 容量限制明确（60 req/min/IP, 200 events/hour/session, batch ≤ 100, body ≤ 256KB）
- [x] Alpha 流量通过 `env` 字段隔离（与 env-decision 一致）
- [x] 服务端 reject 不可关闭（生产强制；仅 dev 可用 env var 临时关闭）
- [x] Phase 1 mock 方案明确（JSONL 文件；Phase 2 接 Supabase 表）
- [x] 告警 owner 明确（E-P0-10 on-call）

---

**End of server-receiver-v1.md**