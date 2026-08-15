/* ============================================================
   看见地球 · v1.4 · UserCityContext (PR #29)
   - 全 App 共享：userCity + openPicker/closePicker
   - userWeather 在 Provider 里只 useWeather() 一次，children 共享
   - 设计原因：
     (a) footer "重新选择" 按钮需要强制打开 picker → 必须有 imperative API
     (b) 12+ 个 SyncMoment 同时显示 → userWeather 必须只取一次
   ============================================================ */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { readUserCity, writeUserCity, userCityToCity } from '@/lib/userCity';
import type { UserCity } from '@/data/cities';
import type { Weather } from '@/lib/weather';
import { useWeather } from '@/lib/useWeather';

type UserCityContextValue = {
  /** null 表示用户未设过 userCity → SyncMoment 显示 "选择你的城市" 按钮 */
  userCity: UserCity | null;
  /** 设置用户城市（写入 localStorage + 触发 refresh） */
  setUserCity: (city: UserCity) => void;
  /** picker 当前是否打开（受控） */
  pickerOpen: boolean;
  /** footer / SyncMoment / 任意位置调用：打开 picker */
  openPicker: () => void;
  /** 关闭 picker（取消、Esc、点遮罩都会调用） */
  closePicker: () => void;
  /** userWeather 缓存（Context 内 useWeather(userCity) 只调一次） */
  userWeather: Weather | null;
};

const Ctx = createContext<UserCityContextValue | null>(null);

export function UserCityProvider({ children }: { children: ReactNode }) {
  // SSR-safe：初次渲染给 null，mount 后再读 localStorage
  const [userCity, setUserCityState] = useState<UserCity | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  // 触发 userWeather 刷新的 tick（同一 Provider 内手动控制）
  const [refreshTick, setRefreshTick] = useState(0);

  // mount 时读取
  useEffect(() => {
    setUserCityState(readUserCity());
  }, []);

  const setUserCity = useCallback((city: UserCity) => {
    writeUserCity(city);
    setUserCityState(city);
    setPickerOpen(false);
    // 强制 userWeather 重新拉（v1.3 weather 缓存 15 分钟，setUserCity 后立即要新数据）
    setRefreshTick((n) => n + 1);
  }, []);

  const openPicker = useCallback(() => setPickerOpen(true), []);
  const closePicker = useCallback(() => setPickerOpen(false), []);

  // ── userWeather：整 App 只调一次 useWeather ──
  // 1. 初次读 userCity（null）时直接 null；refreshTick 让切换时强制重渲染
  const [cityForWeather, setCityForWeather] = useState<ReturnType<typeof userCityToCity> | null>(null);
  const lastSlugRef = useRef<string | null>(null);

  useEffect(() => {
    if (!userCity) {
      setCityForWeather(null);
      lastSlugRef.current = null;
      return;
    }
    if (lastSlugRef.current !== userCity.slug) {
      setCityForWeather(userCityToCity(userCity));
      lastSlugRef.current = userCity.slug;
    }
  }, [userCity, refreshTick]);

  const userWeather = useWeather(cityForWeather);

  const value = useMemo<UserCityContextValue>(
    () => ({
      userCity,
      setUserCity,
      pickerOpen,
      openPicker,
      closePicker,
      userWeather,
    }),
    [userCity, setUserCity, pickerOpen, openPicker, closePicker, userWeather],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useUserCity(): UserCityContextValue {
  const v = useContext(Ctx);
  if (!v) {
    throw new Error('useUserCity must be used inside <UserCityProvider>');
  }
  return v;
}
