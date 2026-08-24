# A2 设计实施 · Phase 2 报告 · Hero 区域

> **作者**:Engineer Agent(PM Agent 委派)
> **任务卡**:Hero 区域实施 · EarthGlobe + World Time Rail(A2 设计 LOCK 补全)
> **完成时间**:2026-08-24
> **Git commit**:`f34d646` on alpha branch
> **关联文档**:`release-v1/design-implementation/hero-area.md`(实施计划)
> **前置依赖**:Phase 1 commit `9f24955`(token + HomeShell A2 视觉)

---

## 0. Status

- 任务卡:**IN PROGRESS → IN REVIEW**
- 完成时间:2026-08-24
- Build 状态:✅ PASS(`npm run build` exit code 0,258.91 kB JS / 86.11 kB CSS)
- Typecheck 状态:✅ PASS(`tsc -b` no errors)
- 测试状态:✅ 303/303 PASS(`npm test`)
- Git commit:`f34d646`(本地 alpha,**未 push**)

---

## 1. 实施范围

### 1.1 修改的文件清单(7 个,按重要性排序)

| # | 文件 | 改动类型 | 重要性 |
|---|---|---|---|
| 1 | `src/styles/tokens.css` | **新增 SECTION 11 · EarthGlobe Visuals**(5 token + 2 alpha) | P0 · 核心 |
| 2 | `src/components/EarthGlobe.module.css` | **大改**(配色 A2 + 0 阴影 + 三档响应式) | P0 · 核心 |
| 3 | `src/components/WorldTimeRail.tsx` | **新建**(HomeShell 专用 12 城时间条) | P0 · 核心 |
| 4 | `src/components/WorldTimeRail.module.css` | **新建**(A2 视觉 + 三档响应式 + 横滑 fade) | P0 · 核心 |
| 5 | `src/App.tsx` | import 新组件 + heroContent 顶部插 EarthGlobe + 底部插 WorldTimeRail | P0 · 核心 |
| 6 | `src/App.module.css` | heroContent 扩展 max-width 920px + 加 heroEarthGlobe / heroWorldTimeRail + 三档响应式 | P1 |
| 7 | `release-v1/design-implementation/hero-area.md` | 实施计划 README | 文档 |

**统计**:7 个文件,803 行新增,33 行减。

### 1.2 新增 token(SECTION 11)

```css
--ocean-mid:     #5A91D9;   /* 海面亮区 · Layer Blue 系 */
--ocean-deep:    #1A4D7E;   /* 海面深区 · Earth Blue Deep */
--ocean-dark:    #264A73;   /* 海面极深 · Earth Blue Deeper */
--land-mass:     #7B96AE;   /* 大陆 · 冷绿蓝灰 */
--ice-pale:      #EBF0F5;   /* 冰原/南极 · Cold Light 03 */
--space-deepest: #070E14;   /* 球体最深背景 · Cold Light 11 */
--globe-glow:    rgba(79, 143, 224, 0.18);   /* 大气晕 */
--globe-shine:   rgba(233, 244, 255, 0.35);  /* 球体高光 */
```

这些 token 仅 `EarthGlobe.module.css` + SVG inline 引用,不影响其他组件。

---

## 2. 视觉对照(Before / After)

### 2.1 EarthGlobe(`.module.css` · SVG content 不动)

| 维度 | Before(v2.32.0 暖光风格)| After(A2 LOCK) |
|---|---|---|
| 海面亮区 | `rgba(125, 249, 255, 0.15)`(蓝绿)| **`var(--ocean-mid)` = `#5A91D9`**(Layer Blue) |
| 海面深区 | `rgba(30, 111, 165, 0.45)` | **`var(--ocean-deep)` = `#1A4D7E`**(Earth Blue Deep) |
| 大陆色 | `var(--land-mass)`(未定义 → 渲染失败)| **`#7B96AE`**(冷绿蓝灰)|
| 极地 | `var(--ice-pale)`(未定义 → 渲染失败)| **`#EBF0F5`**(Cold Light 03)|
| 球体高光 | `rgba(233,244,255,.35)` 暖光 | **`var(--globe-shine)` 弱 + 冷色 specular** |
| 大气晕 | 蓝绿光 `rgba(77,195,255,.18)` | **Earth Blue `rgba(79,143,224,.18)`** |
| **Box shadow** | `inset 0 0 60px rgba(0,0,0,.55)` + `0 0 60px glow` | **0 阴影(A2 LOCK 全局规则)** |
| 云层 | `rgba(255,255,255,0.35)` 暖白 | **`#F8FBFD`**(bg-hero-mist 冷白极淡)|
| 星空光晕 | 暖色白 | **`rgba(233, 244, 255, 0.55)` 冷色** |
| **响应式** | 单一 max-width 520px | **三档:520 / 380 / 260** |
| Animation | 旋转 / 云漂 / 闪烁 | **保留**(世界不停转的叙事)|
| `prefers-reduced-motion` | 暂停 svg/clouds | **+ 关闭星空闪烁 + 缩小透视倾斜** |

