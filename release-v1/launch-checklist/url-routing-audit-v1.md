---
title: URL / Routing Audit v1 · URL 与路由审计清单
type: launch-checklist-sub
tags: [release-v1, d-p0-06, launch-checklist, url, routing, anchor, 404, see-earth]
task_id: D-P0-06
brief_anchor: §4 D-P0-06 AC #10 + 任务卡 §C
track: design
target_gate: Gate C · Launch Candidate
created: 2026-08-24
sender: Designer Agent #6
receiver: PM Agent / Design / Engineering
status: IN REVIEW
depends_on:
  - checklist-v1.md §AC #10
  - top-nav-fix-report.md (锚点已修)
  - sitemap-v1.md (P0 路由 LOCKED)
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/06-PM Agent 交接/release-v1/launch-checklist/url-routing-audit-v1.md
workspace_canonical_path: /Users/lwy/Documents/ChatGPT/看见地球/release-v1/launch-checklist/url-routing-audit-v1.md
related_docs:
  - ./checklist-v1.md
  - ./placeholders-audit-v1.md
  - /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/design-implementation/top-nav-fix-report.md
  - /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/07-设计师设计参考/release-v1/web-v1-flow/sitemap-v1.md
  - /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/06-PM Agent 交接/2026-08-24-gate-a-visual-acceptance.md
---

# URL / Routing Audit v1 · URL 与路由审计清单

> **作者**：Designer Agent #6（外部 Owner = 您）  
> **目标读者**：PM Agent（Gate C 决策者）/ Design / Engineering / QA  
> **目的**：把 Brief §D-P0-06 AC #10（无未定义链接）+ 任务卡 §C（URL / 路由审计）合并为**路由可达性 + 锚点可用性 + 404 兜底 + 跨域 rel 属性**的 4 项审计清单。  
> **完成时间**：2026-08-24

---

## 0. 一句话总结

**Launch Candidate 必须保证：7 P0 路由 100% 可达 · 5 内部锚点 100% 命中 · 1 404 兜底友好 · 所有跨域链接 100% 配对 rel 属性。任何一项未通过 → Gate C 不签字。**

---

## 1. P0 路由清单（7 条 · sitemap-v1 LOCKED）

> 来源：`sitemap-v1.md §1.1` · 路由 LOCKED ✓

| # | 路由 | 页面 | LOCKED 状态 | LC 期望 | 验证工具 |
|---|---|---|---|---|---|
| P0-1 | `/` | Homepage / Today | LOCKED ✓ | 200 OK + 5 板块渲染 | curl + DevTools |
| P0-2 | `/moments/:momentId` | Moment Detail | LOCKED ✓ CONDITIONAL | 200 OK 或 301 → `/cities/:cityId` | curl |
| P0-3 | `/cities/:cityId` | Universal CityPage | LOCKED ✓ | 200 OK + 4 屏渲染 | curl + DevTools |
| P0-4 | `/unknown` | Unknown Coordinate | LOCKED ✓ | 200 OK + Stage 1 | curl |
| P0-5 | `/witness` | Minimal Witness Flow | IN REVIEW (D-P0-02) | 200 OK + Step 0 | curl |
| P0-6 | `/about` | About / Method | NEEDS LOCK | 200 OK + 内容齐全 | curl |
| P0-7 | `/privacy` | Privacy | NEEDS LOCK | 200 OK + 内容齐全 | curl |

### 1.1 路由可达性验证

```bash
# 验证命令（部署后执行）
BASE_URL="https://see-earth.com"

for path in "/" "/unknown" "/witness" "/about" "/privacy"; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}${path}")
  echo "${path}: ${STATUS}"
done

for city in kyoto lisbon shanghai tokyo mexico-city rio reykjavik cape-town london berlin rome sydney; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/cities/${city}")
  echo "/cities/${city}: ${STATUS}"
done
```

**期望**：所有路由 200 OK。

### 1.2 路由不存在情况

```bash
# 验证 404 友好兜底
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/cities/nonexistent")
echo "/cities/nonexistent: ${STATUS} (期望 404)"
```

**期望**：`/cities/nonexistent` → 404 + 友好文案 + 返回首页 CTA。

