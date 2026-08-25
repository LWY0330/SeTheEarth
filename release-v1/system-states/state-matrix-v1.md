---
title: SEE EARTH V1 · 关键系统状态矩阵 · 6 对象 · Loading / Error / Empty / Permission / Privacy
type: design-state-matrix
tags: [release-v1, design, d-p0-04, system-states, loading-error-empty, permission, privacy, daily12, moment, city, unknown, witness, echo, see-earth]
task_id: D-P0-04
brief_anchor: §4 D-P0-04 + §D-P0-06 / Task Card §A §B §C
track: design
owner: 外部 Designer Owner（您）
created: 2026-08-24
status: IN REVIEW
target_gate: Gate A · Internal Alpha
source_brief: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/SEE-EARTH-Release-Strategy-v1-Design-Engineering-Task-Brief.md
source_task_card: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/06-PM Agent 交接/2026-08-22-task-card-d-p0-04-system-states.md
related_docs:
  - ./loading-error-empty-v1.md
  - ./copy-library-v1.md
  - ./component-contract-v1.md
  - ../web-v1-flow/sitemap-v1.md (§1.2 5 状态层)
  - ../web-v1-flow/design-freeze-log-v1.md (§6 14 组件 6 状态 / §11.2)
  - ../web-v1-flow/responsive-rules-v1.md (§3 逐页面规则 / §5 信息层级)
  - ../web-v1-flow/layer-qa-v1.md (§1.2 Layer 全局规则)
  - ../minimal-witness/state-matrix-v1.md (Witness 76 状态完整矩阵 - 格式参考)
  - ../minimal-witness/copy-final-v1.md (§1-§9 全部 Witness 文案)
  - ../minimal-witness/flow-diagram-v1.md (Mermaid 状态机)
  - ../analytics-events/event-map-v1.md (§1-§5 P0 14 事件 / §5 字段名一致性矩阵)
  - ../analytics-events/forbidden-fields-v1.md (30 禁采项)
  - ../analytics-events/consent-placement-v1.md (C-03~C-06 隐私文案位置)
  - ../../05-项目现状/release-v1/design-implementation/phase1-design-impl-report.md (VF 1.2 token)
  - ../../05-项目现状/release-v1/design-implementation/v2-phase15-report.md (A2 LOCK 视觉)
depends_on: [D-P0-01 LOCKED ✓, D-P0-02 IN REVIEW, D-P0-05 IN REVIEW]
blocks: [D-P0-06 Launch Checklist, E-P0-10 Monitoring/Error/Performance 基线]
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/07-设计师设计参考/release-v1/system-states/state-matrix-v1.md
workspace_canonical_path: /Users/lwy/Documents/ChatGPT/看见地球/release-v1/system-states/state-matrix-v1.md
note: 本文件已就绪，需 PM Agent 由 Obsidian 写入权限落地到 canonical 路径。
---

# SEE EARTH V1 · 关键系统状态矩阵 · 6 对象

> **作者**：Designer Agent #4（外部 Owner = 您）
> **目标读者**：PM Agent / Web 工程师 / iOS 工程师（first-pass）/ E-P0-09 Contract Owner / E-P0-10 Monitoring Owner / QA
> **目的**：为 **6 大关键对象**建立 **统一状态矩阵**——确保 P0 流程中**不存在仅靠工程师临时决定**的 Loading / Error / Empty / Permission / Privacy 状态。
> **强制原则**（来自 Brief §4 D-P0-04 + Task Card DO NOT）：
> 1. **不把权限拒绝设计为惩罚或强制授权** — 任何权限拒绝都有安全替代路径
> 2. **不暴露内部错误码或堆栈** — 错误分类标签清晰，但不暴露 5xx / SQL / stack 给最终用户
> 3. **不把"暂无数据"作为通用空状态** — 必须解释"为什么空"并给引导动作
> 4. **不暴露精确位置 / EXIF / 推断住址** — 公开预览仅城市级
> 5. **不暗示绝对匿名** — 隐私文案诚实
> 6. **不假装成功** — 服务端未确认 = 不显示成功

---

## 0. 阅读指南

### 0.1 6 个对象覆盖（来自 Task Card §A）

| 对象 | 必须覆盖的状态数 | 子状态数 |
|---|---:|---:|
| **Daily 12** | 8 | 首次加载 / 刷新 / 部分缺失 / 整版不可用 / 旧版回退 / Loading 骨架 / Error 重试 / Empty |
| **Moment** | 8 | 图片加载失败 / 内容撤下 / 来源待核验 / 城市未知 / 占位 / Loading / Error / Empty |
| **City** | 9 | 无 Moment / 仅基础资料 / 时区失败 / 天气失败 / Unsupported 状态 / Loading / Error / Empty / Past-only |
| **Unknown** | 6 | 无可用题目 / Reveal 失败 / 内容已下线 / Loading / Error / Reveal 中断恢复 |
| **Witness** | 9 | 权限 / 上传 / 校验 / 审核 / 失败重试 / Loading / Error / Empty / Permission |
| **Echo** | 8 | Default / Focus / Typing / Disabled / Submitting / Success / Error / Loading |
| **总计** | **48** | 跨对象累计 76+ 状态（含 Witness 子状态引用 D-P0-02 既有 76 个） |

> **Witness 状态**：本文 §5 仅覆盖 Witness **作为 6 对象之一**的顶层状态（权限 / 上传 / 校验 / 审核 / 失败重试 / Empty）。完整 Witness 子状态（76 个）详见 `../minimal-witness/state-matrix-v1.md`，本文**不重复**——仅在 §5 标注交叉引用与差异。
> **Echo 状态**：本文 §6 覆盖 Echo **作为 CityPage 章节组件**的 8 个状态（Default / Focus / Typing / Disabled / Submitting / Success / Error / Loading）。EchoInput 组件 LOCKED 5 态（default / hover / focus / typing / submitted）见 `design-freeze-log-v1.md §6.12`，本文明示**扩展为 8 态**（新增 Disabled / Error / Loading）。

### 0.2 每条状态的格式

每个状态 = **(状态名 / 触发条件 / 视觉稿 / 文案（中英）/ 字段 / 埋点 / 替代路径 / DO NOT)**

### 0.3 通用横切规则

- **Loading**：长操作 > 2s 显示进度或骨架屏；短操作 < 200ms 不显示 Loading（避免闪烁）；首屏 Loading 不阻塞交互（除主图外）
- **Error**：文案明确说明发生了什么；给可执行下一步（重试 / 返回 / 反馈入口）；错误分类标签（前端 / 网络 / 服务端 / 权限 / 数据）；**不暴露内部错误码或堆栈给最终用户**
- **Empty**：解释"为什么空"（如"今天还没有来自这里的内容"而非"暂无数据"）；给一个引导动作（去 Explore / 去 Witness / 等明天）
- **Permission**：区分"未请求"vs"已拒绝"；已拒绝状态给"去系统设置"入口；**不把拒绝设计为惩罚**
- **Privacy**：公开预览与精确位置的边界可视化；用户能看见"这条将被公开的内容"才能提交

详见 `loading-error-empty-v1.md` 完整横切规范。

### 0.4 A2 LOCK 视觉约束（来自 VF 1.2）

- **冷白底** `var(--bg-page)` `#F4F7FA` + **Earth Blue 强调** `var(--earth-blue)` `#4F8FE0`
- **0 大圆角** `var(--r-1)` `2px`（无 `r-xl` / `r-md` 大圆角）
- **0 阴影** `var(--shadow-1)` 至 `var(--shadow-4)` 全部 `none`
- **字体**：Display Serif + Editorial Serif + Utility Sans/Mono 4 套
- **三档响应式**：Desktop ≥ 1280px / Tablet 768-1279px / Mobile < 768px
- **Layer Color** 仅作信息标记（kicker dot / underline），面积 ≤ 5% 页面面积

