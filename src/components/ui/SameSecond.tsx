/* ============================================================
   看见地球 · v1.6.4 · PROMPT 46 v1 · SameSecond
   ------------------------------------------------------------
   - 3 座城市并置(横向对比)+ 极细竖线分隔
   - 1px hairline divider
   - 三栏平权(无视觉权重差异)
   - 当前城市排除(per spec §3.2.3)
   ============================================================ */

import type { ComponentState } from './types';
import type { CityComparison } from './types';
import styles from './SameSecond.module.css';

export interface SameSecondProps {
  cities: CityComparison[];
  currentCityId?: string;
  dividerStyle?: 'hairline' | 'none';
  state?: ComponentState;
  className?: string;
}

export function SameSecond({
  cities,
  currentCityId,
  dividerStyle = 'hairline',
  state = 'default',
  className,
}: SameSecondProps) {
  // 排除当前城市
  const partners = currentCityId
    ? cities.filter((c) => c.id !== currentCityId)
    : cities;

  const rootClass = [
    styles.sameSecond,
    styles[`sameSecond--${state}`],
    className,
  ].filter(Boolean).join(' ');

  return (
    <section className={rootClass} data-state={state} data-partners={partners.length}>
      <header className={styles.header}>
        <h2 className={styles.title}>Same second, elsewhere</h2>
      </header>
      <div
        className={[
          styles.grid,
          dividerStyle === 'hairline' && styles['grid--hairline'],
        ].filter(Boolean).join(' ')}
      >
        {partners.map((partner, i) => (
          <article
            key={partner.id}
            className={styles.col}
            data-layer={partner.layer}
            data-partner={partner.id}
            data-col={i}
          >
            <span className={styles.time}>{partner.time}</span>
            <span className={styles.cityCn}>{partner.name}</span>
            <span className={styles.country}>{partner.country.toUpperCase()}</span>
            <p className={styles.description}>{partner.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default SameSecond;