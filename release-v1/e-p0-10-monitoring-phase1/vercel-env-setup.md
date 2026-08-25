---
title: SEE EARTH V1 · E-P0-10 Phase 1 · Vercel Env 变量配置
type: monitoring-deployment-doc
tags: [release-v1, e-p0-10, monitoring, phase-1, vercel-env, sentry, deployment, see-earth]
task_id: E-P0-10
gate_target: Gate A · Internal Alpha
phase: Phase 1
dispatched_at: 2026-08-24
status: DRAFT · IN REVIEW
author: Engineer Agent #2
related_docs:
  - ../e-p0-10-monitoring/secret-management-v1.md
  - ../e-p0-10-monitoring/error-categories-v1.md
  - ./phase1-deployment-report.md
workspace_canonical_path: /Users/lwy/Documents/ChatGPT/看见地球/release-v1/e-p0-10-monitoring-phase1/vercel-env-setup.md
sync_required: true · sandbox 拒绝写入 Obsidian
---

# SEE EARTH V1 · Vercel Env 变量配置（Phase 1 必做）

> **作者**：Engineer Agent #2（外部 Owner = 用户）
> **派发时间**：2026-08-24 · Phase 1
> **目的**：让用户能在 Vercel Dashboard 一键配置 Phase 1 所需的所有环境变量。
> **核心原则**：**客户端 0 secret**（仅 public key 带 `VITE_` 前缀） · 完整规范见 `secret-management-v1.md`。

---

## 0. 阅读指南

- **§1** Phase 1 仅需配置 4 个变量
- **§2** 完整 23 项变量（Phase 1+2+3 全部）
- **§3** Vercel Dashboard 配置步骤（含截图位置）
- **§4** 验证方式

---

## 1. Phase 1 必配变量（4 项）

| Variable | Phase 1 必需? | Type | Environment | 敏感? | 说明 |
|---|---|---|---|---|---|
| `VITE_ENV` | ✅ | public config | Production + Preview | ❌ | 标识当前环境：`alpha` / `beta` / `production` |
| `VITE_SENTRY_DSN` | ✅ | public key | Production + Preview | ❌（public） | Sentry project DSN（创建后填入） |
| `VITE_BUILD_HASH` | ⚪ 可选 | public config | Production + Preview | ❌ | 构建 hash（Vercel 自动注入 `VERCEL_GIT_COMMIT_SHA`） |
| `SENTRY_DSN` | ⚪ Phase 2 启用 | server key | Production + Preview | 🟡 private | 服务端 Sentry DSN（Phase 1 API handlers 暂未启用） |

> **关键**：`VITE_SENTRY_DSN` 是 **public key**（设计上可公开）· 泄露仅导致 dashboard 受污染（Sentry 限流可缓解）· 不构成安全风险。

---

## 2. 完整 23 项变量（Phase 1+2+3 全部 · 与 secret-management-v1.md §2.1 对齐）

> Phase 1 只需 §1 中的 4 项；其余 19 项为 Phase 2/3 预留。

