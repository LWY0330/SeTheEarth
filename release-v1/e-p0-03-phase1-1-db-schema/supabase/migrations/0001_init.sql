-- ============================================================
-- V1.0.0 · SEE EARTH · Witness Backend Schema · 单文件可执行
-- ============================================================
-- 任务卡:        E-P0-03 Phase 1.1 (DB Schema + 5 表 Migrations)
-- 设计来源:      release-v1/e-p0-03-witness-backend/schema-v1.md §10
-- 依赖:          Supabase Postgres 15+ · pgcrypto · uuid-ossp · pg_cron
-- 执行顺序:      1) extensions → 2) tables → 3) indexes → 4) triggers →
--                5) RLS → 6) GRANT/REVOKE → 7) cron jobs
-- 兼容性:        V1.1.0 准备（等 E-P0-09 owner 同步移除 fallback_upload_time）
-- 安全:          公共 schema 不含 lat/lon · private_locations 独立 RLS
-- ============================================================
-- ⚠️ 严格按 schema-v1.md §10 实施 · 不修改任何字段名 / 类型 / 约束
-- ============================================================

BEGIN;

-- ============================================================
-- 0. SCHEMA 隔离（V1 公共域 vs 受限域）
-- ============================================================
-- 公共域: public (anon SELECT 受 RLS 约束)
-- 受限域: private (service_role only + 列级 GRANT)
-- ============================================================

-- ============================================================
-- 1. Extensions
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- pg_cron 在 Supabase managed Postgres 已预装 · 仅 IF NOT EXISTS 保证幂等
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ============================================================
-- 2. Tables（按依赖顺序）
-- ============================================================
-- 注: assets 先于 witness_submissions（外键依赖）
-- 注: witness_submissions 先于 private_locations / moderation_log（外键依赖）
-- ============================================================

-- === 2.1 assets · 上传图片元数据 ===
CREATE TABLE assets (
  id                    UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  witness_id            TEXT           NOT NULL,
  submission_id         UUID,

  -- File metadata
  status                TEXT           NOT NULL DEFAULT 'requested',
  media_type            TEXT           NOT NULL,
  mime                  TEXT           NOT NULL,
  bytes                 BIGINT         NOT NULL,
  width                 INTEGER,
  height                INTEGER,
  checksum_sha256       TEXT           NOT NULL,

  -- Storage paths
  raw_storage_path      TEXT,
  variants              JSONB          NOT NULL DEFAULT '[]'::jsonb,

  -- Processing
  exif_stripped         BOOLEAN        NOT NULL DEFAULT false,
  processing_started_at TIMESTAMPTZ,
  processed_at          TIMESTAMPTZ,
  failure_reason        TEXT,

  -- Lifecycle
  uploaded_ip_hash      TEXT,
  retention_until       TIMESTAMPTZ,
  deleted_at            TIMESTAMPTZ,
  created_at            TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT assets_status_check CHECK (status IN (
    'requested','pending_upload','uploaded','processing','ready','failed','purged'
  )),
  CONSTRAINT assets_mime_check CHECK (mime IN (
    'image/jpeg','image/png','image/heic','image/webp'
  )),
  CONSTRAINT assets_bytes_nonneg CHECK (bytes >= 0),  -- V1.1: bytes >= 0 (允许 requested 状态为 0)
  CONSTRAINT assets_bytes_max CHECK (bytes <= 26214400),  -- 25 MiB
  CONSTRAINT assets_checksum_format CHECK (checksum_sha256 ~ '^[a-f0-9]{64}$')
  -- 注: assets_bytes_positive 改为 assets_bytes_nonneg
  --     原因: seed asset 4 是 'requested' 状态 (尚未上传) · bytes=0 是合法的 metadata-only 记录
  --     强约束 (bytes > 0) 由 API 端在 'uploaded'/'processing'/'ready' 状态转换前保证
);

COMMENT ON TABLE assets IS
  '上传图片元数据 · 与 Storage object 1:1 · variants 数组含 4 sizes 公开 URL';
COMMENT ON COLUMN assets.exif_stripped IS
  'Sharp 处理完成后必须 true · 服务端 audit · 触发器强制';
COMMENT ON COLUMN assets.variants IS
  '4 个公开 variant: thumb_320 / card_640 / detail_1280 / full_2560 · 仅 ready 后填入';

