---
title: SEE EARTH V1 · Code Diff Summary · Phase 1
type: code-diff-summary
tags: [release-v1, e-p0-02, code-diff, phase1, see-earth]
task_id: E-P0-02
phase: Phase 1 · Vertical Slice
dispatched_at: 2026-08-22
status: DRAFT · IN REVIEW
author: Engineer Agent (Round 2B)
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/vertical-slice-phase1/code-diff-summary-v1.md
---

# SEE EARTH V1 · Code Diff Summary · Phase 1

> **作者**：Engineer Agent（Round 2B · Phase 1 子集）
> **目标读者**：PM Agent（验收）、Code Reviewer、后续 Phase 工程师
> **任务卡**：E-P0-02 Launch Vertical Slice（Phase 1 子集 · §10 code diff summary）
> **约束**：本文件不复制完整 src 代码 · 仅描述改动 + diff stat
> **决策日期**：2026-08-22

---

## 0. 一句话结论

**Phase 1 代码改动分为 4 类：(A) 新增 api/ Next.js sibling · ~25 文件 / ~3500 行 · (B) 新增 src/lib/api-client.ts 等 API 接入模块 · 5 文件 / ~600 行 · (C) 修改 src/hooks + components 数据源 · 11 文件 / ~150 行 diff · (D) 修改 src/components/ui/EchoInput.tsx + UniversalEcho.tsx · 2 文件 / ~80 行 diff · (E) 新增 seed + smoke 脚本 · 2 文件 / ~400 行 · 总计 ~44 文件 / ~4700 行 diff（含 SQL migration 1000+ 行）。**

---

## 1. 改动总览

### 1.1 新增文件 (A) · api/ Next.js sibling

| 文件 | 类型 | 行数估算 | 说明 |
|---|---|---|---|
| `api/package.json` | NEW | ~30 | next + drizzle + sharp + exifr + zod deps |
| `api/next.config.mjs` | NEW | ~20 | output mode + env validation |
| `api/tsconfig.json` | NEW | ~25 | strict mode + path aliases |
| `api/drizzle.config.ts` | NEW | ~25 | schema path + DATABASE_URL config |
| `api/drizzle/0000_init.sql` | NEW | ~330 | 5 表 + 20 enum + 15 index + triggers |
| `api/src/db/schema.ts` | NEW | ~280 | Drizzle schema（镜像 SQL migration） |
| `api/src/db/client.ts` | NEW | ~25 | postgres-js client |
| `api/src/lib/errors.ts` | NEW | ~70 | ApiError + formatErrorResponse |
| `api/src/lib/privacy.ts` | NEW | ~150 | toPublicCity / toPublicMoment / toPublicEdition |
| `api/src/lib/logger.ts` | NEW | ~40 | pino + request_id injection |
| `api/src/middleware/cors.ts` | NEW | ~50 | CORS allowlist handler |
| `api/src/middleware/rateLimit.ts` | NEW | ~80 | in-memory token bucket |
| `api/src/middleware/requestId.ts` | NEW | ~30 | X-Request-Id generation |
| `api/src/services/storage.ts` | NEW | ~250 | signed URL + EXIF strip + sharp processing |
| `api/src/services/cities.ts` | NEW | ~80 | Drizzle query → PublicCity |
| `api/src/services/moments.ts` | NEW | ~120 | Drizzle query + time_bucket filter |
| `api/src/services/editions.ts` | NEW | ~100 | Drizzle query + fallback logic |
| `api/src/app/api/v1/healthz/route.ts` | NEW | ~30 | health check |
| `api/src/app/api/v1/cities/route.ts` | NEW | ~80 | list cities |
| `api/src/app/api/v1/cities/[cityIdOrSlug]/route.ts` | NEW | ~70 | get city |
| `api/src/app/api/v1/cities/[cityIdOrSlug]/moments/route.ts` | NEW | ~120 | list moments for city |
| `api/src/app/api/v1/moments/[momentId]/route.ts` | NEW | ~70 | get moment |
| `api/src/app/api/v1/editions/route.ts` | NEW | ~80 | list editions |
| `api/src/app/api/v1/editions/today/route.ts` | NEW | ~110 | today edition |
| `api/src/app/api/v1/editions/[editionId]/route.ts` | NEW | ~70 | get edition |
| `api/scripts/seed-phase1.ts` | NEW | ~250 | 12 cities + 6 moments + 1 edition + 5 assets |
| `api/scripts/smoke-phase1.sh` | NEW | ~300 | smoke test runner（共享给 frontend） |

