/* ============================================================
   看见地球 · v2.8.0 · CityCard · 统一轻量卡（6 城等权）
   - 一视口完整呈现（1440×900 / 1366×768）
   - 极简内容：编号 + 国家 + 城市名
   - 3:2 固定图片比例
   ============================================================ */

import type { City } from '@/data/cities';
import { pickImage, getCurrentPeriod } from '@/data/cities';
import { cityImageUrl, cityImageSrcSet, CARD_WIDTHS } from '@/lib/imageUrl';
import styles from './CityCard.module.css';

export type CityCardProps = {
  city: City;
  index: number;
  onClick?: (city: City) => void;
};

export function CityCard({ city, index, onClick }: CityCardProps) {
  return (
    <article
      className={styles.card}
      onClick={() => onClick?.(city)}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick(city);
        }
      }}
      data-slug={city.slug}
    >
      <div className={styles.imageWrap}>
        <img
          className={styles.image}
          src={cityImageUrl(pickImage(city, getCurrentPeriod(city.timezone)).url, 600, 'webp')}
          srcSet={cityImageSrcSet(pickImage(city, getCurrentPeriod(city.timezone)).url, CARD_WIDTHS, 'webp')}
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          alt={`${city.nameZh} ${city.nameEn}`}
          loading={index < 3 ? 'eager' : 'lazy'}
          decoding="async"
          width={600}
          height={400}
        />
        <div className={styles.warmFilter} aria-hidden="true" />
      </div>

      <div className={styles.info}>
        <div className={styles.meta}>
          <span className={styles.number}>
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className={styles.region}>{city.countryEn.toUpperCase()}</span>
        </div>

        <h3 className={styles.name}>
          <span className={styles.nameZh}>{city.nameZh}</span>
          <span className={styles.nameEn}>{city.nameEn}</span>
        </h3>
      </div>
    </article>
  );
}

export default CityCard;
