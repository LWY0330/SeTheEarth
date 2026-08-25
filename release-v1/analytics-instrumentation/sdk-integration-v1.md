---
title: SEE EARTH V1 · Analytics SDK Integration Guide · 集成指南
type: analytics-sdk-integration
tags: [release-v1, e-p0-07, analytics, sdk, web, integration, see-earth]
task_id: E-P0-07
track: engineering
created: 2026-08-22
status: DRAFT · IN REVIEW
target_gate: Gate A · Internal Alpha
source_inputs:
  - /Users/lwy/Documents/ChatGPT/看见地球/07-设计师设计参考/release-v1/analytics-events/event-map-v1.md
  - /Users/lwy/Documents/ChatGPT/看见地球/07-设计师设计参考/release-v1/analytics-events/trigger-diagram-v1.md
  - /Users/lwy/Documents/ChatGPT/看见地球/07-设计师设计参考/release-v1/analytics-events/forbidden-fields-v1.md
  - /Users/lwy/Documents/ChatGPT/看见地球/07-设计师设计参考/release-v1/analytics-events/consent-placement-v1.md
related_docs:
  - ./schema-v1.md
  - ./server-receiver-v1.md
  - ./privacy-leak-test-v1.md
  - ./phase1-blockers-v1.md
workspace_canonical_path: /Users/lwy/Documents/ChatGPT/看见地球/release-v1/analytics-instrumentation/sdk-integration-v1.md
note: 本文件已就绪，需 PM Agent 由 workspace 复制到 Obsidian canonical 路径。
---

# SEE EARTH V1 · Analytics SDK Integration Guide · Web SDK 集成指南

> **作者**：Engineer Agent（E-P0-07）
> **目标读者**：Web 工程师 / iOS 工程师（first-pass）/ QA / Code Reviewer
> **目的**：明确 Web 端 Analytics SDK 的初始化、调用、触发器集成、防重复、白名单 / PII 过滤与告警协议。
> **代码**：`src/lib/analytics/`（5 文件 + 1 test = 6 文件）
> **强制原则**：
> 1. **白名单模式**：SDK 仅允许 `event-map §5` 中列出的字段；其他一律过滤。
> 2. **不在前端定时器触发 success 事件**——success 必须由服务端 confirmation 触发。
> 3. **不在前端关闭 PII 过滤**——`bypassWhitelist` 仅 dev 模式生效。

---

## 0. 一句话结论

**Web 端 SDK 入口 = `src/lib/analytics/index.ts`（`analytics` 对象）。三步集成：① `analytics.init({ endpoint, app_surface })`；② 用 `analytics.send(event, props)` 主动发事件；③ 用 `analytics.trackVisible(el, event, props)` 自动追踪 `moment_impression` / `city_section_viewed`。所有事件经过 Zod 校验 + 字段白名单 + PII regex 三道关卡。**

---

## 1. 文件结构

```text
src/lib/analytics/
├── index.ts              # 主入口（analytics 对象 + IntersectionObserver 触发器）
├── schema.ts             # Zod schemas（14 事件 + 共享 envelope）
├── validators.ts         # 字段白名单 + PII regex + Zod 重校验
├── trigger-dedupe.ts     # per event-map §6 防重复规则（session/localStorage）
├── consent.ts            # C-01 Privacy Banner dismissal tracking
└── validators.test.ts    # 单元测试（10 用例 · 全过）
```

---

## 2. 安装与初始化

### 2.1 安装依赖

```bash
npm install --save-dev zod@^3.23.0
```

> 当前 SDK 是 Vite SPA 的 ES Module；只需 `zod` 作为运行时依赖。已加入 `package.json` devDependencies。

### 2.2 Alpha 环境变量

```text
VITE_ENV=alpha              # 由 E-P0-08 env-decision 锁
VITE_ANALYTICS_KEY=...      # 公开 key（如启用远程 endpoint 鉴权；Phase 2 启用）
```

`VITE_ANALYTICS_KEY` 在 Phase 1 mock 模式不使用（仅本地写入 JSONL）。Phase 2 接 Supabase 时启用。

