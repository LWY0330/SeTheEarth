/* ============================================================
   看见地球 · v2.40.0 · CityFeatured · 主视觉城市
   - 主图来自 pickImage(city, getCurrentPeriod(city.timezone))
   - 每 30s 重新计算时段；时段变化时切图（key=picked.url 重启 fade-in）
   - hover/focus/active 切换 → displayCity 变化 → 时段和图跟着变化
   - VIEW CITY → 是真实 <Link href={city.href}>
   ============================================================ */

import { useEffect, useState } from 'react';
import type { City } from '@/data/cities';
import { getCurrentPeriod, pickImage } from '@/data/cities';
import { Link } from '@/router/Router';
import CityNow from './CityNow';
import styles from './CityFeatured.module.css';

export type CityFeaturedProps = {
  city: City;
  index: number;
  total: number;
  /** 翻到上一条；不跳转，只换主图 */
  onPrev?: () => void;
  /** 翻到下一条；不跳转，只换主图 */
  onNext?: () => void;
};

export function CityFeatured({ city, index, total, onPrev, onNext }: CityFeaturedProps) {
  // 主图的"现在时段"每分钟检查一次（24 hours wrap 时段变化）
  // 当 picked 不变时（同一时段）—— 不需要重渲染。
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 60000);
    return () => clearInterval(id);
  }, []);

  const period = getCurrentPeriod(city.timezone);
  const picked = pickImage(city, period);

  return (
    <article
      key={city.slug}
      className={styles.featured}
      data-slug={city.slug}
      data-period={period}
      aria-label={`${city.nameCn} 主视觉区 · 当前时段 ${period}`}
    >
      <div className={styles.imageWrap} data-period={period}>
        <img
          key={picked.url /* 时段/城市切换 → 重启 fade-in */}
          className={styles.image}
          src={picked.url}
          alt={`${city.nameCn} ${city.nameEn}`}
          loading={index === 0 ? 'eager' : 'lazy'}
          style={{ objectPosition: picked.focus || '50% 50%' }}
          width={picked.width}
          height={picked.height}
        />
        <div className={styles.warmFilter} aria-hidden="true" />
        {/* 时段染色蒙版（夜/晨/午各有微差） */}
        <div
          className={`${styles.periodOverlay} ${styles[`period_${period}`]}`}
          aria-hidden="true"
        />
        <div className={styles.textGradient} aria-hidden="true" />

        {onPrev && (
          <button
            type="button"
            className={`${styles.navArrow} ${styles.navArrowLeft}`}
            onClick={onPrev}
            aria-label="上一座城市"
          >
            <span aria-hidden="true">‹</span>
          </button>
        )}
        {onNext && (
          <button
            type="button"
            className={`${styles.navArrow} ${styles.navArrowRight}`}
            onClick={onNext}
            aria-label="下一座城市"
          >
            <span aria-hidden="true">›</span>
          </button>
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.meta}>
          <span className={styles.number}>
            {String(index + 1).padStart(2, '0')} <span className={styles.total}>/ {String(total).padStart(2, '0')}</span>
          </span>
          <span className={styles.region}>FEATURED CITY</span>
        </div>

        <h2 className={styles.name}>
          <span className={styles.nameCn}>{city.nameCn}</span>
          <span className={styles.nameEn}>{city.nameEn}</span>
        </h2>

        <p className={styles.description}>{city.description}</p>

        <Link
          href={city.href}
          className={styles.viewCity}
          aria-label={`查看 ${city.nameCn} 详情页`}
        >
          VIEW CITY <span aria-hidden="true">→</span>
        </Link>
      </div>

      {/* CITY NOW（城市此刻卡 · 与主图共享同一个 city，所以时段自然同步） */}
      <div className={styles.cityNow}>
        <CityNow city={city} />
      </div>
    </article>
  );
}

export default CityFeatured;
