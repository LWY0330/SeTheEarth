/* ============================================================
   看见地球 · v1.6 · momentTime.test.ts
   - Node 22+ 内置 test runner · 0 依赖
   - 覆盖：NOW/TODAY/PAST 三桶边界（0.5h / 1h / 2h / 24h / 30d）
   - DST / 未来时间 / 非法 tz / 非法日期 兜底
   ============================================================ */

// @ts-ignore -- node:test 类型声明缺失
import { test } from 'node:test';
// @ts-ignore -- node:assert/strict 类型声明缺失
import assert from 'node:assert/strict';
import {
  getMomentTimeBucket,
  getCurrentLocalHour,
  isSameLocalDay,
  NOW_WINDOW_HOURS,
} from './momentTime.ts';

/**
 * 固定 now = 2026-08-14T12:00:00Z
 * 测测城市: Kyoto (Asia/Tokyo UTC+9, no DST) → now = 21:00 local 8/14
 */
const NOW = new Date('2026-08-14T12:00:00Z');
const TZ = 'Asia/Tokyo';

/** 减 N 小时（毫秒） */
function hoursAgo(n: number, base: Date = NOW): string {
  return new Date(base.getTime() - n * 3_600_000).toISOString();
}

/** 减 N 天 */
function daysAgo(n: number, base: Date = NOW): string {
  return new Date(base.getTime() - n * 86_400_000).toISOString();
}

/* ---------- NOW 窗口 ---------- */

test('NOW · 0.5h 前（30 min）→ NOW', () => {
  assert.equal(getMomentTimeBucket(hoursAgo(0.5), TZ, NOW), 'NOW');
});

test('NOW · 1h 前（边界，包含）→ NOW', () => {
  // 1h 是 NOW 窗口上限（含等号）
  assert.equal(getMomentTimeBucket(hoursAgo(1), TZ, NOW), 'NOW');
});

test('NOW · 1.001h 前（超出边界）→ TODAY（同一日）', () => {
  // 1.001h 超出 NOW 窗口，但仍在当地自然日 → TODAY
  assert.equal(getMomentTimeBucket(hoursAgo(1.001), TZ, NOW), 'TODAY');
});

/* ---------- TODAY 桶 ---------- */

test('TODAY · 2h 前 → TODAY（窗口外但同日）', () => {
  assert.equal(getMomentTimeBucket(hoursAgo(2), TZ, NOW), 'TODAY');
});

test('TODAY · 6h 前 → TODAY（当地 15:00 仍是同自然日）', () => {
  // Tokyo 12:00 UTC = 21:00 local；6h 前 = 15:00 local 8/14
  assert.equal(getMomentTimeBucket(hoursAgo(6), TZ, NOW), 'TODAY');
});

test('TODAY · 23h 前 → TODAY（同自然日内）', () => {
  // 用 23:00 UTC = Tokyo 8/15 08:00 作为 lateNow；
  // 23h 前 = Tokyo 8/14 09:00（同自然日）→ 超出 NOW → TODAY
  const lateNow = new Date('2026-08-15T14:00:00Z'); // Tokyo 8/15 23:00 local
  const probe = hoursAgo(23, lateNow);
  assert.equal(getMomentTimeBucket(probe, TZ, lateNow), 'TODAY');
});

/* ---------- PAST 桶 ---------- */

test('PAST · 24h 前（跨日） → PAST', () => {
  // 24h 前 = 12:00 UTC 8/13 = 21:00 Tokyo 8/13 → 不同自然日
  assert.equal(getMomentTimeBucket(hoursAgo(24), TZ, NOW), 'PAST');
});

test('PAST · 30 天前 → PAST', () => {
  assert.equal(getMomentTimeBucket(daysAgo(30), TZ, NOW), 'PAST');
});

test('PAST · 1 年前 → PAST', () => {
  const oneYearAgo = new Date(NOW.getTime() - 365 * 86_400_000).toISOString();
  assert.equal(getMomentTimeBucket(oneYearAgo, TZ, NOW), 'PAST');
});

/* ---------- 防御性 ---------- */

test('防御 · 未来时间（+1h）→ PAST（不归入 NOW）', () => {
  const future = new Date(NOW.getTime() + 3_600_000).toISOString();
  assert.equal(getMomentTimeBucket(future, TZ, NOW), 'PAST');
});

test('防御 · 非法 ISO 字符串 → PAST（不抛错）', () => {
  assert.equal(getMomentTimeBucket('not-a-date', TZ, NOW), 'PAST');
});

test('防御 · 非法 tz 且超出窗口 → PAST（不抛错）', () => {
  // 用 5h 前，超出窗口触发 tz 校验
  assert.equal(getMomentTimeBucket(hoursAgo(5), 'Not/AReal_Zone', NOW), 'PAST');
});

