---
title: SEE EARTH V1 · 状态组件 Props 约定 · 给工程师实施用
type: design-component-contract
tags: [release-v1, design, d-p0-04, system-states, component-contract, props, typescript, see-earth]
task_id: D-P0-04
brief_anchor: §4 D-P0-04 + Task Card §C §D
track: design
owner: 外部 Designer Owner（您）
created: 2026-08-24
status: IN REVIEW
target_gate: Gate A · Internal Alpha
source_brief: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/SEE-EARTH-Release-Strategy-v1-Design-Engineering-Task-Brief.md
source_task_card: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/06-PM Agent 交接/2026-08-22-task-card-d-p0-04-system-states.md
related_docs:
  - ./state-matrix-v1.md
  - ./loading-error-empty-v1.md
  - ./copy-library-v1.md
  - ../web-v1-flow/design-freeze-log-v1.md (§6 14 组件 6 状态 LOCKED)
  - ../web-v1-flow/responsive-rules-v1.md (§3 逐页面 / §5 信息层级)
  - ../web-v1-flow/layer-qa-v1.md (§1.2 Layer 全局规则)
  - ../minimal-witness/state-matrix-v1.md (Witness 76 状态)
  - ../analytics-events/event-map-v1.md (§1-§5 P0 14 事件 / §5 字段名一致性矩阵)
  - ../analytics-events/forbidden-fields-v1.md (30 禁采项)
  - ../../05-项目现状/release-v1/design-implementation/phase1-design-impl-report.md (VF 1.2 token)
  - ../../05-项目现状/release-v1/design-implementation/v2-phase15-report.md (A2 LOCK 视觉)
depends_on: [D-P0-01 LOCKED ✓, D-P0-02 IN REVIEW]
blocks: [D-P0-06 Launch Checklist, E-P0-10 Monitoring/Error/Performance 基线]
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/07-设计师设计参考/release-v1/system-states/component-contract-v1.md
workspace_canonical_path: /Users/lwy/Documents/ChatGPT/看见地球/release-v1/system-states/component-contract-v1.md
note: 本文件已就绪，需 PM Agent 由 Obsidian 写入权限落地到 canonical 路径。
---

# SEE EARTH V1 · 状态组件 Props 约定 · 给工程师实施用

> **作者**：Designer Agent #4（外部 Owner = 您）
> **目标读者**：Web 工程师 / iOS 工程师（first-pass）/ E-P0-09 Contract Owner / E-P0-10 Monitoring Owner / QA
> **目的**：为**状态层组件**（State Layer Components）建立 **TypeScript Props 约定**——使工程师可直接基于本文件 + `state-matrix-v1.md` + `loading-error-empty-v1.md` + `copy-library-v1.md` 实施，**不猜测**状态字段。
> **强制约束**（来自 Brief §4 D-P0-04 + Task Card DO NOT）：
> 1. **不修改 14 LOCKED 组件的 props / API**（可**新增**状态由 props 驱动，不改**现有** props）
> 2. **复用 A2 tokens**（不引入新颜色 / 字体 / 圆角 / 阴影 / 动效）
> 3. **三档响应式**（Desktop / Tablet / Mobile 与 `responsive-rules-v1.md` 一致）

---

## 0. 阅读指南

- **§1 状态组件总览**（5 大类状态组件 + 与 14 LOCKED 组件的关系）
- **§2 通用状态枚举**（Daily 12 / Moment / City / Unknown / Witness / Echo 顶层状态 TypeScript 类型）
- **§3 Error 通用组件 Props**（StateErrorProps / StateSkeletonProps / StateEmptyProps / StatePermissionProps / StatePrivacyProps）
- **§4 6 对象状态 props**（Daily12GridProps / MomentCardProps / CityPageProps / UnknownPageProps / WitnessFlowProps / EchoComposerProps）
- **§5 与 14 LOCKED 组件的集成示例**（不修改 LOCKED 组件，仅由 props 驱动状态）
- **§6 字段对齐矩阵**（与 E-P0-09 contract / event-map-v1 §5 / forbidden-fields-v1 一致性）
- **§7 实施优先级 + 风险**
- **§8 自验收 checklist**

---

## §1 状态组件总览

### 1.1 5 大类状态组件

| # | 组件名 | 用途 | 适用对象 | 复用 14 LOCKED 组件 |
|---|---|---|---|---|
| 1 | **`<StateSkeleton>`** | Loading 骨架屏（全站通用）| Daily 12 / Moment / City / Unknown / Witness / Echo | 否（独立组件）|
| 2 | **`<StateError>`** | Error 错误卡片（全站通用）| 全站 | 否（独立组件）|
| 3 | **`<StateEmpty>`** | Empty 空状态卡片（全站通用）| Daily 12 / Moment / City / Unknown / Witness / Echo | 否（独立组件）|
| 4 | **`<StatePermissionBanner>`** | Permission 权限 Banner（全站通用）| Witness（iOS 通知）| 否（独立组件）|
| 5 | **`<StatePrivacyPreview>`** | Privacy 公开预览卡片（Witness 专用）| Witness 段 5 | 否（独立组件）|

