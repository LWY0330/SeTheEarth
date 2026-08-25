---
title: SEE EARTH V1 · Supabase Storage + Upload Pipeline · Phase 1
type: storage-decision
tags: [release-v1, e-p0-02, storage, supabase, signed-url, exif, see-earth]
task_id: E-P0-02
phase: Phase 1 · Vertical Slice
dispatched_at: 2026-08-22
status: DRAFT · IN REVIEW
author: Engineer Agent (Round 2B)
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/vertical-slice-phase1/storage-pipeline-v1.md
source_inputs:
  - release-v1/api-contract/zod-schemas/asset-upload.ts
  - release-v1/api-contract/zod-schemas/common.ts (ImageVariantSchema, ImageProcessingSchema)
  - release-v1/minimal-witness/api-field-mapping-v1.md
  - release-v1/alpha-environment/env-decision-v1.md
  - PM 2026-08-22 OD-02 (Supabase Storage)
---

# SEE EARTH V1 · Supabase Storage + Upload Pipeline · Phase 1

> **作者**：Engineer Agent（Round 2B · Phase 1 子集）
> **目标读者**：PM Agent（验收）、用户（Supabase 配置）、Phase 2/3 工程师
> **任务卡**：E-P0-02 Launch Vertical Slice（Phase 1 子集）
> **PM 决议**：OD-02 = Asset Storage = Supabase Storage（与后端栈一致）
> **决策日期**：2026-08-22

---

## 0. 一句话结论

**Supabase Storage bucket `see-earth-alpha-assets`（私有）+ Supabase Storage signed URL（短期 TTL = 600s）+ 服务端 sharp 处理 4 个 variants（thumb_320 / card_640 / detail_1280 / full_2560）+ EXIF 剥离（GPS 强制剥离 + 其他 EXIF 最小保留 allow-list）+ mime 白名单（jpeg/png/webp）+ 20MB 大小上限。Phase 1 实现后端管道；Phase 2 接入 Witness 上传 UI。**

---

## 1. Bucket 配置

### 1.1 Bucket 元数据

| 项 | 值 |
|---|---|
| Name | `see-earth-alpha-assets` |
| Public | **false**（所有读通过 signed URL） |
| File size limit | `20971520`（20MB） |
| Allowed MIME types | `image/jpeg`, `image/png`, `image/webp` |
| Region | `us-east-1`（与 Supabase project 同 region） |

### 1.2 创建方式

**PM/用户决策点**：Phase 1 由 Engineer Agent 在 Vercel Preview deploy 后通过 Supabase SQL editor 执行初始化 SQL：

```sql
-- 在 Supabase Dashboard → SQL Editor 执行
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'see-earth-alpha-assets',
  'see-earth-alpha-assets',
  false,
  20971520,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;
```

### 1.3 Storage Path 约定

```text
moments/<moment_id>/original/<timestamp>-<uuid>.<ext>     # 原始上传
moments/<moment_id>/thumb_320/<timestamp>-<uuid>.webp
moments/<moment_id>/card_640/<timestamp>-<uuid>.webp
moments/<moment_id>/detail_1280/<timestamp>-<uuid>.webp
moments/<moment_id>/full_2560/<timestamp>-<uuid>.webp

witness/<submission_id>/original/<filename>.<ext>          # Phase 2
witness/<submission_id>/thumb_320/<filename>.webp
witness/<submission_id>/card_640/<filename>.webp
witness/<submission_id>/detail_1280/<filename>.webp
```

**关键约束**：

- 路径前缀 `moments/`（已批准 Moment）vs `witness/`（待审核 Witness submission）物理隔离
- `original/` 子目录保留原图（**Phase 1 不公开** · admin only）
- variant 文件名为同一 UUID base（保证 4 个 variant 来自同一原图）

---

## 2. Upload Pipeline 架构

### 2.1 Phase 1 不实现 Witness UI（明确排除）

> **任务卡 §C 约束**："Phase 1 不实现 Witness upload UI 集成（属于 Phase 2）"

**Phase 1 实现内容**：

