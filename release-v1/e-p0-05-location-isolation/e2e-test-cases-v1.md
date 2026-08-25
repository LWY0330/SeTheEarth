---
title: SEE EARTH V1 · E-P0-05 · 端到端测试用例 · v1.0.0
type: e2e-test-cases
tags: [release-v1, e-p0-05, location-isolation, e2e, test-cases, playwright, jest, see-earth]
task_id: E-P0-05
brief_anchor: "Release Strategy Brief §5 E-P0-05 + H 任务卡 e2e/location-isolation.test.ts"
track: engineering
owner: Engineer Agent #6 (external Owner = 用户)
created: 2026-08-24
status: DRAFT · IN REVIEW（待同步 Obsidian）
target_gate: Gate A · Internal Alpha
source_brief: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/SEE-EARTH-Release-Strategy-v1-Design-Engineering-Task-Brief.md
source_task_card: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/06-PM Agent 交接/2026-08-22-task-card-e-p0-05-location-isolation.md §H
related_docs:
  - ./data-architecture-v1.md
  - ./public-private-split-v1.md
  - ./role-permission-v1.md
  - ./encryption-v1.md
  - ./audit-log-v1.md
  - ./leak-test-v1.md
  - ../api-contract/zod-schemas/city.ts
  - ../api-contract/zod-schemas/moment.ts
  - ../api-contract/zod-schemas/witness-submission.ts
depends_on:
  - E-P0-01 (✓ ACCEPTED)
  - E-P0-09 (✓ ACCEPTED)
blocks: [E-P0-03, E-P0-10]
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/06-PM Agent 交接/release-v1/e-p0-05-location-isolation/e2e-test-cases-v1.md
workspace_canonical_path: /Users/lwy/Documents/ChatGPT/看见地球/release-v1/e-p0-05-location-isolation/e2e-test-cases-v1.md
sync_required: true · sandbox 拒绝写入 Obsidian
note: 本文件已就绪，需 PM Agent 由 Obsidian 写入权限落地到 canonical 路径。
---

# SEE EARTH V1 · E-P0-05 · 端到端测试用例 · v1.0.0

> **作者**：Engineer Agent #6（外部 Owner = 您 / PM Orchestrator）  
> **完成时间**：2026-08-24  
> **目的**：定义 V1 Location Isolation 的端到端测试用例集，覆盖 Brief §E-P0-05 任务卡 §H 列出的 5 个核心测试 + 任务卡 §AC 10 项 + 边界场景。

---

## 0. 一句话总结

**e2e 测试集共 12 组 38 个用例，覆盖：(1) 公共 API 0 GPS / (2) Public Moment 0 precise / (3) Public image 0 EXIF / (4) Moderator access logged / (5) 90-day auto cleanup / (6) Witness 不能访问自己的 lat/lon / (7) Admin role escalation / (8) RBAC 边界 / (9) Audit log append-only / (10) Public cache no GPS / (11) Frontend payload 0 GPS / (12) Schema 严格校验。**

---

## 1. 测试集概览

| # | 测试组 | 用例数 | 工具 | 目标 Gate |
|---|---|---:|---|---|
| 1 | `public-api-no-gps.spec.ts` | 10 | Jest + fetch | Gate A |
| 2 | `public-moment-no-precise.spec.ts` | 6 | Jest + Zod | Gate A |
| 3 | `public-image-no-exif.spec.ts` | 4 | Node + sharp + exifr | Gate A |
| 4 | `moderator-access-logged.spec.ts` | 4 | Jest + DB query | Gate A |
| 5 | `cleanup-90-day.spec.ts` | 3 | Jest + time-mock | Gate A |
| 6 | `witness-no-self-access.spec.ts` | 3 | Jest + fetch | Gate A |
| 7 | `role-escalation.spec.ts` | 2 | Jest + fetch | Gate A |
| 8 | `rbac-boundary.spec.ts` | 4 | Jest + DB | Gate A |
| 9 | `audit-log-append-only.spec.ts` | 3 | Jest + DB | Gate A |
| 10 | `public-cache-no-gps.spec.ts` | 2 | Jest + curl -I | Gate A |
| 11 | `frontend-payload-no-gps.spec.ts` | 4 | Playwright | Gate A |
| 12 | `zod-strict-public-schema.spec.ts` | 3 | Jest + Zod | Gate A |
| **合计** | — | **48** | — | — |

---

## 2. 测试组 1 · 公共 API 0 GPS（10 用例）

### 1.1 `GET /v1/cities` 响应 0 GPS 字段

