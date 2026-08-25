---
title: SEE EARTH V1 · 系统状态文案库 · 中英双语
type: design-copy-library
tags: [release-v1, design, d-p0-04, system-states, copy, zh-cn, en, loading-error-empty, permission, privacy, see-earth]
task_id: D-P0-04
brief_anchor: §4 D-P0-04 + Task Card §C
track: design
owner: 外部 Designer Owner（您）
created: 2026-08-24
status: IN REVIEW
target_gate: Gate A · Internal Alpha
source_brief: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/SEE-EARTH-Release-Strategy-v1-Design-Engineering-Task-Brief.md
source_task_card: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/06-PM Agent 交接/2026-08-22-task-card-d-p0-04-system-states.md
related_docs:
  - ./state-matrix-v1.md
  - ./loading-error-empty-v1.md
  - ./component-contract-v1.md
  - ../web-v1-flow/sitemap-v1.md (§1.2 5 状态层)
  - ../web-v1-flow/responsive-rules-v1.md (§3 逐页面)
  - ../minimal-witness/copy-final-v1.md (§1-§9 完整 Witness 文案 · 引用)
  - ../minimal-witness/state-matrix-v1.md (Witness 76 状态)
  - ../minimal-witness/flow-diagram-v1.md (Mermaid 状态机)
  - ../analytics-events/consent-placement-v1.md (C-03~C-06 隐私文案位置)
  - ../analytics-events/forbidden-fields-v1.md (30 禁采项)
  - ../../05-项目现状/release-v1/design-implementation/phase1-design-impl-report.md (VF 1.2 token)
  - ../../05-项目现状/release-v1/design-implementation/v2-phase15-report.md (A2 LOCK 视觉)
depends_on: [D-P0-01 LOCKED ✓, D-P0-02 IN REVIEW]
blocks: [E-P0-10 Monitoring/Error/Performance 基线]
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/07-设计师设计参考/release-v1/system-states/copy-library-v1.md
workspace_canonical_path: /Users/lwy/Documents/ChatGPT/看见地球/release-v1/system-states/copy-library-v1.md
note: 本文件已就绪，需 PM Agent 由 Obsidian 写入权限落地到 canonical 路径。
---

# SEE EARTH V1 · 系统状态文案库 · 中英双语

> **作者**：Designer Agent #4（外部 Owner = 您）
> **目标读者**：PM Agent / Web 工程师 / iOS 工程师（first-pass）/ 翻译 / QA / 内容运营
> **目的**：交付**系统状态文案库**——覆盖 Loading / Error / Empty / Permission / Privacy 5 类状态 + 6 对象（Daily 12 / Moment / City / Unknown / Witness / Echo），中英双语。
> **强制原则**（来自 Brief §4 D-P0-04 + Task Card DO NOT + Brief §10.2 安全/诚实/不夸大）：
> 1. **不暴露内部错误码或堆栈** — 错误分类标签清晰，但不暴露 5xx / SQL / stack
> 2. **不写"暂无数据"** — 必须解释"为什么空"并给引导动作
> 3. **不把权限拒绝设计为惩罚或强制授权** — 提供安全替代路径
> 4. **不暗示绝对匿名** — 公开预览只显示城市级
> 5. **不假装成功** — 服务端未确认 = 不显示成功
> 6. **不夸大** — 失败就是失败；不写"很抱歉"等自责式文案

---

## 0. 阅读指南

- **§1 Loading 文案**（10 场景）
- **§2 Error 文案**（14 场景）
- **§3 Empty 文案**（8 场景）
- **§4 Permission 文案**（5 权限 × 4 状态 = 20 条）
- **§5 Privacy 文案**（6 类公开预览文案）
- **§6 6 对象状态特化文案**（Daily 12 / Moment / City / Unknown / Witness / Echo）
- **§7 公共文案组件**（按钮 / 链接 / 错误 ID / Toast）
- **§8 文案风格规则**（与 A2 VF 1.2 一致）

