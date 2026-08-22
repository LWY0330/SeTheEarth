/* ============================================================
   看见地球 · v1.6.4 · PROMPT 46 v1 · GlobalHeader
   ------------------------------------------------------------
   - 全站顶部导航(Logo + 主导航 + 当前状态)
   - 3 变体:default / simplified (Unknown) / withBack (City Detail)
   - sticky 半透明 + backdrop-filter blur
   ============================================================ */

import type { ComponentState, NavItem } from './types';
import styles from './GlobalHeader.module.css';

export interface GlobalHeaderProps {
  logo: { cn: string; en: string };
  navItems?: NavItem[];
  backHref?: string;
  backLabel?: string;
  simplified?: boolean;
  state?: ComponentState;
  className?: string;
}

export function GlobalHeader({
  logo,
  navItems = [],
  backHref,
  backLabel,
  simplified = false,
  state = 'default',
  className,
}: GlobalHeaderProps) {
  const rootClass = [
    styles.header,
    simplified && styles['header--simplified'],
    styles[`header--${state}`],
    className,
  ].filter(Boolean).join(' ');

  return (
    <header className={rootClass} data-state={state} data-simplified={simplified}>
      {backHref && !simplified && (
        <a href={backHref} className={styles.back} aria-label={backLabel ?? 'back'}>
          ← {backLabel}
        </a>
      )}
      <a href="/" className={styles.logo}>
        <span className={styles.logoCn}>{logo.cn}</span>
        {!simplified && <span className={styles.logoEn}>{logo.en}</span>}
      </a>
      {!simplified && (
        <nav className={styles.nav}>
          {navItems.map((item, i) => (
            <a
              key={i}
              href={item.href}
              className={[
                styles.navLink,
                item.active && styles['navLink--active'],
              ].filter(Boolean).join(' ')}
              data-active={item.active ? 'true' : 'false'}
            >
              {item.label}
            </a>
          ))}
        </nav>
      )}
      {simplified && <span className={styles.dot} aria-hidden="true" />}
    </header>
  );
}

export default GlobalHeader;