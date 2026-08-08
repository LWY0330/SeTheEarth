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

