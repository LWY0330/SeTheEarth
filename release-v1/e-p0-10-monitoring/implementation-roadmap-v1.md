---
title: SEE EARTH V1 · 监控实施 Roadmap v1 · Phase 1-3 + 工时 + 依赖
type: monitoring-implementation-roadmap
tags: [release-v1, e-p0-10, monitoring, implementation, roadmap, phase-1, phase-2, phase-3, gate-a, gate-b, gate-c, see-earth]
task_id: E-P0-10
brief_anchor: §5 E-P0-10 §I
gate_target: Gate A · Phase 1 必做 / Gate B · Phase 2 必做 / Gate C · Phase 3 必做
dispatched_at: 2026-08-24
dispatch_round: Round 4
status: DRAFT · IN REVIEW
author: Engineer Agent #2
source_inputs:
  - /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/SEE-EARTH-Release-Strategy-v1-Design-Engineering-Task-Brief.md §5 E-P0-10 §I
  - /Users/lwy/Documents/ChatGPT/看见地球/release-v1/alpha-environment/env-decision-v1.md (Alpha 部署)
  - /Users/lwy/Documents/ChatGPT/看见地球/scripts/lighthouse-ci.sh (既有 CI)
related_docs:
  - ./error-categories-v1.md
  - ./alert-policy-v1.md
  - ./web-vitals-baseline-v1.md
  - ./privacy-baseline-v1.md
  - ./secret-management-v1.md
  - ./runbook-v1.md
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/e-p0-10-monitoring/implementation-roadmap-v1.md
workspace_canonical_path: /Users/lwy/Documents/ChatGPT/看见地球/release-v1/e-p0-10-monitoring/implementation-roadmap-v1.md
sync_required: true · sandbox 拒绝写入 Obsidian
---

# SEE EARTH V1 · 监控实施 Roadmap v1 · Phase 1-3

> **作者**：Engineer Agent #2（外部 Owner = 用户）
> **派发时间**：2026-08-24 · Round 4
> **目的**：为 E-P0-10 监控基线任务产出**可执行的实施计划**——3 个 Phase、每个 Gate 必做的具体步骤、工时估算、依赖关系。
> **核心承诺**：**Gate A 完成后能定位单次失败** · **Gate B 完成后 14 天无监控盲区** · **Gate C 完成后有完整事故响应能力**。
> **依赖**：本 roadmap 在 E-P0-02（后端）· E-P0-07（Analytics）· E-P0-09（API Contract）实施**同期**进行。

---

## 0. 阅读指南

- **§1** Phase 总览（3 Phase · 工时汇总 · Gate 对齐）
- **§2** Phase 1 详细任务（Gate A 必做 · 4 天）
- **§3** Phase 2 详细任务（Gate B 必做 · 7 天）
- **§4** Phase 3 详细任务（Gate C 必做 · 5 天）
- **§5** 关键依赖 + 风险
- **§6** 工时 + 资源估算
- **§7** 自验收

---

## 1. Phase 总览

### 1.1 3 Phase × 3 Gate 对齐

| Phase | 目标 | Gate | 工时 | 必做 |
|---|---|---|---|---|
| **Phase 1** | Sentry 集成 + Vercel Runtime Logs + Alpha baseline | **Gate A** · Internal Alpha | **4 天** | ✅ |
| **Phase 2** | Slack + PagerDuty 告警 + 14 天连续监控 + Budget 锁 | **Gate B** · Closed Beta | **7 天** | ✅ |
| **Phase 3** | Runbook + Post-mortem 流程 + on-call 培训 | **Gate C** · Production | **5 天** | ✅ |
| **总计** | — | — | **16 工作日** | — |

### 1.2 工时汇总表

