/* ============================================================
   看见地球 · v2-phase15 · HomeCoordinates
   - 12 Coordinates 板块：实时呈现 11 城 + Khartoum 占位
   - 12 城真实街景图（Unsplash URL · 12 城市真实地点图像 URL 清单）
   - 第一城（kyoto）作为主视觉放大版
   - 剩余 11 城（含 Khartoum 占位）以 3x4 网格呈现
   - 实时计算每城当地时间
   ============================================================ */

import { useMemo } from 'react';
import { Link } from '@/router/Router';
import {
  cities,
  getLocalTime,
  type City,
} from '@/data/cities';
import styles from './HomeCoordinates.module.css';

/**
 * 12 城真实街景 URL（按订单顺序与清单对齐）
 * 数据源：项目 /07-设计师设计参考/视觉素材/12 城市真实地点图像 URL 清单.md
 */
const CITY_STREET_IMAGES: Record<string, string> = {
  berlin:    'https://images.unsplash.com/photo-1680559100495-2cf9ce829a2c?q=80&w=2075&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'cape-town': 'https://images.unsplash.com/photo-1669975617250-a0b6343c8d49?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  kyoto:     'https://images.unsplash.com/photo-1561503972-839d0c56de17?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  lisbon:    'https://images.pexels.com/photos/35583235/pexels-photo-35583235.jpeg',
  london:    'https://images.unsplash.com/photo-1622143166019-ab65343466e4?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'mexico-city': 'https://images.unsplash.com/photo-1739224739508-858899e29a35?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  reykjavik: 'https://images.unsplash.com/photo-1708017591604-25796717d692?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  rio:       'https://images.unsplash.com/photo-1658699793346-131bb2be8c76?q=80&w=1036&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  rome:      'https://images.unsplash.com/photo-1566896212627-e4f210557f0c?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  shanghai:  'https://images.unsplash.com/photo-1573064927936-37b06675e67e?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fHNoYW5naGFpJTIwc3RyZWV0fGVufDB8fDB8fHww',
  sydney:    'https://images.unsplash.com/photo-1530276371031-2511efff9d5a?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  tokyo:     'https://plus.unsplash.com/premium_photo-1690957591806-95a2b81b1075?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  // Khartoum（占位 · 缺数据）
  khartoum:  '',
};

/** 12 城按 mockup 顺序排列（Khartoum 第 5 个但占位） */
const ORDERED_IDS = [
  'reykjavik', // 01
  'lisbon',    // 02
  'mexico-city', // 03
  'tokyo',     // 04
  'sydney',    // 05
  'cape-town', // 06
  'rio',       // 07
  'london',    // 08
  'shanghai',  // 09
  'rome',      // 10
  'berlin',    // 11
  'khartoum',  // 12 占位
];

function findCity(id: string): City | undefined {
  return cities.find((c) => c.id === id);
}

