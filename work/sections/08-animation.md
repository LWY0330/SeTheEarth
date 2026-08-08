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

