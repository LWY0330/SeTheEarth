/* ============================================================
   看见地球 · v1.6 · PROMPT 36 Phase 1 prep · Context Source 抽象
   ------------------------------------------------------------
   - spec §4.2 Context 字段:运行时从外部源获取,不进 City schema 静态字段
   - Phase 0 仅定义接口 + EmptyContextSource stub
   - Phase 1+ 由 Wikipedia / GeoNames / OpenWeather / World Bank 实接
   - 不动业务文件;不改 City / Moment 类型
   ============================================================ */

import type { City } from '@/types';

/* ---------- Context 数据类型 ---------- */

/**
 * City Context — spec §4.2
 *
 * 城市背景数据,运行时从外部源获取。
 *
 * 关键规则:
 * - 全部 optional,缺字段允许为空(UI 必须支持 partial data)
 * - 动态数据必须带年份 / 更新时间(uncertain → 不伪装成精确事实)
 * - 经济数据只有国家/区域级不得误标成城市级
 */
export interface CityContext {
  /** 关联 City(强一致) */
  readonly city_id: string;
  /** 人口数 */
  readonly population?: number;
  /** 人口数据年份 */
  readonly population_year?: number;
  /** 人口数据来源(如 "GeoNames") */
  readonly population_source?: string;
  /** 主要语言列表 */
  readonly languages?: readonly string[];
  /** 货币代码(如 "JPY" "CNY") */
  readonly currency?: string;
  /** 气候概述 */
  readonly climate_summary?: string;
  /** 地理概述 */
  readonly geography_summary?: string;
  /** 国家/区域经济背景 */
  readonly country_or_region_economic_context?: string;
  /** 经济数据年份 */
  readonly economic_data_year?: number;
  /** 经济数据来源(如 "World Bank") */
  readonly economic_data_source?: string;
  /** Context 最后更新时间(ISO) */
  readonly context_updated_at?: string;
  /** 完整来源列表(可追溯) */
  readonly context_sources?: readonly string[];
}

/* ---------- ContextSource 抽象 ---------- */

/**
 * ContextSource 抽象接口。
 * Phase 0: stub 返回最小 context(只填 city_id)。
 * Phase 1+ 实接 Wikipedia / GeoNames / OpenWeather / World Bank / Wikidata。
 */
export interface ContextSource {
  readonly name: string;
  fetchCityContext(
    city: Pick<City, 'identity'>,
  ): Promise<CityContext>;
}

/* ---------- EmptyContextSource(stub) ---------- */

/**
 * EmptyContextSource — Phase 0 默认 stub。
 * 返回最小 context(只含 city_id),所有其他字段 undefined。
 *
 * Phase 1+ 替换为 `makeCompositeContextSource([WikipediaContextSource, ...])`。
 */
export const EmptyContextSource: ContextSource = {
  name: 'empty',
  async fetchCityContext(city) {
    return { city_id: city.identity.city_id };
  },
};

/* ---------- CompositeContextSource(组合多源) ---------- */

/**
 * mergeContext — 浅合并多个 source 的结果(first-source-wins 语义)。
 * - 已定义的字段不被后续 source 覆盖
 * - 失败的 source 静默 fallback(不抛错)
 * - 返回新对象,不改入参
 */
function mergeContext(base: CityContext, partial: CityContext): CityContext {
  const out: CityContext = { ...base };
  for (const key of Object.keys(partial) as (keyof CityContext)[]) {
    if (out[key] === undefined && partial[key] !== undefined) {
      // 安全地写 readonly 字段(我们刚 spread 了 out)
      (out as Record<keyof CityContext, unknown>)[key] = partial[key];
    }
  }
  return out;
}

/**
 * makeCompositeContextSource — 多源组合工厂。
 * Phase 1+ 由 Wikipedia(主)→ GeoNames(回填 admin1/population)→ OpenWeather(weather_snapshot) 链式调用。
 *
 * 合并顺序 = sources 数组顺序,先填的 source 优先(不回退)。
 * 任一 source 抛错不影响整体(静默跳过)。
 *
 * 例:
 * ```ts
 * const ctx = makeCompositeContextSource([
 *   WikipediaContextSource,   // 主源:description / languages / currency / geography_summary
 *   GeoNamesContextSource,    // 回填:population / admin1
 *   OpenWeatherContextSource, // 补:climate_summary / context_updated_at
 * ]);
 * ```
 */
export function makeCompositeContextSource(
  sources: readonly ContextSource[],
  name = 'composite',
): ContextSource {
  return {
    name,
    async fetchCityContext(city) {
      let acc: CityContext = { city_id: city.identity.city_id };
      for (const src of sources) {
        try {
          const partial = await src.fetchCityContext(city);
          acc = mergeContext(acc, partial);
        } catch {
          // 单个 source 错误不中断链;Phase 1+ 可加 logger 记录
          // (Phase 0 不引入 logger,避免依赖扩张)
        }
      }
      return acc;
    },
  };
}

/* ---------- Default ContextSource ---------- */

/**
 * defaultContextSource — 全局默认。
 * Phase 0 = EmptyContextSource。
 * Phase 1+ 在 main.tsx 或 App.tsx 注入真实源后,这里指向新默认。
 *
 * 注意:本常量是引用本身,可被替换。
 * 但替换后需重新 export,不要写 `defaultContextSource = newSource`。
 */
export const defaultContextSource: ContextSource = EmptyContextSource;