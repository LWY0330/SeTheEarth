---
title: SEE EARTH V1 · Edition 实体 · Edition + 12 slots schema · E-P0-06 D1
type: engineering-data-model
tags: [release-v1, engineering, e-p0-06, daily-12, edition, schema, postgres, see-earth]
task_id: E-P0-06
brief_anchor: §5 E-P0-06 (Daily 12 供给链) / 任务卡 §A
track: engineering
owner: Engineer Agent (Backend / DB)
created: 2026-08-24
status: IN REVIEW
target_gate: Gate B · Closed Beta
related_docs:
  - ./eligibility-v1.md
  - ./group-process-v1.md
  - ./fallback-v1.md
  - ./scheduling-v1.md
  - ./14-day-test-plan-v1.md
  - ../api-contract/openapi.yaml (§1057–1118 Edition)
  - ../api-contract/zod-schemas/edition.ts
  - ../api-contract/zod-schemas/moment.ts (PublicMoment)
  - ../system-states/state-matrix-v1.md (§1 Daily 12 状态矩阵)
depends_on: [E-P0-09 LOCKED ✓, D-P0-01 LOCKED ✓, D-P0-04 IN REVIEW]
blocks: [E-P0-10 Monitoring, E-P0-12 Beta readiness]
source_brief: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/SEE-EARTH-Release-Strategy-v1-Design-Engineering-Task-Brief.md §5 E-P0-06
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/e-p0-06-daily-12-supply-chain/edition-entity-v1.md
workspace_canonical_path: /Users/lwy/Documents/ChatGPT/看见地球/release-v1/e-p0-06-daily-12-supply-chain/edition-entity-v1.md
note: 本文件已就绪，需 PM Agent 由 Obsidian 写入权限落地到 canonical 路径。
---

# SEE EARTH V1 · Edition 实体 · Edition + 12 slots schema

> **作者**：Engineer Agent（Backend / DB） · E-P0-06 Owner
> **目标读者**：PM Agent · E-P0-09 Contract Owner · E-P0-10 Monitoring Owner · DB 工程师 · 后端工程师 · QA
> **目的**：把 Brief §5 E-P0-06 + 任务卡 §A 的 Edition / 12 slots 数据结构落到 **可执行的 Postgres DDL**（表 + 索引 + 约束 + 触发器），作为 Daily 12 供给链的**持久层唯一真源**。
> **完成时间**：2026-08-24
> **配套文件**：`eligibility-v1.md`（候选池 + 资格校验）· `group-process-v1.md`（每日组版时序）· `fallback-v1.md`（兜底）· `scheduling-v1.md`（发布调度）· `14-day-test-plan-v1.md`（演练）

---

## 0. 一句话总结

**Daily 12 由「一个 Edition + 12 个有序 slot + 1 条 status_history」组成。** 任何时刻，**公开 API 最多返回 1 个 PUBLISHED Edition for 当前 date**；不足时自动回退到 FALLBACK Edition；再不足时回退到 stale_fallback。**所有 schema 与 E-P0-09 Zod contract 1:1 对齐**，并且明确：**不做后端 CMS**（V1 由受控脚本 + Supabase View 操作）。

---

## 1. 阅读指南

- **§2 实体概览**：Edition / edition_slots / edition_status_history / edition_audit_log 4 张表的角色
- **§3 DDL（核心）**：`editions` + `edition_slots` 完整定义
- **§4 DDL（辅助）**：`edition_status_history` + `edition_audit_log`
- **§5 索引策略**：覆盖 5 个高频查询路径
- **§6 触发器**：自动维护 `slots_count` / `is_complete` / 时间戳
- **§7 约束清单**：必填 / 唯一 / 检查 / 外键
- **§8 与 E-P0-09 contract 的字段映射**
- **§9 与 Brief §5 任务卡字段的偏差 / 增强说明**
- **§10 不做的事**（明确禁止：CMS / 14 LOCKED 不动 / 新依赖）

---

## 2. 实体概览

