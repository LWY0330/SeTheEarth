/* ============================================================
   Card · v1.5 · ui/Card
   - 3 variants: syncmoment / editorial / elevated
   - editorial 用 <section>(区块),其他用 <article>(内容单元)
   - a11y: 必有 aria-label 或 children 含语义标题
   ============================================================ */

import type { ReactNode } from 'react';
import styles from './Card.module.css';

export type CardVariant = 'syncmoment' | 'editorial' | 'elevated';

export type CardProps = {
  variant?: CardVariant;
  /** 必填(给屏幕阅读器一个简介) */
  'aria-label'?: string;
  /** 业务组件可传 as / role,但默认 article/section */
  children: ReactNode;
};

/**
 * 通用卡片。
 *
 * @example syncmoment
 *   <Card variant="syncmoment" aria-label="京都 vs 上海 同步感对比">
 *     <SyncMomentContent />
 *   </Card>
 *
 * @example editorial · 板块区块
 *   <Card variant="editorial">
 *     <h2>板块标题</h2>
 *     <p>...</p>
 *   </Card>
 *
 * @example elevated · 浮层卡(Modal 内子卡)
 *   <Card variant="elevated">...</Card>
 */
export function Card({
  variant = 'editorial',
  'aria-label': ariaLabel,
  children,
}: CardProps) {
  const cls = [styles.card, styles[`v-${variant}`]].join(' ');
  if (variant === 'editorial') {
    return (
      <section className={cls} aria-label={ariaLabel}>
        {children}
      </section>
    );
  }
  return (
    <article className={cls} aria-label={ariaLabel}>
      {children}
    </article>
  );
}
