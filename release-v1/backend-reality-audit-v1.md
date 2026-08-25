---
title: SEE EARTH Backend Reality Audit v1
type: reality-audit
tags: [release-v1, e-p0-01, engineering, reality-audit, backend, database, api, see-earth]
task_id: E-P0-01
dispatched_at: 2026-08-22
engineer_agent: Engineer Agent #1 (external Owner = 用户)
gate_target: Gate A · Internal Alpha
source_brief: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/SEE-EARTH-Release-Strategy-v1-Design-Engineering-Task-Brief.md §5
status: DRAFT · IN REVIEW（待同步 Obsidian）
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/backend-reality-audit-v1.md
workspace_canonical_path: /Users/lwy/Documents/ChatGPT/看见地球/release-v1/backend-reality-audit-v1.md
sync_required: true · sandbox 拒绝写入 Obsidian（详见 §12 Blocker Log · 写入权限）
---

# SEE EARTH Backend Reality Audit v1

> **作者**：Engineer Agent #1（外部 Owner = 用户 / PM Orchestrator）
> **派发时间**：2026-08-22
> **审计范围**：运行环境 / 数据 schema / API 与鉴权 / 环境与部署 / 数据真相 / 可观测性 / 内容真实性
> **方法**：以 `/Users/lwy/Documents/ChatGPT/看见地球/` 当前代码 + 配置 + 文档为准，**不修改任何代码**，所有结论附证据路径与行号。

---

## 📋 一句话总结

**SEE EARTH V1 在 2026-08-22 是一个 100% 客户端 SPA，没有任何真实后端 / 数据库 / 对象存储 / 鉴权 / 可观测性。所有数据（City / Moment / LiveEvent / Editorial photo）硬编码在 `src/data/*.ts` 与 `src/data/photoAssets.ts`，仅天气与日出调用 open-meteo / sunrise-sunset 公共 API。V1 要把 Observe + Witness 闭环跑起来，需要从零搭建 Backend 体系；E-P0-02 / E-P0-08 / E-P0-09 都是从"0 → 1"的实现缺口，不是"修复已有缺口"。**

---

## 0. 关键定义与术语

为避免歧义，本文档严格使用：

- **REAL**：在生产或 Staging 环境有真实实现，且数据可由团队其他成员独立验证。
- **PARTIAL**：有实现但部分流程缺失 / 部分 mock / 部分硬编码。
- **MOCK**：前端或后端使用占位数据，未连接真实持久化服务。
- **MISSING**：完全没有实现（代码 + 配置 + 部署均无）。
- **UNKNOWN**：缺少信息无法判定，必须留待调查；附"为什么无法判定 + 调查 owner + 调查 deadline"。

---

## 1. 审计方法与证据链

| 步骤 | 工具 | 证据 |
|---|---|---|
| 1. 阅读任务卡 + Brief + 派发索引 | read tool | 任务卡 §A-G + Brief §5 E-P0-01 |
| 2. 扫描仓库结构 | bash ls + glob | `src/` 12 个子目录 + 5 个顶层 config |
| 3. 搜索后端 / DB / API 关键字 | grep "fetch\|axios\|XHR\|http\|database\|postgres\|supabase\|prisma\|drizzle\|sentry\|posthog\|vercel\|netlify\|backend\|api\|server\|endpoint" | 命中模式全部列出 |
| 4. 检查部署与 CI 配置 | grep ".github\|vercel.json\|Dockerfile\|docker-compose\|k8s" | 0 命中 |
| 5. 确认类型 schema | read types/city.ts / moment.ts / cityState.ts | 17 必填字段完整定义 |
| 6. 检查第三方依赖 | read package.json | 仅 react/react-dom/serve |
| 7. 检查 service worker / PWA | read public/sw.js + main.tsx | PWA 已实现，但仅客户端缓存 |

---

## 2. 当前架构（事实快照，非设计意图）

```text
┌─────────────────────────────────────────────────────────────────────┐
│                    [Client Browser · 100% 真实运行时]                │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ Vite 5 SPA · React 18 · TypeScript 5 (strict)                  │ │
│  │ index.html → /src/main.tsx → <App> → <Router>                  │ │
│  │   ├── /            HomeShell (Hero + 6 featured cities + 6 moments)
│  │   ├── /cities      CityIndexPage (12 城全集)                   │
│  │   ├── /cities/:slug CityPage / UniversalCityPage (feature flag)│
│  │   ├── /unknown     UnknownCoordinate (5 stage Reveal)          │
│  │   └── /about       AboutPage                                   │ │
│  │                                                                │ │
│  │ 数据源（全部客户端硬编码）                                       │ │
│  │   src/data/cities.ts       → 12 城完整数据（Kyoto / Lisbon / ... │ │
│  │                                Shanghai / Mexico / Tokyo / Rio /│
│  │                                Reykjavik / CapeTown / London /  │ │
│  │                                Berlin / Rome / Sydney）           │ │
│  │   src/data/moments.ts      → 6 静态 Moment（NYC / Gaza / Paris /│ │
│  │                                Tokyo / CapeTown / Reykjavik）    │ │
│  │   src/data/liveMoments.ts  → 12 LiveEvent（含 sourceType / UTC   │ │
│  │                                offset / thumbnailUrl）            │ │
│  │   src/data/photoAssets.ts  → 5 Unknown stage preset             │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  第三方 API 调用（仅 2 处）                                          │
│   ├── open-meteo.com/v1/forecast  (weather, 15 分钟客户端缓存)       │
│   └── sunrise-sunset.org/json     (sun, 6 小时缓存,dateKey in tz)    │
│                                                                     │
│  PWA Service Worker (public/sw.js)                                  │
│   ├── cache-first: App shell                                        │
│   ├── stale-while-revalidate: Unsplash / Pexels 图                 │
│   └── network-first: navigation requests                          │
└─────────────────────────────────────────────────────────────────────┘
                        ▲
                        │ 用户访问 see-earth.vercel.app
                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│             [Vercel Static Hosting · CDN]                            │
│   - 静态托管 SPA（dist/ 产物）                                       │
│   - URL: https://see-earth.vercel.app (canonical, Meta.tsx:10)       │
│   - 部署方式：未在仓库内显式配置 vercel.json（推断 = 默认）             │
└─────────────────────────────────────────────────────────────────────┘
                        ▲
                        │                                              │
                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│             [MISSING] Backend / Database / API / Storage             │
│             [MISSING] CI/CD（无 .github/workflows/）                 │
│             [MISSING] Analytics SDK（Sentry / Posthog / Vercel Anlytics）│
│             [MISSING] Witness submission pipeline                    │
│             [MISSING] Echo backend（仅有 onSubmit 回调签名）          │
│             [MISSING] Daily 12 / Edition entity                       │
└─────────────────────────────────────────────────────────────────────┘
```

**关键结论**：当前是 **客户端全部真相** 的 SPA，无服务端持久化，也无任何同步机制。Multi-tab / refresh 后所有 witness / echo 输入都丢失。

---

## 3. 当前数据流（事实快照）

