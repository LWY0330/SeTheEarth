/* ============================================================
   v1.6.4 · EchoInput Component tests
   ============================================================ */

// @ts-nocheck -- node:test 类型声明缺失,runtime 需 Vitest/tsx 加载

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import { EchoInput } from './EchoInput';

test('EchoInput · 基础 props 渲染', () => {
  const html = renderToStaticMarkup(
    <EchoInput />,
  );
  assert.ok(html.includes('data-state="default"'));
});

test('EchoInput · state=disabled', () => {
  const html = renderToStaticMarkup(
    <EchoInput state="disabled" />,
  );
  assert.ok(html.includes('data-state="disabled"'));
});

test('EchoInput · state=focus', () => {
  const html = renderToStaticMarkup(
    <EchoInput state="focus" />,
  );
  assert.ok(html.includes('data-state="focus"'));
});

test('EchoInput · state=active', () => {
  const html = renderToStaticMarkup(
    <EchoInput state="active" />,
  );
  assert.ok(html.includes('data-state="active"'));
});

test('EchoInput · state=success', () => {
  const html = renderToStaticMarkup(
    <EchoInput state="success" />,
  );
  assert.ok(html.includes('data-state="success"'));
});

test('EchoInput · state=hover', () => {
  const html = renderToStaticMarkup(
    <EchoInput state="hover" />,
  );
  assert.ok(html.includes('data-state="hover"'));
});
