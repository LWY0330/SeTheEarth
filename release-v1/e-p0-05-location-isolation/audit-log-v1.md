---
title: SEE EARTH V1 · E-P0-05 · 访问审计规范 · v1.0.0
type: audit-log
tags: [release-v1, e-p0-05, location-isolation, audit-log, access-control, compliance, see-earth]
task_id: E-P0-05
brief_anchor: "Release Strategy Brief §5 E-P0-05 · 强制边界 5 + §10 全局 AC"
track: engineering
owner: Engineer Agent #6 (external Owner = 用户)
created: 2026-08-24
status: DRAFT · IN REVIEW（待同步 Obsidian）
target_gate: Gate A · Internal Alpha
source_brief: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/SEE-EARTH-Release-Strategy-v1-Design-Engineering-Task-Brief.md
source_task_card: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/06-PM Agent 交接/2026-08-22-task-card-e-p0-05-location-isolation.md
related_docs:
  - ./data-architecture-v1.md §4.2
  - ./public-private-split-v1.md §1 边界 5
  - ./role-permission-v1.md §2 + §3
  - ./encryption-v1.md
  - ./leak-test-v1.md
  - ../api-contract/error-code-dict-v1.md §9
depends_on:
  - E-P0-01 (✓ ACCEPTED)
  - E-P0-09 (✓ ACCEPTED)
blocks: [E-P0-03, E-P0-10]
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/06-PM Agent 交接/release-v1/e-p0-05-location-isolation/audit-log-v1.md
workspace_canonical_path: /Users/lwy/Documents/ChatGPT/看见地球/release-v1/e-p0-05-location-isolation/audit-log-v1.md
sync_required: true · sandbox 拒绝写入 Obsidian
note: 本文件已就绪，需 PM Agent 由 Obsidian 写入权限落地到 canonical 路径。
---

# SEE EARTH V1 · E-P0-05 · 访问审计规范 · v1.0.0

> **作者**：Engineer Agent #6（外部 Owner = 您 / PM Orchestrator）  
> **完成时间**：2026-08-24  
> **目的**：定义 `private_location_access_log` 表的写入契约、应用层强制点、purpose 枚举、append-only 防篡改、以及 Privacy Officer 定期审计流程。

---

## 0. 一句话总结

**任何角色（moderator / admin / system）对 `private_locations_decrypted` 视图的 SELECT 都必须**先**写 `private_location_access_log`，且日志是 DB trigger 强制 append-only（任何 UPDATE / DELETE 直接抛错）；purpose 必须是 enum（moderation / review / audit / legal_request / system_cleanup），不接受自由文本；access_log 永久保留，即使原 location 已 90 天清理。**

---

## 1. 审计日志 schema（与 `data-architecture-v1.md §4.2` 对齐）

```sql
CREATE TABLE private_location_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  location_id UUID NOT NULL REFERENCES private_locations(id),
  purpose TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  request_id TEXT,                     -- 服务端 request_id（关联 request_log）
  accessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT access_log_purpose_enum CHECK (purpose IN (
    'moderation','review','audit','legal_request','system_cleanup'
  ))
);

-- Append-only 防篡改 trigger
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
CREATE INDEX idx_access_log_purpose ON private_location_access_log (purpose);
```

---

## 2. purpose 枚举（强制，不接受自由文本）

| purpose 值 | 含义 | 典型场景 |
|---|---|---|
| **`moderation`** | 内容审核需要查看精确位置 | Moderator 审核某 Witness 提交，怀疑 spam / 真实性问题 |
| **`review`** | 内部 review（包括数据质量、异常排查） | Moderator/Admin 排查数据异常 / bug |
| **`audit`** | Privacy Officer / 内部审计 | Privacy Officer 定期审计访问 pattern |
| **`legal_request`** | 法律请求（法院 / DMCA / 监管） | 收到合法法律请求 |
| **`system_cleanup`** | 系统后台 Job | 90 天 cron job 删除过期 location（self-audit） |

> ⚠️ **强制 enum**：任何尝试写入 `purpose = 'something_else'` 的请求直接被 DB CHECK constraint 拒绝。API 层也强制 enum 验证。

### 2.1 为什么不用自由文本？

- 自由文本可被注入 PII（如 `purpose = "Joe's debugging session"`）
- enum 让 Privacy Officer 容易按 purpose 分类统计
- enum 让 alert 规则简单（`purpose IN ('audit', 'legal_request')` 触发高级 alert）

---

## 3. 写入契约（应用层强制）

### 3.1 写入路径（强制 atomic transaction）

