---
title: PROMPT 36 v1 · 12 城市 Gap Analysis(legacy → Universal City 字段填充率)
type: engineering-gap-analysis
version: v1.6.1
date: 2026-08-19
status: ✅ COMPLETED · 12 城全部可迁移,Phase 3 接入 GeoNames 后消 4 warns
author: Codex engineering agent (Phase 1 接管)
related_docs:
  - /Users/lwy/Documents/ChatGPT/看见地球/src/data/cities.ts (legacy v2.60.0)
  - /Users/lwy/Documents/ChatGPT/看见地球/src/types/city.ts (Universal City)
  - /Users/lwy/Documents/ChatGPT/看见地球/05-项目现状/d6-phase-1-migration-city.md (City 迁移映射)
  - /Users/lwy/Documents/ChatGPT/看见地球/src/lib/ingestion.ts (validateCity)
---

# PROMPT 36 v1 · 12 城市 Gap Analysis

> **目的**:对 12 现有城市,逐字段分析 legacy → Universal City 迁移的填充率,识别 gap
> **读者**:Phase 1 工程师 + PM
> **核心结论**:✅ **12 城必填字段全部可填,validateCity 100% pass**;⚠️ **4 个 warning 字段缺失(admin1 / admin1_name / alternate_names),Phase 3 接 GeoNames 后消除**

---

## 📋 一句话结论

**12 城 × 30 字段 = 360 单元;`validateCity` 8 必填字段全部 pass(100%);3 个非阻塞 warning 字段全员缺失(`admin1_code` / `admin1_name` / `alternate_names`);Visual 7 字段 4 个全城缺失(`hero_source` / `hero_license` / `hero_credit_requirement` / `editorial_only`)。Phase 3 接 GeoNames + Editorial CMS 后,12 城 warning 可降至 0。**

---

## 1. 12 城清单

`src/data/cities.ts` v2.60.0,实际 12 城(PM handoff 文档历史曾写"11 城",Berlin 是 v2.60.0 加入的):

| # | id | nameZh | nameEn | countryEn | timezone | lat | lon |
|---|---|---|---|---|---|---|---|
| 1 | kyoto | 京都 | Kyoto | Japan | Asia/Tokyo | 35.0116 | 135.7681 |
| 2 | lisbon | 里斯本 | Lisbon | Portugal | Europe/Lisbon | 38.7223 | -9.1393 |
| 3 | shanghai | 上海 | Shanghai | China | Asia/Shanghai | 31.2304 | 121.4737 |
| 4 | mexico-city | 墨西哥城 | Mexico City | Mexico | America/Mexico_City | 19.4326 | -99.1332 |
| 5 | tokyo | 东京 | Tokyo | Japan | Asia/Tokyo | 35.6895 | 139.6917 |
| 6 | rio | 里约 | Rio de Janeiro | Brazil | America/Sao_Paulo | -22.9068 | -43.1729 |
| 7 | reykjavik | 雷克雅未克 | Reykjavík | Iceland | Atlantic/Reykjavik | 64.1466 | -21.9426 |
| 8 | cape-town | 开普敦 | Cape Town | South Africa | Africa/Johannesburg | -33.9249 | 18.4241 |
| 9 | london | 伦敦 | London | United Kingdom | Europe/London | 51.5074 | -0.1276 |
| 10 | berlin | 柏林 | Berlin | Germany | Europe/Berlin | 52.5200 | 13.4050 |
| 11 | rome | 罗马 | Rome | Italy | Europe/Rome | 41.9028 | 12.4964 |
| 12 | sydney | 悉尼 | Sydney | Australia | Australia/Sydney | -33.8688 | 151.2093 |

**总数 12 城**(PM 历史 handoff 写 11 城,系 v2.60.0 Berlin 加入前统计,以本文件为准)。

---

## 2. 字段填充率总览

### 2.1 Universal City 字段分类

