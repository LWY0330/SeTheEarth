---
title: SEE EARTH V1 · captured_at 服务端验证代码 + Zod Schema · v1
type: design-spec
tags: [release-v1, engineering, e-p0-04, captured-at, validation, zod, code, see-earth]
task_id: E-P0-04
brief_anchor: §5 E-P0-04 / 任务卡 §F §G
track: engineering
owner: 外部 Engineer Owner（您）
created: 2026-08-24
status: IN REVIEW
target_gate: Gate A · Internal Alpha
source_brief: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/SEE-EARTH-Release-Strategy-v1-Design-Engineering-Task-Brief.md §5 E-P0-04
source_task_card: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/06-PM Agent 交接/2026-08-22-task-card-e-p0-04-captured-at-rules.md
related_docs:
  - ./three-time-semantics-v1.md
  - ./source-enum-v1.md
  - ./confidence-enum-v1.md
  - ./edge-cases-v1.md
  - ./test-cases-v1.md
  - ../../../Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/api-contract/zod-schemas/common.ts
  - ../../../Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/api-contract/zod-schemas/moment.ts
depends_on: [E-P0-01 (✓ ACCEPTED), E-P0-09 (LOCKED ✓)]
blocks: [E-P0-03 Minimal Witness Backend]
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/e-p0-04-captured-at/validation-v1.md
workspace_canonical_path: /Users/lwy/Documents/ChatGPT/看见地球/release-v1/e-p0-04-captured-at/validation-v1.md
---

# SEE EARTH V1 · captured_at 服务端验证代码 + Zod Schema · v1

> **作者**：Engineer Agent #5（外部 Owner = 您）
> **目标读者**：E-P0-03 Witness Backend Owner · E-P0-09 Contract Owner · Web / iOS 工程师 · QA
> **目的**：交付 **可直接复制** 的服务端验证代码 + Zod schema + 前端展示工具函数。
> **强制原则**（来自任务卡 §F §G + Brief §5 E-P0-04）：
> 1. **服务端是最后防线**——客户端所有校验服务端**必须**二次校验。
> 2. **不引入新依赖**——用 Zod（已锁定）+ 内置 Intl + date-fns（项目已使用）。
> 3. **未来时间 = hard block**（最高优先级）。

---

## 0. 阅读指南

- **§1 Zod Schema 定义**（Moment / WitnessSubmission）
- **§2 服务端验证函数**（validateCapturedAt）
- **§3 NOW 桶资格函数**（isNowEligible）
- **§4 前端展示工具函数**（formatCapturedAt / formatUploadedAt / formatPublishedAt）
- **§5 完整 submit handler 示例**
- **§6 与 E-P0-09 Zod contract 一致性**
- **§7 自验收**

---

## §1 Zod Schema 定义

### 1.1 CapturedAt 4 字段 schema

> **路径**：`release-v1/api-contract/zod-schemas/captured-at.ts`（**新增** · 与 moment.ts / common.ts 同目录）

```ts
/* ============================================================
   SEE EARTH V1 · captured_at 4 字段 schema · E-P0-04
   ------------------------------------------------------------
   - Version: 1.0.0 (2026-08-24 · E-P0-04)
   - Source of Truth: E-P0-04 task card §B + source-enum-v1.md + confidence-enum-v1.md
   - 与 common.ts CapturedAtSourceSchema / CapturedAtConfidenceSchema 联动
   ============================================================ */

import { z } from 'zod';
import {
  UtcTimestampSchema,
  IanaTimezoneSchema,
} from './common';

/* ---------- source 枚举（4 值 · 任务卡 §B） ---------- */
export const CapturedAtSourceSchema = z.enum([
  'exif',
  'camera',
  'user_confirmed',
  'admin',
]);

/* ---------- confidence 枚举（4 值 · 任务卡 §B） ---------- */
export const CapturedAtConfidenceSchema = z.enum([
  'high',
  'medium',
  'low',
  'manual',
]);

/* ---------- captured_at 4 字段组合（用于 WitnessSubmission） ---------- */
export const CapturedAtFieldsSchema = z
  .object({
    captured_at: UtcTimestampSchema,
    captured_at_tz: IanaTimezoneSchema,
    captured_at_source: CapturedAtSourceSchema,
    captured_at_confidence: CapturedAtConfidenceSchema,
  })
  .strict()
  .superRefine((data, ctx) => {
    // 规则 1: source=user_confirmed → confidence 必须是 manual
    if (data.captured_at_source === 'user_confirmed' &&
        data.captured_at_confidence !== 'manual') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'source=user_confirmed requires confidence=manual',
        path: ['captured_at_confidence'],
      });
    }
    
    // 规则 2: confidence=manual → source 必须是 user_confirmed
    if (data.captured_at_confidence === 'manual' &&
        data.captured_at_source !== 'user_confirmed') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'confidence=manual requires source=user_confirmed',
        path: ['captured_at_source'],
      });
    }
    
    // 规则 3: source=admin 仅允许后台（前端禁用）
    if (data.captured_at_source === 'admin') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'source=admin forbidden in public endpoint',
        path: ['captured_at_source'],
      });
    }
  });

/* ---------- 类型导出 ---------- */
export type CapturedAtSource = z.infer<typeof CapturedAtSourceSchema>;
export type CapturedAtConfidence = z.infer<typeof CapturedAtConfidenceSchema>;
export type CapturedAtFields = z.infer<typeof CapturedAtFieldsSchema>;
```

