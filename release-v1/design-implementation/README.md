# A2 设计实施 · Phase 1 README

> **作者**:Engineer Agent(PM Agent 委派)
> **任务卡**:D-P0-01 设计 LOCK 实施 · Phase 1 修订
> **范围**:把 Round 1 D-P0-01 LOCKED 的设计(Visual Foundation v1.2 + Layer 三色 + 响应式三档)**实施到代码**
> **完成时间**:2026-08-24

---

## 0. 任务一句话总结

把 `release-v1/web-v1-flow/` 的 4 份 LOCKED 设计文档(Sitemap / Design Freeze / Layer QA / Responsive)对应到 `src/` 实际代码:更新 token 系统、应用 A2 视觉语言、应用 3 套 Layer 主题、应用三档响应式。**不动 LOCKED 组件的 props / API,不动路由,不动数据 schema**。

---

## 1. 现状差异(v2.32.0 旧设计 vs A2 LOCK 新设计)

### 1.1 当前 `src/styles/tokens.css`(v2.32.0)

| 维度 | 现状 | A2 LOCK 要求 | 差异 |
|---|---|---|---|
| 底色 | `--color-canvas: #F5F1EA`(奶白米黄)| `--bg-page: #F4F7FA`(冷白)| 暖 → 冷 |
| 主色 | `--color-accent-500: #B25E40`(暖橘)| `--earth-blue: #4F8FE0` 或 `#1A4D7E`(冷蓝)| 暖橘 → 冷蓝 |
| 灰阶 | 4 档 ink-900/700/500/300 | **12 档 Cold Light 灰阶** | 数量不足 |
| Layer 色 | 无 | Blue `#5A91D9` / Yellow `#D3AC54` / Red `#D66C61` | 缺失 |
| 字体 | Fraunces + Inter + JetBrains Mono | Cormorant Garamond + Fraunces + Inter + JetBrains Mono | 缺 Cormorant |
| 字号 | 7 档(clamp 公式)| 5+ 档(含 120px Display)| 接近但未对齐 v1.3 spec |
| 间距 | 8 倍数(sp-1 到 sp-11)| **4px Base Grid** | 8 → 4 |
| 动效 | 6 档(100ms-1200ms)| 3 档(120ms / 220ms / 700ms)+ Reveal 800ms | 不对齐 |
| 阴影 | 4 档阴影 | **0 阴影 / 0 大圆角** | 强约束未应用 |
| 圆角 | r-xs=4 到 r-2xl=48 | **≤ 2px** | 不合规 |

### 1.2 当前 `src/App.tsx` + `App.module.css`(HomeShell)

| 元素 | 现状 | A2 LOCK 要求 |
|---|---|---|
| 整体底色 | 奶白 `#F5F1EA` + 暖橘强调 | 冷白 `#F4F7FA` + 冷蓝主色 |
| Logo | 暖橘圆点 + 衬线 logo | 冷蓝点 + 极简 logo |
| 标题 | "世界 · 不止方寸"(大衬线 + 暖橘 underline)| "世界 · 不止方寸"(同 LOCKED)但用冷蓝强调 |
| 副标题 | 暖米白色 | 冷白底 + 12 档灰 |
| 强调色 | `var(--color-accent-500)`(暖橘)| `var(--earth-blue)`(冷蓝)|
| 焦点圈 | 暖橘 2px | **Earth Blue `rgba(26, 77, 126, 0.40)` 2px** |
| 圆角 | `var(--r-xl)` 32px | **≤ 2px** 或 0 |

### 1.3 当前 LOCKED UI 组件(14 个 / `src/components/ui/*.module.css`)

- 14 个 LOCKED 组件**已经**引用 `var(--earth-blue)` / `var(--font-display)` / `var(--text-secondary)` / `var(--border-hairline)` 等 VF 1.2 token
- **但是**:`tokens.css` **没有定义这些 token**!`globals.css` 也只定义了旧的奶白+暖橘 token
- **结果**:14 个 LOCKED 组件目前在 alpha 上没有正确视觉(Vite 会用 undefined → 渲染失败或 fallback 到浏览器默认)

**这是 Phase 1 必修复的关键 bug。**

---

## 2. 实施计划

### 2.1 Phase 1.2 · 更新 token 系统(必做 + 优先级 P0)

**目标**:让 `var(--earth-blue)` / `var(--font-display)` / `var(--text-primary)` 等 token 全部生效,14 LOCKED 组件和 HomeShell 都能用。

**文件**:
- `src/styles/tokens.css` — 重写为 VF 1.2 spec(扩展现有 token,新增 A2 专属 token,保留旧的兼容命名)
- `src/styles/globals.css` — 更新 font import,更新 body 底色,更新焦点圈