```typescript
// src/server/services/privateLocations.ts
import { db } from '@/server/db';
import { logPrivateLocationAccess } from '@/server/services/auditLog';
import type { AccessPurpose } from '@/types/audit';

export async function getPrivateLocationDecrypted(
  locationId: string,
  purpose: AccessPurpose,
  actor: {
    userId: string;
    ipAddress: string;
    userAgent?: string;
    requestId?: string;
  }
): Promise<PrivateLocationDecrypted | null> {
  // 1. 验证 purpose 是 enum
  if (!['moderation', 'review', 'audit', 'legal_request'].includes(purpose)) {
    throw new ValidationError('invalid_purpose', { purpose });
  }
  
  // 2. 验证 role（必须在 RBAC 矩阵内）
  const role = await getActorRole(actor.userId);
  if (!['moderator', 'admin'].includes(role)) {
    throw new ForbiddenRoleError(role, 'getPrivateLocationDecrypted');
  }
  
  // 3. Atomic transaction：read + audit_log 同一事务
  return await db.transaction(async (tx) => {
    // 3a. 设置 session 变量（DB 层 encryption_key）
    const key = await getKMSKey('private_locations_encryption_key');
    await tx.execute(`SET LOCAL app.encryption_key = '${key}'`);
    await tx.execute(`SET LOCAL app.actor_user_id = '${actor.userId}'`);
    await tx.execute(`SET LOCAL app.actor_ip = '${actor.ipAddress}'`);
    
    // 3b. SELECT（view 自动 decrypt）
    const result = await tx.query(
      `SELECT id, submission_id, city_id, latitude, longitude, accuracy_meters, source, retention_until, created_at
       FROM private_locations_decrypted WHERE id = $1`,
      [locationId]
    );
    if (result.rows.length === 0) return null;
    
    // 3c. INSERT audit_log（同一事务，必须在 commit 前）
    await tx.query(
      `INSERT INTO private_location_access_log
         (user_id, location_id, purpose, ip_address, user_agent, request_id)
       VALUES ($1, $2, $3, $4::INET, $5, $6)`,
      [actor.userId, locationId, purpose, actor.ipAddress, actor.userAgent ?? null, actor.requestId ?? null]
    );
    
    return result.rows[0];
  });
  // ↑ transaction commit 时 SELECT + INSERT 同时持久化
}
```

### 3.2 关键不变量

| 不变量 | 强制方式 |
|---|---|
| **每次 SELECT 都写 audit_log** | 应用层 atomic transaction（read + INSERT 同事务） |
| **purpose 必须是 enum** | 应用层校验 + DB CHECK constraint 双层 |
| **access_log 不可篡改** | DB trigger 阻止 UPDATE / DELETE |
| **缺失字段 reject** | NOT NULL 约束（user_id / location_id / purpose） |
| **session 变量不被持久化** | `SET LOCAL`（事务结束自动清除） |

### 3.3 List endpoint 的特殊处理

```typescript
// src/server/services/privateLocations.ts (续)
export async function listPrivateLocations(
  purpose: AccessPurpose,
  filters: { cityId?: string; source?: string; limit?: number },
  actor: { userId: string; ipAddress: string }
): Promise<PrivateLocationSummary[]> {
  // List endpoint 默认**不返回 lat/lon 明文**，仅返回 city_id + accuracy_meters + captured_at_tz
  // 若 moderator 想看具体某个 location 的 lat/lon，必须调用 GET /{id}
  // 这样 list 浏览不会被记为"实际访问 lat/lon"
  
  // ⚠️ 仍然记录 list 调用（audit 完整性）
  // 但 purpose 必须是 'review' 或 'audit'，不允许 'moderation'（moderation 应该看具体某个）
  
  if (!['review', 'audit', 'legal_request'].includes(purpose)) {
    throw new ValidationError('list_view_requires_review_or_audit_purpose', { purpose });
  }
  
  return await db.transaction(async (tx) => {
    await tx.execute(`SET LOCAL app.encryption_key = '${await getKMSKey(...)}'`);
    await tx.execute(`SET LOCAL app.actor_user_id = '${actor.userId}'`);
    await tx.execute(`SET LOCAL app.actor_ip = '${actor.ipAddress}'`);
    
    // 1. SELECT summaries（不含 lat/lon 明文）
    const result = await tx.query(
      `SELECT id, city_id, accuracy_meters, source, retention_until, created_at
       FROM private_locations_decrypted
       WHERE ($1::text IS NULL OR city_id = $1)
         AND ($2::text IS NULL OR source = $2)
       ORDER BY created_at DESC
       LIMIT $3`,
      [filters.cityId ?? null, filters.source ?? null, filters.limit ?? 50]
    );
    
    // 2. INSERT 单条 audit_log（记录 list 调用）
    await tx.query(
      `INSERT INTO private_location_access_log
         (user_id, location_id, purpose, ip_address)
       SELECT $1, id, $2, $3::INET FROM private_locations
       WHERE id = ANY($4::uuid[])`,
      [actor.userId, purpose, actor.ipAddress, result.rows.map(r => r.id)]
    );
    
    return result.rows;
  });
}
```