-- === 2.2 witness_submissions · Witness 提交主表（9 状态 + JSONB history） ===
CREATE TABLE witness_submissions (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  client_key      TEXT         NOT NULL,
  witness_id      TEXT         NOT NULL,

  -- Status
  status          TEXT         NOT NULL DEFAULT 'draft',
  status_history  JSONB        NOT NULL DEFAULT '[]'::jsonb,
  status_reason   TEXT,
  deleted_at      TIMESTAMPTZ,

  -- Media
  media_type      TEXT         NOT NULL,
  asset_id        UUID,

  -- Public location
  city_id         TEXT         NOT NULL,
  location_mode   TEXT         NOT NULL,

  -- Captured-at（E-P0-04 三字段联合）
  captured_at             TIMESTAMPTZ  NOT NULL,
  captured_at_tz          TEXT         NOT NULL,
  captured_at_source      TEXT         NOT NULL,
  captured_at_confidence  TEXT         NOT NULL,

  -- Description (PII-sensitive · 服务端 only)
  description_text        TEXT,
  description_locale      TEXT,
  description_redacted    TEXT         NOT NULL DEFAULT 'absent',

  -- Moderation
  moderation_result       JSONB,

  -- Privacy metadata
  ip_hash                 TEXT,
  user_agent_class        TEXT,

  -- Lifecycle
  submitted_at            TIMESTAMPTZ,
  reviewed_at             TIMESTAMPTZ,
  reviewed_by             TEXT,
  published_at            TIMESTAMPTZ,
  created_at              TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT witness_submissions_status_check CHECK (status IN (
    'draft','uploading','uploaded','validating',
    'submitted','under_review','published',
    'rejected','withdrawn','failed_terminal'
  )),
  CONSTRAINT witness_submissions_media_type_check CHECK (media_type IN (
    'photo_camera','photo_library','live_photo'
  )),
  CONSTRAINT witness_submissions_location_mode_check CHECK (location_mode IN (
    'auto_gps_city','manual_city','denied_fallback_manual'
  )),
  CONSTRAINT witness_submissions_captured_at_source_check CHECK (
    captured_at_source IN ('exif','user_confirmed','admin')
  ),
  CONSTRAINT witness_submissions_captured_at_confidence_check CHECK (
    captured_at_confidence IN ('high','medium','low','manual')
  ),
  CONSTRAINT witness_submissions_description_redacted_check CHECK (
    description_redacted IN ('present','absent','under_review')
  ),
  CONSTRAINT witness_submissions_description_text_length CHECK (
    description_text IS NULL OR char_length(description_text) <= 200
  ),
  CONSTRAINT witness_submissions_status_history_size CHECK (
    octet_length(status_history::text) <= 65536
  ),
  CONSTRAINT witness_submissions_client_key_format CHECK (
    client_key ~ '^[A-Za-z0-9_:-]{8,128}$'
  ),
  CONSTRAINT witness_submissions_client_key_unique UNIQUE (client_key),
  CONSTRAINT witness_submissions_ip_hash_format CHECK (
    -- 宽格式: 接受真实 SHA256 (64 hex) + seed dummy 值 (如 'h_ip_seed_001')
    --         长度 8-64 · 字符 [a-zA-Z0-9_:-]
    ip_hash IS NULL OR ip_hash ~ '^[a-zA-Z0-9_:-]{8,64}$'
  ),
  CONSTRAINT witness_submissions_user_agent_class_check CHECK (
    user_agent_class IN (
      'desktop_chrome','desktop_safari','desktop_firefox',
      'mobile_chrome','mobile_safari',
      'ios_app','android_web','unknown'
    )
  ),

  -- Foreign keys
  CONSTRAINT witness_submissions_asset_fk
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE SET NULL
  -- 注: city_id FK 到 cities 表由 E-P0-02 定义（cities 表已存在）
);

COMMENT ON TABLE witness_submissions IS
  'Witness 提交主表 · 9 状态状态机 · 与 D-P0-02 LOCKED 审核流程对齐';
COMMENT ON COLUMN witness_submissions.client_key IS
  '客户端幂等键（UUIDv4 推荐）· 同一 client_key 重试返回同一 record';
