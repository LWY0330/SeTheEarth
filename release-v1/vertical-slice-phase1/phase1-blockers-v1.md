---
title: SEE EARTH V1 · Phase 1 Blockers
type: blockers-list
tags: [release-v1, e-p0-02, blockers, phase1, alpha, see-earth]
task_id: E-P0-02
phase: Phase 1 · Vertical Slice
dispatched_at: 2026-08-22
status: DRAFT · IN REVIEW
author: Engineer Agent (Round 2B)
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/vertical-slice-phase1/phase1-blockers-v1.md
---

# SEE EARTH V1 · Phase 1 Blockers

> **作者**：Engineer Agent（Round 2B · Phase 1 子集）
> **目标读者**：PM Agent（决策分发）、用户（手动操作）、Phase 2/3 工程师
> **任务卡**：E-P0-02 Launch Vertical Slice（Phase 1 子集）
> **决策日期**：2026-08-22

---

## 0. 一句话结论

**Phase 1 共 14 个 blocker，按 Owner 分类：用户手动操作（9 项）+ PM 决策（3 项）+ 团队内自治（2 项）。其中 5 项为发布硬阻塞（必须解决才能部署），4 项为软阻塞（可绕过但需后续处理）。**

---

## 1. Blocker 矩阵

| ID | 类型 | 描述 | Owner | 状态 | 阻塞阶段 |
|---|---|---|---|---|---|
| **B-01** | 🟥 硬阻塞 | 用户手动创建 Supabase project | 用户 | ⏳ | Phase 1 部署 |
| **B-02** | 🟥 硬阻塞 | 用户手动创建 git branches（alpha + alpha-api） | 用户 | ⏳ | Phase 1 部署 |
| **B-03** | 🟥 硬阻塞 | 用户手动创建 Storage bucket + RLS | 用户 | ⏳ | Phase 1 部署 |
| **B-04** | 🟥 硬阻塞 | 用户手动配置 Vercel Preview Domain | 用户 | ⏳ | Phase 1 部署 |
| **B-05** | 🟥 硬阻塞 | 用户手动配置 15 个 Preview env variables | 用户 | ⏳ | Phase 1 部署 |
| **B-06** | 🟧 软阻塞 | Designer 验收 Echo UI 文案 | Designer | ⏳ | Phase 1 验收 |
| **B-07** | 🟧 软阻塞 | Privacy 页面文案（per OD-01 联动） | Designer | ⏳ | Phase 1 验收 |
| **B-08** | 🟧 软阻塞 | CI lint 检查（VITE_API_BASE_URL !== production URL） | Engineer | ⏳ | Phase 1 CI |
| **B-09** | 🟧 软阻塞 | Rate limit in-memory bucket 跨 instance 共享 | Engineer | ⏳ | Phase 2 升级 |
| **B-10** | 🟨 决策阻塞 | PM 确认 Phase 1 smoke test 通过标准 | PM | ⏳ | Phase 1 验收 |
| **B-11** | 🟨 决策阻塞 | PM 确认是否启用 Cloudflare Access | PM | ⏳ | Phase 1 / 2 |
| **B-12** | 🟨 决策阻塞 | 用户决定 Production alias 修复时机 | 用户 | ⏳ | Phase 3+ |
| **B-13** | 🟦 内部 | Echo 表不存在 → Phase 3 重启 Echo 时需重新建表 + schema 评审 | Engineer | ⏳ | Phase 3 |
| **B-14** | 🟦 内部 | Web 客户端 lat/lng fallback 依赖硬编码 data · Phase 2 评估 admin API | Engineer | ⏳ | Phase 2 |

---

## 2. 硬阻塞（Hard Blockers · 必须解决）

### B-01 · 创建 Supabase Project

**Owner**：用户
**预计耗时**：10 分钟
**阻塞**：所有 Phase 1 后端功能

**操作步骤**：

```text
1. 登录 https://supabase.com
3. New Project → Name: sethearth-alpha
4. Database Password: <random 32-char>
5. Region: us-east-1
6. Plan: Free
7. 等待 project ready（约 90 秒）
8. 复制 Project URL + service_role key + DATABASE_URL → 密码管理器
```

**输出物**：

