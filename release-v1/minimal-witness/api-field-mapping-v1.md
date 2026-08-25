---
title: SEE EARTH V1 · Minimal Witness Flow · API 字段映射表（前端 → API）
type: design-api-mapping
tags: [release-v1, design, d-p0-02, witness, api, contract, e-p0-09, e-p0-03, see-earth]
task_id: D-P0-02
brief_anchor: §4 D-P0-02 / 任务卡 D 节
track: design
owner: 外部 Designer Owner（您）
created: 2026-08-22
status: IN REVIEW
target_gate: Gate A · Internal Alpha
source_brief: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/SEE-EARTH-Release-Strategy-v1-Design-Engineering-Task-Brief.md
source_task_card: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/06-PM Agent 交接/2026-08-22-task-card-d-p0-02-minimal-witness.md
related_docs:
  - ./flow-diagram-v1.md
  - ./state-matrix-v1.md
  - ./copy-final-v1.md
  - ./prototype-v1.md
  - ../analytics-events/event-map-v1.md §5 (字段名一致性矩阵)
  - ../analytics-events/forbidden-fields-v1.md (禁采清单)
  - ../../05-项目现状/release-v1/backend-reality-audit-v1.md §5.5 (Witness Submission · 当前 MISSING) / §12 B-3 (blocker)
depends_on: [D-P0-01 LOCKED ✓, D-P0-05 ACCEPTED]
blocks: [E-P0-09 临时 contract, E-P0-03 Witness Backend, E-P0-05 位置隔离]
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/07-设计师设计参考/release-v1/minimal-witness/api-field-mapping-v1.md
workspace_canonical_path: /Users/lwy/Documents/ChatGPT/看见地球/release-v1/minimal-witness/api-field-mapping-v1.md
note: 本文件已就绪，需 PM Agent 由 Obsidian 写入权限落地到 canonical 路径。
---

# SEE EARTH V1 · Minimal Witness Flow · API 字段映射表（前端 → API）

> **作者**：Designer Agent #3（外部 Owner = 您）
> **目标读者**：**E-P0-09 共享 API Contract Owner · E-P0-03 Witness Backend Owner · E-P0-05 位置隔离 Owner** / Web 工程师 / iOS 工程师 / QA
> **目的**：把"前端 Witness 流程所需字段"完整映射到"API contract 字段"，**E-P0-09 据此锁 contract**。
> **强制原则**（来自 E-P0-05 + 任务卡 DO NOT）：
> 1. **公开 API 不含精确 GPS / 原始 EXIF / 推断住址** — 仅城市级
> 2. **精确位置进入独立受限字段或存储域** — 与公开域分离
> 3. **埋点不携带禁采字段** — 见 `forbidden-fields-v1.md`
> 4. **不发送 free text 主体** — Echo / Witness 短描述走独立存储，埋点仅携带 mode / 长度等元数据
> 5. **不私自为 iOS 造数据模型** — iOS 字段必须与 Web 共享同一 contract

---

## 0. 阅读指南

- **§1 资源清单**：Witness 流程涉及的所有 API 资源
- **§2 POST /api/witness/submissions 创建草稿**
- **§3 POST /api/witness/submissions/:id/asset-upload-url 获取上传凭证**
- **§4 POST /api/witness/submissions/:id/submit 提交（含完整元数据）**
- **§5 GET /api/witness/submissions/:id 查询状态（V1 session 内 · P1 通知）**
- **§6 公共 API 返回字段（不含精确位置）**
- **§7 后台受限 API（仅 moderator · 含精确位置）**
- **§8 字段缺口标注（必须 E-P0-09 锁定的字段）**
- **§9 iOS 与 Web 字段差异（必须共享 contract · 禁止 iOS 私造）**
- **§10 埋点 payload 字段映射（与 event-map-v1.md §5 对齐）**

---

## §1 资源清单（Witness 流程涉及的 API）

