---
title: SEE EARTH V1 · Phase 1 Blockers · E-P0-02 完成后需重新对齐项
type: analytics-phase-blockers
tags: [release-v1, e-p0-07, analytics, blockers, e-p0-02, see-earth]
task_id: E-P0-07
track: engineering
created: 2026-08-22
status: DRAFT · IN REVIEW
target_gate: Gate A · Internal Alpha
source_inputs:
  - ./server-receiver-v1.md §11
  - ./schema-v1.md §5.2
  - /Users/lwy/Documents/ChatGPT/看见地球/release-v1/vertical-slice-phase1/db-schema-v1.md
  - /Users/lwy/Documents/ChatGPT/看见地球/release-v1/api-contract/openapi.yaml
related_docs:
  - ./server-receiver-v1.md
  - ./schema-v1.md
workspace_canonical_path: /Users/lwy/Documents/ChatGPT/看见地球/release-v1/analytics-instrumentation/phase1-blockers-v1.md
note: 本文件已就绪，需 PM Agent 由 workspace 复制到 Obsidian canonical 路径。
---

# SEE EARTH V1 · Phase 1 Blockers · E-P0-02 完成后需重新对齐项

> **作者**：Engineer Agent（E-P0-07）
> **目标读者**：PM / E-P0-02 owner / E-P0-09 contract owner
> **目的**：列出 E-P0-07 客户端 SDK 已落地、但需等 E-P0-02 Phase 1 backend 完成才能联调的项；以及 E-P0-02 完成后 E-P0-07 需要更新的对齐项。

---

## 0. 一句话结论

**Phase 1 当前状态：客户端 SDK 已完成（schema / validators / dedupe / consent / 触发器），4 项 privacy leak test 全过。E-P0-02 Phase 1 后端完成后需联调：① 服务端 endpoint 落地；② OpenAPI 补齐 Analytics schema；③ Supabase analytics_events_v1 表创建；④ Privacy leak test 接入服务端回归测试。**

---

## 1. Phase 1 已完成项（不阻塞 E-P0-02）

| 项 | 状态 | 证据 |
|---|:---:|---|
| 14 事件 Zod schema | ✅ | `src/lib/analytics/schema.ts` |
| 字段白名单 + PII regex | ✅ | `src/lib/analytics/validators.ts` |
| 防重复规则（event-map §6） | ✅ | `src/lib/analytics/trigger-dedupe.ts` |
| C-01 Consent banner tracking | ✅ | `src/lib/analytics/consent.ts` |
| IntersectionObserver + dwellMs | ✅ | `src/lib/analytics/index.ts` |
| `analytics.send()` API | ✅ | `src/lib/analytics/index.ts` |
| 单元测试 10 用例 | ✅ | `src/lib/analytics/validators.test.ts` |
| Privacy leak test 脚本 + 4 项 | ✅ | `scripts/privacy-leak-test.sh` |
| 公开图片 EXIF 检查脚本 | ✅ | `scripts/check-image-exif.sh` |
| 5 个 funnel SQL 模板 | ✅ | `funnel-queries-v1.md` |
| E-P0-09 enum 对齐（共享字段） | ✅ | `schema-v1.md §1.2` |

---

## 2. Phase 1 阻塞项（需 E-P0-02 / E-P0-09 完成后解锁）

### 2.1 BLOCKER-1 · 服务端 endpoint 落地

| 项 | 详情 |
|---|---|
| Owner | E-P0-02 backend |
| 当前状态 | ❌ MISSING |
| 解锁条件 | E-P0-02 Phase 1 backend（Supabase + Edge Function）部署 |
| 阻塞 E-P0-07 哪些 | ① 服务端接收端实现；② 真实端到端测试；③ `analytics_events_v1` 表创建 |
| 对齐方案 | E-P0-07 客户端 SDK 已支持 `/v1/analytics/events` 路径（per `server-receiver-v1.md §1.1`）；服务端需按 `server-receiver-v1.md §9` 的伪代码实现 |
| 优先级 | P0（Phase 2 启动条件） |

### 2.2 BLOCKER-2 · OpenAPI 补齐 Analytics schema

| 项 | 详情 |
|---|---|
| Owner | E-P0-09 contract owner |
| 当前状态 | ❌ MISSING（E-P0-09 v1.0.0 已 LOCKED，未含 Analytics schema） |
| 解锁条件 | E-P0-09 Phase 2 PR 追加 Analytics schema |
| 阻塞 E-P0-07 哪些 | OpenAPI 文档不一致（client + server 各自维护） |
| 对齐方案 | 详见 `schema-v1.md §5.2` 列出 10 个待补 schema：① `AnalyticsEventName` enum；② `AnalyticsEventEnvelope`；③ `AnalyticsBatchRequest`；④ `AnalyticsBatchResponse`；⑤ `DomainSourceType` enum；⑥-⑧ `CityEntryPoint` / `MomentEntryPoint` / `WitnessEntryPoint` enums；⑨ `EchoResult` enum；⑩ `CityActiveLayer` enum |
| 优先级 | P1（Phase 2 中期） |

