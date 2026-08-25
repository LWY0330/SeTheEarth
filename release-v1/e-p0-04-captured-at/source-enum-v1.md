---
title: SEE EARTH V1 · captured_at_source 枚举与触发逻辑 · v1
type: design-spec
tags: [release-v1, engineering, e-p0-04, captured-at, source-enum, see-earth]
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
  - ./confidence-enum-v1.md
  - ./edge-cases-v1.md
  - ./validation-v1.md
  - ./test-cases-v1.md
  - ../../../Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/api-contract/zod-schemas/common.ts (§CapturedAtSourceSchema)
  - ../../../Obsidian Vault/项目/看见地球 设计/07-设计师设计参考/release-v1/minimal-witness/api-field-mapping-v1.md (§4 captured_at_source)
  - ../../../Obsidian Vault/项目/看见地球 设计/07-设计师设计参考/release-v1/minimal-witness/state-matrix-v1.md (§EXIF 14 子状态)
depends_on: [E-P0-01 (✓ ACCEPTED), E-P0-09 (LOCKED ✓)]
blocks: [E-P0-03 Minimal Witness Backend]
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/e-p0-04-captured-at/source-enum-v1.md
workspace_canonical_path: /Users/lwy/Documents/ChatGPT/看见地球/release-v1/e-p0-04-captured-at/source-enum-v1.md
---

# SEE EARTH V1 · captured_at_source 枚举与触发逻辑 · v1

> **作者**：Engineer Agent #5（外部 Owner = 您）
> **目标读者**：E-P0-03 Witness Backend Owner · Web / iOS 工程师 · E-P0-09 Contract Owner · QA
> **目的**：定义 `captured_at` 的 4 个 source 枚举值、触发条件、客户端判定逻辑与服务端校验路径。
> **核心原则**（来自任务卡 §B + Brief §5 E-P0-04）：
> 1. **每个 Witness submission 必须带 `captured_at_source`**——禁止静默 fallback 到 `uploaded_at`。
> 2. **`source` 与 `confidence` 是 2 个独立维度**（详见 `confidence-enum-v1.md`）。
> 3. **服务端二次校验**：客户端声明 source 后，服务端用图片 hash + EXIF 反查交叉验证。

---

## 0. 阅读指南

- **§1 4 个枚举值速览**
- **§2 触发条件详解**（每个 source 的判定规则）
- **§3 客户端判定逻辑**（Web + iOS）
- **§4 服务端校验逻辑**
- **§5 source → confidence 推荐映射**
- **§6 强制约束（DO NOT）**
- **§7 自验收**

---

## §1 4 个枚举值速览

```ts
enum CapturedAtSource {
  exif = 'exif',                     // EXIF DateTimeOriginal 可信
  camera = 'camera',                 // 系统相机（移动端）
  user_confirmed = 'user_confirmed', // 用户手动确认
  admin = 'admin',                   // PM 修正
}
```

| source | 触发场景 | 客户端来源 | 典型 confidence |
|---|---|---|---|
| **`exif`** | 照片自带 EXIF DateTimeOriginal + OffsetTime 完整可解析 | 相册选图 / 拖拽上传 | high / medium / low |
| **`camera`** | iOS/Android 系统相机拍摄（无 EXIF） | `UIImagePickerController` / `navigator.mediaDevices` | high |
| **`user_confirmed`** | 无 EXIF / EXIF 不可信 / 跨时区无 tz / 截图 / 二次保存 | 用户主动输入日期/时间/时区 | manual |
| **`admin`** | PM 后台修正已知错误数据 | 后台管理界面（moderator） | high / medium |

> **V1 移除** `fallback_upload_time`（与任务卡 §B 一致；详见 three-time-semantics-v1.md §7.3.1 冲突处理）。

---

## §2 触发条件详解

### 2.1 `exif`（EXIF DateTimeOriginal 可信）

**触发条件**（**全部满足**）：

1. 客户端 EXIF reader（Web: `exifr` · iOS: `ImageIO`）能解析 `DateTimeOriginal` 字段。
2. `DateTimeOriginal` 格式为合法 EXIF datetime（`YYYY:MM:DD HH:MM:SS`）。
3. 不命中 §6 "EXIF 不可信" 任何标记（见 confidence-enum-v1.md §2.3）。

**客户端判定伪代码**（Web）：

