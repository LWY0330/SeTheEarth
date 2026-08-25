---
title: SEE EARTH V1 · 告警策略 v1 · 4 分级 + 触发 + 通知 + 响应 + Owner
type: monitoring-alert-policy
tags: [release-v1, e-p0-10, monitoring, alert, on-call, sre, p0, p1, p2, p3, see-earth]
task_id: E-P0-10
brief_anchor: §5 E-P0-10 §A
gate_target: Gate A · Internal Alpha
dispatched_at: 2026-08-24
dispatch_round: Round 4
status: DRAFT · IN REVIEW
author: Engineer Agent #2
source_inputs:
  - /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/SEE-EARTH-Release-Strategy-v1-Design-Engineering-Task-Brief.md §5 E-P0-10 §A
  - ./error-categories-v1.md (5+15 枚举)
related_docs:
  - ./error-categories-v1.md
  - ./runbook-v1.md
  - ./web-vitals-baseline-v1.md
  - ./secret-management-v1.md
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/e-p0-10-monitoring/alert-policy-v1.md
workspace_canonical_path: /Users/lwy/Documents/ChatGPT/看见地球/release-v1/e-p0-10-monitoring/alert-policy-v1.md
sync_required: true · sandbox 拒绝写入 Obsidian
---

# SEE EARTH V1 · 告警策略 v1 · 4 分级

> **作者**：Engineer Agent #2（外部 Owner = 用户）
> **派发时间**：2026-08-24 · Round 4
> **目的**：让团队能 **不依赖用户截图**就定位一次失败。本策略定义 P0 ~ P3 四级告警的**触发条件、通知渠道、响应时间、Owner**。
> **原则**：**最小告警噪音 + 最快 P0 响应**。所有告警必须有 owner，否则不开。

---

## 0. 阅读指南

- **§1** 4 级总览
- **§2** P0 触发 · 通知 · 响应 · Owner
- **§3** P1 ~ P3 详情
- **§4** 5 类错误的告警映射（前置 API / 上传 / Job / 图片 / 前端）
- **§5** Alert Rule 实现（Sentry + Vercel）
- **§6** 静默期 / 抑制 / 升级
- **§7** 与 on-call 轮值的对接
- **§8** 自验收

---

## 1. 4 级总览

| 级别 | 触发哲学 | 通知 | 首次响应 | 缓解 | Post-mortem |
|---|---|---|---|---|---|
| **P0 · 全站不可用** | "现在就把所有人叫起来" | Slack #alerts + PagerDuty + on-call 个人手机 | **15 分钟** | 1 小时内 | 24 小时内 |
| **P1 · 主要功能降级** | "今天处理就行" | Slack #alerts | **1 小时** | 4 小时内 | 5 个工作日内 |
| **P2 · 次要功能降级** | "本工作日处理" | Slack #alerts | **4 小时** | 24 小时内 | 不强制 |
| **P3 · 内容运营问题** | "本周内处理" | Email 内容运营 + Slack 异步 | **24 小时** | 下个 Sprint | 不强制 |

> **核心承诺**：**P0 触发 → 15 分钟内有人在调查**。这是 Brief §5 E-P0-10 的硬约束。

---

## 2. P0 告警 · 全站不可用

### 2.1 触发条件（任一满足）

| # | 触发 | 检测方式 | 阈值 |
|---|---|---|---|
| P0-1 | **生产 API 5xx 率 > 1%** | Sentry alert on `error_top:server` + `error_category:server.5xx` count | 5 分钟窗口 |
| P0-2 | **CORS 错误**（任意起） | Sentry alert on `error_category:network.cors` | 单事件立即 |
| P0-3 | **TLS 证书过期** | Sentry alert on `error_category:network.tls` | 单事件立即 |
| P0-4 | **Supabase DB 不可达** | Sentry alert on `error_category:server.db_error` count | 5 分钟窗口 ≥ 3 起 |
| P0-5 | **LCP p75 > 4000ms** | Vercel Analytics Web Vitals | 5 分钟窗口 |
| P0-6 | **Web Vitals 预算任一项超出 1.5×**（LCP > 3750ms / CLS > 0.15 / FID > 150ms / TTI > 5250ms） | Vercel Analytics Web Vitals | 实时 |
| P0-7 | **每日 12:00 Daily 12 edition 发布失败**（自动化 cron） | Custom check on `/api/edition/today` 返回 5xx 或超时 | 单事件 |

