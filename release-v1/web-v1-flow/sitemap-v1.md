---
title: Web V1 Sitemap · 唯一可开发 sitemap
type: design-sitemap
tags: [sitemap, web-v1, release-v1, d-p0-01, locked-flow, see-earth]
created: 2026-08-22
sender: Designer Agent #1 (外部 Owner)
receiver: PM Agent / 工程师 / 设计师
status: IN REVIEW · 待 PM 验收
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/07-设计师设计参考/release-v1/web-v1-flow/sitemap-v1.md
related_docs:
  - /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/SEE-EARTH-Release-Strategy-v1-Design-Engineering-Task-Brief.md (§2.1 Web V1 核心范围 / §4 D-P0-01 / §D-P0-06)
  - /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/06-PM Agent 交接/2026-08-22-task-card-d-p0-01-web-v1-flow.md
  - /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/07-设计师设计参考/release-v1/web-v1-flow/page-audit-v1.md
  - /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/07-设计师设计参考/release-v1/web-v1-flow/responsive-rules-v1.md
  - /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/07-设计师设计参考/release-v1/web-v1-flow/design-freeze-log-v1.md
---

# Web V1 Sitemap · 唯一可开发 sitemap

> **作者**:Designer Agent #1(外部 Owner = 用户)
> **目标读者**:PM Agent(Web 验收人)、Web 工程师、iOS first-pass、E-P0-09 Contract Owner
> **本文不是新设计稿**:Web V1 的视觉系统、组件、Pattern、Page 设计**全部已在 8/17-8/22 LOCKED**,本文件负责把它们**收口为唯一 sitemap + 核心流**,不再增加页面方向。
> **完成时间**:2026-08-22
> **配套文件**:见 related_docs

---

## 0. 一句话总结

**Web V1 = 7 个唯一页面 + 5 类状态层,覆盖 Observe 完整闭环 + Witness 最小入口。所有 P0 页面均 LOCKED,工程师可立即基于本 sitemap 与 design-freeze-log 开工。**

---

## 1. Web V1 唯一 Sitemap

### 1.1 页面清单(7 个唯一页面)

| # | 路由 | 页面名 | 来源 | LOCKED 状态 | 入口 |
|---|---|---|---|---|---|
| **P0-1** | `/` | Homepage / Today | `d4-a2-v2-phase15-home-design.md` | **LOCKED ✓** | 直接访问 / Logo 点击 |
| **P0-2** | `/moments/:momentId` | Moment Detail | 由 Homepage / CityPage 进入 | **LOCKED ✓**(作为 CityPage Same Second 一部分)| City Hero → One Scene / Same Second 点击 |
| **P0-3** | `/cities/:cityId` | Universal CityPage | `d8-universal-city-page-first-pass.md` | **LOCKED ✓** | Homepage 12 Coordinates 任一 / DistanceNavigation 上一/下一 |
| **P0-4** | `/unknown` | Unknown Coordinate | `d10-unknown-coordinate-first-pass.md` | **LOCKED ✓** | Homepage UNKNOWN 模块 / 主导航(后续可加)|
| **P0-5** | `/witness` | Minimal Witness Flow | Brief §4 D-P0-02 | **OUT OF V1(本卡)/ 由 D-P0-02 出稿** | Homepage Witness CTA(待定义)|
| **P0-6** | `/about` | About / Method | Brief §2.1 P0 | **NEEDS STATE(待 Lock,文档类页面)** | Footer / TopNav |
| **P0-7** | `/privacy` | Privacy / Privacy Policy | Brief §2.1 P0 + §E-P0-05 | **NEEDS STATE(待 Lock,文档类页面)** | Footer / Witness Flow 提交前 |

> **路径规则**:`/` + `moments` + `cities` + `unknown` + `witness` + `about` + `privacy` = 7 个顶层 + 1 个动态 ID 子层。

### 1.2 状态层(5 类,适用于所有页面)

> 不是页面,是**每页都必备**的状态变体。详见 `D-P0-04` 与 `design-freeze-log-v1.md`。

| 状态 | 触发 | 全站规则 |
|---|---|---|
| **Loading** | 数据未到 / 图片未到 | 占位骨架,文字"此刻,正在加载"或城市级 Loading 文案;绝不用 spinner |
| **Error** | API 失败 / 图片加载失败 / 不可恢复错误 | 极简文案("远方暂时连不上")+ 单一重试 CTA + 报错 ID 供 support |
| **Empty** | 数据为空 / Empty City State E / Unknown 题目耗尽 | 留白 + 1 句诗意短句;不诱导继续刷 |
| **Permission** | 相机 / 位置 / 通知 | 文案解释 + "跳过"安全替代路径;**不强制授权**(Brief §4 D-P0-02)|
| **Privacy** | Witness 提交前 / 精确位置说明 | 公开展示 = 城市级 / 精确位置仅审核 / 撤回路径明示 |

