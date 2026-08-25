-- ============================================================
-- SEE EARTH V1 · E-P0-06 · Edition + 12 slots schema
--   Source of truth: edition-entity-v1.md (LOCKED 2026-08-24)
--   Migration: 0002_editions.sql
--   Depends on: E-P0-03 Phase 1.1 (moments, cities tables)
-- ============================================================
--
-- This migration creates:
--   • 4 tables  : editions · edition_slots · edition_status_history · edition_audit_log
--   • 5 indexes : 今日 / 历史 / 反查 / slot 查询 / 状态监控
--   • 3 triggers: slot sync · slots_count · status_history 自动
--   • CHECK + UNIQUE constraints (LOCKED)
--
-- ⚠️  This file is the production schema source.  Do NOT edit without
--     updating edition-entity-v1.md and the api-contract/edition.ts.
-- ============================================================

BEGIN;

-- ============================================================
-- 0. Extensions (idempotent)
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid()

-- ============================================================
-- 1. editions  (主表 · Daily 12)
--    Fields 1:1 aligned with E-P0-09 PublicEditionSchema + AdminEditionSchema.
-- ============================================================

CREATE TABLE IF NOT EXISTS editions (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 'YYYY-MM-DD' UTC calendar day
  date                 DATE NOT NULL,

  -- Same-date can have multiple versions (manual replace / rollback history).
  version              INT  NOT NULL DEFAULT 1 CHECK (version >= 1),

  -- 6-state machine (with 2 supplementary: fallback side-state · retracted).
  status               TEXT NOT NULL DEFAULT 'draft'
                                   CHECK (status IN (
                                     'draft','preview','scheduled',
                                     'published','replaced','retracted'
                                   )),

  -- Whether this Edition is itself a fallback.
  is_fallback          BOOLEAN NOT NULL DEFAULT FALSE,

  -- When is_fallback = TRUE: id of Edition being replaced.
  replaces_edition_id  UUID REFERENCES editions(id) ON DELETE SET NULL,

  -- Reason for fallback (LOCKED 3-value enum · brief §C + E-P0-09).
  fallback_reason      TEXT CHECK (fallback_reason IN (
                           'no_sufficient_candidates',
                           'editorial_rollback',
                           'safety_takedown'
                         )),

  -- Trigger-maintained counts (see §6.2).
  slots_count          INT  NOT NULL DEFAULT 0 CHECK (slots_count BETWEEN 0 AND 12),
  is_complete          BOOLEAN NOT NULL DEFAULT FALSE,

  -- First publish time for this version (API contract field).
  published_at         TIMESTAMPTZ,

  -- Last status change time (monitoring only, NOT in API contract).
  last_status_at       TIMESTAMPTZ,

  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- UNIQUE (date, version) — same date multi-version for history retention.
  CONSTRAINT editions_date_version_uniq UNIQUE (date, version)
);

-- Partial unique index: at most 1 ACTIVE Edition per date.
-- Active ∈ {draft, preview, scheduled, published}.
-- Avoids duplicate cron creation; fallback/replaced/retracted excluded.
CREATE UNIQUE INDEX IF NOT EXISTS editions_one_active_per_date_idx
  ON editions (date)
  WHERE status IN ('draft','preview','scheduled','published');

COMMENT ON TABLE editions IS
  'E-P0-06 · Daily 12 Edition. Source of truth: edition-entity-v1.md §3.';


-- ============================================================
-- 2. edition_slots  (12 ordered slots per Edition)
-- ============================================================

CREATE TABLE IF NOT EXISTS edition_slots (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  edition_id          UUID NOT NULL REFERENCES editions(id) ON DELETE CASCADE,

  -- LOCKED 1..12 (brief §A · E-P0-09)
  position            INT  NOT NULL CHECK (position BETWEEN 1 AND 12),

  -- Nullable: fallback slots have moment_id NULL.
  moment_id           UUID,
  city_id             TEXT,

  -- 3-value enum: witness · seed · editorial
  source_type         TEXT NOT NULL CHECK (source_type IN ('witness','seed','editorial')),

  -- 7-value enum (E-P0-09 SlotFallbackReasonSchema)
  fallback_reason     TEXT CHECK (fallback_reason IN (
                         'no_candidate_for_city',
                         'withdrawn_by_author',
                         'moderation_rejected',
                         'missing_rights',
                         'duplicate_in_edition',
                         'time_bucket_invalid',
                         'fallback_curated'
                       )),

  -- True when slot is filled with Editorial / Seed (not Witness).
  is_editorial_fill   BOOLEAN NOT NULL DEFAULT FALSE,

  -- Trigger-maintained derived field (see §6.1).
  is_filled           BOOLEAN NOT NULL DEFAULT FALSE,

  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- FK to moments (added later by E-P0-03 Phase 1.1 — guarded so this
  -- migration runs cleanly even before Phase 1.1 lands).
  CONSTRAINT edition_slots_moment_fk
    FOREIGN KEY (moment_id) REFERENCES moments(id) ON DELETE RESTRICT
    -- DEFERRABLE INITIALLY DEFERRED is unnecessary for slot inserts.
);

