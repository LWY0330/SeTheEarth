---
title: SEE EARTH · Alpha Environment README v1
type: alpha-readme
tags: [release-v1, e-p0-08, alpha-env, readme, quick-start, faq, see-earth]
task_id: E-P0-08-F
gate_target: Gate A · Internal Alpha
dispatched_at: 2026-08-22
dispatch_round: Round 2A
status: DRAFT · IN REVIEW
author: Engineer Agent #2
target_audience: 团队成员 + PM Agent + Designer + QA + Content Ops
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/alpha-environment/alpha-readme-v1.md
workspace_canonical_path: /Users/lwy/Documents/ChatGPT/看见地球/release-v1/alpha-environment/alpha-readme-v1.md
sync_required: true · sandbox 拒绝写入 Obsidian
---

# SEE EARTH · Alpha Environment README v1

> **Quick Start** for 团队成员 + **常见问题** for 所有角色
> **目标 Gate**：Gate A · Internal Alpha
> **创建时间**：2026-08-22

---

## 0. 一句话概览

**Alpha 环境是 SEE EARTH V1 的内部测试环境，与 Production 完全隔离。任何团队成员（无需 owner 在场）按本文档可在 10 分钟内开始测试。**

---

## 1. 5 分钟 Quick Start

### 1.1 访问 Alpha

```text
URL: https://alpha-see-earth.vercel.app
(若未配置 Preview Domain · 使用 Vercel 自动 URL)
备选: https://setheearth-git-alpha-lwy0330.vercel.app
```

**首次访问**：

1. 浏览器输入 Alpha URL
2. （若启用 Cloudflare Access）输入邮箱 → 邮箱收到 6 位 OTP → 输入 → 进入
3. 看到红色 Alpha Banner（顶部固定）："您正在访问 SEE EARTH Alpha 环境"
4. 开始测试

**重要**：

- ✅ Alpha Banner 必须可见 → 否则可能访问到 Production
- ✅ 反馈问题 → 点击 Banner 右侧 "反馈问题" 按钮
- ❌ 不要在 Alpha 输入真实个人信息
- ❌ 不要分享 Alpha URL 给团队外人员

### 1.2 测试核心路径

| 测试目标 | 路径 | 期望 |
|---|---|---|
| Daily 12 浏览 | `/` | 首页加载 + 6 城 + 6 moments |
| 城市列表 | `/cities` | 12 城列表 |
| 城市详情 | `/cities/kyoto` | 京都 City Page + 4 场景图 |
| Unknown Coordinate | `/unknown` | 5 stage Reveal |
| About | `/about` | About Page + Alpha 警告 |
| 反馈入口 | 任意页面 | 顶部 Banner "反馈问题" 按钮 |

### 1.3 测试完成后反馈

```text
1. 点击 Alpha Banner "反馈问题" 按钮
2. 在表单填写：
   - 测试场景（Daily 12 / City / Unknown / Witness）
   - 设备（Desktop / Tablet / Mobile）
   - 浏览器（Chrome / Safari / Firefox / Edge）
   - 期望 vs 实际
   - 截图（可选）
3. 提交
4. 团队 owner 会在 Slack #engineering 收到通知
```

---

## 2. 团队成员角色 & 职责

| 角色 | Alpha 职责 | 联系 |
|---|---|---|
| **外部 Owner (lwy)** | Vercel Dashboard 管理 · Cloudflare Access 配置 · 用户最终审批 | — |
| **PM Agent (Orchestrator)** | 任务卡派发 · 进度跟踪 · 反馈归档 | — |
| **Engineer Agent** | 部署 · 监控 · 修复 · 回滚 | — |
| **Designer** | Alpha Banner 视觉 · D-P0-03 状态规范 · 测试反馈 | — |
| **QA** | Smoke test · 回归测试 · Bug 报告 | — |
| **Content Ops** | Seed 数据审核 · Witness submission 验证（E-P0-02 后） | — |

---

## 3. Alpha 与 Production / 本地的差异

| 维度 | Alpha Preview | Production（修复后） | 本地开发 |
|---|---|---|---|
| URL | `alpha-see-earth.vercel.app` | `see-earth.vercel.app` | `localhost:5173` |
| Banner | 红色 Alpha Banner | 无 Banner | 无 Banner |
| 访问控制 | Cloudflare Access + Email OTP | 公开 | 本地 |
| 数据 | 客户端硬编码（12 城 + 18 moments） | 客户端硬编码（同 Alpha） | 客户端硬编码（同 Alpha） |
| 第三方 API | open-meteo + sunrise-sunset（共用） | open-meteo + sunrise-sunset | open-meteo + sunrise-sunset（可 mock） |
| 重置频率 | 随时（强制刷新 = 重置） | n/a（无 DB） | 随时 |

