---
title: SEE EARTH V1 · Alpha Deployment Evidence · Phase 1
type: deployment-evidence
tags: [release-v1, e-p0-02, deployment, alpha, vercel, see-earth]
task_id: E-P0-02
phase: Phase 1 · Vertical Slice
dispatched_at: 2026-08-22
status: DRAFT · IN REVIEW
author: Engineer Agent (Round 2B)
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/vertical-slice-phase1/alpha-deployment-evidence-v1.md
source_inputs:
  - release-v1/alpha-environment/env-decision-v1.md
  - release-v1/alpha-environment/deployment-guide-v1.md
  - release-v1/alpha-environment/seed-report-alpha.json
  - release-v1/vertical-slice-phase1/backend-setup-v1.md
---

# SEE EARTH V1 · Alpha Deployment Evidence · Phase 1

> **作者**：Engineer Agent（Round 2B · Phase 1 子集）
> **目标读者**：PM Agent（验收）、用户（部署操作验证）、后续 Phase 工程师
> **任务卡**：E-P0-02 Launch Vertical Slice（Phase 1 子集 · §G）
> **约束**：本卡不触碰 Production；仅部署到 alpha-see-earth.vercel.app
> **决策日期**：2026-08-22

---

## 0. 一句话结论

**Phase 1 Alpha 部署需要 4 项用户操作：(1) 创建 Supabase project，(2) 创建 git branches `alpha` + `alpha-api`，(3) Vercel Dashboard 配置 Preview Domain + Environment Variables，(4) 触发首次部署。本文件记录每项操作的步骤清单 + 预期结果 + 验证 log。** 因 Phase 1 完全在 sandbox 内无法直接执行部署，所有操作清单为用户/PM 执行；本文件同时记录理论部署 URL 与验证证据。

---

## 1. 部署架构概览

```text
┌──────────────────────────────────────────────────────────────────┐
│  Vercel Project: setheearth (existing · Round 1)                 │
│                                                                   │
│  Branch: alpha (NEW · user creates)                               │
│  ├─ Framework: Vite SPA (auto-detected)                          │
│  ├─ Root: /  (frontend repo root)                                 │
│  ├─ Build cmd: pnpm build                                         │
│  ├─ Output: dist/                                                 │
│  ├─ Domain: alpha-see-earth.vercel.app (user adds · Preview)      │
│  └─ Env: VITE_ENV=alpha, VITE_API_BASE_URL=...                   │
│                                                                   │
│  Branch: alpha-api (NEW · user creates)                           │
│  ├─ Framework: Next.js 14 (auto-detected)                         │
│  ├─ Root: api/  (monorepo path)                                   │
│  ├─ Build cmd: cd api && pnpm build                               │
│  ├─ Output: .next/                                                │
│  ├─ Domain: alpha-api-see-earth.vercel.app (user adds · Preview)  │
│  └─ Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL    │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────────────┐
│  Supabase Project: sethearth-alpha (NEW · user creates)            │
│  ├─ Region: us-east-1                                             │
│  ├─ Plan: Free                                                    │
│  ├─ Postgres: 12 cities + 6 moments + 1 edition + assets          │
│  ├─ Storage: see-earth-alpha-assets bucket                        │
│  └─ Connection: postgresql://postgres:[password]@...              │
└──────────────────────────────────────────────────────────────────┘
```

---

## 2. 用户操作清单（5 步 · 60 分钟）

### Step 1 · 创建 Supabase Project（10 分钟）

**用户操作**：

```text
1. 打开 https://supabase.com → 登录
2. New Project → 填写：
     Name: sethearth-alpha
     Database Password: <random 32-char>（用密码管理器保存）
     Region: us-east-1（N. Virginia · 离 Vercel 默认 region 近）
     Plan: Free
3. 点击 "Create new project"
4. 等待 90 秒 · project ready
5. Settings → API → 复制以下 3 个值到密码管理器：
     - Project URL: https://xxxxxxxxxxxxx.supabase.co
     - anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...（Phase 1 不使用）
     - service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...（后端用）
6. Settings → Database → Connection String → Transaction mode → 复制：
     - DATABASE_URL: postgresql://postgres.[ref]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**验证**：

- ✅ Supabase Dashboard → Table Editor → 应为空
- ✅ SQL Editor → 运行 `SELECT NOW();` → 返回当前时间

---

### Step 2 · 创建 Git Branches（2 分钟）

**用户操作**：

```bash
cd "/Users/lwy/Documents/ChatGPT/看见地球"
git fetch origin
git checkout -b alpha origin/main
git push -u origin alpha