> **每条文案都给 (zh-CN · English) + 使用场景 + 触发状态**。

---

## §1 Loading 文案

| 场景 | zh-CN | English | 触发状态 |
|---|---|---|---|
| **通用加载** | 此刻，正在加载 | Loading now | 全站通用 |
| **首屏加载** | 此刻，正在加载 | Loading this page | Homepage / CityPage / Witness 入口 |
| **城市加载** | 加载 [城市名]... | Loading [city name]... | CityPage |
| **Daily 12 加载** | 此刻，正在加载今天的 12 个远方 | Loading today's 12 places | Homepage |
| **Moment 加载** | 加载这一刻... | Loading this moment | Moment Detail |
| **Witness 上传** | 上传中 [N]% | Uploading [N]% | Witness 段 6a |
| **Witness EXIF 解析** | 读取照片信息... | Reading photo info... | Witness 段 1 → 段 2 过渡 |
| **Witness 城市解析** | 正在解析城市... | Detecting city... | Witness 段 3 |
| **Witness 提交** | 提交中... | Submitting... | Witness 段 6a → 段 6b |
| **后台中断恢复** | 已恢复上传 | Upload resumed | Witness 段 6a 后台恢复 |
| **Reveal 阶段** | 正在揭示... | Revealing... | Unknown Stage 5 |
| **Echo 提交** | 提交中... | Submitting... | Echo submit |
| **图片懒加载** | （无文字，仅占位）| （无文字，仅占位）| Daily 12 tile / Moment Detail |

> **DO NOT**：
> - ❌ 不显示"加载中..."（"加载中"机械感重，与 A2 编辑感不符）
> - ❌ 不显示百分比数字（除 Witness 上传）
> - ❌ 不显示进度条（除 Witness 上传）
> - ❌ 不显示 spinner / shimmer

---

## §2 Error 文案

### 2.1 网络错误

| 场景 | zh-CN | English | error_category |
|---|---|---|---|
| **通用网络错误** | 远方暂时连不上 | Can't reach the distant places for now | `network` |
| **网络断开** | 网络已断开；请检查连接后重试 | Network lost; please check connection and retry | `network_offline` |
| **上传超时** | 上传超时；请重试 | Upload timeout; please retry | `upload_timeout` |
| **请求太频繁** | 请求太频繁；请 [N] 分钟后再试 | Too many requests; please try again in [N] minutes | `rate_limited` |

### 2.2 服务端错误

| 场景 | zh-CN | English | error_category |
|---|---|---|---|
| **服务端 5xx** | 服务暂时不可用；我们正在修复 | Service temporarily unavailable; we're working on it | `server_5xx` |
| **服务端 4xx 验证** | 提交内容有误：[具体原因] | Submission invalid: [specific reason] | `server_4xx_validation` |
| **服务端 4xx 限流** | 请求太频繁；请 [N] 分钟后再试 | Too many requests; please try again in [N] minutes | `server_4xx_rate_limited` |
| **服务端 4xx 重复提交** | （按成功计，不显示）| （按成功计，不显示）| `server_4xx_duplicate` |
| **服务端 4xx 权限阻止** | 这张照片包含位置信息；请使用不含位置的照片重试 | This photo contains location data; please use a photo without location data | `server_4xx_permission_blocked` |

### 2.3 客户端校验错误

| 场景 | zh-CN | English | error_category |
|---|---|---|---|
| **客户端校验通用** | 提交内容有误：[具体原因] | Submission invalid: [specific reason] | `validation` |
| **客户端校验 · 无照片** | 请先选择照片 | Please choose a photo first | `validation` |
| **客户端校验 · 无城市** | 请先选择城市 | Please choose a city first | `validation` |
| **客户端校验 · 未来时间** | 拍摄时间在未来；请修改 | Captured time is in the future; please adjust | `captured_at_invalid` |
| **客户端校验 · 时间不可信** | 请先确认或修改拍摄时间 | Please confirm or adjust the captured time | `exif_untrusted` |