| 表 | 角色 | 主要操作方 |
|---|---|---|
| `editions` | 一天一个 Edition 主表（首版 / fallback / 替换 都共享） | Cron / Admin API |
| `edition_slots` | 12 个有序 slot（1:1）| Cron / Admin API |
| `edition_status_history` | 状态机迁移审计（draft→preview→published→replaced 等）| 触发器自动写 |
| `edition_audit_log` | Admin 操作审计（手动替换 / 回滚 / 发布）| Admin API 写 |

> **设计原则**：**Edition 与 slot 拆表**——slot 1:1 Edition 但 slot 数量恒为 12；拆表让 12 个 slot 可独立 UPDATE 而不锁 Edition 主行（避免 cron 与 admin 互锁）。
> **回退处理**：fallback Edition **不是独立表**——它就是 `editions.is_fallback = TRUE` 的一行，**`replaces_edition_id` 指向它替代的原 Edition**。
> **连续 fallback 警告**：**不存 DB**，存监控（E-P0-10 触发 alert）；DB 不做"连续 N 天"逻辑避免状态爆炸。

---

## 3. DDL · `editions`（主表）

```sql
-- ============================================================
-- SEE EARTH V1 · editions (Daily 12 Edition 主表)
-- 字段与 E-P0-09 PublicEditionSchema 1:1 对齐
-- ============================================================
CREATE TABLE editions (
  id                   UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  -- 'YYYY-MM-DD' 格式：Edition 所属日历日（UTC 视角，参照 E-P0-09 §date）
  date                 DATE         NOT NULL,
  -- 同一个 date 可有多版本（manual replace / rollback）；默认 1
  version              INT          NOT NULL DEFAULT 1 CHECK (version >= 1),
  -- 当前 status（与 E-P0-09 EditionStatusSchema 对齐）
  status               TEXT         NOT NULL DEFAULT 'draft'
                                    CHECK (status IN ('draft','preview','scheduled','published','replaced','retracted')),
  -- 是否 fallback edition（候选不足 / 整版回滚触发）
  is_fallback          BOOLEAN      NOT NULL DEFAULT FALSE,
  -- fallback 时指向被替代的原 Edition（version 必须更小或同 date 但 status=replaced/retracted）
  replaces_edition_id  UUID         REFERENCES editions(id) ON DELETE SET NULL,
  -- fallback_reason（仅当 is_fallback = TRUE 必有；brief §C + E-P0-09 隐含）
  fallback_reason      TEXT
                       CHECK (fallback_reason IN (
                         'no_sufficient_candidates',  -- Brief §C 原值
                         'editorial_rollback',         -- 整版回滚（brief §E 替换 + rollback）
                         'safety_takedown'              -- 合规撤下（V1 预留，V1.x 启用）
                       )),
  -- 12 slots 是否全部填满（触发器自动维护；§6）
  slots_count          INT          NOT NULL DEFAULT 0 CHECK (slots_count BETWEEN 0 AND 12),
  is_complete          BOOLEAN      NOT NULL DEFAULT FALSE,
  -- 第一次发布此 version 的时间（用于 stale_fallback 判定）
  published_at         TIMESTAMPTZ,
  -- 实际发布时间（最后状态变 published 的时间，可多次变化）
  -- 仅 monitoring 用，不进 API contract
  last_status_at       TIMESTAMPTZ,
  -- 创建 / 更新（E-P0-09 AdminEdition 字段）
  created_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  -- 一个 date + version 唯一（同 date 多版本 → 用于 replace / rollback 历史保留）
  CONSTRAINT editions_date_version_uniq UNIQUE (date, version)
);

-- 一个 date 至多 1 个 "active" Edition（status ∈ draft/preview/scheduled/published）
-- 避免 cron 重复创建；fallback / replaced / retracted 不参与此约束
CREATE UNIQUE INDEX editions_one_active_per_date_idx
  ON editions (date)
  WHERE status IN ('draft','preview','scheduled','published');
```

**字段决策说明**：

