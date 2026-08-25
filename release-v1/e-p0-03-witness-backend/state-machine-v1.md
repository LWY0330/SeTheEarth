---
title: SEE EARTH V1 · E-P0-03 · Minimal Witness Backend · State Machine · v1
type: engineering-state-machine
tags: [release-v1, e-p0-03, witness-backend, state-machine, transitions, see-earth]
task_id: E-P0-03
brief_anchor: "Release Strategy Brief §5 E-P0-03 §A · 9 状态"
track: engineering
owner: Engineer Agent #4 (external Owner = 用户)
created: 2026-08-24
status: DRAFT · IN REVIEW
target_gate: Gate A · Internal Alpha
source_brief: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/SEE-EARTH-Release-Strategy-v1-Design-Engineering-Task-Brief.md
source_task_card: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/06-PM Agent 交接/2026-08-22-task-card-e-p0-03-minimal-witness-backend.md
related_docs:
  - ./architecture-v1.md
  - ./schema-v1.md
  - ./endpoints-v1.md
  - ./error-handling-v1.md
  - /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/api-contract/zod-schemas/witness-submission.ts
  - /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/api-contract/contract-decisions-v1.md §5
  - /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/07-设计师设计参考/release-v1/minimal-witness/state-matrix-v1.md §4
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/e-p0-03-witness-backend/state-machine-v1.md
workspace_canonical_path: /Users/lwy/Documents/ChatGPT/看见地球/release-v1/e-p0-03-witness-backend/state-machine-v1.md
sync_required: true · sandbox 拒绝写入 Obsidian
---

# SEE EARTH V1 · E-P0-03 · Minimal Witness Backend · State Machine · v1

> **作者**：Engineer Agent #4（外部 Owner = 您）
> **派发时间**：2026-08-24 · Round 4
> **目标**：交付 Witness Submission **9 状态状态机的完整定义**——每个状态转换的触发条件、服务端动作、客户端可见结果、JSONB 状态历史格式、异常处理
> **核心原则**（来自任务卡 §C 强制约束 + Brief §3）：
> 1. **服务端是 source of truth** —— 客户端不持有状态机的真相
> 2. **非法转换必须 reject**（5xx/4xx）—— 不允许静默通过
> 3. **状态历史审计可追溯** —— 所有转换写入 JSONB，含 reason + actor
> 4. **不暴露内部堆栈** —— 错误响应只含 error_code + message + request_id

---

## 0. 阅读指南

- **§1** 9 状态定义 + 与 OpenAPI 8 状态的兼容策略
- **§2** 状态转换表（完整 14 条合法转换）
- **§3** 每个转换的详细规格（触发 / 服务端 / 客户端 / JSONB）
- **§4** 状态历史 JSONB 记录格式
- **§5** 异常处理（每条非法转换的处理）
- **§6** 与前端 D-P0-02 §4 审核状态矩阵的映射

---

## 1. 9 状态定义

### 1.1 状态枚举（任务卡 §A 锁定）

| # | 状态 | 中文 | 进入条件 | 离开条件 | 终态? |
|---|---|---|---|---|:---:|
| 1 | `draft` | 草稿 | `POST /witness/submissions` 创建成功 | upload-url / commit / withdraw | ❌ |
| 2 | `uploading` | 上传中 | `POST /witness/submissions/:id/commit` 接收成功 | sharp 处理完成 / 失败 | ❌ |
| 3 | `uploaded` | 已上传 | sharp 收到 raw image 并验证通过 | EXIF 剥离 + variant 生成完成 | ❌ |
| 4 | `validating` | 验证中 | EXIF 剥离完成 + 公开 variant 已上传 | moderator 领取 / 自动 accept 进入 submitted | ❌ |
| 5 | `submitted` | 已提交 | `validating` 完成（服务端受理） | moderator 领取进入审核 | ❌ |
| 6 | `under_review` | 审核中 | moderator 领取 | moderator 决策（accept/reject） | ❌ |
| 7 | `published` | 已发布 | moderator accept + 进入 Daily 12 | 用户撤回 / 后台撤稿 | ❌ |
| 8 | `rejected` | 已拒绝 | moderator reject | （无） | ✅ 终态 |
| 9 | `withdrawn` | 已撤回 | 用户主动 PATCH withdrawn | （无） | ✅ 终态 |
| 10 | `failed_terminal` | 失败终态 | sharp 不可恢复失败 / 永久 server_5xx | （无） | ✅ 终态 |

> **任务卡 §A 的 9 状态**：draft · uploading · uploaded · validating · submitted · under_review · published · rejected · withdrawn · failed_terminal
> **OpenAPI 8 状态**：draft · uploading · submitted · under_review · published · rejected · withdrawn · failed
> **差异**：
> - 任务卡多出 **`uploaded`**（client PUT 完成，server verify 通过）与 **`validating`**（EXIF 剥离中）两个过渡态
> - 任务卡用 **`failed_terminal`**（终态），OpenAPI 用 `failed`（含瞬时失败 + 终态失败）
> **兼容策略**：DB 层存储 9 状态（包含 uploaded 与 validating）；响应客户端时把 `failed_terminal` 映射回 OpenAPI 的 `failed`（V1.0.1 同步扩展 Zod）

