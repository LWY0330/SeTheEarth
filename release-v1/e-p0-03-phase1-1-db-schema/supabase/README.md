# SEE EARTH V1 · Supabase Backend · Phase 1.1 · DB Schema

> **任务卡**: E-P0-03 · Minimal Witness Backend · Phase 1.1
> **完成时间**: 2026-08-24
> **目标**: 在 Supabase Postgres 上创建 Witness 后端的 5 张表 + 15 索引 + 5 触发器 + RLS 策略 + 4 pg_cron jobs + 5+1 角色 GRANT
> **设计来源**: `release-v1/e-p0-03-witness-backend/schema-v1.md §10` · `release-v1/e-p0-05-location-isolation/role-permission-v1.md §2`

---

## 📋 目录结构

```
supabase/
├── README.md                      # 本文件
├── migrations/
│   └── 0001_init.sql              # 单文件 DDL（含 extensions/tables/indexes/triggers/RLS/GRANT/cron）
└── seed-test.sql                  # Alpha 测试数据（12 cities + 6 moments + 12 live + 5 assets + 3 submissions + 2 priv_locs + 3 mod_logs + 3 buckets）
```

---

## 🚀 部署步骤

### 方式 A · 本地 Supabase CLI（推荐 · 适合开发）

#### 1.1 安装 Supabase CLI

```bash
# macOS
brew install supabase/tap/supabase

# npm
npm install -g supabase
```

#### 1.2 初始化项目（如未初始化）

```bash
cd /Users/lwy/Documents/ChatGPT/看见地球
supabase init
```

#### 1.3 启动本地 Postgres

```bash
supabase start
# 输出会包含：API URL · anon key · service_role key · DB URL
```

#### 1.4 应用 migrations

```bash
# 自动检测 supabase/migrations/*.sql 并执行
supabase db reset
# 或单次应用
supabase migration up
```

#### 1.5 导入 seed 数据（仅 Alpha 环境）

```bash
# 通过 Supabase Studio SQL Editor 粘贴执行
# 或 CLI
psql "$(supabase status | grep 'DB URL' | awk '{print $3}')" -f supabase/seed-test.sql
```

---

### 方式 B · 直接 Postgres CLI（无需 Supabase 平台）

#### 2.1 连接任意 Postgres 15+

```bash
# 任意 Postgres 15+ 实例（本地 docker / Neon / RDS）
psql "postgres://user:pass@host:5432/dbname" -f supabase/migrations/0001_init.sql
```

#### 2.2 验证 cron jobs（pg_cron 必须由 Supabase 平台支持）

```sql
-- 本地无 pg_cron 时跳过此步
SELECT * FROM cron.job WHERE jobname LIKE 'witness-cleanup%';
```

---

### 方式 C · Supabase Cloud（生产 / Staging）

#### 3.1 创建 Supabase 项目

```bash
# 通过 Dashboard 创建项目（推荐）
# https://supabase.com/dashboard → New Project
# 选择 region（建议 Singapore / Tokyo 接近中国大陆用户）
# 设置强密码（DB password）
```

#### 3.2 启用 pg_cron 扩展

```sql
-- Supabase SQL Editor 执行
CREATE EXTENSION IF NOT EXISTS pg_cron;
```

#### 3.3 应用 migrations

```bash
# 方法 1：通过 Dashboard SQL Editor 粘贴 0001_init.sql 全部内容并执行
# 方法 2：通过 Supabase CLI 链接到 Cloud 项目
supabase link --project-ref <your-project-ref>
supabase db push
```

#### 3.4 导入 seed 数据（仅 Alpha）

```bash
psql "$(supabase status --linked | grep 'DB URL' | awk '{print $3}')" -f supabase/seed-test.sql
```

---

## ✅ 验证清单

### V1 · 5 表创建验证

```sql
-- 应返回 5 行
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'witness_submissions',
    'private_locations',
    'assets',
    'moderation_log',
    'rate_limit_buckets'
  )
ORDER BY tablename;
```