```ts
async function detectExifSource(file: File): Promise<CapturedAtSource> {
  const exif = await exifr.parse(file, {
    pick: ['DateTimeOriginal', 'OffsetTime', 'ModifyDate', 'CreateDate']
  });
  
  if (exif?.DateTimeOriginal) {
    // 检查 mtime 冲突（§2.1.1）与篡改标记（§2.1.2）
    if (await hasMtimeConflict(file, exif.DateTimeOriginal)) {
      return 'user_confirmed'; // 强制用户确认（confidence=low）
    }
    if (await hasTamperedMarker(file)) {
      return 'user_confirmed'; // 强制用户确认（confidence=low）
    }
    return 'exif';
  }
  
  return null; // 进入 fallback 路径
}
```

#### 2.1.1 mtime 冲突检测

文件 mtime（修改时间）与 EXIF DateTimeOriginal 差异 > 24h，**视为 EXIF 不可信**：

```ts
async function hasMtimeConflict(file: File, exifTime: Date): Promise<boolean> {
  const mtime = new Date(file.lastModified);
  const diffMs = Math.abs(mtime.getTime() - exifTime.getTime());
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays > 1; // > 24h
}
```

> **理由**：截图 / 二次保存会改变 mtime；差异过大说明照片被处理过。

#### 2.1.2 篡改标记检测

EXIF 中包含以下字段之一 → **视为 EXIF 篡改**：

- `Software` 包含 "Photoshop" / "GIMP" / "Affinity" 等编辑软件
- `ProcessingSoftware` 不为空
- `History` / `HistoryAction` 包含 "edited" / "modified"

```ts
const TAMPERED_SOFTWARE_PATTERNS = [
  /photoshop/i,
  /gimp/i,
  /affinity/i,
  /lightroom/i,
  /capture one/i,
];

async function hasTamperedMarker(file: File): Promise<boolean> {
  const exif = await exifr.parse(file, {
    pick: ['Software', 'ProcessingSoftware', 'History', 'HistoryAction']
  });
  
  if (exif?.Software && TAMPERED_SOFTWARE_PATTERNS.some(p => p.test(exif.Software))) {
    return true;
  }
  if (exif?.ProcessingSoftware) return true;
  if (exif?.HistoryAction?.includes?.('edited')) return true;
  return false;
}
```

> **注意**：V1 仅做"标记 + 警告"，**不自动拒收**；前端展示警告让用户确认（详见 edge-cases-v1.md §2）。

### 2.2 `camera`（系统相机 · 移动端）

**触发条件**（**全部满足**）：

1. Witness 使用 iOS/Android 系统相机拍摄（**非**相册选图）。
2. 拍摄时设备时间可信（设备时间已同步 NTP）。
3. 照片 EXIF 被客户端预先剥离（前端必须 `exif_stripped = true` 上传，详见 api-field-mapping §4）。

**客户端判定伪代码**（iOS）：

```swift
// UIImagePickerController sourceType == .camera
// PHPickerViewController 不支持 camera，仅支持 photo_library
func detectCameraSource(pickerSource: PHPickerResult) -> CapturedAtSource {
  // PHPicker 不区分 camera vs library；iOS 端通过 UIImagePickerController 区分
  if pickerSource is UIImagePickerController {
    return .camera
  }
  // PHPicker → 默认 photo_library → 走 exif 路径
  return .exif  // 或 .user_confirmed（若 exif 不可信）
}
```

**客户端判定伪代码**（Web）：

```ts
// Web 通过 <input capture="environment"> 区分
function detectCameraSource(input: HTMLInputElement): CapturedAtSource | null {
  // capture="environment" = 相机；capture 无属性或 user = 相册
  if (input.getAttribute('capture') === 'environment') {
    return 'camera';
  }
  return null; // 相册路径走 exif 解析
}
```

> **Web 限制**：浏览器 `<input type="file" capture>` 仅在移动端有效；桌面端 fallback 到 `photo_library` 路径。

### 2.3 `user_confirmed`（用户手动确认）

**触发条件**（**任一满足**）：

1. 客户端 EXIF reader 无法解析 DateTimeOriginal（无 EXIF：截图 / 二次保存 / 无元数据图）。
2. EXIF 触发 mtime 冲突（§2.1.1）或篡改标记（§2.1.2），用户**主动确认**使用原 EXIF 时间。
3. EXIF 有时间但无 tz（跨时区），用户**主动确认**使用 UTC 默认或选择时区。
4. 旧照片（captured_at > 30 天），用户**主动确认**仍提交。
5. 用户在段 2（时间确认）手动编辑了时间（无论 EXIF 是否可信）。

**强制行为**：客户端必须弹出日期/时间/时区选择器；**禁止**前端自动用 NOW() 填充冒充拍摄时间。

