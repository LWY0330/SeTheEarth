# Design Spec v1 · 看见地球

> **版本**：v1（首发版）
> **日期**：2026-08-05
> **性质**：视觉与组件设计系统规范（Design System Spec）
> **区分**：本文回答"长什么样、用什么组件"；[`product-spec-v1.md`](./product-spec-v1.md) 回答"为什么做、做什么"。两者互为 SSOT。
> **读者**：AI Agent、前端工程师、设计师
> **验收门槛**：拿到本文即可在**不看任何 Figma 稿**的前提下，完成 100% 页面与组件的实现；所有偏离本文的设计决策需写 ADR。

---

## 0. 阅读指引

本文按以下顺序递进，建议实现时按相同顺序落地：

```
设计原则（§1）
   ↓
设计令牌 / Token（§2 色彩 · §3 字体 · §4 间距/圆角/阴影）
   ↓
组件库 / Components（§5）
   ↓
页面装配 / Pages（§6）
   ↓
横切规范（§7 响应式 · §8 动效 · §9 状态 · §10 A11y）
   ↓
专项（§11 图标 · §12 明信片）
   ↓
附录（与 Product Spec 对照、CSS 导出、验收清单）
```

> **铁律**：所有数字（颜色、字号、间距、时长）必须从 Token 取值，**禁止硬编码**。

## 1. 设计原则（6 条不可妥协）

> 这 6 条原则是 v1 视觉与组件的**最高优先级约束**。当任何后续决策与之一冲突时，原则胜出。

### 1.1 极简（Minimal）
- **定义**：每一像素都必须承载功能；没有功能的元素立即删除。
- **Do**：用文字层级 + 间距表达信息层级；用单色 + 透明度表达状态。
- **Don't**：渐变背景、阴影堆叠、emoji 装饰、3D 卡片翻转、装饰性插画。
- **可量化判据**：
  - 单屏主视觉元素 ≤ 3 个；
  - HUD 常驻元素 ≤ 5 个；
  - 单卡片信息层级 ≤ 2 层（标题 + 一行元数据）。

### 1.2 慢（Slow）
- **定义**：所有过渡至少 150ms；给用户留"看清变化"的时间。
- **Do**：相机阻尼 0.92、面板缓入 250ms、模态 250ms、Toast 250ms。
- **Don't**：瞬切 Tab、< 100ms 弹窗、闪屏过渡、自动轮播。
- **可量化判据**：所有 `transition-duration` 必须命中 §8.1 token，无 inline 自定义。

### 1.3 真实（Truthful）
- **定义**：地球纹理、光照、城市灯光、明信片场景都来自真实数据源或真实坐标。
- **Do**：日夜分界线按真实太阳位置计算；夜间灯光用 NASA Black Marble；城市点位用 Natural Earth。
- **Don't**：虚构城市坐标、修改光斑形状（用 shader 重画）、卡通星球、用 emoji 替代图标。
- **可量化判据**：所有出现在地球上的点位必须可在 Natural Earth / GeoNames 查到。

### 1.4 克制（Restraint）
- **定义**：v1 只做核心功能；其余列入 backlog 不写。
- **Do**：单条主时间轴；单一图层切换器；4 个主按钮 / 屏。
- **Don't**：塞满工具栏、加多 Tab、加内嵌推广、加彩蛋。
- **可量化判据**：单页按钮 ≤ 4 个；主导航 ≤ 5 项。

### 1.5 慢胜过快（Slow wins over Fast）
- **定义**：当"快"与"慢"冲突时，选"让用户慢下来看"的方案。
- **Do**：
  - 明信片详情页打开后强制 0.8s 静止展示再允许交互；
  - 首屏地球自转动画完整播完（≤3s）后才出现 HUD；
  - 城市详情 flyTo 不短于 800ms。
- **Don't**：自动播放、首屏轮播、"跳过介绍"按钮。
- **可量化判据**：所有"加载完成 → 首次可交互"之间留 ≥ 0.5s 静止。

### 1.6 暗色模式原生（Dark Mode First）
- **定义**：产品主视觉为暗色太空背景；亮色仅用于内容聚焦态（如明信片正面）。
- **Do**：默认画布 `#000`，HUD 用玻璃质感（见 §4.4）。
- **Don't**：白色大背景、明亮渐变 hero 区、亮色表格行。
- **可量化判据**：v1 **不实现** `[data-theme="light"]` 切换；任何组件默认样式都是暗色变体。

---

### 1.7 原则冲突仲裁表

| 冲突场景 | 仲裁结果 |
| --- | --- |
| 真实 vs 极简 | 真实胜（即使是复杂数据，也要保持界面元素的极简） |
| 慢 vs 极简 | 慢胜（过渡动画属于"必要功能"） |
| 克制 vs 慢胜过快 | 慢胜过快胜（必要的引导延迟不算功能膨胀） |
| 暗色原生 vs 真实 | 真实胜（明信片正面可以亮） |

## 2. 色彩系统

### 2.1 Token 命名约定

所有颜色通过 CSS Custom Properties 暴露，命名规则：

```
--color-{role}-{shade?}-{state?}
```

- `role`：`primary` / `accent` / `neutral` / `success` / `warning` / `error` / `info`
- `shade`：仅 neutral 与 primary / accent 使用，50–1000 数字阶梯
- `state`：可选，hover / active / focus / disabled

### 2.2 完整色板（一次性导出为 CSS）

```css
:root {
  /* ─── Primary · 深空蓝 ─── */
  --color-primary-300: #C7DEFF;
  --color-primary-400: #A6CCFF;
  --color-primary-500: #82C0FF; /* 品牌主色，CTA、链接 */
  --color-primary-600: #5BA8FF;
  --color-primary-700: #3D8FE8;
  --color-primary-hover:  var(--color-primary-400);
  --color-primary-active: var(--color-primary-600);

  /* ─── Accent · 暮色金 ─── */
  --color-accent-400: #F8C887;
  --color-accent-500: #F4B860; /* 强调点缀、明信片邮戳 */
  --color-accent-600: #D69A3A;

  /* ─── Neutral · 星灰 ─── */
  --color-neutral-0:    #FFFFFF; /* 最高对比（极少使用） */
  --color-neutral-50:   #F5F7FA; /* 高亮文字（明信片正面） */
  --color-neutral-100:  #E8EEF5; /* 主文字色 */
  --color-neutral-200:  #C7D0DB; /* 次级文字 */
  --color-neutral-400:  #6B7889; /* 辅助文字 */
  --color-neutral-600:  #3A4452; /* 弱化元素、分割线 */
  --color-neutral-800:  #1A1F2A; /* HUD 玻璃底 */
  --color-neutral-900:  #0F141B; /* 画布次底层 */
  --color-neutral-1000: #000000; /* 主画布，地球背景 */

  /* ─── Status · 语义色 ─── */
  --color-success: #4ADE80;
  --color-warning: #FBBF24;
  --color-error:   #F87171;
  --color-info:    var(--color-primary-500);

  /* ─── Layer（地球图层，§10 与 §5 联动） ─── */
  --color-layer-day:     #82C0FF;
  --color-layer-night:   #0A1A2F;
  --color-layer-aurora:  #5BA8FF;
  --color-layer-ice:     #C7E0FF;
}
```

### 2.3 主色（Primary · 深空蓝）

| Token | Hex | 用途 |
| --- | --- | --- |
| `--color-primary-300` | `#C7DEFF` | 极弱提亮（disabled 态 hover 模拟） |
| `--color-primary-400` | `#A6CCFF` | hover |
| `--color-primary-500` | `#82C0FF` | **品牌主色** · CTA、链接、激活态 |
| `--color-primary-600` | `#5BA8FF` | active |
| `--color-primary-700` | `#3D8FE8` | 强调按下 / 选中 ring |

### 2.4 辅色（Accent · 暮色金）

| Token | Hex | 用途 |
| --- | --- | --- |
| `--color-accent-400` | `#F8C887` | hover |
| `--color-accent-500` | `#F4B860` | **强调点缀** · 明信片邮戳、"已读"徽标 |
| `--color-accent-600` | `#D69A3A` | active |

### 2.5 中性色（Neutral · 星灰）

| Token | Hex | 对比度（vs `--color-neutral-1000`） | 用途 |
| --- | --- | --- | --- |
| `--color-neutral-50` | `#F5F7FA` | 17.9 : 1 | 明信片正面高亮文字 |
| `--color-neutral-100` | `#E8EEF5` | 14.8 : 1 | **主文字色** |
| `--color-neutral-200` | `#C7D0DB` | 11.2 : 1 | 次级文字 |
| `--color-neutral-400` | `#6B7889` | 4.7 : 1 | 辅助文字 |
| `--color-neutral-600` | `#3A4452` | — | 弱化元素、分割线（非文字） |
| `--color-neutral-800` | `#1A1F2A` | — | HUD 玻璃底 |
| `--color-neutral-900` | `#0F141B` | — | 画布次底层 |
| `--color-neutral-1000` | `#000000` | — | **主画布** |

### 2.6 状态色（Status）

| Token | Hex | 用途 | A11y 备注 |
| --- | --- | --- | --- |
| `--color-success` | `#4ADE80` | 寄信成功、已读、操作完成 | 不仅靠颜色，配 ✓ 图标 |
| `--color-warning` | `#FBBF24` | 警告、未保存、数据陈旧 | 配 ⚠ 图标 |
| `--color-error` | `#F87171` | 错误、网络失败、表单校验 | 配 ✕ 图标 |
| `--color-info` | `#5BA8FF` | 信息提示（= primary-500） | 配 ℹ 图标 |

### 2.7 暗色模式（默认且唯一）

- 本产品**只有暗色模式**；不实现浅色模式切换。
- 所有 `--color-*` token 已按暗色优化，**无需** `[data-theme="light"]` 切换。
- 唯一允许"亮"出现的位置：**明信片正面**（用户输入内容）。

### 2.8 对比度要求（WCAG 2.1 AA）

| 场景 | 最小对比度 | 实测 | 通过 |
| --- | --- | --- | --- |
| 正文（neutral-100 on neutral-1000） | 4.5 : 1 | 14.8 : 1 | ✅ |
| 次要文字（neutral-200 on neutral-1000） | 4.5 : 1 | 11.2 : 1 | ✅ |
| 辅助文字（neutral-400 on neutral-1000） | 4.5 : 1 | 4.7 : 1 | ✅（临界） |
| CTA 文字（neutral-1000 on primary-500） | 4.5 : 1 | 6.3 : 1 | ✅ |
| 状态色文字 | 3 : 1 | 待测 | ⚠ |

> 实现时需用 axe-core 复测；所有 critical 错误必须为 0。

### 2.9 颜色使用禁令

| 禁令 | 原因 |
| --- | --- |
| ❌ 在主画布（neutral-1000）上使用纯白（neutral-0） | 太空背景须保持深色，纯白过曝 |
| ❌ 用纯色块传达信息而不配图标 / 文字 | 色盲可达性（A11y） |
| ❌ 透明渐变作为按钮背景 | 与 §1.1 极简冲突 |
| ❌ 同时启用 3 种以上高饱和色 | 视觉熵增 |

## 3. 字体系统

### 3.1 字体族（Font Families）

| 用途 | 字体栈 | 备注 |
| --- | --- | --- |
| 中文 UI | `"Noto Serif SC", "Source Han Serif SC", "Songti SC", serif` | 宋体让"地球感"更沉，与暗色画布匹配 |
| 中文 fallback | `"PingFang SC", "Microsoft YaHei", sans-serif` | 旧系统兜底 |
| 英文 UI | `"Inter", "Söhne", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif` | 仅 UI 文案使用 |
| 数字（时间/坐标/版本号） | `"JetBrains Mono", "IBM Plex Mono", ui-monospace, "SF Mono", Consolas, monospace` | 表格对齐感 |
| 明信片正文（手写感） | `"Caveat", "Liu Jian Mao Cao", "Ma Shan Zheng", cursive` | 仅 §12 明信片正面使用 |

