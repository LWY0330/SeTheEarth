---
title: Launch UI Checklist v1 · Brief §D-P0-06 主交付物
type: launch-checklist
tags: [release-v1, d-p0-06, launch-checklist, gate-c, design, see-earth]
task_id: D-P0-06
brief_anchor: §4 D-P0-06
track: design
target_gate: Gate C · Launch Candidate
created: 2026-08-24
sender: Designer Agent #6
receiver: PM Agent (Orchestrator) / Design / Engineering / Content / Operations
status: IN REVIEW
depends_on:
  - D-P0-01 LOCKED ✓ (22 LOCKED · sitemap-v1 + design-freeze-log-v1)
  - D-P0-02 IN REVIEW (Witness Flow · copy-final-v1)
  - D-P0-03 IN PROGRESS (Alpha / Beta 状态规范)
  - D-P0-04 IN PROGRESS (关键系统状态)
  - D-P0-05 IN REVIEW (Analytics Events Map)
  - Gate A 视觉验收 PASS (2026-08-24)
blocks: [Gate C · Launch Candidate 验证]
source_brief: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/SEE-EARTH-Release-Strategy-v1-Design-Engineering-Task-Brief.md §4 D-P0-06
source_task_card: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/06-PM Agent 交接/2026-08-22-task-card-d-p0-06-launch-ui-checklist.md
related_docs:
  - ./placeholders-audit-v1.md
  - ./url-routing-audit-v1.md
  - ./privacy-compliance-v1.md
  - ./accessibility-audit-v1.md
  - ./content-freshness-v1.md
  - ./sign-off-template-v1.md
  - ../web-v1-flow/design-freeze-log-v1.md
  - ../web-v1-flow/sitemap-v1.md
  - ../minimal-witness/state-matrix-v1.md
  - ../minimal-witness/copy-final-v1.md
  - /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/06-PM Agent 交接/2026-08-24-gate-a-visual-acceptance.md
  - /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/06-PM Agent 交接/2026-08-24-round3-dispatch-log.md
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/06-PM Agent 交接/release-v1/launch-checklist/checklist-v1.md
workspace_canonical_path: /Users/lwy/Documents/ChatGPT/看见地球/release-v1/launch-checklist/checklist-v1.md
---

# Launch UI Checklist v1 · D-P0-06 主交付物

> **作者**：Designer Agent #6（外部 Owner = 您）  
> **目标读者**：PM Agent（Gate C 决策者）/ Design / Engineering / Content / Operations  
> **目的**：把 Brief §4 D-P0-06 的 10 项 AC 转为**可逐项执行、可逐项签字**的 UI 验收清单，作为 Gate C（Launch Candidate）的**必过门槛**。  
> **完成时间**：2026-08-24  
> **配套文件**：见 related_docs（6 份子清单 + sign-off 模板）

---

## 0. 一句话总结

**Brief §D-P0-06 的 10 项 AC = Launch Candidate 必须 100% 闭合的 UI 验证清单；本 checklist 是 10 项 AC 的执行手册，每项展开为「验证方法 · 验证工具 · Owner · 证据」四列。任何一项未闭合 → Gate C 不签字。**

---

## 1. 适用范围与不适用范围

### 1.1 适用页面（P0 路径 · 7 个唯一页面）

| # | 路由 | 页面 | LOCKED 状态 |
|---|---|---|---|
| P0-1 | `/` | Homepage / Today | LOCKED ✓ (2026-08-17 · v2-phase15) |
| P0-2 | `/moments/:momentId` | Moment Detail | LOCKED ✓ CONDITIONAL (作为 CityPage Same Second) |
| P0-3 | `/cities/:cityId` | Universal CityPage | LOCKED ✓ (2026-08-22) |
| P0-4 | `/unknown` | Unknown Coordinate | LOCKED ✓ CONDITIONAL (2026-08-22) |
| P0-5 | `/witness` | Minimal Witness Flow | IN REVIEW (D-P0-02 · copy-final-v1) |
| P0-6 | `/about` | About / Method | NEEDS LOCK (文档类) |
| P0-7 | `/privacy` | Privacy | NEEDS LOCK (文档类 · §E-P0-05) |

### 1.2 不适用（Out of V1 / 移出 Scope）

- 社交 Feed / 关注 / 点赞 / 排行
- 账户体系 / 登录墙 / Profile
- Journal / My Coordinates / Earth Archive 产品化
- 推荐算法 / AI 个性化 / 复杂通知
- Native Android
- 第四套 City Layer
- iOS first-pass（独立排期 D-P1-01 · 不阻塞 Web Gate C）
- 全 CMS / 全自动城市 onboarding（E-P2-01）

> 本 checklist 严格遵循 Brief §6 Scope Freeze：Launch Candidate 期间**只允许修复，不允许新增功能**。

---

## 2. Brief §D-P0-06 AC 10 项执行手册

### AC #1 · 22 LOCKED 设计文件全部应用

**Brief 原文**：「Web V1 页面与状态有唯一最终稿」

**验证方法**