- `SUPABASE_URL` = `https://xxxxxxxxxxxxx.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY` = `eyJ...`
- `DATABASE_URL` = `postgresql://postgres.[ref]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres`

**失败回退**：用户拒绝创建 → Phase 1 部署无法启动 → 回退到 hardcoded data + 不做 Phase 2/3。

---

### B-02 · 创建 Git Branches

**Owner**：用户
**预计耗时**：2 分钟
**阻塞**：Vercel Preview deployment

**操作步骤**：

```bash
cd "/Users/lwy/Documents/ChatGPT/看见地球"
git fetch origin
git checkout -b alpha origin/main
git push -u origin alpha

git checkout -b alpha-api origin/main
git push -u origin alpha-api
```

**输出物**：

- GitHub branches: `alpha` + `alpha-api` 各独立
- Vercel 自动检测 → 触发 2 个 Preview deployment

**失败回退**：用户拒绝 → 无法部署 → 回退到单 Preview URL（用 Vercel 自动生成 hash URL）。

---

### B-03 · 创建 Storage Bucket + RLS

**Owner**：用户
**预计耗时**：5 分钟
**阻塞**：Phase 1 资产上传 + EXIF 处理

**操作步骤**：

```sql
-- Supabase SQL Editor 执行

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'see-earth-alpha-assets',
  'see-earth-alpha-assets',
  false,
  20971520,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

CREATE POLICY "Service role full access on see-earth-alpha-assets"
  ON storage.objects
  FOR ALL
  TO service_role
  USING (bucket_id = 'see-earth-alpha-assets');
```

**输出物**：bucket `see-earth-alpha-assets` + RLS policy。

**失败回退**：bucket 未建 → seed 脚本无法上传资产 → Phase 1 仍可部署（仅 city + moment 数据），Phase 2 Witness 上传完全不可用。

---

### B-04 · 配置 Vercel Preview Domain

**Owner**：用户
**预计耗时**：10 分钟
**阻塞**：固定入口 URL

**操作步骤**：

```text
1. Vercel Dashboard → sethearth project → Settings → Domains
2. Add → alpha-see-earth.vercel.app → Assign to "alpha" branch
4. Add → alpha-api-see-earth.vercel.app → Assign to "alpha-api" branch
5. 等待 DNS 生效（30 秒 - 5 分钟）
```

**输出物**：2 个固定 URL。

**失败回退**：用户拒绝 → Phase 1 使用 Vercel 自动 hash URL（`setheearth-git-alpha-xxx.vercel.app`），测试者书签失效。

---

### B-05 · 配置 15 个 Preview env variables

**Owner**：用户
**预计耗时**：20 分钟
**阻塞**：API 启动 + 数据库连接

**前端（3 个）**：

| Variable | Value |
|---|---|
| `VITE_ENV` | `alpha` |
| `VITE_API_BASE_URL` | `https://alpha-api-see-earth.vercel.app/v1` |
| `VITE_USE_MOCK_API` | `false` |

**后端（12 个）**：

| Variable | Value |
|---|---|
| `SUPABASE_URL` | `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` |
| `DATABASE_URL` | `postgresql://...` |
| `RATE_LIMIT_PER_MIN` | `100` |
| `CORS_ALLOWED_ORIGINS` | `alpha-see-earth.vercel.app,*.vercel.app` |
| `LOG_LEVEL` | `info` |
| `STORAGE_BUCKET` | `see-earth-alpha-assets` |
| `SIGNED_URL_TTL_SECONDS` | `600` |
| `WITNESS_SESSION_TTL_DAYS` | `90` |
| `MAX_UPLOAD_BYTES` | `20971520` |
| `IMAGE_VARIANT_SIZES` | `320,640,1280` |
| `REQUEST_ID_HEADER` | `x-request-id` |

**输出物**：Vercel Dashboard → Preview tab → 15 个变量。

**失败回退**：env 缺失 → API 启动失败（DATABASE_URL 必填）/ CORS 失败 / Rate limit 默认值兜底。

---

## 3. 软阻塞（Soft Blockers · 可绕过）

### B-06 · Echo UI 文案验收

**Owner**：Designer
**预计耗时**：30 分钟
**阻塞**：Phase 1 验收 PM 评审

