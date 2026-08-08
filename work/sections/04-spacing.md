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