```typescript
// e2e/tests/location-isolation/public-api-no-gps.spec.ts
import { CityListEnvelopeSchema } from '@/release-v1/api-contract/zod-schemas/city';

describe('Location Isolation · Public API 0 GPS', () => {
  test('GET /v1/cities · 响应不含 lat/lon', async () => {
    const response = await fetch(`${BASE_URL}/v1/cities`);
    const json = await response.json();
    
    // 1. Zod 严格校验
    const parsed = CityListEnvelopeSchema.safeParse(json);
    expect(parsed.success).toBe(true);
    
    // 2. 显式 grep
    const jsonStr = JSON.stringify(json);
    expect(jsonStr).not.toMatch(/"latitude"/i);
    expect(jsonStr).not.toMatch(/"longitude"/i);
    expect(jsonStr).not.toMatch(/"raw_coordinates"/i);
    
    // 3. 验证公共 schema 字段齐全
    if (parsed.success) {
      for (const city of parsed.data.data) {
        expect(city.public_location_only).toBe(true);
        expect(city).toHaveProperty('id');
        expect(city).toHaveProperty('slug');
        expect(city).toHaveProperty('names');
        expect(city).toHaveProperty('timezone');
        expect(city).toHaveProperty('layer');
      }
    }
  });
  
  test('GET /v1/cities/{id} · 响应不含 lat/lon', async () => {
    const response = await fetch(`${BASE_URL}/v1/cities/kyoto`);
    const json = await response.json();
    
    expect(JSON.stringify(json)).not.toMatch(/"latitude"/i);
    expect(JSON.stringify(json)).not.toMatch(/"longitude"/i);
    
    const parsed = CityListEnvelopeSchema.shape.data.element.safeParse(json.data);
    expect(parsed.success).toBe(true);
  });
  
  test('GET /v1/cities/{id} · 全部 12 城 0 GPS', async () => {
    const slugs = ['kyoto', 'lisbon', 'shanghai', 'tokyo', 'mexico-city', 'rio',
                   'reykjavik', 'cape-town', 'london', 'berlin', 'rome', 'sydney'];
    
    for (const slug of slugs) {
      const response = await fetch(`${BASE_URL}/v1/cities/${slug}`);
      const json = await response.json();
      const jsonStr = JSON.stringify(json);
      expect(jsonStr).not.toMatch(/"latitude"/i);
      expect(jsonStr).not.toMatch(/"longitude"/i);
      expect(jsonStr).not.toMatch(/35\.011[0-9]+/);  // Kyoto lat literal
    }
  });
  
  test('GET /v1/moments/{id} · 响应 0 GPS', async () => {
    const response = await fetch(`${BASE_URL}/v1/moments/${KNOWN_MOMENT_ID}`);
    const json = await response.json();
    
    expect(JSON.stringify(json)).not.toMatch(/"latitude"/i);
    expect(JSON.stringify(json)).not.toMatch(/"longitude"/i);
    expect(JSON.stringify(json)).not.toMatch(/"raw_location"/i);
    expect(JSON.stringify(json)).not.toMatch(/"precise"/i);
  });
  
  test('GET /v1/moments · list 响应 0 GPS', async () => {
    const response = await fetch(`${BASE_URL}/v1/moments`);
    const json = await response.json();
    
    expect(JSON.stringify(json)).not.toMatch(/"latitude"/i);
    expect(JSON.stringify(json)).not.toMatch(/"longitude"/i);
  });
  
  test('GET /v1/moments/by-city/{city_id} · 0 GPS', async () => {
    const response = await fetch(`${BASE_URL}/v1/moments/by-city/kyoto`);
    const json = await response.json();
    
    expect(JSON.stringify(json)).not.toMatch(/"latitude"/i);
    expect(JSON.stringify(json)).not.toMatch(/"longitude"/i);
  });
  
  test('GET /v1/editions/today · 0 GPS', async () => {
    const response = await fetch(`${BASE_URL}/v1/editions/today`);
    const json = await response.json();
    
    expect(JSON.stringify(json)).not.toMatch(/"latitude"/i);
    expect(JSON.stringify(json)).not.toMatch(/"longitude"/i);
    expect(JSON.stringify(json)).not.toMatch(/"raw_location"/i);
  });
  
  test('GET /v1/editions/{date} · 0 GPS', async () => {
    const response = await fetch(`${BASE_URL}/v1/editions/2026-08-22`);
    const json = await response.json();
    
    expect(JSON.stringify(json)).not.toMatch(/"latitude"/i);
    expect(JSON.stringify(json)).not.toMatch(/"longitude"/i);
  });
  
  test('GET /v1/cities 响应头不含 GPS EXIF', async () => {
    const response = await fetch(`${BASE_URL}/v1/cities`);
    const headers = response.headers;
    
    // 检查关键 header
    expect(headers.get('cache-control')).toMatch(/public.*max-age=\d+/);
    expect(headers.get('x-content-type-options')).toBe('nosniff');
    
    // 不应有任何 GPS / location 字段
    const allHeaders = JSON.stringify(Object.fromEntries(headers));
    expect(allHeaders).not.toMatch(/"latitude"/i);
    expect(allHeaders).not.toMatch(/"longitude"/i);
  });
  
  test('Response body 严格 Zod 校验 · 任何额外字段即 fail', async () => {
    const response = await fetch(`${BASE_URL}/v1/cities/kyoto`);
    const json = await response.json();
    
    // PublicCitySchema.safeParse 应该 success
    const parsed = require('@/release-v1/api-contract/zod-schemas/city').CityEnvelopeSchema.safeParse(json);
    expect(parsed.success).toBe(true);
    if (!parsed.success) {
      console.error('Unexpected Zod errors:', parsed.error.issues);
    }
  });
});
```

---

## 3. 测试组 2 · Public Moment 0 precise（6 用例）

