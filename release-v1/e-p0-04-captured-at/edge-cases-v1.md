---
title: SEE EARTH V1 · captured_at 5 类异常处理详细 · v1
type: design-spec
tags: [release-v1, engineering, e-p0-04, captured-at, edge-cases, see-earth]
task_id: E-P0-04
brief_anchor: §5 E-P0-04 / 任务卡 §C
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
  - ./validation-v1.md
  - ./test-cases-v1.md
  - ../../../Obsidian Vault/项目/看见地球 设计/07-设计师设计参考/release-v1/minimal-witness/state-matrix-v1.md (§EXIF 14 子状态)
  - ../../../Obsidian Vault/项目/看见地球 设计/07-设计师设计参考/release-v1/minimal-witness/copy-final-v1.md (§2 时间文案)
  - ../../../Obsidian Vault/项目/看见地球 设计/07-设计师设计参考/release-v1/minimal-witness/flow-diagram-v1.md (§1 段 2 时间确认)
depends_on: [E-P0-01 (✓ ACCEPTED), E-P0-09 (LOCKED ✓)]
blocks: [E-P0-03 Minimal Witness Backend]
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/e-p0-04-captured-at/edge-cases-v1.md
workspace_canonical_path: /Users/lwy/Documents/ChatGPT/看见地球/release-v1/e-p0-04-captured-at/edge-cases-v1.md
---

# SEE EARTH V1 · captured_at 5 类异常处理详细 · v1

> **作者**：Engineer Agent #5（外部 Owner = 您）
> **目标读者**：E-P0-03 Witness Backend Owner · Web / iOS 工程师 · D-P0-02 Witness Designer Owner · QA
> **目的**：详细定义 5 类异常的触发条件、客户端处理、服务端处理、文案、字段映射、与 confidence 的联动。
> **核心原则**（来自任务卡 §C + Brief §5 E-P0-04 Acceptance Criteria）：
> 1. **未来时间 = hard block**（最高优先级，违反即拒收）。
> 2. **EXIF 不可信 / 无 EXIF / 跨时区 = soft warning**（不阻塞，但 UI 必须明确）。
> 3. **旧照片 = soft warning**（不阻塞，但 UI 必须显示）。
> 4. **任何异常必须进入 audit log**（含触发时间 / 处理结果）。

---

## 0. 阅读指南

- **§1 5 类异常速览**
- **§2 无 EXIF**（截图 / 二次保存 / 无元数据图）
- **§3 EXIF 不可信**（mtime 冲突 / 篡改标记）
- **§4 跨时区**（EXIF 有时间无时区）
- **§5 旧照片**（captured_at > 30 天）
- **§6 未来时间**（captured_at > NOW + 1min · hard block）
- **§7 异常处理决策树（合并视图）**
- **§8 自验收**

---

## §1 5 类异常速览

| # | 异常 | 阻塞级别 | 客户端 UI | 服务端行为 | confidence | source |
|---|---|:---:|---|---|---|---|
| **§2** | **无 EXIF** | soft | 强制弹窗"请确认时间" | 接受 | `manual` | `user_confirmed` |
| **§3** | **EXIF 不可信** | soft | 警告"这张照片的时间不准确" | 接受 + 审核优先 | `low` | `user_confirmed` 或 `exif` |
| **§4** | **跨时区** | soft | 默认 UTC + 提示确认 | 接受 | `medium` | `exif` |
| **§5** | **旧照片** | soft | 显示"这是 N 天前拍的，是否提交" | 接受 + 标记 | （不强制改 confidence）| （不强制改 source） |
| **§6** | **未来时间** | **hard block** | 提交按钮 disabled + 提示"拍摄时间在未来，请调整" | **400 `captured_at_in_future`** | — | — |

---

## §2 无 EXIF（截图 / 二次保存 / 无元数据图）

### 2.1 触发条件

