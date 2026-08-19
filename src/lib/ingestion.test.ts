/* ============================================================
   看见地球 · v1.6 · ingestion.test.ts
   - validateCity 最小校验 Identity 7 字段
   - normalizeCity / findDuplicates / ingestBatch 是 Phase 3 STUB
   - toCity 默认 state L0 + page E
   - buildHeroMetadata 打包 Hero 元数据
   ============================================================ */

// @ts-ignore -- node:test
import { test } from 'node:test';
// @ts-ignore -- node:assert/strict
import assert from 'node:assert/strict';
import type { NormalizedCity } from './ingestion.ts';
import {
  validateCity,
  normalizeCity,
  findDuplicates,
  ingestBatch,
  toCity,
  buildHeroMetadata,
} from './ingestion.ts';

const GOOD: NormalizedCity = {
  identity: {
    city_id: 'khartoum',
    canonical_name: 'Khartoum',
    local_name: 'الخرطوم',
    country_code: 'SD',
    country_name: 'Sudan',
    admin1_code: 'Khartoum',
    admin1_name: 'Khartoum',
    place_type: 'city',
    latitude: 15.5007,
    longitude: 32.5599,
    timezone: 'Africa/Khartoum',
  },
  source_name: 'GeoNames',
  source_license: 'CC BY 4.0',
  source_url: 'https://www.geonames.org/379252',
};

/* ---------- validateCity · 合法 ---------- */

test('validateCity · 合法数据 → valid=true, no errors', () => {
  const r = validateCity(GOOD);
  assert.equal(r.valid, true);
  assert.equal(r.errors.length, 0);
});

test('validateCity · 合法 + 无 admin1_code → valid 但有 warning', () => {
  const data: NormalizedCity = {
    ...GOOD,
    identity: { ...GOOD.identity, admin1_code: undefined, admin1_name: undefined },
  };
  const r = validateCity(data);
  assert.equal(r.valid, true);
  assert.ok(r.warnings.some((w) => w.includes('admin1_code')));
});

/* ---------- validateCity · 字段缺失 ---------- */

test('validateCity · city_id 缺失 → error', () => {
  const data: NormalizedCity = {
    ...GOOD,
    identity: { ...GOOD.identity, city_id: '' },
  };
  const r = validateCity(data);
  assert.equal(r.valid, false);
  assert.ok(r.errors.some((e) => e.includes('city_id')));
});

test('validateCity · city_id 非法字符 → error', () => {
  const data: NormalizedCity = {
    ...GOOD,
    identity: { ...GOOD.identity, city_id: 'foo bar!' },
  };
  const r = validateCity(data);
  assert.equal(r.valid, false);
  assert.ok(r.errors.some((e) => e.includes('city_id')));
});

test('validateCity · canonical_name 空字符串 → error', () => {
  const data: NormalizedCity = {
    ...GOOD,
    identity: { ...GOOD.identity, canonical_name: '   ' },
  };
  const r = validateCity(data);
  assert.equal(r.valid, false);
  assert.ok(r.errors.some((e) => e.includes('canonical_name')));
});

test('validateCity · country_code 不是 ISO alpha-2 → error', () => {
  const data: NormalizedCity = {
    ...GOOD,
    identity: { ...GOOD.identity, country_code: 'sud' },
  };
  const r = validateCity(data);
  assert.equal(r.valid, false);
  assert.ok(r.errors.some((e) => e.includes('country_code')));
});

test('validateCity · country_name 缺失 → error', () => {
  const data: NormalizedCity = {
    ...GOOD,
    identity: { ...GOOD.identity, country_name: '' },
  };
  const r = validateCity(data);
  assert.equal(r.valid, false);
  assert.ok(r.errors.some((e) => e.includes('country_name')));
});

test('validateCity · place_type 不合法 → error', () => {
  const data: NormalizedCity = {
    ...GOOD,
    identity: { ...GOOD.identity, place_type: 'martian-city' as unknown as 'city' },
  };
  const r = validateCity(data);
  assert.equal(r.valid, false);
  assert.ok(r.errors.some((e) => e.includes('place_type')));
});

test('validateCity · latitude 越界（>90）→ error', () => {
  const data: NormalizedCity = {
    ...GOOD,
    identity: { ...GOOD.identity, latitude: 91 },
  };
  const r = validateCity(data);
  assert.equal(r.valid, false);
  assert.ok(r.errors.some((e) => e.includes('latitude')));
});

