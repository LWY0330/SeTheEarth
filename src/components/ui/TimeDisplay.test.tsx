/* ============================================================
   v1.6.4 · TimeDisplay Component tests
   ============================================================ */

// @ts-nocheck -- node:test 类型声明缺失,runtime 需 Vitest/tsx 加载

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import { TimeDisplay } from './TimeDisplay';

test('TimeDisplay · 4 尺寸全部渲染', () => {
  for (const size of ['sm', 'md', 'lg', 'xl'] as const) {
    const html = renderToStaticMarkup(
      <TimeDisplay value="15:42" size={size} />,
    );
    assert.ok(html.includes('15:42'));
    assert.ok(html.includes(`time--${size}`));
  }
});

test('TimeDisplay · format=coord 渲染坐标', () => {
  const html = renderToStaticMarkup(
    <TimeDisplay value="15.5° N · 32.5° E" format="coord" />,
  );
  assert.ok(html.includes('15.5° N · 32.5° E'));
  assert.ok(html.includes('data-format="coord"'));
});

test('TimeDisplay · layer 颜色应用', () => {
  const html = renderToStaticMarkup(
    <TimeDisplay value="15:42" layer="red" />,
  );
  assert.ok(html.includes('var(--layer-red)'));
});

test('TimeDisplay · 6 状态全部 data-state 正确', () => {
  for (const state of ['default', 'hover', 'focus', 'active', 'disabled', 'success'] as const) {
    const html = renderToStaticMarkup(
      <TimeDisplay value="x" state={state} />,
    );
    assert.ok(html.includes(`data-state="${state}"`));
  }
});

test('TimeDisplay · 3 layer 全部颜色', () => {
  for (const layer of ['blue', 'yellow', 'red'] as const) {
    const html = renderToStaticMarkup(
      <TimeDisplay value="x" layer={layer} />,
    );
    assert.ok(html.includes(`var(--layer-${layer})`));
  }
});

test('TimeDisplay · default 状态无 layer(无 color)', () => {
  const html = renderToStaticMarkup(
    <TimeDisplay value="x" />,
  );
  assert.ok(html.includes('data-state="default"'));
  // 不应有 inline style color
  assert.ok(!html.includes('color:'));
});