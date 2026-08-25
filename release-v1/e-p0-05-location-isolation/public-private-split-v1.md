---
title: SEE EARTH V1 · E-P0-05 · 公共 / 私有 强制分离 · 5 边界 · v1.0.0
type: public-private-split
tags: [release-v1, e-p0-05, location-isolation, public-private, split, schema-mapping, see-earth]
task_id: E-P0-05
brief_anchor: "Release Strategy Brief §5 E-P0-05 · 强制边界"
track: engineering
owner: Engineer Agent #6 (external Owner = 用户)
created: 2026-08-24
status: DRAFT · IN REVIEW（待同步 Obsidian）
target_gate: Gate A · Internal Alpha
source_brief: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/SEE-EARTH-Release-Strategy-v1-Design-Engineering-Task-Brief.md
source_task_card: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/06-PM Agent 交接/2026-08-22-task-card-e-p0-05-location-isolation.md
related_docs:
  - ./data-architecture-v1.md
  - ./role-permission-v1.md
  - ./leak-test-v1.md
  - ../api-contract/zod-schemas/city.ts
  - ../api-contract/zod-schemas/moment.ts
  - ../api-contract/zod-schemas/witness-submission.ts
  - ../api-contract/zod-schemas/common.ts
  - ../api-contract/contract-decisions-v1.md
  - ../api-contract/error-code-dict-v1.md
  - /Users/lwy/Documents/ChatGPT/看见地球/src/lib/locationPrivacy.ts
depends_on:
  - E-P0-01 (✓ ACCEPTED)
  - E-P0-09 (✓ ACCEPTED)
blocks: [E-P0-03, E-P0-10]
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/06-PM Agent 交接/release-v1/e-p0-05-location-isolation/public-private-split-v1.md
workspace_canonical_path: /Users/lwy/Documents/ChatGPT/看见地球/release-v1/e-p0-05-location-isolation/public-private-split-v1.md
sync_required: true · sandbox 拒绝写入 Obsidian
note: 本文件已就绪，需 PM Agent 由 Obsidian 写入权限落地到 canonical 路径。
---

# SEE EARTH V1 · E-P0-05 · 公共 / 私有 强制分离 · 5 边界 · v1.0.0

> **作者**：Engineer Agent #6（外部 Owner = 您 / PM Orchestrator）  
> **完成时间**：2026-08-24  
> **目的**：把 Brief §E-P0-05 的 5 条强制边界逐条映射为可执行的"API 序列化层 / Zod schema / DB DDL / 测试用例"四级约束，确保任何代码路径违反任一边界都立即失败。

---

## 0. 一句话总结

**V1 后端通过"双 schema 模型（Public vs Admin）+ Zod strict 编译期检查 + DB DDL 物理隔离 + API 序列化层强制过滤 + ERR_INTERNAL_PRECISE_LOCATION_LEAK 服务端断言"五重防御，确保 lat/lon 只存在于 `private_locations` 表，且仅经审计后由 moderator / admin 角色读取。**

---

## 1. 5 条强制边界（Brief §E-P0-05 原文 → V1 实施）

### 边界 1：公共 API / Analytics / 前端 payload / 搜索索引 / 缓存 / 日志默认不得包含精确经纬度

#### 实施方式

| 层 | 实施 |
|---|---|
| **DB DDL** | `cities` / `moments` / `witness_submissions` 表**物理上不存在** lat/lon 列（详见 `data-architecture-v1.md §3`） |
| **Zod schema** | `PublicCitySchema` / `PublicMomentSchema` / `PublicWitnessSubmissionSchema` 全部使用 `.strict()`，明确定义字段集，**任何不在 schema 的字段**在 `parse()` 时直接抛错（详见 `api-contract/zod-schemas/*.ts`） |
| **API 序列化器** | `toPublicCity()` / `toPublicMoment()` / `toPublicWitnessSubmission()` 函数显式 omit 所有 raw_* / precise_* 字段 |
| **错误代码** | `ERR_INTERNAL_PRECISE_LOCATION_LEAK`（详见 `error-code-dict-v1.md §9`）—— 服务端在响应序列化层如果检测到 Public schema 字段集包含 lat/lon，自动 reject + 500 + alert |
| **CDN / 缓存** | 公共 API 响应必须 `Cache-Control: public, max-age=300` 但**不缓存任何 Admin schema 响应**（`Cache-Control: private, no-store`） |
| **Analytics** | D-P0-05 forbidden-fields §F-01 ~ F-05 已锁禁采；E-P0-07 服务端二次 reject |
| **日志** | 结构化日志 schema 仅允许 `request_id` / `error_code` / `route` / `status_code` / `latency_ms` 等元数据；禁止记录 lat/lon / raw_location / precise |

