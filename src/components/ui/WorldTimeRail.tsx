/* ============================================================
   看见地球 · v1.6.4 · PROMPT 46 v1 · WorldTimeRail
   ------------------------------------------------------------
   - 横向滚动时间条带(12 城市当前时间)
   - yourTime 高亮用户时区(Atmosphere Blue dot)
   - 跨页面:Homepage 顶栏 + City Detail Hero 底部
   ============================================================ */

import type { ComponentState, CityTime, LayerColor } from './types';
import { LAYER_CSS_VAR } from './types';
import styles from './WorldTimeRail.module.css';

export interface WorldTimeRailProps {
  cities: CityTime[];
  yourTime?: { timezone: string; label?: string };
  layerAccent?: LayerColor;
  state?: ComponentState;
  className?: string;
}

export function WorldTimeRail({
  cities,
  yourTime,
  layerAccent,
  state = 'default',
  className,
}: WorldTimeRailProps) {
  const rootClass = [
    styles.rail,
    styles[`rail--${state}`],
    className,
  ].filter(Boolean).join(' ');

  return (
    <section className={rootClass} data-state={state} data-layer={layerAccent ?? 'none'}>
      {yourTime && (
        <div className={styles.yourTime}>
          <span className={styles.yourDot} style={{ background: LAYER_CSS_VAR.unknown }} aria-hidden="true" />
          <span className={styles.yourLabel}>{yourTime.label ?? 'YOUR TIME'}</span>
        </div>
      )}
      <div className={styles.scroll}>
        {cities.map((c, i) => (
          <div
            key={i}
            className={styles.cell}
            data-timezone={c.timezone}
            data-active={c.timezone === yourTime?.timezone ? 'true' : 'false'}
          >
            <span className={styles.time}>{c.time ?? '--:--'}</span>
            <span className={styles.name}>{c.name}</span>
            {c.offset && <span className={styles.offset}>{c.offset}</span>}
          </div>
        ))}
      </div>
    </section>
  );
}

export default WorldTimeRail;