- EXIF reader 完全无法解析 `DateTimeOriginal` 字段。
- 典型场景：截图（系统截图工具通常不写 EXIF）、二次保存的 JPG（编辑软件可能清除 EXIF）、PNG / WebP（多数无 EXIF）、社交平台下载图（被服务端剥离）。

### 2.2 检测逻辑（客户端）

```ts
async function hasExifDateTime(file: File): Promise<boolean> {
  try {
    const exif = await exifr.parse(file, {
      pick: ['DateTimeOriginal', 'CreateDate', 'ModifyDate'],
    });
    return !!exif?.DateTimeOriginal;
  } catch (e) {
    return false;
  }
}
```

### 2.3 客户端 UI（D-P0-02 copy-final §2.1 + §2.4）

**段 2 时间确认页**：

```
┌────────────────────────────────────────┐
│  这张照片里没有时间信息                │
│                                        │
│  我们需要知道这是什么时候拍的：          │
│                                        │
│  📅 [日期选择器]                        │
│  ⏰ [时间选择器]                        │
│  🌐 [时区下拉：Asia/Tokyo ▼]            │
│                                        │
│  [确认]                                 │
│                                        │
│  ← 上一步                               │
└────────────────────────────────────────┘
```

### 2.4 客户端字段写入

```ts
const submission = {
  captured_at: combineDateAndTime(date, time).toISOString(),
  captured_at_tz: selectedTimezone,  // IANA timezone
  captured_at_source: 'user_confirmed',
  captured_at_confidence: 'manual',
};
```

### 2.5 服务端处理

- **不阻塞**：服务端 200 / 201。
- **不强制审核优先**（仅 EXIF 不可信 §3 强制审核）。
- **audit log**：记录 `no_exif_path_used` + `user_confirmed` 标记。

### 2.6 NOW 桶资格

`confidence = manual` 默认**不进入 NOW 桶**（详见 confidence-enum §5.1）；Witness 在段 5 主动确认后**可进入**。

---

## §3 EXIF 不可信（mtime 冲突 / 篡改标记）

### 3.1 触发条件

- **mtime 冲突**：文件 mtime 与 EXIF `DateTimeOriginal` 差异 > 24h。
- **篡改标记**：EXIF `Software` 包含已知编辑软件（Photoshop / GIMP / Lightroom 等）。
- **HistoryAction**：EXIF 中包含 "edited" / "modified" 操作记录。
- **服务端 EXIF 解析失败但客户端声明 source=exif**（见 source-enum §4.1）。

### 3.2 检测逻辑（客户端）

详见 source-enum §2.1.1（mtime 冲突）+ §2.1.2（篡改标记）。

### 3.3 客户端 UI（D-P0-02 copy-final §2.2）

**段 2 时间确认页（不可信警告）**：

```
┌────────────────────────────────────────┐
│  ⚠️ 这张照片的时间不准确                │
│                                        │
│  检测到：[                              │
│    · 文件最后修改时间与拍摄时间相差 X 天 │
│    · 或：使用了编辑软件修改（Photoshop）│
│  ]                                     │
│                                        │
│  请确认实际拍摄时间，或继续提交但标注为  │
│  "时间不确定"。                         │
│                                        │
│  📅 [日期：2026-08-19]                  │
│  ⏰ [时间：14:23]                       │
│  🌐 [时区：Asia/Tokyo ▼]                │
│                                        │
│  [确认提交] [取消]                       │
└────────────────────────────────────────┘
```

### 3.4 客户端字段写入（2 种路径）

**路径 A（用户改时间）**：

```ts
// 用户主动修改后 → source=user_confirmed, confidence=manual
const submission = { ...userConfirmedSubmission };
```

**路径 B（用户保留 EXIF 时间）**：

```ts
// 用户确认仍用 EXIF 时间 → source=exif, confidence=low
const submission = {
  captured_at: exifTime.toISOString(),
  captured_at_tz: exifTimezone,
  captured_at_source: 'exif',
  captured_at_confidence: 'low',
};
```