git checkout -b alpha-api origin/main
git push -u origin alpha-api
```

**验证**：

- ✅ GitHub Repo → branches 列表显示 `alpha` + `alpha-api` 两条新分支

---

### Step 3 · 创建 Storage Bucket（5 分钟）

**用户操作**（Supabase SQL Editor）：

```sql
-- 在 Supabase SQL Editor 执行（需 service_role 权限）
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'see-earth-alpha-assets',
  'see-earth-alpha-assets',
  false,
  20971520,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 验证
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id = 'see-earth-alpha-assets';
-- 预期：1 行 · public=false · file_size_limit=20971520

-- 设置 RLS（拒绝 anon/authenticated 直接访问）
CREATE POLICY "Service role full access on see-earth-alpha-assets"
  ON storage.objects
  FOR ALL
  TO service_role
  USING (bucket_id = 'see-earth-alpha-assets');
-- （默认无 anon policy = anon 拒绝）
```

**验证**：

- ✅ Supabase Dashboard → Storage → 应看到 `see-earth-alpha-assets` bucket
- ✅ Bucket 详情：`Public: false` · `File size limit: 20MB` · `Allowed MIME: jpeg, png, webp`

---

### Step 4 · Vercel Preview Domain 配置（10 分钟）

**用户操作**：

```text
1. 登录 Vercel Dashboard → sethearth project
2. Settings → Domains → Add Domain
3. 输入 alpha-see-earth.vercel.app
4. Assign to: Production branch = "alpha"（仅 alpha 分支 deploy 用此域名）
5. Save · 等待 DNS 生效（30 秒 - 5 分钟）
6. 重复 Step 2-5：
   - 输入 alpha-api-see-earth.vercel.app
   - Assign to: Production branch = "alpha-api"
7. （可选）添加 preview-see-earth.vercel.app 作为通用 preview 域名
```

**验证**：

- ✅ Vercel Dashboard → Domains → 看到 2 个新 domain · 状态 "Valid Configuration"
- ✅ `https://alpha-see-earth.vercel.app/` 首次访问可能显示 Vercel 默认页面（部署尚未触发）

---

### Step 5 · Vercel Preview Environment Variables（20 分钟）

**用户操作**：

#### 5.1 Frontend (alpha 分支) Environment Variables

```text
Vercel Dashboard → sethearth project → Settings → Environment Variables

点击 "Add" 逐项添加（勾选 "Preview"，**不**勾选 "Production"）：

| Variable | Value | Environment |
|---|---|---|
| VITE_ENV | alpha | Preview |
| VITE_API_BASE_URL | https://alpha-api-see-earth.vercel.app/v1 | Preview |
| VITE_USE_MOCK_API | false | Preview |

保存。
```

#### 5.2 Backend (alpha-api 分支) Environment Variables

```text
| Variable | Value | Environment |
|---|---|---|
| SUPABASE_URL | https://xxxxxxxxxxxxx.supabase.co | Preview |
| SUPABASE_SERVICE_ROLE_KEY | eyJhbGc...（service_role key） | Preview |
| DATABASE_URL | postgresql://postgres.[ref]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres | Preview |
| RATE_LIMIT_PER_MIN | 100 | Preview |
| CORS_ALLOWED_ORIGINS | alpha-see-earth.vercel.app,*.vercel.app | Preview |
| LOG_LEVEL | info | Preview |
| STORAGE_BUCKET | see-earth-alpha-assets | Preview |
| SIGNED_URL_TTL_SECONDS | 600 | Preview |
| WITNESS_SESSION_TTL_DAYS | 90 | Preview |
| MAX_UPLOAD_BYTES | 20971520 | Preview |
| IMAGE_VARIANT_SIZES | 320,640,1280 | Preview |
| REQUEST_ID_HEADER | x-request-id | Preview |

保存。
```

**验证**：

- ✅ Vercel Dashboard → Settings → Environment Variables → Preview tab → 看到 15 个变量
- ✅ Production tab 应为空（**Production 不污染**）

---

## 3. 触发首次部署

### 3.1 Frontend Deploy

```bash
# alpha 分支已推送（Step 2）
# Vercel 自动检测 alpha 分支 → 触发 Preview deployment
# 等待 1-3 分钟

# 验证
open "https://alpha-see-earth.vercel.app/"
# 预期：Vite SPA 首页 · Alpha Banner 显示 · 6 cities grid
```

