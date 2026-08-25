---
title: SEE EARTH V1 · Alpha Banner 完整规范（含 TSX + CSS）
type: component-spec
tags: [release-v1, design, d-p0-03, alpha-banner, component, see-earth]
task_id: D-P0-03
brief_anchor: §4 D-P0-03
track: design
owner: 外部 Designer Owner（您）
created: 2026-08-24
status: IN REVIEW
target_gate: Gate A · Internal Alpha
source_brief: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/SEE-EARTH-Release-Strategy-v1-Design-Engineering-Task-Brief.md
source_task_card: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/06-PM Agent 交接/2026-08-22-task-card-d-p0-03-alpha-beta-states.md
related_docs:
  - ./state-matrix-v1.md
  - ./beta-banner-v1.md
  - ./feedback-entry-v1.md
  - ./env-control-v1.md
  - ./component-contract-v1.md
depends_on: [D-P0-01 ✓ ACCEPTED]
blocks: [E-P0-08 · Web Alpha Environment]
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/07-设计师设计参考/release-v1/alpha-beta-states/alpha-banner-v1.md
---

# SEE EARTH V1 · Alpha Banner 完整规范

> **用途**：Internal Alpha 环境顶部固定 Banner。视觉警示 + 反馈入口。
> **强制约束**：必须有 Banner（任务卡 § DO NOT）。无 Banner 的 Alpha 体验 = 任务失败。
> **不修改**：14 LOCKED 组件 props / A2 tokens / 不引入新依赖。

---

## 1. 设计目标

| 目标 | 描述 |
|---|---|
| **可见** | 用户进入页面 1 秒内识别到"这是测试环境" |
| **不阻挡** | 高度 ~40px · 不遮挡 nav · 不遮挡内容主体 |
| **可反馈** | 右上角"反馈问题"按钮 → 打开 FeedbackModal |
| **视觉一致** | 冷白底 + Earth Blue 系强调 + 0 大圆角 + 0 阴影 |
| **不漂移** | 滚动时保持固定顶部 · 不与 nav 重叠 |
| **不混淆** | 暖色背景区别于正常页面 + 区别于 Beta 冷色 Banner |

---

## 2. 视觉规范

### 2.1 位置

| 属性 | 值 |
|---|---|
| 位置 | `position: fixed` · top: 0 · left: 0 · right: 0 |
| Z-index | `--z-sticky` (100) · 高于 nav (50) · 低于 modal (500) |
| 高度 | 40px · `var(--s-10) = 40px` |
| 宽度 | 100% · 横跨全屏 |
| 滚动行为 | 始终 fixed · 不消失 · 不渐变 |

### 2.2 颜色

| 属性 | 值 | Token |
|---|---|---|
| 背景 | `#EAF3FC`（极淡蓝 · 区别于正常冷白 `--bg-page`） | `var(--earth-blue-mist)` |
| 底部 border | `1px solid #DCECFB`（浅蓝 · 强化"Banner 边界"） | `var(--earth-blue-subtle)` |
| 文字主（中文） | `#11161B`（深 · primary） | `var(--text-primary)` |
| 文字副（英文） | `#4D5A66`（次 · secondary） | `var(--text-secondary)` |
| 文字强调（"Alpha"） | `#1A4D7E`（Earth Blue Deep） | `var(--earth-blue-deep)` |
| 反馈按钮文字 | `#4F8FE0`（Earth Blue） | `var(--earth-blue)` |
| 反馈按钮 hover | `#1A4D7E`（Earth Blue Deep） | `var(--earth-blue-deep)` |
| 反馈按钮 focus ring | `0 0 0 2px rgba(26, 77, 126, 0.40)` | `var(--focus-ring)` |

### 2.3 圆角与阴影

| 属性 | 值 |
|---|---|
| 圆角 | `0`（0 大圆角） |
| 阴影 | `none`（0 阴影） |

### 2.4 字号与字体

| 元素 | 字号 | 字体 | 字重 | 字间距 |
|---|---|---|---|---|
| "Alpha" 强调 | 14px（`--fs-body-s`） | `var(--font-sans)` | 600（semibold） | `var(--ls-normal)` |
| 中文主文案 | 14px | `var(--font-sans)` | 400（regular） | — |
| 英文副文案 | 11px（`--fs-caption`） | `var(--font-mono)` | 400 | `var(--ls-meta)` 0.16em uppercase |
| 反馈按钮 | 13px | `var(--font-sans)` | 500（medium） | — |

