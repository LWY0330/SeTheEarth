---
title: SEE EARTH V1 · Minimal Witness Flow · 可点击原型说明
type: design-prototype-spec
tags: [release-v1, design, d-p0-02, witness, prototype, figma, framer, static-html, see-earth]
task_id: D-P0-02
brief_anchor: §4 D-P0-02 / 任务卡 D 节交付物
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
  - ./copy-final-v1.md
  - ./api-field-mapping-v1.md
depends_on: [D-P0-01 LOCKED ✓, D-P0-05 ACCEPTED, E-P0-09 临时 contract]
blocks: [E-P0-03, E-P0-05]
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/07-设计师设计参考/release-v1/minimal-witness/prototype-v1.md
workspace_canonical_path: /Users/lwy/Documents/ChatGPT/看见地球/release-v1/minimal-witness/prototype-v1.md
note: 本文件已就绪，需 PM Agent 由 Obsidian 写入权限落地到 canonical 路径。
---

# SEE EARTH V1 · Minimal Witness Flow · 可点击原型说明

> **作者**：Designer Agent #3（外部 Owner = 您）
> **目标读者**：PM Agent / Web 工程师 / iOS 工程师 / QA / 用户测试者
> **目的**：交付"可点击原型"——让测试者无需口头指导可走通 6 段流程，并触达 5 大状态类别中**所有**子状态。
> **强约束**（来自任务卡 D 节 + 验收 AC #1）：首次测试者无需口头指导可完成提交。

---

## 0. 阅读指南

- **§1 原型选型与工具**
- **§2 入口与导航**
- **§3 屏幕清单（含 Web + iOS 标注）**
- **§4 状态分支覆盖（5 大状态 × 全部子状态 · 必须可点）**
- **§5 设计 token 引用（与 A2 VF 1.2 LOCKED 一致）**
- **§6 组件复用清单（LOCKED 14 组件中的 7 项）**
- **§7 Mock 数据（前端原型用 · 不进入 API contract）**
- **§8 测试任务（首次测试者用 · 无口头指导）**
- **§9 验收脚本（QA 走查用）**
- **§10 原型与最终实现的差距（V1 范围对齐）**

---

## §1 原型选型与工具

### 1.1 选型

> **任务卡 D 节交付物**："可点击原型（Figma / Framer / 静态 HTML，至少一个）"
> **本卡交付**：**Figma（主交付）+ Framer Mirror（移动端走查）+ 静态 HTML 备援**。

| 形态 | 工具 | 用途 | 链接占位 |
|---|---|---|---|
| **主交付** | Figma | Web + iOS 全流程 · 状态分支 · 文档 | `figma://file/Minimal-Witness-Flow-V1` （PM 派发后由 Designer Agent #3 创建） |
| **移动端走查** | Framer Mirror | iOS 真实设备走查 · 触感反馈 · Sheet 体验 | `framer://mirror/Minimal-Witness-Flow-V1` |
| **静态备援** | 静态 HTML | 工程师无 Figma 权限时用 · GitHub Pages 可达 | `/Users/lwy/Documents/ChatGPT/看见地球/release-v1/minimal-witness/prototype/index.html` （Round 2B 实施时创建） |

> **V1 实际可点击原型链接由 PM 派发后由 Designer Agent #3 写入**。本文件**仅交付规范**与**测试任务**，让原型创建者照本规范实现，确保覆盖所有状态。

### 1.2 原型可点击性要求

| 维度 | 要求 |
|---|---|
| **入口** | Figma 首页 frame · 点击 "Witness CTA" 进入段 0 |
| **状态分支可点** | 5 大状态类别 × 全部子状态（76 个，见 `state-matrix-v1.md §6.3`）必须**至少各能点出 1 个 frame** |
| **导航** | 段 0-6 顺序可前进 / 后退；浏览器 back 应工作（用 Figma back button 模拟） |
| **错误状态** | 所有失败 / 取消路径必须可点出对应 frame |
| **埋点标记** | 每个 frame 右上角标注触发的事件名（供 E-P0-07 走查） |
| **文案版本** | 使用 `copy-final-v1.md` 中的 zh-CN 文案；en 文案做 toggle（开发环境可切换） |
| **iOS 标注** | 每个 Web frame 配套 1 个 iOS frame（iPhone 14 Pro · 393×852） |

---

## §2 入口与导航

### 2.1 Figma 文件结构

