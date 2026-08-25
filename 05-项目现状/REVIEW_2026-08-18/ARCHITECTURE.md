# 「看见地球 / See Earth」 · 架构梳理与演进文档

**对应 commit**:`74cfbe0 chore(css): remove level-tokens.css (Stage 4, v1.5)`
**对应分支**:`codex/v1.4-pr29-sync-moment`
**版本(package.json)**:1.1.0-rc.1(开发实际版本 v2.32 ~ v2.91 注释口径)

---

## 1. 架构总览

### 1.1 一张大图

```mermaid
graph TB
    subgraph CDN_Static_Assets [Vercel Static Hosting]
        IDX[index.html · 默认 SEO meta]
        ASSETS[JS 280KB / CSS 104KB]
        IMG[/images/cities/12 城 48 张]
        FONT[Google Fonts · Fraunces + Inter]
        MANI[manifest.webmanifest]
        SW[sw.js · 服务端缓存壳]
        ROBOTS[robots.txt + sitemap.xml]
    end

    subgraph Runtime_Browser [Browser · React 18]
        MAIN[main.tsx · createRoot + StrictMode + SW 注册]
        APP[App.tsx · Router + Routes]
        ROUTER[0 依赖 History API Router]

        subgraph Routes
            HOME[HomeShell · 4 板块]
            CITY[CityPage · /cities/:slug]
            IDXPAGE[CityIndexPage · /cities]
            ABOUT[AboutPage · /about]
        end

        subgraph 板块 2 Cities
            CF[CityFeatured · 主图轮播]
            CI[CityIndex · 列表]
        end

        subgraph 板块 3 Moments
            MT[MomentsTimeline]
            CF2[ConfrontationalFlow]
            TB[TimezoneBar]
        end

        subgraph 板块 4 Timeline
            TL[Timeline · 9 节点时间轴]
        end

        subgraph CrossPage_Nodes [跨页节点]
            SM[SyncMoment · 角落小卡 · 3 variant]
            UCP[UserCityPicker · modal]
            UCP -> USERCITY [UserCityProvider Context]
            USERCITY -> USRW[userWeather · useWeather 单一订阅]
        end

        subgraph UI_Primitives [ui/ 6 原子 v1.5]
            B[Button]
            T[Tag]
            C2[Card]
            I[Input]
            M[Modal]
            S[Stack]
        end
    end

    subgraph External_APIs
        OM[open-meteo.com · 天气]
        SS[sunrise-sunset.org · 日出日落]
    end

    MAIN --> APP
    APP --> ROUTER
    ROUTER --> HOME
    ROUTER --> CITY
    ROUTER --> IDXPAGE
    ROUTER --> ABOUT

    HOME --> CF
    HOME --> CI
    HOME --> MT
    HOME --> TL

    MT --> CF2
    MT --> TB

    CF --> SM
    IDXPAGE --> SM
    CITY --> SM

    CITY --> UCP
    IDXPAGE --> UCP
    ABOUT --> UCP
    UCP --> USERCITY
    USERCITY --> USRW

    CF -. UI .-> B
    MT -. UI .-> T
    HOTKEY[HotkeyHelp] -. UI .-> B

    SM -->|useWeather| OM
    USRW -->|useWeather| OM
    CN[CityNow] -->|useWeather · getSunPeriod| OM
    CN --> SS

    HOME -. shared event data .-> CF2
    ALL_DATA[src/data/cities.ts · 12 城]
    ALL_DATA2[src/data/liveMoments.ts · 12 事件]
    ALL_DATA3[src/data/timelineEvents.ts · 9 历史]

    HOME -->|data| ALL_DATA
    HOME -->|data| ALL_DATA2
    HOME -->|data| ALL_DATA3
    CITY -->|data| ALL_DATA
    IDXPAGE -->|data| ALL_DATA
    ABOUT -. no data .-

    SW --> CACHE[(Cache · App Shell + Images)]
    SW --> OM
    SW --> IMG
```

### 1.2 叙述

「看见地球」是一个**纯静态 + 客户端 API** 的 React 单页应用,**没有自建后端**。架构的核心是"轻 → 重"分层:

