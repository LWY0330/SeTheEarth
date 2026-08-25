/* ============================================================
   SEE EARTH V1 · E-P0-07 Analytics · Zod Schema (source of truth)
   ------------------------------------------------------------
   - Version: 1.0.0 (2026-08-22)
   - Source: 07-设计师设计参考/release-v1/analytics-events/event-map-v1.md §5
   - Strict whitelist: ONLY fields listed in §5 of event-map allowed.
   - snake_case is locked; snake_case_event_name is locked.
   - Aligned with: release-v1/api-contract/zod-schemas/*.ts
     (AppSurface / WitnessMediaType / WitnessNetworkClass /
      WitnessLocationMode / WitnessErrorCategory / WitnessPermissionType /
      WitnessPermissionResult / Locale etc. reused from common.ts).
   ============================================================ */

import { z } from 'zod';

/* ---------- Shared enums (mirrors E-P0-09 common.ts + event-map §5) ---------- */

export const AppSurfaceSchema = z.enum([
  'web_homepage',
  'web_today_refresh',
  'web_moment_detail',
  'web_city_detail',
  'web_unknown',
  'web_echo',
  'web_witness',
  'ios_today',
  'ios_moment_detail',
  'ios_city_detail',
  'ios_unknown',
  'ios_echo',
  'ios_witness',
]);

export const SourceTypeSchema = z.enum(['witness', 'seed', 'editorial']);

export const CityLayerSchema = z.enum(['arrival', 'one_scene', 'same_second', 'echo']);

export const CitySectionSchema = z.enum(['arrival', 'one_scene', 'same_second', 'echo']);

export const WitnessEntryPointSchema = z.enum([
  'daily12_fab',
  'city_detail',
  'homepage_fab',
  'share_link',
  'deeplink',
]);

export const MomentEntryPointSchema = z.enum([
  'daily12',
  'city_detail',
  'unknown_reveal',
  'echo',
  'share_link',
  'deeplink',
]);

export const CityEntryPointSchema = z.enum([
  'moment_detail',
  'unknown_reveal',
  'same_second',
  'echo',
  'daily12_card',
  'deeplink',
]);

export const PermissionTypeSchema = z.enum(['camera', 'photo_library', 'location']);

export const PermissionResultSchema = z.enum(['granted', 'denied', 'restricted', 'not_determined']);

export const MediaTypeSchema = z.enum(['photo_camera', 'photo_library', 'live_photo']);

export const NetworkClassSchema = z.enum(['wifi', 'cellular_4g_5g', 'cellular_3g', 'slow_2g', 'offline']);

export const LocationModeSchema = z.enum(['auto_gps_city', 'manual_city', 'denied_fallback_manual']);

export const ErrorCategorySchema = z.enum([
  'validation',
  'upload_network',
  'upload_timeout',
  'server_5xx',
  'permission_blocked',
  'captured_at_invalid',
  'exif_untrusted',
  'rate_limited',
  'duplicate_submission',
]);

export const EchoResultSchema = z.enum(['accepted', 'queued_for_review', 'rate_limited']);

/* ---------- Common primitive fields ---------- */

/** Stable opaque ID. Mirrors E-P0-09 IdSchema. */
const Id = z.string().min(1).max(64);
/** Position in Daily 12 slot (1-12). Mirrors EditionSlot.position. */
const Position = z.number().int().min(1).max(12);

/* ---------- 14 P0 event schemas (per event-map §1-§4) ---------- */

/** §1.1 edition_viewed */
export const EditionViewedSchema = z
  .object({
    edition_id: Id.describe('Daily 12 edition identifier (Edition.id).'),
    app_surface: AppSurfaceSchema,
  })
  .strict();

/** §1.2 moment_impression */
export const MomentImpressionSchema = z
  .object({
    moment_id: Id,
    position: Position,
    city_id: Id,
    source_type: SourceTypeSchema,
    edition_id: Id.optional().describe('Required for server-side dedupe; optional in payload but attached at SDK.'),
  })
  .strict();

/** §1.3 moment_opened */
export const MomentOpenedSchema = z
  .object({
    moment_id: Id,
    city_id: Id,
    entry_point: MomentEntryPointSchema,
  })
  .strict();

/** §1.4 city_opened */
export const CityOpenedSchema = z
  .object({
    city_id: Id,
    entry_point: CityEntryPointSchema,
    layer: CityLayerSchema.optional(),
  })
  .strict();

/** §1.5 city_section_viewed */
export const CitySectionViewedSchema = z
  .object({
    city_id: Id,
    section: CitySectionSchema,
  })
  .strict();

/** §2.1 unknown_started */
export const UnknownStartedSchema = z
  .object({
    unknown_id: Id,
  })
  .strict();

/** §2.2 unknown_revealed */
export const UnknownRevealedSchema = z
  .object({
    unknown_id: Id,
    city_id: Id.optional().describe('Only present when reveal result contains a city.'),
  })
  .strict();

/** §3.1 echo_started */
export const EchoStartedSchema = z
  .object({
    city_id: Id,
  })
  .strict();

/** §3.2 echo_submitted */
export const EchoSubmittedSchema = z
  .object({
    city_id: Id,
    result: EchoResultSchema,
  })
  .strict();

/** §4.1 witness_started */
export const WitnessStartedSchema = z
  .object({
    entry_point: WitnessEntryPointSchema,
  })
  .strict();