| # | 方法 | 路径 | 用途 | 鉴权 | 频率 |
|---|---|---|---|---|---|
| 1 | POST | `/api/witness/submissions` | 创建草稿 submission | 匿名（rate limited） | 1 次 / session |
| 2 | GET | `/api/witness/submissions/:id` | 查询 submission 状态 | 匿名（仅本人 session） | ≤ 3 次 / session |
| 3 | POST | `/api/witness/submissions/:id/asset-upload-url` | 获取上传凭证 | 匿名 | 1 次 / submission |
| 4 | POST | `/api/witness/submissions/:id/submit` | 提交元数据 + 触发审核 | 匿名 | 1 次 / submission |
| 5 | GET | `/api/cities` | 城市列表（手动选择用） | 公开 | 1 次 / session |
| 6 | GET | `/api/cities/:cityId` | 城市详情（含时区） | 公开 | 按需 |

> **资源命名规则**：snake_case；单数；`/api/witness/` 前缀
> **幂等键**：`Idempotency-Key: <uuid-v4>` header（V1 必填 · E-P0-09 锁）

---

## §2 POST /api/witness/submissions（创建草稿）

### 2.1 Request

| 前端字段 | API 字段 | 类型 | 必填 | 说明 | 埋点关联 |
|---|---|---|:---:|---|---|
| `witness.entry_point` | `entry_point` | enum | ✓ | 入口来源：`daily12_fab` / `city_detail` / `homepage_fab` / `share_link` / `deeplink` | 写入 `witness_started.entry_point` |
| `witness.app_surface` | `app_surface` | enum | ✓ | 入口形态：`web_homepage` / `web_today_refresh` / `ios_today` 等 | — |
| — | `idempotency_key` | uuid-v4 (header) | ✓ | 客户端生成，保证创建幂等 | — |

### 2.2 Response (201)

| API 字段 | 类型 | 说明 | 前端使用 |
|---|---|---|---|
| `submission_id` | string (uuid-v4) | 服务端生成，全局唯一 | 写入后续请求 URL · `witness_submitted.submission_id_hash` |
| `upload_url_ttl_seconds` | int | 上传凭证有效期 | 客户端显示剩余时间 |
| `status` | enum | `draft` | 显示"草稿已创建" |
| `created_at` | ISO 8601 string (UTC) | 服务端创建时间 | 内部使用（不发埋点） |

### 2.3 错误

| HTTP | code | 含义 | 前端处理 |
|---|---|---|---|
| 400 | `validation_failed` | 字段缺失或类型错误 | 提示用户"提交出错，请重试" |
| 429 | `rate_limited` | 限流 | 显示"请稍后再试" + Retry-After |

> **V1 缺口**（E-P0-09 必锁）：`entry_point` / `app_surface` 枚举值需 E-P0-09 与 `event-map-v1.md` 同步锁。

---

## §3 POST /api/witness/submissions/:id/asset-upload-url（获取上传凭证）

### 3.1 Request

| 前端字段 | API 字段 | 类型 | 必填 | 说明 |
|---|---|---|:---:|---|
| — | `submission_id` (path) | string | ✓ | §2 返回的 id |
| `media.file_size_bytes` | `file_size_bytes` | int (≤ 25MB) | ✓ | 文件大小（前端测算） |
| `media.mime_type` | `mime_type` | enum | ✓ | `image/jpeg` / `image/png` / `image/heic` |
| `media.source` | `media_source` | enum | ✓ | `camera` / `photo_library`（来自 §1.1/§1.2 权限结果） |
| — | `idempotency_key` | uuid-v4 (header) | ✓ | — |

### 3.2 Response (201)

| API 字段 | 类型 | 说明 | 前端使用 |
|---|---|---|---|
| `upload_url` | string (https) | 短期 PUT 凭证（≤ 15min 过期） | fetch PUT 上传 |
| `upload_url_expires_at` | ISO 8601 string | 过期时间 | 显示倒计时 |
| `asset_id` | string (uuid-v4) | 服务端分配 asset 标识 | 内部使用 |
| `max_bytes` | int | 服务端硬上限 | 前端校验 |

### 3.3 错误

| HTTP | code | 含义 | 前端处理 |
|---|---|---|---|
| 400 | `file_too_large` | 超过 25MB | "图片过大；请压缩后再试" |
| 400 | `unsupported_mime` | 类型不支持 | "暂不支持此图片格式" |
| 404 | `submission_not_found` | 草稿不存在 | 提示用户"请重新开始" |
| 410 | `submission_expired` | 草稿过期（> 24h） | "草稿已过期；请重新提交" |