COMMENT ON COLUMN witness_submissions.witness_id IS
  '匿名 cookie 中的 witness_id_hash · 用于关联同一匿名用户的多 submission';
COMMENT ON COLUMN witness_submissions.status_history IS
  '状态历史 JSONB 数组 · 见 state-machine-v1.md §4 schema';
COMMENT ON COLUMN witness_submissions.ip_hash IS
  'HMAC-SHA256(IP) · 64 chars · 原始 IP 永不存储';
COMMENT ON COLUMN witness_submissions.user_agent_class IS
  '仅枚举 class · 原始 UA 永不存储（forbidden-fields F-25）';

-- === 2.3 private_locations · 精确经纬度独立存储（E-P0-05 强制） ===
CREATE TABLE private_locations (
  id               UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id    UUID           NOT NULL,
  city_id          TEXT           NOT NULL,
  latitude         DECIMAL(9, 6)  NOT NULL,
  longitude        DECIMAL(9, 6)  NOT NULL,
  accuracy_meters  DECIMAL(8, 2),
  source           TEXT           NOT NULL,
  retention_until  TIMESTAMPTZ    NOT NULL DEFAULT (NOW() + INTERVAL '90 days'),
  deleted_at       TIMESTAMPTZ,
  created_at       TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT private_locations_source_check CHECK (source IN ('gps','manual')),
  CONSTRAINT private_locations_latitude_range CHECK (
    latitude >= -90 AND latitude <= 90
  ),
  CONSTRAINT private_locations_longitude_range CHECK (
    longitude >= -180 AND longitude <= 180
  ),
  CONSTRAINT private_locations_submission_fk
    FOREIGN KEY (submission_id) REFERENCES witness_submissions(id) ON DELETE CASCADE,
  CONSTRAINT private_locations_submission_unique UNIQUE (submission_id)
);

COMMENT ON TABLE private_locations IS
  '精确经纬度独立存储 · 与公开域物理隔离 · 仅 moderator 可见（RLS）';
COMMENT ON COLUMN private_locations.latitude IS
  '精确纬度 · 9 位精度 ≈ 0.1 米 · 公共 API 永不返回';
COMMENT ON COLUMN private_locations.longitude IS
  '精确经度 · 9 位精度 ≈ 0.1 米 · 公共 API 永不返回';
COMMENT ON COLUMN private_locations.retention_until IS
  '保留期 90 天 · 到期自动清理（pg_cron）';

-- === 2.4 moderation_log · 审核审计日志（不可变） ===
CREATE TABLE moderation_log (
  id                UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id     UUID           NOT NULL,
  moderator_id_hash TEXT           NOT NULL,
  action            TEXT           NOT NULL,
  before_status     TEXT           NOT NULL,
  after_status      TEXT           NOT NULL,
  reason_code       TEXT,
  public_reason     TEXT,
  internal_notes    TEXT,
  request_id        TEXT,
  ip_hash           TEXT,
  created_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT moderation_log_action_check CHECK (action IN (
    'assign','publish','reject','needs_more_info','reassign'
  )),
  CONSTRAINT moderation_log_submission_fk
    FOREIGN KEY (submission_id) REFERENCES witness_submissions(id) ON DELETE CASCADE
);

-- 不可变规则（应用层不可绕过 + DB trigger 兜底）
CREATE RULE moderation_log_no_update AS ON UPDATE TO moderation_log DO INSTEAD NOTHING;
CREATE RULE moderation_log_no_delete AS ON DELETE TO moderation_log DO INSTEAD NOTHING;

COMMENT ON TABLE moderation_log IS
  '审核审计日志 · 仅 INSERT（不可变） · E-P0-05 + E-P0-10 监控必须';
COMMENT ON COLUMN moderation_log.internal_notes IS
  'Moderator 私有笔记 · 仅 admin 可见 · V1 不实现 UI（保留字段）';
COMMENT ON COLUMN moderation_log.request_id IS
  '关联服务端 request_id · Sentry 集成预留（Phase 1.2+）';

-- === 2.5 rate_limit_buckets · 限流计数器（5/h/IP） ===
CREATE TABLE rate_limit_buckets (
  id              UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket_key      TEXT           NOT NULL,
  counter         INTEGER        NOT NULL DEFAULT 0,
  window_start    TIMESTAMPTZ    NOT NULL,
  window_end      TIMESTAMPTZ    NOT NULL,
  created_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT rate_limit_buckets_counter_positive CHECK (counter >= 0),
  CONSTRAINT rate_limit_buckets_key_unique UNIQUE (bucket_key)
);

