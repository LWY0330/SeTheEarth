---
title: SEE EARTH V1 · E-P0-03 · Minimal Witness Backend · Endpoints · v1
type: engineering-endpoints
tags: [release-v1, e-p0-03, witness-backend, endpoints, rest, zod, see-earth]
task_id: E-P0-03
brief_anchor: "Release Strategy Brief §5 E-P0-03 §B"
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
  - ./schema-v1.md
  - ./error-handling-v1.md
  - /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/api-contract/openapi.yaml
  - /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/api-contract/zod-schemas/witness-submission.ts
  - /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/api-contract/error-code-dict-v1.md
  - /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/07-设计师设计参考/release-v1/minimal-witness/api-field-mapping-v1.md
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/e-p0-03-witness-backend/endpoints-v1.md
workspace_canonical_path: /Users/lwy/Documents/ChatGPT/看见地球/release-v1/e-p0-03-witness-backend/endpoints-v1.md
sync_required: true · sandbox 拒绝写入 Obsidian
---

# SEE EARTH V1 · E-P0-03 · Minimal Witness Backend · Endpoints · v1

> **作者**：Engineer Agent #4（外部 Owner = 您）
> **派发时间**：2026-08-24 · Round 4
> **目标**：交付 Witness 后端 **5 个端点的完整规范** —— Request/Response schema（Zod 导入 E-P0-09）+ 错误码（与 E-P0-09 error-code-dict 一致）+ 权限要求 + 性能预算 + 示例
> **强制约束**：与 D-P0-02 LOCKED Witness UI 6 段流程 + E-P0-09 OpenAPI contract 字段一一对应

---

## 0. 阅读指南

- **§1** 端点总览 + URL 命名规则
- **§2** 端点 1：`POST /v1/witness/submissions`（创建 draft + 幂等）
- **§3** 端点 2：`POST /v1/witness/submissions/{id}/upload-url`（返回 signed upload URL）
- **§4** 端点 3：`POST /v1/witness/submissions/{id}/commit`（提交完成 + EXIF 剥离触发）
- **§5** 端点 4：`GET /v1/witness/submissions/{id}`（查询状态 + 公开预览）
- **§6** 端点 5：`POST /v1/admin/witness/submissions/{id}/moderate`（审核通过/拒绝）
- **§7** 错误响应通用格式（与 §error-handling-v1 配套）
- **§8** 性能预算汇总
- **§9** 与 D-P0-02 LOCKED 6 段流程的字段映射

---

## 1. 端点总览

| # | Method | Path | 用途 | 鉴权 | 性能预算 p50 / p95 |
|---|---|---|---|---|---|
| 1 | POST | `/v1/witness/submissions` | 创建 draft + 幂等 replay | anon (cookie) | 80ms / 200ms |
| 2 | POST | `/v1/witness/submissions/{id}/upload-url` | 返回 signed upload URL | anon (cookie) | 100ms / 250ms |
| 3 | POST | `/v1/witness/submissions/{id}/commit` | 提交完成 + 触发 sharp | anon (cookie) | 150ms / 350ms |
| 4 | GET | `/v1/witness/submissions/{id}` | 查询状态 + 公开预览 | anon (cookie) | 60ms / 150ms |
| 5 | POST | `/v1/admin/witness/submissions/{id}/moderate` | 审核通过/拒绝 | moderator JWT | 120ms / 300ms |

**URL 命名规则**：
- 公开前缀：`/v1/witness/...`
- 审核前缀：`/v1/admin/witness/...`
- ID 格式：UUIDv4（小写，连字符）

**通用 headers**（所有请求）：
- `Idempotency-Key: <uuid-v4>`（POST 端点推荐；端点 1 必填）
- `Content-Type: application/json`（除上传二进制）
- `User-Agent: <UA>`（服务端解析为 `user_agent_class` enum）
- `Accept-Language: zh-CN | en`（决定 description_locale 默认）

**通用响应 envelope**（所有 200/201 响应）：
```typescript
{
  data: <endpoint-specific>,
  request_id: string  // 服务端 correlation id（UUIDv4）
}
```

**通用错误 envelope**：见 `error-handling-v1.md` §2

---

## 2. 端点 1：POST /v1/witness/submissions（创建 draft）

### 2.1 用途

- **创建草稿**：首次提交 witness 时建立 record（status=draft）
- **幂等 replay**：同 `client_key` 重试返回 200 + 已存在 record（不创建新行）

### 2.2 权限要求

| 维度 | 规则 |
|---|---|
| **鉴权** | 无（匿名）+ `see_earth_witness_session` cookie（首次自动生成） |
| **限流** | 5 creates / hour / IP（V1 决策） |
| **Body 验证** | Zod `CreateWitnessSubmissionSchema` |
| **client_key** | UUIDv4 · 8-128 chars · regex `^[A-Za-z0-9_:-]{8,128}$` |