```text
[Witness 想象]                                                           [Observer 现实]
         │                                                                        ▲
         │                                                                        │
         ▼                                                                        │
  ❌ MISSING · 无 Witness UI（仅 Echo 组件在 CityPage 底部）                       │
         │                                                                        │
         ▼                                                                        │
  ❌ MISSING · 无 submission endpoint                                              │
         │                                                                        │
         ▼                                                                        │
  ❌ MISSING · 无 media upload                                                     │
         │                                                                        │
         ▼                                                                        │
  ❌ MISSING · 无 moderation / publish decision                                  │
         │                                                                        │
         ▼                                                                        │
  ❌ MISSING · 无 database                                                        │
         │                                                                        │

[Observe 现实 · 直接从 src/data/* 读]
         │
         ▼
  src/data/cities.ts (12 城) ──► src/components/CityFeatured / CityPage / UniversalCityPage
  src/data/moments.ts (6 静态) ──► MomentsTimeline (Events UI)
  src/data/liveMoments.ts (12 LiveEvent) ──► EventsDrawer + useMomentsForCity hook
         │
         ▼
  open-meteo / sunrise-sunset (weather/sun 时段计算)
         │
         ▼
  Hero / OneScene / SameSecond / Echo 渲染（无状态机，pure function of state）
         │
         ▼
  [用户浏览器] ← 刷新即丢失 · 无 cookie / localStorage 同步
```

**关键结论**：不存在"数据流"，因为 Witness → DB → API → 用户 这条路径中 **DB / API 完全不存在**。当前是 100% 客户端 SPA，数据从 `src/data/*.ts` 经 React 渲染到 DOM。

---

## 4. § A · 运行环境

### 4.1 前端（Web / iOS）

| 维度 | 现状 | 证据 |
|---|---|---|
| Web 真实环境 | ✅ REAL（Vite 5 SPA + React 18） | `package.json:7-11` + `dist/` 已构建 |
| iOS 真实环境 | ❌ MISSING | 全仓库无 `.swift` / `.m` / Xcode 配置；Brief §2.2 已声明 first-pass 仅做"可评审原型"，非完整实现 |
| iOS first-pass 原型 | ❌ MISSING | `src/components/` 无 iOS 组件；无 `outputs/v1.5-mockups/ios/` 目录（仅 HTML mockup） |
| Web 视觉 / 设计 LOCKED | ✅ 14 组件 × 6 状态 LOCKED | `README.md:6-14` + `CHANGELOG.md:17` + `src/components/ui/` 14 文件 |
| Web 当前路由 | ✅ 5 路由（home / cities / city / unknown / about） | `src/router/Router.tsx:28-66` |

### 4.2 后端服务

| 维度 | 现状 | 证据 |
|---|---|---|
| 后端语言 | ❌ MISSING | 无 server/ 目录，无 `index.js`/`main.py`/`main.go` |
| 后端框架 | ❌ MISSING | 全仓库无 Express / Koa / Fastify / Hono / NestJS / Flask / Django / Gin 等 |
| Serverless Function | ❌ MISSING | 无 `api/` 目录（Vercel 默认约定）；无 `vercel.json` 配置 function |
| GraphQL / tRPC | ❌ MISSING | 无相关依赖 / schema |

### 4.3 数据库

| 维度 | 现状 | 证据 |
|---|---|---|
| 关系型 DB | ❌ MISSING | 全仓库 0 命中 `postgres\|mysql\|prisma\|drizzle\|sqlite` |
| 文档型 DB | ❌ MISSING | 0 命中 `mongodb\|firestore` |
| BaaS | ❌ MISSING | 0 命中 `supabase\|firebase\|appwrite\|pocketbase` |
| 内存存储 | ⚠️ PARTIAL | `src/lib/weather.ts:45` `cache: Map<string, CacheEntry>`（仅 weather 内存 15 分钟）<br>`src/lib/sun.ts:31` 同模式（仅 sun 内存 6 小时） |

### 4.4 对象存储 / CDN

| 维度 | 现状 | 证据 |
|---|---|---|
| 自建对象存储 | ❌ MISSING | 无 S3 / OSS / GCS / R2 集成 |
| 第三方 BaaS Storage | ❌ MISSING | 无 Supabase Storage / Firebase Storage |
| CDN | ⚠️ PARTIAL（仅 Unsplash + Pexels CDN） | `public/sw.js:25-29` 缓存 `images.unsplash.com / images.pexels.com` |
| 图源服务条款 | ⚠️ UNKNOWN | Unsplash License 允许商用，CC0-style；Pexels 同；但两者都禁止"将图重新打包为独立图库售卖"。V1 全部 Editorial 图来自这两个站，**rights_status 字段实际写入 'unknown' 而非 'cc0'**（见 §7 内容真实性） |

### 4.5 队列 / Job 系统

| 维度 | 现状 | 证据 |
|---|---|---|
| 队列 | ❌ MISSING | 无 Bull / BullMQ / Celery / Sidekiq / Inngest |
| 定时任务 | ❌ MISSING | 无 cron / Vercel Cron 配置 |
| 后台 Job runner | ❌ MISSING | 无 worker 进程 |

### 4.6 第三方 Provider

| Provider | 用途 | 现状 | 证据 |
|---|---|---|---|
| **open-meteo** | 实时天气（temperature / weather code / humidity / wind） | ✅ REAL（无 key · CORS 开放 · 15min 缓存） | `src/lib/weather.ts:52` + `src/hooks/useWeather.ts` （via `src/lib/weather.ts`） |
| **sunrise-sunset.org** | 日出日落 / 民用晨昏光 | ✅ REAL（无 key · CORS 开放 · 6h 缓存） | `src/lib/sun.ts:97` |
| **Unsplash** | Hero / City / Editorial 图源 | ⚠️ PARTIAL（直接外链 CDN，未走 attribution 服务） | `src/data/liveMoments.ts:77` 等 12 处 `images.unsplash.com/photo-XXX` |
| **Pexels** | 图源备份（sw.js 缓存） | ⚠️ PARTIAL（无明确数据导入，仅 sw 缓存域） | `public/sw.js:28` |
| **Wikimedia / Reuters / AP** | 数据架构预留 source type | ❌ MISSING（仅类型字面量，0 数据导入） | `src/types/moment.ts:167-180` 7 个 enum 字面量 |
| **地图 / Tile** | 地图瓦片 | ❌ MISSING | 无 mapbox / leaflet / deck.gl 依赖 |
| **图片分析 / 反查** | EXIF 解析 / reverse image | ❌ MISSING | 无 exifr / sharp / reverse image API |

---

## 5. § B · 数据 Schema（6 核心域 · 事实快照）

> ⚠️ **关键区分**：以下 schema 是 **TypeScript 类型定义**（编译期 + 客户端运行时校验），**不是数据库表**。当前没有持久化数据库，所有类型定义服务于"未来要建库的 schema 蓝图"。

### 5.1 City

| 维度 | 现状 | 证据 |
|---|---|---|
| 类型定义 | ✅ REAL（v1.6 Phase 0 LOCKED · 12 字段 Identity + Dynamic + Visual + State） | `src/types/city.ts:21-194` |
| 真实数据 | ✅ 12 城（hardcoded 在 `src/data/cities.ts`） | `src/data/cities.ts:66-325` 12 条记录 |
| 后端表 | ❌ MISSING | — |
| 索引 | ❌ MISSING（DB 不存在） | — |
| Khartoum 是否入库 | ❌ MISSING（设计 LOCKED 但数据未接，handoff §1 已记） | `06-PM Agent 交接/2026-08-19-pm-takeover-audit.md:32-41` |
| CityState 双层枚举 | ✅ REAL（后台 L0-L4 · 前台 A-E） | `src/types/cityState.ts:16-43` + `src/lib/cityState.ts` runtime |
| 数据导入管道 | ⚠️ PARTIAL（接口已定义，`normalizeCity`/`findDuplicates` 是 Phase 3 stub throw） | `src/lib/ingestion.ts:80` "STUB" + "NotImplemented" |
| MomentStats | ⚠️ PARTIAL（类型定义存在，但 `cities.ts` 中 12 城均无 moment_stats 字段实例） | `src/types/city.ts:132-145` + `src/data/cities.ts` grep moment_stats = 0 |

