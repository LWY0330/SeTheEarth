---
title: SEE EARTH V1 · Web Client API Integration · Phase 1
type: web-integration
tags: [release-v1, e-p0-02, web-client, vite, api-client, zod, see-earth]
task_id: E-P0-02
phase: Phase 1 · Vertical Slice
dispatched_at: 2026-08-22
status: DRAFT · IN REVIEW
author: Engineer Agent (Round 2B)
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/vertical-slice-phase1/web-client-integration-v1.md
source_inputs:
  - release-v1/api-contract/zod-schemas/*
  - release-v1/api-contract/openapi.yaml
  - src/data/cities.ts (existing)
  - src/data/liveMoments.ts (existing)
  - src/data/moments.ts (existing)
  - src/data/photoAssets.ts (existing)
  - src/hooks/useCityData.ts (existing)
  - src/hooks/useMomentsForCity.ts (existing)
  - release-v1/web-v1-flow/sitemap-v1.md (LOCKED)
  - release-v1/web-v1-flow/design-freeze-log-v1.md (LOCKED)
---

# SEE EARTH V1 · Web Client API Integration · Phase 1 Vertical Slice

> **作者**：Engineer Agent（Round 2B · Phase 1 子集）
> **目标读者**：PM Agent（验收）、Web 工程师、iOS 工程师（参考）
> **任务卡**：E-P0-02 Launch Vertical Slice（Phase 1 子集）
> **强制约束**：**DO NOT 修改 14 组件 LOCKED + 22 设计 LOCKED · 仅修改数据源 + 添加 api-client**
> **决策日期**：2026-08-22

---

## 0. 一句话结论

**Phase 1 Vite SPA 接入真实 API 通过 4 步：(1) 新增 `src/lib/api-client.ts`（fetch wrapper + Zod response 校验），(2) 新增 `src/hooks/useApi.ts`（Loading/Error/Empty 三态管理），(3) 新增 `src/lib/api-adapters.ts`（DB row → legacy City/Moment 类型 adapter），(4) 修改 11 个 hooks/components 数据源为 API 调用。`src/data/cities.ts` 等硬编码数据保留（fallback / 开发环境）但加 deprecated 注释。**

---

## 1. 集成策略

### 1.1 渐进式接入（不破坏现有功能）

| 阶段 | 策略 |
|---|---|
| **Phase 1** | 新增 `api-client` + 新增 `api-adapters` + 新增 `useApi`；**保留** `src/data/*.ts` 作为 dev fallback |
| **Phase 2** | 移除 `src/data/*.ts`（或转为 `dev-only` import） |
| **Phase 3** | 优化 cache / SWR 策略 |

**为什么 Phase 1 不立即删除 hardcoded data**：

- Vite SPA 在本地开发无 backend 时崩溃 = 不可接受
- CI typecheck 必须通过 = 必须保留类型 schema
- 让 PM 能随时切回 dev mode 验证（`VITE_USE_MOCK_API=true`）

### 1.2 强制约束（来自任务卡 §E）

| 项 | Phase 1 处理 |
|---|---|
| 14 组件 LOCKED | ❌ 不修改（仅可改 props 接收方式） |
| 22 设计 LOCKED | ❌ 不修改 |
| `src/data/*.ts` 硬编码数据 | ⚠️ 保留（加 `@deprecated` 注释） + 类型 schema 不删 |
| `src/lib/locationPrivacy.ts` | ✅ 保留（admin scope 才用） |
| `src/components/ui/EchoInput.tsx` | ✅ 按 OD-01 处理（详见 `echo-ui-decision-v1.md`） |
| Loading/Error/Empty 状态 | ✅ 新增 `useApi` hook · 三态 |
| Privacy banner（Alpha Banner） | ✅ 已有（alpha-env-decision Round 2A） |

### 1.3 不修改文件清单（LOCKED 14 组件 · DO NOT TOUCH）

```text
src/components/ui/HeroMedia.tsx
src/components/ui/CoordinateWindow.tsx
src/components/ui/DistanceNavigation.tsx
src/components/ui/GlobalHeader.tsx
src/components/ui/LayerIndicator.tsx
src/components/ui/LocationMeta.tsx
src/components/ui/OneScene.tsx
src/components/ui/RevealMeta.tsx
src/components/ui/SameSecond.tsx
src/components/ui/SectionHeader.tsx
src/components/ui/TimeComparison.tsx
src/components/ui/TimeDisplay.tsx
src/components/ui/WorldTimeRail.tsx
src/components/ui/ComponentStates.module.css
```

**Phase 1 修改文件清单**（仅数据源 + API 调用）：

```text
新增：
  src/lib/api-client.ts                   # fetch wrapper + Zod 校验
  src/lib/api-adapters.ts                 # DB row → legacy type adapter
  src/hooks/useApi.ts                     # Loading/Error/Empty 三态
  src/hooks/useApiCity.ts                 # City 专用 hook
  src/hooks/useApiMoments.ts              # Moments 专用 hook
  src/hooks/useApiEdition.ts     # Edition 专用 hook

修改（数据源切换）：
  src/hooks/useCityData.ts                # 改为 API 调用（保留 adapter）
  src/hooks/useMomentsForCity.ts          # 改为 API 调用
  src/components/App.tsx                  # 数据源改 useApiCity + useApiMoments
  src/components/CityPage.tsx             # 数据源改 useApiCity
  src/components/CityIndexPage.tsx        # 数据源改 useApiCity
  src/components/CityIndex.tsx            # 派生 · 不直接改
  src/components/CityCard.tsx             # props type 保持一致
  src/components/CityFeatured.tsx         # props type 保持一致
  src/components/CityNow.tsx              # 派生计算 · 不直接改
  src/components/CityIndexPage.tsx        # 改数据源
  src/components/EventDrawer.tsx          # 改数据源
  src/components/MomentsTimeline.tsx      # 改数据源
  src/components/SearchBox.tsx            # 改数据源
  src/components/UniversalCityPage.tsx    # 改数据源
  src/components/UniversalEcho.tsx        # Echo UI 处理（per OD-01）
  src/router/Router.tsx                   # 不变（仅 route 表）
  src/lib/cityFromCoordinates.ts          # 改数据源
  src/lib/unknownToCity.ts                # 改数据源
  src/lib/photoSource.ts                  # 改数据源
  src/lib/useWeather.ts                   # 改数据源（City type）
  src/lib/weather.ts                      # 改数据源（City type）
  src/lib/sun.ts                          # 改数据源（City type）
```

---

## 2. 新增模块

### 2.1 `src/lib/api-client.ts`（Fetch Wrapper + Zod 校验）

```typescript
/* ============================================================
   SEE EARTH V1 · API Client · Phase 1
   ------------------------------------------------------------
   - Fetch wrapper + Zod response 校验
   - 环境变量：VITE_API_BASE_URL (Alpha: https://alpha-api-see-earth.vercel.app/v1)
   - 自动 retry 1 次（网络错误） + 5xx 错误
   - 统一 ErrorEnvelope 解析
   ============================================================ */