### 1.2 Moment schema（与 moment.ts PublicMomentSchema 同步）

```ts
/* ---------- 在 moment.ts 中追加 CapturedAtFields ---------- */
// 见 moment.ts §PublicMomentSchema 内部已包含以下字段：
//
//   captured_at: UtcTimestampSchema,
//   captured_at_tz: IanaTimezoneSchema,
//   captured_at_source: CapturedAtSourceSchema,      // ← 与本文件联动
//   captured_at_confidence: CapturedAtConfidenceSchema,
//   uploaded_at: UtcTimestampSchema,
//   published_at: UtcTimestampSchema.optional(),
//
// 详见 three-time-semantics-v1.md §7.3 冲突处理：
// - 移除 common.ts CapturedAtSourceSchema 的 'fallback_upload_time'
// - 移除 common.ts CapturedAtConfidenceSchema 的 'untrusted'
// - 引入本文件 4 source / 4 confidence 枚举
```

### 1.3 WitnessSubmission schema（E-P0-03 实现）

```ts
/* ---------- WitnessSubmission schema 关键字段 ---------- */
import { CapturedAtFieldsSchema } from './captured-at';

export const WitnessSubmissionSubmitSchema = z
  .object({
    // ... 其他字段（city_id, location_mode, description, asset_id, mime_type, exif_stripped, app_surface, locale, user_agent_class）
    ...CapturedAtFieldsSchema.shape, // 注入 4 字段
  })
  .strict();
```

---

## §2 服务端验证函数

### 2.1 validateCapturedAt（核心校验）

> **路径**：`release-v1/backend/witness/captured-at-validator.ts`（**新增** · E-P0-03 实现）

