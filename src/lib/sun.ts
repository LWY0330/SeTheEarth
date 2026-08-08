/* ============================================================
   看见地球 · v1.1 · sunrise-sunset.org 真实日照时段
   - 免费 · 无需 API Key · CORS 开放 · 12 城全覆盖
   - 文档：https://api.sunrise-sunset.org/json
   - 缓存策略：(citySlug, dateKey-in-city-tz) 一日复用
   - 失败兜底：getSunPeriodSafe → 现有 getCurrentPeriod 小时桶
   - 与 open-meteo 风格一致：safe 版永不抛错
   ============================================================ */

import type { City, DayPeriod } from '@/data/cities';
import { getCurrentPeriod } from '@/data/cities';

/** open-meteo / sunrise-sunset 返回的 sunrise / sunset 都是 UTC ISO 字符串 */
export type SunTimes = {
  /** citySlug，作为缓存与字段归属的稳定 ID */
  cityId: string;
  /** 这份数据是哪一天的（按城市本地时区 YYYY-MM-DD） */
  dateKey: string;
  /** UTC Date 对象 —— API 返回 ISO，加 Date 包装方便比较 */
  sunrise: Date;
  sunset: Date;
  solarNoon: Date;
  /** 民用晨光开始：太阳 -6° → 适合"已经亮起来"的阈值 */
  civilTwilightBegin: Date;
  /** 民用昏光结束：太阳 -6° → "已经黑下去"的阈值 */
  civilTwilightEnd: Date;
};

/* ──────────────────── 缓存 ──────────────────── */

const cache = new Map<string, { value: SunTimes; storedAt: number }>();
const inflight = new Map<string, Promise<SunTimes | null>>();
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6h；日期变化即失效（参见 readFreshCache）

function cacheKey(slug: string, dateKey: string): string {
  return `${slug}::${dateKey}`;
}

function readFreshCache(slug: string, dateKey: string): SunTimes | null {
  const hit = cache.get(cacheKey(slug, dateKey));
  if (!hit) return null;
  if (Date.now() - hit.storedAt > CACHE_TTL_MS) {
    cache.delete(cacheKey(slug, dateKey));
    return null;
  }
  return hit.value;
}

function writeCache(value: SunTimes): void {
  cache.set(cacheKey(value.cityId, value.dateKey), { value, storedAt: Date.now() });
}

/* ──────────────────── helpers ──────────────────── */

function formatDateKeyInTz(timezone: string, d: Date): string {
  // 取城市本地时区的 YYYY-MM-DD
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  // en-CA 输出 "YYYY-MM-DD"（按 CA 习惯）
  return fmt.format(d);
}

function parseIsoOrThrow(s: string | undefined, field: string): Date {
  if (!s) throw new Error(`sunrise-sunset response missing field: ${field}`);
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) {
    throw new Error(`sunrise-sunset field ${field} not a valid ISO: ${s}`);
  }
  return d;
}

type SunApiResults = {
  sunrise?: string;
  sunset?: string;
  solar_noon?: string;
  civil_twilight_begin?: string;
  civil_twilight_end?: string;
};

type SunApiResponse = {
  status?: string;
  results?: SunApiResults;
};

/* ──────────────────── fetch ──────────────────── */

/**
 * 直接调用 sunrise-sunset.org，失败抛错。
 * 不走缓存（外部请用 getSunTimesSafe）。
 */
export async function fetchSunTimes(city: City, date: Date = new Date()): Promise<SunTimes> {
  const dateKey = formatDateKeyInTz(city.timezone, date);
  const url = new URL('https://api.sunrise-sunset.org/json');
  url.searchParams.set('lat', String(city.lat));
  url.searchParams.set('lng', String(city.lon));
  url.searchParams.set('date', dateKey);
  // formatted=0 → 返回 ISO 8601 UTC 字符串
  url.searchParams.set('formatted', '0');

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`sunrise-sunset API failed: ${res.status} ${res.statusText}`);
  }
  const data = (await res.json()) as SunApiResponse;
  if (data.status !== 'OK' || !data.results) {
    throw new Error(`sunrise-sunset API status: ${data.status ?? 'unknown'}`);
  }
  const r = data.results;
  return {
    cityId: city.slug,
    dateKey,
    sunrise: parseIsoOrThrow(r.sunrise, 'sunrise'),
    sunset: parseIsoOrThrow(r.sunset, 'sunset'),
    solarNoon: parseIsoOrThrow(r.solar_noon, 'solar_noon'),
    civilTwilightBegin: parseIsoOrThrow(r.civil_twilight_begin, 'civil_twilight_begin'),
    civilTwilightEnd: parseIsoOrThrow(r.civil_twilight_end, 'civil_twilight_end'),
  };
}

