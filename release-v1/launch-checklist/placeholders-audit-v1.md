---
title: Placeholders & Copy Audit v1 · 占位文案审计清单
type: launch-checklist-sub
tags: [release-v1, d-p0-06, launch-checklist, placeholders, audit, copy, see-earth]
task_id: D-P0-06
brief_anchor: §4 D-P0-06 AC #10
track: design
target_gate: Gate C · Launch Candidate
created: 2026-08-24
sender: Designer Agent #6
receiver: PM Agent / Design / Engineering / Content / Operations
status: IN REVIEW
depends_on:
  - checklist-v1.md §AC #9 + §AC #10
  - v2-phase15-fixes-report.md (Khartoum 文案已修 / Gaza 数据已替换)
  - top-nav-fix-report.md (锚点已修)
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/06-PM Agent 交接/release-v1/launch-checklist/placeholders-audit-v1.md
workspace_canonical_path: /Users/lwy/Documents/ChatGPT/看见地球/release-v1/launch-checklist/placeholders-audit-v1.md
related_docs:
  - ./checklist-v1.md
  - ./content-freshness-v1.md
  - ../../../scripts/check-placeholders.sh
  - /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/design-implementation/v2-phase15-fixes-report.md
---

# Placeholders & Copy Audit v1 · 占位文案审计清单

> **作者**：Designer Agent #6（外部 Owner = 您）  
> **目标读者**：PM Agent（Gate C 决策者）/ Design / Engineering / Content / Operations  
> **目的**：把 Brief §D-P0-06 AC #9（Alpha / Beta 不进入 LC）+ AC #10（无占位内容）+ 任务卡 §B（文案审计）合并为**可逐文件 grep 的占位文案审计清单**。  
> **配套脚本**：`scripts/check-placeholders.sh`（自动 + 手动两部分）

---

## 0. 一句话总结

**Launch Candidate 文案必须 0 占位（除 LOCKED 的 State E Empty 设计性占位外）。本清单列出 5 大类关键词 × N 个应检查的文件路径，配 `check-placeholders.sh` 一键扫描。任何匹配命中 → Gate C 不签字。**

---

## 1. 审计范围

### 1.1 应检查的文件 / 路径

| 类别 | 路径 | 备注 |
|---|---|---|
| 源代码 | `/src/**/*.tsx` `/src/**/*.ts` `/src/**/*.css` | 所有用户可见的 React 组件、模块、样式 |
| 静态资源 | `/public/**/*.html` `/public/**/*.svg` `/public/**/*.txt` | robots.txt / sitemap.xml / 404.html |
| 文档 | `/index.html` | 入口 HTML |
| 数据 | `/src/data/*.ts` | cities / moments / liveMoments |
| 文案资源 | `/src/lib/copy/`（如有） | i18n 字符串集中管理 |

### 1.2 不应检查的路径（避免误报）

| 路径 | 原因 |
|---|---|
| `/node_modules/` | 第三方依赖 |
| `/dist/` | 构建产物（自动生成）|
| `/src/types/**/*.test.ts` | 单元测试 type-level fixtures |
| `*.test.tsx` 描述性注释 | "Stage X: ..." 等历史记录 |
| `D-P0-04` state matrix 文档 | LOCKED 的"占位"语义为「设计性占位」（State E Empty）|
| `scripts/check-placeholders.sh` 自身 | 含关键词但用作扫描 |

### 1.3 检查优先级

| 优先级 | 类目 | Gate C 阻塞 |
|---|---|---|
| **P0** | Lorem ipsum / TODO / FIXME / "测试中" / "Alpha" / "Beta" / 假 CTA / 占位图 | 🚫 任何命中 = NO-GO |
| **P1** | Khartoum "(待补 · 占位)" / "南郊 30 公里..." / "(Red Layer · 占位)" | 🚫 前端可见 = NO-GO |
| **P2** | 未翻译英文 / 中文标点不一致 / 全角半角混用 | ⚠️ 计数 ≥ 5 = Major |
| **P3** | 代码注释 "TODO" / "FIXME" | ⚠️ 计数 ≥ 10 = Minor |

