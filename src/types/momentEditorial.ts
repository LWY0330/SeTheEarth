/* ============================================================
   看见地球 · v1.6.1 · PROMPT 39 v1 决策 A.7 · MomentEditorial
   ------------------------------------------------------------
   - PM 决策 A.7:独立 MomentEditorial 类型挂在 Moment.editorial 上
   - 保留 legacy 6 类视觉标签（finance / war / art / urban / nature / romance）
   - 数据/视觉分离:Phase 0 Moment 不含 category,本类型独立管理视觉标签
   - 不动业务文件;不改 spec
   ============================================================ */

/**
 * MomentCategory — legacy 6 类视觉标签（来自 src/data/moments.ts v2.2.2）。
 *
 * Phase 0 Moment schema 不含 category(spec §5.2 17 字段不含 category);
 * PM 决策 A.7:独立 MomentEditorial 挂在 Moment.editorial 上,保留旧数据兼容。
 *
 * 注:war category 在 v1.5 PM 接管审计中被约束（liveMoments.ts:411-422 删除）,
 * 但 category 字段本身保留(其他 5 类正常使用)。
 */
export type MomentCategory = 'finance' | 'war' | 'art' | 'urban' | 'nature' | 'romance';

/**
 * 所有支持的 category 字面量（frozen tuple,Phase 2+ 可扩展）。
 */
export const MOMENT_CATEGORIES: ReadonlyArray<MomentCategory> = Object.freeze([
  'finance', 'war', 'art', 'urban', 'nature', 'romance',
]);

/**
 * MomentEditorial — Moment 视觉/编辑层。
 *
 * Phase 0 Moment schema 不含 category / editorial_note(spec §5.2 17 字段不含);
 * PM 决策 A.7:独立 MomentEditorial 类型,运行时挂在 Moment.editorial 上,作为可选视觉层。
 *
 * 设计原则:
 * - 字段全部 optional(允许 partial data,UI 必须支持 partial render)
 * - category: 视觉标签,UI 用 category 决定 chip 颜色
 * - editorialNote: 编辑录入的额外说明(类似 Moment.caption 但专门给编辑流程)
 *
 * 与 Moment 的关系:
 * ```ts
 * interface Moment {
 *   // ... 17 字段 ...
 *   editorial?: MomentEditorial;  // ← 本类型
 * }
 * ```
 */
export interface MomentEditorial {
  /** 视觉标签(legacy 6 类) */
  readonly category?: MomentCategory;
  /** 编辑录入的额外说明 */
  readonly editorialNote?: string;
}

/**
 * hasMomentEditorial — 判定 MomentEditorial 是否至少有 1 个非空字段。
 */
export function hasMomentEditorial(editorial: MomentEditorial | undefined): boolean {
  if (!editorial) return false;
  return Boolean(editorial.category || editorial.editorialNote);
}

/**
 * isMomentCategory — 严格校验 category 字面量。
 * Phase 2+ UI 渲染 / 过滤时使用。
 */
export function isMomentCategory(value: string): value is MomentCategory {
  return (MOMENT_CATEGORIES as ReadonlyArray<string>).includes(value);
}