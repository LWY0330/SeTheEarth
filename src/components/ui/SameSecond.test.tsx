/* ============================================================
   v1.6.4 · SameSecond Component tests
   ============================================================ */

// @ts-nocheck -- node:test 类型声明缺失,runtime 需 Vitest/tsx 加载

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import { SameSecond } from './SameSecond';

test('SameSecond · 基础 props 渲染', () => {
  const html = renderToStaticMarkup(
    <SameSecond />,
  );
  assert.ok(html.includes('data-state="default"'));
});

test('SameSecond · state=disabled', () => {
  const html = renderToStaticMarkup(
    <SameSecond state="disabled" />,
  );
  assert.ok(html.includes('data-state="disabled"'));
});

test('SameSecond · state=focus', () => {
  const html = renderToStaticMarkup(
    <SameSecond state="focus" />,
  );
  assert.ok(html.includes('data-state="focus"'));
});

test('SameSecond · state=active', () => {
  const html = renderToStaticMarkup(
    <SameSecond state="active" />,
  );
  assert.ok(html.includes('data-state="active"'));
});

test('SameSecond · state=success', () => {
  const html = renderToStaticMarkup(
    <SameSecond state="success" />,
  );
  assert.ok(html.includes('data-state="success"'));
});

test('SameSecond · state=hover', () => {
  const html = renderToStaticMarkup(
    <SameSecond state="hover" />,
  );
  assert.ok(html.includes('data-state="hover"'));
});