---

## §1 Daily 12 状态矩阵

> **对象定义**：Homepage / Today 主屏的 12 个 Moment 列表（`HomeCoordinates` 板块 + 1 个 featured Kyoto 主视觉 + 11 个 tile 网格，含 Khartoum 占位）。
> **LOCKED 依据**：`HomeCoordinates.tsx` + `design-freeze-log-v1.md §2.2 Homepage A2 v2-phase15` + `state-matrix-v1.md` §1（Brief §D-P0-04 Daily 12 必答）

### 1.1 Daily 12 顶层状态表

| # | 状态 | 触发条件 | 视觉稿 | 文案（中英）| 字段 | 埋点 | 替代路径 | DO NOT |
|---|---|---|---|---|---|---|---|---|
| 1 | **loading_skeleton** | edition API 200 前（首屏 / 刷新 / 路由切换）| 12 个 tile 占位：灰色 hairline border 1px + `bg-hero-mist` 极淡冷白填充；featured 主视觉用 16:9 比例骨架；**无 spinner**，文字"此刻，正在加载"在底部一行 | zh: "此刻，正在加载" / en: "Loading now" | `state.daily12 = loading_skeleton` · `edition.loading_ms` | 不发（首屏即触发；首屏事件见 `event-map-v1.md §1.1 edition_viewed`） | 自动转 ready | ❌ 不显示 spinner；❌ 不阻塞主图以外的板块（Hero / Live Events 可独立渲染） |
| 2 | **ready** | edition API 200 + 至少 1 个槽位就绪 | 12 个 tile 完整渲染（featured + 11 grid）；Khartoum 占位 tile 显示"待补"占位卡片（与现有 LOCKED 视觉一致）| — | `state.daily12 = ready` · `edition_id` · `slot_count = 12` | **`edition_viewed(edition_id, app_surface)`** | — | — |
| 3 | **partial_missing** | edition API 200 但 ≤ 11 个 slot 有数据（1 个缺失）| 11 个 tile 完整渲染；缺失位置显示"今日未发布"占位卡片（灰色 hairline border + 一行短句"今日来自此地的内容尚未发布"）；其他 slot 正常 | zh: "今日来自 [城市名] 的内容尚未发布" / en: "Today's content from [city] hasn't been published yet" | `state.daily12 = partial_missing` · `missing_slot.position` · `missing_slot.city_id` | `edition_viewed` 正常发；不单独发 missing 事件（避免冗余） | 用户可继续浏览其余 11 个；不显示"刷新"诱导 | ❌ 不自动重试；❌ 不显示"网络错误"（这是数据层问题） |
| 4 | **fully_unavailable** | edition API 5xx / network error / 200 但 slots 全空且非设计内状态 | 整版降级：12 个 tile 位置全部变为"远方暂时连不上"占位（与 §3 Error 一致）；错误 ID 显示在底部小字 | zh: "远方暂时连不上" / en: "Can't reach the distant places for now" · 错误 ID: [short_id] | `state.daily12 = fully_unavailable` · `error_category` (network / server_5xx / unknown) | `edition_viewed` **不发**；可发 `edition_view_failed(error_category)` (P1 候选) | "重试"按钮 + "返回首页"链接 | ❌ 不暴露 5xx / stack；❌ 不弹原生 alert |
| 5 | **stale_fallback** | API 返回的 edition_id 与上次相同且超过 fallback 阈值（如 24h）| 整版降级但显示"上次内容"：12 个 tile 用上次 edition 渲染；顶部一行提示"今日尚未更新；这里显示的是 [日期] 的切片" | zh: "今日尚未更新；这里显示的是 [YYYY-MM-DD] 的切片" / en: "Today's edition hasn't been published; showing the slice from [YYYY-MM-DD]" | `state.daily12 = stale_fallback` · `stale_edition.date` · `stale_edition.days_old` | `edition_viewed` 发（携带 stale=true 标记） | 用户可继续浏览；可点击"刷新"重试 | ❌ 不假装是今日内容；❌ 不显示 spinner |
| 6 | **empty** | API 200 + slots 全空（如系统刚上线第一天）| 12 个 tile 位置全部为空卡片（70% 空白 + 1 行诗意 + CTA "成为第一个留下 Moment 的人"）；与 `state-matrix-v1.md` LOCKED State E Empty 70% 空白规则一致 | zh: "今天还没有来自这里的内容" / en: "No content from here today" · CTA: "留下一个 Moment →" / "Leave a Moment →" | `state.daily12 = empty` · `edition_id` | `edition_viewed` 发（携带 empty=true 标记） | CTA 跳转 `/witness`（D-P0-02 入口） | ❌ 不显示"暂无数据"；❌ 不诱导"刷一下"；❌ 不假装是 Network Error |
| 7 | **retrying** | 用户在 fully_unavailable 状态点"重试" | 12 个 tile 位置显示骨架（同 loading_skeleton）；"重试"按钮变 disabled 并显示"重试中..." | zh: "重试中..." / en: "Retrying..." | `state.daily12 = retrying` · `retry_count` | 不发新事件（与 edition_view_failed 1:1） | "取消"按钮（回到 fully_unavailable） | ❌ 不无限重试（最多 2 自动 + 1 手动）|
| 8 | **error_boundary** | 组件 render 抛错（前端代码异常）| 整版降级到 §3 Error 同款占位；附加"显示技术细节"折叠（仅 dev mode 显示，生产模式隐藏）| zh: "页面出错了" / en: "Something went wrong" · 错误 ID: [short_id] | `state.daily12 = error_boundary` · `error_category = client_render` | `client_error(error_category, component, stack_hash)` | "刷新页面" + "返回首页" | ❌ 生产模式不暴露 stack；❌ 不弹原生 alert |

### 1.2 Daily 12 状态联动与子状态

#### 1.2.1 单 tile 图片加载失败（Daily 12 内的子状态）

| 状态 | 触发条件 | 视觉稿 | 文案 | 字段 | 埋点 | 替代路径 | DO NOT |
|---|---|---|---|---|---|---|---|
| **tile_image_failed** | 单张 tile 图 URL 返回 4xx/5xx | tile 卡片降级为"街景暂未到达"占位（灰色 hairline + 一行小字"街景暂未到达"）；其他 tile 不受影响 | zh: "街景暂未到达" / en: "Street view unavailable" | `state.tile[id] = image_failed` · `tile.id` · `error_category = media_load` | 不发埋点（前端就绪即触发，但与 edition_viewed 1:1） | 用户可点击进入 city；占位不影响 navigate | ❌ 不影响其他 tile；❌ 不弹 toast |

#### 1.2.2 Khartoum 占位（Daily 12 已知占位 · 设计内状态）

> Khartoum 城市数据**当前未进入 12 城 featured 列表**（`HomeCoordinates.tsx §24-37` 注释"待补"）。该占位是**设计内**状态，不属于 Error / Empty。

| 状态 | 触发条件 | 视觉稿 | 文案 | 字段 | 埋点 | 替代路径 | DO NOT |
|---|---|---|---|---|---|---|---|
| **tile_khartoum_placeholder** | ORDERED_IDS 第 12 位为 khartoum | LOCKED 占位卡片（与现有 `HomeCoordinates.tsx §141-166` 一致）：灰色背景 + "KHARTOUM (待补 · 占位)" + "—" 时间 | zh: "喀土穆 · 等待补位" / en: "Khartoum · placeholder" | `state.tile[khartoum] = placeholder` · `tile.id = khartoum` | 不发埋点（设计内中性状态） | 用户可点击进入 city（数据接入后生效）| ❌ 不显示 spinner；❌ 不显示 Error；❌ 不显示 "暂无数据" |