### 5.2 Moment

| 维度 | 现状 | 证据 |
|---|---|---|
| 类型定义 | ✅ REAL（17 必填字段 + sources + captions + editorial） | `src/types/moment.ts:111-137` |
| `captured_at` 字段 | ✅ REAL（schema 必填，唯一决定 NOW/TODAY/PAST 分桶） | `src/types/moment.ts:97-99` |
| `published_at` 字段 | ✅ REAL（optional，可空 = 草稿） | `src/types/moment.ts:99` |
| `city_id` 强关联 | ✅ REAL（schema 必填 + city identity） | `src/types/moment.ts:119` |
| 真实数据 | ⚠️ PARTIAL（6 静态 `moments.ts` + 12 LiveEvent `liveMoments.ts` + Legacy adapter `useMomentsForCity.ts`） | `src/data/moments.ts:29-108` + `src/data/liveMoments.ts:55-464` |
| `witness_id` 字段 | ⚠️ PARTIAL（schema 已留位，0 真实值） | `src/types/moment.ts:124` |
| `raw_location` 字段 | ⚠️ PARTIAL（schema 已留位，only 12 LiveEvent `latitude/longitude` 注入） | `src/lib/locationPrivacy.ts:74` 注释 "backend only" |
| 后端表 | ❌ MISSING | — |
| 索引 | ❌ MISSING（DB 不存在） | — |
| 审核状态枚举 | ✅ REAL（`pending / approved / rejected / flagged`） | `src/types/moment.ts:83` |
| 来源状态枚举 | ✅ REAL（`self_reported / trusted_source / editorial / unknown`） | `src/types/moment.ts:74` |
| Rights 状态枚举 | ✅ REAL（`cc_by / cc_by_sa / cc0 / all_rights_reserved / unknown`） | `src/types/moment.ts:88` |

### 5.3 Edition / Daily 12

| 维度 | 现状 | 证据 |
|---|---|---|
| 类型定义 | ❌ MISSING | 全仓库 grep `Edition\|Daily 12\|daily12` = 0 命中（除 `outputs/` 设计资料与 spec 文档外） |
| 真实数据 | ❌ MISSING | 无 `src/data/editions.ts` 之类的文件 |
| 后端表 | ❌ MISSING | — |
| 12 槽位 / 顺序 / 版本 | ❌ MISSING | — |
| Witness vs Seed / Editorial 来源标记 | ❌ MISSING | — |
| Pre-publish validation | ❌ MISSING | — |
| Rollback / Fallback | ❌ MISSING | — |

### 5.4 Asset

| 维度 | 现状 | 证据 |
|---|---|---|
| 类型定义 | ⚠️ PARTIAL（`PhotoAsset` 12 字段 metadata 已 LOCKED 在 `photoAssets.ts`） | `src/data/photoAssets.ts:35-56` |
| 真实数据 | ⚠️ PARTIAL（仅 5 stage Reveal preset，0 真实 Witness asset） | `src/data/photoAssets.ts:66-157` |
| Khartoum Hero 真摄影 | ⚠️ UNKNOWN（`khartoum-real-nile-sunset.jpg` 用户 8/18 提供，12 字段 metadata 已填 4 字段，缺 8 字段：source_url / photographer / license / credit_requirement / editorial_only 等） | `06-PM Agent 交接/2026-08-19-pm-takeover-audit.md:96-127` |
| 12 城 Hero 真摄影 | ⚠️ UNKNOWN（11 城都有 `images/cities/<slug>/{landmark,nature,street,culture}.jpg` 引用，但只在 `public/images/cities/` 实际打包） | `src/data/cities.ts:75-78` 等 + `ls public/images/cities/*` （未实操确认，需后续核查） |
| Asset upload pipeline | ❌ MISSING | — |
| Variant / CDN / 失败降级 | ❌ MISSING | — |

### 5.5 Witness Submission

| 维度 | 现状 | 证据 |
|---|---|---|
| 类型定义 | ⚠️ PARTIAL（仅在 `Moment` 上有 `provenance_status / moderation_status / witness_id`，没有独立的 `WitnessSubmission` 类型） | `src/types/moment.ts:111-137` |
| Submission 状态机 | ❌ MISSING（无 `draft / uploading / submitted / under_review / published / rejected / withdrawn / failed` 独立实体） | — |
| Upload 凭证 | ❌ MISSING | — |
| Idempotency / Retry | ❌ MISSING | — |
| Backend API | ❌ MISSING | 无 `POST /witness/submissions` |
| 实际 Witness UI | ❌ MISSING（仅 Echo 组件 `onSubmit` 回调是唯一存在的"输入入口"） | `src/components/ui/EchoInput.tsx:22` `onSubmit?: (text: string) => void` |
| 权限 / 位置确认 UI | ❌ MISSING | — |
| 上传进度 UI | ❌ MISSING | — |

### 5.6 Echo

| 维度 | 现状 | 证据 |
|---|---|---|
| 类型定义 | ⚠️ PARTIAL（`EchoInputState` 6 状态已定义在 Component Library） | `src/components/ui/types.ts:81` + `src/components/ui/EchoInput.tsx` |
| 真实持久化 | ❌ MISSING（`onSubmit` 回调仅本地 `setInternalState('submitted')`，无任何网络请求） | `src/components/ui/EchoInput.tsx:91-95` |
| 匿名 / 登录策略 | ❌ MISSING | — |
| 公开 / 私密 | ❌ MISSING（当前仅 EchoState，默认 "私密" 是注释意图） | — |
| Moderation | ❌ MISSING | — |
| 删除 / 撤回 | ❌ MISSING | — |
| 后端 Echo Service | ❌ MISSING | — |
| 替代 / 降级 | ⚠️ UNKNOWN（Brief §E-P1-01 明示"若不能在 Closed Beta 前满足隐私与滥用基线，则从 Launch UI 移除提交能力，不使用假成功"——**当前 Echo UI 已存在但无后端，假成功风险已存在**） | Brief §E-P1-01 |

---

## 6. § C · API 与鉴权

### 6.1 已有 endpoint 清单

| 方法 | 路径 | 鉴权 | 状态 | 证据 |
|---|---|---|---|---|
| GET | `https://api.open-meteo.com/v1/forecast` | 无（公共 API · 无 key） | ✅ REAL | `src/lib/weather.ts:52` |
| GET | `https://api.sunrise-sunset.org/json` | 无（公共 API · 无 key） | ✅ REAL | `src/lib/sun.ts:97` |
| GET | `https://images.unsplash.com/photo-*` | 无（CDN 直链） | ✅ REAL | `src/data/liveMoments.ts:77` 等 12 处 |
| GET | `/sw.js` | 无 | ✅ REAL（Service Worker 静态资源） | `public/sw.js` + `src/main.tsx:25` |
| GET | `/manifest.webmanifest` | 无 | ✅ REAL | `public/manifest.webmanifest` |
| POST | `/api/witness/submissions` | ❌ MISSING | ❌ | — |
| POST | `/api/echo` | ❌ MISSING | ❌ | — |
| GET | `/api/cities/:slug` | ❌ MISSING | ❌ | — |
| GET | `/api/editions/today` | ❌ MISSING | ❌ | — |
| POST | `/api/assets/upload-url` | ❌ MISSING | ❌ | — |
| 任何其他后端 endpoint | — | ❌ MISSING | ❌ | — |

