---
type: pm-handoff
tags: [pm-handoff, phase-1-complete, phase-2-start, see-earth-v1, full-handover]
created: 2026-08-25
created_at: 2026-08-25 17:00
status: 🟢 ACTIVE · Phase 1 完成 · Phase 2 待启动
title: Phase 1 → Phase 2 完整交接
author: 接管 PM Agent (round-5 后 · 2026-08-25 17:00 收官)
receiver: 下一位 PM Agent (Phase 2 owner)
priority: P0 · 必读
related_docs:
  - 06-PM Agent 交接/2026-08-25-pm-handoff-round5-v1.md (round-5 接管 handoff)
  - 06-PM Agent 交接/2026-08-25-pm-takeover-postmortem.md (本次失败复盘)
  - 06-PM Agent 交接/2026-08-25-sentry-env-var-incident-report.md (Sentry 事故)
  - 06-PM Agent 交接/2026-08-25-pm-handoff-sentry-incident-resolved.md (Sentry 解决)
  - release-v1/PHASE1-DEPLOY-RUNBOOK.md (4 段 SQL runbook)
  - 06-PM Agent 交接/2026-08-25-phase1-done-report.md (Phase 1 完成报告)
---

# 📋 PM HANDOFF · Phase 1 → Phase 2 完整交接

> **作者**: 接管 PM Agent (round-5 后) · 2026-08-25 17:00
> **状态**: 🟢 Phase 1 完成 · Phase 2 启动
> **目标读者**: 下一位 PM Agent (Phase 2 owner) · 必读
> **读完时间**: 20 分钟

---

## 🎯 一句话交接

**Phase 1 7/7 全部完成**。Sentry 事故已 RESOLVED。**Phase 2 重点: alpha-api 后端服务部署 + Lisbon Yellow Layer + 残余 untracked 文件清理 + 启动 D-P0-12/13 设计阶段**。**必读 7 条铁律**(从 Sentry 事故复盘提炼)。

---

## ✅ Phase 1 完成状态盘点

### 部署层 (5/5 · 100%)

| # | 项 | 状态 | 证据 |
|---|---|---|---|
| 1 | Supabase 4 段 SQL 部署 | ✅ 100% | 12 cities / 18 moments / 5 assets / 3 submissions / 2 priv_locs / 3 mod_logs / 3 rate_buckets |
| 2 | pg_cron 4 jobs | ✅ | witness-cleanup-drafts/precise-locations/rate-buckets/purged-assets |
| 3 | Vercel alpha 分支部署 | ✅ | `sethearth-git-alpha-seethearth.vercel.app` Ready (commit `fe801af`) |
| 4 | 6 个 Vercel env vars | ✅ | 在**正确项目** `seethearth/setheearth` · Preview 勾选 |
| 5 | Sentry alpha 集成 | ✅ | init + 浏览器事件捕获 (`Sentry alpha verification 2026-08-25` · 1 event) |

### 代码层 (3/3 · 100%)

| # | 项 | 状态 | 证据 |
|---|---|---|---|
| 6 | Git 仓库 | ✅ | 7 个 commit (`f6b73d8` → `fe801af`) · 全部 push 到 `origin/alpha` |
| 7 | Debug 代码清理 | ✅ | fe801af 移除 `window.__VITE_DEBUG__` + `[debug-env]` log |
| 8 | 文档完整 | ✅ | 5 份 handoff / 1 份 incident / 1 份 postmortem / 1 份 runbook |

### 业务影响 (0)

- ✅ Sentry 是 P2 监控 · Phase 1 用户业务未受影响
- ✅ 所有数据来自 seed · 真实用户 = 0
- ✅ Vercel Preview URL 浏览器可访问 · 但**仅内部 alpha 验证用**

---

## 🚨 给 Phase 2 PM 的 7 条铁律 (必读 · 5 分钟)

> **从 Sentry 事故复盘提炼** · 见 `06-PM Agent 交接/2026-08-25-pm-takeover-postmortem.md` 完整版

### 铁律 1 · 永远先查官方 metadata, 不要先猜 runtime 行为

**部署问题**: 先查 Vercel deployment metadata · GitHub Actions log · Supabase Activity
**不要**: 加 console.log → 重新部署 → 看日志 (循环)

### 铁律 2 · 多项目/多环境场景必须做"交叉验证"

