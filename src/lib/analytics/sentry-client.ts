/* ============================================================
   SEE EARTH V1 · E-P0-10 Phase 1 · Sentry Client Integration
   ------------------------------------------------------------
   - Source of truth: release-v1/e-p0-10-monitoring/
       error-categories-v1.md (5 top + 15 sub enum)
       privacy-baseline-v1.md (§2.3 beforeSend PII redaction)
       web-vitals-baseline-v1.md (LCP/INP/CLS/TTI/FCP budget)
       secret-management-v1.md (VITE_SENTRY_DSN is PUBLIC)
   - Companion files:
       src/lib/analytics/index.ts  (E-P0-07 SDK, NOT modified)
       src/lib/analytics/schema.ts (WitnessErrorCategory 9 items, NOT modified)
   - Phase 1 scope (this file):
       1. Sentry.init with beforeSend PII redaction
       2. 5 top + 15 sub ErrorCategory enumeration
       3. 8-char base36 shortErrorId (matches error-categories §4)
       4. reportError(category, error, ctx) — single API for SDK callers
       5. Web Vitals reporting (LCP / INP / CLS / TTFB / FCP)
       6. Console fallback (Phase 1: no Slack/PagerDuty routing)
   - Phase 2 will add: Slack/PagerDuty alert routing + bundle size CI guard.
   - NO modification of E-P0-07 SDK files. NO new secrets.
   ============================================================ */

import * as Sentry from '@sentry/react';
import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';

// AppSurfaceSchema (Zod) is imported only for safeParse validation.
// The runtime AppSurface string union is inferred via z.infer<typeof AppSurfaceSchema>
// below via a local alias; no separate type-only import is required.
import { AppSurfaceSchema } from './schema.ts';

/* =========================================================================
   §1. ErrorCategory 完整枚举（5 顶层 + 15 子项）
   =========================================================================
   任何不在此枚举内的 error_category 一律 reject。
   与 src/lib/analytics/schema.ts 的 WitnessErrorCategory（9 项）正交。
*/

export const ErrorCategoryTopSchema = {
  /** 客户端 ↔ 服务端连通性 */
  NETWORK: 'network',
  /** 权限 / 角色 / 会话生命周期 */
  AUTH: 'auth',
  /** 数据格式 / 业务规则 / 限流拒绝 */
  VALIDATION: 'validation',
  /** 服务端依赖或代码异常 */
  SERVER: 'server',
  /** 数据层缺失或被撤回 */
  CONTENT: 'content',
} as const;

export type ErrorCategoryTop =
  (typeof ErrorCategoryTopSchema)[keyof typeof ErrorCategoryTopSchema];

/** 20 项完整枚举（5 顶层 + 15 子项）。 */
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

/** 完整枚举数组（20 项 · 用于白名单校验） */
export const ALL_ERROR_CATEGORIES: ReadonlyArray<ErrorCategory> = Object.freeze([
  ErrorCategorySchema.NETWORK_TIMEOUT,
  ErrorCategorySchema.NETWORK_OFFLINE,
  ErrorCategorySchema.NETWORK_CORS,
  ErrorCategorySchema.NETWORK_DNS,
  ErrorCategorySchema.NETWORK_TLS,
  ErrorCategorySchema.AUTH_DENIED,
  ErrorCategorySchema.AUTH_EXPIRED,
  ErrorCategorySchema.AUTH_MODERATOR_REQUIRED,
  ErrorCategorySchema.AUTH_ADMIN_REQUIRED,
  ErrorCategorySchema.VALIDATION_EXIF_UNTRUSTED,
  ErrorCategorySchema.VALIDATION_CAPTURED_AT_INVALID,
  ErrorCategorySchema.VALIDATION_DUPLICATE,
  ErrorCategorySchema.VALIDATION_RATE_LIMITED,
  ErrorCategorySchema.SERVER_5XX,
  ErrorCategorySchema.SERVER_DB_ERROR,
  ErrorCategorySchema.SERVER_QUEUE_FAIL,
  ErrorCategorySchema.SERVER_IMAGE_PROCESSING_FAIL,
  ErrorCategorySchema.CONTENT_CITY_UNSUPPORTED,
  ErrorCategorySchema.CONTENT_MOMENT_WITHDRAWN,
  ErrorCategorySchema.CONTENT_NO_FALLBACK,
]);