> **不修改 14 LOCKED 组件**：5 类状态组件均为**新增组件**，不修改 `design-freeze-log-v1.md §6` 列出的 14 个组件的 props / API。14 LOCKED 组件的 **6 状态**（default / hover / focus / active / disabled / success）由其自身 props 驱动；状态层组件作为**包裹层**或**替代层**出现。

### 1.2 14 LOCKED 组件 × 状态层组件关系

| LOCKED 组件 | 自身 6 状态 | 与状态层组件关系 |
|---|---|---|
| **GlobalHeader** | Default / Hover / Focus / Active / Disabled / Success | 不受状态层组件影响；Error 时仍可见（顶部导航可用）|
| **SectionHeader** | 静态（无状态）| 不受状态层组件影响 |
| **HeroMedia** | Default / Hover / Focus / Active / Disabled / Success | Error 时降级为 StateError；Loading 时降级为 StateSkeleton |
| **WorldTimeRail** | Default / Hover / Focus / Active / Disabled / Success | Error 时降级为 StateError；Loading 时降级为 StateSkeleton |
| **TimeDisplay** | Default / Hover / Focus / Active / Disabled / Success | Error 时降级为"——"；Loading 时降级为 StateSkeleton |
| **TimeComparison** | Default / Hover / Focus / Active / Disabled / Success | Error 时降级为 StateError；Loading 时降级为 StateSkeleton |
| **CoordinateWindow** | Default / Hover / Focus / Active / Disabled / Success | Error 时降级为 StateError；Loading 时降级为 StateSkeleton |
| **LocationMeta** | 静态 | Error 时降级为"——" |
| **LayerIndicator** | Default / Hover / Focus / Active / Disabled / Success | Error 时降级为 StateError |
| **OneScene** | Default / Hover / Focus / Active / Disabled / Success | Error 时降级为 StateError；Loading 时降级为 StateSkeleton |
| **SameSecond** | Default / Hover / Focus / Active / Disabled / Success | Error 时降级为 StateError；Loading 时降级为 StateSkeleton |
| **EchoInput** | Default / Hover / Focus / Typing / Submitted | **扩展为 8 态**：新增 Disabled / Error / Loading（详见 §4.6）|
| **DistanceNavigation** | Default / Hover / Focus / Active / Disabled / Success | Error 时降级为 StateError；Loading 时降级为 StateSkeleton |
| **RevealMeta** | Default / Hover / Focus / Active / Disabled / Success | Error 时降级为 StateError；Loading 时降级为 StateSkeleton |

> **核心规则**：14 LOCKED 组件的 props **不变**；状态切换由**容器组件**（如 `<Daily12Grid>` / `<CityPageShell>` / `<MomentCard>`）的 state prop 驱动，**容器组件**根据 state prop 决定渲染 LOCKED 组件还是状态层组件。

---

## §2 通用状态枚举（TypeScript 类型）

### 2.1 错误分类（与 E-P0-09 contract 对齐）

```typescript
/**
 * SEE EARTH V1 · Error 分类
 * 来源：state-matrix-v1.md §9 + loading-error-empty-v1.md §2.1
 * 与 E-P0-09 contract error_category 对齐
 */
export type ErrorCategory =
  | 'network_offline'
  | 'network_timeout'
  | 'media_load'
  | 'server_5xx'
  | 'server_4xx_validation'
  | 'server_4xx_rate_limited'
  | 'server_4xx_duplicate'
  | 'server_4xx_permission_blocked'
  | 'validation'
  | 'captured_at_invalid'
  | 'exif_untrusted'
  | 'permission_denied'
  | 'rate_limited'
  | 'data_integrity'
  | 'timezone_unsupported'
  | 'weather_provider_down'
  | 'client_render'
  | 'reveal_validation'
  | 'upload_network'
  | 'upload_timeout';

/**
 * 重试性（与 E-P0-09 contract retryable 对齐）
 */
export type Retryable = boolean;

/**
 * 错误 ID（与 E-P0-10 监控 ID 体系一致）
 * 8 字符 base36 hash
 */
export type ErrorId = string;
```

### 2.2 通用状态枚举

