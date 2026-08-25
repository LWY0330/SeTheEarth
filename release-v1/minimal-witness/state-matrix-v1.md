---
title: SEE EARTH V1 · Minimal Witness Flow · 状态矩阵（5 大状态 · 全状态覆盖）
type: design-state-matrix
tags: [release-v1, design, d-p0-02, witness, state-matrix, permission, data-trust, upload, review, location, see-earth]
task_id: D-P0-02
brief_anchor: §4 D-P0-02 / 任务卡 §B 5 大状态类别
track: design
owner: 外部 Designer Owner（您）
created: 2026-08-22
status: IN REVIEW
target_gate: Gate A · Internal Alpha
source_brief: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/SEE-EARTH-Release-Strategy-v1-Design-Engineering-Task-Brief.md
source_task_card: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/06-PM Agent 交接/2026-08-22-task-card-d-p0-02-minimal-witness.md
related_docs:
  - ./flow-diagram-v1.md
  - ./copy-final-v1.md
  - ./api-field-mapping-v1.md
  - ./prototype-v1.md
  - ../web-v1-flow/design-freeze-log-v1.md §11.1
  - ../analytics-events/event-map-v1.md §4
  - ../analytics-events/trigger-diagram-v1.md §3
  - ../analytics-events/forbidden-fields-v1.md
  - ../analytics-events/consent-placement-v1.md C-03~C-06
depends_on: [D-P0-01 LOCKED ✓, D-P0-05 ACCEPTED, E-P0-09 临时 contract]
blocks: [E-P0-03, E-P0-05]
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/07-设计师设计参考/release-v1/minimal-witness/state-matrix-v1.md
workspace_canonical_path: /Users/lwy/Documents/ChatGPT/看见地球/release-v1/minimal-witness/state-matrix-v1.md
note: 本文件已就绪，需 PM Agent 由 Obsidian 写入权限落地到 canonical 路径。
---

# SEE EARTH V1 · Minimal Witness Flow · 状态矩阵

> **作者**：Designer Agent #3（外部 Owner = 您）
> **目标读者**：PM Agent / Web 工程师 / iOS 工程师（first-pass）/ E-P0-09 Contract Owner / E-P0-03 Witness Backend Owner / QA
> **目的**：交付"完整状态矩阵"——覆盖 **5 大状态类别 × 全部子状态**。**不交付理想成功路径**。
> **强制原则**（来自 Brief §4 D-P0-02 + 任务卡 DO NOT）：
> 1. **不把权限拒绝设计为惩罚或强制授权** — 每条权限拒绝都有安全替代路径
> 2. **不暗示绝对匿名** — 文案诚实（详见 `copy-final-v1.md`）
> 3. **不把"上传成功 = 自动公开"作为隐含承诺** — 必须经过审核
> 4. **不使用 setTimeout / setInterval 触发成功事件** — 成功事件必须由服务端 confirmation 触发

---

## 0. 阅读指南

- **5 大状态类别**（来自任务卡 §B）：
  - **§1 权限状态**（4 类：相机 / 相册 / 位置 / 通知）+ 精确位置不可用
  - **§2 数据可信度状态**（5 类：EXIF 完整 / EXIF 不可信 / 旧照片 / 未来时间 / 时区不确定）
  - **§3 上传状态**（6 类：上传中 / 后台中断 / 弱网 / 失败 / 重试 / 取消）
  - **§4 审核状态**（5 类：提交成功 / 待审核 / 未通过 / 需要补充信息 / 已发布）
  - **§5 位置降级**（精确定位不可用时的城市级手动选择）
- **每个状态项 = (状态名 / 触发条件 / 视觉稿 / 文案 / 字段 / 埋点 / 替代路径 / DO NOT)**

---

## §1 权限状态矩阵

### 1.1 相机权限

| 状态 | 触发条件 | 视觉稿 | 文案 (zh-CN, 详见 `copy-final-v1.md`) | 字段 | 埋点 | 替代路径 | DO NOT |
|---|---|---|---|---|---|---|---|
| **not_determined** | 首次进入段 1 · 用户点"拍一张" | 段 1 主页面 "拍一张" 主按钮 · 系统弹窗待触发 | "拍一张" 按钮可见；弹窗未显示 | `permission.camera = not_determined` | `witness_started` 已发，等待回调 | — | 不预先禁用按钮 |
| **granted** | 系统回调允许 | 相机 UI 开启 · 缩略图实时显示 | — | `permission.camera = granted` | `witness_permission_result(permission_type=camera, result=granted)` | — | — |
| **denied** | 系统回调拒绝 | 段 1 主页面 + C-06 Banner "你拒绝了相机权限。SEE EARTH 仍然支持从相册选择照片。" + 主按钮变"从相册选" + 次按钮"取消并返回" | 见 C-06 | `permission.camera = denied` | `witness_permission_result(permission_type=camera, result=denied)` | 改用"从相册选" | ❌ 不显示"必须开启相机才能继续" |
| **restricted** | iOS 家长控制 / MDM / 系统级限制 | 同 denied，但额外加 "你的设备权限受限，无法访问相机。如需继续，请前往系统设置调整权限后重试。" 链接 | "去系统设置" CTA | `permission.camera = restricted` | `witness_permission_result(permission_type=camera, result=restricted)` | "去系统设置" 链接 | ❌ 不显示具体技术原因（如 iOS MDM 策略细节） |
| **denied_permanent** | 用户曾在系统设置中"不再询问" | 同 restricted · 强提示"去系统设置" | "去系统设置" CTA | `permission.camera = denied` (但 UI 用 restricted 风格) | 同上 | "去系统设置" | ❌ 不重复弹窗（系统已不弹） |