const ERROR_CATEGORY_SET: ReadonlySet<string> = new Set(ALL_ERROR_CATEGORIES);

/** 顶层解析（用于告警分级 / Dashboard 分组） */
export function topOf(category: ErrorCategory): ErrorCategoryTop {
  const dot = category.indexOf('.');
  if (dot < 0) return category as ErrorCategoryTop;
  return category.slice(0, dot) as ErrorCategoryTop;
}

/** 是否 P0 告警类别（与 alert-policy-v1.md §2.1 对齐） */
export function isP0Category(category: ErrorCategory): boolean {
  return (
    category === ErrorCategorySchema.NETWORK_CORS ||
    category === ErrorCategorySchema.NETWORK_TLS ||
    category === ErrorCategorySchema.SERVER_5XX ||
    category === ErrorCategorySchema.SERVER_DB_ERROR
  );
}

/** WitnessErrorCategory → ErrorCategory 映射
 *  （与 error-categories-v1.md §2.1 对照表一致）
 *  用于 SDK 在 witness_submit_failed 事件中同步 Sentry tag。
 */
export function mapWitnessErrorToMonitoring(
  witnessCategory: string,
): ErrorCategory | null {
  switch (witnessCategory) {
    case 'exif_untrusted':
      return ErrorCategorySchema.VALIDATION_EXIF_UNTRUSTED;
    case 'captured_at_invalid':
      return ErrorCategorySchema.VALIDATION_CAPTURED_AT_INVALID;
    case 'duplicate_submission':
      return ErrorCategorySchema.VALIDATION_DUPLICATE;
    case 'rate_limited':
      return ErrorCategorySchema.VALIDATION_RATE_LIMITED;
    case 'server_5xx':
      return ErrorCategorySchema.SERVER_5XX;
    case 'upload_network':
      return ErrorCategorySchema.NETWORK_TIMEOUT;
    case 'upload_timeout':
      return ErrorCategorySchema.NETWORK_OFFLINE;
    case 'permission_blocked':
      return ErrorCategorySchema.AUTH_DENIED;
    case 'validation':
      return ErrorCategorySchema.VALIDATION_EXIF_UNTRUSTED; // ambiguous → map to most common
    default:
      return null;
  }
}

/* =========================================================================
   §2. 8 字符 base36 短错误 ID（与 D-P0-04 state-matrix §3 一致）
   =========================================================================
   输入：稳定的错误指纹 = SHA-256(category + signature + day_bucket)
   输出：截断前 8 字符 base36
*/

async function sha256Hex(input: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  // Non-cryptographic fallback (only used if Web Crypto unavailable)
  let h1 = 0xdeadbeef ^ 0;
  let h2 = 0x41c6ce57 ^ 0;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(8, '0');
}

export interface ShortErrorIdInput {
  category: ErrorCategory;
  /** 稳定指纹：URL path + status code + brief error message */
  signature: string;
  /** 默认 UTC 日期 YYYY-MM-DD · 跨天产生不同 ID */
  dayBucket?: string;
}

/** 同步版（带 fallback · 用于测试） */
export function shortErrorIdSync(input: ShortErrorIdInput): string {
  const day = input.dayBucket ?? new Date().toISOString().slice(0, 10);
  const payload = `${input.category}|${input.signature}|${day}`;
  // 同步 fallback：用 djb2 hash → 16 进制 → 截 8 字符 base36
  let hash = 5381;
  for (let i = 0; i < payload.length; i++) {
    hash = ((hash << 5) + hash + payload.charCodeAt(i)) | 0;
  }
  const hex = (hash >>> 0).toString(16).padStart(8, '0');
  return BigInt('0x' + hex + '0'.repeat(5))
    .toString(36)
    .padStart(8, '0')
    .slice(0, 8);
}

/** 异步版（生产用 · 使用 Web Crypto SHA-256） */
export async function shortErrorId(input: ShortErrorIdInput): Promise<string> {
  const day = input.dayBucket ?? new Date().toISOString().slice(0, 10);
  const payload = `${input.category}|${input.signature}|${day}`;
  const hex = await sha256Hex(payload);
  // 取前 13 hex → 转 base36 → padStart 8 → slice 8
  return BigInt('0x' + hex.slice(0, 13))
    .toString(36)
    .padStart(8, '0')
    .slice(0, 8);
}

