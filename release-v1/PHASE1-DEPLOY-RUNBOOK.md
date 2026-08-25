---
type: deploy-runbook
tags: [deploy, runbook, alpha, see-earth-v1, phase-1]
created: 2026-08-25
status: ✅ ACTIVE · 接管 PM Agent (round-5 后)
audience: 下一位 PM Agent + 用户 (小白友好 · 可粘贴执行)
related_docs:
  - release-v1/e-p0-03-phase1-1-db-schema/supabase/README.md
  - release-v1/e-p0-03-phase1-1-db-schema/supabase/migrations/0000_init_core.sql (NEW)
  - release-v1/e-p0-03-phase1-1-db-schema/supabase/migrations/0001_init.sql
  - release-v1/e-p0-06-daily-12-code/migrations/0002_editions.sql
  - release-v1/e-p0-03-phase1-1-db-schema/supabase/seed-test.sql
  - 06-PM Agent 交接/2026-08-25-pm-handoff-round5-v1.md (round-5 完整 handoff)
warning: ⚠️ 本文是 round-5 后接管 PM Agent 重建的 runbook · 上一 PM 没留
---

# SEE EARTH V1 · Phase 1 部署 Runbook · Alpha 环境

> **作者**: 接管 PM Agent (round-5 后)
> **创建时间**: 2026-08-25 10:30 (接管后 30 分钟内重建)
> **场景**: V1 后端已 push 到 `alpha` 分支 (commit `60c47cb`), Vercel 部署 Ready, 但 Supabase 3 段 SQL 还没跑
> **目标读者**: 下一位 PM Agent + 用户 (技术小白)
> **风险等级**: 🟢 低 · 所有 SQL 幂等 (`CREATE ... IF NOT EXISTS` / `INSERT ... ON CONFLICT DO NOTHING`)

---

## 📋 一句话结论

**部署到 100% 完成需 4 段 SQL (0000 → 0001 → 0002 → seed) + 2 项 Vercel 验收 + 1 项 Sentry 验证。预计 30 分钟。**

---

## 📊 当前真实状态 (round-5 接管时盘点)

| # | 组件 | 状态 | 备注 |
|---|---|---|---|
| 1 | Vercel `60c47cb` 部署 | ✅ **Ready** | fix commit · src/lib/analytics/ 已含 |
| 2 | Vercel `f6b73d8` 部署 | ❌ Error 8s | 已修复 (因 src/lib/analytics/ 漏 add) |
| 3 | Sentry alpha project | 🟡 Demo issue | 真实错误待触发 (页面刚 Ready) |
| 4 | Supabase `sethearth-alpha` | 🟢 Healthy | **0 段 migration 已跑** (Dashboard "No migrations") |
| 5 | `src/lib/analytics/sentry-client.ts` | ✅ 已 commit | 上一 PM 漏 add 进 f6b73d8 · 已修 |
| 6 | 6 Vercel env vars | ✅ 已配 | SUPABASE_URL / ANON_KEY / SERVICE_ROLE / DIRECT_URL / VITE_SENTRY_DSN / VITE_ENV |
| 7 | GitHub `LWY0330/SeTheEarth` alpha 分支 | ✅ 最新 = `60c47cb` |  |

---

## 🚨 上一 PM 走前未解决的 5 项关键问题 (round-5 接管者发现)

### 问题 1 · Vercel build error 根因 (已修 ✅)

**症状**: `f6b73d8 feat(round-5): V1 backend ready for deployment` 部署 → **Error 8s** (8 秒就挂)

**根因** (Vercel build log 原文):
```
src/main.tsx(7,28): error TS2307: Cannot find module './lib/analytics/sentry-client'
or its corresponding type declarations.
Error: Command "npm run build" exited with 2
```

**为何发生**:
- 上一 PM 在 09:53:55 给用户的 commit 命令只 add 了:
  ```
  git add package-lock.json package.json src/main.tsx
  git add release-v1/e-p0-03-phase1-1-db-schema/
  git add release-v1/e-p0-06-daily-12-code/
  git add release-v1/e-p0-10-monitoring-phase1/
  git add release-v1/e-p0-03-witness-backend/
  git add release-v1/e-p0-04-captured-at/
  git add release-v1/e-p0-05-location-isolation/
  git add release-v1/e-p0-06-daily-12-supply-chain/
  git add release-v1/e-p0-10-monitoring/
  ```
