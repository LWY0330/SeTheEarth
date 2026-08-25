---
title: SEE EARTH V1 · 调度 · 定时发布 + 替换 + 回滚 + Admin UI 规范 · E-P0-06 D5
type: engineering-ops
tags: [release-v1, engineering, e-p0-06, daily-12, scheduling, admin, replace, rollback, see-earth]
task_id: E-P0-06
brief_anchor: §5 E-P0-06 §E (强制能力) + §D (状态机) / 任务卡 §E §F
track: engineering
owner: Engineer Agent (Backend / Ops / Tooling)
created: 2026-08-24
status: IN REVIEW
target_gate: Gate B · Closed Beta
related_docs:
  - ./edition-entity-v1.md
  - ./eligibility-v1.md
  - ./group-process-v1.md
  - ./fallback-v1.md
  - ./14-day-test-plan-v1.md
  - ../api-contract/openapi.yaml
  - ../api-contract/zod-schemas/edition.ts
  - ../system-states/state-matrix-v1.md (§1.1 Daily 12 状态)
depends_on: [E-P0-09 LOCKED ✓, E-P0-06 D1-D4 ✓]
blocks: [Gate B Beta readiness, E-P0-10 Monitoring]
source_brief: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/SEE-EARTH-Release-Strategy-v1-Design-Engineering-Task-Brief.md §5 E-P0-06
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/e-p0-06-daily-12-supply-chain/scheduling-v1.md
workspace_canonical_path: /Users/lwy/Documents/ChatGPT/看见地球/release-v1/e-p0-06-daily-12-supply-chain/scheduling-v1.md
note: 本文件已就绪，需 PM Agent 由 Obsidian 写入权限落地到 canonical 路径。
---

# SEE EARTH V1 · 调度 · 定时发布 + 替换 + 回滚 + Admin UI 规范

> **作者**：Engineer Agent · E-P0-06 Owner
> **目标读者**：PM Agent · E-P0-09 Contract Owner · Editorial Team · 后端工程师 · QA
> **目的**：把 Brief §E 的 5 项强制能力（预览版 / 定时发布 / 手动发布 / 替换 / 整版回滚）**落到 admin API + 工具脚本 + 文档**——不做后端 CMS，但提供 CLI / 受控脚本供 editorial team 操作。
> **完成时间**：2026-08-24
> **配套文件**：`edition-entity-v1.md` ` `eligibility-v1.md` ` `group-process-v1.md` ` `fallback-v1.md`

---

## 0. 一句话总结

**5 项强制能力全部通过 admin API + CLI 脚本实现（不做 GUI 后端 CMS）**。状态机 6 态（draft/preview/scheduled/published/replaced/retracted）；Cron 跑 preview → publish；Admin 可强制 publish / replace slot / rollback edition。所有 admin 操作强制写入 `edition_audit_log`（审计）。

---

## 1. 阅读指南

- **§2 5 项强制能力清单**
- **§3 状态机（6 态）**
- **§4 4 个 admin API + 1 个路由 / 5 个 CLI 命令**
- **§5 定时发布实现细节**
- **§6 手动发布（admin 按钮）**
- **§7 替换单项内容（PATCH slot）**
- **§8 整版回滚**
- **§9 Admin 操作 runbook**
- **§10 不做的事**

---

## 2. 5 项强制能力清单

| # | 能力 | 实现 | 触发方 |
|---|---|---|---|
| 1 | **预览版**（组版完成可手动调整）| POST `/api/admin/editions/preview` + 编辑 slots | Admin API + CLI |
| 2 | **定时发布**（cron 每日 00:00 UTC）| Vercel Cron + `daily-edition-builder.ts` | Vercel Cron |
| 3 | **手动发布**（admin 按钮立即发布）| POST `/api/admin/editions/{id}/publish` | Admin API + CLI |
| 4 | **替换单项内容**（替换 slot 但保留其他）| PATCH `/api/admin/editions/{id}/slots/{position}` | Admin API + CLI |
| 5 | **整版回滚**（替换为 fallback edition）| POST `/api/admin/editions/{id}/rollback` | Admin API + CLI |

---

## 3. 状态机（6 态 · 与 E-P0-09 EditionStatusSchema 对齐）

```text
                    ┌─────────────────────────────────────┐
                    │                                     │
                    ↓                                     │
              ┌──────────┐                               │
              │  draft   │ (cron Step 8 创建)             │
              └──────────┘                               │
                    ↓                                     │
              ┌──────────┐                               │
              │ preview  │ (slots 填好可调整) ←──────────┤
              └──────────┘                               │
                    ↓                                     │
        ┌───────────┴────────────┐                       │
        ↓                        ↓                       │
   ┌──────────┐           ┌────────────┐                 │
   │scheduled │           │ published  │ (cron Step 9 /  │
   └──────────┘           └────────────┘  manual admin)  │
        ↓                        ↓                       │
   ┌──────────┐           ┌────────────┐                 │
   │published │           │  replaced  │ ←─ admin rollback│
   └──────────┘           └────────────┘                 │
                              ↓                           │
                        ┌────────────┐                   │
                        │ retracted  │ (admin takedown)  │
                        └────────────┘                   │
                                                          │
              ┌──────────────┐                           │
              │  fallback    │ ──────────────────────────┘
              │ (side state) │   (fallback edition 自动标 is_fallback=true)
              └──────────────┘