> **V1 缺口**（E-P0-09 必锁）：
> - `mime_type` 完整枚举（建议 `image/jpeg` / `image/png` / `image/heic` / `image/webp`）
> - `media_source` 枚举（与 `event-map §4.3 witness_upload_started.media_type` 对齐）
> - 上传 URL TTL 长度（建议 15 分钟）
> - 文件大小上限（V1 建议 25MB）
> - 草稿保留时长（V1 建议 24h；与 state-matrix §3.6 草稿保留一致）

---

## §4 POST /api/witness/submissions/:id/submit（最终提交）

### 4.1 Request

| 前端字段 | API 字段 | 类型 | 必填 | 说明 | 禁采检查 |
|---|---|---|:---:|---|---|
| **核心字段** |||||
| `submission_id` | `submission_id` (path) | string | ✓ | — | — |
| `captured_at.iso` | `captured_at` | ISO 8601 string (UTC) | ✓ | 拍摄时间 | 客户端做"未来时间"硬阻塞 |
| `captured_at.source` | `captured_at_source` | enum | ✓ | `exif` / `user_confirmed` / `admin` | — |
| `captured_at.confidence` | `captured_at_confidence` | enum | ✓ | `high` / `medium` / `low` / `manual` | — |
| `captured_at.tz_offset_minutes` | `captured_at_tz_offset` | int (e.g., +480) | ✓ | 拍摄时区偏移（分钟） | — |
| **位置字段** |||||
| `location.city_id` | `city_id` | string | ✓ | 城市 ID（Seed 12 城内） | 公开字段 |
| `location.city_source` | `city_source` | enum | ✓ | `gps_reverse` / `user_selected` / `inferred` | — |
| `location.mode` | `location_mode` | enum | ✓ | `auto_gps_city` / `manual_city` / `denied_fallback_manual` | 写入 `witness_submitted.location_mode` |
| — | `precise_lat` | number (float) | ❌ | **仅当 location.mode = auto_gps_city** | 🔒 **后台受限字段**；公共 API 不返回 |
| — | `precise_lng` | number (float) | ❌ | **仅当 location.mode = auto_gps_city** | 🔒 **后台受限字段** |
| — | `accuracy_meters` | number (int) | ❌ | **仅当 location.mode = auto_gps_city** | 🔒 **后台受限字段**；Analytics 不携带 |
| **描述字段** |||||
| `description.text` | `description` | string (≤ 280 chars) | ❌ | 短描述（可选） | 写入独立字段；埋点仅携带长度 |
| `description.char_count` | — | — | — | 前端用，**不发送** | 埋点禁采 free text 主体 |
| **媒体字段** |||||
| `media.asset_id` | `asset_id` | string (uuid-v4) | ✓ | 来自 §3 上传凭证响应 | — |
| `media.mime_type` | `mime_type` | enum | ✓ | `image/jpeg` / `image/png` / `image/heic` | — |
| `media.exif_stripped` | `exif_stripped` | bool | ✓ | **必须 true**（前端上传前剥离 EXIF） | — |
| — | `raw_exif` | object | ❌ | **不发送**（前端剥离） | 🔒 **禁采**（forbidden-fields F-06~F-11） |
| **客户端元数据** |||||
| `client.app_surface` | `app_surface` | enum | ✓ | `web_homepage` 等 | — |
| `client.locale` | `locale` | enum | ✓ | `zh-CN` / `en` | — |
| `client.user_agent_class` | `user_agent_class` | enum | ✓ | `desktop_chrome` / `desktop_safari` / `mobile_chrome` / `mobile_safari` / `ios_app` | **不发送完整 UA**（F-25 禁采） |
| — | `idempotency_key` | uuid-v4 (header) | ✓ | — | — |

### 4.2 Response (200 / 201)

| API 字段 | 类型 | 说明 | 前端使用 |
|---|---|---|---|
| `submission_id` | string | 同 §2 | — |
| `status` | enum | `submitted` / `under_review`（V1 暂不区分，合并） | 段 6b 成功卡片 |
| `submitted_at` | ISO 8601 string (UTC) | 服务端受理时间 | 内部使用（不发埋点） |
| `public_preview` | object | 公开预览（仅 city + captured_at + description + thumbnail_url） | 段 5 预览确认（不显示 GPS） |

