# Button

> **状态**:v1.5 ui 组件 · **优先级**:P0
> **文件**:`src/components/ui/Button/`
> **依赖**:tokens.css · 0 新依赖

## Props

| Prop | 类型 | 默认 | 说明 |
|---|---|---|---|
| `variant` | `'primary' \| 'secondary' \| 'ghost'` | `'primary'` | 主 CTA / 次操作 / 文本链接 |
| `size` | `'sm' \| 'md'` | `'md'` | 36px / 48px 高 |
| `aria-label` | `string?` | — | **icon-only 必填** |
| 其余 | `<button>` 全属性 | — | type/onClick/disabled/... |

## 视觉示例

```
[选择你的城市 →]   <- primary · 48px
[了解更多]         <- ghost · 48px (无边框)
[✕]               <- ghost · 36px · 必须 aria-label="关闭"
[搜索]             <- secondary · 36px
```

## 何时用

- **primary**:主 CTA · "选择你的城市" / "开始阅读" / "保存"
- **secondary**:次要操作 · "取消" / "返回" / "了解更多"
- **ghost**:文本链接 / 不抢视觉焦点的操作

## 何时不用

- ❌ 不要用 Button 包裹图片 → 用 `<a>` 或 `<Link>` 包图
- ❌ 不要用 Button 当 chip / 分类标签 → 用 `<Tag>`
- ❌ 不要超过 3 种 variant 混用

## a11y 默认

- `<button type="button">` 原生元素
- `focus-visible` 时显示 accent outline
- disabled 时 cursor + opacity 40%
- icon-only 必填 aria-label

## 与业务组件关系

- **HotkeyHelp.tsx** 内的关闭按钮:可替换为 `<Button variant="ghost" aria-label="关闭">✕</Button>`
- **SearchBox.tsx** 内的搜索按钮:可替换为 `<Button variant="secondary" size="sm" aria-label="搜索">⌕</Button>`
- **UserCityPicker.tsx** 内的城市选择按钮:可替换为 `<Button variant="primary">选择</Button>`
