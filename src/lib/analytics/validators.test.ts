/* ============================================================
   SEE EARTH V1 · E-P0-07 Analytics · Validators unit tests
   ------------------------------------------------------------
   - Uses Node's built-in test runner (matches existing project test runner).
   - Tests:
       * forbidden field names dropped (F-01..F-30 sample)
       * PII regex detection (email / phone / IPv4)
       * whitelist enforcement
       * submission_id hash shape validation
   ============================================================ */

// @ts-ignore -- node:test
import { test } from 'node:test';
// @ts-ignore -- node:assert/strict
import assert from 'node:assert/strict';
import { validateEventPayload } from './validators.ts';

test('drops forbidden field "latitude" (F-01)', () => {
  const r = validateEventPayload('edition_viewed', {
    edition_id: 'ed_2026_08_22',
    app_surface: 'web_homepage',
    latitude: 35.0116,
  });
  assert.equal(r.ok, false, 'should fail validation');
  assert.equal(r.hard_rejected, true, 'should be hard rejected (PII-like field)');
  assert.ok(
    r.rejections.some((x) => x.reason_code === 'F-01'),
    'rejection must reference F-01',
  );
});

test('drops forbidden field "exif" (F-11)', () => {
  const r = validateEventPayload('witness_submitted', {
    submission_id: 'a3f9b2c1',
    location_mode: 'auto_gps_city',
    exif: { gps: true },
  });
  assert.equal(r.hard_rejected, true);
  assert.ok(r.rejections.some((x) => x.reason_code === 'F-11'));
});

test('drops forbidden field "user_agent" (F-25)', () => {
  const r = validateEventPayload('edition_viewed', {
    edition_id: 'ed_x',
    app_surface: 'web_homepage',
    user_agent: 'Mozilla/5.0 ...',
  });
  assert.equal(r.hard_rejected, true);
  assert.ok(r.rejections.some((x) => x.reason_code === 'F-25'));
});

test('drops PII value (email)', () => {
  // We attach PII to a whitelisted field by adding it via the props bag — the
  // sanitiser must reject the value even if the key is whitelisted.
  // Use edition_id (whitelisted) containing an email-like value.
  const r = validateEventPayload('edition_viewed', {
    edition_id: 'lwy@example.com',
    app_surface: 'web_homepage',
  });
  assert.equal(r.hard_rejected, true);
  assert.ok(r.rejections.some((x) => x.reason_code === 'PII_PATTERN'));
});

test('drops PII value (IPv4)', () => {
  const r = validateEventPayload('edition_viewed', {
    edition_id: '192.168.0.1',
    app_surface: 'web_homepage',
  });
  assert.equal(r.hard_rejected, true);
  assert.ok(r.rejections.some((x) => x.reason_code === 'PII_PATTERN'));
});

test('enforces whitelist (drops non-schema field)', () => {
  const r = validateEventPayload('edition_viewed', {
    edition_id: 'ed_x',
    app_surface: 'web_homepage',
    random_extra_field: 'value',
  });
  assert.equal(r.ok, false);
  assert.ok(
    r.rejections.some((x) => x.reason_code === 'WHITELIST'),
    'should report whitelist violation',
  );
});

test('accepts a clean valid payload', () => {
  const r = validateEventPayload('edition_viewed', {
    edition_id: 'ed_2026_08_22',
    app_surface: 'web_homepage',
  });
  assert.equal(r.ok, true, 'clean payload should pass');
  assert.equal(r.hard_rejected, false);
});

test('submission_id must be 8-char hex (F-26 / §5 special case)', () => {
  const r = validateEventPayload('witness_submitted', {
    submission_id: 'not-hex-too-long',
    location_mode: 'auto_gps_city',
  });
  assert.equal(r.ok, false);
  // Whitelist path here — schema mismatch
  assert.ok(r.rejections.length > 0);
});

test('accepts all 14 events with their minimal payload', () => {
  const cases: Array<[string, Record<string, unknown>]> = [
    ['edition_viewed', { edition_id: 'e1', app_surface: 'web_homepage' }],
    ['moment_impression', { moment_id: 'm1', position: 1, city_id: 'c1', source_type: 'witness' }],
    ['moment_opened', { moment_id: 'm1', city_id: 'c1', entry_point: 'daily12' }],
    ['city_opened', { city_id: 'c1', entry_point: 'moment_detail' }],
    ['city_section_viewed', { city_id: 'c1', section: 'arrival' }],
    ['unknown_started', { unknown_id: 'u1' }],
    ['unknown_revealed', { unknown_id: 'u1', city_id: 'c1' }],
    ['echo_started', { city_id: 'c1' }],
    ['echo_submitted', { city_id: 'c1', result: 'accepted' }],
    ['witness_started', { entry_point: 'city_detail' }],
    ['witness_permission_result', { permission_type: 'camera', result: 'granted' }],
    ['witness_upload_started', { media_type: 'photo_camera', network_class: 'wifi' }],
    ['witness_submitted', { submission_id: 'a3f9b2c1', location_mode: 'auto_gps_city' }],
    ['witness_submit_failed', { error_category: 'upload_network', retryable: true }],
  ];
  for (const [name, props] of cases) {
    const r = validateEventPayload(name as never, props);
    assert.equal(r.ok, true, `${name} should validate cleanly; rejections=${JSON.stringify(r.rejections)}`);
  }
});

test('rejects unknown event name', () => {
  // Type system already prevents this; runtime check is defense-in-depth.
  const r = validateEventPayload('edition_clicked' as never, {});
  assert.equal(r.ok, false);
});