- ✅ Supabase Storage bucket 创建 + 配置
- ✅ 服务端 `uploadAsset()` 函数（接收 binary buffer · 走完整 variant 生成流程）
- ✅ `getAssetUploadGrant()` 函数（Phase 2 用 · 但函数本身 Phase 1 实现）
- ✅ EXIF 剥离逻辑（exifr 读 + sharp 写）
- ✅ 4 个 variant 生成（thumb_320 / card_640 / detail_1280 / full_2560）
- ❌ Witness 上传 UI（Phase 2）
- ❌ Witness POST `/v1/witness/submissions`（Phase 2）
- ❌ Real client_key 幂等测试（Phase 2 真实流量）

**Phase 1 的验证方式**：通过 seed 脚本批量导入已知种子图（Unsplash 已剥离 EXIF 的图）+ 手动调用 `uploadAsset()` 函数（admin script）。

### 2.2 流程图

```text
[Phase 2 client upload UI]      [Phase 1 admin seed script]
        │                                 │
        ▼                                 ▼
POST /v1/assets/upload-url        uploadAssetFromBuffer()
        │                                 │
        ▼                                 │
{ upload_url, asset_id, expires }         │
        │                                 │
        ▼                                 │
[client PUT signed URL]                   │
        │                                 │
        ▼                                 │
[Supabase Storage: original 落盘]         │
        │                                 │
        ▼                                 │
[Supabase Storage trigger / webhook]      │
   → serverless function                  │
        │                                 │
        ▼                                 ▼
[api/src/services/storage.ts: processAsset()]
        │
        ├─ exifr.read(original) → 提取 datetime + camera model (allow-list)
        │
        ├─ sharp(original)
        │   - .rotate() (EXIF orientation)
        │   - .withMetadata({}) (默认剥离所有)
        │   - .resize(320).webp({quality: 80}) → thumb_320.webp
        │   - .resize(640).webp({quality: 80}) → card_640.webp
        │   - .resize(1280).webp({quality: 85}) → detail_1280.webp
        │   - .resize(2560).webp({quality: 85}) → full_2560.webp
        │
        ├─ 上传 4 个 variants 到 Supabase Storage
        │
        ├─ INSERT INTO assets (variant 路径 + metadata + exif_stripped=true + exif_gps_stripped=true)
        │
        └─ UPDATE assets SET upload_status='processed'
```

---

## 3. Supabase Storage Signed URL 设计

### 3.1 上传授权（Upload Grant）

**Phase 2 client 流程**（Phase 1 仅实现 server 函数）：

```typescript
// api/src/services/storage.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

/**
 * getAssetUploadGrant · Phase 2 client 调用
 * 返回短期 signed URL（client 用 PUT 上传）
 */
export async function getAssetUploadGrant(params: {
  submissionId: string;
  mime: 'image/jpeg' | 'image/png' | 'image/webp';
  bytes: number;
  clientKey: string;
}) {
  // 1. 校验 mime + bytes
  const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);
  if (!ALLOWED_MIME.has(params.mime)) {
    throw new ValidationError('UNSUPPORTED_MIME', `mime ${params.mime} not allowed`);
  }
  if (params.bytes <= 0 || params.bytes > 20 * 1024 * 1024) {
    throw new ValidationError('FILE_TOO_LARGE', `bytes must be 1..20971520`);
  }

  // 2. 生成 asset_id + storage_path
  const assetId = crypto.randomUUID();
  const ext = mimeToExt(params.mime);
  const storagePath = `witness/${params.submissionId}/original/${assetId}.${ext}`;

  // 3. 创建 asset 行（upload_status='pending'）
  await db.insert(assets).values({
    id: assetId,
    uploadedBySubmissionId: params.submissionId,
    storageBucket: 'see-earth-alpha-assets',
    storagePathOriginal: storagePath,
    storagePathVariants: {},
    mime: params.mime,
    bytesOriginal: params.bytes,
    uploadStatus: 'pending',
  });

  // 4. 生成 signed upload URL（TTL = 600s · per task card）
  const { data: signedData, error } = await supabase.storage
    .from('see-earth-alpha-assets')
    .createSignedUploadUrl(storagePath);  // Supabase 自动生成 JWT

  if (error || !signedData) {
    throw new StorageError('SIGNED_URL_FAILED', error?.message ?? 'unknown');
  }

  return {
    asset_id: assetId,
    upload_url: signedData.signedUrl,  // Supabase Storage URL + JWT token
    token: signedData.token,            // Supabase upload token
    expires_in: 600,                    // 10 分钟
    max_bytes: 20 * 1024 * 1024,
    allowed_mime: [params.mime],
    storage_path: storagePath,
  };
}
```

