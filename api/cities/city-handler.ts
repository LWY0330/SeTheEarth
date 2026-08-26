import { z } from 'zod';

import { parseCityListQuery } from './city-contract.ts';
import { listCities } from './list-cities.ts';
import type { CityRepository } from './types.ts';

interface CityListEnvelope {
  data: Awaited<ReturnType<typeof listCities>>['cities'];
  page: Awaited<ReturnType<typeof listCities>>['page'];
  request_id: string;
}

interface CityListHandlerOptions {
  cityRepository: CityRepository;
  validateEnvelope: (envelope: CityListEnvelope) => unknown;
  reportError: (error: unknown, requestId: string) => void;
}

function createRequestId(request: Request): string {
  return request.headers.get('x-vercel-id') ?? crypto.randomUUID();
}

function createErrorResponse(input: {
  errorCode: 'validation_failed' | 'server_error';
  message: string;
  retryable: boolean;
  requestId: string;
  status: number;
}): Response {
  return Response.json(
    {
      error_code: input.errorCode,
      message: input.message,
      retryable: input.retryable,
      request_id: input.requestId,
    },
    { status: input.status },
  );
}

export function createCityListHandler(options: CityListHandlerOptions) {
  return async function cityListHandler(request: Request): Promise<Response> {
    const requestId = createRequestId(request);
    let query;

    try {
      query = parseCityListQuery(new URL(request.url).searchParams);
    } catch (error) {
      if (!(error instanceof z.ZodError)) throw error;
      return createErrorResponse({
        errorCode: 'validation_failed',
        message: 'Invalid city list query.',
        retryable: false,
        requestId,
        status: 400,
      });
    }

    try {
      const result = await listCities({ query, cityRepository: options.cityRepository });
      const envelope = options.validateEnvelope({
        data: result.cities,
        page: result.page,
        request_id: requestId,
      });
      return Response.json(envelope, { status: 200 });
    } catch (error) {
      options.reportError(error, requestId);
      return createErrorResponse({
        errorCode: 'server_error',
        message: 'Unable to list cities.',
        retryable: true,
        requestId,
        status: 500,
      });
    }
  };
}
