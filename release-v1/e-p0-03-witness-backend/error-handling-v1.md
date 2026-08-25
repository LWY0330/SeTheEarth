---
title: SEE EARTH V1 · E-P0-03 · Minimal Witness Backend · Error Handling · v1
type: engineering-error-handling
tags: [release-v1, e-p0-03, witness-backend, error-handling, error-codes, request-id, see-earth]
task_id: E-P0-03
brief_anchor: "Release Strategy Brief §5 E-P0-03 §E"
track: engineering
owner: Engineer Agent #4 (external Owner = 您)
created: 2026-08-24
status: DRAFT · IN REVIEW
target_gate: Gate A · Internal Alpha
source_brief: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/SEE-EARTH-Release-Strategy-v1-Design-Engineering-Task-Brief.md
source_task_card: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/06-PM Agent 交接/2026-08-22-task-card-e-p0-03-minimal-witness-backend.md
related_docs:
  - ./architecture-v1.md
  - ./state-machine-v1.md
  - ./endpoints-v1.md
  - /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/api-contract/error-code-dict-v1.md
  - /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/api-contract/openapi.yaml
  - /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/07-设计师设计参考/release-v1/minimal-witness/state-matrix-v1.md
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/e-p0-03-witness-backend/error-handling-v1.md
workspace_canonical_path: /Users/lwy/Documents/ChatGPT/看见地球/release-v1/e-p0-03-witness-backend/error-handling-v1.md
sync_required: true · sandbox 拒绝写入 Obsidian
---

# SEE EARTH V1 · E-P0-03 · Minimal Witness Backend · Error Handling · v1

> **作者**：Engineer Agent #4（外部 Owner = 您）
> **派发时间**：2026-08-24 · Round 4
> **目标**：交付 Witness 后端**完整错误处理规范** —— 错误码字典（与 E-P0-09 一致）+ 错误响应格式 + request_id 规范 + 重试策略 + 用户文案映射
> **强制原则**（来自任务卡 §E + Brief §3）：
> 1. **不暴露内部堆栈** —— 任何错误响应都不含 stack/trace
> 2. **不暴露内部错误码** —— `internal_*` 错误仅服务端 alert
> 3. **请求可关联** —— 每个响应含 `request_id`（UUIDv4）
> 4. **错误可重试** —— `retryable` boolean 明确（与 D-P0-05 埋点 `error_category` 对齐）

---

## 0. 阅读指南

- **§1** ErrorEnvelope 通用结构（与 E-P0-09 OpenAPI 一致）
- **§2** Request ID 规范（生成 + 透传 + 日志）
- **§3** 错误码完整字典（5 端点 × 9 类）
- **§4** 重试策略（自动 vs 用户 vs 不可重试）
- **§5** 用户文案映射（与 D-P0-04 状态矩阵对齐）
- **§6** Sentry 集成（服务端 alert）
- **§7** 与 D-P0-05 埋点 error_category 对齐
- **§8** 客户端错误处理示例代码

---

## 1. ErrorEnvelope 通用结构

### 1.1 Schema（与 E-P0-09 OpenAPI ErrorEnvelope 完全一致）

```typescript
interface ErrorEnvelope {
  error_code: string;              // stable snake_case · regex ^[a-z][a-z0-9_]*$
  message: string;                 // human-readable · ≤ 512 chars · localisable
  details?: Record<string, string | number | boolean>;  // 上下文
  retryable: boolean;              // 客户端决策唯一依据
  request_id: string;              // UUIDv4 · 服务端 correlation
}
```

### 1.2 示例

```json
{
  "error_code": "rate_limited_witness",
  "message": "今日提交已达上限。",
  "details": {
    "retry_after_seconds": 1800,
    "limit": 5,
    "window": "1h"
  },
  "retryable": true,
  "request_id": "req_20260824_abc123def456"
}
```

### 1.3 强制约束（来自任务卡 §E）