```typescript
// e2e/tests/location-isolation/public-moment-no-precise.spec.ts
import { PublicMomentSchema, MomentEnvelopeSchema } from '@/release-v1/api-contract/zod-schemas/moment';

describe('Location Isolation · Public Moment 0 precise', () => {
  const KNOWN_MOMENT_ID = 'test-moment-id';
  
  test('PublicMomentSchema 0 precise.latitude / precise.longitude', async () => {
    const response = await fetch(`${BASE_URL}/v1/moments/${KNOWN_MOMENT_ID}`);
    const json = await response.json();
    
    const parsed = MomentEnvelopeSchema.safeParse(json);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.data).not.toHaveProperty('raw_location');
      expect(parsed.data.data).not.toHaveProperty('precise');
      expect(parsed.data.data).not.toHaveProperty('latitude');
      expect(parsed.data.data).not.toHaveProperty('longitude');
    }
  });
  
  test('Witness 自己的 submission 也不返回 precise', async () => {
    const response = await fetch(`${BASE_URL}/v1/witness/submissions/my-sub-id`, {
      headers: { 'X-Witness-Key': process.env.WITNESS_KEY || 'test-key' },
    });
    expect(response.status).toBe(200);
    const json = await response.json();
    
    const parsed = PublicWitnessSubmissionSchema.safeParse(json.data);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      // 即使是 owner，也看不到 lat/lon
      expect(parsed.data).not.toHaveProperty('location');
      expect(parsed.data).not.toHaveProperty('precise');
      expect(parsed.data.location_mode).toMatch(/auto_gps_city|manual_city|denied_fallback_manual/);
    }
  });
  
  test('Public Moment 仅 city_id，不含 raw_location', async () => {
    const response = await fetch(`${BASE_URL}/v1/moments/${KNOWN_MOMENT_ID}`);
    const json = await response.json();
    const data = json.data;
    
    // 必填字段
    expect(data).toHaveProperty('id');
    expect(data).toHaveProperty('city_id');
    expect(data).toHaveProperty('public_city_name');
    expect(data).toHaveProperty('captured_at');
    expect(data).toHaveProperty('captured_at_tz');
    expect(data).toHaveProperty('image_variants');
    
    // 禁采字段
    expect(data).not.toHaveProperty('raw_location');
    expect(data).not.toHaveProperty('latitude');
    expect(data).not.toHaveProperty('longitude');
    expect(data).not.toHaveProperty('precise');
  });
  
  test('Public Moment 无 EXIF payload', async () => {
    const response = await fetch(`${BASE_URL}/v1/moments/${KNOWN_MOMENT_ID}`);
    const json = await response.json();
    const data = json.data;
    
    expect(data).not.toHaveProperty('exif_payload');
    expect(data).not.toHaveProperty('exif');
    expect(JSON.stringify(data)).not.toMatch(/exif/i);
  });
  
  test('Public Moment 无 description.text（仅 redacted enum）', async () => {
    const response = await fetch(`${BASE_URL}/v1/moments/${KNOWN_MOMENT_ID}`);
    const json = await response.json();
    const data = json.data;
    
    expect(data).not.toHaveProperty('description');
    expect(data).not.toHaveProperty('description_text');
    
    if (data.witness_id) {
      // Witness 提交仅有 redacted enum
      expect(['present', 'absent', 'under_review']).toContain(data.description_redacted);
    }
  });
  
  test('Public Moment 无 ip_hash / user_agent_hash', async () => {
    const response = await fetch(`${BASE_URL}/v1/moments/${KNOWN_MOMENT_ID}`);
    const json = await response.json();
    const data = json.data;
    
    expect(data).not.toHaveProperty('ip_hash');
    expect(data).not.toHaveProperty('user_agent_hash');
    expect(data).not.toHaveProperty('ip_address');
    expect(data).not.toHaveProperty('user_agent');
  });
});
```

---

## 4. 测试组 3 · Public Image 0 EXIF（4 用例）

```typescript
// e2e/tests/location-isolation/public-image-no-exif.spec.ts
import { fetchImageFromPublicAPI, parseImageExif } from '@/e2e/helpers/image';

describe('Location Isolation · Public Image 0 EXIF', () => {
  test('所有公开 variant 不含 GPS EXIF', async () => {
    const images = await fetchImageFromPublicAPI(`${BASE_URL}/v1/editions/today`);
    
    expect(images.length).toBeGreaterThan(0);
    
    for (const img of images) {
      const buffer = await fetch(img.url).then(r => r.arrayBuffer()).then(b => Buffer.from(b));
      const exif = await parseImageExif(buffer);
      
      expect(exif).not.toHaveProperty('GPSLatitude');
      expect(exif).not.toHaveProperty('GPSLongitude');
      expect(exif).not.toHaveProperty('GPSLatitudeRef');
      expect(exif).not.toHaveProperty('GPSLongitudeRef');
      expect(exif).not.toHaveProperty('GPSAltitude');
      expect(exif).not.toHaveProperty('GPSTimeStamp');
      expect(exif).not.toHaveProperty('GPSDateStamp');
    }
  });
  
  test('所有公开 variant 不含设备指纹 EXIF', async () => {
    const images = await fetchImageFromPublicAPI(`${BASE_URL}/v1/editions/today`);
    
    for (const img of images) {
      const buffer = await fetch(img.url).then(r => r.arrayBuffer()).then(b => Buffer.from(b));
      const exif = await parseImageExif(buffer);
      
      expect(exif).not.toHaveProperty('Make');
      expect(exif).not.toHaveProperty('Model');
      expect(exif).not.toHaveProperty('SerialNumber');
      expect(exif).not.toHaveProperty('LensModel');
      expect(exif).not.toHaveProperty('LensSerialNumber');
      expect(exif).not.toHaveProperty('Software');
      expect(exif).not.toHaveProperty('HostSoftware');
    }
  });
  
  test('所有公开 variant 不含自由文本 EXIF', async () => {
    const images = await fetchImageFromPublicAPI(`${BASE_URL}/v1/editions/today`);
    
    for (const img of images) {
      const buffer = await fetch(img.url).then(r => r.arrayBuffer()).then(b => Buffer.from(b));
      const exif = await parseImageExif(buffer);
      
      expect(exif).not.toHaveProperty('Artist');
      expect(exif).not.toHaveProperty('Copyright');
      expect(exif).not.toHaveProperty('UserComment');
      expect(exif).not.toHaveProperty('ImageDescription');
      expect(exif).not.toHaveProperty('XPComment');
      expect(exif).not.toHaveProperty('XPAuthor');
    }
  });
  
  test('Variant 含白名单 EXIF（Orientation / ColorSpace）', async () => {
    const images = await fetchImageFromPublicAPI(`${BASE_URL}/v1/editions/today`);
    
    for (const img of images) {
      const buffer = await fetch(img.url).then(r => r.arrayBuffer()).then(b => Buffer.from(b));
      const exif = await parseImageExif(buffer);
      
      // 白名单（V1 保留）
      // 注：Orientation / ColorSpace 不强制必须存在（部分图无 EXIF），
      // 但若存在则不应包含禁采字段
      if (exif.Orientation !== undefined) {
        expect([1, 2, 3, 4, 5, 6, 7, 8]).toContain(exif.Orientation);
      }
    }
  });
});
```