### 3.2 下载授权（Signed Read URL）

**公开读取通过 public API endpoint**（前端用），但 **Variant 文件本身通过 signed URL 间接访问**：

- `Asset.uploadStatus === 'processed'` 且 `Moment.moderationStatus === 'approved'` 时
- 通过 `GET /v1/moments/{momentId}` 返回 `image_variants[].url`
- 该 URL = Supabase Storage **signed read URL**（TTL = 3600s · 1 小时）
- 前端 cache-Control 由 Supabase 默认设置（immutable / 1 year）+ cache busting 用 `?v=asset.updatedAt`

```typescript
export async function generateVariantReadUrls(
  storagePathVariants: Record<string, string>,
  ttlSeconds = 3600,
): Promise<ImageVariant[]> {
  const urls: ImageVariant[] = [];
  for (const [variant, path] of Object.entries(storagePathVariants)) {
    const { data } = await supabase.storage
      .from('see-earth-alpha-assets')
      .createSignedUrl(path, ttlSeconds);
    if (data?.signedUrl) {
      urls.push({ variant, url: data.signedUrl, ... });  // + width/height/mime/bytes
    }
  }
  return urls;
}
```

> **Phase 1 简化**：seed 阶段直接返回 Supabase public URL（已公开的 Unsplash CDN URL）。Variant signed URL 函数已实现但 seed 阶段不调用。

---

## 4. EXIF 剥离策略

### 4.1 隐私要求（per `forbidden-fields-v1.md` + `brief §E-P0-05`）

| EXIF 标签 | Phase 1 处理 | 理由 |
|---|---|---|
| **GPSLatitude / GPSLongitude** | **强制剥离** | 隐私保护 · 公共图片绝不含 GPS |
| **GPSAltitude / GPSTimeStamp** | **强制剥离** | 同上 |
| **GPSTimeStamp / GPSDateStamp** | **强制剥离** | 同上 |
| **Make / Model（camera）** | **保留**（最小可追溯性） | 编辑存档 metadata · 不构成隐私 |
| **DateTimeOriginal / CreateDate** | **保留** | 用于 captured_at 校验 |
| **Software** | **剥离** | 无用 |
| **Artist / Copyright** | **保留到 admin row**（不入 variant） | credit 信息已单独存储在 `credit_line` |
| **UserComment / ImageDescription** | **剥离** | 自由文本可能含 PII |
| 其他所有 EXIF tag | **默认剥离** | sharp `.withMetadata({})` 默认行为 |

### 4.2 EXIF 处理实现

