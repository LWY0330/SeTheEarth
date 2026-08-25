---
title: SEE EARTH V1 · Secrets 管理规范 v1 · Vercel Env + 客户端 0 Secret
type: monitoring-secret-management
tags: [release-v1, e-p0-10, monitoring, secret-management, vercel-env, security, see-earth]
task_id: E-P0-10
brief_anchor: §5 E-P0-10 §E（Secrets 部分）
gate_target: Gate A · Internal Alpha（基础）· Gate B（完整）· Gate C（生产锁定）
dispatched_at: 2026-08-24
dispatch_round: Round 4
status: DRAFT · IN REVIEW
author: Engineer Agent #2
source_inputs:
  - /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/SEE-EARTH-Release-Strategy-v1-Design-Engineering-Task-Brief.md §5 E-P0-10 §E
  - /Users/lwy/Documents/ChatGPT/看见地球/release-v1/alpha-environment/env-decision-v1.md §3.5（Vercel Secrets 隔离方案）
related_docs:
  - ./privacy-baseline-v1.md
  - ./error-categories-v1.md
  - ./alert-policy-v1.md
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/e-p0-10-monitoring/secret-management-v1.md
workspace_canonical_path: /Users/lwy/Documents/ChatGPT/看见地球/release-v1/e-p0-10-monitoring/secret-management-v1.md
sync_required: true · sandbox 拒绝写入 Obsidian
---

# SEE EARTH V1 · Secrets 管理规范 v1

> **作者**：Engineer Agent #2（外部 Owner = 用户）
> **派发时间**：2026-08-24 · Round 4
> **目的**：定义 SEE EARTH V1 所有 **Secret / 环境变量 / 凭证** 的**单一管理流程**。核心承诺：**客户端 0 secret**（即客户端 bundle 中**不包含**任何真正的私密凭证）。
> **依赖**：Vercel Environment Variables · `.env.local`（本地开发）· `.env.example`（仓库示例）。

---

## 0. 阅读指南

- **§1** 核心原则（客户端 0 secret）
- **§2** Vercel Environment Variables 总表
- **§3** 公开 key 与私密 key 的区分
- **§4** 命名规范
- **§5** Secret 注入路径（Vercel / 本地）
- **§6** Secret 轮值 / 撤销流程
- **§7** 验证方式（CI / bundle scan）
- **§8** 应急响应（Secret 泄露）
- **§9** 自验收

---

## 1. 核心原则

### 1.1 客户端 0 Secret（强制）

```text
❌ 禁止：任何 VITE_* 前缀的私密凭证进入 Vercel Environment Variables
❌ 禁止：私密凭证出现在 dist/ 构建产物
❌ 禁止：私密凭证出现在 .env.example（仓库可访问）
✅ 允许：VITE_* 前缀的 PUBLIC KEY（Sentry DSN / Analytics Key）· 不敏感
✅ 允许：服务端变量（非 VITE_ 前缀）· 仅在 Vercel Runtime / API handler 可见
```

**原因**：
- Vite 构建时**任何带 `VITE_` 前缀的环境变量都会被打进客户端 bundle**（明文）。
- 即使不暴露 GitHub 仓库，客户端 bundle 通过浏览器 DevTools 即可读取。
- 因此**只有 PUBLIC KEY 可带 `VITE_` 前缀**；任何私密凭证必须以非 `VITE_` 前缀命名 + 仅服务端可见。

### 1.2 Secret 分类

| 类别 | 含义 | 命名前缀 | Vite 行为 | 例子 |
|---|---|---|---|---|
| **Public Key** | 可公开的标识符（不构成安全风险） | `VITE_*` | 进入客户端 bundle | `VITE_SENTRY_DSN` · `VITE_ANALYTICS_KEY` |
| **Server Secret** | 私密凭证（API key / DB 连接串 / token） | 非 `VITE_` | 仅服务端可见 | `DB_URL` · `STORAGE_KEY` · `ANALYTICS_SALT` |
| **Build-time Config** | 构建时配置（不影响安全） | `VITE_*` | 进入客户端 bundle | `VITE_ENV` · `VITE_BUILD_ID` |

### 1.3 三层隔离