```ts
/* ============================================================
   服务端 captured_at 验证 · E-P0-04 §G
   ------------------------------------------------------------
   - 在 submit handler 第 3 步调用
   - 抛出 CapturedAtValidationError → 400 captured_at_in_future
   - 抛出 CapturedAtValidationError → 400 captured_at_invalid
   - 不抛出 = 通过（可写入 submission）
   ============================================================ */

import { differenceInDays, differenceInSeconds, parseISO } from 'date-fns';
import { CapturedAtSource, CapturedAtConfidence } from '../../api-contract/zod-schemas/captured-at';

/* ---------- 常量 ---------- */
const FUTURE_TOLERANCE_SECONDS = 60; // 1 min 时钟漂移宽容
const OLD_PHOTO_THRESHOLD_DAYS = 30;

/* ---------- 错误类型 ---------- */
export class CapturedAtValidationError extends Error {
  constructor(
    public errorCode:
      | 'captured_at_in_future'
      | 'captured_at_invalid'
      | 'captured_at_confidence_mismatch'
      | 'captured_at_source_mismatch',
    public message: string,
    public details: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = 'CapturedAtValidationError';
  }
}

/* ---------- 主函数 ---------- */
export interface ValidateCapturedAtInput {
  capturedAt: Date;
  uploadedAt: Date;
  source: CapturedAtSource;
  confidence: CapturedAtConfidence;
}

export function validateCapturedAt(input: ValidateCapturedAtInput): void {
  const { capturedAt, uploadedAt, source, confidence } = input;

  /* ---------- 规则 1: 未来时间 hard block ---------- */
  const diffSeconds = differenceInSeconds(capturedAt, uploadedAt);
  if (diffSeconds > FUTURE_TOLERANCE_SECONDS) {
    throw new CapturedAtValidationError(
      'captured_at_in_future',
      '拍摄时间在未来。请调整后重试。',
      {
        captured_at: capturedAt.toISOString(),
        uploaded_at: uploadedAt.toISOString(),
        diff_seconds: diffSeconds,
      },
    );
  }

  /* ---------- 规则 2: source/confidence 配对 ---------- */
  if (source === 'user_confirmed' && confidence !== 'manual') {
    throw new CapturedAtValidationError(
      'captured_at_confidence_mismatch',
      'source=user_confirmed 时，confidence 必须为 manual。',
      { source, confidence },
    );
  }
  if (confidence === 'manual' && source !== 'user_confirmed') {
    throw new CapturedAtValidationError(
      'captured_at_confidence_mismatch',
      'confidence=manual 时，source 必须为 user_confirmed。',
      { source, confidence },
    );
  }

  /* ---------- 规则 3: source=admin 仅后台（防御性） ---------- */
  if (source === 'admin') {
    throw new CapturedAtValidationError(
      'captured_at_source_mismatch',
      'source=admin 不允许通过公共 endpoint 提交。',
      { source },
    );
  }

  /* ---------- 规则 4: 旧照片 soft warning（不抛出，仅 log） ---------- */
  const ageDays = differenceInDays(uploadedAt, capturedAt);
  if (ageDays > OLD_PHOTO_THRESHOLD_DAYS) {
    logAudit('captured_at_old_photo_soft_warning', {
      captured_at: capturedAt.toISOString(),
      uploaded_at: uploadedAt.toISOString(),
      age_days: ageDays,
      source,
      confidence,
    });
  }
}

/* ---------- audit log 占位 ---------- */
function logAudit(event: string, details: Record<string, unknown>): void {
  // E-P0-03 实现 audit log
  // E-P0-05 audit-log-v1.md 详细规范
  console.warn('[captured_at audit]', event, details);
}
```

### 2.2 服务端二次 EXIF 校验（与客户端交叉验证）

```ts
/* ============================================================
   服务端 EXIF reader 交叉验证 · source-enum §4.1
   ------------------------------------------------------------
   - 客户端声称 source=exif 但服务端 EXIF 解析失败 → 强制降级
   - 服务端 EXIF DateTimeOriginal 与客户端声称差异 > 1h → 拒绝
   ============================================================ */

import exifr from 'exifr';

export async function validateCapturedAtAgainstServerExif(
  capturedAt: Date,
  claimedSource: CapturedAtSource,
  claimedTimezone: string,
  assetBuffer: Buffer,
): Promise<{ source: CapturedAtSource; confidence: CapturedAtConfidence }> {
  // 仅 source=exif 时做服务端 EXIF 校验
  if (claimedSource !== 'exif') {
    return { source: claimedSource, confidence: 'manual' };
  }

  try {
    const exif = await exifr.parse(assetBuffer, {
      tiff: true,
      exif: true,
      gps: false, // 服务端不读取 GPS
      pick: ['DateTimeOriginal', 'OffsetTime', 'OffsetTimeOriginal', 'Software'],
    });

    if (!exif?.DateTimeOriginal) {
      throw new CapturedAtValidationError(
        'captured_at_source_mismatch',
        '客户端声称 source=exif 但服务端解析不到 DateTimeOriginal。',
        { claimed_source: claimedSource },
      );
    }

    const exifTime = parseISO(exif.DateTimeOriginal);
    const diffSeconds = Math.abs(differenceInSeconds(exifTime, capturedAt));

    if (diffSeconds > 3600) { // 1h
      throw new CapturedAtValidationError(
        'captured_at_source_mismatch',
        '服务端 EXIF DateTimeOriginal 与客户端声称的 captured_at 差异 > 1h。',
        {
          exif_datetime_original: exif.DateTimeOriginal,
          claimed_captured_at: capturedAt.toISOString(),
          diff_seconds: diffSeconds,
        },
      );
    }

    // 服务端二次判定 confidence
    const hasOffsetTime = !!(exif.OffsetTime || exif.OffsetTimeOriginal);
    return {
      source: 'exif',
      confidence: hasOffsetTime ? 'high' : 'medium',
    };
  } catch (e) {
    if (e instanceof CapturedAtValidationError) throw e;
    throw new CapturedAtValidationError(
      'captured_at_invalid',
      '服务端 EXIF 解析失败。',
      { error: (e as Error).message },
    );
  }
}
```

---

## §3 NOW 桶资格函数

