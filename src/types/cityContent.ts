/* ============================================================
   看见地球 · v1.6.1 · PROMPT 39 v1 决策 A.3 · CityContent
   ------------------------------------------------------------
   - PM 决策 A.3:独立 CityContent 类型,运行时挂在 City 上
   - 5 编辑文案字段（description / momentZh / oneObservation / livingNote / cultureNote）
   - 不动 City 必填字段;City 加 content?: CityContent（optional）
   - 字段命名保留 camelCase（与 legacy src/data/cities.ts 对齐）
   - 不动业务文件;不改 spec
   ============================================================ */

/**
 * CityContent — 城市编辑文案层
 *
 * Phase 0 Universal City schema 不含编辑文案(spec §4.1 仅 12 Identity 字段)。
 * PM 决策 A.3:独立 CityContent 类型,运行时挂在 City.content 上,作为可选内容层。
 *
 * 设计原则:
 * - 5 字段全部 optional(允许 partial data,UI 必须支持 partial render)
 * - 字段命名与 legacy src/data/cities.ts 对齐(camelCase):便于 Phase 1 migration adapter 直接复用
 * - 中文文案为主(项目 MVP 中文优先);Phase 2+ i18n 扩展可加 content_zh / content_en 双语变体
 * - 编辑录入源 = Editorial CMS(Phase 1+ 接入),不入 City schema 静态字段
 *
 * 与 City 的关系:
 * ```ts
 * interface City {
 *   identity: CityIdentity;
 *   visual?: CityVisual;
 *   state_level: CityStateLevel;
 *   page_state: CityPageState;
 *   moment_stats?: MomentStats;
 *   content?: CityContent;  // ← 本类型
 * }
 * ```
 *
 * Phase 2+ UI 渲染规则(per spec §12.2):
 * - description: 长文,首屏顶部
 * - momentZh: "此刻"叙事短句,Hero 下方
 * - oneObservation: 单条观察,Echo 区域
 * - livingNote: 当地生活注记,One Scene 旁
 * - cultureNote: 文化背景注记,Same Second 旁
 */
export interface CityContent {
  /** 城市整体描述(长文,2-4 段) */
  readonly description?: string;
  /** "此刻"叙事(中文,一句话) */
  readonly momentZh?: string;
  /** 单条观察(一句话) */
  readonly oneObservation?: string;
  /** 当地生活注记(中等长度) */
  readonly livingNote?: string;
  /** 文化背景注记(中等长度) */
  readonly cultureNote?: string;
}

/**
 * hasCityContent — 判定 CityContent 是否至少有 1 个非空字段。
 * Phase 2+ UI 渲染决策:CityContent 全空 → 不渲染内容层（仅 Hero + Editorial 标识）
 */
export function hasCityContent(content: CityContent | undefined): boolean {
  if (!content) return false;
  return Boolean(
    content.description ||
    content.momentZh ||
    content.oneObservation ||
    content.livingNote ||
    content.cultureNote,
  );
}

/**
 * countCityContentFields — 统计非空字段数(0-5)。
 * Phase 2+ 调试 + analytics 使用。
 */
export function countCityContentFields(content: CityContent | undefined): number {
  if (!content) return 0;
  let n = 0;
  if (content.description) n++;
  if (content.momentZh) n++;
  if (content.oneObservation) n++;
  if (content.livingNote) n++;
  if (content.cultureNote) n++;
  return n;
}