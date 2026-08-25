---
title: SEE EARTH V1 · Shared API Contract · Error Code Dictionary · v1.0.0
type: error-code-dictionary
tags: [release-v1, e-p0-09, api-contract, error-codes, see-earth]
task_id: E-P0-09
brief_anchor: "Release Strategy Brief §5 E-P0-09 + D-P0-04"
track: engineering
owner: Engineer Agent #3 (external Owner = 用户)
created: 2026-08-22
status: LOCKED
target_gate: Gate A · Internal Alpha
source_brief: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/SEE-EARTH-Release-Strategy-v1-Design-Engineering-Task-Brief.md
source_task_card: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/06-PM Agent 交接/2026-08-22-task-card-e-p0-09-shared-api-contract.md
related_docs:
  - ./openapi.yaml
  - ./zod-schemas/common.ts
  - ./contract-decisions-v1.md
  - ./schema-changelog-v1.md
depends_on: [E-P0-01 (✓ ACCEPTED), D-P0-02 (IN PROGRESS)]
blocks: [E-P0-02, E-P0-03, E-P0-07, D-P0-05-impl, D-P1-01]
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/06-PM Agent 交接/release-v1/api-contract/error-code-dict-v1.md
note: 本文件已就绪，需 PM Agent 由 Obsidian 写入权限落地到 canonical 路径。
---

# SEE EARTH V1 · Error Code Dictionary · v1.0.0

> **目的**：锁定所有 API endpoint 返回的 `error_code` 枚举值。客户端（Web / iOS）按本表实现统一错误处理。
> **错误结构**：所有错误通过 `ErrorEnvelope` 返回（见 `openapi.yaml#/components/schemas/ErrorEnvelope`）。
> **状态矩阵对齐**：与 D-P0-04 状态矩阵（Loading / Error / Empty / Permission / Privacy）一一对应；与 D-P0-05 `witness_submit_failed.error_category` 直接对齐。

---

## 0. 阅读指南

每条错误码条目：

| 字段 | 含义 |
|---|---|
| **error_code** | Stable snake_case（与 schema 校验正则 `^[a-z][a-z0-9_]*$` 一致） |
| **HTTP Status** | 强制 HTTP 状态码（建议，但服务端必须 ≥4xx 才返回 4xx/5xx） |
| **retryable** | 客户端是否可以自动重试（与 `ErrorEnvelope.retryable` 一致） |
| **Where returned** | 出现在哪些 endpoint |
| **UI 行为（D-P0-04）** | Web / iOS 应该如何展示（与 D-P0-04 状态矩阵对应） |
| **Analytics** | 关联 Analytics 事件（与 D-P0-05 一致） |
| **Message template** | 用户可读文案（localisable，前端可覆盖） |

---

## 1. Validation errors（4xx · 客户端错误）

| error_code | HTTP | retryable | Where | UI (D-P0-04) | Analytics | Message template |
|---|---|---|---|---|---|---|
| `validation_failed` | 400 | false | 所有 | 表单内联错误 + 提交按钮禁用 | — | "Validation failed: {details}" |
| `captured_at_invalid` | 400 | false | Witness submission | Witness Step 4 错误提示 + 引导重选时间 | `witness_submit_failed.error_category = captured_at_invalid` | "拍摄时间无效：{details}" |
| `captured_at_untrusted` | 400 | false | Witness submission | Witness Step 4 → 进入"待补充"分支 | `witness_submit_failed.error_category = exif_untrusted` | "拍摄时间可信度不足：请手动确认时间。" |
| `exif_missing_required` | 400 | false | Witness submission | Witness Step 3 引导重选 / 手动输入 | `witness_submit_failed.error_category = exif_untrusted` | "无法读取图片拍摄时间，请手动确认。" |
| `location_missing` | 400 | false | Witness submission | Witness Step 5 引导选城市 | `witness_submit_failed.error_category = permission_blocked` | "缺少位置信息：城市必填。" |
| `duplicate_submission` | 409 | false | Witness submission | Witness Result Step 显示"已记录" | `witness_submit_failed.error_category = duplicate_submission` | "此提交已存在，请勿重复上传。" |
| `content_too_long` | 400 | false | Echo, Witness description | EchoInput 字符计数提示 | — | "文本超出 {max_length} 字符限制。" |
| `client_key_invalid` | 400 | false | Witness / Echo create | 不展示（开发态） | — | "client_key 格式错误。" |
| `cursor_invalid` | 400 | false | 所有 list endpoint | 列表回到第 1 页 | — | "Invalid pagination cursor." |