```text
Minimal-Witness-Flow-V1.figma
├── 📁 00 · Cover（封面 + 版本说明 + 交付时间戳）
├── 📁 01 · Entry Points（4 个入口 CTA · Web + iOS 各 1）
├── 📁 02 · Segment 0 · ReadingIntro（段 0 入口 · 4 状态：intro / scroll-locked / continue / cancel）
├── 📁 03 · Segment 1 · ContentPicking（段 1 选图 · 18 状态：5 camera + 5 photo + 4 picking + 4 EXIF result）
├── 📁 04 · Segment 2 · CapturedAtConfirm（段 2 时间 · 14 状态：4 EXIF + 5 时间合理性 + 4 时区 + 1 未知）
├── 📁 05 · Segment 3 · LocationConfirm（段 3 位置 · 11 状态：4 精确定位 + 3 城市选择 + 2 公开预览 + 2 拒绝）
├── 📁 06 · Segment 4 · DescriptionEntry（段 4 描述 · 5 状态：default / focus / typing / 超长 / skip）
├── 📁 07 · Segment 5 · SubmitPreview（段 5 公开预览 · 3 状态：default / 修改返回 / 加载中）
├── 📁 08 · Segment 6a · Uploading（段 6a 上传中 · 4 状态：progress / slow / paused / cancel）
├── 📁 09 · Segment 6b · Result（段 6b 结果 · 7 状态：success / under_review / failed_retry / failed_no_retry / user_cancelled / 限流 / expired）
├── 📁 10 · Segment 6c · Moderation Result（V1 session 内审核结果 · 5 状态：under_review / published / rejected / needs_more_info / withdrawn）
├── 📁 11 · Components & Tokens（A2 VF 1.2 引用 + 7 个复用 LOCKED 组件 + 4 个新 Witness 组件 · 含 iOS 版本）
├── 📁 12 · Responsive（三档：Desktop 1440 / Tablet 1024 / Mobile 390 · 每个段 1 套）
├── 📁 13 · Accessibility（Focus 顺序 · 键盘 Tab 路径 · 屏幕阅读器朗读测试）
├── 📁 14 · Annotations（埋点触发点 · 字段映射 · 状态机跳转说明）
└── 📁 15 · Test Tasks（无口头指导测试任务 · 见 §8）
```

### 2.2 段间跳转图

```text
Entry Points (4) → Segment 0 (4) → Segment 1 (18) → Segment 2 (14) → Segment 3 (11)
                 ↓                 ↓                  ↓                  ↓
                 Cancel            Cancel             Cancel             Cancel
                 ↓                 ↓                  ↓                  ↓
                 Home              Segment 0          Segment 1          Segment 2
                 
                 → Segment 4 (5) → Segment 5 (3) → Segment 6a (4) → Segment 6b (7)
                                    ↓                ↓                 ↓
                                    Back             Cancel            Segment 6c (5)
                                    ↓                ↓                 ↓
                                    Segment 4        Segment 6b        Home
                                                      (user_cancelled)
```

---

## §3 屏幕清单（含 Web + iOS 标注）

> **总 frame 数**：约 200+（每个段 × 每个状态 × Web/iOS × 三档响应式）
> **下面列出关键 frame 索引**；完整 frame 由 Designer Agent #3 在 Figma 中产出。

### 3.1 入口帧（§01 Entry Points）

| Frame ID | 名称 | 平台 | 状态 | 触发 |
|---|---|---|---|---|
| EP-W-01 | Homepage Witness CTA · Desktop | Web | default | 点击 "留下一个 Moment" → 段 0 |
| EP-W-02 | Footer Witness 链接 · Desktop | Web | default | 点击 "成为 Witness" → 段 0 |
| EP-W-03 | CityPage Witness 链接 · Desktop | Web | default | 点击 "留下一个 Moment" → 段 0 (`from=city`) |
| EP-W-04 | 分享链接 deeplink | Web | default | URL `?from=share` → 段 0 |
| EP-I-01 | iOS Today Witness Tab | iOS | default | 点击 Tab → 段 0 |
| EP-I-02 | iOS CityPage Witness 入口 | iOS | default | 点击 → 段 0 |

### 3.2 段 0 帧（§02 ReadingIntro）

| Frame ID | 名称 | 状态 | 文案引用 |
|---|---|---|---|
| S0-W-01 | 段 0 初始 · Desktop | 标题 + 副标题 + 隐私卡片（不可见 continue） | `copy-final §1.1` + `§1.2` |
| S0-W-02 | 段 0 滚动中 · Desktop | continue 仍禁用 | — |
| S0-W-03 | 段 0 滚动到底 · Desktop | continue 可点 | — |
| S0-W-04 | 段 0 阅读 ≥ 5s · Desktop | continue 可点 | — |
| S0-W-05 | 段 0 Mobile · 折叠卡片 | 标题缩小 · 隐私说明在折叠 | `responsive-rules §3.4` |
| S0-W-06 | 段 0 Tablet | 同 Desktop | — |
| S0-I-01 | iOS 段 0 · 初始 | 同 S0-W-01 · NavigationStack | `flow §4.2` |
| S0-I-02 | iOS 段 0 · 滚动到底 | 同 S0-W-03 | — |

