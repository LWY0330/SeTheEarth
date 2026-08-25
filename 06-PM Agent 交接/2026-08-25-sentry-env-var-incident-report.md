---
type: incident-report
tags: [incident, sentry, vite-env, round-5, see-earth-v1, phase-1]
created: 2026-08-25
created_at: 2026-08-25 15:30 (接管 PM Agent 视角)
status: 🟢 RESOLVED
severity: P2 (后端功能 · 不阻塞用户业务)
title: VITE_SENTRY_DSN 配置在错误的 Vercel 项目 · 已修复并完成 Sentry 验证
author: 接管 PM Agent (round-5 后)
resolved_at: 2026-08-25 16:22
related_docs:
  - 06-PM Agent 交接/2026-08-25-pm-handoff-round5-v1.md (接管 PM 完整 handoff)
  - release-v1/PHASE1-DEPLOY-RUNBOOK.md (4 段 SQL runbook)
  - release-v1/e-p0-03-phase1-1-db-schema/supabase/README.md
  - release-v1/e-p0-10-monitoring-phase1/vercel-env-setup.md (E-P0-10 env 配置说明)
---

# 🟢 INCIDENT REPORT · Sentry VITE_SENTRY_DSN 环境变量注入失败（已解决）

> **作者**: 接管 PM Agent (round-5 后 · 2026-08-25 15:30)
> **场景**: V1 后端 Phase 1 部署验证过程中 · Sentry 集成 0% 完成
> **严重度**: 🟡 P2 (后端监控功能 · 不阻塞任何用户业务)
> **状态**: 🟢 RESOLVED · 2026-08-25 16:22

---

## 📋 一句话事故总结

**`VITE_SENTRY_DSN` 与 `VITE_ENV` 配置在错误的 Vercel 项目/作用域，实际部署项目 `seetheearth/setheearth` 只有天气与日照变量，因此 Preview build 收不到用户配置。将两项变量写入正确项目的 Preview / `alpha` 分支并重新部署后，Sentry 成功初始化并收到浏览器测试事件。**

## ✅ 解决结果

- 正确 Vercel 团队/项目：`seetheearth/setheearth`
- 新增 `VITE_ENV=alpha`：Config · Preview · `alpha`
- 新增 `VITE_SENTRY_DSN`：Config · Preview · `alpha`
- 重新部署 commit `1c7d1a1`：Ready · 17s
- 浏览器证据：`[sentry-client] initialized for environment: alpha`
- Sentry 证据：新 issue `Sentry alpha verification 2026-08-25`，1 event
- 临时调试代码已从 `src/main.tsx` 移除

---

## 📋 事故前状态记录

| # | 项 | 证据 | Commit |
|---|---|---|---|
| 1 | Supabase Phase 1 SQL 100% 部署 | 12 cities / 18 moments / 5 assets / 3 submissions / 2 priv_locs / 3 mod_logs / 3 rate_buckets | `60c47cb` (含 0000-0002 + seed) |
| 2 | pg_cron 4 jobs 创建成功 | schedule ID = 4 | 同上 |
| 3 | Vercel alpha 分支部署 | `setheearth-git-alpha-seethearth.vercel.app` 加载成功，首页含 7 城 nav + EarthGlobe + 实时时间 | `60c47cb` + 修复 commit `54a368e` |
| 4 | 另一 Vercel 项目/作用域中存在 6 个 env vars | 截图当时被误认为实际部署项目配置；事后确认不适用于 `seetheearth/setheearth` | (根因) |
| 5 | Git 仓库入库 | 5 个 commit · 详见下表 | (本 incident 期间) |

---

## 🔴 事故详情

### 现象 (Symptom)

- **Sentry Dashboard `setheearth.sentry.io`** 仅有 1 条 Sentry 平台默认的 `ApiException / Authentication failed, token expired!` 示例 issue（来自 JAVA-1 `io.sentry.example.ApiRequest`）
- 用户在 Preview URL 浏览器 Console 执行 `throw new Error(...)` → Console 显示红色 `Uncaught Error` 但 Sentry 未收到
- 用户执行 `Promise.reject(...)` 同样无效
- Sentry alpha project 0 条真实 issue

### 已知事实 (Facts · 已验证)