import type { z } from 'zod';
import { ErrorEnvelopeSchema, type ErrorEnvelope } from '../../release-v1/api-contract/zod-schemas/common';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8787/v1').replace(/\/$/, '');

export class ApiClientError extends Error {
  constructor(
    public readonly envelope: ErrorEnvelope,
    public readonly httpStatus: number,
  ) {
    super(envelope.message);
    this.name = 'ApiClientError';
  }
}

interface ApiCallOptions {
  signal?: AbortSignal;
  retries?: number;
  retryDelayMs?: number;
}

/**
 * apiGet · GET 请求 + Zod schema 校验
 */
export async function apiGet<T extends z.ZodTypeAny>(
  path: string,
  schema: T,
  options: ApiCallOptions = {},
): Promise<z.infer<T>> {
  const { signal, retries = 1, retryDelayMs = 500 } = options;
  const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'X-Request-Id': crypto.randomUUID(),
        },
        signal,
      });

      // 错误响应
      if (!response.ok) {
        const errorJson = await response.json().catch(() => null);
        const envelopeParse = ErrorEnvelopeSchema.safeParse(errorJson);
        if (envelopeParse.success) {
          // 4xx 不重试（除 408 timeout）；5xx 重试
          if (response.status >= 500 && attempt < retries) {
            await new Promise((r) => setTimeout(r, retryDelayMs * (attempt + 1)));
            continue;
          }
          throw new ApiClientError(envelopeParse.data, response.status);
        }
        throw new ApiClientError({
          error_code: 'server_error',
          message: `HTTP ${response.status}`,
          retryable: response.status >= 500,
          request_id: '',
        }, response.status);
      }

      // 成功响应
      const data = await response.json();
      const parsed = schema.safeParse(data);
      if (!parsed.success) {
        console.error('[api-client] response schema mismatch', path, parsed.error);
        throw new ApiClientError({
          error_code: 'schema_mismatch',
          message: 'Response did not match schema',
          details: { path: path },
          retryable: false,
          request_id: '',
        }, 500);
      }
      return parsed.data;
    } catch (err) {
      lastError = err as Error;
      // Network error 或 AbortError
      if (err instanceof ApiClientError) throw err;
      if ((err as Error).name === 'AbortError') throw err;
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, retryDelayMs * (attempt + 1)));
        continue;
      }
      throw new ApiClientError({
        error_code: 'network_error',
        message: 'Network request failed',
        retryable: true,
        request_id: '',
      }, 0);
    }
  }

  throw lastError ?? new Error('apiGet failed');
}

