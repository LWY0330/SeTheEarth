---
title: SEE EARTH V1 · E-P0-05 · 加密 / 传输 / 90 天自动清理 · v1.0.0
type: encryption
tags: [release-v1, e-p0-05, location-isolation, pgcrypto, tls, kms, cleanup, retention, see-earth]
task_id: E-P0-05
brief_anchor: "Release Strategy Brief §5 E-P0-05 · 加密 / 保留期限 + E §F 任务卡"
track: engineering
owner: Engineer Agent #6 (external Owner = 用户)
created: 2026-08-24
status: DRAFT · IN REVIEW（待同步 Obsidian）
target_gate: Gate A · Internal Alpha
source_brief: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/SEE-EARTH-Release-Strategy-v1-Design-Engineering-Task-Brief.md
source_task_card: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/06-PM Agent 交接/2026-08-22-task-card-e-p0-05-location-isolation.md
related_docs:
  - ./data-architecture-v1.md §4 + §7
  - ./public-private-split-v1.md §1 边界 3 + 4
  - ./role-permission-v1.md
  - ./audit-log-v1.md
  - ../launch-checklist/privacy-compliance-v1.md §4.1
depends_on:
  - E-P0-01 (✓ ACCEPTED)
  - E-P0-09 (✓ ACCEPTED)
blocks: [E-P0-03, E-P0-10]
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/06-PM Agent 交接/release-v1/e-p0-05-location-isolation/encryption-v1.md
workspace_canonical_path: /Users/lwy/Documents/ChatGPT/看见地球/release-v1/e-p0-05-location-isolation/encryption-v1.md
sync_required: true · sandbox 拒绝写入 Obsidian
note: 本文件已就绪，需 PM Agent 由 Obsidian 写入权限落地到 canonical 路径。
---

# SEE EARTH V1 · E-P0-05 · 加密 / 传输 / 90 天自动清理 · v1.0.0

> **作者**：Engineer Agent #6（外部 Owner = 您 / PM Orchestrator）  
> **完成时间**：2026-08-24  
> **目的**：定义 V1 `private_locations` 表的 pgcrypto 列加密、传输层 TLS、加密 key 生命周期管理、以及 90 天自动清理（per OD-04）的实施细节。

---

## 0. 一句话总结

**`private_locations.latitude / longitude / accuracy_meters` 在 DB 层用 pgcrypto `pgp_sym_encrypt` 列加密，加密 key 由 AWS KMS / GCP KMS 管理 + Vercel Secrets 注入；所有 API 强制 HTTPS（Vercel 自动 TLS 1.3）；每条精确位置 `retention_until = created_at + 90 days`，每日 03:00 UTC cron job 物理 DELETE 过期行；access_log 是永久保留的 append-only 审计证据。**

---

## 1. 静态加密（pgcrypto 列加密）

### 1.1 为什么选 pgcrypto 列加密（vs 应用层加密 vs 全表加密）

| 方案 | 优点 | 缺点 | V1 选择 |
|---|---|---|---|
| **DB 列加密 (pgcrypto)** | 加密与 GRANT/RLS 双重防御；DBA 也无法看到明文 | 加密列不能建普通索引；schema migration 复杂 | ✅ **V1 选** |
| **应用层加密**（Node.js 加密后再写） | 灵活，可换算法 | 加密 key 必须部署到应用，泄漏面大；DBA 不受保护 | ❌ |
| **全表加密**（TDE / LUKS） | 透明，对应用无侵入 | 备份仍是明文；GRANT 失效后仍可读 | ❌（不够） |
| **TDE + 列加密** | 双层防御 | 复杂度高；V1 不需要 | V2 可选 |

### 1.2 pgcrypto 列加密 schema

> 详见 `data-architecture-v1.md §4.1`。本节补充实施细节：

```sql
-- 1. 启用扩展
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. private_locations 表
CREATE TABLE private_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL UNIQUE REFERENCES witness_submissions(id) ON DELETE CASCADE,
  city_id TEXT NOT NULL REFERENCES cities(id),

  latitude_enc        BYTEA NOT NULL,  -- pgp_sym_encrypt(latitude::text, KEY)
  longitude_enc       BYTEA NOT NULL,
  accuracy_meters_enc BYTEA,            -- 可空

  source TEXT NOT NULL DEFAULT 'gps' CHECK (source IN ('gps','manual')),
  retention_until TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. 解密视图（仅 moderator / admin 角色可读）
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

-- 4. GRANT
REVOKE ALL ON private_locations FROM PUBLIC;
REVOKE ALL ON private_locations_decrypted FROM PUBLIC;
GRANT INSERT ON private_locations TO seeearth_witness, seeearth_system;
GRANT SELECT ON private_locations_decrypted TO seeearth_moderator, seeearth_admin;
```

