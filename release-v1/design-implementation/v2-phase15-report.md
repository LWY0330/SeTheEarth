# v2-phase15 完整重写 · 任务汇报

**任务卡**：IN REVIEW
**完成时间**：2026-08-24
**Commit Hash**：`bed5663`
**本地分支**：alpha（未推送）

---

## Status

- ✅ Phase A · 读取 + 分析（5 张 mockup + HTML 模板 + 数据 + tokens + 现状）
- ✅ Phase B · 数据准备（earth image 复制到 public）
- ✅ Phase C · 实施（4 个新组件 + App 重构 + 移除 SVG EarthGlobe import）
- ✅ Phase D · Build 验证（`npm run build` 成功，exit code 0）
- ✅ Phase E · Commit（`bed5663`，仅本地，未推送）
- ✅ Phase F · 交付物报告（本文件）

---

## 实施范围

### 新文件（10）

| 文件 | 行数 | 内容 |
|---|---|---|
| `src/components/HomeHero.tsx` | 138 | Hero 板块（真实地球图 + 4 角时间 + 主标题 + 编辑元信息） |
| `src/components/HomeHero.module.css` | 271 | A2 LOCK 视觉 + 三档响应式 |
| `src/components/HomeLiveEvents.tsx` | 195 | "地球上正在发生的事" + 4 行 live event |
| `src/components/HomeLiveEvents.module.css` | 226 | 左时间 / 右内容 / 分类色 |
| `src/components/HomeCoordinates.tsx` | 211 | "12 个同时运转的远方"（含 Khartoum 占位） |
| `src/components/HomeCoordinates.module.css` | 285 | 主+网格（3 列 4 行） + 三档响应式 |
| `src/components/HomeWorldsCollide.tsx` | 184 | "三座城市,同一秒" + 3 列对比 |
| `src/components/HomeWorldsCollide.module.css` | 211 | Layer 色（red/blue/yellow）+ 响应式 |
| `release-v1/design-implementation/v2-phase15-hero.md` | 175 | 实施计划 + 风险点 + 验收 checklist |
| `public/images/home/earth-hero-original.png` | 1.5MB | 真实地球图（复制自 Obsidian 视觉素材） |

### 修改文件（2）

| 文件 | 主要变更 |
|---|---|
| `src/App.tsx` | 重写 HomeShell（从约 405 行降至 95 行），集成 4 个新组件，移除 SVG EarthGlobe / WorldTimeRail / SearchBox / CityFeatured / CityIndex / MomentsTimeline / EventDrawer / useNavigate / useHotkeys 全部 import（保留 import） |
| `src/App.module.css` | 简化为 `.app` + `.headerWrap`，删除全部板块旧样式 |

### 保留未修改（不删 LOCKED）

- `src/components/EarthGlobe.tsx`（SVG 球体，不再 import）
- `src/components/EarthGlobe.module.css`
- `src/components/WorldTimeRail.tsx`（不再 import，但保留文件）
- `src/components/CityCard.tsx` / `CityCard.module.css`（LOCKED）
- `src/components/CityFeatured.tsx` / `CityFeatured.module.css`（LOCKED）
- `src/components/MomentsTimeline.tsx` / `MomentsTimeline.module.css`（LOCKED）
- `src/components/ui/GlobalHeader.tsx` / `.module.css`（设计系统级，被新版 HomeShell 复用）
- 所有 `src/data/*.ts`（LOCKED 数据）
- `src/styles/tokens.css`（LOCKED A2 VF 1.2 tokens，不修改）

---

## 视觉对照

### Hero（mockup: home-hero-desktop.png）

| 维度 | 之前（alpha） | 之后（v2-phase15） |
|---|---|---|
| 背景 | 纯 SVG 球体（暖色） | 全屏真实地球图（`earth-hero-original.png`） |
| 顶部装饰 | 无 | "17 AUG 2026 · 12 COORDINATES · EARTH DAY" 编辑元信息（极淡 mono 字） |
| 主标题 | "世界 · 不止方寸" | "世界此刻, 同时发生。"（"同时发生" Earth Blue 斜体强调） |
| 副标（中文） | 价值主张 + "此刻,世界各地正在发生什么。" | "此刻,这颗行星上有 12 个远方正在同时运转。你在的位置,是其中之一。" |
| 副标（英文） | "Right now, somewhere on Earth." | "RIGHT NOW, SOMEWHERE ON EARTH"（mono uppercase） |
| 4 角时间 | 无（12 城 WorldTimeRail 在底部横排） | 4 角：Tokyo 21:53 / Lisbon 13:53 / Reykjavík 12:53 / Cape Town 14:53（动态） |
| 搜索建议 | 3 个 suggestion | 删除（v2-phase15 不需要） |
| EarthGlobe | SVG 自转球体 | 完全移除 |
| 滚动提示 | "↓ 上滑探索" | "↓ SCROLL"（mono uppercase） |