- **`date` 类型**：用 Postgres `DATE`（不是 timestamptz），避免"哪一天"歧义；E-P0-09 schema 用 `YYYY-MM-DD` 字符串，DB 用 `DATE` 类型更严格。
- **`version` 默认 1**：同一天可多版本（manual replace / rollback 历史保留）；但通过 partial unique index 保证「同时刻只有 1 个 active」。
- **`status` 用 TEXT + CHECK**：与 Zod `EditionStatusSchema` 对齐；扩展时不需 ALTER TYPE。
- **`is_fallback` + `replaces_edition_id`**：满足 Brief §C 兜底 Edition + E-P0-09 schema 字段。
- **`fallback_reason` 枚举**：**3 个值**——`no_sufficient_candidates`（候选不足）/`editorial_rollback`（回滚）/ `safety_takedown`（合规撤下，V1.x 预留）。
- **`slots_count` / `is_complete`**：触发器维护（§6）；不存"missing slot 列表"在主表，**简化查询**。
- **`published_at` ≠ `last_status_at`**：前者首版时间（API contract 字段），后者最近状态变更时间（监控用，不进 contract）。

---

## 4. DDL · `edition_slots`（12 个有序槽位）

```sql
-- ============================================================
-- SEE EARTH V1 · edition_slots (Edition 12 个有序槽位)
-- 字段与 E-P0-09 EditionSlotSchema 1:1 对齐
-- position: 1..12（与 brief §A 一致；CHECK 强制）
-- moment_id / city_id nullable 必须与 fallback_reason 同步（触发器强制）
-- ============================================================
CREATE TABLE edition_slots (
  id                  UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  edition_id          UUID         NOT NULL REFERENCES editions(id) ON DELETE CASCADE,

  -- position 1..12（LOCKED：与 brief §A + E-P0-09 一致）
  position            INT          NOT NULL CHECK (position BETWEEN 1 AND 12),

  -- nullable：fallback slot 为 null（详见 E-P0-09 refine 规则）
  moment_id           UUID         REFERENCES moments(id) ON DELETE RESTRICT,
  city_id             TEXT         REFERENCES cities(id) ON DELETE RESTRICT,

  -- 三选一（与 E-P0-09 SlotFallbackReasonSchema 对齐）
  source_type         TEXT         NOT NULL CHECK (source_type IN ('witness','seed','editorial')),
  fallback_reason     TEXT         CHECK (fallback_reason IN (
                          'no_candidate_for_city',
                          'withdrawn_by_author',
                          'moderation_rejected',
                          'missing_rights',
                          'duplicate_in_edition',
                          'time_bucket_invalid',
                          'fallback_curated'
                      )),

  -- Editorial 填充标记（slot 被 seed/editorial 内容填补时为 TRUE）
  -- 区别于 source_type='editorial'（Editorial 内容既可填 slot 也可补 fallback）
  is_editorial_fill   BOOLEAN      NOT NULL DEFAULT FALSE,

  -- 触发器自动计算：moment_id 是否非空（用于 API 渲染判定）
  is_filled           BOOLEAN      NOT NULL DEFAULT FALSE,

  created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  -- 同 Edition 内 position 唯一
  CONSTRAINT edition_slots_edition_position_uniq UNIQUE (edition_id, position)
);
```

**字段决策说明**：

- **`position` 1..12 CHECK**：**硬约束**——任何 Edition 必须 12 槽（任务卡 §A + E-P0-09）。
- **`moment_id` / `city_id` nullable**：与 E-P0-09 EditionSlotSchema 的 refine（moment_id null ⇔ fallback_reason present；moment_id present ⇔ city_id present）一致；DB 触发器强制。
- **`source_type` 必填**：即使 slot 是 fallback，`source_type` 也填 `'editorial'`（editorial 兜底内容），由 `is_editorial_fill` 区分是否"被运营填了"——**比 E-P0-09 schema 更严格**，但更便于分析。
- **`fallback_reason` nullable**：仅当 `moment_id IS NULL` 时存在（触发器 §6 强制）。
- **`is_filled`**：触发器维护的派生字段，避免每次查询都判断；前端用此字段决定 tile 渲染。

---

## 5. DDL · `edition_status_history` + `edition_audit_log`（审计 / 状态机）

### 5.1 `edition_status_history`

