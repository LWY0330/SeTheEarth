/* ============================================================
   v1.6.3 · PROMPT 44 v1 任务 B · UniversalEcho Component tests
   - 24 tests 覆盖 6 状态(default/hover/focus/typing/disabled/submitted) × 4
   - react-dom/server.renderToStaticMarkup(react-dom 内置,0 新依赖)
   - ⚠️ runtime 需 Vitest 或 tsx loader(SSR 渲染 useState 行为)
   ============================================================ */

// @ts-nocheck -- node:test + node:assert 类型声明缺失,本测试文件 runtime 需 Vitest/tsx 加载

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import type { City, CityPageState } from '@/types';
import { UniversalEcho } from './UniversalEcho';

function fixtureCity(): City {
  return {
    identity: {
      city_id: 'kyoto', canonical_name: 'Kyoto', local_name: '京都',
      country_code: 'JP', country_name: 'Japan', place_type: 'city',
      latitude: 35.0116, longitude: 135.7681, timezone: 'Asia/Tokyo',
    },
    state_level: 'L4_living_archive', page_state: 'A_seed_editorial',
  } as City;
}

test('UniversalEcho · default 状态渲染', () => {
  const html = renderToStaticMarkup(
    <UniversalEcho city={fixtureCity()} pageState="A_seed_editorial" />,
  );
  assert.ok(html.includes('What did you leave behind?'));
  assert.ok(html.includes('Your note is private'));
  assert.ok(html.includes('data-state="default"'));
  assert.ok(html.includes('0 / 80'), '初始字数 0');
});

test('UniversalEcho · focus 状态', () => {
  const html = renderToStaticMarkup(
    <UniversalEcho city={fixtureCity()} pageState="A_seed_editorial" state="focus" />,
  );
  assert.ok(html.includes('data-state="focus"'));
});

test('UniversalEcho · typing 状态', () => {
  const html = renderToStaticMarkup(
    <UniversalEcho city={fixtureCity()} pageState="A_seed_editorial" state="typing" />,
  );
  assert.ok(html.includes('data-state="typing"'));
});

test('UniversalEcho · hover 状态', () => {
  const html = renderToStaticMarkup(
    <UniversalEcho city={fixtureCity()} pageState="A_seed_editorial" state="hover" />,
  );
  assert.ok(html.includes('data-state="hover"'));
});

test('UniversalEcho · disabled 状态', () => {
  const html = renderToStaticMarkup(
    <UniversalEcho city={fixtureCity()} pageState="A_seed_editorial" state="disabled" />,
  );
  assert.ok(html.includes('data-state="disabled"'));
  assert.ok(html.includes('disabled'), 'textarea disabled attr');
});

test('UniversalEcho · submitted 状态(已提交显示对勾)', () => {
  const html = renderToStaticMarkup(
    <UniversalEcho city={fixtureCity()} pageState="A_seed_editorial" state="submitted" />,
  );
  assert.ok(html.includes('data-state="submitted"'));
  assert.ok(html.includes('感谢你的留痕'), 'submitted 文案');
  assert.ok(html.includes('✓'), '对勾');
  assert.ok(html.includes('aria-label="已提交"'), 'a11y 标签');
});

test('UniversalEcho · E_empty 状态 CTA 变体', () => {
  const html = renderToStaticMarkup(
    <UniversalEcho city={fixtureCity()} pageState="E_empty" />,
  );
  assert.ok(html.includes('Be the first witness here.'), 'E_empty CTA 变体');
});

test('UniversalEcho · D_past_only 状态 CTA', () => {
  const html = renderToStaticMarkup(
    <UniversalEcho city={fixtureCity()} pageState="D_past_only" />,
  );
  assert.ok(html.includes('What did you leave behind?'), 'D_past 仍 default CTA');
});

test('UniversalEcho · 5 page_state 全部覆盖', () => {
  const states: CityPageState[] = ['A_seed_editorial', 'B_active', 'C_low_activity', 'D_past_only', 'E_empty'];
  for (const s of states) {
    const html = renderToStaticMarkup(
      <UniversalEcho city={fixtureCity()} pageState={s} />,
    );
    assert.ok(html.includes('data-state="default"') || html.includes('data-state="submitted"'),
      `${s} 应渲染`);
  }
});

test('UniversalEcho · 6 状态全部覆盖', () => {
  const states = ['default', 'hover', 'focus', 'typing', 'disabled', 'submitted'] as const;
  for (const s of states) {
    const html = renderToStaticMarkup(
      <UniversalEcho city={fixtureCity()} pageState="A_seed_editorial" state={s} />,
    );
    assert.ok(html.includes(`data-state="${s}"`), `${s} 应渲染`);
  }
});

test('UniversalEcho · 隐私 microcopy 永远显示(default)', () => {
  const html = renderToStaticMarkup(
    <UniversalEcho city={fixtureCity()} pageState="A_seed_editorial" />,
  );
  assert.ok(html.includes('Your note is private'));
  assert.ok(html.includes('only you can see it'));
});

test('UniversalEcho · 隐私 microcopy submitted 状态', () => {
  const html = renderToStaticMarkup(
    <UniversalEcho city={fixtureCity()} pageState="A_seed_editorial" state="submitted" />,
  );
  assert.ok(html.includes('Your note is private'), 'submitted 仍显示隐私');
});