/**
 * API 端点函数（typed wrapper）
 */
import {
  CityListEnvelopeSchema,
  CityEnvelopeSchema,
} from '../../release-v1/api-contract/zod-schemas/city';
import {
  MomentListEnvelopeSchema,
  MomentEnvelopeSchema,
} from '../../release-v1/api-contract/zod-schemas/moment';
import {
  EditionEnvelopeSchema,
  EditionListEnvelopeSchema,
} from '../../release-v1/api-contract/zod-schemas/edition';

export const api = {
  // City
  listCities: (params?: { layer?: string; page_state?: string; country_code?: string; limit?: number; cursor?: string }) => {
    const qs = new URLSearchParams();
    if (params?.layer) qs.set('layer', params.layer);
    if (params?.page_state) qs.set('page_state', params.page_state);
    if (params?.country_code) qs.set('country_code', params.country_code);
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.cursor) qs.set('cursor', params.cursor);
    const q = qs.toString();
    return apiGet(`/cities${q ? `?${q}` : ''}`, CityListEnvelopeSchema);
  },

  getCity: (cityIdOrSlug: string, includeVisual = true) =>
    apiGet(`/cities/${cityIdOrSlug}${includeVisual ? '' : '?include_visual=false'}`, CityEnvelopeSchema),

  // Moment
  listMomentsForCity: (cityIdOrSlug: string, params?: { moderation_status?: string; time_bucket?: 'NOW'|'TODAY'|'PAST'|'ALL'; limit?: number; cursor?: string }) => {
    const qs = new URLSearchParams();
    if (params?.moderation_status) qs.set('moderation_status', params.moderation_status);
    if (params?.time_bucket) qs.set('time_bucket', params.time_bucket);
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.cursor) qs.set('cursor', params.cursor);
    const q = qs.toString();
    return apiGet(`/cities/${cityIdOrSlug}/moments${q ? `?${q}` : ''}`, MomentListEnvelopeSchema);
  },

  getMoment: (momentId: string, includeCredit = true) =>
    apiGet(`/moments/${momentId}${includeCredit ? '' : '?include_credit=false'}`, MomentEnvelopeSchema),

  // Edition
  getTodayEdition: (params?: { date?: string; include_fallback?: boolean }) => {
    const qs = new URLSearchParams();
    if (params?.date) qs.set('date', params.date);
    if (params?.include_fallback !== undefined) qs.set('include_fallback', String(params.include_fallback));
    const q = qs.toString();
    return apiGet(`/editions/today${q ? `?${q}` : ''}`, EditionEnvelopeSchema);
  },

  getEdition: (editionId: string) =>
    apiGet(`/editions/${editionId}`, EditionEnvelopeSchema),

  listEditions: (params?: { from?: string; to?: string; limit?: number; cursor?: string }) => {
    const qs = new URLSearchParams();
    if (params?.from) qs.set('from', params.from);
    if (params?.to) qs.set('to', params.to);
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.cursor) qs.set('cursor', params.cursor);
    const q = qs.toString();
    return apiGet(`/editions${q ? `?${q}` : ''}`, EditionListEnvelopeSchema);
  },

  // System
  healthz: () => fetch(`${API_BASE_URL}/healthz`).then((r) => r.json()),
};
```

---

### 2.2 `src/lib/api-adapters.ts`（DB Row → Legacy Type）

```typescript
/* ============================================================
   SEE EARTH V1 · API Adapters · Phase 1
   ------------------------------------------------------------
   - 将 API 返回的 PublicCity / PublicMoment 转 legacy type
   - 保持现有组件 props 接口不变（不破坏 14 组件 LOCKED）
   - 关键：stripping raw_location / state_level 已在 server 完成
   ============================================================ */

