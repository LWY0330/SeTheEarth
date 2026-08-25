---
title: SEE EARTH V1 · captured_at 三时间语义 · v1
type: design-spec
tags: [release-v1, engineering, e-p0-04, captured-at, time-semantics, see-earth]
task_id: E-P0-04
brief_anchor: §5 E-P0-04
track: engineering
owner: 外部 Engineer Owner（您）
created: 2026-08-24
status: IN REVIEW
target_gate: Gate A · Internal Alpha
source_brief: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/SEE-EARTH-Release-Strategy-v1-Design-Engineering-Task-Brief.md §5 E-P0-04
source_task_card: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/06-PM Agent 交接/2026-08-22-task-card-e-p0-04-captured-at-rules.md
related_docs:
  - ./source-enum-v1.md
  - ./confidence-enum-v1.md
  - ./edge-cases-v1.md
  - ./validation-v1.md
  - ./test-cases-v1.md
  - ../../../Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/api-contract/zod-schemas/common.ts (§ Time semantics)
  - ../../../Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/api-contract/zod-schemas/moment.ts (§ PublicMomentSchema)
  - ../../../Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/api-contract/contract-decisions-v1.md (§3 时间语义决策)
  - ../../../Obsidian Vault/项目/看见地球 设计/07-设计师设计参考/release-v1/minimal-witness/api-field-mapping-v1.md (§4 POST /witness/submissions/:id/submit)
  - ../../../Obsidian Vault/项目/看见地球 设计/07-设计师设计参考/release-v1/minimal-witness/flow-diagram-v1.md (§1 6 段流程)
  - ../../../Obsidian Vault/项目/看见地球 设计/07-设计师设计参考/release-v1/system-states/state-matrix-v1.md (§2 Moment 状态)
depends_on: [E-P0-01 (✓ ACCEPTED), E-P0-09 (LOCKED ✓)]
blocks: [E-P0-03 Minimal Witness Backend, E-P0-06 Daily 12 Supply Chain]
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/e-p0-04-captured-at/three-time-semantics-v1.md
workspace_canonical_path: /Users/lwy/Documents/ChatGPT/看见地球/release-v1/e-p0-04-captured-at/three-time-semantics-v1.md
---

# SEE EARTH V1 · captured_at 三时间语义 · v1

> **作者**：Engineer Agent #5（外部 Owner = 您）
> **目标读者**：E-P0-09 Contract Owner · E-P0-03 Witness Backend Owner · E-P0-06 Daily 12 Supply Chain Owner · Web / iOS 工程师 · QA · PM
> **目的**：把 V1 必须严格区分的 3 个时间字段定义锁死，**禁止混用**——这是 V1 数据可信度的根。
> **核心原则**（来自 Brief §5 E-P0-04 + contract-decisions §3）：
> 1. **3 个字段互不可替代**：`captured_at` ≠ `uploaded_at` ≠ `published_at`。
> 2. **NOW 排序只信任** `captured_at`（用户不被旧照片骗）。
> 3. **存储用 UTC**，**显示用 IANA timezone**（带原始 tz，便于 UI 当地化）。

---

## 0. 阅读指南

- **§1 三时间字段总览** — 一表速览
- **§2 captured_at** — 拍摄时刻（核心 / 决定 NOW 排序）
- **§3 uploaded_at** — 上传时刻（运营元数据）
- **§4 published_at** — 公开时刻（审核通过后才有）
- **§5 用途矩阵 + 互斥清单**
- **§6 与现有数据现状对齐**（src/data/moments.ts / liveMoments.ts）
- **§7 与 E-P0-09 Zod contract 一致性**
- **§8 自验收**

---

## §1 三时间字段总览

| 字段 | 含义 | 数据类型 | 来源 | 必填？ | 唯一决定 |
|---|---|---|---|:---:|---|
| **`captured_at`** | **拍摄时刻** | RFC 3339 UTC + offset | EXIF DateTimeOriginal（首选）/ 移动端相机时间 / 用户手动确认 / PM 修正 | ✓（必填） | **NOW 排序 / Daily 12 资格 / 时间桶** |
| **`uploaded_at`** | 上传时刻 | RFC 3339 UTC | 服务端 `NOW()`（受理 submission 落库） | ✓（服务端自动） | 运营元数据 / 服务端审计 |
| **`published_at`** | 公开时刻 | RFC 3339 UTC，可空 | 审核通过后服务端 `NOW()` | ❌（nullable · 未审核 = 缺席） | "公开于 3 天前" / Edition 组版回溯 |