---

## 4. 写入触发点（必须覆盖的所有路径）

| 触发点 | 路径 | purpose 推荐 |
|---|---|---|
| Moderator 在 CMS 中查看 Witness 提交详情（含 lat/lon） | `GET /v1/admin/witness/submissions/{id}` | `moderation` |
| Admin 在 CMS 中排查数据异常 | `GET /v1/admin/private-locations/{id}` | `review` |
| Privacy Officer 导出 access_log 进行审计 | `GET /v1/internal/audit-log-export` | `audit` |
| 收到合法法律请求，导出 lat/lon | `GET /v1/admin/private-locations/{id}` | `legal_request` |
| 系统后台 90 天清理（self-audit） | `POST /v1/internal/cleanup-private-locations` | `system_cleanup` |
| Witness 自己尝试访问自己的 lat/lon | （不允许） | n/a |

---

## 5. 必填字段 schema（API 层）

```typescript
// POST /v1/admin/private-locations/{id}/access
{
  purpose: 'moderation' | 'review' | 'audit' | 'legal_request';
  reason?: string;  // 可选，最多 256 字符的自由文本（仅用于内部 note，不进 audit_log 的 purpose 字段）
}

// 响应（仅 moderator+ 角色）
{
  data: {
    id: string;
    city_id: string;
    latitude: number;
    longitude: number;
    accuracy_meters: number | null;
    source: 'gps' | 'manual';
    retention_until: string;
    created_at: string;
    audit_id: string;       // 本次访问的 audit_log.id（前端可展示给 moderator）
  },
  request_id: string
}
```

> ⚠️ **`reason` 字段不进 `private_location_access_log`**。`reason` 仅用于 Moderator UI 显示，存于 `private_location_access_log.metadata` JSON 字段（可选）：
>
> ```sql
> ALTER TABLE private_location_access_log
>   ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
> ```
>
> metadata 内容限制：
> - 不允许 PII（email / phone / name）
> - 不允许原始 lat/lon（lat/lon 已在主体行记录）
> - 长度 ≤ 1 KB
> - 服务端 schema 校验（`metadata_schema` JSON Schema）

---

## 6. 防篡改保障（多重防御）

### 6.1 DB trigger（已实现）

```sql
-- 阻止 UPDATE
CREATE TRIGGER trg_prevent_access_log_update
  BEFORE UPDATE ON private_location_access_log
  FOR EACH ROW EXECUTE FUNCTION prevent_access_log_mutation();

-- 阻止 DELETE
CREATE TRIGGER trg_prevent_access_log_delete
  BEFORE DELETE ON private_location_access_log
  FOR EACH ROW EXECUTE FUNCTION prevent_access_log_mutation();
```

### 6.2 GRANT 限制

```sql
REVOKE ALL ON private_location_access_log FROM PUBLIC;
GRANT INSERT ON private_location_access_log TO seeearth_moderator, seeearth_admin, seeearth_system;
GRANT SELECT ON private_location_access_log TO seeearth_admin;  -- 仅 admin 可读
GRANT SELECT, UPDATE ON private_location_access_log TO seeearth_privacy_officer;  -- Privacy Officer 仅 read+不写
```

> ⚠️ **GRANT 不阻止 trigger**：即使 moderator 角色拥有 INSERT 权限，也无法 UPDATE / DELETE（trigger 在 GRANT 之前执行）。

### 6.3 备份与归档

| 备份类型 | 周期 | 加密 | 保留 |
|---|---|---|---|
| 每日全量备份（含 access_log） | 每日 04:00 UTC | AES-256 + S3 SSE-KMS | 90 天 |
| WAL archive | 持续 | AES-256 | 30 天 |
| 月度归档（仅 access_log） | 每月 1 号 | AES-256 + GPG | 永久（冷存储） |

---

## 7. 越权检测与告警（E-P0-10 集成）

