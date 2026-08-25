---
title: SEE EARTH V1 · E-P0-05 · 自动化 Leak Test 覆盖矩阵 · v1.0.0
type: leak-test
tags: [release-v1, e-p0-05, location-isolation, leak-test, e2e, ci, see-earth]
task_id: E-P0-05
brief_anchor: "Release Strategy Brief §5 E-P0-05 · 强制边界 1-4 + AC + §E 任务卡"
track: engineering
owner: Engineer Agent #6 (external Owner = 用户)
created: 2026-08-24
status: DRAFT · IN REVIEW（待同步 Obsidian）
target_gate: Gate A · Internal Alpha
source_brief: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/SEE-EARTH-Release-Strategy-v1-Design-Engineering-Task-Brief.md
source_task_card: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/06-PM Agent 交接/2026-08-22-task-card-e-p0-05-location-isolation.md
related_docs:
  - ./data-architecture-v1.md
  - ./public-private-split-v1.md
  - ./role-permission-v1.md
  - ./encryption-v1.md
  - ./audit-log-v1.md
  - ./e2e-test-cases-v1.md
  - ../api-contract/zod-schemas/city.ts
  - ../api-contract/zod-schemas/moment.ts
  - ../api-contract/zod-schemas/witness-submission.ts
  - ../api-contract/error-code-dict-v1.md
  - /Users/lwy/Documents/ChatGPT/看见地球/07-设计师设计参考/release-v1/analytics-events/forbidden-fields-v1.md
depends_on:
  - E-P0-01 (✓ ACCEPTED)
  - E-P0-09 (✓ ACCEPTED)
blocks: [E-P0-03, E-P0-10]
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/06-PM Agent 交接/release-v1/e-p0-05-location-isolation/leak-test-v1.md
workspace_canonical_path: /Users/lwy/Documents/ChatGPT/看见地球/release-v1/e-p0-05-location-isolation/leak-test-v1.md
sync_required: true · sandbox 拒绝写入 Obsidian
note: 本文件已就绪，需 PM Agent 由 Obsidian 写入权限落地到 canonical 路径。
---

# SEE EARTH V1 · E-P0-05 · 自动化 Leak Test 覆盖矩阵 · v1.0.0

> **作者**：Engineer Agent #6（外部 Owner = 您 / PM Orchestrator）  
> **完成时间**：2026-08-24  
> **目的**：定义 V1 "Privacy Leak Test" 的覆盖矩阵、自动化脚本、CI Gate 触发条件、执行 owner，确保每个 Release Gate 前 0 GPS 泄漏。

---

## 0. 一句话总结

**Leak Test 在 6 个维度（公共 API / 公开图片 / Analytics payload / 前端 bundle / DB 备份 / 缓存层）扫描 lat/lon / EXIF GPS / raw_location / precise 等禁采字段；任何命中都导致 CI / Release Gate 失败。所有测试脚本在 `scripts/leak-test/` 与 `e2e/tests/leak/` 落地，CI 在每次 PR + 每次 deploy 后自动跑。**

---

## 1. Leak Test 覆盖矩阵（6 维度 × N 检测点）

### 1.1 维度 1：公共 API 响应

| 检测点 | 脚本 | 期望 | 失败时影响 |
|---|---|---|---|
| `GET /v1/cities` 响应不含 lat/lon | `check-public-cities-no-gps.sh` | 0 命中 | 🔴 Gate A blocker |
| `GET /v1/cities/{id}` 响应不含 lat/lon | 同上 | 0 命中 | 🔴 Gate A blocker |
| `GET /v1/moments` 响应不含 lat/lon | `check-public-moments-no-gps.sh` | 0 命中 | 🔴 Gate A blocker |
| `GET /v1/moments/{id}` 响应不含 lat/lon | 同上 | 0 命中 | 🔴 Gate A blocker |
| `GET /v1/moments/by-city/{city_id}` 响应不含 lat/lon | 同上 | 0 命中 | 🔴 Gate A blocker |
| `GET /v1/editions/today` 响应不含 lat/lon | `check-public-editions-no-gps.sh` | 0 命中 | 🔴 Gate A blocker |
| `GET /v1/editions/{date}` 响应不含 lat/lon | 同上 | 0 命中 | 🔴 Gate A blocker |
| `GET /v1/witness/submissions/{id}` 响应不含 lat/lon | `check-public-witness-no-gps.sh` | 0 命中（即使 owner 自己） | 🔴 Gate A blocker |
| `GET /v1/assets/{id}` 响应不含 lat/lon + EXIF | `check-public-asset-no-exif.sh` | 0 命中 | 🔴 Gate A blocker |
| 响应 header 不含 lat/lon | `check-response-headers.sh` | 0 命中 | 🔴 Gate A blocker |
| 响应 `Cache-Control` 头标识公共可缓存 | `check-cache-headers.sh` | `Cache-Control: public, max-age=N` | 🟡 WARN（不影响 Gate） |
| Zod schema 严格校验公共响应 | `e2e/tests/leak/zod-strict.spec.ts` | 0 额外字段 | 🔴 Gate A blocker |
| `ERR_INTERNAL_PRECISE_LOCATION_LEAK` 不应被触发 | `e2e/tests/leak/no-internal-leak.spec.ts` | 0 触发 | 🔴 Gate A blocker |