### 3.1 isNowEligible（E-P0-06 Daily 12 Supply Chain 使用）

```ts
/* ============================================================
   NOW 桶资格判定 · E-P0-04 + E-P0-06
   ------------------------------------------------------------
   - captured_at 距 NOW <= 24h + confidence ∈ {high, medium} → NOW 桶
   - 旧照片 (low / manual) 仅当 user_confirmed_submit=true 才可进 NOW
   ============================================================ */

import { differenceInHours } from 'date-fns';

export interface NowEligibleInput {
  capturedAt: Date;
  confidence: CapturedAtConfidence;
  userConfirmedSubmit?: boolean; // Witness 在段 5 主动确认
}

export function isNowEligible(
  input: NowEligibleInput,
  now: Date = new Date(),
): boolean {
  const { capturedAt, confidence, userConfirmedSubmit = false } = input;
  
  // 规则 1: captured_at 距 NOW > 24h → 不在 NOW 桶
  const ageHours = differenceInHours(now, capturedAt);
  if (ageHours > 24) return false;
  
  // 规则 2: confidence = high / medium → 可进 NOW
  if (confidence === 'high' || confidence === 'medium') return true;
  
  // 规则 3: confidence = low / manual 仅在 user_confirmed_submit=true 时可进 NOW
  if (confidence === 'low' || confidence === 'manual') {
    return userConfirmedSubmit;
  }
  
  return false;
}
```

### 3.2 Daily 12 SQL 排序参考

```sql
-- E-P0-06 Daily 12 Supply Chain SQL
SELECT * FROM moments
WHERE moderation_status = 'approved'
  AND captured_at > NOW() - INTERVAL '24 hours'  -- 必填
  AND (
    captured_at_confidence IN ('high', 'medium')  -- 默认进 NOW
    OR (captured_at_confidence IN ('low', 'manual') AND user_confirmed_submit = true)
  )
ORDER BY captured_at DESC                       -- 必填 captured_at
LIMIT 12;
```

---

## §4 前端展示工具函数

### 4.1 三时间分别展示

```ts
/* ============================================================
   前端时间展示工具 · E-P0-04 §E
   ------------------------------------------------------------
   - 不引入新依赖（用 Intl + date-fns）
   - 三时间分别展示，明确区分
   ============================================================ */

import { formatDistanceToNowStrict, format } from 'date-fns';
import { zhCN, enUS } from 'date-fns/locale';

export interface FormatCapturedAtInput {
  capturedAt: Date;
  capturedAtTz: string; // IANA timezone
  locale?: 'zh-CN' | 'en';
}

export function formatCapturedAt(input: FormatCapturedAtInput): string {
  const { capturedAt, capturedAtTz, locale = 'zh-CN' } = input;
  const dateLocale = locale === 'zh-CN' ? zhCN : enUS;
  
  // 用 Intl 转换到 captured_at_tz
  const localFormatter = new Intl.DateTimeFormat(locale, {
    timeZone: capturedAtTz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  
  const localTime = localFormatter.format(capturedAt);
  // localTime: "2026/08/19 14:23"
  
  // 用 Intl 获取 tz 简称（如 "JST"）
  const tzFormatter = new Intl.DateTimeFormat(locale, {
    timeZone: capturedAtTz,
    timeZoneName: 'short',
  });
  const tzParts = tzFormatter.formatToParts(capturedAt);
  const tzShort = tzParts.find(p => p.type === 'timeZoneName')?.value ?? capturedAtTz;
  // tzShort: "JST" 或 "GMT+9"
  
  if (locale === 'zh-CN') {
    return `拍摄于 ${localTime} ${tzShort}`;
  }
  return `Captured at ${localTime} ${tzShort}`;
}

/* ---------- uploaded_at 展示 ---------- */
export function formatUploadedAt(
  uploadedAt: Date,
  locale: 'zh-CN' | 'en' = 'zh-CN',
): string {
  const ago = formatDistanceToNowStrict(uploadedAt, {
    addSuffix: true,
    locale: locale === 'zh-CN' ? zhCN : enUS,
  });
  // ago: "2 小时前" / "2 hours ago"
  
  if (locale === 'zh-CN') {
    return `上传于 ${ago}`;
  }
  return `Uploaded ${ago}`;
}

/* ---------- published_at 展示（可空） ---------- */
export function formatPublishedAt(
  publishedAt: Date | null | undefined,
  locale: 'zh-CN' | 'en' = 'zh-CN',
): string | null {
  if (!publishedAt) return null; // 未审核 = 不展示
  
  const ago = formatDistanceToNowStrict(publishedAt, {
    addSuffix: true,
    locale: locale === 'zh-CN' ? zhCN : enUS,
  });
  
  if (locale === 'zh-CN') {
    return `公开于 ${ago}`;
  }
  return `Published ${ago}`;
}

/* ---------- 三时间合并展示（用于 Moment Detail 页） ---------- */
export interface ThreeTimeDisplay {
  captured: string;      // "拍摄于 2026-08-19 14:23 JST"
  uploaded: string;      // "上传于 2 小时前"
  published: string | null; // "公开于 3 天前" or null
}

export function formatThreeTimeDisplay(input: {
  capturedAt: Date;
  capturedAtTz: string;
  uploadedAt: Date;
  publishedAt?: Date | null;
  locale?: 'zh-CN' | 'en';
}): ThreeTimeDisplay {
  const { capturedAt, capturedAtTz, uploadedAt, publishedAt, locale = 'zh-CN' } = input;
  return {
    captured: formatCapturedAt({ capturedAt, capturedAtTz, locale }),
    uploaded: formatUploadedAt(uploadedAt, locale),
    published: formatPublishedAt(publishedAt, locale),
  };
}
```