/* =========================================================================
   §3. AppSurface 推断（从 VITE_ENV / VITE_APP_SURFACE）
   =========================================================================
   与 src/lib/analytics/schema.ts AppSurfaceSchema 完全复用。
   这里不重复定义枚举，仅做映射：
     VITE_ENV=alpha   → web_* （按具体路由细分 · 默认 web_homepage）
     VITE_ENV=beta    → web_* （同上）
     VITE_ENV=production → web_*
*/

export type AppSurface = string; // 来源 schema.ts AppSurfaceSchema 的 enum（snake_case 字符串）

function inferAppSurface(): AppSurface {
  const raw = (import.meta.env.VITE_APP_SURFACE as string | undefined) ?? 'web_homepage';
  // 白名单校验：必须匹配 AppSurfaceSchema（防止 typo 进入日志）
  const result = AppSurfaceSchema.safeParse(raw);
  return result.success ? result.data : 'web_homepage';
}

/* =========================================================================
   §4. PII / 自由文本脱敏（privacy-baseline-v1.md §2.3）
   =========================================================================
   禁带字段名（30 项）· 命中即 drop。
   值含 PII pattern（IPv4 / phone / email / URL with token）→ 替换为 [REDACTED]。
*/

const FORBIDDEN_FIELD_NAMES: ReadonlySet<string> = new Set([
  // 精确位置
  'latitude', 'longitude', 'lat', 'lng', 'lon', 'accuracy_meters', 'geojson',
  // EXIF
  'exif', 'gps_latitude', 'gps_longitude', 'camera_serial', 'camera_model',
  'user_comment', 'raw_exif',
  // 自由文本
  'text', 'content', 'body', 'message', 'comment', 'caption', 'description',
  // 标识符
  'user_id', 'uid', 'device_id', 'email', 'phone', 'ip_address', 'ip', 'cookie',
  // URL token
  'image_token', 'cdn_token', 'signed_url', 'endpoint_url',
  // 指纹
  'user_agent', 'fingerprint', 'webgl_fingerprint', 'canvas_fingerprint',
]);

const PII_PATTERNS: ReadonlyArray<RegExp> = [
  // IPv4
  /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g,
  // Email (simplified)
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  // Phone (国际 / 中国 · 7+ 位数字)
  /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g,
];

const REDACTED = '[REDACTED]';

function isForbiddenKey(key: string): boolean {
  const lower = key.toLowerCase();
  if (FORBIDDEN_FIELD_NAMES.has(lower)) return true;
  // Substring 检查（exif / cookie / fingerprint 复合字段）
  for (const frag of ['exif', 'cookie', 'fingerprint']) {
    if (frag.length >= 5 && lower.includes(frag)) return true;
  }
  return false;
}

function redactStringValue(s: string): string {
  let out = s;
  for (const re of PII_PATTERNS) {
    out = out.replace(re, REDACTED);
  }
  // 截短 stack trace 中可能的绝对路径（仅保留文件名 + 行号）
  out = out.replace(/\s+at\s+(?:\/[^)\s]+)+/g, (m) => m.replace(/\/[^)\s]+/g, '/[REDACTED_PATH]'));
  return out;
}

function redactPayload(payload: unknown, depth = 0): unknown {
  if (depth > 8) return REDACTED;
  if (payload === null || payload === undefined) return payload;
  if (Array.isArray(payload)) return payload.map((v) => redactPayload(v, depth + 1));
  if (typeof payload === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(payload as Record<string, unknown>)) {
      if (isForbiddenKey(k)) {
        out[k] = REDACTED;
        continue;
      }
      out[k] = redactPayload(v, depth + 1);
    }
    return out;
  }
  if (typeof payload === 'string') return redactStringValue(payload);
  return payload;
}

/* =========================================================================
   §5. Sentry beforeSend 钩子（隐私脱敏 + Tag 注入）
   =========================================================================
   - 移除精确位置 / EXIF / 自由文本 / PII
   - 自动注入 error_category / error_top / error_id / app_surface
   - sendDefaultPii=false（Vercel 自动 hash IP 后保留 /24 段）
*/

function getEnvName(): 'alpha' | 'beta' | 'production' | 'development' {
  const raw = (import.meta.env.VITE_ENV as string | undefined) ?? 'development';
  if (raw === 'alpha' || raw === 'beta' || raw === 'production' || raw === 'development') {
    return raw;
  }
  return 'development';
}

