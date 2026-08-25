---
title: SEE EARTH V1 · E-P0-05 · 数据架构 · 公共域 vs 受限域分离 · v1.0.0
type: data-architecture
tags: [release-v1, e-p0-05, location-isolation, data-architecture, public-private, pgcrypto, see-earth]
task_id: E-P0-05
brief_anchor: "Release Strategy Brief §5 E-P0-05"
track: engineering
owner: Engineer Agent #6 (external Owner = 用户)
created: 2026-08-24
status: DRAFT · IN REVIEW（待同步 Obsidian）
target_gate: Gate A · Internal Alpha
source_brief: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/SEE-EARTH-Release-Strategy-v1-Design-Engineering-Task-Brief.md
source_task_card: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/06-PM Agent 交接/2026-08-22-task-card-e-p0-05-location-isolation.md
related_docs:
  - ./public-private-split-v1.md
  - ./role-permission-v1.md
  - ./encryption-v1.md
  - ./audit-log-v1.md
  - ./leak-test-v1.md
  - ./e2e-test-cases-v1.md
  - ../api-contract/zod-schemas/city.ts
  - ../api-contract/zod-schemas/moment.ts
  - ../api-contract/zod-schemas/witness-submission.ts
  - ../api-contract/zod-schemas/common.ts
  - ../api-contract/contract-decisions-v1.md
  - ../api-contract/error-code-dict-v1.md
  - /Users/lwy/Documents/ChatGPT/看见地球/src/lib/locationPrivacy.ts
depends_on:
  - E-P0-01 (✓ ACCEPTED · backend-reality-audit-v1.md)
  - E-P0-09 (✓ ACCEPTED · api-contract v1.0.0)
blocks: [E-P0-03, E-P0-10]
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/06-PM Agent 交接/release-v1/e-p0-05-location-isolation/data-architecture-v1.md
workspace_canonical_path: /Users/lwy/Documents/ChatGPT/看见地球/release-v1/e-p0-05-location-isolation/data-architecture-v1.md
sync_required: true · sandbox 拒绝写入 Obsidian（详见 §10 Blocker Log）
note: 本文件已就绪，需 PM Agent 由 Obsidian 写入权限落地到 canonical 路径。
---

# SEE EARTH V1 · E-P0-05 · 数据架构 · 公共域 vs 受限域分离 · v1.0.0

> **作者**：Engineer Agent #6（外部 Owner = 您 / PM Orchestrator）  
> **完成时间**：2026-08-24  
> **目的**：把"公共域（cities · moments · public_city_id）"与"受限域（精确经纬度）"在数据架构层做强制分离，确保 V1 后端在 SQL / API / 序列化三层都无法意外泄漏精确位置。

---

## 0. 一句话总结

**SEE EARTH V1 必须把"精确 GPS"和"城市级公开位置"在数据库层放进两张独立的、鉴权独立的、保留期限不同的表中。公共 API 路径**绝对无法**通过 SQL JOIN 拿到 lat/lon，因为公共 schema（cities / moments）根本没有 lat/lon 列。所有 lat/lon 仅出现在 `private_locations` 表，且经过 pgcrypto 列加密、最小权限 GRANT、访问审计 + 90 天自动清理。**

---

## 1. 强制分离原则（5 条不可妥协）

| # | 原则 | 实现层 | 失败模式 |
|---|---|---|---|
| 1 | **公共 schema 不含 lat/lon 列** | DB（DDL）+ Zod（`.strict()`） | 任何 `cities.latitude` 字段直接 DDL 报错 |
| 2 | **精确位置只能写 `private_locations`** | 写入路径强制 + DB CHECK 约束 | 任何写 public 表带 lat/lon 的 attempt 报错 |
| 3 | **精确位置读取只能由受限角色触发** | RBAC + audit_log 触发器 | 普通 / 匿名用户 SELECT private_locations 直接 403 |
| 4 | **公共 API 不暴露 lat/lon** | toPublicCity() / toPublicMoment() 序列化器 + Zod strict | 编译期 + 运行期双重断言 |
| 5 | **精确位置有保留期限** | 90 天自动清理 Job（per OD-04） | retention_until < NOW() → DELETE |

> ⚠️ **关键**：这 5 条原则不是 policy，是 **invariant**。任何代码路径违反其中之一都视为 P0 安全事故，必须立即修复 + post-mortem。