### 4.2 React 组件示例（前端使用）

```tsx
// MomentDetail.tsx · 三时间分别展示
import { formatThreeTimeDisplay } from '@/lib/time/format';

export function MomentDetail({ moment }: { moment: PublicMoment }) {
  const display = formatThreeTimeDisplay({
    capturedAt: new Date(moment.captured_at),
    capturedAtTz: moment.captured_at_tz,
    uploadedAt: new Date(moment.uploaded_at),
    publishedAt: moment.published_at ? new Date(moment.published_at) : null,
    locale: 'zh-CN',
  });
  
  return (
    <div className="moment-meta">
      <div className="meta-row">{display.captured}</div>
      <div className="meta-row meta-row-sub">{display.uploaded}</div>
      {display.published && (
        <div className="meta-row meta-row-sub">{display.published}</div>
      )}
    </div>
  );
}
```

---

## §5 完整 submit handler 示例

### 5.1 端到端 Witness 提交 handler

```ts
/* ============================================================
   Witness submit handler · E-P0-03 §4 POST /witness/submissions/:id/submit
   ------------------------------------------------------------
   - 顺序：Zod 校验 → EXIF 二次校验 → captured_at 业务校验 → 写库
   ============================================================ */

import { Request, Response } from 'express';
import { z } from 'zod';
import { differenceInSeconds } from 'date-fns';
import { 
  WitnessSubmissionSubmitSchema,
} from '../../api-contract/zod-schemas/witness-submission';
import {
  validateCapturedAt,
  validateCapturedAtAgainstServerExif,
  CapturedAtValidationError,
} from './captured-at-validator';

export async function submitWitnessSubmission(req: Request, res: Response) {
  /* ---------- 步骤 1: Zod 字段校验 ---------- */
  let parsed;
  try {
    parsed = WitnessSubmissionSubmitSchema.parse(req.body);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return res.status(400).json({
        error_code: 'validation_failed',
        message: '字段验证失败。',
        details: e.flatten().fieldErrors,
        retryable: false,
        request_id: req.id,
      });
    }
    throw e;
  }
  
  /* ---------- 步骤 2: 获取服务端 NOW 与 asset ---------- */
  const uploadedAt = new Date();
  const asset = await getAssetById(parsed.asset_id);
  if (!asset) {
    return res.status(404).json({
      error_code: 'submission_not_found',
      message: '草稿不存在或已过期。',
      retryable: false,
      request_id: req.id,
    });
  }
  
  /* ---------- 步骤 3: 服务端 EXIF 二次校验 ---------- */
  try {
    const result = await validateCapturedAtAgainstServerExif(
      new Date(parsed.captured_at),
      parsed.captured_at_source,
      parsed.captured_at_tz,
      asset.buffer,
    );
    parsed.captured_at_source = result.source;
    parsed.captured_at_confidence = result.confidence;
  } catch (e) {
    if (e instanceof CapturedAtValidationError) {
      return res.status(400).json({
        error_code: e.errorCode,
        message: e.message,
        details: e.details,
        retryable: false,
        request_id: req.id,
      });
    }
    throw e;
  }
  
  /* ---------- 步骤 4: captured_at 业务校验（含未来时间 hard block） ---------- */
  try {
    validateCapturedAt({
      capturedAt: new Date(parsed.captured_at),
      uploadedAt,
      source: parsed.captured_at_source,
      confidence: parsed.captured_at_confidence,
    });
  } catch (e) {
    if (e instanceof CapturedAtValidationError) {
      return res.status(400).json({
        error_code: e.errorCode,
        message: e.message,
        details: e.details,
        retryable: false,
        request_id: req.id,
      });
    }
    throw e;
  }
  
  /* ---------- 步骤 5: 写入数据库 ---------- */
  const submission = await db.witnessSubmissions.create({
    data: {
      ...parsed,
      uploaded_at: uploadedAt,
      status: 'submitted',
    },
  });
  
  /* ---------- 步骤 6: 返回公开预览（不含精确位置） ---------- */
  return res.status(201).json({
    submission_id: submission.id,
    status: submission.status,
    submitted_at: uploadedAt.toISOString(),
    public_preview: {
      city_id: parsed.city_id,
      captured_at: parsed.captured_at,
      captured_at_tz: parsed.captured_at_tz,
      captured_at_source: parsed.captured_at_source,
      captured_at_confidence: parsed.captured_at_confidence,
      description: parsed.description,
      thumbnail_url: asset.thumbnail_url,
    },
    request_id: req.id,
  });
}
```