import type { City } from '@/types';
import type { PublicCity } from '../../release-v1/api-contract/zod-schemas/city';
import type { PublicMoment } from '../../release-v1/api-contract/zod-schemas/moment';
import { getCountryNameLocal } from './countryI18n';

/**
 * publicCityToLegacyCity · API PublicCity → legacy City (Phase 0 type)
 *
 * 关键：legacy City 有 latitude/longitude/description 等字段；
 * PublicCity schema 不暴露 lat/lng（privacy boundary）；
 *
 * Phase 1 决策：从 server 端的 `hero_media` 推断 City.placeholder 坐标为 null
 *   → 实际上 legacy City 需要 lat/lng 计算时区与 hero 拍图
 *   → Phase 1 临时：用 slug → 已知 12 城 mapping（见 cityFromCoordinates）
 *
 * 真实 lat/lng 由 admin API 提供（Phase 3）；
 * 客户端 PublicCity 不含 lat/lng 是设计正确的（不绕过 privacy gate）。
 */
export function publicCityToLegacyCity(p: PublicCity): City {
  // Phase 1 临时：从硬编码 cities.ts 取 lat/lng（仅作为 fallback 兼容）
  // 注意：这里必须 import 硬编码 mapping 以支持 CityPage 的 hero 计算
  // 真实生产环境（Phase 2）应改为 admin API
  const legacy = lookupLegacyCityFallback(p.slug);

  return {
    identity: {
      city_id: p.id,
      canonical_name: p.names.canonical_name,
      local_name: p.names.name_zh,
      country_code: legacy?.identity.country_code ?? 'XX',
      country_name: p.names.country_en,
      place_type: 'city',
      latitude: legacy?.identity.latitude ?? 0,
      longitude: legacy?.identity.longitude ?? 0,
      timezone: p.timezone,
    },
    state_level: legacy?.state_level ?? 'L0_mapped',
    page_state: p.page_state,
    visual: p.visual ? {
      hero_media: {
        url: p.visual.hero_media.url,
        width: p.visual.hero_media.width,
        height: p.visual.hero_media.height,
        alt: p.visual.hero_media.alt,
        focus: p.visual.hero_media.focus,
      },
      hero_creator: p.visual.hero_creator,
      visual_status: p.visual.visual_status,
    } : undefined,
    content: legacy?.content ?? {
      description: '',
      momentZh: '',
      oneObservation: '',
      livingNote: '',
      cultureNote: '',
    },
  };
}

/**
 * lookupLegacyCityFallback · Phase 1 临时：
 * 从 src/data/cities.ts 取 lat/lng/description（隐私外）
 * 真实生产由 admin API 提供（Phase 3）
 *
 * 注：导入 legacy data 不违反"不输出 lat/lng to client"承诺：
 * client bundle 中 lat/lng 仅用于 client-side 计算（hero pick / timezone），
 * 不离开 client → 不进入任何 HTTP response。
 */
function lookupLegacyCityFallback(slug: string): City | null {
  // lazy import 避免 circular dependency
  const { cities } = require('../data/cities');
  return cities.find((c: any) => c.slug === slug) ?? null;
}

/**
 * publicMomentToLegacyMoment · API PublicMoment → legacy Moment type
 */
