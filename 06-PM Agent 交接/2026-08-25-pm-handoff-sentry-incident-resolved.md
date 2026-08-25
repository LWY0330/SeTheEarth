---
type: pm-handoff
tags: [pm-handoff, sentry, vercel, vite-env, phase-1, resolved]
created: 2026-08-25
status: 🟡 HANDOFF · 线上已恢复，清理提交待 push
priority: P2 closeout
title: Sentry 环境变量事故已解决 · 清理提交待推送
author: 接管 PM Agent
source_incident: 06-PM Agent 交接/2026-08-25-sentry-env-var-incident-report.md
branch: alpha
local_commit: fe801af
remote_head_at_handoff: 1c7d1a1
---

# PM HANDOFF · Sentry 环境变量事故收尾

> **交接日期**：2026-08-25  
> **线上功能状态**：🟢 Sentry 已初始化并收到浏览器事件  
> **代码收尾状态**：🟡 本地已提交，因网络异常尚未 push  
> **下一位 PM 首要动作**：执行 `git push origin alpha`

---

## 📋 一句话交接

Sentry 故障已定位并修复：`VITE_ENV` 与 `VITE_SENTRY_DSN` 原先配置在错误的 Vercel 项目/作用域，实际部署项目 `seetheearth/setheearth` 没有收到这两项变量。两项变量现已正确配置到 Preview / `alpha`，重新部署后 Sentry 初始化成功并收到测试事件。临时 debug 暴露已在本地 commit `fe801af` 中清理，唯一遗留是把该 commit 推送到 GitHub。

---

## 🎯 当前状态总览

| 项目 | 状态 | 证据 |
|---|---|---|
| Supabase Phase 1 SQL | ✅ 完成 | 12 cities / 18 moments / migrations + seed 已部署 |
| Vercel Preview | ✅ Ready | `alpha` 分支 deployment，17s |
| `VITE_ENV` 注入 | ✅ 完成 | Preview / `alpha`，Console 显示 `alpha` |
| `VITE_SENTRY_DSN` 注入 | ✅ 完成 | Preview / `alpha`，DSN present = true |
| Sentry SDK 初始化 | ✅ 完成 | `[sentry-client] initialized for environment: alpha` |
| Sentry 浏览器事件 | ✅ 完成 | `Sentry alpha verification 2026-08-25` · 1 event |
| 临时 debug 代码清理 | ✅ 本地完成 | commit `fe801af` |
| GitHub push | ⚠️ 待完成 | 本地 `alpha` 比 `origin/alpha` ahead 1 |
| 清理版 Vercel deployment | ⚠️ 待 push 后自动生成 | 需确认 commit `fe801af` Ready |

---

## 🔴 事故真实根因

### 已确认 Root Cause

环境变量被配置在错误的 Vercel 项目或作用域。

GitHub deployment metadata 确认实际部署目标为：

```text
Team:    seetheearth
Project: setheearth
Branch:  alpha
```

正确项目的 Environment Variables 页面最初只有：

```text
WEATHER_API_PROVIDER
SUN_PROVIDER
```

其中没有 `VITE_ENV` 或 `VITE_SENTRY_DSN`，所以 Vite build 只能看到 Vercel 系统变量，无法看到用户配置变量。

### 已排除

- Vite 的 `import.meta.env` 读取逻辑没有问题。
- `src/lib/analytics/sentry-client.ts` 的初始化逻辑没有问题。
- Sentry DSN 格式没有问题。
- build cache 不是根因。
- Supabase 与本事故无关。
- Console 中的 `vercel.com/sso-api` / manifest CORS 报错与 Sentry 无关。

---

## ✅ 已实施修复

在正确项目 `seetheearth/setheearth` 中创建：

| Variable | Type | Environment | Branch | Value |
|---|---|---|---|---|
| `VITE_ENV` | Config | Preview | `alpha` | `alpha` |
| `VITE_SENTRY_DSN` | Config | Preview | `alpha` | 已配置；本交接不重复完整 DSN |

随后重新部署 commit `1c7d1a1`：

```text
Status:      Ready
Environment: Preview
Source:      alpha
Duration:    17s
```

---

## 🧪 已完成线上验证

### 1. 构建变量验证

Preview Console：

```js
__VITE_DEBUG__.VITE_SENTRY_DSN?.length > 0
// true
```

同时 debug 日志显示：

```text
env: alpha
vercelEnv: preview
```

### 2. Sentry 初始化验证

Console 明确显示：

```text
[sentry-client] initialized for environment: alpha
```

### 3. 浏览器事件验证

执行：

```js
setTimeout(() => {
  throw new Error('Sentry alpha verification 2026-08-25');
}, 0);
```

Sentry Issues 在约 44 秒内收到：

```text
Sentry alpha verification 2026-08-25
Events: 1
Status: Unhandled
```

结论：Sentry 浏览器上报链路已端到端验证通过。

---

## 🧹 已完成的代码清理