### 3.2 Backend Deploy

```bash
# alpha-api 分支已推送（Step 2）
# Vercel 自动检测 alpha-api 分支 → 触发 Preview deployment
# 等待 1-3 分钟

# 验证
curl https://alpha-api-see-earth.vercel.app/v1/healthz
# 预期：
# {"status":"ok","version":"1.0.0","phase":"phase1","timestamp":"...","request_id":"..."}
```

### 3.3 数据库 Migration（关键）

**选项 A · Vercel Build Command 集成（自动）**：

```json
// api/package.json
{
  "scripts": {
    "build": "drizzle-kit migrate && next build"
  }
}
```

每次 Vercel 部署自动跑 migration。

**选项 B · 手动 migration（更可控）**：

```bash
# 本地（用户本地有 DATABASE_URL）
cd api
DATABASE_URL="postgresql://..." pnpm drizzle-kit migrate
```

**Phase 1 推荐选项 A**（自动化 + Vercel build 日志可追踪）。

**验证**：

```sql
-- Supabase SQL Editor
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
-- 预期：assets, cities, editions, moments, witness_submissions（5 表 · 无 echoes）

SELECT COUNT(*) FROM cities;
-- 预期：0（migration 完成 · seed 尚未跑）

SELECT typname FROM pg_type WHERE typtype = 'e' ORDER BY typname;
-- 预期：~20 个 enum
```

---

## 4. Seed 数据导入（5 分钟）

### 4.1 用户操作（Vercel 后端控制台或本地脚本）

**选项 A · Vercel Function 触发**：

```bash
curl -X POST https://alpha-api-see-earth.vercel.app/v1/admin/seed \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"environment": "alpha", "seed_version": "1.0.0"}'
```

（Phase 1 不实现 admin endpoint · 走选项 B）

**选项 B · 本地脚本（推荐 · Phase 1）**：

```bash
cd api
DATABASE_URL="postgresql://..." pnpm tsx scripts/seed-phase1.ts
```

**预期 log**：

```text
[seed] connecting to Supabase Postgres...
[seed] inserting 12 cities...
[seed] ✓ cities inserted
[seed] inserting 6 moments...
[seed] ✓ moments inserted
[seed] generating today edition (12 slots)...
[seed] ✓ edition inserted (id=..., date=2026-08-22)
[seed] uploading 5 photo assets...
[seed] ✓ assets uploaded + variants generated
[seed] complete · 12 cities / 6 moments / 1 edition / 5 assets
```

**验证**：

```bash
curl https://alpha-api-see-earth.vercel.app/v1/cities | jq '.data | length'
# 预期：12

curl https://alpha-api-see-earth.vercel.app/v1/cities/kyoto | jq '.data.timezone'
# 预期："Asia/Tokyo"

curl https://alpha-api-see-earth.vercel.app/v1/editions/today | jq '.data.slots | length'
# 预期：12
```

---

## 5. 部署验证清单

### 5.1 Frontend 验证

| 验证项 | URL / 操作 | 预期结果 | 状态 |
|---|---|---|---|
| Alpha Banner 显示 | `https://alpha-see-earth.vercel.app/` | 顶部红/橙 banner "Alpha Environment" | ⏳ 待部署 |
| Daily 12 加载 | 首页滚到 "Six cities" | 6 张城市卡显示（API 调用） | ⏳ |
| CityPage 加载 | 点击 Kyoto 卡 → `/cities/kyoto` | 京都页面 + 1 张 Hero 图 | ⏳ |
| Loading 状态 | 硬刷新页面 | 0.2s 内 skeleton 占位 | ⏳ |
| Error 状态 | 关闭 network → 刷新 | "远方暂时连不上" + 重试按钮 | ⏳ |
| Echo UI 禁用 | 滚到 CityPage 屏 04 | "Echo 暂未开放" + 灰 textarea | ⏳ |

### 5.2 Backend 验证

