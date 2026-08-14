/* ============================================================
   看见地球 · v2.50.0 · CityIndexPage · /cities 城市地图集
   - 板块 2 的"全集"索引，展示全部 12 城
   - 编辑式信息流网格（不是大图卡）：编号 + 中英 + 国家 + 48×48 缩略图
   - 每张点击 → /cities/<slug>
   - 12 城以 4 列 × 3 行布局，移动端 2 列
   ============================================================ */

import { Link } from '@/router/Router';
import { cities } from '@/data/cities';
import Meta from '@/components/Meta';
import SyncMoment from '@/components/SyncMoment/SyncMoment';
import { useUserCity } from '@/components/UserCityPicker/UserCityContext';
import { cityImageUrl, cityImageSrcSet } from '@/lib/imageUrl';
import styles from './CityIndexPage.module.css';

export function CityIndexPage() {
  const { openPicker } = useUserCity();
  return (
    <div className={styles.page}>
      <Meta
        title="12 CITIES · 城市地图集 · 看见地球"
        description="Curated atlas — selected cities, seen one at a time. 编辑精选 12 座城市，看地球的 12 个切片。"
        ogType="website"
        canonicalPath="/cities"
      />
      {/* 顶部导航 */}
      <header className={styles.nav}>
        <Link href="/" className={styles.navBack}>
          <span aria-hidden="true">←</span> 返回 See Earth
        </Link>
      </header>

      {/* 章节 */}
      <section className={styles.header}>
        <span className={styles.kicker}>ATLAS</span>
        <h1 className={styles.title}>
          {cities.length} CITIES · 编辑精选
        </h1>
        <p className={styles.subtitle}>
          Curated atlas — selected cities, seen one at a time.
        </p>
      </section>

      {/* 12 城网格 */}
      <section className={styles.gridSection}>
        <ol className={styles.grid}>
          {cities.map((city, i) => (
            <li key={city.slug} className={styles.cell}>
              <Link
                href={city.href}
                className={styles.item}
                aria-label={`打开 ${city.nameZh} ${city.nameEn} 详情页 · ${city.nameZh} ${city.nameEn}`}
              >
                <span className={styles.num}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className={styles.thumb}>
                  {city.images[0] && (
                    <img
                      src={cityImageUrl(city.images[0].url, 120, 'webp', 65)}
                      srcSet={cityImageSrcSet(city.images[0].url, [120, 200], 'webp', 65)}
                      sizes="48px"
                      alt=""
                      loading="lazy"
                      decoding="async"
                      width={48}
                      height={48}
                    />
                  )}
                </span>
                <div className={styles.info}>
                  <span className={styles.nameZh}>{city.nameZh}</span>
                  <span className={styles.nameEn}>{city.nameEn}</span>
                </div>
                <span className={styles.country}>
                  {city.countryEn.toUpperCase()}
                </span>
                {/* v1.4 · PR #29 · 角落小卡片（chip） */}
                <span className={styles.syncChip}>
                  <SyncMoment city={city} variant="chip" />
                </span>
                <span className={styles.arrow} aria-hidden="true">→</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      {/* 底部链接：返回首页 + 关于 + 重新选择城市 */}
      <footer className={styles.footer}>
        <div className={styles.footerLinks}>
          <Link href="/" className={styles.footerLink}>
            <span aria-hidden="true">↑</span> 回到 See Earth 主页
          </Link>
          <Link href="/about" className={styles.footerLink}>
            关于本项目 / About
          </Link>
          <button
            type="button"
            className={styles.footerReselect}
            onClick={openPicker}
          >
            重新选择城市
          </button>
        </div>
      </footer>
    </div>
  );
}

export default CityIndexPage;
