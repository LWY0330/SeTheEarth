## 5. 组件库（8 类 · 完整规格）

> 每个组件包含：**Anatomy（结构）**、**Variants（变体）**、**Sizes（尺寸）**、**States（状态）**、**Props（属性）**、**Code（CSS / TS 雏形）**、**A11y（无障碍）**。
> 所有组件必须实现 §9 列出的 9 种状态。

---

### 5.1 Button（按钮）

#### Anatomy（结构）

```
┌────────────────────────────────┐
│ [iconLeft]  Label  [iconRight] │  ← horizontal padding: space-3
└────────────────────────────────┘
   ↑ height 按 size 决定
```

#### Variants（变体）

| Variant | 背景 | 文字 | 边框 | 用途 |
| --- | --- | --- | --- | --- |
| `primary` | `--color-primary-500` | `--color-neutral-1000` | none | 主操作（寄出明信片、保存） |
| `secondary` | transparent | `--color-primary-500` | 1px primary-500 | 次操作（取消、返回） |
| `ghost` | transparent | `--color-neutral-100` | none | 弱操作（关闭、更多） |
| `danger` | transparent | `--color-error` | 1px error | 危险操作（删除） |

#### Sizes（尺寸）

| Size | 高度 | 横向 padding | 字号 | 圆角 |
| --- | --- | --- | --- | --- |
| `sm` | 32px | `--space-3` | `--text-sm` | `--radius-md` |
| `md` | 40px | `--space-4` | `--text-base` | `--radius-md` |
| `lg` | 48px | `--space-6` | `--text-md` | `--radius-lg` |

#### States

- **default** → 见上表
- **hover** → primary 变 primary-400；secondary 边框变 primary-400；ghost 背景 `rgba(232,238,245,0.04)`
- **active** → primary 变 primary-600；其他 border 加深 1 色阶；整体 `transform: scale(0.98)`
- **focus** → 见 §10.1 焦点环
- **disabled** → opacity 0.4，cursor `not-allowed`，无 hover 效果
- **loading** → 内容替换为 `<Spinner size="sm" />` + "加载中"（仅 primary 启用）

#### Props

```ts
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
}
```

#### A11y
- 使用原生 `<button>`；loading 时 `aria-busy="true"`；disabled 时 `aria-disabled="true"`。
- 仅图标按钮（无文字）必须 `aria-label`。
- 焦点环见 §10.1。

---

### 5.2 Card（卡片）

#### Anatomy

```
┌──────────────────────────────┐
│ [media（可选）]               │  ← 16:9 / 4:3
├──────────────────────────────┤
│  Title                        │  ← text-lg
│  Subtitle                     │  ← text-sm neutral-200
│  ───────                      │
│  [content body]               │
│  [action（右对齐）]            │
└──────────────────────────────┘
```

#### Variants

| Variant | 背景 | 边框 | 阴影 | hover | 用途 |
| --- | --- | --- | --- | --- | --- |
| `flat` | `--color-neutral-900` | none | none | 无 | 列表项、设置分组 |
| `interactive` | `--color-neutral-800` | 1px neutral-600 | `--shadow-sm` | 升起 + 边框变 primary-500 @ 40% | 可点击卡片 |
| `feature` | `--color-neutral-900` | none | `--shadow-md` | 无 | 大型展示卡片（首页 hero） |
| `glass` | `rgba(15,20,27,0.55)` + blur | 1px neutral-100 @ 8% | none | 边框变 primary-500 @ 40% | 浮于画布上的卡片 |

#### Props

```ts
interface CardProps {
  variant?: 'flat' | 'interactive' | 'feature' | 'glass';
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  media?: { src: string; alt: string; ratio?: '16:9' | '4:3' | '1:1' };
  action?: React.ReactNode;
  onClick?: () => void;
  children?: React.ReactNode;
}
```

#### A11y
- `interactive` 卡片若整卡可点击，外层 `<button>` 包裹；若仅主操作可点击，使用 `<article>` + 内置 `<button>`。

---

### 5.3 Input（输入框）

#### Anatomy

```
┌──────────────────────────────┐
│  Label                         │  ← 标签（独立或内嵌）
│  ┌──────────────────────────┐ │
│  │ [iconLeft] [placeholder] [iconRight] │ │
│  └──────────────────────────┘ │
│  helperText                    │  ← text-sm neutral-200
│  errorText（出错时）           │  ← text-sm error
└──────────────────────────────┘
```