> **关键设计**：P0-1 的 1% 阈值**仅适用于生产环境**（VITE_ENV === 'production'）。Alpha / Beta 环境阈值放宽到 5%（避免种子数据 / mock 噪声触发告警）。

### 2.2 通知

| 渠道 | 内容 | 接收者 |
|---|---|---|
| **Slack #alerts** | 🚨 P0 触发 · `[error_id]` · `[error_category]` · 简要 stack hash · Sentry 链接 | 全员可见 |
| **PagerDuty** | 短信 + 电话 | on-call 工程师（轮值） |
| **on-call 个人手机** | PagerDuty 转接 | 当周 on-call |
| **Slack #engineering** | 自动转发 | 工程团队 |

### 2.3 首次响应（15 分钟 SLA）

```text
T+0min     PagerDuty 触发 · on-call 收到
T+1min     on-call 确认事故 · 在 Slack #alerts 回复 "ack · investigating"
T+5min     on-call 在 Sentry 用 error_id 搜索，定位 stack trace
T+10min    on-call 评估影响用户数（Vercel Analytics 看 5 分钟内的 page_view）
T+15min    on-call 决定：fix / rollback / 临时降级
T+30min    on-call 给出 root cause 初步结论（Slack #alerts 更新）
T+1h       on-call 给出缓解方案（rollback / hotfix deploy）
T+24h      Post-mortem 文档完成（见 runbook-v1.md §5）
```

### 2.4 Owner

- **首次响应 on-call**：按轮值表（每周一 09:00 切换，详见 `runbook-v1.md §6`）。
- **决策权**：on-call 可在 30 分钟内决定 rollback 或 hotfix，无需 PM 批准。
- **升级路径**：on-call 30 分钟内无法缓解 → 自动升级到 PM Agent + 用户（外部 Owner）。
- **P0-7（Daily 12 edition）专项**：内容运营 / PM Agent（与 E-P0-08 Daily 12 编排同 owner）。

### 2.5 不应触发 P0 的场景

- ❌ 单个用户的网络问题（`network.timeout` 单事件）→ P1
- ❌ 单个 Moment 图片加载失败（`tile_image_failed`）→ P2
- ❌ 限流拒绝（`validation.rate_limited`）→ P1
- ❌ 第三方 API 短暂 5xx（持续 < 30 秒）→ 自动恢复不计
- ❌ Alpha / Beta 环境的同类错误 → 不计 P0（仅记录）

---

## 3. P1 / P2 / P3 详情

### 3.1 P1 · 主要功能降级

| 触发 | 阈值 | 通知 | 响应 | Owner |
|---|---|---|---|---|
| 客户端错误率 > 5% | 5 分钟窗口 | Slack #alerts | 1 小时 | on-call 工程师 |
| API 5xx 率 > 0.5% 但 ≤ 1% | 5 分钟窗口 | Slack #alerts | 1 小时 | on-call 工程师 |
| `validation.rate_limited` 突增 > 10 起 / 分钟 | 1 分钟窗口 | Slack #alerts | 1 小时 | on-call 工程师 |
| `network.timeout` 突增 > 5 起 / 分钟 | 1 分钟窗口 | Slack #alerts | 1 小时 | on-call 工程师 |
| `network.dns` 突增 > 3 起 / 10 分钟 | 10 分钟窗口 | Slack #alerts | 1 小时 | on-call 工程师 |
| Edition API p95 latency > 1500ms | 5 分钟窗口 | Slack #alerts | 1 小时 | on-call 工程师 |
| Witness 提交失败率 > 5% | 10 分钟窗口 | Slack #alerts | 1 小时 | on-call 工程师 |

**响应流程**：
```text
T+0     Slack #alerts 触发
T+30m   on-call 查看（业务时间 1h 内 / 非业务时间 4h 内）
T+4h    给出缓解方案
T+5d    Post-mortem（非强制，仅当影响 > 100 用户）
```

### 3.2 P2 · 次要功能降级

