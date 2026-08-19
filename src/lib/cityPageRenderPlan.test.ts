/* ============================================================
   v1.6 · cityPageRenderPlan 测试
   - 覆盖 5 种 page_state(A/B/C/D/E)+ L1 warning
   - 覆盖 hero_media / visual_status 的 hero section 分支
   ============================================================ */

// @ts-ignore -- node:test 类型声明缺失
import { test } from 'node:test';
// @ts-ignore -- node:assert/strict 类型声明缺失
import assert from 'node:assert/strict';
import type { City, CityPageState } from '@/types';
import {
  pageStateToHeaderVariant,
  planCityPageRender,
  type CityPageHeaderVariant,
} from './cityPageRenderPlan.ts';

const baseCity: City = {
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
    hero_media: { url: '/images/kyoto/hero.jpg', width: 1920, height: 1079, alt: '京都日落' },
    visual_status: 'seed',
  },
  state_level: 'L4_living_archive',
  page_state: 'A_seed_editorial',
};

const cityWithState = (page_state: CityPageState, state_level: City['state_level']): City => ({
  ...baseCity,
  page_state,
  state_level,
});

/* ---------- pageStateToHeaderVariant ---------- */

test('pageStateToHeaderVariant · A → seed-editorial', () => {
  assert.equal(pageStateToHeaderVariant('A_seed_editorial'), 'seed-editorial');
});

test('pageStateToHeaderVariant · B → active-now', () => {
  assert.equal(pageStateToHeaderVariant('B_active'), 'active-now');
});

test('pageStateToHeaderVariant · C → low-activity', () => {
  assert.equal(pageStateToHeaderVariant('C_low_activity'), 'low-activity');
});

test('pageStateToHeaderVariant · D → past-only', () => {
  assert.equal(pageStateToHeaderVariant('D_past_only'), 'past-only');
});

test('pageStateToHeaderVariant · E → empty', () => {
  assert.equal(pageStateToHeaderVariant('E_empty'), 'empty');
});

/* ---------- planCityPageRender · A 状态 ---------- */

test('planCityPageRender · A_seed_editorial + hero_media → all sections render, header=seed-editorial', () => {
  const plan = planCityPageRender(baseCity);
  assert.equal(plan.city_id, 'kyoto');
  assert.equal(plan.page_state, 'A_seed_editorial');
  assert.equal(plan.pageHeaderVariant, 'seed-editorial');
  assert.equal(plan.sections.hero.decision, 'render');
  assert.equal(plan.sections.one_scene.decision, 'render');
  assert.equal(plan.sections.same_second.decision, 'render');
  assert.equal(plan.sections.echo.decision, 'render');
  assert.equal(plan.warnings.length, 0);
});

/* ---------- planCityPageRender · B 状态 ---------- */

test('planCityPageRender · B_active → header=active-now, all sections render', () => {
  const plan = planCityPageRender(cityWithState('B_active', 'L3_active'));
  assert.equal(plan.pageHeaderVariant, 'active-now');
  assert.equal(plan.sections.hero.decision, 'render');
  assert.equal(plan.sections.one_scene.decision, 'render');
  assert.equal(plan.sections.same_second.decision, 'render');
  assert.equal(plan.sections.echo.decision, 'render');
});

/* ---------- planCityPageRender · C 状态 ---------- */

test('planCityPageRender · C_low_activity → header=low-activity, all sections render', () => {
  const plan = planCityPageRender(cityWithState('C_low_activity', 'L2_witnessed'));
  assert.equal(plan.pageHeaderVariant, 'low-activity');
  assert.equal(plan.sections.hero.decision, 'render');
  assert.equal(plan.sections.one_scene.decision, 'render');
  assert.equal(plan.sections.same_second.decision, 'render');
});

/* ---------- planCityPageRender · D 状态 ---------- */

