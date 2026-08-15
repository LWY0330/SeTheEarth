/* ============================================================
   看见地球 · v1.4 · PR #30 · 红黄蓝正式 taxonomy
   - Level 类型（从 liveMoments.ts 迁移到此，作为唯一真相源）
   - LevelMeta 接口：每个 level 的排版 / 动效 / 颜色 / 字号 元数据
   - editorialLevels 全局字典（默认 lookup）
   - getEditorialLevel() helper：可被 LiveEvent.editorialLevel 字段 override
   ============================================================ */

export type Level = 'red' | 'yellow' | 'blue';

export type LevelFont = 'serif' | 'sans' | 'sans-italic';
export type LevelWeight = 400 | 500 | 700;
export type LevelSize = 'sm' | 'md' | 'lg';
export type LevelMotion = 'scale' | 'slide' | 'fade';

export interface LevelMeta {
  /** 'RED' / 'YELLOW' / 'BLUE' 大写文字标签（LevelTag 用） */
  label: string;
  /** aria-label 用的语义描述 */
  description: string;
  /** 字体族（'serif' / 'sans' / 'sans-italic'） */
  font: LevelFont;
  /** 字重 */
  weight: LevelWeight;
  /** 字号档位（对应 CSS --level-size-{sm|md|lg}） */
  size: LevelSize;
  /** 入场动效 */
  motion: LevelMotion;
  /** 动效时长（毫秒） */
  motionDuration: number;
  /** 文字色（PR #29 a11y 修复后 ≥ AA） */
  color: string;
  /** 边框色（同 AA） */
  borderColor: string;
}

export const editorialLevels: Record<Level, LevelMeta> = {
  red: {
    label: 'RED',
    description: '情绪层级：红色（生死 / 灾难 / 颠覆）',
    font: 'serif',
    weight: 700,
    size: 'lg',
    motion: 'scale',
    motionDuration: 400,
    color: '#8B3530',
    borderColor: '#8B3530',
  },
  yellow: {
    label: 'YELLOW',
    description: '情绪层级：黄色（转折 / 节日 / 变革）',
    font: 'sans',
    weight: 500,
    size: 'md',
    motion: 'slide',
    motionDuration: 300,
    color: '#6B5500',
    borderColor: '#6B5500',
  },
  blue: {
    label: 'BLUE',
    description: '情绪层级：蓝色（个体 / 日常 / 平凡）',
    font: 'sans-italic',
    weight: 400,
    size: 'sm',
    motion: 'fade',
    motionDuration: 500,
    color: '#145CA8',
    borderColor: '#145CA8',
  },
};

/**
 * 拿 level 的元数据。
 * 如果 LiveEvent 编辑填了 editorialLevel 字段，可直接用它；否则用默认 lookup。
 */
export function getEditorialLevel(level: Level): LevelMeta {
  return editorialLevels[level];
}