### 2.3 Request

**Headers**：

| Name | Required | Value |
|---|:---:|---|
| `Content-Type` | ✓ | `application/json` |
| `Idempotency-Key` | 推荐 | UUIDv4（与 body.client_key 一致时强制） |

**Body**（与 E-P0-09 Zod `CreateWitnessSubmissionSchema` 完全一致）：

```json
{
  "client_key": "550e8400-e29b-41d4-a716-446655440000",
  "media_type": "photo_camera",

  "location": {
    "mode": "auto_gps_city",
    "public_city_id": "kyoto",
    "captured_at_tz": "Asia/Tokyo",
    "precise": {
      "latitude": 35.011665,
      "longitude": 135.768326,
      "accuracy_m": 12.5
    }
  },

  "captured_at_claim": {
    "captured_at": "2026-08-24T03:00:00Z",
    "captured_at_tz": "Asia/Tokyo",
    "captured_at_source": "exif",
    "captured_at_confidence": "high"
  },

  "description": {
    "text": "今天京都下了一场短暂的雨",
    "locale": "zh"
  }
}
```

**字段说明**（与 E-P0-09 §WitnessLocationClaim + §WitnessCapturedAtClaim 一致）：

| 字段 | 必填 | 约束 |
|---|:---:|---|
| `client_key` | ✓ | 8-128 chars · regex `^[A-Za-z0-9_:-]{8,128}$` |
| `media_type` | ✓ | enum: `photo_camera` \| `photo_library` \| `live_photo` |
| `location.mode` | ✓ | enum: `auto_gps_city` \| `manual_city` \| `denied_fallback_manual` |
| `location.public_city_id` | ✓ | Seed 12 城内（V1） |
| `location.captured_at_tz` | ✓ | IANA timezone（"Asia/Tokyo" 等） |
| `location.precise` | ❌ | **仅当** `mode=auto_gps_city`；lat ∈ [-90,90] · lng ∈ [-180,180] · accuracy_m ≥ 0 |
| `captured_at_claim.captured_at` | ✓ | RFC 3339 UTC |
| `captured_at_claim.captured_at_tz` | ✓ | IANA timezone（与 location 一致） |
| `captured_at_claim.captured_at_source` | ✓ | enum: `exif` \| `user_confirmed` \| `admin` |
| `captured_at_claim.captured_at_confidence` | ✓ | enum: `high` \| `medium` \| `low` \| `manual` |
| `description.text` | ❌ | ≤ 200 chars |
| `description.locale` | ❌ | `zh` \| `en`，默认 `zh` |

### 2.4 Response

**成功 201 Created**（新建 draft）：

```json
{
  "data": {
    "id": "sub_550e8400-e29b-41d4-a716-446655440001",
    "client_key": "550e8400-e29b-41d4-a716-446655440000",
    "status": "draft",
    "media_type": "photo_camera",
    "asset_id": null,
    "location_mode": "auto_gps_city",
    "public_city_id": "kyoto",
    "captured_at": "2026-08-24T03:00:00Z",
    "captured_at_tz": "Asia/Tokyo",
    "captured_at_source": "exif",
    "captured_at_confidence": "high",
    "description_redacted": "present",
    "submitted_at": null,
    "moderation_result": null,
    "error_category": null
  },
  "request_id": "req_20260824_abc123def456"
}
```

**成功 200 OK**（幂等 replay，client_key 已存在）：

```json
{
  "data": { /* 完全相同的 record */ },
  "request_id": "req_20260824_abc123def456"
}
```

> **幂等 replay 判定**：`client_key` 已存在 + payload 字段完全一致 → 200
> **冲突判定**：`client_key` 已存在 + payload 不一致 → 409 `duplicate_submission`

### 2.5 错误响应

| HTTP | error_code | 触发 | retryable |
|---|---|---|:---:|
| 400 | `validation_failed` | 字段缺失 / 类型错误 | false |
| 400 | `captured_at_invalid` | captured_at 在未来 | false |
| 400 | `location_missing` | public_city_id 不在 Seed 12 城内 | false |
| 400 | `content_too_long` | description.text > 200 chars | false |
| 400 | `client_key_invalid` | client_key 格式错误 | false |
| 409 | `duplicate_submission` | client_key 重复 + payload 不一致 | false |
| 429 | `rate_limited_witness` | > 5 creates / hour / IP | true (with Retry-After) |
| 5xx | `server_error` | 服务端异常 | true |

### 2.6 服务端实现流程

