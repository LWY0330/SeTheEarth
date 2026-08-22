/* ============================================================
   看见地球 · v1.6.4 · PROMPT 46 v1 · RevealMeta
   ------------------------------------------------------------
   - Unknown Coordinate Reveal 序列(UTC ? → 23° N → 完整坐标)
   - 5 阶段映射 per d10-unknown-coordinate §2.1
   - Stage 4 唯一可交互(进入此刻 → CTA)
   ============================================================ */

import type { ComponentState, RevealStage } from './types';
import styles from './RevealMeta.module.css';

export interface RevealMetaProps {
  stage: RevealStage;
  time: string;
  coords: string | null;
  cityEn: string | null;
  state?: ComponentState;
  onEnterClick?: () => void;
  className?: string;
}

export function RevealMeta({
  stage,
  time,
  coords,
  cityEn,
  state = 'default',
  onEnterClick,
  className,
}: RevealMetaProps) {
  const rootClass = [
    styles.meta,
    styles[`meta--stage-${stage}`],
    styles[`meta--${state}`],
    className,
  ].filter(Boolean).join(' ');

  return (
    <section className={rootClass} data-state={state} data-stage={stage} aria-label="Reveal 序列">
      <header className={styles.header}>
        <span className={styles.kicker}>SECOND 0{stage} / 05</span>
        <span className={styles.label}>SEE EARTH</span>
      </header>
      <div className={styles.utcLine}>
        <span className={styles.time}>{time}</span>
        {coords && stage >= 2 ? (
          <span className={styles.coords}>{coords}</span>
        ) : (
          <span className={styles.coordsUnknown}>UTC <span className={styles.qmark}>?</span></span>
        )}
      </div>
      {stage === 5 && cityEn && (
        <p className={styles.cityReveal}>{cityEn}</p>
      )}
      {stage === 4 && (
        <button
          type="button"
          className={styles.cta}
          onClick={onEnterClick}
        >
          进入此刻 →
        </button>
      )}
    </section>
  );
}

export default RevealMeta;