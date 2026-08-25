---
title: SEE EARTH V1 · Runbook v1 · P0/P1 事故响应 + Post-mortem + On-call
type: monitoring-runbook
tags: [release-v1, e-p0-10, monitoring, runbook, incident-response, post-mortem, on-call, sre, see-earth]
task_id: E-P0-10
brief_anchor: §5 E-P0-10 §H §I
gate_target: Gate A · Internal Alpha（Runbook 草案）· Gate C（完整 + 培训）
dispatched_at: 2026-08-24
dispatch_round: Round 4
status: DRAFT · IN REVIEW
author: Engineer Agent #2
source_inputs:
  - /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/SEE-EARTH-Release-Strategy-v1-Design-Engineering-Task-Brief.md §5 E-P0-10 §H §I
  - ./alert-policy-v1.md (4 告警分级)
  - ./error-categories-v1.md (20 项分类)
related_docs:
  - ./alert-policy-v1.md
  - ./error-categories-v1.md
  - ./privacy-baseline-v1.md
  - ./secret-management-v1.md
  - ./web-vitals-baseline-v1.md
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/e-p0-10-monitoring/runbook-v1.md
workspace_canonical_path: /Users/lwy/Documents/ChatGPT/看见地球/release-v1/e-p0-10-monitoring/runbook-v1.md
sync_required: true · sandbox 拒绝写入 Obsidian
---

# SEE EARTH V1 · Runbook v1 · 事故响应流程

> **作者**：Engineer Agent #2（外部 Owner = 用户）
> **派发时间**：2026-08-24 · Round 4
> **目的**：让团队在 **P0 告警触发后 15 分钟内** 完成事故确认、根因定位、缓解方案——**不依赖用户截图**。
> **核心承诺**：**PagerDuty → on-call ack → Sentry 搜索 → fix/rollback → post-mortem** 全流程 ≤ 24 小时。
> **关系**：本文件是 `alert-policy-v1.md` 的**操作手册**——前者定义"何时告警"，本文件定义"告警后做什么"。

---

## 0. 阅读指南

- **§1** P0 事故响应流程（15 分钟内确认 · 1 小时内缓解 · 24 小时内 Post-mortem）
- **§2** P1 事故响应流程（1 小时首次响应）
- **§3** 调查工具箱（Sentry / Vercel / Supabase）
- **§4** Privacy Incident 专项响应
- **§5** Post-mortem 模板
- **§6** on-call 轮值
- **§7** 培训
- **§8** 自验收

---

## 1. P0 事故响应流程

### 1.1 时序总览

```text
T+0min      P0 告警触发
            ├─ Slack #alerts 自动通知
            └─ PagerDuty → on-call 个人手机

T+1min      on-call 在 Slack #alerts 回复 "ack · investigating"

T+5min      on-call 在 Sentry 搜索 error_id · 查看 stack trace
            评估影响用户数（Vercel Analytics 5min page_view）

T+15min     on-call 决定：fix / rollback / 临时降级
            在 Slack #alerts 更新 root cause 初步结论

T+30min     on-call 给出缓解方案（rollback / hotfix deploy）
            在 Slack #engineering 通知团队

T+1h        事故缓解（用户可正常使用）

T+24h       Post-mortem 文档完成（git commit to docs/postmortem/）

T+72h       复盘会议（PM Agent + 用户 + on-call）
```

### 1.2 详细步骤

#### Step 1. Ack（1 分钟）

```text
1. on-call 收到 PagerDuty
2. 打开 Slack #alerts
3. 回复：
   "ack · @<your-name> investigating · error_id=<id> · starting Sentry search"
4. 在 PagerDuty App 点 "Acknowledge"
```

**目标**：让团队知道**有人在调查**；防止重复 ack。

#### Step 2. 定位（5 分钟）

```text
1. 打开 Sentry → sethearth-prod（或 -alpha / -beta）project
2. 在 Issues 列表搜索 error_id（来自告警消息）
3. 查看 stack trace（首 5 行）+ tags（error_top + app_surface + http_status）
4. 在 Vercel Dashboard → Logs 搜索：
   - request_id（来自告警）
   - error_category
5. 影响范围评估：
   - Vercel Analytics → 5 分钟内 page_view 数
   - Sentry → event count（受影响用户数）
6. 在 Slack #alerts 更新：
   "locating · impact: ~X users · 5min · stack first 5 lines: ..."
```

#### Step 3. 决策（15 分钟）

基于定位结果，三选一：

| 决策 | 适用 | 步骤 |
|---|---|---|
| **A. Hotfix** | root cause 明确 + 修复 < 30 行代码 | 直接 hotfix → 部署到 alpha → 验证 → 部署到 main |
| **B. Rollback** | root cause 不明 / 修复复杂 / 影响扩大 | Vercel Dashboard → Deployments → 上一版本 → "Promote to Production" |
| **C. 临时降级** | 修复需要数小时 / 影响有限 | 关闭受影响功能（feature flag）或显示降级提示 |