```typescript
async function handler(req: NextRequest): Promise<NextResponse> {
  // 1. 解析 + Zod 校验
  const body = await req.json();
  const parsed = CreateWitnessSubmissionSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(400, 'validation_failed', parsed.error.issues, false);
  }

  // 2. 限流（5/h/IP）
  const ipHash = hmacIP(req.ip, process.env.WITNESS_IP_HASH_SECRET!);
  const rateLimit = await checkRateLimit(ipHash, 'witness_create', 5, '1h');
  if (rateLimit.exceeded) {
    return errorResponse(429, 'rate_limited_witness', {
      retry_after_seconds: rateLimit.retryAfter
    }, true, { 'Retry-After': rateLimit.retryAfter.toString() });
  }

  // 3. 幂等性 check
  const existing = await db.witnessSubmissions.findByClientKey(parsed.data.client_key);
  if (existing) {
    if (payloadEquals(existing, parsed.data)) {
      // 幂等 replay
      return successResponse(200, publicWitnessSubmission(existing));
    } else {
      return errorResponse(409, 'duplicate_submission', null, false);
    }
  }

  // 4. 写 witness_id cookie（如不存在）
  const witnessId = getOrCreateWitnessId(req, res);

  // 5. 事务：创建 submission + private_location + 初始 status_history
  const submission = await db.transaction(async (tx) => {
    const sub = await tx.witnessSubmissions.create({
      ...parsed.data,
      witness_id: witnessId,
      ip_hash: ipHash,
      user_agent_class: parseUAClass(req.headers.get('user-agent')),
      status: 'draft',
      status_history: [],
    });

    if (parsed.data.location.precise) {
      await tx.privateLocations.create({
        submission_id: sub.id,
        city_id: parsed.data.location.public_city_id,
        latitude: parsed.data.location.precise.latitude,
        longitude: parsed.data.location.precise.longitude,
        accuracy_meters: parsed.data.location.precise.accuracy_m,
        source: 'gps',
      });
    }

    return sub;
  });

  // 6. 触发器自动写入 status_history['draft']

  // 7. 返回 201
  return successResponse(201, publicWitnessSubmission(submission));
}
```

### 2.7 性能预算

| 指标 | 目标 |
|---|---|
| **p50 latency** | 80ms |
| **p95 latency** | 200ms |
| **DB 查询** | 1 SELECT（client_key 唯一）+ 1 INSERT（witness_submissions）+ 1 INSERT（private_locations） |
| **外部依赖** | 0（无 Storage 调用） |

---

## 3. 端点 2：POST /v1/witness/submissions/{id}/upload-url（获取上传凭证）

### 3.1 用途

- 返回 Supabase Storage `witness-raw` bucket 的短期 signed upload URL
- 创建 asset record（status=pending_upload）
- V1 决策：合并 E-P0-09 的 `POST /assets/upload-url` + `POST /assets/{id}/complete` 到此端点 + `commit` 端点（避免跨资源）

### 3.2 权限要求

| 维度 | 规则 |
|---|---|
| **鉴权** | anon + `see_earth_witness_session` cookie · witness_id 必须与 submission.witness_id 匹配 |
| **限流** | 60 / hour / IP（更宽松，因同 submission 多步） |
| **路径参数** | `submission_id` (UUIDv4) |

### 3.3 Request

**Body**：

```json
{
  "media_type": "photo_camera",
  "size_bytes": 12345678,
  "checksum_sha256": "a1b2c3d4e5f6...64chars",
  "mime": "image/jpeg",
  "width": 4032,
  "height": 3024
}
```

| 字段 | 必填 | 约束 |
|---|:---:|---|
| `media_type` | ✓ | enum: `photo_camera` \| `photo_library` \| `live_photo`（与创建时一致） |
| `size_bytes` | ✓ | 1 - 26214400（25 MiB） |
| `checksum_sha256` | ✓ | 64 chars hex（`^[a-f0-9]{64}$`） |
| `mime` | ✓ | `image/jpeg` \| `image/png` \| `image/heic` \| `image/webp` |
| `width` | ❌ | ≥ 1 |
| `height` | ❌ | ≥ 1 |

### 3.4 Response

**成功 201 Created**：

```json
{
  "data": {
    "asset_id": "asset_550e8400-e29b-41d4-a716-446655440002",
    "upload_url": "https://sethearth-alpha.supabase.co/storage/v1/object/upload/sign/witness-raw/asset_550e8400...?token=eyJhb...",
    "expires_at": "2026-08-24T12:15:30Z",
    "max_size": 26214400,
    "mime_whitelist": ["image/jpeg", "image/png", "image/heic", "image/webp"],
    "required_headers": {
      "Content-Type": "image/jpeg",
      "x-upsert": "false"
    }
  },
  "request_id": "req_20260824_abc123def456"
}
```