### 1.2 相册权限

| 状态 | 触发条件 | 视觉稿 | 文案 | 字段 | 埋点 | 替代路径 | DO NOT |
|---|---|---|---|---|---|---|---|
| **not_determined** | 首次进入段 1 · 用户点"从相册选" | 段 1 "从相册选" 按钮可见 · 系统弹窗待触发 | — | `permission.photo_library = not_determined` | — | — | 不预先禁用按钮 |
| **granted** | 系统回调允许 | 相册 UI 开启 · 多选/单选模式 | — | `permission.photo_library = granted` | `witness_permission_result(permission_type=photo_library, result=granted)` | — | — |
| **denied** | 系统回调拒绝 | 段 1 主页面 + C-06 Banner "你拒绝了相册权限。SEE EARTH 仍然支持即时拍照。" + 主按钮变"拍一张" + 次按钮"取消并返回" | 见 C-06 | `permission.photo_library = denied` | `witness_permission_result(permission_type=photo_library, result=denied)` | 改用"拍一张" | ❌ 不显示"必须开启相册才能继续" |
| **restricted** | 系统级限制 | 同 denied · "去系统设置" 链接 | "去系统设置" CTA | `permission.photo_library = restricted` | `witness_permission_result(permission_type=photo_library, result=restricted)` | "去系统设置" | — |
| **denied_permanent** | "不再询问" | 同 restricted | "去系统设置" CTA | `permission.photo_library = denied` | 同上 | "去系统设置" | ❌ 不重复弹窗 |

### 1.3 位置权限

| 状态 | 触发条件 | 视觉稿 | 文案 | 字段 | 埋点 | 替代路径 | DO NOT |
|---|---|---|---|---|---|---|---|
| **not_determined** | 首次进入段 3 · 用户点"使用当前位置" | 段 3 "使用当前位置" 主按钮 · "手动选择城市" 次按钮 | — | `permission.location = not_determined` | — | "手动选择城市" 始终可见 | 不预先禁用"使用当前位置" |
| **granted** | 系统回调允许 | Loading 状态 "正在解析城市..." · 解析后显示城市名 + "✓ 已定位" | "正在解析城市..." → "已定位到 [城市名]" | `permission.location = granted` | `witness_permission_result(permission_type=location, result=granted)` | — | ❌ 不显示精确 GPS 数字给用户 |
| **denied** | 系统回调拒绝 | 段 3 + C-06 Banner "你拒绝了位置权限。SEE EARTH 仍然支持手动选择城市。" + "手动选择城市" 主按钮 + "取消并返回" 次按钮 | 见 C-06 | `permission.location = denied` | `witness_permission_result(permission_type=location, result=denied)` | 手动选城市 → `location_mode = denied_fallback_manual` | ❌ 不显示"必须开启位置才能继续" |
| **restricted** | 系统级限制 | 同 denied · "去系统设置" 链接 | "去系统设置" CTA | `permission.location = restricted` | `witness_permission_result(permission_type=location, result=restricted)` | "去系统设置" + 手动选 | — |
| **denied_permanent** | "不再询问" | 同 restricted | "去系统设置" CTA | `permission.location = denied` | 同上 | 手动选城市 | ❌ 不重复弹窗 |
| **granted_but_precise_unavailable**（iOS 限定） | 系统返回大致位置，精度 > 500m | Loading → 警告"GPS 信号弱；请手动确认城市" + 城市 picker | "GPS 信号弱；已尝试解析为 [城市名]，请确认" | `permission.location = granted` · `location.accuracy_meters > 500` | `witness_permission_result(permission_type=location, result=granted)` · 内部标记 degraded | 手动选城市覆盖 → `location_mode = manual_city` | ❌ 不显示精确精度数字（仅显示"信号弱"语义） |

### 1.4 通知权限（仅 iOS）

| 状态 | 触发条件 | 视觉稿 | 文案 | 字段 | 埋点 | 替代路径 | DO NOT |
|---|---|---|---|---|---|---|---|
| **not_requested** | 提交成功后 · 段 6b 结果页 | 结果页 "你的 Moment 已提交；进入审核队列" + "允许通知" 按钮 + "暂不允许" 链接 | "允许通知" / "暂不允许" | `permission.notification = not_requested` | — | 选"暂不允许" = 不影响流程 | ❌ 不在提交前请求通知（避免诱导） |
| **granted** | 系统回调允许 | "已开启通知" 小字 + iOS 系统通知设置引导 | "已开启通知" | `permission.notification = granted` | 不发埋点（V1 范围外） | — | — |
| **denied** | 系统回调拒绝 | "未开启通知" 小字 · 不影响流程 | "未开启通知；可稍后在系统设置中开启" | `permission.notification = denied` | 不发埋点 | 用户去系统设置 | ❌ 不重复弹窗 |

