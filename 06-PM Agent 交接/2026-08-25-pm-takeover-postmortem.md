---
type: postmortem
tags: [postmortem, pm-failure, sentry, vercel, vite-env, see-earth-v1, phase-1, lessons-learned]
created: 2026-08-25
created_at: 2026-08-25 16:50
status: 🟡 公开 · 供后续 PM 学习
severity: P2 (事故影响 0 业务损失,但 PM Agent 浪费 5 小时)
title: Sentry 环境变量事故 · 接管 PM Agent 失败复盘
author: 接管 PM Agent (round-5 后)
related_docs:
  - 06-PM Agent 交接/2026-08-25-sentry-env-var-incident-report.md (incident 报告)
  - 06-PM Agent 交接/2026-08-25-pm-handoff-sentry-incident-resolved.md (外部 PM 解决报告)
  - 06-PM Agent 交接/2026-08-25-pm-handoff-round5-v1.md (我的 round-5 接管 handoff)
  - 06-PM Agent 交接/2026-08-25-phase1-to-phase2-handoff.md (Phase 1 → Phase 2 完整交接)
---

# 📛 POSTMORTEM · Sentry 环境变量事故 · 接管 PM Agent 失败复盘

> **作者**: 接管 PM Agent (round-5 后) · 2026-08-25 16:50
> **目的**: 记录我（接管 PM）在 5 小时内**没解决**而外部 PM 在 30 分钟内**解决**的根因,以及给后续 PM 的硬性教训。
> **基调**: 不甩锅 · 不辩解 · 用事实说话。

---

## 🎯 TL;DR (60 秒读完)

**事故**: Sentry alpha project 收不到浏览器测试事件。
**真因**: `VITE_SENTRY_DSN` 和 `VITE_ENV` 配置在**错误的 Vercel 项目** (setheearth-2),而实际部署项目 (sethearth) 只有天气变量。
**外部 PM 用 30 分钟查 Vercel deployment metadata 直接定位;我(接管 PM)用 5 小时盲猜 + 加 console.log + 重新部署,陷入"调试循环"失败。**
**业务影响**: 0 · Sentry 是 P2 监控,Phase 1 用户业务不受影响。
**核心教训**: **永远先查官方 metadata,不要先猜 runtime 行为。** 详见下面 7 条铁律。

---

## 📊 事故时间线

| 时间 | 事件 | 我做对了吗 |
|---|---|---|
| 08-25 14:02 | Supabase 4 段 SQL 100% 部署完成 | ✅ |
| 08-25 14:07 | commit `54a368e` push 修复文件 + 文档 | ✅ |
| 08-25 14:15 | Vercel `60c47cb` Ready (含 src/lib/analytics/) | ✅ |
| 08-25 14:17 | 用户首次 throw → Sentry 未收到 | (未察觉问题) |
| 08-25 14:30 | 用户截图 VITE_SENTRY_DSN 完整 DSN + Preview 勾选 | (信任 UI 状态) |
| 08-25 14:50 | commit `70ac764` 移除 if 包裹 | (治标) |
| 08-25 15:00 | commit `768865a` 加 debug 日志 | (治标) |
| 08-25 15:09 | 用户截图 CORS 错误 (Vercel SSO) | ❌ **没意识到与 Sentry 无关** |
| 08-25 15:10 | commit `1c7d1a1` 把 VITE env 挂 window | (治标) |
| 08-25 15:25 | 用户不耐烦,要求"汇总问题" | (被迫降级) |
| 08-25 15:30 | 写 incident report, 推荐 3 个修复路径 | (给出选项 A/B/C) |
| 08-25 ~16:00 | 外部 PM 介入,查 Vercel deployment metadata | (外部 PM 找真因) |
| 08-25 16:22 | 外部 PM 在正确项目配 env var,Redeploy, Sentry 收到事件 | ✅ |
| 08-25 16:34 | 外部 PM commit `fe801af` 清理代码 | ✅ |
| 08-25 16:45 | 接管 PM push `fe801af` 入库 | ✅ |
| 08-25 16:50 | 写本 postmortem | (现在) |

