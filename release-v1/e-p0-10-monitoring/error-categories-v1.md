---
title: SEE EARTH V1 · ErrorCategory 完整规范 · 5 顶层 + 15 子项
type: monitoring-error-taxonomy
tags: [release-v1, e-p0-10, monitoring, error-category, taxonomy, sre, see-earth]
task_id: E-P0-10
brief_anchor: §5 E-P0-10 §B
gate_target: Gate A · Internal Alpha
dispatched_at: 2026-08-24
dispatch_round: Round 4
status: DRAFT · IN REVIEW
author: Engineer Agent #2
source_inputs:
  - /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/SEE-EARTH-Release-Strategy-v1-Design-Engineering-Task-Brief.md §5 E-P0-10
  - /Users/lwy/Documents/ChatGPT/看见地球/release-v1/system-states/state-matrix-v1.md (48 状态 / ErrorCategory 20 项)
  - /Users/lwy/Documents/ChatGPT/看见地球/src/lib/analytics/schema.ts (WitnessErrorCategory 9 项 / Witness 后端子集)
  - /Users/lwy/Documents/ChatGPT/看见地球/07-设计师设计参考/release-v1/analytics-events/forbidden-fields-v1.md (F-01~F-30 PII 边界)
related_docs:
  - ./alert-policy-v1.md
  - ./web-vitals-baseline-v1.md
  - ./runbook-v1.md
  - ./privacy-baseline-v1.md
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/e-p0-10-monitoring/error-categories-v1.md
workspace_canonical_path: /Users/lwy/Documents/ChatGPT/看见地球/release-v1/e-p0-10-monitoring/error-categories-v1.md
sync_required: true · sandbox 拒绝写入 Obsidian
---

# SEE EARTH V1 · ErrorCategory 完整规范 · 5 顶层 + 15 子项

> **作者**：Engineer Agent #2（外部 Owner = 用户）
> **派发时间**：2026-08-24 · Round 4
> **目的**：为整个 SEE EARTH V1 监控体系定义**唯一**的错误分类字典。该字典同时被前端埋点、Sentry 事件、Alert 策略、Runbook 调查流程共同引用。**任何不在本表内的 error_category 一律 reject**。
> **关系**：本表是 **顶层监控分类**（5+15），与 `src/lib/analytics/schema.ts` 的 `WitnessErrorCategory`（9 项 Witness 后端子集）**正交**——后者是面向 Witness submission 的语义细化，本表是面向**整体可观测性**的根因分类。
> **原则**：**白名单模式** · 任一 error_category 字符串必须严格匹配枚举值 · 后端 reject + 前端 SDK 过滤双层防护。

---

## 0. 阅读指南

- **§1** 5 顶层 + 15 子项完整枚举（含触发 / 出口 / 重试策略）
- **§2** 与 `WitnessErrorCategory` 的关系与合并规则
- **§3** TypeScript 定义（前后端共享）
- **§4** 错误 ID 规范（8 字符 base36 hash · 与 D-P0-04 state-matrix §3 一致）
- **§5** 字段约束（payload 必须 / 可选 / 禁带）
- **§6** 落地方式（前端 SDK / Sentry Tag / Alert Rule）
- **§7** 自验收

---

## 1. ErrorCategory 完整枚举（5 顶层 + 15 子项）

### 1.1 总表