| 维度 | 强制规则 |
|---|---|
| **不暴露 stack** | ❌ 任何 4xx / 5xx 响应都不含 `stack` 或 `trace` 字段 |
| **不暴露 raw IP** | ❌ `details` 不含 `ip` / `ip_hash` 等 |
| **不暴露 raw EXIF** | ❌ `details` 不含 `exif_*` 等 |
| **不暴露 free text** | ❌ `details` 不含 `description.text` 等用户输入 |
| **不暴露 internal_* 错误码** | ❌ 客户端永不收到 `internal_schema_violation` 等 |
| **request_id 必含** | ✅ 所有响应（含成功）都含 `request_id` |

---

## 2. Request ID 规范

### 2.1 格式

**Pattern**: `^req_\d{8}_[a-z0-9]{12}$`

示例：`req_20260824_abc123def456`

- `req_` 前缀（与 `submission_id` / `asset_id` 区分）
- `YYYYMMDD` 日期（便于按日 partition）
- `[a-z0-9]{12}` 12 chars random（来自 `crypto.randomBytes(6).toString('hex')`）

### 2.2 生成与透传

```typescript
// Edge Middleware: 每个请求生成 / 透传
const requestId = req.headers.get('x-request-id') 
  || `req_${formatDate(new Date(), 'YYYYMMDD')}_${randomHex(6)}`;

// 注入到 response header（便于客户端关联）
res.headers.set('x-request-id', requestId);

// 注入到所有日志
logger.info({ request_id: requestId, ...other });

// 注入到 Sentry breadcrumb
Sentry.configureScope((scope) => scope.setTag('request_id', requestId));
```

### 2.3 错误响应中的 request_id

**生成规则**：
- 服务端收到请求时生成（或从 client `x-request-id` header 透传）
- 写入响应 `request_id` 字段（JSON body）
- 写入响应 `x-request-id` header（HTTP standard）
- 写入 Sentry tag（用于服务端追踪）
- 写入 Vercel log（用于 observability）

**客户端使用**：
- 用户报告问题时附带 `request_id`（错误卡片 "错误 ID: req_..."）
- 客户端 SDK 在埋点 `witness_submit_failed` 事件中携带（受限字段）

### 2.4 客户端使用示例

```typescript
// Web: 错误响应处理
async function handleApiError(response: Response): Promise<ApiError> {
  const body = await response.json();
  const requestId = response.headers.get('x-request-id') || body.request_id;
  return {
    code: body.error_code,
    message: body.message,
    retryable: body.retryable,
    requestId,
    details: body.details,
  };
}

// 显示给用户：包含 request_id
function showErrorCard(error: ApiError, locale: 'zh' | 'en'): JSX.Element {
  return (
    <ErrorCard>
      <ErrorMessage>{error.message}</ErrorMessage>
      <ErrorId>错误 ID: {error.requestId}</ErrorId>
      {error.retryable && <RetryButton onClick={retry} />}
    </ErrorCard>
  );
}
```

---

## 3. 错误码完整字典（5 端点 × 9 类）

### 3.1 错误码总览

