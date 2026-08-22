/* ============================================================
   v1.6.4 · RevealMeta Component tests
   ============================================================ */

// @ts-nocheck -- node:test 类型声明缺失,runtime 需 Vitest/tsx 加载

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import { RevealMeta } from './RevealMeta';

test('RevealMeta · 基础 props 渲染', () => {
  const html = renderToStaticMarkup(
    <RevealMeta />,
  );
  assert.ok(html.includes('data-state="default"'));
});

test('RevealMeta · state=disabled', () => {
  const html = renderToStaticMarkup(
    <RevealMeta state="disabled" />,
  );
  assert.ok(html.includes('data-state="disabled"'));
});

test('RevealMeta · state=focus', () => {
  const html = renderToStaticMarkup(
    <RevealMeta state="focus" />,
  );
  assert.ok(html.includes('data-state="focus"'));
});

test('RevealMeta · state=active', () => {
  const html = renderToStaticMarkup(
    <RevealMeta state="active" />,
  );
  assert.ok(html.includes('data-state="active"'));
});

test('RevealMeta · state=success', () => {
  const html = renderToStaticMarkup(
    <RevealMeta state="success" />,
  );
  assert.ok(html.includes('data-state="success"'));
});

test('RevealMeta · state=hover', () => {
  const html = renderToStaticMarkup(
    <RevealMeta state="hover" />,
  );
  assert.ok(html.includes('data-state="hover"'));
});
