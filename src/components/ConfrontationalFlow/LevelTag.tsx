/* ============================================================
   看见地球 · v1.4 · PR #30 · LevelTag
   - 3 色情绪层级标签（red / yellow / blue）
   - v1.4 PR #30 · 排版根据 editorialLevels 元数据应用：
        red    = serif    700 / lg (18px)
        yellow = sans     500 / md (16px)
        blue   = sans-italic 400 / sm (14px)
   - a11y: role="img" + aria-label={meta.description}
   ============================================================ */

import type { Level } from '@/lib/editorialLevel';
import { getEditorialLevel } from '@/lib/editorialLevel';
import styles from './LevelTag.module.css';

export type LevelTagProps = {
  level: Level;
  /** 紧凑（移动端 10px） */
  compact?: boolean;
};

export function LevelTag({ level, compact }: LevelTagProps) {
  const meta = getEditorialLevel(level);
  // 3 排版 class — font / weight / size 由 editorialLevels 控制
  const sizeClass = `levelSize_${meta.size}`; // sm / md / lg
  const fontClass = `levelFont_${meta.font}`; // serif / sans / sans-italic
  const compactClass = compact ? styles.compact : '';
  return (
    <span
      className={[
        styles.tag,
        styles[`level_${level}`],
        styles[sizeClass],
        styles[fontClass],
        compactClass,
      ].filter(Boolean).join(' ')}
      role="img"
      aria-label={meta.description}
    >
      <span className={styles.bar} aria-hidden="true" />
      <span className={styles.label}>{meta.label}</span>
    </span>
  );
}

export default LevelTag;