| 触发 | 阈值 | 通知 | 响应 | Owner |
|---|---|---|---|---|
| 上传失败 > 3 起 / 10 分钟 | 10 分钟窗口 | Slack #alerts | 4 小时 | on-call 工程师 |
| 单 Moment 图片加载失败 > 5 起 | 10 分钟窗口 | Slack #alerts | 4 小时 | on-call 工程师 |
| `validation.exif_untrusted` > 3 起 / 10 分钟 | 10 分钟窗口 | Slack #alerts | 4 小时 | on-call 工程师 |
| `validation.duplicate` > 5 起 / 10 分钟 | 10 分钟窗口 | Slack #alerts | 4 小时 | on-call 工程师 |
| `validation.captured_at_invalid` > 3 起 / 10 分钟 | 10 分钟窗口 | Slack #alerts | 4 小时 | on-call 工程师 |
| `server.image_processing_fail` > 3 起 / 10 分钟 | 10 分钟窗口 | Slack #alerts | 4 小时 | on-call 工程师 |
| `auth.denied` 突增 > 20 起 / 小时 | 1 小时窗口 | Slack #alerts | 4 小时 | on-call 工程师 |
| 用户看到 `network.offline` 提示 > 50 起 / 小时 | 1 小时窗口 | Slack #alerts | 4 小时 | on-call 工程师 |

**响应流程**：本工作日内处理；不要求 Post-mortem。

### 3.3 P3 · 内容运营问题

| 触发 | 阈值 | 通知 | 响应 | Owner |
|---|---|---|---|---|
| Edition 发布失败 | 单事件 | Email 内容运营 + Slack #content-ops 异步 | 24 小时 | 内容运营 / PM Agent |
| `server.queue_fail`（Daily 12 编排）≥ 2 次 | 1 小时窗口 | Slack #content-ops | 24 小时 | 内容运营 |
| `auth.moderator_required` 积压 > 10 起 | 1 小时窗口 | Slack #content-ops | 24 小时 | 内容运营 |
| `auth.admin_required` 拒绝 > 5 起 / 天 | 1 天窗口 | Slack #content-ops | 24 小时 | 内容运营 |
| `content.city_unsupported` 突增 > 5 起 / 小时 | 1 小时窗口 | Slack #content-ops | 24 小时 | 内容运营 |
| `content.moment_withdrawn` 突增 > 10 起 / 小时 | 1 小时窗口 | Slack #content-ops | 24 小时 | 内容运营 |
| `content.no_fallback` ≥ 1 起 | 单事件 | Slack #content-ops | 24 小时 | 内容运营 |

**响应流程**：本 Sprint 处理；不要求 Post-mortem；归入"内容运营 backlog"。

---

## 4. 5 类错误的告警映射

### 4.1 映射矩阵

| 错误类别 | 默认告警 | 例外（更高级） | 例外（更低级） |
|---|---|---|---|
| **前端错误**（Vite SPA 客户端） | P1 | React render 崩溃 / ErrorBoundary 触发 = P0 | 单个组件失败 = P2 |
| **API 5xx** | P0 | 生产 5xx > 1% / 5min = P0 | Beta 5xx = P1 |
| **上传失败**（Witness / Moment） | P2 | 失败率 > 5% = P1 | 偶发单张 = P3 |
| **Job 失败**（Daily 12 定时 / Edition 组版） | P0 (P0-7) | 1 次失败 = P0（content critical） | 重试成功 = 不告警 |
| **图片失败**（EXIF 剥离 / Supabase Storage） | P2 | 全平台 Storage 挂 = P0 | 单张失败 = P3 |

### 4.2 详细规则

#### 4.2.1 前端错误（Sentry · 客户端）

```yaml
# Sentry Alert Rule · Frontend Errors
name: "FE · Client Errors > 5%"
condition: event_count(error_top:frontend OR error_category:client_render) > 50 in 5min
threshold_type: dynamic
filter: app_surface:web_*
action: Slack #alerts
owner: on-call engineer
```

> **说明**：V1 没有"error_top:frontend"顶层（顶层只有 5 个）。前端错误通过 `error_category` 不在监控分类中（属于 SDK 内部），使用 Sentry SDK 默认 tag `error_category:client_render` 或 Sentry 自身 `error.type:ReactError` 触发。

