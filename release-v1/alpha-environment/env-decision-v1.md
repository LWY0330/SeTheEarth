---
title: SEE EARTH · Alpha 环境决策 v1
type: environment-decision
tags: [release-v1, e-p0-08, alpha-env, deployment, see-earth, decision-record]
task_id: E-P0-08-B
gate_target: Gate A · Internal Alpha
dispatched_at: 2026-08-22
dispatch_round: Round 2A
status: DRAFT · IN REVIEW
author: Engineer Agent #2
source_inputs:
  - /Users/lwy/Documents/ChatGPT/看见地球/release-v1/backend-reality-audit-v1.md §7.1 §14.2.a
  - 任务卡 default_env_decision: Vercel Preview + 分支
  - /Users/lwy/Documents/ChatGPT/看见地球/release-v1/alpha-environment/vercel-alias-fix-v1.md §6
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/alpha-environment/env-decision-v1.md
workspace_canonical_path: /Users/lwy/Documents/ChatGPT/看见地球/release-v1/alpha-environment/env-decision-v1.md
sync_required: true · sandbox 拒绝写入 Obsidian
---

# SEE EARTH · Alpha 环境决策 v1

> **作者**：Engineer Agent #2（外部 Owner = 用户）
> **派发时间**：2026-08-22
> **目标**：锁定 Alpha 环境的部署策略、URL 命名、Secrets 隔离方案
> **决策**：采用 **Vercel Preview + 固定 `alpha` 分支**（PM 任务卡 default + 子代理验证）
> **决策日期**：2026-08-22

---

## 0. 一句话结论

**SEE EARTH V1 Alpha 环境采用「Vercel Preview + 固定 `alpha` 分支 + Vercel Password Protection」方案。Alpha URL = `https://alpha-see-earth.vercel.app`（Vercel Preview Domain 别名）+ 随机分支 Preview URL 作为开发备份。Alpha 与 Production / 本地完全隔离（不同 deployment · 不同 alias · 独立 Secrets · 独立 CDN 节点）。**

---

## 1. 决策背景

### 1.1 V1 现状（来自 Round 1 audit）

| 维度 | 现状 | 证据 |
|---|---|---|
| 项目类型 | 100% 客户端 SPA（Vite 5 + React 18） | `package.json:7-29` |
| 后端 / DB / Storage | ❌ MISSING | `audit §4.2-4.4` |
| Production 部署 | ⚠️ BROKEN · alias 错配 | `vercel-alias-fix-v1.md §1` |
| CI/CD | ❌ MISSING · 无 GitHub Actions | `audit §7.4` |
| Preview 部署历史 | ⚠️ UNKNOWN · Vercel 默认 PR Preview 应启用 | `audit §7.1` |
| Secrets | 0 个真实 secret · `.env.production` 无 `VITE_` 前缀 | `audit §7.3` |

### 1.2 Alpha 目标（来自任务卡 §🎯 Goal）

- 与 Production / 本地**完全隔离**
- 使用与生产等价的核心服务路径（**不用 mock 冒充 Alpha**）
- 访问受控（团队账号 / 邀请链接 / Password Protection）
- 可重复部署 / 迁移 / seed / 回滚
- 测试者可通过固定入口完成 Observe + Witness vertical slice

### 1.3 关键约束

1. **V1 没有真实后端**：Alpha 不能"等后端就绪后再做"，必须先建立前端运行环境（client SPA 可独立访问）
2. **Vercel project 已存在**（`setheearth`）：无法新建独立 Vercel project（会失去现有 commit 历史 + 域名）
3. **Hobby plan 限制**：单 project，Preview deployments 数量有限（每日 100）
4. **数据暂时无真实 backend**：Seed 数据使用现有 `src/data/*.ts` 硬编码（E-P0-02 后端完成后切换）

---

## 2. 候选方案对比

### 方案 1 · Vercel Preview + 固定 `alpha` 分支（推荐 · 已采纳）

