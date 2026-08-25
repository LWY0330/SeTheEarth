---
title: SEE EARTH V1 · Minimal Witness Flow · 最终文案（中英双语）
type: design-copy
tags: [release-v1, design, d-p0-02, witness, copy, zh-cn, en, privacy, see-earth]
task_id: D-P0-02
brief_anchor: §4 D-P0-02 / 任务卡 §C 隐私文案原则
track: design
owner: 外部 Designer Owner（您）
created: 2026-08-22
status: IN REVIEW
target_gate: Gate A · Internal Alpha
source_brief: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/SEE-EARTH-Release-Strategy-v1-Design-Engineering-Task-Brief.md
source_task_card: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/06-PM Agent 交接/2026-08-22-task-card-d-p0-02-minimal-witness.md
related_docs:
  - ./flow-diagram-v1.md
  - ./state-matrix-v1.md
  - ./api-field-mapping-v1.md
  - ./prototype-v1.md
  - ../analytics-events/consent-placement-v1.md (C-03~C-06)
  - ../analytics-events/forbidden-fields-v1.md
depends_on: [D-P0-01 LOCKED ✓, D-P0-05 ACCEPTED]
blocks: [E-P0-03, E-P0-05, P0-7 Privacy 页面文案]
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/07-设计师设计参考/release-v1/minimal-witness/copy-final-v1.md
workspace_canonical_path: /Users/lwy/Documents/ChatGPT/看见地球/release-v1/minimal-witness/copy-final-v1.md
note: 本文件已就绪，需 PM Agent 由 Obsidian 写入权限落地到 canonical 路径。
---

# SEE EARTH V1 · Minimal Witness Flow · 最终文案（中英双语）

> **作者**：Designer Agent #3（外部 Owner = 您）
> **目标读者**：PM Agent / Web 工程师 / iOS 工程师 / E-P0-03 Backend / 内容运营 / 翻译 / QA
> **目的**：交付"完整 Witness 流程文案库"——覆盖 **5 大状态类别 × 全部子状态**。
> **强制原则**（来自 Brief §4 D-P0-02 + 任务卡 DO NOT）：
> 1. **不暗示绝对匿名** — Brief §D-P0-02 明确要求"不暗示系统能保证绝对匿名；准确说明实际采集、保存、使用与删除方式"
> 2. **不把权限拒绝设计为惩罚或强制授权** — 提供安全替代路径
> 3. **不把"上传成功 = 自动公开"作为隐含承诺** — 必须经过审核
> 4. **不展示精确 GPS / EXIF / 推断住址** — 仅城市级公开
> 5. **不展示服务端错误堆栈 / trace** — 用户友好文案

---

## 0. 阅读指南

- **§1 段 0 入口文案**（ReadingIntro / C-03 联动）
- **§2 段 1 选图文案**（ContentPicking + 权限拒绝 C-06）
- **§3 段 2 时间确认文案**（CapturedAtConfirm + EXIF 警告）
- **§4 段 3 位置确认文案**（LocationConfirm / C-04 + 位置拒绝 C-06）
- **§5 段 4 短描述文案**（DescriptionEntry）
- **§6 段 5 公开预览文案**（C-05 SubmitPreview）
- **§7 段 6 上传 + 结果文案**（Uploading / ServerConfirmed / Failed / UserCancelled）
- **§8 审核结果文案**（P1 异步通知 · V1 session 内显示）
- **§9 公共文案组件**（按钮 / 链接 / 错误 ID 等）

> **每条文案都给出 (zh-CN · 英文) + 使用场景 + 触发事件**。

---

## §1 段 0 入口文案（ReadingIntro · C-03 联动）

### 1.1 页面主文案

**zh-CN**
```text
留下一个 Moment

让这里被看见。

我们为什么需要这些信息：

• 照片 — 让这里被看见
• 拍摄时间 — 让"正在发生"变得真实
• 位置 — 让照片归属于一座城市

继续前，请花 10 秒了解：
```

**English**
```text
Leave a Moment

Let this place be seen.

Why we need this information:

• Photo — to let this place be seen
• Captured time — to make "happening now" real
• Location — to attach the photo to a city

Before continuing, please take 10 seconds to understand:
```

### 1.2 隐私说明卡片（强制阅读）

