/* ============================================================
   SEE EARTH V1 · E-P0-10 Phase 1 · Sentry Server-Side Init (stub)
   ------------------------------------------------------------
   - Source of truth: release-v1/e-p0-10-monitoring/
       error-categories-v1.md (5 top + 15 sub enum)
       privacy-baseline-v1.md (§2.4 server logger redaction)
       secret-management-v1.md (SENTRY_DSN is SERVER secret)
   - Phase 1 scope (this file):
       1. Sentry.init for Node.js runtime (Vercel Functions)
       2. Reuse ErrorCategory enum from client (mirror)
       3. logServerError(category, error, ctx) — single API for API handlers
       4. request_id 8-char base36 (matches error-categories §4)
       5. Console + Vercel Runtime Logs capture
   - Phase 2 (V1.1) will add: Slack/PagerDuty alert routing.
   - This is a V1 PREPARATION file. Server-side Sentry is NOT actively
     initialized in Phase 1 because no API routes exist yet. The init
     function is exported but no-op unless SENTRY_DSN env var is present.
   - No modification of E-P0-07 SDK files.
   ============================================================ */

import * as Sentry from '@sentry/node';

/* =========================================================================
   §1. ErrorCategory 镜像（与 src/lib/analytics/sentry-client.ts 完全一致）
   =========================================================================
   服务端不依赖前端 SDK（避免打包到 serverless bundle）· 直接镜像枚举。
   Source of truth: error-categories-v1.md §1.1
*/

export const ErrorCategoryTopSchema = {
  NETWORK: 'network',
  AUTH: 'auth',
  VALIDATION: 'validation',
  SERVER: 'server',
  CONTENT: 'content',
} as const;

export type ErrorCategoryTop =
  (typeof ErrorCategoryTopSchema)[keyof typeof ErrorCategoryTopSchema];

export const ErrorCategorySchema = {
  // network (5)
  NETWORK_TIMEOUT: 'network.timeout',
  NETWORK_OFFLINE: 'network.offline',
  NETWORK_CORS: 'network.cors',
  NETWORK_DNS: 'network.dns',
  NETWORK_TLS: 'network.tls',
  // auth (4)
  AUTH_DENIED: 'auth.denied',
  AUTH_EXPIRED: 'auth.expired',
  AUTH_MODERATOR_REQUIRED: 'auth.moderator_required',
  AUTH_ADMIN_REQUIRED: 'auth.admin_required',
  // validation (4)
  VALIDATION_EXIF_UNTRUSTED: 'validation.exif_untrusted',
  VALIDATION_CAPTURED_AT_INVALID: 'validation.captured_at_invalid',
  VALIDATION_DUPLICATE: 'validation.duplicate',
  VALIDATION_RATE_LIMITED: 'validation.rate_limited',
  // server (4)
  SERVER_5XX: 'server.5xx',
  SERVER_DB_ERROR: 'server.db_error',
  SERVER_QUEUE_FAIL: 'server.queue_fail',
  SERVER_IMAGE_PROCESSING_FAIL: 'server.image_processing_fail',
  // content (3)
  CONTENT_CITY_UNSUPPORTED: 'content.city_unsupported',
  CONTENT_MOMENT_WITHDRAWN: 'content.moment_withdrawn',
  CONTENT_NO_FALLBACK: 'content.no_fallback',
} as const;

export type ErrorCategory =
  (typeof ErrorCategorySchema)[keyof typeof ErrorCategorySchema];

const ERROR_CATEGORY_SET: ReadonlySet<string> = new Set(Object.values(ErrorCategorySchema));

/** 顶层解析 */
export function topOf(category: ErrorCategory): ErrorCategoryTop {
  const dot = category.indexOf('.');
  if (dot < 0) return category as ErrorCategoryTop;
  return category.slice(0, dot) as ErrorCategoryTop;
}

/** P0 判定（与 alert-policy-v1.md §2.1 一致） */
export function isP0Category(category: ErrorCategory): boolean {
  return (
    category === ErrorCategorySchema.NETWORK_CORS ||
    category === ErrorCategorySchema.NETWORK_TLS ||
    category === ErrorCategorySchema.SERVER_5XX ||
    category === ErrorCategorySchema.SERVER_DB_ERROR
  );
}

/* =========================================================================
   §2. request_id 8 字符 base36（与 error-categories §4 一致）
   =========================================================================
   Vercel 自动注入 `x-vercel-id` header · 取后 8 字符作为 request_id。
   缺失时自生成（hash of URL + timestamp）。
*/

import { createHash } from 'node:crypto';

export function shortRequestId(input: {
  category?: ErrorCategory;
  signature?: string;
  vercelId?: string;
  dayBucket?: string;
}): string {
  const day = input.dayBucket ?? new Date().toISOString().slice(0, 10);
  const payload = `${input.category ?? 'na'}|${input.signature ?? ''}|${input.vercelId ?? ''}|${day}`;
  // SHA-256 hex → 取前 13 hex → BigInt → base36 → padStart 8 → slice 8
  const hex = createHash('sha256').update(payload).digest('hex').slice(0, 13);
  return BigInt('0x' + hex).toString(36).padStart(8, '0').slice(0, 8);
}