### 4.3 public_preview 字段（公共 API 唯一可携带位置字段）

| API 字段 | 类型 | 说明 | 禁采检查 |
|---|---|---|---|
| `public_preview.city_id` | string | 城市 ID | ✅ 可用 |
| `public_preview.city_display` | string (i18n) | 城市展示名（如 "Kyoto" / "京都"） | ✅ 可用 |
| `public_preview.country_code` | string (ISO 3166-1 alpha-2) | 国家代码（如 "JP"） | ✅ 可用（粗粒度） |
| `public_preview.country_display` | string (i18n) | 国家展示名 | ✅ 可用 |
| `public_preview.captured_at` | ISO 8601 string (UTC) | 拍摄时间 | ✅ 可用（精确到分钟） |
| `public_preview.captured_at_local` | string | 当地显示时间（i18n） | ✅ 可用 |
| `public_preview.description` | string (≤ 280 chars) | 短描述 | ✅ 可用（moderated） |
| `public_preview.thumbnail_url` | string (CDN https) | 缩略图 URL（已剥离 EXIF） | ✅ 可用 |
| — | `precise_lat` | — | ❌ **不返回** |
| — | `precise_lng` | — | ❌ **不返回** |
| — | `accuracy_meters` | — | ❌ **不返回** |
| — | `country_region` | — | ❌ **不返回**（避免推断城市以下区域） |
| — | `timezone_offset` | — | ⚠️ **不返回**（与 location 关联，可能被反查） |
| — | `street_address` | — | ❌ **不返回**（不存在字段） |

### 4.4 错误

| HTTP | code | 含义 | 前端处理 | 埋点 error_category |
|---|---|---|---|---|
| 400 | `validation_failed` | 字段缺失 / 类型错误 | 提示用户 | `validation` |
| 400 | `captured_at_in_future` | 拍摄时间在未来 | 提示用户改时间 | `captured_at_invalid` |
| 400 | `exif_untrusted` | EXIF 不可信且未确认 | 提示用户 | `exif_untrusted` |
| 400 | `unsupported_mime` | 类型不支持 | 提示用户 | `validation` |
| 400 | `file_too_large` | 文件过大 | 提示用户 | `validation` |
| 401 | `unauthorized` | 鉴权失败（V1 应为匿名，不应出现） | 重试 + 反馈 | `server_5xx` |
| 404 | `submission_not_found` | 草稿不存在 | 重新创建 | `validation` |
| 410 | `submission_expired` | 草稿过期 | 重新创建 | `validation` |
| 422 | `exif_contains_gps` | EXIF 包含 GPS（未剥离） | 提示用户重选图 | `permission_blocked` |
| 429 | `rate_limited` | 限流 | 显示 Retry-After | `rate_limited` |
| 5xx | `server_error` | 服务端错误 | 重试 | `server_5xx` |
| 504 | `upload_timeout` | 上传超时 | 重试 | `upload_timeout` |

> **V1 缺口**（E-P0-09 必锁）：
> - `captured_at_confidence` 完整枚举（`high` / `medium` / `low` / `manual`）
> - `city_source` 完整枚举（`gps_reverse` / `user_selected` / `inferred`）
> - `location_mode` 完整枚举（与 `event-map §4.4 location_mode` 同步）
> - 错误码完整列表（11 个已列）
> - `user_agent_class` 枚举（建议 `desktop_chrome` / `desktop_safari` / `desktop_firefox` / `mobile_chrome` / `mobile_safari` / `ios_app` / `android_web` / `unknown`）

---

## §5 GET /api/witness/submissions/:id（查询状态 · V1 session 内）

### 5.1 Request

| 前端字段 | API 字段 | 类型 | 必填 | 说明 |
|---|---|---|:---:|---|
| — | `submission_id` (path) | string | ✓ | — |

### 5.2 Response (200)