| 类别 | 错误码 | HTTP | retryable | 来源 |
|---|---|:---:|:---:|---|
| **Validation** | `validation_failed` | 400 | ❌ | Zod 校验失败 |
| | `captured_at_invalid` | 400 | ❌ | captured_at 在未来 |
| | `captured_at_untrusted` | 400 | ❌ | EXIF 不可信 |
| | `exif_missing_required` | 400 | ❌ | EXIF 缺失 |
| | `location_missing` | 400 | ❌ | city_id 不在 seed |
| | `content_too_long` | 400 | ❌ | description > 200 |
| | `client_key_invalid` | 400 | ❌ | client_key 格式错 |
| **Permission** | `permission_required` | 401 | ❌ | JWT 缺失 |
| | `forbidden_role` | 403 | ❌ | role ≠ moderator |
| | `witness_session_expired` | 401 | ✅ | cookie 过期 |
| **Upload** | `upload_url_expired` | 408 | ✅ | signed URL 过期 |
| | `upload_network` | 502 | ✅ | PUT 中断 |
| | `upload_timeout` | 408 | ✅ | PUT > 60s |
| | `upload_checksum_mismatch` | 409 | ✅ | checksum 失败 |
| | `upload_size_exceeded` | 413 | ❌ | size_bytes > 25MB |
| | `upload_mime_unsupported` | 415 | ❌ | mime 不支持 |
| | `asset_processing_failed` | 500 | ❌ | sharp 不可恢复 |
| | `asset_not_ready` | 409 | ✅ | asset 仍在 processing |
| **Submission** | `submission_already_published` | 409 | ❌ | PATCH withdrawn on published |
| | `submission_already_withdrawn` | 409 | ❌ | PATCH withdrawn on withdrawn |
| | `submission_invalid_transition` | 409 | ❌ | 非法状态转换 |
| | `submission_not_found` | 404 | ❌ | ID 不存在 |
| | `submission_expired` | 410 | ❌ | draft > 24h |
| **Moderation** | `moderation_pending` | 200 | ❌ | status=under_review |
| | `moderation_rejected` | 200 | ❌ | status=rejected |
| | `moderation_needs_more_info` | 200 | ❌ | （V1 不实现） |
| **Rate limit** | `rate_limited` | 429 | ✅ | 通用 |
| | `rate_limited_witness` | 429 | ✅ | witness 5/h |
| **Server** | `server_error` | 500 | ✅ | 通用 |
| | `service_unavailable` | 503 | ✅ | 服务降级 |
| | `service_timeout` | 504 | ✅ | 上游超时 |
| | `dependency_failure_storage` | 502 | ✅ | Supabase Storage 不可用 |
| **Privacy (internal)** | `internal_precise_location_leak` | 500 | ❌ | 服务端 alert · 不暴露 |
| | `internal_unauthorised_raw_location_access` | 500 | ❌ | 服务端 alert · 不暴露 |
| | `internal_schema_violation` | 500 | ❌ | 服务端 alert · 不暴露 |

### 3.2 各端点错误码覆盖矩阵

| 端点 | Validation | Permission | Upload | Submission | Moderation | Rate limit | Server |
|---|---|---|---|---|---|---|---|
| POST /submissions | ✅ × 5 | — | — | ✅ duplicate_submission | — | ✅ rate_limited_witness | ✅ server_error |
| POST /upload-url | ✅ validation_failed | — | ✅ × 3 | ✅ × 2 | — | ✅ rate_limited_witness | ✅ server_error |
| POST /commit | ✅ validation_failed | — | ✅ × 3 | ✅ × 3 | — | ✅ rate_limited_witness | ✅ server_error |
| GET /submissions/:id | — | — | — | ✅ × 2 | — | — | ✅ server_error |
| POST /moderate | ✅ validation_failed | ✅ × 2 | — | ✅ submission_invalid_transition | — | — | ✅ server_error |

> 完整错误码 → HTTP / retryable / UI 文案映射见 `error-code-dict-v1.md`（E-P0-09 已 LOCKED）。
> 本节仅列出与 E-P0-03 Witness 流程直接相关的错误码。

---

## 4. 重试策略（来自任务卡 §E）

### 4.1 客户端重试规则（与 D-P0-02 state-matrix §3.5 一致）

| 类别 | 自动重试上限 | 用户手动重试 | 退避策略 |
|---|:---:|:---:|---|
| **自动重试** | 2 次 | ✅ 1 次 | 指数退避（1s · 3s · 9s） |
| **用户手动重试** | ❌ 不自动 | ✅ 用户点按钮 | 不适用 |
| **不可重试** | ❌ | ❌ | 不适用 |

### 4.2 各错误码的 retryable 行为