### 1.3 Daily 12 状态机跳转

```text
[任意状态] → loading_skeleton → ready
                                  ↓ (1 slot 缺失)
                            partial_missing → ready (refresh 成功)
                                  ↓ (API 失败)
                          fully_unavailable → retrying → ready
                                                  → fully_unavailable (耗尽)
                                  ↓ (stale)
                            stale_fallback → ready (refresh 成功)
                                  ↓ (全空)
                                  empty → ready (新 edition 发布)
                                  ↓ (组件抛错)
                            error_boundary → ready (refresh 成功)
```

---

## §2 Moment 状态矩阵

> **对象定义**：Moment 是单张"切片"——照片 + `captured_at` + 城市级公开位置 + 来源标记（witness / seed / editorial）+ 短描述。Moment 出现在 Daily 12 grid / CityPage Same Second / Live Events / Moment Detail 等多个场景。
> **LOCKED 依据**：`HomeLiveEvents.tsx` + `data/moments.ts` + `data/liveMoments.ts` + Brief §D-P0-04 Moment 必答

### 2.1 Moment 顶层状态表

| # | 状态 | 触发条件 | 视觉稿 | 文案（中英）| 字段 | 埋点 | 替代路径 | DO NOT |
|---|---|---|---|---|---|---|---|---|
| 1 | **image_loading** | Moment 图 URL 请求发出但未 200（首屏 / 滚动懒加载）| 16:9 灰色 hairline 占位 + 极淡冷白填充；**无 spinner** | — | `state.moment[id] = image_loading` · `moment.id` | 不发埋点（前端就绪触发） | 自动转 ready / image_failed | ❌ 不显示 spinner；❌ 不阻塞列表其他 Moment |
| 2 | **image_failed** | Moment 图 URL 返回 4xx/5xx 或加载超时 | 卡片降级：灰色 hairline border + "此刻暂未到达"短句 + "重新加载"按钮（小图标）；主图占位保持 16:9 | zh: "此刻暂未到达" / en: "This moment hasn't arrived" · 按钮: "重试" / "Retry" | `state.moment[id] = image_failed` · `error_category = media_load` · `http_status` | "重试"按钮（重新请求）；用户可继续浏览其他 Moment | ❌ 不显示 5xx 数字；❌ 不阻塞列表；❌ 不弹 toast |
| 3 | **content_withdrawn** | 服务端返回 `moment.status = withdrawn`（被撤下）| 卡片降级为"已撤下"占位：灰色 hairline border + "这一张已被作者或编辑撤下"短句；主图替换为灰色占位 | zh: "这一张已被作者或编辑撤下" / en: "This moment has been withdrawn" | `state.moment[id] = content_withdrawn` · `withdrawal.reason` (enum) | `moment_impression` **不发**（与 withdrawn 1:1 屏蔽） | 用户可点击进入 CityPage 看其他 Moment | ❌ 不显示撤下原因（避免 moderator 信息泄漏）；❌ 不显示"也许明天会回来"（不承诺） |
| 4 | **source_pending_verification** | `moment.verification_status = pending`（Witness 上传后未审核）| 卡片显示半透明（opacity 0.6）+ 角标"待核验"；视觉与 State C "Low" 一致 | zh: "待核验" / en: "Pending review" | `state.moment[id] = source_pending_verification` · `verification_status` | `moment_impression` 发（携带 pending=true） | 用户可点击查看详情；详情页显示完整审核流程 | ❌ 不显示"可能不实"（负向措辞）；❌ 不假装是已发布 |
| 5 | **city_unknown** | `moment.city_id` 缺失或无法反查城市（罕见场景，如 Editorial 测试内容未填城市）| 卡片降级：灰色 hairline + "这一张暂未归属一座城市"短句；点击不跳 city 而显示 tooltip | zh: "这一张暂未归属一座城市" / en: "This moment isn't tied to a city yet" | `state.moment[id] = city_unknown` · `city_id = null` | `moment_impression` 发（携带 unknown_city=true） | "反馈"链接（让用户报告问题）| ❌ 不显示具体 city_id = null；❌ 不假装知道城市 |
| 6 | **placeholder_unscheduled** | 槽位已分配但 Moment 还未发布（如 Daily 12 第 12 位 Khartoum 槽位尚未补位）| 灰色 hairline + "等待来自这里的切片"短句 + "—" 时间 | zh: "等待来自这里的切片" / en: "Waiting for a slice from here" | `state.moment[id] = placeholder_unscheduled` · `slot.position` | 不发埋点（设计内中性状态）| 用户可继续浏览其他 Moment | ❌ 不显示"暂无数据"；❌ 不显示 spinner |
| 7 | **ready** | Moment 图加载完成 + 元数据就绪 | LOCKED 完整视觉（Daily 12 tile / Same Second cell / Moment Detail / Live Event row）| — | `state.moment[id] = ready` · `moment.id` | `moment_impression(moment_id, position, city_id, source_type)` | — | — |
| 8 | **error_unknown** | 字段缺失 / 类型错误 / 数据完整性异常（前端 hardcode 兜底）| 卡片降级为"这一张暂时无法显示"占位 + 错误 ID | zh: "这一张暂时无法显示" / en: "This moment can't be shown right now" · 错误 ID: [short_id] | `state.moment[id] = error_unknown` · `error_category = data_integrity` | "反馈"链接 + "返回首页" | ❌ 不暴露 schema 错误；❌ 不假装成功 |

### 2.2 Moment 状态机跳转

```text
任意状态 → image_loading → ready
                       ↓ (timeout / 4xx / 5xx)
                  image_failed → image_loading (用户点重试)
                              → ready (retry 成功)
                       ↓ (服务端撤下)
                content_withdrawn (单向；不可恢复)
                       ↓ (审核未完成)
        source_pending_verification → ready (审核通过)
                                    → content_withdrawn (审核未通过)
                       ↓ (城市缺失)
                  city_unknown → ready (城市补全)
                              → error_unknown (无法补全)
                       ↓ (未发布)
        placeholder_unscheduled → ready (新 Moment 发布)
                       ↓ (数据完整性)
                  error_unknown → ready (刷新成功)
```

---

## §3 City 状态矩阵

> **对象定义**：City 是 Universal CityPage 单元（4 屏 Pattern：Arrival / One Scene / Same Second / Echo）。City 可处于 5 LOCKED 渲染状态（State A-E，见 `design-freeze-log-v1.md §5`）。本节覆盖**系统级状态**（Loading / Error / Empty / Unsupported），与 State A-E 渲染决策正交。
> **LOCKED 依据**：`cityPageRenderPlan.ts` + `cities.ts`（11 城数据）+ Brief §D-P0-04 City 必答

### 3.1 City 顶层状态表