---

## 🔍 外部 PM 找到的真因 (我之前完全没怀疑)

**`VITE_SENTRY_DSN` 和 `VITE_ENV` 被配置在了 `seethearth-2` 项目,而实际部署项目是 `seethearth/sethearth`。**

Vercel 团队下有 2 个项目:
- **`sethearth-2`**: 用户截图看到的"6 个 env vars 都在、Preview 勾选"
- **`sethearth`**: 实际部署项目,只有 `WEATHER_API_PROVIDER` + `SUN_PROVIDER`

GitHub deployment metadata 显示实际部署目标是 `seethearth/sethearth`,所以 build 拿不到用户在 `sethearth-2` 配的 env vars。

### 外部 PM 的诊断方法 (3 步 · 30 分钟)

1. **查 Vercel deployment metadata** ← 关键步骤! 我没做
2. 对比"deployment 目标项目" vs "env var 所在项目" ← 关键洞察! 我没做
3. 在正确项目配 env var + Redeploy

### 接管 PM 的诊断方法 (5 步 · 5 小时)

1. 看 Vercel Env Vars 页面截图 (信任 UI 状态)
2. 让用户看 VITE_SENTRY_DSN Value (确认值对)
3. 改 main.tsx (移除 if 包裹)
4. 加 console.log debug 日志
5. 把 env 挂到 window.__VITE_DEBUG__

**结果**: 5 步都在 runtime 行为层面打转,**完全没怀疑"env var 可能配在了别的项目"**。

---

## 💀 我(接管 PM)的 5 大失误

### 失误 1 · **过度信任 Vercel UI 状态, 不做交叉验证**

**事实**: 用户 14:30 截图显示 VITE_SENTRY_DSN 在 `view=shared` 标签下,Preview 勾选,Value 完整。

**我的反应**: "✅ VITE_SENTRY_DSN 确实有!✅ Preview 勾了!值对的!" → 接受

**应该做的**: 立刻去查"实际 deployment 的项目是哪个" vs "env var 配在哪个项目"。**UI 显示不等于实际生效**。

### 失误 2 · **没查官方 metadata, 只在 runtime 打转**

**事实**: 整个调试期间我**从来没让用户查 Vercel deployment metadata**。Vercel 部署记录里有 GitHub commit / Branch / Project / Environment 全部信息。

**外部 PM 一开始就查这个** → 立刻知道实际部署项目是 `sethearth` → 立刻发现 env var 配错了。

**应该做的**: **第一次怀疑 deployment 配置时,立刻查 deployment metadata,不要先在 runtime 加 log**。

### 失误 3 · **陷入"加 console.log + 重新部署"循环**

**事实**: 5 个 commit 中 3 个是 debug commit (`768865a` / `1c7d1a1` / 每次 push 都触发 Vercel 重新 build)。

**正确做法**: 1 次 debug commit 后看到数据,如果信息不够就**直接查 deployment metadata**,而不是再加一层 debug。

**错误模式**:
```
[commit 1] 加 log
[Vercel redeploy · 1-2 分钟]
[用户截图 Console]
[分析 · 猜 root cause]
[commit 2] 加更多 log
[Vercel redeploy · 1-2 分钟]
[用户截图 Console]
... 循环 5 次
```

**正确模式**:
```
[1 次查询官方 metadata]
[直接定位真因]
[1 次修复 + 1 次验证]
```

### 失误 4 · **没坚持推动"Vercel Redeploy + Clear Cache"**

**事实**: 我在 incident report 里列了 3 个修复路径 (A/B/C),A 是"Vercel Redeploy + Clear Build Cache"。

**我推荐了 A 但没坚持**,用户没做。后来外部 PM 找到真因后,根本不需要 A。