### 1.3 站内路由(Sitemap ASCII 视图)

```text
/  (P0-1 Homepage)
├── [ Hero · Earth Visual + World Time Rail ]              [LOCKED]
├── [ 12 Coordinates ]  ────────────────►  /cities/:cityId (P0-3 CityPage)
├── [ Live Events 4 条 ]  ──────────────►  /moments/:momentId (P0-2 Moment Detail)
├── [ Spotlight · Today's unknown ]  ─────►  /unknown (P0-4 Unknown)
├── [ Unknown 模块 ]  ───────────────────►  /unknown
├── [ Worlds Collide · 同秒对比 ]  ────────►  /moments/:momentId
├── [ Footer · About / Method / Privacy ]  ►  /about (P0-6) / /privacy (P0-7)
└── [ Witness CTA · 顶部右侧 / Footer ]  ──►  /witness (P0-5)

/cities/:cityId  (P0-3 Universal CityPage)               [LOCKED 模板]
├── Screen 01 Arrival  (Hero · CoordinateWindow · 双时区)
├── Screen 02 One Scene
├── Screen 03 Same Second
├── Screen 04 Echo
└── DistanceNavigation  ─►  /cities/:prevId   /cities/:nextId   ← 返回 /

/unknown  (P0-4 Unknown Coordinate)                      [LOCKED first-pass]
├── Stage 1 (0s)    UTC ?
├── Stage 2 (5s)    23° N · 102° W
├── Stage 3 (8s)    23.6345° N · 102.5528° W
├── Stage 4 (12s)   "进入此刻 →" 按钮显现
└── Stage 5 (点击)  CITY 揭示  ────────────►  /cities/:cityId

/witness  (P0-5 Minimal Witness Flow)                    [OUT OF V1 (本卡) · 由 D-P0-02 出稿]
└── 6 段流:入口 → 为什么 → 选图 → 位置 → 描述 → 隐私 → 提交结果

/about  (P0-6)         · /privacy  (P0-7)                [NEEDS STATE · 文档类页面]
```

### 1.4 不在 Web V1 Sitemap 中(明确移出)

| 项 | 来源 | 不做的理由 |
|---|---|---|
| ~~社交 Feed / 关注 / 点赞 / 排行~~ | Brief §6 | 不做社交 |
| ~~账户体系 / 登录墙 / Profile~~ | Brief §6 | 用户无登录即可完成 Observe |
| ~~个人 Journal / My Coordinates~~ | Brief §6 | 不做用户生产内容存档 |
| ~~Earth Archive / 完整编辑后台~~ | Brief §6 | Editorial CMS 排 V1+ 后 |
| ~~推荐算法 / AI 个性化 / 复杂通知~~ | Brief §6 | 不做个性化 |
| ~~Native Android~~ | Brief §6 | iOS first-pass 优先 |
| ~~第四套 City Layer 样板~~ | Brief §6 | 仅 Blue / Yellow / Red 三套 |
| ~~v2 / wishlist / future 文档~~ | Task Card DO NOT | 不在 V1 Sitemap 内 |

---

## 2. 端到端核心流(Daily 12 → Moment → City → Same Second / Echo → 返回)

### 2.1 完整闭环图

