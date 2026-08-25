/* ============================================================
   SEE EARTH V1 · Shared API Contract · Common Primitives
   ------------------------------------------------------------
   - Version: 1.0.0 (2026-08-22 · E-P0-09)
   - Source of Truth: src/types/* + locationPrivacy.ts + D-P0-05 event map
   - Privacy boundary: any field containing precise location is GATED to
     internal/admin scope. Public API never returns these fields.
   ============================================================ */

import { z } from 'zod';

/* ---------- ID & Identifier primitives ---------- */

export const IdSchema = z.string().min(1).max(64).describe('Stable opaque ID (slug or uuid).');
export const CityIdSchema = IdSchema.describe('City identifier (matches City.id).');
export const MomentIdSchema = IdSchema.describe('Moment identifier (matches Moment.id).');
export const EditionIdSchema = IdSchema.describe('Edition / Daily 12 identifier.');
export const SubmissionIdSchema = IdSchema.describe('Witness Submission identifier.');
export const AssetIdSchema = IdSchema.describe('Uploaded Asset identifier.');
export const EchoIdSchema = IdSchema.describe('Echo identifier.');
export const SlugSchema = z
  .string()
  .min(1)
  .max(96)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u)
  .describe('URL-safe slug, lowercase letters / digits / hyphens.');

/* ---------- Locale / Language ---------- */

export const LocaleSchema = z.enum(['zh', 'en']).describe('UI locale. V1 supports zh + en.');
export const AppSurfaceSchema = z
  .enum([
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
  ])
  .describe('Entry surface enum. Mirrors D-P0-05 event map §5 surface enumeration.');

/* ---------- Time semantics ---------- */
/**
 * Time semantics (E-P0-04):
 * - All persisted timestamps are UTC ISO-8601 with offset (RFC 3339).
 * - Original timezone / offset is preserved as a sibling field for display.
 * - `captured_at` is the only field that determines NOW / TODAY / PAST bucketing.
 */
export const UtcTimestampSchema = z
  .string()
  .datetime({ offset: true })
  .describe('RFC 3339 timestamp with explicit offset (e.g. 2026-08-22T08:30:00+09:00).');

export const IanaTimezoneSchema = z
  .string()
  .regex(/^[A-Za-z_]+\/[A-Za-z_]+(?:\/[A-Za-z_]+)*$/u)
  .describe('IANA timezone identifier (e.g. Asia/Tokyo, Europe/Lisbon).');

export const CapturedAtSourceSchema = z
  .enum(['exif', 'camera', 'user_confirmed', 'admin', 'fallback_upload_time'])
  .describe('Provenance of captured_at: EXIF tag / device camera clock / user-confirmed manual input / admin override / fallback to upload time.');

export const CapturedAtConfidenceSchema = z
  .enum(['high', 'medium', 'low', 'untrusted'])
  .describe('Editorial trust level of captured_at; untrusted forces moderation path.');

/* ---------- Pagination ---------- */
/**
 * Pagination strategy (V1 default = cursor-based).
 * `offset` is allowed for editorial dashboards only and never for public feeds.
 */
export const PaginationCursorSchema = z
  .string()
  .min(1)
  .max(256)
  .optional()
  .describe('Opaque cursor returned by the previous page (omit on first page).');

export const PaginationLimitSchema = z
  .number()
  .int()
  .min(1)
  .max(100)
  .default(20)
  .describe('Max items per page; public defaults 20, Editorial dashboards may override up to 100.');

export const CursorPageInfoSchema = z
  .object({
    next_cursor: z.string().nullable(),
    has_more: z.boolean(),
  })
  .strict()
  .describe('Standard cursor pagination envelope.');

/* ---------- Error envelope (universal) ---------- */
/**
 * Universal error envelope (consistent across all endpoints):
 * - error_code: stable snake_case identifier; see error-code-dict-v1.md
 * - message: human-readable, localised; safe to surface to end users
 * - details: machine-readable context (free of PII / secrets)
 * - retryable: whether the client may retry without user intervention
 * - request_id: server correlation id (do NOT echo raw stack / trace)
 */
export const ErrorEnvelopeSchema = z
  .object({
    error_code: z.string().regex(/^[a-z][a-z0-9_]*$/u),
    message: z.string().min(1).max(512),
    details: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
    retryable: z.boolean(),
    request_id: z.string().min(1).max(128),
  })
  .strict()
  .describe('Universal error envelope. Returned by all endpoints on failure.');

export type ErrorEnvelope = z.infer<typeof ErrorEnvelopeSchema>;

/* ---------- Image variant ---------- */

