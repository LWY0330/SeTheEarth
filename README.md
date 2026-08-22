# 看见地球 · See Earth

> 沿时间轴穿越地球四十六亿年历史的交互式应用 — **当前 v1.6.3(Phase 2 收口)**

| 维度 | 状态 |
|---|---|
| **当前版本** | v1.6.3 ✅ Phase 2 收口(2026-08-22) |
| **下一里程碑** | Phase 3 Component Library(等设计师 PROMPT 40 收口) |
| **已合并** | M0 → v1.0 → v1.1 → v1.2 → v1.3 (PWA + a11y) → v1.4 (5 段 CityPage + 11 城市) → v1.5 (Lighthouse + hotkeys) → **v1.6 (Phase 0 数据架构 + Phase 1 决策点 + Phase 2 Universal CityPage 工程 + Phase 2.5 Unknown Coordinate)** |
| **Branch** | `main` (latest merged) · `codex/v1.6-p36-data-arch` (v1.6 + v1.6.1 + v1.6.2 + v1.6.3 当前分支) |
| **测试** | `npm run test` — **285 / 285 pass**(+ 90 component tests 待 Vitest 迁移) |
| **类型** | `npm run typecheck` — 0 errors |
| **Bundle** | 239.06 KB(gzip 85.13 KB,Phase 2 收口持平)|

## 🚦 Feature Flag: Universal CityPage

`/cities/:slug` 路由支持双轨(Phase 2 收口):

| `VITE_USE_UNIVERSAL_CITYPAGE` | 行为 |
|---|---|
| `true` | 渲染 `<UniversalCityPage />`(Phase 2 收口组件)|
| `false`(默认)| 保留 legacy v1.4 `<CityPage />` |

**设置方法**:`.env` 加 `VITE_USE_UNIVERSAL_CITYPAGE=true`,Vite build 时静态替换。

详见 `docs/universal-city-page.md` + `src/lib/featureFlags.ts`。

---

> M0 目标:搭建可运行的项目骨架,验证核心叙事组件 —— 一颗会自转的地球 + 一条
> 9 节点的时间轴。后续 milestone 会逐步替换静态数据并接入真实地图瓦片。

---

## 📍 v1.6 Phase 0 · Global City Coverage 数据架构

**核心交付**(3 commits,8 新文件,77 测试):

- **City Schema v1** — Identity 12 字段 + Dynamic(runtime)+ Visual/Seed 7 字段 + State 双层枚举
- **Moment Schema v1** — 17 字段,`captured_at` 唯一决定 NOW / TODAY / PAST
- **时间分桶** — `getMomentTimeBucket` + `NOW_WINDOW_HOURS` 可配置,DST 跨夏令时保护
- **City State 推导** — L0-L4(后台)+ A-E(前台)双层枚举
- **Location Privacy** — 4 角色权限矩阵,Witness 仅自看 `raw_location`
- **数据导入管道** — `validateCity` 已实现,Phase 3 stub(`normalizeCity` / `findDuplicates` / `ingestBatch`)

**关键边界**:
- ✅ 零业务文件侵入(`src/data/cities.ts` / `liveMoments.ts` / `CityPage.tsx` / `moments.ts` 全部未触动)
- ✅ 零新依赖
- ⏳ Phase 1 启动需 4 项 Gate 拍板(Lisbon Yellow Layer / 4-screen → V2 Mapping / Context source policy / Khartoum mockup LOCKED)

---

## 📍 v1.6.1 · Phase 1 决策点扩展（PROMPT 39 v1）

**核心交付**(7 commits,5 新文件 + 3 现有扩展 + 1 配置微调,**+74 测试**):

- **`CityContent`** — 独立编辑文案层(5 字段 readonly),`City.content?` 可选挂载
- **`countryI18n`** — 15 国家 × zh/en 双语,`getCountryNameLocal(country_code, locale)` O(1) 查询
- **`Moment.sources?`** — 多源追溯数组,7 source type 字面量
- **`Moment.captions?`** — i18n 双语文案 `{ zh?, en? }`,`getMomentCaption` locale-aware 查询
- **`Moment.editorial?`** — 视觉/编辑层,保留 legacy 6 `MomentCategory`
- **spec §5.2** — `witness_id` 单字段标注(写入 Obsidian vault,不在本地 git)
- **ingestion.ts** — `source_url` warning 升级路径注释(Editorial CMS 接入后转 error)

**关键边界**:
- ✅ 零业务文件侵入(`cities.ts` / `liveMoments.ts` / `moments.ts` / `CityPage.tsx` 全部未触动)
- ✅ 零新依赖
- ✅ Phase 0 17 必填字段全部不动,所有新字段 `optional`
- ✅ 数据/视觉分离(editorial / captions / sources 独立类型,不污染 Phase 0 schema)

**详细报告**:见 `05-项目现状/d6-phase-1-decisions-implementation.md`
**决策追溯**:见 `05-项目现状/d6-phase-1-prep-cross-validation.md`

---

## 📍 v1.6.2 · Universal CityPage first pass scaffold（PROMPT 41 v1）

