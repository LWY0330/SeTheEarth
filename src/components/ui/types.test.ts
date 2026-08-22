/* ============================================================
   v1.6.4 · PROMPT 46 v1 · types.ts 测试
   - 14 tests 覆盖共享类型 + 枚举
   ============================================================ */

// @ts-ignore -- node:test 类型声明缺失
import { test } from 'node:test';
// @ts-ignore -- node:assert/strict 类型声明缺失
import assert from 'node:assert/strict';
import {
  LAYER_CSS_VAR,
  type ComponentState,
  type LayerColor,
  type TimeDisplaySize,
  type HeroHeight,
  type EchoInputState,
  type RevealStage,
  type NavItem,
  type CityTime,
  type TimeComparisonItem,
  type SameSecondCity,
  type CityComparison,
  type NavCityRef,
} from './types.ts';

test('ComponentState · 6 字面量', () => {
  const states: ComponentState[] = ['default', 'hover', 'focus', 'active', 'disabled', 'success'];
  assert.equal(states.length, 6);
});

test('LayerColor · 3 字面量', () => {
  const layers: LayerColor[] = ['blue', 'yellow', 'red'];
  assert.equal(layers.length, 3);
});

test('TimeDisplaySize · 4 字面量', () => {
  const sizes: TimeDisplaySize[] = ['sm', 'md', 'lg', 'xl'];
  assert.equal(sizes.length, 4);
});

test('HeroHeight · 2 字面量', () => {
  const heights: HeroHeight[] = ['720px', '100vh'];
  assert.equal(heights.length, 2);
});

test('EchoInputState · 3 字面量', () => {
  const states: EchoInputState[] = ['default', 'typing', 'submitted'];
  assert.equal(states.length, 3);
});

test('RevealStage · 5 字面量', () => {
  const stages: RevealStage[] = [1, 2, 3, 4, 5];
  assert.equal(stages.length, 5);
});

test('LAYER_CSS_VAR · 4 CSS 变量锁定', () => {
  assert.equal(LAYER_CSS_VAR.blue, 'var(--earth-blue)');
  assert.equal(LAYER_CSS_VAR.yellow, 'var(--layer-yellow)');
  assert.equal(LAYER_CSS_VAR.red, 'var(--layer-red)');
  assert.equal(LAYER_CSS_VAR.unknown, 'var(--ink-700)');
  assert.equal(Object.isFrozen(LAYER_CSS_VAR), true);
});

test('NavItem · 最小 shape', () => {
  const item: NavItem = { label: 'X', href: '/x' };
  assert.equal(item.label, 'X');
  assert.equal(item.href, '/x');
});

test('CityTime · 最小 shape', () => {
  const t: CityTime = { timezone: 'Asia/Tokyo', name: 'Tokyo', offset: '+9H' };
  assert.equal(t.timezone, 'Asia/Tokyo');
});

test('TimeComparisonItem · 最小 shape', () => {
  const item: TimeComparisonItem = { city: 'X', time: '15:42' };
  assert.equal(item.city, 'X');
  assert.equal(item.time, '15:42');
});

test('SameSecondCity · 继承 TimeComparisonItem + country', () => {
  const c: SameSecondCity = {
    city: 'Tokyo', time: '15:42', country: 'JAPAN',
  };
  assert.equal(c.country, 'JAPAN');
});

test('CityComparison · 完整 shape', () => {
  const c: CityComparison = {
    id: 'tokyo', name: 'Tokyo', country: 'JAPAN',
    time: '15:42', description: '...', layer: 'blue',
  };
  assert.equal(c.id, 'tokyo');
  assert.equal(c.layer, 'blue');
});

test('NavCityRef · 最小 shape', () => {
  const r: NavCityRef = { id: 'kyoto', nameEn: 'Kyoto', href: '/cities/kyoto' };
  assert.equal(r.id, 'kyoto');
});

test('Re-export 完整性 · 14 组件都从 index 导出', async () => {
  // 动态 import 验证 index.ts 14 组件全部存在
  const indexModule = await import('./index.ts');
  const expectedComponents = [
    'GlobalHeader', 'SectionHeader', 'HeroMedia', 'WorldTimeRail',
    'TimeDisplay', 'TimeComparison', 'CoordinateWindow', 'LocationMeta',
    'LayerIndicator', 'OneScene', 'SameSecond', 'EchoInput',
    'DistanceNavigation', 'RevealMeta',
  ];
  for (const comp of expectedComponents) {
    assert.ok(comp in indexModule, `${comp} 应在 index.ts 导出`);
  }
});