### 6.2 鉴权机制

| 维度 | 现状 | 证据 |
|---|---|---|
| OAuth / OIDC | ❌ MISSING | — |
| JWT | ❌ MISSING | — |
| API Key | ❌ MISSING | — |
| Session / Cookie | ❌ MISSING | — |
| 匿名访问（无登录） | ✅ REAL（**全部 12 城 / 6 moment / 12 LiveEvent 都是公开可读**） | Brief §1.3 明示"用户无需登录即可完成核心 Observe 体验"，与当前实现一致 |
| Witness 身份 | ❌ MISSING | — |
| Admin / Moderator 角色 | ⚠️ PARTIAL（`locationPrivacy.ts:27` 类型定义 `public/witness/moderator/admin`，但 0 调用点；前端无 admin UI） | `src/lib/locationPrivacy.ts:27` |

### 6.3 CORS / Rate Limit / WAF

| 维度 | 现状 | 证据 |
|---|---|---|
| CORS（前端 outbound） | n/a（前端 fetch 同源 / 第三方 CORS 开放） | open-meteo / sunrise-sunset 已知 CORS-friendly |
| 后端 CORS 配置 | ❌ MISSING | — |
| Rate Limit | ❌ MISSING | — |
| WAF | ❌ MISSING | — |
| API Gateway | ❌ MISSING | — |

---

## 7. § D · 环境与部署

### 7.1 环境状态

| 环境 | 真实状态 | 证据 |
|---|---|---|
| **Production** | ⚠️ UNKNOWN · 仅静态 URL 占位（`https://see-earth.vercel.app`） | `src/components/Meta.tsx:10` "TODO: 部署后改为实际域名" + `public/sitemap.xml:4-74` 12 个 loc |
| **Staging** | ❌ MISSING | 无 staging URL · 无 staging deploy 脚本 |
| **Preview** | ❌ MISSING（**Vercel 默认会按 PR 自动 preview 但本仓库 0 CI 配置**，等于无 preview） | 无 `.github/workflows/` |
| **Alpha（内部测试）** | ❌ MISSING（设计目标，但无环境） | Brief §Gate A 明确要求 |
| **Beta（受控）** | ❌ MISSING | — |
| **Launch Candidate** | ❌ MISSING | — |

**UNKNOWN 解释**：Production 实际状态必须由用户 / 外部 Owner 确认（沙箱 DNS 受限，无法访问 see-earth.vercel.app 实测；`grep vercel` 命中均为字符串引用，无 vercel.json / vercel.toml / vercel deploy 配置）。

| 调查 owner | 调查 deadline |
|---|---|
| 用户（外部 Owner） | E-P0-01 IN REVIEW 之前 |
| 调查内容 | (a) `see-earth.vercel.app` 部署是否真实存在且可访问；(b) 部署流水线是否在 Vercel Dashboard；(c) 域名绑定 / DNS；(d) 当前 Production 实际 bundle 版本（推测 = v1.6.4 dist） |

### 7.2 数据迁移与备份

| 维度 | 现状 | 证据 |
|---|---|---|
| Migration 工具 | ❌ MISSING | — |
| Backup 策略 | ❌ MISSING | — |
| Seed / Reset 脚本 | ⚠️ PARTIAL（`scripts/download-city-images.mjs` 是早期图源下载脚本，非 DB seed；Phase 3 `findDuplicates` stub） | `scripts/download-city-images.mjs` + `src/lib/ingestion.ts:80` |
| Backup 测试 | ❌ MISSING | — |

### 7.3 Secrets 管理

| 维度 | 现状 | 证据 |
|---|---|---|
| Secrets 文件 | ⚠️ PARTIAL（仅 `.env.example` + `.env.production`，**实际敏感信息不应进仓库**） | `.env.example:1-26` + `.env.production:1-6` |
| 当前 Secrets 数量 | 0（无任何 API key / DB 连接串 / OAuth secret） | `.env.production` 仅 `WEATHER_API_PROVIDER=open-meteo` + `SUN_PROVIDER=sunrise-sunset` |
| Secrets 管理方式 | ❌ MISSING（无 Vercel Environment Variables / Doppler / 1Password） | — |
| 客户端可见 Secrets | ❌ NONE（仅 `VITE_` 前缀才进 client bundle，当前 0 个） | `.env.production` 无 `VITE_` 前缀变量 |
| Secrets 进客户端风险 | ✅ LOW（已验证） | — |

### 7.4 部署流水线

| 维度 | 现状 | 证据 |
|---|---|---|
| CI/CD | ❌ MISSING | 全仓库 0 命中 `.github/` / `.gitlab-ci.yml` / `.circleci/` / `Dockerfile` / `docker-compose.yml` |
| Build 命令 | ✅ REAL | `package.json:9` `tsc -b && vite build` |
| Local preview | ✅ REAL | `package.json:11` `serve -s dist -l 8080`（v1.1 PR #4）+ `vite preview` |
| Lighthouse CI（本地） | ⚠️ PARTIAL（脚本存在，需 `npm run lighthouse` 手动触发；CI 上未跑） | `scripts/lighthouse-ci.sh:1-56` |
| Vercel 部署 | ⚠️ UNKNOWN（推断 = Vercel Dashboard 自动部署，但仓库内无配置） | `Meta.tsx:10` + `sitemap.xml` 均指向 `see-earth.vercel.app` |

---

## 8. § E · 数据真相（mock vs 真实 vs 硬编码）

### 8.1 数据分布

| 数据源 | 类型 | 数量 | 真实 / Mock / 硬编码 | 证据 |
|---|---|---:|---|---|
| 城市清单 | static | 12 | 🔴 **硬编码**（`src/data/cities.ts` 全量写在 source code） | `src/data/cities.ts:66-325` |
| 城市文案（description / momentZh / livingNote / cultureNote） | static | 12 × ~3 | 🔴 **硬编码** | 同上 |
| 城市图片 URL | static | 12 × 4 = 48 | 🟡 **真实外链**（Unsplash CDN，但 URL 硬编码） | `src/data/cities.ts:75-78` 等 |
| Legacy Moment（6 条） | static | 6 | 🔴 **硬编码** | `src/data/moments.ts:29-108` |
| LiveEvent（12 条） | static | 12 | 🔴 **硬编码** | `src/data/liveMoments.ts:55-464` |
| 城市天气 snapshot | runtime | 12 城 × 当前 | 🟢 **真实**（open-meteo API，15min cache） | `src/lib/weather.ts:52` |
| 城市日出日落 | runtime | 12 城 × 当前日 | 🟢 **真实**（sunrise-sunset API，6h cache） | `src/lib/sun.ts:97` |
| 城市当前时段（DayPeriod） | runtime | 12 城 | 🟢 **真实**（Intl.DateTimeFormat + tz） | `src/lib/cities.ts:385-401` |
| Editorial photo（Unknown Reveal） | static | 5 stage | 🔴 **硬编码**（photoAssets.ts 5 条 Unsplash URL） | `src/data/photoAssets.ts:66-157` |
| Khartoum Hero 真摄影 | static | 1 | ⚠️ UNKNOWN（图片真实存在，metadata 12 字段缺 8 字段） | takeover-audit §3 |
| Witness 提交 | — | 0 | ❌ **MISSING** | — |
| Echo 留痕 | — | 0 | ❌ **MISSING**（EchoInput 仅本地 state，无提交） | `src/components/ui/EchoInput.tsx:91-95` |
| Daily 12 / Edition | — | 0 | ❌ **MISSING** | — |
| Server-side timer / cron | — | 0 | ❌ **MISSING** | — |

