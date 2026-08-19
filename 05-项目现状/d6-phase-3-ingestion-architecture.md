---
title: PROMPT 36 v1 · Phase 3 Ingestion 架构设计
type: engineering-architecture-doc
version: v1.6.1
date: 2026-08-19
status: 🟡 DESIGN READY · 实施待 Phase 3 启动
author: Codex engineering agent (Phase 1 接管)
related_docs:
  - /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/04-路线图/global-city-coverage-system-v1.0.md §11 §12
  - /Users/lwy/Documents/ChatGPT/看见地球/src/lib/ingestion.ts (Phase 0 接口)
  - /Users/lwy/Documents/ChatGPT/看见地球/05-项目现状/d6-phase-1-migration-city.md
  - /Users/lwy/Documents/ChatGPT/看见地球/05-项目现状/d6-phase-1-migration-moment.md
  - /Users/lwy/Documents/ChatGPT/看见地球/05-项目现状/d6-phase-1-gap-analysis.md
---

# PROMPT 36 v1 · Phase 3 Ingestion 架构设计

> **目的**: 设计 Phase 3 数据导入管道的架构(50 → 500 → 5000 城市),包括 normalizeCity / findDuplicates / ingestBatch 的实现约束
> **读者**: Phase 3 工程师 + PM
> **核心结论**: ✅ 接口已稳定; ⚠️ 实施需 4 类外部数据源 + Editorial CMS; ⏳ Phase 1 Gate 拍板后启动

---

## 📋 一句话结论

**Phase 3 = 把 4 类外部数据源(GeoNames / Wikipedia / OpenWeather / Editorial Override)的 RawCityInput 经 normalizeCity → validateCity → findDuplicates → ingestBatch → City Master 流程批量导入,目标 50 → 500 → 5000 城。接口已在 Phase 0 稳定,实现按 §3 规范;Phase 3 启动需 4 类数据源授权 + Editorial CMS 就绪 + Context source policy 拍板。**

---

## 1. 范围与目标

### 1.1 Phase 3 范围(spec §11 + §12)

```text
Phase 3 目标
  ├─ 50 城市压测  → 500 城市 → 5000 城市(全量)
  ├─ 4 数据源接源  → GeoNames / Wikipedia / OpenWeather / Editorial Override
  ├─ Context 富化  → Context source policy 拍板后接入
  ├─ Witness 系统  → Phase 5(不属于 Phase 3)
  └─ City Master  → 唯一权威,运行时只读
```

### 1.2 Phase 3 不做

- ❌ Witness 上传流程(Phase 5)
- ❌ Earth Explore 地图可视化(Phase 4)
- ❌ Search 系统(Phase 4)
- ❌ 不在 Phase 3 引入新依赖(沿用 Phase 0/1 的零依赖原则)

### 1.3 Phase 3 启动条件

| 前置 | 状态 | 阻塞? |
|---|---|---|
| Phase 0 接口稳定 | ✅ | 无 |
| Phase 1 业务接入完成 | ⏳ Phase 1 Gate 后 | 是 |
| 4 类数据源授权 | ⏳ 用户/PM | 是 |
| Context source policy | ⏳ Phase 1 Gate 3 | 是 |
| Editorial CMS 选型 | ⏳ 用户拍板 | 是 |

---

## 2. 整体架构

### 2.1 数据流

```text
┌─────────────┐
│ External    │  GeoNames / Wikipedia / OpenWeather / Editorial CMS
│ Sources     │
└──────┬──────┘
       │ fetch (raw HTTP / API)
       ↓
┌─────────────┐
│ RawCityInput│  source_id / source_name / source_license / source_url / fetched_at / raw_payload
└──────┬──────┘
       │ normalizeCity(source-specific mapping)
       ↓
┌─────────────┐
│NormalizedCity│  CityIdentity + source_url / source_license / source_name / fetched_at / raw_payload
└──────┬──────┘
       │ validateCity (8 必填字段)
       ↓
┌─────────────┐
│  Validated  │  + ValidateResult{valid, errors[], warnings[]}
└──────┬──────┘
       │ findDuplicates (against existing City[])
       ↓
┌─────────────┐
│ Deduplicated│  + DuplicateMatch[] (confidence 排序)
└──────┬──────┘
       │ ingestBatch (dedupe + insert to City Master)
       ↓
┌─────────────┐
│ City Master │  Single source of truth, runtime 只读
└─────────────┘
       │
       ↓ (async)
┌─────────────┐
│ Context     │  spec §4.2:运行时从外部源获取
│ Enrichment  │  CompositeContextSource([Wikipedia, GeoNames, OpenWeather])
└──────┬──────┘
       │
       ↓
┌─────────────┐
│  CityPage   │  Universal City + CityContext + CityDynamic → render plan → React
└─────────────┘
```