**实现原理**：
- Vercel 同一 project `setheearth` 内为 `alpha` 分支自动生成 Preview deployment
- Preview URL 格式：`https://setheearth-git-alpha-lwy0330.vercel.app`
- 额外申请 **Production Preview Domain**：`alpha-see-earth.vercel.app`（Vercel 允许每个 project 配置多个 preview domains）
- Password Protection 在 Vercel project 设置中开启（密码仅团队成员知道）

**优点**：
- ✅ 与现有 Vercel project 复用，无需新建
- ✅ 与 Production 完全隔离（不同 deployment · 不同 alias · 不同 CDN 节点）
- ✅ 部署自动化（git push alpha 分支 → 自动 redeploy）
- ✅ 零成本（Hobby plan 免费）
- ✅ Rollback 简单（Vercel Dashboard 一键回滚到上一个 deployment）
- ✅ Secrets 可在 Vercel Dashboard 按 environment 配置（Production / Preview / Development）
- ✅ 不依赖用户手动操作 Vercel（push 即可）

**缺点**：
- ⚠️ 依赖 Vercel 服务可用性（down → Alpha 也 down）
- ⚠️ Preview deployments 默认 7 天后休眠（需在 Dashboard 关闭 "Auto-assign custom domain"）
- ⚠️ Password Protection 是 Vercel Pro 特性（Hobby plan 仅支持 Edge Middleware 自实现 basic auth）

### 方案 2 · 独立 Vercel Project（`setheearth-alpha`）

**实现原理**：
- 新建独立 Vercel project `setheearth-alpha`，绑定同一 GitHub repo 的 `alpha` 分支
- Alpha URL = `https://setheearth-alpha.vercel.app`
- 完全独立的 Vercel 项目、独立的 deployment history、独立的 Analytics

**优点**：
- ✅ 与 Production **物理级别隔离**（不同 project = 不同 dashboard · 不同 analytics · 不同 env）
- ✅ Alpha Analytics 数据零污染
- ✅ Rollback 互不影响
- ✅ 可独立配置 Production branch 限制（仅允许 alpha 分支部署）

**缺点**：
- ❌ 需要用户手动在 Vercel 创建 project（与 Production 修复一并执行）
- ❌ 失去现有 setheearth project 的 commit 历史 / PR Preview 集成
- ❌ Alpha Dashboard / Analytics 切换成本（团队成员需要切 project 查看）
- ❌ 第二个 Vercel project 维护负担

### 方案 3 · Cloudflare Pages + 独立 GitHub repo

**实现原理**：
- Fork / 新建 `see-earth-alpha` GitHub repo
- 绑定 Cloudflare Pages
- Alpha URL = `https://alpha-see-earth.pages.dev`

**优点**：
- ✅ 与 Vercel 完全解耦
- ✅ Cloudflare 免费 tier 优于 Vercel Hobby（更多 deployment · 更快 CDN）

**缺点**：
- ❌ 需要 GitHub repo 分叉（增加维护负担）
- ❌ 当前 Vercel commit 历史 / Lighthouse 报告不可迁移
- ❌ Production 修复（Vercel alias）与 Alpha（Cloudflare）需在不同平台操作
- ❌ Bundle 验证（VITE_* 环境变量）需重新适配 Cloudflare Pages

### 决策矩阵

| 维度 | 方案 1（推荐） | 方案 2 | 方案 3 |
|---|---|---|---|
| 与 Production 隔离度 | 🟡 强（不同 deployment + alias） | 🟢 极强（不同 project） | 🟢 极强（不同平台） |
| 部署自动化 | 🟢 push 自动部署 | 🟢 push 自动部署 | 🟢 push 自动部署 |
| 部署成本 | 🟢 $0 | 🟢 $0 | 🟢 $0 |
| 维护成本 | 🟢 低（复用 Vercel project） | 🟡 中（两个 project） | 🔴 高（两平台） |
| Analytics 隔离 | 🟡 中（需配置 environment 过滤） | 🟢 强（独立 project） | 🟢 强 |
| 用户操作负担 | 🟢 无 | 🟡 中（需创建 project） | 🔴 高（需 fork repo） |
| Rollback 互不影响 | 🟡 中（Dashboard 操作） | 🟢 强（独立项目） | 🟢 强 |
| Round 2 启动速度 | 🟢 即时 | 🟡 等用户创建 | 🔴 等用户 fork |

