/* ============================================================
   看见地球 · v1.6.3 · PROMPT 43 v1 任务 B · Unknown → City 映射
   ------------------------------------------------------------
   - Stage 5 后,用户点击"进入此刻"→ 调用本模块
   - 给定坐标 + 已 Reveal 的 city_id,返回 Universal City(Phase 0 类型)
   - 复用 useCityData.ts 的 legacyToUniversal adapter
   - 降级:坐标无匹配 → 返回 null(UI 显示 "Be the first to show here today.")
   - 不动业务文件;不改 Phase 0/1/2 类型
   ============================================================ */

import type { City } from '@/types';
import { legacyToUniversal } from '../hooks/useCityData.ts';
import type { City as LegacyCity } from '../data/cities.ts';
import { findCityByCoordinates } from './cityFromCoordinates.ts';
import { findCity } from '../data/cities.ts';

/**
 * CoordinatesInput · Reveal 完成时的输入坐标。
 *
 * Phase 1 mockup:23.6345° N · 102.5528° W → Mexico City
 * Phase 1+ Editorial CMS 接入后,可从 CMS 取精确坐标
 */
export interface CoordinatesInput {
  /** 纬度 */
  lat: number;
  /** 经度 */
  lon: number;
  /** GPS 精度(米);Phase 1 不用,Phase 1+ Witness 上传后启用 */
  accuracy?: number;
}

/**
 * revealCityFromCoordinates · Unknown Reveal → City 完整对象。
 *
 * 算法:
 * 1. 若提供 currentData.cities,直接在自定义列表中找最近城市(用 currentData 自带的坐标)
 * 2. 否则,用 cityFromCoordinates 反查最近 city_id(200km 默认)
 * 3. 从 src/data/cities.ts 取 legacy City
 * 4. 用 legacyToUniversal adapter 转 Universal City(Phase 0 类型)
 *
 * @returns Universal City | null(降级 → UI 显示 Empty CTA)
 */
export function revealCityFromCoordinates(
  coords: CoordinatesInput,
  currentData?: { cities?: readonly LegacyCity[] },
): City | null {
  // 路径 1:currentData 提供 → 用自定义列表的最近城市(覆盖默认)
  if (currentData?.cities) {
    const customMatch = findNearestInList(coords, currentData.cities);
    if (customMatch) return legacyToUniversal(customMatch);
    // 自定义列表无匹配 → 降级(null,不回退到默认)
    return null;
  }

  // 路径 2:默认 → 用 cityFromCoordinates(200km 阈值)+ cities.ts 数据源
  const city_id = findCityByCoordinates(coords.lat, coords.lon, {
    maxDistanceKm: 200,
  });
  if (!city_id) {
    // 降级:无匹配城市 → UI 显示 Empty State CTA
    return null;
  }

  const legacy: LegacyCity | undefined = findCity(city_id);
  if (!legacy) return null;

  return legacyToUniversal(legacy);
}

/**
 * findNearestInList · 自定义列表中找最近城市(纯 Haversine)。
 */
function findNearestInList(
  coords: CoordinatesInput,
  list: readonly LegacyCity[],
): LegacyCity | null {
  let best: LegacyCity | null = null;
  let bestDistance = Infinity;

  for (const c of list) {
    // 简化:Haversine 内联(避免循环依赖)
    const R = 6371;
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const dLat = toRad(c.lat - coords.lat);
    const dLon = toRad(c.lon - coords.lon);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(coords.lat)) * Math.cos(toRad(c.lat)) * Math.sin(dLon / 2) ** 2;
    const dist = 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    if (dist < bestDistance) {
      bestDistance = dist;
      best = c;
    }
  }

  return bestDistance <= 200 ? best : null; // 200km 阈值
}

/**
 * buildUnknownToCityHref · Reveal 完成后的目标 URL。
 *
 * @returns "/cities/mexico-city" 格式(Stage 5 后 router 跳转用)
 *          null = 无匹配,fallback 到 Empty State(不跳转)
 */
export function buildUnknownToCityHref(coords: CoordinatesInput): string | null {
  const city_id = findCityByCoordinates(coords.lat, coords.lon, {
    maxDistanceKm: 200,
  });
  if (!city_id) return null;
  return `/cities/${city_id}`;
}

/**
 * getUnknownCoordinatesMock · Phase 1 默认测试坐标(Mexico City)。
 *
 * Stage 5 demo 用:23.6345° N · 102.5528° W
 */
export const MEXICO_CITY_COORDINATES = Object.freeze({
  lat: 23.6345,
  lon: -102.5528,
} as CoordinatesInput);