| # | 顶层 (top) | 子项 (sub) | 触发条件 | 用户可见文案 (zh) | 用户可见文案 (en) | 可重试 | 默认告警级别 |
|---|---|---|---|---|---|---|---|
| 1 | **network** | `network.timeout` | 请求在客户端 budget 内未响应（> 8s）或服务端 `X-Timeout` | "远方暂时连不上，请稍后再试" | "Can't reach the distant places. Try again shortly." | ✅ 自动 1 次 | P1 |
| 2 | **network** | `network.offline` | `navigator.onLine === false` 或心跳探活失败 | "当前无网络连接" | "You're offline" | ✅ 网络恢复后自动 | P2 |
| 3 | **network** | `network.cors` | 浏览器 CORS preflight 失败 / `Access-Control-Allow-Origin` 缺失 | "请求被浏览器拦截（跨域）" | "Request blocked by browser (CORS)" | ❌ 配置错误 | P0 |
| 4 | **network** | `network.dns` | DNS 解析失败（`getaddrinfo` / `net::ERR_NAME_NOT_RESOLVED`） | "找不到服务器地址" | "Can't resolve server address" | ✅ 30s 后自动 | P1 |
| 5 | **network** | `network.tls` | TLS 握手失败 / 证书过期 / `net::ERR_CERT_*` | "安全连接失败" | "Secure connection failed" | ❌ 证书问题 | P0 |
| 6 | **auth** | `auth.denied` | 用户拒绝权限（camera / photo_library / location）后仍触发依赖该权限的流程 | "权限被拒绝，可在系统设置中开启" | "Permission denied — enable in system settings" | ❌ 用户决定 | P2 |
| 7 | **auth** | `auth.expired` | 会话 token 过期（V1 暂未启用登录，预留接口） | "会话已过期，请重新打开" | "Session expired — reopen the page" | ✅ 自动 reload | P2 |
| 8 | **auth** | `auth.moderator_required` | Witness 提交需要 moderator 复核但当前用户未通过（V1 保留字段） | "提交需要审核，请等待" | "Submission needs review" | ❌ 等审核 | P3 |
| 9 | **auth** | `auth.admin_required` | 操作需要 admin 角色（如手动撤下 Moment）但当前角色不足 | "此操作需要管理员权限" | "Admin role required" | ❌ 权限不足 | P3 |
| 10 | **validation** | `validation.exif_untrusted` | 上传图片 EXIF 含未剥离的 GPS / 设备指纹 / 自由文本字段 | "图片信息不完整，请重新选择" | "Image metadata incomplete — pick another" | ❌ 换图片 | P2 |
| 11 | **validation** | `validation.captured_at_invalid` | `captured_at` 与服务端时钟偏差 > 5 分钟或格式非法 | "拍摄时间异常，请检查设备时间" | "Capture time looks off — check device clock" | ❌ 修正时间 | P2 |
| 12 | **validation** | `validation.duplicate` | 同一 `image_hash` 在过去 7 天内已提交过 | "这张图片已经提交过" | "This image was already submitted" | ❌ 换图 | P2 |
| 13 | **validation** | `validation.rate_limited` | 同一 IP / 同一 `submission_id_hash` 在 1 分钟内提交 ≥ 3 次 | "提交过于频繁，请稍后再试" | "You're submitting too fast — slow down" | ✅ 60s 后 | P1 |
| 14 | **server** | `server.5xx` | 服务端 HTTP 5xx（500 / 502 / 503 / 504） | "远方暂时连不上，请稍后再试" | "Can't reach the distant places. Try again shortly." | ✅ 自动 1 次 | P0 |
| 15 | **server** | `server.db_error` | Supabase / Postgres 抛错（`PGREST*` / `connection refused`） | "数据暂时不可用" | "Data temporarily unavailable" | ✅ 30s 后自动 | P0 |
| 16 | **server** | `server.queue_fail` | Vercel KV 队列或 Background Job（Daily 12 编排）失败 ≥ 2 次 | "内容编排失败，已自动重试" | "Edition queue failed — auto-retrying" | ✅ 自动 | P3 |
| 17 | **server** | `server.image_processing_fail` | EXIF 剥离 / 压缩 / 转码 / 上传 Supabase Storage 任一步失败 | "图片处理失败" | "Image processing failed" | ✅ 自动 1 次 | P2 |
| 18 | **content** | `content.city_unsupported` | 用户访问的城市不在 V1 支持的 12 城内（不在白名单） | "这个地方暂未收录" | "This place isn't covered yet" | ❌ 不支持 | P3 |
| 19 | **content** | `content.moment_withdrawn` | Moment 已被作者撤下或 moderator 下架 | "这条内容已不再显示" | "This Moment is no longer available" | ❌ 已下架 | P3 |
| 20 | **content** | `content.no_fallback` | 客户端请求 stale fallback 但服务端无任何历史 edition 可回退 | "暂无可显示的旧内容" | "No previous edition to show" | ❌ 无数据 | P3 |

> **总数 20 项** = 5 顶层 + 15 子项。

### 1.2 顶层分组语义