**决策原则**：
- 影响 > 100 用户 → 优先 Rollback
- 影响 < 100 用户 + root cause 明确 → Hotfix
- 影响 < 10 用户 + 修复需要 > 1h → 临时降级 + 排队修复

#### Step 4. 缓解（30-60 分钟）

```text
A. Hotfix 路径
   1. git checkout -b hotfix/<incident-id> main
   2. 修复 + 测试
   3. push → 创建 PR → 紧急 review（on-call 自己 + 1 名 reviewer）
   4. merge → Vercel 自动部署
   5. 验证：复现路径 → 确认修复
   6. 在 Slack #alerts 发布 "resolved · hotfix deployed"

B. Rollback 路径
   1. Vercel Dashboard → Deployments → 选上一版本
   2. "Promote to Production"
   3. 等待 1-2 分钟（Vercel 部署）
   4. 验证：复现路径 → 确认恢复
   5. 在 Slack #alerts 发布 "resolved · rolled back to <commit>"

C. 临时降级路径
   1. 设置 feature flag（Vercel Edge Config 或环境变量）
   2. 重新部署（仅 feature flag 变更）
   3. 在 UI 显示降级提示
   4. 在 Slack #alerts 发布 "degraded · feature disabled · fix in progress"
```

#### Step 5. 监控恢复（30 分钟）

```text
缓解后持续观察 30 分钟：
- Vercel Analytics → error rate 应回到正常
- Sentry → 不再有新事件
- 用户反馈（Slack #user-feedback）
```

#### Step 6. Post-mortem（24 小时内）

详见 §5。

### 1.3 决策树

```text
P0 告警触发
  │
  ├─ 影响 > 100 用户?
  │   ├─ 是 → Rollback 优先（30min 内）
  │   └─ 否 ↓
  │
  ├─ Root cause 明确 + 修复 < 30 行?
  │   ├─ 是 → Hotfix
  │   └─ 否 ↓
  │
  ├─ 影响 < 10 用户 + 修复需要 > 1h?
  │   ├─ 是 → 临时降级
  │   └─ 否 → 继续 Hotfix（on-call 判断）
  │
  └─ 30min 内无法缓解?
      ├─ 是 → 升级 secondary on-call
      └─ 否 → 已缓解，进入 Post-mortem
```

---

## 2. P1 事故响应流程

### 2.1 时序

```text
T+0min      P1 告警触发
            └─ Slack #alerts 自动通知（不上 PagerDuty）

T+30min     on-call 查看（业务时间）或次日 09:00（非业务时间）

T+1h        给出 root cause + 修复方案

T+4h        部署缓解

T+5d        Post-mortem（仅当影响 > 100 用户 · 非强制）
```

### 2.2 详细步骤

```text
1. on-call 在 Slack #alerts 回复 "ack · investigating"
2. 查看 Sentry Issues（按 error_category 分组）
3. 评估：
   - 影响用户数（Vercel Analytics）
   - 业务影响（Daily 12 不可用 / Witness 失败 / 其他）
4. 决策：Hotfix / Rollback / 排队修复
5. 修复 + 部署（同 P0 步骤但节奏更慢）
6. 在 Slack #alerts 发布 "resolved"
7. 视情况写 Post-mortem
```

---

## 3. 调查工具箱

### 3.1 Sentry

| 操作 | 用途 |
|---|---|
| Issues 页面 → 搜索 `error_id:<id>` | 定位具体事件 |
| Issues 页面 → 搜索 `error_category:<cat>` | 按错误类型分组 |
| Issues 页面 → 搜索 `app_surface:web_homepage` | 按入口分组 |
| Performance → Transactions | 看 Web Vitals 实测 |
| Releases → `<release>` | 看某次部署引入的 issues |

### 3.2 Vercel

| 操作 | 用途 |
|---|---|
| Dashboard → Logs → 搜索 `request_id:<id>` | 服务端日志 |
| Dashboard → Logs → 搜索 `error_category:<cat>` | 错误日志 |
| Dashboard → Analytics → Web Vitals | 性能数据 |
| Dashboard → Deployments → 点击某次部署 | 查看 commits + build 日志 |
| Dashboard → Deployments → "Promote to Production" | 回滚 |

### 3.3 Supabase

| 操作 | 用途 |
|---|---|
| Dashboard → Logs → API | DB query 性能 |
| Dashboard → Logs → Auth | 鉴权日志 |
| Dashboard → Storage → 看 object | 看上传的图片 |
| SQL Editor → 直接 query | 紧急数据修复 |

