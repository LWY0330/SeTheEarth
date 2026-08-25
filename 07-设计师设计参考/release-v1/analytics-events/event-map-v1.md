---
title: SEE EARTH V1 · Analytics Event Map · 事件—页面—组件映射表
type: analytics-event-map
tags: [release-v1, design, d-p0-05, analytics, events, event-map, see-earth]
task_id: D-P0-05
brief_anchor: §4 D-P0-05 / §1.2 V1 必答问题
track: design
owner: 外部 Designer Owner（您）
created: 2026-08-22
status: IN REVIEW
target_gate: Gate A · Internal Alpha
source_brief: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/SEE-EARTH-Release-Strategy-v1-Design-Engineering-Task-Brief.md
source_task_card: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/06-PM Agent 交接/2026-08-22-task-card-d-p0-05-analytics-events.md
related_docs:
  - ./trigger-diagram-v1.md
  - ./forbidden-fields-v1.md
  - ./consent-placement-v1.md
depends_on: []
blocks: [E-P0-07]
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/07-设计师设计参考/release-v1/analytics-events/event-map-v1.md
note: 本文件已就绪，需 PM Agent 由 Obsidian 写入权限落地到 canonical 路径（session 子代理 sandbox 不可访问 Obsidian 路径）。
---

# SEE EARTH V1 · Analytics Event Map（事件—页面—组件映射表）

> **用途**：定义"什么行为算 V1 验证问题的答案"。本表为 E-P0-07 Analytics Instrumentation 的设计端 source of truth，事件名 / 字段名必须在 schema 中可实现。
> **事件总数**：14 个 P0 核心事件（沿用 Brief §D-P0-05 表格 + 任务卡 A 节）。
> **DO NOT**：不引入新事件 / 不动态拼接事件名 / 不发送 PII / 不靠定时器触发成功事件。

---

## 0. 阅读指南

- **Event**（snake_case，稳定英文标识） — 一行一个事件，**永不重用做其它含义**。
- **页面 / 组件** — 事件由哪个页面、哪个组件、在哪个 UI 状态下发出。
- **触发时机** — 必须是 UI 状态变化 / 服务端结果，**禁止 setTimeout / setInterval 触发"成功"事件**。
- **最小属性** — 字段名稳定 snake_case，**禁止自由文本 / 邮箱 / 手机号 / 精确坐标 / EXIF / 图片 URL token**。
- **防重复规则** — 同一对象（moment / city / section / unknown / submission）滑回或刷新后在去重窗口内不重复计 impression / started。
- **回答 V1 问题** — 对应 Brief §1.2 的 5 个必答问题之一或多个。

---

## 1. Observe 主路径事件（Daily 12 → Moment → City）

### 1.1 `edition_viewed`

| 字段 | 内容 |
|---|---|
| 触发页面 | Homepage / Today（Daily 12 入口） |
| 触发组件 | `<Daily12Grid>`（首屏渲染完成 + 至少 1 张图 / 1 个槽位进入视口） |
| 触发状态 | `state = ready`（非 loading / error / empty / fallback） |
| 触发时机 | Daily 12 卡片首次进入视口且 edition 接口返回 `200`；用户回到 Today 页且 edition_id 与上次不同，重新计一次 |
| 最小属性 | `edition_id` (string, ID)、`app_surface` (enum: `web_homepage` / `web_today_refresh` / `ios_today`) |
| 防重复 | 同 session、同 `edition_id`、同 `app_surface` 仅计一次；edition_id 变更（如跨日刷新）重计 |
| 禁采 | 任何位置 / 时间 / 用户标识 / UA 长串 |
| 服务端确认 | 否（前端就绪即触发，但要求 edition API 已 `200` 返回） |
| 回答 V1 问题 | #1（Daily 12 浏览）/ #5（供应稳定性 · edition 连续可见） |
| 与 E-P0-09 字段对齐 | `edition.id`、`app_surface` 在 `WebSharedSurface` 枚举中已定义（占位，待 E-P0-09 锁） |

