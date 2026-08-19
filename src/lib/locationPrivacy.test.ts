/* ============================================================
   看见地球 · v1.6 · locationPrivacy.test.ts
   - toPublicCityLocation 不暴露 raw_location
   - canAccessRawLocation 权限矩阵 (public/witness/moderator/admin)
   - Witness 仅访问自己上传 moment 的 raw_location
   ============================================================ */

// @ts-ignore -- node:test
import { test } from 'node:test';
// @ts-ignore -- node:assert/strict
import assert from 'node:assert/strict';
import type { City, Moment } from '@/types';
import {
  toPublicCityLocation,
  toFullLocation,
  toFullMomentLocation,
  canAccessRawLocation,
  canAccessCityRawCoords,
  getRawLocationSafely,
} from './locationPrivacy.ts';

const city: City = {
  identity: {
    city_id: 'khartoum',
    canonical_name: 'Khartoum',
    local_name: 'الخرطوم',
    alternate_names: ['Khartum', 'Al-Khartum'],
    country_code: 'SD',
    country_name: 'Sudan',
    admin1_code: 'Khartoum',
    admin1_name: 'Khartoum',
    place_type: 'city',
    latitude: 15.5007,
    longitude: 32.5599,
    timezone: 'Africa/Khartoum',
  },
  state_level: 'L2_witnessed',
  page_state: 'C_low_activity',
};

const moment: Moment = {
  moment_id: 'm-001',
  media: { url: 'https://example.com/m-001.jpg', type: 'image', width: 1200, height: 800, alt: 'Nile sunset' },
  media_type: 'image',
  captured_at: '2026-08-14T18:30:00+02:00',
  uploaded_at: '2026-08-14T19:00:00Z',
  published_at: '2026-08-14T19:05:00Z',
  city_id: 'khartoum',
  public_city_name: 'Khartoum',
  raw_location: { latitude: 15.5007, longitude: 32.5599, accuracy_m: 8 },
  witness_id: 'witness-A',
  caption: '尼罗河上的日落',
  provenance_status: 'self_reported',
  moderation_status: 'approved',
  rights_status: 'cc_by',
  created_at: '2026-08-14T19:00:00Z',
  updated_at: '2026-08-14T19:00:00Z',
};

/* ---------- toPublicCityLocation ---------- */

test('toPublicCityLocation · 不暴露 latitude / longitude', () => {
  const pub = toPublicCityLocation(city);
  assert.equal((pub as unknown as { latitude?: number }).latitude, undefined);
  assert.equal((pub as unknown as { longitude?: number }).longitude, undefined);
  assert.equal((pub as unknown as { timezone?: string }).timezone, undefined);
});

test('toPublicCityLocation · 不暴露 alternate_names / local_name', () => {
  const pub = toPublicCityLocation(city);
  assert.equal((pub as unknown as { alternate_names?: unknown[] }).alternate_names, undefined);
  assert.equal((pub as unknown as { local_name?: string }).local_name, undefined);
});

test('toPublicCityLocation · 包含 city_id / canonical_name / country_code / country_name', () => {
  const pub = toPublicCityLocation(city);
  assert.equal(pub.city_id, 'khartoum');
  assert.equal(pub.public_city_name, 'Khartoum');
  assert.equal(pub.country_code, 'SD');
  assert.equal(pub.country_name, 'Sudan');
  assert.equal(pub.admin1_name, 'Khartoum');
});

/* ---------- toFullLocation ---------- */

test('toFullLocation · 含 raw_coordinates 与 timezone', () => {
  const full = toFullLocation(city);
  assert.equal(full.timezone, 'Africa/Khartoum');
  assert.equal(full.raw_coordinates.latitude, 15.5007);
  assert.equal(full.raw_coordinates.longitude, 32.5599);
});

test('toFullMomentLocation · 拼接 moment_id + raw_moment_location', () => {
  const fm = toFullMomentLocation(city, moment);
  assert.equal(fm.moment_id, 'm-001');
  assert.equal(fm.raw_moment_location?.latitude, 15.5007);
  assert.equal(fm.raw_moment_location?.accuracy_m, 8);
});

/* ---------- canAccessRawLocation ---------- */

test('权限 · public → 永远 false', () => {
  assert.equal(canAccessRawLocation({ role: 'public' }, { moment }), false);
  assert.equal(canAccessRawLocation({ role: 'public' }, { city }), false);
});

test('权限 · witness 看自己的 moment → true', () => {
  assert.equal(
    canAccessRawLocation({ role: 'witness', witnessId: 'witness-A' }, { moment }),
    true,
  );
});

test('权限 · witness 看别人的 moment → false', () => {
  assert.equal(
    canAccessRawLocation({ role: 'witness', witnessId: 'witness-B' }, { moment }),
    false,
  );
});

test('权限 · witness 没指定 moment（只问 city）→ false', () => {
  // Witness 不能 city raw coords
  assert.equal(
    canAccessRawLocation({ role: 'witness', witnessId: 'witness-A' }, { city }),
    false,
  );
});

test('权限 · witness 没填 witnessId → false', () => {
  assert.equal(
    canAccessRawLocation({ role: 'witness' }, { moment }),
    false,
  );
});

test('权限 · moderator → 永远 true', () => {
  assert.equal(canAccessRawLocation({ role: 'moderator' }, { moment }), true);
  assert.equal(canAccessRawLocation({ role: 'moderator' }, { city }), true);
});

test('权限 · admin → 永远 true', () => {
  assert.equal(canAccessRawLocation({ role: 'admin' }, { moment }), true);
  assert.equal(canAccessRawLocation({ role: 'admin' }, { city }), true);
});

/* ---------- canAccessCityRawCoords ---------- */

test('canAccessCityRawCoords · public / witness → false', () => {
  assert.equal(canAccessCityRawCoords({ role: 'public' }), false);
  assert.equal(canAccessCityRawCoords({ role: 'witness', witnessId: 'w-A' }), false);
});

test('canAccessCityRawCoords · moderator / admin → true', () => {
  assert.equal(canAccessCityRawCoords({ role: 'moderator' }), true);
  assert.equal(canAccessCityRawCoords({ role: 'admin' }), true);
});

/* ---------- getRawLocationSafely ---------- */

test('getRawLocationSafely · 有权限 → 返回 raw_location', () => {
  const raw = getRawLocationSafely({ role: 'moderator' }, moment);
  assert.equal(raw?.latitude, 15.5007);
});

test('getRawLocationSafely · 无权限 → 返回 undefined', () => {
  const raw = getRawLocationSafely({ role: 'public' }, moment);
  assert.equal(raw, undefined);
});

test('getRawLocationSafely · witness 看自己 moment → 返回', () => {
  const raw = getRawLocationSafely({ role: 'witness', witnessId: 'witness-A' }, moment);
  assert.equal(raw?.latitude, 15.5007);
});

test('getRawLocationSafely · witness 看别人 moment → undefined', () => {
  const raw = getRawLocationSafely({ role: 'witness', witnessId: 'witness-Z' }, moment);
  assert.equal(raw, undefined);
});
