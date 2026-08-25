---
title: SEE EARTH · 回滚流程 v1
type: rollback-procedure
tags: [release-v1, e-p0-08, alpha-env, rollback, deployment, see-earth]
task_id: E-P0-08-E
gate_target: Gate A · Internal Alpha
dispatched_at: 2026-08-22
dispatch_round: Round 2A
status: DRAFT · IN REVIEW
author: Engineer Agent #2
target_audience: 团队成员（不依赖 owner 在场）
source_inputs:
  - /Users/lwy/Documents/ChatGPT/看见地球/release-v1/alpha-environment/deployment-guide-v1.md §3
  - /Users/lwy/Documents/ChatGPT/看见地球/release-v1/alpha-environment/vercel-alias-fix-v1.md §3
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/alpha-environment/rollback-v1.md
workspace_canonical_path: /Users/lwy/Documents/ChatGPT/看见地球/release-v1/alpha-environment/rollback-v1.md
sync_required: true · sandbox 拒绝写入 Obsidian
---

# SEE EARTH · 回滚流程 v1

> **作者**：Engineer Agent #2（外部 Owner = 用户）
> **派发时间**：2026-08-22
> **目标**：让任何团队成员在 10 分钟内完成 Alpha / Production 任一环境的回滚
> **核心原则**：**快速回滚优先于完美修复 · 保留所有历史 deployment · 文档化每次回滚**

---

## 0. 一句话结论

**回滚 = Vercel Dashboard 1 次点击（推荐）或 git revert（保留历史）。当前 V1 无真实数据库，"数据回滚" = 强制刷新浏览器 = 客户端缓存重置。**

---

## 1. 回滚场景分类

| 场景 | 触发条件 | 影响范围 | 回滚方式 |
|---|---|---|---|
| **场景 A · Alpha 部署 Bug** | 新部署导致测试者遇到 blocker（页面崩溃 / 数据错乱） | 仅 Alpha Preview | Vercel Dashboard 1 次点击 |
| **场景 B · Production 部署 Bug** | Production alias 修复后，新部署引入 blocker | 仅 Production | Vercel Dashboard 1 次点击 |
| **场景 C · 客户端缓存问题** | Service Worker 缓存了旧版本 bundle | 用户浏览器 | 强制刷新 + 清除 SW |
| **场景 D · Vercel 配置错配** | 环境变量错误 / 域名配置错误 | 全部 Preview | Vercel Dashboard 编辑 |
| **场景 E · 数据污染（未来）** | E-P0-02 后端落地后，DB 数据被错误写入 | Alpha DB | 调用 reset-data 脚本（预制） |

---

## 2. 场景 A · Alpha 部署 Bug 回滚

### 2.1 Vercel Dashboard 一键回滚（推荐 · 5 分钟）

```text
Step 1. 登录 Vercel Dashboard
        URL: https://vercel.com/dashboard/setheearth

Step 2. 进入 Deployments 标签
        按时间倒序排列 deployment 列表

Step 3. 找到上一个稳定 deployment（状态 = "Ready" · commit message 清晰）
        建议选择：
        - 状态 = "Ready"
        - Build Time < 3 分钟（快速 build 通常更稳定）
        - commit message 含 "v1.6.x" 或 "feat(verified)" 等明确语义
        - 测试者在 Slack/邮件确认过该 deployment 正常

Step 4. 点击 deployment 右侧 "..." → "Promote to Production Branch"
        ⚠️ 注意：
        - Alpha Preview 用 "Promote to Production Branch"（针对 alpha 分支）
        - 不要误选 main 分支 Production

Step 5. 等待 30 秒 - 2 分钟（Vercel 重新路由流量）

Step 6. 验证回滚成功
        - 浏览器访问 https://alpha-see-earth.vercel.app
        - DevTools → Network → 查看 JS bundle hash
        - 期望：bundle hash 等于目标 deployment 的 hash
        - 测试者 Slack 确认问题已修复
```

### 2.2 git revert 回滚（备选 · 保留历史）