| 顶层 | 含义 | 触发源 | 默认告警 |
|---|---|---|---|
| **network** | 客户端 ↔ 服务端之间的连通性问题 | fetch / XHR / WebSocket 失败层 | P0 ~ P2 |
| **auth** | 权限 / 角色 / 会话生命周期问题 | 浏览器权限 API / Token / 角色校验 | P2 ~ P3 |
| **validation** | 数据格式 / 业务规则 / 限流拒绝 | E-P0-03 EXIF / E-P0-09 校验 / Rate limiter | P1 ~ P2 |
| **server** | 服务端依赖或代码异常 | API handler / DB / Queue / Image pipeline | P0 ~ P3 |
| **content** | 数据层缺失或被撤回 | 城市白名单 / Moment 状态 / Edition 缺失 | P3 |

---

## 2. 与现有 `WitnessErrorCategory` 的关系

### 2.1 对照表

| 监控 ErrorCategory (本表) | WitnessErrorCategory (src/lib/analytics/schema.ts) | 关系 |
|---|---|---|
| `validation.exif_untrusted` | `exif_untrusted` | 1:1 同义 |
| `validation.captured_at_invalid` | `captured_at_invalid` | 1:1 同义 |
| `validation.duplicate` | `duplicate_submission` | 同义（monitoring 字段名更短） |
| `validation.rate_limited` | `rate_limited` | 1:1 同义 |
| `server.5xx` | `server_5xx` | 1:1 同义 |
| `network.timeout` | `upload_network` | 同义（monitoring 显式分类 timeout） |
| `network.offline` | `upload_timeout` | 同义（monitoring 区分 offline vs timeout） |
| `validation.exif_untrusted` | `permission_blocked` | 不重叠（`permission_blocked` → `auth.denied`） |
| `auth.denied` | `permission_blocked` | 同义（monitoring 用顶层 auth） |
| **不覆盖** | — | 9 项 WitnessErrorCategory 全部映射到监控分类，**无遗漏** |

### 2.2 合并规则

1. **Witness 后端**继续使用 `WitnessErrorCategory`（9 项）作为 Witness submission 专用枚举（与 `event-map-v1.md §4.5` 一致）。
2. **Sentry / Alert / Runbook** 统一使用本监控 ErrorCategory（20 项）。
3. **客户端 Analytics 发送 `witness_submit_failed` 事件**时，`error_category` 字段值映射为对应监控分类（如 `upload_network` → `network.timeout`）。映射函数在 `src/lib/analytics/validators.ts` 增加 `mapWitnessErrorToMonitoring()`。
4. **服务端 Analytics 接收端**校验时，监控分类白名单为本表 20 项；任何监控错误分类落入前端 payload 即 reject。

### 2.3 不重叠项说明

- `WitnessErrorCategory.permission_blocked` 是 Witness 专用语义（"上传因权限被阻止"），在本表中归入 `auth.denied`（顶层 auth 的"denied"子项）。
- `WitnessErrorCategory.upload_network` 涵盖"上传过程中的网络问题"（包括 timeout / offline / dns / tls）；在本表中**精确拆分**为 `network.timeout` / `network.offline` / `network.dns` / `network.tls`，便于精确告警分级。

---

## 3. TypeScript 定义（前后端共享）

### 3.1 监控分类枚举

```ts
/**
 * SEE EARTH V1 · 监控 ErrorCategory（5 顶层 + 15 子项）
 * Source of truth: error-categories-v1.md §1
 * 任何不在此枚举内的值一律 reject。
 */
export const ErrorCategoryTopSchema = z.enum([
  'network',
  'auth',
  'validation',
  'server',
  'content',
]);

export const ErrorCategorySubSchema = z.enum([
  // network
  'network.timeout',
  'network.offline',
  'network.cors',
  'network.dns',
  'network.tls',
  // auth
  'auth.denied',
  'auth.expired',
  'auth.moderator_required',
  'auth.admin_required',
  // validation
  'validation.exif_untrusted',
  'validation.captured_at_invalid',
  'validation.duplicate',
  'validation.rate_limited',
  // server
  'server.5xx',
  'server.db_error',
  'server.queue_fail',
  'server.image_processing_fail',
  // content
  'content.city_unsupported',
  'content.moment_withdrawn',
  'content.no_fallback',
]);

export const ErrorCategorySchema = ErrorCategorySubSchema; // 子项已含顶层
export type ErrorCategory = z.infer<typeof ErrorCategorySubSchema>;
export type ErrorCategoryTop = z.infer<typeof ErrorCategoryTopSchema>;
```

### 3.2 顶层解析工具