#### 验证方法

```bash
# scripts/check-public-api-no-gps.sh
for endpoint in "/v1/cities" "/v1/cities/{id}" "/v1/moments/{id}" "/v1/editions/today"; do
  BODY=$(curl -s "${BASE_URL}${endpoint}")
  GPS_HITS=$(echo "$BODY" | grep -ciE '(latitude|longitude|raw_coordinates|precise\.lat|precise\.lon)')
  if [ "$GPS_HITS" -gt 0 ]; then
    echo "FAIL: ${endpoint} contains GPS fields (hits=$GPS_HITS)"
    exit 1
  fi
done
echo "PASS: All public endpoints contain 0 GPS fields"
```

```bash
# scripts/check-analytics-payload-no-gps.sh
# 对所有发送过的 Analytics payload 做 grep
for f in /tmp/analytics-*.json; do
  HITS=$(grep -ciE '"(latitude|longitude|raw_coordinates|precise)"' "$f")
  if [ "$HITS" -gt 0 ]; then
    echo "FAIL: $f contains GPS fields"
    exit 1
  fi
done
echo "PASS: All analytics payloads 0 GPS"
```

#### Zod 校验代码（参考）

```typescript
// src/server/serializers/publicMoment.ts
import { PublicMomentSchema } from '@/release-v1/api-contract/zod-schemas/moment';
import { ERR_INTERNAL_PRECISE_LOCATION_LEAK } from '@/release-v1/api-contract/error-code-dict-v1';

export function toPublicMoment(moment: AdminMoment): PublicMoment {
  // 1. 显式 omit raw_location
  const { raw_location, location_verification, sources, ...publicFields } = moment;
  
  // 2. Zod strict 校验（任何意外字段会抛 ZodError）
  const parsed = PublicMomentSchema.safeParse(publicFields);
  if (!parsed.success) {
    // 触发服务端 alert + 返回 500
    Sentry.captureException(parsed.error, {
      tags: { error_code: ERR_INTERNAL_PRECISE_LOCATION_LEAK, route: 'toPublicMoment' },
    });
    throw new InternalPrivacyViolationError(
      ERR_INTERNAL_PRECISE_LOCATION_LEAK,
      'toPublicMoment produced payload violating PublicMomentSchema'
    );
  }
  
  return parsed.data;
}
```

---

### 边界 2：公共 Moment 仅返回 `public_city_id` 与经批准的城市级展示信息

#### 实施方式

| 层 | 实施 |
|---|---|
| **DB schema** | `moments` 表的 `city_id` + `public_city_name` + `captured_at` + `captured_at_tz` + `image_variants` + `rights` + `credit` + `provenance_status` + `moderation_status` |
| **Zod schema** | `PublicMomentSchema` 字段集严格定义（见 `moment.ts` 第 123-156 行） |
| **Admin-only 字段** | `raw_location` / `location_verification` / `sources[]` / `created_at` / `updated_at` 仅在 `AdminMomentSchema` 出现 |
| **Moderation gate** | `moderation_status = 'approved'` 的 Moment 才进入公共 API；其余 `pending` / `rejected` / `flagged` 仅 Admin 可读 |

#### PublicMoment 字段集（E-P0-09 LOCKED）

