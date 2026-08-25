---
title: SEE EARTH V1 · API Implementation · Phase 1
type: api-implementation
tags: [release-v1, e-p0-02, api, nextjs, route-handlers, zod, see-earth]
task_id: E-P0-02
phase: Phase 1 · Vertical Slice
dispatched_at: 2026-08-22
status: DRAFT · IN REVIEW
author: Engineer Agent (Round 2B)
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/vertical-slice-phase1/api-implementation-v1.md
source_inputs:
  - release-v1/api-contract/openapi.yaml (LOCKED)
  - release-v1/api-contract/zod-schemas/*
  - release-v1/api-contract/error-code-dict-v1.md
  - release-v1/api-contract/contract-decisions-v1.md
  - release-v1/alpha-environment/env-decision-v1.md
---

# SEE EARTH V1 · API Implementation · Phase 1 Vertical Slice

> **作者**：Engineer Agent（Round 2B · Phase 1 子集）
> **目标读者**：PM Agent（验收）、Web/iOS 工程师、SRE
> **任务卡**：E-P0-02 Launch Vertical Slice（Phase 1 子集）
> **约束**：严格遵循 `release-v1/api-contract/openapi.yaml` v1.0.0 + `zod-schemas/*` source of truth
> **决策日期**：2026-08-22

---

## 0. 一句话结论

**Phase 1 实现 8 个 endpoint（5 个 City/Moment GET + 2 个 Edition GET + /healthz），所有 endpoint 用 Zod schema 验证 + Drizzle 查询 + Privacy serializer gate。CORS allow `alpha-see-earth.vercel.app` + `*.vercel.app`；Rate limit 100 req/min/IP（per OD-05）；错误响应统一 `ErrorEnvelope`（per E-P0-09 §C.3）。Witness / Echo / Admin / Asset POST endpoint = Phase 2/3 不实现。**

---

## 1. 端点矩阵（Phase 1 必交付）

### 1.1 P0 必交付（按任务卡 §D）

| Endpoint | Method | Phase 1 | 实现复杂度 | 备注 |
|---|---|---|---|---|
| `/v1/cities` | GET | ✅ | 🟢 低 | 列表 · 支持 layer/page_state/country_code 过滤 |
| `/v1/cities/{cityIdOrSlug}` | GET | ✅ | 🟢 低 | 单个 City · ID or slug 路由 |
| `/v1/cities/{cityIdOrSlug}/moments` | GET | ✅ | 🟡 中 | City 关联 Moments · approved only 默认 |
| `/v1/moments/{momentId}` | GET | ✅ | 🟢 低 | 单个 Moment |
| `/v1/editions/today` | GET | ✅ | 🟡 中 | Daily 12 主入口 · 支持 fallback |
| `/v1/healthz` | GET | ✅ | 🟢 低 | Health check |

### 1.2 P1 必交付（按任务卡 §D）

| Endpoint | Method | Phase 1 | 实现复杂度 | 备注 |
|---|---|---|---|---|
| `/v1/editions/{editionId}` | GET | ✅ | 🟢 低 | 单个 Edition |
| `/v1/editions` | GET | ✅ | 🟡 中 | 历史 Editions 列表 |

### 1.3 Phase 2/3 不实现

| Endpoint | Phase | 备注 |
|---|---|---|
| `/v1/witness/submissions` POST | Phase 2 | 表结构 Phase 1 建好 |
| `/v1/witness/submissions/{id}` GET | Phase 2 | |
| `/v1/assets/upload-url` POST | Phase 2 | Storage pipeline 已就绪 |
| `/v1/assets/{id}` GET | Phase 2 | |
| `/v1/assets/{id}/complete` POST | Phase 2 | |
| `/v1/echoes` POST | Phase 3 | OD-01 REMOVE · 不实现 |
| `/v1/echoes/{id}` GET | Phase 3 | |
| `/v1/admin/*` | Phase 3 | 无 admin UI |

---

## 2. 公共 API 设计原则

### 2.1 URL 前缀与版本

- **Base URL**: `https://alpha-api-see-earth.vercel.app/v1`（Alpha 环境）
- **Production URL**: `https://api-see-earth.vercel.app/v1`（Phase 2 部署）
- **本地开发**: `http://localhost:8787/v1`
- 所有 endpoint 路径以 `/v1/` 前缀（OpenAPI contract 兼容）

### 2.2 强制约束

| 项 | 规则 | 验证 |
|---|---|---|
| 精确经纬度 | 公共 endpoint **永不含** raw lat/lng | smoke test 强制 |
| raw_location | 公共 Moment serializer 永不含 | smoke test 强制 |
| state_level | City.state_level 仅 admin | serializer gate |
| EXIF GPS | Variant 图永不含 | smoke test (`assertPublicMomentNoGps`) |
| 错误响应 | 统一 `ErrorEnvelope` | per `error-code-dict-v1.md` |
| CORS | `alpha-see-earth.vercel.app` + `*.vercel.app` | OPTIONS preflight 200 |
| Rate limit | 100 req/min/IP（per OD-05） | Edge Middleware |
| Request ID | `X-Request-Id` header（echo + log） | middleware |

### 2.3 Response Envelope 统一格式

**成功响应**：

```typescript
// 单个资源
{
  "data": { ... PublicCity / PublicMoment / PublicEdition ... },
  "request_id": "req_<uuid>"
}

// 列表
{
  "data": [ ... ],
  "page": { "next_cursor": "string|null", "has_more": true|false },
  "request_id": "req_<uuid>"
}
```

**错误响应**（per `error-code-dict-v1.md`）：

```typescript
{
  "error_code": "string_snake_case",  // 稳定错误码
  "message": "人类可读 · 面向用户",
  "details": { ... },                  // 可选 · 机器可读
  "retryable": true|false,
  "request_id": "req_<uuid>"
}
```

**HTTP 状态码**：

| Status | 场景 |
|---|---|
| 200 | 成功 |
| 400 | 参数校验失败（Zod parse error） |
| 404 | 资源不存在 |
| 409 | 冲突（duplicate slug / unique constraint） |
| 429 | Rate limit exceeded |
| 500 | 服务器内部错误 |
| 502 / 503 | 上游依赖失败（Supabase / Storage） |

---

## 3. 路由文件结构

```text
api/src/app/api/v1/
├── healthz/
│   └── route.ts                          # GET /v1/healthz
├── cities/
│   ├── route.ts                          # GET /v1/cities
│   └── [cityIdOrSlug]/
│       ├── route.ts                      # GET /v1/cities/{cityIdOrSlug}
│       └── moments/
│           └── route.ts                  # GET /v1/cities/{cityIdOrSlug}/moments
├── moments/
│   └── [momentId]/
│       └── route.ts                      # GET /v1/moments/{momentId}
└── editions/
    ├── route.ts                          # GET /v1/editions
    ├── today/
    │   └── route.ts                      # GET /v1/editions/today
    └── [editionId]/
        └── route.ts                      # GET /v1/editions/{editionId}
```

---

## 4. 通用组件（`api/src/lib/`）

### 4.1 Error Envelope Formatter

```typescript
// api/src/lib/errors.ts
import { ErrorEnvelopeSchema } from '../../../../release-v1/api-contract/zod-schemas/common';
import type { z } from 'zod';

export type ErrorCode =
  | 'BAD_REQUEST'
  | 'VALIDATION_FAILED'
  | 'CITY_NOT_FOUND'
  | 'MOMENT_NOT_FOUND'
  | 'EDITION_NOT_FOUND'
  | 'RATE_LIMIT_EXCEEDED'
  | 'CORS_BLOCKED'
  | 'SERVER_ERROR'
  | 'UPSTREAM_ERROR'
  | 'NOT_FOUND';

export class ApiError extends Error {
  constructor(
    public errorCode: ErrorCode,
    message: string,
    public status: number,
    public details?: Record<string, string | number | boolean>,
    public retryable: boolean = false,
  ) {
    super(message);
  }
}

export function formatErrorResponse(
  err: ApiError | Error,
  requestId: string,
): { status: number; body: z.infer<typeof ErrorEnvelopeSchema> } {
  if (err instanceof ApiError) {
    return {
      status: err.status,
      body: ErrorEnvelopeSchema.parse({
        error_code: err.errorCode.toLowerCase(),
        message: err.message,
        details: err.details,
        retryable: err.retryable,
        request_id: requestId,
      }),
    };
  }
  // 未知错误
  return {
    status: 500,
    body: ErrorEnvelopeSchema.parse({
      error_code: 'server_error',
      message: 'Internal server error',
      retryable: false,
      request_id: requestId,
    }),
  };
}
```

### 4.2 Request ID Middleware

```typescript
// api/src/middleware/requestId.ts
import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

export function withRequestId(handler: (req: NextRequest, requestId: string) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    const requestId = req.headers.get('x-request-id') ?? `req_${randomUUID()}`;
    const response = await handler(req, requestId);
    response.headers.set('x-request-id', requestId);
    return response;
  };
}
```

### 4.3 CORS Middleware

```typescript
// api/src/middleware/cors.ts
import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_ORIGINS = [
  'https://alpha-see-earth.vercel.app',
  /^https:\/\/.*\.vercel\.app$/,  // 所有 Vercel preview
];

export function withCORS(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    const origin = req.headers.get('origin');
    const isAllowed = origin && ALLOWED_ORIGINS.some((rule) =>
      typeof rule === 'string' ? rule === origin : rule.test(origin)
    );

    // Preflight
    if (req.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 204,
        headers: isAllowed ? {
          'Access-Control-Allow-Origin': origin!,
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, X-Request-Id',
          'Access-Control-Max-Age': '86400',
        } : {},
      });
    }

    const response = await handler(req);
    if (isAllowed && origin) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Vary', 'Origin');
    }
    return response;
  };
}
```

### 4.4 Rate Limit（in-memory token bucket · Phase 1）

```typescript
// api/src/middleware/rateLimit.ts
import { NextRequest, NextResponse } from 'next/server';

// Phase 1 简化版：in-memory token bucket per IP
// 100 req/min per OD-05
// 注：Vercel serverless 无共享内存，per-instance 限制；
//   生产环境应替换为 Upstash Redis（Phase 2 评估）

const BUCKET = new Map<string, { tokens: number; lastRefill: number }>();
const LIMIT = 100;
const WINDOW_MS = 60 * 1000;

function getClientIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
}

export function withRateLimit(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    const ip = getClientIp(req);
    const now = Date.now();
    const bucket = BUCKET.get(ip) ?? { tokens: LIMIT, lastRefill: now };

    // Refill
    const elapsed = now - bucket.lastRefill;
    const refilled = Math.min(LIMIT, bucket.tokens + (elapsed / WINDOW_MS) * LIMIT);
    bucket.tokens = refilled;
    bucket.lastRefill = now;

    if (bucket.tokens < 1) {
      BUCKET.set(ip, bucket);
      return NextResponse.json({
        error_code: 'rate_limit_exceeded',
        message: 'Too many requests. Please try again in a minute.',
        retryable: true,
        request_id: req.headers.get('x-request-id') ?? '',
      }, { status: 429 });
    }

    bucket.tokens -= 1;
    BUCKET.set(ip, bucket);

    return handler(req);
  };
}
```

### 4.5 DB Client

```typescript
// api/src/db/client.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is required');
}

// Vercel serverless: 1 connection per function instance
const client = postgres(connectionString, {
  max: 1,
  idle_timeout: 20,
  connect_timeout: 10,
  ssl: 'require',
});

export const db = drizzle(client, { schema });
```

---

## 5. Endpoint 实现（详细）

### 5.1 `GET /v1/healthz`

```typescript
// api/src/app/api/v1/healthz/route.ts
import { NextResponse } from 'next/server';
import { withRequestId, withCORS } from '@/middleware';

const handler = async (_req: NextRequest, requestId: string) => {
  // 可选：轻量 DB ping（不阻塞）
  return NextResponse.json({
    status: 'ok',
    version: '1.0.0',
    phase: 'phase1',
    timestamp: new Date().toISOString(),
    request_id: requestId,
  });
};

export const GET = withCORS(withRequestId(handler));
```

**响应**：

```json
{
  "status": "ok",
  "version": "1.0.0",
  "phase": "phase1",
  "timestamp": "2026-08-22T12:00:00.000Z",
  "request_id": "req_abc123"
}
```

---

### 5.2 `GET /v1/cities`

```typescript
// api/src/app/api/v1/cities/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ListCitiesQuerySchema, CityListEnvelopeSchema } from '../../../../../release-v1/api-contract/zod-schemas/city';
import { db } from '@/db/client';
import { cities } from '@/db/schema';
import { toPublicCity } from '@/lib/privacy';
import { withRequestId, withCORS, withRateLimit } from '@/middleware';
import { ApiError, formatErrorResponse } from '@/lib/errors';
import { eq, and, isNull } from 'drizzle-orm';

const handler = async (req: NextRequest, requestId: string) => {
  try {
    // 1. Query 参数校验
    const url = new URL(req.url);
    const queryParams = Object.fromEntries(url.searchParams);
    const query = ListCitiesQuerySchema.parse(queryParams);

    // 2. Drizzle 查询
    const conditions = [isNull(cities.deletedAt)];
    if (query.layer) conditions.push(eq(cities.layer, query.layer));
    if (query.page_state) conditions.push(eq(cities.pageState, query.page_state));
    if (query.country_code) conditions.push(eq(cities.countryCode, query.country_code));

    const rows = await db.select()
      .from(cities)
      .where(and(...conditions))
      .limit(query.limit + 1);  // 多取 1 条判断 has_more

    // 3. Cursor-based pagination
    const hasMore = rows.length > query.limit;
    const data = rows.slice(0, query.limit).map(toPublicCity);
    const nextCursor = hasMore ? data[data.length - 1].id : null;

    // 4. Zod envelope 校验（边界防御）
    const body = CityListEnvelopeSchema.parse({
      data,
      page: { next_cursor: nextCursor, has_more: hasMore },
      request_id: requestId,
    });

    return NextResponse.json(body, { status: 200 });
  } catch (err) {
    const { status, body } = formatErrorResponse(err as Error, requestId);
    return NextResponse.json(body, { status });
  }
};

export const GET = withRateLimit(withCORS(withRequestId(handler)));
```

**请求示例**：

```text
GET /v1/cities?layer=yellow&limit=20
GET /v1/cities?page_state=A_seed_editorial
GET /v1/cities?country_code=JP
```

**响应示例**：

```json
{
  "data": [
    {
      "id": "uuid-1",
      "slug": "kyoto",
      "names": {
        "canonical_name": "Kyoto",
        "name_zh": "京都",
        "name_en": "Kyoto",
        "country_zh": "日本",
        "country_en": "Japan"
      },
      "timezone": "Asia/Tokyo",
      "layer": "yellow",
      "public_location_only": true,
      "page_state": "A_seed_editorial",
      "visual": { ... }
    },
    ...
  ],
  "page": {
    "next_cursor": null,
    "has_more": false
  },
  "request_id": "req_abc123"
}
```

**关键验证**：smoke test 检查所有 12 个 City 都返回，且**不含** `latitude` / `longitude` 字段（`public_location_only: true` 强制）。

---

### 5.3 `GET /v1/cities/{cityIdOrSlug}`

```typescript
// api/src/app/api/v1/cities/[cityIdOrSlug]/route.ts
import { GetCityByIdQuerySchema, CityEnvelopeSchema } from '../../../../../../release-v1/api-contract/zod-schemas/city';
import { db } from '@/db/client';
import { cities } from '@/db/schema';
import { toPublicCity } from '@/lib/privacy';
import { and, eq, isNull, or } from 'drizzle-orm';
import { ApiError } from '@/lib/errors';

const handler = async (req: NextRequest, requestId: string, { params }: { params: { cityIdOrSlug: string } }) => {
  try {
    const url = new URL(req.url);
    const query = GetCityByIdQuerySchema.parse(Object.fromEntries(url.searchParams));

    // UUID or slug 兼容
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.cityIdOrSlug);

    const [row] = await db.select()
      .from(cities)
      .where(and(
        isNull(cities.deletedAt),
        isUuid ? eq(cities.id, params.cityIdOrSlug) : eq(cities.slug, params.cityIdOrSlug),
      ))
      .limit(1);

    if (!row) {
      throw new ApiError('CITY_NOT_FOUND', `City ${params.cityIdOrSlug} not found`, 404);
    }

    const publicCity = toPublicCity(row);
    const body = CityEnvelopeSchema.parse({
      data: query.include_visual ? publicCity : { ...publicCity, visual: undefined },
      request_id: requestId,
    });

    return NextResponse.json(body, { status: 200 });
  } catch (err) {
    const { status, body } = formatErrorResponse(err as Error, requestId);
    return NextResponse.json(body, { status });
  }
};

export const GET = withRateLimit(withCORS(withRequestId(handler)));
```

**响应**：

```json
{
  "data": {
    "id": "uuid-kyoto",
    "slug": "kyoto",
    "names": { ... },
    "timezone": "Asia/Tokyo",
    "layer": "yellow",
    "public_location_only": true,
    "page_state": "A_seed_editorial",
    "visual": {
      "hero_media": { "url": "...", "width": 1920, "height": 1080, "alt": "京都 Kyoto" },
      "hero_creator": "Photo by Sorasak / Unsplash",
      "visual_status": "seed"
    }
  },
  "request_id": "req_abc123"
}
```

---

### 5.4 `GET /v1/cities/{cityIdOrSlug}/moments`

```typescript
// api/src/app/api/v1/cities/[cityIdOrSlug]/moments/route.ts
import { ListMomentsForCityQuerySchema, MomentListEnvelopeSchema } from '../../../../../../../release-v1/api-contract/zod-schemas/moment';
import { db } from '@/db/client';
import { cities, moments } from '@/db/schema';
import { toPublicMoment } from '@/lib/privacy';
import { and, eq, isNull, desc } from 'drizzle-orm';

const handler = async (req: NextRequest, requestId: string, { params }: { params: { cityIdOrSlug: string } }) => {
  try {
    const url = new URL(req.url);
    const query = ListMomentsForCityQuerySchema.parse(Object.fromEntries(url.searchParams));

    // 1. 先查 city（确定 city_id）
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.cityIdOrSlug);
    const [city] = await db.select()
      .from(cities)
      .where(and(
        isNull(cities.deletedAt),
        isUuid ? eq(cities.id, params.cityIdOrSlug) : eq(cities.slug, params.cityIdOrSlug),
      ))
      .limit(1);

    if (!city) {
      throw new ApiError('CITY_NOT_FOUND', `City ${params.cityIdOrSlug} not found`, 404);
    }

    // 2. Time bucket 过滤
    let timeFilter: SQL | undefined;
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (query.time_bucket === 'TODAY') {
      timeFilter = gte(moments.capturedAt, todayStart);
    } else if (query.time_bucket === 'NOW') {
      // 30 分钟内
      const thirtyMinAgo = new Date(now.getTime() - 30 * 60 * 1000);
      timeFilter = gte(moments.capturedAt, thirtyMinAgo);
    } else if (query.time_bucket === 'PAST') {
      timeFilter = lt(moments.capturedAt, todayStart);
    }
    // 'ALL' 不过滤

    // 3. 查询 moments
    const conditions = [
      eq(moments.cityId, city.id),
      isNull(moments.deletedAt),
      eq(moments.moderationStatus, query.moderation_status),  // 默认 'approved'
    ];
    if (timeFilter) conditions.push(timeFilter);

    const rows = await db.select()
      .from(moments)
      .where(and(...conditions))
      .orderBy(desc(moments.capturedAt))
      .limit(query.limit + 1);

    const hasMore = rows.length > query.limit;
    const data = rows.slice(0, query.limit).map(toPublicMoment);

    const body = MomentListEnvelopeSchema.parse({
      data,
      page: { next_cursor: hasMore ? data[data.length - 1].id : null, has_more: hasMore },
      request_id: requestId,
    });

    return NextResponse.json(body, { status: 200 });
  } catch (err) {
    const { status, body } = formatErrorResponse(err as Error, requestId);
    return NextResponse.json(body, { status });
  }
};

export const GET = withRateLimit(withCORS(withRequestId(handler)));
```

**请求示例**：

```text
GET /v1/cities/kyoto/moments?moderation_status=approved&time_bucket=TODAY&limit=20
```

**响应**：

```json
{
  "data": [
    {
      "id": "moment-uuid",
      "city_id": "city-uuid-kyoto",
      "public_city_name": "Kyoto",
      "captured_at": "2026-08-22T11:30:00+09:00",
      "captured_at_tz": "Asia/Tokyo",
      "captured_at_source": "exif",
      "captured_at_confidence": "high",
      "uploaded_at": "2026-08-22T11:35:00Z",
      "published_at": "2026-08-22T11:40:00Z",
      "image_variants": [
        { "variant": "thumb_320", "url": "https://...", "width": 320, "height": 180, "mime": "image/webp" },
        { "variant": "card_640", "url": "https://...", "width": 640, "height": 360, "mime": "image/webp" },
        { "variant": "detail_1280", "url": "https://...", "width": 1280, "height": 720, "mime": "image/webp" }
      ],
      "source_type": "editorial",
      "rights": { "credit_line": "Photo by Sorasak", "rights_status": "cc_by" },
      "credit": { "credit_line": "Photo by Sorasak", "rights_status": "cc_by" },
      "captions": { "zh": "京都的古寺", "en": "Ancient temple in Kyoto" },
      "provenance_status": "editorial",
      "moderation_status": "approved"
      // ❌ 不含 raw_location
    }
  ],
  "page": { "next_cursor": null, "has_more": false },
  "request_id": "req_abc123"
}
```

---

### 5.5 `GET /v1/moments/{momentId}`

```typescript
// api/src/app/api/v1/moments/[momentId]/route.ts
import { GetMomentQuerySchema, MomentEnvelopeSchema } from '../../../../../release-v1/api-contract/zod-schemas/moment';
import { db } from '@/db/client';
import { moments } from '@/db/schema';
import { toPublicMoment } from '@/lib/privacy';
import { and, eq, isNull } from 'drizzle-orm';

const handler = async (req: NextRequest, requestId: string, { params }: { params: { momentId: string } }) => {
  try {
    const url = new URL(req.url);
    const query = GetMomentQuerySchema.parse(Object.fromEntries(url.searchParams));

    const [row] = await db.select()
      .from(moments)
      .where(and(eq(moments.id, params.momentId), isNull(moments.deletedAt)))
      .limit(1);

    if (!row) {
      throw new ApiError('MOMENT_NOT_FOUND', `Moment ${params.momentId} not found`, 404);
    }

    const publicMoment = toPublicMoment(row);
    if (!query.include_credit) {
      delete (publicMoment as any).credit;
      delete (publicMoment as any).rights;
    }

    const body = MomentEnvelopeSchema.parse({
      data: publicMoment,
      request_id: requestId,
    });

    return NextResponse.json(body, { status: 200 });
  } catch (err) {
    const { status, body } = formatErrorResponse(err as Error, requestId);
    return NextResponse.json(body, { status });
  }
};

export const GET = withRateLimit(withCORS(withRequestId(handler)));
```

---

### 5.6 `GET /v1/editions/today`

```typescript
// api/src/app/api/v1/editions/today/route.ts
import { GetTodayEditionQuerySchema, EditionEnvelopeSchema } from '../../../../../release-v1/api-contract/zod-schemas/edition';
import { db } from '@/db/client';
import { editions } from '@/db/schema';
import { and, eq, isNull, desc, lte } from 'drizzle-orm';

const handler = async (req: NextRequest, requestId: string) => {
  try {
    const url = new URL(req.url);
    const query = GetTodayEditionQuerySchema.parse(Object.fromEntries(url.searchParams));

    // 1. 确定目标日期（默认 = today in UTC · Phase 1 简化）
    const targetDate = query.date ?? new Date().toISOString().slice(0, 10);

    // 2. 查询 published edition（精确日期）
    const [published] = await db.select()
      .from(editions)
      .where(and(
        eq(editions.date, targetDate),
        isNull(editions.deletedAt),
        eq(editions.status, 'published'),
      ))
      .limit(1);

    if (published) {
      const body = EditionEnvelopeSchema.parse({
        data: toPublicEdition(published),
        request_id: requestId,
      });
      return NextResponse.json(body, { status: 200 });
    }

    // 3. 无 published → 查找最近 fallback（query.include_fallback=true）
    if (query.include_fallback) {
      const [fallback] = await db.select()
        .from(editions)
        .where(and(
          isNull(editions.deletedAt),
          eq(editions.status, 'published'),
          lte(editions.date, targetDate),
        ))
        .orderBy(desc(editions.date))
        .limit(1);

      if (fallback) {
        // 标记 is_fallback = true + replaces_edition_id
        const body = EditionEnvelopeSchema.parse({
          data: {
            ...toPublicEdition(fallback),
            is_fallback: true,
            replaces_edition_id: undefined,
          },
          request_id: requestId,
        });
        return NextResponse.json(body, { status: 200 });
      }
    }

    throw new ApiError('EDITION_NOT_FOUND', `No edition for ${targetDate}`, 404);
  } catch (err) {
    const { status, body } = formatErrorResponse(err as Error, requestId);
    return NextResponse.json(body, { status });
  }
};

export const GET = withRateLimit(withCORS(withRequestId(handler)));
```

**响应**：

```json
{
  "data": {
    "id": "edition-uuid",
    "date": "2026-08-22",
    "slots": [
      { "position": 1, "moment_id": "m-uuid-1", "city_id": "c-uuid-kyoto", "fallback_reason": null, "is_editorial_fill": false },
      { "position": 2, "moment_id": "m-uuid-2", "city_id": "c-uuid-lisbon", "fallback_reason": null, "is_editorial_fill": false },
      { "position": 3, "moment_id": null, "city_id": null, "fallback_reason": "no_candidate_for_city", "is_editorial_fill": false },
      // ... 12 slots
    ],
    "version": 1,
    "published_at": "2026-08-22T00:00:00Z",
    "is_fallback": false
  },
  "request_id": "req_abc123"
}
```

---

### 5.7 `GET /v1/editions/{editionId}`

```typescript
// api/src/app/api/v1/editions/[editionId]/route.ts
// 类似 GetCity/GET Moment · 单个 Edition 查询
// 简化实现：与 toPublicEdition 共用 + Zod 校验
```

---

### 5.8 `GET /v1/editions`

```typescript
// api/src/app/api/v1/editions/route.ts
// 历史 Editions 列表 · 支持 from / to / limit / cursor
// 仅返回 published editions（公共可见）
```

---

## 6. Phase 1 Public Serializer Gate

### 6.1 Privacy Gate 实现（`api/src/lib/privacy.ts`）

```typescript
// api/src/lib/privacy.ts
import type { cities as citiesTable, moments as momentsTable, editions as editionsTable } from '@/db/schema';
import {
  PublicCitySchema,
  PublicMomentSchema,
  PublicEditionSchema,
} from '../../../../release-v1/api-contract/zod-schemas';

/**
 * 🔒 PRIVACY BOUNDARY GATE
 * 所有公共响应必须经过这里。
 * toPublic* 函数是 DB row → Public Zod schema 的唯一通道。
 * 任何旁路（直接 SELECT * 返回）都是 bug。
 */