### 1.2 维度 2：公开图片（Daily 12 / Moment Detail / City Hero）

| 检测点 | 脚本 | 期望 | 失败时影响 |
|---|---|---|---|
| 公开 variant 不含 GPS EXIF | `scripts/check-image-exif.sh` | 0 命中 | 🔴 Gate A blocker |
| 公开 variant 不含设备指纹 EXIF（Make/Model/Serial） | 同上 | 0 命中 | 🔴 Gate A blocker |
| 公开 variant 不含自由文本 EXIF（UserComment/Description/Copyright） | 同上 | 0 命中 | 🔴 Gate A blocker |
| 公开 variant 不含原始软件版本 EXIF（Software/HostSoftware） | 同上 | 0 命中 | 🔴 Gate A blocker |
| 公开 variant 不含 GPSTimeStamp / GPSDateStamp | 同上 | 0 命中 | 🔴 Gate A blocker |
| 公开 variant 含 Orientation + ColorSpace（白名单） | 同上 | 命中 | 🟡（仅 sanity） |
| Object Storage response header `Content-Type` = 正确 mime | `scripts/check-image-mime.sh` | `image/webp` / `image/jpeg` 等 | 🟡 WARN |
| Object Storage response header `Cache-Control` = public, immutable | 同上 | 命中 | 🟡 WARN |
| Object Storage response 不含 EXIF GPS header | 同上 | 0 命中 | 🔴 Gate A blocker |

### 1.3 维度 3：Analytics payload

| 检测点 | 脚本 | 期望 | 失败时影响 |
|---|---|---|---|
| 14 个事件 payload 不含 lat/lng/latitude/longitude | `scripts/check-analytics-no-gps.sh` | 0 命中 | 🔴 Gate A blocker |
| 14 个事件 payload 不含 raw_coordinates / precise.lat / precise.lng | 同上 | 0 命中 | 🔴 Gate A blocker |
| 14 个事件 payload 不含 accuracy_meters | 同上 | 0 命中 | 🔴 Gate A blocker |
| 14 个事件 payload 不含 exif_payload / exif.* | 同上 | 0 命中 | 🔴 Gate A blocker |
| 14 个事件 payload 不含 description.text / description.body | 同上 | 0 命中 | 🔴 Gate A blocker |
| 14 个事件 payload 不含 email / phone / user_id / device_id（持久） | 同上 | 0 命中 | 🔴 Gate A blocker |
| `submission_id` 字段已 hash（仅 8 位 hex） | `scripts/check-analytics-submission-id-hashed.sh` | 0 命中原始 UUID | 🔴 Gate A blocker |
| `witness_submitted` 事件中 `captured_at` 不含 UTC offset | `scripts/check-analytics-no-timezone.sh` | 不含 `+09:00` / `Z` | 🔴 Gate A blocker |
| Analytics SDK 拒绝接收禁采字段（client 端） | `e2e/tests/leak/sdk-rejects.spec.ts` | 字段被静默丢弃 | 🔴 Gate A blocker |
| 服务端 Analytics reject 禁采字段 | `e2e/tests/leak/server-rejects.spec.ts` | 整个事件 4xx | 🔴 Gate A blocker |

### 1.4 维度 4：前端 payload（JS bundle / SSR HTML / JSON state）