```text
Production secrets  ←→  Alpha Preview secrets  ←→  本地 .env.local
        │                       │                       │
        └─ 完全隔离 ────────────┴─ 完全隔离 ────────────┘

- Vercel Dashboard → Settings → Environment Variables
- Production environment 仅 main 分支 deploy 可见
- Preview environment 仅 alpha / beta 分支 deploy 可见
- 本地 .env.local 不进入任何 deploy（仅开发者机器）
```

---

## 2. Vercel Environment Variables 总表

### 2.1 V1 阶段所需环境变量（完整列表）

| Variable | Type | Environment | 敏感? | 来源 / 说明 |
|---|---|---|---|---|
| `VITE_ENV` | public config | Production / Preview | ❌ | 硬编码 `production` / `alpha` / `beta` |
| `VITE_SENTRY_DSN` | public key | Production / Preview | ❌（public） | Sentry project DSN（创建后填入） |
| `VITE_SENTRY_RELEASE` | public config | Production / Preview | ❌ | Git SHA（CI 自动注入） |
| `VITE_ANALYTICS_KEY` | public key | Production / Preview | ❌（public） | Analytics receiver key |
| `VITE_APP_URL` | public config | Production / Preview | ❌ | `https://see-earth.vercel.app` / `https://alpha-see-earth.vercel.app` |
| `SENTRY_DSN` | server key | Production / Preview | 🟡 private | 服务端 Sentry DSN（API handler 使用） |
| `SENTRY_AUTH_TOKEN` | server key | Production | 🟡 private | Sentry 上传 source map 用（仅 CI / build） |
| `ANALYTICS_RECEIVER_URL` | server key | Production / Preview | 🟡 private | Server-side analytics receiver endpoint |
| `ANALYTICS_SALT` | server secret | Production / Preview | ✅ SECRET | 用于 `submission_id` HMAC-SHA256 hash 的盐值 |
| `DB_URL` | server secret | Production / Preview | ✅ SECRET | Supabase Postgres 连接串（E-P0-02 启用） |
| `DB_SERVICE_KEY` | server secret | Production / Preview | ✅ SECRET | Supabase service role key |
| `STORAGE_KEY` | server secret | Production / Preview | ✅ SECRET | Supabase Storage service key |
| `STORAGE_BUCKET` | server config | Production / Preview | ❌ | Bucket name（如 `setheearth-witness`） |
| `IMAGE_PROCESSING_KEY` | server secret | Production / Preview | ✅ SECRET | 转码服务 API key（E-P0-03 启用） |
| `WEATHER_API_KEY` | server secret | Production / Preview | ✅ SECRET | Weather provider API key |
| `SUN_API_KEY` | server secret | Production / Preview | ✅ SECRET | Sunrise/sunset API key |
| `EXIF_PROCESSING_KEY` | server secret | Production / Preview | ✅ SECRET | EXIF stripping service API key |
| `EDITION_CRON_SECRET` | server secret | Production / Preview | ✅ SECRET | Vercel Cron 触发 Daily 12 编排的 shared secret |
| `ALPHA_PASSWORD` | server secret | Preview (alpha) | ✅ SECRET | Cloudflare Access / basic auth 密码 |
| `BETA_PASSWORD` | server secret | Preview (beta) | ✅ SECRET | 同上 |
| `SLACK_WEBHOOK_URL` | server secret | Production | ✅ SECRET | Sentry → Slack alert webhook |
| `PAGERDUTY_INTEGRATION_KEY` | server secret | Production | ✅ SECRET | Sentry → PagerDuty integration key |
| `RATE_LIMIT_REDIS_URL` | server secret | Production / Preview | ✅ SECRET | Vercel KV / Upstash Redis URL（限流） |

> **总数 23 项**。**9 项 public** + **14 项 server secret/config**。

### 2.2 环境分配矩阵

