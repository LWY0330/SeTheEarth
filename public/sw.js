/* ============================================================
   看见地球 · v1.3 · PWA Service Worker (PR #14)
   - 0 依赖手写 SW
   - 缓存策略：
     * App shell (HTML/JS/CSS/manifest/icons)        → cache-first
     * 城市图片 (images.unsplash.com / pexels.com)   → stale-while-revalidate
     * 导航请求 (mode === 'navigate')               → network-first
     * 跨域其它                                     → 不拦截（透传 network）
   ============================================================ */

/* eslint-disable no-restricted-globals */

const CACHE_VERSION = 'v1.0.0';
const APP_SHELL_CACHE = `see-earth-shell-${CACHE_VERSION}`;
const IMAGES_CACHE = `see-earth-images-${CACHE_VERSION}`;

const APP_SHELL_URLS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icon-192.png',
  '/icon-512.png',
];

const IMAGE_HOSTS = new Set([
  'images.unsplash.com',
  'plus.unsplash.com',
  'images.pexels.com',
]);

/* ---------- 安装：预缓存 App Shell + skipWaiting ---------- */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(APP_SHELL_CACHE)
      .then((cache) => cache.addAll(APP_SHELL_URLS))
      .then(() => self.skipWaiting())
  );
});

/* ---------- 激活：清理旧版本缓存 + claim ---------- */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== APP_SHELL_CACHE && k !== IMAGES_CACHE)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

/* ---------- fetch：三种策略分发 ---------- */
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return; // 不拦截非 GET

  let url;
  try {
    url = new URL(req.url);
  } catch (_) {
    return; // 非 http(s) (e.g. data: blob:) 透传
  }

  // 1. 城市图片 → stale-while-revalidate
  if (IMAGE_HOSTS.has(url.hostname)) {
    event.respondWith(staleWhileRevalidate(req, IMAGES_CACHE));
    return;
  }

  // 2. 同源请求
  if (url.origin === self.location.origin) {
    if (req.mode === 'navigate') {
      event.respondWith(networkFirst(req, APP_SHELL_CACHE));
    } else {
      event.respondWith(cacheFirst(req, APP_SHELL_CACHE));
    }
    return;
  }

  // 3. 跨域其它：透传
});

/* ---------- 策略实现 ---------- */

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (e) {
    // 离线 + 无 cache：返回空 Response，保持 fetch 不抛
    return new Response('', { status: 504, statusText: 'Offline' });
  }
}

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (e) {
    // 离线 fallback 到 cache（navigation 通常 cache 里有 index.html）
    const cached = await caches.match(request);
    if (cached) return cached;
    const fallback = await caches.match('/index.html');
    if (fallback) return fallback;
    return new Response('Offline', { status: 503 });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response && response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached); // fetch 失败时 fallback 到 cached

  return cached || fetchPromise;
}