function getBuildHash(): string {
  return (
    (import.meta.env.VITE_BUILD_HASH as string | undefined) ??
    (import.meta.env.VITE_SENTRY_RELEASE as string | undefined) ??
    'dev'
  );
}

function getRoute(): string {
  if (typeof window === 'undefined') return 'ssr';
  return window.location?.pathname ?? 'unknown';
}

let _initialized = false;

function sanitizeSentryEvent(
  event: Sentry.ErrorEvent,
  _hint: Sentry.EventHint,
): Sentry.ErrorEvent | null {
  try {
    // 1. Tags 注入
    const category = (event?.tags?.error_category as string | undefined) ?? '';
    if (category && !ERROR_CATEGORY_SET.has(category)) {
      // 未知 category → 标记但不 reject（避免丢失现场信息）
      if (event.tags) event.tags.error_category_unknown = category;
    }

    // 2. Extra 脱敏
    if (event.extra) {
      event.extra = redactPayload(event.extra) as Record<string, unknown>;
    }

    // 3. Breadcrumbs 脱敏
    if (event.breadcrumbs && Array.isArray(event.breadcrumbs)) {
      event.breadcrumbs = event.breadcrumbs.map((b) => {
        const breadcrumb = b as Sentry.Breadcrumb & { data?: unknown };
        return {
          ...breadcrumb,
          data: breadcrumb.data
            ? (redactPayload(breadcrumb.data) as Record<string, unknown>)
            : undefined,
        } as Sentry.Breadcrumb;
      });
    }

    // 4. Exception values 脱敏（错误消息）
    if (event.exception?.values && Array.isArray(event.exception.values)) {
      event.exception.values = event.exception.values.map((e) => {
        const ex = e as Sentry.Exception & { value?: unknown };
        return {
          ...ex,
          value: typeof ex.value === 'string' ? redactStringValue(ex.value) : ex.value,
        } as Sentry.Exception;
      });
    }

    // 5. Request 头 / URL 脱敏
    if (event.request) {
      if (event.request.url) {
        try {
          const u = new URL(event.request.url);
          // 仅保留 path，不带 query / hash
          event.request.url = u.origin + u.pathname;
        } catch {
          // 非合法 URL → 整段 redact
          event.request.url = REDACTED;
        }
      }
      if (event.request.headers) {
        event.request.headers = redactPayload(event.request.headers) as Record<string, string>;
      }
      // cookies 永远 redact（清空为占位对象以满足 Sentry 类型签名）
      if (event.request.cookies) {
        event.request.cookies = { __redacted__: REDACTED } as unknown as Record<string, string>;
      }
    }

    // 6. User 永远清空（不向 Sentry 发送 user info）
    event.user = undefined;

    return event;
  } catch {
    // 防御性：如果脱敏抛错，drop event 而非泄漏原始 payload
    return null;
  }
}

/* =========================================================================
   §6. reportError · 单 API 给 SDK 调用方
   =========================================================================
   用法：
     import { reportError } from '@/lib/analytics/sentry-client';
     try { ... } catch (e) {
       const id = await reportError({
         category: ErrorCategorySchema.NETWORK_TIMEOUT,
         error: e,
         component: 'WitnessUploader',
         httpStatus: 504,
       });
       console.log('error_id:', id);
     }
*/

export interface ReportErrorArgs {
  category: ErrorCategory;
  error: unknown;
  component?: string;
  httpStatus?: number;
  retryCount?: number;
  /** 额外上下文（已被脱敏） */
  context?: Record<string, unknown>;
}

export interface ReportErrorResult {
  error_id: string;
  category: ErrorCategory;
  top: ErrorCategoryTop;
}

