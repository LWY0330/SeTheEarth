/* ============================================================
   看见地球 · v1.6.2 · PROMPT 41 v1 · UniversalOneScene 组件
   ------------------------------------------------------------
   - 4 屏之 02 · One Scene = Now 屏 (V2 Now 层核心)
   - 9 列图 + 3 列留白(per spec §2.4.6 One Scene Pattern)
   - 4 行文案:时间 + 地点 + 主体 + 反常动作
   - Empty State:E_empty 时显示 "Be the first to show here today."
   ============================================================ */

import type { City, Moment } from '@/types';
import type { CityPageState } from '@/types';
import type { CityLayer } from '../hooks/useLayerFromCity';

export interface UniversalOneSceneProps {
  city: City;
  moments: ReadonlyArray<Moment>;
  pageState: CityPageState;
  layer: CityLayer;
}

/**
 * UniversalOneScene · 屏 02 · Now 屏。
 *
 * Phase 1 first pass:占位结构(9/3 列骨架 + 文案引导)
 * Phase 2+ 计划:对接 v1.3 §3.2.2 mockup,加 Layer Color 应用规则
 */
export function UniversalOneScene({ city, moments, pageState, layer }: UniversalOneSceneProps) {
  const nowMoment = pickNowMoment(moments);
  const isEmpty = pageState === 'E_empty';
  const isPastOnly = pageState === 'D_past_only';

  return (
    <section
      className="universal-one-scene"
      data-layer={layer}
      data-city={city.identity.city_id}
      data-state={pageState}
    >
      <div className="universal-one-scene__grid">
        <div className="universal-one-scene__image-col">
          {nowMoment && !isEmpty && !isPastOnly ? (
            <div className="universal-one-scene__image-placeholder" data-moment-id={nowMoment.moment_id}>
              <span>One Scene · {nowMoment.media_type}</span>
            </div>
          ) : (
            <div className="universal-one-scene__image-empty" aria-label="无 One Scene 配图">
              <span>{isEmpty ? 'No image yet.' : 'Today is quiet.'}</span>
            </div>
          )}
        </div>
        <div className="universal-one-scene__text-col">
          {nowMoment && !isEmpty && !isPastOnly ? (
            <div className="universal-one-scene__caption">
              <span className="universal-one-scene__caption-zh">{getCaptionZh(nowMoment) ?? '—'}</span>
              <span className="universal-one-scene__caption-en">{getCaptionEn(nowMoment) ?? '—'}</span>
            </div>
          ) : isEmpty ? (
            <div className="universal-one-scene__empty-cta">
              <p>Be the first to show here today.</p>
            </div>
          ) : (
            <div className="universal-one-scene__quiet">
              <p>No moments from here today.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/**
 * pickNowMoment · 从 moments 选第一条作为 One Scene 配图(Phase 1 简化:第一条)。
 *
 * Phase 2+ 计划:根据 getMomentTimeBucket 选 NOW 桶的 moments。
 */
function pickNowMoment(moments: readonly Moment[]): Moment | undefined {
  return moments[0];
}

/**
 * getCaptionZh / getCaptionEn · 多语言文案查找(优先 captions,fallback caption)。
 */
function getCaptionZh(m: Moment): string | undefined {
  return m.captions?.zh ?? m.caption;
}
function getCaptionEn(m: Moment): string | undefined {
  return m.captions?.en ?? m.caption;
}

export default UniversalOneScene;