---

## 2. 12 城 URL 清单（核心城市可达性 · 必须 100%）

> 来源：`/src/data/cities.ts` 当前 12 城数据 · 必须在 LC 部署全部可达。

| # | slug | 中文名 | 英文名 | URL | 路由方法 |
|---|---|---|---|---|---|
| 1 | kyoto | 京都 | Kyoto | `/cities/kyoto` | `c.href` |
| 2 | lisbon | 里斯本 | Lisbon | `/cities/lisbon` | `c.href` |
| 3 | shanghai | 上海 | Shanghai | `/cities/shanghai` | `c.href` |
| 4 | mexico-city | 墨西哥城 | Mexico City | `/cities/mexico-city` | `c.href` |
| 5 | tokyo | 东京 | Tokyo | `/cities/tokyo` | `c.href` |
| 6 | rio | 里约热内卢 | Rio | `/cities/rio` | `c.href` |
| 7 | reykjavik | 雷克雅未克 | Reykjavík | `/cities/reykjavik` | `c.href` |
| 8 | cape-town | 开普敦 | Cape Town | `/cities/cape-town` | `c.href` |
| 9 | london | 伦敦 | London | `/cities/london` | `c.href` |
| 10 | berlin | 柏林 | Berlin | `/cities/berlin` | `c.href` |
| 11 | rome | 罗马 | Rome | `/cities/rome` | `c.href` |
| 12 | sydney | 悉尼 | Sydney | `/cities/sydney` | `c.href` |

> **重要**：当前 `cities.ts` 仅 12 城，**缺 Khartoum**。Khartoum 是 LOCKED 的 Red Layer 基准城市（design-freeze-log-v1.md §4.3），Gate C 前必须补齐（参考 [content-freshness-v1.md](./content-freshness-v1.md)）。

### 2.1 12 城路由可达性测试

```bash
# 自动化测试脚本（建议放入 E-P1-03 smoke suite）
for slug in kyoto lisbon shanghai tokyo mexico-city rio reykjavik cape-town london berlin rome sydney; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/cities/${slug}")
  if [ "$STATUS" != "200" ]; then
    echo "FAIL: /cities/${slug} = ${STATUS}"
  fi
done
```

**期望**：12 城全部 200 OK。

---

## 3. 内部锚点链接（5 个 · 必须 100% 命中）

> 来源：`top-nav-fix-report.md` · 顶部导航 7 项 + 5 锚点

### 3.1 锚点清单

| # | 锚点 ID | 目标板块 | 实现状态 | 验证方法 |
|---|---|---|---|---|
| 1 | `#archive` | Earth Archive section | ✅ LOCKED（自带 `id="archive"`） | DevTools Elements 面板 |
| 2 | `#events` | Live Events section | ✅ LOCKED（自带 `id="events"`） | DevTools |
| 3 | `#cities` | 12 Coordinates section | ✅ 已修（`HomeCoordinates.tsx` 顶部新增 `<span id="cities" />`） | top-nav-fix-report.md §修复内容 |
| 4 | `#my-coordinates` | 12 Coordinates section（同 #cities）| ✅ 已修（同上） | top-nav-fix-report.md |
| 5 | `#spotlight` | Spotlight section | ❌ **未实现**（Gate A 验收报告已知偏差 #2） | **Gate C 前必须修复** |

### 3.2 锚点可用性验证

#### 方法 1：浏览器测试

```text
打开 https://see-earth.com/
点击导航 "Earth Archive" → 滚动到 #archive 区块（Earth Archive 标题对齐 fixed nav 下方 72px）
点击导航 "Journal" → 滚动到 #events 区块
点击导航 "Cities" → 滚动到 #cities 区块
点击导航 "My Coordinates" → 滚动到 #my-coordinates 区块
点击导航 "Spotlight" → ❌ 当前 NO-OP（无目标）
```

#### 方法 2：DevTools 自动化

```javascript
// 在浏览器 console 运行
['archive', 'events', 'cities', 'my-coordinates', 'spotlight'].forEach(id => {
  const el = document.getElementById(id);
  console.log(`#${id}:`, el ? `${el.tagName} found` : '❌ NOT FOUND');
});
```

**期望**：

- `#archive` `#events` `#cities` `#my-coordinates` = found
- `#spotlight` = **Gate C 前必须实现**，否则 NO-GO

