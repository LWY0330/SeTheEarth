/* ============================================================
   看见地球 · v2.80.0 · imageUrl (v1.3 hotfix: relative URL support)
   - 绝对 URL（Unsplash / Pexels）：加 width / format / quality 参数
   - 相对路径（self-host 本地图，PR #16 落地）：直接返回原 URL
     * 本地图已经过 PR #9 优化（WebP + 正确尺寸 + 正确尺寸的 jpg 副本）
     * 不再加 w/q/fm/fit/auto（这些是 CDN 专属参数）
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
  // 相对路径（self-host 本地图，PR #16 落地）：已经是优化版（PR #9 WebP + 正确尺寸），
  // 直接返回，不再加 w/q/fm/fit/auto 参数（unsplash/pexels 专属）
  if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
    return baseUrl;
  }

  // 绝对 URL（Unsplash / Pexels CDN）：加 CDN 专属优化参数
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
