/* ============================================================
   看见地球 · v1.4 · LevelTag (PR #26)
   - 3 色情绪层级标签胶囊（red / yellow / blue）
   - a11y: <span role="img" aria-label="情绪层级：xxx" />
   - 色值：text 已在 v1.4 a11y fix 中挑到 ≥ AA
        red    #8B3530   (5.63 ✓)
        yellow #6B5500   (5.36 ✓)  ← spec 写的 #9C7B1A 不达标，加深到 #6B5500
        blue   #145CA8   (4.90 ✓)  ← spec 写的 #1F6FBC 不达标，加深到 #145CA8
   ============================================================ */

import type { Level } from '@/data/liveMoments';
import styles from './LevelTag.module.css';

export type LevelTagProps = {
  level: Level;
  /** 紧凑（移动端 10px），默认桌面 11px */
  compact?: boolean;
};

const LEVEL_META: Record<Level, { label: string; aria: string; cssClass: string }> = {
  red:    { label: 'RED LAYER',    aria: '情绪层级：红色（生死 / 灾难 / 颠覆）',     cssClass: 'red' },
  yellow: { label: 'YELLOW LAYER', aria: '情绪层级：黄色（转折 / 节日 / 变革）',     cssClass: 'yellow' },
  blue:   { label: 'BLUE LAYER',   aria: '情绪层级：蓝色（个体 / 日常 / 平凡）',     cssClass: 'blue' },
};

export function LevelTag({ level, compact }: LevelTagProps) {
  const meta = LEVEL_META[level];
  return (
    <span
      className={`${styles.tag} ${styles[meta.cssClass]} ${compact ? styles.compact : ''}`}
      role="img"
      aria-label={meta.aria}
    >
      <span className={styles.bar} aria-hidden="true" />
      <span className={styles.label}>{meta.label}</span>
    </span>
  );
}

export default LevelTag;