### 2.3 App 启动时 init（`src/main.tsx` 或 `src/App.tsx`）

```typescript
import { analytics } from '@/lib/analytics';

// 在 React 根 mount 前初始化
analytics.init({
  endpoint: import.meta.env.VITE_ANALYTICS_ENDPOINT ?? '/v1/analytics/events',
  app_surface: detectAppSurface(),  // 'web_homepage' / 'web_today_refresh' / ...
  verbose: import.meta.env.DEV,      // DEV 模式自动开启；PROD 强制 false
  // bypassWhitelist 仅 DEV；SDK 在 PROD 自动忽略
});

function detectAppSurface(): string {
  const path = window.location.pathname;
  if (path === '/' || path === '/today') return 'web_homepage';
  if (path.startsWith('/cities/')) return 'web_city_detail';
  if (path.startsWith('/moments/')) return 'web_moment_detail';
  if (path.startsWith('/unknown')) return 'web_unknown';
  if (path.startsWith('/echo')) return 'web_echo';
  if (path.startsWith('/witness')) return 'web_witness';
  return 'web_today_refresh';  // 默认
}
```

> **关键**：`app_surface` 是稳定枚举，**禁止动态拼接或运行时组合**。`detectAppSurface()` 是固定的 if-else 链。

---

## 3. 主动触发：`analytics.send(event, props)`

### 3.1 直接调用

```typescript
import { analytics } from '@/lib/analytics';

// 例：用户在 Homepage 看到 Daily 12 第 1 卡片
analytics.send('moment_impression', {
  moment_id: 'm_42',
  position: 1,
  city_id: 'kyoto',
  source_type: 'witness',
  edition_id: 'ed_2026_08_22',  // SDK 会自动加入（context）
});
```

### 3.2 返回值

```typescript
interface SendResult {
  sent: boolean;
  reason?: 'dedup' | 'invalid';
  rejections?: FieldRejection[];
}
```

- `sent: false, reason: 'dedup'` —— 防重复规则触发（per event-map §6）；事件被本地拦截，**不发服务端**
- `sent: false, reason: 'invalid'` —— 字段非法（白名单 / PII / schema）；事件被丢弃
- `sent: true` —— 已加入 transport queue（`sendBeacon` 或 `fetch`）

### 3.3 在 React 组件中调用（带 context）

```typescript
// src/components/Daily12Card.tsx
import { useEffect } from 'react';
import { analytics } from '@/lib/analytics';

export function Daily12Card({ moment, position }: Props) {
  const dispatchImpression = () => {
    analytics.send('moment_impression', {
      moment_id: moment.id,
      position,
      city_id: moment.city_id,
      source_type: moment.source_type,  // 'witness' / 'seed' / 'editorial'
      edition_id: moment.edition_id,
    });
  };

  // 在 React 中，最佳做法是配合 trackVisible（§4），而非手动 useEffect。
  // useEffect 仅用于 click-triggered events。
  return <Card onClick={dispatchImpression}>...</Card>;
}
```

### 3.4 各事件的典型触发点（与 trigger-diagram §2 对齐）