### 1.2 状态机 ASCII 流程图

```text
                          ┌──────────────────┐
                          │                  │
                          ▼                  │
[Entry] ──POST /submissions──► draft ──PATCH withdrawn──► withdrawn ◄──┐
                                       │                             │
                                       │                              │
                                       │ POST /upload-url             │
                                       │ (asset.status=pending_upload)│
                                       ▼                              │
                                  uploading ───(sharp fail)──► failed_terminal
                                       │
                                       │ PUT raw image
                                       │ POST /commit
                                       ▼
                                   uploaded (raw 已上传 + checksum 通过)
                                       │
                                       │ sharp 处理
                                       │ ├─ EXIF 剥离失败 ─► failed_terminal
                                       ▼
                                  validating (EXIF 剥离 + variant 上传)
                                       │
                                       │ 完成 + 入审核队列
                                       ▼
                                  submitted
                                       │
                                       │ moderator 领取
                                       ▼
                                under_review
                                  │   │   │
              accept ────────────┘   │   └──── reject ─► rejected (终)
              reject ────────────────┘
              needs_more_info (V1.1 扩展; V1 不实现)
                                       │
                                       ▼ accept (mod 通过)
                                  published ───PATCH withdrawn──► withdrawn (终)
                                       │
                                       └──── admin 撤稿 (mod 决策)──► rejected

注：withdrawn 是终态，failed_terminal 是终态，rejected 是终态
```

### 1.3 与 OpenAPI / E-P0-09 contract-decisions §5 的差异说明

| 维度 | E-P0-09 §5 OpenAPI 8 态 | E-P0-03 9 态 | 决策 |
|---|---|---|---|
| `draft` | ✅ | ✅ | 一致 |
| `uploading` | ✅ | ✅ | 一致 |
| `uploaded` | ❌（合并到 uploading） | ✅ 新增 | **保留**：server verify 通过但 sharp 未启动的明确窗口（典型 0.5-3s），便于 audit |
| `validating` | ❌（合并到 submitted） | ✅ 新增 | **保留**：EXIF 剥离中（典型 5-30s），客户端 GET 时显示 "图片处理中" |
| `submitted` | ✅ | ✅ | 一致 |
| `under_review` | ✅ | ✅ | 一致 |
| `published` | ✅ | ✅ | 一致 |
| `rejected` | ✅ | ✅ | 一致 |
| `withdrawn` | ✅ | ✅ | 一致 |
| `failed` | ✅（含瞬时+终态） | ❌（拆分） | **拆分**：OpenAPI `failed` 在 E-P0-03 是 `uploading → failed` 瞬时失败（retryable）；`failed_terminal` 是终态（不可重试） |
| `failed_terminal` | ❌ | ✅ 新增 | 详见上 |

**DB schema CHECK 约束**：

```sql
ALTER TABLE witness_submissions
  ADD CONSTRAINT witness_submissions_status_check
  CHECK (status IN (
    'draft','uploading','uploaded','validating','submitted',
    'under_review','published','rejected','withdrawn','failed_terminal'
  ));
```

**API 序列化层映射规则**：

```typescript
function publicStatus(db: WitnessStatus9): WitnessStatus8 {
  switch (db) {
    case 'uploaded':
    case 'validating':
      return 'uploading'; // 客户端视为仍在处理中
    case 'failed_terminal':
      return 'failed';
    default:
      return db as WitnessStatus8;
  }
}
```

> **V1.0.1 增量**：PM + Designer 评审通过后，E-P0-09 OpenAPI 与 Zod 同步扩展为 10 态（含 `uploaded` 与 `failed_terminal`），移除映射层。

---

## 2. 状态转换总表（14 条合法转换）

### 2.1 转换矩阵

| From | To | 触发端点 | 触发条件 | 写历史? |
|---|---|---|---|:---:|
| `(none)` | `draft` | `POST /v1/witness/submissions` | 创建成功 | ✅ |
| `draft` | `uploading` | `POST /v1/witness/submissions/:id/commit` | asset 已上传 + checksum 通过 | ✅ |
| `uploading` | `uploaded` | (sharp worker internal) | sharp 接收到 raw image | ✅ |
| `uploaded` | `validating` | (sharp worker internal) | EXIF 剥离开始 | ✅ |
| `validating` | `submitted` | (sharp worker internal) | EXIF 剥离 + 4 variants 上传 + raw 删除完成 | ✅ |
| `submitted` | `under_review` | `POST /v1/admin/witness/submissions/:id/moderate` (claim) | moderator 领取（V1: auto-assign 在 submitted → under_review 时自动） | ✅ |
| `under_review` | `published` | `POST /v1/admin/witness/submissions/:id/moderate` | moderator accept decision | ✅ |
| `under_review` | `rejected` | `POST /v1/admin/witness/submissions/:id/moderate` | moderator reject decision | ✅ |
| `published` | `withdrawn` | `PATCH /v1/witness/submissions/:id` | witness PATCH withdrawn | ✅ |
| `draft` | `withdrawn` | `PATCH /v1/witness/submissions/:id` | witness PATCH withdrawn | ✅ |
| `uploading` | `failed_terminal` | (sharp worker exception) | sharp 处理抛不可恢复异常 | ✅ |
| `validating` | `failed_terminal` | (sharp worker exception) | EXIF 剥离 / variant 上传抛异常 | ✅ |
| `submitted` | `failed_terminal` | (server internal) | moderator 决策时检测到服务端数据损坏 | ✅ |
| `under_review` | `failed_terminal` | (server internal) | moderator 决策后写入失败 | ✅ |

