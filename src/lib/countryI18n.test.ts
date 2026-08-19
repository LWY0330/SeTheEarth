/* ============================================================
   v1.6.1 · countryI18n 测试
   - 12 现有城市覆盖 + 4 预留国家
   - locale 严格校验 + 回退
   ============================================================ */

// @ts-ignore -- node:test 类型声明缺失
import { test } from 'node:test';
// @ts-ignore -- node:assert/strict 类型声明缺失
import assert from 'node:assert/strict';
import {
  COUNTRY_I18N,
  getCountryNameLocal,
  isValidCountryCode,
  listCountriesByLocale,
  listSupportedCountryCodes,
  type CountryCode,
} from './countryI18n.ts';

/* ---------- getCountryNameLocal · 12 城 × zh ---------- */

const ZH_12_CITIES: Array<[CountryCode, string]> = [
  ['JP', '日本'], ['PT', '葡萄牙'], ['CN', '中国'], ['MX', '墨西哥'],
  ['BR', '巴西'], ['IS', '冰岛'], ['ZA', '南非'], ['GB', '英国'],
  ['DE', '德国'], ['IT', '意大利'], ['AU', '澳大利亚'], ['JP', '日本'],
];

test('getCountryNameLocal · 12 现有城市对应 zh 名称（含 JP × 2）', () => {
  for (const [code, expected] of ZH_12_CITIES) {
    assert.equal(getCountryNameLocal(code, 'zh'), expected, `country_code=${code}`);
  }
});

test('getCountryNameLocal · 12 现有城市对应 en 名称', () => {
  const EN_12: Array<[CountryCode, string]> = [
    ['JP', 'Japan'], ['PT', 'Portugal'], ['CN', 'China'], ['MX', 'Mexico'],
    ['BR', 'Brazil'], ['IS', 'Iceland'], ['ZA', 'South Africa'], ['GB', 'United Kingdom'],
    ['DE', 'Germany'], ['IT', 'Italy'], ['AU', 'Australia'], ['JP', 'Japan'],
  ];
  for (const [code, expected] of EN_12) {
    assert.equal(getCountryNameLocal(code, 'en'), expected, `country_code=${code}`);
  }
});

/* ---------- 预留国家 ---------- */

test('getCountryNameLocal · 4 预留国家 zh', () => {
  assert.equal(getCountryNameLocal('US', 'zh'), '美国');
  assert.equal(getCountryNameLocal('FR', 'zh'), '法国');
  assert.equal(getCountryNameLocal('SD', 'zh'), '苏丹');
  assert.equal(getCountryNameLocal('EG', 'zh'), '埃及');
});

test('getCountryNameLocal · 4 预留国家 en', () => {
  assert.equal(getCountryNameLocal('US', 'en'), 'United States');
  assert.equal(getCountryNameLocal('FR', 'en'), 'France');
  assert.equal(getCountryNameLocal('SD', 'en'), 'Sudan');
  assert.equal(getCountryNameLocal('EG', 'en'), 'Egypt');
});

/* ---------- 错误处理 ---------- */

test('getCountryNameLocal · 不存在的 country_code → undefined', () => {
  assert.equal(getCountryNameLocal('ZZ', 'zh'), undefined);
  assert.equal(getCountryNameLocal('XX', 'en'), undefined);
});

test('getCountryNameLocal · 小写 country_code → undefined（严格 ISO 校验）', () => {
  assert.equal(getCountryNameLocal('jp', 'zh'), undefined, '小写 jp 应被拒绝');
  assert.equal(getCountryNameLocal('cn', 'en'), undefined);
});

test('getCountryNameLocal · 非 2 字符 → undefined', () => {
  assert.equal(getCountryNameLocal('J', 'zh'), undefined);
  assert.equal(getCountryNameLocal('JPN', 'zh'), undefined);
  assert.equal(getCountryNameLocal('', 'zh'), undefined);
  assert.equal(getCountryNameLocal('J1', 'zh'), undefined, '数字应被拒绝');
});

test('getCountryNameLocal · locale 不支持（"ja"）→ TypeScript 编译期拒绝；运行时仅 zh/en 可用', () => {
  // 行为契约:LocaleCode 是字面量联合 'zh' | 'en'
  // 此测试断言每个 entry.names 仅有 zh + en 两个字段（无 ja/es/pt 等）
  for (const entry of COUNTRY_I18N) {
    const keys = Object.keys(entry.names);
    assert.deepEqual(keys.sort(), ['en', 'zh'], `country=${entry.country_code} 应仅含 zh+en`);
  }
});