| 事件 | 触发器 | 推荐 SDK 调用位置 |
|---|---|---|
| `edition_viewed` | edition API 200 + grid 进入视口 | `<Daily12Grid>` mount + `trackVisible` |
| `moment_impression` | 单卡 ≥ 50% 视口 + ≥ 500 ms | `<Daily12Card>` + `trackVisible(0.5, 500)` |
| `moment_opened` | 路由切到 Moment Detail + 主图 200 | `<MomentDetailScreen>` onReady |
| `city_opened` | URL 切到 City + city API 200 | `<CityPageShell>` onReady |
| `city_section_viewed` | 章节 ≥ 60% + ≥ 800 ms | `<CitySectionPanel>` + `trackVisible(0.6, 800)` |
| `unknown_started` | Unknown Clues 主页就绪 + 第 1 clue API 200 | `<UnknownCluesBoard>` onReady |
| `unknown_revealed` | 服务端 `reveal_token` 校验通过 + Reveal 页就绪 | `<UnknownRevealScreen>` onServerConfirmed |
| `echo_started` | 用户键入 ≥ 1 非空字符 | `<EchoComposer>` onFirstInput |
| `echo_submitted` | 服务端 Echo API 200 + submission 落库 | `<EchoResultBanner>` onServerConfirmed |
| `witness_started` | 用户点 Witness Intro 第 1 个 `Continue` | `<WitnessIntroStep>` onContinueClick |
| `witness_permission_result` | 系统权限回调（granted/denied/restricted/not_determined） | `<WitnessStep>` onPermissionResolved |
| `witness_upload_started` | Submit 点击 + fetch 发起 | `<WitnessUploadStep>` onFetchStart |
| `witness_submitted` | 服务端返回 `submission_id` + 状态 `submitted`/`under_review` | `<WitnessResultStep>` onServerConfirmed |
| `witness_submit_failed` | 上传失败 + 重试耗尽 | `<WitnessResultStep>` onFailed |

---

## 4. 自动可见性触发：`analytics.trackVisible(el, event, props)`

### 4.1 API

```typescript
analytics.trackVisible(
  el: Element,
  event: AnalyticsEventName,   // 必须是 'moment_impression' / 'city_section_viewed' 之一
  props: Record<string, unknown>,
  opts?: {
    threshold?: number;       // 0~1, 默认 0.5 (impression) / 0.6 (section)
    dwellMs?: number;         // 默认 500 (impression) / 800 (section)
    once?: boolean;           // 默认 true（只触发一次）
    onVisibilityChange?: (v: boolean) => void;
  },
): () => void;  // 返回 disconnect 函数
```

### 4.2 实现语义

- 使用 `IntersectionObserver`（**不是** scroll listener / ResizeObserver）
- 元素进入视口（intersectionRatio ≥ threshold）→ 启动 `setTimeout(dwellMs)`
- 在 dwell 时间内元素退出视口 → `clearTimeout`
- dwell 时间到 → `analytics.send(event, props)`（**注意**：send 内部仍会做 dedupe）
- 触发成功 → observer 自动 disconnect（默认 `once: true`）

### 4.3 不在定时器触发 success

> `setTimeout` **不**触发"success 事件"。它仅作为 dwell timer，**唯一作用**是延迟调用 `send()`。
> send() 收到的 props 与无 dwell 模式完全相同；只是"用户是否看了 500ms"作为隐式条件。

**`send()` 本身**仍按 event-map §1.2 / §1.5 触发：组件 state = ready + IntersectionObserver 判定 + dwell 时间。三者全满足。

### 4.4 与 `moment_impression` 防滑回规则的关系

- 防滑回（不重复计）= 由 **dedupe** 强制（per event-map §6：30 分钟同 `moment_id`+`edition_id` 仅计一次）
- 即使用户滑回 1 卡片宽度再进入，dedupe 也会 reject
- `trackVisible` 不需要知道滑回；dedupe 在 SDK 全局层

### 4.5 用法示例

```typescript
// src/components/Daily12Card.tsx
import { useEffect, useRef } from 'react';
import { analytics } from '@/lib/analytics';

export function Daily12Card({ moment, position, editionId }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const disconnect = analytics.trackVisible(
      ref.current,
      'moment_impression',
      {
        moment_id: moment.id,
        position,
        city_id: moment.city_id,
        source_type: moment.source_type,
        edition_id: editionId,
      },
      { threshold: 0.5, dwellMs: 500 },
    );
    return disconnect;
  }, [moment.id, position, moment.city_id, moment.source_type, editionId]);

  return <div ref={ref}>...</div>;
}
```

---

## 5. 防重复规则（与 `event-map §6` 严格对齐）

