---
title: SEE EARTH V1 · AlphaBanner / BetaBanner / FeedbackModal 组件 Props 契约
type: component-contract
tags: [release-v1, design, d-p0-03, component-contract, props, alpha-beta, feedback-modal, see-earth]
task_id: D-P0-03
brief_anchor: §4 D-P0-03
track: design
owner: 外部 Designer Owner（您）
created: 2026-08-24
status: IN REVIEW
target_gate: Gate A · Internal Alpha / Gate B · Closed Beta
source_brief: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/SEE-EARTH-Release-Strategy-v1-Design-Engineering-Task-Brief.md
source_task_card: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/06-PM Agent 交接/2026-08-22-task-card-d-p0-03-alpha-beta-states.md
related_docs:
  - ./state-matrix-v1.md
  - ./alpha-banner-v1.md
  - ./beta-banner-v1.md
  - ./feedback-entry-v1.md
  - ./env-control-v1.md
depends_on: [D-P0-01 ✓ ACCEPTED]
blocks: [E-P0-08 · Web Alpha Environment]
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/07-设计师设计参考/release-v1/alpha-beta-states/component-contract-v1.md
---

# SEE EARTH V1 · AlphaBanner / BetaBanner / FeedbackModal 组件 Props 契约

> **用途**：定义 AlphaBanner / BetaBanner / FeedbackModal 三个新组件的 React Props 接口，作为工程实施的 source of truth。
> **不修改**：14 LOCKED 组件 props（GlobalHeader / CityCard / CityFeatured / MomentsTimeline / EarthGlobe / WorldTimeRail / EventDrawer / useNavigate / useHotkeys 等）。本文件仅定义 3 个新组件。
> **类型导出位置**：`src/components/AlphaBanner.tsx` / `src/components/BetaBanner.tsx` / `src/components/FeedbackModal.tsx` · Props 命名后缀统一为 `<ComponentName>Props`。

---

## 0. 阅读指南

- **Props 命名**：每个组件的 Props 接口命名为 `<ComponentName>Props`（如 `AlphaBannerProps`）。
- **可选 vs 必填**：仅 `required` 字段标红。所有字段默认 optional。
- **类型安全**：所有 union 类型有明确枚举值；不允许 `any`。
- **不变量**：每个组件都有"不变量"章节列出必须满足的约束。

---

## 1. AlphaBanner Props

### 1.1 Props 接口

```ts
/**
 * AlphaBanner 组件 Props
 * - 顶部固定 Banner · 显示 Alpha 环境提示 + 反馈入口
 * - 由 VITE_ENV=alpha 自动挂载（详见 env-control-v1.md）
 *
 * @see ./alpha-banner-v1.md 完整规范
 */

export interface AlphaBannerProps {
  /**
   * 中文主文案
   * @default '您正在访问 SEE EARTH Alpha 环境 · 数据可能重置'
   */
  messageZh?: string;

  /**
   * 英文副文案（小字 mono uppercase）
   * @default "YOU'RE VIEWING SEE EARTH ALPHA · DATA MAY RESET"
   */
  messageEn?: string;

  /**
   * 自定义反馈回调
   * - 若提供：点击"反馈问题"按钮时调用此回调（不打开默认 Modal）
   * - 若不提供：点击按钮时打开 FeedbackModal（默认行为）
   */
  onFeedbackClick?: () => void;

  /**
   * 自定义样式类名（注入到 .banner 根元素）
   * - 用于测试或特殊场景
   * - 默认不传
   */
  className?: string;

  /**
   * 测试 ID（注入到 data-testid）
   * @default 'alpha-banner'
   */
  testId?: string;
}
```

### 1.2 默认值

| Prop | 默认值 | 来源 |
|---|---|---|
| `messageZh` | `'您正在访问 SEE EARTH Alpha 环境 · 数据可能重置'` | 本文件 §1.1 |
| `messageEn` | `"YOU'RE VIEWING SEE EARTH ALPHA · DATA MAY RESET"` | 本文件 §1.1 |
| `onFeedbackClick` | `undefined`（默认打开 FeedbackModal） | 本文件 §1.1 |
| `className` | `undefined` | 本文件 §1.1 |
| `testId` | `'alpha-banner'` | 本文件 §1.1 |