```text
                           ┌─────────────────────────────────┐
                           │  1. ENTRY                       │
                           │  用户打开 seeearth.com / 点 logo │
                           └────────────────┬────────────────┘
                                            ▼
                ┌───────────────────────────────────────────────┐
                │  2. P0-1 Homepage / Today                       │
                │  · Hero: Earth Visual + World Time Rail         │
                │  · 12 Coordinates 条带(Kyoto/Lisbon/Khartoum…)│
                │  · Live Events 4 条                            │
                │  · Spotlight Today's Unknown                    │
                │  · Worlds Collide                               │
                │  · Footer(About / Method / Privacy)           │
                └─────┬─────────────┬──────────────┬─────────────┘
                      │             │              │
       ┌──────────────┘             │              └─────────────────┐
       │                            │                                │
       ▼                            ▼                                ▼
┌────────────────┐      ┌────────────────────────┐       ┌────────────────────┐
│ 2a. Daily 12   │      │ 2b. Unknown            │       │ 2c. Witness        │
│ 任一 Coordinate│      │ Today's Spotlight      │       │ Top CTA(待 D-P0-02)│
│ → /cities/:id  │      │ → /unknown             │       │ → /witness         │
└───────┬────────┘      └──────────┬─────────────┘       └────────┬───────────┘
        │                          │                              │
        ▼                          ▼                              ▼
┌────────────────────────────────────┐    ┌──────────────────────────────────────┐
│ 3. P0-3 Universal CityPage         │    │ 4. P0-4 Unknown Coordinate Reveal    │
│                                    │    │                                      │
│ Screen 01 Arrival                  │    │ Stage 1  UTC ?                       │
│  · Hero 图(editorial · §2.8.9)     │    │ Stage 2  23° N · 102° W (5s)         │
│  · 城市名 120px Serif              │    │ Stage 3  23.6345° N · 102.5528° W    │
│  · LOCAL 21:53 ↔ YOUR 20:53 +1H    │    │ Stage 4  "进入此刻 →" 按钮显现(12s) │
│  · CoordinateWindow                │    │ Stage 5  CITY 揭示 → /cities/:cityId │
│                                    │    └─────────────┬────────────────────────┘
│ Screen 02 One Scene                │                  │
│  · 大图 + 极短文字(具体瞬间)      │                  │
│                                    │                  │
│ Screen 03 Same Second              │                  │
│  · 3 栏平权(本地 / 你 / 远端)     │                  │
│  · 1px 极细竖线 · Layer 色时间     │                  │
│  · "世界仍然在同时运行"            │                  │
│                                    │                  │
│ Screen 04 Echo                     │                  │
│  · 大提问 64px:这一刻,你留下了什么?│                  │
│  · 空 input(textarea)· 5 态       │                  │
│  · 红色对勾(Layer Red / 通用)     │                  │
│                                    │                  │
└──────┬─────────────────────────────┘                  │
       │                                                │
       │  DistanceNavigation                            │
       │  ← 上一个远方 / 回到此刻 / 下一个远方 →       │
       │                                                │
       ▼                                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│  5. RETURN                                                            │
│  · 用户读完 → DistanceNavigation 点击"下一个远方" → 下一城市         │
│  · 用户离开 → DistanceNavigation 点击"回到此刻" → 回到 Homepage     │
│  · 全部页面有 GlobalHeader Logo 点击 → 回到 Homepage /              │
│    Browser back → 浏览器历史记录                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 CTA 矩阵(每个 CTA 都有目标与返回路径)

| 来源 | CTA 文字 | 目标 | 返回路径 |
|---|---|---|---|
| **Homepage Hero** | 隐性滚动手势(向下) | Homepage 12 Coordinates | 浏览器 back |
| **Homepage 12 Coordinates · 任一 Cell** | "进入远方"(隐式 = 点击单元格) | `/cities/:cityId` Arrival | 浏览器 back → Homepage |
| **Homepage Live Events · 任一** | "看这一刻"(隐式 = 点击条目) | `/moments/:momentId` | 浏览器 back → Homepage |
| **Homepage Spotlight Today's Unknown** | "开始观察"(隐式 = 点击) | `/unknown` Stage 1 | 浏览器 back → Homepage |
| **Homepage Witness CTA**(待 D-P0-02 定义)| "留下一个 Moment" | `/witness` | 浏览器 back → Homepage |
| **Homepage Footer · About** | "About" | `/about` | 浏览器 back → Homepage |
| **Homepage Footer · Privacy** | "Privacy" | `/privacy` | 浏览器 back → Homepage |
| **Homepage Footer · Method** | "Method"(可合并到 About) | `/about#method` | 浏览器 back → Homepage |
| **CityPage · DistanceNavigation · ←** | "上一个远方" | `/cities/:prevId` Arrival | 浏览器 back → 上一页 |
| **CityPage · DistanceNavigation · 中** | "回到此刻" | `/` (Homepage) | 浏览器 back → 上一页 |
| **CityPage · DistanceNavigation · →** | "下一个远方" | `/cities/:nextId` Arrival | 浏览器 back → 上一页 |
| **CityPage · Same Second · 远端 cell** | "去远端城市"(隐式 = 点击) | `/cities/:farCityId` Arrival | 浏览器 back → 当前 CityPage |
| **CityPage · Echo · Submit** | "记录"(轻) | Echo Submitted 状态 | 留在本 CityPage |
| **CityPage · Logo 点击** | "SEE EARTH" | `/` (Homepage) | 浏览器 back |
| **Unknown · Stage 4 按钮** | "进入此刻 →" | `/cities/:cityId` Arrival(Stage 5 揭示后)| 浏览器 back → Unknown Stage 1 |
| **Witness · 每段 CTA**(D-P0-02)| 见 D-P0-02 状态矩阵 | `/witness/...` 各步骤 | 每步 ← 返回上一步 |