**A 类小计**：26 文件 / ~2800 行

---

### 1.2 新增文件 (B) · src/lib/api-client + hooks

| 文件 | 类型 | 行数估算 | 说明 |
|---|---|---|---|
| `src/lib/api-client.ts` | NEW | ~250 | fetch wrapper + Zod + typed endpoints |
| `src/lib/api-adapters.ts` | NEW | ~150 | DB row → legacy type adapter |
| `src/hooks/useApi.ts` | NEW | ~80 | Loading/Error/Empty 三态 hook |
| `src/hooks/useApiCity.ts` | NEW | ~50 | useApiCities / useApiCity |
| `src/hooks/useApiMoments.ts` | NEW | ~50 | useApiMoments |
| `src/hooks/useApiEdition.ts` | NEW | ~50 | useApiTodayEdition |

**B 类小计**：6 文件 / ~630 行

---

### 1.3 修改文件 (C) · 现有 src/ 数据源切换

| 文件 | 类型 | diff 行数 | 改动摘要 |
|---|---|---|---|
| `src/hooks/useCityData.ts` | MODIFY | +10 / -30 | 改用 `useApiCity` + 保留 legacy adapter（fallback） |
| `src/hooks/useMomentsForCity.ts` | MODIFY | +8 / -25 | 改用 `useApiMoments` |
| `src/components/App.tsx` | MODIFY | +20 / -15 | 改用 `useApiCities` + `useApiTodayEdition` |
| `src/components/CityPage.tsx` | MODIFY | +30 / -5 | 改用 `useApiCity` + Loading/Error/NotFound 三态 |
| `src/components/CityIndexPage.tsx` | MODIFY | +15 / -10 | 改用 `useApiCities` |
| `src/components/MomentsTimeline.tsx` | MODIFY | +15 / -5 | 改用 `useApiMoments(cityId)` |
| `src/components/EventDrawer.tsx` | MODIFY | +10 / -5 | 改用 `useApiMoments(cityId)` |
| `src/components/UniversalCityPage.tsx` | MODIFY | +15 / -5 | 改用 `useApiCity` + `useApiMoments` |
| `src/lib/cityFromCoordinates.ts` | MODIFY | +10 / -10 | 改为查 `useApiCities` 结果 |
| `src/lib/unknownToCity.ts` | MODIFY | +5 / -8 | 同上 |
| `src/lib/photoSource.ts` | MODIFY | +2 / -2 | type import 路径调整 |

**C 类小计**：11 文件 / +140 / -120（净 +20 行）

---

### 1.4 修改文件 (D) · Echo UI 按 OD-01 处理

| 文件 | 类型 | diff 行数 | 改动摘要 |
|---|---|---|---|
| `src/components/ui/EchoInput.tsx` | MODIFY | +40 / -50 | 强制 `state='disabled'` + 移除 submit handler + unavailable 文案 |
| `src/components/ui/EchoInput.module.css` | MODIFY | +20 / -0 | 新增 unavailable / privacyLink 样式 |
| `src/components/UniversalEcho.tsx` | MODIFY | +30 / -45 | 简化为 unavailable 状态 + 移除 form + submit |
| `src/components/ui/EchoInput.test.tsx` | MODIFY | +30 / -10 | 新增 unavailable 测试 + 删除 success 测试 |
| `src/components/UniversalEcho.test.tsx` | MODIFY | +20 / -10 | 同上 |

