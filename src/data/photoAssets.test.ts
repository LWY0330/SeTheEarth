/* ============================================================
   v1.6.3 · photoAssets 数据测试
   - 8 tests 覆盖 UNKNOWN_PHOTO_BY_STAGE 5 stage preset
   - 纯数据文件,无 JSX
   ============================================================ */

// @ts-ignore -- node:test 类型声明缺失
import { test } from 'node:test';
// @ts-ignore -- node:assert/strict 类型声明缺失
import assert from 'node:assert/strict';
import {
  UNKNOWN_PHOTO_BY_STAGE,
  PHOTO_SOURCE_PRIORITY,
  type PhotoAsset,
} from './photoAssets.ts';

test('UNKNOWN_PHOTO_BY_STAGE · 5 stage 全部存在', () => {
  for (const stage of [1, 2, 3, 4, 5] as const) {
    assert.ok(UNKNOWN_PHOTO_BY_STAGE[stage], `stage ${stage} 应存在`);
  }
});

test('UNKNOWN_PHOTO_BY_STAGE · Stage 1 city_id=null(未 Reveal)', () => {
  assert.equal(UNKNOWN_PHOTO_BY_STAGE[1].city_id, null);
  assert.equal(UNKNOWN_PHOTO_BY_STAGE[1].country_code, null);
});

test('UNKNOWN_PHOTO_BY_STAGE · Stage 5 city_id=mexico-city(已 Reveal)', () => {
  assert.equal(UNKNOWN_PHOTO_BY_STAGE[5].city_id, 'mexico-city');
  assert.equal(UNKNOWN_PHOTO_BY_STAGE[5].country_code, 'MX');
});

test('UNKNOWN_PHOTO_BY_STAGE · 5 stage URL 全部不同', () => {
  const urls = new Set<string>();
  for (const stage of [1, 2, 3, 4, 5] as const) {
    urls.add(UNKNOWN_PHOTO_BY_STAGE[stage].url);
  }
  assert.equal(urls.size, 5);
});

test('UNKNOWN_PHOTO_BY_STAGE · 5 stage 12 字段全填(§2.8.9 Required Metadata)', () => {
  for (const stage of [1, 2, 3, 4, 5] as const) {
    const p: PhotoAsset = UNKNOWN_PHOTO_BY_STAGE[stage];
    assert.ok(p.asset_id);
    assert.ok(p.url);
    assert.ok(p.source);
    assert.ok(p.source_url);
    assert.ok(p.photographer);
    assert.ok(p.date);
    assert.ok(p.resolution);
    assert.ok(p.license);
    assert.ok(p.credit_requirement);
    assert.ok(p.usage_restriction);
    assert.ok(p.content_description);
    assert.equal(typeof p.editorial_only, 'boolean');
    assert.ok(['hero', 'one_scene', 'same_second', 'echo'].includes(p.role));
  }
});

test('UNKNOWN_PHOTO_BY_STAGE · frozen 不可变', () => {
  assert.equal(Object.isFrozen(UNKNOWN_PHOTO_BY_STAGE), true);
});

test('PHOTO_SOURCE_PRIORITY · 8 source 锁定顺序(Editorial > Stock)', () => {
  assert.equal(PHOTO_SOURCE_PRIORITY.length, 8);
  assert.equal(PHOTO_SOURCE_PRIORITY[0], 'reuters');
  assert.equal(PHOTO_SOURCE_PRIORITY[7], 'manual');
  assert.equal(Object.isFrozen(PHOTO_SOURCE_PRIORITY), true);
});

test('UNKNOWN_PHOTO_BY_STAGE · 5 stage 源都是 unsplash(Phase 1 默认)', () => {
  for (const stage of [1, 2, 3, 4, 5] as const) {
    assert.equal(UNKNOWN_PHOTO_BY_STAGE[stage].source, 'unsplash');
  }
});