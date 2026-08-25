---
title: SEE EARTH V1 · 隐私基线 v1 · 数据清单 + 日志脱敏 + Leak Test
type: monitoring-privacy-baseline
tags: [release-v1, e-p0-10, monitoring, privacy, data-inventory, pii, log-redaction, leak-test, see-earth]
task_id: E-P0-10
brief_anchor: §5 E-P0-10 §D
gate_target: Gate A · Internal Alpha（基线）· 每个 Gate 前（leak test）
dispatched_at: 2026-08-24
dispatch_round: Round 4
status: DRAFT · IN REVIEW
author: Engineer Agent #2
source_inputs:
  - /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/SEE-EARTH-Release-Strategy-v1-Design-Engineering-Task-Brief.md §5 E-P0-10 §D
  - /Users/lwy/Documents/ChatGPT/看见地球/07-设计师设计参考/release-v1/analytics-events/forbidden-fields-v1.md (30 禁采项 · PII 边界 source of truth)
  - /Users/lwy/Documents/ChatGPT/看见地球/07-设计师设计参考/release-v1/analytics-events/consent-placement-v1.md (隐私文案位置)
  - /Users/lwy/Documents/ChatGPT/看见地球/scripts/privacy-leak-test.sh (既有隐私测试脚本)
related_docs:
  - ./error-categories-v1.md
  - ./secret-management-v1.md
  - ./runbook-v1.md
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/e-p0-10-monitoring/privacy-baseline-v1.md
workspace_canonical_path: /Users/lwy/Documents/ChatGPT/看见地球/release-v1/e-p0-10-monitoring/privacy-baseline-v1.md
sync_required: true · sandbox 拒绝写入 Obsidian
---

# SEE EARTH V1 · 隐私基线 v1

> **作者**：Engineer Agent #2（外部 Owner = 用户）
> **派发时间**：2026-08-24 · Round 4
> **目的**：让团队对 SEE EARTH V1 收集的所有数据**有完整可审计的清单**，并通过**自动脱敏 + Leak Test**保证**日志、Sentry、Analytics 中**不出现 PII / 精确位置 / 自由文本。
> **核心承诺**：**任何 Release Gate 前必跑 privacy leak test**（与 E-P0-07 集成）。
> **关系**：本文件是 **监控视角的隐私基线**；详细的禁采字段定义在 `forbidden-fields-v1.md`（30 项 source of truth）。

---

## 0. 阅读指南

- **§1** 数据清单（所有收集的数据 + 用途 + 保留期限 + 删除路径）
- **§2** 日志脱敏（自动 + 字段级）
- **§3** Secrets 管理（详见 `secret-management-v1.md`，本文件 §3 仅作 cross-reference）
- **§4** Privacy leak test（每个 Gate 前必跑）
- **§5** 公开图片 EXIF 检查
- **§6** 与 consent-placement 的联动
- **§7** 自验收

---

## 1. 数据清单

### 1.1 数据收集矩阵