/* ---------- DST 回归（关键回归测试） ---------- */

test('DST · America/New_York 跨夏令时 NOW 判定不漂移', () => {
  // 3 月 8 日 2026 是美东 DST 切换日（凌晨 2:00 → 3:00）
  // 选 DST 切换前后各 1h，确保 hoursAgo 计算正确
  const dstNow = new Date('2026-03-08T15:00:00Z'); // 美东 11:00 EDT
  const oneHourAgo = new Date(dstNow.getTime() - 3_600_000).toISOString();
  assert.equal(
    getMomentTimeBucket(oneHourAgo, 'America/New_York', dstNow),
    'NOW',
  );
});

test('DST · 跨夏令时 24h 前计算正确（夏令时多出 1 小时）', () => {
  // 选 DST 前 1 天 vs DST 后 1 天：纯 UTC 24h 但 DST 阶段 wall clock 不同
  // 这种情况下 hoursAgo 必须基于 UTC ms，不漂移
  const dstEnd = new Date('2026-11-01T15:00:00Z'); // 美东 10:00 EST (DST 已结束)
  const exactly24h = new Date(dstEnd.getTime() - 24 * 3_600_000).toISOString();
  const bucket = getMomentTimeBucket(exactly24h, 'America/New_York', dstEnd);
  // 24h 前 UTC 在夏令时期间 → 跨日 → PAST
  assert.equal(bucket, 'PAST');
});

/* ---------- 可配置 NOW 窗口 ---------- */

test('可配置 · nowWindowHours=3 时 2.5h 前仍在 NOW', () => {
  assert.equal(
    getMomentTimeBucket(hoursAgo(2.5), TZ, NOW, { nowWindowHours: 3 }),
    'NOW',
  );
});

test('可配置 · nowWindowHours=3 时 3.5h 前 → TODAY', () => {
  assert.equal(
    getMomentTimeBucket(hoursAgo(3.5), TZ, NOW, { nowWindowHours: 3 }),
    'TODAY',
  );
});

test('默认窗口常量 NOW_WINDOW_HOURS = 1', () => {
  assert.equal(NOW_WINDOW_HOURS, 1);
});

/* ---------- 跨 tz 边界 ---------- */

test('跨 tz · 同一 UTC 时刻在 Tokyo 是 TODAY，在 LA 是 PAST', () => {
  // 选 UTC 8/14 01:00:00
  const probe = new Date('2026-08-14T01:00:00Z').toISOString();
  // Tokyo 此时 10:00 8/14（同日，但已超过 1h 窗口 → TODAY）→ hoursAgo=11 → TODAY
  assert.equal(getMomentTimeBucket(probe, 'Asia/Tokyo', NOW), 'TODAY');
  // LA 此时 18:00 8/13（前一日，11h 前）→ PAST
  assert.equal(getMomentTimeBucket(probe, 'America/Los_Angeles', NOW), 'PAST');
});

/* ---------- isSameLocalDay ---------- */

test('isSameLocalDay · 同一 tz 同日 → true', () => {
  // 选两个都在 Tokyo 8/14 当地的 UTC 时刻
  // Tokyo 8/14 = UTC [8/13 15:00, 8/14 14:59]
  const a = new Date('2026-08-13T16:00:00Z'); // Tokyo 8/14 01:00
  const b = new Date('2026-08-14T10:00:00Z'); // Tokyo 8/14 19:00
  assert.equal(isSameLocalDay(a, b, 'Asia/Tokyo'), true);
});

test('isSameLocalDay · 跨日（Tokyo 8/14 vs 8/15）→ false', () => {
  const a = new Date('2026-08-14T10:00:00Z'); // Tokyo 8/14 19:00
  const b = new Date('2026-08-14T20:00:00Z'); // Tokyo 8/15 05:00
  assert.equal(isSameLocalDay(a, b, 'Asia/Tokyo'), false);
});

/* ---------- getCurrentLocalHour ---------- */

test('getCurrentLocalHour · Asia/Tokyo UTC 12:00 → 21', () => {
  assert.equal(getCurrentLocalHour('Asia/Tokyo', NOW), 21);
});

test('getCurrentLocalHour · America/Los_Angeles UTC 12:00 → 05（夏令时）', () => {
  // 8 月 LA 是 PDT (UTC-7)，12:00 UTC = 05:00 local
  assert.equal(getCurrentLocalHour('America/Los_Angeles', NOW), 5);
});

test('getCurrentLocalHour · 非法 tz → NaN', () => {
  assert.ok(Number.isNaN(getCurrentLocalHour('Not/Real', NOW)));
});