> **核心规则**：NOW 排序必须用 `captured_at`；**禁止**用 `uploaded_at` 或 `published_at` 做 NOW / TODAY / PAST 分桶。
>
> **理由**：Witness 提交后可能 30 天才被审核通过；若用 `uploaded_at` 排序，"今天新出现的 Moment" 实际是 30 天前拍的，会**骗用户**。`published_at` 更不能用于 NOW——它是运营事件，不是事件本体。

---

## §2 captured_at（拍摄时刻）

### 2.1 定义

**`captured_at`** 是照片**实际被拍摄**的时刻，由 Witness 在上传时声明，服务端在受理时**完整保留**。

它是 3 个字段中**唯一**决定内容新鲜度的字段：

- NOW 排序（Daily 12 NOW 槽位）→ `captured_at` 降序
- TODAY 资格（24h 内 Moment 入选 TODAY 桶）→ `captured_at > NOW - 24h`
- PAST 分桶（已过去的 Moment）→ `captured_at < NOW - 24h`
- 当地显示时间计算 → `captured_at` + `captured_at_tz`（见 §2.4）

### 2.2 数据类型

| 属性 | 规格 |
|---|---|
| 类型 | RFC 3339 / ISO 8601 字符串，带 offset |
| 示例 | `"2026-08-19T14:23:00+09:00"`（JST） |
| 存储格式 | UTC 单调（服务端持久化前转 UTC） |
| Zod schema | `UtcTimestampSchema`（`common.ts §Time semantics`） |
| 可空 | ❌（必填） |

> **持久化**：服务端必须把任何 offset 统一归一为 UTC；**原始 offset + IANA timezone 必须作为兄弟字段保留**（见 §2.4）。

### 2.3 来源（source 维度）

4 个 source 枚举 + 触发条件，详见 `source-enum-v1.md` §1：

| source | 含义 | 触发场景 |
|---|---|---|
| `exif` | EXIF DateTimeOriginal 可信 | 照片自带 EXIF 且 DateTimeOriginal 完整可解析 |
| `camera` | 系统相机（移动端） | iOS/Android 拍摄，照片无 EXIF 但设备时间可信 |
| `user_confirmed` | 用户手动确认 | 无 EXIF（截图 / 二次保存） / EXIF 不可信 / 跨时区无 tz |
| `admin` | PM 修正 | 已知数据错误，由 PM 后台覆写 |

> **V1 强约束**：服务端接收时**必须**带 `captured_at_source`；不允许只发 `captured_at` 不发 source。

### 2.4 兄弟字段：captured_at_tz（IANA timezone）

> **保留原始 timezone** 是 E-P0-04 + E-P0-09 contract-decisions §3 的强制要求。

| 属性 | 规格 |
|---|---|
| 类型 | IANA timezone string（如 `"Asia/Tokyo"`） |
| Zod schema | `IanaTimezoneSchema` |
| 可空 | ❌（必填；缺失 = 强制 `user_confirmed`） |
| 来源 | 与 `captured_at` 同源；推断规则见 `confidence-enum-v1.md` §2 |

**用途**：前端用 `Intl.DateTimeFormat(undefined, { timeZone: captured_at_tz, ... })` 渲染**当地显示时间**（如"2026-08-19 14:23 JST"）；**禁止**仅靠浏览器本地 tz 推断。

### 2.5 V1 客户端来源优先级（前端读取）

```text
1. 移动端相机拍摄 → new Date() (设备时间) + camera timezone → source=camera, confidence=high
2. 相册照片（带 EXIF DateTimeOriginal + OffsetTime）→ source=exif, confidence=high
3. 相册照片（带 EXIF DateTimeOriginal，无 tz）→ source=exif, confidence=medium
4. 相册照片（无 EXIF）→ 强制弹出日期/时间选择器 → source=user_confirmed, confidence=manual
5. 截图 / 二次保存（无 EXIF）→ 强制弹出日期/时间选择器 → source=user_confirmed, confidence=manual
```