```bash
# 1. 找到需要回滚的 commit
git log --oneline origin/alpha -20

# 输出示例：
# a1b2c3d (HEAD -> alpha) feat(witness): 新 Witness UI（坏版本）
# e4f5g6h feat(cities): 城市筛选优化
# i7j8k9l docs(hygiene): v1.6.4 entry
# ...

# 2. 回滚特定 commit
git checkout alpha
git pull origin alpha

git revert a1b2c3d --no-edit
# 输出：创建新 commit "Revert "feat(witness): 新 Witness UI（坏版本）""

# 3. 推送 → Vercel 自动触发新 Preview deployment
git push origin alpha

# 4. 等待 1-3 分钟 build 完成

# 5. 验证新 deployment = 旧 deployment + revert commit

# 6. ⚠️ 清理：可在 Vercel Dashboard 删除坏 deployment
```

### 2.3 git reset 回滚（紧急 · 慎用）

```bash
# 1. 强制重置 alpha 分支到指定 commit
git checkout alpha
git reset --hard <good-commit-sha>

# 2. 强制推送（⚠️ 会重写 alpha 分支历史）
git push --force-with-lease origin alpha

# 3. 团队成员需要重新同步
git fetch origin
git reset --hard origin/alpha

# 4. ⚠️ 警告：
#    - --force 会丢失所有未推送的本地 commit
#    - 团队成员本地未推送的工作可能丢失
#    - 仅在紧急情况下使用（如坏 commit 包含敏感数据）
```

---

## 3. 场景 B · Production 部署 Bug 回滚

### 3.1 Vercel Dashboard 一键回滚

```text
Step 1. Vercel Dashboard → setheearth → Deployments
Step 2. 找到上一个稳定 Production deployment（domain: see-earth.vercel.app）
Step 3. "..." → "Promote to Production"
Step 4. 等待 30 秒 - 2 分钟
Step 5. 验证 https://see-earth.vercel.app 已回滚
```

### 3.2 Production 回滚的特殊考虑

⚠️ **Production 回滚影响所有用户，必须满足以下条件**：

- [ ] PM Agent 已通知用户群体（即使是 alpha 内部测试者）
- [ ] 已记录回滚原因 + commit hash
- [ ] 已确认回滚后版本满足"无未解决 Blocker"
- [ ] 已通知设计 / 内容 / 运营团队

**Production 回滚后必须做**：

1. 在 PM Agent 任务卡添加 "Production 回滚" 记录
2. 在 `CHANGELOG.md` 顶部添加 "⚠️ Rolled back to <version> at <date>"
3. 调查回滚原因（commit log / 测试报告 / 监控告警）
4. 修复后重新部署（git revert 或新 fix commit）
5. 补充回归测试

---

## 4. 场景 C · 客户端缓存问题

### 4.1 症状

- 部署成功 · Vercel Dashboard 显示 Ready
- 浏览器访问仍看到旧版本内容
- 用户反馈"看不到新功能"

### 4.2 原因

- Service Worker（`public/sw.js`）缓存了旧版本 `dist/`
- 浏览器内存缓存了旧的 `index.html`

### 4.3 修复（用户操作）

```text
方案 1 · 强制刷新（90% 情况有效）
  macOS: Cmd + Shift + R
  Windows: Ctrl + Shift + R
  Linux: Ctrl + Shift + R

方案 2 · 清除 Service Worker（更彻底）
  Chrome DevTools → Application → Service Workers → Unregister
  刷新页面

方案 3 · 清除所有缓存（100% 有效）
  Chrome DevTools → Application → Storage → Clear site data
  刷新页面

方案 4 · 隐身模式测试
  Cmd/Ctrl + Shift + N → 访问 Alpha URL
  验证是否仍是旧版本 → 若新版本正常 = 缓存问题
```

### 4.4 预防（E-P0-02 落地后）

升级 Service Worker 配置：

```javascript
// public/sw.js (升级版 · 未来)
const CACHE_VERSION = 'v1.6.4'; // 每次部署更新此值
const CACHE_NAME = `see-earth-${CACHE_VERSION}`;

self.addEventListener('install', (event) => {
  self.skipWaiting(); // 强制激活新 SW
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
});
```