| 步骤 | 操作 | 工具 / 文件 | 期望 |
|---|---|---|---|
| 1.1 | 对照 `design-freeze-log-v1.md` §1 的 22 项 LOCKED 总表 | Obsidian 查阅 | 22 项状态 = LOCKED ✓ |
| 1.2 | 检查 P0-1 Homepage 部署：`/src/App.tsx` + `/src/components/HomeHero.tsx` + `HomeLiveEvents.tsx` + `HomeCoordinates.tsx` + `HomeWorldsCollide.tsx` + `HomeEarthArchive.tsx` | `git diff alpha main -- src/App.tsx src/components/Home*.tsx` | 6 文件全部 LOCKED 视觉就位 |
| 1.3 | 检查 P0-3 CityPage：`UniversalCityPage` 4 屏 + `cityPageRenderPlan.ts` 5 State | `/src/components/UniversalCityPage.tsx` + `/src/lib/cityPageRenderPlan.ts` | 4 屏 Pattern + 5 State 渲染接口 LOCKED |
| 1.4 | 检查 P0-4 Unknown：`UnknownCoordinate.tsx` 5 阶段 Reveal | `/src/components/UnknownCoordinate.tsx` | 5 阶段顺序 + "此刻,在地球的某个角落。"文案 LOCKED |
| 1.5 | 检查 14 组件 props：对照 §6 14 组件 × 6 状态 | `/src/components/ui/` 14 文件 | 14 组件全部 LOCKED · props 不增不改 |
| 1.6 | 检查 3 Layer（Blue / Yellow / Red）：kyoto / lisbon / khartoum 三城渲染 | `/src/data/cities.ts` + `/src/styles/tokens.css` | 三套 Layer 主色未漂移 |

**Owner**：Designer Agent + Engineering Lead  
**证据**：`design-freeze-log-v1.md` §1 总表 + `v2-phase15-report.md` + 部署截图  
**配套子清单**：无（直接在主清单验证）

**自验收**：

- [ ] 22 LOCKED 项全部就位
- [ ] 6 个核心组件 props 与 LOCKED 一致
- [ ] 3 Layer 三城渲染与 LOCKED 一致
- [ ] 无新增视觉方向（Brief §6 禁止）

---

### AC #2 · 关键流程通过键盘、触屏和基础读屏顺序检查

**Brief 原文**：「关键流程通过键盘、触屏和基础读屏顺序检查」

**验证方法**

| 步骤 | 操作 | 工具 | 期望 |
|---|---|---|---|
| 2.1 | 键盘 Tab 顺序：模拟 Tab 键从 Homepage → 12 Coordinates → Live Events → Earth Archive → Footer | Chrome DevTools Lighthouse / axe-core | 顺序符合视觉顺序；无跳序；无循环 |
| 2.2 | 键盘焦点圈：每个可聚焦元素（链接 / 按钮 / cell）有可见焦点圈 | DevTools `:focus` + 视觉 | 焦点圈 = Earth Blue 2px（VF 1.2 已锁） |
| 2.3 | 键盘可达：12 Coordinates 任一 cell 可单独 Tab | Tab + Enter 模拟 | 可单独聚焦 + 激活 |
| 2.4 | 键盘可达：Live Events 4 条 / Spotlight 1 条 / Earth Archive 节点 9 个 / Footer 链接 全部可 Tab | Tab 遍历 | 100% 可达 |
| 2.5 | 触屏：移动端 320px-767px 视口测试 12 Coordinates cell 触摸命中区 ≥ 44×44 px | Chrome DevTools Device Toolbar | 命中区符合 WCAG 2.5.5 |
| 2.6 | 触屏：Unknown Stage 4「进入此刻 →」按钮触摸命中区 ≥ 44×44 px | DevTools Touch Mode | 同上 |
| 2.7 | 基础读屏：VoiceOver / NVDA 读屏 Homepage 5 板块标题 + 12 城名称 + Live Events 内容 | VoiceOver (macOS) | 顺序合理；alt 文本完整；表单 label 正确 |
| 2.8 | 基础读屏：CityPage 4 屏（H1 / One Scene 描述 / Same Second 3 栏 / Echo 输入） | VoiceOver | 4 屏内容正确朗读；表单字段有 label |
| 2.9 | 基础读屏：Witness Flow 6 段每段 H1 + 表单字段 label | VoiceOver | 表单字段有 `<label for>` 或 `aria-label` |

**Owner**：QA + Design  
**工具**：Chrome DevTools Lighthouse · axe-core browser ext · VoiceOver · NVDA  
**配套子清单**：[accessibility-audit-v1.md](./accessibility-audit-v1.md)（AC #2 = 该文件 §3 全部内容）

**自验收**：

- [ ] Lighthouse Accessibility 评分 ≥ 95
- [ ] axe-core 自动扫描 0 critical / 0 serious 违规
- [ ] 5 大关键流程 100% 键盘可达
- [ ] 5 大关键流程 VoiceOver / NVDA 朗读正确
- [ ] 移动端命中区 ≥ 44×44 px

---

### AC #3 · 文本对比度、Focus、Reduced Motion 有明确规则

**Brief 原文**：「文本对比度、Focus、Reduced Motion 有明确规则」

