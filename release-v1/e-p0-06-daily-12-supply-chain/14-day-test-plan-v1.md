---
title: SEE EARTH V1 · 14 天连续供应演练计划 · Closed Beta Gate B 必过 · E-P0-06 D6
type: engineering-test-plan
tags: [release-v1, engineering, e-p0-06, daily-12, drill, 14-day, gate-b, see-earth]
task_id: E-P0-06
brief_anchor: §5 E-P0-06 §H (14 天连续供应演练) / 任务卡 §E (强制能力 · 演练)
track: engineering
owner: Engineer Agent (QA / DevOps)
created: 2026-08-24
status: IN REVIEW
target_gate: Gate B · Closed Beta
related_docs:
  - ./edition-entity-v1.md
  - ./eligibility-v1.md
  - ./group-process-v1.md
  - ./fallback-v1.md
  - ./scheduling-v1.md
  - ../api-contract/openapi.yaml (§/editions/today)
  - ../system-states/state-matrix-v1.md (§1 Daily 12 8 状态)
depends_on: [E-P0-06 D1-D5 ✓, E-P0-10 IN PROGRESS]
blocks: [Gate B Beta readiness]
source_brief: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/SEE-EARTH-Release-Strategy-v1-Design-Engineering-Task-Brief.md §5 E-P0-06
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/e-p0-06-daily-12-supply-chain/14-day-test-plan-v1.md
workspace_canonical_path: /Users/lwy/Documents/ChatGPT/看见地球/release-v1/e-p0-06-daily-12-supply-chain/14-day-test-plan-v1.md
note: 本文件已就绪，需 PM Agent 由 Obsidian 写入权限落地到 canonical 路径。
---

# SEE EARTH V1 · 14 天连续供应演练计划 · Closed Beta Gate B 必过

> **作者**：Engineer Agent · E-P0-06 QA / DevOps Owner
> **目标读者**：PM Agent · Gate B 决策者 · E-P0-10 Monitoring Owner · QA Lead · Editorial Team
> **目的**：把 Brief §H 的"14 天连续供应演练"**变成可执行自动化测试计划**——Gate B（Closed Beta）必过的硬门槛。**目标**：14 天，每天 12 槽必填满（fallback 路径也算"填"），cron + admin 操作全部跑通。
> **完成时间**：2026-08-24
> **配套文件**：`edition-entity-v1.md` ` `eligibility-v1.md` ` `group-process-v1.md` ` `fallback-v1.md` ` `scheduling-v1.md`

---

## 0. 一句话总结

**14 天连续演练 = 自动化测试套件（每天模拟"过去一天"+ cron 触发 + 公开 API 验证 + admin 操作）+ 人工 review 报告。目标：14/14 天通过 = Gate B 通过条件之一。**

---

## 1. 阅读指南

- **§2 Gate B 通过条件**
- **§3 演练模式（3 种）**
- **§4 自动化测试场景（10 类）**
- **§5 演练架构（time-travel DB + cron 模拟）**
- **§6 14 天测试用例表**
- **§7 通过标准（Pass Criteria）**
- **§8 失败处理（演练期间）**
- **§9 报告模板**
- **§10 演练前后 checklist**

---

## 2. Gate B 通过条件

| # | 条件 | 必须 |
|---|---|---|
| 1 | 14 天**每一天**Edition 创建成功 | ✅ |
| 2 | 14 天**每一天**公开 API 返回 ≥ 1 Edition（含 fallback） | ✅ |
| 3 | 14 天**每一天**Edition `slots_count=12`（含 placeholder） | ✅ |
| 4 | 14 天中**至少 12 天**Edition `is_complete=TRUE`（12 槽全填 Moment） | ✅ |
| 5 | 14 天中**fallback 触发 ≤ 3 天**（连续 3 天 fallback → fail） | ✅ |
| 6 | 14 天中**cron 失败 0 次**（DB 重试 + GitHub Actions 备援必须 work） | ✅ |
| 7 | 至少 1 次 admin rollback + 1 次 admin replace_slot 演练通过 | ✅ |
| 8 | stale_fallback 阈值（24h）至少触发 1 次验证 | ✅ |
| 9 | 14 天报告 + 单项失效隔离报告（单项失败不影响其他 11 槽） | ✅ |

