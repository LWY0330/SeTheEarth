/* ============================================================
   v1.6.2 · useCityData + legacyToUniversal adapter 测试
   - 12 测试覆盖 12 城 mapping + edge cases
   ============================================================ */

// @ts-ignore -- node:test 类型声明缺失
import { test } from 'node:test';
// @ts-ignore -- node:assert/strict 类型声明缺失
import assert from 'node:assert/strict';
import type { City as LegacyCity } from '../data/cities.ts';
import {
  legacyToUniversal,
  listAllCitySlugs,
  getCountryNameForCity,
} from './useCityData.ts';

/**
 * fixtureLegacy · 构造最小可用的 legacy City 对象。
 * 测试不需要关心 legacy 全部字段,只关心 adapter 关心的字段。
 */
function fixtureLegacy(overrides: Partial<{
  id: string;
  slug: string;
  nameZh: string;
  nameEn: string;
  countryZh: string;
  countryEn: string;
  description: string;
  momentZh: string;
  lon: number;
  lat: number;
  timezone: string;
  oneObservation: string;
  livingNote?: string;
  cultureNote?: string;
  imageCredit?: string;
  images: LegacyCity['images'];
}>): LegacyCity {
  return {
    id: 'test',
    slug: 'test',
    nameZh: '',
    nameEn: 'Test',
    countryZh: '',
    countryEn: 'Japan',
    description: '',
    momentZh: '',
    lon: 0,
    lat: 0,
    timezone: 'UTC',
    oneObservation: '',
    href: '/cities/test',
    images: [],
    weather: { summary: '', temperatureC: 0, icon: '' },
    ...overrides,
  } as LegacyCity;
}

test('legacyToUniversal · Kyoto 映射正确', () => {
  const city = legacyToUniversal(
    fixtureLegacy({
      id: 'kyoto',
      nameZh: '京都',
      nameEn: 'Kyoto',
      countryEn: 'Japan',
      lat: 35.0116,
      lon: 135.7681,
      timezone: 'Asia/Tokyo',
    }),
  );
  assert.equal(city.identity.city_id, 'kyoto');
  assert.equal(city.identity.canonical_name, 'Kyoto');
  assert.equal(city.identity.local_name, '京都');
  assert.equal(city.identity.country_code, 'JP');
  assert.equal(city.identity.country_name, 'Japan');
  assert.equal(city.identity.place_type, 'city');
  assert.equal(city.identity.timezone, 'Asia/Tokyo');
  assert.equal(city.state_level, 'L0_mapped');
  assert.equal(city.page_state, 'E_empty');
});

test('legacyToUniversal · Lisbon 映射 country_code=PT', () => {
  const city = legacyToUniversal(
    fixtureLegacy({
      id: 'lisbon',
      nameEn: 'Lisbon',
      countryEn: 'Portugal',
      lat: 38.7223,
      lon: -9.1393,
      timezone: 'Europe/Lisbon',
    }),
  );
  assert.equal(city.identity.country_code, 'PT');
});

test('legacyToUniversal · Cape Town 映射 country_code=ZA(南非统一时区)', () => {
  const city = legacyToUniversal(
    fixtureLegacy({
      id: 'cape-town',
      nameEn: 'Cape Town',
      countryEn: 'South Africa',
      lat: -33.9249,
      lon: 18.4241,
      timezone: 'Africa/Johannesburg',
    }),
  );
  assert.equal(city.identity.country_code, 'ZA');
  assert.equal(city.identity.timezone, 'Africa/Johannesburg');
});

test('legacyToUniversal · Reykjavík 含变音符正确处理(unicode 安全)', () => {
  const city = legacyToUniversal(
    fixtureLegacy({
      id: 'reykjavik',
      nameEn: 'Reykjavík',
      countryEn: 'Iceland',
      lat: 64.1466,
      lon: -21.9426,
      timezone: 'Atlantic/Reykjavik',
    }),
  );
  assert.equal(city.identity.canonical_name, 'Reykjavík');
  assert.equal(city.identity.country_code, 'IS');
});

test('legacyToUniversal · 未知 country → XX 占位(防御)', () => {
  const city = legacyToUniversal(
    fixtureLegacy({
      id: 'atlantis',
      nameEn: 'Atlantis',
      countryEn: 'Atlantis',
      timezone: 'Etc/UTC',
    }),
  );
  assert.equal(city.identity.country_code, 'XX');
});