| 验证项 | curl / 操作 | 预期结果 | 状态 |
|---|---|---|---|
| /healthz | `curl .../v1/healthz` | 200 + status=ok | ⏳ 待部署 |
| /cities list | `curl .../v1/cities` | 200 + 12 cities | ⏳ |
| /cities/kyoto | `curl .../v1/cities/kyoto` | 200 + timezone="Asia/Tokyo" | ⏳ |
| /cities/kyoto/moments | `curl .../v1/cities/kyoto/moments` | 200 + moments array | ⏳ |
| /moments/{id} | `curl .../v1/moments/<seed-uuid>` | 200 + moment data | ⏳ |
| /editions/today | `curl .../v1/editions/today` | 200 + 12 slots | ⏳ |
| /editions | `curl .../v1/editions` | 200 + editions array | ⏳ |
| CORS preflight | `curl -X OPTIONS -H "Origin: https://alpha-see-earth.vercel.app" .../v1/cities` | 204 + Access-Control-* headers | ⏳ |
| Rate limit | `for i in {1..101}; do curl .../v1/cities; done` | 第 101 个 429 | ⏳ |
| Privacy gate | 任何 endpoint | 不含 lat/lng | ⏳ |

### 5.3 Database 验证

| 验证项 | SQL | 预期 | 状态 |
|---|---|---|---|
| Table count | `SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public'` | 5 | ⏳ |
| Enum count | `SELECT COUNT(*) FROM pg_type WHERE typtype='e'` | ~20 | ⏳ |
| City count | `SELECT COUNT(*) FROM cities WHERE deleted_at IS NULL` | 12 | ⏳ |
| Moment count | `SELECT COUNT(*) FROM moments WHERE deleted_at IS NULL` | 6 | ⏳ |
| Edition today | `SELECT id, date FROM editions WHERE date = CURRENT_DATE AND status = 'published'` | 1 row | ⏳ |
| Witness sub count | `SELECT COUNT(*) FROM witness_submissions` | 0 (Phase 1) | ⏳ |
| No echoes table | `SELECT table_name FROM information_schema.tables WHERE table_name = 'echoes'` | 0 rows | ⏳ |

### 5.4 Storage 验证

| 验证项 | 操作 | 预期 | 状态 |
|---|---|---|---|
| Bucket exists | Supabase Dashboard → Storage | 看到 `see-earth-alpha-assets` | ⏳ |
| Bucket private | Bucket settings | Public: false | ⏳ |
| Seed assets | `SELECT storage_path_original FROM assets LIMIT 5` | 5 paths | ⏳ |
| EXIF GPS stripped | smoke test §6 (privacy gate) | 0 lat/lng EXIF | ⏳ |

---

## 6. 部署 URL 列表（待填写）

> **注**：URL 在用户完成 Step 4 配置后才能确定；本节为占位

### Frontend

| URL | 用途 | 状态 |
|---|---|---|
| `https://alpha-see-earth.vercel.app/` | 主入口（Phase 1 Alpha） | ⏳ 待用户配置 |
| `https://alpha-see-earth.vercel.app/cities/kyoto` | CityPage 示例 | ⏳ |
| `https://alpha-see-earth.vercel.app/cities/lisbon` | CityPage 示例 | ⏳ |
| `https://alpha-see-earth.vercel.app/moments/<id>` | Moment Detail 示例 | ⏳ |
| `https://alpha-see-earth.vercel.app/unknown` | Unknown Coordinate | ⏳ |
| `https://alpha-see-earth.vercel.app/about` | About | ⏳ |
| `https://alpha-see-earth.vercel.app/privacy` | Privacy | ⏳ |

**Vercel 自动生成的 Preview URL（无需额外配置 · 备选）**：

- `https://setheearth-git-alpha-lwy0330.vercel.app/`
- `https://setheearth-git-alpha-api-lwy0330.vercel.app/`

### Backend

| URL | 用途 | 状态 |
|---|---|---|
| `https://alpha-api-see-earth.vercel.app/v1/healthz` | Health check | ⏳ 待用户配置 |
| `https://alpha-api-see-earth.vercel.app/v1/cities` | Cities list | ⏳ |
| `https://alpha-api-see-earth.vercel.app/v1/cities/{slug}` | City detail | ⏳ |
| `https://alpha-api-see-earth.vercel.app/v1/cities/{slug}/moments` | City moments | ⏳ |
| `https://alpha-api-see-earth.vercel.app/v1/moments/{id}` | Moment detail | ⏳ |
| `https://alpha-api-see-earth.vercel.app/v1/editions/today` | Today edition | ⏳ |
| `https://alpha-api-see-earth.vercel.app/v1/editions/{id}` | Edition detail | ⏳ |
| `https://alpha-api-see-earth.vercel.app/v1/editions` | Editions history | ⏳ |

---

## 7. Vercel Build 日志（Phase 1 期望）

### 7.1 Frontend Build