| error_code | retryable | 重试策略 |
|---|:---:|---|
| `upload_network` | ✅ | 自动 2 次 + 手动 1 次（指数退避） |
| `upload_timeout` | ✅ | 自动 2 次 + 手动 1 次 |
| `upload_url_expired` | ✅ | 自动重试：重新请求 upload-url |
| `upload_checksum_mismatch` | ✅ | 自动重试：重新 PUT（同一 asset_id） |
| `asset_not_ready` | ✅ | 客户端轮询 GET（3s 间隔） |
| `submission_invalid_transition` | ❌ | 不重试（客户端 bug） |
| `server_error` | ✅ | 自动重试 2 次 |
| `service_unavailable` | ✅ | 自动重试 2 次 + 长退避（30s） |
| `service_timeout` | ✅ | 自动重试 2 次 |
| `dependency_failure_storage` | ✅ | 自动重试 2 次 + 长退避（60s） |
| `rate_limited` | ✅ | 等 Retry-After 后自动重试 |
| `rate_limited_witness` | ✅ | 等 Retry-After 后自动重试 |
| `validation_*` | ❌ | 不重试（用户必须修改输入） |
| `*_not_found` | ❌ | 不重试（资源不存在） |
| `forbidden_*` | ❌ | 不重试（权限不足） |
| `content_too_long` | ❌ | 不重试（用户必须修改输入） |
| `moderation_rejected` | ❌ | 不重试（终态） |
| `submission_expired` | ❌ | 不重试（草稿过期） |
| `asset_processing_failed` | ❌ | 不重试（服务端永久失败） |

### 4.3 客户端 retry 实现示例

```typescript
async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  options: { maxRetries?: number; retryableCodes?: string[] } = {}
): Promise<T> {
  const { maxRetries = 2, retryableCodes = [] } = options;
  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      return await fn();
    } catch (err) {
      if (err instanceof ApiError && !err.retryable) throw err;
      if (!retryableCodes.includes(err.code)) throw err;
      if (attempt === maxRetries) throw err;

      // 指数退避：1s · 3s · 9s
      const delay = Math.pow(3, attempt) * 1000;
      await new Promise(r => setTimeout(r, delay));
      attempt++;
    }
  }

  throw new Error('unreachable');
}
```

---

## 5. 用户文案映射（与 D-P0-04 状态矩阵对齐）

### 5.1 文案本地化策略

| 维度 | 规则 |
|---|---|
| **服务端默认** | 英文（fallback） |
| **客户端覆盖** | zh-CN / en 由前端 i18n 文案库提供 |
| **服务端强制英文** | rate_limited_witness 等需要 retry_after_seconds 的错误 |

### 5.2 错误文案映射表（V1 zh-CN）