- **完全漏了 `src/lib/analytics/`** (7 文件 · 26 KB · E-P0-10 Sentry 客户端核心)
- 本地 `pnpm run build` 能成功 (因为文件在工作区文件系统存在)
- Vercel clone 仓库只取 git tracked 内容 → 文件不在 → TS2307 → 8s error

**修复** (`60c47cb` 已含):
```bash
cd "/Users/lwy/Documents/ChatGPT/看见地球"
git add src/lib/analytics/
git commit -m "fix(round-5): include src/lib/analytics/ (PM commit omission in f6b73d8)"
git push origin alpha
```
✅ 用户已执行 · Vercel `60c47cb` Ready

### 问题 2 · 缺少 cities / moments 表 DDL (待修 ⚠️)

**症状**: 按上一 PM 4 步计划, 第 3 步跑 `seed-test.sql` 会立即报:
```
ERROR: relation "cities" does not exist
```

**根因**:
- `0001_init.sql` (E-P0-03) 创建 witness backend 5 表 (含 assets / witness_submissions / private_locations / moderation_log / rate_limit_buckets) — **不含 cities / moments**
- `0002_editions.sql` (E-P0-06) 创建 editions 4 表 — **不含 cities / moments**
- `seed-test.sql` **INSERT INTO cities / moments** — 但基表不存在
- `release-v1/vertical-slice-phase1/db-schema-v1.md §2.6` 有 cities/moments 完整 DDL — **但只是文档, 没有 SQL 文件**

**修复** (本文档内创建): `release-v1/e-p0-03-phase1-1-db-schema/supabase/migrations/0000_init_core.sql` (NEW · 接管 PM Agent 创建)

### 问题 3 · `api/` 目录孤儿代码 (无影响 · 标注 ⚠️)

**现状**: `api/` 目录只有 1 个文件 `api/_lib/sentry-server.ts`, 没有 `package.json` / `next.config.js` / `tsconfig.json`

**为何不影响**:
- `tsconfig.json` 只 include `["src"]`, TypeScript 不解析 `api/`
- `api/_lib/sentry-server.ts` 是 Phase 2 才启用的 stub (注释明确说明)
- Vercel 在 `npm run build` 阶段失败前, 不会触发 monorepo detection

**何时需要修**: Phase 2 启用 `api/` 作为独立 Next.js 服务时, 必须添加:
- `api/package.json` (含 `next` 依赖)
- `api/tsconfig.json`
- `api/next.config.js`

**不阻塞 Phase 1**, 留给下一轮。

### 问题 4 · 6 个 env vars 但 `api/` 未独立配 (无影响 · 标注 ⚠️)

**现状**: Vercel 项目 `setheearth` 配了 6 个 env vars 在 alpha 分支 (前端用)

**缺什么**:
- `alpha-api` 分支 (后端 Next.js) 尚未独立配 env vars
- 但 alpha-api 分支还没部署 (Phase 2 才需要)
- VITE_* 前缀的 env vars 也不会传给后端 (Next.js 运行时用 process.env.*)

**何时需要修**: Phase 2 部署 alpha-api 分支时, 需要给后端单独配:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (后端特有)
- `DIRECT_URL`
- `SENTRY_DSN` (不带 VITE_ 前缀)
- `NODE_ENV`

**不阻塞 Phase 1**。

### 问题 5 · vertical-slice vs 0001 schema 双轨制 (技术债 · 登记)

**症状**:
- `release-v1/vertical-slice-phase1/db-schema-v1.md §2.6` 定义 5 张 Phase 1 表 (cities/moments/editions/assets/witness_submissions), 字段含 `latitude` / `longitude` / `name_canonical` / `hero_media_url` 等
- `0001_init.sql` 实际只创建 witness backend 5 表, 字段与 vertical-slice 不一致
- `seed-test.sql` 字段也对不上 vertical-slice (如 `country_zh` vs `country_name_zh`)

**决策 (接管 PM 拍板)**:
- 以 `0000_init_core.sql` + `0001_init.sql` + `seed-test.sql` 为 **Phase 1 实际 source of truth**
- `vertical-slice-phase1/db-schema-v1.md` 标注 "Phase 1 蓝图 · 实际未实施 · 见 Phase 2 升级计划"
- Phase 2 才考虑 schema 升级 (v1.1+ 数据模型)