> **强制原则**：`source=user_confirmed` 必须由用户**主动操作**（点选或输入）；禁止前端自动 fallback 到当前时间冒充拍摄时间。

---

## §3 uploaded_at（上传时刻）

### 3.1 定义

**`uploaded_at`** 是 Witness submission 被服务端**受理落库**的时刻，是**服务端控制**的运营元数据。

### 3.2 用途

| 用途 | 说明 |
|---|---|
| 运营审计 | "今天有多少 submission 被受理" |
| 反滥用 | 检测同一用户短时间内大量上传 |
| 客服查询 | "你 X 月 Y 日提交的内容" |
| 与 published_at 配合 | 计算"审核耗时"（published_at - uploaded_at） |

### 3.3 数据类型

| 属性 | 规格 |
|---|---|
| 类型 | RFC 3339 UTC（服务端统一 UTC） |
| 示例 | `"2026-08-22T10:30:45Z"` |
| 来源 | 服务端 `NOW()`，**禁止**客户端提供 |
| 可空 | ❌（服务端自动） |
| Zod schema | `UtcTimestampSchema` |

### 3.4 强制约束

- ❌ **禁止**用 `uploaded_at` 做 NOW 排序或 Daily 12 资格判定。
- ❌ **禁止**前端在埋点 / Analytics payload 中携带 `uploaded_at` 的精确 timestamp（含 tz）。
- ✅ 仅服务端内部审计表保留；公共 API 不主动暴露此字段（如需暴露，前端只展示"上传于 N 小时前"，由前端从 `uploaded_at` 派生）。

### 3.5 与 captured_at 的关系

```text
captured_at ≤ uploaded_at（正常情况）
captured_at > uploaded_at（异常情况，见 edge-cases-v1.md §4"未来时间"）
```

服务端校验时若发现 `captured_at > uploaded_at + 1 minute` → `error_code: captured_at_in_future`，**hard block**。

---

## §4 published_at（公开时刻）

### 4.1 定义

**`published_at`** 是 Moment 通过审核（moderation = approved）**首次公开**进入公共 API / Daily 12 的时刻。

### 4.2 用途

| 用途 | 说明 |
|---|---|
| "公开于 3 天前" 文案 | 前端展示"这条 Moment 公开 X 天了" |
| Edition 回溯 | "今天这条 Moment 是 Y 月 Z 日进入 Daily 12 的" |
| Daily 12 连续供应演练 | 每日 Edition 是否按时发布（监测 published_at 间隔） |

### 4.3 数据类型

| 属性 | 规格 |
|---|---|
| 类型 | RFC 3339 UTC |
| 示例 | `"2026-08-25T08:00:00Z"` |
| 来源 | 审核通过时服务端 `NOW()`，写入字段 |
| 可空 | ✅ **可空**（未审核 = 字段缺席，不是 `null`） |
| Zod schema | `UtcTimestampSchema.optional()` |

### 4.4 强制约束

- ❌ **禁止**用 `published_at` 做 NOW 排序（它是运营事件，不是事件本体）。
- ❌ **禁止**前端在 NOW 桶中以 `published_at` 排序（Daily 12 NOW 桶必须 `captured_at` 降序）。
- ✅ `published_at` 缺席（optional）= 仍在审核中，前端**不能**展示"公开于..."文案。

### 4.5 状态机

```text
draft → uploading → submitted → under_review ─┬─► published (published_at 写入)
                                              ├─► rejected (published_at 永不为 null)
                                              ├─► needs_more_info
                                              ├─► withdrawn
                                              └─► failed
```

> **`published_at` 一旦写入即不可改**：撤回（withdrawn）不删除 `published_at`，但前端不展示该 Moment（见 state-matrix §2.3 `content_withdrawn`）。

---

## §5 用途矩阵 + 互斥清单

### 5.1 三字段用途矩阵

