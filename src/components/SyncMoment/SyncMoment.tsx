/* ============================================================
   看见地球 · v1.4 · SyncMoment (PR #29)
   - 角落小卡片：远方城市 × 用户本地城市 的"同步感"对比
   - 三种 variant：
       full    CityPage hero 下方（时间 + 温度 + 时差 + 温差）
       compact CityFeatured 主图右下角（时间 + 温度，去掉时差）
       chip    CityIndexPage 卡片右下角（单行 [时间 · 时差]）
   - 暗色背景自动反白（CityFeatured 用 inverted）
   - 任一数据缺失都"无声降级"（占位符 + console.warn，不抛错）
   ============================================================ */

import { useEffect, useState } from 'react';
import type { City } from '@/data/cities';
import { useWeather } from '@/lib/useWeather';
import { getWeatherIcon } from '@/lib/weatherCodes';
import { getTimeDiffHours } from '@/lib/timeDiff';
import { WeatherIcon } from '@/components/WeatherIcon';
import { useUserCity } from '@/components/UserCityPicker/UserCityContext';
import { TimeBlock } from './TimeBlock';
import { DiffBlock } from './DiffBlock';

export type SyncMomentVariant = 'full' | 'compact' | 'chip';

export type SyncMomentProps = {
  city: City;
  variant?: SyncMomentVariant;
  /** 强制反白（落在深色背景上时，如 CityFeatured 主图） */
  inverted?: boolean;
};

export function SyncMoment({ city, variant = 'full', inverted }: SyncMomentProps) {
  const { userCity, userWeather, openPicker } = useUserCity();
  const cityWeather = useWeather(city);

  // ── 状态 1: 用户没设过 userCity → 整张卡片显示 "选择你的城市" 按钮 ──
  if (!userCity) {
    return (
      <button
        type="button"
        className={`sm sm-${variant} sm-cta${inverted ? ' sm-inverted' : ''}`}
        onClick={openPicker}
        aria-label={variant === 'chip' ? '选择城市' : '选择你的城市'}
      >
        {variant === 'chip' ? (
          <span className="sm-cta-text">选择城市 →</span>
        ) : (
          <>
            <span className="sm-cta-line">选择你的城市</span>
            <span className="sm-cta-arrow" aria-hidden="true">→</span>
          </>
        )}
      </button>
    );
  }

  // ── 状态 2: 用户已设 → 渲染时间 / 温度 / 时差 / 温差 ──
  const diffHours = getTimeDiffHours(city.timezone, userCity.timezone);
  const diffCelsius =
    cityWeather && userWeather
      ? cityWeather.temperature - userWeather.temperature
      : null;

  // chip 模式：单行 [HH:MM:SS · +1h]
  if (variant === 'chip') {
    return (
      <ChipView
        city={city}
        userCityNameZh={userCity.nameZh}
        diffHours={diffHours}
        inverted={inverted}
      />
    );
  }

  // full / compact 模式
  return (
    <div
      className={`sm sm-${variant}${inverted ? ' sm-inverted' : ''}`}
      data-slug={city.slug}
      aria-label={`${city.nameZh} 与 ${userCity.nameZh} 的同步时刻`}
    >
      <TimeBlock timezone={city.timezone} size={variant} />
      <TempLine cityWeather={cityWeather} variant={variant} />
      {variant === 'full' && (
        <DiffBlock diffHours={diffHours} diffCelsius={diffCelsius} />
      )}
      {variant === 'compact' && (
        <DiffBlock diffHours={diffHours} diffCelsius={diffCelsius} onlyTime />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/*  Sub-components                                             */
/* ─────────────────────────────────────────────────────────── */

function TempLine({
  cityWeather,
  variant,
}: {
  cityWeather: ReturnType<typeof useWeather>;
  variant: SyncMomentVariant;
}) {
  if (!cityWeather) {
    return (
      <div className="sm-temp sm-temp-loading" aria-label="温度加载中">
        <span className="sm-temp-icon" aria-hidden="true">
          ◌
        </span>
        <span className="sm-temp-value">--°</span>
      </div>
    );
  }
  const icon = getWeatherIcon(cityWeather.weatherCode);
  return (
    <div className="sm-temp" aria-label={`温度 ${cityWeather.temperature} 度 ${cityWeather.weatherSummary}`}>
      <WeatherIcon
        name={icon}
        size={variant === 'full' ? 16 : 14}
        className="sm-temp-icon"
        decorative={false}
        label={cityWeather.weatherSummary}
      />
      <span className="sm-temp-value">{Math.round(cityWeather.temperature)}°</span>
      {variant === 'full' && (
        <span className="sm-temp-summary">{cityWeather.weatherSummary}</span>
      )}
    </div>
  );
}

function ChipView({
  city,
  userCityNameZh,
  diffHours,
  inverted,
}: {
  city: City;
  userCityNameZh: string;
  diffHours: number;
  inverted?: boolean;
}) {
  // 单独 tick：每分钟一次就够（chip 不需要秒级）
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 60000);
    return () => clearInterval(id);
  }, []);
  const time = new Intl.DateTimeFormat('en-GB', {
    timeZone: city.timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date());
  const diff = diffHours > 0 ? `+${diffHours}h` : `${diffHours}h`;
  const safeTime = time.includes('NaN') ? '--:--' : time;
  return (
    <span
      className={`sm sm-chip${inverted ? ' sm-inverted' : ''}`}
      aria-label={`${city.nameZh} ${safeTime}，与你（${userCityNameZh}）时差 ${diff}`}
    >
      {safeTime} · {diff}
    </span>
  );
}

export default SyncMoment;
