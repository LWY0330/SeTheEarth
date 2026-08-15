# Stack

> **状态**:v1.5 ui 组件 · **优先级**:P0
> **无 a11y 角色**(纯 layout 容器)

## Props

| Prop | 类型 | 默认 | 说明 |
|---|---|---|---|
| `direction` | `'row' \| 'column'` | `'column'` | flex 方向 |
| `gap` | `1 \| 2 \| 3 \| 4 \| 5 \| 6 \| 7 \| 8 \| 9 \| 10 \| 11 \| 12 \| 13` | `4` | 引用 `--space-N` |
| `align` | `'start' \| 'center' \| 'end' \| 'stretch' \| 'baseline'` | — | align-items |
| `justify` | `'start' \| 'center' \| 'end' \| 'between' \| 'around'` | — | justify-content |
| `wrap` | `boolean` | `false` | flex-wrap |
| `block` | `boolean` | `false` | display flex vs inline-flex |
| `separator` | `ReactNode` | — | 子元素间插分隔符 |

## 何时用

- 任何需要 `flex + gap` 的场景
- 替代 `<div style={{ display: 'flex', gap: 8 }}>` 内联样式
- 替代多个 .module.css 重复 flex 类

## 何时不用

- ❌ grid 布局(本组件不负责 grid-template-columns)
- ❌ 需要响应式断点的复杂布局(用 CSS Module)

## 关键决策

- **`gap` 用 token 化整数**(`1` → `--space-1`)而不是像素值,确保全站间距节奏一致
- **`separator` 唯一 a11y 注意点**:`aria-hidden="true"` 让屏幕阅读器跳过

## 与业务组件关系

- App.tsx 板块 header / 内容区可用 `<Stack direction="column" gap={5}>` 替代手写 CSS
- SyncMoment 内 4 行内容可改为 `<Stack direction="column" gap={2}>`