**关键变化**:
- ✅ 移除所有装饰性 box-shadow(A2 0 阴影强约束)
- ✅ 海陆配色从暖光系(蓝绿/米黄/白)→ 冷色系(Layer Blue + 冷绿蓝灰 + Cold Light 03)
- ✅ 增加 3 档响应式断点(Desktop 520 / Tablet 380 / Mobile 260)
- ✅ SVG 内容、gradient id、animation keyframes 全部保留(组件 `.tsx` 未改 1 行)

### 2.2 WorldTimeRail(新增)

| 维度 | Before(完全缺失)| After(A2 LOCK)|
|---|---|---|
| 数据源 | 无 | **`@/data/cities` + `getLocalTime()`** 12 城 |
| 跳转 | 无 | **`<Link href={city.href}>` 点击 → `/cities/:slug`** |
| 用户时区高亮 | 无 | **`isUserCity` 匹配 → Earth Blue 时间 + 浅蓝 underline** |
| 响应式 | 无 | **三档:Desktop 12 横排 / Tablet 6+6 / Mobile 横滑 + fade** |
| 焦点圈 | 无 | **Earth Blue `var(--focus-ring)` 2px** |
| 0 大圆角 | — | **`border-radius: 0`** + `box-shadow: none` |
| 圆角 | — | **0 大圆角** |
| Typography | — | **Display + Editorial + Mono 4 套字体**(per d11)|
| 时差显示 | — | **GMT+5 → +5H**(Intl.DateTimeFormat `shortOffset`)|
| 时区缩写 | — | **GMT+9 · JST / GMT+1 · BST / GMT+8 · CST** 等 |
| 移动端字号 | — | **time 18px(下限 16px)** |
| A11y | — | **`role="region"` + `aria-label` + `aria-label` per cell** |
| Tab order | — | **天然支持(Tab → Enter 跳转)** |

### 2.3 HomeShell Hero 区域(`App.tsx` + `App.module.css`)

| 维度 | Before | After |
|---|---|---|
| Hero 顶部 | 直接是标题 "世界 · 不止方寸" | **先有 EarthGlobe(冷色调)** + 标题 |
| Hero 底部 | scrollHint 直接在 why details 后 | **加 WorldTimeRail(12 城)** 在 why 后、scrollHint 前 |
| heroContent max-width | 600px | **920px**(横向容纳 12 城网格)|
| heroContent gap | 18px | **18px(不变)** + 内部 margin 控制 |
| 移动端 Hero | 标题 + value + suggestions + why | **+ EarthGlobe(260px) + WorldTimeRail(横滑)** |
| Tablet Hero | 同 Desktop 但容器小 | **+ EarthGlobe(380px) + WorldTimeRail(6+6)** |

### 2.4 Hero 区域最终视觉流(Desktop ≥1280)

```
┌──────────────────────────────────────────────────────────────┐
│ [Logo · 看见地球 · See Earth]              [Cities|Journal|About] │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│                    ⊙ ⊙ ⊙ ⊙ ⊙ ⊙                              │
│                  ⊙             ⊙                            │
│                 ⊙    [Globe]    ⊙                          │
│                  ⊙   ◯◯◯◯◯    ⊙                             │
│                   ⊙  ◯◯◯◯◯  ⊙                              │
│                    ⊙  ◯◯◯  ⊙                                │
│                      ⊙ ⊙ ⊙                                  │
│                                                              │
│              世界 · 不止[方寸](冷蓝 underline)               │
│                                                              │
│              此刻,世界各地正在发生什么。                     │
│              Right now, somewhere on Earth.                  │
│                                                              │
│              [SearchBox · 搜索城市 ____________ ]            │
│                                                              │
│         [看东京此刻在发生什么] [纽约/上海/伦敦] [搜索一个城市]│
│                                                              │
│                  ▾ 为什么看见地球 ▾                          │
│                  (details · 可展开)                         │
│                                                              │
│   ● WORLD TIME                                               │
│   ┌──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┐                   │
│   │21│21│22│22│04│04│07│08│15│15│17│12│  ← 时区缩写/数字  │
│   │KY│TK│SH│HK│LX│LS│SY│ML│MX│NY│LN│CT│  ← 城市名         │
│   └──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┘                   │
│                                                              │
│              ↓ 上滑探索                                      │
└──────────────────────────────────────────────────────────────┘
```