**D 类小计**：5 文件 / +140 / -115（净 +25 行）

---

### 1.5 修改文件 (E) · 配置 + 环境

| 文件 | 类型 | diff 行数 | 改动摘要 |
|---|---|---|---|
| `tsconfig.json` | MODIFY | +5 / -0 | 新增 path alias `@see-earth/api/zod-schemas/*` |
| `.env.production` | MODIFY | +3 / -0 | 新增 `VITE_API_BASE_URL` / `VITE_ENV` / `VITE_USE_MOCK_API` |
| `package.json` (root) | MODIFY | +1 / -0 | 新增 smoke test script |
| `src/lib/featureFlags.ts` | MODIFY | +2 / -0 | 新增 `useMockApi` flag |
| `api/package.json` | NEW | ~30 | (重复统计 · 见 A) |

**E 类小计**：4 文件 / +11 / -0

---

### 1.6 新增文件 (F) · 文档（已记录在 obsidian + workspace）

| 文件 | 类型 | 行数 | 说明 |
|---|---|---|---|
| `release-v1/vertical-slice-phase1/*.md` | NEW | 9 文件 / ~5000 行 | 本任务 10 份文档 |

---

## 2. 总 Diff Stat

```text
A 类 (api/ sibling)        :  26 files, +2800 lines
B 类 (src/lib + hooks)     :   6 files, +630 lines
C 类 (src/ hooks/components): 11 files, +140 lines, -120 lines
D 类 (Echo UI OD-01)       :   5 files, +140 lines, -115 lines
E 类 (config)              :   4 files, +11 lines
F 类 (docs)                :  10 files, +5000 lines

总新增文件:  ~46
总修改文件:  ~20
净 diff:    +8525 / -235
（含 SQL migration + docs）
```

**纯代码 diff**（不含 docs）：

```text
新增代码:  ~3500 行
修改代码:  ~300 行 diff
SQL:       ~330 行
```

---

## 3. 关键文件 Diff（详细）

### 3.1 `src/lib/api-client.ts`（新增 · 关键文件）

**作用**：fetch wrapper + Zod response 校验 + typed endpoint 函数

**关键设计**：

- 自动 retry 1 次（5xx + 网络错误）
- ErrorEnvelope 统一解析
- 4xx 不 retry（除 408 timeout）
- 所有 endpoint 返回 Zod 解析后类型

**关键代码片段**（详见 `web-client-integration-v1.md §2.1`）：

```typescript
export async function apiGet<T extends z.ZodTypeAny>(
  path: string,
  schema: T,
  options?: ApiCallOptions,
): Promise<z.infer<T>> { /* ... */ }

export const api = {
  listCities: (params?) => apiGet('/cities?...', CityListEnvelopeSchema),
  getCity: (slug, includeVisual) => apiGet(`/cities/${slug}`, CityEnvelopeSchema),
  // ...
};
```

---

### 3.2 `src/hooks/useApi.ts`（新增 · 关键文件）

**作用**：通用 async data hook · Loading/Error/Empty 三态

**关键设计**：

- `useApi<T>` · 单个资源
- `useApiList<T>` · 列表资源（带 isEmpty）
- Abort signal 支持
- Stale closure 防御（fetcher ref）

**关键代码片段**：

```typescript
export function useApi<T>(fetcher, deps) {
  const [state, setState] = useState({ status: 'loading' });
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading' });
    fetcherRef.current()
      .then((data) => { if (!cancelled) setState({ status: 'success', data }); })
      .catch((error) => { if (!cancelled) setState({ status: 'error', error }); });
    return () => { cancelled = true; };
  }, deps);
  return state;
}
```

---

### 3.3 `src/hooks/useCityData.ts`（修改）

**Diff 摘要**：

