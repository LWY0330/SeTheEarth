/* ============================================================
   SEE EARTH V1 · Shared API Contract · Echo Schema
   ------------------------------------------------------------
   - Version: 1.0.0 (2026-08-22 · E-P0-09)
   - Source of truth: src/components/ui/EchoInput.tsx (V1.6.4)
   - Privacy-sensitive free text; V1 launch must follow E-P1-01 backend plan
     or be safely degraded (no fake-success). See contract-decisions-v1.md.
   ============================================================ */

import { z } from 'zod';
import {
  EchoIdSchema,
  CityIdSchema,
  UtcTimestampSchema,
  LocaleSchema,
} from './common';

/* ---------- Echo enums ---------- */

export const EchoStatusSchema = z
  .enum([
    'queued_for_review',
    'accepted',
    'rejected',
    'rate_limited',
    'unavailable', // service degraded; UI must remove submit affordance (E-P1-01)
  ])
  .describe('Server-confirmed Echo state. UI may only show accepted / rate_limited; rest internal.');

export const EchoModerationDecisionSchema = z.enum(['accepted', 'rejected', 'escalated']);

/* ---------- Echo content limits ---------- */
/**
 * EchoInput.tsx defaults to 80 chars / "less than one line". Backend enforces
 * 200 chars (DB storage cap) but UI may enforce a smaller limit per locale.
 */
export const ECHO_LIMITS = Object.freeze({
  UI_DEFAULT_MAX_LENGTH: 80,        // matches EchoInput default
  SERVER_MAX_LENGTH: 200,           // hard cap
  MIN_LENGTH: 1,
});

export const EchoContentSchema = z
  .string()
  .min(ECHO_LIMITS.MIN_LENGTH)
  .max(ECHO_LIMITS.SERVER_MAX_LENGTH)
  .describe('Echo body. Always stored server-side; never returned to other users.');

/* ---------- Public Echo (returned only to the submitter) ---------- */
/**
 * IMPORTANT (E-P0-05 / forbidden-fields §F-12):
 *   - Public Echo responses never include the body text.
 *   - status_only payload is the canonical public surface.
 */
export const PublicEchoStatusOnlySchema = z
  .object({
    id: EchoIdSchema,
    city_id: CityIdSchema,
    status: EchoStatusSchema,
    submitted_at: UtcTimestampSchema.optional().describe('Server-confirmed acceptance timestamp.'),
    moderation_result: z
      .object({
        decision: EchoModerationDecisionSchema,
        decided_at: UtcTimestampSchema,
        public_reason: z.string().max(256).optional(),
      })
      .strict()
      .optional(),
  })
  .strict()
  .describe('Public-safe Echo. Body text NEVER included (only to the submitter, only via authenticated endpoint).');

/* ---------- Submitter-only Echo (auth required) ---------- */

export const SubmitterEchoSchema = PublicEchoStatusOnlySchema.extend({
  content_redacted: z
    .union([z.literal('present'), z.literal('under_review'), z.literal('purged')])
    .describe('Privacy-safe hint about content presence; body text still never returned.'),
  locale: LocaleSchema,
}).strict();

/* ---------- Request envelopes ---------- */

export const CreateEchoRequestSchema = z
  .object({
    city_id: CityIdSchema,
    content: EchoContentSchema,
    locale: LocaleSchema.default('zh'),
    /** Idempotency key — same as Witness. UUIDv4. */
    client_key: z
      .string()
      .min(8)
      .max(128)
      .regex(/^[A-Za-z0-9_:-]+$/u)
      .optional(),
  })
  .strict();

/* ---------- Response envelopes ---------- */

export const EchoEnvelopeSchema = z
  .object({
    data: SubmitterEchoSchema,
    request_id: z.string().min(1).max(128),
  })
  .strict();

export const EchoListEnvelopeSchema = z
  .object({
    data: z.array(PublicEchoStatusOnlySchema),
    page: z.object({
      next_cursor: z.string().nullable(),
      has_more: z.boolean(),
    }),
    request_id: z.string().min(1).max(128),
  })
  .strict();

/* ---------- Type exports ---------- */

export type EchoStatus = z.infer<typeof EchoStatusSchema>;
export type PublicEchoStatusOnly = z.infer<typeof PublicEchoStatusOnlySchema>;
export type SubmitterEcho = z.infer<typeof SubmitterEchoSchema>;
export type CreateEchoRequest = z.infer<typeof CreateEchoRequestSchema>;
export type EchoModerationDecision = z.infer<typeof EchoModerationDecisionSchema>;