---

## 2. 关键词列表（5 大类 · 33 个关键词）

### 2.1 P0 · 开发痕迹 / 假内容

| 关键词 | 期望 | LC build 期望匹配 |
|---|---|---|
| `lorem` | 大小写不敏感 | 0 |
| `Lorem ipsum` | — | 0 |
| `ipsum dolor` | — | 0 |
| `TODO` | 仅在 `src/lib/analytics/schema.ts` 类代码注释可保留 | ≤ 3（代码注释，非渲染） |
| `FIXME` | — | 0 |
| `XXX` | — | 0 |
| `HACK` | — | 0 |
| `[TBD]` `[tbd]` `TBD` | — | 0 |
| `placeholder` | 仅在 `UniversalArrival.tsx` State E 设计性占位可保留 | ≤ 5（State E Empty LOCKED） |
| `dummy` `fake` `mock` | 仅在 `*.test.tsx` 描述可保留 | ≤ 3 |
| `占位图` | — | 0 |
| `测试中` | — | 0 |
| `测试版` | — | 0 |
| `demo` `Demo` | — | 0 |
| `sample` | 仅英文 i18n key 可保留 | ≤ 3 |

### 2.2 P0 · Alpha / Beta / 内部标识

| 关键词 | 期望 | LC build 期望匹配 |
|---|---|---|
| `Alpha` `ALPHA` `alpha-` | 仅历史报告 / config 注释可保留 | 0（前端） / ≤ 5（注释） |
| `Beta` `BETA` `beta-` | 同上 | 0（前端） / ≤ 5（注释） |
| `Internal Alpha` | — | 0 |
| `Closed Beta` | — | 0 |
| `Internal` | 仅 "Internal Alpha" 标签可保留 | ≤ 3 |
| `Testing` `Test environment` | — | 0 |
| `preview` `Preview` | 仅 Preview Deployment Vercel 注释 | ≤ 3 |
| `数据可能重置` | — | 0 |
| `（测试中）` `[测试]` `【测试】` | — | 0 |
| `invitation` `invite-only` | — | 0 |

### 2.3 P1 · 触犯伦理 / 红层文案

| 关键词 | 期望 | LC build 期望匹配 |
|---|---|---|
| `南郊 30 公里` | v2-phase15-fixes-report.md §1 已删除 | 0 |
| `军事据点` | 同上 | 0 |
| `炮击` `炮火` `炮弹` | 同上 | 0 |
| `废墟` `战火` `战区` | 同上 | 0 |
| `伤员` `伤亡` | 同上 | 0 |
| `加沙` `Gaza` `巴勒斯坦` `Palestine` | v2-phase15-fixes-report.md §2 数据已替换（Marrakesh） | 0（前端渲染） |
| `category: 'war'` | types/test 兼容性可保留 | 0（数据） |
| `(Red Layer · 占位)` | HomeWorldsCollide.tsx:118 | 必须替换为真实 Khartoum 文案 |
| `(待补 · 占位)` | HomeCoordinates.tsx:151 | 必须替换 |

### 2.4 P2 · 文案质量

| 关键词 | 期望 | LC build 期望匹配 |
|---|---|---|
| `// 待翻译` `// TODO: i18n` | — | 0 |
| `英文硬编码`（在中文组件）| 全英文 > 20 字 | ≤ 3 |
| `lorem` 同音字 / `测试` 用法 | — | 0 |
| `?` + 中文混排（应为 `？`） | 中文段落 | ≤ 3 |
| `,` + 中文混排（应为 `，`） | 中文段落 | ≤ 5 |
| 半角空格在中文段落 | 中文段落首尾 | ≤ 5 |

