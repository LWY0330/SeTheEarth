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
  --color-primary-300: #A6CCFF;
  --color-primary-400: #82C0FF;
  --color-primary-500: #5BA8FF; /* 品牌主色，CTA、链接 */
  --color-primary-600: #3D8FE8;
  --color-primary-700: #2B6FBE;
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
| `--color-primary-300` | `#A6CCFF` | 极弱提亮（disabled 态 hover 模拟） |
| `--color-primary-400` | `#82C0FF` | hover |
| `--color-primary-500` | `#5BA8FF` | **品牌主色** · CTA、链接、激活态 |
| `--color-primary-600` | `#3D8FE8` | active |
| `--color-primary-700` | `#2B6FBE` | 强调按下 / 选中 ring |

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

