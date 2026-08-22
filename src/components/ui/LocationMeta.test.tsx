/* ============================================================
   v1.6.4 · LocationMeta Component tests
   ============================================================ */

// @ts-nocheck -- node:test 类型声明缺失,runtime 需 Vitest/tsx 加载

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import { LocationMeta } from './LocationMeta';

test('LocationMeta · 基础 props 渲染', () => {
  const html = renderToStaticMarkup(
    <LocationMeta />,
  );
  assert.ok(html.includes('data-state="default"'));
});

test('LocationMeta · state=disabled', () => {
  const html = renderToStaticMarkup(
    <LocationMeta state="disabled" />,
  );
  assert.ok(html.includes('data-state="disabled"'));
});

test('LocationMeta · state=focus', () => {
  const html = renderToStaticMarkup(
    <LocationMeta state="focus" />,
  );
  assert.ok(html.includes('data-state="focus"'));
});

test('LocationMeta · state=active', () => {
  const html = renderToStaticMarkup(
    <LocationMeta state="active" />,
  );
  assert.ok(html.includes('data-state="active"'));
});

test('LocationMeta · state=success', () => {
  const html = renderToStaticMarkup(
    <LocationMeta state="success" />,
  );
  assert.ok(html.includes('data-state="success"'));
});

test('LocationMeta · state=hover', () => {
  const html = renderToStaticMarkup(
    <LocationMeta state="hover" />,
  );
  assert.ok(html.includes('data-state="hover"'));
});
