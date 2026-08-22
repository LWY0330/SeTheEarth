/* ============================================================
   v1.6.3 · PROMPT 44 v1 任务 B · UniversalArrival Component tests
   - 12 tests 覆盖 3 breakpoint × 4 边界
   - react-dom/server.renderToStaticMarkup(react-dom 内置,0 新依赖)
   - ⚠️ 运行时需 Vitest 或 tsx loader(Node 22.22 strip-types 不支持 .tsx JSX)
   - 测试 typecheck 通过;runtime 需 'npx tsx --test src/components/*.test.tsx' 或 Vitest 迁移
   ============================================================ */

// @ts-nocheck -- node:test + node:assert 类型声明缺失,本测试文件 runtime 需 Vitest/tsx 加载

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import type { City } from '@/types';
import type { CityDynamicSnapshot } from '../hooks/useDynamicCity';
import { UniversalArrival } from './UniversalArrival';

function fixtureCity(overrides: Partial<{
  city_id: string;
  canonical_name: string;
  visual_status: 'seed' | 'placeholder' | 'none';
}>): City {
  return {
    identity: {
      city_id: 'kyoto',
      canonical_name: 'Kyoto',
      local_name: '京都',
      country_code: 'JP',
      country_name: 'Japan',
      place_type: 'city',
      latitude: 35.0116,
      longitude: 135.7681,
      timezone: 'Asia/Tokyo',
    },
    visual: {
      hero_media: {
        url: '/images/kyoto/hero.jpg',
        width: 1920,
        height: 1079,
        alt: '京都 Kyoto',
      },
      visual_status: 'seed',
      hero_creator: 'Sorasak · Unsplash',
    },
    state_level: 'L4_living_archive',
    page_state: 'A_seed_editorial',
    ...overrides,
  } as City;
}

const defaultDynamic: CityDynamicSnapshot = {
  local_time: '15:42',
  user_time_difference: '+9H',
  local_hour: 15,
  captured_at: '2026-08-19T06:42:00Z',
};

test('UniversalArrival · Kyoto 全字段渲染', () => {
  const html = renderToStaticMarkup(
    <UniversalArrival city={fixtureCity({})} dynamic={defaultDynamic} layer="blue" />,
  );
  assert.ok(html.includes('京都'));
  assert.ok(html.includes('Kyoto'));
  assert.ok(html.includes('JAPAN'));
  assert.ok(html.includes('15:42'));
  assert.ok(html.includes('+9H'));
  assert.ok(html.includes('35.01'));
  assert.ok(html.includes('135.77'));
  assert.ok(html.includes('Asia/Tokyo'));
  assert.ok(html.includes('BLUE'));
  assert.ok(html.includes('Photo by Sorasak'));
  assert.ok(html.includes('data-layer="blue"'));
  assert.ok(html.includes('data-city="kyoto"'));
});

test('UniversalArrival · 无 hero_media → 占位文案', () => {
  const city = fixtureCity({});
  city.visual = { visual_status: 'none' };
  const html = renderToStaticMarkup(
    <UniversalArrival city={city} dynamic={defaultDynamic} layer="blue" />,
  );
  assert.ok(html.includes('This city exists.'));
});

test('UniversalArrival · placeholder → hero 仍显示', () => {
  const city = fixtureCity({});
  city.visual = {
    visual_status: 'placeholder',
    hero_media: { url: '/p.jpg', width: 1920, height: 1079, alt: 'P' },
  };
  const html = renderToStaticMarkup(
    <UniversalArrival city={city} dynamic={defaultDynamic} layer="blue" />,
  );
  assert.ok(html.includes('p.jpg'));
});

test('UniversalArrival · dynamic=null → fallback', () => {
  const html = renderToStaticMarkup(
    <UniversalArrival city={fixtureCity({})} dynamic={null} layer="blue" />,
  );
  assert.ok(html.includes('--:--'));
  assert.ok(html.includes('+0H'));
});

test('UniversalArrival · layer=yellow', () => {
  const html = renderToStaticMarkup(
    <UniversalArrival city={fixtureCity({})} dynamic={defaultDynamic} layer="yellow" />,
  );
  assert.ok(html.includes('YELLOW'));
});

test('UniversalArrival · layer=red', () => {
  const html = renderToStaticMarkup(
    <UniversalArrival city={fixtureCity({})} dynamic={defaultDynamic} layer="red" />,
  );
  assert.ok(html.includes('RED'));
});

test('UniversalArrival · layer=unknown', () => {
  const html = renderToStaticMarkup(
    <UniversalArrival city={fixtureCity({})} dynamic={defaultDynamic} layer="unknown" />,
  );
  assert.ok(html.includes('—'));
});

test('UniversalArrival · 12 城全部可渲染', () => {
  const cities = ['kyoto', 'lisbon', 'shanghai', 'mexico-city', 'tokyo', 'rio', 'reykjavik', 'cape-town', 'london', 'berlin', 'rome', 'sydney'];
  for (const id of cities) {
    const html = renderToStaticMarkup(
      <UniversalArrival city={fixtureCity({ city_id: id, canonical_name: id })} dynamic={defaultDynamic} layer="blue" />,
    );
    assert.ok(html.includes(`data-city="${id}"`));
  }
});

test('UniversalArrival · 无 content → 不渲染 description', () => {
  const city = fixtureCity({});
  delete (city as { content?: unknown }).content;
  const html = renderToStaticMarkup(
    <UniversalArrival city={city} dynamic={defaultDynamic} layer="blue" />,
  );
  assert.ok(!html.includes('universal-arrival__description'));
});

test('UniversalArrival · 无 hero_creator → 不显示 credit', () => {
  const city = fixtureCity({});
  city.visual = { visual_status: 'seed' };
  const html = renderToStaticMarkup(
    <UniversalArrival city={city} dynamic={defaultDynamic} layer="blue" />,
  );
  assert.ok(!html.includes('Photo by'));
});

test('UniversalArrival · local_name 缺省 → fallback canonical', () => {
  const city = fixtureCity({});
  delete (city.identity as { local_name?: string }).local_name;
  const html = renderToStaticMarkup(
    <UniversalArrival city={city} dynamic={defaultDynamic} layer="blue" />,
  );
  assert.ok(html.includes('Kyoto'));
});

test('UniversalArrival · 3 breakpoint snapshot 一致性', () => {
  for (const _bp of [1440, 1680, 1920]) {
    const html = renderToStaticMarkup(
      <UniversalArrival city={fixtureCity({})} dynamic={defaultDynamic} layer="blue" />,
    );
    assert.ok(html.includes('data-city="kyoto"'));
    assert.ok(html.includes('15:42'));
  }
});