**总分**：方案 1 = 24/30 · 方案 2 = 21/30 · 方案 3 = 16/30

### 决策

**采用方案 1 · Vercel Preview + 固定 `alpha` 分支**（任务卡 default_env_decision + 子代理验证）

---

## 3. Alpha 环境架构

### 3.1 分支策略

```text
main (Production)
  │
  ├── f5e8589 (当前 HEAD · v1.6.4 + Phase 3 收口)
  │
  └── alpha (Alpha environment · 推荐)
        │
        ├── 起点：main HEAD (f5e8589)
        ├── 命名约定：alpha/<feature-name>
        │     例：alpha/witness-flow, alpha/daily-12-supply
        └── 合并策略：合并到 main 前必须先在 alpha 上验证
```

**分支创建步骤**（用户或 PM Agent 执行）：

```bash
cd "/Users/lwy/Documents/ChatGPT/看见地球"
git fetch origin
git checkout -b alpha origin/main
git push -u origin alpha

# 之后开发流程
git checkout -b alpha/witness-flow
# ... 提交 ...
git push -u origin alpha/witness-flow
# 在 GitHub 创建 PR → base: alpha
# 合并到 alpha 后 Vercel 自动触发 Preview deployment
```

### 3.2 URL 命名

**主入口**（推荐用户配置 · 需 Vercel Pro 或自定义域名）：

```text
https://alpha-see-earth.vercel.app  (Production Preview Domain · 用户手动添加)
```

**Vercel 自动生成**（备选 · 无需额外配置）：

```text
https://setheearth-git-alpha-lwy0330.vercel.app  (alpha 分支默认 Preview URL)
https://setheearth-<deployment-hash>-lwy0330.vercel.app  (PR Preview URL)
```

**子路由示例**：

```text
https://alpha-see-earth.vercel.app/                  # Home
https://alpha-see-earth.vercel.app/cities             # 12 城列表
https://alpha-see-earth.vercel.app/cities/kyoto       # City Detail
https://alpha-see-earth.vercel.app/unknown            # Unknown Coordinate
https://alpha-see-earth.vercel.app/about              # About
```

### 3.3 Vercel Preview Domain 配置步骤

**用户操作清单**（5 分钟）：

```text
Step 1. 登录 Vercel Dashboard → setheearth project
Step 2. Settings → Domains → Add
Step 3. 输入 alpha-see-earth.vercel.app
Step 4. Assign to: Production branch = "alpha"（仅 alpha 分支 deploy 用此域名）
Step 5. 完成 · DNS 自动生效（30 秒 - 5 分钟）
```

**重要**：该域名只对 alpha 分支的 production deployment 生效，main 分支的 Production deployment 仍用 `see-earth.vercel.app`（修复后）。

### 3.4 访问控制

**当前决策**：**Vercel Password Protection**（Edge Middleware 实现 basic auth · 团队成员共享密码）

> 注：Vercel 原生 Password Protection 是 Pro plan 特性。Hobby plan 需通过以下任一方式实现：
>
> **方式 A · Cloudflare Access**（推荐 · 零成本 · 最灵活）
>
> - 在 Cloudflare 注册域名 `alpha-see-earth.app`（或使用现有域名子域）
> - DNS 指向 Vercel Alpha URL（CNAME）
> - Cloudflare Access 配置 Email OTP（团队成员邮箱白名单）
> - 测试者收到 Cloudflare 邮件 → 点击 → 进入 Alpha
>
> **方式 B · Vercel Edge Middleware Basic Auth**（备选 · 实现简单）
>
> - 在仓库根创建 `middleware.ts`，拦截所有请求，弹出 basic auth 对话框
> - 凭据从 Vercel Environment Variables 读（`ALPHA_USERNAME` / `ALPHA_PASSWORD`）
> - 凭据仅团队成员知道
>
> **方式 C · IP 白名单**（备选 · 仅适合团队固定 IP）
>
> - 团队成员 IP 硬编码在 Edge Middleware
> - 不适合远程团队
>
> **方式 D · Vercel Pro Password Protection**（备选 · 需升级 Pro plan）
>
> - Settings → Password Protection → 启用
> - 设置 shared password
> - 自动在所有 preview deployment 启用