### 2.2 ALLOWED_TRANSITIONS（Zod / 服务端运行时用）

```typescript
// 与 E-P0-09 contract-decisions §5 ALLOWED_TRANSITIONS 扩展
export const ALLOWED_TRANSITIONS_9: Readonly<
  Record<WitnessStatus9, ReadonlyArray<WitnessStatus9>>
> = Object.freeze({
  draft:            ['uploading', 'withdrawn'],
  uploading:        ['uploaded', 'failed_terminal'],
  uploaded:         ['validating', 'failed_terminal'],
  validating:       ['submitted', 'failed_terminal'],
  submitted:        ['under_review', 'failed_terminal'],
  under_review:     ['published', 'rejected', 'failed_terminal'],
  published:        ['withdrawn', 'rejected'],
  rejected:         [], // 终态
  withdrawn:        [], // 终态
  failed_terminal:  [], // 终态
});
```

### 2.3 非法转换处理（来自任务卡 §C 强制约束）

**服务端行为**：
- 收到非法转换请求（如 `PATCH withdrawn` on `published`）→ 返回 409 `submission_invalid_transition`
- 错误响应包含当前 status + 期望 transitions 列表（**仅在 dev mode**；生产隐藏）
- 写 alert 到 Sentry（E-P0-10 监控）

**客户端行为**（与 D-P0-05 event-map §3 `submission_invalid_transition` 一致）：
- 视为不可重试错误 → 显示"提交失败" + 错误 ID
- 不发 `witness_submit_failed`（**不发**，因为这是客户端 bug 而非用户错误）

---

## 3. 每个转换的详细规格

### 3.1 `(none) → draft`

| 维度 | 规格 |
|---|---|
| **触发端点** | `POST /v1/witness/submissions` |
| **触发条件** | Zod `CreateWitnessSubmissionSchema` 校验通过 + 限流未命中 + `client_key` 唯一（无重复） |
| **服务端动作** | 1. `INSERT INTO witness_submissions (id=uuid_v4, client_key, status='draft', ...)`<br>2. 若 `location.precise` 存在 → `INSERT INTO private_locations (submission_id, latitude, longitude, accuracy_meters, source='gps', retention_until=NOW()+90 days)`<br>3. `INSERT INTO status_history (transition={from:null, to:'draft', at:NOW(), reason:'submission_created'})` (作为第一条历史)<br>4. 写 witness_id cookie（如不存在）<br>5. 返回 201 + PublicWitnessSubmission |
| **幂等** | 若 `client_key` 已存在 → 返回 200 + 已存在 record（idempotent replay） |
| **客户端可见结果** | 201/200 · status=draft · submission_id 返回 |
| **JSONB 历史记录** | `[{from: null, to: 'draft', at: '2026-08-24T12:00:00Z', reason: 'submission_created'}]` |
| **异常处理** | • 400 `validation_failed`（字段缺失 / 类型错误）<br>• 409 `duplicate_submission`（client_key 重复 + payload 不一致）<br>• 429 `rate_limited_witness`<br>• 5xx `server_error` |
| **关联事件** | 服务端 confirm 后，客户端发 `witness_started` (UI event) + `witness_submitted` 不会发（提交未发生）|

### 3.2 `draft → uploading`

| 维度 | 规格 |
|---|---|
| **触发端点** | `POST /v1/witness/submissions/:id/upload-url`（前置） + `POST /v1/witness/submissions/:id/commit`（核心） |
| **触发条件** | • 当前 status = `draft`<br>• asset.status = `uploaded`（commit 验证通过）<br>• Zod 校验通过 |
| **服务端动作** | 1. 校验 status = draft<br>2. 校验 asset.status = uploaded<br>3. `UPDATE witness_submissions SET status='uploading', asset_id=?, submitted_at=NOW()`<br>4. `UPDATE assets SET status='processing', submitted_at=NOW()`<br>5. APPEND status_history `[{from:'draft', to:'uploading', at:NOW(), reason:'asset_committed'}]`<br>6. ENQUEUE sharp job (asset_id, submission_id)<br>7. 返回 200 + AssetEnvelope |
| **客户端可见结果** | 200 · 客户端继续显示 "上传中"（段 6a 进度条到 100%） |
| **JSONB 历史记录** | 追加 `{from: 'draft', to: 'uploading', at: '2026-08-24T12:01:00Z', reason: 'asset_committed'}` |
| **异常处理** | • 400 `validation_failed`<br>• 404 `submission_not_found`<br>• 409 `submission_invalid_transition`（status ≠ draft）<br>• 409 `submission_expired`（> 24h）<br>• 409 `upload_checksum_mismatch`<br>• 5xx `server_error` |
| **关联事件** | 客户端收到 200 后，发 `witness_upload_started`（若未发） + 等待服务端 confirm 进入 validating |

