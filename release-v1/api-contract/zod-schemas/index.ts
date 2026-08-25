/* ============================================================
   SEE EARTH V1 · Shared API Contract · Barrel Export
   ------------------------------------------------------------
   - Version: 1.0.0 (2026-08-22 · E-P0-09)
   - Single import surface for Web & iOS clients.
   - Each resource has a Public schema (canonical) + an Admin schema
     (role-gated). The PUBLIC schema is the only safe one to consume
     from anonymous or cross-user contexts.
   ============================================================ */

export * from './common';
export * from './city';
export * from './moment';
export * from './edition';
export * from './witness-submission';
export * from './asset-upload';
export * from './echo';

/* ---------- Version constant (single source of truth) ---------- */

export const CONTRACT_VERSION = '1.0.0';
export const CONTRACT_RELEASED_AT = '2026-08-22';
export const CONTRACT_STATUS = 'LOCKED' as const;

/* ---------- Top-level resource registration (used by OpenAPI emitter) ---------- */

import { PublicCitySchema, AdminCitySchema } from './city';
import { PublicMomentSchema, AdminMomentSchema } from './moment';
import { PublicEditionSchema, AdminEditionSchema } from './edition';
import {
  PublicWitnessSubmissionSchema,
  AdminWitnessSubmissionSchema,
  CreateWitnessSubmissionSchema,
  WitnessSubmissionStatusSchema,
  ALLOWED_TRANSITIONS,
} from './witness-submission';
import {
  AssetUploadRequestSchema,
  AssetUploadGrantSchema,
  PublicAssetSchema,
  AdminAssetSchema,
} from './asset-upload';
import {
  EchoContentSchema,
  CreateEchoRequestSchema,
  PublicEchoStatusOnlySchema,
  SubmitterEchoSchema,
} from './echo';
import { ErrorEnvelopeSchema } from './common';

export const RESOURCE_REGISTRY = Object.freeze({
  City: {
    Public: PublicCitySchema,
    Admin: AdminCitySchema,
  },
  Moment: {
    Public: PublicMomentSchema,
    Admin: AdminMomentSchema,
  },
  Edition: {
    Public: PublicEditionSchema,
    Admin: AdminEditionSchema,
  },
  WitnessSubmission: {
    Public: PublicWitnessSubmissionSchema,
    Admin: AdminWitnessSubmissionSchema,
    CreateRequest: CreateWitnessSubmissionSchema,
    StatusEnum: WitnessSubmissionStatusSchema,
    AllowedTransitions: ALLOWED_TRANSITIONS,
  },
  AssetUpload: {
    Public: PublicAssetSchema,
    Admin: AdminAssetSchema,
    RequestGrant: AssetUploadRequestSchema,
    Grant: AssetUploadGrantSchema,
  },
  Echo: {
    Submitter: SubmitterEchoSchema,
    Public: PublicEchoStatusOnlySchema,
    CreateRequest: CreateEchoRequestSchema,
    Content: EchoContentSchema,
  },
  Error: ErrorEnvelopeSchema,
});