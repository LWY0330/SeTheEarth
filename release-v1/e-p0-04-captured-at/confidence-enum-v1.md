---
title: SEE EARTH V1 · captured_at_confidence 枚举与判定规则 · v1
type: design-spec
tags: [release-v1, engineering, e-p0-04, captured-at, confidence-enum, see-earth]
task_id: E-P0-04
brief_anchor: §5 E-P0-04 / 任务卡 §B
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
  - ./edge-cases-v1.md
  - ./validation-v1.md
  - ./test-cases-v1.md
  - ../../../Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/api-contract/zod-schemas/common.ts (§CapturedAtConfidenceSchema)
  - ../../../Obsidian Vault/项目/看见地球 设计/07-设计师设计参考/release-v1/minimal-witness/api-field-mapping-v1.md (§4 captured_at_confidence)
  - ../../../Obsidian Vault/项目/看见地球 设计/07-设计师设计参考/release-v1/minimal-witness/state-matrix-v1.md (§EXIF 14 子状态)
depends_on: [E-P0-01 (✓ ACCEPTED), E-P0-09 (LOCKED ✓)]
blocks: [E-P0-03 Minimal Witness Backend]
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/e-p0-04-captured-at/confidence-enum-v1.md
workspace_canonical_path: /Users/lwy/Documents/ChatGPT/看见地球/release-v1/e-p0-04-captured-at/confidence-enum-v1.md
---

# SEE EARTH V1 · captured_at_confidence 枚举与判定规则 · v1

> **作者**：Engineer Agent #5（外部 Owner = 您）
> **目标读者**：E-P0-03 Witness Backend Owner · Web / iOS 工程师 · E-P0-09 Contract Owner · QA
> **目的**：定义 `captured_at_confidence` 的 4 个枚举值、判定规则、客户端 / 服务端逻辑，以及在 NOW 桶 / 公共 API 中的暴露策略。
> **核心原则**（来自任务卡 §B + Brief §5 E-P0-04）：
> 1. **`confidence` 与 `source` 是 2 个独立维度**——同 source 可对应不同 confidence（如 `exif` 可对应 `high / medium / low`）。
> 2. **`low` 和 `manual` 触发前端警告**——不阻塞提交，但 UI 必须明确标识。
> 3. **公共 API 保留 `confidence` 字段**（不脱敏）——Editorial / Witness 透明度。

---

## 0. 阅读指南

- **§1 4 个枚举值速览**
- **§2 判定规则**（每个 confidence 的精确触发）
- **§3 客户端 + 服务端判定逻辑**
- **§4 confidence × 公共 API 暴露策略**
- **§5 confidence × NOW 桶资格**
- **§6 强制约束（DO NOT）**
- **§7 自验收**

---

## §1 4 个枚举值速览

```ts
enum CapturedAtConfidence {
  high = 'high',       // EXIF 完整 + 时区明确
  medium = 'medium',   // EXIF 完整但时区推断
  low = 'low',         // EXIF 不可信（mtime 冲突 / 篡改标记）
  manual = 'manual',   // 用户输入
}
```

| confidence | 触发条件 | UI 表现 | NOW 桶资格 |
|---|---|---|:---:|
| **`high`** | EXIF DateTimeOriginal + OffsetTime 完整；无 mtime 冲突；无篡改标记 | 正常显示"拍摄于 X" | ✅ |
| **`medium`** | EXIF 完整但时区推断（如 EXIF 无 OffsetTime，仅有 DateTimeOriginal） | 显示"拍摄于 X（推断时区）" | ✅ |
| **`low`** | mtime 冲突 > 24h / 篡改标记（Photoshop / GIMP 等） | 警告"这张照片的时间不准确，请确认" | ⚠️（需用户确认） |
| **`manual`** | `source = user_confirmed`（用户主动输入） | 显示"拍摄于 X（你输入的时间）" | ⚠️（需用户确认） |

> **V1 移除** `untrusted`（与任务卡 §B 一致；详见 three-time-semantics-v1.md §7.3.2 冲突处理）。

---

## §2 判定规则

### 2.1 `high`（EXIF 完整 + 时区明确）

**触发条件**（**全部满足**）：

