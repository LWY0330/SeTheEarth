---
title: SEE EARTH V1 · captured_at 单元测试覆盖矩阵 + 集成测试场景 · v1
type: test-spec
tags: [release-v1, engineering, e-p0-04, captured-at, test-cases, see-earth]
task_id: E-P0-04
brief_anchor: §5 E-P0-04 / 任务卡 §D
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
  - ./validation-v1.md
  - ../../../Obsidian Vault/项目/看见地球 设计/07-设计师设计参考/release-v1/minimal-witness/api-field-mapping-v1.md (§4 错误码)
depends_on: [E-P0-01 (✓ ACCEPTED), E-P0-09 (LOCKED ✓)]
blocks: [E-P0-03 Minimal Witness Backend]
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/e-p0-04-captured-at/test-cases-v1.md
workspace_canonical_path: /Users/lwy/Documents/ChatGPT/看见地球/release-v1/e-p0-04-captured-at/test-cases-v1.md
---

# SEE EARTH V1 · captured_at 单元测试覆盖矩阵 + 集成测试场景 · v1

> **作者**：Engineer Agent #5（外部 Owner = 您）
> **目标读者**：E-P0-03 Witness Backend Owner · Web / iOS 工程师 · QA · E-P1-03 smoke suite owner
> **目的**：交付 **可直接复用** 的测试用例矩阵——服务端单元测试 + 集成测试场景。
> **核心原则**（来自任务卡 §D + Brief §5 E-P0-04 Acceptance Criteria）：
> 1. **覆盖所有 5 类异常**（无 EXIF / EXIF 不可信 / 跨时区 / 旧照片 / 未来时间）。
> 2. **覆盖重复上传幂等**（client_key）。
> 3. **NOW 排序正确性**（E-P0-06 联动）。
> 4. **跨时区 / DST / 跨年边界**。

---

## 0. 阅读指南

- **§1 测试矩阵总览**
- **§2 服务端单元测试**（validateCapturedAt · 13 case）
- **§3 Zod schema 单元测试**（CapturedAtFieldsSchema · 8 case）
- **§4 EXIF 解析单元测试**（validateCapturedAtAgainstServerExif · 6 case）
- **§5 NOW 桶资格单元测试**（isNowEligible · 5 case）
- **§6 前端展示单元测试**（formatCapturedAt / formatUploadedAt / formatPublishedAt · 4 case）
- **§7 集成测试场景**（端到端 8 scenario）
- **§8 性能 / 边界测试**（DST / 跨年 / 大并发）
- **§9 自验收**

---

## §1 测试矩阵总览

| 类别 | 用例数 | 阻塞测试 | 关键程度 |
|---|---:|:---:|---|
| §2 服务端 validateCapturedAt | 13 | 全部 | **P0** |
| §3 Zod CapturedAtFieldsSchema | 8 | 全部 | **P0** |
| §4 服务端 EXIF 二次校验 | 6 | 全部 | **P0** |
| §5 NOW 桶资格 | 5 | 全部 | **P0** |
| §6 前端展示工具 | 4 | 全部 | P1 |
| §7 集成测试场景 | 8 | 全部 | **P0** |
| §8 性能 / 边界 | 5 | 仅性能 2 | P1 |
| **合计** | **49** | — | — |

---

## §2 服务端单元测试（validateCapturedAt · 13 case）

> **文件路径**：`release-v1/backend/witness/__tests__/captured-at-validator.test.ts`（**新增**）
> **测试框架**：Jest 或 Vitest（项目已有 Vitest）

### 2.1 Case 1: 正常提交（happy path · EXIF high confidence）

```ts
test('captured_at 正常 · source=exif · confidence=high · 不抛错', () => {
  const uploadedAt = new Date('2026-08-22T10:30:00Z');
  const capturedAt = new Date('2026-08-22T10:00:00Z'); // 30 min 前
  
  expect(() =>
    validateCapturedAt({
      capturedAt,
      uploadedAt,
      source: 'exif',
      confidence: 'high',
    }),
  ).not.toThrow();
});
```

### 2.2 Case 2: 未来时间 hard block（1 分钟内）