```ts
// 触发 user_confirmed 的强制路径
async function mustUserConfirm(reason: UserConfirmReason): Promise<void> {
  // reason: 'no_exif' | 'mtime_conflict' | 'tampered' | 'no_tz' | 'old_photo'
  // 1. 显示警告文案（见 D-P0-02 copy-final §2.2）
  // 2. 弹出日期/时间/时区选择器（不可跳过）
  // 3. 用户点"确认" → 写入 captured_at + source = 'user_confirmed'
}
```

### 2.4 `admin`（PM 修正）

**触发场景**（**仅后台 moderator 界面**）：

1. PM 发现已发布 Moment 的 `captured_at` 错误（如 Editorial 内容被错误标记为 NOW 桶）。
2. PM 修正后写入新 `captured_at` + `source = 'admin'`。
3. 后台**必须**记录 audit log（详见 E-P0-05 audit-log-v1.md）。

**强制规则**：

- ❌ **禁止**客户端使用 `admin` source（仅后台）。
- ✅ 仅 `POST /api/admin/witness/submissions/:id/decision` 或 `PATCH /api/admin/moments/:id` 可写入。
- ✅ 必须 audit log（含 before / after `captured_at` + 操作者 + 时间）。

---

## §3 客户端判定逻辑

### 3.1 判定流程（Web + iOS 一致）

```text
[用户选图 / 拍图]
   ↓
[读取 EXIF]
   ↓
EXIF 完整 + 无篡改？
   ├─ Yes → source = 'exif'
   │         ↓
   │     EXIF 有 tz？
   │         ├─ Yes → confidence = 'high'
   │         └─ No  → confidence = 'medium'（默认 UTC + 提示用户确认）
   │
   └─ No  → source = 'user_confirmed'
             ↓
         强制弹出日期/时间/时区选择器
             ↓
         用户确认 → confidence = 'manual'
         
[客户端来源：camera / photo_library]
   ├─ camera → source = 'camera' (confidence = 'high')
   └─ photo_library → 进入 EXIF 读取
```

### 3.2 客户端字段发送

Witness POST `/api/witness/submissions/:id/submit` 必须发送：

```json
{
  "captured_at": "2026-08-19T14:23:00+09:00",
  "captured_at_tz": "Asia/Tokyo",
  "captured_at_source": "exif" | "camera" | "user_confirmed",
  "captured_at_confidence": "high" | "medium" | "low" | "manual"
}
```

> **强制**：4 字段必须同时存在；服务端 Zod 校验失败 → 400 `validation_failed`。

### 3.3 iOS 端 PHPicker 注意点

iOS 17+ PHPicker 不返回 EXIF 元数据；EXIF 必须由客户端从 `UIImage` 重新解析：

```swift
func extractExif(from image: UIImage) -> [String: Any]? {
  guard let data = image.jpegData(compressionQuality: 1.0),
        let source = CGImageSourceCreateWithData(data, nil),
        let props = CGImageSourceCopyPropertiesAtIndex(source, 0, nil) as? [String: Any]
  else { return nil }
  
  let exif = props[kCGImagePropertyExifDictionary as String] as? [String: Any]
  return exif
}
```

> 若 EXIF 不存在 → source 自动为 `user_confirmed`，强制用户输入。

---

## §4 服务端校验逻辑

### 4.1 服务端二次校验

服务端**不信任**客户端声明的 source/confidence；必须做交叉验证：

```ts
async function validateCapturedAtSourceOnServer(
  submission: WitnessSubmission,
  asset: Asset,
): Promise<void> {
  const { captured_at, captured_at_source, captured_at_confidence } = submission;
  
  // 1. source = exif 但服务端 EXIF reader 解析失败 → 强制降级到 user_confirmed
  if (captured_at_source === 'exif') {
    const serverExif = await readExifFromAsset(asset);
    if (!serverExif?.DateTimeOriginal) {
      throw new Error('CAPTURED_AT_SOURCE_MISMATCH_EXIF_MISSING');
    }
    
    // 2. EXIF DateTimeOriginal 与客户端声称的 captured_at 差异 > 1h → 降级
    const exifTime = parseExifDateTime(serverExif.DateTimeOriginal);
    const claimedTime = new Date(captured_at);
    const diffMs = Math.abs(exifTime.getTime() - claimedTime.getTime());
    if (diffMs > 60 * 60 * 1000) { // 1h
      throw new Error('CAPTURED_AT_SOURCE_MISMATCH_EXIF_TIME_DIFF');
    }
  }
  
  // 3. source = camera 但 mime_type 来自 photo_library → 异常
  // （服务端无法直接验证；只能通过其他信号如客户端 user_agent_class）
  
  // 4. source = user_confirmed + confidence = manual 必须由前端日期选择器触发
  // （服务端通过 rate_limit + 异常检测间接验证）
  
  // 5. source = admin 仅允许后台 endpoint
  if (captured_at_source === 'admin') {
    throw new Error('CAPTURED_AT_SOURCE_ADMIN_FORBIDDEN_PUBLIC');
  }
}
```

