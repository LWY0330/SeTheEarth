---
title: SEE EARTH V1 · alpha-api · Vercel Env 变量配置 · Phase 2 P0-3 (CORRECTED 2026-08-25 · 单项目部署)
type: deployment-runbook
tags: [release-v1, e-p0-08, alpha-env, alpha-api, phase-2, vercel-env, p0-3, see-earth]
task_id: E-P0-08-C · Phase 2 续
gate_target: Gate A · Internal Alpha
phase: Phase 2
dispatched_at: 2026-08-25
dispatch_round: Round 5 (接管 PM Agent)
status: 🟡 READY · 用户行动 · 5 env vars 待配置
author: 2026-08-25 接管 PM Agent (Phase 2)
sender: 接管 PM Agent
receiver: 用户 (Vercel Dashboard 操作者)
related_docs:
  - ../../06-PM Agent 交接/2026-08-25-phase1-to-phase2-handoff.md (Phase 1 → Phase 2 交接)
  - ../../06-PM Agent 交接/2026-08-25-pm-takeover-postmortem.md (Sentry 事故复盘 · 7 铁律)
  - ../../06-PM Agent 交接/2026-08-25-pm-handoff-round5-v1.md (Round-5 接管 · alpha-api 分支未独立配 env 登记)
  - ../../api/README.md (alpha-api 部署说明)
  - ../../api/.env.example (env 模板)
  - ../../api/package.json (Next.js 项目结构)
  - ./alpha-readme-v1.md (Alpha 决策 · 隔离方案)
  - ./env-decision-v1.md (Vercel Preview + 固定 alpha 分支)
  - ./vercel-alias-fix-v1.md (错配诊断 · 2026-08-22)
  - ../e-p0-10-monitoring-phase1/vercel-env-setup.md (Phase 1 web env 配置 · 6 vars 旧参考)
---

# SEE EARTH V1 · alpha-api · Vercel Env 变量配置 · Phase 2 P0-3 (CORRECTED 2026-08-25 · 单项目部署)

> **作者**:2026-08-25 接管 PM Agent(Phase 2)
> **目的**:让用户在 Vercel Dashboard 一键配置 alpha-api 后端所需的 5 个环境变量
> **核心原则**(从 Sentry 事故复盘提炼):**永远先查官方 metadata · 多项目交叉验证 · 不信任 UI 状态**
> **预计时间**:5-10 分钟

---

## 🎯 一句话总结

**🔴 CORRECTED 2026-08-25:sethearth-2 项目**不存在**(用户验证)。**只有 1 个 Vercel 项目 `sethearth`**,web 前端(alpha 分支)和 api 后端(phase2-alpha-api-init 分支)**共享同一组 env vars**。Phase 2 P0-3 需要在 `sethearth` 项目**新增 3 个 env vars**(SUPABASE_SERVICE_ROLE_KEY / DIRECT_URL / SENTRY_DSN / NODE_ENV),**Sentry incident 复盘中的"sethearth-2 项目"是历史事实**(8/25 当时存在,后被删,但当前不存在)。**

---

## 📋 配置前置确认(必做 · 5 分钟)

> ⚠️ **铁律 2**(Sentry 事故根因):**多项目/多环境场景必须做交叉验证**

### Q1. 是哪个 Vercel 项目?

| 项目名 | URL | 用途 |
|---|---|---|
| **`setheearth`** | https://vercel.com/seethearth/sethearth | **Phase 1 web 前端** (Vite + React) · 6 env vars 已配 ✅ |
| `sethearth-2` | ~~https://vercel.com/seethearth/setheearth-2~~ | ❌ **不存在** · 2026-08-25 用户验证 Vercel 团队总览确认只有 1 个项目 |

