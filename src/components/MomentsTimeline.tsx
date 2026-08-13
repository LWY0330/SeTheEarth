/* ============================================================
   看见地球 · v2.60.0 · MomentsTimeline
   - 板块 3 每条事件行尾追加天气小标（仅 12 城内）
   - 左栏 CURRENTLY VIEWING 也展示实时天气
   - 数据源：open-meteo（15 分钟缓存）
   - 顶部状态文案：WORLD SNAPSHOT — DEVELOPING（不再写 "非实时 / curated, not live"）
   - 移除底部 "编辑精选实时样本 · 数据驱动 · 非个性化"
   - 新增可选 "What's coming" 提示，由 status 驱动
   - 状态点按 status 切换：live 缓慢脉冲；developing / editorial 静态灰点
   ============================================================ */

import { useEffect, useMemo, useState } from 'react';
import { contentTypeColors, momentsMeta, type LiveEvent } from '@/data/liveMoments';
import { findCityByAnyKey, type City } from '@/data/cities';
import TimezoneBar from './TimezoneBar';
import EventWeatherChip from './EventWeatherChip';
import styles from './MomentsTimeline.module.css';

export type MomentsTimelineProps = {
  events: readonly LiveEvent[];
  activeEventId?: string | null;
  onSelectEvent?: (event: LiveEvent) => void;
  onReshuffle?: () => void;
};

function getTimeOfDay(utcHour: number): string {
  if (utcHour < 5) return '深夜';
  if (utcHour < 8) return '清晨';
  if (utcHour < 12) return '上午';
  if (utcHour < 14) return '正午';
  if (utcHour < 18) return '午后';
  if (utcHour < 21) return '傍晚';
  return '夜晚';
}

function getLocalTimePeriod(localTime: string): string {
  const [h] = localTime.split(':').map(Number);
  return getTimeOfDay(h);
}

