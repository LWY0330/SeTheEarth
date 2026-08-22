/* ============================================================
   v1.6.3 · photoSource + photoAssets 测试
   - 5 stage 摄影 + §2.8.8/§2.2.9 合规
   ============================================================ */

// @ts-ignore -- node:test 类型声明缺失
import { test } from 'node:test';
// @ts-ignore -- node:assert/strict 类型声明缺失
import assert from 'node:assert/strict';
import {
  getPhotoForUnknownStage,
  getPhotoForRole,
  validatePhotoAsset,
  isEditorialSourceApproved,
  getPhotoSourcePriority,
  getPhotoSourceRank,
  comparePhotoSource,
} from './photoSource.ts';
import {
  UNKNOWN_PHOTO_BY_STAGE,
  PHOTO_SOURCE_PRIORITY,
  type PhotoAsset,
  type PhotoSourceType,
} from '../data/photoAssets.ts';

test('getPhotoForUnknownStage · 5 stage 全部返回 PhotoAsset', () => {
  for (const stage of [1, 2, 3, 4, 5] as const) {
    const photo = getPhotoForUnknownStage(stage);
    assert.ok(photo, `stage ${stage} 应返回 PhotoAsset`);
    assert.ok(photo!.url.length > 0);
  }
});

test('getPhotoForUnknownStage · Stage 1-4 city_id 为 null(未 Reveal)', () => {
  for (const stage of [1, 2, 3, 4] as const) {
    const photo = getPhotoForUnknownStage(stage);
    assert.equal(photo!.city_id, null);
    assert.equal(photo!.country_code, null);
  }
});

test('getPhotoForUnknownStage · Stage 5 city_id = mexico-city', () => {
  const photo = getPhotoForUnknownStage(5);
  assert.equal(photo!.city_id, 'mexico-city');
  assert.equal(photo!.country_code, 'MX');
});

test('getPhotoForRole · Phase 1:返回 stage 对应图(无论 role)', () => {
  for (const role of ['hero', 'one_scene', 'same_second', 'echo'] as const) {
    const photo = getPhotoForRole(3, role);
    assert.ok(photo, `${role} 应返回 photo`);
  }
});

test('validatePhotoAsset · UNKNOWN_PHOTO_BY_STAGE 5 stage 全部 12 字段齐全', () => {
  for (const stage of [1, 2, 3, 4, 5] as const) {
    const photo = getPhotoForUnknownStage(stage)!;
    assert.equal(validatePhotoAsset(photo), true, `stage ${stage} 应 validate 通过`);
  }
});

test('validatePhotoAsset · 空字符串字段 → false', () => {
  const photo: PhotoAsset = {
    asset_id: '',
    url: 'https://x',
    city_id: null,
    country_code: null,
    source: 'unsplash',
    source_url: 'https://x',
    photographer: 'x',
    date: '2026-08-19',
    resolution: '1x1',
    license: 'x',
    credit_requirement: 'x',
    usage_restriction: 'x',
    content_description: 'x',
    editorial_only: false,
    role: 'hero',
  };
  assert.equal(validatePhotoAsset(photo), false);
});

test('isEditorialSourceApproved · Red Layer editorial source + editorial_only=true → true', () => {
  const photo: PhotoAsset = {
    asset_id: 'a',
    url: 'https://x',
    city_id: 'khartoum',
    country_code: 'SD',
    source: 'reuters',
    source_url: 'https://reuters.com/x',
    photographer: 'photographer',
    date: '2026-08-19',
    resolution: '1920x1080',
    license: 'Reuters Editorial',
    credit_requirement: 'Reuters',
    usage_restriction: 'editorial use only',
    content_description: 'Khartoum news',
    editorial_only: true,
    role: 'hero',
  };
  assert.equal(isEditorialSourceApproved(photo), true);
});

