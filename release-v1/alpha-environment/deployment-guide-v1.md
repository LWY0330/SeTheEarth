---
title: SEE EARTH · 部署 / 回滚 / 数据重置文档 v1
type: deployment-guide
tags: [release-v1, e-p0-08, alpha-env, deployment, rollback, see-earth]
task_id: E-P0-08-C
gate_target: Gate A · Internal Alpha
dispatched_at: 2026-08-22
dispatch_round: Round 2A
status: DRAFT · IN REVIEW
author: Engineer Agent #2
target_audience: 团队成员（不依赖 owner 在场）
source_inputs:
  - /Users/lwy/Documents/ChatGPT/看见地球/release-v1/alpha-environment/env-decision-v1.md
  - /Users/lwy/Documents/ChatGPT/看见地球/release-v1/alpha-environment/vercel-alias-fix-v1.md
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/alpha-environment/deployment-guide-v1.md
workspace_canonical_path: /Users/lwy/Documents/ChatGPT/看见地球/release-v1/alpha-environment/deployment-guide-v1.md
sync_required: true · sandbox 拒绝写入 Obsidian
---

# SEE EARTH · 部署 / 回滚 / 数据重置文档 v1

> **作者**：Engineer Agent #2（外部 Owner = 用户）
> **派发时间**：2026-08-22
> **目标**：让任何团队成员（无需 owner 在场）按本文档完成 Alpha 部署、回滚和数据重置
> **测试通过标准**：未参与过 Vercel 配置的成员按文档可在 30 分钟内完成首次部署

---

## 0. 一句话结论

**Alpha 部署 = 一次 `git push origin alpha`（Vercel 自动接管）。回滚 = Vercel Dashboard 1 次点击。数据重置 = 当前 V1 无真实数据库 = 无数据可重置（未来 E-P0-02 后端落地后补数据库脚本）。**

---

## 1. 前置条件（首次部署前一次性配置）

### 1.1 工具清单

| 工具 | 版本 | 安装命令 | 必需? |
|---|---|---|---|
| Node.js | ≥ 20.x | https://nodejs.org | ✅ |
| pnpm | ≥ 8.x | `npm install -g pnpm` | ✅ |
| git | ≥ 2.30 | `brew install git`（macOS） | ✅ |
| Vercel CLI | ≥ 32.x | `npm install -g vercel` | 🟡 推荐（高级操作） |
| Vercel 账号 | — | https://vercel.com/signup | ✅ |
| Vercel project 访问权限 | setheearth | 用户邀请 | ✅ |

### 1.2 Vercel 账号配置

```bash
# 首次登录
vercel login

# 验证登录状态
vercel whoami
# 期望输出：lwy0330 或对应团队账号
```

### 1.3 项目 clone

```bash
cd "/Users/lwy/Documents/ChatGPT"
git clone git@github.com:LWY0330/SeTheEarth.git see-earth
cd see-earth

# 安装依赖
npm install

# 验证本地 build
npm run build
# 期望输出：✓ built in 2-3s · dist/ 目录创建成功

# 验证本地 dev
npm run dev
# 浏览器访问 http://localhost:5173
```

### 1.4 Vercel project 链接

```bash
# 在项目根目录
vercel link
# ? Set up "~/see-earth"? [Y/n] Y
# ? Which scope? 选择团队或个人
# ? Link to existing project? Y → 选择 setheearth

# 验证链接
cat .vercel/project.json
# 期望输出：{"projectId": "...", "orgId": "..."}
```

---

## 2. Alpha 部署流程

### 2.1 标准部署（git push 自动触发）

```bash
# 1. 切换到 alpha 分支（若不存在则创建）
git checkout alpha 2>/dev/null || git checkout -b alpha origin/main

# 2. 拉取最新代码
git pull origin alpha

# 3. 合并 feature 分支（若有）
git merge origin/<feature-branch> --no-ff -m "merge: <feature> into alpha"

# 4. 推送 → Vercel 自动触发 Preview deployment
git push origin alpha

# 5. 等待部署完成（1-3 分钟）
# Vercel Dashboard → Deployments → 查看 alpha 分支最新 deployment 状态
# 期望：状态 = "Ready" · Build Time = 1-3 分钟
```