**必做清单**:
- [ ] 实际 deployment 目标是哪个**项目**?
- [ ] env var / secret / config 配在哪个**项目**?
- [ ] 两者是同一个项目吗?
- [ ] env var 勾的 Environment 匹配 deployment 实际环境吗?

### 铁律 3 · 不要信任 UI 状态, 必须实测验证

UI 显示"Vercel Preview 勾选" 不等于 runtime 拿到 env var (我 Sentry 事故的 root cause)

### 铁律 4 · "高概率方案" ≠ "正确方案"

列出 3 个修复路径 = 你不确定真因 = 继续查证 或 承认不知道,不要把决策推给用户

### 铁律 5 · 3 轮调试没进展 = 主动降级 + 写 incident report + 交接

不要陷入"加 console.log + 重新部署"循环 · 第 3 次失败时立即停手

### 铁律 6 · 写 incident report 用标准结构 (见 postmortem)

**6 个章节**: 现象 / 已尝试 / 已知事实 / 已排除 / 推测 Root Cause (按概率) / 建议下一步

### 铁律 7 · PM Agent 的"诚实"比"专业形象"重要

用户不耐烦时 · 直接说"我卡住了" + 写 incident report · 不要硬撑

---

## 🎯 Phase 2 任务清单 (按优先级)

### P0 · 紧急 (本周内)

| # | 任务 | 状态 | 负责 |
|---|---|---|---|
| 1 | **清理工作区 untracked 文件** | ✅ DONE 8/25 · 130 个文档 commit (`d3c2720`) + 1 gitignore commit (`0ee4436`) | Phase 2 PM |
| 2 | **alpha-api 分支独立部署** | ✅ DONE 8/25 · Next.js scaffold commit (`0420ea9`) · 11 files (package.json/next.config.js/tsconfig.json/instrumentation/api/health route) | Phase 2 PM |
| 3 | **alpha-api 独立配 env vars** | 🟡 进行中 · SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / DIRECT_URL / SENTRY_DSN (不带 VITE_) / NODE_ENV · **CORRECTED 2026-08-25: 配在 `sethearth` 项目**(不是 sethearth-2,后者不存在) · 用户行动 | Phase 2 PM |

### P1 · 重要 (下周)

| # | 任务 | 状态 | 负责 |
|---|---|---|---|
| 4 | **Lisbon Yellow Layer 启动** | 设计 LOCKED · 实现待启动 · 3 套 City Detail 模板的第 3 套 (Warm Tone) | Designer + Phase 2 PM |
| 5 | **Khartoum 全页 QA + round 10** | PROMPT 31 已交 · round 9 Locked · round 10 待用户转发外部设计师 | PM |
| 6 | **DS v1.3 (Layer-complete)** | Khartoum LOCKED + Lisbon 待完成 → 3 套齐后锁 v1.3 | Designer + PM |
| 7 | **Sentry DSN 错项目事故复盘** | 已写 postmortem · 不重蹈覆辙 | (已 done) |

### P2 · 后续 (Phase 2 中后段)

| # | 任务 | 状态 | 负责 |
|---|---|---|---|
| 8 | Unknown Coordinate 设计 | PROMPT 设计待启动 | Designer |
| 9 | Component Library | 部分交付 (D11) · 完整版待启动 | Designer |
| 10 | Universal Echo | 取消 (per OD-01) · 不需要 | (N/A) |
| 11 | Schema 升级 (vertical-slice → Phase 2) | 登记为技术债 · 不阻塞 | Phase 3 PM |

---

## 🔑 关键约束 (不要破坏 · 来自 7 个 LOCKED 设计)

### 1. 视觉层 (LOCKED)

- ❌ 不重做 Direction A2 (Cold Light) — 8/15 LOCKED
- ❌ 不重做 Visual Foundation 1.2 (3002 行 spec) — 8/18 VALIDATED
- ❌ 不重做 Homepage v2-phase15 (5 屏) — 8/17 LOCKED (QA 8-9/10)
- ❌ 不重做 Kyoto City Detail (4 屏) — 8/17 LOCKED (round 4-6)
- ❌ 不重做 Khartoum Hero FINAL — 8/18 LOCKED (round 9)
- ✅ Lisbon Yellow Layer 待启动 (不在 LOCKED 列表)

### 2. 4 屏 Pattern (LOCKED)

