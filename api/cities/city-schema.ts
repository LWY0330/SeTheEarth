import { z } from 'zod';

const CityPageStateSchema = z.enum([
  'A_seed_editorial',
  'B_active',
  'C_low_activity',
  'D_past_only',
  'E_empty',
]);

const CityVisualSchema = z
  .object({
    hero_media: z
      .object({
        url: z.string().url(),
        width: z.number().int().positive(),
        height: z.number().int().positive(),
        alt: z.string().min(1).max(256),
        focus: z.string().max(32).optional(),
      })
      .strict()
      .optional(),
    hero_source: z.string().max(512).optional(),
    hero_creator: z.string().max(128).optional(),
    hero_license: z.string().max(64).optional(),
    hero_credit_requirement: z.string().max(256).optional(),
    editorial_only: z.boolean().default(false),
    visual_status: z.enum(['seed', 'placeholder', 'none']).default('none'),
  })
  .strict();

// This deployment-local projection mirrors the locked public contract. Keeping
// runtime schemas inside api ensures Vercel can resolve their dependencies.
export const PublicCitySchema = z
  .object({
    id: z.string().min(1).max(64),
    slug: z
      .string()
      .min(1)
      .max(96)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u),
    names: z
      .object({
        canonical_name: z.string().min(1).max(128),
        name_zh: z.string().min(1).max(128),
        name_en: z.string().min(1).max(128),
        alternate_names: z.array(z.string().min(1).max(128)).optional(),
        country_zh: z.string().min(1).max(128),
        country_en: z.string().min(1).max(128),
      })
      .strict(),
    timezone: z
      .string()
      .regex(/^[A-Za-z_]+\/[A-Za-z_]+(?:\/[A-Za-z_]+)*$/u),
    layer: z.enum(['blue', 'yellow', 'red']),
    public_location_only: z.literal(true),
    page_state: CityPageStateSchema,
    visual: CityVisualSchema.optional(),
  })
  .strict();

export const CityListEnvelopeSchema = z
  .object({
    data: z.array(PublicCitySchema),
    page: z
      .object({
        next_cursor: z.string().nullable(),
        has_more: z.boolean(),
      })
      .strict(),
    request_id: z.string().min(1).max(128),
  })
  .strict();

export type PublicCity = z.infer<typeof PublicCitySchema>;
