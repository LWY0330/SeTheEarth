---
title: SEE EARTH V1 · Loading / Error / Empty 横切规范 · 全站统一
type: design-state-spec
tags: [release-v1, design, d-p0-04, system-states, loading, error, empty, permission, privacy, cross-cutting, see-earth]
task_id: D-P0-04
brief_anchor: §4 D-P0-04 + Task Card §B
track: design
owner: 外部 Designer Owner（您）
created: 2026-08-24
status: IN REVIEW
target_gate: Gate A · Internal Alpha
source_brief: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/SEE-EARTH-Release-Strategy-v1-Design-Engineering-Task-Brief.md
source_task_card: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/06-PM Agent 交接/2026-08-22-task-card-d-p0-04-system-states.md
related_docs:
  - ./state-matrix-v1.md
  - ./copy-library-v1.md
  - ./component-contract-v1.md
  - ../web-v1-flow/sitemap-v1.md (§1.2 5 状态层)
  - ../web-v1-flow/design-freeze-log-v1.md (§6 14 组件 6 状态)
  - ../web-v1-flow/responsive-rules-v1.md (§3 逐页面 / §5 信息层级)
  - ../minimal-witness/state-matrix-v1.md (Witness 76 状态)
  - ../minimal-witness/copy-final-v1.md (§9 公共文案组件)
  - ../analytics-events/event-map-v1.md (§1-§5 P0 14 事件)
  - ../analytics-events/forbidden-fields-v1.md (30 禁采项)
  - ../../05-项目现状/release-v1/design-implementation/phase1-design-impl-report.md (VF 1.2 token)
  - ../../05-项目现状/release-v1/design-implementation/v2-phase15-report.md (A2 LOCK 视觉)
depends_on: [D-P0-01 LOCKED ✓, D-P0-02 IN REVIEW]
blocks: [D-P0-06 Launch Checklist, E-P0-10 Monitoring/Error/Performance 基线]
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/07-设计师设计参考/release-v1/system-states/loading-error-empty-v1.md
workspace_canonical_path: /Users/lwy/Documents/ChatGPT/看见地球/release-v1/system-states/loading-error-empty-v1.md
note: 本文件已就绪，需 PM Agent 由 Obsidian 写入权限落地到 canonical 路径。
---

# SEE EARTH V1 · Loading / Error / Empty 横切规范 · 全站统一

> **作者**：Designer Agent #4（外部 Owner = 您）
> **目标读者**：PM Agent / Web 工程师 / iOS 工程师（first-pass）/ E-P0-09 Contract Owner / E-P0-10 Monitoring Owner / QA
> **目的**：为 **Loading / Error / Empty / Permission / Privacy** 5 类横切状态建立**全站统一规范**，使任何 P0 流程**不存在仅靠工程师临时决定**的状态。
> **强制原则**（来自 Brief §4 D-P0-04 + Task Card DO NOT）：
> 1. **Loading 不用 spinner** — 用 hairline border + 极淡冷白填充；或文字一行
> 2. **Error 不暴露内部错误码或堆栈** — 错误分类标签清晰，但只对前端日志可见
> 3. **Empty 不写"暂无数据"** — 解释"为什么空"并给引导动作
> 4. **Permission 不把拒绝设计为惩罚** — 任何拒绝都有安全替代路径
> 5. **Privacy 不暗示绝对匿名** — 公开预览只显示城市级

---

## 0. 阅读指南

- **§1 Loading 横切规范**（4 类场景 + 视觉规范 + 三档响应式）
- **§2 Error 横切规范**（5 错误分类 + 文案模板 + 重试策略 + 错误 ID 规范）
- **§3 Empty 横切规范**（5 场景模板 + 引导动作 + 与 LOCKED State E 一致）
- **§4 Permission 横切规范**（与 D-P0-02 §1 一致）
- **§5 Privacy 横切规范**（与 D-P0-02 §5 + consent-placement-v1 一致）
- **§6 三档响应式规则**（Loading / Error / Empty 在 Desktop / Tablet / Mobile 的差异）
- **§7 全站禁用项（DO NOT）**
- **§8 自验收 checklist**

---

## §1 Loading 横切规范

### 1.1 Loading 触发阈值（全站统一）

| 操作类型 | 阈值 | Loading 显示 | 示例场景 |
|---|---|---|---|
| **首屏数据加载** | > 200ms | 显示骨架屏（hairline border + 极淡冷白填充）| Homepage edition API / CityPage city API / Witness submission API |
| **图片懒加载** | > 100ms | 显示 16:9 占位（hairline + 极淡冷白）| Daily 12 tile / Moment Detail / Same Second cell |
| **长操作** | > 2s | 显示进度条 + 进度数字 + 缩略图 | Witness 上传 / Reveal 阶段 / 提交 |
| **短操作** | < 200ms | **不显示 Loading**（直接显示结果，避免闪烁）| Echo submit / Refresh / Toggle / City switch |
| **后台中断恢复** | 任意 | 显示"已恢复上传"一行提示 | Witness 上传中断后回前台 |