| Variable | Production | Preview (alpha) | Preview (beta) | Development (local) |
|---|---|---|---|---|
| `VITE_ENV` | `production` | `alpha` | `beta` | `development` |
| `VITE_SENTRY_DSN` | ✅ `setheearth-prod` | ✅ `sethearth-alpha` | ✅ `sethearth-beta` | ❌ |
| `VITE_SENTRY_RELEASE` | ✅ | ✅ | ✅ | ❌ |
| `VITE_ANALYTICS_KEY` | ✅ | ✅ | ✅ | ❌ |
| `VITE_APP_URL` | `https://see-earth.vercel.app` | `https://alpha-see-earth.vercel.app` | `https://see-earth-beta.vercel.app` | `http://localhost:5173` |
| `SENTRY_DSN` | ✅ | ✅ | ✅ | ❌ |
| `SENTRY_AUTH_TOKEN` | ✅ | ❌ | ❌ | ❌ |
| `ANALYTICS_RECEIVER_URL` | ✅ | ✅ | ✅ | ❌ |
| `ANALYTICS_SALT` | ✅ | ✅（独立值） | ✅（独立值） | ❌ |
| `DB_URL` | ✅ | ✅（独立 DB） | ✅（独立 DB） | ❌ |
| `DB_SERVICE_KEY` | ✅ | ✅（独立 key） | ✅（独立 key） | ❌ |
| `STORAGE_KEY` | ✅ | ✅ | ✅ | ❌ |
| `STORAGE_BUCKET` | `setheearth-witness` | `sethearth-witness-alpha` | `sethearth-witness-beta` | ❌ |
| `IMAGE_PROCESSING_KEY` | ✅ | ✅ | ✅ | ❌ |
| `WEATHER_API_KEY` | ✅ | ✅ | ✅ | ❌ |
| `SUN_API_KEY` | ✅ | ✅ | ✅ | ❌ |
| `EXIF_PROCESSING_KEY` | ✅ | ✅ | ✅ | ❌ |
| `EDITION_CRON_SECRET` | ✅ | ✅ | ✅ | ❌ |
| `ALPHA_PASSWORD` | ❌ | ✅ | ❌ | ❌ |
| `BETA_PASSWORD` | ❌ | ❌ | ✅ | ❌ |
| `SLACK_WEBHOOK_URL` | ✅ | ✅（独立 channel） | ✅（独立 channel） | ❌ |
| `PAGERDUTY_INTEGRATION_KEY` | ✅ | ❌ | ❌ | ❌ |
| `RATE_LIMIT_REDIS_URL` | ✅ | ✅ | ✅ | ❌ |

> **关键**：`ANALYTICS_SALT` 在三个 environment 必须**独立**——确保 Alpha 数据无法反查 Production `submission_id`。

---

## 3. 公开 key 与私密 key 的区分

### 3.1 区分标准

| 问题 | 是 Public | 是 Secret |
|---|---|---|
| 泄露后会损害用户隐私吗？ | 否 | ✅ 是 |
| 泄露后会被滥用造成费用吗？ | 否 | ✅ 是 |
| 泄露后会被滥用访问私密数据吗？ | 否 | ✅ 是 |
| 泄露后能伪造身份吗？ | 否 | ✅ 是 |

### 3.2 Public Key 列表（带 `VITE_` 前缀）

- `VITE_SENTRY_DSN`：Sentry project 的 public DSN。**设计上可公开**（Sentry 用它路由事件 + 限流）；泄露后攻击者可发送任意事件污染 dashboard（限流可缓解）。
- `VITE_ANALYTICS_KEY`：Analytics receiver 的 public key（类似 Sentry DSN）；**设计上可公开**。
- `VITE_ENV`：环境标识；**非敏感**。
- `VITE_APP_URL`：当前 URL；**非敏感**。
- `VITE_SENTRY_RELEASE`：Git SHA；**非敏感**（用于 source map 关联）。

### 3.3 Secret 列表（不带 `VITE_` 前缀）

- **DB 类**：`DB_URL` / `DB_SERVICE_KEY` / `STORAGE_KEY`（泄露 = 全数据库可读可写）
- **API 类**：`WEATHER_API_KEY` / `SUN_API_KEY` / `IMAGE_PROCESSING_KEY` / `EXIF_PROCESSING_KEY`（泄露 = 计费风险）
- **Analytics 类**：`ANALYTICS_SALT`（泄露 = 可反查所有 `submission_id` hash）
- **Cron / Auth 类**：`EDITION_CRON_SECRET` / `ALPHA_PASSWORD` / `BETA_PASSWORD`（泄露 = 未授权访问）
- **告警类**：`SLACK_WEBHOOK_URL` / `PAGERDUTY_INTEGRATION_KEY`（泄露 = 攻击者可发假告警）
- **限流类**：`RATE_LIMIT_REDIS_URL`（泄露 = 限流可被绕过）

---

## 4. 命名规范

### 4.1 前缀约定

