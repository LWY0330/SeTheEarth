/* ============================================================
   v1.6.1 · moment.captions 测试
   - Moment.captions?: MomentCaptions 扩展
   - MomentCaptions = { zh?: string; en?: string }
   - getMomentCaption 查表辅助函数
   ============================================================ */

// @ts-ignore -- node:test 类型声明缺失
import { test } from 'node:test';
// @ts-ignore -- node:assert/strict 类型声明缺失
import assert from 'node:assert/strict';
import type { Moment, MomentCaptions } from './moment.ts';
import { getMomentCaption } from './moment.ts';

const baseMoment: Pick<Moment, 'caption' | 'captions'> = {
  caption: undefined,
  captions: undefined,
};

/* ---------- 类型扩展 ---------- */

test('Moment · captions? 字段可省略（向后兼容 Phase 0）', () => {
  const m: Pick<Moment, 'caption' | 'captions'> = { ...baseMoment };
  assert.equal(m.captions, undefined);
});

test('Moment · captions? 字段可填双语', () => {
  const captions: MomentCaptions = {
    zh: '涩谷十字路口的红灯刚转绿',
    en: 'Shibuya crossing just turned green',
  };
  const m: Pick<Moment, 'caption' | 'captions'> = { ...baseMoment, captions };
  assert.equal(m.captions?.zh, '涩谷十字路口的红灯刚转绿');
  assert.equal(m.captions?.en, 'Shibuya crossing just turned green');
});

test('Moment · captions? 字段允许 partial（仅 zh）', () => {
  const captions: MomentCaptions = { zh: '涩谷十字路口的红灯刚转绿' };
  const m: Pick<Moment, 'caption' | 'captions'> = { ...baseMoment, captions };
  assert.equal(m.captions?.zh, '涩谷十字路口的红灯刚转绿');
  assert.equal(m.captions?.en, undefined);
});

test('Moment · captions? 字段允许 partial（仅 en）', () => {
  const captions: MomentCaptions = { en: 'Shibuya crossing just turned green' };
  const m: Pick<Moment, 'caption' | 'captions'> = { ...baseMoment, captions };
  assert.equal(m.captions?.zh, undefined);
  assert.equal(m.captions?.en, 'Shibuya crossing just turned green');
});

/* ---------- getMomentCaption 辅助函数 ---------- */

test('getMomentCaption · captions[locale] 优先', () => {
  const m: Pick<Moment, 'caption' | 'captions'> = {
    caption: 'legacy caption',
    captions: { zh: 'zh 文案', en: 'en caption' },
  };
  assert.equal(getMomentCaption(m, 'zh'), 'zh 文案');
  assert.equal(getMomentCaption(m, 'en'), 'en caption');
});

test('getMomentCaption · captions 缺 zh 时 fallback caption (legacy)', () => {
  const m: Pick<Moment, 'caption' | 'captions'> = {
    caption: 'legacy fallback',
    captions: { en: 'en caption' },
  };
  assert.equal(getMomentCaption(m, 'zh'), 'legacy fallback');
});

test('getMomentCaption · captions 缺 en 时 fallback caption (legacy)', () => {
  const m: Pick<Moment, 'caption' | 'captions'> = {
    caption: 'legacy fallback',
    captions: { zh: 'zh 文案' },
  };
  assert.equal(getMomentCaption(m, 'en'), 'legacy fallback');
});

test('getMomentCaption · captions + caption 都缺 → undefined', () => {
  const m: Pick<Moment, 'caption' | 'captions'> = { ...baseMoment };
  assert.equal(getMomentCaption(m, 'zh'), undefined);
  assert.equal(getMomentCaption(m, 'en'), undefined);
});

test('getMomentCaption · captions 仅 zh, caption 有 fallback → en 返回 caption（不区分语言）', () => {
  const m: Pick<Moment, 'caption' | 'captions'> = {
    caption: 'zh-only-legacy',
    captions: { zh: 'modern zh' },
  };
  assert.equal(getMomentCaption(m, 'zh'), 'modern zh', 'captions.zh 优先');
  // caption 是 language-agnostic fallback,en 查询时仍返回(注意:这是设计选择)
  assert.equal(getMomentCaption(m, 'en'), 'zh-only-legacy', 'caption 任何 locale 都能 fallback');
});

test('getMomentCaption · captions 完全空对象 {} + caption 有值 → 返回 caption', () => {
  const m: Pick<Moment, 'caption' | 'captions'> = {
    caption: 'fallback',
    captions: {},
  };
  assert.equal(getMomentCaption(m, 'zh'), 'fallback');
  assert.equal(getMomentCaption(m, 'en'), 'fallback');
});

test('getMomentCaption · captions 完全空对象 + caption 也缺 → undefined', () => {
  const m: Pick<Moment, 'caption' | 'captions'> = {
    caption: undefined,
    captions: {},
  };
  assert.equal(getMomentCaption(m, 'zh'), undefined);
  assert.equal(getMomentCaption(m, 'en'), undefined);
});

test('getMomentCaption · empty string caption 视为不存在', () => {
  const m: Pick<Moment, 'caption' | 'captions'> = {
    caption: '',
    captions: { zh: 'modern zh', en: 'modern en' },
  };
  assert.equal(getMomentCaption(m, 'zh'), 'modern zh', 'captions 优先');
  assert.equal(getMomentCaption(m, 'en'), 'modern en', 'captions 优先');
});

/* ---------- 类型契约 ---------- */

test('MomentCaptions · readonly 类型契约', () => {
  const c: MomentCaptions = { zh: 'x' };
  assert.equal(typeof c.zh, 'string');
  // 编译期阻止修改;运行时尝试修改应允许但不语义化
});

/* ---------- 与 Phase 0 caption 共存 ---------- */

test('Moment · caption (legacy) 与 captions 同时存在不冲突', () => {
  const m: Pick<Moment, 'caption' | 'captions'> = {
    caption: 'legacy caption text',
    captions: {
      zh: '现代 zh 文案',
      en: 'modern en caption',
    },
  };
  // 两者并存,getMomentCaption 按优先级返回
  assert.equal(getMomentCaption(m, 'zh'), '现代 zh 文案', 'captions 优先');
  // caption 字段本身仍可访问(向后兼容)
  assert.equal(m.caption, 'legacy caption text');
});

/* ---------- Phase 0 17 字段不动 ---------- */

test('Moment · 17 必填字段未受影响（向后兼容 Phase 0）', () => {
  const m: Moment = {
    moment_id: 'm',
    media: { url: 'x', type: 'image' },
    media_type: 'image',
    captured_at: '2026-08-19T00:00:00Z',
    uploaded_at: '2026-08-19T00:00:00Z',
    city_id: 'kyoto',
    public_city_name: 'Kyoto',
    provenance_status: 'editorial',
    moderation_status: 'approved',
    rights_status: 'unknown',
    created_at: '2026-08-19T00:00:00Z',
    updated_at: '2026-08-19T00:00:00Z',
    caption: 'legacy',
    captions: { zh: 'modern zh' },
  };
  assert.ok(m.caption);
  assert.ok(m.captions);
});