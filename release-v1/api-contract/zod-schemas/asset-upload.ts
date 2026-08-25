/* ============================================================
   SEE EARTH V1 · Shared API Contract · Asset Upload Schema
   ------------------------------------------------------------
   - Version: 1.0.0 (2026-08-22 · E-P0-09)
   - Source of truth: Brief §5 E-P0-03 (asset upload + EXIF stripping)
   - Two-step flow:
 *     1. Client POSTs /v1/assets/upload-url with media_type + checksum + size
 *     2. Server returns short-lived upload_url + asset_id
 *     3. Client PUTs the binary directly (no auth headers in URL body)
 *     4. Client confirms upload completion via /v1/assets/{id}/complete
   ============================================================ */

import { z } from 'zod';
import {
  AssetIdSchema,
  SubmissionIdSchema,
  UtcTimestampSchema,
  WitnessMediaTypeSchema,
  ImageProcessingSchema,
} from './common';

/* ---------- Asset status ---------- */

export const AssetStatusSchema = z
  .enum(['requested', 'pending_upload', 'uploaded', 'processing', 'ready', 'failed', 'purged'])
  .describe('Asset lifecycle. Public clients only ever see ready/failed.');

/* ---------- Upload request ---------- */

export const AssetUploadRequestSchema = z
  .object({
    /** Reference back to the parent Submission (optional during draft stage). */
    submission_id: SubmissionIdSchema.optional(),
    media_type: WitnessMediaTypeSchema,
    /** Byte size of the original. Server validates against max_size. */
    size_bytes: z.number().int().positive(),
    /** sha256 hex digest (lowercase, 64 chars). Strongly recommended; idempotency anchor. */
    checksum_sha256: z
      .string()
      .regex(/^[a-f0-9]{64}$/u)
      .describe('SHA-256 of the original binary (lowercase hex). Strongly recommended for idempotency.'),
    mime: z.enum(['image/jpeg', 'image/png', 'image/heic', 'image/webp']).describe('V1 whitelist.'),
    /** Width / height (optional, server re-validates). */
    width: z.number().int().positive().optional(),
    height: z.number().int().positive().optional(),
    /** Server returns the matching ImageProcessingSchema (image stripping policy). */
    processing: ImageProcessingSchema.optional(),
  })
  .strict();

/* ---------- Upload grant (server response) ---------- */

export const AssetUploadGrantSchema = z
  .object({
    asset_id: AssetIdSchema,
    upload_url: z.string().url().describe('Short-lived signed PUT URL (≤ 5 min TTL by default).'),
    /** Hard expiry timestamp (UTC). Client MUST upload before this moment. */
    expires_at: UtcTimestampSchema,
    /** Echo of the server-enforced size cap (bytes). */
    max_size: z.number().int().positive(),
    /** Echo of the mime whitelist applicable to this grant. */
    mime_whitelist: z.array(z.string().min(1).max(64)).min(1),
    /** Required HTTP headers for the PUT (e.g. Content-Type, x-amz-acl). */
    required_headers: z.record(z.string().min(1).max(64), z.string().min(1).max(256)).default({}),
    processing: ImageProcessingSchema,
  })
  .strict()
  .describe('Server-issued upload grant. Short-lived; never logged.');

/* ---------- Complete-upload confirmation ---------- */

export const AssetCompleteRequestSchema = z
  .object({
    /** Echoed checksum for verification. Server rejects if mismatch. */
    checksum_sha256: z.string().regex(/^[a-f0-9]{64}$/u),
    /** Reported by client after upload — server cross-checks. */
    size_bytes: z.number().int().positive(),
  })
  .strict();

/* ---------- Public Asset (returned by GET /v1/assets/{id}) ---------- */
/**
 * Public Asset metadata. NEVER returns upload_url or raw binary.
 * Image variants are public CDN URLs (with EXIF GPS already stripped — E-P0-05).
 */
export const PublicAssetSchema = z
  .object({
    id: AssetIdSchema,
    media_type: WitnessMediaTypeSchema,
    status: AssetStatusSchema,
    mime: z.string().min(1).max(64),
    width: z.number().int().positive().optional(),
    height: z.number().int().positive().optional(),
    bytes: z.number().int().nonnegative(),
    variants: z
      .array(
        z.object({
          variant: z.enum(['thumb_320', 'card_640', 'detail_1280', 'full_2560']),
          url: z.string().url(),
          width: z.number().int().positive(),
          height: z.number().int().positive(),
          mime: z.string().min(1).max(64),
        }).strict(),
      )
      .default([]),
    /** True if server confirmed GPS / camera serial EXIF were stripped. */
    exif_stripped: z.boolean().default(true),
    created_at: UtcTimestampSchema,
    updated_at: UtcTimestampSchema,
  })
  .strict()
  .describe('Public Asset metadata. Variants are EXIF-stripped CDN URLs.');

/* ---------- Admin Asset ---------- */

export const AdminAssetSchema = PublicAssetSchema.extend({
  submission_id: SubmissionIdSchema.optional(),
  raw_checksum_sha256: z.string().regex(/^[a-f0-9]{64}$/u).optional(),
  uploaded_ip_hash: z.string().length(64).optional(),
  retention_until: UtcTimestampSchema.optional().describe('Hard retention deadline.'),
}).strict();

/* ---------- Default server limits (constants) ---------- */

export const ASSET_DEFAULTS = Object.freeze({
  MAX_SIZE_BYTES: 25 * 1024 * 1024,             // 25 MiB
  MIN_SIZE_BYTES: 8 * 1024,                     //  8 KiB (rejects empty / corrupt)
  UPLOAD_URL_TTL_SECONDS: 5 * 60,               // 5 minutes
  ALLOWED_MIME: ['image/jpeg', 'image/png', 'image/heic', 'image/webp'] as const,
});

/* ---------- Request envelopes ---------- */

export const AssetUploadEnvelopeSchema = z
  .object({
    data: AssetUploadGrantSchema,
    request_id: z.string().min(1).max(128),
  })
  .strict();

export const AssetEnvelopeSchema = z
  .object({
    data: PublicAssetSchema,
    request_id: z.string().min(1).max(128),
  })
  .strict();

/* ---------- Type exports ---------- */

export type AssetStatus = z.infer<typeof AssetStatusSchema>;
export type AssetUploadRequest = z.infer<typeof AssetUploadRequestSchema>;
export type AssetUploadGrant = z.infer<typeof AssetUploadGrantSchema>;
export type PublicAsset = z.infer<typeof PublicAssetSchema>;
export type AdminAsset = z.infer<typeof AdminAssetSchema>;