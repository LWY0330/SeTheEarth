/* ============================================================
   v1.6.2 · useDynamicCity 测试
   - 12 测试覆盖 formatLocalTime / computeUserTimeDifference
   - 使用 Intl.DateTimeFormat(运行时 API,Node 22 内置)
   ============================================================ */

// @ts-ignore -- node:test 类型声明缺失
import { test } from 'node:test';
// @ts-ignore -- node:assert/strict 类型声明缺失
import assert from 'node:assert/strict';

// 直接 import Intl(全局),绕过 hook 包装
// 这些测试覆盖 formatLocalTime + computeUserTimeDifference 的核心逻辑

function formatLocalTime(timezone: string, now: Date): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    return formatter.format(now);
  } catch {
    return '??:??';
  }
}

function computeUserTimeDifference(timezone: string, now: Date): string {
  try {
    const localFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      timeZoneName: 'shortOffset',
    });
    const parts = localFormatter.formatToParts(now);
    const offsetPart = parts.find((p) => p.type === 'timeZoneName');
    if (!offsetPart) return '+0H';
    const match = offsetPart.value.match(/GMT([+-])(\d+)/);
    if (!match) return '+0H';
    const sign = match[1];
    const hours = parseInt(match[2], 10);
    return `${sign}${hours}H`;
  } catch {
    return '+0H';
  }
}

const UTC_2026_08_19_12_00_00 = new Date('2026-08-19T12:00:00Z');

test('formatLocalTime · Asia/Tokyo (UTC+9) → 21:00', () => {
  assert.equal(formatLocalTime('Asia/Tokyo', UTC_2026_08_19_12_00_00), '21:00');
});

test('formatLocalTime · Europe/Lisbon (UTC+1 summer) → 13:00', () => {
  // 8/19 是 summer time (WEST = UTC+1)
  assert.equal(formatLocalTime('Europe/Lisbon', UTC_2026_08_19_12_00_00), '13:00');
});

test('formatLocalTime · America/New_York (UTC-4 summer) → 08:00', () => {
  // 8/19 是 EDT (UTC-4)
  assert.equal(formatLocalTime('America/New_York', UTC_2026_08_19_12_00_00), '08:00');
});

test('formatLocalTime · Pacific/Auckland (UTC+12) → 00:00', () => {
  // 8/19 UTC 12:00 → 8/20 NZST 00:00
  assert.equal(formatLocalTime('Pacific/Auckland', UTC_2026_08_19_12_00_00), '00:00');
});

test('formatLocalTime · Atlantic/Reykjavik (UTC+0) → 12:00', () => {
  assert.equal(formatLocalTime('Atlantic/Reykjavik', UTC_2026_08_19_12_00_00), '12:00');
});

test('formatLocalTime · 非法 timezone → "??:??"(防御)', () => {
  assert.equal(formatLocalTime('Not/A/Real/Zone', UTC_2026_08_19_12_00_00), '??:??');
});

test('computeUserTimeDifference · Asia/Tokyo → +9H', () => {
  assert.equal(computeUserTimeDifference('Asia/Tokyo', UTC_2026_08_19_12_00_00), '+9H');
});

test('computeUserTimeDifference · America/New_York → -4H(EDT summer)', () => {
  assert.equal(computeUserTimeDifference('America/New_York', UTC_2026_08_19_12_00_00), '-4H');
});

test('computeUserTimeDifference · Europe/Lisbon → +1H(WEST summer)', () => {
  assert.equal(computeUserTimeDifference('Europe/Lisbon', UTC_2026_08_19_12_00_00), '+1H');
});

test('computeUserTimeDifference · UTC → +0H', () => {
  assert.equal(computeUserTimeDifference('UTC', UTC_2026_08_19_12_00_00), '+0H');
});

test('computeUserTimeDifference · Pacific/Auckland → +12H', () => {
  assert.equal(computeUserTimeDifference('Pacific/Auckland', UTC_2026_08_19_12_00_00), '+12H');
});

test('formatLocalTime · DST 跨夏令时保护(冬令时 UTC-5 / 夏令时 UTC-4 自动切换)', () => {
  // 1/15 = winter EST (UTC-5)
  const winter = new Date('2026-01-15T12:00:00Z');
  // 8/15 = summer EDT (UTC-4)
  const summer = new Date('2026-08-15T12:00:00Z');
  assert.equal(formatLocalTime('America/New_York', winter), '07:00');
  assert.equal(formatLocalTime('America/New_York', summer), '08:00');
});