| API 字段 | 类型 | 说明 | 前端使用 |
|---|---|---|---|
| `submission_id` | string | — | — |
| `status` | enum | `draft` / `submitted` / `under_review` / `published` / `rejected` / `needs_more_info` / `withdrawn` / `failed` / `expired` | 段 6b 状态判断 |
| `submitted_at` | ISO 8601 string | 受理时间 | — |
| `moderation_result` | object? | `published` / `rejected` 时存在 | 段 6b 文案 |
| `moderation_result.moment_id` | string? | 已发布时返回，链向 City Page | 段 6b"看城市" CTA |
| `moderation_result.reason_code` | enum? | 未通过时返回 | 段 6b 拒绝文案 |
| `moderation_result.question_code` | enum? | 需补充信息时返回 | 段 6b 补充信息 CTA |

> **V1 session 内限制**：仅当 session 内存有 `submission_id` 时可查询；其他用户不可见（无账户）。
> **P1 通知**：账户系统上线后，moderation_result 改为 `my_submissions` API 拉取。

### 5.3 错误

| HTTP | code | 含义 | 前端处理 |
|---|---|---|---|
| 404 | `submission_not_found` | 不存在或 session 不匹配 | 重新创建 |
| 410 | `submission_expired` | 草稿过期 | 重新创建 |

> **V1 缺口**（E-P0-09 必锁）：
> - `status` 完整枚举（9 个已列）
> - `reason_code` 完整枚举（与 state-matrix §4.3 一致：`unsafe_content` / `low_quality` / `wrong_location` / `not_a_moment` / `other`）
> - `question_code` 完整枚举（待 E-P0-03 业务定义）

---

## §6 公共 API 返回字段总览（不含精确位置）

> **强制规则**：所有**公共** endpoint（任何用户 / 匿名 / 搜索索引 / 缓存）**不得**返回以下字段：
> - `precise_lat` / `precise_lng` / `accuracy_meters`
> - 任何 GeoJSON / place_id
> - 原始 EXIF 对象
> - `country_region` / `street_address` / 任何可推断住址的字段

| 公共字段 | 来源 | 类型 | 是否必返回 |
|---|---|---|:---:|
| `submission_id` | §2 / §4 / §5 | string | ✓ |
| `status` | §5 | enum | ✓ |
| `public_preview.city_id` | §4.3 | string | ✓ |
| `public_preview.city_display` | §4.3 | string (i18n) | ✓ |
| `public_preview.country_code` | §4.3 | string | ✓ |
| `public_preview.captured_at` | §4.3 | ISO 8601 | ✓ |
| `public_preview.captured_at_local` | §4.3 | string (i18n) | ✓ |
| `public_preview.description` | §4.3 | string (≤ 280) | when present |
| `public_preview.thumbnail_url` | §4.3 | string (CDN) | ✓ |
| `moderation_result.moment_id` | §5.2 | string? | when published |
| `submitted_at` | §4.2 / §5.2 | ISO 8601 | ✓ |

> **Privacy leak test**（每个 Gate 前必跑）：抓取所有公共 endpoint payload，扫描 `lat` / `lng` / `latitude` / `longitude` / `accuracy` / `exif` / `place_id` 等字段，命中数 = 0。

---

## §7 后台受限 API（仅 moderator · 含精确位置）

> **仅 E-P0-05 + 内部审核系统可见**；公共 API / 前端 / Analytics 永不接触。

| API | 方法 | 路径 | 鉴权 | 字段 |
|---|---|---|---|---|
| 审核列表 | GET | `/api/admin/witness/submissions?status=under_review` | moderator | 含 `precise_lat` / `precise_lng` |
| 审核详情 | GET | `/api/admin/witness/submissions/:id` | moderator | 含完整 EXIF（剥离后保留 audit） |
| 审核决策 | POST | `/api/admin/witness/submissions/:id/decision` | moderator | `{decision: "approved" \| "rejected" \| "needs_more_info", reason_code?: string, question_code?: string}` |
| 精确位置审计 | GET | `/api/admin/witness/submissions/:id/precise-location` | moderator + audit log | 仅 `precise_lat` / `precise_lng` / `accuracy_meters` |

> **强制规则**（来自 E-P0-05）：
> - 精确位置字段名带 `precise_` 前缀（与公开字段命名区分）
> - 任何 moderator API 调用必须写 audit log
> - 精确位置保留期：V1 建议 90 天（审核完成后定期清理）
> - 撤回 / 删除路径：必须清除精确位置 + 关联原始 EXIF

---

## §8 字段缺口标注（必须 E-P0-09 锁定）

> **以下 24 项必须在 E-P0-09 锁 contract 时确定**；设计师提供建议值。