1. **静态壳层**(Vercel 托管):HTML / JS / CSS / 图片 / fonts / robots / sitemap / SW / manifest —— 全部 CDN 边缘缓存,毫秒级响应。
2. **客户端运行时**:Vite bundle 加载 → React 18 hydrate(SPA 无 SSR) → Router 接管 → 4 条路由中的一条渲染。
3. **数据流**:12 城静态数据 + 12 编辑精选事件 + 9 历史时刻(`src/data/*.ts`,被打包进 JS bundle,不增加额外请求)。open-meteo / sunrise-sunset 走 fetch,CORS 友好 + 内存缓存 15min/6h。
4. **跨组件状态**:只有 1 个 Context(`UserCityProvider`,装 userCity + 单一 useWeather 订阅)。其余全部走 props + useState/useMemo。
5. **样式**:设计令牌 SSOT(`tokens.css` 7 大组)+ CSS Modules(组件局部化),无第三方 UI / 动画 / 地图库。

### 1.3 极简的设计取向

- **M0 注释原话**(README.md):"M0 不引第三方 UI 库、动画库、地图库。所有视觉由手写 CSS + SVG + CSS 动画完成,可离线、零额外下载。"
- **v1.5 实际结论**:这条原则延续到 v1.5,代价是**开发量大但运行时轻量**(JS 280KB · CSS 104KB · Gzip 后约 92KB JS)。
- **取舍**:团队 1 人编辑视角(AboutPage 注明),做"内容产品"不做"用户增长产品"。优先级:内容密度 > 视觉冲击 > 个人化。

---

## 2. 技术选型与权衡

| 决策 | 选型 | 理由 | 代价 |
|------|------|------|------|
| 构建 | Vite 5 | ESM 原生 dev 启动 < 1s;Rollup 打包;@ alias 开箱;`plugin-react` 支持 HMR。 | 0;v5 已稳定。 |
| UI 框架 | React 18 函数组件 + Hooks | 体积小、组合性强、与 v1.x 兼容、生态成熟。 | 无 Concurrent 特性(Suspense / useTransition)用的机会少 —— 内容静态 + 数据增量。 |
| 类型 | TypeScript 5 strict + `noUnusedLocals/Parameters` | tsconfig 已开 strict 全套,确实能抓到未使用变量、未处理 case。 | lib/timeDiff.test.ts 用 `@ts-ignore` 绕过 node:test 类型缺失(小补丁可接受)。 |
| 路由 | 自建 0 依赖 Router(History API) | 只用 4 条路由(< 200 行,完全可控),不引 react-router(13KB gz)。 | 无 lazy loading hooks,无 nested routes,无 loader 模式 —— 后面若路由变多需重构。 |
| 状态管理 | 单 Context + props 透传 | 只有"用户城市 + 用户天气"是真全局;其余 lifted to App.tsx。 | App.tsx 已 413 行,再叠 state 会爆炸。**未来当 > 8 个跨页 state 时应引入 Zustand/Redux**。 |
| 样式 | 原生 CSS Modules + 设计令牌 SSOT | 0 依赖、可读、性能好、主题切换只需换 tokens.css。 | 每次新组件要写 module.css,且不能复用 Tailwind 那种 utility —— 开发节奏较慢。 |
| 包管理 | npm(无 pnpm/yarn) | 单人项目,锁文件足够。 | 没有 monorepo 能力(若 v2.0 拆 admin/landing/sdk 就要引 pnpm workspaces)。 |
| 图标 | 自画 SVG(WeatherIcon · 8 种状态) | 0 依赖、矢量、可改色。 | 9 个 icon 手写;若 > 30 个 icon 应换 lucide-react。 |
| 测试 | Node 内置 test runner(`node:test --experimental-strip-types`) | 0 依赖、随 Node 22+ 自带、跑得极快。 | 不支持异步组件级 / DOM 测试。React Testing Library / Vitest 待引入。 |
| 部署 | Vercel(隐含) + `serve -s dist` 兜底 | 边缘 CDN、PR Preview、SPA fallback 默认支持。 | 无 CI/CD 自动化(GitHub Actions 缺失);依赖 Vercel 平台行为。 |
| 字体 | Google Fonts CDN + `@import` | 0 性能优化,简单。 | **阻塞首屏渲染**,应该用 `preconnect` + `media=print onload=`。 |
| SW | 手写 137 行 sw.js | 0 依赖。 | Cache 策略简单,没有 Workbox 的 stale-while-revalidate + precache 完整套件。 |
| PWA Manifest | 手写 JSON | 简单。 | 缺 screenshot、shortcuts、share_target;iOS 上表现一般。 |

