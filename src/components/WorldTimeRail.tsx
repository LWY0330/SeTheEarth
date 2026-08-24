/* ============================================================
   看见地球 · v2.50.1 · WorldTimeRail · HomeShell Hero 专用
   ------------------------------------------------------------
   - Hero 区域底部,展示 12 城当前时间
   - 数据源:@/data/cities(默认) + getLocalTime() 实时计算
   - 每个 cell = `<Link href={city.href}>` → 点击进入 /cities/:slug
   - A2 LOCK 视觉:冷白底 + Earth Blue 强调 + 0 大圆角 + 0 阴影
   - 三档响应式:Desktop 12 横排 / Tablet 6+6 / Mobile 横滑 + fade
   - 不污染 src/components/ui/WorldTimeRail(设计系统级 LOCKED 通用组件)
   ============================================================ */

import { useMemo } from 'react';
import { Link } from '@/router/Router';
import {
  cities as defaultCities,
  getLocalTime,
  getTimezoneAbbrev,
  type City,
} from '@/data/cities';
import styles from './WorldTimeRail.module.css';

export interface WorldTimeRailProps {
  /** 城市列表(默认 = 全 12 城) */
  cities?: readonly City[];
  /** 注入测试用时间,默认 = new Date() */
  now?: Date;
  /** 用户所在时区(默认 = browser);用于 offset 计算 + 高亮匹配城市 */
  userTimezone?: string;
  /** 外部 className(合并到 root) */
  className?: string;
}

/** 默认 = 浏览器时区 */
function detectUserTimezone(): string {
  if (typeof Intl === 'undefined') return 'UTC';
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'UTC';
  }
}

/** 计算 offset 字符串(相对 userTimezone),如 "+5H" / "-3H" / "+0H" */
function formatOffset(targetTz: string, userTz: string, now: Date): string {
  if (targetTz === userTz) return '+0H';
  try {
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: targetTz,
      timeZoneName: 'shortOffset',
    });
    const parts = fmt.formatToParts(now);
    const offset = parts.find((p) => p.type === 'timeZoneName')?.value ?? '';
    // GMT+5 → +5H / GMT-3 → -3H
    const match = offset.match(/GMT([+-]\d{1,2})(?::(\d{2}))?/);
    if (!match) return '+0H';
    const sign = match[1].startsWith('-') ? '-' : '+';
    const hours = match[1].replace(/[+-]/, '');
    return `${sign}${hours}H`;
  } catch {
    return '+0H';
  }
}

/**
 * HomeShell Hero 专用 WorldTimeRail
 * - 12 城横排 + 点击跳转 /cities/:slug
 * - A2 视觉 + 三档响应式
 */
export function WorldTimeRail({
  cities,
  now,
  userTimezone,
  className,
}: WorldTimeRailProps) {
  const data = useMemo(() => {
    const list = cities ?? defaultCities;
    const t = now ?? new Date();
    const userTz = userTimezone ?? detectUserTimezone();
    return list.map((city) => ({
      id: city.id,
      slug: city.slug,
      nameZh: city.nameZh,
      nameEn: city.nameEn,
      href: city.href,
      timezone: city.timezone,
      localTime: getLocalTime(city, t),
      abbrev: getTimezoneAbbrev(city, t),
      offset: formatOffset(city.timezone, userTz, t),
      isUserCity: city.timezone === userTz,
    }));
  }, [cities, now, userTimezone]);

  const rootClass = [styles.rail, className].filter(Boolean).join(' ');

  return (
    <section
      className={rootClass}
      aria-label="世界时间 · 12 座城市当前时间"
      role="region"
    >
      <div className={styles.kicker}>
        <span className={styles.kickerDot} aria-hidden="true" />
        <span className={styles.kickerLabel}>WORLD TIME</span>
      </div>
      <div className={styles.scroll}>
        <ol className={styles.grid}>
          {data.map((c) => (
            <li key={c.id} className={styles.cellLi}>
              <Link
                href={c.href}
                className={[
                  styles.cell,
                  c.isUserCity ? styles.cellUser : '',
                ].filter(Boolean).join(' ')}
                aria-label={`${c.nameZh} ${c.nameEn} · 现在 ${c.localTime} ${c.offset}`}
                data-active={c.isUserCity ? 'true' : 'false'}
                data-slug={c.slug}
              >
                <span className={styles.time}>{c.localTime}</span>
                <span className={styles.name}>{c.nameEn}</span>
                <span className={styles.offset}>
                  {c.abbrev ? `${c.offset} · ${c.abbrev}` : c.offset}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export default WorldTimeRail;