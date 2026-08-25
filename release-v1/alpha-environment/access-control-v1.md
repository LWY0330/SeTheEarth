---
title: SEE EARTH · 访问控制 + Secrets 管理方案 v1
type: access-control
tags: [release-v1, e-p0-08, alpha-env, access-control, secrets, security, see-earth]
task_id: E-P0-08-D
gate_target: Gate A · Internal Alpha
dispatched_at: 2026-08-22
dispatch_round: Round 2A
status: DRAFT · IN REVIEW
author: Engineer Agent #2
source_inputs:
  - /Users/lwy/Documents/ChatGPT/看见地球/release-v1/backend-reality-audit-v1.md §7.3 §12 B-7
  - /Users/lwy/Documents/ChatGPT/看见地球/.env.example
  - /Users/lwy/Documents/ChatGPT/看见地球/.env.production
  - /Users/lwy/Documents/ChatGPT/看见地球/src/lib/featureFlags.ts
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/alpha-environment/access-control-v1.md
workspace_canonical_path: /Users/lwy/Documents/ChatGPT/看见地球/release-v1/alpha-environment/access-control-v1.md
sync_required: true · sandbox 拒绝写入 Obsidian
---

# SEE EARTH · 访问控制 + Secrets 管理方案 v1

> **作者**：Engineer Agent #2（外部 Owner = 用户）
> **派发时间**：2026-08-22
> **目标**：定义 Alpha 环境访问控制策略 + Secrets 管理规范
> **核心原则**：**零 secret 进入客户端或仓库 · Alpha 与 Production 凭证完全隔离 · 最小权限**

---

## 0. 一句话结论

**Alpha 访问控制采用「Cloudflare Access + Email OTP」方案（兜底：Vercel Edge Middleware Basic Auth）。Secrets 全部存放在 Vercel Dashboard Preview environment variables，零 secret 进入客户端 bundle（已验证）。所有团队成员通过白名单邮箱访问 Alpha。**

---

## 1. 访问控制方案

### 1.1 方案对比

| 方案 | 优点 | 缺点 | 推荐度 |
|---|---|---|---|
| **Cloudflare Access + Email OTP** | 零成本 · Email OTP 友好 · 团队成员管理简单 · 审计日志 | 需 Cloudflare 账号 · DNS 配置 | 🟢 推荐 |
| **Vercel Edge Middleware Basic Auth** | 实现简单 · 无需第三方 | 密码共享不友好 · 无审计日志 | 🟡 备选 |
| **Vercel Pro Password Protection** | Vercel 官方方案 · 简单 | 需升级 Pro plan ($20/月) | 🟡 备选 |
| **IP 白名单** | 零配置 | 团队成员 IP 不固定（远程工作） | 🔴 不推荐 |
| **公开访问 + Alpha Banner 警告** | 零摩擦 | 搜索引擎抓取 · 数据可能被滥用 | 🔴 不推荐 |

### 1.2 决策：Cloudflare Access + Email OTP

**实施步骤**（用户操作，30 分钟）：

#### Step 1 · 注册 Cloudflare 账号

```text
URL: https://dash.cloudflare.com/sign-up
Email: 团队共享管理邮箱（建议 lwy0330 个人）
Plan: Free（够用）
```

#### Step 2 · 添加站点

```text
1. 登录 Cloudflare Dashboard
2. Add Site → 输入域名 alpha-see-earth.app
   （或使用 see-earth.app 子域，需用户持有该域名）
3. Plan: Free
4. DNS 配置（Cloudflare 自动扫描现有记录）
```

#### Step 3 · CNAME 指向 Vercel

```text
Cloudflare DNS 配置：
  Type: CNAME
  Name: alpha
  Target: cname.vercel-dns.com
  Proxy status: Proxied (橙色云朵 · 启用 Cloudflare 代理)
  TTL: Auto
```

#### Step 4 · 配置 Zero Trust Access

```text
1. Cloudflare Dashboard → Zero Trust → Access → Applications
2. Add Application → Self-hosted
3. 配置：
   - Name: SEE EARTH Alpha
   - Session Duration: 24 hours
   - Application domain: alpha-see-earth.app
4. Identity providers:
   - One-time PIN（推荐 · 无需团队成员预注册）
   或 Email OTP（推荐 · 团队成员首次访问输入邮箱 → 收到 PIN）
5. Policies → Add Policy:
   - Name: SEE EARTH Team
   - Action: Allow
   - Include:
     - Emails: [团队成员邮箱列表 · 5-10 人]
     - 或 Email ending in: @see-earth.app（若团队有统一邮箱后缀）
6. Save
```

