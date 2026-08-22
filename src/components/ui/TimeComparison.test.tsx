/* ============================================================
   v1.6.4 · TimeComparison Component tests
   ============================================================ */

// @ts-nocheck -- node:test 类型声明缺失,runtime 需 Vitest/tsx 加载

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import { TimeComparison } from './TimeComparison';

test('TimeComparison · 基础 props 渲染', () => {
  const html = renderToStaticMarkup(
    <TimeComparison />,
  );
  assert.ok(html.includes('data-state="default"'));
});

test('TimeComparison · state=disabled', () => {
  const html = renderToStaticMarkup(
    <TimeComparison state="disabled" />,
  );
  assert.ok(html.includes('data-state="disabled"'));
});

test('TimeComparison · state=focus', () => {
  const html = renderToStaticMarkup(
    <TimeComparison state="focus" />,
  );
  assert.ok(html.includes('data-state="focus"'));
});

test('TimeComparison · state=active', () => {
  const html = renderToStaticMarkup(
    <TimeComparison state="active" />,
  );
  assert.ok(html.includes('data-state="active"'));
});

test('TimeComparison · state=success', () => {
  const html = renderToStaticMarkup(
    <TimeComparison state="success" />,
  );
  assert.ok(html.includes('data-state="success"'));
});

test('TimeComparison · state=hover', () => {
  const html = renderToStaticMarkup(
    <TimeComparison state="hover" />,
  );
  assert.ok(html.includes('data-state="hover"'));
});