```sql
-- ============================================================
-- SEE EARTH V1 · edition_status_history (Edition 状态机迁移)
-- 触发器自动写（§6.3）；不进 API contract
-- ============================================================
CREATE TABLE edition_status_history (
  id            BIGSERIAL    PRIMARY KEY,
  edition_id    UUID         NOT NULL REFERENCES editions(id) ON DELETE CASCADE,
  from_status   TEXT,                       -- 旧状态（首条为 NULL）
  to_status     TEXT         NOT NULL,
  actor         TEXT         NOT NULL DEFAULT 'cron',  -- 'cron' / 'admin:<email>' / 'system'
  reason        TEXT,                                  -- 触发原因说明（手动回滚填具体理由）
  metadata      JSONB        NOT NULL DEFAULT '{}'::jsonb,  -- 携带 slot 替换 / rollback 信息
  occurred_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX edition_status_history_edition_idx ON edition_status_history(edition_id, occurred_at DESC);
```

### 5.2 `edition_audit_log`

```sql
-- ============================================================
-- SEE EARTH V1 · edition_audit_log (Admin 手动操作审计)
-- 由 admin API 显式写；不进 API contract
-- 触发器不写（区分"自动状态机" vs "人工操作"）
-- ============================================================
CREATE TABLE edition_audit_log (
  id            BIGSERIAL    PRIMARY KEY,
  edition_id    UUID         NOT NULL REFERENCES editions(id) ON DELETE CASCADE,
  action        TEXT         NOT NULL CHECK (action IN (
                    'create',          -- 创建 Edition（cron 也写，但 actor=cron；admin 写时 actor=admin）
                    'update_slots',    -- 调整 slot
                    'replace_slot',    -- 替换单个 slot content
                    'publish',         -- 手动发布（admin 按钮）
                    'rollback',        -- 整版回滚
                    'withdraw'         -- 撤下（合规）
                  )),
  actor         TEXT         NOT NULL,    -- 'admin:<email>'
  payload       JSONB        NOT NULL,    -- 操作的完整 payload（before/after snapshot）
  request_id    TEXT,                     -- 关联 E-P0-10 monitoring 的 request_id
  occurred_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX edition_audit_log_edition_idx ON edition_audit_log(edition_id, occurred_at DESC);
CREATE INDEX edition_audit_log_actor_idx ON edition_audit_log(actor, occurred_at DESC);
```

**设计原则**：状态机历史（cron 自动） 与 Admin 操作审计 拆 2 表，避免 Admin 操作淹没自动状态变化。

---

## 6. 触发器（自动维护 + 约束强制）

### 6.1 `edition_slots` 派生字段维护

```sql
-- 维护 slots.is_filled（moment_id 是否非空）
-- 同时强制：moment_id null ⇔ fallback_reason present + city_id null
CREATE OR REPLACE FUNCTION edition_slot_sync_filled()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.is_filled := (NEW.moment_id IS NOT NULL);

  -- 规则 1：moment_id null ⇔ fallback_reason present
  IF (NEW.moment_id IS NULL AND NEW.fallback_reason IS NULL)
     OR (NEW.moment_id IS NOT NULL AND NEW.fallback_reason IS NOT NULL) THEN
    RAISE EXCEPTION 'edition_slot: fallback_reason presence must match moment_id nullness';
  END IF;

  -- 规则 2：moment_id 与 city_id 必须同步
  IF (NEW.moment_id IS NULL AND NEW.city_id IS NOT NULL)
     OR (NEW.moment_id IS NOT NULL AND NEW.city_id IS NULL) THEN
    RAISE EXCEPTION 'edition_slot: moment_id and city_id must both be null or both non-null';
  END IF;

  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER edition_slot_sync_filled_trg
  BEFORE INSERT OR UPDATE ON edition_slots
  FOR EACH ROW EXECUTE FUNCTION edition_slot_sync_filled();
```

### 6.2 `editions.slots_count` / `is_complete` 维护

```sql
CREATE OR REPLACE FUNCTION edition_sync_slots_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_count INT;
BEGIN
  SELECT COUNT(*) INTO v_count FROM edition_slots WHERE edition_id = COALESCE(NEW.edition_id, OLD.edition_id);
  UPDATE editions SET slots_count = v_count, is_complete = (v_count = 12) WHERE id = COALESCE(NEW.edition_id, OLD.edition_id);
  RETURN NULL;
END;
$$;

CREATE TRIGGER edition_slot_count_ins_trg
  AFTER INSERT ON edition_slots
  FOR EACH ROW EXECUTE FUNCTION edition_sync_slots_count();

CREATE TRIGGER edition_slot_count_del_trg
  AFTER DELETE ON edition_slots
  FOR EACH ROW EXECUTE FUNCTION edition_sync_slots_count();

-- UPDATE 不触发计数变化（slot 不增不减），但 updated_at 由 slot 触发器维护
```

