/* ============================================================
   v1.6.4 · DistanceNavigation Component tests
   ============================================================ */

// @ts-nocheck -- node:test 类型声明缺失,runtime 需 Vitest/tsx 加载

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import { DistanceNavigation } from './DistanceNavigation';

test('DistanceNavigation · 基础 props 渲染', () => {
  const html = renderToStaticMarkup(
    <DistanceNavigation />,
  );
  assert.ok(html.includes('data-state="default"'));
});

test('DistanceNavigation · state=disabled', () => {
  const html = renderToStaticMarkup(
    <DistanceNavigation state="disabled" />,
  );
  assert.ok(html.includes('data-state="disabled"'));
});

test('DistanceNavigation · state=focus', () => {
  const html = renderToStaticMarkup(
    <DistanceNavigation state="focus" />,
  );
  assert.ok(html.includes('data-state="focus"'));
});

test('DistanceNavigation · state=active', () => {
  const html = renderToStaticMarkup(
    <DistanceNavigation state="active" />,
  );
  assert.ok(html.includes('data-state="active"'));
});

test('DistanceNavigation · state=success', () => {
  const html = renderToStaticMarkup(
    <DistanceNavigation state="success" />,
  );
  assert.ok(html.includes('data-state="success"'));
});

test('DistanceNavigation · state=hover', () => {
  const html = renderToStaticMarkup(
    <DistanceNavigation state="hover" />,
  );
  assert.ok(html.includes('data-state="hover"'));
});