**重要**：Alpha 看似与 Production 相似（都是 12 城 + 18 moments），但 **Production 修复后会进入 Vercel 修复流程，与 Alpha 完全独立维护**。不要在 Alpha 修复 Production bug，应在 alpha 分支提交新代码。

---

## 4. 文件结构（本目录）

```text
release-v1/alpha-environment/
├── alpha-readme-v1.md           ← 本文件
├── vercel-alias-fix-v1.md        ← Vercel alias 诊断 + 修复指南
├── env-decision-v1.md            ← Alpha 环境决策（Vercel Preview + 分支）
├── deployment-guide-v1.md        ← 部署 / 回滚 / 数据重置（详细）
├── access-control-v1.md          ← 访问控制 + Secrets 管理
├── rollback-v1.md                ← 回滚流程（场景化）
└── scripts/
    ├── seed-data.ts              ← Seed 报告生成（占位）
    └── check-bundle-secrets.sh   ← CI Secret 检查脚本
```

---

## 5. 常见问题 FAQ

### Q1 · 我访问 Alpha URL 但看不到 Alpha Banner，是 Production 吗？

**A**：可能是以下情况之一：

1. **URL 拼写错误** → 确认是 `alpha-see-earth.vercel.app`（不是 `see-earth.vercel.app`）
2. **Preview Domain 未配置** → 联系 Owner 配置，或使用 Vercel 自动 URL（`setheearth-git-alpha-lwy0330.vercel.app`）
3. **`VITE_ENV` 环境变量未配置** → 联系 Owner 在 Vercel Dashboard 添加 Preview env `VITE_ENV=alpha`
4. **缓存了旧版本** → 强制刷新（Cmd+Shift+R / Ctrl+Shift+R）

### Q2 · 我无法访问 Alpha（被 Cloudflare Access 拒绝）

**A**：

1. 确认你的邮箱在 Cloudflare Access 白名单内（联系 PM Agent）
2. 检查邮箱垃圾箱（OTP 邮件可能被过滤）
3. 等待 30 秒 · 重新请求 OTP
4. 仍然失败 → 在 Slack #engineering 求助，团队 owner 手动添加白名单

### Q3 · Alpha 与 Production 数据是隔离的吗？

**A**：**完全隔离**。当前 V1 没有数据库，所有数据硬编码在 `src/data/*.ts`，Alpha 和 Production 共享同一 source code 但 deployment 不同（不同 deployment ID + 不同 alias + 不同 CDN 节点）。

未来 E-P0-02 后端落地后，Alpha 将有独立数据库（DB_URL 指向 Neon Preview DB），Production 独立 DB。

### Q4 · 我可以在 Alpha 测试 Witness 提交吗？

**A**：**当前 V1 不行**。Witness UI 和后端尚未实现（属于 E-P0-02 / E-P0-03 任务）。Alpha 当前可测试：

- ✅ Daily 12 / Moment / City 浏览
- ✅ Unknown Coordinate Reveal
- ✅ Echo 输入（仅前端 · 不持久化）
- ❌ Witness 提交（等待 E-P0-03）
- ❌ Daily 12 编辑（等待 E-P0-06）

### Q5 · 我部署了新代码但页面没变化

**A**：

1. 检查 Vercel Dashboard → Deployments → 最新 deployment 状态
2. 若状态 = "Ready" 但页面无变化 → **强制刷新**（Cmd+Shift+R）
3. 若 Service Worker 缓存 → DevTools → Application → Service Workers → Unregister
4. 若仍无变化 → 检查 `git push origin alpha` 是否成功推送

### Q6 · 我部署的代码破坏了 Alpha 怎么办？

**A**：

**立即回滚**（Vercel Dashboard 一键 · 5 分钟）：

```text
1. Vercel Dashboard → Deployments
2. 找到上一个稳定 deployment（status = "Ready"）
3. "..." → "Promote to Production Branch"
4. 等待 1-2 分钟
5. 验证已回滚
```

详见 `rollback-v1.md §2`。

### Q7 · 我能在本地 dev server 测试吗？

**A**：可以，但与 Alpha 不完全一致。

```bash
cd "/Users/lwy/Documents/ChatGPT/看见地球"
git checkout alpha
git pull origin alpha
npm install
npm run dev
# 浏览器访问 http://localhost:5173
```

本地差异：