> **核心规则**：**短操作 < 200ms 绝不显示 Loading**（任务卡 §B）。这是工程师最常犯的错误——为求保险而 spinner，结果导致操作完成时 spinner 闪一下消失，反而比无 Loading 更糟糕。

### 1.2 Loading 视觉规范（全站统一）

#### 1.2.1 骨架屏（Skeleton）

```css
/* A2 LOCK 视觉 */
.skeleton {
  background: var(--bg-hero-mist);  /* 极淡冷白 #F4F7FA 1% mix */
  border: 1px solid var(--border-hairline);  /* 1px hairline */
  border-radius: var(--r-1);  /* 2px 小圆角（LOCKED 0 大圆角规则）*/
  box-shadow: var(--shadow-1);  /* none */
  /* 不显示 spinner / 不显示进度条 / 不显示 shimmer 动画 */
}
```

| 属性 | 值 | 来源 |
|---|---|---|
| **底色** | `var(--bg-hero-mist)` | A2 LOCK token |
| **边框** | `1px solid var(--border-hairline)` | A2 LOCK token |
| **圆角** | `var(--r-1)` 2px | LOCKED 0 大圆角 |
| **阴影** | `var(--shadow-1)` none | LOCKED 0 阴影 |
| **动画** | **不显示 shimmer / 不显示 spinner / 不显示进度条** | A2 编辑感 |

> **DO NOT**：
> - ❌ 不显示 spinner（旋转圆圈 / 脉冲圆点 / 进度环）
> - ❌ 不显示 shimmer 动画（左→右滑动渐变）
> - ❌ 不显示进度条（仅文字"加载中"一行）
> - ❌ 不显示百分比数字
> - ❌ 不显示动画（与 A2 编辑感不符）

#### 1.2.2 加载文字规范

| 场景 | zh-CN | English |
|---|---|---|
| **通用加载** | 此刻，正在加载 | Loading now |
| **首屏加载** | 此刻，正在加载 | Loading this page |
| **城市加载** | 加载 [城市名]... | Loading [city name]... |
| **Daily 12 加载** | 此刻，正在加载今天的 12 个远方 | Loading today's 12 places |
| **Moment 加载** | 加载这一刻... | Loading this moment |
| **Witness 上传** | 上传中 [N]% | Uploading [N]% |
| **Witness EXIF 解析** | 读取照片信息... | Reading photo info... |
| **Witness 城市解析** | 正在解析城市... | Detecting city... |
| **Reveal 阶段** | 正在揭示... | Revealing... |
| **Echo 提交** | 提交中... | Submitting... |
| **后台中断恢复** | 已恢复上传 | Upload resumed |

> **文字位置**：底部居中一行（与 `responsive-rules-v1.md §3.4` 一致）；字号 = 12px / 11px Meta；颜色 = `var(--text-tertiary)`。
> **强制规则**：**首屏 Loading 不阻塞交互**（除主图外）—— Hero / Live Events / Spotlight 等板块可独立渲染。

#### 1.2.3 进度条（仅 Witness 上传使用）

```css
/* Witness 上传进度条 · 移动端 ≥ 4px 高度 */
.uploadProgress {
  width: 100%;
  height: 4px;  /* 移动端 ≥ 4px · per responsive-rules-v1.md §3.4 */
  background: var(--bg-hero-mist);
  border-radius: var(--r-1);
  overflow: hidden;
}

.uploadProgressFill {
  height: 100%;
  background: var(--earth-blue);
  transition: width 220ms var(--ease-out);  /* A2 motion token */
}

.uploadProgressFill[data-network="slow"] {
  background: var(--layer-yellow);  /* 弱网变 Layer Yellow */
}
```

| 属性 | 值 | 备注 |
|---|---|---|
| **高度** | 桌面 4px / 移动 4-6px | `responsive-rules-v1.md §3.4` 要求 ≥ 4px |
| **填充色** | `var(--earth-blue)` 主蓝 | 正常进度 |
| **弱网填充色** | `var(--layer-yellow)` Layer Yellow | 弱网时变 Layer Yellow（与 D-P0-02 §3.1 一致）|
| **进度数字** | "上传中 [N]%" | 不显示精确字节数 |
| **动画** | `transition: width 220ms ease-out` | A2 motion token |

### 1.3 Loading 三档响应式