### 3.3 已知偏差 · Gate C 必须修复

| # | 偏差 | 来源 | Gate C 必须 |
|---|---|---|---|
| 1 | `#spotlight` 无目标 | gate-a-visual-acceptance.md §已知偏差 #2 | ✅ 必须实现 Spotlight section |
| 2 | 锚点滚动时标题被 fixed nav 遮住顶部 72px | gate-a-visual-acceptance.md §已知偏差 #4 | 建议修复（CSS `scroll-margin-top: 72px`）|

**修复建议**：

```css
/* globals.css 或各 section.module.css */
[id="archive"],
[id="events"],
[id="cities"],
[id="my-coordinates"],
[id="spotlight"] {
  scroll-margin-top: 72px; /* 等于 fixed nav 高度 */
}
```

---

## 4. 404 页面友好兜底

### 4.1 当前实现检查

| 路径 | 实现 | 文案 | CTA |
|---|---|---|---|
| `/cities/:invalidSlug` | `CityPage.tsx` `notFound` 分支 | 应检查 | 应返回首页 |

### 4.2 验证方法

```bash
# 测试 404
curl -s -o /tmp/404.html -w "%{http_code}\n" "${BASE_URL}/cities/nonexistent"
```

**期望**：

- HTTP 状态码 = 404（不是 200 软 404）
- HTML 含友好文案（如「这座城市暂时还没有数据 · 回到首页看看其他地方」）
- 至少 1 个 CTA（"返回首页" 或 "看看其他城市"）
- 不显示 stack trace / 内部错误码

### 4.3 兜底页面文案（建议）

```text
404 / Not Found

这座城市暂时不在我们的 12 个远方里。

可能原因:
· 城市尚未纳入 Seed 集
· URL 已变更

[返回首页 →]  [探索 12 个远方 →]
```

### 4.4 替代页面（建议 · P1）

- 列出当前 12 城链接
- 提供搜索框（如果未来加入 Search）

---

## 5. 跨域链接 rel 属性（必须 100% 配对）

> 来源：`grep -rn "target=\"_blank\"" src/` + 检查 rel 属性

### 5.1 当前扫描结果

```text
src/components/EventDrawer.tsx:140
  target="_blank"
  rel="noopener noreferrer"
  → ✅ 合规
```

**当前合规率**：1/1 = 100%

### 5.2 Gate C 检查脚本

```bash
# 在 launch-checklist 验证流程中执行
TARGET_BLANK=$(grep -rln 'target="_blank"' src/ 2>/dev/null)
NO_REL=$(grep -rl 'target="_blank"' src/ 2>/dev/null | xargs grep -L "noopener" || true)

if [ -n "$NO_REL" ]; then
  echo "FAIL: 以下文件 target=_blank 但缺 rel=noopener:"
  echo "$NO_REL"
fi
```

**期望**：100% 配对。

### 5.3 跨域链接 rel 属性规则

```text
target="_blank" → 必须配对:
  rel="noopener noreferrer"

原因:
  · noopener:防止新窗口通过 window.opener 操作原页面(防止 tabnabbing)
  · noreferrer:不发送 Referer header(防止泄漏来源 URL)
```

---

## 6. 内部链接 vs 外部链接 · 审计表

### 6.1 内部链接清单