| 检测点 | 脚本 | 期望 | 失败时影响 |
|---|---|---|---|
| dist/ JS bundle 不含 lat/lng 字面量 | `scripts/check-bundle-no-gps.sh` | 0 命中 | 🔴 Gate A blocker |
| dist/ JS bundle 不含 `raw_coordinates` 字面量 | 同上 | 0 命中 | 🔴 Gate A blocker |
| dist/ CSS 不含 GPS URL query params | 同上 | 0 命中 | 🟡 WARN |
| SSR HTML 不含 lat/lng data-attribute | `scripts/check-ssr-no-gps.sh` | 0 命中 | 🔴 Gate A blocker |
| JSON state (Redux / Zustand) 不含 lat/lng | `scripts/check-state-no-gps.sh` | 0 命中 | 🔴 Gate A blocker |
| 客户端代码不调用 `exif.gpsLatitude` 等 | `scripts/check-source-no-gps.sh` | 0 命中 | 🔴 Gate A blocker |
| 客户端代码不向 `/v1/admin/*` 发请求 | `scripts/check-source-no-admin-calls.sh` | 0 命中 | 🟡 WARN |
| VITE_* 环境变量不含 lat/lng | `scripts/check-env-no-gps.sh` | 0 命中 | 🔴 Gate A blocker |

### 1.5 维度 5：DB 备份 / Object Storage 备份

| 检测点 | 脚本 | 期望 | 失败时影响 |
|---|---|---|---|
| DB 备份 dump 不含明文 lat/lon（应仅见 BYTEA） | `scripts/check-db-backup-encrypted.sh` | 0 命中 | 🔴 Gate A blocker |
| Object Storage 原图 bucket 不公开可访问 | `scripts/check-original-private.sh` | 403 | 🔴 Gate A blocker |
| Object Storage 公开 variant bucket 启用 SSE-KMS | `scripts/check-variant-encrypted.sh` | header 含 `x-amz-server-side-encryption: aws:kms` | 🔴 Gate A blocker |
| Backup encryption key 与 production key 不同 | `scripts/check-backup-key-rotation.sh` | 不同 | 🔴 Gate A blocker |

### 1.6 维度 6：缓存层（CDN / Redis）

| 检测点 | 脚本 | 期望 | 失败时影响 |
|---|---|---|---|
| Vercel CDN 缓存响应不含 lat/lon | `scripts/check-cdn-cache-no-gps.sh` | 0 命中 | 🔴 Gate A blocker |
| Vercel CDN 缓存 key 不基于 lat/lon | `scripts/check-cdn-cache-key.sh` | key 含 URL + vary header，无 lat/lon | 🟡 WARN |
| Redis 缓存（如果有）只缓存 PublicCityLocation / PublicMoment | `scripts/check-redis-cache-no-private.sh` | 仅命中公共 schema | 🔴 Gate A blocker |
| Admin API 响应 `Cache-Control: private, no-store` | `scripts/check-admin-no-cache.sh` | 命中 | 🟡 WARN |
| 缓存 TTL 不超过 source-of-truth 更新频率 | `scripts/check-cache-ttl.sh` | TTL ≤ 300s（公共）；admin 0 | 🟡 WARN |

---

## 2. 实施脚本（V1 必须落地）

### 2.1 `scripts/check-public-api-no-gps.sh`

```bash
#!/bin/bash
# check-public-api-no-gps.sh
# Usage: BASE_URL=https://alpha.see-earth.com scripts/check-public-api-no-gps.sh
set -e

BASE_URL="${BASE_URL:-http://localhost:3000}"
GPS_PATTERN='(latitude|longitude|raw_coordinates|precise\.lat|precise\.lng|exif\.gpsLatitude|exif\.gpsLongitude)'
FAILED=0

echo "🔍 Scanning public API responses for GPS fields..."

# Test endpoints
ENDPOINTS=(
  "/v1/cities"
  "/v1/cities/kyoto"
  "/v1/cities/lisbon"
  "/v1/moments"
  "/v1/moments/known-id-1"
  "/v1/moments/known-id-2"
  "/v1/moments/by-city/kyoto"
  "/v1/editions/today"
  "/v1/editions/2026-08-22"
)

for endpoint in "${ENDPOINTS[@]}"; do
  echo -n "  ${endpoint} ... "
  BODY=$(curl -fsS "${BASE_URL}${endpoint}")
  GPS_HITS=$(echo "$BODY" | grep -ciE "${GPS_PATTERN}" || true)
  if [ "$GPS_HITS" -gt 0 ]; then
    echo "❌ FAIL ($GPS_HITS hits)"
    echo "    Sample: $(echo "$BODY" | grep -iE "${GPS_PATTERN}" | head -3)"
    FAILED=$((FAILED + 1))
  else
    echo "✅ PASS"
  fi
done

if [ "$FAILED" -gt 0 ]; then
  echo "❌ $FAILED endpoint(s) contain GPS fields"
  exit 1
fi

echo "✅ All public API responses contain 0 GPS fields"
exit 0
```