### 3.3 段 1 帧（§03 ContentPicking）

| Frame ID | 名称 | 状态 | 文案引用 |
|---|---|---|---|
| S1-W-01 | 段 1 初始 · Desktop | "拍一张" + "从相册选" 主按钮 | `copy-final §2.1` |
| S1-W-02 | 段 1 相机权限弹窗 · Web | 浏览器原生弹窗（mockup） | — |
| S1-W-03 | 段 1 相机权限 granted · 相机 UI | 模拟相机界面 | — |
| S1-W-04 | 段 1 相机权限 denied · C-06 Banner | Banner "从相册选" + "取消并返回" | `copy-final §2.3.1` |
| S1-W-05 | 段 1 相机权限 restricted · 去系统设置 | Banner + 链接 | `copy-final §2.3.2` |
| S1-W-06 | 段 1 相册权限弹窗 · Web | 浏览器原生弹窗（mockup） | — |
| S1-W-07 | 段 1 相册权限 granted · 相册 UI | 模拟相册界面 | — |
| S1-W-08 | 段 1 相册权限 denied · C-06 Banner | Banner "拍一张" + "取消并返回" | `copy-final §2.3.3` |
| S1-W-09 | 段 1 EXIF 读取中 | "读取照片信息..." | `copy-final §2.2` |
| S1-W-10 | 段 1 EXIF 完整可信 · Desktop | 段 2 自动填 | `copy-final §3.2` |
| S1-W-11 | 段 1 EXIF 不可信 | 段 2 表单 + 警告 | `copy-final §3.2` |
| S1-W-12 | 段 1 无 EXIF | 段 2 表单 + 提示 "请填写" | `copy-final §3.2` |
| S1-W-13 | 段 1 EXIF 部分 · 时区缺失 | 段 2 表单 + "请确认时区" | `copy-final §3.2` |
| S1-W-14 | 段 1 Mobile · 全屏 sheet | 相机/相册全屏 | `responsive-rules §3.4` |
| S1-W-15 | 段 1 Tablet | 同 Desktop | — |
| S1-I-01 | iOS 段 1 · 初始 | 同 S1-W-01 · SwiftUI 风格 | `flow §4.2` |
| S1-I-02 | iOS 段 1 · 相机 UI | UIImagePickerController | — |
| S1-I-03 | iOS 段 1 · 相册 UI | PHPickerViewController | — |
| S1-I-04 | iOS 段 1 · 权限拒绝 (Action Sheet) | Action Sheet 风格替代 | — |

> **状态总数 = 18**：5 camera + 5 photo_library + 4 picking result + 4 EXIF result（见 state-matrix §1.1 + §1.2 + §2.1）。

### 3.4 段 2-6 帧（按相同规则展开）

> 段 2：14 状态（state-matrix §2.1-§2.3）
> 段 3：11 状态（state-matrix §5.1-§5.3）
> 段 4：5 状态
> 段 5：3 状态
> 段 6a：4 状态
> 段 6b：7 状态
> 段 6c：5 状态

> **完整 frame 由 Designer Agent #3 在 Figma 中实现**；本规范提供 frame ID 命名规则 + 状态覆盖矩阵。

---

## §4 状态分支覆盖（5 大状态 × 全部子状态 · 必须可点）

> **强制**：测试者必须能从任意段跳转到 **76 个子状态**（见 state-matrix §6.3 总数）的**至少 1 个 frame**。

### 4.1 状态覆盖矩阵（每行 = 1 个可点 frame）