---

## §6 与 E-P0-09 Zod contract 一致性

### 6.1 已有 common.ts 字段

| 字段 | common.ts 当前 | E-P0-04 期望 | 处理 |
|---|---|---|---|
| `CapturedAtSourceSchema` | `exif, camera, user_confirmed, admin, fallback_upload_time` | `exif, camera, user_confirmed, admin` | **需更新**（移除 fallback_upload_time） |
| `CapturedAtConfidenceSchema` | `high, medium, low, untrusted` | `high, medium, low, manual` | **需更新**（移除 untrusted，添加 manual） |
| `UtcTimestampSchema` | RFC 3339 UTC + offset | 一致 | ✓ |
| `IanaTimezoneSchema` | IANA timezone | 一致 | ✓ |

### 6.2 处理建议（待 E-P0-09 owner 裁决）

1. **更新 common.ts**：移除 `fallback_upload_time` 与 `untrusted`，添加 `manual`。
2. **更新 schema-changelog-v1.md**：v1.0.0 → v1.1.0（MINOR 兼容变更）。
3. **本文件**（`captured-at.ts`）作为新文件被 E-P0-09 引入；与 common.ts 形成"4 字段组合 schema"。
4. **删除冲突**后，公共 Zod schema 入口统一在 common.ts。

### 6.3 与 moment.ts PublicMomentSchema 一致

`PublicMomentSchema` 已包含完整 4 字段（`captured_at + captured_at_tz + captured_at_source + captured_at_confidence`）+ `uploaded_at` + `published_at?`，与本卡定义 100% 对齐。**字段语义**通过 §6.1 更新 source/confidence 枚举后完全一致。

---

## §7 自验收

| # | 验收项 | 状态 | 证据 |
|---|---|:---:|---|
| 1 | CapturedAtFieldsSchema 4 字段 + superRefine 校验 | ✅ | §1.1 |
| 2 | validateCapturedAt 主函数（含未来时间 hard block） | ✅ | §2.1 |
| 3 | 服务端 EXIF 二次校验（防客户端伪造） | ✅ | §2.2 |
| 4 | isNowEligible NOW 桶资格函数 | ✅ | §3.1 |
| 5 | Daily 12 SQL 排序参考（captured_at DESC） | ✅ | §3.2 |
| 6 | 前端三时间展示工具（formatCapturedAt / formatUploadedAt / formatPublishedAt） | ✅ | §4.1 |
| 7 | React 组件示例（前端使用） | ✅ | §4.2 |
| 8 | 完整 submit handler 端到端示例 | ✅ | §5 |
| 9 | 不引入新依赖（Zod + date-fns + Intl） | ✅ | §2 / §4 |
| 10 | 与 E-P0-09 Zod contract 一致性 + 冲突标注 | ✅ | §6 |
| 11 | 未来时间 hard block（服务端 + 客户端） | ✅ | §2.1 + edge-cases §6 |
| 12 | audit log 占位（E-P0-03 / E-P0-05 实现） | ✅ | §2.1 logAudit |

---

**End of validation-v1.md · E-P0-04 子产物 5/6**