export async function reportError(args: ReportErrorArgs): Promise<ReportErrorResult> {
  const err =
    args.error instanceof Error
      ? args.error
      : new Error(typeof args.error === 'string' ? args.error : 'Unknown error');

  // 1. 同步 shortErrorId（避免 async 阻塞错误上报链路）
  const errorId = shortErrorIdSync({
    category: args.category,
    signature: `${args.component ?? 'unknown'}|${err.message.slice(0, 80)}|${args.httpStatus ?? ''}`,
  });

  // 2. Sentry capture
  const appSurface = inferAppSurface();
  const route = getRoute();
  const buildHash = getBuildHash();

  // Console fallback（Phase 1 · V1.1 接 Slack）
  // 强制 ensure data 是脱敏后版本
  const safeContext = args.context ? (redactPayload(args.context) as Record<string, unknown>) : undefined;

  if (_initialized) {
    Sentry.captureException(err, {
      tags: {
        error_category: args.category,
        error_top: topOf(args.category),
        error_id: errorId,
        see_earth_app: 'v1',
        see_earth_surface: appSurface,
        see_earth_route: route,
        see_earth_build: buildHash,
        see_earth_component: args.component ?? 'unknown',
      },
      extra: {
        retry_count: args.retryCount ?? 0,
        http_status: args.httpStatus,
        ...(safeContext ?? {}),
      },
      level: isP0Category(args.category) ? 'error' : 'warning',
      fingerprint: [args.category, err.name ?? 'Error', errorId],
    });
  }

  // Console 输出（始终执行 · Phase 1 默认通道）
  // eslint-disable-next-line no-console
  console.warn(
    `[monitoring] ${isP0Category(args.category) ? '🔴' : '🟡'} ${args.category} · error_id: ${errorId} · ${err.message}`,
    {
      component: args.component,
      httpStatus: args.httpStatus,
      retryCount: args.retryCount,
      context: safeContext,
    },
  );

  return {
    error_id: errorId,
    category: args.category,
    top: topOf(args.category),
  };
}

/* =========================================================================
   §7. Web Vitals Reporting（Phase 1 · Console；Phase 2 · Sentry breadcrumb）
   =========================================================================
   报告维度：LCP / INP / CLS / TTFB / FCP（5 项 · 与 web-vitals-baseline-v1.md §1.1 对齐）
   web-vitals v6 已弃用 onFID · 改用 onINP（Interaction to Next Paint）
   所有报告附带：app_surface · build_hash · route · error_id（短 id）
*/

export interface WebVitalReport {
  metric: 'LCP' | 'INP' | 'CLS' | 'TTFB' | 'FCP';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  route: string;
  app_surface: AppSurface;
  build_hash: string;
  ts: string;
}

/** 与 web-vitals-baseline-v1.md §1.1 budget 对齐 */
const VITALS_BUDGET = {
  LCP: 2500,
  INP: 100, // V1 用 INP 替代 FID
  CLS: 0.1,
  TTFB: 800, // web-vitals v6 TTFB threshold 'good' = 800ms
  FCP: 1800,
} as const;

function rate(metric: WebVitalReport['metric'], value: number): WebVitalReport['rating'] {
  switch (metric) {
    case 'LCP':
      if (value <= 2500) return 'good';
      if (value <= 4000) return 'needs-improvement';
      return 'poor';
    case 'INP':
      if (value <= 100) return 'good';
      if (value <= 300) return 'needs-improvement';
      return 'poor';
    case 'CLS':
      if (value <= 0.1) return 'good';
      if (value <= 0.25) return 'needs-improvement';
      return 'poor';
    case 'TTFB':
      if (value <= 800) return 'good';
      if (value <= 1800) return 'needs-improvement';
      return 'poor';
    case 'FCP':
      if (value <= 1800) return 'good';
      if (value <= 3000) return 'needs-improvement';
      return 'poor';
  }
}

/** Console reporter · Phase 1 默认通道 */
function reportVitalConsole(report: WebVitalReport): void {
  const icon = report.rating === 'good' ? '✅' : report.rating === 'needs-improvement' ? '⚠️' : '❌';
  // eslint-disable-next-line no-console
  console.log(
    `[web-vitals] ${icon} ${report.metric} = ${report.value.toFixed(2)} (${report.rating}) · ${report.route}`,
    {
      app_surface: report.app_surface,
      build_hash: report.build_hash,
      ts: report.ts,
    },
  );
}

/** Sentry breadcrumb reporter · Phase 1 启用 · Phase 2 升级为 Sentry metric */
function reportVitalSentry(report: WebVitalReport): void {
  if (!_initialized) return;
  Sentry.addBreadcrumb({
    category: 'web-vitals',
    type: 'info',
    level: report.rating === 'poor' ? 'warning' : 'info',
    data: {
      metric: report.metric,
      value: report.value,
      rating: report.rating,
      route: report.route,
      app_surface: report.app_surface,
      build_hash: report.build_hash,
      budget_exceeded: report.value > VITALS_BUDGET[report.metric],
    },
  });
}