**保留兼容**:
- `--color-canvas` / `--color-ink-*` / `--color-accent-*` 保留(避免破坏非 LOCKED 组件,但这些是 v2.32.0 旧值,新组件优先用 `--bg-page` / `--text-primary` 等)
- `--font-serif` 保留映射到 Cormorant Garamond + Fraunces + Songti SC
- `--font-sans` 保留映射到 Inter + PingFang SC
- `--font-mono` 保留映射到 JetBrains Mono

**新增 A2 LOCK token**:
- 颜色:`--bg-page` / `--bg-hero-mist` / `--surface-base` / `--surface-overlay`
- 文字:`--text-primary` / `--text-secondary` / `--text-tertiary` / `--text-inverse` / `--text-quaternary`
- Layer:`--earth-blue` / `--earth-blue-deep` / `--earth-blue-subtle` / `--atmosphere-blue` / `--layer-yellow` / `--layer-red` / `--success-green`
- Border:`--border-hairline` / `--border-subtle` / `--border-strong` / `--border-accent` / `--focus-ring`
- Overlay:`--overlay-hero-top` / `--overlay-hero-bottom` / `--overlay-hero-left` / `--overlay-hero-warm-bottom`
- Typography:`--font-display` / `--font-editorial` / `--fs-display-xl` / `--fs-display-l` / `--fs-display-m` / `--fs-display-s` / `--fs-h2-h4` / `--fs-body-l` / `--fs-body` / `--fs-body-s` / `--fs-meta` / `--fs-caption` / `--fs-micro` / `--fs-time-xl` 到 `--fs-time-s` / `--fw-light/regular/medium` / `--lh-tight/snug/normal/relaxed/loose` / `--ls-tight/normal/meta/wide/xwide`
- Spacing:`--s-1` 到 `--s-13`(4px Base Grid)
- Layout:`--content-max-width-1440/1680/1920` / `--page-padding-x` / `--header-height`
- Motion:`--motion-fast` (120ms) / `--motion-base` (220ms) / `--motion-slow` (700ms) / `--motion-reveal` (800ms)
- State:`--state-default-bg` / `--state-hover-bg` / `--state-focus-ring` / `--state-active-scale` / `--state-disabled-opacity` / `--state-success-color`
- Z-index:`--z-base` / `--z-sticky` / `--z-overlay` / `--z-modal`

### 2.2 Phase 1.3 · 应用 A2 视觉到 HomeShell(必做)

**文件**:
- `src/App.module.css` — 改底色 + 改 Logo dot color + 改 focus ring + 改 hero 强调色
- `src/App.tsx` — 不改逻辑(仅改 `--earth-blue` 引用方式)

**改动点**:
- `.logoDot` 暖橘 → `var(--earth-blue)`
- `.titleEm` 暖橘 underline → 冷蓝 underline(用 `var(--earth-blue)` 替换 `var(--color-accent-500)`)
- `.nav a:hover` 暖橘 → `var(--earth-blue)`
- `.whySummary:hover` 暖橘 → `var(--earth-blue)`
- 圆角 `var(--r-xl)` → `var(--r-sm)`(8px → 2-4px;A2 强约束 ≤ 2px,妥协为 2px 但全局用小值)
- body 底色: 暖米白 → 冷白(已在 globals.css 处理)
- 焦点圈: 暖橘 → Earth Blue(已在 globals.css 处理)

### 2.3 Phase 1.3 · 应用 3 套 Layer 主题

**策略**:`CityFeatured` 通过 `data-layer` 属性 + CSS Module modifier 让 Kyoto=Blue, Lisbon=Yellow, Khartoum=Red。

**文件**:
- `src/components/CityFeatured.tsx` — 新增 `data-layer="blue|yellow|red"` 属性(由 `city.id` 映射)
- `src/components/CityFeatured.module.css` — 新增 `.featured[data-layer="blue"]` / `.featured[data-layer="yellow"]` / `.featured[data-layer="red"]` modifier,只改 Layer 信息点(kicker dot / kicker label 颜色)
- 不动 component API(props)

**city → layer 映射**(硬编码在 component,因为 3 个 LOCKED 城市不依赖 data schema):
- `kyoto` → `blue`
- `lisbon` → `yellow`
- `khartoum` → `red`(注意:Khartoum 在 cities.ts 里没有数据 → 暂时仅在数据为 'khartoum' 时应用)

### 2.4 Phase 1.4 · 三档响应式