### 2.2 PR Preview 部署（每 PR 自动）

```bash
# 1. 创建 feature 分支
git checkout -b alpha/<feature-name>

# 2. 提交代码
git add .
git commit -m "feat(<scope>): <description>"
git push -u origin alpha/<feature-name>

# 3. 在 GitHub 创建 PR
# Base: alpha ← Compare: alpha/<feature-name>
# Vercel bot 自动评论 PR Preview URL

# 4. 测试者在 Preview URL 验证
# URL 格式：https://setheearth-<hash>-lwy0330.vercel.app
```

### 2.3 Vercel CLI 手动部署（紧急 / 调试）

```bash
# 部署到 Preview（不触发 Production）
vercel

# 部署到 Production（main 分支专属，谨慎使用）
vercel --prod

# 查看部署状态
vercel ls

# 查看部署日志
vercel logs <deployment-url>
```

### 2.4 部署验证清单

每次部署完成后，按以下清单验证：

| # | 验证项 | 命令 / 操作 | 通过标准 |
|---|---|---|---|
| 1 | Build 状态 | Vercel Dashboard → Deployments | 状态 = "Ready" |
| 2 | Bundle 大小 | Dashboard → Deployment → Size | dist/ 总大小 ≤ 5 MB |
| 3 | TypeScript 编译 | `npm run typecheck` | 0 errors |
| 4 | 单元测试 | `npm test` | 所有 test pass |
| 5 | 主页加载 | 浏览器访问 Alpha URL | 返回 200 + SPA 内容 |
| 6 | 12 城列表 | `/cities` | 显示 12 城 |
| 7 | 城市详情 | `/cities/kyoto` | 显示京都 City Page |
| 8 | Unknown Coordinate | `/unknown` | 显示 5 stage Reveal |
| 9 | About | `/about` | 显示 About Page |
| 10 | Alpha Banner | 任意页面顶部 | 红色 Banner 显示 + 反馈入口可见 |
| 11 | Console 无错误 | DevTools → Console | 无 red error |
| 12 | Network 无 404 | DevTools → Network | 无 4xx/5xx 资源 |

---

## 3. 回滚流程

### 3.1 Vercel Dashboard 一键回滚（推荐）

```text
Step 1. 登录 Vercel Dashboard → setheearth project
Step 2. Deployments → 找到目标 deployment（建议：上一个稳定版本）
        - 按时间倒序排列
        - 状态必须为 "Ready"
        - commit message 应清晰可读
Step 3. 点击 deployment 右侧 "..." → "Promote to Production"
        ⚠️ 注意：这是对 main 分支 Production deployment 的操作
        Alpha Preview deployment 不会受影响
Step 4. 对于 Alpha Preview 回滚：
        - 点击目标 Preview deployment 右侧 "..." → "Promote to Production Branch"
        - 该 deployment 成为 alpha 分支的新 production deployment
Step 5. 等待 30 秒 - 5 分钟（DNS 传播）
Step 6. 浏览器验证 Alpha URL 已回滚
```

### 3.2 通过 git revert 回滚（备选 · 保留历史）

```bash
# 1. 找到需要回滚的 commit
git log --oneline origin/alpha -20

# 2. 回滚特定 commit（创建新 commit 撤销）
git revert <commit-sha>

# 3. 推送 → Vercel 自动触发新 Preview deployment
git push origin alpha

# 4. 验证新 deployment 正常后，旧的坏 deployment 可在 Dashboard 删除
```

### 3.3 通过 git reset 回滚（紧急 · 慎用）