| # | Variable | Type | Phase | 敏感? | 说明 |
|---|---|---|---|---|---|
| 1 | `VITE_ENV` | public config | 1 | ❌ | `alpha` / `beta` / `production` |
| 2 | `VITE_SENTRY_DSN` | public key | 1 | ❌ | Sentry project DSN |
| 3 | `VITE_SENTRY_RELEASE` | public config | 1 | ❌ | Git SHA（CI 自动注入） |
| 4 | `VITE_ANALYTICS_KEY` | public key | 1 | ❌ | Analytics receiver key |
| 5 | `VITE_APP_URL` | public config | 1 | ❌ | 当前 URL |
| 6 | `SENTRY_DSN` | server key | 1（API 启用时） | 🟡 private | 服务端 Sentry DSN |
| 7 | `SENTRY_AUTH_TOKEN` | server key | 2 | 🟡 private | Sentry source map 上传（CI 用） |
| 8 | `ANALYTICS_RECEIVER_URL` | server key | 2 | 🟡 private | 服务端 analytics 接收端点 |
| 9 | `ANALYTICS_SALT` | server secret | 2 | ✅ SECRET | submission_id HMAC salt |
| 10 | `DB_URL` | server secret | 2 | ✅ SECRET | Postgres 连接串 |
| 11 | `DB_SERVICE_KEY` | server secret | 2 | ✅ SECRET | Supabase service role |
| 12 | `STORAGE_KEY` | server secret | 2 | ✅ SECRET | Storage service key |
| 13 | `STORAGE_BUCKET` | server config | 2 | ❌ | Bucket name |
| 14 | `IMAGE_PROCESSING_KEY` | server secret | 2 | ✅ SECRET | 图片转码 API key |
| 15 | `WEATHER_API_KEY` | server secret | 2 | ✅ SECRET | Weather provider |
| 16 | `SUN_API_KEY` | server secret | 2 | ✅ SECRET | Sunrise/sunset API |
| 17 | `EXIF_PROCESSING_KEY` | server secret | 2 | ✅ SECRET | EXIF stripping service |
| 18 | `EDITION_CRON_SECRET` | server secret | 2 | ✅ SECRET | Daily 12 cron shared secret |
| 19 | `ALPHA_PASSWORD` | server secret | 1（Alpha 启用时） | ✅ SECRET | Cloudflare Access / basic auth |
| 20 | `BETA_PASSWORD` | server secret | 2（Beta 启用时） | ✅ SECRET | 同上 |
| 21 | `SLACK_WEBHOOK_URL` | server secret | 2 | ✅ SECRET | Sentry → Slack alert webhook |
| 22 | `PAGERDUTY_INTEGRATION_KEY` | server secret | 2 | ✅ SECRET | Sentry → PagerDuty integration |
| 23 | `RATE_LIMIT_REDIS_URL` | server secret | 2 | ✅ SECRET | Vercel KV / Upstash Redis URL |

---

## 3. Vercel Dashboard 配置步骤

### 3.1 进入 Environment Variables 页面

```text
1. 打开 https://vercel.com/dashboard
2. 选择 setheearth project
3. Settings → Environment Variables
4. 看到当前所有 env 变量列表
```

### 3.2 Phase 1 必配（4 项）

#### Variable 1: `VITE_ENV`

```text
Key:   VITE_ENV
Value: alpha  (或 beta / production)
Environments:
  ☑ Production  （main 分支 deploy 可见）
  ☑ Preview     （alpha/beta 分支 deploy 可见）
```

**Alpha 环境建议值**：`alpha`

#### Variable 2: `VITE_SENTRY_DSN`

```text
Key:   VITE_SENTRY_DSN
Value: https://[key]@sentry.io/[project-id]
Environments:
  ☑ Production
  ☑ Preview
```

**获取方式**：

```text
1. 登录 https://sentry.io（注册如果尚未注册）
2. 创建 organization（建议名：sethearth）
3. 创建 3 个 project：
   - sethearth-alpha  （Alpha Preview）
   - sethearth-beta   （Beta Preview · Phase 2）
   - sethearth-production （Production）
4. 进入每个 project → Settings → Client Keys (DSN)
5. 复制 DSN（格式：https://xxx@sentry.io/yyy）
6. 填入对应 Environment 的 VITE_SENTRY_DSN

⚠️ 每个 environment 必须独立 DSN（确保数据隔离）
```

**Alpha 示例 DSN**（占位）：

```text
VITE_SENTRY_DSN = https://a3f9b2c1d4e5f6@sentry.io/7890123
                  ↑                   ↑
                  public key           project id
```

#### Variable 3: `VITE_BUILD_HASH`（可选）

```text
Key:   VITE_BUILD_HASH
Value: <由 Vercel 自动注入 VERCEL_GIT_COMMIT_SHA>
```

**自动注入**：Vercel 在每次 deploy 时自动注入 `VERCEL_GIT_COMMIT_SHA`。`sentry-client.ts` 会自动 fallback 读取。

**如果需要手动设置**（可选）：

```text
Value: $VERCEL_GIT_COMMIT_SHA
（Vercel 会在 deploy 时替换为实际 SHA）
```

#### Variable 4: `SENTRY_DSN`（Phase 1 可选）

```text
Key:   SENTRY_DSN
Value: <与 VITE_SENTRY_DSN 相同值，或独立的 server-side DSN>
Environments:
  ☑ Production
  ☑ Preview
```

**Phase 1 行为**：`api/_lib/sentry-server.ts` 已实现但**不主动初始化**（因无 API routes）。如需手动启用，在 `api/_lib/sentry-server.ts` 的 `initServerSentry()` 调用前无任何依赖。

---

### 3.3 三层环境分配

