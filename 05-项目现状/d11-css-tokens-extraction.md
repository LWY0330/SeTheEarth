---
title: CSS Tokens 提取 · Component Library first pass
type: design-spec
tags: [css-tokens, design-system, v1.3, component-library, see-earth-redesign]
date: 2026-08-22
sender: 内部 Designer Agent
status: first pass LOCKED
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/d11-css-tokens-extraction.md
related_docs:
  - /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/07-设计师设计参考/SEE_EARTH_DESIGN_SYSTEM_v1.2_Complete_Spec.md §2(v1.2 token 基础)
  - /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/07-设计师设计参考/SEE_EARTH_DESIGN_SYSTEM_v1.3_Complete_Spec.md §2.1.9(Layer Palette)
  - /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/d11-component-library-first-pass.md(14 组件)
---

# CSS Tokens 提取 · Component Library first pass

> **顶部声明**:从 3 套 LOCKED 页面 mockup(Kyoto / Khartoum / Lisbon)+ Unknown Coordinate first pass 提取的 CSS tokens,作为 14 组件库的统一设计 token 来源。本文档不重写 v1.2 §2,只在 v1.3 框架下补完 Component Library 所需的全部 token。
> **引用规范**:所有 token 必须通过 CSS custom properties(`var(--xxx)`)使用,严禁硬编码 HEX

---

## 1. 颜色 Tokens

### 1.1 Foundation(基础底色)

| Token | HEX | 用途 | 适用组件 |
|---|---|---|---|
| `--bg-page` | `#F4F7FA` | 全站底色 | 全局 |
| `--bg-hero-mist` | `#F8FBFD` | Hero 区域微亮 | HeroMedia, WorldTimeRail |
| `--surface-base` | `#FAFAFA` | Card / Section base | SectionHeader |
| `--surface-overlay` | `rgba(7, 14, 20, 0.X)` | Hero 暗 gradient overlay | HeroMedia |

### 1.2 Text(文字层级)

| Token | HEX | 用途 | 适用组件 |
|---|---|---|---|
| `--text-primary` | `#11161B` | 主文字 / 标题 | 全部 |
| `--text-secondary` | `#4D5A66` | 副文字 / 描述 | 全部 |
| `--text-tertiary` | `#7B8792` | Meta / Hint / 弱信息 | LocationMeta, DistanceNavigation |
| `--text-inverse` | `#F7FAFC` | Hero 上的白文字 | HeroMedia, TimeDisplay(inverse) |
| `--text-quaternary` | `rgba(17, 22, 27, 0.5)` | 占位 / 弱化 | EchoInput placeholder |

### 1.3 Layer Palette(per v1.3 §2.1.9)

| Token | HEX | 用途 | 适用组件 | 占比 |
|---|---|---|---|---|
| `--earth-blue` | `#1A4D7E` | 主蓝(Earth Blue) | TimeDisplay, LayerIndicator(blue) | ≤ 3% |
| `--earth-blue-deep` | `#264A73` | 深蓝(hover/focus) | GlobalHeader, DistanceNavigation | ≤ 3% |
| `--earth-blue-subtle` | `#DCECFB` | 浅蓝背景 | EchoInput focus bg | ≤ 5% |
| `--atmosphere-blue` | `#8EBBEF` | Atmosphere Blue(用户时区) | WorldTimeRail(Your Time dot) | ≤ 3% |
| `--layer-yellow` | `#D8B15C` | Lisbon / Yellow Layer | TimeDisplay(Lisbon), LayerIndicator | ≤ 3% |
| `--layer-red` | `#D96A5F` | Khartoum / Red Layer | TimeDisplay(Khartoum), EchoInput Success | ≤ 5% |
| `--success-green` | `#4A8A4A` | Success 状态对勾(默认) | EchoInput Success(default) | ≤ 3% |

### 1.4 Border(描边层级)

| Token | HEX | 用途 | 适用组件 |
|---|---|---|---|
| `--border-hairline` | `rgba(17, 22, 27, 0.08)` | 全局细线 | GlobalHeader 底边, SectionHeader divider |
| `--border-subtle` | `rgba(0, 0, 0, 0.12)` | 中等细线 | EchoInput 底边(default) |
| `--border-strong` | `rgba(0, 0, 0, 0.20)` | 强调细线 | EchoInput 底边(hover) |
| `--border-accent` | `var(--earth-blue)` | 强调边框 | EchoInput 底边(focus) |
| `--focus-ring` | `rgba(26, 77, 126, 0.40)` | 焦点圈 | 全交互组件(Focus state) |