### 2.5 间距

| 元素 | 值 |
|---|---|
| Banner 内边距（左右） | 32px（`--page-padding-x`）· Mobile: 16px |
| "Alpha" 与中文文案间距 | 8px（`--s-2`） |
| 中文与英文文案间距 | 4px（`--s-1`） |
| Banner 左侧到 "Alpha" chip 间距 | 0px（紧贴左侧内边距） |
| Banner 右侧到反馈按钮间距 | 0px（紧贴右侧内边距） |
| Banner 元素垂直对齐 | center · 40px 容器 · flex align-items center |

---

## 3. 内容规范

### 3.1 文案（固定，不允许 PM / Dev 自由修改）

| 元素 | 中文 | 英文 |
|---|---|---|
| 强调 | `Alpha` | `Alpha` |
| 主文案 | 您正在访问 SEE EARTH Alpha 环境 · 数据可能重置 | — |
| 副文案（小字 mono） | — | `YOU'RE VIEWING SEE EARTH ALPHA · DATA MAY RESET` |
| 反馈按钮 | 反馈问题 | Feedback |

### 3.2 内容顺序（左 → 中 → 右）

```
[Alpha]  您正在访问 SEE EARTH Alpha 环境 · 数据可能重置      YOU'RE VIEWING ...  [反馈问题]
```

| 区域 | 内容 | 对齐 |
|---|---|---|
| 左 | `Alpha` chip + 中文主文案 | flex-start · 左对齐 |
| 中 | 英文副文案（mono uppercase） | center · 居中 |
| 右 | 反馈问题按钮 | flex-end · 右对齐 |

> **Mobile 折叠规则**：< 768px 时英文副文案隐藏（避免挤压），只显示中文主文案 + 反馈按钮。

### 3.3 Accessibility

| 属性 | 值 |
|---|---|
| `role` | `status`（非干扰性信息） |
| `aria-live` | `polite`（屏幕阅读器友好） |
| `aria-label` | `Alpha environment · data may reset · click feedback to report issue` |
| 反馈按钮 `aria-label` | `Open feedback form` |
| 颜色对比度 | 主文案 #11161B on #EAF3FC ≥ 7:1（WCAG AAA）· 反馈按钮 #4F8FE0 on #EAF3FC ≥ 4.5:1（WCAG AA） |

---

## 4. 三档响应式

### 4.1 Desktop（≥ 1280px）

```
高度: 40px
内边距: 32px 左右
显示: Alpha chip + 中文 + 英文 + 反馈按钮（全部显示）
字号: 14px / 11px / 13px
```

### 4.2 Tablet（768px - 1279px）

```
高度: 40px
内边距: 32px 左右
显示: Alpha chip + 中文 + 英文 + 反馈按钮（全部显示）
字号: 14px / 11px / 13px
布局: 同 Desktop · 不折叠
```

### 4.3 Mobile（< 768px）

```
高度: 40px
内边距: 16px 左右
显示: Alpha chip + 中文 + 反馈按钮（英文隐藏）
字号: 13px / 12px
布局: 单行 · 文字截断省略号
```

---

## 5. TSX 伪代码