| # | 事实 | 验证方式 |
|---|---|---|
| F1 | Vite build 收到 19 个 `VITE_VERCEL_*` 系统变量 | `[debug-env] viteKeys` 数组 · commit `768865a` 输出 |
| F2 | Vite build **未收到**任何用户配置 env var (VITE_SENTRY_DSN / VITE_ENV / SUPABASE_URL 等) | 同上 |
| F3 | `initSentry()` **被调用了**（不再是 if 包裹） | Console 显示 `[sentry-client] VITE_SENTRY_DSN missing · Sentry disabled` |
| F4 | 14:30 的截图显示另一项目/作用域中有 6 个 env vars，但实际部署项目没有 `VITE_ENV` 或 `VITE_SENTRY_DSN` | 16:09 正确项目页面截图 + GitHub deployment metadata |
| F5 | `package.json` build script 是 `tsc -b && vite build` · 本地 build 成功 | `release-v1/e-p0-10-monitoring-phase1/vercel-env-setup.md` §build |
| F6 | 浏览器 Console 有大量 CORS 错误指向 `vercel.com/sso-api` | 用户截图 (2026-08-25 15:09) · **与 Sentry 无关** · Vercel SSO/Analytics 自动请求 |

### 已确认 Root Cause

环境变量配置在错误的 Vercel 项目/作用域。GitHub deployment metadata 确认实际部署目标为团队 `seetheearth` 下的项目 `setheearth`；正确项目的 Environment Variables 页面最初只有 `WEATHER_API_PROVIDER` 与 `SUN_PROVIDER`，没有 `VITE_ENV` 或 `VITE_SENTRY_DSN`。因此问题与 Vite 读取逻辑、Sentry SDK 或 build cache 无关。

修复是在正确项目中创建两项 Config 变量，限制到 Preview / `alpha`，随后重新部署。新构建立即读取到两项变量。

---

## 🧪 已尝试的 5 个调试 commit (接管 PM Agent)

| # | Commit | 内容 | 结果 |
|---|---|---|---|
| 1 | `54a368e` | 3 个 SQL 修复 + 4 个文档 (PHASE1-DEPLOY-RUNBOOK / handoff / README) | ✅ 全部 push 成功 · 触发 GitHub Secret Scanning · 用占位符替换真实 secret 后 amend |
| 2 | `70ac764` | 移除 `if (import.meta.env.VITE_SENTRY_DSN) { initSentry() }` 包裹, 总是调用 initSentry | ✅ 客户端打印日志了 · 但 DSN missing |
| 3 | `768865a` | 加 `[debug-env] console.log(JSON.stringify(import.meta.env))` | ✅ Console 看到 viteKeys 数组 · 发现只有 VITE_VERCEL_* |
| 4 | `1c7d1a1` | 把 VITE env 挂到 `window.__VITE_DEBUG__` 让 Console 100% 访问 | ✅ 用于确认注入成功；事故解决后已清理 |

### 调试方法学错误

- ❌ 未先核对 GitHub deployment metadata 中的真实团队/项目标识
- ❌ 把错误项目中的变量截图误认为实际部署项目的配置证据
- ✅ 正确做法: 先确认 deployment target，再检查该项目的 env 作用域，最后触发新部署
- 教训: 调试不要陷入"加 console.log + 重新部署"循环

---

## 🔍 已执行验证

1. 正确项目页面显示 `VITE_ENV` 与 `VITE_SENTRY_DSN` 均为 Preview / `alpha`。
2. commit `1c7d1a1` 重新部署成功：Ready，耗时 17s。
3. Preview Console 返回 DSN present，并打印 `[sentry-client] initialized for environment: alpha`。
4. 通过异步未捕获错误触发测试事件：
   ```js
   setTimeout(() => {
     throw new Error('Sentry alpha verification 2026-08-25');
   }, 0);
   ```
5. Sentry Issues 在约 44 秒内收到 `Sentry alpha verification 2026-08-25`，事件数为 1。

---

## 🛡️ 最终风险评估

### 风险等级: 🟡 P2 (后端监控功能)

- **不影响**: 任何用户业务、前端功能、SQL migration
- **修复前影响**: Phase 1 前端监控覆盖率 0%
- **修复后影响**: 无；浏览器错误上报链路已验证
- **业务影响**: 0 (V1 还没用户)

### 不要做的事

- ❌ 不要继续重试同一 Vercel 缓存清除 (超过 3 次即放弃)
- ❌ 不要修改 sentry-client.ts 内部代码 (它是对的,问题在外部 env var)
- ❌ 不要重建 Supabase (SQL 部署 100% 完成,无需变动)

---

## 📂 相关文件清单

### 接管 PM Agent 创建的文档 (已 push)

- `06-PM Agent 交接/2026-08-25-pm-handoff-round5-v1.md` · 完整 handoff
- `release-v1/PHASE1-DEPLOY-RUNBOOK.md` · 4 段 SQL runbook
- `release-v1/e-p0-03-phase1-1-db-schema/supabase/migrations/0000_init_core.sql` · cities + moments DDL
- `release-v1/e-p0-03-phase1-1-db-schema/supabase/README.md` · 3 段 → 4 段
- `06-PM Agent 交接/2026-08-25-sentry-env-var-incident-report.md` · **本文档**