**待 Designer 验收**：

- "Echo 暂未开放 · 我们正在准备安全的接收渠道" 文案
- "敬请期待" 副文案
- "为什么暂未开放？查看 Privacy →" 链接样式

**绕过方案**：Phase 1 用工程师拟稿（已写在本文件）→ Designer 后续 patch。

---

### B-07 · Privacy 页面文案（per OD-01 联动）

**Owner**：Designer
**预计耗时**：1 小时
**阻塞**：Privacy 页面与 Echo UI 文案一致性

**待 Designer 输出**：

- 新增 "Echo 暂未开放（OD-01）" section
- 引用 `release-v1/minimal-witness/copy-final-v1.md`（已 LOCKED）
- Feedback 入口（PM Agent 后续接）

**绕过方案**：Privacy 页面 D-P0-01 标记 NEEDS STATE · Phase 1 不强制改动（Privacy 页面本身未 Lock）。

---

### B-08 · CI Lint 检查

**Owner**：Engineer
**预计耗时**：30 分钟
**阻塞**：防止 alpha → production 配置泄漏

**待实施**：

```yaml
# .github/workflows/ci.yml
- name: Check VITE_API_BASE_URL
  run: |
    if [[ "${{ github.ref }}" == "refs/heads/main" ]]; then
      if grep -rE "VITE_API_BASE_URL.*alpha-api-see-earth" src/; then
        echo "❌ Alpha API URL leaked into main branch"
        exit 1
      fi
    fi
```

**绕过方案**：手动 PR review 检查 · Phase 2 强化 CI。

---

### B-09 · Rate Limit 跨 Instance 共享

**Owner**：Engineer (Phase 2)
**预计耗时**：2 小时
**阻塞**：Phase 1 实际 rate limit 是 per-Vercel-instance · 不跨实例共享

**影响**：

- 真实 100 req/min/IP 限制 = 实际可能 100 × N（N = Vercel instance 数）
- 攻击者可绕过（每 instance 100 req）

**绕过方案**：Phase 1 接受此限制（标 WARN）· Phase 2 升级 Upstash Redis。

---

## 4. 决策阻塞（PM Decision Required）

### B-10 · Smoke Test 通过标准

**Owner**：PM Agent
**待决策**：smoke test 多少项通过 = ACCEPTED？

**建议**：

- Critical 测试（8 项）：100% 必须通过
  1. `/healthz` 200
  2. `/cities` 12 cities
  3. `/cities` NO lat/lng
  4. `/cities/kyoto` timezone=Asia/Tokyo
  5. `/cities/kyoto` NO lat/lng
  6. `/editions/today` 12 slots
  7. OPTIONS CORS 204
  8. 404 city_not_found
- Non-critical（11 项）：≥ 80% 通过

**PM 决策**：⏳ 待评审

---

### B-11 · Cloudflare Access 启用？

**Owner**：PM Agent
**待决策**：Alpha 是否启用 Cloudflare Access 访问控制？

**Alpha-env-decision §3.4 推荐**：Cloudflare Access（Email OTP + 团队成员白名单）

**PM 决策点**：

- 选项 A：启用（额外 30 分钟 Cloudflare 配置）
- 选项 B：不启用（任何有 URL 的人可访问 · 接受）

**Phase 1 建议**：选项 B（Phase 1 优先验证功能 · 访问控制 Phase 2 补）

---

### B-12 · Production Alias 修复时机

**Owner**：用户
**待决策**：`see-earth.vercel.app` Production alias 何时修复？

**Round 2A 背景**：audit-v1 §7.1 显示 Production BROKEN 404（alias 错配）。

**E-P0-02 约束**：**Phase 1 不触碰 Production** · 此 blocker 仅记录，不要求解决。

**用户决策点**：Phase 3 Launch 前必修复（独立任务卡）。

---

## 5. 内部 Blocker（Engineer 自治）

### B-13 · Echo 表缺失（Phase 3 影响）

**Owner**：Engineer (Phase 3)
**触发条件**：如 Phase 3 决定重启 Echo 流程
**待处理**：

- 创建 `echoes` 表（per `zod-schemas/echo.ts`）
- DB migration
- 重启 OD-01 决策评审
- Privacy Policy 文案更新