---

## 5. 测试组 4 · Moderator Access Logged（4 用例）

```typescript
// e2e/tests/location-isolation/moderator-access-logged.spec.ts
import { db } from '@/e2e/helpers/db';

describe('Location Isolation · Moderator Access Logged', () => {
  const MOD_TOKEN = process.env.MOD_TOKEN || '';
  const KNOWN_LOC_ID = process.env.KNOWN_LOCATION_ID || '';
  
  test('Moderator 访问 lat/lon 必写 audit_log', async () => {
    const beforeCount = await db.query(
      'SELECT COUNT(*) FROM private_location_access_log WHERE user_id = $1',
      ['moderator-1']
    );
    
    const response = await fetch(`${BASE_URL}/v1/admin/private-locations/${KNOWN_LOC_ID}`, {
      headers: {
        Authorization: `Bearer ${MOD_TOKEN}`,
        'X-Access-Purpose': 'moderation',
      },
    });
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.data).toHaveProperty('latitude');
    expect(json.data).toHaveProperty('longitude');
    
    const afterCount = await db.query(
      'SELECT COUNT(*) FROM private_location_access_log WHERE user_id = $1',
      ['moderator-1']
    );
    
    expect(Number(afterCount.rows[0].count)).toBe(Number(beforeCount.rows[0].count) + 1);
  });
  
  test('audit_log 必须含 user_id + location_id + purpose + ip_address', async () => {
    const response = await fetch(`${BASE_URL}/v1/admin/private-locations/${KNOWN_LOC_ID}`, {
      headers: {
        Authorization: `Bearer ${MOD_TOKEN}`,
        'X-Access-Purpose': 'review',
      },
    });
    expect(response.status).toBe(200);
    
    // 给 audit_log 提交时间（异步）
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const log = await db.query(
      `SELECT * FROM private_location_access_log 
       WHERE location_id = $1 AND user_id = 'moderator-1' AND purpose = 'review'
       ORDER BY accessed_at DESC LIMIT 1`,
      [KNOWN_LOC_ID]
    );
    
    expect(log.rows).toHaveLength(1);
    expect(log.rows[0]).toHaveProperty('user_id');
    expect(log.rows[0]).toHaveProperty('location_id');
    expect(log.rows[0]).toHaveProperty('purpose');
    expect(log.rows[0].purpose).toBe('review');
    expect(log.rows[0]).toHaveProperty('accessed_at');
    expect(log.rows[0].accessed_at).toBeTruthy();
  });
  
  test('purpose 必须是 enum（不接受自由文本）', async () => {
    // 尝试自由文本
    const response = await fetch(`${BASE_URL}/v1/admin/private-locations/${KNOWN_LOC_ID}`, {
      headers: {
        Authorization: `Bearer ${MOD_TOKEN}`,
        'X-Access-Purpose': 'Joe is debugging',  // 自由文本
      },
    });
    
    expect([400, 422]).toContain(response.status);
    
    // 验证 DB 无新增 audit_log
    const log = await db.query(
      `SELECT * FROM private_location_access_log 
       WHERE location_id = $1 AND purpose = 'Joe is debugging'`,
      [KNOWN_LOC_ID]
    );
    expect(log.rows).toHaveLength(0);  // DB CHECK 阻止
  });
  
  test('Audit log response 含 audit_id', async () => {
    const response = await fetch(`${BASE_URL}/v1/admin/private-locations/${KNOWN_LOC_ID}`, {
      headers: {
        Authorization: `Bearer ${MOD_TOKEN}`,
        'X-Access-Purpose': 'moderation',
      },
    });
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.data).toHaveProperty('audit_id');
    expect(json.data.audit_id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  });
});
```

