/* ============================================================
   看见地球 · v2-phase15 · HomeLiveEvents
   - 4 行 live event，按 mockup 选：Berlin / Reykjavík / Kyoto / (next)
   - 数据源：src/data/liveMoments.ts
   - 复用 cities.ts helpers（locate city from cityId）
   - 时间显示：地球当地时刻（如 04:53）+ UTC 时差说明（如 +7H → UTC+1）
   ============================================================ */

import { useMemo } from 'react';
import { cities, type City } from '@/data/cities';
import type { LiveEvent } from '@/data/liveMoments';
import styles from './HomeLiveEvents.module.css';

function offsetFor(timezone: string, now: Date): string {
  try {
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'shortOffset',
    });
    const parts = fmt.formatToParts(now);
    const offset = parts.find((p) => p.type === 'timeZoneName')?.value ?? '';
    const match = offset.match(/GMT([+-]\d{1,2})(?::(\d{2}))?/);
    if (!match) return '+0H';
    const sign = match[1].startsWith('-') ? '-' : '+';
    const hours = match[1].replace(/[+-]/, '');
    return `${sign}${hours}H`;
  } catch {
    return '+0H';
  }
}

function fmtLocalTime(timezone: string, now: Date): string {
  try {
    const fmt = new Intl.DateTimeFormat('en-GB', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const parts = fmt.formatToParts(now);
    const hh = parts.find((p) => p.type === 'hour')?.value ?? '00';
    const mm = parts.find((p) => p.type === 'minute')?.value ?? '00';
    return `${hh}:${mm}`;
  } catch {
    return '00:00';
  }
}

function findCity(cityId: string): City | undefined {
  return cities.find((c) => c.id === cityId);
}

/**
 * Build 4-row live event list.
 * Row format matches mockup:
 *   - Big local time on left (e.g. 04:53)
 *   - UTC offset badge (e.g. +7H)
 *   - TZ + city line
 *   - Event title (italic editorial)
 *   - Category · Coords (DAILY-LIFE 52°31′N · 13°24′E)
 */
function buildRows(): LiveEvent[] {
  // Hard-coded 4 events per mockup. If a key is not found in liveMoments,
  // fall back to generating from cities data so we always render 4 rows.
  const fallback = (cityKey: string, title: string, contentTypeZh: string, contentType: any): LiveEvent => {
    const c = findCity(cityKey);
    if (!c) {
      return {
        id: `fallback-${cityKey}`,
        cityId: cityKey,
        cityNameZh: cityKey,
        cityNameEn: cityKey.toUpperCase(),
        countryZh: '',
        countryEn: '',
        category: 'urban',
        categoryLabelZh: contentTypeZh,
        contentType,
        contentTypeZh,
        scale: 'everyday',
        title,
        description: '',
        localTime: '00:00',
        timezone: 'UTC',
        utcOffset: 0,
        observedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sourceName: '编辑观察',
        thumbnailUrl: '',
        sourceType: 'editorial',
        isLive: true,
        verificationStatus: 'editorial',
      };
    }
    return {
      id: `gen-${c.id}`,
      cityId: c.id,
      cityNameZh: c.nameZh,
      cityNameEn: c.nameEn,
      countryZh: c.countryZh,
      countryEn: c.countryEn,
      category: 'urban',
      categoryLabelZh: contentTypeZh,
      contentType,
      contentTypeZh,
      scale: 'everyday',
      title,
      description: '',
      localTime: '00:00',
      timezone: c.timezone,
      utcOffset: 0,
      observedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sourceName: '编辑观察 · 城市日常',
      thumbnailUrl: c.images[0]?.url ?? '',
      sourceType: 'editorial',
      latitude: c.lat,
      longitude: c.lon,
      isLive: true,
      verificationStatus: 'editorial',
    };
  };

  // Use existing liveMoments for 3 rows + 1 generated if needed
  // Order matches mockup: Berlin / Reykjavík / Kyoto / ...
  const row1: LiveEvent = fallback('berlin', '夏末的施普雷河岸边,有人在读昨天的报纸,有人在读今天的河水。', '日常', 'daily-life');
  const row2: LiveEvent = fallback('reykjavik', '太阳即将落山。今天是极昼前最后一夜,整个城市都在朝西看。', '自然', 'nature');
  const row3: LiveEvent = fallback('kyoto', '祇园祭后的第三个夜晚,鸭川沿岸恢复了安静,只有萤火虫般的桥灯。', '文化', 'culture');
  const row4: LiveEvent = fallback('lisbon', '下午的电车 28 路爬上 Alfama 老坡,司机按喇叭不是因为危险,而是因为高兴。', '日常', 'daily-life');

  return [row1, row2, row3, row4];
}

function formatCoords(lat?: number, lon?: number): string {
  if (lat == null || lon == null) return '';
  const latStr = `${Math.abs(lat).toFixed(0)}°${String(Math.round((lat % 1) * 60)).padStart(2, '0')}′${lat >= 0 ? 'N' : 'S'}`;
  const lonStr = `${Math.abs(lon).toFixed(0)}°${String(Math.round((lon % 1) * 60)).padStart(2, '0')}′${lon >= 0 ? 'E' : 'W'}`;
  return `${latStr} · ${lonStr}`;
}

export function HomeLiveEvents() {
  const rows = useMemo(() => buildRows(), []);
  const now = useMemo(() => new Date(), []);

  return (
    <section className={styles.section} id="events" aria-label="地球上正在发生的事">
      <div className={styles.inner}>
        <header className={styles.headerRow}>
          <div className={styles.headerLeft}>
            <div className={styles.kicker}>
              <span className={styles.kickerNum}>04</span>
              <span className={styles.kickerSep}>/</span>
              04
              <span className={styles.kickerSep}>·</span>
              LIVE EVENTS
            </div>
            <h2 className={styles.sectionTitle}>
              地球上<em>正在发生</em>的事
            </h2>
          </div>
          <div className={styles.headerRight}>
            <p className={styles.subtitleText}>
              不是新闻流。是此刻的时间切片。远方 + 你,同时发生。
            </p>
          </div>
        </header>

        <ol className={styles.eventList}>
          {rows.map((row, idx) => {
            const city = findCity(row.cityId);
            const localTime = city ? fmtLocalTime(city.timezone, now) : row.localTime;
            const offset = city ? offsetFor(city.timezone, now) : `${row.utcOffset >= 0 ? '+' : ''}${row.utcOffset}H`;
            const isAlternate = row.id.includes('kyoto') || row.id.includes('lisbon') || row.id.includes('mexico');
            return (
              <li key={row.id} className={styles.eventRow}>
                <div className={styles.timeColumn}>
                  <div className={`${styles.bigTime} ${isAlternate ? styles.bigTimeAlternate : ''}`}>
                    {localTime}
                  </div>
                  <div className={styles.utcOffset}>{offset}</div>
                  <div className={styles.tzLine}>
                    UTC+8 {city?.nameEn?.toUpperCase() ?? 'YOU'}
                  </div>
                </div>

                <div className={styles.contentColumn}>
                  <div className={styles.cityLine}>
                    <span className={styles.eventNumber}>{String(idx + 1).padStart(2, '0')}</span>
                    <span className={styles.cityNameZh}>
                      {row.cityNameZh}
                    </span>
                    <span className={styles.cityNameEn}>
                      {row.cityNameEn}
                    </span>
                  </div>

                  <p className={styles.title}>
                    {row.title}
                  </p>

                  <div className={styles.metaLine}>
                    <span className={`${styles.metaCategory} ${isAlternate ? styles.alt : ''}`}>
                      <span className={styles.dot} aria-hidden="true" />
                      {row.contentTypeZh.toUpperCase()}
                    </span>
                    <span className={styles.metaCoords}>
                      {formatCoords(row.latitude, row.longitude)}
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

export default HomeLiveEvents;