1. `source = 'exif'` 或 `'camera'`
2. EXIF `DateTimeOriginal` 完整可解析
3. EXIF `OffsetTime`（或 `OffsetTimeOriginal`）明确（如 `+09:00`）**或** 移动端 `camera` 路径已知 tz
4. 无 mtime 冲突（差异 ≤ 24h）
5. 无篡改标记

**客户端判定伪代码**：

```ts
function isHighConfidence(exif: ExifData, capturedAt: Date, file: File): boolean {
  if (!exif?.DateTimeOriginal) return false;
  
  const hasOffsetTime = !!exif.OffsetTime || !!exif.OffsetTimeOriginal;
  if (!hasOffsetTime) return false; // 降级到 medium
  
  const mtimeDiff = Math.abs(file.lastModified - exif.DateTimeOriginal.getTime());
  if (mtimeDiff > 24 * 60 * 60 * 1000) return false; // 降级到 low
  
  if (hasTamperedMarker(exif)) return false; // 降级到 low
  
  return true;
}
```

### 2.2 `medium`（EXIF 完整但时区推断）

**触发条件**（**全部满足**）：

1. `source = 'exif'`
2. EXIF `DateTimeOriginal` 完整可解析
3. EXIF **无** `OffsetTime` / `OffsetTimeOriginal`（仅有 local time，无 UTC offset）
4. 无 mtime 冲突；无篡改标记

**推断逻辑**：默认按浏览器本地 tz 反查（如用户在 Tokyo 浏览器访问，则 EXIF 时间默认 JST）；客户端必须提示用户确认。

```ts
function isMediumConfidence(exif: ExifData): boolean {
  if (!exif?.DateTimeOriginal) return false;
  if (exif.OffsetTime || exif.OffsetTimeOriginal) return false; // 有 tz 走 high
  
  // 仅有时区推断：medium
  return true;
}
```

**前端 UI**（D-P0-02 copy-final §2.3）：

```
我们读取了照片里的拍摄时间，但没读到时区。
默认按 [Asia/Tokyo] 推断。如果不对，请调整。
[日期] [时间] [时区下拉]
[确认] [手动调整]
```

### 2.3 `low`（EXIF 不可信 · mtime 冲突 / 篡改标记）

**触发条件**（**任一满足**）：

1. **mtime 冲突**：文件 mtime 与 EXIF DateTimeOriginal 差异 > 24h。
2. **篡改标记**：EXIF `Software` / `ProcessingSoftware` 包含已知编辑软件。
3. EXIF `HistoryAction` 包含 "edited" / "modified"。
4. 服务端 EXIF reader 解析失败但客户端声明 `source = 'exif'`（见 source-enum §4.1）。

**判定伪代码**：

```ts
function isLowConfidence(exif: ExifData, file: File): boolean {
  if (!exif?.DateTimeOriginal) return false;
  
  // mtime 冲突
  const mtimeDiff = Math.abs(file.lastModified - exif.DateTimeOriginal.getTime());
  if (mtimeDiff > 24 * 60 * 60 * 1000) return true;
  
  // 篡改标记
  const TAMPERED = [/photoshop/i, /gimp/i, /affinity/i, /lightroom/i, /capture one/i];
  if (exif.Software && TAMPERED.some(p => p.test(exif.Software))) return true;
  if (exif.ProcessingSoftware) return true;
  if (exif.HistoryAction?.includes?.('edited')) return true;
  
  return false;
}
```

**前端 UI**（D-P0-02 copy-final §2.2）：

```
这张照片的时间不准确。
检测到：[mtime 与拍摄时间相差 X 天 / 使用了编辑软件修改]。
请确认实际拍摄时间，或继续提交但标注为"时间不确定"。
[日期] [时间] [时区下拉]
[确认提交] [取消]
```

**服务端行为**：接受提交（不 hard block），但 `confidence = low` 标记 + 强制进入审核队列（moderator 优先审核）。

### 2.4 `manual`（用户输入）

**触发条件**：仅当 `source = 'user_confirmed'`。

**强制行为**：

- 客户端必须弹窗让用户**主动输入**日期/时间/时区。
- 服务端二次校验：必须含完整 4 字段（captured_at / tz / source / confidence）；缺失任一字段 → 400。

**前端 UI**（D-P0-02 copy-final §2.4）：

