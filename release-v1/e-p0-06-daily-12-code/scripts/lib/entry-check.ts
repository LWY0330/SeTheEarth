/**
 * Helper: detect whether the current module is the Node.js entry point.
 *
 * Works under Node 22's `--experimental-strip-types` loader, where
 * `process.argv[1]` is the absolute path but `import.meta.url` is a
 * `file://` URL with % escapes (e.g. `%E7%9C%8B` for 中文 characters).
 */

import { fileURLToPath } from 'node:url';

export function isMain(importMetaUrl: string): boolean {
  const argv1 = process.argv[1];
  if (!argv1) return false;

  // Direct equality (paths without escapes).
  if (argv1 === importMetaUrl) return true;

  // Decoded-URL equality.
  try {
    if (fileURLToPath(importMetaUrl) === argv1) return true;
  } catch {
    /* not a URL */
  }

  // Basename fallback (last segment).
  const argvBase = argv1.split('/').pop();
  const metaBase = importMetaUrl.split('/').pop()?.split('?')[0];
  if (argvBase && metaBase && argvBase === metaBase) return true;

  return false;
}