本地 commit：

```text
fe801af fix(sentry): close env incident and remove debug exposure
```

该 commit 仅包含：

1. `src/main.tsx`
   - 删除 `window.__VITE_DEBUG__`
   - 删除 `[debug-env]` 日志
   - 删除完整 Vite 环境变量的浏览器暴露
   - 保留无条件 `initSentry()` 调用

2. `06-PM Agent 交接/2026-08-25-sentry-env-var-incident-report.md`
   - 状态改为 `RESOLVED`
   - 写入真实 root cause
   - 写入部署与 Sentry 验证证据
   - 移除完整 DSN
   - 删除过期的 Phase 2 降级建议

---

## ✅ 本地质量门禁

已在 commit 前重新执行：

```text
npm test
303 passed · 0 failed

npm run typecheck
passed

VITE_SENTRY_DSN=<test-public-dsn> VITE_ENV=alpha npm run build
passed · 445 modules transformed

production bundle debug exposure check
passed · 无 __VITE_DEBUG__ / [debug-env]
```

构建产物：

```text
dist/assets/index-D4iWK0-4.js
469.48 kB raw / 157.23 kB gzip
```

未执行 `npm audit`：当前网络无法解析 npm registry；本次未修改依赖。

---

## ⚠️ 唯一遗留：推送本地 commit

### 当前 Git 状态

```text
Branch: alpha
Local HEAD: fe801af
Remote HEAD: 1c7d1a1
State: alpha ahead of origin/alpha by 1 commit
```

两次 push 均因当前网络无法连接 `github.com:443` 超时失败。提交本身已安全保存在本地，不要 amend、rebase 或重做清理。

### 下一位 PM 第一步

在网络恢复后执行：

```bash
cd "/Users/lwy/Documents/ChatGPT/看见地球"
git status --short --branch
git log -1 --oneline
git push origin alpha
```

预期：

```text
fe801af fix(sentry): close env incident and remove debug exposure
```

---

## 🔍 push 后必做验证

### 1. Vercel deployment

确认 Vercel 自动生成的新 deployment：

```text
Source commit: fe801af
Branch: alpha
Environment: Preview
Status: Ready
```

### 2. 调试暴露已移除

打开 Alpha Preview，硬刷新后在 Console 执行：

```js
typeof __VITE_DEBUG__
```

预期：

```js
"undefined"
```

### 3. Sentry 仍保持初始化

Console 仍应显示：

```text
[sentry-client] initialized for environment: alpha
```

不要求再次制造 Sentry issue；已有端到端事件证据。只有在初始化日志缺失时才重新触发测试错误。

---

## 🛡️ 风险与注意事项

### 剩余风险

- 清理 commit 未 push 前，线上 Preview 仍运行 `1c7d1a1`，会把完整 DSN 挂到 `window.__VITE_DEBUG__`。
- Sentry DSN 是客户端公开配置，不是服务器 secret，但仍应移除无必要的 debug 暴露。
- 当前网络存在 DNS/连接异常：`*.vercel.app`、npm registry、GitHub 连接均曾失败。不要把本机连接失败误判为线上部署失败。

### 不要做

- ❌ 不要修改 `src/lib/analytics/sentry-client.ts`。
- ❌ 不要重新配置或删除现有 Vercel Preview 变量。
- ❌ 不要把变量改回 Production。
- ❌ 不要继续研究 build cache；它不是根因。
- ❌ 不要重跑 Supabase migration。
- ❌ 不要使用 `git add .`；仓库有大量用户未跟踪文件。
- ❌ 不要提交或删除与本事故无关的文件。

---

## 📂 关键路径

```text
Repository:
/Users/lwy/Documents/ChatGPT/看见地球

Incident report:
06-PM Agent 交接/2026-08-25-sentry-env-var-incident-report.md

This handoff:
06-PM Agent 交接/2026-08-25-pm-handoff-sentry-incident-resolved.md

Entry point:
src/main.tsx

Sentry client:
src/lib/analytics/sentry-client.ts

Vercel project:
https://vercel.com/seetheearth/setheearth

Vercel env settings:
https://vercel.com/seetheearth/setheearth/settings/environment-variables

Sentry issues:
https://seetheearth.sentry.io/issues/
```

---

## 🎯 下一位 PM 完成标准

以下 5 项全部满足即可正式结束本交接：

- [ ] `fe801af` 已 push 到 `origin/alpha`
- [ ] Vercel 对 `fe801af` 的 Preview deployment 为 Ready
- [ ] `typeof __VITE_DEBUG__` 返回 `"undefined"`
- [ ] Console 仍显示 Sentry initialized for environment: alpha
- [ ] `git status --short --branch` 不再显示 `ahead 1`

---

**End of PM Handoff · Sentry incident resolved · cleanup push pending**

> 不需要重新调查事故。下一位 PM 只需推送 `fe801af`，验证清理版 deployment，然后关闭 Phase 1 Sentry 收尾项。
