-- ============================================================
-- SEE EARTH V1 · 0000_init_core.sql · Cities + Moments 基表
--   Source of truth: seed-test.sql (实际写入字段反推)
--   原因: 0001_init.sql 不创建 cities / moments 表 (README §限制 3)
--         而 seed-test.sql INSERT INTO cities / moments 必须依赖此段
--   Migration: 0000_init_core.sql
--   ⚠️ 必须先于 0001_init.sql + 0002_editions.sql + seed-test.sql 执行
-- ============================================================
--
-- This migration creates:
--   • 2 tables  : cities · moments
--   • 3 indexes : cities.slug · cities.layer · moments.city_captured_at
--   • 0 triggers: 由 0001 提供
--   • 0 RLS    : 由 0001 提供 (anon SELECT 通过 0001 的公共 view)
--
-- Schema 决策依据 (与 vertical-slice-phase1/db-schema-v1.md §2.6 简化对齐):
--   • cities.id 是 TEXT (slug e.g. 'kyoto') 而非 UUID (per seed-test.sql)
--   • 公共 cities 表无 latitude/longitude (per data-architecture-v1.md §3.1)
--   • 精确位置只在 private_locations (per e-p0-05 隐私基线)
--   • moments.captions_zh/en (复数) per seed-test.sql
--   • moments.source_type 宽 CHECK (seed 含 'local-media'/'weather-data'/'transport-data' 等)
--   • moments.captured_at_source 宽 CHECK (seed 含 'editorial'/'local-media'/'official'/'community'/'weather-data'/'transport-data')
-- ============================================================

BEGIN;

-- ============================================================
-- 1. cities · 12 城基表 (public schema · 无 lat/lon)
-- ============================================================

CREATE TABLE IF NOT EXISTS cities (
  id                    TEXT NOT NULL PRIMARY KEY,

  -- URL-safe slug (regex ^[a-z0-9]+(?:-[a-z0-9]+)*$)
  slug                  TEXT NOT NULL UNIQUE,

  -- 名称 (中英)
  name_zh               TEXT NOT NULL,
  name_en               TEXT NOT NULL,

  -- 国家 (中英 + ISO-2 code)
  country_zh            TEXT NOT NULL,
  country_en            TEXT NOT NULL,
  country_code          CHAR(2) NOT NULL,

  -- 时区 (IANA)
  timezone              TEXT NOT NULL,

  -- Layer (blue / yellow / red · LOCKED per D-P0-01 §4)
  layer                 TEXT NOT NULL DEFAULT 'blue'
                                  CHECK (layer IN ('blue','yellow','red')),

  -- Page state (5 态机)
  page_state            TEXT NOT NULL DEFAULT 'A_seed_editorial'
                                  CHECK (page_state IN (
                                    'A_seed_editorial','B_active',
                                    'C_low_activity','D_past_only','E_empty'
                                  )),

  -- 隐私开关 (公共域是否允许显示精确地点)
  public_location_only  BOOLEAN NOT NULL DEFAULT TRUE,

  -- GeoNames admin1 (可选)
  admin1_code           TEXT,
  admin1_name           TEXT,

  -- Place type (5 枚举 · V1 仅 city/town)
  place_type            TEXT NOT NULL DEFAULT 'city'
                                  CHECK (place_type IN (
                                    'city','town','natural_place',
                                    'historic_site','coordinates'
                                  )),

  -- 后端成熟度 (5 阶 · ADMIN ONLY)
  state_level           TEXT NOT NULL DEFAULT 'L0_mapped'
                                  CHECK (state_level IN (
                                    'L0_mapped','L1_contextualized',
                                    'L2_witnessed','L3_active',
                                    'L4_living_archive'
                                  )),

  -- Audit
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at            TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT chk_cities_slug_format
    CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  CONSTRAINT chk_cities_country_code_format
    CHECK (country_code ~ '^[A-Z]{2}$')
);

CREATE INDEX IF NOT EXISTS idx_cities_slug_active
  ON cities (slug)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_cities_layer
  ON cities (layer)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_cities_page_state
  ON cities (page_state)
  WHERE deleted_at IS NULL;

COMMENT ON TABLE cities IS
  'SEE EARTH V1 · 12 城基表 (公共域 · 无 lat/lon) · seed 12 行';

-- ============================================================
-- 2. moments · 18 moment (12 daily + 6 editorial) 基表
-- ============================================================