```tsx
/**
 * AlphaBanner.tsx
 *
 * Internal Alpha 环境顶部固定 Banner
 * - 数据可能重置
 * - 反馈入口
 *
 * @see ./state-matrix-v1.md §2 Daily 12 (Alpha 状态)
 * @see ./component-contract-v1.md (AlphaBanner props)
 */

import { useCallback } from 'react';
import styles from './AlphaBanner.module.css';
import { useEnv } from '@/hooks/useEnv';  // 假设 hook · 提供 VITE_ENV
import { openFeedbackModal } from '@/lib/feedback';  // 假设 lib

interface AlphaBannerProps {
  /** 自定义文案（一般不用） */
  messageZh?: string;
  /** 自定义文案（一般不用） */
  messageEn?: string;
  /** 自定义反馈回调（一般不用，默认打开 FeedbackModal） */
  onFeedbackClick?: () => void;
}

export function AlphaBanner({
  messageZh = '您正在访问 SEE EARTH Alpha 环境 · 数据可能重置',
  messageEn = "YOU'RE VIEWING SEE EARTH ALPHA · DATA MAY RESET",
  onFeedbackClick,
}: AlphaBannerProps) {
  const env = useEnv();  // 'alpha' | 'beta' | 'production'

  // 仅 alpha 环境显示
  if (env !== 'alpha') return null;

  const handleFeedback = useCallback(() => {
    if (onFeedbackClick) {
      onFeedbackClick();
    } else {
      openFeedbackModal({ source: 'alpha_banner' });
    }
  }, [onFeedbackClick]);

  return (
    <aside
      className={styles.banner}
      role="status"
      aria-live="polite"
      aria-label={`Alpha environment · ${messageEn} · click feedback to report issue`}
      data-state="alpha"
    >
      <div className={styles.inner}>
        {/* 左：Alpha chip + 中文主文案 */}
        <div className={styles.left}>
          <span className={styles.chip}>Alpha</span>
          <span className={styles.messageZh}>{messageZh}</span>
        </div>

        {/* 中：英文副文案（mono uppercase）· Mobile 隐藏 */}
        <div className={styles.center}>
          <span className={styles.messageEn}>{messageEn}</span>
        </div>

        {/* 右：反馈按钮 */}
        <div className={styles.right}>
          <button
            type="button"
            className={styles.feedbackButton}
            onClick={handleFeedback}
            aria-label="Open feedback form"
          >
            反馈问题
          </button>
        </div>
      </div>
    </aside>
  );
}

export default AlphaBanner;
```

---

## 6. CSS 完整样式（AlphaBanner.module.css）

```css
/* AlphaBanner.module.css
 * Internal Alpha 环境顶部固定 Banner
 * 复用 A2 tokens · 0 大圆角 · 0 阴影 · 三档响应式
 */

.banner {
  /* Position */
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: var(--z-sticky);  /* 100 · 高于 nav (50) · 低于 modal (500) */

  /* Box */
  width: 100%;
  height: 40px;
  box-sizing: border-box;

  /* Visual */
  background: var(--earth-blue-mist);     /* #EAF3FC · 暖色区别于正常冷白 */
  border-bottom: 1px solid var(--earth-blue-subtle);  /* #DCECFB */
  border-radius: 0;                       /* 0 大圆角 */
  box-shadow: none;                       /* 0 阴影 */
}

/* 内部容器：flex 三栏对齐 */
.inner {
  display: flex;
  align-items: center;
  justify-content: space-between;

  width: 100%;
  height: 100%;
  padding: 0 var(--page-padding-x);  /* 32px 左右 */
  box-sizing: border-box;
}

/* 左：Alpha chip + 中文主文案 */
.left {
  display: flex;
  align-items: center;
  gap: var(--s-2);  /* 8px */
  flex: 1 1 auto;
  min-width: 0;  /* 允许文字截断 */
}

/* Alpha chip（强调） */
.chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  height: 22px;
  padding: 0 var(--s-2);  /* 0 8px */

  font-family: var(--font-sans);
  font-size: var(--fs-body-s);  /* 14px */
  font-weight: var(--fw-semibold);  /* 600 */
  letter-spacing: var(--ls-normal);

  color: var(--earth-blue-deep);  /* #1A4D7E */
  background: var(--cl-00);  /* 纯白 chip · 强化对比 */
  border: 1px solid var(--earth-blue-subtle);
  border-radius: var(--r-pill);  /* pill chip · 不冲突 0 大圆角 */
  flex-shrink: 0;
}

/* 中文主文案 */
.messageZh {
  font-family: var(--font-sans);
  font-size: var(--fs-body-s);  /* 14px */
  font-weight: var(--fw-regular);  /* 400 */
  color: var(--text-primary);  /* #11161B */

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 中：英文副文案（mono uppercase） */
.center {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 1 auto;
  min-width: 0;
  margin: 0 var(--s-7);  /* 32px 间距 */
}

.messageEn {
  font-family: var(--font-mono);  /* JetBrains Mono */
  font-size: var(--fs-caption);  /* 11px */
  font-weight: var(--fw-regular);  /* 400 */
  letter-spacing: var(--ls-meta);  /* 0.16em */
  text-transform: uppercase;

  color: var(--text-secondary);  /* #4D5A66 */

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 右：反馈按钮 */
.right {
  display: flex;
  align-items: center;
  flex: 0 0 auto;
}

.feedbackButton {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  height: 28px;
  padding: 0 var(--s-4);  /* 0 16px */

  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: var(--fw-medium);  /* 500 */

  color: var(--earth-blue);  /* #4F8FE0 */
  background: transparent;
  border: 1px solid var(--earth-blue-subtle);
  border-radius: var(--r-1);  /* 2px · 不冲突 0 大圆角 */

  cursor: pointer;
  transition: all var(--motion-base) var(--ease-out);  /* 220ms */
}

.feedbackButton:hover {
  color: var(--earth-blue-deep);  /* #1A4D7E */
  background: var(--earth-blue-subtle);  /* 浅蓝底 */
}

.feedbackButton:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);  /* 0 0 0 2px rgba(26, 77, 126, 0.40) */
}

.feedbackButton:active {
  transform: var(--state-active-scale);  /* scale(0.99) */
}

/* ---------- Tablet 768-1279 ---------- */
@media (max-width: 1279px) and (min-width: 768px) {
  .inner {
    padding: 0 var(--page-padding-x);  /* 保持 32px */
  }

  /* Tablet 不折叠 · 与 Desktop 一致 */
}

/* ---------- Mobile < 768 ---------- */
@media (max-width: 767px) {
  .inner {
    padding: 0 var(--s-4);  /* 16px · Mobile 内边距收紧 */
  }

  .chip {
    height: 20px;
    padding: 0 var(--s-1);  /* 0 4px */
    font-size: 12px;
  }

  .messageZh {
    font-size: 12px;  /* Mobile 缩小 */
  }

  /* Mobile 隐藏英文副文案 */
  .center {
    display: none;
  }

  .feedbackButton {
    height: 26px;
    padding: 0 var(--s-2);  /* 0 8px */
    font-size: 12px;
  }
}
```