**验证方法**

| 步骤 | 操作 | 工具 | 期望 |
|---|---|---|---|
| 3.1 | 对比度：所有文字与背景对比度 | axe-core / WebAIM Contrast Checker | 普通文字 ≥ 4.5:1；大字号（≥ 18pt / 14pt bold）≥ 3:1 |
| 3.2 | 对比度检查覆盖：Homepage / CityPage / Unknown / Witness / Footer | DevTools + 工具 | 全部页面 100% 覆盖 |
| 3.3 | 对比度特殊：A2 token `--text-primary` (Cold Light 1 档) vs `--bg-page` 冷白 | token 值计算 | ≥ 12:1（LOCKED · 设计已确保） |
| 3.4 | 焦点圈规则：所有可聚焦元素 Earth Blue 2px outline + 2px offset | `/src/styles/tokens.css` + `/src/components/ui/*.module.css` | 全局统一 |
| 3.5 | 焦点圈 `:focus-visible` 支持（键盘才显示，鼠标点击不显示） | Chrome DevTools | 鼠标点击无焦点圈；键盘 Tab 有焦点圈 |
| 3.6 | Reduced Motion：CSS `@media (prefers-reduced-motion: reduce)` 应用 | `/src/styles/globals.css` + 各组件 CSS | 动效降级为 opacity / 静态 |
| 3.7 | Reduced Motion 覆盖：Hero 渐入 / Live Events 时间滚动 / Unknown Reveal 阶段切换 / CityPage 屏切换 | 组件级检查 | 全部支持 `reduce` |
| 3.8 | Reduced Motion 测试：macOS `System Preferences > Accessibility > Display > Reduce motion` 开启后验证 | macOS 实测 | 动效降级生效 |

**Owner**：Design + Front-end Engineering  
**配套子清单**：[accessibility-audit-v1.md](./accessibility-audit-v1.md) §2 + §4

**规则文档**（待 QA 在子清单固定）：

```text
文字对比度
  · 普通文字（< 18pt / < 14pt bold） ≥ 4.5:1
  · 大字号（≥ 18pt / ≥ 14pt bold）   ≥ 3:1
  · UI 组件 / 图形对象                   ≥ 3:1

焦点圈
  · 颜色:Earth Blue (VF 1.2 token --earth-blue)
  · 宽度:2px
  · offset:2px
  · 仅 :focus-visible(键盘焦点)显示,鼠标点击不显示
  · 优先级:global rule → 组件级 :focus 禁用覆盖

Reduced Motion
  · @media (prefers-reduced-motion: reduce) 包裹所有 transition / animation
  · 降级为:opacity / 0ms / none
  · 不破坏信息层级(进度条 / Loading 仍可见)
```

**自验收**：

- [ ] axe-core 对比度违规 = 0
- [ ] 焦点圈规则文档化 + 全局应用
- [ ] Reduced Motion 实测通过（macOS + Windows）
- [ ] 5 大板块全部支持 reduce

---

### AC #4 · A1 / A2 在 P0 路径无不可读或品牌漂移问题

**Brief 原文**：「A1 / A2 在 P0 路径无不可读或品牌漂移问题」

**验证方法**

| 步骤 | 操作 | 工具 | 期望 |
|---|---|---|---|
| 4.1 | A2 Visual Foundation v1.2 token 在 P0 页面应用 | `/src/styles/tokens.css` + 6 个 Home 组件 + 4 个 CityPage 组件 + Unknown | token 一致 |
| 4.2 | 检查 A2 主色 Earth Blue 在所有页面统一 | DevTools computed style | `--earth-blue` = `#0B4A6F` 等 LOCKED 值 |
| 4.3 | 检查冷白底色：`--bg-page` 应用 | DevTools | 冷白底色一致 |
| 4.4 | 检查字体：Display Serif / Editorial Italic / Mono 在正确位置 | 视觉 + computed style | 4 套字体 LOCKED |
| 4.5 | 检查 4px Base Grid：所有 spacing 8px 倍数 | DevTools inspector | 间距合规 |
| 4.6 | 检查三套 Layer 主色：Blue Kyoto / Yellow Lisbon / Red Khartoum | 三城 CityPage 视觉 | Layer 色 LOCKED |
| 4.7 | A1 残留检查（V1 仅用 A2，不应有 A1）：`grep -rn "A1\|A-1\|Direction A1" src/` | shell grep | 应为 0 匹配（仅历史注释可保留） |
| 4.8 | 品牌漂移检查：所有页面 logo / 站点名「看见地球」/ SEE EARTH 一致 | 视觉 + DevTools | 无第三方品牌混入 |

**Owner**：Design Lead  
**规则**：

- ❌ 不修改 A2 tokens（强制约束）
- ❌ 不修改主蓝
- ❌ 不改字体方向
- ❌ 不改冷白底色
- ❌ 不改大标题语言
- ❌ 不改时间语言
- ❌ 不改 World Time 逻辑
- ❌ 不改图片整体调性
- ❌ 不增加新 token 类

**自验收**：