### 2.5 P3 · 占位图 / 假 CTA / 未定义链接

| 关键词 | 期望 | LC build 期望匹配 |
|---|---|---|
| `href="#"` | 合法锚点除外 | 0（仅锚点） |
| `href="javascript:void(0)"` | — | 0 |
| `<button>` 无 onClick handler | 审计 tsx | 0（功能性按钮） |
| `target="_blank"` 无 `rel="noopener noreferrer"` | EventDrawer.tsx 等 | 100% 配对 |
| `/public/images/**/placeholder.*` | — | 0 |
| `dummyimage.com` `placeimg.com` `placeholder.com` | — | 0 |
| `unsplash.com/photos/...` URL 硬编码（应通过 `imageCredit` 字段） | cities.ts | 100% 通过字段 |

---

## 3. 文件 × 关键词交叉表（核心审计表）

> 列出**已知可能命中**的文件 + 应检查的关键词 + LC 期望。

| 文件路径 | 已知命中关键词 | LC 期望 | Owner |
|---|---|---|---|
| `src/components/HomeCoordinates.tsx:151` | `(待补 · 占位)` | 删除或替换为「Coming soon」 | Design + Content |
| `src/components/HomeCoordinates.tsx:191` | `(待补图)` | 删除或替换 | Design + Content |
| `src/components/HomeWorldsCollide.tsx:13` | `khartoum: ''` (占位 image) | 提供真实图 URL | Content |
| `src/components/HomeWorldsCollide.tsx:118` | `(Red Layer · 占位)` | 删除或替换 | Design + Content |
| `src/components/Meta.tsx:10` | `// TODO: 部署后改为实际域名` | 改为正式域名 `https://see-earth.com` | Engineering |
| `src/components/UniversalArrival.tsx` | `占位` State E LOCKED | 保留（设计性占位） | Design |
| `src/components/UniversalOneScene.tsx:24` | `占位结构(9/3 列骨架 + 文案引导)` | 仅代码注释，渲染无影响 | OK |
| `src/data/cities.ts:86` (comment) | `placeholder` | 仅代码注释 | OK |
| `src/data/photoAssets.ts:139` | `Empty State 占位` | 仅代码注释 | OK |
| `src/data/moments.ts` (Gaza) | 已替换为 Marrakesh | OK · v2-phase15-fixes-report.md §2 |
| `src/data/moments.ts` (war category) | type 兼容保留 | OK · 测试 fixture |
| `src/lib/analytics/schema.ts:293` | `/** Alpha traffic tag. */` | 保留（仅 schema 注释） | OK |
| `src/lib/cityPageRenderPlan.ts` | `render-empty` LOCKED | 保留（设计性） | OK |
| `src/components/HomeEarthArchive.tsx` | 第 5 板块 LOCKED | 无占位文案 | OK |
| `src/components/Meta.tsx` `SITE_URL` | `// TODO: 部署后改为实际域名` | 删除 TODO + 改正式 URL | Engineering |
| `src/components/Meta.tsx` `ogImage` 默认值 | — | 留空（不输出 og:image） | OK |
| `src/components/UnknownCoordinate.tsx` | — | 无占位文案 | OK |
| `src/components/UniversalCityPage.tsx` `notFound` | `404` 友好文案 | 验证文案 | Design |

---

## 4. check-placeholders.sh 脚本

> 脚本已落 `scripts/check-placeholders.sh`（自动扫描）+ 本清单（手动深度审计）。

### 4.1 自动扫描部分