| 档位 | 行为 | 备注 |
|---|---|---|
| **Desktop ≥ 1280px** | 骨架屏占位 + 文字底部居中 | 与 LOCKED 布局一致 |
| **Tablet 768-1279px** | 同 Desktop（保留全要素）| 仅缩小尺寸 |
| **Mobile < 768px** | 骨架屏占位 + 文字底部居中（字号 ≥ 16px）+ 进度条高度 ≥ 4px | `responsive-rules-v1.md §5.3` 移动正文 ≥ 16px |

---

## §2 Error 横切规范

### 2.1 Error 分类标签（5 类 · 与 E-P0-09 contract 对齐）

| error_category | 含义 | 重试性 | 出现对象 |
|---|---|---|---|
| **`network`** | navigator.onLine=false / fetch TypeError / DNS 失败 | true | 全站 |
| **`server`** | 服务端 5xx / 4xx 业务错误 | true / false | 全站 |
| **`permission`** | 权限被拒绝 / 受限 / 系统级 | N/A | Witness（详见 D-P0-02）|
| **`validation`** | 客户端 / 服务端 4xx 验证错误 | false | Witness / Echo |
| **`data`** | 字段缺失 / 类型错误 / schema 不匹配 / 图片加载失败 | true（重试 / false（数据问题）| Moment / City / Unknown / Daily 12 |

> **完整 20 项 error_category 枚举**：见 `state-matrix-v1.md §9`。

### 2.2 Error 文案统一模板

> **核心规则**：**不暴露内部错误码或堆栈给最终用户**。错误分类标签仅前端日志 + Analytics 埋点可见；UI 仅显示用户友好文案 + 错误 ID（hash 短码）。

#### 2.2.1 通用 Error 模板（zh-CN）

```text
[发生了什么，简短描述]

[错误 ID: abc123（供反馈时引用）]

[主 CTA]  [次 CTA]  [反馈入口]
```

#### 2.2.2 Error 文案（中英双语）

| 场景 | zh-CN | English | 主 CTA | 次 CTA | 反馈 |
|---|---|---|---|---|---|
| **通用网络错误** | 远方暂时连不上 | Can't reach the distant places for now | 重试 / Retry | 返回首页 / Back to home | 反馈 / Feedback |
| **网络断开** | 网络已断开；请检查连接后重试 | Network lost; please check connection and retry | 重试 / Retry | 取消 / Cancel | — |
| **上传超时** | 上传超时；请重试 | Upload timeout; please retry | 重试 / Retry | 取消上传 / Cancel | — |
| **服务端 5xx** | 服务暂时不可用；我们正在修复 | Service temporarily unavailable; we're working on it | 重试 / Retry | 返回首页 / Back to home | 反馈 / Feedback |
| **服务端限流** | 请求太频繁；请 [N] 分钟后再试 | Too many requests; please try again in [N] minutes | 知道了 / Got it | — | — |
| **客户端校验失败** | 提交内容有误：[具体原因] | Submission invalid: [specific reason] | 返回修改 / Edit | — | — |
| **图片加载失败** | 此刻暂未到达 | This moment hasn't arrived | 重试 / Retry | — | 反馈 / Feedback |
| **Moment 撤下** | 这一张已被作者或编辑撤下 | This moment has been withdrawn | — | — | 反馈 / Feedback |
| **City 不可用** | 这一座暂时不显示内容 | This city isn't showing content right now | 返回首页 / Back to home | 看其他城市 / Other cities | 反馈 / Feedback |
| **Unknown 题目耗尽** | 今天的观察已经结束 · 明天见 | Today's observation is over · see you tomorrow | 返回首页 / Back to home | 看 Daily 12 / See Daily 12 | — |
| **Echo 服务不可用** | Echo 暂未开放 | Echo isn't open yet | — | — | 反馈 / Feedback |
| **权限受限** | 你的设备权限受限，无法访问 [功能] | Your device permissions are restricted. [Feature] is unavailable | 去系统设置 / Open system settings | 取消并返回 / Cancel and return | — |
| **页面错误** | 页面出错了 | Something went wrong | 刷新页面 / Refresh | 返回首页 / Back to home | 反馈 / Feedback |

> **错误 ID 显示**：底部小字 11px / `var(--text-tertiary)`；可点击复制（V1 P2）；不可点击时仅显示。
> **错误 ID 格式**：`short_id = 8 字符 base36 hash`（如 `abc12345`），与 E-P0-10 监控 ID 体系一致。

### 2.3 Error 视觉规范

```css
/* A2 LOCK 视觉 */
.errorContainer {
  padding: var(--s-13);  /* 96px */
  background: var(--bg-page);  /* 冷白 */
  border: 1px solid var(--border-hairline);  /* 1px hairline */
  border-radius: var(--r-1);  /* 2px */
  text-align: center;
}

.errorTitle {
  font-family: var(--font-display);  /* Display Serif */
  font-size: clamp(24px, 2vw + 1rem, 32px);
  color: var(--text-primary);
}

.errorMessage {
  font-family: var(--font-sans);
  font-size: 16px;
  line-height: 1.7;
  color: var(--text-secondary);
  margin-top: var(--s-3);  /* 12px */
}

.errorId {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-tertiary);
  margin-top: var(--s-2);  /* 8px */
}

.errorActions {
  display: flex;
  gap: var(--s-3);  /* 12px */
  justify-content: center;
  margin-top: var(--s-5);  /* 24px */
}
```