### 2.2 模块边界

| 模块 | 职责 | 输入 | 输出 |
|---|---|---|---|
| `SourceFetcher` | 拉外部数据源 | API key / endpoint | `RawCityInput[]` |
| `normalizeCity` | source-specific 字段映射 | `RawCityInput` | `NormalizedCity` |
| `validateCity` | 字段校验 | `NormalizedCity` | `ValidateResult` |
| `findDuplicates` | 重复检测 | `NormalizedCity` + `City[]` | `DuplicateMatch[]` |
| `ingestBatch` | 批量导入编排 | `RawCityInput[]` + `City[]` | `IngestionBatchResult` |
| `CityMasterStore` | 持久化(读/写) | `City` | `City` |
| `ContextSource`(Phase 1) | 运行时 Context 拉取 | `City` | `CityContext` |

---

## 3. 关键函数实现约束

### 3.1 `normalizeCity(input: RawCityInput): NormalizedCity`

**Phase 3 实现要求**(spec §12):

1. 根据 `input.source_name` 选 mapping 表:
   - `'GeoNames'` → GeoNames field mapping
   - `'Wikipedia'` → Wikipedia infobox mapping
   - `'OpenWeather'` → weather snapshot mapping
   - `'Editorial'` → Editorial CMS mapping
2. 字段映射 → `CityIdentity`:
   ```ts
   GeoNames fields → CityIdentity:
     geonameId         → city_id
     name              → canonical_name
     alternateNames    → alternate_names
     countryCode       → country_code
     countryName       → country_name
     admin1Code        → admin1_code
     admin1Name        → admin1_name
     featureCode       → place_type  (PPL → 'city', PPLA → 'city', PPLA2 → 'town')
     lat               → latitude
     lng               → longitude
     timezone          → timezone  (从 IANA 库查)
   ```
3. 处理多语言 fallback:`canonical_name` 优先英文,`local_name` 填本地方言
4. 别名 / 历史名 → `alternate_names[]`
5. 异常坐标 / 时区检测 → 标记(不抛出)
6. `source_url` = 原数据条目 URL(`'https://www.geonames.org/{geonameId}'`)
7. `fetched_at` = ISO 时间戳

**不允许**:
- ❌ 因 Context 字段缺失阻塞城市创建
- ❌ 用国家级数据伪装城市数据
- ❌ 通过随机图片填补 Hero(`visual_status` 默认 `'placeholder'`,不爬图)

### 3.2 `findDuplicates(city: NormalizedCity, candidates: readonly City[]): DuplicateMatch[]`

**Phase 3 实现要求**:

```ts
// 三层去重,按 confidence 倒序输出
1. exact_id:           candidate.identity.city_id === candidate city_id (高置信度 1.0)
2. fuzzy_name:         candidate canonical_name 模糊匹配 + country_code 相同 (置信度 0.7-0.9)
3. geo_proximity:      |lat| < 0.1° && |lon| < 0.1° (≈ 10km 内) (置信度 0.4-0.6)
```

**模糊匹配算法建议**:Levenshtein distance ≤ 2 + canonical 转小写 + 去除变音符(如 `Reykjavík` → `reykjavik`)

**输出排序**:confidence 倒序(高置信度在前)

**review policy**:
- confidence ≥ 0.9 → 自动 merge(覆盖)
- 0.7 ≤ confidence < 0.9 → 人工 review(写入 `duplicate_review_queue`)
- confidence < 0.7 → 视为独立城市,新增

### 3.3 `ingestBatch(inputs: RawCityInput[], existing: readonly City[]): IngestionBatchResult`

**Phase 3 实现要求**:

```ts
function ingestBatch(inputs, existing) {
  const records = [];
  for (const input of inputs) {
    try {
      const normalized = normalizeCity(input);
      const validated = validateCity(normalized);
      if (!validated.valid) {
        records.push({ source_id: input.source_id, status: 'rejected', errors: validated.errors });
        continue;
      }
      const dupes = findDuplicates(normalized, existing);
      if (dupes.some(d => d.confidence >= 0.9)) {
        records.push({ source_id: input.source_id, status: 'duplicate', duplicates: dupes });
        continue;
      }
      const city = toCity(normalized);
      CityMasterStore.upsert(city);
      records.push({ source_id: input.source_id, status: 'ingested', city_id: city.identity.city_id });
    } catch (e) {
      records.push({ source_id: input.source_id, status: 'rejected', errors: [String(e)] });
    }
  }
  return {
    total: inputs.length,
    ingested: records.filter(r => r.status === 'ingested').length,
    duplicated: records.filter(r => r.status === 'duplicate').length,
    rejected: records.filter(r => r.status === 'rejected').length,
    records,
  };
}
```

**不允许**:
- ❌ 静默失败(必须 records 反馈)
- ❌ 批量吞错(逐条处理,单条失败不影响其他)
- ❌ Context 字段缺失阻塞导入

### 3.4 `SourceFetcher`(Phase 3 新增)

**职责**: 拉外部数据源,生成 `RawCityInput`

```ts
interface SourceFetcher {
  readonly source_name: string;     // 'GeoNames' / 'Wikipedia' / 'OpenWeather' / 'Editorial'
  fetch(offset: number, limit: number): Promise<RawCityInput[]>;
}
```

**Phase 3 实现**:
- `GeoNamesSourceFetcher`: 调 GeoNames API,fetched_at = ISO,rate limit = 2000/天(free tier)
- `WikipediaSourceFetcher`: 调 Wikipedia REST API,rate limit = 200/次
- `OpenWeatherSourceFetcher`: 当前不做(weather 是运行时,不进 RawCityInput)
- `EditorialSourceFetcher`: 调 Editorial CMS(待选型)

**注意**:`OpenWeather` 不直接进 ingestion 管道,因为 weather 是 `CityDynamic`(运行时),不进 City 静态数据。Phase 3 ingest 时不填 weather,运行时由 `useWeather` hook 取。

### 3.5 `CityMasterStore`(Phase 3 新增)

**职责**: 持久化 City Master

**存储选项**(用户拍板):

| 选项 | 优点 | 缺点 |
|---|---|---|
| A) JSON 文件 + Git LFS | 简单,可 diff | 不支持实时更新 |
| C) SQLite | 单文件,易部署 | 写入需读写锁 |
| D) PostgreSQL | 完整 DB | 需要 server |
| E) Cloud Firestore | 实时同步 | 引入 GCP 依赖 |

**推荐**:B(JSON 文件 + Git LFS)— 适合 Phase 3 起步,50-500 城量级;Phase 4+ Witness 写入高并发再考虑 C/D。

**Phase 3 起步**:JSON 文件 `data/city-master.json`,CI 校验格式 + validateCity 100% pass。

---

## 4. 50 → 500 → 5000 阶段计划

### 4.1 Phase 3a · 50 城市压测

**目标**:验证 ingestion 管道 + 4 数据源接源

**50 城选**:
- 现有 12 城(Kyoto / Lisbon / Shanghai / Mexico City / Tokyo / Rio / Reykjavík / Cape Town / London / Berlin / Rome / Sydney)
- Khartoum(moments:LOCKED 后接入)
- Lisbon(等 Yellow Layer LOCKED)
- 35 精选城(覆盖 6 大洲 + 12 时区 + 多种 place_type)

**验收**:
- ✅ 50 城全部 pass `validateCity`
- ✅ `findDuplicates` 不误报(零 false positive)
- ✅ bundle size 增长 ≤ 30KB
- ✅ build 时间 ≤ 1s

### 4.2 Phase 3b · 500 城市

**目标**:扩展到 500 城(覆盖全球主要首都 + 经济中心)

**验收**:
- ✅ 500 城全 pass
- ✅ Context 富化接入(Wikipedia 主 + GeoNames 补)
- ✅ Search 系统 Phase 4 启动可消费 City Master

### 4.3 Phase 3c · 5000 城市

**目标**:5000 城(覆盖全球主要城镇)

**验收**:
- ✅ 5000 城全 pass
- ✅ `findDuplicates` 误报率 < 1%
- ✅ City Master 文件 < 5MB(JSON / Git LFS)

---

## 5. 与 Context Source 的协作

### 5.1 责任分离

```text
Ingestion  → 静态 City 数据(Identity / Visual / State)
Context    → 动态 Context 数据(spec §4.2:population / languages / currency / ...)
Dynamic    → 运行时派生(local_time / weather / sunrise / sunset)
```

