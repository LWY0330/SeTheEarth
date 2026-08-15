# ui/ · 看见地球 Component Library

> **状态**:v1.5 · **作者**:设计师 Agent · **日期**:2026-08-15
> **设计系统**:Visual Direction 锁死的 5 关键词 (克制 / 编辑感 / 奶白温度 / 时间感 / 对峙感)
> **依赖**:`src/styles/tokens.css` (SSOT) · **0 新 npm 依赖**

---

## 6 个组件

| 组件 | 文件 | 优先级 | a11y 角色 |
|---|---|---|---|
| [Button](./Button/) | `Button.tsx` · `Button.module.css` · `README.md` | P0 | `<button>` + focus-visible outline |
| [Tag](./Tag/) | `Tag.tsx` · `Tag.module.css` · `README.md` | P0 | `<span>` (纯视觉,文本兜底) |
| [Stack](./Stack/) | `Stack.tsx` · `Stack.module.css` · `README.md` | P0 | 无(layout 容器) |
| [Card](./Card/) | `Card.tsx` · `Card.module.css` · `README.md` | P0 | `<section>` (editorial) / `<article>` (其他) |
| [Input](./Input/) | `Input.tsx` · `Input.module.css` · `README.md` | P1 | `<label htmlFor>` + `aria-describedby` |
| [Modal](./Modal/) | `Modal.tsx` · `Modal.module.css` · `README.md` | P1 | `role="dialog"` + `aria-modal` + `aria-labelledby` |

---

## 引入示例

```tsx
// P0 组件
import { Button, Tag, Stack, Card } from '@/components/ui';
import { Input, Modal } from '@/components/ui';

// 标准 CTA
<Button variant="primary" size="md" onClick={openPicker}>
  选择你的城市
</Button>

// 标签列表
<Stack direction="row" gap={2} wrap>
  <Tag tone="level-red" size="sm">文化</Tag>
  <Tag tone="level-yellow" size="sm">转折</Tag>
  <Tag tone="level-blue" size="sm">命运</Tag>
</Stack>

// 表单
<Input
  variant="search"
  size="lg"
  label="搜索城市"
  placeholder="京都 / Tokyo"
  prefix="⌕"
/>

// Modal
<Modal open={helpOpen} onClose={hideHelp} title="快捷键" size="sm">
  <HotkeyHelpTable />
</Modal>
```

---

## 设计原则 → 组件落地

### 克制

- 直角为主(`--r-sharp: 0`),仅 Modal/SyncMoment 用 `--r-subtle: 2px`
- 阴影仅 3 档(`--shadow-none/subtle/elevated`)
- 所有动效 100ms / 300ms / 400ms / 500ms 4 档,reduced-motion 时全部 1ms

### 编辑感

- Button / Tag 用 mono-like sans-serif(Inter)
- 时间数字用 mono(JetBrains Mono)
- 报志感章节标题用 serif(Fraunces)

### 奶白温度

- 全组件默认坐落在 `--color-canvas: #F5F1EA` 上
- 主 CTA 用 `--color-accent-500: #B25E40` (PR #16 a11y 锁)
- 禁用 neony / 渐变 / 高饱和度

### 时间感

- Input 字号 `--fs-h3`(1.25rem),符合搜索框大字号调性
- Modal 标题用 serif 而不是 sans(报志感章节标题)

### 对峙感

- Card 的 syncmoment variant **专属** SyncMoment 业务组件复用
- 不允许 4 列对峙(板块 3 强制 3 列)

---

## 何时用 ui/ 组件 vs 业务组件

### 业务组件也是 ui/ 变体

- **SyncMoment** = `<Card variant="syncmoment">` + 业务数据 + 暗色变体
- **ConfrontCard** = `<Card variant="editorial">` + 3 个 editorial level tag
- **EventDrawer** = `<Modal size="lg">` 的 sheet 变体(暂未抽)

### 业务组件不复用 ui/

- **EarthGlobe**(v1 时代遗留,2026 计划重写)
- **Timeline**(板块 4 的 9 节点时间轴,业务逻辑复杂)
- **TimezoneBar**(时间轴专属 UI,与一般 Stack 不同)

---

## 升级路径

- **D3 阶段**(PM 已拍):工程师按 tokens.css + ui/ 实施 4 阶段 4 PR
- **D4 阶段**(PM 暂缓):全量页面设计 + 新组件(可能要加 `<Tooltip>` / `<Toast>` / `<Sheet>`)
- **未来 v2.0**:若产品做大,加 `<Form>` / `<DataTable>` / `<Pagination>`

---

## 设计 token 引用约定

每个组件 .module.css **必须**只引用 `var(--xxx)` from `tokens.css`。**禁止**:

```css
/* ❌ 硬编码色值 */
color: #F5F1EA;
font-size: 16px;
padding: 16px;
```

```css
/* ✅ token 引用 */
color: var(--color-canvas);
font-size: var(--fs-body);
padding: var(--space-4);
```

---

## a11y 整体策略

- 所有组件键盘可达(`Tab` 顺序合理)
- focus-visible 显式 outline(accent-500)
- prefers-reduced-motion 全局降级到 1ms
- prefers-contrast: more 增强对比度
- 所有 Modal 自动 body 滚动锁

---

**最后更新**:2026-08-15 · **设计师**:设计师 Agent · **下一阶段**:工程师 4 阶段 4 PR 实施
