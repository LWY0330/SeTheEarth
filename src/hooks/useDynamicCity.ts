/* ============================================================
   看见地球 · v1.6.2 · PROMPT 41 v1 · useDynamicCity hook
   ------------------------------------------------------------
   - 运行时计算 local_time / user_time_difference(Phase 0 Dynamic)
   - DST 跨夏令时保护(复用 momentTime.test.ts 已验证)
   - 30s 自动更新(local time tick)
   - 不动业务文件;不改 Phase 0 类型
   ============================================================ */

import { useEffect, useMemo, useState } from 'react';
import type { City } from '@/types';
import { getCurrentLocalHour } from '@/lib/momentTime';

/**
 * CityDynamicSnapshot · 运行时派生数据快照(Phase 0 CityDynamic subset)。
 */
export interface CityDynamicSnapshot {
  /** 当地自然时间 HH:MM(runtime tick) */
  local_time: string;
  /** 与用户时区差,如 "+8H" / "-5H" */
  user_time_difference: string;
  /** 当地小时数 0-23(供 Phase 2+ UI 使用) */
  local_hour: number;
  /** 快照时间戳(ISO) */
  captured_at: string;
}

/**
 * useDynamicCity · 运行时计算 City 的动态字段。
 *
 * @param city Universal City | null
 * @returns   CityDynamicSnapshot | null
 *
 * 注意:
 * - 每 30s 自动 tick 更新 local_time
 * - 城市时区变化(timezone 字段)立即重算
 * - DST 跨夏令时由 momentTime 内部 Intl.DateTimeFormat 处理(已验证)
 * - city=null 返回 null
 */
export function useDynamicCity(city: City | null | undefined): CityDynamicSnapshot | null {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(id);
  }, []);

  return useMemo(() => {
    if (!city) return null;
    const now = new Date();
    const localTime = formatLocalTime(city.identity.timezone, now);
    const localHour = getCurrentLocalHour(city.identity.timezone, now);
    const userDiff = computeUserTimeDifference(city.identity.timezone, now);

    return {
      local_time: localTime,
      user_time_difference: userDiff,
      local_hour: localHour,
      captured_at: now.toISOString(),
    };
    // tick 依赖触发重算(每 30s)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city?.identity.timezone, tick]);
}

/**
 * formatLocalTime · 格式化当地时间为 HH:MM。
 *
 * 使用 Intl.DateTimeFormat 而非手动时区运算,自动处理 DST。
 */
function formatLocalTime(timezone: string, now: Date): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    return formatter.format(now);
  } catch {
    // 非法 timezone → 返回 '??:??'
    return '??:??';
  }
}

/**
 * computeUserTimeDifference · 计算用户与当地时区差。
 *
 * 格式: "+8H" / "-5H" / "+0H"
 * DST 由 Intl 自动处理。
 */
function computeUserTimeDifference(timezone: string, now: Date): string {
  try {
    const localFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      timeZoneName: 'shortOffset',
    });
    const parts = localFormatter.formatToParts(now);
    const offsetPart = parts.find((p) => p.type === 'timeZoneName');
    if (!offsetPart) return '+0H';

    // offsetPart.value 形如 "GMT+9" / "GMT-5" / "GMT"
    const match = offsetPart.value.match(/GMT([+-])(\d+)/);
    if (!match) return '+0H';
    const sign = match[1];
    const hours = parseInt(match[2], 10);
    return `${sign}${hours}H`;
  } catch {
    return '+0H';
  }
}