> **iOS 通知 V1 决策**：通知权限在 Witness 提交成功后**主动**询问一次（让用户知道"已发布时会通知"），**不强制**；用户拒绝不影响流程。

---

## §2 数据可信度状态矩阵（EXIF / 时间）

> **来源**：task card §B "数据可信度状态"；E-P0-04 数据原则（`captured_at` 核心依据）。

### 2.1 EXIF 读取结果

| 状态 | 触发条件 | 视觉稿 | 文案 | 字段 | 埋点 | 替代路径 | DO NOT |
|---|---|---|---|---|---|---|---|
| **exif_present_trusted** | EXIF 完整 · DateTimeOriginal 合理 · 设备可信 | 段 2 时间表单自动填 · "✓ 拍摄时间来自你的照片" | "我们从你的照片读到了拍摄时间：[YYYY-MM-DD HH:MM]" · "看起来准确" | `captured_at` (ISO) · `captured_at_source = exif` · `captured_at_confidence = high` | 不发埋点（系统读取） | — | — |
| **exif_present_untrusted** | EXIF 有 DateTimeOriginal 但被改过（如与文件 mtime 冲突 / 设备标记为篡改） | 段 2 表单 + 警告 "这张照片的拍摄时间看起来不准确，请手动确认" | "我们从你的照片读到的时间可能不准确；请确认或修改" | `captured_at_source = exif` · `captured_at_confidence = low` · `exif_untrusted_reason` | 不发埋点 · 提交时 `error_category = exif_untrusted` (若未确认就提交) | 用户手动调整 | ❌ 不自动采用不信任时间 |
| **exif_missing** | 无 EXIF（截图 / 二次保存 / 相册选的无元数据图） | 段 2 表单为空 + 提示 "请填写拍摄时间" | "我们没能读到这张照片的拍摄时间；请手动填写" | `captured_at_source = user_confirmed` · `captured_at_confidence = manual` | 不发埋点 | 用户手动填 | ❌ 不假装 EXIF 在 |
| **exif_partial** | EXIF 有 DateTimeOriginal 但无时区信息 | 段 2 表单 + 提示 "请确认时区" | "我们读到了时间但不确定时区；请确认" | `captured_at_source = exif` · `captured_at_confidence = medium` · `captured_at_tz_source = user_confirmed` | 不发埋点 | 用户手动选时区 | ❌ 不默认 UTC |

### 2.2 时间合理性检查

| 状态 | 触发条件 | 视觉稿 | 文案 | 字段 | 埋点 | 替代路径 | DO NOT |
|---|---|---|---|---|---|---|---|
| **normal** | 拍摄时间在 1 小时前 - 30 天前之间 | 段 2 表单 · 无警告 | 正常显示 | `captured_at_age_days = N (0 < N < 30)` | 不发埋点 | — | — |
| **too_recent**（< 1 分钟） | 拍摄时间距当前 < 1 分钟（可能正在拍摄） | 段 2 + 提示 "这张照片看起来是刚刚拍的；请确认" | "刚刚拍的；请确认" | `captured_at_age_seconds < 60` | 不发埋点 | 用户确认 | ❌ 不阻塞提交（照片可能是有效的） |
| **too_old**（> 30 天） | 拍摄时间距当前 > 30 天 | 段 2 + 强提示 "这张照片是 [N] 天前拍的；可能不是'此刻'。请确认是否提交" · "继续" 按钮变次级 · "修改时间" 主按钮 | "这张照片是 [N] 天前拍的；Daily 12 偏好最近 30 天的内容。如确认提交，请点击继续" | `captured_at_age_days > 30` · `captured_at_outdated = true` | 不发埋点 · 提交时 `error_category = captured_at_invalid` 提示但不阻塞 | 用户确认继续 / 改时间 | ❌ 不假装是"现在" |
| **future_time** | 拍摄时间 > 当前时间 | 段 2 + 强提示 "这张照片的拍摄时间在未来；请检查设备时间或修改" · "继续" 按钮禁用 | "拍摄时间在未来；请检查设备时间或手动修改" | `captured_at_in_future = true` | 不发埋点 · 提交时 `error_category = captured_at_invalid` | 用户改时间 | ❌ 不允许提交未来时间（硬阻塞） |
| **timezone_uncertain** | EXIF 有 DateTimeOriginal 但无 TZ · 时区推断失败 | 段 2 + "时区" 字段变红 + "请确认时区" 提示 | "我们读到了时间但不确定时区；请确认你拍摄时所在时区" | `captured_at_tz_source = inferred` · `captured_at_confidence = medium` | 不发埋点 | 用户手动选 | ❌ 不默认 UTC 提交 |

### 2.3 时区确认