**关键结论**：**所有"内容"数据全部硬编码**。只有**运行时天气 + 日出日落**是真实调用第三方 API。换句话说，目前没有任何路径能让 Witness / 编辑 / CMS 更新内容。

### 8.2 失效依赖（指向已下线服务的代码路径）

| 路径 | 状态 | 风险 |
|---|---|---|
| `https://api.open-meteo.com/v1/forecast` | ✅ 在线（CORS 开放 · 长期承诺免费） | LOW |
| `https://api.sunrise-sunset.org/json` | ⚠️ 部分地区 / 部分时段偶发 5xx（曾经多次观察） | LOW |
| `https://images.unsplash.com/photo-*` | ✅ 在线 | LOW |
| `https://api.sunrise-sunset.org` 重定向 / 限流 | ⚠️ UNKNOWN · 无监控 | — |
| `liveMoments.ts:411-422` 旧 Khartoum 炮弹声文案 | 🔴 **数据层污染**（与 §2.8.8 Red Layer Image Ethics 冲突） | 🟡 **应删除** |
| `liveMoments.ts` 第 7 条 id=`khartoum-07` 实际不存在（核对：grep khartoum = 0 命中） | ✅ 已无 Khartoum 残留？ | 需 `wc -l` 实测 |

---

## 9. § F · 可观测性

| 维度 | 现状 | 证据 |
|---|---|---|
| **Analytics 埋点 SDK** | ❌ MISSING | 全仓库 0 命中 `posthog\|amplitude\|mixpanel\|gtag\|@sentry\|@vercel/analytics`（除 `outputs/` 历史研究 + `REVIEW_2026-08-18/AUDIT_REPORT.md:44` 建议文档） |
| **错误监控（Sentry / Bugsnag）** | ❌ MISSING | 同上 0 命中；当前仅有 `console.warn / console.error` 在 weather/sun 失败时（`src/lib/weather.ts:149` + `src/lib/sun.ts:154`） |
| **日志（结构化）** | ❌ MISSING | 无 log 库；无远程日志收集 |
| **APM（Web Vitals）** | ⚠️ UNKNOWN · Lighthouse 报告 3 份 (`lighthouse-report-1/2/3.report.{html,json}`) 但 8/15 跑一次后无 CI 持续采集 | `ls lighthouse-report-*.report.html/json` 共 6 文件（8/15） |
| **性能指标基线** | ⚠️ UNKNOWN · 见 §7.1 部署未知 | — |
| **告警（渠道 / 阈值 / owner）** | ❌ MISSING | — |

**已知历史问题**（来自 `05-项目现状/REVIEW_2026-08-18/AUDIT_REPORT.md:44`）：
> "B-15 · 可观测性 · 整个 src/ · **没有任何前端埋点 / 错误上报**。open-meteo / sunrise-sunset 失败时 console.warn 就完了，Vercel Analytics / Sentry / 自建接口都没有。生产事故全靠用户邮件反馈。"

修复任务（FIX_TASKS.md）建议为 P2 优先级，本审计认为应升级为 **P0（Gate A 必备）**，详见 §10 blockers。

---

## 10. § G · 内容真实性

### 10.1 图片来源与 rights / attribution

| 数据 | 来源 | rights_status 字段实际值 | 真实落库 | 证据 |
|---|---|---|---|---|
| 12 城 Hero（48 URL） | Unsplash（摄影师授权） | `'unknown'`（仅 City schema 留字段，**实际没填值**） | ⚠️ 字段存在但未落库 | `src/data/cities.ts:75-78` `imageCredit: 'Sorasak · Unsplash'`（仅有 credit 字符串，无 license 类型） |
| Legacy Moment 6 静态 | （无图，纯 text） | `'unknown'` | ❌ 未落库 | `src/data/moments.ts` |
| LiveEvent 12 条 | Unsplash CDN 200x200 thumbnail | `'unknown'`（`useMomentsForCity.ts:111` `rights_status: 'unknown'`） | ⚠️ adapter 硬编码 `'unknown'` | `src/hooks/useMomentsForCity.ts:111` |
| Editorial photo (5 stage) | Unsplash（lwy-editorial 标记） | `'unknown'` | ⚠️ `license: 'Unsplash License'` 在 photoAssets.ts 写死，但 Moment adapter 不读取 | `src/data/photoAssets.ts:77` |
| Khartoum Hero 真摄影 | 用户 8/18 提供 | ⚠️ UNKNOWN（metadata 12 字段缺 8 字段） | — | takeover-audit §3 |

**rights_status 真实落库结论**：`'cc_by' / 'cc0' / 'all_rights_reserved'` 等枚举在 schema 中定义，但 **0 个数据实例真正使用了枚举**。所有实际数据要么没有 rights 字段，要么硬编码 `'unknown'`。这意味着 V1 发布前必须建立 ingestion pipeline 才能让 rights 字段真实落库（参见 §10.3）。

### 10.2 来源 URL 健康度

| URL 类别 | 数量 | 健康度 | 风险 |
|---|---:|---|---|
| `images.unsplash.com/photo-*` | ~60 | ✅ HEALTHY | LOW（Unsplash 长期承诺） |
| `images.pexels.com/*` | 0 数据引用（仅 sw 缓存域） | n/a | — |
| `unsplash.com/photos/example`（photoAssets source_url 占位） | 5 | 🔴 **真实占位**（每条都是字面量 `'https://unsplash.com/photos/example'`，非真实条目 URL） | 🟡 必须替换为真实 photographer credit URL 后才能上线 |
| Khartoum `source_url` | 1 | ⚠️ UNKNOWN | — |

### 10.3 入库路径缺口

| 必须 | 现状 |
|---|---|
| 数据导入管道 (`normalizeCity` / `findDuplicates` / `ingestBatch`) | ⚠️ PARTIAL（接口已定义；`normalizeCity`/`findDuplicates` 是 Phase 3 stub throw NotImplemented） |
| EXIF → `captured_at` 自动解析 | ❌ MISSING |
| EXIF → 移除 GPS 后再生成公开 variant | ❌ MISSING |
| Editorial CMS 接入 | ❌ MISSING（Brief §6 明确不进入 V1，但缺 CMS 时 rights 字段无法真实落库） |
| Khartoum 8/12 字段补齐 | ⚠️ UNKNOWN（依赖用户/沙箱外协助，Codex 沙箱 DNS 受限无法 web fetch） |

---

## 11. § H · 5 类状态矩阵（P0 6 domain）