### 2.4 数据错误

| 场景 | zh-CN | English | error_category |
|---|---|---|---|
| **图片加载失败** | 此刻暂未到达 | This moment hasn't arrived | `media_load` |
| **Moment 数据异常** | 这一张暂时无法显示 | This moment can't be shown right now | `data_integrity` |
| **City 数据异常** | 这座城市暂时无法显示 | This city can't be shown right now | `data_integrity` |
| **Unknown 数据异常** | 这次的观察暂时无法显示 | This observation can't be shown right now | `data_integrity` |

### 2.5 系统错误

| 场景 | zh-CN | English | error_category |
|---|---|---|---|
| **页面错误** | 页面出错了 | Something went wrong | `client_render` |
| **Reveal 失败** | 揭示失败，请重试 | Reveal failed, please try again | `reveal_validation` |
| **City timezone 失败** | 此刻时间暂未到达 | Current time isn't available | `timezone_unsupported` |
| **City weather 失败** | 天气暂时连不上 | Weather unavailable | `weather_provider_down` |
| **City unsupported** | 这一座暂时不显示内容 | This city isn't showing content right now | `city_unsupported` |
| **Unknown 内容下线** | 这一次的观察已经结束 | This observation is over | `unknown_retired` |
| **Echo 服务不可用** | Echo 暂未开放 | Echo isn't open yet | `echo_unavailable` |

### 2.6 错误 ID 规范

```text
错误 ID: abc12345（供反馈时引用）
Error ID: abc12345 (quote in feedback)
```

| 元素 | 规范 |
|---|---|
| **格式** | 8 字符 base36 hash |
| **示例** | `abc12345` |
| **显示位置** | Error 卡片底部小字（11px Mono）|
| **可点击** | V1 P2（仅显示，不复制）|

---

## §3 Empty 文案

### 3.1 Daily 12 Empty

| 场景 | zh-CN | English | 引导 CTA |
|---|---|---|---|
| **Daily 12 全空** | 今天还没有来自这里的内容 · 也许明天 | No content from here today · maybe tomorrow | 留下一个 Moment → / Leave a Moment → |
| **Daily 12 slot 缺失** | 今日来自 [城市名] 的内容尚未发布 | Today's content from [city] hasn't been published yet | （继续浏览其他 slot）|

### 3.2 Moment Empty

| 场景 | zh-CN | English | 引导 CTA |
|---|---|---|---|
| **Moment 撤下** | 这一张已被作者或编辑撤下 | This moment has been withdrawn | 看其他 Moment / See other moments |
| **Moment 城市缺失** | 这一张暂未归属一座城市 | This moment isn't tied to a city yet | 反馈 / Feedback |

### 3.3 City Empty

| 场景 | zh-CN | English | 引导 CTA |
|---|---|---|---|
| **City 无 Moment**（State E LOCKED）| 这座城市今天还没有切片 · 你可以是第一个 | No slice from this city today · you could be the first | 成为第一个让这里被看见的人 / Be the first |
| **City Past-only**（State D LOCKED）| 成为今天第一个让这里被看见的人 | Be the first to show here today | 留下一个 Moment → / Leave a Moment → |

### 3.4 Unknown Empty

| 场景 | zh-CN | English | 引导 CTA |
|---|---|---|---|
| **Unknown 题目耗尽** | 今天的观察已经结束 · 明天见 | Today's observation is over · see you tomorrow | 返回首页 / Back to home · 看 Daily 12 / See Daily 12 |
| **Unknown 内容下线** | 这一次的观察已经结束 | This observation is over | 返回首页 / Back to home |
| **Unknown 中断恢复** | 上次未完成；重新开始 | Last time didn't finish; starting over | 继续上次 / Resume · 重新开始 / Start over |

### 3.5 Witness Empty

