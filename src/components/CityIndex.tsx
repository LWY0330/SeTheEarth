/* ============================================================
   看见地球 · v2.50.0 · CityIndex · 板块 2 右侧精选列表 + SEE ALL
   - 只渲染板块 2 主屏精选（featuredCities），5 个左右
   - 列表项最小高度 76px（72-96px 区间），留出呼吸感
   - 列表底部一个 SEE ALL 12 CITIES → 入口（→ /cities）
   - hover/focus/keyboard/click 行为不变
   ============================================================ */

import { useEffect, useRef } from 'react';
import type { City } from '@/data/cities';
import { Link } from '@/router/Router';
import { cityImageUrl, cityImageSrcSet } from '@/lib/imageUrl';
import styles from './CityIndex.module.css';

export type CityIndexProps = {
  cities: readonly City[];
  /** 当前 "展示" city 的 id（= focused ?? hovered ?? active） */
  activeCityId: string;
  baseIndex?: number;
  /** 总城市数（用于 SEE ALL 文字渲染，例如 "SEE ALL 12 CITIES →"） */
  totalCityCount?: number;
  onHover?: (cityId: string | null) => void;
  onFocus?: (cityId: string | null) => void;
};

const HOVER_DELAY_MS = 80;

export function CityIndex({
  cities,
  activeCityId,
  baseIndex = 0,
  totalCityCount,
  onHover,
  onFocus,
}: CityIndexProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  const handleEnter = (cityId: string) => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      onHover?.(cityId);
    }, HOVER_DELAY_MS);
  };

  const handleLeave = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    onHover?.(null);
  };

  const handleFocusCity = (cityId: string) => onFocus?.(cityId);
  const handleBlurCity = () => onFocus?.(null);

  const moveFocus = (i: number) => {
    const links = listRef.current?.querySelectorAll<HTMLAnchorElement>('[role="listitem"]');
    links?.[i]?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLAnchorElement>, i: number) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (i < cities.length - 1) {
        onHover?.(null);
        moveFocus(i + 1);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (i > 0) {
        onHover?.(null);
        moveFocus(i - 1);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onFocus?.(null);
      onHover?.(null);
      (e.currentTarget as HTMLElement).blur();
    }
  };

  return (
    <div className={styles.wrap}>
      <div
        ref={listRef}
        className={styles.index}
        role="list"
        aria-label={`城市精选 · 当前展示 ${cities.length} 城`}
      >
        {cities.map((city, i) => {
          const active = city.id === activeCityId;
          const displayNumber = String(baseIndex + i + 1).padStart(2, '0');
          const className = [styles.item, active ? styles.active : '']
            .filter(Boolean)
            .join(' ');
          return (
            <Link
              key={city.id}
              href={city.href}
              role="listitem"
              id={`city-opt-${i}`}
              tabIndex={0}
              className={className}
              aria-current={active ? 'page' : undefined}
              aria-label={`打开 ${city.nameZh} ${city.nameEn} 详情页`}
              onMouseEnter={() => handleEnter(city.id)}
              onMouseLeave={handleLeave}
              onFocus={() => handleFocusCity(city.id)}
              onBlur={handleBlurCity}
              onKeyDown={(e) => handleKeyDown(e, i)}
            >
              <span className={styles.number}>{displayNumber}</span>
              {/* v2.91.0 · 加缩略图：6 列表按 6 重新排版（β） */}
              {city.images[0] && (
                <span className={styles.thumb} aria-hidden="true">
                  <img
                    src={cityImageUrl(city.images[0].url, 80, 'webp', 65)}
                    srcSet={cityImageSrcSet(city.images[0].url, [80, 160], 'webp', 65)}
                    sizes="40px"
                    alt=""
                    loading="lazy"
                    decoding="async"
                    width={40}
                    height={40}
                  />
                </span>
              )}
              <div className={styles.info}>
                <span className={styles.nameZh}>{city.nameZh}</span>
                <span className={styles.nameEn}>{city.nameEn}</span>
              </div>
              <span className={styles.region}>{city.countryEn.toUpperCase()}</span>
            </Link>
          );
        })}
      </div>

      {/* SEE ALL 入口 → /cities 全集 */}
      <Link
        href="/cities"
        className={styles.seeAll}
        aria-label={`查看全部 ${totalCityCount ?? cities.length} 个城市 · SEE ALL ${totalCityCount ?? cities.length} CITIES`}
      >
        <span className={styles.seeAllLabel}>
          SEE ALL {totalCityCount ?? cities.length} CITIES
        </span>
        <span className={styles.seeAllArrow} aria-hidden="true">→</span>
      </Link>
    </div>
  );
}

export default CityIndex;
