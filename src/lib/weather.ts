/* ============================================================
   看见地球 · v2.60.0 · open-meteo.com 天气数据层
   - 免费 · 无需 API Key · CORS 开放 · 12 城全覆盖
   - 文档：https://api.open-meteo.com/v1/forecast
   - 客户端 15 分钟内存缓存（同一浏览器内复用，TTL=900s）
   - Vite SPA 环境：fetch 不认 Next.js 的 next.revalidate，
     所以这里自己实现一个 in-flight + TTL cache
   - 失败兜底：getWeatherSafe 返回 null（UI 显示 "Weather temporarily unavailable"）
   ============================================================ */

import type { City } from '@/data/cities';
import { getWeatherIcon, getWeatherSummary } from './weatherCodes';

export type Weather = {
  cityId: string;
  /** 摄氏度 */
  temperature: number;
  /** 体感温度 */
  apparentTemperature: number;
  /** WMO 编码 */
  weatherCode: number;
  /** 中文简短文案（晴 / 多云 / 雨 …） */
  weatherSummary: string;
  /** 相对湿度 % */
  humidity: number;
  /** 风速 km/h */
  windSpeed: number;
  /** open-meteo 返回的 ISO 时间戳 */
  updatedAt: string;
};

const CACHE_TTL_MS = 15 * 60 * 1000; // 15 分钟

type CacheEntry = {
  value: Weather;
  /** 缓存条目写入时刻 */
  storedAt: number;
};

type InflightEntry = {
  promise: Promise<Weather | null>;
};

/** 内存缓存 + in-flight 去重 */
const cache = new Map<string, CacheEntry>();
const inflight = new Map<string, InflightEntry>();

/**
 * 直接调用 open-meteo，不走缓存。失败抛错。
 */
export async function fetchWeather(city: City): Promise<Weather> {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', String(city.lat));
  url.searchParams.set('longitude', String(city.lon));
  url.searchParams.set(
    'current',
    'temperature_2m,apparent_temperature,weather_code,wind_speed_10m,relative_humidity_2m'
  );
  // open-meteo 接受 IANA tz 或 'auto' / 'GMT'，直接传 city.timezone 最稳
  url.searchParams.set('timezone', city.timezone);

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`Weather API failed: ${res.status} ${res.statusText}`);
  }
  const data: {
    current?: {
      temperature_2m?: number;
      apparent_temperature?: number;
      weather_code?: number;
      wind_speed_10m?: number;
      relative_humidity_2m?: number;
      time?: string;
    };
  } = await res.json();

  const current = data.current;
  if (!current || typeof current.temperature_2m !== 'number') {
    throw new Error('Weather API response missing current fields');
  }

  const code = current.weather_code ?? 0;
  return {
    cityId: city.slug,
    temperature: current.temperature_2m,
    apparentTemperature: current.apparent_temperature ?? current.temperature_2m,
    weatherCode: code,
    weatherSummary: getWeatherSummary(code),
    humidity: current.relative_humidity_2m ?? 0,
    windSpeed: current.wind_speed_10m ?? 0,
    updatedAt: current.time ?? new Date().toISOString(),
  };
}

export function readFreshCache(cityId: string): Weather | null {
  const hit = cache.get(cityId);
  if (!hit) return null;
  if (Date.now() - hit.storedAt > CACHE_TTL_MS) {
    cache.delete(cityId);
    return null;
  }
  return hit.value;
}

function writeCache(value: Weather): void {
  cache.set(value.cityId, { value, storedAt: Date.now() });
}

/**
 * 取一座城市的天气，15 分钟内复用缓存。
 * 失败 → 抛错（外部请用 getWeatherSafe / useWeather）。
 */
export function getWeather(city: City): Promise<Weather> {
  const cached = readFreshCache(city.slug);
  if (cached) return Promise.resolve(cached);

  const existing = inflight.get(city.slug);
  if (existing) {
    // 复用同一 promise；类型上它返回 Weather | null，但我们能确保里面是 Weather
    return existing.promise as Promise<Weather>;
  }

  const promise = fetchWeather(city)
    .then((w) => {
      writeCache(w);
      inflight.delete(city.slug);
      return w;
    })
    .catch((err) => {
      inflight.delete(city.slug);
      throw err;
    });
  inflight.set(city.slug, { promise });
  return promise;
}

/**
 * 安全版：永远不抛错，失败时返回 null。
 */
export async function getWeatherSafe(city: City): Promise<Weather | null> {
  try {
    return await getWeather(city);
  } catch (err) {
    // 在控制台留痕，方便排查；UI 上是兜底文案
    // eslint-disable-next-line no-console
    console.error(`[weather] fetch for ${city.slug} failed`, err);
    return null;
  }
}

/**
 * 强制绕过缓存拉一次（用于"刷新"按钮）。失败抛错。
 */
export function refreshWeather(city: City): Promise<Weather> {
  cache.delete(city.slug);
  inflight.delete(city.slug);
  return getWeather(city);
}

/** 仅用于测试 / 调试 */
export function _clearWeatherCache(): void {
  cache.clear();
  inflight.clear();
}

/** 把图标的派生类型也暴露出去（避免 UI 层再 import weatherCodes） */
export type { WeatherIconName } from './weatherCodes';
export { getWeatherIcon, getWeatherSummary };