```typescript
/**
 * Daily 12 顶层状态（8 个）
 * 来源：state-matrix-v1.md §1.1
 */
export type Daily12State =
  | 'loading_skeleton'
  | 'ready'
  | 'partial_missing'
  | 'fully_unavailable'
  | 'stale_fallback'
  | 'empty'
  | 'retrying'
  | 'error_boundary';

/**
 * Moment 顶层状态（8 个）
 * 来源：state-matrix-v1.md §2.1
 */
export type MomentState =
  | 'image_loading'
  | 'image_failed'
  | 'content_withdrawn'
  | 'source_pending_verification'
  | 'city_unknown'
  | 'placeholder_unscheduled'
  | 'ready'
  | 'error_unknown';

/**
 * City 顶层状态（9 个）
 * 来源：state-matrix-v1.md §3.1
 */
export type CityState =
  | 'city_loading'
  | 'city_ready_with_moments'
  | 'city_ready_basic_only'
  | 'city_timezone_failed'
  | 'city_weather_failed'
  | 'city_unsupported'
  | 'city_past_only'
  | 'city_error'
  | 'city_error_boundary';

/**
 * Unknown 顶层状态（6 个）
 * 来源：state-matrix-v1.md §4.1
 */
export type UnknownState =
  | 'unknown_loading'
  | 'unknown_ready'
  | 'unknown_empty'
  | 'reveal_failed'
  | 'content_retired'
  | 'reveal_interrupted';

/**
 * Witness 顶层状态（9 个）
 * 来源：state-matrix-v1.md §5.1 + D-P0-02 子状态
 */
export type WitnessState =
  | 'witness_loading'
  | 'witness_permission'
  | 'witness_uploading'
  | 'witness_validating'
  | 'witness_under_review'
  | 'witness_retry'
  | 'witness_failed_terminal'
  | 'witness_empty'
  | 'witness_published';

/**
 * Echo 顶层状态（8 个 · 扩展自 LOCKED 5 态）
 * 来源：state-matrix-v1.md §6.1
 */
export type EchoState =
  | 'default'
  | 'focus'
  | 'typing'
  | 'disabled'
  | 'submitting'
  | 'success'
  | 'error'
  | 'loading';
```

### 2.3 通用 Permission 类型（与 D-P0-02 §1 一致）

```typescript
/**
 * 权限类型（与 D-P0-02 §1 + event-map-v1 §5 permission_type 对齐）
 */
export type PermissionType = 'camera' | 'photo_library' | 'location' | 'notification';

/**
 * 权限结果（与 D-P0-02 §1 + event-map-v1 §5 result 对齐）
 */
export type PermissionResult =
  | 'not_determined'
  | 'granted'
  | 'denied'
  | 'restricted'
  | 'denied_permanent';

/**
 * 权限对象
 */
export type Permission = {
  type: PermissionType;
  result: PermissionResult;
  /** iOS 限定 · 精度 > 500m 时标记为 degraded */
  degraded?: boolean;
};
```

---

## §3 Error 通用组件 Props

### 3.1 `<StateSkeleton>` Props

```typescript
import type { ReactNode } from 'react';

/**
 * 通用 Loading 骨架屏（全站统一）
 * 视觉规范：loading-error-empty-v1.md §1.2.1
 * - 底色：var(--bg-hero-mist)
 * - 边框：1px solid var(--border-hairline)
 * - 圆角：var(--r-1) 2px
 * - 阴影：none
 * - 动画：none（无 spinner / 无 shimmer / 无进度条）
 */
export type StateSkeletonProps = {
  /** 骨架屏占位类型 */
  variant?: 'card' | 'tile' | 'full' | 'inline';
  /** 骨架屏宽（默认 100%）*/
  width?: string;
  /** 骨架屏高（默认 200px）*/
  height?: string;
  /** 加载文字（zh-CN / en）*/
  loadingText?: string;
  /** 加载文字位置 */
  loadingTextPosition?: 'bottom' | 'center' | 'hidden';
  /** 三档响应式覆盖 */
  responsive?: {
    mobile?: Partial<StateSkeletonProps>;
    tablet?: Partial<StateSkeletonProps>;
    desktop?: Partial<StateSkeletonProps>;
  };
  /** ARIA label */
  'aria-label'?: string;
  /** 子内容（占位插槽）*/
  children?: ReactNode;
};
```

### 3.2 `<StateError>` Props