| # | 数据类别 | 数据点 | 收集位置 | 用途 | 保留期限 | 删除路径 |
|---|---|---|---|---|---|---|
| **D-01** | **Analytics 行为数据** | `edition_id` · `moment_id` · `city_id` · `unknown_id` · `position` · `app_surface` · `entry_point` · `layer` · `section` · `error_category` · `network_class` · `media_type` · `permission_type` · `result` · `location_mode`（仅模式）· `captured_at`（仅 Witness · 无时区）· `submission_id_hash`（8 位 hash） | Analytics SDK → Sentry / Server receiver | 产品改进 · 漏斗分析 · 错误诊断 | **90 天**（Vercel Analytics 默认） | 自动过期 · Sentry Retention Policy 90 天 |
| **D-02** | **错误诊断数据** | `error_id`（8 字符 base36）· `error_category` · `error_top` · `app_surface` · `component` · `http_status` · `retry_count` · `stack_hash`（首 5 行 hash） | Sentry SDK + 服务端 logger | 错误诊断 · Post-mortem | **90 天**（Sentry 默认） | 自动过期 |
| **D-03** | **性能数据** | LCP / FID / CLS / TTI / FCP · 路由 · 网络分级 | Vercel Web Vitals SDK | 性能监控 · Budget 验证 | **90 天**（Vercel 默认） | 自动过期 |
| **D-04** | **Witness 提交数据（公共字段）** | `submission_id`（原始）· `city_id`（公共）· `media_type` · `network_class` · `location_mode` | Witness API → Supabase | 公共 Moment 候选 · 审核 | **180 天**（审核未过即删；通过的进入公共库） | 撤下后 30 天硬删除 |
| **D-05** | **Witness 提交数据（私密字段）** | `exif.gps_latitude/longitude`（精确 GPS）· `user_comment`（用户自由文本）· `submission_id`（关联键） | Witness API → Supabase（受限存储） | 审核 · 精确位置回查 | **30 天**（审核后立即转入归档）· 公共版派生图剥离 EXIF 后保留 365 天 | 用户主动撤下后 7 天硬删除 |
| **D-06** | **未知坐标内容** | `unknown_id` · 用户猜测答案 · `reveal_result` | Unknown API → Supabase | Reveal 反馈 · 改进未知题库 | **365 天** | 自动过期 |
| **D-07** | **Echo 内容（V1 暂不启用）** | `echo_id` · `city_id` · `user_text` · `captured_at` | Echo API（未来） | Echo 公共显示 | 暂未启用 · 计划 **180 天** | 暂未启用 |
| **D-08** | **服务端基础设施日志** | Vercel Runtime Logs（`request_id` · `path` · `method` · `status_code` · `duration_ms` · IP hash 后） | Vercel 自动 | 调试 · 性能分析 | **7 天**（Vercel Hobby）· **30 天**（Pro） | 自动过期 |
| **D-09** | **Supabase DB 数据** | Moment 表 · City 表 · Edition 表 · Witness 表 · Unknown 表 | Supabase | 业务核心数据 | 永久（公共数据） | 通过 DB admin 手动 delete |
| **D-10** | **Supabase Storage** | 原始上传图片（保留 EXIF）· 派生图（剥离 EXIF） | Supabase Storage | Witness 审核 + 公共显示 | 原始 **30 天**（审核后）· 派生 **365 天** | 自动 lifecycle policy |

> **总数 10 项数据类别**。**D-04 / D-05 / D-10** 涉及用户提交内容，是隐私敏感核心。

### 1.2 数据使用声明（Privacy 文案引用）

本清单直接喂给 `/about` 页面的"我们如何处理你的数据"区块（详见 `consent-placement-v1.md §3`）。文案要素：

```text
我们记录
  - 你看到哪些 Moment / City / Edition（用于改进产品）
  - 性能数据（页面加载时间，用于提升体验）
  - 错误日志（脱敏后的错误码，用于修复 bug）

我们不记录
  - 你的精确位置（仅记录"GPS / 手动 / 拒绝"模式）
  - 你的邮箱 / 手机号 / 设备指纹
  - 你的自由文本（搜索框 / 评论框 / 反馈文本）

Witness 提交时
  - 我们收集你拍摄的内容用于审核
  - 公开显示时仅显示城市级位置
  - 精确位置私密保存，仅审核团队可访问
  - 你可随时撤下，30 天内硬删除
```

### 1.3 数据保留期限矩阵

```ts
export const dataRetentionDays = {
  analytics: 90,        // Vercel Analytics 默认
  sentry: 90,           // Sentry 默认
  webVitals: 90,        // Vercel Web Vitals
  witnessPublic: 180,   // Witness 公共候选
  witnessPrivate: 30,   // Witness 精确位置 / EXIF / 自由文本（审核后转归档）
  echoText: 180,        // Echo（未来）
  unknownGuess: 365,    // Unknown 猜测
  serverLogs: 7,        // Vercel Hobby runtime Logs
  rawImage: 30,         // Supabase Storage 原始图（审核后）
  derivedImage: 365,    // 派生图（公开显示）
} as const;
```