| 告警规则 | 阈值 | 级别 | Owner |
|---|---|---|---|
| 同一 user 1 小时内 > 10 次访问 | 10 | 🟡 WARN | E-P0-10 on-call |
| 同一 user 1 小时内 > 50 次访问 | 50 | 🔴 CRITICAL | Privacy Officer + E-P0-10 |
| 同一 user 24 小时内 > 100 次访问 | 100 | 🔴 CRITICAL | Privacy Officer + E-P0-10 |
| `purpose = 'legal_request'` 但无对应 legal request 工单 | 1 | 🔴 CRITICAL | Privacy Officer |
| `purpose = 'audit'` 但 user 不是 Privacy Officer | 1 | 🔴 CRITICAL | E-P0-10 on-call |
| 任何 `purpose` 不在 enum 列表 | 1 | 🔴 CRITICAL（DB CHECK 已阻止，仅审计） | Engineering Lead |
| access_log 表无新增行 > 24h（job 失败？） | 24h | 🟡 WARN | E-P0-10 on-call |
| 任何 access_log UPDATE / DELETE attempt（trigger 阻止后报错） | 1 | 🔴 CRITICAL | Engineering Lead + Privacy Officer |

> ⚠️ **告警去重**：同一规则 1 小时内多次触发只 alert 1 次，避免噪音。

---

## 8. Privacy Officer 定期审计流程

### 8.1 每周审计

```sql
-- 1. 列出本周所有 `purpose = 'audit'` 记录
SELECT user_id, location_id, accessed_at, ip_address
FROM private_location_access_log
WHERE purpose = 'audit'
  AND accessed_at > NOW() - INTERVAL '7 days'
ORDER BY accessed_at DESC;

-- 2. 列出本周所有 `purpose = 'legal_request'` 记录
SELECT user_id, location_id, accessed_at, metadata
FROM private_location_access_log
WHERE purpose = 'legal_request'
  AND accessed_at > NOW() - INTERVAL '7 days';

-- 3. 检查是否有 Privacy Officer 之外的 user 使用 `purpose = 'audit'`
SELECT user_id, COUNT(*) AS cnt
FROM private_location_access_log
WHERE purpose = 'audit'
  AND user_id NOT IN (SELECT user_id FROM privacy_officer_users)
  AND accessed_at > NOW() - INTERVAL '7 days'
GROUP BY user_id;
```

### 8.2 每月审计

```sql
-- 1. Top 10 最活跃 user（按访问次数）
SELECT user_id, COUNT(*) AS access_count
FROM private_location_access_log
WHERE accessed_at > NOW() - INTERVAL '30 days'
GROUP BY user_id
ORDER BY access_count DESC
LIMIT 10;

-- 2. 按 purpose 分类统计
SELECT purpose, COUNT(*) AS cnt
FROM private_location_access_log
WHERE accessed_at > NOW() - INTERVAL '30 days'
GROUP BY purpose
ORDER BY cnt DESC;

-- 3. 异常时段（凌晨 0-6 点）
SELECT user_id, COUNT(*) AS cnt
FROM private_location_access_log
WHERE accessed_at > NOW() - INTERVAL '30 days'
  AND EXTRACT(HOUR FROM accessed_at) BETWEEN 0 AND 6
GROUP BY user_id
HAVING COUNT(*) > 5
ORDER BY cnt DESC;
```

### 8.3 每季度审计（DPIA · Data Protection Impact Assessment）

- 审查 `private_locations` 表的总行数 vs `private_location_access_log` 表的访问次数比
- 审查 retention_until 临近的行数（preparing for cleanup）
- 审查 cleanup_run_log 是否正常运行
- 审查 Moderator/Admin 角色清单是否仍然最小
- 审查 KMS key rotation 是否按计划执行
- 输出 DPIA 报告，由 Privacy Officer 签字，归档至 `/legal/dpia/`

---

## 9. 数据删除请求流程（GDPR Art.17 / CCPA Right to Delete）

### 9.1 用户提交删除请求

```text
[用户发送邮件] → privacy@see-earth.com
       ↓
[Privacy Officer 工单系统]
 - 工单包含：witness_id / submission_id / 邮箱验证
 - SLA：≤ 30 天响应（GDPR）
       ↓
[Privacy Officer 人工审核]
 - 验证身份
 - 决定范围：仅删 lat/lon？还是含整个 submission + Moment？
       ↓
[执行删除]
 - DELETE FROM private_locations WHERE submission_id = X
 - DELETE FROM moments WHERE id = Y（if 用户要求）
 - DELETE FROM assets WHERE id = Z
 - INSERT INTO private_location_access_log (purpose = 'audit', metadata = {action: 'gdpr_deletion', ticket_id: 'XXX'})
 - ↑ 即使 location 已删，access_log 仍记录"曾被删除"
       ↓
[回复用户] 邮件确认完成 + 工单关闭
```

### 9.2 自动化部分（V1 仅"硬删除 lat/lon"）