| 模块 | Phase 1 | Phase 2 | Phase 3 | 总计 |
|---|---:|---:|---:|---:|
| 1. Sentry 集成（客户端 + 服务端） | 1.5 天 | 0.5 天 | — | 2 天 |
| 2. ErrorCategory 落地（schema + SDK） | 1 天 | — | — | 1 天 |
| 3. Vercel Runtime Logs + Web Vitals | 0.5 天 | 0.5 天 | — | 1 天 |
| 4. Privacy leak test（CI 集成） | 1 天 | — | — | 1 天 |
| 5. Secret 管理（Vercel env 配置） | 已完成（env-decision-v1） | 轮值 | — | 0.5 天 |
| 6. Alpha baseline 实测 | — | 1 天 | — | 1 天 |
| 7. 告警规则 + Slack/PagerDuty 配置 | — | 2 天 | — | 2 天 |
| 8. 14 天连续监控验证 | — | 14 天（与开发并行） | — | — |
| 9. Beta baseline 对照 + Budget 锁 | — | 1 天 | — | 1 天 |
| 10. Runbook 实施 + 演练 | — | — | 2 天 | 2 天 |
| 11. Post-mortem 流程 | — | — | 1 天 | 1 天 |
| 12. on-call 培训（7 模块） | — | — | 2 天 | 2 天 |
| **总计** | **4 天** | **7 天**（不含 14 天等待） | **5 天** | **16 工作日** |

---

## 2. Phase 1 详细任务（Gate A 必做 · 4 天）

### 2.1 任务清单

| # | 任务 | 工时 | 依赖 | 交付 |
|---|---|---|---|---|
| P1-1 | **Sentry project 创建**（3 个：prod / alpha / beta） | 0.5 天 | 用户操作（Sentry 账号） | `setheearth-prod` / `sethearth-alpha` / `sethearth-beta` |
| P1-2 | **Sentry 客户端 SDK 集成**（`src/lib/analytics/sentry-client.ts`） | 1 天 | P1-1 · `@sentry/browser` 安装 | 客户端 SDK 启用 · beforeSend PII 拦截 · source map 上传 |
| P1-3 | **Sentry 服务端 SDK 集成**（`api/_lib/sentry-server.ts`） | 0.5 天 | P1-1 · `@sentry/node` 安装 | 服务端 logger + error capture |
| P1-4 | **ErrorCategory 完整 schema 落地**（`src/lib/analytics/error-categories.ts`） | 1 天 | 无（独立） | 20 项枚举 + 客户端 SDK 集成 + mapping 函数 |
| P1-5 | **Vercel Runtime Logs 配置** | 0.25 天 | 无 | Vercel Dashboard 启用 · runtime logs 自动 capture |
| P1-6 | **Vercel Web Vitals 集成** | 0.25 天 | 无 | Vite plugin `vite-plugin-webvitals` + Vercel Analytics 启用 |
| P1-7 | **Privacy leak test 集成 CI**（`scripts/privacy-leak-test.sh` 扩展） | 1 天 | `scripts/privacy-leak-test.sh`（已有） | 6 步测试 + JSON 输出 + CI 阻断 |
| P1-8 | **Secret 管理配置**（Vercel env 23 项 + .env.example） | 已完成（env-decision-v1） | env-decision-v1.md | 23 项 env 文档化 + `.env.example` 更新 |
| P1-9 | **Alpha 部署 + 冒烟测试** | 0.5 天 | P1-1 ~ P1-8 | Alpha URL 上 Sentry 收到首批事件 · leak test 通过 |

### 2.2 Phase 1 输出物

- ✅ `src/lib/analytics/sentry-client.ts`（新增）
- ✅ `src/lib/analytics/error-categories.ts`（新增 · 20 项枚举）
- ✅ `src/lib/analytics/redact.ts`（新增 · PII 拦截）
- ✅ `api/_lib/sentry-server.ts`（新增）
- ✅ `api/_lib/logger.ts`（新增 · pino + redact）
- ✅ `scripts/privacy-leak-test.sh`（扩展 · 6 步）
- ✅ `scripts/verify-no-secret-in-bundle.sh`（新增 · CI 检查）
- ✅ `.env.example`（更新 · 含 §5.2 内容）
- ✅ `vite.config.ts`（更新 · web vitals plugin）
- ✅ `vercel.json`（新增 · Analytics 配置）

