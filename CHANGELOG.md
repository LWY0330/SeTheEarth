# Changelog

所有项目的"显著变更"记录于此。格式基于 [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),版本号遵循 [Semantic Versioning](https://semver.org/spec/v2.0.0.html)。

> **注意**:本文件由工程团队维护,记录用户可见的变更(功能 / 行为 / API)。纯内部重构、重命名、依赖升级等记录在 commit message,不全部进 changelog。

---

## [Unreleased]

### Planning — v1.6 Phase 1
- 启动条件:4 项设计 Gate 拍板(Lisbon Yellow Layer / 4-screen → V2 Mapping / Context source policy / Khartoum mockup LOCKED)
- 详见 `05-项目现状/d6-phase-1-prep-transition.md`

---

## [1.6.3] · 2026-08-22 · Unknown Coordinate 工程实施（PROMPT 43 v1）

> **状态**:✅ 完整交付 — 5 tasks + 7 commits · 285 / 285 tests pass · 0 业务侵入 · 0 新依赖
> **核心交付**:5 stage Reveal 引擎 + City Detail 整合 + 摄影管理 + 坐标反查 + React 组件 + /unknown 路由 + 15 SVG mockup
> **测试**:285 / 285 pass(Phase 0:77 + Phase 1 prep:32 + PROMPT 39:74 + PROMPT 41:43 + PROMPT 43:59)

### Added — 库(`src/lib/`)

- **`unknownReveal.ts`** — 5 stage 状态机(createRevealController factory)
  - start / pause / resume / reset / advance(stage) / getState / subscribe / destroy
  - state 永远返回 frozen copy,Stage 4 → 5 仅用户点击触发
- **`unknownReveal.config.ts`** — DEFAULT_REVEAL_CONFIG (5/8/12s + 800ms) + TEST_REVEAL_CONFIG (50/80/120ms)
- **`cityFromCoordinates.ts`** — Haversine 公式 + 12 城 CITY_RECORDS
  - findCityByCoordinates(lat, lon, options.maxDistanceKm=200):city_id | null
  - §12 Disambiguation 规则:同名不同城市按距离 disambiguate
- **`unknownToCity.ts`** — Reveal → City 完整对象映射
  - revealCityFromCoordinates(coords, currentData?):双路径 lookup
  - buildUnknownToCityHref(coords):'/cities/:slug' URL 生成
  - MEXICO_CITY_COORDINATES:23.6345°N -102.5528°W(per spec d10 §2.1)
- **`photoSource.ts`** — §2.8.9 Image Sourcing 实施
  - getPhotoForUnknownStage(stage 1-5):PhotoAsset
  - validatePhotoAsset:12 字段校验
  - isEditorialSourceApproved:§2.8.8 Red Layer Image Ethics 审核
  - comparePhotoSource:8 source 优先级排序(Editorial > Stock)

### Added — 数据(`src/data/`)

- **`photoAssets.ts`** — UNKNOWN_PHOTO_BY_STAGE 5 stage preset
  - PhotoAsset interface 13 字段(per spec §2.8.9 Required Metadata 12 + role)
  - PhotoSourceType 8 字面量(reuters/ap/adobe-editorial/shutterstock-editorial/wikimedia/unsplash/pexels/manual)
  - PHOTO_SOURCE_PRIORITY 8 顺序:Editorial > Stock

### Added — 组件(`src/components/`)

- **`UnknownCoordinate.tsx`** — 5 stage Reveal React 组件(220 行)
  - 集成 createRevealController + getPhotoForUnknownStage + revealCityFromCoordinates
  - 5 状态机 body.stage-N(对应 React state)
  - Stage 5 用户点击 → navigate.push('/cities/:slug')
  - 5 manual 按钮(PM 评审用)

### Added — 路由集成(`src/router/Router.tsx` + `src/App.tsx`)

- **`/unknown` 路由** — Route union 加 'unknown' / matchRoutes 加 '/unknown' / AppRoutes 加分支
- **Stage 5 → /cities/:slug redirect** — 用户点击"进入此刻"按钮

### Added — Mockup(`outputs/v1.5-mockups/d10-unknown-coordinate/`)

- **15 SVG mockup 文件**(5 stages × 3 breakpoints = 1440/1680/1920)
- **SVG 替代 PNG** — 0 新依赖硬约束(Playwright/puppeteer 不可用)
- **scripts/render-unknown-svg.sh** — bash 生成器(可重新生成)
- **scripts/screenshot-unknown.js** — 可选 Playwright 脚本(用户安装后跑,生成 PNG)

### Added — 文档

- **`docs/unknown-coordinate.md`** — 架构 + 使用文档(Reveal 引擎 + City Detail 整合 + 摄影管理 + 路由集成)
- **`05-项目现状/d10-phase2.5-engineering.md`** — 工程实现报告(≥ 1500 字)

### Engineering Notes

- **0 业务侵入**:`src/data/cities.ts` / `liveMoments.ts` / `moments.ts` / `CityPage.tsx` 全部未触动
- **0 新依赖**:沿用 react@18.3 / react-dom@18.3 / serve@14 + Node 22 原生 test runner
- **测试覆盖**:PROMPT 43 v1 新增 59 tests(unknownReveal 19 + cityFromCoordinates 12 + photoSource 16 + unknownToCity 12)
- **bundle 增量**:229.84KB → 239.06KB(+9.22KB,Unknown Coordinate 组件合理开销)
- **build 时间**:542ms,与 v1.5 持平

### PR 拆分(per PM 任务)

- **`28eb69c`** feat(lib): Unknown Coordinate Reveal engine (任务 A)
- **`d148499`** feat(lib): cityFromCoordinates (任务 D)
- **`d6cdc33`** feat(lib+data): photoSource + photoAssets (任务 C)
- **`a4c2334`** feat(lib): unknownToCity (任务 B)
- **`bb0e896`** feat(components+router): UnknownCoordinate React component + /unknown route (任务 A + 路由)
- **`6e6788f`** feat(mockups): Unknown Coordinate 15 SVG mockups (任务 G)
- 文档同步 + 报告(下个 commit)

### Upstream Decisions LOCKED

- 5 stage Reveal 节奏:5s / 8s / 12s + 800ms transition
- 阶段 1-4 city_id 为 null(未 Reveal),Stage 5 = mexico-city
- §2.8.8 Red Layer Ethics:editorial_only=true + usage_restriction 必填
- §2.8.9 Image Sourcing:8 source 优先级排序(Editorial > Stock)
- §12 Disambiguation:同名按坐标 disambiguate

---

## [1.6.2] · 2026-08-22 · Universal CityPage first pass scaffold（PROMPT 41 v1）

> **状态**:🟡 SCAFFOLD 完成 — 4 hooks + 5 components + feature flag 就绪,Router 集成 deferred
> **核心交付**:5 City States 数据接入层(hooks)+ 4 屏组件骨架 + VITE_USE_UNIVERSAL_CITYPAGE env flag
> **测试**:226 / 226 pass(Phase 0:77 + Phase 1 prep:32 + PROMPT 39:74 + PROMPT 41 v1:43)

### Added — Hooks(`src/hooks/`)

- **`useCityData(slug)`** — 从 slug 取 Universal City,内部用 `legacyToUniversal` adapter 映射 legacy 12 城 → Universal City
- **`useDynamicCity(city)`** — 运行时计算 `local_time`(HH:MM)+ `user_time_difference`(+9H / -4H 等),30s 自动 tick,Intl.DateTimeFormat DST 安全
- **`useMomentsForCity(city_id)`** — 取关联 Moment[],内部用 `liveEventToUniversal`(27 字段 LiveEvent → 17 字段 Universal)+ `legacyMomentToUniversal`(10 字段静态 Moment → Universal)双 adapter
- **`useLayerFromCity(city)`** — 推断 Layer (blue/yellow/red/unknown),基于 city_id 关键字(Phase 1 临时,Phase 2 editorial override)

### Added — Components(`src/components/`)

- **`UniversalCityPage`** — 主组件,接收 `city? / moments? / plan?`(可选外部传入,默认从 slug 取),调用 `planCityPageRender(city)` 决定 4 屏渲染
- **`UniversalArrival`** — 屏 01 · Context Hero,城市名 + 双时区 + 坐标 + layer 标识
- **`UniversalOneScene`** — 屏 02 · Now 屏,9/3 列骨架 + Empty CTA "Be the first to show here today."
- **`UniversalSameSecond`** — 屏 03 · Now 横向对比,3 栏并置(排除当前城市)+ Intl.DateTimeFormat 各城市当前时间
- **`UniversalEcho`** — 屏 04 · Echo,6 状态(default/hover/focus/typing/disabled/submitted)+ 隐私 microcopy + 0/80 字数 + 提交对勾

### Added — Feature Flag(`src/lib/featureFlags.ts`)

- **`VITE_USE_UNIVERSAL_CITYPAGE`** env var 解析(`true`/`1`/`yes` → true;默认 false)
- **`loadFeatureFlags()`** — frozen FeatureFlags 对象(import.meta.env 优先 + Node 兜底)
- **`isUniversalCityPageEnabled()`** — 便捷访问
- **`DEFAULT_FLAGS`** — frozen 默认(SSR / 测试兜底)

### Changed

- **`package.json`** — test glob 扩展 `src/hooks/*.test.ts`(支持 hooks 测试发现)

### Documentation

- `docs/universal-city-page.md` — 架构 + 使用文档(组件 API + hooks API + feature flag + 5 States 文案 + 上线标准对照)
- `05-项目现状/d9-universal-city-page-engineering.md` — 工程实现报告(≥ 1500 字)

### Engineering Notes

- **0 业务侵入**:`src/data/cities.ts` / `liveMoments.ts` / `moments.ts` / `CityPage.tsx` 全部未触动
- **0 新依赖**:沿用 react@18.3 / react-dom@18.3 / serve@14 + Node 22 原生 test runner
- **测试覆盖**:PROMPT 41 v1 新增 43 tests(useCityData 12 + useDynamicCity 12 + useMomentsForCity 8 + useLayerFromCity 6 + featureFlags 5)
- **Router 集成 deferred**:任务 A.6(Router 切换)下 session 实施,本 session 仅组件骨架
- **Component tests deferred**:任务 C 剩余 90 tests 下 session 实施(需 react-dom/server 渲染)
- **CSS module files deferred**:5 个 `*.module.css` 下 session 实施(Phase 2 视觉)

### PR 拆分(per PM 任务 B)

- **PR-6 (本任务)**:Universal CityPage scaffold(2 commits)
  - 82936d5 feat(hooks): 4 Universal CityPage hooks + 38 tests
  - 1b6ede6 feat(components): Universal CityPage 5 components + feature flags

### Deferred to Phase 2

- ⏳ Router 集成(`src/router/Router.tsx` + `src/App.tsx` + feature flag 切换)
- ⏳ Component tests(90 tests,需 react-dom/server 渲染)
- ⏳ CSS module 文件(5 个 *.module.css)
- ⏳ Designer mockup LOCKED 后视觉层精修

---

## [1.6.1] · 2026-08-19 · Phase 1 决策点实施（PROMPT 39 v1）

> **状态**:✅ 已交付 — 7 commits(PR-4 + PR-5.1-5.5 + ingestion marker)
> **核心交付**:PM 7 决策点的工程实现,Phase 0 接口之上扩展
> **测试**:183 / 183 pass(Phase 0 77 + Phase 1 prep 32 + PROMPT 39 74)

### Added — 类型扩展（`src/types/`）

- **`CityContent`** — 5 字段 readonly(`description` / `momentZh` / `oneObservation` / `livingNote` / `cultureNote`),PM 决策 A.3
- **`City.content?`** — City 类型加可选编辑文案层
- **`MomentSource` / `MomentSourceType`** — 7 字面量(`reuters` / `ap` / `adobe` / `shutterstock` / `wikimedia` / `unsplash` / `manual`),PM 决策 A.4
- **`Moment.sources?`** — Moment 加可选多源追溯数组
- **`MomentCaptions`** — `{ zh?: string; en?: string }`,PM 决策 A.5
- **`Moment.captions?`** — Moment 加可选 i18n 双语文案
- **`MomentCategory`** — legacy 6 字面量(`finance` / `war` / `art` / `urban` / `nature` / `romance`),PM 决策 A.7
- **`MomentEditorial`** — `{ category?: MomentCategory; editorialNote?: string }`,PM 决策 A.7
- **`Moment.editorial?`** — Moment 加可选视觉/编辑层

### Added — 库（`src/lib/`）

- **`countryI18n.ts`** — 15 国家(11 现有 + 4 预留)× zh/en 双语,PM 决策 A.2
- **`getCountryNameLocal(country_code, locale)`** — O(1) Map 查询
- **`isValidCountryCode(code)`** — 严格 ISO 3166-1 alpha-2 校验
- **`listSupportedCountryCodes()` / `listCountriesByLocale(locale)`** — 列出工具

### Added — 辅助函数

- **`hasCityContent(content)`** — CityContent 是否有任一字段
- **`countCityContentFields(content)`** — CityContent 非空字段计数(0-5)
- **`hasMomentEditorial(editorial)`** — MomentEditorial 是否有任一字段
- **`isMomentCategory(value)`** — 严格 6 category 校验
- **`isMomentSourceType(value)`** — 严格 7 source type 校验
- **`getMomentCaption(moment, locale)`** — captions[locale] > caption (legacy) > undefined

### Changed — 现有扩展

- **`src/types/city.ts`** — City 加 `content?: CityContent`
- **`src/types/moment.ts`** — Moment 加 `sources?` / `captions?` / `editorial?`(3 个独立 optional 字段)
- **`src/types/index.ts`** — 不变(已 barrel re-export)
- **`src/lib/ingestion.ts`** — source_url warning 加显式升级路径注释(Phase 1+ Editorial CMS 接入后提升为 error)
- **`package.json`** — test glob 扩展 `src/types/*.test.ts`(基础设施,支持类型测试发现)

### Documentation

- `05-项目现状/d6-global-coverage-data-architecture.md` — 字段计数笔误修正(Identity 11→12, Moment 14→17)+ disclaimer,PM 决策 A.1
- `05-项目现状/d6-phase-1-decisions-implementation.md` — 7 决策点实施报告(≥1200 字),PM 派发 PROMPT 39 v1
- spec `global-city-coverage-system-v1.0.md` §5.2 — 加注 `witness_id(代码采用,单字段)`,PM 决策 A.6(写入 Obsidian vault)

### Engineering Notes

- **0 业务文件侵入**:`src/data/cities.ts` / `liveMoments.ts` / `moments.ts` / `CityPage.tsx` 全部未触动
- **0 新依赖**:沿用 react@18.3 / react-dom@18.3 / serve@14 + Node 22 原生 test runner
- **测试覆盖**:PROMPT 39 v1 新增 74 测试(countryI18n 19 + cityContent 14 + moment.sources 12 + moment.captions 15 + momentEditorial 14)
- **向后兼容**:Phase 0 17 必填字段全部不动,所有新字段 optional
- **数据/视觉分离**:editorial / captions / sources 独立类型,不污染 Phase 0 schema
- **i18n 准备**:captions (zh/en) + countryI18n (zh/en) 双线就绪,Phase 2 UI locale-aware 渲染直接消费

### Upstream Decisions LOCKED

- A.1:报告笔误修正(选项 1)— 修改报告 + 加 disclaimer ✅
- A.2:CountryZh(选项 B)— 独立 countryI18n 表 + 查表逻辑 ✅
- A.3:编辑文案 5 字段(选项 B)— 独立 CityContent 类型 ✅
- A.4:LiveEvent sources(选项 A)— 扩展 Moment.sources[] ✅
- A.5:captions i18n(选项 A)— 扩展 Moment.captions { zh, en } ✅
- A.6:author_id / witness_id — 保留 witness_id 单字段,author_id 同义 ✅
- A.7:Moment category(选项 B)— 独立 MomentEditorial 类型 ✅

### PR 拆分

- **PR-4**:docs(report) — A.1 笔误修正(`cd65f09`)
- **PR-5**:feat/fix — A.2-A.7 工程实现(6 sub-commit)
  - A.2 countryI18n(`117a4a5`)
  - A.3 CityContent(`b381ed0`)
  - A.4 Moment.sources(`d5f2fa1`)
  - A.5 Moment.captions(`58b3416`)
  - A.7 MomentEditorial(`bbe64d4`)
  - A.6 ingestion 升级路径注释(`9a0865f`)

---

## [1.6.0] · 2026-08-19 · Phase 0 数据架构(interface-only)

> **状态**:✅ 已交付 — `codex/v1.6-p36-data-arch` 分支 3 commits(70ec7d7 → 27ba7e7 → 8bcd242)
> **核心交付**:Global City Coverage 数据架构的**接口/类型/逻辑层**,不动业务文件
> **测试**:77 / 77 pass · **类型**:0 errors · **Bundle**:229KB(与 v1.5 持平)

### Added — 类型层(`src/types/`)

- **`CityIdentity`** — 12 字段:`city_id` / `canonical_name` / `local_name?` / `alternate_names?` / `country_code` / `country_name` / `admin1_code?` / `admin1_name?` / `place_type` / `latitude` / `longitude` / `timezone`
- **`CityDynamic`** — 运行时派生字段(`local_time` / `user_time_difference` / `weather?` / `temperature?` / `sunrise?` / `sunset?`),不存盘
- **`CityVisual`** — 7 字段:`hero_media?` / `hero_source?` / `hero_creator?` / `hero_license?` / `hero_credit_requirement?` / `editorial_only?` / `visual_status?`
- **`HeroMedia`** — 5 字段:`url` / `width` / `height` / `alt` / `focus?`
- **`VisualStatus`** — `'seed' | 'placeholder' | 'none'`(缺 Hero 时不用错误图片填充)
- **`PlaceType`** — `'city' | 'town' | 'natural_place' | 'historic_site' | 'coordinates'`
- **`CityStateLevel`** — `'L0_mapped' | 'L1_contextualized' | 'L2_witnessed' | 'L3_active' | 'L4_living_archive'`
- **`CityPageState`** — `'A_seed_editorial' | 'B_active' | 'C_low_activity' | 'D_past_only' | 'E_empty'`
- **`MomentStats`** — L2+ 才有:`moments_total` / `moments_last_24h` / `moments_last_7d` / `moments_last_30d` / `last_moment_at?` / `first_moment_at?` / `unique_witnesses_*?` / `witnessed_days_last_30d?`
- **`City`** — 完整城市对象:`identity` + `visual?` + `state_level` + `page_state` + `moment_stats?`
- **`PublicCityLocation`** — 公开 API 返回,**不暴露** `raw_location`
- **`FullCityLocation`** — 后台完整对象,含 `raw_coordinates`
- **`CityResolved`** — runtime 合并视图(`city` + `dynamic`)
- **`WeatherSnapshot`** — 动态天气类型

- **`Moment`** — 17 字段:`moment_id` / `media` / `media_type` / `captured_at` / `uploaded_at` / `published_at?` / `city_id` / `public_city_name` / `raw_location?` / `location_verification?` / `witness_id?` / `caption?` / `provenance_status` / `moderation_status` / `rights_status` / `created_at` / `updated_at`
- **`MomentMedia`** — `url` / `type` / `width?` / `height?` / `alt?` / `duration_seconds?`
- **`MomentMediaType`** — `'image' | 'video' | 'audio' | 'text'`
- **`MomentTimeBucket`** — `'NOW' | 'TODAY' | 'PAST'`
- **`RawLocation`** — 受限字段:`latitude` / `longitude` / `accuracy_m?` / `altitude_m?`(后台 only)
- **`LocationVerification`** — `status` / `verified_at?` / `method?`
- **`ProvenanceStatus`** — `'self_reported' | 'trusted_source' | 'editorial' | 'unknown'`
- **`ModerationStatus`** — `'pending' | 'approved' | 'rejected' | 'flagged'`
- **`RightsStatus`** — `'cc_by' | 'cc_by_sa' | 'cc0' | 'all_rights_reserved' | 'unknown'`

### Added — 逻辑层(`src/lib/`)

- **`momentTime.ts`** — `getMomentTimeBucket(capturedAt, cityTimezone, options?)` + `NOW_WINDOW_HOURS = 1` 可配 + `isSameLocalDay` + `getCurrentLocalHour`
- **`cityState.ts`** — `getCityStateLevel(city)` + `getCityPageState(city)` + `getCityStateSnapshot()` + `getCityStateSnapshots()`
- **`locationPrivacy.ts`** — `toPublicCityLocation(city)` + `toFullLocation(city)` + `canAccessRawLocation(actor, moment)` + `canAccessCityRawCoords(actor)` + `getRawLocationSafely(actor, moment)`
- **`ingestion.ts`** — `RawCityInput` + `NormalizedCity` + `DuplicateMatch` + `validateCity(input)`(已实现)+ `toCity(normalized, visualOverride?)`(已实现)+ `buildHeroMetadata(...)`(已实现)+ `normalizeCity` / `findDuplicates` / `ingestBatch`(**Phase 3 STUB**,抛错不静默)

### Added — 工程基础设施

- **`npm run test`** — Node 22 原生 test runner,跑 `src/lib/*.test.ts`
- **`tsconfig.json: allowImportingTsExtensions: true`** — 与 v1.4 PR #29 对齐

### Documentation

- `05-项目现状/d6-global-coverage-data-architecture.md` — Phase 0 交付报告
- `05-项目现状/d6-phase-1-prep-cross-validation.md` — 代码 vs spec 字段级交叉验证
- `05-项目现状/d6-phase-1-prep-transition.md` — Phase 1 启动清单 + Gate 状态

### Engineering Notes

- **零业务文件侵入**:`src/data/cities.ts` / `liveMoments.ts` / `CityPage.tsx` / `moments.ts` 全部未触动
- **零新依赖**:沿用 react@18.3 / react-dom@18.3 / serve@14 + Node 22 原生 test runner
- **测试覆盖**:77 个 unit test(momentTime: 23, cityState: 18, locationPrivacy: 18, ingestion: 18)
- **DST 跨夏令时回归保护**:momentTime 显式测试 DST 边界不漂移
- **跨 tz 边界保护**:Tokyo TODAY / LA PAST 同 UTC 时刻分别落入正确桶

### Upstream Decisions LOCKED

- City Model: Identity + Dynamic + Visual/Seed + Moment(4 块)
- Context 数据来源:运行时从外部源获取,不写死
- NOW 时间窗口:1 小时,可配 1h / 3h / 6h
- TODAY 时间窗口:当地自然日
- City State 后台:L0-L4(5 档)
- City State 前台:A-E(5 档)
- Location 分离:`public_city_name` vs `raw_location`

---

## 版本历史(简版)

| 版本 | 日期 | 主要交付 |
|---|---|---|
| M0 | 2026-08 早期 | 9 节点时间轴 + 自转地球骨架 |
| v1.0 | 2026-08 | 见 git log(早期版本) |
| v1.1 | 2026-08 | 见 git log |
| v1.2 | 2026-08 | 见 git log |
| v1.3 | 2026-08 | PWA + a11y + Lighthouse 回归门(PR #14 / #15 / #16) |
| v1.4 | 2026-08 | 5 段 CityPage + 11 城市 + SyncMoment(PR #29 / #30) |
| v1.5 | 2026-08 | Lighthouse 优化 + hotkeys 中心化(PR #13) |
| **v1.6 Phase 0** | **2026-08-19** | **数据架构接口/类型/逻辑层(本版本)** |
| v1.6 Phase 1 | 待启动 | 业务接入(等 Gate) |

> 详细 commit 记录见 `git log --oneline`

---

## 反馈

任何质疑 / 补充直接修订本文件,version 号追加到对应版本 status 字段。