### 接管 PM Agent 修改的代码

- `src/main.tsx` · 保留无条件 `initSentry()`；事故验证后移除 `[debug-env]` 与 `window.__VITE_DEBUG__`
- `release-v1/e-p0-03-phase1-1-db-schema/supabase/migrations/0000_init_core.sql` · 新建
- `release-v1/e-p0-03-phase1-1-db-schema/supabase/migrations/0001_init.sql` · 修复
- `release-v1/e-p0-06-daily-12-code/migrations/0002_editions.sql` · 修复

### Sentry 相关源文件 (无需修改 · 是对的)

- `src/main.tsx` (已清理临时 debug)
- `src/lib/analytics/sentry-client.ts` (734 行 · initSentry 逻辑正确)

### Vercel 相关

- Vercel 团队/项目: `seetheearth/setheearth` (Hobby plan)
- Vercel Preview URL: `setheearth-git-alpha-seethearth.vercel.app`
- Vercel Env Vars URL: `https://vercel.com/seetheearth/setheearth/settings/environment-variables`
- `VITE_ENV` 与 `VITE_SENTRY_DSN` 均限制到 Preview / `alpha`

### Supabase 相关

- Supabase 项目: `sethearth-alpha` (Free plan, us-east-1)
- Supabase URL: `https://pyabuenednjbwshfayaa.supabase.co`
- 4 段 SQL 已完整跑过 (0000 / 0001 / 0002 / seed)
- Supabase SQL Editor URL: `https://supabase.com/dashboard/project/pyabuenednjbwshfayaa/sql`

### Sentry 相关

- Sentry org: `o4511965043032064` (sethearth)
- Sentry project: `sethearth-alpha` (alpha)
- Sentry DSN: 已配置于 Vercel Config（客户端公开 DSN，文档不再重复完整值）
- Sentry Dashboard URL: `https://seetheearth.sentry.io/issues/`
- 验证后 issues: JAVA-1 示例 + 新的浏览器测试事件

---

## 📊 时间线 (本次 incident)

| 时间 | 事件 |
|---|---|
| 08-25 09:30 | 上一 PM Agent 引导用户配 6 个 Vercel env vars (Preview 勾选) |
| 08-25 10:22 | 用户 `f6b73d8` commit push → Vercel build Error 8s (TS2307) |
| 08-25 10:30-14:00 | 接管 PM Agent: 调试 4 个 build error / 4 段 SQL 部署 / 修复 schema 冲突 |
| 08-25 14:02 | **Phase 1 SQL 100% 完成** (12/18/5/3/2/3/3 数据) |
| 08-25 14:07 | commit `54a368e` push 修复文件 + 文档 (GitHub Secret Scanning 拦截后 amend) |
| 08-25 14:15 | Vercel deployment Ready (`60c47cb` 包含 src/lib/analytics/) |
| 08-25 14:17 | 用户第一次尝试 Sentry 测试 (throw) · Sentry 未收到 |
| 08-25 14:30 | 用户确认 VITE_SENTRY_DSN env var 在 Vercel UI 上正确 |
| 08-25 14:50 | 接管 PM commit `70ac764` 移除 if 包裹 · Console 显示 DSN missing |
| 08-25 15:00 | commit `768865a` 加 debug 日志 · 发现 viteKeys 只有 VITE_VERCEL_* |
| 08-25 15:10 | commit `1c7d1a1` 把 VITE env 挂到 window.__VITE_DEBUG__ 用于临时诊断 |
| 08-25 15:30 | **本 incident 报告创建** · 接管 PM 主动降级,等用户决策 |
| 08-25 16:12 | 在正确项目 `seetheearth/setheearth` 创建 Preview / `alpha` 两项变量 |
| 08-25 16:15 | 重新部署 `1c7d1a1` 成功 · Ready · 17s |
| 08-25 16:19 | Console 确认 Sentry initialized for environment: alpha |
| 08-25 16:22 | Sentry 收到浏览器测试 issue · incident RESOLVED |

---

## 🎯 收尾状态

| 优先级 | 行动 | 预计时间 | 负责 |
|---|---|---|---|
| ✅ | 正确项目配置 Preview / `alpha` 环境变量 | 完成 | 用户 + 接管 PM |
| ✅ | 新部署 Ready | 完成 | Vercel |
| ✅ | Sentry 浏览器事件验证 | 完成 | 用户 + 接管 PM |
| ✅ | 清理 `[debug-env]` 与 `window.__VITE_DEBUG__` | 完成 | 接管 PM |

---

**End of Incident Report · RESOLVED · 2026-08-25 16:22**

> Phase 1 SQL、Vercel Preview 与 Sentry 浏览器监控验证均已完成。