### 1.3 不变量

1. **条件渲染**：组件内部根据 `useEnv()` 判断当前环境，仅当 `env === 'alpha'` 时返回非 null。否则返回 null。
2. **不修改 14 LOCKED 组件**：不引用、不调用 LOCKED 组件的方法。
3. **不引入新依赖**：不导入任何 npm 包（除 React 已有的）。
4. **不修改 A2 tokens**：仅消费既有 CSS 变量。
5. **可访问性**：必须包含 `role="status"` + `aria-live="polite"` + `aria-label`。
6. **响应式**：必须支持 Desktop ≥ 1280 / Tablet 768-1279 / Mobile < 768。
7. **键盘可达**：反馈按钮必须可用 Tab 聚焦 + Enter / Space 触发。

### 1.4 使用示例

```tsx
// 默认用法（推荐）
import { AlphaBanner } from '@/components/AlphaBanner';

function AppShell() {
  const env = useEnv();
  if (env !== 'alpha') return null;
  return <AlphaBanner />;
}

// 自定义反馈回调
import { AlphaBanner } from '@/components/AlphaBanner';

function AppShell() {
  const handleFeedback = () => {
    // 自定义逻辑
    console.log('Feedback clicked');
  };
  return <AlphaBanner onFeedbackClick={handleFeedback} />;
}

// 测试场景
import { AlphaBanner } from '@/components/AlphaBanner';

function TestPage() {
  return (
    <AlphaBanner
      messageZh="测试中文"
      messageEn="TEST ENGLISH"
      testId="custom-alpha-banner"
    />
  );
}
```

---

## 2. BetaBanner Props

### 2.1 Props 接口

```ts
/**
 * BetaBanner 组件 Props
 * - 顶部固定 Banner · 显示 Beta 环境提示 + 反馈入口
 * - 由 VITE_ENV=beta 自动挂载（详见 env-control-v1.md）
 *
 * @see ./beta-banner-v1.md 完整规范
 */

export interface BetaBannerProps {
  /**
   * 中文主文案
   * @default '您正在参与 SEE EARTH Beta 测试'
   */
  messageZh?: string;

  /**
   * 英文副文案（小字 mono uppercase）
   * @default "YOU'RE IN SEE EARTH BETA · INVITATION ONLY"
   */
  messageEn?: string;

  /**
   * 自定义反馈回调
   * - 若提供：点击"反馈问题"按钮时调用此回调（不打开默认 Modal）
   * - 若不提供：点击按钮时打开 FeedbackModal（默认行为）
   */
  onFeedbackClick?: () => void;

  /**
   * 自定义样式类名（注入到 .banner 根元素）
   * - 用于测试或特殊场景
   * - 默认不传
   */
  className?: string;

  /**
   * 测试 ID（注入到 data-testid）
   * @default 'beta-banner'
   */
  testId?: string;
}
```

### 2.2 默认值

| Prop | 默认值 | 来源 |
|---|---|---|
| `messageZh` | `'您正在参与 SEE EARTH Beta 测试'` | 本文件 §2.1 |
| `messageEn` | `"YOU'RE IN SEE EARTH BETA · INVITATION ONLY"` | 本文件 §2.1 |
| `onFeedbackClick` | `undefined`（默认打开 FeedbackModal） | 本文件 §2.1 |
| `className` | `undefined` | 本文件 §2.1 |
| `testId` | `'beta-banner'` | 本文件 §2.1 |

### 2.3 不变量

1. **条件渲染**：组件内部根据 `useEnv()` 判断当前环境，仅当 `env === 'beta'` 时返回非 null。否则返回 null。
2. **不修改 14 LOCKED 组件**：不引用、不调用 LOCKED 组件的方法。
3. **不引入新依赖**：不导入任何 npm 包（除 React 已有的）。
4. **不修改 A2 tokens**：仅消费既有 CSS 变量。
5. **可访问性**：必须包含 `role="status"` + `aria-live="polite"` + `aria-label`。
6. **响应式**：必须支持 Desktop ≥ 1280 / Tablet 768-1279 / Mobile < 768。
7. **键盘可达**：反馈按钮必须可用 Tab 聚焦 + Enter / Space 触发。
8. **与 AlphaBanner 互斥**：两个 Banner 不可能同时挂载（由 VITE_ENV 单一开关保证）。