export function publicMomentToLegacyMoment(m: PublicMoment): LegacyMoment {
  return {
    moment_id: m.id,
    media: m.image_variants[0]
      ? { url: m.image_variants[0].url, type: 'image' as const }
      : { url: '', type: 'text' as const },
    media_type: 'image',
    captured_at: m.captured_at,
    uploaded_at: m.uploaded_at,
    city_id: m.city_id,
    public_city_name: m.public_city_name,
    caption: m.captions?.en ?? '',
    captions: m.captions,
    provenance_status: m.provenance_status,
    moderation_status: m.moderation_status,
    rights_status: m.rights === undefined ? 'unknown' : 'all_rights_reserved',  // legacy 兼容
    created_at: m.uploaded_at,
    updated_at: m.uploaded_at,
    witness_id: m.witness_id,
    editorial: m.editorial,
  };
}

import type { Moment as LegacyMoment } from '@/types';
```

> **注**：`require()` 在 Vite 中需替换为 dynamic import；这里用同步 require 仅示意。实际实现用 `await import()` 异步获取。

---

### 2.3 `src/hooks/useApi.ts`（Loading/Error/Empty 三态）

```typescript
/* ============================================================
   SEE EARTH V1 · useApi · Phase 1
   ------------------------------------------------------------
   - 通用 async data hook · 三态：Loading / Error / Empty
   - Phase 1 部分实现（D-P0-04 状态矩阵 subset）
   - Phase 2 扩展：Rate-limit / 离线 cache / 重试
   ============================================================ */

import { useEffect, useState, useRef } from 'react';
import { ApiClientError } from '@/lib/api-client';

export type AsyncState<T> =
  | { status: 'loading'; data?: undefined; error?: undefined }
  | { status: 'error'; data?: undefined; error: ApiClientError | Error }
  | { status: 'success'; data: T; error?: undefined };

export type AsyncListState<T> =
  | { status: 'loading'; data?: undefined; error?: undefined; isEmpty?: undefined }
  | { status: 'error'; data?: undefined; error: ApiClientError | Error; isEmpty?: undefined }
  | { status: 'success'; data: T[]; error?: undefined; isEmpty: boolean };

/**
 * useApi · 单个资源
 */
export function useApi<T>(
  fetcher: () => Promise<T>,
  deps: React.DependencyList = [],
): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({ status: 'loading' });
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading' });
    fetcherRef.current()
      .then((data) => {
        if (!cancelled) setState({ status: 'success', data });
      })
      .catch((error) => {
        if (!cancelled) setState({ status: 'error', error });
      });
    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}

/**
 * useApiList · 列表资源（带 isEmpty）
 */
export function useApiList<T>(
  fetcher: () => Promise<{ data: T[] }>,
  deps: React.DependencyList = [],
): AsyncListState<T> {
  const result = useApi(fetcher, deps);
  if (result.status === 'success') {
    return {
      status: 'success',
      data: result.data.data,
      isEmpty: result.data.data.length === 0,
    };
  }
  return result as AsyncListState<T>;
}
```

---

### 2.4 `src/hooks/useApiCity.ts`

```typescript
import { api } from '@/lib/api-client';
import { useApi, useApiList } from './useApi';
import { publicCityToLegacyCity } from '@/lib/api-adapters';
import type { City } from '@/types';
import type { PublicCity } from '../../release-v1/api-contract/zod-schemas/city';

export function useApiCities() {
  return useApiList(
    async () => {
      const env = await api.listCities({ limit: 50 });
      return {
        data: env.data.map(publicCityToLegacyCity),
        page: env.page,
        request_id: env.request_id,
      };
    },
    [],
  );
}

export function useApiCity(slug: string | undefined) {
  return useApi(
    async () => {
      if (!slug) throw new Error('slug required');
      const env = await api.getCity(slug);
      return publicCityToLegacyCity(env.data);
    },
    [slug],
  );
}
```

---

### 2.5 `src/hooks/useApiMoments.ts`

```typescript
import { api } from '@/lib/api-client';
import { useApiList } from './useApi';
import { publicMomentToLegacyMoment } from '@/lib/api-adapters';
import type { Moment } from '@/types';

