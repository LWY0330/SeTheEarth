---
title: PROMPT 36 v1 · Moment 迁移映射(legacy Moment → Universal Moment)
type: engineering-migration-mapping
version: v1.6.1
date: 2026-08-19
status: 🟡 DESIGN READY · 实施待 Phase 1 Gate
author: Codex engineering agent (Phase 1 接管)
related_docs:
  - /Users/lwy/Documents/ChatGPT/看见地球/src/types/moment.ts (new Universal Moment)
  - /Users/lwy/Documents/ChatGPT/看见地球/src/data/moments.ts (legacy v2.2.2 Moment)
  - /Users/lwy/Documents/ChatGPT/看见地球/src/data/liveMoments.ts (legacy v2.14.0 LiveEvent)
  - /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/04-路线图/global-city-coverage-system-v1.0.md §5 (spec)
  - /Users/lwy/Documents/ChatGPT/看见地球/06-PM Agent 交接/2026-08-19-pm-takeover-audit.md (liveMoments.ts:411-422 清理)
---

# PROMPT 36 v1 · Moment 迁移映射(legacy Moment → Universal Moment)

> **目的**:把现有 2 套 Moment 数据(`moments.ts` 6 条 + `liveMoments.ts` 12 条)迁移到 Universal Moment(17 字段)
> **读者**:Phase 1 工程师
> **核心结论**:⚠️ 2 套旧数据都不能直接套新 schema;**Phase 1 需拍板 4 项决策**;**独立 PR 处理 liveMoments.ts:411-422 清理**

---

## 📋 一句话结论

**`moments.ts` 6 条基础数据可通过 adapter 迁移(`city_id` 直接对齐 + `textEn → caption`);`liveMoments.ts` 12 条 LiveEvent 数据有 10-15 个新 schema 不存在的字段(scale / contentType / expiresAt / utcOffset / thumbnailUrl 等),需要 Phase 1 拍板哪些字段保留 + 哪些字段放 `CityContent` 或丢弃。`liveMoments.ts:411-422` 旧 Khartoum 文案是独立事项,PM 已拍板方案 A 删除。**

---

## 1. 现有 2 套 Moment 系统

### 1.1 `src/data/moments.ts`(v2.2.2 "此刻")

```ts
type Moment = {
  id: string;             // 6 个: nyc / gaza / paris / tokyo / cape-town / reykjavik
  cityZh: string;
  cityEn: string;
  countryZh: string;
  countryEn: string;
  lon: number;
  lat: number;
  category: MomentCategory;       // 'finance' | 'war' | 'art' | 'urban' | 'nature' | 'romance'
  categoryLabelZh: string;        // '金融' | '战火' | '艺术' | '都市' | '自然' | '浪漫'
  textZh: string;                 // 一句话叙事(中文)
  textEn: string;                 // 一句话叙事(英文)
};
```

**10 字段**,6 条静态数据,版本 v2.2.2。

### 1.2 `src/data/liveMoments.ts`(v2.14.0 "实时事件")

```ts
type LiveEvent = {
  id: string;
  cityId: string;
  cityNameZh: string;
  cityNameEn: string;
  countryZh: string;
  countryEn: string;
  category: MomentCategory;       // ← 同上,6 类
  categoryLabelZh: string;
  contentType: ContentType;       // 11 类:world/local/culture/daily-life/weather/...
  contentTypeZh: string;
  scale: Scale;                   // 5 级:global/national/regional/local/everyday
  title: string;
  description: string;
  localTime: string;              // HH:MM
  timezone: string;
  utcOffset: number;              // 与 UTC 差(小时)
  observedAt: string;             // ISO 时间
  thumbnailUrl: string;           // 48x48 缩略图
  publishedAt?: string;
  updatedAt: string;
  expiresAt?: string;
  sourceName: string;
  sourceUrl?: string;
  sourceType: SourceType;         // 6 类:local-media/official/community/...
  latitude?: number;
  longitude?: number;
};
```

**27 字段**,12 条数据,版本 v2.14.0。**比新 Universal Moment 多 10 字段**。

