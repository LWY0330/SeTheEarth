/* ============================================================
   看见地球 · v1.6.2 · PROMPT 41 v1 · useLayerFromCity hook
   ------------------------------------------------------------
   - 推断 City 的 layer (Blue / Yellow / Red)
   - Phase 1 临时方案:基于 city_id 关键字映射(Kyoto/Khartoum/Lisbon)
   - Phase 2 editorial override:Phase 0 type 加 layer 字段后改为读取
   - 不动业务文件;不改 Phase 0 类型
   ============================================================ */

import { useMemo } from 'react';
import type { City } from '@/types';

/**
 * CityLayer · 3 Layer 枚举(spec §4 Layer System)。
 * - 'blue'   · Kyoto / Blue Layer · Quiet / Daily Life / Nature
 * - 'yellow' · Lisbon / Yellow Layer · Movement / Transition
 * - 'red'    · Khartoum / Red Layer · Pressure / Conflict
 * - 'unknown' · Phase 1 临时,Phase 2 editorial override 后填
 */
export type CityLayer = 'blue' | 'yellow' | 'red' | 'unknown';

/**
 * resolveLayerFromCityId · 纯函数:city_id → Layer 推断。
 *
 * Phase 1 临时规则(基于 city_id 关键字):
 * - city_id 包含 "kyoto" → blue
 * - city_id 包含 "lisbon" → yellow
 * - city_id 包含 "khartoum" → red
 * - 其他 → 'unknown'(Phase 2 editorial override 后填)
 *
 * Phase 2+ 规则:从 City.layer 字段读取(待 Phase 0 schema 加 layer 字段)
 */
export function resolveLayerFromCityId(city_id: string): CityLayer {
  const id = city_id.toLowerCase();
  if (id.includes('kyoto')) return 'blue';
  if (id.includes('lisbon')) return 'yellow';
  if (id.includes('khartoum')) return 'red';
  return 'unknown';
}

/**
 * useLayerFromCity · 推断 City 所属 Layer。
 *
 * @param city Universal City | null
 * @returns   CityLayer
 */
export function useLayerFromCity(city: City | null | undefined): CityLayer {
  return useMemo(() => {
    if (!city) return 'unknown';
    return resolveLayerFromCityId(city.identity.city_id);
  }, [city?.identity.city_id]);
}

/**
 * isLayerKnown · 校验 Layer 是否已确定(非 'unknown')。
 * Phase 2+ UI 可用此决定 layer-specific styling 是否启用。
 */
export function isLayerKnown(layer: CityLayer): boolean {
  return layer !== 'unknown';
}

/**
 * LAYER_TO_CSS_VAR · Layer → CSS 变量映射(Phase 2+ UI 使用)。
 *
 * spec §2.1.9 Layer Palette LOCKED:
 * - blue   → var(--earth-blue) #1A4D7E
 * - yellow → var(--layer-yellow) #D8B15C
 * - red    → var(--layer-red) #D96A5F
 */
export const LAYER_TO_CSS_VAR: Readonly<Record<CityLayer, string>> = {
  blue: 'var(--earth-blue)',
  yellow: 'var(--layer-yellow)',
  red: 'var(--layer-red)',
  unknown: 'var(--ink-700)',
};

/**
 * layerToCssVar · 取 Layer 对应 CSS 变量。
 */
export function layerToCssVar(layer: CityLayer): string {
  return LAYER_TO_CSS_VAR[layer];
}