| 字段 | 用途 |
|---|---|
| `asset_id` | 客户端用于 `commit` 端点引用 |
| `upload_url` | 客户端 PUT 二进制到此 URL（≤ 15 min TTL） |
| `expires_at` | 客户端显示倒计时 |
| `max_size` | 客户端二次校验 |
| `mime_whitelist` | 客户端二次校验 |
| `required_headers` | 客户端 PUT 时必带 |

### 3.5 错误响应

| HTTP | error_code | 触发 | retryable |
|---|---|---|:---:|
| 400 | `validation_failed` | 字段缺失 / 类型错误 | false |
| 400 | `upload_size_exceeded` | size_bytes > 25 MiB | false |
| 400 | `upload_mime_unsupported` | mime 不在白名单 | false |
| 404 | `submission_not_found` | submission_id 不存在或 witness_id 不匹配 | false |
| 409 | `submission_invalid_transition` | submission.status ≠ draft | false |
| 410 | `submission_expired` | submission > 24h | false |
| 429 | `rate_limited_witness` | > 60 / hour / IP | true |

### 3.6 服务端实现流程

```typescript
async function handler(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
  const submissionId = params.id;

  // 1. 解析 + Zod 校验
  const body = await req.json();
  const parsed = AssetUploadRequestSchema.omit({ submission_id: true }).safeParse(body);
  if (!parsed.success) return errorResponse(400, 'validation_failed', parsed.error.issues, false);

  // 2. 限流
  const ipHash = hmacIP(req.ip, process.env.WITNESS_IP_HASH_SECRET!);
  const rateLimit = await checkRateLimit(ipHash, 'witness_upload_url', 60, '1h');
  if (rateLimit.exceeded) return errorResponse(429, 'rate_limited_witness', null, true);

  // 3. 查询 submission
  const submission = await db.witnessSubmissions.findById(submissionId);
  if (!submission || submission.witness_id !== getWitnessId(req)) {
    return errorResponse(404, 'submission_not_found', null, false);
  }
  if (submission.status !== 'draft') {
    return errorResponse(409, 'submission_invalid_transition', { current: submission.status, expected: ['draft'] }, false);
  }
  if (submission.created_at < Date.now() - 24 * 60 * 60 * 1000) {
    return errorResponse(410, 'submission_expired', null, false);
  }

  // 4. 创建 asset record
  const asset = await db.assets.create({
    witness_id: getWitnessId(req),
    submission_id: submissionId,
    media_type: parsed.data.media_type,
    mime: parsed.data.mime,
    bytes: parsed.data.size_bytes,
    width: parsed.data.width,
    height: parsed.data.height,
    checksum_sha256: parsed.data.checksum_sha256,
    status: 'pending_upload',
    uploaded_ip_hash: ipHash,
  });

  // 5. 生成 signed upload URL
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);  // 15 min
  const uploadUrl = await supabase.storage
    .from('witness-raw')
    .createSignedUploadUrl(`${asset.id}`, expiresAt);

  // 6. 返回 201
  return successResponse(201, {
    asset_id: asset.id,
    upload_url: uploadUrl.signedUrl,
    expires_at: expiresAt.toISOString(),
    max_size: 26214400,
    mime_whitelist: ['image/jpeg', 'image/png', 'image/heic', 'image/webp'],
    required_headers: { 'Content-Type': parsed.data.mime, 'x-upsert': 'false' }
  });
}
```

### 3.7 性能预算

| 指标 | 目标 |
|---|---|
| **p50 latency** | 100ms |
| **p95 latency** | 250ms |
| **DB 查询** | 1 SELECT + 1 INSERT（assets） |
| **外部依赖** | 1 Supabase Storage `createSignedUploadUrl` 调用 |

---

## 4. 端点 3：POST /v1/witness/submissions/{id}/commit（提交完成）

### 4.1 用途

- 客户端通知服务端：上传完成
- 服务端 verify checksum + size
- 触发 status 转换：draft → uploading
- 触发 sharp worker 异步处理

### 4.2 权限要求

| 维度 | 规则 |
|---|---|
| **鉴权** | anon + witness_id cookie（match submission.witness_id） |
| **限流** | 60 / hour / IP |
| **路径参数** | `submission_id` (UUIDv4) |

### 4.3 Request

**Body**：

```json
{
  "asset_id": "asset_550e8400-e29b-41d4-a716-446655440002",
  "checksum_sha256": "a1b2c3d4e5f6...64chars",
  "size_bytes": 12345678
}
```

| 字段 | 必填 | 约束 |
|---|:---:|---|
| `asset_id` | ✓ | 与 upload-url 返回一致 |
| `checksum_sha256` | ✓ | 64 chars hex（与 upload-url 时一致） |
| `size_bytes` | ✓ | ≥ 1 |