export function HomeCoordinates() {
  const now = useMemo(() => new Date(), []);

  // Featured = kyoto（第一个视觉上最重要的）
  const featured = findCity('kyoto');

  // Tile list = 11 真实城 + Khartoum 占位 = 12
  const restOrderedIds = ORDERED_IDS.filter((id) => id !== 'kyoto');

  return (
    <section className={styles.section} id="coordinates" aria-label="12 Coordinates · 12 个同时运转的远方">
      {/* Anchor alias · 同时被顶部导航 #cities / #my-coordinates 引用。
          HTML 不支持一个元素多 id，所以用空 anchor 元素补齐缺失的 id。 */}
      <span id="cities" aria-hidden="true" />
      <span id="my-coordinates" aria-hidden="true" />
      <div className={styles.inner}>
        <header className={styles.headerRow}>
          <div className={styles.headerLeft}>
            <div className={styles.kicker}>
              <span className={styles.kickerNum}>01</span>
              <span className={styles.kickerSep}>/</span>
              04
              <span className={styles.kickerSep}>·</span>
              TODAY — 12 COORDINATES
            </div>
            <h2 className={styles.sectionTitle}>
              12 个<em>同时运转</em>的远方
            </h2>
          </div>
          <div className={styles.headerRight}>
            <p className={styles.subtitleText}>
              同一时刻里,12 座城市正在发生不同的现实。<br />
              这是它们的<em>此刻</em>。
            </p>
          </div>
        </header>

        <div className={styles.layout}>
          {/* 左：featured (kyoto) */}
          {featured && (
            <Link
              href={featured.href}
              className={styles.featured}
              aria-label={`${featured.nameZh} 此刻 ${getLocalTime(featured, now)}`}
            >
              <img
                className={styles.featuredImage}
                src={CITY_STREET_IMAGES['kyoto']}
                srcSet={CITY_STREET_IMAGES['kyoto']}
                alt={`${featured.nameEn} 街景`}
                loading="eager"
                decoding="async"
              />
              <div className={styles.featuredOverlay} aria-hidden="true" />

              <div className={styles.featuredMeta}>
                <span className={styles.featuredMetaNum}>01 / 12</span>
                <span className={styles.featuredMetaRegion}>{featured.countryEn.toUpperCase()}</span>
              </div>

              <div className={styles.featuredNameWrap}>
                <h3 className={styles.featuredName}>{featured.nameZh}</h3>
                <p className={styles.featuredTagline}>Kyoto · the slow city</p>
              </div>

              <div className={styles.featuredTimeBlock}>
                <span className={styles.featuredTime}>{getLocalTime(featured, now)}</span>
                <span className={styles.featuredTz}>
                  UTC+9 · {featured.weather.temperatureC}°C
                </span>
              </div>
            </Link>
          )}

          {/* 右：网格 */}
          <div className={styles.grid}>
            {restOrderedIds.map((id, idx) => {
              const city = findCity(id);
              const displayIdx = idx + 2;
              if (!city) {
                // Khartoum 占位
                return (
                  <div
                    key={id}
                    className={styles.tile}
                    aria-label="Khartoum · 占位 · 待补"
                    role="img"
                  >
                    <div className={styles.tilePlaceholder}>
                      <div className={styles.tilePlaceholderLabel}>
                        KHARTOUM<br />
                        (待补 · 占位)
                      </div>
                    </div>
                    <div className={styles.tileOverlay} aria-hidden="true" />
                    <div className={styles.tileMeta}>
                      <span className={styles.tileMetaNum}>{String(displayIdx).padStart(2, '0')} / 12</span>
                      <span className={styles.tileMetaRegion}>SUDAN</span>
                    </div>
                    <div className={styles.tileInfo}>
                      <span className={styles.tileCityZh}>喀土穆</span>
                      <span className={styles.tileTimeRow}>
                        <span className={styles.tileTime}>— — </span>
                      </span>
                    </div>
                  </div>
                );
              }

              const localTime = getLocalTime(city, now);
              const imageUrl = CITY_STREET_IMAGES[city.id];

              return (
                <Link
                  key={city.id}
                  href={city.href}
                  className={styles.tile}
                  aria-label={`${city.nameEn} 此刻 ${localTime}`}
                >
                  {imageUrl ? (
                    <img
                      className={styles.tileImage}
                      src={imageUrl}
                      alt={`${city.nameEn} 街景`}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className={styles.tilePlaceholder}>
                      <div className={styles.tilePlaceholderLabel}>
                        {city.nameEn.toUpperCase()}<br />
                        (待补图)
                      </div>
                    </div>
                  )}
                  <div className={styles.tileOverlay} aria-hidden="true" />
                  <div className={styles.tileMeta}>
                    <span className={styles.tileMetaNum}>{String(displayIdx).padStart(2, '0')} / 12</span>
                    <span className={styles.tileMetaRegion}>{city.countryEn.toUpperCase()}</span>
                  </div>
                  <div className={styles.tileInfo}>
                    <span className={styles.tileCityZh}>{city.nameZh}</span>
                    <span className={styles.tileTimeRow}>
                      <span className={styles.tileTime}>{localTime}</span>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomeCoordinates;
