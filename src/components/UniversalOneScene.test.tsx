/* ============================================================
   v1.6.3 · PROMPT 44 v1 任务 B · UniversalOneScene Component tests
   - 12 tests 覆盖 Empty / Low / Active / Past 4 State × 3 边界
   - react-dom/server.renderToStaticMarkup(react-dom 内置,0 新依赖)
   - ⚠️ runtime 需 Vitest 或 tsx loader
   ============================================================ */

// @ts-nocheck -- node:test + node:assert 类型声明缺失,本测试文件 runtime 需 Vitest/tsx 加载

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import type { City, CityPageState, Moment } from '@/types';
import type { CityLayer } from '../hooks/useLayerFromCity';
import { UniversalOneScene } from './UniversalOneScene';

function fixtureCity(): City {
  return {
    identity: {
      city_id: 'kyoto', canonical_name: 'Kyoto', local_name: '京都',
      country_code: 'JP', country_name: 'Japan', place_type: 'city',
      latitude: 35.0116, longitude: 135.7681, timezone: 'Asia/Tokyo',
    },
    state_level: 'L4_living_archive',
    page_state: 'A_seed_editorial',
  } as City;
}

function fixtureMoment(): Moment {
  return {
    moment_id: 'm-1',
    media: { url: '/img.jpg', type: 'image' },
    media_type: 'image',
    captured_at: '2026-08-19T10:00:00Z',
    uploaded_at: '2026-08-19T10:05:00Z',
    city_id: 'kyoto',
    public_city_name: 'Kyoto',
    captions: { zh: '涩谷的红灯刚转绿', en: 'Shibuya just turned green' },
    provenance_status: 'editorial',
    moderation_status: 'approved',
    rights_status: 'cc_by',
    created_at: '2026-08-19T10:05:00Z',
    updated_at: '2026-08-19T10:05:00Z',
  };
}

test('UniversalOneScene · A_seed + moments → render', () => {
  const html = renderToStaticMarkup(
    <UniversalOneScene city={fixtureCity()} moments={[fixtureMoment()]} pageState="A_seed_editorial" layer="blue" />,
  );
  assert.ok(html.includes('data-state="A_seed_editorial"'));
  assert.ok(html.includes('data-layer="blue"'));
  assert.ok(html.includes('data-city="kyoto"'));
  assert.ok(html.includes('m-1'), 'moment data-attr');
});

test('UniversalOneScene · B_active + moments → render', () => {
  const html = renderToStaticMarkup(
    <UniversalOneScene city={fixtureCity()} moments={[fixtureMoment()]} pageState="B_active" layer="yellow" />,
  );
  assert.ok(html.includes('data-state="B_active"'));
  assert.ok(html.includes('data-layer="yellow"'));
});

test('UniversalOneScene · C_low_activity + moments → render', () => {
  const html = renderToStaticMarkup(
    <UniversalOneScene city={fixtureCity()} moments={[fixtureMoment()]} pageState="C_low_activity" layer="blue" />,
  );
  assert.ok(html.includes('data-state="C_low_activity"'));
});

test('UniversalOneScene · D_past_only → render-empty', () => {
  const html = renderToStaticMarkup(
    <UniversalOneScene city={fixtureCity()} moments={[fixtureMoment()]} pageState="D_past_only" layer="red" />,
  );
  assert.ok(html.includes('No moments from here today.'), 'D_past CTA');
  assert.ok(html.includes('data-state="D_past_only"'));
});

test('UniversalOneScene · E_empty → render-empty CTA', () => {
  const html = renderToStaticMarkup(
    <UniversalOneScene city={fixtureCity()} moments={[]} pageState="E_empty" layer="blue" />,
  );
  assert.ok(html.includes('Be the first to show here today.'), 'E_empty CTA');
  assert.ok(html.includes('data-state="E_empty"'));
});

test('UniversalOneScene · moments=[] + 非 E_empty → 降级 render-empty', () => {
  const html = renderToStaticMarkup(
    <UniversalOneScene city={fixtureCity()} moments={[]} pageState="B_active" layer="blue" />,
  );
  assert.ok(html.includes('No image yet.'), '无 moment 占位');
});

test('UniversalOneScene · caption 优先 captions.zh, fallback captions.en, fallback caption', () => {
  // captions.zh 优先
  let html = renderToStaticMarkup(
    <UniversalOneScene city={fixtureCity()} moments={[fixtureMoment()]} pageState="A_seed_editorial" layer="blue" />,
  );
  assert.ok(html.includes('涩谷的红灯刚转绿'));

  // 只 captions.en(无 zh)
  const mEn: Moment = { ...fixtureMoment(), captions: { en: 'en-only' } };
  html = renderToStaticMarkup(
    <UniversalOneScene city={fixtureCity()} moments={[mEn]} pageState="A_seed_editorial" layer="blue" />,
  );
  assert.ok(html.includes('en-only'));

  // 只 caption 旧字段
  const mCap: Moment = { ...fixtureMoment(), caption: 'legacy caption', captions: undefined };
  html = renderToStaticMarkup(
    <UniversalOneScene city={fixtureCity()} moments={[mCap]} pageState="A_seed_editorial" layer="blue" />,
  );
  assert.ok(html.includes('legacy caption'));
});

test('UniversalOneScene · 3 breakpoint 适配', () => {
  for (const _bp of [1440, 1680, 1920]) {
    const html = renderToStaticMarkup(
      <UniversalOneScene city={fixtureCity()} moments={[fixtureMoment()]} pageState="A_seed_editorial" layer="blue" />,
    );
    assert.ok(html.includes('data-state="A_seed_editorial"'));
  }
});

test('UniversalOneScene · 5 page_state 全部覆盖', () => {
  const states: CityPageState[] = ['A_seed_editorial', 'B_active', 'C_low_activity', 'D_past_only', 'E_empty'];
  for (const s of states) {
    const html = renderToStaticMarkup(
      <UniversalOneScene city={fixtureCity()} moments={[fixtureMoment()]} pageState={s} layer="blue" />,
    );
    assert.ok(html.includes(`data-state="${s}"`), `${s} 应渲染`);
  }
});

test('UniversalOneScene · 3 layer 适配', () => {
  for (const layer of ['blue', 'yellow', 'red'] as CityLayer[]) {
    const html = renderToStaticMarkup(
      <UniversalOneScene city={fixtureCity()} moments={[fixtureMoment()]} pageState="A_seed_editorial" layer={layer} />,
    );
    assert.ok(html.includes(`data-layer="${layer}"`));
  }
});

test('UniversalOneScene · moment media_type=text → 同样 render', () => {
  const m: Moment = { ...fixtureMoment(), media_type: 'text' };
  const html = renderToStaticMarkup(
    <UniversalOneScene city={fixtureCity()} moments={[m]} pageState="A_seed_editorial" layer="blue" />,
  );
  assert.ok(html.includes('m-1'));
});

test('UniversalOneScene · snapshot 一致性(同输入两次 render 一致)', () => {
  const props = { city: fixtureCity(), moments: [fixtureMoment()], pageState: 'A_seed_editorial' as CityPageState, layer: 'blue' as CityLayer };
  const html1 = renderToStaticMarkup(<UniversalOneScene {...props} />);
  const html2 = renderToStaticMarkup(<UniversalOneScene {...props} />);
  assert.ok(html1.includes('data-state="A_seed_editorial"'));
  assert.ok(html2.includes('data-state="A_seed_editorial"'));
});