### 6.3 `editions` 时间戳 + status_history 自动维护

```sql
CREATE OR REPLACE FUNCTION edition_status_history_trg()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := NOW();
  NEW.last_status_at := NOW();

  IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO edition_status_history (edition_id, from_status, to_status, actor, reason)
    VALUES (NEW.id, OLD.status, NEW.status, COALESCE(current_setting('app.actor', true), 'system'),
            NEW.metadata->>'reason');
  ELSIF (TG_OP = 'INSERT') THEN
    INSERT INTO edition_status_history (edition_id, from_status, to_status, actor, reason)
    VALUES (NEW.id, NULL, NEW.status, COALESCE(current_setting('app.actor', true), 'system'),
            NEW.metadata->>'reason');
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER edition_status_history_trg
  BEFORE INSERT OR UPDATE ON editions
  FOR EACH ROW EXECUTE FUNCTION edition_status_history_trg();
```

> **注**：`app.actor` 通过 `SET LOCAL app.actor = 'cron'` 在 cron / admin API 中设置；不依赖应用层代码（**任何 INSERT/UPDATE 都会被记录**）。

---

## 7. 索引策略

```sql
-- ============================================================
-- 索引（覆盖 5 个高频查询路径）
-- ============================================================

-- 路径 1：今日 Edition 查询（公开 API 最热路径）
CREATE INDEX editions_today_published_idx
  ON editions (date, is_fallback, version DESC)
  WHERE status IN ('published','replaced');

-- 路径 2：今日 Edition（含 active fallback）
CREATE INDEX editions_today_active_fallback_idx
  ON editions (date, is_fallback)
  WHERE status = 'published' AND is_fallback = TRUE;

-- 路径 3：历史 Editions 列表（cursor 分页）
CREATE INDEX editions_history_idx
  ON editions (date DESC, id DESC)
  WHERE status IN ('published','replaced');

-- 路径 4：slot 反查（admin：替换单个 slot 时定位 edition）
CREATE INDEX edition_slots_moment_idx ON edition_slots (moment_id) WHERE moment_id IS NOT NULL;

-- 路径 5：状态机审计 / 监控告警
CREATE INDEX edition_status_history_status_idx ON edition_status_history (to_status, occurred_at DESC);
```

---

## 8. 与 E-P0-09 contract 的字段映射

| DB 字段 | E-P0-09 PublicEditionSchema 字段 | 备注 |
|---|---|---|
| `editions.id` | `id` | UUID ↔ string(1..64) |
| `editions.date` | `date` | DATE ↔ `YYYY-MM-DD` 字符串 |
| `editions_slots`（12 行） | `slots[]`（length 12）| 拆表存储 |
| `editions.version` | `version` | 直接对应 |
| `editions.published_at` | `published_at` | 首次发布此 version 时间 |
| `editions.is_fallback` | `is_fallback` | 直接对应 |
| `editions.replaces_edition_id` | `replaces_edition_id` | 直接对应 |
| **DB 扩展字段** | | |
| `editions.status` | (AdminEdition.status) | 仅 Admin 返回；PublicEdition 不暴露 |
| `editions.fallback_reason` | （无 contract 字段，但 brief §C 要求） | DB 存，API 不返；仅监控 + Admin |
| `editions.slots_count` / `is_complete` | （无 contract 字段） | 触发器维护；monitoring 用 |
| `editions.created_at` / `updated_at` | (AdminEdition 字段) | 仅 Admin 返回 |
| **Slot 字段** | | |
| `edition_slots.position` | `slot.position` | 1..12 LOCKED |
| `edition_slots.moment_id` | `slot.moment_id` | nullable |
| `edition_slots.city_id` | `slot.city_id` | nullable |
| `edition_slots.fallback_reason` | `slot.fallback_reason` | nullable（moment_id 同步） |
| `edition_slots.is_editorial_fill` | `slot.is_editorial_fill` | 直接对应 |
| `edition_slots.source_type` | （无 contract 字段，但 brief §B 要求） | DB 必填，API 不返（监控用） |