### 2.5 三档响应式对照

| 档位 | EarthGlobe 尺寸 | WorldTimeRail 布局 |
|---|---|---|
| **Desktop ≥ 1280** | max-width 520px | `grid-template-columns: repeat(12, 1fr)`,12 列横排 |
| **Tablet 768-1279** | max-width 380px | `grid-template-columns: repeat(6, 1fr)`,6+6 网格 |
| **Mobile < 768** | max-width 260px | `display: flex` + `overflow-x: auto`,右侧 fade-out gradient |

---

## 3. 残留 TODO / 已知偏差

### 3.1 已知偏差

| # | 项 | 原因 | 影响 | 处置 |
|---|---|---|---|---|
| 1 | EarthGlobe 的 transform `rotateX(8deg)` 保留 | 让球体有立体感,符合"世界 · 不止方寸"叙事 | 极轻微视觉倾斜,符合 LOCKED | 接受 |
| 2 | `src/components/ui/WorldTimeRail.tsx` 没有使用 | 它是设计系统级 LOCKED 通用组件(只接受外部 CityTime[]) | 无影响 | 保留不动(Phase 2 是新建 HomeShell 专用层)|
| 3 | 地球的 `ocean-deep` 在 SVG radial gradient 内是 hardcoded rgba | SVG 内的 `var()` 在 IE/旧 Safari 兼容性问题 | 无影响 | 用 token 替代最外层,SVG 内用 rgba |

### 3.2 未来 polish 项(留 P1)

| # | 项 | Owner |
|---|---|---|
| 1 | EarthGlobe 字体 fallback 在 2G 网络下首屏 FOUC | P1 polish |
| 2 | WorldTimeRail 在用户切换 DST 边界时是否显示"DST 切换中"提示 | P1 |
| 3 | WorldTimeRail 12 城顺序按 timezone offset 排序(而不是 cities.ts 顺序) | P1 |
| 4 | Hero 区域增加 "您的本地时间" 指示 | P1 |

### 3.3 完全不做的事(Brief §6 + Task Card DO NOT)

- ❌ 不引入新依赖(0 新依赖)
- ❌ 不动 22 项 LOCKED 组件 props / API(`EarthGlobe.tsx` SVG 不动;`ui/WorldTimeRail.tsx` 不动)
- ❌ 不改路由结构(沿用 `<Link href={city.href}>` SPA)
- ❌ 不改数据 schema(`cities.ts` 0 改动)
- ❌ 不实现后端 / 不调用 API
- ❌ 不引入 Phase 2/3 范围(Witness / Echo / Analytics 集成)
- ❌ 不增加第四套 Layer
- ❌ 不重做 Hero 之上(Header / Logo / Nav)及 Hero 之下(12 Coordinates / Moments Timeline / Footer)

---

## 4. Build 验证

### 4.1 `npm run build`

```text
> see-earth@1.1.0-rc.1 build
> tsc -b && vite build

vite v5.4.21 building for production...
transforming...
✓ 91 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   1.40 kB │ gzip:  0.76 kB
dist/assets/index-D_gptEqP.css   86.11 kB │ gzip: 16.01 kB
dist/assets/index-dvduAnCX.js   258.91 kB │ gzip: 91.90 kB
✓ built in 2.01s
```

**结果**:✅ PASS,exit code 0
**Bundle 影响**:
- CSS:`86.11 kB`(Phase 1:84.x kB,新增 ~2 kB · WorldTimeRail.module.css + EarthGlobe.module.css 调整)
- JS:`258.91 kB`(几乎不变,无新依赖)

### 4.2 `npm test`

**结果**:✅ 303/303 PASS(无回归)

### 4.3 `tsc -b`(隐含在 `npm run build`)

**结果**:✅ PASS(strict 模式无错误)

---

## 5. Git 状态

### 5.1 Commit