**zh-CN**
```text
公开后会显示：
✓ 城市名
✓ 拍摄时间（精确到分钟）
✓ 你选择的一句话（可选）

不会显示：
✗ 你的精确 GPS
✗ 你的姓名 / 联系方式
✗ 原始照片元数据

继续即表示你理解这些信息将用于审核与公开显示。
```

**English**
```text
What will be public:
✓ City name
✓ Captured time (to the minute)
✓ Your one-line note (optional)

What will NOT be public:
✗ Your precise GPS
✗ Your name / contact info
✗ Original photo metadata

By continuing, you confirm you understand this information will be used for moderation and public display.
```

### 1.3 段 0 按钮

| 按钮 | zh-CN | English | 触发 |
|---|---|---|---|
| 主 CTA | 继续 | Continue | 触发 `witness_started` |
| 次 CTA | ← 返回首页 | ← Back to Home | 取消（不发事件） |
| 链接 | 完整 Privacy | Full Privacy Policy | 打开 `/privacy`（新 tab） |

> **强制规则**：必须滚动到底或停留 ≥ 5 秒才能点"继续"（来自 consent-placement C-03）。
> **DO NOT**：
> - ❌ 不写"我们保证匿名"
> - ❌ 不写"我们不会保留你的照片"
> - ❌ 不写"上传即同意"以外的暗示（如暗示上传后不可删除）

---

## §2 段 1 选图文案（ContentPicking + 权限拒绝 C-06）

### 2.1 页面主文案

**zh-CN**
```text
选择你的照片

你可以现在拍一张，或从相册选择一张。
请选择最能代表"此刻"的画面。
```

**English**
```text
Choose your photo

You can take one now, or pick one from your library.
Please choose the image that best represents "this moment."
```

### 2.2 段 1 按钮 + 提示

| 元素 | zh-CN | English | 触发 |
|---|---|---|---|
| 主按钮 | 拍一张 | Take a photo | 触发相机权限 |
| 次按钮 | 从相册选 | Pick from library | 触发相册权限 |
| 返回 | ← 上一步 | ← Back | 回到段 0 |
| EXIF 读取中 | 读取照片信息… | Reading photo info… | 段 1 → 段 2 过渡 |
| EXIF 不可信 | 这张照片的拍摄时间可能不准确；下一步可手动调整 | This photo's captured time may not be accurate; you can adjust it in the next step | `captured_at_confidence = low` |
| 无 EXIF | 我们没读到这张照片的拍摄时间；下一步请手动填写 | We couldn't read this photo's captured time; please enter it in the next step | `captured_at_source = user_confirmed` |

### 2.3 权限拒绝 C-06 Banner

#### 2.3.1 相机权限拒绝

**zh-CN**
```text
你拒绝了相机权限。
SEE EARTH 仍然支持从相册选择照片。

[ 从相册选 ]  [ 取消并返回 ]
```

**English**
```text
You declined camera access.
SEE EARTH still supports picking from your photo library.

[ Pick from library ]  [ Cancel and return ]
```

#### 2.3.2 相机权限受限（restricted / denied_permanent）

**zh-CN**
```text
你的设备权限受限，无法访问相机。
如需继续，请前往系统设置调整权限后重试。

[ 去系统设置 ]  [ 取消并返回 ]
```

**English**
```text
Your device permissions are restricted. Camera access is unavailable.
To continue, please adjust permissions in your system settings and try again.

[ Open system settings ]  [ Cancel and return ]
```

#### 2.3.3 相册权限拒绝（同上结构）

**zh-CN**
```text
你拒绝了相册权限。
SEE EARTH 仍然支持即时拍照。

[ 拍一张 ]  [ 取消并返回 ]
```

**English**
```text
You declined photo library access.
SEE EARTH still supports taking a photo now.

[ Take a photo ]  [ Cancel and return ]
```

> **DO NOT**：
> - ❌ 不显示"必须开启权限才能继续"等强制文案
> - ❌ 不在 Banner 内隐藏"取消并返回"按钮
> - ❌ 不显示具体技术原因（如 iOS ATT 政策）

---

## §3 段 2 时间确认文案（CapturedAtConfirm）

### 3.1 页面主文案

**zh-CN**
```text
确认拍摄时间

这张照片是什么时候拍的？
```

