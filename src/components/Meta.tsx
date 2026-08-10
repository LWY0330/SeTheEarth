/* ============================================================
   看见地球 · v2.70.0 · <Meta>
   - 统一管理 document.head 的 title / description / OG / Twitter / canonical
   - SPA 路由切换时（组件 mount / prop 变化）自动更新
   - 不引入 react-helmet 等第三方库
   ============================================================ */

import { useEffect } from 'react';

const SITE_URL = 'https://see-earth.vercel.app'; // TODO: 部署后改为实际域名

export type MetaProps = {
  title: string;                  // 完整 <title>，已含站点后缀
  description: string;            // meta description，1-2 句话
  ogType?: 'website' | 'article'; // 默认 'website'
  ogImage?: string;               // 绝对 URL；不传则不输出 og:image
  canonicalPath: string;          // 相对路径，如 '/' 或 '/cities/kyoto'
};

function setOrCreateMeta(attr: 'name' | 'property', key: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', value);
}

function removeMeta(attr: 'name' | 'property', key: string) {
  const el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  el?.remove();
}

function setOrCreateLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export function Meta({
  title,
  description,
  ogType = 'website',
  ogImage,
  canonicalPath,
}: MetaProps) {
  useEffect(() => {
    document.title = title;

    setOrCreateMeta('name', 'description', description);

    // Open Graph
    setOrCreateMeta('property', 'og:title', title);
    setOrCreateMeta('property', 'og:description', description);
    setOrCreateMeta('property', 'og:type', ogType);
    setOrCreateMeta('property', 'og:url', SITE_URL + canonicalPath);
    setOrCreateMeta('property', 'og:site_name', '看见地球 · See Earth');
    setOrCreateMeta('property', 'og:locale', 'zh_CN');
    if (ogImage) {
      setOrCreateMeta('property', 'og:image', ogImage);
    } else {
      removeMeta('property', 'og:image');
    }

    // Twitter Card
    setOrCreateMeta('name', 'twitter:card', ogImage ? 'summary_large_image' : 'summary');
    setOrCreateMeta('name', 'twitter:title', title);
    setOrCreateMeta('name', 'twitter:description', description);
    if (ogImage) {
      setOrCreateMeta('name', 'twitter:image', ogImage);
    } else {
      removeMeta('name', 'twitter:image');
    }

    // canonical
    setOrCreateLink('canonical', SITE_URL + canonicalPath);
  }, [title, description, ogType, ogImage, canonicalPath]);

  return null;
}

export default Meta;