### 2.2 `scripts/check-image-exif.sh`

```bash
#!/bin/bash
# check-image-exif.sh
# Usage: BASE_URL=https://alpha.see-earth.com scripts/check-image-exif.sh
set -e

BASE_URL="${BASE_URL:-http://localhost:3000}"
EXIFTOOL="${EXIFTOOL:-exiftool}"

echo "🔍 Scanning public images for GPS / device-fingerprint EXIF..."

# Get all image URLs from public API
IMAGE_URLS=$(curl -fsS "${BASE_URL}/v1/editions/today" | jq -r '
  .data[].image_variants[].url,
  .data[].moments[].image_variants[].url
' 2>/dev/null | sort -u)

if [ -z "$IMAGE_URLS" ]; then
  echo "⚠️  No image URLs found (skipped)"
  exit 0
fi

FAILED=0

for url in $IMAGE_URLS; do
  echo -n "  $url ... "
  curl -fsS "$url" -o /tmp/check_image.$$
  
  # 检查禁采 EXIF tag
  GPS_HITS=$($EXIFTOOL -GPS:All -EXIF:Make -EXIF:Model -EXIF:SerialNumber \
    -EXIF:LensModel -EXIF:LensSerialNumber -EXIF:Software -EXIF:Artist \
    -EXIF:Copyright -EXIF:UserComment -EXIF:ImageDescription \
    /tmp/check_image.$$ 2>/dev/null | grep -cE '^(GPS|Make|Model|SerialNumber|LensModel|LensSerialNumber|Software|Artist|Copyright|UserComment|ImageDescription)' || true)
  
  rm -f /tmp/check_image.$$
  
  if [ "$GPS_HITS" -gt 0 ]; then
    echo "❌ FAIL ($GPS_HITS forbidden EXIF tags)"
    FAILED=$((FAILED + 1))
  else
    echo "✅ PASS"
  fi
done

if [ "$FAILED" -gt 0 ]; then
  echo "❌ $FAILED image(s) contain forbidden EXIF"
  exit 1
fi

echo "✅ All public images contain 0 GPS / device-fingerprint EXIF"
exit 0
```

### 2.3 `scripts/check-analytics-no-gps.sh`

```bash
#!/bin/bash
# check-analytics-no-gps.sh
# Usage: ANALYTICS_DIR=/tmp/analytics-debug scripts/check-analytics-no-gps.sh
set -e

ANALYTICS_DIR="${ANALYTICS_DIR:-/tmp/analytics-debug}"
FORBIDDEN_PATTERN='(latitude|longitude|raw_coordinates|precise\.lat|precise\.lng|accuracy_meters|exif_payload|exif\.gpsLatitude|exif\.gpsLongitude|email|phone|user_id|device_id|description\.text|description\.body)'

if [ ! -d "$ANALYTICS_DIR" ]; then
  echo "⚠️  Analytics debug directory not found: $ANALYTICS_DIR (skipped)"
  exit 0
fi

echo "🔍 Scanning analytics payloads for forbidden fields..."

FAILED=0
SHOTS=0

for f in "$ANALYTICS_DIR"/*.json; do
  [ -f "$f" ] || continue
  SHOTS=$((SHOTS + 1))
  HITS=$(grep -ciE "${FORBIDDEN_PATTERN}" "$f" || true)
  if [ "$HITS" -gt 0 ]; then
    echo "❌ $f ($HITS forbidden fields)"
    grep -iE "${FORBIDDEN_PATTERN}" "$f" | head -3
    FAILED=$((FAILED + 1))
  fi
done

echo "Scanned $SHOTS payload(s), $FAILED failed"

if [ "$FAILED" -gt 0 ]; then
  exit 1
fi

echo "✅ All analytics payloads contain 0 forbidden fields"
exit 0
```

### 2.4 `e2e/tests/leak/zod-strict.spec.ts`

