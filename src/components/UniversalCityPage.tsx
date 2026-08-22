/* ============================================================
   看见地球 · v1.6.2 · PROMPT 41 v1 · UniversalCityPage 主组件
   ------------------------------------------------------------
   - 5 City States 任一状态都能渲染(Seed / Active / Low / Past / Empty)
   - 调用 cityPageRenderPlan(city) 决定 4 屏渲染
   - Empty State 特殊处理(E_empty):hero=Placeholder, same_second=hide
   - 路由:/cities/:slug (与 legacy CityPage 共存,通过 feature flag 切换)
   ============================================================ */

import { useMemo } from 'react';
import type { City, Moment } from '@/types';
import { planCityPageRender, type CityPageRenderPlan } from '../lib/cityPageRenderPlan';
import { useCityData } from '../hooks/useCityData';
import { useDynamicCity } from '../hooks/useDynamicCity';
import { useMomentsForCity } from '../hooks/useMomentsForCity';
import { useLayerFromCity } from '../hooks/useLayerFromCity';
import { cities } from '../data/cities';
import UniversalArrival from './UniversalArrival';
import UniversalOneScene from './UniversalOneScene';
import UniversalSameSecond from './UniversalSameSecond';
import UniversalEcho from './UniversalEcho';
import { useRoute, useNavigate } from '@/router/Router';

export interface UniversalCityPageProps {
  /** 可选:外部传入 city(用于测试);默认从 slug 取 */
  city?: City | null;
  /** 可选:外部传入 moments;默认从 city_id 取 */
  moments?: ReadonlyArray<Moment>;
  /** 可选:外部传入 plan;默认从 city 计算 */
  plan?: CityPageRenderPlan;
}

/**
 * UniversalCityPage · 主组件。
 *
 * Phase 1 first pass:5 State 集成骨架 + plan 驱动 4 屏
 * Phase 2+ 计划:对接 designer mockup,补 Layer Color / 暗 overlay / responsive
 */
export function UniversalCityPage({ city: propCity, moments: propMoments, plan: propPlan }: UniversalCityPageProps) {
  const route = useRoute();
  const navigate = useNavigate();
  const slug = route.name === 'city' ? route.params.slug : '';
  const fetchedCity = useCityData(propCity === undefined ? slug : null);
  const city = propCity !== undefined ? propCity : fetchedCity;

  const moments = useMomentsForCity(propMoments === undefined && city ? city.identity.city_id : '');
  const dynamic = useDynamicCity(city);
  const layer = useLayerFromCity(city);

  const plan = useMemo(() => {
    if (propPlan) return propPlan;
    if (!city) return null;
    return planCityPageRender(city);
  }, [city, propPlan]);

  // 404 状态
  if (!city || !plan) {
    return (
      <div className="universal-city-page__not-found">
        <p>城市 "{slug}" 不存在。</p>
        <button onClick={() => navigate.push('/')}>← 返回首页</button>
      </div>
    );
  }

  // Same Second 屏需要的"其他城市"列表(Phase 1:静态 cities 列表)
  const otherCities = cities
    .filter((c) => c.id !== city.identity.city_id)
    .slice(0, 3)
    .map((legacy) => ({
      city: {
        identity: {
          city_id: legacy.id,
          canonical_name: legacy.nameEn,
          local_name: legacy.nameZh,
          country_code: 'XX', // Phase 2 替换
          country_name: legacy.countryEn,
          place_type: 'city' as const,
          latitude: legacy.lat,
          longitude: legacy.lon,
          timezone: legacy.timezone,
        },
      } as City,
      moments: [],
      layer: 'unknown' as const,
    }));

  return (
    <article
      className="universal-city-page"
      data-page-state={plan.pageHeaderVariant}
      data-city={city.identity.city_id}
    >
      {/* L1 warning(Phase 0 不推导) */}
      {plan.warnings.length > 0 && (
        <div className="universal-city-page__warnings" role="status">
          {plan.warnings.map((w, i) => (
            <p key={i} className="universal-city-page__warning">{w}</p>
          ))}
        </div>
      )}

      {/* Hero / Context Hero(4 屏之 01) */}
      {plan.sections.hero.decision !== 'hide' && (
        <UniversalArrival city={city} dynamic={dynamic} layer={layer} />
      )}

      {/* One Scene / Now 屏(4 屏之 02) */}
      {plan.sections.one_scene.decision !== 'hide' && (
        <UniversalOneScene
          city={city}
          moments={moments}
          pageState={plan.page_state}
          layer={layer}
        />
      )}

      {/* Same Second / Now 横向对比(4 屏之 03) */}
      {plan.sections.same_second.decision !== 'hide' && (
        <UniversalSameSecond
          city={city}
          otherCities={otherCities}
        />
      )}

      {/* Echo(4 屏之 04) */}
      {plan.sections.echo.decision !== 'hide' && (
        <UniversalEcho city={city} pageState={plan.page_state} />
      )}
    </article>
  );
}

export default UniversalCityPage;