---

## 3. 演练模式（3 种）

### 3.1 模式 A：真实时间（14 天等待）

| 项 | 规则 |
|---|---|
| **触发** | 部署到 alpha 环境 → 等真实 cron 跑 14 天 |
| **优点** | 真实 / 100% 验证 |
| **缺点** | 14 天等待，Gate B 卡时间 |
| **V1 推荐** | 仅在 Gate B 前最后 2 周做（8/24 - 9/7） |

### 3.2 模式 B：加速时间（Time-Travel DB）· V1 推荐

| 项 | 规则 |
|---|---|
| **触发** | 本地 + CI 环境：模拟 14 天（每 30 分钟模拟 1 天）|
| **优点** | 2 小时完成 14 天演练 |
| **缺点** | 需隔离 DB（不污染 prod） |
| **实现** | 用 Postgres `BEGIN; SET LOCAL time_zone='UTC'; ... COMMIT` 或专用 test DB |

### 3.3 模式 C：混合（真实 3 天 + 加速 11 天）· Gate B 采纳

```text
Day 1-3:  真实 cron（部署到 staging）
Day 4-14: 加速模拟（CI 环境跑加速版 cron）

优点：
- 真实 cron 验证基础设施（CDN / Vercel / DB）
- 加速模拟覆盖 admin 操作 / fallback / stale_fallback 边界
- 总耗时 ~ 1 周
```

---

## 4. 自动化测试场景（10 类 · E-P0-06 全链路）

| # | 场景 | 测试方法 | Pass 判定 |
|---|---|---|---|
| **T1** | 完美 12 城（候选 12 城 ≥ 1 张） | 注入 12 张 seed Moment | 12 槽全填 · 无 fallback |
| **T2** | 候选不足 1 城 | 删除 1 城所有候选 | 11 槽填 + 1 placeholder · partial_missing |
| **T3** | 候选不足 5 城 | 删除 5 城候选 | 7 槽填 + 5 placeholder · is_fallback=true |
| **T4** | 全 fallback（候选 < 4） | 删除 8 城候选 | 全 fallback · last_known_good 兜底 |
| **T5** | Witness 优先 | 注入 witness + editorial 同城 | witness 入选 |
| **T6** | 未来时间过滤 | 注入 captured_at > now 的 Moment | 该 Moment 被丢 |
| **T7** | rights 冲突 | 注入 rights='pending' | 该 Moment 被丢 |
| **T8** | CDN 失败 | image_variants 改空 | 该 Moment 被丢 |
| **T9** | moderation pending | 注入 moderation_status='pending' | 该 Moment 被丢 |
| **T10** | 稳定排序（tie-breaker） | 注入同分 2 Moment | tie-breaker 规则生效 |

### 4.2 集成测试场景（admin 操作 + 状态机）

| # | 场景 | 测试方法 | Pass 判定 |
|---|---|---|---|
| **T11** | 手动发布 preview | CLI `edition-publish.ts` | status=published, published_at 非空 |
| **T12** | 替换 draft slot | CLI `edition-slot-replace.ts --position 5` | slot 5 moment_id 更新 |
| **T13** | 整版回滚 | CLI `edition-rollback.ts` | 原 status=replaced + 新 fallback Edition |
| **T14** | 替换已发布 slot（拒绝） | 尝试 PATCH published slot | 返回 invalid_state_for_publish |
| **T15** | 重复 moment_id（同 Edition） | 注入同 Moment 2 slot | 第二次被拒（duplicate_in_edition） |

### 4.3 边界测试场景

| # | 场景 | 测试方法 | Pass 判定 |
|---|---|---|---|
| **T16** | cron 锁超时（并发） | 同时触发 2 次 cron | 第二个返回 409 |
| **T17** | stale_fallback 24h | 模拟 published_at 早 25h | UI 标注 stale_fallback |
| **T18** | 连续 3 天 fallback | 注入 3 天空候选池 | monitoring 告警触发 |
| **T19** | 单图失败不影响其他 | 注入 11 张好 + 1 张 image_variants=[] | 11 槽填 + 1 fallback |
| **T20** | Admin audit log 完整 | 执行 T11/T12/T13 | audit_log 3 条记录 |

