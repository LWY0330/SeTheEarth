/* ============================================================
   v1.6.4 · WorldTimeRail Component tests
   ============================================================ */

// @ts-nocheck -- node:test 类型声明缺失,runtime 需 Vitest/tsx 加载

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import { WorldTimeRail } from './WorldTimeRail';

test('WorldTimeRail · 基础 props 渲染', () => {
  const html = renderToStaticMarkup(
    <WorldTimeRail />,
  );
  assert.ok(html.includes('data-state="default"'));
});

test('WorldTimeRail · state=disabled', () => {
  const html = renderToStaticMarkup(
    <WorldTimeRail state="disabled" />,
  );
  assert.ok(html.includes('data-state="disabled"'));
});

test('WorldTimeRail · state=focus', () => {
  const html = renderToStaticMarkup(
    <WorldTimeRail state="focus" />,
  );
  assert.ok(html.includes('data-state="focus"'));
});

test('WorldTimeRail · state=active', () => {
  const html = renderToStaticMarkup(
    <WorldTimeRail state="active" />,
  );
  assert.ok(html.includes('data-state="active"'));
});

test('WorldTimeRail · state=success', () => {
  const html = renderToStaticMarkup(
    <WorldTimeRail state="success" />,
  );
  assert.ok(html.includes('data-state="success"'));
});

test('WorldTimeRail · state=hover', () => {
  const html = renderToStaticMarkup(
    <WorldTimeRail state="hover" />,
  );
  assert.ok(html.includes('data-state="hover"'));
});
