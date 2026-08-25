/* ============================================================
   SEE EARTH V1 · Shared API Contract · Edition / Daily 12 Schema
   ------------------------------------------------------------
   - Version: 1.0.0 (2026-08-22 · E-P0-09)
   - Source of truth: Brief §5 E-P0-06 + D-P0-01 §P0-1 + event-map §5
   - 12 ordered slots, exactly 12 by default (V1), with fallback_reason
     explaining why a slot is missing (fallback Edition) or replaced.
   ============================================================ */

import { z } from 'zod';
import {
  EditionIdSchema,
  CityIdSchema,
  MomentIdSchema,
  UtcTimestampSchema,
} from './common';

/* ---------- Slot ---------- */
/**
 * Slot = single Daily 12 entry.
 * - position: 1..12 (1-indexed, locked).
 * - moment_id: nullable. null = placeholder/fallback.
 * - fallback_reason: required whenever moment_id is null.
 */
export const SlotFallbackReasonSchema = z
  .enum([
    'no_candidate_for_city',   // No eligible Moment for that city yet
    'withdrawn_by_author',     // Original Moment withdrawn
    'moderation_rejected',     // Post-publish takedown
    'missing_rights',          // Rights validation failed
    'duplicate_in_edition',    // Same Moment already in another slot
    'time_bucket_invalid',     // captured_at failed editorial validation
    'fallback_curated',        // Editorial filled with seed/curated content
  ])
  .describe('Editorial reason a slot is empty (must be present when moment_id is null).');

export const EditionSlotSchema = z
  .object({
    position: z.number().int().min(1).max(12).describe('1-indexed slot position; 1 = lead slot.'),
    moment_id: MomentIdSchema.nullable().describe('Null when slot is a fallback placeholder.'),
    city_id: CityIdSchema.nullable().describe('Required when moment_id is non-null.'),
    fallback_reason: SlotFallbackReasonSchema.nullable().describe('Required when moment_id is null; null otherwise.'),
    /** True if the slot is filled with Editorial / Seed content (not Witness). */
    is_editorial_fill: z.boolean().default(false),
  })
  .strict()
  .refine(
    (slot) => (slot.moment_id === null) === (slot.fallback_reason !== null),
    { message: 'fallback_reason must be present iff moment_id is null.' },
  )
  .refine(
    (slot) => slot.moment_id !== null && slot.city_id === null
      ? false
      : slot.moment_id === null && slot.city_id !== null
        ? false
        : true,
    { message: 'city_id and moment_id must both be set or both null.' },
  );

/* ---------- Edition / Daily 12 ---------- */

export const EditionStatusSchema = z
  .enum(['draft', 'preview', 'scheduled', 'published', 'replaced', 'retracted'])
  .describe('Editorial lifecycle. Public clients only see published/replaced.');

export const PublicEditionSchema = z
  .object({
    id: EditionIdSchema,
    /** Local date in target reference timezone (ISO date, e.g. 2026-08-22). */
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/u)
      .describe('Edition calendar date (Edition-date, not publish timestamp).'),
    slots: z.array(EditionSlotSchema).length(12).describe('Exactly 12 slots, ordered by position.'),
    /** Monotonic version number; bumped on each republish / rollback. */
    version: z.number().int().min(1),
    published_at: UtcTimestampSchema.optional().describe('First time this version was published; absent for draft.'),
    /** True if this Edition is itself a fallback for an earlier date. */
    is_fallback: z.boolean().default(false),
    /** Original Edition id being substituted, when is_fallback = true. */
    replaces_edition_id: EditionIdSchema.optional(),
  })
  .strict()
  .describe('Daily 12 Edition. 12 slots. Public endpoints must return only published / replaced editions.');

export const AdminEditionSchema = PublicEditionSchema.extend({
  status: EditionStatusSchema,
  created_at: UtcTimestampSchema,
  updated_at: UtcTimestampSchema,
}).strict();

/* ---------- Request envelopes ---------- */

export const GetTodayEditionQuerySchema = z
  .object({
    /** If absent, return the published Edition for the current reference day. */
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/u)
      .optional(),
    include_fallback: z.boolean().default(true).describe('Return the fallback Edition if no primary exists.'),
  })
  .strict();

export const ListEditionsQuerySchema = z
  .object({
    from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/u).optional(),
    to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/u).optional(),
    limit: z.number().int().min(1).max(50).default(20),
    cursor: z.string().min(1).max(256).optional(),
  })
  .strict();

/* ---------- Response envelopes ---------- */

export const EditionEnvelopeSchema = z
  .object({
    data: PublicEditionSchema,
    request_id: z.string().min(1).max(128),
  })
  .strict();

export const EditionListEnvelopeSchema = z
  .object({
    data: z.array(PublicEditionSchema),
    page: z.object({
      next_cursor: z.string().nullable(),
      has_more: z.boolean(),
    }),
    request_id: z.string().min(1).max(128),
  })
  .strict();

/* ---------- Type exports ---------- */

export type EditionSlot = z.infer<typeof EditionSlotSchema>;
export type PublicEdition = z.infer<typeof PublicEditionSchema>;
export type AdminEdition = z.infer<typeof AdminEditionSchema>;
export type SlotFallbackReason = z.infer<typeof SlotFallbackReasonSchema>;
export type EditionStatus = z.infer<typeof EditionStatusSchema>;