/* =========================================================================
   §3. PII 脱敏（与客户端 redactPayload 等价 · 服务端版）
   =========================================================================
   服务端 logger 在写入 Vercel Runtime Logs 前调用 · 防止日志含 PII。
*/

const FORBIDDEN_KEYS: ReadonlySet<string> = new Set([
  'latitude', 'longitude', 'lat', 'lng', 'lon',
  'exif', 'gps_latitude', 'gps_longitude',
  'text', 'content', 'body', 'message', 'comment', 'caption',
  'user_id', 'uid', 'device_id', 'email', 'phone',
  'ip_address', 'ip', 'cookie',
  'image_token', 'cdn_token', 'signed_url',
  'user_agent', 'fingerprint',
]);

const PII_PATTERNS: ReadonlyArray<RegExp> = [
  /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g,
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g,
];

const REDACTED = '[REDACTED]';

function redactPayload(payload: unknown, depth = 0): unknown {
  if (depth > 8) return REDACTED;
  if (payload === null || payload === undefined) return payload;
  if (Array.isArray(payload)) return payload.map((v) => redactPayload(v, depth + 1));
  if (typeof payload === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(payload as Record<string, unknown>)) {
      if (FORBIDDEN_KEYS.has(k.toLowerCase())) {
        out[k] = REDACTED;
        continue;
      }
      out[k] = redactPayload(v, depth + 1);
    }
    return out;
  }
  if (typeof payload === 'string') {
    let s = payload;
    for (const re of PII_PATTERNS) s = s.replace(re, REDACTED);
    return s;
  }
  return payload;
}

/* =========================================================================
   §4. Sentry init + logServerError (主 API)
   =========================================================================
   用法（在 API handler 中）：
     import { initServerSentry, logServerError, ErrorCategorySchema } from './_lib/sentry-server';
     initServerSentry();
     try { ... } catch (e) {
       logServerError({
         category: ErrorCategorySchema.SERVER_5XX,
         error: e,
         requestId: req.headers['x-vercel-id'],
         component: 'edition-api',
       });
     }
*/

let _initialized = false;
let _sentryActive = false;

function getEnvName(): 'alpha' | 'beta' | 'production' | 'development' {
  const raw = process.env['VITE_ENV'] ?? process.env['VERCEL_ENV'] ?? 'development';
  if (raw === 'alpha' || raw === 'beta' || raw === 'production' || raw === 'development') {
    return raw as 'alpha' | 'beta' | 'production' | 'development';
  }
  return 'development';
}

export interface InitServerSentryOptions {
  dsn?: string;
  env?: 'alpha' | 'beta' | 'production' | 'development';
  release?: string;
  tracesSampleRate?: number;
}

export function initServerSentry(options: InitServerSentryOptions = {}): boolean {
  if (_initialized) return _sentryActive;

  const dsn = options.dsn ?? process.env['SENTRY_DSN'];
  const env = options.env ?? getEnvName();
  const release = options.release ?? process.env['VERCEL_GIT_COMMIT_SHA'] ?? 'dev';

  // Phase 1 行为：
  // - 无 SENTRY_DSN → no-op（不抛错）
  // - production 环境 → 不启用（V1.1 启用）
  if (!dsn) {
    _initialized = true;
    _sentryActive = false;
    return false;
  }

  if (env === 'production') {
    _initialized = true;
    _sentryActive = false;
    return false;
  }

  try {
    Sentry.init({
      dsn,
      environment: env,
      release,
      sendDefaultPii: false,
      tracesSampleRate: options.tracesSampleRate ?? 0.1,
      beforeSend(event) {
        try {
          if (event.extra) event.extra = redactPayload(event.extra) as Record<string, unknown>;
          if (event.tags) event.tags = redactPayload(event.tags) as Record<string, string>;
          if (event.breadcrumbs && Array.isArray(event.breadcrumbs)) {
            event.breadcrumbs = event.breadcrumbs.map((b: Record<string, unknown>) => ({
              ...b,
              data: b.data ? redactPayload(b.data) : undefined,
            })) as unknown as Sentry.Breadcrumb[];
          }
          if (event.request?.url) {
            try {
              const u = new URL(event.request.url);
              event.request.url = u.origin + u.pathname;
            } catch {
              event.request.url = REDACTED;
            }
          }
          if (event.request?.headers) {
            event.request.headers = redactPayload(event.request.headers) as Record<string, string>;
          }
          if (event.request?.cookies) event.request.cookies = REDACTED;
          event.user = undefined;
          return event;
        } catch {
          return null;
        }
      },
    });

    _initialized = true;
    _sentryActive = true;
    // eslint-disable-next-line no-console
    console.info(`[sentry-server] initialized for environment: ${env} (release: ${release})`);
    return true;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[sentry-server] init failed', err);
    _initialized = true;
    _sentryActive = false;
    return false;
  }
}