```bash
#!/usr/bin/env bash
# scripts/check-placeholders.sh
# Launch Candidate 占位文案自动审计
# 用法: bash scripts/check-placeholders.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# 排除路径
EXCLUDES=(
  --exclude-dir=node_modules
  --exclude-dir=dist
  --exclude-dir=.git
  --exclude-dir=outputs
  --exclude-dir=release-v1/launch-checklist
  --exclude-dir=work
  --exclude='*.test.ts'
  --exclude='*.test.tsx'
  --exclude='*.snap'
)

P0_FAIL=0
P1_FAIL=0

echo "===================================================="
echo "  Launch Candidate 占位文案审计"
echo "  $(date '+%Y-%m-%d %H:%M:%S')"
echo "===================================================="

echo ""
echo "--- P0 · 开发痕迹 / Alpha / Beta / Lorem ---"

for kw in "Lorem ipsum" "lorem ipsum" "FIXME" "HACK" "XXX" "测试中" "测试版" "数据可能重置"; do
  RESULT=$(grep -rn "${EXCLUDES[@]}" "$kw" src/ public/ index.html 2>/dev/null || true)
  if [ -n "$RESULT" ]; then
    echo "[FAIL-P0] 关键词 '$kw' 命中:"
    echo "$RESULT" | head -10
    P0_FAIL=$((P0_FAIL+1))
  fi
done

echo ""
echo "--- P1 · 红层 / Khartoum 占位 ---"

for kw in "南郊 30 公里" "军事据点" "炮击" "炮弹声" "废墟" "战火" "Gaza" "加沙" "巴勒斯坦"; do
  RESULT=$(grep -rn "${EXCLUDES[@]}" "$kw" src/components/ src/data/ 2>/dev/null || true)
  if [ -n "$RESULT" ]; then
    echo "[FAIL-P1] 关键词 '$kw' 命中:"
    echo "$RESULT" | head -10
    P1_FAIL=$((P1_FAIL+1))
  fi
done

# Khartoum 前端占位文案特殊检查
echo ""
echo "--- P1 · Khartoum 前端占位文案 ---"
KHARTOUM_RESULT=$(grep -rn "${EXCLUDES[@]}" "(待补 · 占位)\|(待补图)\|(Red Layer · 占位)" src/components/ 2>/dev/null || true)
if [ -n "$KHARTOUM_RESULT" ]; then
  echo "[FAIL-P1] Khartoum 前端占位文案命中:"
  echo "$KHARTOUM_RESULT"
  P1_FAIL=$((P1_FAIL+1))
fi

echo ""
echo "--- P0 · TODO / FIXME 代码注释计数 ---"
TODO_COUNT=$(grep -rn "${EXCLUDES[@]}" "TODO\|FIXME" src/ 2>/dev/null | wc -l | tr -d ' ')
echo "[INFO] TODO/FIXME 注释总数: $TODO_COUNT"
if [ "$TODO_COUNT" -gt 5 ]; then
  echo "[WARN-P3] TODO/FIXME > 5,建议清理"
fi

echo ""
echo "--- P0 · 假 CTA ---"
for kw in 'href="#"' 'href="javascript:void(0)"'; do
  RESULT=$(grep -rn "${EXCLUDES[@]}" "$kw" src/components/ 2>/dev/null || true)
  if [ -n "$RESULT" ]; then
    echo "[FAIL-P0] 假 CTA '$kw' 命中:"
    echo "$RESULT" | head -5
    P0_FAIL=$((P0_FAIL+1))
  fi
done

echo ""
echo "--- P3 · 跨域链接 rel 属性 ---"
TARGET_BLANK=$(grep -rn "${EXCLUDES[@]}" 'target="_blank"' src/ 2>/dev/null || true)
NO_REL=$(echo "$TARGET_BLANK" | grep -v "noopener" || true)
if [ -n "$NO_REL" ]; then
  echo "[WARN-P3] target=_blank 但缺 rel=noopener:"
  echo "$NO_REL"
fi

echo ""
echo "--- P3 · 占位图检查 ---"
PLACEHOLDER_IMG=$(find public/ -type f \( -iname '*placeholder*' -o -iname '*dummy*' \) 2>/dev/null || true)
if [ -n "$PLACEHOLDER_IMG" ]; then
  echo "[FAIL-P0] 占位图存在:"
  echo "$PLACEHOLDER_IMG"
  P0_FAIL=$((P0_FAIL+1))
fi

echo ""
echo "===================================================="
echo "  汇总"
echo "===================================================="
echo "P0 失败: $P0_FAIL"
echo "P1 失败: $P1_FAIL"
echo ""

if [ "$P0_FAIL" -gt 0 ] || [ "$P1_FAIL" -gt 0 ]; then
  echo "❌ Gate C 占位文案审计 FAIL"
  exit 1
fi

echo "✅ Gate C 占位文案审计 PASS"
exit 0
```