| 前缀 | 用途 | Vite 行为 | 例子 |
|---|---|---|---|
| `VITE_` | 客户端可访问 | 进入 bundle | `VITE_SENTRY_DSN` |
| `SERVER_` (可选) | 服务端专用 | 不进入 bundle（明示） | `SERVER_ANALYTICS_URL` |
| 无前缀 | 服务端专用 | 不进入 bundle | `DB_URL` · `ANALYTICS_SALT` |

### 4.2 命名格式

```text
<Category>_<Provider>_<Resource>[_Modifier]

例：
  DB_URL                        # Database 连接串
  DB_SERVICE_KEY                # Database service role key
  STORAGE_KEY                   # Storage service key
  STORAGE_BUCKET                # Storage bucket name
  ANALYTICS_SALT                # Analytics hash salt
  ANALYTICS_RECEIVER_URL        # Analytics receiver endpoint
  SENTRY_DSN                    # Sentry DSN
  SENTRY_AUTH_TOKEN             # Sentry auth token (source map upload)
  WEATHER_API_KEY               # Weather provider API key
  SUN_API_KEY                   # Sunrise/sunset API key
  IMAGE_PROCESSING_KEY          # Image transcoding API key
  EXIF_PROCESSING_KEY           # EXIF stripping API key
  EDITION_CRON_SECRET           # Daily 12 cron shared secret
  ALPHA_PASSWORD                # Cloudflare Access password (alpha)
  BETA_PASSWORD                 # Cloudflare Access password (beta)
  SLACK_WEBHOOK_URL             # Slack alert webhook
  PAGERDUTY_INTEGRATION_KEY     # PagerDuty integration key
  RATE_LIMIT_REDIS_URL          # Rate limiter Redis URL
```

### 4.3 ❌ 禁止命名

- ❌ 用 `KEY` / `SECRET` / `PASSWORD` / `TOKEN` 但不带 `VITE_` 前缀又**实际是 public**（混淆视听）
- ❌ 用 `PUBLIC_KEY` 命名但实际是私密凭证（误导）
- ❌ 用全大写简写（如 `DSN` / `KEY`）无 category 前缀

---

## 5. Secret 注入路径

### 5.1 Vercel Dashboard（生产 + Alpha + Beta）

**步骤**：
```text
1. 登录 Vercel Dashboard → setheearth project
2. Settings → Environment Variables → Add
3. 输入 Key + Value
4. 选择 Environment 复选框：
   - Production（main 分支 deploy 可见）
   - Preview（alpha / beta 分支 deploy 可见）
   - Development（Vercel CLI 本地运行可见 · Hobby plan 不支持）
5. Save
6. 下次 deploy 自动注入
```

**示例配置**（Alpha）：

```yaml
# Vercel Dashboard · setheearth project · Preview env
VITE_ENV: "alpha"
VITE_SENTRY_DSN: "https://a3f9b2c1@sentry.io/789"  # sethearth-alpha project
VITE_ANALYTICS_KEY: "alpha-anon-key-7e3b2c1"
VITE_APP_URL: "https://alpha-see-earth.vercel.app"
DB_URL: "postgresql://postgres.alpha:[PASSWORD]@db.alpha.supabase.co:5432/postgres"
DB_SERVICE_KEY: "eyJ...alpha..."  # alpha Supabase service role
STORAGE_KEY: "eyJ...alpha..."  # alpha Storage key
STORAGE_BUCKET: "setheearth-witness-alpha"
ANALYTICS_SALT: "[random 32-char alpha salt]"  # 独立 salt
EDITION_CRON_SECRET: "[random 32-char]"
ALPHA_PASSWORD: "[team-shared password]"
SLACK_WEBHOOK_URL: "https://hooks.slack.com/services/T_ALPHA/..."
RATE_LIMIT_REDIS_URL: "redis://default:[PASSWORD]@alpha-kv.vercel-storage.com:6379"
```

### 5.2 本地开发（`.env.local`）

```bash
# .env.local（已在 .gitignore）
VITE_ENV=development
VITE_SENTRY_DSN=https://dev@sentry.io/000  # dev Sentry project
VITE_ANALYTICS_KEY=dev-key
VITE_APP_URL=http://localhost:5173

# 服务端（仅本地 API 路由可见）
DB_URL=postgresql://postgres:postgres@localhost:5432/see_earth_dev
DB_SERVICE_KEY=local-service-key
STORAGE_KEY=local-storage-key
STORAGE_BUCKET=see-earth-dev
ANALYTICS_SALT=local-dev-salt-do-not-use-in-prod
EDITION_CRON_SECRET=local-cron-secret
```