### Live Events（mockup: home-live-events-desktop.png）

| 维度 | 之前 | 之后 |
|---|---|---|
| 存在 | 不在首页 | ✅ "地球上正在发生的事" + 4 行 |
| 4 行内容 | 无 | Berlin "夏末的施普雷河..."  / Reykjavík "太阳即将落山..." / Kyoto "祇园祭后..." / Lisbon "电车 28 路..."（按 mockup 顺序） |
| 时间列 | 无 | 左侧大字号时间（地球当地时刻如 04:53）+ UTC offset badge（+7H）+ TZ + YOU |
| 内容列 | 无 | 编号 + 城市 + 标题（italic editorial）+ 分类标签 + 经纬度 |
| 副标（右上） | 无 | "不是新闻流。是此刻的时间切片。远方 + 你,同时发生。" |

### 12 Coordinates（mockup: home-12-coordinates-desktop.png）

| 维度 | 之前 | 之后 |
|---|---|---|
| 标题 | "此刻 · 6 座城市" | "12 个 同时运转 的远方" |
| 城数 | 6 城（featuredCities 选出） | 11 真实城 + 1 Khartoum 占位（共 12） |
| 左侧大图 | CityFeatured 一个城（无图） | Kyoto 主视觉（Unsplash 京都街景）+ 编号 01/12 + country + 城市名 + tagline + 时间 + UTC+9 |
| 右侧网格 | CityIndex 6 城列表 | 3x4 网格 11 城，每城带 Unsplash 真实街景图 + 编号 + 城市 + 时间 |
| 真实街景图 | 无（cities.ts 本地图未部署） | ✅ 11 张 Unsplash + 1 张 Pexels（Lisbon）按 URL 清单替换 |
| Khartoum | 数据缺失 | 占位符显示 "(待补 · 占位)" |

### Worlds Collide（mockup: home-worlds-collide-desktop.png）

| 维度 | 之前 | 之后 |
|---|---|---|
| 存在 | 不在首页 | ✅ "三座城市, 同一秒。" |
| 3 城 | 无 | Khartoum (red 圆点 + UTC+2 + 02:41) / Reykjavík (blue + UTC+0 + 08:41) / Lisbon (yellow + UTC+1 + 13:41) |
| 观察文本 | 无 | "南郊 30 公里..." / "极昼前最后一夜..." / "电车 28 路在 Alfama..." |
| Layer 色 | 无 | 红/蓝/黄 dot + 卡片 meta 行显示 layer 名 |
| Khartoum | 数据缺 | 占位（暖棕色渐变 + "Red Layer · 占位"） |

### 顶部导航（mockup: home-hero-desktop.png 顶部）

| 维度 | 之前 | 之后 |
|---|---|---|
| 项数 | 3（Cities / Journal / About） | 7（Cities / Journal / Earth Archive / Spotlight / Unknown / My Coordinates / About） |
| About 高亮 | 无 | ✅ Earth Blue 文字 + 下划线（per mockup） |
| 视觉 | 底部水平 | 顶部透明覆盖在 Hero 上（simplified 模式 + backdrop-filter） |

### A2 视觉系统