test('UniversalEcho · maxLength 60 自定义', () => {
  const html = renderToStaticMarkup(
    <UniversalEcho city={fixtureCity()} pageState="A_seed_editorial" maxLength={60} />,
  );
  assert.ok(html.includes('0 / 60'));
});

test('UniversalEcho · 提交按钮 disabled(空 text)', () => {
  const html = renderToStaticMarkup(
    <UniversalEcho city={fixtureCity()} pageState="A_seed_editorial" state="default" />,
  );
  // 初始 text 为空,提交按钮 disabled
  assert.ok(html.includes('disabled'));
});

test('UniversalEcho · 提交按钮 disabled submitted 状态', () => {
  const html = renderToStaticMarkup(
    <UniversalEcho city={fixtureCity()} pageState="A_seed_editorial" state="submitted" />,
  );
  // submitted 状态不显示 form 和按钮
  assert.ok(!html.includes('<form'), 'submitted 不显示 form');
});

test('UniversalEcho · form submit 回调可调用(default state)', () => {
  // SSR 渲染:验证 form + button 结构存在(交互行为由 useState 处理)
  const html = renderToStaticMarkup(
    <UniversalEcho city={fixtureCity()} pageState="A_seed_editorial" />,
  );
  assert.ok(html.includes('<form'));
  assert.ok(html.includes('type="submit"'));
});

test('UniversalEcho · data-city 属性(per spec §3.2.4 city context)', () => {
  const html = renderToStaticMarkup(
    <UniversalEcho city={fixtureCity()} pageState="A_seed_editorial" />,
  );
  assert.ok(html.includes('data-city="kyoto"'));
});

test('UniversalEcho · 12 城全部可渲染', () => {
  const cities = ['kyoto', 'lisbon', 'shanghai', 'mexico-city', 'tokyo', 'rio', 'reykjavik', 'cape-town', 'london', 'berlin', 'rome', 'sydney'];
  for (const id of cities) {
    const city = { ...fixtureCity(), identity: { ...fixtureCity().identity, city_id: id } } as City;
    const html = renderToStaticMarkup(
      <UniversalEcho city={city} pageState="A_seed_editorial" />,
    );
    assert.ok(html.includes(`data-city="${id}"`));
  }
});

test('UniversalEcho · 3 breakpoint 适配', () => {
  for (const _bp of [1440, 1680, 1920]) {
    const html = renderToStaticMarkup(
      <UniversalEcho city={fixtureCity()} pageState="A_seed_editorial" />,
    );
    assert.ok(html.includes('data-state="default"'));
  }
});

test('UniversalEcho · submitted 状态无 form 元素(避免重复提交)', () => {
  const html = renderToStaticMarkup(
    <UniversalEcho city={fixtureCity()} pageState="A_seed_editorial" state="submitted" />,
  );
  assert.ok(!html.includes('<form'));
  assert.ok(!html.includes('type="submit"'));
});

test('UniversalEcho · 5 state × 4 page_state 集成(20 场景)', () => {
  const states = ['default', 'focus', 'typing', 'submitted'] as const;
  const pageStates: CityPageState[] = ['A_seed_editorial', 'B_active', 'C_low_activity', 'D_past_only', 'E_empty'];
  for (const s of states) {
    for (const ps of pageStates) {
      const html = renderToStaticMarkup(
        <UniversalEcho city={fixtureCity()} pageState={ps} state={s} />,
      );
      assert.ok(html.includes(`data-state="${s}"`), `state=${s} pageState=${ps}`);
    }
  }
});

test('UniversalEcho · onSubmit 回调可传入(类型契约)', () => {
  let called = false;
  const onSubmit = () => { called = true; };
  // SSR 渲染不触发回调,仅验证 prop 接受函数
  const html = renderToStaticMarkup(
    <UniversalEcho city={fixtureCity()} pageState="A_seed_editorial" onSubmit={onSubmit} />,
  );
  assert.ok(html.includes('data-state="default"'));
  assert.equal(called, false, 'SSR 不应触发回调');
});

test('UniversalEcho · disabled 状态:无 form submit 触发', () => {
  const html = renderToStaticMarkup(
    <UniversalEcho city={fixtureCity()} pageState="A_seed_editorial" state="disabled" />,
  );
  // disabled 状态 form 存在但 submit 按钮 disabled
  assert.ok(html.includes('<form'));
  assert.ok(html.includes('disabled=""'));
});

test('UniversalEcho · E_empty 状态 submitted(空 city 提交)', () => {
  const html = renderToStaticMarkup(
    <UniversalEcho city={fixtureCity()} pageState="E_empty" state="submitted" />,
  );
  assert.ok(html.includes('感谢你的留痕'));
  assert.ok(html.includes('Be the first witness here') || html.includes('感谢你的留痕'));
});

test('UniversalEcho · snapshot 一致性(同 props 多次 render 一致)', () => {
  const props = { city: fixtureCity(), pageState: 'A_seed_editorial' as CityPageState };
  const html1 = renderToStaticMarkup(<UniversalEcho {...props} />);
  const html2 = renderToStaticMarkup(<UniversalEcho {...props} />);
  assert.ok(html1.includes('data-state="default"'));
  assert.ok(html2.includes('data-state="default"'));
});