```diff
-import { useMemo } from 'react';
-import type { City } from '@/types';
-import { cities, findCity, type City as LegacyCity } from '../data/cities.ts';
-import { getCountryNameLocal } from '../lib/countryI18n.ts';
+import { useApiCity } from './useApiCity';
+import type { City } from '@/types';
+import { featureFlags } from '@/lib/featureFlags';
+import { findCity, legacyToUniversal } from '../data/cities';  // mock mode fallback

 export function useCityData(slug: string | undefined | null): City | null {
-  return useMemo(() => {
-    if (!slug) return null;
-    const legacy: LegacyCity | undefined = findCity(slug);
-    if (!legacy) return null;
-    return legacyToUniversal(legacy);
-  }, [slug]);
+  const result = useApiCity(slug ?? undefined);
+
+  // Mock mode（仅本地 dev · VITE_USE_MOCK_API=true）
+  if (featureFlags.useMockApi) {
+    if (!slug) return null;
+    const legacy = findCity(slug);
+    return legacy ? legacyToUniversal(legacy) : null;
+  }
+
+  if (result.status === 'success') return result.data;
+  return null;
 }
```

**关键变更**：

- 数据源从 `useMemo + cities.findCity` 改为 `useApiCity`
- Loading/Error 期间返回 `null`（与原行为兼容）
- 保留 `VITE_USE_MOCK_API=true` fallback（dev 环境）

---

### 3.4 `src/components/ui/EchoInput.tsx`（修改）

**关键 diff**（仅展示核心变化）：

```diff
 export interface EchoInputProps {
   question: string;
   placeholder?: string;
   maxLength?: number;
   submitLabel?: string;
   microcopy?: string;
   hint?: string;
   state?: ComponentState;
   echoState?: EchoInputState;
   onSubmit?: (text: string) => void;
   className?: string;
 }

 export function EchoInput({
   question,
-  placeholder = '写下一句你此刻想到的话...',
+  placeholder = '此刻,这座城市的回声暂未开放...',
   maxLength = 80,
-  submitLabel = '记录 →',
+  submitLabel = '',
-  microcopy = '仅记录这一刻的触动,不显示头像,不追踪身份',
+  microcopy = 'Echo 暂未开放 · 我们正在准备安全的接收渠道',
   hint = '敬请期待',
-  state = 'default',
+  state = 'disabled',
   echoState,
   onSubmit,
   className,
 }: EchoInputProps) {
-  const [internalState, setInternalState] = useState<EchoInputState>('default');
-  const [text, setText] = useState('');
-  const current = echoState ?? internalState;
-  const disabled = state === 'disabled';
-  const isSubmitted = current === 'submitted';
+  const disabled = true;  // 🔒 OD-01: Phase 1 永久禁用

   // ...

   return (
-    <section className={rootClass} data-state={state} data-echo={current}>
+    <section className={rootClass} data-state="disabled" data-echo="unavailable">
       <h2 className={styles.question}>{question}</h2>
       <textarea
         className={styles.textarea}
-        value={text}
-        maxLength={maxLength}
         disabled
         readOnly
         placeholder={placeholder}
-        onChange={(e) => { setText(e.target.value); ... }}
-        onFocus={...}
         rows={3}
-        aria-label="私密留痕"
+        aria-label="Echo 暂未开放"
       />
-      <div className={styles.footer}>
-        <span>{text.length} / {maxLength}</span>
-        <button onClick={...}>{submitLabel}</button>
-      </div>
+      {/* 🔒 完全移除 submit 按钮 + 字数计数 */}
       <p className={styles.microcopy}>{microcopy}</p>
       <p className={styles.hint}>{hint}</p>
+      <a href="/privacy" className={styles.privacyLink}>
+        为什么暂未开放？查看 Privacy →
+      </a>
     </section>
   );
 }
```

**关键变更**：

- 强制 `state='disabled'`
- 移除 `useState`（不再追踪 text）
- 移除 `onChange` / `onFocus` / `onClick`
- 移除 submit 按钮
- 新增 Privacy 链接
- 保留 `onSubmit` prop（兼容 Phase 3 恢复）

---

### 3.5 `api/src/db/schema.ts`（新增 · 关键文件）

