/* ============================================================
   v1.6.2 · useMomentsForCity + adapter 测试
   - 8 测试覆盖 liveEventToUniversal + legacyMomentToUniversal
   ============================================================ */

// @ts-ignore -- node:test 类型声明缺失
import { test } from 'node:test';
// @ts-ignore -- node:assert/strict 类型声明缺失
import assert from 'node:assert/strict';
import {
  liveEventToUniversal,
  legacyMomentToUniversal,
} from './useMomentsForCity.ts';

test('liveEventToUniversal · basic fields 映射', () => {
  const e = {
    id: 'evt-1',
    cityId: 'tokyo',
    cityNameZh: '东京',
    cityNameEn: 'Tokyo',
    countryZh: '日本',
    countryEn: 'Japan',
    category: 'urban' as const,
    categoryLabelZh: '都市',
    contentType: 'urban' as const,
    contentTypeZh: '都市',
    scale: 'local' as const,
    title: '涩谷路口',
    description: 'Shibuya crossing',
    localTime: '15:00',
    timezone: 'Asia/Tokyo',
    utcOffset: 9,
    observedAt: '2026-08-19T06:00:00Z',
    thumbnailUrl: 'https://example.com/shibuya.jpg',
    publishedAt: '2026-08-19T07:00:00Z',
    updatedAt: '2026-08-19T07:00:00Z',
    sourceName: 'lwy',
    sourceType: 'community' as const,
    isLive: true,
    verificationStatus: 'verified' as const,
    latitude: 35.6595,
    longitude: 139.7004,
  };
  const m = liveEventToUniversal(e);
  assert.equal(m.moment_id, 'evt-1');
  assert.equal(m.city_id, 'tokyo');
  assert.equal(m.public_city_name, 'Tokyo');
  assert.equal(m.media.url, 'https://example.com/shibuya.jpg');
  assert.equal(m.media_type, 'image');
  assert.equal(m.captured_at, '2026-08-19T06:00:00Z');
  assert.equal(m.uploaded_at, '2026-08-19T07:00:00Z');
  assert.equal(m.published_at, '2026-08-19T07:00:00Z');
  assert.equal(m.provenance_status, 'self_reported');
  assert.equal(m.moderation_status, 'approved');
  assert.equal(m.raw_location?.latitude, 35.6595);
  assert.equal(m.raw_location?.longitude, 139.7004);
  assert.equal(m.editorial?.category, 'urban');
  assert.equal(m.captions?.en, 'Shibuya crossing');
  assert.equal(m.sources?.[0].name, 'lwy');
  assert.equal(m.sources?.[0].type, 'manual');
});

test('liveEventToUniversal · local-media → trusted_source', () => {
  const e = {
    id: 'e', cityId: 'c', cityNameZh: '', cityNameEn: 'C',
    countryZh: '', countryEn: 'X',
    category: 'finance' as const, categoryLabelZh: '金融',
    contentType: 'finance' as const, contentTypeZh: '',
    scale: 'local' as const,
    title: 't', description: 'd',
    localTime: '00:00', timezone: 'UTC', utcOffset: 0,
    observedAt: '2026-08-19T00:00:00Z',
    thumbnailUrl: 'https://x',
    updatedAt: '2026-08-19T00:00:00Z',
    sourceName: 'Reuters', sourceType: 'local-media' as const,
    isLive: true, verificationStatus: 'verified' as const,
  };
  assert.equal(liveEventToUniversal(e).provenance_status, 'trusted_source');
});

test('liveEventToUniversal · editorial → editorial', () => {
  const e = {
    id: 'e', cityId: 'c', cityNameZh: '', cityNameEn: 'C',
    countryZh: '', countryEn: 'X',
    category: 'art' as const, categoryLabelZh: '艺术',
    contentType: 'culture' as const, contentTypeZh: '',
    scale: 'local' as const,
    title: 't', description: 'd',
    localTime: '00:00', timezone: 'UTC', utcOffset: 0,
    observedAt: '2026-08-19T00:00:00Z',
    thumbnailUrl: 'https://x',
    updatedAt: '2026-08-19T00:00:00Z',
    sourceName: 'PM', sourceType: 'editorial' as const,
    isLive: false, verificationStatus: 'editorial' as const,
  };
  assert.equal(liveEventToUniversal(e).provenance_status, 'editorial');
});

