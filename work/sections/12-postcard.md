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

