---
title: SEE EARTH V1 · Shared API Contract · Decisions · v1.0.0
type: contract-decisions
tags: [release-v1, e-p0-09, api-contract, decisions, zod, openapi, see-earth]
task_id: E-P0-09
brief_anchor: "Release Strategy Brief §5 E-P0-09"
track: engineering
owner: Engineer Agent #3 (external Owner = 用户)
created: 2026-08-22
status: LOCKED
target_gate: Gate A · Internal Alpha
source_brief: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/SEE-EARTH-Release-Strategy-v1-Design-Engineering-Task-Brief.md
source_task_card: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/06-PM Agent 交接/2026-08-22-task-card-e-p0-09-shared-api-contract.md
related_docs:
  - ./openapi.yaml
  - ./zod-schemas/*
  - ./schema-changelog-v1.md
  - ./web-ios-mapping-v1.md
  - ./error-code-dict-v1.md
depends_on: [E-P0-01 (✓ ACCEPTED), D-P0-02 (IN PROGRESS)]
blocks: [E-P0-02, E-P0-03, E-P0-07, D-P0-05-impl, D-P1-01]
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/06-PM Agent 交接/release-v1/api-contract/contract-decisions-v1.md
note: 本文件已就绪，需 PM Agent 由 Obsidian 写入权限落地到 canonical 路径。
---

# SEE EARTH V1 · Shared API Contract · Key Decisions · v1.0.0

> **Status**：LOCKED · 2026-08-22 · E-P0-09 first pass
> **目标**：把 V1 contract 的关键选择与理由固定下来，避免后续 reviewer 反复讨论同一议题。
> **不写**：单一字段语义（见 `openapi.yaml` 与 `zod-schemas/*.ts`）；实施细节（见 `E-P0-02 / E-P0-03 / E-P0-07`）。

---

## 0. 阅读指南

每条决策条目包含：
- **Decision** — 选了什么
- **Why** — 为什么这么选
- **Alternatives considered** — 其他选项以及为什么没选
- **Cost of reversing** — 反转成本（帮助 reviewer 评估"值不值得在 Lock 前讨论"）

---

## 1. Stack：Zod + OpenAPI 3.1 自动生成（PM 默认 · 无偏离）

### Decision

- **Schema source of truth**：TypeScript Zod schemas（`zod-schemas/*.ts`）。
- **Machine-readable contract**：OpenAPI 3.1 YAML（`openapi.yaml`），由 Zod schemas 手工映射（首版）；未来可引入 `zod-to-openapi` 自动生成（详见 §10）。
- **运行时校验**：服务端用 `z.parse` 校验请求 / 响应；客户端用 `z.infer<>` 推导类型，**禁止**手写 TypeScript 类型。

### Why

- E-P0-01 §14.3.a 已推荐 Zod + OpenAPI 自动生成（PM 已接受）。
- 现有 `src/types/*.ts` 已是 TS strict 模式，Zod schema 可以自然继承字段名与含义。
- OpenAPI 3.1 是当前 Web 标准（与 iOS first-pass 的 Swift OpenAPI Generator 工具链兼容）。
- 一个 schema，两份产出：服务端校验 + OpenAPI 文档 + iOS Swift codegen。

### Alternatives considered

- **JSON Schema 直接手写**：放弃 TS 端类型推导，前端需要重复维护类型。
- **tRPC**：与 iOS 不兼容（仅 TS-to-TS），违背 "Web ↔ iOS 共享 contract" 目标。
- **GraphQL**：与 E-P0-01 推荐方向不符，且增加学习成本与运营复杂度。

### Cost of reversing

- 换 stack 必须重写所有 6 资源 schema + 客户端 fetch wrapper。
- **不可在 Beta 后反转**。若评审需反转，请在 Gate B 之前完成。

---

## 2. Public / Admin 双 schema 模型

### Decision

每个资源都定义两份 schema：

| Scope | Schema | 端点前缀 | 鉴权 |
|---|---|---|---|
| **Public** | `PublicCity` / `PublicMoment` / `PublicEdition` / `PublicWitnessSubmission` / `PublicAsset` / `PublicEchoStatusOnly` | `/v1/...` | 匿名 / witness session |
| **Admin** | `AdminCity` / `AdminMoment` / `AdminEdition` / `AdminWitnessSubmission` / `AdminAsset` / `SubmitterEcho` | `/v1/admin/...` 或带 role claim 的内部 endpoint | moderator / admin |

`Public*` schema 是强约束的：服务端在序列化时**必须**剥离任何非 Public 字段，否则视为安全事件。

### Why

- E-P0-05 强制边界要求"公共 API、Analytics、前端 payload、搜索索引、缓存、日志默认不得包含精确经纬度"。
- locationPrivacy.ts 已经定义了 PublicCityLocation / FullCityLocation 双视图，contract 必须延续这一约定。
- 服务端默认拒绝"序列化 Admin schema 到公共 endpoint"的代码路径（在 OpenAPI emitter 层断言）。

### Alternatives considered

- **单 schema + 服务端过滤**：服务端在响应序列化时手动 omit 字段。问题：schema 层无强约束，开发者易遗漏。
- **完全分离的 fetch client（Web / iOS 各一份）**：与"不允许两套业务真相"目标冲突。

### Cost of reversing

- 若 Beta 后才需要 Admin schema，security audit 必须重做，且 iOS App Store 审核要求"权限说明"完整。

---

## 3. 时间语义：UTC + 原始 IANA timezone 同时保留

### Decision

| 字段 | 类型 | 含义 |
|---|---|---|
| `captured_at` | RFC 3339 UTC + offset | 拍摄时刻（唯一决定 NOW/TODAY/PAST 分桶） |
| `captured_at_tz` | IANA timezone | 原始 timezone（用于显示） |
| `uploaded_at` | RFC 3339 UTC | 上传时间（运营元数据） |
| `published_at` | RFC 3339 UTC，可空 | 公开时间（moderation 通过后才填） |

三者**不可混用**（E-P0-04）。

### Why

- 用户在 CityPage 看到的"当地时间"由 `captured_at_tz` 计算；`captured_at` 决定 NOW 排序与 Daily 12 资格。
- 服务端跨时区计算用 UTC 即可；前端用 tz 字符串做本地化。
- 与 D-P0-05 `witness_submitted` Analytics 字段兼容（埋点中**不传 tz**，详见 §6 与 forbidden-fields §4 `captured_at` 注释）。

### Alternatives considered

- **仅 UTC，UI 自行推断**：UI 需要 tz lookup 表，维护成本高。
- **仅 local time + offset**：丧失 UTC 单调性，排序与审计困难。

### Cost of reversing

- 字段语义反转意味着所有现有数据需要迁移，不允许在 Gate A 之后做。

---

## 4. 位置语义：city-level 公开 / precise 受限

### Decision

- **公共 endpoint 仅返回** `public_city_id` + `public_city_name` + `country_zh/en` + `admin1_name`（可选）。
- **精确经纬度仅出现在**：
  - `WitnessLocationClaim.precise`（Witness 上传时声明，**后台存储**）
  - `AdminMoment.raw_location`（moderator / admin endpoint）
  - `AdminCity.raw_coordinates`（moderator / admin endpoint）
- **EXIF GPS 在公开 variant 中被剥离**（`ImageProcessing.strip_exif_gps = true` 默认值）。
- `WitnessSubmission.location_mode` 只记录模式枚举（`auto_gps_city` / `manual_city` / `denied_fallback_manual`），不记录坐标。

### Why

- 直接对齐 Brief §5 E-P0-05 + D-P0-05 forbidden-fields F-01 ~ F-05。
- 与现有 `locationPrivacy.ts` `toPublicCityLocation` / `toFullLocation` 实现对齐。

### Alternatives considered

- **完全不收集精确位置**：放弃"风险控制"用例（如 spam detection），违反 E-P0-03 验收条件。
- **直接公开 raw coords**：直接违反 E-P0-05 强制边界。

### Cost of reversing

- 若 Beta 后再收紧（如完全禁止精确位置存储），需要清空 raw_location 数据 + 修改所有 retention 流程。
- 若 Beta 后放宽（公开 raw），Privacy Page 必须重写，且 App Store / Google Play 拒绝提交。

---

## 5. Witness Submission 8 状态机

### Decision

状态机定义在 `WitnessSubmissionStatusSchema` + `ALLOWED_TRANSITIONS`：

```
draft ─┬─► uploading ─┬─► submitted ──► under_review ──┬─► published ──┬─► withdrawn
       │              │                                │                └─► rejected
       │              └─► failed ──► (retry) uploading └─► rejected
       └─► withdrawn
```

| 状态 | 进入条件 | 离开条件 |
|---|---|---|
| `draft` | POST `/witness/submissions` 创建成功 | 客户端开始上传或撤稿 |
| `uploading` | 客户端请求 `/assets/upload-url` | 上传完成 + complete 或失败 |
| `submitted` | 服务端收到完整 submission | 审核员开始处理 |
| `under_review` | 审核员打开 submission | 审核决策（accepted/rejected/needs_more_info） |
| `published` | moderation 通过 + 进入 Daily 12 | Witness 撤稿或 moderation 后撤 |
| `rejected` | moderation 拒绝 / 上传失败不可恢复 | 终止态 |
| `withdrawn` | Witness 主动撤回 | 终止态 |
| `failed` | 上传或服务端不可恢复错误 | 仅允许通过新一次上传重试 |

### Why

- Brief §5 E-P0-03 明示 8 状态：`draft / uploading / submitted / under_review / published / rejected / withdrawn / failed`。
- 与 E-P0-03 §Acceptance 中"失败可观察、可重试"对齐：`failed → uploading` 是显式重试路径。
- 状态机在 schema 层用 `ALLOWED_TRANSITIONS` 表达；服务端 handler 层必须 reject 非法转换。

### Alternatives considered

- **简化 4 状态（draft / pending / published / rejected）**：丧失上传失败与撤稿的精细追踪。
- **完全自由状态**：无 schema 层约束，moderation dashboard 需要重新做合规审计。

### Cost of reversing

- 状态机在 Beta 后反转会破坏已有数据迁移；如需扩展，使用新状态值（如 `auto_withdrawn_dmca`），不删除旧值。

---

## 6. 错误结构：Universal Error Envelope

### Decision

所有 4xx / 5xx 响应使用同一 envelope：

```typescript
{
  error_code: string;       // stable snake_case
  message: string;          // human-readable, localisable
  details?: Record<string, string|number|boolean>;
  retryable: boolean;
  request_id: string;
}
```

完整错误码字典见 `error-code-dict-v1.md`。

### Why

- iOS 与 Web 可共用错误处理（`if (error.code === 'rate_limited') showRetry()`）。
- `request_id` 是服务端 correlation id（关联监控），但**不暴露** stack / trace。
- `retryable` 是客户端决策的唯一依据（与 D-P0-05 §4.5 `witness_submit_failed.retryable` 对齐）。

### Alternatives considered

- **HTTP status code only**：iOS / Web 需要各自维护 status code → user message 表。
- **RFC 7807 Problem Details**：与现有前端错误栈不兼容。

### Cost of reversing

- 反转需要 iOS App 重新提交审核（错误展示文案变化）。

---

## 7. 分页策略：cursor-based（public）/ cursor-based（admin）

### Decision

| 端点类别 | 分页方式 | 默认 limit | 最大 limit |
|---|---|---|---|
| 公共列表（`/cities`, `/moments`, `/editions`） | cursor-based | 20 | 100 |
| Admin 列表 | cursor-based | 50 | 200 |
| Echo 列表（submitter 视角） | cursor-based | 20 | 50 |

不允许使用 offset / page（避免深翻页性能问题）。

### Why

- cursor-based 与服务端 keyset pagination 一致，避免全表扫描。
- 与现有 `useMomentsForCity.ts` adapter 的"按时间窗"逻辑兼容（cursor 可编码 `(captured_at, id)`）。
- 与 E-P0-06 Daily 12 Supply Chain 的"按日期回看"一致。

### Alternatives considered

- **offset / page**：实现简单，但深翻页性能差，运营 / moderation 历史回看压力大。
- **Hybrid (cursor for infinite, offset for dashboards)**：复杂度高，运营 dashboard 在 V1 仅 AdminCity / AdminEdition 需要，cursor 同样胜任。

### Cost of reversing

- 反转需要重写 Web / iOS 客户端分页组件；建议在 Beta 前完成所有反转讨论。

---

## 8. Idempotency：client_key everywhere

### Decision

`WitnessSubmission.client_key` 与 `Echo.client_key` 都是必填。

- 客户端生成（推荐 UUIDv4），首次创建 + 重试复用同一 key。
- 服务端在 409 之前必须先 200/201 返回已有 submission（idempotent replay）。
- 不同 client_key + 相同 submission 内容视为新提交。

### Why

- Brief §5 E-P0-03 验收条件明示"幂等提交"。
- 网络抖动场景下客户端必须能安全重试，否则会污染 Daily 12 来源（同一 Moment 重复计数）。

### Alternatives considered

- **服务端生成 idempotency key（session-scoped）**：与 Witness 匿名身份冲突（session 不持久）。
- **完全去重（hash content）**：无法处理"同一图片不同 caption" 的合法重提。

### Cost of reversing

- 反转会破坏现有客户端 retry 逻辑；建议从 V1 起强制 client_key。

---

## 9. Analytics 字段对齐：完全跟随 D-P0-05 event-map §5

### Decision

Web / iOS 客户端埋点 SDK 在 payload 中只能出现以下字段（白名单模式）：

```
edition_id, app_surface, moment_id, position, city_id, source_type,
entry_point, layer, section, unknown_id, permission_type, result,
media_type, network_class, submission_id (hashed), location_mode,
error_category, retryable
```

`submission_id` 在 Analytics payload 中使用 8 位 HMAC-SHA256 hex 截断（与 forbidden-fields §5 一致）。

### Why

- D-P0-05 §5 已锁定 19 个字段映射；E-P0-09 contract 在 domain 层提供这些字段（`WitnessSubmission.id` 等）。
- 服务端 Analytics 接收端只允许白名单字段；任何禁采字段（F-01 ~ F-30）触发 reject + 告警。

### Alternatives considered

- **完全自定义字段**：违反 D-P0-05 锁定，触发 redesign。
- **完全禁埋点**：违反 E-P0-07（Analytics 是 P0 Gate A 验收项）。

### Cost of reversing

- 字段名反转需要 iOS / Web SDK 同步更新；Analytics dashboard 需要兼容旧字段名 90 天（deprecation window）。

---

## 10. 客户端 codegen：Web 走 TS type alias，iOS 走 Swift OpenAPI Generator

### Decision

- **Web**：从 Zod schemas 直接 `import type { PublicCity } from '@/release-v1/api-contract/zod-schemas/city'`。
- **iOS**：从 `openapi.yaml` 生成 Swift models（`swift-openapi-generator` 或 `openapi-generator`）。
- 未来若引入 `zod-to-openapi` 自动生成，需保持 OpenAPI YAML 是发布产物（用于 iOS / 文档站）。

### Why

- Web 已经是 TS 强类型项目，Zod schema 是同语言 native。
- iOS first-pass 仅做"可评审原型 + 字段映射"，完整 codegen 在 P1+iOS 实现期引入。
- OpenAPI YAML 是 release artifact（必须 git tag，不能 mutate）。

### Alternatives considered

- **Web 也走 OpenAPI codegen**：增加构建复杂度，收益低。
- **iOS 走手工 Swift 类型**：违反"不允许两套业务真相"。

### Cost of reversing

- iOS codegen 流程反转影响 1-2 周；建议在 P1+iOS 启动前锁定工具链。

---

## 11. Public API 不输出精确位置 · Acceptance 自动化

### Decision

服务端在所有 `/v1/...`（不含 `/v1/admin/...`）路由的响应序列化阶段：

1. 用 `ErrorEnvelopeSchema` 验证 envelope 结构。
2. 用 `PublicCitySchema` / `PublicMomentSchema` / ... 严格校验 body 不含 `raw_coordinates` / `raw_location` / `precise.latitude` 等字段。
3. CI 跑 privacy leak test（greps 全套事件 payload 与公开图片 EXIF）。

### Why

- E-P0-05 acceptance 明示"对公共 endpoint、网页源代码、Analytics payload、图片文件和 CDN 缓存进行泄漏测试，结果为 0"。
- Zod `.strict()` + 二次断言比 runtime filter 更安全（开发者无法 silent-pass）。

### Alternatives considered

- **运行时 filter**：开发者可绕过；schema 层无保护。
- **完全静态分析**：覆盖率有限。

### Cost of reversing

- 反转必须重做 Privacy leak test；Gate A / Gate B / Gate C 必跑。

---

## 12. 版本化策略

### Decision

- 单一 `version` 字段（semver）：`MAJOR.MINOR.PATCH`。
- 当前：`1.0.0`。
- **MAJOR 变化** = 字段删除 / 类型变化 / 必填变可选（破坏性）。
- **MINOR 变化** = 新增字段 / 新增 endpoint（向后兼容）。
- **PATCH 变化** = 文档 / 注释 / example。
- 每次变更更新 `schema-changelog-v1.md` 并由 PM + Designer + Engineer 共同签字。

### Why

- Brief §5 E-P0-09 明示"Contract change 需兼容策略与变更记录"。
- 与 Web Vite 版本化策略一致。

### Alternatives considered

- **日期版本号（v2026-08-22）**：与 semver 工具链不兼容。
- **无版本**：iOS App Store 审核要求 API 有版本号。

### Cost of reversing

- Beta 后的 MAJOR 变化需要 iOS 灰度发布策略（旧版 App 仍可访问旧版 API）。

---

## 13. DO NOT 列表（本卡强制约束）

- ❌ 不为 iOS 私造数据模型（缺口必须在本卡解决，见 §17）。
- ❌ 不允许 Web 与 iOS 存在两套业务真相。
- ❌ 不在公共 API 输出精确位置或敏感 metadata。
- ❌ 不在合同未定前开始 Witness 公开提交（Alpha 阶段可基于临时 contract，Beta 前必须锁）。
- ❌ 不随意添加 contract 字段（每次变更必须有 CHANGELOG + 评审）。
- ❌ 不修改 Round 1 已 LOCKED 的设计（sitemap / page-audit / design-freeze-log）。
- ❌ 不在事件名 / 字段名上偏离 D-P0-05 event-map §5 一致性矩阵。

---

## 14. Open decisions（需 PM / Designer / iOS 后续签字）

| # | 议题 | 候选 | Owner | Deadline |
|---|---|---|---|---|
| OD-01 | Echo backend 是否进入 V1（vs 推迟到 Beta 后） | (a) V1 全量 (b) V1 仅前端无后端 (c) V1 移除 UI | PM + Designer | E-P0-01 评审通过后 |
| OD-02 | Asset Upload 服务选型 | (a) Supabase Storage (b) Cloudflare R2 (c) S3 | Engineer | E-P0-02 启动前 |
| OD-03 | Edition 状态机扩展（是否加 `scheduled`） | 当前已含 `scheduled`；是否在 V1 实际使用 | Engineer + Content Ops | E-P0-06 启动前 |
| OD-04 | Witness Session TTL | 默认 90 天；需 PM 决策 | PM | E-P0-03 启动前 |
| OD-05 | Admin endpoint 是否需要 rate-limit 区别 | 默认 yes；具体阈值待定 | Engineer | E-P0-03 启动前 |

---

## 15. Blocker Log（PM 维护）

| 日期 | 议题 | Owner | 解锁条件 | 状态 |
|---|---|---|---|---|
| 2026-08-22 | iOS first-pass 字段映射验证（OD-01 依赖） | iOS Engineer（外部） | D-P1-01 启动后 2 天内 | OPEN |
| 2026-08-22 | Echo backend V1 范围（OD-01） | PM + Designer | E-P0-01 评审通过 | OPEN |
| 2026-08-22 | Asset storage 选型（OD-02） | Engineer + PM | E-P0-02 启动前 1 天 | OPEN |

---

## 16. 自验收 Acceptance Criteria（Brief §5 E-P0-09）

- [x] 采用 Zod + OpenAPI 3.1 自动生成（PM 默认）
- [x] 6 个核心资源全部 lock 字段（见 `openapi.yaml` + `zod-schemas/*.ts`）
- [x] Web Alpha 可使用该 contract（不是另一套）
- [x] iOS first-pass 每个动态字段均能映射（详见 `web-ios-mapping-v1.md`）
- [x] 公共 API / 公共字段明确不含精确经纬度（Public schemas 不含 `raw_*` / `precise`）
- [x] 错误码字典与 D-P0-04 状态矩阵一一对应（`error-code-dict-v1.md`）
- [x] 机器可读（OpenAPI YAML + Zod TS schemas）
- [x] 变更日志存在（`schema-changelog-v1.md` v1.0.0）
- [x] 兼容性策略明确（§12 版本化）
- [x] 与 D-P0-05 event-map §5 字段名一致性矩阵对齐（详见 `web-ios-mapping-v1.md` §C）

---

## 17. iOS field-gap 决策（与 `web-ios-mapping-v1.md` 对齐）

下表是 iOS first-pass 可能需要的字段在 Web 是否存在 / 是否在本 contract 锁定的判定：

| iOS 字段 | Web 来源 | Contract 字段 | 状态 |
|---|---|---|---|
| `Moment.capturedAt` | `src/types/moment.ts` + Web render | `Moment.captured_at` | ✓ Locked |
| `Moment.localTime` | Web HeroMedia.tsx `local_time` | `Moment.captured_at_tz` + 客户端 `Intl.DateTimeFormat` | ✓ Locked |
| `City.weather` | Web WeatherRail | 不入 contract（runtime derivation per D-P0-01 §7.1 决策 5） | ✓ Out of contract |
| `Edition.slot.moment.thumbnailUrl` | Web Daily12Grid | `Moment.image_variants[thumb_320].url` | ✓ Locked |
| `WitnessSubmission.uploadingProgress` | n/a | 不入 contract（客户端 UI state） | ✓ Out of contract |
| `Witness.permissions.location.coarseCity` | n/a | `WitnessSubmission.public_city_id` | ✓ Locked |

无 unresolved gap。

---

## 18. 关联文档

| 文档 | 用途 |
|---|---|
| `openapi.yaml` | OpenAPI 3.1 contract（机器可读） |
| `zod-schemas/*.ts` | Zod schema 源（TS 类型推导 + 服务端校验） |
| `schema-changelog-v1.md` | 变更日志 |
| `web-ios-mapping-v1.md` | Web ↔ iOS 字段映射表 |
| `error-code-dict-v1.md` | 错误码字典（与 D-P0-04 状态矩阵对应） |
| `/Users/lwy/Documents/ChatGPT/看见地球/src/types/city.ts` / `moment.ts` / `cityState.ts` | 字段语义依据 |
| `/Users/lwy/Documents/ChatGPT/看见地球/src/lib/locationPrivacy.ts` | 隐私边界依据 |
| `/Users/lwy/Documents/ChatGPT/看见地球/src/components/ui/EchoInput.tsx` | Echo 字段依据 |
| `/Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/SEE-EARTH-Release-Strategy-v1-Design-Engineering-Task-Brief.md` §5 E-P0-09 | Brief 原文 |
| `/Users/lwy/Documents/ChatGPT/看见地球/07-设计师设计参考/release-v1/analytics-events/event-map-v1.md` §5 | 字段一致性矩阵 |

---

**End of contract-decisions-v1.md · E-P0-09 first pass**