### 2.3 BLOCKER-3 · Supabase `analytics_events_v1` 表创建

| 项 | 详情 |
|---|---|
| Owner | E-P0-02 backend |
| 当前状态 | ❌ MISSING |
| 解锁条件 | E-P0-02 Phase 1 db-schema-v1.md 落地时同时创建 |
| 阻塞 E-P0-07 哪些 | Phase 1 mock JSONL → Phase 2 Supabase 切换 |
| 对齐方案 | DDL 在 `server-receiver-v1.md §4.2` 完整给出；E-P0-02 直接复制到 `drizzle/0000_init.sql`（或新增 `0001_analytics.sql`） |
| 优先级 | P0（与 BLOCKER-1 同） |

### 2.4 BLOCKER-4 · Privacy leak test 服务端回归

| 项 | 详情 |
|---|---|
| Owner | E-P0-07 + DevOps |
| 当前状态 | ⏸️ 仅客户端验证 |
| 解锁条件 | 服务端 endpoint 落地 + 测试桩部署 |
| 阻塞 E-P0-07 哪些 | 服务端 reject 行为的端到端验证 |
| 对齐方案 | 在 `scripts/privacy-leak-test.sh` 增加 TEST 5：模拟发送 14 事件 → 服务端落库 → 抓取实际 payload → 扫描禁采字段；CI 集成 |
| 优先级 | P1（Phase 2 中期） |

### 2.5 BLOCKER-5 · 告警 owner 上线（Sentry / Slack）

| 项 | 详情 |
|---|---|
| Owner | E-P0-10 monitoring |
| 当前状态 | ❌ MISSING（owner 已分配但未上线） |
| 解锁条件 | E-P0-10 Phase 1 部署 + Sentry project 创建 |
| 阻塞 E-P0-07 哪些 | 服务端 reject 告警无人接收 |
| 对齐方案 | E-P0-10 创建 Sentry project `setheearth-alpha` + `setheearth-prod`；告警规则：① `internal_precise_location_leak` 任何 hit → Slack #analytics-alerts；② batch reject 率 > 5% → P1 告警 |
| 优先级 | P1（与 BLOCKER-1 同周期） |

### 2.6 BLOCKER-6 · iOS SDK 集成

| 项 | 详情 |
|---|---|
| Owner | iOS 工程师（待定） |
| 当前状态 | ❌ MISSING（V1 暂无 iOS 实现；first-pass 仅 Web） |
| 解锁条件 | iOS 项目启动 + 团队组建 |
| 阻塞 E-P0-07 哪些 | iOS 端 14 事件埋点；与 Web 共用 enum 对齐 |
| 对齐方案 | iOS 端使用相同 schema（详见 `sdk-integration-v1.md §11`）；字段名 13 项强制共享（per `api-field-mapping-v1.md §9.2`） |
| 优先级 | P2（iOS 启动时） |

### 2.7 BLOCKER-7 · `submission_id` 服务端 hash 服务

| 项 | 详情 |
|---|---|
| Owner | E-P0-02 backend（Witness endpoint owner） |
| 当前状态 | ❌ MISSING |
| 解锁条件 | E-P0-02 Phase 1 Witness submission endpoint 落地 |
| 阻塞 E-P0-07 哪些 | `witness_submitted` 事件中 `submission_id` 仅发 8 位 hash；客户端无法 hash（无 ANALYTICS_SALT） |
| 对齐方案 | 服务端在 `/api/witness/submissions/:id` POST 响应中**返回** 8 位 hash 字段；客户端读取后写入 `witness_submitted.submission_id`；详见 `server-receiver-v1.md §4.3` |
| 优先级 | P0（与 BLOCKER-1 同） |

---

## 3. E-P0-02 完成后 E-P0-07 需更新的对齐项

### 3.1 字段重命名（如 E-P0-02 / E-P0-09 提议）

| 字段 | 当前名 | 可能改名 | 处理 |
|---|---|---|---|
| `app_surface` | `app_surface` | 保持 | 无需变更 |
| `submission_id` (8 hex) | `submission_id` | 保持 | 无需变更 |
| `error_category` (9 值) | `error_category` | 可能加 `unknown` (E-P0-09 已有) | SDK 取 9 值；服务端处理 `unknown` 映射为 `validation`（per `error-code-dict-v1.md §10`） |
| `entry_point` (Witness) | 5 值 | 可能加 `unknown_reveal` 等 | 走新增事件评审；不在 V1 范围 |

### 3.2 服务端存储字段补充

如 E-P0-02 在 `witness_submissions` 表加新字段（如 `moderation_eta_days`），埋点是否需要同步？答案：**不需要**——埋点仅跟随 event-map，不跟随业务表字段变化。