| 用途 | captured_at | uploaded_at | published_at |
|---|:---:|:---:|:---:|
| NOW 排序（Daily 12） | ✓ | ❌ | ❌ |
| TODAY 资格（24h 桶） | ✓ | ❌ | ❌ |
| 当地显示时间（UI） | ✓ + tz | ❌ | ❌ |
| "公开于 N 天前"文案 | ❌ | ❌ | ✓ |
| "上传于 N 小时前"文案 | ❌ | ✓ | ❌ |
| "拍摄于 X"文案 | ✓ + tz | ❌ | ❌ |
| 运营审计 | ⚠️（参考） | ✓ | ⚠️（参考） |
| 反滥用检测 | ❌ | ✓ | ❌ |
| 审核耗时 | ❌ | ✓ (起点) | ✓ (终点) |
| 重复上传幂等 | ❌ | ✓ (起点) | ❌ |

> ✓ = 可用 / ❌ = 禁用 / ⚠️ = 参考但非决定性

### 5.2 互斥清单（DO NOT）

| 场景 | 错误做法 | 正确做法 |
|---|---|---|
| Daily 12 NOW 槽位排序 | 用 `uploaded_at` 降序 | 用 `captured_at` 降序 |
| 当地显示时间 | 仅靠浏览器本地 tz | `captured_at` + `captured_at_tz` |
| "公开于 X 天前" | 用 `uploaded_at` | 用 `published_at`（若缺席则不展示） |
| NOW 桶填充 | 把 30 天前拍的 Witness + 今天发布塞入 NOW | 用 `captured_at` > NOW - 24h 过滤 |
| Editorial 内容 | 用 `published_at` 冒充 NOW | Editorial 内容用 `captured_at`（由 PM 设置为真实事件时间） |
| 埋点 payload | 携带 `captured_at` 的精确 timestamp + tz | 仅携带桶标签（`time_bucket` = NOW / TODAY / PAST）+ `captured_at_source` 枚举 |

---

## §6 与现有数据现状对齐

> **目标**：V1 上线前必须把现有数据迁移到新 schema。

### 6.1 src/data/moments.ts（6 moment）

**当前字段**（v2.22.0）：无 `captured_at` 字段；Moment 字段 = `id, cityZh, cityEn, countryZh, countryEn, lon, lat, category, categoryLabelZh, textZh, textEn`。

**V1 迁移**：

| 字段 | 当前 | V1 必填 | 处理 |
|---|---|:---:|---|
| `captured_at` | ❌ 缺失 | ✓ | 迁移为 Editorial 内容时**必须**设置（PM 提供真实事件时间） |
| `captured_at_tz` | ❌ 缺失 | ✓ | 与 `captured_at` 同步（按 city timezone） |
| `captured_at_source` | ❌ 缺失 | ✓ | 迁移 Editorial 内容用 `source = admin` |
| `captured_at_confidence` | ❌ 缺失 | ✓ | PM 修正后用 `high` |
| `uploaded_at` | ❌ 缺失 | ✓ | Seed 时服务端 `NOW()` |
| `published_at` | ❌ 缺失 | ❌ (optional) | Seed 时设置为种子时间 |

> **迁移 owner**：E-P0-09 contract owner 提供 migration script；Editorial 内容由 PM 提供 `captured_at` 真实时间。

### 6.2 src/data/liveMoments.ts（12 live event）

**当前字段**（v2.14.0）：含 `observedAt: string`（ISO with offset），`localTime: string`，`timezone: string`，`utcOffset: number`，`updatedAt: string`，`publishedAt?: string`，`expiresAt?: string`。

**V1 迁移**：

| 旧字段 | V1 对应字段 | 处理 |
|---|---|---|
| `observedAt` | **`captured_at`** | 直接 rename（语义对齐："观察时刻"= "拍摄时刻"在 Editorial 场景下） |
| `timezone` | **`captured_at_tz`** | 转 IANA 格式（如 `JST` → `Asia/Tokyo`） |
| `utcOffset` | （不保留为字段） | 仅用于 `captured_at_tz` 验证；不直接存储 |
| `updatedAt` | （不保留为字段） | V1 Editorial 内容无 `updated_at` 字段；如需保留在运营审计表 |
| `publishedAt` | **`uploaded_at`**（seed 时）/ **`published_at`**（正式发布时） | seed 数据用 `publishedAt` 作为 `uploaded_at` |
| `localTime` | （派生字段） | 前端从 `captured_at + captured_at_tz` 用 `Intl.DateTimeFormat` 派生 |
| `isLive` | （派生字段） | V1 Editorial 内容默认 `isLive = true`（Seed 数据） |
| `verificationStatus` | （独立字段） | 保留；不与时间字段混淆 |

