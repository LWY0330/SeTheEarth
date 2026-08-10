/* ============================================================
   看见地球 · v2.80.0 · imageUrl
   - 把 Unsplash 的 baseUrl 加上 width / format / quality 参数
   - 用于 <img src> 和 <source srcset>
   - 支持 webp / jpg，<picture> 优雅降级用 jpg
   ============================================================ */

type ImgFormat = 'webp' | 'jpg';

const DEFAULT_QUALITY: Record<ImgFormat, number> = {
  webp: 75,
  jpg: 80,
};

/** 把基础 URL + 目标宽 + 格式 + 质量 拼成最终 URL */
export function cityImageUrl(
  baseUrl: string,
  width: number,
  format: ImgFormat = 'webp',
  quality: number = DEFAULT_QUALITY[format],
): string {
  // baseUrl 形如 https://images.unsplash.com/photo-XXX?auto=format&fit=crop&w=1600&q=80
  // 用 URL 解析以兼容已有 query string
  const u = new URL(baseUrl);
  u.searchParams.set('w', String(width));
  u.searchParams.set('q', String(quality));
  u.searchParams.set('fm', format);
  u.searchParams.set('fit', 'crop');
  u.searchParams.set('auto', 'format');
  return u.toString();
}

/** 生成 srcset 字符串，widths 是候选宽度数组 */
export function cityImageSrcSet(
  baseUrl: string,
  widths: readonly number[],
  format: ImgFormat = 'webp',
  quality?: number,
): string {
  return widths
    .map((w) => `${cityImageUrl(baseUrl, w, format, quality)} ${w}w`)
    .join(', ');
}

/** 默认尺寸档位（与路线图 PR #9 一致） */
export const HERO_WIDTHS = [400, 800, 1200] as const;  // 主图
export const CARD_WIDTHS = [200, 400, 600] as const;   // 卡片
export const THUMB_WIDTHS = [120, 200] as const;       // 列表小图