### 2.4 使用示例

```tsx
// 默认用法（推荐）
import { BetaBanner } from '@/components/BetaBanner';

function AppShell() {
  const env = useEnv();
  if (env !== 'beta') return null;
  return <BetaBanner />;
}

// 自定义反馈回调
import { BetaBanner } from '@/components/BetaBanner';

function AppShell() {
  const handleFeedback = () => {
    // 自定义逻辑
    console.log('Feedback clicked');
  };
  return <BetaBanner onFeedbackClick={handleFeedback} />;
}

// 测试场景
import { BetaBanner } from '@/components/BetaBanner';

function TestPage() {
  return (
    <BetaBanner
      messageZh="测试中文"
      messageEn="TEST ENGLISH"
      testId="custom-beta-banner"
    />
  );
}
```

---

## 3. FeedbackModal Props

### 3.1 Props 接口

```ts
/**
 * FeedbackModal 组件 Props
 * - Alpha / Beta Banner "反馈问题" 触发的反馈 Modal
 * - 字段：类型 / 描述 / 截图 / 邮箱
 * - 提交后显示 Toast "感谢反馈" 3 秒
 *
 * @see ./feedback-entry-v1.md 完整规范
 */

export type FeedbackType = 'bug' | 'content' | 'ux' | 'other';

export type FeedbackSource =
  | 'alpha_banner'
  | 'beta_banner'
  | 'maintenance_notice'
  | 'unknown'  // 兜底 · 未知来源
  ;

export interface FeedbackModalProps {
  /**
   * Modal 是否打开
   * @required
   */
  isOpen: boolean;

  /**
   * 关闭回调
   * - 用户点击 × / 背景 / 取消 / ESC 时触发
   * - 提交成功后也会触发（先关闭 Modal，再显示 Toast）
   * @required
   */
  onClose: () => void;

  /**
   * 反馈来源（用于 Analytics 区分）
   * - alpha_banner: 来自 Alpha Banner
   * - beta_banner: 来自 Beta Banner
   * - maintenance_notice: 来自 Maintenance Notice
   * - unknown: 兜底
   * @default 'unknown'
   */
  source?: FeedbackSource;

  /**
   * 自定义提交回调
   * - 若提供：组件不调用默认 fetch，而是调用此回调
   * - 回调参数：FeedbackPayload（详见 feedback-entry-v1.md §6）
   * - 回调应返回 Promise<{ success: boolean; error?: string }>
   * - 若不提供：使用默认 fetch('/api/feedback', POST)
   */
  onSubmit?: (payload: FeedbackPayload) => Promise<{ success: boolean; error?: string }>;

  /**
   * 自定义样式类名（注入到 .modal 根元素）
   */
  className?: string;

  /**
   * 测试 ID
   * @default 'feedback-modal'
   */
  testId?: string;
}

/**
 * FeedbackModal 提交时使用的 Payload 类型
 * （默认 fetch 实现 / onSubmit 回调都使用）
 */
export interface FeedbackPayload {
  /** 反馈类型 */
  type: FeedbackType;

  /** 详细描述（已 trim · 已校验非空） */
  description: string;

  /** 截图 base64（已 canvas re-render 剥离 EXIF）· 可选 */
  screenshotBase64: string | null;

  /** 邮箱（已 trim · 空字符串视为 null）· 可选 */
  email: string | null;

  /** 反馈来源 */
  source: FeedbackSource;

  /** 当前环境（alpha / beta / production） */
  env: 'alpha' | 'beta' | 'production';

  /** 当前 URL */
  url: string;

  /** Build hash（import.meta.env.VITE_BUILD_HASH） */
  buildHash: string;

  /** 简化 UA（仅取第一个空格前部分）· 非 fingerprint */
  userAgent: string;
}
```

### 3.2 默认值

| Prop | 默认值 | 来源 |
|---|---|---|
| `isOpen` | **必填**（无默认） | 本文件 §3.1 |
| `onClose` | **必填**（无默认） | 本文件 §3.1 |
| `source` | `'unknown'` | 本文件 §3.1 |
| `onSubmit` | `undefined`（默认 fetch POST） | 本文件 §3.1 |
| `className` | `undefined` | 本文件 §3.1 |
| `testId` | `'feedback-modal'` | 本文件 §3.1 |