---

## 5. 演练架构（Time-Travel DB + Cron 模拟）

### 5.1 测试环境

```text
┌──────────────────────────────────────────────┐
│ Test DB (Supabase Postgres test instance)    │
│   - 隔离自 prod                              │
│   - 含 seed moments（12 城 × 5 张 = 60 张）  │
│   - 注入 fixture 灵活配置                     │
└──────────────────────────────────────────────┘
                ↓
┌──────────────────────────────────────────────┐
│ Time-Travel Wrapper                          │
│   - 包装 all DB queries with "simulated_now"│
│   - 推进时间：每 30s = 模拟 1 天             │
│   - 重置：test_db.reset() → 回到 Day 1       │
└──────────────────────────────────────────────┘
                ↓
┌──────────────────────────────────────────────┐
│ Cron Simulator                               │
│   - 定时调用 POST /api/cron/daily-edition-builder │
│   - 但 request body 携带 simulated_now       │
│   - 每天 1 次（加速）                        │
└──────────────────────────────────────────────┘
                ↓
┌──────────────────────────────────────────────┐
│ Verifier                                     │
│   - 每天 cron 跑完后调用公开 API             │
│   - 校验 12 槽 + status + is_complete        │
│   - 记录每天结果到 test_results table         │
└──────────────────────────────────────────────┘
```

### 5.2 测试实现（伪代码）

```typescript
// scripts/test/14-day-drill.ts
async function runFourteenDayDrill() {
  const results: DailyResult[] = [];

  for (let day = 1; day <= 14; day++) {
    // 推进时间
    await advanceTime(`+1 day`);

    // 注入 fixture（每天不同）
    await injectFixturesForDay(day);

    // 触发 cron
    const cronResult = await triggerCron({ dry_run: false });

    // 验证公开 API
    const todayEdition = await fetchTodayEdition({ date: getCurrentSimulatedDate() });

    // 记录结果
    results.push({
      day,
      simulated_date: getCurrentSimulatedDate(),
      cron_status: cronResult.status,
      edition_id: todayEdition?.id,
      slots_count: todayEdition?.slots.length,
      filled_count: todayEdition?.slots.filter(s => s.moment_id).length,
      is_fallback: todayEdition?.is_fallback,
      fallback_reason: todayEdition?.fallback_reason,
      is_complete: todayEdition?.is_complete,
      duration_ms: cronResult.duration_ms,
    });
  }

  // 报告
  return generateReport(results);
}
```

### 5.3 14 天 fixture 编排

| Day | 注入场景 | 期望 |
|---|---|---|
| 1 | 完美 12 城 | 12 槽全填 · 无 fallback |
| 2 | 删除 Kyoto 候选 | 11 槽填 + 1 placeholder |
| 3 | 完美 12 城 | 12 槽全填 · 无 fallback |
| 4 | 删除 Kyoto + Lisbon + Tokyo | 7 槽填 + 5 placeholder + fallback |
| 5 | 完美 12 城 | 12 槽全填 |
| 6 | 删除所有 witness，只剩 editorial | 12 槽全填 · 全 editorial |
| 7 | 完美 12 城 | 12 槽全填 |
| 8 | 删除 8 城候选（剩 4 城） | 4 槽填 + 8 placeholder · 全 fallback |
| 9 | 完美 12 城 | 12 槽全填 |
| 10 | rights=pending 注入多张 | 部分候选被丢 |
| 11 | 完美 12 城 + admin rollback 演练 | rollback 创建 fallback Edition |
| 12 | 完美 12 城 + admin replace_slot 演练 | slot 5 替换 |
| 13 | 模拟 cron 失败（DB down） | stale_fallback + last_known_good |
| 14 | 完美 12 城 + stale_fallback 阈值验证 | published_at 早 25h → UI 标注 stale |

---

## 6. 14 天测试用例表

