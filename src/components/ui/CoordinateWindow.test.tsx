/* ============================================================
   v1.6.4 · CoordinateWindow Component tests
   ============================================================ */

// @ts-nocheck -- node:test 类型声明缺失,runtime 需 Vitest/tsx 加载

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import { CoordinateWindow } from './CoordinateWindow';

test('CoordinateWindow · 基础 props 渲染', () => {
  const html = renderToStaticMarkup(
    <CoordinateWindow />,
  );
  assert.ok(html.includes('data-state="default"'));
});

test('CoordinateWindow · state=disabled', () => {
  const html = renderToStaticMarkup(
    <CoordinateWindow state="disabled" />,
  );
  assert.ok(html.includes('data-state="disabled"'));
});

test('CoordinateWindow · state=focus', () => {
  const html = renderToStaticMarkup(
    <CoordinateWindow state="focus" />,
  );
  assert.ok(html.includes('data-state="focus"'));
});

test('CoordinateWindow · state=active', () => {
  const html = renderToStaticMarkup(
    <CoordinateWindow state="active" />,
  );
  assert.ok(html.includes('data-state="active"'));
});

test('CoordinateWindow · state=success', () => {
  const html = renderToStaticMarkup(
    <CoordinateWindow state="success" />,
  );
  assert.ok(html.includes('data-state="success"'));
});

test('CoordinateWindow · state=hover', () => {
  const html = renderToStaticMarkup(
    <CoordinateWindow state="hover" />,
  );
  assert.ok(html.includes('data-state="hover"'));
});