### 3.3 不变量

1. **条件渲染**：仅当 `isOpen === true` 时通过 `createPortal` 渲染到 `document.body`。否则返回 null。
2. **截图处理**：截图必须在客户端用 canvas re-render，**剥离所有 EXIF / GPS / 拍摄时间 / 设备信息**。不调用任何上传原始文件的服务。
3. **不修改 14 LOCKED 组件**：不引用、不调用 LOCKED 组件的方法。
4. **不引入新依赖**：不导入任何 npm 包（除 React 已有的）。可选用 Tally.so iframe（不需 npm install）。
5. **不修改 A2 tokens**：仅消费既有 CSS 变量。
6. **可访问性**：`role="dialog"` + `aria-modal="true"` + `aria-labelledby="feedback-title"` + ESC 关闭 + Tab 循环 + 焦点管理。
7. **响应式**：必须支持 Desktop ≥ 1280 / Tablet 768-1279 / Mobile < 768。
8. **错误处理**：提交失败不关闭 Modal，显示错误提示 + 允许重试。
9. **成功处理**：提交成功后关闭 Modal + 显示 Toast 3 秒 + 重置表单。
10. **背景关闭**：点击 backdrop 关闭 Modal（提交中除外）。
11. **提交中保护**：提交中所有字段 disabled + 关闭按钮 disabled + ESC 监听失效。

### 3.4 使用示例

```tsx
// 默认用法（最常见 · 从 Banner 打开）
import { FeedbackModal } from '@/components/FeedbackModal';

function AppShell() {
  const [isOpen, setIsOpen] = useState(false);
  const env = useEnv();

  const openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => setIsOpen(false), []);

  return (
    <>
      {env === 'alpha' && <AlphaBanner />}
      {env === 'beta' && <BetaBanner />}

      {/* 全局挂载 · 由各 Banner 触发打开 */}
      <FeedbackModal
        isOpen={isOpen}
        onClose={closeModal}
        source={env === 'alpha' ? 'alpha_banner' : 'beta_banner'}
      />
    </>
  );
}

// 自定义 onSubmit（测试 / 离线场景）
import { FeedbackModal, type FeedbackPayload } from '@/components/FeedbackModal';

function TestPage() {
  const handleSubmit = async (payload: FeedbackPayload) => {
    console.log('Test payload:', payload);
    return { success: true };
  };

  return (
    <FeedbackModal
      isOpen={true}
      onClose={() => {}}
      source="unknown"
      onSubmit={handleSubmit}
    />
  );
}

// Maintenance Notice 触发（详见 state-matrix-v1.md §8.1）
import { FeedbackModal } from '@/components/FeedbackModal';

function MaintenanceNotice() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button onClick={() => setIsOpen(true)}>反馈问题</button>
      <FeedbackModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        source="maintenance_notice"
      />
    </>
  );
}
```

---

## 4. 共享类型导出

### 4.1 src/types/feedback.ts（新文件）

```ts
/**
 * Feedback 相关共享类型
 * - 由 FeedbackModal、AlphaBanner、BetaBanner、Analytics 共用
 */

/** 反馈类型枚举 */
export type FeedbackType = 'bug' | 'content' | 'ux' | 'other';

/** 反馈来源枚举 */
export type FeedbackSource =
  | 'alpha_banner'
  | 'beta_banner'
  | 'maintenance_notice'
  | 'unknown';

/** FeedbackModal 提交 Payload */
export interface FeedbackPayload {
  type: FeedbackType;
  description: string;
  screenshotBase64: string | null;
  email: string | null;
  source: FeedbackSource;
  env: 'alpha' | 'beta' | 'production';
  url: string;
  buildHash: string;
  userAgent: string;
}

/** 反馈类型显示文案映射（中/英） */
export const FEEDBACK_TYPE_LABELS: Readonly<
  Record<FeedbackType, { zh: string; en: string }>
> = Object.freeze({
  bug:     { zh: '功能异常', en: 'Bug' },
  content: { zh: '内容',     en: 'Content' },
  ux:      { zh: '体验',     en: 'UX' },
  other:   { zh: '其他',     en: 'Other' },
});

/** 反馈来源显示文案映射（中/英） */
export const FEEDBACK_SOURCE_LABELS: Readonly<
  Record<FeedbackSource, { zh: string; en: string }>
> = Object.freeze({
  alpha_banner:       { zh: 'Alpha Banner',     en: 'Alpha Banner' },
  beta_banner:        { zh: 'Beta Banner',      en: 'Beta Banner' },
  maintenance_notice: { zh: '维护提示',         en: 'Maintenance Notice' },
  unknown:            { zh: '未知',             en: 'Unknown' },
});
```