```bash
# 1. 强制重置 alpha 分支到指定 commit
git checkout alpha
git reset --hard <good-commit-sha>
git push --force-with-lease origin alpha

# 2. ⚠️ 警告：--force 会重写 alpha 分支历史
# 3. 团队成员需要重新 git pull origin alpha
```

### 3.4 回滚后必做事项

- [ ] 在 `#engineering` Slack 频道通知回滚原因
- [ ] 在 PM Agent 任务卡添加 "回滚记录"
- [ ] 调查回滚原因（commit log / 测试报告 / 监控告警）
- [ ] 修复问题后重新部署（git revert 或新 fix commit）

---

## 4. 数据重置流程

### 4.1 当前状态（V1 = 100% 客户端 SPA）

V1 当前**无真实数据库 / 对象存储**，所有内容数据硬编码在 `src/data/*.ts`。**没有数据可重置**。

| 数据源 | 类型 | 数量 | 是否需要重置? |
|---|---|---|---|
| `src/data/cities.ts` | 静态 TS | 12 城 | ❌ 硬编码 · 改 source code 即可 |
| `src/data/moments.ts` | 静态 TS | 6 条 | ❌ 硬编码 |
| `src/data/liveMoments.ts` | 静态 TS | 12 条 | ❌ 硬编码 |
| `src/data/photoAssets.ts` | 静态 TS | 5 stage | ❌ 硬编码 |
| `public/images/cities/*` | 静态资源 | 48 张 | ❌ 静态文件 |
| open-meteo API 缓存 | 客户端 Map | 12 城 × 15 min | ✅ 客户端缓存自动过期 |
| sunrise-sunset API 缓存 | 客户端 Map | 12 城 × 6 hour | ✅ 客户端缓存自动过期 |
| Service Worker 缓存 | 客户端 Cache | n/a | ✅ 可手动清除（DevTools） |

**当前"数据重置"等价于**：

```bash
# 1. 用户强制刷新（清除内存 + Service Worker 缓存）
# 浏览器：Cmd+Shift+R (macOS) / Ctrl+Shift+R (Windows)

# 2. 清除 Service Worker
# Chrome DevTools → Application → Storage → Clear site data

# 3. 清除 open-meteo 缓存
# 重启浏览器（内存缓存自动丢失）
```

### 4.2 未来 E-P0-02 后端落地后的数据重置（预制脚本）

> ⚠️ 本节为**预制文档**，E-P0-02 后端完成后需补真实脚本路径。

**目标**：在 Alpha 重置所有 Witness submission / Moment / Edition / Echo 数据到初始状态。

**预制目录结构**（本卡创建）：

```text
release-v1/alpha-environment/scripts/
├── reset-data.sh          # 主入口：一键数据重置
├── seed-data.ts           # Seed 脚本（基于 src/data/*.ts）
├── db-migrate.ts          # 数据库迁移（含 dry-run 与回滚）
└── README.md              # 脚本使用文档
```

**预制脚本框架**（占位 · 待 E-P0-02 真实 API 落地后替换）：

```bash
#!/bin/bash
# release-v1/alpha-environment/scripts/reset-data.sh
# ⚠️ PLACEHOLDER · 待 E-P0-02 后端 API 落地后替换

set -euo pipefail

ENV="${1:-alpha}"

echo "[reset-data] Resetting Alpha data for environment: $ENV"

# 1. 数据库迁移（含 dry-run 模式）
echo "[reset-data] Step 1: Running database migrations..."
./scripts/db-migrate.ts --env="$ENV" --dry-run
./scripts/db-migrate.ts --env="$ENV" --migrate

# 2. Seed 数据初始化
echo "[reset-data] Step 2: Seeding initial data..."
./scripts/seed-data.ts --env="$ENV"

# 3. 清空 Witness submission（重置审核队列）
echo "[reset-data] Step 3: Clearing Witness submissions..."
# TODO: 调用后端 API 清空 submissions 表

# 4. 清空 Echo（重置用户留痕）
echo "[reset-data] Step 4: Clearing Echo entries..."
# TODO: 调用后端 API 清空 echo 表

echo "[reset-data] ✅ Done. Alpha data reset to initial state."
```

