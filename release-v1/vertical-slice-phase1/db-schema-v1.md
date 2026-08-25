---
title: SEE EARTH V1 · DB Schema + Migration · Phase 1
type: db-schema
tags: [release-v1, e-p0-02, postgres, drizzle, supabase, db, see-earth]
task_id: E-P0-02
phase: Phase 1 · Vertical Slice
dispatched_at: 2026-08-22
status: DRAFT · IN REVIEW
author: Engineer Agent (Round 2B)
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/vertical-slice-phase1/db-schema-v1.md
source_inputs:
  - release-v1/api-contract/zod-schemas/*.ts
  - release-v1/backend-reality-audit-v1.md §5
  - release-v1/vertical-slice-phase1/backend-setup-v1.md
---

# SEE EARTH V1 · DB Schema + Migration · Phase 1 Vertical Slice

> **作者**：Engineer Agent（Round 2B · Phase 1 子集）
> **目标读者**：PM Agent（验收）、DBA、后续 Phase 2/3 工程师
> **任务卡**：E-P0-02 Launch Vertical Slice（Phase 1 子集）
> **约束**：严格遵循 E-P0-09 Zod schemas（`release-v1/api-contract/zod-schemas/*.ts`）+ `backend-reality-audit-v1.md §5` 6 域蓝图
> **决策日期**：2026-08-22

---

## 0. 一句话结论

**Phase 1 在 Supabase Postgres 上建 5 张表（City / Moment / Edition / Asset / WitnessSubmission），Echo 表不建（per OD-01）。所有表包含 `id`（UUID PK）+ `created_at` / `updated_at` + `deleted_at`（soft delete）+ 关键索引（slug / city_id+desc / client_key unique partial）。首个 migration 文件 = `api/drizzle/0000_init.sql`（由 drizzle-kit 自动生成）。**

---

## 1. Schema 设计原则

### 1.1 通用约束

| 项 | 规则 |
|---|---|
| Primary Key | `id UUID` 默认 `gen_random_uuid()`（Postgres 13+ pgcrypto） |
| Audit | `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()` + `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()` |
| Soft Delete | `deleted_at TIMESTAMPTZ NULL`（所有查询必须 WHERE deleted_at IS NULL） |
| UTC | 所有 `TIMESTAMPTZ` 存储 UTC，IANA timezone 单独存 `*_tz` TEXT |
| Enum | Postgres 原生 `ENUM` 类型（性能优于 CHECK + TEXT） |
| JSONB | `Edition.slots` JSONB（12 slots · 强类型 via Zod validation） |
| Naming | snake_case 表名 + 列名；TS Drizzle 层映射 camelCase |

### 1.2 不在 Phase 1 范围

- ❌ `Echo` 表（per OD-01 REMOVE Echo UI · 不实现提交能力）
- ❌ `EditionStatus.scheduled` 状态值（per OD-03 · 无 cron）
- ❌ 分区表（Phase 1 数据量 < 1MB，无需分区）
- ❌ 全文搜索索引（Phase 1 不做搜索）
- ❌ RLS（Row Level Security）（Phase 1 仅服务端 API · 所有 RLS Phase 2 加）

---

## 2. 6 域表结构（DDL 蓝图）

> **展示形式**：先用表格说明字段 → 末尾给出完整 DDL（`drizzle/0000_init.sql` 骨架）

### 2.1 `cities` 表

**对应 Zod schema**：`PublicCitySchema` + `AdminCitySchema`（`zod-schemas/city.ts`）

| 列 | 类型 | NOT NULL | 默认 | 索引 | 说明 |
|---|---|---|---|---|---|
| `id` | `UUID` | ✅ | `gen_random_uuid()` | PK | 主键 |
| `slug` | `TEXT` | ✅ | - | UNIQUE | URL-safe slug（regex `^[a-z0-9]+(?:-[a-z0-9]+)*$`） |
| `name_zh` | `TEXT` | ✅ | - | - | 中文名 |
| `name_en` | `TEXT` | ✅ | - | - | 英文名 |
| `name_canonical` | `TEXT` | ✅ | - | - | 英文 canonical name（CityNames.canonical_name） |
| `alternate_names` | `TEXT[]` | ❌ | NULL | - | 备用名 |
| `country_code` | `CHAR(2)` | ✅ | - | - | ISO 3166-1 alpha-2 |
| `country_name_zh` | `TEXT` | ✅ | - | - | 国家中文名 |
| `country_name_en` | `TEXT` | ✅ | - | - | 国家英文名 |
| `admin1_code` | `TEXT` | ❌ | NULL | - | GeoNames admin1 code |
| `admin1_name` | `TEXT` | ❌ | NULL | - | GeoNames admin1 name |
| `place_type` | `place_type_enum` | ✅ | `'city'` | - | V1 仅 `city` / `town`（GeoNames 枚举） |
| `timezone` | `TEXT` | ✅ | - | - | IANA TZ（regex `^[A-Za-z_]+/[A-Za-z_]+(/[A-Za-z_]+)*$`） |
| `latitude` | `NUMERIC(9,6)` | ✅ | - | - | **INTERNAL ONLY · 不在公共 endpoint 返回** |
| `longitude` | `NUMERIC(9,6)` | ✅ | - | - | **INTERNAL ONLY · 不在公共 endpoint 返回** |
| `layer` | `layer_enum` | ✅ | - | IDX | `'blue'` / `'yellow'` / `'red'`（LOCKED · D-P0-01 §4） |
| `page_state` | `city_page_state_enum` | ✅ | `'A_seed_editorial'` | - | 公共 city state（A_seed_editorial / B_active / C_low_activity / D_past_only / E_empty） |
| `state_level` | `city_state_level_enum` | ✅ | `'L0_mapped'` | - | **ADMIN ONLY** · 后端成熟度（L0_mapped → L4_living_archive） |
| `hero_media_url` | `TEXT` | ❌ | NULL | - | Hero 图 URL |
| `hero_media_width` | `INTEGER` | ❌ | NULL | - | |
| `hero_media_height` | `INTEGER` | ❌ | NULL | - | |
| `hero_media_alt` | `TEXT` | ❌ | NULL | - | alt 文本 |
| `hero_media_focus` | `TEXT` | ❌ | NULL | - | CSS object-position（如 `"50% 30%"`） |
| `hero_source` | `TEXT` | ❌ | NULL | - | 来源描述 |
| `hero_creator` | `TEXT` | ❌ | NULL | - | 创作者 |
| `hero_license` | `TEXT` | ❌ | NULL | - | 许可证 |
| `hero_credit_requirement` | `TEXT` | ❌ | NULL | - | 署名要求 |
| `editorial_only` | `BOOLEAN` | ✅ | `false` | - | 是否仅 editorial |
| `visual_status` | `visual_status_enum` | ✅ | `'seed'` | - | `'seed'` / `'placeholder'` / `'none'` |
| `created_at` | `TIMESTAMPTZ` | ✅ | `NOW()` | - | |
| `updated_at` | `TIMESTAMPTZ` | ✅ | `NOW()` | - | |
| `deleted_at` | `TIMESTAMPTZ` | ❌ | NULL | partial | soft delete |

**索引**：

```sql
CREATE INDEX idx_cities_slug ON cities (slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_cities_layer ON cities (layer) WHERE deleted_at IS NULL;
CREATE INDEX idx_cities_page_state ON cities (page_state) WHERE deleted_at IS NULL;
CREATE INDEX idx_cities_country_code ON cities (country_code) WHERE deleted_at IS NULL;
```

---

### 2.2 `moments` 表

**对应 Zod schema**：`PublicMomentSchema` + `AdminMomentSchema`（`zod-schemas/moment.ts`）

| 列 | 类型 | NOT NULL | 默认 | 索引 | 说明 |
|---|---|---|---|---|---|
| `id` | `UUID` | ✅ | `gen_random_uuid()` | PK | |
| `city_id` | `UUID` | ✅ | - | FK + IDX | → `cities.id` |
| `public_city_name` | `TEXT` | ✅ | - | - | 捕获时城市名快照 |
| `captured_at` | `TIMESTAMPTZ` | ✅ | - | IDX | UTC ISO 8601 |
| `captured_at_tz` | `TEXT` | ✅ | - | - | IANA TZ（原始） |
| `captured_at_source` | `captured_at_source_enum` | ✅ | `'fallback_upload_time'` | - | `exif` / `camera` / `user_confirmed` / `admin` / `fallback_upload_time` |
| `captured_at_confidence` | `captured_at_confidence_enum` | ✅ | `'untrusted'` | - | `high` / `medium` / `low` / `untrusted` |
| `uploaded_at` | `TIMESTAMPTZ` | ✅ | `NOW()` | - | |
| `published_at` | `TIMESTAMPTZ` | ❌ | NULL | - | 审核通过后设置 |
| `image_variants` | `JSONB` | ✅ | - | - | `ImageVariant[]`（variant + url + width + height + mime + bytes） |
| `source_type` | `domain_source_type_enum` | ✅ | - | IDX | `witness` / `seed` / `editorial`（domain-level） |
| `source_specific_type` | `moment_source_type_enum` | ❌ | NULL | - | `reuters` / `ap` / `adobe` / `shutterstock` / `wikimedia` / `unsplash` / `manual` |
| `provenance_status` | `moment_provenance_status_enum` | ✅ | `'unknown'` | - | `self_reported` / `trusted_source` / `editorial` / `unknown` |
| `moderation_status` | `moment_moderation_status_enum` | ✅ | `'pending'` | - | `pending` / `approved` / `rejected` / `flagged` |
| `rights_status` | `rights_status_enum` | ✅ | `'unknown'` | - | `cc_by` / `cc_by_sa` / `cc0` / `all_rights_reserved` / `unknown` |
| `credit_line` | `TEXT` | ❌ | NULL | - | 署名文本 |
| `credit_source_url` | `TEXT` | ❌ | NULL | - | 上游 URL |
| `caption_zh` | `TEXT` | ❌ | NULL | - | |
| `caption_en` | `TEXT` | ❌ | NULL | - | |
| `witness_id` | `TEXT` | ❌ | NULL | - | Witness 标识（self_reported 时必填） |
| `editorial_category` | `moment_editorial_category_enum` | ❌ | NULL | - | `landmark` / `nature` / `street` / `culture` / `people` / `weather` / `other` |
| `editorial_note` | `TEXT` | ❌ | NULL | - | 编辑备注 |
| `raw_location` | `JSONB` | ❌ | NULL | - | **ADMIN ONLY** · `{latitude, longitude, accuracy_m?, altitude_m?}` |
| `location_verification_status` | `location_verification_status_enum` | ❌ | NULL | - | `verified` / `approximate` / `unverified` |
| `location_verification_method` | `location_verification_method_enum` | ❌ | NULL | - | `gps` / `manual` / `inferred` |
| `location_verified_at` | `TIMESTAMPTZ` | ❌ | NULL | - | |
| `sources` | `JSONB` | ❌ | NULL | - | `MomentSource[]`（最多 8 个 · ADMIN ONLY 但用于 attribution） |
| `created_at` | `TIMESTAMPTZ` | ✅ | `NOW()` | - | |
| `updated_at` | `TIMESTAMPTZ` | ✅ | `NOW()` | - | |
| `deleted_at` | `TIMESTAMPTZ` | ❌ | NULL | partial | |

**索引**：

```sql
CREATE INDEX idx_moments_city_id_captured_at
  ON moments (city_id, captured_at DESC)
  WHERE deleted_at IS NULL AND moderation_status = 'approved';

CREATE INDEX idx_moments_source_type
  ON moments (source_type)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_moments_moderation_status
  ON moments (moderation_status)
  WHERE deleted_at IS NULL;
```

**关键 privacy**：`raw_location` 字段 **永远不出现在 `SELECT` 公共 endpoint 的 serializer 中**（详见 `src/lib/privacy.ts` boundary gate）。

---

### 2.3 `editions` 表（Daily 12）

**对应 Zod schema**：`PublicEditionSchema` + `AdminEditionSchema`（`zod-schemas/edition.ts`）

| 列 | 类型 | NOT NULL | 默认 | 索引 | 说明 |
|---|---|---|---|---|---|
| `id` | `UUID` | ✅ | `gen_random_uuid()` | PK | |
| `date` | `DATE` | ✅ | - | IDX | Edition calendar date（Edition-date，非 publish timestamp） |
| `slots` | `JSONB` | ✅ | - | - | `EditionSlot[12]`（length CHECK = 12） |
| `version` | `INTEGER` | ✅ | `1` | - | 单调递增，republish/rollback 时 +1 |
| `is_fallback` | `BOOLEAN` | ✅ | `false` | - | 是否 fallback Edition |
| `replaces_edition_id` | `UUID` | ❌ | NULL | FK self | → `editions.id` |
| `published_at` | `TIMESTAMPTZ` | ❌ | NULL | - | |
| `status` | `edition_status_enum` | ✅ | `'draft'` | IDX | **V1 仅 `draft` / `preview` / `published` / `replaced` / `retracted`** · **不使用 `scheduled`**（per OD-03） |
| `created_at` | `TIMESTAMPTZ` | ✅ | `NOW()` | - | |
| `updated_at` | `TIMESTAMPTZ` | ✅ | `NOW()` | - | |
| `deleted_at` | `TIMESTAMPTZ` | ❌ | NULL | partial | |

**slots JSONB 结构**（每条 slot）：

```jsonc
{
  "position": 1,            // 1..12
  "moment_id": "uuid|null", // null = fallback placeholder
  "city_id": "uuid|null",   // 与 moment_id 同 nullity
  "fallback_reason": "string|null", // 必填 iff moment_id == null
  "is_editorial_fill": false
}
```

**CHECK constraint**：

```sql
ALTER TABLE editions ADD CONSTRAINT chk_slots_length
  CHECK (jsonb_array_length(slots) = 12);

ALTER TABLE editions ADD CONSTRAINT chk_status_no_scheduled
  CHECK (status != 'scheduled');  -- per OD-03
```

**索引**：

```sql
CREATE INDEX idx_editions_date_desc
  ON editions (date DESC, is_fallback)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_editions_published
  ON editions (date DESC)
  WHERE deleted_at IS NULL AND status = 'published';

CREATE UNIQUE INDEX uq_editions_date_published
  ON editions (date)
  WHERE deleted_at IS NULL AND status = 'published';
-- 保证每个日期只有一个 published Edition
```

---

### 2.4 `assets` 表（Phase 1 后端基础 · Phase 2 UI 接入）

**对应 Zod schema**：`PublicAssetSchema` + `AdminAssetSchema`（`zod-schemas/asset-upload.ts`）

| 列 | 类型 | NOT NULL | 默认 | 索引 | 说明 |
|---|---|---|---|---|---|
| `id` | `UUID` | ✅ | `gen_random_uuid()` | PK | |
| `moment_id` | `UUID` | ❌ | NULL | FK + IDX | → `moments.id`（upload 期间可能 NULL） |
| `uploaded_by_submission_id` | `UUID` | ❌ | NULL | FK | → `witness_submissions.id` |
| `storage_bucket` | `TEXT` | ✅ | - | - | Supabase bucket name |
| `storage_path_original` | `TEXT` | ✅ | - | UNIQUE | Supabase Storage object key（original） |
| `storage_path_variants` | `JSONB` | ✅ | - | - | `{thumb_320: ..., card_640: ..., detail_1280: ...}` |
| `mime` | `TEXT` | ✅ | - | - | `image/jpeg` / `image/png` / `image/webp` |
| `bytes_original` | `INTEGER` | ✅ | - | - | |
| `width_original` | `INTEGER` | ❌ | NULL | - | |
| `height_original` | `INTEGER` | ❌ | NULL | - | |
| `exif_stripped` | `BOOLEAN` | ✅ | `false` | - | EXIF 剥离完成标志 |
| `exif_gps_stripped` | `BOOLEAN` | ✅ | `false` | - | **GPS 必须剥离**（per E-P0-05） |
| `upload_status` | `asset_status_enum` | ✅ | `'pending'` | - | `pending` / `uploaded` / `processed` / `failed` / `deleted` |
| `processing_error` | `TEXT` | ❌ | NULL | - | 失败原因 |
| `created_at` | `TIMESTAMPTZ` | ✅ | `NOW()` | - | |
| `updated_at` | `TIMESTAMPTZ` | ✅ | `NOW()` | - | |
| `deleted_at` | `TIMESTAMPTZ` | ❌ | NULL | partial | |

**索引**：

```sql
CREATE INDEX idx_assets_moment_id
  ON assets (moment_id)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_assets_submission_id
  ON assets (uploaded_by_submission_id)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_assets_status
  ON assets (upload_status)
  WHERE deleted_at IS NULL;
```

---

### 2.5 `witness_submissions` 表（Phase 1 仅 DB · Phase 2 接 POST endpoint）

**对应 Zod schema**：`PublicWitnessSubmissionSchema` + `AdminWitnessSubmissionSchema` + `WitnessSubmissionStatusSchema`（8 状态）

| 列 | 类型 | NOT NULL | 默认 | 索引 | 说明 |
|---|---|---|---|---|---|
| `id` | `UUID` | ✅ | `gen_random_uuid()` | PK | |
| `client_key` | `TEXT` | ✅ | - | UNIQUE partial | 幂等键（UUIDv4 / Nano ID · 由 client 提供） |
| `session_token` | `TEXT` | ✅ | - | - | Witness Session JWT（90 天 TTL · per OD-04） |
| `session_expires_at` | `TIMESTAMPTZ` | ✅ | - | IDX | NOW() + 90 days |
| `city_id` | `UUID` | ✅ | - | FK | → `cities.id` |
| `location_mode` | `witness_location_mode_enum` | ✅ | - | - | `auto_gps_city` / `manual_city` / `denied_fallback_manual` |
| `captured_at_client` | `TIMESTAMPTZ` | ✅ | - | - | Client 提交时刻 |
| `captured_at_submission` | `TIMESTAMPTZ` | ✅ | - | - | Server 接收时刻 |
| `captured_at_source` | `captured_at_source_enum` | ✅ | `'fallback_upload_time'` | - | 同 Moment |
| `captured_at_confidence` | `captured_at_confidence_enum` | ✅ | `'untrusted'` | - | 同 Moment |
| `exif_stripped` | `BOOLEAN` | ✅ | `false` | - | EXIF 剥离后存储标志 |
| `exif_gps_stripped` | `BOOLEAN` | ✅ | `false` | - | **GPS 必须剥离** |
| `original_exif_summary` | `JSONB` | ❌ | NULL | - | 仅保留 datetime + camera model（不允许 GPS） |
| `text_note` | `TEXT` | ❌ | NULL | - | 自由文本（≤ 200 chars · server 校验） |
| `asset_id` | `UUID` | ❌ | NULL | FK | → `assets.id`（photo submission） |
| `status` | `witness_submission_status_enum` | ✅ | `'received'` | IDX | 8 状态机：`received` / `validated` / `awaiting_upload` / `uploading` / `uploaded` / `processing` / `awaiting_moderation` / `approved` / `rejected` / `failed` / `withdrawn` |
| `status_reason` | `TEXT` | ❌ | NULL | - | 状态变更原因 |
| `status_history` | `JSONB` | ✅ | `'[]'` | - | `[{from, to, at, reason}]` |
| `moderation_decision` | `witness_moderation_decision_enum` | ❌ | NULL | - | `approved` / `rejected` / `escalated` |
| `moderation_reason` | `TEXT` | ❌ | NULL | - | |
| `moderated_at` | `TIMESTAMPTZ` | ❌ | NULL | - | |
| `moderated_by` | `TEXT` | ❌ | NULL | - | moderator identifier |
| `result_moment_id` | `UUID` | ❌ | NULL | FK | → `moments.id`（approved 后产生） |
| `created_at` | `TIMESTAMPTZ` | ✅ | `NOW()` | - | |
| `updated_at` | `TIMESTAMPTZ` | ✅ | `NOW()` | - | |
| `deleted_at` | `TIMESTAMPTZ` | ❌ | NULL | partial | |
| `withdrawn_at` | `TIMESTAMPTZ` | ❌ | NULL | - | 用户撤回时间戳 |

**索引**：

```sql
CREATE UNIQUE INDEX uq_witness_submissions_client_key_active
  ON witness_submissions (client_key)
  WHERE deleted_at IS NULL;
-- Phase 1 Phase 2 幂等性保证

CREATE INDEX idx_witness_submissions_city_id
  ON witness_submissions (city_id)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_witness_submissions_status
  ON witness_submissions (status)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_witness_submissions_session_expires
  ON witness_submissions (session_expires_at)
  WHERE deleted_at IS NULL;
```

---

### 2.6 ❌ `echoes` 表（不建 · per OD-01）

> **理由**：PM 2026-08-22 OD-01 决议 = **REMOVE Echo UI**，消除假成功风险（与 Brief §E-P1-01 一致）。
>
> Phase 1 不创建 `echoes` 表；`src/components/ui/EchoInput.tsx` 按 `echo-ui-decision-v1.md` 处理（保留 UI 但禁用提交）。
>
> Phase 3+ 如重启 Echo 流程，须重建 schema 并重启 OD。

---

## 3. 枚举类型定义

```sql
-- Layer (D-P0-01 §4 LOCKED)
CREATE TYPE layer_enum AS ENUM ('blue', 'yellow', 'red');

-- City page_state
CREATE TYPE city_page_state_enum AS ENUM
  ('A_seed_editorial', 'B_active', 'C_low_activity', 'D_past_only', 'E_empty');

-- City state_level (admin only)
CREATE TYPE city_state_level_enum AS ENUM
  ('L0_mapped', 'L1_contextualized', 'L2_witnessed', 'L3_active', 'L4_living_archive');

-- Place type
CREATE TYPE place_type_enum AS ENUM
  ('city', 'town', 'natural_place', 'historic_site', 'coordinates');

-- Visual status
CREATE TYPE visual_status_enum AS ENUM ('seed', 'placeholder', 'none');

-- Captured at
CREATE TYPE captured_at_source_enum AS ENUM
  ('exif', 'camera', 'user_confirmed', 'admin', 'fallback_upload_time');
CREATE TYPE captured_at_confidence_enum AS ENUM
  ('high', 'medium', 'low', 'untrusted');

-- Moment source / provenance / moderation
CREATE TYPE domain_source_type_enum AS ENUM ('witness', 'seed', 'editorial');
CREATE TYPE moment_source_type_enum AS ENUM
  ('reuters', 'ap', 'adobe', 'shutterstock', 'wikimedia', 'unsplash', 'manual');
CREATE TYPE moment_provenance_status_enum AS ENUM
  ('self_reported', 'trusted_source', 'editorial', 'unknown');
CREATE TYPE moment_moderation_status_enum AS ENUM
  ('pending', 'approved', 'rejected', 'flagged');
CREATE TYPE moment_editorial_category_enum AS ENUM
  ('landmark', 'nature', 'street', 'culture', 'people', 'weather', 'other');

-- Location verification
CREATE TYPE location_verification_status_enum AS ENUM
  ('verified', 'approximate', 'unverified');
CREATE TYPE location_verification_method_enum AS ENUM
  ('gps', 'manual', 'inferred');

-- Rights
CREATE TYPE rights_status_enum AS ENUM
  ('cc_by', 'cc_by_sa', 'cc0', 'all_rights_reserved', 'unknown');

-- Edition (NO scheduled · per OD-03)
CREATE TYPE edition_status_enum AS ENUM
  ('draft', 'preview', 'published', 'replaced', 'retracted');
-- 'scheduled' explicitly excluded by OD-03

-- Asset
CREATE TYPE asset_status_enum AS ENUM
  ('pending', 'uploaded', 'processed', 'failed', 'deleted');

-- Witness location mode
CREATE TYPE witness_location_mode_enum AS ENUM
  ('auto_gps_city', 'manual_city', 'denied_fallback_manual');

-- Witness submission status (8-state machine)
CREATE TYPE witness_submission_status_enum AS ENUM
  ('received', 'validated', 'awaiting_upload', 'uploading',
   'uploaded', 'processing', 'awaiting_moderation',
   'approved', 'rejected', 'failed', 'withdrawn');

CREATE TYPE witness_moderation_decision_enum AS ENUM
  ('approved', 'rejected', 'escalated');
```

---

## 4. 完整初始 Migration（`api/drizzle/0000_init.sql` 骨架）

> **Drizzle 输出格式**：`drizzle-kit generate` 自动生成。本节给出人工校对版本。

```sql
-- ============================================================================
-- SEE EARTH V1 · Initial Schema · Phase 1
-- Generated: 2026-08-22 · E-P0-02 Round 2B
-- Source of truth: release-v1/api-contract/zod-schemas/*
-- ============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;  -- gen_random_uuid()

-- ----- ENUMs -----
CREATE TYPE layer_enum AS ENUM ('blue', 'yellow', 'red');
CREATE TYPE city_page_state_enum AS ENUM
  ('A_seed_editorial', 'B_active', 'C_low_activity', 'D_past_only', 'E_empty');
CREATE TYPE city_state_level_enum AS ENUM
  ('L0_mapped', 'L1_contextualized', 'L2_witnessed', 'L3_active', 'L4_living_archive');
CREATE TYPE place_type_enum AS ENUM
  ('city', 'town', 'natural_place', 'historic_site', 'coordinates');
CREATE TYPE visual_status_enum AS ENUM ('seed', 'placeholder', 'none');
CREATE TYPE captured_at_source_enum AS ENUM
  ('exif', 'camera', 'user_confirmed', 'admin', 'fallback_upload_time');
CREATE TYPE captured_at_confidence_enum AS ENUM
  ('high', 'medium', 'low', 'untrusted');
CREATE TYPE domain_source_type_enum AS ENUM ('witness', 'seed', 'editorial');
CREATE TYPE moment_source_type_enum AS ENUM
  ('reuters', 'ap', 'adobe', 'shutterstock', 'wikimedia', 'unsplash', 'manual');
CREATE TYPE moment_provenance_status_enum AS ENUM
  ('self_reported', 'trusted_source', 'editorial', 'unknown');
CREATE TYPE moment_moderation_status_enum AS ENUM
  ('pending', 'approved', 'rejected', 'flagged');
CREATE TYPE moment_editorial_category_enum AS ENUM
  ('landmark', 'nature', 'street', 'culture', 'people', 'weather', 'other');
CREATE TYPE location_verification_status_enum AS ENUM
  ('verified', 'approximate', 'unverified');
CREATE TYPE location_verification_method_enum AS ENUM
  ('gps', 'manual', 'inferred');
CREATE TYPE rights_status_enum AS ENUM
  ('cc_by', 'cc_by_sa', 'cc0', 'all_rights_reserved', 'unknown');
CREATE TYPE edition_status_enum AS ENUM
  ('draft', 'preview', 'published', 'replaced', 'retracted');
CREATE TYPE asset_status_enum AS ENUM
  ('pending', 'uploaded', 'processed', 'failed', 'deleted');
CREATE TYPE witness_location_mode_enum AS ENUM
  ('auto_gps_city', 'manual_city', 'denied_fallback_manual');
CREATE TYPE witness_submission_status_enum AS ENUM
  ('received', 'validated', 'awaiting_upload', 'uploading',
   'uploaded', 'processing', 'awaiting_moderation',
   'approved', 'rejected', 'failed', 'withdrawn');
CREATE TYPE witness_moderation_decision_enum AS ENUM
  ('approved', 'rejected', 'escalated');

-- ----- Tables -----

CREATE TABLE cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name_zh TEXT NOT NULL,
  name_en TEXT NOT NULL,
  name_canonical TEXT NOT NULL,
  alternate_names TEXT[] NULL,
  country_code CHAR(2) NOT NULL,
  country_name_zh TEXT NOT NULL,
  country_name_en TEXT NOT NULL,
  admin1_code TEXT NULL,
  admin1_name TEXT NULL,
  place_type place_type_enum NOT NULL DEFAULT 'city',
  timezone TEXT NOT NULL,
  latitude NUMERIC(9,6) NOT NULL,
  longitude NUMERIC(9,6) NOT NULL,
  layer layer_enum NOT NULL,
  page_state city_page_state_enum NOT NULL DEFAULT 'A_seed_editorial',
  state_level city_state_level_enum NOT NULL DEFAULT 'L0_mapped',
  hero_media_url TEXT NULL,
  hero_media_width INTEGER NULL,
  hero_media_height INTEGER NULL,
  hero_media_alt TEXT NULL,
  hero_media_focus TEXT NULL,
  hero_source TEXT NULL,
  hero_creator TEXT NULL,
  hero_license TEXT NULL,
  hero_credit_requirement TEXT NULL,
  editorial_only BOOLEAN NOT NULL DEFAULT false,
  visual_status visual_status_enum NOT NULL DEFAULT 'seed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ NULL,

  CONSTRAINT chk_slug_format CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  CONSTRAINT chk_country_code_format CHECK (country_code ~ '^[A-Z]{2}$')
);

CREATE INDEX idx_cities_slug ON cities (slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_cities_layer ON cities (layer) WHERE deleted_at IS NULL;
CREATE INDEX idx_cities_page_state ON cities (page_state) WHERE deleted_at IS NULL;
CREATE INDEX idx_cities_country_code ON cities (country_code) WHERE deleted_at IS NULL;


CREATE TABLE moments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID NOT NULL REFERENCES cities(id) ON DELETE RESTRICT,
  public_city_name TEXT NOT NULL,
  captured_at TIMESTAMPTZ NOT NULL,
  captured_at_tz TEXT NOT NULL,
  captured_at_source captured_at_source_enum NOT NULL DEFAULT 'fallback_upload_time',
  captured_at_confidence captured_at_confidence_enum NOT NULL DEFAULT 'untrusted',
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ NULL,
  image_variants JSONB NOT NULL,
  source_type domain_source_type_enum NOT NULL,
  source_specific_type moment_source_type_enum NULL,
  provenance_status moment_provenance_status_enum NOT NULL DEFAULT 'unknown',
  moderation_status moment_moderation_status_enum NOT NULL DEFAULT 'pending',
  rights_status rights_status_enum NOT NULL DEFAULT 'unknown',
  credit_line TEXT NULL,
  credit_source_url TEXT NULL,
  caption_zh TEXT NULL,
  caption_en TEXT NULL,
  witness_id TEXT NULL,
  editorial_category moment_editorial_category_enum NULL,
  editorial_note TEXT NULL,
  raw_location JSONB NULL,             -- ADMIN ONLY · never in public serializer
  location_verification_status location_verification_status_enum NULL,
  location_verification_method location_verification_method_enum NULL,
  location_verified_at TIMESTAMPTZ NULL,
  sources JSONB NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ NULL,

  CONSTRAINT chk_image_variants_min CHECK (jsonb_array_length(image_variants) >= 1),
  CONSTRAINT chk_image_variants_max CHECK (jsonb_array_length(image_variants) <= 8),
  CONSTRAINT chk_witness_self_reported CHECK (
    (provenance_status = 'self_reported' AND witness_id IS NOT NULL) OR
    (provenance_status != 'self_reported')
  )
);

CREATE INDEX idx_moments_city_captured_at
  ON moments (city_id, captured_at DESC)
  WHERE deleted_at IS NULL AND moderation_status = 'approved';

CREATE INDEX idx_moments_source_type
  ON moments (source_type)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_moments_moderation_status
  ON moments (moderation_status)
  WHERE deleted_at IS NULL;


CREATE TABLE editions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  slots JSONB NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  is_fallback BOOLEAN NOT NULL DEFAULT false,
  replaces_edition_id UUID NULL REFERENCES editions(id) ON DELETE SET NULL,
  published_at TIMESTAMPTZ NULL,
  status edition_status_enum NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ NULL,

  CONSTRAINT chk_slots_length CHECK (jsonb_array_length(slots) = 12),
  CONSTRAINT chk_status_no_scheduled CHECK (status != 'scheduled'),
  CONSTRAINT chk_version_positive CHECK (version >= 1)
);

CREATE INDEX idx_editions_date_desc_fallback
  ON editions (date DESC, is_fallback)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_editions_published
  ON editions (date DESC)
  WHERE deleted_at IS NULL AND status = 'published';

CREATE UNIQUE INDEX uq_editions_date_published
  ON editions (date)
  WHERE deleted_at IS NULL AND status = 'published';


CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  moment_id UUID NULL REFERENCES moments(id) ON DELETE SET NULL,
  uploaded_by_submission_id UUID NULL,
  storage_bucket TEXT NOT NULL,
  storage_path_original TEXT NOT NULL UNIQUE,
  storage_path_variants JSONB NOT NULL,
  mime TEXT NOT NULL,
  bytes_original INTEGER NOT NULL,
  width_original INTEGER NULL,
  height_original INTEGER NULL,
  exif_stripped BOOLEAN NOT NULL DEFAULT false,
  exif_gps_stripped BOOLEAN NOT NULL DEFAULT false,
  upload_status asset_status_enum NOT NULL DEFAULT 'pending',
  processing_error TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ NULL,

  CONSTRAINT chk_mime_whitelist CHECK (mime IN ('image/jpeg', 'image/png', 'image/webp')),
  CONSTRAINT chk_size_limit CHECK (bytes_original > 0 AND bytes_original <= 20971520)
);

CREATE INDEX idx_assets_moment_id ON assets (moment_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_assets_status ON assets (upload_status) WHERE deleted_at IS NULL;


CREATE TABLE witness_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_key TEXT NOT NULL,
  session_token TEXT NOT NULL,
  session_expires_at TIMESTAMPTZ NOT NULL,
  city_id UUID NOT NULL REFERENCES cities(id) ON DELETE RESTRICT,
  location_mode witness_location_mode_enum NOT NULL,
  captured_at_client TIMESTAMPTZ NOT NULL,
  captured_at_submission TIMESTAMPTZ NOT NULL,
  captured_at_source captured_at_source_enum NOT NULL DEFAULT 'fallback_upload_time',
  captured_at_confidence captured_at_confidence_enum NOT NULL DEFAULT 'untrusted',
  exif_stripped BOOLEAN NOT NULL DEFAULT false,
  exif_gps_stripped BOOLEAN NOT NULL DEFAULT false,
  original_exif_summary JSONB NULL,
  text_note TEXT NULL,
  asset_id UUID NULL REFERENCES assets(id) ON DELETE SET NULL,
  status witness_submission_status_enum NOT NULL DEFAULT 'received',
  status_reason TEXT NULL,
  status_history JSONB NOT NULL DEFAULT '[]'::jsonb,
  moderation_decision witness_moderation_decision_enum NULL,
  moderation_reason TEXT NULL,
  moderated_at TIMESTAMPTZ NULL,
  moderated_by TEXT NULL,
  result_moment_id UUID NULL REFERENCES moments(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ NULL,
  withdrawn_at TIMESTAMPTZ NULL,

  CONSTRAINT chk_text_note_length CHECK (text_note IS NULL OR length(text_note) <= 200),
  CONSTRAINT chk_session_token_format CHECK (length(session_token) >= 32),
  CONSTRAINT chk_gps_stripped_for_public CHECK (
    -- GPS must be stripped for any submission with raw_location
    -- (defensive: catch accidental retention)
    NOT (exif_gps_stripped = false AND location_mode = 'auto_gps_city')
  )
);

CREATE UNIQUE INDEX uq_witness_submissions_client_key_active
  ON witness_submissions (client_key)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_witness_submissions_city_id
  ON witness_submissions (city_id)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_witness_submissions_status
  ON witness_submissions (status)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_witness_submissions_session_expires
  ON witness_submissions (session_expires_at)
  WHERE deleted_at IS NULL;

-- ----- Functions -----

-- Auto-update updated_at on row modification
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables
CREATE TRIGGER trg_cities_updated_at BEFORE UPDATE ON cities
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_moments_updated_at BEFORE UPDATE ON moments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_editions_updated_at BEFORE UPDATE ON editions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_assets_updated_at BEFORE UPDATE ON assets
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_witness_submissions_updated_at BEFORE UPDATE ON witness_submissions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

---

## 5. Drizzle Schema 源代码（`api/src/db/schema.ts`）

> **TypeScript 端 schema 定义** · Drizzle ORM 自动从 TS schema 生成 SQL migration

```typescript
// api/src/db/schema.ts
import {
  pgTable, uuid, text, char, integer, boolean, numeric,
  timestamp, date, jsonb, pgEnum, uniqueIndex, index, check,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const layerEnum = pgEnum('layer_enum', ['blue', 'yellow', 'red']);
export const cityPageStateEnum = pgEnum('city_page_state_enum', [
  'A_seed_editorial', 'B_active', 'C_low_activity', 'D_past_only', 'E_empty',
]);
export const cityStateLevelEnum = pgEnum('city_state_level_enum', [
  'L0_mapped', 'L1_contextualized', 'L2_witnessed', 'L3_active', 'L4_living_archive',
]);
export const placeTypeEnum = pgEnum('place_type_enum', [
  'city', 'town', 'natural_place', 'historic_site', 'coordinates',
]);
export const visualStatusEnum = pgEnum('visual_status_enum', ['seed', 'placeholder', 'none']);
export const capturedAtSourceEnum = pgEnum('captured_at_source_enum', [
  'exif', 'camera', 'user_confirmed', 'admin', 'fallback_upload_time',
]);
export const capturedAtConfidenceEnum = pgEnum('captured_at_confidence_enum', [
  'high', 'medium', 'low', 'untrusted',
]);
export const domainSourceTypeEnum = pgEnum('domain_source_type_enum', ['witness', 'seed', 'editorial']);
export const momentSourceTypeEnum = pgEnum('moment_source_type_enum', [
  'reuters', 'ap', 'adobe', 'shutterstock', 'wikimedia', 'unsplash', 'manual',
]);
export const momentProvenanceStatusEnum = pgEnum('moment_provenance_status_enum', [
  'self_reported', 'trusted_source', 'editorial', 'unknown',
]);
export const momentModerationStatusEnum = pgEnum('moment_moderation_status_enum', [
  'pending', 'approved', 'rejected', 'flagged',
]);
export const momentEditorialCategoryEnum = pgEnum('moment_editorial_category_enum', [
  'landmark', 'nature', 'street', 'culture', 'people', 'weather', 'other',
]);
export const locationVerificationStatusEnum = pgEnum('location_verification_status_enum', [
  'verified', 'approximate', 'unverified',
]);
export const locationVerificationMethodEnum = pgEnum('location_verification_method_enum', [
  'gps', 'manual', 'inferred',
]);
export const rightsStatusEnum = pgEnum('rights_status_enum', [
  'cc_by', 'cc_by_sa', 'cc0', 'all_rights_reserved', 'unknown',
]);
export const editionStatusEnum = pgEnum('edition_status_enum', [
  // 'scheduled' deliberately omitted (OD-03)
  'draft', 'preview', 'published', 'replaced', 'retracted',
]);
export const assetStatusEnum = pgEnum('asset_status_enum', [
  'pending', 'uploaded', 'processed', 'failed', 'deleted',
]);
export const witnessLocationModeEnum = pgEnum('witness_location_mode_enum', [
  'auto_gps_city', 'manual_city', 'denied_fallback_manual',
]);
export const witnessSubmissionStatusEnum = pgEnum('witness_submission_status_enum', [
  'received', 'validated', 'awaiting_upload', 'uploading',
  'uploaded', 'processing', 'awaiting_moderation',
  'approved', 'rejected', 'failed', 'withdrawn',
]);
export const witnessModerationDecisionEnum = pgEnum('witness_moderation_decision_enum', [
  'approved', 'rejected', 'escalated',
]);

// ----- cities -----
export const cities = pgTable('cities', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  nameZh: text('name_zh').notNull(),
  nameEn: text('name_en').notNull(),
  nameCanonical: text('name_canonical').notNull(),
  alternateNames: text('alternate_names').array(),
  countryCode: char('country_code', { length: 2 }).notNull(),
  countryNameZh: text('country_name_zh').notNull(),
  countryNameEn: text('country_name_en').notNull(),
  admin1Code: text('admin1_code'),
  admin1Name: text('admin1_name'),
  placeType: placeTypeEnum('place_type').notNull().default('city'),
  timezone: text('timezone').notNull(),
  latitude: numeric('latitude', { precision: 9, scale: 6 }).notNull(),
  longitude: numeric('longitude', { precision: 9, scale: 6 }).notNull(),
  layer: layerEnum('layer').notNull(),
  pageState: cityPageStateEnum('page_state').notNull().default('A_seed_editorial'),
  stateLevel: cityStateLevelEnum('state_level').notNull().default('L0_mapped'),
  heroMediaUrl: text('hero_media_url'),
  heroMediaWidth: integer('hero_media_width'),
  heroMediaHeight: integer('hero_media_height'),
  heroMediaAlt: text('hero_media_alt'),
  heroMediaFocus: text('hero_media_focus'),
  heroSource: text('hero_source'),
  heroCreator: text('hero_creator'),
  heroLicense: text('hero_license'),
  heroCreditRequirement: text('hero_credit_requirement'),
  editorialOnly: boolean('editorial_only').notNull().default(false),
  visualStatus: visualStatusEnum('visual_status').notNull().default('seed'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (t) => ({
  slugIdx: uniqueIndex('uq_cities_slug').on(t.slug),
  layerIdx: index('idx_cities_layer').on(t.layer).where(sql`${t.deletedAt} IS NULL`),
  pageStateIdx: index('idx_cities_page_state').on(t.pageState).where(sql`${t.deletedAt} IS NULL`),
  countryIdx: index('idx_cities_country_code').on(t.countryCode).where(sql`${t.deletedAt} IS NULL`),
}));

// ----- moments -----
export const moments = pgTable('moments', {
  id: uuid('id').primaryKey().defaultRandom(),
  cityId: uuid('city_id').notNull().references(() => cities.id, { onDelete: 'restrict' }),
  publicCityName: text('public_city_name').notNull(),
  capturedAt: timestamp('captured_at', { withTimezone: true }).notNull(),
  capturedAtTz: text('captured_at_tz').notNull(),
  capturedAtSource: capturedAtSourceEnum('captured_at_source').notNull().default('fallback_upload_time'),
  capturedAtConfidence: capturedAtConfidenceEnum('captured_at_confidence').notNull().default('untrusted'),
  uploadedAt: timestamp('uploaded_at', { withTimezone: true }).notNull().defaultNow(),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  imageVariants: jsonb('image_variants').$type<ImageVariant[]>().notNull(),
  sourceType: domainSourceTypeEnum('source_type').notNull(),
  sourceSpecificType: momentSourceTypeEnum('source_specific_type'),
  provenanceStatus: momentProvenanceStatusEnum('provenance_status').notNull().default('unknown'),
  moderationStatus: momentModerationStatusEnum('moderation_status').notNull().default('pending'),
  rightsStatus: rightsStatusEnum('rights_status').notNull().default('unknown'),
  creditLine: text('credit_line'),
  creditSourceUrl: text('credit_source_url'),
  captionZh: text('caption_zh'),
  captionEn: text('caption_en'),
  witnessId: text('witness_id'),
  editorialCategory: momentEditorialCategoryEnum('editorial_category'),
  editorialNote: text('editorial_note'),
  rawLocation: jsonb('raw_location').$type<RawLocation>(),       // ADMIN ONLY
  locationVerificationStatus: locationVerificationStatusEnum('location_verification_status'),
  locationVerificationMethod: locationVerificationMethodEnum('location_verification_method'),
  locationVerifiedAt: timestamp('location_verified_at', { withTimezone: true }),
  sources: jsonb('sources').$type<MomentSource[]>(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (t) => ({
  cityCapturedIdx: index('idx_moments_city_captured_at')
    .on(t.cityId, sql`${t.capturedAt} DESC`)
    .where(sql`${t.deletedAt} IS NULL AND ${t.moderationStatus} = 'approved'`),
  sourceTypeIdx: index('idx_moments_source_type').on(t.sourceType).where(sql`${t.deletedAt} IS NULL`),
  moderationIdx: index('idx_moments_moderation_status').on(t.moderationStatus).where(sql`${t.deletedAt} IS NULL`),
}));

// ----- editions -----
export const editions = pgTable('editions', {
  id: uuid('id').primaryKey().defaultRandom(),
  date: date('date').notNull(),
  slots: jsonb('slots').$type<EditionSlot[]>().notNull(),
  version: integer('version').notNull().default(1),
  isFallback: boolean('is_fallback').notNull().default(false),
  replacesEditionId: uuid('replaces_edition_id').references((): any => editions.id, { onDelete: 'set null' }),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  status: editionStatusEnum('status').notNull().default('draft'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (t) => ({
  dateFallbackIdx: index('idx_editions_date_desc_fallback')
    .on(sql`${t.date} DESC`, t.isFallback)
    .where(sql`${t.deletedAt} IS NULL`),
  publishedIdx: index('idx_editions_published')
    .on(sql`${t.date} DESC`)
    .where(sql`${t.deletedAt} IS NULL AND ${t.status} = 'published'`),
  datePublishedUq: uniqueIndex('uq_editions_date_published')
    .on(t.date)
    .where(sql`${t.deletedAt} IS NULL AND ${t.status} = 'published'`),
  slotsLengthCheck: check('chk_slots_length', sql`jsonb_array_length(${t.slots}) = 12`),
  noScheduledCheck: check('chk_status_no_scheduled', sql`${t.status} != 'scheduled'`),
}));

// ----- assets -----
export const assets = pgTable('assets', {
  id: uuid('id').primaryKey().defaultRandom(),
  momentId: uuid('moment_id').references(() => moments.id, { onDelete: 'set null' }),
  uploadedBySubmissionId: uuid('uploaded_by_submission_id'),
  storageBucket: text('storage_bucket').notNull(),
  storagePathOriginal: text('storage_path_original').notNull().unique(),
  storagePathVariants: jsonb('storage_path_variants').notNull(),
  mime: text('mime').notNull(),
  bytesOriginal: integer('bytes_original').notNull(),
  widthOriginal: integer('width_original'),
  heightOriginal: integer('height_original'),
  exifStripped: boolean('exif_stripped').notNull().default(false),
  exifGpsStripped: boolean('exif_gps_stripped').notNull().default(false),
  uploadStatus: assetStatusEnum('upload_status').notNull().default('pending'),
  processingError: text('processing_error'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (t) => ({
  momentIdx: index('idx_assets_moment_id').on(t.momentId).where(sql`${t.deletedAt} IS NULL`),
  statusIdx: index('idx_assets_status').on(t.uploadStatus).where(sql`${t.deletedAt} IS NULL`),
}));

// ----- witness_submissions -----
export const witnessSubmissions = pgTable('witness_submissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientKey: text('client_key').notNull(),
  sessionToken: text('session_token').notNull(),
  sessionExpiresAt: timestamp('session_expires_at', { withTimezone: true }).notNull(),
  cityId: uuid('city_id').notNull().references(() => cities.id, { onDelete: 'restrict' }),
  locationMode: witnessLocationModeEnum('location_mode').notNull(),
  capturedAtClient: timestamp('captured_at_client', { withTimezone: true }).notNull(),
  capturedAtSubmission: timestamp('captured_at_submission', { withTimezone: true }).notNull(),
  capturedAtSource: capturedAtSourceEnum('captured_at_source').notNull().default('fallback_upload_time'),
  capturedAtConfidence: capturedAtConfidenceEnum('captured_at_confidence').notNull().default('untrusted'),
  exifStripped: boolean('exif_stripped').notNull().default(false),
  exifGpsStripped: boolean('exif_gps_stripped').notNull().default(false),
  originalExifSummary: jsonb('original_exif_summary'),
  textNote: text('text_note'),
  assetId: uuid('asset_id').references(() => assets.id, { onDelete: 'set null' }),
  status: witnessSubmissionStatusEnum('status').notNull().default('received'),
  statusReason: text('status_reason'),
  statusHistory: jsonb('status_history').notNull().default('[]'),
  moderationDecision: witnessModerationDecisionEnum('moderation_decision'),
  moderationReason: text('moderation_reason'),
  moderatedAt: timestamp('moderated_at', { withTimezone: true }),
  moderatedBy: text('moderated_by'),
  resultMomentId: uuid('result_moment_id').references(() => moments.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  withdrawnAt: timestamp('withdrawn_at', { withTimezone: true }),
}, (t) => ({
  clientKeyActiveUq: uniqueIndex('uq_witness_submissions_client_key_active')
    .on(t.clientKey)
    .where(sql`${t.deletedAt} IS NULL`),
  cityIdx: index('idx_witness_submissions_city_id').on(t.cityId).where(sql`${t.deletedAt} IS NULL`),
  statusIdx: index('idx_witness_submissions_status').on(t.status).where(sql`${t.deletedAt} IS NULL`),
  sessionExpiresIdx: index('idx_witness_submissions_session_expires')
    .on(t.sessionExpiresAt).where(sql`${t.deletedAt} IS NULL`),
}));

// Type exports (aligned with Zod schemas)
export type ImageVariant = {
  variant: 'thumb_320' | 'card_640' | 'detail_1280' | 'full_2560';
  url: string;
  width: number;
  height: number;
  mime: 'image/webp' | 'image/jpeg' | 'image/png' | 'image/avif';
  bytes?: number;
};

export type RawLocation = {
  latitude: number;
  longitude: number;
  accuracy_m?: number;
  altitude_m?: number;
};

export type EditionSlot = {
  position: number;
  moment_id: string | null;
  city_id: string | null;
  fallback_reason: string | null;
  is_editorial_fill: boolean;
};

export type MomentSource = {
  name: string;
  url?: string;
  type: 'reuters' | 'ap' | 'adobe' | 'shutterstock' | 'wikimedia' | 'unsplash' | 'manual';
};
```

---

## 6. Migration 执行流程

### 6.1 工具命令

```bash
# api/ 目录下

# 1. 配置 drizzle.config.ts
pnpm add -D drizzle-kit
pnpm add drizzle-orm postgres @supabase/supabase-js sharp exifr zod

# 2. 生成 migration（基于 schema.ts）
pnpm drizzle-kit generate

# 3. 本地 Supabase 验证（可选 · 推荐）
supabase start
pnpm drizzle-kit migrate

# 4. 部署到 Supabase (production = sethearth-alpha)
DATABASE_URL="postgresql://postgres:..." pnpm drizzle-kit migrate
```

### 6.2 CI 集成（Phase 2）

```yaml
# .github/workflows/api-migrate.yml
name: API Migrate
on:
  push:
    branches: [alpha-api]
    paths: [api/drizzle/**, api/src/db/**]
jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: cd api && pnpm install --frozen-lockfile
      - run: cd api && pnpm drizzle-kit migrate
        env:
          DATABASE_URL: ${{ secrets.SUPABASE_DATABASE_URL }}
```

> **Phase 1 简化**：Vercel build command 集成 `pnpm drizzle-kit migrate` 自动跑 migration（Hobby plan 限制 preview deployments 100/天，可控）。

---

## 7. Seed Data 策略

**Phase 1 seed 来源**：`release-v1/alpha-environment/seed-report-alpha.json`（已有 · Round 2A 完成）

**Seed 脚本**（`api/scripts/seed-phase1.ts`）：

```typescript
// api/scripts/seed-phase1.ts
import { db } from '../src/db/client';
import { cities, moments, editions } from '../src/db/schema';
import seedData from '../../release-v1/alpha-environment/seed-report-alpha.json' assert { type: 'json' };

async function seed() {
  // 1. Cities (12)
  for (const c of seedData.cities) {
    await db.insert(cities).values({
      slug: c.slug,
      nameZh: c.nameZh,
      nameEn: c.nameEn,
      nameCanonical: c.nameEn,
      countryCode: lookupCountryCode(c.countryEn),
      countryNameZh: c.countryZh,
      countryNameEn: c.countryEn,
      timezone: c.timezone,
      latitude: c.lat.toString(),
      longitude: c.lon.toString(),
      layer: ['kyoto', 'lisbon', 'shanghai', 'mexico-city', 'cape-town', 'london'].includes(c.id)
        ? 'yellow' : (['tokyo', 'rio', 'berlin', 'rome', 'sydney'].includes(c.id) ? 'blue' : 'red'),
      pageState: 'A_seed_editorial',
      visualStatus: 'seed',
    }).onConflictDoNothing();
  }

  // 2. Moments (6) — text-only legacy
  for (const m of seedData.moments) {
    // ...
  }

  // 3. Editions (Daily 12) — generate for today + last 7 days
  // ...

  console.log('Seed complete.');
}

seed();
```

**Seed 验证**：smoke test 必须验证 cities.length == 12 · moments 至少 6 · today edition.slots.length == 12。

---

## 8. Privacy & 边界

### 8.1 Public Serializer 边界

```typescript
// api/src/lib/privacy.ts
import type { cities as citiesTable } from '../src/db/schema';

/**
 * toPublicCity · Drizzle row → PublicCity Zod schema
 * 强制剥离 latitude / longitude / state_level / hero_media 隐私字段
 */