export function MomentsTimeline({
  events,
  activeEventId,
  onSelectEvent,
  onReshuffle,
}: MomentsTimelineProps) {
  const [nowUtc, setNowUtc] = useState(() => {
    const d = new Date();
    return {
      hours: d.getUTCHours(),
      minutes: d.getUTCMinutes(),
      date: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).toUpperCase(),
    };
  });

  useEffect(() => {
    const id = setInterval(() => {
      const d = new Date();
      setNowUtc({
        hours: d.getUTCHours(),
        minutes: d.getUTCMinutes(),
        date: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).toUpperCase(),
      });
    }, 30000);
    return () => clearInterval(id);
  }, []);

  const nowUtcHour = nowUtc.hours + nowUtc.minutes / 60;
  const timeOfDay = getTimeOfDay(nowUtc.hours);

  const activeEvent = activeEventId
    ? events.find((e) => e.id === activeEventId) ?? null
    : null;

  // 板块 3 天气：把每个事件的 cityId 映射到 cities.ts 的 City（找不到则为 undefined）
  const cityByEventId = useMemo<Record<string, City | undefined>>(() => {
    const m: Record<string, City | undefined> = {};
    for (const ev of events) m[ev.id] = findCityByAnyKey(ev.cityId);
    return m;
  }, [events]);
  const activeCity = activeEvent ? cityByEventId[activeEvent.id] : undefined;

  // 计算 6 事件的时段分布
  const periodCounts = events.reduce<Record<string, number>>((acc, ev) => {
    const period = getLocalTimePeriod(ev.localTime);
    acc[period] = (acc[period] ?? 0) + 1;
    return acc;
  }, {});
  const periodOrder = ['深夜', '清晨', '上午', '正午', '午后', '傍晚', '夜晚'];
  const activePeriods = periodOrder.filter((p) => (periodCounts[p] ?? 0) > 0);

  return (
    <div className={styles.layout}>
      {/* ── 左 50% ── */}
      <div className={styles.leftCol}>
        {/* UTC 时间 */}
        <div className={styles.utcBlock}>
          <span className={styles.utcNumber}>
            {String(nowUtc.hours).padStart(2, '0')}:{String(nowUtc.minutes).padStart(2, '0')}
          </span>
          <div className={styles.utcMeta}>
            <span className={styles.utcLabel}>UTC</span>
            <span className={styles.utcTimeOfDay}>{timeOfDay}</span>
          </div>
        </div>

        {/* 状态行：日期 + 状态标识（v2.22 · 不写 LIVE 字样） */}
        <div className={styles.statusRow}>
          <span className={styles.date}>{nowUtc.date} 2026</span>
          <span
            className={styles.statusBadge}
            data-status={momentsMeta.status}
          >
            <span className={styles.statusDot} aria-hidden="true" />
            <span className={styles.statusLabel}>{momentsMeta.label}</span>
          </span>
        </div>
        <p className={styles.statusSubtitle}>
          <span className={styles.statusSubtitleCn}>世界正在构建中</span>
          <span className={styles.statusSubtitleEn}>Live mode in development.</span>
        </p>

        {/* 概念性文案 */}
        <p className={styles.tagline}>
          世界正在同时<br />
          <em>醒来 · 工作 · 休息 · 入睡</em>
        </p>

        {/* 日夜色带 */}
        <div className={styles.dayNightWrap}>
          <div className={styles.dayNightBar}>
            <div className={styles.dayNightProgress} style={{ left: `${(nowUtcHour / 24) * 100}%` }} />
          </div>
          <div className={styles.dayNightLabels}>
            <span>00</span>
            <span>06</span>
            <span>12</span>
            <span>18</span>
            <span>24</span>
          </div>
        </div>

        {/* 抽象 24h 时区条 */}
        <TimezoneBar
          events={events}
          nowUtcHour={nowUtcHour}
          activeEventId={activeEventId}
          onSelectEvent={onSelectEvent}
        />

        {/* 全球时段分布 */}
        <div className={styles.subBlock}>
          <h3 className={styles.subTitle}>WORLD RIGHT NOW</h3>
          <ul className={styles.periodList}>
            {activePeriods.map((period) => (
              <li key={period} className={styles.periodItem}>
                <span className={styles.periodName}>{period}</span>
                <span className={styles.periodBar}>
                  <span
                    className={styles.periodBarFill}
                    style={{ width: `${((periodCounts[period] ?? 0) / 6) * 100}%` }}
                  />
                </span>
                <span className={styles.periodCount}>{periodCounts[period]} 个城市</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 当前选中事件概览（条件渲染） */}
        {activeEvent && (
          <div
            className={styles.subBlock}
            onClick={() => onSelectEvent?.(activeEvent)}
            role={onSelectEvent ? "button" : undefined}
            tabIndex={onSelectEvent ? 0 : undefined}
          >
            <h3 className={styles.subTitle}>CURRENTLY VIEWING</h3>
            <div className={styles.overviewContent}>
              <div className={styles.overviewCity}>
                <span className={styles.overviewCityName}>{activeEvent.cityNameZh}</span>
                <span className={styles.overviewCityEn}>{activeEvent.cityNameEn}</span>
                <span className={styles.overviewTime}>
                  {activeEvent.localTime} {activeEvent.timezone}
                </span>
                {activeCity && (
                  <span className={styles.overviewWeather}>
                    <EventWeatherChip city={activeCity} />
                  </span>
                )}
              </div>
              <p className={styles.overviewTitle}>{activeEvent.title}</p>
              <p className={styles.overviewDesc}>{activeEvent.description}</p>
            </div>
          </div>
        )}

        {/* 底部：纯 "换一组" 按钮 + 可选 What's coming 提示（v2.22 · 由 status 驱动） */}
        <div className={styles.subBlock}>
          {momentsMeta.status !== "live" && (
            <p className={styles.whatsComing}>
              {momentsMeta.status === "developing" ? (
                <>
                  Live mode coming soon.
                  <span className={styles.whatsComingZh}>
                    实时数据源接入中。
                  </span>
                </>
              ) : (
                <>
                  Curated by editors.
                  <span className={styles.whatsComingZh}>
                    编辑精选 · 持续更新中。
                  </span>
                </>
              )}
            </p>
          )}
          {onReshuffle && (
            <button
              type="button"
              className={styles.reshuffle}
              onClick={onReshuffle}
              aria-label="换一组世界观察"
            >
              <span className={styles.reshuffleIcon}>↻</span>
              SEE ANOTHER SLICE
            </button>
          )}
        </div>
      </div>

      {/* 中间 1px 细线分隔 */}
      <div className={styles.divider} aria-hidden="true" />

      {/* ── 右 50%（编辑式信息流） ── */}
      <ol className={styles.rightCol}>
        {events.map((ev, i) => {
          const accent = contentTypeColors[ev.contentType];
          const isActive = activeEventId === ev.id;
          return (
            <li
              key={ev.id}
              className={[
                styles.event,
                isActive ? styles.eventActive : '',
                onSelectEvent ? styles.eventClickable : '',
              ].join(' ')}
              style={{ '--event-accent': accent } as React.CSSProperties}
              onClick={() => onSelectEvent?.(ev)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectEvent?.(ev);
                }
              }}
              tabIndex={onSelectEvent ? 0 : undefined}
              
            >
              <span className={styles.eventIndex}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className={styles.eventThumb}>
                <img src={ev.thumbnailUrl} alt="" loading="lazy" />
              </div>
              <div className={styles.eventContent}>
                <div className={styles.eventHead}>
                  <span className={styles.eventCityName}>{ev.cityNameZh}</span>
                  <span className={styles.eventCityEn}>{ev.cityNameEn}</span>
                  <span className={styles.eventTime}>
                    {ev.localTime} {ev.timezone}
                  </span>
                  {cityByEventId[ev.id] && (
                    <span className={styles.eventWeather}>
                      <EventWeatherChip city={cityByEventId[ev.id] as City} />
                    </span>
                  )}
                </div>
                <h3 className={styles.eventTitle}>{ev.title}</h3>
                <p className={styles.eventDesc}>{ev.description}</p>
                <div className={styles.eventMeta}>
                  <span className={styles.eventSource}>{ev.sourceName}</span>
                  <span
                    className={styles.eventType}
                    style={{
                      color: accent,
                      borderColor: `color-mix(in srgb, ${accent} 40%, transparent)`,
                    }}
                  >
                    {ev.contentTypeZh}
                  </span>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export default MomentsTimeline;