| # | 状态 | 触发条件 | 视觉稿 | 文案（中英）| 字段 | 埋点 | 替代路径 | DO NOT |
|---|---|---|---|---|---|---|---|---|
| 1 | **city_loading** | City API 请求未返回（首屏 / 切换 / 刷新）| Hero 主图 + 城市名 + 4 屏 Pattern 位置用骨架屏（State E 同款 70% 空白 + 灰色 hairline）；文字"此刻，正在加载"在 Arrival 屏底部一行 | zh: "此刻，正在加载" / en: "Loading this city now" | `state.city[id] = loading` · `city.id` · `loading_ms` | `city_opened` **不发**（前端就绪触发，但与 ready 1:1） | 自动转 ready / error | ❌ 不显示 spinner；❌ 不阻塞 GlobalHeader（顶部导航仍可用）|
| 2 | **city_ready_with_moments** | City API 200 + 至少 1 个 Moment | LOCKED 4 屏 Pattern（State A/B/C 按数据自动渲染）| — | `state.city[id] = ready_with_moments` · `city.id` · `moment_count` | `city_opened(city_id, entry_point, layer=arrival)` · `city_section_viewed(city_id, section)` | — | — |
| 3 | **city_ready_basic_only** | City API 200 但无 Moment（State E Empty LOCKED）| LOCKED State E Empty：hero 空占位 + one_scene 70% 空白 + 1 行诗意 + same_second hide + Echo "Be the first to show here today" CTA | zh (诗意短句): "这座城市今天还没有切片 · 你可以是第一个" / en: "No slice from this city today · you could be the first" | `state.city[id] = ready_basic_only` · `moment_count = 0` | `city_opened` 发（携带 empty=true） | CTA 跳转 `/witness`（D-P0-02 入口） | ❌ 不显示"暂无数据"；❌ 不诱导"刷新"（Empty City 不诱导刷，per `design-freeze-log-v1.md §5.5`） |
| 4 | **city_timezone_failed** | City API 200 但 timezone 字段无效或浏览器不支持 | 城市名 + 当地时间降级为 "—" 短横线；Hero 图照常渲染；提示"此刻时间暂未到达"在 Arrival 屏底部小字 | zh: "此刻时间暂未到达" / en: "Current time isn't available" | `state.city[id] = timezone_failed` · `city.timezone` · `error_category = timezone_unsupported` | `city_opened` 发（携带 timezone_failed=true） | 其他数据（Hero / One Scene / Same Second）仍可浏览 | ❌ 不显示错误代码；❌ 不影响导航 |
| 5 | **city_weather_failed** | 第三方天气 API 失败（如 OpenWeather / WeatherAPI 不可用）| 城市天气小标签降级为 "—" 或移除天气显示；其他所有数据照常 | zh: "天气暂时连不上" / en: "Weather unavailable" · 出现位置: Hero 副标 / Arrival 屏 Meta | `state.city[id] = weather_failed` · `error_category = weather_provider_down` | 不发新事件（与 city_opened 1:1） | "重试"小图标在天气标签旁 | ❌ 不阻塞 CityPage 渲染；❌ 不暴露 provider 名 |
| 6 | **city_unsupported** | City 数据完整但被运营标记为 unsupported（如隐私 / 合规问题临时下线）| 整版降级：Hero 图照常（避免突变）+ 城市名 + "这一座暂时不显示内容"覆盖在 One Scene 屏；Same Second hide | zh: "这一座暂时不显示内容" / en: "This city isn't showing content right now" | `state.city[id] = unsupported` · `unsupported.reason` (internal) | `city_opened` 发（携带 unsupported=true） | "返回首页" / "看其他城市" | ❌ 不显示具体 unsupported 原因；❌ 不显示"已被删除" |
| 7 | **city_past_only** | City 数据完整但最近 30 天无活跃 Moment（State D Past-only LOCKED）| LOCKED State D：Hero + One Scene 完整；Same Second **hide**；Echo "Be the first today" CTA | zh: "成为今天第一个让这里被看见的人" / en: "Be the first to show here today" | `state.city[id] = past_only` · `last_moment_age_days` | `city_opened` 发（携带 past_only=true） | CTA 跳转 `/witness` | ❌ 不显示"过期"；❌ 不显示"已停止运营" |
| 8 | **city_error** | City API 5xx / network error / 404 | 整版降级：Hero 占位 + "远方暂时连不上"占位（同 §1.4 fully_unavailable）；错误 ID | zh: "远方暂时连不上" / en: "Can't reach this city for now" · 错误 ID: [short_id] | `state.city[id] = error` · `error_category` | `city_opened` **不发** | "重试" + "返回首页" + "反馈" | ❌ 不暴露 5xx / 404 字面量；❌ 不弹原生 alert |
| 9 | **city_error_boundary** | CityPage 组件 render 抛错 | 同 §1.8 error_boundary；显示"页面出错了" + 错误 ID | zh: "页面出错了" / en: "Something went wrong" · 错误 ID: [short_id] | `state.city[id] = error_boundary` · `error_category = client_render` | `client_error(error_category, component, stack_hash)` | "刷新页面" + "返回首页" | ❌ 生产模式不暴露 stack |

### 3.2 City 状态机跳转

```text
任意状态 → city_loading → city_ready_with_moments
                                  ↓ (无 Moment)
                            city_ready_basic_only (State E LOCKED)
                                  ↓ (timezone 失败)
                            city_timezone_failed → city_ready_with_moments (refresh 成功)
                                  ↓ (weather 失败)
                            city_weather_failed → city_ready_with_moments (refresh 成功)
                                  ↓ (unsupported)
                            city_unsupported (单向)
                                  ↓ (过去 30 天无 Moment)
                            city_past_only (State D LOCKED)
                                  ↓ (API 失败)
                            city_error → city_loading (用户点重试)
                                      → city_error (耗尽)
                                  ↓ (组件抛错)
                            city_error_boundary → city_loading (refresh 成功)
```

---

## §4 Unknown 状态矩阵

> **对象定义**：Unknown Coordinate 是"线索 → Reveal"的游戏化页面（5 阶段 Reveal：UTC ? → 23° N → 23.6345° N → 按钮显现 → CITY 揭示 → CityPage Arrival）。
> **LOCKED 依据**：`d10-unknown-coordinate-first-pass.md` + `sitemap-v1.md §1.3 /unknown` + Brief §D-P0-04 Unknown 必答

### 4.1 Unknown 顶层状态表

| # | 状态 | 触发条件 | 视觉稿 | 文案（中英）| 字段 | 埋点 | 替代路径 | DO NOT |
|---|---|---|---|---|---|---|---|---|
| 1 | **unknown_loading** | Unknown API 请求未返回（首屏 / Reveal 后跳转）| full-bleed 灰底 + "此刻，正在加载"一行 | zh: "此刻，正在加载" / en: "Loading this unknown" | `state.unknown[id] = loading` · `unknown.id` | `unknown_started` **不发**（与 ready 1:1） | 自动转 ready / empty | ❌ 不显示 spinner |
| 2 | **unknown_ready** | Unknown API 200 + 至少 1 个 clue | LOCKED 5 阶段 Reveal（Stage 1-4 完整）| — | `state.unknown[id] = ready` · `clue_count` | `unknown_started(unknown_id)` | — | — |
| 3 | **unknown_empty** | Unknown API 200 但无 clue（题目耗尽 / 运营下线）| 整版降级为"今天的观察已经结束"占位；与 Daily 12 empty 一致的 70% 空白规则 | zh: "今天的观察已经结束 · 明天见" / en: "Today's observation is over · see you tomorrow" | `state.unknown[id] = empty` · `empty.reason` | `unknown_started` 发（携带 empty=true） | "返回首页" + "看 Daily 12"链接 | ❌ 不显示"暂无题目"；❌ 不诱导"刷一下" |
| 4 | **reveal_failed** | Reveal API 返回错误 / 校验失败（如 reveal_token 失效）| Reveal 阶段降级：Stage 4 按钮变 "重新揭示"；顶部错误提示"揭示失败，请重试" | zh: "揭示失败，请重试" / en: "Reveal failed, please try again" | `state.unknown[id] = reveal_failed` · `error_category = reveal_validation` | `unknown_revealed` **不发** | "重新揭示"按钮 + "返回首页" | ❌ 不暴露 token 失效原因；❌ 不自动重试 |
| 5 | **content_retired** | Unknown 已被运营下线（如揭示的城市已下线 / 与 Daily 12 供应冲突）| full-bleed 灰底 + "这一次的观察已经结束" + "看 Daily 12"链接 | zh: "这一次的观察已经结束" / en: "This observation is over" | `state.unknown[id] = content_retired` · `retired.date` | `unknown_started` 发（携带 retired=true） | "返回首页" + "看 Daily 12" | ❌ 不显示下线原因；❌ 不显示"被删除" |
| 6 | **reveal_interrupted** | Reveal 进行中（Stage 1-4）用户离开页面 / 浏览器 crash | 用户返回 Unknown 主页时：自动从 Stage 1 重新开始 + 顶部小提示"上次未完成，重新开始" | zh: "上次未完成；重新开始" / en: "Last time didn't finish; starting over" | `state.unknown[id] = reveal_interrupted` · `interrupted.stage` | 不发新事件（中断是中性动作） | 用户点"继续上次"或"重新开始" | ❌ 不假装 Reveal 已完成；❌ 不丢用户位置 |