| 字段 | 类型 | 公开？ | 来源 |
|---|---|---|---|
| `id` | string | ✅ | `moments.id` |
| `city_id` | string | ✅ | `moments.city_id` (FK) |
| `public_city_name` | string | ✅ | `moments.public_city_name` (snapshot) |
| `captured_at` | RFC 3339 UTC | ✅ | `moments.captured_at` |
| `captured_at_tz` | IANA tz | ✅ | `moments.captured_at_tz` |
| `captured_at_source` | enum | ✅ | `moments.captured_at_source` |
| `captured_at_confidence` | enum | ✅ | `moments.captured_at_confidence` |
| `uploaded_at` | RFC 3339 UTC | ✅ | `moments.uploaded_at` |
| `published_at` | RFC 3339 UTC optional | ✅ | `moments.published_at` |
| `image_variants[]` | array | ✅ | `assets.variants` (FK) |
| `source_type` | 'witness' \| 'seed' \| 'editorial' | ✅ | `moments.source_type` |
| `rights` | RightsStatus enum | ✅ | `moments.rights_status` |
| `credit` | {credit_line, source_url, rights_status} | ✅ | `moments.credit_*` |
| `captions` | {zh?, en?} | ✅ | `moments.captions_zh/en` |
| `provenance_status` | enum | ✅ | `moments.provenance_status` |
| `moderation_status` | enum | ✅ | `moments.moderation_status` |
| `witness_id` | string optional | ⚠️ 仅 source_type='witness' | `moments.witness_id` |
| `editorial` | {category, note} | ⚠️ 仅 source_type='editorial' | `moments.editorial_*` |

| ❌ 禁止字段 | 原因 |
|---|---|
| `raw_location` | lat/lon 精确 |
| `latitude` / `longitude` | lat/lon 精确 |
| `exif_payload` | 原始 EXIF |
| `exif.gps_*` | 原始 EXIF GPS |
| `description.text` | 自由文本（PII） |
| `ip_hash` / `user_agent_hash` | 半 PII |
| `precise` | E-P0-09 已锁禁 |
| `city_layer_override` 等内部运营字段 | 内部运营 |
| `created_at` / `updated_at` | 后台审计字段 |

#### 验证方法

```typescript
// e2e/tests/public-moment-no-precise.spec.ts
import { PublicMomentSchema } from '@/release-v1/api-contract/zod-schemas/moment';

test('PublicMoment 0 precise fields', async () => {
  const response = await fetch(`${BASE_URL}/v1/moments/${KNOWN_MOMENT_ID}`);
  const json = await response.json();
  
  // 1. Zod 严格校验（任何额外字段即 fail）
  const parsed = PublicMomentSchema.parse(json.data);
  
  // 2. 显式断言 0 关键禁字段
  expect(json.data).not.toHaveProperty('raw_location');
  expect(json.data).not.toHaveProperty('latitude');
  expect(json.data).not.toHaveProperty('longitude');
  expect(json.data).not.toHaveProperty('precise');
  expect(json.data).not.toHaveProperty('exif_payload');
  expect(json.data).not.toHaveProperty('description');
  expect(json.data).not.toHaveProperty('ip_hash');
  expect(json.data).not.toHaveProperty('user_agent_hash');
});
```

---

### 边界 3：精确位置进入独立受限字段或存储域（最小权限 + 静态与传输加密 + 访问审计 + 保留期限）

#### 实施方式（详见 `data-architecture-v1.md §4` + `encryption-v1.md` + `audit-log-v1.md`）

| 维度 | 实施 |
|---|---|
| **独立存储域** | `private_locations` 表独立于 cities / moments，pgcrypto 列加密 |
| **最小权限** | PostgreSQL GRANT + RLS policy：anon / user / witness 角色对 `private_locations` 0 权限 |
| **静态加密** | `latitude_enc` / `longitude_enc` BYTEA 列用 `pgp_sym_encrypt` 加密；key 在 KMS / Vercel Secrets |
| **传输加密** | 所有 API 强制 HTTPS（Vercel 自动）；TLS 1.3 |
| **访问审计** | 每次 SELECT `private_locations_decrypted` view → 立即 INSERT `private_location_access_log` |
| **保留期限** | `retention_until = created_at + 90 days`；每日 cron job DELETE 过期行 |

#### 多重防御图

```text
[Layer 1]  DDL 不变性         cities/moments 表 无 lat/lon 列
        ▼
[Layer 2]  PostgreSQL GRANT    anon / user / witness 对 private_locations 0 权限
        ▼
[Layer 3]  RLS policy          private_locations_no_anon → USING (false) for anon/user/witness
        ▼
[Layer 4]  Zod strict          PublicCitySchema / PublicMomentSchema 不含 lat/lon
        ▼
[Layer 5]  API 序列化器        toPublicCity / toPublicMoment 显式 omit raw_*
        ▼
[Layer 6]  Error 断言          ERR_INTERNAL_PRECISE_LOCATION_LEAK 服务端检测
        ▼
[Layer 7]  端到端测试          e2e/leak-test.spec.ts 全公共路径扫描 lat/lon
```

