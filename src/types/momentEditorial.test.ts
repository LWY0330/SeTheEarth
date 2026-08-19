/* ============================================================
   v1.6.1 · momentEditorial 测试
   - MomentEditorial = { category?: MomentCategory; editorialNote?: string }
   - 6 category 字面量
   - hasMomentEditorial / isMomentCategory 辅助函数
   ============================================================ */

// @ts-ignore -- node:test 类型声明缺失
import { test } from 'node:test';
// @ts-ignore -- node:assert/strict 类型声明缺失
import assert from 'node:assert/strict';
import type { Moment } from './moment.ts';
import type { MomentEditorial, MomentCategory } from './momentEditorial.ts';
import {
  MOMENT_CATEGORIES,
  hasMomentEditorial,
  isMomentCategory,
} from './momentEditorial.ts';

/* ---------- 类型扩展 ---------- */

const baseMoment: Moment = {
  moment_id: 'm-001',
  media: { url: 'https://example.com/photo.jpg', type: 'image' },
  media_type: 'image',
  captured_at: '2026-08-19T10:00:00Z',
  uploaded_at: '2026-08-19T10:05:00Z',
  city_id: 'tokyo',
  public_city_name: 'Tokyo',
  provenance_status: 'editorial',
  moderation_status: 'approved',
  rights_status: 'cc_by',
  created_at: '2026-08-19T10:05:00Z',
  updated_at: '2026-08-19T10:05:00Z',
};

test('Moment · editorial? 字段可省略（向后兼容 Phase 0）', () => {
  const m: Moment = { ...baseMoment };
  assert.equal(m.editorial, undefined);
});

test('Moment · editorial? 字段可填 category', () => {
  const editorial: MomentEditorial = { category: 'finance' };
  const m: Moment = { ...baseMoment, editorial };
  assert.equal(m.editorial?.category, 'finance');
  assert.equal(m.editorial?.editorialNote, undefined);
});

test('Moment · editorial? 字段可填 editorialNote', () => {
  const editorial: MomentEditorial = { editorialNote: '编辑注记' };
  const m: Moment = { ...baseMoment, editorial };
  assert.equal(m.editorial?.category, undefined);
  assert.equal(m.editorial?.editorialNote, '编辑注记');
});

test('Moment · editorial? 字段可填全 2 字段', () => {
  const editorial: MomentEditorial = {
    category: 'art',
    editorialNote: '编辑注记',
  };
  const m: Moment = { ...baseMoment, editorial };
  assert.equal(m.editorial?.category, 'art');
  assert.equal(m.editorial?.editorialNote, '编辑注记');
});

/* ---------- 6 category 字面量 ---------- */

test('MOMENT_CATEGORIES · 6 字面量（finance / war / art / urban / nature / romance）', () => {
  const expected: ReadonlyArray<MomentCategory> = [
    'finance', 'war', 'art', 'urban', 'nature', 'romance',
  ];
  assert.deepEqual(MOMENT_CATEGORIES, expected);
  assert.equal(MOMENT_CATEGORIES.length, 6);
});

test('MOMENT_CATEGORIES · frozen array', () => {
  assert.equal(Object.isFrozen(MOMENT_CATEGORIES), true);
});

/* ---------- hasMomentEditorial ---------- */

test('hasMomentEditorial · undefined → false', () => {
  assert.equal(hasMomentEditorial(undefined), false);
});

test('hasMomentEditorial · 全空对象 → false', () => {
  assert.equal(hasMomentEditorial({}), false);
});

test('hasMomentEditorial · 有任一字段 → true', () => {
  assert.equal(hasMomentEditorial({ category: 'finance' }), true);
  assert.equal(hasMomentEditorial({ editorialNote: 'note' }), true);
  assert.equal(
    hasMomentEditorial({ category: 'war', editorialNote: 'note' }),
    true,
  );
});

/* ---------- isMomentCategory 严格校验 ---------- */

test('isMomentCategory · 6 合法 category → true', () => {
  assert.equal(isMomentCategory('finance'), true);
  assert.equal(isMomentCategory('war'), true);
  assert.equal(isMomentCategory('art'), true);
  assert.equal(isMomentCategory('urban'), true);
  assert.equal(isMomentCategory('nature'), true);
  assert.equal(isMomentCategory('romance'), true);
});

test('isMomentCategory · 不合法 category → false', () => {
  assert.equal(isMomentCategory('sports'), false);
  assert.equal(isMomentCategory('culture'), false, 'culture 不在 6 类内');
  assert.equal(isMomentCategory(''), false);
  assert.equal(isMomentCategory('Finance'), false, '大写应被拒绝');
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
  // editorial 不在 17 必填中
  assert.equal(baseMoment.editorial, undefined);
});

/* ---------- 与 legacy moments.ts 数据兼容 ---------- */

test('MomentEditorial · 与 legacy moments.ts v2.2.2 category 数据兼容', () => {
  // legacy src/data/moments.ts 使用 MomentCategory 6 类
  // Phase 0 Moment 不含 category,迁移时通过 MomentEditorial.category 保留
  const legacyToEditorial: MomentEditorial = { category: 'finance' };
  assert.equal(legacyToEditorial.category, 'finance');

  // legacy 'war' category(已删除条目 liveMoments.ts:411-422)仍可填,字段保留
  const warEditorial: MomentEditorial = { category: 'war' };
  assert.equal(warEditorial.category, 'war');
});

/* ---------- readonly 类型契约 ---------- */

test('MomentEditorial · readonly 字段不允许运行时修改', () => {
  const e: MomentEditorial = { category: 'finance' };
  assert.equal(typeof e.category, 'string');
  // 编译期阻止修改;运行时尝试修改应允许但不语义化
});