test('planCityPageRender · D_past_only → header=past-only, one_scene render-empty', () => {
  const plan = planCityPageRender(cityWithState('D_past_only', 'L2_witnessed'));
  assert.equal(plan.pageHeaderVariant, 'past-only');
  assert.equal(plan.sections.hero.decision, 'render');
  assert.equal(plan.sections.one_scene.decision, 'render-empty');
  assert.equal(plan.sections.same_second.decision, 'render');
  assert.equal(plan.sections.echo.decision, 'render');
});

/* ---------- planCityPageRender · E 状态 ---------- */

test('planCityPageRender · E_empty → header=empty, one_scene render-empty, same_second hide', () => {
  const plan = planCityPageRender(cityWithState('E_empty', 'L0_mapped'));
  assert.equal(plan.pageHeaderVariant, 'empty');
  assert.equal(plan.sections.hero.decision, 'render');          // hero 是 hero_media 已设
  assert.equal(plan.sections.one_scene.decision, 'render-empty');
  assert.equal(plan.sections.same_second.decision, 'hide');
  assert.equal(plan.sections.echo.decision, 'render');
});

/* ---------- planCityPageRender · E 无 hero_media → hero 也 render-empty ---------- */

test('planCityPageRender · E_empty + 无 hero_media → hero render-empty', () => {
  const city: City = {
    ...baseCity,
    visual: { visual_status: 'none' },
    page_state: 'E_empty',
    state_level: 'L0_mapped',
  };
  const plan = planCityPageRender(city);
  assert.equal(plan.sections.hero.decision, 'render-empty');
});

/* ---------- planCityPageRender · placeholder ---------- */

test('planCityPageRender · visual_status=placeholder → hero render-empty', () => {
  const city: City = {
    ...baseCity,
    visual: { visual_status: 'placeholder' },
    page_state: 'B_active',
    state_level: 'L3_active',
  };
  const plan = planCityPageRender(city);
  assert.equal(plan.sections.hero.decision, 'render-empty');
});

/* ---------- planCityPageRender · L1 warning ---------- */

test('planCityPageRender · state_level=L1 → warnings 含 L1 说明', () => {
  const city: City = {
    ...baseCity,
    state_level: 'L1_contextualized',
    page_state: 'B_active',
  };
  const plan = planCityPageRender(city);
  assert.ok(plan.warnings.some((w) => w.includes('L1_contextualized')));
});

test('planCityPageRender · state_level=L0 → 无 L1 warning', () => {
  const plan = planCityPageRender(cityWithState('E_empty', 'L0_mapped'));
  assert.equal(plan.warnings.length, 0);
});

/* ---------- plan 不可变性 ---------- */

test('planCityPageRender · 返回的 warnings 是 frozen', () => {
  const city: City = {
    ...baseCity,
    state_level: 'L1_contextualized',
  };
  const plan = planCityPageRender(city);
  assert.equal(Object.isFrozen(plan.warnings), true);
});

test('planCityPageRender · sections 是 readonly', () => {
  const plan = planCityPageRender(baseCity);
  // TypeScript 阻止运行时修改;此测试只在编译期有意义(类型保护)
  // 运行时,我们只验证结构存在
  assert.equal(typeof plan.sections.hero, 'object');
  assert.equal(typeof plan.sections.one_scene, 'object');
  assert.equal(typeof plan.sections.same_second, 'object');
  assert.equal(typeof plan.sections.echo, 'object');
});

/* ---------- 5 状态全覆盖 ---------- */

test('planCityPageRender · 5 page_state 全覆盖 · header variant 一致', () => {
  const states: Array<CityPageState> = [
    'A_seed_editorial', 'B_active', 'C_low_activity', 'D_past_only', 'E_empty',
  ];
  const expected: Record<CityPageState, CityPageHeaderVariant> = {
    A_seed_editorial: 'seed-editorial',
    B_active: 'active-now',
    C_low_activity: 'low-activity',
    D_past_only: 'past-only',
    E_empty: 'empty',
  };
  for (const s of states) {
    const plan = planCityPageRender(cityWithState(s, 'L2_witnessed'));
    assert.equal(plan.pageHeaderVariant, expected[s], `page_state=${s}`);
  }
});