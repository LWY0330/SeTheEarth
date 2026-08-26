import type { PublicCity } from '../../release-v1/api-contract/zod-schemas/city';

export interface CityListQuery {
  layer?: PublicCity['layer'];
  page_state?: PublicCity['page_state'];
  country_code?: string;
  limit: number;
  cursor?: string;
}

export interface CityRow {
  id: string;
  slug: string;
  name_zh: string;
  name_en: string;
  country_zh: string;
  country_en: string;
  country_code: string;
  timezone: string;
  layer: PublicCity['layer'];
  page_state: PublicCity['page_state'];
  public_location_only: boolean;
  admin1_code: string | null;
  admin1_name: string | null;
  place_type: string;
  state_level: string;
  deleted_at: string | null;
}

export interface CityRepository {
  findCities(query: CityListQuery): Promise<CityRow[]>;
}

export interface CityListResult {
  cities: PublicCity[];
  page: {
    next_cursor: string | null;
    has_more: boolean;
  };
}