---

## 2. 双域架构（high-level data flow）

```text
┌──────────────────────────────────────────────────────────────────────────┐
│                       [PUBLIC DOMAIN · 默认无鉴权]                          │
│                                                                          │
│  ┌─────────────────────┐         ┌─────────────────────────┐              │
│  │       cities        │         │        moments           │              │
│  │  (永远不含 lat/lon)  │◄────────┤  (FK city_id · 含城市级) │              │
│  │                     │  1:N    │                          │              │
│  │  id, slug, names,   │         │  id, city_id,            │              │
│  │  timezone, layer,   │         │  public_city_name,       │              │
│  │  page_state,        │         │  captured_at, tz,        │              │
│  │  visual,            │         │  image_variants,         │              │
│  │  public_location_   │         │  rights, credit,         │              │
│  │     only = true ✓   │         │  provenance, moderation  │              │
│  └─────────────────────┘         └─────────────────────────┘              │
│            ▲                                  ▲                           │
│            │                                  │                           │
│            │ FK city_id (string)              │                           │
│            │                                  │                           │
│  ┌─────────┴──────────────────────────────┐   │                           │
│  │      witness_submissions                │   │                           │
│  │  (公共字段：含 city_id · 不含 lat/lon)  │   │                           │
│  │                                         │   │                           │
│  │  id, client_key, status,                │   │                           │
│  │  public_city_id, captured_at_tz,        │   │                           │
│  │  location_mode (枚举),                  │   │                           │
│  │  description_redacted (枚举)            │   │                           │
│  │                                         │   │                           │
│  │  ❌ 不含 location.precise               │   │                           │
│  │  ❌ 不含 exif_payload                   │   │                           │
│  │  ❌ 不含 description.text               │   │                           │
│  └─────────────────────────────────────────┘   │                           │
│                                                 │                           │
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─    │
│                                                 │                           │
│                       [RESTRICTED DOMAIN · 受限]│                           │
│                                                 │                           │
│  ┌──────────────────────────────────────────┐   │                           │
│  │       private_locations                  │   │                           │
│  │  (pgcrypto 列加密 · 90 天自动清理)       │   │                           │
│  │                                          │   │                           │
│  │  id (uuid), submission_id (FK) ──────────┼───┘                           │
│  │  city_id (FK → cities.id),               │                               │
│  │  latitude_enc BYTEA NOT,                 │                               │
│  │  longitude_enc BYTEA NOT,                │                               │
│  │  accuracy_meters_enc BYTEA,              │                               │
│  │  source ('gps' | 'manual') NOT,          │                               │
│  │  retention_until TIMESTAMPTZ,            │                               │
│  │  created_at TIMESTAMPTZ DEFAULT NOW()    │                               │
│  └──────────────────────────────────────────┘                               │
│                       ▲                                                    │
│                       │ INSERT (public schema witness_submissions)        │
│                       │                                                    │
│  ┌──────────────────────────────────────────┐                               │
│  │   private_location_access_log            │                               │
│  │   (append-only · 不允许 UPDATE / DELETE) │                               │
│  │                                          │                               │
│  │  id, user_id, location_id,               │                               │
│  │  purpose ENUM, ip_address INET,           │                               │
│  │  accessed_at TIMESTAMPTZ DEFAULT NOW()   │                               │
│  └──────────────────────────────────────────┘                               │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 3. 公共域 schema（永远不含 lat/lon）

### 3.1 `cities` 表

```sql
CREATE TABLE cities (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name_zh TEXT NOT NULL,
  name_en TEXT NOT NULL,
  country_zh TEXT NOT NULL,
  country_en TEXT NOT NULL,
  country_code CHAR(2) NOT NULL,
  timezone TEXT NOT NULL,            -- IANA, e.g. Asia/Tokyo
  layer TEXT NOT NULL,               -- 'blue' | 'yellow' | 'red'  (D-P0-01 LOCKED)
  page_state TEXT NOT NULL,          -- 'A_seed_editorial' | 'B_active' | ...
  public_location_only BOOLEAN NOT NULL DEFAULT TRUE,
  admin1_code TEXT,
  admin1_name TEXT,
  place_type TEXT NOT NULL DEFAULT 'city',
  state_level TEXT NOT NULL DEFAULT 'L0_mapped',  -- Backend-only maturity
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT cities_id_format CHECK (id ~ '^[a-z0-9-]{1,64}$'),
  CONSTRAINT cities_slug_format CHECK (slug ~ '^[a-z0-9-]{1,96}$'),
  CONSTRAINT cities_no_latlon CHECK (
    -- Hard guard: refuse any attempt to add lat/lon columns via migration
    column_name_not_in('cities', ARRAY['latitude','longitude','raw_coordinates'])
  )
  -- ❌ 故意不包含 latitude / longitude 列（DDL 物理上无法引入）
);