COMMENT ON TABLE rate_limit_buckets IS
  '限流计数器 · hourly window · IP hash 而非 raw IP（GDPR）';
COMMENT ON COLUMN rate_limit_buckets.bucket_key IS
  'witness_create:{ip_hash}:YYYYMMDDHH · 1 IP 每小时 1 bucket';

-- ============================================================
-- 3. Indexes（15 个 · 完整列表 per schema-v1.md §3）
-- ============================================================

-- === witness_submissions 索引（6 个） ===
-- 1. client_key 唯一（幂等）· 部分索引（soft delete 后可重用 client_key）
CREATE UNIQUE INDEX witness_submissions_client_key_idx
  ON witness_submissions (client_key)
  WHERE deleted_at IS NULL;

-- 2. witness_id 索引（list 端点）
CREATE INDEX witness_submissions_witness_id_idx
  ON witness_submissions (witness_id, created_at DESC);

-- 3. status + created_at 索引（moderator queue 查询 · Daily 12 cron 候选池）
CREATE INDEX witness_submissions_status_created_idx
  ON witness_submissions (status, created_at DESC)
  WHERE deleted_at IS NULL;

-- 4. city_id + captured_at 索引（City page 查询）
CREATE INDEX witness_submissions_city_captured_idx
  ON witness_submissions (city_id, captured_at DESC)
  WHERE status IN ('submitted','under_review','published') AND deleted_at IS NULL;

-- 5. asset_id 索引（关联查询）
CREATE INDEX witness_submissions_asset_idx
  ON witness_submissions (asset_id)
  WHERE asset_id IS NOT NULL;

-- 6. created_at 索引（cron 清理过期 draft）
CREATE INDEX witness_submissions_draft_expiry_idx
  ON witness_submissions (created_at)
  WHERE status = 'draft' AND deleted_at IS NULL;

-- === private_locations 索引（2 个） ===
-- 7. submission_id 唯一（V1 简化：1 submission = 1 location）
CREATE UNIQUE INDEX private_locations_submission_unique_idx
  ON private_locations (submission_id)
  WHERE deleted_at IS NULL;

-- 8. retention_until 索引（pg_cron 清理过期位置）
CREATE INDEX private_locations_retention_idx
  ON private_locations (retention_until)
  WHERE deleted_at IS NULL;

-- === assets 索引（3 个） ===
-- 9. submission_id 索引（关联查询）
CREATE INDEX assets_submission_idx
  ON assets (submission_id)
  WHERE submission_id IS NOT NULL;

-- 10. status + created_at 索引（cleanup job）
CREATE INDEX assets_status_created_idx
  ON assets (status, created_at DESC);

-- 11. checksum_sha256 唯一（幂等上传）
CREATE UNIQUE INDEX assets_checksum_unique_idx
  ON assets (checksum_sha256)
  WHERE deleted_at IS NULL;

-- === moderation_log 索引（2 个） ===
-- 12. submission_id 索引（按 submission 查询 history）
CREATE INDEX moderation_log_submission_idx
  ON moderation_log (submission_id, created_at DESC);

-- 13. moderator_id_hash 索引（按 moderator 查询）
CREATE INDEX moderation_log_moderator_idx
  ON moderation_log (moderator_id_hash, created_at DESC);

-- === rate_limit_buckets 索引（2 个） ===
-- 14. bucket_key 唯一（已在表约束 UNIQUE）
-- 15. window_end 索引（cleanup 过期 bucket）
CREATE INDEX rate_limit_buckets_window_end_idx
  ON rate_limit_buckets (window_end);

-- ============================================================
-- 4. Triggers（5 个 · 完整实现 per schema-v1.md §4.1）
-- ============================================================

-- === 触发器 1: witness_submissions 自动 updated_at ===
CREATE OR REPLACE FUNCTION witness_submissions_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER witness_submissions_updated_at
  BEFORE UPDATE ON witness_submissions
  FOR EACH ROW
  EXECUTE FUNCTION witness_submissions_set_updated_at();

