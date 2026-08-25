---
title: SEE EARTH · Vercel Alias 错配诊断与修复指南 v1
type: deployment-diagnostic
tags: [release-v1, e-p0-08, alpha-env, vercel, alias, deployment, see-earth]
task_id: E-P0-08-A
gate_target: Gate A · Internal Alpha
dispatched_at: 2026-08-22
dispatch_round: Round 2A
status: DRAFT · IN REVIEW
author: Engineer Agent #2
source_inputs:
  - /Users/lwy/Documents/ChatGPT/看见地球/release-v1/backend-reality-audit-v1.md §7.1 §7.4 §12 B-6 B-8
  - /Users/lwy/Documents/ChatGPT/看见地球/.env.production
  - /Users/lwy/Documents/ChatGPT/看见地球/src/components/Meta.tsx:10
  - /Users/lwy/Documents/ChatGPT/看见地球/index.html:24
blocking_round_2_mainline: false · Alpha Preview 可独立进行
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/alpha-environment/vercel-alias-fix-v1.md
workspace_canonical_path: /Users/lwy/Documents/ChatGPT/看见地球/release-v1/alpha-environment/vercel-alias-fix-v1.md
sync_required: true · sandbox 拒绝写入 Obsidian
---

# SEE EARTH · Vercel Alias 错配诊断与修复指南 v1

> **作者**：Engineer Agent #2（外部 Owner = 用户）
> **派发时间**：2026-08-22
> **目标**：定位 `see-earth.vercel.app` 返回 404 DEPLOYMENT_NOT_FOUND 的根因，并输出可由用户手动执行的修复步骤
> **阻塞 Round 2 主线**：❌ 否（Alpha Preview 可独立于 Production 进行，详见 §6 决策依据）

---

## 0. 一句话结论

**当前 Vercel project `setheearth` 的 Production alias 指向一个已被删除或被替换的 deployment（commit `c9bb3d3` / Aug 17 PR #11），导致 `see-earth.vercel.app` 返回 `404 DEPLOYMENT_NOT_FOUND`。该错配是 dashboard 端的人为配置问题，**不阻塞 Alpha Preview 部署**；Alpha 环境将使用 Vercel Preview URL（`setheearth-git-<branch>.vercel.app`）独立进行，Production 修复由用户在 Vercel Dashboard 手动执行。**

---

## 1. 现象与证据

### 1.1 用户报告

- Vercel Dashboard 显示 Production 部署 Ready in 11s
- `https://see-earth.vercel.app` 返回 `404 DEPLOYMENT_NOT_FOUND`
- 项目名称（Vercel project）：`setheearth`（Hobby plan）
- 最近 commit `c9bb3d3`（Aug 17, PR #11）

### 1.2 仓库侧证据

| 证据位置 | 内容 | 说明 |
|---|---|---|
| `index.html:24` | `<link rel="canonical" href="https://see-earth.vercel.app/" />` | 占位 URL · 部署实际状态未验证 |
| `src/components/Meta.tsx:10` | `const SITE_URL = 'https://see-earth.vercel.app'; // TODO: 部署后改为实际域名` | 同上 · TODO 注释说明占位 |
| `package.json:1-29` | 无 vercel 相关 build script | 无自定义 build pipeline |
| 仓库根 | **无 `vercel.json` / `vercel.toml` / `.vercelignore`** | Vercel 使用默认部署配置 |
| `.github/workflows/` | **不存在** | 无 GitHub Action 触发部署 |
| `git log` | 仅历史 commit `2b5cdc7` "ci: trigger vercel production deployment"（Aug 10 2026） | 上次显式 Production 触发 |

### 1.3 Round 1 audit 已记录结论

> 引用 `backend-reality-audit-v1.md:356`：
> "**Production** | ⚠️ UNKNOWN · 仅静态 URL 占位（`https://see-earth.vercel.app`） | `src/components/Meta.tsx:10` 'TODO: 部署后改为实际域名'"
>
> 引用 `backend-reality-audit-v1.md:363`：
> "Production 实际状态必须由用户 / 外部 Owner 确认（沙箱 DNS 受限，无法访问 see-earth.vercel.app 实测）"
>
> 引用 `backend-reality-audit-v1.md:527`：
> "**B-8** | Production 部署实际状态未知（`see-earth.vercel.app` 仅占位 URL；CI/CD = 0；Lighthouse 报告 8/15 后无新版本基线）"

**修订结论**：基于用户 2026-08-22 新报告（Production 部署 Ready 11s + 404 DEPLOYMENT_NOT_FOUND），状态从 `UNKNOWN` 升级为 `BROKEN`，根因 = **alias 指向已不存在的 deployment**。