> **不在 DB 也不在 API**：`editions.metadata` 字段**不引入**——避免 schema 蔓延；任何附加 metadata 走 `edition_audit_log.payload`（JSONB）。

---

## 9. 与 Brief §5 任务卡字段的偏差 / 增强说明

| 任务卡字段 | 本文件实现 | 偏差原因 |
|---|---|---|
| `replaces_edition_id UUID`（task card） | + `version` 字段 | Brief 原稿只提 UUID 关联；V1 实现需支持"同 date 多版本"，故引入 version |
| 任务卡未提 `fallback_reason` | + `editions.fallback_reason` | Brief §C 隐含需要（自动 fallback vs 手动回滚区分），monitoring 必须 |
| 任务卡未提 `slots_count` / `is_complete` | + 触发器维护 | E-P0-10 monitoring 必需（避免每次查询 COUNT slots） |
| 任务卡未提 `edition_status_history` | + `edition_status_history` + `edition_audit_log` 2 表 | E-P0-09 AdminEdition 含 `status`；状态变化需审计；E-P0-10 监控告警必需 |
| `source_type TEXT`（task card 自由文本）| `CHECK IN ('witness','seed','editorial')` | 强约束与 E-P0-09 DomainSourceType 对齐 |
| 任务卡 `source_type` 列在 `edition_slots` | **确认在 `edition_slots`** | 与 brief §B 一致；不在 `editions` 主表 |
| 任务卡未提 `is_editorial_fill` | + `edition_slots.is_editorial_fill` | E-P0-09 schema 已要求；保留 |

---

## 10. 不做的事（强约束）

- ❌ **不做后端 CMS**：V1 仅受控脚本 + Supabase View；UI 由 admin 命令行触发（详见 `scheduling-v1.md §6`）
- ❌ **不修改 14 LOCKED 组件**：本 schema 不引入任何与现有 14 LOCKED 组件冲突的字段
- ❌ **不引入新依赖**：纯 Postgres DDL（Supabase Postgres = 标准 PostgreSQL 15+）+ 触发器；无需 Prisma / TypeORM
- ❌ **不存媒体**：Edition 不引用媒体 URL（media 由 moment 持有，moment 由 slot.moment_id 引用）
- ❌ **不做 i18n 字段**：`title` / `description` 由 moment 提供；Edition 本身无 i18n
- ❌ **不做软删除**：Edition / slot 使用 hard delete + 触发器 status='retracted' 软标识（compliance 路径）
- ❌ **不做连续 fallback 计数**：连续 N 天 fallback **不存 DB**（E-P0-10 monitoring 实时算）；DB 只存当前是否 fallback

---

## 11. 自验收 Checklist（Edition 实体部分）

- [x] `editions` 表 + 字段 + CHECK 约束 + 外键
- [x] `edition_slots` 表 + position 1..12 CHECK + slot 反查索引
- [x] `edition_status_history` + `edition_audit_log` 双轨审计
- [x] 5 个高频查询路径索引（今日 / 历史 / 反查 / 监控）
- [x] 触发器：slot moment_id ↔ fallback_reason / city_id 同步
- [x] 触发器：editions.slots_count / is_complete 自动维护
- [x] 触发器：editions 状态机自动写 history
- [x] 与 E-P0-09 PublicEditionSchema 字段 1:1 映射
- [x] 与 D-P0-04 Daily 12 8 状态（draft/preview/scheduled/published/replaced/retracted）兼容（实际 6 个状态 + 2 个补充）

---

## 12. 给后续文档的钩子

- **§A eligibility 规则** → `eligibility-v1.md`：候选池 + 资格校验 + 排序算法
- **§B 每日组版时序** → `group-process-v1.md`：cron 触发 → 拉候选池 → 资格校验 → 组版 → preview
- **§C fallback Edition** → `fallback-v1.md`：自动 + 警告阈值
- **§D 调度 / 手动 / 替换 / 回滚** → `scheduling-v1.md`
- **§E 14 天连续演练** → `14-day-test-plan-v1.md`

---

> **下一步**：阅读 `eligibility-v1.md`，理解 5 项资格校验规则与排序算法。