# A2 设计实施 · Phase 2 · Hero 区域 README

> **作者**:Engineer Agent(PM Agent 委派)
> **任务卡**:Hero 区域实施 · EarthGlobe + World Time Rail(A2 设计 LOCK 补全)
> **范围**:把 `release-v1/web-v1-flow/sitemap-v1.md §1.1` 锁定的 **Hero · Earth Visual + World Time Rail** 板块**实施到 HomeShell 顶部**。
> **前置依赖**:Phase 1(token / HomeShell A2 视觉 / 14 LOCKED 组件,commit `9f24955`)✓ 已完成
> **完成时间**:2026-08-24

---

## 0. 任务一句话总结

把 HomeShell 顶部 **Hero 区域**补上两件 LOCKED 设计资产:

1. **EarthGlobe** —— 已存在组件 (`src/components/EarthGlobe.tsx`),但**从未被 HomeShell 引用**,且视觉是旧的深空暖光风格(与 A2 LOCK 的冷白 + Earth Blue 不一致)。本卡做 **视觉 A2 化调整** + **集成到 HomeShell**。
2. **WorldTimeRail** —— `src/components/ui/WorldTimeRail.tsx` 是设计系统级通用组件,**没有** `cities.ts` 实时时间计算,没有 12 城全部展示,**没有**点击跳转。本卡**新建** `src/components/WorldTimeRail.tsx` —— HomeShell 专用版:基于 `cities.ts` + `getLocalTime()` + 点击跳转 `/cities/:slug` + 三档响应式(Desktop 12 横排 / Tablet 6+6 / Mobile 横滑)。

不修改 22 LOCKED 组件 props / API;不动 routing;不动数据 schema;不动 Hero 之上(Header / Logo / Nav)及 Hero 之下(12 Coordinates / Moments Timeline / Footer)。

---

## 1. 现状差异(实施前)

### 1.1 `src/App.tsx` · HomeShell Hero 现状

| 项 | 现状 | A2 LOCK + sitemap §1.1 要求 | 差异 |
|---|---|---|---|
| 顶部 Header | ✓ logo + 3 nav + Witness CTA(在 `v2.20` 后又合并过) | 保留 | — |
| Hero 主视觉 | ❌ **完全没有 EarthGlobe** | 视觉锁定为 EarthGlobe | **缺失** |
| World Time Rail | ❌ **完全没有** | 12 城时间锁定 | **缺失** |
| Hero 标题 / 价值主张 / 搜索 / 建议 | v2.20 已加(中文"世界 · 不止方寸" + valueProp + suggestions + why details) | 保留 + 加 EarthGlobe + Rail 集成到 Hero 布局 | **缺两件** |

**注**:HomeShell 当前**没有 Hero 区域的概念分裂**——整段 `100vh` 都是 `<section class="hero">`(Header 在内 + title + value + why + scrollHint)。**保留这种"首屏一气呵成"结构**,把 EarthGlobe 放进 `heroContent`,把 WorldTimeRail 放进 `heroContent` 末尾,**scrollHint** 仍然作为视觉收尾。

### 1.2 `src/components/EarthGlobe.tsx` 现状(可视化分析)

| 维度 | 现状 | A2 LOCK 要求 | 差异 |
|---|---|---|---|
| 配色 | 深海背景(`#0a1929` 系)+ 暖光高光(`rgba(233,244,255,.35)`)+ 蓝绿海陆 | 冷白底 + Earth Blue 强调 | **暖光 → 冷光** |
| 圆角 | `border-radius: 50%`(球体)| 球体保留,但 frame 装饰去除 | 接受 |
| 字号 / 缩放 | `aspect-ratio: 1/1` + `max-width: 520px` | 三档响应式:Desktop 520px / Tablet 400px / Mobile 280px | **补响应式** |
| Animation | `earth-rotate` + `cloud-drift` + `twinkle` | 接受(连续旋转符合"世界 · 不止方寸"叙事)| 保留 |
| Box shadow | `inset shadow` + `glow-earth` | A2 LOCK 0 阴影 | **去掉 box-shadow** |
| `transform: perspective(900px) rotateX(8deg)` | 球体有透视倾斜 | 接受(让球有立体感)| 保留 |
| Stars / atmosphere 装饰 | 有 | 接受(冷色调已对齐)| 保留 |