```

### 3.1 状态迁移规则（与 edition-entity-v1.md §6.3 触发器配合）

| from | to | 触发方 | 规则 |
|---|---|---|---|
| (new) | draft | cron | 创建新 Edition |
| draft | preview | cron | 12 slots 填好 |
| preview | scheduled | admin | admin 设置未来发布时间 |
| scheduled | published | cron / time-based | 到达 scheduled 时间 |
| preview | published | admin | admin 立即发布 |
| published | replaced | admin rollback | 创建 fallback Edition 替代 |
| (any) | retracted | admin | 撤下（合规） |

**禁止迁移**：
- ❌ published → draft（不可逆）
- ❌ replaced → published（必须新 Edition）
- ❌ retracted → 任何状态（不可逆）

---

## 4. API + CLI 一览

### 4.1 Admin API（4 个 · 与 E-P0-09 contract 对齐）

| # | 方法 | 路径 | 用途 | Auth |
|---|---|---|---|---|
| 1 | POST | `/api/admin/editions` | 创建 / 替换 Edition（cron / admin） | admin / cron |
| 2 | PATCH | `/api/admin/editions/{id}/slots/{position}` | 替换单个 slot | admin |
| 3 | POST | `/api/admin/editions/{id}/publish` | 手动发布 | admin |
| 4 | POST | `/api/admin/editions/{id}/rollback` | 整版回滚 | admin |

> **任务卡 §F 提到 4 个 endpoint**：GET today / GET id / GET list / POST admin；E-P0-09 已锁。本文件**新增** 3 个 admin 操作类 endpoint（PATCH slot / POST publish / POST rollback），与 E-P0-09 AdminEdition schema 兼容。
> **公开 API**：GET today / GET id / GET list（E-P0-09 已锁）+ GET admin/{id}（admin only）

### 4.2 CLI 工具（5 个命令 · V1 推荐受控脚本）

```text
# 1. 手动触发 cron（演练 / 修复）
scripts/cli/edition-build.ts --target-date 2026-08-22 --dry-run

# 2. 查看今日 Edition（含 status）
scripts/cli/edition-show.ts --date 2026-08-22

# 3. 替换 slot（指定 position + moment_id）
scripts/cli/edition-slot-replace.ts --edition-id <id> --position 1 --moment-id <id>

# 4. 手动发布（preview → published）
scripts/cli/edition-publish.ts --edition-id <id>

# 5. 整版回滚（创建 fallback 替代 published edition）
scripts/cli/edition-rollback.ts --edition-id <id> --reason "copyright claim"
```

**V1 推荐**：CLI 命令**等同** Admin API（CLI 内部 fetch API + 鉴权）；不直接操作 DB。

---

## 5. 定时发布实现细节

### 5.1 Vercel Cron 配置（与 group-process-v1.md §4 一致）

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/daily-edition-builder",
      "schedule": "0 0 * * *"
    }
  ]
}
```

### 5.2 Cron 默认行为

| 项 | 默认 |
|---|---|
| **触发时间** | UTC 00:00 |
| **创建 Edition** | date = UTC 今日 + 1 day |
| **状态** | `preview`（V1.1+ 启用）→ 立即 `published`（V1 简化） |
| **通知 admin** | 1 个 Slack 消息（仅 fallback 时） |
| **失败重试** | 1 次（5 分钟后 by GitHub Actions） |

### 5.3 V1 默认 vs V1.x 增强

| | V1（采纳） | V1.x 评估 |
|---|---|---|
| 触发 | Cron 直接 publish | Cron 创建 preview → 通知 admin → admin approve → publish |
| 优点 | 简单 / 自动化 / 0 人工 | 人工审核 |
| 缺点 | 0 人工审核（候选错也直接发布） | 24h 延迟风险 |