```ts
test('captured_at 比 uploaded_at 晚 30 秒 · 不抛错（1 min 宽容）', () => {
  const uploadedAt = new Date('2026-08-22T10:30:00Z');
  const capturedAt = new Date('2026-08-22T10:30:30Z'); // 30 秒后
  
  expect(() =>
    validateCapturedAt({
      capturedAt,
      uploadedAt,
      source: 'camera',
      confidence: 'high',
    }),
  ).not.toThrow();
});
```

### 2.3 Case 3: 未来时间 hard block（1 分钟外）

```ts
test('captured_at 比 uploaded_at 晚 2 分钟 · 抛 captured_at_in_future', () => {
  const uploadedAt = new Date('2026-08-22T10:30:00Z');
  const capturedAt = new Date('2026-08-22T10:32:00Z'); // 2 分钟后
  
  expect(() =>
    validateCapturedAt({
      capturedAt,
      uploadedAt,
      source: 'exif',
      confidence: 'high',
    }),
  ).toThrow(CapturedAtValidationError);
  
  try {
    validateCapturedAt({
      capturedAt,
      uploadedAt,
      source: 'exif',
      confidence: 'high',
    });
  } catch (e) {
    expect((e as CapturedAtValidationError).errorCode).toBe('captured_at_in_future');
    expect((e as CapturedAtValidationError).details.diff_seconds).toBe(120);
  }
});
```

### 2.4 Case 4: 旧照片 soft warning（30 天边界）

```ts
test('captured_at 距 uploaded_at 31 天 · 不抛错 + audit log warning', () => {
  const uploadedAt = new Date('2026-08-22T10:30:00Z');
  const capturedAt = new Date('2026-07-22T10:00:00Z'); // 31 天前
  
  // 不抛错
  expect(() =>
    validateCapturedAt({
      capturedAt,
      uploadedAt,
      source: 'user_confirmed',
      confidence: 'manual',
    }),
  ).not.toThrow();
  
  // audit log 应被触发（mock logAudit）
  // 详见 §2.5
});
```

### 2.5 Case 5: audit log 验证（旧照片）

```ts
test('旧照片 · audit log 记录 age_days', () => {
  const logAuditSpy = jest.spyOn(console, 'warn');
  
  const uploadedAt = new Date('2026-08-22T10:30:00Z');
  const capturedAt = new Date('2026-07-22T10:00:00Z'); // 31 天前
  
  validateCapturedAt({
    capturedAt,
    uploadedAt,
    source: 'user_confirmed',
    confidence: 'manual',
  });
  
  expect(logAuditSpy).toHaveBeenCalledWith(
    '[captured_at audit]',
    'captured_at_old_photo_soft_warning',
    expect.objectContaining({ age_days: 31 }),
  );
});
```

### 2.6 Case 6: source=user_confirmed + confidence=manual（合法配对）

```ts
test('source=user_confirmed + confidence=manual · 不抛错', () => {
  const uploadedAt = new Date('2026-08-22T10:30:00Z');
  const capturedAt = new Date('2026-08-22T10:00:00Z');
  
  expect(() =>
    validateCapturedAt({
      capturedAt,
      uploadedAt,
      source: 'user_confirmed',
      confidence: 'manual',
    }),
  ).not.toThrow();
});
```

### 2.7 Case 7: source=user_confirmed + confidence≠manual（非法配对）

```ts
test('source=user_confirmed + confidence=high · 抛 captured_at_confidence_mismatch', () => {
  const uploadedAt = new Date('2026-08-22T10:30:00Z');
  const capturedAt = new Date('2026-08-22T10:00:00Z');
  
  try {
    validateCapturedAt({
      capturedAt,
      uploadedAt,
      source: 'user_confirmed',
      confidence: 'high',
    });
    fail('应抛错');
  } catch (e) {
    expect((e as CapturedAtValidationError).errorCode).toBe('captured_at_confidence_mismatch');
  }
});
```

### 2.8 Case 8: confidence=manual + source≠user_confirmed（非法配对）