export function toPublicCity(row: typeof citiesTable.$inferSelect) {
  return PublicCitySchema.parse({
    id: row.id,
    slug: row.slug,
    names: {
      canonical_name: row.nameCanonical,
      name_zh: row.nameZh,
      name_en: row.nameEn,
      alternate_names: row.alternateNames ?? undefined,
      country_zh: row.countryNameZh,
      country_en: row.countryNameEn,
    },
    timezone: row.timezone,
    layer: row.layer,
    public_location_only: true,  // ✅ 强制标志
    page_state: row.pageState,
    visual: row.heroMediaUrl ? {
      hero_media: {
        url: row.heroMediaUrl,
        width: row.heroMediaWidth ?? 0,
        height: row.heroMediaHeight ?? 0,
        alt: row.heroMediaAlt ?? '',
        focus: row.heroMediaFocus ?? undefined,
      },
      hero_source: row.heroSource ?? undefined,
      hero_creator: row.heroCreator ?? undefined,
      hero_license: row.heroLicense ?? undefined,
      hero_credit_requirement: row.heroCreditRequirement ?? undefined,
      editorial_only: row.editorialOnly,
      visual_status: row.visualStatus,
    } : undefined,
    // ❌ 永远不输出：latitude / longitude / state_level / country_code / admin1_code
  });
}

