/* ============================================================
   看见地球 · v1.6.2 · PROMPT 41 v1 · Feature flags
   ------------------------------------------------------------
   - VITE_USE_UNIVERSAL_CITYPAGE:toggle Universal vs legacy v1.4 CityPage
   - 0 依赖,Vite env 内置支持
   - 默认 false(legacy v1.4 优先,Phase 1 稳定后再开)
   ============================================================ */

/**
 * Feature flag keys.
 * 增加新 flag 时,在 FeatureFlags 接口加 readonly 字段 + 在 FeatureFlagsSchema 加校验。
 */
export interface FeatureFlags {
  /** 是否启用 UniversalCityPage(替代 legacy v1.4 CityPage) */
  readonly USE_UNIVERSAL_CITYPAGE: boolean;
}

/**
 * FeatureFlagsSchema · 描述每个 flag 的元数据(类型 + 默认值 + 来源)。
 */
const FeatureFlagsSchema: ReadonlyArray<{
  key: keyof FeatureFlags;
  envName: string;
  defaultValue: boolean;
}> = Object.freeze([
  { key: 'USE_UNIVERSAL_CITYPAGE', envName: 'VITE_USE_UNIVERSAL_CITYPAGE', defaultValue: false },
]);

/**
 * parseEnvBoolean · 解析 env string → boolean。
 * - 'true' / '1' / 'yes' → true
 * - 'false' / '0' / 'no' → false
 * - 其他(undefined / 空 / null)→ defaultValue
 */
function parseEnvBoolean(raw: string | undefined, defaultValue: boolean): boolean {
  if (raw === undefined || raw === null || raw === '') return defaultValue;
  const normalized = raw.trim().toLowerCase();
  if (normalized === 'true' || normalized === '1' || normalized === 'yes') return true;
  if (normalized === 'false' || normalized === '0' || normalized === 'no') return false;
  return defaultValue;
}

/**
 * loadFeatureFlags · 从 import.meta.env 加载所有 flag。
 *
 * Vite 内置: import.meta.env.VITE_* 在 build 时静态替换。
 * 浏览器环境只读 import.meta.env,Node 环境兜底(SSR / 测试)。
 */
export function loadFeatureFlags(): FeatureFlags {
  const flags = {
    USE_UNIVERSAL_CITYPAGE: false,
  } as Record<keyof FeatureFlags, boolean>;
  for (const schema of FeatureFlagsSchema) {
    const raw = readEnvVar(schema.envName);
    flags[schema.key] = parseEnvBoolean(raw, schema.defaultValue);
  }
  return Object.freeze({
    USE_UNIVERSAL_CITYPAGE: flags.USE_UNIVERSAL_CITYPAGE,
  });
}

/**
 * readEnvVar · 读 env(优先 import.meta.env,Vite 静态注入)。
 *
 * Node fallback 通过 typeof process 守卫,避免 TS 报错。
 */
function readEnvVar(name: string): string | undefined {
  try {
    const meta = (import.meta as ImportMeta & { env?: Record<string, string | undefined> });
    if (meta.env && typeof meta.env === 'object' && name in meta.env) {
      return meta.env[name];
    }
  } catch {
    // import.meta 在某些环境不可用
  }
  // Node 环境兜底(process 由 Vite 在 build 时静态替换;Node runtime 仅用于测试)
  const proc = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process;
  if (proc && proc.env) {
    return proc.env[name];
  }
  return undefined;
}

/**
 * isUniversalCityPageEnabled · 便捷访问(常用 flag)。
 */
export function isUniversalCityPageEnabled(): boolean {
  return loadFeatureFlags().USE_UNIVERSAL_CITYPAGE;
}

/**
 * Frozen default flags(SSR/测试环境兜底)
 */
export const DEFAULT_FLAGS: FeatureFlags = Object.freeze({
  USE_UNIVERSAL_CITYPAGE: false,
});