/* ---------- isValidCountryCode ---------- */

test('isValidCountryCode · 合法 2 大写字母 → true', () => {
  assert.equal(isValidCountryCode('JP'), true);
  assert.equal(isValidCountryCode('CN'), true);
  assert.equal(isValidCountryCode('US'), true);
});

test('isValidCountryCode · 不合法 → false', () => {
  assert.equal(isValidCountryCode('jp'), false);
  assert.equal(isValidCountryCode('J'), false);
  assert.equal(isValidCountryCode('JPN'), false);
  assert.equal(isValidCountryCode(''), false);
  assert.equal(isValidCountryCode('J1'), false);
  assert.equal(isValidCountryCode('12'), false);
  assert.equal(isValidCountryCode('J-P'), false);
});

/* ---------- listSupportedCountryCodes ---------- */

test('listSupportedCountryCodes · 15 国家（11 + 4 预留）', () => {
  const codes = listSupportedCountryCodes();
  assert.equal(codes.length, 15);
  assert.ok(codes.includes('JP'));
  assert.ok(codes.includes('US'));
});

test('listSupportedCountryCodes · 返回 frozen array', () => {
  const codes = listSupportedCountryCodes();
  assert.equal(Object.isFrozen(codes), true);
});

/* ---------- listCountriesByLocale ---------- */

test('listCountriesByLocale · zh 返回 15 行', () => {
  const rows = listCountriesByLocale('zh');
  assert.equal(rows.length, 15);
  const jpRow = rows.find((r) => r.country_code === 'JP');
  assert.deepEqual(jpRow, { country_code: 'JP', name: '日本' });
});

test('listCountriesByLocale · en 返回 15 行', () => {
  const rows = listCountriesByLocale('en');
  assert.equal(rows.length, 15);
  const usRow = rows.find((r) => r.country_code === 'US');
  assert.deepEqual(usRow, { country_code: 'US', name: 'United States' });
});

test('listCountriesByLocale · 返回 frozen array', () => {
  const rows = listCountriesByLocale('zh');
  assert.equal(Object.isFrozen(rows), true);
});

/* ---------- 数据完整性 ---------- */

test('COUNTRY_I18N · 每个 entry 都有 zh + en 双字段', () => {
  for (const entry of COUNTRY_I18N) {
    assert.ok(typeof entry.names.zh === 'string' && entry.names.zh.length > 0, `country=${entry.country_code} zh empty`);
    assert.ok(typeof entry.names.en === 'string' && entry.names.en.length > 0, `country=${entry.country_code} en empty`);
  }
});

test('COUNTRY_I18N · 所有 country_code 唯一', () => {
  const codes = COUNTRY_I18N.map((e) => e.country_code);
  const set = new Set(codes);
  assert.equal(set.size, codes.length, '重复 country_code');
});

test('COUNTRY_I18N · frozen array 不允许运行时修改', () => {
  assert.equal(Object.isFrozen(COUNTRY_I18N), true);
});

/* ---------- 11 城 11 国家（JP × 2 算一次）---------- */

test('getCountryNameLocal · 11 城 11 国家（kyoto + tokyo 都 → JP）', () => {
  const cities11 = ['kyoto', 'lisbon', 'shanghai', 'mexico-city', 'tokyo', 'rio', 'reykjavik', 'cape-town', 'london', 'berlin', 'rome', 'sydney'];
  // 12 城 - JP ×2 dedup = 11 unique countries
  const expectedCountries: Record<string, CountryCode> = {
    'kyoto': 'JP', 'lisbon': 'PT', 'shanghai': 'CN', 'mexico-city': 'MX',
    'tokyo': 'JP', 'rio': 'BR', 'reykjavik': 'IS', 'cape-town': 'ZA',
    'london': 'GB', 'berlin': 'DE', 'rome': 'IT', 'sydney': 'AU',
  };
  const uniqueCountries = new Set(Object.values(expectedCountries));
  assert.equal(uniqueCountries.size, 11);
  for (const city of cities11) {
    const code = expectedCountries[city];
    assert.ok(getCountryNameLocal(code, 'zh'), `${city} (${code}) 应有 zh 名`);
  }
});