### 3.5 服务端处理

- **不阻塞**：服务端 200 / 201。
- **强制审核优先**：`confidence = low` 的 submission 进入 moderator 优先队列（moderation SLA < 24h）。
- **audit log**：记录 `exif_untrusted_path` + 触发原因（`mtime_conflict` / `tampered_software` / `history_action`）。

### 3.6 NOW 桶资格

- `source = exif + confidence = low`：**不进入** NOW 桶（详见 confidence-enum §5.1）。
- `source = user_confirmed + confidence = manual`：同 §2.6。

### 3.7 公共 API 标记

公共 Moment 显示 ⚠️ 警告角标 + "时间不确定"文案（详见 D-P0-02 copy-final §2.2 公开预览）。

---

## §4 跨时区（EXIF 有时间无时区）

### 4.1 触发条件

- EXIF `DateTimeOriginal` 完整可解析。
- EXIF `OffsetTime` / `OffsetTimeOriginal` **缺失**。
- 仅能拿到 local time，无 UTC offset。

### 4.2 推断逻辑（客户端）

默认按以下优先级推断 tz：

1. **用户当前浏览器 tz**（如用户在 Tokyo 浏览器访问 → 默认 JST）。
2. **设备 tz**（移动端）。
3. **拍摄地反查**：若 EXIF 包含 GPS（**服务端读取**，客户端不读取），反查 tz；**V1 简化**：默认 UTC + 提示确认。

```ts
function inferTimezone(exif: ExifData, userTz: string): string {
  if (exif.OffsetTime) return parseOffsetToTimezone(exif.OffsetTime);
  if (exif.OffsetTimeOriginal) return parseOffsetToTimezone(exif.OffsetTimeOriginal);
  
  // 默认用浏览器/设备 tz
  return userTz; // e.g., 'Asia/Tokyo'
}
```

### 4.3 客户端 UI（D-P0-02 copy-final §2.3）

**段 2 时间确认页（跨时区确认）**：

```
┌────────────────────────────────────────┐
│  我们读取了照片里的拍摄时间              │
│  2026-08-19 14:23                       │
│  但没读到时区。                          │
│                                        │
│  默认按 [Asia/Tokyo（你的时区）] 推断。 │
│  如果不对，请调整：                       │
│                                        │
│  📅 [日期：2026-08-19]                  │
│  ⏰ [时间：14:23]                       │
│  🌐 [时区：Asia/Tokyo ▼]                │
│                                        │
│  [确认]                                 │
└────────────────────────────────────────┘
```

### 4.4 客户端字段写入

**默认（用户未修改）**：

```ts
const submission = {
  captured_at: '2026-08-19T14:23:00+09:00', // 推断 tz
  captured_at_tz: 'Asia/Tokyo', // 推断 tz
  captured_at_source: 'exif',
  captured_at_confidence: 'medium', // 推断 → medium
};
```

**用户修改**（强制变为 `user_confirmed`）：

```ts
const submission = { ...userConfirmedSubmission }; // source=user_confirmed, confidence=manual
```

### 4.5 服务端处理

- **不阻塞**：服务端 200 / 201。
- **不强制审核优先**。
- **audit log**：记录 `inferred_timezone_path` + 推断方法。

### 4.6 NOW 桶资格

`confidence = medium` **可进入** NOW 桶（详见 confidence-enum §5.1）。

---

## §5 旧照片（captured_at > 30 天）

### 5.1 触发条件

`captured_at` 与服务端 `NOW()` 差异 > 30 天（无论过去 / 未来都检查；未来时间走 §6 hard block）。

```ts
function isOldPhoto(capturedAt: Date, now: Date): boolean {
  const diffDays = (now.getTime() - capturedAt.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays > 30;
}
```

### 5.2 客户端 UI（D-P0-02 copy-final §2.5）

**段 2 时间确认页（软警告）**：

