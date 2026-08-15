/* ============================================================
   看见地球 · v1.4 · ConfrontationalFlow (PR #26)
   - 区域容器：WORLDS COLLIDE 标题 + 副标题 + "上一组/下一组" + 3 列 grid
   - 默认显示 group-1；切组按数组顺序
   - 数据：confrontEvents（来自 liveMoments.ts 的 9 条）
   ============================================================ */

import { useState } from 'react';
import type { LiveEvent } from '@/data/liveMoments';
import { ConfrontCard } from './ConfrontCard';
import styles from './ConfrontationalFlow.module.css';

export type ConfrontationalFlowProps = {
  /** 配对事件全集（9 条）；由父组件过滤传入 */
  events: readonly LiveEvent[];
};

function groupBy(events: readonly LiveEvent[]): LiveEvent[][] {
  const map = new Map<string, LiveEvent[]>();
  for (const e of events) {
    if (!e.groupId) continue;
    if (!map.has(e.groupId)) map.set(e.groupId, []);
    map.get(e.groupId)!.push(e);
  }
  return Array.from(map.values());
}

export function ConfrontationalFlow({ events }: ConfrontationalFlowProps) {
  const groups = groupBy(events);
  const totalGroups = groups.length;
  const [groupIdx, setGroupIdx] = useState(0);

  if (totalGroups === 0) return null;

  // 防御：groupIdx 越界 → 夹回 0
  const safeIdx = Math.max(0, Math.min(groupIdx, totalGroups - 1));
  const current = groups[safeIdx] ?? [];
  // group 内按 level 排序（red → yellow → blue）
  const LEVEL_ORDER = { red: 0, yellow: 1, blue: 2 } as const;
  const sorted = [...current].sort(
    (a, b) => (LEVEL_ORDER[a.level ?? 'blue'] - LEVEL_ORDER[b.level ?? 'blue']),
  );

  return (
    <section
      className={styles.region}
      aria-labelledby="confrontational-flow-title"
    >
      <header className={styles.header}>
        <h2 id="confrontational-flow-title" className={styles.title}>
          WORLDS COLLIDE
        </h2>
        <p className={styles.subtitle}>
          此刻三个远方对峙 · curated by editor
        </p>

        <nav className={styles.groupNav} aria-label="切换对峙组">
          <button
            type="button"
            className={styles.groupBtn}
            onClick={() => setGroupIdx((i) => (i - 1 + totalGroups) % totalGroups)}
            disabled={totalGroups <= 1}
            aria-label="上一组对峙"
          >
            <span aria-hidden="true">‹</span> 上一组
          </button>
          <span className={styles.groupCounter} aria-live="polite">
            group {safeIdx + 1} of {totalGroups}
          </span>
          <button
            type="button"
            className={styles.groupBtn}
            onClick={() => setGroupIdx((i) => (i + 1) % totalGroups)}
            disabled={totalGroups <= 1}
            aria-label="下一组对峙"
          >
            下一组 <span aria-hidden="true">›</span>
          </button>
        </nav>
      </header>

      <div className={styles.grid} role="list">
        {sorted.map((ev) => (
          <div key={ev.id} role="listitem" className={styles.gridItem}>
            <ConfrontCard event={ev} />
          </div>
        ))}
      </div>
    </section>
  );
}

export default ConfrontationalFlow;