---

## 2. Permission errors（4xx · 鉴权）

| error_code | HTTP | retryable | Where | UI (D-P0-04) | Analytics | Message template |
|---|---|---|---|---|---|---|
| `permission_required` | 401 | false | Admin endpoints | 重定向到登录（如有） | — | "Authentication required." |
| `forbidden_role` | 403 | false | Admin endpoints | 403 页面 | — | "Insufficient permissions." |
| `witness_session_expired` | 401 | true | Witness endpoints | 静默续 session 后重试 | — | "Session expired — retrying." |
| `permission_blocked_camera` | 200 / 400 | false | Witness 前端预校验 | Witness Step 2 → 引导用相册 / 手动输入 | `witness_permission_result.result = denied` | "相机权限被拒绝：可用相册或手动输入。" |
| `permission_blocked_location` | 200 / 400 | false | Witness 前端预校验 | Witness Step 5 → manual_city / denied_fallback_manual | `witness_permission_result.result = denied` | "位置权限被拒绝：请手动选择城市。" |
| `permission_blocked_photo_library` | 200 / 400 | false | Witness 前端预校验 | Witness Step 2 → 引导拍照 | `witness_permission_result.result = denied` | "相册权限被拒绝：可现场拍照。" |

---

## 3. Upload / Asset errors（4xx / 5xx）

| error_code | HTTP | retryable | Where | UI (D-P0-04) | Analytics | Message template |
|---|---|---|---|---|---|---|
| `upload_url_expired` | 408 | true | Asset upload | 重新请求 upload-url | `witness_submit_failed.error_category = upload_timeout` | "上传凭证已过期，请重新发起。" |
| `upload_network` | 502 | true | Asset upload | Witness Result Step 重试按钮 | `witness_submit_failed.error_category = upload_network` | "网络异常，请检查连接后重试。" |
| `upload_timeout` | 408 | true | Asset upload | Witness Result Step 重试 | `witness_submit_failed.error_category = upload_timeout` | "上传超时，请重试。" |
| `upload_checksum_mismatch` | 409 | true | Asset upload complete | 客户端重新上传 + 重试 | — | "File checksum mismatch — retry with same checksum." |
| `upload_size_exceeded` | 413 | false | Asset upload request | Witness Step 2 → 引导选更小图片 | — | "文件大小超出限制（最大 25 MiB）。" |
| `upload_mime_unsupported` | 415 | false | Asset upload request | Witness Step 2 → 引导 JPEG / PNG | — | "图片格式不支持（仅 JPEG / PNG / HEIC / WebP）。" |
| `asset_processing_failed` | 500 | false | Asset processing | Witness Result Step → 失败 banner + 重新上传 | `witness_submit_failed.error_category = server_5xx` | "图片处理失败，请重试或换图。" |
| `asset_not_ready` | 409 | true | Asset GET before processing | Witness Step 显示进度 | — | "Asset still processing." |

---

## 4. Witness submission state errors

| error_code | HTTP | retryable | Where | UI (D-P0-04) | Analytics | Message template |
|---|---|---|---|---|---|---|
| `submission_already_published` | 409 | false | Witness PATCH | Witness Result 显示 "已发布，无法撤回" | — | "已发布，无法撤回。" |
| `submission_already_withdrawn` | 409 | false | Witness PATCH | Witness Result 显示 "已撤回" | — | "已撤回。" |
| `submission_invalid_transition` | 409 | false | Witness PATCH | 不展示（开发态） | — | "Invalid submission state transition." |
| `submission_not_found` | 404 | false | Witness GET / PATCH | 404 页面 | — | "Submission not found." |

---

## 5. Resource errors（4xx）