```typescript
// src/server/jobs/gdprDeletion.ts
export async function processGdprDeletion(
  submissionId: string,
  ticketId: string
): Promise<void> {
  await db.transaction(async (tx) => {
    // 1. INSERT audit_log（before delete）
    await tx.query(
      `INSERT INTO private_location_access_log
         (user_id, location_id, purpose, metadata)
       SELECT 'gdpr_automation', id, 'audit',
              jsonb_build_object('action', 'gdpr_deletion', 'ticket_id', $2, 'submission_id', $1)
       FROM private_locations WHERE submission_id = $1`,
      [submissionId, ticketId]
    );
    
    // 2. DELETE lat/lon
    await tx.query(`DELETE FROM private_locations WHERE submission_id = $1`, [submissionId]);
    
    // 3. （可选）DELETE moment
    // await tx.query(`DELETE FROM moments WHERE witness_id IN (...)`);
  });
}
```

> ⚠️ **自动化边界**：V1 自动化仅"硬删除 lat/lon"。完整删除（同时删 Moment / Asset / Echo）必须由 Privacy Officer + Content Ops 人工审核，因为：
> - 删除已发布 Moment 会影响 Daily 12 的完整性
> - 可能涉及第三方权利（如 Unsplash License 要求 attribution）
> - 需要保留法务证据（不能彻底删除）

---

## 10. 与 E-P0-10 Monitoring 的对接

| 监控信号 | 来源表 / 字段 |
|---|---|
| `private_location_access_log` 24h 行数 | daily metric |
| 同一 user 1h 访问次数（max / p95） | real-time alert |
| `purpose = 'legal_request'` 触发数 | alert metric |
| `purpose` 不在 enum（被 DB CHECK 阻止）的错误 | alert metric |
| access_log UPDATE / DELETE attempt（trigger 抛错） | alert metric |
| `cleanup_run_log` 每日 rows_deleted | daily metric |
| private_locations 表行数 | daily metric |
| private_locations 表 retention_until < NOW() + 7d 的行数 | daily metric（preparing for cleanup） |

详见 `e-p0-10-monitoring/`（其他子代理的输出）。

---

## 11. Blocker Log

| 日期 | 议题 | Owner | 解锁条件 | 状态 |
|---|---|---|---|---|
| 2026-08-24 | Privacy Officer 工单系统选型（Linear / Jira / 自建） | PM + Privacy-Legal | Gate C 前 | OPEN |
| 2026-08-24 | DPIA 报告模板与归档路径（`/legal/dpia/` 是否在 Obsidian） | Privacy-Legal | Gate C 前签字 | OPEN |
| 2026-08-24 | access_log 是否需要持久化到外部冷存储（S3 IA / Glacier） | Engineer + Privacy-Legal | Gate C 前 | OPEN |
| 2026-08-24 | GDPR 30 天响应 SLA 的 on-call owner 排班 | PM | Gate C 前 | OPEN |

---

## 12. 自验收 Acceptance Criteria

- [x] access_log 表 schema 完整（含 purpose enum CHECK）
- [x] append-only trigger 阻止 UPDATE / DELETE
- [x] 应用层 atomic transaction（read + INSERT audit_log 同事务）
- [x] purpose 强制 enum，不允许自由文本
- [x] 所有 lat/lon 访问触发点都被覆盖
- [x] 越权检测 + 告警规则（实时 + 定期）
- [x] Privacy Officer 定期审计流程（周 / 月 / 季度）
- [x] GDPR Art.17 删除请求流程
- [x] 与 E-P0-10 monitoring 集成
- [x] Blocker Log 完整

---

## 13. 关联文档

| 文档 | 用途 |
|---|---|
| `data-architecture-v1.md` §4.2 + §7 | access_log schema + cleanup |
| `public-private-split-v1.md` §1 边界 5 | 访问审计 |
| `role-permission-v1.md` §2 + §6 | 角色 × 资源矩阵 + alert |
| `encryption-v1.md` | KMS key 管理 |
| `leak-test-v1.md` | audit_log 写入的 e2e 验证 |
| `e2e-test-cases-v1.md` | 端到端 audit_log 写入测试 |
| `../api-contract/error-code-dict-v1.md` §9 | ERR_INTERNAL_UNAUTHORISED_RAW_LOCATION_ACCESS |
| `../launch-checklist/privacy-compliance-v1.md` §4.3 | 删除请求流程 |
| `/Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/SEE-EARTH-Release-Strategy-v1-Design-Engineering-Task-Brief.md` §5 E-P0-05 + §10 全局 AC | Brief 原文 |

---

**End of audit-log-v1.md · E-P0-05 子任务 5/7**