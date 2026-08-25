/* ============================================================
   SEE EARTH V1 · Shared API Contract · Moment Schema
   ------------------------------------------------------------
   - Version: 1.0.0 (2026-08-22 · E-P0-09)
   - Source of truth: src/types/moment.ts + D-P0-05 §5 field map + E-P0-04
   - Public Moment never contains raw_location or precise coords.
   - Editorial provenance / rights fields are required before publish.
   ============================================================ */

import { z } from 'zod';
import {
  CityIdSchema,
  MomentIdSchema,
  UtcTimestampSchema,
  IanaTimezoneSchema,
  CapturedAtSourceSchema,
  CapturedAtConfidenceSchema,
  ImageVariantSchema,
  CreditSchema,
  RightsStatusSchema,
} from './common';

/* ---------- Moment enums ---------- */

export const MomentMediaTypeSchema = z.enum(['image', 'video', 'audio', 'text']);

export const MomentSourceTypeSchema = z
  .enum(['reuters', 'ap', 'adobe', 'shutterstock', 'wikimedia', 'unsplash', 'manual'])
  .describe('Standardised source type (mirrors moment.ts MOMENT_SOURCE_TYPES).');

export const MomentProvenanceStatusSchema = z
  .enum(['self_reported', 'trusted_source', 'editorial', 'unknown'])
  .describe('Source provenance enum (matches moment.ts ProvenanceStatus).');

export const MomentModerationStatusSchema = z
  .enum(['pending', 'approved', 'rejected', 'flagged'])
  .describe('Editorial moderation state (matches moment.ts ModerationStatus).');

/**
 * D-P0-05 §5 alignment: source_type at the Domain layer uses the broader
 * witness/seed/editorial triad. Editorial CMS / Witness backend will map:
 *   - witness       → provenance_status = self_reported
 *   - seed          → provenance_status = trusted_source OR editorial
 *   - editorial     → provenance_status = editorial
 */
export const DomainSourceTypeSchema = z
  .enum(['witness', 'seed', 'editorial'])
  .describe('Domain-level source_type used by Web / iOS clients and Analytics payloads.');

/* ---------- Media + sources ---------- */

export const MomentMediaSchema = z
  .object({
    url: z.string().url(),
    type: MomentMediaTypeSchema,
    width: z.number().int().positive().optional(),
    height: z.number().int().positive().optional(),
    alt: z.string().min(1).max(256).optional().describe('Required when type = image or video.'),
    duration_seconds: z.number().int().positive().optional().describe('Required when type = video / audio.'),
  })
  .strict();

export const MomentSourceSchema = z
  .object({
    name: z.string().min(1).max(128),
    url: z.string().url().optional(),
    type: MomentSourceTypeSchema,
  })
  .strict();

/* ---------- Captions (i18n) ---------- */

export const MomentCaptionsSchema = z
  .object({
    zh: z.string().max(512).optional(),
    en: z.string().max(512).optional(),
  })
  .strict()
  .describe('Per-locale caption; at least one of zh/en should be populated.');

/* ---------- Editorial (city-scoped flavour) ---------- */

export const MomentEditorialCategorySchema = z
  .enum(['landmark', 'nature', 'street', 'culture', 'people', 'weather', 'other'])
  .describe('Editorial category for non-Witness content (Phase 0 LOCKED in momentEditorial.ts).');

/* ---------- Raw location (ADMIN ONLY — server MUST strip on public responses) ---------- */
/**
 * This object is RESTRICTED to moderator/admin scopes (see locationPrivacy.ts).
 * Server implementations must enforce a serializer that removes this object from
 * any public response. The schema is documented here for completeness; it is
 * NOT in PublicMoment.
 */
export const RawLocationSchema = z
  .object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    accuracy_m: z.number().nonnegative().optional(),
    altitude_m: z.number().optional(),
  })
  .strict()
  .describe('Precise coordinates. ADMIN ONLY. Never serialised to public endpoints.');

export const LocationVerificationSchema = z
  .object({
    status: z.enum(['verified', 'approximate', 'unverified']),
    verified_at: UtcTimestampSchema.optional(),
    method: z.enum(['gps', 'manual', 'inferred']).optional(),
  })
  .strict();