```css
:root {
  --font-ui:        var(--font-ui-zh), var(--font-ui-en);
  --font-ui-en:     "Inter", "Söhne", -apple-system, system-ui, sans-serif;
  --font-ui-zh:     "Noto Serif SC", "Source Han Serif SC", serif;
  --font-mono:      "JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace;
  --font-handwrite: "Caveat", "Liu Jian Mao Cao", cursive;
}
```

### 3.2 字号阶梯（Type Scale · 1.25 倍率）

| Token | px / rem | 行高（px） | 字间距 | 用途 |
| --- | --- | --- | --- | --- |
| `--text-xs` | 12 / 0.75 | 16 | 0 | 标签、时间戳、Tag |
| `--text-sm` | 14 / 0.875 | 20 | 0 | 辅助文字、表单 helper |
| `--text-base` | 16 / 1.0 | 24 | 0 | **正文** |
| `--text-md` | 18 / 1.125 | 26 | 0 | 强调正文 |
| `--text-lg` | 20 / 1.25 | 28 | -0.01em | 卡片标题 |
| `--text-xl` | 24 / 1.5 | 32 | -0.01em | 区块标题 |
| `--text-2xl` | 32 / 2.0 | 40 | -0.015em | 页面副标题 |
| `--text-3xl` | 40 / 2.5 | 48 | -0.02em | 页面主标题 |
| `--text-display` | 64 / 4.0 | 72 | -0.03em | 首屏显示文字（仅首页） |

### 3.3 字重（Font Weight）

| Token | Weight | 用途 |
| --- | --- | --- |
| `--weight-regular` | 400 | 正文 |
| `--weight-medium` | 500 | 强调、按钮文字 |
| `--weight-semibold` | 600 | 标题 |
| ~~`--weight-bold`~~ | ~~700~~ | **不使用**（与 §1.1 极简冲突） |

### 3.4 排版规则

| 项 | 规则 |
| --- | --- |
| 中文行高比 | 1.6 |
| 英文行高比 | 1.5 |
| 中文字间距 | 0 |
| 英文字间距 | -0.01em（标题） / 0（正文） |
| 中文行宽 | ≤ 30 字 / 行 |
| 英文行宽 | ≤ 60 字符 / 行 |
| 段落间距 | `--space-4`（16px） |
| 标题与正文间距 | `--space-2`（8px） |
| 标题级别间距 | `--space-6`（24px） |

### 3.5 数字与坐标展示规则

| 场景 | 字体 | 对齐 | 示例 |
| --- | --- | --- | --- |
| 时间（卡片 / 浮层） | `--font-mono` | 左对齐 | `16:42 · UTC+09:00` |
| 经纬度 | `--font-mono` | 左对齐 | `35.6762° N, 139.6503° E` |
| 倒计时 | `--font-mono` | 居中 | `00 : 02 : 14` |
| 版本号 / 数字统计 | `--font-mono` | 右对齐（表格中） | `v1.0.0` |
| 大数字（统计） | `--font-ui` | 居中 | `142`（寄出明信片数） |

### 3.6 字体加载策略

```html
<!-- 预连接 + 异步加载，避免 FOIT -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Noto+Serif+SC:wght@400;500;600&family=Caveat:wght@400;500&display=swap"
      media="print" onload="this.media='all'">
```

- 字体文件本地化备份到 `public/fonts/`（避免运行时断网）。
- 使用 `font-display: swap`（已含 `display=swap` 参数）。
- 中文字体**只切子集**（按 GB2312 一二级常用字 + Unicode CJK 扩展 4 字），体积控制在 ≤ 200 KB / 字重。

### 3.7 字号使用禁令

| 禁令 | 原因 |
| --- | --- |
| ❌ 同一屏混用 3 种以上字号 | 与 §1.1 极简冲突 |
| ❌ 在 UI 文本中使用 `font-weight: 700` | 与 §1.1 极简冲突 |
| ❌ 中文字体用 sans-serif 主调（黑体） | 与暗色太空调性冲突 |
| ❌ 数字使用衬线字体 | 与 §3.5 对齐感冲突 |

## 4. 间距 / 圆角 / 阴影

### 4.1 间距系统（8 倍数 · Spacing）

> 所有间距必须是 `--space-*` token，禁止任意 px 值。

| Token | px | rem | 典型用途 |
| --- | --- | --- | --- |
| `--space-0` | 0 | 0 | reset |
| `--space-1` | 4 | 0.25 | 紧凑元素（Tag 内边距、icon 与文字） |
| `--space-2` | 8 | 0.5 | 内联元素、段落内强调 |
| `--space-3` | 12 | 0.75 | 小组件内边距（Input、Button 垂直） |
| `--space-4` | 16 | 1.0 | **卡片内边距** · 段落间距 |
| `--space-6` | 24 | 1.5 | 模块间距 · 区块内分组 |
| `--space-8` | 32 | 2.0 | 区块间距 · 卡片间距 |
| `--space-12` | 48 | 3.0 | 大区块间距 · 模态内边距 |
| `--space-16` | 64 | 4.0 | 页面边距 · 浮层内边距 |
| `--space-24` | 96 | 6.0 | 全屏分区 · 空状态垂直留白 |
| `--space-32` | 128 | 8.0 | 极端留白（首屏 hero 留白） |

```css
:root {
  --space-0:   0;
  --space-1:   4px;
  --space-2:   8px;
  --space-3:   12px;
  --space-4:   16px;
  --space-6:   24px;
  --space-8:   32px;
  --space-12:  48px;
  --space-16:  64px;
  --space-24:  96px;
  --space-32:  128px;
}
```

### 4.2 圆角阶梯（Radius）

| Token | px | 典型用途 |
| --- | --- | --- |
| `--radius-sm` | 4 | Tag、Badge |
| `--radius-md` | 8 | Button、Input、Checkbox |
| `--radius-lg` | 12 | **Card** · Dropdown 菜单 |
| `--radius-xl` | 16 | Modal、Postcard 正面 |
| `--radius-2xl` | 24 | 大卡片 · EmptyState 容器 |
| `--radius-full` | 9999 | 头像 · 圆形播放按钮 · 邮戳 |

```css
:root {
  --radius-sm:   4px;
  --radius-md:   8px;
  --radius-lg:   12px;
  --radius-xl:   16px;
  --radius-2xl:  24px;
  --radius-full: 9999px;
}
```

### 4.3 阴影层级（Elevation）

> 暗色模式下阴影承担**深度提示**作用。深色背景需要更"实"的阴影（更高 alpha），并配 8% 透明的内描边模拟边缘高光。

| Token | 阴影值 | 用途 |
| --- | --- | --- |
| `--shadow-none` | `none` | 平面元素 · 嵌入式 UI |
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.4)` | 卡片默认 / hover 提亮 |
| `--shadow-md` | `0 4px 12px rgba(0,0,0,0.5)` | 浮层 · Tag · Tooltip |
| `--shadow-lg` | `0 8px 24px rgba(0,0,0,0.6)` | Modal · Dropdown 菜单 |
| `--shadow-xl` | `0 16px 48px rgba(0,0,0,0.7)` | 全屏 sheet · Toast 队列 |
| `--shadow-glow-primary` | `0 0 24px rgba(91,168,255,0.4)` | **CTA 主按钮光晕** |

### 4.4 HUD 玻璃质感（Backdrop）

HUD（顶部条、底部时间轴、模态、Tooltip）一律使用以下玻璃质感：

```css
.hud {
  background: rgba(15, 20, 27, 0.55);          /* neutral-900 @ 55% */
  backdrop-filter: blur(20px) saturate(140%);
  -webkit-backdrop-filter: blur(20px) saturate(140%);
  border: 1px solid rgba(232, 238, 245, 0.08); /* neutral-100 @ 8% */
  border-radius: var(--radius-lg);
}
```

**注意事项**：
- `backdrop-filter` 在 Firefox 103 之前不支持，需提供 `@supports not (backdrop-filter: blur(20px))` 降级为实色 `rgba(15,20,27,0.92)`。
- 玻璃层**不能**叠超过 2 层（性能）。

### 4.5 Z-Index 层级（Z-Stack）

| Token | 数值 | 用途 |
| --- | --- | --- |
| `--z-canvas` | 0 | 地球 Canvas |
| `--z-base` | 10 | 页面基础内容 |
| `--z-hud` | 50 | TopBar / TimeBar |
| `--z-dropdown` | 100 | Dropdown / Tooltip |
| `--z-modal` | 1000 | Modal 容器 |
| `--z-toast` | 1100 | 全局 Toast |
| `--z-tooltip` | 1200 | Tooltip（高于 Toast） |

### 4.6 边框与分割线

| 用途 | 规格 |
| --- | --- |
| 输入框边框 | `1px solid var(--color-neutral-600)` |
| 输入框 focus | `1px solid var(--color-primary-500)` + 外环 2px primary-500 @ 20% |
| 卡片边框（可选） | `1px solid rgba(232, 238, 245, 0.06)` |
| 分割线（横） | `1px solid var(--color-neutral-600)` 或 `rgba(232, 238, 245, 0.06)` |
| 分割线（竖） | 同上 |

### 4.7 间距使用禁令

| 禁令 | 原因 |
| --- | --- |
| ❌ 使用任意 px 间距（如 `padding: 13px`） | 违反 8 倍数系统 |
| ❌ 同一组件内边距用 3 个不同 token（如 `12 / 14 / 16`） | 视觉熵增 |
| ❌ 圆角超过 `--radius-2xl`（24px） | 违反 §1.1 极简 |
| ❌ 阴影使用彩色（如绿色阴影） | 与暗色调性冲突 |

## 5. 组件库（8 类 · 完整规格）

> 每个组件包含：**Anatomy（结构）**、**Variants（变体）**、**Sizes（尺寸）**、**States（状态）**、**Props（属性）**、**Code（CSS / TS 雏形）**、**A11y（无障碍）**。
> 所有组件必须实现 §9 列出的 9 种状态。

---

### 5.1 Button（按钮）

#### Anatomy（结构）

```
┌────────────────────────────────┐
│ [iconLeft]  Label  [iconRight] │  ← horizontal padding: space-3
└────────────────────────────────┘
   ↑ height 按 size 决定