**结论**:**改 `EarthGlobe.module.css` 用 VF 1.2 token + 0 阴影 + 三档响应式**。**不改 `.tsx` 组件结构 / props / SVG**(因为 SVG 内容是大地投影,LOCKED 部分)。

### 1.3 `src/components/ui/WorldTimeRail.tsx` 现状

| 维度 | 现状 | HomeShell 需求 | 差异 |
|---|---|---|---|
| 数据源 | `CityTime[]`(外部传入)| **直接读 `cities.ts` + `getLocalTime()`** | 缺数据绑定 |
| 城市数量 | N(外部传入)| **固定 12 城** | 缺常量 |
| 跳转 | 无(纯展示)| **点击 cell → `/cities/:slug`** | **缺交互** |
| `yourTime` 高亮 | 有 | 有 | 复用 |
| 响应式 | `overflow-x: auto`(单档)| **三档:Desktop 12 横排 / Tablet 6+6 / Mobile 横滑** | **缺三档** |
| A2 视觉 | 已用 `var(--earth-blue)` | 完整对齐 | 已对齐 |
| 测试 | 6 个状态快照测试 | **保留**(不动)| OK |

**策略**:**不修改** `src/components/ui/WorldTimeRail.tsx`(LOCKED UI 组件,Phase 1 已锁定)。**新建** `src/components/WorldTimeRail.tsx` + `.module.css` 在 `src/components/` 顶层 —— 是 **HomeShell 专用集成层**(`index.ts` 中的 `ui/WorldTimeRail` 不动)。

### 1.4 当前 `App.module.css` Hero 区域 CSS 已有结构

- `.hero`:`100svh` + `display: flex` + `flex-direction: column`
- `.heroContent`:`flex: 1` + `align-items: center` + `justify-content: center` + `gap: 18px` + `max-width: 600px`
- 已有 title / titleEm / valueProp / suggestions / why / scrollHint 等

**调整**:`.heroContent` 改为**支持 EarthGlobe + Rail 的双区结构**——地球在标题之上(或并列),Rail 在 scrollHint 之上。

---

## 2. 实施计划(7 步)

### 2.1 Phase 2.1 · 读取 + 分析(本 README ✓)

读完所有 LOCKED 设计文档 + 当前代码 → 列出差异 → 制定 7 步计划。

### 2.2 Phase 2.2 · 调整 `EarthGlobe.module.css` 视觉 A2 化

**文件**:`src/components/EarthGlobe.module.css`(仅 CSS,不动 `.tsx`)

**改动**:
- 海陆配色改为冷白底 + Earth Blue 强调:
  - `var(--land-mass)` = 新 token(冷绿蓝灰 `#7B96AE`)
  - `var(--ocean-mid)` = `#5A91D9`(Layer Blue 系)
  - `var(--ocean-deep)` = `#1A4D7E`(Earth Blue Deep)
  - `var(--space-deepest)` = `#070E14`(Cold Light 11)
  - `var(--ice-pale)` = `#EBF0F5`(Cold Light 03)
- 0 阴影:去掉 `box-shadow: inset 0 0 60px rgba(0,0,0,0.55)` + `0 0 60px var(--glow-earth)` 等装饰性 box-shadow
- 简化 atmosphere / specular / clouds 配色 → 冷白 + Earth Blue 0.1-0.2 alpha
- 三档响应式:
  - Desktop ≥ 1280:max-width 520px(保留)
  - Tablet 768-1279:max-width 380px
  - Mobile < 768:max-width 260px
- 新增 token 到 `tokens.css`(集中管理):`--ocean-mid` / `--ocean-deep` / `--land-mass` / `--ice-pale` / `--space-deepest`(这些 token 仅 EarthGlobe 用,放到 `SECTION 11 · EarthGlobe Visuals`)
- `prefers-reduced-motion` 保留(响应可访问性)