### 1.3 加密算法选型

| 算法 | V1 选择 | 理由 |
|---|---|---|
| **pgp_sym_encrypt** | ✅ | PostgreSQL 原生；AES-256 默认；支持 AES-128/192/256 |
| 摘要算法 | SHA-512 | pgp_sym_encrypt 默认 |
| Key 长度 | 256-bit (32 bytes) | AES-256 标配 |
| Key 派生 | 直接使用（不二次派生） | KMS key 已足够强 |

```sql
-- V1 默认 pgp_sym_encrypt 配置
-- AES-256, SHA-512 digest
pgp_sym_encrypt(
  plaintext := $1::text,
  password  := current_setting('app.encryption_key'),
  options   := 'cipher-algo=aes256 digest-algo=sha512 compress-algo=1'
)
```

### 1.4 写入路径（Witness submission）

```typescript
// src/server/services/privateLocations.ts
import { db } from '@/server/db';
import { getKMSKey } from '@/server/secrets';

export async function insertPrivateLocation(params: {
  submissionId: string;
  cityId: string;
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
  source: 'gps' | 'manual';
}): Promise<string> {
  const key = await getKMSKey('private_locations_encryption_key');
  const retentionUntil = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days
  
  const result = await db.query(`
    INSERT INTO private_locations (
      submission_id, city_id,
      latitude_enc, longitude_enc, accuracy_meters_enc,
      source, retention_until
    ) VALUES (
      $1, $2,
      pgp_sym_encrypt($3::text, $7, 'cipher-algo=aes256 digest-algo=sha512'),
      pgp_sym_encrypt($4::text, $7, 'cipher-algo=aes256 digest-algo=sha512'),
      CASE WHEN $5::numeric IS NOT NULL
           THEN pgp_sym_encrypt($5::numeric::text, $7, 'cipher-algo=aes256 digest-algo=sha512')
           ELSE NULL END,
      $6, $8
    )
    RETURNING id
  `, [
    params.submissionId,
    params.cityId,
    params.latitude.toFixed(6),
    params.longitude.toFixed(6),
    params.accuracyMeters?.toFixed(2) ?? null,
    params.source,
    key,
    retentionUntil.toISOString(),
  ]);
  
  return result.rows[0].id;
}
```

### 1.5 读取路径（moderator / admin）

```typescript
// src/server/services/privateLocations.ts (续)
export async function getPrivateLocationDecrypted(
  locationId: string,
  purpose: 'moderation' | 'review' | 'audit' | 'legal_request',
  actor: { userId: string; ipAddress: string }
): Promise<PrivateLocation | null> {
  const key = await getKMSKey('private_locations_encryption_key');
  
  // 1. 设置 PostgreSQL session 变量
  // 2. SELECT from view（自动 decrypt）
  // 3. INSERT access_log（事务内）
  // 4. 提交事务
  return await db.transaction(async (tx) => {
    await tx.execute(`SET LOCAL app.encryption_key = '${key}'`);
    await tx.execute(`SET LOCAL app.actor_user_id = '${actor.userId}'`);
    await tx.execute(`SET LOCAL app.actor_ip = '${actor.ipAddress}'`);
    await tx.execute(`SET LOCAL app.access_purpose = '${purpose}'`);
    
    // 读取（view 自动 decrypt）
    const result = await tx.query(
      `SELECT * FROM private_locations_decrypted WHERE id = $1`,
      [locationId]
    );
    if (result.rows.length === 0) return null;
    
    // ⚠️ 关键：INSERT access_log 在同一事务内（详见 audit-log-v1.md §3）
    await tx.query(
      `INSERT INTO private_location_access_log (user_id, location_id, purpose, ip_address)
       VALUES ($1, $2, $3, $4::INET)`,
      [actor.userId, locationId, purpose, actor.ipAddress]
    );
    
    return result.rows[0];
  });
}
```

---

## 2. 加密 key 生命周期管理

### 2.1 key 存储分层

| 层 | 存储 | 谁可访问 |
|---|---|---|
| **KMS（生产）** | AWS KMS / GCP KMS / HashiCorp Vault | 仅有 server role IAM 权限 |
| **应用 secrets** | Vercel Environment Variables / Doppler / 1Password | Server runtime only |
| **DB session** | `SET LOCAL app.encryption_key = '...'` （事务级） | 仅当前 DB connection |
| **客户端 bundle** | ❌ **绝不** | n/a |