| 事件 | 去重键 | 窗口 | 存储 |
|---|---|---|---|
| `edition_viewed` | `session_id + edition_id + app_surface` | session | sessionStorage |
| `moment_impression` | `session_id + moment_id + edition_id` | 30 min | sessionStorage |
| `moment_opened` | `session_id + moment_id + entry_point` | 30 min | sessionStorage |
| `city_opened` | `session_id + city_id + entry_point` | 15 min | sessionStorage |
| `city_section_viewed` | `session_id + city_id + section` | 15 min | sessionStorage |
| `unknown_started` | `session_id + unknown_id` | 1 hour | sessionStorage |
| `unknown_revealed` | `unknown_id` | lifetime | localStorage |
| `echo_started` | `session_id + city_id` | 1 hour | sessionStorage |
| `echo_submitted` | 服务端 confirmation | 1:1 | n/a（SDK 不 dedupe） |
| `witness_started` | `session_id` | session-once | sessionStorage |
| `witness_permission_result` | `session_id + permission_type` | session-once | sessionStorage |
| `witness_upload_started` | session 内 Submit 次数 | 1 次 / Submit | sessionStorage（标记 fired） |
| `witness_submitted` | `submission_id_hash` | lifetime | localStorage |
| `witness_submit_failed` | `submission_id_hash`（若有） | lifetime | localStorage |

> 实现细节：`src/lib/analytics/trigger-dedupe.ts` 的 `DEDUP_SPECS` 表是 source of truth。修改前必须更新 event-map v2 + PM 评审。

---

## 6. 字段白名单 + PII 检测

### 6.1 工作原理

```text
analytics.send(event, props)
  ↓
validateEventPayload(event, props)
  ├─ getAllowedFields(event)       # 从 schema.ts 派生
  ├─ sanitizePayload(...)          # 递归遍历
  │   ├─ 检查每个 key name         # F-01 ~ F-30 名单
  │   ├─ 检查每个 string value     # email/phone/IPv4 regex
  │   └─ 非白名单 key → 丢弃（不阻断事件）
  ↓
parse Zod schema(event)            # 类型校验
  ↓
buildEnvelope → transport
```

### 6.2 hard_rejected vs soft_rejected

- **hard_rejected**（drop 整个事件）：
  - 任何禁采字段名（`latitude` / `exif` / `email` 等）
  - 任何 PII pattern 值（email / phone / IPv4）
- **soft_rejected**（仅 drop 该字段，事件继续）：
  - 非白名单字段（开发时误传）
  - Schema 类型不匹配

> SDK 当前实现：hard_rejected → 整个事件 drop（最严格）；soft_rejected 暂仅 verbose 模式打印（不影响发送）。这是合理的（schema 校验后已经是合法 payload）。

### 6.3 Dev 模式 verbose

```typescript
// src/lib/analytics/index.ts 自动行为
if (import.meta.env.DEV) {
  CONFIG.verbose = true;  // console.warn dropped fields
}
```

- 生产环境 `verbose` 强制 false（`setVerbose(true)` 在生产被忽略）
- 生产 `bypassWhitelist` 强制 false（init 时校验）

### 6.4 用户主动禁用（**仅 dev**）

```typescript
// 仅 DEV 模式生效
analytics.init({
  endpoint: 'http://localhost:8787/v1/analytics/events',
  app_surface: 'web_homepage',
  bypassWhitelist: true,  // 跳过白名单；保留 PII 检测
});
```

> **永远不要**在生产 bundle 中启用 `bypassWhitelist`。SDK 在 init 时强制关闭（见 `index.ts:42-44`）。

---

## 7. Consent（B-01 / C-01）

### 7.1 API

```typescript
import { analytics } from '@/lib/analytics';

// 检查用户是否已 dismiss C-01 banner
if (!analytics.consent.isDismissed()) {
  // 展示 C-01 banner（与 Daily 12 不阻塞；与 edition_viewed 同时触发）
}

// 用户点击 banner 关闭按钮
banner.onClose = () => {
  analytics.consent.markDismissed();
};
```

### 7.2 持久化

- Key: `privacy_summary_dismissed_v1` (sessionStorage)
- 关闭后 session 内不再提示；新 session 会重新提示
- localStorage 不存 consent（与 forbidden-fields F-20 一致：避免跨 session 追踪）

### 7.3 与埋点的耦合