```
┌────────────────────────────────────────┐
│  ⚠️ 这是 45 天前拍的                    │
│                                        │
│  这张照片比较旧。确认提交吗？            │
│                                        │
│  📅 [日期：2026-07-05]                  │
│  ⏰ [时间：14:23]                       │
│  🌐 [时区：Asia/Tokyo ▼]                │
│                                        │
│  [确认提交] [取消]                       │
└────────────────────────────────────────┘
```

### 5.3 客户端行为

- **不阻塞**：提交按钮仍可点（区别于未来时间 §6）。
- **soft warning**：仅显示警告文案 + 二次确认。
- **confidence 不强制改**：`high / medium` 仍可保留（不自动降级）；如用户改时间进入 `manual` 路径则按 §2 处理。

### 5.4 服务端处理

- **不阻塞**：服务端 200 / 201。
- **不强制审核优先**。
- **audit log**：记录 `old_photo_path` + 实际相差天数。
- **NOW 桶资格**：若 `captured_at > NOW - 24h` 才进 NOW 桶；30 天前的 photo 自然不在 NOW 桶候选。

### 5.5 业务原因

> 旧照片合法场景：Witness 整理相册时发现很久前拍的现场照片（如纪念活动 / 季节性景观）——允许提交，但 UI 必须让用户清楚"这不是 NOW"。

### 5.6 公共 API 标记

公共 Moment 仍正常显示"拍摄于 X（X 天前）"——不额外加标记（旧照片 ≠ 不可信）。

---

## §6 未来时间（hard block）

### 6.1 触发条件

`captured_at > NOW() + 1 minute`（1 分钟宽容，避免时钟漂移）。

```ts
function isInFuture(capturedAt: Date, now: Date): boolean {
  return capturedAt.getTime() > now.getTime() + 60 * 1000; // 1 min tolerance
}
```

### 6.2 客户端 hard block

**段 2 时间确认页（提交按钮 disabled）**：

```
┌────────────────────────────────────────┐
│  ❌ 拍摄时间在未来                       │
│                                        │
│  拍摄时间不能在未来。                    │
│  请调整：                               │
│                                        │
│  📅 [日期：2026-08-24]                  │
│  ⏰ [时间：14:23]                       │
│  🌐 [时区：Asia/Tokyo ▼]                │
│                                        │
│  [确认提交] ← disabled                  │
│                                        │
│  错误：CAPTURED_AT_IN_FUTURE             │
└────────────────────────────────────────┘
```

> **强制**：客户端必须 **hard block**（按钮 disabled），**不允许**用户绕过。
> **文案**："拍摄时间在未来，请调整"

### 6.3 客户端实时校验

```ts
// 客户端实时校验（onChange）
useEffect(() => {
  if (capturedAt && new Date(capturedAt) > new Date(Date.now() + 60_000)) {
    setError('CAPTURED_AT_IN_FUTURE');
    setSubmitDisabled(true);
  } else {
    setError(null);
    setSubmitDisabled(false);
  }
}, [capturedAt]);
```

### 6.4 服务端 hard block（最终防线）

```ts
function validateCapturedAtFuture(capturedAt: Date, uploadedAt: Date): void {
  const tolerance = 60 * 1000; // 1 min
  
  if (capturedAt.getTime() > uploadedAt.getTime() + tolerance) {
    throw new CapturedAtFutureError({
      error_code: 'captured_at_in_future',
      message: '拍摄时间在未来。请调整后重试。',
      details: {
        captured_at: capturedAt.toISOString(),
        uploaded_at: uploadedAt.toISOString(),
        diff_seconds: Math.floor((capturedAt.getTime() - uploadedAt.getTime()) / 1000),
      },
      retryable: false,
    });
  }
}
```

### 6.5 服务端响应

