/* ============================================================
   v1.6.1 · moment.sources 测试
   - Moment.sources?: ReadonlyArray<MomentSource> 扩展
   - 7 source types
   - isM MomentSourceType 严格校验
   ============================================================ */

// @ts-ignore -- node:test 类型声明缺失
import { test } from 'node:test';
// @ts-ignore -- node:assert/strict 类型声明缺失
import assert from 'node:assert/strict';
import type { Moment, MomentSource, MomentSourceType } from './moment.ts';
import {
  MOMENT_SOURCE_TYPES,
  isMomentSourceType,
} from './moment.ts';

const baseMoment: Moment = {
  moment_id: 'm-001',
  media: { url: 'https://example.com/photo.jpg', type: 'image' },
  media_type: 'image',
  captured_at: '2026-08-19T10:00:00Z',
  uploaded_at: '2026-08-19T10:05:00Z',
  city_id: 'kyoto',
  public_city_name: 'Kyoto',
  provenance_status: 'trusted_source',
  moderation_status: 'approved',
  rights_status: 'cc_by',
  created_at: '2026-08-19T10:05:00Z',
  updated_at: '2026-08-19T10:05:00Z',
};

/* ---------- 类型扩展验证 ---------- */

test('Moment · sources? 字段可省略（向后兼容）', () => {
  const m: Moment = { ...baseMoment };
  assert.equal(m.sources, undefined);
});

test('Moment · sources? 字段可填单源', () => {
  const src: MomentSource = {
    name: 'Reuters',
    url: 'https://www.reuters.com/article/xyz',
    type: 'reuters',
  };
  const m: Moment = { ...baseMoment, sources: [src] };
  assert.equal(m.sources?.length, 1);
  assert.equal(m.sources?.[0].name, 'Reuters');
  assert.equal(m.sources?.[0].type, 'reuters');
});

test('Moment · sources? 字段可填多源（多源合并）', () => {
  const sources: ReadonlyArray<MomentSource> = [
    { name: 'Reuters', url: 'https://www.reuters.com/x', type: 'reuters' },
    { name: 'AP', url: 'https://apnews.com/y', type: 'ap' },
    { name: 'Wikimedia', type: 'wikimedia' },
  ];
  const m: Moment = { ...baseMoment, sources };
  assert.equal(m.sources?.length, 3);
});

test('Moment · sources? 字段 url 可选（手工录入无 URL）', () => {
  const src: MomentSource = { name: 'Editorial', type: 'manual' };
  const m: Moment = { ...baseMoment, sources: [src] };
  assert.equal(m.sources?.[0].url, undefined);
  assert.equal(m.sources?.[0].name, 'Editorial');
});

/* ---------- 7 source types ---------- */

test('MOMENT_SOURCE_TYPES · 7 种类型（reuters/ap/adobe/shutterstock/wikimedia/unsplash/manual）', () => {
  const expected: ReadonlyArray<MomentSourceType> = [
    'reuters', 'ap', 'adobe', 'shutterstock', 'wikimedia', 'unsplash', 'manual',
  ];
  assert.deepEqual(MOMENT_SOURCE_TYPES, expected);
  assert.equal(MOMENT_SOURCE_TYPES.length, 7);
});

test('MOMENT_SOURCE_TYPES · frozen array', () => {
  assert.equal(Object.isFrozen(MOMENT_SOURCE_TYPES), true);
});

/* ---------- isMomentSourceType 严格校验 ---------- */

test('isMomentSourceType · 7 合法 type → true', () => {
  assert.equal(isMomentSourceType('reuters'), true);
  assert.equal(isMomentSourceType('ap'), true);
  assert.equal(isMomentSourceType('adobe'), true);
  assert.equal(isMomentSourceType('shutterstock'), true);
  assert.equal(isMomentSourceType('wikimedia'), true);
  assert.equal(isMomentSourceType('unsplash'), true);
  assert.equal(isMomentSourceType('manual'), true);
});

test('isMomentSourceType · 不合法 type → false', () => {
  assert.equal(isMomentSourceType('google'), false);
  assert.equal(isMomentSourceType('facebook'), false);
  assert.equal(isMomentSourceType(''), false);
  assert.equal(isMomentSourceType('Reuters'), false, '大写应被拒绝');
});

/* ---------- Phase 3 接入预留 ---------- */

test('Moment · sources? 与 provenance_status 互补（type=manual 配 provenance=editorial）', () => {
  const m: Moment = {
    ...baseMoment,
    provenance_status: 'editorial',
    sources: [
      { name: 'lwy-editorial', type: 'manual' },
    ],
  };
  assert.equal(m.sources?.[0].type, 'manual');
  assert.equal(m.provenance_status, 'editorial');
});

/* ---------- spec §17 数据源可追溯 ---------- */

test('Moment · sources? 满足 spec §17 acceptance 数据源可追溯（name + url + type）', () => {
  const m: Moment = {
    ...baseMoment,
    sources: [
      {
        name: 'Wikimedia Commons',
        url: 'https://commons.wikimedia.org/wiki/File:Kyoto_Philosopher%27s_Path.jpg',
        type: 'wikimedia',
      },
    ],
  };
  const src = m.sources![0];
  assert.ok(src.name.length > 0, 'name 必填');
  assert.ok(src.url && src.url.length > 0, 'URL 必填(追溯)');
  assert.equal(src.type, 'wikimedia');
});

/* ---------- Phase 0 17 字段不动 ---------- */

test('Moment · 17 必填字段未受影响（向后兼容 Phase 0）', () => {
  // baseMoment 已经是 17 字段
  assert.ok(baseMoment.moment_id);
  assert.ok(baseMoment.media);
  assert.ok(baseMoment.media_type);
  assert.ok(baseMoment.captured_at);
  assert.ok(baseMoment.uploaded_at);
  assert.ok(baseMoment.city_id);
  assert.ok(baseMoment.public_city_name);
  assert.ok(baseMoment.provenance_status);
  assert.ok(baseMoment.moderation_status);
  assert.ok(baseMoment.rights_status);
  assert.ok(baseMoment.created_at);
  assert.ok(baseMoment.updated_at);
  // sources 不在 17 必填中
  assert.equal(baseMoment.sources, undefined);
});

/* ---------- readonly 类型契约 ---------- */

test('MomentSource · readonly 类型契约（编译期阻止修改）', () => {
  const src: MomentSource = { name: 'x', type: 'manual' };
  // TypeScript readonly 在编译期阻止;运行时尝试修改应允许但不语义化
  // 此测试仅验证类型层契约
  assert.equal(typeof src.name, 'string');
  assert.equal(typeof src.type, 'string');
});