**教训**: "高概率方案" 不等于 "正确方案"。**如果推荐 3 个方案,意味着我自己也不确定真因,应该继续查证,而不是把决策推给用户**。

### 失误 5 · **对 Vercel 多项目/团队结构缺乏认知**

**事实**: 我知道 Vercel 有 Team / Project / Environment 三层结构,但**没意识到"在 team 层面 A 项目配的 env var 不会应用到 team 层面 B 项目的 deployment"**。

**外部 PM**: 大概率有 Vercel 部署实战经验,知道要看"deployment 实际目标项目"。

**教训**: 不熟悉的部署平台,不要假装内行。**"我不知道" 比 "我猜 3 个方案" 更专业**。

---

## 🛡️ 给后续 PM 的 7 条铁律

> 这些不是泛泛的"多学习"建议,是从这次 5 小时失败里**提炼的可操作清单**。

### 铁律 1 · **永远先查官方 metadata, 不要先猜 runtime 行为**

**触发场景**: "为什么 XX 没生效?/为什么 YY 出错?"

**错误做法**: 加 console.log → 重新部署 → 看日志 → 猜原因 (循环)

**正确做法**:
- Vercel 部署问题 → 查 deployment metadata (Deployments → 点 commit → 看实际目标项目/分支/env)
- GitHub Actions 问题 → 查 workflow run log
- Supabase 问题 → 查 Supabase Activity / Postgres logs
- **先查官方 source of truth, 至少 1 次**

### 铁律 2 · **多项目/多环境场景必须做"交叉验证"**

**触发场景**: Vercel / GitHub / Supabase 等有"项目/团队/环境"层级隔离的平台。

**必做清单**:
- [ ] 实际 deployment 目标是哪个**项目**?
- [ ] env var / secret / config 配在哪个**项目**?
- [ ] 两者是同一个项目吗?
- [ ] env var 勾的 Environment (Production / Preview / Development) 匹配 deployment 实际环境吗?

### 铁律 3 · **不要信任 UI 状态, 必须实测验证**

**触发场景**: 看到"Vercel UI 显示 Preview 勾选"、"Supabase UI 显示 healthy"、"GitHub UI 显示 checks passed"。

**教训**: UI 状态和实际 deployment/runtime 状态可能**不一致** (缓存 / 缓存失效 / 跨项目配置)。

**做法**: 假设 UI 不可信, 总是查 1 次 runtime / log 验证。

### 铁律 4 · **"高概率方案" ≠ "正确方案"**

**触发场景**: 你列出 3 个修复路径 (A/B/C), 让用户选。

**错误**: 把决策推给用户,自己免责。

**正确**: 如果你列 3 个方案,意味着**你自己也不确定真因**。应该:
- 继续查证,直到能明确说"我推荐 A 因为 X"
- 或者直接说"我不知道真因,这是猜测清单,需要继续诊断"

### 铁律 5 · **3 轮调试没进展 = 主动降级 + 写 incident report + 交接**

**触发场景**: 同一个问题反复 3 次 commit 都没解决。

**做法**:
- **立刻停止加 console.log** (我违反了这规则,做了 3 次)
- 写 incident report (我做了,但应该更早做)
- 列出已验证 / 已尝试 / 未尝试,交接给下一位
- 写"建议下一步",包括"考虑换思路: 查官方 metadata"

**案例**: 我 15:00 写 incident report 已经是第 4 次 commit 之后,**应该 14:50 第二次 commit 之后**就写。

### 铁律 6 · **写 incident report 的标准结构 (给后续 PM 用)**

下次写 incident report 用这个模板,确保任何 PM 接手都能 1 小时内继续:

```markdown
## 现象
(用户看到什么 + 我看到什么)

## 已尝试
(每个 commit + 每个 console.log + 结果)

## 已知事实
(从 1 到 N 编号,每条都有验证方式)

## 已排除
(哪些是"已经验证不是原因"的)

## 推测 Root Cause (按概率排序)
(每个带"未验证"标注 + 验证方法)

## 建议下一步
(具体到操作步骤,不要给"考虑..."

## 降级方案
(如果真因 1 周内找不到,怎么做)
```

