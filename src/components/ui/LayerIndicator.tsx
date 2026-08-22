/* ============================================================
   看见地球 · v1.6.4 · PROMPT 46 v1 · LayerIndicator
   ------------------------------------------------------------
   - 3 Layer 颜色小圆点 + kicker 文本(Blue / Yellow / Red)
   - P0 基础组件(被 6 组件依赖)
   - 6 状态:default / hover / focus / active / disabled / success
   ============================================================ */

import type { ComponentState, LayerColor } from './types';
import { LAYER_CSS_VAR } from './types';
import styles from './LayerIndicator.module.css';

export interface LayerIndicatorProps {
  layer: LayerColor;
  label: string;
  kicker?: string;
  state?: ComponentState;
  className?: string;
}

const LAYER_LABEL: Readonly<Record<LayerColor, string>> = {
  blue: 'BLUE',
  yellow: 'YELLOW',
  red: 'RED',
};

export function LayerIndicator({
  layer,
  label,
  kicker,
  state = 'default',
  className,
}: LayerIndicatorProps) {
  const rootClass = [
    styles.indicator,
    styles[`indicator--${state}`],
    className,
  ].filter(Boolean).join(' ');

  return (
    <span className={rootClass} data-state={state} data-layer={layer}>
      <span
        className={styles.dot}
        style={{ background: LAYER_CSS_VAR[layer] }}
        aria-hidden="true"
      />
      <span className={styles.kicker}>
        {kicker ?? `${LAYER_LABEL[layer]} · ${label.toUpperCase()}`}
      </span>
    </span>
  );
}

export default LayerIndicator;