### 1.5 Shadow / Overlay

| Token | HEX | 用途 | 适用组件 |
|---|---|---|---|
| `--shadow-none` | `none` | 0 阴影(全局规则) | 全组件 |
| `--overlay-hero-top` | `linear-gradient(180deg, rgba(7,14,20,0.30), transparent)` | Hero 顶部 fade | HeroMedia |
| `--overlay-hero-bottom` | `linear-gradient(0deg, rgba(7,14,20,0.50), transparent)` | Hero 底部 fade | HeroMedia |
| `--overlay-hero-left` | `linear-gradient(105deg, rgba(7,14,20,0.45), transparent)` | Hero 左侧 safe area | HeroMedia |
| `--overlay-hero-warm-bottom` | `linear-gradient(0deg, rgba(40,24,16,0.5), transparent)` | Khartoum 暖暗棕底部 | HeroMedia(Khartoum) |

> **强约束**:**Project 0 阴影 / 0 大圆角**(全局规则)
> - 任何组件严禁 box-shadow
> - 任何组件严禁 border-radius > 2px(EchoInput submit 唯一例外:2px)

---

## 2. 字号 / 字重 / 行高 Tokens

### 2.1 Display(主标题)

| Token | 数值 | 字体 | 适用组件 |
|---|---|---|---|
| `--fs-display-xl` | `120px` | Cormorant Garamond Serif | LocationMeta 主城市名(cityZh 120px) |
| `--fs-display-l` | `72px` | Cormorant Garamond Serif | SectionHeader 主页标题 |
| `--fs-display-m` | `64px` | Cormorant Garamond Serif | City Detail 主标 / Echo 提问 |
| `--fs-display-s` | `48px` | Cormorant Garamond Serif | 章节主标 / 城市名缩写 |

### 2.2 Heading(次标题)

| Token | 数值 | 字体 | 适用组件 |
|---|---|---|---|
| `--fs-h2` | `36px` | Fraunces Italic Serif | One Scene 描述 |
| `--fs-h3` | `28px` | Fraunces Italic Serif | Arrival 城市英文名 / 章节副标 |
| `--fs-h4` | `22px` | Fraunces Italic Serif | One Scene 文字块 / Echo Success 文案 |

### 2.3 Body(正文)

| Token | 数值 | 字体 | 适用组件 |
|---|---|---|---|
| `--fs-body-l` | `18px` | Inter Sans | Echo 描述 / SectionHeader 副 |
| `--fs-body` | `17px` | Inter Sans | 全站默认正文 |
| `--fs-body-s` | `14px` | Inter Sans | NavLink / 列表项 |

### 2.4 Meta / Caption(辅助)

| Token | 数值 | 字体 | 适用组件 |
|---|---|---|---|
| `--fs-meta` | `12px` | Inter Sans, uppercase, letter-spacing 0.16-0.18em | LocationMeta, DistanceNavigation, LayerIndicator kicker |
| `--fs-caption` | `11px` | Inter Sans, uppercase | SectionHeader kicker / Footer |
| `--fs-micro` | `9-10px` | JetBrains Mono, uppercase | Footer 微信息 / 弱 meta |

### 2.5 Time(时间数字专用)

| Token | 数值 | 字体 | 适用组件 |
|---|---|---|---|
| `--fs-time-xl` | `64-80px` | JetBrains Mono, tabular-nums | TimeDisplay(lg) / WorldTimeRail(选中) |
| `--fs-time-l` | `32-42px` | JetBrains Mono, tabular-nums | TimeDisplay(md) / WorldTimeRail |
| `--fs-time-m` | `22px` | JetBrains Mono, tabular-nums | TimeDisplay(middle column) |
| `--fs-time-s` | `14-16px` | JetBrains Mono, tabular-nums | LocationMeta coords |

### 2.6 字重

| Token | 数值 | 适用组件 |
|---|---|---|
| `--fw-regular` | `400` | 全 Serif 主标 / 正文 |
| `--fw-medium` | `500` | Meta / NavLink active |
| `--fw-light` | `300` | TimeDisplay middle column |

### 2.7 行高

| Token | 数值 | 适用组件 |
|---|---|---|
| `--lh-tight` | `1.0` | Display 主标 / TimeDisplay 数字 |
| `--lh-snug` | `1.05` | Display 主标(带 letter-spacing) |
| `--lh-normal` | `1.5` | Body 短段落 |
| `--lh-relaxed` | `1.65` | Body 长段落 / Description |
| `--lh-loose` | `1.85` | 全站默认正文行高 |