- [ ] A2 VF 1.2 12 类 token × 2 variants 全部应用
- [ ] 7 P0 页面视觉一致
- [ ] 3 Layer 三城渲染正确
- [ ] A1 无残留
- [ ] 品牌资产一致

---

### AC #5 · 图片裁切、版权 / 来源、alt 策略已标注

**Brief 原文**：「图片裁切、版权 / 来源、alt 策略已标注」

**验证方法**

| 步骤 | 操作 | 工具 | 期望 |
|---|---|---|---|
| 5.1 | 每张城市图的 `imageCredit` 字段 | `/src/data/cities.ts` | 12 城全部有 Unsplash / Pexels 摄影师 credit |
| 5.2 | Live Events 配图来源标注 | `/src/data/liveMoments.ts` + `/src/data/moments.ts` | 字段 `sources[].url` + `credit` |
| 5.3 | Hero 图 `earth-hero-original.png` 来源标注 | `/src/components/HomeHero.tsx` + 设计稿 | 来源（NASA / 公开素材）+ credit |
| 5.4 | Earth Archive 9 节点图（如有） | `/src/components/HomeEarthArchive.tsx` | 来源 + credit |
| 5.5 | `<img alt="..." />` 策略：所有图片有 alt 文本 | DevTools + axe-core | 100% 覆盖 |
| 5.6 | 装饰性图片 `alt=""`（不读屏朗读） | DevTools | SVG 装饰、icon 等 = `alt=""` |
| 5.7 | 信息性图片 alt：城市场景图 = "京都 · 鸭川 · 傍晚的灯笼" | DevTools | alt 描述场景，不冗长 |
| 5.8 | 图源版权方汇总（Privacy 页 / Footer "图源" 链接） | `/src/components/Footer.tsx` + Privacy 页面 | 提供图源清单 |
| 5.9 | 红层（Khartoum）严格 §2.8.8-2.8.11 Red Layer Ethics | v2-phase15-fixes-report.md §1 | 已删除"南郊 30 公里,一处军事据点..." |
| 5.10 | 图片裁切策略：每张图 `focus` 字段明确焦点（如 `50% 50%`） | `/src/data/cities.ts` | 100% 覆盖 |
| 5.11 | Unsplash / Pexels License 合规：所有图遵循 Unsplash License（免费商用、无署名强制但建议） | docs 验证 | 全部合规 |

**Owner**：Content / Operations + Design  
**配套子清单**：[content-freshness-v1.md](./content-freshness-v1.md) §2（来源标注） + [privacy-compliance-v1.md](./privacy-compliance-v1.md) §D（图源版权）

**图片 alt 策略文档**：

```text
1. 信息性图片(场景 / 城市 / 时刻)
   · alt 格式: "{城市} · {场景} · {时段}"
   · 示例: alt="京都 · 鸭川 · 傍晚的灯笼"

2. 装饰性图片(背景 / 渐变 / SVG 装饰)
   · alt=""

3. 功能性图片(链接 / 按钮内)
   · alt 描述功能,非外观
   · 示例: alt="进入京都城市页面"

4. Live Events 缩略图
   · alt="此刻{城市} · {分类}"
   · 示例: alt="此刻柏林 · 河岸"

5. Hero 地球图
   · alt="地球 · 当前 UTC 时刻下的明暗分布"
   · credit: NASA Visible Earth / Unsplash
```

**自验收**：

- [ ] 12 城全部有 imageCredit
- [ ] 所有 `<img>` 有 alt（信息性）或 alt=""（装饰性）
- [ ] 红层伦理 0 违规
- [ ] 图源清单可访问（Privacy / Footer）

---

### AC #6 · 所有时间明确区分 captured_at、发布时间与当地显示时间

**Brief 原文**：「所有时间明确区分 captured_at、发布时间与当地显示时间」

**验证方法**

| 步骤 | 操作 | 工具 | 期望 |
|---|---|---|---|
| 6.1 | `Moment` 类型字段含 `capturedAt` / `uploadedAt` / `publishedAt` | `/src/types/moment.ts` + `/src/types/momentEditorial.ts` | 三字段清晰区分 |
| 6.2 | Daily 12 显示时间：每条 Live Event 显式标"此刻 + 当地时区" | `/src/components/HomeLiveEvents.tsx` | 显示"柏林 04:53 (UTC+2H)" |
| 6.3 | Hero 4 角时间：Tokyo / Lisbon / Reykjavík / Cape Town 各自当地时刻 | `/src/components/HomeHero.tsx` | 当地时刻（不混 UTC） |
| 6.4 | WorldTimeRail（如果启用）：每个 cell = 当地时刻 | `/src/components/WorldTimeRail.tsx` | 当地时刻 |
| 6.5 | CityPage Hero：LOCAL ↔ YOUR 双时区 | `/src/components/UniversalArrival.tsx` | LOCAL（城市）+ YOUR（用户），不混 |
| 6.6 | Same Second 3 栏：每栏独立显示当地时刻 | `/src/components/UniversalSameSecond.tsx` | 3 栏时刻各自正确 |
| 6.7 | captured_at 在 Witness Flow Step 2 显式确认 | D-P0-02 `copy-final-v1.md` §3 | 文案："这是这张照片的拍摄时间,请确认" |
| 6.8 | "发布时间" 不出现于前端（后台记录用） | `grep -rn "published_at\|publishedAt" src/components/` | 0 匹配（仅 type 定义） |
| 6.9 | 数据原则文档：E-P0-04 captured_at / uploaded_at / published_at 隔离 | 见 `/release-v1/vertical-slice-phase1/api-implementation-v1.md` | 已 LOCKED |
| 6.10 | UTC 储存 + 当地显示：所有日期 UTC 储存 + 前端按 timezone 转换 | `/src/lib/time.ts`（如有） | 转换正确 |

