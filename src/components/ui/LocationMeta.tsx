/* ============================================================
   看见地球 · v1.6.4 · PROMPT 46 v1 · LocationMeta
   ------------------------------------------------------------
   - 城市 / 国家 / 坐标 meta 信息
   - City Detail 专用(Arrival / One Scene 顶部)
   ============================================================ */

import type { ComponentState, LayerColor } from './types';
import { LAYER_CSS_VAR } from './types';
import styles from './LocationMeta.module.css';

export interface LocationMetaProps {
  cityEn: string;
  countryEn: string;
  coords: string;
  date?: string;
  layer?: LayerColor;
  state?: ComponentState;
  className?: string;
}

export function LocationMeta({
  cityEn,
  countryEn,
  coords,
  date,
  layer,
  state = 'default',
  className,
}: LocationMetaProps) {
  const rootClass = [
    styles.meta,
    styles[`meta--${state}`],
    className,
  ].filter(Boolean).join(' ');

  const dotColor = layer ? LAYER_CSS_VAR[layer] : LAYER_CSS_VAR.unknown;

  return (
    <div className={rootClass} data-state={state} data-layer={layer ?? 'none'}>
      <span className={styles.line1}>
        {layer && (
          <span
            className={styles.dot}
            style={{ background: dotColor }}
            aria-hidden="true"
          />
        )}
        <span className={styles.cityEn}>{cityEn.toUpperCase()}</span>
        <span className={styles.sep}>·</span>
        <span className={styles.countryEn}>{countryEn.toUpperCase()}</span>
      </span>
      <span className={styles.coords}>{coords}</span>
      {date && <span className={styles.date}>{date}</span>}
    </div>
  );
}

export default LocationMeta;