### 2.8 字间距(letter-spacing)

| Token | 数值 | 适用组件 |
|---|---|---|
| `--ls-tight` | `-0.02em` | Display 大字号 |
| `--ls-normal` | `0` | Body / Serif |
| `--ls-meta` | `0.16em` | Meta 11-12px |
| `--ls-wide` | `0.18em` | Kicker 11px |
| `--ls-xwide` | `0.28em` | LogoEn uppercase |

---

## 3. 间距 Tokens(4px Base Grid)

### 3.1 微距(2-8px)

| Token | 数值 | 用途 |
|---|---|---|
| `--s-1` | `4px` | 最小间距 / dot 与文字 |
| `--s-2` | `8px` | 紧密元素之间 |
| `--s-3` | `12px` | 标签 / kicker 下边距 |

### 3.2 常用(16-32px)

| Token | 数值 | 用途 |
|---|---|---|
| `--s-4` | `16px` | 标准元素间距 |
| `--s-5` | `20px` | 段落间 |
| `--s-6` | `24px` | 子区域 |
| `--s-7` | `32px` | section padding / nav gap |

### 3.3 大距(40-80px)

| Token | 数值 | 用途 |
|---|---|---|
| `--s-8` | `40px` | 组件间 |
| `--s-9` | `48px` | Hero 边距 / 章节上 |
| `--s-10` | `64px` | 大章节 |
| `--s-11` | `80px` | 章节间距 |

### 3.4 屏距(96-160px)

| Token | 数值 | 用途 |
|---|---|---|
| `--s-12` | `128px` | 屏与屏之间 |
| `--s-13` | `160px` | 大屏分隔 |

---

## 4. 容器 / 断点 Tokens

| Token | 数值 | 适用组件 |
|---|---|---|
| `--content-max-width-1440` | `1376px` | 1440 viewport 容器 |
| `--content-max-width-1680` | `1616px` | 1680 viewport 容器 |
| `--content-max-width-1920` | `1856px` | 1920 viewport 容器 |
| `--page-padding-x` | `32px` | 全部页面水平 padding |
| `--header-height` | `72px` | GlobalHeader 高度 |
| `--hero-height-detail` | `720px` | City Detail Hero 高度 |
| `--hero-height-unknown` | `100vh` | Unknown Hero 高度(全屏) |

### 4.1 3 Breakpoint 视觉一致性(per v1.3 §2.4.6)

- **1440**:容器 1376px,padding 32px(主 mockup)
- **1680**:容器 1616px,padding 32px
- **1920**:容器 1856px,padding 32px
- 所有组件必须 3 breakpoint 视觉一致(72px / 96px / 128px 间距节奏不变)

---

## 5. 字体族 Tokens

| Token | 值 | 用途 |
|---|---|---|
| `--font-display` | `"Cormorant Garamond", "Fraunces", "Songti SC", serif` | Display 主标(120/72/64) |
| `--font-editorial` | `"Fraunces", "Songti SC", serif` | Editorial Italic(描述 / One Scene) |
| `--font-sans` | `"Inter", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif` | 全站正文 / 导航 |
| `--font-mono` | `"JetBrains Mono", "SF Mono", Menlo, monospace` | 时间数字 / 坐标 / META |

> **fallback 链原则**:
> - Display:英文 Cormorant → Fraunces → 中文 Songti SC
> - Editorial:英文 Fraunces → 中文 Songti SC
> - Sans:英文 Inter → 中文 PingFang SC / Microsoft YaHei → system-ui
> - Mono:英文 JetBrains Mono → SF Mono → Menlo

---

## 6. Motion Tokens(动效时长 / 缓动)

| Token | 数值 | 缓动 | 用途 |
|---|---|---|---|
| `--motion-fast` | `120ms` | `cubic-bezier(.22,.61,.36,1)` | Active 状态 scale 0.99 |
| `--motion-base` | `220ms` | `cubic-bezier(.22,.61,.36,1)` | Hover / Focus / State 过渡 |
| `--motion-slow` | `700ms` | `ease-out` | Hero scale / Reveal sequence |
| `--motion-reveal` | `800ms` | `ease-out` | Unknown Reveal 坐标过渡 |

### 6.1 动效全局规则(A2 LOCKED)

✅ **允许 5 种动效**(per PROMPT 24):
1. Hero Earth slow drift(scale 1.015 / Y -8px / 18s)
2. Hero typography reveal(标题 / 副标题淡入)
3. World Clock number transition(数字翻牌过渡)
4. Image window hover(缩略图 hover 微提亮)
5. Section scroll reveal(5 大板块滚入淡入)