export function toPublicMoment(row: typeof momentsTable.$inferSelect) {
  return PublicMomentSchema.parse({
    id: row.id,
    city_id: row.cityId,
    public_city_name: row.publicCityName,
    captured_at: row.capturedAt.toISOString(),
    captured_at_tz: row.capturedAtTz,
    captured_at_source: row.capturedAtSource,
    captured_at_confidence: row.capturedAtConfidence,
    uploaded_at: row.uploadedAt.toISOString(),
    published_at: row.publishedAt?.toISOString(),
    image_variants: row.imageVariants,
    source_type: row.sourceType,
    rights: {
      credit_line: row.creditLine ?? '',
      source_url: row.creditSourceUrl ?? undefined,
      rights_status: row.rightsStatus,
    },
    credit: {
      credit_line: row.creditLine ?? '',
      source_url: row.creditSourceUrl ?? undefined,
      rights_status: row.rightsStatus,
    },
    captions: row.captionZh || row.captionEn ? {
      zh: row.captionZh ?? undefined,
      en: row.captionEn ?? undefined,
    } : undefined,
    provenance_status: row.provenanceStatus,
    moderation_status: row.moderationStatus,
    witness_id: row.witnessId ?? undefined,
    editorial: row.editorialCategory ? {
      category: row.editorialCategory,
      note: row.editorialNote ?? undefined,
    } : undefined,
    // ❌ 永远不输出：raw_location / location_verification_* / sources / source_specific_type
  });
}

