---
title: SEE EARTH V1 · E-P0-10 Phase 1 · Vercel Runtime Logs 配置
type: monitoring-deployment-doc
tags: [release-v1, e-p0-10, monitoring, phase-1, vercel-runtime-logs, deployment, see-earth]
task_id: E-P0-10
gate_target: Gate A · Internal Alpha
phase: Phase 1
dispatched_at: 2026-08-24
status: DRAFT · IN REVIEW
author: Engineer Agent #2
related_docs:
  - ../e-p0-10-monitoring/privacy-baseline-v1.md
  - ../e-p0-10-monitoring/secret-management-v1.md
  - ./vercel-env-setup.md
  - ./phase1-deployment-report.md
workspace_canonical_path: /Users/lwy/Documents/ChatGPT/看见地球/release-v1/e-p0-10-monitoring-phase1/vercel-runtime-logs-setup.md
sync_required: true · sandbox 拒绝写入 Obsidian
---

# SEE EARTH V1 · Vercel Runtime Logs 配置（Phase 1 必做）

> **作者**：Engineer Agent #2（外部 Owner = 用户）
> **派发时间**：2026-08-24 · Phase 1
> **目的**：让团队能在 Vercel Dashboard 实时看到 API 请求 / 响应日志，无需任何额外代码。
> **范围**：Phase 1 仅需 Dashboard 配置 + 输出文档化；**无需新增代码**（Vercel Runtime Logs 自动 capture）。

---

## 0. 阅读指南

- **§1** 核心概念（Vercel Runtime Logs 自动工作）
- **§2** 配置步骤（Dashboard）
- **§3** 日志脱敏（Vercel 自动 + 我们额外规则）
- **§4** 与 Sentry 的分工
- **§5** 验证方式
- **§6** 故障排查

---

## 1. 核心概念

### 1.1 Vercel Runtime Logs 自动 capture

```text
✅ Vercel 自动 capture 的内容：
  - 所有 console.log / console.warn / console.error
  - 所有 unhandled exception（未捕获错误）
  - 所有 unhandled promise rejection
  - API route handler 的请求 / 响应（method / path / status / duration）
  - 每次 deploy 的启动日志
  - Edge Function / Serverless Function 的 stdout / stderr

❌ Vercel 不会 capture 的内容：
  - 客户端浏览器 console（需前端 SDK 上报）
  - 数据库查询日志（需 DB 自身 logging）
  - 第三方 API 调用日志（除非我们显式 console.log）
```

### 1.2 与 Sentry 的分工

| 通道 | Runtime Logs | Sentry |
|---|---|---|
| **目的** | 调试 / 性能分析 | 错误聚合 / 告警 |
| **保留期** | 7 天（Vercel Hobby）· 30 天（Pro） | 90 天（Sentry 默认） |
| **粒度** | 每条 console.log / warn / error | 每条异常 |
| **搜索** | 文本 + 时间范围 | tag + fingerprint + 用户属性 |
| **告警** | ❌（仅日志） | ✅（Alert Rule → Slack / PagerDuty） |
| **聚合** | ❌（原始日志） | ✅（同 fingerprint 合并） |

**使用模式**：

```text
- 错误首次出现 → 看 Sentry（聚合后的 stack trace + 上下文）
- 错误上下文细节 → 看 Runtime Logs（原始 console 输出 + 时间线）
- 性能分析（API latency）→ 看 Runtime Logs 的 duration_ms
- 告警路由 → Sentry → Slack / PagerDuty
```

---

## 2. 配置步骤

### 2.1 进入 Logs 页面

```text
1. 打开 https://vercel.com/dashboard
2. 选择 sethearth project
3. Logs 标签（顶部菜单）

看到的视图：
  - Streams（实时）
  - Sources（按函数）
  - Time range selector
  - Filter by level（info / warn / error）
  - Search bar
```

### 2.2 启用 Runtime Logs

