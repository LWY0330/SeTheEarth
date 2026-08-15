/* ============================================================
   Input · v1.5 · ui/Input
   - variant: search / text
   - size: md / lg
   - 关联 <label>,错误状态用 aria-describedby
   ============================================================ */

import type { InputHTMLAttributes, ReactNode } from 'react';
import { useId } from 'react';
import styles from './Input.module.css';

export type InputVariant = 'search' | 'text';
export type InputSize = 'md' | 'lg';

export type InputProps = {
  variant?: InputVariant;
  size?: InputSize;
  label: string;
  /** 错误信息(会通过 aria-describedby 关联) */
  error?: string;
  /** hint 提示文本(可选) */
  hint?: string;
  /** icon 节点(只视觉,不参与语义) */
  prefix?: ReactNode;
  suffix?: ReactNode;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>;

/**
 * 通用输入框。
 *
 * @example search · SearchBox
 *   <Input variant="search" size="lg" label="搜索城市" placeholder="..." />
 *
 * @example text · 表单
 *   <Input variant="text" size="md" label="城市名" error="城市不存在" />
 */
export function Input({
  variant = 'text',
  size = 'md',
  label,
  error,
  hint,
  prefix,
  suffix,
  id,
  className,
  ...rest
}: InputProps) {
  const autoId = useId();
  const inputId = id ?? `ui-input-${autoId}`;
  const describedById = error
    ? `${inputId}-error`
    : hint
      ? `${inputId}-hint`
      : undefined;

  const cls = [
    styles.wrap,
    styles[`v-${variant}`],
    styles[`s-${size}`],
    error ? styles.errored : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cls}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>
      <div className={styles.field}>
        {prefix && (
          <span className={styles.prefix} aria-hidden="true">
            {prefix}
          </span>
        )}
        <input
          id={inputId}
          className={styles.input}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedById}
          {...rest}
        />
        {suffix && (
          <span className={styles.suffix} aria-hidden="true">
            {suffix}
          </span>
        )}
      </div>
      {error && (
        <p id={`${inputId}-error`} className={styles.error} role="alert">
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={`${inputId}-hint`} className={styles.hint}>
          {hint}
        </p>
      )}
    </div>
  );
}