**未来真实脚本需求清单**（E-P0-02 子任务）：

1. **DB Migration 脚本**：支持 `--migrate` / `--rollback` / `--dry-run` / `--status`
2. **Seed 脚本**：基于 `src/data/cities.ts` (12 城) + `moments.ts` (6) + `liveMoments.ts` (12) + `photoAssets.ts` (5) → 写入数据库
3. **Reset API endpoint**：`POST /api/admin/reset`（仅 alpha 环境，鉴权）
4. **Pre-reset backup**：自动备份当前数据到 `backups/alpha-reset-<timestamp>.json`
5. **Post-reset validation**：smoke test 验证 Alpha 可访问 + 数据可见

---

## 5. 数据库迁移（预制文档 · 等待 E-P0-02 后端）

### 5.1 当前状态

V1 当前**无数据库**。`backend-reality-audit-v1.md §4.3` 已记录。

### 5.2 未来数据库选型（待 PM 决策）

候选：

| 方案 | 优点 | 缺点 |
|---|---|---|
| **Postgres + Supabase** | 与 Vercel 契合 · 自带 Storage · Auth 简单 | 需独立账号 |
| **Postgres + Neon** | Serverless Postgres · 免费 tier 友好 | 需单独配置 |
| **Postgres + Vercel Postgres** | 一键集成 · 自动连接 Vercel env | 仍在 Preview · 文档少 |
| **Cloudflare D1** | 与 Cloudflare 生态契合 · 便宜 | SQL dialect 略不同 |

**子代理推荐**：**Postgres + Neon**（理由：serverless · 免费 tier 3GB · 与 Vercel Preview 集成好 · SQL 兼容）

### 5.3 Migration 工具选型

| 方案 | 优点 | 缺点 |
|---|---|---|
| **Prisma** | ORM + migration · 类型安全 · 文档好 | bundle 略大 |
| **Drizzle** | 轻量 ORM · SQL-first · bundle 小 | 生态较小 |
| **Kysely** | Type-safe SQL builder · 灵活 | 需手写 migration |

**子代理推荐**：**Prisma**（理由：migrate 命令成熟 · 类型安全 · Vercel 部署文档全）

### 5.4 Migration 命令模板（待落地）

```bash
# 初始化 Prisma
npx prisma init

# 创建 migration
npx prisma migrate dev --name init

# 应用 migration（Production）
npx prisma migrate deploy

# 回滚到指定 migration
npx prisma migrate resolve --rolled-back <migration-name>

# 查看状态
npx prisma migrate status
```

---

## 6. Seed 数据脚本（预制 · 当前为 stub）

### 6.1 目标

从 `src/data/*.ts` 硬编码数据生成数据库初始 seed，**不依赖手工 SQL INSERT**。

### 6.2 当前可立即使用的方案（无 DB 情况）