```text
[Vercel] Cloning github.com/lwy0330/sethearth (branch: alpha)
[Vercel] Installing dependencies...
pnpm install
  Lockfile is up to date
  Resolution step is skipped
  ...
  Done in 12s
[Vercel] Running build...
pnpm build
  > tsc -b && vite build
  vite v5.4.0 building for production...
  ✓ 1245 modules transformed
  dist/index.html                   0.45 kB
  dist/assets/index-[hash].css     12.34 kB
  dist/assets/index-[hash].js     245.67 kB
  ✓ built in 8.2s
[Vercel] Build complete · uploaded to CDN
[Vercel] Preview deployment: https://setheearth-git-alpha-[hash]-lwy0330.vercel.app
[Vercel] Alias: https://alpha-see-earth.vercel.app
[Vercel] ✓ Deployment ready
```

### 7.2 Backend Build

```text
[Vercel] Cloning github.com/lwy0330/sethearth (branch: alpha-api)
[Vercel] Installing dependencies (api/)...
[Vercel] Running migrations...
> drizzle-kit migrate
  Applying migration 0000_init.sql...
  ✓ Tables created: assets, cities, editions, moments, witness_submissions
  ✓ Enums created: 20
  ✓ Indexes created: 15
[Vercel] Running build (api/)...
> next build
  Creating an optimized production build...
  ✓ Compiled successfully
  Linting and checking validity of types...
  ✓ Linting and checking validity of types
  Collecting page data...
  ✓ Collecting page data
  Generating static pages (0/12)...
  ✓ Generating static pages (12/12)
  Finalizing page optimization...
  ✓ Finalizing page optimization

Route (app)                              Size     First Load JS
┌ ƒ /v1/healthz                          0 B              0 B
├ ƒ /v1/cities                           0 B              0 B
├ ƒ /v1/cities/[cityIdOrSlug]            0 B              0 B
├ ƒ /v1/cities/[cityIdOrSlug]/moments    0 B              0 B
├ ƒ /v1/moments/[momentId]               0 B              0 B
├ ƒ /v1/editions/today                   0 B              0 B
├ ƒ /v1/editions                         0 B              0 B
└ ƒ /v1/editions/[editionId]             0 B              0 B
[Vercel] ✓ Build complete
[Vercel] Preview deployment: https://setheearth-git-alpha-api-[hash]-lwy0330.vercel.app
[Vercel] Alias: https://alpha-api-see-earth.vercel.app
```

---

## 8. Phase 1 不实现（明确排除）

| 项 | Phase | 备注 |
|---|---|---|
| Production 部署 | Phase 3 | Phase 1 不触碰 Production |
| Production alias 修复 | Phase 3+ | Round 2A 文档记录 · 与 E-P0-02 无关 |
| Cloudflare Access | Phase 2 | Phase 1 用 Vercel 原生 auth（可选） |
| Custom domain（see-earth.app） | 不做 | Phase 1 用 vercel.app 子域 |

---

## 9. Blockers（详见 `phase1-blockers-v1.md`）

**Phase 1 部署完整 blocker 列表**：

1. ⏳ 用户手动创建 Supabase project（Step 1）· 必填
2. ⏳ 用户手动创建 git branches（Step 2）· 必填
3. ⏳ 用户手动创建 Storage bucket（Step 3）· 必填
4. ⏳ 用户手动配置 Vercel Preview Domain（Step 4）· 必填
5. ⏳ 用户手动配置 15 个 Environment Variables（Step 5）· 必填
6. ⏳ Seed 数据导入（Step 4.1）· 必填

**用户总投入**：约 60 分钟（不包含 Vercel build 时间）

---

## 10. 元数据

| 字段 | 值 |
|---|---|
| 文档版本 | v1 |
| 创建时间 | 2026-08-22 |
| 创建人 | Engineer Agent (Round 2B) |
| 文档 ID | `alpha-deployment-evidence-v1.md` |
| 目标 Gate | Gate A · Internal Alpha · Phase 1 |
| 决策状态 | ✅ ACCEPTED（待用户执行 + PM 评审） |
| Workspace 路径 | `/Users/lwy/Documents/ChatGPT/看见地球/release-v1/vertical-slice-phase1/alpha-deployment-evidence-v1.md` |
| Obsidian canonical 路径 | `/Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/vertical-slice-phase1/alpha-deployment-evidence-v1.md` |
| Obsidian 同步状态 | ❌ 未同步（sandbox 拒绝写入 Obsidian） |

---

**End of alpha-deployment-evidence-v1.md**