**Owner**：Engineering + Design  
**文案规则**：

```text
1. Front-end 时间显示(用户可见):
   · "此刻 + 当地时区"(如 "柏林 04:53 · 当地")
   · 或 "LOCAL 21:53 ↔ YOUR 20:53" 双时区
   · 或 "{城市} · 8 月 17 日 · 清晨"(CityPage 文案调性)

2. 后端时间字段(用户不可见):
   · captured_at:拍摄时刻(UTC)
   · uploaded_at:上传时刻(UTC)
   · published_at:发布时刻(UTC)

3. ❌ 禁止:
   · 混用 UTC 与当地时间
   · 把"发布时间"显示给用户
   · 用 NOW (1h 窗口) 暗示一定是"这一刻"
```

**自验收**：

- [ ] `Moment` 三字段清晰（type 定义）
- [ ] 前端不显示发布时间
- [ ] 所有显示时间含时区或"当地"标识
- [ ] Witness 提交前 captured_at 显式确认
- [ ] E-P0-04 数据原则对齐

---

### AC #7 · 公开位置只显示城市级信息

**Brief 原文**：「公开位置只显示城市级信息」

**验证方法**

| 步骤 | 操作 | 工具 | 期望 |
|---|---|---|---|
| 7.1 | 公共 API payload 不含精确 GPS | DevTools Network 面板 + E-P0-05 隔离测试 | 0 精确 lat/lon |
| 7.2 | 公共 Moment payload 仅含 `cityId` + 经批准的城市级信息 | `/src/types/moment.ts` | 字段白名单 |
| 7.3 | Live Events 行：经纬度仅显示"近似坐标（如 52°31'N · 13°24'E）"或隐藏 | `/src/components/HomeLiveEvents.tsx` | 模糊化或仅城市名 |
| 7.4 | 12 Coordinates 不显示每城精确 GPS | `/src/components/HomeCoordinates.tsx` | 仅城市名 + 国家 + 时刻 |
| 7.5 | CityPage Arrival：经纬度 `CoordinateWindow` 用 `23° N · 102° W` 模糊化 | `/src/components/UniversalArrival.tsx` | 整数度或十进制 2 位（不暴露住址） |
| 7.6 | Same Second 3 栏：远端 cell 仅显示城市名 | `/src/components/UniversalSameSecond.tsx` | 不显示远端精确坐标 |
| 7.7 | Witness 提交后公开预览：仅"城市 + 国家" | D-P0-02 `copy-final-v1.md` §6 | 不显示 GPS / 街道 |
| 7.8 | `localStorage` / Cookies / Analytics 不含精确 GPS | DevTools Application 面板 + E-P0-07 数据原则 | 0 精确位置 |
| 7.9 | 公开图片（Unsplash）不含 GPS（确保 EXIF GPS 已 strip） | E-P0-05 服务端 | 0 GPS EXIF |
| 7.10 | Privacy 页面明确说明：精确位置仅审核 / 不公开 | `/src/pages/Privacy.tsx` (NEEDS LOCK) | 文案 LOCKED |

**Owner**：Engineering + Design + Privacy / Legal  
**配套子清单**：[privacy-compliance-v1.md](./privacy-compliance-v1.md) §A + §C

**位置精度规则文档**：

```text
1. 公开位置精度上限
   · 城市级:city name + country(必要)
   · 区域级(可选):country region / district(可选)
   · 近似坐标:整数度(如 52°N 13°E)或十进制 2 位
   · ❌ 禁止:小数 4-6 位 / 街道 / 门牌 / 推断住址

2. 精确位置用途(私密,仅后台)
   · 拍摄时间验证
   · 风险控制(暴力 / 安全事件)
   · 滥用检测
   · 留存期限 ≤ 90 天,审核发布后 30 天清除(待 E-P0-05 LOCK)

3. ❌ 禁止场景
   · 公共 API payload
   · 公共图片 EXIF
   · Analytics 埋点
   · 公开缓存 / CDN
   · 普通日志
```

**自验收**：

- [ ] 公共 API / payload 0 精确 GPS
- [ ] Live Events / 12 Coordinates / CityPage / Unknown 0 精确 GPS
- [ ] 公开图片 EXIF GPS 已 strip（E-P0-05 验证）
- [ ] Privacy 页文案明确「精确位置仅审核 / 不公开」

---

### AC #8 · Loading / Error / Empty / Permission / Privacy 状态齐全

**Brief 原文**：「Loading / Error / Empty / Permission / Privacy 状态齐全」

**验证方法**