**→ 你要打开的是 `sethearth`**(URL: https://vercel.com/seethearth/sethearth/settings/environment-variables)

**🔴 关键修正**:web 前端和 api 后端 **共享同一项目 + 共享 env vars**,通过分支区分。Vercel 同一项目下:web 部署用 `alpha` 分支,api 部署用 `phase2-alpha-api-init` 分支,各自产生 Preview URL。

**VITE_ 前缀机制**(Vite 构建时安全):
- Web 读 `VITE_SENTRY_DSN`(Vite 客户端代码)
- API 读 `SENTRY_DSN`(Next.js runtime,`process.env.SENTRY_DSN`)
- 两者**同名不同前缀**,**都配在 sethearth 项目,不冲突**

### Q2. 是哪个 Git 分支?

| 分支 | 内容 | 部署目标 |
|---|---|---|
| `alpha` | Web 前端(Vite/React) | sethearth 项目 |
| `alpha-api` | 后端 API(Next.js)— 但 **未同步 api/ scaffold** | (历史) |
| **`phase2-alpha-api-init`** | api/ scaffold + cleanup + docs + v1.3 LOCKED + PROMPT 40 PM-APPROVED | **sethearth 项目** ✅ |

**→ 推荐分支 `phase2-alpha-api-init`**(本 PM 已创建并 push 至 origin,4 commits ahead of alpha-api)
**→ 备选分支 `alpha-api`**(需先 merge phase2-alpha-api-init 后再切)

### Q3. env vars 适用环境?

| 环境 | 是否需要 | 备注 |
|---|---|---|
| **Production** | ✅ 必须 | `sethearth.vercel.app` (或 alpha Preview URL) |
| **Preview** | 🟡 推荐 | 每次 push 自动 redeploy 时用 |
| **Development** | ❌ 不需要 | 本地 dev 用 `api/.env.local` |

---

## 📝 5 个环境变量配置清单

### Var 1 · `SUPABASE_URL`

| 字段 | 值 |
|---|---|
| **Name** | `SUPABASE_URL` |
| **Value** | `https://pyabuenednjbwshfayaa.supabase.co` |
| **Environment** | Production ✅ Preview ✅ |
| **敏感度** | 🟢 Public(URL 不含密钥)|

**Value 验证**:
- ✅ 与 Phase 1 web 前端的 `SUPABASE_URL` 同值
- ✅ Supabase Dashboard:https://supabase.com/dashboard/project/pyabuenednjbwshfayaa/settings/api → "Project URL"
- ⚠️ **不带 `VITE_` 前缀**(这是后端 env,不是 Vite 客户端 env)

### Var 2 · `SUPABASE_SERVICE_ROLE_KEY`

| 字段 | 值 |
|---|---|
| **Name** | `SUPABASE_SERVICE_ROLE_KEY` |
| **Value** | `eyJhbGc...REPLACE_ME...`(从 Supabase Dashboard 复制完整)|
| **Environment** | Production ✅ Preview ✅ |
| **敏感度** | 🔴 **SECRET** · **NEVER** commit · 严格保密 |

**Value 验证**(从 Supabase Dashboard 取):
```
1. 打开 https://supabase.com/dashboard/project/pyabuenednjbwshfayaa/settings/api
2. 找到 "Project API keys" 段
3. 复制 "service_role" key(以 "eyJ" 开头 · 完整 200+ 字符)
4. ⚠️ 不要用 "anon public" key(service_role 才能绕过 RLS)
```

**与 Phase 1 web 区别**:
- web 端用 `SUPABASE_ANON_KEY`(公开 · 带 VITE_ 等价)
- **后端**用 `SUPABASE_SERVICE_ROLE_KEY`(私密 · 绕过 RLS)

⚠️ **⚠️ ⚠️ 安全铁律 ⚠️ ⚠️ ⚠️**
- ❌ **绝对不要** 写入 git 任何文件(包括 .env.example · 只能写 "REPLACE_ME")
- ❌ **绝对不要** 截图含 service_role key 的 Vercel Dashboard
- ❌ **绝对不要** 分享给非团队成员
- ✅ 只有 Next.js API route handler 在 `process.env` 里读

### Var 3 · `DIRECT_URL`

| 字段 | 值 |
|---|---|
| **Name** | `DIRECT_URL` |
| **Value** | `postgresql://postgres:REPLACE_ME@db.pyabuenednjbwshfayaa.supabase.co:5432/postgres` |
| **Environment** | Production ✅ Preview ✅ |
| **敏感度** | 🔴 **SECRET**(含 database password)|

**Value 验证**(从 Supabase Dashboard 取):
```
1. 打开 https://supabase.com/dashboard/project/pyabuenednjbwshfayaa/settings/database
2. 找到 "Connection string" 段
3. 选择 "URI" 标签
4. 复制完整 connection string(postgresql://postgres:<password>@db...:5432/postgres)
5. ⚠️ 不要选 "Transaction" 或 "Session" mode 标签(我们用 direct connection)
```

### Var 4 · `SENTRY_DSN`

| 字段 | 值 |
|---|---|
| **Name** | `SENTRY_DSN` |
| **Value** | `https://4a38857119f70abba3a5dd23b9cf721e@o4511965043032064.ingest.us.sentry.io/4511965949394944` |
| **Environment** | Production ✅ Preview ✅ |
| **敏感度** | 🟡 Public(DSN URL 是公开的,但建议保密)|

**Value 验证**:
- ✅ 与 Phase 1 web 前端的 `VITE_SENTRY_DSN` 同 DSN 值
- ✅ Sentry 项目:sethearth-alpha (https://seethearth.sentry.io/projects/sethearth-alpha/)
- ⚠️ **不带 `VITE_` 前缀**(后端 env,Next.js 用 `process.env.SENTRY_DSN`)
- ✅ api/_lib/sentry-server.ts 已配置 `initServerSentry({dsn: process.env['SENTRY_DSN']})`

### Var 5 · `NODE_ENV`

| 字段 | 值 |
|---|---|
| **Name** | `NODE_ENV` |
| **Value** | `production`(for Production env) / `development`(for Preview env) |
| **Environment** | Production:production · Preview:development |
| **敏感度** | 🟢 Public |

**Value 验证**:
- ✅ Vercel 默认会自动设 `NODE_ENV=production` 在 Production deployment
- ✅ 推荐显式设置以便明确(不会与 Vercel 默认冲突)

---

## 🔧 操作步骤(用户)

### Step 1 · 打开 sethearth 项目环境变量页面(已修正)

```
https://vercel.com/seethearth/sethearth/settings/environment-variables
```

✅ URL 是 `sethearth`(sethearth-2 不存在,web 和 api 共享项目)

### Step 2 · 逐个添加 5 个 env vars

按上面的清单依次添加。每步:

1. 点击右上角 "Add New" 按钮
2. 输入 Name(例如 `SUPABASE_URL`)
3. 输入 Value(从 Supabase Dashboard 复制)
4. 选择 Environment:**勾选 Production + Preview**(开发环境不勾)
5. 点击 "Save"

### Step 3 · 验证 5 个 vars 都已存在

```
✅ SUPABASE_URL           · Production + Preview
✅ SUPABASE_SERVICE_ROLE_KEY · Production + Preview
✅ DIRECT_URL             · Production + Preview
✅ SENTRY_DSN             · Production + Preview
✅ NODE_ENV               · Production (production) + Preview (development)
```

---

## ✅ 部署 + 验证步骤

### Step 4 · 触发部署

```
1. Vercel Dashboard → sethearth → Deployments
2. 找到 branch 设置(Project Settings → Git → Production Branch)
3. 改为 "phase2-alpha-api-init"(或先 merge 到 alpha-api 后用 alpha-api)
4. 等待 Vercel 自动 redeploy(每个 commit 触发)
```

### Step 5 · 验证 `/api/health`

```bash
curl https://<alpha-api-vercel-url>/api/health
```

**期望输出**(200 OK):
```json
{
  "status": "ok",
  "service": "see-earth-api",
  "version": "0.1.0-alpha",
  "env": "production",
  "commit": "abc1234",
  "uptime_seconds": 5,
  "checks": {
    "sentry_initialized": true,
    "supabase_url_present": true,
    "service_role_key_present": true,
    "direct_url_present": true,
    "node_env": "production"
  }
}
```

### Step 6 · 验证 Sentry 集成

```
1. 访问 https://seethearth.sentry.io/projects/sethearth-alpha/issues/
2. 等待 1-2 分钟(初始化延迟)
3. curl /api/health 应该会触发 Sentry init event
4. 检查 Sentry Issues 列表是否有 init 事件
```

---

## 🚨 排错清单

### 症状 1 · `curl /api/health` 返回 503

**原因**:env vars 缺失或值错

**排错**:
```bash
curl https://<url>/api/health
# 检查返回的 checks 对象:
#   supabase_url_present: false → SUPABASE_URL 缺失
#   service_role_key_present: false → SUPABASE_SERVICE_ROLE_KEY 缺失
#   direct_url_present: false → DIRECT_URL 缺失
```

### 症状 2 · Sentry 不收事件

**原因**(per 8/25 postmortem):env var 配错项目

**排错**:
```
1. 确认 `VITE_SENTRY_DSN` 和 `SENTRY_DSN` 都配在 `sethearth` 项目(同名不同前缀)
2. 确认 `SUPABASE_SERVICE_ROLE_KEY` 和 `SUPABASE_URL` 都有(web 端用 ANON,api 端用 SERVICE_ROLE)
3. 检查 deployment 实际 target branch:
   - Vercel Dashboard → Deployments → 点击 commit → 看 "Branch" 字段
   - 应该显示 `phase2-alpha-api-init`(不是 alpha)
```

### 症状 3 · `pnpm install` 失败(本地)

**原因**:`api/` 目录还没装依赖

**解决**:
```bash
cd api
pnpm install  # 或 npm install
# 这会安装 next / @sentry/node / zod / @supabase/supabase-js 等
```

---

## 📋 7 铁律遵守清单(从 Sentry postmortem 提炼)

| # | 铁律 | 本配置应用 |
|---|---|---|
| 1 | 永远先查官方 metadata | ✅ Q1-Q3 前置确认(项目/分支/环境)|
| 2 | 多项目/多环境交叉验证 | ✅ sethearth 单项目 + web/api 不同分支 |
| 3 | 不信任 UI 状态,实测验证 | ✅ Step 5 curl /api/health 实测 |
| 4 | "高概率方案" ≠ "正确方案" | ✅ 不依赖"Vercel 应该会工作",要实测 |
| 5 | 3 轮调试没进展 = 主动降级 | N/A(本次是配置,非调试)|
| 6 | incident report 标准结构 | ✅ 本文按症状/已知事实/排错清单组织 |
| 7 | PM 诚实 > 专业形象 | ✅ 明示 5 个 env vars 是用户必做,不是 PM 必做 |

---

## 📎 关联文档

| 文档 | 用途 |
|---|---|
| `06-PM Agent 交接/2026-08-25-phase1-to-phase2-handoff.md` | Phase 1 → Phase 2 完整交接(P0-3 任务登记) |
| `06-PM Agent 交接/2026-08-25-pm-takeover-postmortem.md` | Sentry 事故复盘(7 铁律) |
| `06-PM Agent 交接/2026-08-25-pm-handoff-round5-v1.md` | Round-5 接管 · alpha-api 分支未独立配 env 登记 |
| `api/README.md` | alpha-api 部署说明 |
| `api/.env.example` | env 模板(已含 SUPABASE_URL + SENTRY_DSN,service_role/DIRECT_URL 需用户填)|
| `api/package.json` | Next.js 项目结构 |
| `release-v1/alpha-environment/alpha-readme-v1.md` | Alpha 决策 · 隔离方案 |
| `release-v1/alpha-environment/env-decision-v1.md` | Vercel Preview + 固定 alpha 分支 |
| `release-v1/alpha-environment/vercel-alias-fix-v1.md` | 错配诊断 · 2026-08-22 |
| `release-v1/e-p0-10-monitoring-phase1/vercel-env-setup.md` | Phase 1 web env 配置 · 6 vars 旧参考 |

---

**End of alpha-api Vercel Env 配置指南 · P0-3 · 2026-08-25 · 接管 PM Agent**

> **致用户**:本文档是给你在 Vercel Dashboard 操作的"零错误"清单。**5 个 env vars 配完后**,回信告诉我,我会:
> 1. 检查 deployment 状态
> 2. 帮你 curl /api/health 验证
> 3. 如果有错,按本文 §🚨 排错清单 + §7 铁律 处理
>
> 同时 — **PROMPT 40 v1 PM-APPROVED** 已就绪(d14-prompt-40-pm-review.md),你也可以同时转发给外部设计师。两件事并行,效率最高。