**预期**: `assets, moderation_log, private_locations, rate_limit_buckets, witness_submissions` (5 rows)

### V2 · 15 索引验证

```sql
SELECT COUNT(*) FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN (
    'witness_submissions', 'private_locations',
    'assets', 'moderation_log', 'rate_limit_buckets'
  );
```

**预期**: `15` (CREATE INDEX 创建 14 + 表级 UNIQUE 约束 1)

### V3 · 5 触发器验证

```sql
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;
```

**预期**: 至少包含以下 5 个：
1. `witness_submissions_updated_at`
2. `witness_submissions_status_log`
3. `witness_submissions_init_history`
4. `assets_updated_at`
5. `assets_enforce_exif_strip`

### V4 · RLS 策略验证（关键）

```sql
-- 应至少 20 条策略（5 表 × 平均 4 策略）
SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public';
```

**关键测试 · anon 完全拒绝 lat/lon**:

```sql
-- 切换到 anon 角色
SET ROLE anon;
-- 设置 witness_id（模拟 anon session）
SET app.witness_id = 'w_hash_seed_alpha_001';

-- 期望返回 0 行（RLS deny）
SELECT COUNT(*) FROM private_locations;
-- 期望: 0

-- 期望返回 1 行（own witness_id）
SELECT COUNT(*) FROM witness_submissions
WHERE witness_id = 'w_hash_seed_alpha_001';
-- 期望: 1

-- 切回 superuser
RESET ROLE;
```

### V5 · 4 pg_cron jobs 验证

```sql
SELECT jobname, schedule, active FROM cron.job
WHERE jobname LIKE 'witness-cleanup%'
ORDER BY jobname;
```

**预期**: 4 行：
1. `witness-cleanup-drafts` (`*/15 * * * *`)
2. `witness-cleanup-precise-locations` (`0 3 * * *`)
3. `witness-cleanup-rate-buckets` (`0 * * * *`)
4. `witness-cleanup-purged-assets` (`0 4 * * *`)

### V6 · 5+1 角色 GRANT 验证

```sql
SELECT rolname FROM pg_roles
WHERE rolname IN ('anon', 'authenticated', 'witness', 'moderator', 'admin', 'system', 'service_role')
ORDER BY rolname;
```

**预期**: 7 行（Supabase 默认 anon/authenticated/service_role + 自建 witness/moderator/admin/system）

### V7 · 触发器强制 exif_stripped 验证

```sql
-- 期望: ERROR · asset status=ready but exif_stripped=false
UPDATE assets
SET status = 'ready', exif_stripped = false
WHERE status = 'uploaded'
LIMIT 1;
```

### V8 · 触发器自动 status_history 验证

```sql
-- 应自动追加 transition from=draft to=submitted
UPDATE witness_submissions
SET status = 'submitted', submitted_at = NOW()
WHERE status = 'draft'
  AND client_key = 'seed_alpha_003_draft_jkl012345mno'
RETURNING status_history;
```

**预期**: `status_history` JSONB 含 2 条 transition（初始 draft → submitted）

### V9 · moderation_log 不可变验证

```sql
-- 期望: 0 rows affected（RULE 阻止）
UPDATE moderation_log SET action = 'hacked' WHERE id = (SELECT id FROM moderation_log LIMIT 1);
-- 期望: 0 rows affected
DELETE FROM moderation_log WHERE id = (SELECT id FROM moderation_log LIMIT 1);
-- 期望: 0 rows affected
```

### V10 · 公共视图不返回 precise 验证

```sql
-- 公共视图不暴露 private_locations 字段（属于强约束）
SELECT column_name FROM information_schema.columns
WHERE table_name = 'public_witness_submissions'
ORDER BY ordinal_position;
```

**预期**: 不包含 `latitude`, `longitude`, `accuracy_meters`, `ip_hash`, `description_text`

---

## ⚠️ 已知问题 / 限制

### 限制 1 · V1 不实施 Sentry