| 属性 | 值 | 来源 |
|---|---|---|
| **容器底色** | `var(--bg-page)` 冷白 | A2 LOCK |
| **容器边框** | `1px solid var(--border-hairline)` | A2 LOCK |
| **容器圆角** | `var(--r-1)` 2px | LOCKED 0 大圆角 |
| **标题字体** | `var(--font-display)` Display Serif | A2 LOCK |
| **副标字体** | `var(--font-sans)` | A2 LOCK |
| **错误 ID 字体** | `var(--font-mono)` Mono | A2 LOCK |
| **CTA 排布** | 横向并排（桌面）/ 上下堆叠（移动）| `responsive-rules-v1.md §5` |
| **CTA 间距** | 12px gap | A2 LOCK |

> **DO NOT**：
> - ❌ 不暴露 5xx / 4xx / SQL / stack 给最终用户
> - ❌ 不使用 Layer Red 作为 Error 主色（与 A2 编辑感不符）
> - ❌ 不显示 toast（toast 太轻，无法承载错误信息）
> - ❌ 不弹原生 alert
> - ❌ 不显示"未知错误"作为兜底（必须有具体分类）

### 2.4 Error 重试策略

| error_category | 重试次数上限 | 重试间隔 | 自动 / 手动 |
|---|---:|---|---|
| `network` | 2 自动 + 1 手动 = 3 | 1s / 3s / 手动 | 自动 + 手动 |
| `server_5xx` | 2 自动 + 1 手动 = 3 | 1s / 3s / 手动 | 自动 + 手动 |
| `server_4xx_rate_limited` | 倒计时后 1 次 | N 分钟（服务端指定）| 倒计时 + 手动 |
| `validation` | 0（前端拦截）| — | 手动返回修改 |
| `media_load` | 1 自动 + 1 手动 = 2 | 500ms / 手动 | 自动 + 手动 |
| `data_integrity` | 0（前端兜底）| — | 手动反馈 |
| `client_render` | 0（前端代码异常）| — | 手动刷新 |

> **重试耗尽**：显示"重试已达上限；返回首页"（与 D-P0-02 §3.5 retry_exhausted 一致）。
> **不无限重试**：最多 2 自动 + 1 手动 = 3 次。

### 2.5 Error 三档响应式

| 档位 | 行为 |
|---|---|
| **Desktop ≥ 1280px** | 居中卡片（max-width 480px）+ 横向 CTA |
| **Tablet 768-1279px** | 居中卡片（max-width 480px）+ 横向 CTA |
| **Mobile < 768px** | 全宽卡片（page-padding 20px）+ 上下堆叠 CTA（"主 CTA 在上 / 次 CTA 在下 / 反馈链接在最下"） |

---

## §3 Empty 横切规范

### 3.1 Empty 5 场景模板

| 场景 | 触发 | 视觉稿 | 引导动作 |
|---|---|---|---|
| **Daily 12 Empty** | edition slots 全空 | 12 个 tile 位置 70% 空白 + 1 行诗意 + CTA | "留下一个 Moment →" / "Leave a Moment →" |
| **Moment Empty** | Daily 12 slot 缺失 | 缺失位置灰色 hairline + "今日来自 [城市名] 的内容尚未发布" | 用户继续浏览其他 slot |
| **City Empty** | City 无 Moment（State E LOCKED）| 70% 空白 + 1 行诗意 + CTA | "成为第一个让这里被看见的人" / "Be the first" |
| **Unknown Empty** | Unknown clue 耗尽 | full-bleed 灰底 + "今天的观察已经结束 · 明天见" | "看 Daily 12" / "See Daily 12" |
| **Witness Empty** | 草稿过期 / 主动撤回 | 卡片 + "已撤回" / "提交已过期" | "重新提交" / "重新开始" |

### 3.2 Empty 文案统一模板

> **核心规则**：**不写"暂无数据"**（任务卡 §B + DO NOT）。

#### 3.2.1 模板（zh-CN）

```text
[为什么空 · 1 行诗意短句]
[为什么 · 解释 1 行]

[引导 CTA · 1 个]
```

#### 3.2.2 Empty 文案（中英双语）