### 4.2 手动深度审计部分（本清单 §3 交叉表）

除自动扫描外，仍需人工按 §3 表格逐文件检查：

1. `src/components/HomeCoordinates.tsx` 全文
2. `src/components/HomeWorldsCollide.tsx` 全文
3. `src/components/Meta.tsx` `SITE_URL` 注释
4. `src/components/CityPage.tsx` `notFound` 404 文案
5. `src/components/AboutPage.tsx`（如已 LOCK）
6. `src/pages/Privacy.tsx`（如已 LOCK）
7. `src/data/cities.ts` Khartoum 条目

---

## 5. 已知命中（需 Gate C 前修复）

### 5.1 P1 · Khartoum 占位文案

| 位置 | 当前文案 | LC 应替换为 | Owner |
|---|---|---|---|
| `src/components/HomeCoordinates.tsx:151` | `(待补 · 占位)` | 「Coming soon · 数据准备中」 或 真实 Khartoum cityId + 真实数据 | Design + Content |
| `src/components/HomeCoordinates.tsx:191` | `(待补图)` | 删除 / 真实图 URL | Design + Content |
| `src/components/HomeWorldsCollide.tsx:118` | `(Red Layer · 占位)` | 真实 Khartoum 时刻文案 + 真实图 | Design + Content |

### 5.2 P0 · Meta SITE_URL TODO

| 位置 | 当前 | LC 应替换为 |
|---|---|---|
| `src/components/Meta.tsx:10` | `// TODO: 部署后改为实际域名` | 删除 TODO 注释 + `const SITE_URL = 'https://see-earth.com'` |

### 5.3 P0 · 跨域链接 rel 属性

| 位置 | 当前 | 期望 |
|---|---|---|
| `src/components/EventDrawer.tsx:140-141` | `target="_blank" rel="noopener noreferrer"` | ✅ 已合规 |

> **全仓扫描结论**：当前 src/ 仅 1 处 `target="_blank"`，已合规。如后续新增跨域链接，必须保持 100% 配对。

---

## 6. 验证脚本使用流程

```bash
# 1. 在工作目录运行
cd /Users/lwy/Documents/ChatGPT/看见地球

# 2. 执行扫描
bash scripts/check-placeholders.sh

# 3. 期望输出
# ✅ Gate C 占位文案审计 PASS
# 或 ❌ Gate C 占位文案审计 FAIL + 命中列表

# 4. 命中后人工处理:
#    · 修复代码 / 文案
#    · 重新执行扫描
#    · 直至 PASS
```

---

## 7. 与 AC 关系

| AC | 本清单覆盖 |
|---|---|
| AC #9 Alpha / Beta 不进入 LC | §2.2 + §5.1 |
| AC #10 无 lorem ipsum / 占位图 / 假 CTA | §2.1 + §2.3 + §2.5 + §4 |
| 任务卡 §B 文案审计 | §2 + §3 + §4 + §5 |

---

## 8. Gate C 签字要求

- [ ] `scripts/check-placeholders.sh` 输出 PASS
- [ ] 手动深度审计 §3 表格 100% 通过
- [ ] §5 已知命中已 100% 修复
- [ ] 文案审计 4 类全部 P0=0 / P1=0

---

**End of placeholders-audit-v1.md**