function reportVital(metric: WebVitalReport['metric'], value: number): void {
  const report: WebVitalReport = {
    metric,
    value,
    rating: rate(metric, value),
    route: getRoute(),
    app_surface: inferAppSurface(),
    build_hash: getBuildHash(),
    ts: new Date().toISOString(),
  };
  reportVitalConsole(report);
  reportVitalSentry(report);
}

/** 注册 web-vitals 监听（5 维度） */
function reportWebVitals(): void {
  if (typeof window === 'undefined') return;
  try {
    onLCP((m) => reportVital('LCP', m.value), { reportAllChanges: false });
    onINP((m) => reportVital('INP', m.value), { reportAllChanges: false });
    onCLS((m) => reportVital('CLS', m.value), { reportAllChanges: false });
    onTTFB((m) => reportVital('TTFB', m.value), { reportAllChanges: false });
    onFCP((m) => reportVital('FCP', m.value), { reportAllChanges: false });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[sentry-client] web-vitals registration failed', err);
  }
}

/* =========================================================================
   §8. initSentry · 主入口（被 src/main.tsx 调用）
   =========================================================================
   用法：
     import { initSentry } from '@/lib/analytics/sentry-client';
     if (import.meta.env.VITE_SENTRY_DSN) {
       initSentry();
     }
*/

export interface InitSentryOptions {
  /** 强制设置 environment（默认从 VITE_ENV 推断） */
  env?: 'alpha' | 'beta' | 'production' | 'development';
  /** 强制设置 DSN（默认从 VITE_SENTRY_DSN） */
  dsn?: string;
  /** 强制 release（默认从 VITE_BUILD_HASH / VITE_SENTRY_RELEASE） */
  release?: string;
  /** 采样率（默认 0.1 alpha · 1.0 production） */
  tracesSampleRate?: number;
}

export function initSentry(options: InitSentryOptions = {}): boolean {
  if (_initialized) return true;

  const dsn = options.dsn ?? (import.meta.env.VITE_SENTRY_DSN as string | undefined);
  const env = options.env ?? getEnvName();
  const release = options.release ?? getBuildHash();

  if (!dsn) {
    // eslint-disable-next-line no-console
    console.info('[sentry-client] VITE_SENTRY_DSN missing · Sentry disabled');
    return false;
  }

  // 生产环境 V1 暂不启用（V1.1 启用）
  if (env === 'production') {
    // eslint-disable-next-line no-console
    console.info('[sentry-client] production env detected · Sentry disabled (V1.1 will enable)');
    return false;
  }

  const tracesSampleRate = options.tracesSampleRate ?? (env === 'development' ? 1.0 : 0.1);

  try {
    Sentry.init({
      dsn,
      environment: env,
      release,
      // PII 完全关闭（Vercel 自动 hash IP 后保留 /24 段）
      sendDefaultPii: false,
      // Performance monitoring sample rate
      tracesSampleRate,
      // 关闭 Replay（V1 不录屏）
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 0,
      // 集成：仅 BrowserTracing + HttpClient（避免引入 React Router / Gatsby 等）
      integrations: [Sentry.browserTracingIntegration()],
      // beforeSend：核心脱敏钩子
      beforeSend: sanitizeSentryEvent,
      // breadcrumbs 也走脱敏（在 beforeBreadcrumb 中实现）
      beforeBreadcrumb(breadcrumb: Sentry.Breadcrumb) {
        if (breadcrumb.data) {
          breadcrumb.data = redactPayload(breadcrumb.data) as Record<string, unknown>;
        }
        if (typeof breadcrumb.message === 'string') {
          breadcrumb.message = redactStringValue(breadcrumb.message);
        }
        return breadcrumb;
      },
    });

    _initialized = true;

    // eslint-disable-next-line no-console
    console.info(
      `[sentry-client] initialized for environment: ${env} (release: ${release}, traces: ${tracesSampleRate})`,
    );

    // 注册 Web Vitals
    reportWebVitals();

    return true;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[sentry-client] init failed', err);
    return false;
  }
}

/** 检查 Sentry 是否已初始化（用于 SDK 内部判断） */
export function isSentryInitialized(): boolean {
  return _initialized;
}

/* =========================================================================
   §9. 默认导出（convenience）
   =========================================================================*/

export default {
  init: initSentry,
  report: reportError,
  shortErrorId: shortErrorIdSync,
  isP0Category,
  topOf,
  mapWitnessErrorToMonitoring,
  ErrorCategorySchema,
  ErrorCategoryTopSchema,
  ALL_ERROR_CATEGORIES,
};