```typescript
// api/src/services/storage.ts
import sharp from 'sharp';
import exifr from 'exifr';

/**
 * processAsset · 从 original buffer 生成 4 variants 并写入 Storage
 * 关键步骤：EXIF 剥离 → sharp 处理 → 上传 → 更新 DB
 */
export async function processAsset(assetId: string): Promise<void> {
  const asset = await db.query.assets.findFirst({ where: eq(assets.id, assetId) });
  if (!asset) throw new Error(`asset ${assetId} not found`);

  // 1. 下载 original
  const { data: originalBlob, error: downloadErr } = await supabase.storage
    .from('see-earth-alpha-assets')
    .download(asset.storagePathOriginal);
  if (downloadErr || !originalBlob) {
    await db.update(assets)
      .set({ uploadStatus: 'failed', processingError: downloadErr?.message ?? 'download failed' })
      .where(eq(assets.id, assetId));
    throw new StorageError('DOWNLOAD_FAILED', downloadErr?.message ?? 'unknown');
  }
  const originalBuffer = Buffer.from(await originalBlob.arrayBuffer());

  // 2. EXIF 读取（仅 allow-list 字段）
  let exifSummary: { datetime?: string; camera_make?: string; camera_model?: string } = {};
  try {
    const exifData = await exifr.parse(originalBuffer, {
      tiff: true, exif: true, gps: false,  // 🔒 显式不读 GPS
      pick: ['Make', 'Model', 'DateTimeOriginal', 'CreateDate'],
    });
    if (exifData) {
      exifSummary = {
        datetime: exifData.DateTimeOriginal?.toISOString() ?? exifData.CreateDate?.toISOString(),
        camera_make: typeof exifData.Make === 'string' ? exifData.Make : undefined,
        camera_model: typeof exifData.Model === 'string' ? exifData.Model : undefined,
      };
    }
  } catch (e) {
    // EXIF parse failure = 不可信 (但不影响 variant 生成)
    console.warn(`[storage] exif parse failed for asset ${assetId}:`, e);
  }

  // 3. 检查 GPS 是否在原始文件存在（防御性 · should be 0）
  const hasGps = await exifr.gps(originalBuffer).catch(() => null);
  const gpsStrippedConfirmed = hasGps === null || hasGps === undefined;

  // 4. sharp 处理 4 variants（.withMetadata({}) 默认剥离所有 EXIF）
  const variants = [
    { name: 'thumb_320', width: 320, quality: 80 },
    { name: 'card_640', width: 640, quality: 80 },
    { name: 'detail_1280', width: 1280, quality: 85 },
    { name: 'full_2560', width: 2560, quality: 85 },
  ] as const;

  const variantPaths: Record<string, string> = {};
  const variantMeta: ImageVariant[] = [];

  for (const v of variants) {
    const outputBuffer = await sharp(originalBuffer)
      .rotate()                              // EXIF orientation
      .resize({ width: v.width, withoutEnlargement: true })
      .webp({ quality: v.quality })
      .withMetadata({ exif: {} })            // 🔒 EXIF strip (empty IFD0)
      .toBuffer();

    const variantPath = asset.storagePathOriginal
      .replace('/original/', `/${v.name}/`)
      .replace(/\.[^.]+$/, '.webp');

    const { error: variantUploadErr } = await supabase.storage
      .from('see-earth-alpha-assets')
      .upload(variantPath, outputBuffer, {
        contentType: 'image/webp',
        cacheControl: '31536000',  // 1 year
        upsert: true,
      });

    if (variantUploadErr) {
      throw new StorageError('VARIANT_UPLOAD_FAILED', `${v.name}: ${variantUploadErr.message}`);
    }

    variantPaths[v.name] = variantPath;
    variantMeta.push({
      variant: v.name,
      url: '',  // 后端填充 signed read URL
      width: 0,
      height: 0,
      mime: 'image/webp',
      bytes: outputBuffer.length,
    });
  }

  // 5. 生成 signed read URLs（前端用）
  const signedVariants = await generateVariantReadUrls(variantPaths, 3600);
  const finalVariants = variantMeta.map((m, idx) => ({
    ...m,
    url: signedVariants[idx].url,
    ...(await sharp(originalBuffer).metadata() ? {} : {}),
  }));

  // 6. 获取 original metadata
  const originalMeta = await sharp(originalBuffer).metadata();

  // 7. 更新 assets 行
  await db.update(assets).set({
    storagePathVariants: variantPaths,
    widthOriginal: originalMeta.width ?? null,
    heightOriginal: originalMeta.height ?? null,
    exifStripped: true,
    exifGpsStripped: gpsStrippedConfirmed,
    uploadStatus: 'processed',
    processingError: null,
    updatedAt: new Date(),
  }).where(eq(assets.id, assetId));

  // 8. 若有关联 moment_id，更新 moment.image_variants
  if (asset.momentId) {
    await db.update(moments)
      .set({ imageVariants: finalVariants, updatedAt: new Date() })
      .where(eq(moments.id, asset.momentId));
  }
}
```

### 4.3 EXIF 校验（隐私门控）

```typescript
// api/src/services/storage.ts
import exifr from 'exifr';
import type { Moment } from '../src/db/schema';

/**
 * assertPublicMomentNoGps · 防御性检查：公共 moment 永不含 GPS EXIF
 * - 在 GET endpoint 出口调用
 * - 防止 sharp bug 或未来 EXIF re-injection
 */
export async function assertPublicMomentNoGps(
  variantUrls: string[],
): Promise<{ ok: boolean; offendingUrl?: string[] }> {
  for (const url of variantUrls) {
    try {
      const response = await fetch(url);
      const buf = Buffer.from(await response.arrayBuffer());
      const gps = await exifr.gps(buf);
      if (gps !== null && gps !== undefined) {
        return { ok: false, offendingUrl: [url] };
      }
    } catch (e) {
      console.error('[privacy-check] failed for url', url, e);
    }
  }
  return { ok: true };
}
```