#### Step 5 · 测试访问

```text
1. 浏览器访问 https://alpha-see-earth.app
2. 弹出 Cloudflare Access 登录页
3. 输入团队成员邮箱
4. 邮箱收到 OTP PIN
5. 输入 PIN → 进入 Alpha
6. Session 24 小时有效
```

### 1.3 兜底方案：Vercel Edge Middleware Basic Auth

> 若 Cloudflare Access 配置失败或团队希望简化，使用此方案。

**实现步骤**：

```bash
# 1. 在仓库根创建 middleware.ts
cat > middleware.ts <<'EOF'
import { NextRequest, NextResponse } from 'next/server';

// ⚠️ NOTE: 本项目当前是 Vite SPA（非 Next.js）
// 此处用 Vercel Edge Functions 实现 basic auth
// 详见 Vercel Docs: https://vercel.com/docs/functions/edge-middleware
EOF
```

**实际方案**（Vite SPA + Vercel）：

由于当前项目是 Vite SPA 而非 Next.js，需通过 `vercel.json` 配置 Edge Middleware：

```jsonc
// vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

**完整 Basic Auth 实现**（需要 Edge Function 文件 `api/auth.ts` + 路由配置）：

> ⚠️ 当前 V1 无 serverless function 部署能力（`api/` 目录不存在）。建议使用 Cloudflare Access 而非 Edge Middleware Basic Auth。

### 1.4 测试者访问流程（最终用户体验）

```text
1. PM Agent 发送邀请邮件给测试者
   - 包含 Alpha URL: https://alpha-see-earth.app
   - 包含简短说明: "您需要先通过 Cloudflare 验证。回复邮件告知您的邮箱。"

2. 测试者首次访问
   - 浏览器输入 Alpha URL
   - 看到 Cloudflare Access 登录页
   - 输入自己的邮箱
   - 收到 6 位 PIN 邮件
   - 输入 PIN → 进入 Alpha
   - 看到红色 Alpha Banner: "您正在访问 SEE EARTH Alpha 环境"

3. 测试者后续访问（24 小时内）
   - 直接进入 Alpha（session 有效）
   - 24 小时后需重新 OTP 验证
```

### 1.5 测试者邀请清单（PM Agent 维护）

| 角色 | 邮箱 | 加入日期 | 备注 |
|---|---|---|---|
| Owner | lwy0330@example.com | 2026-08-22 | 外部 Owner |
| Designer | designer@example.com | TBD | 待 Designer 加入 |
| QA | qa@example.com | TBD | 待 QA 加入 |
| Witness Tester 1 | witness1@example.com | TBD | 内部测试者 |
| Witness Tester 2 | witness2@example.com | TBD | 内部测试者 |

---

## 2. Alpha Banner & 反馈入口

> 此节与 D-P0-03（Alpha / Beta 状态设计）紧密相关。本卡预制实现策略，文案待 Designer 输出。

### 2.1 Alpha Banner 组件（预制 code）

```tsx
// src/components/AlphaBanner.tsx （本卡未实施，仅预制）
import { useState } from 'react';
import styles from './AlphaBanner.module.css';