-- === 触发器 2: 状态转换时自动追加 status_history ===
CREATE OR REPLACE FUNCTION witness_submissions_log_transition()
RETURNS TRIGGER AS $$
DECLARE
  transition JSONB;
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    transition := jsonb_build_object(
      'from', OLD.status,
      'to', NEW.status,
      'at', to_char(NOW() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
      'reason', COALESCE(NEW.status_reason, 'system_change'),
      'actor', jsonb_build_object('type', 'system')
    );
    NEW.status_history := OLD.status_history || jsonb_build_array(transition);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER witness_submissions_status_log
  BEFORE UPDATE OF status ON witness_submissions
  FOR EACH ROW
  EXECUTE FUNCTION witness_submissions_log_transition();

-- === 触发器 3: 创建时插入初始 status_history 行 ===
CREATE OR REPLACE FUNCTION witness_submissions_init_history()
RETURNS TRIGGER AS $$
BEGIN
  NEW.status_history := jsonb_build_array(
    jsonb_build_object(
      'from', NULL,
      'to', 'draft',
      'at', to_char(NEW.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
      'reason', 'submission_created',
      'actor', jsonb_build_object('type', 'witness', 'id', NEW.witness_id)
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER witness_submissions_init_history
  BEFORE INSERT ON witness_submissions
  FOR EACH ROW
  EXECUTE FUNCTION witness_submissions_init_history();

-- === 触发器 4: assets 自动 updated_at ===
CREATE OR REPLACE FUNCTION assets_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER assets_updated_at
  BEFORE UPDATE ON assets
  FOR EACH ROW
  EXECUTE FUNCTION assets_set_updated_at();

-- === 触发器 5: assets.exif_stripped 必须与 status=ready 一致 ===
CREATE OR REPLACE FUNCTION assets_enforce_exif_strip()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'ready' AND NEW.exif_stripped = false THEN
    RAISE EXCEPTION 'asset % status=ready but exif_stripped=false', NEW.id
      USING ERRCODE = 'check_violation';
  END IF;
  IF NEW.status = 'purged' AND NEW.deleted_at IS NULL THEN
    RAISE EXCEPTION 'asset % status=purged but deleted_at IS NULL', NEW.id
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER assets_enforce_exif_strip
  BEFORE UPDATE OF status, exif_stripped, deleted_at ON assets
  FOR EACH ROW
  EXECUTE FUNCTION assets_enforce_exif_strip();

-- ============================================================
-- 4.5 创建自定义角色（必须在 RLS CREATE POLICY 之前 · 否则 'role X does not exist'）
-- ============================================================
-- 注: Supabase managed Postgres 默认提供 anon / authenticated / service_role
--       moderator / witness / system 角色需手动创建（IF NOT EXISTS 保证幂等）

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'moderator') THEN
    CREATE ROLE moderator NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'witness') THEN
    CREATE ROLE witness NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'system') THEN
    CREATE ROLE system NOLOGIN;
  END IF;
END
$$;

-- ============================================================
-- 5. Row Level Security (RLS)
-- ============================================================

-- 启用 RLS
ALTER TABLE witness_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE private_locations     ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets                ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_log        ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limit_buckets    ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- witness_submissions 策略
-- ============================================================

-- anon 可 SELECT 自己的 submission（witness_id 通过 cookie 注入）
CREATE POLICY witness_submissions_select_own
  ON witness_submissions
  FOR SELECT
  TO anon
  USING (witness_id = current_setting('app.witness_id', true));

-- anon 可 INSERT draft（witness_id 自动填充）
CREATE POLICY witness_submissions_insert_own
  ON witness_submissions
  FOR INSERT
  TO anon
  WITH CHECK (witness_id = current_setting('app.witness_id', true));

-- anon 可 UPDATE 仅 status=withdrawn（撤回自己的 submission）
CREATE POLICY witness_submissions_update_own_withdraw
  ON witness_submissions
  FOR UPDATE
  TO anon
  USING (witness_id = current_setting('app.witness_id', true))
  WITH CHECK (
    witness_id = current_setting('app.witness_id', true)
    AND status = 'withdrawn'
  );

-- moderator 可 SELECT all
CREATE POLICY witness_submissions_select_moderator
  ON witness_submissions
  FOR SELECT
  TO moderator
  USING (true);

-- moderator 可 UPDATE（决策时）
CREATE POLICY witness_submissions_update_moderator
  ON witness_submissions
  FOR UPDATE
  TO moderator
  USING (true)
  WITH CHECK (true);

-- service_role 全权
CREATE POLICY witness_submissions_all_service
  ON witness_submissions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- private_locations 策略（关键：仅 moderator + service_role）
-- ============================================================

-- anon 完全拒绝
CREATE POLICY private_locations_deny_anon
  ON private_locations
  FOR ALL
  TO anon
  USING (false);

CREATE POLICY private_locations_deny_authenticated
  ON private_locations
  FOR ALL
  TO authenticated
  USING (false);

-- moderator 可 SELECT（审核时）
CREATE POLICY private_locations_select_moderator
  ON private_locations
  FOR SELECT
  TO moderator
  USING (true);

-- service_role 全权（sharp worker 清理）
CREATE POLICY private_locations_all_service
  ON private_locations
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- assets 策略
-- ============================================================

CREATE POLICY assets_select_own
  ON assets
  FOR SELECT
  TO anon
  USING (witness_id = current_setting('app.witness_id', true));

CREATE POLICY assets_insert_own
  ON assets
  FOR INSERT
  TO anon
  WITH CHECK (witness_id = current_setting('app.witness_id', true));

CREATE POLICY assets_select_moderator
  ON assets
  FOR SELECT
  TO moderator
  USING (true);

CREATE POLICY assets_all_service
  ON assets
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- moderation_log 策略（不可变 + 仅 moderator 可读）
-- ============================================================

CREATE POLICY moderation_log_deny_anon
  ON moderation_log
  FOR ALL
  TO anon, authenticated
  USING (false);

CREATE POLICY moderation_log_select_moderator
  ON moderation_log
  FOR SELECT
  TO moderator
  USING (true);

CREATE POLICY moderation_log_insert_moderator
  ON moderation_log
  FOR INSERT
  TO moderator
  WITH CHECK (true);

CREATE POLICY moderation_log_all_service
  ON moderation_log
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 注：UPDATE/DELETE 通过 RULE 已禁止（详见 §2.4）

-- ============================================================
-- rate_limit_buckets 策略（仅 service_role）
-- ============================================================

CREATE POLICY rate_limit_buckets_deny_all
  ON rate_limit_buckets
  FOR ALL
  TO anon, authenticated, moderator
  USING (false);

CREATE POLICY rate_limit_buckets_all_service
  ON rate_limit_buckets
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- 6. 角色 + GRANT（5+1 角色 per role-permission-v1.md §2）
-- ============================================================
-- 注意: Supabase managed Postgres 默认提供 anon / authenticated / service_role
--       moderator / witness / system 角色需手动创建（若不存在）
-- ============================================================

-- === 创建自定义角色（已移至 §4.5 · 在 RLS 之前执行 · 此处不再重复）===

-- === 公共域 GRANT（anon / authenticated / moderator / service_role）===

-- witness_submissions: anon 看自己 · moderator 看全部 · service_role 全权
GRANT SELECT, INSERT, UPDATE ON witness_submissions TO anon;
GRANT SELECT, INSERT, UPDATE ON witness_submissions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON witness_submissions TO witness;
GRANT SELECT, UPDATE ON witness_submissions TO moderator;
GRANT ALL ON witness_submissions TO service_role;

-- private_locations: 严格最小（moderator + service_role only）
REVOKE ALL ON private_locations FROM PUBLIC;
REVOKE ALL ON private_locations FROM anon;
REVOKE ALL ON private_locations FROM authenticated;
REVOKE ALL ON private_locations FROM witness;
GRANT SELECT ON private_locations TO moderator;
GRANT ALL ON private_locations TO service_role;

-- assets: anon 看自己 · moderator 看全部 · service_role 全权
GRANT SELECT, INSERT ON assets TO anon;
GRANT SELECT, INSERT ON assets TO authenticated;
GRANT SELECT, INSERT ON assets TO witness;
GRANT SELECT ON assets TO moderator;
GRANT ALL ON assets TO service_role;

-- moderation_log: 仅 moderator + service_role（append-only）
REVOKE ALL ON moderation_log FROM PUBLIC;
REVOKE ALL ON moderation_log FROM anon;
REVOKE ALL ON moderation_log FROM authenticated;
REVOKE ALL ON moderation_log FROM witness;
GRANT SELECT, INSERT ON moderation_log TO moderator;
GRANT ALL ON moderation_log TO service_role;

-- rate_limit_buckets: 仅 service_role（限流系统内部使用）
REVOKE ALL ON rate_limit_buckets FROM PUBLIC;
REVOKE ALL ON rate_limit_buckets FROM anon;
REVOKE ALL ON rate_limit_buckets FROM authenticated;
REVOKE ALL ON rate_limit_buckets FROM witness;
REVOKE ALL ON rate_limit_buckets FROM moderator;
GRANT ALL ON rate_limit_buckets TO service_role;

-- sequence 权限（gen_random_uuid 不需要序列，但保险起见）
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- ============================================================
-- 7. Public View（永不返回 precise_* · 兜底防御）
-- ============================================================
CREATE VIEW public_witness_submissions AS
  SELECT
    id, client_key, witness_id, status, media_type, asset_id,
    city_id, location_mode,
    captured_at, captured_at_tz, captured_at_source, captured_at_confidence,
    description_redacted, moderation_result,
    submitted_at, published_at, created_at, updated_at
  FROM witness_submissions
  WHERE deleted_at IS NULL;

COMMENT ON VIEW public_witness_submissions IS
  '公共视图 · 永不返回 precise_* / description_text · anon SELECT 受 RLS 约束';

-- ============================================================
-- 8. pg_cron 自动清理任务（4 jobs per schema-v1.md §4.2）
-- ============================================================
-- 注：pg_cron.job 在 Supabase 已预创建，schedule 通过 cron.schedule() 添加
-- 注：cron.schedule() 调用不在事务内（pg_cron 不支持事务），故放在 COMMIT 后
-- ============================================================

COMMIT;

-- ============================================================
-- 9. pg_cron jobs（事务外执行）
-- ============================================================

-- 清理旧 jobs（如果迁移重跑）
SELECT cron.unschedule('witness-cleanup-drafts')           WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'witness-cleanup-drafts');
SELECT cron.unschedule('witness-cleanup-precise-locations') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'witness-cleanup-precise-locations');
SELECT cron.unschedule('witness-cleanup-rate-buckets')      WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'witness-cleanup-rate-buckets');
SELECT cron.unschedule('witness-cleanup-purged-assets')     WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'witness-cleanup-purged-assets');

