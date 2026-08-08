/* ============================================================
   看见地球 · v2.60.0 · EventWeatherChip
   - 板块 3 (Moments Timeline) 内每个事件行的天气小标
   - 取自 open-meteo（15 分钟缓存 · city 级）
   - 紧凑行内：图标 + 文案 + 温度（单行）
   - 失败不渲染（保持编辑式克制 · 不强制兜底）
   ============================================================ */

import type { City } from '@/data/cities';
import { useWeather } from '@/lib/useWeather';
import { getWeatherIcon } from '@/lib/weather';
import { WeatherIcon } from './WeatherIcon';
import styles from './EventWeatherChip.module.css';

export type EventWeatherChipProps = {
  city: City;
  /** 暗色背景下用，icon 和文字反白 */
  inverted?: boolean;
};

export function EventWeatherChip({ city, inverted }: EventWeatherChipProps) {
  const weather = useWeather(city);

  if (!weather) {
    // 没拉到数据 → 不显示（不要因为一个 chip 把整个事件行搞乱）
    return null;
  }

  return (
    <span
      className={[styles.chip, inverted ? styles.inverted : ''].filter(Boolean).join(' ')}
      data-city={city.slug}
      aria-label={`${city.nameCn} 当前天气 ${weather.weatherSummary} ${Math.round(weather.temperature)} 度`}
    >
      <WeatherIcon
        name={getWeatherIcon(weather.weatherCode)}
        size={12}
        label={weather.weatherSummary}
      />
      <span className={styles.summary}>{weather.weatherSummary}</span>
      <span className={styles.temp}>{Math.round(weather.temperature)}°</span>
    </span>
  );
}

export default EventWeatherChip;
