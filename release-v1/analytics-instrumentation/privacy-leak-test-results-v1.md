# Privacy Leak Test · Phase 1 Results

**Generated**: 2026-08-22T09:28:19Z

**Tooling**: bash + node --experimental-strip-types

**Coverage**: 30 forbidden fields (F-01 ~ F-30) × 14 events (14 P0)

## Test results

| Test | Status |
|---|:---:|
| 1 · SDK validator unit tests (10 cases) | ✅ PASS |
| 2 · Synthetic 14-event batch | ✅ PASS |
| 3 · Static source-code scan           | ✅ PASS |
| 4 · Public image EXIF check (best-effort) | ✅ PASS |

## Coverage details

See `src/lib/analytics/validators.ts` for the canonical forbidden-field table.
See `07-设计师设计参考/release-v1/analytics-events/forbidden-fields-v1.md` for the design rationale.