| 步骤 | 操作 | 工具 | 期望 |
|---|---|---|---|
| 8.1 | Daily 12 Loading：首次加载骨架 + 文案"此刻,正在加载远方" | `/src/components/HomeCoordinates.tsx` | 骨架（非 spinner） |
| 8.2 | Daily 12 Error：API 失败 + 重试 CTA + 报错 ID | `/src/components/HomeCoordinates.tsx` | "远方暂时连不上" |
| 8.3 | Daily 12 Empty：极端情况 fallback | D-P0-04 state matrix | 留白 + 诗意短句 |
| 8.4 | Moment Loading / Error / Empty：图片加载失败、撤下、待核验 | `/src/components/UniversalOneScene.tsx` | 三态齐全 |
| 8.5 | City 5 State A-E：Seed / Active / Low / Past-only / Empty | `cityPageRenderPlan.ts` | 5 State LOCKED |
| 8.6 | Unknown Loading / Reveal 中断恢复 / Empty（题目耗尽） | `/src/components/UnknownCoordinate.tsx` | 三态齐全 |
| 8.7 | Witness 6 段 × 5 状态：见 D-P0-02 `state-matrix-v1.md` | D-P0-02 子清单 | 30+ 状态 100% 覆盖 |
| 8.8 | Echo Input 5 态：default / hover / focus / typing / submitted | `/src/components/UniversalEcho.tsx` | LOCKED ✓ |
| 8.9 | Permission 状态：相机 / 相册 / 位置 / 通知 denied / restricted 安全降级 | D-P0-02 §1 | 不强制授权 |
| 8.10 | Privacy 状态：Witness 提交前精确位置说明 | D-P0-02 §6 | 隐私文案 LOCKED |
| 8.11 | 全局 Loading / Error：网络 5xx / 4xx 兜底 | `/src/components/AppShell.tsx` 或 `/src/App.tsx` | 通用兜底 |
| 8.12 | 空状态文案规则：不诱导继续刷（State E Empty） | LOCKED §1.4 | LOCKED ✓ |

**Owner**：Design + Front-end Engineering  
**配套子清单**：[placeholders-audit-v1.md](./placeholders-audit-v1.md) §A（状态文案审计）

**5 类状态矩阵交叉表**：

| 对象 | Loading | Error | Empty | Permission | Privacy |
|---|---|---|---|---|---|
| Daily 12 | ✅ | ✅ | ✅ | — | — |
| Moment | ✅ | ✅ | ✅ | — | — |
| City (5 State) | ✅ | ✅ | ✅ (State E) | — | — |
| Unknown | ✅ | ✅ | ✅ | — | — |
| Witness (6 段) | ✅ | ✅ | — | ✅ (相机/相册/位置/通知) | ✅ |
| Echo Input | — | ✅ | — | — | — |
| Global / Nav | — | ✅ | — | — | — |

**自验收**：

- [ ] 5 类状态 × 6 对象 = 30 单元格，每格 LOCKED 或显式 N/A
- [ ] D-P0-04 系统状态清单覆盖全部 30 单元格
- [ ] State E Empty 不诱导继续刷
- [ ] Permission 状态无强制授权

---

### AC #9 · Alpha / Beta 内部标识不会进入 Launch Candidate

**Brief 原文**：「Alpha / Beta 内部标识不会进入 Launch Candidate」

**验证方法**

| 步骤 | 操作 | 工具 | 期望 |
|---|---|---|---|
| 9.1 | Alpha Banner：检查 `https://sethearth-git-alpha-seethearth.vercel.app/` 是否显示 Alpha Banner | DevTools + D-P0-03 状态规范 | LC 部署必须移除 |
| 9.2 | Beta Banner：Closed Beta 部署是否有 Beta Banner | D-P0-03 状态规范 | LC 部署必须移除 |
| 9.3 | "测试中" / "Alpha" / "Beta" 字样全文检索 | `bash scripts/check-placeholders.sh` | 0 匹配（LC build） |
| 9.4 | Feedback 入口："Report a bug" / "测试反馈" 在 LC 是否仍显示 | D-P0-03 feedback-entry-v1 | LC 替换为正式 "Feedback" 或 contact@see-earth |
| 9.5 | "Data may reset" / "测试数据可能重置" 提示 | D-P0-03 alpha-banner-v1 | LC 移除 |
| 9.6 | 受限入口（invitation-only） | D-P0-03 alpha-readme | LC 改为开放 |
| 9.7 | `VITE_ENV` 在 LC = "production" | `/src/lib/analytics/schema.ts` app_surface tag | production 值 |
| 9.8 | Analytics 流量过滤：Alpha / Beta 测试事件在 production analytics 中过滤 | E-P0-07 instrumentation | 已实现 |
| 9.9 | `import.meta.env.VITE_APP_TAG` 在 LC = "launch-candidate" 或 "production" | `/src/config.ts`（如有） | 正确 tag |
| 9.10 | 文案审计：所有 "（测试中）" / "[Beta]" / "（Alpha）" 字样 | `grep -rn "测试中\|Alpha\|Beta\|Beta 测试" src/` | 0 匹配 |