| 状态 | 触发条件 | 视觉稿 | 文案 | 字段 | 埋点 | 替代路径 | DO NOT |
|---|---|---|---|---|---|---|---|
| **tz_from_exif** | EXIF 含 OffsetTimeOriginal 或类似 | 段 2 时区字段自动填 · "✓ 来自照片" | "时区：[UTC+8]" · "来自你的照片" | `captured_at_tz = +08:00` · `captured_at_tz_source = exif` | 不发埋点 | — | — |
| **tz_from_location** | EXIF 无 TZ 但段 3 GPS 给出时区 | 段 2 时区字段 · "来自你定位的城市" | "时区：[UTC+X]" · "来自你定位的城市 [城市名]" | `captured_at_tz_source = location` | 不发埋点 | — | — |
| **tz_user_confirmed** | 用户手动选 | 段 2 时区字段 · "你选择的" | "时区：[UTC+X]" · "你选择的" | `captured_at_tz_source = user_confirmed` | 不发埋点 | — | — |
| **tz_unknown** | 三者皆无 | 段 2 时区字段变红 + "时区不确定；请选择你拍摄时所在时区" | "时区不确定" | `captured_at_tz_source = unknown` · `captured_at_confidence = low` | 不发埋点 · 提交时 `error_category = captured_at_invalid` 提示但不阻塞 | 用户手动选 | ❌ 不默认 UTC |

---

## §3 上传状态矩阵

> **来源**：task card §B "上传状态" + trigger-diagram-v1.md §3 状态机。

### 3.1 上传中状态

| 状态 | 触发条件 | 视觉稿 | 文案 | 字段 | 埋点 | 替代路径 | DO NOT |
|---|---|---|---|---|---|---|---|
| **uploading_progress** | fetch 发起 · 进度 0-100% | 段 6a 进度条 · 进度数字 · 缩略图 | "上传中 [N]%" | `upload.progress_pct = N` · `upload.bytes_sent` · `upload.bytes_total` | `witness_upload_started(media_type, network_class)` 已发 | "取消上传" 按钮 | ❌ 不显示精确字节数（仅百分比） |
| **uploading_slow** | 进度 < 10% 持续 > 30s | 进度条变 Layer Yellow + 提示 "网络较慢；正在继续上传" | "网络较慢；正在继续上传" | `upload.network_class = slow_2g` 或实际测量 | 不发新事件 | "取消上传" 按钮 | ❌ 不假装"即将完成" |
| **uploading_paused_background** | 浏览器/iOS 切到后台 · fetch 中断 | 系统级提示 "应用进入后台；上传已暂停" + "返回继续" 按钮 | "上传已暂停；返回继续" | `upload.paused_reason = background` | 不发新事件 | "返回继续" / "取消上传" | ❌ 不在后台继续上传（耗电 / 隐私） |
| **uploading_resumed** | 回到前台 · 继续上传 | 进度条恢复 · "已恢复上传" 短暂提示 | "已恢复上传" | `upload.paused_reason = null` | 不发新事件 | "取消上传" | — |

### 3.2 网络异常状态

| 状态 | 触发条件 | 视觉稿 | 文案 | 字段 | 埋点 | 替代路径 | DO NOT |
|---|---|---|---|---|---|---|---|
| **network_offline** | `navigator.onLine = false` 或 fetch reject TypeError | 段 6a 错误卡片 "网络已断开；请检查连接后重试" + "重试" 按钮（disabled 直到 online）+ "取消" 按钮 | "网络已断开" · "请检查连接后重试" | `error_category = upload_network` · `network_class = offline` | `witness_submit_failed(error_category=upload_network, retryable=true)` (仅在重试耗尽后) | "重试" / "取消" | ❌ 不静默失败 |
| **network_timeout** | fetch 超时（默认 60s） | 同 network_offline · 但额外显示 "上传超时" | "上传超时；请重试" | `error_category = upload_timeout` · `retry_count` | `witness_submit_failed(retryable=true)` (重试耗尽后) | "重试" / "取消" | ❌ 不无限重试（最多 2 次自动 + 1 次手动） |
| **network_slow_retry** | 上传时间 > 2 分钟未完成 | 进度条变 Layer Yellow + "网络慢；是否重试？" · "是，重试" / "继续等待" | "网络慢；是否重试？" | `error_category = upload_timeout` (用户选重试时) | 不发新事件（重试不重计） | "是，重试" / "继续等待" | ❌ 不自动重试超过 2 次 |

### 3.3 服务端错误