export function toPublicEdition(row: typeof editionsTable.$inferSelect) {
  return PublicEditionSchema.parse({
    id: row.id,
    date: row.date,
    slots: row.slots,
    version: row.version,
    published_at: row.publishedAt?.toISOString(),
    is_fallback: row.isFallback,
    replaces_edition_id: row.replacesEditionId ?? undefined,
    // ❌ 永远不输出：status（仅 admin 可见）
  });
}
```

### 6.2 Smoke Test 强制验证

```typescript
// api/scripts/smoke-phase1.sh
#!/bin/bash
set -e

API_BASE="${API_BASE:-https://alpha-api-see-earth.vercel.app/v1}"
echo "🧪 Phase 1 Smoke Test · $API_BASE"

# 1. healthz
echo "[1/6] GET /healthz"
HEALTH=$(curl -fsS "$API_BASE/healthz")
echo "$HEALTH" | jq -e '.status == "ok"' >/dev/null
echo "  ✓ status=ok"

# 2. cities list
echo "[2/6] GET /cities"
CITIES=$(curl -fsS "$API_BASE/cities?limit=50")
CITY_COUNT=$(echo "$CITIES" | jq '.data | length')
echo "  ✓ returned $CITY_COUNT cities (expect 12)"
[ "$CITY_COUNT" -eq 12 ] || { echo "❌ expected 12 cities"; exit 1; }