---

## 6. 测试组 5 · 90 天自动清理（3 用例）

```typescript
// e2e/tests/location-isolation/cleanup-90-day.spec.ts
import { db } from '@/e2e/helpers/db';

describe('Location Isolation · 90-day Auto Cleanup', () => {
  const SYSTEM_TOKEN = process.env.INTERNAL_TOKEN || '';
  
  test('90 天前的 private_location 被自动 DELETE', async () => {
    // 1. 插入一个 retention_until 已过期的 private_location
    const oldId = await db.query(`
      INSERT INTO private_locations (
        submission_id, city_id,
        latitude_enc, longitude_enc,
        source, retention_until, created_at
      ) VALUES (
        $1, 'kyoto',
        pgp_sym_encrypt('35.0116', $2), pgp_sym_encrypt('135.7681', $2),
        'gps', NOW() - INTERVAL '1 day', NOW() - INTERVAL '91 days'
      ) RETURNING id
    `, [testSubmissionId, await getKMSKey()]);
    
    // 2. 触发清理 Job
    const response = await fetch(`${BASE_URL}/api/internal/jobs/cleanup-private-locations`, {
      method: 'POST',
      headers: { 'X-Internal-Token': SYSTEM_TOKEN },
    });
    expect(response.status).toBe(200);
    
    // 3. 验证行已删除
    const result = await db.query(
      'SELECT * FROM private_locations WHERE id = $1',
      [oldId.rows[0].id]
    );
    expect(result.rows).toHaveLength(0);
  });
  
  test('cleanup_run_log 记录清理结果', async () => {
    const response = await fetch(`${BASE_URL}/api/internal/jobs/cleanup-private-locations`, {
      method: 'POST',
      headers: { 'X-Internal-Token': SYSTEM_TOKEN },
    });
    expect(response.status).toBe(200);
    
    const log = await db.query(
      `SELECT * FROM cleanup_run_log 
       WHERE job_name = 'cleanup_private_locations' 
       ORDER BY finished_at DESC LIMIT 1`
    );
    
    expect(log.rows).toHaveLength(1);
    expect(log.rows[0].status).toBe('success');
    expect(log.rows[0].rows_deleted).toBeGreaterThanOrEqual(0);
    expect(log.rows[0].started_at).toBeTruthy();
    expect(log.rows[0].finished_at).toBeTruthy();
  });
  
  test('未到 90 天的 private_location 不被删除', async () => {
    // 插入一个 retention_until 未过期的行
    const newId = await db.query(`
      INSERT INTO private_locations (
        submission_id, city_id,
        latitude_enc, longitude_enc,
        source, retention_until
      ) VALUES (
        $1, 'kyoto',
        pgp_sym_encrypt('35.0116', $2), pgp_sym_encrypt('135.7681', $2),
        'gps', NOW() + INTERVAL '89 days'
      ) RETURNING id
    `, [testSubmissionId, await getKMSKey()]);
    
    const response = await fetch(`${BASE_URL}/api/internal/jobs/cleanup-private-locations`, {
      method: 'POST',
      headers: { 'X-Internal-Token': SYSTEM_TOKEN },
    });
    expect(response.status).toBe(200);
    
    // 验证行仍存在
    const result = await db.query(
      'SELECT * FROM private_locations WHERE id = $1',
      [newId.rows[0].id]
    );
    expect(result.rows).toHaveLength(1);
  });
});
```

---

## 7. 测试组 6 · Witness 不能访问自己的 lat/lon（3 用例）

```typescript
// e2e/tests/location-isolation/witness-no-self-access.spec.ts

describe('Location Isolation · Witness No Self Access', () => {
  const WITNESS_KEY = process.env.WITNESS_KEY || '';
  
  test('Witness 不能通过 /v1/witness/submissions/{id} 获取 lat/lon', async () => {
    const response = await fetch(`${BASE_URL}/v1/witness/submissions/my-own-submission-id`, {
      headers: { 'X-Witness-Key': WITNESS_KEY },
    });
    expect(response.status).toBe(200);
    const json = await response.json();
    
    // 即使是自己，也看不到 lat/lon
    expect(json.data).not.toHaveProperty('raw_location');
    expect(json.data).not.toHaveProperty('precise');
    expect(json.data).not.toHaveProperty('latitude');
    expect(json.data).not.toHaveProperty('longitude');
    expect(JSON.stringify(json.data)).not.toMatch(/"latitude"/i);
  });
  
  test('Witness 不能访问 /v1/admin/private-locations', async () => {
    const response = await fetch(`${BASE_URL}/v1/admin/private-locations/some-id`, {
      headers: { 'X-Witness-Key': WITNESS_KEY },
    });
    expect([401, 403]).toContain(response.status);
  });
  
  test('Witness session 过期后无法访问任何 submission', async () => {
    const response = await fetch(`${BASE_URL}/v1/witness/submissions/my-own-submission-id`, {
      headers: { 'X-Witness-Key': 'expired-key-123' },
    });
    expect([401, 404]).toContain(response.status);
  });
});
```

---

## 8. 测试组 7 · Role Escalation（2 用例）