| # | 字段 / 枚举 | 建议值 | 锁定 owner | 影响范围 |
|---|---|---|---|---|
| 1 | `entry_point` 枚举 | `daily12_fab` / `city_detail` / `homepage_fab` / `share_link` / `deeplink` | E-P0-09 | 段 0 入口埋点 |
| 2 | `app_surface` 枚举 | `web_homepage` / `web_today_refresh` / `ios_today` / `ios_city_detail` / `web_city_detail` | E-P0-09 | 全部事件 |
| 3 | `mime_type` 枚举 | `image/jpeg` / `image/png` / `image/heic` / `image/webp` | E-P0-09 | 媒体上传 |
| 4 | `media_source` 枚举 | `camera` / `photo_library` | E-P0-09 | witness_upload_started |
| 5 | `captured_at_source` 枚举 | `exif` / `user_confirmed` / `admin` | E-P0-09 | 数据可信度 |
| 6 | `captured_at_confidence` 枚举 | `high` / `medium` / `low` / `manual` | E-P0-09 | 数据可信度 |
| 7 | `city_source` 枚举 | `gps_reverse` / `user_selected` / `inferred` | E-P0-09 | 位置来源 |
| 8 | `location_mode` 枚举 | `auto_gps_city` / `manual_city` / `denied_fallback_manual` | E-P0-09 | witness_submitted |
| 9 | `status` 枚举 | `draft` / `submitted` / `under_review` / `published` / `rejected` / `needs_more_info` / `withdrawn` / `failed` / `expired` | E-P0-09 | submission 状态机 |
| 10 | `error_category` 完整枚举 | 9 个（见 §4.4） | E-P0-09 | witness_submit_failed |
| 11 | `moderation.reason_code` 枚举 | `unsafe_content` / `low_quality` / `wrong_location` / `not_a_moment` / `other` | E-P0-09 | 审核结果 |
| 12 | `moderation.question_code` 枚举 | 待 E-P0-03 业务定义（建议 `add_location` / `add_description` / `resubmit_photo`） | E-P0-03 + E-P0-09 | 审核结果 |
| 13 | `user_agent_class` 枚举 | `desktop_chrome` / `desktop_safari` / `desktop_firefox` / `mobile_chrome` / `mobile_safari` / `ios_app` / `android_web` / `unknown` | E-P0-09 | 客户端元数据 |
| 14 | `locale` 枚举 | `zh-CN` / `en`（V1 起步；后续扩展） | E-P0-09 | 客户端元数据 |
| 15 | 上传 URL TTL | 建议 15 分钟 | E-P0-09 | §3 |
| 16 | 文件大小上限 | 建议 25MB | E-P0-09 | §3 |
| 17 | 草稿保留时长 | 建议 24h | E-P0-03 | §3 / §5 |
| 18 | 短描述字符上限 | 建议 280 字 | E-P0-09 | §4 |
| 19 | 精确位置保留期 | 建议 90 天 | E-P0-05 | §7 |
| 20 | 重试次数上限 | 建议 2 自动 + 1 手动 = 3 | E-P0-03 | state-matrix §3.5 |
| 21 | 限流阈值 | 建议 5 submissions / hour / IP | E-P0-03 | §4.4 |
| 22 | 幂等键格式 | uuid-v4 header | E-P0-09 | §2-§4 |
| 23 | 时间格式 | ISO 8601 string (UTC) | E-P0-09 | 全部 |
| 24 | API 资源路径前缀 | `/api/witness/` | E-P0-09 | 全部 |

> **不在 V1 scope**（P1+）：
> - 多语言扩展（V1 仅 zh-CN + en）
> - 视频（V1 仅 photo）
> - 多张照片批量提交（V1 仅 1 张 / submission）

---

## §9 iOS 与 Web 字段差异（必须共享 contract · 禁止 iOS 私造）

> **任务卡强制**："iOS first-pass 原生导航 + Sheet + 权限风格明确，**不复用 Web hover 模式**"
> **Brief 强制**："iOS first-pass 的每个动态字段均能映射，无法映射项已作为 blocker 解决或明确移出 V1"

### 9.1 字段差异