```ts
test('confidence=manual + source=exif · 抛 captured_at_confidence_mismatch', () => {
  const uploadedAt = new Date('2026-08-22T10:30:00Z');
  const capturedAt = new Date('2026-08-22T10:00:00Z');
  
  try {
    validateCapturedAt({
      capturedAt,
      uploadedAt,
      source: 'exif',
      confidence: 'manual',
    });
    fail('应抛错');
  } catch (e) {
    expect((e as CapturedAtValidationError).errorCode).toBe('captured_at_confidence_mismatch');
  }
});
```

### 2.9 Case 9: source=admin 通过公共 endpoint（防御性）

```ts
test('source=admin + 公共 endpoint · 抛 captured_at_source_mismatch', () => {
  const uploadedAt = new Date('2026-08-22T10:30:00Z');
  const capturedAt = new Date('2026-08-22T10:00:00Z');
  
  try {
    validateCapturedAt({
      capturedAt,
      uploadedAt,
      source: 'admin',
      confidence: 'high',
    });
    fail('应抛错');
  } catch (e) {
    expect((e as CapturedAtValidationError).errorCode).toBe('captured_at_source_mismatch');
  }
});
```

### 2.10 Case 10: 跨年边界（2025-12-31 → 2026-01-01）

```ts
test('跨年 · captured_at=2025-12-31 · uploaded_at=2026-01-01 · 正常', () => {
  const uploadedAt = new Date('2026-01-01T00:00:00Z');
  const capturedAt = new Date('2025-12-31T23:30:00Z'); // 30 min 前
  
  expect(() =>
    validateCapturedAt({
      capturedAt,
      uploadedAt,
      source: 'exif',
      confidence: 'high',
    }),
  ).not.toThrow();
});
```

### 2.11 Case 11: DST 边界（America/New_York 春进）

```ts
test('DST 春进 · captured_at 在 DST 跳变前 · 正常', () => {
  // 2026-03-08 02:00 EST → 03:00 EDT（北美）
  const uploadedAt = new Date('2026-03-08T08:00:00Z');
  const capturedAt = new Date('2026-03-08T07:30:00Z'); // 30 min 前
  
  expect(() =>
    validateCapturedAt({
      capturedAt,
      uploadedAt,
      source: 'exif',
      confidence: 'high',
    }),
  ).not.toThrow();
});
```

### 2.12 Case 12: 时区差异（Tokyo vs London）

```ts
test('Tokyo 早上 9 点 vs London 早上 0 点 · 同时刻 · 都通过', () => {
  const uploadedAt = new Date('2026-08-22T00:00:00Z'); // 共同时刻
  
  const tokyoCaptured = new Date('2026-08-22T09:00:00+09:00'); // Tokyo 09:00
  const londonCaptured = new Date('2026-08-22T00:00:00+00:00'); // London 00:00 (同时刻)
  
  expect(() =>
    validateCapturedAt({
      capturedAt: tokyoCaptured,
      uploadedAt,
      source: 'exif',
      confidence: 'high',
    }),
  ).not.toThrow();
  
  expect(() =>
    validateCapturedAt({
      capturedAt: londonCaptured,
      uploadedAt,
      source: 'exif',
      confidence: 'high',
    }),
  ).not.toThrow();
});
```

### 2.13 Case 13: 极端旧照片（1 年前）

```ts
test('captured_at=1 年前 · 不抛错 + audit log', () => {
  const logAuditSpy = jest.spyOn(console, 'warn');
  
  const uploadedAt = new Date('2026-08-22T10:30:00Z');
  const capturedAt = new Date('2025-08-22T10:00:00Z'); // 1 年前
  
  expect(() =>
    validateCapturedAt({
      capturedAt,
      uploadedAt,
      source: 'user_confirmed',
      confidence: 'manual',
    }),
  ).not.toThrow();
  
  expect(logAuditSpy).toHaveBeenCalledWith(
    '[captured_at audit]',
    'captured_at_old_photo_soft_warning',
    expect.objectContaining({ age_days: 365 }),
  );
});
```

---

## §3 Zod Schema 单元测试（CapturedAtFieldsSchema · 8 case）

> **文件路径**：`release-v1/api-contract/zod-schemas/__tests__/captured-at.test.ts`（**新增**）

### 3.1 Case 1: 4 字段全部合法 · 通过

