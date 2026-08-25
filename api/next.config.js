// SEE EARTH V1 · Phase 2 · alpha-api Next.js config
// ----------------------------------------------------
// Scope:
//   - Next.js 14 App Router (Vercel Functions + Edge compatible)
//   - Sentry server init is triggered via instrumentation.ts (not next.config wrapper)
//   - No external image optimization yet (Vercel default)
//   - No experimental flags (keep config minimal)
//
// Reference:
//   - release-v1/api-contract/contract-decisions-v1.md §1 (Zod + OpenAPI stack)
//   - api/_lib/sentry-server.ts (Sentry init utility, Phase 1 prep)

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // SEE EARTH api/ lives next to web/ in same repo.
  // Vercel auto-detects api/ as a sub-project via the `alpha-api` branch deployment.
  // This config applies only when alpha-api branch is deployed to setheearth-2 project.

  // Avoid bundling test files / .test.ts into production
  webpack: (config, { isServer }) => {
    if (!isServer) return config;
    // No-op for now; placeholder for future server-only bundling tweaks
    return config;
  },

  // Headers for Universal Error Envelope (see contract-decisions-v1.md §6)
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, must-revalidate' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
    ];
  },

  // Logging Vercel deployment output
  logging: {
    fetches: { fullUrl: false },
  },
};

export default nextConfig;