| 场景 | zh-CN | English |
|---|---|---|
| **Daily 12 全空** | 今天还没有来自这里的内容 · 也许明天 | No content from here today · maybe tomorrow |
| **Daily 12 slot 缺失** | 今日来自 [城市名] 的内容尚未发布 | Today's content from [city] hasn't been published yet |
| **City 无 Moment** | 这座城市今天还没有切片 · 你可以是第一个 | No slice from this city today · you could be the first |
| **Unknown 题目耗尽** | 今天的观察已经结束 · 明天见 | Today's observation is over · see you tomorrow |
| **Witness 草稿过期** | 提交已过期 · 请重新提交 | Submission expired · please submit again |
| **Witness 主动撤回** | 已撤回 | Withdrawn |

> **诗意原则**：与 A2 编辑感一致；不写"暂无数据"等机械文案。

### 3.3 Empty 视觉规范（与 LOCKED State E 一致）

```css
/* CityPage State E Empty LOCKED 70% 空白规则 */
.emptyState {
  padding: var(--s-13);  /* 96px */
  background: var(--bg-page);  /* 冷白 */
  text-align: center;
  min-height: 70%;  /* LOCKED 70% 空白（per design-freeze-log-v1.md §5.5）*/
}

.emptyStatePoetic {
  font-family: var(--font-editorial);  /* Editorial Serif */
  font-style: italic;
  font-size: clamp(20px, 1.5vw + 0.5rem, 24px);
  line-height: 1.6;
  color: var(--text-secondary);
  max-width: 480px;
  margin: 0 auto;
}

.emptyStateCta {
  margin-top: var(--s-7);  /* 48px */
  /* CTA 视觉 = Earth Blue 1px underline + 0 大圆角 + 0 阴影 */
}
```

| 属性 | 值 | 来源 |
|---|---|---|
| **容器底色** | `var(--bg-page)` 冷白 | A2 LOCK |
| **容器高度** | min-height: 70% | LOCKED State E 70% 空白 |
| **诗意字体** | `var(--font-editorial)` Editorial Serif italic | A2 LOCK |
| **诗意字号** | `clamp(20px, 1.5vw + 0.5rem, 24px)` | `responsive-rules-v1.md §2.1` |
| **诗意颜色** | `var(--text-secondary)` | A2 LOCK |
| **诗意 max-width** | 480px | 可读性 |
| **CTA** | Earth Blue 1px underline | A2 LOCK |
| **阴影** | none | LOCKED 0 阴影 |
| **圆角** | none（0 大圆角）| LOCKED |

> **强制规则**：**Empty City 不诱导继续刷**（per `design-freeze-log-v1.md §5.5`）。CTA 是引导动作，不是刷新按钮。

### 3.4 Empty 三档响应式

| 档位 | 行为 |
|---|---|
| **Desktop ≥ 1280px** | 居中卡片（max-width 480px）+ CTA 在诗意下方 |
| **Tablet 768-1279px** | 居中卡片（max-width 480px）+ CTA 在诗意下方 |
| **Mobile < 768px** | 全宽（page-padding 20px）+ CTA 字号 ≥ 16px |

---

## §4 Permission 横切规范（与 D-P0-02 §1 一致）

### 4.1 Permission 状态分类

| 状态 | 含义 | UI 表现 | 替代路径 |
|---|---|---|---|
| **`not_determined`** | 用户从未被询问 | 显示功能按钮（不预先禁用）| 系统弹窗待触发 |
| **`granted`** | 用户允许 | 正常功能 UI | — |
| **`denied`** | 用户拒绝（一次）| C-06 Banner + 安全替代路径 | 替代功能可用 |
| **`restricted`** | iOS MDM / 家长控制 | 同 denied + "去系统设置"链接 | 去系统设置 + 替代功能 |
| **`denied_permanent`** | 用户在系统设置中"不再询问" | 同 restricted（不再弹窗）| 去系统设置 + 替代功能 |

### 4.2 Permission 视觉规范（C-06 Banner）

```css
/* D-P0-02 §1.3 C-06 Banner */
.permissionBanner {
  padding: var(--s-4) var(--s-5);  /* 16px / 24px */
  background: var(--bg-hero-mist);  /* 极淡冷白 */
  border: 1px solid var(--border-hairline);
  border-radius: var(--r-1);  /* 2px */
  display: flex;
  gap: var(--s-3);  /* 12px */
  align-items: center;
}

.permissionBannerText {
  font-family: var(--font-sans);
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-primary);
  flex: 1;
}

.permissionBannerActions {
  display: flex;
  gap: var(--s-3);
}
```

| 属性 | 值 | 来源 |
|---|---|---|
| **底色** | `var(--bg-hero-mist)` 极淡冷白 | A2 LOCK |
| **边框** | `1px solid var(--border-hairline)` | A2 LOCK |
| **圆角** | `var(--r-1)` 2px | LOCKED 0 大圆角 |
| **字号** | 14px | 与 A2 一致 |
| **行高** | 1.6 | 与 A2 一致 |