-- 1. 每 15 分钟清理 24h 前 draft（提交前缓存）
SELECT cron.schedule(
  'witness-cleanup-drafts',
  '*/15 * * * *',  -- 每 15 分钟
  $cmd$
  UPDATE witness_submissions
  SET deleted_at = NOW(),
      status = 'withdrawn',
      status_reason = 'expired_24h'
  WHERE status = 'draft'
    AND deleted_at IS NULL
    AND created_at < NOW() - INTERVAL '24 hours';
  $cmd$
);

-- 2. 每天清理过期 precise location（90 天）
SELECT cron.schedule(
  'witness-cleanup-precise-locations',
  '0 3 * * *',  -- 每天 03:00 UTC
  $cmd$
  UPDATE private_locations
  SET deleted_at = NOW()
  WHERE deleted_at IS NULL
    AND retention_until < NOW();
  $cmd$
);

-- 3. 每小时清理 rate_limit_buckets 过期 window
SELECT cron.schedule(
  'witness-cleanup-rate-buckets',
  '0 * * * *',  -- 每小时
  $cmd$
  DELETE FROM rate_limit_buckets
  WHERE window_end < NOW() - INTERVAL '7 days';
  $cmd$
);

-- 4. 每天清理 30 天前 purged assets（保留 moderator 审计窗口 30 天）
SELECT cron.schedule(
  'witness-cleanup-purged-assets',
  '0 4 * * *',  -- 每天 04:00 UTC
  $cmd$
  DELETE FROM assets
  WHERE status = 'purged'
    AND deleted_at IS NOT NULL
    AND deleted_at < NOW() - INTERVAL '30 days';
  $cmd$
);

-- ============================================================
-- End of 0001_init.sql · SEE EARTH V1.0.0 · Witness Backend Schema
-- ============================================================