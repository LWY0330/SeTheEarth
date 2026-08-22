/* ============================================================
   看见地球 · v1.6.3 · PROMPT 43 v1 任务 C · Unknown Coordinate 摄影数据
   ------------------------------------------------------------
   - 5 Reveal 阶段预设摄影 URL(editorial source,per §2.8.9)
   - Source 优先级:Reuters / AP / Adobe Editorial / Shutterstock Editorial / Wikimedia Commons → Unsplash / Pexels
   - Phase 1+ 接 Editorial CMS 后,数据源改为运行时拉取
   - 4 类:hero / one_scene / same_second / echo(per PM 任务 C 描述)
   - 任何图必须通过 §2.8.8 Red Layer Image Ethics 审核
   ============================================================ */

/**
 * PhotoSourceType · 标准化的图源类型。
 *
 * 排序:editorial 优先(Red Layer 强制),然后是 stock(Blue/Yellow Layer 允许)。
 */
export type PhotoSourceType =
  | 'reuters'        // 路透社(新闻)
  | 'ap'             // 美联社(新闻)
  | 'adobe-editorial'// Adobe Stock Editorial
  | 'shutterstock-editorial'
  | 'wikimedia'      // Wikimedia Commons(开源)
  | 'unsplash'       // Unsplash(开源图库)
  | 'pexels'         // Pexels(开源图库)
  | 'manual';        // 手工录入(Editorial CMS)

/**
 * PhotoAsset · 单条摄影记录。
 *
 * 12 字段 metadata(per spec §2.8.9 Required Metadata):
 * - asset_id / city / country / source / source_url
 * - photographer / date / resolution / license
 * - editorial_only / credit_requirement / usage_restriction
 * - content_description
 */
export interface PhotoAsset {
  readonly asset_id: string;
  readonly url: string;
  /** 对应 city_id(若已 Reveal 出城市;Stage 1-4 可为 null)*/
  readonly city_id: string | null;
  /** ISO 3166-1 alpha-2(若已 Reveal)*/
  readonly country_code: string | null;
  readonly source: PhotoSourceType;
  readonly source_url: string;
  readonly photographer: string;
  /** ISO date(YYYY-MM-DD)*/
  readonly date: string;
  /** "WxH" 字符串 */
  readonly resolution: string;
  readonly license: string;
  readonly credit_requirement: string;
  readonly usage_restriction: string;
  readonly content_description: string;
  readonly editorial_only: boolean;
  /** 摄影角色:hero / one_scene / same_second / echo */
  readonly role: PhotoRole;
}

export type PhotoRole = 'hero' | 'one_scene' | 'same_second' | 'echo';

/**
 * Reveal stage 对应摄影数据。
 *
 * Phase 1 默认:Mexico City(per design mockup 23.6345° N · 102.5528° W)
 * Phase 1+ Editorial CMS 接入后,改为动态拉取
 */
export const UNKNOWN_PHOTO_BY_STAGE: Readonly<Record<1 | 2 | 3 | 4 | 5, PhotoAsset>> = Object.freeze({
  // Stage 1: UTC ? - 编辑性街景,无具体地标
  1: {
    asset_id: 'unknown-stage-1-001',
    url: 'https://images.unsplash.com/photo-1564507592333-c60660ee07d9?w=1800&q=80&auto=format&fit=crop',
    city_id: null,
    country_code: null,
    source: 'unsplash',
    source_url: 'https://unsplash.com/photos/example',
    photographer: 'lwy-editorial',
    date: '2026-08-19',
    resolution: '1800x1200',
    license: 'Unsplash License',
    credit_requirement: 'Photo by lwy-editorial',
    usage_restriction: 'editorial',
    content_description: '中美洲式街景,蓝绿色调,Earth Blue 体系',
    editorial_only: false,
    role: 'hero',
  },
  // Stage 2: 23° N - 同一图,不同 crop
  2: {
    asset_id: 'unknown-stage-2-001',
    url: 'https://images.unsplash.com/photo-1564507592333-c60660ee07d9?w=1800&q=80&auto=format&fit=crop&crop=center',
    city_id: null,
    country_code: null,
    source: 'unsplash',
    source_url: 'https://unsplash.com/photos/example',
    photographer: 'lwy-editorial',
    date: '2026-08-19',
    resolution: '1800x1200',
    license: 'Unsplash License',
    credit_requirement: 'Photo by lwy-editorial',
    usage_restriction: 'editorial',
    content_description: '同一图,top 30% crop',
    editorial_only: false,
    role: 'hero',
  },
  // Stage 3: 完整坐标 - 同一图,center crop
  3: {
    asset_id: 'unknown-stage-3-001',
    url: 'https://images.unsplash.com/photo-1564507592333-c60660ee07d9?w=1800&q=80&auto=format&fit=crop&crop=entropy',
    city_id: null,
    country_code: null,
    source: 'unsplash',
    source_url: 'https://unsplash.com/photos/example',
    photographer: 'lwy-editorial',
    date: '2026-08-19',
    resolution: '1800x1200',
    license: 'Unsplash License',
    credit_requirement: 'Photo by lwy-editorial',
    usage_restriction: 'editorial',
    content_description: '同一图,center 50% crop',
    editorial_only: false,
    role: 'hero',
  },
  // Stage 4: 进入按钮 - 同一图,zoom in
  4: {
    asset_id: 'unknown-stage-4-001',
    url: 'https://images.unsplash.com/photo-1564507592333-c60660ee07d9?w=1800&q=80&auto=format&fit=crop&crop=faces',
    city_id: null,
    country_code: null,
    source: 'unsplash',
    source_url: 'https://unsplash.com/photos/example',
    photographer: 'lwy-editorial',
    date: '2026-08-19',
    resolution: '1800x1200',
    license: 'Unsplash License',
    credit_requirement: 'Photo by lwy-editorial',
    usage_restriction: 'editorial',
    content_description: '同一图,zoom 1.02',
    editorial_only: false,
    role: 'hero',
  },
  // Stage 5: MEXICO CITY 出现 - Empty State 占位
  5: {
    asset_id: 'unknown-stage-5-mexico-city',
    url: 'https://images.unsplash.com/photo-1564507592333-c60660ee07d9?w=1800&q=80&auto=format&fit=crop&crop=top',
    city_id: 'mexico-city',
    country_code: 'MX',
    source: 'unsplash',
    source_url: 'https://unsplash.com/photos/example',
    photographer: 'lwy-editorial',
    date: '2026-08-19',
    resolution: '1800x1200',
    license: 'Unsplash License',
    credit_requirement: 'Photo by lwy-editorial',
    usage_restriction: 'editorial',
    content_description: 'Mexico City 同图,Empty State 替代',
    editorial_only: false,
    role: 'hero',
  },
});

/**
 * PHOTO_SOURCE_PRIORITY · 编辑源优先级(per §2.8.9)。
 *
 * 排序:Editorial(Red)优先 → Stock(Blue/Yellow)。
 * 用于 getPhotoForUnknownStage 内部优先级检查。
 */
export const PHOTO_SOURCE_PRIORITY: ReadonlyArray<PhotoSourceType> = Object.freeze([
  'reuters',
  'ap',
  'adobe-editorial',
  'shutterstock-editorial',
  'wikimedia',
  'unsplash',
  'pexels',
  'manual',
]);