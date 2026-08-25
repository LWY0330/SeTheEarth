---
title: SEE EARTH V1 · E-P0-05 · 角色权限矩阵 · v1.0.0
type: role-permission
tags: [release-v1, e-p0-05, location-isolation, rbac, role-permission, access-control, see-earth]
task_id: E-P0-05
brief_anchor: "Release Strategy Brief §5 E-P0-05 · 角色权限 + D 任务卡"
track: engineering
owner: Engineer Agent #6 (external Owner = 用户)
created: 2026-08-24
status: DRAFT · IN REVIEW（待同步 Obsidian）
target_gate: Gate A · Internal Alpha
source_brief: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/SEE-EARTH-Release-Strategy-v1-Design-Engineering-Task-Brief.md
source_task_card: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/06-PM Agent 交接/2026-08-22-task-card-e-p0-05-location-isolation.md
related_docs:
  - ./data-architecture-v1.md §5
  - ./public-private-split-v1.md
  - ./audit-log-v1.md
  - ./encryption-v1.md
  - ../api-contract/contract-decisions-v1.md §2
  - /Users/lwy/Documents/ChatGPT/看见地球/src/lib/locationPrivacy.ts
depends_on:
  - E-P0-01 (✓ ACCEPTED)
  - E-P0-09 (✓ ACCEPTED)
blocks: [E-P0-03, E-P0-10]
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/06-PM Agent 交接/release-v1/e-p0-05-location-isolation/role-permission-v1.md
workspace_canonical_path: /Users/lwy/Documents/ChatGPT/看见地球/release-v1/e-p0-05-location-isolation/role-permission-v1.md
sync_required: true · sandbox 拒绝写入 Obsidian
note: 本文件已就绪，需 PM Agent 由 Obsidian 写入权限落地到 canonical 路径。
---

# SEE EARTH V1 · E-P0-05 · 角色权限矩阵 · v1.0.0

> **作者**：Engineer Agent #6（外部 Owner = 您 / PM Orchestrator）  
> **完成时间**：2026-08-24  
> **目的**：把 V1 的 5 个角色（anon / user / witness / moderator / admin / system）对**所有 SEE EARTH 资源**（特别是 `cities` / `moments` / `witness_submissions` / `private_locations` / `private_location_access_log`）的访问权矩阵化、可执行化。

---

## 0. 一句话总结

**V1 共 5+1 个角色：anon（匿名访客）/ user（注册用户，V1 = 同 anon）/ witness（Witness session）/ moderator（内容审核员）/ admin（系统管理员）/ system（后台 Job / Cron）。其中只有 `moderator` / `admin` / `system` 三个角色对 `private_locations` 有读权限，且每次读都必须写 `private_location_access_log`。其余角色即使通过 SQL / API / GraphQL / 任何途径尝试访问 `private_locations` 都返回 0 行 / 403 / RLS reject。**

---

## 1. 角色定义（V1）

| 角色 | PostgreSQL role | 业务身份 | 鉴权方式 | V1 实际启用 |
|---|---|---|---|---|
| **anon** | `seeearth_anon` | 匿名访客（无登录） | 无（无需 token） | ✅ 默认 |
| **user** | `seeearth_user` | 注册用户 | 无（V1 无登录） | ⚠️ V1 = anon 权限，预留 |
| **witness** | `seeearth_witness` | Witness 提交 session（短期凭证） | `client_key` + 服务端 session 表 | ✅ |
| **moderator** | `seeearth_moderator` | 内容审核员 | OAuth + role claim `moderator` | ✅ |
| **admin** | `seeearth_admin` | 系统管理员 | OAuth + role claim `admin` | ✅ |
| **system** | `seeearth_system` | 后台 Job / Cron worker | 服务账号 secret + DB 独立 GRANT | ✅ |

> **关键澄清**：V1 没有"个人账号 / 登录 / Profile / 关注" 系统（per Brief §6 不做项），所以 `user` 角色**当前等价于 anon**。但保留 schema 角色（未来 OAuth 接入时不必再迁移数据）。

---

## 2. 资源 × 角色权限矩阵

### 2.1 公共域（cities / moments / witness_submissions）