```text
默认配置（Vercel Hobby）：
  ✅ Runtime Logs 自动启用（无需手动操作）
  ✅ 保留期：7 天
  ✅ Sources：Edge Functions + Serverless Functions + Build Logs

Vercel Pro 升级路径（Phase 2 评估）：
  - 保留期：30 天
  - Log drains：可推送到 Datadog / S3
  - 自定义 retention
```

**Phase 1 不需要任何代码修改**。Vercel Runtime Logs 自动 capture 所有 `console.*` 调用。

### 2.3 配置保留期（仅 Vercel Pro）

```text
⚠️ Vercel Hobby plan 固定 7 天保留期，无法配置。
Phase 1 默认 7 天。
Phase 2 如需 30 天 → 升级到 Vercel Pro（评估中）。
```

### 2.4 配置 Log Levels（按需）

```text
Settings → Logs → Log Levels
  - Info：默认 capture console.log
  - Warn：默认 capture console.warn
  - Error：默认 capture console.error

✅ Phase 1 默认全部 capture（与 privacy-baseline-v1.md §2 一致）
```

---

## 3. 日志脱敏

### 3.1 Vercel 自动脱敏（默认行为）

```text
Vercel 自动处理：
  ✅ Authorization headers → [REDACTED]
  ✅ Cookie headers → [REDACTED]
  ✅ API tokens in URL query → [REDACTED]
  ✅ IP 地址 → 保留前 3 段 / 24（与 privacy-baseline-v1.md §2.5 一致）
```

### 3.2 我们额外脱敏（在代码中）

`api/_lib/sentry-server.ts` 已实现 PII 脱敏（详见该文件 §3）。所有 `console.error` 调用前会经过 `redactPayload()`：

```ts
// 禁带字段名 → 替换为 [REDACTED]
const FORBIDDEN_KEYS = new Set([
  'latitude', 'longitude', 'exif', 'gps_latitude', 'gps_longitude',
  'text', 'content', 'body', 'message', 'comment',
  'user_id', 'uid', 'device_id', 'email', 'phone',
  'ip_address', 'ip', 'cookie',
  'image_token', 'cdn_token', 'signed_url',
  'user_agent', 'fingerprint',
]);

// PII pattern（IPv4 / phone / email）→ 替换为 [REDACTED]
const PII_PATTERNS = [
  /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g,    // IPv4
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,  // email
  /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g,  // phone
];
```

### 3.3 验证脱敏（每次 deploy 后）

```bash
# 在 Vercel Dashboard → Logs → 搜索：
"password=" OR "secret=" OR "@gmail.com" OR "@sentry.io"

# 期望：
# - 无任何结果（如果脱敏正确）
# 或
# - 仅 [REDACTED] 标记（如果脱敏生效）
```

---

## 4. Phase 1 输出格式（与 `api/_lib/sentry-server.ts` 对齐）

### 4.1 标准日志格式

```text
[monitoring] 🔴 server.5xx · error_id: a3f9b2c1 · request_id: k7m3n9p2 · Database connection refused
{
  "component": "edition-api",
  "httpStatus": 503,
  "context": { ...redacted... }
}
```

### 4.2 error_id 与 request_id 区别

| ID | 来源 | 用途 |
|---|---|---|
| `error_id`（8 字符 base36） | shortErrorId(category + signature + day) | 用户可见 / 反馈定位 / Sentry 搜索 |
| `request_id`（8 字符 base36） | shortRequestId(Vercel x-vercel-id + signature) | 服务端日志聚合 / 链路追踪 |

两者格式一致但取值空间独立（详见 `error-categories-v1.md §4.4`）。

---

## 5. 验证方式

### 5.1 Phase 1 验证（deploy 后立即）

```text
1. 访问 Alpha URL：https://sethearth-git-alpha-seethearth.vercel.app/
2. 在浏览器 DevTools → Console 粘贴：
   fetch('/api/health').catch(() => {})
3. 进入 Vercel Dashboard → Logs
4. 期望看到：
   - 至少 1 条 build 日志（deploy 启动）
   - 1 条 console.log（initSentry 初始化）
   - 1 条 web-vitals breadcrumb（Sentry 客户端 breadcrumb）
5. 故意 throw error：
   throw new Error('test-runtime-logs');
6. Vercel Dashboard → Logs 立即看到：
   - Unhandled Error
   - Stack trace
   - Vercel 自动隐去敏感 headers
```