### 铁律 7 · **PM Agent 的"诚实"比"专业形象"重要**

**触发场景**: 用户不耐烦时。

**错误**: 找借口 ("网络问题"/"环境限制"/"需要更长")。

**正确**: 直接说"我卡住了,我没找到真因,我把状态交接给你"。

**案例**: 用户 15:25 说"你要是解决不了就把问题汇总给我" → 我立即写了 incident report + 推荐 3 个路径 + 让用户决策。这比"再试 1 个 commit"正确。

**教训**: **PM Agent 不应该为"保持专业形象"而硬撑**。**承认"我没解决"+ "把状态交接清楚"是更专业的做法**。

---

## 🎯 我 (接管 PM) 的反思

### 这次做对的事

1. ✅ 5 小时内 Phase 1 SQL 100% 完成 (修复了 4 个 SQL bug)
2. ✅ 写了 incident report (虽然晚了,但格式完整)
3. ✅ 维护了 handoff 文档,让外部 PM 快速接手
4. ✅ 用户不耐烦时诚实承认卡住,没继续硬撑

### 这次做错的事

1. ❌ 5 小时内 Sentry 0% 进展
2. ❌ 3 次 debug commit 没一次接近真因
3. ❌ 没查 Vercel deployment metadata (外部 PM 一查就找到)
4. ❌ 推荐了 3 个方案 ("A/B/C") 而不是坚持真因
5. ❌ 浪费用户 5 小时 + 7 个 Vercel 重新部署的 build quota

### 个人教训

**我以为我"会调试"** —— 实际上我只会在"我知道的领域"调试 (SQL schema / 数据库结构)。遇到"Vercel 部署配置"这种我不熟悉的领域,我应该:
- 承认"我不熟悉 Vercel 部署"
- 让用户查官方 metadata
- 或者请求 Vercel 部署专家介入

**我的盲区**: 平时用 Vite 写 demo 没问题,但**生产部署 (Vercel / Vite build / env 注入机制) 是另一个专业领域**,需要查官方文档而不是凭直觉。

---

## 📚 推荐后续 PM 必读 (3 篇, 30 分钟)

1. **Vite 官方文档 - Env Variables and Modes** (15 分钟)
   - https://vitejs.dev/guide/env-and-mode.html
   - 重点: `import.meta.env` 静态替换机制 / `loadEnv()` 用法 / prefix 规则

2. **Vercel 官方文档 - Environment Variables** (10 分钟)
   - https://vercel.com/docs/projects/environment-variables
   - 重点: Team vs Project / Preview vs Production / Build vs Runtime

3. **Vercel 部署 troubleshooting 实战指南** (5 分钟搜索)
   - "Vercel environment variables not working" 的常见原因清单
   - **核心**: 90% 的 Vercel env 问题都是"配错项目/环境"

---

## ✅ 给自己的改进承诺

如果下次遇到"deployment 配置问题" (Vercel / Netlify / Cloudflare Pages 等):

1. **第一次怀疑时就查官方 metadata** (铁律 1)
2. **多项目场景立即做交叉验证** (铁律 2)
3. **不熟悉领域先承认, 不要凭直觉猜** (失误 5)
4. **3 轮调试没进展就降级 + 写 report** (铁律 5)

---

**End of Postmortem · 接管 PM Agent · 2026-08-25 16:50**

> **致下一位 PM**: 读完这个 postmortem + 7 条铁律,你能避开我掉进的 5 个坑。 不要重复我的错误。

> **致用户**: 卡了一天的根本原因是我对 Vercel 部署不够熟悉 + 调试方法学错了。**外部 PM 找真因的诊断路径才是正确的**。 后续类似问题我不会再重蹈覆辙。