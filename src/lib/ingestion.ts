/* ============================================================
   看见地球 · v1.6 · PROMPT 36 Phase 0 · Data Ingestion Pipeline
   ------------------------------------------------------------
   - §11 Data Source Architecture · §12 City Ingestion Pipeline
   - Phase 0 只定义接口与最小 validateCity 实现
   - normalizeCity / findDuplicates 是 Phase 3 stub（throw NotImplemented）
   - 不批量导入全球数据（Phase 3 才做）
   ============================================================ */

import type {
  City,
  CityIdentity,
  HeroMedia,
  CityVisual,
  CityStateLevel,
  CityPageState,
} from '@/types';

/* ---------- Raw Input（外部数据源 → City Master 的中间态） ---------- */

/**
 * 单条原始城市数据。
 * 字段含义：
 * - source_id:     数据源内部 ID（如 GeoNames ID 1234567）
 * - source_name:   数据源名（如 "GeoNames" "Wikipedia" "OpenWeather"）
 * - source_license:数据 license（如 "CC BY 4.0"）
 * - source_url:    数据条目原始链接（可追溯）
 * - fetched_at:    抓取时间（ISO）
 * - raw_payload:   原始 JSON（保留用于审计 + Phase 3 字段映射）
 */
export interface RawCityInput {
  source_id: string;
  source_name: string;
  source_license: string;
  source_url?: string;
  fetched_at: string;
  raw_payload: unknown;
}

/* ---------- Normalized（已规范化但未去重） ---------- */

/**
 * NormalizedCity = RawCityInput 经 normalizeCity() 规范化后的中间态。
 * 字段定义与 CityIdentity 一一对应；额外带 source_url 用于追溯。
 */
export interface NormalizedCity {
  identity: CityIdentity;
  /** 来源原始 URL（§17 Data acceptance："数据源可追溯"） */
  source_url?: string;
  /** 来源 license */
  source_license?: string;
  /** 来源名（GeoNames / Wikipedia / ...） */
  source_name?: string;
  /** 抓取时间 */
  fetched_at?: string;
  /** 抓取时数据快照（用于审计 + 后期 diff） */
  raw_payload?: unknown;
}

/* ---------- Duplicate Match（去重候选） ---------- */

/**
 * DuplicateMatch = findDuplicates() 输出的"可能是重复城市"列表
 * - match_type:
 *   - exact_id:    source_id 精确匹配（同一城市不同源）
 *   - fuzzy_name:  名称模糊匹配（同英文名 + 不同 country）
 *   - geo_proximity: 坐标邻近（< X km）
 * - confidence: 0-1 置信度
 * - reasons:    判定依据数组
 */
export interface DuplicateMatch {
  matched_city_id: string;
  match_type: 'exact_id' | 'fuzzy_name' | 'geo_proximity';
  confidence: number;
  reasons: string[];
}

/* ---------- normalizeCity (Phase 3 STUB) ---------- */

/**
 * 规范化 RawCityInput → NormalizedCity。
 *
 * Phase 0: 接口定义；实现标 NotImplemented。
 * Phase 3: 实接 GeoNames / Wikipedia / OpenWeather / Editorial override。
 *
 * 实现要求（Phase 3 计划）：
 * 1. 根据 source_name 选 mapping 表（GeoNames / Wikipedia / ...）
 * 2. 字段映射 → CityIdentity
 * 3. 处理同 city 不同语言（multilingual fallback）
 * 4. 处理别名 / 历史名 → alternate_names
 * 5. 异常坐标 / 时区检测 → 标记（不抛出）
 *
 * 不允许：
 * - 因 Context 字段缺失阻塞城市创建（§12.2）
 * - 用国家级数据伪装城市数据（§12.2）
 * - 通过随机图片填补 Hero（§12.2）
 */
export function normalizeCity(_input: RawCityInput): NormalizedCity {
  throw new Error(
    '[ingestion] normalizeCity() 是 Phase 3 STUB；' +
    'Phase 0 只定义接口，不实现实接。' +
    'See 04-路线图/global-city-coverage-system-v1.0.md §12.',
  );
}

/* ---------- findDuplicates (Phase 3 STUB) ---------- */

/**
 * 在已有 City[] 中找与目标城市重复的候选。
 *
 * Phase 0: 接口定义；实现标 NotImplemented。
 * Phase 3 实现要求：
 * 1. exact_id: 相同 source_id（多源合并）
 * 2. fuzzy_name: canonical_name 模糊匹配 + country_code 相同
 * 3. geo_proximity: |lat| < 0.1° && |lon| < 0.1°（≈ 10km 内）
 * 4. 输出按 confidence 倒序
 */
export function findDuplicates(
  _city: NormalizedCity,
  _candidates: readonly City[],
): DuplicateMatch[] {
  throw new Error(
    '[ingestion] findDuplicates() 是 Phase 3 STUB；' +
    'Phase 0 只定义接口。',
  );
}

/* ---------- validateCity (Phase 0 已实现) ---------- */

/**
 * 验证校验结果。
 * - valid: 是否通过
 * - errors: 错误清单（每条可读消息）
 * - warnings: 非阻塞警告（如 admin1_code 缺失）
 */
export interface ValidateResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/** ISO 3166-1 alpha-2 严格校验（2 个字母） */
const COUNTRY_CODE_RE = /^[A-Z]{2}$/;
/** IANA timezone 简化校验：Area/Location */
const TIMEZONE_RE = /^[A-Z][a-zA-Z0-9_+-]*\/[A-Za-z0-9_+-]+$/;
/** city_id 格式：字母数字 + dash + underscore，长度 1-128 */
const CITY_ID_RE = /^[A-Za-z0-9_-]{1,128}$/;