### 4.4 Response

**成功 200 OK**：

```json
{
  "data": {
    "asset_id": "asset_550e8400-e29b-41d4-a716-446655440002",
    "status": "processing",
    "submission_id": "sub_550e8400-e29b-41d4-a716-446655440001",
    "submission_status": "uploading"
  },
  "request_id": "req_20260824_abc123def456"
}
```

### 4.5 错误响应

| HTTP | error_code | 触发 | retryable |
|---|---|---|:---:|
| 400 | `validation_failed` | 字段缺失 / 类型错误 | false |
| 404 | `submission_not_found` | submission_id 不存在或 witness_id 不匹配 | false |
| 404 | `asset_not_found` | asset_id 不存在或不属于 submission | false |
| 409 | `submission_invalid_transition` | submission.status ≠ draft | false |
| 409 | `upload_checksum_mismatch` | 服务端 verify checksum 失败 | true (客户端重传) |
| 410 | `submission_expired` | submission > 24h | false |
| 429 | `rate_limited_witness` | > 60 / hour / IP | true |

### 4.6 服务端实现流程

```typescript
async function handler(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
  const submissionId = params.id;

  // 1. 解析 + 校验
  const body = await req.json();
  const parsed = AssetCompleteRequestSchema.safeParse(body);
  if (!parsed.success) return errorResponse(400, 'validation_failed', parsed.error.issues, false);

  // 2. 限流
  // ...

  // 3. 事务：verify checksum + state transition
  const result = await db.transaction(async (tx) => {
    const submission = await tx.witnessSubmissions.findById(submissionId);
    if (!submission || submission.witness_id !== getWitnessId(req)) {
      throw new HttpError(404, 'submission_not_found');
    }
    if (submission.status !== 'draft') {
      throw new HttpError(409, 'submission_invalid_transition');
    }

    const asset = await tx.assets.findById(parsed.data.asset_id);
    if (!asset || asset.submission_id !== submissionId) {
      throw new HttpError(404, 'asset_not_found');
    }

    // 4. 下载 raw image from Storage
    const rawBuffer = await supabase.storage.from('witness-raw').download(asset.id);

    // 5. Verify checksum
    const actualChecksum = sha256(rawBuffer);
    if (actualChecksum !== parsed.data.checksum_sha256) {
      throw new HttpError(409, 'upload_checksum_mismatch');
    }

    // 6. Verify size
    if (rawBuffer.length !== parsed.data.size_bytes) {
      throw new HttpError(409, 'upload_checksum_mismatch');
    }

    // 7. State transition: draft → uploading
    await tx.witnessSubmissions.update(submissionId, {
      asset_id: asset.id,
      submitted_at: new Date(),
      // status 由触发器自动写入 status_history
    });
    await tx.witnessSubmissions.transition(submissionId, 'uploading', 'asset_committed');

    await tx.assets.update(asset.id, {
      status: 'processing',
      processing_started_at: new Date(),
    });

    return { asset, submission };
  });

  // 8. Enqueue sharp job
  await enqueueSharpJob(result.asset.id, submissionId);

  // 9. 返回 200
  return successResponse(200, {
    asset_id: result.asset.id,
    status: 'processing',
    submission_id: submissionId,
    submission_status: 'uploading',
  });
}
```

### 4.7 性能预算

| 指标 | 目标 |
|---|---|
| **p50 latency** | 150ms（含 Storage download） |
| **p95 latency** | 350ms |
| **DB 查询** | 1 SELECT (submission) + 1 SELECT (asset) + 2 UPDATE |
| **外部依赖** | 1 Supabase Storage download + 1 enqueue（Inngest 或 Vercel cron） |

---

## 5. 端点 4：GET /v1/witness/submissions/{id}（查询状态）

### 5.1 用途

- 查询 submission 当前状态 + 公开预览（不含 precise_*）
- V1 session 限制：仅创建时的 witness_id 可查（cookie match）

### 5.2 权限要求

| 维度 | 规则 |
|---|---|
| **鉴权** | anon + witness_id cookie（match submission.witness_id） |
| **限流** | 60 / hour / IP（GET 端点宽松） |
| **路径参数** | `submission_id` (UUIDv4) |

### 5.3 Request

无 body。Headers：
- `Cookie: see_earth_witness_session=...`

### 5.4 Response

**成功 200 OK**：