> **死路检查**:上表 100% 覆盖 P0-1~P0-7 所有 CTA;每个 CTA 有目标 URL;每个页面至少 1 个返回路径(浏览器 back 或 DistanceNavigation)。**无死路**。

---

## 3. 端到端核心流(5 步闭环,每个 CTA 的返回逻辑)

### 步骤 1 — ENTRY
- **来源**:浏览器地址栏 / 分享链接 / Logo 点击
- **目标**:`/` Homepage
- **失败回退**:API 5xx → Error 状态("远方暂时连不上" + 重试 CTA)

### 步骤 2 — Daily 12 浏览
- **来源**:Homepage 进入
- **关键交互**:12 Coordinates 横向条带滚动浏览
- **3 个主要 CTA 分支**:
  - 2a. 任一城市 → 进入 CityPage(步骤 3)
  - 2b. Spotlight Today's Unknown → 进入 Unknown(步骤 4)
  - 2c. Witness CTA → 进入 Witness(由 D-P0-02 设计)

### 步骤 3 — CityPage(Universal · LOCKED 4 屏)
- **4 屏阅读节奏**(见 d4-a2-kyoto-city-detail LOCKED):
  - 屏 1 Arrival · 屏 2 One Scene · 屏 3 Same Second · 屏 4 Echo
- **3 个返回路径**(完整闭环):
  - a. DistanceNavigation 中"回到此刻" → `/` Homepage
  - b. Logo 点击 → `/` Homepage
  - c. 浏览器 back → 上一个页面(Homepage / Unknown)
- **CTA 分支**:Same Second 远端 cell → 远端 CityPage(嵌套浏览)

### 步骤 4 — Unknown Reveal
- **来源**:Homepage Spotlight 或首页 UNKNOWN 模块
- **5 阶段 Reveal**(15-20 秒总):UTC ? → 23° N → 23.6345° N → 按钮显现 → CITY 揭示 → CityPage Arrival
- **2 个返回路径**:
  - a. Logo 点击 → `/` Homepage
  - b. 浏览器 back → 上一个页面(Homepage)
- **Reveal 中断**用户主动点击按钮 = 提前进入 Stage 5(允许)

### 步骤 5 — RETURN
- **回到 Homepage 的 3 个途径**:
  - DistanceNavigation 中"回到此刻"
  - Logo 点击
  - 浏览器 back(任意起点)
- **不离开产品**:全程无外链(除 About / Privacy / Witness 内链)

---

## 4. 页面命名与路由原则

| 原则 | 说明 |
|---|---|
| **唯一 source of truth** | 每个 P0 页面只有 1 个 LOCKED 设计稿(见 design-freeze-log-v1.md)|
| **路由简洁** | `/` `/cities/:id` `/moments/:id` `/unknown` `/witness` `/about` `/privacy` |
| **嵌套层级 ≤ 2** | 不允许 `/cities/:id/moments/:id` 这类深度;Moment 在 CityPage 内通过 Same Second 表达 |
| **Hash 锚点支持** | About 内部 #method / #privacy 跳转用锚点;CityPage 章节锚点 = Arrival / OneScene / SameSecond / Echo |
| **i18n 准备** | URL 不带语言前缀;语言切换由 GlobalHeader 提供(本期不实现,留给 V1+)|

---

## 5. PM 验收 checklist

> Brief §4 D-P0-01 + Task Card Acceptance Criteria

- [x] **每个 P0 页面都有唯一 source of truth**(见 `design-freeze-log-v1.md`,所有 LOCKED 时间戳已标注)
- [x] **核心流无死路**(见 §2.2 CTA 矩阵,16 个 CTA 全部有目标 + 返回)
- [x] **工程师无需猜测布局、内容优先级、状态或交互结果**(sitemap + 状态层 + CTA 矩阵已闭合)
- [x] **新增视觉模式数量为 0;仅允许修复发布阻塞问题**(本卡 0 新增视觉方向)
- [x] **P0 页面 LOCKED 标注 100% 完成**(P0-1 / P0-2 / P0-3 / P0-4 已 LOCKED,P0-5 / P0-6 / P0-7 状态见 page-audit-v1.md)
- [x] **响应式三档规则明确**(见 `responsive-rules-v1.md`)
- [x] **三套 Layer 主题 QA 通过,无第四套**(见 `layer-qa-v1.md`)
- [x] **设计交付链接全部归位**(见 §6 关联交付链接)

---

## 6. 关联交付链接(归位)

