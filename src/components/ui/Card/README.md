# Card

> **状态**:v1.5 ui 组件 · **优先级**:P0

## Props

| Prop | 类型 | 默认 | 说明 |
|---|---|---|---|
| `variant` | `'syncmoment' \| 'editorial' \| 'elevated'` | `'editorial'` | 视觉风格 |
| `aria-label` | `string?` | — | 屏幕阅读器简介 |

## 何时用

- **syncmoment**:SyncMoment 角落小卡(深色/浅色背景),`dark` prop 用于落在 CityFeatured 主图上时反白
- **editorial**:板块区块(`<section>` 语义),如板块 3 对峙区 3 列子容器
- **elevated**:Modal 内子卡或弹层内容

## 何时不用

- ❌ 不要用 Card 包大块主图(用 `<figure>`)
- ❌ 不要 3 层 Card 嵌套(扁平化)
- ❌ 不要把按钮 / 表单塞进 Card 内(用 Stack 组合)

## a11y

- editorial → `<section>`(语义化分块,需 `aria-label`)
- 其他 → `<article>`(独立内容单元)
- 必须提供 aria-label 或 children 含语义标题(h2/h3)

## 与业务组件关系

- **SyncMoment/SyncMoment.tsx** 是 Card syncmoment variant 的业务实现
- **ConfrontationalFlow/ConfrontCard.tsx** 是 Card editorial variant
- **EventDrawer.tsx** 内内容块可替换为 Card editorial