**核心交付**(2 commits,10 新文件 + 1 配置微调,**+43 测试**):

- **4 Hooks** — `useCityData` / `useDynamicCity` / `useMomentsForCity` / `useLayerFromCity`(数据接入层)
- **5 Components** — `UniversalCityPage` 主组件 + `UniversalArrival` / `UniversalOneScene` / `UniversalSameSecond` / `UniversalEcho` 4 屏组件骨架
- **Feature Flag** — `VITE_USE_UNIVERSAL_CITYPAGE` env var,`loadFeatureFlags()` / `isUniversalCityPageEnabled()` 解析
- **3 Adapters** — `legacyToUniversal` (City) + `liveEventToUniversal` + `legacyMomentToUniversal` (Moment),Phase 0 类型与 legacy 数据桥接
- **架构文档** — `docs/universal-city-page.md`(组件 API + hooks API + 5 States 文案 + feature flag)

**关键边界**:
- ✅ 零业务文件侵入(`cities.ts` / `liveMoments.ts` / `moments.ts` / `CityPage.tsx` / `Router.tsx` 全部未触动)
- ✅ 零新依赖(沿用 react@18.3 + react-dom)
- ✅ Phase 0 / Phase 1 类型与逻辑全部不动
- 🟡 Scaffold 阶段:渲染结构稳定 + 占位文案,Phase 2+ 对接 designer mockup 视觉精修
- 🟡 Router 集成 deferred 到 Phase 2(feature flag 已就绪,切换逻辑下 session 实施)
- 🟡 Component tests (90 tests) deferred 到 Phase 2(需 react-dom/server 渲染)

**详细报告**:见 `05-项目现状/d9-universal-city-page-engineering.md`
**架构文档**:见 `docs/universal-city-page.md`

---

## 📍 v1.6.3 · Unknown Coordinate 工程实施（PROMPT 43 v1）

**核心交付**(6 commits,11 新文件 + 2 scripts + 15 SVG mockups,**+59 测试**):

- **5 stage Reveal 引擎** — `unknownReveal.ts` 状态机(setTimeout 5/8/12s) + `unknownReveal.config.ts` 配置 + 19 tests
- **City Detail 整合** — `unknownToCity.ts` 坐标反查 + `buildUnknownToCityHref` URL 生成 + 12 tests
- **摄影管理** — `photoSource.ts` §2.8.9 优先级排序 + `photoAssets.ts` 5 stage preset + 16 tests
- **坐标反查** — `cityFromCoordinates.ts` Haversine + 12 城 records + 12 tests
- **React 组件** — `UnknownCoordinate.tsx` 5 stage UI + manual 按钮(PM 评审)
- **路由集成** — `/unknown` 路径 + Stage 5 → `/cities/:slug` redirect
- **15 SVG mockup** — 5 stages × 3 breakpoints,SVG 替代 PNG(0 新依赖硬约束)

**关键边界**:
- ✅ 零业务文件侵入(`cities.ts` / `liveMoments.ts` / `moments.ts` / `CityPage.tsx` 全部未触动)
- ✅ 零新依赖(沿用 react@18.3 + react-dom + Node 22 原生 test runner)
- ✅ §2.8.8 Red Layer Image Ethics 合规(`isEditorialSourceApproved` 校验)
- ✅ §2.8.9 Image Sourcing 优先级(Editorial > Stock,8 source 字面量)
- ✅ §12 Disambiguation 规则(同名不同城市按坐标 disambiguate)
- 🟡 SVG mockup 替代 PNG(Playwright/puppeteer 受 0 新依赖约束;提供 `scripts/screenshot-unknown.js` 用户安装后跑)

**详细报告**:见 `05-项目现状/d10-phase2.5-engineering.md`
**架构文档**:见 `docs/unknown-coordinate.md`

---

**详细报告**:见 `05-项目现状/d6-global-coverage-data-architecture.md`
**字段交叉验证**:见 `05-项目现状/d6-phase-1-prep-cross-validation.md`
**Phase 1 过渡**:见 `05-项目现状/d6-phase-1-prep-transition.md`

---

## 技术栈

| 层级            | 选型                          |
| --------------- | ----------------------------- |
| 构建工具        | **Vite 5**                    |
| UI 框架         | **React 18** (函数组件 + Hooks) |
| 类型系统        | **TypeScript 5** (strict)     |
| 样式            | **原生 CSS Modules** + `tokens.css` 设计令牌 |
| 包管理          | npm                           |
| 运行时依赖      | 仅 `react` / `react-dom`      |

> M0 不引第三方 UI 库、动画库、地图库。所有视觉(自转/光影/辉光/时间轴进度条)由
> 手写 CSS + SVG + CSS 动画完成,可离线、零额外下载。

---

## 目录结构

