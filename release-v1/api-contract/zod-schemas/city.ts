/* ============================================================
   SEE EARTH V1 · Shared API Contract · City Schema
   ------------------------------------------------------------
   - Version: 1.0.0 (2026-08-22 · E-P0-09)
   - Source of truth: src/types/city.ts (Phase 0 LOCKED 2026-08-19)
   - Public scope: every public endpoint must return only PublicCity (no raw coords).
   - Internal scope: AdminCity adds raw coordinates, ingestion metadata, audit trail.
   ============================================================ */

import { z } from 'zod';
import {
  CityIdSchema,
  SlugSchema,
  IanaTimezoneSchema,
  PublicCityLocationSchema,
  RawCoordinatesSchema,
  LayerSchema,
  UtcTimestampSchema,
  AuditTimestampsSchema,
} from './common';

/* ---------- City State enums (mirrors cityState.ts) ---------- */

export const CityStateLevelSchema = z
  .enum(['L0_mapped', 'L1_contextualized', 'L2_witnessed', 'L3_active', 'L4_living_archive'])
  .describe('Backend maturity enum (admin only — never returned to public users).');

export const CityPageStateSchema = z
  .enum(['A_seed_editorial', 'B_active', 'C_low_activity', 'D_past_only', 'E_empty'])
  .describe('Public product state (LOCKED in D-P0-01 §5). UI / cityPageRenderPlan reads this.');

/* ---------- Visual / Editorial seed ---------- */

export const VisualStatusSchema = z
  .enum(['seed', 'placeholder', 'none'])
  .describe('Hero availability for the city.');

export const HeroMediaSchema = z
  .object({
    url: z.string().url(),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    alt: z.string().min(1).max(256),
    focus: z.string().max(32).optional().describe('CSS object-position, e.g. "50% 30%".'),
  })
  .strict();

export const CityVisualSchema = z
  .object({
    hero_media: HeroMediaSchema.optional(),
    hero_source: z.string().max(512).optional(),
    hero_creator: z.string().max(128).optional(),
    hero_license: z.string().max(64).optional(),
    hero_credit_requirement: z.string().max(256).optional(),
    editorial_only: z.boolean().default(false),
    visual_status: VisualStatusSchema.default('none'),
  })
  .strict();

/* ---------- i18n names ---------- */
/**
 * Required on public endpoints; legacy canonical_name still returned for backward
 * compatibility (Web V1.6 currently reads canonical_name — see cityPageRenderPlan.ts).
 */
export const CityNamesSchema = z
  .object({
    canonical_name: z.string().min(1).max(128).describe('English / international canonical name.'),
    name_zh: z.string().min(1).max(128).describe('Localised Chinese name.'),
    name_en: z.string().min(1).max(128).describe('Localised English name.'),
    alternate_names: z.array(z.string().min(1).max(128)).optional(),
    country_zh: z.string().min(1).max(128).describe('Localised Chinese country name.'),
    country_en: z.string().min(1).max(128).describe('Localised English country name.'),
  })
  .strict();

/* ---------- MomentStats (admin only) ---------- */

export const MomentStatsSchema = z
  .object({
    moments_total: z.number().int().nonnegative(),
    moments_last_24h: z.number().int().nonnegative(),
    moments_last_7d: z.number().int().nonnegative(),
    moments_last_30d: z.number().int().nonnegative(),
    last_moment_at: UtcTimestampSchema.optional(),
    first_moment_at: UtcTimestampSchema.optional(),
    unique_witnesses_total: z.number().int().nonnegative().optional(),
    unique_witnesses_last_30d: z.number().int().nonnegative().optional(),
    witnessed_days_last_30d: z.number().int().min(0).max(30).optional(),
  })
  .strict()
  .describe('Operational city stats. Admin only — never on public endpoints.');

/* ---------- PublicCity (canonical public response) ---------- */
/**
 * Returned by every public City endpoint.
 * EXACTLY the field set D-P0-01 §4 LOCKED for the CityDetail page.
 */
export const PublicCitySchema = z
  .object({
    id: CityIdSchema,
    slug: SlugSchema,
    names: CityNamesSchema,
    timezone: IanaTimezoneSchema,
    layer: LayerSchema,
    /** Always true on public responses — assert at the boundary. */
    public_location_only: z.literal(true),
    page_state: CityPageStateSchema,
    visual: CityVisualSchema.optional(),
  })
  .strict()
  .describe('Public City resource. Never contains raw coordinates. Public-safe.');

/* ---------- AdminCity (internal use; moderator/admin) ---------- */
/**
 * Returned ONLY by internal endpoints behind role-based auth.
 * - Adds raw_coordinates, state_level, moment_stats, audit timestamps.
 * - Public endpoints MUST use PublicCity / PublicCityLocation instead.
 */
export const AdminCitySchema = PublicCitySchema.extend({
  raw_coordinates: RawCoordinatesSchema,
  country_code: z.string().length(2).describe('ISO 3166-1 alpha-2.'),
  admin1_code: z.string().max(32).optional(),
  admin1_name: z.string().max(128).optional(),
  place_type: z
    .enum(['city', 'town', 'natural_place', 'historic_site', 'coordinates'])
    .default('city')
    .describe('GeoNames place_type. V1 only emits city/town; others reserved for Phase 2.'),
  state_level: CityStateLevelSchema,
  moment_stats: MomentStatsSchema.optional(),
}).strict();

/* ---------- PublicCityLocation (lightweight location-only payload) ---------- */

export const PublicCityLocation = PublicCityLocationSchema;

/* ---------- City Query schemas (request envelopes) ---------- */

export const GetCityByIdQuerySchema = z
  .object({
    include_visual: z.boolean().default(true).describe('Include hero/visual block. Set false for list views.'),
  })
  .strict();

export const ListCitiesQuerySchema = z
  .object({
    layer: LayerSchema.optional(),
    page_state: CityPageStateSchema.optional(),
    country_code: z.string().length(2).optional(),
    limit: z.number().int().min(1).max(50).default(20),
    cursor: z.string().min(1).max(256).optional(),
  })
  .strict();

/* ---------- Endpoint response wrappers ---------- */

export const CityEnvelopeSchema = z
  .object({
    data: PublicCitySchema,
    request_id: z.string().min(1).max(128),
  })
  .strict();

export const CityListEnvelopeSchema = z
  .object({
    data: z.array(PublicCitySchema),
    page: z.object({
      next_cursor: z.string().nullable(),
      has_more: z.boolean(),
    }),
    request_id: z.string().min(1).max(128),
  })
  .strict();

/* ---------- Type exports (TS auto-generated by z.infer) ---------- */

export type PublicCity = z.infer<typeof PublicCitySchema>;
export type AdminCity = z.infer<typeof AdminCitySchema>;
export type CityNames = z.infer<typeof CityNamesSchema>;
export type CityPageState = z.infer<typeof CityPageStateSchema>;
export type CityStateLevel = z.infer<typeof CityStateLevelSchema>;
export type CityVisual = z.infer<typeof CityVisualSchema>;
export type HeroMedia = z.infer<typeof HeroMediaSchema>;
export type MomentStats = z.infer<typeof MomentStatsSchema>;

/** v1.0.0 audit envelope (audit not on public; admin only). */
export const AdminCityAuditSchema = AdminCitySchema.extend({
  ...AuditTimestampsSchema.shape,
}).strict();