### 1.2 `moment_impression`

| 字段 | 内容 |
|---|---|
| 触发页面 | Homepage / Today（Daily 12 列表 / 滑动浏览） |
| 触发组件 | `<Daily12Card>`（单 Moment 卡片） |
| 触发状态 | 卡片 `state = ready`（图片 + 元数据可见） |
| 触发时机 | 单 Moment 卡片 ≥ 50% 面积进入视口 **且停留 ≥ 500 ms**；滑出 ≥ 1 个卡片宽度后再次进入，重新计一次 |
| 最小属性 | `moment_id` (string, ID)、`position` (int 1–12, edition 槽位序号)、`city_id` (string, ID)、`source_type` (enum: `witness` / `seed` / `editorial`) |
| 防重复 | 同 `moment_id` + 同 `edition_id` 在 30 分钟去重窗口内仅计一次；**滑回不重复计**（明确 DO NOT） |
| 禁采 | 图片 URL token / `user_id` / 邮箱 / 手机号 |
| 服务端确认 | 否（前端可见触发） |
| 回答 V1 问题 | #1（Daily 12 浏览深度 · 看到第几个） / #5（供应 · 哪些城市被看见） |
| 与 E-P0-09 字段对齐 | `moment.id`、`edition.slots[].position`、`moment.city_id`、`moment.source_type`（占位） |

### 1.3 `moment_opened`

| 字段 | 内容 |
|---|---|
| 触发页面 | Moment Detail（Coordinate / 单 Moment 浏览） |
| 触发组件 | `<MomentDetailScreen>`（含 One Scene 主图 + `captured_at` + 城市级公开位置） |
| 触发状态 | `state = ready`（主图加载完成或稳定降级到 placeholder 但元数据可读） |
| 触发时机 | 用户从 Daily 12 / City / Unknown / Echo 任一入口点击 Moment；路由切换完成 + 主图请求 `200`（或可读降级） |
| 最小属性 | `moment_id` (string, ID)、`city_id` (string, ID)、`entry_point` (enum: `daily12` / `city_detail` / `unknown_reveal` / `echo` / `share_link` / `deeplink`) |
| 防重复 | 同一 `moment_id` 在同一 `entry_point` 30 分钟内重复打开不计；不同入口打开重计 |
| 禁采 | 自由文本 / EXIF / 精确位置 |
| 服务端确认 | 否 |
| 回答 V1 问题 | #2（哪个 Moment 切片促发深入） |
| 与 E-P0-09 字段对齐 | `moment.id`、`moment.city_id`、`navigation.entry_point`（占位） |

### 1.4 `city_opened`

| 字段 | 内容 |
|---|---|
| 触发页面 | City Detail / Universal CityPage |
| 触发组件 | `<CityPageShell>` |
| 触发状态 | `state = ready`（首屏城市元数据返回 `200`） |
| 触发时机 | 用户从 Moment / Unknown / Echo / 同秒面板点击"打开城市"；URL 切换且 city API `200` |
| 最小属性 | `city_id` (string, ID)、`entry_point` (enum: `moment_detail` / `unknown_reveal` / `same_second` / `echo` / `daily12_card` / `deeplink`)、`layer` (enum: `arrival` / `one_scene` / `same_second` / `echo`) |
| 防重复 | 同 `city_id` + 同 `entry_point` 在 15 分钟去重窗口内仅计一次 |
| 禁采 | 精确位置 / 后台 GPS / `user_id` |
| 服务端确认 | 否 |
| 回答 V1 问题 | #2（Moment → City 转化）/ #3（Unknown → City 转化） |
| 与 E-P0-09 字段对齐 | `city.id`、`navigation.entry_point`、`city.active_layer`（占位） |

### 1.5 `city_section_viewed`

