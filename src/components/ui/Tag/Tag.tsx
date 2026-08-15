/* ============================================================
   Tag · v1.5 · ui/Tag
   - 视觉标签 + 文本兜底(不依赖纯色区分)
   - tones: neutral / level-red / level-yellow / level-blue / semantic
   - sizes: sm / md
   ============================================================ */

import type { HTMLAttributes, ReactNode } from 'react';
import styles from './Tag.module.css';

export type TagTone =
  | 'neutral'
  | 'level-red'
  | 'level-yellow'
  | 'level-blue'
  | 'semantic'
  // PROMPT 20 · 11 contentType tones (per spec content-type-tones-v1.5.md)
  | 'content-type-world'
  | 'content-type-weather'
  | 'content-type-local'
  | 'content-type-culture'
  | 'content-type-daily-life'
  | 'content-type-nature'
  | 'content-type-transport'
  | 'content-type-finance'
  | 'content-type-science'
  | 'content-type-community'
  | 'content-type-sports';

export type TagSize = 'sm' | 'md';

export type TagProps = {
  tone?: TagTone;
  size?: TagSize;
  /** text-only 时内容;若有 icon 必填文本(不依赖 icon 区分语义) */
  children: ReactNode;
} & Omit<HTMLAttributes<HTMLSpanElement>, 'children'>;

/**
 * 标签 / 分类
 *
 * @example contentType
 *   <Tag tone="level-red" size="sm">文化</Tag>
 *
 * @example neutral
 *   <Tag tone="neutral">日常</Tag>
 */
export function Tag({
  tone = 'neutral',
  size = 'sm',
  className,
  children,
  ...rest
}: TagProps) {
  const cls = [
    styles.tag,
    styles[`t-${tone}`],
    styles[`s-${size}`],
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <span className={cls} {...rest}>
      {children}
    </span>
  );
}
