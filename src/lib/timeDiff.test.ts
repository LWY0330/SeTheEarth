/* ============================================================
   看见地球 · v1.4 · timeDiff.test.ts (PR #29 a11y 补完)
   - Node 22+ 内置 test runner · 0 依赖 · --experimental-strip-types
   - 跑法：npm run test
   - 覆盖：5 个 export 函数 + DST 跨午夜回归
   ============================================================ */

// v1.4 · 项目未装 @types/node；用 @ts-ignore 抑制 import 报错
// Node 22+ 内置 test runner · 运行时通过 node --test 解析
// @ts-ignore -- node:test 类型声明缺失
import { test } from 'node:test';
// @ts-ignore -- node:assert/strict 类型声明缺失
import assert from 'node:assert/strict';
import {
  getLocalTimeInTz,
  getTzAbbrev,
  getTimeDiffHours,
  formatTimeDiff,
  formatTempDiff,
} from './timeDiff.ts';

// 固定一个 UTC 时刻，避免 wall clock 漂移
const NOON_UTC = new Date('2026-08-14T12:00:00Z');

test('getLocalTimeInTz · Asia/Tokyo (UTC+9) = 21:00:00', () => {
  assert.equal(getLocalTimeInTz('Asia/Tokyo', NOON_UTC), '21:00:00');
});

test('getLocalTimeInTz · America/New_York (UTC-4 夏令时) = 08:00:00', () => {
  assert.equal(getLocalTimeInTz('America/New_York', NOON_UTC), '08:00:00');
});

test('getLocalTimeInTz · invalid tz 返回 --:--:--', () => {
  assert.equal(getLocalTimeInTz('Not/AReal_Zone', NOON_UTC), '--:--:--');
});

test('getTzAbbrev · Asia/Tokyo 返回 JST', () => {
  // 注：不同 Node 版本可能返回 'JST' / 'GMT+9'，只断言非空
  const abbr = getTzAbbrev('Asia/Tokyo', NOON_UTC);
  assert.ok(abbr.length > 0, `expected non-empty abbr, got "${abbr}"`);
});

test('getTimeDiffHours · 同 tz 返回 0', () => {
  assert.equal(getTimeDiffHours('Asia/Shanghai', 'Asia/Shanghai', NOON_UTC), 0);
});

test('getTimeDiffHours · Shanghai → Tokyo = -1', () => {
  // Shanghai UTC+8, Tokyo UTC+9; Tokyo 时间更晚 → tzA 落后 →负
  assert.equal(getTimeDiffHours('Asia/Shanghai', 'Asia/Tokyo', NOON_UTC), -1);
});

test('getTimeDiffHours · Shanghai → New York ≈ +12（夏令时）', () => {
  // 函数语义：tzA 比 tzB 早多少小时（+ 表示 tzA 在前，- 表示 tzA 在后）
  // Shanghai UTC+8, NY UTC-4 (夏令时) → Shanghai 在 NYC 前 12h → 返回 +12
  // 关键回归：DST 跨午夜计算正确（v1.3 bug 是 -11/-12 漂移）
  const diff = getTimeDiffHours('Asia/Shanghai', 'America/New_York', NOON_UTC);
  assert.ok(Math.abs(diff - 12) < 0.1, `expected ≈ +12, got ${diff}`);
});

test('getTimeDiffHours · Shanghai → Auckland ≈ -4（夏令时）', () => {
  // Auckland UTC+13（夏令时 8-14 期间），Shanghai UTC+8 → 差 -5 或 -4
  const diff = getTimeDiffHours('Asia/Shanghai', 'Pacific/Auckland', NOON_UTC);
  assert.ok(diff === -4 || diff === -5, `expected -4 or -5, got ${diff}`);
});

test('getTimeDiffHours · invalid tz 返回 0（不抛错）', () => {
  assert.equal(getTimeDiffHours('Not/Real', 'Asia/Tokyo', NOON_UTC), 0);
});

test('formatTimeDiff · 0 → "0h"', () => {
  assert.equal(formatTimeDiff(0), '0h');
});

test('formatTimeDiff · 正整数 +5 → "+5h"', () => {
  assert.equal(formatTimeDiff(5), '+5h');
});

test('formatTimeDiff · 负整数 -3 → "-3h"', () => {
  assert.equal(formatTimeDiff(-3), '-3h');
});

test('formatTimeDiff · 小数 +1.5 → "+1.5h"', () => {
  assert.equal(formatTimeDiff(1.5), '+1.5h');
});

test('formatTempDiff · 正数 +12 → "+12°C"', () => {
  assert.equal(formatTempDiff(12), '+12°C');
});

test('formatTempDiff · 负小数 -5.7 → "-6°C"（四舍五入）', () => {
  assert.equal(formatTempDiff(-5.7), '-6°C');
});