| 字段 | 内容 |
|---|---|
| 触发页面 | City Detail / Universal CityPage |
| 触发组件 | `<CitySectionPanel>`（Arrival / One Scene / Same Second / Echo 四章节） |
| 触发状态 | `state = ready` |
| 触发时机 | 章节容器 ≥ 60% 高度进入视口 **且停留 ≥ 800 ms**；折叠 / 跳转后回退到同章节重计 |
| 最小属性 | `city_id` (string, ID)、`section` (enum: `arrival` / `one_scene` / `same_second` / `echo`) |
| 防重复 | 同 `city_id` + 同 `section` 在 15 分钟去重窗口内仅计一次；长会话跨刷新可重计 |
| 禁采 | 章节内自由文本内容 / 评论 |
| 服务端确认 | 否 |
| 回答 V1 问题 | #2（City Detail 探索深度） |
| 与 E-P0-09 字段对齐 | `city.id`、`city.sections[]` 枚举（占位） |

---

## 2. Unknown Coordinate 路径事件

### 2.1 `unknown_started`

| 字段 | 内容 |
|---|---|
| 触发页面 | Unknown Coordinate 主页（线索页） |
| 触发组件 | `<UnknownCluesBoard>` |
| 触发状态 | `state = ready`（线索面板渲染完成 + 至少 1 个 clue 加载 `200`） |
| 触发时机 | 用户进入 Unknown 主页（直接访问 / City Detail 入口 / Today 推荐位），主页就绪即触发 |
| 最小属性 | `unknown_id` (string, ID) |
| 防重复 | 同 `unknown_id` 在 1 小时去重窗口内仅计一次 |
| 禁采 | 用户答案 / 自填文本 |
| 服务端确认 | 否 |
| 回答 V1 问题 | #3（Unknown 入口吸引力） |
| 与 E-P0-09 字段对齐 | `unknown.id`（占位） |

### 2.2 `unknown_revealed`

| 字段 | 内容 |
|---|---|
| 触发页面 | Unknown Reveal 页（答案页 / 城市跳转过渡页） |
| 触发组件 | `<UnknownRevealScreen>` |
| 触发状态 | `state = revealed`（答案 / 城市信息加载 `200`） |
| 触发时机 | 用户完成 Reveal 操作（点击 Reveal / 完成最后线索交互）；服务端校验通过后 Reveal 页就绪 |
| 最小属性 | `unknown_id` (string, ID)、`city_id` (string, ID)（仅当揭晓结果含城市时） |
| 防重复 | 同 `unknown_id` 整个生命周期仅计一次（成功语义事件） |
| 禁采 | 用户答案猜测 / Reveal 中间过程文本 |
| 服务端确认 | **是**（服务端校验通过 + Reveal 页就绪后才发送；前端仅在拿到服务端 `reveal_token` 校验结果后才发） |
| 回答 V1 问题 | #3（Unknown 观察闭环是否完成） |
| 与 E-P0-09 字段对齐 | `unknown.id`、`unknown.revealed_city_id`（占位） |

---

## 3. Echo 路径事件（City Detail Echo 章节）

### 3.1 `echo_started`

| 字段 | 内容 |
|---|---|
| 触发页面 | City Detail / Echo 章节 |
| 触发组件 | `<EchoComposer>`（输入框 + 字符计数 + Submit 按钮） |
| 触发状态 | `state = focused`（输入框获焦且用户实际输入 ≥ 1 个非空字符） |
| 触发时机 | 用户首次在 Echo 输入框键入 ≥ 1 个非空字符（**不是输入框 focus**，必须真实输入） |
| 最小属性 | `city_id` (string, ID) |
| 防重复 | 同 `city_id` 在 1 小时去重窗口内仅计一次 |
| 禁采 | **Echo 内容正文**（自由文本）；仅统计"是否开始"，不发送输入内容 |
| 服务端确认 | 否（前端就绪触发） |
| 回答 V1 问题 | #2（City 探索深度 · 是否愿留痕） |
| 与 E-P0-09 字段对齐 | `city.id`（占位；Echo 文本字段属于 P1 Echo backend，独立存储） |

