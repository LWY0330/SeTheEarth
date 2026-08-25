/* ============================================================
   SEE EARTH V1 · Shared API Contract · Witness Submission Schema
   ------------------------------------------------------------
   - Version: 1.0.0 (2026-08-22 · E-P0-09)
   - Source of truth: Brief §5 E-P0-03 + E-P0-04 + D-P0-05 §4
   - 8-state machine:
 *     draft → uploading → submitted → under_review →
 *     (published | rejected | withdrawn | failed)
   - Idempotency: client_key is mandatory on every create + retry.
   ============================================================ */

import { z } from 'zod';
import {
  SubmissionIdSchema,
  CityIdSchema,
  AssetIdSchema,
  UtcTimestampSchema,
  CapturedAtSourceSchema,
  CapturedAtConfidenceSchema,
  IanaTimezoneSchema,
  WitnessMediaTypeSchema,
  WitnessLocationModeSchema,
  WitnessErrorCategorySchema,
} from './common';

/* ---------- 8-state machine ---------- */

export const WitnessSubmissionStatusSchema = z
  .enum([
    'draft',
    'uploading',
    'submitted',
    'under_review',
    'published',
    'rejected',
    'withdrawn',
    'failed',
  ])
  .describe('8-state lifecycle for a Witness Submission (per Brief §5 E-P0-03).');

export const WitnessSubmissionTransitionSchema = z
  .object({
    from: WitnessSubmissionStatusSchema,
    to: WitnessSubmissionStatusSchema,
    at: UtcTimestampSchema,
    reason: z.string().max(256).optional(),
  })
  .strict()
  .describe('Audit-grade transition log; optional on public responses, always on admin responses.');

/* ---------- Idempotency + metadata ---------- */

export const WitnessSubmissionClientKeySchema = z
  .string()
  .min(8)
  .max(128)
  .regex(/^[A-Za-z0-9_:-]+$/u)
  .describe('Client-generated idempotency key. UUIDv4 recommended. Reuse = retry, NOT duplicate.');

/* ---------- Location granularity ---------- */
/**
 * Witness submissions may be filed with three granularity tiers.
 * Only `public_city_id` + `captured_at_tz` are returned to other users / public listings.
 */
export const WitnessLocationClaimSchema = z
  .object({
    mode: WitnessLocationModeSchema,
    /** Required for any mode. Public city identity. */
    public_city_id: CityIdSchema,
    /** IANA tz for captured_at (mirrors Moment.captured_at_tz). */
    captured_at_tz: IanaTimezoneSchema,
    /**
     * Precise GPS: OPTIONAL — only retained server-side under restricted access.
     * Public responses NEVER include this object.
     */
    precise: z
      .object({
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
        accuracy_m: z.number().nonnegative().optional(),
      })
      .strict()
      .optional()
      .describe('ADMIN ONLY. Server strips from any non-admin response.'),
    /** Manual city confirmation timestamp if user re-picked. */
    confirmed_at: UtcTimestampSchema.optional(),
  })
  .strict();

/* ---------- Captured-at claim ---------- */

export const WitnessCapturedAtClaimSchema = z
  .object({
    captured_at: UtcTimestampSchema,
    captured_at_tz: IanaTimezoneSchema,
    captured_at_source: CapturedAtSourceSchema,
    captured_at_confidence: CapturedAtConfidenceSchema,
    /**
     * Raw EXIF payload for server-side EXIF validation.
     * Server extracts EXIF DateTimeOriginal, parses against tz, then STRIPS all EXIF
     * (including GPS) from the public variant. See E-P0-03 / E-P0-05.
     */
    exif_payload: z.record(z.string(), z.unknown()).optional().describe('Stripped after server-side parse; never persisted.'),
  })
  .strict();

/* ---------- Description (PII-sensitive — server stores; payload never echoes) ---------- */

export const WitnessDescriptionSchema = z
  .object({
    /** Plain-text ≤ 200 chars. Server runs moderation + retention rules. */
    text: z.string().min(0).max(200).default(''),
    /** Optional UI language for the description. */
    locale: z.enum(['zh', 'en']).default('zh'),
  })
  .strict()
  .describe('Optional short caption. Server stores; public API returns redacted form (see PublicWitnessSubmission).');

/* ---------- PublicWitnessSubmission (canonical public response) ---------- */
/**
 * Returned by every public Witness Submission endpoint (and to the submitter
 * for their own submission). Privacy boundary:
 *   - precise location, raw EXIF, description text are NEVER returned publicly.
 *   - description_redacted shows "—" or a privacy-safe hint, never the text.
 */