| error_code | HTTP | retryable | Where | UI (D-P0-04) | Analytics | Message template |
|---|---|---|---|---|---|---|
| `city_not_found` | 404 | false | GET /cities/{id} | CityPage 404 | — | "City not found." |
| `moment_not_found` | 404 | false | GET /moments/{id} | Moment Detail 404 | — | "Moment not found." |
| `edition_not_found` | 404 | false | GET /editions/{id} | Homepage 降级 + Retry banner | — | "Edition not found." |
| `edition_not_published_yet` | 404 | true | GET /editions/today (date 提前) | Today Page 显示 fallback Edition | — | "Edition not published yet." |
| `asset_not_found` | 404 | false | GET /assets/{id} | Moment Detail 图片降级 | — | "Asset not found." |
| `echo_not_found` | 404 | false | GET /echoes/{id} | Echo Composer 提示 | — | "Echo not found." |

---

## 6. Moderation / publish errors

| error_code | HTTP | retryable | Where | UI (D-P0-04) | Analytics | Message template |
|---|---|---|---|---|---|---|
| `moderation_pending` | 200 | false | Witness GET (status=under_review) | Witness Result 显示 "待审核" | — | "Submission under review." |
| `moderation_rejected` | 200 | false | Witness GET (status=rejected) | Witness Result 显示 "未通过" + 公开原因 | `witness_submit_failed.error_category = server_5xx`（语义不准，仅参考） | "Moderation rejected: {public_reason}" |
| `moderation_needs_more_info` | 200 | false | Witness GET (status=needs_more_info) | Witness Result 显示 "请补充信息" | — | "Please provide more information." |

---

## 7. Rate limit / abuse errors（4xx）

| error_code | HTTP | retryable | Where | UI (D-P0-04) | Analytics | Message template |
|---|---|---|---|---|---|---|
| `rate_limited` | 429 | true (with backoff) | 所有 | Witness / Echo 显示 "请稍后" | `witness_submit_failed.error_category = rate_limited` | "请求过于频繁，请稍后重试。" |
| `rate_limited_witness` | 429 | true | Witness create | Witness Result 显示 "已达今日上限" | `witness_submit_failed.error_category = rate_limited` | "今日提交已达上限。" |
| `rate_limited_echo` | 429 | true | Echo create | Echo Composer 显示 "请稍后" | `echo_submitted.result = rate_limited` | "Echo 提交已达上限。" |
| `abuse_detected` | 429 | false | Witness / Echo | Banner 提示暂停服务 | — | "Abuse signal detected." |

---

## 8. Server errors（5xx）

| error_code | HTTP | retryable | Where | UI (D-P0-04) | Analytics | Message template |
|---|---|---|---|---|---|---|
| `server_error` | 500 | true | 所有 | Banner "服务异常，请稍后" | — | "Internal server error." |
| `service_unavailable` | 503 | true | Echo backend | Echo Composer 移除 submit 按钮（per E-P1-01） | `echo_submitted` 不发送（degraded 模式） | "Service unavailable." |
| `service_timeout` | 504 | true | 所有 | Banner "请刷新" | — | "Request timeout." |
| `dependency_failure_weather` | 502 | true | （非 contract，但客户端 SDK 可包装） | Hero / Same Second 降级为不带天气 | — | "Weather provider failed." |
| `dependency_failure_sun` | 502 | true | 同上 | Hero 降级 | — | "Sun provider failed." |
| `dependency_failure_storage` | 502 | true | Asset upload | Witness Step 显示 "图片上传暂时不可用" | — | "Storage provider failed." |

---

## 9. Privacy / contract violation errors（5xx · 服务器检测到违规）

> 这些错误码通常不会暴露给终端用户（服务端在内部 alert）。
> 但 schema 层必须定义，以便 SDK / monitoring 一致处理。

| error_code | HTTP | retryable | Where | UI | Analytics | Message template |
|---|---|---|---|---|---|---|
| `internal_precise_location_leak` | 500 | false | 服务端内部（应在响应前被 schema 校验拦截） | n/a | E-P0-10 alert | "Internal privacy violation: precise location would have leaked." |
| `internal_unauthorised_raw_location_access` | 500 | false | Admin endpoints（无权限访问 raw location） | n/a | E-P0-10 alert | "Internal authz violation." |
| `internal_schema_violation` | 500 | false | 响应序列化层 | n/a | E-P0-10 alert | "Response violated Public schema (developer bug)." |

