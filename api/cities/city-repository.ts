import { z } from 'zod';

import type { CityListQuery, CityRepository, CityRow } from './types.ts';

const CITY_COLUMNS = [
  'id',
  'slug',
  'name_zh',
  'name_en',
  'country_zh',
  'country_en',
  'country_code',
  'timezone',
  'layer',
  'page_state',
  'public_location_only',
  'admin1_code',
  'admin1_name',
  'place_type',
  'state_level',
  'deleted_at',
].join(',');

const CityRowSchema = z
  .object({
    id: z.string().min(1),
    slug: z.string().min(1),
    name_zh: z.string().min(1),
    name_en: z.string().min(1),
    country_zh: z.string().min(1),
    country_en: z.string().min(1),
    country_code: z.string().length(2),
    timezone: z.string().min(1),
    layer: z.enum(['blue', 'yellow', 'red']),
    page_state: z.enum([
      'A_seed_editorial',
      'B_active',
      'C_low_activity',
      'D_past_only',
      'E_empty',
    ]),
    public_location_only: z.boolean(),
    admin1_code: z.string().nullable(),
    admin1_name: z.string().nullable(),
    place_type: z.string().min(1),
    state_level: z.string().min(1),
    deleted_at: z.string().nullable(),
  })
  .strict();

interface CityQueryResult {
  data: unknown[] | null;
  error: unknown;
}
interface CityQueryBuilder {
  select(columns: string): CityQueryBuilder;
  is(column: string, value: null): CityQueryBuilder;
  eq(column: string, value: string): CityQueryBuilder;
  gt(column: string, value: string): CityQueryBuilder;
  order(column: string, options?: { ascending: boolean }): CityQueryBuilder;
  limit(value: number): PromiseLike<CityQueryResult>;
}

export interface CityDatabaseClient {
  from(table: string): CityQueryBuilder;
}

export class CityRepositoryError extends Error {
  constructor(cause: unknown) {
    super('Unable to list public cities.', { cause });
    this.name = 'CityRepositoryError';
  }
}

function applyCityFilters(
  queryBuilder: CityQueryBuilder,
  query: CityListQuery,
): CityQueryBuilder {
  let filteredQuery = queryBuilder;
  if (query.layer) filteredQuery = filteredQuery.eq('layer', query.layer);
  if (query.page_state) filteredQuery = filteredQuery.eq('page_state', query.page_state);
  if (query.country_code) {
    filteredQuery = filteredQuery.eq('country_code', query.country_code);
  }
  if (query.cursor) filteredQuery = filteredQuery.gt('id', query.cursor);
  return filteredQuery;
}

export function createCityRepository(client: CityDatabaseClient): CityRepository {
  return {
    async findCities(query: CityListQuery): Promise<CityRow[]> {
      const baseQuery = client.from('cities').select(CITY_COLUMNS).is('deleted_at', null);
      const filteredQuery = applyCityFilters(baseQuery, query);
      const result = await filteredQuery
        .order('id', { ascending: true })
        .limit(query.limit + 1);

      if (result.error) throw new CityRepositoryError(result.error);

      try {
        return z.array(CityRowSchema).parse(result.data ?? []);
      } catch (error) {
        throw new CityRepositoryError(error);
      }
    },
  };
}