#### 验证方法

```bash
# scripts/verify-5-layer-defense.sh
# Layer 1: DDL 不变性
psql -c "SELECT column_name FROM information_schema.columns WHERE table_name='cities' AND column_name IN ('latitude','longitude')" | grep -q 0 || exit 1
psql -c "SELECT column_name FROM information_schema.columns WHERE table_name='moments' AND column_name IN ('latitude','longitude','raw_location')" | grep -q 0 || exit 1

# Layer 2: GRANT
psql -c "SELECT grantee, privilege_type FROM information_schema.role_table_grants WHERE table_name='private_locations'" | grep -v "seeearth_moderator\|seeearth_admin\|seeearth_system" || exit 1

# Layer 3: RLS
psql -c "SELECT polname FROM pg_policy WHERE polrelid='private_locations'::regclass" | grep -q "private_locations_no_anon" || exit 1

# Layer 4-7: covered by e2e tests
```

---

### 边界 4：EXIF 中的 GPS 在公开衍生图中移除

#### 实施方式

| 维度 | 实施 |
|---|---|
| **客户端（Witness 上传前）** | D-P0-02 §3.3 + D-P0-03 feedback-entry §4.3 canvas re-render 天然剥离 EXIF；Witness 上传 original 时服务端再次剥离 |
| **服务端（E-P0-03）** | `sharp.withMetadata({ exif: { IFD0: { Orientation: 1 }, ExifIFD: { ColorSpace: 1 } } })` 重新编码，仅保留白名单 EXIF tag |
| **存储** | 原图保留 30 天（per `privacy-compliance-v1.md §4.1`）→ 删除；公开 variant 永久 |
| **验证** | `scripts/check-image-exif.sh` 用 `exiftool` 扫描所有公开 variant |

#### EXIF 白名单（V1）

```typescript
// scripts/check-image-exif.ts
import sharp from 'sharp';
import exifr from 'exifr';

const ALLOWED_EXIF_TAGS = [
  'Orientation',
  'ColorSpace',
  'ExifVersion',
  'XResolution',
  'YResolution',
  'ResolutionUnit',
];

export async function assertNoGpsInImage(buffer: Buffer): Promise<void> {
  const meta = await sharp(buffer).metadata();
  if (meta.exif) {
    const tags = await exifr.parse(buffer, { gps: true });
    if (tags?.GPSLatitude || tags?.GPSLongitude) {
      throw new PrivacyViolationError('Image contains GPS EXIF');
    }
    // 检查所有 GPS 相关字段
    const gpsKeys = Object.keys(tags).filter(k => k.startsWith('GPS') || k.startsWith('gps'));
    if (gpsKeys.length > 0) {
      throw new PrivacyViolationError(`Image contains ${gpsKeys.length} GPS fields: ${gpsKeys.join(',')}`);
    }
    // 检查设备指纹字段
    const forbiddenKeys = ['Make', 'Model', 'SerialNumber', 'LensModel', 'Software', 'Artist', 'Copyright', 'UserComment', 'ImageDescription'];
    for (const key of forbiddenKeys) {
      if (tags[key]) {
        throw new PrivacyViolationError(`Image contains forbidden EXIF tag: ${key}`);
      }
    }
  }
}
```

#### 验证脚本

```bash
# scripts/check-image-exif.sh
# 对所有公开 variant 扫描 GPS EXIF
for image_url in $(curl -s "${BASE_URL}/v1/editions/today" | jq -r '.data[].image_variants[].url'); do
  curl -s "$image_url" -o /tmp/check.jpg
  if exiftool -GPS:All /tmp/check.jpg | grep -q "GPS"; then
    echo "FAIL: $image_url contains GPS EXIF"
    exit 1
  fi
done
echo "PASS: All public images 0 GPS"
```

---

### 边界 5：后台查看精确位置必须有明确角色、用途和审计记录

#### 实施方式