---

## 2. 错配根因（3 个最可能假设 + 验证步骤）

### 假设 A · Alias 指向已删除/已 redeploy 的 deployment（**最可能**）

**机理**：Vercel Production alias 在 Dashboard 配置时**绑定到某个具体 deployment UID**。若该 deployment 被：
- (a) 用户在 Dashboard 手动删除
- (b) 被新 commit 的 production deploy 替换（Vercel 实际默认行为是**保留旧 deployment**而非删除）
- (c) 因配额超限被 Hobby plan 自动清理（**最不可能**，Hobby 不自动清理）

alias 仍指向不存在的 deployment UID → 返回 `404 DEPLOYMENT_NOT_FOUND`。

**验证步骤**（用户操作）：
1. 登录 Vercel Dashboard：https://vercel.com/dashboard/setheearth
2. 进入 **Settings → Domains**
3. 查看 `see-earth.vercel.app` 当前 Production alias 指向哪个 deployment（应显示 deployment ID / commit SHA）
4. 进入 **Deployments** 标签，检查该 deployment 是否还存在
5. 若 deployment 被删除或被替换：**假设 A 成立**

### 假设 B · 域名 DNS 未生效或被改回 Vercel 默认占位

**机理**：`see-earth.vercel.app` 是 Vercel 给所有项目的默认占位域名，格式为 `<project-name>.vercel.app`。若项目从 `setheearth` 被重命名（如 `setheearth2`），默认域名会跟着变。404 可能因为：
- 用户在 Vercel 改了 project slug（**官方不支持在创建后修改**，但可通过删除 + 重建）
- 域名配置冲突（同时绑了多个 alias）

**验证步骤**：
1. Vercel Dashboard → Project Settings → General → 查看 Project Name
2. 若 Project Name ≠ `setheearth` → 假设 B 成立
3. Settings → Domains → 检查是否有多个 alias 冲突

### 假设 C · Project 实际未部署成功（build 失败但 dashboard 误报）

**机理**：Vercel Hobby plan 在 build 失败时仍会创建 deployment 记录，但状态标记为 `Error`。若 dashboard 显示 "Ready" 实际是上次缓存，404 可能因为浏览器缓存或 CDN 节点同步延迟。

**验证步骤**：
1. Vercel Dashboard → Deployments → 检查最近 deployment 的 Build Logs
2. 若 build 失败但状态显示 Ready → 假设 C 成立
3. 尝试 `curl -I https://see-earth.vercel.app` 查看真实 HTTP 状态码（排除浏览器缓存）

### 决策树

```text
用户打开 Vercel Dashboard
  │
  ├── Settings → Domains → see-earth.vercel.app 指向哪个 deployment？
  │     │
  │     ├── 指向的 deployment 在 Deployments 列表中不存在 ─────────── 假设 A 成立 ✅
  │     │
  │     └── 指向的 deployment 在列表中存在
  │           │
  │           ├── Project Name ≠ "setheearth" ──────────────────── 假设 B 成立 ✅
  │           │
  │           └── Project Name = "setheearth"
  │                 │
  │                 ├── Build Logs 显示失败 ─────────────────────── 假设 C 成立 ✅
  │                 │
  │                 └── Build Logs 成功 ─────────────────────────── 其他原因（联系 Vercel Support）
```

---

## 3. 修复步骤（用户手动操作清单）

> ⚠️ **本子代理无法直接操作 Vercel Dashboard**（DSH sandbox 不允许外部 API 调用 + 用户 Dashboard 凭证不在 agent 权限范围内）。以下步骤必须由用户执行。

### 方案 1 · 重新绑定 Production alias（推荐 · 对应假设 A）

```text
Step 1. 登录 Vercel Dashboard
        URL: https://vercel.com/dashboard/setheearth
        账号: 用户 Vercel 账号（用户自管理）

Step 2. 进入 Deployments 标签
        找到状态为 "Ready" 的最新 deployment（即 commit c9bb3d3 之后的版本，或最新 commit f5e8589）
        记录该 deployment 的 deployment ID（格式如 dpl_xxxxx）

Step 3. 进入 Settings → Domains
        找到 see-earth.vercel.app
        点击右侧 "..." → "Edit" 或 "Remove"
        若 Remove：确认 → 重新添加 see-earth.vercel.app → 选择 "Production" branch → Assign

Step 4. 等待 DNS 传播（通常 30 秒 - 5 分钟）
        在浏览器打开 https://see-earth.vercel.app
        应显示新版 SPA（v1.6.4 + Phase 3 收口）
```

