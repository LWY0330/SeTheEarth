/* ============================================================
   看见地球 · v1.6 · PROMPT 36 Phase 0 · City 类型
   ------------------------------------------------------------
   - 简化模型：Identity + Dynamic + Visual/Seed + State
   - 不含静态 Context 字段（Context 运行时从外部源获取）
   - 对齐 04-路线图/global-city-coverage-system-v1.0.md §3 §4
   - §4.1 Identity 11 字段全部定义
   - §4.3 Dynamic 标记 "runtime derived，不存盘"
   - §4.4 Visual / Editorial Seed 7 字段
   ============================================================ */

/* ---------- Identity（必填，存盘字段） ---------- */

/**
 * place_type 在 v1 锁定为 city / town 两类；
 * 预留 'natural_place' / 'historic_site' / 'coordinates' 等 future 类型扩展位
 * （见 Global City Coverage §3.1 工程必须保留 place_type）
 */
export type PlaceType = 'city' | 'town' | 'natural_place' | 'historic_site' | 'coordinates';

export interface CityIdentity {
  /** 稳定唯一 ID：slug 或 GeoNames ID（保证全球可追溯） */
  city_id: string;
  /** 规范化展示名（英文 / 国际通用） */
  canonical_name: string;
  /** 本地语言名（可选） */
  local_name?: string;
  /** 别名 / 历史名 / 多语言（如 "Reykjavík" / "Reykjavik"） */
  alternate_names?: string[];
  /** ISO 3166-1 alpha-2（如 "JP" "CN" "US"） */
  country_code: string;
  /** ISO 3166-1 名称（"Japan" / "中国"） */
  country_name: string;
  /** 一级行政区代码（province / state / region） */
  admin1_code?: string;
  /** 一级行政区名 */
  admin1_name?: string;
  /** 地点类型（v1: city | town；future: 扩展位） */
  place_type: PlaceType;
  /** 城市中心坐标 — 后端 canonical（不暴露原始 GPS） */
  latitude: number;
  longitude: number;
  /** IANA timezone（如 "Europe/Lisbon" "Asia/Shanghai"） */
  timezone: string;
}

/* ---------- Dynamic（运行时计算，不存盘） ---------- */

/**
 * 天气快照类型（与 src/data/cities.ts WeatherSnapshot 对齐；
 * 此处定义为独立类型，避免 cities.ts 改字段影响 v1.6 schema）
 */
export interface WeatherSnapshot {
  summary: string;
  temperatureC: number;
  icon: string;
}

/**
 * 动态字段：runtime derived，不进入静态数据集。
 * 规则（Global City Coverage §4.3）：
 * - local_time / user_time_difference 由浏览器 Intl.DateTimeFormat 计算
 * - weather / temperature / sunrise / sunset 由 live provider 提供
 * - 不得把动态值作为静态城市数据长期写死
 */
export interface CityDynamic {
  /** 当地自然时间 HH:MM（runtime） */
  local_time: string;
  /** 与用户时区差（runtime，如 "+8H"） */
  user_time_difference: string;
  /** live provider；缺失即 UI 隐藏 */
  weather?: WeatherSnapshot;
  /** 摄氏度 */
  temperature?: number;
  /** HH:MM（live） */
  sunrise?: string;
  /** HH:MM（live） */
  sunset?: string;
}

/* ---------- Visual / Editorial Seed（设计师可填） ---------- */

/**
 * Visual Status：
 * - seed: Seed City 有完整 Hero（Kyoto/Khartoum/Lisbon 等）
 * - placeholder: 用系统级地理视觉 / Context 模式占位
 * - none: 无 Hero（Empty City 默认）
 * 规则（Global City Coverage §4.4）：缺 Hero 时不用错误图片填充
 */
export type VisualStatus = 'seed' | 'placeholder' | 'none';

export interface HeroMedia {
  url: string;
  width: number;
  height: number;
  /** a11y alt */
  alt: string;
  /** CSS object-position（如 "50% 30%"） */
  focus?: string;
}

export interface CityVisual {
  hero_media?: HeroMedia;
  /** URL 或 self-host 路径 */
  hero_source?: string;
  hero_creator?: string;
  hero_license?: string;
  /** 是否必须显式 credit（如 "Photo by X / Unsplash"） */
  hero_credit_requirement?: string;
  /** true = 编辑锁定，普通 citypage 渲染时禁用 */
  editorial_only?: boolean;
  visual_status?: VisualStatus;
}

/* ---------- State（后台 L0-L4 + 前台 A-E） ---------- */

import type { CityStateLevel, CityPageState } from './cityState';

/* ---------- MomentStats（L2+ 才有） ---------- */

/**
 * 衍生统计：仅在 L2_witnessed 及以上才有数据；
 * L0/L1 城市 moment_stats 为 undefined。
 *
 * 设计原则（§6 City State）：
 * - moments_last_24h / witnesses_last_24d → L3 判定
 * - witnessed_days_last_30d → L4 判定（连续度）
 * - last_moment_at / first_moment_at → D_past_only 判定
 *
 * 注：Phase 0 不强制要求字段填充；Phase 3 导入 50/500 城时补齐。
 */
export interface MomentStats {
  moments_total: number;
  moments_last_24h: number;
  moments_last_7d: number;
  moments_last_30d: number;
  /** ISO timestamp；undefined = 从未有 Moment */
  last_moment_at?: string;
  /** ISO timestamp */
  first_moment_at?: string;
  unique_witnesses_total?: number;
  unique_witnesses_last_30d?: number;
  /** 30 天内实际被记录的日数（连续度指标） */
  witnessed_days_last_30d?: number;
}

/* ---------- 完整 City 对象 ---------- */

export interface City {
  identity: CityIdentity;
  visual?: CityVisual;
  /** 后台成熟度（运营/技术） */
  state_level: CityStateLevel;
  /** 前台产品状态（用户可见） */
  page_state: CityPageState;
  /** 仅 L2+ 才有 */
  moment_stats?: MomentStats;
}

/**
 * 公开的 City Location（前台 + API 返回）
 * - 不暴露 raw_location（§5.4 Location Privacy）
 */
export interface PublicCityLocation {
  city_id: string;
  public_city_name: string;
  country_code: string;
  country_name: string;
  admin1_name?: string;
}

/**
 * 内部 Full Location（含 raw coords）
 * - 仅 backend 可访问
 */
export interface FullCityLocation extends PublicCityLocation {
  timezone: string;
  raw_coordinates: {
    latitude: number;
    longitude: number;
  };
}

/**
 * CityResolved：runtime 合并 City + CityDynamic 的视图
 * - Phase 0 定义接口；Phase 1+ 由 CityResolver 工厂实现
 */
export interface CityResolved {
  city: City;
  dynamic: CityDynamic;
}