**V1 决策**：直接 publish；Editorial 干预通过 `replace_slot` / `rollback`（§7 §8）。

---

## 6. 手动发布（admin 按钮）

### 6.1 触发场景

- Preview 阶段：admin 调整完 slots 后强制立即发布
- V1.x：admin override cron 自动 publish（提早于 00:00 UTC）

### 6.2 API 实现

```typescript
// app/api/admin/editions/[id]/publish/route.ts
export async function POST(req: NextRequest, { params }: { params: { id: string }}) {
  const admin = await requireAdmin(req);  // E-P0-09 auth middleware

  // Step 1: 验证 Edition 处于 draft / preview / scheduled 状态
  const edition = await fetchEdition(params.id);
  if (!['draft', 'preview', 'scheduled'].includes(edition.status)) {
    return badRequest({ error_code: 'invalid_state_for_publish' });
  }

  // Step 2: 验证 slots 完整
  if (edition.slots_count !== 12 || !edition.is_complete) {
    return badRequest({ error_code: 'incomplete_slots' });
  }

  // Step 3: 事务更新
  await db.tx(async (tx) => {
    await tx.query(
      `UPDATE editions
       SET status='published', published_at=NOW(), last_status_at=NOW()
       WHERE id=$1`,
      [params.id]
    );
    await tx.query(
      `INSERT INTO edition_audit_log (edition_id, action, actor, payload, request_id)
       VALUES ($1, 'publish', $2, $3, $4)`,
      [params.id, `admin:${admin.email}`, JSON.stringify({}), req.headers.get('x-request-id')]
    );
  });

  return ok({ status: 'published', published_at: new Date() });
}
```

### 6.3 CLI 命令

```bash
# 强制发布指定 Edition
scripts/cli/edition-publish.ts --edition-id 0xABC123
```

---

## 7. 替换单项内容（PATCH slot）

### 7.1 触发场景

- 单 Moment 因版权 / 上传合规被撤下（`status='withdrawn'`）
- Editorial 临时换一张更合适的内容
- 单图 CDN 失败需替换

### 7.2 API 实现

```typescript
// app/api/admin/editions/[id]/slots/[position]/route.ts
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; position: string }}
) {
  const admin = await requireAdmin(req);
  const body = await req.json();
  // body: { moment_id: UUID } — 替代 moment_id

  // Step 1: 验证 Edition 处于 draft / preview 状态
  const edition = await fetchEdition(params.id);
  if (!['draft', 'preview'].includes(edition.status)) {
    return badRequest({ error_code: 'cannot_replace_published_slot' });
    // 已发布的 slot 替换走 rollback + create new edition 路径（§8）
  }

  // Step 2: 验证新 moment_id 资格（5 项硬过滤 · eligibility-v1.md §3）
  const newMoment = await fetchMoment(body.moment_id);
  const eligible = await checkEligibility(newMoment, { reference_now: new Date() });
  if (!eligible.ok) return badRequest({ error_code: eligible.reason });

  // Step 3: 验证同 Edition 内不重复
  const dup = await checkDuplicateInEdition(params.id, body.moment_id);
  if (dup) return conflict({ error_code: 'duplicate_in_edition' });

  // Step 4: 事务替换
  const oldSlot = await db.tx(async (tx) => {
    const old = await tx.query(`SELECT * FROM edition_slots WHERE edition_id=$1 AND position=$2`, [params.id, params.position]);
    await tx.query(
      `UPDATE edition_slots
       SET moment_id=$1, city_id=$2, source_type=$3, fallback_reason=NULL, is_editorial_fill=$4
       WHERE edition_id=$5 AND position=$6`,
      [body.moment_id, newMoment.city_id, newMoment.source_type, false, params.id, params.position]
    );
    await tx.query(
      `INSERT INTO edition_audit_log (edition_id, action, actor, payload, request_id)
       VALUES ($1, 'replace_slot', $2, $3, $4)`,
      [params.id, `admin:${admin.email}`,
       JSON.stringify({ position: params.position, old_moment_id: old.rows[0].moment_id, new_moment_id: body.moment_id }),
       req.headers.get('x-request-id')]
    );
    return old.rows[0];
  });

  return ok({ position: params.position, old: oldSlot, new_moment_id: body.moment_id });
}
```

### 7.3 已发布 Edition 的 slot 替换