/* ──────────────────── public API ──────────────────── */

/**
 * 取一座城市当天的真实日照数据，命中缓存即返回缓存。
 * 失败返回 null（不会抛错）。
 */
export async function getSunTimesSafe(
  city: City,
  date: Date = new Date()
): Promise<SunTimes | null> {
  const dateKey = formatDateKeyInTz(city.timezone, date);
  const cached = readFreshCache(city.slug, dateKey);
  if (cached) return cached;

  const inflightKey = cacheKey(city.slug, dateKey);
  const existing = inflight.get(inflightKey);
  if (existing) return existing;

  const promise = fetchSunTimes(city, date)
    .then((sun) => {
      writeCache(sun);
      inflight.delete(inflightKey);
      return sun;
    })
    .catch((err) => {
      inflight.delete(inflightKey);
      // eslint-disable-next-line no-console
      console.warn(`[sun] fetch for ${city.slug} failed, fallback to hour buckets`, err);
      return null;
    });
  inflight.set(inflightKey, promise);
  return promise;
}

/**
 * 给定日照数据 + 当前时间，返回 6 时段之一。
 * 处理极昼 / 极夜（sunset < sunrise 的极地情况）：
 *   - 极昼：sun 整天在地平线以上 → 一律按 morning/afternoon 切
 *   - 极夜：sun 整天在地平线以下 → 一律 night
 */
export function getSunPeriod(sun: SunTimes, now: Date = new Date()): DayPeriod {
  const t = now.getTime();
  const sr = sun.sunrise.getTime();
  const ss = sun.sunset.getTime();
  const twBegin = sun.civilTwilightBegin.getTime();
  const twEnd = sun.civilTwilightEnd.getTime();
  const noon = sun.solarNoon.getTime();

  // 极夜：sunrise > sunset，意思是当地整个 24h 没有日出
  // sunrise-sunset.org 在极夜时 sunrise=正午12:00 UTC, sunset=正午12:00 UTC 同点
  // 进一步：sunrise === sunset 表示这天没有日出
  if (sr === ss) {
    return 'night';
  }
  const polarNight = sr > ss;
  if (polarNight && (t < ss || t > sr)) {
    // 极夜下，从 sunset 到次日 sunrise 之间是 night
    return 'night';
  }
  if (polarNight) {
    // ss <= t <= sr 之间，太阳理论上在地平线以上 → afternoon
    return 'afternoon';
  }

  // 正常情况：sunrise <= sunset
  if (t < twBegin) {
    // 民用昏光之后：夜深
    return t < ss ? 'night' : 'deepNight';
  }
  if (t < sr) {
    // 民用晨光开始之后、日出之前：清晨
    return 'dawn';
  }
  if (t < noon) {
    return 'morning';
  }
  if (t < ss) {
    return 'afternoon';
  }
  if (t < twEnd) {
    return 'evening';
  }
  // twEnd 之后到深夜（>= 23:00 一律 deepNight）
  const hour = new Date(t).getUTCHours();
  return hour >= 23 ? 'deepNight' : 'night';
}

/**
 * 拿到日照时段；拿不到日照数据时，fallback 到 getCurrentPeriod 的小时桶逻辑。
 * 返回的 DayPeriod 永远不为 null —— CityNow 可以直接用。
 */
export async function getSunPeriodSafe(
  city: City,
  now: Date = new Date()
): Promise<DayPeriod> {
  const sun = await getSunTimesSafe(city, now);
  if (sun) return getSunPeriod(sun, now);
  return getCurrentPeriod(city.timezone, now);
}

/** 仅用于测试 / 调试 */
export function _clearSunCache(): void {
  cache.clear();
  inflight.clear();
}