---

## 2. 日志脱敏

### 2.1 脱敏原则

- **白名单模式**：只允许 §1.1 数据清单中的字段出现在日志中。
- **服务端二次过滤**：服务端日志写入前调用 `redactPII()` 函数，命中禁采字段即丢弃 / hash。
- **客户端 SDK 拦截**：Analytics SDK / Sentry SDK `beforeSend` 回调统一过滤。

### 2.2 脱敏实现（前端 SDK）

```ts
/**
 * src/lib/analytics/redact.ts
 * 前端日志 / Analytics 发送前统一脱敏
 */
import { ForbiddenFieldsList } from './forbidden-fields';

const PII_PATTERNS = [
  /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g,     // IPv4
  /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g, // 电话
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, // email
];

const REDACTED = '[REDACTED]';

export function redactPII(payload: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(payload)) {
    // 1. 禁采字段名 → 丢弃
    if (ForbiddenFieldsList.has(k)) continue;
    // 2. 值含 PII pattern → 替换
    if (typeof v === 'string') {
      let s = v;
      for (const re of PII_PATTERNS) s = s.replace(re, REDACTED);
      out[k] = s;
    } else if (typeof v === 'object' && v !== null) {
      out[k] = redactPII(v as Record<string, unknown>);
    } else {
      out[k] = v;
    }
  }
  return out;
}
```

### 2.3 Sentry `beforeSend` 配置

```ts
// src/lib/analytics/sentry.ts
import * as Sentry from '@sentry/browser';
import { redactPII } from './redact';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  beforeSend(event) {
    // 1. 脱敏 breadcrumbs
    if (event.breadcrumbs) {
      event.breadcrumbs = event.breadcrumbs.map(b => ({
        ...b,
        data: b.data ? redactPII(b.data) : undefined,
      }));
    }
    // 2. 脱敏 extra
    if (event.extra) {
      event.extra = redactPII(event.extra);
    }
    // 3. 脱敏 tags（仅 PII 字段）
    if (event.tags) {
      event.tags = redactPII(event.tags);
    }
    // 4. 错误消息脱敏（替换 stack 中的 PII）
    if (event.exception?.values) {
      event.exception.values = event.exception.values.map(e => ({
        ...e,
        value: e.value ? redactString(e.value) : undefined,
      }));
    }
    return event;
  },
  // ❌ 不发送 user IP（Vercel 自动 hash 后保留 /24 段）
  sendDefaultPii: false,
});
```

### 2.4 服务端 logger 配置

```ts
// api/_lib/logger.ts
import pino from 'pino';
import { redactPII } from './redact';

export const logger = pino({
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.body.email',
      'req.body.phone',
      'req.body.user_text',
      'req.body.comment',
      '*.lat',
      '*.lng',
      '*.latitude',
      '*.longitude',
      '*.exif',
      '*.stack',
    ],
    censor: '[REDACTED]',
  },
  hooks: {
    logMethod(inputArgs, method) {
      // 全 payload PII 二次过滤
      if (inputArgs.length >= 2 && typeof inputArgs[1] === 'object') {
        inputArgs[1] = redactPII(inputArgs[1]);
      }
      return method.apply(this, inputArgs);
    },
  },
});
```

### 2.5 字段级自动脱敏对照表

| 字段类型 | 脱敏方式 | 示例 |
|---|---|---|
| IPv4 | 保留前三段 / hash | `192.168.1.100` → `192.168.1.***` |
| IPv6 | 保留前 4 段 / hash | `2001:db8:...:abcd` → `2001:db8:****:****` |
| Email | hash 后 8 位 | `user@example.com` → `email_a3f9b2c1` |
| Phone | hash 后 8 位 | `+8613800138000` → `phone_b2c1d3e4` |
| 精确 lat/lng | 截断到城市级 | `(35.0116, 135.7681)` → `city_kyoto`（仅 hash 关联） |
| 自由文本 | 完全丢弃 | `text` / `content` / `body` → 字段不存在 |
| URL token | 替换 query | `?token=xxx` → `?token=[REDACTED]` |
| EXIF | 完全剥离 | 整 `exif` 对象不进入日志 |
| User-Agent | 截短到浏览器 + 版本 | `Mozilla/5.0 ... Chrome/124.0` → `Chrome/124` |

