/* ============================================================
   看见地球 · v2.30.0 · CityPage
   - 路由目标 /cities/:slug
   - 顶部导航 → 城市主图 → 城市标题 → 国家 → 当地时间 → 一句观察
   - → 城市简介 → CityNow → 当地生活 → 文化背景 → 相关城市 → 返回首页
   - 不在板块 2 内直接展示，但被 VIEW CITY → 跳转
   ============================================================ */

import { useEffect, useMemo, useState } from 'react';
import { Link, useRoute } from '@/router/Router';
import {
  cities,
  findCity,
  getCityNow,
  getTimezoneAbbrev,
  getCurrentPeriod,
  pickImage,
  type City,
} from '@/data/cities';
import CityNow from './CityNow';
import styles from './CityPage.module.css';

function pickRelated(current: City): City[] {
  // 选取 3 个相关城市：① 同大洲 ② 时区接近 ③ 随机补足 3 个
  const others = cities.filter((c) => c.slug !== current.slug);
  const sameCountry = others.filter(
    (c) => c.countryEn.toUpperCase() === current.countryEn.toUpperCase()
  );
  const sameCountryExcluded = others.filter(
    (c) => c.countryEn.toUpperCase() !== current.countryEn.toUpperCase()
  );
  const pool: City[] = [];
  for (const c of sameCountry) {
    if (pool.length >= 3) break;
    pool.push(c);
  }
  for (const c of sameCountryExcluded) {
    if (pool.length >= 3) break;
    pool.push(c);
  }
  return pool.slice(0, 3);
}

export function CityPage() {
  const route = useRoute();
  const slug = route.name === 'city' ? route.params.slug : '';
  const city = useMemo(() => findCity(slug), [slug]);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  // 404-ish 态：如果 slug 不在 cities 内，提示回首页
  if (!city) {
    return (
      <div className={styles.notFound}>
        <p className={styles.notFoundText}>城市 "{slug}" 不存在。</p>
        <Link href="/" className={styles.notFoundLink}>
          ← 返回首页
        </Link>
      </div>
    );
  }

  const snap = getCityNow(city, now);
  const tz = getTimezoneAbbrev(city, now);
  const related = pickRelated(city);

  return (
    <div className={styles.page}>
      {/* 顶部导航 */}
      <header className={styles.nav}>
        <Link href="/" className={styles.navBack}>
          <span aria-hidden="true">←</span> 返回 See Earth
        </Link>
        <span className={styles.navNumber}>
          {String(cities.findIndex((c) => c.slug === city.slug) + 1).padStart(2, '0')}
          <span className={styles.navNumberOf}> / {String(cities.length).padStart(2, '0')}</span>
        </span>
      </header>

      {/* 城市主图 */}
      <section className={styles.hero}>
        <div className={styles.heroImage}>
          {(() => {
            const pickedHero = pickImage(city, getCurrentPeriod(city.timezone));
            return (
              <img
                src={pickedHero.url}
                alt={`${city.nameCn} ${city.nameEn}`}
                style={{ objectPosition: pickedHero.focus || '50% 50%' }}
                loading="eager"
                width={pickedHero.width}
                height={pickedHero.height}
              />
            );
          })()}
          <div className={styles.heroFilter} aria-hidden="true" />
          <div className={styles.heroText}>
            <span className={styles.heroKicker}>{city.countryEn.toUpperCase()}</span>
            <h1 className={styles.heroTitle}>
              <span className={styles.heroNameCn}>{city.nameCn}</span>
              <span className={styles.heroNameEn}>{city.nameEn}</span>
            </h1>
          </div>
        </div>
      </section>

      {/* 城市简介 + 时间 + 一句观察 */}
      <section className={styles.summary}>
        <div className={styles.summaryGrid}>
          <p className={styles.description}>{city.description}</p>
          <div className={styles.summaryMeta}>
            <div className={styles.summaryTime}>
              <span className={styles.summaryTimeLabel}>当地时间</span>
              <span className={styles.summaryTimeValue}>{snap.localTime}</span>
              <span className={styles.summaryTimeTz}>{tz || city.timezone}</span>
            </div>
            <p className={styles.summaryObservation}>「{snap.oneObservation}」</p>
          </div>
        </div>
      </section>

      {/* 城市此刻（CITY NOW） */}
      <section className={styles.section}>
        <header className={styles.sectionHeader}>
          <span className={styles.sectionNumber}>01</span>
          <h2 className={styles.sectionTitle}>城市此刻</h2>
          <span className={styles.sectionHint}>Live snapshot</span>
        </header>
        <div className={styles.cityNowWrap}>
          <CityNow city={city} />
        </div>
      </section>

      {/* 当地生活 */}
      {city.livingNote && (
        <section className={styles.section}>
          <header className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>02</span>
            <h2 className={styles.sectionTitle}>当地生活</h2>
            <span className={styles.sectionHint}>Local life</span>
          </header>
          <p className={styles.paragraph}>{city.livingNote}</p>
        </section>
      )}

      {/* 文化背景 */}
      {city.cultureNote && (
        <section className={styles.section}>
          <header className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>03</span>
            <h2 className={styles.sectionTitle}>文化背景</h2>
            <span className={styles.sectionHint}>Culture</span>
          </header>
          <p className={styles.paragraph}>{city.cultureNote}</p>
        </section>
      )}

      {/* 相关城市 */}
      <section className={styles.section}>
        <header className={styles.sectionHeader}>
          <span className={styles.sectionNumber}>04</span>
          <h2 className={styles.sectionTitle}>相关城市</h2>
          <span className={styles.sectionHint}>Related cities</span>
        </header>
        <div className={styles.relatedGrid}>
          {related.map((c) => (
            <Link key={c.slug} href={c.href} className={styles.relatedCard}>
              <div className={styles.relatedThumb}>
                <img src={pickImage(c, getCurrentPeriod(c.timezone)).url} alt="" loading="lazy" />
                <div className={styles.relatedFilter} aria-hidden="true" />
              </div>
              <div className={styles.relatedInfo}>
                <span className={styles.relatedCn}>{c.nameCn}</span>
                <span className={styles.relatedEn}>{c.nameEn}</span>
                <span className={styles.relatedCountry}>
                  {c.countryEn.toUpperCase()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 返回首页 */}
      <footer className={styles.footer}>
        <Link href="/" className={styles.footerLink}>
          <span aria-hidden="true">↑</span> 回到 See Earth 主页
        </Link>
      </footer>
    </div>
  );
}

export default CityPage;