**不阻塞 Phase 1**。

---

## 🎯 Phase 1 完成 = 4 段 SQL + 2 项 Vercel 验收 + 1 项 Sentry 验证

### 总览时间线

```text
T+0  ┌─ 在 Supabase SQL Editor 跑 0000_init_core.sql (cities + moments DDL)
T+5  ├─ 跑 0001_init.sql (witness backend 5 表 + RLS + cron + GRANT)
T+10 ├─ 跑 0002_editions.sql (editions 4 表 + 触发器)
T+15 ├─ 跑 seed-test.sql (12 城 + 18 moments + 5 assets + ...)
T+20 ├─ 验证 Vercel deployment URL 加载成功
T+25 ├─ 触发测试错误 → 验证 Sentry alpha project 收到
T+30 └─ 完成 · 交接下一位 PM Agent
```

---

## 📜 段 1 · 0000_init_core.sql (NEW · 接管 PM 创建)

**目的**: 创建 cities + moments 基表 (seed 必需)

**文件路径**: `release-v1/e-p0-03-phase1-1-db-schema/supabase/migrations/0000_init_core.sql`

**包含**:
- 2 表 (cities · moments)
- 3 索引 (cities.slug · cities.layer · moments.city_captured_at)
- 2 触发器 (updated_at 自动)
- GRANT (service_role 全权)

**如何跑** (小白步骤):

1. 打开 https://supabase.com/dashboard/project/pyabuenednjbwshfayaa/sql
2. 点击 **「New query」** 按钮 (左上角)
3. 在编辑器里粘贴 `0000_init_core.sql` 全文 (182 行)
4. 点击右下角 **「Run」** 按钮 (或按 Ctrl+Enter / Cmd+Enter)
5. 等待执行完成 (应 < 3 秒)

**验证** (在 SQL Editor 跑这段):

```sql
-- 应返回 2 行: cities, moments
SELECT tablename FROM pg_tables
WHERE schemaname = 'public' AND tablename IN ('cities','moments')
ORDER BY tablename;

-- 应返回 3 (slug + layer + page_state)
SELECT COUNT(*) FROM pg_indexes
WHERE schemaname = 'public' AND tablename = 'cities';

-- 应返回 4 (city_captured_at + source_type + moderation_status + published_at)
SELECT COUNT(*) FROM pg_indexes
WHERE schemaname = 'public' AND tablename = 'moments';

-- 应返回 2 (cities_set_updated_at + moments_set_updated_at)
SELECT trigger_name FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name IN ('cities_set_updated_at','moments_set_updated_at')
ORDER BY trigger_name;
```

**预期**: 4 个查询全部通过

**回滚** (如果失败):

```sql
DROP TRIGGER IF EXISTS cities_set_updated_at ON cities;
DROP TRIGGER IF EXISTS moments_set_updated_at ON moments;
DROP FUNCTION IF EXISTS trg_set_updated_at();
DROP TABLE IF EXISTS moments CASCADE;
DROP TABLE IF EXISTS cities CASCADE;
```

---

## 📜 段 2 · 0001_init.sql (已有 · E-P0-03 Phase 1.1)

**目的**: 创建 witness backend 5 表 + 15 索引 + 5 触发器 + 20 RLS 策略 + 4 pg_cron jobs + 7 角色 GRANT

**文件路径**: `release-v1/e-p0-03-phase1-1-db-schema/supabase/migrations/0001_init.sql`

**包含**:
- assets / witness_submissions / private_locations / moderation_log / rate_limit_buckets
- 15 索引 + 5 触发器 + 20 RLS + 4 pg_cron + 7 角色

**如何跑** (同段 1 操作):

1. SQL Editor → New query
2. 粘贴 `0001_init.sql` 全文 (785 行)
3. Run

**验证**:

```sql
-- 应返回 5 行 (assets, moderation_log, private_locations, rate_limit_buckets, witness_submissions)
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('witness_submissions','private_locations','assets',
                    'moderation_log','rate_limit_buckets')
ORDER BY tablename;

-- 应返回 4 行 (witness-cleanup-drafts/precise-locations/rate-buckets/purged-assets)
SELECT jobname FROM cron.job
WHERE jobname LIKE 'witness-cleanup%'
ORDER BY jobname;

-- 应至少 20 行 (5 表 × 平均 4 策略)
SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public';

-- 应返回 7 行 (5+1 + service_role)
SELECT rolname FROM pg_roles
WHERE rolname IN ('anon','authenticated','witness','moderator',
                  'admin','system','service_role')
ORDER BY rolname;
```

