# SEE EARTH · alpha-api · Phase 2 backend

> Next.js 14 App Router backend service for SEE EARTH V1.
> Source of truth: [`release-v1/api-contract/contract-decisions-v1.md`](../release-v1/api-contract/contract-decisions-v1.md)
> (Zod + OpenAPI 3.1 contract, LOCKED 2026-08-22)

## Status

🟡 **Phase 2 alpha** · Deployment target: Vercel `sethearth` project (CORRECTED 2026-08-25 · was previously `sethearth-2` which doesn't exist) · Branch: `phase2-alpha-api-init`

## Current scope (P0 · Day 3)

- [x] Next.js 14 App Router scaffold (`package.json` + `next.config.js` + `tsconfig.json`)
- [x] Sentry server init wired via `instrumentation.ts` (no-op without SENTRY_DSN)
- [x] `GET /api/health` — liveness check
- [ ] Vercel env vars: `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` / `DIRECT_URL` / `SENTRY_DSN` / `NODE_ENV`
- [ ] Supabase service-role client wrapper
- [ ] First API resource (e.g. `GET /api/cities` — public list)

## Stack

| Layer | Choice | Reference |
|---|---|---|
| Runtime | Next.js 14 App Router (Node.js) | `next.config.js` |
| Contract | Zod schemas → OpenAPI 3.1 | `release-v1/api-contract/zod-schemas/*` |
| Database | Supabase (Postgres + RLS) | `release-v1/api-contract/contract-decisions-v1.md` §4 |
| Monitoring | `@sentry/node` (mirror of client) | `api/_lib/sentry-server.ts` |
| Validation | Zod `.strict()` at route boundaries | contract §11 |

## Directory layout

```
api/
├── package.json               # Next.js + @sentry/node + zod + @supabase/supabase-js
├── next.config.js             # Headers (Cache-Control, X-Content-Type-Options)
├── tsconfig.json              # strict mode + path aliases
├── instrumentation.ts         # Sentry init on server startup
├── next-env.d.ts              # Next.js TypeScript reference (auto-generated)
├── README.md                  # This file
├── _lib/                      # Private/internal utilities (prefix "_" = not for routes)
│   └── sentry-server.ts       # Phase 1 prep: Sentry init + logServerError + withSentry
├── lib/                       # Public route utilities (future: supabase.ts, etc.)
└── app/                       # Next.js App Router
    ├── layout.tsx             # Minimal root layout
    ├── page.tsx               # Simple status page
    └── api/
        └── health/
            └── route.ts       # GET /api/health
```

## Vercel deployment notes

> ⚠️ **CORRECTED 2026-08-25**: `sethearth-2` project **does not exist** (user-verified via Vercel team overview).
> Both web frontend and API backend deploy on the same `sethearth` project, distinguished by branch.

**Project**: `sethearth` (single project · web + api share env vars)
**Branches**:
- `alpha` → Web frontend (Vite + React) — Phase 1
- `phase2-alpha-api-init` → API backend (Next.js) — Phase 2 (this scaffold)
**Build command**: `next build` (default)
**Output**: `.next` (default)

### Required env vars (configure on `sethearth` project — CORRECTED 2026-08-25, was `sethearth-2`)

| Name | Required | Example | Notes |
|---|---|---|---|
| `SUPABASE_URL` | ✅ | `https://pyabuenednjbwshfayaa.supabase.co` | Same value as Vite web (but no `VITE_` prefix) |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | `eyJhbGc...` | **NEVER expose to client**; service role bypasses RLS |
| `DIRECT_URL` | ✅ | `postgresql://postgres:...@db.pyabuenednjbwshfayaa.supabase.co:5432/postgres` | For pg_cron / migrations |
| `SENTRY_DSN` | optional | `https://4a3885...@o4511965043032064.ingest.us.sentry.io/4511965949394944` | Same DSN as web (no `VITE_` prefix); omit → no-op init |
| `NODE_ENV` | ✅ | `production` | Vercel sets this automatically; explicit for clarity |

⚠️ **DO NOT** add `VITE_*` prefixed env vars — those are for web frontend only.

⚠️ **DO NOT** reuse the env vars from the `sethearth` (web) project — they're scoped to that project only.
This was the root cause of the Sentry incident on 2026-08-25 (`VITE_SENTRY_DSN` was set on
a different Vercel project, but the build was actually deploying to `sethearth`). **CORRECTED 2026-08-25**: 
That "different project" (`sethearth-2`) **no longer exists** — there's only one `sethearth` project 
where both web and api branches deploy. Env vars are scoped to `sethearth` (single project).
Reference: `06-PM Agent 交接/2026-08-25-pm-takeover-postmortem.md` Iron Rule 2.

**📋 Complete step-by-step Vercel configuration guide** (with cross-verification checklist,
排错清单, 7 铁律遵守):`release-v1/alpha-environment/alpha-api-vercel-env-setup-v1.md`

## Local development

```bash
cd api
pnpm install   # or npm install
cp .env.example .env.local  # (create this file with required env vars)
pnpm dev
# → http://localhost:3000
# → http://localhost:3000/api/health
```

## Next steps (Day 3 → Week 1)

1. **User action**: Configure 5 env vars on Vercel `sethearth` project (CORRECTED 2026-08-25 · table above)
2. **Push to `alpha-api` branch**: This directory should be deployed via `alpha-api` branch
   (currently on `alpha` for development). See Day 3 plan in `06-PM Agent 交接/2026-08-25-phase1-to-phase2-handoff.md`.
3. **Verify**: `curl https://<alpha-api-url>/api/health` → expect 200 with `status: "ok"`
4. **Phase 2 Week 1**: Add Supabase client (`lib/supabase.ts`) + first API resource
   (`GET /api/cities` returning PublicCity[] from contract).

## References

- [`release-v1/api-contract/contract-decisions-v1.md`](../release-v1/api-contract/contract-decisions-v1.md) — 12 contract decisions LOCKED 2026-08-22
- [`release-v1/api-contract/openapi.yaml`](../release-v1/api-contract/openapi.yaml) — OpenAPI 3.1 machine-readable contract
- [`release-v1/api-contract/zod-schemas/`](../release-v1/api-contract/zod-schemas/) — Zod schema source of truth (6 resources)
- [`release-v1/api-contract/error-code-dict-v1.md`](../release-v1/api-contract/error-code-dict-v1.md) — Universal Error Envelope codes
- [`06-PM Agent 交接/2026-08-25-phase1-to-phase2-handoff.md`](../06-PM Agent 交接/2026-08-25-phase1-to-phase2-handoff.md) — Phase 1 → Phase 2 full handover
- [`06-PM Agent 交接/2026-08-25-pm-takeover-postmortem.md`](../06-PM Agent 交接/2026-08-25-pm-takeover-postmortem.md) — Sentry incident postmortem (Iron Rules)

---

**Maintainer**: Phase 2 PM Agent
**Created**: 2026-08-25 (Phase 2 Day 3, alpha-api initialization)