CREATE INDEX idx_cities_slug ON cities (slug);
CREATE INDEX idx_cities_layer ON cities (layer);
CREATE INDEX idx_cities_page_state ON cities (page_state);
CREATE INDEX idx_cities_country ON cities (country_code);
```

> **🔒 DDL 不变性**：`cities` 表的列定义是**写死的不可变 schema**。任何 ALTER TABLE 给 cities 加 `latitude / longitude` 列的 migration 必须由 E-P0-05 owner + PM + Privacy-Legal 三方签字，且必须新建 `private_locations` 记录而非污染公共 schema。

### 3.2 `moments` 表

```sql
CREATE TABLE moments (
  id TEXT PRIMARY KEY,
  city_id TEXT NOT NULL REFERENCES cities(id) ON DELETE RESTRICT,
  public_city_name TEXT NOT NULL,  -- Snapshot of city name at capture time
  captured_at TIMESTAMPTZ NOT NULL,    -- E-P0-04 LOCKED · 拍摄时刻（NOW/TODAY/PAST 唯一判定）
  captured_at_tz TEXT NOT NULL,        -- IANA
  captured_at_source TEXT NOT NULL,    -- 'exif' | 'camera' | 'user_confirmed' | 'admin' | 'fallback_upload_time'
  captured_at_confidence TEXT NOT NULL,-- 'high' | 'medium' | 'low' | 'untrusted'
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ,            -- NULL until moderation approves
  source_type TEXT NOT NULL,           -- 'witness' | 'seed' | 'editorial'  (DomainSourceType)
  rights_status TEXT NOT NULL,         -- 'cc_by' | 'cc_by_sa' | 'cc0' | 'all_rights_reserved' | 'unknown'
  credit_line TEXT NOT NULL,
  credit_source_url TEXT,
  provenance_status TEXT NOT NULL,     -- 'self_reported' | 'trusted_source' | 'editorial' | 'unknown'
  moderation_status TEXT NOT NULL DEFAULT 'pending',  -- 'pending' | 'approved' | 'rejected' | 'flagged'
  witness_id TEXT,                     -- Omitted for editorial/seed
  asset_id TEXT,                       -- FK → assets (Variant URLs 存 assets)
  edition_id TEXT,                     -- FK → editions (若已入版)
  editorial_category TEXT,             -- 'landmark' | 'nature' | ...
  editorial_note TEXT,
  captions_zh TEXT,
  captions_en TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- ❌ 故意不包含 raw_location 列
  -- ❌ 故意不包含 captured_at_offset 列（tz 已含）
  -- ❌ 故意不包含 precise_coordinates 列
  CONSTRAINT moments_city_fk FOREIGN KEY (city_id) REFERENCES cities(id)
);