```ts
test('captured_at 完整 4 字段 · source=exif · confidence=high', () => {
  const input = {
    captured_at: '2026-08-22T14:23:00+09:00',
    captured_at_tz: 'Asia/Tokyo',
    captured_at_source: 'exif',
    captured_at_confidence: 'high',
  };
  
  expect(() => CapturedAtFieldsSchema.parse(input)).not.toThrow();
});
```

### 3.2 Case 2: source=user_confirmed + confidence=manual · 通过

```ts
test('captured_at · source=user_confirmed · confidence=manual', () => {
  const input = {
    captured_at: '2026-08-22T14:23:00+09:00',
    captured_at_tz: 'Asia/Tokyo',
    captured_at_source: 'user_confirmed',
    captured_at_confidence: 'manual',
  };
  
  expect(() => CapturedAtFieldsSchema.parse(input)).not.toThrow();
});
```

### 3.3 Case 3: source=user_confirmed + confidence=high · 失败

```ts
test('captured_at · source=user_confirmed · confidence=high · 失败', () => {
  const input = {
    captured_at: '2026-08-22T14:23:00+09:00',
    captured_at_tz: 'Asia/Tokyo',
    captured_at_source: 'user_confirmed',
    captured_at_confidence: 'high',
  };
  
  expect(() => CapturedAtFieldsSchema.parse(input)).toThrow(z.ZodError);
});
```

### 3.4 Case 4: confidence=manual + source=exif · 失败

```ts
test('captured_at · confidence=manual · source=exif · 失败', () => {
  const input = {
    captured_at: '2026-08-22T14:23:00+09:00',
    captured_at_tz: 'Asia/Tokyo',
    captured_at_source: 'exif',
    captured_at_confidence: 'manual',
  };
  
  expect(() => CapturedAtFieldsSchema.parse(input)).toThrow(z.ZodError);
});
```

### 3.5 Case 5: source=admin · 失败（公共 endpoint 防御）

```ts
test('captured_at · source=admin · 失败', () => {
  const input = {
    captured_at: '2026-08-22T14:23:00+09:00',
    captured_at_tz: 'Asia/Tokyo',
    captured_at_source: 'admin',
    captured_at_confidence: 'high',
  };
  
  expect(() => CapturedAtFieldsSchema.parse(input)).toThrow(z.ZodError);
});
```

### 3.6 Case 6: 枚举非法值 · 失败

```ts
test('captured_at_source 非法值 · 失败', () => {
  const input = {
    captured_at: '2026-08-22T14:23:00+09:00',
    captured_at_tz: 'Asia/Tokyo',
    captured_at_source: 'fallback_upload_time', // 已移除
    captured_at_confidence: 'high',
  };
  
  expect(() => CapturedAtFieldsSchema.parse(input)).toThrow(z.ZodError);
});
```

### 3.7 Case 7: 缺字段 · 失败

```ts
test('captured_at 缺 tz · 失败', () => {
  const input = {
    captured_at: '2026-08-22T14:23:00+09:00',
    // captured_at_tz 缺失
    captured_at_source: 'exif',
    captured_at_confidence: 'high',
  };
  
  expect(() => CapturedAtFieldsSchema.parse(input)).toThrow(z.ZodError);
});
```

### 3.8 Case 8: IANA timezone 非法格式 · 失败

```ts
test('captured_at_tz=JST（非 IANA） · 失败', () => {
  const input = {
    captured_at: '2026-08-22T14:23:00+09:00',
    captured_at_tz: 'JST', // 非 IANA 格式
    captured_at_source: 'exif',
    captured_at_confidence: 'high',
  };
  
  expect(() => CapturedAtFieldsSchema.parse(input)).toThrow(z.ZodError);
});
```

---

## §4 EXIF 解析单元测试（validateCapturedAtAgainstServerExif · 6 case）

> **文件路径**：`release-v1/backend/witness/__tests__/exif-validator.test.ts`（**新增**）

### 4.1 Case 1: 客户端 source=exif + 服务端 EXIF 完整 · 一致