### 3.2 `echo_submitted`

| 字段 | 内容 |
|---|---|
| 触发页面 | City Detail / Echo 章节 |
| 触发组件 | `<EchoComposer>` Submit 按钮 → `<EchoResultBanner>` |
| 触发状态 | `state = server_confirmed`（服务端 `200` + submission 已落库） |
| 触发时机 | 服务端确认 Echo 落库后，前端展示成功 Banner 时触发；**非定时器** |
| 最小属性 | `city_id` (string, ID)、`result` (enum: `accepted` / `queued_for_review` / `rate_limited`) |
| 防重复 | 每次 Submit 仅可触发一次（与服务端 confirmation 1:1） |
| 禁采 | Echo 正文 / 作者标识 / 邮箱 / 手机号 |
| 服务端确认 | **是**（强服务端确认；前端只有拿到 confirmation 才能发此事件） |
| 回答 V1 问题 | #2（Echo 完成度） |
| 与 E-P0-09 字段对齐 | `city.id`、`echo.result` 枚举（占位；Echo backend 属 P1，降级时此事件不发送，详见 P1 决策） |

> **降级说明**（设计约束，不在 E-P0-07 改动）：若 P1 Echo backend 不可用，`echo_submitted` 必须从页面移除而非使用 fake success；前端不发送此事件。详见 `forbidden-fields-v1.md` 与 `consent-placement-v1.md`。

---

## 4. Witness 路径事件（最小贡献闭环）

### 4.1 `witness_started`

| 字段 | 内容 |
|---|---|
| 触发页面 | Minimal Witness Flow 第一步（"为什么需要照片 / 时间 / 位置"说明页） |
| 触发组件 | `<WitnessIntroStep>` → 任意 `Continue` 按钮点击 |
| 触发状态 | `state = intro_shown`（说明页就绪） |
| 触发时机 | 用户进入 Witness 流程并点击第一个 `Continue`（或等价前进操作）；**不是路由加载即触发**，必须是用户主动前进 |
| 最小属性 | `entry_point` (enum: `daily12_fab` / `city_detail` / `homepage_fab` / `share_link` / `deeplink`) |
| 防重复 | 同 session 内 Witness 流程一次会话仅计一次（即使用户退出再回来，session 内不重复） |
| 禁采 | 用户标识 / 设备指纹 |
| 服务端确认 | 否（UI 触发） |
| 回答 V1 问题 | #4（Witness 供给入口是否有效） |
| 与 E-P0-09 字段对齐 | `witness.entry_point`（占位） |

### 4.2 `witness_permission_result`

| 字段 | 内容 |
|---|---|
| 触发页面 | Minimal Witness Flow 任意需要权限的步骤（相机 / 相册 / 位置） |
| 触发组件 | 系统权限弹窗回调 → `<WitnessStep>` 状态机 |
| 触发状态 | `state = permission_resolved`（用户做出选择） |
| 触发时机 | 用户对相机 / 相册 / 位置任一权限做出选择（允许 / 拒绝 / 受限）；**单步骤内多次弹窗仅记录最后一次结果** |
| 最小属性 | `permission_type` (enum: `camera` / `photo_library` / `location`)、`result` (enum: `granted` / `denied` / `restricted` / `not_determined`) |
| 防重复 | 同 `permission_type` 单次 Witness session 仅计一次最终结果 |
| 禁采 | 系统返回的原始 permission token / 设备信息 |
| 服务端确认 | 否（系统回调触发） |
| 回答 V1 问题 | #4（权限摩擦在哪里 · Witness 漏斗分析） |
| 与 E-P0-09 字段对齐 | `witness.permission.type` / `witness.permission.result` 枚举（占位） |

### 4.3 `witness_upload_started`

