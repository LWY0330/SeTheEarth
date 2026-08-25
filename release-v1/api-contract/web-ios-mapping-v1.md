---
title: SEE EARTH V1 · Web ↔ iOS Field Mapping · v1.0.0
type: field-mapping
tags: [release-v1, e-p0-09, web-ios, mapping, see-earth]
task_id: E-P0-09
brief_anchor: "Release Strategy Brief §5 E-P0-09 + D-P1-01"
track: engineering
owner: Engineer Agent #3 (external Owner = 用户)
created: 2026-08-22
status: LOCKED
target_gate: Gate A · Internal Alpha
source_brief: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/SEE-EARTH-Release-Strategy-v1-Design-Engineering-Task-Brief.md
source_task_card: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/06-PM Agent 交接/2026-08-22-task-card-e-p0-09-shared-api-contract.md
related_docs:
  - ./openapi.yaml
  - ./zod-schemas/*
  - ./contract-decisions-v1.md
  - ./error-code-dict-v1.md
  - ./schema-changelog-v1.md
depends_on: [E-P0-01 (✓ ACCEPTED), D-P0-02 (IN PROGRESS)]
blocks: [E-P0-02, E-P0-03, E-P0-07, D-P0-05-impl, D-P1-01]
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/06-PM Agent 交接/release-v1/api-contract/web-ios-mapping-v1.md
note: 本文件已就绪，需 PM Agent 由 Obsidian 写入权限落地到 canonical 路径。
---

# SEE EARTH V1 · Web ↔ iOS Field Mapping · v1.0.0

> **目的**：把 contract 字段映射到 Web (TS / React) 与 iOS (Swift) 客户端类型与组件 props，确保两端的业务真相完全一致。
> **原则**：**只允许 presentation 差异（命名约定、组件 API、布局）；不允许两套业务真相**。
> **跨端一致性**：iOS first-pass 的每个动态字段必须能映射到本表，否则视为 blocker（见 §D 决策记录）。

---

## 0. 阅读指南

每条映射条目：

| 列 | 含义 |
|---|---|
| **Contract field** | OpenAPI / Zod schema 中的字段名（snake_case，权威） |
| **TS (Web)** | Web 端 TypeScript 表示（来自 `z.infer<>`） |
| **Swift (iOS)** | iOS 端 Swift 表示（来自 OpenAPI Generator Swift 模型） |
| **Web component** | Web 端组件 prop / store 字段（如适用） |
| **iOS component** | iOS 端对应 UI 组件（如适用） |
| **Privacy scope** | Public / Witness-self / Moderator-Admin |
| **Notes** | 备注 / 命名差异 / iOS-only 等 |

---

## A. City

| Contract field | TS (Web) | Swift (iOS) | Web component | iOS component | Privacy scope | Notes |
|---|---|---|---|---|---|---|
| `id` | `PublicCity.id: string` | `PublicCity.id: String` | `<HeroMedia cityId=...>` | `CityDetailView` | Public |  |
| `slug` | `PublicCity.slug: string` | `PublicCity.slug: String` | React Router param | NavigationLink | Public | kebab-case |
| `names.canonical_name` | `PublicCity.names.canonicalName` | `PublicCity.names.canonicalName` | `<CityPageShell>` | Header title | Public |  |
| `names.name_zh` | `PublicCity.names.nameZh` | `PublicCity.names.nameZh` | `<CityPageShell>` (locale=zh) | `LocalizedTitle(zh:)` | Public | i18n |
| `names.name_en` | `PublicCity.names.nameEn` | `PublicCity.names.nameEn` | 同上 (locale=en) | `LocalizedTitle(en:)` | Public | i18n |
| `names.country_zh` | `PublicCity.names.countryZh` | `PublicCity.names.countryZh` | `<LocationMeta>` | `LocationFooter` | Public |  |
| `names.country_en` | `PublicCity.names.countryEn` | `PublicCity.names.countryEn` | 同上 | 同上 | Public |  |
| `timezone` | `PublicCity.timezone: string` | `PublicCity.timezone: String` | `<WorldTimeRail>` | `TimeZoneClockView` | Public | IANA |
| `layer` | `PublicCity.layer: 'blue'\|'yellow'\|'red'` | `enum Layer: blue, yellow, red` | `<CityPageShell data-layer=...>` | `CityPageTheme` | Public |  |
| `public_location_only` | `PublicCity.publicLocationOnly: true` | `PublicCity.publicLocationOnly: true` | （schema 约束） | n/a | Public | **强制 true** |
| `page_state` | `PublicCity.pageState: CityPageState` | `enum CityPageState: A..E` | `<CityPageShell state=...>` | `CityPageStateSwitcher` | Public |  |
| `visual.hero_media` | `PublicCity.visual?.heroMedia` | `PublicCity.visual?.heroMedia` | `<HeroMedia>` | `HeroImageView` | Public |  |
| `visual.visual_status` | `PublicCity.visual?.visualStatus` | `enum VisualStatus: seed, placeholder, none` | `<HeroMedia>` placeholder 逻辑 | Hero fallback | Public |  |
| `visual.editorial_only` | `PublicCity.visual?.editorialOnly: bool` | 同上 | `<HeroMedia>` admin guard | n/a (iOS V1 first-pass 无 admin UI) | Public |  |
| `admin.raw_coordinates` | `AdminCity.rawCoordinates` | `AdminCity.rawCoordinates` | n/a (Web V1 无 admin UI) | n/a | **Admin only** | **不进入公共 API** |
| `admin.state_level` | `AdminCity.stateLevel` | 同上 | n/a | n/a | **Admin only** | |
| `admin.moment_stats` | `AdminCity.momentStats` | 同上 | n/a | n/a | **Admin only** | |

### iOS-specific mappings

- **Swift Naming Convention**：OpenAPI Generator 默认将 `snake_case` 转换为 `camelCase`。`captured_at` → `capturedAt`。本表 `Swift (iOS)` 列已采用 camelCase。
- **Web V1.6 当前使用**：`canonical_name`（来自 `src/types/city.ts`）— contract 兼容（`names.canonical_name` 是新增，但 `canonical_name` 通过 `PublicCity.names.canonicalName` 暴露）。
- **iOS first-pass 字段**：`id`, `slug`, `names.canonicalName`, `timezone`, `layer`, `pageState`, `visual.heroMedia.url` — 全部 LOCKED。

---

## B. Moment

| Contract field | TS (Web) | Swift (iOS) | Web component | iOS component | Privacy scope | Notes |
|---|---|---|---|---|---|---|
| `id` | `PublicMoment.id` | `PublicMoment.id` | `<Daily12Card momentId=...>` | `MomentCell` | Public | |
| `city_id` | `PublicMoment.cityId` | `PublicMoment.cityId` | `<Daily12Card cityId=...>` | `MomentCell.cityId` | Public | |
| `public_city_name` | `PublicMoment.publicCityName` | `PublicMoment.publicCityName` | `<LocationMeta>` | `MomentCityChip` | Public | snapshot |
| `captured_at` | `PublicMoment.capturedAt: string (RFC 3339)` | `PublicMoment.capturedAt: Date` | `<TimeDisplay>` (UTC) | `CapturedAtLabel` | Public | UTC ISO + offset |
| `captured_at_tz` | `PublicMoment.capturedAtTz: string` | `PublicMoment.capturedAtTz: String` | `<TimeDisplay>` (local) | `TimeZoneClock` | Public | IANA |
| `captured_at_source` | `PublicMoment.capturedAtSource` | `enum CapturedAtSource` | `<RevealMeta>` | `ProvenanceChip` | Public | enum 5 values |
| `captured_at_confidence` | `PublicMoment.capturedAtConfidence` | `enum CapturedAtConfidence` | `<RevealMeta>` (low confidence → 标识) | `ProvenanceChip` | Public | enum 4 values |
| `uploaded_at` | `PublicMoment.uploadedAt` | `PublicMoment.uploadedAt` | (运营元数据，通常不展示) | (only admin) | Public | |
| `published_at` | `PublicMoment.publishedAt?` | `PublicMoment.publishedAt?` | (运营元数据) | (only admin) | Public | 可空 |
| `image_variants` | `PublicMoment.imageVariants: ImageVariant[]` | `[ImageVariant]` | `<HeroMedia variant=...>` | `MomentImageView` | Public | 4 sizes |
| `image_variants[thumb_320]` | `imageVariants.find(v => v.variant === 'thumb_320')` | 同 | `<Daily12Card>` thumbnail | `MomentCell.thumbnail` | Public | |
| `image_variants[card_640]` | 同 | 同 | `<Daily12Card>` hover preview | `MomentDetail.hero` | Public | |
| `image_variants[detail_1280]` | 同 | 同 | `<MomentDetail>` | `MomentDetail.hero` | Public | |
| `image_variants[full_2560]` | 同 | 同 | `<MomentDetail>` zoom | `MomentDetail.zoom` | Public | |
| `source_type` | `PublicMoment.sourceType: 'witness'\|'seed'\|'editorial'` | `enum DomainSourceType` | `<RevealMeta>` | `SourceBadge` | Public | 三方枚举（D-P0-05） |
| `rights` | `PublicMoment.rights: RightsStatus` | `enum RightsStatus` | `<RevealMeta>` | `RightsFootnote` | Public | enum 5 values |
| `credit` | `PublicMoment.credit: Credit` | `PublicMoment.credit` | `<RevealMeta credit=...>` | `CreditFooter` | Public | |
| `captions.zh` | `PublicMoment.captions?.zh` | `PublicMoment.captions?.zh` | `<OneScene>` (locale=zh) | `MomentCaption(zh:)` | Public | i18n |
| `captions.en` | `PublicMoment.captions?.en` | `PublicMoment.captions?.en` | `<OneScene>` (locale=en) | `MomentCaption(en:)` | Public | i18n |
| `provenance_status` | `PublicMoment.provenanceStatus` | `enum ProvenanceStatus` | (后台元数据) | (only admin) | Public | 4 values |
| `moderation_status` | `PublicMoment.moderationStatus` | `enum ModerationStatus` | (Web 默认只展示 approved) | (only admin) | Public | 4 values |
| `witness_id` | `PublicMoment.witnessId?` | `PublicMoment.witnessId?` | (匿名，不展示) | n/a | Public | V1 不暴露作者身份 |
| `editorial.category` | `PublicMoment.editorial?.category` | `enum EditorialCategory` | `<EditorialBadge>` | `EditorialCategoryChip` | Public | 7 values |
| `editorial.note` | `PublicMoment.editorial?.note` | `PublicMoment.editorial?.note` | `<EditorialNote>` | `EditorialNoteView` | Public | |
| `admin.raw_location` | `AdminMoment.rawLocation?` | 同 | n/a | n/a | **Admin only** | **禁采** |
| `admin.location_verification` | `AdminMoment.locationVerification?` | 同 | n/a | n/a | **Admin only** | |
| `admin.sources` | `AdminMoment.sources?: MomentSource[]` | 同 | n/a | n/a | **Admin only** | |

### iOS-specific mappings

- **Date type bridge**：Swift `Date` 默认不解 offset；Web `Date` 同理。contract 保留字符串（RFC 3339），客户端自行用 `DateFormatter` 解析。
- **Swift array access**：iOS can use `imageVariants.first { $0.variant == .card640 }` 模式。
- **Web V1.6 Legacy**：`moments.ts` legacy adapter 当前 `rights_status: 'unknown'` 硬编码 — V1 接入 contract 后必须替换为服务端真实 rights。

---

## C. Edition

| Contract field | TS (Web) | Swift (iOS) | Web component | iOS component | Privacy scope | Notes |
|---|---|---|---|---|---|---|
| `id` | `PublicEdition.id` | `PublicEdition.id` | `<Daily12Grid editionId=...>` | `TodayView` | Public | |
| `date` | `PublicEdition.date: string (YYYY-MM-DD)` | `PublicEdition.date: String` | `<Daily12Grid>` 顶部 "12 张 · 2026-08-22" | `EditionDateHeader` | Public | 当地自然日 |
| `slots` | `PublicEdition.slots: EditionSlot[]` (length=12) | `[EditionSlot]` (length=12) | `<Daily12Grid>` map | `TodayView.slots` | Public | 严格 12 |
| `slots[].position` | `EditionSlot.position: 1..12` | `EditionSlot.position: Int` | `<Daily12Card position=...>` | `MomentCell.position` | Public | 1-indexed |
| `slots[].moment_id` | `EditionSlot.momentId: string?` | `EditionSlot.momentId: String?` | `<Daily12Card>` moment lookup | `MomentCell.momentId` | Public | null = fallback |
| `slots[].city_id` | `EditionSlot.cityId: string?` | `EditionSlot.cityId: String?` | 同上 | 同上 | Public | |
| `slots[].fallback_reason` | `EditionSlot.fallbackReason: SlotFallbackReason?` | `enum SlotFallbackReason` | `<Daily12Card>` placeholder + reason | `FallbackCell` | Public | 7 values |
| `slots[].is_editorial_fill` | `EditionSlot.isEditorialFill: bool` | `EditionSlot.isEditorialFill: Bool` | `<Daily12Card>` editorial badge | `EditorialChip` | Public | |
| `version` | `PublicEdition.version: int` | `PublicEdition.version: Int` | (cache key) | n/a | Public | monotonic |
| `published_at` | `PublicEdition.publishedAt?` | `PublicEdition.publishedAt?` | (运营元数据) | (only admin) | Public | |
| `is_fallback` | `PublicEdition.isFallback: bool` | `PublicEdition.isFallback: Bool` | `<Daily12Grid>` banner "fallback Edition" | `FallbackBanner` | Public | |
| `replaces_edition_id` | `PublicEdition.replacesEditionId?` | 同 | (debug) | n/a | Public | |
| `admin.status` | `AdminEdition.status` | `enum EditionStatus` | n/a | n/a | **Admin only** | 6 values |

### iOS-specific mappings

- **Grid layout**：iOS first-pass 用 `LazyVGrid` 3-column (portrait) / 6-column (landscape)；Web 用 CSS Grid 12-cell row。**presentation-only difference**。
- **Empty slot UX**：iOS 显示 `FallbackCell(reason: .noCandidateForCity, cityName: ...)`；Web 显示同一内容。

---

## D. Witness Submission

| Contract field | TS (Web) | Swift (iOS) | Web component | iOS component | Privacy scope | Notes |
|---|---|---|---|---|---|---|
| `id` | `PublicWitnessSubmission.id` | `PublicWitnessSubmission.id` | `<WitnessResultStep>` | `WitnessResultView` | Witness-self | |
| `client_key` | `PublicWitnessSubmission.clientKey` | 同 | (UI state, idempotency) | (UI state) | Witness-self | UUIDv4 |
| `status` | `PublicWitnessSubmission.status` | `enum WitnessSubmissionStatus` | `<WitnessResultStep state=...>` | `WitnessStatusBadge` | Witness-self | 8 states |
| `media_type` | `PublicWitnessSubmission.mediaType` | `enum WitnessMediaType` | (UI label) | `MediaTypeChip` | Witness-self | 3 values |
| `asset_id` | `PublicWitnessSubmission.assetId?` | `PublicWitnessSubmission.assetId?` | (progress UI) | `UploadProgressBar` | Witness-self | |
| `location_mode` | `PublicWitnessSubmission.locationMode` | `enum WitnessLocationMode` | `<WitnessPrivacyStep>` | `LocationModeDisplay` | Witness-self | 3 values |
| `public_city_id` | `PublicWitnessSubmission.publicCityId` | 同 | `<WitnessLocationStep>` | `CityPicker` | Witness-self | |
| `captured_at` | `PublicWitnessSubmission.capturedAt` | 同 | `<WitnessTimeStep>` | `CapturedAtConfirmView` | Witness-self | RFC 3339 |
| `captured_at_tz` | `PublicWitnessSubmission.capturedAtTz` | 同 | 同上 | 同上 | Witness-self | IANA |
| `captured_at_source` | `PublicWitnessSubmission.capturedAtSource` | `enum CapturedAtSource` | `<WitnessTimeStep>` source label | `CapturedAtSourceBadge` | Witness-self | 5 values |
| `captured_at_confidence` | `PublicWitnessSubmission.capturedAtConfidence` | `enum CapturedAtConfidence` | `<WitnessTimeStep>` confidence UI | `ConfidenceIndicator` | Witness-self | 4 values |
| `description_redacted` | `'present' \| 'absent' \| 'under_review'` | 同 enum | `<WitnessResultStep>` | `DescriptionStateBadge` | Witness-self | **never returns body text** |
| `submitted_at` | `PublicWitnessSubmission.submittedAt?` | 同 | `<WitnessResultStep>` | `SubmittedAtLabel` | Witness-self | |
| `moderation_result.decision` | `PublicWitnessSubmission.moderationResult?.decision` | `enum ModerationDecision` | `<WitnessResultStep>` | `ModerationResultBadge` | Witness-self | |
| `moderation_result.decided_at` | `PublicWitnessSubmission.moderationResult?.decidedAt` | 同 | 同上 | 同上 | Witness-self | |
| `moderation_result.public_reason` | `PublicWitnessSubmission.moderationResult?.publicReason` | 同 | 同上 | 同上 | Witness-self | |
| `error_category` | `PublicWitnessSubmission.errorCategory?` | `enum WitnessErrorCategory` | `<WitnessResultStep error=...>` | `ErrorCategoryChip` | Witness-self | 10 values |
| `admin.location.precise` | `AdminWitnessSubmission.location.precise?` | 同 | n/a | n/a | **Admin only** | **禁采** |
| `admin.description.text` | `AdminWitnessSubmission.description.text` | 同 | n/a | n/a | **Admin only** | PII |
| `admin.ip_hash` | `AdminWitnessSubmission.ipHash?` | 同 | n/a | n/a | **Admin only** | HMAC-SHA256 |
| `admin.transitions` | `AdminWitnessSubmission.transitions?` | 同 | n/a | n/a | **Admin only** | audit log |

### iOS-specific mappings

- **Native picker vs Web select**：iOS `city_picker` 用 `Picker` + 自动补全；Web 用 `<select>` + 搜索。**presentation-only difference**。
- **EXIF source**：iOS PhotosKit / PHAsset 可读取 `localIdentifier` + EXIF；Web 用 `createImageBitmap` + 手写 EXIF parser (V1)。
- **Live Photo**：`media_type = live_photo` 仅 iOS 可产生；Web 收到 `live_photo` 应降级为 `photo_library`（V1 决策）。

---

## E. Asset Upload

| Contract field | TS (Web) | Swift (iOS) | Web component | iOS component | Privacy scope | Notes |
|---|---|---|---|---|---|---|
| `asset_id` | `AssetUploadGrant.assetId` | `AssetUploadGrant.assetId` | (UI state) | (UI state) | Witness-self | |
| `upload_url` | `AssetUploadGrant.uploadUrl: string` | `AssetUploadGrant.uploadUrl: URL` | `fetch(upload_url, PUT)` | `URLSession.uploadTask` | Witness-self | short-lived (5min TTL) |
| `expires_at` | `AssetUploadGrant.expiresAt` | `AssetUploadGrant.expiresAt: Date` | (UI timer) | (UI timer) | Witness-self | |
| `max_size` | `AssetUploadGrant.maxSize: int` | `AssetUploadGrant.maxSize: Int` | (UI guard) | (UI guard) | Witness-self | 25 MiB |
| `mime_whitelist` | `AssetUploadGrant.mimeWhitelist: string[]` | `[String]` | (UI guard) | (UI guard) | Witness-self | |
| `required_headers` | `AssetUploadGrant.requiredHeaders: Record<string,string>` | `[String: String]` | `fetch headers` | `URLRequest.headers` | Witness-self | |
| `processing.strip_exif_gps` | `AssetUploadGrant.processing.stripExifGps: bool` | `Bool` | (服务端处理，前端无需关心) | 同 | Witness-self | always true |
| `processing.generate_variants` | `[thumb_320, card_640, detail_1280, full_2560]` | `[Variant]` | (服务端处理) | 同 | Witness-self | |
| `PublicAsset.id` | `PublicAsset.id` | `PublicAsset.id` | `<HeroMedia assetId=...>` | `HeroImageView` | Public | |
| `PublicAsset.variants` | `PublicAsset.variants: ImageVariant[]` | `[ImageVariant]` | `<HeroMedia variant=...>` | `HeroImageView` | Public | EXIF-stripped URLs |
| `PublicAsset.exif_stripped` | `PublicAsset.exifStripped: bool` | `Bool` | (audit trail, UI may show "GPS stripped ✓") | 同 | Public | always true |
| `PublicAsset.bytes` | `PublicAsset.bytes: int` | `Int` | (UI size label) | (UI size label) | Public | |
| `admin.raw_checksum_sha256` | `AdminAsset.rawChecksumSha256` | 同 | n/a | n/a | **Admin only** | |
| `admin.uploaded_ip_hash` | `AdminAsset.uploadedIpHash` | 同 | n/a | n/a | **Admin only** | |

### iOS-specific mappings

- **PUT upload**：iOS `URLSession.uploadTask(with:from:)` + `ContentContentMD5` header;Web `fetch(url, { method: 'PUT', body })`.
- **Checksum SHA-256**：iOS `CryptoKit.SHA256`;Web `crypto.subtle.digest('SHA-256', ...)`.

---

## F. Echo

| Contract field | TS (Web) | Swift (iOS) | Web component | iOS component | Privacy scope | Notes |
|---|---|---|---|---|---|---|
| `id` | `SubmitterEcho.id` | `SubmitterEcho.id` | `<EchoResultBanner>` | `EchoSubmittedView` | Submitter-only | |
| `city_id` | `SubmitterEcho.cityId` | 同 | `<EchoInput cityId=...>` | `EchoComposer.cityId` | Submitter-only | |
| `status` | `SubmitterEcho.status` | `enum EchoStatus` | `<EchoResultBanner>` | `EchoStatusBadge` | Submitter-only | 5 values |
| `submitted_at` | `SubmitterEcho.submittedAt?` | 同 | `<EchoResultBanner>` | `EchoSubmittedAtLabel` | Submitter-only | |
| `moderation_result.decision` | `SubmitterEcho.moderationResult?.decision` | `enum EchoModerationDecision` | (admin) | (admin) | Submitter-only | |
| `content_redacted` | `'present' \| 'under_review' \| 'purged'` | 同 enum | (UI hint) | (UI hint) | Submitter-only | **never returns body text** |
| `locale` | `SubmitterEcho.locale: 'zh'\|'en'` | `enum Locale` | (UI) | (UI) | Submitter-only | i18n |
| `content` (input only) | `CreateEchoRequest.content: string` (≤ 200) | `CreateEchoRequest.content: String` | `<EchoInput maxLength=80>` | `EchoComposer.maxLength` | Submitter-only | UI ≤ 80, server ≤ 200 |
| `client_key` (input) | `CreateEchoRequest.clientKey?` | 同 | (idempotency) | (idempotency) | Submitter-only | UUIDv4 |

### iOS-specific mappings

- **Echo composer**：iOS 用 `TextEditor`;Web 用 `<textarea>` (EchoInput.tsx)。**presentation-only difference**。
- **V1 launch decision**：若 Echo backend 未就绪（per OD-01），前端 **必须** 移除 submit 按钮 + 服务端返回 `service_unavailable` (`error_code`)。

---

## G. Common · ErrorEnvelope

| Contract field | TS (Web) | Swift (iOS) | Web component | iOS component | Privacy scope | Notes |
|---|---|---|---|---|---|---|
| `error_code` | `ErrorEnvelope.errorCode: string` | `ErrorEnvelope.errorCode: String` | 全局 error boundary | App-level error handler | Public | snake_case |
| `message` | `ErrorEnvelope.message: string` | `ErrorEnvelope.message: String` | UI banner | Alert | Public | localisable |
| `details` | `ErrorEnvelope.details?: Record<string, ...>` | `[String: Any]` | 表单内联错误 | form error | Public | optional |
| `retryable` | `ErrorEnvelope.retryable: bool` | `Bool` | 自动重试决策 | RetryPolicy | Public | |
| `request_id` | `ErrorEnvelope.requestId: string` | `String` | 监控关联 | Crashlytics context | Public | 关联 E-P0-10 |

---

## H. Common · AppSurface

> D-P0-05 §5 列举 13 个值；与 `AppSurfaceSchema` 一致。
> Web 与 iOS 各自映射：

| Value | Web trigger | iOS trigger |
|---|---|---|
| `web_homepage` / `ios_today` | 路由 `/` 进入 | `TodayView` 启动 |
| `web_today_refresh` | 主动刷新按钮 | 下拉刷新 |
| `web_moment_detail` / `ios_moment_detail` | 路由 `/moments/:id` | `MomentDetailView` push |
| `web_city_detail` / `ios_city_detail` | 路由 `/cities/:slug` | `CityDetailView` push |
| `web_unknown` / `ios_unknown` | 路由 `/unknown` | `UnknownView` push |
| `web_echo` / `ios_echo` | Echo 章节首次进入 | `EchoSectionView` 出现 |
| `web_witness` / `ios_witness` | Witness CTA 点击 | Witness FAB 点击 |

---

## I. Web V1.6 旧字段 → Contract 迁移表（兼容性）

> Web V1.6 客户端代码 (`src/data/*`, `src/types/*`) 中仍存在但 Contract 已演进的字段。

| Web V1.6 字段 | Contract 字段 | 迁移路径 | 状态 |
|---|---|---|---|
| `City.canonical_name` | `PublicCity.names.canonicalName` | `cities.ts` 重命名 | Soft migration, V1.6.5 |
| `City.country_name` | `PublicCity.names.countryEn` | `cities.ts` 重命名 | Soft migration |
| `City.country_zh` (computed via `countryI18n.ts`) | `PublicCity.names.countryZh` | 移除 countryI18n | Required for V1.6.5 |
| `Moment.image` (单一 URL) | `Moment.imageVariants[detail_1280].url` | `moments.ts` 适配 | Required for V1.6.5 |
| `Moment.thumbnail` | `Moment.imageVariants[thumb_320].url` | 同上 | Required |
| `Moment.time` | `Moment.capturedAt` | rename | Required |
| `Moment.tz` | `Moment.capturedAtTz` | rename | Required |
| `Moment.provenance` | `Moment.provenanceStatus` | rename | Required |
| `Moment.license` | `Moment.rights` | rename | Required |
| `PhotoAsset.url` | `AssetUploadGrant.uploadUrl` (upload) / `PublicAsset.variants[detail_1280].url` (read) | split into request/response | Required |
| `LiveEvent.thumbnailUrl` | `Moment.imageVariants[thumb_320].url` | refactor via `useMomentsForCity.ts` | Required for V1.6.5 |
| `EchoInput.text` (UI only) | `CreateEchoRequest.content` | submit 时映射 | No change in component |
| `EchoInput.maxLength` (default 80) | `ECHO_LIMITS.UI_DEFAULT_MAX_LENGTH = 80` | constants.ts 引用 | No change |
| `EchoInput.onSubmit(text)` | `createEcho` mutation | UI 调用层替换 | Required |
| `UniversalEcho.state` | n/a (服务端) | EchoComposer state machine | Out of contract (UI-only) |
| `useMomentsForCity` | `GET /v1/cities/{id}/moments` | 客户端完全替换为 fetch | Required |

### Migration 计划

| Phase | 范围 | Owner | Gate |
|---|---|---|---|
| V1.6.5 (Gate A) | `City` 字段迁移 + 新 schema 引入；旧 `cities.ts` 保留作为 fallback | Web Engineer | Internal Alpha |
| V1.7 (Gate B) | `Moment` 字段迁移 + 后端真实数据接入 | Web + Backend | Closed Beta |
| V1.8 (Gate C) | `EchoInput` submit 接入 Echo backend | Web + Backend | Launch Candidate |

---

## J. iOS first-pass blocker / gap 决策

> 与 `contract-decisions-v1.md §17` 对齐；本表是 iOS 视角的展开。

| iOS 字段需求 | 来源 | Contract 字段 | 状态 |
|---|---|---|---|
| `Moment.capturedAt` (Date) | iOS Calendar UI | `Moment.capturedAt` (string) → client-side parse | ✓ Locked |
| `Moment.localTimeString` (HH:mm) | iOS Today 卡片显示 | `Moment.capturedAtTz` + Intl.DateTimeFormat | ✓ Locked |
| `Edition.slot[].thumbnailUrl` | iOS LazyVGrid cell | `Moment.imageVariants[thumb_320].url` (via slot.moment_id) | ✓ Locked |
| `City.weatherSnapshot` | iOS Hero 天气芯片 | runtime derivation（不入 contract per D-P0-01 §7.1 决策 5） | ✓ Out of contract |
| `WitnessSubmission.uploadProgress` | iOS upload UI | client-side state (not contract) | ✓ Out of contract |
| `WitnessSubmission.location.coarseCity` | iOS Step 5 | `WitnessSubmission.publicCityId` | ✓ Locked |
| `AssetUpload.urlExpiry` | iOS timer | `AssetUploadGrant.expiresAt` | ✓ Locked |
| `AssetUpload.requiredHeaders` | iOS URLSession | `AssetUploadGrant.requiredHeaders` | ✓ Locked |
| `EchoComposer.maxLength` | iOS UI guard | `ECHO_LIMITS.UI_DEFAULT_MAX_LENGTH = 80` | ✓ Locked |
| `ErrorEnvelope.errorCode` (for `witness_submit_failed`) | iOS analytics | 全 mapping 见 `error-code-dict-v1.md §10` | ✓ Locked |

**结论**：**无 unresolved gap**。iOS first-pass 所有字段均可映射。⚠️ 若 D-P1-01 启动后新发现缺口，由 iOS Engineer 在 contract 下发起 RFC。

---

## K. Web V1 first-pass blocker / gap 决策

| Web 字段需求 | 来源 | Contract 字段 | 状态 |
|---|---|---|---|
| `City.weather` (Web WeatherRail) | Hero 渲染 | runtime (open-meteo)，不入 contract | ✓ Out of contract |
| `City.sunrise/sunset` | Web DayPeriod | runtime (sunrise-sunset)，不入 contract | ✓ Out of contract |
| `Moment.weatherContext` | Web OneScene | n/a；runtime aggregation | ✓ Out of contract |
| `Unknown.id` + `Unknown.revealed_city_id` | Web Unknown | **OUT OF CONTRACT v1.0.0** | ⚠️ Blocker — 需 E-P0-09 v1.0.1 增补 |
| `KhartoumHero` (custom asset) | Web V1.6 design | `PublicAsset.id` + `visual.editorial_only = true` | ✓ Mappable |

### Unknown gap 处理

- 状态：**OUT OF CONTRACT v1.0.0**
- 原因：Unknown 当前是 design-only，无 backend schema；E-P0-09 first pass 锁定 6 核心资源。
- 解锁条件：D-P0-02 Minimal Witness 完成后启动 E-P0-09 v1.0.1（MINOR bump），新增 `Unknown` + `DailyReveal` 资源。
- 替代方案：Web V1.6.5 继续使用 `src/data/photoAssets.ts` 5 stage preset + `src/lib/unknownReveal.ts` state machine；v1.0.1 切换至 contract。
- Owner：PM Agent（决定 D-P0-02 完成时机）。

---

## L. 自验收 Acceptance Criteria

- [x] 6 资源字段 100% 映射（City / Moment / / Edition / Witness Submission / Asset Upload / Echo）
- [x] Web V1.6 legacy 字段迁移表（§I）
- [x] iOS first-pass 无 unresolved gap（§J）
- [x] Web V1 first-pass gap 明确登记（§K · Unknown OUT OF CONTRACT v1.0.0）
- [x] Privacy scope 标注（Public / Witness-self / Admin only）
- [x] snake_case ↔ camelCase 命名差异明确（仅 naming，不改 semantic）
- [x] D-P0-05 event map §5 字段名一致性矩阵完全对齐
- [x] E-P0-05 位置隔离边界 100% 体现（precise location 仅出现在 Admin scope）

---

## M. 关联文档

| 文档 | 用途 |
|---|---|
| `openapi.yaml` | OpenAPI contract（机器可读） |
| `zod-schemas/*.ts` | Zod schema 源 |
| `contract-decisions-v1.md` | 决策与原则 |
| `error-code-dict-v1.md` | 错误码 |
| `schema-changelog-v1.md` | 变更日志 |
| `D-P1-01 iOS V1 first-pass`（待启动） | iOS 字段实现 |
| `D-P0-02 Minimal Witness Flow`（IN PROGRESS） | Witness UI 字段映射 |

---

**End of web-ios-mapping-v1.md**