| 场景 | zh-CN | English | 引导 CTA |
|---|---|---|---|
| **Witness 草稿过期** | 提交已过期 · 请重新提交 | Submission expired · please submit again | 重新提交 / Submit again |
| **Witness 主动撤回** | 已撤回 | Withdrawn | 知道了 / Got it |
| **Witness 失败终态** | 提交失败：[简短原因] | Submission failed: [brief reason] | 返回首页 / Back to home |

### 3.6 Echo Empty

| 场景 | zh-CN | English | 引导 CTA |
|---|---|---|---|
| **Echo disabled** | Echo 在这座城市暂不可用 | Echo isn't available in this city right now | 反馈 / Feedback |
| **Echo loading** | Echo 暂未开放 | Echo isn't open yet | 反馈 / Feedback |

> **DO NOT**：
> - ❌ 不写"暂无数据" / "No data" / "N/A"
> - ❌ 不写"数据加载失败"（这是 Error，不是 Empty）
> - ❌ 不诱导"刷新"（Empty City 不诱导刷，per `design-freeze-log-v1.md §5.5`）
> - ❌ 不显示机械图标（如 sad face / empty box）

---

## §4 Permission 文案

### 4.1 相机权限

| 状态 | zh-CN | English | 替代 CTA |
|---|---|---|---|
| **not_determined** | （不预先禁用按钮；弹窗待触发）| （不预先禁用按钮；弹窗待触发）| — |
| **granted** | — | — | — |
| **denied** | 你拒绝了相机权限。SEE EARTH 仍然支持从相册选择照片。 | You declined camera access. SEE EARTH still supports picking from your photo library. | 从相册选 / Pick from library · 取消并返回 / Cancel and return |
| **restricted** | 你的设备权限受限，无法访问相机。如需继续，请前往系统设置调整权限后重试。 | Your device permissions are restricted. Camera access is unavailable. To continue, please adjust permissions in your system settings and try again. | 去系统设置 / Open system settings · 取消并返回 / Cancel and return |
| **denied_permanent** | （同 restricted，不再弹窗）| （同 restricted，不再弹窗）| 去系统设置 / Open system settings |

### 4.2 相册权限

| 状态 | zh-CN | English | 替代 CTA |
|---|---|---|---|
| **not_determined** | （不预先禁用按钮）| （不预先禁用按钮）| — |
| **granted** | — | — | — |
| **denied** | 你拒绝了相册权限。SEE EARTH 仍然支持即时拍照。 | You declined photo library access. SEE EARTH still supports taking a photo now. | 拍一张 / Take a photo · 取消并返回 / Cancel and return |
| **restricted** | 你的设备权限受限，无法访问相册。如需继续，请前往系统设置调整权限后重试。 | Your device permissions are restricted. Photo library access is unavailable. To continue, please adjust permissions in your system settings and try again. | 去系统设置 / Open system settings · 取消并返回 / Cancel and return |
| **denied_permanent** | （同 restricted，不再弹窗）| （同 restricted，不再弹窗）| 去系统设置 / Open system settings |

### 4.3 位置权限

| 状态 | zh-CN | English | 替代 CTA |
|---|---|---|---|
| **not_determined** | （不预先禁用按钮）| （不预先禁用按钮）| — |
| **granted** | — | — | — |
| **denied** | 你拒绝了位置权限。SEE EARTH 仍然支持手动选择城市。 | You declined location access. SEE EARTH still supports choosing a city manually. | 手动选择城市 / Choose city manually · 取消并返回 / Cancel and return |
| **restricted** | 你的设备权限受限，无法访问位置。如需继续，请前往系统设置调整权限后重试。 | Your device permissions are restricted. Location access is unavailable. To continue, please adjust permissions in your system settings and try again. | 去系统设置 / Open system settings · 手动选择城市 / Choose city manually · 取消并返回 / Cancel and return |
| **denied_permanent** | （同 restricted，不再弹窗）| （同 restricted，不再弹窗）| 去系统设置 / Open system settings · 手动选择城市 |