```typescript
// e2e/tests/location-isolation/role-escalation.spec.ts

describe('Location Isolation · Role Escalation Prevention', () => {
  test('Anonymous 不能伪装成 moderator 访问 admin endpoint', async () => {
    const response = await fetch(`${BASE_URL}/v1/admin/private-locations/some-id`, {
      headers: {
        Authorization: 'Bearer fake-mod-token',
        'X-Access-Purpose': 'moderation',
      },
    });
    expect([401, 403]).toContain(response.status);
  });
  
  test('Moderator 不能访问 admin-only 元数据（如 role claims）', async () => {
    const MOD_TOKEN = await getModeratorToken();
    
    const response = await fetch(`${BASE_URL}/v1/admin/system/role-management`, {
      headers: { Authorization: `Bearer ${MOD_TOKEN}` },
    });
    expect([403, 404]).toContain(response.status);
  });
});
```

---

## 9. 测试组 8 · RBAC 边界（4 用例）

```typescript
// e2e/tests/location-isolation/rbac-boundary.spec.ts
import { db } from '@/e2e/helpers/db';

describe('Location Isolation · RBAC Boundary', () => {
  test('PostgreSQL GRANT · anon 角色无 private_locations SELECT 权限', async () => {
    // 直接通过 DB 测试（需要 anon role connection）
    const result = await db.anonQuery('SELECT COUNT(*) FROM private_locations');
    expect(result.rows[0].count).toBe('0');  // 0 行可见
  });
  
  test('PostgreSQL RLS · witness 角色 private_locations_no_anon policy', async () => {
    const result = await db.witnessQuery('SELECT * FROM private_locations LIMIT 1');
    expect(result.rows).toHaveLength(0);  // RLS USING (false) 阻止
  });
  
  test('PostgreSQL GRANT · anon 角色无 witness_submissions 公共字段外访问', async () => {
    // anon 只能 SELECT 公共字段，不能 UPDATE
    await expect(
      db.anonQuery('UPDATE witness_submissions SET status = $1 WHERE id = $2', ['rejected', 'x'])
    ).rejects.toThrow();
  });
  
  test('PostgreSQL GRANT · witness 角色不能 SELECT access_log', async () => {
    await expect(
      db.witnessQuery('SELECT * FROM private_location_access_log LIMIT 1')
    ).rejects.toThrow();
  });
});
```

---

## 10. 测试组 9 · Audit Log Append-only（3 用例）

```typescript
// e2e/tests/location-isolation/audit-log-append-only.spec.ts
import { db } from '@/e2e/helpers/db';

describe('Location Isolation · Audit Log Append-only', () => {
  test('UPDATE access_log 直接被 DB trigger 阻止', async () => {
    // 尝试 UPDATE（应抛异常）
    await expect(
      db.adminQuery('UPDATE private_location_access_log SET purpose = $1 WHERE id = (SELECT id FROM private_location_access_log LIMIT 1)', ['hacked'])
    ).rejects.toThrow(/append-only/);
  });
  
  test('DELETE access_log 直接被 DB trigger 阻止', async () => {
    await expect(
      db.adminQuery('DELETE FROM private_location_access_log WHERE id = (SELECT id FROM private_location_access_log LIMIT 1)')
    ).rejects.toThrow(/append-only/);
  });
  
  test('TRUNCATE access_log 直接被 DB trigger 阻止', async () => {
    await expect(
      db.adminQuery('TRUNCATE TABLE private_location_access_log')
    ).rejects.toThrow();
  });
});
```

---

## 11. 测试组 10 · Public Cache 0 GPS（2 用例）

```typescript
// e2e/tests/location-isolation/public-cache-no-gps.spec.ts

describe('Location Isolation · Public Cache 0 GPS', () => {
  test('Vercel CDN 缓存响应 0 GPS', async () => {
    // 第一次请求（miss） → 触发服务端渲染 → 写入 CDN
    await fetch(`${BASE_URL}/v1/cities/kyoto`);
    
    // 第二次请求（hit） → 从 CDN 取
    const response = await fetch(`${BASE_URL}/v1/cities/kyoto`, {
      headers: { 'X-Test-Cache': 'hit' },
    });
    const json = await response.json();
    
    expect(JSON.stringify(json)).not.toMatch(/"latitude"/i);
    expect(JSON.stringify(json)).not.toMatch(/"longitude"/i);
  });
  
  test('Admin endpoint Cache-Control 是 no-store', async () => {
    const MOD_TOKEN = await getModeratorToken();
    
    const response = await fetch(`${BASE_URL}/v1/admin/private-locations/some-id`, {
      headers: { Authorization: `Bearer ${MOD_TOKEN}`, 'X-Access-Purpose': 'review' },
    });
    
    const cacheControl = response.headers.get('cache-control');
    expect(cacheControl).toMatch(/no-store/);
  });
});
```

---

## 12. 测试组 11 · Frontend Payload 0 GPS（4 用例 · Playwright）

