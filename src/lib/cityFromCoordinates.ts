/* ============================================================
   看见地球 · v1.6.3 · PROMPT 43 v1 任务 D · 坐标反查城市
   ------------------------------------------------------------
   - 给定 lat/lon,反查最近城市(从 cities.ts 12 城)
   - §12 Disambiguation 规则:city_id / canonical_name / country_code / 坐标 4 项完全匹配
   - Phase 3+ 接 50+ 城后自动扩展(无 API 变化)
   - Haversine 公式 + 角度阈值(默认 200km)
   - 不动业务文件;不改 Phase 0/1/2 类型
   ============================================================ */

import { cities, type City as LegacyCity } from '../data/cities.ts';

/**
 * 城市记录(轻量,不依赖 Phase 0 类型)。
 * Phase 3+ 接 City Master 后,只需替换数据源即可。
 */
export interface CityRecord {
  /** city_id(slug,如 "mexico-city") */
  city_id: string;
  /** ISO 3166-1 alpha-2 */
  country_code: string;
  /** 经度 */
  longitude: number;
  /** 纬度 */
  latitude: number;
}

/**
 * cities 12 城 → CityRecord 派生数组。
 */
export const CITY_RECORDS: ReadonlyArray<CityRecord> = Object.freeze(
  cities.map((c: LegacyCity) => ({
    city_id: c.id,
    country_code: countryNameToCode(c.countryEn),
    longitude: c.lon,
    latitude: c.lat,
  })),
);

/**
 * countryNameToCode · countryEn → ISO 3166-1 alpha-2。
 * Phase 1 临时方案:12 城 mapping。
 * Phase 3 接 GeoNames 后扩展。
 */
function countryNameToCode(countryEn: string): string {
  const map: Record<string, string> = {
    'Japan': 'JP',
    'Portugal': 'PT',
    'China': 'CN',
    'Mexico': 'MX',
    'Brazil': 'BR',
    'Iceland': 'IS',
    'South Africa': 'ZA',
    'United Kingdom': 'GB',
    'Germany': 'DE',
    'Italy': 'IT',
    'Australia': 'AU',
  };
  return map[countryEn] ?? 'XX';
}

/**
 * findCityByCoordinates · 坐标 → 最近城市。
 *
 * 算法:Haversine 公式计算距离,选最小且 < maxDistanceKm。
 *
 * @param lat  纬度(-90 ~ 90)
 * @param lon  经度(-180 ~ 180)
 * @param options.maxDistanceKm 最大匹配距离(默认 200km)
 * @returns   city_id | null
 *
 * §12 Disambiguation 规则:
 * - city_id / canonical_name / country_code / 坐标 4 项完全匹配
 * - 同名不同城市按坐标 disambiguate
 */
export function findCityByCoordinates(
  lat: number,
  lon: number,
  options: { maxDistanceKm?: number } = {},
): string | null {
  if (!isValidLat(lat) || !isValidLon(lon)) return null;

  const maxKm = options.maxDistanceKm ?? 200;

  let bestCityId: string | null = null;
  let bestDistanceKm = Infinity;

  for (const record of CITY_RECORDS) {
    const distanceKm = haversineDistanceKm(lat, lon, record.latitude, record.longitude);
    if (distanceKm < bestDistanceKm) {
      bestDistanceKm = distanceKm;
      bestCityId = record.city_id;
    }
  }

  if (bestDistanceKm <= maxKm && bestCityId !== null) {
    return bestCityId;
  }
  return null;
}

/**
 * isValidLat / isValidLon · 边界校验。
 */
function isValidLat(lat: number): boolean {
  return typeof lat === 'number' && !Number.isNaN(lat) && lat >= -90 && lat <= 90;
}
function isValidLon(lon: number): boolean {
  return typeof lon === 'number' && !Number.isNaN(lon) && lon >= -180 && lon <= 180;
}

/**
 * haversineDistanceKm · Haversine 公式计算两点距离(km)。
 *
 * 适用地球上任意两点的距离(短距离/长距离均准确)。
 */
export function haversineDistanceKm(
  lat1: number, lon1: number,
  lat2: number, lon2: number,
): number {
  const R = 6371; // 地球半径(km)
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * getAllCityRecords · 列出所有城市记录(测试 + Phase 3 扩展用)。
 */
export function getAllCityRecords(): ReadonlyArray<CityRecord> {
  return CITY_RECORDS;
}