### 2.2 key 轮换（rotation）

| 触发 | 频率 | 流程 |
|---|---|---|
| **定期轮换** | 每 90 天 | 生成新 key → 双写（old + new）→ 重新加密 → 删除旧 key |
| **事件驱动轮换** | 离职员工 / 泄漏事件 / 季度安全审计 | 立即轮换 |
| **首次上线** | T0 | 生成初始 key + 写入 KMS + 部署到 secrets |

#### 双写轮换流程

```text
[Day 0] 生成 KMS key v2 · 部署到 Vercel Secrets
[Day 1-7] 应用启动时：检测 KMS 有 v2 但 DB 仅有 v1 加密数据
          → 启动后台 Job: SELECT private_locations WHERE created_at < Day-1
          → decrypt with v1 → encrypt with v2 → UPDATE row
[Day 8] 所有数据已用 v2 加密 → 应用停止 decrypt with v1
[Day 30] 物理删除 KMS key v1
```

> ⚠️ **V1 简化**：V1 仅支持单一 active key（无多版本）；轮换通过"批量 decrypt with old + re-encrypt with new"完成。轮换期间服务短暂不可用（< 1 分钟）。

### 2.3 key 派生与使用规范

| 规则 | V1 |
|---|---|
| Key 不进 git | ✅ |
| Key 不进日志 / 错误堆栈 | ✅ |
| Key 不进 DB 备份（独立加密备份） | ✅ |
| Key 不进客户端 bundle | ✅ |
| Key 不进 CDN / 边缘函数 | ✅ |
| Key 不进第三方服务（除非经过 KMS） | ✅ |
| 不同表的 key 独立 | `private_locations_encryption_key` / `witness_descriptions_encryption_key`（独立） |

### 2.4 Backups 加密

| 备份类型 | 加密 | 保留期 |
|---|---|---|
| DB 全量备份 | AES-256 静态加密（PG 备份工具自带 / S3 SSE-KMS） | 90 天 |
| DB WAL archive | 同上 | 30 天 |
| Object Storage 备份 | SSE-KMS | 永久（编辑版本） |
| 原图（30 天保留） | SSE-KMS | 30 天 |

---

## 3. 传输加密（TLS / HTTPS）

### 3.1 强制 HTTPS

```text
[客户端] → HTTPS only → [Vercel Edge / CDN] (TLS 1.3) → [Server API]
```

| 配置 | V1 默认 |
|---|---|
| TLS 版本 | TLS 1.3（Vercel 默认） |
| HTTP → HTTPS 重定向 | 301（Vercel 自动） |
| HSTS | `max-age=31536000; includeSubDomains; preload`（Vercel 自动） |
| Certificate | Let's Encrypt（Vercel 自动 renew） |

### 3.2 Vercel 配置

```jsonc
// vercel.json (示例)
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains; preload"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; img-src 'self' https://images.unsplash.com https://*.supabase.co data:; style-src 'self' 'unsafe-inline'; script-src 'self'"
        }
      ]
    }
  ]
}
```

### 3.3 Object Storage（Supabase Storage / R2 / S3）传输

| 操作 | 加密 |
|---|---|
| Upload from server | HTTPS (TLS 1.3) |
| Download to public CDN | HTTPS + CDN edge cache |
| Public URL serving | HTTPS only（拒绝 HTTP） |

### 3.4 数据库连接加密

```bash
# PostgreSQL connection string (production)
DATABASE_URL=postgres://user:pass@host:5432/db?sslmode=verify-full&sslrootcert=/path/to/ca.pem
```

| SSL mode | V1 |
|---|---|
| `verify-full` | ✅ 强制（验证 CA + hostname） |
| 拒绝明文连接 | ✅ |
| 拒绝自签名证书 | ✅ |

---

## 4. 90 天自动清理（per OD-04）

### 4.1 保留策略

| 数据类型 | 保留期限 | 到期动作 | 法务依据 |
|---|---|---|---|
| **`private_locations` 表** | 90 天（retention_until = created_at + 90d） | 物理 DELETE | GDPR Art.5(1)(e) "storage limitation"; Brief §E-P0-05 |
| `private_location_access_log` | **永久**（append-only） | 不删除 | 审计完整性要求 |
| `cleanup_run_log` | **永久** | 不删除 | 运营审计要求 |
| 原图（original image in object storage） | 30 天 | 物理 DELETE 对象 | `privacy-compliance-v1.md §4.1` |
| 公开 variant（thumb_320 / card_640 / detail_1280 / full_2560） | 永久（除非 Moment 撤下） | 跟随 Moment 生命周期 | 公开内容 |
| Analytics 事件 | 90 天 | 聚合后 DELETE 明细 | `forbidden-fields-v1.md` |
| IP 地址 | 7 天 | 滚动 DELETE | 数据最小化 |
| User Agent | 7 天 | 滚动 DELETE | 数据最小化 |

