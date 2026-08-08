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