```typescript
import type { ReactNode } from 'react';
import type { ErrorCategory, ErrorId, Retryable } from './types';

/**
 * 通用 Error 错误卡片（全站统一）
 * 视觉规范：loading-error-empty-v1.md §2.3
 * - 容器底色：var(--bg-page)
 * - 容器边框：1px solid var(--border-hairline)
 * - 标题字体：var(--font-display)
 * - 副标字体：var(--font-sans)
 * - 错误 ID 字体：var(--font-mono)
 */
export type StateErrorProps = {
  /** Error 分类（与 E-P0-09 contract error_category 对齐）*/
  errorCategory: ErrorCategory;
  /** 重试性 */
  retryable: Retryable;
  /** 错误 ID（8 字符 base36 hash）*/
  errorId?: ErrorId;
  /** 错误标题（zh-CN / en）*/
  title: string;
  /** 错误描述（zh-CN / en）*/
  message: string;
  /** 主 CTA（重试 / 返回首页 等）*/
  primaryAction?: {
    label: string;
    onClick: () => void;
    /** CTA 类型（影响视觉）*/
    variant?: 'primary' | 'secondary';
  };
  /** 次 CTA（取消 / 看反馈 等）*/
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  /** 反馈入口（与 E-P0-10 反馈渠道对齐）*/
  feedbackAction?: {
    label: string;
    href: string;
    target?: '_blank' | '_self';
  };
  /** 三档响应式覆盖 */
  responsive?: {
    mobile?: Partial<StateErrorProps>;
    tablet?: Partial<StateErrorProps>;
    desktop?: Partial<StateErrorProps>;
  };
  /** 子内容（错误详情插槽）*/
  children?: ReactNode;
};
```

### 3.3 `<StateEmpty>` Props

```typescript
import type { ReactNode } from 'react';

/**
 * 通用 Empty 空状态卡片（全站统一）
 * 视觉规范：loading-error-empty-v1.md §3.3
 * - 容器底色：var(--bg-page)
 * - 诗意字体：var(--font-editorial) italic
 * - CTA 视觉：Earth Blue 1px underline + 0 大圆角 + 0 阴影
 */
export type StateEmptyProps = {
  /** Empty 诗意短句（zh-CN / en）*/
  poeticLine: string;
  /** Empty 解释（zh-CN / en）*/
  explanation?: string;
  /** 引导 CTA */
  primaryAction?: {
    label: string;
    onClick: () => void;
    /** CTA 类型 */
    variant?: 'primary' | 'secondary';
  };
  /** 次 CTA（如"看其他"）*/
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  /** LOCKED State E Empty 70% 空白规则 */
  minHeight?: '70%' | '100vh' | string;
  /** 三档响应式覆盖 */
  responsive?: {
    mobile?: Partial<StateEmptyProps>;
    tablet?: Partial<StateEmptyProps>;
    desktop?: Partial<StateEmptyProps>;
  };
  /** 子内容（诗意插图插槽）*/
  children?: ReactNode;
};
```

### 3.4 `<StatePermissionBanner>` Props

```typescript
import type { Permission, PermissionType, PermissionResult } from './types';

/**
 * 通用 Permission Banner（与 D-P0-02 §1.3 C-06 Banner 一致）
 * 视觉规范：loading-error-empty-v1.md §4.2
 * - 底色：var(--bg-hero-mist)
 * - 边框：1px solid var(--border-hairline)
 * - 圆角：var(--r-1) 2px
 */
export type StatePermissionBannerProps = {
  /** 权限类型 */
  permissionType: PermissionType;
  /** 权限结果 */
  result: Extract<PermissionResult, 'denied' | 'restricted' | 'denied_permanent'>;
  /** Banner 文案（zh-CN / en）*/
  message: string;
  /** 替代 CTA（必填 · 不显示"必须开启"）*/
  primaryAction: {
    label: string;
    onClick: () => void;
    /** CTA 类型 */
    variant: 'primary' | 'secondary';
  };
  /** 次 CTA（取消并返回）*/
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  /** 三档响应式覆盖 */
  responsive?: {
    mobile?: Partial<StatePermissionBannerProps>;
    tablet?: Partial<StatePermissionBannerProps>;
    desktop?: Partial<StatePermissionBannerProps>;
  };
};
```

### 3.5 `<StatePrivacyPreview>` Props

```typescript
/**
 * Privacy 公开预览卡片（Witness 段 5 专用）
 * 视觉规范：loading-error-empty-v1.md §5.2
 * - 底色：var(--bg-page)
 * - 边框：1px solid var(--border-hairline)
 * - ✓ 颜色：var(--earth-blue)
 * - ✗ 颜色：var(--text-tertiary)
 */
export type StatePrivacyPreviewProps = {
  /** 公开项列表（按 D-P0-02 §6.1 顺序）*/
  publicItems: Array<{
    icon: '✓' | '✗';
    label: string;
    value: string;
  }>;
  /** 后台说明（详见 D-P0-02 §6.2）*/
  backendNotice?: {
    publicStatement: string;
    backendStatement: string;
    removalStatement: string;
  };
  /** Privacy 链接 */
  privacyLink?: {
    label: string;
    href: string;
    target?: '_blank' | '_self';
  };
  /** 三档响应式覆盖 */
  responsive?: {
    mobile?: Partial<StatePrivacyPreviewProps>;
    tablet?: Partial<StatePrivacyPreviewProps>;
    desktop?: Partial<StatePrivacyPreviewProps>;
  };
};
```

