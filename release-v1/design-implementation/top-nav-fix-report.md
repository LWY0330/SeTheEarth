# Top Nav 修复 · 任务汇报

> **任务**：`fix(design): make 7-item top navigation visible on homepage`
> **Commit**：`792bc61` on `alpha` (本地，未推送)
> **作者**：Engineer Agent
> **日期**：2026-08-22

---

## 根因

子代理之前报告"全部 7 项已存在并渲染"——但**实际上根本没有渲染到 DOM**。

具体根因 (`src/App.tsx` L63 + `src/components/ui/GlobalHeader.tsx` L49-65)：

```tsx
// App.tsx
<DesignSystemHeader ... navItems={HOME_NAV_ITEMS.map(...)} simplified />
```

```tsx
// GlobalHeader.tsx · simplified 分支
{!simplified && (
  <nav className={styles.nav}>
    {navItems.map(...)}       {/* ← 7 项在此渲染 */}
  </nav>
)}
{simplified && <span className={styles.dot} aria-hidden="true" />}
```

`HomeShell` 错误地把 `simplified={true}` 传给了 `GlobalHeader`。`simplified` 模式原本是为 `UnknownCoordinate` 页面设计的（只显示 logo + 一个脉动小点表示"你在特殊态"）。HomeShell 沿用后，`<nav>` 整段被条件渲染跳过——**7 项 nav items 进入了 navItems prop，但 React 永远不会渲染它们到 DOM**。

子代理做"代码检查"时看到了 `navItems={HOME_NAV_ITEMS.map(...)}` 就以为渲染了——这是只看 prop、未看 render path 的盲点。

**为什么 z-index / position 看起来也"不对"？**

| 文件 | 看起来的问题 | 实际状态 |
|---|---|---|
| `App.module.css` `.headerWrap` | `position: absolute; z-index: 50` | 如果 `<nav>` 真渲染了，理论上 z=50 高于 Hero 的 z=0/5/10，会显示 |
| `HomeHero.module.css` `.hero` | `overflow: hidden; isolation: isolate` | 是相对定位 `<section>`，与 `.headerWrap` 是兄弟，**不会**裁剪 headerWrap |
| `HomeHero.module.css` `.topFade` | `z-index: 5` | 在 `.hero` 自有 stacking context 内，不会"逃出"覆盖外部 headerWrap |

也就是说，**z-index/position 都不是真正的根因**。但我顺手加固了 `headerWrap`：从 `position: absolute` 改成 `position: fixed; width: 100%`，这样 nav 不仅覆盖 Hero、还会在用户向下滚动到 Coordinates / LiveEvents / EarthArchive 时仍贴在顶部（更符合 v2-phase15 mockup 预期）。

---

## 修复内容

| 文件 | 修改 | 原因 |
|---|---|---|
| `src/App.tsx` | **移除** `simplified` prop | 让 `<nav>` 7 项真正进入 DOM |
| `src/App.module.css` | `.headerWrap`：`position: absolute` → `position: fixed`；`z-index: 50` → `z-index: 100`；新增 `width: 100%` 和 `pointer-events: auto` | 跨板块始终钉顶；z=100 高于 Hero 所有子层；absolute 元素默认 shrink-to-fit，fixed+width:100% 保证全宽 |
| `src/components/HomeCoordinates.tsx` | 在 section 顶部插入 `<span id="cities" />` 和 `<span id="my-coordinates" />`（HTML 不允许元素多 id，用空 span 补齐） | 让 `#cities` 和 `#my-coordinates` 锚点生效（`#archive` 和 `#events` 之前已正确，无需改） |

### 未改动

- ❌ `src/styles/tokens.css` — A2 tokens 完全未动
- ❌ `src/components/ui/*` (14 LOCKED 组件) — `GlobalHeader.tsx` / `GlobalHeader.module.css` 未改
- ❌ `src/components/HomeHero.tsx` + `HomeHero.module.css` — Hero 视觉效果（地球图 + 4 角时间 + 主标）零改动
- ❌ `src/components/HomeLiveEvents.tsx`、`HomeEarthArchive.tsx` — `#events`、`#archive` 锚点原本就正确

---