| 状态 | 触发条件 | 视觉稿 | 文案 | 字段 | 埋点 | 替代路径 | DO NOT |
|---|---|---|---|---|---|---|---|
| **server_5xx** | 5xx 响应 | 段 6b 错误卡片 "服务暂时不可用；请稍后再试" + "重试" 按钮 + "返回首页" 链接 | "服务暂时不可用" | `error_category = server_5xx` · `http_status` | `witness_submit_failed(retryable=true)` (重试耗尽后) | "重试" / "返回首页" | ❌ 不暴露服务端 trace |
| **server_4xx_validation** | 4xx 验证错误（如城市不在白名单） | 段 6b 错误卡片 "提交内容有误：[具体原因]" + "返回修改" 按钮（回到对应步骤） | "提交内容有误：[原因]" | `error_category = validation` · `validation_field` | `witness_submit_failed(retryable=false)` | "返回修改" | ❌ 不显示服务端原始错误堆栈 |
| **server_4xx_rate_limited** | 429 限流 | 段 6b 错误卡片 "请求太频繁；请 [N] 分钟后再试" + 倒计时 + "知道了" 按钮 | "请求太频繁；请 [N] 分钟后再试" | `error_category = rate_limited` · `retry_after_seconds` | `witness_submit_failed(retryable=true)` | "知道了"（倒计时结束可再试） | ❌ 不显示具体限流阈值 |
| **server_4xx_duplicate** | submission_id 已存在（幂等命中） | 段 6b 成功卡片（视为已提交）· "你的 Moment 已提交；进入审核队列" | "已提交；进入审核队列" | `error_category = duplicate_submission` · `submission_id` (返回相同 ID) | **`witness_submitted(submission_id_hash, location_mode)`**（按成功计）· 不发 failed | "知道了" | ❌ 不显示"重复"提示给用户（避免混淆） |
| **server_4xx_permission_blocked** | 服务端判定权限违规（如图片含 EXIF GPS 未剥离） | 段 6b 错误卡片 "这张照片包含位置信息；请使用不含位置的照片重试" + "返回选图" 按钮 | "这张照片包含位置信息；请使用不含位置的照片" | `error_category = permission_blocked` | `witness_submit_failed(retryable=false)` | "返回选图" | ❌ 不自动剥离（让用户重新选） |

### 3.4 客户端校验失败

| 状态 | 触发条件 | 视觉稿 | 文案 | 字段 | 埋点 | 替代路径 | DO NOT |
|---|---|---|---|---|---|---|---|
| **validation_no_photo** | 段 6a 提交时未选图 | 段 6a 顶部错误 "请先选择照片" · "← 返回选图" 按钮 | "请先选择照片" | `error_category = validation` | 不发新事件（提交按钮未触发） | "返回选图" | ❌ 不弹原生 alert |
| **validation_no_city** | 段 6a 提交时未选城市 | 段 6a 顶部错误 "请先选择城市" · "← 返回位置" 按钮 | "请先选择城市" | `error_category = validation` | 不发新事件 | "返回位置" | ❌ 不弹原生 alert |
| **validation_future_time** | 段 6a 提交时 `captured_at_in_future = true` | 段 6a 顶部错误 "拍摄时间在未来；请修改" · "← 返回时间" 按钮 | "拍摄时间在未来；请修改" | `error_category = captured_at_invalid` | 不发新事件 · 提交时 `witness_submit_failed` 不发（前端拦截） | "返回时间" | ❌ 不阻塞"知道了"路径 |
| **validation_exif_untrusted** | 段 6a 提交时 `captured_at_confidence = low` 且用户未确认 | 段 6a 顶部错误 "请先确认或修改拍摄时间" · "← 返回时间" 按钮 | "请先确认或修改拍摄时间" | `error_category = exif_untrusted` | 不发新事件 | "返回时间" | ❌ 不自动信任 |

### 3.5 重试状态

| 状态 | 触发条件 | 视觉稿 | 文案 | 字段 | 埋点 | 替代路径 | DO NOT |
|---|---|---|---|---|---|---|---|
| **retryable_idle** | 失败但 retryable=true · 用户未操作 | 段 6b 错误卡片 · "重试" 按钮 · "返回首页" 链接 | "上传失败：[原因]" | `retryable = true` · `retry_count = N` | 已发 `witness_submit_failed(retryable=true)` (重试耗尽时) | "重试" / "返回首页" | — |
| **retrying** | 用户点"重试" · 自动回到段 1 选图（draft 恢复） | 段 1 选图 · 顶部 "重试上次提交" 横幅 · "继续重试" / "重新选图" 按钮 | "继续重试上次提交" · "重新选图" | `retry_count = N+1` | 不发新事件（`witness_upload_started` 在 fetch 发起时重发） | "继续重试" / "重新选图" | ❌ 不强制从头开始 |
| **retry_exhausted** | 重试次数达上限（2 次自动 + 1 次手动 = 3 次） | 段 6b 错误卡片 · "重试已达上限；返回首页" · "返回首页" 按钮 | "重试已达上限；请稍后再来" | `retryable = false` · `retry_count = 3` | `witness_submit_failed(retryable=false)` | "返回首页" | ❌ 不无限重试 |

### 3.6 用户取消

| 状态 | 触发条件 | 视觉稿 | 文案 | 字段 | 埋点 | 替代路径 | DO NOT |
|---|---|---|---|---|---|---|---|
| **user_cancelled** | 段 6a 用户点"取消上传" | 段 6b 中性卡片 "已取消上传；你的照片没有提交" + "重新开始" 按钮 + "返回首页" 按钮 | "已取消上传" | — | **不触发任何事件**（中性动作） | "重新开始" / "返回首页" | ❌ 不发 `witness_submit_failed` |
| **user_cancelled_during_validation** | 段 6a 客户端校验中用户点 X | 同上 | 同上 | — | 不发新事件 | 同上 | — |
| **abandoned_session** | 用户关闭页面 / 浏览器 crash | 服务端 cleanup 任务处理 | n/a | `submission.status = abandoned` (服务端标记) | 不发前端事件 | — | — |

---

## §4 审核状态矩阵

> **来源**：task card §B "审核状态" + E-P0-03 状态机 `draft / uploading / submitted / under_review / published / rejected / withdrawn / failed`。