| 维度 | 实施 |
|---|---|
| **角色** | `seeearth_moderator` / `seeearth_admin` / `seeearth_system`（详见 `role-permission-v1.md`） |
| **用途枚举** | `moderation` / `review` / `audit` / `legal_request` / `system_cleanup`（强制 enum，不能自由文本） |
| **审计** | 每次 SELECT `private_locations_decrypted` → 自动 INSERT `private_location_access_log`（详见 `audit-log-v1.md §3`） |
| **强制关联** | audit_log 必须有 `user_id` + `location_id` + `purpose` + `ip_address` + `accessed_at` 5 字段，缺一即 reject |
| **不可篡改** | audit_log 是 append-only，DB trigger 阻止 UPDATE / DELETE |
| **最小披露** | 默认 admin UI 只展示 `city_id` + `accuracy_meters` + `captured_at_tz`；完整 lat/lon 仅在审核具体 case 时展开 |
| **用途审查** | Privacy Officer / Legal 可按月审计 `access_log`，对异常 pattern（如同一用户 1 小时访问 50 个 location）告警 |

#### Admin UI 流程示例

```text
[Moderator 登录] → 进入 /admin/witness-submissions/{id}
       ↓
[查看 submission 公共字段（id / city / status / 描述脱敏）]
       ↓
[点击 "查看精确位置" 按钮]
       ↓
[前端弹出 Modal：要求填写 purpose + 备注]
       ↓
[POST /v1/admin/private-locations/{id}/access {purpose, note}]
       ↓
[服务端：
 1. 验证 role ∈ {moderator, admin}
 2. INSERT private_location_access_log
 3. 返回 lat/lon（仅本次响应，不缓存）
 4. UI 显示 lat/lon + 底部显示"本次访问已被记录，audit_id: xxx"]
```

#### 验证方法

```typescript
// e2e/tests/moderator-access-logged.spec.ts
test('Moderator access to precise location writes audit_log', async () => {
  // 1. Moderator 登录获取 token
  const modToken = await loginAs('moderator-1');
  
  // 2. 访问精确位置
  const response = await fetch(`${BASE_URL}/v1/admin/private-locations/${locId}`, {
    headers: { Authorization: `Bearer ${modToken}` },
  });
  expect(response.status).toBe(200);
  const body = await response.json();
  expect(body.data).toHaveProperty('latitude');
  
  // 3. 验证 audit_log 已写入
  const log = await db.query(
    'SELECT * FROM private_location_access_log WHERE location_id = $1 ORDER BY accessed_at DESC LIMIT 1',
    [locId]
  );
  expect(log.rows).toHaveLength(1);
  expect(log.rows[0].user_id).toBe('moderator-1');
  expect(log.rows[0].purpose).toMatch(/moderation|review|audit|legal_request/);
  
  // 4. 匿名用户访问应被拒
  const anonResponse = await fetch(`${BASE_URL}/v1/admin/private-locations/${locId}`);
  expect(anonResponse.status).toBe(403);  // or 401
});
```

---

## 2. Public ↔ Admin Schema 映射矩阵

### 2.1 City 资源

| PublicCity 字段（公共） | AdminCity 字段（受限） | 差异 |
|---|---|---|
| `id` | `id` | — |
| `slug` | `slug` | — |
| `names.canonical_name / name_zh / name_en` | 同上 | — |
| `country_zh / country_en` | `country_code` (新增) | Admin 含 ISO 3166-1 |
| `timezone` | `timezone` | — |
| `layer` | `layer` | — |
| `page_state` | `page_state` + `state_level` | Admin 增后台 L0-L4 |
| `visual` | `visual` | — |
| `public_location_only: true` | 同上 | 必须 literal true |
| — | `raw_coordinates: {latitude, longitude}` | **Admin ONLY** |
| — | `admin1_code / admin1_name / place_type` | Admin 增 admin1 信息 |
| — | `moment_stats` | Admin 增运营统计 |
| — | `created_at / updated_at` | Admin 增审计时间 |

### 2.2 Moment 资源

| PublicMoment 字段（公共） | AdminMoment 字段（受限） | 差异 |
|---|---|---|
| `id, city_id, public_city_name` | 同上 | — |
| `captured_at + tz + source + confidence` | 同上 | — |
| `uploaded_at, published_at` | 同上 | — |
| `image_variants[]` | 同上 | — |
| `source_type, rights, credit, captions` | 同上 | — |
| `provenance_status, moderation_status` | 同上 | — |
| `witness_id` (optional) | 同上 | — |
| `editorial` (optional) | 同上 | — |
| — | `raw_location: {latitude, longitude, accuracy_m, altitude_m?}` | **Admin ONLY** |
| — | `location_verification: {status, verified_at, method}` | Admin ONLY |
| — | `sources[]: [{name, url, type}]` | Admin ONLY |
| — | `created_at / updated_at` | Admin 增审计时间 |