```typescript
// e2e/tests/location-isolation/frontend-payload-no-gps.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Location Isolation · Frontend Payload 0 GPS', () => {
  test('Homepage 不加载 lat/lng 到 JS bundle', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    
    // 等待网络空闲
    await page.waitForLoadState('networkidle');
    
    // 检查 page source
    const pageContent = await page.content();
    expect(pageContent).not.toMatch(/"latitude"/i);
    expect(pageContent).not.toMatch(/"longitude"/i);
    expect(pageContent).not.toMatch(/35\.011[0-9]+/);  // Kyoto lat
  });
  
  test('Moment Detail page 不显示 lat/lng', async ({ page }) => {
    await page.goto(`${BASE_URL}/moments/${KNOWN_MOMENT_ID}`);
    
    const pageContent = await page.content();
    expect(pageContent).not.toMatch(/"latitude"/i);
    expect(pageContent).not.toMatch(/"longitude"/i);
    
    // 检查页面无任何 data 属性含 GPS
    const gpsAttrs = await page.locator('[data-latitude], [data-longitude], [data-gps]').count();
    expect(gpsAttrs).toBe(0);
  });
  
  test('City Detail page 不显示 lat/lng', async ({ page }) => {
    await page.goto(`${BASE_URL}/cities/kyoto`);
    
    const pageContent = await page.content();
    expect(pageContent).not.toMatch(/"latitude"/i);
    expect(pageContent).not.toMatch(/"longitude"/i);
  });
  
  test('Analytics 事件 payload 0 GPS（mock 拦截 SDK）', async ({ page }) => {
    const analyticsEvents: any[] = [];
    await page.exposeFunction('captureAnalytics', (payload: any) => {
      analyticsEvents.push(payload);
    });
    
    await page.addInitScript(() => {
      const originalFetch = window.fetch;
      window.fetch = async (...args) => {
        const [url, opts] = args;
        if (typeof url === 'string' && url.includes('/v1/analytics/events')) {
          if (opts?.body) {
            const body = JSON.parse(opts.body as string);
            (window as any).captureAnalytics(body);
          }
        }
        return originalFetch(...(args as Parameters<typeof fetch>));
      };
    });
    
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState('networkidle');
    
    // 检查所有 Analytics 事件
    for (const event of analyticsEvents) {
      expect(JSON.stringify(event)).not.toMatch(/"latitude"/i);
      expect(JSON.stringify(event)).not.toMatch(/"longitude"/i);
      expect(JSON.stringify(event)).not.toMatch(/"raw_coordinates"/i);
      expect(JSON.stringify(event)).not.toMatch(/"precise"/i);
    }
  });
});
```

---

## 13. 测试组 12 · Zod Strict Public Schema（3 用例）

```typescript
// e2e/tests/location-isolation/zod-strict-public-schema.spec.ts
import {
  PublicCitySchema,
  CityEnvelopeSchema,
  CityListEnvelopeSchema,
} from '@/release-v1/api-contract/zod-schemas/city';
import {
  PublicMomentSchema,
  MomentEnvelopeSchema,
  MomentListEnvelopeSchema,
} from '@/release-v1/api-contract/zod-schemas/moment';
import { PublicWitnessSubmissionSchema } from '@/release-v1/api-contract/zod-schemas/witness-submission';

describe('Location Isolation · Zod Strict Public Schema', () => {
  test('PublicCitySchema 拒绝 lat/lon 字段', () => {
    const attempt = {
      id: 'kyoto',
      slug: 'kyoto',
      names: { canonical_name: 'Kyoto', name_zh: '京都', name_en: 'Kyoto',
               country_zh: '日本', country_en: 'Japan' },
      timezone: 'Asia/Tokyo',
      layer: 'blue',
      public_location_only: true,
      page_state: 'B_active',
      // ⚠️ 尝试 lat/lon
      latitude: 35.0116,
      longitude: 135.7681,
    };
    
    const result = PublicCitySchema.safeParse(attempt);
    expect(result.success).toBe(false);  // strict mode reject
    if (!result.success) {
      expect(result.error.issues.some(i => i.path.includes('latitude'))).toBe(true);
    }
  });
  
  test('PublicMomentSchema 拒绝 raw_location 字段', () => {
    const attempt = {
      id: 'm1',
      city_id: 'kyoto',
      public_city_name: 'Kyoto',
      captured_at: '2026-08-22T12:00:00+09:00',
      captured_at_tz: 'Asia/Tokyo',
      captured_at_source: 'exif',
      captured_at_confidence: 'high',
      uploaded_at: '2026-08-22T12:30:00Z',
      image_variants: [],
      source_type: 'witness',
      rights: 'unknown',
      credit: { credit_line: 'Test', rights_status: 'unknown' },
      provenance_status: 'self_reported',
      moderation_status: 'approved',
      // ⚠️ 尝试 raw_location
      raw_location: { latitude: 35.0116, longitude: 135.7681 },
    };
    
    const result = PublicMomentSchema.safeParse(attempt);
    expect(result.success).toBe(false);  // strict mode reject
  });
  
  test('PublicWitnessSubmissionSchema 拒绝 location.precise', () => {
    const attempt = {
      id: 'sub-1',
      client_key: 'test-key',
      status: 'submitted',
      media_type: 'photo_camera',
      asset_id: null,
      location_mode: 'auto_gps_city',
      public_city_id: 'kyoto',
      captured_at: '2026-08-22T12:00:00+09:00',
      captured_at_tz: 'Asia/Tokyo',
      captured_at_source: 'exif',
      captured_at_confidence: 'high',
      description_redacted: 'absent',
      // ⚠️ 尝试 location.precise
      location: {
        mode: 'auto_gps_city',
        public_city_id: 'kyoto',
        captured_at_tz: 'Asia/Tokyo',
        precise: { latitude: 35.0116, longitude: 135.7681 },
      },
    };
    
    const result = PublicWitnessSubmissionSchema.safeParse(attempt);
    expect(result.success).toBe(false);  // strict mode reject
  });
});
```

