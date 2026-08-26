import { CityListEnvelopeSchema } from '@contracts/zod-schemas/city';

import { createSupabaseServerClient } from '@/_lib/supabase-server';
import {
  createCityListHandler,
  createCityRepository,
  type CityDatabaseClient,
} from '@/cities';
import {
  ErrorCategorySchema,
  logServerError,
} from '@/_lib/sentry-server';
import type { CityRepository } from '@/cities/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const cityRepository: CityRepository = {
  findCities(query) {
    const client = createSupabaseServerClient() as unknown as CityDatabaseClient;
    return createCityRepository(client).findCities(query);
  },
};

export const GET = createCityListHandler({
  cityRepository,
  validateEnvelope: (envelope) => CityListEnvelopeSchema.parse(envelope),
  reportError(error, requestId) {
    logServerError({
      category: ErrorCategorySchema.SERVER_DB_ERROR,
      error,
      requestId,
      component: 'cities-api',
      httpStatus: 500,
    });
  },
});