export function toPublicCity(row: typeof citiesTable.$inferSelect) {
  return {
    id: row.id,
    slug: row.slug,
    names: {
      canonical_name: row.nameCanonical,
      name_zh: row.nameZh,
      name_en: row.nameEn,
      alternate_names: row.alternateNames ?? undefined,
      country_zh: row.countryNameZh,
      country_en: row.countryNameEn,
    },
    timezone: row.timezone,
    layer: row.layer,
    public_location_only: true as const,
    page_state: row.pageState,
    visual: row.heroMediaUrl ? {
      hero_media: {
        url: row.heroMediaUrl,
        width: row.heroMediaWidth ?? 0,
        height: row.heroMediaHeight ?? 0,
        alt: row.heroMediaAlt ?? '',
        focus: row.heroMediaFocus ?? undefined,
      },
      hero_source: row.heroSource ?? undefined,
      hero_creator: row.heroCreator ?? undefined,
      hero_license: row.heroLicense ?? undefined,
      hero_credit_requirement: row.heroCreditRequirement ?? undefined,
      editorial_only: row.editorialOnly,
      visual_status: row.visualStatus,
    } : undefined,
    // ❌ 永远不输出：
    // - latitude / longitude
    // - state_level
    // - admin1_code / admin1_name (admin only)
    // - country_code (在 names 内可用，但精确 lat/lng 不暴露)
  };
}
```

### 8.2 Public Moment Serializer（剥离 raw_location）

```typescript
export function toPublicMoment(row: typeof momentsTable.$inferSelect) {
  return {
    id: row.id,
    city_id: row.cityId,
    public_city_name: row.publicCityName,
    captured_at: row.capturedAt.toISOString(),
    captured_at_tz: row.capturedAtTz,
    captured_at_source: row.capturedAtSource,
    captured_at_confidence: row.capturedAtConfidence,
    uploaded_at: row.uploadedAt.toISOString(),
    published_at: row.publishedAt?.toISOString(),
    image_variants: row.imageVariants,
    source_type: row.sourceType,
    rights: {
      credit_line: row.creditLine ?? '',
      source_url: row.creditSourceUrl ?? undefined,
      rights_status: row.rightsStatus,
    },
    credit: {
      credit_line: row.creditLine ?? '',
      source_url: row.creditSourceUrl ?? undefined,
      rights_status: row.rightsStatus,
    },
    captions: row.captionZh || row.captionEn ? {
      zh: row.captionZh ?? undefined,
      en: row.captionEn ?? undefined,
    } : undefined,
    provenance_status: row.provenanceStatus,
    moderation_status: row.moderationStatus,
    witness_id: row.witnessId ?? undefined,
    editorial: row.editorialCategory ? {
      category: row.editorialCategory,
      note: row.editorialNote ?? undefined,
    } : undefined,
    // ❌ 永远不输出：
    // - raw_location
    // - location_verification_*
    // - sources
    // - source_specific_type
  };
}
```

---

## 9. Blockers（详见 `phase1-blockers-v1.md`）

1. Supabase project 创建（用户手动）
2. DATABASE_URL 获取（用户从 Supabase Dashboard 复制）
3. Seed 数据导入（脚本就绪 · 待 DB 创建）
4. 第一份 Drizzle migration 生成（依赖 schema 评审）

---

## 10. 元数据

| 字段 | 值 |
|---|---|
| 文档版本 | v1 |
| 创建时间 | 2026-08-22 |
| 创建人 | Engineer Agent (Round 2B) |
| 文档 ID | `db-schema-v1.md` |
| 目标 Gate | Gate A · Internal Alpha · Phase 1 |
| 决策状态 | ✅ ACCEPTED（待 PM 评审） |
| Workspace 路径 | `/Users/lwy/Documents/ChatGPT/看见地球/release-v1/vertical-slice-phase1/db-schema-v1.md` |
| Obsidian canonical 路径 | `/Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/vertical-slice-phase1/db-schema-v1.md` |
| Obsidian 同步状态 | ❌ 未同步（sandbox 拒绝写入 Obsidian） |

---

**End of db-schema-v1.md**