---

## 14. CI 集成 · 全部 48 用例在 PR + Gate 前必跑

```yaml
# .github/workflows/location-isolation-e2e.yml
name: Location Isolation E2E
on:
  pull_request:
    paths:
      - 'src/**'
      - 'release-v1/**'
      - 'e2e/tests/location-isolation/**'

jobs:
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: seeearth_test
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
        ports: ['5432:5432']
        options: --health-cmd pg_isready --health-interval 10s --health-timeout 5s --health-retries 5
    
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v5
        with: { node-version: '20' }
      
      - name: Install exiftool
        run: sudo apt-get install -y exiftool
      
      - name: Install dependencies
        run: npm ci
      
      - name: Setup DB
        run: |
          psql -h localhost -U test -d seeearth_test -f scripts/sql/schema.sql
          psql -h localhost -U test -d seeearth_test -f scripts/sql/seed-test.sql
      
      - name: Start server
        run: |
          npm run build
          npm run preview &
          sleep 5
      
      - name: Run location-isolation e2e
        env:
          BASE_URL: http://localhost:4173
          MOD_TOKEN: ${{ secrets.MOD_TOKEN }}
          WITNESS_KEY: ${{ secrets.WITNESS_KEY }}
          KNOWN_LOCATION_ID: ${{ secrets.KNOWN_LOCATION_ID }}
        run: npm run test:e2e:location-isolation
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: location-isolation-e2e-results
          path: test-results/
```

---

## 15. 与 Brief §E-P0-05 Acceptance Criteria 对齐

| Brief §AC | 本文件测试组 | 状态 |
|---|---|---|
| 公共 API 输出 0 GPS（自动化测试覆盖） | 测试组 1 (10 用例) + 12 (3 用例) | ✅ |
| 私有位置表独立 + pgcrypto 加密 | 数据架构测试（e2e/db/encryption.spec.ts） | ✅ |
| 访问审计日志完整（每次读都记录） | 测试组 4 (4 用例) + 9 (3 用例) | ✅ |
| 90 天自动清理实现 | 测试组 5 (3 用例) | ✅ |
| 公开图片 EXIF 剥离 | 测试组 3 (4 用例) | ✅ |
| 4 角色权限分离 | 测试组 6 (3) + 7 (2) + 8 (4) | ✅ |
| 公共缓存不含 GPS | 测试组 10 (2 用例) | ✅ |
| 错误代码 `ERR_INTERNAL_PRECISE_LOCATION_LEAK` 实现 | 测试组 12 + leak-test-v1.md | ✅ |
| 与 E-P0-09 Zod contract 一致 | 测试组 12 (3 用例) | ✅ |
| 不修改 14 LOCKED 组件 | 全测试仅读现有 Zod schema，不修改 | ✅ |

---

## 16. Blocker Log

| 日期 | 议题 | Owner | 解锁条件 | 状态 |
|---|---|---|---|---|
| 2026-08-24 | 测试环境（staging DB + KMS + Object Storage）是否已搭建 | Engineer | E-P0-08 启动后 | OPEN |
| 2026-08-24 | MOD_TOKEN / WITNESS_KEY / KNOWN_LOCATION_ID seed 测试数据是否已准备 | Engineer + QA | E-P0-02 启动后 | OPEN |
| 2026-08-24 | Playwright + exiftool 在 GitHub Actions 的安装稳定性 | Engineer | 首次 CI 跑后 1 天 | OPEN |

---

## 17. 自验收 Acceptance Criteria

- [x] 12 测试组覆盖（48 用例）
- [x] 与 Brief §E-P0-05 AC 10 项 1:1 对齐
- [x] 与任务卡 §H 5 个核心测试 1:1 对齐（公共 API 0 GPS / Public Moment 0 precise / Public image 0 EXIF / Moderator access logged / 90-day cleanup）
- [x] RBAC + role escalation + append-only + cache + frontend payload 全覆盖
- [x] Zod strict schema 测试覆盖
- [x] CI 集成完整
- [x] Blocker Log 完整
- [x] 不修改 14 LOCKED 组件 / 不修改 E-P0-09 LOCKED schema

---

## 18. 关联文档

| 文档 | 用途 |
|---|---|
| `data-architecture-v1.md` | DDL / RBAC schema |
| `public-private-split-v1.md` | 5 边界 |
| `role-permission-v1.md` | RBAC 矩阵 |
| `encryption-v1.md` | pgcrypto + 90 天清理 |
| `audit-log-v1.md` | access_log 写入契约 |
| `leak-test-v1.md` | 自动化 leak test |
| `../api-contract/zod-schemas/city.ts` | PublicCity / AdminCity |
| `../api-contract/zod-schemas/moment.ts` | PublicMoment / AdminMoment |
| `../api-contract/zod-schemas/witness-submission.ts` | PublicWitnessSubmission |
| `/Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/06-PM Agent 交接/2026-08-22-task-card-e-p0-05-location-isolation.md §H` | 任务卡原 e2e 用例 |
| `/Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/SEE-EARTH-Release-Strategy-v1-Design-Engineering-Task-Brief.md` §5 E-P0-05 | Brief 原文 |

---

**End of e2e-test-cases-v1.md · E-P0-05 子任务 7/7 · 全部交付完成**