---

## §4 6 对象状态 props

### 4.1 `<Daily12Grid>` Props

```typescript
import type { Daily12State } from './types';

/**
 * Daily 12 主屏容器组件
 * - LOCKED HomeCoordinates.tsx 的状态层包装
 * - 由 state prop 驱动 Daily12State 8 个状态
 */
export type Daily12GridProps = {
  /** 当前 Daily 12 状态（8 选 1）*/
  state: Daily12State;
  /** edition_id（state = ready / partial_missing / empty / stale_fallback 时必填）*/
  editionId?: string;
  /** Edition 槽位数据（state = ready / partial_missing 时必填）*/
  slots?: Array<{
    position: number; // 1-12
    cityId: string;
    momentId?: string; // partial_missing 时为 undefined
  }>;
  /** Stale fallback 时间（state = stale_fallback 时必填）*/
  staleDate?: string;
  /** 缺失城市名（state = partial_missing 时必填）*/
  missingCityName?: string;
  /** 错误信息（state = fully_unavailable / error_boundary 时必填）*/
  error?: {
    category: ErrorCategory;
    retryable: Retryable;
    errorId?: ErrorId;
  };
  /** 重试回调（state = fully_unavailable / retrying 时）*/
  onRetry?: () => void;
  /** 单 tile 错误回调 */
  onTileError?: (tileId: string) => void;
  /** Witness CTA 回调（state = empty 时）*/
  onWitnessClick?: () => void;
  /** 当前 locale */
  locale: 'zh-CN' | 'en';
};
```

### 4.2 `<MomentCard>` Props

```typescript
import type { MomentState } from './types';

/**
 * Moment 卡片组件
 * - 用于 Daily 12 / CityPage Same Second / Live Events
 */
export type MomentCardProps = {
  /** 当前 Moment 状态（8 选 1）*/
  state: MomentState;
  /** Moment ID（state = ready 时必填）*/
  momentId?: string;
  /** Moment 图片 URL（state = ready / image_loading / image_failed 时）*/
  imageUrl?: string;
  /** Moment 城市级公开位置（state = ready 时必填）*/
  cityId?: string;
  /** 拍摄时间（state = ready / source_pending_verification 时）*/
  capturedAt?: string;
  /** 来源类型（state = ready 时必填）*/
  sourceType?: 'witness' | 'seed' | 'editorial';
  /** 短描述（state = ready 时）*/
  description?: string;
  /** 撤下原因（state = content_withdrawn 时）*/
  withdrawalReason?: string;
  /** 错误信息（state = image_failed / error_unknown 时）*/
  error?: {
    category: ErrorCategory;
    retryable: Retryable;
    errorId?: ErrorId;
  };
  /** 重试回调 */
  onRetry?: () => void;
  /** 反馈回调 */
  onFeedback?: () => void;
  /** 当前 locale */
  locale: 'zh-CN' | 'en';
};
```

### 4.3 `<CityPageShell>` Props

```typescript
import type { CityState } from './types';

/**
 * Universal CityPage 容器组件
 * - 状态层包装 UniversalCityPage
 * - 由 state prop 驱动 CityState 9 个状态
 */
export type CityPageShellProps = {
  /** 当前 City 状态（9 选 1）*/
  state: CityState;
  /** City ID（state = city_ready_with_moments / city_ready_basic_only 时必填）*/
  cityId?: string;
  /** LOCKED 5 States 渲染决策接口（与 cityPageRenderPlan.ts 对齐）*/
  renderPlan?: {
    hero: 'full' | 'empty';
    oneScene: 'full' | 'empty';
    sameSecond: 'show' | 'hide';
    echo: '5states' | 'be_first' | 'be_first_today';
  };
  /** 时区信息（state = city_timezone_failed 时为 undefined）*/
  timezone?: string;
  /** 天气信息（state = city_weather_failed 时为 undefined）*/
  weather?: {
    summary: string;
    temperatureC: number;
  };
  /** 错误信息（state = city_error / city_error_boundary 时必填）*/
  error?: {
    category: ErrorCategory;
    retryable: Retryable;
    errorId?: ErrorId;
  };
  /** 重试回调 */
  onRetry?: () => void;
  /** Witness CTA 回调（state = city_ready_basic_only / city_past_only 时）*/
  onWitnessClick?: () => void;
  /** 当前 locale */
  locale: 'zh-CN' | 'en';
};
```

### 4.4 `<UnknownPageShell>` Props