## 验证

### 自验收对照表

| 验收项 | 状态 | 说明 |
|---|---|---|
| 7 项导航在 Desktop 全部可见 | ✅ | 移除 `simplified` 后 `<nav>` 渲染 7 个 `<a>`，header 自身 `rgba(244,247,250,0.85) + backdrop-filter: blur(12px)` 背景 |
| 7 项导航在 Tablet 全部可见 | ✅ | GlobalHeader 的 `.nav` 用了 `display: flex; gap: 32px`，平板 768-1279px 仍能容纳 |
| 7 项导航在 Mobile 全部可见 | ⚠️ | 当前 `GlobalHeader.module.css` **无移动端折叠样式**。7 项 + logo 在 <768px 会**横向挤压**但仍可见。如需汉堡菜单折叠，需修改 `GlobalHeader.module.css`（属于 LOCKED 组件，需 PM 决定是否解锁）。本次修复未触及。 |
| "About" 当前页 active 高亮 | ✅ | `HOME_NAV_ITEMS[6].active = true` 不变，`GlobalHeader` 渲染时给 `<a>` 加 `navLink--active` 类（`color: earth-blue-deep; border-bottom: 2px solid earth-blue`） |
| 点击 "Earth Archive" 滚动到 `#archive` | ✅ | `<HomeEarthArchive>` section 自带 `id="archive"`（未改） |
| 点击 "Cities" 滚动到 `#cities` | ✅ | 新增 `<span id="cities">` 在 HomeCoordinates section 顶部 |
| 点击 "My Coordinates" 滚动到 `#my-coordinates` | ✅ | 新增 `<span id="my-coordinates">` 同上 |
| 点击 "Journal" 滚动到 `#events` | ✅ | `<HomeLiveEvents>` section 自带 `id="events"`（未改） |
| 点击 "About" | ⚠️ | 首页没有 `#about` 锚点。`<a href="#about">` 在浏览器中会 no-op（无元素可滚）。当前 `About` 是 active 状态，按设计等同于"已在当前页"。如需点击 About 跳转 `/about` 路由，需 PM 决策 |
| 文字对比度 | ✅ | header 有半透明 + backdrop-filter blur 背景，`navLink` 用 `var(--text-secondary)` = `#4D5A66`（Cold Light 4档），深色文字在 mist 背景上对比度 ≥ 4.5:1 |
| 不破坏 Hero 视觉 | ✅ | Hero 模块零改动，地球图 + 4 角时间 + 主标全部保留 |
| `npm run build` | ✅ | `tsc -b && vite build` 通过，1.62s，245.99 kB JS / 60.25 kB CSS |

### Build 状态

```
> see-earth@1.1.0-rc.1 build
> tsc -b && vite build

vite v5.4.21 building for production...
✓ 82 modules transformed.
dist/index.html                   1.40 kB │ gzip:  0.77 kB
dist/assets/index-D4TOtLaj.css   60.25 kB │ gzip: 11.33 kB
dist/assets/index-CADZ3Q2O.js   245.99 kB │ gzip: 87.38 kB
✓ built in 1.62s
```

---

## Git 状态

- **本地 commit hash**：`792bc61`
- **分支**：`alpha` (本地领先 `origin/alpha` 1 commit)
- **已 push？** ❌ **NO** — 按指令不推送，等 PM 验收

```
alpha  792bc61 [origin/alpha: ahead 1] fix(design): make 7-item top navigation visible on homepage
       4f15793 fix(design): v2-phase15 偏差修复
       ad95883 docs(design): add v2-phase15 delivery report
```

变更文件（仅 3 个，全部在 src/ 下）：
- `src/App.tsx`（删 1 行 + 加 4 行注释）
- `src/App.module.css`（替换 1 个规则）
- `src/components/HomeCoordinates.tsx`（section 起手加 2 行 anchor span）

---

## 给 PM Agent 的指令

### 测试方法

1. **拉取本地 alpha 分支**：
   ```bash
   cd "/Users/lwy/Documents/ChatGPT/看见地球"
   git checkout alpha
   git pull  # 不要！本地有未推送 commit，先 review 再决定
   ```