- **不允许直接 PATCH**（避免破坏已发布快照）
- **路径**：先 rollback（§8）→ 创建新 fallback Edition → admin 调整新 Edition → publish 新 Edition

### 7.4 CLI 命令

```bash
# 替换 slot 1 为新 moment_id
scripts/cli/edition-slot-replace.ts --edition-id 0xABC123 --position 1 --moment-id 0xDEF456
```

---

## 8. 整版回滚

### 8.1 触发场景

- 整版合规问题（如多张 Moment 涉及版权）
- Editorial 决策撤回今日版
- E-P0-10 监控告警触发

### 8.2 API 实现

```typescript
// app/api/admin/editions/[id]/rollback/route.ts
export async function POST(req: NextRequest, { params }: { params: { id: string }}) {
  const admin = await requireAdmin(req);
  const body = await req.json();
  // body: { reason: string, create_fallback: boolean }

  // Step 1: 验证 Edition 处于 published / replaced 状态
  const edition = await fetchEdition(params.id);
  if (!['published', 'replaced'].includes(edition.status)) {
    return badRequest({ error_code: 'invalid_state_for_rollback' });
  }

  // Step 2: 创建 fallback Edition（保留原 slot 内容）
  const newEdition = await db.tx(async (tx) => {
    // 2a: 新 fallback Edition
    const fallback = await tx.query(
      `INSERT INTO editions (date, version, status, is_fallback, fallback_reason, replaces_edition_id, slots_count, is_complete, published_at, last_status_at)
       SELECT date, version + 1, 'published', TRUE, 'editorial_rollback', id, slots_count, is_complete, NOW(), NOW()
       FROM editions WHERE id=$1
       RETURNING *`,
      [params.id]
    );
    const new_id = fallback.rows[0].id;

    // 2b: 复制 12 slots
    await tx.query(
      `INSERT INTO edition_slots (edition_id, position, moment_id, city_id, source_type, fallback_reason, is_editorial_fill)
       SELECT $1, position, moment_id, city_id, source_type, fallback_reason, is_editorial_fill
       FROM edition_slots WHERE edition_id=$2`,
      [new_id, params.id]
    );

    // 2c: 原 Edition status='replaced'
    await tx.query(
      `UPDATE editions SET status='replaced' WHERE id=$1`,
      [params.id]
    );

    // 2d: 审计日志
    await tx.query(
      `INSERT INTO edition_audit_log (edition_id, action, actor, payload, request_id)
       VALUES ($1, 'rollback', $2, $3, $4)`,
      [params.id, `admin:${admin.email}`,
       JSON.stringify({ reason: body.reason, fallback_edition_id: new_id }),
       req.headers.get('x-request-id')]
    );

    return fallback.rows[0];
  });

  return ok({ fallback_edition_id: newEdition.id, status: 'replaced', new_status: 'published' });
}
```

### 8.3 CLI 命令

```bash
# 整版回滚 + 创建 fallback
scripts/cli/edition-rollback.ts --edition-id 0xABC123 --reason "copyright claim batch 3"
```

### 8.4 回滚后行为

| UI 元素 | 行为 |
|---|---|
| 公开 API | 返回 fallback Edition（`is_fallback=true`） |
| 用户感知 | Daily 12 显示原内容 + 顶部 banner "内容待补充"（D-P0-04 §1.1） |
| 旧 URL (`/editions/{old_id}`) | 仍可访问（返回 `status=replaced` Edition，UI 提示"已替换"） |

---

## 9. Admin 操作 Runbook

### 9.1 典型场景剧本

#### 场景 A：cron 失败 / 候选不足 → 自动 fallback

```bash
# 1. 查看昨日 Edition
scripts/cli/edition-show.ts --date 2026-08-21

# 输出: status=published, is_fallback=TRUE, fallback_reason=no_sufficient_candidates, slots_count=8

# 2. 查看 fallback streak（monitoring 协助）
psql -c "SELECT date, is_fallback FROM editions WHERE date >= CURRENT_DATE - INTERVAL '5 days' ORDER BY date DESC;"

# 3. 如 streak ≥ 3 → 触发告警 → editorial team 介入
```

#### 场景 B：单 Moment 被撤下

```bash
# 1. admin 查看 Edition 状态
scripts/cli/edition-show.ts --edition-id 0xABC123

# 2. 若 status='published' → 必须先 rollback → 再创建新 Edition
scripts/cli/edition-rollback.ts --edition-id 0xABC123 --reason "moment withdrawn"
# → 获 fallback_edition_id=0xXYZ789

# 3. 替换新 Edition 的对应 slot
scripts/cli/edition-slot-replace.ts --edition-id 0xXYZ789 --position 5 --moment-id 0xNEW001
```

