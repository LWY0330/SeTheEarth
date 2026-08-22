/* ============================================================
   看见地球 · v1.6.2 · PROMPT 41 v1 · UniversalArrival 组件
   ------------------------------------------------------------
   - 4 屏之 01 · Arrival = Context Hero (V2 Context 层)
   - 城市名 + 双时区 + Hero 图(per spec §3.2.1)
   - 数据契约:接收 city + snapshot + layer,渲染稳定结构
   - Phase 1 first pass:结构稳定 + 占位文案;Phase 2 接 mockup 视觉
   - 0 新依赖(沿用 React 18.3)
   ============================================================ */

import type { City } from '@/types';
import type { CityDynamicSnapshot } from '../hooks/useDynamicCity';
import type { CityLayer } from '../hooks/useLayerFromCity';

export interface UniversalArrivalProps {
  city: City;
  dynamic: CityDynamicSnapshot | null;
  layer: CityLayer;
}

/**
 * UniversalArrival · 屏 01 · Context Hero。
 *
 * 当前实现:scaffold 阶段,渲染结构稳定的占位标记
 * - city name (canonical + local)
 * - 双时区(local + user_diff)
 * - layer 标识
 * - hero_media 引用(等 Phase 2 接 mockup 视觉)
 *
 * Phase 2+ 计划:
 * - 对接 v1.3 §3.2.1 mockup HTML(120px 城市名 + 双时区排版)
 * - 暗 overlay 减弱(spec v12 调整)
 * - Layer Color 应用规则(只用于时间 / kicker / 状态点)
 */
export function UniversalArrival({ city, dynamic, layer }: UniversalArrivalProps) {
  const { identity, visual, content } = city;
  const heroMedia = visual?.hero_media;
  const layerLabel = layer === 'unknown' ? '—' : layer.toUpperCase();

  return (
    <section className="universal-arrival" data-layer={layer} data-city={identity.city_id}>
      <div className="universal-arrival__hero">
        {heroMedia ? (
          <img
            src={heroMedia.url}
            alt={heroMedia.alt}
            width={heroMedia.width}
            height={heroMedia.height}
            className="universal-arrival__hero-image"
          />
        ) : (
          <div className="universal-arrival__hero-placeholder" aria-label="暂无 Hero 图">
            <span>This city exists.</span>
          </div>
        )}
        <div className="universal-arrival__hero-overlay" aria-hidden="true" />
        <div className="universal-arrival__hero-text">
          <span className="universal-arrival__kicker">{identity.country_name.toUpperCase()}</span>
          <h1 className="universal-arrival__title">
            <span className="universal-arrival__name-cn">{identity.local_name ?? identity.canonical_name}</span>
            <span className="universal-arrival__name-en">{identity.canonical_name}</span>
          </h1>
          <div className="universal-arrival__time" aria-label="双时区">
            <span className="universal-arrival__time-local">
              {dynamic?.local_time ?? '--:--'}
            </span>
            <span className="universal-arrival__time-diff">
              {dynamic?.user_time_difference ?? '+0H'}
            </span>
            <span className="universal-arrival__time-coord">
              {identity.latitude.toFixed(2)}° · {identity.longitude.toFixed(2)}°
            </span>
          </div>
        </div>
      </div>

      <div className="universal-arrival__meta" aria-label="城市元信息">
        <span className="universal-arrival__layer" data-layer={layer}>{layerLabel}</span>
        <span className="universal-arrival__tz">{identity.timezone}</span>
        {visual?.hero_creator && (
          <span className="universal-arrival__credit">Photo by {visual.hero_creator}</span>
        )}
      </div>

      {content?.description && (
        <p className="universal-arrival__description">{content.description}</p>
      )}
    </section>
  );
}

export default UniversalArrival;