```json
{
  "data": {
    "id": "sub_550e8400-e29b-41d4-a716-446655440001",
    "client_key": "550e8400-e29b-41d4-a716-446655440000",
    "status": "submitted",
    "media_type": "photo_camera",
    "asset_id": "asset_550e8400-e29b-41d4-a716-446655440002",
    "location_mode": "auto_gps_city",
    "public_city_id": "kyoto",
    "captured_at": "2026-08-24T03:00:00Z",
    "captured_at_tz": "Asia/Tokyo",
    "captured_at_source": "exif",
    "captured_at_confidence": "high",
    "description_redacted": "present",
    "submitted_at": "2026-08-24T03:05:30Z",
    "moderation_result": null,
    "error_category": null
  },
  "request_id": "req_20260824_abc123def456"
}
```

**审核完成后的 status**：

```json
{
  "data": {
    /* ... */
    "status": "published",
    "moderation_result": {
      "decision": "accepted",
      "decided_at": "2026-08-24T03:10:00Z",
      "moment_id": "moment_550e8400-e29b-41d4-a716-446655440003"
    }
  }
}
```

### 5.5 错误响应

| HTTP | error_code | 触发 | retryable |
|---|---|---|:---:|
| 404 | `submission_not_found` | submission_id 不存在或 witness_id 不匹配 | false |
| 410 | `submission_expired` | submission 已 soft delete（draft > 24h） | false |

### 5.6 服务端实现流程

```typescript
async function handler(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
  // 1. 查询 submission
  const submission = await db.witnessSubmissions.findById(params.id);
  if (!submission || submission.witness_id !== getWitnessId(req)) {
    return errorResponse(404, 'submission_not_found', null, false);
  }
  if (submission.deleted_at !== null) {
    return errorResponse(410, 'submission_expired', null, false);
  }

  // 2. 序列化（应用层 strict 校验 + DB 层 RLS）
  const publicRecord = publicWitnessSubmission(submission);

  // 3. Zod strict 校验（防止 precise_* 泄漏）
  const validated = PublicWitnessSubmissionSchema.safeParse(publicRecord);
  if (!validated.success) {
    // 严重错误：内部 schema 违规
    Sentry.captureException(validated.error);
    return errorResponse(500, 'internal_schema_violation', null, false);
  }

  // 4. 返回 200
  return successResponse(200, validated.data);
}
```

### 5.7 性能预算

| 指标 | 目标 |
|---|---|
| **p50 latency** | 60ms |
| **p95 latency** | 150ms |
| **DB 查询** | 1 SELECT (witness_submissions) |
| **外部依赖** | 0 |

---

## 6. 端点 5：POST /v1/admin/witness/submissions/{id}/moderate（审核决策）

### 6.1 用途

- Moderator 决策：accept（published） / reject（rejected）
- V1 简化：claim + decision 合并到同一端点（自动 assign）
- 创建 Moment record（accept 时）

### 6.2 权限要求

| 维度 | 规则 |
|---|---|
| **鉴权** | JWT with `role: moderator` claim（`moderatorSessionAuth`） |
| **限流** | 100 / minute / moderator（避免审核被限流） |
| **路径参数** | `submission_id` (UUIDv4) |

### 6.3 Request

**Headers**：
- `Authorization: Bearer <jwt>`
- `Content-Type: application/json`

**Body**：

```json
{
  "decision": "accepted",
  "public_reason": "感谢分享这座城市的瞬间"
}
```

或拒绝：

```json
{
  "decision": "rejected",
  "reason_code": "unsafe_content",
  "public_reason": "包含不适宜内容"
}
```

| 字段 | 必填 | 约束 |
|---|:---:|---|
| `decision` | ✓ | enum: `accepted` \| `rejected` \| `needs_more_info`（V1 仅实现 accept/reject） |
| `reason_code` | reject 时必填 | enum: `unsafe_content` \| `low_quality` \| `wrong_location` \| `not_a_moment` \| `other` |
| `public_reason` | ❌ | ≤ 256 chars（展示给 submitter） |

### 6.4 Response

**成功 200 OK（accept）**：

```json
{
  "data": {
    "id": "sub_550e8400-e29b-41d4-a716-446655440001",
    "status": "published",
    "moderation_result": {
      "decision": "accepted",
      "decided_at": "2026-08-24T03:10:00Z",
      "moment_id": "moment_550e8400-e29b-41d4-a716-446655440003"
    },
    "published_at": "2026-08-24T03:10:00Z",
    /* ... 其他 PublicWitnessSubmission 字段 */
  },
  "request_id": "req_20260824_abc123def456"
}
```

**成功 200 OK（reject）**：

```json
{
  "data": {
    "id": "sub_...",
    "status": "rejected",
    "moderation_result": {
      "decision": "rejected",
      "decided_at": "2026-08-24T03:10:00Z",
      "reason_code": "unsafe_content",
      "public_reason": "包含不适宜内容"
    },
    /* ... 其他字段 */
  }
}
```

### 6.5 错误响应

