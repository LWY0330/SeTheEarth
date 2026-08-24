/* ============================================================
   看见地球 · v2-phase15 · HomeHero
   - 全屏 Hero 板块：真实地球图 + 4 角城市时间 + 主标题 + 编辑元信息
   - 数据：cities.ts 真实数据 → 动态计算 4 城当地时间和温度
   - 复用 WorldTimeRail 的 city.ts helpers（getLocalTime / getTimezoneAbbrev）
   - A2 LOCK:复用 tokens.css 全部变量，无新设计
   ============================================================ */

import { useMemo } from 'react';
import { Link } from '@/router/Router';
import {
  cities,
  getLocalTime,
  type City,
} from '@/data/cities';
import styles from './HomeHero.module.css';

function offsetString(timezone: string, now: Date): string {
  try {
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'shortOffset',
    });
    const parts = fmt.formatToParts(now);
    const offset = parts.find((p) => p.type === 'timeZoneName')?.value ?? '';
    const match = offset.match(/GMT([+-]\d{1,2})(?::(\d{2}))?/);
    if (!match) return 'UTC+0';
    const sign = match[1].startsWith('-') ? '-' : '+';
    const hours = match[1].replace(/[+-]/, '');
    return `UTC${sign}${hours}`;
  } catch {
    return 'UTC+0';
  }
}

function findCity(id: string): City | undefined {
  return cities.find((c) => c.id === id);
}

function WorldClockBlock({ city }: { city: City }) {
  const now = useMemo(() => new Date(), []);
  const time = getLocalTime(city, now);
  const offset = offsetString(city.timezone, now);

  return (
    <Link
      href={city.href}
      className={styles.worldClock}
      aria-label={`${city.nameEn} 现在 ${time} ${offset} · ${city.weather.temperatureC}°C`}
    >
      <div className={styles.worldClockLabel}>
        <span className={styles.clockDot} aria-hidden="true" />
        <span className={styles.worldClockCity}>{city.nameEn.toUpperCase()}</span>
      </div>
      <div className={styles.worldClockTime}>{time}</div>
      <div className={styles.worldClockMeta}>
        <span className={styles.clockTz}>{offset}</span>
        {' · '}
        <span>{city.weather.temperatureC}°C</span>
      </div>
    </Link>
  );
}

function formatHeroDate(d: Date): string {
  const day = d.toLocaleDateString('en-US', { day: '2-digit', timeZone: 'UTC' });
  const month = d.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }).toUpperCase();
  const year = d.toLocaleDateString('en-US', { year: 'numeric', timeZone: 'UTC' });
  return `${day} ${month} ${year}`;
}

export function HomeHero() {
  // 4 个 city（可被替换 / 缺失时回落到其他城市）
  const tl = findCity('tokyo')     ?? cities[0];
  const tr = findCity('lisbon')    ?? cities[1] ?? cities[0];
  const bl = findCity('reykjavik') ?? cities[2] ?? cities[0];
  const br = findCity('cape-town') ?? cities[3] ?? cities[0];

  const heroDate = useMemo(() => formatHeroDate(new Date()), []);

  return (
    <section className={styles.hero} aria-label="Hero · 看见地球 · 世界此刻,同时发生">
      <div className={styles.earthImage} aria-hidden="true" />
      <div className={styles.atmosphere} aria-hidden="true" />
      <div className={styles.topFade} aria-hidden="true" />

      <div className={styles.heroInner}>
        {/* 左列：Tokyo + Reykjavík */}
        <div className={styles.cornerColumn}>
          <WorldClockBlock city={tl} />
          <WorldClockBlock city={bl} />
        </div>

        {/* 中央：元信息 + 主标 + 副标 */}
        <div className={styles.heroCenter}>
          <div className={styles.editorialMeta}>
            {heroDate}
            <span className={styles.editorialMetaSep}>·</span>
            12 COORDINATES
            <span className={styles.editorialMetaSep}>·</span>
            EARTH DAY
          </div>

          <h1 className={styles.heroTitle}>
            世界此刻,<br />
            <em>同时发生</em>。
          </h1>

          <p className={styles.heroSubtitle}>
            此刻,这颗行星上有 12 个远方正在同时运转。你在的位置,是其中之一。
          </p>
          <p className={styles.heroSubEn}>Right now, somewhere on Earth</p>
        </div>

        {/* 右列：Lisbon + Cape Town */}
        <div className={`${styles.cornerColumn} ${styles.right}`}>
          <WorldClockBlock city={tr} />
          <WorldClockBlock city={br} />
        </div>
      </div>

      <div className={styles.scrollHint} aria-hidden="true">
        <span className={styles.arrow}>↓</span>
        <span>SCROLL</span>
      </div>
    </section>
  );
}

export default HomeHero;
