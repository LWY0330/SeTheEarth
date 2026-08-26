import assert from 'node:assert/strict';
import test from 'node:test';

import { readSupabaseServerConfig } from './supabase-server.ts';

test('reads the server-only Supabase configuration', () => {
  assert.deepEqual(
    readSupabaseServerConfig({
      SUPABASE_URL: 'https://example.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'sb_secret_example',
    }),
    {
      url: 'https://example.supabase.co',
      serviceRoleKey: 'sb_secret_example',
    },
  );
});
test('rejects missing server-only Supabase configuration', () => {
  assert.throws(
    () => readSupabaseServerConfig({ SUPABASE_URL: 'https://example.supabase.co' }),
    /SUPABASE_SERVICE_ROLE_KEY/u,
  );
});