---

## 3. Secrets 管理（cross-reference）

完整规范见 `secret-management-v1.md`。本文件 §3 仅列概要：

- **客户端 0 secret**：所有 secret 仅在 Vercel Dashboard Environment Variables 配置。
- **公开 key**（Sentry DSN / Analytics Key）以 `VITE_` 前缀公开，**非敏感**。
- **私密 key**（DB / Storage / API）以非 `VITE_` 前缀，仅服务端可见。
- **本地开发**：`.env.local`（已在 `.gitignore`）。

---

## 4. Privacy Leak Test

### 4.1 已有脚本

`scripts/privacy-leak-test.sh` 已实现核心扫描（详见该文件）。本文件定义 V1 阶段完整测试规范。

### 4.2 测试方法（每个 Gate 前必跑）

```bash
#!/bin/bash
# scripts/privacy-leak-test.sh (扩展 · Phase 1 实施)
set -euo pipefail

ENV=${1:-alpha}  # alpha | beta | production

echo "===== Privacy Leak Test · $ENV ====="

# 1. 静态扫描（CI 内必跑）
echo "[1/6] Scanning source code for forbidden field names..."
LEAKED=$(grep -rE "(latitude|longitude|exif\.|email|phone|user_comment)" \
  src/ --include="*.ts" --include="*.tsx" 2>/dev/null \
  | grep -v "// ALLOWED:" || true)
if [ -n "$LEAKED" ]; then
  echo "❌ Forbidden field names found:"
  echo "$LEAKED"
  exit 1
fi
echo "✅ Source code clean"

# 2. Bundle 静态扫描（dist/ 不应含任何禁采字段名出现在 payload schema）
echo "[2/6] Scanning bundle for forbidden patterns..."
node scripts/scan-bundle-privacy.mjs
echo "✅ Bundle clean"

# 3. Analytics 接收端实测（发送全套 14 事件 + 故意带禁采字段 → 期望被 reject）
echo "[3/6] Testing analytics receiver with 14 events + forbidden payloads..."
node scripts/test-analytics-receiver-privacy.mjs "$ENV"
echo "✅ Analytics receiver rejects forbidden fields"

# 4. Sentry 发送测试（验证 beforeSend 拦截）
echo "[4/6] Testing Sentry beforeSend PII redaction..."
node scripts/test-sentry-redaction.mjs
echo "✅ Sentry redacts PII"

# 5. 公开图片 EXIF 检查（Daily 12 + Moment Detail 全部图片）
echo "[5/6] Checking public images for EXIF leakage..."
node scripts/check-image-exif.sh public/ src/assets/
echo "✅ Public images EXIF clean"

# 6. 日志脱敏验证（mock 一次 5xx + PII payload，验证 logger 脱敏）
echo "[6/6] Testing server logger PII redaction..."
node scripts/test-logger-redaction.mjs
echo "✅ Server logger redacts PII"

echo ""
echo "===== Privacy Leak Test PASSED ====="
echo "Result file: release-v1/e-p0-10-monitoring/privacy-leak-test-result-${ENV}.json"
```

### 4.3 测试输出（结构化）

```json
{
  "env": "alpha",
  "timestamp": "2026-08-24T12:00:00Z",
  "checks": [
    { "id": 1, "name": "source_code_scan", "result": "PASS", "leaked": [] },
    { "id": 2, "name": "bundle_scan", "result": "PASS", "leaked": [] },
    { "id": 3, "name": "analytics_receiver", "result": "PASS", "rejected_events": 7 },
    { "id": 4, "name": "sentry_redaction", "result": "PASS", "redacted_fields": 12 },
    { "id": 5, "name": "image_exif", "result": "PASS", "images_checked": 47, "with_exif": 0 },
    { "id": 6, "name": "logger_redaction", "result": "PASS", "redacted_fields": 8 }
  ],
  "overall": "PASS"
}
```

