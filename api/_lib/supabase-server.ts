import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';

const SupabaseServerConfigSchema = z
  .object({
    SUPABASE_URL: z.string().url(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  })
  .passthrough();

export interface SupabaseServerConfig {
  url: string;
  serviceRoleKey: string;
}
export function readSupabaseServerConfig(
  environment: Record<string, string | undefined>,
): SupabaseServerConfig {
  const parsedEnvironment = SupabaseServerConfigSchema.parse(environment);

  return {
    url: parsedEnvironment.SUPABASE_URL,
    serviceRoleKey: parsedEnvironment.SUPABASE_SERVICE_ROLE_KEY,
  };
}

export function createSupabaseServerClient(): SupabaseClient {
  const config = readSupabaseServerConfig(process.env);

  return createClient(config.url, config.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}