| 字段 | 内容 |
|---|---|
| 触发页面 | Minimal Witness Flow 上传步骤 |
| 触发组件 | `<WitnessUploadStep>` → 用户点击 `Submit` 后、上传请求 `fetch` 发起前一刻 |
| 触发状态 | `state = submitting`（已通过校验、即将发起上传） |
| 触发时机 | 用户在 Submit 步骤点击 `Submit`，前端通过隐私 / 位置 / `captured_at` 校验后、上传请求实际发起时 |
| 最小属性 | `media_type` (enum: `photo_camera` / `photo_library` / `live_photo`)、`network_class` (enum: `wifi` / `cellular_4g_5g` / `cellular_3g` / `slow_2g` / `offline`) |
| 防重复 | 每次 Submit 一次；失败重试不重计 `witness_upload_started`，由 `witness_submitted` / `witness_submit_failed` 收口 |
| 禁采 | 文件二进制 / EXIF / 上传 URL 中的敏感 token |
| 服务端确认 | 否（请求发起即触发；与服务端结果事件分离） |
| 回答 V1 问题 | #4（Witness 上传漏斗起点） |
| 与 E-P0-09 字段对齐 | `witness.upload.media_type`、`network.class` 枚举（占位） |

### 4.4 `witness_submitted`

| 字段 | 内容 |
|---|---|
| 触发页面 | Minimal Witness Flow / 结果页（成功 / 待审核） |
| 触发组件 | `<WitnessResultStep>` |
| 触发状态 | `state = server_confirmed`（服务端 `submission_id` 已返回且状态 `submitted` 或 `under_review`） |
| 触发时机 | 服务端受理后返回 `submission_id`；前端展示成功 / 待审核状态时触发；**不是用户点击 Submit 即触发** |
| 最小属性 | `submission_id` (string, ID)、`location_mode` (enum: `auto_gps_city` / `manual_city` / `denied_fallback_manual`) |
| 防重复 | 与服务端 confirmation 1:1；前端用 `submission_id` 幂等去重 |
| 禁采 | 精确 GPS / 原始 EXIF / 自由文本 / 作者邮箱手机号 / `user_id` |
| 服务端确认 | **是**（强服务端确认；前端只接收 confirmation 不伪造） |
| 回答 V1 问题 | #4（Witness 是否完成真实贡献） / #5（Daily 12 供给来源 · Witness 数） |
| 与 E-P0-09 字段对齐 | `witness.submission_id`、`witness.location_mode` 枚举（占位） |

### 4.5 `witness_submit_failed`

| 字段 | 内容 |
|---|---|
| 触发页面 | Minimal Witness Flow / 结果页（失败重试） |
| 触发组件 | `<WitnessResultStep>` 失败状态 |
| 触发状态 | `state = failed`（服务端返回不可恢复错误 / 客户端判定不可恢复） |
| 触发时机 | 上传 / 提交返回错误且前端判定本次不重试 / 重试次数耗尽；触发失败 Banner 时 |
| 最小属性 | `error_category` (enum: `validation` / `upload_network` / `upload_timeout` / `server_5xx` / `permission_blocked` / `captured_at_invalid` / `exif_untrusted` / `rate_limited` / `duplicate_submission`)、`retryable` (bool) |
| 防重复 | 与 `submission_id`（若有）绑定；无 `submission_id` 时按 session 内同 `error_category` 去重 |
| 禁采 | 错误堆栈 / 服务端 trace / 用户照片二进制 / 原始 EXIF |
| 服务端确认 | 否（前端判定 + 服务端错误码双源；但以前端展示为准） |
| 回答 V1 问题 | #4（Witness 失败原因与修复优先级） |
| 与 E-P0-09 字段对齐 | `witness.error.category` / `witness.error.retryable`（占位） |

---

## 5. 字段名一致性矩阵（与 E-P0-09 占位 contract 对齐）

