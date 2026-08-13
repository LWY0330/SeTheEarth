/* Entry point — mounts <App />, applies global tokens & resets. */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';
import './styles/globals.css';

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