### 4.2 清理 Cron Job（每日 03:00 UTC）

```typescript
// src/server/jobs/cleanupPrivateLocations.ts
import { db } from '@/server/db';
import { logJobRun } from '@/server/services/cleanupRunLog';

export async function runPrivateLocationsCleanup(): Promise<void> {
  const startedAt = new Date();
  let rowsDeleted = 0;
  let status: 'success' | 'failed' = 'success';
  let errorMessage: string | null = null;
  
  try {
    const result = await db.transaction(async (tx) => {
      // 1. 删除过期精确位置
      const deleted = await tx.query(
        `DELETE FROM private_locations WHERE retention_until < NOW() RETURNING id`
      );
      return deleted.rowCount ?? 0;
    });
    rowsDeleted = result;
  } catch (err) {
    status = 'failed';
    errorMessage = err instanceof Error ? err.message : String(err);
  }
  
  // 2. 记录 cleanup_run_log（永久保留）
  await logJobRun({
    job_name: 'cleanup_private_locations',
    rows_deleted: rowsDeleted,
    started_at: startedAt,
    finished_at: new Date(),
    status,
    error_message: errorMessage,
  });
  
  // 3. Alert（如果失败 or rowsDeleted 异常）
  if (status === 'failed') {
    await alertOnCall('cleanup_private_locations_failed', errorMessage);
  }
  if (rowsDeleted > 1000) {
    await alertOnCall('cleanup_private_locations_unusual_volume', `Deleted ${rowsDeleted} rows`);
  }
}
```

### 4.3 Vercel Cron / GitHub Actions 配置

#### 方案 A：Vercel Cron（推荐 · 与 Vercel 部署集成）

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/internal/jobs/cleanup-private-locations",
      "schedule": "0 3 * * *"  // 每日 03:00 UTC
    }
  ]
}
```

#### 方案 B：GitHub Actions cron

```yaml
# .github/workflows/cleanup-cron.yml
name: Cleanup Private Locations
on:
  schedule:
    - cron: '0 3 * * *'  # 每日 03:00 UTC
  workflow_dispatch:  # 手动触发

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger cleanup
        run: |
          curl -X POST "${{ secrets.PRODUCTION_URL }}/api/internal/jobs/cleanup-private-locations" \
            -H "X-Internal-Token: ${{ secrets.INTERNAL_TOKEN }}" \
            -H "Content-Type: application/json"
