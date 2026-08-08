/* ============================================================
   看见地球 · v2.18.0 · TimezoneBar · 多通道标签布局
   - 解决城市名重叠问题
   - 同一 lane 放不下 → 自动换到下一 lane
   - 引线连接圆点 → label
   - 移动端：只显示圆点，选中城市单独显示
   ============================================================ */

import { useMemo } from 'react';
import { type LiveEvent } from '@/data/liveMoments';
import styles from './TimezoneBar.module.css';

export type TimezoneBarProps = {
  events: readonly LiveEvent[];
  nowUtcHour: number;
  activeEventId?: string | null;
  onSelectEvent?: (event: LiveEvent) => void;
};

// 多通道布局算法的参数（用百分比处理响应式）
const LANE_WIDTH_PCT = 14;   // 每个 label 横向占的容器百分比
const LANE_GAP_PCT = 1.5;    // label 之间的最小水平间距
const LANE_HEIGHT = 24;      // 每个 lane 的垂直高度

export function TimezoneBar({
  events,
  nowUtcHour,
  activeEventId,
  onSelectEvent,
}: TimezoneBarProps) {
  // 1. 排序 + 计算 utcHour + 多通道分配
  const positioned = useMemo(() => {
    // 按 utcHour 升序
    const sorted = [...events].sort((a, b) => {
      const ua = ((nowUtcHour + (a.utcOffset ?? 0)) % 24 + 24) % 24;
      const ub = ((nowUtcHour + (b.utcOffset ?? 0)) % 24 + 24) % 24;
      return ua - ub;
    });

    // 贪心分配 lane
    const lanes: number[] = []; // 每个 lane 记录最后一个 label 的右边界 x%
    return sorted.map((event) => {
      const utcHour = ((nowUtcHour + (event.utcOffset ?? 0)) % 24 + 24) % 24;
      const x = (utcHour / 24) * 100;
      const labelLeft = x - LANE_WIDTH_PCT / 2;
      const labelRight = x + LANE_WIDTH_PCT / 2;

      let lane = 0;
      while (lane < lanes.length) {
        if (labelLeft > lanes[lane] + LANE_GAP_PCT) {
          break; // 该 lane 有空间
        }
        lane++;
      }

      if (lane === lanes.length) {
        lanes.push(labelRight); // 新增 lane
      } else {
        lanes[lane] = labelRight; // 更新 lane 右边界
      }

      return { event, x, lane, utcHour };
    });
  }, [events, nowUtcHour]);

  const maxLane = positioned.reduce((m, p) => Math.max(m, p.lane), 0);
  const activeEvent = activeEventId
    ? events.find((e) => e.id === activeEventId) ?? null
    : null;

  return (
    <div
      className={styles.wrap}
      style={{ minHeight: `${(maxLane + 1) * LANE_HEIGHT + 50}px` }}
    >
      {/* ── 顶部 24h 刻度 ── */}
      <div className={styles.ticksRow}>
        {[0, 6, 12, 18, 24].map((t) => (
          <span
            key={t}
            className={styles.tick}
            style={{ left: `${(t / 24) * 100}%` }}
          >
            {String(t).padStart(2, '0')}
          </span>
        ))}
      </div>

      {/* ── 时间条 + 圆点（dots） ── */}
      <div className={styles.lineArea}>
        <div className={styles.track} />
        <div
          className={styles.nowMarker}
          style={{ left: `${(nowUtcHour / 24) * 100}%` }}
          aria-hidden="true"
        />
        {positioned.map(({ event, x }) => {
          const isActive = event.id === activeEventId;
          return (
            <button
              key={event.id}
              type="button"
              className={`${styles.dot} ${isActive ? styles.dotActive : ''}`}
              style={{ left: `${x}%` }}
              onClick={() => onSelectEvent?.(event)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectEvent?.(event);
                }
              }}
              aria-label={`${event.cityNameEn}, ${event.localTime}`}
              aria-selected={isActive}
              role="radio"
              tabIndex={0}
            >
              <span className={styles.dotInner} />
            </button>
          );
        })}
      </div>

      {/* ── 多通道 lane 区域（label 错落） ── */}
      <div
        className={styles.lanesArea}
        style={{ height: `${(maxLane + 1) * LANE_HEIGHT}px` }}
        aria-hidden="false"
      >
        {positioned.map(({ event, x, lane }) => {
          const isActive = event.id === activeEventId;
          return (
            <div
              key={event.id}
              className={`${styles.event} ${isActive ? styles.eventActive : ''}`}
              style={{ left: `${x}%` }}
            >
              {/* 引线：从 time bar 到 label（lane 0 不需要引线） */}
              {lane > 0 && (
                <div
                  className={styles.line}
                  style={{ height: `${lane * LANE_HEIGHT}px` }}
                  aria-hidden="true"
                />
              )}
              {/* Label（label 在 lane 0 = 紧贴 time bar；更高 lane = 更低位置） */}
              <div
                className={styles.label}
                style={{ top: `${lane * LANE_HEIGHT}px` }}
              >
                <span className={styles.labelCity}>{event.cityNameZh}</span>
                <span className={styles.labelTime}>{event.localTime}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 移动端：单独显示当前选中城市 */}
      {activeEvent && (
        <div className={styles.activeLine}>
          <span className={styles.activeLineLabel}>
            {activeEvent.cityNameZh} · {activeEvent.localTime}
          </span>
        </div>
      )}
    </div>
  );
}

export default TimezoneBar;