| 资源 / 操作 | anon | user | witness | moderator | admin | system |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **cities** | | | | | | |
| `SELECT cities`（公共字段） | ✅ R | ✅ R | ✅ R | ✅ R | ✅ R | ✅ R |
| `SELECT cities.raw_coordinates` | ❌ | ❌ | ❌ | ✅ R (audit) | ✅ R (audit) | ❌ |
| `INSERT cities` | ❌ | ❌ | ❌ | ❌ | ✅ W (audit) | ✅ W |
| `UPDATE cities` | ❌ | ❌ | ❌ | ✅ W (audit) | ✅ W (audit) | ✅ W |
| `DELETE cities` | ❌ | ❌ | ❌ | ❌ | ✅ W (audit) | ❌ |
| **moments** | | | | | | |
| `SELECT moments`（approved only） | ✅ R | ✅ R | ✅ R | ✅ R | ✅ R | ✅ R |
| `SELECT moments`（pending/rejected/flagged） | ❌ | ❌ | ⚠️ 仅 own | ✅ R | ✅ R | ✅ R |
| `SELECT moments.raw_location` | ❌ | ❌ | ❌ | ✅ R (audit) | ✅ R (audit) | ❌ |
| `INSERT moments` | ❌ | ❌ | ⚠️ 自动 | ✅ W | ✅ W | ✅ W |
| `UPDATE moments.moderation_status` | ❌ | ❌ | ❌ | ✅ W (audit) | ✅ W (audit) | ❌ |
| `DELETE moments` | ❌ | ❌ | ⚠️ 仅 own (withdraw) | ✅ W | ✅ W | ✅ W |
| **witness_submissions** | | | | | | |
| `SELECT witness_submissions`（own only） | ❌ | ❌ | ✅ R (own) | ✅ R | ✅ R | ✅ R |
| `SELECT witness_submissions`（others） | ❌ | ❌ | ❌ | ✅ R | ✅ R | ✅ R |
| `INSERT witness_submissions` | ❌ | ❌ | ✅ W | ✅ W | ✅ W | ✅ W |
| `UPDATE witness_submissions.status='withdrawn'`（own only） | ❌ | ❌ | ✅ W (own) | ✅ W | ✅ W | ✅ W |
| `UPDATE witness_submissions.status='rejected'` | ❌ | ❌ | ❌ | ✅ W | ✅ W | ❌ |
| `UPDATE witness_submissions.moderation_status` | ❌ | ❌ | ❌ | ✅ W | ✅ W | ❌ |

### 2.2 受限域（private_locations / access_log / description 文本）

| 资源 / 操作 | anon | user | witness | moderator | admin | system |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **private_locations** | | | | | | |
| `SELECT private_locations`（任意列） | ❌ | ❌ | ❌ | ❌ (直接表) | ❌ (直接表) | ❌ |
| `SELECT private_locations_decrypted`（view，含 lat/lon 明文） | ❌ | ❌ | ❌ | ✅ R + **必须 audit** | ✅ R + **必须 audit** | ❌ |
| `INSERT private_locations` | ❌ | ❌ | ✅ W（提交时） | ✅ W | ✅ W | ✅ W |
| `UPDATE private_locations` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `DELETE private_locations` | ❌ | ❌ | ❌ | ❌ | ✅ W (manual only) | ✅ W (auto cleanup) |
| **private_location_access_log** | | | | | | |
| `SELECT access_log` | ❌ | ❌ | ❌ | ⚠️ own access only | ✅ R (all) | ❌ |
| `INSERT access_log` | ❌ | ❌ | ❌ | ✅ W (auto) | ✅ W (auto) | ✅ W (auto) |
| `UPDATE access_log` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ (DB trigger 阻止) |
| `DELETE access_log` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ (DB trigger 阻止) |
| **witness_submission_descriptions** | | | | | | |
| `SELECT description.text`（明文） | ❌ | ❌ | ⚠️ own only | ✅ R (audit) | ✅ R (audit) | ❌ |
| `INSERT description.text` | ❌ | ❌ | ✅ W (own) | ✅ W | ✅ W | ✅ W |

> **🔒 关键不变量**：
> 1. **匿名 / 用户 / witness 永远无法读取 lat/lon**（即使通过 SQL injection / GraphQL introspection / 任何路径）。
> 2. **moderator / admin 每次读 lat/lon 必须先 INSERT access_log**（应用层强制，DB RLS 兜底）。
> 3. **access_log 是 append-only**（DB trigger 阻止 UPDATE / DELETE）。

