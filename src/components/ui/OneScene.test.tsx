/* ============================================================
   v1.6.4 · OneScene Component tests
   ============================================================ */

// @ts-nocheck -- node:test 类型声明缺失,runtime 需 Vitest/tsx 加载

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import { OneScene } from './OneScene';

test('OneScene · 基础 props 渲染', () => {
  const html = renderToStaticMarkup(
    <OneScene />,
  );
  assert.ok(html.includes('data-state="default"'));
});

test('OneScene · state=disabled', () => {
  const html = renderToStaticMarkup(
    <OneScene state="disabled" />,
  );
  assert.ok(html.includes('data-state="disabled"'));
});

test('OneScene · state=focus', () => {
  const html = renderToStaticMarkup(
    <OneScene state="focus" />,
  );
  assert.ok(html.includes('data-state="focus"'));
});

test('OneScene · state=active', () => {
  const html = renderToStaticMarkup(
    <OneScene state="active" />,
  );
  assert.ok(html.includes('data-state="active"'));
});

test('OneScene · state=success', () => {
  const html = renderToStaticMarkup(
    <OneScene state="success" />,
  );
  assert.ok(html.includes('data-state="success"'));
});

test('OneScene · state=hover', () => {
  const html = renderToStaticMarkup(
    <OneScene state="hover" />,
  );
  assert.ok(html.includes('data-state="hover"'));
});
