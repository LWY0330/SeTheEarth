import assert from 'node:assert/strict';
import test from 'node:test';

import { listCities } from './list-cities.ts';
import type { CityRepository, CityRow } from './types.ts';

const CITY_ROWS: CityRow[] = [
  {
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
  },
  {
    id: 'lisbon',
    slug: 'lisbon',
    name_zh: '里斯本',
    name_en: 'Lisbon',
    country_zh: '葡萄牙',
    country_en: 'Portugal',
    country_code: 'PT',
    timezone: 'Europe/Lisbon',
    layer: 'blue',
    page_state: 'B_active',
    public_location_only: true,
    admin1_code: '11',
    admin1_name: 'Lisbon',
    place_type: 'city',
    state_level: 'L0_mapped',
    deleted_at: null,
  },
  {
    id: 'london',
    slug: 'london',
    name_zh: '伦敦',
    name_en: 'London',
    country_zh: '英国',
    country_en: 'United Kingdom',
    country_code: 'GB',
    timezone: 'Europe/London',
    layer: 'blue',
    page_state: 'B_active',
    public_location_only: true,
    admin1_code: 'ENG',
    admin1_name: 'England',
    place_type: 'city',
    state_level: 'L0_mapped',
    deleted_at: null,
  },
];

test('returns one page and uses the last visible city as the next cursor', async () => {
  const cityRepository: CityRepository = {
    findCities: async () => CITY_ROWS,
  };

  const result = await listCities({
    query: { limit: 2 },
    cityRepository,
  });

  assert.equal(result.cities.length, 2);
  assert.equal(result.cities[0]?.id, 'kyoto');
  assert.equal(result.cities[1]?.id, 'lisbon');
  assert.deepEqual(result.page, {
    next_cursor: 'lisbon',
    has_more: true,
  });
});
test('returns no cursor when the repository has no extra row', async () => {
  const cityRepository: CityRepository = {
    findCities: async () => CITY_ROWS.slice(0, 2),
  };

  const result = await listCities({
    query: { limit: 2 },
    cityRepository,
  });

  assert.deepEqual(result.page, {
    next_cursor: null,
    has_more: false,
  });
});