test('validateCity · longitude 越界（<-180）→ error', () => {
  const data: NormalizedCity = {
    ...GOOD,
    identity: { ...GOOD.identity, longitude: -181 },
  };
  const r = validateCity(data);
  assert.equal(r.valid, false);
  assert.ok(r.errors.some((e) => e.includes('longitude')));
});

test('validateCity · timezone 非法格式 → error', () => {
  const data: NormalizedCity = {
    ...GOOD,
    identity: { ...GOOD.identity, timezone: 'Asia' },
  };
  const r = validateCity(data);
  assert.equal(r.valid, false);
  assert.ok(r.errors.some((e) => e.includes('timezone')));
});

test('validateCity · (0,0) 坐标 → warning（不阻塞）', () => {
  const data: NormalizedCity = {
    ...GOOD,
    identity: { ...GOOD.identity, latitude: 0, longitude: 0 },
  };
  const r = validateCity(data);
  assert.equal(r.valid, true);
  assert.ok(r.warnings.some((w) => w.includes('(0,0)')));
});

test('validateCity · source_url 缺失 → warning（不阻塞,Phase 0）', () => {
  const data: NormalizedCity = {
    ...GOOD,
    source_url: undefined,
  };
  const r = validateCity(data);
  assert.equal(r.valid, true, 'source_url 缺失不阻塞（Phase 0 行为）');
  assert.ok(r.warnings.some((w) => w.includes('source_url')));
});

test('validateCity · source_url 空字符串 → warning（不阻塞）', () => {
  const data: NormalizedCity = {
    ...GOOD,
    source_url: '   ',
  };
  const r = validateCity(data);
  assert.equal(r.valid, true);
  assert.ok(r.warnings.some((w) => w.includes('source_url')));
});

test('validateCity · source_url 填齐 → 无 source_url warning', () => {
  const data: NormalizedCity = {
    ...GOOD,
    source_url: 'https://www.geonames.org/379252',
  };
  const r = validateCity(data);
  assert.equal(r.valid, true);
  assert.ok(!r.warnings.some((w) => w.includes('source_url')));
});

/* ---------- toCity ---------- */

test('toCity · 默认 state_level=L0_mapped, page_state=E_empty', () => {
  const c = toCity(GOOD);
  assert.equal(c.state_level, 'L0_mapped');
  assert.equal(c.page_state, 'E_empty');
  assert.equal(c.moment_stats, undefined);
  assert.equal(c.identity.city_id, 'khartoum');
});

test('toCity · 接受 visual override', () => {
  const c = toCity(GOOD, {
    visual: { visual_status: 'seed' },
    state_level: 'L3_active',
    page_state: 'B_active',
  });
  assert.equal(c.state_level, 'L3_active');
  assert.equal(c.page_state, 'B_active');
  assert.equal(c.visual?.visual_status, 'seed');
});

/* ---------- buildHeroMetadata ---------- */

test('buildHeroMetadata · 打包 Hero + source 元数据', () => {
  const visual = buildHeroMetadata(
    { url: '/images/khartoum/hero.jpg', width: 1920, height: 1079, alt: '尼罗河日落' },
    {
      source: 'user-lwy',
      creator: 'lwy',
      license: 'CC BY 4.0',
      creditRequirement: 'Photo by lwy',
    },
  );
  assert.equal(visual.visual_status, 'seed');
  assert.equal(visual.hero_source, 'user-lwy');
  assert.equal(visual.hero_creator, 'lwy');
  assert.equal(visual.hero_license, 'CC BY 4.0');
  assert.equal(visual.hero_credit_requirement, 'Photo by lwy');
  assert.equal(visual.hero_media?.alt, '尼罗河日落');
});

/* ---------- Phase 3 STUB ---------- */

test('normalizeCity · Phase 3 STUB 抛 NotImplemented', () => {
  assert.throws(
    () => normalizeCity({
      source_id: 'x',
      source_name: 'GeoNames',
      source_license: 'CC BY 4.0',
      fetched_at: '2026-08-14T00:00:00Z',
      raw_payload: {},
    }),
    /Phase 3 STUB/,
  );
});

test('findDuplicates · Phase 3 STUB 抛 NotImplemented', () => {
  assert.throws(() => findDuplicates(GOOD, []), /Phase 3 STUB/);
});

test('ingestBatch · Phase 3 STUB 抛 NotImplemented', () => {
  assert.throws(() => ingestBatch([], []), /Phase 3 STUB/);
});