| 来源文件 | 链接目标 | 类型 | LC 期望 |
|---|---|---|---|
| `src/components/HomeHero.tsx:47` | `c.href` | `/cities/:slug` | ✅ |
| `src/components/HomeCoordinates.tsx:101,175` | `c.href` | `/cities/:slug` | ✅ |
| `src/components/HomeCoordinates.tsx:145` | `aria-label="Khartoum · 占位 · 待补"` | **占位文案** | ❌ Gate C 前修复 |
| `src/components/CityFeatured.tsx:130` | `c.href` | `/cities/:slug` | ✅ |
| `src/components/CityIndex.tsx:112` | `c.href` | `/cities/:slug` | ✅ |
| `src/components/CityIndex.tsx:153` | `/cities` | 12 城索引 | ✅ |
| `src/components/CityIndexPage.tsx:48` | `c.href` | `/cities/:slug` | ✅ |
| `src/components/CityPage.tsx:194,222` | `c.href` + `/` | `/cities/:slug` + 返首页 | ✅ |
| `src/components/CityPage.tsx:67` | `/` (notFound) | 返首页 | ✅ |
| `src/components/AboutPage.tsx:89,124` | `/` | 返首页 | ✅ |
| `src/components/UnknownCoordinate.tsx:108` | `/` | 返首页 | ✅ |
| `src/components/ui/GlobalHeader.tsx:45` | `/` (Logo) | 返首页 | ✅ |
| `src/components/ui/GlobalHeader.tsx:54` | `item.href` | 锚点 / 路由 | ✅ |
| `src/components/ui/DistanceNavigation.tsx:39,58` | prev / next href | 上一/下一城市 | ✅ |
| `src/components/EventDrawer.tsx:139` | `event.sourceUrl` | **外链**（Unsplash / Pexels） | ✅ + rel=noopener |

### 6.2 外部链接清单

| 来源 | URL | 类型 | rel 属性 |
|---|---|---|---|
| `EventDrawer.tsx:139` | `event.sourceUrl` | Unsplash / Pexels 图源 | ✅ `noopener noreferrer` |

**当前全仓外部链接总数**：1 个（已合规）

### 6.3 链接类型分类规则

```text
1. 内部路由 (Intra-app)
   · /                  (Homepage)
   · /cities/:slug      (CityPage)
   · /moments/:id       (Moment Detail)
   · /unknown           (Unknown)
   · /witness           (Witness Flow)
   · /about             (About)
   · /privacy           (Privacy)
   · 锚点 #archive #events #cities #my-coordinates #spotlight
   · 不需要 rel 属性

2. 跨域链接 (External)
   · Unsplash / Pexels 图源
   · 第三方 reference
   · 必须 rel="noopener noreferrer"
```

---

## 7. 旧测试链接清理

### 7.1 检查项

| 检查 | 命令 | 期望 |
|---|---|---|
| 旧测试域名（sethearth-git-alpha） | `grep -rn "sethearth-git-alpha" src/ public/` | 0 匹配 |
| 旧测试路径 `/v1/test` `/alpha` `/beta` | `grep -rn "/v1/test\|/alpha\|/beta" src/` | 0 匹配 |
| 旧 mock URL `localhost:3000` `127.0.0.1` | `grep -rn "localhost:3000\|127.0.0.1" src/` | 仅 dev 环境配置 |
| 旧 stage URL `staging.see-earth` | `grep -rn "staging.see-earth" src/ public/` | 0 匹配 |

### 7.2 当前已知命中（需 Gate C 前清理）

| 文件 | 内容 | LC 应处理 |
|---|---|---|
| `src/components/Meta.tsx:10` | `SITE_URL = 'https://see-earth.vercel.app'` | 改为 `https://see-earth.com`（待运营确定） |
| `index.html`（如有）| vercel preview URL | 改为生产 URL |

---

## 8. 与 AC 关系

| AC | 本清单覆盖 |
|---|---|
| AC #2 键盘 / 触屏 / 读屏 | §3.2 锚点可用性（Tab 可达）+ §5 跨域 rel |
| AC #10 无未定义链接 | §1 路由可达性 + §2 12 城 URL + §3 5 锚点 + §4 404 + §6 链接清单 |

---

## 9. Gate C 签字要求

- [ ] 7 P0 路由 100% 可达（200 OK）
- [ ] 12 城 URL 100% 可达（200 OK）
- [ ] 5 内部锚点 100% 命中（**#spotlight 必须实现**）
- [ ] 404 页面友好（HTTP 404 + 文案 + CTA）
- [ ] 所有跨域链接 100% 配对 rel 属性
- [ ] 旧测试链接清理完毕
- [ ] 锚点 scroll-margin-top 修复（建议）
- [ ] Khartoum 缺失数据已补（见 content-freshness-v1.md）

---

**End of url-routing-audit-v1.md**
