---
title: SEE EARTH V1 · Backend Setup · Phase 1
type: backend-decision
tags: [release-v1, e-p0-02, backend, nextjs, supabase, drizzle, see-earth]
task_id: E-P0-02
phase: Phase 1 · Vertical Slice
dispatched_at: 2026-08-22
status: DRAFT · IN REVIEW
author: Engineer Agent (Round 2B)
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/vertical-slice-phase1/backend-setup-v1.md
source_inputs:
  - release-v1/backend-reality-audit-v1.md §4 §5 §7
  - release-v1/api-contract/openapi.yaml
  - release-v1/api-contract/zod-schemas/*
  - release-v1/alpha-environment/env-decision-v1.md
  - release-v1/alpha-environment/deployment-guide-v1.md
---

# SEE EARTH V1 · Backend Setup · Phase 1 Vertical Slice

> **作者**：Engineer Agent（Round 2B · Phase 1 子集）
> **目标读者**：PM Agent（验收）、用户（Vercel/Supabase 配置决策）、后续 Phase 2 工程师
> **任务卡**：E-P0-02 Launch Vertical Slice（Phase 1 子集）
> **决策日期**：2026-08-22

---

## 0. 一句话结论

**Next.js 14（App Router）+ Vercel Route Handler 作为 sibling 项目部署至同一 Vercel project `setheearth` 的 Preview environment；Supabase（独立 project `setheearth-alpha`）提供 Postgres + Storage；Drizzle ORM + drizzle-kit 作为迁移工具；环境变量通过 Vercel Dashboard Preview environment 注入；公共 API 通过 `VITE_API_BASE_URL` 环境变量切换至 alpha API 端点。**

---

## 1. Next.js 与现有 Vite SPA 的集成方式决策

### 1.1 候选方案回顾

| 选项 | 描述 | 风险 | 决策 |
|---|---|---|---|
| **A**（推荐） | Next.js 作为 sibling 应用，作为独立 Vercel deployment；Vite SPA 不变 | 🟢 低 | ✅ **采纳** |
| B | Vite SPA 整体迁到 Next.js 全栈 | 🔴 高（破坏 Round 1 设计 LOCK · 14 组件重写） | ❌ |
| C | 纯 Vercel Functions（无 Next.js） | 🟡 中（偏离 PM 默认 + 工具链碎片） | ❌ |

### 1.2 决策：选项 A · Next.js sibling + 独立 Vercel Preview

**理由**：

1. **Round 1 设计 LOCK 不变**：sitemap-v1.md LOCKED 7 个页面 + 14 组件 LOCKED + 22 设计 LOCKED 全部不动；Vite SPA 客户端行为保持一致
2. **PM 2026-08-22 默认**：Next.js Route Handler + Postgres + Supabase Storage 与既有 Vercel 项目契合
3. **TS 全栈**：可直接 import `release-v1/api-contract/zod-schemas/*.ts` 作为 source of truth，避免双写
4. **迁移工具成熟**：drizzle-kit 与 Next.js + Vercel 集成无门槛（`drizzle.config.ts` + `vercel.json`）
5. **隔离清晰**：前端（Vite SPA）与后端（Next.js）独立 deployment，互不污染；前端 bundle 体积不变
6. **Rollback 简单**：Next.js 后端回滚 = Vercel Dashboard 一键回滚；不影响前端

**对 Round 1 设计 LOCK 的影响**：

- ✅ 不修改任何 LOCKED 文件（sitemap-v1.md / design-freeze-log-v1.md / page-audit-v1.md）
- ✅ 不修改 14 个 LOCKED 组件
- ✅ 仅修改**数据源层**（`src/data/*.ts` 切换为 API 调用）+ 添加 `src/lib/api-client.ts`
- ✅ `src/components/ui/EchoInput.tsx` 按 OD-01 处理（详见 `echo-ui-decision-v1.md`）

### 1.3 部署形态

```text
┌─────────────────────────────────────────────────────────────────┐
│  Vercel Project: setheearth                                      │
│  ┌─────────────────────────────┐  ┌──────────────────────────┐ │
│  │  Branch: alpha              │  │  Branch: alpha-api       │ │
│  │  Framework: Vite SPA        │  │  Framework: Next.js 14   │ │
│  │  Domain: alpha-see-earth    │  │  Path: /api/v1/*         │ │
│  │           .vercel.app       │  │  Domain: alpha-api-      │ │
│  │                             │  │    see-earth.vercel.app  │ │
│  │  src/data/*.ts → API 调用   │  │  Route Handlers          │ │
│  │                             │  │  Postgres + Supabase     │ │
│  │  VITE_API_BASE_URL ─────────┼──┼─► NEXT_PUBLIC_API_BASE   │ │
│  │  = https://alpha-api-...    │  │     = self               │ │
│  └─────────────────────────────┘  └──────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
                       ┌──────────────────────────────┐
                       │  Supabase Project            │
                       │  setheearth-alpha            │
                       │  - Postgres (us-east-1)      │
                       │  - Storage bucket:            │
                       │    see-earth-alpha-assets    │
                       └──────────────────────────────┘
```

### 1.4 Repository 布局

```text
/Users/lwy/Documents/ChatGPT/看见地球/
├── (existing)                       # Vite SPA · frontend
│   ├── src/                         # 前端代码
│   ├── public/                      # 静态资源
│   ├── package.json                 # vite + react
│   └── vite.config.ts
│
└── api/                             # NEW · Next.js 14 sibling
    ├── app/
    │   └── api/
    │       └── v1/
    │           ├── healthz/route.ts
    │           ├── cities/route.ts
    │           ├── cities/[cityIdOrSlug]/route.ts
    │           ├── cities/[cityIdOrSlug]/moments/route.ts
    │           ├── moments/[momentId]/route.ts
    │           ├── editions/route.ts
    │           ├── editions/today/route.ts
    │           └── editions/[editionId]/route.ts
    ├── src/
    │   ├── db/
    │   │   ├── schema.ts            # Drizzle schema
    │   │   └── client.ts            # postgres-js client
    │   ├── services/                # business logic
    │   │   ├── cities.ts
    │   │   ├── moments.ts
    │   │   ├── editions.ts
    │   │   └── storage.ts           # Supabase Storage + EXIF
    │   ├── middleware/
    │   │   ├── cors.ts              # alpha-see-earth + vercel.app
    │   │   ├── rateLimit.ts         # 100 req/min/IP per OD-05
    │   │   └── requestId.ts
    │   └── lib/
    │       ├── errors.ts            # ErrorEnvelope formatter
    │       └── privacy.ts           # public/admin serializer gate
    ├── drizzle/                     # generated migrations
    │   └── 0000_init.sql
    ├── drizzle.config.ts
    ├── next.config.mjs
    ├── package.json                 # next + drizzle + sharp
    └── tsconfig.json
```

**关键约束**：

- 两个项目**共用** `release-v1/api-contract/zod-schemas/*.ts`（作为 type-only source）
- Vite SPA 通过相对路径 `@see-earth/api/zod-schemas/...` 引用（建议设置 `tsconfig.json` paths）
- Next.js API 通过 `import` 同目录的 `zod-schemas` 模块

### 1.5 Vercel project 配置

**单 Vercel project = `setheearth`**（不创建新 project · 与 alpha-env-decision 一致）：

| Vercel Setting | 值 | 理由 |
|---|---|---|
| Root Directory | `/` (单 repo 单 project) | 单 repo |
| Framework Preset · `alpha` 分支 | Vite | 前端 deployment |
| Framework Preset · `alpha-api` 分支 | Next.js | 后端 deployment |
| Production Branch | `main` | 与现有 Production 修复一致 |
| Preview Branch Pattern | `^(alpha|alpha-api)$` | 双 Preview 分支 |

**分支策略**：

```text
main (Production · sethearth domain · 未修复,Phase 1 不触碰)
 │
 ├── alpha (alpha-see-earth.vercel.app · Vite SPA + Preview env)
 │    ↓
 │   Preview deployment #1 (前端)
 │
 └── alpha-api (alpha-api-see-earth.vercel.app · Next.js + Preview env)
      ↓
     Preview deployment #2 (后端)
```

**Vercel Preview Domain 配置**（**用户操作清单**，PM Agent 同步）：

```text
Step 1. 登录 Vercel Dashboard → setheearth project
Step 2. Settings → Domains → Add
        - alpha-see-earth.vercel.app (前端,git branch: alpha)
        - alpha-api-see-earth.vercel.app (后端,git branch: alpha-api)
Step 3. Assign to Production branch = 对应分支
Step 4. 完成 · DNS 自动生效(30 秒 - 5 分钟)
```

> **Phase 1 简化版**：可先用 Vercel 自动生成的 Preview URL（`setheearth-git-alpha-lwy0330.vercel.app` + `setheearth-git-alpha-api-lwy0330.vercel.app`），待 PM 评审后再固化 Preview Domain。

---

## 2. Supabase 配置

### 2.1 创建独立 Supabase Project

**PM/用户决策点**（**必须用户手动操作**）：

| 项 | 推荐值 | 备注 |
|---|---|---|
| Project Name | `sethearth-alpha` | 与 Vercel project 区分 |
| Database Password | (random 32-char) | 用户保存到密码管理器 |
| Region | `us-east-1` | 与 Vercel 默认 region 接近 |
| Plan | Free tier | Phase 1 数据量极小（12 城 + 18 moment） |

**用户操作清单**：

```text
Step 1. 登录 https://supabase.com
Step 2. New Project → Name: sethearth-alpha → Region: us-east-1
Step 3. 设置 Database Password(随机 32 字符) → 保存
Step 4. 等待 project ready(约 90 秒)
Step 5. Settings → API → 复制:
        - Project URL: https://xxxx.supabase.co
        - anon public key: eyJ... (前端用)
        - service_role key: eyJ...(后端用,严禁暴露)
Step 6. Settings → Database → Connection String → 复制:
        - Transaction mode: postgresql://postgres:[password]@db.xxxx.supabase.co:5432/postgres
```

### 2.2 Supabase Storage Bucket

**Bucket 配置**（详见 `storage-pipeline-v1.md`）：

- Name: `see-earth-alpha-assets`
- Public: **false**（所有访问通过 signed URL）
- File size limit: 20MB
- Allowed MIME: `image/jpeg`, `image/png`, `image/webp`

### 2.3 Service Role vs Anon Key

| Key | 用途 | 暴露范围 |
|---|---|---|
| `SUPABASE_URL` | Project URL | 后端 only（Vercel Preview env） |
| `SUPABASE_ANON_KEY` | 公开 API key（前端 anon read） | **Phase 1 不使用**（公共 endpoint 无需 anon） |
| `SUPABASE_SERVICE_ROLE_KEY` | 服务端全权限（绕过 RLS） | 后端 only（Vercel Preview env）· **严禁前端 bundle** |
| `DATABASE_URL` | Postgres 连接串（Transaction mode） | 后端 only |

---

## 3. 迁移工具决策：Drizzle ORM

### 3.1 候选对比

| 维度 | Drizzle ORM | Prisma |
|---|---|---|
| TS strict 集成 | 🟢 优秀（type-safe schema） | 🟡 优秀（runtime type） |
| 运行时体积 | 🟢 小（~10kb · 适合 Edge） | 🟡 大（~50MB engine） |
| Vercel Edge / Serverless 兼容 | 🟢 原生支持 | 🟡 需 Prisma Accelerate |
| Migration 体验 | 🟢 drizzle-kit 简单 | 🟡 prisma migrate 成熟 |
| 与 Zod 集成 | 🟢 可派生 Zod schema | 🟡 需 zod-prisma 中间层 |
| Postgres 特性（JSONB / partial index） | 🟢 原生支持 | 🟡 部分支持 |
| Phase 1 团队熟悉度 | 🟡 中 | 🟢 高 |

### 3.2 决策：Drizzle ORM

**理由**：

1. **Edge Runtime 兼容**：Vercel Edge Functions 原生支持，Drizzle 不需要 Accelerate 之类代理
2. **Bundle 体积小**：~10KB vs Prisma ~50MB engine，对 cold start 友好
3. **Type-safe schema**：与 `release-v1/api-contract/zod-schemas/*` 自然对齐（都是 TS-first）
4. **JSONB + partial index**：Edition.slots[12] 用 JSONB + `client_key` 用 unique partial index 都直接支持
5. **drizzle-kit 简单**：`drizzle-kit generate` + `drizzle-kit migrate` 两步

**代价**：

- 团队需学习 Drizzle query API（不同于 Prisma 的 findMany）
- Drizzle Studio 比 Prisma Studio 弱（不影响 Phase 1）

---

## 4. 环境变量管理

### 4.1 Vercel Preview Environment Variables（**用户配置**）

| Variable | Environment | 类型 | 来源 / 用途 |
|---|---|---|---|
| `SUPABASE_URL` | Preview | secret | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Preview | secret | Supabase 服务端全权限 |
| `DATABASE_URL` | Preview | secret | Postgres 连接串 |
| `RATE_LIMIT_PER_MIN` | Preview | public | `100`（per OD-05） |
| `CORS_ALLOWED_ORIGINS` | Preview | secret | `alpha-see-earth.vercel.app,*.vercel.app` |
| `LOG_LEVEL` | Preview | public | `info`（Phase 1） |
| `REQUEST_ID_HEADER` | Preview | public | `x-request-id` |
| `IMAGE_VARIANT_SIZES` | Preview | public | `320,640,1280` |
| `MAX_UPLOAD_BYTES` | Preview | public | `20971520`（20MB） |
| `STORAGE_BUCKET` | Preview | public | `see-earth-alpha-assets` |
| `SIGNED_URL_TTL_SECONDS` | Preview | public | `600` |
| `WITNESS_SESSION_TTL_DAYS` | Preview | public | `90`（per OD-04） |

**前端环境变量**（Vite SPA · 注入 client bundle）：

| Variable | 环境 | 类型 | 来源 |
|---|---|---|---|
| `VITE_ENV` | Preview | public | `alpha`（与 alpha-env-decision 一致） |
| `VITE_API_BASE_URL` | Preview | public | `https://alpha-api-see-earth.vercel.app/v1` |
| `VITE_USE_MOCK_API` | Preview | public | `false`（Alpha 必须真实后端） |

### 4.2 本地开发环境

`.env.local`（**已在 .gitignore 中**）：

```bash
# 后端(api/)
SUPABASE_URL=http://127.0.0.1:54321  # supabase CLI local
SUPABASE_SERVICE_ROLE_KEY=local-dev-key
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres

# 前端(root)
VITE_API_BASE_URL=http://localhost:8787/v1
VITE_USE_MOCK_API=false
```

### 4.3 Secret 安全检查

```bash
# CI 检查：grep 客户端 bundle 不含 SUPABASE_SERVICE_ROLE_KEY
grep -rE "SUPABASE_SERVICE_ROLE_KEY" dist/ 2>&1 | head -5
# 期望输出：0 命中
```

---

## 5. 关键技术选型

| 项 | 选型 | 理由 |
|---|---|---|
| Runtime | Vercel Serverless Functions (Node.js 20) | 与 Vite SPA Node 版本一致 |
| Image Processing | `sharp` ^0.33（仅 server-side） | EXIF 剥离 + variant 生成业界标准 |
| Postgres Client | `postgres` (porsager/postgres) + `drizzle-orm/postgres-js` | 与 Edge Runtime 兼容 |
| Supabase Client | `@supabase/supabase-js` ^2.45（server-side only） | Storage signed upload |
| Rate Limit | `@upstash/ratelimit` + `@upstash/redis`（Upstash Redis REST） | Serverless-friendly（Phase 1 备选：in-memory token bucket per IP，Hobby plan 限制） |
| Logging | `pino` + Vercel log drain | 结构化 JSON log |
| Validation | Zod 3.23（与 contract 一致） | Runtime + static type |
| Image EXIF | `exifr` ^7（read）+ sharp 内置 strip | EXIF 读取最小化（仅 datetime + camera） |

> **Phase 1 Rate Limit 简化**：因 Upstash 需单独 Redis 服务，Phase 1 用 Vercel KV（Hobby 免费 tier 包含 256MB）或 Edge Middleware in-memory token bucket（per-IP sliding window）。**详细阈值 = 100 req/min/IP**（per OD-05）。

---

## 6. 与 Round 1 + Round 2A 已有产物的接口

| 已有产物 | 接入方式 |
|---|---|
| `release-v1/api-contract/zod-schemas/*.ts` | 直接 import（symlink 或 tsconfig paths） |
| `release-v1/api-contract/openapi.yaml` | Phase 1 endpoint 必须与 schema 100% 一致（手测 + smoke test） |
| `release-v1/alpha-environment/env-decision-v1.md` | 已确定 alpha 分支 + Vercel Preview 策略；本文件细化 Preview Domain |
| `release-v1/alpha-environment/deployment-guide-v1.md` | Vercel 部署步骤直接复用 |
| `release-v1/minimal-witness/api-field-mapping-v1.md` | Phase 2 Witness Submission 字段映射已 LOCKED；Phase 1 仅 GET 端点不涉及 |
| `release-v1/backend-reality-audit-v1.md` §5 | 6 域 schema 蓝图 → 直接转 Drizzle schema |

---

## 7. Phase 1 不交付（明确排除）

| 项 | Phase | 理由 |
|---|---|---|
| Witness POST `/v1/witness/submissions` | Phase 2 | Phase 1 范围仅 Observe vertical slice |
| Asset upload UI 集成 | Phase 2 | Phase 1 仅实现 Storage 后端 |
| Echo POST `/v1/echoes` | Phase 3 (per OD-01 REMOVE) | 不实现 Echo 提交能力 |
| Admin endpoints | Phase 3 | Phase 1 无 admin UI 需求 |
| Analytics SDK | Phase 3 (E-P0-07) | 公共 API 不发 analytics 事件 |
| Cron / scheduled jobs | 不做 | per OD-03（V1 无 cron） |
| iOS first-pass | Phase 3+ | Phase 1 仅 Web |

---

## 8. Blockers（需要用户/PM 决策）

1. **Supabase project 创建**：用户手动在 https://supabase.com 创建 `sethearth-alpha` project → 复制 URL + service_role key
2. **Vercel Preview Domain 配置**：用户手动添加 `alpha-see-earth.vercel.app` + `alpha-api-see-earth.vercel.app`
3. **Vercel Preview env 配置**：用户在 Vercel Dashboard Settings → Environment Variables 配置 12 个 secret（详见 §4.1）
4. **Drizzle migration 执行**：用户本地 `pnpm drizzle-kit push` 或 Vercel build command 集成
5. **域名最终决策**：用户决定是否使用 Vercel 自动 Preview URL vs 固化 Preview Domain

---

## 9. 元数据

| 字段 | 值 |
|---|---|
| 文档版本 | v1 |
| 创建时间 | 2026-08-22 |
| 创建人 | Engineer Agent (Round 2B) |
| 文档 ID | `backend-setup-v1.md` |
| 目标 Gate | Gate A · Internal Alpha · Phase 1 |
| 决策状态 | ✅ ACCEPTED（待 PM 评审） |
| Workspace 路径 | `/Users/lwy/Documents/ChatGPT/看见地球/release-v1/vertical-slice-phase1/backend-setup-v1.md` |
| Obsidian canonical 路径 | `/Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/vertical-slice-phase1/backend-setup-v1.md` |
| Obsidian 同步状态 | ❌ 未同步（sandbox 拒绝写入 Obsidian） |

---

**End of backend-setup-v1.md**