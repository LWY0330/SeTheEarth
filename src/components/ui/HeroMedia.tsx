/* ============================================================
   看见地球 · v1.6.4 · PROMPT 46 v1 · HeroMedia
   ------------------------------------------------------------
   - 全幅摄影 + 暗 gradient overlay + 文字安全区
   - 3 高度:'720px' (City Detail) / '100vh' (Unknown)
   - safeArea:left / center / bottom
   - 跨页面核心视觉母版
   ============================================================ */

import type { ReactNode } from 'react';
import type { ComponentState, HeroHeight } from './types';
import styles from './HeroMedia.module.css';

export interface HeroMediaProps {
  src: string;
  alt: string;
  height?: HeroHeight;
  overlay?: 'top-bottom' | 'left' | 'warm-bottom' | 'none';
  safeArea?: 'left' | 'center' | 'bottom';
  children?: ReactNode;
  state?: ComponentState;
  className?: string;
}

export function HeroMedia({
  src,
  alt,
  height = '720px',
  overlay = 'top-bottom',
  safeArea = 'left',
  children,
  state = 'default',
  className,
}: HeroMediaProps) {
  const rootClass = [
    styles.hero,
    styles[`hero--height-${height}`],
    className,
  ].filter(Boolean).join(' ');

  return (
    <section className={rootClass} data-state={state} data-height={height}>
      <img className={styles.image} src={src} alt={alt} loading="eager" />
      {overlay !== 'none' && (
        <div
          className={[styles.overlay, styles[`overlay--${overlay}`]].join(' ')}
          aria-hidden="true"
        />
      )}
      {children && (
        <div className={[styles.safeArea, styles[`safeArea--${safeArea}`]].join(' ')}>
          {children}
        </div>
      )}
    </section>
  );
}

export default HeroMedia;