### 4.2 src/types/env.ts（已在 env-control-v1.md 中定义）

```ts
export type ViteEnv = 'alpha' | 'beta' | 'production';
```

---

## 5. 全局 lib 函数

### 5.1 src/lib/feedback.ts（新文件）

```ts
/**
 * 全局反馈 Modal 控制 lib
 * - 提供 openFeedbackModal() 函数
 * - 由 AlphaBanner / BetaBanner / MaintenanceNotice 调用
 * - 内部维护全局 Modal 实例（如使用 portal + zustand）
 */

import type { FeedbackSource } from '@/types/feedback';

let _isOpen = false;
let _source: FeedbackSource = 'unknown';
let _listeners: Array<(state: { isOpen: boolean; source: FeedbackSource }) => void> = [];

/**
 * 打开 FeedbackModal
 * @param options.source - 反馈来源
 */
export function openFeedbackModal(options: { source?: FeedbackSource } = {}): void {
  _source = options.source ?? 'unknown';
  _isOpen = true;
  _notify();
}

/**
 * 关闭 FeedbackModal
 */
export function closeFeedbackModal(): void {
  _isOpen = false;
  _notify();
}

/**
 * 订阅 Modal 状态变化
 * @returns unsubscribe 函数
 */
export function subscribeFeedbackModal(
  listener: (state: { isOpen: boolean; source: FeedbackSource }) => void
): () => void {
  _listeners.push(listener);
  // 立即触发一次（同步当前状态）
  listener({ isOpen: _isOpen, source: _source });
  return () => {
    _listeners = _listeners.filter((l) => l !== listener);
  };
}

/**
 * 获取当前状态（不订阅）
 */
export function getFeedbackModalState(): { isOpen: boolean; source: FeedbackSource } {
  return { isOpen: _isOpen, source: _source };
}

function _notify(): void {
  const state = { isOpen: _isOpen, source: _source };
  _listeners.forEach((l) => l(state));
}
```

### 5.2 简化方案（V1 建议）

> 💡 **V1 简化方案**：如果不想引入全局 lib，可以让 Banner 接受 `onFeedbackClick` prop，由 AppShell 维护 `isOpen` state。代码量稍多但更直观。

```tsx
// AppShell.tsx
function AppShell() {
  const env = useEnv();
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  return (
    <>
      {env === 'alpha' && <AlphaBanner onFeedbackClick={() => setFeedbackOpen(true)} />}
      {env === 'beta' && <BetaBanner onFeedbackClick={() => setFeedbackOpen(true)} />}
      <FeedbackModal
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        source={env === 'alpha' ? 'alpha_banner' : env === 'beta' ? 'beta_banner' : 'unknown'}
      />
    </>
  );
}
```

---

## 6. AppShell 集成完整示例

```tsx
// src/App.tsx

import { useState, useCallback } from 'react';
import { useEnv } from '@/hooks/useEnv';
import { AlphaBanner } from '@/components/AlphaBanner';
import { BetaBanner } from '@/components/BetaBanner';
import { FeedbackModal } from '@/components/FeedbackModal';
import type { FeedbackSource } from '@/types/feedback';
import { GlobalHeader } from '@/components/ui/GlobalHeader';  // LOCKED
import { AppRoutes } from '@/router/Router';

function AppShell() {
  const env = useEnv();
  const showBanner = env === 'alpha' || env === 'beta';

  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const openFeedback = useCallback(() => setFeedbackOpen(true), []);
  const closeFeedback = useCallback(() => setFeedbackOpen(false), []);

  const feedbackSource: FeedbackSource =
    env === 'alpha' ? 'alpha_banner' :
    env === 'beta' ? 'beta_banner' :
    'unknown';

  return (
    <>
      {/* 1. 顶部 Banner（互斥） */}
      {env === 'alpha' && (
        <AlphaBanner onFeedbackClick={openFeedback} />
      )}
      {env === 'beta' && (
        <BetaBanner onFeedbackClick={openFeedback} />
      )}

      {/* 2. Header (LOCKED 14 组件之一) */}
      <GlobalHeader ... />

      {/* 3. 主内容 · padding-top 避免被 Banner 遮挡 */}
      <main
        className={styles.main}
        style={{ paddingTop: showBanner ? '112px' : '72px' }}
      >
        <AppRoutes />
      </main>

      {/* 4. 全局 FeedbackModal（仅在 alpha / beta 环境挂载） */}
      {showBanner && (
        <FeedbackModal
          isOpen={feedbackOpen}
          onClose={closeFeedback}
          source={feedbackSource}
        />
      )}
    </>
  );
}

export default AppShell;
```