### 1.3 关系

- `moments.ts` 是较老的"此刻"功能数据
- `liveMoments.ts` 是后续 v2.14 增强的"实时事件"系统
- 两者都用 `MomentCategory` 但都**不在**新 Universal Moment schema
- 两者是**不同的产品功能**,Phase 1 需决定迁移范围

---

## 2. Universal `Moment` 字段清单

```ts
type Moment = {
  moment_id: string;              // 必填
  media: MomentMedia;             // 必填 { url, type, width?, height?, alt?, duration_seconds? }
  media_type: MomentMediaType;    // 必填 'image' | 'video' | 'audio' | 'text'
  captured_at: string;            // 必填 ISO,唯一决定 NOW/TODAY/PAST
  uploaded_at: string;            // 必填 ISO
  published_at?: string;          // 可选
  city_id: string;                // 必填,关联 City
  public_city_name: string;       // 必填,City 改名前的快照保留
  raw_location?: RawLocation;     // 受限(后台 only)
  location_verification?: LocationVerification;
  witness_id?: string;            // Phase 5
  caption?: string;               // 可选,文案
  provenance_status: ProvenanceStatus;     // 'self_reported' | 'trusted_source' | 'editorial' | 'unknown'
  moderation_status: ModerationStatus;     // 'pending' | 'approved' | 'rejected' | 'flagged'
  rights_status: RightsStatus;             // 'cc_by' | 'cc_by_sa' | 'cc0' | 'all_rights_reserved' | 'unknown'
  created_at: string;             // 必填 ISO
  updated_at: string;             // 必填 ISO
};
```

**17 字段**(10 必填 + 7 可选)。

---

## 3. `moments.ts` → Universal Moment 映射

### 3.1 字段映射表

| legacy Moment 字段 | new Moment 字段 | 转换 | 备注 |
|---|---|---|---|
| `id` | `moment_id` | rename | 必填 |
| `cityEn` | `public_city_name` | rename | 必填(英文) |
| `cityZh` | (无对应) | 派生 | public_city_name 只保留英文;中文通过 i18n 查 |
| `countryEn` | (无对应) | 派生 | 通过 city_id 关联 City |
| `countryZh` | (无对应) | 派生 | 同上 |
| `lon` / `lat` | `raw_location?: { latitude, longitude }` | rename + optional | 受限字段;legacy 数据可不填 raw_location(隐私优先) |
| `category` | (无对应) | **决策项** | 见 §4.1 |
| `categoryLabelZh` | (无对应) | **决策项** | 见 §4.1 |
| `textZh` | `caption?`(i18n 扩展) | **决策项** | 见 §4.2 |
| `textEn` | `caption?` | rename + optional | 单 caption 字段容纳 |
| (无) | `city_id` | 必填,从 `cityEn` 查 city slug | 6 条都有 cityEn,可查 |
| (无) | `media` | 必填,默认 `{ url: '', type: 'text' }` | 文字 Moment 用 'text' type |
| (无) | `media_type` | 必填,默认 `'text'` | |
| (无) | `captured_at` | 必填,legacy 无 → 默认 `updatedAt` 或 fixed | 见 §4.3 |
| (无) | `uploaded_at` | 必填,默认 `createdAt` 或 fixed | |
| (无) | `provenance_status` | 必填,默认 `'editorial'` | legacy 是编辑录入 |
| (无) | `moderation_status` | 必填,默认 `'approved'` | legacy 已上线 |
| (无) | `rights_status` | 必填,默认 `'unknown'` | legacy 未声明 |
| (无) | `created_at` | 必填,默认 `'2026-08-19T00:00:00Z'` 固定 | legacy 无系统时间戳 |
| (无) | `updated_at` | 必填,默认同上 | |

### 3.2 6 条数据的预演

