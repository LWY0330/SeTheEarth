---
title: SEE EARTH V1 · Shared API Contract · Schema Changelog · v1.0.0
type: schema-changelog
tags: [release-v1, e-p0-09, api-contract, changelog, see-earth]
task_id: E-P0-09
brief_anchor: "Release Strategy Brief §5 E-P0-09"
track: engineering
owner: Engineer Agent #3 (external Owner = 用户)
created: 2026-08-22
status: LOCKED · v1.0.0 first pass
target_gate: Gate A · Internal Alpha
source_brief: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/SEE-EARTH-Release-Strategy-v1-Design-Engineering-Task-Brief.md
source_task_card: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/06-PM Agent 交接/2026-08-22-task-card-e-p0-09-shared-api-contract.md
related_docs:
  - ./openapi.yaml
  - ./zod-schemas/*
  - ./contract-decisions-v1.md
  - ./web-ios-mapping-v1.md
  - ./error-code-dict-v1.md
depends_on: [E-P0-01 (✓ ACCEPTED), D-P0-02 (IN PROGRESS)]
blocks: [E-P0-02, E-P0-03, E-P0-07, D-P0-05-impl, D-P1-01]
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/06-PM Agent 交接/release-v1/api-contract/schema-changelog-v1.md
note: 本文件已就绪，需 PM Agent 由 Obsidian 写入权限落地到 canonical 路径。
---

# SEE EARTH V1 · Shared API Contract · Schema Changelog

> **追踪所有 contract 字段 / endpoint / 枚举的版本化变更**
> **版本规则**：semver（MAJOR.MINOR.PATCH），详见 `contract-decisions-v1.md §12`
> **当前版本**：`1.0.0`
> **审阅窗口**：Beta 前每次变更需 PM + Designer + Engineer 共同签字

---

## 阅读指南

每条变更条目：

| 字段 | 含义 |
|---|---|
| **Date** | 变更生效日期 |
| **Version** | 变更后版本号 |
| **Kind** | ADDED / CHANGED / DEPRECATED / REMOVED / FIXED / SECURITY |
| **Scope** | 受影响资源（City / Moment / Edition / WitnessSubmission / AssetUpload / Echo / Common） |
| **Breaking** | 是否破坏性变更（MAJOR bump） |
| **Owner** | 变更提议人 + 签字人 |
| **Description** | 变更内容 |

---

## [1.0.0] · 2026-08-22 · INITIAL LOCK

**Kind**：INITIAL · **Breaking**：N/A · **Owner**：Engineer Agent #3

> E-P0-09 first pass。Round 2A 派发子代理交付的初始 lock 版本。所有字段 / endpoint / 枚举与既有 `src/types/*`、D-P0-01 设计冻结、D-P0-05 event map §5 完全对齐。

### 资源定义（6 项）

| 资源 | Zod schema | OpenAPI | Public field count | Admin field count | Status |
|---|---|---|---:|---:|---|
| City | `zod-schemas/city.ts` | `#/components/schemas/PublicCity` | 11 | 19 | LOCKED |
| Moment | `zod-schemas/moment.ts` | `#/components/schemas/PublicMoment` | 17 | 23 | LOCKED |
| Edition / Daily 12 | `zod-schemas/edition.ts` | `#/components/schemas/PublicEdition` | 7 (12 slots) | 10 | LOCKED |
| Witness Submission | `zod-schemas/witness-submission.ts` | `#/components/schemas/PublicWitnessSubmission` | 13 | 25 | LOCKED |
| Asset Upload | `zod-schemas/asset-upload.ts` | `#/components/schemas/AssetUploadGrant` | 9 | 12 | LOCKED |
| Echo | `zod-schemas/echo.ts` | `#/components/schemas/SubmitterEcho` | 5 | 7 | LOCKED |

### Endpoint（13 项）

| Method | Path | Operation | Public/Admin |
|---|---|---|---|
| GET | `/v1/cities` | `listCities` | Public |
| GET | `/v1/cities/{cityIdOrSlug}` | `getCity` | Public |
| GET | `/v1/cities/{cityIdOrSlug}/moments` | `listMomentsForCity` | Public |
| GET | `/v1/moments/{momentId}` | `getMoment` | Public |
| GET | `/v1/editions/today` | `getTodayEdition` | Public |
| GET | `/v1/editions/{editionId}` | `getEditionById` | Public |
| GET | `/v1/editions` | `listEditions` | Public |
| POST | `/v1/witness/submissions` | `createWitnessSubmission` | Witness session |
| GET | `/v1/witness/submissions` | `listWitnessSubmissions` | Witness session |
| GET | `/v1/witness/submissions/{submissionId}` | `getWitnessSubmission` | Witness session |
| PATCH | `/v1/witness/submissions/{submissionId}` | `updateWitnessSubmission` | Witness session |
| POST | `/v1/assets/upload-url` | `requestAssetUploadUrl` | Witness session |
| GET | `/v1/assets/{assetId}` | `getAsset` | Public |
| POST | `/v1/assets/{assetId}/complete` | `completeAssetUpload` | Witness session |
| POST | `/v1/echoes` | `createEcho` | Bearer (anon allowed) |
| GET | `/v1/echoes/{echoId}` | `getEcho` | Bearer |
| GET | `/v1/admin/cities/{cityIdOrSlug}` | `adminGetCity` | Moderator / Admin |
| GET | `/v1/admin/moments/{momentId}` | `adminGetMoment` | Moderator / Admin |
| GET | `/v1/admin/witness/submissions/{submissionId}` | `adminGetWitnessSubmission` | Moderator / Admin |
| GET | `/v1/healthz` | `getHealth` | Public |

### 枚举（22 项）

| Enum | Values | Source |
|---|---|---|
| `Locale` | `zh, en` | New |
| `AppSurface` | 13 values | D-P0-05 §5 |
| `Layer` | `blue, yellow, red` | D-P0-01 §4 LOCKED |
| `CityPageState` | `A_seed_editorial, B_active, C_low_activity, D_past_only, E_empty` | `src/types/cityState.ts` |
| `CityStateLevel` | `L0_mapped, L1_contextualized, L2_witnessed, L3_active, L4_living_archive` | `src/types/cityState.ts` |
| `CapturedAtSource` | `exif, camera, user_confirmed, admin, fallback_upload_time` | New (E-P0-04) |
| `CapturedAtConfidence` | `high, medium, low, untrusted` | New (E-P0-04) |
| `RightsStatus` | `cc_by, cc_by_sa, cc0, all_rights_reserved, unknown` | `src/types/moment.ts` |
| `MomentMediaType` | `image, video, audio, text` | `src/types/moment.ts` |
| `MomentSourceType` | `reuters, ap, adobe, shutterstock, wikimedia, unsplash, manual` | `src/types/moment.ts` |
| `DomainSourceType` | `witness, seed, editorial` | New (D-P0-05 §5 mapping) |
| `MomentProvenanceStatus` | `self_reported, trusted_source, editorial, unknown` | `src/types/moment.ts` |
| `MomentModerationStatus` | `pending, approved, rejected, flagged` | `src/types/moment.ts` |
| `MomentEditorialCategory` | `landmark, nature, street, culture, people, weather, other` | `src/types/momentEditorial.ts` |
| `SlotFallbackReason` | 7 values | New |
| `EditionStatus` | `draft, preview, scheduled, published, replaced, retracted` | New |
| `WitnessSubmissionStatus` | 8 values | Brief §5 E-P0-03 |
| `WitnessMediaType` | `photo_camera, photo_library, live_photo` | D-P0-05 §5 |
| `WitnessLocationMode` | `auto_gps_city, manual_city, denied_fallback_manual` | D-P0-05 §5 |
| `WitnessPermissionType` | `camera, photo_library, location` | D-P0-05 §5 |
| `WitnessPermissionResult` | `granted, denied, restricted, not_determined` | D-P0-05 §5 |
| `WitnessNetworkClass` | `wifi, cellular_4g_5g, cellular_3g, slow_2g, offline` | D-P0-05 §5 |
| `WitnessErrorCategory` | 10 values | D-P0-05 §5 |
| `AssetStatus` | 7 values | New |
| `EchoStatus` | `queued_for_review, accepted, rejected, rate_limited, unavailable` | New |
| `EchoModerationDecision` | `accepted, rejected, escalated` | New |

### 新增 Privacy Guarantees

1. **PublicCity / PublicMoment / PublicEdition / PublicWitnessSubmission / PublicAsset / SubmitterEcho** 全部 schema 严格定义（`additionalProperties: false`）。
2. 精确 GPS / raw EXIF 仅出现在 Admin schema 与 Witness 上传 claim 中，公开 schema 不暴露。
3. Universal Error Envelope：所有 4xx/5xx 返回 `ErrorEnvelope`；`request_id` 用于服务端关联。

### 兼容性声明

- v1.0.0 是初始版本，无前置兼容性问题。
- 所有未来变更必须遵循 `contract-decisions-v1.md §12` 版本化规则。

---

## 变更模板（后续使用）

```markdown
## [X.Y.Z] · YYYY-MM-DD · <TITLE>

**Kind**：ADDED | CHANGED | DEPRECATED | REMOVED | FIXED | SECURITY
**Breaking**：YES | NO
**Owner**：<PM> / <Designer> / <Engineer> （签字）
**Brief 锚点**：<path>

### Added
- <field / endpoint / enum value>

### Changed
- <field rename / type change / enum widening>

### Deprecated
- <field still works but should not be used; deprecation window until YYYY-MM-DD>

### Removed
- <field removed; migration path: ...>

### Fixed
- <typo / wrong constraint>

### Security
- <privacy / auth / leak fix>
```

---

## 待办（Open decisions）

| # | 议题 | Owner | Deadline |
|---|---|---|---|
| CHG-01 | v1.0.1 MINOR：是否新增 `Moment.published_at_local` 字段？ | PM + Designer | E-P0-02 启动前 |
| CHG-02 | v1.0.x PATCH：修正 Echo 长度限制为 200 vs EchoInput 默认 80 | Engineer | E-P0-03 启动前 |
| CHG-03 | v1.x MAJOR：是否新增 `City.weather` runtime 字段？ | PM | E-P0-07 后 |

---

## Blocker Log

| 日期 | 阻塞描述 | Owner | 解锁条件 | 状态 |
|---|---|---|---|---|
| 2026-08-22 | iOS first-pass 字段映射验证未启动 | iOS Engineer（外部） | D-P1-01 启动 | OPEN |
| 2026-08-22 | 写入 Obsidian canonical 路径 | PM Agent | 用户手动 cp | OPEN |

---

**End of schema-changelog-v1.md**