**English**
```text
Confirm captured time

When was this photo taken?
```

### 3.2 EXIF 自动填入

| 场景 | zh-CN | English | 字段 |
|---|---|---|---|
| EXIF 完整可信 | 我们从你的照片读到了拍摄时间：[YYYY-MM-DD HH:MM] · 看起来准确 | We read the captured time from your photo: [YYYY-MM-DD HH:MM] · looks accurate | `captured_at_source = exif` · `confidence = high` |
| EXIF 不可信 | 我们从你的照片读到的时间可能不准确；请确认或修改 | The time we read from your photo may not be accurate; please confirm or adjust | `confidence = low` |
| 无 EXIF | 我们没能读到这张照片的拍摄时间；请手动填写 | We couldn't read this photo's captured time; please enter it manually | `source = user_confirmed` |
| 时区不确定 | 我们读到了时间但不确定时区；请确认你拍摄时所在时区 | We read the time but not the time zone; please confirm the time zone you were in | `tz_source = inferred` · `confidence = medium` |

### 3.3 时间合理性警告

| 场景 | zh-CN | English | 字段 |
|---|---|---|---|
| 正常（< 30 天） | — | — | `age_days ∈ (0, 30)` |
| 太近（< 1 分钟） | 这张照片看起来是刚刚拍的；请确认 | This photo appears to be just taken; please confirm | `age_seconds < 60` |
| 太旧（> 30 天） | 这张照片是 [N] 天前拍的；Daily 12 偏好最近 30 天的内容。如确认提交，请点击继续 | This photo is [N] days old; Daily 12 prefers content from the last 30 days. To submit anyway, tap Continue | `age_days > 30` · `outdated = true` |
| 未来时间 | 拍摄时间在未来；请检查设备时间或手动修改 | Captured time is in the future; please check your device time or adjust manually | `in_future = true` · 强阻塞 |
| 时区不确定 | 时区不确定；请选择你拍摄时所在时区 | Time zone uncertain; please select the time zone you were in | `tz_source = unknown` |

### 3.4 段 2 按钮

| 按钮 | zh-CN | English | 触发 |
|---|---|---|---|
| 主 CTA | 继续 | Continue | 进入段 3 |
| 次 CTA | ← 上一步 | ← Back | 回到段 1 |
| 修改时间链接 | 改一下 | Adjust | 展开 date/time picker |
| 未来时间阻塞 | — | — | "继续" 按钮禁用，直到时间有效 |

---

## §4 段 3 位置确认文案（LocationConfirm · C-04 联动）

### 4.1 页面主文案

**zh-CN**
```text
位置如何处理

[ 自动检测 ]
如果你允许位置权限，我们会用 GPS 验证你拍摄的城市。
GPS 仅用于验证，不会在公开内容中显示。

[ 手动选择 ]
如果你拒绝权限或选择手动选择，我们仅记录你选的城市。

我们不会：
✗ 公开显示你的 GPS 坐标
✗ 用你的位置向你推送广告或通知
✗ 与第三方共享你的位置
```

**English**
```text
How we handle location

[ Auto-detect ]
If you allow location access, we use GPS to verify the city where you took the photo.
GPS is used only for verification and will not appear in public content.

[ Manual selection ]
If you decline access or choose manual selection, we only record the city you select.

We will not:
✗ Publicly display your GPS coordinates
✗ Use your location to push ads or notifications
✗ Share your location with third parties
```

### 4.2 段 3 按钮 + 状态

| 元素 | zh-CN | English | 触发 |
|---|---|---|---|
| 主按钮 | 使用当前位置 | Use current location | 触发位置权限 |
| 次按钮 | 手动选择城市 | Choose city manually | 打开城市 picker |
| 返回 | ← 上一步 | ← Back | 回到段 2 |
| 定位中 | 正在解析城市… | Detecting city… | Loading |
| 定位成功 | ✓ 已定位到 [城市名] | ✓ Located in [city name] | `location_mode = auto_gps_city` |
| 定位降级（精度一般） | ✓ 已定位到 [城市名]（精度一般） | ✓ Located in [city name] (low accuracy) | `degraded = true` |
| GPS 信号弱 | GPS 信号弱；已尝试解析为 [城市名]，请确认 | GPS signal is weak; we guessed [city name], please confirm | `accuracy_meters > 500` |
| 城市不确定 | 已定位但城市不确定；请手动选择 | Located but city is uncertain; please choose manually | `city_id = null` |
| 无法获取 | 无法获取位置；请手动选择城市 | Couldn't get location; please choose a city manually | `error_code != null` |

