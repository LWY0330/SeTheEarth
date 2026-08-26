import assert from 'node:assert/strict';
import test from 'node:test';

import { createCityListHandler } from './city-handler.ts';
import type { CityRepository, CityRow } from './types.ts';

const CITY_ROW: CityRow = {
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
};

test('returns a validated public city envelope', async () => {
  const cityRepository: CityRepository = {
    findCities: async () => [CITY_ROW],
  };
  const handler = createCityListHandler({
    cityRepository,
    validateEnvelope: (envelope) => envelope,
    reportError: () => undefined,
  });

  const response = await handler(
    new Request('https://api.example.test/api/cities?limit=1', {
      headers: { 'x-vercel-id': 'request-test-1' },
    }),
  );
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.request_id, 'request-test-1');
  assert.equal(body.data[0].slug, 'kyoto');
  assert.deepEqual(body.page, { next_cursor: null, has_more: false });
});

test('returns the universal validation envelope for an invalid limit', async () => {
  const cityRepository: CityRepository = {
    findCities: async () => [CITY_ROW],
  };
  const handler = createCityListHandler({
    cityRepository,
    validateEnvelope: (envelope) => envelope,
    reportError: () => undefined,
  });

  const response = await handler(
    new Request('https://api.example.test/api/cities?limit=999'),
  );
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.error_code, 'validation_failed');
  assert.equal(body.retryable, false);
  assert.equal(typeof body.request_id, 'string');
});

test('returns a retryable server envelope when the repository fails', async () => {
  const cityRepository: CityRepository = {
    findCities: async () => {
      throw new Error('database unavailable');
    },
  };
  const handler = createCityListHandler({
    cityRepository,
    validateEnvelope: (envelope) => envelope,
    reportError: () => undefined,
  });

  const response = await handler(new Request('https://api.example.test/api/cities'));
  const body = await response.json();

  assert.equal(response.status, 500);
  assert.equal(body.error_code, 'server_error');
  assert.equal(body.retryable, true);
  assert.equal('stack' in body, false);
});
