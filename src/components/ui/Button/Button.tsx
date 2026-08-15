/* ============================================================
   Button · v1.5 · ui/Button
   - 3 variants (primary / secondary / ghost) · 2 sizes (sm / md)
   - 0 业务逻辑,只展示 props 用法
   - a11y 默认: <button> 元素,icon-only 需 aria-label
   - 反例参考 README.md
   ============================================================ */

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md';

export type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** icon-only 时必填,业务代码自己保证 */
  'aria-label'?: string;
  children: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'>;

/**
 * 通用按钮。
 *
 * @example primary
 *   <Button variant="primary" onClick={openPicker}>选择你的城市</Button>
 *
 * @example ghost · 仅文本
 *   <Button variant="ghost" size="sm">了解更多</Button>
 *
 * @example icon-only · 必须 aria-label
 *   <Button variant="ghost" aria-label="关闭">✕</Button>
 */
export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...rest
}: ButtonProps) {
  const cls = [
    styles.btn,
    styles[`v-${variant}`],
    styles[`s-${size}`],
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <button type="button" className={cls} {...rest}>
      {children}
    </button>
  );
}