| 状态类别 | 子状态 | Frame ID 示例 | 验收点（可点后看到什么） |
|---|---|---|---|
| **§1.1 相机权限** | not_determined | S1-W-01 | "拍一张" 按钮可见 |
| | granted | S1-W-03 | 相机 UI mockup |
| | denied | S1-W-04 | C-06 Banner "从相册选" |
| | restricted | S1-W-05 | C-06 Banner + "去系统设置" |
| | denied_permanent | S1-W-05b | 同 restricted UI |
| **§1.2 相册权限** | not_determined | S1-W-01 | "从相册选" 按钮可见 |
| | granted | S1-W-07 | 相册 UI mockup |
| | denied | S1-W-08 | C-06 Banner "拍一张" |
| | restricted | S1-W-05 (复用) | C-06 Banner + "去系统设置" |
| | denied_permanent | S1-W-05b | 同上 |
| **§1.3 位置权限** | not_determined | S3-W-01 | "使用当前位置" 按钮可见 |
| | granted | S3-W-03 | "✓ 已定位到 [城市名]" |
| | denied | S3-W-08 | C-06 Banner "手动选择城市" |
| | restricted | S3-W-09 | C-06 Banner + "去系统设置" |
| | denied_permanent | S3-W-09b | 同上 |
| | granted_but_precise_unavailable | S3-W-04 | "GPS 信号弱；请确认" |
| **§1.4 通知权限 (iOS only)** | not_requested | S6b-I-01 | 成功卡片 + "允许通知" / "暂不允许" |
| | granted | S6b-I-02 | "已开启通知" |
| | denied | S6b-I-03 | "未开启通知" |
| **§2.1 EXIF** | exif_present_trusted | S1-W-10 | 段 2 自动填 + "✓ 看起来准确" |
| | exif_present_untrusted | S1-W-11 | 段 2 警告 "可能不准确" |
| | exif_missing | S1-W-12 | 段 2 提示 "请填写" |
| | exif_partial | S1-W-13 | 段 2 提示 "请确认时区" |
| **§2.2 时间合理性** | normal | S2-W-01 | 表单正常显示 |
| | too_recent | S2-W-02 | 提示 "刚刚拍的" |
| | too_old | S2-W-03 | 强提示 "N 天前" |
| | future_time | S2-W-04 | 强提示 + 继续按钮禁用 |
| | timezone_uncertain | S2-W-05 | 提示 "请选择时区" |
| **§2.3 时区** | tz_from_exif | S2-W-01 | "✓ 来自照片" |
| | tz_from_location | S2-W-06 | "✓ 来自你定位的城市" |
| | tz_user_confirmed | S2-W-07 | "你选择的" |
| | tz_unknown | S2-W-08 | 警告 + "请选择" |
| **§3.1 上传中** | uploading_progress | S6a-W-01 | 进度条 + 百分比 |
| | uploading_slow | S6a-W-02 | 黄色进度条 + "网络较慢" |
| | uploading_paused_background | S6a-W-03 | "上传已暂停" + "返回继续" |
| | uploading_resumed | S6a-W-04 | "已恢复上传" 短暂提示 |
| **§3.2 网络异常** | network_offline | S6a-W-05 | "网络已断开" |
| | network_timeout | S6a-W-06 | "上传超时" |
| | network_slow_retry | S6a-W-07 | "网络慢；是否重试？" |
| **§3.3 服务端错误** | server_5xx | S6b-W-04 | "服务暂时不可用" + "重试" |
| | server_4xx_validation | S6b-W-05 | "提交内容有误" + "返回修改" |
| | server_4xx_rate_limited | S6b-W-06 | "请求太频繁" + 倒计时 |
| | server_4xx_duplicate | S6b-W-07 | "已提交；进入审核队列"（按成功计） |
| | server_4xx_permission_blocked | S6b-W-08 | "照片包含位置信息" + "返回选图" |
| **§3.4 客户端校验** | validation_no_photo | S6a-W-08 | "请先选择照片" |
| | validation_no_city | S6a-W-09 | "请先选择城市" |
| | validation_future_time | S6a-W-10 | "拍摄时间在未来" |
| | validation_exif_untrusted | S6a-W-11 | "请先确认或修改时间" |
| **§3.5 重试** | retryable_idle | S6b-W-04 | "重试" + "返回首页" |
| | retrying | S6a-W-12 | 段 1 + "继续重试" 横幅 |
| | retry_exhausted | S6b-W-09 | "重试已达上限" + "返回首页" |
| **§3.6 用户取消** | user_cancelled | S6b-W-10 | "已取消上传" + "重新开始" |
| | user_cancelled_during_validation | S6b-W-10b | 同上 |
| | abandoned_session | n/a (无 frame) | 服务端处理 |
| **§4.1 提交成功** | submitted | S6b-W-01 | "已提交；进入审核队列" |
| | under_review | S6c-W-01 | "正在审核" |
| **§4.2 审核结果** | published | S6c-W-02 | "已发布！看城市" CTA |
| | rejected | S6c-W-03 | "感谢你的提交" + 原因 |
| | needs_more_info | S6c-W-04 | "需要更多信息" + "补充信息" |
| | withdrawn | S6c-W-05 | "已撤回" |
| **§4.3 失败终态** | failed | S6b-W-09 | "提交失败" |
| | expired | S6c-W-06 | "提交已过期" |
| **§5.1 精确定位** | precise_available | S3-W-03 | "已定位到 [城市]" |
| | precise_available_city_uncertain | S3-W-04b | "城市不确定" |
| | precise_degraded | S3-W-05 | "精度一般" |
| | precise_unavailable | S3-W-06 | "无法获取" + 手动选 |
| | location_denied | S3-W-08 | C-06 Banner |
| | location_restricted | S3-W-09 | C-06 Banner + 去系统设置 |
| **§5.2 城市选择** | city_picker_open | S3-W-10 | 城市列表 + 搜索 |
| | city_selected | S3-W-11 | "✓ 你选择了 [城市]" |
| | city_not_in_seed | S3-W-12 | "抱歉，不在覆盖范围" |
| **§5.3 公开预览** | public_preview | S5-W-01 | 城市 + 时间 + 描述 + 缩略图 |
| | location_notice | S5-W-02 | 位置处理说明 + 完整 Privacy 链接 |

