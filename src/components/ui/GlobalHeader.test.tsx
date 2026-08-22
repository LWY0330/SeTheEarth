/* ============================================================
   v1.6.4 · GlobalHeader Component tests
   ============================================================ */

// @ts-nocheck -- node:test 类型声明缺失,runtime 需 Vitest/tsx 加载

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import { GlobalHeader } from './GlobalHeader';

const defaultLogo = { cn: '看见地球', en: 'SEE EARTH' };
const defaultNav = [
  { label: 'Cities', href: '/cities' },
  { label: 'Journal', href: '/journal' },
];

test('GlobalHeader · default logo + nav 渲染', () => {
  const html = renderToStaticMarkup(
    <GlobalHeader logo={defaultLogo} navItems={defaultNav} />,
  );
  assert.ok(html.includes('看见地球'));
  assert.ok(html.includes('SEE EARTH'));
  assert.ok(html.includes('Cities'));
  assert.ok(html.includes('Journal'));
  assert.ok(html.includes('href="/cities"'));
});

test('GlobalHeader · simplified 变体(无 nav,仅 logo + dot)', () => {
  const html = renderToStaticMarkup(
    <GlobalHeader logo={defaultLogo} simplified />,
  );
  assert.ok(html.includes('看见地球'));
  assert.ok(!html.includes('Cities'), 'simplified 无 nav');
  assert.ok(html.includes('data-simplified="true"'));
});

test('GlobalHeader · withBack 变体显示 back link', () => {
  const html = renderToStaticMarkup(
    <GlobalHeader
      logo={defaultLogo}
      navItems={defaultNav}
      backHref="/cities/kyoto"
      backLabel="KYOTO"
    />,
  );
  assert.ok(html.includes('← KYOTO'));
  assert.ok(html.includes('href="/cities/kyoto"'));
});

test('GlobalHeader · active navLink', () => {
  const html = renderToStaticMarkup(
    <GlobalHeader
      logo={defaultLogo}
      navItems={[
        { label: 'Cities', href: '/cities', active: true },
        { label: 'Journal', href: '/journal' },
      ]}
    />,
  );
  assert.ok(html.includes('data-active="true"'));
  assert.ok(html.includes('navLink--active'));
});

test('GlobalHeader · sticky 72px height', () => {
  const html = renderToStaticMarkup(
    <GlobalHeader logo={defaultLogo} />,
  );
  assert.ok(html.includes('height: 72px'));
  assert.ok(html.includes('position: sticky'));
});

test('GlobalHeader · 6 状态全部 data-state', () => {
  for (const state of ['default', 'hover', 'focus', 'active', 'disabled', 'success'] as const) {
    const html = renderToStaticMarkup(
      <GlobalHeader logo={defaultLogo} state={state} />,
  );
    assert.ok(html.includes(`data-state="${state}"`));
  }
});