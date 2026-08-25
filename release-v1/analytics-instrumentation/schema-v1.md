---
title: SEE EARTH V1 · Analytics Zod Schema · schema 派生与 E-P0-09 对齐
type: analytics-schema
tags: [release-v1, e-p0-07, analytics, schema, zod, alignment, see-earth]
task_id: E-P0-07
track: engineering
created: 2026-08-22
status: DRAFT · IN REVIEW
target_gate: Gate A · Internal Alpha
source_inputs:
  - /Users/lwy/Documents/ChatGPT/看见地球/07-设计师设计参考/release-v1/analytics-events/event-map-v1.md §5
  - /Users/lwy/Documents/ChatGPT/看见地球/release-v1/api-contract/zod-schemas/*.ts
  - /Users/lwy/Documents/ChatGPT/看见地球/release-v1/api-contract/openapi.yaml
related_docs:
  - ./sdk-integration-v1.md
  - ./server-receiver-v1.md
workspace_canonical_path: /Users/lwy/Documents/ChatGPT/看见地球/release-v1/analytics-instrumentation/schema-v1.md
note: 本文件已就绪，需 PM Agent 由 workspace 复制到 Obsidian canonical 路径。
---

# SEE EARTH V1 · Analytics Zod Schema · schema 派生与 E-P0-09 对齐

> **作者**：Engineer Agent（E-P0-07）
> **目标读者**：E-P0-09 Contract Owner / E-P0-10 Monitoring Owner / PM / QA
> **目的**：阐明 Analytics 14 事件 schema 如何从 `event-map-v1.md §5` 字段名一致性矩阵派生，并与 `release-v1/api-contract/zod-schemas/` 共享 enum 对齐。
> **代码**：`src/lib/analytics/schema.ts`（唯一 source of truth for client-side analytics schema）。
> **强制原则**：
> 1. **本文件定义的 schema = event-map §5 的派生**——禁止反向要求 E-P0-09 改名。
> 2. **服务端 schema 同步**——服务端 `/v1/analytics/events` 的 schema 与本文件保持一致（共享 enum）。
> 3. **类型仅加不删**——任何字段新增必须更新 event-map + PM 评审。

---

## 0. 一句话结论

**Analytics 14 事件 schema 直接由 `event-map §5 字段名一致性矩阵` 派生；与 E-P0-09 `common.ts` 中的 enum 完全共享（`AppSurface` / `WitnessMediaType` / `WitnessNetworkClass` / `WitnessLocationMode` / `WitnessErrorCategory` / `WitnessPermissionType` / `WitnessPermissionResult` / `Locale`）。新增字段须走 event-map v2 + PM 评审流程。**

---

## 1. 设计原则

### 1.1 字段名一致性矩阵（与 event-map §5 严格 1:1）

下表是设计端 source of truth。本文件的所有 schema 字段名必须按此对齐：

| event-map 字段 | 含义 | E-P0-09 占位 schema 字段 | SDK Zod 定义位置 |
|---|---|---|---|
| `edition_id` | Daily 12 edition | `Edition.id` | `EditionViewedSchema` / `MomentImpressionSchema` |
| `app_surface` | 入口形态 | `AppSurface` enum | 所有 envelope schema |
| `moment_id` | Moment | `Moment.id` | `MomentImpressionSchema` / `MomentOpenedSchema` |
| `position` | Daily 12 槽位 | `EditionSlot.position` | `MomentImpressionSchema` |
| `city_id` | 城市 | `City.id` | 所有 city 相关 schema |
| `source_type` | 来源 | `DomainSourceType` enum | `MomentImpressionSchema` |
| `entry_point` | 导航入口 | `Navigation.entry_point` enum | `MomentOpenedSchema` / `CityOpenedSchema` / `WitnessStartedSchema` |
| `layer` | City 章节 | `City.active_layer` enum | `CityOpenedSchema` |
| `section` | City 章节 | `City.sections[]` enum | `CitySectionViewedSchema` |
| `unknown_id` | Unknown | `Unknown.id` | `UnknownStartedSchema` / `UnknownRevealedSchema` |
| `permission_type` | 权限类型 | `Witness.permission.type` enum | `WitnessPermissionResultSchema` |
| `result` (permission / echo) | 结果 | `Witness.permission.result` / `Echo.result` enum | `WitnessPermissionResultSchema` / `EchoSubmittedSchema` |
| `media_type` | 媒体类型 | `Witness.upload.media_type` enum | `WitnessUploadStartedSchema` |
| `network_class` | 网络分级 | `Network.class` enum | `WitnessUploadStartedSchema` |
| `submission_id` | Witness Submission | `WitnessSubmission.id` (hashed) | `WitnessSubmittedSchema` / `WitnessSubmitFailedSchema` |
| `location_mode` | 位置来源 | `WitnessSubmission.location_mode` enum | `WitnessSubmittedSchema` |
| `error_category` | 错误分类 | `Witness.error.category` enum | `WitnessSubmitFailedSchema` |
| `retryable` | 是否可重试 | `Witness.error.retryable` bool | `WitnessSubmitFailedSchema` |

### 1.2 与 E-P0-09 共享 enum

下表是 SDK 直接复用 E-P0-09 enum 的清单：

| Analytics enum | E-P0-09 enum | E-P0-09 source |
|---|---|---|
| `AppSurfaceSchema` | `AppSurfaceSchema` | `zod-schemas/common.ts:31-47` |
| `SourceTypeSchema` | `DomainSourceType` enum | `zod-schemas/moment.ts` (in OpenAPI) |
| `MediaTypeSchema` | `WitnessMediaTypeSchema` | `zod-schemas/common.ts:193` |
| `NetworkClassSchema` | `WitnessNetworkClassSchema` | `zod-schemas/common.ts:194` |
| `LocationModeSchema` | `WitnessLocationModeSchema` | `zod-schemas/common.ts:195-199` |
| `ErrorCategorySchema` | `WitnessErrorCategorySchema` | `zod-schemas/common.ts:200-211` |
| `PermissionTypeSchema` | `WitnessPermissionTypeSchema` | `zod-schemas/common.ts:191` |
| `PermissionResultSchema` | `WitnessPermissionResultSchema` | `zod-schemas/common.ts:192` |

> **代码复用**：Phase 2 时 `schema.ts` 应改为 `import { ... } from '@/api-contract/zod-schemas/common'`。当前 Phase 1 为减少模块耦合，复制了 enum 定义；待 E-P0-09 contract 锁 + Vite build 配置好后切换。

### 1.3 SDK 独有 enum（event-map 中未在 E-P0-09 出现）

| Analytics enum | 原因 | 来源 |
|---|---|---|
| `CityLayerSchema` | `layer` 字段 = City 章节枚举（`arrival` / `one_scene` / `same_second` / `echo`），与 E-P0-09 `Layer` enum（`blue` / `yellow` / `red`）语义不同 | event-map §1.4 |
| `CitySectionSchema` | `section` 字段同上 | event-map §1.5 |
| `WitnessEntryPointSchema` | `entry_point` 在 Witness 上下文的子集（5 值）；Moment / City 有不同子集 | event-map §4.1 |
| `MomentEntryPointSchema` | `entry_point` 在 Moment 上下文（6 值） | event-map §1.3 |
| `CityEntryPointSchema` | `entry_point` 在 City 上下文（6 值） | event-map §1.4 |
| `EchoResultSchema` | Echo 提交结果（3 值，与 Witness permission result 不同） | event-map §3.2 |

> **理由**：`entry_point` 在三个组件上下文枚举值不同；不能用一个统一 enum 覆盖。

---

## 2. 14 事件 Zod Schema 详细定义

### 2.1 Observe 主路径

```typescript
// §1.1 edition_viewed
EditionViewedSchema = z.object({
  edition_id: Id,                    // string, 1..64 chars
  app_surface: AppSurfaceSchema,      // enum, 13 values
}).strict();
```

```typescript
// §1.2 moment_impression
MomentImpressionSchema = z.object({
  moment_id: Id,
  position: z.number().int().min(1).max(12),
  city_id: Id,
  source_type: SourceTypeSchema,       // 'witness' | 'seed' | 'editorial'
  edition_id: Id.optional(),           // SDK 自动 attach via context
}).strict();
```

```typescript
// §1.3 moment_opened
MomentOpenedSchema = z.object({
  moment_id: Id,
  city_id: Id,
  entry_point: MomentEntryPointSchema,  // 6 values
}).strict();
```

```typescript
// §1.4 city_opened
CityOpenedSchema = z.object({
  city_id: Id,
  entry_point: CityEntryPointSchema,    // 6 values
  layer: CityLayerSchema.optional(),    // 4 values
}).strict();
```

```typescript
// §1.5 city_section_viewed
CitySectionViewedSchema = z.object({
  city_id: Id,
  section: CitySectionSchema,           // 4 values
}).strict();
```

### 2.2 Unknown 路径

```typescript
// §2.1 unknown_started
UnknownStartedSchema = z.object({
  unknown_id: Id,
}).strict();
```

```typescript
// §2.2 unknown_revealed
UnknownRevealedSchema = z.object({
  unknown_id: Id,
  city_id: Id.optional(),               // 当揭晓结果含城市时
}).strict();
```

### 2.3 Echo 路径

```typescript
// §3.1 echo_started
EchoStartedSchema = z.object({
  city_id: Id,
}).strict();
```

```typescript
// §3.2 echo_submitted
EchoSubmittedSchema = z.object({
  city_id: Id,
  result: EchoResultSchema,             // 'accepted' | 'queued_for_review' | 'rate_limited'
}).strict();
```

### 2.4 Witness 路径

```typescript
// §4.1 witness_started
WitnessStartedSchema = z.object({
  entry_point: WitnessEntryPointSchema,  // 5 values
}).strict();
```

```typescript
// §4.2 witness_permission_result
WitnessPermissionResultSchema = z.object({
  permission_type: PermissionTypeSchema,    // 'camera' | 'photo_library' | 'location'
  result: PermissionResultSchema,           // 'granted' | 'denied' | 'restricted' | 'not_determined'
}).strict();
```

```typescript
// §4.3 witness_upload_started
WitnessUploadStartedSchema = z.object({
  media_type: MediaTypeSchema,           // 'photo_camera' | 'photo_library' | 'live_photo'
  network_class: NetworkClassSchema,     // 'wifi' | 'cellular_4g_5g' | 'cellular_3g' | 'slow_2g' | 'offline'
}).strict();
```

```typescript
// §4.4 witness_submitted
WitnessSubmittedSchema = z.object({
  submission_id: z.string().regex(/^[a-f0-9]{8}$/u),   // 8-char HMAC-SHA256 hex
  location_mode: LocationModeSchema,                    // 'auto_gps_city' | 'manual_city' | 'denied_fallback_manual'
}).strict();
```

```typescript
// §4.5 witness_submit_failed
WitnessSubmitFailedSchema = z.object({
  error_category: ErrorCategorySchema,                  // 9 values (per event-map §4.5)
  retryable: z.boolean(),
  submission_id: z.string().regex(/^[a-f0-9]{8}$/u).optional(),
}).strict();
```

---

## 3. EventName enum

```typescript
AnalyticsEventNameSchema = z.enum([
  'edition_viewed',
  'moment_impression',
  'moment_opened',
  'city_opened',
  'city_section_viewed',
  'unknown_started',
  'unknown_revealed',
  'echo_started',
  'echo_submitted',
  'witness_started',
  'witness_permission_result',
  'witness_upload_started',
  'witness_submitted',
  'witness_submit_failed',
]);
```

> **不可变**：14 个事件锁定，禁止动态拼接。新增事件必须更新 event-map v2 + PM 评审。

---

## 4. Top-level envelope

```typescript
AnalyticsEventEnvelopeSchema = z.object({
  event: AnalyticsEventNameSchema,
  ts: z.string().datetime({ offset: true }),  // ISO 8601 with offset
  sdk_version: z.string().regex(/^\d+\.\d+\.\d+$/u).default('1.0.0'),
  app_surface: AppSurfaceSchema,
  session_id: z.string().uuid().optional(),  // 客户端 UUID; 服务端 hash 后存
  props: z.record(z.string(), z.unknown()),  // 由 per-event schema 校验
}).strict();
```

> **envelope 与 props 分离**：envelope 字段由 SDK 自动填充；props 字段由调用方传入 + per-event schema 校验。

---

## 5. 与 E-P0-09 OpenAPI 对齐

### 5.1 E-P0-09 已有 schema（共享）

| E-P0-09 schema | 位置 | SDK 复用 |
|---|---|:---:|
| `AppSurface` enum | `openapi.yaml#/components/schemas/AppSurface` | ✅ |
| `WitnessMediaType` | `openapi.yaml#/components/schemas/WitnessMediaType` | ✅ |
| `WitnessNetworkClass` | `openapi.yaml#/components/schemas/WitnessNetworkClass` | ✅ |
| `WitnessLocationMode` | `openapi.yaml#/components/schemas/WitnessLocationMode` | ✅ |
| `WitnessErrorCategory` | `openapi.yaml#/components/schemas/WitnessErrorCategory` | ✅ |
| `WitnessPermissionType` | `openapi.yaml#/components/schemas/WitnessPermissionType` | ✅ |
| `WitnessPermissionResult` | `openapi.yaml#/components/schemas/WitnessPermissionResult` | ✅ |
| `Locale` | `openapi.yaml#/components/schemas/Locale` | ✅ |
| `UtcTimestamp` | `openapi.yaml#/components/schemas/UtcTimestamp` | ✅ |

### 5.2 E-P0-09 暂无但 SDK 需要的 schema（待 Phase 2 补齐）

| SDK schema | 需 E-P0-09 添加 | 阻塞 |
|---|---|---|
| `AnalyticsEventName` enum | `openapi.yaml#/components/schemas/AnalyticsEventName` | E-P0-07 Phase 2 |
| `AnalyticsEventEnvelope` | `openapi.yaml#/components/schemas/AnalyticsEventEnvelope` | E-P0-07 Phase 2 |
| `AnalyticsBatchRequest` | `openapi.yaml#/components/schemas/AnalyticsBatchRequest` | E-P0-07 Phase 2 |
| `AnalyticsBatchResponse` | `openapi.yaml#/components/schemas/AnalyticsBatchResponse` | E-P0-07 Phase 2 |
| `DomainSourceType` enum | `openapi.yaml#/components/schemas/DomainSourceType` | ❌ 未在 E-P0-09 定义（Phase 1 OpenAPI §906 行 inline 定义） |
| `CityEntryPoint` enum | `openapi.yaml#/components/schemas/CityEntryPoint` | E-P0-07 Phase 2 |
| `MomentEntryPoint` enum | `openapi.yaml#/components/schemas/MomentEntryPoint` | E-P0-07 Phase 2 |
| `WitnessEntryPoint` enum | `openapi.yaml#/components/schemas/WitnessEntryPoint` | E-P0-07 Phase 2 |
| `EchoResult` enum | `openapi.yaml#/components/schemas/EchoResult` | E-P0-07 Phase 2 |
| `CityLayer` enum (per moment) | `openapi.yaml#/components/schemas/CityActiveLayer` | E-P0-07 Phase 2 |

> **Phase 2 同步任务**：E-P0-07 需在 E-P0-09 Phase 2 PR 中追加上述 schema。

### 5.3 Phase 1 不阻塞

E-P0-09 v1.0.0 已 LOCKED，不强制要求立即添加 Analytics schema。Phase 1 = 本地 JSONL mock；Phase 2 = 服务端接收端落地时同步 E-P0-09。

---

## 6. 与 E-P0-09 Zod schemas 对齐

### 6.1 共享位置

`release-v1/api-contract/zod-schemas/common.ts` 已定义：
- `AppSurfaceSchema` (line 31-47)
- `WitnessMediaTypeSchema` (line 193)
- `WitnessNetworkClassSchema` (line 194)
- `WitnessLocationModeSchema` (line 195-199)
- `WitnessErrorCategorySchema` (line 200-211)
- `WitnessPermissionTypeSchema` (line 191)
- `WitnessPermissionResultSchema` (line 192)
- `CapturedAtSourceSchema` (line 66-68)
- `CapturedAtConfidenceSchema` (line 70-71)
- `IanaTimezoneSchema` (line 61-64)
- `LocaleSchema` (line 30)
- `ErrorEnvelopeSchema` (line 111-120)
- `RightsStatusSchema` (line 140-142)

### 6.2 复制定义 vs import 引用

**当前 SDK 实现**：复制 enum 定义（避免引入 `@/api-contract/zod-schemas` 的间接依赖）

**Phase 2 推荐**：
```typescript
// src/lib/analytics/schema.ts (Phase 2)
import { z } from 'zod';
import {
  AppSurfaceSchema,
  WitnessMediaTypeSchema,
  WitnessNetworkClassSchema,
  WitnessLocationModeSchema,
  WitnessErrorCategorySchema,
  WitnessPermissionTypeSchema,
  WitnessPermissionResultSchema,
  LocaleSchema,
} from '../../../release-v1/api-contract/zod-schemas/common';

export const MediaTypeSchema = WitnessMediaTypeSchema;
export const NetworkClassSchema = WitnessNetworkClassSchema;
// ...
```

> 切换到 import 后需在 tsconfig.json 增加 `release-v1/api-contract/zod-schemas` 到 `include`。

### 6.3 双向一致性检查

E-P0-07 + E-P0-09 双向检查清单：

| 项 | E-P0-07 (本文件) | E-P0-09 common.ts | 状态 |
|---|---|---|:---:|
| `AppSurface` 13 值 | ✅ | ✅ | ✅ 一致 |
| `WitnessMediaType` 3 值 | ✅ | ✅ | ✅ 一致 |
| `WitnessNetworkClass` 5 值 | ✅ | ✅ | ✅ 一致 |
| `WitnessLocationMode` 3 值 | ✅ | ✅ | ✅ 一致 |
| `WitnessErrorCategory` 10 值 | ✅ (9 values + 'unknown' in E-P0-09) | ✅ | ⚠️ SDK 取 9（per event-map §4.5）；E-P0-09 含 `unknown` 共 10 |
| `WitnessPermissionType` 3 值 | ✅ | ✅ | ✅ 一致 |
| `WitnessPermissionResult` 4 值 | ✅ | ✅ | ✅ 一致 |
| `Locale` 2 值 | (未在 SDK 使用) | ✅ | n/a |

> **`error_category` 不一致**：E-P0-09 含 `unknown`（10 值），event-map §4.5 仅 9 值。SDK 与 event-map 对齐（9 值）。服务端处理 `unknown` 时映射为 `validation`（per `error-code-dict-v1.md §10`）。

---

## 7. 字段类型映射总表

| event-map 字段 | 类型 | 范围 | 备注 |
|---|---|---|---|
| `edition_id` | string | 1..64 | opaque ID |
| `moment_id` | string | 1..64 | opaque ID |
| `city_id` | string | 1..64 | opaque ID |
| `unknown_id` | string | 1..64 | opaque ID |
| `submission_id` | hex string | 8 chars | HMAC-SHA256 截断 |
| `position` | int | 1..12 | Daily 12 槽位 |
| `app_surface` | enum | 13 values | 见 §1.2 |
| `source_type` | enum | 3 values | `witness` / `seed` / `editorial` |
| `entry_point` (moment) | enum | 6 values | `daily12` / `city_detail` / `unknown_reveal` / `echo` / `share_link` / `deeplink` |
| `entry_point` (city) | enum | 6 values | `moment_detail` / `unknown_reveal` / `same_second` / `echo` / `daily12_card` / `deeplink` |
| `entry_point` (witness) | enum | 5 values | `daily12_fab` / `city_detail` / `homepage_fab` / `share_link` / `deeplink` |
| `layer` | enum | 4 values | `arrival` / `one_scene` / `same_second` / `echo` |
| `section` | enum | 4 values | 同 `layer` |
| `permission_type` | enum | 3 values | `camera` / `photo_library` / `location` |
| `result` (permission) | enum | 4 values | `granted` / `denied` / `restricted` / `not_determined` |
| `result` (echo) | enum | 3 values | `accepted` / `queued_for_review` / `rate_limited` |
| `media_type` | enum | 3 values | `photo_camera` / `photo_library` / `live_photo` |
| `network_class` | enum | 5 values | `wifi` / `cellular_4g_5g` / `cellular_3g` / `slow_2g` / `offline` |
| `location_mode` | enum | 3 values | `auto_gps_city` / `manual_city` / `denied_fallback_manual` |
| `error_category` | enum | 9 values | `validation` / `upload_network` / `upload_timeout` / `server_5xx` / `permission_blocked` / `captured_at_invalid` / `exif_untrusted` / `rate_limited` / `duplicate_submission` |
| `retryable` | bool | — | true / false |
| `ts` (envelope) | ISO 8601 | datetime with offset | UTC base |

---

## 8. Phase 1 vs Phase 2 差异

### 8.1 Phase 1（当前）

- 14 事件 schema 锁定
- SDK 已实现 + 测试通过
- 服务端 = JSONL mock（Phase 1 backend 不实现服务端 schema；接收端 in `server-receiver-v1.md §9` 描述）
- E-P0-09 OpenAPI 不含 Analytics schema（Phase 2 补齐）

### 8.2 Phase 2（待 E-P0-02 完成后）

- 服务端接收端落地（Vercel Edge Function / Cloudflare Worker）
- E-P0-09 Phase 2 PR 追加 Analytics schema（§5.2 表）
- SDK import 切换到 `@/api-contract/zod-schemas/common`（减少重复定义）
- `env` 字段加入 envelope（用于 alpha / beta / production 隔离）

---

## 9. 自验收 Acceptance Criteria

- [x] 14 事件 schema 与 event-map §5 字段名一致
- [x] `app_surface` / `witness_*` enum 与 E-P0-09 common.ts 共享
- [x] `submission_id` 仅 8 位 hex（forbidden-fields §5）
- [x] `error_category` 与 event-map §4.5 一致（9 值，不含 `unknown`）
- [x] `entry_point` 三个上下文分别有独立 enum
- [x] envelope schema 锁定（event / ts / sdk_version / app_surface / session_id / props）
- [x] Phase 1 mock 不阻塞；Phase 2 待 E-P0-09 添加 schema 后切换

---

**End of schema-v1.md**