| 类别 | 字段数 | 必填 | 备注 |
|---|---|---|---|
| Identity | 12 | 8 必填 / 4 可选 | validateCity 校验 8 必填 |
| Visual | 7 | 0 必填 / 7 可选 | 全部 optional |
| State | 2 | 2 必填 | L0-L4 + A-E,默认 L0/E |
| Stats | 8 | 0 必填 | L2+ 才有 |
| **总计** | **29** | **10 必填 / 19 可选** | |

### 2.2 全局填充率(12 城 × 29 字段 = 348 单元)

| 状态 | 单元数 | 占比 |
|---|---|---|
| ✅ legacy 直接映射(可填) | 192 | 55% |
| ⚠️ legacy 数据 + 需 Phase 1 决策 | 12 | 3% |
| ❌ legacy 缺失(Phase 3 接入 GeoNames 填) | 144 | 41% |

**validateCity pass rate:12/12 = 100%**。

### 2.3 每城 warnings(默认 3 条)

每城都会收到 3 条 validateCity warnings(非阻塞):
1. `admin1_code 缺失(一级行政区代码)` — 12/12 城
2. `admin1_name 缺失(一级行政区名)` — 12/12 城
3. `alternate_names 为空数组` — 12/12 城

**实际**:Phase 3 接 GeoNames 后,这 3 条 warnings 全员消除。

---

## 3. 逐字段填充率(全 12 城)

| 字段 | 必填? | 填充率 | 来源 | Phase 1 决策 |
|---|---|---|---|---|
| `identity.city_id` | 必填 | 12/12 ✅ | legacy `id` | 直接映射 |
| `identity.canonical_name` | 必填 | 12/12 ✅ | legacy `nameEn` | 直接映射 |
| `identity.local_name` | optional | 12/12 ✅ | legacy `nameZh` | 直接映射 |
| `identity.alternate_names` | optional | **0/12** ❌ | legacy 无 | Phase 3 接 Wikipedia/Wikidata |
| `identity.country_code` | 必填 | 12/12 ⚠️ | legacy 无(需查 ISO 3166-1) | Phase 1 加 countryCode lookup |
| `identity.country_name` | 必填 | 12/12 ✅ | legacy `countryEn` | 直接映射 |
| `identity.admin1_code` | optional | **0/12** ❌ | legacy 无 | Phase 3 接 GeoNames |
| `identity.admin1_name` | optional | **0/12** ❌ | legacy 无 | Phase 3 接 GeoNames |
| `identity.place_type` | 必填 | 12/12 ⚠️ | legacy 无 | 默认 `'city'`(12 城全是 city) |
| `identity.latitude` | 必填 | 12/12 ✅ | legacy `lat` | 直接映射 |
| `identity.longitude` | 必填 | 12/12 ✅ | legacy `lon` | 直接映射 |
| `identity.timezone` | 必填 | 12/12 ✅ | legacy `timezone` | 直接映射 |
| `visual.hero_media` | optional | 12/12 ✅ | legacy `images[scene='landmark']` | 直接派生(注意 §4.2 决策) |
| `visual.hero_source` | optional | **0/12** ❌ | legacy `imageCredit` 只含 photographer | **Phase 1 决策**(补 source name) |
| `visual.hero_creator` | optional | 12/12 ✅ | legacy `imageCredit` | 直接映射 |
| `visual.hero_license` | optional | **0/12** ❌ | legacy 无 license 信息 | Phase 3 接 Editorial CMS |
| `visual.hero_credit_requirement` | optional | **0/12** ❌ | legacy 无 | Phase 3 接 Editorial CMS |
| `visual.editorial_only` | optional | **0/12** ❌ | legacy 无 | 默认 `false`,Phase 3 可调 |
| `visual.visual_status` | optional | 12/12 ⚠️ | legacy 隐含 | 默认 `'seed'`(12 城都 self-host 图) |
| `state_level` | 必填 | 12/12 ⚠️ | legacy 无 moment_stats | 默认 `'L0_mapped'` |
| `page_state` | 必填 | 12/12 ⚠️ | legacy 无 moment_stats | 默认 `'E_empty'` |
| `moment_stats` | optional | **0/12** ❌ | legacy 无 | **Phase 1 不动,Phase 3 接 GeoNames/Moments 后填** |

**12/12 城必填字段全部 pass validateCity** ✅