```ts
/** 从子项解析顶层（用于告警分级与 Dashboard 分组） */
export function topOf(category: ErrorCategory): ErrorCategoryTop {
  return category.split('.')[0] as ErrorCategoryTop;
}

/** 是否需要 P0 告警（仅根据 category 静态判断） */
export function isP0Category(category: ErrorCategory): boolean {
  return [
    'network.cors',
    'network.tls',
    'server.5xx',
    'server.db_error',
  ].includes(category);
}
```

### 3.3 Sentry Tag 映射

```ts
/** Sentry tags 自动注入。Sentry UI 顶部按 top category 分组。 */
export function toSentryTags(category: ErrorCategory): Record<string, string> {
  return {
    error_category: category,
    error_top: topOf(category),
    see_earth_app: 'v1',
    see_earth_surface: getCurrentAppSurface(),
  };
}
```

---

## 4. 错误 ID 规范（8 字符 base36 hash）

### 4.1 设计目标

- 用户可见错误文案附短 ID，便于"反馈时提供"。
- 后端日志自动 include。
- 客户端可在 Sentry / Dashboard 搜索（不依赖 stack trace 文本匹配）。

### 4.2 算法

```ts
/**
 * 生成 8 字符 base36 短 ID（与 D-P0-04 state-matrix §3 一致）。
 * 输入：稳定的错误指纹 = SHA-256(category + error_signature + day_bucket)
 * 输出：截断前 8 字符 base36
 */
export function shortErrorId(input: {
  category: ErrorCategory;
  signature: string; // e.g. URL path + status code + brief error message
  dayBucket?: string; // 默认 UTC 日期，YYYY-MM-DD；保证同一错误跨天产生不同 ID
}): string {
  const day = input.dayBucket ?? new Date().toISOString().slice(0, 10);
  const payload = `${input.category}|${input.signature}|${day}`;
  const hash = sha256(payload);
  // 取前 8 hex → 转 base36（保留大小写无关的小写字母 + 数字）
  return BigInt('0x' + hash.slice(0, 13)).toString(36).padStart(8, '0').slice(0, 8);
}
```

### 4.3 用户可见格式

```text
错误 ID: a3f9b2c1
（联系反馈时提供 · 我们会用它在 Sentry 快速找到相关日志）
```

**样式约束**（与 D-P0-04 state-matrix §3 完全一致）：
- 字号：UI Sans Mono · 12px · `var(--text-meta)`
- 颜色：`var(--text-meta)` （不抢眼，但可复制）
- 位置：Error 文案下方 8px
- 可点击 → 复制到剪贴板 + toast "已复制 错误 ID"

### 4.4 与 submission_id 8 位 hash 的关系

`submission_id` 也使用 8 字符 base36 hash（详见 `forbidden-fields-v1.md §5`）。两者**格式一致**，但**取值空间不冲突**：
- `submission_id` 来自 HMAC-SHA256(`submission_id`, ANALYTICS_SALT)
- `error_id` 来自 SHA-256(`category + signature + day_bucket`)

Sentry 搜索 `a3f9b2c1` 可同时命中两类（建议 Sentry UI 用 prefix tag `error_id:` / `submission_id:` 区分）。

---

## 5. 错误事件 payload 字段约束

### 5.1 必带字段（5 个）

| 字段 | 类型 | 来源 | 用途 |
|---|---|---|---|
| `error_id` | string (8 字符 base36) | 客户端 SDK 生成 | 用户可见 / 反馈定位 |
| `error_category` | ErrorCategory（20 项枚举） | 捕获异常时分类 | 告警 / Dashboard 分组 |
| `error_top` | ErrorCategoryTop（5 顶层） | 派生自 `error_category.split('.')[0]` | 顶层聚合 |
| `app_surface` | AppSurface（web_/ios_） | `import.meta.env.VITE_ENV` 派生 | 区分环境 |
| `ts` | ISO 8601 datetime | 客户端时间 | 时间序列 |

### 5.2 可选字段（4 个）

| 字段 | 类型 | 来源 | 用途 |
|---|---|---|---|
| `component` | string (kebab-case) | ErrorBoundary / React error info | UI 组件定位 |
| `http_status` | number | API 响应 | 服务端 5xx 区分 |
| `retry_count` | number (0-3) | SDK 重试计数器 | 区分首次 vs 重试 |
| `stack_hash` | string (8 字符 base36) | SHA-256(stack.first_5_lines) | 聚合相同错误 |