### 方案 2 · 触发新 Production 部署（推荐 · 对应假设 A + 兜底）

```text
Step 1. 确认本地 main 分支已是最新
        cd "/Users/lwy/Documents/ChatGPT/看见地球"
        git checkout main
        git pull origin main

Step 2. 在 Vercel Dashboard 触发 redeploy
        Deployments → 找到最新 Ready deployment → "..." → "Redeploy"
        或：Deployments → "Create Deployment" → 选择 main branch → Deploy

Step 3. 等待 build 完成（1-3 分钟）
        Build Logs 应显示 "Compiled successfully" + 状态变为 "Ready"

Step 4. 检查 Domain 绑定
        Settings → Domains → see-earth.vercel.app
        应自动指向新 deployment；若未自动指向：手动 Edit → Assign

Step 5. 浏览器验证
        https://see-earth.vercel.app → 应返回 200 OK + SPA 内容
```

### 方案 3 · 删除 project 并重建（兜底 · 对应假设 B 或持久化错配）

```text
Step 1. ⚠️ 备份所有环境变量
        Settings → Environment Variables → 截图所有 Production 环境变量

Step 2. Settings → Advanced → Delete Project
        输入项目名确认删除

Step 3. Import Git Repository → 重新创建
        Git Provider: GitHub
        Repository: LWY0330/SeTheEarth
        Project Name: setheearth（保持一致）
        Framework Preset: Vite
        Build Command: npm run build（或 tsc -b && vite build）
        Output Directory: dist

Step 4. 重新添加环境变量
        Settings → Environment Variables
        按 §4 变量清单补齐

Step 5. 触发 Production 部署
        Deployments → Deploy
```

### 推荐执行顺序

1. **优先方案 2**（redeploy，5 分钟内见效）
2. **失败则方案 1**（重新绑定 alias，10 分钟）
3. **最后方案 3**（重建 project，30 分钟 · 会丢失 Vercel Analytics 历史数据）

---

## 4. Vercel Environment Variables 清单（修复后必须配置）

> Vercel project 必须在以下 Environment Variables 配置后才算 Production-ready。这些变量**当前不在 `.env.production`**（因为是构建时变量，不需要 `VITE_` 前缀）。

| Variable | Environment | Value（默认） | 用途 |
|---|---|---|---|
| `WEATHER_API_PROVIDER` | Production | `open-meteo` | 天气 provider · `.env.production:5` |
| `SUN_PROVIDER` | Production | `sunrise-sunset` | 日出日落 provider · `.env.production:6` |
| `VITE_USE_UNIVERSAL_CITYPAGE` | Production | `false` | feature flag · `.env.example:26` |

**Alpha Preview 专属变量**（每 PR 独立）：

| Variable | Preview Environment | Value | 用途 |
|---|---|---|---|
| `VITE_ENV` | Preview | `alpha` | 标识环境 · 用于 Alpha Banner 渲染 |
| `VITE_SENTRY_DSN` | Preview | （E-P0-10 接入后填） | Sentry DSN · 错误上报 |
| `VITE_ANALYTICS_KEY` | Preview | （E-P0-07 接入后填） | Analytics key |
| `VITE_ALPHA_FEEDBACK_URL` | Preview | （D-P0-03 反馈入口 URL） | 反馈表单 |

---

## 5. 修复后的验证 checklist

| # | 验证项 | 命令 / 步骤 | 通过标准 |
|---|---|---|---|
| 1 | HTTP 状态 | `curl -I https://see-earth.vercel.app` | 返回 `200 OK` |
| 2 | 主页内容 | `curl -s https://see-earth.vercel.app \| grep "看见地球"` | 包含 "看见地球" 字符串 |
| 3 | SPA 路由 | 浏览器访问 `https://see-earth.vercel.app/cities/kyoto` | 渲染 City Page（不 404） |
| 4 | Meta tags | DevTools → `<head>` | `og:url` = `https://see-earth.vercel.app/cities/kyoto` |
| 5 | 静态资源 | DevTools → Network → 加载 `dist/assets/*.js` | 200 OK · 无 404 |
| 6 | Lighthouse | `npm run lighthouse`（本地） | Performance ≥ 90 · PWA ✓ |
| 7 | Bundle 版本 | DevTools → Network → 查看 `index-*.js` 文件大小 | 约 1-2 MB（gzip 前） |
| 8 | Vercel Analytics | Dashboard → Analytics → 访问数据 | 应看到访问记录 |

---

## 6. 与 Round 2 主线的依赖关系

### 6.1 不阻塞 Round 2 主线（关键结论）