| 本表字段 | 含义 | E-P0-09 占位 schema 字段 | 备注 |
|---|---|---|---|
| `edition_id` | Daily 12 edition 标识 | `Edition.id` | 锁定后为 string |
| `app_surface` | 入口形态 | `WebSharedSurface` / `IOSSharedSurface` 枚举 | 待 E-P0-09 锁 |
| `moment_id` | Moment 标识 | `Moment.id` | 锁定 |
| `position` | Daily 12 槽位 | `Edition.slots[].position` | 1–12 |
| `city_id` | 城市标识 | `City.id` | 锁定 |
| `source_type` | 来源类型 | `Moment.source_type` 枚举 | `witness` / `seed` / `editorial` |
| `entry_point` | 导航入口 | `Navigation.entry_point` 枚举 | 多入口共享 |
| `layer` | City 章节 | `City.active_layer` 枚举 | arrival / one_scene / same_second / echo |
| `section` | City 章节 | `City.sections[]` 枚举 | 与 `layer` 同源 |
| `unknown_id` | Unknown 标识 | `Unknown.id` | 锁定 |
| `permission_type` | 权限类型 | `Witness.permission.type` 枚举 | camera / photo_library / location |
| `result` (permission / echo) | 通用结果 | `Witness.permission.result` / `Echo.result` 枚举 | 各自枚举不同 |
| `media_type` | 媒体类型 | `Witness.upload.media_type` 枚举 | photo_camera / photo_library / live_photo |
| `network_class` | 网络分级 | `Network.class` 枚举 | 与前端 Network Information API 对齐 |
| `submission_id` | Witness 提交标识 | `WitnessSubmission.id` | 锁定 |
| `location_mode` | 位置来源 | `WitnessSubmission.location_mode` 枚举 | auto_gps_city / manual_city / denied_fallback_manual |
| `error_category` | 错误分类 | `Witness.error.category` 枚举 | 与客户端错误码映射 |
| `retryable` | 是否可重试 | `Witness.error.retryable` bool | 客户端判定 |

> **本表对齐策略 = 占位 contract**：所有字段名 / 枚举值需在 **E-P0-09 锁定**后由 E-P0-07 实现同步；本表为设计端 source of truth，不允许 E-P0-07 改名（仅可加字段，不可删 / 改 / 合并）。

---

## 6. 防重复规则总表

| 事件 | 去重键 | 去重窗口 | 重计条件 |
|---|---|---|---|
| `edition_viewed` | `edition_id` + `app_surface` | session 级 | 跨 session / edition_id 变更 |
| `moment_impression` | `moment_id` + `edition_id` | 30 分钟 | 滑出 ≥ 1 卡片宽度再进入 |
| `moment_opened` | `moment_id` + `entry_point` | 30 分钟 | 不同 `entry_point` |
| `city_opened` | `city_id` + `entry_point` | 15 分钟 | 不同 `entry_point` |
| `city_section_viewed` | `city_id` + `section` | 15 分钟 | 跨刷新可重计 |
| `unknown_started` | `unknown_id` | 1 小时 | 强制新会话 |
| `unknown_revealed` | `unknown_id` | 生命周期一次 | 永不重计（成功事件） |
| `echo_started` | `city_id` | 1 小时 | session 切换 |
| `echo_submitted` | 服务端 confirmation | 1:1 | 永不重计（成功事件） |
| `witness_started` | session_id | session 一次 | session 切换 |
| `witness_permission_result` | `permission_type` + session | session 一次 | 强制新会话 |
| `witness_upload_started` | session 内 Submit 次数 | 1 次 / Submit | 失败重试不重计 |
| `witness_submitted` | `submission_id` | 1:1 | 永不重计（成功事件） |
| `witness_submit_failed` | `submission_id`（若有） | 1:1 | 永不重计 |

---

## 7. 与 V1 必答问题的映射（§1.2）

