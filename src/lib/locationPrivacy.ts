/* ============================================================
   看见地球 · v1.6 · PROMPT 36 Phase 0 · Location Privacy
   ------------------------------------------------------------
   - §5.4 Location Privacy · 公开 City vs 后台 raw_location
   - toPublicCityLocation: 只返回 city 级公开字段
   - toFullLocation:       backend / admin 视图（含 raw coords）
   - canAccessRawLocation: 权限校验（public/witness/moderator/admin）
   - Witness 只能访问自己上传 Moment 的 raw_location
   ============================================================ */

import type {
  City,
  Moment,
  PublicCityLocation,
  FullCityLocation,
} from '@/types';

/* ---------- 权限模型 ---------- */

/**
 * 权限角色：
 * - public:    默认无访问（前台访客）
 * - witness:   已登录 Witness（普通用户）
 * - moderator: 内容审核（可访问任何 raw）
 * - admin:     系统管理员（全权限）
 */
export type AccessRole = 'public' | 'witness' | 'moderator' | 'admin';

/**
 * actor: 调用方身份
 * - role:     角色（必填）
 * - witnessId: 当 role=witness 时必填（自己的 witness_id）
 */
export interface PrivacyActor {
  role: AccessRole;
  witnessId?: string;
}

/**
 * target: 受保护对象
 * - moment: 当询问"能否看 raw_location of this moment" 时填
 * - city:   当询问"能否看 city 的 raw coords" 时填
 */
export interface PrivacyTarget {
  moment?: Moment;
  city?: City;
}

/* ---------- public city location ---------- */

/**
 * 把 City 转成 PublicCityLocation
 * - 不暴露 latitude / longitude / alternate_names 等后台字段
 * - 前台所有页面（包括 share card、Earth Explore）只能拿这个版本
 */
export function toPublicCityLocation(city: City): PublicCityLocation {
  const out: PublicCityLocation = {
    city_id: city.identity.city_id,
    public_city_name: city.identity.canonical_name,
    country_code: city.identity.country_code,
    country_name: city.identity.country_name,
  };
  if (city.identity.admin1_name !== undefined) {
    out.admin1_name = city.identity.admin1_name;
  }
  return out;
}

/* ---------- full location ---------- */

/**
 * 把 City 转成 FullCityLocation（含 raw coordinates）
 * - 仅在 canAccessRawLocation 返回 true 时调用
 * - 这是 backend-only API；前端绝不直接调用
 */
export function toFullLocation(city: City): FullCityLocation {
  return {
    ...toPublicCityLocation(city),
    timezone: city.identity.timezone,
    raw_coordinates: {
      latitude: city.identity.latitude,
      longitude: city.identity.longitude,
    },
  };
}

/**
 * 拼接 City + Moment 的 full location
 * - 当后台需要 audit "某 Moment 的完整位置链路" 时使用
 */
export function toFullMomentLocation(
  city: City,
  moment: Moment,
): FullCityLocation & { moment_id: string; raw_moment_location: NonNullable<Moment['raw_location']> | undefined } {
  return {
    ...toFullLocation(city),
    moment_id: moment.moment_id,
    raw_moment_location: moment.raw_location,
  };
}

/* ---------- 权限校验 ---------- */

/**
 * 校验 actor 是否有权访问 target 的 raw location
 *
 * 规则（§5.4 + §17 Engineering acceptance）：
 * - public:    永远 false
 * - witness:   仅当 moment 存在且 moment.witness_id === actor.witnessId
 * - moderator / admin: 永远 true（city + moment 均允许）
 */
export function canAccessRawLocation(
  actor: PrivacyActor,
  target: PrivacyTarget,
): boolean {
  // public: 无权限
  if (actor.role === 'public') return false;

  // moderator / admin: 全权限
  if (actor.role === 'moderator' || actor.role === 'admin') return true;

  // witness: 只能看自己上传 moment 的 raw_location
  if (actor.role === 'witness') {
    if (!actor.witnessId) return false;
    if (!target.moment) return false; // 没指定 moment → 仅 city raw coords 也不行
    return target.moment.witness_id === actor.witnessId;
  }

  // 兜底：未知 role → 拒绝
  return false;
}

/**
 * 判断 actor 能否看 city 的 raw coordinates（city 级权限）
 *
 * 规则：
 * - public: false
 * - witness: false（witness 仅可访问自己 moment 的 raw_location，不是 city raw coords）
 * - moderator / admin: true
 */
export function canAccessCityRawCoords(actor: PrivacyActor): boolean {
  if (actor.role === 'public' || actor.role === 'witness') return false;
  return actor.role === 'moderator' || actor.role === 'admin';
}

/* ---------- helper：取 raw_location 但带权限 ---------- */

/**
 * 安全取 moment.raw_location：
 * - 有权限 → 返回 raw_location
 * - 无权限 → 返回 undefined（不抛错）
 */
export function getRawLocationSafely(
  actor: PrivacyActor,
  moment: Moment,
): Moment['raw_location'] {
  if (!canAccessRawLocation(actor, { moment })) return undefined;
  return moment.raw_location;
}