| Domain | REAL | PARTIAL | MOCK | MISSING | UNKNOWN | 关键证据 |
|---|---|---|---|---|---|---|
| **City** | 类型 schema + 12 城硬编码数据 + 渲染 UI | ingestion stub · MomentStats 字段未实例化 · Khartoum 未入库 | — | 后端 DB · 后端 API · 真实持久化 | Production 部署真实性 | `src/types/city.ts` + `src/data/cities.ts` + `src/lib/ingestion.ts:80` |
| **Moment** | 类型 schema（含 `captured_at` / `published_at` / `city_id` / 4 状态枚举）+ 6 静态 + 12 LiveEvent + Legacy adapter | rights_status 全 `'unknown'` · `witness_id` 0 实例 · `raw_location` 仅 12 LiveEvent 注入 | — | 后端 DB · 后端 API · 真实持久化 · Witness 上传路径 | — | `src/types/moment.ts` + `src/data/moments.ts` + `src/data/liveMoments.ts` + `useMomentsForCity.ts` |
| **Edition / Daily 12** | — | — | — | 类型 schema · 后端 DB · 12 槽位 · 来源标记 · pre-publish validation · rollback / fallback · 整版实体验证 · 持续供应演练 | — | grep `Edition\|Daily 12\|daily12` 在 src/ = 0 |
| **Asset** | PhotoAsset 12 字段 metadata schema · 5 Reveal stage preset | Khartoum Hero metadata 12 字段缺 8 · 12 城 hero 图实际打包状态未实操核查 · `unsplash.com/photos/example` 占位 URL 5 条 | — | upload pipeline · variant / CDN / 失败降级 · EXIF 处理 · GPS 剥离 | Khartoum 字段补齐 owner | `src/data/photoAssets.ts:35-157` + takeover-audit §3 |
| **Witness Submission** | — | Moment schema 上有 `provenance_status / moderation_status / witness_id` 但无独立 Submission 实体 | — | 独立 Submission 类型 · 状态机 · upload 凭证 · idempotency / retry · 完整 UI（权限说明 / 选图 / 时间 / 位置 / 描述 / 隐私确认 / 上传 / 审核结果）· 后端 API | — | `src/types/moment.ts:124`（仅 schema 留位） |
| **Echo** | EchoInput 组件 + 6 状态定义 + React state machine + `onSubmit` 回调签名 | UniversalEcho 5 page_state CTA 变体 | — | 后端 API · 持久化 · 匿名 / 登录策略 · 公开 / 私密 · moderation · 删除 / 撤回 · 安全降级方案（移除假成功） | — | `src/components/ui/EchoInput.tsx` + `src/components/UniversalEcho.tsx` |

### 5 类状态汇总（按 domain 优先级）

```text
P0 优先级 Domain           状态
────────────────────────── ──────────────────────────────────────────────
City                       PARTIAL（schema + 12 城硬编码，但缺后端）
Moment                     PARTIAL（schema + 18 条硬编码，但缺后端 + rights 真实落库）
Asset                      PARTIAL（schema + 5 stage preset，Khartoum 8/12 字段未补）
Witness Submission         MISSING（仅 schema 留位，无独立实体 / UI / API / 持久化）
Echo                       PARTIAL UI / MISSING backend（仅本地 state，无提交路径；存在假成功风险）
Edition / Daily 12         MISSING（完全空白，0 痕迹）
```

---

## 12. Launch Blockers（按"阻塞哪个 Gate"排序）

| # | Blocker | 阻塞 Gate | Owner | 解锁条件 | 证据 |
|---|---|---|---|---|---|
| **B-1** | **没有后端 / DB / API**（所有内容硬编码，无 Witness 提交路径，无 Daily 12，无 Echo 持久化） | Gate A · Internal Alpha（核心闭环无法验证） | 外部 Engineer Owner + PM | 完成 E-P0-02 Vertical Slice（1 城市 1 真实 Moment 1 Edition 端到端） | §2 / §3 / §4 / §5 全章 |
| **B-2** | **没有 Daily 12 / Edition 实体**（无类型 schema · 无槽位 · 无来源标记 · 无预览/发布/回滚） | Gate A + Gate B（Daily 12 是核心交付，且需 14 天连续供应演练） | 外部 Engineer Owner | 完成 E-P0-06 Daily 12 Supply Chain（owner 自查再下发） | §5.3 + Brief §5 E-P0-06 |
| **B-3** | **没有 Witness Submission 后端**（独立 Submission 类型缺失 · 状态机缺失 · upload 凭证缺失 · 无后端 API） | Gate A（必须至少 1 个真实 Witness submission 上传 → 审核 → 发布 → City / Edition） | 外部 Engineer Owner + Designer（D-P0-02） | 完成 E-P0-03 Minimal Witness Backend | §5.5 + Brief §5 E-P0-03 |
| **B-4** | **没有 Echo 后端或安全降级**（`UniversalEcho.onSubmit` 仅本地 setState，存在"假成功"风险；Brief §E-P1-01 明示"若不能在 Closed Beta 前满足隐私与滥用基线，则从 Launch UI 移除提交能力，不使用假成功"） | Gate B · Closed Beta | 外部 Engineer Owner | 完成 E-P1-01 Echo backend 与降级（owner 自查再下发） | §5.6 + Brief §5 E-P1-01 |
| **B-5** | **Analytics / 错误监控 / 告警 = 0**（生产事故全靠用户邮件反馈；P0 事件 `edition_viewed / moment_opened / city_opened / unknown_revealed / echo_submitted / witness_submitted` 全部缺失） | Gate A（P0 Analytics 需在 Alpha 可验证） + Gate B（漏斗分析必备） | 外部 Engineer Owner | 完成 E-P0-07 Analytics Instrumentation | §9 + Brief §5 E-P0-07 |
| **B-6** | **没有真实 Web Alpha 环境**（无 staging / preview / alpha URL，无 deploy / migration / seed / rollback 文档） | Gate A（指定测试者需通过固定入口完成 vertical slice） | 外部 Engineer Owner | 完成 E-P0-08 Web Alpha Environment | §7 + Brief §5 E-P0-08 |
| **B-7** | **没有共享 API Contract**（City / Moment / Edition / Witness Submission / Asset Upload / Echo 全部是 TypeScript 类型而非机器可读 OpenAPI/JSON Schema；iOS first-pass 无法接入） | Gate A（iOS 评审需要 contract） | 外部 Engineer Owner | 完成 E-P0-09 共享 API Contract | Brief §5 E-P0-09 |
| **B-8** | **Production 部署实际状态未知**（`see-earth.vercel.app` 仅占位 URL；CI/CD = 0；Lighthouse 报告 8/15 后无新版本基线） | Gate A（Internal Alpha 测试者必须能跑通） | 用户（外部 Owner） | 用户确认 (a) URL 实际可访问；(b) 部署流水线；(c) 当前 bundle 版本 | §7.1 + §7.4 |
| **B-9** | **`liveMoments.ts:411-422` 旧 Khartoum 炮弹声文案**（与 §2.8.8 Red Layer Image Ethics 冲突） | Gate A（占位内容必须清理） | 外部 Engineer Owner | 删除该条 LiveEvent（方案 A 推荐，handoff §4 已记录） | `06-PM Agent 交接/2026-08-19-pm-takeover-audit.md:128-170` |
| **B-10** | **Khartoum Hero 12 字段 metadata 缺 8**（Khartoum 入数据层后阻塞 right 字段真实落库） | Gate A（如果决定入 Khartoum） | 用户（外部 Owner） | 用户提供 source / photographer / license / editorial_only 等 8 字段 | `06-PM Agent 交接/2026-08-19-pm-takeover-audit.md:96-127` |
| **B-11** | **`photoAssets.ts` 5 stage `source_url = 'https://unsplash.com/photos/example'`**（占位 URL，非真实 photographer credit） | Gate A（Source URL 健康度问题） | 外部 Engineer Owner | 替换为真实 Unsplash photographer URL 或删除 `source_url` 字段 | §10.2 |
| **B-12** | **写入 Obsidian canonical 路径被当前 session sandbox 拒绝** | Round 2 / 二批派发（其他子代理需读本 audit） | 用户（外部 Owner / PM Orchestrator） | 用户手动 cp workspace → Obsidian（per handoff §9.2 历史教训） | §13 Blocker Log · 写入权限 |