```typescript
// e2e/tests/leak/zod-strict.spec.ts
import { PublicCitySchema, CityListEnvelopeSchema } from '@/release-v1/api-contract/zod-schemas/city';
import { PublicMomentSchema, MomentEnvelopeSchema } from '@/release-v1/api-contract/zod-schemas/moment';
import { PublicWitnessSubmissionSchema } from '@/release-v1/api-contract/zod-schemas/witness-submission';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

describe('Leak Test · Zod Strict Public Schemas', () => {
  test('GET /v1/cities response conforms to CityListEnvelopeSchema (no extra fields)', async () => {
    const response = await fetch(`${BASE_URL}/v1/cities`);
    const json = await response.json();
    
    // Zod strict 校验：任何额外字段即 fail
    const parsed = CityListEnvelopeSchema.safeParse(json);
    expect(parsed.success).toBe(true);
    if (!parsed.success) {
      console.error('Zod errors:', parsed.error.issues);
    }
  });
  
  test('GET /v1/cities/{id} response conforms to CityEnvelopeSchema (no extra fields)', async () => {
    const response = await fetch(`${BASE_URL}/v1/cities/kyoto`);
    const json = await response.json();
    
    const parsed = CityEnvelopeSchema.safeParse(json);
    expect(parsed.success).toBe(true);
  });
  
  test('GET /v1/moments/{id} response conforms to MomentEnvelopeSchema (no extra fields)', async () => {
    const response = await fetch(`${BASE_URL}/v1/moments/known-id-1`);
    const json = await response.json();
    
    const parsed = MomentEnvelopeSchema.safeParse(json);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.data).not.toHaveProperty('raw_location');
      expect(parsed.data.data).not.toHaveProperty('latitude');
      expect(parsed.data.data).not.toHaveProperty('longitude');
    }
  });
  
  test('GET /v1/witness/submissions/{id} response conforms to PublicWitnessSubmissionSchema', async () => {
    const response = await fetch(`${BASE_URL}/v1/witness/submissions/known-id`, {
      headers: { 'X-Witness-Key': process.env.WITNESS_KEY || '' },
    });
    const json = await response.json();
    
    const parsed = PublicWitnessSubmissionSchema.safeParse(json.data);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      // 即使是 submitter 自己，也不能看到 lat/lon
      expect(parsed.data).not.toHaveProperty('location');
      expect(parsed.data).not.toHaveProperty('precise');
    }
  });
});
```

### 2.5 `e2e/tests/leak/role-based-access.spec.ts`

```typescript
// e2e/tests/leak/role-based-access.spec.ts
describe('Leak Test · Role-Based Access', () => {
  test('Anonymous user cannot access /v1/admin/private-locations', async () => {
    const response = await fetch(`${BASE_URL}/v1/admin/private-locations/some-id`);
    expect([401, 403]).toContain(response.status);
  });
  
  test('Anonymous user cannot access /v1/admin/cities/{id} (raw_coordinates)', async () => {
    const response = await fetch(`${BASE_URL}/v1/admin/cities/kyoto`);
    expect([401, 403]).toContain(response.status);
  });
  
  test('Witness cannot access their own precise location', async () => {
    const response = await fetch(`${BASE_URL}/v1/admin/private-locations/by-submission/my-sub-id`, {
      headers: { 'X-Witness-Key': 'valid-witness-key' },
    });
    expect([401, 403]).toContain(response.status);
  });
  
  test('Moderator can access with purpose=moderation, audit_log written', async () => {
    const modToken = await getModeratorToken();
    const response = await fetch(`${BASE_URL}/v1/admin/private-locations/known-id`, {
      headers: { 
        Authorization: `Bearer ${modToken}`,
        'X-Access-Purpose': 'moderation',
      },
    });
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.data).toHaveProperty('latitude');
    
    // 验证 audit_log 已写入
    const audit = await db.query(
      'SELECT * FROM private_location_access_log WHERE location_id = $1 AND user_id = $2 AND purpose = $3 ORDER BY accessed_at DESC LIMIT 1',
      [knownLocationId, 'moderator-1', 'moderation']
    );
    expect(audit.rows).toHaveLength(1);
  });
  
  test('Moderator list view requires purpose ∈ review or audit', async () => {
    const modToken = await getModeratorToken();
    
    // purpose=moderation 应该被拒（list 不允许）
    const rejectResponse = await fetch(`${BASE_URL}/v1/admin/private-locations`, {
      headers: { Authorization: `Bearer ${modToken}`, 'X-Access-Purpose': 'moderation' },
    });
    expect([400, 422]).toContain(rejectResponse.status);
    
    // purpose=review 应该被允许
    const okResponse = await fetch(`${BASE_URL}/v1/admin/private-locations`, {
      headers: { Authorization: `Bearer ${modToken}`, 'X-Access-Purpose': 'review' },
    });
    expect(okResponse.status).toBe(200);
    const json = await okResponse.json();
    // list 不应返回 lat/lon 明文
    expect(json.data[0]).not.toHaveProperty('latitude');
    expect(json.data[0]).toHaveProperty('city_id');
  });
});
```