```typescript
import type { UnknownState } from './types';

/**
 * Unknown Coordinate 容器组件
 * - 状态层包装 UnknownCoordinate
 * - 由 state prop 驱动 UnknownState 6 个状态
 */
export type UnknownPageShellProps = {
  /** 当前 Unknown 状态（6 选 1）*/
  state: UnknownState;
  /** Unknown ID（state = unknown_ready 时必填）*/
  unknownId?: string;
  /** clue 数量（state = unknown_ready 时必填）*/
  clueCount?: number;
  /** 中断阶段（state = reveal_interrupted 时）*/
  interruptedStage?: number;
  /** Reveal 错误信息（state = reveal_failed 时）*/
  revealError?: {
    category: ErrorCategory;
    retryable: Retryable;
  };
  /** 重试回调 */
  onRetry?: () => void;
  /** 继续上次回调（state = reveal_interrupted 时）*/
  onResume?: () => void;
  /** 当前 locale */
  locale: 'zh-CN' | 'en';
};
```

### 4.5 `<WitnessFlowShell>` Props

```typescript
import type { WitnessState } from './types';
import type { Permission } from './types';

/**
 * Minimal Witness Flow 容器组件
 * - 状态层包装 WitnessFlow 6 段
 * - 由 state prop 驱动 WitnessState 9 个状态
 * - 子状态详见 D-P0-02 state-matrix-v1.md §1-§5（76 个）
 */
export type WitnessFlowShellProps = {
  /** 当前 Witness 状态（9 选 1）*/
  state: WitnessState;
  /** 当前步骤（0-6）*/
  step?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /** Submission ID（state = witness_under_review / witness_published 时）*/
  submissionId?: string;
  /** 城市 ID（state = witness_published 时）*/
  cityId?: string;
  /** 上传进度（state = witness_uploading 时）*/
  uploadProgress?: {
    progressPct: number;
    networkClass: 'wifi' | 'cellular_4g_5g' | 'cellular_3g' | 'slow_2g' | 'offline';
  };
  /** 重试次数（state = witness_retry / witness_failed_terminal 时）*/
  retryCount?: number;
  /** 权限对象（state = witness_permission 时）*/
  permission?: Permission;
  /** 错误信息（state = witness_retry / witness_failed_terminal 时）*/
  error?: {
    category: ErrorCategory;
    retryable: Retryable;
    errorId?: ErrorId;
  };
  /** 提交回调 */
  onSubmit?: () => void;
  /** 重试回调 */
  onRetry?: () => void;
  /** 取消回调 */
  onCancel?: () => void;
  /** 撤回回调 */
  onWithdraw?: () => void;
  /** 当前 locale */
  locale: 'zh-CN' | 'en';
};
```

### 4.6 `<EchoComposer>` Props（扩展自 LOCKED EchoInput 5 态）

```typescript
import type { EchoState } from './types';

/**
 * Echo Composer 容器组件
 * - 状态层包装 LOCKED EchoInput（design-freeze-log-v1.md §6.12）
 * - 由 state prop 驱动 EchoState 8 个状态（LOCKED 5 态扩展为 8 态）
 * - ⚠️ 不修改 EchoInput 组件 props；仅由 state prop 决定是否渲染 / 渲染什么
 */
export type EchoComposerProps = {
  /** 当前 Echo 状态（8 选 1）*/
  state: EchoState;
  /** City ID（state = ready / disabled / loading 时必填）*/
  cityId?: string;
  /** 当前字符数（state = typing 时）*/
  charCount?: number;
  /** 最大字符数（默认 280）*/
  maxChars?: number;
  /** 提交 ID（state = success 时）*/
  echoId?: string;
  /** 错误信息（state = error 时）*/
  error?: {
    category: ErrorCategory;
    retryable: Retryable;
    errorId?: ErrorId;
  };
  /** 提交回调（state = typing → submitting 转换时）*/
  onSubmit?: (text: string) => void;
  /** 输入回调（state = typing 时）*/
  onChange?: (text: string) => void;
  /** 重试回调（state = error 时）*/
  onRetry?: () => void;
  /** 当前 locale */
  locale: 'zh-CN' | 'en';
};
```

> **Echo 8 态扩展约束**：
> - LOCKED EchoInput 5 态（default / hover / focus / typing / submitted）**不变**
> - 新增 4 态（disabled / loading / submitting / error）由 `<EchoComposer>` 容器层处理
> - 当 state = default / focus / typing / success 时：渲染 LOCKED EchoInput
> - 当 state = disabled / loading / submitting / error 时：渲染 StateEmpty / StateLoading / StateError（不渲染 EchoInput）
> - **不修改 EchoInput 组件的 props**

---

## §5 与 14 LOCKED 组件的集成示例

### 5.1 集成模式