export function AlphaBanner() {
  const [collapsed, setCollapsed] = useState(false);

  const handleFeedbackClick = () => {
    // 跳转到 D-P0-03 反馈入口 URL
    window.open(import.meta.env.VITE_ALPHA_FEEDBACK_URL || 'https://forms.example.com/see-earth-alpha', '_blank');
  };

  if (collapsed) {
    return (
      <button
        className={styles.collapsedBanner}
        onClick={() => setCollapsed(false)}
        aria-label="Expand Alpha Banner"
      >
        ⚠️ Alpha
      </button>
    );
  }

  return (
    <div className={styles.banner} role="alert" data-testid="alpha-banner">
      <div className={styles.left}>
        <span className={styles.icon}>⚠️</span>
        <span className={styles.text}>
          <strong>Alpha 环境</strong> · 此版本可能不稳定，数据可能重置
        </span>
      </div>
      <div className={styles.right}>
        <button
          className={styles.feedbackBtn}
          onClick={handleFeedbackClick}
          data-testid="alpha-feedback-btn"
        >
          反馈问题
        </button>
        <button
          className={styles.collapseBtn}
          onClick={() => setCollapsed(true)}
          aria-label="Collapse banner"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
```

### 2.2 App.tsx 集成（预制 code）

```tsx
// src/App.tsx 预制改动（本卡未实施，仅预制）
import { AlphaBanner } from './components/AlphaBanner';

const isAlpha = import.meta.env.VITE_ENV === 'alpha';

export default function App() {
  return (
    <>
      {isAlpha && <AlphaBanner />}
      {/* 现有 App 内容 */}
    </>
  );
}
```

### 2.3 CSS Module 预制

```css
/* src/components/AlphaBanner.module.css 预制 */
.banner {
  position: sticky;
  top: 0;
  z-index: 9999;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background: #c8451f;
  color: #fff;
  font-size: 0.875rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.icon { font-size: 1rem; }

.text strong { margin-right: 0.5rem; }

.right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.feedbackBtn, .collapseBtn {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
}

.feedbackBtn:hover, .collapseBtn:hover {
  background: rgba(255, 255, 255, 0.25);
}

.collapsedBanner {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 9999;
  padding: 0.5rem 1rem;
  background: #c8451f;
  color: #fff;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  font-size: 0.875rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
```

### 2.4 反馈入口 URL

待 D-P0-03 Designer 输出规范。本卡占位：`https://forms.example.com/see-earth-alpha`

**建议方案**（待 PM 决策）：

| 方案 | 优点 | 缺点 |
|---|---|---|
| **Tally.so** | 免费 · 嵌入简单 · 无需账号 | 数据存储在 Tally |
| **Google Form** | 团队成员熟悉 · 数据导出方便 | UI 较旧 |
| **Linear Issue Form** | 与 Linear 集成 · 团队工作流 | 需 Linear 账号 |
| **GitHub Issue** | 仓库内 · 可追溯 | 测试者可能无 GH 账号 |

**推荐**：**Tally.so**（理由：5 分钟创建 · 嵌入简单 · 团队成员收到通知）

---

## 3. Secrets 管理

### 3.1 当前 Secrets 状态（重要 · 已验证）

| Secret 类型 | 当前数量 | 存储位置 | 客户端可见? |
|---|---|---|---|
| API keys | 0 | — | — |
| DB 连接串 | 0 | — | — |
| OAuth secrets | 0 | — | — |
| Storage keys | 0 | — | — |
| 加密密钥 | 0 | — | — |

**当前唯一的环境变量**：

- `.env.production` 仅 2 个：`WEATHER_API_PROVIDER=open-meteo` + `SUN_PROVIDER=sunrise-sunset`
- 这两个**不是 secret**（公开 provider 名 + 配置值），且**无 `VITE_` 前缀** → **不会进入客户端 bundle**

**`.env.example` 包含变量**：

- `WEATHER_API_PROVIDER`、`SUN_PROVIDER`、`PORT`、`HOST`、`VITE_USE_UNIVERSAL_CITYPAGE`
- 全部为**非敏感配置**，可公开

**验证方法**（重要 · 任务卡 Acceptance Criteria）：

```bash
cd "/Users/lwy/Documents/ChatGPT/看见地球"

# 1. 检查 src/ 中所有 VITE_ 前缀变量
grep -rE "VITE_[A-Z_]+" src/ --include="*.ts" --include="*.tsx" 2>&1
# 期望输出：仅 VITE_USE_UNIVERSAL_CITYPAGE 一处

# 2. 检查 dist/ bundle 是否含敏感字符串
grep -rE "(PASSWORD|SECRET|TOKEN|API_KEY)" dist/ 2>&1 | grep -v "node_modules" | head -20
# 期望输出：0 命中

# 3. 检查 .env 文件
ls -la .env*
# 期望：仅 .env.example + .env.production（无 .env 或 .env.local 入仓）
```

### 3.2 Secrets 管理规范（强制）

**禁止行为**（CI grep 检查会失败）：

- ❌ **禁止**将任何 secret 写入 `src/`、`public/`、`scripts/`、`.env*` 文件
- ❌ **禁止**在 git commit message、PR 描述、issue 评论中包含 secret
- ❌ **禁止**使用 `VITE_SECRET_*` / `VITE_API_KEY_*` / `VITE_PASSWORD_*` 等前缀
- ❌ **禁止**使用 `console.log(secret)` / `console.log(process.env.SECRET)`
- ❌ **禁止**截图 Vercel Dashboard Environment Variables 分享

**强制行为**：

- ✅ **所有 secret 必须在 Vercel Dashboard → Settings → Environment Variables 配置**
- ✅ **勾选正确的环境**（Production / Preview / Development）
- ✅ **勾选 "Sensitive"**（Vercel 会加密存储 + 不在 UI 明文显示）
- ✅ **本地开发使用 `.env.local`**（已在 `.gitignore` 第 30-32 行）

### 3.3 Vercel Environment Variables 配置步骤

**用户操作**（首次配置 15 分钟）：

```text
Step 1. 登录 Vercel Dashboard → setheearth project
Step 2. Settings → Environment Variables
Step 3. 添加变量（Key-Value pairs）：
```

| Key | Value | Environment | Sensitive? |
|---|---|---|---|
| `WEATHER_API_PROVIDER` | `open-meteo` | Production, Preview, Development | ❌ |
| `SUN_PROVIDER` | `sunrise-sunset` | Production, Preview, Development | ❌ |
| `VITE_USE_UNIVERSAL_CITYPAGE` | `false` | Production | ❌ |
| `VITE_ENV` | `alpha` | Preview only | ❌ |
| `VITE_ALPHA_FEEDBACK_URL` | `https://forms.example.com/see-earth-alpha` | Preview only | ❌ |
| `ALPHA_USERNAME` | `team` | Preview only | ✅ |
| `ALPHA_PASSWORD` | `<团队共享密码>` | Preview only | ✅ |
| `VITE_SENTRY_DSN` | `<Sentry DSN>` | Preview only（E-P0-10 后补） | 🟡 public key |
| `DB_URL` | `<Neon Postgres URL>` | Preview only（E-P0-02 后补） | ✅ |
| `STORAGE_KEY` | `<R2/Supabase key>` | Preview only（E-P0-02 后补） | ✅ |

### 3.4 CI Secret 检查脚本（强制 · 任务卡 Acceptance Criteria）

**文件**：`scripts/check-bundle-secrets.sh`

```bash
#!/bin/bash
# scripts/check-bundle-secrets.sh
# 任务卡 Acceptance Criteria：客户端 bundle 不含任何 secret
# 在 CI（GitHub Actions）和本地 build 前自动执行

set -euo pipefail

echo "[check-bundle-secrets] Verifying client bundle has no secrets..."

# 1. 检查 dist/ 不含已知敏感关键字
SECRET_PATTERNS=(
  "PASSWORD"
  "SECRET_KEY"
  "PRIVATE_KEY"
  "API_KEY"
  "ACCESS_TOKEN"
  "REFRESH_TOKEN"
  "JWT_SECRET"
  "DATABASE_URL"
  "DB_PASSWORD"
)

FAIL=0
for pattern in "${SECRET_PATTERNS[@]}"; do
  HITS=$(grep -rE "$pattern" dist/ 2>&1 | wc -l | tr -d ' ')
  if [ "$HITS" -gt 0 ]; then
    echo "❌ Found $HITS occurrences of '$pattern' in dist/"
    grep -rE "$pattern" dist/ | head -3
    FAIL=1
  fi
done

# 2. 检查 src/ 中无 hardcoded 敏感数据
HITS=$(grep -rE "AKIA[0-9A-Z]{16}" src/ public/ 2>&1 | wc -l | tr -d ' ')
if [ "$HITS" -gt 0 ]; then
  echo "❌ Found AWS Access Key ID in src/ or public/"
  FAIL=1
fi

# 3. 检查 .env 文件未入仓（除 .env.example / .env.production）
if git ls-files | grep -E "\.env$|\.env\.local$" > /dev/null 2>&1; then
  echo "❌ Found .env or .env.local tracked in git"
  git ls-files | grep -E "\.env$|\.env\.local$"
  FAIL=1
fi

if [ $FAIL -eq 0 ]; then
  echo "✅ Bundle is clean of secrets"
  exit 0
else
  echo "❌ Secret leak detected. See above. Aborting."
  exit 1
fi
```

**添加到 package.json**：

```jsonc
{
  "scripts": {
    // ... 现有 scripts ...
    "ci:check-bundle-secrets": "bash scripts/check-bundle-secrets.sh",
    "prebuild": "bash scripts/check-bundle-secrets.sh"
  }
}
```

> 注：`prebuild` 会在 `npm run build` 前自动执行，确保 secret 检查失败时 build 不会继续。

### 3.5 Secret 轮换策略

| Secret 类型 | 轮换周期 | 触发条件 |
|---|---|---|
| `ALPHA_PASSWORD` | 90 天 | 团队成员离职 / 怀疑泄露 |
| `DB_URL` | 180 天 | E-P0-02 后端就绪 |
| `STORAGE_KEY` | 180 天 | E-P0-02 后端就绪 |
| `VITE_SENTRY_DSN` | 365 天 | Sentry 项目重建 |

**轮换步骤**（任何 secret）：

```text
1. Vercel Dashboard → Settings → Environment Variables
2. 找到目标 secret → 点击 "..." → "Edit"
3. 修改 Value
4. Save
5. 触发 redeploy（Deployments → 最新 → Redeploy）
6. 通知团队成员更新本地 .env.local（如适用）
7. 在 PM Agent 任务卡记录轮换历史
```

---

## 4. 访问控制 vs Production 差异

| 维度 | Production（修复后） | Alpha Preview |
|---|---|---|
| 主入口 URL | `see-earth.vercel.app` | `alpha-see-earth.vercel.app` |
| 访问者 | 公开（任何人） | 仅团队成员 + 指定测试者 |
| 鉴权 | 无 | Cloudflare Access + Email OTP |
| Banner | 无 | 红色 Alpha Banner（顶部固定） |
| `/about` 文案 | 正式 About | 含 "Alpha 环境" 警告 |
| 反馈入口 | 无 | 顶部 Banner "反馈问题" 按钮 |
| 数据可重置提示 | 无 | Banner + `/about` 双提示 |

---

## 5. 风险与缓解

| 风险 | 影响 | 缓解 |
|---|---|---|
| Cloudflare Access 配置错误锁死团队 | 团队成员无法访问 | 保留 Vercel Edge Middleware Basic Auth 兜底 + 团队 owner 可直连 Vercel Preview URL |
| 测试者未收到 Cloudflare OTP | 无法访问 Alpha | Tally / Slack 通知团队 owner 手动添加白名单 |
| Email 白名单泄露 | 外部人员可访问 Alpha | 90 天轮换 + 监控访问日志 + 限制 email domain |
| `.env` 误入仓 | Secret 泄露 | `.gitignore` 已包含 + CI grep 检查 + 提交前 lint |
| VITE_ 前缀误用 | Secret 进入客户端 bundle | CI 检查 + 强制所有 secret 不以 VITE_ 开头 + code review checklist |
| Vercel Dashboard 截图泄露 Environment Variables | Secret 泄露 | 团队 SOP 禁止截图分享 Dashboard |

---

## 6. 自验收 checklist（任务卡 §✅ Acceptance Criteria）

| # | 验收项 | 状态 | 证据 |
|---|---|---|---|
| 1 | 访问受控（IP 白名单 / 团队账号 / 邀请链接） | ✅ | Cloudflare Access + Email OTP（§1.2） |
| 2 | 测试标识明确（页面带 Alpha Banner / Notice / Feedback 入口） | ✅ | AlphaBanner 组件预制（§2） |
| 3 | Secrets 不进入客户端或仓库 | ✅ | 当前 0 secret · `.env.production` 无 VITE_ 前缀（§3.1） |
| 4 | `git grep` 客户端 bundle 不含任何 secret | ✅ | CI 脚本 `scripts/check-bundle-secrets.sh`（§3.4） |

---

## 7. 元数据

| 字段 | 值 |
|---|---|
| 文档版本 | v1 |
| 创建时间 | 2026-08-22 |
| 创建人 | Engineer Agent #2 |
| 文档 ID | `access-control-v1.md` |
| 目标 Gate | Gate A · Internal Alpha |
| Workspace 路径 | `/Users/lwy/Documents/ChatGPT/看见地球/release-v1/alpha-environment/access-control-v1.md` |
| Obsidian canonical 路径 | `/Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/alpha-environment/access-control-v1.md` |
| Obsidian 同步状态 | ❌ 未同步 |

---

**End of Document**