export const ImageVariantSchema = z
  .object({
    variant: z.enum(['thumb_320', 'card_640', 'detail_1280', 'full_2560']),
    url: z.string().url(),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    mime: z.enum(['image/webp', 'image/jpeg', 'image/png', 'image/avif']),
    bytes: z.number().int().nonnegative().optional(),
  })
  .strict()
  .describe('Responsive image variant; V1 emits 4 sizes, modern format preferred.');

/* ---------- Rights / Credit (Moment shared) ---------- */

export const RightsStatusSchema = z
  .enum(['cc_by', 'cc_by_sa', 'cc0', 'all_rights_reserved', 'unknown'])
  .describe('Standard rights enum; V1 ingestion MUST populate before publish.');

export const CreditSchema = z
  .object({
    credit_line: z.string().min(1).max(256).describe('Human-readable credit, e.g. "Photo by Sorasak / Unsplash".'),
    source_url: z.string().url().optional().describe('Upstream source URL (for attribution / deletion requests).'),
    rights_status: RightsStatusSchema,
  })
  .strict();

/* ---------- Location privacy boundary ---------- */
/**
 * PUBLIC location scope (returned by every public endpoint):
 * - city_id, public_city_name, country_code, country_name (and optional admin1).
 *
 * INTERNAL location scope (returned only to moderator/admin via separate
 * authenticated endpoints; never returned by any public path):
 * - timezone, latitude, longitude, raw_coordinates, moment raw_location.
 *
 * The schema below is the FULL definition (server may emit either PublicCityLocation
 * or FullCityLocation depending on the actor's role; see web-ios-mapping-v1.md).
 */
export const PublicCityLocationSchema = z
  .object({
    city_id: CityIdSchema,
    public_city_name: z.string().min(1).max(128),
    country_code: z.string().length(2).describe('ISO 3166-1 alpha-2.'),
    country_name: z.string().min(1).max(128),
    admin1_name: z.string().min(1).max(128).optional(),
  })
  .strict()
  .describe('Public city-level location. Safe to expose on every public endpoint.');

export const RawCoordinatesSchema = z
  .object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  })
  .strict()
  .describe('Precise coordinates. INTERNAL ONLY — never returned by public endpoints.');

/* ---------- Layer enum (D-P0-01 §4 Locked) ---------- */

export const LayerSchema = z
  .enum(['blue', 'yellow', 'red'])
  .describe('City visual layer; LOCKED to exactly 3 values (D-P0-01 §4).');

/* ---------- Witness permission enums (D-P0-05 event map) ---------- */

export const WitnessPermissionTypeSchema = z.enum(['camera', 'photo_library', 'location']);
export const WitnessPermissionResultSchema = z.enum(['granted', 'denied', 'restricted', 'not_determined']);
export const WitnessMediaTypeSchema = z.enum(['photo_camera', 'photo_library', 'live_photo']);
export const WitnessNetworkClassSchema = z.enum(['wifi', 'cellular_4g_5g', 'cellular_3g', 'slow_2g', 'offline']);
export const WitnessLocationModeSchema = z.enum([
  'auto_gps_city',          // GPS succeeded, snapped to a public city
  'manual_city',            // Witness picked a city manually
  'denied_fallback_manual', // Location denied; user picked city manually
]);
export const WitnessErrorCategorySchema = z.enum([
  'validation',
  'upload_network',
  'upload_timeout',
  'server_5xx',
  'permission_blocked',
  'captured_at_invalid',
  'exif_untrusted',
  'rate_limited',
  'duplicate_submission',
  'unknown',
]);

/* ---------- Image processing options (Asset Upload) ---------- */

export const ImageProcessingSchema = z
  .object({
    strip_exif_gps: z.boolean().default(true).describe('Always strip GPS tags from public variants (E-P0-05).'),
    strip_exif_all: z.boolean().default(true).describe('Strip all EXIF tags except a small allow-list (camera model + datetime).'),
    generate_variants: z
      .array(z.enum(['thumb_320', 'card_640', 'detail_1280', 'full_2560']))
      .default(['thumb_320', 'card_640', 'detail_1280', 'full_2560'])
      .describe('Variant set to materialise; matching ImageVariantSchema enum.'),
    convert_to: z.enum(['webp', 'avif', 'jpeg']).default('webp').describe('Output codec for public variants.'),
  })
  .strict()
  .describe('Server-side image processing contract; matches E-P0-03 Witness backend.');

/* ---------- Audit / system timestamps ---------- */

export const AuditTimestampsSchema = z
  .object({
    created_at: UtcTimestampSchema,
    updated_at: UtcTimestampSchema,
  })
  .strict()
  .describe('Standard audit envelope on every persisted entity.');