```
看见地球/
├─ index.html                 # 入口 HTML,Vite 直接读
├─ vite.config.ts             # @vitejs/plugin-react + @ alias
├─ tsconfig.json              # 主项目配置 (src)
├─ tsconfig.node.json         # Vite 工具链配置
├─ public/
│  └─ earth.svg               # favicon
├─ src/
│  ├─ main.tsx                # createRoot 挂载
│  ├─ App.tsx                 # 顶层布局 (Hero + Timeline)
│  ├─ App.module.css
│  ├─ styles/
│  │  ├─ tokens.css           # ★ 所有颜色/字体/间距/动画令牌
│  │  └─ globals.css          # reset + body 背景
│  ├─ components/
│  │  ├─ EarthGlobe.tsx       # ★ 自转的地球
│  │  ├─ EarthGlobe.module.css
│  │  ├─ Timeline.tsx         # ★ 时间轴 + 详情卡
│  │  └─ Timeline.module.css
│  ├─ data/
│  │  └─ timelineEvents.ts    # 9 个静态节点 (M1 会替换为 JSON 数据源)
│  └─ vite-env.d.ts
```

---

## 设计令牌 (tokens.css)

所有视觉常量都集中在 `src/styles/tokens.css`,组件只引用 `--xxx`
变量、永不写死值。分七组:

1. **Color · Space**:页面/卡片/抬升面背景分级
2. **Color · Earth & Atmosphere**:海洋、陆地、冰盖
3. **Color · Accent**:四个 marker 类型(stellar/life/warm/human)
4. **Color · Text**:三档文字色 + 反色
5. **Color · Border / Divider**
6. **Typography**:三套字体 (sans/serif/mono) + 6 级字号 + line-height
7. **Spacing / Radius / Shadow / Glow / Motion / Layout / Z-Index**

`prefers-reduced-motion` 会把所有动效时长归零 — 无障碍默认开启。

---

## 核心组件

### 🌍 EarthGlobe

- 内嵌 SVG,viewBox 200x100,程序绘制六大洲 + 冰盖
- 两份大陆带横向并列,通过 CSS `transform: translateX(-50%)` 实现无缝循环自转
- 叠层:
  - **海洋径向渐变**(`--ocean-deep` → `--space-deepest`)
  - **shading** (右侧暗化,模拟昼夜)
  - **specular** (左上高光,模拟太阳直射)
  - **clouds** (CSS dataURL 云带,独立缓慢漂移)
  - **atmosphere** (外圈蓝色辉光,`--glow-earth`)
  - **stars** (12 个随机闪烁的小点,背景层)
- 自转默认周期 9s,云层 28s,可被 `prefers-reduced-motion` 暂停

### ⏳ Timeline

- 9 个静态地球历史节点(太阳星云 → 月球 → 海洋 → 生命 → 大氧化 →
  寒武纪 → 恐龙灭绝 → 智人 → 此刻)
- 节点下方 rail 高亮"已发生"区段(渐变 + glow)
- 活动节点上方浮出一张详情卡(年份 + 标题 + 中英副标题 + 描述)
- **键盘**:聚焦后 ← → 切换,Home/End 跳首尾
- **鼠标**:直接点击节点
- aria-live="polite",aria-pressed,role="toolbar",roving tabindex

---

## 跑起来

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # 类型检查 + 生产打包到 dist/
npm run preview      # 预览构建产物
npm run typecheck    # 仅跑 tsc --noEmit
npm run test         # 跑 Node 22 原生 test runner(Phase 0+: src/lib/*.test.ts)
npm run lighthouse   # 本地 Lighthouse 回归(v1.3+ 起)
```

构建产物(v1.6 Phase 0):

```
dist/index.html                   0.58 kB │ gzip:  0.42 kB
dist/assets/index-*.css          15.08 kB │ gzip:  4.22 kB
dist/assets/index-*.js          229.00 kB │ gzip: 82.00 kB
```

---

## 下一步(v1.6 Phase 1)

> **当前阻塞**:4 项设计 Gate 拍板后立即启动。详见 `05-项目现状/d6-phase-1-prep-transition.md`。

- [ ] **Gate 1** Lisbon Yellow Layer LOCKED → 启动 CityPage v2 设计
- [ ] **Gate 2** 4-screen → V2 City Model Mapping 拍板 → 启动 `CityPage.tsx` 重构
- [ ] **Gate 3** Context source policy 拍板 → 启动 Context 运行时获取
- [ ] **Gate 4** Khartoum mockup LOCKED → 启动 Khartoum 接入 `cities.ts`
- [ ] **无 Gate 阻塞** `validateCity` 加 `source_url` warn(T1)
- [ ] **无 Gate 阻塞** `ContextSource` 接口 + stub(T2)
- [ ] **无 Gate 阻塞** `city.page_state` 渲染 state-machine 接口(T3)
- [ ] **无 Gate 阻塞** 加 CI(`.github/workflows/test.yml`)(T8)
- [ ] **独立 PR** `liveMoments.ts:411-422` 旧 Khartoum 文案清理(方案 A 删除)

---

## 仓库约定

- 分支:`codex/<milestone>-<topic>`(例如 `codex/m1-real-tiles`)
- `outputs/` 与 `work/` 为历次设计稿与设计章节笔记(M0 之前的内容),
  不参与构建,默认不进版本控制外的强制隔离,但允许保留作为参考。