```

#### Variants（变体）

| Variant | 背景 | 文字 | 边框 | 用途 |
| --- | --- | --- | --- | --- |
| `primary` | `--color-primary-500` | `--color-neutral-1000` | none | 主操作（寄出明信片、保存） |
| `secondary` | transparent | `--color-primary-500` | 1px primary-500 | 次操作（取消、返回） |
| `ghost` | transparent | `--color-neutral-100` | none | 弱操作（关闭、更多） |
| `danger` | transparent | `--color-error` | 1px error | 危险操作（删除） |

#### Sizes（尺寸）

| Size | 高度 | 横向 padding | 字号 | 圆角 |
| --- | --- | --- | --- | --- |
| `sm` | 32px | `--space-3` | `--text-sm` | `--radius-md` |
| `md` | 40px | `--space-4` | `--text-base` | `--radius-md` |
| `lg` | 48px | `--space-6` | `--text-md` | `--radius-lg` |

#### States

- **default** → 见上表
- **hover** → primary 变 primary-400；secondary 边框变 primary-400；ghost 背景 `rgba(232,238,245,0.04)`
- **active** → primary 变 primary-600；其他 border 加深 1 色阶；整体 `transform: scale(0.98)`
- **focus** → 见 §10.1 焦点环
- **disabled** → opacity 0.4，cursor `not-allowed`，无 hover 效果
- **loading** → 内容替换为 `<Spinner size="sm" />` + "加载中"（仅 primary 启用）

#### Props

```ts
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
}
```

#### A11y
- 使用原生 `<button>`；loading 时 `aria-busy="true"`；disabled 时 `aria-disabled="true"`。
- 仅图标按钮（无文字）必须 `aria-label`。
- 焦点环见 §10.1。

---

### 5.2 Card（卡片）

#### Anatomy

```
┌──────────────────────────────┐
│ [media（可选）]               │  ← 16:9 / 4:3
├──────────────────────────────┤
│  Title                        │  ← text-lg
│  Subtitle                     │  ← text-sm neutral-200
│  ───────                      │
│  [content body]               │
│  [action（右对齐）]            │
└──────────────────────────────┘
```

#### Variants

| Variant | 背景 | 边框 | 阴影 | hover | 用途 |
| --- | --- | --- | --- | --- | --- |
| `flat` | `--color-neutral-900` | none | none | 无 | 列表项、设置分组 |
| `interactive` | `--color-neutral-800` | 1px neutral-600 | `--shadow-sm` | 升起 + 边框变 primary-500 @ 40% | 可点击卡片 |
| `feature` | `--color-neutral-900` | none | `--shadow-md` | 无 | 大型展示卡片（首页 hero） |
| `glass` | `rgba(15,20,27,0.55)` + blur | 1px neutral-100 @ 8% | none | 边框变 primary-500 @ 40% | 浮于画布上的卡片 |

#### Props

```ts
interface CardProps {
  variant?: 'flat' | 'interactive' | 'feature' | 'glass';
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  media?: { src: string; alt: string; ratio?: '16:9' | '4:3' | '1:1' };
  action?: React.ReactNode;
  onClick?: () => void;
  children?: React.ReactNode;
}
```

#### A11y
- `interactive` 卡片若整卡可点击，外层 `<button>` 包裹；若仅主操作可点击，使用 `<article>` + 内置 `<button>`。

---

### 5.3 Input（输入框）

#### Anatomy

```
┌──────────────────────────────┐
│  Label                         │  ← 标签（独立或内嵌）
│  ┌──────────────────────────┐ │
│  │ [iconLeft] [placeholder] [iconRight] │ │
│  └──────────────────────────┘ │
│  helperText                    │  ← text-sm neutral-200
│  errorText（出错时）           │  ← text-sm error
└──────────────────────────────┘
```

#### Variants

| Variant | 边框 | 背景 | 用途 |
| --- | --- | --- | --- |
| `default` | 1px neutral-600 | neutral-900 | 标准输入 |
| `filled` | none | neutral-800 | 嵌入式输入（如搜索框） |
| `floating` | 1px neutral-600 | transparent | Material 风浮动标签（v1 不推荐） |

#### Sizes

| Size | 高度 | padding | 字号 |
| --- | --- | --- | --- |
| `sm` | 32px | `--space-2 --space-3` | `--text-sm` |
| `md` | 40px | `--space-3 --space-4` | `--text-base` |
| `lg` | 48px | `--space-4 --space-6` | `--text-md` |

#### States

| State | 视觉 |
| --- | --- |
| default | 1px neutral-600 |
| hover | 1px neutral-400 |
| focus | 1px primary-500 + 外环 `0 0 0 2px rgba(91,168,255,0.2)` |
| error | 1px error + 外环 `0 0 0 2px rgba(248,113,113,0.2)` |
| disabled | opacity 0.4，cursor not-allowed |
| readonly | background neutral-800，cursor default |

#### Props

```ts
interface InputProps {
  variant?: 'default' | 'filled';
  size?: 'sm' | 'md' | 'lg';
  type?: 'text' | 'email' | 'password' | 'search' | 'url' | 'tel' | 'number';
  label?: string;            // 不传则使用 aria-label
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  helperText?: string;
  error?: string;            // 设置后自动切换到 error 态
  disabled?: boolean;
  readOnly?: boolean;
  maxLength?: number;
  showCount?: boolean;       // 显示 "12/200"
  required?: boolean;
}
```

#### A11y
- `<label>` 必须显式关联（`htmlFor` 或包裹）。
- `error` 必须同步设置 `aria-invalid="true"` 与 `aria-describedby` 指向错误文案。
- `required` 必须设置 `aria-required="true"`。

---

### 5.4 Modal（模态）

#### Anatomy

```
┌────────────────────────────────┐
│  Title                       [×]│  ← header 56px
├────────────────────────────────┤
│                                 │
│  Body content                    │  ← padding space-12
│                                 │
├────────────────────────────────┤
│       [Cancel]    [Confirm]     │  ← footer 64px, 右对齐
└────────────────────────────────┘
```

#### Sizes

| Size | 最大宽度 |
| --- | --- |
| `sm` | 400px |
| `md` | 560px |
| `lg` | 720px |
| `full` | 960px（仅重要流程） |

#### 背景遮罩

```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
}
```

#### 入场 / 退场

- 入场：`opacity 0→1` + `scale 0.96→1`，`--duration-base`，`--ease-emphatic`
- 退场：`opacity 1→0` + `scale 1→0.96`，`--duration-fast`，`--ease-accelerate`

#### Props

```ts
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  size?: 'sm' | 'md' | 'lg' | 'full';
  children: React.ReactNode;
  footer?: React.ReactNode;
  closable?: boolean;      // 显示 × 按钮，默认 true
  maskClosable?: boolean;  // 点击遮罩关闭，默认 true
}
```

#### A11y
- 容器 `role="dialog"` + `aria-modal="true"`。
- `aria-labelledby` 指向 Title。
- 焦点陷阱（Focus Trap）：打开时焦点移到内首个可聚焦元素；关闭时还原到打开前。
- Esc 关闭（除非 `closable={false}`）。

---

### 5.5 Navigation（导航）

#### 5.5.1 TopBar（顶部条）

```
┌────────────────────────────────────────────────┐
│ [Logo 看见地球]                  [图层▾] [?] [👤] │  ← height 56px, glass
└────────────────────────────────────────────────┘
```

- **高度**：56px
- **背景**：§4.4 玻璃质感
- **左**：Logo（点击回首页初始视角）+ 项目名
- **右**：图层切换按钮（`secondary` variant）、帮助按钮（`ghost`，`?` 图标）、用户头像（48×48，`--radius-full`）

#### 5.5.2 TabBar（页内标签）

```
┌────────────────────────────────┐
│ [Tab 1] [Tab 2] [Tab 3]          │  ← 48px, 下划线指示器
└────────────────────────────────┘
```

- 高度 48px；指示器 2px，激活色 `--color-primary-500`，切换时长 `--duration-base`。
- Tab 之间间距 `--space-6`；首尾到边缘 `--space-8`。

#### 5.5.3 Stepper（步骤条 · 仅寄明信片使用）

```
(1)───(2)───(3)
选择   写内容   寄出
```

- 步骤节点 32px 圆形，当前步骤 `--color-primary-500`，已完成步骤 `--color-success`，未开始 `--color-neutral-600`。
- 连接线 1px，已完成段 `--color-success`。

#### Props（TopBar）

```ts
interface TopBarProps {
  logo?: React.ReactNode;
  rightActions?: React.ReactNode[];   // 默认：图层、帮助、头像
  onLogoClick?: () => void;           // 默认：飞回初始视角
}
```

---

### 5.6 Loading（加载）

#### 5.6.1 Spinner（旋转圆环）

```css
.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid rgba(91, 168, 255, 0.2);
  border-top-color: var(--color-primary-500);
  border-radius: var(--radius-full);
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
```

- 尺寸：`sm` 16px / `md` 24px（默认） / `lg` 40px
- 颜色继承 `currentColor`，默认 `--color-primary-500`

#### 5.6.2 Skeleton（占位骨架）

```css
.skeleton {
  background: var(--color-neutral-800);
  border-radius: var(--radius-md);
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}
@keyframes skeleton-pulse {
  0%, 100% { opacity: 0.4; }
  50%      { opacity: 0.7; }
}
```

- 形状：`text`（条） / `circle`（圆） / `rect`（矩形）

#### 5.6.3 ProgressBar（线性进度）

- 高度 4px；背景 `--color-neutral-600`；填充 `--color-primary-500`；圆角 `--radius-full`。
- 可选 `indeterminate` 状态：填充从左滑到右，循环 1.5s。

---

### 5.7 EmptyState（空状态）

#### Anatomy

```
┌──────────────────────────────────────┐
│                                      │
│              [Icon 48px]              │
│                                      │
│            你还没有寄出过明信片        │  ← text-md
│       挑一个城市，把此刻寄给朋友吧      │  ← text-sm neutral-200
│                                      │
│           [寄出第一张]                 │  ← primary md
│                                      │
└──────────────────────────────────────┘
```

- 垂直居中（min-height 320px）；最大宽度 400px；左右居中。
- 图标：`--color-neutral-400`；CTA：`primary` variant `md` size。

#### Props

```ts
interface EmptyStateProps {
  icon: React.ReactNode;       // 必填，使用图标库
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}
```

---

### 5.8 Tag（标签）

#### Anatomy

```
┌────────────────┐
│ [icon] Label [×]│  ← height 24px, padding space-1 space-2
└────────────────┘
```

#### Variants

| Variant | 背景 | 文字 | 边框 | 用途 |
| --- | --- | --- | --- | --- |
| `default` | `--color-neutral-800` | `--color-neutral-100` | none | 中性标签 |
| `primary` | `rgba(91,168,255,0.12)` | `--color-primary-400` | none | 强调（"新"） |
| `success` | `rgba(74,222,128,0.12)` | `--color-success` | none | 成功（"已寄出"） |
| `warning` | `rgba(251,191,36,0.12)` | `--color-warning` | none | 警告 |
| `error` | `rgba(248,113,113,0.12)` | `--color-error` | none | 错误 |
| `outline` | transparent | `--color-neutral-100` | 1px neutral-600 | 弱化标签 |

#### Props

```ts
interface TagProps {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'outline';
  iconLeft?: React.ReactNode;
  onClose?: () => void;        // 设置后显示 × 按钮
  children: React.ReactNode;
}
```

#### A11y
- 关闭按钮 `aria-label="移除标签 <label>"`。

---

### 5.9 组件使用禁令

| 禁令 | 原因 |
| --- | --- |
| ❌ 自造按钮（如 `<div onClick>`） | 与 §10 A11y 冲突 |
| ❌ 同一页面按钮 ≥ 4 个 | 与 §1.4 克制冲突 |
| ❌ 输入框无 label | A11y 必备 |
| ❌ 模态叠模态 | 与 §1.1 极简冲突 |
| ❌ Loading 转圈超过 10s 无降级 | UX 灾难，必须配 Skeleton 或进度文案 |

## 6. 8 个页面线框

> 每页 = **ASCII 线框** + **详细规格**（区块 / 元素 / 状态 / 动效）。
> 所有页面统一使用 TopBar + 主区域 +（可选）底部条结构。

---

### 6.1 首页（Home）

#### ASCII 线框

```
┌────────────────────────────────────────────────────────┐
│ [Logo] 看见地球                  [图层▾]  [?]  [👤]   │  ← TopBar 56px
├────────────────────────────────────────────────────────┤
│                                                         │
│                                                         │
│                                                         │
│                                                         │
│                  ╭─────────────╮                        │
│                 ╱               ╲                       │
│                │    EARTH        │                       │  ← Canvas 占满
│                │   ◐ ◑  ◐        │                       │
│                │    ◑            │                       │
│                 ╲               ╱                        │
│                  ╰─────────────╯                        │
│                                                         │
│                                                         │
│                                                         │
│                                                         │
├────────────────────────────────────────────────────────┤
│ ◀ ━━━━●━━━━━━━━━━━ ▶                  [▶  1×  ▾]      │  ← TimeBar 64px
│   1900   1950   2000   2026  UTC+08:00                  │
└────────────────────────────────────────────────────────┘
```

#### 详细规格

| 区块 | 规格 |
| --- | --- |
| **背景** | `--color-neutral-1000` |
| **TopBar** | §4.4 玻璃，z-index 50 |
| **Canvas** | 全屏自适应，最大高度 = `视口 - 56px - 64px` |
| **TimeBar** | §4.4 玻璃，高 64px，含播放/暂停、速率选择、时间标签 |
| **Loading** | 仅首屏 < 2s 出现，居中 Spinner + "正在加载地球…"（text-sm neutral-200） |
| **图层切换器** | TopBar 右侧 `secondary` Button，点击展开 Dropdown（云、海冰、夜间灯光） |
| **帮助按钮** | `?` 图标，点击打开 Modal 显示 §10.4 快捷键 |
| **首屏入场** | 地球自转 3s → HUD 淡入（`--duration-slow`，`--ease-decelerate`） |
| **空状态** | 无（地球必须始终渲染） |

#### 交互

- 鼠标拖拽 = 旋转（damping 0.92）
- 滚轮 = 缩放（高度范围 100 km ~ 50000 km）
- Shift + 拖拽 = 俯仰（0~90°）
- 双击地点 = flyTo（`--duration-cinematic`，`--ease-standard`）
- 点击地球任意点 = 打开 §6.2 城市详情（如果命中预设城市）或点位浮层

---

### 6.2 城市详情（City Detail）

#### ASCII 线框

```
┌────────────────────────────────────────────────────────┐
│ [←]   城市详情                            [♥] [⤴]    │  ← TopBar 56px
├────────────────────────────────────────────────────────┤
│ ┌──────────────────┐ ┌─────────────────────────────┐  │
│ │                  │ │ 东京                          │  │  ← Title text-3xl
│ │  [城市主图]       │ │ Tokyo, JP · UTC+9            │  │  ← Subtitle text-md neutral-200
│ │  16:9 占位        │ │                               │  │
│ │                  │ │ 现在 16:42 · 日落 18:24       │  │  ← meta text-base
│ │                  │ │ 晴 · 19°C · 风 4 m/s          │  │
│ └──────────────────┘ └─────────────────────────────┘  │
│                                                          │
│ [坐标] 35.6762° N, 139.6503° E                          │  ← mono text-sm
│                                                          │
│ ─────────────────────────────────────────                │  ← divider
│ 此刻此地 · 数据图层                                       │  ← text-lg
│ [昼夜▾] [云层] [海冰] [夜间灯光]                          │  ← 图层 chips (Tag)
│ ─────────────────────────────────────────                │
│                                                          │
│            [📮 寄一张明信片]                              │  ← primary lg, fullWidth
│                                                          │
└────────────────────────────────────────────────────────┘
```

#### 详细规格

| 区块 | 规格 |
| --- | --- |
| **TopBar 关闭按钮** | `←` ghost Button，点击回首页（保留相机视角） |
| **主图** | 用户当前视角截图或预渲染城市 hero；16:9；`--radius-lg`；`--shadow-md` |
| **元数据卡** | `glass` Card variant；padding `--space-6` |
| **坐标** | `--font-mono`，`--text-sm`，`--color-neutral-200` |
| **图层 chips** | Tag `outline` variant，点击切换（互斥单选） |
| **寄明信片 CTA** | `primary` variant `lg` size，`fullWidth` |
| **入场动效** | 从首页城市坐标 flyTo，1.2s（`--duration-cinematic` + 200ms），`--ease-decelerate` |
| **分享按钮（⤴）** | ghost Button，点击复制当前 URL（含 §11 URL 状态） |
| **收藏按钮（♥）** | ghost Button，激活时 `accent-500` |

#### 状态

- **default** → 见上
- **loading**（拉取城市数据）→ 主图位置显示 Skeleton（rect 16:9）
- **error**（网络失败）→ 主图位置 EmptyState "信号中断"+ 重试按钮
- **未命中预设城市** → 显示点位浮层（lat / lon + UTC 时间 + 太阳高度），不显示城市卡片

---

### 6.3 我的（My）

#### ASCII 线框

```
┌────────────────────────────────────────────────────────┐
│ [Logo] 看见地球                  [图层▾]  [?]  [👤]   │  ← TopBar
├────────────────────────────────────────────────────────┤
│                                                         │
│                       [👤 96px]                          │
│                       lwy                                │  ← text-2xl
│                       寄出地球的人                        │  ← text-sm neutral-200
│                                                         │
│         ┌─────────┐  ┌─────────┐  ┌─────────┐          │
│         │   142   │  │   58    │  │   23    │           │  ← text-display
│         │  寄出    │  │  收到   │  │  收藏   │           │  ← text-sm
│         └─────────┘  └─────────┘  └─────────┘           │
│                                                         │
│  [明信片]  [收藏]  [数据贡献]                              │  ← TabBar
│  ─────────                                                │
│                                                         │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                    │
│  │ 缩略 │ │ 缩略 │ │ 缩略 │ │ 缩略 │                     │  ← 卡片网格（双列瀑布流）
│  │ 缩略 │ │ 缩略 │ │ 缩略 │ │ 缩略 │                     │
│  └──────┘ └──────┘ └──────┘ └──────┘                    │
│                                                         │
└────────────────────────────────────────────────────────┘
```

#### 详细规格

| 区块 | 规格 |
| --- | --- |
| **头像** | 96×96，`--radius-full`，1px 边框 `--color-neutral-600` |
| **统计区** | 三等分（flex 1:1:1），数字 `--text-display`，标签 `--text-sm neutral-200` |
| **TabBar** | §5.5.2，默认激活"明信片" |
| **卡片网格** | 双列瀑布流（CSS columns 或 grid）；卡片 = §6.4 寄出的明信片缩略图 Card |
| **卡片内容** | 明信片正面缩略图（4:3）+ 城市 + 日期（mono） |
| **入场动效** | 从首页或上页淡入（`--duration-base`，`--ease-standard`） |

---

### 6.4 寄明信片（Send Postcard）

#### ASCII 线框（三步式）

```
┌────────────────────────────────────────────────────────┐
│ [×]   寄明信片                                           │  ← 关闭 = 二次确认
├────────────────────────────────────────────────────────┤
│  (1) ─────── (2) ─────── (3)                            │  ← §5.5.3 Stepper
│  选择地点    写内容    寄出                              │
│                                                         │
│ ┌─────────────────────────────────────────────────┐    │
│ │                                                  │    │
│ │           [地图缩略图 / 城市卡片]                  │    │  ← 步骤 1
│ │                                                  │    │
│ │  📍 35.6762° N, 139.6503° E  [搜索/调整 ▾]       │    │
│ │                                                  │    │
│ └─────────────────────────────────────────────────┘    │
│                                                         │
├────────────────────────────────────────────────────────┤
│                       [上一步]    [下一步 →]            │  ← sticky footer
└────────────────────────────────────────────────────────┘
```

#### 步骤详细规格

**步骤 1 · 选择地点**：
- 自动填入当前城市坐标（从 §6.2 传入）。
- "搜索/调整"按钮展开 Dropdown：搜索框 + ±0.5° 微调滑块。
- 下一步按钮 disabled 直到地点确认。

**步骤 2 · 写内容**：

```
┌──────────────────────────────────────────┐
│  邮票：  [○ 经典]  [○ 复古]  [○ 暗夜]      │  ← radio
│  边框：  [○ 白边]  [○ 米色]  [○ 金边]      │  ← radio
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │ 在这里写下你想说的话…                  │ │  ← textarea
│  │                                      │ │  ← Caveat 18px
│  │                                      │ │
│  │                                      │  ← 0/200
│  └──────────────────────────────────────┘ │
│  12 / 200                                │
└──────────────────────────────────────────┘
```

- textarea：`--font-handwrite`，`--text-md`，`--radius-lg`，`--space-4` padding。
- `showCount` 启用，显示 `当前字符 / 200`。
- 邮票 / 边框选择：3 个 radio 卡片（80×100 缩略图）。
- 下一步按钮 disabled 直到字数 ≥ 1 且 ≤ 200。

**步骤 3 · 寄出**：

```
┌──────────────────────────────────────────┐
│  收件人：                                  │
│  [📮 email@example.com]                    │  ← Input type="email"
│                                            │
│  一句话祝福（可选）：                       │
│  [________________________]                │  ← Input maxLength 50
│                                            │
│  ────────────────                          │
│  预览：[明信片正面 200×280 缩略图]          │
│                                            │
└──────────────────────────────────────────┘
```

- 收件人 email 必填，error 自动校验。
- 预览区实时渲染明信片正面（按 §12 样式）。
- "寄出"按钮 `primary` variant `lg` size。

#### 通用

| 项 | 规格 |
| --- | --- |
| **关闭按钮（×）** | 若已生成明信片，点击弹 Modal "放弃这张明信片？"二次确认 |
| **上一步按钮** | `ghost` variant，回到上一步（不丢已填内容） |
| **下一步按钮** | `primary` variant，最后一步变"寄出" |
| **步骤切换动效** | `transform: translateX` + opacity，`--duration-base`，`--ease-emphatic` |

---

### 6.5 收件箱（Inbox）

#### ASCII 线框

```
┌────────────────────────────────────────────────────────┐
│ [Logo] 看见地球                  [图层▾]  [?]  [👤]   │  ← TopBar
├────────────────────────────────────────────────────────┤
│  收件箱                                  [筛选▾] [↻]   │  ← 页面头 64px
│  12 封未读 · 共 58 封                                     │  ← text-sm neutral-200
│  ────────────────────────────────────                    │
│  ┌────┐  小明 · 寄自 东京                              │
│  │ 缩 │  8 月 3 日 · 已读                              │  ← Tag success "已读"
│  │ 略 │  这里的樱花刚开，替你看了一眼…                   │  ← 摘要 text-sm
│  └────┘                                                  │
│  ┌────┐  lwy · 寄自 巴黎                              │
│  │ 缩 │  8 月 5 日 · 未读                              │  ← Tag primary "未读"
│  │ 略 │  塞纳河畔的晚风刚刚好。                          │
│  └────┘                                                  │
│  ...                                                     │
├────────────────────────────────────────────────────────┤
│                                  [加载更多]              │
└────────────────────────────────────────────────────────┘
```

#### 详细规格

| 区块 | 规格 |
| --- | --- |
| **页面头** | 标题 `--text-2xl` + 副标题 `--text-sm neutral-200` |
| **筛选按钮** | `secondary` Button，展开 Dropdown（全部 / 未读 / 已读） |
| **列表项** | 左：明信片缩略图（80×120，4:3）；右：发件人 + 城市 + 日期 + 摘要；高 96px；分割线 1px neutral-600 |
| **未读标识** | 左侧 4px 宽 `--color-primary-500` 竖条 + Tag `primary` |
| **多选模式** | 长按 0.5s 进入多选；底部 sticky footer 显示 [标记已读] [删除] [取消] |
| **加载更多** | 滚动到底部自动加载 20 条；Spinner skeleton；无更多时显示"已全部加载" |

#### 状态

- **default** → 见上
- **empty** → EmptyState（§5.7）：图标 ✉️ + "还没有收到明信片" + "去探索地球"
- **loading** → 列表 Skeleton（5 行）

---

### 6.6 贡献（Contribute）

#### ASCII 线框

```
┌────────────────────────────────────────────────────────┐
│ [Logo] 看见地球                  [图层▾]  [?]  [👤]   │  ← TopBar
├────────────────────────────────────────────────────────┤
│  让地球更准确                                              │  ← text-3xl
│  你提交的每一条数据都会被匿名合并进下一版地球                │  ← text-md neutral-200
│                                                         │
│  本月贡献 Top 10                                          │  ← text-lg
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐                    │
│  │ 1  │ │ 2  │ │ 3  │ │ 4  │ │ 5  │  ← 排行榜         │
│  └────┘ └────┘ └────┘ └────┘ └────┘                    │
│                                                         │
│  选择贡献方式：                                            │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐    │
│  │ 📍 城市纠错   │ │ 📷 拍照贡献   │ │ 🌐 翻译贡献   │    │  ← 三栏卡片
│  │ 修正坐标、地名 │ │ 提供本地照片 │ │ 帮助 i18n    │    │
│  │ [立即开始]    │ │ [立即开始]    │ │ [立即开始]    │    │
│  └──────────────┘ └──────────────┘ └──────────────┘    │
└────────────────────────────────────────────────────────┘
```

#### 详细规格

| 区块 | 规格 |
| --- | --- |
| **页面头** | 标题 + 副标题，垂直间距 `--space-6` |
| **排行榜** | 5 列卡片，每卡 80×80 头像 + 昵称 + 贡献数 |
| **三栏卡片** | `interactive` Card variant，垂直间距 `--space-8`，CTA `primary` md |
| **贡献方式卡片** | 图标 32px + 标题 + 一行描述 + CTA |

---

### 6.7 设置（Settings）

#### ASCII 线框

```
┌────────────────────────────────────────────────────────┐
│ [Logo] 看见地球                  [图层▾]  [?]  [👤]   │  ← TopBar
├────────────────────────────────────────────────────────┤
│  设置                                                     │  ← text-2xl
│                                                         │
│  账户                                                    │  ← 分组标题 text-lg
│  ────                                                    │
│  昵称                                       [lwy     ✎] │
│  头像                                       [👤    换]  │  ← 列表项
│  邮箱                                       [l@x.com]   │
│                                                         │
│  偏好                                                    │
│  ────                                                    │
│  默认视图                                  [地球 ▾]     │  ← Select
│  时区                                       [UTC+8 ▾]   │
│  通知                                       [开关]       │  ← Switch
│                                                         │
│  隐私                                                    │
│  ────                                                    │
│  数据可见性                                [仅自己 ▾]  │
│  删除账号                                  [删除账号]    │  ← danger variant
│                                                         │
│  关于                                                    │
│  ────                                                    │
│  版本                                       v1.0.0      │
│  致谢                                                →  │
│  License                                          MIT  → │
└────────────────────────────────────────────────────────┘
```

#### 详细规格

| 区块 | 规格 |
| --- | --- |
| **分组** | 每组标题 `--text-lg` + 分隔线 + 列表项 |
| **列表项** | 高 56px；左 label `--text-base`；右 value / action |
| **Switch** | 默认 40×24，激活色 `--color-primary-500` |
| **Select** | 与 Input 一致，右侧 chevron 箭头 |
| **危险操作** | `danger` variant Button，仅"删除账号" |

#### Switch 组件（v1 临时规格）

```css
.switch {
  width: 40px;
  height: 24px;
  background: var(--color-neutral-600);
  border-radius: var(--radius-full);
  position: relative;
  cursor: pointer;
  transition: background var(--duration-fast) var(--ease-standard);
}
.switch.on  { background: var(--color-primary-500); }
.switch-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: var(--color-neutral-100);
  border-radius: var(--radius-full);
  transition: transform var(--duration-fast) var(--ease-standard);
}
.switch.on .switch-thumb { transform: translateX(16px); }
```

---

### 6.8 关于（About）

#### ASCII 线框

```
┌────────────────────────────────────────────────────────┐
│ [Logo] 看见地球                  [图层▾]  [?]  [👤]   │  ← TopBar
├────────────────────────────────────────────────────────┤
│                                                         │
│                       看见地球                            │  ← text-display
│                    让地球被重新看见                       │  ← text-md neutral-200
│                                                         │
│  ────────────────────────────────────                    │
│                                                         │
│  项目缘起                                                │
│  …（长文段落，maxWidth 720px）                            │
│                                                         │
│  灵感来源                                                │
│  NASA Visible Earth · Black Marble · Natural Earth       │
│                                                         │
│  团队                                                    │
│  lwy · Codex                                            │
│                                                         │
│  License                                                │
│  MIT（数据归属保留）                                      │
│                                                         │
│  版本                                                    │
│  v1.0.0 · 2026-08-05                                    │
│                                                         │
│  ────────────────────────────────────                    │
│  查看完整 Product Spec & Design Spec →                   │  ← 链接
│                                                         │
└────────────────────────────────────────────────────────┘
```

#### 详细规格

| 区块 | 规格 |
| --- | --- |
| **大标题** | `--text-display`，垂直居中（min-height 240px） |
| **段落** | max-width 720px；行高 1.6；间距 `--space-6` |
| **分组** | 标题 `--text-lg`，间距 `--space-8` |
| **链接** | `--color-primary-400`，hover `--color-primary-300` |
| **入场动效** | 整页 fade in（`--duration-slow`，`--ease-decelerate`），标题轻微向上 16px |

---

### 6.9 页面跳转矩阵

| From ↓ / To → | Home | City Detail | My | Send | Inbox | Contribute | Settings | About |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **Home** | — | 点击地球 | 用户 | 城市详情 → CTA | 用户 | TopBar → About | 用户 → 设置 | TopBar → About |
| **City Detail** | ← 按钮 | — | — | CTA | — | — | — | — |
| **My** | TopBar | — | — | 卡片"再寄一张" | Tab | — | 用户 → 设置 | TopBar |
| **Send** | × 二次确认 | — | — | — | — | — | — | — |
| **Inbox** | TopBar | — | — | — | — | — | 用户 → 设置 | TopBar |
| **Contribute** | TopBar | — | — | 卡片 → Send | — | — | 用户 → 设置 | TopBar |
| **Settings** | TopBar | — | — | — | — | — | — | 关于 |
| **About** | TopBar | — | — | — | — | — | 设置 | — |

## 7. 响应式断点

### 7.1 断点定义

| 断点 | 宽度范围 | 设备 | 主要变化 |
| --- | --- | --- | --- |
| `mobile` | < 640 px | 手机竖屏 | 单列；HUD 折叠；TopBar 仅 Logo + 用户 |
| `tablet` | 640–1023 px | 平板 / 手机横屏 / 小笔电 | 双列；Canvas 占 60% 视口；TopBar 完整 |
| `desktop` | 1024–1919 px | 笔记本 / 台机（**默认设计稿**） | 默认规格 |
| `wide` | ≥ 1920 px | 4K / 大屏 | Canvas 限定最大 1600px 高，居中 |

### 7.2 CSS 实现

```css
:root { --bp: desktop; }