### 3.3 新增事件请求

如产品需要 `unknown_skipped` 等新事件，需走：
1. PM 评审
2. event-map v2（扩展 §1-§4）
3. SDK schema 扩展（`schema.ts`）
4. Phase 2/3 联调

### 3.4 `app_surface` 枚举扩展

如产品添加 `web_unknown_reveal` 等子入口，需走：
1. D-P0-05 event-map §5 同步扩展
2. SDK `AppSurfaceSchema` 添加 enum 值
3. `detectAppSurface()` 函数添加映射

---

## 4. 不在 Phase 1 范围（Phase 2+ 决策）

| 项 | 当前状态 | Phase 2 / 3 决策 owner |
|---|---|---|
| `app_surface` 枚举是否加 `web_unknown_reveal` | ❌ | D-P0-05 + PM |
| `entry_point` 扩展（more nuances） | ❌ | D-P0-05 |
| Privacy 撤销 API（用户撤回 consent） | ❌ | D-P0-03 + PM |
| `error_category = unknown`（E-P0-09 已加） | ⏸️ SDK 9 值，服务端兜底 | E-P0-02 |
| `media_type = screenshot` | ❌ | D-P0-02 |
| `network_class` 精度（5G / WiFi-6 细分） | ❌ | D-P0-05 |
| `location_mode` 扩展（`admin_override`） | ❌ | E-P0-05 + E-P0-09 |

---

## 5. 与其他任务的交叉点

### 5.1 E-P0-02 (Launch Vertical Slice) · Phase 1

- E-P0-07 客户端 SDK 已 ready；等待 E-P0-02 后端落地
- 同步点：① `analytics_events_v1` 表创建；② `/v1/analytics/events` endpoint；③ `submission_id` 服务端 hash 服务
- 建议 E-P0-02 Phase 1 完成后立即安排 E-P0-07 联调窗口

### 5.2 E-P0-03 (Witness Backend) · Phase 1

- E-P0-03 实现 `/api/witness/submissions/:id` POST 响应时，需同步返回 8 位 `submission_id_hash`（per BLOCKER-7）
- 与 E-P0-09 contract 字段对齐：`submission_id` 在 API 响应中必须同时存在原值 + 8 位 hash

### 5.3 E-P0-05 (Location Privacy)

- E-P0-07 已与 E-P0-05 禁采清单 100% 对齐（F-01 ~ F-30）
- 验证：per `privacy-leak-test-v1.md §4.2` 覆盖映射表

### 5.4 E-P0-09 (API Contract)

- E-P0-09 Phase 2 需补齐 Analytics schema（BLOCKER-2）
- E-P0-07 当前 SDK schema 与 E-P0-09 共享 enum 已对齐（详见 `schema-v1.md §6`）

### 5.5 E-P0-10 (Monitoring)

- E-P0-10 接 Sentry + Slack 告警（BLOCKER-5）
- E-P0-07 提供监控 hook（`internal_precise_location_leak` 等）

### 5.6 D-P0-03 (Alpha / Beta 状态设计)

- Alpha Banner + 反馈入口 UI 与 C-01 Consent banner 解耦
- `env` 字段（alpha / beta / production）由 E-P0-07 SDK 自动 attach（基于 `VITE_ENV`）

---

## 6. 时间线（建议）

| Phase | 周次 | E-P0-07 任务 |
|---|---|---|
| **Phase 1 (当前)** | W1 | ✅ SDK + schema + dedupe + tests + funnel queries |
| **Phase 1.5** | W2 | ✅ Privacy leak test CI 集成（per BLOCKER-5） |
| **Phase 2 (E-P0-02 后)** | W3-W4 | ⏸ 服务端 endpoint 联调 + OpenAPI 补齐 + 真实端到端测试 |
| **Phase 2.5** | W5 | ⏸ Sentry 告警 + funnel dashboard |
| **Phase 3 (Beta 启动)** | W6+ | ⏸ iOS SDK first-pass 集成 + 跨平台一致性验证 |

---

## 7. 自验收 Acceptance Criteria

- [x] 列出 Phase 1 已完成项（11 项）
- [x] 列出 Phase 1 阻塞项（7 项 BLOCKER-1 ~ BLOCKER-7）
- [x] 每个 BLOCKER 含：owner / 当前状态 / 解锁条件 / 阻塞 E-P0-07 哪些 / 对齐方案 / 优先级
- [x] E-P0-02 完成后 E-P0-07 需更新的对齐项（4 类）
- [x] 不在 Phase 1 范围的项明确（7 项）
- [x] 与其他任务的交叉点明确（6 个任务）
- [x] 时间线建议（W1 ~ W6+）
- [x] 与 E-P0-02 / E-P0-09 / E-P0-10 等任务的所有对齐点已记录

---

**End of phase1-blockers-v1.md**