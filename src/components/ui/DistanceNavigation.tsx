/* ============================================================
   看见地球 · v1.6.4 · PROMPT 46 v1 · DistanceNavigation
   ------------------------------------------------------------
   - 城市间切换(← / → + 城市序号 / 总数)
   - City Detail Arrival 顶 + Echo 底部
   - Earth Blue 焦点圈(交互组件)
   ============================================================ */

import type { ComponentState, NavCityRef } from './types';
import styles from './DistanceNavigation.module.css';

export interface DistanceNavigationProps {
  prev: NavCityRef | null;
  next: NavCityRef | null;
  position: { current: number; total: number };
  cityEn: string;
  state?: ComponentState;
  className?: string;
}

export function DistanceNavigation({
  prev,
  next,
  position,
  cityEn,
  state = 'default',
  className,
}: DistanceNavigationProps) {
  const rootClass = [
    styles.nav,
    styles[`nav--${state}`],
    className,
  ].filter(Boolean).join(' ');

  return (
    <nav className={rootClass} data-state={state} aria-label="城市间导航">
      {prev ? (
        <a
          href={prev.href}
          className={styles.link}
          data-direction="prev"
        >
          <span className={styles.arrow}>←</span>
          <span className={styles.cityName}>{prev.nameEn}</span>
        </a>
      ) : (
        <span className={[styles.link, styles['link--disabled']].join(' ')} data-direction="prev" data-disabled="true">
          <span className={styles.arrow}>←</span>
          <span className={styles.cityName}>—</span>
        </span>
      )}
      <span className={styles.position}>
        {String(position.current).padStart(2, '0')} / {String(position.total).padStart(2, '0')}
      </span>
      <span className={styles.currentCity}>{cityEn}</span>
      {next ? (
        <a
          href={next.href}
          className={styles.link}
          data-direction="next"
        >
          <span className={styles.cityName}>{next.nameEn}</span>
          <span className={styles.arrow}>→</span>
        </a>
      ) : (
        <span className={[styles.link, styles['link--disabled']].join(' ')} data-direction="next" data-disabled="true">
          <span className={styles.cityName}>—</span>
          <span className={styles.arrow}>→</span>
        </span>
      )}
    </nav>
  );
}

export default DistanceNavigation;