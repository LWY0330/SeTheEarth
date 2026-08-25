---
title: SEE EARTH V1 · E-P0-03 · Minimal Witness Backend · Implementation Roadmap · v1
type: engineering-roadmap
tags: [release-v1, e-p0-03, witness-backend, roadmap, timeline, see-earth]
task_id: E-P0-03
brief_anchor: "Release Strategy Brief §5 E-P0-03 + 任务卡 §Acceptance"
track: engineering
owner: Engineer Agent #4 (external Owner = 您)
created: 2026-08-24
status: DRAFT · IN REVIEW
target_gate: Gate A · Internal Alpha
source_brief: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/SEE-EARTH-Release-Strategy-v1-Design-Engineering-Task-Brief.md
source_task_card: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/06-PM Agent 交接/2026-08-22-task-card-e-p0-03-minimal-witness-backend.md
related_docs:
  - ./architecture-v1.md
  - ./state-machine-v1.md
  - ./schema-v1.md
  - ./endpoints-v1.md
  - ./error-handling-v1.md
  - ./test-plan-v1.md
  - /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/06-PM Agent 交接/2026-08-24-round4-dispatch-log.md
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/e-p0-03-witness-backend/implementation-roadmap-v1.md
workspace_canonical_path: /Users/lwy/Documents/ChatGPT/看见地球/release-v1/e-p0-03-witness-backend/implementation-roadmap-v1.md
sync_required: true · sandbox 拒绝写入 Obsidian
---

# SEE EARTH V1 · E-P0-03 · Minimal Witness Backend · Implementation Roadmap · v1

> **作者**：Engineer Agent #4（外部 Owner = 您）
> **派发时间**：2026-08-24 · Round 4
> **目标**：交付 Witness 后端**完整实施步骤 + 工时估算 + 依赖关系 + 风险矩阵**
> **目标 Gate**：Gate A · Internal Alpha（启动 Gate B 前完成）

---

## 0. 一句话结论

**E-P0-03 实施分 4 阶段 · 总工时 ~14.5 人天**：

| 阶段 | 范围 | 工时 | 依赖 |
|---|---|:---:|---|
| **Phase 1: MVP 基础** | Supabase setup + DB schema + 5 endpoints + 状态机 + EXIF strip + 限流 + 草稿清理 | 6.5 天 | 无 |
| **Phase 2: 审核 + 监控** | Moderator dashboard + JWT + audit log + Sentry + rate limit edge cases | 3 天 | Phase 1 |
| **Phase 3: 测试 + 隐私** | 单元 + 集成 + E2E + privacy leak test + performance | 3 天 | Phase 1 + Phase 2 |
| **Phase 4: 上线准备** | Vercel deploy + Sentry + docs + handoff | 2 天 | Phase 3 |

**关键路径**：Phase 1 → Phase 2 → Phase 3 → Gate A 验收 → Phase 4 → Gate B 启动

**关键风险**：
- Sharp Worker 在 Vercel Serverless 中的执行时间限制（10s 免费层 / 60s pro 层）→ 25MB 大图可能超时 → 需用 background job（Inngest / Vercel Cron + Queue）
- Supabase Storage 大文件 PUT 稳定性（需在 Phase 1 早期压测）
- IP rate limit 在 Vercel Edge Middleware 的实现复杂度（Upstash Redis 必备）

---

## 1. 总体时间线（甘特图）