**Phase 3 ingest 只填静态字段**,Context 由 `CompositeContextSource` 运行时拉取。

### 5.2 Context 富化触发

```text
City Master 写入 → 触发 ContextSource 拉取 → CityContext 写入(可选 cache)
```

**Phase 3c + 启动 Context 富化**(用户拍板 Context source policy 后)。

---

## 6. 错误处理与监控

### 6.1 错误处理矩阵

| 阶段 | 错误类型 | 处理 |
|---|---|---|
| SourceFetcher | API 失败 / rate limit | retry 3 次 + backoff,失败记日志 |
| normalizeCity | 字段缺失 / 非法 | `validateCity` 警告,records.rejected |
| validateCity | 必填字段缺失 | records.rejected,errors[] |
| findDuplicates | 候选集为空 | 视为无重复 |
| ingestBatch | 任何 throw | records.rejected,errors[] |
| CityMasterStore | 写入失败 | records.rejected,errors[] |

**原则**:逐条处理,单条失败不影响整体;records 反馈完整结果。

### 6.2 监控指标(Phase 3c 接入)

```text
- total / ingested / duplicated / rejected 计数
- 4 数据源成功率 / 平均延迟
- findDuplicates 误报率 / 漏报率
- validateCity warnings 分布
- Context 富化命中率 / 失败率
```

---

## 7. 性能预算

| 操作 | 预算 | Phase 3a 实际 |
|---|---|---|
| 单次 normalizeCity | ≤ 5ms | ⏳ 测 |
| 单次 validateCity | ≤ 1ms | 18 测试 < 1ms ✅ |
| 单次 findDuplicates(500 城) | ≤ 100ms | ⏳ 测 |
| ingestBatch 50 城 | ≤ 5s | ⏳ 测 |
| City Master JSON 文件大小(5000 城) | ≤ 5MB | ⏳ 测 |
| 启动时 City Master 加载 | ≤ 200ms | ⏳ 测 |

---

## 8. 数据源授权矩阵

### 8.1 4 数据源

| Source | 用途 | License | Phase 3 必需 | Phase 3a | Phase 3b | Phase 3c |
|---|---|---|---|---|---|---|
| GeoNames | city_id / lat / lon / admin1 / population | CC BY 4.0 | ✅ | ✅ | ✅ | ✅ |
| Wikipedia | description / languages / currency / alternate_names | CC BY-SA | ⚠️ | — | ✅ | ✅ |
| OpenWeather | weather (运行时,不入 ingestion) | 商业 | ⚠️ | — | — | ✅ |
| Editorial CMS | description (中文) / hero metadata | 项目自有 | ✅ | ✅ | ✅ | ✅ |

### 8.2 授权清单(需用户/PM 推进)

- [ ] GeoNames API key + 使用条款确认
- [ ] Wikipedia attribution 模板(CC BY-SA 要求)
- [ ] OpenWeather API key + 商业条款
- [ ] Editorial CMS 选型(Contentful vs Sanity vs Strapi vs 自建)

---

## 9. 风险登记

| 风险 | 影响 | 缓解 |
|---|---|---|
| GeoNames rate limit | 50 城可能需分天拉 | 持久化 raw_payload,断点续传 |
| Wikipedia CC BY-SA 污染 Editorial | 文案需重写 | Phase 3b Editorial CMS 上线后 |
| OpenWeather 商业授权成本 | Phase 3c 阻塞 | 预算评估 |
| `findDuplicates` 误报 | 城市被错误合并 | 0.7-0.9 置信度走人工 review |
| Editorial CMS 选型延迟 | Phase 3 启动阻塞 | 用户拍板 |
| `media` / `media_type` 字段冗余 | 数据建模有歧义 | Phase 1+ 加注 + spec §5.2 修正 |

---

## 10. 与其他文档的关系

- **City 迁移映射** 见 `d6-phase-1-migration-city.md`
- **Moment 迁移映射** 见 `d6-phase-1-migration-moment.md`
- **12 城市 gap analysis** 见 `d6-phase-1-gap-analysis.md`
- **Phase 0 交付报告** 见 `d6-global-coverage-data-architecture.md`

---

**最后更新**: 2026-08-19(Phase 1 接管)
**下次更新**: Phase 3 启动前,4 数据源授权 + Editorial CMS 选型后修订
**反馈**: 任何质疑 / 补充直接修订本文件