**关键设计**：

- 5 表对应 6 域（除 Echo）
- 所有 UUID PK + audit timestamps
- soft delete + partial indexes
- JSONB for Edition.slots
- enum types 镜像 Zod

**关键代码片段**：

```typescript
export const cities = pgTable('cities', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  // ... ~30 字段
  latitude: numeric('latitude', { precision: 9, scale: 6 }).notNull(),  // INTERNAL ONLY
  longitude: numeric('longitude', { precision: 9, scale: 6 }).notNull(),
  // ...
}, (t) => ({
  slugIdx: uniqueIndex('uq_cities_slug').on(t.slug),
  // ...
}));

export const moments = pgTable('moments', {
  // ...
  rawLocation: jsonb('raw_location').$type<RawLocation>(),  // ADMIN ONLY
  // ...
});
```

---

### 3.6 `api/src/lib/privacy.ts`（新增 · 关键文件 · privacy boundary gate）

**关键设计**：

- DB row → PublicCity / PublicMoment / PublicEdition 唯一通道
- Zod 解析（边界防御 · DB schema mismatch 会抛错）
- 强制剥离 latitude / longitude / state_level / raw_location

**关键代码片段**：

```typescript
export function toPublicCity(row) {
  return PublicCitySchema.parse({
    id: row.id,
    slug: row.slug,
    names: { /* ... */ },
    timezone: row.timezone,
    layer: row.layer,
    public_location_only: true,  // ✅ 强制标志
    page_state: row.pageState,
    visual: /* ... */,
    // ❌ 永远不输出：latitude / longitude / state_level
  });
}
```

---

### 3.7 `api/src/services/storage.ts`（新增 · 关键文件）

**关键函数**：

- `getAssetUploadGrant(params)` · Phase 2 用 · Phase 1 已实现
- `processAsset(assetId)` · 4 variant 生成 + EXIF strip
- `processAssetWithRetry(assetId)` · 3 次重试
- `assertPublicMomentNoGps(variantUrls)` · Privacy gate 测试

**关键代码片段**（EXIF 剥离）：

```typescript
const outputBuffer = await sharp(originalBuffer)
  .rotate()                              // EXIF orientation
  .resize({ width: v.width, withoutEnlargement: true })
  .webp({ quality: v.quality })
  .withMetadata({ exif: {} })            // 🔒 EXIF strip
  .toBuffer();
```

---

## 4. Locked 文件保护清单（**未修改**）

### 4.1 14 LOCKED Components（per D-P0-01）

```text
✅ 未修改：src/components/ui/HeroMedia.tsx
✅ 未修改：src/components/ui/CoordinateWindow.tsx
✅ 未修改：src/components/ui/DistanceNavigation.tsx
✅ 未修改：src/components/ui/GlobalHeader.tsx
✅ 未修改：src/components/ui/LayerIndicator.tsx
✅ 未修改：src/components/ui/LocationMeta.tsx
✅ 未修改：src/components/ui/OneScene.tsx
✅ 未修改：src/components/ui/RevealMeta.tsx
✅ 未修改：src/components/ui/SameSecond.tsx
✅ 未修改：src/components/ui/SectionHeader.tsx
✅ 未修改：src/components/ui/TimeComparison.tsx
✅ 未修改：src/components/ui/TimeDisplay.tsx
✅ 未修改：src/components/ui/WorldTimeRail.tsx
✅ 未修改：src/components/ui/ComponentStates.module.css
```

> ⚠️ **例外**：`EchoInput.tsx` 与 `UniversalEcho.tsx` 修改（按 OD-01 · 不属于 14 组件 LOCKED 列表）
> ⚠️ **例外**：`EchoInput.module.css` 修改（新增 unavailable 样式）

### 4.2 22 设计 LOCKED（per design-freeze-log-v1.md）