```
照片里没有时间信息。
请告诉我们这是什么时候拍的：
[日期选择器] [时间选择器] [时区下拉]
[确认]
```

> **强制规则**：禁止前端自动用 NOW() 填充；禁止自动 fallback 到 `uploaded_at`。

### 2.5 判定优先级

当多条件同时命中时，**降级**到最低 confidence：

```text
high（全部满足）→ medium → low → manual（强制用户输入）
```

| 命中顺序 | 判定 |
|---|---|
| EXIF 完整 + 有 tz + 无冲突 + 无篡改 | `high` |
| EXIF 完整 + 无 tz + 无冲突 + 无篡改 | `medium` |
| EXIF 完整 + 有冲突 / 有篡改 | `low` |
| 无 EXIF | `manual`（强制用户输入） |

---

## §3 客户端 + 服务端判定逻辑

### 3.1 客户端流程（Web + iOS 一致）

```text
[读取 EXIF]
   ↓
EXIF 完整？
   ├─ No  → 强制弹窗（user_confirmed + manual）
   │
   └─ Yes → EXIF 有 OffsetTime？
              ├─ No  → confidence = medium（提示用户确认 tz）
              └─ Yes → mtime 冲突 / 篡改？
                        ├─ Yes → confidence = low（警告用户）
                        └─ No  → confidence = high
```

### 3.2 服务端二次校验

```ts
async function validateConfidenceOnServer(
  submission: WitnessSubmission,
  asset: Asset,
): Promise<CapturedAtConfidence> {
  const { captured_at, captured_at_source, captured_at_confidence } = submission;
  
  // 1. source = user_confirmed → confidence 必须是 manual
  if (captured_at_source === 'user_confirmed' && captured_at_confidence !== 'manual') {
    throw new Error('CAPTURED_AT_CONFIDENCE_USER_CONFIRMED_MUST_BE_MANUAL');
  }
  
  // 2. confidence = manual → source 必须是 user_confirmed
  if (captured_at_confidence === 'manual' && captured_at_source !== 'user_confirmed') {
    throw new Error('CAPTURED_AT_CONFIDENCE_MANUAL_REQUIRES_USER_CONFIRMED');
  }
  
  // 3. 服务端 EXIF 反查交叉验证
  if (captured_at_source === 'exif') {
    const serverExif = await readExifFromAsset(asset);
    if (!serverExif?.DateTimeOriginal) {
      // 客户端声称 exif 但服务端解析不到 → 降级
      throw new Error('CAPTURED_AT_CONFIDENCE_EXIF_MISMATCH_SERVER_PARSE_FAILED');
    }
    
    // 服务端二次判定 confidence
    const serverConfidence = computeConfidenceFromExif(serverExif, asset);
    if (serverConfidence !== captured_at_confidence) {
      // 服务端判定与客户端不一致 → 接受服务端结果 + audit log
      logAudit('confidence_mismatch', {
        client: captured_at_confidence,
        server: serverConfidence,
        submission_id: submission.id,
      });
      return serverConfidence;
    }
  }
  
  return captured_at_confidence;
}
```

### 3.3 错误码（待 E-P0-09 锁）

| error_code | HTTP | 含义 | 前端处理 |
|---|---|---|---|
| `captured_at_confidence_user_confirmed_must_be_manual` | 400 | source=user_confirmed 但 confidence 不是 manual | 强制重提交 |
| `captured_at_confidence_manual_requires_user_confirmed` | 400 | confidence=manual 但 source 不是 user_confirmed | 强制重提交 |
| `captured_at_confidence_exif_mismatch` | 400 | 客户端 exif 但服务端解析失败 | 强制回到段 2 |

---

## §4 confidence × 公共 API 暴露策略

### 4.1 公共字段保留

`confidence` 是**透明度字段**——公共 API（`PublicMoment`）**必须保留** `captured_at_confidence` 字段。

**理由**：Observer 看到 Moment 时需要知道"这个时间是拍摄者确认的还是推断的"——这是数据可信度的核心。

### 4.2 公共 API 暴露策略