```json
HTTP 400 Bad Request
{
  "error_code": "captured_at_in_future",
  "message": "拍摄时间在未来。请调整后重试。",
  "details": {
    "captured_at": "2026-08-25T14:23:00+09:00",
    "uploaded_at": "2026-08-24T10:30:00Z",
    "diff_seconds": 100980
  },
  "retryable": false,
  "request_id": "req_abc123"
}
```

### 6.6 服务端 audit log

记录 `captured_at_in_future_blocked` + submission 完整 payload（用于反滥用分析）。

### 6.7 业务原因

> 未来时间 = 100% 数据错误（系统时钟漂移 / 用户乱填 / 客户端 bug）。**绝对不能**进入 NOW 桶——会让用户看到"未来的 Moment"。

### 6.8 跨服务时钟漂移

服务端必须用**单一可信时钟**（如 `process.env.NOW_PROVIDER = 'ntp'` 或 AWS Time Sync）；不直接用 Node `Date.now()` 假设时钟准确。

```ts
// 启动时校验系统时钟偏移
const ntpOffset = await getNtpOffset();
if (Math.abs(ntpOffset) > 5000) {
  console.error('System clock drift detected', { offset_ms: ntpOffset });
}
```

---

## §7 异常处理决策树（合并视图）

```text
[Witness 提交 captured_at]
   ↓
captured_at > NOW + 1min？
   ├─ Yes → ❌ HARD BLOCK (§6)
   │         服务端 400 captured_at_in_future
   │         客户端按钮 disabled
   │         audit log: captured_at_in_future_blocked
   │
   └─ No  → EXIF DateTimeOriginal 存在？
              ├─ No  → 强制弹窗（§2 无 EXIF）
              │         source=user_confirmed, confidence=manual
              │
              └─ Yes → mtime 冲突 / 篡改标记？
                        ├─ Yes → 警告 + 2 路径（§3 EXIF 不可信）
                        │         A: source=user_confirmed, confidence=manual
                        │         B: source=exif, confidence=low
                        │         服务端审核优先 + audit log
                        │
                        └─ No  → EXIF 有 OffsetTime？
                                  ├─ No  → 推断 tz + 提示（§4 跨时区）
                                  │         source=exif, confidence=medium
                                  │
                                  └─ Yes → captured_at > NOW - 30d？
                                            ├─ No  → 正常路径（§1 happy path）
                                            │         source=exif, confidence=high
                                            │
                                            └─ Yes → 软警告（§5 旧照片）
                                                      仍提交
                                                      audit log: old_photo_path
```

---

## §8 自验收

| # | 验收项 | 状态 | 证据 |
|---|---|:---:|---|
| 1 | 5 类异常定义完整 | ✅ | §1 |
| 2 | 无 EXIF 处理（强制弹窗 + manual） | ✅ | §2 |
| 3 | EXIF 不可信处理（mtime / 篡改标记 + low） | ✅ | §3 |
| 4 | 跨时区处理（推断 tz + medium） | ✅ | §4 |
| 5 | 旧照片处理（软警告 + 不阻塞） | ✅ | §5 |
| 6 | 未来时间 hard block（服务端 + 客户端） | ✅ | §6 |
| 7 | 异常处理决策树（合并视图） | ✅ | §7 |
| 8 | NOW 桶资格矩阵与 confidence-enum §5 对齐 | ✅ | §2.6 / §3.6 / §4.6 / §5.4 |
| 9 | 与 D-P0-02 §EXIF 14 子状态 + copy-final §2 文案对齐 | ✅ | §2.3 / §3.3 / §4.3 / §5.2 / §6.2 |
| 10 | 与 E-P0-09 错误码字典对齐（captured_at_in_future） | ✅ | §6.5 |
| 11 | audit log 字段明确（5 类均有） | ✅ | §2.5 / §3.5 / §4.5 / §5.4 / §6.6 |
| 12 | 不在埋点携带精确 timestamp | ✅ | 全文（埋点仅桶标签） |

---

**End of edge-cases-v1.md · E-P0-04 子产物 4/6**