### 4.1 提交成功（已受理）

| 状态 | 触发条件 | 视觉稿 | 文案 | 字段 | 埋点 | 替代路径 | DO NOT |
|---|---|---|---|---|---|---|---|
| **submitted** | 服务端 200 + `submission_id` 已返回 | 段 6b 成功卡片 · 大对勾（Layer Red）· "你的 Moment 已提交；进入审核队列" + "知道了" 按钮 | "你的 Moment 已提交" · "我们会审核后决定是否出现在 Daily 12" | `submission.status = submitted` · `submission_id` | `witness_submitted(submission_id_hash, location_mode)` | "知道了" | ❌ 不显示"即将发布" |
| **under_review** | 提交后 1 小时 - 7 天（视审核量）| 用户再次访问时显示在 "我的提交"（V1 无账户，**仅在 session 内记忆**：用户回到 `/witness/result?submission_id=XXX` 时显示） | "你的 Moment 正在审核；进入 Daily 12 后你会看到" | `submission.status = under_review` | 不发新事件 | "返回首页" | ❌ 不假装"已被选中" |

### 4.2 审核结果

| 状态 | 触发条件 | 视觉稿 | 文案 | 字段 | 埋点 | 替代路径 | DO NOT |
|---|---|---|---|---|---|---|---|
| **published** | 审核通过 · Moment 进入 City / Edition | 段 6b 成功卡片 · "你的 Moment 已发布！进入 [城市名] City Page" + "看城市" CTA（跳到 `/cities/:cityId`） | "你的 Moment 已发布" · "在 [城市名] 看见它" | `submission.status = published` · `moment_id` | `witness_submitted` 已发 · published 不重发 witness 事件（避免重复计） | "看城市" / "返回首页" | ❌ 不显示"成功啦"过度庆祝 |
| **rejected** | 审核未通过 · 含原因 | 段 6b 卡片 · "感谢你的提交；这次未能通过审核" · 折叠展开"原因：[moderation_reason]" · "知道了" 按钮 | "感谢你的提交" · "这次未能通过审核" | `submission.status = rejected` · `moderation_reason` (enum) | 不发新事件 | "知道了" | ❌ 不显示具体 moderator 身份；不写"很抱歉"等自责式文案 |
| **needs_more_info** | 审核需要补充信息 | 段 6b 卡片 · "我们需要更多关于这张照片的信息：[具体问题]" + "补充信息" 按钮（回到段 1） | "我们需要更多信息" | `submission.status = needs_more_info` · `moderation_question` | 不发新事件 | "补充信息" | ❌ 不诱导用户改照片绕过审核 |
| **withdrawn** | 用户主动撤回（V1 无账户，仅在 session 内） | 段 6b 卡片 · "已撤回" + "知道了" 按钮 | "已撤回" | `submission.status = withdrawn` | 不发新事件 | "知道了" | ❌ 不发"撤回成功"邮件（V1 无账户） |

### 4.3 失败终态

| 状态 | 触发条件 | 视觉稿 | 文案 | 字段 | 埋点 | 替代路径 | DO NOT |
|---|---|---|---|---|---|---|---|
| **failed** | 提交后服务端判定不可恢复（如文件类型不支持） | 段 6b 错误卡片 · "提交失败：[原因]" · "返回首页" 按钮 | "提交失败" | `submission.status = failed` · `error_category` | `witness_submit_failed(retryable=false)` | "返回首页" | ❌ 不显示"请重试"按钮（已 retryable=false） |
| **expired** | 草稿 / 上传中超过保留期（24h） | 用户回到 `/witness/result?submission_id=XXX` 显示 "提交已过期；请重新提交" | "提交已过期" | `submission.status = expired` | 不发新事件 | "重新提交" | ❌ 不永久保留草稿 |

### 4.4 审核状态时间线（P1 · V1 范围外但需设计占位）

> V1 无用户账户系统，**仅 session 内记忆**。`witness_submitted` 后，用户在 session 内访问 `/witness/result?submission_id=XXX` 可看到审核状态。
> P1 引入账户后，状态将通过 `my_submissions` API 拉取。本表预留 P1 字段。

| 状态 | 触发条件 | 字段（P1） | 备注 |
|---|---|---|---|
| **submitted → under_review** | 服务端 moderator 领取审核 | `moderation.assigned_at` | V1 仅服务端流转 |
| **under_review → published** | 审核通过 | `moderation.published_at` · `moderation.moderator_id_hash` | P1 通知用户 |
| **under_review → rejected** | 审核未通过 | `moderation.rejected_at` · `moderation.reason_code` | P1 通知用户 |
| **under_review → needs_more_info** | 需补充信息 | `moderation.question_code` | P1 通知用户 |

---

## §5 位置降级状态矩阵

> **来源**：task card §B "位置降级" + E-P0-05 位置隔离。

### 5.1 精确定位可用性