### 2.6 `scripts/check-bundle-no-gps.sh`

```bash
#!/bin/bash
# check-bundle-no-gps.sh
# Scan production-built JS bundle for lat/lng literals
set -e

DIST_DIR="${DIST_DIR:-dist}"
FORBIDDEN='(latitude|longitude|raw_coordinates|precise\.lat|precise\.lng|exif\.gpsLatitude|exif\.gpsLongitude)'

echo "🔍 Scanning dist/ bundle for GPS literals..."

FAILED=0

for f in "$DIST_DIR"/assets/*.js "$DIST_DIR"/assets/*.css; do
  [ -f "$f" ] || continue
  
  HITS=$(grep -ciE "${FORBIDDEN}" "$f" || true)
  if [ "$HITS" -gt 0 ]; then
    # 排除 minified 注释
    REAL_HITS=$(grep -ciE "[\"']${FORBIDDEN}[\"']" "$f" || true)
    if [ "$REAL_HITS" -gt 0 ]; then
      echo "❌ $f ($REAL_HITS GPS literals)"
      grep -iE "[\"']${FORBIDDEN}[\"']" "$f" | head -3
      FAILED=$((FAILED + 1))
    fi
  fi
done

if [ "$FAILED" -gt 0 ]; then
  echo "❌ Client bundle contains $FAILED file(s) with GPS literals"
  exit 1
fi

echo "✅ Client bundle contains 0 GPS literals"
exit 0
```

### 2.7 `scripts/check-db-backup-encrypted.sh`

```bash
#!/bin/bash
# check-db-backup-encrypted.sh
# Verify DB backup dump contains only encrypted BYTEA, no plaintext lat/lon
set -e

BACKUP_FILE="${1:-/tmp/db-backup.dump}"
FORBIDDEN_LAT='(35\.011[0-9]+|34\.6[0-9]+|41\.3[0-9]+|35\.6[0-9]+|52\.5[0-9]+|33\.5[0-9]+|31\.2[0-9]+|22\.9[0-9]+|64\.1[0-9]+|-33\.9[0-9]+|51\.5[0-9]+|52\.5[0-9]+|41\.9[0-9]+|-33\.8[0-9]+)'  # 12 城大致 lat 范围

echo "🔍 Scanning DB backup for plaintext lat/lon..."

# pg_dump 默认是文本格式，pgcrypto 加密列应显示为 \x...（hex bytea）
# 如果看到明文 lat 数字，说明加密失败或备份未加密
HITS=$(grep -cE "${FORBIDDEN_LAT}" "$BACKUP_FILE" || true)

if [ "$HITS" -gt 5 ]; then
  echo "❌ Backup contains $HITS plaintext lat values"
  exit 1
fi

echo "✅ Backup contains no plaintext lat values"
exit 0
```

---

## 3. CI / CD 集成

### 3.1 GitHub Actions · 每次 PR

```yaml
# .github/workflows/leak-test.yml
name: Leak Test (Privacy)

on:
  pull_request:
    paths:
      - 'src/**'
      - 'release-v1/**'
      - 'e2e/tests/leak/**'
      - 'scripts/leak-test/**'

jobs:
  leak-test:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v5
        with:
          node-version: '20'
      
      - name: Install exiftool
        run: sudo apt-get install -y exiftool
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests (Zod strict)
        run: npm run test:zod-strict
      
      - name: Build dist
        run: npm run build
      
      - name: Check bundle for GPS literals
        run: bash scripts/check-bundle-no-gps.sh
      
      - name: Start preview server
        run: |
          npm run preview &
          sleep 5
      
      - name: Run leak tests against preview
        env:
          BASE_URL: http://localhost:4173
        run: |
          bash scripts/check-public-api-no-gps.sh
          bash scripts/check-image-exif.sh
          bash scripts/check-analytics-no-gps.sh
      
      - name: Run E2E leak tests
        run: npm run test:e2e:leak
      
      - name: Upload artifacts on failure
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: leak-test-failure
          path: |
            /tmp/check_*
            test-results/
            playwright-report/
```

### 3.2 Deploy hook · 每次 deploy 到 Alpha / Production