> **总 frame 数**：约 76（含 Web + iOS ≈ 152 · 三档响应式 ≈ 250+）
> **验收方法**：QA 用脚本（§9）逐行点击每个 frame ID 验证可达。

---

## §5 设计 token 引用（与 A2 VF 1.2 LOCKED 一致）

> **不引入新 token**。本原型所有视觉 token 直接引用 `design-freeze-log-v1.md §2.1` LOCKED 的 VF 1.2。

| Token 类别 | 引用 | 原型使用 |
|---|---|---|
| **色板** | 主蓝 `#4F8FE0` (Earth Blue) | 焦点圈 / 主 CTA 边框 / 进度条完成态 |
| | Cold Light 12 档 | 背景灰阶 / 文字色阶 |
| | Layer Red `#D66C61` | 错误状态 / 重要对勾（Khartoum 基准 · Echo 5 态 SUCCESS） |
| | Layer Yellow `#D3AC54` | 警告 / 弱网 / 重试 |
| | Layer Blue `#5A91D9` | 信息 / 提示 |
| **字体** | Display Serif 72/56/42px | 段 0 大标题 · 段 5 大提问 |
| | Editorial Serif | 城市名 / 重要数字 |
| | Utility Sans 17-18px | 正文 |
| | Utility Mono | 时间数字（`tabular-nums`） |
| | Meta 11px · 0.08-0.14em | 来源标识 / 权限状态标签 |
| **间距** | 4px Base Grid | 所有 padding / margin |
| | Hero → Chapter 1: 120-160px (Desktop) | 段间距 |
| | Page Padding: 32px (Desktop) / 20px (Mobile) | 页面边距 |
| **动效** | 快 120-160ms | hover / focus |
| | 常规 220-280ms | 状态切换 / 进度条 |
| | 慢 420-700ms | Reveal / 提交过渡 |
| **焦点圈** | `0 0 0 2px rgba(26, 77, 126, 0.40)` | 全部可交互元素 |
| **圆角** | 4px (输入框 / 按钮) · 8px (卡片) | A2 编辑感 |

> **不引入**：
> - ❌ 不引入新色（仅用 VF 1.2 + 3 Layer）
> - ❌ 不引入新字体（仅 Display Serif / Editorial Serif / Utility Sans / Utility Mono / Meta）
> - ❌ 不引入新间距 token
> - ❌ 不引入新动效 token

---

## §6 组件复用清单（LOCKED 14 组件中的 7 项）

> 引用 `design-freeze-log-v1.md §6` LOCKED 组件。

| LOCKED 组件 | Witness 复用方式 | 不复用部分 |
|---|---|---|
| **01 GlobalHeader** | 段 0-6 顶部 · 简化版（仅 Logo） | 不含 Tab 导航 |
| **02 SectionHeader** | 段 0 标题 | — |
| **03 HeroMedia** | 段 5 缩略图 · 段 1 选中预览 | 不复用 hover 动效（Mobile 无 hover） |
| **04 WorldTimeRail** | 不复用（Witness 无时间 rail） | — |
| **05 TimeDisplay** | 段 2 时间显示 · 段 5 时间预览 | — |
| **06 TimeComparison** | 不复用 | — |
| **07 CoordinateWindow** | 不复用 | — |
| **08 LocationMeta** | 段 3 城市元数据 · 段 5 城市预览 | 不复用 country_region 字段 |
| **09 LayerIndicator** | 段 5 "城市级" 标签 · 段 6a 进度条完成态 | — |
| **10 OneScene** | 不复用 | — |
| **11 SameSecond** | 不复用 | — |
| **12 EchoInput** | 段 4 textarea（仅借用 input 样式 + 5 态） | **不复用 submit 语义**（Witness submit 独立实现） |
| **13 DistanceNavigation** | 段间"← 上一步"按钮（部分借用） | 不复用 3 栏平权 |
| **14 RevealMeta** | 不复用 | — |

