/* ============================================================
   v1.6.4 · SectionHeader Component tests
   ============================================================ */

// @ts-nocheck -- node:test 类型声明缺失,runtime 需 Vitest/tsx 加载

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import { SectionHeader } from './SectionHeader';

test('SectionHeader · 基础 props 渲染', () => {
  const html = renderToStaticMarkup(
    <SectionHeader />,
  );
  assert.ok(html.includes('data-state="default"'));
});

test('SectionHeader · state=disabled', () => {
  const html = renderToStaticMarkup(
    <SectionHeader state="disabled" />,
  );
  assert.ok(html.includes('data-state="disabled"'));
});

test('SectionHeader · state=focus', () => {
  const html = renderToStaticMarkup(
    <SectionHeader state="focus" />,
  );
  assert.ok(html.includes('data-state="focus"'));
});

test('SectionHeader · state=active', () => {
  const html = renderToStaticMarkup(
    <SectionHeader state="active" />,
  );
  assert.ok(html.includes('data-state="active"'));
});

test('SectionHeader · state=success', () => {
  const html = renderToStaticMarkup(
    <SectionHeader state="success" />,
  );
  assert.ok(html.includes('data-state="success"'));
});

test('SectionHeader · state=hover', () => {
  const html = renderToStaticMarkup(
    <SectionHeader state="hover" />,
  );
  assert.ok(html.includes('data-state="hover"'));
});
