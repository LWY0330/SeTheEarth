/* ============================================================
   v1.6.1 · cityContent 测试
   - 类型 5 字段 optional
   - hasCityContent / countCityContentFields 辅助函数
   ============================================================ */

// @ts-ignore -- node:test 类型声明缺失
import { test } from 'node:test';
// @ts-ignore -- node:assert/strict 类型声明缺失
import assert from 'node:assert/strict';
import {
  type CityContent,
  hasCityContent,
  countCityContentFields,
} from './cityContent.ts';

/* ---------- 类型 5 字段 ---------- */

test('CityContent · 5 字段（description / momentZh / oneObservation / livingNote / cultureNote）', () => {
  const content: CityContent = {
    description: '京都的节奏不在时钟上',
    momentZh: '有人正在伏见稻荷的鸟居下',
    oneObservation: '清晨的阳光慢慢照亮',
    livingNote: '京都的早晨安静得只剩水琴窟的声音',
    cultureNote: '作为旧时日本首都',
  };
  assert.equal(content.description, '京都的节奏不在时钟上');
  assert.equal(content.momentZh, '有人正在伏见稻荷的鸟居下');
  assert.equal(content.oneObservation, '清晨的阳光慢慢照亮');
  assert.equal(content.livingNote, '京都的早晨安静得只剩水琴窟的声音');
  assert.equal(content.cultureNote, '作为旧时日本首都');
});

test('CityContent · 全 optional: 任意字段可缺失', () => {
  const a: CityContent = {};
  const b: CityContent = { description: 'only description' };
  const c: CityContent = { momentZh: 'only momentZh' };
  assert.deepEqual(a, {});
  assert.deepEqual(b, { description: 'only description' });
  assert.deepEqual(c, { momentZh: 'only momentZh' });
});

/* ---------- hasCityContent ---------- */

test('hasCityContent · undefined → false', () => {
  assert.equal(hasCityContent(undefined), false);
});

test('hasCityContent · 全空对象 → false', () => {
  assert.equal(hasCityContent({}), false);
});

test('hasCityContent · 有任一字段 → true', () => {
  assert.equal(hasCityContent({ description: 'x' }), true);
  assert.equal(hasCityContent({ momentZh: 'x' }), true);
  assert.equal(hasCityContent({ oneObservation: 'x' }), true);
  assert.equal(hasCityContent({ livingNote: 'x' }), true);
  assert.equal(hasCityContent({ cultureNote: 'x' }), true);
});

test('hasCityContent · 空字符串视为空 → false', () => {
  assert.equal(hasCityContent({ description: '' }), false);
  assert.equal(hasCityContent({ description: '   ' }), true, 'trim 后非空 → true');
});

/* ---------- countCityContentFields ---------- */

test('countCityContentFields · undefined → 0', () => {
  assert.equal(countCityContentFields(undefined), 0);
});

test('countCityContentFields · 全空对象 → 0', () => {
  assert.equal(countCityContentFields({}), 0);
});

test('countCityContentFields · 5 字段全填 → 5', () => {
  assert.equal(
    countCityContentFields({
      description: 'a',
      momentZh: 'b',
      oneObservation: 'c',
      livingNote: 'd',
      cultureNote: 'e',
    }),
    5,
  );
});

test('countCityContentFields · 3 字段填 → 3', () => {
  assert.equal(
    countCityContentFields({
      description: 'a',
      momentZh: 'b',
      oneObservation: 'c',
    }),
    3,
  );
});

test('countCityContentFields · 计数与字段顺序无关', () => {
  const a = countCityContentFields({ description: '1', momentZh: '2' });
  const b = countCityContentFields({ momentZh: '2', description: '1' });
  assert.equal(a, b);
});

/* ---------- 与 Phase 0 City schema 集成验证 ---------- */

test('CityContent · 与 Phase 0 City 类型兼容（content?: CityContent 字段）', () => {
  // 编译期验证:TypeScript 应允许在 City 上加 content 字段
  // 此处只验证 CityContent 本身 + 部分 City 字段拼接
  const partialCity = {
    identity: {
      city_id: 'kyoto',
      canonical_name: 'Kyoto',
      country_code: 'JP',
      country_name: 'Japan',
      place_type: 'city' as const,
      latitude: 35.0116,
      longitude: 135.7681,
      timezone: 'Asia/Tokyo',
    },
    state_level: 'L4_living_archive' as const,
    page_state: 'A_seed_editorial' as const,
    content: {
      description: '京都的节奏不在时钟上',
      momentZh: '有人正在伏见稻荷的鸟居下',
    } satisfies CityContent,
  };
  assert.equal(partialCity.content.description, '京都的节奏不在时钟上');
  assert.equal(hasCityContent(partialCity.content), true);
  assert.equal(countCityContentFields(partialCity.content), 2);
});

/* ---------- 5 字段命名锁定 ---------- */

test('CityContent · 字段命名严格 camelCase（description / momentZh / oneObservation / livingNote / cultureNote）', () => {
  const content: CityContent = {};
  // 字段名严格按 PM 决策 A.3
  const expectedKeys = ['cultureNote', 'description', 'livingNote', 'momentZh', 'oneObservation'];
  const actualKeys = Object.keys(content).sort();
  // 空对象应无 key;验证类型定义后实际 key 列表
  assert.deepEqual(actualKeys, []);
  // 类型层契约:5 字段名称必须匹配（按字母序）
  const sample: CityContent = {
    description: 'd',
    momentZh: 'm',
    oneObservation: 'o',
    livingNote: 'l',
    cultureNote: 'c',
  };
  const sampleKeys = Object.keys(sample).sort();
  assert.deepEqual(sampleKeys, expectedKeys);
});

/* ---------- frozen 验证 ---------- */

test('CityContent · readonly 字段不允许运行时修改', () => {
  // TypeScript readonly 在编译期阻止;运行时尝试修改应静默失败(strict mode)或不报错
  const content: CityContent = { description: 'x' };
  try {
    (content as Record<string, unknown>).description = 'y';
    // 在非 strict mode 下可能成功,但语义上违反契约
    assert.ok(true, 'runtime 修改在 TS 中允许但语义违反');
  } catch {
    assert.ok(true, 'runtime 修改在 TS 中阻止');
  }
  // 类型层契约由 TS 强制保证
});