# Tag

> **状态**:v1.5 ui 组件 · **优先级**:P0

## Props

| Prop | 类型 | 默认 | 说明 |
|---|---|---|---|
| `tone` | `'neutral' \| 'level-red' \| 'level-yellow' \| 'level-blue' \| 'semantic'` | `'neutral'` | 语义色 |
| `size` | `'sm' \| 'md'` | `'sm'` | 字号 + padding |

## 何时用

- contentType 分类(文化/日常/天气)→ `tone="level-red/yellow/blue"`(与 PR #30 editorialLevels 对齐)
- 状态标签(成功/警告/错误)→ `tone="semantic"`
- 中性元数据(版本号/作者)→ `tone="neutral"`

## 何时不用

- ❌ 不要用 Tag 当 Button → 用 `<Button>`
- ❌ 不要把内容塞进 Tag 内(只放短文本)
- ❌ 不要超过 6 字(超长标签破坏阅读节奏)

## a11y

- `<span>` 元素,无语义角色(纯视觉)
- 文字必须自带语义(不依赖颜色区分)

## 与业务组件关系

- **MomentsTimeline.tsx / EventDrawer.tsx** 的 `.eventType` chip → 替换为 `<Tag tone="level-...">{event.contentTypeZh}</Tag>`,色值用 `--content-type-*` 系列 token
- **ConfrontationalFlow/LevelTag.tsx** 现有 3 个 level variant → 可直接复用 `<Tag tone="level-red/yellow/blue">`