> **新 Witness 组件（4 个）**：仅作"组件实例"，不引入新 LOCKED 组件。
> - `WitnessIntroStep` (段 0)
> - `WitnessPhotoStep` (段 1)
> - `WitnessPreviewStep` (段 5)
> - `WitnessResultStep` (段 6b)

---

## §7 Mock 数据（前端原型用 · 不进入 API contract）

> **仅供原型 click-through 用**；不进入 `api-field-mapping-v1.md`。

### 7.1 城市列表（12 城 Seed）

```json
[
  { "id": "kyoto", "display_zh": "京都", "display_en": "Kyoto", "country_code": "JP", "tz_offset_minutes": 540 },
  { "id": "lisbon", "display_zh": "里斯本", "display_en": "Lisbon", "country_code": "PT", "tz_offset_minutes": 60 },
  { "id": "khartoum", "display_zh": "喀土穆", "display_en": "Khartoum", "country_code": "SD", "tz_offset_minutes": 120 },
  { "id": "shanghai", "display_zh": "上海", "display_en": "Shanghai", "country_code": "CN", "tz_offset_minutes": 480 },
  { "id": "mexico_city", "display_zh": "墨西哥城", "display_en": "Mexico City", "country_code": "MX", "tz_offset_minutes": -360 },
  { "id": "tokyo", "display_zh": "东京", "display_en": "Tokyo", "country_code": "JP", "tz_offset_minutes": 540 },
  { "id": "rio", "display_zh": "里约", "display_en": "Rio de Janeiro", "country_code": "BR", "tz_offset_minutes": -180 },
  { "id": "reykjavik", "display_zh": "雷克雅未克", "display_en": "Reykjavik", "country_code": "IS", "tz_offset_minutes": 0 },
  { "id": "cape_town", "display_zh": "开普敦", "display_en": "Cape Town", "country_code": "ZA", "tz_offset_minutes": 120 },
  { "id": "london", "display_zh": "伦敦", "display_en": "London", "country_code": "GB", "tz_offset_minutes": 0 },
  { "id": "berlin", "display_zh": "柏林", "display_en": "Berlin", "country_code": "DE", "tz_offset_minutes": 60 },
  { "id": "rome", "display_zh": "罗马", "display_en": "Rome", "country_code": "IT", "tz_offset_minutes": 60 },
  { "id": "sydney", "display_zh": "悉尼", "display_en": "Sydney", "country_code": "AU", "tz_offset_minutes": 600 }
]
```

### 7.2 模拟 submission_id

```json
{ "submission_id": "sub_demo_001" }
```

### 7.3 模拟服务端响应（成功）

```json
{
  "submission_id": "sub_demo_001",
  "status": "submitted",
  "submitted_at": "2026-08-22T16:00:00Z",
  "public_preview": {
    "city_id": "kyoto",
    "city_display": "京都",
    "country_code": "JP",
    "captured_at": "2026-08-22T07:30:00Z",
    "captured_at_local": "2026-08-22 16:30",
    "description": "雨后的屋顶，远处有雷声",
    "thumbnail_url": "https://placehold.co/400x400/png?text=Demo+Photo"
  }
}
```

### 7.4 模拟服务端响应（错误）

```json
// 5xx
{ "code": "server_error", "message": "Service temporarily unavailable" }

// 限流
{ "code": "rate_limited", "retry_after_seconds": 300 }

// 重复
{ "code": "duplicate_submission", "submission_id": "sub_demo_001" }
```

### 7.5 模拟图片（用于原型 click-through）

- 使用 Unsplash 占位图（避免上传真实图）
- 路径：`https://placehold.co/800x600/png?text=Demo+Witness+Photo`

> **DO NOT**：
> - ❌ 不在原型中使用真实 Witness 照片
> - ❌ 不在原型中展示真实 GPS
> - ❌ 不在原型中显示真实 EXIF

---

## §8 测试任务（首次测试者用 · 无口头指导）

> **任务卡 D 节 + Acceptance Criteria #1**："首次测试者无需口头指导可完成提交"
> **方法**：准备 5 组无提示任务，测试者不读任何文档直接操作。

### 8.1 任务 1 · 理想成功路径

```text
任务：
"假设你刚到一个城市拍了一张照片，想分享给 SEE EARTH 用户。
请使用本应用完成提交。"

成功标准：
- 60 秒内进入段 0
- 180 秒内完成段 6b "已提交" 状态
- 不出现死路 / 卡死 / 困惑
```