### 关键命题:**为什么不用第三方 UI 库?**

- 一开始是 M0 妥协("可离线、零额外下载")。延续到 v1.5,实质上是"内容型 SPA"对交互控件的需求极低(主要是按钮 + 标签 + 卡片),没必要换 Storybook / Radix / shadcn。
- 副作用:**全部自己写 a11y**(已大部分做好,但 Color contrast bug B-01 仍然逃过手写测试),而 shadcn/Radix 的 a11y 是工业级 QA 过的 —— 是个 trade-off。

---

## 3. 核心组件契约

### EarthGlobe(`src/components/EarthGlobe.tsx`)

```typescript
interface EarthGlobeProps {
  label?: string; // 默认 '自转的地球'
}
```
- 渲染:纯 SVG 6 大洲 + 自转 CSS 动画 + 云层 + 辉光 + 12 颗星。
- 副作用:**无**(纯展示)。
- 关键:viewBox 200×100,2:1 比例,通过 `transform: translateX(-50%)` 实现无缝循环。两份大陆 path 并列。
- a11y:`role="img"` + `aria-label`;星点和云层 `aria-hidden`。

### Timeline(`src/components/Timeline.tsx`)

```typescript
interface TimelineProps {
  events?: readonly TimelineEvent[];
  initialIndex?: number;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
}
```
- 渲染:9 节点 + 进度条 + aria-live 详情卡。
- 副作用:`useEffect` 挂全局 keydown(roving tabindex + Home/End);`useEffect` 把焦点移回 active 节点。
- 关键 a11y:`aria-live="polite"` · `aria-pressed` · `role="toolbar"` · `tabindex={idx===active ? 0 : -1}` 完整。
- 风险:**`useEffect` 没依赖 `activeIndex`**(line 86-92)对吗?查源码:`useEffect(() => { btn?.focus({...}) }, [activeIndex])` ✓ 但只聚焦,不取消 → **重复 mount / unmount 时会留焦点**。

### CityFeatured(`src/components/CityFeatured.tsx`)

```typescript
interface CityFeaturedProps {
  city: City;
  index: number;
  total: number;
  onPrev?: () => void;
  onNext?: () => void;
}
```
- 渲染:`<picture>` WebP srcset + LCP 时 `fetchPriority="high"` + 时段染色蒙版 + 角落 SyncMoment。
- 副作用:每分钟 `setInterval` 检查时段,以重启 fade-in。
- 关键 a11y:`<article aria-label>` + 主图 `<img alt>` 含中英名;左右切换是真实 `<button aria-label>`。
- 风险:`setInterval` 不响应 reduce-motion(B-10)。

### CityIndex(`src/components/CityIndex.tsx`)

```typescript
interface CityIndexProps {
  cities: readonly City[];
  activeCityId: string;
  baseIndex?: number;
  totalCityCount?: number;
  onHover?: (cityId: string | null) => void;
  onFocus?: (cityId: string | null) => void;
}
```
- 渲染:`<a role="listitem">` 列表 + 80ms hover 防抖 + ↑/↓ keyboard + Esc 退出。
- 副作用:`useRef + setTimeout` 管理 hover 延迟;cleanup ✓。
- 风险:**a11y color-contrast 0 分(B-01)**。

### CityPage(`src/components/CityPage.tsx`)

```typescript
interface CityPageProps {} // 无外部 props;内部 useRoute() 取 slug
```
- 渲染:Hero + SyncMoment full + CityNow + 当地生活 + 文化背景 + 相关城市 + 底部 footer。
- 副作用:30s `setInterval` 更新本地时间;从 `useUserCity()` 取 `openPicker`。
- 关键 a11y:`<h1>` + `<h2>` 顺序正确;主图 `loading="eager" fetchPriority="high"`;找不到 slug 给 404 态 + `<Meta title="城市未找到">`。
- 风险:404 态不发 404 HTTP(SPA)—— **SEO 不友好**;`useRoute()` 后 `useMemo(() => findCity(slug), [slug])` 没考虑 slug 不存在。