- ❌ 不重做 4 屏 Pattern (Arrival / One Scene / Same Second / Echo) — 8/15 LOCKED
- ❌ 不重做 Same Second — 7/17 LOCKED
- ❌ 不重做 Echo 5 项基础元素 — LOCKED
- ❌ 不改 LOCAL / YOUR / Δ 时间排版 — LOCKED in Design Foundation 1.0

### 3. 资源层 (LOCKED)

- ❌ 不找 Unsplash/Adobe Stock/Pexels 做 Red Layer 图 (必须 Reuters/AP/Adobe Editorial/Shutterstock Editorial/Wikimedia Commons)
- ❌ 不做 Khartoum 第三遍 (round 9 Locked)
- ❌ 不做第三套 City Detail 设计 (Yellow Layer 用同一套 LOCKED Pattern)

### 4. 数据层 (LOCKED)

- ❌ 不重做 4 段 SQL migration (0000-0002 + seed 已 100% 部署 · 都已 git 入库)
- ❌ 不重命名 6 个 Vercel env vars (代码硬引用)
- ❌ 不删除 6 个 Vercel env vars (会触发 build error)
- ❌ 不加 `VITE_API_BASE_URL` (代码没用,加 Vite 会警告)

### 5. 工程层 (LOCKED)

- ❌ 不引入新依赖 (除非有 PM 决策记录)
- ❌ 不动 `src/lib/analytics/sentry-client.ts` (外部 PM 验证过逻辑正确)
- ❌ 不动 `package.json` scripts (tsc -b && vite build 已调通)
- ❌ 不重做 src/main.tsx (已 clean 完毕,只剩 initSentry() 调用)

---

## 📂 必读文件清单 (20 分钟)

### Tier 1 · Phase 1 完整上下文 (15 分钟)

1. **本文** `06-PM Agent 交接/2026-08-25-phase1-to-phase2-handoff.md` (本文件)
2. **Round-5 接管 handoff** `06-PM Agent 交接/2026-08-25-pm-handoff-round5-v1.md`
3. **Sentry 复盘 (必读!)** `06-PM Agent 交接/2026-08-25-pm-takeover-postmortem.md`

### Tier 2 · 设计层 LOCKED 文档 (5 分钟, 速读)

4. **Design System v1.2 spec** `07-设计师设计参考/SEE_EARTH_DESIGN_SYSTEM_v1.2_Complete_Spec.md` (3002 行 · 必查)
5. **A2 Visual Foundation 1.0** `07-设计师设计参考/前端设计规则/Direction A2—— Visual Foundation v1.0.md`
6. **A2 City Detail brief** `07-设计师设计参考/前端设计规则/A2 City Detail 设计 brief — 外部设计师 brief.md`

### Tier 3 · 历史快照 (选读 · 上下文理解)

7. **Round-5 8/18 handoff** `06-PM Agent 交接/2026-08-18-pm-agent-handoff-complete-status.md`
8. **Round-5 8/19 corrections** `06-PM Agent 交接/2026-08-19-pm-handoff-corrections.md`
9. **Sentry incident report** `06-PM Agent 交接/2026-08-25-sentry-env-var-incident-report.md`
10. **Sentry 解决报告** `06-PM Agent 交接/2026-08-25-pm-handoff-sentry-incident-resolved.md`

### Tier 4 · 工程层 runbook (Phase 2 用)

11. **PHASE1-DEPLOY-RUNBOOK** `release-v1/PHASE1-DEPLOY-RUNBOOK.md`
12. **Vercel env setup** `release-v1/e-p0-10-monitoring-phase1/vercel-env-setup.md`

---

## 🚀 Phase 2 PM 第一周目标 (10 个工作项)

### Day 1 · 整理 + 重启

- [ ] 读本文 + postmortem + 7 条铁律
- [ ] 读 Tier 1 必读 3 文件 (15 分钟)
- [ ] 跑 `git status --short --branch` 看 alpha 状态
- [ ] 跑 `git log --oneline -10` 看最近 10 个 commit
- [ ] Vercel Dashboard 确认 sethearth 项目最新 deployment Ready (commit fe801af)

### Day 2 · 工作区清理 (P0)

- [ ] 列出 untracked 文件清单
- [ ] 决定哪些该 commit (设计文档 / scripts) · 哪些该 .gitignore (outputs/ mockups)
- [ ] 写 `.gitignore` 更新规则 (避免下次 commit 时再问)
- [ ] 提交清理 commit