**`.tsx` 不动**:SVG paths / gradient id / animation keyframes / props API 全部保留。

### 2.3 Phase 2.3 · 创建 `src/components/WorldTimeRail.tsx`

**文件**:
- `src/components/WorldTimeRail.tsx`(新建)
- `src/components/WorldTimeRail.module.css`(新建)

**Props**:
```ts
interface Props {
  cities?: readonly City[];   // 默认 = 全 12 城
  now?: Date;                  // 默认 = new Date()(测试用)
  userTimezone?: string;       // 默认 = browser
  className?: string;
}
```

**逻辑**:
1. 接收 `cities`(默认 `import { cities } from '@/data/cities'`)
2. 接收 `now`(默认 `new Date()`),传给 `getLocalTime(city, now)`
3. 接收 `userTimezone`(默认 `Intl.DateTimeFormat().resolvedOptions().timeZone`)
4. 计算每个城市的:
   - `localTime` = `getLocalTime(city)`
   - `offset` = `+XH` 或 `-XH`(相对 userTimezone)
   - `isUserCity` = `city.timezone === userTimezone`
5. 用 `<a href={city.href}>` 渲染 12 个 cell(支持键盘 Tab + Enter)
6. 用 `aria-label` + `role="link"` 完整无障碍

**视觉**(A2 LOCK):
- 底色:`var(--bg-hero-mist)`(冷白极淡)
- 边框:1px `var(--border-hairline)`
- 圆角:0(A2 强约束)
- Cell:`font-mono` 时间 + `font-sans` 城市名 + `font-mono` offset
- Hover:`var(--bg-page)` 冷白 + `border-accent`(Earth Blue)| Focus ring 2px Earth Blue
- Active cell(`isUserCity`):时间用 `var(--earth-blue)`,城市名用 `var(--earth-blue-deep)`

**三档响应式**(per responsive-rules-v1.md §3.1):
- **Desktop ≥ 1280**:12 城横排(`grid-template-columns: repeat(12, 1fr)`),每 cell 一列,无横向滚动,完整时间显示
- **Tablet 768-1279**:`grid-template-columns: repeat(6, 1fr)`,2 行 × 6 列(6+6)
- **Mobile < 768**:`display: flex` + `overflow-x: auto`,横滑,右侧 fade-out gradient 提示(`linear-gradient(90deg, transparent, var(--bg-page) 100%)`)

**typography**(per d11-css-tokens §2.5 + responsive-rules-v1.md §2.1):
- Desktop:`22-32px`(time Mono),`11px`(name),`10px`(offset)
- Tablet:`20-24px`(time Mono),`11px`(name)
- Mobile:`16-18px`(time Mono,**下限 16px,可读性**),`10px`(name)

### 2.4 Phase 2.4 · 集成到 HomeShell

**文件**:
- `src/App.tsx`(import 新组件 + 在 heroContent 内插入)
- `src/App.module.css`(加 heroEarthGlobe / heroWorldTimeRail 等 class,改 heroContent 布局)

**Hero 区域结构**(A2 + sitemap §1.1):
```
<section class="hero">
  <header class="header">[Logo + Nav · 不动]</header>
  <div class="heroContent">
    <EarthGlobe />                          [新插入]
    <h1 class="title">...</h1>               [不动]
    <p class="valueProp">...</p>              [不动]
    <SearchBox />                            [不动]
    <div class="suggestions">...</div>        [不动]
    <details class="why">...</details>        [不动]
    <WorldTimeRail cities={cities} />        [新插入,在 scrollHint 之前]
    <p class="scrollHint">...</p>             [不动]
  </div>
</section>
```

**布局调整**(App.module.css):
- `.heroContent` 保留 `flex: 1` + `align-items: center` + `justify-content: center`
- 但 `max-width` 从 600px 提到 920px(留出 WorldTimeRail 横向 12 城空间)
- `gap: 18px` → `gap: 22px`(容纳 EarthGlobe 较大元素)
- `.heroEarthGlobe`:`margin-top: 8px`,flex-shrink: 0
- `.heroWorldTimeRail`:`width: 100%`,margin-top: 8px
- `.heroContent` 在 Mobile:`gap: 14px` + `.heroEarthGlobe max-width: 240px`