| HTTP | error_code | 触发 | retryable |
|---|---|---|:---:|
| 400 | `validation_failed` | decision / reason_code 非法 | false |
| 401 | `permission_required` | JWT 无效 / 过期 | false |
| 403 | `forbidden_role` | JWT 有效但 role ≠ moderator | false |
| 404 | `submission_not_found` | submission_id 不存在 | false |
| 409 | `submission_invalid_transition` | status ≠ submitted/under_review | false |
| 5xx | `server_error` | 服务端异常 | true |

### 6.6 服务端实现流程

```typescript
async function handler(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
  // 1. JWT 校验 + moderator role 检查
  const jwt = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!jwt) return errorResponse(401, 'permission_required', null, false);
  const decoded = await verifyModeratorJWT(jwt);
  if (decoded.role !== 'moderator') return errorResponse(403, 'forbidden_role', null, false);
  const moderatorIdHash = hmac('moderator_id', decoded.id, process.env.MODERATOR_ID_HASH_SECRET!);

  // 2. 解析 + 校验
  const body = await req.json();
  const parsed = ModerationDecisionRequestSchema.safeParse(body);
  if (!parsed.success) return errorResponse(400, 'validation_failed', parsed.error.issues, false);

  // 3. 事务：auto-claim + decision
  const result = await db.transaction(async (tx) => {
    const submission = await tx.witnessSubmissions.findById(params.id);
    if (!submission) throw new HttpError(404, 'submission_not_found');

    let currentStatus = submission.status;
    // Auto-claim: submitted → under_review
    if (currentStatus === 'submitted') {
      await tx.witnessSubmissions.transition(params.id, 'under_review', 'moderator_assigned', {
        moderator_id_hash: moderatorIdHash
      });
      currentStatus = 'under_review';
    }

    if (currentStatus !== 'under_review') {
      throw new HttpError(409, 'submission_invalid_transition');
    }

    if (parsed.data.decision === 'accepted') {
      // 4a. 创建 Moment
      const moment = await tx.moments.create({
        city_id: submission.city_id,
        captured_at: submission.captured_at,
        captured_at_tz: submission.captured_at_tz,
        source_type: 'witness',
        asset_id: submission.asset_id,
        witness_id: submission.witness_id,
        witness_submission_id: submission.id,
        moderation_status: 'approved',
      });

      // 4b. Update submission
      await tx.witnessSubmissions.transition(params.id, 'published', 'moderator_accepted', {
        moderator_id_hash: moderatorIdHash,
        moment_id: moment.id,
      });
      await tx.witnessSubmissions.update(params.id, {
        moderation_result: {
          decision: 'accepted',
          decided_at: new Date(),
          moment_id: moment.id,
        },
        published_at: new Date(),
        reviewed_at: new Date(),
        reviewed_by: moderatorIdHash,
      });
    } else if (parsed.data.decision === 'rejected') {
      // 5a. Update submission
      await tx.witnessSubmissions.transition(params.id, 'rejected', 'moderator_rejected', {
        moderator_id_hash: moderatorIdHash,
        reason_code: parsed.data.reason_code,
        public_reason: parsed.data.public_reason,
      });
      await tx.witnessSubmissions.update(params.id, {
        moderation_result: {
          decision: 'rejected',
          decided_at: new Date(),
          reason_code: parsed.data.reason_code,
          public_reason: parsed.data.public_reason,
        },
        reviewed_at: new Date(),
        reviewed_by: moderatorIdHash,
      });

      // 5b. Cleanup precise location（GDPR/位置隔离强制）
      await tx.privateLocations.softDeleteBySubmissionId(params.id);

      // 5c. Asset 保留（moderator 审计 30 天后 GC）
    }

    // 6. INSERT moderation_log
    await tx.moderationLog.create({
      submission_id: params.id,
      moderator_id_hash: moderatorIdHash,
      action: parsed.data.decision === 'accepted' ? 'publish' : 'reject',
      before_status: 'under_review',
      after_status: parsed.data.decision === 'accepted' ? 'published' : 'rejected',
      reason_code: parsed.data.reason_code,
      public_reason: parsed.data.public_reason,
      request_id: req.headers.get('x-request-id'),
      ip_hash: hmacIP(req.ip, process.env.MODERATOR_IP_HASH_SECRET!),
    });

    return { submission, moment: parsed.data.decision === 'accepted' ? /* moment */ null : null };
  });

  return successResponse(200, publicWitnessSubmission(result.submission));
}
```

### 6.7 性能预算

| 指标 | 目标 |
|---|---|
| **p50 latency** | 120ms（含事务 + 1 INSERT moment + 2 INSERT moderation_log） |
| **p95 latency** | 300ms |
| **DB 查询** | 1 SELECT + 1 UPDATE（auto-claim）+ 1 INSERT（moment）+ 1 UPDATE（submission）+ 1 UPDATE（private_locations）+ 1 INSERT（moderation_log） |
| **外部依赖** | 0 |