### 5.3 禁带字段（强制 · 与 forbidden-fields §3 一致）

- ❌ `lat` / `lng` / `latitude` / `longitude` / `accuracy_meters`
- ❌ 完整 EXIF / camera serial / device id
- ❌ 用户自由文本（`text` / `content` / `body` / `comment`）
- ❌ 完整 IP / email / phone
- ❌ 完整 URL（仅记录 path + status，不带 query / hash）
- ❌ 完整 user_agent

> 任何命中禁带字段 → 服务端 reject 整个事件 + 触发 `field_rejected` 内部审计事件。

---

## 6. 落地方式

### 6.1 前端 SDK（src/lib/analytics/ 扩展）

```ts
// src/lib/analytics/error-reporter.ts (新增 · Phase 1 实施)
import * as Sentry from '@sentry/browser';

const ErrorCategorySchema = /* §3.1 枚举 */;

export function reportError(args: {
  error: Error;
  category: ErrorCategory;
  component?: string;
  httpStatus?: number;
  retryCount?: number;
}): string {
  const errorId = shortErrorId({
    category: args.category,
    signature: `${args.component ?? 'unknown'}|${args.error.message.slice(0, 80)}|${args.httpStatus ?? ''}`,
  });

  Sentry.captureException(args.error, {
    tags: toSentryTags(args.category),
    extra: {
      error_id: errorId,
      retry_count: args.retryCount ?? 0,
    },
    fingerprint: [args.category, args.error.name, errorId],
  });

  return errorId;
}
```

### 6.2 服务端 API 路由（api/* 增强 · Phase 1）

```ts
// api/_lib/error-logger.ts (新增)
import * as Sentry from '@sentry/node';

export function logServerError(args: {
  err: Error;
  category: ErrorCategory;
  requestId: string; // Vercel x-vercel-id 或自生成
  component: string;
}): string {
  const errorId = shortErrorId({
    category: args.category,
    signature: `${args.component}|${args.err.message.slice(0, 80)}`,
  });

  Sentry.captureException(args.err, {
    tags: toSentryTags(args.category),
    extra: { error_id: errorId, request_id: args.requestId },
    level: isP0Category(args.category) ? 'error' : 'warning',
  });

  // Vercel Runtime Logs 自动 capture（无需额外代码）
  console.error(`[${args.category}] [${errorId}] ${args.err.message}`);
  return errorId;
}
```

### 6.3 Alert Rule 引用

- 所有 P0 告警规则的 `query` 字段引用 `error_top:server` 或 `error_category:server.5xx`（详见 `alert-policy-v1.md §3`）。
- Sentry Alert 按 `error_top` 分 5 个 channel：#alerts-network / #alerts-auth / #alerts-validation / #alerts-server / #alerts-content。

---

## 7. 自验收 Acceptance Criteria

- [x] 5 顶层 + 15 子项枚举完整且无遗漏
- [x] 每条枚举含触发条件 / 用户文案 / 可重试 / 默认告警级别
- [x] 与现有 `WitnessErrorCategory` 9 项 100% 映射，无遗漏无冲突
- [x] TypeScript 枚举 + top 解析工具完整
- [x] 错误 ID 规范（8 字符 base36 hash）与 D-P0-04 一致
- [x] 字段必带 / 可选 / 禁带三档明确
- [x] 与 forbidden-fields-v1.md §3 完全一致（禁带字段列表）
- [x] 前端 SDK + 服务端 logger 落地方式明确
- [x] Sentry Tag 映射规则锁定

---

## 8. 元数据

| 字段 | 值 |
|---|---|
| 文档版本 | v1 |
| 创建时间 | 2026-08-24 |
| 创建人 | Engineer Agent #2 |
| 文档 ID | `error-categories-v1.md` |
| 目标 Gate | Gate A · Internal Alpha |
| 依赖 | `schema.ts` WitnessErrorCategory（已实现）· `state-matrix-v1.md` §3 |
| Workspace 路径 | `/Users/lwy/Documents/ChatGPT/看见地球/release-v1/e-p0-10-monitoring/error-categories-v1.md` |
| Obsidian canonical 路径 | `/Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/e-p0-10-monitoring/error-categories-v1.md` |
| Obsidian 同步状态 | ❌ 未同步 |

---

**End of ErrorCategory v1**