### 4.3 Permission 文案（C-06 Banner · 中英双语）

| 权限 | 拒绝 zh-CN | 拒绝 English | 替代 CTA |
|---|---|---|---|
| **相机** | 你拒绝了相机权限。SEE EARTH 仍然支持从相册选择照片。 | You declined camera access. SEE EARTH still supports picking from your photo library. | 从相册选 / Pick from library |
| **相册** | 你拒绝了相册权限。SEE EARTH 仍然支持即时拍照。 | You declined photo library access. SEE EARTH still supports taking a photo now. | 拍一张 / Take a photo |
| **位置** | 你拒绝了位置权限。SEE EARTH 仍然支持手动选择城市。 | You declined location access. SEE EARTH still supports choosing a city manually. | 手动选择城市 / Choose city manually |
| **位置（受限）** | 你的设备权限受限，无法访问位置。如需继续，请前往系统设置调整权限后重试。 | Your device permissions are restricted. Location access is unavailable. To continue, please adjust permissions in your system settings and try again. | 去系统设置 / Open system settings · 手动选择城市 |
| **通用受限** | 你的设备权限受限，无法访问 [功能]。如需继续，请前往系统设置调整权限后重试。 | Your device permissions are restricted. [Feature] is unavailable. To continue, please adjust permissions in your system settings and try again. | 去系统设置 / Open system settings · 取消并返回 / Cancel and return |

### 4.4 Permission 三档响应式

| 档位 | 行为 |
|---|---|
| **Desktop ≥ 1280px** | Banner 顶部显示（page 内 24px 间距）+ 横向 CTA |
| **Tablet 768-1279px** | Banner 顶部显示 + 横向 CTA |
| **Mobile < 768px** | Banner 顶部显示 + 上下堆叠 CTA（主 CTA "替代功能" 在上 / 次 CTA "取消并返回" 在下）|

---

## §5 Privacy 横切规范（与 D-P0-02 §5 + consent-placement-v1 一致）

### 5.1 Privacy 边界可视化（公开预览 vs 后台精确位置）

> **核心规则**（来自 Task Card §B + D-P0-02 §5.3）：**公开预览与精确位置的边界可视化**；**用户能看见"这条将被公开的内容"才能提交**。

#### 5.1.1 边界可视化规范

```text
┌────────────────────────────────────────────────┐
│ 公开预览（用户提交后可见）                       │
│                                                │
│ ✓ 城市名                                       │
│ ✓ 拍摄时间（精确到分钟）                        │
│ ✓ 你选择的一句话（可选）                        │
│ ✓ 照片（缩略图）                                │
│                                                │
│ ─────────────────────────────────              │
│                                                │
│ 不会公开：                                      │
│ ✗ 你的精确 GPS                                  │
│ ✗ 你的姓名 / 联系方式                            │
│ ✗ 原始照片元数据                                │
│                                                │
│ ─────────────────────────────────              │
│                                                │
│ 后台（仅审核用）                                 │
│ • 精确位置（仅审核与风险控制用）                  │
│ • EXIF 设备信息                                  │
│                                                │
│ [ 查看完整 Privacy ]                            │
└────────────────────────────────────────────────┘
```

#### 5.1.2 Privacy 文案（C-05 公开预览 · 中英双语）