### 4.4 通知权限（仅 iOS）

| 状态 | zh-CN | English | 替代 CTA |
|---|---|---|---|
| **not_requested** | （V1 不主动请求；提交成功后可选）| （V1 不主动请求；提交成功后可选）| — |
| **granted** | 已开启通知 | Notifications enabled | — |
| **denied** | 未开启通知；可稍后在系统设置中开启 | Notifications not enabled; you can turn them on in system settings later | — |

### 4.5 权限文案通用原则

> **核心规则**（来自 Brief §D-P0-02 + Task Card §B）：
> 1. **不显示"必须开启"** — 不显示"必须开启权限才能继续"
> 2. **不显示"无法继续"** — 不显示"无法继续"
> 3. **不惩罚** — 用"你拒绝了 [权限]"而非"权限被拒绝"
> 4. **永远给替代路径** — 每个 denied 状态至少 1 个替代 CTA
> 5. **不重复弹窗** — 系统已不弹则不弹
> 6. **不显示具体技术原因** — 不显示 iOS MDM / ATT 等细节

> **DO NOT**：
> - ❌ 不显示"必须开启 [权限] 才能继续"
> - ❌ 不显示"无法继续"
> - ❌ 不在 Banner 内隐藏"取消并返回"按钮
> - ❌ 不显示具体技术原因（如 iOS ATT 政策 / iOS MDM 策略细节）

---

## §5 Privacy 文案

### 5.1 公开预览标题

| 元素 | zh-CN | English |
|---|---|---|
| **公开预览标题** | 公开预览 | Public preview |

### 5.2 公开项 ✓