### 4.3 位置权限拒绝 C-06 Banner

**zh-CN**
```text
你拒绝了位置权限。
SEE EARTH 仍然支持手动选择城市。

[ 手动选择城市 ]  [ 取消并返回 ]
```

**English**
```text
You declined location access.
SEE EARTH still supports choosing a city manually.

[ Choose city manually ]  [ Cancel and return ]
```

#### 位置受限（restricted / denied_permanent）

**zh-CN**
```text
你的设备权限受限，无法访问位置。
如需继续，请前往系统设置调整权限后重试。

[ 去系统设置 ]  [ 手动选择城市 ]  [ 取消并返回 ]
```

**English**
```text
Your device permissions are restricted. Location access is unavailable.
To continue, please adjust permissions in your system settings and try again.

[ Open system settings ]  [ Choose city manually ]  [ Cancel and return ]
```

### 4.4 城市选择（手动 / 降级通用）

| 元素 | zh-CN | English | 触发 |
|---|---|---|---|
| 页面标题 | 选择你的城市 | Choose your city | — |
| 搜索框 placeholder | 搜索城市 | Search city | — |
| 已选 | ✓ 你选择了 [城市名] | ✓ You selected [city name] | `location_mode = manual_city` |
| 不在 Seed | 抱歉，[城市名] 不在 SEE EARTH 当前覆盖范围；请选择其他城市 | Sorry, [city name] is not in SEE EARTH's current coverage; please choose another | `not_in_seed = true` |
| 重选 | 重新选择 | Choose another | 回到城市 picker |
| 取消 | 取消 | Cancel | 回到段 3 |

> **DO NOT**：
> - ❌ 不把权限拒绝设计为惩罚
> - ❌ 不暗示位置权限 = 必须授权
> - ❌ 不显示 GPS 精度数字（仅显示"信号弱"等语义）

---

## §5 段 4 短描述文案（DescriptionEntry）

### 5.1 页面主文案

**zh-CN**
```text
一句话描述（可选）

写下你在这个 Moment 想说的话。
不超过 280 字。
```

**English**
```text
One-line description (optional)

Write what you'd like to say about this Moment.
Up to 280 characters.
```

### 5.2 段 4 按钮 + 状态

| 元素 | zh-CN | English | 触发 |
|---|---|---|---|
| textarea placeholder | 例如：雨后的屋顶，远处有雷声 | e.g., rooftop after rain, distant thunder | — |
| 字符计数 | [N] / 280 | [N] / 280 | 实时 |
| 主 CTA | 继续到预览 | Continue to preview | 进入段 5 |
| 跳过按钮 | 跳过（不写描述） | Skip (no description) | 进入段 5（`description = null`） |
| 超长提示 | 已达字数上限 | Character limit reached | 硬上限 280（不阻塞） |
| 返回 | ← 上一步 | ← Back | 回到段 3 |

> **DO NOT**：
> - ❌ 不在 placeholder 暗示必须写
> - ❌ 不展示"AI 帮写"按钮（V1 无 AI 写作）
> - ❌ 不让"跳过"按钮比"继续"按钮更显眼（继续是主路径）

---

## §6 段 5 公开预览文案（C-05 SubmitPreview）

### 6.1 页面主文案

**zh-CN**
```text
公开预览

你即将提交的内容，审核通过后将以以下形式公开：

✓ 城市：[用户选定的城市]
✓ 拍摄时间：[captured_at，精确到分钟]
✓ 一句话：[用户输入的描述，可选]
✓ 照片：[照片缩略图]

不会公开：
✗ 精确 GPS / 原始 EXIF / 你的姓名或联系方式

如需修改，点击 [返回修改]；确认提交，点击 [确认提交]。
```

**English**
```text
Public preview

After moderation, your submission will be publicly displayed as:

✓ City: [user-selected city]
✓ Captured time: [captured_at, to the minute]
✓ One-line note: [user's description, optional]
✓ Photo: [photo thumbnail]

What will NOT be public:
✗ Precise GPS / Original EXIF / Your name or contact info

To edit, tap [Edit]. To confirm and submit, tap [Confirm submit].
```