```typescript
/**
 * 集成模式 A：容器组件根据 state prop 决定渲染
 * 示例：Daily12Grid
 */
function Daily12Grid(props: Daily12GridProps) {
  const { state, ... } = props;

  switch (state) {
    case 'loading_skeleton':
      return <StateSkeleton variant="full" loadingText="此刻，正在加载" />;
    case 'fully_unavailable':
      return (
        <StateError
          errorCategory={error.category}
          retryable={error.retryable}
          title="远方暂时连不上"
          message="请稍后再试"
          primaryAction={{ label: '重试', onClick: onRetry }}
          feedbackAction={{ label: '反馈', href: '/feedback' }}
        />
      );
    case 'empty':
      return (
        <StateEmpty
          poeticLine="今天还没有来自这里的内容"
          explanation="也许明天"
          primaryAction={{ label: '留下一个 Moment →', onClick: onWitnessClick }}
          minHeight="70%"
        />
      );
    case 'ready':
    case 'partial_missing':
    case 'stale_fallback':
    case 'retrying':
    case 'error_boundary':
    default:
      // 渲染 LOCKED HomeCoordinates（14 LOCKED 组件之一）
      return <HomeCoordinates slots={slots} />;
  }
}
```

### 5.2 集成原则

1. **不修改 14 LOCKED 组件**：所有 LOCKED 组件的 props 不变
2. **状态切换由容器组件驱动**：容器组件根据 state prop 决定渲染 LOCKED 组件还是状态层组件
3. **状态层组件作为替代层**：当 state prop = 非 ready 状态时，渲染对应的 StateError / StateSkeleton / StateEmpty / StatePermissionBanner / StatePrivacyPreview
4. **三档响应式通过 responsive prop 覆盖**：与 `responsive-rules-v1.md §5` 一致
5. **不引入新 token / 不修改 A2 视觉**：所有 State 组件复用 VF 1.2 token

---

## §6 字段对齐矩阵

### 6.1 与 E-P0-09 contract 对齐

| 本文件字段 | E-P0-09 contract 字段 | 备注 |
|---|---|---|
| `ErrorCategory` (20 项) | `error_category` 枚举 | 详见 `state-matrix-v1.md §9` |
| `Retryable` (bool) | `retryable` | 客户端判定 |
| `ErrorId` (string) | `error_id` (8 字符 base36) | 与 E-P0-10 监控 ID 一致 |
| `PermissionType` | `permission.type` 枚举 | 与 D-P0-02 一致 |
| `PermissionResult` | `permission.result` 枚举 | 与 D-P0-02 一致 |
| `Daily12State` (8) | `state.daily12` 枚举 | 顶层状态 |
| `MomentState` (8) | `state.moment` 枚举 | 顶层状态 |
| `CityState` (9) | `state.city` 枚举 | 顶层状态 |
| `UnknownState` (6) | `state.unknown` 枚举 | 顶层状态 |
| `WitnessState` (9) | `state.witness` 枚举 | 顶层状态（子状态详见 D-P0-02）|
| `EchoState` (8) | `state.echo` 枚举 | 顶层状态（LOCKED 5 态扩展为 8）|

### 6.2 与 event-map-v1 §5 字段名一致性矩阵对齐

| 本文件字段 | event-map-v1 §5 字段 | 备注 |
|---|---|---|
| `error_category` | `error_category` | ✅ 完全一致 |
| `retryable` | `retryable` | ✅ 完全一致 |
| `permission_type` | `permission_type` | ✅ 完全一致 |
| `result` (permission) | `result` (permission) | ✅ 完全一致 |
| `city_id` | `city_id` | ✅ 完全一致 |
| `moment_id` | `moment_id` | ✅ 完全一致 |
| `edition_id` | `edition_id` | ✅ 完全一致 |
| `submission_id` | `submission_id` | ✅ 完全一致 |
| `network_class` | `network_class` | ✅ 完全一致 |

### 6.3 与 forbidden-fields-v1 对齐

> **不发送禁采字段**：
> - ❌ 不发送精确 GPS / 精确精度数字（即便 Error 状态也不暴露）
> - ❌ 不发送错误堆栈 / SQL / 服务端 trace
> - ❌ 不发送 IP / session_id / cookie
> - ❌ 不发送 UA 完整串 / 屏幕尺寸精确值
> - ❌ 不发送自由文本（Echo 文本 / Witness 短描述 / Unknown 猜测答案）
> - ❌ 不发送 EXIF 原始字段（GPS / camera_model / user_comment / software）
> - ❌ 不发送图片 URL token / 上传 endpoint URL 完整路径

---

## §7 实施优先级 + 风险

### 7.1 实施优先级