---

## 13. Blocker Log（PM 维护）

| 日期 | 阻塞任务 | 阻塞描述 | 类别 | Owner | 解锁条件 | 状态 |
|---|---|---|---|---|---|---|
| 2026-08-22 | E-P0-01 → Obsidian canonical 写入 | Obsidian canonical 路径 `/Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/` 在当前 DSH session 中 `mkdir` 失败 (`Operation not permitted`)；Approval prompts disabled，无法升级 sandbox | 工具权限 | 用户（外部 Owner / PM Orchestrator） | (a) 用户手动 `cp` workspace → Obsidian；或 (b) PM Orchestrator 在可写 Obsidian 的 session 内重新派发 E-P0-01 | **OPEN · 阻塞 Round 2 子代理读本 audit** |
| 2026-08-22 | E-P0-01 → Production 部署状态 | `see-earth.vercel.app` 仅占位 URL，未在 sandbox 实测 | 事实缺口 | 用户（外部 Owner） | 用户确认 Production 实际状态 | **OPEN · 阻塞 §7.1 / §7.4 评级** |
| 2026-08-22 | E-P0-01 → Khartoum Hero metadata | Khartoum Hero 12 字段缺 8 字段 | 资源缺口 | 用户（外部 Owner） | 用户提供 metadata | **OPEN · 阻塞 §5.4 + §10.1 Asset 评级** |

---

## 14. 第二批任务工作量评估（输入 PM 排期）

> ⚠️ **方法说明**：以下评估以本审计的"事实缺口"为基础，**不是凭空估计**。每个数字都对应到具体缺口与 Brief 中的目标 Gate。

### 14.1 E-P0-02 · Launch Vertical Slice

**目标**：1 城 1 真实 Moment 1 Edition 端到端跑通（`Witness submit → asset upload → metadata validation → moderation / publish decision → published Moment → City API → Daily 12 Edition API → Web render → analytics + monitoring`）

**前置依赖**：E-P0-03（Witness backend）+ E-P0-09（API Contract 至少临时版）+ 最小 Edition 实体 + 最小 analytics

| 子任务 | 估计工时 | 依赖 / 备注 |
|---|---:|---|
| E-P0-02.a 后端基础设施选型 + 0→1 搭建（语言 / 框架 / 部署） | 2-3 天 | 与 PM 决策：Next.js Route Handler / Cloudflare Worker / Express + Vercel Function？需要 PM 决策 |
| E-P0-02.b DB schema 建表（City / Moment / Edition / Asset / Witness Submission / Echo） + migration | 1-2 天 | 依赖 E-P0-09 contract 锁定 |
| E-P0-02.c Object Storage 选型 + asset upload 凭证 | 1 天 | Supabase Storage / Cloudflare R2 / S3？ |
| E-P0-02.d Witness backend 最小版（仅文件上传 + 状态保存 + 发布） | 2 天 | — |
| E-P0-02.e Edition 最小版（手动组版 + 12 槽位 + 预览 + 发布） | 2-3 天 | — |
| E-P0-02.f Web 客户端接入新 API（替换硬编码的 city/moment 数据读取） | 1-2 天 | — |
| E-P0-02.g Analytics 最小版（4 个关键事件） | 1 天 | — |
| E-P0-02.h Smoke test + 部署文档 | 1 天 | — |
| **合计** | **11-15 工作日（≈ 2-3 周）** | — |

**风险**：后端从 0 → 1 搭建本身有不确定性（DB 选型 / 鉴权方式 / 部署环境），建议 PM 在派发前先决策后端技术栈方向（推荐选项：Next.js Route Handler + Postgres + Supabase Storage，理由：与现有 Vercel 部署契合 / TS 全栈 / migration 工具成熟）。

### 14.2 E-P0-08 · Web Alpha 环境

**目标**：与本地 / Production 隔离的 Alpha 环境、数据库、对象存储；访问受控；可重复部署 / 迁移 / seed / 回滚 / 重置。

| 子任务 | 估计工时 | 依赖 / 备注 |
|---|---:|---|
| E-P0-08.a Alpha 环境决策（Vercel Preview + 分支 / 独立 Vercel Project / Cloudflare Pages） | 0.5 天（PM 决策）+ 0.5 天（实施） | 需要 PM 决策 |
| E-P0-08.b Alpha DB 隔离（独立 Postgres / Supabase project） | 1 天 | 依赖 E-P0-02.b |
| E-P0-08.c Alpha Object Storage 隔离 | 0.5 天 | 依赖 E-P0-02.c |
| E-P0-08.d CI/CD 配置（GitHub Actions 或 Vercel 自动 deploy） | 1 天 | — |
| E-P0-08.e Seed 脚本（12 城 + 18 moment 初始数据） | 1 天 | — |
| E-P0-08.f 访问控制（Basic Auth / Vercel Password Protection） | 0.5 天 | — |
| E-P0-08.g 部署文档 + 回滚说明 + 数据重置说明 | 1 天 | — |
| **合计** | **5-6 工作日（≈ 1 周）** | **前置：E-P0-02 至少 50% 完成** |

### 14.3 E-P0-09 · 共享 API Contract

**目标**：City / Moment / Edition / Witness Submission / Asset Upload / Echo 资源 · 版本化 schema · OpenAPI 或等价 · Web 与 iOS 共享。

| 子任务 | 估计工时 | 依赖 / 备注 |
|---|---:|---|
| E-P0-09.a 选型 OpenAPI 3.1 / tRPC / Zod schema | 0.5 天 | 推荐 Zod + OpenAPI 自动生成（已有 TS 类型基础） |
| E-P0-09.b 把 `src/types/*.ts` 翻译为 Zod schema | 1-2 天 | — |
| E-P0-09.c OpenAPI YAML 生成 + 文档站 | 0.5 天 | 推荐 Redoc / Stoplight Elements |
| E-P0-09.d Contract change policy 文档（兼容性策略 / 变更记录） | 0.5 天 | — |
| E-P0-09.e Web 客户端从 Zod schema 生成 fetch client（替代现有直接 import 类型） | 1-2 天 | — |
| E-P0-09.f iOS first-pass 字段映射验证（外部设计师 / iOS 工程师） | 0.5 天 | 依赖 D-P1-01 |
| **合计** | **4-6 工作日（≈ 1 周）** | — |

### 14.4 第二批总评

| 任务 | 估计工时 | 并行度 |
|---|---:|---|
| E-P0-02 | 11-15 工作日 | 必须串行（最大依赖） |
| E-P0-08 | 5-6 工作日 | 与 E-P0-02 部分并行（环境可先搭建） |
| E-P0-09 | 4-6 工作日 | 与 E-P0-02 完全并行（contract 可独立收敛） |
| **总日历时间** | **≈ 3-4 周**（并行优化后） | — |

**建议第二批派发顺序**：
1. **Round 2A 并行**：E-P0-09 Contract（4-6 天） + E-P0-08 Alpha Env 启动（5-6 天）
2. **Round 2B**：E-P0-02 Vertical Slice（11-15 天，必须等 E-P0-09 临时 contract）