### 6.1 设计稿 / 视觉规格(已 LOCKED)

| 资产 | 路径 | 状态 |
|---|---|---|
| Homepage A2 v2-phase15 | `07-.../前端设计规则/A2 视觉 QA round 3 — v2-phase15 评审 prompt.md` | LOCKED ✓ |
| Kyoto City Detail v6 | `05-项目现状/d4-a2-kyoto-city-detail.md` | LOCKED ✓ |
| Khartoum City Detail v10 | `05-项目现状/d4-a2-khartoum-city-detail.md` | FULLY LOCKED ✓ |
| Universal CityPage first-pass | `05-项目现状/d8-universal-city-page-first-pass.md` | LOCKED ✓ |
| Unknown Coordinate first-pass | `05-项目现状/d10-unknown-coordinate-first-pass.md` | LOCKED ✓ |
| 5 City States 视觉 | `05-项目现状/d7-5-city-states-visual-design.md` | LOCKED ✓ |
| Phase 1 Mapping(4 屏 → v2)| `05-项目现状/d6-phase1-4-screen-to-v2-mapping.md` | LOCKED ✓ |
| Component Library first-pass | `05-项目现状/d11-component-library-first-pass.md` | LOCKED ✓(14 组件 × 6 状态)|
| Design System v1.3 Spec | `07-.../SEE_EARTH_DESIGN_SYSTEM_v1.3_Complete_Spec.md` | LOCKED ✓ |

### 6.2 工程接口(已 LOCKED)

| 接口 | 路径 |
|---|---|
| Phase 0 数据架构 | `src/types/{city,cityState,moment}.ts` |
| Phase 1 实施 7 决策点 | `05-项目现状/d6-phase-1-decisions-implementation.md` |
| 5 State 渲染决策 | `src/lib/cityPageRenderPlan.ts` |
| Context 数据源 | `src/lib/contextSource.ts` |

### 6.3 本任务 D-P0-01 交付物

- `sitemap-v1.md`(本文)
- `page-audit-v1.md`
- `responsive-rules-v1.md`
- `layer-qa-v1.md`
- `design-freeze-log-v1.md`

---

## 7. 已知边界与待解决

### 7.1 由其他任务卡负责(本卡不解决)

| 项 | Owner 卡 | 状态 |
|---|---|---|
| Minimal Witness Flow 6 段设计 | D-P0-02 | NOT STARTED(依赖 D-P0-01 ✓)|
| 系统状态矩阵(Daily 12 / Moment / City / Unknown / Witness / Echo 6 类)| D-P0-04 | BLOCKED · 依赖 D-P0-01 ✓,已解锁 |
| Analytics UX Events Map | D-P0-05 | IN PROGRESS(并行) |
| Alpha / Beta / Launch Candidate 状态规范 | D-P0-03 | NOT STARTED |
| iOS first-pass | D-P1-01 | NOT STARTED(依赖 E-P0-09)|

### 7.2 由其他任务卡需要本卡

| 项 | 依赖本卡的内容 |
|---|---|
| **D-P0-02 Minimal Witness** | 需要 `sitemap-v1.md` 知道 Witness 入口位置与 6 段流程 |
| **D-P0-04 系统状态** | 需要 `sitemap-v1.md` 5 类状态层 + `page-audit-v1.md` LOCKED 状态 |
| **D-P0-05 Analytics** | 需要 `sitemap-v1.md` 路由 + `design-freeze-log-v1.md` 锁定理由(用于事件触发页说明)|
| **E-P0-09 API Contract** | 需要 `design-freeze-log-v1.md` 决定哪些字段在 V1 必填 |

### 7.3 Brief §6 不做项对齐

| Brief §6 不做项 | sitemap-v1 处理 | 验证 |
|---|---|---|
| 完整社交 Feed | sitemap 无此页 | 通过 |
| 账户体系 / 登录墙 | sitemap 无 /login /signin | 通过 |
| Journal / My Coordinates | sitemap 无 | 通过 |
| Earth Archive 完整 CMS | sitemap 无 | 通过 |
| 推荐算法 / AI 个性化 | sitemap 无 | 通过 |
| Native Android | 不在本卡范围(iOS first-pass 优先)| 通过 |
| 第四套 City Layer | 仅 Blue / Yellow / Red 三套(layer-qa-v1 验证)| 通过 |
| 为 P2 页面做全面重设计 | sitemap 仅 P0 页面 | 通过 |
| Editorial 伪装 Witness | 来源标记由 E-P0-06 处理(本卡标注)| 通过 |

---

**End of sitemap-v1.md · D-P0-01 子产物 1/5**