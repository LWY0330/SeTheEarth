---
title: PROMPT 36 v1 · City 迁移映射(legacy City → Universal City)
type: engineering-migration-mapping
version: v1.6.1
date: 2026-08-19
status: 🟡 DESIGN READY · 实施待 Phase 1 Gate
author: Codex engineering agent (Phase 1 接管)
related_docs:
  - /Users/lwy/Documents/ChatGPT/看见地球/src/types/city.ts (new Universal City)
  - /Users/lwy/Documents/ChatGPT/看见地球/src/data/cities.ts (legacy v2.60.0 City)
  - /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/04-路线图/global-city-coverage-system-v1.0.md §4 (spec)
  - /Users/lwy/Documents/ChatGPT/看见地球/src/lib/ingestion.ts (validateCity)
  - /Users/lwy/Documents/ChatGPT/看见地球/05-项目现状/d6-phase-1-prep-cross-validation.md (字段验证)
---

# PROMPT 36 v1 · City 迁移映射(legacy City → Universal City)

> **目的**:把现有 `src/data/cities.ts` 的 12 城(v2.60.0 City 11 字段)迁移到新 Universal City 类型(Identity 12 + Visual 7 + State 2 + Stats 8)
> **读者**:Phase 1 工程师
> **核心结论**:✅ 12 城全部可迁移,8 必填字段全部齐;⚠️ 4 个语义缺口需 Phase 1 拍板方案

---

## 📋 一句话结论

**12 城全部有 `id` / `nameEn` / `countryEn` / `lat` / `lon` / `timezone` 6 个核心字段,迁移到 Universal City 的 8 必填 Identity 字段**(`city_id` / `canonical_name` / `country_code` / `country_name` / `place_type` / `latitude` / `longitude` / `timezone`)**无阻塞。** 4 个语义缺口(`countryZh` / `images[]` / `weather` / `description` + 编辑文案)需要 Phase 1 拍板,见 §4。

---

## 1. 现有 `City` 字段清单

`src/data/cities.ts:38-59`:

```ts
type City = {
  id: string;                    // ← city_id
  slug: string;                   // ← (与 id 重复,新 schema 无此字段)
  nameZh: string;                 // ← identity.local_name
  nameEn: string;                 // ← identity.canonical_name
  countryZh: string;              // ← (新 schema 无 country_zh,需 i18n)
  countryEn: string;              // ← identity.country_name
  description: string;            // ← (编辑文案,新 schema 不在 City)
  momentZh: string;               // ← (Moment 关系,新 schema 不在 City)
  lon: number;                    // ← identity.longitude
  lat: number;                    // ← identity.latitude
  images: CityImage[];            // ← (CityImage[] 4 scene,新 CityVisual.hero_media 单图)
  imageCredit?: string;           // ← visual.hero_creator
  href: string;                   // ← (派生自 city_id,新 schema 不需要)
  timezone: string;               // ← identity.timezone
  oneObservation: string;         // ← (编辑文案,新 schema 不在 City)
  weather: WeatherSnapshot;       // ← (新 schema 在 CityDynamic,运行时)
  livingNote?: string;            // ← (编辑文案,新 schema 不在 City)
  cultureNote?: string;           // ← (编辑文案,新 schema 不在 City)
  isFeatured?: boolean;           // ← (新 schema 由 state_level/page_state 推导)
};
```

**19 个字段**(5 可选)。

---

## 2. Universal `City` 字段清单

```ts
type City = {
  identity: CityIdentity;                    // 12 字段
  visual?: CityVisual;                       // 7 字段
  state_level: CityStateLevel;               // L0-L4
  page_state: CityPageState;                 // A-E
  moment_stats?: MomentStats;                // 8 字段(L2+ 才有)
};

type CityIdentity = {
  city_id: string;            // 必填
  canonical_name: string;     // 必填
  local_name?: string;        // 可选
  alternate_names?: string[]; // 可选
  country_code: string;       // 必填 ISO 3166-1 alpha-2
  country_name: string;       // 必填
  admin1_code?: string;       // 可选
  admin1_name?: string;       // 可选
  place_type: PlaceType;      // 必填 (city | town | ...)
  latitude: number;           // 必填
  longitude: number;          // 必填
  timezone: string;           // 必填 IANA
};

type CityVisual = {
  hero_media?: HeroMedia;
  hero_source?: string;
  hero_creator?: string;
  hero_license?: string;
  hero_credit_requirement?: string;
  editorial_only?: boolean;
  visual_status?: VisualStatus;
};
```

---

## 3. 字段映射表

### 3.1 1:1 直接映射 ✅