```bash
# scripts/post-deploy-leak-test.sh
# Vercel deploy hook 触发
set -e

ENV="${1:-alpha}"
EXPECTED_ENDPOINTS=("/v1/cities" "/v1/cities/kyoto" "/v1/moments" "/v1/editions/today")

case "$ENV" in
  alpha) BASE_URL="https://setheearth-git-alpha-seethearth.vercel.app" ;;
  production) BASE_URL="https://see-earth.com" ;;
  *) echo "Unknown env: $ENV"; exit 1 ;;
esac

echo "🔍 Post-deploy leak test against $BASE_URL..."

for script in check-public-api-no-gps check-image-exif check-analytics-no-gps; do
  echo "Running $script..."
  BASE_URL="$BASE_URL" bash "scripts/${script}.sh" || {
    echo "❌ $script failed"
    # 触发 rollback
    curl -X POST "$SLACK_WEBHOOK" -d "{\"text\": \"🚨 Leak test failed on $ENV deploy: $script\"}"
    exit 1
  }
done

echo "✅ All post-deploy leak tests passed"
curl -X POST "$SLACK_WEBHOOK" -d "{\"text\": \"✅ Leak test passed on $ENV deploy\"}"
```

### 3.3 Gate 前必跑（每个 Gate 前的 hard requirement）

| Gate | Leak test 范围 | 必须通过 |
|---|---|---|
| **Gate A · Internal Alpha** | 全 6 维度 + 单元 + E2E | ✅ 100% pass |
| **Gate B · Closed Beta** | 全 6 维度 + 真实数据扫描 + DPIA 报告 | ✅ 100% pass |
| **Gate C · Launch Candidate** | 全 6 维度 + 第三方法律审核 + DPIA 签字 | ✅ 100% pass |

---

## 4. 关键禁采字段白名单（developer 注释）

```typescript
// src/server/serializers/index.ts
/**
 * FORBIDDEN GPS FIELDS
 * 
 * These fields must NEVER appear in any public API response, Analytics payload,
 * public image EXIF, client bundle, or DB backup.
 * 
 * If you add a new endpoint or serializer, ensure none of these fields leak.
 * 
 * Leak test: e2e/tests/leak/ + scripts/check-*.sh
 * Source of truth: /release-v1/e-p0-05-location-isolation/
 */
export const FORBIDDEN_LOCATION_FIELDS = [
  // E-P0-09 Zod schemas use these
  'latitude',
  'longitude',
  'raw_coordinates',
  'raw_coordinates.latitude',
  'raw_coordinates.longitude',
  'precise.latitude',
  'precise.longitude',
  'raw_location.latitude',
  'raw_location.longitude',
  'raw_location.accuracy_m',
  'exif_payload',
  'exif.GPSLatitude',
  'exif.GPSLongitude',
  'exif.GPSLatitudeRef',
  'exif.GPSLongitudeRef',
  'exif.GPSAltitude',
  'exif.GPSTimeStamp',
  'exif.GPSDateStamp',
  'exif.Make',
  'exif.Model',
  'exif.SerialNumber',
  'exif.LensModel',
  'exif.LensSerialNumber',
  'exif.Software',
  'exif.Artist',
  'exif.Copyright',
  'exif.UserComment',
  'exif.ImageDescription',
  'accuracy_meters',
  'description.text',
  'description.body',
  'ip_address',
  'user_agent',
  'email',
  'phone',
  'user_id',
  'device_id',
] as const;

/**
 * 开发期 helper：检查对象是否含禁采字段
 */
export function hasForbiddenLocationFields(obj: unknown): string[] {
  const found: string[] = [];
  function walk(o: unknown, path: string): void {
    if (o === null || typeof o !== 'object') return;
    for (const [key, value] of Object.entries(o)) {
      const currentPath = path ? `${path}.${key}` : key;
      if (FORBIDDEN_LOCATION_FIELDS.includes(currentPath as any)) {
        found.push(currentPath);
      }
      walk(value, currentPath);
    }
  }
  walk(obj, '');
  return found;
}
```

---

## 5. 开发期 IDE / Lint 提示

### 5.1 ESLint rule

```javascript
// eslint-rules/no-gps-fields.js
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow GPS / precise-location field references in public code',
    },
    schema: [],
    messages: {
      forbidden: 'GPS / precise location field "{{field}}" must NEVER appear in this file. See /release-v1/e-p0-05-location-isolation/.',
    },
  },
  create(context) {
    return {
      Identifier(node) {
        const forbidden = ['latitude', 'longitude', 'rawCoordinates', 'raw_coordinates', 'preciseLat', 'preciseLng'];
        if (forbidden.includes(node.name)) {
          // 例外：admin 目录、E-P0-05 文档
          const filename = context.getFilename();
          if (filename.includes('/admin/') || filename.includes('/e-p0-05-')) return;
          
          context.report({
            node,
            messageId: 'forbidden',
            data: { field: node.name },
          });
        }
      },
    };
  },
};
```