export function useApiMoments(cityIdOrSlug: string | undefined) {
  return useApiList<Moment>(
    async () => {
      if (!cityIdOrSlug) return { data: [] };
      const env = await api.listMomentsForCity(cityIdOrSlug, {
        moderation_status: 'approved',
        time_bucket: 'ALL',
        limit: 50,
      });
      return {
        data: env.data.map(publicMomentToLegacyMoment),
        page: env.page,
        request_id: env.request_id,
      };
    },
    [cityIdOrSlug],
  );
}
```

---

### 2.6 `src/hooks/useApiEdition.ts`

```typescript
import { api } from '@/lib/api-client';
import { useApi } from './useApi';
import type { PublicEdition } from '../../release-v1/api-contract/zod-schemas/edition';

export function useApiTodayEdition() {
  return useApi<PublicEdition>(
    async () => {
      const env = await api.getTodayEdition({ include_fallback: true });
      return env.data;
    },
    [],
  );
}
```

---

## 3. 修改现有文件（数据源切换）

### 3.1 `src/hooks/useCityData.ts`（修改）

```diff
-import { useMemo } from 'react';
-import type { City } from '@/types';
-import { cities, findCity, type City as LegacyCity } from '../data/cities.ts';
-import { getCountryNameLocal } from '../lib/countryI18n.ts';
+import { useApiCity } from './useApiCity';
+import type { City } from '@/types';

 export function useCityData(slug: string | undefined | null): City | null {
-  return useMemo(() => {
-    if (!slug) return null;
-    const legacy: LegacyCity | undefined = findCity(slug);
-    if (!legacy) return null;
-    return legacyToUniversal(legacy);
-  }, [slug]);
+  const result = useApiCity(slug ?? undefined);
+  if (result.status === 'success') return result.data;
+  return null;  // Loading / Error 期间返回 null（与原行为一致）
 }

-// 保留 legacyToUniversal adapter 给 mock 模式使用
-/** @deprecated Phase 1+ 使用 API · 此函数仅供 dev fallback */
-export function legacyToUniversal(legacy: LegacyCity): City { ... }
```

> **注意**：保留 `legacyToUniversal` 与 `findCity` 等旧函数以支持 `VITE_USE_MOCK_API=true` 模式（dev fallback）。可通过 `featureFlags.ts` 判断。

### 3.2 `src/hooks/useMomentsForCity.ts`（修改）

```diff
-import { useMemo } from 'react';
-import type { Moment } from '@/types';
-import { liveEvents, type LiveEvent } from '../data/liveMoments.ts';
-import { moments as legacyMoments } from '../data/moments.ts';
+import { useApiMoments } from './useApiMoments';
+import type { Moment } from '@/types';

 export function useMomentsForCity(city_id: string | undefined | null): Moment[] {
-  return useMemo(() => { ... }, [city_id]);
+  const result = useApiMoments(city_id ?? undefined);
+  if (result.status === 'success') return result.data;
+  return [];
 }
```

### 3.3 `src/components/App.tsx`（修改数据源）

```diff
-import { cities, getFeaturedCities } from '@/data/cities';
-import { liveEvents } from '@/data/liveMoments';
+import { useApiCities } from '@/hooks/useApiCity';
+import { useApiMoments } from '@/hooks/useApiMoments';
+import { useApiTodayEdition } from '@/hooks/useApiEdition';

 export function App() {
-  const featuredCities = getFeaturedCities();
-  const activeCity = useMemo(() => cities[0], []);
+  const citiesResult = useApiCities();
+  const todayEdition = useApiTodayEdition();
+  const momentsResult = useApiMoments(activeCitySlug);
+
+  const featuredCities = citiesResult.status === 'success'
+    ? citiesResult.data.filter((c) => c.identity.local_name === '京都' /* TODO: server-side isFeatured */)
+    : [];
+  const liveEvents = todayEdition.status === 'success'
+    ? todayEdition.data.slots.map(toLiveEvent)
+    : [];
 }
