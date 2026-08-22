/* ============================================================
   v1.6.3 · PROMPT 44 v1 任务 B · UniversalSameSecond Component tests
   - 12 tests 覆盖 3 城市切换 + 排除当前 + 平权
   - react-dom/server.renderToStaticMarkup(react-dom 内置,0 新依赖)
   - ⚠️ runtime 需 Vitest 或 tsx loader
   ============================================================ */

// @ts-nocheck -- node:test + node:assert 类型声明缺失,本测试文件 runtime 需 Vitest/tsx 加载

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import type { City, Moment } from '@/types';
import type { CityLayer } from '../hooks/useLayerFromCity';
import { UniversalSameSecond } from './UniversalSameSecond';

function fixtureCity(id: string, name: string, timezone: string): City {
  return {
    identity: {
      city_id: id, canonical_name: name, local_name: name,
      country_code: 'XX', country_name: 'X', place_type: 'city',
      latitude: 0, longitude: 0, timezone,
    },
    state_level: 'L0_mapped', page_state: 'E_empty',
  } as City;
}

function fixturePartners(n: number) {
  return Array.from({ length: n }, (_, i) => ({
    city: fixtureCity(`p-${i}`, `P${i}`, 'UTC'),
    moments: [] as Moment[],
    layer: 'unknown' as CityLayer,
  }));
}

test('UniversalSameSecond · 3 城市平权渲染', () => {
  const html = renderToStaticMarkup(
    <UniversalSameSecond city={fixtureCity('a', 'A', 'UTC')} otherCities={fixturePartners(3)} />,
  );
  assert.ok(html.includes('data-partners="3"'));
  assert.ok(html.includes('Same second, elsewhere'), 'title');
  assert.ok(html.includes('P0'));
  assert.ok(html.includes('P1'));
  assert.ok(html.includes('P2'));
});

test('UniversalSameSecond · <3 partners 仍渲染', () => {
  const html = renderToStaticMarkup(
    <UniversalSameSecond city={fixtureCity('a', 'A', 'UTC')} otherCities={fixturePartners(2)} />,
  );
  assert.ok(html.includes('data-partners="2"'));
  assert.ok(html.includes('P0'));
  assert.ok(html.includes('P1'));
  assert.ok(!html.includes('P2'));
});

test('UniversalSameSecond · 0 partners → 仅 header', () => {
  const html = renderToStaticMarkup(
    <UniversalSameSecond city={fixtureCity('a', 'A', 'UTC')} otherCities={[]} />,
  );
  assert.ok(html.includes('data-partners="0"'));
  assert.ok(html.includes('Same second, elsewhere'));
  assert.ok(!html.includes('P0'));
});

test('UniversalSameSecond · 排除当前城市(current city_id 不在 partners)', () => {
  // 设计契约:Same Second 排除当前城市(per spec §3.2.3)
  const html = renderToStaticMarkup(
    <UniversalSameSecond city={fixtureCity('kyoto', 'Kyoto', 'Asia/Tokyo')} otherCities={fixturePartners(3)} />,
  );
  // data-partners=3(partners 不包含 kyoto)
  assert.ok(html.includes('data-partners="3"'));
  assert.ok(!html.includes('data-partner="kyoto"'), '当前 city 不应出现在 partners');
});

test('UniversalSameSecond · 3 layer 适配(blue/yellow/red)', () => {
  const partners = [
    { city: fixtureCity('p-0', 'P0', 'UTC'), moments: [], layer: 'blue' as CityLayer },
    { city: fixtureCity('p-1', 'P1', 'UTC'), moments: [], layer: 'yellow' as CityLayer },
    { city: fixtureCity('p-2', 'P2', 'UTC'), moments: [], layer: 'red' as CityLayer },
  ];
  const html = renderToStaticMarkup(
    <UniversalSameSecond city={fixtureCity('a', 'A', 'UTC')} otherCities={partners} />,
  );
  assert.ok(html.includes('data-layer="blue"'));
  assert.ok(html.includes('data-layer="yellow"'));
  assert.ok(html.includes('data-layer="red"'));
});

test('UniversalSameSecond · 平权 3 栏(无视觉权重差异)', () => {
  const html = renderToStaticMarkup(
    <UniversalSameSecond city={fixtureCity('a', 'A', 'UTC')} otherCities={fixturePartners(3)} />,
  );
  // 3 个 article 都有 data-col 属性,值为 0/1/2(平权)
  assert.ok(html.includes('data-col="0"'));
  assert.ok(html.includes('data-col="1"'));
  assert.ok(html.includes('data-col="2"'));
});

test('UniversalSameSecond · 时间排版 mono 等宽', () => {
  const html = renderToStaticMarkup(
    <UniversalSameSecond city={fixtureCity('a', 'A', 'UTC')} otherCities={fixturePartners(3)} />,
  );
  assert.ok(html.includes('mono'), '时间用 mono 字体');
});

test('UniversalSameSecond · timezone 字段显示', () => {
  const partners = [
    { city: fixtureCity('p-0', 'Tokyo', 'Asia/Tokyo'), moments: [], layer: 'blue' as CityLayer },
    { city: fixtureCity('p-1', 'NY', 'America/New_York'), moments: [], layer: 'yellow' as CityLayer },
  ];
  const html = renderToStaticMarkup(
    <UniversalSameSecond city={fixtureCity('a', 'A', 'UTC')} otherCities={partners} />,
  );
  assert.ok(html.includes('Asia/Tokyo'));
  assert.ok(html.includes('America/New_York'));
});

test('UniversalSameSecond · 非法 timezone → "--:--" fallback', () => {
  const partners = [
    { city: fixtureCity('p-0', 'X', 'Not/A/Real/Zone'), moments: [], layer: 'blue' as CityLayer },
  ];
  const html = renderToStaticMarkup(
    <UniversalSameSecond city={fixtureCity('a', 'A', 'UTC')} otherCities={partners} />,
  );
  assert.ok(html.includes('--:--'), '非法 timezone fallback');
});

test('UniversalSameSecond · 3 breakpoint 适配', () => {
  for (const _bp of [1440, 1680, 1920]) {
    const html = renderToStaticMarkup(
      <UniversalSameSecond city={fixtureCity('a', 'A', 'UTC')} otherCities={fixturePartners(3)} />,
    );
    assert.ok(html.includes('data-partners="3"'));
  }
});

test('UniversalSameSecond · current city data-city 属性一致', () => {
  const html = renderToStaticMarkup(
    <UniversalSameSecond city={fixtureCity('kyoto', 'Kyoto', 'Asia/Tokyo')} otherCities={fixturePartners(3)} />,
  );
  assert.ok(html.includes('data-city="kyoto"'));
});

test('UniversalSameSecond · snapshot 一致性(同输入两次 render)', () => {
  const props = { city: fixtureCity('a', 'A', 'UTC'), otherCities: fixturePartners(3) };
  const html1 = renderToStaticMarkup(<UniversalSameSecond {...props} />);
  const html2 = renderToStaticMarkup(<UniversalSameSecond {...props} />);
  assert.ok(html1.includes('data-partners="3"'));
  assert.ok(html2.includes('data-partners="3"'));
});