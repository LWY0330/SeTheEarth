/* ============================================================
   看见地球 · v1.6.4 · PROMPT 46 v1 · TimeComparison
   ------------------------------------------------------------
   - 3 段时间并置(主城市 / 中间对比 / Your Time)
   - align:horizontal / vertical
   - City Detail 专用(03 Same Second + Arrival Hero 底部)
   ============================================================ */

import type { ComponentState, TimeComparisonItem } from './types';
import styles from './TimeComparison.module.css';

export interface TimeComparisonProps {
  items: TimeComparisonItem[];
  delta?: string;
  align?: 'horizontal' | 'vertical';
  state?: ComponentState;
  className?: string;
}

export function TimeComparison({
  items,
  delta,
  align = 'horizontal',
  state = 'default',
  className,
}: TimeComparisonProps) {
  const rootClass = [
    styles.compare,
    styles[`compare--${align}`],
    styles[`compare--${state}`],
    className,
  ].filter(Boolean).join(' ');

  return (
    <section className={rootClass} data-state={state} data-align={align} data-items={items.length}>
      <div className={styles.grid}>
        {items.map((item, i) => (
          <div
            key={i}
            className={styles.cell}
            data-layer={item.layer ?? 'none'}
            data-col={i}
          >
            <span className={styles.time}>{item.time}</span>
            <span className={styles.city}>{item.city}</span>
            {item.delta && <span className={styles.delta}>{item.delta}</span>}
          </div>
        ))}
      </div>
      {delta && <span className={styles.deltaCenter}>{delta}</span>}
    </section>
  );
}

export default TimeComparison;