@media (max-width: 1023px) { :root { --bp: tablet; } }
@media (max-width: 639px)  { :root { --bp: mobile; } }
@media (min-width: 1920px) { :root { --bp: wide; } }
```

```ts
// 运行时判断（仅用于必须用 JS 的场景）
function getBp(): 'mobile' | 'tablet' | 'desktop' | 'wide' {
  const w = window.innerWidth;
  if (w < 640)  return 'mobile';
  if (w < 1024) return 'tablet';
  if (w < 1920) return 'desktop';
  return 'wide';
}
```

### 7.3 各断点下的页面布局

| 页面 | mobile | tablet | desktop（默认） | wide |
| --- | --- | --- | --- | --- |
| **首页** | Canvas 占 50%；TimeBar 上移到顶部；HUD 折叠为浮按钮 | Canvas 占 60%；TopBar + 底部 TimeBar | 默认 | Canvas 居中，最大 1600px 高；左右留暗色边距 |
| **城市详情** | 单列，主图在上 | 单列，主图在上 | 双列（左主图右元数据） | 双列，最大宽度 1200px 居中 |
| **我的** | 单列 | 双列 | 双列 | 三列 |
| **寄明信片** | 单列，stepper 顶部 | 单列 | 双列预览（左表单右预览） | 同 desktop，最大宽度 960px 居中 |
| **收件箱** | 单列 | 单列 | 单列，最大宽度 720px 居中 | 同 desktop |
| **贡献** | 单列 | 双列 | 三列 | 三列，最大宽度 1200px 居中 |
| **设置** | 单列 | 单列，最大宽度 640px 居中 | 单列，最大宽度 720px 居中 | 同 desktop |
| **关于** | 单列 | 单列，最大宽度 720px 居中 | 单列，最大宽度 720px 居中 | 同 desktop |

### 7.4 移动端"能用即可"原则

> **v1 明确不为移动端做触屏手势优化**（与 Product Spec §2.2 非目标一致）。
>
> 移动端需要保证：
> - 页面不破版；
> - 主流程（打开 → 拖动 → 点击城市 → 寄明信片）能走通；
> - 不出现触屏不可用的硬阻塞（如 hover-only 菜单）。
>
> v1.x 再补：
> - 触屏手势（pinch zoom、双指旋转）；
> - 底部安全区适配；
> - 触屏键盘适配。

### 7.5 断点使用禁令

| 禁令 | 原因 |
| --- | --- |
| ❌ 在 mobile 断点强制启用 TimeBar 拖拽 | 与触屏体验冲突 |
| ❌ 在 mobile 断点隐藏"寄明信片"CTA | v1 主流程必须可走通 |
| ❌ 自定义断点（如 900px） | 与本规范不统一 |
| ❌ 在 desktop 布局中固定使用 `width: 100vw` | 与 §6.8 About 等最大宽度冲突 |

## 8. 动效规范

### 8.1 时长阶梯（Duration）

| Token | ms | 典型用途 |
| --- | --- | --- |
| `--duration-instant` | 0 | toggle 状态切换、瞬时反馈 |
| `--duration-fast` | 150 | hover、按下、focus、tag 关闭 |
| `--duration-base` | 250 | 浮层、Modal、Toast、面板入场 |
| `--duration-slow` | 400 | 全屏 sheet、首屏 HUD 淡入 |
| `--duration-cinematic` | 800 | 相机 flyTo、城市详情入场 |

```css
:root {
  --duration-instant:   0ms;
  --duration-fast:     150ms;
  --duration-base:     250ms;
  --duration-slow:     400ms;
  --duration-cinematic: 800ms;
}
```

### 8.2 缓动函数（Easing）

| Token | 函数 | 用途 |
| --- | --- | --- |
| `--ease-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` | **默认** · 80% 场景 |
| `--ease-decelerate` | `cubic-bezier(0.0, 0, 0.2, 1)` | 入场（从屏幕外进入） |
| `--ease-accelerate` | `cubic-bezier(0.4, 0, 1, 1)` | 退场（离开屏幕） |
| `--ease-emphatic` | `cubic-bezier(0.22, 1, 0.36, 1)` | 强调（Modal、Toast、Stepper） |
| `--ease-linear` | `linear` | 仅地球自转、Loading Spinner、时间轴跟手 |

```css
:root {
  --ease-standard:    cubic-bezier(0.4, 0, 0.2, 1);
  --ease-decelerate:  cubic-bezier(0.0, 0, 0.2, 1);
  --ease-accelerate:  cubic-bezier(0.4, 0, 1, 1);
  --ease-emphatic:    cubic-bezier(0.22, 1, 0.36, 1);
  --ease-linear:      linear;
}
```

### 8.3 触发场景速查表

| 场景 | duration | easing | 备注 |
| --- | --- | --- | --- |
| 按钮 hover 变色 | `--duration-fast` | `--ease-standard` | 仅变色，无位移 |
| 按钮 active 按下 | `--duration-fast` | `--ease-accelerate` | `transform: scale(0.98)` |
| 按钮 focus ring | `--duration-fast` | `--ease-standard` | 仅 outline |
| Modal 入场 | `--duration-base` | `--ease-emphatic` | opacity + scale 0.96→1 |
| Modal 退场 | `--duration-fast` | `--ease-accelerate` | opacity + scale 1→0.96 |
| Toast 入场 | `--duration-base` | `--ease-decelerate` | translateY 16→0 + opacity |
| Toast 退场 | `--duration-fast` | `--ease-accelerate` | translateY 0→16 + opacity |
| Dropdown 入场 | `--duration-fast` | `--ease-standard` | opacity + translateY -4→0 |
| Drawer / Sheet 入场 | `--duration-slow` | `--ease-decelerate` | translateX 100%→0 |
| 相机 flyTo | `--duration-cinematic` | `--ease-standard` | three.js OrbitControls 自带 damping |
| 时间轴拖动 | — | `--ease-linear` | 跟手，不缓动 |
| 首屏加载完成 | `--duration-slow` | `--ease-decelerate` | 进度环 → 地球淡入 |
| Spinner | 800ms / 圈 | `--ease-linear` | 无限循环 |
| Skeleton pulse | 1500ms / 周期 | `--ease-standard` | opacity 0.4↔0.7 |
| Tab 指示器 | `--duration-base` | `--ease-emphatic` | transform translateX |

### 8.4 减少动效偏好（prefers-reduced-motion）

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- 启用时：
  - 所有 transition 接近瞬时；
  - Spinner 停止；
  - Skeleton 停止脉冲，变为静态占位；
  - flyTo 改用瞬切（`duration: 0`）。
- 不禁用：必要的相机旋转（用户主动拖拽）。

### 8.5 动效使用禁令

| 禁令 | 原因 |
| --- | --- |
| ❌ 超过 `--duration-cinematic`（800ms）的过渡 | 与 §1.2 慢但可控冲突 |
| ❌ 弹性 / 弹簧动画 | 与 §1.1 极简冲突 |
| ❌ 装饰性动画（呼吸光、扫光、闪烁） | 与 §1.1 极简冲突 |
| ❌ 自动播放动画（轮播、loading 完成后自动开启） | 与 §1.5 慢胜过快冲突 |
| ❌ 同一元素同时启用 transition + animation | 性能与可控性差 |
| ❌ inline 动画时长（如 `style="transition: 300ms"`） | 必须用 token |

## 9. 状态全集

### 9.1 通用状态矩阵

> 每个交互组件必须覆盖以下 9 种状态。

| 状态 | 视觉变化 | A11y 变化 | 实现要点 |
| --- | --- | --- | --- |
| **default** | 基线样式 | — | — |
| **hover** | 背景 / 边框轻微提亮 | `cursor: pointer` | 仅鼠标设备触发；触屏跳过 |
| **focus** | 2px primary-500 外环（见 §10.1） | `tabindex` 必填 | 仅键盘 `:focus-visible` |
| **active** | 背景 / 边框变深 1 色阶 + `scale(0.98)` | — | 按下瞬间，松开回到 hover |
| **disabled** | opacity 0.4 | `aria-disabled="true"` | 不可点击，键盘可达（便于屏幕阅读器朗读） |
| **loading** | 内容替换为 Spinner | `aria-busy="true"` | 保留原宽度，避免布局抖动 |
| **error** | border 红 + 下方错误文字 | `aria-invalid="true"` + `aria-describedby` | 错误文字必须与控件 id 关联 |
| **empty** | 居中图标 + 标题 + 描述 + CTA | `role="status"` | 仅用于容器级组件（Card / List） |
| **success** | 短暂 primary 描边动画（300ms） | `aria-live="polite"` 公告 | 自动消失或由用户关闭 |

### 9.2 状态优先级

当多个状态同时触发时，按以下优先级渲染：

```
disabled > loading > error > active > focus > hover > default
```

> 例如：组件 disabled 时，hover / focus 都不再生效。

### 9.3 表单错误展示规则

| 错误级别 | 展示位置 | 持续时间 | 示例 |
| --- | --- | --- | --- |
| **行内（inline）** | 字段下方 `text-xs color-error`，间距 `--space-1` | 持续至修正 | "邮箱格式不正确" |
| **提交（submit）** | 顶部 Toast，z-index `--z-toast` | 5s 自动消失 | "保存失败，请重试" |
| **致命（fatal）** | 全屏 EmptyState | 用户主动重试 | "信号中断"+ 重新连接按钮 |

### 9.4 加载状态规则

| 加载时长 | UI |
| --- | --- |
| < 300ms | 不展示 loading（避免闪烁） |
| 300ms – 2s | Spinner（按钮内或区域中央） |
| > 2s | Skeleton 占位 |
| > 10s | Skeleton + "加载较慢"+ 取消按钮 |

### 9.5 空状态规则

> 所有"列表型"组件（Inbox、My 明信片、My 收藏、Contribute 排行）必须实现空状态。

空状态结构（§5.7）：
```
[Icon 48px]
[Title text-md]
[Description text-sm neutral-200]
[Action primary md]（可选）
```

### 9.6 成功反馈规则

| 操作类型 | 反馈方式 |
| --- | --- |
| 表单提交 | Toast "已保存"（`success` 颜色，2s 自动消失） |
| 关键操作（如寄出明信片） | 全屏确认 Modal + 自动跳转 |
| 状态切换 | 视觉立即变化（无 Toast） |

### 9.7 状态实现示例（Button）

```css
.btn {
  /* default */
  background: var(--color-primary-500);
  color: var(--color-neutral-1000);
  border: 1px solid transparent;
  transition:
    background var(--duration-fast) var(--ease-standard),
    transform var(--duration-fast) var(--ease-accelerate);
}