/**
 * 验证 NormalizedCity 必填字段（最小校验：Identity 7 字段）
 * - §12.1 必须解决：坐标异常 / 时区异常 / 名称缺失
 * - §12.2 不允许：用错误国家级数据伪装（不在 validateCity 检查，留给数据导入）
 *
 * Phase 0 最小校验 7 字段：
 * 1. city_id
 * 2. canonical_name
 * 3. country_code
 * 4. country_name
 * 5. place_type
 * 6. latitude（-90 ~ 90）
 * 7. longitude（-180 ~ 180）
 * 8. timezone（IANA 格式）
 */
export function validateCity(city: NormalizedCity): ValidateResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const i = city.identity;

  // 1. city_id
  if (!i.city_id || !CITY_ID_RE.test(i.city_id)) {
    errors.push('city_id 缺失或格式不合法（仅允许字母数字 + dash + underscore，长度 1-128）');
  }

  // 2. canonical_name
  if (!i.canonical_name || i.canonical_name.trim().length === 0) {
    errors.push('canonical_name 必填且不能为空字符串');
  }

  // 3. country_code
  if (!i.country_code || !COUNTRY_CODE_RE.test(i.country_code)) {
    errors.push('country_code 必须是 ISO 3166-1 alpha-2 格式（2 个大写字母）');
  }

  // 4. country_name
  if (!i.country_name || i.country_name.trim().length === 0) {
    errors.push('country_name 必填');
  }

  // 5. place_type
  const validPlaceTypes: ReadonlyArray<typeof i.place_type> = [
    'city', 'town', 'natural_place', 'historic_site', 'coordinates',
  ];
  if (!i.place_type || !validPlaceTypes.includes(i.place_type)) {
    errors.push(`place_type 不合法（"${i.place_type}"）`);
  }

  // 6. latitude
  if (typeof i.latitude !== 'number' || Number.isNaN(i.latitude)
      || i.latitude < -90 || i.latitude > 90) {
    errors.push(`latitude 越界（"${i.latitude}"，合法范围 -90 ~ 90）`);
  } else if (i.latitude === 0 && i.longitude === 0) {
    // Null Island（0,0）→ 数据缺失标记；不阻塞但告警
    warnings.push('坐标 (0,0) 可能是数据缺失标记（Null Island）');
  }

  // 7. longitude
  if (typeof i.longitude !== 'number' || Number.isNaN(i.longitude)
      || i.longitude < -180 || i.longitude > 180) {
    errors.push(`longitude 越界（"${i.longitude}"，合法范围 -180 ~ 180）`);
  }

  // 8. timezone
  if (!i.timezone || !TIMEZONE_RE.test(i.timezone)) {
    errors.push(`timezone 必须是 IANA 格式（"Area/Location"，如 "Asia/Shanghai"）`);
  }

  // 非阻塞 warnings
  if (!i.admin1_code) {
    warnings.push('admin1_code 缺失（一级行政区代码）');
  }
  if (!i.local_name) {
    warnings.push('local_name 缺失（本地语言名）');
  }
  if (i.alternate_names?.length === 0) {
    warnings.push('alternate_names 为空数组');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/* ---------- NormalizedCity → City（Phase 0 已实现） ---------- */

/**
 * 把 NormalizedCity 升格为 City。
 * - 默认 state_level = 'L0_mapped'（无 moment_stats）
 * - 默认 page_state   = 'E_empty'（无 moment_stats）
 * - 无 visual（Phase 1+ 由 editorial override 填）
 *
 * Phase 0 用于：
 * - 数据导入管道内部流转
 * - 单元测试
 *
 * Phase 1+ 由 CityResolver 服务 + moment_stats 计算器填视觉与状态字段。
 */
export function toCity(
  normalized: NormalizedCity,
  overrides?: {
    visual?: CityVisual;
    state_level?: CityStateLevel;
    page_state?: CityPageState;
  },
): City {
  const city: City = {
    identity: normalized.identity,
    state_level: overrides?.state_level ?? 'L0_mapped',
    page_state: overrides?.page_state ?? 'E_empty',
  };
  if (overrides?.visual) {
    city.visual = overrides.visual;
  }
  return city;
}

/* ---------- IngestionResult（批量导入结果聚合） ---------- */

/**
 * 单条 import 的结果。
 */
export interface IngestionRecordResult {
  source_id: string;
  /** 'ingested' | 'duplicate' | 'rejected' */
  status: 'ingested' | 'duplicate' | 'rejected';
  city_id?: string;
  errors?: string[];
  duplicates?: DuplicateMatch[];
}

/**
 * Phase 0: 接口定义；Phase 3 由 worker 池实接。
 * 流程：Raw → Normalize → Validate → Dedupe → City Master → Context Enrich → Publish
 */
export interface IngestionBatchResult {
  total: number;
  ingested: number;
  duplicated: number;
  rejected: number;
  records: IngestionRecordResult[];
}

export function ingestBatch(
  _inputs: readonly RawCityInput[],
  _existing: readonly City[],
): IngestionBatchResult {
  throw new Error(
    '[ingestion] ingestBatch() 是 Phase 3 STUB；' +
    'Phase 0 只定义接口。',
  );
}

/* ---------- Hero helper ---------- */

/**
 * 把 HeroMedia 与 source 元数据打包成 CityVisual.hero_* 字段。
 * - Phase 0 用于单元测试；Phase 1+ 由 editorial CMS 调用
 */
export function buildHeroMetadata(
  hero: HeroMedia,
  source: { source: string; creator?: string; license: string; creditRequirement?: string },
): CityVisual {
  return {
    hero_media: hero,
    hero_source: source.source,
    hero_creator: source.creator,
    hero_license: source.license,
    hero_credit_requirement: source.creditRequirement,
    visual_status: 'seed',
  };
}
