/* ============================================================
   看见地球 · v1.6.4 · PROMPT 46 v1 · CoordinateWindow
   ------------------------------------------------------------
   - Unknown Coordinate 坐标碎片展示(23° N / 102° W 等)
   - precision:rough / precise
   - Earth Blue 焦点圈(无障碍)
   - Stage 5 Success:Reveal 完成
   ============================================================ */

import type { ComponentState } from './types';
import styles from './CoordinateWindow.module.css';

export interface CoordinateWindowProps {
  lat: string;
  lon: string;
  precision: 'rough' | 'precise';
  state?: ComponentState;
  className?: string;
}

export function CoordinateWindow({
  lat,
  lon,
  precision,
  state = 'default',
  className,
}: CoordinateWindowProps) {
  const rootClass = [
    styles.coord,
    styles[`coord--${precision}`],
    styles[`coord--${state}`],
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={rootClass} data-state={state} data-precision={precision} role="group" aria-label="坐标窗口">
      <span className={styles.lat} data-field="lat">
        {lat}
      </span>
      <span className={styles.lon} data-field="lon">
        {lon}
      </span>
    </div>
  );
}

export default CoordinateWindow;