### 2.3 Phase 1 Gate A 验收标准

- [ ] Sentry 客户端 SDK 在 Alpha 部署上捕获到至少 1 个测试事件
- [ ] Sentry 服务端 SDK 在 mock API 路由捕获到至少 1 个测试错误
- [ ] ErrorCategory 20 项枚举在 schema.ts 落地（新增文件）
- [ ] Vercel Runtime Logs 显示 API 请求 / 响应日志
- [ ] Vercel Web Vitals 显示 LCP / FID / CLS 实测数据
- [ ] Privacy leak test 6 步全部 PASS
- [ ] Secret bundle scan 通过（CI 检查）
- [ ] Alpha 部署冒烟测试通过

### 2.4 Phase 1 工时拆解

```text
Day 1
  - 0.5 天  Sentry project 创建 + DSN 获取
  - 0.5 天  Sentry 客户端 SDK 集成 + 配置 beforeSend

Day 2
  - 0.5 天  Sentry 服务端 SDK 集成 + logger
  - 0.5 天  ErrorCategory 20 项枚举 schema + mapping 函数

Day 3
  - 1.0 天  Privacy leak test 扩展（6 步）+ secret bundle scan + CI 集成

Day 4
  - 0.5 天  Vercel Web Vitals + Runtime Logs 集成
  - 0.5 天  Alpha 部署 + 冒烟测试 + Gate A 验收
```

---

## 3. Phase 2 详细任务（Gate B 必做 · 7 天 + 14 天等待）

### 3.1 任务清单

| # | 任务 | 工时 | 依赖 | 交付 |
|---|---|---|---|---|
| P2-1 | **Alpha baseline 实测**（Lighthouse + Vercel Analytics 7d） | 1 天（+ 7 天等待） | Phase 1 完成 | `baseline-alpha-lighthouse.json` + `baseline-alpha-vercel.md` |
| P2-2 | **Slack 频道创建**（`#alerts` / `#alerts-p0` / `#content-ops`） | 0.25 天 | 用户操作（Slack 权限） | Slack channels ready |
| P2-3 | **PagerDuty service + schedule 配置** | 0.5 天 | 用户操作（PagerDuty 账号）· on-call 名单 | PagerDuty 接收 P0 告警 · 升级路径 |
| P2-4 | **Sentry Alert Rules 配置**（10 条规则 · §5.2） | 1 天 | P2-2 / P2-3 | 10 条 Alert 启用 · Slack/PagerDuty 路由 |
| P2-5 | **Vercel Web Vitals Alert 配置**（budget + 1.5×） | 0.5 天 | 无 | `vercel.json` 锁定 budget |
| P2-6 | **Sentry Dashboard 配置**（按 error_top 分组） | 0.5 天 | 无 | 5 个 Dashboard（network / auth / validation / server / content） |
| P2-7 | **Bundle size CI 检查** | 0.5 天 | Phase 1 bundle scan | CI 阻断超 budget commit |
| P2-8 | **Beta baseline 实测 + 对照 Alpha** | 1 天（Gate B 同步） | Beta 部署 ready | `baseline-beta-vs-alpha.md` |
| P2-9 | **14 天连续监控验证** | 14 天（与 Beta 开发并行） | 全部 Phase 2 完成 | 监控无盲区 · 告警全部触发正确 · 无 false positive |
| P2-10 | **Bundle + API latency 实测** | 0.5 天 | Phase 1 baseline 文件 | `baseline-bundle.json` · `baseline-api-latency.md` |

### 3.2 Phase 2 输出物

- ✅ `baseline-alpha-lighthouse.json`（机器生成）
- ✅ `baseline-alpha-vercel.md`（人工汇总）
- ✅ `baseline-bundle.json`（机器生成）
- ✅ `baseline-api-latency.md`（人工汇总）
- ✅ `baseline-beta-vs-alpha.md`（人工汇总）
- ✅ Sentry Alert Rules 10 条（已启用）
- ✅ Vercel Web Vitals Alert（已锁定 budget）
- ✅ Slack 频道 + PagerDuty schedule（已配置）
- ✅ Bundle size CI check（已集成）