/* hover */
@media (hover: hover) {
  .btn:hover:not(:disabled) {
    background: var(--color-primary-400);
  }
}

/* focus */
.btn:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

/* active */
.btn:active:not(:disabled) {
  background: var(--color-primary-600);
  transform: scale(0.98);
}

/* disabled */
.btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: none;
}

/* loading */
.btn[aria-busy="true"] {
  color: transparent;
  pointer-events: none;
}
.btn[aria-busy="true"]::after {
  content: "";
  position: absolute;
  /* 24px spinner */
}
```

### 9.8 状态使用禁令

| 禁令 | 原因 |
| --- | --- |
| ❌ 用颜色单独传达状态（无图标 / 文字） | 色盲可达性 |
| ❌ 错误信息用 modal 弹窗阻塞 | 与 §1.4 克制冲突 |
| ❌ loading 转圈超过 10s 不降级 | UX 灾难 |
| ❌ 错误信息用开发者术语（如 "500 Internal Server Error"） | 必须翻译为用户语言 |
| ❌ 同一控件同时 disabled 和 loading | 状态二义 |

## 10. A11Y 规范（无障碍）

> 本节是 v1 实现的硬性要求。所有"已完成"判定需通过 axe-core 自动扫描（critical 错误为 0）。

### 10.1 焦点环（Focus Ring）

```css
:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
  border-radius: inherit; /* 跟随控件形状 */
}