| 维度 | Web | iOS | 是否共享 contract |
|---|---|---|:---:|
| `app_surface` | `web_homepage` / `web_today_refresh` / `web_city_detail` | `ios_today` / `ios_city_detail` / `ios_witness` | ✅ 共享同一枚举 |
| `media_source` | `camera`（input capture） / `photo_library`（input accept） | `camera`（UIImagePickerController） / `photo_library`（PHPickerViewController） / `live_photo` | ✅ 共享（iOS 多了 `live_photo`） |
| `user_agent_class` | `desktop_*` / `mobile_*` | `ios_app` | ✅ 共享 |
| `exif_stripped` | 前端用 `canvas.toBlob()` 重新编码 | iOS 用 `CIContext` 重新渲染 | ✅ 共享同一 contract 字段（`exif_stripped = true`） |
| `precise_lat` / `precise_lng` | `navigator.geolocation` | `CLLocationManager` | ✅ 共享同一 contract 字段 |
| **iOS 独有** | — | `info_plist_usage_descriptions`（`NSCameraUsageDescription` 等） | ❌ **不入 contract**（iOS 客户端配置） |
| **Web 独有** | `navigator.connection.effectiveType`（映射 `network_class`） | — | ❌ **不入 contract**（埋点 SDK 各自实现） |

### 9.2 共享 contract 字段（Web + iOS 一一对应）

| contract 字段 | Web 实现 | iOS 实现 | 是否强制共享 |
|---|---|---|:---:|
| `entry_point` | URL query param + sessionStorage | URL query param + UserDefaults | ✅ |
| `captured_at` | `new Date()` + EXIF reader (exifr.js) | `Date()` + ImageIO (CGImageSource) | ✅ |
| `captured_at_source` | EXIF 字段映射 | EXIF 字段映射 | ✅ |
| `city_id` | Seed 12 城 ID | Seed 12 城 ID | ✅ |
| `precise_lat` | `position.coords.latitude` | `CLLocation.coordinate.latitude` | ✅ |
| `precise_lng` | `position.coords.longitude` | `CLLocation.coordinate.longitude` | ✅ |
| `description` | textarea value | UITextView text | ✅ |
| `asset_id` | `POST /asset-upload-url` 响应 | `POST /asset-upload-url` 响应 | ✅ |
| `mime_type` | file.type | UTIUniformTypeIdentifiers | ✅ |
| `app_surface` | runtime + URL 解析 | runtime + URL 解析 | ✅ |
| `user_agent_class` | UA 解析（仅 class） | 客户端常量 | ✅ |
| `locale` | `navigator.language` | `Locale.current.languageCode` | ✅ |
| `idempotency_key` | `crypto.randomUUID()` | `UUID().uuidString` | ✅ |

> **iOS 禁止行为**：
> - ❌ 不私造 `witness_*` 命名空间字段
> - ❌ 不在 iOS 端转换单位 / 格式（如经纬度用 `.lat` 而不是 `precise_lat`）
> - ❌ 不发送 `info_plist_usage_descriptions` 文本到后端

---

## §10 埋点 payload 字段映射（与 event-map-v1.md §5 对齐）

> **强制原则**：埋点字段名 = contract 字段名（除 `submission_id` 改 8 位 hash）。

| 埋点事件 | 字段 | 来自 contract 字段 | 转换 |
|---|---|---|---|
| `witness_started` | `entry_point` | `submission.entry_point` | 直接 |
| `witness_permission_result` | `permission_type` | enum | 直接 |
| `witness_permission_result` | `result` | enum | 直接 |
| `witness_upload_started` | `media_type` | `media_source` | enum 对应（camera→photo_camera / photo_library→photo_library） |
| `witness_upload_started` | `network_class` | Network Information API / 客户端估算 | 客户端测量 |
| `witness_submitted` | `submission_id` | `submission_id` | **截断 8 位 hash**（F-26 / forbidden-fields §5） |
| `witness_submitted` | `location_mode` | `location_mode` | enum 直接 |
| `witness_submit_failed` | `error_category` | HTTP code → enum 映射 | 客户端映射 |
| `witness_submit_failed` | `retryable` | 客户端判定 + HTTP 状态 | 客户端判定 |

