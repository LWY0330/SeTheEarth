/* ============================================================
   看见地球 · v1.6.4 · PROMPT 46 v1 · Component Library 统一导出
   ------------------------------------------------------------
   - 14 组件 barrel export
   - 类型 re-export from types.ts
   - 命名约定:PascalCase,符合 d11 §5.1
   ============================================================ */

// 共享类型
export {
  LAYER_CSS_VAR,
  type ComponentBaseProps,
  type ComponentState,
  type CityComparison,
  type CityTime,
  type EchoInputState,
  type HeroHeight,
  type LayerColor,
  type NavCityRef,
  type NavItem,
  type RevealStage,
  type SameSecondCity,
  type TimeComparisonItem,
  type TimeDisplaySize,
} from './types';

// 14 组件(barrel export)
export { GlobalHeader } from './GlobalHeader';
export { SectionHeader } from './SectionHeader';
export { HeroMedia } from './HeroMedia';
export { WorldTimeRail } from './WorldTimeRail';
export { TimeDisplay } from './TimeDisplay';
export { TimeComparison } from './TimeComparison';
export { CoordinateWindow } from './CoordinateWindow';
export { LocationMeta } from './LocationMeta';
export { LayerIndicator } from './LayerIndicator';
export { OneScene } from './OneScene';
export { SameSecond } from './SameSecond';
export { EchoInput } from './EchoInput';
export { DistanceNavigation } from './DistanceNavigation';
export { RevealMeta } from './RevealMeta';