---

## 5. 场景 D · Vercel 配置错配回滚

### 5.1 环境变量错误

```text
Step 1. Vercel Dashboard → Settings → Environment Variables
Step 2. 找到错误变量 → 点击 "..." → "Edit"
Step 3. 修改 Value → Save
Step 4. Deployments → 最新 deployment → "..." → Redeploy
        （环境变量修改不会自动触发 redeploy，需手动）
```

### 5.2 域名配置错误

```text
Step 1. Vercel Dashboard → Settings → Domains
Step 2. 找到错误域名 → 点击 "..." → "Remove"
Step 3. 重新添加正确域名（如 alpha-see-earth.vercel.app）
Step 4. 等待 DNS 传播（30 秒 - 5 分钟）
```

### 5.3 GitHub Integration 断开

```text
Step 1. Vercel Dashboard → Settings → Git
Step 2. 若显示 "Disconnected" → 点击 "Reconnect"
Step 3. 授权 Vercel 访问 GitHub repo
Step 4. 测试 git push → 应触发新 deployment
```

---

## 6. 场景 E · 数据污染回滚（预制 · 等 E-P0-02）

### 6.1 当前状态

V1 当前**无数据库 / 无对象存储**，"数据污染" = 浏览器客户端缓存。详见 §4。

### 6.2 未来数据回滚（E-P0-02 后端落地后补真实脚本）

**预制脚本**：

```bash
#!/bin/bash
# release-v1/alpha-environment/scripts/reset-data.sh
# ⚠️ PLACEHOLDER · 待 E-P0-02 后端 API 落地后替换

set -euo pipefail

ENV="${1:-alpha}"
DRY_RUN="${2:-false}"

echo "[reset-data] Resetting Alpha data for environment: $ENV"

if [ "$DRY_RUN" = "true" ]; then
  echo "[reset-data] DRY-RUN mode · no changes will be made"
fi

# 1. Pre-reset backup
echo "[reset-data] Step 1: Backing up current data..."
BACKUP_FILE="./backups/alpha-backup-$(date +%Y%m%d-%H%M%S).json"
mkdir -p ./backups
# TODO: 调用后端 API 导出当前数据到 $BACKUP_FILE

# 2. 数据库迁移（含 dry-run 模式）
echo "[reset-data] Step 2: Running database migrations..."
# TODO: 调用 E-P0-02 决策的 migration 工具（如 Prisma）

# 3. Seed 数据初始化
echo "[reset-data] Step 3: Seeding initial data from src/data/*.ts..."
node --experimental-strip-types release-v1/alpha-environment/scripts/seed-data.ts "$ENV"

# 4. 清空 Witness submission（重置审核队列）
echo "[reset-data] Step 4: Clearing Witness submissions..."
# TODO: POST /api/admin/reset/submissions

# 5. 清空 Echo（重置用户留痕）
echo "[reset-data] Step 5: Clearing Echo entries..."
# TODO: POST /api/admin/reset/echoes

# 6. Post-reset validation
echo "[reset-data] Step 6: Running smoke tests..."
# TODO: 自动化测试 5 个核心路由

if [ "$DRY_RUN" = "true" ]; then
  echo "[reset-data] ✅ DRY-RUN complete. No changes made."
else
  echo "[reset-data] ✅ Alpha data reset complete."
  echo "[reset-data] Backup saved to: $BACKUP_FILE"
fi
```

**使用方式**：

```bash
# Dry-run 模式（先预览会做什么）
./release-v1/alpha-environment/scripts/reset-data.sh alpha true

# 真实重置
./release-v1/alpha-environment/scripts/reset-data.sh alpha false

# 重置并保留备份
BACKUP_RETENTION=7 ./release-v1/alpha-environment/scripts/reset-data.sh alpha false
```

### 6.3 数据备份策略（E-P0-02 落地后补）

| 数据类型 | 备份频率 | 保留时长 | 备份位置 |
|---|---|---|---|
| 全部数据（每日 snapshot） | 每天 00:00 UTC | 30 天 | `backups/daily/` |
| Pre-reset backup | 每次 reset 前 | 7 天 | `backups/reset/` |
| Pre-migration backup | 每次 migration 前 | 永久（限 100 个） | `backups/migration/` |