/* 鼠标点击不显示焦点环 */
:focus:not(:focus-visible) {
  outline: none;
}
```

| 项 | 规格 |
| --- | --- |
| 颜色 | `--color-primary-500`（`#5BA8FF`） |
| 宽度 | 2px |
| offset | 2px |
| 形状 | 跟随元素 border-radius |
| 对比度（vs `--color-neutral-900`） | 6.3 : 1 ✅（≥ 3 : 1） |
| 显示条件 | 仅键盘焦点（`:focus-visible`） |

### 10.2 对比度（WCAG 2.1 Level AA）

| 类型 | 最小对比度 | 适用对象 |
| --- | --- | --- |
| 正文文字 | 4.5 : 1 | 所有 `<p>` / `<span>` / `<label>` |
| 大字（≥ 18pt 常规 或 ≥ 14pt bold） | 3 : 1 | `--text-xl` 以上 |
| 非文字元素 | 3 : 1 | 按钮、输入框、图标按钮、控件边界 |

> 实测对比度详见 §2.8。本节只需保证实现沿用 §2 token，无须重新计算。

### 10.3 屏幕阅读器（Screen Reader）

#### 10.3.1 图标按钮

所有图标按钮（无文字）**必须**有 `aria-label`：

```tsx
<button aria-label="关闭" onClick={onClose}>
  <IconClose />
</button>
```

#### 10.3.2 图片 / 媒体

所有 `<img>` 必须有 `alt`：

| 图片类型 | alt 格式 | 示例 |
| --- | --- | --- |
| 明信片缩略图 | `"<城市>，<发件人>于<日期>寄"` | "东京，lwy 于 2026-08-05 寄" |
| 城市主图 | `"<城市>的当前视角"` | "东京的当前视角" |
| 装饰性插画 | `alt=""`（空字符串） | — |
| Logo | `"看见地球"` | — |

#### 10.3.3 模态（见 §5.4）

- `role="dialog"` + `aria-modal="true"`
- `aria-labelledby` 指向 Title
- 打开时焦点移入，关闭时还原
- 焦点陷阱（Focus Trap）
- Esc 关闭

#### 10.3.4 动态区域（Live Region）

| 场景 | 实现 |
| --- | --- |
| Toast 通知 | `<div role="status" aria-live="polite">` |
| 错误提示 | `<div role="alert">` |
| Loading 完成 | `<div role="status" aria-live="polite">` 内容更新 |
| 表单错误 | `aria-invalid="true"` + `aria-describedby` |

#### 10.3.5 时间轴控件

```html
<input type="range"
       min="1900" max="2026" step="0.01"
       value="2026.5"
       aria-valuetext="2026 年 7 月 2 日，UTC+8 下午 3 点"
       aria-label="时间轴">
```

### 10.4 键盘导航

| 键 | 功能 | 作用域 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | 焦点前进 / 后退 | 全局 |
| `Enter` / `Space` | 激活按钮 / 链接 | 全局 |
| `Esc` | 关闭模态 / 浮层 / Dropdown | 全局 |
| `←` / `→` | 时间轴 -1 小时 / +1 小时 | 首页、时间轴聚焦时 |
| `Shift+←` / `Shift+→` | 时间轴 -1 天 / +1 天 | 同上 |
| `+` / `-` | 缩放地球 | 首页 |
| `0` | 飞回初始视角 | 首页 |
| `?` | 打开 / 关闭帮助面板 | 全局 |
| `Space`（首页） | 播放 / 暂停时间轴 | 首页 |

> 快捷键仅在非输入态（`input` / `textarea` 未聚焦）生效。

### 10.5 跳跃链接（Skip Links）

```html
<a href="#main-content" class="skip-link">跳到主要内容</a>
```

```css
.skip-link {
  position: absolute;
  left: -9999px;
  top: 8px;
  padding: var(--space-2) var(--space-4);
  background: var(--color-primary-500);
  color: var(--color-neutral-1000);
  border-radius: var(--radius-md);
  z-index: var(--z-tooltip);
}
.skip-link:focus {
  left: 8px;
}
```

### 10.6 表单 A11y

| 规则 | 实现 |
| --- | --- |
| 所有输入框有可见 label | `<label htmlFor>` 或包裹 |
| 必填字段标识 | `aria-required="true"` + label 后 `*` |
| 错误信息关联 | `aria-invalid` + `aria-describedby` |
| 字符计数（textarea） | `<span aria-live="polite">12 / 200</span>` |
| 自动填充 | `autocomplete="email"` 等标准属性 |
| 提交错误 | 页面顶部 `role="alert"` 提示 + 焦点移到首个错误字段 |

### 10.7 A11y 测试清单（实现完成后自检）

- [ ] axe-core 自动扫描 0 critical 错误
- [ ] 所有交互元素键盘可达（Tab 顺序合理）
- [ ] 仅键盘可完成"打开首页 → 拖动时间轴 → 点击城市 → 寄明信片"全流程
- [ ] macOS VoiceOver / NVDA / Chrome 屏幕阅读器朗读无障碍
- [ ] `prefers-reduced-motion: reduce` 时动效降级
- [ ] 200% 缩放下页面不破版
- [ ] 高对比度模式（Windows High Contrast）兼容
- [ ] 所有图片有 alt（装饰性用空字符串）

### 10.8 A11y 禁令

