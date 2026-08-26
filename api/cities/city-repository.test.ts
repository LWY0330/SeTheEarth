import assert from 'node:assert/strict';
import test from 'node:test';

import { createCityRepository } from './city-repository.ts';
import type { CityRow } from './types.ts';

const LISBON_ROW: CityRow = {
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
};

function createQueryClient(result: { data: CityRow[] | null; error: unknown }) {
  const operations: string[] = [];
  const query = {
    select(columns: string) {
      operations.push(`select:${columns}`);
      return this;
    },
    is(column: string, value: null) {
      operations.push(`is:${column}:${String(value)}`);
      return this;
    },
    eq(column: string, value: string) {
      operations.push(`eq:${column}:${value}`);
      return this;
    },
    gt(column: string, value: string) {
      operations.push(`gt:${column}:${value}`);
      return this;
    },
    order(column: string) {
      operations.push(`order:${column}`);
      return this;
    },
    limit(value: number) {
      operations.push(`limit:${value}`);
      return Promise.resolve(result);
    },
  };
  const client = {
    from(table: string) {
      operations.push(`from:${table}`);
      return query;
    },
  };

  return { client, operations };
}

test('applies public city filters, cursor ordering, and one extra result', async () => {
  const { client, operations } = createQueryClient({ data: [LISBON_ROW], error: null });
  const cityRepository = createCityRepository(client);

  const rows = await cityRepository.findCities({
    layer: 'blue',
    page_state: 'B_active',
    country_code: 'PT',
    limit: 20,
    cursor: 'kyoto',
  });

  assert.deepEqual(rows, [LISBON_ROW]);
  assert.deepEqual(operations, [
    'from:cities',
    'select:id,slug,name_zh,name_en,country_zh,country_en,country_code,timezone,layer,page_state,public_location_only,admin1_code,admin1_name,place_type,state_level,deleted_at',
    'is:deleted_at:null',
    'eq:layer:blue',
    'eq:page_state:B_active',
    'eq:country_code:PT',
    'gt:id:kyoto',
    'order:id',
    'limit:21',
  ]);
});
test('throws a repository error when Supabase rejects the query', async () => {
  const { client } = createQueryClient({
    data: null,
    error: { code: '42P01', message: 'relation does not exist' },
  });
  const cityRepository = createCityRepository(client);

  await assert.rejects(
    cityRepository.findCities({ limit: 20 }),
    /Unable to list public cities/u,
  );
});
