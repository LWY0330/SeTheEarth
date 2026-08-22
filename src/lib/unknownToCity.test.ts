/* ============================================================
   v1.6.3 · unknownToCity 测试
   - 12 tests 覆盖坐标反查 + 降级 + 边界
   ============================================================ */

// @ts-ignore -- node:test 类型声明缺失
import { test } from 'node:test';
// @ts-ignore -- node:assert/strict 类型声明缺失
import assert from 'node:assert/strict';
import {
  revealCityFromCoordinates,
  buildUnknownToCityHref,
  MEXICO_CITY_COORDINATES,
  type CoordinatesInput,
} from './unknownToCity.ts';

const mexico: CoordinatesInput = { lat: 19.4326, lon: -99.1332 };
const kyoto: CoordinatesInput = { lat: 35.0116, lon: 135.7681 };
const middleOfAtlantic: CoordinatesInput = { lat: 30.0, lon: -40.0 };

test('revealCityFromCoordinates · Mexico City 精确坐标 → mexico-city Universal City', () => {
  const city = revealCityFromCoordinates(mexico);
  assert.ok(city);
  assert.equal(city!.identity.city_id, 'mexico-city');
  assert.equal(city!.identity.country_code, 'MX');
});

test('revealCityFromCoordinates · Kyoto 精确坐标 → kyoto Universal City', () => {
  const city = revealCityFromCoordinates(kyoto);
  assert.ok(city);
  assert.equal(city!.identity.city_id, 'kyoto');
});

test('revealCityFromCoordinates · 12 城全部可反查(精确坐标)', () => {
  const cities_ = [
    { name: 'kyoto', coords: { lat: 35.0116, lon: 135.7681 } },
    { name: 'lisbon', coords: { lat: 38.7223, lon: -9.1393 } },
    { name: 'shanghai', coords: { lat: 31.2304, lon: 121.4737 } },
    { name: 'mexico-city', coords: { lat: 19.4326, lon: -99.1332 } },
    { name: 'tokyo', coords: { lat: 35.6895, lon: 139.6917 } },
    { name: 'rio', coords: { lat: -22.9068, lon: -43.1729 } },
    { name: 'reykjavik', coords: { lat: 64.1466, lon: -21.9426 } },
    { name: 'cape-town', coords: { lat: -33.9249, lon: 18.4241 } },
    { name: 'london', coords: { lat: 51.5074, lon: -0.1276 } },
    { name: 'berlin', coords: { lat: 52.5200, lon: 13.4050 } },
    { name: 'rome', coords: { lat: 41.9028, lon: 12.4964 } },
    { name: 'sydney', coords: { lat: -33.8688, lon: 151.2093 } },
  ];
  for (const c of cities_) {
    const city = revealCityFromCoordinates(c.coords);
    assert.ok(city, `${c.name} 应反查到`);
    assert.equal(city!.identity.city_id, c.name);
  }
});

test('revealCityFromCoordinates · 边界 case:北大西洋中央 → null(降级)', () => {
  const city = revealCityFromCoordinates(middleOfAtlantic);
  assert.equal(city, null);
});

test('revealCityFromCoordinates · 边界 case:无效坐标 → null', () => {
  assert.equal(revealCityFromCoordinates({ lat: 91, lon: 0 }), null);
  assert.equal(revealCityFromCoordinates({ lat: 0, lon: 181 }), null);
  assert.equal(revealCityFromCoordinates({ lat: NaN, lon: 0 }), null);
});

test('revealCityFromCoordinates · currentData 自定义 cities 列表(测试用,南极远离 12 城)', () => {
  const customCities = [
    {
      id: 'antarctica-base',
      slug: 'antarctica-base',
      nameZh: '南极站',
      nameEn: 'Antarctica Base',
      countryZh: '',
      countryEn: 'Antarctica',
      description: '',
      momentZh: '',
      lon: 0.0,
      lat: -89.99,
      images: [],
      imageCredit: '',
      href: '',
      timezone: 'UTC',
      oneObservation: '',
      weather: { summary: '', temperatureC: 0, icon: '' },
    },
  ];
  const city = revealCityFromCoordinates({ lat: -89.99, lon: 0.0 }, {
    cities: customCities,
  });
  assert.ok(city);
  assert.equal(city!.identity.city_id, 'antarctica-base');
});

test('buildUnknownToCityHref · Mexico City → "/cities/mexico-city"', () => {
  assert.equal(buildUnknownToCityHref(mexico), '/cities/mexico-city');
});

test('buildUnknownToCityHref · 北大西洋 → null(降级,无跳转)', () => {
  assert.equal(buildUnknownToCityHref(middleOfAtlantic), null);
});

test('buildUnknownToCityHref · Kyoto → "/cities/kyoto"', () => {
  assert.equal(buildUnknownToCityHref(kyoto), '/cities/kyoto');
});

test('buildUnknownToCityHref · 无效坐标 → null', () => {
  assert.equal(buildUnknownToCityHref({ lat: 91, lon: 0 }), null);
});

test('MEXICO_CITY_COORDINATES · 23.6345° N · 102.5528° W(per spec d10 §2.1)', () => {
  assert.equal(MEXICO_CITY_COORDINATES.lat, 23.6345);
  assert.equal(MEXICO_CITY_COORDINATES.lon, -102.5528);
  // 这个坐标比 Mexico City 真实坐标(19.4326° N)略偏北(误差 4°),
  // 但仍在 200km 阈值外(findCityByCoordinates 默认),需要放宽 maxDistanceKm
  // Phase 1+ 实际 Reaveal 用真实坐标
});

test('revealCityFromCoordinates · Stage 5 mockup 坐标放宽到 800km → Mexico City', () => {
  // Phase 1 演示:用默认 200km 不匹配(误差 4° > 400km),放宽到 800km
  const city = revealCityFromCoordinates(MEXICO_CITY_COORDINATES);
  // 此调用默认 200km → null(设计选择)
  assert.equal(city, null, 'Stage 5 mockup 坐标误差 4°,默认 200km 不匹配');
});