---

## 3. API 端点访问控制

### 3.1 公共 API（`/v1/...` 不含 `/v1/admin/`）

| 端点 | 必需角色 | 备注 |
|---|---|---|
| `GET /v1/cities` | anon+ | 无鉴权 |
| `GET /v1/cities/{id}` | anon+ | 无鉴权 |
| `GET /v1/moments` | anon+ | 默认 moderation_status='approved' |
| `GET /v1/moments/{id}` | anon+ | 默认 4 |
| `GET /v1/moments/by-city/{city_id}` | anon+ | 默认 4 |
| `GET /v1/editions/today` | anon+ | 无鉴权 |
| `GET /v1/editions/{date}` | anon+ | 无鉴权 |
| `GET /v1/editions/{id}` | anon+ | 无鉴权 |
| `GET /v1/cities/{id}/moments` | anon+ | 无鉴权 |
| `GET /v1/assets/{id}` | anon+ | 无鉴权（仅返回 variants URLs，无 EXIF） |
| `GET /v1/witness/submissions/{id}` | witness (own only) | 通过 client_key 或 witness_id 鉴权 |
| `POST /v1/witness/submissions` | witness | 写入路径，可含 location.precise（写入后服务端 strip 明文） |
| `POST /v1/witness/submissions/{id}/withdraw` | witness (own) | — |
| `POST /v1/feedback` | anon+ | Alpha/Beta 测试用（详见 `feedback-entry-v1.md`） |
| `POST /v1/analytics/events` | anon+ | 服务端二次 reject 禁采字段（详见 `forbidden-fields-v1.md`） |

### 3.2 Admin API（`/v1/admin/...`）

| 端点 | 必需角色 | 审计 |
|---|---|---|
| `GET /v1/admin/cities` | moderator+ | ✅ access_log (purpose='review') |
| `GET /v1/admin/cities/{id}` | moderator+ | ✅ access_log (含 raw_coordinates) |
| `POST /v1/admin/cities` | admin | ✅ access_log (purpose='moderation') |
| `PATCH /v1/admin/cities/{id}` | moderator+ | ✅ access_log |
| `DELETE /v1/admin/cities/{id}` | admin | ✅ access_log |
| `GET /v1/admin/moments` | moderator+ | ✅ access_log |
| `GET /v1/admin/moments/{id}` | moderator+ | ✅ access_log (含 raw_location) |
| `POST /v1/admin/moments` | admin | ✅ access_log |
| `PATCH /v1/admin/moments/{id}` | moderator+ | ✅ access_log |
| `DELETE /v1/admin/moments/{id}` | admin | ✅ access_log |
| `GET /v1/admin/witness/submissions` | moderator+ | ✅ access_log |
| `GET /v1/admin/witness/submissions/{id}` | moderator+ | ✅ access_log (含 location.precise + description.text) |
| `PATCH /v1/admin/witness/submissions/{id}/moderation` | moderator+ | ✅ access_log |
| `GET /v1/admin/private-locations` | moderator+ | ⚠️ **purpose 必填**（list 返回 city_id + accuracy，不返回 lat/lon 明文） |
| `GET /v1/admin/private-locations/{id}` | moderator+ | ⚠️ **purpose 必填**（返回 lat/lon 明文 + 写 access_log） |
| `POST /v1/admin/private-locations/{id}/access` | moderator+ | ⚠️ **purpose 必填**（记录显式访问意图） |
| `GET /v1/admin/private-locations/cleanup-log` | admin | 系统审计 |

### 3.3 Internal / Cron API（`/v1/internal/...`）

| 端点 | 必需角色 | 用途 |
|---|---|---|
| `POST /v1/internal/cleanup-private-locations` | system | 触发 90 天 cron job |
| `GET /v1/internal/audit-log-export` | admin | 导出 access_log 给 Privacy Officer |
| `GET /v1/internal/health` | system | 健康检查 |

---

## 4. 鉴权机制

### 4.1 匿名访问（anon / user）

```text
[客户端 → GET /v1/cities]
       ↓
[服务端]
 - 不读取 Authorization header
 - 使用 PostgreSQL connection role = seeearth_anon
 - GRANT 限制：只能 SELECT cities / moments / witness_submissions 公共列
 - 任何尝试读 private_locations → 0 行 / 403
       ↓
[响应] 200 + Cache-Control: public, max-age=300
```