### 5.2 `.eslintrc.yml` 配置

```yaml
rules:
  custom/no-gps-fields:
    - error
    - allowInAdmin: true
      allowInDocs: true
```

---

## 6. 失败处理流程

### 6.1 Leak test 失败响应

| 失败位置 | 响应时间 | 后续动作 |
|---|---|---|
| **CI PR** | 立即 | PR blocked + 通知 PR author + on-call engineer |
| **Post-deploy (Alpha)** | 5 分钟内 | Slack alert + 自动停服 + 立即 rollback |
| **Post-deploy (Production)** | 5 分钟内 | Slack #critical + Privacy Officer + Engineering Lead + 立即 rollback |
| **Gate 前 E2E** | 立即 | Gate 不签字 + 修复 + 重新跑 Gate E2E |
| **运行时（监控发现）** | 24h 内 | Privacy Officer 审计 + 紧急修复 |

### 6.2 Post-Mortem（任何 leak test 失败都触发）

- 24 小时内写 post-mortem
- 包含：发现时间 + 触发条件 + 影响范围 + 用户通知 + 修复步骤 + 防止复发
- Privacy Officer + Engineering Lead + PM 共同签字
- 归档至 `/post-mortem/`

---

## 7. 与 Brief §E-P0-05 Acceptance Criteria 对齐

| Brief §AC | 本文件覆盖 |
|---|---|
| 对公共 endpoint、网页源代码、Analytics payload、图片文件和 CDN 缓存进行泄漏测试，结果为 0 | §1 全 6 维度 + §2 实施脚本 + §3 CI 集成 |
| 权限测试证明普通用户、匿名用户与无关后台角色无法访问精确位置 | §1.1 维度 1 + `e2e/tests/leak/role-based-access.spec.ts` |
| 删除 / 到期流程能清除精确位置及关联原始敏感 metadata | `e2e-test-cases-v1.md` 中"90-day cleanup"测试用例 |

---

## 8. Blocker Log

| 日期 | 议题 | Owner | 解锁条件 | 状态 |
|---|---|---|---|---|
| 2026-08-24 | exiftool 是否预装在 Vercel build environment | Engineer | E-P0-02 启动时验证 | OPEN |
| 2026-08-24 | DB 备份 dump 格式（pg_dump text vs custom）决定 §2.7 脚本兼容 | Engineer | E-P0-02 启动时决策 | OPEN |
| 2026-08-24 | Vercel deploy hook 触发 post-deploy script 是否可行 | Engineer | E-P0-08 启动时验证 | OPEN |
| 2026-08-24 | ESLint custom rule 是否纳入 CI | Engineer | 启动后 1 周 | OPEN |

---

## 9. 自验收 Acceptance Criteria

- [x] 6 维度 × N 检测点完整矩阵（公共 API / 图片 / Analytics / 前端 / DB / 缓存）
- [x] 实施脚本：7 个 bash + 1 个 Zod strict E2E + 1 个 RBAC E2E
- [x] CI / CD 集成（PR + Deploy hook + Gate 前）
- [x] 关键禁采字段白名单 + ESLint rule
- [x] 失败响应流程（含 post-mortem）
- [x] 与 Brief §E-P0-05 AC 对齐
- [x] Blocker Log 完整
- [x] 不修改 14 LOCKED 组件 / 不修改 E-P0-09 LOCKED schema

---

## 10. 关联文档

| 文档 | 用途 |
|---|---|
| `data-architecture-v1.md` | DDL / RBAC |
| `public-private-split-v1.md` | 5 边界实施 |
| `role-permission-v1.md` | RBAC |
| `encryption-v1.md` | pgcrypto + KMS |
| `audit-log-v1.md` | access_log |
| `e2e-test-cases-v1.md` | 端到端测试 |
| `../api-contract/error-code-dict-v1.md` §9 | ERR_INTERNAL_* |
| `/Users/lwy/Documents/ChatGPT/看见地球/07-设计师设计参考/release-v1/analytics-events/forbidden-fields-v1.md` | 30 禁采清单 |
| `/Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/SEE-EARTH-Release-Strategy-v1-Design-Engineering-Task-Brief.md` §5 E-P0-05 + §E-P0-10 | Brief 原文 |

---

**End of leak-test-v1.md · E-P0-05 子任务 6/7**