**Owner**：PM + Design + Engineering  
**配套子清单**：[placeholders-audit-v1.md](./placeholders-audit-v1.md) §B + §C

**Alpha / Beta / LC 状态对照表**：

| 项 | Internal Alpha | Closed Beta | Launch Candidate |
|---|---|---|---|
| 顶部 Banner | ✅ "Internal Alpha · 数据可能重置" | ✅ "Closed Beta · 邀请制" | ❌ 移除 |
| Feedback 入口 | ✅ "Report bug" | ✅ "Report bug" | ✅ "Feedback" / contact@see-earth.com |
| 入口限制 | ✅ 邀请码 / IP 白名单 | ✅ 邀请码 | ❌ 开放 |
| "测试中" 字样 | ✅ 出现 | ✅ 出现 | ❌ 0 出现 |
| 数据重置提示 | ✅ 出现 | ⚠️ 可选 | ❌ 移除 |
| VITE_ENV | `alpha` | `beta` | `production` |
| Analytics 测试过滤 | ✅ 过滤 | ✅ 过滤 | ❌ 不过滤（真实数据） |

**自验收**：

- [ ] LC build 中 Alpha / Beta Banner 0 渲染
- [ ] LC 文案 0 "测试中" / "Alpha" / "Beta" 字样
- [ ] LC Feedback 入口为正式联系方式
- [ ] VITE_ENV = production
- [ ] Analytics 过滤关闭（真实数据）

---

### AC #10 · 无 lorem ipsum、占位图、假 CTA、未定义链接

**Brief 原文**：「无 lorem ipsum、占位图、假 CTA、未定义链接」

**验证方法**

| 步骤 | 操作 | 工具 | 期望 |
|---|---|---|---|
| 10.1 | Lorem ipsum 全文检索 | `bash scripts/check-placeholders.sh` | 0 匹配 |
| 10.2 | "占位" / "待补" / "占位图" 字样 | 同上 | 仅允许 State E Empty 设计性占位文案 |
| 10.3 | Khartoum "(待补 · 占位)" 字样是否仍在前端渲染 | `grep -rn "待补" src/components/` | LC build 必须替换为真实数据或 "Coming soon" |
| 10.4 | 假 CTA：`href="#"` / `href="javascript:void(0)"` / `<button>` 无 handler | `grep -rn "href=\"#\"\|void(0)\|href='javascript'" src/` | 0 匹配 |
| 10.5 | 未定义链接：`/about` / `/privacy` / `/witness` 路由可达 | DevTools Network | 200 OK |
| 10.6 | 锚点链接：`#archive` `#events` `#cities` `#my-coordinates` `#spotlight` 全部命中 | top-nav-fix-report.md §验证 | 5 锚点全部可达 |
| 10.7 | 404 页面：访问 `/cities/nonexistent` 显示友好 404 + 返回首页 CTA | `/src/pages/NotFound.tsx`（如有）+ `/src/components/CityPage.tsx` 兜底 | 友好文案 |
| 10.8 | 跨域链接 `rel="noopener noreferrer"` | `grep -rn "target=\"_blank\"" src/` | 100% 配对 rel |
| 10.9 | 占位图：`/public/images/` 不含 placeholder.png / dummy.jpg | `ls public/images/cities/*/` | 仅真实摄影 |
| 10.10 | SVG 占位：`grep -rn "<rect.*placeholder\|placeholder.svg" src/` | shell | 0 匹配 |
| 10.11 | TODO / FIXME 全文检索 | shell grep | 0 匹配（生产 build） |
| 10.12 | Khartoum 红色 Layer `(Red Layer · 占位)` 字样 | `HomeWorldsCollide.tsx:118` | LC 必须替换 |

**Owner**：Design + Content + Engineering  
**配套子清单**：[placeholders-audit-v1.md](./placeholders-audit-v1.md)（本 AC = 该文件核心内容）

**自验收**：

- [ ] Lorem ipsum 0 匹配
- [ ] TODO / FIXME 0 匹配
- [ ] 占位图 0 匹配
- [ ] 假 CTA 0 匹配
- [ ] 未定义链接 0
- [ ] 5 锚点全部命中
- [ ] 404 页面友好
- [ ] 跨域链接 100% rel 属性
- [ ] Khartoum 占位文案已替换

---

## 3. 5 类辅助检查（任务卡扩展 · 非 Brief 但必要）

### 3.1 文案审计（任务卡 §B）

- 见 [placeholders-audit-v1.md](./placeholders-audit-v1.md)
- 涵盖：「测试中」/「Alpha」/「Beta」/「TODO」/「FIXME」/「Lorem」/「南郊 30 公里...」/「(待补 · 占位)」
- 含 `scripts/check-placeholders.sh` 自动检查脚本

### 3.2 URL / 路由审计（任务卡 §C）

- 见 [url-routing-audit-v1.md](./url-routing-audit-v1.md)
- 涵盖：5 内部锚点、404 页面、跨域 rel 属性
- 含 7 P0 路由清单 + 5 锚点检查表

### 3.3 隐私 / 合规（任务卡 §D）