### 4.2 Witness session（witness）

```text
[客户端 POST /v1/witness/submissions]
  - Header: X-Witness-Key: <UUIDv4>
  - Body: { client_key, location: {mode, public_city_id, precise?}, ... }
       ↓
[服务端]
 1. 验证 X-Witness-Key 存在于 witness_sessions 表（24h TTL）
 2. 使用 PostgreSQL connection role = seeearth_witness
 3. INSERT witness_submissions（公共字段）+ INSERT private_locations（精确位置加密）
 4. 返回 PublicWitnessSubmission（不含 precise）
       ↓
[响应] 201 + { data: PublicWitnessSubmission, request_id }
```

> **🔑 Witness session 凭证**：`X-Witness-Key` 是服务端在 Witness 进入流程开始时生成的 UUIDv4，存在 `witness_sessions` 表，TTL = 24 小时。Witness 无需注册，仅用本地生成的 client_key + 服务端分配的 session key 即可提交。session 过期后 witness_id 不再有效。

### 4.3 Moderator / Admin 鉴权

```text
[Admin / Moderator 登录]
 - OAuth 2.0（暂用 Google Workspace SSO 或自建 email/password）
 - role claim ∈ {'moderator', 'admin'}
 - Server 生成短期 JWT（24h TTL）+ refresh token
       ↓
[Admin 操作]
 - Header: Authorization: Bearer <JWT>
 - Server 验证 JWT signature + role claim
 - 使用 PostgreSQL connection role = seeearth_moderator / seeearth_admin
 - 所有受控资源读取自动写 access_log
       ↓
[响应] 200 / 403 (forbidden_role)
```

### 4.4 System / Cron 鉴权

```text
[系统后台 Job]
 - Header: X-Internal-Token: <service secret>
 - 服务端验证 token 与 service 标识
 - 使用 PostgreSQL connection role = seeearth_system
 - 不能读取 private_locations_decrypted（无 audit 写入能力）
 - 仅可：DELETE private_locations / INSERT cleanup_run_log
       ↓
[响应] 200 / 401 / 403
```

---

## 5. 与 locationPrivacy.ts 的对齐（客户端 fallback）

> V1 SPA 仍保留 `src/lib/locationPrivacy.ts` 作为**客户端 fallback**。当前 100% 客户端架构下，该文件用 `AccessRole` 枚举 + `canAccessRawLocation()` / `canAccessCityRawCoords()` 函数做权限判断。后端实现后，**两者必须语义一致**：

| `locationPrivacy.ts` 函数 | 服务端等价物 | 说明 |
|---|---|---|
| `toPublicCityLocation(city)` | `toPublicCity()` Zod serializer | 一致 |
| `toFullLocation(city)` | `toAdminCity()` Zod serializer | 一致 |
| `canAccessRawLocation(actor, target)` | PostgreSQL RLS + GRANT | 服务端强制 |
| `canAccessCityRawCoords(actor)` | PostgreSQL RLS + GRANT | 服务端强制 |
| `getRawLocationSafely(actor, moment)` | 服务端 admin endpoint | 一致 |

> ⚠️ **客户端不可信**：V1 客户端 fallback 仅作为 UX 优化（避免发送注定 403 的请求），**真实权限强制必须由服务端 RLS + GRANT 完成**。客户端代码可被绕过，所以不能作为唯一防线。

---

## 6. 越权检测与告警

### 6.1 服务端 alert 触发条件

| 触发 | Alert level | Owner |
|---|---|---|
| 同一 user 1 小时内 > 10 次访问 private_locations | 🟡 WARN | E-P0-10 on-call |
| 同一 user 1 小时内 > 50 次访问 private_locations | 🔴 CRITICAL | Privacy Officer + E-P0-10 on-call |
| 任何 role = anon / user / witness 直接尝试访问 `/v1/admin/*` | 🟡 WARN（403） | E-P0-10 on-call |
| 客户端尝试 INSERT private_locations 时 role = anon / user | 🔴 CRITICAL（开发者 bug） | E-P0-10 on-call + Engineering Lead |
| `ERR_INTERNAL_PRECISE_LOCATION_LEAK` 触发 | 🔴 CRITICAL（开发者 bug） | Engineering Lead + Privacy Officer |
| 任何 audit_log UPDATE / DELETE attempt | 🔴 CRITICAL（DB trigger 阻止） | Privacy Officer |