### MomentsTimeline(`src/components/MomentsTimeline.tsx`)

```typescript
interface MomentsTimelineProps {
  events: readonly LiveEvent[];
  activeEventId?: string | null;
  onSelectEvent?: (event: LiveEvent) => void;
  onReshuffle?: () => void; // ⚠️ App.tsx 没传,永不显示
}
```
- 渲染:左栏(UTC 时间 + 状态 + 24h band + 时区条 + WORLD RIGHT NOW 分布 + CURRENTLY VIEWING)+ 中线 + 右栏(ConfrontationalFlow + 6 背景事件列表)。
- 副作用:30s `setInterval` 更新 UTC 时间;`useMemo` 过滤 confrontEvents(level 存在)和 backgroundEvents。
- 风险:**list-item + role=button 双重角色(B-11)** + `onReshuffle` dead code(B-04)。

### SyncMoment(`src/components/SyncMoment/SyncMoment.tsx`)

```typescript
interface SyncMomentProps {
  city: City;
  variant?: 'full' | 'compact' | 'chip';
  inverted?: boolean;
}
```
- 渲染:对照"用户城市 vs 当前城市"的时间 / 温度 / 时差 / 温差(任一字段缺失都"无声降级")。
- 副作用:3 个子组件各 1 个 setInterval(1s / 1min / 1min);`useUserCity()` 取 userCity + userWeather。
- 关键:3 种 variant 对应 3 种使用位置(CityPage · CityFeatured · CityIndexPage),共享同一份 userWeather 订阅(Provider 内 useWeather 一次)。
- 风险:**3 个 setInterval 各自 tick(B-10)**,且当 userCity 改了只重新 useWeather 不重新挂 setInterval —— 这是好事。

### HotkeyHelp(`src/components/HotkeyHelp.tsx`)

```typescript
interface HotkeyHelpProps {
  open: boolean;
  onClose: () => void;
}
```
- 渲染:全屏 Modal,9 行快捷键表(kbd + 描述)。
- 副作用:**用 inline style + 未用 `<Modal>` 原子组件**(违反 v1.5 自己的 ui 抽象)。
- 风险:z-index 9999 hardcode,与 tokens.css `--z-modal: 1000` 冲突但优先级更高(可能盖掉真 modal)。
- 战略级风险:**`ui/Modal` 死代码(B-19)** 该组件从未被 import。

### Meta(`src/components/Meta.tsx`)

```typescript
interface MetaProps {
  title: string;
  description: string;
  ogType?: 'website' | 'article';
  ogImage?: string;
  canonicalPath: string;
}
```
- 渲染:`return null`,副 useEffect 内 mutate document.head。
- 副作用:`querySelector('meta[name="..."]')` 找到就改,没有就 append → **可能在多个 route 切换时残留旧 meta**(实测 OK,因为每次 useEffect 都重置 og/twitter title)。
- 风险:用 `path` 拼站点 URL —— `og:image` 拼的是相对路径不是绝对;`robots.txt` 里 Sitemap 是绝对 URL,二者处理不一致。

### 服务端缓存 SW(`public/sw.js`)

```javascript
const CACHE_VERSION = 'v1.0.0';
// 3 种策略:cache-first(JS/CSS)· network-first(navigate)· stale-while-revalidate(images.unsplash / pexels)
```
- ⚠️ 实际项目已切自托管,unsplash/pexels 分支永不命中(B-08)。

---

## 4. 样式系统评估

### tokens.css 七组(389 行,v1.5 锁)