**响应式**:
- Desktop ≥ 1280:`heroContent` 居中,EarthGlobe 在顶 480px 高,WorldTimeRail 在底横排 12 列
- Tablet 768-1279:`heroContent` 居中,EarthGlobe 360px 高,WorldTimeRail 6+6 网格
- Mobile < 768:`heroContent` 单列,EarthGlobe 240px 高,WorldTimeRail 横滑

### 2.5 Phase 2.5 · Build 验证

```bash
cd "/Users/lwy/Documents/ChatGPT/看见地球"
npm run build
# 预期:exit code 0(tsc -b + vite build)
```

### 2.6 Phase 2.6 · Git commit(本地 alpha, 不 push)

```bash
git add .
git commit -m "feat(design): add Hero area with EarthGlobe + WorldTimeRail to HomeShell

- Integrate existing EarthGlobe component into HomeShell Hero (was unused)
- Adjust EarthGlobe.module.css to A2 LOCK palette (cold white + Earth Blue + 0 shadow + 3-tier responsive)
- Create HomeShell-specific WorldTimeRail component (src/components/WorldTimeRail.tsx + .module.css)
  - Reads 12 cities from cities.ts + getLocalTime() live timezone
  - Each cell is a link to /cities/:slug
  - 3-tier responsive (Desktop 12 / Tablet 6+6 / Mobile horizontal scroll)
- Add new tokens to tokens.css SECTION 11 for EarthGlobe visuals
- No 22 LOCKED design logic change · No new routes · No backend · No new deps"
```

### 2.7 Phase 2.7 · 写交付物报告

写到 `release-v1/design-implementation/hero-area-report.md`:
- 实施范围
- 视觉对照(地球 / Rail before vs after)
- 残留 TODO
- Build 状态
- 推送指南

---

## 3. 不做的事(Brief §6 + Task Card DO NOT)

- ❌ 不引入新依赖
- ❌ 不动 22 项 LOCKED 组件 props / API(`src/components/ui/WorldTimeRail` 不动)
- ❌ 不改路由结构
- ❌ 不改数据 schema(`cities.ts` 不动)
- ❌ 不实现后端 / 不调用任何 API
- ❌ 不引入 Phase 2/3 范围(Witness POST / Echo / Analytics 集成)
- ❌ 不增加第四套 Layer
- ❌ 不重做 Hero 之上 / Hero 之下板块(Header / 12 Coordinates / Moments Timeline / Footer 不动)
- ❌ 不引入 SVG / Canvas 以外的图(地球用 SVG ✓ 已锁定)

---

## 4. 风险点

| 风险 | 影响 | 缓解 |
|---|---|---|
| EarthGlobe 当前 token undefined → 渲染异常 | 球体可能全黑或全白 | 加 token 到 tokens.css SECTION 11,定义 `--ocean-mid` `--ocean-deep` `--land-mass` `--ice-pale` `--space-deepest` |
| 字体加载延迟 → 球体数字 fallback | 视觉差异 | fallback chain 已定义(`Cormorant → Fraunces → Songti SC`)|
| WorldTimeRail 12 城全展开 → Desktop 拥挤 | 视觉密度过高 | 用 `grid-template-columns: repeat(12, 1fr)` 等分,字号用 Mono tabular-nums 等宽 |
| Mobile 横滑无视觉提示 → 用户不知道可滑 | 移动可用性 blocker | 加右侧 `fade-out gradient`(per responsive-rules-v1.md §3.1)|
| EarthGlobe 与 logo/标题视觉重量失衡 | Hero 焦点漂移 | EarthGlobe max-width: 520px,标题 `clamp(2.25rem, 4.5vw + 0.5rem, 4.5rem)` 保持 |
| 时区切换 / DST 边界 → localTime 显示错误 | 数据准确度 | 用 `Intl.DateTimeFormat` 而非手动减 UTC offset(已有 `getLocalTime()`)|
| `tsc -b` 严格类型检查 | 加新组件可能 TS 错 | 用 `import type { City } from '@/data/cities'`,props 用 `readonly City[]` + `now?: Date` |
| EarthGlobe SVG 内 `fill="var(--land-mass)"` 等 | 必须确保 token 定义存在 | 在 SECTION 11 加全 5 个 token(任意一个 missing → SVG fill 失败)|
| WorldTimeRail 在 Tablet 6+6 与 Header 高度 | 高度变化导致 Hero 比例失衡 | 给 heroContent 加 `overflow-y: auto` 在 Mobile + `min-height` 兜底 |