| id | cityEn | has raw_location? | 默认 caption | validate |
|---|---|---|---|---|
| nyc | New York | ❌(legacy lat/lon 可填,但隐私考虑) | 'Wall Street 刚敲响开盘钟...' | pass(17 必填全填) |
| gaza | Gaza | ❌ | '有人在废墟里翻找家人的照片。' | pass |
| paris | Paris | ❌ | '塞纳河边的旧书摊刚开张...' | pass |
| tokyo | Tokyo | ❌ | '涩谷十字路口的红灯刚转绿...' | pass |
| cape-town | Cape Town | ❌ | '桌山的"桌布"刚被风扯开一角...' | pass |
| reykjavik | Reykjavík | ❌ | 'Hallgrímskirkja 的尖顶在等一场极光。' | pass |

**所有 6 条可迁移**(`cityEn` → `city_id` 直接对齐:`new-york` / `gaza` / `paris` / `tokyo` / `cape-town` / `reykjavik`)。

**注意**:legacy `cityEn` 与 `city_id` slug 不完全等价(如 `'New York'` → `'new-york'`、`'Reykjavík'` → `'reykjavik'`),需要小写 + 空格转 dash 的 lookup 函数。

---

## 4. `moments.ts` 迁移关键决策

### 4.1 `category` / `categoryLabelZh` 怎么办?

**问题**:legacy 有 6 类视觉标签(`finance` / `war` / `art` / `urban` / `nature` / `romance`),new Moment **没有 category 字段**。新 schema 强调"数据/视觉分离"。

**3 个方案**:

| 方案 | 描述 | 优点 | 缺点 |
|---|---|---|---|
| A) 扩展 schema,加 `category?: MomentCategory` | 简单 | schema 扩张 |
| B) 移到一个独立的 `MomentEditorial` 类型(挂在 Moment 上) | 数据/视觉分离 | 新类型 |
| C) 完全丢弃,UI 层用 `caption` 关键字匹配 | 干净 | 失去人工标签 |

**推荐**:B(独立 `MomentEditorial`)— 与 §City 4.4 一致,Phase 1 定义 `MomentEditorial = { category?: MomentCategory; tags?: string[]; tone?: MomentTone }` 挂在 MomentEditorial 上。

**用户拍板项**:Phase 1 是否同时实现 MomentEditorial 视觉标签层

### 4.2 `textZh` / `textEn` → `caption`

**问题**:legacy 双语种文案,new 只有 `caption?: string`(单语种)。

**3 个方案**:

| 方案 | 描述 | 优点 | 缺点 |
|---|---|---|---|
| A) 扩展 schema,加 `captions?: { zh?: string; en?: string }` | 支持 i18n | schema 扩张 |
| B) 只保留英文(`textEn → caption`),中文通过 i18n | 干净 | 中文 UI 需要 i18n lookup |
| C) 把 ZH + EN 拼成单 caption(`"{zh}\n\n{en}"`) | 0 schema 改 | 难解析 |

**推荐**:A(扩展 `captions`)— 与 §City 4.1 一致,Phase 1 i18n 准备就绪;若用户反对,fallback B(英文优先)。

**用户拍板项**:Phase 1 i18n 范围(中文 / 英文 / 多语言?)

### 4.3 `captured_at` 怎么办?

**问题**:legacy 无 `captured_at`,只有 `observedAt`(liveMoments)或无(moments)。`captured_at` 是必填,且是 NOW/TODAY/PAST 分桶的唯一依据。

**3 个方案**:

| 方案 | 描述 | 优点 | 缺点 |
|---|---|---|---|
| A) `captured_at = updatedAt`(legacy 假设=观测时间) | 简单 | 不一定准确 |
| B) `captured_at = createdAt`(legacy 静态数据创建时间) | 更安全 | legacy 没 createdAt |
| C) `captured_at = now()` 运行时取 | 永远 NOW 桶 | 与"过去事件"语义冲突 |

**推荐**:B(fixed `'2026-08-19T00:00:00Z'` 作为 universal "moment introduction" 锚点)— legacy 数据永远归 PAST 桶,与产品定位一致。

**工程就绪**:无需用户拍板。

### 4.4 `raw_location` 隐私默认值

**问题**:legacy `lat` / `lon` 字段存在,但 new `raw_location` 是受限字段。

