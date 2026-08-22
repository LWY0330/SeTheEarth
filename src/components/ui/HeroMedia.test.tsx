/* ============================================================
   v1.6.4 · HeroMedia Component tests
   ============================================================ */

// @ts-nocheck -- node:test 类型声明缺失,runtime 需 Vitest/tsx 加载

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import { HeroMedia } from './HeroMedia';

test('HeroMedia · 720px height 渲染', () => {
  const html = renderToStaticMarkup(
    <HeroMedia src="/img.jpg" alt="K" height="720px" />,
  );
  assert.ok(html.includes('height: 720px'));
  assert.ok(html.includes('data-height="720px"'));
});

test('HeroMedia · 100vh height 渲染', () => {
  const html = renderToStaticMarkup(
    <HeroMedia src="/img.jpg" alt="K" height="100vh" />,
  );
  assert.ok(html.includes('height: 100vh'));
});

test('HeroMedia · 4 overlay 变体', () => {
  for (const overlay of ['top-bottom', 'left', 'warm-bottom', 'none'] as const) {
    const html = renderToStaticMarkup(
      <HeroMedia src="/img.jpg" alt="K" overlay={overlay} />,
  );
    assert.ok(html.includes(`overlay--${overlay}`), `overlay=${overlay}`);
  }
});

test('HeroMedia · 3 safeArea 位置', () => {
  for (const area of ['left', 'center', 'bottom'] as const) {
    const html = renderToStaticMarkup(
      <HeroMedia src="/img.jpg" alt="K" safeArea={area}>
        <span>child</span>
      </HeroMedia>,
    );
    assert.ok(html.includes(`safeArea--${area}`), `safeArea=${area}`);
    assert.ok(html.includes('child'));
  }
});

test('HeroMedia · overlay=none 时不渲染 overlay 元素', () => {
  const html = renderToStaticMarkup(
    <HeroMedia src="/img.jpg" alt="K" overlay="none" />,
  );
  assert.ok(html.includes('overlay--none'));
});

test('HeroMedia · image alt 用于无障碍', () => {
  const html = renderToStaticMarkup(
    <HeroMedia src="/k.jpg" alt="京都" />,
  );
  assert.ok(html.includes('alt="京都"'));
  assert.ok(html.includes('src="/k.jpg"'));
});