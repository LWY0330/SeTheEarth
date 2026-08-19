/* ============================================================
   看见地球 · v1.6 · PROMPT 36 Phase 0 · City State 类型
   ------------------------------------------------------------
   - CityStateLevel (后台): L0 → L4 五个成熟度
   - CityPageState   (前台): A → E 五个产品状态
   - 二者独立：后台运营/技术状态 vs 前台产品/UI 状态
   - 与 04-路线图/global-city-coverage-system-v1.0.md §6 §7 对齐
   - 这是 Phase 0 的纯类型层；不引入 runtime 逻辑
   ============================================================ */

/**
 * CityStateLevel — 后台成熟度（运营/技术维度）
 * - 仅在内部系统可见；前台不暴露 L0/L1 等术语
 * - 由 getCityStateLevel() 在运行时基于 City + MomentStats 计算
 */
export type CityStateLevel =
  /** 城市坐标 + 时区存在（最低映射） */
  | 'L0_mapped'
  /** + 运行时 Context（Phase 1+ 由外部源补全） */
  | 'L1_contextualized'
  /** 历史上至少 1 条合格 Moment */
  | 'L2_witnessed'
  /** 近期持续被记录（7 天内有 Moment） */
  | 'L3_active'
  /** 时间跨度 + 连续度（30 天内有 ≥7 天 witnessed） */
  | 'L4_living_archive';

/**
 * CityPageState — 前台产品状态（用户可见的视觉/交互维度）
 * - 设计师必须为每种状态设计独立视觉（PROMPT 36 §7）
 * - State A/B/C/D/E 与 5 个 Designer Workstream（P0 5 City States）一一对应
 */
export type CityPageState =
  /** Seed / Editorial City：完整视觉 + Context + Seed Moment */
  | 'A_seed_editorial'
  /** Active City：最近多个 Moment，NOW 为主角 */
  | 'B_active'
  /** Low Activity City：今天少量 Moment，避免页面显得坏掉 */
  | 'C_low_activity'
  /** Past Only City：今天无 Moment，历史上曾有 */
  | 'D_past_only'
  /** Empty City：城市存在，从未有 Moment */
  | 'E_empty';

/** 5 + 5 枚举的元数据：用于文档/UI chip/调试日志 */
export const CITY_STATE_LEVEL_LABELS: Readonly<Record<CityStateLevel, string>> = {
  L0_mapped: 'L0 · Mapped',
  L1_contextualized: 'L1 · Contextualized',
  L2_witnessed: 'L2 · Witnessed',
  L3_active: 'L3 · Active',
  L4_living_archive: 'L4 · Living Archive',
};

export const CITY_PAGE_STATE_LABELS: Readonly<Record<CityPageState, string>> = {
  A_seed_editorial: 'A · Seed / Editorial',
  B_active: 'B · Active',
  C_low_activity: 'C · Low Activity',
  D_past_only: 'D · Past Only',
  E_empty: 'E · Empty',
};