**Phase 1 默认**:legacy `lat` / `lon` **不填** `raw_location`(隐私优先)→ 6 条全部 `raw_location: undefined` → 不进入 `now` hook 的精确查询,只通过 `city_id` 关联到 City 公开名。

**工程就绪**:无需用户拍板。Phase 3 Witness 上传流程接入后,再决定是否回填 raw_location(由 Witness 显式同意)。

---

## 5. `liveMoments.ts` 迁移关键决策

### 5.1 字段映射表

| legacy LiveEvent 字段 | new Moment 字段 | 转换 | 备注 |
|---|---|---|---|
| `id` | `moment_id` | rename | 必填 |
| `cityId` | `city_id` | rename + 必填 | 已对齐(12 城都用 cityId) |
| `cityNameZh` / `cityNameEn` / `countryZh` / `countryEn` | (无对应) | 派生 | 通过 city_id 关联 City |
| `category` / `categoryLabelZh` | (无对应) | **决策项** | 见 §4.1 |
| `contentType` / `contentTypeZh` / `scale` | (无对应) | **决策项** | 见 §5.2 |
| `title` / `description` | `captions?` (i18n) | **决策项** | 标题 + 描述 → captions.{zh,en} |
| `localTime` / `timezone` / `utcOffset` | (派生) | 通过 city_id 查 City.timezone 计算 | 运行时 |
| `observedAt` | `captured_at` | rename + 必填 | ✅ 直接映射 |
| `thumbnailUrl` | `media.url` | rename | media_type: `'image'` |
| `publishedAt` | `published_at` | rename + optional | ✅ |
| `updatedAt` | `updated_at` | rename + 必填 | ✅ |
| `expiresAt` | (无对应) | **决策项** | 见 §5.3 |
| `sourceName` / `sourceUrl` / `sourceType` | (无对应) | **决策项** | 见 §5.4 |
| `latitude` / `longitude` | `raw_location?` | rename + 受限 | 隐私考虑 |

### 5.2 `contentType` / `scale` 怎么办?

**问题**:legacy 有 11 `contentType` + 5 `scale` 共 16 类精细维度,new 无对应字段。

**4 个方案**:

| 方案 | 描述 | 优点 | 缺点 |
|---|---|---|---|
| A) 扩展 schema,加 `editorial?: MomentEditorial` | 与 §4.1 一致 | 完整保留 |
| B) 完全丢弃 | 干净 | 失去维度信息 |
| C) 派生 `provenance_status` + 注释 | 简化 | 信息损失 |
| D) 移到一个独立 `MomentMetadata` 表 | 数据分离 | 新表 |

**推荐**:A(扩展 `MomentEditorial`,含 `category` / `contentType` / `scale` / `tags` / `tone`)— 与 §4.1 一致,完整保留 12 条 LiveEvent 的语义。

**用户拍板项**:Phase 1 是否同步实现 `MomentEditorial`

### 5.3 `expiresAt` 怎么办?

**问题**:legacy 有过期时间,new 无。

**3 个方案**:

| 方案 | 描述 | 优点 | 缺点 |
|---|---|---|---|
| A) 扩展 schema,加 `expires_at?: string` | 完整保留 | schema 扩张 |
| B) 移到一个独立的 `MomentLifecycle` 类型 | 数据分离 | 新类型 |
| C) 丢弃,假设永久有效 | 简单 | 失去功能 |

**推荐**:A(扩展,简单加 1 行)— Phase 1 同步,无成本。

**工程就绪**:无需用户拍板。

### 5.4 `sourceName` / `sourceUrl` / `sourceType` 怎么办?

**问题**:legacy 有完整来源追溯,new 只 `provenance_status`(4 选 1)。

**3 个方案**:

| 方案 | 描述 | 优点 | 缺点 |
|---|---|---|---|
| A) 扩展 schema,加 `sources?: { name, url, type }[]` | 完整保留 | schema 扩张 |
| B) 只保留 `provenance_status`,丢 name/url | 简单 | 失去来源信息(违反 spec §17 acceptance) |
| C) 移到 CityContent / CityEditorial | 数据分离 | 失去 Moment 级来源 |