**回滚**: 见 README.md §回滚 SOP (本文不重复)

---

## 📜 段 3 · 0002_editions.sql (已有 · E-P0-06)

**目的**: 创建 editions 4 表 + 5 索引 + 3 触发器

**文件路径**: `release-v1/e-p0-06-daily-12-code/migrations/0002_editions.sql`

**包含**:
- editions / edition_slots / edition_status_history / edition_audit_log
- 5 索引 + 3 触发器

**如何跑**: 同上 (New query + 粘贴 + Run)

**验证**:

```sql
-- 应返回 4 行
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('editions','edition_slots',
                    'edition_status_history','edition_audit_log')
ORDER BY tablename;

-- 应返回 3 (slot_sync + slots_count + status_history)
SELECT trigger_name FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND event_object_table LIKE 'edition%'
ORDER BY trigger_name;
```

---

## 📜 段 4 · seed-test.sql (已有 · Alpha 测试数据)

**目的**: 插入 12 cities + 18 moments + 12 live_events + 5 assets + 3 witness_submissions + 2 private_locations + 3 moderation_log + 3 rate_limit_buckets

**文件路径**: `release-v1/e-p0-03-phase1-1-db-schema/supabase/seed-test.sql`

**如何跑**: 同上 (New query + 粘贴 + Run, 注意 SELECT LOCAL ROLE service_role; 已在文件内)

**验证** (期望所有数字匹配):

```sql
SELECT
  (SELECT COUNT(*) FROM cities)                    AS cities,
  (SELECT COUNT(*) FROM moments)                   AS moments,
  (SELECT COUNT(*) FROM assets)                    AS assets,
  (SELECT COUNT(*) FROM witness_submissions)       AS submissions,
  (SELECT COUNT(*) FROM private_locations)         AS priv_locs,
  (SELECT COUNT(*) FROM moderation_log)            AS mod_logs,
  (SELECT COUNT(*) FROM rate_limit_buckets)        AS rate_buckets,
  (SELECT COUNT(*) FROM editions)                  AS editions,
  (SELECT COUNT(*) FROM edition_slots)             AS edition_slots;
```

**预期**:
```
cities: 12
moments: 18
assets: 5
submissions: 3
priv_locs: 2
mod_logs: 3
rate_buckets: 3
editions: 0  (注: 0002_editions 不带 seed 数据, 后续 daily-build.ts 生成)
edition_slots: 0
```

---

## ✅ Vercel 验收 (清单上第 1 项)

**V1**: 打开 https://alpha-see-earth.vercel.app (或 Vercel Dashboard 显示的实际 Preview URL)

**预期**:
- [ ] 首页加载成功 (HTTP 200 · 不在 Vercel 错误页)
- [ ] 看到 EarthGlobe + WorldTimeRail + 7 城 nav (top nav 已修 per `792bc61`)
- [ ] 打开 DevTools → Console 无红色 error
- [ ] 打开 DevTools → Network → 看到 `index-DyEUa5Sy.js` (304 KB) + `index-D4TOtLaj.css` (60 KB) 加载成功

**V2**: Vercel Dashboard → Deployments → 找最新 commit `60c47cb` deployment

**预期**:
- [ ] 状态 `Ready` (非 Error)
- [ ] Build log 完整: `tsc -b && vite build` 通过 (无 TS2307)
- [ ] Functions / Routes 列表正常

---

## ✅ Sentry 验证 (清单上第 2 项)

**步骤**:

1. 打开 Vercel Preview URL (V1 验证用同一个 URL)
2. 在浏览器 Console 粘贴执行:
   ```js
   throw new Error('Sentry alpha project test from PM handover 2026-08-25');
   ```
3. 等待 5-10 秒
4. 打开 https://seetheearth.sentry.io/issues/?query=is%3Aunresolved
5. 找新出现的 issue: **"Sentry alpha project test from PM handover 2026-08-25"**
6. 检查 stack trace 第一行应该是 `sentry-client.ts` 相关