| legacy 字段 | new 字段 | 转换 | 备注 |
|---|---|---|---|
| `id` | `identity.city_id` | rename | 必填,validateCity 验 `[A-Za-z0-9_-]{1,128}` |
| `nameEn` | `identity.canonical_name` | rename | 必填 |
| `nameZh` | `identity.local_name` | rename + optional | 当前所有 12 城都填了 |
| `countryEn` | `identity.country_name` | rename | 必填 |
| `lat` | `identity.latitude` | rename | 必填,-90 ~ 90 |
| `lon` | `identity.longitude` | rename | 必填,-180 ~ 180 |
| `timezone` | `identity.timezone` | rename | 必填,IANA regex |
| `imageCredit` | `visual.hero_creator` | rename | optional |

### 3.2 需要派生 / 查表 ⚠️

| legacy 字段 | new 字段 | 派生方式 | 备注 |
|---|---|---|---|
| `countryZh` | (无对应) | i18n lookup | 见 §4.1 |
| (无) | `identity.country_code` | ISO 3166-1 查表 | **必填**,需 country → country_code mapping(12 城) |
| (无) | `identity.admin1_code` | 暂无数据 | warning 接受,Phase 3 接入 GeoNames 后补 |
| (无) | `identity.admin1_name` | 暂无数据 | warning 接受,Phase 3 接入 GeoNames 后补 |
| (无) | `identity.alternate_names` | 暂无数据 | warning 接受 |
| (无) | `identity.place_type` | **默认 'city'** | 必填,12 城全是 city 没问题 |

### 3.3 数据结构重组 ⚠️

| legacy 字段 | new 字段 | 重组 |
|---|---|---|
| `images: CityImage[]` | `visual.hero_media` (单图) | 见 §4.2 — 选 `images[scene='landmark']` 作 hero? |
| `weather: WeatherSnapshot` | `CityDynamic.weather` (运行时) | 见 §4.3 |

### 3.4 超出 City schema 范围,需新模型 ⚠️

| legacy 字段 | 当前语义 | Phase 1 决策 |
|---|---|---|
| `description` | 城市整体描述(长文,中英) | 见 §4.4 — `CityContent` 独立表? |
| `momentZh` | "此刻"叙事 | 见 §4.4 — 与 Moment 关系? |
| `oneObservation` | 单条观察 | 见 §4.4 |
| `livingNote` | 当地生活注记 | 见 §4.4 |
| `cultureNote` | 文化背景注记 | 见 §4.4 |

### 3.5 删除 / 派生 ⚠️

| legacy 字段 | 处理 |
|---|---|
| `slug` | 删除(与 id 重复) |
| `href` | 删除(派生自 city_id) |
| `isFeatured` | 删除(新 schema 由 state_level/page_state 推导;v1.3 PR #11b 动态算法需重写) |

---

## 4. 关键 Phase 1 决策项

### 4.1 `countryZh` 怎么办?

**问题**:legacy 有中文国名(`countryZh: '日本'`),新 schema 只有 `country_name`(英文)。

**3 个方案**:

| 方案 | 描述 | 优点 | 缺点 |
|---|---|---|---|
| A) 扩展 schema,加 `country_name_local?: string` | 简单直接 | 1 行 schema 改动 |
| B) 独立 i18n 表(`countryI18n[country_code]`) | 符合 spec §4.2 "i18n" 原则 | 需要新表 + 查表逻辑 |
| C) 不存中文国名,运行时从代码常量查 | 零运行时数据库成本 | 需要在代码里硬编码 12 个映射 |

**推荐**:B(独立 i18n 表)— 符合 "i18n" 产品方向,Phase 2 i18n 系统就绪后只需加 `countryI18n` + `cityI18n` 两张表。Phase 1 可选最小落地:C(代码常量,够用)。

**用户拍板项**:Phase 1 i18n 范围(中文 / 英文 / 多语言?)

### 4.2 `images[]` → `hero_media` 怎么映射?

**问题**:legacy 是 4 scene 数组(`landmark` / `nature` / `street` / `culture`),new 是单图 `hero_media`。

**4 个方案**:

| 方案 | 描述 | 优点 | 缺点 |
|---|---|---|---|
| A) 选 `images[scene='landmark']` 作 hero | 简单,DayPeriod 主时区原则 | 损失其他 3 张 |
| B) 扩展 schema,加 `gallery_media?: HeroMedia[]` | 保留 4 张 | schema 扩张 |
| C) 保留 `images[]` 在 CityVisual 外,**新增** `gallery_media` | 完全保留 | 双轨制 |
| D) 移到一个独立的 `CityGallery` 字段 | 数据/视觉分离 | 需要新表 |

**推荐**:A(选 landmark 作 hero)+ 把 4 张作为 v1.5 已有 `images[]` 保留(老 schema 不动)— 渐进迁移,Phase 2 再考虑 B/C/D。

**用户拍板项**:Phase 1 是否同时重构 4 scene → 单 hero?(建议否,渐进)