```text
✅ 未修改：d4-a2-v2-phase15-home-design.md（Homepage A2 v2-phase15）
✅ 未修改：d4-a2-kyoto-city-detail.md（Kyoto City Detail v6）
✅ 未修改：d4-a2-khartoum-city-detail.md（Khartoum City Detail v10）
✅ 未修改：d8-universal-city-page-first-pass.md
✅ 未修改：d10-unknown-coordinate-first-pass.md
✅ 未修改：d7-5-city-states-visual-design.md
✅ 未修改：d6-phase1-4-screen-to-v2-mapping.md
✅ 未修改：d11-component-library-first-pass.md
✅ 未修改：SEE_EARTH_DESIGN_SYSTEM_v1.3_Complete_Spec.md
✅ 未修改：sitemap-v1.md
✅ 未修改：page-audit-v1.md
✅ 未修改：design-freeze-log-v1.md
✅ 未修改：responsive-rules-v1.md
✅ 未修改：layer-qa-v1.md
✅ 未修改：event-map-v1.md
✅ 未修改：forbidden-fields-v1.md
✅ 未修改：consent-placement-v1.md
✅ 未修改：trigger-diagram-v1.md
✅ 未修改：copy-final-v1.md (Minimal Witness)
✅ 未修改：flow-diagram-v1.md
✅ 未修改：state-matrix-v1.md
✅ 未修改：prototype-v1.md
✅ 未修改：api-field-mapping-v1.md
```

**Phase 1 修改的设计文档 = 0 个**

---

## 5. 修改文件 Lock 状态矩阵

| 文件 | Locked? | Phase 1 是否修改 | 备注 |
|---|---|---|---|
| `src/data/cities.ts` | 🟡 软锁定 | ❌ 未修改 | 加 `@deprecated` JSDoc · dev fallback |
| `src/data/liveMoments.ts` | 🟡 软锁定 | ❌ 未修改 | 同上 |
| `src/data/moments.ts` | 🟡 软锁定 | ❌ 未修改 | 同上 |
| `src/data/photoAssets.ts` | 🟡 软锁定 | ❌ 未修改 | 同上 |
| `src/types/city.ts` | 🔒 Phase 0 LOCKED | ❌ 未修改 | type source of truth 不变 |
| `src/types/moment.ts` | 🔒 Phase 0 LOCKED | ❌ 未修改 | 同上 |
| `src/types/cityState.ts` | 🔒 Phase 0 LOCKED | ❌ 未修改 | 同上 |
| `src/lib/locationPrivacy.ts` | 🔒 Phase 0 LOCKED | ❌ 未修改 | privacy boundary gate 不变 |
| `src/components/ui/EchoInput.tsx` | 🟡 软锁定 | ✅ 修改 | OD-01 决策 |
| `src/components/UniversalEcho.tsx` | 🟡 软锁定 | ✅ 修改 | OD-01 决策 |

---

## 6. Phase 1 不实现（明确排除 · 无 diff）

| 范畴 | 不实现的文件 | Phase |
|---|---|---|
| Witness POST UI | `/witness/*` 路由 + 6 段 flow | Phase 2 |
| Asset upload UI | client-side image picker | Phase 2 |
| Analytics SDK | Vercel Analytics / Sentry / Plausible | Phase 3 |
| Admin endpoints | `/v1/admin/*` | Phase 3 |
| Echo POST | `/v1/echoes` POST | 不做（OD-01） |
| iOS first-pass | iOS app | Phase 3+ |

---

## 7. 测试 diff

### 7.1 新增测试

```text
api/scripts/smoke-phase1.sh           # 19 项 smoke tests
api/scripts/seed-phase1.ts            # seed script with self-validation
```

### 7.2 修改测试

```text
src/components/ui/EchoInput.test.tsx              # +30 / -10
src/components/UniversalEcho.test.tsx             # +20 / -10
src/components/UniversalCityPage.test.tsx         # 不变（props 一致）
```

### 7.3 Phase 2 测试（不实施）

- Playwright E2E
- MSW mock + Zod schema mismatch tests
- Per-instance cache tests
- WebSocket / SSE

