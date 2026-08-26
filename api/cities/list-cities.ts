import { toPublicCity } from './city-contract.ts';
import type { CityListQuery, CityListResult, CityRepository } from './types.ts';

interface ListCitiesInput {
  query: CityListQuery;
  cityRepository: CityRepository;
}
export async function listCities(input: ListCitiesInput): Promise<CityListResult> {
  const cityRows = await input.cityRepository.findCities(input.query);
  const hasMore = cityRows.length > input.query.limit;
  const visibleRows = cityRows.slice(0, input.query.limit);
  const cities = visibleRows.map(toPublicCity);

  return {
    cities,
    page: {
      next_cursor: hasMore ? cities.at(-1)?.id ?? null : null,
      has_more: hasMore,
    },
  };
}