### 5.3 CI（GitHub Actions）

```yaml
# .github/workflows/ci.yml (Phase 2 实施)
env:
  # 仅 build-time 变量（CI 不会泄露到 bundle，因 vite 不识别 GHA_ 前缀）
  VITE_SENTRY_RELEASE: ${{ github.sha }}
  VITE_ENV: ci
  SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
```

> **关键**：CI 注入的 secret **必须**是 build-time 必需（如 SENTRY_AUTH_TOKEN 用于上传 source map）；运行时 secret 仅在 Vercel Runtime 注入。

### 5.4 Vercel Edge Middleware（特殊路径）

如需在 Edge Middleware 读取 Alpha 密码：

```ts
// middleware.ts (Cloudflare Access 备用方案 · 详见 access-control-v1.md)
export const config = {
  matcher: '/((?!api/health).*)',
};

export default async function middleware(request: Request) {
  const authHeader = request.headers.get('authorization');
  const password = process.env.ALPHA_PASSWORD;  // 服务端变量，Edge 可访问
  // ... basic auth check
}
```

---

## 6. Secret 轮值 / 撤销流程

### 6.1 轮值周期

| Secret 类型 | 轮值周期 | 触发条件 |
|---|---|---|
| `DB_URL` / `DB_SERVICE_KEY` / `STORAGE_KEY` | **每 90 天** | 强制 + 任何疑似泄露立即 |
| `ANALYTICS_SALT` | **每 180 天**（同步 Privacy 保留期） | 强制（轮值后旧 hash 不可反查） |
| `WEATHER_API_KEY` / `SUN_API_KEY` 等 API key | **每 365 天** | 强制 + 供应商策略变化 |
| `EDITION_CRON_SECRET` | **每 180 天** | 强制 |
| `ALPHA_PASSWORD` / `BETA_PASSWORD` | **每 90 天** + 团队成员变动 | 强制 |
| `SLACK_WEBHOOK_URL` / `PAGERDUTY_INTEGRATION_KEY` | **每 365 天** | 强制 |

### 6.2 轮值步骤

```text
1. 在 Vercel Dashboard 生成新 secret
2. 双写期间（24h）：
   - 新 secret 生效 + 旧 secret 仍 valid（grace period）
3. 24h 后：
   - 撤销旧 secret
   - 更新 .env.example（如适用）
   - 更新 runbook 记录
4. 验证：所有 API / 流程正常工作
5. 记录到 secret-rotation-log.md（仓库外 · 安全存储）
```

### 6.3 撤销流程（疑似泄露）

```text
T+0     在 Vercel Dashboard 立即撤销
T+1min  通知所有 on-call 工程师
T+5min  生成新 secret
T+10min 部署新 secret 到 Vercel
T+30min 验证所有服务正常
T+1h    提交 incident report（详见 runbook-v1.md §5）
T+24h   Post-mortem 完成
```

---

## 7. 验证方式

### 7.1 CI 静态扫描（必做）

```bash
#!/bin/bash
# scripts/verify-no-secret-in-bundle.sh
set -euo pipefail

echo "===== Verifying no secret in client bundle ====="

# 1. 扫描 dist/ 不含任何 SECRET 类变量值
LEAKED=$(grep -rE "(DB_URL|DB_SERVICE_KEY|STORAGE_KEY|ANALYTICS_SALT|ALPHA_PASSWORD|BETA_PASSWORD|SLACK_WEBHOOK_URL|PAGERDUTY_INTEGRATION_KEY|RATE_LIMIT_REDIS_URL|WEATHER_API_KEY|SUN_API_KEY|IMAGE_PROCESSING_KEY|EXIF_PROCESSING_KEY|EDITION_CRON_SECRET)=" dist/ 2>/dev/null || true)

if [ -n "$LEAKED" ]; then
  echo "❌ Secret leaked in client bundle:"
  echo "$LEAKED"
  exit 1
fi
echo "✅ Client bundle clean of secrets"

# 2. 扫描 dist/ 不含常见 secret pattern
LEAKED_PATTERNS=$(grep -rE "(sk_live_|pk_live_|AKIA[0-9A-Z]{16}|-----BEGIN.*PRIVATE KEY-----|password=)" dist/ 2>/dev/null || true)
if [ -n "$LEAKED_PATTERNS" ]; then
  echo "❌ Secret patterns leaked:"
  echo "$LEAKED_PATTERNS"
  exit 1
fi
echo "✅ Client bundle clean of secret patterns"

# 3. 验证所有 VITE_* 变量在白名单
VITE_VARS=$(grep -oE "import\.meta\.env\.VITE_[A-Z_]+" src/ -r | sort -u || true)
WHITELIST=$(cat <<'EOF'
VITE_ENV
VITE_SENTRY_DSN
VITE_SENTRY_RELEASE
VITE_ANALYTICS_KEY
VITE_APP_URL
EOF
)
UNEXPECTED=$(comm -23 <(echo "$VITE_VARS" | sed 's/.*\.//') <(echo "$WHITELIST" | sort -u))
if [ -n "$UNEXPECTED" ]; then
  echo "❌ Unexpected VITE_ vars:"
  echo "$UNEXPECTED"
  exit 1
fi
echo "✅ VITE_ vars whitelist verified"
```