| Token | 状态 |
|---|---|
| 冷白底 `--bg-page` (#F4F7FA) | ✅ 应用（页面 + Hero + 各板块） |
| Earth Blue 强调 `--earth-blue` (#4F8FE0) | ✅ 主标 em、文字强调、当前 nav 项、Category dot、Worlds Collide 时间 |
| 0 大圆角 `--r-1` (2px) | ✅ 全站（无圆角卡片 / 圆角图片） |
| 0 阴影 `--shadow-none` | ✅ 全站 |
| 4 套字体 (Cormorant Garamond + Fraunces + Inter + JetBrains Mono) | ✅ 全部使用 |
| 三档响应式（Desktop ≥1280 / Tablet 768-1279 / Mobile <768） | ✅ 全部板块实现 |

---

## 残留 TODO / 已知偏差

1. **Khartoum 数据缺失**（按任务允许）
   - 城市数据中无 Khartoum（`cities.ts` 只有 11 城）
   - 12 Coordinates 第 12 位显示占位 "KHARTOUM (待补 · 占位)"
   - Worlds Collide 红卡显示 "KHARTOUM (Red Layer · 占位)"
   - 后续 PM Agent 可补 `cities.ts` 数据 + Khartoum 街景（建议用 Wikimedia Commons per §2.8.9）

2. **Live Events 时间数据**（mock 简化）
   - 当前使用 4 行静态文案 + 实时当地时刻（`getLocalTime`）
   - 未来可接 `liveMoments.ts` 实时数据或 RSS feed

3. **导航锚点**（次要）
   - 大部分 nav 用 `#anchor`（页面内滚动）
   - `Unknown` → `/unknown`（真实路由）
   - `About` → 实际可链到 `/about` 或页面内 `#about`

4. **Earth Archive 板块**
   - mockup 显示 "一条 46 亿年的弧线" + "YOU × 1/77,000,000"
   - **本任务范围外**（按 Phase 1 限定为 4 板块）
   - PM 可在 Phase 2 单独建板块（独立交付)

5. **响应式细节**
   - Mobile 4 角时间堆叠为 2 行水平排列（已实现）
   - Mobile 12 Coordinates 主+网格改为 1 列竖排（已实现）
   - 进一步细节（10px 触摸目标、键盘导航）可后续 polish

---

## Build 验证

```bash
npm run build
```

**结果**：
- ✅ `tsc -b` 退出 0
- ✅ `vite build` 退出 0
- 输出：`dist/index.html` (1.40 KB) + `dist/assets/index-eSXsCVGB.css` (52.85 KB) + `dist/assets/index-B13KUO_U.js` (239.92 KB)
- 真实地球图打包到 `dist/images/home/earth-hero-original.png` (1.5MB)
- HTTP 验证：`curl http://localhost:5173/` → 200 OK

---

## Git 状态

- **本地 commit hash**：`bed566358aed4939fde8c65ddbdfd033230507cd`
- **commit message**：`feat(design): comprehensive v2-phase15 homepage rewrite`
- **已 push**？❌ NO（按指令不推送）
- **变更统计**：12 files changed, 2165 insertions(+), 895 deletions(-)

---

## 给 PM Agent 的指令

### 推送指南

```bash
cd "/Users/lwy/Documents/ChatGPT/看见地球"
git remote -v         # 确认 origin
git log origin/alpha..HEAD --oneline
git push origin alpha # 由 PM/用户决定
```

### 预期 Vercel 部署 URL 格式

- Preview URL（Vercel 自动分配）：`https://see-earth-<hash>-vercel.app`
- 主 URL：`https://see-earth.vercel.app`（per `og:url` meta）
- 部署后请在 Vercel dashboard 确认：
  1. 新 commit 触发 build（exit 0）
  2. Preview URL 返回 200
  3. 首页 devtools `body.style.background` = `#F4F7FA`（A2 冷白）
  4. `/images/home/earth-hero-original.png` 200 OK

### 视觉验收清单（PM/QA 对照 mockup）

- [ ] 首屏 100vh，背景可见真实地球图（不是 SVG 球体）
- [ ] 顶部中央："17 AUG 2026 · 12 COORDINATES · EARTH DAY"（淡 mono）
- [ ] 主标题："世界此刻,同时发生。"（"同时发生" Earth Blue 斜体）
- [ ] 4 角世界时间实时显示（Tokyo / Lisbon / Reykjavík / Cape Town）
- [ ] 7 项顶部导航，About 文字+下划线 Earth Blue
- [ ] 12 Coordinates 板块：左侧 Kyoto 大图，右侧 3×4 网格 11 城真实街景图
- [ ] Live Events 板块：4 行（Berlin / Reykjavík / Kyoto / Lisbon）
- [ ] Worlds Collide 板块：3 卡（Khartoum 红 / Reykjavík 蓝 / Lisbon 黄）
- [ ] 整页冷白底 + Earth Blue 强调 + 0 大圆角 + 0 阴影
- [ ] 响应式：Mobile 单列 / Tablet 适度 / Desktop 全宽

### 已知 dev preview 行为

- 静态资源加载顺序：fonts (Google Fonts Cormorant / Fraunces / Inter / JetBrains) → earth image → Unsplash 12 张街景图
- Unsplash 部分 URL 可能在 dev mode 较慢（不会影响生产 build）
- Khartoum 占位符仅 1 个（其他 11 城都是真实图）

---

## Blocker

**无**。所有必做项已完成。Phase 1 范围已就绪。

---

## 自验收 checklist（更新）

- [x] 5 张 mockup PNG 都已读取 + 理解
- [x] HomeHero 用真实地球图（`earth-hero-original.png`）
- [x] Hero 4 角时间显示 4 城动态时间（Tokyo/Lisbon/Reykjavík/Cape Town）
- [x] Hero 主标题 "世界此刻,同时发生" · 副标题 "此刻,这颗行星..."
- [x] 7 项顶部导航（Cities | Journal | Earth Archive | Spotlight | Unknown | My Coordinates | About）
- [x] Live Events 板块有 4 行 live event
- [x] 12 Coordinates 板块有 12 城（11 真实城 + 1 Khartoum 占位）+ 真实街景图
- [x] Worlds Collide 板块有 3 城同秒对比
- [x] A2 视觉系统：冷白底 / Earth Blue 强调 / 0 大圆角 / 0 阴影
- [x] 三档响应式
- [x] 不修改 14 LOCKED 组件 props / API
- [x] npm run build 编译通过（exit code 0）
- [x] 不引入新依赖
- [x] git commit 成功（本地 alpha 分支，`bed5663`）
- [x] 不推送（按指令）

---

**任务完成。等待 PM Agent 验收 + 推送决策。**