---

## 7. 回滚决策矩阵

### 7.1 快速决策树

```text
发现 Bad Deployment
  │
  ├── 哪个环境?
  │     ├── Alpha Preview ────────────► 场景 A · Vercel Dashboard 1 click
  │     └── Production ────────────────► 场景 B · 通知 PM + Vercel Dashboard
  │
  ├── 严重程度?
  │     ├── Blocker（页面崩溃 / 数据错乱）──► 立即回滚
  │     ├── Major（功能异常） ─────────────► 15 分钟内决策
  │     └── Minor（UI 小问题）─────────────► 记录 issue · 下次发布修复
  │
  └── 需要保留历史?
        ├── 是 ──► git revert（保留原 commit + 新 revert commit）
        └── 否 ──► Vercel Dashboard "Promote" 或 git reset --force
```

### 7.2 回滚 owner 矩阵

| 环境 | Owner | 决策者 | 通知渠道 |
|---|---|---|---|
| Alpha Preview | 任何团队成员（无需 owner 在场） | 团队成员自助决策 | Slack #engineering |
| Production | 必须 PM Agent 批准 + 用户批准 | PM Agent | Slack #engineering + 邮件 |

---

## 8. 回滚后必做事项 checklist

每次回滚后 24 小时内：

- [ ] 在 PM Agent 任务卡添加 "回滚记录"（含 commit hash / 时间 / 原因）
- [ ] 在 `CHANGELOG.md` 顶部添加 "⚠️ Rolled back to <version> at <date>"（若是 Production）
- [ ] 调查回滚根因（git log / 测试报告 / Vercel build log / 用户反馈）
- [ ] 修复问题（git revert 或新 fix commit）
- [ ] 重新部署 + 验证
- [ ] 补充回归测试（避免同样问题再次发生）
- [ ] 通知团队（Slack #engineering + 邮件）
- [ ] 若涉及用户数据损失：在 `/about` 页面添加说明（Production 专属）

---

## 9. 一键回滚脚本（粘到 `package.json`）

```jsonc
// package.json scripts 扩展
{
  "scripts": {
    // ... 现有 scripts ...
    "alpha:rollback": "echo '🔄 Alpha rollback procedure:' && echo '1. Vercel Dashboard → Deployments → Click target deployment → \"Promote to Production Branch\"' && echo '2. See release-v1/alpha-environment/rollback-v1.md for full procedure'",
    "alpha:reset-data": "echo '⚠️ Data reset is a placeholder (V1 has no DB yet). See release-v1/alpha-environment/rollback-v1.md §6'"
  }
}
```

---

## 10. 与其他交付物交叉引用

| 交付物 | 交叉引用章节 |
|---|---|
| `vercel-alias-fix-v1.md` | §3 方案 1-3（Production 部署修复） |
| `deployment-guide-v1.md` | §3 回滚流程（更详细的 deployment 视角） |
| `env-decision-v1.md` | §3.5 Secrets 隔离（与 rollback 配合） |
| `access-control-v1.md` | §3 Secrets 轮换策略（独立于 rollback） |
| `alpha-readme-v1.md` | §6 紧急联系人（rollback 时通知谁） |

---

## 11. 元数据

| 字段 | 值 |
|---|---|
| 文档版本 | v1 |
| 创建时间 | 2026-08-22 |
| 创建人 | Engineer Agent #2 |
| 文档 ID | `rollback-v1.md` |
| 目标 Gate | Gate A · Internal Alpha |
| 目标读者 | 团队成员（不依赖 owner） |
| 最大回滚时间 SLA | Alpha: 10 分钟 · Production: 30 分钟 |
| Workspace 路径 | `/Users/lwy/Documents/ChatGPT/看见地球/release-v1/alpha-environment/rollback-v1.md` |
| Obsidian canonical 路径 | `/Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/alpha-environment/rollback-v1.md` |
| Obsidian 同步状态 | ❌ 未同步 |

---

**End of Document**