test('isEditorialSourceApproved · Red Layer 但 editorial_only=false → false', () => {
  const photo: PhotoAsset = {
    asset_id: 'a',
    url: 'https://x',
    city_id: 'kyoto',
    country_code: 'JP',
    source: 'reuters',
    source_url: 'https://reuters.com/x',
    photographer: 'photographer',
    date: '2026-08-19',
    resolution: '1920x1080',
    license: 'Reuters',
    credit_requirement: 'Reuters',
    usage_restriction: 'editorial',
    content_description: 'x',
    editorial_only: false, // ← 关键
    role: 'hero',
  };
  assert.equal(isEditorialSourceApproved(photo), false, 'Red Layer 必须 editorial_only=true');
});

test('isEditorialSourceApproved · Blue Layer unsplash + 12 字段全填 → true', () => {
  const photo = getPhotoForUnknownStage(1)!; // unsplash, 12 字段全填
  assert.equal(isEditorialSourceApproved(photo), true);
});

test('getPhotoSourcePriority · 锁定 8 顺序(per §2.8.9)', () => {
  assert.equal(PHOTO_SOURCE_PRIORITY[0], 'reuters');
  assert.equal(PHOTO_SOURCE_PRIORITY[1], 'ap');
  assert.equal(PHOTO_SOURCE_PRIORITY[2], 'adobe-editorial');
  assert.equal(PHOTO_SOURCE_PRIORITY[3], 'shutterstock-editorial');
  assert.equal(PHOTO_SOURCE_PRIORITY[4], 'wikimedia');
  assert.equal(PHOTO_SOURCE_PRIORITY[5], 'unsplash');
  assert.equal(PHOTO_SOURCE_PRIORITY[6], 'pexels');
  assert.equal(PHOTO_SOURCE_PRIORITY[7], 'manual');
  assert.equal(PHOTO_SOURCE_PRIORITY.length, 8);
});

test('getPhotoSourceRank · reuters=0, unsplash=5, manual=7', () => {
  assert.equal(getPhotoSourceRank('reuters'), 0);
  assert.equal(getPhotoSourceRank('ap'), 1);
  assert.equal(getPhotoSourceRank('unsplash'), 5);
  assert.equal(getPhotoSourceRank('pexels'), 6);
  assert.equal(getPhotoSourceRank('manual'), 7);
});

test('getPhotoSourceRank · 未知 source → length(末位)', () => {
  assert.equal(getPhotoSourceRank('reuters' as PhotoSourceType), 0); // 已知
  assert.equal(getPhotoSourceRank('unknown-future-source' as PhotoSourceType), PHOTO_SOURCE_PRIORITY.length);
});

test('comparePhotoSource · reuters < unsplash(Editorial 优先)', () => {
  assert.ok(comparePhotoSource('reuters', 'unsplash') < 0);
  assert.ok(comparePhotoSource('unsplash', 'reuters') > 0);
  // 不同优先级 → 非零
  assert.notEqual(comparePhotoSource('unsplash', 'pexels'), 0, 'unsplash rank 5 vs pexels rank 6');
});

test('UNKNOWN_PHOTO_BY_STAGE · frozen array', () => {
  assert.equal(Object.isFrozen(UNKNOWN_PHOTO_BY_STAGE), true);
});

test('5 stage 摄影 URL 全部不同(否则 stage 切换无视觉差异)', () => {
  const urls = new Set<string>();
  for (const stage of [1, 2, 3, 4, 5] as const) {
    urls.add(getPhotoForUnknownStage(stage)!.url);
  }
  // 注:Phase 1 mockup 用同一图 + 不同 crop 参数;set 大小 = 5(crop 参数使 URL 不同)
  assert.equal(urls.size, 5, '5 stage 应有 5 不同 URL(或 crop 变体)');
});

test('getPhotoSourcePriority · 返回 frozen array', () => {
  const p = getPhotoSourcePriority();
  assert.equal(Object.isFrozen(p), true);
});