---

## 7. 错误响应通用格式

见 `error-handling-v1.md` §2。简要：

```typescript
{
  error_code: string,        // snake_case · 来自 E-P0-09 error-code-dict
  message: string,           // human-readable · localisable
  details?: object,          // 上下文（如 current_status, retry_after_seconds）
  retryable: boolean,
  request_id: string         // 服务端 correlation id
}
```

**V1 严格规则**：
- ❌ 不暴露 `stack` 或 `trace`
- ❌ 不暴露 `internal_*` 错误码给客户端
- ✅ 所有错误包含 `request_id`（用于日志关联）

---

## 8. 性能预算汇总

| 端点 | p50 | p95 | DB 调用数 | 外部依赖数 |
|---|---|---|---|---|
| POST /submissions | 80ms | 200ms | 1 SELECT + 2 INSERT | 0 |
| POST /submissions/:id/upload-url | 100ms | 250ms | 1 SELECT + 1 INSERT | 1 Storage API |
| POST /submissions/:id/commit | 150ms | 350ms | 1 SELECT + 1 SELECT + 2 UPDATE | 1 Storage download + 1 queue |
| GET /submissions/:id | 60ms | 150ms | 1 SELECT | 0 |
| POST /admin/witness/submissions/:id/moderate | 120ms | 300ms | 1 SELECT + 3 UPDATE + 3 INSERT | 0 |

**总目标**：
- Witness 完整流程（创建 → 上传 → commit → 审核 → 发布）：**p50 ≤ 8s · p95 ≤ 30s**（含 sharp 处理 + moderator 决策）
- 纯服务端（不含 sharp + moderator）：**p50 ≤ 500ms · p95 ≤ 1.5s**

---

## 9. 与 D-P0-02 LOCKED 6 段流程的字段映射

| D-P0-02 段 | 触发端点 | 客户端字段 | 服务端 schema 字段 |
|---|---|---|---|
| 段 0 入口 | （无 API） | — | — |
| 段 1 选图 | （客户端） | — | — |
| 段 2 时间确认 | （客户端） | — | — |
| 段 3 位置确认 | （客户端） | — | — |
| 段 4 描述 | （客户端） | — | — |
| 段 5 公开预览 | （客户端，预览） | — | — |
| **段 6a 上传** | **POST /submissions** | `client_key` · `media_type` · `location` · `captured_at_claim` · `description` | body 同 |
| **段 6a 上传** | **POST /upload-url** | `media_type` · `size_bytes` · `checksum_sha256` · `mime` | body 同 |
| **段 6a 上传** | **(client PUT raw)** | `binary stream` | Storage witness-raw |
| **段 6a 上传** | **POST /commit** | `asset_id` · `checksum_sha256` · `size_bytes` | body 同 |
| **段 6b 结果** | **GET /submissions/:id** | (轮询) | response status |
| **段 6b 结果** | **PATCH /submissions/:id** | `client_key` · `status: withdrawn` | body 同 |
| **(moderator)** | **POST /admin/.../moderate** | `decision` · `reason_code?` · `public_reason?` | body 同 |

---

## 10. 自验收（任务卡 Acceptance Criteria 10 项）

| # | 验收项 | 状态 | 证据 |
|---|---|---|---|
| 1 | 5 端点 schema 与 E-P0-09 Zod contract 一致 | ✅ | §2-§6 全部 import E-P0-09 Zod schemas |
| 2 | 幂等性（client_key） | ✅ | §2.4 (200 replay) + §2.5 (409 conflict) |
| 3 | EXIF 剥离触发（commit 后 async sharp） | ✅ | §4.6 step 8 + state-machine §3.4 |
| 4 | 错误码与 E-P0-09 error-code-dict 一致 | ✅ | §2.5 / §3.5 / §4.5 / §5.5 / §6.5 |
| 5 | 限流 5/h/IP（create）+ 60/h/IP（其他） | ✅ | §2.2 / §3.2 / §4.2 / §5.2 |
| 6 | performance budget（p50 / p95） | ✅ | §8 |
| 7 | 权限分层（anon + moderator JWT） | ✅ | §2.2 / §6.2 |
| 8 | 不在公共 API 输出精确位置 | ✅ | §5.4 + §5.6 strict 校验 |
| 9 | 与 D-P0-02 LOCKED 6 段流程对齐 | ✅ | §9 |
| 10 | 不修改 D-P0-02 LOCKED 组件 | ✅ | 仅服务端 API |

---

**End of endpoints-v1.md · E-P0-03 子产物 4/7**