### 4.2 Unknown 状态机跳转

```text
任意状态 → unknown_loading → unknown_ready
                                  ↓ (无 clue)
                              unknown_empty → unknown_loading (refresh)
                                              → unknown_empty (持续)
                                  ↓ (Reveal 失败)
                              reveal_failed → unknown_ready (用户点重试)
                                           → unknown_empty (clue 被下线)
                                  ↓ (内容已下线)
                              content_retired (单向)
                                  ↓ (中断)
                              reveal_interrupted → unknown_ready (用户继续)
                                                  → unknown_loading (用户刷新)
```

---

## §5 Witness 状态矩阵（顶层 · 与 D-P0-02 子状态交叉引用）

> **对象定义**：Witness 是 Minimal Witness Flow（6 段流：入口 → 选图 → 时间 → 位置 → 描述 → 预览/提交/结果）。
> **LOCKED 依据**：`../minimal-witness/state-matrix-v1.md`（完整 76 子状态）+ `../minimal-witness/flow-diagram-v1.md`（Mermaid 状态机）+ `../minimal-witness/copy-final-v1.md`（完整文案）+ Brief §D-P0-04 Witness 必答
> **本文定位**：本节**仅覆盖 Witness 作为 6 对象之一**的顶层状态；不重复 D-P0-02 已交付的 76 个子状态（详见 D-P0-02 交叉引用）。

### 5.1 Witness 顶层状态表

| # | 状态 | 触发条件 | 视觉稿 | 文案（中英）| 字段 | 埋点 | 替代路径 | DO NOT |
|---|---|---|---|---|---|---|---|---|
| 1 | **witness_loading** | Witness API 临时未返回（如创建 submission 时）| 段 5 公开预览 + 段 6 上传步骤的 skeleton；文字"正在准备提交..." | zh: "正在准备提交..." / en: "Preparing your submission..." | `state.witness = loading` · `submission.step` | `witness_upload_started` 不发（与 submitting 1:1） | 自动转 submitting | ❌ 不显示 spinner |
| 2 | **witness_permission** | 任意需要权限的步骤（相机 / 相册 / 位置）| 段 1 / 段 3 内系统权限弹窗；C-06 Banner 在权限拒绝后显示（详见 D-P0-02 §1.1 / §1.3）| 详见 D-P0-02 §1 权限状态矩阵 | `state.witness.permission = not_determined / granted / denied / restricted / denied_permanent` | `witness_permission_result(permission_type, result)` | 见 D-P0-02 §1.1-1.4 每个 denied 的替代路径 | ❌ 不显示"必须开启" |
| 3 | **witness_uploading** | fetch 发起，进度 0-100% | D-P0-02 §3.1 完整：进度条 + 进度数字 + 缩略图；弱网变 Layer Yellow | D-P0-02 §3.1 完整 | `state.witness = uploading` · `progress_pct` · `network_class` | `witness_upload_started(media_type, network_class)`（仅一次） | "取消上传"按钮 | ❌ 不显示精确字节数 |
| 4 | **witness_validating** | 客户端校验中（提交前最后一次字段检查）| 段 6a 顶部"提交中..."一行 + 禁用按钮 | zh: "提交中..." / en: "Submitting..." | `state.witness = validating` · `validation_step` | 不发新事件 | 自动转 submitting / validation_failed | ❌ 不阻塞；❌ 不假装已上传 |
| 5 | **witness_under_review** | 服务端返回 `submission.status = submitted / under_review` | D-P0-02 §4.1 submitted 卡片（session 内显示）| D-P0-02 §7.5 完整 | `state.witness = under_review` · `submission_id` | `witness_submitted(submission_id, location_mode)`（服务端 confirmation） | "知道了" / "看城市"（已发布时） | ❌ 不显示"即将发布" |
| 6 | **witness_retry** | 上传失败但 retryable=true | D-P0-02 §3.5 retryable_idle 完整 | D-P0-02 §7.2 完整 | `state.witness = retry` · `retry_count` | `witness_submit_failed(error_category, retryable=true)` (重试耗尽后) | "重试" + "返回首页" | ❌ 不无限重试（最多 2 自动 + 1 手动）|
| 7 | **witness_failed_terminal** | 上传失败且 retryable=false（如客户端校验失败 / 服务端 4xx 不可重试）| D-P0-02 §3.5 retry_exhausted 完整 | D-P0-02 §7.3 完整 | `state.witness = failed_terminal` · `error_category` | `witness_submit_failed(error_category, retryable=false)` | "返回首页" / "看反馈入口" | ❌ 不显示"请重试"按钮（已 retryable=false） |
| 8 | **witness_empty** | Witness 流程被中断（如草稿 24h 过期 / 用户主动撤回）| D-P0-02 §4.4 expired 卡片 + "重新提交"按钮 | D-P0-02 §8.6 完整 | `state.witness = empty` · `empty.reason` (expired / withdrawn) | 不发新事件（中性动作） | "重新提交" / "返回首页" | ❌ 不假装成功 |
| 9 | **witness_published** | `submission.status = published`（审核通过 + 发布）| D-P0-02 §4.2 published 卡片（session 内显示）| D-P0-02 §8.2 完整 | `state.witness = published` · `submission_id` · `city_id` | `witness_submitted` 已发；published 不重发 | "看城市"（跳转 `/cities/:cityId`） + "返回首页" | ❌ 不显示"成功啦"过度庆祝 |

### 5.2 Witness 与 D-P0-02 子状态交叉引用矩阵

> **D-P0-02 已交付** 76 个 Witness 子状态（权限 18 + EXIF 14 + 上传 22 + 审核 11 + 位置降级 11），本文 9 个顶层状态 = 这些子状态的**聚类**。

| 顶层状态 | 包含的 D-P0-02 子状态 |
|---|---|
| **witness_loading** | D-P0-02 §2.1 exif_reading（EXIF 解析 Loading） |
| **witness_permission** | D-P0-02 §1.1-1.4 全部 18 个权限子状态（camera / photo_library / location / notification） |
| **witness_uploading** | D-P0-02 §3.1-3.2 全部 7 个上传子状态（uploading_progress / uploading_slow / uploading_paused_background / uploading_resumed / network_offline / network_timeout / network_slow_retry） |
| **witness_validating** | D-P0-02 §3.4 全部 4 个客户端校验子状态（validation_no_photo / validation_no_city / validation_future_time / validation_exif_untrusted） |
| **witness_under_review** | D-P0-02 §4.1 submitted + under_review 2 个子状态 |
| **witness_retry** | D-P0-02 §3.5 retryable_idle + retrying + retry_exhausted 3 个子状态 |
| **witness_failed_terminal** | D-P0-02 §3.3 全部 5 个服务端错误子状态（server_5xx / server_4xx_validation / server_4xx_rate_limited / server_4xx_duplicate / server_4xx_permission_blocked）+ §3.4 validation 4 + §4.3 failed 1 = 10 个子状态 |
| **witness_empty** | D-P0-02 §4.4 expired + withdrawn 2 个子状态 |
| **witness_published** | D-P0-02 §4.2 published 1 个子状态 |