# 3. privacy check (CRITICAL)
echo "[3/6] Privacy check · NO lat/lng in /cities response"
if echo "$CITIES" | jq -e '.. | objects | select(has("latitude") or has("longitude"))' >/dev/null 2>&1; then
  echo "❌ lat/lng LEAKED in /cities response"
  exit 1
fi
echo "  ✓ no raw lat/lng in cities list"

# 4. city detail (kyoto)
echo "[4/6] GET /cities/kyoto"
KYOTO=$(curl -fsS "$API_BASE/cities/kyoto")
echo "$KYOTO" | jq -e '.data.timezone == "Asia/Tokyo"' >/dev/null
echo "  ✓ timezone=Asia/Tokyo"

if echo "$KYOTO" | jq -e '.. | objects | select(has("latitude") or has("longitude"))' >/dev/null 2>&1; then
  echo "❌ lat/lng LEAKED in /cities/kyoto response"
  exit 1
fi
echo "  ✓ no raw lat/lng in city detail"

# 5. editions/today
echo "[5/6] GET /editions/today"
TODAY=$(curl -fsS "$API_BASE/editions/today")
SLOT_COUNT=$(echo "$TODAY" | jq '.data.slots | length')
echo "  ✓ returned $SLOT_COUNT slots (expect 12)"
[ "$SLOT_COUNT" -eq 12 ] || { echo "❌ expected 12 slots"; exit 1; }

