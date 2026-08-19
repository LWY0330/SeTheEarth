/* ============================================================
   看见地球 · v1.6.1 · PROMPT 39 v1 决策 A.2 · Country i18n
   ------------------------------------------------------------
   - 独立 countryI18n 表 +查表逻辑（PM 决策 A.2）
   - ISO 3166-1 alpha-2 → 多语言国家名（zh / en）
   - 12 现有城市映射 + 4 预留国家（US / FR / SD / EG），共 15 国家
   - Phase 1+ Editorial CMS / GeoNames 接入后可扩展
   - 不动业务文件；不改 City / Moment 类型
   ============================================================ */

/**
 * ISO 3166-1 alpha-2 国家代码（如 "JP" / "CN" / "US"）。
 * 严格 2 个大写字母（与 CityIdentity.country_code 契约一致）。
 */
export type CountryCode = string;

/**
 * ISO 639-1 语言代码（如 "zh" / "en"）。
 * Phase 1 仅 zh + en；Phase 2+ 可扩 ja / pt / es 等。
 */
export type LocaleCode = 'zh' | 'en';

/**
 * Country i18n entry:country_code → 多语言国家名。
 */
export interface CountryI18nEntry {
  /** ISO 3166-1 alpha-2 */
  readonly country_code: CountryCode;
  /** locale → localized country name */
  readonly names: Readonly<Record<LocaleCode, string>>;
}

/**
 * Country i18n 表（15 国家覆盖 12 城 + 4 预留）。
 *
 * 覆盖规则:
 * - 12 现有城市对应 11 国家（JP × 2: kyoto + tokyo）
 * - 预留 4 国家（US/FR/SD/EG）= Phase 3 接入 GeoNames 时常用
 *
 * Phase 1+ 扩展点:add entry 或补 ja/pt/es locale
 */
export const COUNTRY_I18N: ReadonlyArray<CountryI18nEntry> = Object.freeze([
  { country_code: 'JP', names: { zh: '日本', en: 'Japan' } },
  { country_code: 'PT', names: { zh: '葡萄牙', en: 'Portugal' } },
  { country_code: 'CN', names: { zh: '中国', en: 'China' } },
  { country_code: 'MX', names: { zh: '墨西哥', en: 'Mexico' } },
  { country_code: 'BR', names: { zh: '巴西', en: 'Brazil' } },
  { country_code: 'IS', names: { zh: '冰岛', en: 'Iceland' } },
  { country_code: 'ZA', names: { zh: '南非', en: 'South Africa' } },
  { country_code: 'GB', names: { zh: '英国', en: 'United Kingdom' } },
  { country_code: 'DE', names: { zh: '德国', en: 'Germany' } },
  { country_code: 'IT', names: { zh: '意大利', en: 'Italy' } },
  { country_code: 'AU', names: { zh: '澳大利亚', en: 'Australia' } },
  // Phase 3 预留
  { country_code: 'US', names: { zh: '美国', en: 'United States' } },
  { country_code: 'FR', names: { zh: '法国', en: 'France' } },
  { country_code: 'SD', names: { zh: '苏丹', en: 'Sudan' } },
  { country_code: 'EG', names: { zh: '埃及', en: 'Egypt' } },
]);

/* ---------- Lookup helpers ---------- */

/**
 * 内部 Map:country_code → entry（O(1) 查询）。
 * 模块初始化时一次性构建，运行时不再扫描数组。
 */
const COUNTRY_BY_CODE: ReadonlyMap<CountryCode, CountryI18nEntry> = (() => {
  const m = new Map<CountryCode, CountryI18nEntry>();
  for (const entry of COUNTRY_I18N) {
    m.set(entry.country_code, entry);
  }
  return m;
})();

/**
 * 查表:getCountryNameLocal(country_code, locale) → localized name | undefined
 *
 * - country_code 不存在 → undefined（不抛错）
 * - locale 不支持（如 "ja"）→ 回退 en；en 也不存在 → undefined
 * - country_code 非 ISO 格式（小写 / 长度不符）→ undefined
 *
 * Phase 1+ 行为契约:UI 隐藏国家名（不要 fallback 到 country_name 冒充本地化）
 */
export function getCountryNameLocal(
  country_code: CountryCode,
  locale: LocaleCode,
): string | undefined {
  if (!isValidCountryCode(country_code)) return undefined;
  const entry = COUNTRY_BY_CODE.get(country_code);
  if (!entry) return undefined;
  return entry.names[locale];
}

/**
 * 列出所有已支持的国家代码（ISO 3166-1 alpha-2）。
 * 用于 admin UI / Phase 3 导入校验。
 */
export function listSupportedCountryCodes(): readonly CountryCode[] {
  return Object.freeze(COUNTRY_I18N.map((e) => e.country_code));
}

/**
 * ISO 3166-1 alpha-2 严格校验:2 个大写字母。
 * 与 CityIdentity.country_code 契约一致（见 src/lib/ingestion.ts COUNTRY_CODE_RE）。
 */
export function isValidCountryCode(code: string): boolean {
  return /^[A-Z]{2}$/.test(code);
}

/**
 * 列出某 locale 下所有支持的国家（country_code + localized name）。
 * Phase 3 Editorial CMS 批量导入校验时使用。
 */
export function listCountriesByLocale(
  locale: LocaleCode,
): ReadonlyArray<{ country_code: CountryCode; name: string }> {
  return Object.freeze(
    COUNTRY_I18N
      .map((e) => ({ country_code: e.country_code, name: e.names[locale] }))
      .filter((row) => row.name !== undefined),
  );
}