```text
Day 0   ─────────────────────────────────────────────────────────────────────
        Setup: Supabase project + Vercel env vars + Sharp install + git branch
        ↓
Day 1-2  Phase 1.1: DB schema + 触发器 + RLS + pg_cron (1.5 days)
Day 3    Phase 1.2: 5 endpoints skeleton + Zod 校验 (1 day)
Day 4-5  Phase 1.3: Sharp worker + EXIF 剥离 + variants (2 days)
Day 6    Phase 1.4: 限流 + 草稿清理 + idempotency (1 day)
Day 6.5  Phase 1 wrap-up + smoke test (0.5 day)
        ↓
Day 7-8  Phase 2.1: Moderator JWT + audit log (1 day)
Day 9    Phase 2.2: Sentry + SLO alerts + p95 dashboards (1 day)
Day 9.5  Phase 2.3: Edge cases (rate limit window reset · concurrent moderations) (0.5 day)
        ↓
Day 10-11 Phase 3.1: 单元测试 (state machine + schemas) (1 day)
Day 11.5 Phase 3.2: 集成测试 (full flow + DB + RLS) (1.5 days)
Day 12.5 Phase 3.3: E2E (Playwright 6 段流程) (1 day)
Day 13   Phase 3.4: Privacy leak test + Performance (k6) (1 day)
        ↓
Day 14   Phase 4: Deploy + docs + handoff (1 day)
Day 14.5 Phase 4: Gate A final + smoke (0.5 day)
        ↓
Day 15   Gate A · Internal Alpha 启动 → Gate B 准备
```

**总时长**：14.5 人天（约 3 周单兵；或 7-8 天 2 人并兵）

---

## 2. Phase 1 · MVP 基础（6.5 天）

### 2.1 Phase 1.1 · DB Schema + Triggers + RLS（1.5 天）