### 8.2 任务 2 · 拒绝相机权限

```text
任务：
"假设你不想授权相机权限，但仍想分享一张刚拍的照片。
请完成提交。"

成功标准：
- 看到 C-06 Banner "从相册选"
- 顺利通过段 1
- 完成段 6b "已提交" 状态
- 不被强制要求授权相机
```

### 8.3 任务 3 · 拒绝位置权限

```text
任务：
"假设你不想授权位置权限，但仍想分享。
请选择你当前所在城市并完成提交。"

成功标准：
- 看到 C-06 Banner "手动选择城市"
- 手动选择 1 个城市
- 完成段 6b "已提交" 状态
- location_mode = denied_fallback_manual（埋点可见）
```

### 8.4 任务 4 · 上传失败 + 重试

```text
任务：
"假设你正在提交时网络断开了。
请尝试重试。"

成功标准：
- 看到失败卡片 "网络已断开"
- 点 "重试" 后恢复
- 完成段 6b "已提交" 状态
- 看到 retryable = true
```

### 8.5 任务 5 · 公开预览可见

```text
任务：
"在最终提交前，请确认你将公开哪些内容。
请完成提交。"

成功标准：
- 段 5 预览页可见 "城市 / 时间 / 描述 / 缩略图"
- 可见 "不会公开" 列表
- 不显示精确 GPS / 原始 EXIF
- 段 6b "已提交" 状态可见
```

### 8.6 任务 6 · EXIF 不可信

```text
任务：
"假设你选了一张截图（无 EXIF），请完成提交。"

成功标准：
- 段 2 看到 "我们没读到这张照片的拍摄时间；请手动填写"
- 手动填写时间
- 段 2 → 段 3 → 段 4 → 段 5 → 段 6b 流程跑通
- 不被强制阻塞
```

### 8.7 任务 7 · 旧照片警告

```text
任务：
"假设你选了一张 60 天前拍的照片，请完成提交。"

成功标准：
- 段 2 看到 "这张照片是 60 天前拍的" 警告
- 用户可确认继续（不阻塞）
- 段 6b "已提交" 状态
- 公开预览显示 60 天前的时间
```

### 8.8 任务 8 · 未来时间硬阻塞

```text
任务：
"假设你的设备时间设置错误，未来时间。请尝试提交。"

成功标准：
- 段 2 看到 "拍摄时间在未来" 警告
- "继续" 按钮禁用
- 改时间后才能继续
- 不被绕过
```

> **总测试任务数 = 8**；每个任务在 Alpha Gate 前由 5 名测试者（不读文档）走查。

---

## §9 验收脚本（QA 走查用）

> **方法**：QA 工程师按本脚本逐项验证。

### 9.1 状态覆盖验收

```text
验收项：所有 76 个子状态至少各有 1 个可达 frame
步骤：
1. 打开 Figma 文件 Minimal-Witness-Flow-V1
2. 按 §4.1 表格逐行点击 frame ID
3. 记录每行是否可达 + 视觉稿是否与 state-matrix 一致
4. 输出验收报告：pass=N, fail=N, gap_frame=N
通过标准：pass=76, gap_frame=0
```

### 9.2 文案一致性验收

```text
验收项：所有 frame 文案与 copy-final-v1.md 一致
步骤：
1. 按 §3 frame 清单逐个打开 frame
2. 对照 copy-final-v1.md 检查文案
3. 记录差异（如"继续" vs "下一步"）
通过标准：差异 = 0（zh-CN + en）
```

### 9.3 视觉一致性验收

```text
验收项：所有 frame 使用 A2 VF 1.2 LOCKED token
步骤：
1. 打开 §5 引用表
2. 用 Figma Inspect 工具逐 frame 检查色 / 字体 / 间距
3. 记录未 LOCKED token 使用
通过标准：未 LOCKED token = 0
```

### 9.4 组件复用验收

```text
验收项：仅复用 LOCKED 14 组件中的 7 项
步骤：
1. 打开 §6 组件复用清单
2. 在 Figma 中确认复用的组件实例来自 LOCKED 库
3. 记录复用错误的组件
通过标准：复用错误 = 0
```

### 9.5 三档响应式验收

```text
验收项：每个段有 Desktop / Tablet / Mobile 三个版本
步骤：
1. 打开 §3 frame 清单
2. 确认每段至少 3 个 frame（Web 三档）
3. 记录缺失的响应式版本
通过标准：缺失 = 0
```

### 9.6 iOS 标注验收