### 3.3 `uploading → uploaded`

| 维度 | 规格 |
|---|---|
| **触发端点** | (internal · sharp worker) |
| **触发条件** | sharp worker 从 Storage `witness-raw` bucket 下载 raw image 成功 + checksum 二次校验通过 |
| **服务端动作** | 1. sharp worker 收到 enqueue 信号<br>3. `GET raw image from witness-raw/{asset_id}`<br>4. SHA-256 二次校验 vs asset.checksum_sha256<br>5. `UPDATE assets SET status='uploaded'` (raw 持久化阶段)<br>6. `UPDATE witness_submissions SET status='uploaded'`<br>7. APPEND status_history |
| **客户端可见结果** | GET 时显示 status=uploading（兼容映射：uploaded → uploading） |
| **JSONB 历史记录** | `{from: 'uploading', to: 'uploaded', at: NOW(), reason: 'raw_verified'}` |
| **异常处理** | • checksum mismatch → asset.status=failed + 5xx `asset_processing_failed` → submission.status=`failed_terminal`<br>• raw 缺失（Storage purged）→ 5xx `asset_not_found` → failed_terminal |
| **客户端可见结果（异常）** | 段 6b 错误卡片 "图片处理失败；请联系反馈" · `witness_submit_failed(retryable=false)` |

### 3.4 `uploaded → validating`

| 维度 | 规格 |
|---|---|
| **触发端点** | (internal · sharp worker) |
| **触发条件** | sharp worker 开始 EXIF 剥离与 variant 生成 |
| **服务端动作** | 1. sharp 执行 `sharp(rawBuffer).rotate().resize(4 sizes).withMetadata({exif:{}}).toBuffer()`<br>2. `UPDATE witness_submissions SET status='validating'`<br>3. APPEND status_history |
| **客户端可见结果** | GET 时显示 status=validating（兼容映射：validating → uploading） |
| **JSONB 历史记录** | `{from: 'uploaded', to: 'validating', at: NOW(), reason: 'exif_stripping_started'}` |
| **异常处理** | • sharp 抛异常 → asset.status=failed + submission.status=`failed_terminal`（详见 §5.3） |

### 3.5 `validating → submitted`

| 维度 | 规格 |
|---|---|
| **触发端点** | (internal · sharp worker) |
| **触发条件** | sharp 完成：4 variants 上传至 `witness-public` bucket + raw image 删除 + asset.variants 数组填入 |
| **服务端动作** | 1. sharp 上传 4 variants → GET public URLs<br>2. sharp DELETE raw from `witness-raw/{asset_id}`<br>3. `UPDATE assets SET status='ready', variants=ARRAY[{variant:'thumb_320',url:'...'}, ...], exif_stripped=true`<br>4. `UPDATE witness_submissions SET status='submitted'`<br>5. APPEND status_history `{from:'validating', to:'submitted', at:NOW(), reason:'exif_stripped_and_published'}`<br>6. **触发客户端可感知事件**：服务端通知（Vercel webhook 或 WebSocket；V1 仅 GET 轮询）|
| **客户端可见结果** | GET 返回 status=submitted · 段 6b 成功卡片 "已提交；进入审核队列" · **客户端收到后发 `witness_submitted` 埋点** |
| **JSONB 历史记录** | `{from: 'validating', to: 'submitted', at: NOW(), reason: 'exif_stripped_and_published', asset_id: '...', variant_count: 4}` |
| **异常处理** | • variant 上传失败 → 重试 3 次（指数退避）→ 仍失败 → failed_terminal<br>• raw 删除失败 → alert 但不阻塞（V1 不强一致）|
| **关键不变量** | • raw 已删除（GDPR/位置隔离强制）<br>• asset.exif_stripped = true<br>• 4 variants 全部存在且可访问 |

### 3.6 `submitted → under_review`

| 维度 | 规格 |
|---|---|
| **触发端点** | `POST /v1/admin/witness/submissions/:id/moderate` (claim 操作) **或** V1 自动转换 |
| **触发条件** | • 当前 status = `submitted`<br>• moderator JWT 有效（带 role: moderator claim）<br>• V1 简化：服务端 cron 每 60 秒扫描 `submitted` 状态 submission，自动 assign 给下一个空闲 moderator（轮询）→ 立即进入 `under_review` |
| **服务端动作** | 1. 校验 moderator 角色<br>2. 校验 status = submitted<br>3. `UPDATE witness_submissions SET status='under_review', reviewed_at=NOW(), reviewed_by=moderator_id`<br>4. APPEND status_history `{from:'submitted', to:'under_review', at:NOW(), reason:'moderator_assigned', moderator_id_hash: '...'}`<br>5. INSERT moderation_log `(actor=moderator_id, target=submission_id, action='assign', before=submitted, after=under_review)`<br>6. 返回 200 |
| **客户端可见结果** | witness 端 GET 返回 status=under_review · 段 6b 卡片 "正在审核"<br>moderator 端 dashboard 显示在 "我的审核队列" |
| **JSONB 历史记录** | `{from: 'submitted', to: 'under_review', at: NOW(), reason: 'moderator_assigned', moderator_id_hash: 'h_abc123...'}` |
| **异常处理** | • 403 `forbidden_role`<br>• 409 `submission_invalid_transition` |
| **关联事件** | 无前端埋点触发（moderator dashboard 独立） |

