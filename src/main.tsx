/* Entry point — mounts <App />, applies global tokens & resets. */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';
import { initSentry } from './lib/analytics/sentry-client';
import './styles/globals.css';

// v1.1 · E-P0-10 Phase 1 · Sentry 客户端初始化（最小修改）
// - DSN 缺失时 initSentry 内部 no-op 并打 console 日志
// - production 环境 V1 暂不启用（V1.1 启用）
// - 总是调用,避免 Vite dead-code-elimination 把整个 Sentry 块消除

// TEMP DEBUG (round-5 PM handover) · 挂到 window 让 Console 100% 访问
// 完成后删除
const _viteDebug = {
  allViteKeys: Object.keys(import.meta.env).filter((k) => k.startsWith('VITE_')),
  VITE_SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
  VITE_ENV: import.meta.env.VITE_ENV,
  VITE_VERCEL_ENV: import.meta.env.VITE_VERCEL_ENV,
  VITE_VERCEL_TARGET_ENV: import.meta.env.VITE_VERCEL_TARGET_ENV,
};
// @ts-expect-error - debug window attach
window.__VITE_DEBUG__ = _viteDebug;
console.log(
  '[debug-env] 在 Console 输入 __VITE_DEBUG__ 查看完整 env 状态。关键字段：',
  JSON.stringify({
    dsn: _viteDebug.VITE_SENTRY_DSN,
    env: _viteDebug.VITE_ENV,
    vercelEnv: _viteDebug.VITE_VERCEL_ENV,
    vercelTarget: _viteDebug.VITE_VERCEL_TARGET_ENV,
  }),
);

initSentry();

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root container "#root" not found in index.html');
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>
);


// v1.3 · PR #14 · PWA Service Worker 注册（仅生产环境）
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => console.log('[PWA] SW registered, scope:', reg.scope))
      .catch((err) => console.error('[PWA] SW registration failed:', err));
  });
}