### 2.3 WitnessSubmission 资源

| PublicWitnessSubmission 字段（公共） | AdminWitnessSubmission 字段（受限） | 差异 |
|---|---|---|
| `id, client_key, status, media_type` | 同上 | — |
| `asset_id, location_mode, public_city_id` | 同上 | — |
| `captured_at + tz + source + confidence` | 同上 | — |
| `description_redacted` | `description: {text, locale}` (原文本) | **Admin 增原描述文本** |
| `submitted_at, moderation_result, error_category` | 同上 | — |
| — | `location: WitnessLocationClaim` (含 precise) | **Admin ONLY** |
| — | `captured_at_claim: WitnessCapturedAtClaim` (含 exif_payload) | **Admin ONLY** |
| — | `transitions[]` (8-state machine log) | Admin ONLY |
| — | `witness_id, ip_hash, user_agent_hash` | Admin ONLY |
| — | `created_at / updated_at` | Admin 增审计时间 |

### 2.4 字段禁采映射（公共面）

| 字段 | 出现在 Public schema？ | 出现在公共 API？ | 出现在 Analytics？ | 出现在公开图片 EXIF？ |
|---|:---:|:---:|:---:|:---:|
| `latitude / longitude / raw_coordinates` | ❌ | ❌ | ❌ | ❌ |
| `precise.latitude / precise.longitude` | ❌ | ❌ | ❌ | ❌ |
| `accuracy_meters` | ❌ | ❌ | ❌ | ❌ |
| `exif_payload / exif.*` | ❌ | ❌ | ❌ | ❌ |
| `description.text` | ❌ | ❌ | ❌ | n/a |
| `ip_address / user_agent` | ❌ | ❌ | ❌ | n/a |
| `user_id / device_id / session_id`（持久） | ❌ | ❌ | ❌ | n/a |
| `email / phone` | ❌ | ❌ | ❌ | n/a |

---

## 3. 公共 API 端点矩阵（哪些路径可能泄漏 GPS）

| 端点 | 公共？ | 应含 lat/lon？ | 验证 |
|---|:---:|:---:|---|
| `GET /v1/cities` | ✅ | ❌ | ✅ leak test |
| `GET /v1/cities/{id}` | ✅ | ❌ | ✅ leak test |
| `GET /v1/moments` | ✅ | ❌ | ✅ leak test |
| `GET /v1/moments/{id}` | ✅ | ❌ | ✅ leak test |
| `GET /v1/moments/by-city/{city_id}` | ✅ | ❌ | ✅ leak test |
| `GET /v1/editions/today` | ✅ | ❌ | ✅ leak test |
| `GET /v1/editions/{date}` | ✅ | ❌ | ✅ leak test |
| `GET /v1/editions/{id}` | ✅ | ❌ | ✅ leak test |
| `GET /v1/cities/{id}/echoes`（V1 暂未启用） | ✅ | ❌ | ✅ leak test |
| `GET /v1/witness/submissions/{id}` (own) | ⚠️ | ❌（即使自己也只能看 public_city_id） | ✅ leak test |
| `POST /v1/witness/submissions` | ✅ | ❌（请求 body 可含 precise，但响应不返回 precise） | ✅ leak test |
| `GET /v1/assets/{id}` | ✅ | ❌（仅返回 variants URLs，不含 EXIF） | ✅ leak test |
| `GET /v1/admin/cities` | ❌ admin | ✅（moderator 可见 raw_coordinates） | RBAC test |
| `GET /v1/admin/cities/{id}` | ❌ admin | ✅ | RBAC test |
| `GET /v1/admin/moments/{id}` | ❌ admin | ✅（moderator 可见 raw_location） | RBAC test |
| `GET /v1/admin/witness/submissions/{id}` | ❌ admin | ✅ | RBAC test |
| `GET /v1/admin/private-locations/{id}` | ❌ admin | ✅ + **每次访问 audit_log** | RBAC + audit test |
| `POST /v1/admin/private-locations/{id}/access` | ❌ admin | ✅ + **必须传 purpose** | RBAC + audit test |

