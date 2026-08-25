/**
 * Loader hook: resolve extensionless `.ts` imports to `.ts` files when
 * `--experimental-strip-types` is enabled.
 *
 * Usage:
 *   node --experimental-strip-types --loader=./loader-register-ts.mjs tests/14-day-test.ts
 */

import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve as pathResolve } from 'node:path';

const LOADER_URL = import.meta.url;

export function resolve(specifier, context, nextResolve) {
  // Skip if specifier already has an extension or is a builtin/URL/data-import
  if (
    specifier.startsWith('node:') ||
    specifier.startsWith('file:') ||
    /^https?:/.test(specifier) ||
    specifier.startsWith('data:') ||
    /\.[a-z0-9]+$/i.test(specifier)
  ) {
    return nextResolve(specifier, context);
  }

  // Determine parent directory from parentURL (the file making the import).
  // Fall back to the loader's own directory if no parent URL (initial entry).
  const parentURL = context.parentURL ?? LOADER_URL;
  const parentPath = dirname(fileURLToPath(parentURL));
  const target = pathResolve(parentPath, specifier);

  // Try .ts, /index.ts
  for (const candidate of [`${target}.ts`, `${target}/index.ts`]) {
    if (existsSync(candidate)) {
      return nextResolve(specifier + '.ts', context);
    }
  }
  return nextResolve(specifier, context);
}