### 4.4 失败响应

任一检查 FAIL → 阻塞该 Gate 发布。处理流程见 `runbook-v1.md §4 Privacy Incident Response`。

---

## 5. 公开图片 EXIF 检查

### 5.1 检查范围

- **Daily 12** 全部图片（12 + featured = 13 张 / edition）
- **City Detail** Hero 图（12 张城市）
- **City Detail** 各 layer 配图（≤ 4 张 / city）
- **Witness 通过审核的派生图**（剥离 EXIF 后再次验证）

### 5.2 检查方式

```bash
# scripts/check-image-exif.sh (扩展 · Phase 1 实施)
exiftool -r -GPS:all -Camera:SerialNumber -UserComment \
  -Software -HostSoftware -DateTimeOriginal \
  public/images/ src/assets/ \
  | grep -v "^===" | grep -v "^$" \
  && { echo "❌ EXIF leaked"; exit 1; } \
  || { echo "✅ EXIF clean"; exit 0; }
```

### 5.3 通过标准

- `exiftool` 输出为空 → ✅ PASS
- 任一图片含 GPS / Camera Serial / UserComment → ❌ FAIL + 阻断 Gate

---

## 6. 与 consent-placement 的联动

### 6.1 文案引用

`consent-placement-v1.md` 定义的 4 段文案（C-03 ~ C-06）必须包含 §1.2 中的核心承诺：

```text
C-03 首页底部（Privacy 摘要 · 1 屏内）
  "我们记录你看到哪些内容。详见 →"

C-04 About 页面（完整声明）
  - §1.2 全文

C-05 Witness 提交前（提交确认）
  "公开显示时仅显示城市级位置。精确位置私密保存。"

C-06 Settings（隐私偏好 · V1 暂未启用）
  - 控制 Analytics opt-out · 控制 Error reporting opt-out
```

### 6.2 Consent 实施

- **默认开启**：Analytics + Error reporting **默认开启**（非 opt-in）。
- **不提供 opt-out UI**（V1 阶段）：因 V1 仍 Alpha，user-facing 控制面板在 V1.1+ 提供。
- **明确披露**：通过 Privacy 文案明确告知"我们记录什么 / 不记录什么"。

---

## 7. 自验收 Acceptance Criteria

- [x] 数据清单覆盖 10 项数据类别（含字段 + 用途 + 保留 + 删除）
- [x] 数据保留期限矩阵明确（10 项 × 天数）
- [x] 日志脱敏实现（前端 SDK + Sentry beforeSend + 服务端 logger）
- [x] 字段级自动脱敏对照表（9 类字段）
- [x] Privacy leak test 完整流程（6 步）
- [x] 公开图片 EXIF 检查方式
- [x] 与 `forbidden-fields-v1.md` 30 项禁采字段一致
- [x] 与 `consent-placement-v1.md` 文案联动
- [x] 与 `secret-management-v1.md` cross-reference
- [x] 失败响应流程（runbook §4）
- [x] 不记录 PII / 精确位置 / 自由文本
- [x] 客户端 0 secret

---

## 8. 元数据

| 字段 | 值 |
|---|---|
| 文档版本 | v1 |
| 创建时间 | 2026-08-24 |
| 创建人 | Engineer Agent #2 |
| 文档 ID | `privacy-baseline-v1.md` |
| 目标 Gate | Gate A · Internal Alpha（基线）· 每个 Gate 前（leak test） |
| Workspace 路径 | `/Users/lwy/Documents/ChatGPT/看见地球/release-v1/e-p0-10-monitoring/privacy-baseline-v1.md` |
| Obsidian canonical 路径 | `/Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/e-p0-10-monitoring/privacy-baseline-v1.md` |
| Obsidian 同步状态 | ❌ 未同步 |

---

**End of Privacy Baseline v1**