---

## 5. 改动文件清单(预计)

1. `src/styles/tokens.css` — **新增 SECTION 11 · EarthGlobe Visuals**(5 个 token)
2. `src/components/EarthGlobe.module.css` — **大改**(配色 A2 + 0 阴影 + 三档响应式)
3. `src/components/WorldTimeRail.tsx` — **新建**
4. `src/components/WorldTimeRail.module.css` — **新建**
5. `src/App.tsx` — import 新组件 + 在 heroContent 内插入 EarthGlobe + WorldTimeRail
6. `src/App.module.css` — 改 heroContent 布局 + 加 heroEarthGlobe / heroWorldTimeRail class + 三档响应式
7. `release-v1/design-implementation/hero-area.md` — 本 README
8. `release-v1/design-implementation/hero-area-report.md` — 报告

**未改动**(故意保留):
- `src/components/EarthGlobe.tsx` —— SVG + 组件逻辑 LOCKED,只改 CSS
- `src/components/ui/WorldTimeRail.tsx` + `.module.css` —— 设计系统级通用组件,本卡新建 HomeShell 专用层而非修改 LOCKED
- `src/data/cities.ts` —— 数据 LOCKED
- `src/components/ui/index.ts` —— 不暴露新建的 HomeShell 版本(避免污染设计系统 API)
- Header / 12 Coordinates / Moments Timeline / Footer 等板块 —— 不动

---

## 6. 自验收 checklist

- [ ] EarthGlobe 在 HomeShell Hero 显示(顶部)
- [ ] WorldTimeRail 在 HomeShell Hero 显示(底部,在 scrollHint 之前)
- [ ] 三档响应式(Desktop ≥ 1280 / Tablet 768-1279 / Mobile < 768)
- [ ] A2 视觉:冷白底 + Earth Blue + 0 大圆角 + 0 阴影
- [ ] WorldTimeRail 12 城时间正确(Intl.DateTimeFormat per city.timezone)
- [ ] WorldTimeRail 每个 cell 点击 → `/cities/:slug`
- [ ] 不修改 22 LOCKED 组件的 props / API(EarthGlobe 仅改 module.css)
- [ ] 不修改路由(保持 `/` 单路由)
- [ ] 不引入新依赖
- [ ] npm run build 编译通过(exit code 0)
- [ ] git commit 成功(本地 alpha 分支)
- [ ] 报告写在 `release-v1/design-implementation/hero-area-report.md`

---

## 7. 与 Phase 1 README 的关系

Phase 1 README(本目录同位置)解决"HomeShell 整体 A2 化 + token 系统 + 14 LOCKED 组件视觉对齐",**但遗漏了 Hero 区 LOCKED 设计资产**(sitemap §1.1 明确 LOCKED 的 EarthGlobe + World Time Rail)。本卡(Phase 2)是这个缺口的**精确补全**——

**两者关系**:
- Phase 1:把 LOCKED 视觉应用到**已有板块**(Header / 12 城 / Moments / SearchBox)
- Phase 2:把 LOCKED 视觉应用到**缺失板块**(Hero 的 EarthGlobe + WorldTimeRail)

**两者产物**:
- Phase 1 commit:`9f24955` ✓
- Phase 2 commit:`<待生成>` — 本 README 对应的 commit

---

**End of README · D-P0-01 Phase 2 · Hero 区域实施 · Plan**