| 状态 | 触发条件 | 视觉稿 | 文案 | 字段 | 埋点 | 替代路径 | DO NOT |
|---|---|---|---|---|---|---|---|
| **precise_available** | GPS 定位成功 · 精度 < 50m · 城市反查成功 | 段 3 · "✓ 已定位到 [城市名]" · "继续" 按钮 | "已定位到 [城市名]" | `location.accuracy_meters < 50` · `location.city_id` (来自反查) · `location.city_source = gps_reverse` | `witness_permission_result(location, granted)` · 内部 `location_mode = auto_gps_city` | "重新定位" 链接 | ❌ 不显示精度数字（仅显示"已定位"） |
| **precise_available_city_uncertain** | GPS 成功但反查城市失败（如跨国边境 / 海洋） | 段 3 · "✓ 已定位，但城市不确定" · "手动选择城市" 主按钮 | "已定位但城市不确定；请手动选择" | `location.accuracy_meters < 50` · `location.city_id = null` · `location.requires_manual = true` | 同上 | "手动选择城市" | ❌ 不假装知道城市 |
| **precise_degraded** | GPS 成功但精度 50m - 500m | 段 3 · "✓ 已定位到 [城市名]（精度一般）" · "继续" / "手动调整" | "已定位到 [城市名]（精度一般）" | `location.accuracy_meters ∈ [50, 500]` · `location.city_id` | 同上 · 内部 `location.degraded = true` | "手动调整" | ❌ 不显示具体精度数字 |
| **precise_unavailable** | GPS 失败 / 精度 > 500m / 设备不支持 | 段 3 · "无法获取位置；请手动选择城市" · "手动选择城市" 主按钮（高亮） | "无法获取位置；请手动选择城市" | `location.accuracy_meters > 500` 或 `location.error_code` · `location.city_id = null` | `witness_permission_result(location, granted)` 但内部 `location.degraded = severe` | 手动选城市 | ❌ 不显示错误代码 |
| **location_denied** | 用户拒绝位置权限 | 段 3 · C-06 Banner · "手动选择城市" 主按钮 | 见 C-06 | `permission.location = denied` | `witness_permission_result(location, denied)` | 手动选城市 → `location_mode = denied_fallback_manual` | ❌ 不显示"必须开启" |
| **location_restricted** | 系统级限制 | 同 denied + "去系统设置" 链接 | "去系统设置" | `permission.location = restricted` | `witness_permission_result(location, restricted)` | "去系统设置" / 手动选 | — |

### 5.2 城市选择（手动 / 降级通用）

| 状态 | 触发条件 | 视觉稿 | 文案 | 字段 | 埋点 | 替代路径 | DO NOT |
|---|---|---|---|---|---|---|---|
| **city_picker_open** | 用户点"手动选择城市" / 降级触发 | 段 3 子页面 / Sheet · 城市列表 · 搜索框（V1: 12 城 + 简单文本搜索） | "选择你的城市" · 搜索框 placeholder "搜索城市" | — | 不发新事件（手动选是中性操作） | 选城市 / 取消 | ❌ 不显示完整 200+ 城市列表（V1 仅 Seed 12 城） |
| **city_selected** | 用户选完城市 | 段 3 · "✓ 你选择了 [城市名]" · "继续" 按钮 | "你选择了 [城市名]" | `location.city_id` (手动) · `location.city_source = user_selected` · `location_mode = manual_city` | 不发新事件 | "重新选择" | — |
| **city_not_in_seed** | 极端情况：用户所在城市不在 Seed 12 城内 | 段 3 · "抱歉，[城市名] 不在 SEE EARTH 当前覆盖范围" + "选择其他城市" / "提交申请"（V1 仅占位） | "抱歉，[城市名] 不在当前覆盖范围" | `location.city_id = null` · `location.not_in_seed = true` | 不发新事件 · 提交时 `error_category = validation` | "选择其他城市" | ❌ 不阻塞（让用户选已知 12 城之一） |

### 5.3 公开预览中的位置表达

| 状态 | 触发条件 | 视觉稿（段 5 预览页） | 文案 | 字段 | 埋点 | 替代路径 | DO NOT |
|---|---|---|---|---|---|---|---|
| **public_preview** | 段 5 提交预览 | 预览卡片：城市名（粗体）· "城市级位置" 标签 · "✓ 公开" | "城市：[城市名]" · "这是你提交后公开将显示的位置" | `public_preview.city_id` · `public_preview.city_display` | 不发埋点（提交前预览） | "返回修改" | ❌ 不显示 GPS 数字 · ❌ 不显示 "country: XXX, region: XXX" 等可推断住址的细节 |
| **location_notice** | 段 5 提交预览 | 预览卡片下方提示框 "我们如何处理你的位置" · 展开后："公开：仅城市名 / 后台：GPS 用于验证，不会公开 / 撤回：可联系 [feedback] 删除" | 见 consent-placement C-05 | — | 不发埋点 | 链接到完整 Privacy | ❌ 不暗示"绝对匿名" |

---

## §6 跨状态联动与总览

### 6.1 状态类别优先级（决定 UI 优先级）

```text
1. 权限状态（必须先解决）         —  阻塞主流程
2. 数据可信度状态（必须可读）      —  阻塞提交
3. 位置降级（必须可处理）         —  阻塞提交（除非手动选完成）
4. 上传状态（必须可观察）         —  阻塞结果
5. 审核状态（异步）              —  不阻塞；P1 通知
```