### 3.3 Phase 2 Gate B 验收标准

- [ ] Alpha 7 天真实流量下 baseline 文件齐全（LCP / FID / CLS / TTI / FCP / Bundle / API latency）
- [ ] Beta 部署实测与 Alpha baseline 偏差 < 10%（无回归）
- [ ] 10 条 Sentry Alert Rules 全部启用
- [ ] Slack #alerts / #content-ops 频道就绪
- [ ] PagerDuty schedule 配置完整（on-call 轮值表已确认）
- [ ] Vercel Web Vitals Alert 锁定 budget + 1.5× P0 阈值
- [ ] 14 天连续监控验证：告警触发 → 响应 → 解决 全流程实测过至少 1 次
- [ ] Bundle size CI check 阻断至少 1 次超 budget commit（如果适用）

### 3.4 Phase 2 工时拆解

```text
Day 1
  - 0.5 天  Slack 频道 + PagerDuty 配置
  - 0.5 天  Sentry Alert Rules 配置（10 条）

Day 2
  - 0.5 天  Vercel Web Vitals Alert + Bundle CI check
  - 0.5 天  Sentry Dashboard 配置

Day 3-7
  - 0.5 天  Beta baseline 实测（Gate B 同步）
  - 14 天  连续监控验证（与 Beta 开发并行）

Day 8 (实际是 Day 1+14 = Day 15)
  - 0.5 天  14 天验证总结 + Gate B 验收
```

### 3.5 14 天等待策略

由于 14 天连续监控验证是 Phase 2 的核心，但**不能阻塞 Beta 开发**。策略：

```text
T+0     启动 14 天连续监控
T+1     Beta 开发继续（监控在后台）
T+7     Alpha 7 天 baseline 中期检查（如有问题提前介入）
T+14    14 天连续监控验证完成 → Gate B 验收
```

> **关键**：14 天必须**完整无中断**；如遇部署失败 / Sentry outage 等情况，从 T+0 重启计数。

---

## 4. Phase 3 详细任务（Gate C 必做 · 5 天）

### 4.1 任务清单

| # | 任务 | 工时 | 依赖 | 交付 |
|---|---|---|---|---|
| P3-1 | **Runbook 实施**（`runbook-v1.md` 内容落地） | 1 天 | 无 | 内部 Wiki · Slack 置顶 · on-call 培训材料 |
| P3-2 | **Fire drill（首次演练）** | 0.5 天 | P3-1 · on-call 名单确认 | 演练记录 + 改进项 |
| P3-3 | **Post-mortem 模板 GitHub 集成**（`docs/postmortem/` 目录 + template） | 0.5 天 | 无 | template 提交 + GitHub Issues label `postmortem-action` |
| P3-4 | **on-call 培训**（7 模块 · 详见 `runbook-v1.md §7`） | 2 天 | P3-1 / P3-3 | 培训视频 · Quiz 通过 · 至少 2 人具备 on-call 资格 |
| P3-5 | **Production 部署 + Budget 锁** | 0.5 天 | Phase 2 完成 · Production 部署就绪 | Production 锁定 budget · 24h 实测确认 |
| P3-6 | **Post-mortem 第一次演练**（mock 事故 → 完整流程） | 0.5 天 | P3-3 / P3-4 | 演练 Post-mortem 文档 |

### 4.2 Phase 3 输出物

- ✅ Runbook Wiki 页面（公司 Wiki）
- ✅ 培训视频（M1 ~ M7 · 录制或文档）
- ✅ Quiz 通过证书（≥ 2 人）
- ✅ Fire drill 记录
- ✅ `docs/postmortem/` 目录 + template
- ✅ GitHub Issues label `postmortem-action`
- ✅ Production 锁定 budget
- ✅ 第一次演练 Post-mortem 文档

### 4.3 Phase 3 Gate C 验收标准