> **强制**：`observedAt` 改名 `captured_at` 时，所有 `getSortedByLocalTime()` / `getTimeAgo()` / `getMixedSnapshot()` 等函数必须同步更新为基于 `captured_at + captured_at_tz` 的实现。

---

## §7 与 E-P0-09 Zod Contract 一致性

### 7.1 已有字段（LOCKED）

`/release-v1/api-contract/zod-schemas/common.ts` 已定义：

- `UtcTimestampSchema`（RFC 3339 UTC + offset）
- `IanaTimezoneSchema`（IANA timezone）
- `CapturedAtSourceSchema`（当前：`exif, camera, user_confirmed, admin, fallback_upload_time`）
- `CapturedAtConfidenceSchema`（当前：`high, medium, low, untrusted`）

`/release-v1/api-contract/zod-schemas/moment.ts` §`PublicMomentSchema` 已包含：

- `captured_at: UtcTimestampSchema`
- `captured_at_tz: IanaTimezoneSchema`
- `captured_at_source: CapturedAtSourceSchema`
- `captured_at_confidence: CapturedAtConfidenceSchema`
- `uploaded_at: UtcTimestampSchema`
- `published_at: UtcTimestampSchema.optional()`

### 7.2 ⚠️ 与任务卡枚举冲突

任务卡 §B 与 common.ts 当前定义有 2 处冲突，需 E-P0-09 contract owner 裁决：

| 字段 | 任务卡 §B 要求 | common.ts 当前 | 差异 |
|---|---|---|---|
| `CapturedAtSource` | `exif / camera / user_confirmed / admin`（4 值） | `exif / camera / user_confirmed / admin / fallback_upload_time`（5 值） | task card 无 `fallback_upload_time` |
| `CapturedAtConfidence` | `high / medium / low / manual`（4 值） | `high / medium / low / untrusted`（4 值） | `manual` vs `untrusted` 语义不同 |

### 7.3 冲突处理建议（待 E-P0-09 owner 裁决）

> **本节是建议，最终由 E-P0-09 contract owner 锁定**。

#### 7.3.1 source 冲突

- **任务卡移除 `fallback_upload_time`**：本卡 §3 / §4 / §5 均规定 `uploaded_at` 是服务端 NOW，**`captured_at` 不得 fallback 到 `uploaded_at`**。
- **建议**：移除 `fallback_upload_time`，保留 4 值。若服务端遇到"无 captured_at"场景，**必须**走 `user_confirmed` 路径（强制用户输入），不得静默 fallback。
- **影响范围**：common.ts + moment.ts + error-code-dict-v1.md（如有引用）。

#### 7.3.2 confidence 冲突

- **任务卡用 `manual`**：`source=user_confirmed` → `confidence=manual`（语义：用户输入）。
- **contract 当前用 `untrusted`**：原意可能是 `EXIF 不可信` 的更弱标签。
- **建议**：
  - 保留 4 值：high / medium / low / **manual**
  - `low` = EXIF 不可信（mtime 冲突 / 篡改标记）
  - `manual` = 用户输入（与 `source=user_confirmed` 配对）
  - **移除 `untrusted`**（与 `low` 重复）
- **影响范围**：common.ts + moment.ts + D-P0-02 state-matrix §EXIF 14 子状态 + D-P0-05 event-map（如有引用）。

### 7.4 与 contract-decisions §3 一致

contract-decisions-v1.md §3"时间语义"决策已锁定：

> - `captured_at`（RFC 3339 UTC + offset）→ 唯一决定 NOW/TODAY/PAST 分桶
> - `captured_at_tz`（IANA timezone）→ 用于显示
> - `uploaded_at`（RFC 3339 UTC）→ 上传时间（运营元数据）
> - `published_at`（RFC 3339 UTC，可空）→ 公开时间（moderation 通过后才填）
> - 三者**不可混用**

本卡定义与该决策 100% 对齐。冲突项（§7.2 / §7.3）需 contract owner 在下一轮 contract 更新中统一处理。

---

## §8 自验收