```text
Day │ Cron │ API │ Slots │ Filled │ Fallback │ Reason │ Admin │ Notes
────┼──────┼─────┼───────┼────────┼──────────┼────────┼───────┼─────────────────
1   │ ✅   │ ✅  │ 12    │ 12     │ FALSE    │ -      │ -     │ 完美 12 城
2   │ ✅   │ ✅  │ 12    │ 11     │ FALSE    │ -      │ -     │ partial_missing
3   │ ✅   │ ✅  │ 12    │ 12     │ FALSE    │ -      │ -     │ 完美
4   │ ✅   │ ✅  │ 12    │ 7      │ TRUE     │ no_sufficient │ -│ is_fallback=true
5   │ ✅   │ ✅  │ 12    │ 12     │ FALSE    │ -      │ -     │ 完美
6   │ ✅   │ ✅  │ 12    │ 12     │ FALSE    │ -      │ -     │ 全 editorial
7   │ ✅   │ ✅  │ 12    │ 12     │ FALSE    │ -      │ -     │ 完美
8   │ ✅   │ ✅  │ 12    │ 4      │ TRUE     │ no_sufficient │ -│ 全 fallback
9   │ ✅   │ ✅  │ 12    │ 12     │ FALSE    │ -      │ -     │ 完美
10  │ ✅   │ ✅  │ 12    │ 9      │ FALSE    │ -      │ -     │ rights 过滤 3 张
11  │ ✅   │ ✅  │ 12    │ 12     │ FALSE    │ -      │ ROLL  │ 完美 + rollback
12  │ ✅   │ ✅  │ 12    │ 12     │ FALSE    │ -      │ REPL  │ 完美 + replace
13  │ ❌   │ ✅  │ 12    │ 0      │ TRUE     │ stale  │ -     │ stale_fallback
14  │ ✅   │ ✅  │ 12    │ 12     │ FALSE    │ -      │ -     │ 完美 + stale 验证
```

**总览**：
- 14 天全部 cron 成功（除 Day 13 模拟失败）→ ✅
- 14 天全部 API 成功 → ✅
- 14 天全部 slots=12 → ✅
- 14 天 filled ≥ 4 → ✅（Day 8 = 4, Day 13 = 0 但 stale 兜底）
- 连续 fallback ≤ 3 天 → ✅（仅 Day 4 单天 fallback）
- 至少 1 次 rollback + 1 次 replace_slot → ✅（Day 11 + 12）
- stale_fallback 触发 → ✅（Day 13 + 14）

---

## 7. 通过标准（Pass Criteria）

### 7.1 强制通过（FAIL → Gate B 不能 sign-off）

```text
[✅] 14/14 天 cron 成功或 stale_fallback 兜底
[✅] 14/14 天 公开 API 返回 Edition
[✅] 14/14 天 slots_count = 12
[✅] ≤ 3 天连续 fallback
[✅] ≥ 12 天 is_complete = TRUE
[✅] 至少 1 次 rollback + 1 次 replace_slot 演练成功
[✅] stale_fallback 至少触发 1 次
```

### 7.2 软性指标（不阻断 Gate B，但需报告）

```text
- cron duration 平均 < 30s（理想 < 10s）
- 14 天 monitoring 告警 ≤ 5 条（连续 fallback INFO 类不计）
- audit_log 14/14 天有记录
- 单项失效隔离测试（T19）通过率 100%
```

### 7.3 报告交付物

| 文件 | 内容 |
|---|---|
| `drill-14day-results.csv` | 14 天每日结果表 |
| `drill-14day-summary.md` | 汇总报告（Pass/Fail + 图表） |
| `drill-14day-raw-events.json` | 14 天所有 monitoring 事件 |
| `drill-screenshots/` | UI 截图（每天 Daily 12 状态） |
| `drill-runbook-fixes.md` | 演练期间发现的问题 + 修复 |

---

## 8. 失败处理（演练期间）

### 8.1 失败分类

| 类别 | 处理 |
|---|---|
| **cron 失败** | 检查 Vercel logs / DB connection / 重新部署 → 演练重跑 |
| **admin API 失败** | 检查 auth token / 审计失败原因 → 修复 + 重跑 |
| **fixtures 问题** | 调整 fixture → 演练重跑 |
| **schema 问题** | 紧急 hotfix → 演练重跑（演练推迟 Gate B） |