| 禁令 | 原因 |
| --- | --- |
| ❌ `<div onClick>` 模拟按钮 | 键盘不可达 |
| ❌ 移除 focus outline | 键盘用户失去位置 |
| ❌ 仅靠颜色传达信息 | 色盲不可达 |
| ❌ 自动播放音频 / 视频 | 屏幕阅读器噩梦 |
| ❌ 模态打开后焦点仍在背景 | 键盘用户迷失 |
| ❌ 用 placeholder 替代 label | 占位符消失后无标签 |
| ❌ 时间限制 < 20s 且无法延长 | WCAG 2.2.1 |

## 11. 图标库

### 11.1 风格（Style）

- **类型**：线性图标（line / outline icons）
- **尺寸**：24×24 viewBox（默认）；组件内可缩放至 16 / 20 / 32
- **线宽**：`stroke-width: 1.5`
- **端点**：`stroke-linecap: round`，`stroke-linejoin: round`
- **填充**：默认 `none`（仅双色调图标可 `currentColor` 填充）
- **颜色**：继承父元素 `currentColor`，默认 `--color-neutral-100`

```html
<!-- 示例 SVG -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
     stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="9" />
  <path d="M12 7v5l3 2" />
</svg>
```

### 11.2 来源（Source）

| 优先级 | 来源 | 备注 |
| --- | --- | --- |
| **首选** | [Phosphor Icons](https://phosphoricons.com/) | 开源 MIT，风格齐全，5 套变体（thin / light / regular / bold / fill） |
| **备选** | [Lucide Icons](https://lucide.dev/) | API 友好，种类略少 |
| **自定义** | `src/icons/postcard/` | 明信片相关（邮戳、邮票、信封、明信片） |

依赖安装：

```bash
npm install @phosphor-icons/react
```

```tsx
import { GlobeHemisphereWest, Clock, Envelope, X } from '@phosphor-icons/react';

<GlobeHemisphereWest size={24} weight="regular" />
```

### 11.3 命名约定

#### 11.3.1 文件命名（kebab-case）

```
icon-time-axis.svg
icon-layer-nightlights.svg
icon-postcard-stamp.svg
```

#### 11.3.2 React 组件命名（PascalCase）

```tsx
<IconTimeAxis />
<IconLayerNightlights />
<IconPostcardStamp />
```

#### 11.3.3 Props 接口

```ts
interface IconProps {
  size?: number | string;        // 默认 24
  color?: string;                // 默认 'currentColor'
  strokeWidth?: number;          // 默认 1.5（仅自定义线性图标）
  weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill'; // 仅 Phosphor
  className?: string;
  'aria-label'?: string;         // 仅语义化图标
  'aria-hidden'?: true;          // 装饰性图标必须设 true
}
```

### 11.4 必备图标清单（v1 必须有）

| 名称 | 用途 | 来源 |
| --- | --- | --- |
| `globe` | Logo、主导航 | Phosphor `GlobeHemisphereWest` |
| `clock` | 时间轴 | Phosphor `Clock` |
| `layers` | 图层切换 | Phosphor `Stack` |
| `question` | 帮助 | Phosphor `Question` |
| `user` | 用户头像占位 | Phosphor `UserCircle` |
| `arrow-left` | 返回 | Phosphor `ArrowLeft` |
| `x` | 关闭 | Phosphor `X` |
| `share` | 分享 | Phosphor `ShareNetwork` |
| `heart` / `heart-fill` | 收藏 | Phosphor `Heart` / `HeartFill` |
| `envelope` | 收件箱、明信片 | Phosphor `Envelope` |
| `pencil` | 编辑 | Phosphor `PencilSimple` |
| `trash` | 删除 | Phosphor `Trash` |
| `check` | 成功 | Phosphor `Check` |
| `warning` | 警告 | Phosphor `Warning` |
| `info` | 信息 | Phosphor `Info` |
| `play` / `pause` | 时间轴播放 | Phosphor `Play` / `Pause` |
| `magnifying-glass` | 搜索 | Phosphor `MagnifyingGlass` |
| `gear` | 设置 | Phosphor `Gear` |
| `paper-plane-tilt` | 寄出 | Phosphor `PaperPlaneTilt` |
| `stamp` | 邮票 | 自定义 SVG（`icon-stamp.svg`） |
| `postmark` | 邮戳 | 自定义 SVG（`icon-postmark.svg`） |

### 11.5 自定义 SVG 模板

```html
<!-- src/icons/postcard/icon-stamp.svg -->
<svg width="56" height="72" viewBox="0 0 56 72" fill="none"
     xmlns="http://www.w3.org/2000/svg">
  <rect x="1" y="1" width="54" height="70" rx="2"
        stroke="currentColor" stroke-width="1" stroke-dasharray="4 2" />
  <text x="28" y="38" text-anchor="middle"
        font-family="Inter" font-size="10" fill="currentColor">
    STAMP
  </text>
  <line x1="8" y1="60" x2="48" y2="60"
        stroke="currentColor" stroke-width="0.5" />
</svg>
```

### 11.6 图标使用规则

| 规则 | 说明 |
| --- | --- |
| 与文字对齐 | 图标垂直居中对齐文字 baseline（用 `vertical-align: middle` + 负 margin） |
| 间距 | 图标与文字间距 `--space-2` |
| 装饰性图标 | 必填 `aria-hidden="true"` |
| 语义化图标（无文字） | 必填 `aria-label="<具体动作>"` |
| 颜色 | 永远继承父元素，不要在图标内部写死颜色 |
| 不允许 | emoji 替代图标（违反 §1.3 真实 + §11.1 风格统一） |

### 11.7 图标库使用禁令

| 禁令 | 原因 |
| --- | --- |
| ❌ 混用不同图标库（如 Phosphor + Material） | 风格不统一 |
| ❌ 使用 emoji 替代 | 跨平台不一致，与 §1.3 真实冲突 |
| ❌ 给装饰性图标加 `aria-label` | 屏幕阅读器会朗读噪音 |
| ❌ 在暗色背景下使用浅色 fill | 视觉熵增 |
| ❌ 自定义图标不写 viewBox | 无法缩放 |

## 12. 明信片样式

> 明信片是产品的核心交互物（用户在地球上找到地点 → 寄出一张）。本节定义其完整视觉规范。

### 12.1 尺寸（与物理明信片对齐）

| 项 | 值 |
| --- | --- |
| 比例 | **3 : 2**（国际标准明信片 ISO 216 不含，但符合明信片惯例） |
| 实际渲染宽度 | 480 px（页面内最大） |
| 实际渲染高度 | 320 px |
| 缩略图（列表 / Inbox） | 80 × 120 px 或 120 × 180 px |
| 打印尺寸（可选） | 148 × 105 mm |

### 12.2 正面（Front）布局

```
┌──────────────────────────────────────────┐
│                                          │
│                                          │
│                                          │
│        [城市主图 / 当前视角截图]            │  ← 65% 高度
│                                          │
│                                          │
│                                          │
├──────────────────────────────────────────┤
│ 35.6762°N · 139.6503°E          [邮票]   │  ← 35% 高度
│ ────────────────────────                  │
│ 东京 · 2026-08-05                         │  ← title 字体
└──────────────────────────────────────────┘
```

| 区块 | 规格 |
| --- | --- |
| **图片区** | 65% 高度；object-fit: cover；`--radius-lg` 上方圆角（底部 0） |
| **坐标** | `--font-mono`，`--text-sm`，`--color-neutral-600`，左对齐，距左 `--space-4` |
| **分隔线** | 1px solid `--color-neutral-300`（米色底变体用 `--color-neutral-400`） |
| **城市 + 日期** | `--font-ui`，`--text-base`，`--weight-medium` |
| **邮票** | 右上角 56×72 px，距右 `--space-3`、距上 `--space-3` |

### 12.3 背面（Back）布局

```
┌──────────────────────────────────────────┐
│ [手写正文（Caveat）]            │ [邮票] │
│                                │        │
│ ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄│        │
│                                │        │
│                                │        │
│                                │ [邮戳] │
│                                │        │
│ 收件人：xxx                      │        │
│ 来自：lwy · 2026-08-05         │        │
└──────────────────────────────────────────┘
```

| 区块 | 规格 |
| --- | --- |
| **正文区** | 左 60% 宽度；`--font-handwrite`；`--text-md`；行高 1.6；padding `--space-4` |
| **邮票** | 右上角 56×72 px（同正面） |
| **邮戳** | 右下角 64×64 px 圆形（距右 `--space-4`、距下 `--space-4`） |
| **收件人** | `--text-sm`，`--color-neutral-700`，左下角 |
| **寄件人** | `--text-sm`，`--color-neutral-500`，左下角次行 |

### 12.4 邮戳 / 邮票占位（v1 简化）

> v1 不实现完整邮票生成（需美术素材）。使用占位 + 文字标签。

| 元素 | 位置 | 尺寸 | v1 占位实现 |
| --- | --- | --- | --- |
| **邮票** | 右上角 | 56 × 72 px | 浅色 `--color-neutral-200` 矩形 + 1px dashed 边框 + 中央 "STAMP" 文字（`--text-xs`） |
| **邮戳** | 右下角 | 64 × 64 px 圆形 | 半透 `--color-neutral-400` 圆环 + 弧形文字 "TOKYO · 2026-08-05"（`--text-xs`，`--font-mono`） |
| **边框** | 四周 | 1px inset | 视 border variant（见 §12.5） |

邮票占位 SVG 模板见 §11.5。

邮戳 SVG 模板：

```html
<!-- src/icons/postcard/icon-postmark.svg -->
<svg width="64" height="64" viewBox="0 0 64 64">
  <circle cx="32" cy="32" r="30"
          fill="none" stroke="currentColor" stroke-width="1"
          stroke-dasharray="3 2" />
  <circle cx="32" cy="32" r="24"
          fill="none" stroke="currentColor" stroke-width="1.5" />
  <defs>
    <path id="postmark-arc-top"
          d="M 10 32 A 22 22 0 0 1 54 32" />
    <path id="postmark-arc-bottom"
          d="M 10 32 A 22 22 0 0 0 54 32" />
  </defs>
  <text font-family="JetBrains Mono" font-size="6" fill="currentColor">
    <textPath href="#postmark-arc-top" startOffset="50%" text-anchor="middle">
      TOKYO
    </textPath>
  </text>
  <text font-family="JetBrains Mono" font-size="6" fill="currentColor">
    <textPath href="#postmark-arc-bottom" startOffset="50%" text-anchor="middle">
      2026-08-05
    </textPath>
  </text>
  <text x="32" y="35" text-anchor="middle"
        font-family="JetBrains Mono" font-size="10" fill="currentColor">
    ✦
  </text>
</svg>
```

### 12.5 边框样式（Variants）

| Variant | 背景 | 边框 | 内边距 | 用途 |
| --- | --- | --- | --- | --- |
| **`classic`** | `--color-neutral-50` (`#F5F7FA`) | 1px solid `--color-neutral-300` | `--space-4` | 默认（亮色背景） |
| **`vintage`** | `#F4ECD8`（米色） | 2px double `--color-neutral-400` | `--space-6` | 怀旧主题 |
| **`minimal`** | `--color-neutral-50` | none | `--space-6` | 极简风格 |
| **`night`**（默认暗色模式） | `--color-neutral-900` (`#0F141B`) | 1px solid `--color-accent-500` | `--space-4` | 与 §1.6 暗色原生对齐 |
| **`darkClassic`** | `--color-neutral-800` (`#1A1F2A`) | 1px solid `--color-neutral-600` | `--space-4` | 暗色背景中性版 |

**默认选择规则**：
- 检测 `prefers-color-scheme: dark` → **`night`**
- 否则 → **`classic`**

### 12.6 字体（明信片专属）

| 元素 | 字体 | Size | 行高 | 字重 |
| --- | --- | --- | --- | --- |
| 正面城市名 | `--font-ui` | `--text-lg`（20px） | 1.4 | 500 |
| 正面坐标 | `--font-mono` | `--text-sm`（14px） | 1.2 | 400 |
| 正面日期 | `--font-ui` | `--text-base`（16px） | 1.4 | 400 |
| 背面正文 | `--font-handwrite`（`Caveat`） | `--text-md`（18px） | 1.6 | 400 |
| 背面收件人 / 寄件人 | `--font-ui` | `--text-sm`（14px） | 1.4 | 400 |

### 12.7 渲染示例代码（CSS）

```css
.postcard {
  width: 480px;
  height: 320px;
  background: var(--color-neutral-50);
  border: 1px solid var(--color-neutral-300);
  border-radius: var(--radius-xl);
  overflow: hidden;
  display: grid;
  grid-template-rows: 65% 35%;
  box-shadow: var(--shadow-md);
}

.postcard--night {
  background: var(--color-neutral-900);
  border-color: var(--color-accent-500);
}

.postcard__media {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.postcard__footer {
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--space-2);
}

.postcard__coords {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--color-neutral-600);
}

.postcard__title {
  font-size: var(--text-base);
  font-weight: var(--weight-medium);
}

.postcard__stamp {
  position: absolute;
  top: var(--space-3);
  right: var(--space-3);
  width: 56px;
  height: 72px;
}
```

### 12.8 交互规格

| 操作 | 反馈 |
| --- | --- |
| 鼠标 hover 整张明信片 | `transform: translateY(-2px)` + `--shadow-lg`（`--duration-base`，`--ease-standard`） |
| 单击整张 | 打开完整详情 Modal（复用 §5.4 Modal，`size="lg"`） |
| 双击 | 飞回寄出地点（首页） |

### 12.9 导出规格（v1.x）

| 格式 | 尺寸 | 用途 |
| --- | --- | --- |
| PNG | 1920 × 1280 px（2K） | 分享到社交平台 |
| PNG | 3840 × 2560 px（4K） | 打印 / 收藏 |
| JPEG | 1920 × 1280 px（quality 90） | 体积敏感场景 |

### 12.10 明信片样式使用禁令

| 禁令 | 原因 |
| --- | --- |
| ❌ 用 AI 滤镜渲染城市主图 | 与 §1.3 真实冲突 |
| ❌ 使用动态背景（如视频） | 与 §1.1 极简冲突 |
| ❌ 邮票使用真实国家邮票图片 | 版权风险 |
| ❌ 在 `night` 变体上保留亮色文字而不调整对比度 | A11y |
| ❌ 邮戳使用图标库通用图标 | 必须自定义以匹配弧形文字 |

## 附录 A · 与 Product Spec v1 的引用关系

| Product Spec v1 章节 | Design Spec v1 对应章节 | 说明 |
| --- | --- | --- |
| §1 定位 / 愿景 | §1 设计原则 | 原则 1.1–1.6 落地"安静 · 深邃 · 真实"调性 |
| §2.2 非目标 | §7 响应式 | 移动端"能用即可"，不做触屏优化 |
| §7 信息架构 | §6 8 个页面线框 | 一一对应 |
| §9 视觉设计方向 | §2–§5 色彩/字体/间距/组件 | 落地为 token + 组件库 |
| §10 技术架构 | §5 组件库 Props / §8 动效 | 组件映射到 React + Zustand |
| §13 边界与错误 | §9 状态全集 + §10 A11y | 错误态 + 屏幕阅读器 |
| §15 发布里程碑 | §5 组件库优先级 | M1 内核期优先实现 P0 组件 |

---

## 附录 B · CSS 变量一次性导出（完整）

> 以下为 §2–§4 全部 token 的 CSS 源码，建议通过 Style Dictionary / 自定义脚本从本文自动生成，避免手抄出错。

```css
/* ============================================================
 * 看见地球 · Design Tokens v1.0.0
 * 2026-08-05 · 自动生成自 Design Spec v1
 * ============================================================ */

:root {
  /* ── Colors · Primary ── */
  --color-primary-300: #C7DEFF;
  --color-primary-400: #A6CCFF;
  --color-primary-500: #82C0FF;
  --color-primary-600: #5BA8FF;
  --color-primary-700: #3D8FE8;
  --color-primary-hover:  var(--color-primary-400);
  --color-primary-active: var(--color-primary-600);

  /* ── Colors · Accent ── */
  --color-accent-400: #F8C887;
  --color-accent-500: #F4B860;
  --color-accent-600: #D69A3A;

  /* ── Colors · Neutral ── */
  --color-neutral-0:    #FFFFFF;
  --color-neutral-50:   #F5F7FA;
  --color-neutral-100:  #E8EEF5;
  --color-neutral-200:  #C7D0DB;
  --color-neutral-300:  #A1AAB8;
  --color-neutral-400:  #6B7889;
  --color-neutral-600:  #3A4452;
  --color-neutral-800:  #1A1F2A;
  --color-neutral-900:  #0F141B;
  --color-neutral-1000: #000000;

  /* ── Colors · Status ── */
  --color-success: #4ADE80;
  --color-warning: #FBBF24;
  --color-error:   #F87171;
  --color-info:    var(--color-primary-500);

  /* ── Spacing ── */
  --space-0:   0;
  --space-1:   4px;
  --space-2:   8px;
  --space-3:   12px;
  --space-4:   16px;
  --space-6:   24px;
  --space-8:   32px;
  --space-12:  48px;
  --space-16:  64px;
  --space-24:  96px;
  --space-32:  128px;

  /* ── Radius ── */
  --radius-sm:   4px;
  --radius-md:   8px;
  --radius-lg:   12px;
  --radius-xl:   16px;
  --radius-2xl:  24px;
  --radius-full: 9999px;

  /* ── Shadow ── */
  --shadow-none:          none;
  --shadow-sm:            0 1px 2px rgba(0,0,0,0.4);
  --shadow-md:            0 4px 12px rgba(0,0,0,0.5);
  --shadow-lg:            0 8px 24px rgba(0,0,0,0.6);
  --shadow-xl:            0 16px 48px rgba(0,0,0,0.7);
  --shadow-glow-primary:  0 0 24px rgba(91,168,255,0.4);

  /* ── Z-Index ── */
  --z-canvas:    0;
  --z-base:      10;
  --z-hud:       50;
  --z-dropdown:  100;
  --z-modal:     1000;
  --z-toast:     1100;
  --z-tooltip:   1200;

  /* ── Typography · Font Families ── */
  --font-ui-en:     "Inter", "Söhne", -apple-system, system-ui, sans-serif;
  --font-ui-zh:     "Noto Serif SC", "Source Han Serif SC", "Songti SC", serif;
  --font-ui:        var(--font-ui-zh), var(--font-ui-en);
  --font-mono:      "JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace;
  --font-handwrite: "Caveat", "Liu Jian Mao Cao", cursive;

  /* ── Typography · Size ── */
  --text-xs:      12px;
  --text-sm:      14px;
  --text-base:    16px;
  --text-md:      18px;
  --text-lg:      20px;
  --text-xl:      24px;
  --text-2xl:     32px;
  --text-3xl:     40px;
  --text-display: 64px;

  /* ── Typography · Weight ── */
  --weight-regular:  400;
  --weight-medium:   500;
  --weight-semibold: 600;

  /* ── Duration ── */
  --duration-instant:   0ms;
  --duration-fast:     150ms;
  --duration-base:     250ms;
  --duration-slow:     400ms;
  --duration-cinematic: 800ms;

  /* ── Easing ── */
  --ease-standard:    cubic-bezier(0.4, 0, 0.2, 1);
  --ease-decelerate:  cubic-bezier(0.0, 0, 0.2, 1);
  --ease-accelerate:  cubic-bezier(0.4, 0, 1, 1);
  --ease-emphatic:    cubic-bezier(0.22, 1, 0.36, 1);
  --ease-linear:      linear;

  /* ── Breakpoints (for JS use only) ── */
  --bp-mobile:  640px;
  --bp-tablet:  1024px;
  --bp-wide:    1920px;
}
```

```css
/* ── Glass / HUD ── */
.hud {
  background: rgba(15, 20, 27, 0.55);
  backdrop-filter: blur(20px) saturate(140%);
  -webkit-backdrop-filter: blur(20px) saturate(140%);
  border: 1px solid rgba(232, 238, 245, 0.08);
  border-radius: var(--radius-lg);
}

@supports not (backdrop-filter: blur(20px)) {
  .hud { background: rgba(15, 20, 27, 0.92); }
}

/* ── Focus Ring ── */
:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
  border-radius: inherit;
}
:focus:not(:focus-visible) { outline: none; }

/* ── Reduced Motion ── */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 附录 C · 验收 checklist（实现完成后自检）

> AI / 工程师在交付前必须逐条勾选。任意一项未过则视为 v1 未完成。

### C.1 Token 完整性

- [ ] 附录 B 全部变量已落到 `tokens.css`
- [ ] 无任何硬编码 hex / px / ms（仅 `:root` 与 token 派生）
- [ ] Storybook（或等价展示）按 token 顺序展示色彩 / 字体 / 间距 / 圆角 / 阴影

### C.2 组件完整性（§5）

- [ ] Button / Card / Input / Modal / Navigation / Loading / EmptyState / Tag 全部实现
- [ ] 每个组件 4 种变体 + 3 种尺寸（如适用）
- [ ] 每个组件覆盖 9 种状态（§9.1）

### C.3 页面完整性（§6）

- [ ] 8 个页面按 ASCII 线框 1:1 映射
- [ ] 首页飞回初始视角、首屏入场动效符合 §6.1
- [ ] 寄明信片三步流程可走通，含 §6.4 全部状态
- [ ] 收件箱空状态、加载状态、错误状态都有
- [ ] 页面跳转矩阵（§6.9）所有路径可达

### C.4 横切规范（§7–§10）

- [ ] §7 响应式：4 个断点全部生效，移动端"能用"
- [ ] §8 动效：所有 duration / easing 取自 token
- [ ] §9 状态：9 种状态全覆盖
- [ ] §10 A11y：axe-core 0 critical；键盘可达；屏幕阅读器朗读无障碍

### C.5 专项（§11–§12）

- [ ] §11 图标：21 个必备图标全部到位；装饰性图标 `aria-hidden`
- [ ] §12 明信片：5 种边框变体可切换；邮票 + 邮戳占位可渲染

### C.6 文档一致性

- [ ] 与 Product Spec v1 无矛盾
- [ ] 与本 Spec §0 阅读指引中的章节顺序一致
- [ ] 所有 ADR（待补）已记录到仓库 `docs/adr/`

---

## 附录 D · 后续版本路线（v1.1+ 预告）

| 版本 | 主要新增 | 与本 Spec 关系 |
| --- | --- | --- |
| **v1.1** | 明信片 PNG 导出、URL 状态同步、快捷地点、5 种边框变体已可切 | 复用 §12 + 新增 §13 |
| **v1.2** | 暗色 / 浅色切换（破 §1.6） | 需新增主题系统 + 重审 §2 |
| **v2.0** | 双语切换、多图层叠加、AI 解读 | 需新增 i18n token + 文案表 |

> v1.x 增量不得破坏 §1.6（暗色原生）+ §1.4（克制）两条原则，否则升 v2。

---

## 附录 E · 待补（评审中收集）

- [ ] Figma 主设计稿链接
- [ ] 关键页静态视觉稿（首页 / 城市详情 / 寄明信片 步骤 2）
- [ ] 性能预算分解表（与 §9 加载时长规则对照）
- [ ] 文案与术语对照表（简中 / 英文 · §18.3 同步）

---

> **本 Spec 解释权归项目所有人 lwy**。
> 修订需更新 §0 元信息中的版本号，并在仓库 `docs/adr/` 留 ADR 记录。