### 3.7 `under_review → published`

| 维度 | 规格 |
|---|---|
| **触发端点** | `POST /v1/admin/witness/submissions/:id/moderate` (decision: accept) |
| **触发条件** | • 当前 status = `under_review`<br>• moderator 提交 accept 决策<br>• Zod 校验：reason 可选（≤ 256 chars public_reason） |
| **服务端动作** | 1. 校验 moderator 角色<br>2. 校验 status = under_review<br>3. 创建 Moment record（来自 submission fields）：`INSERT INTO moments (city_id, captured_at, captured_at_tz, source_type='witness', asset_id=?, witness_id=?, moderation_status='approved')`<br>4. `UPDATE witness_submissions SET status='published', published_at=NOW(), moderation_result={decision:'accepted', decided_at:NOW(), moment_id:new_moment_id}`<br>5. APPEND status_history `{from:'under_review', to:'published', at:NOW(), reason:'moderator_accepted', moderator_id_hash: '...', moment_id: '...'}`<br>6. INSERT moderation_log `(actor, target, action='publish', before, after, reason)`<br>8. E-P0-06 Daily 12 algorithm 立即可消费（next cron tick）<br>9. 返回 200 + AdminWitnessSubmission |
| **客户端可见结果** | witness 端 GET 返回 status=published · 段 6b 卡片 "已发布" + "看城市" CTA 链向 `/cities/:cityId` |
| **JSONB 历史记录** | `{from: 'under_review', to: 'published', at: NOW(), reason: 'moderator_accepted', moderator_id_hash: '...', moment_id: 'm_...'}` |
| **异常处理** | • 400 `validation_failed`<br>• 403 `forbidden_role`<br>• 409 `submission_invalid_transition`<br>• 5xx `server_error`（DB 写入失败 → 不变更 status，下次重试）|
| **关联事件** | witness 端 GET 200 后，moderator dashboard 发 `moderation_accepted`（内部） |

### 3.8 `under_review → rejected`

| 维度 | 规格 |
|---|---|
| **触发端点** | `POST /v1/admin/witness/submissions/:id/moderate` (decision: reject) |
| **触发条件** | • 当前 status = `under_review`<br>• moderator 提交 reject 决策 + reason_code（枚举）<br>• Zod 校验：reason_code ∈ {`unsafe_content`, `low_quality`, `wrong_location`, `not_a_moment`, `other`} + public_reason 可选 |
| **服务端动作** | 1. 校验 moderator 角色 + status<br>2. **不创建 Moment record**<br>3. `UPDATE witness_submissions SET status='rejected', moderation_result={decision:'rejected', decided_at:NOW(), reason_code, public_reason}`<br>4. APPEND status_history `{from:'under_review', to:'rejected', at:NOW(), reason:'moderator_rejected', reason_code, moderator_id_hash}`<br>5. INSERT moderation_log<br>6. **触发精准位置清理**：`UPDATE private_locations SET deleted_at=NOW() WHERE submission_id=?`（与 E-P0-05 retention 一致）<br>7. Asset 保留（asset.status=ready）但不入公共搜索索引<br>8. 返回 200 |
| **客户端可见结果** | witness 端 GET 返回 status=rejected + public_reason · 段 6b 卡片 "感谢提交；这次未能通过审核" + 折叠展开 "原因：[public_reason]" |
| **JSONB 历史记录** | `{from: 'under_review', to: 'rejected', at: NOW(), reason: 'moderator_rejected', reason_code: 'unsafe_content', public_reason: '...', moderator_id_hash: '...'}` |
| **异常处理** | • 400 `validation_failed`（reason_code 非法）<br>• 403 `forbidden_role`<br>• 409 `submission_invalid_transition` |
| **强制不变量** | • private_locations.deleted_at 必须更新（GDPR/位置隔离强制）<br>• 不创建 Moment record<br>• public_reason 文案必须 sanitized（不暴露 moderator 身份/内部 note）|

### 3.9 `published → withdrawn`

| 维度 | 规格 |
|---|---|
| **触发端点** | `PATCH /v1/witness/submissions/:id` (status: withdrawn) |
| **触发条件** | • 当前 status = `published`<br>• witness 提交 PATCH withdrawn + client_key（与创建时一致）<br>• V1 session 限制：仅创建时的 witness_id cookie 可 PATCH |
| **服务端动作** | 1. 校验 witness_id cookie 与 submission.witness_id 匹配<br>2. 校验 client_key 一致<br>3. 校验 status = published<br>4. `UPDATE moments SET moderation_status='withdrawn', deleted_at=NOW() WHERE witness_submission_id=?`<br>5. `UPDATE witness_submissions SET status='withdrawn', moderation_result={decision:'withdrawn', decided_at:NOW()}`<br>6. APPEND status_history `{from:'published', to:'withdrawn', at:NOW(), reason:'user_initiated'}`<br>7. **触发精准位置清理**：`UPDATE private_locations SET deleted_at=NOW() WHERE submission_id=?`<br>8. **触发 asset 处理**：asset 保留 30 天（moderator 审计窗口），30 天后 GC<br>9. 返回 200 |
| **客户端可见结果** | witness 端 GET 返回 status=withdrawn · 段 6b 卡片 "已撤回" · **V1 无邮件通知**（与 D-P0-02 §4.2 一致） |
| **JSONB 历史记录** | `{from: 'published', to: 'withdrawn', at: NOW(), reason: 'user_initiated'}` |
| **异常处理** | • 403 `forbidden_role`（witness_id 不匹配）<br>• 409 `submission_already_withdrawn`<br>• 409 `submission_invalid_transition`（status ≠ published）<br>• 409 `client_key_invalid`（撤回时 client_key 必须匹配创建时）|
| **强制不变量** | • private_locations.deleted_at 必须更新<br>• moments.moderation_status='withdrawn'<br>• E-P0-06 Daily 12 立即排除该 moment（next cron tick）|