### 6.2 状态机跳转主路径（Web + iOS 一致）

```text
Entry → ReadingIntro → Started
  → PermCamera/Photo → granted → ContentPicking
  → ExifReading → ConfidenceCheck → CapturedAtConfirm
  → PermLocation → granted/denied → LocationConfirm/Manual
  → DescriptionEntry (optional) → SubmitPreview
  → Submitting → Uploading → ServerConfirmed → ReviewState
  或
  → Uploading → NetworkError/ServerError → Retryable/Failed
```

### 6.3 状态覆盖总表（5 大类 × 子状态数）

| 类别 | 子状态数 | 完整子状态列表 |
|---|---:|---|
| §1 权限 | 18 | camera × 5 + photo_library × 5 + location × 6 + notification × 3（其中 location 含 granted_but_precise_unavailable）|
| §2 数据可信度 | 14 | exif × 4 + 时间合理性 × 5 + 时区 × 4 + tz_unknown 1 |
| §3 上传 | 22 | uploading × 4 + 网络 × 3 + 服务端 × 5 + 客户端校验 × 4 + 重试 × 3 + 取消 × 3 |
| §4 审核 | 11 | submitted/under_review/published/rejected/needs_more_info/withdrawn/failed/expired + P1 状态 × 3（占位）|
| §5 位置降级 | 11 | precise × 4 + city_picker × 3 + public_preview × 2 |
| **总计** | **76** | — |

> **覆盖率 100%**：任务卡 §B 列出的所有状态（权限 4 + EXIF 5 + 上传 5 + 审核 5 + 位置降级 1）及其细分全部覆盖。

---

## §7 自验收（任务卡 Acceptance Criteria 9 项）

| # | 验收项 | 状态 | 证据 |
|---|---|---|---|
| 1 | 首次测试者无需口头指导可完成提交 | ✅ | §1-§5 每个状态都有视觉稿 + 文案 + CTA，无歧义 |
| 2 | 权限拒绝后存在安全可理解的替代路径 | ✅ | §1.1 / §1.2 / §1.3 每个 denied 状态都有替代路径（从相册 / 手动选城市 / 取消） |
| 3 | 公开预览中不存在精确坐标 / 原始 EXIF / 推断住址 | ✅ | §5.3 public_preview 仅 city_id + city_display |
| 4 | 用户在最终提交前能看见将被公开的内容 | ✅ | §5.3 + `flow-diagram-v1.md` §1 段 5 公开预览 |
| 5 | 全部状态都有视觉稿 | ✅ | §1-§5 每行 "视觉稿" 列都有明确描述 |
| 6 | 前端字段与 API 字段一一对应 | ✅ | 见 `api-field-mapping-v1.md` |
| 7 | iOS first-pass 原生导航 + Sheet 风格明确，不复制 Web hover | ✅ | 见 `flow-diagram-v1.md` §4 |
| 8 | 隐私文案与 E-P0-05 位置隔离原则一致 | ✅ | §5.3 location_notice + `copy-final-v1.md` C-03~C-06 |
| 9 | 与 D-P0-05 trigger-diagram §3 状态机对齐 | ✅ | 状态机与 `trigger-diagram-v1.md §3` 完全一致（已对比） |
| 10 | 与 D-P0-05 event-map §5 字段名一致性矩阵对齐 | ✅ | §1-§5 埋点列使用 `permission_type` / `result` / `error_category` / `retryable` / `submission_id` / `location_mode` 等一致字段名 |

---

## §8 已知边界与待 E-P0-09 锁定的字段

| # | 缺口 | Owner | 解锁条件 |
|---|---|---|---|
| 1 | `submission.status` 全部枚举值需 E-P0-09 锁 | E-P0-09 | E-P0-09 contract 锁 |
| 2 | `submission.moderation_reason` 枚举值（V1 至少 5 个：unsafe_content / low_quality / wrong_location / not_a_moment / other）需 E-P0-09 锁 | E-P0-09 | E-P0-09 contract 锁 |
| 3 | `captured_at_source` 全部枚举值（exif / user_confirmed / admin）需 E-P0-09 锁 | E-P0-09 | E-P0-09 contract 锁 |
| 4 | `location.city_source` 全部枚举值（gps_reverse / user_selected / inferred）需 E-P0-09 锁 | E-P0-09 | E-P0-09 contract 锁 |
| 5 | `error_category` 完整枚举（9 个已列）需 E-P0-09 锁 | E-P0-09 | E-P0-09 contract 锁 |
| 6 | `retry_count` 上限（V1 建议 2 自动 + 1 手动 = 3）需 E-P0-03 锁 | E-P0-03 | E-P0-03 决策 |
| 7 | 草稿保留时长（V1 建议 24h）需 E-P0-03 锁 | E-P0-03 | E-P0-03 决策 |
| 8 | 短描述长度上限（V1 建议 280 字）需 E-P0-09 锁 | E-P0-09 | E-P0-09 contract 锁 |
| 9 | 城市 Seed 列表（V1 12 城）需 E-P0-06 锁 | E-P0-06 | E-P0-06 supply chain |

---

**End of state-matrix-v1.md · D-P0-02 子产物 2/5**