### 5.2 长期验证（7 天 baseline）

```text
1. 7 天后进入 Vercel Dashboard → Analytics → Web Vitals
2. 期望看到 LCP / INP / CLS / TTFB / FCP 5 维度数据
3. 进入 Logs → 搜索 `error_id` 应能检索到对应事件
4. 与 baseline-alpha-vercel.md 对照（如已生成）
```

### 5.3 Bundle size 验证（隐私）

```bash
# scripts/verify-no-secret-in-bundle.sh（Phase 2 实施）
# 当前可手动跑：
grep -rE "(ANALYTICS_SALT|DB_URL|DB_SERVICE_KEY|ALPHA_PASSWORD)" dist/ 2>/dev/null

# 期望：空输出
```

---

## 6. 故障排查

### 6.1 看不到任何日志

```text
可能：
  - Vercel project 是 Hobby plan → 仍可看 7 天日志
  - 未触发任何 console.log → 加载页面（initSentry 应有 1 条）
  - 浏览器没访问 → 用 curl 触发一次请求

修复：
  curl https://sethearth-git-alpha-seethearth.vercel.app/
  再看 Logs
```

### 6.2 日志脱敏失败（出现 email/phone）

```text
可能：
  - api/_lib/sentry-server.ts 的 redactPayload 未生效
  - 直接 console.log 了原始 payload（绕过 logServerError）

修复：
  - 所有服务端错误必须通过 logServerError() 包装
  - 任何 console.log 包含 PII 前必须先 redactPayload()
```

### 6.3 日志保留期已过（> 7 天）

```text
可能：
  - Vercel Hobby 固定 7 天（不可配置）
  - 已升级到 Vercel Pro → Settings → Logs → Retention 配置

修复：
  - Phase 1 接受 7 天保留
  - Phase 2 评估升级 Pro（30 天保留 + log drains）
```

---

## 7. 与 Phase 2 的对接

### 7.1 Phase 2 启用（仅说明，不实施）

```text
- Vercel Pro 升级（如需 30 天保留）
- Log drains 配置（推送 Datadog / S3 / 自建）
- 与 Sentry Alert Rule 联动（已在 alert-policy-v1.md §5 定义）
```

### 7.2 Phase 2 不实施项（确认）

```text
- ❌ Slack / PagerDuty 直连（V1.1）
- ❌ 自动告警路由（V1.1）
- ❌ 升级 Vercel Pro（评估中）
```

---

## 8. 自验收 Acceptance Criteria

- [x] Vercel Runtime Logs 核心概念清晰（自动 capture）
- [x] 与 Sentry 分工明确（debug vs alert）
- [x] Dashboard 配置步骤详细（无需代码）
- [x] Vercel 自动脱敏 + 我们额外脱敏双重防护
- [x] Phase 1 输出格式标准化（error_id + request_id）
- [x] error_id 与 request_id 区别明确
- [x] 验证方式 3 项（立即 / 7d / bundle）
- [x] 故障排查 3 项
- [x] Phase 1 不实施项明确（无代码改动）
- [x] Phase 2 对接点明确

---

## 9. 元数据

| 字段 | 值 |
|---|---|
| 文档版本 | v1 |
| 创建时间 | 2026-08-24 |
| 创建人 | Engineer Agent #2 |
| 文档 ID | `vercel-runtime-logs-setup.md` |
| 目标 Gate | Gate A · Internal Alpha |
| Workspace 路径 | `/Users/lwy/Documents/ChatGPT/看见地球/release-v1/e-p0-10-monitoring-phase1/vercel-runtime-logs-setup.md` |
| Obsidian canonical 路径 | `/Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/e-p0-10-monitoring-phase1/vercel-runtime-logs-setup.md` |
| Obsidian 同步状态 | ❌ 未同步 |

---

**End of Vercel Runtime Logs Setup v1**