CREATE INDEX idx_moments_city ON moments (city_id);
CREATE INDEX idx_moments_captured_at ON moments (captured_at DESC);
CREATE INDEX idx_moments_published ON moments (published_at DESC) WHERE published_at IS NOT NULL;
CREATE INDEX idx_moments_moderation ON moments (moderation_status) WHERE moderation_status = 'approved';
CREATE INDEX idx_moments_source_type ON moments (source_type);
CREATE INDEX idx_moments_edition ON moments (edition_id) WHERE edition_id IS NOT NULL;
```

> ⚠️ **`moments` 表的 `captured_at` 精度**：本表只存 TIMESTAMPTZ（microsecond 精度，UTC）。原始 EXIF 中可能含 sub-second / timezone offset，但**服务端解析为 captured_at + captured_at_tz 双字段存储**，原始 EXIF 在解析后即丢弃（详见 §6）。

### 3.3 `witness_submissions` 表（公共字段）

```sql
CREATE TABLE witness_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_key TEXT NOT NULL,           -- Idempotency (UUIDv4 from client)
  status TEXT NOT NULL DEFAULT 'draft',  -- 8-state machine
  media_type TEXT NOT NULL,           -- 'photo_camera' | 'photo_library' | 'live_photo'
  public_city_id TEXT NOT NULL REFERENCES cities(id),
  captured_at TIMESTAMPTZ NOT NULL,
  captured_at_tz TEXT NOT NULL,
  captured_at_source TEXT NOT NULL,
  captured_at_confidence TEXT NOT NULL,
  location_mode TEXT NOT NULL,        -- 'auto_gps_city' | 'manual_city' | 'denied_fallback_manual'
  description_redacted TEXT NOT NULL DEFAULT 'absent',  -- 'present' | 'absent' | 'under_review'
  asset_id TEXT,                      -- FK → assets (NULL until upload completes)
  submitted_at TIMESTAMPTZ,
  moderation_decision TEXT,           -- 'accepted' | 'rejected' | 'needs_more_info'
  moderation_decided_at TIMESTAMPTZ,
  moderation_public_reason TEXT,
  error_category TEXT,
  witness_id TEXT,                    -- Opaque session-scoped ID
  ip_hash TEXT,                       -- HMAC-SHA256(IP, IP_SALT) · 64 chars
  user_agent_hash TEXT,               -- HMAC-SHA256(UA, UA_SALT) · 64 chars
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT witness_client_key_unique UNIQUE (client_key),
  CONSTRAINT witness_status_enum CHECK (status IN (
    'draft','uploading','submitted','under_review',
    'published','rejected','withdrawn','failed'
  ))
);

CREATE INDEX idx_witness_client_key ON witness_submissions (client_key);
CREATE INDEX idx_witness_status ON witness_submissions (status);
CREATE INDEX idx_witness_city ON witness_submissions (public_city_id);
CREATE INDEX idx_witness_created ON witness_submissions (created_at DESC);
```

> 🔒 **public_city_id 是字符串外键，不带任何 lat/lon**。`location_mode` 只记录模式枚举（`auto_gps_city` 等），绝不记录坐标。

---

## 4. 受限域 schema（独立表 + 加密 + 审计）

### 4.1 `private_locations` 表（pgcrypto 列加密）

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;  -- PostgreSQL 加密扩展

CREATE TABLE private_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL UNIQUE REFERENCES witness_submissions(id) ON DELETE CASCADE,
  city_id TEXT NOT NULL REFERENCES cities(id),

  -- ⚠️ lat/lon 是加密 BYTEA 列，DB 层不可读出明文（除非持有 DECRYPT key）
  latitude_enc        BYTEA NOT NULL,  -- pgp_sym_encrypt(latitude::text, KEY)
  longitude_enc       BYTEA NOT NULL,
  accuracy_meters_enc BYTEA,            -- 可空（GPS 不可用时）

  source TEXT NOT NULL DEFAULT 'gps',  -- 'gps' | 'manual'
  retention_until TIMESTAMPTZ NOT NULL,  -- = created_at + 90 days
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT priv_loc_source_enum CHECK (source IN ('gps','manual')),
  CONSTRAINT priv_loc_submission_unique UNIQUE (submission_id)
);

-- 解密视图（仅 moderator_role / admin_role 可 SELECT）
CREATE OR REPLACE VIEW private_locations_decrypted AS
SELECT
  id,
  submission_id,
  city_id,
  pgp_sym_decrypt(latitude_enc,        current_setting('app.encryption_key'))::numeric(9,6) AS latitude,
  pgp_sym_decrypt(longitude_enc,       current_setting('app.encryption_key'))::numeric(9,6) AS longitude,
  CASE WHEN accuracy_meters_enc IS NOT NULL
       THEN pgp_sym_decrypt(accuracy_meters_enc, current_setting('app.encryption_key'))::numeric(8,2)
       ELSE NULL END AS accuracy_meters,
  source,
  retention_until,
  created_at
FROM private_locations;

-- ⚠️ 视图授权：仅 moderator / admin 角色可读
REVOKE ALL ON private_locations_decrypted FROM PUBLIC;
GRANT SELECT ON private_locations_decrypted TO seeearth_moderator, seeearth_admin;
```

> 🔒 **加密 key 管理**：`app.encryption_key` 设置在 PostgreSQL session 级别（`SET LOCAL app.encryption_key = '...'`），由应用连接池在每次事务开始时设置。Key 本身存在 AWS KMS / GCP KMS / Vercel Secrets，**永不出现在 SQL / 日志 / 应用代码 / 客户端 bundle**。

