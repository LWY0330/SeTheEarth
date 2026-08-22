/* ============================================================
   v1.6.2 · useLayerFromCity + resolveLayerFromCityId 测试
   - 6 测试覆盖 layer 推断
   ============================================================ */

// @ts-ignore -- node:test 类型声明缺失
import { test } from 'node:test';
// @ts-ignore -- node:assert/strict 类型声明缺失
import assert from 'node:assert/strict';
import {
  resolveLayerFromCityId,
  isLayerKnown,
  layerToCssVar,
  LAYER_TO_CSS_VAR,
} from './useLayerFromCity.ts';

test('resolveLayerFromCityId · Kyoto → blue', () => {
  assert.equal(resolveLayerFromCityId('kyoto'), 'blue');
});

test('resolveLayerFromCityId · Lisbon → yellow', () => {
  assert.equal(resolveLayerFromCityId('lisbon'), 'yellow');
});

test('resolveLayerFromCityId · Khartoum → red', () => {
  assert.equal(resolveLayerFromCityId('khartoum'), 'red');
});

test('resolveLayerFromCityId · 其他 12 城 → unknown(Phase 2 editorial override)', () => {
  for (const id of ['shanghai', 'mexico-city', 'tokyo', 'rio', 'reykjavik', 'cape-town', 'london', 'berlin', 'rome', 'sydney']) {
    assert.equal(resolveLayerFromCityId(id), 'unknown', `${id} 应返回 unknown`);
  }
});

test('isLayerKnown · blue/yellow/red → true,unknown → false', () => {
  assert.equal(isLayerKnown('blue'), true);
  assert.equal(isLayerKnown('yellow'), true);
  assert.equal(isLayerKnown('red'), true);
  assert.equal(isLayerKnown('unknown'), false);
});

test('layerToCssVar + LAYER_TO_CSS_VAR · spec §2.1.9 锁定映射', () => {
  assert.equal(LAYER_TO_CSS_VAR.blue, 'var(--earth-blue)');
  assert.equal(LAYER_TO_CSS_VAR.yellow, 'var(--layer-yellow)');
  assert.equal(LAYER_TO_CSS_VAR.red, 'var(--layer-red)');
  assert.equal(layerToCssVar('blue'), 'var(--earth-blue)');
  assert.equal(layerToCssVar('yellow'), 'var(--layer-yellow)');
  assert.equal(layerToCssVar('red'), 'var(--layer-red)');
  assert.equal(layerToCssVar('unknown'), 'var(--ink-700)');
});