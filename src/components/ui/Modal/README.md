# Modal

> **状态**:v1.5 ui 组件 · **优先级**:P1

## Props

| Prop | 类型 | 默认 | 说明 |
|---|---|---|---|
| `open` | `boolean` | — | **必填** · 受控开关 |
| `onClose` | `() => void` | — | **必填** · 关闭回调 |
| `title` | `string` | — | **必填** · aria-labelledby |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 420 / 560 / 720 px |
| `closable` | `boolean` | `true` | 显示右上 ✕ |
| `closeLabel` | `string` | `'关闭'` | 关闭按钮 aria-label |

## 何时用

- UserCityPicker / HotkeyHelp / EventDrawer 等需要遮罩弹层
- 任何需要 a11y 标准 dialog 语义的场景

## 何时不用

- ❌ 不要用 Modal 当 tooltip → 用原生 `<details>` 或 Stack
- ❌ 不要嵌套 Modal
- ❌ 不要超过 720px(用 Page 而不是 Modal)

## a11y 默认

- `role="dialog"` + `aria-modal="true"` + `aria-labelledby={titleId}`
- overlay 点击关闭 + stopPropagation 防止误关
- 打开时自动 body overflow:hidden(滚动锁)
- Esc 关闭由 useHotkeys 集中处理(本组件不绑 keydown,留给业务)

## 与业务组件关系

- **HotkeyHelp.tsx** 内的 modal 容器 → 替换为 `<Modal open={helpOpen} onClose={hideHelp} title="快捷键" size="sm">`
- **UserCityPicker.tsx** 外层 modal → 替换为 `<Modal open={open} onClose={close} title="选择你的城市" size="md">`
- **EventDrawer.tsx** 不在本组件范围内(它是 sheet/抽屉,不是 modal)
