/* ============================================================
   看见地球 · v1.6 · cityState.test.ts
   - getCityStateLevel L0-L4 推导
   - getCityPageState   A-E 推导
   - 边界：L2 → L3 → L4 升级、today 跨日 D、E_empty 兜底
   ============================================================ */

// @ts-ignore -- node:test 类型声明缺失
import { test } from 'node:test';
// @ts-ignore -- node:assert/strict 类型声明缺失
import assert from 'node:assert/strict';
import type {
  City,
  CityStateLevel,
  CityPageState,
  MomentStats,
} from '@/types';
import {
  getCityStateLevel,
  getCityPageState,
  getCityStateSnapshot,
  getCityStateSnapshots,
} from './cityState.ts';

const NOW = new Date('2026-08-14T12:00:00Z'); // Tokyo 21:00 local 8/14

/** 工厂：造一个最小 City */
function makeCity(overrides: Partial<City> = {}): City {
  return {
    identity: {
      city_id: 'tokyo',
      canonical_name: 'Tokyo',
      country_code: 'JP',
      country_name: 'Japan',
      place_type: 'city',
      latitude: 35.6762,
      longitude: 139.6503,
      timezone: 'Asia/Tokyo',
    },
    state_level: 'L0_mapped',
    page_state: 'E_empty',
    ...overrides,
  };
}

/** 工厂：造一个 MomentStats */
function makeStats(overrides: Partial<MomentStats> = {}): MomentStats {
  return {
    moments_total: 1,
    moments_last_24h: 0,
    moments_last_7d: 0,
    moments_last_30d: 0,
    ...overrides,
  };
}

/* ---------- L0 ---------- */

test('L0 · 无 moment_stats → L0_mapped', () => {
  assert.equal(getCityStateLevel(makeCity()), 'L0_mapped');
});

test('L0 · moment_stats 但 moments_total = 0 → L0_mapped', () => {
  const city = makeCity({ moment_stats: makeStats({ moments_total: 0 }) });
  assert.equal(getCityStateLevel(city), 'L0_mapped');
});

/* ---------- L2 ---------- */

test('L2 · moments_total = 1 但 last_7d = 0 → L2_witnessed', () => {
  const city = makeCity({ moment_stats: makeStats({ moments_total: 1 }) });
  assert.equal(getCityStateLevel(city), 'L2_witnessed');
});

/* ---------- L3 ---------- */

test('L3 · moments_last_7d > 0 → L3_active', () => {
  const city = makeCity({
    moment_stats: makeStats({
      moments_total: 5,
      moments_last_7d: 2,
      moments_last_24h: 1,
    }),
  });
  assert.equal(getCityStateLevel(city), 'L3_active');
});

/* ---------- L4 ---------- */

test('L4 · witnessed_days_last_30d ≥ 7 → L4_living_archive', () => {
  const city = makeCity({
    moment_stats: makeStats({
      moments_total: 100,
      moments_last_7d: 2,
      moments_last_24h: 1,
      witnessed_days_last_30d: 14,
    }),
  });
  assert.equal(getCityStateLevel(city), 'L4_living_archive');
});

/* ---------- 前台 E ---------- */

test('E · 无 stats → E_empty', () => {
  assert.equal(getCityPageState(makeCity(), NOW), 'E_empty');
});

test('E · stats.moments_total = 0 → E_empty', () => {
  const city = makeCity({ moment_stats: makeStats({ moments_total: 0 }) });
  assert.equal(getCityPageState(city, NOW), 'E_empty');
});

/* ---------- 前台 D ---------- */

test('D · last_moment_at = 30 天前 → D_past_only', () => {
  const city = makeCity({
    moment_stats: makeStats({
      moments_total: 5,
      last_moment_at: '2026-07-15T10:00:00Z', // 30 天前
    }),
  });
  assert.equal(getCityPageState(city, NOW), 'D_past_only');
});

/* ---------- 前台 C ---------- */

test('C · 今日 1 个 Moment（非 seed）→ C_low_activity', () => {
  const city = makeCity({
    moment_stats: makeStats({
      moments_total: 10,
      moments_last_24h: 1,
      last_moment_at: '2026-08-14T01:00:00Z', // today Tokyo
    }),
  });
  assert.equal(getCityPageState(city, NOW), 'C_low_activity');
});

test('C · 今日 2 个 Moment（非 seed）→ C_low_activity（< 3 阈值）', () => {
  const city = makeCity({
    moment_stats: makeStats({
      moments_total: 10,
      moments_last_24h: 2,
      last_moment_at: '2026-08-14T05:00:00Z',
    }),
  });
  assert.equal(getCityPageState(city, NOW), 'C_low_activity');
});

/* ---------- 前台 B ---------- */

test('B · 今日 ≥ 3 Moment（非 seed）→ B_active', () => {
  const city = makeCity({
    moment_stats: makeStats({
      moments_total: 50,
      moments_last_24h: 5,
      last_moment_at: '2026-08-14T10:00:00Z',
    }),
  });
  assert.equal(getCityPageState(city, NOW), 'B_active');
});

/* ---------- 前台 A ---------- */