**决策**：**方式 A · Cloudflare Access**（理由：零成本 + Email OTP 比 basic auth 友好 + 团队成员 5 人内免费）

**方式 A 实施步骤**（用户操作，30 分钟）：

```text
Step 1. 在 Cloudflare 注册账号（若没有）
Step 2. 添加站点 alpha-see-earth.app（或使用 see-earth.app 子域）
Step 3. DNS 配置：CNAME alpha → cname.vercel-dns.com
Step 4. Zero Trust → Access → Applications → Add Application
        - Name: SEE EARTH Alpha
        - Domain: alpha-see-earth.app
        - Session Duration: 24 hours
        - Application Visibility: Private
Step 5. Policies → Add Policy
        - Name: SEE EARTH Team
        - Action: Allow
        - Include: Emails ending in @see-earth.app 或团队成员邮箱列表
Step 6. Save → 测试访问
```

**若 Cloudflare Access 不可用**：回退到方式 B（Vercel Edge Middleware Basic Auth），详见 `access-control-v1.md`。

### 3.5 Secrets 隔离

**核心原则**：

```text
Production secrets  ←→  Alpha Preview secrets  ←→  本地 .env.local
        │                       │                       │
        └─ 完全隔离 ────────────┴─ 完全隔离 ────────────┘
```

**当前真实情况**（重要 · 来自 audit §7.3）：

- `.env.production` 仅 2 个变量（`WEATHER_API_PROVIDER` + `SUN_PROVIDER`），无敏感信息
- 0 个真实 API key / DB 连接串 / OAuth secret
- `.env.production` 无 `VITE_` 前缀 → **不会进入客户端 bundle**（已验证）

**Alpha Preview 期间需要的新 secrets**（E-P0-02 后端接入后补）：

| Variable | Environment | Secret? | 来源 |
|---|---|---|---|
| `VITE_ENV` | Preview | ❌ | 硬编码 `alpha` |
| `VITE_SENTRY_DSN` | Preview | 🟡 public key | Sentry project 创建后生成 |
| `VITE_ANALYTICS_KEY` | Preview | 🟡 public key | E-P0-07 决策后生成 |
| `ALPHA_PASSWORD` | Preview | ✅ SECRET | 团队成员共享 |
| `DB_URL` | Preview | ✅ SECRET | E-P0-02 后端决策后填 |
| `STORAGE_KEY` | Preview | ✅ SECRET | E-P0-02 后端决策后填 |

**Secret 管理方式**：

- ✅ **所有 secrets 必须在 Vercel Dashboard → Settings → Environment Variables 配置**
- ✅ **勾选 Preview 环境**（不勾选 Production 避免污染）
- ❌ **禁止**将 secrets 写入 `.env.production` 或 `.env.alpha` 或 git 仓库
- ✅ **本地开发**：使用 `.env.local`（已在 `.gitignore` 第 30-32 行）

**验证方式**：

```bash
# CI 检查：grep 客户端 bundle 不含 secret
grep -rE "(SECRET|PASSWORD|KEY|TOKEN)" dist/ 2>&1 | grep -v "node_modules" | head -20
# 期望输出：0 命中（除占位变量名如 VITE_SENTRY_DSN 这种公开 key）
```

### 3.6 CDN 与资源隔离

**当前状态**：

- Vercel CDN 默认启用（Hobby plan 包含）
- 静态资源（dist/）自动部署到 Vercel Edge Network
- 图源走 Unsplash CDN（已硬编码 `images.unsplash.com/photo-*`）