### 4.2 错误码（待 E-P0-09 锁）

| error_code | HTTP | 含义 | 前端处理 |
|---|---|---|---|
| `captured_at_source_mismatch` | 400 | 客户端 source 与服务端 EXIF 不匹配 | 强制重新提交（回到段 2） |
| `captured_at_source_admin_forbidden` | 400 | 客户端尝试发送 source=admin | 服务端日志告警 + 拒绝 |
| `captured_at_source_invalid` | 400 | source 字段不在枚举值内 | 提示用户重试 |

### 4.3 服务端 EXIF 解析

服务端必须用 EXIF reader（推荐 `exiftool` 或 `exifr` Node 库）解析每个 asset；解析失败视为无 EXIF。

```ts
import exifr from 'exifr';

async function readExifFromAsset(asset: Asset): Promise<ExifData | null> {
  const buffer = await getAssetBuffer(asset);
  try {
    const exif = await exifr.parse(buffer, {
      tiff: true,
      exif: true,
      gps: false, // 服务端不读取 GPS（privacy）
    });
    return exif;
  } catch (e) {
    return null;
  }
}
```

> **Privacy**：服务端 EXIF reader **不读取 GPS 字段**（与 E-P0-05 隔离原则一致）。

---

## §5 source → confidence 推荐映射

> **source 与 confidence 是正交维度**：source 描述"时间从哪来"，confidence 描述"时间有多可信"。

| source | 推荐 confidence | 备注 |
|---|---|---|
| `exif` | `high` | EXIF 完整 + 时区明确 |
| `exif` | `medium` | EXIF 完整但时区推断 |
| `exif` | `low` | EXIF 不可信（mtime 冲突 / 篡改标记） |
| `camera` | `high` | 移动端设备时间可信 |
| `user_confirmed` | `manual` | 用户主动输入 |
| `admin` | `high` / `medium` | PM 修正（取决于修正依据） |

详见 `confidence-enum-v1.md` §2.3 confidence 判定规则。

---

## §6 强制约束（DO NOT）

| 约束 | 理由 |
|---|---|
| ❌ **禁止**服务端静默 fallback 到 `uploaded_at` | 会导致 NOW 排序错误（30 天前的旧照片冒充 NOW） |
| ❌ **禁止**客户端自动用 NOW() 填充 `captured_at` | 违反 V1 数据可信度原则 |
| ❌ **禁止**客户端发送 `source = 'admin'` | 仅后台 moderator 可用 |
| ❌ **禁止**服务端 EXIF reader 读取 GPS | 与 E-P0-05 位置隔离冲突 |
| ❌ **禁止**埋点 / Analytics payload 携带 `captured_at_source` 字段值以外的精确 timestamp | 仅携带 source 枚举即可 |
| ❌ **禁止**前端在不弹窗的情况下直接提交 `user_confirmed` | 用户必须主动输入日期/时间 |

---

## §7 自验收

| # | 验收项 | 状态 | 证据 |
|---|---|:---:|---|
| 1 | 4 个 source 枚举定义 | ✅ | §1 |
| 2 | 每个 source 的触发条件明确 | ✅ | §2.1-§2.4 |
| 3 | 客户端判定流程（Web + iOS） | ✅ | §3.1 |
| 4 | 服务端二次校验（防客户端伪造） | ✅ | §4.1 |
| 5 | mtime 冲突检测 + 篡改标记检测 | ✅ | §2.1.1 / §2.1.2 |
| 6 | source → confidence 推荐映射 | ✅ | §5 |
| 7 | 与 E-P0-09 CapturedAtSourceSchema 对齐 + 冲突标注 | ✅ | §1 + three-time §7.3.1 |
| 8 | 不引入新依赖（用 exifr / ImageIO / CGImageSource） | ✅ | §3.3 / §4.3 |
| 9 | 强制约束（DO NOT）明确 | ✅ | §6 |
| 10 | 与 D-P0-02 §EXIF 14 子状态对齐（截图 / 二次保存 / 无元数据图） | ✅ | §2.3 |
| 11 | 与 api-field-mapping §4 captured_at_source 对齐 | ✅ | §3.2 |

---

**End of source-enum-v1.md · E-P0-04 子产物 2/6**