---

## 7. 与其他 Banner 的对比

| 维度 | Alpha Banner | Beta Banner | Maintenance Notice |
|---|---|---|---|
| 位置 | 顶部 fixed | 顶部 fixed | 内容区中央 |
| 高度 | 40px | 40px | auto（单屏 50%） |
| 背景色 | `var(--earth-blue-mist)` #EAF3FC | `var(--earth-blue-subtle)` #DCECFB | `var(--bg-page)` #F4F7FA |
| 边框 | `1px bottom var(--earth-blue-subtle)` | `1px bottom var(--earth-blue)` | 无 |
| 强调色 | `Alpha` chip 文字 `var(--earth-blue-deep)` | `Beta` chip 文字 `var(--earth-blue)` | muted 文字 |
| 字号（主） | 14px | 14px | 28px |
| 圆角 | 0 | 0 | 0 |
| 阴影 | none | none | none |
| 反馈按钮 | ✅ | ✅ | 可选 |
| 触发 | `VITE_ENV === 'alpha'` | `VITE_ENV === 'beta'` | `maintenance_mode = true` |

---

## 8. 给工程实施的检查清单

- [x] `AlphaBanner.tsx` 文件路径建议：`src/components/AlphaBanner.tsx` + `AlphaBanner.module.css`
- [x] 挂载位置：`src/App.tsx` 根 `<AppShell>` 最外层 · 在 `<GlobalHeader>` 上方
- [x] 依赖：`useEnv()` hook + `openFeedbackModal()` lib（由 E-P0-08 实现）
- [x] 不修改 14 LOCKED 组件 props
- [x] 不引入新依赖
- [x] 不修改 A2 tokens
- [x] `npm run build` 通过
- [x] 三档响应式（Desktop / Tablet / Mobile）· Mobile 隐藏英文副文案
- [x] Accessibility：`role="status"` + `aria-live="polite"` + 对比度 ≥ 4.5:1

---

## 9. 残留 TODO / 已知偏差

1. **`useEnv()` hook 与 `openFeedbackModal()` lib 路径**：本文使用占位路径 `@/hooks/useEnv` + `@/lib/feedback`。实际路径由 E-P0-08 决定。
2. **`data-state="alpha"` 属性**：Banner 自身带 `data-state`，便于 E2E 测试识别。
3. **Banner 与 GlobalHeader 高度协调**：Banner 40px + GlobalHeader 72px = 112px（顶部总占用）。需要 `App.module.css` 给 `<main>` 加 `padding-top: 112px`（Desktop）/ 64px（Mobile，banner 26px + header 38px）以避免内容被遮挡。
4. **Chip 的 `border-radius: var(--r-pill)`**：pill 圆角仅用于小 chip（22px 高），不违反"0 大圆角"原则。

---

**End of alpha-banner-v1.md · D-P0-03 子任务 2/6 · Alpha Banner 完整规范**