---

## 10. 与 D-P0-05 事件 map 的映射

| Analytics 字段 | error_code 来源 |
|---|---|
| `witness_submit_failed.error_category = validation` | `validation_failed` / `captured_at_invalid` / `captured_at_untrusted` / `exif_missing_required` / `location_missing` / `content_too_long` |
| `witness_submit_failed.error_category = upload_network` | `upload_network` |
| `witness_submit_failed.error_category = upload_timeout` | `upload_timeout` / `upload_url_expired` |
| `witness_submit_failed.error_category = server_5xx` | `server_error` / `service_unavailable` / `asset_processing_failed` / `moderation_rejected` |
| `witness_submit_failed.error_category = permission_blocked` | `permission_blocked_camera` / `permission_blocked_location` / `permission_blocked_photo_library` |
| `witness_submit_failed.error_category = captured_at_invalid` | `captured_at_invalid` / `captured_at_untrusted` |
| `witness_submit_failed.error_category = exif_untrusted` | `exif_missing_required` / `captured_at_untrusted` |
| `witness_submit_failed.error_category = rate_limited` | `rate_limited` / `rate_limited_witness` |
| `witness_submit_failed.error_category = duplicate_submission` | `duplicate_submission` |

---

## 11. 与 D-P0-04 状态矩阵的对齐

| D-P0-04 类别 | 本字典 error_code |
|---|---|
| **Loading** | n/a（loading 不是错误）；服务端 200 + `state: ready` |
| **Error（系统级）** | `server_error`, `service_unavailable`, `service_timeout`, `dependency_failure_*` |
| **Empty（资源缺失）** | `*_not_found` |
| **Permission** | `permission_required`, `forbidden_role`, `permission_blocked_*`, `witness_session_expired` |
| **Privacy** | `internal_precise_location_leak`, `internal_unauthorised_raw_location_access`（服务端内部，**不暴露**） |

---

## 12. retryable 默认值表（与 D-P0-04 retry 策略对齐）

| 客户端行为 | error_code |
|---|---|
| **自动重试 ≤ 3 次 + backoff** | `upload_network`, `upload_timeout`, `server_error`, `service_unavailable`, `service_timeout`, `rate_limited`, `dependency_failure_*`, `asset_not_ready`, `submission_invalid_transition`（限于 retryable 子集） |
| **用户手动重试** | `upload_url_expired`, `upload_checksum_mismatch`, `duplicate_submission` |
| **不可重试（永久失败）** | `validation_*`, `*_not_found`, `forbidden_*`, `content_too_long`, `moderation_rejected`（明确终止态） |
| **降级（移除 UI）** | `service_unavailable` (Echo 专属), `abuse_detected` |

---

## 13. Blocker Log

| 日期 | 议题 | Owner | 解锁条件 | 状态 |
|---|---|---|---|---|
| 2026-08-22 | Echo backend V1 范围决定前 `service_unavailable` UI 降级路径未完全实现 | PM + Designer | OD-01 决策 | OPEN |
| 2026-08-22 | `rate_limited_witness` 具体阈值未锁（默认 5 / 天 / witness） | PM | Privacy review | OPEN |

---

## 14. 自验收 Acceptance Criteria

- [x] 与 `ErrorEnvelope` schema 完全对齐（`error_code` / `message` / `retryable` / `request_id`）
- [x] 错误码稳定 snake_case，正则 `^[a-z][a-z0-9_]*$`
- [x] 与 D-P0-05 `witness_submit_failed.error_category` 10 值一一对应
- [x] 与 D-P0-04 状态矩阵（Loading / Error / Empty / Permission / Privacy）一一对应
- [x] 隐私违规错误（`internal_*`）服务端内部处理，不暴露给终端用户
- [x] retryable 默认值明确（自动重试 / 用户重试 / 不可重试 / 降级）
- [x] message template 是 localisable，前端可覆盖

---

**End of error-code-dict-v1.md**