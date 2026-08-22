/* ============================================================
   看见地球 · v1.6.4 · PROMPT 46 v1 · Component Library 共享类型
   ------------------------------------------------------------
   - 6 状态(per d11-component-library-first-pass.md §0)
   - Earth Blue 焦点圈 + 0 阴影 / 0 大圆角 全局规则
   - 不引入新依赖(沿用 React 18.3 + TypeScript 5.5)
   ============================================================ */

import type { ReactNode } from 'react';

/**
 * ComponentState · 6 状态规范(per d11 §6 状态规范)
 *
 * 适用:全部 14 组件
 * Default:初始 / 静止
 * Hover:鼠标移入(220ms ease)
 * Focus:键盘 Tab → Earth Blue 焦点圈 0 0 0 2px rgba(26, 77, 126, 0.40)
 * Active:按下 / 选中(scale 0.99, 120ms)
 * Disabled:不可用(opacity 0.5 + cursor not-allowed)
 * Success:完成 / 提交(绿色对勾或 Layer Red 对勾)
 */
export type ComponentState =
  | 'default'
  | 'hover'
  | 'focus'
  | 'active'
  | 'disabled'
  | 'success';

/**
 * ComponentBaseProps · 所有组件共享 props 基类
 */
export interface ComponentBaseProps {
  /** 6 状态(默认 'default') */
  state?: ComponentState;
  /** 外部 className(合并到组件 root) */
  className?: string;
  /** 子节点 */
  children?: ReactNode;
  /** 测试 ID(per testing-library convention) */
  'data-testid'?: string;
}

/**
 * LayerColor · 3 Layer 颜色(per v1.3 §2.1.9)
 * - blue · Kyoto
 * - yellow · Lisbon
 * - red · Khartoum
 */
export type LayerColor = 'blue' | 'yellow' | 'red';

/**
 * Layer CSS variable name · Phase 0 锁定 LAYER_TO_CSS_VAR
 */
export const LAYER_CSS_VAR: Readonly<Record<LayerColor | 'unknown', string>> = Object.freeze({
  blue: 'var(--earth-blue)',
  yellow: 'var(--layer-yellow)',
  red: 'var(--layer-red)',
  unknown: 'var(--ink-700)',
});

/**
 * TimeDisplay 尺寸(per d11-css-tokens §2.5)
 * - sm · 22px
 * - md · 32px
 * - lg · 64px
 * - xl · 80px
 */
export type TimeDisplaySize = 'sm' | 'md' | 'lg' | 'xl';

/**
 * HeroMedia 高度变体(per d11-css-tokens §4)
 * - '720px' · City Detail / Homepage
 * - '100vh' · Unknown Coordinate
 */
export type HeroHeight = '720px' | '100vh';

/**
 * EchoInput 6 状态(per d11 §12)
 */
export type EchoInputState = 'default' | 'typing' | 'submitted';

/**
 * RevealMeta 阶段(per d10-unknown-coordinate §2.1)
 */
export type RevealStage = 1 | 2 | 3 | 4 | 5;

/**
 * NavItem · GlobalHeader 主导航
 */
export interface NavItem {
  label: string;
  href: string;
  active?: boolean;
}

/**
 * CityTime · WorldTimeRail 单个城市时间
 */
export interface CityTime {
  /** IANA timezone */
  timezone: string;
  /** 城市名(英文) */
  name: string;
  /** 时差相对用户(Phase 1 字符串如 "+5H" / "-3H") */
  offset: string;
  /** ISO 时间或显示字符串 */
  time?: string;
}

/**
 * TimeComparisonItem · TimeComparison / SameSecond 单列
 */
export interface TimeComparisonItem {
  /** 城市名(英文) */
  city: string;
  /** 时间(显示字符串如 "15:53") */
  time: string;
  /** 时差(可选,如 "+5H") */
  delta?: string;
  /** Layer 颜色(可选) */
  layer?: LayerColor;
  /** 描述(可选,SameSecond 用) */
  description?: string;
}

/**
 * SameSecondCity · SameSecond 组件专用
 */
export interface SameSecondCity extends TimeComparisonItem {
  /** 国家名(英文 uppercase 显示) */
  country: string;
}

/**
 * CityComparison · SameSecond 兼容(per d11 §11)
 */
export interface CityComparison {
  id: string;
  name: string;
  country: string;
  time: string;
  description: string;
  layer: LayerColor;
}

/**
 * NavCityRef · DistanceNavigation 上下城市
 */
export interface NavCityRef {
  id: string;
  nameEn: string;
  href: string;
}