> **字段名一致性矩阵**：与 `event-map-v1.md §5` 完全一致（已对比）。
> **禁采检查**：埋点 SDK 拒绝 `lat` / `lng` / `latitude` / `longitude` / `exif` / `email` / `phone` / UA 串等（见 forbidden-fields §1）。

---

## §11 给 E-P0-09 / E-P0-03 / E-P0-05 的具体请求

### 11.1 给 E-P0-09（共享 API Contract Owner）

1. **锁 §8 表中 24 项缺口字段 / 枚举值 / 数值**。
2. **使用 OpenAPI 3.1 或等价机器可读 schema**（Brief §5 E-P0-09）。
3. **明确字段可空性、枚举、分页、错误结构、时间与位置语义**。
4. **Web 与 iOS 共享同一 domain contract**（§9.2 表中 13 项强制共享字段）；presentation 差异允许，业务真相必须一致。
5. **Contract change policy**：兼容策略 + 变更记录。
6. **Privacy leak test** 进入 E-P0-09 Acceptance Criteria：抓取所有公共 endpoint payload，扫描禁采字段，命中数 = 0。

### 11.2 给 E-P0-03（Minimal Witness Backend Owner）

1. **实现 §2-§5 四个 endpoint** + 完整错误码（§4.4 + §5.3）。
2. **submission 状态机**：`draft → submitted → under_review → published / rejected / needs_more_info / withdrawn / failed / expired`（9 个状态，§8 缺口 9）。
3. **幂等性**：所有创建 / 提交 endpoint 支持 `Idempotency-Key` header（V1 必填）。
4. **EXIF 剥离**：服务端在公开图生成前必须剥离 GPS / camera serial / user comment / software（与 E-P0-05 联动）。
5. **精确位置独立存储**：与公开字段物理或逻辑隔离（E-P0-05 强制）。
6. **重试 + 限流**：客户端重试 ≤ 3 次；服务端 rate limit ≥ 5 / hour / IP。
7. **草稿保留 24h**：过期自动清理 + 释放 asset。
8. **撤回 / 删除路径**：用户撤回或审核拒绝后，必须清除精确位置 + 关联原始 EXIF（E-P0-05 联动）。

### 11.3 给 E-P0-05（位置隔离 Owner）

1. **公共 API / 前端 / Analytics / 搜索索引 / 缓存 / 日志**默认不含 `precise_lat` / `precise_lng` / `accuracy_meters`。
2. **EXIF 公开衍生图必须移除 GPS**（与 E-P0-03 联动）。
3. **后台 moderator 角色**有最小权限 + audit log。
4. **精确位置保留期**：V1 建议 90 天，到期自动清理。
5. **Privacy leak test** 共享给本卡 Acceptance Criteria（每个 Gate 前必跑）。
6. **删除 / 撤回路径**能清除精确位置 + 原始 EXIF。

---

## §12 自验收（任务卡 Acceptance Criteria 6 项 + 强制原则 5 项）

| # | 验收项 | 状态 | 证据 |
|---|---|---|---|
| 1 | 公共 API 不含精确坐标 / 原始 EXIF / 推断住址 | ✅ | §6 公共字段表 + §7 受限字段分离 |
| 2 | 公开预览字段（city_id + city_display + country_code） | ✅ | §4.3 public_preview |
| 3 | 前端字段与 API 字段一一对应 | ✅ | §2-§5 全部 Request 字段映射 |
| 4 | 缺口已标注给 E-P0-09 | ✅ | §8 共 24 项缺口 + 建议值 |
| 5 | iOS 与 Web 共享 contract（13 项强制共享字段） | ✅ | §9.2 字段对照表 |
| 6 | 与 D-P0-05 event-map §5 字段名一致性矩阵对齐 | ✅ | §10 埋点 payload 字段映射 |
| 7 | 不为 iOS 私造数据模型 | ✅ | §9.2 强制共享 · §9.1 列出 2 个 iOS 独有字段但不入 contract |
| 8 | 精确位置与公开域分离 | ✅ | §7 后台受限 API |
| 9 | 草稿 / 提交 / 审核状态机完整 | ✅ | §4.2 / §5.2 status 枚举 |
| 10 | 错误码与 retryable 字段一致 | ✅ | §4.4 + state-matrix §3.3-§3.4 |

---

**End of api-field-mapping-v1.md · D-P0-02 子产物 4/5**