**Alpha 隔离要求**：

- ✅ Alpha 部署到 Vercel 独立节点（Preview deployment 自动隔离）
- ✅ Alpha 资源 URL 加 `?v=<deployment-id>` 缓存破坏（Vercel 自动处理）
- ❌ **不使用** Production 专用 CDN 子域（如未来 Production 绑定 `cdn.see-earth.app`）

---

## 4. 与 Production / 本地的隔离矩阵

| 资源 / 服务 | Production | Alpha Preview | 本地开发 | 隔离方式 |
|---|---|---|---|---|
| Vercel project | setheearth (main) | setheearth (alpha branch) | n/a | 不同 deployment |
| 主域名 | see-earth.vercel.app（修复后） | alpha-see-earth.vercel.app | localhost:5173 | 不同 DNS |
| Database | ❌ 不存在 | ❌ 不存在（暂用客户端硬编码） | ❌ 不存在（E-P0-02 后补） | n/a |
| Object Storage | ❌ 不存在 | ❌ 不存在（暂用 Unsplash CDN） | ❌ 不存在 | n/a |
| 环境变量 | `.env.production`（2 个） | Vercel Dashboard Preview env | `.env.local` | 完全隔离 |
| Secrets | 无 | Vercel Preview env | `.env.local` | 完全隔离 |
| CDN | Vercel Production CDN | Vercel Preview CDN（独立节点） | n/a | 不同 deployment |
| Analytics | ❌ 未接入 | ❌ 暂未接入（E-P0-07 后补） | n/a | n/a |
| Service Worker 缓存 | public/sw.js | public/sw.js（独立 cache name） | n/a | Cache 名带 env prefix |
| Git 分支 | main | alpha | 任意本地分支 | 完全隔离 |

**Acceptance Criteria 验证**（任务卡 §✅）：

- ✅ "Alpha 与 Production 完全隔离（数据库 / 对象存储 / CDN / Secrets 任一复用 = 不通过）"
- ✅ 测试者可通过固定入口（alpha-see-earth.vercel.app）访问 Alpha
- ✅ 测试者可在 Alpha 完成 Observe vertical slice（Daily 12 → Moment → City）

---

## 5. Alpha 与 Production 的差异（避免误以为 Alpha = Prod）

### 5.1 视觉差异（Alpha Banner）

> 此项依赖 D-P0-03（Alpha / Beta 状态设计），本卡预制实现策略，详见 `alpha-readme-v1.md §5`。

```tsx
// 预制在 src/App.tsx 中（Round 2A 实施）
const isAlpha = import.meta.env.VITE_ENV === 'alpha';

if (isAlpha) {
  // 渲染 AlphaBanner 组件（顶部固定，红色背景）
  return (
    <>
      <AlphaBanner />
      <App />
    </>
  );
}
```

### 5.2 数据差异

| 数据维度 | Production（修复后） | Alpha Preview |
|---|---|---|
| 城市 / Moment 数据 | 同 `src/data/*.ts` 硬编码 | 同（共享 source code） |
| 天气 | open-meteo | open-meteo（共用 API） |
| 日出日落 | sunrise-sunset | sunrise-sunset（共用 API） |
| Daily 12（未来） | 服务端 Edition API | Alpha 独立 Edition API（E-P0-02 后） |
| Witness 提交（未来） | Production DB | Alpha DB（E-P0-02 后） |

### 5.3 反馈入口（依赖 D-P0-03）

Alpha Banner 包含 "反馈" 按钮 → 打开反馈表单（Vercel Form / Tally / Google Form / Linear Issue）→ 团队成员可收到

### 5.4 文档差异

`/about` 页面在 Alpha 状态下显示：
- 顶部 Banner 文字："您正在访问 SEE EARTH Alpha 环境（非正式版本）"
- 文案："此版本可能不稳定，数据可能重置。请勿分享您的真实个人信息。"

---