```ts
test('客户端声称 exif + 服务端 DateTimeOriginal 一致 · 通过', async () => {
  const exifBuffer = Buffer.from(/* 真实带 EXIF 的 JPG */);
  
  const result = await validateCapturedAtAgainstServerExif(
    new Date('2026-08-22T14:23:00+09:00'),
    'exif',
    'Asia/Tokyo',
    exifBuffer,
  );
  
  expect(result.source).toBe('exif');
  expect(result.confidence).toBe('high'); // 有 OffsetTime
});
```

### 4.2 Case 2: 客户端 source=exif + 服务端 EXIF 解析失败 · 抛错

```ts
test('客户端声称 exif + 服务端无 EXIF · 抛 captured_at_source_mismatch', async () => {
  const noExifBuffer = Buffer.from(/* 无 EXIF 的 PNG */);
  
  await expect(
    validateCapturedAtAgainstServerExif(
      new Date('2026-08-22T14:23:00+09:00'),
      'exif',
      'Asia/Tokyo',
      noExifBuffer,
    ),
  ).rejects.toThrow(CapturedAtValidationError);
});
```

### 4.3 Case 3: 客户端与服务端 DateTimeOriginal 差异 > 1h · 抛错

```ts
test('客户端声称 14:23 · 服务端 EXIF 16:00 · 差异 1h+ · 抛错', async () => {
  // 服务端 EXIF 含 DateTimeOriginal=16:00
  const exifBuffer = Buffer.from(/* 带 DateTimeOriginal=16:00 的 JPG */);
  
  await expect(
    validateCapturedAtAgainstServerExif(
      new Date('2026-08-22T14:23:00+09:00'), // 客户端声称 14:23
      'exif',
      'Asia/Tokyo',
      exifBuffer,
    ),
  ).rejects.toThrow(CapturedAtValidationError);
});
```

### 4.4 Case 4: EXIF 有 DateTimeOriginal 但无 OffsetTime · confidence=medium

```ts
test('EXIF 仅有 DateTimeOriginal · 无 OffsetTime · confidence=medium', async () => {
  // 服务端 EXIF 仅 DateTimeOriginal=14:23:00（无 OffsetTime）
  const exifBuffer = Buffer.from(/* 仅有 DateTimeOriginal 的 JPG */);
  
  const result = await validateCapturedAtAgainstServerExif(
    new Date('2026-08-22T14:23:00Z'), // 客户端用 UTC
    'exif',
    'UTC',
    exifBuffer,
  );
  
  expect(result.source).toBe('exif');
  expect(result.confidence).toBe('medium');
});
```

### 4.5 Case 5: 客户端 source≠exif · 服务端不校验

```ts
test('客户端 source=user_confirmed · 服务端不读 EXIF · 通过', async () => {
  const result = await validateCapturedAtAgainstServerExif(
    new Date('2026-08-22T14:23:00+09:00'),
    'user_confirmed',
    'Asia/Tokyo',
    Buffer.from('any buffer'),
  );
  
  expect(result.source).toBe('user_confirmed');
  expect(result.confidence).toBe('manual');
});
```

### 4.6 Case 6: 服务端 GPS 字段不读取（隐私）

```ts
test('EXIF 含 GPS · 服务端不读取 GPS · 隐私 OK', async () => {
  // 服务端 EXIF 含 GPS（lat/lng）
  const exifBuffer = Buffer.from(/* 带 GPS 的 JPG */);
  
  // spy exifr.parse 验证未传 gps:true
  const parseSpy = jest.spyOn(exifr, 'parse');
  
  await validateCapturedAtAgainstServerExif(
    new Date('2026-08-22T14:23:00+09:00'),
    'exif',
    'Asia/Tokyo',
    exifBuffer,
  );
  
  expect(parseSpy).toHaveBeenCalledWith(
    expect.any(Buffer),
    expect.objectContaining({ gps: false }), // 关键：gps 不读取
  );
});
```

---

## §5 NOW 桶资格单元测试（isNowEligible · 5 case）

> **文件路径**：`release-v1/backend/daily-12/__tests__/now-eligibility.test.ts`（**新增** · E-P0-06）

### 5.1 Case 1: captured_at 在 24h 内 + confidence=high · NOW 桶

