import { z } from 'zod';

import type { PublicCity } from './city-schema.ts';
import type { CityListQuery, CityRow } from './types.ts';

const DEFAULT_CITY_LIMIT = 20;
const MAX_CITY_LIMIT = 50;

const CityListSearchParamsSchema = z
  .object({
    layer: z.enum(['blue', 'yellow', 'red']).optional(),
    page_state: z
      .enum(['A_seed_editorial', 'B_active', 'C_low_activity', 'D_past_only', 'E_empty'])
      .optional(),
    country_code: z.string().regex(/^[A-Z]{2}$/u).optional(),
    limit: z.coerce.number().int().min(1).max(MAX_CITY_LIMIT).default(DEFAULT_CITY_LIMIT),
    cursor: z.string().min(1).max(64).optional(),
  })
  .strict();

export function parseCityListQuery(searchParams: URLSearchParams): CityListQuery {
  return CityListSearchParamsSchema.parse(Object.fromEntries(searchParams.entries()));
}

export function toPublicCity(cityRow: CityRow): PublicCity {
  if (!cityRow.public_location_only) {
    throw new Error(`City ${cityRow.id} violates public_location_only boundary.`);
  }

  return {
    id: cityRow.id,
    slug: cityRow.slug,
    names: {
      canonical_name: cityRow.name_en,
      name_zh: cityRow.name_zh,
      name_en: cityRow.name_en,
      country_zh: cityRow.country_zh,
      country_en: cityRow.country_en,
    },
    timezone: cityRow.timezone,
    layer: cityRow.layer,
    public_location_only: true,
    page_state: cityRow.page_state,
  };
}