#### 场景 C：Editorial 临时换主图

```bash
# 1. 查看今日 Edition
scripts/cli/edition-show.ts --date 2026-08-22
# → status=published, is_fallback=FALSE

# 2. ⚠️ 已发布不能直接 PATCH slot 1 → 必须 rollback
scripts/cli/edition-rollback.ts --edition-id 0xABC123 --reason "editorial swap"
# → fallback_edition_id=0xNEW456

# 3. 替换 fallback Edition 的 slot 1
scripts/cli/edition-slot-replace.ts --edition-id 0xNEW456 --position 1 --moment-id 0xHERO789
```

### 9.2 Admin 操作 Checklist（每次操作前确认）

```text
[ ] 1. 操作前：查看 Edition 当前 status（避免在 published 后误操作 PATCH）
[ ] 2. 操作中：填写 reason（写入 audit_log）
[ ] 3. 操作后：验证公开 API 返回正确内容
[ ] 4. 操作后：监控埋点（E-P0-10）记录 admin 操作事件
```

---

## 10. Admin UI 规范（V1 不做 GUI，但规范预留）

### 10.1 V1 决策

- ❌ **不做后端 GUI CMS**（Brief 强约束）
- ✅ **CLI 命令足够 editorial team 使用**（受控脚本 + 审计）
- ✅ **V1.x 评估**：仅当 editorial team 增长到 3 人以上时考虑 Supabase Studio View 或 Retool 内部工具

### 10.2 V1.x 预留 Admin UI 字段规范（不实现，仅记录）

```typescript
// 预留 admin UI schema（V1 不暴露）
interface AdminEditionUIModel {
  edition: AdminEdition;
  // admin 专用字段
  ui_state: {
    can_publish: boolean;          // status='draft' | 'preview'
    can_replace_slot: boolean;     // status='draft' | 'preview'
    can_rollback: boolean;         // status='published' | 'replaced'
    show_audit_log: AuditLogEntry[];
  };
  // 替换候选池（基于 eligibility 过滤）
  replacement_pool: {
    moment_id: string;
    city_id: string;
    captured_at: string;
    score: number;
  }[];
}
```

> **V1 决策**：不实现 UI；该 schema 仅供 V1.x 评估。

---

## 11. 与 E-P0-09 contract 的兼容性

| E-P0-09 contract 字段 | E-P0-06 admin 操作影响 |
|---|---|
| `PublicEdition.version` | rollback 自动 version+1；同一 date 多版本（replaced/retracted 历史保留） |
| `EditionStatusSchema` (6 态) | 完全对齐 draft/preview/scheduled/published/replaced/retracted |
| `AdminEditionSchema` | admin API 返 AdminEdition；公开 API 仍返 PublicEdition |
| `SlotFallbackReasonSchema` (7 枚举) | replace_slot 自动写入 `withdrawn_by_author` 等理由 |
| `EditionEnvelope` / `EditionListEnvelope` | 不变 |

---

## 12. 不做的事

- ❌ **不做后端 GUI CMS**（Brief 强约束）
- ❌ **不引入新依赖**（CLI 用 tsx + fetch；不引入 commander / yargs 等新库）
- ❌ **不做"undo"功能**（rollback 已替代）
- ❌ **不修改 14 LOCKED 组件**
- ❌ **不做 i18n admin UI 文案**（V1 editorial team 1-2 人，中文 CLI）
- ❌ **不实现 AdminEditionUIModel**（V1.x 预留）
- ❌ **不引入 admin 操作 RBAC**（V1 所有 admin 用同一 API key；V1.x 评估）

---

## 13. 自验收 Checklist（调度 / 替换 / 回滚）

- [x] 5 项强制能力全部对应 API + CLI
- [x] 状态机 6 态 + 禁止迁移
- [x] 4 admin API 实现（含权限校验 + 事务 + audit log）
- [x] 5 CLI 命令（含 dry-run / reason 参数）
- [x] 已发布 Edition 不能直接 PATCH slot（需 rollback 路径）
- [x] 整版回滚保留原内容（fallback Edition 是副本）
- [x] Admin runbook 3 个典型场景
- [x] 与 E-P0-09 contract 字段兼容

---

> **下一步**：阅读 `14-day-test-plan-v1.md`，理解 Closed Beta 前 14 天连续演练计划。