| confidence | 公共 API 暴露 | 前端 UI |
|---|:---:|---|
| `high` | ✅ 显示 | 无标记 |
| `medium` | ✅ 显示 | "（推断时区）" 小字 |
| `low` | ✅ 显示 | ⚠️ 警告角标 + "时间不确定" 文案 |
| `manual` | ✅ 显示 | "（用户输入）" 小字 |

### 4.3 隐私边界（与 E-P0-05 一致）

- ❌ **不暴露** mtime / EXIF `Software` / `HistoryAction` 等内部元数据。
- ✅ 仅暴露 `confidence` 枚举值（让 Observer 知道可信度等级）。
- ✅ 触发 `low` 的具体原因（mtime / 篡改）**仅**在审核员后台可见（详见 E-P0-05 §audit-log）。

---

## §5 confidence × NOW 桶资格

### 5.1 NOW 桶资格矩阵

| confidence | NOW 桶 | TODAY 桶 | PAST 桶 |
|---|:---:|:---:|:---:|
| `high` | ✅ | ✅ | ✅ |
| `medium` | ✅ | ✅ | ✅ |
| `low` | ⚠️ | ✅ | ✅ |
| `manual` | ⚠️ | ✅ | ✅ |

> **说明**：⚠️ 需 Witness 在段 5 公开预览**主动确认**提交；服务端不做额外校验。

### 5.2 Editorial 内容不受 confidence 限制

Editorial / Seed 内容的 `confidence` 通常是 `high` 或 `medium`（由 PM 在 seed 时设置）；不受 Witness 路径限制。

### 5.3 公共 NOW 桶 SQL（参考）

```sql
-- E-P0-06 Daily 12 Supply Chain 使用
SELECT * FROM moments
WHERE moderation_status = 'approved'
  AND captured_at > NOW() - INTERVAL '24 hours'
  AND captured_at_confidence IN ('high', 'medium')  -- 默认排除 low / manual
  -- OR (captured_at_confidence IN ('low', 'manual') AND user_confirmed_submit = true)
ORDER BY captured_at DESC
LIMIT 12;
```

> **注**：`low` 和 `manual` 默认**不进入 NOW 桶**，但 Witness 在段 5 主动确认后**可进入**（记录 `user_confirmed_submit = true` 字段；详见 E-P0-06 eligibility-v1.md）。

---

## §6 强制约束（DO NOT）

| 约束 | 理由 |
|---|---|
| ❌ **禁止**客户端自动判定为 `high` 但服务端 EXIF 缺失 | 服务端必须二次校验 |
| � **禁止** `source = user_confirmed` 时 confidence ≠ `manual` | 强制配对 |
| ❌ **禁止** `confidence = manual` 但 source ≠ `user_confirmed` | 强制配对 |
| ❌ **禁止**前端在用户未输入时提交 `manual` confidence | 必须弹窗 |
| ❌ **禁止**公共 API 脱敏 `confidence` 字段 | Observer 需要可信度透明度 |
| ❌ **禁止**埋点 / Analytics payload 携带 confidence 字段值以外的精确 EXIF 数据 | 仅携带枚举值 |

---

## §7 自验收

| # | 验收项 | 状态 | 证据 |
|---|---|:---:|---|
| 1 | 4 个 confidence 枚举定义（high / medium / low / manual） | ✅ | §1 |
| 2 | 每个 confidence 的判定规则明确 | ✅ | §2.1-§2.4 |
| 3 | 客户端 + 服务端判定逻辑 | ✅ | §3.1 / §3.2 |
| 4 | 与 source 的正交关系明确 | ✅ | source-enum §5 + 本卡 §2.5 优先级 |
| 5 | 公共 API 保留 confidence 字段（不脱敏） | ✅ | §4.1 |
| 6 | NOW 桶资格矩阵 | ✅ | §5.1 |
| 7 | 与 E-P0-09 CapturedAtConfidenceSchema 对齐 + 冲突标注（移除 untrusted） | ✅ | §1 + three-time §7.3.2 |
| 8 | 与 D-P0-02 §EXIF 14 子状态对齐 | ✅ | §2.2 / §2.3 / §2.4 |
| 9 | 强制约束（DO NOT）明确 | ✅ | §6 |
| 10 | 错误码与 E-P0-09 错误码字典对齐 | ✅ | §3.3 |

---

**End of confidence-enum-v1.md · E-P0-04 子产物 3/6**