```typescript
// release-v1/alpha-environment/scripts/seed-data.ts
// ⚠️ PLACEHOLDER · 当前 V1 无 DB，仅生成 JSON 报告

import { cities } from '../../../src/data/cities';
import { moments } from '../../../src/data/moments';
import { liveEvents } from '../../../src/data/liveMoments';
import { photoAssets } from '../../../src/data/photoAssets';

interface SeedReport {
  generated_at: string;
  environment: string;
  cities_count: number;
  moments_count: number;
  live_events_count: number;
  photo_assets_count: number;
  cities: Array<{
    id: string;
    name: string;
    timezone: string;
    isFeatured: boolean;
  }>;
}

export function generateSeedReport(env: string = 'alpha'): SeedReport {
  return {
    generated_at: new Date().toISOString(),
    environment: env,
    cities_count: cities.length,
    moments_count: moments.length,
    live_events_count: liveEvents.length,
    photo_assets_count: photoAssets.length,
    cities: cities.map(c => ({
      id: c.id,
      name: c.nameZh,
      timezone: c.timezone,
      isFeatured: c.isFeatured ?? false,
    })),
  };
}

// CLI 入口（Node 22+ strip-types 支持）
if (import.meta.url === `file://${process.argv[1]}`) {
  const env = process.argv[2] || 'alpha';
  const report = generateSeedReport(env);

  console.log(JSON.stringify(report, null, 2));

  // 写入文件
  const fs = require('fs');
  const path = require('path');
  const outputPath = path.resolve(`./release-v1/alpha-environment/seed-report-${env}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
  console.log(`\n✅ Seed report saved to: ${outputPath}`);
}
```

**使用方式**：

```bash
cd "/Users/lwy/Documents/ChatGPT/看见地球"
node --experimental-strip-types release-v1/alpha-environment/scripts/seed-data.ts alpha

# 期望输出：
# {
#   "generated_at": "2026-08-22T...",
#   "environment": "alpha",
#   "cities_count": 12,
#   ...
# }
```

### 6.3 未来真实 DB Seed 脚本（E-P0-02 落地后补）

```typescript
// 伪代码 · E-P0-02 后实现
import { PrismaClient } from '@prisma/client';
import { cities, moments, liveEvents, photoAssets } from '../../../src/data';

const prisma = new PrismaClient();

async function seedDatabase() {
  // 1. 清空现有数据（仅 alpha 环境！）
  await prisma.moment.deleteMany();
  await prisma.city.deleteMany();

  // 2. 写入城市
  for (const city of cities) {
    await prisma.city.create({ data: mapCityToSchema(city) });
  }

  // 3. 写入 Moment
  for (const moment of moments) {
    await prisma.moment.create({ data: mapMomentToSchema(moment) });
  }

  // 4. 写入 LiveEvent
  for (const event of liveEvents) {
    await prisma.liveEvent.create({ data: mapLiveEventToSchema(event) });
  }

  console.log('✅ Alpha database seeded');
}

seedDatabase();
```

---

## 7. 故障排查指南（最常见 5 个问题）

### 问题 1 · Build 失败：TypeScript error

**症状**：

```text
src/components/Foo.tsx:42:5 - error TS2322: Type 'X' is not assignable to type 'Y'.
```

**修复步骤**：

```bash
# 1. 本地复现
npm run typecheck

# 2. 修复类型错误（不要用 any 绕过）

# 3. 验证修复
npm run build

# 4. 提交并推送
git add .
git commit -m "fix(typescript): <description>"
git push origin alpha
```

### 问题 2 · Build 失败：VITE_* 环境变量缺失

**症状**：

```text
error: VITE_ENV is not defined
```

**修复步骤**：

1. Vercel Dashboard → setheearth → Settings → Environment Variables
2. 检查 Preview environment 是否配置了 `VITE_ENV=alpha`
3. 若缺失：添加 → Environment = Preview → Value = `alpha`
4. 触发 redeploy（Deployments → 最新 → "..." → Redeploy）

### 问题 3 · 部署成功但页面 404

**症状**：

- Deployment 状态 = "Ready"
- 浏览器访问 URL 显示 404

**可能原因 + 修复**：

| 原因 | 修复方式 |
|---|---|
| URL 拼写错误 | 检查 Vercel Dashboard → Deployments → 实际 URL |
| DNS 未传播 | 等待 5 分钟，刷新浏览器（Cmd+Shift+R） |
| 浏览器缓存 | 强制刷新 / DevTools → Network → Disable cache |
| Service Worker 缓存 | DevTools → Application → Service Workers → Unregister |

### 问题 4 · Vercel Preview 部署休眠

**症状**：

- 之前可访问的 Preview URL 突然返回 404
- Dashboard 显示 deployment 状态为 "Archived" 或 "Stale"

**修复**：

1. Dashboard → Deployments → 找到目标 deployment
2. "..." → "Redeploy"
3. 等待 1-3 分钟
4. **预防**：Settings → General → 关闭 "Auto-archive deployments"（需用户操作）

### 问题 5 · Alpha Banner 不显示

**症状**：

- 部署成功但页面顶部没有 Alpha Banner

**可能原因**：

1. `VITE_ENV` 未配置或拼写错误
2. feature flag 代码未生效

**修复**：

```bash
# 1. 验证环境变量
# Vercel Dashboard → Settings → Environment Variables
# 检查 Preview 环境是否有 VITE_ENV=alpha

# 2. 验证 feature flag 代码
grep -r "VITE_ENV" src/
# 期望输出：src/App.tsx 包含 VITE_ENV 检查

# 3. 重新部署
git commit --allow-empty -m "chore: trigger redeploy"
git push origin alpha
```

---

## 8. 一键脚本（粘到 `package.json`）

> 当前 `package.json` 已有 `dev / build / preview / typecheck / test` 5 个 script。本卡补充以下 deployment 相关 script：

```jsonc
// package.json scripts 扩展
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "start": "serve -s dist -l 8080",
    "typecheck": "tsc --noEmit -p tsconfig.json",
    "lighthouse": "bash scripts/lighthouse-ci.sh",
    "test": "node --test --experimental-strip-types src/lib/*.test.ts src/types/*.test.ts src/hooks/*.test.ts src/data/*.test.ts",
    "test:components": "echo '⚠️ Component tests require Vitest or tsx loader (Node 22 strip-types does not support JSX).'",

    // ↓ 新增（E-P0-08）↓
    "alpha:seed-report": "node --experimental-strip-types release-v1/alpha-environment/scripts/seed-data.ts alpha",
    "alpha:deploy:cli": "vercel --target preview",
    "alpha:rollback": "echo 'See release-v1/alpha-environment/deployment-guide-v1.md §3'",
    "alpha:reset-data": "echo 'See release-v1/alpha-environment/deployment-guide-v1.md §4'",
    "ci:check-bundle-secrets": "bash scripts/check-bundle-secrets.sh"
  }
}
```

**重要**：当前 PR 改动 `package.json` 不在本卡范围内（任务卡禁止修改 v1.6.4 已交付代码除非显式 v1.6.5 部署修复）。这些 scripts **作为 PR 提案列出**，由 PM Agent 评审后决定是否合并到 main 分支。

---

## 9. 与 Production 部署的差异

| 步骤 | Production | Alpha |
|---|---|---|
| Git 分支 | main | alpha |
| 触发方式 | git push origin main → Vercel auto | git push origin alpha → Vercel auto |
| Vercel project | 同一 setheearth project | 同一 sethearth project |
| 部署目标 | `see-earth.vercel.app` | `alpha-see-earth.vercel.app` |
| Vercel 环境变量 | Production env | Preview env |
| 访问控制 | 公开（修复后） | Cloudflare Access / Basic Auth |
| Banner | 无 | Alpha Banner（红色顶部固定） |
| Rollback | Dashboard → Promote | Dashboard → Promote Preview |
| 数据重置 | n/a（无 DB） | n/a（无 DB）· 强制刷新 = 重置 |

---

## 10. 元数据

| 字段 | 值 |
|---|---|
| 文档版本 | v1 |
| 创建时间 | 2026-08-22 |
| 创建人 | Engineer Agent #2 |
| 文档 ID | `deployment-guide-v1.md` |
| 目标 Gate | Gate A · Internal Alpha |
| 目标读者 | 团队成员（不依赖 owner） |
| 部署目标 | `alpha-see-earth.vercel.app` |
| Workspace 路径 | `/Users/lwy/Documents/ChatGPT/看见地球/release-v1/alpha-environment/deployment-guide-v1.md` |
| Obsidian canonical 路径 | `/Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/alpha-environment/deployment-guide-v1.md` |
| Obsidian 同步状态 | ❌ 未同步 |

---

**End of Document**