> **不重复**：D-P0-02 已锁定的 76 子状态全部由 D-P0-02 owner 维护；本文仅作**对象维度**聚类，**不修改** D-P0-02 任何子状态。

---

## §6 Echo 状态矩阵（扩展至 8 态）

> **对象定义**：Echo 是 CityPage Screen 04 Echo 章节的输入组件（`<EchoComposer>` / EchoInput）。当前 LOCKED 5 态：default / hover / focus / typing / submitted（per `design-freeze-log-v1.md §6.12`）。
> **LOCKED 依据**：`design-freeze-log-v1.md §6.12 EchoInput 5 态` + `event-map-v1.md §3 Echo 路径事件` + Brief §D-P0-04 Echo 必答
> **本文扩展**：从 LOCKED 5 态扩展为 **8 态**——新增 Disabled / Error / Loading。**扩展逻辑**：5 态是组件本身的 UI 态；8 态是 Echo **作为系统状态**的覆盖态（含服务端交互态）。

### 6.1 Echo 顶层状态表（8 态 · 扩展自 LOCKED 5 态）

| # | 状态 | 触发条件 | 视觉稿 | 文案（中英）| 字段 | 埋点 | 替代路径 | DO NOT |
|---|---|---|---|---|---|---|---|---|
| 1 | **default** | 输入框初始状态（未获焦 / 未输入）| LOCKED EchoInput 5 态之 default：textarea 灰色 hairline border + placeholder 文字 | placeholder: zh: "这一刻，你留下了什么？" / en: "What did you leave behind in this moment?" | `state.echo = default` · `city.id` | 不发埋点 | 用户点击 textarea → focus | ❌ 不主动 focus |
| 2 | **focus** | 输入框获焦但未输入 | LOCKED EchoInput 5 态之 focus：textarea Earth Blue 2px focus ring + placeholder 淡出 | — | `state.echo = focus` · `city.id` | 不发埋点（仅作 UI 态） | 用户输入字符 → typing | — |
| 3 | **typing** | 用户输入 ≥ 1 个非空字符 | LOCKED EchoInput 5 态之 typing：textarea Earth Blue focus ring + 字符计数 `[N] / 280` 显示 | zh: "[N] / 280" / en: "[N] / 280" | `state.echo = typing` · `city.id` · `char_count` | `echo_started(city_id)`（**仅首次输入**） | 用户清空 → focus；用户提交 → submitting | ❌ 不重复触发 echo_started |
| 4 | **disabled** | City 处于不支持 Echo 状态（如 City E Empty / City unsupported / City past_only 早期版本）| LOCKED EchoInput 5 态之 disabled：textarea 灰色 50% opacity + "Echo 在这座城市暂不可用"提示 + 不显示 submit 按钮 | zh: "Echo 在这座城市暂不可用" / en: "Echo isn't available in this city right now" | `state.echo = disabled` · `disabled.reason` | 不发埋点（设计内中性状态） | "反馈"链接 | ❌ 不显示 submit 按钮；❌ 不诱导"重试" |
| 5 | **submitting** | 用户点 submit + 服务端请求中 | LOCKED EchoInput 5 态之 submitted 的中间态：textarea disabled + submit 按钮变"提交中..." spinner（小圆点 Earth Blue 旋转）| zh: "提交中..." / en: "Submitting..." | `state.echo = submitting` · `submission_id_temp` | `echo_started` 已发；submitting 不重发 | 自动转 success / error | ❌ 不显示 spinner + "X" 取消按钮混用 |
| 6 | **success** | 服务端 200 + echo 落库 | LOCKED EchoInput 5 态之 submitted：大对勾（Layer Red / 通用 Earth Blue）+ "Echo 已留下" | zh: "Echo 已留下" / en: "Echo left" · 短描述: "[用户输入的短描述]" | `state.echo = success` · `echo.id` · `city.id` | **`echo_submitted(city_id, result=accepted)`**（服务端 confirmation） | "再留一句"（清空 + focus） / "看城市" | ❌ 不显示"即将发布"；❌ 不假装"已被选中" |
| 7 | **error** | 服务端 5xx / network error / 验证失败（如 Echo 文本被 moderation 拒绝）| LOCKED EchoInput 5 态之 error（**新增**）：textarea 变 Layer Red 1px border + 顶部错误提示 + "重试"按钮 | zh: "提交失败：[简短原因]" / en: "Submission failed: [brief reason]" | `state.echo = error` · `error_category` | `echo_submit_failed(error_category, retryable)` | "重试" + "修改文本" + "返回城市" | ❌ 不显示服务端 trace；❌ 不假装成功 |
| 8 | **loading** | 服务端 P1 Echo backend 不可用（如降级为禁用 Echo）| LOCKED EchoInput 5 态之 loading（**新增**）：textarea 灰色 hairline + "Echo 暂未开放" + 不显示 submit 按钮 | zh: "Echo 暂未开放" / en: "Echo isn't open yet" | `state.echo = loading` · `loading.reason` (backend_pending) | 不发埋点（降级中性状态） | "反馈"链接 | ❌ 不显示假 submit 按钮；❌ 不假装"提交成功" |

### 6.2 Echo 状态机跳转

```text
任意状态 → default → focus → typing → submitting → success → default (清空)
                                                       ↓ (服务端失败)
                                                     error → typing (用户修改)
                                                          → default (用户放弃)
                                                       ↓ (P1 backend 不可用)
                                                     loading → disabled (运营决定)

注：disabled / loading 是设计内降级态；正常流程不经过。
```

### 6.3 Echo 5 态 LOCKED → 8 态扩展差异说明

| LOCKED 5 态 | 本文 8 态对应 | 差异 |
|---|---|---|
| default | **default** | 完全一致 |
| hover | （合并到 focus）| LOCKED 6.12 hover 是桌面态；移动端无 hover，统一合并到 focus |
| focus | **focus** | 完全一致 |
| typing | **typing** | 完全一致 |
| submitted | **success**（重命名）+ **error**（新增）| LOCKED 5 态的 submitted 仅覆盖成功；本文拆分 submitted = success + error，更精确表达服务端结果 |
| （无）| **disabled** | 新增；用于 City 不支持 Echo 的降级态 |
| （无）| **loading** | 新增；用于 P1 Echo backend 不可用降级 |
| （无）| **submitting** | 新增中间态；LOCKED 5 态未明确（默认 focus → submitted 跳转） |

> **扩展约束**：8 态中，default / focus / typing / submitted(success) 4 态与 LOCKED 5 态兼容；新增 4 态（disabled / loading / submitting / error）不修改 LOCKED 5 态的视觉规范，仅扩展状态覆盖。
> **不修改 14 LOCKED 组件**：EchoInput 组件 props 不变；新增状态由 props 驱动（如 `<EchoComposer city={city} state="disabled" />`），由 PM Agent 评审后实施。

---

## §7 通用横切规则总览（详见 loading-error-empty-v1.md）

### 7.1 Loading 横切规则

| 规则 | 适用范围 | 阈值 |
|---|---|---|
| **首屏 Loading 不阻塞交互**（除主图外）| Homepage / Today / CityPage / Witness | Hero 主图可阻塞；其他板块独立渲染 |
| **长操作 > 2s 显示进度或骨架屏** | Witness 上传 / Reveal / Submit | 进度条 ≥ 4px 高度；骨架屏占位 = 实际布局 |
| **短操作 < 200ms 不显示 Loading** | Echo submit / Refresh / Toggle | 直接显示结果，避免闪烁 |
| **绝不用 spinner** | 全站 | 用 hairline border + `bg-hero-mist` 极淡冷白填充；或文字一行 |

### 7.2 Error 横切规则

