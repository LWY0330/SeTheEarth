/* ============================================================
   看见地球 · v2.60.0 · WeatherIcon
   - 极简 line-style SVG 图标（无 emoji · 无外部库）
   - 8 种状态：sun · cloud · fog · drizzle · rain · snow · thunder · unknown
   - 颜色通过 currentColor 继承父元素，可在 CSS 里统一控制
   - 默认 16px，aria-hidden 默认 true（CityNow 会在文字上重复语义）
   ============================================================ */

import type { WeatherIconName } from '@/lib/weatherCodes';

export type WeatherIconProps = {
  name: WeatherIconName;
  size?: number;
  className?: string;
  /** 当作纯装饰；CityNow 用 false 因为旁边有同义文字 */
  decorative?: boolean;
  /** 当 decorative=false 时使用，作为 a11y 兜底描述 */
  label?: string;
};

const DEFAULT_LABEL: Record<WeatherIconName, string> = {
  sun: '晴',
  cloud: '多云',
  fog: '雾',
  drizzle: '毛毛雨',
  rain: '雨',
  snow: '雪',
  thunder: '雷暴',
  unknown: '未知天气',
};

/**
 * 通用描边样式。stroke-width 用 1.5（24×24 viewBox 下是细线，
 * 比 2 更接近编辑式克制，比 1 更清晰）。
 */
const COMMON = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

function Sun() {
  return (
    <svg {...COMMON} aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2"  x2="12" y2="4"  />
      <line x1="12" y1="20" x2="12" y2="22" />
      <line x1="2"  y1="12" x2="4"  y2="12" />
      <line x1="20" y1="12" x2="22" y2="12" />
      <line x1="4.93"  y1="4.93"  x2="6.34"  y2="6.34"  />
      <line x1="17.66" y1="17.66" x2="19.07" y2="19.07" />
      <line x1="4.93"  y1="19.07" x2="6.34"  y2="17.66" />
      <line x1="17.66" y1="6.34"  x2="19.07" y2="4.93"  />
    </svg>
  );
}

function Cloud() {
  return (
    <svg {...COMMON} aria-hidden="true">
      <path d="M7 17h10a3.5 3.5 0 0 0 .5-6.97A5.5 5.5 0 0 0 7.2 11.5 3.5 3.5 0 0 0 7 17z" />
    </svg>
  );
}

function Fog() {
  return (
    <svg {...COMMON} aria-hidden="true">
      <path d="M6 11h10a3 3 0 0 0 0-6 4 4 0 0 0-7.7-.5A3 3 0 0 0 6 11z" />
      <line x1="4"  y1="15" x2="20" y2="15" />
      <line x1="6"  y1="19" x2="18" y2="19" />
    </svg>
  );
}

function Drizzle() {
  return (
    <svg {...COMMON} aria-hidden="true">
      <path d="M7 14h10a3.5 3.5 0 0 0 .5-6.97A5.5 5.5 0 0 0 7.2 8.5 3.5 3.5 0 0 0 7 14z" />
      <line x1="9"  y1="18" x2="8"  y2="20" />
      <line x1="13" y1="18" x2="12" y2="20" />
      <line x1="17" y1="18" x2="16" y2="20" />
    </svg>
  );
}

function Rain() {
  return (
    <svg {...COMMON} aria-hidden="true">
      <path d="M7 13h10a3.5 3.5 0 0 0 .5-6.97A5.5 5.5 0 0 0 7.2 7.5 3.5 3.5 0 0 0 7 13z" />
      <line x1="8"  y1="17" x2="7"  y2="20" />
      <line x1="12" y1="17" x2="11" y2="20" />
      <line x1="16" y1="17" x2="15" y2="20" />
    </svg>
  );
}

function Snow() {
  return (
    <svg {...COMMON} aria-hidden="true">
      <path d="M7 13h10a3.5 3.5 0 0 0 .5-6.97A5.5 5.5 0 0 0 7.2 7.5 3.5 3.5 0 0 0 7 13z" />
      <line x1="8"  y1="17" x2="8"  y2="19" />
      <line x1="7"  y1="18" x2="9"  y2="18" />
      <line x1="12" y1="18" x2="12" y2="20" />
      <line x1="11" y1="19" x2="13" y2="19" />
      <line x1="16" y1="17" x2="16" y2="19" />
      <line x1="15" y1="18" x2="17" y2="18" />
    </svg>
  );
}

function Thunder() {
  return (
    <svg {...COMMON} aria-hidden="true">
      <path d="M7 13h10a3.5 3.5 0 0 0 .5-6.97A5.5 5.5 0 0 0 7.2 7.5 3.5 3.5 0 0 0 7 13z" />
      <path d="M12 14 L9.5 19 H12 L11 22 L14.5 17 H12 L12.5 14 Z" />
    </svg>
  );
}

function Unknown() {
  return (
    <svg {...COMMON} aria-hidden="true">
      <circle cx="12" cy="12" r="9" strokeDasharray="3 3" />
      <line x1="9" y1="10" x2="15" y2="10" />
    </svg>
  );
}

export function WeatherIcon({
  name,
  size = 16,
  className,
  decorative = true,
  label,
}: WeatherIconProps) {
  const inner = (() => {
    switch (name) {
      case 'sun':     return <Sun />;
      case 'cloud':   return <Cloud />;
      case 'fog':     return <Fog />;
      case 'drizzle': return <Drizzle />;
      case 'rain':    return <Rain />;
      case 'snow':    return <Snow />;
      case 'thunder': return <Thunder />;
      case 'unknown': return <Unknown />;
    }
  })();

  const a11y = decorative
    ? { 'aria-hidden': true as const, focusable: false as const }
    : { role: 'img' as const, 'aria-label': label ?? DEFAULT_LABEL[name] };

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        lineHeight: 0,
        color: 'currentColor',
        flexShrink: 0,
      }}
    >
      <span {...a11y} style={{ width: size, height: size, display: 'inline-block' }}>
        {inner}
      </span>
    </span>
  );
}

export default WeatherIcon;
