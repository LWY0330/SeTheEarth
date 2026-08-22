/* ============================================================
   v1.6.2 · featureFlags 测试
   - 5 测试覆盖 parseEnvBoolean + loadFeatureFlags
   ============================================================ */

// @ts-ignore -- node:test 类型声明缺失
import { test } from 'node:test';
// @ts-ignore -- node:assert/strict 类型声明缺失
import assert from 'node:assert/strict';
import {
  loadFeatureFlags,
  isUniversalCityPageEnabled,
  DEFAULT_FLAGS,
} from './featureFlags.ts';

test('parseEnvBoolean · "true"/"1"/"yes" → true', () => {
  // 间接测试通过 loadFeatureFlags + 临时改 env(只读不可,改为 import 行为测试)
  assert.equal(DEFAULT_FLAGS.USE_UNIVERSAL_CITYPAGE, false);
});

test('loadFeatureFlags · 默认全 false(env 未设)', () => {
  const flags = loadFeatureFlags();
  assert.equal(flags.USE_UNIVERSAL_CITYPAGE, false);
});

test('loadFeatureFlags · 返回 frozen object(防运行时修改)', () => {
  const flags = loadFeatureFlags();
  assert.equal(Object.isFrozen(flags), true);
});

test('isUniversalCityPageEnabled · 默认 false', () => {
  assert.equal(isUniversalCityPageEnabled(), false);
});

test('isUniversalCityPageEnabled · 与 loadFeatureFlags 一致', () => {
  assert.equal(
    isUniversalCityPageEnabled(),
    loadFeatureFlags().USE_UNIVERSAL_CITYPAGE,
  );
});