/** §4.2 witness_permission_result */
export const WitnessPermissionResultSchema = z
  .object({
    permission_type: PermissionTypeSchema,
    result: PermissionResultSchema,
  })
  .strict();

/** §4.3 witness_upload_started */
export const WitnessUploadStartedSchema = z
  .object({
    media_type: MediaTypeSchema,
    network_class: NetworkClassSchema,
  })
  .strict();

/** §4.4 witness_submitted
 *  Note: submission_id is HASHED to 8-char prefix (forbidden-fields §5).
 *  The SDK never sees the raw submission_id; the hash is computed server-side
 *  by analytics receiver (HMAC-SHA256 with ANALYTICS_SALT, truncated to 8 hex).
 *  For Phase 1 mock, the SDK may accept a 8-char hex string produced by the
 *  `hashSubmissionId` helper in validators.ts. */
export const WitnessSubmittedSchema = z
  .object({
    submission_id: z
      .string()
      .regex(/^[a-f0-9]{8}$/u)
      .describe('Truncated 8-char HMAC-SHA256 hex of submission_id. Raw id never enters analytics.'),
    location_mode: LocationModeSchema,
  })
  .strict();

/** §4.5 witness_submit_failed */
export const WitnessSubmitFailedSchema = z
  .object({
    error_category: ErrorCategorySchema,
    retryable: z.boolean(),
    submission_id: z
      .string()
      .regex(/^[a-f0-9]{8}$/u)
      .optional()
      .describe('Truncated 8-char hash (only present if backend returned one).'),
  })
  .strict();

/* ---------- Event registry ---------- */

export const AnalyticsEventNameSchema = z.enum([
  'edition_viewed',
  'moment_impression',
  'moment_opened',
  'city_opened',
  'city_section_viewed',
  'unknown_started',
  'unknown_revealed',
  'echo_started',
  'echo_submitted',
  'witness_started',
  'witness_permission_result',
  'witness_upload_started',
  'witness_submitted',
  'witness_submit_failed',
]);

export type AnalyticsEventName = z.infer<typeof AnalyticsEventNameSchema>;

/* ---------- Event → schema map (immutable) ---------- */

export const EVENT_SCHEMAS: Readonly<Record<AnalyticsEventName, z.ZodTypeAny>> = Object.freeze({
  edition_viewed: EditionViewedSchema,
  moment_impression: MomentImpressionSchema,
  moment_opened: MomentOpenedSchema,
  city_opened: CityOpenedSchema,
  city_section_viewed: CitySectionViewedSchema,
  unknown_started: UnknownStartedSchema,
  unknown_revealed: UnknownRevealedSchema,
  echo_started: EchoStartedSchema,
  echo_submitted: EchoSubmittedSchema,
  witness_started: WitnessStartedSchema,
  witness_permission_result: WitnessPermissionResultSchema,
  witness_upload_started: WitnessUploadStartedSchema,
  witness_submitted: WitnessSubmittedSchema,
  witness_submit_failed: WitnessSubmitFailedSchema,
});

/* ---------- Derived TypeScript types ---------- */

export type EditionViewedProps = z.infer<typeof EditionViewedSchema>;
export type MomentImpressionProps = z.infer<typeof MomentImpressionSchema>;
export type MomentOpenedProps = z.infer<typeof MomentOpenedSchema>;
export type CityOpenedProps = z.infer<typeof CityOpenedSchema>;
export type CitySectionViewedProps = z.infer<typeof CitySectionViewedSchema>;
export type UnknownStartedProps = z.infer<typeof UnknownStartedSchema>;
export type UnknownRevealedProps = z.infer<typeof UnknownRevealedSchema>;
export type EchoStartedProps = z.infer<typeof EchoStartedSchema>;
export type EchoSubmittedProps = z.infer<typeof EchoSubmittedSchema>;
export type WitnessStartedProps = z.infer<typeof WitnessStartedSchema>;
export type WitnessPermissionResultProps = z.infer<typeof WitnessPermissionResultSchema>;
export type WitnessUploadStartedProps = z.infer<typeof WitnessUploadStartedSchema>;
export type WitnessSubmittedProps = z.infer<typeof WitnessSubmittedSchema>;
export type WitnessSubmitFailedProps = z.infer<typeof WitnessSubmitFailedSchema>;

/* ---------- Top-level envelope ---------- */

export const AnalyticsEventEnvelopeSchema = z
  .object({
    /** Stable snake_case event name (D-P0-05 §0). */
    event: AnalyticsEventNameSchema,
    /** ISO 8601 UTC timestamp when the event was triggered client-side. */
    ts: z.string().datetime({ offset: true }),
    /** SDK build / version. */
    sdk_version: z.string().regex(/^\d+\.\d+\.\d+$/u).default('1.0.0'),
    /** Alpha traffic tag. From VITE_ENV. */
    app_surface: AppSurfaceSchema,
    /** Stable per-session identifier (NOT persisted to server; only used for SDK dedupe).
     *  Server-side hash on receipt; raw session_id never leaves the device. */
    session_id: z.string().uuid().optional(),
    /** Free-form props bag. Validated against the per-event schema above. */
    props: z.record(z.string(), z.unknown()),
  })
  .strict();

export type AnalyticsEventEnvelope = z.infer<typeof AnalyticsEventEnvelopeSchema>;