- C-01 banner 关闭**不**发新事件（per `consent-placement §3 C-01`）
- `edition_viewed` 与 C-01 同时触发；banner 不阻塞 edition_viewed
- C-02 ~ C-08 与埋点完全解耦（详见 `consent-placement §5`）

---

## 8. 服务端通信

### 8.1 传输层

- **首选**：`navigator.sendBeacon()` —— 浏览器关闭 / 切页时不丢失
- **回退**：`fetch(keepalive: true)` —— 老浏览器 / WebView
- SDK 在 `transport()` 函数中自动选择

### 8.2 失败处理

- 网络失败 / 4xx / 5xx：SDK **静默丢弃**（analytics 永不阻塞应用）
- 不重试（事件已 dedupe；重复发没意义）
- 失败详情仅在 dev verbose 模式 console.warn

### 8.3 Endpoint 默认

```typescript
endpoint: '/v1/analytics/events'  // 默认（与 E-P0-09 v1 path 对齐）
```

可在 init 时覆盖（如开发期指向 mock server）。

---

## 9. Session 管理

### 9.1 何时开始新 session

- 浏览器关闭 → 重开 → 新 session（sessionStorage 自动失效）
- 用户在站内刷新页面 → 同一 session（sessionStorage 保留）
- 用户离开站 > 30 min 再回 → 新 session（待产品决策；当前实现 = 持续 session）

### 9.2 API

```typescript
analytics.startSession();  // 强制开始新 session（用于 deeplink 等场景）
analytics.endSession();    // 清除当前 session id（仅当前页有效）
```

> 一般应用无需调用；session 由 SDK 自动管理。

### 9.3 与 E-P0-08 集成

- Alpha 环境：sessionStorage 同源（`setheearth-alpha.vercel.app`）
- Production：sessionStorage 同源（`see-earth.vercel.app`）
- Vercel Preview 默认 same-origin → sessionStorage 隔离天然成立

---

## 10. 错误处理与监控

### 10.1 SDK 不抛错

- 任何字段非法 / 网络失败 / 服务端 reject → SDK 静默
- Analytics 永远不破坏 app

### 10.2 调试工具

```typescript
analytics.describeEvent('moment_impression');
// → {
//   name: 'moment_impression',
//   schemaKeys: ['moment_id', 'position', 'city_id', 'source_type', 'edition_id']
// }
```

返回当前事件的允许字段列表，便于代码 review。

### 10.3 E2E 调试

```typescript
// 在 dev console 中
analytics.setVerbose(true);
// 所有 dropped fields 会 console.warn
```

---

## 11. 与 iOS 的对齐

### 11.1 iOS 必须使用同一 contract

| Web 字段 | iOS 对应 | 必须一致 |
|---|:---:|:---:|
| `app_surface` | `app_surface` | ✅ |
| `permission_type` / `result` | 同 | ✅ |
| `media_type` | `media_type`（iOS 多 `live_photo`） | ✅（共用 enum） |
| `network_class` | 同 | ✅ |
| `location_mode` | 同 | ✅ |
| `error_category` | 同 | ✅ |
| `submission_id` (8 位 hash) | 同（iOS 也只发 hash） | ✅ |

### 11.2 iOS 独有

- `live_photo` 仅 iOS 支持（Web 没有）；enum 包含
- iOS 不需要 Consent Banner（C-01 是 Web 限定）

### 11.3 iOS 严禁

- ❌ iOS 私造 `witness_*` 字段命名空间（与 Web 一致）
- ❌ iOS 不在事件中发 `info_plist_usage_descriptions`
- ❌ iOS 不发完整 UA

---

## 12. 与 V1 必答问题的对应

| V1 必答问题 | 主要支撑事件 | SDK 触发点 |
|---|---|---|
| #1 用户浏览 Daily 12 | `edition_viewed` + `moment_impression` | `<Daily12Grid>` + `<Daily12Card>` |
| #2 Moment → City 转化 | `moment_opened` → `city_opened` → `city_section_viewed` | 各 Detail 组件 onReady |
| #3 Unknown 完成率 | `unknown_started` → `unknown_revealed` → `city_opened.entry_point=unknown_reveal` | Unknown 组件 onReady |
| #4 Witness 完成真实提交 | `witness_started` → `witness_permission_result` → `witness_upload_started` → `witness_submitted` / `witness_submit_failed` | Witness Flow 各 Step |
| #5 Daily 12 供应稳定性 | `edition_viewed`（连续天数）+ `witness_submitted`（来源）+ `moment_impression.source_type` | Daily12 + Witness |