/* ---------- PublicMoment (canonical public response) ---------- */
/**
 * Public-safe Moment. EXACT field set used by Daily 12 / Moment Detail / CityPage.
 * Locked to:
 *   id, city_id, public_city_name, captured_at (+ source + confidence + tz),
 *   uploaded_at, published_at, image_variants[], source_type, rights, credit,
 *   captions, provenance_status, moderation_status, witness_id?, editorial?
 *
 * NOT included (see E-P0-05):
 *   raw_location, raw_exif, exact timezone offset beyond captured_at_source tz.
 */
export const PublicMomentSchema = z
  .object({
    id: MomentIdSchema,
    city_id: CityIdSchema,
    public_city_name: z.string().min(1).max(128).describe('Snapshot of city name at capture time.'),
    /** UTC ISO timestamp with original offset preserved. */
    captured_at: UtcTimestampSchema,
    /** Original timezone for human display (matches IanaTimezoneSchema). */
    captured_at_tz: IanaTimezoneSchema,
    captured_at_source: CapturedAtSourceSchema,
    captured_at_confidence: CapturedAtConfidenceSchema,
    uploaded_at: UtcTimestampSchema,
    published_at: UtcTimestampSchema.optional().describe('Absent until moderation approves.'),
    image_variants: z.array(ImageVariantSchema).min(1).max(8),
    /** Authoritative source_type for Web / iOS UI and Analytics. */
    source_type: DomainSourceTypeSchema,
    rights: RightsStatusSchema,
    credit: CreditSchema,
    captions: MomentCaptionsSchema.optional(),
    provenance_status: MomentProvenanceStatusSchema,
    moderation_status: MomentModerationStatusSchema,
    /** Witness identifier (omitted for editorial / seed; required for self_reported). */
    witness_id: z.string().min(1).max(64).optional(),
    editorial: z
      .object({
        category: MomentEditorialCategorySchema,
        note: z.string().max(512).optional(),
      })
      .strict()
      .optional(),
  })
  .strict()
  .describe('Public Moment. Never includes raw_location. Used by Daily 12 / Moment Detail / CityPage.');

/* ---------- AdminMoment (internal use) ---------- */

export const AdminMomentSchema = PublicMomentSchema.extend({
  raw_location: RawLocationSchema.optional(),
  location_verification: LocationVerificationSchema.optional(),
  sources: z.array(MomentSourceSchema).max(8).optional(),
  created_at: UtcTimestampSchema,
  updated_at: UtcTimestampSchema,
}).strict();

/* ---------- Request envelopes ---------- */

export const GetMomentQuerySchema = z
  .object({
    include_credit: z.boolean().default(true),
  })
  .strict();

export const ListMomentsForCityQuerySchema = z
  .object({
    /** Default = "approved" only. Editorial mode (admin) may pass other statuses. */
    moderation_status: MomentModerationStatusSchema.default('approved'),
    time_bucket: z.enum(['NOW', 'TODAY', 'PAST', 'ALL']).default('ALL'),
    limit: z.number().int().min(1).max(50).default(20),
    cursor: z.string().min(1).max(256).optional(),
  })
  .strict();

/* ---------- Response envelopes ---------- */

export const MomentEnvelopeSchema = z
  .object({
    data: PublicMomentSchema,
    request_id: z.string().min(1).max(128),
  })
  .strict();

export const MomentListEnvelopeSchema = z
  .object({
    data: z.array(PublicMomentSchema),
    page: z.object({
      next_cursor: z.string().nullable(),
      has_more: z.boolean(),
    }),
    request_id: z.string().min(1).max(128),
  })
  .strict();

/* ---------- Type exports ---------- */

export type PublicMoment = z.infer<typeof PublicMomentSchema>;
export type AdminMoment = z.infer<typeof AdminMomentSchema>;
export type MomentMedia = z.infer<typeof MomentMediaSchema>;
export type MomentSource = z.infer<typeof MomentSourceSchema>;
export type MomentCaptions = z.infer<typeof MomentCaptionsSchema>;
export type DomainSourceType = z.infer<typeof DomainSourceTypeSchema>;
export type RawLocation = z.infer<typeof RawLocationSchema>;
export type LocationVerification = z.infer<typeof LocationVerificationSchema>;