| 组 | 内容 | 行数 | 风险 |
|---|------|------|------|
| 1. 品牌主色 | `--color-canvas` / `--color-canvas-soft` / `--color-canvas-deep` + `--color-ink-{50/100/300/500/700/800/900/inverse}` + `--color-accent-{100/400/500/600}` | ~25 | 锁很稳 ✓ |
| 2. 情绪色 | `--level-red/yellow/blue` + 字体/字号/动效 `--level-font-*` / `--level-size-sm/md/lg` / `--level-motion-*` | ~20 | editorial taxonomy 与 PR #30 对齐 ✓ |
| 3. 语义色 | `--color-success/warning/error/info` | 4 | 与 level 系统协调 ✓ |
| 4. 液态玻璃 | `--glass-bg` / `--glass-border` / `--glass-highlight-top/bot` / `--glass-shadow-*` | ~12 | v1.4 继承,`SyncMoment` / `EventDrawer` / `SearchBox` 用 ✓ |
| 5. Typography | 字体族(--font-serif/sans/mono) + 7 档字号 --fs-display/h1/h2/h3/body/caption/micro + line-height + letter-spacing + weight | ~35 | 见 B-18,文件开始膨胀 |
| 6. Spacing | 13 档 --space-1..13(8px grid)+ v1.4 旧 --sp-* alias | ~30 | 双 alias 系统导致教程断裂,新人必须同时学两套 |
| 7. Radius/Shadow/Motion/Layout/Z-Index | 圆角 7 档 + alias 3 档 · 阴影 4 档 + Visual Direction 3 档 · 动效 6 档 + Visual Direction 4 档 · 布局 + Hero · z-index 6 档 + 6 档 alias | ~70 | token 数翻倍,理解成本上升 |

**总评**:v1.5 改版让 SSOT 真正"唯一"了(7 组 + 11 contentType + SearchBox/SyncMoment/Modal 共 ~120 token)。但:
- **双 alias 系统是迁移期合理代价**(v1.6 可删 v1.4 alias)。
- **`tokens.css` 进一步应拆成多个文件**(`tokens/colors.css` `tokens/typography.css` `tokens/spacing.css` `tokens/level.css` `tokens/component.css`)—— Vite 自动合并,无构建成本。
- **contentType 11 色已锁 AA 级**(7.69/5.35/6.02/.../5.50)✓ ✓。
- **B-01 颜色对比度 fail 不在 tokens.css,而在 CityIndex.module.css 的具体应用层**(active 态 `accent-500` + 6% 透明 + canvas = 3.7:1)。

---

## 5. 数据演进

### 当前(M0 ~ v1.5)
```
[data/cities.ts]       static typed array
[data/liveMoments.ts]  static typed array
[data/timelineEvents.ts] static typed array
[data/moments.ts]      static typed array (legacy)
```

### M1(ROADMAP 已规划,V1.1 历史)
迁移到:
```
public/data/cities.json
public/data/events.json
public/data/timeline.json
```

### 未来(v2.0 / 接 API 时)
```
/api/cities       → typed fetcher
/api/events       → typed fetcher + SWR
/api/weather/:slug → 已是 open-meteo (无需后端)
/api/sun/:slug    → 已是 sunrise-sunset (无需后端)
```

### 关键准备:v1.4 已经做了
- **lib/weather.ts**:15min TTL + in-flight 去重 + safe 版返回 null —— 接入 API 后只需换 `fetchWeather` 内部 `URL`。
- **lib/sun.ts**:同模式。
- **useWeather hook**:订阅 + 缓存预热 + cancelled 守卫 —— **标准 React Suspense-like 模式**,但没用 Suspense。
- **CityNow**:`useWeather` + `useSunPeriod` 并存,失败降级 —— 为"接真实 API"已经铺好。

### 待补:
- **统一 fetcher 抽象**(`src/lib/fetch.ts`):带 abort / retry / 鉴权 / 错误标准化。
- **数据契约 (Zod/TypeBox)**:`cities.json` 不要写一遍 type 再写一遍 JSON,要从 schema 生成。
- **缓存 LRU**:`weather.ts` / `sun.ts` 当前 Map 无 LRU,长会话累计(虽然每条 < 1KB,可接受)。

---

## 6. 演进路线 vs Roadmap 缺口