| error_code | zh-CN 文案 | 客户端 UI 行为 |
|---|---|---|
| `validation_failed` | "提交内容有误，请检查后重试。" | 表单内联错误 |
| `captured_at_invalid` | "拍摄时间无效：{reason}" | 段 4 时间确认页提示 |
| `captured_at_untrusted` | "拍摄时间可信度不足：请手动确认时间。" | 段 4 → 进入 "待补充" |
| `exif_missing_required` | "无法读取图片拍摄时间，请手动确认。" | 段 3 引导重选 |
| `location_missing` | "缺少位置信息：城市必填。" | 段 5 引导选城市 |
| `content_too_long` | "文本超出 200 字符限制。" | EchoInput 字符计数 |
| `client_key_invalid` | "客户端标识无效。（开发态可见）" | 不展示用户 |
| `permission_required` | "需要登录。（V1 无账户）" | 重定向到 about |
| `forbidden_role` | "权限不足。" | 不展示用户（开发态） |
| `upload_url_expired` | "上传凭证已过期，请重新发起。" | 客户端自动重新请求 upload-url |
| `upload_network` | "网络异常，请检查连接后重试。" | 段 6a 重试按钮 |
| `upload_timeout` | "上传超时，请重试。" | 段 6a 重试按钮 |
| `upload_checksum_mismatch` | "文件校验失败：重新上传。" | 段 6a 重试按钮 |
| `upload_size_exceeded` | "文件大小超出限制（最大 25 MiB）。" | 段 2 引导选更小图 |
| `upload_mime_unsupported` | "图片格式不支持（仅 JPEG / PNG / HEIC / WebP）。" | 段 2 引导选 JPEG/PNG |
| `asset_processing_failed` | "图片处理失败，请重试或换图。" | 段 6b 错误卡片 + 重新上传 |
| `asset_not_ready` | "图片处理中，请稍候。" | 段 6a 显示进度 |
| `submission_already_published` | "已发布，无法撤回。" | 段 6b 显示 "已发布" |
| `submission_already_withdrawn` | "已撤回。" | 段 6b 显示 "已撤回" |
| `submission_invalid_transition` | "提交状态异常。（开发态可见）" | 不展示用户 |
| `submission_not_found` | "提交不存在。" | 404 页面 |
| `submission_expired` | "提交已过期；请重新提交。" | 段 6b 重新提交按钮 |
| `moderation_pending` | "提交正在审核。" | 段 6b "待审核" 卡片 |
| `moderation_rejected` | "提交未通过审核：{public_reason}" | 段 6b 拒绝卡片 |
| `rate_limited` | "请求过于频繁，请稍后重试。" | 通用限流提示 |
| `rate_limited_witness` | "今日提交已达上限。请 [N] 分钟后再试。" | 段 6b 倒计时 |
| `server_error` | "服务异常，请稍后重试。" | 通用错误 banner |
| `service_unavailable` | "服务暂时不可用。" | 通用错误 banner |
| `service_timeout` | "请求超时，请刷新。" | 通用错误 banner |
| `dependency_failure_storage` | "图片上传暂时不可用。" | 段 2 错误提示 |

### 5.3 文案约束（与 D-P0-04 §6 原则一致）

- ✅ **不暴露服务端细节**：文案不含 stack / 错误码细节（仅 `validation_failed` / `submission_invalid_transition` 可见）
- ✅ **不暗示隐私问题**：文案不含 EXIF / GPS / 位置等关键词
- ✅ **不诱导用户绕过审核**：reject 文案中性（"未通过审核" 而非 "请修改后重提"）
- ✅ **可重试时给重试路径**：所有 `retryable=true` 错误必须有"重试"按钮
- ✅ **提供替代路径**：moderation_rejected 提供"知道了"（而非"必须重试"）

---

## 6. Sentry 集成（服务端 alert）

### 6.1 何时上报

| 错误类型 | 是否上报 Sentry | tag |
|---|:---:|---|
| **5xx 服务端错误** | ✅ | `feature:witness` + `stage:<endpoint>` |
| **internal_*** 违规 | ✅ **CRITICAL** | + `severity:critical` |
| **asset_processing_failed** | ✅ | + `asset_id` |
| **moderation_log insert 失败** | ✅ | + `moderator_id_hash` |
| **重复 status_history 超 64KB** | ✅ | + `submission_id` |
| **DB unique violation on client_key** | ❌ | （正常 idempotent replay） |
| **限流命中** | ❌ | （预期） |
| **validation_failed** | ❌ | （用户输入问题） |
| **4xx client errors** | ❌ | （用户问题） |

### 6.2 上报 payload（脱敏后）

```typescript
Sentry.captureException(err, {
  tags: {
    feature: 'witness',
    endpoint: 'POST /v1/witness/submissions',
    stage: 'sharp_processing',  // or 'db_write' / 'storage_upload'
  },
  extra: {
    request_id: requestId,
    asset_id: assetId,
    // ❌ 不含 ip / raw_coords / exif / description.text / client_key
  },
  user: {
    id: witnessIdHash,  // 仅 hash
  },
  fingerprint: ['witness-backend', endpoint, err.constructor.name],
});
```

### 6.3 告警规则（与 E-P0-10 一致）