### 8.2 演练延期触发条件

| 触发 | 处理 |
|---|---|
| 14/14 天 **0 通过** | Gate B 自动延后 1 周 |
| 14/14 天 **< 8 通过** | Gate B 自动延后 2 周 |
| 14/14 天 **≥ 8 通过** | Gate B 进入 sign-off 阶段 |

---

## 9. 报告模板

```markdown
# 14 Day Continuous Supply Drill · Report

**Drilled period**: 2026-08-25 ~ 2026-09-07
**Drilled by**: Engineer Agent
**Gate**: B (Closed Beta)
**Result**: PASS / FAIL

## Headline
- 14/14 天 cron 成功（或 stale 兜底）
- 14/14 天公开 API 成功
- 12/14 天 is_complete=TRUE（85.7%）
- 0 天连续 fallback（< 3 天阈值）
- 2 次 admin 操作演练成功（rollback + replace_slot）
- 1 次 stale_fallback 触发

## 详细结果（表格）
| Day | Date | Cron | API | Slots | Filled | Fallback | Admin Ops | Notes |
|-----|------|------|-----|-------|--------|----------|-----------|-------|
| 1   | ...  | ✅   | ✅  | 12    | 12     | FALSE    | -         | 完美 |
| ... | ...  | ...  | ... | ...   | ...    | ...      | ...       | ...   |

## 发现的问题 + 修复
1. [问题] → [修复] → [PR / commit]
2. ...

## 监控告警（演练 14 天）
- fallback_streak: 0 次
- cron_failed: 0 次（除 Day 13 模拟）
- ...

## Gate B Sign-off
- [ ] 14/14 通过
- [ ] 报告 review 通过
- [ ] fix 全部 merged
- [ ] Editorial team approve
```

---

## 10. 演练前后 Checklist

### 10.1 演练前

```text
[ ] Test DB 创建 + fixture 注入完成
[ ] Time-travel wrapper 部署
[ ] Cron simulator 部署
[ ] Verifier 部署
[ ] Monitoring 配置（E-P0-10）
[ ] Editorial team 通知
```

### 10.2 演练后

```text
[ ] Test DB 数据导出（备份）
[ ] 演练报告 review
[ ] 发现的问题 fix 跟踪
[ ] Gate B sign-off meeting
```

---

## 11. 与其他任务的依赖

| 依赖 | 内容 |
|---|---|
| **E-P0-09** | 公开 API contract 锁定（演练依据） |
| **E-P0-04** | Moment 实体（候选池数据源） |
| **E-P0-10** | Monitoring（演练期间所有告警 + 报告） |
| **D-P0-04** | Daily 12 8 状态矩阵（验证 UI 渲染） |
| **D-P0-06** | Launch UI Checklist（14 天演练后 Gate C 准备） |

---

## 12. 不做的事

- ❌ **不在 prod 演练** —— 永远在 test/staging
- ❌ **不污染 alpha** —— alpha 跑真实 3 天（模式 A），不影响演练
- ❌ **不做"极限压力测试"**（如 10000 candidate 池）—— V1 典型 30-80 张候选
- ❌ **不做"全年 365 天演练"** —— 14 天足够（V1 简化）
- ❌ **不做"跨年演练"**（12/31 → 1/1 边界）—— V1.x 评估
- ❌ **不做"语言 / locale 切换演练"** —— i18n 与 Edition 解耦
- ❌ **不引入新测试框架** —— 用现有 Vitest + 自写 runner

---

## 13. 自验收 Checklist（14 天演练）

- [x] Gate B 通过条件 9 项明确
- [x] 3 种演练模式（真实 / 加速 / 混合）
- [x] 10 类单元场景 + 5 类集成场景 + 5 类边界场景
- [x] Time-travel DB + cron simulator 架构
- [x] 14 天 fixture 编排
- [x] 14 天用例表 + 通过标准
- [x] 报告模板
- [x] 演练前后 checklist

---

> **下一步**：演练报告 review → Gate B sign-off → Closed Beta 启动。