- 见 [privacy-compliance-v1.md](./privacy-compliance-v1.md)
- 涵盖：About / Method / Privacy 三页、Cookie 提示、第三方图源、数据收集、联系方式

### 3.4 可访问性（任务卡 §E）

- 见 [accessibility-audit-v1.md](./accessibility-audit-v1.md)
- 涵盖：对比度、键盘、焦点、alt、Reduced Motion、ARIA

### 3.5 内容时效（任务卡 §F）

- 见 [content-freshness-v1.md](./content-freshness-v1.md)
- 涵盖：测试图替换、Khartoum 占位、12 城 URL、Live Events 争议内容

---

## 4. 与 Brief §4 其他任务的依赖关系

| 上游任务 | 关系 | 本卡如何使用 |
|---|---|---|
| D-P0-01 LOCKED ✓ | 22 LOCKED 项提供唯一 source of truth | AC #1 验证基线 |
| D-P0-02 IN REVIEW | Witness Flow 6 段 + 5 状态 | AC #8 Witness 状态、AC #7 公开预览 |
| D-P0-03 IN PROGRESS | Alpha / Beta 状态规范 | AC #9 LC 移除 Banner |
| D-P0-04 IN PROGRESS | Loading / Error / Empty / Permission / Privacy 状态 | AC #8 状态齐全 |
| D-P0-05 IN REVIEW | Analytics Events Map | AC #9 流量过滤 |
| E-P0-04 数据原则 | captured_at / uploaded_at / published_at | AC #6 时间区分 |
| E-P0-05 位置隔离 | 公共 / 后台位置分离 | AC #7 位置精度 |
| E-P0-07 Analytics | 流量过滤 + 字段禁止 | AC #9 VITE_ENV 验证 |

---

## 5. Gate C 签字流程

| 步骤 | 角色 | 检查项 | 签字位置 |
|---|---|---|---|
| 5.1 | Design Lead | 10 项 AC 视觉 / 文案检查 | sign-off-template-v1.md §A |
| 5.2 | Engineering Lead | 10 项 AC 工程实现 / build / 测试 | sign-off-template-v1.md §B |
| 5.3 | Content / Operations | 文案 / 图源 / 数据 / 城市可用性 | sign-off-template-v1.md §C |
| 5.4 | PM（Orchestrator） | 全局风险评估 / 业务可发布性 | sign-off-template-v1.md §D |
| 5.5 | 4 角色全部签字 → Gate C PASS | — | — |

签字模板：[sign-off-template-v1.md](./sign-off-template-v1.md)

---

## 6. 强制约束（自验收对照）

- [ ] **不修改 A2 tokens**（AC #4 强制）
- [ ] **不修改 14 LOCKED 组件 props / API**（D-P0-01 LOCKED §6）
- [ ] **不引入新依赖**（Brief §11）
- [ ] **不实现后端**（本卡仅设计文档）
- [ ] **不引入 Phase 2 范围**（Brief §6 明确）
- [ ] **不删除 / 添加新功能**（仅 audit + 清单）
- [ ] **不删除 / 改 LOCKED 页面**（Brief §6 · Scope Freeze）

---

## 7. 已知偏差 / 风险（来自 Gate A 验收）

| # | 偏差 | 严重度 | 来源 | Gate C 是否必须闭合 |
|---|---|---|---|---|
| 1 | 移动端 7 项导航水平拥挤（无汉堡菜单）| 🟡 Major | gate-a-visual-acceptance.md | ⚠️ 必须（影响 AC #2 触屏命中区） |
| 2 | `#spotlight` 无目标（Spotlight 板块未实现）| 🟡 Major | gate-a-visual-acceptance.md | ⚠️ 必须（影响 AC #10 锚点） |
| 3 | Khartoum 数据缺（`cities.ts` 11 城）| 🟡 Major | gate-a-visual-acceptance.md | ⚠️ 必须（影响 AC #10 占位文案） |
| 4 | 锚点滚动时标题被 fixed nav 遮住顶部 72px | 🟢 Minor | gate-a-visual-acceptance.md | 建议（影响 AC #10 锚点可用性） |
| 5 | 3 个 `#cities` `#my-coordinates` 等价 span | 🟢 已 work | gate-a-visual-acceptance.md | 通过（top-nav-fix-report.md 已修） |

---

## 8. PM 验收 checklist

- [ ] **Brief §D-P0-06 AC 10 项全部覆盖**（§2）
- [ ] **占位文案审计清单完整**（placeholders-audit-v1.md）
- [ ] **URL / 路由审计清单完整**（url-routing-audit-v1.md）
- [ ] **隐私 / 合规清单完整**（privacy-compliance-v1.md）
- [ ] **可访问性清单完整**（accessibility-audit-v1.md）
- [ ] **内容时效清单完整**（content-freshness-v1.md）
- [ ] **签字模板可执行**（sign-off-template-v1.md · 4 角色）
- [ ] **不修改 14 LOCKED 组件**（强制约束）
- [ ] **不修改 A2 tokens**（强制约束）
- [ ] **文档完整可执行**（7 份交付物）

---

**End of checklist-v1.md · D-P0-06 主交付物**