| 告警 | 阈值 | 通道 |
|---|---|---|
| 5xx 错误率 | > 1% 持续 5min | PagerDuty oncall |
| asset_processing_failed | > 0 立即 | Slack #witness-alerts |
| internal_* 违规 | **任何** | PagerDuty critical |
| rate_limited_witness 命中 | > 50/h | Slack #abuse-watch |

---

## 7. 与 D-P0-05 埋点 error_category 对齐

### 7.1 错误码 → 埋点 error_category 映射（来自 E-P0-09 error-code-dict-v1.md §10）

| witness_submit_failed.error_category | error_code 来源 |
|---|---|
| `validation` | `validation_failed` · `captured_at_invalid` · `captured_at_untrusted` · `exif_missing_required` · `location_missing` · `content_too_long` |
| `permission_blocked` | （V1 Witness 后端不返回 4xx permission blocked；前端 SDK 触发 `witness_permission_result.denied`） |
| `upload_network` | `upload_network` |
| `upload_timeout` | `upload_timeout` · `upload_url_expired` |
| `server_5xx` | `server_error` · `service_unavailable` · `service_timeout` · `asset_processing_failed` · `dependency_failure_storage` |
| `captured_at_invalid` | `captured_at_invalid` · `captured_at_untrusted` |
| `exif_untrusted` | `exif_missing_required` · `captured_at_untrusted` |
| `rate_limited` | `rate_limited` · `rate_limited_witness` |
| `duplicate_submission` | `duplicate_submission` |

### 7.2 客户端埋点触发规则

```typescript
// 客户端：错误响应处理 + 埋点
async function handleApiError(response: Response, ctx: SubmissionContext): Promise<void> {
  const body = await response.json();
  const errorCategory = mapErrorCodeToCategory(body.error_code);

  // 触发 witness_submit_failed（仅在 retryable=true 且客户端放弃重试时）
  if (ctx.retryCount >= ctx.maxRetries) {
    analytics.track('witness_submit_failed', {
      submission_id_hash: hash8(ctx.submissionId),
      error_category: errorCategory,
      retryable: body.retryable,
      request_id: body.request_id,
    });
  }
}
```

---

## 8. 客户端错误处理示例代码

### 8.1 Web 端（D-P0-02 LOCKED Witness UI）

```typescript
// src/lib/witnessApi.ts (新文件；不动 D-P0-02 LOCKED 组件)
import { ZodError } from 'zod';

export class WitnessApiError extends Error {
  constructor(
    public code: string,
    public retryable: boolean,
    public requestId: string,
    public details?: Record<string, unknown>,
  ) {
    super(`${code}: ${requestId}`);
  }
}

export async function createWitnessSubmission(input: CreateInput): Promise<PublicWitnessSubmission> {
  let retryCount = 0;
  const maxRetries = 2;

  while (true) {
    try {
      const res = await fetch('/api/v1/witness/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-request-id': generateRequestId(),
        },
        body: JSON.stringify(input),
      });

      if (res.ok) {
        const body = await res.json();
        return body.data;
      }

      const errBody = await res.json();
      const err = new WitnessApiError(
        errBody.error_code,
        errBody.retryable,
        errBody.request_id,
        errBody.details,
      );

      // 限流：按 Retry-After 退避
      if (err.code === 'rate_limited_witness' && err.details?.retry_after_seconds) {
        await sleep(err.details.retry_after_seconds * 1000);
        continue;
      }

      // 自动重试
      if (err.retryable && retryCount < maxRetries) {
        const delay = Math.pow(3, retryCount) * 1000;  // 1s · 3s · 9s
        await sleep(delay);
        retryCount++;
        continue;
      }

      // 用户手动重试：抛出给 UI 层
      throw err;
    } catch (e) {
      if (e instanceof WitnessApiError) throw e;
      // network error（非 API response）
      throw new WitnessApiError('upload_network', true, 'req_unknown_xxxxxxxxxxxx', {});
    }
  }
}
```

### 8.2 UI 错误展示（D-P0-04 状态矩阵）

