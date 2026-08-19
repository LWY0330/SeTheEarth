# Changelog

所有项目的"显著变更"记录于此。格式基于 [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),版本号遵循 [Semantic Versioning](https://semver.org/spec/v2.0.0.html)。

> **注意**:本文件由工程团队维护,记录用户可见的变更(功能 / 行为 / API)。纯内部重构、重命名、依赖升级等记录在 commit message,不全部进 changelog。

---

## [Unreleased]

### Planning — v1.6 Phase 1
- 启动条件:4 项设计 Gate 拍板(Lisbon Yellow Layer / 4-screen → V2 Mapping / Context source policy / Khartoum mockup LOCKED)
- 详见 `05-项目现状/d6-phase-1-prep-transition.md`

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