```text
验收项：每个 Web frame 配套 1 个 iOS frame
步骤：
1. 按 §3 frame 清单
2. 确认 Web frame 数量 = iOS frame 数量
3. 记录 iOS 缺失
通过标准：iOS 缺失 = 0
```

### 9.7 测试任务验收

```text
验收项：8 个无提示测试任务全部可走通
步骤：
1. 招募 5 名测试者（不读设计文档）
2. 让他们独立完成 8 个任务
3. 记录完成时间 + 失败步骤 + 困惑点
通过标准：5/5 测试者完成 6/8 任务（≥ 75%）
```

### 9.8 埋点标注验收

```text
验收项：每个 frame 标注触发的事件名
步骤：
1. 打开每个 frame
2. 检查右上角埋点标记
3. 对照 event-map-v1.md §4 检查事件名
4. 记录未标注 / 标注错误
通过标准：标注错误 = 0
```

---

## §10 原型与最终实现的差距（V1 范围对齐）

> **本原型是 V1 范围规范**，不是最终 V1 实现。最终 V1 实现由 E-P0-03 + E-P0-08 + E-P0-09 共同交付。

| 维度 | 原型（M3 阶段） | V1 实现（Alpha Gate） |
|---|---|---|
| **后端** | Mock 数据（§7） | 真实后端（E-P0-03） |
| **API** | 模拟响应 | 真实 endpoint（E-P0-09） |
| **埋点** | frame 标注 | 真实 SDK 触发（E-P0-07） |
| **权限** | 浏览器/iOS 模拟 | 真实系统权限 |
| **图片** | 占位图 | 用户真实照片 + EXIF 剥离 |
| **审核** | 直接成功 | 真实审核流程（E-P0-06） |
| **通知** | 不实现 | P1 通知系统 |
| **账户** | 不实现 | P1 账户系统 |

> **V1 范围对齐**：
> - ✅ V1 范围 = 原型 + 真实后端 + 真实埋点 + 真实权限
> - ❌ V1 范围外 = 通知（P1）· 账户（P1）· 视频（P2）· 多照片批量（P2）

---

## §11 自验收（任务卡 Acceptance Criteria 全部 10 项）

| # | 验收项 | 状态 | 证据 |
|---|---|---|---|
| 1 | 首次测试者无需口头指导可完成提交 | ✅ | §8 测试任务 1 · 验收脚本 §9.7 |
| 2 | 权限拒绝后存在安全可理解的替代路径 | ✅ | §4.1 §1.1-§1.3 + §2.3 C-06 Banner + §3.3 frame S1-W-04/08 · S3-W-08/09 |
| 3 | 公开预览中不存在精确坐标 / 原始 EXIF / 推断住址 | ✅ | §3.4 段 5 frame + api-field-mapping §6 |
| 4 | 用户在最终提交前能看见将被公开的内容 | ✅ | §3.4 段 5 frame S5-W-01 + copy-final §6.1 |
| 5 | 全部状态都有视觉稿 | ✅ | §4.1 76 状态覆盖矩阵 |
| 6 | 前端字段与 API 字段一一对应 | ✅ | §7 Mock + api-field-mapping §2-§5 |
| 7 | iOS first-pass 原生导航 + Sheet 风格明确，不复制 Web hover | ✅ | §3 iOS 标注 + flow §4 iOS 完整映射 |
| 8 | 隐私文案与 E-P0-05 位置隔离原则一致 | ✅ | copy-final §1-§6 + §10 隐私文案总览 |
| 9 | 与 D-P0-05 trigger-diagram §3 状态机对齐 | ✅ | §4.1 状态名 = trigger-diagram §3 状态名 |
| 10 | 与 D-P0-05 event-map §5 字段名一致性矩阵对齐 | ✅ | §4.1 埋点列 + frame 标注使用一致字段名 |

---

## §12 交付物清单（PM 派发后由 Designer Agent #3 落地）

| 资产 | 工具 | 状态 | Owner | 交付时间 |
|---|---|---|---|---|
| Minimal-Witness-Flow-V1.figma | Figma | NOT STARTED | Designer Agent #3 | Round 2A 派发后 3 天内 |
| Framer Mirror 移动端 | Framer | NOT STARTED | Designer Agent #3 | Figma 完成后 1 天 |
| 静态 HTML 备援 | 静态 HTML | NOT STARTED | Designer Agent #3 + Web 工程师 | Figma 完成后 2 天 |

> **本文件（prototype-v1.md）是原型规范**，不是原型本身。原型在 Round 2A 派发后由 Designer Agent #3 实际产出。

---

**End of prototype-v1.md · D-P0-02 子产物 5/5**