### 3.10 `draft → withdrawn`（草稿期撤回）

| 维度 | 规格 |
|---|---|
| **触发端点** | `PATCH /v1/witness/submissions/:id` (status: withdrawn) |
| **触发条件** | • 当前 status = `draft`<br>• witness 提交 PATCH withdrawn<br>• V1 session 内（witness_id cookie 匹配） |
| **服务端动作** | 1. 校验 witness_id + status<br>2. **清理关联 asset**（若已上传）：`UPDATE assets SET status='purged', deleted_at=NOW() WHERE submission_id=?`<br>3. **删除 raw image from Storage**（若存在）<br>4. `UPDATE witness_submissions SET status='withdrawn', deleted_at=NOW()`<br>5. **清理精准位置**：`UPDATE private_locations SET deleted_at=NOW() WHERE submission_id=?`<br>6. APPEND status_history<br>7. 返回 200 |
| **客户端可见结果** | witness 端 GET 返回 status=withdrawn（已软删除但 GET 仍返回） |
| **JSONB 历史记录** | `{from: 'draft', to: 'withdrawn', at: NOW(), reason: 'user_initiated'}` |
| **异常处理** | 同 3.9 |

### 3.11 `uploading → failed_terminal`

| 维度 | 规格 |
|---|---|
| **触发端点** | (internal · sharp worker exception handler) |
| **触发条件** | sharp 抛出不可恢复异常（如：corrupt JPEG · unsupported variant · Storage down） |
| **服务端动作** | 1. sharp catch exception → alert Sentry (E-P0-10)<br>2. `UPDATE assets SET status='failed', failure_reason=exception.message`<br>3. `UPDATE witness_submissions SET status='failed_terminal', status_reason='asset_processing_failed: ' + exception.message, deleted_at=NULL`<br>4. **清理 raw image**（避免 Storage 累积）<br>5. APPEND status_history `{from:'uploading', to:'failed_terminal', at:NOW(), reason:'asset_processing_failed', error_category:'server_5xx'}`<br>6. **清理精准位置**：`UPDATE private_locations SET deleted_at=NOW()`<br>7. 返回 5xx 给客户端（**但客户端已 disconnect**——失败由下次 GET 发现） |
| **客户端可见结果** | GET 返回 status=failed_terminal（兼容映射 → OpenAPI failed） · 段 6b 错误卡片 "提交失败；请联系反馈" · `witness_submit_failed(error_category=server_5xx, retryable=false)` |
| **JSONB 历史记录** | `{from: 'uploading', to: 'failed_terminal', at: NOW(), reason: 'asset_processing_failed', error_message: '...', asset_id: '...'}` |
| **异常处理** | • DB 写入失败 → 二次重试 · 仍失败 → alert oncall<br>• Storage 清理失败 → alert 但不阻塞（V1 不强一致 raw 清理） |

### 3.12 `validating → failed_terminal`

同 3.11，触发条件改为 EXIF 剥离 / variant 上传阶段。

### 3.13 `submitted → failed_terminal`

| 维度 | 规格 |
|---|---|
| **触发端点** | (internal · server-side integrity check failure) |
| **触发条件** | moderator 决策时检测到服务端数据损坏（如：city_id 不在 seed 12 城内 · asset 缺失 · private_locations 缺失） |
| **服务端动作** | 1. moderator POST moderate 触发校验失败<br>2. **强制撤稿**：status → failed_terminal<br>3. moderation_result 标记 `error_category=server_5xx`<br>4. alert oncall（数据完整性问题）<br>5. APPEND status_history |
| **客户端可见结果** | witness 端 GET 返回 status=failed_terminal · 段 6b 错误卡片 |
| **强制不变量** | • 必须 alert（数据完整性 = 严重问题）<br>• 不创建 Moment record |

### 3.14 `under_review → failed_terminal`

同 3.13，触发条件改为 moderator 决策后写入失败（如：moments INSERT 失败）。

---

## 4. 状态历史 JSONB 记录格式

### 4.1 `status_history` 字段结构（DB schema）