export const PublicWitnessSubmissionSchema = z
  .object({
    id: SubmissionIdSchema,
    client_key: WitnessSubmissionClientKeySchema.describe('Echoed for client-side dedup / retry.'),
    status: WitnessSubmissionStatusSchema,
    media_type: WitnessMediaTypeSchema,
    asset_id: AssetIdSchema.nullable().describe('Null until upload completes.'),
    location_mode: WitnessLocationModeSchema,
    public_city_id: CityIdSchema,
    captured_at: UtcTimestampSchema,
    captured_at_tz: IanaTimezoneSchema,
    captured_at_source: CapturedAtSourceSchema,
    captured_at_confidence: CapturedAtConfidenceSchema,
    description_redacted: z
      .union([z.literal('present'), z.literal('absent'), z.literal('under_review')])
      .describe('Privacy-safe hint about description; original text NEVER returned publicly.'),
    submitted_at: UtcTimestampSchema.optional(),
    moderation_result: z
      .object({
        decision: z.enum(['accepted', 'rejected', 'needs_more_info']),
        decided_at: UtcTimestampSchema,
        public_reason: z.string().max(256).optional().describe('Public-safe rationale (no internal moderation notes).'),
      })
      .strict()
      .optional(),
    error_category: WitnessErrorCategorySchema.optional().describe('Set when status ∈ {failed, rejected}.'),
  })
  .strict()
  .describe('Public-safe Witness Submission. Never contains precise coords, raw EXIF, or description text.');

/* ---------- AdminWitnessSubmission (moderator/admin only) ---------- */

export const AdminWitnessSubmissionSchema = PublicWitnessSubmissionSchema.extend({
  location: WitnessLocationClaimSchema,
  captured_at_claim: WitnessCapturedAtClaimSchema,
  description: WitnessDescriptionSchema,
  transitions: z.array(WitnessSubmissionTransitionSchema).optional(),
  witness_id: z.string().min(1).max(64).optional(),
  ip_hash: z.string().length(64).optional().describe('HMAC-SHA256 of submitter IP; raw IP never stored.'),
  user_agent_hash: z.string().length(64).optional(),
  created_at: UtcTimestampSchema,
  updated_at: UtcTimestampSchema,
}).strict();

/* ---------- Request envelopes ---------- */

export const CreateWitnessSubmissionSchema = z
  .object({
    client_key: WitnessSubmissionClientKeySchema,
    media_type: WitnessMediaTypeSchema,
    location: WitnessLocationClaimSchema,
    captured_at_claim: WitnessCapturedAtClaimSchema,
    description: WitnessDescriptionSchema.optional(),
  })
  .strict()
  .describe('Body for POST /v1/witness/submissions. Server returns PublicWitnessSubmission.');

export const UpdateWitnessSubmissionSchema = z
  .object({
    client_key: WitnessSubmissionClientKeySchema,
    status: z.enum(['withdrawn']).describe('Witnesses may only withdraw their own submission.'),
  })
  .strict();

/* ---------- Response envelopes ---------- */

export const WitnessSubmissionEnvelopeSchema = z
  .object({
    data: PublicWitnessSubmissionSchema,
    request_id: z.string().min(1).max(128),
  })
  .strict();

export const WitnessSubmissionListEnvelopeSchema = z
  .object({
    data: z.array(PublicWitnessSubmissionSchema),
    page: z.object({
      next_cursor: z.string().nullable(),
      has_more: z.boolean(),
    }),
    request_id: z.string().min(1).max(128),
  })
  .strict();

/* ---------- State machine guard (re-exported for runtime use) ---------- */

export const ALLOWED_TRANSITIONS: Readonly<
  Record<z.infer<typeof WitnessSubmissionStatusSchema>, ReadonlyArray<z.infer<typeof WitnessSubmissionStatusSchema>>>
> = Object.freeze({
  draft: ['uploading', 'withdrawn', 'failed'],
  uploading: ['submitted', 'failed'],
  submitted: ['under_review', 'rejected', 'failed'],
  under_review: ['published', 'rejected', 'needs_more_info', 'failed'],
  published: ['withdrawn', 'rejected'],
  rejected: [],
  withdrawn: [],
  failed: ['uploading'], // explicit retry only via fresh asset upload
});

/* ---------- Type exports ---------- */

export type WitnessSubmissionStatus = z.infer<typeof WitnessSubmissionStatusSchema>;
export type PublicWitnessSubmission = z.infer<typeof PublicWitnessSubmissionSchema>;
export type AdminWitnessSubmission = z.infer<typeof AdminWitnessSubmissionSchema>;
export type WitnessLocationClaim = z.infer<typeof WitnessLocationClaimSchema>;
export type WitnessCapturedAtClaim = z.infer<typeof WitnessCapturedAtClaimSchema>;
export type WitnessDescription = z.infer<typeof WitnessDescriptionSchema>;
export type CreateWitnessSubmission = z.infer<typeof CreateWitnessSubmissionSchema>;