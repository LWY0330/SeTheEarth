/* ============================================================
   看见地球 · v1.6.4 · PROMPT 46 v1 · SectionHeader
   ------------------------------------------------------------
   - Section 顶部标题(kicker + 大标题 + 副描述)
   - layerAccent dot 颜色(Blue / Yellow / Red)
   - 静态组件,无状态
   ============================================================ */

import type { LayerColor } from './types';
import { LAYER_CSS_VAR } from './types';
import styles from './SectionHeader.module.css';

export interface SectionHeaderProps {
  kicker: string;
  title: string;
  subtitle?: string;
  layerAccent?: LayerColor;
  className?: string;
}

export function SectionHeader({
  kicker,
  title,
  subtitle,
  layerAccent,
  className,
}: SectionHeaderProps) {
  const dotColor = layerAccent ? LAYER_CSS_VAR[layerAccent] : LAYER_CSS_VAR.unknown;

  return (
    <header className={[styles.header, className].filter(Boolean).join(' ')} data-layer={layerAccent ?? 'none'}>
      <div className={styles.kicker}>
        {layerAccent && (
          <span
            className={styles.dot}
            style={{ background: dotColor }}
            aria-hidden="true"
          />
        )}
        {kicker}
      </div>
      <h2 className={styles.title}>{title}</h2>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
    </header>
  );
}

export default SectionHeader;