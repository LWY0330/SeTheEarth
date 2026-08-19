/* ============================================================
   看见地球 · v1.6 · PROMPT 36 Phase 0 · Moment Time Bucket
   ------------------------------------------------------------
   - getMomentTimeBucket(): NOW / TODAY / PAST 三桶分桶
   - NOW 时间窗口默认 1 小时（可配置 1h/3h/6h，模型不改）
   - captured_at 是唯一决定分桶的字段（§5.3 Time Rules）
   - 复用 Intl.DateTimeFormat 自动处理 DST
   - 不依赖 CityPage.tsx / cities.ts，可独立测试
   ============================================================ */

import type { MomentTimeBucket } from '@/types';

/**
 * NOW 时间窗口（小时）
 * - 默认 1 小时；v1.6 仅暴露 hourly 粒度（§5.3 "N 暂不在 v1.0 写死"）
 * - 1h/3h/6h 等窗口可在调用处覆盖，模型 schema 不变
 */
export const NOW_WINDOW_HOURS = 1;

/** getMomentTimeBucket 选项 */
export interface MomentTimeBucketOptions {
  /** NOW 窗口小时数；默认 NOW_WINDOW_HOURS */
  nowWindowHours?: number;
}

/** 内部：把 Date 拆成 Y-M-D / HH:MM（按 tz），返回可比较的 wall clock 字符串 */
function localDateKey(date: Date, tz: string): string {
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = fmt.formatToParts(date);
  const get = (t: Intl.DateTimeFormatPartTypes): string =>
    parts.find((p) => p.type === t)?.value ?? '00';
  return `${get('year')}-${get('month')}-${get('day')}`;
}

/**
 * 判断两个 Date 在指定 tz 下是否落在同一个当地自然日
 * - 用于 TODAY 判定（不依赖 wall clock 漂移）
 */
export function isSameLocalDay(
  capturedAt: Date,
  now: Date,
  tz: string,
): boolean {
  return localDateKey(capturedAt, tz) === localDateKey(now, tz);
}

/**
 * 取 tz 当前 Hour（0-23，含 DST）
 */
function localHourOfTZ(date: Date, tz: string): number {
  try {
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hour: '2-digit',
      hour12: false,
    });
    const parts = fmt.formatToParts(date);
    const raw = parts.find((p) => p.type === 'hour')?.value ?? '00';
    if (raw === '24') return 0;
    return Number(raw);
  } catch {
    return NaN;
  }
}

/**
 * 算出 capturedAt 与 now 在 tz 下的"小时差"
 * - 正数 = capturedAt 早于 now（已发生）
 * - 负数 = capturedAt 晚于 now（未来时间，异常）
 */
function hoursAgoInTz(capturedAt: Date, now: Date): number {
  return (now.getTime() - capturedAt.getTime()) / 3_600_000;
}

/**
 * 计算 capturedAt 落在 NOW / TODAY / PAST 哪个桶
 *
 * 规则（§5.3）：
 * 1. 未来时间（capturedAt > now）→ 一律视为 PAST（防御性）
 * 2. NOW: hoursAgo ∈ [0, nowWindowHours]
 * 3. TODAY: 同一当地自然日（按 city timezone 计算）
 * 4. PAST: 以上都不满足
 *
 * @param capturedAtIso  Moment.captured_at（ISO 字符串）
 * @param cityTimezone  关联 City 的 IANA timezone（影响 TODAY 判定）
 * @param now           当前时刻（默认 new Date()；测试可注入）
 * @param options       nowWindowHours 覆盖默认 1h
 */
export function getMomentTimeBucket(
  capturedAtIso: string,
  cityTimezone: string,
  now: Date = new Date(),
  options: MomentTimeBucketOptions = {},
): MomentTimeBucket {
  const window = options.nowWindowHours ?? NOW_WINDOW_HOURS;

  // 防御未来时间（不应该发生但要兜底）
  const capturedAt = new Date(capturedAtIso);
  if (Number.isNaN(capturedAt.getTime())) {
    // 无效日期 → 视作 PAST（安全兜底）
    return 'PAST';
  }

  const hoursAgo = hoursAgoInTz(capturedAt, now);

  // 未来时间 → PAST（防御）
  if (hoursAgo < 0) return 'PAST';

  // NOW 窗口
  if (hoursAgo <= window) return 'NOW';

  // TODAY：同当地自然日
  try {
    if (isSameLocalDay(capturedAt, now, cityTimezone)) {
      return 'TODAY';
    }
  } catch {
    // tz 非法 → 退化到 PAST
    return 'PAST';
  }

  return 'PAST';
}

/**
 * 取 tz 当前小时（0-23）。导出供 UI / 测试复用。
 * - tz 非法返回 NaN
 */
export function getCurrentLocalHour(
  tz: string,
  now: Date = new Date(),
): number {
  return localHourOfTZ(now, tz);
}