| 元素 | zh-CN | English |
|---|---|---|
| **公开预览标题** | 公开预览 | Public preview |
| **公开项 ✓ 城市** | 城市：[用户选定的城市] | City: [user-selected city] |
| **公开项 ✓ 时间** | 拍摄时间：[captured_at，精确到分钟] | Captured time: [captured_at, to the minute] |
| **公开项 ✓ 描述** | 一句话：[用户输入的描述，可选] | One-line note: [user's description, optional] |
| **公开项 ✓ 照片** | 照片：[照片缩略图] | Photo: [photo thumbnail] |
| **不会公开标题** | 不会公开： | What will NOT be public: |
| **不会公开项 ✗ GPS** | 你的精确 GPS | Your precise GPS |
| **不会公开项 ✗ 姓名** | 你的姓名 / 联系方式 | Your name / contact info |
| **不会公开项 ✗ EXIF** | 原始照片元数据 | Original photo metadata |
| **后台说明标题** | 我们如何处理你的位置 | How we handle your location |
| **后台说明公开** | 公开：仅显示城市名 | Public: only the city name |
| **后台说明后台** | 后台：精确位置用于验证拍摄城市，不会公开 | Backend: precise location is used to verify the city of capture; it will not be public |
| **后台说明撤回** | 撤回：可联系 [反馈入口] 申请删除 | Removal: contact [feedback] to request deletion |
| **链接** | 查看完整 Privacy | View full Privacy Policy |

> **DO NOT**：
> - ❌ 不暗示"绝对匿名"（用"用于验证" / "不会公开"等具体动作描述）
> - ❌ 不展示精确 GPS 数字 / EXIF 设备信息 / 第三方 ID
> - ❌ 不省略预览（任务卡 AC："用户在最终提交前能看见将被公开的内容"）
> - ❌ 不暗示提交后立即公开（必须经过审核）

### 5.2 Privacy 视觉规范（公开预览卡片）

```css
/* Witness 段 5 公开预览 · D-P0-02 §6.1 */
.publicPreview {
  padding: var(--s-7);  /* 48px */
  background: var(--bg-page);  /* 冷白 */
  border: 1px solid var(--border-hairline);
  border-radius: var(--r-1);  /* 2px */
}

.publicPreviewDivider {
  border-top: 1px solid var(--border-hairline);
  margin: var(--s-5) 0;  /* 24px */
}

.publicPreviewItem {
  font-family: var(--font-sans);
  font-size: 16px;
  line-height: 1.7;
  color: var(--text-primary);
}

.publicPreviewItemPositive::before {
  content: '✓ ';
  color: var(--earth-blue);
  margin-right: var(--s-2);  /* 8px */
}

.publicPreviewItemNegative::before {
  content: '✗ ';
  color: var(--text-tertiary);
  margin-right: var(--s-2);
}
```

| 属性 | 值 | 来源 |
|---|---|---|
| **底色** | `var(--bg-page)` 冷白 | A2 LOCK |
| **边框** | `1px solid var(--border-hairline)` | A2 LOCK |
| **圆角** | `var(--r-1)` 2px | LOCKED 0 大圆角 |
| **✓ 颜色** | `var(--earth-blue)` 主蓝 | A2 LOCK |
| **✗ 颜色** | `var(--text-tertiary)` 冷灰 | A2 LOCK |
| **字号** | 16px | `responsive-rules-v1.md §5.3` 移动正文 ≥ 16px |

### 5.3 Privacy 三档响应式

| 档位 | 行为 |
|---|---|
| **Desktop ≥ 1280px** | 公开预览卡片 max-width 640px 居中 |
| **Tablet 768-1279px** | 公开预览卡片 max-width 640px 居中 |
| **Mobile < 768px** | 全宽（page-padding 20px）+ 字号 ≥ 16px |

---

## §6 三档响应式规则总表

| 状态 | Desktop ≥ 1280px | Tablet 768-1279px | Mobile < 768px |
|---|---|---|---|
| **Loading 骨架屏** | 占位 + 文字底部居中 | 占位 + 文字底部居中 | 占位 + 文字底部居中（字号 ≥ 16px）|
| **Loading 进度条** | 4px 高度 | 4px 高度 | 4-6px 高度 |
| **Error 卡片** | max-width 480px 居中 + 横向 CTA | max-width 480px 居中 + 横向 CTA | 全宽 + 上下堆叠 CTA |
| **Error 文字** | 副标 16-17px / 错误 ID 11px | 副标 16-17px / 错误 ID 11px | 副标 16px / 错误 ID 11px |
| **Empty 诗意短句** | max-width 480px 居中 / 24px | max-width 480px 居中 / 24px | 全宽 / 20px |
| **Empty CTA** | 诗意下方 48px 间距 | 诗意下方 48px 间距 | 诗意下方 32px 间距 |
| **Permission Banner** | 顶部横向 CTA | 顶部横向 CTA | 顶部上下堆叠 CTA |
| **Privacy 公开预览** | max-width 640px 居中 | max-width 640px 居中 | 全宽（page-padding 20px）|

> **统一原则**：所有状态卡片在三档下保持视觉一致性（0 大圆角 / 0 阴影 / hairline border），仅尺寸与排布差异。

---

## §7 全站禁用项（DO NOT）

### 7.1 Loading 禁用项

- ❌ 不显示 spinner（旋转圆圈 / 脉冲圆点 / 进度环）
- ❌ 不显示 shimmer 动画（左→右滑动渐变）
- ❌ 不显示进度条（除 Witness 上传）
- ❌ 不显示百分比数字（除 Witness 上传）
- ❌ 不显示 loading.gif / loading.svg
- ❌ 不显示动画（与 A2 编辑感不符）

### 7.2 Error 禁用项

- ❌ 不暴露 5xx / 4xx 字面量（如"503 Service Unavailable"）
- ❌ 不暴露 SQL / stack trace / 数据库错误信息
- ❌ 不暴露 IP / session_id / cookie
- ❌ 不使用 Layer Red 作为 Error 主色（与 A2 编辑感不符）
- ❌ 不显示 toast（toast 太轻，无法承载错误信息）
- ❌ 不弹原生 alert
- ❌ 不显示"未知错误"作为兜底（必须有具体分类）
- ❌ 不无限重试（最多 2 自动 + 1 手动 = 3 次）

### 7.3 Empty 禁用项

- ❌ 不写"暂无数据"
- ❌ 不写"No data"
- ❌ 不写"N/A"
- ❌ 不写"数据加载失败"（这是 Error，不是 Empty）
- ❌ 不诱导"刷新"（Empty City 不诱导刷，per `design-freeze-log-v1.md §5.5`）
- ❌ 不显示机械图标（如 sad face / empty box）

### 7.4 Permission 禁用项

- ❌ 不显示"必须开启权限才能继续"
- ❌ 不显示"无法继续"
- ❌ 不显示"权限被拒绝"作为标题（用"你拒绝了相机权限"等中性描述）
- ❌ 不在 Banner 内隐藏"取消并返回"按钮
- ❌ 不显示具体技术原因（如 iOS ATT 政策 / iOS MDM 策略细节）
- ❌ 不重复弹窗（系统已不弹则不弹）

### 7.5 Privacy 禁用项

- ❌ 不暗示"绝对匿名"
- ❌ 不展示精确 GPS 数字 / EXIF 设备信息 / 第三方 ID
- ❌ 不省略预览（任务卡 AC："用户在最终提交前能看见将被公开的内容"）
- ❌ 不暗示提交后立即公开（必须经过审核）
- ❌ 不省略"撤回"路径
- ❌ 不省略"完整 Privacy Policy"链接

---

## §8 自验收 checklist

| # | 验收项 | 状态 | 证据 |
|---|---|---|---|
| 1 | Loading 触发阈值明确（< 200ms 不显示；> 2s 显示进度）| ✅ | §1.1 |
| 2 | Loading 不用 spinner / shimmer / 进度条（除 Witness）| ✅ | §1.2.1 + §7.1 |
| 3 | Error 文案明确 + 给可执行下一步 + 错误分类标签 | ✅ | §2.1 + §2.2 |
| 4 | Error 不暴露内部错误码或堆栈 | ✅ | §2.2 + §7.2 |
| 5 | Error 重试策略明确（最多 2 自动 + 1 手动）| ✅ | §2.4 |
| 6 | Empty 文案解释"为什么空" + 引导动作 | ✅ | §3.1 + §3.2 |
| 7 | Empty 不写"暂无数据" | ✅ | §3.2 + §7.3 |
| 8 | Empty City 不诱导继续刷 | ✅ | §3.3 引用 LOCKED State E |
| 9 | Permission 区分未请求 vs 已拒绝 + 已拒绝给去系统设置入口 | ✅ | §4.1 + §4.3 |
| 10 | Permission 不把拒绝设计为惩罚 | ✅ | §7.4 |
| 11 | Privacy 公开预览与精确位置边界可视化 | ✅ | §5.1.1 |
| 12 | Privacy 用户能看见"这条将被公开的内容"才能提交 | ✅ | §5.1.1 + §5.1.2 |
| 13 | Privacy 不暗示绝对匿名 | ✅ | §5.1.2 + §7.5 |
| 14 | 三档响应式（Loading / Error / Empty / Permission / Privacy 在 Desktop / Tablet / Mobile）| ✅ | §6 |
| 15 | A2 LOCK 视觉一致（0 大圆角 / 0 阴影 / hairline border / Earth Blue）| ✅ | §1.2.1 + §2.3 + §3.3 + §4.2 + §5.2 |

---

## §9 给后续任务的接口

### 9.1 给 E-P0-10（监控 / 错误 / 性能 / 隐私基线）

- ✅ §2.1 5 类 error_category = 监控分类的 source of truth
- ✅ §2.2 错误 ID 规范 = 与 E-P0-10 监控 ID 体系一致
- ✅ §2.4 重试策略 = 与 E-P0-10 告警分级一致

### 9.2 给 E-P0-09（API Contract）

- ✅ §2.1 `error_category` 5 类顶层 + `state-matrix-v1.md §9` 20 项完整枚举
- ✅ §2.4 `retryable` 布尔 + 重试上限
- ⚠️ E-P0-09 应基于本文件 + state-matrix 锁定 error_category 枚举

### 9.3 给 iOS first-pass（future）

- ✅ §1-§5 全站规范适用于 Web + iOS 共享
- ⚠️ iOS 需补充原生 UI 规范（如 iOS Sheet / iOS Toast / iOS 系统设置 deep link）

### 9.4 给 QA Owner

- ✅ §7 全站禁用项 = QA 检查清单
- ✅ §8 自验收 checklist = QA 验收依据
- ⚠️ QA 应基于本文件建立 Loading / Error / Empty / Permission / Privacy 5 套测试用例

---

**End of loading-error-empty-v1.md · D-P0-04 子产物 2/4**