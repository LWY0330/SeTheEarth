# Input

> **状态**:v1.5 ui 组件 · **优先级**:P1

## Props

| Prop | 类型 | 默认 | 说明 |
|---|---|---|---|
| `variant` | `'search' \| 'text'` | `'text'` | 搜索框 vs 普通输入 |
| `size` | `'md' \| 'lg'` | `'md'` | 48px / 56px 高 |
| `label` | `string` | — | **必填** · 屏幕阅读器关联 |
| `error` | `string?` | — | 错误文本,触发 aria-invalid |
| `hint` | `string?` | — | 辅助提示 |
| `prefix` / `suffix` | `ReactNode` | — | 视觉装饰,aria-hidden |

## 何时用

- 任何 `<input>` 场景(SearchBox、表单、城市搜索)
- 关联 label(必填)

## 何时不用

- ❌ 不要用 Input 包 `<textarea>`(需独立 Textarea 组件)
- ❌ 不要超过 1 行 label
- ❌ 不要把按钮塞进 suffix(用 Stack + Button)

## a11y

- `<label htmlFor={inputId}>` 关联 input(必填)
- `aria-invalid={true}` 当 error
- `aria-describedby` 关联 error 或 hint
- `role="alert"` 让 error 立即被屏幕阅读器朗读

## 与业务组件关系

- **SearchBox.tsx** 主体可替换为 `<Input variant="search" size="lg" label="搜索城市">`,需要重写下拉逻辑
- 未来 `/latitude` 页"留回响"表单可用 `<Input variant="text" label="你的回响" maxLength={200}>`