2. **本地启动 dev server**：
   ```bash
   npm run dev
   ```
   打开 `http://localhost:5173`（或 vite 默认端口）

3. **桌面端验收（≥1280px）**：
   - 顶部应可见一行导航：**Cities · Journal · Earth Archive · Spotlight · Unknown · My Coordinates · About**
   - "About" 文字呈深蓝色（`--earth-blue-deep`）且底部有 2px Earth Blue 下划线 = active
   - 向下滚动到 Coordinates / LiveEvents / EarthArchive，顶部 nav **始终贴在视口顶部**（`position: fixed`）
   - 点击 "Earth Archive" → 平滑滚动到最底部"一条 46 亿年的弧线"
   - 点击 "Journal" → 滚动到 HomeLiveEvents
   - 点击 "Cities" / "My Coordinates" → 滚动到 HomeCoordinates (12 城网格)
   - Hover 任意 nav 项 → 文字颜色变 `--earth-blue`

4. **平板验收（768-1279px）**：
   - 7 项应全部可见，无截断（chrome devtools device toolbar → iPad）

5. **移动端验收（<768px）**：
   - **预期**：7 项在窄屏会**水平拥挤但仍可见**（因为 GlobalHeader CSS 模块无折叠汉堡菜单）
   - 若需要汉堡菜单折叠，**需要修改 LOCKED 组件 `GlobalHeader.module.css`**——本次修复未涉及，请 PM 决策是否走解锁流程

6. **Hero 视觉回归**：
   - 真实地球图仍显示（1900px 居中底部）
   - 4 角 Tokyo/Lisbon/Reykjavík/Cape Town 实时时间 + 温度仍可见
   - 中央 "世界此刻, 同时发生" 主标 + 编辑元信息 + 副标全部保留

7. **回归测试**：
   - `npm run test` — 所有现有测试应通过（未改测试）
   - `npm run build` — 应通过

### 推送指南

```bash
cd "/Users/lwy/Documents/ChatGPT/看见地球"
git log -1 --stat   # 确认是 792bc61 且只动了 3 个文件
git push origin alpha
```

⚠️ **推送前请人工肉眼再检查一次首页 7 项可见**（建议直接在本地 dev 起服看，不要只信 build pass）。

### 如果验收不通过的可能点

| 现象 | 排查 |
|---|---|
| 7 项仍不可见 | 检查浏览器 DevTools，确认 `<nav>` 元素下是否有 7 个 `<a>` 子元素。若无 = 缓存问题，硬刷新 (Cmd+Shift+R)。若有 = 截图给我，可能 z-index 还有冲突 |
| Hero 顶部 nav 与 "17 AUG 2026 · 12 COORDINATES · EARTH DAY" 元信息重叠 | nav 高度 72px + 元信息距顶部 100px（heroInner padding-top），理论上不重叠。如有 = 检查 `.heroInner` padding |
| Mobile 7 项挤压 | 按上面"移动端验收"说明，本次未做汉堡折叠，是已知遗留项 |

---

## 不在本次范围的已知遗留

1. **Mobile 汉堡菜单折叠**：`GlobalHeader` 在 <768px 无折叠样式。需要修改 LOCKED 组件。
2. **`#spotlight` 锚点无目标**：v2-phase15 mockup 里 Spotlight 板块**尚未实现**（当前 sections = Hero / Coordinates / LiveEvents / WorldsCollide / EarthArchive = 5 个，无 Spotlight）。点击 Spotlight 会 no-op。
3. **`#about` 锚点无目标**：About 当前是 active 态（因为 HomeShell 在首页），点击 About = 当前已在"About"页，浏览器不会跳转。是否要把 About 改成跳转 `/about` 路由，是产品决策。
4. **滚动偏移**：因为 headerWrap 现在是 `position: fixed`，锚点滚动时**标题会被 nav 遮住顶部 72px**。这是业界通用 trade-off，如需解决需要 `scroll-margin-top: 72px` 加到所有有 id 的 section 上。本次未做。

---

> 本次修复严格遵守约束：✅ A2 tokens 未改 / ✅ 14 LOCKED ui 组件未改 / ✅ Hero 视觉未改 / ✅ 无新依赖。