---

## 13. 测试

### 13.1 单元测试

```bash
node --experimental-strip-types --test src/lib/analytics/validators.test.ts
```

当前 10 用例全过：
- `F-01` / `F-11` / `F-25` 字段名拒绝
- email / IPv4 PII 检测
- whitelist 强制
- 14 事件最小 payload 全合法
- 未知事件名拒绝
- `submission_id` 8 位 hex 校验

### 13.2 Privacy Leak Test

详见 `privacy-leak-test-v1.md`：
- 模拟发送全套 14 事件
- 扫描禁采字段（F-01 ~ F-30）
- 公开图片 EXIF 检查
- CI 集成

### 13.3 Phase 1 集成测试

Phase 1 = JSONL 文件接收；测试脚本可逐行扫描：
```bash
bash scripts/privacy-leak-test.sh \
  --input dist/analytics.phase1.jsonl \
  --expected-zh 'we record 14 events'
```

---

## 14. 部署清单

| 步骤 | Owner | 状态 |
|---|---|---|
| 1. `npm install zod` | E-P0-07 | ✅ Done |
| 2. SDK 代码合并 | E-P0-07 | ✅ Done |
| 3. 单元测试 10 用例通过 | E-P0-07 | ✅ Done |
| 4. `<App>` 在 `main.tsx` 调用 `analytics.init` | Frontend (待 E-P0-02 Phase 1 完成后) | ⏸ 待 E-P0-02 |
| 5. 各组件集成 `analytics.send` / `trackVisible` | Frontend | ⏸ Phase 2 |
| 6. 服务端 endpoint `POST /v1/analytics/events` | Backend (E-P0-02 Phase 2) | ⏸ 待 E-P0-02 |
| 7. Privacy leak test CI | E-P0-07 + DevOps | ⏸ Phase 2 |
| 8. E-P0-10 监控告警 owner | E-P0-10 | ⏸ Phase 2 |

---

## 15. DO NOT

- ❌ 不发送自由文本（`description` / `comment` / Echo body）到 Analytics
- ❌ 不发送精确位置（`latitude` / `longitude` / `accuracy_meters`）
- ❌ 不发送原始 EXIF（任何 `exif.*` 字段）
- ❌ 不发送图片 URL token（`?token=...`）
- ❌ 不使用 setTimeout 触发 success 事件（仅作 dwell timer）
- ❌ 不重复曝光（dedupe 自动阻止）
- ❌ 不引入 14 事件外的新事件（需 PM 评审 + 更新 event-map）
- ❌ 不修改事件名（snake_case 锁定）
- ❌ 不在生产环境关闭 PII 检测 / 服务端 reject
- ❌ 不修改 Round 1 已 LOCKED 的设计文档

---

## 16. 自验收 Acceptance Criteria

- [x] 14 事件 schema 与 event-map §5 一致
- [x] 字段白名单覆盖所有事件
- [x] PII 检测覆盖 email / phone / IPv4
- [x] 防重复规则与 event-map §6 一致（per event）
- [x] IntersectionObserver + 500ms / 800ms 阈值
- [x] 不使用 setTimeout 触发 success（仅作 dwell timer）
- [x] 开发环境 verbose 模式可临时关闭白名单（仅 dev）
- [x] Alpha 流量通过 `app_surface` + `env` 字段隔离
- [x] `submission_id` 仅 8 位 hash
- [x] 单元测试 10 用例全过
- [x] 与 E-P0-09 contract 字段名一致
- [x] 与 E-P0-05 位置隔离禁采清单一致
- [x] C-01 Consent Banner dismissal tracking

---

**End of sdk-integration-v1.md**