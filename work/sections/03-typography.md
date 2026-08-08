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