`moderation_log.request_id` 字段已预留（per 决策 14），但 Phase 1.1 不连接 Sentry Cloud。Phase 1.2+ 接入。

### 限制 2 · V1 不实施 OAuth / KMS / 外部加密 key

`private_locations` 表当前用明文 `DECIMAL(9,6)` 存储 lat/lon（seed 数据可见）。生产部署前需：
1. 改列为 `BYTEA` + `pgp_sym_encrypt(value, current_setting('app.encryption_key'))`
2. 应用层通过 `SET LOCAL app.encryption_key = '<from KMS>'` 注入
3. 详见 `data-architecture-v1.md §4.1`

### 限制 3 · `cities` / `moments` 表由 E-P0-02 定义

本 migrations 不创建 `cities` / `moments` 表（DDL 由 E-P0-02 锁定）。seed-test.sql 假设 `cities` / `moments` 表已存在。Supabase 新项目部署顺序：
1. E-P0-02 migrations（含 cities / moments）
2. E-P0-03 migrations（0001_init.sql）
3. seed-test.sql

### 限制 4 · witness / system 角色需在 Supabase 项目首次创建

`moderator / system` 等角色不在 Supabase 默认角色中。0001_init.sql 已用 `DO $$ ... $$` 块做幂等创建。如重命名或预创建，可手动调整。

### 限制 5 · pg_cron 需 Supabase 平台支持

本地 `supabase start` 已含 pg_cron 扩展，但社区 Postgres 可能需手动安装（`apt install postgresql-15-cron`）。

### 限制 6 · seed 数据中的 IP hash 是 dummy 值

`h_ip_seed_001` 等仅作占位符。生产部署用真实 `HMAC-SHA256(IP, WITNESS_IP_HASH_SECRET)` 派生。

---

## 🔗 相关文档

| 文档 | 路径 | 用途 |
|---|---|---|
| Schema 设计 | `release-v1/e-p0-03-witness-backend/schema-v1.md` | 主参考（§10 是 SQL source of truth） |
| Architecture | `release-v1/e-p0-03-witness-backend/architecture-v1.md` | 部署形态 + 组件边界 |
| State Machine | `release-v1/e-p0-03-witness-backend/state-machine-v1.md` | 9 状态机细节 |
| Endpoints | `release-v1/e-p0-03-witness-backend/endpoints-v1.md` | 5 端点规范（Phase 1.2 实施） |
| Error Handling | `release-v1/e-p0-03-witness-backend/error-handling-v1.md` | 30 错误码 |
| Test Plan | `release-v1/e-p0-03-witness-backend/test-plan-v1.md` | 48 测试（Phase 1.2 实施） |
| Implementation Roadmap | `release-v1/e-p0-03-witness-backend/implementation-roadmap-v1.md` | 14.5 人天 / 4 Phase |
| 数据架构 | `release-v1/e-p0-05-location-isolation/data-architecture-v1.md` | 5 边界 + public/private split |
| 角色权限 | `release-v1/e-p0-05-location-isolation/role-permission-v1.md` | 5+1 角色矩阵 |
| 实施报告 | `./phase1-1-deployment-report.md` | 本阶段实施报告 |

---

## 📊 部署统计

| 资源类型 | 数量 |
|---|---|
| Tables | 5 |
| Indexes（含 UNIQUE 约束） | 15 |
| Triggers | 5 |
| Functions（trigger） | 5 |
| Views（public_witness_submissions） | 1 |
| RLS Policies | 20 |
| Rules（moderation_log immutability） | 2 |
| Extensions | 3（pgcrypto · uuid-ossp · pg_cron） |
| Roles | 7（5+1 + service_role） |
| pg_cron jobs | 4 |
| Seed rows | ~46（12 cities + 18 moments + 5 assets + 3 submissions + 2 priv_locs + 3 mod_logs + 3 buckets） |

---

**End of README.md · SEE EARTH V1.0.0 · Phase 1.1 DB Schema**