```ts
test('captured_at=1h 前 · confidence=high · NOW 桶', () => {
  const now = new Date('2026-08-22T10:30:00Z');
  const capturedAt = new Date('2026-08-22T09:30:00Z'); // 1h 前
  
  expect(
    isNowEligible({ capturedAt, confidence: 'high' }, now),
  ).toBe(true);
});
```

### 5.2 Case 2: captured_at 在 25h 前 · 不进 NOW 桶

```ts
test('captured_at=25h 前 · 不进 NOW 桶', () => {
  const now = new Date('2026-08-22T10:30:00Z');
  const capturedAt = new Date('2026-08-21T09:30:00Z'); // 25h 前
  
  expect(
    isNowEligible({ capturedAt, confidence: 'high' }, now),
  ).toBe(false);
});
```

### 5.3 Case 3: confidence=low · 默认不进 NOW 桶

```ts
test('captured_at=1h 前 · confidence=low · 默认不进 NOW', () => {
  const now = new Date('2026-08-22T10:30:00Z');
  const capturedAt = new Date('2026-08-22T09:30:00Z');
  
  expect(
    isNowEligible({ capturedAt, confidence: 'low' }, now),
  ).toBe(false);
});
```

### 5.4 Case 4: confidence=low + user_confirmed_submit=true · 进 NOW 桶

```ts
test('captured_at=1h 前 · confidence=low + user_confirmed_submit · 进 NOW', () => {
  const now = new Date('2026-08-22T10:30:00Z');
  const capturedAt = new Date('2026-08-22T09:30:00Z');
  
  expect(
    isNowEligible(
      { capturedAt, confidence: 'low', userConfirmedSubmit: true },
      now,
    ),
  ).toBe(true);
});
```

### 5.5 Case 5: confidence=manual + user_confirmed_submit=true · 进 NOW 桶

```ts
test('captured_at=1h 前 · confidence=manual + user_confirmed_submit · 进 NOW', () => {
  const now = new Date('2026-08-22T10:30:00Z');
  const capturedAt = new Date('2026-08-22T09:30:00Z');
  
  expect(
    isNowEligible(
      { capturedAt, confidence: 'manual', userConfirmedSubmit: true },
      now,
    ),
  ).toBe(true);
});
```

---

## §6 前端展示单元测试（formatCapturedAt · 4 case）

> **文件路径**：`src/lib/__tests__/format-captured-at.test.ts`（**新增** · Web / iOS 共享）

### 6.1 Case 1: formatCapturedAt · Tokyo tz · 中文

```ts
test('formatCapturedAt · Tokyo · 中文', () => {
  const display = formatCapturedAt({
    capturedAt: new Date('2026-08-19T14:23:00+09:00'),
    capturedAtTz: 'Asia/Tokyo',
    locale: 'zh-CN',
  });
  
  expect(display).toBe('拍摄于 2026/08/19 14:23 JST');
});
```

### 6.2 Case 2: formatCapturedAt · London tz · 英文

```ts
test('formatCapturedAt · London · 英文', () => {
  const display = formatCapturedAt({
    capturedAt: new Date('2026-08-19T14:23:00+01:00'),
    capturedAtTz: 'Europe/London',
    locale: 'en',
  });
  
  expect(display).toMatch(/^Captured at 2026\/08\/19 14:23/);
});
```

### 6.3 Case 3: formatPublishedAt · 缺席返回 null

```ts
test('formatPublishedAt · publishedAt=null · 返回 null', () => {
  expect(formatPublishedAt(null, 'zh-CN')).toBeNull();
  expect(formatPublishedAt(undefined, 'zh-CN')).toBeNull();
});
```

### 6.4 Case 4: formatThreeTimeDisplay · 三时间合并

```ts
test('formatThreeTimeDisplay · 合并三时间', () => {
  const display = formatThreeTimeDisplay({
    capturedAt: new Date('2026-08-19T14:23:00+09:00'),
    capturedAtTz: 'Asia/Tokyo',
    uploadedAt: new Date('2026-08-22T08:00:00Z'),
    publishedAt: new Date('2026-08-23T08:00:00Z'),
    locale: 'zh-CN',
  });
  
  expect(display.captured).toMatch(/拍摄于 2026\/08\/19 14:23/);
  expect(display.uploaded).toMatch(/上传于/);
  expect(display.published).toMatch(/公开于/);
});
```