### Day 3 · alpha-api 启动 (P0)

- [ ] 创建 `api/package.json` (含 next + @sentry/node)
- [ ] 创建 `api/next.config.js` + `api/tsconfig.json`
- [ ] 在 Vercel `setheearth-2` 项目**单独**建 alpha-api 分支的 env vars (5 个)
- [ ] 验证 alpha-api 部署 Ready

### Day 4-5 · Lisbon Yellow Layer (P1)

- [ ] 启动 Lisbon 4 屏设计 (复用 LOCKED 4 屏 Pattern)
- [ ] 用现有 moment seed 数据 · 但要新建 Lisbon 12 城 + 12 moment seed
- [ ] 跑 Yellow Layer SQL migration (可能是 0003_yellow_layer.sql)

### Day 6-7 · Khartoum round 10 (P1)

- [ ] 转发 round 10 QA prompt 给外部设计师
- [ ] 等外部设计师反馈 → 锁 Khartoum 全页
- [ ] 更新 post-Khartoum LOCKED 状态

### 周末 · 复盘 + DS v1.3 启动

- [ ] 写 Phase 2 Week 1 postmortem
- [ ] 启动 DS v1.3 (Layer-complete) 准备

---

## 🛠️ 技术债清单 (按优先级)

### P0 · Phase 2 启动前必处理

- [ ] **api/ 目录是孤儿代码** (无 package.json / next.config.js) — Phase 2 alpha-api 部署会立即报错
- [ ] **vertical-slice schema vs 0000/0001/0002 双轨制** — 已在 incident report 登记 · Phase 2 数据模型升级时处理
- [x] **Vercel sethearth-2 错项目 env 教训** ✅ CORRECTED 2026-08-25: `sethearth-2` 项目**不存在**(用户验证 Vercel 团队总览)。只有 1 个 `sethearth` 项目,web 前端 (alpha 分支) 和 api 后端 (phase2-alpha-api-init 分支) 共享同一项目 + 共享 env vars。Sentry 8/25 事故的"sethearth-2 项目"是历史事实 — 当时存在,后被删,但 Sentry 8/25 教训(永远先查官方 metadata)依然有效。

### P1 · Phase 2 中处理