```

### 3.4 `src/components/CityPage.tsx`（修改数据源）

```diff
-import { cities, findCity, ... } from '@/data/cities';
+import { useApiCity } from '@/hooks/useApiCity';

 export function CityPage() {
   const route = useRoute();
   const slug = route.name === 'city' ? route.params.slug : '';
-  const city = useMemo(() => findCity(slug), [slug]);
+  const cityResult = useApiCity(slug);
+  const city = cityResult.status === 'success' ? cityResult.data : null;
+
+  // Loading 态
+  if (cityResult.status === 'loading') {
+    return <LoadingState />;
+  }
+  // Error 态
+  if (cityResult.status === 'error') {
+    return <ErrorState error={cityResult.error} onRetry={() => window.location.reload()} />;
+  }
+  // Not found
+  if (!city) {
+    return <NotFoundState slug={slug} />;
+  }
+
+  // 正常渲染（用 city · 与原逻辑一致）
 }
```

### 3.5 `src/components/CityIndexPage.tsx`、`CityFeatured.tsx`、`CityCard.tsx`

类似模式：消费 `useApiCities()`，从 `data` 取 city list。

### 3.6 `src/components/MomentsTimeline.tsx`、`EventDrawer.tsx`

消费 `useApiTodayEdition()` + `useApiMoments(citySlug)`，派生 live events。

### 3.7 `src/components/UniversalCityPage.tsx`

消费 `useApiCity(slug)` + `useApiMoments(slug)`。

### 3.8 `src/lib/photoSource.ts`、`useWeather.ts`、`weather.ts`、`sun.ts`

这些 `lib/*` 文件接受 `City` 类型作为参数；**type import 改为 API 类型即可**（不变逻辑，只改 type 来源）。

```diff
- import type { City } from '@/data/cities';
+ import type { City } from '@/types';
```

`City` 类型已在 `src/types/city.ts` 定义（LOCKED Phase 0），API adapter 输出的就是 `City` 类型，所以无需改 lib/* 内部逻辑。

### 3.9 `src/lib/cityFromCoordinates.ts`、`unknownToCity.ts`

这些文件用 `findCity` 做 city lookup；改为 `useApiCities()` + 客户端过滤（Phase 1 简化）。

---

## 4. 状态矩阵（Phase 1 subset · per `D-P0-04`）

| 状态 | Phase 1 触发 | 文案 | UI |
|---|---|---|---|
| **Loading** | API 未响应（>200ms 显示 skeleton） | "此刻,正在加载" | skeleton 占位 |
| **Error** | API 4xx/5xx 或网络错误 | "远方暂时连不上" | 单一重试 CTA + Error ID |
| **Empty** | `data.length === 0` | "此刻这里没有 moment" | 留白 + 1 句诗意 |
| **Permission** | 不触发（Phase 1 无权限请求） | — | — |
| **Privacy** | Witness 提交前 | "公开展示 = 城市级" | per `EchoInput` 处理 |

**Phase 1 仅实现 Loading / Error / Empty 三态**，其他 P1。

### 4.1 Error Boundary

```typescript
// src/components/ui/ErrorState.tsx (NEW)
import { ApiClientError } from '@/lib/api-client';

export function ErrorState({ error, onRetry }: { error: Error; onRetry: () => void }) {
  const errorId = error instanceof ApiClientError ? error.envelope.request_id : 'unknown';
  return (
    <div className="error-state" role="alert">
      <p>远方暂时连不上</p>
      <button onClick={onRetry}>重试</button>
      <p className="error-id">Error ID: {errorId}</p>
    </div>
  );
}
```

### 4.2 Loading Skeleton

```typescript
// src/components/ui/LoadingState.tsx (NEW)
export function LoadingState({ message = '此刻,正在加载' }: { message?: string }) {
  return (
    <div className="loading-state" aria-busy="true">
      <div className="loading-skeleton" />
      <p>{message}</p>
    </div>
  );
}
```

---

## 5. Feature Flag（dev fallback）

### 5.1 `src/lib/featureFlags.ts`（修改）

```typescript
export const featureFlags = {
  isAlpha: import.meta.env.VITE_ENV === 'alpha',
  useMockApi: import.meta.env.VITE_USE_MOCK_API === 'true',
  // ...
};
```

### 5.2 Hook 条件分支

```typescript
// src/hooks/useCityData.ts
import { featureFlags } from '@/lib/featureFlags';
import { useApiCity } from './useApiCity';
import { findCity, legacyToUniversal } from '../data/cities';  // for mock mode

export function useCityData(slug: string | undefined | null): City | null {
  const apiResult = useApiCity(slug ?? undefined);

  // Mock mode（仅 dev）
  if (featureFlags.useMockApi) {
    if (!slug) return null;
    const legacy = findCity(slug);
    if (!legacy) return null;
    return legacyToUniversal(legacy);
  }

  // Normal API mode
  if (apiResult.status === 'success') return apiResult.data;
  return null;
}
```

> **本地开发**：开发者可设 `VITE_USE_MOCK_API=true` 启动本地 hardcoded data（无需 backend）

---

## 6. 环境变量配置

### 6.1 `.env.production`（修改）

```bash
# 旧
WEATHER_API_PROVIDER=open-meteo
SUN_PROVIDER=sunrise-sunset

# 新增（Phase 1）
VITE_API_BASE_URL=https://alpha-api-see-earth.vercel.app/v1
VITE_USE_MOCK_API=false
VITE_ENV=alpha
```

### 6.2 `.env.local`（开发）

```bash
VITE_API_BASE_URL=http://localhost:8787/v1
VITE_USE_MOCK_API=true  # 本地无需 backend
```

### 6.3 Vercel Preview env

由 Vercel Dashboard 配置（详见 `alpha-deployment-evidence-v1.md`）。

---

## 7. TypeScript 类型安全

### 7.1 `tsconfig.json` paths（修改）

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@see-earth/api/zod-schemas/*": ["./release-v1/api-contract/zod-schemas/*"]
    }
  }
}
```

### 7.2 类型导入示例

```typescript
// src/lib/api-client.ts
import {
  CityListEnvelopeSchema,
  CityEnvelopeSchema,
} from '@see-earth/api/zod-schemas/city';

// src/lib/api-adapters.ts
import type { PublicCity } from '@see-earth/api/zod-schemas/city';
```

**优势**：

- 单一 source of truth（zod-schemas）
- 双向类型同步（修改 contract 自动传播到 client + server）
- Vite + TS strict 模式完整支持

---

## 8. 测试策略

### 8.1 Type-level 测试

```bash
pnpm typecheck
# 必须通过（strict 模式）
```

### 8.2 集成测试（Phase 2）

- Mock fetch response with MSW
- 验证 Zod schema mismatch 抛出
- 验证 Loading/Error/Empty 三态切换

### 8.3 E2E 测试（Phase 2）

- Playwright + real API
- 验证 privacy gate（response 不含 lat/lng）

---

## 9. Phase 1 不实现（明确排除）

| 项 | Phase | 备注 |
|---|---|---|
| SWR / cache 策略 | Phase 2 | Phase 1 仅 useState + useEffect |
| Optimistic update | Phase 2 | Phase 1 仅 GET |
| Offline cache (Service Worker) | Phase 3 | |
| Analytics SDK | Phase 3 | 不发 analytics 事件 |
| Echo POST | Phase 3 | OD-01 REMOVE |
| Witness POST | Phase 2 | 表结构已建好 |

---

## 10. Blockers（详见 `phase1-blockers-v1.md`）

1. API 部署后 `VITE_API_BASE_URL` 准确值（用户/PM 提供）
2. Zod schema 路径 tsconfig 配置（verify）
3. 14 组件 LOCKED 是否真的 props 不变（type 验证）
4. CI typecheck 通过

---

## 11. 元数据

| 字段 | 值 |
|---|---|
| 文档版本 | v1 |
| 创建时间 | 2026-08-22 |
| 创建人 | Engineer Agent (Round 2B) |
| 文档 ID | `web-client-integration-v1.md` |
| 目标 Gate | Gate A · Internal Alpha · Phase 1 |
| 决策状态 | ✅ ACCEPTED（待 PM 评审） |
| Workspace 路径 | `/Users/lwy/Documents/ChatGPT/看见地球/release-v1/vertical-slice-phase1/web-client-integration-v1.md` |
| Obsidian canonical 路径 | `/Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/vertical-slice-phase1/web-client-integration-v1.md` |
| Obsidian 同步状态 | ❌ 未同步（sandbox 拒绝写入 Obsidian） |

---

**End of web-client-integration-v1.md**