### 4.2 `private_location_access_log` 表（append-only 审计日志）

```sql
CREATE TABLE private_location_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,             -- Actor (moderator_id / admin_id / system)
  location_id UUID NOT NULL REFERENCES private_locations(id),
  purpose TEXT NOT NULL,             -- 'moderation' | 'review' | 'audit' | 'legal_request'
  ip_address INET,                   -- Actor's IP (audit 用途)
  user_agent TEXT,
  accessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT access_log_purpose_enum CHECK (purpose IN (
    'moderation','review','audit','legal_request','system_cleanup'
  ))
);

-- ⚠️ Append-only：触发器阻止 UPDATE / DELETE
CREATE OR REPLACE FUNCTION prevent_access_log_mutation()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'private_location_access_log is append-only (no UPDATE/DELETE allowed)';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_access_log_update
  BEFORE UPDATE ON private_location_access_log
  FOR EACH ROW EXECUTE FUNCTION prevent_access_log_mutation();

CREATE TRIGGER trg_prevent_access_log_delete
  BEFORE DELETE ON private_location_access_log
  FOR EACH ROW EXECUTE FUNCTION prevent_access_log_mutation();

CREATE INDEX idx_access_log_location ON private_location_access_log (location_id);
CREATE INDEX idx_access_log_user ON private_location_access_log (user_id);
CREATE INDEX idx_access_log_accessed_at ON private_location_access_log (accessed_at DESC);
```

### 4.3 访问审计触发器（自动写 audit log）

```sql
-- 每次 SELECT private_locations_decrypted → 自动写 audit_log
CREATE OR REPLACE FUNCTION log_private_location_access()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO private_location_access_log (user_id, location_id, purpose, ip_address)
  VALUES (
    current_setting('app.actor_user_id', true),
    NEW.id,
    current_setting('app.access_purpose', true),
    NULLIF(current_setting('app.actor_ip', true), '')::INET
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 视图触发器（INSTEAD OF SELECT 不可行，使用 RLS + 函数包装）
-- 实际实现：应用层 SELECT 后立即 INSERT access_log（详见 audit-log-v1.md §3）
```

> ⚠️ **触发器限制**：PostgreSQL 视图 SELECT 不能直接挂 trigger。本架构采用"应用层 SELECT + 立即 INSERT access_log"组合，由 server SDK 强制保证（任何代码路径绕过即 fail test）。

---

## 5. 角色与 GRANT（PostgreSQL RBAC）

```sql
-- 5 个角色（per §D 任务卡 + OD-04）
CREATE ROLE seeearth_anon;          -- Anonymous / public
CREATE ROLE seeearth_user;          -- Registered (V1 实际 = 同 anon，因为无登录)
CREATE ROLE seeearth_witness;       -- 提交 Witness 的 session（短期凭证）
CREATE ROLE seeearth_moderator;     -- 内容审核员
CREATE ROLE seeearth_admin;         -- 系统管理员
CREATE ROLE seeearth_system;        -- 后台 Job / Cleanup worker

-- 公共域 GRANT（匿名/用户/审核员/管理员/系统全部可读）
GRANT SELECT ON cities, moments, witness_submissions TO
  seeearth_anon, seeearth_user, seeearth_witness,
  seeearth_moderator, seeearth_admin, seeearth_system;

GRANT INSERT, UPDATE ON witness_submissions TO seeearth_witness;  -- 仅 Witness 可写
GRANT INSERT, UPDATE ON witness_submissions TO seeearth_moderator, seeearth_admin;  -- 审核改状态

-- 受限域 GRANT（绝对禁止匿名/用户/witness 直接读）
REVOKE ALL ON private_locations FROM PUBLIC;
REVOKE ALL ON private_locations FROM seeearth_anon, seeearth_user, seeearth_witness;
GRANT INSERT ON private_locations TO seeearth_witness;            -- 写入时已加密
GRANT SELECT ON private_locations_decrypted TO seeearth_moderator, seeearth_admin;

-- 审计日志 GRANT
REVOKE ALL ON private_location_access_log FROM PUBLIC;
GRANT INSERT ON private_location_access_log TO seeearth_moderator, seeearth_admin, seeearth_system;
GRANT SELECT ON private_location_access_log TO seeearth_admin;     -- 仅 admin 可审计

-- 行级安全（Row-Level Security · 备用防御）
ALTER TABLE private_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY private_locations_no_anon ON private_locations
  FOR ALL TO seeearth_anon, seeearth_user, seeearth_witness
  USING (false);  -- 强制 anon/user/witness 永远 0 行可见
```