**推荐**:A(扩展) — spec §17 acceptance 明确"数据源可追溯(source_url 必填)",12 条 LiveEvent 的来源信息必须保留。

**用户拍板项**:Phase 1 来源追溯层是否同步实现

### 5.5 `liveMoments.ts:411-422` 旧 Khartoum 清理

**问题**:legacy `liveMoments.ts:411-422` 引用"喀土穆的炮弹声在凌晨三点再次响起"(category: 'war'),与 §2.8.8 Red Layer Image Ethics 冲突。

**PM 已拍板**:`06-PM Agent 交接/2026-08-19-pm-takeover-audit.md` 校正 4,前 PM + 接管 PM 共识方案 A(删除)。

**Phase 1 行动**:**独立 PR**,不与本次迁移混合;Phase 1 启动时同步处理。

---

## 6. 关键决策汇总(需用户拍板)

| # | 决策项 | 推荐 | 阻塞? |
|---|---|---|---|
| 4.1 | Moment category 字段处理 | B(MomentEditorial) | 否(可降级为 A 扩展) |
| 4.2 | captions i18n 处理 | A(扩展 `captions`) | 是(影响 Phase 1 i18n 范围) |
| 5.2 | LiveEvent contentType/scale 处理 | A(MomentEditorial) | 否(可降级为 B 丢弃) |
| 5.4 | LiveEvent sources 处理 | A(扩展 sources[]) | 是(影响 spec §17 acceptance 合规) |
| 5.5 | liveMoments.ts:411-422 清理 | 方案 A(独立 PR) | 否(独立 PR,不阻塞) |

**2 项阻塞,2 项可降级,1 项独立处理**。

---

## 7. 迁移 Adapter 签名(建议)

```ts
/**
 * Phase 1 应实现的 adapter。
 * 迁移 moments.ts(简单 6 条)和 liveMoments.ts(复杂 12 条)到 Universal Moment。
 */
export interface MomentMigrationResult {
  universal: Moment;
  validate: ValidateMomentResult; // 自建 validate 工具
  unmappedFields: string[];       // 记录未映射的 legacy 字段
  warnings: string[];             // 数据完整性警告
}

export function legacyMomentsToUniversal(
  legacyMoments: readonly LegacyMoment[],   // from moments.ts
): MomentMigrationResult[];

export function legacyLiveEventsToUniversal(
  legacyEvents: readonly LiveEvent[],        // from liveMoments.ts
  options?: {
    withEditorial?: boolean;        // 是否生成 MomentEditorial(category/contentType/scale)
    withSources?: boolean;          // 是否生成 sources[]
    withExpiresAt?: boolean;        // 是否生成 expires_at
    withCaptions?: boolean;         // 是否生成 captions.{zh,en}
  },
): MomentMigrationResult[];
```

---

## 8. 风险登记

| 风险 | 影响 | 缓解 |
|---|---|---|
| 4.2 captions i18n 未拍板 | 6 条 + 12 条文案迁移卡住 | 拍板 A 或降级 B |
| 5.4 sources 未拍板 | spec §17 acceptance 违规 | 拍板 A(扩展 sources[]) |
| liveMoments.ts:411-422 漏删 | 与 §2.8.8 Red Layer Ethics 冲突 | 独立 PR 同步处理 |
| `cityEn` → `city_id` 不对齐(如 `'New York'` → `'new-york'`) | 6 条数据校验失败 | 写 lookup 函数(slugify) |

---

## 9. 与其他迁移映射的关系

- **City 迁移映射** 见 `d6-phase-1-migration-city.md`
- **11 城市 gap analysis** 见 `d6-phase-1-gap-analysis.md`
- **PM 接管审计**(liveMoments.ts:411-422 清理方案)见 `06-PM Agent 交接/2026-08-19-pm-takeover-audit.md`

---

**最后更新**:2026-08-19(Phase 1 接管)
**下次更新**:用户对 §4.2 / §5.4 拍板后修订
**反馈**:任何质疑 / 补充直接修订本文件