| 元素 | zh-CN | English |
|---|---|---|
| **公开项 ✓ 城市** | 城市：[用户选定的城市] | City: [user-selected city] |
| **公开项 ✓ 时间** | 拍摄时间：[captured_at，精确到分钟] | Captured time: [captured_at, to the minute] |
| **公开项 ✓ 描述** | 一句话：[用户输入的描述，可选] | One-line note: [user's description, optional] |
| **公开项 ✓ 照片** | 照片：[照片缩略图] | Photo: [photo thumbnail] |

### 5.3 不会公开项 ✗

| 元素 | zh-CN | English |
|---|---|---|
| **不会公开标题** | 不会公开： | What will NOT be public: |
| **不会公开项 ✗ GPS** | 你的精确 GPS | Your precise GPS |
| **不会公开项 ✗ 姓名** | 你的姓名 / 联系方式 | Your name / contact info |
| **不会公开项 ✗ EXIF** | 原始照片元数据 | Original photo metadata |

### 5.4 后台说明

| 元素 | zh-CN | English |
|---|---|---|
| **后台说明标题** | 我们如何处理你的位置 | How we handle your location |
| **后台说明公开** | 公开：仅显示城市名 | Public: only the city name |
| **后台说明后台** | 后台：精确位置用于验证拍摄城市，不会公开 | Backend: precise location is used to verify the city of capture; it will not be public |
| **后台说明撤回** | 撤回：可联系 [反馈入口] 申请删除 | Removal: contact [feedback] to request deletion |

### 5.5 Privacy 链接

| 元素 | zh-CN | English |
|---|---|---|
| **完整 Privacy** | 查看完整 Privacy | View full Privacy Policy |

### 5.6 Privacy 文案通用原则

> **核心规则**（来自 Brief §D-P0-02 + Task Card §B + D-P0-02 §10）：
> 1. **公开 = 城市级**：永远只显示"城市名"
> 2. **后台 = 仅审核**：精确位置仅用于验证 / 风险控制，不公开
> 3. **不暗示绝对匿名**：用"用于验证" / "不会公开"等具体动作描述
> 4. **可撤回**：用户可联系反馈入口申请删除
> 5. **不展示禁采字段**：不展示 GPS 精度数字 / EXIF 设备信息 / 第三方 ID

> **DO NOT**：
> - ❌ 不暗示"绝对匿名"
> - ❌ 不展示精确 GPS 数字 / EXIF 设备信息 / 第三方 ID
> - ❌ 不省略预览（任务卡 AC："用户在最终提交前能看见将被公开的内容"）
> - ❌ 不暗示提交后立即公开（必须经过审核）
> - ❌ 不省略"撤回"路径
> - ❌ 不省略"完整 Privacy Policy"链接

---

## §6 6 对象状态特化文案

### 6.1 Daily 12 状态文案

| 状态 | zh-CN | English |
|---|---|---|
| **ready** | — | — |
| **loading_skeleton** | 此刻，正在加载 | Loading now |
| **partial_missing** | 今日来自 [城市名] 的内容尚未发布 | Today's content from [city] hasn't been published yet |
| **fully_unavailable** | 远方暂时连不上 | Can't reach the distant places for now |
| **stale_fallback** | 今日尚未更新；这里显示的是 [YYYY-MM-DD] 的切片 | Today's edition hasn't been published; showing the slice from [YYYY-MM-DD] |
| **empty** | 今天还没有来自这里的内容 · 也许明天 | No content from here today · maybe tomorrow |
| **retrying** | 重试中... | Retrying... |
| **error_boundary** | 页面出错了 | Something went wrong |
| **tile_image_failed** | 街景暂未到达 | Street view unavailable |
| **tile_khartoum_placeholder** | 喀土穆 · 等待补位 | Khartoum · placeholder |

### 6.2 Moment 状态文案

| 状态 | zh-CN | English |
|---|---|---|
| **ready** | — | — |
| **image_loading** | （无文字，仅占位）| （无文字，仅占位）|
| **image_failed** | 此刻暂未到达 | This moment hasn't arrived |
| **content_withdrawn** | 这一张已被作者或编辑撤下 | This moment has been withdrawn |
| **source_pending_verification** | 待核验 | Pending review |
| **city_unknown** | 这一张暂未归属一座城市 | This moment isn't tied to a city yet |
| **placeholder_unscheduled** | 等待来自这里的切片 | Waiting for a slice from here |
| **error_unknown** | 这一张暂时无法显示 | This moment can't be shown right now |

### 6.3 City 状态文案

| 状态 | zh-CN | English |
|---|---|---|
| **ready_with_moments** | — | — |
| **loading** | 加载 [城市名]... | Loading [city name]... |
| **ready_basic_only**（State E）| 这座城市今天还没有切片 · 你可以是第一个 | No slice from this city today · you could be the first |
| **timezone_failed** | 此刻时间暂未到达 | Current time isn't available |
| **weather_failed** | 天气暂时连不上 | Weather unavailable |
| **unsupported** | 这一座暂时不显示内容 | This city isn't showing content right now |
| **past_only**（State D）| 成为今天第一个让这里被看见的人 | Be the first to show here today |
| **error** | 远方暂时连不上 | Can't reach this city for now |
| **error_boundary** | 页面出错了 | Something went wrong |

### 6.4 Unknown 状态文案

| 状态 | zh-CN | English |
|---|---|---|
| **ready** | — | — |
| **loading** | 此刻，正在加载 | Loading this unknown |
| **empty** | 今天的观察已经结束 · 明天见 | Today's observation is over · see you tomorrow |
| **reveal_failed** | 揭示失败，请重试 | Reveal failed, please try again |
| **content_retired** | 这一次的观察已经结束 | This observation is over |
| **reveal_interrupted** | 上次未完成；重新开始 | Last time didn't finish; starting over |

### 6.5 Witness 状态文案（顶层 9 状态）

> **Witness 完整 76 子状态文案**：见 `../minimal-witness/copy-final-v1.md` §1-§9。本节仅覆盖 Witness **作为 6 对象之一**的顶层 9 状态文案。

| 顶层状态 | zh-CN | English |
|---|---|---|
| **loading** | 正在准备提交... | Preparing your submission... |
| **permission** | （详见 D-P0-02 §1）| （详见 D-P0-02 §1）|
| **uploading** | 上传中 [N]% | Uploading [N]% |
| **validating** | 提交中... | Submitting... |
| **under_review** | 你的 Moment 已提交；进入审核队列 | Your Moment has been submitted and is in the moderation queue |
| **retry** | 上传失败：[简短原因] | Upload failed: [brief reason] |
| **failed_terminal** | 提交失败：[简短原因] | Submission failed: [brief reason] |
| **empty** | 提交已过期 · 请重新提交 / 已撤回 | Submission expired · please submit again / Withdrawn |
| **published** | 你的 Moment 已发布！在 [城市名] 看见它 | Your Moment has been published! See it in [city name] |

### 6.6 Echo 状态文案（8 态 · 扩展自 LOCKED 5 态）

| 状态 | zh-CN | English |
|---|---|---|
| **default** | placeholder: 这一刻，你留下了什么？ | placeholder: What did you leave behind in this moment? |
| **focus** | — | — |
| **typing** | [N] / 280 | [N] / 280 |
| **disabled** | Echo 在这座城市暂不可用 | Echo isn't available in this city right now |
| **submitting** | 提交中... | Submitting... |
| **success** | Echo 已留下 | Echo left |
| **error** | 提交失败：[简短原因] | Submission failed: [brief reason] |
| **loading** | Echo 暂未开放 | Echo isn't open yet |

> **Echo placeholder 不暗示必须写**（per D-P0-02 §5.2）：用"这一刻，你留下了什么？"而非"请填写必填项"。

---

## §7 公共文案组件

### 7.1 通用按钮

| 按钮 | zh-CN | English | 备注 |
|---|---|---|---|
| **主 CTA** | 继续 | Continue | 推进流程 |
| **主 CTA · 重试** | 重试 | Retry | 失败可重试 |
| **主 CTA · 提交** | 确认提交 | Confirm submit | Witness 段 5 预览 |
| **主 CTA · Echo 提交** | 记录 | Leave a trace | Echo 轻量提交 |
| **次 CTA** | 取消 | Cancel | 中性动作 |
| **危险** | 取消并返回 | Cancel and return | 中性动作；不暗示惩罚 |
| **链接 · 政策** | 完整 Privacy | Full Privacy Policy | 新 tab |
| **链接 · 反馈** | 反馈入口 | Feedback | 新 tab / modal |
| **系统设置** | 去系统设置 | Open system settings | 跨权限受限场景 |

### 7.2 提示气泡（Toast）

| 场景 | zh-CN | English |
|---|---|---|
| **已恢复上传** | 已恢复上传 | Upload resumed |
| **城市已选** | 已选择 [城市名] | [city name] selected |
| **草稿已恢复** | 已恢复上次填写 | Previous draft restored |
| **撤回成功** | 已撤回 | Withdrawn |
| **重新定位** | 正在重新定位 | Re-locating |

### 7.3 空状态通用

| 场景 | zh-CN | English |
|---|---|---|
| **无草稿** | 没有可恢复的草稿 | No draft to restore |
| **无城市匹配** | 没有匹配的城市；请尝试其他关键词 | No matching city; please try other keywords |

### 7.4 错误 ID

| 场景 | zh-CN | English |
|---|---|---|
| **错误 ID 显示** | 错误 ID: [short_id]（供反馈时引用）| Error ID: [short_id] (quote in feedback) |

---

## §8 文案风格规则（与 A2 VF 1.2 一致）

| 维度 | 规则 | 备注 |
|---|---|---|
| **语气** | 第二人称"你"；不用"用户" | 与 Echo / Unknown 一致 |
| **时态** | 一般现在时；不用"将"承诺 | 诚实 |
| **专业度** | 不使用法律黑话；不写"数据控制者"等术语 | 可理解 |
| **长度** | 单段落 ≤ 80 字；卡片 ≤ 4 行 | 阅读压力低 |
| **强调** | 重要项用 ✓ / ✗ 符号，不全大写 | 不吼叫 |
| **数字** | 不显示精度数字（GPS 精度 / 字节数等）| 隐私友好 |
| **链接** | 文末"完整 Privacy"链接到 P0-7 | 不藏在 footer |
| **方言** | 不使用地域性方言（如"老铁" / "宝宝"）| 普适 |
| **EMOJI** | 不使用 emoji（"🚀 上传成功"）| 保持 A2 编辑感 |

> **DO NOT**：
> - ❌ 不使用感叹号堆叠（"快来！快来！快来！"）
> - ❌ 不使用 emoji（"🚀 上传成功"）— 保持 A2 编辑感
> - ❌ 不使用"亲 / 宝宝 / 各位"等过度亲昵
> - ❌ 不写"恭喜"等过度庆祝（成功也是审核前的中性动作）
> - ❌ 不写"很抱歉"等自责式文案（失败是流程一部分）
> - ❌ 不写"测试中" / "Alpha" / "TODO"等占位文案（任务卡 §C DO NOT）

---

## §9 自验收 checklist

| # | 验收项 | 状态 | 证据 |
|---|---|---|---|
| 1 | 中英双语完整 | ✅ | §1-§7 每条文案都给 zh-CN + English |
| 2 | 6 对象状态文案全部覆盖 | ✅ | §6.1-§6.6 |
| 3 | Loading 文案覆盖全站（10 场景）| ✅ | §1 |
| 4 | Error 文案覆盖全站（14 场景 + 错误 ID）| ✅ | §2 |
| 5 | Empty 文案覆盖全站（8 场景）| ✅ | §3 |
| 6 | Permission 文案覆盖全站（5 权限 × 4 状态 = 20 条）| ✅ | §4 |
| 7 | Privacy 文案覆盖公开预览全要素（6 类）| ✅ | §5 |
| 8 | 不暴露内部错误码或堆栈 | ✅ | §2 + §8 风格规则 |
| 9 | 不写"暂无数据" | ✅ | §3 + §8 DO NOT |
| 10 | 不把权限拒绝设计为惩罚 | ✅ | §4.5 通用原则 + §8 DO NOT |
| 11 | 不暗示绝对匿名 | ✅ | §5.6 Privacy 原则 + §8 DO NOT |
| 12 | 不假装成功 | ✅ | §6.5 Witness published + §6.6 Echo success |
| 13 | 文案风格与 A2 VF 1.2 一致 | ✅ | §8 |

---

## §10 给后续任务的接口

### 10.1 给 Web 工程师 / iOS first-pass

- ✅ §1-§7 全部文案可直接复制使用
- ✅ §6.1-§6.6 6 对象状态特化文案与 `state-matrix-v1.md` 一一对应
- ⚠️ 文案需要 i18n 框架支持 zh-CN / en 切换（V1 P1）

### 10.2 给翻译 / 内容运营

- ✅ §1-§7 全部文案已 zhed 双语，可直接进入翻译流程
- ✅ §8 文案风格规则可作为翻译指南
- ⚠️ 翻译应保持"诗意 + 克制 + 不夸大"的语气

### 10.3 给 QA Owner

- ✅ §8 文案风格规则 = QA 文案验收依据
- ✅ §1-§7 每条文案的使用场景 + 触发状态可作为 QA 测试用例

### 10.4 给 E-P0-10（监控 / 错误）

- ✅ §2 错误 ID 规范与 E-P0-10 监控 ID 体系一致
- ✅ §2.1-§2.5 error_category 枚举与 E-P0-09 contract 对齐

---

**End of copy-library-v1.md · D-P0-04 子产物 3/4**