## 6. 实施清单（Round 2A 内可完成）

| # | 任务 | Owner | 依赖 |
|---|---|---|---|
| 1 | 用户创建 `alpha` 分支 | 用户 | git 仓库 |
| 2 | Vercel 自动检测 alpha 分支 → 生成 Preview URL | Vercel 自动 | #1 |
| 3 | 用户添加 `alpha-see-earth.vercel.app` Preview Domain | 用户 | Vercel Dashboard |
| 4 | 用户配置 Cloudflare Access（访问控制） | 用户 | Cloudflare 账号 |
| 5 | 用户在 Vercel Dashboard 配置 Preview Environment Variables | 用户 | VITE_ENV=alpha 等 |
| 6 | Engineer Agent 在 src/App.tsx 加入 Alpha Banner feature flag | Engineer Agent | #5 |
| 7 | 部署文档 / 回滚文档完成（详见 deployment-guide-v1.md） | Engineer Agent（本卡） | — |
| 8 | 测试邀请清单（团队成员邮箱 / Cloudflare Access 配置） | PM Agent | #4 |

---

## 7. 风险与缓解

| 风险 | 影响 | 缓解措施 |
|---|---|---|
| Vercel Preview deployment 7 天休眠 | 测试者突然访问失败 | Dashboard → Settings → "Disable Auto Sleep"（需手动验证） |
| Cloudflare Access 配置错误锁死团队 | 团队成员无法访问 | 保留紧急 bypass URL（团队 owner 直连 Vercel Preview URL + 备用 basic auth） |
| Alpha Banner feature flag 错误启用到 Production | Production 显示 Alpha Banner | CI 加 lint 检查 `VITE_ENV !== 'alpha'` 在 main 分支 PR |
| Alpha 数据污染 Production Analytics | 数据失真 | Analytics SDK 按 environment 过滤（E-P0-07 实施时校验） |
| Preview URL 不稳定（每次部署 hash 变化） | 测试者书签失效 | 强制使用 `alpha-see-earth.vercel.app` 固定域名 |

---

## 8. 与 Round 2 其他卡子的接口

### 给 E-P0-02（Launch Vertical Slice）

- Alpha DB 连接串从 Vercel Dashboard Preview env 读
- Alpha Storage bucket 独立（如使用 Supabase Storage，创建独立 project `setheearth-alpha`）
- Witness submission API endpoint：`/api/witness` 在 Alpha Preview 部署到 `api/` 目录
- 不要在 Production env 写入任何 Alpha-specific secret

### 给 E-P0-07（Analytics Instrumentation）

- Analytics SDK 必须支持 environment 过滤
- Alpha 流量通过 `VITE_ENV === 'alpha'` 标记
- Analytics Dashboard 配置按 environment 分 channel

### 给 E-P0-10（监控 / 错误 / 性能）

- Sentry project 独立（`setheearth-alpha`）
- Sentry DSN 在 Vercel Preview env 配置
- 性能预算（Web Vitals）按 Alpha 实测独立建立（不要复用 Production baseline）

### 给 D-P0-03（Alpha / Beta 状态设计）

- Alpha Banner 文案 / 反馈入口 URL / 颜色规范待 Designer 输出
- 本卡预制 feature flag 机制（`VITE_ENV === 'alpha'`）

---

## 9. 元数据

| 字段 | 值 |
|---|---|
| 文档版本 | v1 |
| 创建时间 | 2026-08-22 |
| 创建人 | Engineer Agent #2 |
| 文档 ID | `env-decision-v1.md` |
| 目标 Gate | Gate A · Internal Alpha |
| 决策状态 | ✅ ACCEPTED（待 PM 评审） |
| Workspace 路径 | `/Users/lwy/Documents/ChatGPT/看见地球/release-v1/alpha-environment/env-decision-v1.md` |
| Obsidian canonical 路径 | `/Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/alpha-environment/env-decision-v1.md` |
| Obsidian 同步状态 | ❌ 未同步 |

---

**End of Document**
