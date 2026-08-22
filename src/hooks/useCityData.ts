/* ============================================================
   看见地球 · v1.6.2 · PROMPT 41 v1 · useCityData hook
   ------------------------------------------------------------
   - 接受 city slug,返回 Universal City 对象(Phase 0 类型)
   - 当前数据源:src/data/cities.ts (legacy City)
   - Phase 3+ 接 ingestion 后:从 City Master 取
   - Phase 1 临时 adapter:legacyToUniversal 字段映射
   - 不动业务文件;不改 Phase 0/1 类型
   ============================================================ */

import { useMemo } from 'react';
import type { City } from '@/types';
import { cities, findCity, type City as LegacyCity } from '../data/cities.ts';
import { getCountryNameLocal } from '../lib/countryI18n.ts';

/**
 * useCityData · 从 slug 取 Universal City 数据。
 *
 * Phase 1 数据源 = src/data/cities.ts(legacy 12 城 v2.60.0)
 * Phase 3+ 数据源 = City Master(Phase 0 ingest)
 *
 * @param slug  URL slug 如 "kyoto" / "lisbon"
 * @returns    Universal City | null(404 时)
 */
export function useCityData(slug: string | undefined | null): City | null {
  return useMemo(() => {
    if (!slug) return null;
    const legacy: LegacyCity | undefined = findCity(slug);
    if (!legacy) return null;
    return legacyToUniversal(legacy);
  }, [slug]);
}

/**
 * legacyToUniversal · adapter 函数,把 legacy City 转 Universal City。
 *
 * 字段映射(per Phase 1 prep migration mapping B1):
 * - identity.city_id ← id
 * - identity.canonical_name ← nameEn
 * - identity.local_name ← nameZh
 * - identity.country_code ← 派生(lazy lookup,12 城 mapping 在 countryI18n.ts)
 * - identity.country_name ← countryEn
 * - identity.latitude ← lat
 * - identity.longitude ← lon
 * - identity.timezone ← timezone
 * - identity.place_type ← 'city' (default,12 城都是 city)
 * - visual.hero_media ← images[scene='landmark'] 派生
 * - visual.visual_status ← 'seed'(12 城已 self-host 图)
 * - state_level ← 'L0_mapped'(暂无 Moment 关系,Phase 1 临时)
 * - page_state ← 'E_empty'(同上)
 * - content.* ← description / momentZh / oneObservation / livingNote / cultureNote
 *
 * 注意:
 * - cityCountryCode 是 lazy lookup;失败返回 'XX' 占位
 * - visual.hero_media 由 images[scene='landmark'] 派生
 * - identity.alternate_names / admin1_code / admin1_name 不填(Phase 3 接 GeoNames)
 */
export function legacyToUniversal(legacy: LegacyCity): City {
  const country_code = resolveCountryCode(legacy.countryEn);
  const landmark = legacy.images.find((img) => img.scene === 'landmark') ?? legacy.images[0];

  const city: City = {
    identity: {
      city_id: legacy.id,
      canonical_name: legacy.nameEn,
      local_name: legacy.nameZh,
      country_code,
      country_name: legacy.countryEn,
      place_type: 'city',
      latitude: legacy.lat,
      longitude: legacy.lon,
      timezone: legacy.timezone,
    },
    state_level: 'L0_mapped',
    page_state: 'E_empty',
  };

  if (landmark) {
    city.visual = {
      hero_media: {
        url: landmark.url,
        width: landmark.width,
        height: landmark.height,
        alt: `${legacy.nameZh} ${legacy.nameEn}`,
        focus: landmark.focus,
      },
      hero_creator: legacy.imageCredit,
      visual_status: 'seed',
    };
  }

  city.content = {
    description: legacy.description,
    momentZh: legacy.momentZh,
    oneObservation: legacy.oneObservation,
    livingNote: legacy.livingNote,
    cultureNote: legacy.cultureNote,
  };

  return city;
}

/**
 * resolveCountryCode · 从 country name 反查 ISO 3166-1 alpha-2。
 *
 * Phase 1 临时方案:hard-coded 12 城 mapping。
 * Phase 3 接 ingestion 后:从 CountryI18n / GeoNames 取。
 */
function resolveCountryCode(countryEn: string): string {
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
    'Sudan': 'SD',
  };
  return map[countryEn] ?? 'XX';
}

/**
 * listAllCitySlugs · 列出所有支持的 city slug。
 * Phase 2+ Router / Search 用。
 */
export function listAllCitySlugs(): readonly string[] {
  return cities.map((c) => c.slug);
}

/**
 * getCountryNameForCity · i18n lookup for city.country_code + locale。
 * Phase 2+ UI locale-aware 文案用。
 */
export function getCountryNameForCity(
  city: Pick<City, 'identity'>,
  locale: 'zh' | 'en',
): string | undefined {
  return getCountryNameLocal(city.identity.country_code, locale);
}