- [ ] Runbook 完整落地（Wiki / Slack 置顶）
- [ ] 至少 2 名工程师完成 on-call 培训并通过 Quiz
- [ ] Fire drill 完成且改进项已记录
- [ ] Post-mortem 流程至少演练 1 次（mock 事故）
- [ ] Production 部署锁定 budget（Vercel Web Vitals Alert 启用 + Sentry Alert P0-6 启用）
- [ ] 24 小时 Production 实测无监控盲区
- [ ] on-call 轮值表已确认（PM Agent + 用户）

### 4.4 Phase 3 工时拆解

```text
Day 1
  - 1.0 天  Runbook 实施 + Wiki + Slack 置顶

Day 2
  - 0.5 天  Post-mortem 模板 GitHub 集成
  - 0.5 天  Fire drill 首次演练

Day 3-4
  - 2.0 天  on-call 培训（7 模块 · 含 Quiz）

Day 5
  - 0.5 天  Production 部署 + Budget 锁
  - 0.5 天  演练 Post-mortem + Gate C 验收
```

---

## 5. 关键依赖 + 风险

### 5.1 依赖关系

```text
Phase 1
  ├─ 依赖 E-P0-07 Analytics Instrumentation（已部分实施 · Round 2B）
  ├─ 依赖 E-P0-09 API Contract（定义 ErrorCategory schema）
  └─ 依赖 env-decision-v1.md（已锁定 Vercel env 策略）

Phase 2
  ├─ 依赖 Phase 1 全部
  ├─ 依赖 E-P0-02 后端（如需服务端捕获 5xx）
  └─ 依赖用户操作（Sentry 账号 · PagerDuty 账号 · Slack 权限）

Phase 3
  ├─ 依赖 Phase 2 全部
  ├─ 依赖 PM Agent + 用户确认 on-call 名单
  └─ 依赖用户操作（培训验收 · Production 部署批准）
```

### 5.2 风险矩阵

| 风险 | 影响 | 概率 | 缓解 |
|---|---|---|---|
| **R1. Sentry 账号申请延迟** | Phase 1 阻塞 | 中 | 用户提前申请 · 备选 Sentry OSS 自托管（不在 V1 范围） |
| **R2. PagerDuty 账号申请延迟** | Phase 2 部分阻塞 | 中 | Phase 2 P2-3 与 P2-4 解耦 · PagerDuty 后置 · 临时仅用 Slack |
| **R3. 14 天连续监控中断** | Phase 2 验收延迟 | 中 | 监控在后台 · 与 Beta 开发并行 · 不阻塞 |
| **R4. Bundle size 超预算** | Phase 2 P2-7 验证 | 高 | 优先优化 Hero 图（webp + 响应式）· 见 web-vitals-baseline-v1.md §6 |
| **R5. on-call 人员不足** | Phase 3 P3-4 培训 | 低 | 至少 2 人 · PM Agent 可临时充当 secondary |
| **R6. PII 泄露事故** | Phase 1 P1-7 验证 | 低 | Privacy leak test 阻断 · 强制 beforeSend 拦截 |
| **R7. Alpha 性能 baseline 严重不达标** | Phase 2 验收 | 中 | Phase 1 提前优化（Hero 图 · critical CSS）· 留 1 周 buffer |
| **R8. 14 天内遇 Sentry outage** | Phase 2 中断 | 低 | Vercel Runtime Logs 兜底 · 重启 14 天计数 |

### 5.3 关键决策点

| 决策点 | 时间 | 决策内容 | 决策者 |
|---|---|---|---|
| **D1. Sentry 选型** | Phase 1 启动前 | Sentry Cloud vs OSS | PM Agent + 用户 |
| **D2. on-call 人员名单** | Phase 3 启动前 | primary + secondary 名单 | PM Agent + 用户 |
| **D3. Phase 2 14 天是否接受"准完整"** | Phase 2 Day 7 | 14 天中如出现中断 > 1 次 → 是否重置 | PM Agent |
| **D4. Production 上线时机** | Phase 3 启动前 | Phase 3 完成后立即上线 / 推迟 | PM Agent + 用户 |