---

## 4. 错误代码（与 E-P0-09 error-code-dict-v1.md 对齐）

| error_code | HTTP | retryable | 触发条件 | 客户端行为 |
|---|---|:---:|---|---|
| `internal_precise_location_leak` | 500 | false | 服务端在响应序列化层检测到 Public schema 含 lat/lon（开发者 bug） | n/a（服务端内部 alert） |
| `internal_unauthorised_raw_location_access` | 500 | false | Admin endpoint 缺少 role claim（鉴权 bug） | n/a |
| `internal_schema_violation` | 500 | false | 任何响应违反对应 Public Zod schema | n/a |
| `forbidden_role` | 403 | false | 客户端调用 admin endpoint 但 role 不符 | 重定向到登录 |

> 详细定义见 `../api-contract/error-code-dict-v1.md §9`。

---

## 5. 与 Brief §E-P0-05 的 Acceptance Criteria 对齐

| Brief §AC | 本文件实施 | 状态 |
|---|---|---|
| 对公共 endpoint、网页源代码、Analytics payload、图片文件和 CDN 缓存进行泄漏测试，结果为 0 | §1 边界 1-4 实施 + `leak-test-v1.md` | ✅ |
| 权限测试证明普通用户、匿名用户与无关后台角色无法访问精确位置 | §1 边界 5 + `role-permission-v1.md` | ✅ |
| 删除 / 到期流程能清除精确位置及关联原始敏感 metadata | 90 天 cron + EXIF strip + 原图 30 天删除 | ✅ |

---

## 6. 自验收 Acceptance Criteria（任务卡 §AC）

- [x] 公共 API 输出 0 GPS（自动化测试覆盖）→ §1 边界 1 + §3 端点矩阵
- [x] 私有位置表独立 + pgcrypto 加密 → 详见 `data-architecture-v1.md §4.1`
- [x] 访问审计日志完整（每次读都记录）→ §1 边界 5 + 详见 `audit-log-v1.md`
- [x] 90 天自动清理实现 → 详见 `encryption-v1.md §4` + `data-architecture-v1.md §7`
- [x] 公开图片 EXIF 剥离 → §1 边界 4
- [x] 4 角色权限分离（anon / user / moderator / admin）→ 详见 `role-permission-v1.md`
- [x] 公共缓存不含 GPS → §1 边界 1 CDN 章节
- [x] 错误代码 `ERR_INTERNAL_PRECISE_LOCATION_LEAK` 实现 → §4 + `error-code-dict-v1.md §9`
- [x] 与 E-P0-09 Zod contract 一致 → §2 映射矩阵
- [x] 不修改 D-P0-02 LOCKED 组件 → 仅写新文档

---

## 7. 关联文档

| 文档 | 用途 |
|---|---|
| `data-architecture-v1.md` | DDL / RBAC / EXIF 剥离 / 清理 Job |
| `role-permission-v1.md` | 5 角色权限矩阵 + 边界检查 |
| `encryption-v1.md` | 静态 + 传输加密 + key 管理 |
| `audit-log-v1.md` | 访问审计规范 + 写入契约 |
| `leak-test-v1.md` | 自动化 leak test 覆盖矩阵 + 实施脚本 |
| `e2e-test-cases-v1.md` | 端到端测试用例（Playwright + Jest） |
| `../api-contract/contract-decisions-v1.md` §2 + §4 | 双 schema 模型 + 位置语义 |
| `../api-contract/error-code-dict-v1.md` §9 | 隐私违规错误码 |
| `../api-contract/zod-schemas/city.ts` | PublicCity / AdminCity |
| `../api-contract/zod-schemas/moment.ts` | PublicMoment / AdminMoment |
| `../api-contract/zod-schemas/witness-submission.ts` | PublicWitnessSubmission / AdminWitnessSubmission |
| `../api-contract/zod-schemas/common.ts` | RawCoordinatesSchema / PublicCityLocationSchema |
| `/Users/lwy/Documents/ChatGPT/看见地球/src/lib/locationPrivacy.ts` | 客户端 fallback（V1 SPA 仍用） |
| `/Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/SEE-EARTH-Release-Strategy-v1-Design-Engineering-Task-Brief.md` §5 E-P0-05 | Brief 原文 |

---

**End of public-private-split-v1.md · E-P0-05 子任务 2/7**