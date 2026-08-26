import assert from 'node:assert/strict';
import test from 'node:test';

import { parseCityListQuery, toPublicCity } from './city-contract.ts';

const KYOTO_ROW = {
  id: 'kyoto',
  slug: 'kyoto',
  name_zh: '京都',
  name_en: 'Kyoto',
  country_zh: '日本',
  country_en: 'Japan',
  country_code: 'JP',
  timezone: 'Asia/Tokyo',
  layer: 'blue',
  page_state: 'B_active',
  public_location_only: true,
  admin1_code: '26',
  admin1_name: 'Kyoto',
  place_type: 'city',
  state_level: 'L0_mapped',
  deleted_at: null,
} as const;

test('maps a database city row to the exact public city shape', () => {
  const publicCity = toPublicCity(KYOTO_ROW);

  assert.deepEqual(publicCity, {
    id: 'kyoto',
    slug: 'kyoto',
    names: {
      canonical_name: 'Kyoto',
      name_zh: '京都',
      name_en: 'Kyoto',
      country_zh: '日本',
      country_en: 'Japan',
    },
    timezone: 'Asia/Tokyo',
    layer: 'blue',
    public_location_only: true,
    page_state: 'B_active',
  });
  assert.equal('country_code' in publicCity, false);
  assert.equal('state_level' in publicCity, false);
  assert.equal('admin1_name' in publicCity, false);
});
test('rejects a database city row that is not public-location-only', () => {
  assert.throws(
    () => toPublicCity({ ...KYOTO_ROW, public_location_only: false }),
    /public_location_only/u,
  );
});

test('parses city list filters and numeric limit from URL search parameters', () => {
  const searchParams = new URLSearchParams({
    layer: 'yellow',
    page_state: 'C_low_activity',
    country_code: 'PT',
    limit: '12',
    cursor: 'lisbon',
  });

  assert.deepEqual(parseCityListQuery(searchParams), {
    layer: 'yellow',
    page_state: 'C_low_activity',
    country_code: 'PT',
    limit: 12,
    cursor: 'lisbon',
  });
});

test('applies the contract default limit when no query is supplied', () => {
  assert.deepEqual(parseCityListQuery(new URLSearchParams()), { limit: 20 });
});

test('rejects limits above the public endpoint maximum', () => {
  assert.throws(() => parseCityListQuery(new URLSearchParams({ limit: '51' })));
});
