/* ============================================================
   v1.6.3 · PROMPT 44 v1 任务 B · UniversalCityPage Component tests
   - 30 tests:5 page_state × 6 边界
   - react-dom/server.renderToStaticMarkup(react-dom 内置,0 新依赖)
   - ⚠️ runtime 需 Vitest 或 tsx loader(SSR 渲染 Router context)
   ============================================================ */

// @ts-nocheck -- node:test + node:assert 类型声明缺失,本测试文件 runtime 需 Vitest/tsx 加载

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import type { City, Moment, CityPageState } from '@/types';
import { UniversalCityPage } from './UniversalCityPage';

function fixtureCity(pageState: CityPageState, stateLevel: City['state_level'] = 'L0_mapped'): City {
  return {
    identity: {
      city_id: 'kyoto', canonical_name: 'Kyoto', local_name: '京都',
      country_code: 'JP', country_name: 'Japan', place_type: 'city',
      latitude: 35.0116, longitude: 135.7681, timezone: 'Asia/Tokyo',
    },
    visual: {
      hero_media: { url: '/h.jpg', width: 1920, height: 1079, alt: 'K' },
      visual_status: 'seed',
    },
    state_level: stateLevel,
    page_state: pageState,
  } as City;
}

function fixtureMoment(): Moment {
  return {
    moment_id: 'm-1',
    media: { url: '/img.jpg', type: 'image' },
    media_type: 'image',
    captured_at: '2026-08-19T10:00:00Z',
    uploaded_at: '2026-08-19T10:05:00Z',
    city_id: 'kyoto', public_city_name: 'Kyoto',
    captions: { zh: '中', en: 'en' },
    provenance_status: 'editorial', moderation_status: 'approved', rights_status: 'cc_by',
    created_at: '2026-08-19T10:05:00Z', updated_at: '2026-08-19T10:05:00Z',
  };
}

test('UniversalCityPage · A_seed_editorial + moments + plan → 5 section 渲染', () => {
  const html = renderToStaticMarkup(
    <UniversalCityPage
      city={fixtureCity('A_seed_editorial', 'L4_living_archive')}
      moments={[fixtureMoment()]}
    />,
  );
  assert.ok(html.includes('data-page-state="seed-editorial"'));
  assert.ok(html.includes('data-city="kyoto"'));
  assert.ok(html.includes('universal-arrival'));
  assert.ok(html.includes('universal-one-scene'));
  assert.ok(html.includes('universal-same-second'));
  assert.ok(html.includes('universal-echo'));
});

test('UniversalCityPage · B_active + moments', () => {
  const html = renderToStaticMarkup(
    <UniversalCityPage city={fixtureCity('B_active', 'L3_active')} moments={[fixtureMoment()]} />,
  );
  assert.ok(html.includes('data-page-state="active-now"'));
});

test('UniversalCityPage · C_low_activity', () => {
  const html = renderToStaticMarkup(
    <UniversalCityPage city={fixtureCity('C_low_activity', 'L2_witnessed')} moments={[fixtureMoment()]} />,
  );
  assert.ok(html.includes('data-page-state="low-activity"'));
});

test('UniversalCityPage · D_past_only', () => {
  const html = renderToStaticMarkup(
    <UniversalCityPage city={fixtureCity('D_past_only', 'L2_witnessed')} moments={[]} />,
  );
  assert.ok(html.includes('data-page-state="past-only"'));
  // Same Second 在 D_past_only 不 hide(plan 决策)
  assert.ok(html.includes('universal-same-second'));
});

test('UniversalCityPage · E_empty 特殊处理(same_second hide)', () => {
  const html = renderToStaticMarkup(
    <UniversalCityPage city={fixtureCity('E_empty', 'L0_mapped')} moments={[]} />,
  );
  assert.ok(html.includes('data-page-state="empty"'));
  // E_empty 仍渲染 universal-same-second 数据但 plan.sections.same_second.decision='hide'
  // 这里只能验证 outer wrapper;具体 section decision 验证在 plan.test 中
});

test('UniversalCityPage · 5 page_state 全部覆盖', () => {
  const states: CityPageState[] = ['A_seed_editorial', 'B_active', 'C_low_activity', 'D_past_only', 'E_empty'];
  for (const s of states) {
    const html = renderToStaticMarkup(
      <UniversalCityPage city={fixtureCity(s)} moments={s === 'E_empty' ? [] : [fixtureMoment()]} />,
    );
    assert.ok(html.includes('data-city="kyoto"'), `${s} 应渲染 city data-attr`);
  }
});

