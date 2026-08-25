/* Entry point — mounts <App />, applies global tokens & resets. */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';
import { initSentry } from './lib/analytics/sentry-client';
import './styles/globals.css';

// v1.1 · E-P0-10 Phase 1 · Sentry 客户端初始化（最小修改 · 1 行）
// - DSN 缺失时 no-op
// - production 环境 V1 暂不启用（V1.1 启用）
if (import.meta.env.VITE_SENTRY_DSN) {
  initSentry();
}

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
