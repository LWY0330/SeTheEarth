/* ============================================================
   看见地球 · v1.6 · PROMPT 36 Phase 0 · Moment 类型
   ------------------------------------------------------------
   - 对齐 04-路线图/global-city-coverage-system-v1.0.md §5
   - §5.2 Required Fields 14 字段全部定义
   - §5.3 captured_at 唯一决定时间桶
   - §5.4 raw_location 标注"后台 only"
   - §19 Provenance / Moderation / Rights 状态枚举
   ============================================================ */

/* ---------- 时间桶 ---------- */

/**
 * Moment 的时间分桶（§5.3 Time Rules）
 * - NOW:   最近 N 小时（默认 NOW_WINDOW_HOURS = 1，可在 src/lib/momentTime.ts 配）
 * - TODAY: 当地自然日内（local_timezone 当日 00:00 - 23:59）
 * - PAST:  当地自然日之前
 */
export type MomentTimeBucket = 'NOW' | 'TODAY' | 'PAST';

/* ---------- 媒体 ---------- */

export type MomentMediaType = 'image' | 'video' | 'audio' | 'text';

export interface MomentMedia {
  url: string;
  type: MomentMediaType;
  width?: number;
  height?: number;
  /** a11y alt（image / video 必填） */
  alt?: string;
  /** 音视频时长（秒） */
  duration_seconds?: number;
}

/* ---------- 位置 ---------- */

/**
 * 原始 GPS — 受限字段（§5.4 Location Privacy）
 * - 公开 API 永远不返回
 * - 仅 admin / moderator 在 audit context 可访问
 * - Witness 仅可访问自己上传 Moment 的 raw_location
 */
export interface RawLocation {
  latitude: number;
  longitude: number;
  /** GPS 精度（米） */
  accuracy_m?: number;
  /** GPS 海拔（米） */
  altitude_m?: number;
}

/**
 * 位置核验状态（§5.2 location_verification）
 */
export interface LocationVerification {
  status: 'verified' | 'approximate' | 'unverified';
  verified_at?: string;
  method?: 'gps' | 'manual' | 'inferred';
}

/* ---------- 状态枚举 ---------- */

/**
 * ProvenanceStatus：来源可信度
 * - self_reported: Witness 自报
 * - trusted_source: 数据源（如官方交通 / 天气）
 * - editorial:      编辑录入
 * - unknown:        待人工核实
 */
export type ProvenanceStatus = 'self_reported' | 'trusted_source' | 'editorial' | 'unknown';

/**
 * ModerationStatus：审核流
 * - pending: 待审
 * - approved: 已通过
 * - rejected: 已驳回
 * - flagged: 被标记（待复审）
 */
export type ModerationStatus = 'pending' | 'approved' | 'rejected' | 'flagged';

/**
 * RightsStatus：版权状态
 */
export type RightsStatus = 'cc_by' | 'cc_by_sa' | 'cc0' | 'all_rights_reserved' | 'unknown';

/* ---------- Moment 完整对象 ---------- */

/**
 * Moment 字段说明（§5.2 Required Fields）：
 * - moment_id*:           稳定唯一 ID（uuid / slug）
 * - media*:               Moment 携带的媒体
 * - media_type*:          媒体主类型
 * - captured_at*:         拍摄时刻（ISO）— 唯一决定 NOW/TODAY/PAST 分桶
 * - uploaded_at*:         上传时间（运营元数据）
 * - published_at:         公开时间（可空 = 草稿）
 * - city_id*:             关联 City（强一致）
 * - public_city_name*:    公开城市名（City 改名前的快照保留）
 * - raw_location:         受限字段（后台 only）
 * - location_verification:核验元数据
 * - witness_id:           上传者（witness 模型在 Phase 5）
 * - caption:              文案（可选）
 * - provenance_status*:   来源
 * - moderation_status*:   审核
 * - rights_status*:       版权
 * - created_at / updated_at*: 系统时间戳
 */
export interface Moment {
  moment_id: string;
  media: MomentMedia;
  media_type: MomentMediaType;
  /** 唯一决定时间桶的字段 */
  captured_at: string;
  uploaded_at: string;
  published_at?: string;
  city_id: string;
  public_city_name: string;
  /** ⚠️ 受限：后台 only；前端 API 不返回 */
  raw_location?: RawLocation;
  location_verification?: LocationVerification;
  witness_id?: string;
  caption?: string;
  provenance_status: ProvenanceStatus;
  moderation_status: ModerationStatus;
  rights_status: RightsStatus;
  created_at: string;
  updated_at: string;
  /** v1.6.1 · 多源追溯（PROMPT 39 A.4）— spec §17 数据源可追溯 */
  sources?: ReadonlyArray<MomentSource>;
}

/* ---------- Source Type（PROMPT 39 A.4）---------- */

/**
 * MomentSource — 单条来源追溯。
 *
 * spec §17 acceptance:数据源可追溯(source_url 必填)。
 * PM 决策 A.4:多源追溯放 Moment.sources[]（与 provenance_status 互补）。
 *
 * 字段:
 * - name: 来源名(必填,例如 "Reuters" / "Wikimedia Commons" / "user-lwy")
 * - url:  原始条目 URL(可选,但若 rights_status === 'unknown' 应填)
 * - type: 标准化来源类型枚举(7 种)
 */
export interface MomentSource {
  /** 来源名(必填) */
  readonly name: string;
  /** 原始条目 URL */
  readonly url?: string;
  /** 标准化来源类型 */
  readonly type: MomentSourceType;
}

/**
 * MomentSourceType — 标准化来源类型。
 *
 * 枚举 7 种:商业图库(2) + 新闻社(2) + 开源(2) + 手工(1)。
 * Phase 1+ Editorial CMS 接入后可扩 type(加 stock-photo 服务等)。
 */
export type MomentSourceType =
  | 'reuters'        // 路透社(新闻)
  | 'ap'             // 美联社(新闻)
  | 'adobe'          // Adobe Stock(图库)
  | 'shutterstock'   // Shutterstock(图库)
  | 'wikimedia'      // Wikimedia Commons(开源)
  | 'unsplash'       // Unsplash(开源图库)
  | 'manual';        // 手工录入(Editorial CMS)

/**
 * 所有支持的 source type(frozen tuple,Phase 2+ 可扩展)。
 */
export const MOMENT_SOURCE_TYPES: ReadonlyArray<MomentSourceType> = Object.freeze([
  'reuters', 'ap', 'adobe', 'shutterstock', 'wikimedia', 'unsplash', 'manual',
]);

/**
 * isMomentSourceType — 严格校验 source type 字面量。
 */
export function isMomentSourceType(value: string): value is MomentSourceType {
  return (MOMENT_SOURCE_TYPES as ReadonlyArray<string>).includes(value);
}