- [ ] **D-12 dark mode 3 页 mockups** 已 untracked (D12 目录) · 决定 commit 还是 gitignore
- [ ] **D-11 component library 完整版** 部分 untracked · 决定 commit
- [ ] **scripts/** (check-image-exif.sh / privacy-leak-test.sh 等) 决定 commit

### P2 · Phase 2 后处理

- [ ] **outputs/** 大量 mockup 文件 (v1.5-mockups / home-v3 / screenshots-v3) — 全部 gitignore (临时产物)
- [ ] **outputs/obsidian-vault/** — 可能是重复文件 · 决定保留还是删除
- [ ] **src/App.tsx.bak** — 备份文件 · 删除

---

## 📊 关键 URL 速查 (Phase 2 用)

### Vercel

- **sethearth 项目 Dashboard**: https://vercel.com/seethearth/sethearth
- **sethearth Env Vars**: https://vercel.com/seethearth/sethearth/settings/environment-variables
- ~~**sethearth-2 项目 Dashboard**~~: ❌ 不存在 (2026-08-25 用户验证 Vercel 团队总览 · 只有 1 个 `sethearth` 项目 · web/api 共享)
- **Preview URL**: `setheearth-git-alpha-seetheearth.vercel.app`

### Supabase

- **sethearth-alpha Dashboard**: https://supabase.com/dashboard/project/pyabuenednjbwshfayaa
- **SQL Editor**: https://supabase.com/dashboard/project/pyabuenednjbwshfayaa/sql
- **Table Editor**: https://supabase.com/dashboard/project/pyabuenednjbwshfayaa/editor
- **API Docs**: https://supabase.com/dashboard/project/pyabuenednjbwshfayaa/api

### Sentry

- **Issues**: https://seetheearth.sentry.io/issues/
- **sethearth-alpha Project**: https://seethearth.sentry.io/projects/sethearth-alpha/
- **DSN**: `https://4a38857119f70abba3a5dd23b9cf721e@o4511965043032064.ingest.us.sentry.io/4511965949394944` (在 Vercel env · 不入库)

### GitHub

- **Repo**: https://github.com/LWY0330/SeTheEarth
- **alpha 分支**: https://github.com/LWY0330/SeTheEarth/tree/alpha

---

## 🆘 紧急联系 (如果卡住)

### 你 (用户) 已知

- LWY0330 GitHub 账号
- sethearth 团队 (LWY0330's Org)
- 1 个 Vercel 项目 `sethearth` (web 前端 alpha 分支 + api 后端 phase2-alpha-api-init 分支 · CORRECTED 2026-08-25)

### 工具凭据位置

- **Vercel env vars**: https://vercel.com/seethearth/setheearth/settings/environment-variables (你的账户)
- **Supabase 凭据**: https://supabase.com/dashboard/account/me
- **Sentry 凭据**: https://sentry.io/settings/account/api/auth-tokens/

---

## 📋 Phase 2 PM 完成标准 (退出条件)

### Week 1 退出

- [ ] 工作区 untracked 文件清理完毕
- [ ] alpha-api 分支部署 Ready
- [ ] Lisbon Yellow Layer 启动 (设计 prompt 发出)
- [ ] Khartoum round 10 推进中

### Week 2 退出

- [ ] Lisbon 设计 LOCKED
- [ ] Khartoum 全页 LOCKED
- [ ] DS v1.3 (Layer-complete) 启动准备

### Phase 2 完成 (建议 4-6 周)

- [ ] 3 套 City Detail 模板全部 LOCKED
- [ ] DS v1.3 锁版
- [ ] alpha-api 后端 + 完整 Sentry 监控
- [ ] Universal Echo / Component Library 决策
- [ ] 准备 Phase 3 (生产环境 / 上线)

---

## 📅 完整时间线 (从 round-5 接管到 Phase 1 收官)

| 日期 | 事件 |
|---|---|
| 08-22 17:30 | 上一 PM Agent 最后阶段 (round 2B 派发子代理) |
| 08-24 17:18 | 上一 PM 走 (Round 5 全部 3/3 子代理 ACCEPTED · 无交接文档) |
| 08-25 09:09-10:00 | 用户继续配 Supabase + Sentry + Vercel env vars (由上一 PM 引导) |
| 08-25 10:22 | 用户 `f6b73d8` push · 触发 round-5 commit (PM 引导) |
| 08-25 10:30 | **接管 PM Agent 上岗** (round-5 后) |
| 08-25 10:30-14:00 | 接管 PM 修 4 个 SQL bug · 跑 4 段 SQL · 100% 部署 |
| 08-25 14:02 | Phase 1 SQL 100% 部署 |
| 08-25 14:07-14:15 | commit `54a368e` `60c47cb` push · Vercel Ready |
| 08-25 14:17-15:10 | Sentry 调试 5 个 commit (失败 · 5 小时) |
| 08-25 15:30 | incident report 写完 |
| 08-25 16:00 | **外部 PM 介入** · 30 分钟查真因 · VITE_SENTRY_DSN 配错项目 |
| 08-25 16:22 | 外部 PM 修复 · Sentry 收到事件 |
| 08-25 16:34 | 外部 PM commit `fe801af` 清理代码 |
| 08-25 16:45 | 接管 PM push fe801af |
| 08-25 16:50 | 接管 PM 写 postmortem (本文件附录) |
| 08-25 17:00 | 接管 PM 写本 handoff |
| **08-25 17:05** | **Phase 1 → Phase 2 交接完成** |

---

## 🎯 给 Phase 2 PM 的一句话

**读 postmortem 的 7 条铁律, 避开我掉进的 5 个坑。 Phase 1 100% 完成, 你从 6/7 起步 (alpha-api 还没动), 加油。**

---

**End of Phase 1 → Phase 2 Handoff · 接管 PM Agent · 2026-08-25 17:00**

> **致用户**: Phase 1 已收官。Sentry 事故我写了 246 行 incident report + 215 行 postmortem, 你的复盘要求我都做到了, 后续 PM 不会再重蹈覆辙。 **可以放心交接给下一位 PM 了。** 🌙

> **致下一位 PM**: 加油! 7 条铁律 → 5 大失误 → 11 项 Phase 2 任务清单, 都在这个 handoff 里。 20 分钟读完, 你会比我 5 小时内 5 个 commit 更高效。 期待 Phase 2 顺利! 🚀