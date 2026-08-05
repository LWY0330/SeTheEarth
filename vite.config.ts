import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// See Earth — Vite config
// - dev server bound to 0.0.0.0 so external tools (curl/preview) can reach it
// - @ alias for clean imports from src/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