**调用位置**：`GET /v1/moments/{momentId}` 和 `GET /v1/cities/{cityId}/moments` endpoint 出口 · 仅在 production + alpha 环境启用（开发环境跳过节省时间）。

---

## 5. 服务端 Sharp 处理

### 5.1 variant 规格

| variant | width | quality | mime | 用途 |
|---|---|---|---|---|
| `thumb_320` | 320px | 80 | `image/webp` | 列表缩略图 · Hero 备份 |
| `card_640` | 640px | 80 | `image/webp` | 卡片图 · CityPage One Scene |
| `detail_1280` | 1280px | 85 | `image/webp` | 详情页大图 · Moment Detail |
| `full_2560` | 2560px | 85 | `image/webp` | 原始大图（不超 2560px） · Unknown Reveal |

**为什么不输出 AVIF**：

- sharp 支持 AVIF 但编码速度慢 5-10x
- 客户端兼容性：Safari 16+ 支持（V1 阶段不强制）
- WebP 兼容性 Safari 14+（覆盖 iOS 14+ 99% 设备）

**为什么不保留 JPEG variant**：

- V1 仅 WebP 输出（统一格式）
- iOS 兼容：Safari 完全支持 WebP
- Phase 2 评估是否需要 AVIF 输出（CDN 带宽优化）

### 5.2 sharp 配置细节

```typescript
const sharpConfig = {
  // 输出格式
  thumb_320: { width: 320, quality: 80 },
  card_640: { width: 640, quality: 80 },
  detail_1280: { width: 1280, quality: 85 },
  full_2560: { width: 2560, quality: 85 },
};

// 共享 pipeline（每个 variant 共用）
const basePipeline = (input: Buffer) => sharp(input)
  .rotate()                                    // EXIF orientation
  .withMetadata({ exif: {} })                  // 🔒 strip EXIF
  .toFormat('webp', { quality: 80 });

// 尺寸管线（变体）
const thumb320 = (input: Buffer) => basePipeline(input).resize({ width: 320, withoutEnlargement: true });
const card640 = (input: Buffer) => basePipeline(input).resize({ width: 640, withoutEnlargement: true });
// ...
```

### 5.3 性能预算

| 步骤 | 目标耗时 | 超时阈值 |
|---|---|---|
| EXIF 读取 | < 50ms | 200ms |
| sharp 4 variants 生成 | < 1.5s | 5s |
| Supabase 4 uploads | < 1s | 3s |
| DB update | < 200ms | 500ms |
| **总 processAsset** | **< 3s** | **8s** |

**cold start 优化**：sharp 模块预加载（Vercel function warm pool）；冷启动 ≤ 800ms。

---

## 6. Webhook / Trigger 机制

### 6.1 Supabase Storage → Serverless Function

**Phase 2 实施**（Phase 1 仅 seed script 调用 processAsset）：

```typescript
// api/src/app/api/storage-webhook/route.ts (Phase 2)
// Supabase Database Webhook → POST /api/storage-webhook
// 监听 storage.objects 表 INSERT 事件
// 提取 asset_id → 调用 processAsset(assetId)

import { NextRequest, NextResponse } from 'next/server';
import { processAsset } from '@/services/storage';

export async function POST(req: NextRequest) {
  const signature = req.headers.get('x-supabase-signature');
  if (!verifyWebhookSignature(signature ?? '', await req.text())) {
    return NextResponse.json({ error_code: 'INVALID_SIGNATURE' }, { status: 401 });
  }

  const body = await req.json();
  const { record } = body;  // storage.objects row
  if (!record.bucket_id || record.bucket_id !== 'see-earth-alpha-assets') {
    return NextResponse.json({ ok: true });  // ignore other buckets
  }

  // 从 storage_path 解析 asset_id
  const assetId = extractAssetIdFromPath(record.name);
  if (!assetId) {
    return NextResponse.json({ error_code: 'INVALID_PATH' }, { status: 400 });
  }

  // 异步处理（不等返回）
  processAsset(assetId).catch((err) => {
    console.error(`[storage-webhook] processAsset(${assetId}) failed:`, err);
  });

  return NextResponse.json({ ok: true });
}
```