```

### 4.4 清理 Job 验证

```typescript
// e2e/tests/cleanup-job.spec.ts
test('90-day auto cleanup deletes expired private_locations', async () => {
  // 1. 插入一个 91 天前的 private_location（直接 SQL，绕过 retention_until 默认）
  const oldId = await db.query(`
    INSERT INTO private_locations (
      submission_id, city_id,
      latitude_enc, longitude_enc, source, retention_until
    ) VALUES (
      $1, 'kyoto',
      pgp_sym_encrypt('35.0116', $4), pgp_sym_encrypt('135.7681', $4),
      'gps', NOW() - INTERVAL '1 day'
    ) RETURNING id
  `, [submissionId, /* ... */, key]);
  
  // 2. 触发清理 Job
  await fetch(`${BASE_URL}/api/internal/jobs/cleanup-private-locations`, {
    method: 'POST',
    headers: { 'X-Internal-Token': INTERNAL_TOKEN },
  });
  
  // 3. 验证行已删除
  const result = await db.query(
    `SELECT * FROM private_locations WHERE id = $1`,
    [oldId.rows[0].id]
  );
  expect(result.rows.length).toBe(0);
  
  // 4. 验证 cleanup_run_log 已记录
  const log = await db.query(
    `SELECT * FROM cleanup_run_log WHERE job_name = 'cleanup_private_locations' ORDER BY finished_at DESC LIMIT 1`
  );
  expect(log.rows[0].status).toBe('success');
  expect(log.rows[0].rows_deleted).toBeGreaterThanOrEqual(1);
});
```

### 4.5 清理失败的兜底

| 失败模式 | 兜底 |
|---|---|
| Job 本身崩溃（OOM / OOM / DB 不可达） | 下次 cron 触发时重试；超过 3 天未成功 → on-call alert |
| DB 部分行 DELETE 失败（如 FK constraint violation） | 事务回滚；记录到 `cleanup_run_log.status='failed'` |
| retention_until 字段被改写为未来日期 | DB CHECK 约束：`retention_until <= created_at + 90 days`（防止被改） |
| access_log 永远不被清理 | 由 design 保证（append-only + 永久保留） |

---

## 5. 数据最小化（V1 默认不收集原则）

| 数据 | V1 默认 |
|---|---|
| 精确 GPS | ✅ 收集（仅审核 / 风控用途，90 天清理） |
| GPS accuracy | ✅ 收集（同上） |
| 拍摄时间 | ✅ 收集（永久保留） |
| EXIF GPS | ❌ **不**进公开 variant（已 strip） |
| EXIF 设备指纹（Make / Model / Serial） | ❌ 不进 DB；上传时 strip |
| EXIF 自由文本（UserComment / Description） | ❌ 不进 DB；strip |
| User Agent | ✅ 短期保留（7 天），hash 后存 |
| IP 地址 | ✅ 短期保留（7 天），hash 后存 |
| Email（Witness 联系） | ❌ V1 不收集（用 `client_key` 撤回） |
| Phone | ❌ 不收集 |
| Cookie | ❌ 不写（Privacy-First 模式） |
| 第三方追踪 SDK | ❌ 不集成 |

---

## 6. 与法务 / 合规的对齐

| 法规 | 要求 | V1 实施 |
|---|---|---|
| **GDPR Art.5(1)(c) Data minimisation** | 仅收集必要数据 | §5 |
| **GDPR Art.5(1)(e) Storage limitation** | 不超过必要保留期 | 90 天清理 |
| **GDPR Art.32 Security of processing** | 静态 + 传输加密 | §1 + §3 |
| **GDPR Art.30 Records of processing** | 处理活动可追溯 | access_log 永久保留 |
| **CCPA Right to delete** | 用户可请求删除 | `privacy@see-earth.com` 邮件流程（详见 `privacy-compliance-v1.md §4.3`） |
| **中国 PIPL 第 19 条** | 最小必要 · 知情同意 | Witness 提交前明确告知（`copy-final-v1.md §4`） |
| **COPPA** | 不针对 13 岁以下 | 不主动收集年龄；服务条款声明 |

---

## 7. Blocker Log

| 日期 | 议题 | Owner | 解锁条件 | 状态 |
|---|---|---|---|---|
| 2026-08-24 | KMS provider 选型（AWS KMS / GCP KMS / HashiCorp Vault） | Engineer + PM | E-P0-02 启动前 1 天 | OPEN |
| 2026-08-24 | 90 天 vs 30 天 retention 法务依据（GDPR Storage limitation） | Privacy-Legal | Gate C 前签字 | OPEN |
| 2026-08-24 | Vercel Cron vs GitHub Actions cron 选型 | Engineer | E-P0-08 启动时决策 | OPEN |
| 2026-08-24 | Key rotation V1 是否必需（vs 接受"创建后不变"） | PM + Privacy-Legal | Gate C 前 | OPEN |

---

## 8. 自验收 Acceptance Criteria

- [x] 静态加密：pgcrypto pgp_sym_encrypt AES-256 + SHA-512
- [x] 加密 key 管理分层：KMS → Vercel Secrets → DB session
- [x] 传输加密：HTTPS + TLS 1.3 + HSTS + CSP
- [x] DB connection SSL：verify-full
- [x] 90 天 retention + 自动清理 cron + cleanup_run_log
- [x] cleanup_job 失败告警 + 兜底
- [x] 数据最小化（V1 默认不收集原则）
- [x] 与 GDPR / CCPA / PIPL / COPPA 对齐
- [x] Blocker Log 完整
- [x] 不修改 14 LOCKED 组件 / 不修改 E-P0-09 LOCKED schema

---

## 9. 关联文档

| 文档 | 用途 |
|---|---|
| `data-architecture-v1.md` §4.1 + §7 | pgcrypto + cleanup SQL |
| `public-private-split-v1.md` §1 边界 3 + 4 | 加密 + EXIF |
| `role-permission-v1.md` | GRANT 与角色 |
| `audit-log-v1.md` | access_log 写入契约 |
| `../launch-checklist/privacy-compliance-v1.md` §4 | 数据收集 + 保留期 |
| `/Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/SEE-EARTH-Release-Strategy-v1-Design-Engineering-Task-Brief.md` §5 E-P0-05 | Brief 原文 |

---

**End of encryption-v1.md · E-P0-05 子任务 4/7**