| # | 验收项 | 状态 | 证据 |
|---|---|:---:|---|
| 1 | 3 个时间字段定义清晰（captured_at / uploaded_at / published_at） | ✅ | §1 总览表 |
| 2 | 三字段数据类型明确（RFC 3339 UTC + offset / UTC 可空） | ✅ | §2.2 / §3.3 / §4.3 |
| 3 | 三字段来源明确（EXIF / 服务端 NOW / 审核后 NOW） | ✅ | §2.3 / §3.3 / §4.3 |
| 4 | 互斥清单明确（NOW 排序必须 captured_at） | ✅ | §5.2 |
| 5 | 与 E-P0-09 Zod contract 一致（含冲突标注） | ✅ | §7（含 §7.2 冲突点 + §7.3 处理建议） |
| 6 | 与现有数据现状对齐（moments.ts / liveMoments.ts 迁移路径） | ✅ | §6 |
| 7 | 不引入新依赖（用现有 RFC 3339 / IANA） | ✅ | §2.2 / §2.4 / §7.1 |
| 8 | 不在埋点携带精确 timestamp | ✅ | §5.1 / §5.2 |
| 9 | 与 D-P0-02 §4 captured_at_confirm 段对齐 | ✅ | §2.5 客户端来源优先级 |
| 10 | 与 state-matrix §2 Moment 状态机对齐 | ✅ | §4.5 状态机 |

---

## §9 给 E-P0-03 / E-P0-06 / E-P0-09 的指令

### 9.1 给 E-P0-09（Contract Owner）

1. **裁决 §7.2 / §7.3 冲突**：移除 `fallback_upload_time` 与 `untrusted`，改用任务卡 §B 的 4 source / 4 confidence 值。
2. **更新 schema-changelog-v1.md** v1.0.0 → v1.1.0（MINOR 兼容变更：移除枚举值）。
3. **更新 common.ts + moment.ts**：source/confidence 枚举值同步。

### 9.2 给 E-P0-03（Witness Backend Owner）

1. **POST `/witness/submissions/:id/submit`** 必须强制带 `captured_at + captured_at_source + captured_at_confidence + captured_at_tz` 四字段。
2. **`uploaded_at` 由服务端 NOW() 写入**；客户端禁止发送。
3. **`published_at` 由审核通过触发**；客户端禁止发送。
4. **服务端必须做** `captured_at > uploaded_at + 1min` → 400 `captured_at_in_future` hard block（见 validation-v1.md）。

### 9.3 给 E-P0-06（Daily 12 Supply Chain Owner）

1. **NOW 桶 SQL ORDER BY 必须用 `captured_at` DESC**；禁止 `ORDER BY uploaded_at` / `ORDER BY published_at`。
2. **TODAY 资格筛选**：`captured_at > NOW() - INTERVAL '24 hours'`。
3. **Editorial 内容**的 `captured_at` 必须由 PM 提供（不允许 seed 时用 NOW() 冒充）。
4. **Edition 回填** 时按 `captured_at` 排序，不按 `published_at`。

### 9.4 给 Web / iOS 工程师

1. **三时间分别展示**（见 `validation-v1.md` §4 + D-P0-02 copy-final §1）：
   - "拍摄于 2026-08-19 14:23 JST"（带 tz）
   - "上传于 2 小时前"
   - "公开于 3 天前"
2. **当地显示时间 = `captured_at` + `captured_at_tz`**，用 `Intl.DateTimeFormat(undefined, { timeZone: captured_at_tz })`。
3. **埋点** 不携带 `captured_at` 的精确 timestamp + tz；仅携带 `time_bucket` + `captured_at_source` 枚举。

### 9.5 给 QA

1. **NOW 排序测试**：构造一组 captured_at 早但 uploaded_at 晚的 Witness；NOW 桶必须按 captured_at 排序。
2. **跨时区测试**：Tokyo 拍的（captured_at = 14:23 JST）vs London 拍的（captured_at = 14:23 BST）应同时出现但当地显示不同。
3. **公开时间缺席测试**：未审核的 Moment 不显示"公开于..."文案。
4. **未来时间测试**：captured_at = NOW + 5min → 提交返回 400 `captured_at_in_future`。

---

**End of three-time-semantics-v1.md · E-P0-04 子产物 1/6**
