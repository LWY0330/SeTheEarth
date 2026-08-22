/* ============================================================
   v1.6.3 · cityFromCoordinates 测试
   - 12 测试覆盖 12 城边界 + 边缘 case
   ============================================================ */

// @ts-ignore -- node:test 类型声明缺失
import { test } from 'node:test';
// @ts-ignore -- node:assert/strict 类型声明缺失
import assert from 'node:assert/strict';
import {
  findCityByCoordinates,
  haversineDistanceKm,
  getAllCityRecords,
  CITY_RECORDS,
} from './cityFromCoordinates.ts';

test('findCityByCoordinates · Mexico City 19.4326°N -99.1332°W → "mexico-city"', () => {
  // Mexico City per cities.ts:lat 19.4326, lon -99.1332
  assert.equal(findCityByCoordinates(19.4326, -99.1332), 'mexico-city');
});

test('findCityByCoordinates · Kyoto 35.0116°N 135.7681°E → "kyoto"', () => {
  assert.equal(findCityByCoordinates(35.0116, 135.7681), 'kyoto');
});

test('findCityByCoordinates · 12 城全部可匹配(精确坐标)', () => {
  const cases: Array<{ lat: number; lon: number; expected: string }> = [
    { lat: 35.0116, lon: 135.7681, expected: 'kyoto' },
    { lat: 38.7223, lon: -9.1393, expected: 'lisbon' },
    { lat: 31.2304, lon: 121.4737, expected: 'shanghai' },
    { lat: 19.4326, lon: -99.1332, expected: 'mexico-city' },
    { lat: 35.6895, lon: 139.6917, expected: 'tokyo' },
    { lat: -22.9068, lon: -43.1729, expected: 'rio' },
    { lat: 64.1466, lon: -21.9426, expected: 'reykjavik' },
    { lat: -33.9249, lon: 18.4241, expected: 'cape-town' },
    { lat: 51.5074, lon: -0.1276, expected: 'london' },
    { lat: 52.5200, lon: 13.4050, expected: 'berlin' },
    { lat: 41.9028, lon: 12.4964, expected: 'rome' },
    { lat: -33.8688, lon: 151.2093, expected: 'sydney' },
  ];
  for (const c of cases) {
    assert.equal(findCityByCoordinates(c.lat, c.lon), c.expected, `${c.lat},${c.lon}`);
  }
});

test('findCityByCoordinates · 边界 case:超出 200km 默认阈值 → null', () => {
  // 北大西洋中央(无城市)
  assert.equal(findCityByCoordinates(45.0, -30.0), null);
});

test('findCityByCoordinates · 边界 case:自定义 maxDistanceKm=2000km', () => {
  // 距 Mexico City 约 1000km 处(美国中部),默认 200km 不匹配,maxDistanceKm=2000 应匹配
  assert.equal(findCityByCoordinates(30.0, -100.0, { maxDistanceKm: 2000 }), 'mexico-city');
});

test('findCityByCoordinates · 边界 case:无效 lat → null', () => {
  assert.equal(findCityByCoordinates(91, 0), null);
  assert.equal(findCityByCoordinates(-91, 0), null);
  assert.equal(findCityByCoordinates(NaN, 0), null);
});

test('findCityByCoordinates · 边界 case:无效 lon → null', () => {
  assert.equal(findCityByCoordinates(0, 181), null);
  assert.equal(findCityByCoordinates(0, -181), null);
});

test('findCityByCoordinates · 同名/相近坐标:按距离选最近', () => {
  // Tokyo (35.6895, 139.6917) 和 Kyoto (35.0116, 135.7681) 都是日本
  // 35.5°N 138.9°E 距 Tokyo ~150km, 距 Kyoto ~280km → Tokyo
  assert.equal(findCityByCoordinates(35.5, 138.9), 'tokyo');
  // 35.5°N 137°E 距 Kyoto ~110km, 距 Tokyo ~260km → Kyoto
  assert.equal(findCityByCoordinates(35.5, 137.0), 'kyoto');
});

test('haversineDistanceKm · 已知距离验证(Mexico City → Tokyo ≈ 11,500km)', () => {
  const d = haversineDistanceKm(19.4326, -99.1332, 35.6895, 139.6917);
  // 允许 100km 误差(地球曲率 + Haversine 简化)
  assert.ok(d > 11000 && d < 12000, `actual=${d.toFixed(0)}km`);
});

test('haversineDistanceKm · 同点距离 = 0', () => {
  assert.equal(haversineDistanceKm(35.0, 139.0, 35.0, 139.0), 0);
});

test('CITY_RECORDS · 12 城数量 + frozen', () => {
  assert.equal(CITY_RECORDS.length, 12);
  assert.equal(Object.isFrozen(CITY_RECORDS), true);
});

test('getAllCityRecords · 返回 CITY_RECORDS(同引用)', () => {
  assert.equal(getAllCityRecords(), CITY_RECORDS);
});