test('legacyToUniversal · images[scene=landmark] 派生 hero_media', () => {
  const city = legacyToUniversal(
    fixtureLegacy({
      id: 'kyoto',
      nameZh: '京都',
      nameEn: 'Kyoto',
      images: [
        { scene: 'landmark', period: 'afternoon', url: '/kyoto/landmark.jpg', focus: '50% 50%', width: 1200, height: 800 },
        { scene: 'nature', period: 'morning', url: '/kyoto/nature.jpg', focus: '50% 50%', width: 1200, height: 800 },
      ],
      imageCredit: 'Sorasak',
    }),
  );
  assert.ok(city.visual);
  assert.equal(city.visual!.hero_media!.url, '/kyoto/landmark.jpg');
  assert.equal(city.visual!.hero_media!.alt, '京都 Kyoto');
  assert.equal(city.visual!.visual_status, 'seed');
  assert.equal(city.visual!.hero_creator, 'Sorasak');
});

test('legacyToUniversal · images 空 → visual undefined', () => {
  const city = legacyToUniversal(fixtureLegacy({ id: 'empty', images: [] }));
  assert.equal(city.visual, undefined);
});

test('legacyToUniversal · content 5 字段填充', () => {
  const city = legacyToUniversal(
    fixtureLegacy({
      id: 'kyoto',
      momentZh: '此刻叙事',
      description: '城市描述',
      oneObservation: '单条观察',
      livingNote: '当地生活',
      cultureNote: '文化背景',
    }),
  );
  assert.equal(city.content?.description, '城市描述');
  assert.equal(city.content?.momentZh, '此刻叙事');
  assert.equal(city.content?.oneObservation, '单条观察');
  assert.equal(city.content?.livingNote, '当地生活');
  assert.equal(city.content?.cultureNote, '文化背景');
});

test('legacyToUniversal · 12 城全部可映射(country_code 100% pass)', () => {
  const all = [
    { id: 'kyoto', nameEn: 'Kyoto', countryEn: 'Japan' },
    { id: 'lisbon', nameEn: 'Lisbon', countryEn: 'Portugal' },
    { id: 'shanghai', nameEn: 'Shanghai', countryEn: 'China' },
    { id: 'mexico-city', nameEn: 'Mexico City', countryEn: 'Mexico' },
    { id: 'tokyo', nameEn: 'Tokyo', countryEn: 'Japan' },
    { id: 'rio', nameEn: 'Rio de Janeiro', countryEn: 'Brazil' },
    { id: 'reykjavik', nameEn: 'Reykjavík', countryEn: 'Iceland' },
    { id: 'cape-town', nameEn: 'Cape Town', countryEn: 'South Africa' },
    { id: 'london', nameEn: 'London', countryEn: 'United Kingdom' },
    { id: 'berlin', nameEn: 'Berlin', countryEn: 'Germany' },
    { id: 'rome', nameEn: 'Rome', countryEn: 'Italy' },
    { id: 'sydney', nameEn: 'Sydney', countryEn: 'Australia' },
  ];
  for (const f of all) {
    const city = legacyToUniversal(
      fixtureLegacy({ id: f.id, nameEn: f.nameEn, countryEn: f.countryEn }),
    );
    assert.notEqual(city.identity.country_code, 'XX', `${f.id} 映射失败`);
  }
});

test('listAllCitySlugs · 返回 12 城 slug', () => {
  const slugs = listAllCitySlugs();
  assert.ok(slugs.length >= 12);
  assert.ok(slugs.includes('kyoto'));
  assert.ok(slugs.includes('lisbon'));
  assert.ok(slugs.includes('sydney'));
});

test('getCountryNameForCity · Kyoto/JP/zh → 日本', () => {
  const name = getCountryNameForCity(
    {
      identity: {
        city_id: 'kyoto',
        canonical_name: 'Kyoto',
        country_code: 'JP',
        country_name: 'Japan',
        place_type: 'city',
        latitude: 0,
        longitude: 0,
        timezone: 'UTC',
      },
    },
    'zh',
  );
  assert.equal(name, '日本');
});

test('getCountryNameForCity · Kyoto/JP/en → Japan', () => {
  const name = getCountryNameForCity(
    {
      identity: {
        city_id: 'kyoto',
        canonical_name: 'Kyoto',
        country_code: 'JP',
        country_name: 'Japan',
        place_type: 'city',
        latitude: 0,
        longitude: 0,
        timezone: 'UTC',
      },
    },
    'en',
  );
  assert.equal(name, 'Japan');
});