---

## §7 集成测试场景（端到端 8 scenario）

> **文件路径**：`release-v1/e2e/__tests__/witness-captured-at-e2e.test.ts`（**新增** · E-P1-03 smoke suite）

### 7.1 Scenario 1: 完整 Witness 提交 happy path

```text
Step 1: POST /witness/submissions → 201 + submission_id
Step 2: POST /witness/submissions/:id/asset-upload-url → 201 + upload_url
Step 3: PUT upload_url + file (with EXIF) → 200
Step 4: POST /witness/submissions/:id/submit
        body: { captured_at: '...', captured_at_tz: '...', source: 'exif', confidence: 'high', ... }
        → 201 + submitted_at
Step 5: GET /witness/submissions/:id → 200 + status='submitted'
预期：全链路通过；captured_at 落库；NOW 桶候选。
```

### 7.2 Scenario 2: 截图提交（无 EXIF → user_confirmed + manual）

```text
Step 1: POST /witness/submissions → 201
Step 2: POST /witness/submissions/:id/asset-upload-url → 201
Step 3: PUT upload_url + PNG file (无 EXIF) → 200
Step 4: POST /witness/submissions/:id/submit
        body: { captured_at: '...', captured_at_tz: '...', source: 'user_confirmed', confidence: 'manual', ... }
        → 201
预期：服务端 EXIF reader 解析失败 → 降级到 user_confirmed + manual。
```

### 7.3 Scenario 3: EXIF 篡改（Photoshop · 服务端判定 confidence=low）

```text
Step 1: POST /witness/submissions → 201
Step 2: POST /witness/submissions/:id/asset-upload-url → 201
Step 3: PUT upload_url + JPG with Software='Adobe Photoshop' → 200
Step 4: POST /witness/submissions/:id/submit
        body: { ..., source: 'exif', confidence: 'low', ... }
        → 201 + 审核优先
预期：服务端检测到篡改标记；提交成功但进入审核优先队列。
```

### 7.4 Scenario 4: 未来时间 hard block

```text
Step 1: POST /witness/submissions → 201
Step 2: POST /witness/submissions/:id/asset-upload-url → 201
Step 3: PUT upload_url + file → 200
Step 4: POST /witness/submissions/:id/submit
        body: { captured_at: NOW + 10min, ..., source: 'camera', confidence: 'high', ... }
        → 400 captured_at_in_future
预期：服务端 hard block；客户端按钮 disabled（前置）。
```

### 7.5 Scenario 5: 重复上传幂等（client_key）

```text
Step 1: POST /witness/submissions
        header: Idempotency-Key: uuid-v4-1
        → 201 + submission_id=A
Step 2: POST /witness/submissions (同一 Idempotency-Key)
        → 200 (idempotent replay) + submission_id=A（同一 submission）
预期：重复创建不生成新 submission。
```

### 7.6 Scenario 6: 旧照片软警告

```text
Step 1: POST /witness/submissions → 201
Step 2: POST /witness/submissions/:id/asset-upload-url → 201
Step 3: PUT upload_url + file → 200
Step 4: POST /witness/submissions/:id/submit
        body: { captured_at: NOW - 45d, source: 'user_confirmed', confidence: 'manual', ... }
        → 201 + audit log
预期：服务端不阻塞；audit log 记录 old_photo_path。
```

### 7.7 Scenario 7: 跨时区提交（EXIF 无 tz）

```text
Step 1: POST /witness/submissions → 201
Step 2: POST /witness/submissions/:id/asset-upload-url → 201
Step 3: PUT upload_url + JPG (DateTimeOriginal=14:23, 无 OffsetTime) → 200
Step 4: POST /witness/submissions/:id/submit
        body: { captured_at: '2026-08-19T14:23:00Z', captured_at_tz: 'Asia/Tokyo', source: 'exif', confidence: 'medium', ... }
        → 201
预期：服务端接受；confidence=medium；前端显示"（推断时区）"。
```

### 7.8 Scenario 8: NOW 桶排序正确性（E-P0-06 联动）

