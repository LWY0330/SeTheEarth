/* ============================================================
   看见地球 · v1.6 · PROMPT 36 Phase 0 · City State Logic
   ------------------------------------------------------------
   - getCityStateLevel() 后台成熟度 L0 → L4（运营/技术）
   - getCityPageState()   前台产品状态 A → E（用户可见）
   - 二者独立计算；mapping 不强制 1:1（City 可以是 L2_witnessed
     但 page_state 是 D_past_only，今天无 Moment）
   - 对齐 04-路线图/global-city-coverage-system-v1.0.md §6 §7
   - 纯函数 · 不依赖 React / DOM · 可独立测试
   ============================================================ */

import type {
  City,
  CityStateLevel,
  CityPageState,
  MomentStats,
} from '@/types';

/* ---------- 后台 L0-L4 ---------- */

/**
 * 由 City.moment_stats + City.identity 推导后台成熟度。
 * 注意：L1_contextualized 需要外部 Context 数据，
 * Phase 0 没有 Context 字段，所以最高只能推到 L0（无 moment_stats）
 * 或 L2+（有 moment_stats）。L1 在 Phase 1 Context 接入后启用。
 */
export function getCityStateLevel(city: City): CityStateLevel {
  const stats: MomentStats | undefined = city.moment_stats;

  // 无 stats → 仅有 Identity → L0 mapped
  if (!stats || stats.moments_total === 0) {
    return 'L0_mapped';
  }

  // L4 Living Archive：30 天内实际记录的日数 ≥ 7（连续度指标）
  if (stats.witnessed_days_last_30d !== undefined
      && stats.witnessed_days_last_30d >= 7) {
    return 'L4_living_archive';
  }

  // L3 Active：最近 7 天有 Moment
  if (stats.moments_last_7d !== undefined && stats.moments_last_7d > 0) {
    return 'L3_active';
  }

  // L2 Witnessed：历史上至少 1 条合格 Moment
  return 'L2_witnessed';
}

/* ---------- 前台 A-E ---------- */

/**
 * 取 stats.last_moment_at 在 city timezone 下是否与 now 是同一当地自然日。
 * - 用于区分 B/C/D/E
 */
function hasMomentToday(
  stats: MomentStats,
  cityTimezone: string,
  now: Date,
): boolean {
  if (!stats.last_moment_at) return false;
  const last = new Date(stats.last_moment_at);
  if (Number.isNaN(last.getTime())) return false;

  // 复用 momentTime 的 isSameLocalDay 实现（不直接 import 以避免循环）
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: cityTimezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const aKey = fmt.formatToParts(last);
  const bKey = fmt.formatToParts(now);
  const get = (parts: Intl.DateTimeFormatPart[], k: string): string =>
    parts.find((p) => p.type === k)?.value ?? '00';
  const a = `${get(aKey, 'year')}-${get(aKey, 'month')}-${get(aKey, 'day')}`;
  const b = `${get(bKey, 'year')}-${get(bKey, 'month')}-${get(bKey, 'day')}`;
  return a === b;
}

/** "今天 Moment 数" 阈值：超过此数进入 B_active */
const ACTIVE_DAY_THRESHOLD = 3;

/**
 * 由 City 推导前台产品状态。
 * 优先级（按 §7 Universal City Page States）：
 *   E_empty (无 stats) >
 *   D_past_only (今天无 Moment) >
 *   A_seed_editorial (visual_status='seed') >
 *   B_active (今天 ≥ 3 Moment) >
 *   C_low_activity (今天 1-2 Moment)
 *
 * 注：A 与 B/C 的边界：只有当 city.visual.visual_status === 'seed'
 * 时才进入 A；否则不论今日 Moment 多少都按 B/C 分级。
 */
export function getCityPageState(
  city: City,
  now: Date = new Date(),
): CityPageState {
  const stats: MomentStats | undefined = city.moment_stats;

  // E: 无 stats / 从未记录
  if (!stats || stats.moments_total === 0) {
    return 'E_empty';
  }

  // 有 stats 但今天无 Moment → D
  const tz = city.identity.timezone;
  if (!hasMomentToday(stats, tz, now)) {
    return 'D_past_only';
  }

  // A: Seed City
  if (city.visual?.visual_status === 'seed') {
    return 'A_seed_editorial';
  }

  // B vs C: 今日 Moment 数（moments_last_24h 字段）
  const todayCount = stats.moments_last_24h ?? 0;
  if (todayCount >= ACTIVE_DAY_THRESHOLD) {
    return 'B_active';
  }

  return 'C_low_activity';
}

/**
 * 同时返回后台 + 前台状态（合并调用场景）
 */
export interface CityStateSnapshot {
  state_level: CityStateLevel;
  page_state: CityPageState;
}

export function getCityStateSnapshot(
  city: City,
  now: Date = new Date(),
): CityStateSnapshot {
  return {
    state_level: getCityStateLevel(city),
    page_state: getCityPageState(city, now),
  };
}

/**
 * 给定 City 列表 + 单一时刻，返回每城状态快照。
 * - 批量查询用（Earth Explore / Search 等 Phase 4 场景）
 */
export function getCityStateSnapshots(
  cities: readonly City[],
  now: Date = new Date(),
): ReadonlyMap<string, CityStateSnapshot> {
  const out = new Map<string, CityStateSnapshot>();
  for (const city of cities) {
    out.set(city.identity.city_id, getCityStateSnapshot(city, now));
  }
  return out;
}