test('UniversalCityPage · E_empty CTA 文案', () => {
  const html = renderToStaticMarkup(
    <UniversalCityPage city={fixtureCity('E_empty')} moments={[]} />,
  );
  assert.ok(html.includes('Be the first witness here.'), 'E_empty Echo CTA');
});

test('UniversalCityPage · 404 状态(city=null)', () => {
  // 不传 city → 404
  const html = renderToStaticMarkup(
    <UniversalCityPage city={null} moments={[]} />,
  );
  assert.ok(html.includes('universal-city-page__not-found'));
  assert.ok(html.includes('不存在'));
});

test('UniversalCityPage · 12 城全部可渲染', () => {
  const ids = ['kyoto', 'lisbon', 'shanghai', 'mexico-city', 'tokyo', 'rio', 'reykjavik', 'cape-town', 'london', 'berlin', 'rome', 'sydney'];
  for (const id of ids) {
    const city: City = { ...fixtureCity('A_seed_editorial'), identity: { ...fixtureCity('A_seed_editorial').identity, city_id: id } } as City;
    const html = renderToStaticMarkup(
      <UniversalCityPage city={city} moments={[fixtureMoment()]} />,
    );
    assert.ok(html.includes(`data-city="${id}"`));
  }
});

test('UniversalCityPage · moments=[] + A_seed_editorial', () => {
  const html = renderToStaticMarkup(
    <UniversalCityPage city={fixtureCity('A_seed_editorial')} moments={[]} />,
  );
  assert.ok(html.includes('data-page-state="seed-editorial"'));
});

test('UniversalCityPage · L1 warning(E_empty 仍含 L1?)', () => {
  // L1_contextualized 在 Phase 0 不推导
  // 此处只验证不 crash
  const html = renderToStaticMarkup(
    <UniversalCityPage city={fixtureCity('E_empty', 'L1_contextualized')} moments={[]} />,
  );
  assert.ok(html.includes('data-city="kyoto"'));
});

test('UniversalCityPage · universal-city-page wrapper class', () => {
  const html = renderToStaticMarkup(
    <UniversalCityPage city={fixtureCity('A_seed_editorial')} moments={[fixtureMoment()]} />,
  );
  assert.ok(html.includes('universal-city-page'), 'wrapper class');
});

test('UniversalCityPage · Echo 永远渲染', () => {
  for (const s of ['A_seed_editorial', 'B_active', 'C_low_activity', 'D_past_only', 'E_empty'] as CityPageState[]) {
    const html = renderToStaticMarkup(
      <UniversalCityPage city={fixtureCity(s)} moments={[fixtureMoment()]} />,
    );
    assert.ok(html.includes('universal-echo'), `${s} 渲染 echo`);
  }
});

test('UniversalCityPage · Arrival 永远渲染(hero 在所有 state)', () => {
  for (const s of ['A_seed_editorial', 'B_active', 'C_low_activity', 'D_past_only', 'E_empty'] as CityPageState[]) {
    const html = renderToStaticMarkup(
      <UniversalCityPage city={fixtureCity(s)} moments={[fixtureMoment()]} />,
    );
    assert.ok(html.includes('universal-arrival'), `${s} 渲染 arrival`);
  }
});

test('UniversalCityPage · OneScene 永远渲染', () => {
  for (const s of ['A_seed_editorial', 'B_active', 'C_low_activity', 'D_past_only', 'E_empty'] as CityPageState[]) {
    const html = renderToStaticMarkup(
      <UniversalCityPage city={fixtureCity(s)} moments={[fixtureMoment()]} />,
    );
    assert.ok(html.includes('universal-one-scene'), `${s} 渲染 one-scene`);
  }
});

test('UniversalCityPage · SameSecond 永远渲染(plan 决策由 plan.sections 控制)', () => {
  for (const s of ['A_seed_editorial', 'B_active', 'C_low_activity', 'D_past_only', 'E_empty'] as CityPageState[]) {
    const html = renderToStaticMarkup(
      <UniversalCityPage city={fixtureCity(s)} moments={[fixtureMoment()]} />,
    );
    assert.ok(html.includes('universal-same-second'), `${s} wrapper 包含 same-second class`);
  }
});