| V1 必答问题 | 主支撑事件 | 辅支撑事件 | 验证方式 |
|---|---|---|---|
| #1 用户是否会浏览 Daily 12，而不是只看首屏 | `edition_viewed` | `moment_impression`（position 分布） | Daily 12 slot 1–12 的 `moment_impression` 占比 + 中位浏览深度 |
| #2 用户是否会从 Moment 进入 City Detail 并继续探索 | `moment_opened` → `city_opened` → `city_section_viewed` | `echo_started` / `echo_submitted`（P1） | Moment → City 转化漏斗 + section 深度分布 |
| #3 Unknown 是否能激发观察、Reveal 与后续城市访问 | `unknown_started` → `unknown_revealed` → `city_opened` | `city_opened.entry_point = unknown_reveal` | Unknown 完成率 + Reveal → City 转化率 |
| #4 Witness 是否能完成一次真实、可信、隐私安全的 Moment 提交 | `witness_started` → `witness_permission_result` → `witness_upload_started` → `witness_submitted` | `witness_submit_failed`（失败漏斗） | Witness 全漏斗 + `error_category` / `retryable` 分类 |
| #5 Daily 12 是否能持续、稳定、合法地供应 | `edition_viewed`（连续） + `witness_submitted`（来源） | `moment_impression.source_type`（witness vs seed vs editorial 占比） | Edition 连续供应天数 + Witness 来源占比 + location_mode 分布 |

---

## 8. 与 E-P0-05 位置隔离的禁采规则对齐

- `witness_submitted` 仅记录 `location_mode`（公开城市级来源模式），**不发送精确 GPS**。
- `moment_impression` / `moment_opened` / `city_opened` 等所有 Observe 路径事件**不发送任何位置字段**。
- 精确 GPS / 原始 EXIF / `user_id` / 邮箱 / 手机号 / 自由文本 / 图片 URL token **见 `forbidden-fields-v1.md` 完整禁采清单**。

---

## 9. DO NOT（本表强制约束）

- ❌ 不引入本表外的 14 个事件外的"成功事件"；新增事件需更新 E-P0-07 schema + PM 评审。
- ❌ 不修改事件名 / 不动态拼接 / 不本地化事件名（snake_case 锁定）。
- ❌ 不使用 setTimeout / setInterval 触发 `unknown_revealed` / `echo_submitted` / `witness_submitted` / `witness_submit_failed`。
- ❌ 不在 `moment_impression` / `city_section_viewed` 等可见性事件中使用定时器代替视口检测。
- ❌ 不在事件中发送 PII / 精确位置 / EXIF / 自由文本 / 图片 URL token。
- ❌ 不重复曝光（`moment_impression` 滑回不算新 impression）。
- ❌ 不修改任务卡 / Brief / E-P0-09 占位 contract 字段名（本表为对齐源，不反向要求 E-P0-09 改名）。

---

## 10. 自验收 Acceptance Criteria（Brief §D-P0-05 + 任务卡 §A）

- [x] 事件名全部使用稳定 `snake_case`（14 个事件，无中文 / 无空格 / 无动态拼接）
- [x] 每个事件都有明确触发时机且由 UI 状态变化或服务端结果触发（无定时器触发"成功"）
- [x] 每个事件都有最小属性且不含 PII（见 §5 字段名矩阵）
- [x] 成功事件由服务端确认触发（`unknown_revealed` / `echo_submitted` / `witness_submitted` / `witness_submit_failed`）
- [x] 至少能回答 Brief §1.2 的 5 个 V1 必答问题（见 §7 映射表）
- [x] 与 E-P0-07 contract 字段名一致占位（见 §5 对齐矩阵，待 E-P0-09 锁）
- [x] 与 E-P0-05 位置隔离禁采清单一致（见 §8 + `forbidden-fields-v1.md`）
- [x] Consent 文案位置明确（见 `consent-placement-v1.md`）

---

**End of Event Map v1**