#### 4.2.2 API 5xx（Sentry · 服务端）

```yaml
# Sentry Alert Rule · Server 5xx
name: "BE · Server 5xx > 1%"
condition: count(error_category:server.5xx) / count(transaction.http.status_code) > 0.01 in 5min
filter: app_surface:web_*, error_top:server
action: Slack #alerts + PagerDuty
owner: on-call engineer
severity: P0
```

#### 4.2.3 上传失败（Sentry · 服务端）

```yaml
# Sentry Alert Rule · Upload Failures
name: "Witness · Upload Failures > 3 / 10min"
condition: count(error_category:validation.exif_untrusted OR error_category:server.image_processing_fail OR error_category:network.timeout) > 3 in 10min
action: Slack #alerts
owner: on-call engineer
severity: P2
```

#### 4.2.4 Job 失败（Vercel Cron · 自定义）

```yaml
# Custom check · Daily 12 edition publish
name: "Edition · Daily 12 publish failed"
endpoint: GET https://see-earth.vercel.app/api/edition/today?check=health
schedule: "12:01 daily" (cron runs at 12:00 UTC)
timeout: 30s
expected_status: 200
on_failure:
  - Slack #content-ops (Email 内容运营)
  - Slack #alerts
owner: PM Agent
severity: P0 (single event, content critical)
```

#### 4.2.5 图片失败（Sentry · 客户端 + 服务端）

```yaml
# Sentry Alert Rule · Image Failures
name: "Image · Storage / EXIF > 3 / 10min"
condition: count(error_category:server.image_processing_fail OR error_category:validation.exif_untrusted) > 3 in 10min
action: Slack #alerts
owner: on-call engineer
severity: P2
# 例外：所有 storage 区域同时失败 → P0 (configurable)
```

---

## 5. Alert Rule 实现（Sentry + Vercel）

### 5.1 Sentry Project

- **Production**：独立 Sentry project `setheearth-prod`
- **Alpha**：独立 Sentry project `sethearth-alpha`（与 `env-decision-v1.md §3.5` 一致）
- **Beta**：独立 Sentry project `sethearth-beta`（Gate B 后创建）

### 5.2 Sentry Alert Rule 模板（10 条）

| # | Name | Condition | Action | Severity |
|---|---|---|---|---|
| 1 | `BE · Server 5xx > 1% (prod)` | `count(error_category:server.5xx) / count > 0.01` in 5min · filter `app_surface:web_*` AND `env:production` | Slack #alerts + PagerDuty | P0 |
| 2 | `BE · Server 5xx > 0.5% (prod)` | `count > 0.005` in 5min · filter same | Slack #alerts | P1 |
| 3 | `FE · Client Errors > 5%` | `count(error.type:ReactError) > 50` in 5min | Slack #alerts | P1 |
| 4 | `Network · CORS / TLS (any)` | `count(error_category:network.cors OR network.tls) > 0` in 1min | Slack #alerts + PagerDuty | P0 |
| 5 | `Network · Timeout spike` | `count(error_category:network.timeout) > 5` in 1min | Slack #alerts | P1 |
| 6 | `Network · Offline spike` | `count(error_category:network.offline) > 50` in 1h | Slack #alerts | P2 |
| 7 | `Validation · Rate Limited spike` | `count(error_category:validation.rate_limited) > 10` in 1min | Slack #alerts | P1 |
| 8 | `Validation · EXIF untrusted > 3` | `count(error_category:validation.exif_untrusted) > 3` in 10min | Slack #alerts | P2 |
| 9 | `Image · Storage / Processing fail` | `count(error_category:server.image_processing_fail OR validation.exif_untrusted) > 3` in 10min | Slack #alerts | P2 |
| 10 | `Web Vitals · LCP p75 > 4000ms` | Vercel Analytics custom metric | Slack #alerts + PagerDuty | P0 |

### 5.3 Vercel Web Vitals Alert

Vercel Analytics 自带 Web Vitals 监控。配置 custom alert：