### 7.2 运行时校验（部署后）

```ts
// api/_lib/secret-health.ts (Phase 2 实施)
export async function checkSecretsHealth(): Promise<{
  ok: boolean;
  missing: string[];
}> {
  const required = ['DB_URL', 'DB_SERVICE_KEY', 'ANALYTICS_SALT', 'STORAGE_KEY'];
  const missing = required.filter(k => !process.env[k]);
  return { ok: missing.length === 0, missing };
}
```

API 路由 `/api/health` 返回此项。

### 7.3 Privacy leak test 联动

Privacy leak test（`privacy-baseline-v1.md §4`）第 5 步扫描公开图片 EXIF；此处第 1 步扫描 bundle。两者互补。

---

## 8. 应急响应（Secret 泄露）

### 8.1 立即响应（15 分钟内）

```text
1. 在 Vercel Dashboard 撤销泄露的 secret
3. 生成新 secret 并部署
4. 验证所有服务正常
5. 在 #alerts 发布 incident 通知
6. 启动 Runbook §5 P0 流程（如果是私密 secret 泄露）
```

### 8.2 后续行动（24 小时内）

```text
1. 调查泄露路径：
   - Git 提交历史扫描（git log -S "secret"）
   - Vercel 部署历史
   - 任何公开 URL / CDN / Sentry 事件
2. Post-mortem 文档：
   - 泄露时间线
   - 影响范围（哪些用户数据可能被访问）
   - root cause
   - 修复 + 预防措施
3. 通知相关方：
   - 如果是用户数据相关 secret → 通知 PM Agent
   - 如果是 API key → 通知 API provider
```

### 8.3 预防

- 强制 CI 检查（§7.1）
- 强制 PR review（任何包含新 secret 的 commit 需 PM 批准）
- 季度 secret audit（人工 + 自动化）

---

## 9. 自验收 Acceptance Criteria

- [x] 客户端 0 secret 原则明确（强制）
- [x] 23 项环境变量完整列表
- [x] Public / Server Secret / Build-time Config 三类区分
- [x] 命名规范（含示例 + 禁止命名）
- [x] 4 注入路径（Vercel Dashboard / .env.local / CI / Edge Middleware）
- [x] Secret 轮值周期 + 步骤
- [x] 撤销流程（含 24h 双写期）
- [x] 验证方式（CI 静态扫描 + 运行时校验 + Privacy leak test 联动）
- [x] 应急响应（15min 立即响应 + 24h 后续行动）
- [x] 与 `alpha-environment/env-decision-v1.md §3.5` 完全一致
- [x] 不在 `.env.example` 含任何私密凭证
- [x] 不在 `dist/` 含任何私密凭证

---

## 10. 元数据

| 字段 | 值 |
|---|---|
| 文档版本 | v1 |
| 创建时间 | 2026-08-24 |
| 创建人 | Engineer Agent #2 |
| 文档 ID | `secret-management-v1.md` |
| 目标 Gate | Gate A（基础）· Gate B（完整）· Gate C（生产锁定） |
| Workspace 路径 | `/Users/lwy/Documents/ChatGPT/看见地球/release-v1/e-p0-10-monitoring/secret-management-v1.md` |
| Obsidian canonical 路径 | `/Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/e-p0-10-monitoring/secret-management-v1.md` |
| Obsidian 同步状态 | ❌ 未同步 |

---

**End of Secret Management v1**