```text
Setup: 插入 3 个 Moment：
  - M1: captured_at = NOW-1h, uploaded_at = NOW, confidence=high
  - M2: captured_at = NOW-25h, uploaded_at = NOW-24h, confidence=high
  - M3: captured_at = NOW-30d, uploaded_at = NOW-25h, confidence=manual + user_confirmed_submit=true

GET /api/editions/today
预期：
  - M1 进 NOW 桶
  - M2 不进 NOW 桶（> 24h）
  - M3 进 NOW 桶（user_confirmed_submit=true）
  - 排序：M1 在前，M3 在后（captured_at DESC）
  - **不按 uploaded_at 排序**（M3 uploaded_at 最早，但 captured_at 排序仍正确）
```

---

## §8 性能 / 边界测试（5 case）

### 8.1 Case 1: 1000 并发提交（性能）

```text
Setup: 模拟 1000 个并发 Witness 提交
预期：
  - 95% 请求 < 200ms
  - 0 个 5xx
  - 0 个重复 submission（幂等正确）
```

### 8.2 Case 2: 1 亿 Moment 的 NOW 桶查询（性能 · E-P0-06）

```text
Setup: 数据库 1 亿 Moment，captured_at 上有索引
SELECT * FROM moments
  WHERE captured_at > NOW() - INTERVAL '24 hours'
  ORDER BY captured_at DESC
  LIMIT 12;
预期：查询 < 50ms（p95）
```

### 8.3 Case 3: DST 边界（America/New_York 春进 2026-03-08 02:00）

```text
Setup: 提交 captured_at=2026-03-08T01:30:00-05:00（EST）
       uploaded_at=2026-03-08T07:00:00Z（EDT 后）
预期：
  - captured_at = 06:30 UTC
  - uploaded_at = 07:00 UTC
  - diff = 30 min
  - 不抛错
```

### 8.4 Case 4: DST 边界（America/New_York 秋退 2026-11-01 02:00）

```text
Setup: 提交 captured_at=2026-11-01T01:30:00-04:00（EDT）
       uploaded_at=2026-11-01T07:00:00Z（EST 后）
预期：
  - captured_at = 05:30 UTC
  - uploaded_at = 07:00 UTC
  - diff = 1h30min
  - 不抛错
```

### 8.5 Case 5: 闰秒 / 跨年边界（2026-12-31 23:59:60）

```text
Setup: 提交 captured_at=2026-12-31T23:59:60Z（理论闰秒）
       uploaded_at=2027-01-01T00:00:00Z
预期：
  - 服务端解析 Date.parse('2026-12-31T23:59:60Z') → 2027-01-01T00:00:00Z
  - captured_at 等于 uploaded_at
  - diff = 0
  - 不抛错（但前端 UI 应提示"日期异常"）
```

---

## §9 自验收

| # | 验收项 | 状态 | 证据 |
|---|---|:---:|---|
| 1 | 覆盖所有 5 类异常（无 EXIF / 不可信 / 跨时区 / 旧照片 / 未来时间） | ✅ | §2 / §3 / §4 / §7 |
| 2 | 覆盖重复上传幂等（client_key） | ✅ | §7.5 |
| 3 | NOW 排序正确性测试（E-P0-06 联动） | ✅ | §5 / §7.8 |
| 4 | DST / 跨年 / 跨时区边界 | ✅ | §2.10-§2.12 / §8.3-§8.5 |
| 5 | 性能测试（1000 并发 + 1 亿 Moment 查询） | ✅ | §8.1 / §8.2 |
| 6 | 前端展示单元测试 | ✅ | §6 |
| 7 | 与 E-P0-09 错误码字典对齐（captured_at_in_future 等） | ✅ | §2.3 / §3.3 / §3.4 / §3.5 |
| 8 | 与 E-P1-03 smoke suite 集成 | ✅ | §7 |
| 9 | 与 D-P0-02 §EXIF 14 子状态对齐（截图 / 二次保存 / 无元数据图） | ✅ | §7.2 / §7.3 |
| 10 | 审计 / 边界 / 性能均覆盖 | ✅ | §8 |

---

**End of test-cases-v1.md · E-P0-04 子产物 6/6**