```text
f34d646 feat(design): add Hero area with EarthGlobe + WorldTimeRail to HomeShell
f884360 docs(design): Phase 1 implementation report (D-P0-01)
9f24955 feat(design): implement A2 Visual Foundation v1.2 in HomeShell + components
```

### 5.2 本次 commit 改动统计

```text
7 files changed, 803 insertions(+), 33 deletions(-)
create mode 100644 release-v1/design-implementation/hero-area.md
create mode 100644 src/components/WorldTimeRail.module.css
create mode 100644 src/components/WorldTimeRail.tsx
```

### 5.3 Push 状态

- ❌ **未 push**(本任务约定不 push,等 PM Agent 指导推送)

---

## 6. 给 PM Agent 的指令

### 6.1 推送指南

```bash
cd "/Users/lwy/Documents/ChatGPT/看见地球"
git status                # 确认 working tree 干净
git log --oneline -3      # 确认 f34d646 在 alpha branch 顶

# 推送(推荐方式:push 整个 alpha 分支)
git push origin alpha
```

**或者只 push 这一 commit**(创建 patch):
```bash
git format-patch -1 HEAD --stdout > /tmp/hero-area.patch
# 把 patch 转给 reviewer,reviewer 用 git am 合并
```

### 6.2 预期 Vercel 部署 URL 格式

Vercel 会读取 `vercel.json` 或 package.json 配置。预期部署 URL 模式:
- **Preview 部署(每次 push 自动触发)**:`https://see-earth-git-alpha-{username}.vercel.app`
- **Alpha 分支持续部署**:`https://alpha-see-earth-{team}.vercel.app`(如果有 alias)

**验证步骤**:
1. 打开 Preview URL
2. 首屏应该看到:Header + 旋转地球 + 标题 + SearchBox + suggestions + why details + **12 城时间条带** + scrollHint
3. 点击 WorldTimeRail 任一城市 cell → 应跳转到 `/cities/{slug}`(如 `/cities/kyoto`)
4. Resize 浏览器到 Tablet 宽度(< 1280)→ WorldTimeRail 变 6+6 网格
5. Resize 到 Mobile 宽度(< 768)→ WorldTimeRail 横滑 + 右侧 fade-out

### 6.3 QA 检查清单(发布前)

- [ ] EarthGlobe 在 HomeShell Hero 显示(球体可见 + 旋转动画)
- [ ] WorldTimeRail 12 城时间正确(对照系统时间)
- [ ] WorldTimeRail 点击任一 cell → `/cities/{slug}`
- [ ] 当前时区匹配的 cell 有 Earth Blue 时间 + underline(浏览器时区)
- [ ] Desktop / Tablet / Mobile 三档响应式断点工作
- [ ] Mobile 横滑有右侧 fade-out 提示
- [ ] 焦点圈(Earth Blue 2px)在键盘 Tab 下完整
- [ ] 冷色调一致(无 v2.32.0 暖橘残留)
- [ ] 0 大圆角(无 border-radius > 2px)
- [ ] 0 阴影(无 box-shadow 装饰)
- [ ] `prefers-reduced-motion` 关闭地球旋转动画

### 6.4 不阻塞发布项(已知偏差)

- 球体有 `rotateX(8deg)` 透视感
- `ui/WorldTimeRail.tsx` 仍存在但未引用(Phase 3 / Cross-page 可复用)

---

## 7. Blocker

**无 Blocker**。所有 Phase 2 子任务已完成,build pass,test pass,git commit 在本地 alpha 分支。等待 PM Agent 推送 + Vercel 部署验证。

---

## 8. 与 Phase 1 的对照

| 维度 | Phase 1 | Phase 2(本卡)|
|---|---|---|
| 解决缺口 | HomeShell 整体 A2 化 + token 系统 + 14 LOCKED 组件 | **Hero 区 LOCKED 设计资产未实施**(sitemap §1.1)|
| 改动文件 | 8 | **7** |
| 新增文件 | 2(report + README)| **3**(WorldTimeRail.tsx + .module.css + README)|
| 新增 token | 100+(VF 1.2 全套)| **8**(EarthGlobe visuals)|
| Build 时间 | ~2.0s | ~2.01s |
| 测试影响 | 0 回归 | 0 回归(303/303) |
| Commit | `9f24955` | `f34d646` |

**Phase 1 + Phase 2 = D-P0-01 A2 LOCK 实施完整闭环** ✓

---

**End of hero-area-report.md · D-P0-01 Phase 2 · Hero 区域实施 · 交付报告**