**预期**:
- [ ] Sentry 收到 1 条新 issue (非 JAVA-1 示例)
- [ ] 来源标记 `javascript` 或 `browser` (非 `java`)
- [ ] URL 含 alpha URL (例如 `alpha-see-earth.vercel.app`)

**故障排查**: 如果没收到:
- 检查 Vercel env vars 是否含 `VITE_SENTRY_DSN` (确认 Preview 勾选)
- 检查 `src/main.tsx` 第 13 行 `if (import.meta.env.VITE_SENTRY_DSN)` 是否进入
- 检查浏览器 Network → 找到 `sentry.io/api/.../envelope/` 请求是否 200

---

## 🔄 回滚 SOP (整段 SQL 跑挂时)

**场景**: 4 段中任何一段失败, 想从干净状态重跑

**完全清理** (慎用 · 会删除所有数据):

```sql
-- ⚠️ 仅在 alpha 环境 · 不会影响 production

-- 1. 删除 4 个 edition 表
DROP TABLE IF EXISTS edition_audit_log CASCADE;
DROP TABLE IF EXISTS edition_status_history CASCADE;
DROP TABLE IF EXISTS edition_slots CASCADE;
DROP TABLE IF EXISTS editions CASCADE;

-- 2. 删除 5 个 witness backend 表
DROP TABLE IF EXISTS rate_limit_buckets CASCADE;
DROP TABLE IF EXISTS moderation_log CASCADE;
DROP TABLE IF EXISTS private_locations CASCADE;
DROP TABLE IF EXISTS witness_submissions CASCADE;
DROP TABLE IF EXISTS assets CASCADE;

-- 3. 删除 2 个 core 表
DROP TABLE IF EXISTS moments CASCADE;
DROP TABLE IF EXISTS cities CASCADE;

-- 4. 删除 cron jobs (如已创建)
DELETE FROM cron.job WHERE jobname LIKE 'witness-cleanup%';

-- 5. 删除自定义角色 (如已创建)
-- DROP ROLE IF EXISTS witness;
-- DROP ROLE IF EXISTS moderator;
-- DROP ROLE IF EXISTS admin;
-- DROP ROLE IF EXISTS system;
```

**单段重跑** (推荐 · 不影响其他段):

每段 SQL 都是幂等的 (`CREATE TABLE IF NOT EXISTS` / `ON CONFLICT DO NOTHING`), 直接重新执行即可。

---

## 📎 相关文档索引

| 文档 | 路径 | 用途 |
|---|---|---|
| 0000_init_core.sql (NEW) | `release-v1/e-p0-03-phase1-1-db-schema/supabase/migrations/0000_init_core.sql` | cities + moments DDL |
| 0001_init.sql | `release-v1/e-p0-03-phase1-1-db-schema/supabase/migrations/0001_init.sql` | witness backend |
| 0002_editions.sql | `release-v1/e-p0-06-daily-12-code/migrations/0002_editions.sql` | editions |
| seed-test.sql | `release-v1/e-p0-03-phase1-1-db-schema/supabase/seed-test.sql` | 测试数据 |
| Phase 1.1 README | `release-v1/e-p0-03-phase1-1-db-schema/supabase/README.md` | E-P0-03 详细文档 |
| Phase 1 Handoff | `06-PM Agent 交接/2026-08-25-pm-handoff-round5-v1.md` | 接管 PM 的完整 handoff |
| 上轮 handoff | `06-PM Agent 交接/2026-08-18-pm-agent-handoff-complete-status.md` | 上一 PM 走前快照 |
| 上轮 corrections | `06-PM Agent 交接/2026-08-19-pm-handoff-corrections.md` | 上一 PM 校正记录 |

---

## 🎯 下一位 PM Agent 第一周目标

- [ ] 读本 runbook 全文 (10 分钟)
- [ ] 读 handoff `2026-08-25-pm-handoff-round5-v1.md` (20 分钟)
- [ ] 读 0000 / 0001 / 0002 / seed 全部 SQL (15 分钟)
- [ ] 在 Supabase SQL Editor 按段 1→4 跑 (30 分钟)
- [ ] Vercel 验收 + Sentry 验证 (15 分钟)
- [ ] 写完成报告 + 更新 handoff (30 分钟)

总计: ~2 小时

---

**End of runbook · SEE EARTH V1 · 接管 PM Agent · 2026-08-25**