#### Variants

| Variant | 边框 | 背景 | 用途 |
| --- | --- | --- | --- |
| `default` | 1px neutral-600 | neutral-900 | 标准输入 |
| `filled` | none | neutral-800 | 嵌入式输入（如搜索框） |
| `floating` | 1px neutral-600 | transparent | Material 风浮动标签（v1 不推荐） |

#### Sizes

| Size | 高度 | padding | 字号 |
| --- | --- | --- | --- |
| `sm` | 32px | `--space-2 --space-3` | `--text-sm` |
| `md` | 40px | `--space-3 --space-4` | `--text-base` |
| `lg` | 48px | `--space-4 --space-6` | `--text-md` |

#### States

| State | 视觉 |
| --- | --- |
| default | 1px neutral-600 |
| hover | 1px neutral-400 |
| focus | 1px primary-500 + 外环 `0 0 0 2px rgba(91,168,255,0.2)` |
| error | 1px error + 外环 `0 0 0 2px rgba(248,113,113,0.2)` |
| disabled | opacity 0.4，cursor not-allowed |
| readonly | background neutral-800，cursor default |

#### Props

```ts
interface InputProps {
  variant?: 'default' | 'filled';
  size?: 'sm' | 'md' | 'lg';
  type?: 'text' | 'email' | 'password' | 'search' | 'url' | 'tel' | 'number';
  label?: string;            // 不传则使用 aria-label
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  helperText?: string;
  error?: string;            // 设置后自动切换到 error 态
  disabled?: boolean;
  readOnly?: boolean;
  maxLength?: number;
  showCount?: boolean;       // 显示 "12/200"
  required?: boolean;
}
```

#### A11y
- `<label>` 必须显式关联（`htmlFor` 或包裹）。
- `error` 必须同步设置 `aria-invalid="true"` 与 `aria-describedby` 指向错误文案。
- `required` 必须设置 `aria-required="true"`。

---

### 5.4 Modal（模态）

#### Anatomy

```
┌────────────────────────────────┐
│  Title                       [×]│  ← header 56px
├────────────────────────────────┤
│                                 │
│  Body content                    │  ← padding space-12
│                                 │
├────────────────────────────────┤
│       [Cancel]    [Confirm]     │  ← footer 64px, 右对齐
└────────────────────────────────┘
```

#### Sizes

| Size | 最大宽度 |
| --- | --- |
| `sm` | 400px |
| `md` | 560px |
| `lg` | 720px |
| `full` | 960px（仅重要流程） |

#### 背景遮罩

```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
}
```

#### 入场 / 退场

- 入场：`opacity 0→1` + `scale 0.96→1`，`--duration-base`，`--ease-emphatic`
- 退场：`opacity 1→0` + `scale 1→0.96`，`--duration-fast`，`--ease-accelerate`

#### Props

```ts
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  size?: 'sm' | 'md' | 'lg' | 'full';
  children: React.ReactNode;
  footer?: React.ReactNode;
  closable?: boolean;      // 显示 × 按钮，默认 true
  maskClosable?: boolean;  // 点击遮罩关闭，默认 true
}
```

#### A11y
- 容器 `role="dialog"` + `aria-modal="true"`。
- `aria-labelledby` 指向 Title。
- 焦点陷阱（Focus Trap）：打开时焦点移到内首个可聚焦元素；关闭时还原到打开前。
- Esc 关闭（除非 `closable={false}`）。

---

### 5.5 Navigation（导航）

#### 5.5.1 TopBar（顶部条）

```
┌────────────────────────────────────────────────┐
│ [Logo 看见地球]                  [图层▾] [?] [👤] │  ← height 56px, glass
└────────────────────────────────────────────────┘
```

- **高度**：56px
- **背景**：§4.4 玻璃质感
- **左**：Logo（点击回首页初始视角）+ 项目名
- **右**：图层切换按钮（`secondary` variant）、帮助按钮（`ghost`，`?` 图标）、用户头像（48×48，`--radius-full`）

#### 5.5.2 TabBar（页内标签）

```
┌────────────────────────────────┐
│ [Tab 1] [Tab 2] [Tab 3]          │  ← 48px, 下划线指示器
└────────────────────────────────┘
```