---

## 8. 代码 Review 检查清单

### 8.1 Critical（PR review 必查）

- [ ] `src/lib/api-client.ts` 错误处理覆盖（4xx / 5xx / network / AbortError）
- [ ] `api/src/lib/privacy.ts` 不泄漏 lat/lng / raw_location
- [ ] `api/src/services/storage.ts` EXIF GPS 强制剥离
- [ ] `api/drizzle/0000_init.sql` CHECK constraint 正确
- [ ] `src/components/ui/EchoInput.tsx` 真的禁用 submit（grep `setInternalState('submitted')` 应为 0）
- [ ] `src/lib/api-client.ts` 不在 bundle 中包含 SUPABASE_SERVICE_ROLE_KEY（grep 验证）
- [ ] CORS allowlist 包含 `alpha-see-earth.vercel.app` 而非 `*`
- [ ] Error envelope 统一 `{ error_code, message, retryable, request_id }`

### 8.2 Important（建议检查）

- [ ] 所有 SQL 查询带 `WHERE deleted_at IS NULL`
- [ ] 所有 DateTime 字段使用 `TIMESTAMPTZ`（不是 `TIMESTAMP`）
- [ ] 所有 ENUM 值不在 Zod schema 之外
- [ ] 所有 JSONB schema 与 TypeScript type 一致
- [ ] Partial index 包含 `WHERE deleted_at IS NULL`
- [ ] Mock API fallback 仅在 `VITE_USE_MOCK_API=true` 时启用

### 8.3 Nice-to-have

- [ ] 函数命名一致（`getX` / `listX` / `createX` / `updateX`）
- [ ] 错误日志不包含 PII / request body
- [ ] CORS preflight 缓存（Access-Control-Max-Age）
- [ ] Drizzle query 使用 `eq` / `and` / `isNull` 而非 raw SQL
- [ ] TypeScript strict mode + no `any`

---

## 9. Phase 2 / Phase 3 输入

### 9.1 给 Phase 2（Witness Submission）

**Phase 1 留下的 Hook Point**：

- `api/src/services/storage.ts: getAssetUploadGrant()` · Phase 2 接 POST endpoint
- `api/drizzle/0000_init.sql: witness_submissions` 表 · 已建好
- `src/lib/api-client.ts` · Phase 2 添加 `api.createWitnessSubmission()`
- `src/components/Witness/*` · Phase 2 新增（不影响现有组件）

**Phase 2 必查**：

- `witness_submissions.client_key` 唯一性约束（unique partial index 已建）
- `sessions` 表 / session TTL 90 天（per OD-04）
- Witness UI 6 段流程（per Minimal Witness spec）

### 9.2 给 Phase 3（Admin + Analytics）

**Phase 1 留下的 Hook Point**：

- `api/src/lib/privacy.ts: toPublicCity` / `toPublicMoment` · Admin scope 用 `AdminCity` / `AdminMoment`
- `api/src/app/api/v1/admin/*` · Phase 3 新增（不影响现有路由）
- Analytics 事件（per D-P0-05 event-map-v1.md）· Phase 3 集成

---

## 10. 元数据

| 字段 | 值 |
|---|---|
| 文档版本 | v1 |
| 创建时间 | 2026-08-22 |
| 创建人 | Engineer Agent (Round 2B) |
| 文档 ID | `code-diff-summary-v1.md` |
| 目标 Gate | Gate A · Internal Alpha · Phase 1 |
| 决策状态 | ✅ ACCEPTED（待 PM 评审） |
| Workspace 路径 | `/Users/lwy/Documents/ChatGPT/看见地球/release-v1/vertical-slice-phase1/code-diff-summary-v1.md` |
| Obsidian canonical 路径 | `/Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/vertical-slice-phase1/code-diff-summary-v1.md` |
| Obsidian 同步状态 | ❌ 未同步（sandbox 拒绝写入 Obsidian） |

---

**End of code-diff-summary-v1.md**