test('liveEventToUniversal · 无 lat/lon → raw_location undefined', () => {
  const e = {
    id: 'e', cityId: 'c', cityNameZh: '', cityNameEn: 'C',
    countryZh: '', countryEn: 'X',
    category: 'nature' as const, categoryLabelZh: '自然',
    contentType: 'nature' as const, contentTypeZh: '',
    scale: 'local' as const,
    title: 't', description: 'd',
    localTime: '00:00', timezone: 'UTC', utcOffset: 0,
    observedAt: '2026-08-19T00:00:00Z',
    thumbnailUrl: 'https://x',
    updatedAt: '2026-08-19T00:00:00Z',
    sourceName: 'X', sourceType: 'community' as const,
    isLive: true, verificationStatus: 'verified' as const,
  };
  assert.equal(liveEventToUniversal(e).raw_location, undefined);
});

test('liveEventToUniversal · 无 sourceUrl → sources[0].url undefined', () => {
  const e = {
    id: 'e', cityId: 'c', cityNameZh: '', cityNameEn: 'C',
    countryZh: '', countryEn: 'X',
    category: 'art' as const, categoryLabelZh: '艺术',
    contentType: 'culture' as const, contentTypeZh: '',
    scale: 'local' as const,
    title: 't', description: 'd',
    localTime: '00:00', timezone: 'UTC', utcOffset: 0,
    observedAt: '2026-08-19T00:00:00Z',
    thumbnailUrl: 'https://x',
    updatedAt: '2026-08-19T00:00:00Z',
    sourceName: 'X', sourceType: 'community' as const,
    isLive: true, verificationStatus: 'verified' as const,
  };
  const m = liveEventToUniversal(e);
  assert.equal(m.sources?.[0].name, 'X');
  assert.equal(m.sources?.[0].url, undefined);
});

test('legacyMomentToUniversal · 双语 caption + category', () => {
  const m = legacyMomentToUniversal({
    id: 'tokyo',
    cityZh: '东京',
    cityEn: 'Tokyo',
    countryZh: '日本',
    countryEn: 'Japan',
    lon: 139.6917,
    lat: 35.6895,
    category: 'urban',
    categoryLabelZh: '都市',
    textZh: '涩谷的红灯刚转绿',
    textEn: 'Shibuya just turned green',
  });
  assert.equal(m.moment_id, 'tokyo');
  assert.equal(m.city_id, 'tokyo');
  assert.equal(m.public_city_name, 'Tokyo');
  assert.equal(m.media_type, 'text');
  assert.equal(m.caption, 'Shibuya just turned green');
  assert.equal(m.captions?.zh, '涩谷的红灯刚转绿');
  assert.equal(m.captions?.en, 'Shibuya just turned green');
  assert.equal(m.editorial?.category, 'urban');
  assert.equal(m.provenance_status, 'editorial');
});

test('legacyMomentToUniversal · "New York" → city_id "new-york"', () => {
  const m = legacyMomentToUniversal({
    id: 'nyc',
    cityZh: '纽约',
    cityEn: 'New York',
    countryZh: '美国',
    countryEn: 'United States',
    lon: -74.006,
    lat: 40.7128,
    category: 'finance',
    categoryLabelZh: '金融',
    textZh: '开盘钟',
    textEn: 'Opening bell',
  });
  assert.equal(m.city_id, 'new-york');
});

test('legacyMomentToUniversal · "Reykjavík" → city_id "reykjavk"(变音符去除)', () => {
  const m = legacyMomentToUniversal({
    id: 'rkv',
    cityZh: '雷克雅未克',
    cityEn: 'Reykjavík',
    countryZh: '冰岛',
    countryEn: 'Iceland',
    lon: -21.9426,
    lat: 64.1466,
    category: 'romance',
    categoryLabelZh: '浪漫',
    textZh: '尖顶在等极光',
    textEn: 'Spire waiting for aurora',
  });
  // "Reykjavík" → slugify → "reykjavk"(í 变 i, 但"av"中的 í 影响)
  // 实际:slugify "Reykjavík" → "reykjavk"("í" → "i" + 紧邻"avk"组合)
  // 或者: "reykjavík" → "reykjavk"(简单 lowercase + 替换非字母数字 + 连字符替换空格)
  // 我们的实现: lower + replace 空格 → '-' + 去掉 [^a-z0-9-]
  //  "Reykjavík" → "reykjavík" → "reykjavík" → "reykjavík" → "reykjavík"(保留 í)
  // 但 [^a-z0-9-] 会去掉 í → "reykjavk"
  assert.equal(m.city_id, 'reykjavk');
});