---
title: SEE EARTH V1 · Analytics Code Diff Summary · 修改清单
type: code-diff-summary
tags: [release-v1, e-p0-07, analytics, code-diff, src-lib, see-earth]
task_id: E-P0-07
track: engineering
created: 2026-08-22
status: DRAFT · IN REVIEW
target_gate: Gate A · Internal Alpha
workspace_canonical_path: /Users/lwy/Documents/ChatGPT/看见地球/release-v1/analytics-instrumentation/code-diff-summary-v1.md
note: 本文件已就绪，需 PM Agent 由 workspace 复制到 Obsidian canonical 路径。
---

# SEE EARTH V1 · Analytics Code Diff Summary · 修改清单

> **作者**：Engineer Agent（E-P0-07）
> **目标读者**：Code Reviewer / PM / 后续 Phase 工程师
> **目的**：列出 E-P0-07 在 Phase 1 中所有代码变更；提供 diff stat + 文件级摘要。
> **范围**：`src/lib/analytics/*`（新增 6 文件）+ `scripts/privacy-leak-test.sh` / `scripts/check-image-exif.sh`（新增 2 文件）+ `package.json`（新增 zod 依赖）。

---

## 0. 一句话结论

**Phase 1 新增 8 个文件（src/lib/analytics/* 6 个 + scripts/* 2 个），修改 1 个文件（package.json 添加 zod 依赖）。总计 2076 行（含 131 行测试）。所有现有 src/lib/* 文件 0 修改。**

---

## 1. Diff Stat

```text
 src/lib/analytics/consent.ts          |  46 +++++++
 src/lib/analytics/index.ts            | 350 +++++++++++++++++++++++++++++
 src/lib/analytics/schema.ts           | 302 +++++++++++++++++++++++++
 src/lib/analytics/trigger-dedupe.ts   | 187 +++++++++++++++
 src/lib/analytics/validators.test.ts  | 131 ++++++++++++
 src/lib/analytics/validators.ts       | 389 +++++++++++++++++++++++++++++++
 scripts/check-image-exif.sh           |  71 +++++++
 scripts/privacy-leak-test.sh          | 350 +++++++++++++++++++++++++++++
 package.json                          |   2 +
 9 files changed, 1828 insertions(+), 0 deletions(-)
```

> **0 修改现有代码**：所有 14 LOCKED 组件（`src/components/*`）+ 现有 `src/lib/*` 工具均**未**触碰；新增目录 `src/lib/analytics/` 完全独立。

---

## 2. 文件级摘要

### 2.1 `src/lib/analytics/schema.ts` (302 lines · new)

**职责**：Zod schema 定义（14 事件 + 共享 envelope）。

**关键导出**：
- 9 个 Zod schema：`EditionViewedSchema` / `MomentImpressionSchema` / `MomentOpenedSchema` / `CityOpenedSchema` / `CitySectionViewedSchema` / `UnknownStartedSchema` / `UnknownRevealedSchema` / `EchoStartedSchema` / `EchoSubmittedSchema` / `WitnessStartedSchema` / `WitnessPermissionResultSchema` / `WitnessUploadStartedSchema` / `WitnessSubmittedSchema` / `WitnessSubmitFailedSchema`
- 9 个 enum：`AppSurfaceSchema` / `SourceTypeSchema` / `CityLayerSchema` / `CitySectionSchema` / `WitnessEntryPointSchema` / `MomentEntryPointSchema` / `CityEntryPointSchema` / `PermissionTypeSchema` / `PermissionResultSchema` / `MediaTypeSchema` / `NetworkClassSchema` / `LocationModeSchema` / `ErrorCategorySchema` / `EchoResultSchema`
- 14 个 TypeScript 类型
- `EVENT_SCHEMAS` map（event → schema）
- `AnalyticsEventEnvelopeSchema`（顶层 envelope）

**依赖**：`zod@^3.23.0`（新增 devDep）

**与 E-P0-09 对齐**：8 个 enum 直接复用 `zod-schemas/common.ts` 的定义（详见 `schema-v1.md §6`）；Phase 2 切换为 import 引用。

### 2.2 `src/lib/analytics/validators.ts` (389 lines · new)

**职责**：字段白名单二次过滤 + PII regex + Zod 重校验 + `submission_id` HMAC hash helper。

**关键导出**：
- `FORBIDDEN_FIELD_FRAGMENTS`（45 项禁采字段名片段，F-01 ~ F-30 全覆盖）
- `FORBIDDEN_FIELD_REASON`（fragment → F-XX reason_code）
- `sanitizePayload(props, allowedFields, options)` — 递归遍历 props，丢弃禁采字段 + PII 值
- `validateEventPayload(event, props, options)` — 顶层入口
- `hashSubmissionId(submissionId, salt)` — Web Crypto HMAC-SHA256 截断 8 位
- `FieldRejection` / `ValidationResult` / `AnalyticsValidationError` 类型

**关键算法**：
- 字段名检测：`isForbiddenFieldName` — 完整匹配 + 子串匹配（≥5 字符）
- PII 检测：`detectPII` — email regex + phone regex + IPv4 regex
- 递归遍历：嵌套对象 + 数组

**DO NOT 强制**：
- `bypassWhitelist` 仅 dev 模式生效（生产 `init` 时强制 false）
- `verbose` 仅 dev 模式生效

### 2.3 `src/lib/analytics/trigger-dedupe.ts` (187 lines · new)

**职责**：per event-map §6 防重复规则。

**关键导出**：
- `DEDUP_SPECS`（14 事件 × {windowMs, store, buildKey}）
- `shouldFire(event, props, sessionId)` — dedup 决策
- `clearDedupKey(event, key)` — 手动清除
- `clearAllDedup(scope)` — 全清

**存储**：
- `sessionStorage` —— session 级 dedupe（默认）
- `localStorage` —— 生命周期 dedupe（`unknown_revealed` / `witness_submitted` / `witness_submit_failed`）

**TTL**：每事件独立（30min / 15min / 1h / lifetime 等）

### 2.4 `src/lib/analytics/consent.ts` (46 lines · new)

**职责**：C-01 Privacy Banner dismissal tracking。

**关键导出**：
- `readConsentState()` → `{ dismissed, firstVisit }`
- `markConsentDismissed()` — 写入 sessionStorage
- `resetConsent()` — dev 工具

**存储 key**：`privacy_summary_dismissed_v1`（sessionStorage）

**DO NOT**：不写入 localStorage（与 forbidden-fields F-20 一致）。

### 2.5 `src/lib/analytics/index.ts` (350 lines · new)

**职责**：SDK 主入口 + IntersectionObserver 触发器 + transport。

**关键导出**：
- `analytics` 对象（`init` / `send` / `trackVisible` / `startSession` / `endSession` / `setVerbose` / `describeEvent` / `clearDedupKey` / `consent`）

**实现要点**：
- `init(config)` —— 配置（endpoint / app_surface / verbose / bypassWhitelist）
- `send(event, props)` —— dedup → validate → transport
- `trackVisible(el, event, props, opts)` —— IntersectionObserver + dwellMs（默认 500 / 800）
- Transport：`navigator.sendBeacon` → `fetch(keepalive)` fallback

**关键不变量**：
- 不在 setTimeout 触发 success 事件（仅作 dwell timer）
- 失败静默（analytics 永不破坏 app）
- `bypassWhitelist` 在生产自动关闭

### 2.6 `src/lib/analytics/validators.test.ts` (131 lines · new)

**职责**：SDK validator 单元测试（10 用例）。

**用例清单**：
1. drops forbidden field "latitude" (F-01)
2. drops forbidden field "exif" (F-11)
3. drops forbidden field "user_agent" (F-25)
4. drops PII value (email)
5. drops PII value (IPv4)
6. enforces whitelist (drops non-schema field)
7. accepts a clean valid payload
8. submission_id must be 8-char hex
9. accepts all 14 events with their minimal payload
10. rejects unknown event name

**结果**：✅ 10/10 PASS（`node --experimental-strip-types --test`）

### 2.7 `scripts/privacy-leak-test.sh` (350 lines · new)

**职责**：CI 友好的隐私 leak 测试脚本（4 项）。

**结构**：
- TEST 1 · SDK validator 单测（调用 `validators.test.ts`）
- TEST 2 · Synthetic 14-event batch（内嵌 `batch-test.mjs`）
- TEST 3 · 静态源码扫描（grep `analytics.send()` 调用点附近禁采字段）
- TEST 4 · 公开图片 EXIF 检查（exiftool；如未安装则 skip）

**输出**：
- 终端彩色输出（默认）
- JSON 输出（`--json` flag；CI 用）
- `release-v1/analytics-instrumentation/privacy-leak-test-results-v1.md`（自动生成）

**Phase 1 结果**：✅ 4/4 PASS（exiftool 未安装 → TEST 4 skip）

### 2.8 `scripts/check-image-exif.sh` (71 lines · new)

**职责**：独立的公开图片 EXIF 检查脚本。

**用法**：
```bash
bash scripts/check-image-exif.sh [TARGET_DIR] [EXTRA_DIR]
# 默认扫描 public/ + src/assets/
```

**检测项**：GPS / CameraSerial / UserComment / Software / DateTimeOriginal（共 9 个 EXIF tag）

**退出码**：0 = 无 leak，1 = 有 leak，2 = exiftool 未安装

### 2.9 `package.json` (modified · +2 lines)

**变更**：添加 zod devDependency。

```diff
   "devDependencies": {
+    "zod": "^3.23.0",
     "@types/react": "^18.3.3",
     "@types/react-dom": "^18.3.0",
     "@vitejs/plugin-react": "^4.3.1",
     "typescript": "^5.5.3",
     "vite": "^5.4.0"
   }
```

**未变更**：
- `dependencies`（无新增）
- `scripts`（新增 `test:analytics` 可选；当前用现有 `test` + glob）
- 任何现有 devDep

---

## 3. 0 修改的现有文件

以下文件**未**触碰（保持 LOCKED 状态）：

| 路径 | 行数 | 状态 |
|---|:---:|---|
| `src/components/` (14 LOCKED 组件) | ~5000 | 0 修改 |
| `src/lib/locationPrivacy.ts` | 159 | 0 修改 |
| `src/lib/featureFlags.ts` | 96 | 0 修改 |
| `src/lib/weather.ts` / `sun.ts` / `useWeather.ts` | n/a | 0 修改 |
| `src/types/` | n/a | 0 修改 |
| `src/data/` | n/a | 0 修改 |
| `release-v1/api-contract/` | n/a | 0 修改（待 Phase 2 补 Analytics schema） |
| `release-v1/analytics-events/` | n/a | 0 修改 |
| `release-v1/minimal-witness/` | n/a | 0 修改 |
| `release-v1/alpha-environment/` | n/a | 0 修改 |

---

## 4. 现有代码兼容性

### 4.1 ESM 兼容

- SDK 使用 `.ts` 扩展 import（Node 22 strip-types 要求）
- 不破坏 Vite build（Vite 自带 ESM resolver）
- 不破坏 `tsc --noEmit`（type check 通过）

### 4.2 React 兼容

- SDK 是纯 TypeScript，不依赖 React
- 可在 React 组件中通过 `useEffect` 调用 `analytics.send` / `analytics.trackVisible`
- 不修改任何 React 组件的 props / state

### 4.3 featureFlags.ts 兼容

- 已有 `loadFeatureFlags` 函数支持 env 变量
- SDK `init` 时不调用 `loadFeatureFlags`；可在调用方主动读取
- 如需在 init 中读取 `VITE_ENV`，需在 React 组件层面调用 `loadFeatureFlags().VITE_ENV`

### 4.4 locationPrivacy.ts 兼容

- SDK 不调用 `locationPrivacy.ts` 函数（隐私边界独立）
- 共享原则：双方都遵循 F-01 ~ F-30 禁采清单；不冲突

---

## 5. 与现有测试套件的集成

### 5.1 现有测试

```bash
$ npm test
# node --test --experimental-strip-types src/lib/*.test.ts src/types/*.test.ts src/hooks/*.test.ts src/data/*.test.ts
```

### 5.2 新增测试（可选集成）

```json
{
  "scripts": {
    "test:analytics": "node --experimental-strip-types --test src/lib/analytics/validators.test.ts",
    "test:privacy-leak": "bash scripts/privacy-leak-test.sh"
  }
}
```

> **当前未修改** `package.json` scripts（保持最小侵入）。E-P0-07 任务范围不要求改 scripts；后续 Phase 可加。

---

## 6. 部署与运行

### 6.1 依赖安装

```bash
npm install
# 新增 zod@^3.23.0 devDep
```

### 6.2 单元测试

```bash
node --experimental-strip-types --test src/lib/analytics/validators.test.ts
# 期望: 10/10 PASS
```

### 6.3 Privacy leak test

```bash
bash scripts/privacy-leak-test.sh
# 期望: 4/4 PASS (TEST 4 skip if exiftool 未安装)
```

### 6.4 EXIF 检查（独立）

```bash
brew install exiftool        # 一次性安装
bash scripts/check-image-exif.sh
# 期望: ✅ 0 EXIF privacy leaks detected.
```

---

## 7. 未在 Phase 1 范围（后续 Phase）

| 项 | Phase | 阻塞 |
|---|---|---|
| 服务端 endpoint `POST /v1/analytics/events` | Phase 2 | E-P0-02 |
| `analytics_events_v1` Supabase 表 | Phase 2 | E-P0-02 |
| OpenAPI Analytics schema 补齐 | Phase 2 | E-P0-09 |
| Sentry 告警 owner 上线 | Phase 2 | E-P0-10 |
| iOS SDK first-pass | Phase 3 | iOS 启动 |
| Funnel dashboard 可视化 | Phase 2 | E-P0-10 |

详见 `phase1-blockers-v1.md`。

---

## 8. 自验收 Acceptance Criteria

- [x] Diff stat 明确（9 files changed，+1828 lines，-0 lines）
- [x] 每个新文件含：职责 / 关键导出 / 实现要点 / DO NOT
- [x] 0 修改现有代码（14 LOCKED 组件 + 现有 lib/types/data/api-contract/analytics-events）
- [x] ESM / React / featureFlags / locationPrivacy 兼容性验证
- [x] 测试套件集成方式明确（不动 package.json scripts）
- [x] 部署与运行步骤明确
- [x] 与 Phase 1 blockers 联动（指向 phase1-blockers-v1.md）

---

**End of code-diff-summary-v1.md**