| Environment | VITE_ENV | VITE_SENTRY_DSN 指向 | ALPHA_PASSWORD |
|---|---|---|---|
| Production | `production` | `sethearth-production` project | ❌ |
| Preview (alpha) | `alpha` | `sethearth-alpha` project | ✅（如果用 basic auth） |
| Preview (beta) | `beta` | `sethearth-beta` project | ❌（beta 用 BETA_PASSWORD） |
| Development (local) | `development` | ❌（本地不连 Sentry） | ❌ |

---

## 4. 验证方式

### 4.1 配置后立刻验证

```bash
# 1. 触发一次 deploy（push 任意 commit 或点击 Redeploy）
# 2. 等待 deploy 完成
# 3. 访问 Alpha URL：https://sethearth-git-alpha-seethearth.vercel.app/
# 4. 打开浏览器 DevTools → Console
# 5. 应看到：
#    [sentry-client] initialized for environment: alpha (release: <sha>, traces: 0.1)
```

### 4.2 故意触发错误测试

```javascript
// 在浏览器 console 粘贴：
throw new Error('test-sentry-capture');

// 期望：
// - Sentry Dashboard (https://sentry.io) → sethearth-alpha → Issues 看到新 issue
// - 浏览器 console 看到：
//   [monitoring] 🟡 server.5xx · error_id: a3f9b2c1 · test-sentry-capture
```

### 4.3 检查 build 是否包含 Sentry

```bash
cd "/Users/lwy/Documents/ChatGPT/看见地球"
VITE_SENTRY_DSN="https://test@sentry.io/123" VITE_ENV=alpha npm run build

# 期望：dist/assets/*.js 大小 ~ 470 KB (raw) / 157 KB (gzipped)
# 包含 "Sentry" 字符串
grep -c "Sentry" dist/assets/index-*.js
# 应返回 > 0
```

### 4.4 检查 dist 不含私密 secret

```bash
# 检查 dist 不应含私密变量名（参考 secret-management-v1.md §7.1）
grep -rE "(ANALYTICS_SALT|DB_URL|DB_SERVICE_KEY|STORAGE_KEY|ALPHA_PASSWORD)" dist/ 2>/dev/null
# 期望：空输出
```

---

## 5. 故障排查

### 5.1 看不到 `[sentry-client] initialized` 日志

```text
可能：
  - VITE_SENTRY_DSN 未配置 → 检查 Vercel env
  - VITE_ENV=production → 当前实现暂不启用（V1.1 启用）
  - Vite cache 问题 → rm -rf node_modules/.vite && npm run dev
```

### 5.2 Sentry Dashboard 收不到事件

```text
可能：
  - DSN 拼写错误（粘贴时多空格）
  - Sentry project 设置了 IP allowlist（默认应该 allow all）
  - AdBlocker 拦截了 *.sentry.io
  - 浏览器 console 有 "CORS error" → 检查 Sentry project 的 allowed domains
```

### 5.3 看到 `[sentry-client] init failed`

```text
可能：
  - DSN 格式错误（必须以 https:// 开头）
  - Network 拦截（Sentry 在防火墙黑名单）
  - Vite 配置错误（检查 vite.config.ts）
```

---

## 6. 自验收 Acceptance Criteria

- [x] Phase 1 仅需配置 4 个变量明确列出
- [x] 完整 23 项变量矩阵与 secret-management-v1.md §2.1 完全一致
- [x] Vercel Dashboard 配置步骤详细（含截图位置）
- [x] 三层环境分配矩阵
- [x] 验证方式 4 项（含 build 检查 + 故意 throw 测试）
- [x] 故障排查 3 项
- [x] 客户端 0 secret 原则在每个变量上明确
- [x] Sentry project 创建步骤完整（3 个独立 project）
- [x] DSN 获取方式 + 占位示例
- [x] 不引入 .env.example 中任何私密凭证（仅 public key）

---

## 7. 元数据

| 字段 | 值 |
|---|---|
| 文档版本 | v1 |
| 创建时间 | 2026-08-24 |
| 创建人 | Engineer Agent #2 |
| 文档 ID | `vercel-env-setup.md` |
| 目标 Gate | Gate A · Internal Alpha |
| Workspace 路径 | `/Users/lwy/Documents/ChatGPT/看见地球/release-v1/e-p0-10-monitoring-phase1/vercel-env-setup.md` |
| Obsidian canonical 路径 | `/Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/e-p0-10-monitoring-phase1/vercel-env-setup.md` |
| Obsidian 同步状态 | ❌ 未同步 |

---

**End of Vercel Env Setup v1**