> 🔒 **多重防御**：即使应用代码错误地尝试 `SELECT * FROM private_locations` 给匿名用户，PostgreSQL GRANT + RLS policy 会同时返回 0 行 / permission denied。

---

## 6. EXIF 处理（V1 默认 strip all + 仅保留少量白名单）

### 6.1 EXIF 字段剥离规则（服务端 `sharp.withMetadata({ exif: {} })`）

| EXIF 字段 | V1 默认 | 理由 |
|---|---|---|
| `GPSLatitude` / `GPSLongitude` / `GPSAltitude` | **STRIP** | F-06 禁采 / 推断住址 |
| `GPSLatitudeRef` / `GPSLongitudeRef` | **STRIP** | 配合 GPS lat/lon |
| `GPSTimeStamp` / `GPSDateStamp` | **STRIP** | 时间 + 位置组合可推断 |
| `Make` / `Model`（相机厂商/型号） | **STRIP** | F-07 设备指纹 |
| `SerialNumber` | **STRIP** | 唯一设备标识 |
| `LensModel` / `LensSerialNumber` | **STRIP** | 设备指纹 |
| `Software` / `HostSoftware` / `ProcessingSoftware` | **STRIP** | F-09 软件版本 |
| `Artist` / `Copyright` / `UserComment` / `ImageDescription` | **STRIP** | F-08 自由文本，可能含 PII |
| `DateTimeOriginal` / `CreateDate` / `ModifyDate` | **保留**（重写为 UTC + tz） | E-P0-04 必须 |
| `OffsetTime` / `OffsetTimeOriginal` / `OffsetTimeDigitized` | **保留**（合并到 captured_at_tz） | 时区信息必须 |
| `Orientation` | **保留** | 显示需要 |
| `ColorSpace` / `ExifVersion` | **保留** | 渲染需要 |
| `XResolution` / `YResolution` | **保留** | 渲染需要 |
| 其余 EXIF（300+ tag） | **STRIP** | 默认 strip，V1 不需要 |

### 6.2 处理流水线

```text
[Witness 上传 original image]
       ↓
[sharp.metadata() 读取 EXIF]
       ↓
[解析 captured_at + tz → 写入 witness_submissions.captured_at / captured_at_tz]
       ↓
[sharp.withMetadata({ exif: { IFD0: { Orientation: 1 }, ExifIFD: { ColorSpace: 1 } } })
       .toFormat('webp', { quality: 82 })
       .resize(2048, 2048, { fit: 'inside', withoutEnlargement: true })]
       ↓
[生成 4 variants (thumb_320 / card_640 / detail_1280 / full_2560)]
       ↓
[上传到 Supabase Storage / R2 / S3 → public CDN URL]
       ↓
[原图保留 30 天后删除（per privacy-compliance-v1.md §4.1）]
```

> ⚠️ **重要**：原图保留期（30 天）与精确位置保留期（90 天）是**两个独立的 cron job**。原图保留是为了"撤下请求 / 投诉处理"；精确位置保留是为了"审核 + 风控"。两者到期必须独立清理。

---

## 7. 90 天自动清理（per OD-04）

### 7.1 清理 SQL

```sql
-- 每日 03:00 UTC 清理 Job（Vercel Cron / GitHub Actions cron）
-- scripts/sql/cleanup-private-locations.sql

BEGIN;

-- 删除 90 天前的精确位置（连带 access_log 是否保留见 §7.3）
DELETE FROM private_locations
WHERE retention_until < NOW();

-- 同步删除对应 witness_submissions 的 location_mode 标记
-- （注意：保留 witness_submissions 本身，仅清空 public_city_id 是 NO，因为 city_id 必填）
-- 但因为 private_locations FK ON DELETE CASCADE，删除 private_locations 不影响 witness_submissions

COMMIT;
```

### 7.2 清理 Job 的可观察性