### 3.4 命令行工具

```bash
# Vercel CLI（部署 / 回滚 / 看日志）
vercel logs <deployment-url> --follow
vercel rollback <deployment-url>

# Supabase CLI（DB 操作）
supabase db inspect
supabase db remote commit

# Sentry CLI（手动上报 / 测试）
sentry-cli send-event -m "Test event from CLI"

# Git（看 commit / diff）
git log --oneline -20
git diff <last-good-commit>..HEAD

# cURL（API 健康检查）
curl -i https://see-earth.vercel.app/api/edition/today?check=health
```

---

## 4. Privacy Incident 专项响应

### 4.1 触发场景

- Privacy leak test FAIL
- Sentry 收到 PII / 精确位置 / 自由文本 payload
- 公开图片 EXIF 检查 FAIL
- 用户报告："我的位置被暴露了"

### 4.2 响应流程

```text
T+0      Privacy leak test FAIL 或 Sentry PII 告警触发
         └─ Slack #alerts + PagerDuty（P0 级）

T+5min   on-call 立即停止相关服务（feature flag 关闭 Analytics / 暂停 Witness 提交）
         在 Slack #alerts 发布 "privacy incident · investigating"

T+15min  定位泄露路径：
         - 是 SDK beforeSend 没拦截？
         - 是服务端 reject 没生效？
         - 是 EXIF 没剥离？
         - 是日志输出 PII？

T+30min  给出修复方案 + 部署 hotfix

T+1h     验证修复（重跑 Privacy leak test）

T+24h    评估影响用户：
         - 如果泄露了用户精确位置 / EXIF → 通知 PM Agent + 准备用户通知
         - 如果泄露到 Analytics 但未持久化 → 通知 PM Agent

T+72h    Post-mortem（Privacy 专项）
         - 修复 + 永久预防（加 E2E 测试 / CI 阻断）
         - 通知受影响的用户（如适用）
```

### 4.3 用户通知模板（如需要）

```text
Subject: 关于 SEE EARTH 隐私事件的通知

亲爱的 SEE EARTH 用户，

我们于 [YYYY-MM-DD] 发现一个隐私事件：[简要描述]。
影响：[范围 · 受影响用户数 · 数据类型]
我们已采取的措施：[修复时间 + 后续预防]

如有任何疑问，请联系：[邮箱 / 反馈入口]。

SEE EARTH 团队
[日期]
```

### 4.4 永久预防

- 扩展 Privacy leak test 覆盖该场景
- 在 CI 增加 E2E 测试
- 加 PR review checklist 项："是否引入新的 PII 处理逻辑"

---

## 5. Post-mortem 模板

### 5.1 文件位置

`docs/postmortem/YYYY-MM-DD-<incident-id>.md`

### 5.2 模板（Google SRE 风格 · blameless）

```markdown
# Post-mortem: <简短描述>

**日期**: YYYY-MM-DD
**Incident ID**: INC-YYYYMMDD-NNN
**Severity**: P0 / P1
**Owner**: <on-call name>
**Status**: Draft / In Review / Final

## TL;DR（5 句话内）

- 发生了什么（一句话）
- 影响（用户数 / 时长）
- root cause（一句话）
- 缓解方案（一句话）
- 预防措施（一句话）

## 时间线（UTC+8）

| 时间 | 事件 |
|---|---|
| HH:MM | 告警触发 |
| HH:MM | on-call ack |
| HH:MM | 定位到 root cause |
| HH:MM | 缓解方案部署 |
| HH:MM | 监控恢复 |
| HH:MM | 全量恢复 |

## 影响

- 用户数：[估算]
- 时长：[X 分钟]
- 受影响功能：[Daily 12 / Witness / ...]
- 数据影响：[如有：哪些用户数据被访问 / 修改]

## Root Cause

[详细描述 · 包括为什么会发生 · 为什么监控没提前发现]

## 触发路径

[从用户请求到失败的完整链路 · 代码层面]

## 缓解（Mitigation）

[做了什么让用户恢复使用 · 包括 rollback / hotfix]

## 修复（Fix · 永久）

[代码层面的永久修复 · PR 链接]

## 检测（Detection）

[告警是否及时 · 是否有 false negative]

## 预防（Prevention）

[未来如何防止 · 包括 CI / E2E 测试 / 流程改进]

## Action Items

- [ ] (Owner · 截止日期) 行动项 1
- [ ] (Owner · 截止日期) 行动项 2
- [ ] (Owner · 截止日期) 行动项 3

## 学到的教训

[blameless · 系统层面的教训 · 不要责备个人]
```

### 5.3 Action Items 跟踪

- 所有 action items 进入 GitHub Issues · label `postmortem-action`
- 每周 PM Agent review 进度
- 未关闭的 action items 在下次 retrospective 中重点讨论