### 6.2 隐私补充说明

**zh-CN**
```text
我们如何处理你的位置

公开：仅显示城市名
后台：精确位置用于验证拍摄城市，不会公开
撤回：可联系 [反馈入口] 申请删除

[ 查看完整 Privacy ]
```

**English**
```text
How we handle your location

Public: only the city name
Backend: precise location is used to verify the city of capture; it will not be public
Removal: contact [feedback] to request deletion

[ View full Privacy Policy ]
```

### 6.3 段 5 按钮

| 按钮 | zh-CN | English | 触发 |
|---|---|---|---|
| 主 CTA（桌面右侧） | 确认提交 | Confirm submit | 触发 `witness_upload_started` |
| 次 CTA（桌面左侧 / 移动底部 sticky） | ← 返回修改 | ← Edit | 回到段 4 |
| 链接 | 查看完整 Privacy | View full Privacy Policy | 打开 `/privacy`（新 tab） |
| 移动 Sticky bottom | [← 返回修改] [确认提交] | [← Edit] [Confirm submit] | — |

> **DO NOT**：
> - ❌ 不省略预览（任务卡 AC："用户在最终提交前能看见将被公开的内容"）
> - ❌ 不暗示提交后立即公开（必须经过审核）
> - ❌ 不使用 Modal 阻塞用户做选择

---

## §7 段 6 上传 + 结果文案

### 7.1 上传中（段 6a）

| 元素 | zh-CN | English | 触发 |
|---|---|---|---|
| 进度条文字 | 上传中 [N]% | Uploading [N]% | `progress_pct = N` |
| 弱网 | 网络较慢；正在继续上传 | Network is slow; upload continues | `network_class = slow_2g` |
| 后台中断 | 应用进入后台；上传已暂停 · 返回继续 | App went to background; upload paused · Resume | `paused = true` |
| 已恢复 | 已恢复上传 | Upload resumed | `paused = false` |
| 取消按钮 | 取消上传 | Cancel upload | 触发 user_cancelled（不发失败事件） |

### 7.2 上传失败 · 可重试

**zh-CN**
```text
上传失败：[简短原因]

[ 重试 ]  [ 返回首页 ]
```

**English**
```text
Upload failed: [brief reason]

[ Retry ]  [ Back to home ]
```

| 错误类型 | 简短原因 | Brief reason |
|---|---|---|
| 网络断开 | 网络已断开；请检查连接后重试 | Network lost; please check connection and retry |
| 上传超时 | 上传超时；请重试 | Upload timeout; please retry |
| 服务不可用 | 服务暂时不可用 | Service temporarily unavailable |
| 请求太频繁 | 请求太频繁；请 [N] 分钟后再试 | Too many requests; please try again in [N] minutes |

### 7.3 上传失败 · 不可重试

**zh-CN**
```text
提交失败：[简短原因]

[ 返回首页 ]
```

**English**
```text
Submission failed: [brief reason]

[ Back to home ]
```

| 错误类型 | 简短原因 | Brief reason |
|---|---|---|
| 内容验证 | 提交内容有误：[具体原因] | Submission invalid: [specific reason] |
| 权限阻止 | 这张照片包含位置信息；请使用不含位置的照片重试 | This photo contains location data; please use a photo without location data |
| 客户端校验 · 无照片 | 请先选择照片 | Please choose a photo first |
| 客户端校验 · 无城市 | 请先选择城市 | Please choose a city first |
| 客户端校验 · 未来时间 | 拍摄时间在未来；请修改 | Captured time is in the future; please adjust |
| 客户端校验 · 时间不可信 | 请先确认或修改拍摄时间 | Please confirm or adjust the captured time |
| 重试耗尽 | 重试已达上限；请稍后再来 | Retry limit reached; please try again later |

### 7.4 用户主动取消

**zh-CN**
```text
已取消上传
你的照片没有提交。

[ 重新开始 ]  [ 返回首页 ]
```

**English**
```text
Upload cancelled
Your photo was not submitted.

[ Start over ]  [ Back to home ]
```

### 7.5 提交成功（已受理）