```yaml
# vercel.json (Phase 2 实施)
{
  "analytics": {
    "webVitals": {
      "LCP": { "alertThreshold": 2500, "warnThreshold": 2000 },
      "FID": { "alertThreshold": 100, "warnThreshold": 75 },
      "CLS": { "alertThreshold": 0.1, "warnThreshold": 0.05 },
      "TTI": { "alertThreshold": 3500, "warnThreshold": 2800 }
    }
  }
}
```

> **关键**：Alert threshold = budget 值；超过 1.5× = P0 告警（详见 `web-vitals-baseline-v1.md §5`）。

### 5.4 Slack 频道

| 频道 | 订阅 | 用途 |
|---|---|---|
| `#alerts` | 全工程团队 | P0 / P1 / P2 全部告警 |
| `#alerts-p0` | 仅 on-call | 仅 P0（PagerDuty 触发后人工 ack） |
| `#content-ops` | 内容运营 + PM Agent | P3 告警 |
| `#engineering` | 工程团队 | 异步通知 / 状态更新 |

---

## 6. 静默期 / 抑制 / 升级

### 6.1 静默期

- **已知维护窗口**：维护期间静默所有告警；维护结束后自动恢复。
- **部署窗口**（每次 push to main 后 10 分钟内）：静默 P1（因新代码可能引入 transient error）；P0 仍触发。
- **配置方式**：Sentry → Project → Settings → "Maintenance Mode" 或 "Alert Muting"。

### 6.2 抑制规则

| 抑制规则 | 说明 |
|---|---|
| **同 error_id 5 分钟内不重复告警** | 避免告警风暴 |
| **同 component 30 分钟内同类 error 不超过 3 次** | 自动 merge |
| **Alpha 环境告警不上 PagerDuty** | 仅 Slack #alerts |
| **Beta 环境告警不上 PagerDuty** | 仅 Slack #alerts |

### 6.3 升级

```text
P0 触发
  → T+0  PagerDuty → on-call
  → T+15min  on-call 未 ack → 自动升级到 secondary on-call
  → T+30min  secondary on-call 未 ack → 升级到 PM Agent
  → T+60min  PM Agent 未 ack → 升级到外部 Owner（用户）
```

---

## 7. 与 on-call 轮值的对接

详见 `runbook-v1.md §6 on-call 轮值`。本周 on-call 在 PagerDuty schedule 中配置；告警自动路由到 on-call 个人。

**轮值规则**：
- 每周一 09:00 (UTC+8) 切换
- 2 名工程师轮值（主 + 备）
- 主 on-call 工作日 09:00-21:00；非工作时间由备 on-call 接管
- PagerDuty schedule 内置 escalation policy

---

## 8. 自验收 Acceptance Criteria

- [x] 4 告警分级（P0/P1/P2/P3）明确定义
- [x] P0 触发条件 7 条 · 通知 4 渠道 · 响应 15 分钟 · Owner on-call
- [x] P1 触发条件 7 条 · 响应 1 小时 · Owner on-call
- [x] P2 触发条件 8 条 · 响应 4 小时 · Owner on-call
- [x] P3 触发条件 7 条 · 响应 24 小时 · Owner 内容运营 / PM Agent
- [x] 5 类错误的告警映射完整（前端 / API / 上传 / Job / 图片）
- [x] 10 条 Sentry Alert Rule 模板完整
- [x] Vercel Web Vitals alert 配置明确
- [x] 静默期 / 抑制 / 升级规则完整
- [x] Slack 频道分级清晰
- [x] 与 `error-categories-v1.md` 20 项枚举完全对应
- [x] 与 `runbook-v1.md` on-call 轮值对齐

---

## 9. 元数据

| 字段 | 值 |
|---|---|
| 文档版本 | v1 |
| 创建时间 | 2026-08-24 |
| 创建人 | Engineer Agent #2 |
| 文档 ID | `alert-policy-v1.md` |
| 目标 Gate | Gate A · Internal Alpha（Phase 1 部分实施）· Gate B（Phase 2 全部实施） |
| Workspace 路径 | `/Users/lwy/Documents/ChatGPT/看见地球/release-v1/e-p0-10-monitoring/alert-policy-v1.md` |
| Obsidian canonical 路径 | `/Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/e-p0-10-monitoring/alert-policy-v1.md` |
| Obsidian 同步状态 | ❌ 未同步 |

---

**End of Alert Policy v1**