---

## 6. 工时 + 资源估算

### 6.1 工时总表

| Phase | 日历天数 | 工作日 | 等待日 | 备注 |
|---|---:|---:|---:|---|
| Phase 1 | 4 天 | 4 天 | 0 天 | Gate A 必做 |
| Phase 2 | 21 天 | 7 天 | 14 天 | 14 天连续监控 · 与 Beta 并行 |
| Phase 3 | 5 天 | 5 天 | 0 天 | Gate C 必做 |
| **总计** | **30 天** | **16 工作日** | **14 天** | Gate A → Gate C 共约 30 天 |

> **关键路径**：Phase 1 (4 天) + Phase 2 (21 天 · 含 14 天等待) + Phase 3 (5 天) = **30 天**。

### 6.2 资源需求

| 角色 | 投入 | 备注 |
|---|---|---|
| **Engineer Agent** | 全部 Phase · 主要执行 | 16 工作日 |
| **PM Agent** | Phase 2 决策 + Phase 3 培训协调 | 3 工作日（兼职） |
| **用户（外部 Owner）** | Sentry 账号 · PagerDuty 账号 · Slack 权限 · on-call 名单确认 | 用户操作（不计入工时） |
| **QA** | Privacy leak test 协助 · 演练参与 | 1 工作日（Phase 2 + Phase 3） |

### 6.3 工具 / 服务依赖

| 工具 | 必需? | 备选 |
|---|---|---|
| **Sentry**（错误监控） | ✅ | Rollbar / Bugsnag（功能等价） |
| **Vercel Analytics** | ✅ | 自建（成本不划算） |
| **PagerDuty** | ✅ | OpsGenie（功能等价） |
| **Slack** | ✅ | Discord / Lark / 飞书（功能等价） |
| **Lighthouse CI**（性能） | ✅ | WebPageTest（功能等价） |

### 6.4 不引入新依赖原则（强制）

- ❌ 不引入 Sentry 以外的错误监控工具
- ❌ 不引入 PagerDuty 以外的告警升级工具
- ❌ 不引入 Datadog / New Relic 等 APM（与 Brief §5 E-P0-10 §E 一致）
- ✅ 允许：Sentry SDK（必须）· 配套文档工具

---

## 7. 自验收 Acceptance Criteria

- [x] 3 Phase 完整（Gate A / B / C 对齐）
- [x] Phase 1 4 天 · 9 任务详细清单
- [x] Phase 2 7 天 + 14 天等待 · 10 任务详细清单
- [x] Phase 3 5 天 · 6 任务详细清单
- [x] 每 Phase 输出物明确
- [x] 每 Phase Gate 验收标准明确
- [x] 工时拆解（Day-by-Day）
- [x] 关键依赖 + 8 项风险 + 缓解措施
- [x] 4 项关键决策点 + 决策者
- [x] 工时总表（30 天 / 16 工作日 / 14 天等待）
- [x] 资源需求（4 角色）
- [x] 工具 / 服务依赖 + 不引入新依赖原则
- [x] 与 6 个 E-P0-10 文档全部对齐（error-categories / alert-policy / web-vitals / privacy / runbook / secret-management）

---

## 8. 元数据

| 字段 | 值 |
|---|---|
| 文档版本 | v1 |
| 创建时间 | 2026-08-24 |
| 创建人 | Engineer Agent #2 |
| 文档 ID | `implementation-roadmap-v1.md` |
| 目标 Gate | Gate A（Phase 1）· Gate B（Phase 2）· Gate C（Phase 3） |
| Workspace 路径 | `/Users/lwy/Documents/ChatGPT/看见地球/release-v1/e-p0-10-monitoring/implementation-roadmap-v1.md` |
| Obsidian canonical 路径 | `/Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/e-p0-10-monitoring/implementation-roadmap-v1.md` |
| Obsidian 同步状态 | ❌ 未同步 |

---

**End of Implementation Roadmap v1**