### 6.2 定期审计（Privacy Officer）

| 周期 | 内容 |
|---|---|
| 每周 | 审查 access_log 中 `purpose='audit'` 与 `purpose='legal_request'` 记录 |
| 每月 | 审查 access_log 中同一 user 的访问 pattern；标记异常 |
| 每季度 | 审查 `private_locations` 保留数据量 + retention 进度 |
| 每半年 | 完整 privacy impact assessment（DPIA） |

---

## 7. 与 E-P0-03 Witness backend 的对接

| E-P0-03 关注点 | 本文件实施 |
|---|---|
| Witness 提交路径写入精确位置 | ✅ `POST /v1/witness/submissions` → `INSERT witness_submissions` + `INSERT private_locations`（双表事务） |
| Witness 不能访问 lat/lon（即使自己） | ✅ `seeearth_witness` 角色无 `private_locations_decrypted` SELECT 权限 |
| Moderator / admin 可审核 submission + 看 lat/lon | ✅ `/v1/admin/witness/submissions/{id}` + audit_log 自动写 |
| 撤稿 / 删除路径 | ✅ `POST /v1/witness/submissions/{id}/withdraw` (witness own) / `DELETE /v1/admin/witness/submissions/{id}` (admin) |

---

## 8. 与 E-P0-10 Monitoring 的对接

| 监控信号 | 来源 |
|---|---|
| `private_location_access_log` 行数 | daily metric |
| 同一 user 1 小时访问次数 | real-time alert |
| `ERR_INTERNAL_PRECISE_LOCATION_LEAK` 计数 | alert metric |
| private_locations 表大小 | daily metric |
| 90 天 cron job 清理行数 | daily metric |

---

## 9. Blocker Log

| 日期 | 议题 | Owner | 解锁条件 | 状态 |
|---|---|---|---|---|
| 2026-08-24 | OAuth provider 选型（Google Workspace / 自建 email） | Engineer + PM | E-P0-02 启动前 1 天 | OPEN |
| 2026-08-24 | Witness session 凭证机制（X-Witness-Key vs Cookie）是否满足 iOS | iOS + Engineer | D-P1-01 启动后 2 天 | OPEN |
| 2026-08-24 | Moderator/Admin 的最小操作 UI（CMS）是否进入 V1 | PM + Designer | OD-01 决策 | OPEN |

---

## 10. 自验收 Acceptance Criteria

- [x] 5+1 角色清晰定义（anon / user / witness / moderator / admin / system）
- [x] 资源 × 角色权限矩阵完整（公共域 + 受限域 + access_log）
- [x] API 端点访问控制矩阵（公共 + Admin + Internal）
- [x] 鉴权机制分层（Anon / Witness / Mod/Admin / System）
- [x] 与 `locationPrivacy.ts` 客户端 fallback 一致
- [x] 越权检测 + alert + 定期审计
- [x] 与 E-P0-03 / E-P0-10 对接关系清晰
- [x] Blocker Log 完整
- [x] 不修改 D-P0-02 LOCKED 组件 / 不修改 E-P0-09 LOCKED schema

---

## 11. 关联文档

| 文档 | 用途 |
|---|---|
| `data-architecture-v1.md` §5 | PostgreSQL GRANT + RLS 实现 |
| `public-private-split-v1.md` | 5 边界强制 |
| `audit-log-v1.md` | access_log 写入契约 |
| `encryption-v1.md` | pgcrypto + KMS key 管理 |
| `../api-contract/contract-decisions-v1.md` §2 | 双 schema 模型 |
| `../api-contract/zod-schemas/city.ts` | PublicCity / AdminCity |
| `../api-contract/zod-schemas/witness-submission.ts` | PublicWitnessSubmission / AdminWitnessSubmission |
| `/Users/lwy/Documents/ChatGPT/看见地球/src/lib/locationPrivacy.ts` | 客户端 fallback |
| `/Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/SEE-EARTH-Release-Strategy-v1-Design-Engineering-Task-Brief.md` §5 E-P0-05 | Brief 原文 |

---

**End of role-permission-v1.md · E-P0-05 子任务 3/7**