export interface LogServerErrorArgs {
  category: ErrorCategory;
  error: unknown;
  /** Vercel x-vercel-id header（自动由 Vercel 注入） */
  requestId?: string;
  /** API 路由 / handler 名（如 'edition-api'） */
  component: string;
  httpStatus?: number;
  context?: Record<string, unknown>;
}

export interface LogServerErrorResult {
  error_id: string;
  request_id: string;
  category: ErrorCategory;
  top: ErrorCategoryTop;
}

export function logServerError(args: LogServerErrorArgs): LogServerErrorResult {
  const err =
    args.error instanceof Error
      ? args.error
      : new Error(typeof args.error === 'string' ? args.error : 'Unknown error');

  // 未知 category → 标记但不 reject
  if (!ERROR_CATEGORY_SET.has(args.category)) {
    // eslint-disable-next-line no-console
    console.warn(`[sentry-server] unknown category: ${args.category}`);
  }

  const safeContext = args.context
    ? (redactPayload(args.context) as Record<string, unknown>)
    : undefined;

  const errorId = shortRequestId({
    category: args.category,
    signature: `${args.component}|${err.message.slice(0, 80)}|${args.httpStatus ?? ''}`,
    vercelId: args.requestId,
  });

  const requestId = shortRequestId({
    signature: args.requestId ?? 'no-vercel-id',
  });

  // 1. Sentry capture（如已初始化）
  if (_sentryActive) {
    try {
      Sentry.captureException(err, {
        tags: {
          error_category: args.category,
          error_top: topOf(args.category),
          error_id: errorId,
          request_id: requestId,
          see_earth_app: 'v1',
          see_earth_component: args.component,
          see_earth_env: getEnvName(),
        },
        extra: {
          http_status: args.httpStatus,
          ...(safeContext ?? {}),
        },
        level: isP0Category(args.category) ? 'error' : 'warning',
        fingerprint: [args.category, err.name ?? 'Error', errorId],
      });
    } catch (sentryErr) {
      // eslint-disable-next-line no-console
      console.error('[sentry-server] capture failed', sentryErr);
    }
  }

  // 2. Vercel Runtime Logs（自动 capture console.error）
  // eslint-disable-next-line no-console
  console.error(
    `[monitoring] ${isP0Category(args.category) ? '🔴' : '🟡'} ${args.category} · error_id: ${errorId} · request_id: ${requestId} · ${err.message}`,
    {
      component: args.component,
      httpStatus: args.httpStatus,
      context: safeContext,
    },
  );

  return {
    error_id: errorId,
    request_id: requestId,
    category: args.category,
    top: topOf(args.category),
  };
}

/* =========================================================================
   §5. Sentry middleware (Vercel Functions 包装)
   =========================================================================
   用法：
     import { withSentry } from './_lib/sentry-server';
     export default withSentry(async (req, res) => { ... });
*/

export interface VercelRequestLike {
  url?: string;
  method?: string;
  headers?: Record<string, string | string[] | undefined>;
}

export interface VercelResponseLike {
  statusCode?: number;
  setHeader?: (k: string, v: string) => void;
  end?: (body?: string) => void;
}

type Handler = (req: VercelRequestLike, res: VercelResponseLike) => Promise<void> | void;

export function withSentry(handler: Handler): Handler {
  return async (req, res) => {
    initServerSentry();
    try {
      await handler(req, res);
    } catch (err) {
      const result = logServerError({
        category: ErrorCategorySchema.SERVER_5XX,
        error: err,
        requestId: extractVercelId(req),
        component: req?.url ?? 'unknown-handler',
        httpStatus: res?.statusCode,
      });
      if (res?.setHeader) {
        res.setHeader('x-error-id', result.error_id);
      }
      if (res?.statusCode === undefined) {
        if (res?.setHeader) res.setHeader('content-type', 'application/json');
        res?.end?.(JSON.stringify({ error: 'internal_error', error_id: result.error_id }));
      } else {
        res?.end?.();
      }
    }
  };
}

function extractVercelId(req: VercelRequestLike): string | undefined {
  const headers = req?.headers ?? {};
  const id = headers['x-vercel-id'] ?? headers['x-request-id'];
  if (typeof id === 'string') return id;
  if (Array.isArray(id) && typeof id[0] === 'string') return id[0];
  return undefined;
}

/* =========================================================================
   §6. 默认导出
   =========================================================================*/

export default {
  init: initServerSentry,
  logError: logServerError,
  withSentry,
  shortRequestId,
  isP0Category,
  topOf,
  ErrorCategorySchema,
  ErrorCategoryTopSchema,
};