**zh-CN**
```text
已提交

你的 Moment 已提交；进入审核队列。
我们会审核后决定是否出现在 Daily 12。

[ 知道了 ]
```

**English**
```text
Submitted

Your Moment has been submitted and is in the moderation queue.
We'll review it and decide whether it appears in Daily 12.

[ Got it ]
```

> **DO NOT**：
> - ❌ 不显示"即将发布"
> - ❌ 不显示"成功啦"过度庆祝
> - ❌ 不暗示"已被选中"

---

## §8 审核结果文案（P1 · V1 session 内显示）

> V1 无用户账户系统，**仅在 session 内记忆**。用户再次访问 `/witness/result?submission_id=XXX` 时显示。
> P1 引入账户后，状态将通过通知推送。

### 8.1 待审核

**zh-CN**
```text
审核中

你的 Moment 正在审核；进入 Daily 12 后你会看到。
```

**English**
```text
Under review

Your Moment is being reviewed; you'll see it if it enters Daily 12.
```

### 8.2 已发布

**zh-CN**
```text
已发布

你的 Moment 已发布！
在 [城市名] 看见它。

[ 看城市 ]  [ 返回首页 ]
```

**English**
```text
Published

Your Moment has been published!
See it in [city name].

[ View city ]  [ Back to home ]
```

### 8.3 未通过

**zh-CN**
```text
感谢你的提交

这次未能通过审核。
[可选] 原因：[moderation_reason 中文]

[ 知道了 ]
```

**English**
```text
Thanks for your submission

It wasn't accepted this time.
[optional] Reason: [moderation_reason English]

[ Got it ]
```

#### moderation_reason 枚举文案

| 原因 | zh-CN | English |
|---|---|---|
| `unsafe_content` | 内容安全审核未通过 | Failed content safety check |
| `low_quality` | 图片质量不满足要求 | Image quality below requirements |
| `wrong_location` | 位置与城市不匹配 | Location doesn't match the city |
| `not_a_moment` | 内容不符合 Moment 定义 | Content doesn't match Moment definition |
| `other` | 其他原因 | Other |

### 8.4 需要补充信息

**zh-CN**
```text
我们需要更多信息

[moderation_question 中文]

[ 补充信息 ]  [ 撤回 ]
```

**English**
```text
We need more information

[moderation_question English]

[ Add information ]  [ Withdraw ]
```

### 8.5 已撤回

**zh-CN**
```text
已撤回

[ 知道了 ]
```

**English**
```text
Withdrawn

[ Got it ]
```

### 8.6 提交已过期

**zh-CN**
```text
提交已过期

请重新提交。

[ 重新提交 ]
```

**English**
```text
Submission expired

Please submit again.

[ Submit again ]
```

---

## §9 公共文案组件

### 9.1 通用按钮

| 按钮 | zh-CN | English | 备注 |
|---|---|---|---|
| 主 CTA | 继续 | Continue | 推进流程 |
| 次 CTA | 取消 | Cancel | 中性动作 |
| 危险 | 取消并返回 | Cancel and return | 中性动作；不暗示惩罚 |
| 主 CTA · 提交 | 确认提交 | Confirm submit | 段 5 预览 |
| 主 CTA · 重试 | 重试 | Retry | 失败可重试 |
| 链接 · 政策 | 完整 Privacy | Full Privacy Policy | 新 tab |
| 链接 · 反馈 | 反馈入口 | Feedback | 新 tab / modal |
| 系统设置 | 去系统设置 | Open system settings | 跨权限受限场景 |

### 9.2 错误信息

| 场景 | zh-CN | English | 备注 |
|---|---|---|---|
| 通用 | 出错了；请稍后再试 | Something went wrong; please try again | 不暴露技术细节 |
| 错误 ID | 错误 ID：[short_id]（供反馈时引用） | Error ID: [short_id] (quote in feedback) | 来自 E-P0-10 |
| 网络 | 网络异常 | Network error | 简短 |
| 服务不可用 | 服务暂时不可用；我们正在修复 | Service temporarily unavailable; we're working on it | 不承诺恢复时间 |

### 9.3 提示气泡（Toast）