❌ **严禁**:
- 扫描线 / 雷达 / 科技 HUD
- 圆点 / 渐变 / Glow / 地图线 / 扫描动画
- 坐标装饰 / 浮层
- Parallax / 滚动触发 / 鼠标跟随 / 3D
- Witness 演化(8/19 路线图未列)

---

## 7. Component Library 专用 Tokens

### 7.1 State 颜色(6 状态)

| Token | 数值 | 用途 |
|---|---|---|
| `--state-default-bg` | `transparent` | Default 状态无底色 |
| `--state-hover-bg` | `var(--bg-hero-mist)` | Hover 状态浅底色 |
| `--state-focus-ring` | `0 0 0 2px var(--focus-ring)` | Focus 焦点圈 |
| `--state-active-scale` | `scale(0.99)` | Active 按下 |
| `--state-disabled-opacity` | `0.5` | Disabled 半透 |
| `--state-success-color` | `var(--success-green)` 或 `var(--layer-red)` | Success 对勾色 |

### 7.2 Cursor Tokens

| Token | 数值 | 适用组件 |
|---|---|---|
| `--cursor-pointer` | `pointer` | 可点击组件 |
| `--cursor-text` | `text` | textarea |
| `--cursor-not-allowed` | `not-allowed` | Disabled 组件 |

### 7.3 Z-index 层级

| Token | 数值 | 用途 |
|---|---|---|
| `--z-base` | `1` | 基础内容 |
| `--z-sticky` | `100` | GlobalHeader sticky |
| `--z-overlay` | `500` | Modal / Tooltip |
| `--z-modal` | `1000` | 全屏 modal |

---

## 8. 引用 v1.2 / v1.3 关系

### 8.1 v1.2 §2 已有(VALIDATED,直接引用)

- `--earth-blue`, `--layer-yellow`, `--layer-red`(已对齐 v1.3 §2.1.9)
- `--bg-page`, `--bg-hero-mist`, `--text-primary/secondary/tertiary/inverse`
- `--border-hairline`, `--font-display/editorial/sans/mono`
- `--fs-h1/h3/body/body-s/meta`, `--s-2 ~ s-13`
- `--content-max-width`, `--page-padding-x`, `--header-height`

### 8.2 v1.3 §2.1.9 增量补完(LOCKED)

- Layer Palette 3 HEX + 全局规则(≤ 3-5% viewport,仅 accent)
- Earth Blue `#1A4D7E`(深,冷光 + 地球蓝,v1.2 的 `#4F8FE8` 调整为更深的 `#1A4D7E`)
- Layer Yellow `#D8B15C`, Layer Red `#D96A5F`

### 8.3 v1.3 §2.4.6 新增(LOCKED)

- Container widths:1376 / 1616 / 1856(3 breakpoint)
- Spacing rhythm:96 / 64-80 / 128 / 160(屏 / 章节 / 屏距 / 大屏)

### 8.4 本文档新增(first pass)

- Layer Deep / Subtle / Atmosphere 3 个 Earth Blue 衍生
- Success Green `#4A8A4A`(EchoInput Success 默认)
- Border subtle / strong / accent 4 个层级
- Overlay 4 种 hero gradient(top / bottom / left / warm-bottom)
- Time 系列字号(time-xl / l / m / s)
- 字重 / 行高 / 字间距 tokens(全套)
- Motion 4 档时长(fast / base / slow / reveal)
- State / Cursor / Z-index 体系

---

## 9. 已知约束(per A2 LOCKED)

✅ **0 阴影 / 0 大圆角**(全局规则)
✅ **Mono 字体必须 tabular-nums**(时间数字防抖动)
✅ **Layer color 占比 ≤ 3-5% viewport**(语义点缀)
✅ **不引入新视觉系统**(A2 LOCKED)
✅ **不引入新依赖**(等工程师实施)

---

## 10. 触发后续动作

- 🔜 PROMPT 46(给工程师):React 组件实现(token → JS 变量映射)
- 🔜 PROMPT 47(给工程师):CSS Modules 实现(token → CSS Module 命名)
- 🔜 Phase 4 启动:Dark Mode token 扩展(`[data-theme="dark"]` token 值)

---

**字数统计**:约 3,800 字 · 颜色 / 字号 / 字重 / 行高 / 字间距 / 间距 / 容器 / 字体 / Motion / State / Cursor / Z-index 全覆盖
