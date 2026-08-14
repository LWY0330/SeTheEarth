/* ============================================================
   看见地球 · v1.4 · userCity (PR #29)
   - 用户本地城市：localStorage 读写 + 默认值 + 类型
   - 隐私优先：只在浏览器里存，不上传任何服务器
   - 退化：localStorage 被禁用（隐私模式）→ 用 sessionStorage 兜底
   ============================================================ */

import { SUPPORTED_USER_CITIES, type UserCity } from '@/data/cities';

export type { UserCity };

const STORAGE_KEY = 'sethearth.userCity';
const SESSION_KEY = 'sethearth.userCity.session'; // localStorage 禁用时的兜底

function isUserCity(v: unknown): v is UserCity {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.nameZh === 'string' &&
    typeof o.nameEn === 'string' &&
    typeof o.lat === 'number' &&
    typeof o.lon === 'number' &&
    typeof o.timezone === 'string' &&
    typeof o.slug === 'string'
  );
}

function safeGetLocal(): UserCity | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isUserCity(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function safeGetSession(): UserCity | null {
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isUserCity(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function safeSet(value: UserCity): void {
  // 先试 localStorage；禁用 → 退化到 sessionStorage；都挂则静默放弃
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    try {
      window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(value));
    } catch {
      /* ignore */
    }
    return;
  } catch {
    /* fallthrough */
  }
  try {
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export function readUserCity(): UserCity | null {
  if (typeof window === 'undefined') return null;
  return safeGetLocal() ?? safeGetSession();
}

export function writeUserCity(city: UserCity): void {
  if (typeof window === 'undefined') return;
  safeSet(city);
}

export function userCityToCity(uc: UserCity): import('@/data/cities').City {
  // useWeather 只读 city.slug 和 city.lat/lon/timezone，其他字段忽略
  return uc as unknown as import('@/data/cities').City;
}

export function findUserCityBySlug(slug: string): UserCity | undefined {
  return SUPPORTED_USER_CITIES.find((c) => c.slug === slug);
}

export const USER_CITY_STORAGE_KEY = STORAGE_KEY;