| 场景 | zh-CN | English |
|---|---|---|
| 已恢复上传 | 已恢复上传 | Upload resumed |
| 城市已选 | 已选择 [城市名] | [city name] selected |
| 草稿已恢复 | 已恢复上次填写 | Previous draft restored |
| 撤回成功 | 已撤回 | Withdrawn |
| 重新定位 | 正在重新定位 | Re-locating |

### 9.4 加载文案

| 场景 | zh-CN | English |
|---|---|---|
| 通用加载 | 加载中… | Loading… |
| 上传中 | 上传中 [N]% | Uploading [N]% |
| 解析城市 | 正在解析城市… | Detecting city… |
| 读取 EXIF | 读取照片信息… | Reading photo info… |
| 提交中 | 提交中… | Submitting… |

### 9.5 空状态

| 场景 | zh-CN | English |
|---|---|---|
| 无草稿 | 没有可恢复的草稿 | No draft to restore |
| 无城市匹配 | 没有匹配的城市；请尝试其他关键词 | No matching city; please try other keywords |

---

## §10 隐私文案总览（与 consent-placement-v1.md C-03~C-06 一致）

| 位置 | 来源 | 详细 |
|---|---|---|
| 段 0 入口 | C-03 | §1.1 · §1.2 |
| 段 3 位置 | C-04 | §4.1 |
| 段 5 预览 | C-05 | §6.1 · §6.2 |
| 权限拒绝 | C-06 | §2.3 · §4.3 |

> **所有隐私文案统一原则**（与 E-P0-05 位置隔离一致）：
> 1. **公开 = 城市级**：永远只显示"城市名"
> 2. **后台 = 仅审核**：精确位置仅用于验证 / 风险控制，不公开
> 3. **不暗示绝对匿名**：用"用于验证" / "不会公开"等具体动作描述
> 4. **可撤回**：用户可联系反馈入口申请删除
> 5. **不展示禁采字段**：不展示 GPS 精度数字 / EXIF 设备信息 / 第三方 ID

---

## §11 文案风格规则（与 A2 VF 1.2 一致）

| 维度 | 规则 | 备注 |
|---|---|---|
| **语气** | 第二人称"你"；不用"用户" | 与 Echo / Unknown 一致 |
| **时态** | 一般现在时；不用"将"承诺 | 诚实 |
| **专业度** | 不使用法律黑话；不写"数据控制者"等术语 | 可理解 |
| **长度** | 单段落 ≤ 80 字；卡片 ≤ 4 行 | 阅读压力低 |
| **强调** | 重要项用 ✓ / ✗ 符号，不全大写 | 不吼叫 |
| **数字** | 不显示精度数字（GPS 精度 / 字节数等） | 隐私友好 |
| **链接** | 文末"完整 Privacy"链接到 P0-7 | 不藏在 footer |

> **DO NOT**：
> - ❌ 不使用感叹号堆叠（"快来！快来！快来！"）
> - ❌ 不使用 emoji（"🚀 上传成功"）— 保持 A2 编辑感
> - ❌ 不使用"亲 / 宝宝 / 各位"等过度亲昵
> - ❌ 不写"恭喜"等过度庆祝（成功也是审核前的中性动作）

---

## §12 自验收（任务卡 Acceptance Criteria 8 项）

| # | 验收项 | 状态 | 证据 |
|---|---|---|---|
| 1 | 中英双语完整 | ✅ | 每条文案都给 zh-CN + English |
| 2 | 5 大状态文案全部覆盖 | ✅ | §1-§8 + §9 公共组件 |
| 3 | 权限拒绝文案明确 + 不惩罚 + 替代路径 | ✅ | §2.3 / §4.3 / §9.1 "取消并返回" |
| 4 | 公开预览仅城市级 | ✅ | §6.1 不会公开列表 |
| 5 | 不暗示绝对匿名 | ✅ | §1.2 / §4.1 / §6.2 / §10 |
| 6 | 不暗示提交 = 自动公开 | ✅ | §6.1 "审核通过后" / §7.5 "进入审核队列" |
| 7 | 不展示精确 GPS / EXIF | ✅ | §4.2 / §9.2 / §10 |
| 8 | 与 consent-placement-v1.md C-03~C-06 一致 | ✅ | §1-§6 引用 C-03~C-05；§2.3 / §4.3 引用 C-06 |

---

**End of copy-final-v1.md · D-P0-02 子产物 3/5**