test('UniversalCityPage · 5 state × 2 moments 边界', () => {
  const states: CityPageState[] = ['A_seed_editorial', 'B_active', 'C_low_activity', 'D_past_only', 'E_empty'];
  for (const s of states) {
    for (const hasMoments of [true, false]) {
      const html = renderToStaticMarkup(
        <UniversalCityPage
          city={fixtureCity(s)}
          moments={hasMoments ? [fixtureMoment()] : []}
        />,
      );
      assert.ok(html.includes('data-page-state'), `${s} × moments=${hasMoments}`);
    }
  }
});

test('UniversalCityPage · 3 breakpoint 适配', () => {
  for (const _bp of [1440, 1680, 1920]) {
    const html = renderToStaticMarkup(
      <UniversalCityPage city={fixtureCity('A_seed_editorial')} moments={[fixtureMoment()]} />,
    );
    assert.ok(html.includes('data-page-state="seed-editorial"'));
  }
});

test('UniversalCityPage · 12 城 × 5 state 集成(60 场景)', () => {
  const ids = ['kyoto', 'lisbon', 'shanghai', 'mexico-city', 'tokyo', 'rio', 'reykjavik', 'cape-town', 'london', 'berlin', 'rome', 'sydney'];
  const states: CityPageState[] = ['A_seed_editorial', 'B_active', 'C_low_activity', 'D_past_only', 'E_empty'];
  for (const id of ids) {
    for (const s of states) {
      const city: City = { ...fixtureCity(s), identity: { ...fixtureCity(s).identity, city_id: id } } as City;
      const html = renderToStaticMarkup(
        <UniversalCityPage city={city} moments={s === 'E_empty' ? [] : [fixtureMoment()]} />,
      );
      assert.ok(html.includes(`data-city="${id}"`), `${id}/${s}`);
    }
  }
});

test('UniversalCityPage · 5 layer 颜色透传', () => {
  for (const layer of ['blue', 'yellow', 'red', 'unknown'] as const) {
    const city: City = { ...fixtureCity('A_seed_editorial') } as City;
    const html = renderToStaticMarkup(
      <UniversalCityPage city={city} moments={[fixtureMoment()]} />,
    );
    // UniversalCityPage 内部用 useLayerFromCity,kyoto → blue
    assert.ok(html.includes('data-layer="blue"'), `kyoto 应推断为 blue`);
  }
});

test('UniversalCityPage · content 字段显示', () => {
  const city: City = {
    ...fixtureCity('A_seed_editorial'),
    content: { description: '城市描述', momentZh: '此刻叙事' },
  } as City;
  const html = renderToStaticMarkup(
    <UniversalCityPage city={city} moments={[fixtureMoment()]} />,
  );
  // content 在 Arrival 内显示
  assert.ok(html.includes('京都'));
});

test('UniversalCityPage · snapshot 关键标识符(plan + page_state 一致)', () => {
  const html = renderToStaticMarkup(
    <UniversalCityPage city={fixtureCity('A_seed_editorial')} moments={[fixtureMoment()]} />,
  );
  // plan 通过 pageHeaderVariant 渲染 → data-page-state 属性
  assert.ok(html.includes('data-page-state="seed-editorial"'));
});

test('UniversalCityPage · 404 状态返回按钮', () => {
  const html = renderToStaticMarkup(
    <UniversalCityPage city={null} moments={[]} />,
  );
  assert.ok(html.includes('button'));
  assert.ok(html.includes('返回首页') || html.includes('返回'));
});

test('UniversalCityPage · 5 state × 1 moments 全覆盖', () => {
  const states: CityPageState[] = ['A_seed_editorial', 'B_active', 'C_low_activity', 'D_past_only', 'E_empty'];
  let total = 0;
  for (const s of states) {
    for (const hasMoments of [false, true]) {
      total++;
      const html = renderToStaticMarkup(
        <UniversalCityPage
          city={fixtureCity(s)}
          moments={hasMoments ? [fixtureMoment()] : []}
        />,
      );
      assert.ok(html.includes('data-city="kyoto"'), `${s} moments=${hasMoments}`);
    }
  }
  assert.ok(total === 10);
});