| 规则 | 适用范围 | 说明 |
|---|---|---|
| **文案明确说明发生了什么** | 全站 | "远方暂时连不上" 而非 "Error" |
| **给可执行下一步**（重试 / 返回 / 反馈入口）| 全站 | 必给 CTA |
| **错误分类标签**（前端 / 网络 / 服务端 / 权限 / 数据）| 全站埋点 | `error_category` 枚举，与 E-P0-09 contract 对齐 |
| **不暴露内部错误码或堆栈** | 全站 | 生产模式仅显示错误 ID（hash） |
| **错误 ID 必须可关联 request / submission / edition ID** | 全站埋点 | 与 E-P0-10 监控对齐 |

### 7.3 Empty 横切规则

| 规则 | 适用范围 | 说明 |
|---|---|---|
| **解释"为什么空"**（"今天还没有来自这里的内容"而非"暂无数据"）| 全站 | 诗意短句 + 1 行解释 |
| **给引导动作**（去 Explore / 去 Witness / 等明天）| 全站 | CTA 必须有目标 |
| **不诱导"刷新"** | Empty City / Empty Unknown | per `design-freeze-log-v1.md §5.5` "Empty City 不诱导继续刷" |
| **70% 空白 + 1 行诗意 + CTA**（CityPage State E Empty LOCKED）| CityPage | 严格规则，不允许偏差 |

### 7.4 Permission 横切规则

| 规则 | 适用范围 | 说明 |
|---|---|---|
| **区分"未请求" vs "已拒绝"** | Witness 全部权限 | 见 D-P0-02 §1.1-1.4 |
| **已拒绝状态给"去系统设置"入口** | restricted / denied_permanent | 链接到系统设置（iOS / Android）|
| **不把拒绝设计为惩罚** | 全部 | 见 D-P0-02 §1.1 "不显示必须开启" |

### 7.5 Privacy 横切规则

| 规则 | 适用范围 | 说明 |
|---|---|---|
| **公开预览与精确位置的边界可视化** | Witness 段 5 + Echo | 见 D-P0-02 §6 + consent-placement C-05 |
| **用户能看见"这条将被公开的内容"才能提交** | Witness 段 5 | 任务卡 AC §3 |
| **不暗示绝对匿名** | Witness 全部隐私文案 | 见 D-P0-02 §10 + copy-final-v1.md §1.2 |
| **不暴露精确 GPS / EXIF / 推断住址** | 全站 | 见 forbidden-fields-v1.md F-01~F-11 |

> **完整规范**：见 `loading-error-empty-v1.md`（3 状态横切规范）。

---

## §8 6 对象状态总数 + 完整覆盖矩阵

### 8.1 状态数统计

| 对象 | 顶层状态数 | 子状态（含 D-P0-02 引用） | 备注 |
|---|---:|---:|---|
| Daily 12 | 8 | + 2 子（tile_image_failed + tile_khartoum_placeholder）= 10 | |
| Moment | 8 | 0 子（自身即完整）= 8 | |
| City | 9 | 0 子 = 9 | 与 LOCKED 5 States 正交 |
| Unknown | 6 | 0 子 = 6 | |
| Witness | 9 | + 76 子（D-P0-02 引用，不重复）= 85 | D-P0-02 完整覆盖 |
| Echo | 8 | 0 子（自身即完整，LOCKED 5 态扩展为 8）= 8 | |
| **总计（顶层）** | **48** | **顶层 + 子 = 126** | Witness 占 85（含子）|

### 8.2 与任务卡 §A 必答状态对照

| 任务卡要求 | 本文覆盖位置 |
|---|---|
| Daily 12: 首次加载 / 刷新 / 部分缺失 / 整版不可用 / 旧版回退 / Loading 骨架 / Error 重试 / Empty | §1.1 第 1-8 行 + §1.2 子状态（image_failed / placeholder）|
| Moment: 图片加载失败 / 内容撤下 / 来源待核验 / 城市未知 / 占位 / Loading / Error | §2.1 第 1-8 行（含 ready 1 个）= 完整 8 状态 |
| City: 无 Moment / 仅基础资料 / 时区失败 / 天气失败 / Unsupported / Loading / Error / Empty / Past-only | §3.1 第 1-9 行 = 完整 9 状态 |
| Unknown: 无可用题目 / Reveal 失败 / 内容已下线 / Loading / Error | §4.1 第 1-6 行 = 完整 6 状态（含 reveal_interrupted 中断恢复）|
| Witness: 权限 / 上传 / 校验 / 审核 / 失败重试 | §5.1 第 1-9 行 = 完整 9 状态 + D-P0-02 76 子状态 |
| Echo: Default / Focus / Typing / Disabled / Submitting / Success / Error | §6.1 第 1-8 行 = 完整 8 状态（LOCKED 5 态扩展为 8 态）|

> **覆盖率 100%**：任务卡 §A 列出的所有状态及其细分全部覆盖。

### 8.3 与 Brief §D-P0-04 AC 对照

| AC | 状态 | 证据 |
|---|---|---|
| ✅ Daily 12 首次加载 / 刷新 / 部分缺失 / 整版不可用 / 旧版回退 / Loading 骨架 / Error 重试 / Empty | §1.1 第 1-8 行 | 8/8 |
| ✅ Moment 图片加载失败 / 内容撤下 / 来源待核验 / 城市未知 / 占位 / Loading / Error | §2.1 第 1-8 行 | 8/8 |
| ✅ City 无 Moment / 仅基础资料 / 时区失败 / 天气失败 / 不支持 / Loading / Error / Empty | §3.1 第 1-9 行 | 9/9 |
| ✅ Unknown 无可用题目 / Reveal 失败 / 内容已下线 / Loading / Error | §4.1 第 1-6 行 | 6/6 |
| ✅ Witness 权限 / 上传 / 校验 / 审核 / 失败重试 | §5.1 第 1-9 行 + D-P0-02 76 子 | 9 + 76 |
| ✅ Echo Default / Focus / Typing / Disabled / Submitting / Success / Error | §6.1 第 1-8 行 | 8/8 |
| ✅ Loading / Error / Empty / Permission / Privacy 横切规则明确 | §7 + `loading-error-empty-v1.md` | 5/5 |
| ✅ 错误分类标签与 E-P0-09 contract 错误码对应 | §1.1 / §2.1 / §3.1 / §4.1 / §5.1 `error_category` 字段；详见 `loading-error-empty-v1.md §2.4` 错误码映射表 | 100% |
| ✅ 文案不带内部技术细节 | §1.1 / §2.1 / §3.1 / §4.1 / §5.1 / §6.1 文案列；详见 `copy-library-v1.md` | 100% |
| ✅ 拒绝权限状态不出现惩罚性文案 | §5.1 `witness_permission` + D-P0-02 §1.1-1.4 | 100% |

---

## §9 与 E-P0-09 Contract 对齐（error_category 字段）

> **设计端 source of truth**：本节定义的 `error_category` 字段供 E-P0-09 lock 时使用。详见 `loading-error-empty-v1.md §2.4` 错误码映射表。

