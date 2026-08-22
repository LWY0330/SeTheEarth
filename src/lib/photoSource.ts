/* ============================================================
   看见地球 · v1.6.3 · PROMPT 43 v1 任务 C · 摄影资源管理
   ------------------------------------------------------------
   - §2.8.9 Image Sourcing 实施
   - getPhotoForUnknownStage(stage 1-5) → PhotoAsset
   - Editorial source 优先级 + §2.8.8 Red Layer Image Ethics 审核
   - Phase 1+ Editorial CMS 接入后,改为运行时拉取(本模块提供接口契约)
   - 不动业务文件;不改 Phase 0/1/2 类型
   ============================================================ */

import {
  UNKNOWN_PHOTO_BY_STAGE,
  PHOTO_SOURCE_PRIORITY,
  type PhotoAsset,
  type PhotoSourceType,
  type PhotoRole,
} from '../data/photoAssets.ts';

/**
 * getPhotoForUnknownStage · 5 stage 摄影获取。
 *
 * Phase 1 数据源 = UNKNOWN_PHOTO_BY_STAGE(本地常量)
 * Phase 1+ Editorial CMS 接入后,改为运行时拉取
 *
 * @param stage 1 | 2 | 3 | 4 | 5
 * @returns   PhotoAsset | undefined(若 stage 越界)
 */
export function getPhotoForUnknownStage(
  stage: 1 | 2 | 3 | 4 | 5,
): PhotoAsset | undefined {
  return UNKNOWN_PHOTO_BY_STAGE[stage];
}

/**
 * getPhotoForRole · 按角色获取某 stage 的摄影。
 *
 * Phase 1 简化:5 stage 共用同一图(仅 crop 不同)。
 * Phase 1+ 接 Editorial CMS 后,按 stage × role 提供不同图。
 */
export function getPhotoForRole(
  stage: 1 | 2 | 3 | 4 | 5,
  _role: PhotoRole,
): PhotoAsset | undefined {
  const photo = getPhotoForUnknownStage(stage);
  if (!photo) return undefined;
  // Phase 1:返回同一图(覆盖所有 role);Phase 1+ 按 role 扩展
  return photo;
}

/**
 * validatePhotoAsset · §2.8.9 Required Metadata 12 字段校验。
 *
 * @returns true = 12 字段全填齐,可上线
 */
export function validatePhotoAsset(asset: PhotoAsset): boolean {
  return Boolean(
    asset.asset_id &&
    asset.url &&
    asset.source &&
    asset.source_url &&
    asset.photographer &&
    asset.date &&
    asset.resolution &&
    asset.license &&
    asset.credit_requirement &&
    asset.usage_restriction &&
    asset.content_description &&
    typeof asset.editorial_only === 'boolean',
  );
}

/**
 * isEditorialSourceApproved · §2.8.8 Red Layer Image Ethics 审核。
 *
 * Red Layer 摄影必须满足:
 * - 来自 editorial source(reuters / ap / adobe-editorial / shutterstock-editorial / wikimedia)
 * - editorial_only: true(标记为编辑专用,不可滥用)
 * - 有 usage_restriction(明确使用限制)
 *
 * Blue / Yellow Layer 摄影可来自 unsplash / pexels / stock,但仍需 metadata 完整。
 *
 * @returns asset 是 approved editorial source → true
 */
export function isEditorialSourceApproved(asset: PhotoAsset): boolean {
  // Red Layer 严格校验
  if (asset.source === 'reuters' || asset.source === 'ap' ||
      asset.source === 'adobe-editorial' || asset.source === 'shutterstock-editorial' ||
      asset.source === 'wikimedia') {
    return asset.editorial_only && asset.usage_restriction.length > 0;
  }
  // Blue / Yellow Layer 标准
  return validatePhotoAsset(asset);
}

/**
 * getPhotoSourcePriority · 取图源优先级排序(per §2.8.9)。
 *
 * Editorial 优先于 Stock。
 */
export function getPhotoSourcePriority(): ReadonlyArray<PhotoSourceType> {
  return PHOTO_SOURCE_PRIORITY;
}

/**
 * getPhotoSourceRank · 某图源的优先级 rank(0 = 最高)。
 */
export function getPhotoSourceRank(source: PhotoSourceType): number {
  const idx = PHOTO_SOURCE_PRIORITY.indexOf(source);
  return idx === -1 ? PHOTO_SOURCE_PRIORITY.length : idx;
}

/**
 * comparePhotoSource · 两图源比较(供 sort / filter 使用)。
 *
 * Editorial > Stock(per §2.8.9)。
 */
export function comparePhotoSource(a: PhotoSourceType, b: PhotoSourceType): number {
  return getPhotoSourceRank(a) - getPhotoSourceRank(b);
}