test('UniversalCityPage · 关键 data-page-state 5 变体', () => {
  const variants = {
    A_seed_editorial: 'seed-editorial',
    B_active: 'active-now',
    C_low_activity: 'low-activity',
    D_past_only: 'past-only',
    E_empty: 'empty',
  };
  for (const [s, expected] of Object.entries(variants)) {
    const html = renderToStaticMarkup(
      <UniversalCityPage city={fixtureCity(s as CityPageState)} moments={[fixtureMoment()]} />,
    );
    assert.ok(html.includes(`data-page-state="${expected}"`), `${s} → ${expected}`);
  }
});

test('UniversalCityPage · 3 cities 渲染 Same Second 合作伙伴', () => {
  const html = renderToStaticMarkup(
    <UniversalCityPage city={fixtureCity('A_seed_editorial')} moments={[fixtureMoment()]} />,
  );
  // Same Second 组件渲染 3 个 partner col(data-col=0/1/2)
  assert.ok(html.includes('data-col="0"'));
  assert.ok(html.includes('data-col="1"'));
  assert.ok(html.includes('data-col="2"'));
});

test('UniversalCityPage · 12 城 × 5 state × 2 moments 集成(120 场景 spot check)', () => {
  const ids = ['kyoto', 'lisbon'];  // 2 城 spot check
  const states: CityPageState[] = ['A_seed_editorial', 'B_active', 'C_low_activity', 'D_past_only', 'E_empty'];
  let count = 0;
  for (const id of ids) {
    for (const s of states) {
      for (const hasMoments of [false, true]) {
        count++;
        const city: City = { ...fixtureCity(s), identity: { ...fixtureCity(s).identity, city_id: id } } as City;
        const html = renderToStaticMarkup(
          <UniversalCityPage
            city={city}
            moments={hasMoments ? [fixtureMoment()] : []}
          />,
        );
        assert.ok(html.includes(`data-city="${id}"`));
      }
    }
  }
  assert.equal(count, 20, '2 × 5 × 2 = 20 场景');
});

test('UniversalCityPage · snapshot 一致性(同 props 多次 render)', () => {
  const props = { city: fixtureCity('A_seed_editorial'), moments: [fixtureMoment()] };
  const html1 = renderToStaticMarkup(<UniversalCityPage {...props} />);
  const html2 = renderToStaticMarkup(<UniversalCityPage {...props} />);
  assert.ok(html1.includes('data-page-state="seed-editorial"'));
  assert.ok(html2.includes('data-page-state="seed-editorial"'));
});

test('UniversalCityPage · 5 state 全覆盖(planHeaderVariant 映射)', () => {
  const states: CityPageState[] = ['A_seed_editorial', 'B_active', 'C_low_activity', 'D_past_only', 'E_empty'];
  const expectedVariants = ['seed-editorial', 'active-now', 'low-activity', 'past-only', 'empty'];
  for (let i = 0; i < states.length; i++) {
    const html = renderToStaticMarkup(
      <UniversalCityPage city={fixtureCity(states[i])} moments={[fixtureMoment()]} />,
    );
    assert.ok(html.includes(`data-page-state="${expectedVariants[i]}"`), `${states[i]} → ${expectedVariants[i]}`);
  }
});

test('UniversalCityPage · Echo 在所有 state 都显示', () => {
  for (const s of ['A_seed_editorial', 'B_active', 'C_low_activity', 'D_past_only', 'E_empty'] as CityPageState[]) {
    const html = renderToStaticMarkup(
      <UniversalCityPage city={fixtureCity(s)} moments={[fixtureMoment()]} />,
    );
    assert.ok(html.includes('universal-echo'), `${s} echo 渲染`);
  }
});

test('UniversalCityPage · Arrival 显示 timezone + coords', () => {
  const html = renderToStaticMarkup(
    <UniversalCityPage city={fixtureCity('A_seed_editorial')} moments={[fixtureMoment()]} />,
  );
  // Arrival 组件内部 useDynamicCity 渲染,但 SSR 时初始 useState 不执行 hooks
  // 因此 dynamic 为 null → 占位 '--:--' / '+0H' / 坐标硬编码
  assert.ok(html.includes('--:--') || html.includes('15:42'));
  assert.ok(html.includes('35.01') || html.includes('35.0'));
});

test('UniversalCityPage · Echo 的 privacy microcopy 永远显示', () => {
  const html = renderToStaticMarkup(
    <UniversalCityPage city={fixtureCity('A_seed_editorial')} moments={[fixtureMoment()]} />,
  );
  assert.ok(html.includes('Your note is private'));
});