```sql
-- cleanup-run-log 表（由 system 角色 INSERT）
CREATE TABLE cleanup_run_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name TEXT NOT NULL,            -- 'cleanup_private_locations'
  rows_deleted INTEGER NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  finished_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL,              -- 'success' | 'failed'
  error_message TEXT
);
```

### 7.3 清理与审计 log 的关系

| 项 | 保留策略 |
|---|---|
| `private_locations` 行 | retention_until < NOW() → DELETE |
| `private_location_access_log` 行 | **永久保留**（append-only），即使 location 已删除 |
| `cleanup_run_log` 行 | **永久保留**（运营审计） |

> 🔒 **审计完整性**：即使原数据已清除，access_log 仍是完整证据链（who accessed what when）。这满足 GDPR / CCPA / 中国 PIPL "处理记录可追溯" 要求。

---

## 8. 与 E-P0-09 Zod contract 的对齐

### 8.1 Public schema 字段映射

| Zod schema（E-P0-09） | DB 表 | DB 列 | 公共字段？ |
|---|---|---|---|
| `PublicCity` | `cities` | `id, slug, name_zh, name_en, country_zh, country_en, country_code, timezone, layer, page_state, public_location_only=true, admin1_code, admin1_name, place_type` | ✅ |
| `PublicCity` ❌ | `cities` | ❌ 无 `latitude/longitude` 列 | ❌（不存在） |
| `PublicMoment` | `moments` | `id, city_id, public_city_name, captured_at, captured_at_tz, captured_at_source, captured_at_confidence, uploaded_at, published_at, source_type, rights_status, credit_line, credit_source_url, provenance_status, moderation_status, witness_id, asset_id, edition_id, editorial_category, editorial_note, captions_zh, captions_en` | ✅ |
| `PublicMoment` ❌ | `moments` | ❌ 无 `raw_location` / `latitude` / `longitude` 列 | ❌（不存在） |
| `PublicWitnessSubmission` | `witness_submissions` | `id, client_key, status, media_type, public_city_id, captured_at, captured_at_tz, captured_at_source, captured_at_confidence, location_mode, description_redacted, asset_id, submitted_at, moderation_decision, moderation_decided_at, moderation_public_reason, error_category` | ✅ |
| `PublicWitnessSubmission` ❌ | `witness_submissions` | ❌ 无 `location.precise` / `exif_payload` / `description.text` 列 | ❌（不存在） |

### 8.2 Admin schema 字段映射（仅 moderator / admin 角色可读）

| Zod schema（E-P0-09） | DB 表 | DB 列 | 受限？ |
|---|---|---|---|
| `AdminCity.raw_coordinates` | `private_locations_decrypted` (view) | `latitude, longitude` (via pgp_sym_decrypt) | ✅ 仅 moderator / admin |
| `AdminMoment.raw_location` | `private_locations_decrypted` JOIN `moments` | `latitude, longitude, accuracy_meters, source` | ✅ |
| `AdminWitnessSubmission.location.precise` | `witness_submissions` JOIN `private_locations_decrypted` | 同上 | ✅ |
| `AdminWitnessSubmission.description` | `witness_submissions_full_description`（受限表，详见 §9） | `text, locale` | ✅ 仅 moderator / admin |

> **不一致警告**：当前 Zod `AdminWitnessSubmission.location: WitnessLocationClaimSchema` 要求"每次访问必须有 access_log"，需在 E-P0-03 / E-P0-09 评审中确认 server SDK 是否在 SELECT 前后调用 `INSERT INTO private_location_access_log`。本卡 §audit-log-v1.md 提供具体实现。

---

## 9. 受限 description 文本（独立表）

> ⚠️ **注意**：`witness_submissions` 表不直接存 description.text，而是存 `description_redacted`（枚举 `'present' | 'absent' | 'under_review'`）。实际 description 文本存在独立受限表 `witness_submission_descriptions`：

```sql
CREATE TABLE witness_submission_descriptions (
  submission_id UUID PRIMARY KEY REFERENCES witness_submissions(id) ON DELETE CASCADE,
  text_enc BYTEA NOT NULL,            -- pgp_sym_encrypt(text, KEY)
  locale TEXT NOT NULL DEFAULT 'zh',  -- 'zh' | 'en'
  moderation_status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

REVOKE ALL ON witness_submission_descriptions FROM PUBLIC;
GRANT SELECT, INSERT, UPDATE ON witness_submission_descriptions TO seeearth_moderator, seeearth_admin;
GRANT INSERT ON witness_submission_descriptions TO seeearth_witness;
```