| 优先级 | 组件 | 依赖 | 目标 Gate |
|---|---|---|---|
| **P0 · 必须 Gate A** | StateSkeleton / StateError / StateEmpty / StatePermissionBanner / StatePrivacyPreview | 无 | Gate A · Internal Alpha |
| **P0 · 必须 Gate A** | Daily12Grid / MomentCard / CityPageShell / UnknownPageShell | StateSkeleton / StateError / StateEmpty | Gate A · Internal Alpha |
| **P0 · 必须 Gate A** | WitnessFlowShell | D-P0-02 已交付 | Gate A · Internal Alpha |
| **P1 · Closed Beta 前** | EchoComposer（扩展 LOCKED 5 态为 8 态）| EchoInput LOCKED | Gate B · Closed Beta |

### 7.2 风险

| 风险 | 影响 | 缓解策略 |
|---|---|---|
| **Echo 8 态扩展可能影响 LOCKED EchoInput 视觉** | LOW | EchoComposer 容器层处理 4 个新增态；不修改 EchoInput 组件 |
| **错误 ID 8 字符 base36 hash 与 E-P0-10 监控 ID 体系不一致** | MEDIUM | PM Agent 应在 E-P0-10 启动前锁定错误 ID 格式 |
| **三档响应式覆盖不充分** | LOW | 移动端字号 ≥ 16px / 进度条 ≥ 4px / 触摸目标 ≥ 44px（已纳入 responsive prop）|
| **中英双语 i18n 框架未就绪** | MEDIUM | 文案已 zhed 双语；i18n 框架由 E-P0-09 锁 |
| **A2 LOCK 视觉漂移** | LOW | 所有 State 组件复用 VF 1.2 token；不引入新颜色 / 字体 / 圆角 / 阴影 |

---

## §8 自验收 checklist

| # | 验收项 | 状态 | 证据 |
|---|---|---|---|
| 1 | 5 类状态组件（StateSkeleton / StateError / StateEmpty / StatePermissionBanner / StatePrivacyPreview）| ✅ | §3.1-§3.5 |
| 2 | 6 对象状态枚举（Daily12State / MomentState / CityState / UnknownState / WitnessState / EchoState）| ✅ | §2.2 |
| 3 | 错误分类 20 项 ErrorCategory 与 E-P0-09 contract 对齐 | ✅ | §2.1 + §6.1 |
| 4 | 权限类型 + 结果与 D-P0-02 + event-map-v1 一致 | ✅ | §2.3 + §6.1 + §6.2 |
| 5 | 6 对象容器组件 props 完整（Daily12Grid / MomentCard / CityPageShell / UnknownPageShell / WitnessFlowShell / EchoComposer）| ✅ | §4.1-§4.6 |
| 6 | Echo 8 态扩展不修改 LOCKED EchoInput 组件 | ✅ | §4.6 + §5.2 |
| 7 | 不修改 14 LOCKED 组件的 props / API | ✅ | §1.2 + §5.2 |
| 8 | 复用 A2 tokens（不引入新颜色 / 字体 / 圆角 / 阴影 / 动效）| ✅ | §3.1-§3.5 视觉规范引用 VF 1.2 |
| 9 | 三档响应式覆盖（mobile / tablet / desktop responsive prop）| ✅ | §3.1-§3.5 responsive 字段 |
| 10 | 字段名与 E-P0-09 / event-map-v1 / forbidden-fields-v1 对齐 | ✅ | §6.1 + §6.2 + §6.3 |
| 11 | 集成模式示例（容器组件根据 state prop 决定渲染）| ✅ | §5.1 |
| 12 | 不引入新依赖 | ✅ | 仅 TypeScript 类型 + React 组件；无新依赖 |

---

## §9 给后续任务的接口

### 9.1 给 Web 工程师

- ✅ §2 通用 TypeScript 枚举可直接复制到 `src/types/state.ts`
- ✅ §3 5 类 State 组件 props 可直接作为组件 Props 定义
- ✅ §4 6 对象容器组件 props 可直接基于 LOCKED 组件实现
- ✅ §5.1 集成模式示例可作为实施参考
- ⚠️ 实施时建议先实现 §3 5 类 State 组件（依赖最少），再实现 §4 6 对象容器组件

### 9.2 给 iOS first-pass

- ✅ §2-§4 TypeScript 类型可作为 iOS Swift / Objective-C 类型映射参考
- ✅ §3-§4 视觉规范可作为 iOS UIKit / SwiftUI 组件参考
- ⚠️ iOS 需补充原生 UI 规范（Sheet / Toast / 系统设置 deep link）

### 9.3 给 E-P0-09（API Contract）

- ✅ §2 通用状态枚举可作为 E-P0-09 state 字段定义的 source of truth
- ✅ §6.1 字段对齐矩阵明确 E-P0-09 应锁定的字段

### 9.4 给 QA Owner

- ✅ §7.2 风险表可作为 QA 测试用例
- ✅ §3-§4 props 定义可作为组件 props 接口测试依据

---

**End of component-contract-v1.md · D-P0-04 子产物 4/4**