---

## 7. 不变量总览（PM 验收用）

| 组件 | 关键不变量 |
|---|---|
| **AlphaBanner** | 仅 alpha 环境渲染 · 引用 `useEnv()` · 不调用 LOCKED 组件 · 不引入新依赖 · A2 视觉一致 · 三档响应式 · accessibility 完整 |
| **BetaBanner** | 仅 beta 环境渲染 · 引用 `useEnv()` · 不调用 LOCKED 组件 · 不引入新依赖 · A2 视觉一致 · 三档响应式 · accessibility 完整 · 与 AlphaBanner 互斥 |
| **FeedbackModal** | 仅在 isOpen=true 时渲染 · 客户端剥离 EXIF · 不调用 LOCKED 组件 · 不引入新依赖 · A2 视觉一致 · 三档响应式 · accessibility 完整 · ESC/背景关闭 · 提交中保护 |

---

## 8. 给工程实施的检查清单

- [x] `src/components/AlphaBanner.tsx` + `AlphaBanner.module.css`
- [x] `src/components/BetaBanner.tsx` + `BetaBanner.module.css`
- [x] `src/components/FeedbackModal.tsx` + `FeedbackModal.module.css`
- [x] `src/types/feedback.ts`（FeedbackType / FeedbackSource / FeedbackPayload）
- [x] `src/types/env.ts`（已在 env-control-v1.md 中定义）
- [x] `src/hooks/useEnv.ts`（已在 env-control-v1.md 中定义）
- [x] `src/lib/feedback.ts`（可选 · 全局 lib 方案）
- [x] `src/App.tsx` 集成（条件渲染 Banner + Modal）
- [x] 不修改 14 LOCKED 组件 props（仅复用其 UI）
- [x] 不引入新依赖
- [x] 不修改 A2 tokens
- [x] `npm run build` 通过（production 模式）
- [x] `npm run test` 通过
- [x] 三档响应式（Desktop / Tablet / Mobile）
- [x] Accessibility：role / aria-* / 焦点管理 / ESC 关闭
- [x] Analytics 集成（`source` 字段 + `env` 字段）

---

## 9. 残留 TODO / 已知偏差

1. **src/lib/feedback.ts 全局 lib 方案 vs AppShell state 方案**：本文给出两种方案。V1 推荐 AppShell state（更直观、更少抽象）。全局 lib 方案适合更复杂的场景（如多个 Banner 嵌套）。
2. **FeedbackModal 截图上传方式**：本文规定默认 fetch JSON + base64 inline。如果后端支持 multipart，建议改为 FormData（性能更好）。
3. **VITE_BUILD_HASH 来源**：本文使用 `import.meta.env.VITE_BUILD_HASH`，实际由 Vercel 构建注入。
4. **TSX 文件位置**：本文建议 `src/components/<Name>.tsx`。如果项目用 kebab-case 命名（如 `alpha-banner.tsx`），可调整。
5. **Props 默认值 vs Props 必填**：本文所有字段 optional + 默认值。如果 PM 决定某些字段必填（如 `messageZh`），需调整。
6. **TypeScript strict mode**：本文所有类型基于 strict mode（无 any）。如果项目 strict mode 未启用，部分类型可能需要 `as` cast。

---

**End of component-contract-v1.md · D-P0-03 子任务 6/6 · 组件 Props 契约**
