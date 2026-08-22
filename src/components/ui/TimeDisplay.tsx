/* ============================================================
   看见地球 · v1.6.4 · PROMPT 46 v1 · TimeDisplay
   ------------------------------------------------------------
   - 时间数字展示(mono + tabular-nums)
   - 4 尺寸:sm/md/lg/xl(per d11-css-tokens §2.5)
   - format:time / coord(2 种)
   - 跨页面基础组件(被 4 组件依赖)
   ============================================================ */

import type { ComponentState, LayerColor, TimeDisplaySize } from './types';
import { LAYER_CSS_VAR } from './types';
import styles from './TimeDisplay.module.css';

export interface TimeDisplayProps {
  value: string;
  size?: TimeDisplaySize;
  layer?: LayerColor;
  format?: 'time' | 'coord';
  state?: ComponentState;
  className?: string;
}

const SIZE_CLASS: Readonly<Record<TimeDisplaySize, string>> = {
  sm: 'time--sm',
  md: 'time--md',
  lg: 'time--lg',
  xl: 'time--xl',
};

export function TimeDisplay({
  value,
  size = 'md',
  layer,
  format = 'time',
  state = 'default',
  className,
}: TimeDisplayProps) {
  const rootClass = [
    styles.time,
    styles[SIZE_CLASS[size]],
    styles[`time--${state}`],
    className,
  ].filter(Boolean).join(' ');

  const style = layer ? { color: LAYER_CSS_VAR[layer] } : undefined;

  return (
    <time className={rootClass} data-state={state} data-format={format} style={style}>
      {value}
    </time>
  );
}

export default TimeDisplay;