test('A · visual_status=seed + 今日 ≥ 3 Moment → A_seed_editorial', () => {
  const city = makeCity({
    visual: { visual_status: 'seed' },
    moment_stats: makeStats({
      moments_total: 50,
      moments_last_24h: 10,
      last_moment_at: '2026-08-14T10:00:00Z',
    }),
  });
  assert.equal(getCityPageState(city, NOW), 'A_seed_editorial');
});

test('A · visual_status=seed 即使今日 0 Moment → 仍是 D_past_only（seed 不豁免 today 检查）', () => {
  // A 的优先级在 "today check 之后"；seed city 今天没 Moment 也是 D
  const city = makeCity({
    visual: { visual_status: 'seed' },
    moment_stats: makeStats({
      moments_total: 100,
      last_moment_at: '2026-08-10T10:00:00Z',
    }),
  });
  assert.equal(getCityPageState(city, NOW), 'D_past_only');
});

/* ---------- 跨 tz 边界 ---------- */

test('跨 tz · Tokyo today 算 today，LA today 算 PAST', () => {
  // now = 8/14 12:00 UTC = Tokyo 8/14 21:00 / LA 8/14 05:00
  const lastTokyo = '2026-08-14T01:00:00Z'; // Tokyo 10:00 (today)
  const lastLA = '2026-08-14T05:00:00Z';    // LA 8/13 22:00 (yesterday in LA)
  // Kyoto city 用 Asia/Tokyo
  const cityTokyo = makeCity({
    identity: {
      city_id: 'tokyo',
      canonical_name: 'Tokyo',
      country_code: 'JP',
      country_name: 'Japan',
      place_type: 'city',
      latitude: 35.6762,
      longitude: 139.6503,
      timezone: 'Asia/Tokyo',
    },
    moment_stats: makeStats({
      moments_total: 5,
      moments_last_24h: 1,
      last_moment_at: lastTokyo,
    }),
  });
  assert.equal(getCityPageState(cityTokyo, NOW), 'C_low_activity');

  // LA city 用 America/Los_Angeles
  const cityLA = makeCity({
    identity: {
      city_id: 'la',
      canonical_name: 'Los Angeles',
      country_code: 'US',
      country_name: 'United States',
      place_type: 'city',
      latitude: 34.0522,
      longitude: -118.2437,
      timezone: 'America/Los_Angeles',
    },
    moment_stats: makeStats({
      moments_total: 5,
      moments_last_24h: 1,
      last_moment_at: lastLA,
    }),
  });
  assert.equal(getCityPageState(cityLA, NOW), 'D_past_only');
});

/* ---------- 联合 snapshot ---------- */

test('getCityStateSnapshot · 同时返回 L0 + E', () => {
  const snap = getCityStateSnapshot(makeCity(), NOW);
  assert.equal(snap.state_level, 'L0_mapped');
  assert.equal(snap.page_state, 'E_empty');
});

test('getCityStateSnapshot · 同时返回 L3 + B', () => {
  const city = makeCity({
    moment_stats: makeStats({
      moments_total: 50,
      moments_last_7d: 2,
      moments_last_24h: 5,
      last_moment_at: '2026-08-14T10:00:00Z',
    }),
  });
  const snap = getCityStateSnapshot(city, NOW);
  assert.equal(snap.state_level, 'L3_active');
  assert.equal(snap.page_state, 'B_active');
});

/* ---------- 批量 ---------- */

test('getCityStateSnapshots · 3 城独立计算', () => {
  const cities = [
    makeCity({
      identity: {
        city_id: 'a',
        canonical_name: 'A',
        country_code: 'XX',
        country_name: 'X',
        place_type: 'city',
        latitude: 0,
        longitude: 0,
        timezone: 'UTC',
      },
    }),
    makeCity({
      identity: {
        city_id: 'b',
        canonical_name: 'B',
        country_code: 'XX',
        country_name: 'X',
        place_type: 'city',
        latitude: 0,
        longitude: 0,
        timezone: 'UTC',
      },
      moment_stats: makeStats({ moments_total: 10 }),
    }),
    makeCity({
      identity: {
        city_id: 'c',
        canonical_name: 'C',
        country_code: 'XX',
        country_name: 'X',
        place_type: 'city',
        latitude: 0,
        longitude: 0,
        timezone: 'UTC',
      },
      moment_stats: makeStats({
        moments_total: 100,
        moments_last_7d: 1,
        moments_last_24h: 4,
        last_moment_at: '2026-08-14T01:00:00Z',
      }),
    }),
  ];
  const out = getCityStateSnapshots(cities, NOW);
  assert.equal(out.size, 3);
  const a = out.get('a');
  const b = out.get('b');
  const c = out.get('c');
  assert.equal(a?.state_level satisfies string | undefined, 'L0_mapped' satisfies CityStateLevel);
  assert.equal(a?.page_state, 'E_empty');
  assert.equal(b?.state_level, 'L2_witnessed');
  assert.equal(b?.page_state, 'D_past_only');
  assert.equal(c?.state_level, 'L3_active');
  assert.equal(c?.page_state, 'B_active' satisfies CityPageState);
});

/* ---------- 防御性 ---------- */

test('防御 · last_moment_at = 非法 ISO → 当作无今日 Moment', () => {
  const city = makeCity({
    moment_stats: makeStats({
      moments_total: 5,
      last_moment_at: 'not-a-date',
    }),
  });
  assert.equal(getCityPageState(city, NOW), 'D_past_only');
});