```typescript
interface StatusTransition {
  from: WitnessStatus9 | null;  // null = 创建
  to: WitnessStatus9;
  at: string;  // ISO 8601 UTC
  reason: string;  // snake_case 枚举
  actor?: {
    type: 'system' | 'witness' | 'moderator';
    id?: string;  // witness_id_hash or moderator_id_hash
  };
  metadata?: {
    asset_id?: string;
    moment_id?: string;
    moderator_id_hash?: string;
    error_message?: string;  // 失败时
    reason_code?: string;    // 拒绝时
    public_reason?: string;  // 拒绝时
    variant_count?: number;  // validating → submitted
  };
}
```

### 4.2 完整 JSONB 示例（成功路径）

```json
{
  "status_history": [
    {
      "from": null,
      "to": "draft",
      "at": "2026-08-24T12:00:00.000Z",
      "reason": "submission_created",
      "actor": { "type": "witness", "id": "w_hash_abc123" }
    },
    {
      "from": "draft",
      "to": "uploading",
      "at": "2026-08-24T12:01:30.000Z",
      "reason": "asset_committed",
      "actor": { "type": "witness", "id": "w_hash_abc123" },
      "metadata": { "asset_id": "a_def456" }
    },
    {
      "from": "uploading",
      "to": "uploaded",
      "at": "2026-08-24T12:01:32.000Z",
      "reason": "raw_verified",
      "actor": { "type": "system" },
      "metadata": { "asset_id": "a_def456" }
    },
    {
      "from": "uploaded",
      "to": "validating",
      "at": "2026-08-24T12:01:33.000Z",
      "reason": "exif_stripping_started",
      "actor": { "type": "system" },
      "metadata": { "asset_id": "a_def456" }
    },
    {
      "from": "validating",
      "to": "submitted",
      "at": "2026-08-24T12:01:55.000Z",
      "reason": "exif_stripped_and_published",
      "actor": { "type": "system" },
      "metadata": { "asset_id": "a_def456", "variant_count": 4 }
    },
    {
      "from": "submitted",
      "to": "under_review",
      "at": "2026-08-24T12:05:00.000Z",
      "reason": "moderator_assigned",
      "actor": { "type": "system" },
      "metadata": { "moderator_id_hash": "m_hash_xyz789" }
    },
    {
      "from": "under_review",
      "to": "published",
      "at": "2026-08-24T12:08:30.000Z",
      "reason": "moderator_accepted",
      "actor": { "type": "moderator", "id": "m_hash_xyz789" },
      "metadata": { "moment_id": "m_ghi012" }
    }
  ]
}
```

### 4.3 完整 JSONB 示例（拒绝路径）

```json
{
  "status_history": [
    { "from": null, "to": "draft", "at": "...", "reason": "submission_created", "actor": {"type":"witness","id":"w_hash_abc123"} },
    { "from": "draft", "to": "uploading", "at": "...", "reason": "asset_committed", "metadata": {"asset_id":"a_def456"} },
    { "from": "uploading", "to": "uploaded", "at": "...", "reason": "raw_verified" },
    { "from": "uploaded", "to": "validating", "at": "...", "reason": "exif_stripping_started" },
    { "from": "validating", "to": "submitted", "at": "...", "reason": "exif_stripped_and_published", "metadata": {"variant_count":4} },
    { "from": "submitted", "to": "under_review", "at": "...", "reason": "moderator_assigned", "metadata": {"moderator_id_hash":"m_hash_xyz789"} },
    {
      "from": "under_review",
      "to": "rejected",
      "at": "2026-08-24T12:09:00.000Z",
      "reason": "moderator_rejected",
      "actor": { "type": "moderator", "id": "m_hash_xyz789" },
      "metadata": {
        "reason_code": "unsafe_content",
        "public_reason": "包含不适宜内容"
      }
    }
  ]
}
```

### 4.4 完整 JSONB 示例（失败终态）

```json
{
  "status_history": [
    { "from": null, "to": "draft", "at": "...", "reason": "submission_created" },
    { "from": "draft", "to": "uploading", "at": "...", "reason": "asset_committed" },
    {
      "from": "uploading",
      "to": "failed_terminal",
      "at": "2026-08-24T12:02:00.000Z",
      "reason": "asset_processing_failed",
      "actor": { "type": "system" },
      "metadata": {
        "error_message": "Input file contains unsupported image format",
        "asset_id": "a_def456"
      }
    }
  ]
}
```

### 4.5 历史保留规则

| 维度 | 规则 |
|---|---|
| **保留期** | 与 submission 同生命周期（soft delete 后 90 天 + GC） |
| **公开 API** | witness GET 仅返回最新 status（不返回 history） |
| **Admin API** | AdminWitnessSubmission 返回 `transitions: StatusTransition[]`（与 E-P0-09 §AdminWitnessSubmissionSchema 一致） |
| **Moderation 决策** | 决策时必须写 `actor.id = moderator_id_hash`（审计追溯） |
| **大小上限** | status_history JSONB ≤ 64KB（CHECK 约束）；超出则 split（V1 不实现） |

---

## 5. 异常处理（5 类非法转换）

### 5.1 非法转换：终态 → 任何状态

| 终态 | 触发 | 拒绝 |
|---|---|---|
| `rejected` | PATCH withdrawn / moderate | 409 `submission_invalid_transition` · 错误响应含 current_status |
| `withdrawn` | PATCH withdrawn again | 409 `submission_already_withdrawn` |
| `failed_terminal` | retry submit | 409 `submission_invalid_transition` |