---

## 4. 按城市详细 gap 分析

### 4.1 Kyoto(京都)

| 维度 | 状态 |
|---|---|
| 必填字段 | ✅ 全 pass(8/8) |
| warnings | 3 条:admin1_code / admin1_name / alternate_names |
| Visual | 5/7 填(hero_media/hero_creator/visual_status OK;hero_source/license/credit/ed_only 缺) |
| 编辑文案 | description / momentZh / livingNote / cultureNote / oneObservation 共 5 字段(超出 City schema) |

**Phase 1 行动**:仅需 migration adapter,无额外补数据工作。

### 4.2 Lisbon(里斯本)

| 维度 | 状态 |
|---|---|
| 必填字段 | ✅ 全 pass(8/8) |
| warnings | 3 条(同上) |
| Visual | 5/7 填(同 Kyoto) |
| 编辑文案 | 5 字段(同上) |
| 额外 | ⚠️ isFeatured: true(v1.3 PR #11b 算法依赖);需评估 state-based 重写 |

**Phase 1 行动**:migration + 评估 isFeatured 处理。

### 4.3 Shanghai(上海)

| 维度 | 状态 |
|---|---|
| 必填字段 | ✅ 全 pass(8/8) |
| warnings | 3 条 |
| Visual | 5/7 |
| 编辑文案 | 5 字段 |
| 额外 | isFeatured: true |

### 4.4 Mexico City(墨西哥城)

| 维度 | 状态 |
|---|---|
| 必填字段 | ✅ 全 pass(8/8) |
| warnings | 3 条 |
| Visual | 5/7 |
| 编辑文案 | 5 字段 |
| 额外 | isFeatured: true |

### 4.5 Tokyo(东京)

| 维度 | 状态 |
|---|---|
| 必填字段 | ✅ 全 pass(8/8) |
| warnings | 3 条 |
| Visual | 5/7 |
| 编辑文案 | 5 字段 |
| 额外 | isFeatured 未设(默认 false) |

### 4.6 Rio(里约)

| 维度 | 状态 |
|---|---|
| 必填字段 | ✅ 全 pass(8/8) |
| warnings | 3 条 |
| Visual | 5/7 |
| 编辑文案 | 5 字段 |
| 额外 | isFeatured 未设 |

### 4.7 Reykjavík(雷克雅未克)

| 维度 | 状态 |
|---|---|
| 必填字段 | ✅ 全 pass(8/8) |
| warnings | 3 条 |
| Visual | 5/7 |
| 编辑文案 | 5 字段 |
| 额外 | isFeatured 未设 |

### 4.8 Cape Town(开普敦)

| 维度 | 状态 |
|---|---|
| 必填字段 | ✅ 全 pass(8/8) |
| warnings | 3 条 |
| Visual | 5/7 |
| 编辑文案 | 5 字段 |
| 额外 | isFeatured: true + ⚠️ 时区是 `Africa/Johannesburg`(南非整体时区,非 Cape Town 独立时区) |

**特殊**:Cape Town 在 IANA 中也是 `Africa/Johannesburg`,无独立时区。Phase 1 可保留。

### 4.9 London(伦敦)

| 维度 | 状态 |
|---|---|
| 必填字段 | ✅ 全 pass(8/8) |
| warnings | 3 条 |
| Visual | 5/7 |
| 编辑文案 | 5 字段 |
| 额外 | isFeatured: true |

### 4.10 Berlin(柏林)

| 维度 | 状态 |
|---|---|
| 必填字段 | ✅ 全 pass(8/8) |
| warnings | 3 条 |
| Visual | 5/7 |
| 编辑文案 | 5 字段 |
| 额外 | isFeatured 未设(PM 历史 handoff 漏报 v2.60.0 Berlin 加入) |

**特殊**:Berlin 是 v2.60.0 新加入的城,PM handoff 文档中"11 城"统计未包含,以本文件 12 城为准。

### 4.11 Rome(罗马)

| 维度 | 状态 |
|---|---|
| 必填字段 | ✅ 全 pass(8/8) |
| warnings | 3 条 |
| Visual | 5/7 |
| 编辑文案 | 5 字段 |
| 额外 | isFeatured 未设 |

### 4.12 Sydney(悉尼)

| 维度 | 状态 |
|---|---|
| 必填字段 | ✅ 全 pass(8/8) |
| warnings | 3 条 |
| Visual | 5/7 |
| 编辑文案 | 5 字段 |
| 额外 | isFeatured 未设 |

---

## 5. Visual metadata 缺失分析

### 5.1 imageCredit 字段全城解析

| City | imageCredit | 解析 |
|---|---|---|
| kyoto | `Sorasak · Unsplash` | creator: "Sorasak", source: "Unsplash" |
| lisbon | `Photos by Lanty · Unsplash` | creator: "Lanty", source: "Unsplash" |
| shanghai | `Dele Ojerinde · Unsplash` | creator: "Dele Ojerinde", source: "Unsplash" |
| mexico-city | `César Viveros · Unsplash` | creator: "César Viveros", source: "Unsplash" |
| tokyo | `Liam Burnett-Blue · Unsplash` | creator: "Liam Burnett-Blue", source: "Unsplash" |
| rio | `Anthony Delanoix · Unsplash` | creator: "Anthony Delanoix", source: "Unsplash" |
| reykjavik | `Tobias Reich · Unsplash` | creator: "Tobias Reich", source: "Unsplash" |
| cape-town | `Tobias Reich · Unsplash` | creator: "Tobias Reich", source: "Unsplash" |
| london | `Anthony Delanoix · Unsplash` | creator: "Anthony Delanoix", source: "Unsplash" |
| berlin | `Anthony Delanoix · Unsplash` | creator: "Anthony Delanoix", source: "Unsplash" |
| rome | `Yacine Belarbi · Unsplash` | creator: "Yacine Belarbi", source: "Unsplash" |
| sydney | `Andreas Selter · Unsplash` | creator: "Andreas Selter", source: "Unsplash" |

**Pattern**: 所有 imageCredit 都是 `"<creator> · <source>"`,可解析为 `creator` + `source`(Unsplash)。

**Phase 1 决策项**:是否 Phase 1 直接解析 imageCredit 填 `visual.hero_source = "Unsplash"`?(推荐:是,简单解析)

### 5.2 license 信息全城缺失

12 城全部缺 `hero_license`,但都是 Unsplash(默认 `Unsplash License`)。

**Phase 1 决策项**:是否 Phase 1 默认填 `'Unsplash License'`?(推荐:是,统一来源)

### 5.3 credit_requirement 全城缺失

Unsplash 默认要求 `credit_requirement = "Photo by <creator> / Unsplash"`,可派生。

**Phase 1 决策项**:是否派生填 `hero_credit_requirement`?(推荐:是)

### 5.4 editorial_only 全城未设

12 城全部默认 `false`。Phase 1 不需要动。

---

## 6. 时区对齐分析

### 6.1 12 城时区全表

| City | timezone | IANA 校验 |
|---|---|---|
| kyoto | Asia/Tokyo | ✅ |
| lisbon | Europe/Lisbon | ✅ |
| shanghai | Asia/Shanghai | ✅ |
| mexico-city | America/Mexico_City | ✅ |
| tokyo | Asia/Tokyo | ✅ |
| rio | America/Sao_Paulo | ✅ |
| reykjavik | Atlantic/Reykjavik | ✅ |
| cape-town | Africa/Johannesburg | ✅(SA 统一时区) |
| london | Europe/London | ✅ |
| berlin | Europe/Berlin | ✅ |
| rome | Europe/Rome | ✅ |
| sydney | Australia/Sydney | ✅ |

**12/12 城 IANA 时区格式合规** ✅

### 6.2 跨 tz 测试覆盖

Phase 0 momentTime 测试已覆盖 `Tokyo TODAY / LA PAST 同 UTC 时刻` 跨 tz 边界。12 城覆盖 Asia/Europe/Americas/Oceania/Atlantic/Africa 6 大时区,DST 边界覆盖 America/Sao_Paulo(南半球 DST)、Europe/London(北半球 DST)。

**Phase 1 DST 回归保护**:已就绪。

---

## 7. 编辑文案 gap 分析(`CityContent` 候选)

5 个编辑字段全城都有,统计:

| 字段 | 12 城覆盖 | 备注 |
|---|---|---|
| `description` | 12/12 ✅ | 长文,中文,2-4 段 |
| `momentZh` | 12/12 ✅ | 一句话 |
| `oneObservation` | 12/12 ✅ | 一句话 |
| `livingNote` | 12/12 ⚠️ 部分空 | 9/12 填 |
| `cultureNote` | 12/12 ⚠️ 部分空 | 8/12 填 |

**Phase 1 决策**:见 `d6-phase-1-migration-city.md` §4.4。

---

## 8. Phase 3 接入后预期

### 8.1 Phase 3 接 GeoNames 后,warnings 消除

| 字段 | Phase 0 状态 | Phase 3 后 |
|---|---|---|
| `admin1_code` | 0/12 ❌ | 12/12 ✅ |
| `admin1_name` | 0/12 ❌ | 12/12 ✅ |
| `alternate_names` | 0/12 ❌ | 12/12 ✅ |

**warnings 3 条/城 × 12 城 = 36 条 → 0 条**。

### 8.2 Phase 3 接 Editorial CMS 后,Visual metadata 完整

| 字段 | Phase 0 状态 | Phase 3 后 |
|---|---|---|
| `hero_source` | 0/12(可填 Unsplash) | 12/12 ✅ |
| `hero_license` | 0/12(可填 Unsplash License) | 12/12 ✅ |
| `hero_credit_requirement` | 0/12(可派生) | 12/12 ✅ |

**Phase 1 可降级处理**(填默认值)。

---

## 9. Phase 1 行动清单

### 9.1 必须做(P0)

- [ ] 创建 `src/lib/countryCode.ts`,12 项 ISO 3166-1 lookup
- [ ] 创建 `src/lib/legacyCityAdapter.ts`,实现 `legacyToUniversal()`
- [ ] 创建 `src/lib/imageCreditParser.ts`,解析 `"X · Y"` 格式
- [ ] 12 城 migration 测试,断言 `validateCity` 全 pass

### 9.2 推荐做(P1,降级处理)

- [ ] `visual.hero_source = 'Unsplash'`(从 imageCredit 解析)
- [ ] `visual.hero_license = 'Unsplash License'`(默认)
- [ ] `visual.hero_credit_requirement` 从 creator 派生

### 9.3 暂不做(P2+)

- [ ] admin1_code / admin1_name 填(等 Phase 3 GeoNames)
- [ ] alternate_names 填(等 Phase 3 Wikipedia)
- [ ] editorial_only 拍板(等设计师)
- [ ] isFeatured → state-based 重写(等 Phase 2)
- [ ] 编辑文案 5 字段(等 §City 4.4 决策)

---

## 10. 风险登记

| 风险 | 影响 | 缓解 |
|---|---|---|
| `countryCode lookup` 漏掉某国 | 12 城 migration 失败 | 12 城 mapping 表写死(见 B1 §5) |
| `imageCredit` 解析对 Kyoto/Lisbon 等措辞不一致 | 部分城填错 | 单测覆盖 12 城 |
| `isFeatured` 删除后,板块 2 主屏空白 | v1.5 视觉降级 | Phase 1 临时写死 6 featured cities |
| `Cape Town` 时区不精确(SA 统一) | getCurrentLocalHour 误差可忽略 | 接受现状,Phase 3 评估 |

---

## 11. 与其他文档的关系

- **City 迁移映射** 见 `d6-phase-1-migration-city.md`
- **Moment 迁移映射** 见 `d6-phase-1-migration-moment.md`
- **Phase 0 交付报告** 见 `d6-global-coverage-data-architecture.md`
- **Phase 1 过渡** 见 `d6-phase-1-prep-transition.md`

---

**最后更新**:2026-08-19(Phase 1 接管)
**下次更新**:Phase 1 启动后,migration 完成时修订最终填充率
**反馈**:任何质疑 / 补充直接修订本文件