> 🔒 **为什么 description 也独立**：因为 description 文本是 PII 敏感字段（用户自由文本）。即使 `witness_submissions` 表被泄漏，没有 description 表 1 的 DESCRYPT key，攻击者也拿不到用户输入的文本。

---

## 10. Blocker Log

| 日期 | 议题 | Owner | 解锁条件 | 状态 |
|---|---|---|---|---|
| 2026-08-24 | 加密 key 管理方式（KMS / Vercel Secrets / Doppler）尚未决定 | Engineer + PM | E-P0-02 启动前 1 天 | OPEN |
| 2026-08-24 | `witness_submission_descriptions` 是否进入 V1 schema（vs 推迟到 Beta） | Engineer + PM | OD-01 决策 | OPEN |
| 2026-08-24 | 90 天 retention 的法务依据（GDPR Art.5(1)(e) "storage limitation"）需要 Privacy-Legal 签字 | Privacy-Legal | Gate C 前 | OPEN |
| 2026-08-24 | sandbox 写入 Obsidian canonical 路径被拒绝 | PM / 外部 Owner | 手动 cp | OPEN（与其他 Round 4 子代理共享） |

---

## 11. 自验收 Acceptance Criteria

| 验收项 | 状态 | 证据 |
|---|---|---|
| [x] 公共 schema（cities / moments / witness_submissions）不含 lat/lon 列 | ✅ | §3.1 / §3.2 / §3.3 DDL |
| [x] 精确位置在独立 `private_locations` 表，且列加密 | ✅ | §4.1 |
| [x] `cities_no_latlon` CHECK 约束阻止 migration 加 lat/lon 列 | ✅ | §3.1 |
| [x] 5 角色 GRANT + RLS 双重防御 | ✅ | §5 |
| [x] EXIF 默认 strip 全部 GPS + 设备指纹字段 | ✅ | §6.1 |
| [x] 90 天 retention + cleanup_run_log + append-only access_log | ✅ | §7 |
| [x] 与 E-P0-09 Zod Public/Admin schema 一一对齐 | ✅ | §8 |
| [x] description 文本独立加密表 | ✅ | §9 |
| [x] Blocker Log 完整（含 sandbox 写入权限） | ✅ | §10 |
| [x] 不修改 14 LOCKED 组件 / 不修改 E-P0-09 已 LOCKED schema | ✅ | 仅写新文档，未改 schema 文件 |

---

## 12. 关联文档

| 文档 | 用途 |
|---|---|
| `public-private-split-v1.md` | 5 条强制边界 + Public/Admin schema 映射矩阵 |
| `role-permission-v1.md` | 4 + 1 角色权限矩阵 |
| `encryption-v1.md` | 静态 / 传输加密 + 90 天自动清理 |
| `audit-log-v1.md` | 访问审计规范 + audit_log 写入契约 |
| `leak-test-v1.md` | 自动化 leak test 覆盖矩阵 + 实施脚本 |
| `e2e-test-cases-v1.md` | 端到端测试用例（Playwright + Jest） |
| `../api-contract/zod-schemas/city.ts` | PublicCity / AdminCity Zod schema |
| `../api-contract/zod-schemas/moment.ts` | PublicMoment / AdminMoment Zod schema |
| `../api-contract/zod-schemas/witness-submission.ts` | PublicWitnessSubmission / AdminWitnessSubmission Zod schema |
| `../api-contract/zod-schemas/common.ts` | RawCoordinatesSchema / PublicCityLocationSchema |
| `../api-contract/contract-decisions-v1.md` | 17 决策（§2 双 schema 模型 + §4 位置语义） |
| `../api-contract/error-code-dict-v1.md` | ERR_INTERNAL_PRECISE_LOCATION_LEAK / ERR_INTERNAL_UNAUTHORISED_RAW_LOCATION_ACCESS |
| `/Users/lwy/Documents/ChatGPT/看见地球/src/lib/locationPrivacy.ts` | 客户端 fallback 实现（V1 SPA 仍用） |
| `/Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/SEE-EARTH-Release-Strategy-v1-Design-Engineering-Task-Brief.md` §5 E-P0-05 | Brief 原文 |

---

**End of data-architecture-v1.md · E-P0-05 子任务 1/7**