**Phase 1 处理**：标记 + 归档 · Phase 3 重新启动时再处理。

---

### B-14 · Web 客户端 lat/lng Fallback

**Owner**：Engineer (Phase 2)
**触发条件**：Web 客户端 Phase 1 仍依赖 `src/data/cities.ts` 计算 hero 图（pickImage）
**待处理**：

- 评估 hero 图选择是否必须 lat/lng
- 如必须：建立 admin API 提供 AdminCity schema（包含 lat/lng）
- 否则：前端用 hero_media 的 focus 字段替代

**Phase 1 处理**：

- 保留 `src/data/cities.ts` hardcoded fallback（仅 client-side，不离开 client）
- 不影响 privacy boundary（hardcoded data 不进入 HTTP response）

---

## 6. Blocker 优先级与时间线

```text
Day 0 (2026-08-22):
  ├─ Engineer Agent: 完成所有 10 份文档（已完成）
  └─ PM Agent: 评审文档 + 分发 blocker

Day 1 (2026-08-23 · 用户操作):
  ├─ B-01: 创建 Supabase (10 min)
  ├─ B-02: 创建 git branches (2 min)
  ├─ B-03: 创建 Storage bucket (5 min)
  ├─ B-04: 配置 Vercel Preview Domain (10 min)
  ├─ B-05: 配置 15 env vars (20 min)
  └─ Engineer Agent: 触发 seed 脚本

Day 1-2 (验证):
  ├─ B-08: Engineer 配置 CI lint
  └─ Engineer Agent: 执行 smoke test

Day 2 (PM 评审):
  ├─ B-06: Designer 验收 Echo 文案
  ├─ B-07: Designer 评审 Privacy 联动
  ├─ B-10: PM 决定 smoke test 通过标准
  ├─ B-11: PM 决定 Cloudflare Access
  └─ B-12: 用户决定 Production 修复时机（Phase 3）

Day 3 (Phase 1 验收):
  └─ PM Agent: 标记 Phase 1 COMPLETE / BLOCKED
```

---

## 7. Blocker 状态汇总

| 状态 | 数量 | 列表 |
|---|---|---|
| 🟥 硬阻塞 · 未解决 | 5 | B-01, B-02, B-03, B-04, B-05 |
| 🟧 软阻塞 · 未解决 | 4 | B-06, B-07, B-08, B-09 |
| 🟨 决策阻塞 · 未决策 | 3 | B-10, B-11, B-12 |
| 🟦 内部阻塞 · 已识别 | 2 | B-13, B-14 |
| **总计** | **14** | |

---

## 8. Phase 2 / Phase 3 输入

### 8.1 给 Phase 2（Witness Submission）

**前置依赖**：

- B-01（Supabase）
- B-03（Storage bucket）
- B-05（DATABASE_URL 已配）

**Phase 2 任务**：

- 实现 `/v1/witness/submissions` POST endpoint
- 实现 Storage webhook → processAsset 触发
- 实现 Witness UI（6 段流程）
- 实现 Echo POST 决策评估（是否重启 Echo）

### 8.2 给 Phase 3（Admin + Analytics）

**前置依赖**：

- B-12（Production alias 修复）

**Phase 3 任务**：

- Admin endpoint + admin UI
- Analytics SDK 集成（per D-P0-05）
- Echo 表重启决策（B-13）

---

## 9. 元数据

| 字段 | 值 |
|---|---|
| 文档版本 | v1 |
| 创建时间 | 2026-08-22 |
| 创建人 | Engineer Agent (Round 2B) |
| 文档 ID | `phase1-blockers-v1.md` |
| 目标 Gate | Gate A · Internal Alpha · Phase 1 |
| 决策状态 | ✅ ACCEPTED（待 PM 评审 + 用户操作） |
| Workspace 路径 | `/Users/lwy/Documents/ChatGPT/看见地球/release-v1/vertical-slice-phase1/phase1-blockers-v1.md` |
| Obsidian canonical 路径 | `/Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/vertical-slice-phase1/phase1-blockers-v1.md` |
| Obsidian 同步状态 | ❌ 未同步（sandbox 拒绝写入 Obsidian） |

---

**End of phase1-blockers-v1.md**