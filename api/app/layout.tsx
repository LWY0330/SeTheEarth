// SEE EARTH V1 · Phase 2 · alpha-api · Root layout
// -------------------------------------------------
// Required by Next.js App Router convention.
// alpha-api is API-first (no UI) — this layout is minimal & should never render.

import type { ReactNode } from 'react';

export const metadata = {
  title: 'SEE EARTH · alpha-api',
  description: 'Phase 2 alpha-api backend (Next.js App Router)',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}