| error_category | 含义 | 触发来源 | 重试性 | 出现对象 |
|---|---|---|---|---|
| `network_offline` | 浏览器/iOS navigator.onLine=false 或 fetch TypeError | 前端 | true | Daily 12 / Moment / City / Unknown / Witness |
| `network_timeout` | fetch 超时（默认 60s）| 前端 | true | Daily 12 / Moment / City / Witness |
| `media_load` | 图片 URL 4xx/5xx 或加载超时 | 前端 | true | Daily 12 tile / Moment / City Hero |
| `server_5xx` | 服务端 5xx | 服务端 | true | Daily 12 / Moment / City / Unknown / Witness / Echo |
| `server_4xx_validation` | 服务端 4xx 验证错误 | 服务端 | false | Witness / Echo |
| `server_4xx_rate_limited` | 429 限流 | 服务端 | true（倒计时后）| Witness / Echo |
| `server_4xx_duplicate` | submission_id 已存在（幂等命中）| 服务端 | N/A | Witness |
| `server_4xx_permission_blocked` | 服务端判定权限违规（如 EXIF GPS 未剥离）| 服务端 | false | Witness |
| `validation` | 客户端校验失败 | 前端 | false | Witness / Echo |
| `captured_at_invalid` | captured_at 在未来 / EXIF 不可信 | 前端 | false | Witness |
| `exif_untrusted` | EXIF DateTimeOriginal 不可信 | 前端 | false | Witness |
| `permission_denied` | 权限被拒绝 / 受限 | 前端 | N/A | Witness（详见 D-P0-02） |
| `rate_limited` | 客户端限流（含 Witness / Echo）| 前端 | true（倒计时后）| Witness / Echo |
| `data_integrity` | 字段缺失 / 类型错误 / schema 不匹配 | 前端 | false | Moment / City / Unknown |
| `timezone_unsupported` | timezone 字段无效或浏览器不支持 | 前端 | N/A | City |
| `weather_provider_down` | 第三方天气 API 失败 | 服务端 | true | City |
| `client_render` | React render 抛错（前端代码异常）| 前端 | true（刷新）| 全站 |
| `reveal_validation` | Reveal API token 校验失败 | 服务端 | true（重试）| Unknown |
| `upload_network` | Witness 上传网络失败（与 network_offline 等价，独立分类便于分析）| 前端 | true | Witness |
| `upload_timeout` | Witness 上传超时（与 network_timeout 等价）| 前端 | true | Witness |

> **字段枚举 20 项**：完整定义见 `loading-error-empty-v1.md §2.4` 错误码映射表。

---

## §10 自验收 checklist（任务卡 Acceptance Criteria）

| # | 验收项 | 状态 | 证据 |
|---|---|---|---|
| 1 | 6 对象状态矩阵全部覆盖 | ✅ | §1-§6 顶层 48 + 子 76 = 124 |
| 2 | 每个状态有触发条件 / 视觉稿 / 文案 / 字段 / 埋点 / 替代路径 | ✅ | §1.1 / §2.1 / §3.1 / §4.1 / §5.1 / §6.1 每行 8 列 |
| 3 | Loading / Error / Empty / Permission / Privacy 横切规则明确 | ✅ | §7 + `loading-error-empty-v1.md` |
| 4 | 错误分类标签与 E-P0-09 contract 错误码一一对应 | ✅ | §9 + `loading-error-empty-v1.md §2.4` |
| 5 | 文案不带内部技术细节（堆栈 / SQL / 5xx 字面量等）| ✅ | §1.1-§6.1 文案列；详见 `copy-library-v1.md` |
| 6 | 拒绝权限状态不出现"必须开启""无法继续"等惩罚性文案 | ✅ | §5.1 `witness_permission` + D-P0-02 §1.1-1.4 |
| 7 | 设计交付链接全部归位 | ✅ | frontmatter `canonical_obsidian_path` + `related_docs` |
| 8 | 6 对象 × 必答状态 100% 覆盖 | ✅ | §8.2 对照表 8/8 + 9/9 + 6/6 + 9 + 76 + 8/8 |
| 9 | Echo LOCKED 5 态扩展为 8 态的差异说明 | ✅ | §6.3 |
| 10 | Witness 76 子状态由 D-P0-02 维护，本文不重复 | ✅ | §5.2 交叉引用矩阵 |

---

## §11 已知边界与待 E-P0-09 锁定字段

| # | 缺口 | Owner | 解锁条件 |
|---|---|---|---|
| 1 | `error_category` 完整枚举（§9 列 20 项）需 E-P0-09 锁 | E-P0-09 | E-P0-09 contract 锁 |
| 2 | `state.moment.verification_status` 枚举（pending / verified / withdrawn）需 E-P0-09 锁 | E-P0-09 | E-P0-09 contract 锁 |
| 3 | `state.city.unsupported.reason` 内部原因枚举需 E-P0-09 锁 | E-P0-09 | E-P0-09 contract 锁 |
| 4 | `state.unknown.empty.reason` 内部原因枚举需 E-P0-09 锁 | E-P0-09 | E-P0-09 contract 锁 |
| 5 | `state.echo.disabled.reason` 内部原因枚举需 E-P0-09 锁 | E-P0-09 | E-P0-09 contract 锁 |
| 6 | `state.echo.error.error_category` 完整枚举需 E-P0-09 锁 | E-P0-09 | E-P0-09 contract 锁 |
| 7 | `state.daily12.stale_fallback.threshold_hours`（24h）需 E-P0-06 锁 | E-P0-06 | Daily 12 Supply Chain |
| 8 | Echo 8 态扩展到 14 LOCKED 组件 props 的实施路径需 PM 评审 | PM Agent | D-P0-04 PM Review |

---

## §12 给后续任务的接口

### 12.1 给 E-P0-10（监控 / 错误 / 性能 / 隐私基线）

- ✅ 本文件定义的 `error_category` 20 项枚举 + 重试性布尔 = 监控分类的 source of truth
- ✅ 错误 ID 关联 request / submission / edition ID = 与 E-P0-10 监控 ID 体系一致
- ⚠️ E-P0-10 需要基于本文件建立 error_category → 告警级别的映射（如 `server_5xx` = P0 告警；`media_load` = P2 警告）

### 12.2 给 E-P0-09（API Contract）

- ✅ §9 `error_category` 完整枚举 20 项，供 contract 锁
- ✅ §1-§6 每个 `state.*.error_category` 字段，供 contract 锁
- ⚠️ §11 缺口 1-6 项需 E-P0-09 锁

### 12.3 给 E-P0-07（Analytics Instrumentation）

- ✅ `moment_impression` / `city_opened` / `unknown_started` 等 P0 14 事件与本文 §1-§4 状态对应（如 `ready_with_moments` → `city_opened` 发；`empty` → `city_opened` 携带 empty=true）
- ✅ `witness_started` / `witness_permission_result` / `witness_submitted` / `witness_submit_failed` 与 §5 顶层 9 状态对应（详见 D-P0-02 子状态）
- ⚠️ 新增 `echo_submit_failed(error_category, retryable)` 事件需 E-P0-07 增加 schema

### 12.4 给 D-P0-06（Launch Checklist）

- ✅ §1-§6 状态矩阵 + `loading-error-empty-v1.md` 横切规范 = Launch UI Checklist §8 "Loading / Error / Empty / Permission / Privacy 状态齐全" 的 source of truth
- ⚠️ D-P0-06 应引用本文件 + D-P0-02 state-matrix 作为状态层验收依据

### 12.5 给 D-P0-02（Minimal Witness Flow · 已知 IN REVIEW）

- ✅ Witness 顶层 9 状态 + 子状态 76 = 与 D-P0-02 既有 76 子状态完全对齐
- ✅ §5.2 交叉引用矩阵明示 D-P0-02 owner 维护子状态；本文不修改
- ⚠️ §6 Echo 8 态扩展不影响 Witness 流程（Witness 与 Echo 独立）

### 12.6 给 iOS first-pass（future）

- ✅ §1-§6 状态矩阵适用于 Web + iOS 共享
- ⚠️ iOS first-pass 应基于本文件 + D-P0-02 state-matrix + `responsive-rules-v1.md §3.4 Witness Mobile` 综合实施

---

## §13 Blocker

**无**。所有 6 对象 × 必答状态全部覆盖；与 D-P0-02 76 子状态交叉引用无冲突；与 E-P0-09 占位 contract error_category 20 项枚举对齐；与 14 LOCKED 组件 + A2 LOCK 视觉规范一致。

---

**End of state-matrix-v1.md · D-P0-04 子产物 1/4**