- 无 Alpha Banner（除非手动设置 `VITE_ENV=alpha`）
- 无 Cloudflare Access（直接访问）
- 第三方 API 可切 mock（修改 `.env.local`）

### Q8 · Alpha Banner 颜色 / 文案谁决定？

**A**：D-P0-03（Alpha / Beta 状态设计）Designer 输出。本卡预制了基础实现（红色 Banner + 反馈按钮），等 Designer 输出后微调。

### Q9 · 我可以在 Alpha 输入真实 Witness 提交吗？

**A**：当前 V1 没有 Witness UI（E-P0-02 / E-P0-03 待落地）。即使有 UI，**禁止在 Alpha 输入真实个人信息**——Alpha 数据可能随时重置，仅用于测试。

### Q10 · Alpha 监控数据在哪里看？

**A**：

- **部署状态**：Vercel Dashboard → Deployments
- **运行时日志**：Vercel Dashboard → Deployment → Logs
- **错误监控**（E-P0-10 接入后）：Sentry Dashboard → `setheearth-alpha` project
- **性能监控**（E-P0-10 接入后）：Vercel Analytics → Alpha Preview filter

---

## 6. 紧急联系人

| 场景 | 联系人 | 渠道 |
|---|---|---|
| Vercel Dashboard / Domain 配置问题 | 外部 Owner (lwy) | 直接联系 |
| Cloudflare Access 锁定 / 白名单问题 | PM Agent | Slack #engineering |
| Seed 数据 / 部署脚本问题 | Engineer Agent | Slack #engineering |
| Banner 视觉 / 文案问题 | Designer | Slack #design |
| Smoke test / Bug 报告 | QA | Slack #qa |
| Witness / Edition 后端问题 | Engineer Agent + PM Agent | Slack #engineering |

---

## 7. 相关文档（交叉引用）

| 文档 | 何时阅读 |
|---|---|
| [`vercel-alias-fix-v1.md`](./vercel-alias-fix-v1.md) | Production 404 排查 |
| [`env-decision-v1.md`](./env-decision-v1.md) | 理解 Alpha 环境决策理由 |
| [`deployment-guide-v1.md`](./deployment-guide-v1.md) | 首次部署 / 数据重置 |
| [`access-control-v1.md`](./access-control-v1.md) | Secrets 管理 / 访问控制 |
| [`rollback-v1.md`](./rollback-v1.md) | 回滚流程（场景化） |
| [Backend Reality Audit v1](../backend-reality-audit-v1.md) | 理解 V1 现状（无后端 / 无 DB） |
| [Release Strategy Brief §5 E-P0-08](https://obsidian/项目/看见地球 设计/SEE-EARTH-Release-Strategy-v1-Design-Engineering-Task-Brief.md#5-工程师任务) | 任务卡原文 |
| [Task Card E-P0-08](https://obsidian/项目/看见地球 设计/06-PM Agent 交接/2026-08-22-task-card-e-p0-08-web-alpha-env.md) | PM Agent 任务卡 |

---

## 8. 里程碑 & 状态

| 里程碑 | 日期 | 状态 |
|---|---|---|
| E-P0-01 Backend Reality Audit | 2026-08-22 | ✅ ACCEPTED |
| E-P0-08 Alpha Environment（本卡） | 2026-08-22 | 🔄 IN REVIEW |
| E-P0-09 API Contract | 2026-08-22 | 🔄 IN PROGRESS |
| E-P0-02 Launch Vertical Slice | TBD | 📋 等待 E-P0-08 + E-P0-09 完成 |
| Production alias 修复 | 待用户执行 | 🔴 OPEN |
| Cloudflare Access 配置 | 待用户执行 | 🔴 OPEN |
| Alpha Preview Domain 配置 | 待用户执行 | 🔴 OPEN |
| Gate A · Internal Alpha 启动 | TBD | ⏳ 等待本卡 ACCEPTED |

---

## 9. 元数据

| 字段 | 值 |
|---|---|
| 文档版本 | v1 |
| 创建时间 | 2026-08-22 |
| 创建人 | Engineer Agent #2 |
| 文档 ID | `alpha-readme-v1.md` |
| 目标 Gate | Gate A · Internal Alpha |
| 目标读者 | 全团队 + 测试者 |
| Workspace 路径 | `/Users/lwy/Documents/ChatGPT/看见地球/release-v1/alpha-environment/alpha-readme-v1.md` |
| Obsidian canonical 路径 | `/Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/alpha-environment/alpha-readme-v1.md` |
| Obsidian 同步状态 | ❌ 未同步（DSH session sandbox 拒绝写入 Obsidian） |

---

**End of README**