| Roadmap PR | 状态 | 缺口 |
|------------|------|------|
| **V1.1** PR #1 · open-meteo | ✅ lib/weather.ts | - |
| V1.1 PR #2 · sunrise-sunset | ✅ lib/sun.ts | - |
| V1.1 PR #3 · timezone via Intl | ✅ lib/timeDiff.ts(cities.ts 也内联了) | 与 PR #2 重叠可整合 |
| V1.1 PR #4 · serve -s dist | ✅ package.json | - |
| **V1.2** PR #5 · /cities 列表 | ✅ CityIndexPage | - |
| V1.2 PR #6 · /cities/[slug] 详情 | ✅ CityPage | SEO 仍缺 JSON-LD;404 HTTP 状态码 |
| V1.2 PR #7 · 12 城内容 | ✅ cities.ts | livingNote / cultureNote 字段 100% 填充 ✓ |
| V1.2 PR #8 · SEO | ✅ Meta + sitemap + robots | og:image 是相对路径;无 JSON-LD |
| V1.2 PR #9 · WebP + srcset | ✅ lib/imageUrl.ts + 自托管 | - |
| V1.2 PR #10 · /about | ✅ AboutPage | - |
| **V1.3** PR #11 · 多时段图 | ✅ 4 场景工厂(landmark/nature/street/culture) | 部分图仍是 1 图复用,需 PR #11a 升级 |
| V1.3 PR #12 · `*Cn` → `*Zh` | ✅ 全仓 | - |
| V1.3 PR #13 · 全局快捷键 | ✅ hooks/useHotkeys + HotkeyHelp | ui/Modal 未用,HotkeyHelp 用了 inline style |
| V1.3 PR #14 · PWA | ✅ manifest + sw.js | sw.js 图片策略 dead(B-08);无离线指示器 |
| V1.3 PR #15 · Lighthouse CI | ✅ scripts/lighthouse-ci.sh | 非真 CI(GitHub Actions),本地跑 |
| V1.3 PR #16 · a11y + 8 修复 + 自托管图 | ✅? 部分 | **color-contrast 仍 fail(B-01)** |
| **V1.4** PR #26 · 对峙式阅读流 | ✅ ConfrontationalFlow + 9 events | - |
| V1.4 PR #29 · SyncMoment + UserCity | ✅ | - |
| V1.4 PR #30 · 红黄蓝 taxonomy 升级 | ✅ editorialLevel.ts | - |
| **V1.5** Stage 1-4 | ✅ tokens.css v2 + ui 原子 + Timeline redesign | App.tsx.bak 残留;tokens.css 第 2 :root 未闭合(B-03) |

### 仍未覆盖的 Roadmap 项

- **M0 → M1 真实地球瓦片**:`EarthGlobe.tsx` 仍是 SVG 6 大洲 + CSS 自转 —— 没换上 maptalks/leaflet/maplibre(产品决策保留离线友好,合理)。
- **i18n / English 版**:V1.3 已列入 v2.0 候选,未开始。
- **滚动联动 / ScrollTrigger**:HomeShell 用了 scrollIntoView,没有 scroll-bound 时间轴;V1.3 ROADMAP 标注未做。
- **DAILY DIGEST 邮件订阅**:V1.3 已标 v2.0。
- **评论 / 用户账号**:V1.3 已标 v2.0。

### 上线前必修缺口(按 v1.1 ROADMAP 与本文审计合并)

1. **B-01** · color-contrast(a11y)
2. **B-02** · new-york 城市缺失(业务)
3. **B-05** · ErrorBoundary(架构)
4. **B-03** · tokens.css 嵌套 :root(样式)
5. **B-09** · tsconfig composite(构建)
6. **B-16** · ESLint/EditorConfig(工程化)

### 上线后第一周建议补

7. **B-07** · Vite preview headers / sourcemap(安全)
8. **B-15** · 前端埋点(Sentry / 自建 beacon)(可观测性)
9. **B-19** · 重写 HotkeyHelp 使用 ui/Modal(收敛)
10. 拆分 tokens.css 为多文件(可维护性)
11. GitHub Actions 自动跑 lighthouse-ci + typecheck + lint
12. 单元测试覆盖 weather / sun / imageUrl / userCity(测试)

---

## 7. 总结

「看见地球」在 **v1.5 阶段** 已经达成 **功能 + 设计系统 + SEO + a11y 部分**的完整度。**真正阻塞上线的硬指标只有 2 个**:

1. **CityIndex 颜色对比度 fail(Lighthouse 0 分)**
2. **首屏"纽约"按钮无效(findCityIdx 走错函数)**

其余都是工程化债 / 后续迭代优化项。

如果给予 1 人周时间,**P0 + P1 全部 11 项都能清完**;后续 P2 项需另起 sprint。