### 4.3 `weather` 静态 vs 运行时

**问题**:legacy 是静态快照(`{ summary: '晴', temperatureC: 28, icon: 'sun' }`),新 schema 是运行时派生。

**3 个方案**:

| 方案 | 描述 | 优点 | 缺点 |
|---|---|---|---|
| A) 静态保留作 fallback,运行时优先覆盖 | 平滑过渡 | 12 城都有 fallback |
| B) 删静态,运行时永远由 `useWeather` hook 派生 | 干净 | 12 城无 fallback,首次加载空 |
| C) 静态保留在编辑层,运行时单独处理 | 分离 | 需要新字段 |

**推荐**:A(渐进) — 当前 `useWeather.ts` hook 已存在,运行时优先;若 hook 未取到数据,fallback 静态;Phase 2 静态字段可保留在 `CityEditorial` 上下文(待 §4.4 拍板)。

**技术就绪**:无需用户拍板。

### 4.4 编辑文案(`description` / `momentZh` / `oneObservation` / `livingNote` / `cultureNote`)

**问题**:这 5 个字段是城市编辑内容的核心,但 Universal City schema **没有**。Phase 0 spec §4 没有定义 "Editorial Content" 块。

**3 个方案**:

| 方案 | 描述 | 优点 | 缺点 |
|---|---|---|---|
| A) 扩展 schema,加 `editorial?: CityEditorial` | 简单 | 8 字段编辑块,City 类型变胖 |
| B) 独立 `CityContent` 类型/表,运行时挂在 City 上 | 数据/视觉分离 | 新类型 + loader |
| C) 当作 Context,运行时从 Contentful / Markdown 拉 | 与 Context source policy 一致 | Phase 1 阻塞(等 Gate) |

**推荐**:B(独立 `CityContent` 类型)— Phase 1 定义类型 + 1 个静态 `cityContent.ts` 数据源;Phase 2+ 接 Context source policy 后改为运行时拉取。**用户拍板项**:编辑文案最终来源(代码常量 vs CMS vs Markdown vs Context source)。

**用户拍板项**:Phase 1 编辑文案迁移策略(A / B / C)

---

## 5. ISO 3166-1 alpha-2 查表(必填,迁移必做)

12 城 → country_code 映射(可直接落地):

| countryEn | country_code |
|---|---|
| Japan | JP |
| Portugal | PT |
| China | CN |
| Mexico | MX |
| Brazil | BR |
| Iceland | IS |
| South Africa | ZA |
| United Kingdom | GB |
| Germany | DE |
| Italy | IT |
| Australia | AU |
| Sudan (待 Khartoum 接入) | SD |

**实现方式**:Phase 1 在 `src/lib/countryCode.ts` 加 `COUNTRY_CODE_BY_EN` 常量(12 项)+ `getCountryCode(countryName: string): string | null` 函数。`getCountryCode('Japan')` → `'JP'`。

---

## 6. 建议的迁移 Adapter 签名

```ts
/**
 * Phase 1 应实现的 adapter。
 * 把 legacy City(来自 src/data/cities.ts)转成 Universal City。
 */
export function legacyToUniversal(
  legacy: LegacyCity,
  options?: {
    /** Country code lookup (Phase 1 默认从 COUNTRY_CODE_BY_EN 查) */
    countryCodeLookup?: Record<string, string>;
    /** CityContent(Phase 1 可选) */
    content?: CityContent;
  },
): {
  city: City;
  validate: ValidateResult;     // 跑 validateCity
  unmappedFields: string[];      // 记录无法直接映射的字段
};
```

返回 unit 应包含 `validate` 字段 — 让 Phase 1 工程师在迁移 12 城时,立即看到每城的 validate 结果(应该全 pass)。

---

## 7. 12 城迁移预演

### 7.1 12 城 validate 预演结果

`validateCity` 校验 8 必填字段(`city_id` / `canonical_name` / `country_code` / `country_name` / `place_type` / `latitude` / `longitude` / `timezone`)+ warnings(`admin1_code` / `local_name` / `alternate_names`):