### 5.2 非法转换：skipping state（如 draft → submitted）

| 触发 | 拒绝 |
|---|---|
| 直接调 commit on draft 但 asset 未上传 | 409 `submission_invalid_transition` 或 400 `asset_not_ready` |
| 直接调 moderate on draft | 409 `submission_invalid_transition` |

### 5.3 Sharp 异常处理（failed_terminal 触发）

```typescript
// Sharp worker exception handler
async function onSharpException(asset_id: string, err: Error): Promise<void> {
  await withTransaction(async (tx) => {
    // 1. Update asset
    await tx.query(
      `UPDATE assets SET status='failed', failure_reason=$1, updated_at=NOW() WHERE id=$2`,
      [err.message.slice(0, 256), asset_id]
    );

    // 2. Find submission
    const sub = await tx.query(
      `SELECT id, witness_id, status FROM witness_submissions WHERE asset_id=$1 AND deleted_at IS NULL`,
      [asset_id]
    );
    if (sub.rows.length === 0) return;

    // 3. Transition to failed_terminal
    await transitionStatus(tx, sub.rows[0].id, sub.rows[0].status, 'failed_terminal', {
      reason: 'asset_processing_failed',
      metadata: { error_message: err.message.slice(0, 256), asset_id }
    });

    // 4. Cleanup precise location
    await tx.query(
      `UPDATE private_locations SET deleted_at=NOW() WHERE submission_id=$1 AND deleted_at IS NULL`,
      [sub.rows[0].id]
    );

    // 5. Cleanup raw image
    await deleteRawImage(asset_id);
  });

  // 6. Alert Sentry (E-P0-10)
  Sentry.captureException(err, { tags: { feature: 'witness', stage: 'sharp_processing' } });
}
```

### 5.4 Moderator 重复审核

| 场景 | 处理 |
|---|---|
| 同一 moderator 重复 decision | 409 `submission_invalid_transition`（status 已是终态）|
| 多个 moderator 并发 decision | DB row-level lock + transaction · 后写者失败 |

### 5.5 网络分区 / 服务不可用

| 场景 | 处理 |
|---|---|
| 服务端 5xx during commit | 客户端 retry · 服务端最终一致（idempotency 保证）|
| 服务端 5xx during moderate | moderator UI 显示错误 + 可重试 |
| Storage 不可用 | asset.status=processing 保持 · Sharp worker 重试 · 仍失败 → failed_terminal |
| Postgres 不可用 | Vercel function 返回 503 `service_unavailable` · 客户端 retry with backoff |

---

## 6. 与 D-P0-02 §4 审核状态矩阵的映射

| D-P0-02 state-matrix §4 状态 | 服务端 status | 客户端 UI 段 6b 文案 |
|---|---|---|
| §4.1 `submitted` | `submitted` | "你的 Moment 已提交" · "我们会审核后决定是否出现在 Daily 12" |
| §4.1 `under_review` | `under_review` | "你的 Moment 正在审核；进入 Daily 12 后你会看到" |
| §4.2 `published` | `published` | "你的 Moment 已发布" · "在 [城市名] 看见它" · CTA "看城市" |
| §4.2 `rejected` | `rejected` | "感谢你的提交；这次未能通过审核" · 折叠原因 · "知道了" |
| §4.2 `needs_more_info` | （V1 不实现） | （V1.1 扩展） |
| §4.2 `withdrawn` | `withdrawn` | "已撤回" |
| §4.3 `failed` | `failed_terminal` | "提交失败：[原因]" · "返回首页" |
| §4.3 `expired` | `expired` (V1 不实现；用 cleanup 后 410 替代) | "提交已过期；请重新提交" |

> **V1 不实现** `needs_more_info`：moderator UI 仅 accept / reject 二选一；后续 V1.1 扩展。
> **V1 不实现** `expired` 状态：draft 24h 后 cleanup，服务端返回 410 `submission_expired`（与 E-P0-09 error-code-dict §4 一致）。

---

## 7. 自验收（任务卡 §A 9 状态 + 强制约束）

| # | 验收项 | 状态 | 证据 |
|---|---|---|---|
| 1 | 9 状态状态机完整定义 | ✅ | §1.1 |
| 2 | 每个转换有触发条件 | ✅ | §3.1-§3.14 |
| 3 | 每个转换有服务端动作 | ✅ | §3.1-§3.14 |
| 4 | 每个转换有客户端可见结果 | ✅ | §3.1-§3.14 |
| 5 | 状态历史 JSONB 记录格式 | ✅ | §4 |
| 6 | 异常处理（5 类非法转换） | ✅ | §5 |
| 7 | 与 OpenAPI 8 状态兼容 | ✅ | §1.3 兼容映射层 |
| 8 | 与 E-P0-09 ALLOWED_TRANSITIONS 对齐 | ✅ | §2.2 |
| 9 | 与 D-P0-02 §4 审核状态矩阵映射 | ✅ | §6 |
| 10 | 不暴露内部堆栈 | ✅ | §3.11-§3.14 error_message 仅 ≤ 256 chars + 不含 stack |

---

**End of state-machine-v1.md · E-P0-03 子产物 2/7**