- 高度 48px；指示器 2px，激活色 `--color-primary-500`，切换时长 `--duration-base`。
- Tab 之间间距 `--space-6`；首尾到边缘 `--space-8`。

#### 5.5.3 Stepper（步骤条 · 仅寄明信片使用）

```
(1)───(2)───(3)
选择   写内容   寄出
```

- 步骤节点 32px 圆形，当前步骤 `--color-primary-500`，已完成步骤 `--color-success`，未开始 `--color-neutral-600`。
- 连接线 1px，已完成段 `--color-success`。

#### Props（TopBar）

```ts
interface TopBarProps {
  logo?: React.ReactNode;
  rightActions?: React.ReactNode[];   // 默认：图层、帮助、头像
  onLogoClick?: () => void;           // 默认：飞回初始视角
}
```

---

### 5.6 Loading（加载）

#### 5.6.1 Spinner（旋转圆环）

```css
.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid rgba(91, 168, 255, 0.2);
  border-top-color: var(--color-primary-500);
  border-radius: var(--radius-full);
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
```

- 尺寸：`sm` 16px / `md` 24px（默认） / `lg` 40px
- 颜色继承 `currentColor`，默认 `--color-primary-500`

#### 5.6.2 Skeleton（占位骨架）

```css
.skeleton {
  background: var(--color-neutral-800);
  border-radius: var(--radius-md);
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}
@keyframes skeleton-pulse {
  0%, 100% { opacity: 0.4; }
  50%      { opacity: 0.7; }
}
```

- 形状：`text`（条） / `circle`（圆） / `rect`（矩形）

#### 5.6.3 ProgressBar（线性进度）

- 高度 4px；背景 `--color-neutral-600`；填充 `--color-primary-500`；圆角 `--radius-full`。
- 可选 `indeterminate` 状态：填充从左滑到右，循环 1.5s。

---

### 5.7 EmptyState（空状态）

#### Anatomy

```
┌──────────────────────────────────────┐
│                                      │
│              [Icon 48px]              │
│                                      │
│            你还没有寄出过明信片        │  ← text-md
│       挑一个城市，把此刻寄给朋友吧      │  ← text-sm neutral-200
│                                      │
│           [寄出第一张]                 │  ← primary md
│                                      │
└──────────────────────────────────────┘
```

- 垂直居中（min-height 320px）；最大宽度 400px；左右居中。
- 图标：`--color-neutral-400`；CTA：`primary` variant `md` size。

#### Props

```ts
interface EmptyStateProps {
  icon: React.ReactNode;       // 必填，使用图标库
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}
```

---

### 5.8 Tag（标签）

#### Anatomy

```
┌────────────────┐
│ [icon] Label [×]│  ← height 24px, padding space-1 space-2
└────────────────┘
```

#### Variants

| Variant | 背景 | 文字 | 边框 | 用途 |
| --- | --- | --- | --- | --- |
| `default` | `--color-neutral-800` | `--color-neutral-100` | none | 中性标签 |
| `primary` | `rgba(91,168,255,0.12)` | `--color-primary-400` | none | 强调（"新"） |
| `success` | `rgba(74,222,128,0.12)` | `--color-success` | none | 成功（"已寄出"） |
| `warning` | `rgba(251,191,36,0.12)` | `--color-warning` | none | 警告 |
| `error` | `rgba(248,113,113,0.12)` | `--color-error` | none | 错误 |
| `outline` | transparent | `--color-neutral-100` | 1px neutral-600 | 弱化标签 |

#### Props

```ts
interface TagProps {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'outline';
  iconLeft?: React.ReactNode;
  onClose?: () => void;        // 设置后显示 × 按钮
  children: React.ReactNode;
}
```

#### A11y
- 关闭按钮 `aria-label="移除标签 <label>"`。

---

### 5.9 组件使用禁令

| 禁令 | 原因 |
| --- | --- |
| ❌ 自造按钮（如 `<div onClick>`） | 与 §10 A11y 冲突 |
| ❌ 同一页面按钮 ≥ 4 个 | 与 §1.4 克制冲突 |
| ❌ 输入框无 label | A11y 必备 |
| ❌ 模态叠模态 | 与 §1.1 极简冲突 |
| ❌ Loading 转圈超过 10s 无降级 | UX 灾难，必须配 Skeleton 或进度文案 |

