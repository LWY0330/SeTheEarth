/* ============================================================
   v1.6 · contextSource 测试
   - 覆盖 Phase 0 接口契约
   - Phase 1+ 接入真实源时,只替换 source 实现,接口契约不变
   ============================================================ */

// @ts-ignore -- node:test 类型声明缺失
import { test } from 'node:test';
// @ts-ignore -- node:assert/strict 类型声明缺失
import assert from 'node:assert/strict';
import type { City } from '@/types';
import {
  EmptyContextSource,
  makeCompositeContextSource,
  defaultContextSource,
  type ContextSource,
} from './contextSource.ts';

const kyoto: Pick<City, 'identity'> = {
  identity: {
    city_id: 'kyoto',
    canonical_name: 'Kyoto',
    country_code: 'JP',
    country_name: 'Japan',
    place_type: 'city',
    latitude: 35.0116,
    longitude: 135.7681,
    timezone: 'Asia/Tokyo',
  },
};

const tokyo: Pick<City, 'identity'> = {
  identity: {
    city_id: 'tokyo',
    canonical_name: 'Tokyo',
    country_code: 'JP',
    country_name: 'Japan',
    place_type: 'city',
    latitude: 35.6895,
    longitude: 139.6917,
    timezone: 'Asia/Tokyo',
  },
};

test('EmptyContextSource · name = "empty"', () => {
  assert.equal(EmptyContextSource.name, 'empty');
});

test('EmptyContextSource · 返回只含 city_id 的最小 context', async () => {
  const ctx = await EmptyContextSource.fetchCityContext(kyoto);
  assert.deepEqual(ctx, { city_id: 'kyoto' });
  // 所有其他字段必须 undefined
  assert.equal(ctx.population, undefined);
  assert.equal(ctx.languages, undefined);
  assert.equal(ctx.currency, undefined);
});

test('defaultContextSource = EmptyContextSource', () => {
  assert.equal(defaultContextSource, EmptyContextSource);
});

test('makeCompositeContextSource([]) · 空数组返回 city_id only', async () => {
  const src = makeCompositeContextSource([]);
  const ctx = await src.fetchCityContext(kyoto);
  assert.deepEqual(ctx, { city_id: 'kyoto' });
});

test('makeCompositeContextSource · 单源直接用其结果', async () => {
  const wikipedia: ContextSource = {
    name: 'wikipedia',
    async fetchCityContext(city) {
      return {
        city_id: city.identity.city_id,
        population: 1_460_000,
        population_year: 2020,
        languages: ['ja'],
        currency: 'JPY',
      };
    },
  };
  const src = makeCompositeContextSource([wikipedia]);
  const ctx = await src.fetchCityContext(kyoto);
  assert.equal(ctx.city_id, 'kyoto');
  assert.equal(ctx.population, 1_460_000);
  assert.deepEqual(ctx.languages, ['ja']);
});

test('makeCompositeContextSource · first-source-wins:先填的字段不被后续覆盖', async () => {
  const wikipedia: ContextSource = {
    name: 'wikipedia',
    async fetchCityContext(city) {
      return {
        city_id: city.identity.city_id,
        population: 1_460_000,
        population_source: 'Wikipedia',
      };
    },
  };
  const geonames: ContextSource = {
    name: 'geonames',
    async fetchCityContext(city) {
      return {
        city_id: city.identity.city_id,
        population: 1_500_000,  // 不同的 population
        population_source: 'GeoNames',
        geography_summary: 'Kyoto is in Kansai region of Japan.',
      };
    },
  };
  const src = makeCompositeContextSource([wikipedia, geonames]);
  const ctx = await src.fetchCityContext(kyoto);

  // first-source-wins: wikipedia 的 population 应保留
  assert.equal(ctx.population, 1_460_000);
  assert.equal(ctx.population_source, 'Wikipedia');
  // geonames 独有的字段被填
  assert.equal(ctx.geography_summary, 'Kyoto is in Kansai region of Japan.');
});

test('makeCompositeContextSource · 失败的 source 不中断链', async () => {
  const broken: ContextSource = {
    name: 'broken',
    async fetchCityContext() {
      throw new Error('network down');
    },
  };
  const wikipedia: ContextSource = {
    name: 'wikipedia',
    async fetchCityContext(city) {
      return {
        city_id: city.identity.city_id,
        languages: ['ja'],
      };
    },
  };
  const src = makeCompositeContextSource([broken, wikipedia]);
  const ctx = await src.fetchCityContext(kyoto);
  // broken 失败,但 wikipedia 仍然填了
  assert.equal(ctx.city_id, 'kyoto');
  assert.deepEqual(ctx.languages, ['ja']);
});

test('makeCompositeContextSource · 所有 source 失败 → 仅 city_id', async () => {
  const broken1: ContextSource = {
    name: 'broken1',
    async fetchCityContext() { throw new Error('1'); },
  };
  const broken2: ContextSource = {
    name: 'broken2',
    async fetchCityContext() { throw new Error('2'); },
  };
  const src = makeCompositeContextSource([broken1, broken2]);
  const ctx = await src.fetchCityContext(kyoto);
  assert.deepEqual(ctx, { city_id: 'kyoto' });
});

test('makeCompositeContextSource · 自定义 name', () => {
  const src = makeCompositeContextSource([], 'my-custom-source');
  assert.equal(src.name, 'my-custom-source');
});

test('makeCompositeContextSource · 不同城市独立 fetch', async () => {
  const wikipedia: ContextSource = {
    name: 'wikipedia',
    async fetchCityContext(city) {
      return {
        city_id: city.identity.city_id,
        population: city.identity.city_id === 'kyoto' ? 1_460_000 : 13_960_000,
      };
    },
  };
  const src = makeCompositeContextSource([wikipedia]);
  const kyotoCtx = await src.fetchCityContext(kyoto);
  const tokyoCtx = await src.fetchCityContext(tokyo);
  assert.equal(kyotoCtx.population, 1_460_000);
  assert.equal(tokyoCtx.population, 13_960_000);
});

test('mergeContext · 不修改 base 对象(纯函数)', async () => {
  // 通过 composite 间接测试:多次 fetch 不应互相影响
  const wikipedia: ContextSource = {
    name: 'wikipedia',
    async fetchCityContext(city) {
      return {
        city_id: city.identity.city_id,
        languages: ['ja'],
      };
    },
  };
  const src = makeCompositeContextSource([wikipedia]);
  const ctx1 = await src.fetchCityContext(kyoto);
  const ctx2 = await src.fetchCityContext(kyoto);
  assert.notEqual(ctx1, ctx2, '两次 fetch 返回不同对象实例');
  assert.deepEqual(ctx1, ctx2, '但内容相同');
});

test('ContextSource 接口契约 · name 必填 + fetchCityContext 必填', () => {
  // 类型层契约:任何实现必须有 name(string)和 fetchCityContext(async function)
  // 此处只验证 default 满足,Phase 1+ 接入新源时同样必须满足
  const src: ContextSource = EmptyContextSource;
  assert.equal(typeof src.name, 'string');
  assert.equal(typeof src.fetchCityContext, 'function');
  assert.equal(src.fetchCityContext.constructor.name, 'AsyncFunction');
});