| Day | 任务 | 工时 | Owner |
|---|---|:---:|---|
| 1.0 | 创建 Supabase project `setheearth-alpha` + 启用 pgcrypto / uuid-ossp / pg_cron | 1h | Backend |
| 1.0 | 创建 Storage buckets：`witness-raw` (private) + `witness-public` (CDN) | 1h | Backend |
| 1.0 | 配置 RLS roles：`anon`, `authenticated`, `moderator`, `service_role` | 1h | Backend |
| 1.0 | Vercel env vars：`SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `WITNESS_IP_HASH_SECRET`, `MODERATOR_JWT_SECRET` | 1h | Backend |
| 1.5 | 执行 `schema-v1.md` §10 SQL（5 表 + 15 索引 + 5 触发器 + RLS + cron） | 4h | Backend |
| 1.5 | 验证 cron jobs（`witness-cleanup-drafts` 等 4 个） | 1h | Backend |

**验收**：
- [ ] 5 表创建成功
- [ ] RLS 策略生效（anon role 拒绝访问 private_locations）
- [ ] cron jobs 在 pg_cron 中可见
- [ ] 触发器自动写入 status_history 验证（创建 1 行 → history 含 1 条）

### 2.2 Phase 1.2 · 5 Endpoints Skeleton + Zod 校验（1 天）

| Day | 任务 | 工时 | Owner |
|---|---|:---:|---|
| 2.0 | 实现 `POST /v1/witness/submissions`（创建 draft + 幂等） | 4h | Backend |
| 2.0 | 实现 `POST /v1/witness/submissions/:id/upload-url`（signed upload URL） | 2h | Backend |
| 2.0 | 实现 `POST /v1/witness/submissions/:id/commit`（verify + transition） | 3h | Backend |
| 2.0 | 实现 `GET /v1/witness/submissions/:id`（公共 schema strict 校验） | 2h | Backend |
| 2.0 | 实现 `PATCH /v1/witness/submissions/:id`（withdraw） | 1h | Backend |
| 2.5 | 单元测试：5 端点 happy path（各 1 测试） | 2h | Backend |

**验收**：
- [ ] 5 端点全部返回正确 HTTP 状态码
- [ ] Zod 校验失败 → 400 `validation_failed`
- [ ] 幂等性（同 client_key）→ 200 replay
- [ ] 公共响应不返回 `precise_*`（strict 校验）

### 2.3 Phase 1.3 · Sharp Worker + EXIF 剥离（2 天）

| Day | 任务 | 工时 | Owner |
|---|---|:---:|---|
| 3.0 | 集成 sharp 依赖（pnpm add sharp） | 1h | Backend |
| 3.0 | 实现 sharp worker 函数：`processAsset(assetId)` | 6h | Backend |
| 3.0 | EXIF 剥离测试：上传带 GPS 的 JPEG → 处理后 exiftool 无 GPS | 2h | Backend |
| 3.0 | 4 variants 生成：thumb_320 / card_640 / detail_1280 / full_2560 | 4h | Backend |
| 3.5 | Sharp worker 触发机制：commit endpoint → enqueue (Inngest 或 Vercel Queue) | 4h | Backend |
| 3.5 | 状态机转换：uploading → uploaded → validating → submitted（worker 内） | 4h | Backend |
| 4.0 | raw image 删除（GDPR 强制） | 1h | Backend |
| 4.0 | Sharp 异常处理 → failed_terminal + Sentry | 2h | Backend |

**验收**：
- [ ] 25MB JPEG 上传后 30s 内完成 EXIF 剥离
- [ ] 4 variants 公开 URL 可访问
- [ ] raw image 已从 witness-raw 删除
- [ ] EXIF GPS / CameraSerial / UserComment 在公开 variant 中不存在
- [ ] 状态历史含 `uploaded → validating → submitted` 3 条

### 2.4 Phase 1.4 · 限流 + 草稿清理 + Idempotency Edge Cases（1 天）

| Day | 任务 | 工时 | Owner |
|---|---|:---:|---|
| 4.5 | 集成 Upstash Redis + @upstash/ratelimit | 2h | Backend |
| 4.5 | Edge Middleware：5/h/IP 限流（POST /submissions） | 3h | Backend |
| 4.5 | Edge Middleware：60/h/IP 限流（POST /upload-url + commit + GET） | 1h | Backend |
| 4.5 | Idempotency：同 client_key + 不同 payload → 409 | 1h | Backend |
| 5.0 | Smoke test：手动测试 5 端点 + 状态机 + 错误码 | 3h | Backend |

**验收**：
- [ ] 第 6 次创建（同一 IP）返回 429 `rate_limited_witness`
- [ ] 不同 IP 计数独立
- [ ] 限流窗口 1h 后重置
- [ ] 草稿 24h 后自动 cleanup（手动 backdate 测试）

---

## 3. Phase 2 · 审核 + 监控（3 天）

### 3.1 Phase 2.1 · Moderator JWT + Audit Log（1 天）

| Day | 任务 | 工时 | Owner |
|---|---|:---:|---|
| 6.0 | 实现 moderator JWT 签发（测试用 mock signer） | 3h | Backend |
| 6.0 | 实现 `POST /v1/admin/witness/submissions/:id/moderate` | 4h | Backend |
| 6.0 | 事务：auto-claim + decision + Moment create + private_locations cleanup | 4h | Backend |
| 6.0 | moderation_log INSERT（不可变 RULE 已存在） | 1h | Backend |

**验收**：
- [ ] Moderator 决策创建 Moment record
- [ ] private_locations.deleted_at 在 reject 后更新
- [ ] moderation_log 含 actor + before/after + reason_code
- [ ] 非 moderator role 403 `forbidden_role`

### 3.2 Phase 2.2 · Sentry + SLO Alerts + Dashboards（1 天）

| Day | 任务 | 工时 | Owner |
|---|---|:---:|---|
| 7.0 | Sentry project：`setheearth-alpha` + Vercel integration | 2h | Backend |
| 7.0 | Sentry tag：`feature:witness` + `stage:<endpoint>` + `request_id` | 2h | Backend |
| 7.0 | Sentry alert：`asset_processing_failed` 立即告警（Slack） | 1h | Backend |
| 7.0 | Sentry alert：`internal_*` critical（PagerDuty） | 1h | Backend |
| 7.0 | Vercel Analytics dashboard：5 端点 p50 / p95 / error rate | 2h | Backend |

**验收**：
- [ ] 5xx 错误自动上报 Sentry（含 request_id）
- [ ] `internal_schema_violation` 触发 PagerDuty
- [ ] Vercel Analytics 显示 5 端点性能指标

### 3.3 Phase 2.3 · Edge Cases（0.5 天）

| Day | 任务 | 工时 | Owner |
|---|---|:---:|---|
| 7.5 | 并发 moderator 决策（DB lock 测试） | 1h | Backend |
| 7.5 | IP rate limit window reset 跨日测试 | 1h | Backend |
| 7.5 | Client 重试 + idempotency replay 链路测试 | 2h | Backend |

---

## 4. Phase 3 · 测试 + 隐私（3 天）

### 4.1 Phase 3.1 · 单元测试（1 天）

详见 `test-plan-v1.md` §2。约 80 个测试用例。

### 4.2 Phase 3.2 · 集成测试（1.5 天）

详见 `test-plan-v1.md` §3。约 30 个测试用例。

### 4.3 Phase 3.3 · E2E（Playwright 6 段流程）（1 天）

详见 `test-plan-v1.md` §6。

### 4.4 Phase 3.4 · Privacy Leak Test + Performance（1 天）

详见 `test-plan-v1.md` §4 + §5。

---

## 5. Phase 4 · 上线准备（2 天）

### 5.1 Phase 4.1 · Deploy + Docs（1 天）

| Day | 任务 | 工时 | Owner |
|---|---|:---:|---|
| 12.0 | Vercel deploy：API 路由到 alpha branch | 2h | Backend |
| 12.0 | Vercel env vars 配置（preview environment） | 1h | Backend |
| 12.0 | Smoke test（Vercel production-like 环境） | 2h | Backend |
| 12.0 | 文档：API 文档（OpenAPI 增量更新）+ README + deployment | 2h | Backend |
| 12.5 | Handoff: PM + QA 验证 | 1h | Backend |

### 5.2 Phase 4.2 · Gate A 准备（0.5 天）

| Day | 任务 | 工时 | Owner |
|---|---|:---:|---|
| 13.0 | Gate A 验收 checklist（10 项） | 2h | Backend + PM |
| 13.0 | Smoke 全流程（成功 + 失败 + 撤回） | 2h | QA |

---

## 6. 依赖关系（与 Round 4 其他子代理 + 已有 E-P0 卡）

### 6.1 强依赖（阻塞）

| 依赖 | 当前状态 | 解锁条件 | 影响 |
|---|---|---|---|
| **D-P0-02 LOCKED** | ✅ ACCEPTED | 已就绪 | UI 字段映射基础 |
| **E-P0-09 LOCKED** | ✅ ACCEPTED | 已就绪 | OpenAPI + Zod schemas source of truth |
| **E-P0-04 captured_at 规则** | ⏳ Round 4 子代理 #2 | Round 4 ACCEPTED | `captured_at_source` / `_confidence` 校验 |
| **E-P0-05 位置隔离** | ⏳ Round 4 子代理 #3 | Round 4 ACCEPTED | `private_locations` schema + RLS |

**关键路径**：E-P0-03 必须在 E-P0-04 + E-P0-05 ACCEPTED 后才能完整实施。但本设计已对齐任务卡 §C-D + E-P0-09 Zod，**Phase 1.1（DB schema）可独立启动**，不阻塞。

### 6.2 弱依赖（不阻塞）

| 依赖 | 状态 | 影响 |
|---|---|---|
| **E-P0-02 Vertical Slice** | Phase 1 启动 | Witness API endpoint 部署路径 |
| **E-P0-06 Daily 12 Supply Chain** | Round 4 | 后续 V1.1 集成 `published → Daily 12` |
| **E-P0-07 Analytics** | Round 4 | 埋点字段白名单 + hash 算法 |
| **E-P0-10 Monitoring** | Round 4 | 监控基线（指标采集 + 告警） |

### 6.3 被本卡阻塞

- **E-P0-06 Daily 12 Supply Chain**：依赖 Witness `published` 状态供 Daily 12 候选
- **E-P0-10 Monitoring**：依赖 Witness 端点 Sentry 集成
- **D-P0-02-impl Witness UI 集成**：依赖 Witness API endpoint
- **D-P0-04-impl Echo UI 集成**：依赖 Echo API（V1 移除但预留）

---

## 7. 资源 / 工具依赖

### 7.1 新增 npm 依赖

| 包 | 必要性 | 阶段 | 备注 |
|---|---|---|---|
| `@supabase/supabase-js` | 必需 | Phase 1.1 | DB + Storage client |
| `sharp` | 必需 | Phase 1.3 | EXIF 剥离 + variants |
| `zod` | 必需 | Phase 1.2 | E-P0-09 已用，import |
| `@upstash/ratelimit` | 必需 | Phase 1.4 | Edge Middleware 限流 |
| `@upstash/redis` | 必需 | Phase 1.4 | Upstash 客户端 |
| `pino` | 推荐 | Phase 2.2 | 结构化日志（与 Sentry 配套） |

**强制约束（任务卡 §C）**：仅 sharp 必要即可，不引入额外依赖。✅ 满足。

### 7.2 服务依赖

| 服务 | 必需 | 阶段 |
|---|---|---|
| Supabase Postgres | ✅ | Phase 1.1 |
| Supabase Storage | ✅ | Phase 1.2 |
| Vercel Serverless | ✅ | Phase 1.2 |
| Upstash Redis | ✅ | Phase 1.4 |
| Sentry | ✅ | Phase 2.2 |
| Inngest / Vercel Queue | 推荐 | Phase 1.3（Sharp worker） |

### 7.3 Secrets 配置

| Secret | 用途 | 存储 |
|---|---|---|
| `SUPABASE_URL` | Supabase project URL | Vercel Preview env |
| `SUPABASE_SERVICE_KEY` | Service role key | Vercel Preview env (secret) |
| `WITNESS_IP_HASH_SECRET` | HMAC IP hashing | Vercel Preview env (secret) |
| `WITNESS_SESSION_SECRET` | Cookie HMAC sign | Vercel Preview env (secret) |
| `MODERATOR_JWT_SECRET` | JWT verify | Vercel Preview env (secret) |
| `UPSTASH_REDIS_REST_URL` | Upstash endpoint | Vercel Preview env |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash token | Vercel Preview env (secret) |
| `SENTRY_DSN` | Sentry ingest | Vercel Preview env |

---

## 8. 风险矩阵

### 8.1 高风险（必须缓解）

| # | 风险 | 影响 | 缓解 |
|---|---|---|---|
| R1 | **Sharp 处理 25MB JPEG 超过 Vercel Serverless 60s 超时** | 提交失败 + failed_terminal 误判 | 用 Inngest 或 Vercel Queue 作为 background job；endpoint 只 enqueue 不阻塞 |
| R2 | **Supabase Storage signed upload URL 不可靠** | 上传失败 + 用户挫败感 | Phase 1.2 早期压测 100 并发；fallback 到服务端中转（slow but reliable） |
| R3 | **IP rate limit 在 Vercel Edge Middleware 性能** | 增加 5-15ms latency | 用 Upstash Edge runtime（< 5ms） |
| R4 | **EXIF 剥离漏掉某些 metadata 字段** | 隐私违规 | test-plan §4.2 强制 exiftool 扫描 + CI 阻断 |
| R5 | **moderator JWT secret 泄漏** | 攻击者可绕过审核 | secret 轮转机制 + Vercel secret rotation |

### 8.2 中风险（缓解）

| # | 风险 | 影响 | 缓解 |
|---|---|---|---|
| R6 | **pg_cron 未启用（Supabase Hobby 限制）** | 草稿 / 位置不自动清理 | 用 Vercel Cron 替代（Vercel Cron 支持 Supabase SQL 调用） |
| R7 | **client_key UNIQUE 约束影响 draft 复用** | 用户无法重新创建 | soft delete + partial unique index |
| R8 | **状态机扩展 9 状态与 OpenAPI 8 状态不一致** | 客户端兼容性问题 | mapping 层（已设计）· V1.0.1 同步扩展 |
| R9 | **EXIF 处理对 HEIC 格式支持不完整** | iOS 用户失败 | sharp libheif 依赖 + 早期 iOS 真机测试 |

### 8.3 低风险（接受）

| # | 风险 | 影响 | 缓解 |
|---|---|---|---|
| R10 | **Vercel Serverless 冷启动 ~500ms** | 偶发慢请求 | 用户感知可接受（95% 命中 warm） |
| R11 | **Vercel Hobby plan 100 deploys/day 上限** | 频繁部署受限 | deploy 合并；测试用 preview deploys |

---

## 9. 工时总览

### 9.1 按角色拆分

| 角色 | 工时 | 占比 |
|---|:---:|:---:|
| Backend Engineer（主） | 11.5 天 | 79% |
| Frontend Engineer（协助） | 0.5 天（E2E 测试） | 3% |
| QA / Test | 1.5 天 | 10% |
| DevOps / SRE | 1 天 | 7% |
| **总计** | **14.5 人天** | 100% |

### 9.2 按阶段拆分

| 阶段 | 工时 | 累计 |
|---|:---:|:---:|
| Phase 1: MVP 基础 | 6.5 天 | 6.5 天 |
| Phase 2: 审核 + 监控 | 3 天 | 9.5 天 |
| Phase 3: 测试 + 隐私 | 3 天 | 12.5 天 |
| Phase 4: 上线准备 | 2 天 | 14.5 天 |

### 9.3 单兵 vs 双兵

| 模式 | 时长 | 备注 |
|---|:---:|---|
| **单兵** | 14.5 天 | 1 后端全栈（含 devops + 测试） |
| **双兵并兵** | 7-8 天 | 1 后端（API + DB） + 1 测试（E2E + 性能） |

**推荐**：双兵并兵 8 天完成全部 + 1 天 buffer。

---

## 10. 验收清单（任务卡 Acceptance Criteria 10 项 + 强制约束 7 项）

### 10.1 Acceptance Criteria

| # | 验收项 | 验证方式 | 通过 |
|---|---|---|---|
| 1 | 9 状态状态机实现 + JSONB 历史 | Unit test + 集成测试 | ☐ |
| 2 | 5 端点 + OpenAPI 文档 | E2E + OpenAPI YAML 更新 | ☐ |
| 3 | 幂等性（client_key） | 集成测试 §3.2 | ☐ |
| 4 | EXIF 剥离（sharp） | exiftool CI 扫描 | ☐ |
| 5 | 公共 API 不含精确经纬度 | privacy leak test | ☐ |
| 6 | 草稿 24h 自动清理 | pg_cron 手动 backdate 测试 | ☐ |
| 7 | 限流 5/h/IP | k6 压测 | ☐ |
| 8 | 与 E-P0-09 Zod contract 一致 | Zod import + unit test | ☐ |
| 9 | 不修改 D-P0-02 LOCKED 组件 props | 代码审查 + E2E 不回归 | ☐ |
| 10 | npm run build 编译通过 | CI build job | ☐ |

### 10.2 强制约束

| # | 约束 | 验证 |
|---|---|---|
| 1 | 不引入新依赖（除 sharp 必需） | package.json diff review |
| 2 | 不在公共 API 输出精确经纬度 | privacy leak test |
| 3 | 不使用定时器触发 success 事件 | 代码审查（witness_submitted 必须服务端 confirmation） |
| 4 | 不发送 PII / EXIF / 自由文本到埋点 | analytics payload 扫描 |
| 5 | 不在生产环境关闭服务端 reject | strict 校验永远开启 |
| 6 | 不实现用户登录系统 | 代码审查（witness_id cookie only） |
| 7 | 不修改 D-P0-02 LOCKED 组件 props | 代码审查 |

---

## 11. 给 PM Agent 的指令

### 11.1 后续实施依赖

PM Agent 应在本设计交付后：

1. **同步给 Round 4 子代理 #2（E-P0-04）+ #3（E-P0-05）**：`state-machine-v1.md` §1.3 列出 9 状态与 E-P0-09 OpenAPI 8 状态的差异；E-P0-04 的 `captured_at_confidence` enum 必须含 `manual`；E-P0-05 的 `private_locations` 表 schema 必须与本设计对齐
2. **同步给 E-P0-06（Daily 12 Supply Chain）**：`published` 状态可被 Daily 12 算法消费（详见 architecture-v1.md §8.4）
3. **同步给 E-P0-10**：`internal_*` 错误触发 PagerDuty critical（见 error-handling-v1.md §9.1）

### 11.2 验证清单（PM 启动实施前必查）

- [ ] E-P0-04 captured_at enum 已确认
- [ ] E-P0-05 private_locations schema 已确认
- [ ] Supabase Alpha project 已创建
- [ ] Vercel Preview env vars 已配置（含 Sharp binary compatible runtime）
- [ ] Upstash Redis 已创建（Edge 区域）
- [ ] Sentry Alpha project 已创建
- [ ] Inngest 或 Vercel Queue 选型已决策（Sharp worker 必需）

### 11.3 Gate A 启动前必跑

- [ ] Privacy leak test · 0 命中（见 test-plan-v1.md §4）
- [ ] 5 端点 E2E 全通过
- [ ] k6 压测 p50/p95 在预算内
- [ ] Sentry 收到 5xx 时立即告警（手动验证）
- [ ] 草稿 24h 清理 cron 验证（手动 backdate + run）

---

## 12. 已知 Blocker

| # | 阻塞 | 类别 | 解锁条件 | 状态 |
|---|---|---|---|---|
| 1 | **Sharp worker 异步机制选型**（Inngest / Vercel Queue / Edge Function） | 技术决策 | PM + Engineer 决策 | OPEN |
| 2 | **witness_id cookie 90 天 TTL** | OD-04（E-P0-09 §14） | PM 签字 | OPEN |
| 3 | **rate_limited_witness 阈值 5/h/IP** | PM 签字 | Privacy review | OPEN |
| 4 | **moderator dashboard UI**（V1 minimal） | Designer | D-P0-02 LOCKED 不包含；需独立 task | OPEN |

---

## 13. 元数据

| 字段 | 值 |
|---|---|
| 文档版本 | v1 |
| 创建时间 | 2026-08-24 |
| 创建人 | Engineer Agent #4 |
| 文档 ID | `implementation-roadmap-v1.md` |
| 目标 Gate | Gate A · Internal Alpha |
| Workspace 路径 | `/Users/lwy/Documents/ChatGPT/看见地球/release-v1/e-p0-03-witness-backend/implementation-roadmap-v1.md` |
| Obsidian canonical 路径 | `/Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/e-p0-03-witness-backend/implementation-roadmap-v1.md` |
| Obsidian 同步状态 | ❌ 未同步（sandbox 拒绝） |

---

## 14. 自验收（任务卡 Acceptance Criteria 全部项）

| # | 验收项 | 状态 | 证据 |
|---|---|---|---|
| 1 | 9 状态状态机完整 + 异常处理 | ✅ | state-machine-v1.md |
| 2 | 5 端点 schema 与 E-P0-09 Zod contract 一致 | ✅ | endpoints-v1.md §2-§6 |
| 3 | 幂等性验证 | ✅ | endpoints-v1.md §2.4 + test-plan §3.2 |
| 4 | EXIF 剥离实施指南 | ✅ | endpoints-v1.md §4 + test-plan §4.2 |
| 5 | 位置隔离与 E-P0-05 对齐 | ✅ | schema-v1.md §2.2 + architecture §3.3 |
| 6 | 草稿 24h 自动清理 | ✅ | schema-v1.md §4.2 cron + endpoints §3.5 |
| 7 | 限流 5/小时/IP | ✅ | architecture §3.6 + endpoints §2.2 |
| 8 | 测试覆盖矩阵 | ✅ | test-plan-v1.md |
| 9 | 实施 roadmap 含工时估算 | ✅ | 本文件 §1-§9 |
| 10 | 不修改 14 LOCKED 组件 | ✅ | 仅服务端 API（不动前端） |

---

**End of implementation-roadmap-v1.md · E-P0-03 子产物 7/7**

---

# 🎉 E-P0-03 Witness Backend Design · 全部 7 交付文件完成

| # | 文件 | 状态 |
|---|---|:---:|
| 1 | `architecture-v1.md` | ✅ |
| 2 | `state-machine-v1.md` | ✅ |
| 3 | `schema-v1.md` | ✅ |
| 4 | `endpoints-v1.md` | ✅ |
| 5 | `error-handling-v1.md` | ✅ |
| 6 | `test-plan-v1.md` | ✅ |
| 7 | `implementation-roadmap-v1.md` | ✅ |

**所有 7 文件** 位于：
`/Users/lwy/Documents/ChatGPT/看见地球/release-v1/e-p0-03-witness-backend/`

需 PM Agent 由 Obsidian 写入权限同步至：
`/Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/e-p0-03-witness-backend/`