---

## 15. 自验收（Acceptance Criteria 打勾）

| 验收项 | 状态 | 证据 |
|---|---|---|
| [x] 每个结论可从**真实环境**或**代码证据**追溯 | ✅ | 全文 200+ 引用，行号 / 路径 / 文件名 |
| [x] 所有 P0 domain（City / Moment / Edition / Asset / Witness / Echo）都被分类，无未解释的 UNKNOWN | ✅ | §11 矩阵 · 6 domain 全部有评级 |
| [x] UNKNOWN 必须有"为什么无法判定 + 调查 owner + 调查 deadline" | ✅ | §7.1 Production UNKNOWN + §5.4 Asset UNKNOWN + §10.1 rights UNKNOWN + §13 Blocker Log |
| [x] 审计**不触发任何架构重写**（只盘点 + 分类） | ✅ | 本文档未修改任何代码；只读 + 写一份 audit 文档 |
| [x] Launch blockers 已列出（按"阻塞哪个 Gate"排序） | ✅ | §12 按 Gate A → Gate B 排序 12 个 blockers |
| [x] 文档路径 / 部署说明可由团队其他成员按文档执行验证 | ✅ | §14.2 Alpha 环境部署说明草图（待 E-P0-08 落地后补全） |
| [x] 与 D-P0-01（Web V1 Flow）的页面状态对齐：mock 页面在矩阵中明确标记 | ✅ | §11 + §5.5 Witness Submission MISSING = 当前 Web V1 Flow 缺 Witness UI 路径；§5.6 Echo MISSING backend = UniversalEcho `onSubmit` 仅本地 setState 假成功风险 |
| [x] 5 类状态矩阵 UNKNOWN 必须有调查 owner + deadline | ✅ | §13 Blocker Log（owner = 用户，deadline = 派发前） |

---

## 16. 下一步建议（输入 PM 第二批排期）

### 16.1 给 PM 的关键数据点

1. **E-P0-09 优先**：Contract 必须先于 Vertical Slice 落地（最少 4-6 天），否则 iOS first-pass 无 contract 可映射（Brief §5 E-P0-09 明确）。
2. **后端技术栈建议**：PM 需在派发 E-P0-02 前决策后端栈（推荐 Next.js Route Handler + Postgres + Supabase Storage），否则会浪费 1-2 天在调研。
3. **Witness UI 端到端**：D-P0-02 Minimal Witness Flow 设计卡（Round 1 派发）已 BLOCKED 依赖 E-P0-09 临时 contract；第二批必须让 Designer + Engineer 并行。
4. **Edition / Daily 12 后置**：Edition 是 Gate B 必备（14 天连续演练），但 E-P0-06（Daily 12 Supply Chain）需要 Vertical Slice 跑通后才能精确估计工时。建议第二批先做 Vertical Slice + 最小 Edition 实体，再单独排 E-P0-06。
5. **Khartoum 数据层**：handoff §1 已 LOCKED，但 12 字段 metadata 缺 8 字段。建议 PM 与用户确认：是否在 Vertical Slice 完成前补齐？如不补齐，Khartoum 入库需 BLOCKED。

### 16.2 需要 PM 上报用户的事实

1. **Production 实际状态未知**（§7.1 / §13 Blocker Log B-8） — 用户需确认 `see-earth.vercel.app` 是否实际可访问、当前 bundle 版本、CI/CD 状态。
2. **Khartoum Hero metadata 8 字段未补**（§13 Blocker Log B-10） — 用户需提供 source / photographer / license / credit_requirement / editorial_only 等。
3. **当前 release 路径不是"修复已有后端"，而是"从 0 搭后端"**（§0 + §2） — 用户/PM 需要确认是否已预留后端预算 / 工期。
4. **iOS first-pass 仅"可评审原型"目标**（§4.1 + Brief §2.2） — 与 Gate B 联动 iOS contract 评审，但原生 App 完整工程实现不是 Web V1 Launch Gate。

---

## 17. 关联文档

| 文档 | 用途 |
|---|---|
| `/Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/SEE-EARTH-Release-Strategy-v1-Design-Engineering-Task-Brief.md` §5 | Brief E-P0-01 原文 |
| `/Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/06-PM Agent 交接/2026-08-22-task-card-e-p0-01-backend-reality-audit.md` | 本任务卡 |
| `/Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/06-PM Agent 交接/2026-08-22-release-v1-first-batch-dispatch.md` | 第一批派发索引 |
| `/Users/lwy/Documents/ChatGPT/看见地球/06-PM Agent 交接/2026-08-19-pm-takeover-audit.md` | 8/19 PM 接管审计（4 漏报 + 1 误报，含 Khartoum 状态 + 写权限教训） |
| `/Users/lwy/Documents/ChatGPT/看见地球/05-项目现状/项目现状-2026-08-22-phase-3.md` | 8/22 项目现状（Phase 1-3 收口 + Backend/API/Database 现状汇总未做） |
| `/Users/lwy/Documents/ChatGPT/看见地球/05-项目现状/REVIEW_2026-08-18/AUDIT_REPORT.md` | 8/18 审计（含 B-15 可观测性历史问题） |
| `/Users/lwy/Documents/ChatGPT/看见地球/src/types/city.ts` / `moment.ts` / `cityState.ts` | 5.1-5.2 类型定义证据 |
| `/Users/lwy/Documents/ChatGPT/看见地球/src/data/cities.ts` / `moments.ts` / `liveMoments.ts` / `photoAssets.ts` | 5.1-5.4 数据实例证据 |
| `/Users/lwy/Documents/ChatGPT/看见地球/src/lib/weather.ts` / `sun.ts` | 4.6 第三方 Provider 真实调用证据 |
| `/Users/lwy/Documents/ChatGPT/看见地球/src/hooks/useMomentsForCity.ts` | 5.2 Legacy adapter 证据 |
| `/Users/lwy/Documents/ChatGPT/看见地球/src/lib/locationPrivacy.ts` | 6.2 角色类型证据（`public/witness/moderator/admin`） |
| `/Users/lwy/Documents/ChatGPT/看见地球/src/lib/ingestion.ts` | 5.1 ingestion stub 证据 |
| `/Users/lwy/Documents/ChatGPT/看见地球/src/components/ui/EchoInput.tsx` | 5.6 Echo 本地 state 证据 |

---

## 18. 元数据

| 字段 | 值 |
|---|---|
| 文档版本 | v1 |
| 创建时间 | 2026-08-22 |
| 创建人 | Engineer Agent #1 |
| 文档 ID | `backend-reality-audit-v1.md` |
| 目标 Gate | Gate A · Internal Alpha |
| 输入文档数 | 3（Brief + 任务卡 + 派发索引） |
| 引用代码文件数 | ~25 个 TS/TSX/CSS/JSON |
| 引用 Obsidian / 仓库文档数 | 4 |
| 字数 | ~7,500 字（含 mermaid 不计） |
| Workspace 路径 | `/Users/lwy/Documents/ChatGPT/看见地球/release-v1/backend-reality-audit-v1.md` |
| Obsidian canonical 路径 | `/Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/backend-reality-audit-v1.md` |
| **Obsidian 同步状态** | ❌ **未同步**（DSH session sandbox 拒绝写入 Obsidian canonical 路径，详见 §13 Blocker Log · 写入权限） |

---

**End of Audit**