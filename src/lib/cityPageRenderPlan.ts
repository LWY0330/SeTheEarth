/* ============================================================
   看见地球 · v1.6 · PROMPT 36 Phase 1 prep · CityPage Render Plan
   ------------------------------------------------------------
   - 给定 City(已含 page_state),产出 CityPage 渲染计划(数据层)
   - 不含 React / CSS / 文案;Phase 2 React 层消费 plan,按 pageHeaderVariant 和 sections 渲染
   - Phase 1 最小实现 + Phase 2 扩展点
   - 不动业务文件;不改 City / Moment 类型
   ============================================================ */

import type { City, CityPageState } from '@/types';

/* ---------- Section IDs ---------- */

/**
 * CityPage 的 4 屏 section(对齐 PM 拍板的 4-screen pattern)。
 *
   Phase 2 Gate 2(4-screen → V2 Mapping 拍板)可能改名 / 加 section;
   改名时同步更新此 enum + section plan 函数。
 */
export type CitySectionId = 'hero' | 'one_scene' | 'same_second' | 'echo';

/* ---------- Render Decision ---------- */

/**
 * 单个 section 的渲染决策:
 * - render:       正常渲染
 * - render-empty: 渲染 + 显示空状态文案/占位(SPEC: 部分数据允许为空,UI 必须支持)
 * - hide:         整个 section 不渲染(上层跳过)
 */
export type RenderDecision = 'render' | 'render-empty' | 'hide';

/* ---------- Header Variant ---------- */

/**
 * CityPage 顶部 header 的 5 个 variant:
 * - seed-editorial: A 状态,Seed City,完整 Hero + 编辑叙事突出
 * - active-now:     B 状态,活跃,Now 区域突出
 * - low-activity:   C 状态,低活跃,Now 减弱但仍在
 * - past-only:      D 状态,仅过去,Now 区域显示空
 * - empty:          E 状态,完全空,City 刚加入系统
 */
export type CityPageHeaderVariant =
  | 'seed-editorial'
  | 'active-now'
  | 'low-activity'
  | 'past-only'
  | 'empty';

/* ---------- Plan Types ---------- */

export interface CitySectionPlan {
  /** 渲染决策 */
  decision: RenderDecision;
  /** 给 React 层 / 设计师读的 reason(why this decision) */
  reason: string;
}

/**
 * CityPage 渲染计划。
 * Phase 2 React 组件消费的契约。
 */
export interface CityPageRenderPlan {
  city_id: string;
  page_state: CityPageState;
  pageHeaderVariant: CityPageHeaderVariant;
  sections: Readonly<Record<CitySectionId, CitySectionPlan>>;
  /** Phase 0 不推导的状态 / 字段 → UI 显示 warning */
  warnings: readonly string[];
}

/* ---------- page_state → header variant 映射 ---------- */

/**
 * page_state → header variant 的确定性映射。
 * Phase 0 锁定映射规则;Phase 2 设计师可调整视觉,不影响映射规则。
 */
export function pageStateToHeaderVariant(
  page_state: CityPageState,
): CityPageHeaderVariant {
  switch (page_state) {
    case 'A_seed_editorial':
      return 'seed-editorial';
    case 'B_active':
      return 'active-now';
    case 'C_low_activity':
      return 'low-activity';
    case 'D_past_only':
      return 'past-only';
    case 'E_empty':
      return 'empty';
  }
}

/* ---------- Section plan helpers ---------- */

function planHeroSection(city: City): CitySectionPlan {
  if (city.visual?.hero_media) {
    return { decision: 'render', reason: 'hero_media 已设置' };
  }
  if (city.visual?.visual_status === 'placeholder') {
    return { decision: 'render-empty', reason: 'visual_status=placeholder,显示系统级占位' };
  }
  if (city.visual?.visual_status === 'none' || !city.visual) {
    return { decision: 'render-empty', reason: '无 visual / visual_status=none,显示空 hero 占位' };
  }
  return { decision: 'render-empty', reason: 'hero_media 未设置,Phase 1 显示 placeholder' };
}

function planOneSceneSection(city: City): CitySectionPlan {
  // One Scene 需要 NOW/TODAY Moment 数据
  if (city.page_state === 'E_empty') {
    return { decision: 'render-empty', reason: 'E_empty 无 Moment 数据' };
  }
  if (city.page_state === 'D_past_only') {
    return { decision: 'render-empty', reason: 'D_past_only 无 NOW/TODAY Moment' };
  }
  return { decision: 'render', reason: '有 NOW/TODAY Moment 数据' };
}

function planSameSecondSection(city: City): CitySectionPlan {
  // Same Second 需 3 城并置,无数据时整段隐藏
  if (city.page_state === 'E_empty') {
    return { decision: 'hide', reason: 'E_empty 无 Moment,无法做 3 城并置' };
  }
  return { decision: 'render', reason: '至少有 Moment 数据' };
}

function planEchoSection(_city: City): CitySectionPlan {
  // Echo 永远渲染(5 态管理由 React state 控制,不在 plan 层)
  return { decision: 'render', reason: 'Echo 永远渲染(5 态由 React state 控制)' };
}

/* ---------- 主函数 ---------- */

/**
 * 核心函数:City → render plan。
 *
 * Phase 1 最小实现:基于 page_state 推导 header variant + 每个 section 的 render decision。
 * Phase 2 React 层按 plan 渲染;设计师可调整视觉(颜色 / 文案 / 动画),不影响 plan 推导。
 *
 * 警告:L1_contextualized 状态在 Phase 0 不推导,需 Phase 1+ 由 Context 源接入后判定。
 *       Phase 0 City 对象的 state_level 若为 L1,UI 应显示"Context 暂未提供"。
 */
export function planCityPageRender(city: City): CityPageRenderPlan {
  const warnings: string[] = [];
  if (city.state_level === 'L1_contextualized') {
    warnings.push(
      'L1_contextualized 在 Phase 0 不推导(需 Context 源接入后判定);' +
      'UI 应显示"Context 暂未提供"占位',
    );
  }

  return {
    city_id: city.identity.city_id,
    page_state: city.page_state,
    pageHeaderVariant: pageStateToHeaderVariant(city.page_state),
    sections: {
      hero: planHeroSection(city),
      one_scene: planOneSceneSection(city),
      same_second: planSameSecondSection(city),
      echo: planEchoSection(city),
    },
    warnings: Object.freeze(warnings),
  };
}