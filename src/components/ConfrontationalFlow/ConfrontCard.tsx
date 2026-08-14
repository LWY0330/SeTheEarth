/* ============================================================
   看见地球 · v1.4 · ConfrontCard (PR #26)
   - 单张对峙卡片：level tag + 城市中/英 + momentZh + 时间时差 + 温度温差
   - 复用 PR #29 工具：useWeather(city) + useUserCity() + getTimeDiffHours
   - cityId 可能借用（khartoum / beirut / kyiv / cairo 不在 12 城内）→ 显示真实名 + 链接到借用 12 城
   ============================================================ */

import { useEffect, useState } from 'react';
import { Link } from '@/router/Router';
import type { LiveEvent, Level } from '@/data/liveMoments';
import { findCityByAnyKey } from '@/data/cities';
import { useWeather } from '@/lib/useWeather';
import { getWeatherIcon } from '@/lib/weatherCodes';
import { formatTimeDiff, getTimeDiffHours } from '@/lib/timeDiff';
import { WeatherIcon } from '@/components/WeatherIcon';
import { useUserCity } from '@/components/UserCityPicker/UserCityContext';
import { LevelTag } from './LevelTag';
import styles from './ConfrontCard.module.css';

export type ConfrontCardProps = {
  event: LiveEvent;
};

export function ConfrontCard({ event }: ConfrontCardProps) {
  const { userCity, userWeather } = useUserCity();
  // 找 12 城（cityId 可能借用）
  const city = findCityByAnyKey(event.cityId);
  const weather = useWeather(city);
  const titleId = `confront-${event.id}-title`;

  // 时间 1 分钟 tick（chip 也需要更新）
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 60000);
    return () => clearInterval(id);
  }, []);

  const tempText = weather ? `${Math.round(weather.temperature)}°` : '--°';
  const iconName = weather ? getWeatherIcon(weather.weatherCode) : 'unknown';

  // 时差（仅当用户已设 userCity 时计算；否则不显示）
  const diffH = userCity && city
    ? getTimeDiffHours(city.timezone, userCity.timezone)
    : null;

  // 温差（同上；userWeather 来自 Context，单一订阅）
  const diffC = weather && userWeather
    ? Math.round(weather.temperature - userWeather.temperature)
    : null;

  // 没找到 city（cityId 不在 12 城且借用失败）→ 仍渲染但禁用链接
  const href = city ? `/cities/${city.slug}` : '#';
  const canNavigate = !!city;

  const level: Level = event.level ?? 'blue';

  return (
    <article
      className={`${styles.card} ${styles[`level_${level}`]}`}
      aria-labelledby={titleId}
      data-level={level}
    >
      <LevelTag level={level} />

      <h3 id={titleId} className={styles.cityBlock}>
        <span className={styles.cityZh}>{event.cityNameZh}</span>
        <span className={styles.cityEn}>{event.cityNameEn}</span>
      </h3>

      <blockquote className={styles.moment}>
        「{event.momentZh ?? event.title}」
      </blockquote>

      <dl className={styles.meta}>
        <div className={styles.metaRow}>
          <dt className={styles.metaLabel}>当地</dt>
          <dd className={styles.metaValue}>
            <time dateTime={event.observedAt}>{event.localTime}</time>
            {diffH !== null && (
              <span className={styles.diff} aria-label={`与你时差 ${formatTimeDiff(diffH)}`}>
                · {formatTimeDiff(diffH)}
              </span>
            )}
          </dd>
        </div>
        <div className={styles.metaRow}>
          <dt className={styles.metaLabel}>天气</dt>
          <dd
            className={styles.metaValue}
            aria-label={
              weather
                ? `${event.cityNameZh} 当前 ${Math.round(weather.temperature)} 度 ${weather.weatherSummary}`
                : '天气加载中'
            }
          >
            <WeatherIcon
              name={iconName}
              size={14}
              className={styles.metaIcon}
              decorative={false}
              label={weather?.weatherSummary ?? '天气加载中'}
            />
            <span>{tempText}</span>
            {diffC !== null && (
              <span className={styles.diff} aria-label={`与你温差 ${diffC} 度`}>
                · 温差 {diffC > 0 ? '+' : ''}{diffC}°
              </span>
            )}
          </dd>
        </div>
      </dl>

      {canNavigate ? (
        <Link
          href={href}
          className={styles.viewCity}
          aria-label={`进入 ${event.cityNameZh} ${event.cityNameEn} 城市页 · VIEW CITY`}
        >
          VIEW CITY <span aria-hidden="true">→</span>
        </Link>
      ) : (
        <span
          className={styles.noLink}
          aria-label={`${event.cityNameZh} 不在 12 城内`}
        >
          不在 12 城内
        </span>
      )}
    </article>
  );
}

export default ConfrontCard;