**当前**:有 `@media (max-width: 900px)` 和 `@media (max-width: 640px)`(2 档粗略切分)
**A2 LOCK**:Desktop ≥ 1280 / Tablet 768-1279 / Mobile < 768(3 档严格切分)

**改动**:
- `App.module.css` 把 `900px` 调整为 `1279px`(Tablet 上限),`640px` 调整为 `767px`(Mobile 上限),新增 `1280px` 检查
- `CityFeatured.module.css` 添加 768 / 1279 断点
- `CityCard.module.css` 添加 768 / 1279 断点
- `MomentsTimeline.module.css` 调整断点(已经是 900 / 640,但改为 1279 / 767)
- 触摸目标 ≥ 44px(iOS HIG),移动端 DistanceNavigation ≥ 48px

### 2.5 Phase 1.5 · Build 验证

- `npm run build` — 编译通过 + 类型检查通过
- 不引入新依赖(仅修改样式)

### 2.6 Phase 1.6 · Commit + 报告

- git commit on alpha
- 不 push(等 PM Agent 指导推送)
- 写 `release-v1/design-implementation/phase1-design-impl-report.md`

---

## 3. 不做的事(Brief §6 + Task Card DO NOT)

- ❌ 不引入新依赖
- ❌ 不动 22 项 LOCKED 组件的 props / API
- ❌ 不改路由结构
- ❌ 不改数据 schema
- ❌ 不实现后端
- ❌ 不引入 Phase 2/3(Witness POST / Echo / Analytics 集成)
- ❌ 不增加第四套 Layer
- ❌ 不重做 LOCKED 页面

---

## 4. 风险点

| 风险 | 影响 | 缓解 |
|---|---|---|
| 14 LOCKED UI 组件目前因为 token undefined 渲染异常 | alpha 上 UniversalCityPage 可能没有正确样式 | tokens.css 全面补完后,这些 token 全部生效 |
| 字体加载依赖 Google Fonts CDN,弱网环境 fallback | 视觉差异 | fallback 链 `Cormorant → Fraunces → Songti SC` 已定义 |
| 圆角从 32px 降到 2-4px 视觉冲击大 | 用户感知"换了一种产品" | 是 D-P0-01 LOCKED 的明确意图,接受此冲击 |
| v2.32.0 旧 token (`--color-canvas` 等) 被 HomeShell 用 | 切到冷白需要把 HomeShell 改用 `--bg-page` | 在 App.module.css 局部替换 |
| `tsc -b` 严格类型检查 | 改了 tokens 不影响类型,但改了组件 props 类型会失败 | 不改 props 类型,只改 CSS |

---

## 5. 改动文件清单(预计)

1. `src/styles/tokens.css` — 大改(扩展为 VF 1.2 完整 token)
2. `src/styles/globals.css` — 改 font import + body 底色 + focus ring
3. `src/App.module.css` — 局部改色 + 圆角 + 响应式断点
4. `src/components/CityFeatured.module.css` — 加 Layer modifier + 改响应式
5. `src/components/CityFeatured.tsx` — 加 data-layer 属性
6. `src/components/CityCard.module.css` — 改响应式断点
7. `src/components/MomentsTimeline.module.css` — 改响应式断点
8. `release-v1/design-implementation/README.md` — 本文档
9. `release-v1/design-implementation/phase1-design-impl-report.md` — 报告

**未改动**(故意保留):
- 所有 `src/components/ui/*` 组件 CSS — 它们已经引用 VF 1.2 token,只需 tokens.css 补全即可生效
- `src/components/UniversalCityPage.tsx` 及其子组件 — 同上
- 所有 `src/types/*` 和 `src/data/*` — 不动 schema

---

## 6. 自验收 checklist

- [ ] tokens.css 完整包含 VF 1.2 spec 全部 token
- [ ] globals.css 引用 tokens.css + Cormorant Garamond 字体
- [ ] HomeShell 视觉应用冷白 + Earth Blue + 12 档灰
- [ ] CityFeatured 通过 data-layer 应用 3 套 Layer 主题
- [ ] CityCard 视觉更新(冷白 + 冷蓝 focus)
- [ ] MomentsTimeline 视觉更新(冷白 + 冷蓝 status dot)
- [ ] 三档响应式断点 1280 / 768 严格切分
- [ ] npm run build 编译通过(exit code 0)
- [ ] 不引入新依赖
- [ ] 不修改 LOCKED 组件 props / API
- [ ] git commit 在 alpha 分支本地完成
- [ ] 报告写在 `release-v1/design-implementation/phase1-design-impl-report.md`

---

**End of README · D-P0-01 Phase 1 实施 · Plan**