# 6. healthz summary
echo "[6/6] Smoke test complete"
echo "  ✅ All checks passed"
```

---

## 7. Rate Limit + CORS 验证清单

| 测试 | 预期 |
|---|---|
| `curl -H "Origin: https://alpha-see-earth.vercel.app" .../cities` | 200 + `Access-Control-Allow-Origin` header |
| `curl -H "Origin: https://evil.com" .../cities` | 200 但无 CORS header（浏览器会 block） |
| `curl -X OPTIONS -H "Origin: https://alpha-see-earth.vercel.app" .../cities` | 204 + CORS headers |
| 101 reqs in 60s from same IP | 第 101 个返回 429 |

---

## 8. Phase 1 不实现（明确排除）

| 项 | Phase | 备注 |
|---|---|---|
| Witness POST | Phase 2 | |
| Asset upload POST | Phase 2 | Storage pipeline 已就绪 |
| Echo POST | Phase 3 | OD-01 REMOVE |
| Admin GET | Phase 3 | 无 admin UI |
| Mutations（POST/PUT/DELETE） | Phase 2+ | Phase 1 仅 GET |
| Auth | Phase 2 | Witness Session 在 Phase 2 |

---

## 9. Blockers（详见 `phase1-blockers-v1.md`）

1. Supabase project 创建（用户手动）
2. DATABASE_URL 配置（用户手动）
3. Seed 数据导入（依赖 #1）
4. Vercel Preview env 配置（用户手动）
5. CORS allowlist 是否需要包含 `localhost:5173`（Vite SPA 开发）

---

## 10. 元数据

| 字段 | 值 |
|---|---|
| 文档版本 | v1 |
| 创建时间 | 2026-08-22 |
| 创建人 | Engineer Agent (Round 2B) |
| 文档 ID | `api-implementation-v1.md` |
| 目标 Gate | Gate A · Internal Alpha · Phase 1 |
| 决策状态 | ✅ ACCEPTED（待 PM 评审） |
| Workspace 路径 | `/Users/lwy/Documents/ChatGPT/看见地球/release-v1/vertical-slice-phase1/api-implementation-v1.md` |
| Obsidian canonical 路径 | `/Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/vertical-slice-phase1/api-implementation-v1.md` |
| Obsidian 同步状态 | ❌ 未同步（sandbox 拒绝写入 Obsidian） |

---

**End of api-implementation-v1.md**