```tsx
// src/components/witness/ErrorCard.tsx (新组件；不动 LOCKED 组件)
import { WitnessApiError } from '@/lib/witnessApi';

export function WitnessErrorCard({ error, onRetry }: {
  error: WitnessApiError;
  onRetry?: () => void;
}) {
  return (
    <div className="error-card" role="alert">
      <div className="error-icon">⚠️</div>
      <p className="error-message">{getLocalizedMessage(error.code, error.details)}</p>
      <p className="error-id">错误 ID: {error.requestId}</p>
      {error.retryable && onRetry && (
        <button onClick={onRetry} className="retry-button">
          重试
        </button>
      )}
      {!error.retryable && (
        <a href="/" className="back-link">返回首页</a>
      )}
    </div>
  );
}

function getLocalizedMessage(code: string, details?: Record<string, unknown>): string {
  const messages: Record<string, string> = {
    'rate_limited_witness': `今日提交已达上限。请 ${details?.retry_after_seconds ? Math.ceil(Number(details.retry_after_seconds) / 60) : 60} 分钟后再试。`,
    'upload_network': '网络异常，请检查连接后重试。',
    'upload_timeout': '上传超时，请重试。',
    'asset_processing_failed': '图片处理失败，请重试或换图。',
    'submission_not_found': '提交不存在。',
    'submission_expired': '提交已过期；请重新提交。',
    'moderation_rejected': '感谢你的提交；这次未能通过审核。',
    // ... 完整映射
  };
  return messages[code] ?? '发生未知错误，请稍后重试。';
}
```

---

## 9. 隐私边界错误（internal_* · 不暴露给客户端）

### 9.1 处理流程

```typescript
async function serializePublicWitnessSubmission(submission: WitnessSubmission): Promise<PublicWitnessSubmission> {
  const publicRecord = {
    id: submission.id,
    client_key: submission.client_key,
    status: publicStatus(submission.status),  // 9→8 映射
    // ... 仅 public 字段
  };

  const validated = PublicWitnessSubmissionSchema.strict().safeParse(publicRecord);
  if (!validated.success) {
    // 服务端 alert · 客户端收到通用 500
    Sentry.captureException(validated.error, {
      tags: { feature: 'witness', severity: 'critical', code: 'internal_schema_violation' },
      extra: { request_id: ctx.requestId },
    });
    return errorResponse(500, 'server_error', null, false);  // 不暴露 internal_schema_violation
  }
  return validated.data;
}
```

### 9.2 关键不变量

- ✅ `internal_*` 错误码仅在 Sentry / Vercel log 中出现
- ✅ 客户端永不见 `internal_precise_location_leak` / `internal_unauthorised_raw_location_access` / `internal_schema_violation`
- ✅ 服务端必须 alert + page oncall（任何 `internal_*` 命中都是安全事件）

---

## 10. 自验收（任务卡 §E 强制约束 + Acceptance Criteria）

| # | 验收项 | 状态 | 证据 |
|---|---|---|---|
| 1 | 错误码字典与 E-P0-09 error-code-dict 一致 | ✅ | §3.1 |
| 2 | 错误响应格式（ErrorEnvelope） | ✅ | §1.1 |
| 3 | request_id 规范（生成 + 透传） | ✅ | §2 |
| 4 | 不暴露内部堆栈 | ✅ | §1.3 |
| 5 | 不暴露 internal_* 错误码 | ✅ | §9 |
| 6 | 重试策略（自动 2 + 手动 1） | ✅ | §4 |
| 7 | 上传失败重试（最多 2 自动 + 1 手动） | ✅ | §4.1 + state-matrix §3.5 |
| 8 | 审核拒绝通知用户 + 展示原因 | ✅ | §5.2 `moderation_rejected` |
| 9 | 服务器错误显示 "请稍后重试" + 错误 ID | ✅ | §5.2 `server_error` + §2.3 |
| 10 | 客户端埋点 error_category 映射 | ✅ | §7 |

---

**End of error-handling-v1.md · E-P0-03 子产物 5/7**