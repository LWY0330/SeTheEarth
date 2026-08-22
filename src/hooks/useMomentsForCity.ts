/* ============================================================
   看见地球 · v1.6.2 · PROMPT 41 v1 · useMomentsForCity hook
   ------------------------------------------------------------
   - 接受 city_id,返回关联的 Moment[] (Universal Moment)
   - 当前数据源:src/data/liveMoments.ts (legacy LiveEvent) + moments.ts (legacy Moment)
   - Phase 1 临时 adapter:legacy LiveEvent / Moment 转 Universal Moment
   - Phase 3+ 接 ingestion 后:从 Moment Master 取
   - 不动业务文件;不改 Phase 0/1 类型
   ============================================================ */

import { useMemo } from 'react';
import type { Moment } from '@/types';
import { liveEvents, type LiveEvent } from '../data/liveMoments.ts';
import { moments as legacyMoments } from '../data/moments.ts';

/**
 * useMomentsForCity · 取 city_id 关联的 Moment[]。
 *
 * Phase 1 数据源:
 * - src/data/liveMoments.ts(12 LiveEvent,LiveEvent 类型扩展)
 * - src/data/moments.ts(6 静态 Moment)
 *
 * Phase 3+ 数据源 = Moment Master
 *
 * @param city_id  City 的 city_id(如 "kyoto")
 * @returns        Universal Moment[] (空数组 = 0 Moment)
 */
export function useMomentsForCity(city_id: string | undefined | null): Moment[] {
  return useMemo(() => {
    if (!city_id) return [];
    const all: Moment[] = [];

    // legacy LiveEvent 转 Universal Moment
    const liveEventsForCity = liveEvents.filter((e) => e.cityId === city_id);
    for (const e of liveEventsForCity) {
      all.push(liveEventToUniversal(e));
    }

    // legacy 静态 Moment 转 Universal Moment
    const legacyForCity = legacyMoments.filter((m) => {
      const id = (m as { id?: string }).id;
      // moments.ts 用 city id 作为 id(如 'tokyo' / 'cape-town' / 'reykjavik')
      return id === city_id;
    });
    for (const m of legacyForCity) {
      all.push(legacyMomentToUniversal(m as LegacyMoment));
    }

    return all;
  }, [city_id]);
}

/**
 * Legacy moment type (moments.ts v2.2.2)
 */
interface LegacyMoment {
  id: string;
  cityZh: string;
  cityEn: string;
  countryZh: string;
  countryEn: string;
  lon: number;
  lat: number;
  category: string;
  categoryLabelZh: string;
  textZh: string;
  textEn: string;
}

/**
 * liveEventToUniversal · LiveEvent 转 Universal Moment。
 *
 * 字段映射(per Phase 1 prep migration mapping B2):
 * - moment_id ← id
 * - media ← { url: thumbnailUrl, type: 'image' }
 * - media_type ← 'image'
 * - captured_at ← observedAt (ISO 时间)
 * - uploaded_at ← updatedAt
 * - published_at ← publishedAt
 * - city_id ← cityId
 * - public_city_name ← cityNameEn
 * - raw_location ← { latitude, longitude } (受限字段)
 * - witness_id ← undefined(LiveEvent 无 witness 概念)
 * - caption ← undefined(LiveEvent 用 title + description)
 * - provenance_status ← sourceType 派生
 * - moderation_status ← 'approved' (LiveEvent 已上线)
 * - rights_status ← 'unknown' (默认)
 * - created_at ← observedAt (proxy)
 * - updated_at ← updatedAt
 * - editorial.category ← category (legacy 6 类)
 * - captions.zh ← undefined (LiveEvent 用 description + title 单独存)
 * - captions.en ← description
 * - sources[0].name ← sourceName
 * - sources[0].url ← sourceUrl
 * - sources[0].type ← 'manual' (Phase 1 临时,Phase 3 扩)
 */
export function liveEventToUniversal(e: LiveEvent): Moment {
  const m: Moment = {
    moment_id: e.id,
    media: {
      url: e.thumbnailUrl,
      type: 'image',
    },
    media_type: 'image',
    captured_at: e.observedAt,
    uploaded_at: e.updatedAt,
    city_id: e.cityId,
    public_city_name: e.cityNameEn,
    provenance_status: mapProvenanceStatus(e.sourceType),
    moderation_status: 'approved',
    rights_status: 'unknown',
    created_at: e.observedAt,
    updated_at: e.updatedAt,
  };

  if (e.publishedAt) m.published_at = e.publishedAt;

  if (e.latitude !== undefined && e.longitude !== undefined) {
    m.raw_location = { latitude: e.latitude, longitude: e.longitude };
  }

  // editorial layer (A.7)
  if (e.category) {
    m.editorial = {
      category: e.category as 'finance' | 'war' | 'art' | 'urban' | 'nature' | 'romance',
    };
  }

  // captions (A.5) — LiveEvent 用 description 作为英文 caption
  if (e.description) {
    m.captions = { en: e.description };
  }

  // sources (A.4) — LiveEvent 已有 sourceName + sourceUrl
  if (e.sourceName) {
    m.sources = [
      {
        name: e.sourceName,
        ...(e.sourceUrl ? { url: e.sourceUrl } : {}),
        type: 'manual', // Phase 1 临时,Phase 3 接真实 source 类型
      },
    ];
  }

  return m;
}

/**
 * legacyMomentToUniversal · 旧 moments.ts v2.2.2 转 Universal Moment。
 *
 * 字段映射:
 * - moment_id ← id
 * - media ← { url: '', type: 'text' } (text-only Moment)
 * - media_type ← 'text'
 * - captured_at ← fixed '2026-08-19T00:00:00Z' (legacy 静态 Moment 无 observedAt)
 * - city_id ← slugify(cityEn)
 * - public_city_name ← cityEn
 * - caption ← textEn
 * - captions.zh ← textZh
 * - captions.en ← textEn
 * - editorial.category ← category
 * - provenance_status ← 'editorial'
 * - moderation_status ← 'approved'
 * - rights_status ← 'unknown'
 */
export function legacyMomentToUniversal(m: LegacyMoment): Moment {
  const city_id = slugify(m.cityEn);
  const moment: Moment = {
    moment_id: m.id,
    media: { url: '', type: 'text' },
    media_type: 'text',
    captured_at: '2026-08-19T00:00:00Z',
    uploaded_at: '2026-08-19T00:00:00Z',
    city_id,
    public_city_name: m.cityEn,
    caption: m.textEn,
    captions: { zh: m.textZh, en: m.textEn },
    provenance_status: 'editorial',
    moderation_status: 'approved',
    rights_status: 'unknown',
    created_at: '2026-08-19T00:00:00Z',
    updated_at: '2026-08-19T00:00:00Z',
  };
  if (m.category) {
    moment.editorial = {
      category: m.category as 'finance' | 'war' | 'art' | 'urban' | 'nature' | 'romance',
    };
  }
  return moment;
}

/**
 * slugify · "New York" → "new-york"
 */
function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

/**
 * mapProvenanceStatus · LiveEvent sourceType → Universal ProvenanceStatus。
 */
function mapProvenanceStatus(
  sourceType: LiveEvent['sourceType'],
): 'self_reported' | 'trusted_source' | 'editorial' | 'unknown' {
  switch (sourceType) {
    case 'local-media':
    case 'official':
    case 'weather-data':
    case 'transport-data':
      return 'trusted_source';
    case 'community':
      return 'self_reported';
    case 'editorial':
      return 'editorial';
    default:
      return 'unknown';
  }
}