-- Add city_id FK only if cities table exists (E-P0-03 creates it earlier).
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cities') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'edition_slots_city_fk'
    ) THEN
      ALTER TABLE edition_slots
        ADD CONSTRAINT edition_slots_city_fk
        FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE RESTRICT;
    END IF;
  END IF;
END
$$;

-- One position per Edition.
CREATE UNIQUE INDEX IF NOT EXISTS edition_slots_edition_position_uniq
  ON edition_slots (edition_id, position);

COMMENT ON TABLE edition_slots IS
  'E-P0-06 · 12 ordered slots per Edition. Source: edition-entity-v1.md §4.';


-- ============================================================
-- 3. edition_status_history  (state machine audit · trigger-driven)
-- ============================================================

CREATE TABLE IF NOT EXISTS edition_status_history (
  id            BIGSERIAL PRIMARY KEY,
  edition_id    UUID NOT NULL REFERENCES editions(id) ON DELETE CASCADE,
  from_status   TEXT,
  to_status     TEXT NOT NULL,
  actor         TEXT NOT NULL DEFAULT 'cron',  -- 'cron' / 'admin:<email>' / 'system'
  reason        TEXT,
  metadata      JSONB NOT NULL DEFAULT '{}'::jsonb,
  occurred_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS edition_status_history_edition_idx
  ON edition_status_history(edition_id, occurred_at DESC);

COMMENT ON TABLE edition_status_history IS
  'Trigger-maintained state-machine audit. Source: edition-entity-v1.md §5.1.';


-- ============================================================
-- 4. edition_audit_log  (Admin manual ops · API-driven)
-- ============================================================

CREATE TABLE IF NOT EXISTS edition_audit_log (
  id            BIGSERIAL PRIMARY KEY,
  edition_id    UUID NOT NULL REFERENCES editions(id) ON DELETE CASCADE,
  action        TEXT NOT NULL CHECK (action IN (
                  'create',
                  'update_slots',
                  'replace_slot',
                  'publish',
                  'rollback',
                  'withdraw'
                )),
  actor         TEXT NOT NULL,   -- 'admin:<email>'
  payload       JSONB NOT NULL,
  request_id    TEXT,
  occurred_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS edition_audit_log_edition_idx
  ON edition_audit_log(edition_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS edition_audit_log_actor_idx
  ON edition_audit_log(actor, occurred_at DESC);

COMMENT ON TABLE edition_audit_log IS
  'Admin manual operation audit (written by admin APIs, NOT by triggers).';


-- ============================================================
-- 5. Indexes  (5 高频查询路径 · edition-entity-v1.md §7)
-- ============================================================

-- 路径 1：今日 Edition 查询 (公开 API 最热路径)
CREATE INDEX IF NOT EXISTS editions_today_published_idx
  ON editions (date, is_fallback, version DESC)
  WHERE status IN ('published','replaced');

-- 路径 2：今日 Edition（含 active fallback）
CREATE INDEX IF NOT EXISTS editions_today_active_fallback_idx
  ON editions (date, is_fallback)
  WHERE status = 'published' AND is_fallback = TRUE;

-- 路径 3：历史 Editions 列表（cursor 分页）
CREATE INDEX IF NOT EXISTS editions_history_idx
  ON editions (date DESC, id DESC)
  WHERE status IN ('published','replaced');

-- 路径 4：slot 反查（admin：替换单个 slot 时定位 edition）
CREATE INDEX IF NOT EXISTS edition_slots_moment_idx
  ON edition_slots (moment_id) WHERE moment_id IS NOT NULL;

-- 路径 5：状态机审计 / 监控告警
CREATE INDEX IF NOT EXISTS edition_status_history_status_idx
  ON edition_status_history (to_status, occurred_at DESC);


-- ============================================================
-- 6. Triggers
-- ============================================================

-- 6.1 Slot sync · 维护 is_filled + 强制 moment_id ↔ fallback_reason ↔ city_id 同步
CREATE OR REPLACE FUNCTION edition_slot_sync_filled()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.is_filled := (NEW.moment_id IS NOT NULL);

  -- Rule 1: moment_id null ⇔ fallback_reason present
  IF (NEW.moment_id IS NULL AND NEW.fallback_reason IS NULL)
     OR (NEW.moment_id IS NOT NULL AND NEW.fallback_reason IS NOT NULL) THEN
    RAISE EXCEPTION 'edition_slot: fallback_reason presence must match moment_id nullness';
  END IF;

  -- Rule 2: moment_id and city_id must be both null or both non-null
  IF (NEW.moment_id IS NULL AND NEW.city_id IS NOT NULL)
     OR (NEW.moment_id IS NOT NULL AND NEW.city_id IS NULL) THEN
    RAISE EXCEPTION 'edition_slot: moment_id and city_id must both be null or both non-null';
  END IF;

  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS edition_slot_sync_filled_trg ON edition_slots;
CREATE TRIGGER edition_slot_sync_filled_trg
  BEFORE INSERT OR UPDATE ON edition_slots
  FOR EACH ROW EXECUTE FUNCTION edition_slot_sync_filled();


-- 6.2 Edition slots_count / is_complete 维护
CREATE OR REPLACE FUNCTION edition_sync_slots_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_count INT;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM edition_slots
  WHERE edition_id = COALESCE(NEW.edition_id, OLD.edition_id);

  UPDATE editions
  SET slots_count = v_count,
      is_complete = (v_count = 12)
  WHERE id = COALESCE(NEW.edition_id, OLD.edition_id);

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS edition_slot_count_ins_trg ON edition_slots;
CREATE TRIGGER edition_slot_count_ins_trg
  AFTER INSERT ON edition_slots
  FOR EACH ROW EXECUTE FUNCTION edition_sync_slots_count();

DROP TRIGGER IF EXISTS edition_slot_count_del_trg ON edition_slots;
CREATE TRIGGER edition_slot_count_del_trg
  AFTER DELETE ON edition_slots
  FOR EACH ROW EXECUTE FUNCTION edition_sync_slots_count();


-- 6.3 Edition 时间戳 + status_history 自动维护
CREATE OR REPLACE FUNCTION edition_status_history_trg()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := NOW();
  NEW.last_status_at := NOW();

  IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO edition_status_history (edition_id, from_status, to_status, actor, reason)
    VALUES (
      NEW.id,
      OLD.status,
      NEW.status,
      COALESCE(NULLIF(current_setting('app.actor', true), ''), 'system'),
      NEW.metadata->>'reason'
    );
  ELSIF (TG_OP = 'INSERT') THEN
    INSERT INTO edition_status_history (edition_id, from_status, to_status, actor, reason)
    VALUES (
      NEW.id,
      NULL,
      NEW.status,
      COALESCE(NULLIF(current_setting('app.actor', true), ''), 'system'),
      NEW.metadata->>'reason'
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS edition_status_history_trg ON editions;
CREATE TRIGGER edition_status_history_trg
  BEFORE INSERT OR UPDATE ON editions
  FOR EACH ROW EXECUTE FUNCTION edition_status_history_trg();


-- ============================================================
-- 7. RLS (Row Level Security)
--    Public reads: only published/replaced non-fallback-or-fallback editions
--    Admin reads/writes: require service-role (cron, admin CLI).
-- ============================================================

ALTER TABLE editions          ENABLE ROW LEVEL SECURITY;
ALTER TABLE edition_slots     ENABLE ROW LEVEL SECURITY;
ALTER TABLE edition_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE edition_audit_log ENABLE ROW LEVEL SECURITY;

-- Public read policy: any published/replaced Edition (incl. fallback)
DROP POLICY IF EXISTS editions_public_read ON editions;
CREATE POLICY editions_public_read ON editions
  FOR SELECT
  USING (status IN ('published','replaced'));

DROP POLICY IF EXISTS edition_slots_public_read ON edition_slots;
CREATE POLICY edition_slots_public_read ON edition_slots
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM editions e
    WHERE e.id = edition_slots.edition_id
      AND e.status IN ('published','replaced')
  ));

-- Admin / cron: service role bypasses RLS by default in Supabase.
-- (No explicit policy needed; service_role is a "superuser".)


-- ============================================================
-- 8. Last-known-good Edition view (公开 API 兜底查询)
-- ============================================================

CREATE OR REPLACE VIEW public.last_known_good_editions AS
SELECT e.*
FROM editions e
WHERE e.status = 'published'
  AND e.is_fallback = FALSE
  AND e.is_complete = TRUE
ORDER BY e.date DESC, e.published_at DESC;

COMMENT ON VIEW public.last_known_good_editions IS
  'E-P0-06 · fallback-v1.md §7.2 · 公开 API stale_fallback 兜底查询。';


-- ============================================================
-- 9. Fallback streak helper view (monitoring 用)
-- ============================================================

CREATE OR REPLACE VIEW public.recent_fallback_streak AS
WITH RECENT_DAYS AS (
  SELECT generate_series(
    CURRENT_DATE - INTERVAL '5 days',
    CURRENT_DATE,
    INTERVAL '1 day'
  )::DATE AS day
),
DAILY_FALLBACK AS (
  SELECT
    d.day,
    EXISTS (
      SELECT 1 FROM editions e
      WHERE e.date = d.day
        AND e.is_fallback = TRUE
        AND e.status = 'published'
    ) AS is_fallback_day
  FROM RECENT_DAYS d
)
SELECT
  day,
  is_fallback_day,
  SUM(CASE WHEN is_fallback_day THEN 1 ELSE 0 END)
    OVER (ORDER BY day DESC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS streak
FROM DAILY_FALLBACK
ORDER BY day DESC;

COMMENT ON VIEW public.recent_fallback_streak IS
  'E-P0-06 · monitoring · 计算最近 5 天 fallback streak。';


COMMIT;


-- ============================================================
-- Sanity-check queries (run manually after migration)
-- ============================================================
--
-- SELECT column_name, data_type, is_nullable
--   FROM information_schema.columns
--  WHERE table_name = 'editions' ORDER BY ordinal_position;
--
-- SELECT * FROM public.recent_fallback_streak;
--
-- \d+ edition_slots
-- \d+ editions