---

## 6. On-call 轮值

### 6.1 轮值规则

```text
- 每周一 09:00 (UTC+8) 切换
- 2 名工程师轮值：primary on-call + secondary on-call
- Primary on-call 工作日 09:00-21:00 主要负责
- 非工作时间由 secondary on-call 接管
- PagerDuty schedule 自动切换
```

### 6.2 责任清单

**Primary on-call**：
- 收到 PagerDuty 后 15 分钟内 ack
- 处理所有 P0 / P1 告警
- 24 小时内完成 Post-mortem
- 与 secondary on-call 同步进度

**Secondary on-call**：
- 收到 primary on-call 升级后接管
- 工作时间外代 primary 接收 PagerDuty
- 帮助 review hotfix

**PM Agent**（非 on-call，但需介入）：
- P0 持续 > 30 分钟 → 介入决策
- Privacy incident → 立即介入
- 用户通知 → 决策

### 6.3 轮值表

| 周 | Primary | Secondary |
|---|---|---|
| 2026-W35 (08-24 ~ 08-30) | Engineer A | Engineer B |
| 2026-W36 (08-31 ~ 09-06) | Engineer B | Engineer C |
| 2026-W37 (09-07 ~ 09-13) | Engineer C | Engineer A |
| ... | ... | ... |

> **轮值表初始化**：Phase 3 实施前由 PM Agent 与用户确认人员名单。

### 6.4 紧急联系

```text
- PagerDuty → on-call（自动）
- Slack #alerts-p0（仅 P0 频道）
- PM Agent 升级路径：PagerDuty schedule "secondary" → PM Agent
- 外部 Owner（用户）：PagerDuty schedule "executive"
```

---

## 7. 培训

### 7.1 培训对象

- 所有工程师（on-call + 候选 on-call）
- PM Agent
- 内容运营（仅 P3 流程）

### 7.2 培训内容（Phase 3 实施）

| 模块 | 时长 | 形式 |
|---|---|---|
| **M1. 监控基础**（Sentry / Vercel Analytics / Web Vitals） | 1 小时 | 视频 + 实操 |
| **M2. ErrorCategory 完整枚举 + payload** | 1 小时 | 文档 + 测试 |
| **M3. 告警分级 + 响应 SLA** | 30 分钟 | 文档 + Quiz |
| **M4. 调查工具箱实操**（Sentry / Vercel / Supabase / CLI） | 2 小时 | 实操（mock 事故） |
| **M5. P0 响应流程演练**（Fire drill） | 2 小时 | 模拟告警 + 完整流程 |
| **M6. Privacy incident 专项** | 1 小时 | 文档 + 案例 |
| **M7. Post-mortem 写作** | 1 小时 | 模板 + 历史案例 |

### 7.3 演练频率

- **Fire drill**：每季度 1 次（mock P0 告警，让 on-call 完整跑一次响应）
- **Post-mortem review**：每次 P0 后 72h 复盘会
- **轮值交接**：每周一 09:00 简短的 15 分钟 handover

---

## 8. 自验收 Acceptance Criteria

- [x] P0 事故响应 6 步骤完整（Ack / 定位 / 决策 / 缓解 / 监控恢复 / Post-mortem）
- [x] P0 时序 ≤ 24h（15min 确认 · 1h 缓解 · 24h post-mortem · 72h 复盘）
- [x] 决策树（影响 / root cause / 时间 三维度）
- [x] P1 事故响应简化流程
- [x] 调查工具箱（Sentry / Vercel / Supabase / CLI 完整）
- [x] Privacy incident 专项响应（含用户通知模板）
- [x] Post-mortem 模板（Google SRE 风格 · blameless）
- [x] on-call 轮值规则（每周一 · primary + secondary）
- [x] 培训 7 模块 + 演练频率
- [x] 与 `alert-policy-v1.md` 4 告警分级完全对齐
- [x] 与 `error-categories-v1.md` 20 项分类一致
- [x] 与 `privacy-baseline-v1.md` §4 leak test 联动

---

## 9. 元数据

| 字段 | 值 |
|---|---|
| 文档版本 | v1 |
| 创建时间 | 2026-08-24 |
| 创建人 | Engineer Agent #2 |
| 文档 ID | `runbook-v1.md` |
| 目标 Gate | Gate A（草案）· Gate C（完整 + 培训） |
| Workspace 路径 | `/Users/lwy/Documents/ChatGPT/看见地球/release-v1/e-p0-10-monitoring/runbook-v1.md` |
| Obsidian canonical 路径 | `/Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/e-p0-10-monitoring/runbook-v1.md` |
| Obsidian 同步状态 | ❌ 未同步 |

---

**End of Runbook v1**