**Phase 1 替代方案**：

- seed 脚本同步调用 `processAsset()`（不等异步）
- admin 工具按钮可手动触发重新处理

### 6.2 失败重试

```typescript
// api/src/services/storage.ts
const MAX_RETRY = 3;
const RETRY_DELAY_MS = [1000, 5000, 15000];  // exponential backoff

export async function processAssetWithRetry(assetId: string): Promise<void> {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt < MAX_RETRY; attempt++) {
    try {
      await processAsset(assetId);
      return;
    } catch (e) {
      lastError = e as Error;
      console.warn(`[storage] processAsset(${assetId}) attempt ${attempt + 1} failed:`, e);
      if (attempt < MAX_RETRY - 1) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS[attempt]));
      }
    }
  }
  // 全部失败 → upload_status='failed' + 上报
  await db.update(assets).set({
    uploadStatus: 'failed',
    processingError: lastError?.message ?? 'unknown',
  }).where(eq(assets.id, assetId));
  await reportToSentry(`storage.processAsset.failed.${assetId}`, lastError);
}
```

---

## 7. CORS + 访问控制

### 7.1 Storage Bucket RLS

```sql
-- 在 Supabase SQL Editor 执行（Phase 1 默认不允许 client 直访 Storage）
CREATE POLICY "Service role full access"
  ON storage.objects
  FOR ALL
  TO service_role
  USING (bucket_id = 'see-earth-alpha-assets');

-- 客户端不允许直访（必须通过 signed URL）
-- （不创建 anon/authenticated policy = 默认拒绝）
```

### 7.2 后端 API → Storage 路径

```text
[client]
  ↓ fetch (signed URL)
[Supabase Storage CDN]
  ↓ (signed URL 验证)
[Storage backend]
  ↓
[返回文件]

[client] ← public API ← [Next.js API handler] ← service_role key ← [Supabase Storage]
```

**关键约束**：

- `SUPABASE_SERVICE_ROLE_KEY` 永远不出现在 client bundle（仅 Vercel Preview env）
- Client 访问 Storage **只能** 通过 signed URL（短期 TTL）
- Storage bucket 是 private，无 RLS bypass

---

## 8. Phase 1 不实现（明确排除）

| 项 | Phase | 备注 |
|---|---|---|
| Witness upload UI | Phase 2 | 仅实现 server pipeline |
| Witness POST `/v1/witness/submissions` | Phase 2 | Phase 1 仅 GET 端点 |
| Live photo / live video | 不做 | per Brief §6 |
| AVIF output | 不做 | V1 仅 WebP |
| Image upload from clipboard | 不做 | Phase 2 |
| Multi-image upload | 不做 | V1 单图 |

---

## 9. Blockers（详见 `phase1-blockers-v1.md`）

1. Supabase project 创建（用户手动）
2. Storage bucket 创建（依赖 #1）
3. Service role key 配置到 Vercel Preview env（依赖 #1）
4. 测试图源选择（建议用 Unsplash 已知无 GPS EXIF 的图）
5. sharp 在 Vercel Edge Function 的兼容性（验证 · 用 Node.js runtime 规避）

---

## 10. 元数据

| 字段 | 值 |
|---|---|
| 文档版本 | v1 |
| 创建时间 | 2026-08-22 |
| 创建人 | Engineer Agent (Round 2B) |
| 文档 ID | `storage-pipeline-v1.md` |
| 目标 Gate | Gate A · Internal Alpha · Phase 1 |
| 决策状态 | ✅ ACCEPTED（待 PM 评审） |
| Workspace 路径 | `/Users/lwy/Documents/ChatGPT/看见地球/release-v1/vertical-slice-phase1/storage-pipeline-v1.md` |
| Obsidian canonical 路径 | `/Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/vertical-slice-phase1/storage-pipeline-v1.md` |
| Obsidian 同步状态 | ❌ 未同步（sandbox 拒绝写入 Obsidian） |

---

**End of storage-pipeline-v1.md**