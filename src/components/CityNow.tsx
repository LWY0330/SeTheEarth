/* ============================================================
   看见地球 · v1.1 · CityNow
   - 城市此刻：localTime + dayPeriod + weather + oneObservation
   - weather: open-meteo 实时数据（15min 内存缓存），失败 → "Weather temporarily unavailable"
   - dayPeriod: 优先 sunrise-sunset.org 真实日照（v1.1 新增），失败 → 小时桶降级
   - 24 时区秒级刷新（每 30s 更新一次本地时间）
   ============================================================ */

import { useEffect, useState } from 'react';
import {
  getCityNow,
  getTimezoneAbbrev,
  type City,
  type DayPeriod,
} from '@/data/cities';
import {
  getWeatherSafe,
  getWeatherIcon,
  readFreshCache,
  type Weather,
} from '@/lib/weather';
import { getSunPeriodSafe } from '@/lib/sun';
import { WeatherIcon } from './WeatherIcon';
import styles from './CityNow.module.css';

export type CityNowProps = {
  city: City;
  /** 紧凑风格（用于 hover preview / 紧凑布局），省略 oneObservation */
  compact?: boolean;
  /** 暗色卡片背景（覆盖在 hero 图之上），由父组件决定 */
  inverted?: boolean;
};

function formatUpdatedAt(iso: string): string {
  // open-meteo 返回 "2026-08-08T07:30" 这种本地时区字符串；
  // 这里只取 HH:MM，作为"更新时间"提示。
  const m = iso.match(/T(\d{2}):(\d{2})/);
  if (m) return `${m[1]}:${m[2]}`;
  // 兜底：取 HH:MM
  const d = new Date(iso);
  if (!Number.isNaN(d.getTime())) {
    return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
  }
  return iso;
}

export function CityNow({ city, compact, inverted }: CityNowProps) {
  const [now, setNow] = useState(() => new Date());
  // 实时天气：从 open-meteo 拉（safe 版 → 失败返回 null）
  // 初次渲染同步从缓存取值，避免出现"短暂 unavailable"闪烁
  const [weather, setWeather] = useState<Weather | null>(() => readFreshCache(city.slug));
  // v1.1 · 真实日照时段（sunrise-sunset.org），失败回退到小时桶
  const [dayPeriod, setDayPeriod] = useState<DayPeriod | null>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  // city.slug 变化时拉一次（默认就有 15 分钟缓存，所以同城市不重复）
  useEffect(() => {
    let cancelled = false;
    const cached = readFreshCache(city.slug);
    if (!cached) setWeather(null); // 没有缓存时清空，进入"拉取中"状态
    getWeatherSafe(city).then((w) => {
      if (!cancelled) setWeather(w);
    });
    return () => {
      cancelled = true;
    };
  }, [city.slug]);

  // v1.1 · 真实日照数据驱动 dayPeriod；失败回退到小时桶（在 snap 里取）
  useEffect(() => {
    let cancelled = false;
    getSunPeriodSafe(city, new Date()).then((period) => {
      if (!cancelled) setDayPeriod(period);
    });
    return () => {
      cancelled = true;
    };
  }, [city.slug]);

  const snap = getCityNow(city, now);
  const tzAbbrev = getTimezoneAbbrev(city, now);

  // 优先用真实日照；拿不到数据时（dayPeriod === null）显示 hour-bucket 的 snap.dayPeriod
  const effectiveDayPeriod = dayPeriod ?? snap.dayPeriod;

  const className = [
    styles.root,
    compact ? styles.compact : '',
    inverted ? styles.inverted : '',
  ].filter(Boolean).join(' ');

  const iconName = weather ? getWeatherIcon(weather.weatherCode) : 'unknown';

  return (
    <div className={className} data-city={city.slug} aria-live="polite">
      <div className={styles.label}>CITY NOW</div>

      <div className={styles.timeRow}>
        <span className={styles.localTime}>{snap.localTime}</span>
        <span className={styles.tz}>{tzAbbrev || snap.timezone}</span>
        <span className={styles.dayPeriod}>· {effectiveDayPeriod}</span>
      </div>

      <div className={styles.weatherRow}>
        <span className={styles.icon}>
          <WeatherIcon name={iconName} size={16} label={weather?.weatherSummary} />
        </span>
        {weather ? (
          <>
            <span className={styles.summary}>{weather.weatherSummary}</span>
            <span className={styles.temperature}>
              {Math.round(weather.temperature)}°C
            </span>
          </>
        ) : (
          <span className={styles.unavailable}>Weather temporarily unavailable</span>
        )}
      </div>

      {!compact && (
        <p className={styles.observation}>「{snap.oneObservation}」</p>
      )}

      <div className={styles.source}>
        <span className={styles.sourceLabel}>weather</span>
        <span className={styles.sourceSep}>·</span>
        <span className={styles.sourceName}>open-meteo + sunrise-sunset</span>
        <span className={styles.sourceSep}>·</span>
        <span className={styles.sourceUpdated}>
          updated {weather ? formatUpdatedAt(weather.updatedAt) : '—'}
        </span>
      </div>
    </div>
  );
}

export default CityNow;