**Alpha 环境将独立于 Production 进行**：

```text
Production (see-earth.vercel.app)
  ├── ❌ BROKEN · alias 错配
  ├── 🔒 修复由用户执行（本卡交付物 §3）
  └── 不阻塞 Alpha Preview

Alpha Preview (setheearth-git-<branch>.vercel.app)
  ├── ✅ 独立 Vercel project（同一 setheearth project 但 Preview deployment）
  ├── ✅ 独立 URL · 独立 Domain
  ├── ✅ 与 Production 完全隔离（不同 deployment · 不同 alias · 不同 DNS）
  └── Round 2 主线依赖此环境
```

**理由**：
1. Vercel Preview deployment 是 Vercel 默认行为（每个 PR 自动生成），不需要额外配置
2. Alpha Banner / Feedback 入口只显示在 Preview URL（基于 `VITE_ENV === 'alpha'` feature flag）
3. 测试者通过 Preview URL 访问，不会误以为 Alpha = Production
4. Production 修复可异步进行（不影响 E-P0-02 / E-P0-06 / E-P0-07 进度）

### 6.2 建议的 Round 2 时间线

```text
Round 2A (Week 1)
  ├── E-P0-08 本卡 · Alpha Preview 环境（IN PROGRESS → IN REVIEW）
  ├── E-P0-09 · API Contract（并行）
  └── 用户异步修复 Production alias（不阻塞）

Round 2B (Week 2-3)
  ├── E-P0-02 · Launch Vertical Slice（基于 Alpha Preview）
  ├── E-P0-06 · Daily 12 Supply Chain（基于 Alpha Preview）
  └── E-P0-07 · Analytics（基于 Alpha Preview）

Round 2C (Week 3)
  └── 用户 Production alias 修复 + Production smoke test
```

---

## 7. Blocker Log

| 日期 | 阻塞描述 | 类别 | Owner | 解锁条件 | 状态 |
|---|---|---|---|---|---|
| 2026-08-22 | Production alias 错配（404 DEPLOYMENT_NOT_FOUND） | 部署配置 | 用户（外部 Owner） | 用户在 Vercel Dashboard 执行 §3 方案 2 | **OPEN · 不阻塞 Round 2 主线** |
| 2026-08-22 | 子代理无法直接操作 Vercel Dashboard | 工具权限 | — | 用户手动执行修复 | **永久限制** |
| 2026-08-22 | Vercel project 当前真实状态（部署数量 / 环境变量 / 域名列表）需用户确认 | 事实缺口 | 用户（外部 Owner） | 用户提供 Dashboard 截图或文字描述 | **OPEN · 阻塞诊断精度** |

---

## 8. 下一步建议

### 给用户（外部 Owner）

1. **优先执行 §3 方案 2**（redeploy · 5 分钟见效）
2. 若方案 2 失败，**提供 Dashboard 截图**给 PM Agent → 由 PM 转交 Engineer Agent 做进一步诊断
3. **记录当前 Production bundle 版本**（v1.6.4 + Phase 3 收口，commit f5e8589）作为 baseline

### 给 PM Agent（Orchestrator）

1. 本卡子代理交付 6 个交付物后，可在 Round 2B 启动 E-P0-02
2. E-P0-02 的部署目标 = Alpha Preview URL（不是 Production）
3. E-P0-07 Analytics 接入时需确认 Sentry / Vercel Analytics 的 Alpha Preview 是否需要独立 project（**建议独立**，理由：Analytics 数据需要隔离 Production 流量污染）

### 给 E-P0-10（监控 / 错误 / 性能）

1. Sentry DSN 必须按环境分（Alpha Preview vs Production）
2. Vercel Analytics 在 Hobby plan 默认启用，无需额外配置；但需验证 Alpha Preview 数据是否会被混入 Production 漏斗

---

## 9. 元数据

| 字段 | 值 |
|---|---|
| 文档版本 | v1 |
| 创建时间 | 2026-08-22 |
| 创建人 | Engineer Agent #2 |
| 文档 ID | `vercel-alias-fix-v1.md` |
| 目标 Gate | Gate A · Internal Alpha |
| 阻塞 Round 2 主线 | ❌ 否 |
| Workspace 路径 | `/Users/lwy/Documents/ChatGPT/看见地球/release-v1/alpha-environment/vercel-alias-fix-v1.md` |
| Obsidian canonical 路径 | `/Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/alpha-environment/vercel-alias-fix-v1.md` |
| Obsidian 同步状态 | ❌ 未同步（DSH session sandbox 拒绝写入 Obsidian canonical 路径） |

---

**End of Document**
