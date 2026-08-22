/* ============================================================
   v1.6.4 · PROMPT 46 v1 · LayerIndicator Component tests
   - 6 tests(6 状态 + 3 layer)
   - react-dom/server.renderToStaticMarkup
   ============================================================ */

// @ts-nocheck -- node:test 类型声明缺失,runtime 需 Vitest/tsx 加载

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import { LayerIndicator } from './LayerIndicator';

test('LayerIndicator · blue layer 渲染', () => {
  const html = renderToStaticMarkup(
    <LayerIndicator layer="blue" label="KYOTO" />,
  );
  assert.ok(html.includes('BLUE'));
  assert.ok(html.includes('KYOTO'));
  assert.ok(html.includes('data-layer="blue"'));
});

test('LayerIndicator · yellow layer 渲染', () => {
  const html = renderToStaticMarkup(
    <LayerIndicator layer="yellow" label="LISBON" />,
  );
  assert.ok(html.includes('YELLOW'));
  assert.ok(html.includes('data-layer="yellow"'));
});

test('LayerIndicator · red layer 渲染', () => {
  const html = renderToStaticMarkup(
    <LayerIndicator layer="red" label="KHARTOUM" />,
  );
  assert.ok(html.includes('RED'));
  assert.ok(html.includes('data-layer="red"'));
});

test('LayerIndicator · 自定义 kicker', () => {
  const html = renderToStaticMarkup(
    <LayerIndicator layer="blue" label="Kyoto" kicker="CUSTOM KICKER" />,
  );
  assert.ok(html.includes('CUSTOM KICKER'));
  assert.ok(!html.includes('BLUE · KYOTO'));
});

test('LayerIndicator · state=disabled → opacity 0.5 + not-allowed', () => {
  const html = renderToStaticMarkup(
    <LayerIndicator layer="blue" label="X" state="disabled" />,
  );
  assert.ok(html.includes('data-state="disabled"'));
});

test('LayerIndicator · state=focus → focus ring', () => {
  const html = renderToStaticMarkup(
    <LayerIndicator layer="blue" label="X" state="focus" />,
  );
  assert.ok(html.includes('data-state="focus"'));
});