| City | city_id | canonical | country_code | country_name | place_type | lat | lon | tz | validate |
|---|---|---|---|---|---|---|---|---|---|
| kyoto | ✅ | ✅ | ✅ JP | ✅ | ⚠️ 缺 | ✅ | ✅ | ✅ | pass + 4 warns |
| lisbon | ✅ | ✅ | ✅ PT | ✅ | ⚠️ 缺 | ✅ | ✅ | ✅ | pass + 4 warns |
| shanghai | ✅ | ✅ | ✅ CN | ✅ | ⚠️ 缺 | ✅ | ✅ | ✅ | pass + 4 warns |
| mexico-city | ✅ | ✅ | ✅ MX | ✅ | ⚠️ 缺 | ✅ | ✅ | ✅ | pass + 4 warns |
| tokyo | ✅ | ✅ | ✅ JP | ✅ | ⚠️ 缺 | ✅ | ✅ | ✅ | pass + 4 warns |
| rio | ✅ | ✅ | ✅ BR | ✅ | ⚠️ 缺 | ✅ | ✅ | ✅ | pass + 4 warns |
| reykjavik | ✅ | ✅ | ✅ IS | ✅ | ⚠️ 缺 | ✅ | ✅ | ✅ | pass + 4 warns |
| cape-town | ✅ | ✅ | ✅ ZA | ✅ | ⚠️ 缺 | ✅ | ✅ | ✅ | pass + 4 warns |
| london | ✅ | ✅ | ✅ GB | ✅ | ⚠️ 缺 | ✅ | ✅ | ✅ | pass + 4 warns |
| berlin | ✅ | ✅ | ✅ DE | ✅ | ⚠️ 缺 | ✅ | ✅ | ✅ | pass + 4 warns |
| rome | ✅ | ✅ | ✅ IT | ✅ | ⚠️ 缺 | ✅ | ✅ | ✅ | pass + 4 warns |
| sydney | ✅ | ✅ | ✅ AU | ✅ | ⚠️ 缺 | ✅ | ✅ | ✅ | pass + 4 warns |

**所有 12 城 pass `validateCity` 必填**(`place_type` 默认填 `'city'`,warnings 允许)。

### 7.2 预计 warnings(每城 4 条)

每城都会收到以下 4 条 warnings(非阻塞):
1. `admin1_code 缺失(一级行政区代码)`
2. `admin1_name 缺失(一级行政区名)`
3. `local_name 缺失(本地语言名)` — 注:legacy `nameZh` 是填了的,所以这条实际不触发
4. `alternate_names 为空数组` — 注:12 城都没填 alternate_names

实际 warnings 数 = **3 条 / 城**(因为 `local_name` 可从 `nameZh` 填)。

**Phase 3 接入 GeoNames 后,这些 warnings 可消除**。

---

## 8. 迁移执行清单(给 Phase 1 工程师)

### 8.1 必须做(P0)

- [ ] 创建 `src/lib/countryCode.ts`,加 12 项 ISO 3166-1 mapping
- [ ] 创建 `src/lib/legacyCityAdapter.ts`,实现 `legacyToUniversal(legacyCity)`:
  - 8 必填字段全填
  - `place_type` 默认 `'city'`
  - `local_name` 从 `nameZh` 填(消除 1 warning)
  - `visual.hero_media` 从 `images[scene='landmark']` 派生
  - `visual.hero_creator` 从 `imageCredit` 填
  - `visual.visual_status` = `'seed'`(11 城都已 self-host 图,符合 seed 定义)
  - `state_level` 默认 `'L0_mapped'`
  - `page_state` 默认 `'E_empty'`
  - `moment_stats` undefined(暂无 Moment 关系)
- [ ] 写 `legacyCityAdapter.test.ts`,12 城全跑一遍 + 断言 validate 通过

### 8.2 必须拍板(P1)

- [ ] §4.1 countryZh / i18n 方案 — 用户拍板
- [ ] §4.2 images[] → hero_media 方案 — 用户拍板
- [ ] §4.3 weather 静态/运行时方案 — 工程默认(A 渐进)
- [ ] §4.4 编辑文案方案(A/B/C)— 用户拍板

### 8.3 暂不做

- ❌ 不迁移 `images[]` 4 scene → 单 hero(渐进,留 v1.5 不动)
- ❌ 不迁移 `weather` 静态 → 运行时 hook(渐进,fallback 保留)
- ❌ 不重写 `getFeaturedCities` 算法(等 Phase 2 state-based)
- ❌ 不实现 Context source policy(等 Gate)

---

## 9. 与其他迁移映射的关系

- **Moment 迁移映射** 见 `d6-phase-1-migration-moment.md`
- **11 城市 gap analysis** 见 `d6-phase-1-gap-analysis.md`

---

## 10. 风险登记

| 风险 | 影响 | 缓解 |
|---|---|---|
| §4.4 编辑文案方案未拍板 | City 类型可能扩张 / 拆表 | 提前与用户对齐 |
| §4.2 images 重组激进 | 12 城视觉降级 | 选 A(渐进) |
| `getFeaturedCities` 是 v1.3 PR #11b 算法 | 迁移后 isFeatured 删除,算法空转 | 写"isFeatured 暂时写死 6 城" 兜底 |

---

**最后更新**:2026-08-19(Phase 1 接管)
**下次更新**:用户对 §4.1 / §4.4 拍板后修订
**反馈**:任何质疑 / 补充直接修订本文件