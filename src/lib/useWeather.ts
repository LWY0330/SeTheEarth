/* ============================================================
   看见地球 · v2.60.0 · useWeather (React hook)
   - 调用 open-meteo（带 15 分钟缓存）→ 暴露给组件
   - 初次渲染从缓存同步取值，避免出现"短暂 unavailable"闪烁
   - city.slug 变化时再决定是否需要重新拉取
   - 失败返回 null（UI 自己渲染兜底）
   ============================================================ */

import { useEffect, useState } from 'react';
import type { City } from '@/data/cities';
import { getWeatherSafe, readFreshCache, type Weather } from './weather';

export function useWeather(city: City | null | undefined): Weather | null {
  const [weather, setWeather] = useState<Weather | null>(() => {
    if (!city) return null;
    return readFreshCache(city.slug);
  });
  const slug = city?.slug ?? null;

  useEffect(() => {
    if (!city) {
      setWeather(null);
      return;
    }
    // 城市切换前，先用缓存的旧值（或 null）显示，再触发后台拉取
    let cancelled = false;
    const cached = readFreshCache(city.slug);
    if (cached) {
      setWeather(cached);
    } else {
      // 没有缓存时清空，让 UI 进入"拉取中"状态
      setWeather(null);
    }
    // 触发后台拉取（即便有缓存，也再请求一次以保证 15 分钟内最新）
    getWeatherSafe(city).then((w) => {
      if (!cancelled) setWeather(w);
    });
    return () => {
      cancelled = true;
    };
    // slug 已经稳定代表 city 切换；把 city 放进 deps 是为了万一引用变化
  }, [slug, city]);

  return weather;
}