CREATE TABLE IF NOT EXISTS moments (
  id                       TEXT NOT NULL PRIMARY KEY,

  -- 关联 cities (TEXT slug FK)
  city_id                  TEXT NOT NULL
                                    REFERENCES cities(id)
                                    ON DELETE RESTRICT,

  -- 反范化 · 用于快速渲染 (避免 JOIN cities)
  public_city_name         TEXT NOT NULL,

  -- Captured-at 三态 (per e-p0-04 captured-at)
  -- 注: source_type 字段宽 CHECK 包含 seed-test.sql 实际用的所有值
  --     (editorial/local-media/official/community/weather-data/transport-data)
  --     + witness 系统的 (exif/camera/user_confirmed/admin/fallback_upload_time)
  captured_at              TIMESTAMPTZ NOT NULL,
  captured_at_tz           TEXT NOT NULL,
  captured_at_source       TEXT NOT NULL DEFAULT 'fallback_upload_time'
                                       CHECK (captured_at_source IN (
                                         'editorial','local-media','official',
                                         'community','weather-data','transport-data',
                                         'witness','seed',
                                         'exif','camera','user_confirmed',
                                         'admin','fallback_upload_time'
                                       )),
  captured_at_confidence   TEXT NOT NULL DEFAULT 'untrusted'
                                       CHECK (captured_at_confidence IN (
                                         'high','medium','low','untrusted'
                                       )),

  -- 时间戳
  uploaded_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at             TIMESTAMPTZ,

  -- 数据源 (宽 CHECK · 包含 editorial/local-media/official/community/weather-data/transport-data/witness/seed)
  source_type              TEXT NOT NULL
                                    CHECK (source_type IN (
                                      'editorial','local-media','official',
                                      'community','weather-data','transport-data',
                                      'witness','seed'
                                    )),

  -- Provenance (来源可信度)
  provenance_status        TEXT NOT NULL DEFAULT 'unknown'
                                    CHECK (provenance_status IN (
                                      'self_reported','trusted_source',
                                      'editorial','unknown'
                                    )),

  -- Moderation
  moderation_status        TEXT NOT NULL DEFAULT 'pending'
                                    CHECK (moderation_status IN (
                                      'pending','approved','rejected','flagged'
                                    )),

  -- Rights / Credit
  rights_status            TEXT NOT NULL DEFAULT 'unknown'
                                    CHECK (rights_status IN (
                                      'cc_by','cc_by_sa','cc0',
                                      'all_rights_reserved','unknown'
                                    )),
  credit_line              TEXT,
  credit_source_url        TEXT,

  -- Witness (optional)
  witness_id               TEXT,
  asset_id                 TEXT,

  -- Editorial classification (12 枚举 · seed 使用: finance/art/nature/romance/culture/urban/weather/transport)
  editorial_category       TEXT
                                    CHECK (editorial_category IN (
                                      'landmark','nature','street','culture',
                                      'people','weather','urban','transport',
                                      'finance','romance','art','other'
                                    )),

  -- 双语文案 (复数 captions per seed)
  captions_zh              TEXT,
  captions_en              TEXT,

  -- Audit
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at               TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT chk_moments_published_implies_approved
    CHECK (
      published_at IS NULL
      OR moderation_status = 'approved'
    )
  -- 注: chk_moments_witness_self_reported (从 vertical-slice 抄来) 已被移除
  --     原因: seed 中 'self_reported' 行 (rio-04/mexico-07/marrakesh-12) 是 community 模拟数据
  --           witness_id IS NULL · 而 vertical-slice 设计假设所有 self_reported 必带 witness_id
  --     决策: witness_id 在 moments 公共域始终可选 · witness_id 强约束由 witness_submissions 保证
);

CREATE INDEX IF NOT EXISTS idx_moments_city_captured_at
  ON moments (city_id, captured_at DESC)
  WHERE deleted_at IS NULL
    AND moderation_status = 'approved';

CREATE INDEX IF NOT EXISTS idx_moments_source_type
  ON moments (source_type)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_moments_moderation_status
  ON moments (moderation_status)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_moments_published_at
  ON moments (published_at DESC)
  WHERE deleted_at IS NULL
    AND published_at IS NOT NULL;

COMMENT ON TABLE moments IS
  'SEE EARTH V1 · moments 基表 (派生 src/data/moments.ts + liveMoments.ts) · seed 18 行';

-- ============================================================
-- 3. updated_at 自动触发器 (cities + moments 共用)
-- ============================================================

CREATE OR REPLACE FUNCTION trg_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS cities_set_updated_at ON cities;
CREATE TRIGGER cities_set_updated_at
  BEFORE UPDATE ON cities
  FOR EACH ROW
  EXECUTE FUNCTION trg_set_updated_at();

DROP TRIGGER IF EXISTS moments_set_updated_at ON moments;
CREATE TRIGGER moments_set_updated_at
  BEFORE UPDATE ON moments
  FOR EACH ROW
  EXECUTE FUNCTION trg_set_updated_at();

-- ============================================================
-- 4. GRANT (per 0001 RLS 模式 · 本段暂开放 SELECT, RLS 由 0001 加)
-- ============================================================
-- 注: 0001_init.sql 会替换这些 GRANT 并加 RLS 策略
-- 本段仅保证 seed-test.sql 用 service_role 能 INSERT

GRANT USAGE ON SCHEMA public TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON cities TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON moments TO service_role;

COMMIT;

-- ============================================================
-- Verification queries (执行后跑这些确认)
-- ============================================================
-- SELECT tablename FROM pg_tables
-- WHERE schemaname = 'public' AND tablename IN ('cities','moments')
-- ORDER BY tablename;
-- 预期: cities, moments (2 rows)

-- SELECT COUNT(*) FROM cities;
-- 预期: 0 (seed-test.sql 才填)

-- SELECT COUNT(*) FROM moments;
-- 预期: 0 (seed-test.sql 才填)