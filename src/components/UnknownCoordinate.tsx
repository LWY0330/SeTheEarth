/* ============================================================
   看见地球 · v1.6.3 · PROMPT 43 v1 · UnknownCoordinate 组件
   ------------------------------------------------------------
   - 5 stage Reveal React 组件(从 HTML mockup 转 React)
   - 集成 createRevealController + photoSource + unknownToCity
   - Stage 5 用户点击"进入此刻"→ 跳转 /cities/:slug
   - 5 个 manual 按钮保留(PM 评审用)
   - 不动业务文件;不改 Phase 0/1/2 类型
   ============================================================ */

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from '@/router/Router';
import {
  createRevealController,
  type RevealStage,
  type RevealController,
} from '../lib/unknownReveal';
import { DEFAULT_REVEAL_CONFIG } from '../lib/unknownReveal.config';
import { getPhotoForUnknownStage } from '../lib/photoSource';
import { revealCityFromCoordinates, MEXICO_CITY_COORDINATES } from '../lib/unknownToCity';

export interface UnknownCoordinateProps {
  /** Phase 1 mockup 用 Mexico City;Phase 1+ Witness 上传后从 GPS 取 */
  coordinates?: { lat: number; lon: number };
  /** Reveal 完成后跳转 URL(如 '/cities/mexico-city') */
  onComplete?: (cityId: string) => void;
}

/**
 * UnknownCoordinate · Reveal 主组件。
 *
 * Phase 1 first pass:
 * - 5 stage 状态机(createRevealController)
 * - Stage 5 用户点击 → 跳转 /cities/:slug
 * - 5 manual 按钮保留(评审用)
 *
 * Phase 2+ 计划:
 * - CSS module 精修(spec d10 §4)
 * - SSR / accessibility 增强(aria-live)
 */
export function UnknownCoordinate({
  coordinates = MEXICO_CITY_COORDINATES,
  onComplete,
}: UnknownCoordinateProps) {
  const navigate = useNavigate();
  const [stage, setStage] = useState<RevealStage>(1);
  const [isRunning, setIsRunning] = useState(false);

  const controller: RevealController = useMemo(
    () => createRevealController(DEFAULT_REVEAL_CONFIG),
    [],
  );

  // 订阅状态变化
  useEffect(() => {
    const unsub = controller.subscribe((s) => {
      setStage(s.stage);
      setIsRunning(s.isRunning);
    });
    return unsub;
  }, [controller]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      controller.destroy();
    };
  }, [controller]);

  // Stage 1 自动启动(per spec d10)
  useEffect(() => {
    controller.start();
  }, [controller]);

  const photo = getPhotoForUnknownStage(stage);

  /**
   * handleEnterClick · Stage 5 用户点击"进入此刻"按钮。
   */
  const handleEnterClick = () => {
    const city = revealCityFromCoordinates(coordinates);
    if (city) {
      // Stage 5 → 跳转 /cities/:slug
      const slug = city.identity.city_id;
      onComplete?.(slug);
      navigate.push(`/cities/${slug}`);
    } else {
      // 降级:无匹配 → UI 显示 "Be the first to show here today."
      onComplete?.('');
    }
  };

  /**
   * handleManualStage · PM 评审用(5 个 manual 按钮)。
   */
  const handleManualStage = (target: RevealStage) => {
    controller.advance(target);
  };

  return (
    <article
      className="unknown-coordinate"
      data-stage={stage}
      data-running={isRunning}
    >
      {/* 极简 nav */}
      <nav className="unknown-coordinate__nav">
        <a href="/" className="unknown-coordinate__logo">看见地球</a>
        <span className="unknown-coordinate__dot" />
      </nav>

      {/* 全幅 photo */}
      <div className="unknown-coordinate__photo">
        {photo && (
          <img
            src={photo.url}
            alt={photo.content_description}
            className="unknown-coordinate__photo-bg"
            data-asset-id={photo.asset_id}
          />
        )}
        <div className="unknown-coordinate__photo-overlay" aria-hidden="true" />

        {/* Stage 1-4 顶部标题 */}
        {stage < 5 && (
          <div className="unknown-coordinate__header">
            <div className="unknown-coordinate__kicker">
              <span className="unknown-coordinate__pulse" />
              UNKNOWN COORDINATE
            </div>
            <div className="unknown-coordinate__title">SECOND 0{stage} / 05</div>
            <div className="unknown-coordinate__quote">
              此刻,在地球的某个角落。
            </div>
          </div>
        )}

        {/* Stage 1-4 底部 UTC 块 */}
        {stage < 5 && (
          <div className="unknown-coordinate__utc">
            <div className="unknown-coordinate__utc-line mono">
              {stage === 1 && '15:42 · 31°C · '}
              {stage === 2 && '15:42 · 31°C · 23° N · 102° W'}
              {stage === 3 && '15:42 · 31°C · 23.6345° N · 102.5528° W'}
              {stage === 4 && '15:42 · 31°C · 23.6345° N · 102.5528° W'}
            </div>
            <div className="unknown-coordinate__utc-meta mono">
              <span>SECOND 0{stage} / 05</span>
              <span>SEE EARTH</span>
              <span>UNKNOWN COORDINATE</span>
            </div>
          </div>
        )}

        {/* Stage 4: 进入按钮 */}
        {stage === 4 && (
          <button
            className="unknown-coordinate__cta"
            onClick={handleEnterClick}
            type="button"
          >
            进入此刻
          </button>
        )}

        {/* Stage 5: 城市出现 + Empty State */}
        {stage === 5 && (
          <div className="unknown-coordinate__city">
            <div className="unknown-coordinate__city-name">MEXICO CITY</div>
            <div className="unknown-coordinate__city-meta">墨西哥城 · 07:42 · Tuesday</div>
            <button
              className="unknown-coordinate__cta"
              onClick={handleEnterClick}
              type="button"
            >
              进入此刻
            </button>
          </div>
        )}
      </div>

      {/* 5 manual 按钮(PM 评审用) */}
      <div className="unknown-coordinate__manual">
        {([1, 2, 3, 4, 5] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => handleManualStage(s)}
            className={s === stage ? 'active' : ''}
            aria-pressed={s === stage}
          >
            {s}. {stageLabel(s)}
          </button>
        ))}
      </div>
    </article>
  );
}

/**
 * stageLabel · Stage 数字 → 描述。
 */
function stageLabel(s: RevealStage): string {
  switch (s) {
    case 1: return 'UTC ?';
    case 2: return '23° N / 102° W';
    case 3: return '23.6345° N / 102.5528° W';
    case 4: return '进入此刻 →';
    case 5: return 'MEXICO CITY';
  }
}

export default UnknownCoordinate;