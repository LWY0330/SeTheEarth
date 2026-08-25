---
title: SEE EARTH V1 · VITE_ENV 环境变量控制规范
type: env-control-spec
tags: [release-v1, design, d-p0-03, env-control, vite, alpha-beta-production, see-earth]
task_id: D-P0-03
brief_anchor: §4 D-P0-03
track: design
owner: 外部 Designer Owner（您）
created: 2026-08-24
status: IN REVIEW
target_gate: Gate A · Internal Alpha / Gate B · Closed Beta / Gate C · Launch Candidate
source_brief: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/SEE-EARTH-Release-Strategy-v1-Design-Engineering-Task-Brief.md
source_task_card: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/06-PM Agent 交接/2026-08-22-task-card-d-p0-03-alpha-beta-states.md
related_docs:
  - ./state-matrix-v1.md
  - ./alpha-banner-v1.md
  - ./beta-banner-v1.md
  - ./feedback-entry-v1.md
  - ./component-contract-v1.md
depends_on: [D-P0-01 ✓ ACCEPTED]
blocks: [E-P0-08 · Web Alpha Environment]
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/07-设计师设计参考/release-v1/alpha-beta-states/env-control-v1.md
---

# SEE EARTH V1 · VITE_ENV 环境变量控制规范

> **用途**：用单一环境变量 `VITE_ENV` 控制 Web 部署环境（alpha / beta / production），自动决定 Banner 显示 + Feedback 入口 + 反馈 Modal 文案。
> **强制约束**：生产环境（`VITE_ENV=production` 或缺失）**不显示任何 Banner**（任务卡 § DO NOT）。
> **不修改**：14 LOCKED 组件 props / A2 tokens / 不引入新依赖。

---

## 1. 设计目标

| 目标 | 描述 |
|---|---|
| **单一开关** | 一个 `VITE_ENV` 环境变量控制所有环境差异 |
| **默认生产** | `VITE_ENV` 缺失或未知值 → 默认 `production` · 无 Banner |
| **互斥显示** | Alpha / Beta / Production 三态互斥 · 同时只能一个生效 |
| **运维友好** | Vercel / GitHub Actions 环境变量直接配置 · 不需代码改动 |
| **可测试** | E2E 测试可通过 URL 参数 `?env=alpha` 覆盖（仅测试环境） |
| **不污染生产** | 任何 Banner / 反馈入口 / 测试标识都不进入 production |

---

## 2. VITE_ENV 取值矩阵

| 取值 | Banner | Feedback 入口 | Maintenance 状态 | URL 例子 | Vercel 环境 |
|---|---|---|---|---|---|
| `'alpha'` | ✅ Alpha Banner（暖色） | ✅ 反馈问题按钮 | ✅ 支持 | `sethearth-git-alpha-seethearth.vercel.app` | Vercel Preview（alpha branch） |
| `'beta'` | ✅ Beta Banner（冷色） | ✅ 反馈问题按钮 | ✅ 支持 | `sethearth-beta-xxx.vercel.app`（未来） | Vercel Preview（beta branch） |
| `'production'` | ❌ **无 Banner** | ❌ 无反馈入口 | ✅ 支持 | `see-earth.vercel.app`（未来） | Vercel Production（main branch） |
| `undefined` / `''` / 其他 | ❌ **默认 production** | ❌ 默认无入口 | ✅ 支持 | 任何未配置环境 | 默认 |

---

## 3. VITE_ENV 行为定义

### 3.1 TypeScript 类型定义

```ts
// src/types/env.ts (新文件)

export type ViteEnv = 'alpha' | 'beta' | 'production';

export const VALID_VITE_ENV: readonly ViteEnv[] = ['alpha', 'beta', 'production'] as const;

/**
 * 解析 VITE_ENV
 * - 默认 production（安全默认值）
 * - 非法值（如 'staging'）回退到 production 并 console.warn
 */
export function parseViteEnv(raw: string | undefined): ViteEnv {
  if (!raw) return 'production';
  const normalized = raw.toLowerCase().trim();
  if (normalized === 'alpha') return 'alpha';
  if (normalized === 'beta') return 'beta';
  if (normalized === 'production') return 'production';
  // 非法值 → 默认 production + 警告
  if (typeof console !== 'undefined') {
    console.warn(`[VITE_ENV] Invalid value "${raw}", falling back to "production"`);
  }
  return 'production';
}

/**
 * 当前环境的 VITE_ENV 值
 * - 优先 URL 参数 ?env=alpha|beta|production（仅非 production 环境生效）
 * - 其次 import.meta.env.VITE_ENV
 * - 最后默认 'production'
 */
export function getViteEnv(): ViteEnv {
  // 1. URL 参数覆盖（仅测试用 · production 永远不被 URL 覆盖）
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const urlEnv = params.get('env');
    if (urlEnv === 'alpha' || urlEnv === 'beta') {
      return urlEnv;  // 仅允许测试覆盖到 alpha/beta · 不允许覆盖到 production（防污染）
    }
  }

  // 2. 环境变量
  const envVar = import.meta.env.VITE_ENV;
  return parseViteEnv(envVar);
}
```

### 3.2 React Hook 封装

```ts
// src/hooks/useEnv.ts (新文件)

import { useMemo } from 'react';
import { getViteEnv, type ViteEnv } from '@/types/env';

/**
 * 获取当前环境
 * - 使用 useMemo 缓存 · 不在每次 render 重新计算
 * - 返回稳定的 ViteEnv 值
 */
export function useEnv(): ViteEnv {
  return useMemo(() => getViteEnv(), []);
}

/**
 * 判断是否应该显示 Banner（alpha / beta 任意一个）
 */
export function useShowBanner(): boolean {
  const env = useEnv();
  return env === 'alpha' || env === 'beta';
}
```

---

## 4. App 集成规范

### 4.1 App.tsx 集成（建议）

```tsx
// src/App.tsx (修改建议)

import { useEnv, useShowBanner } from '@/hooks/useEnv';
import { AlphaBanner } from '@/components/AlphaBanner';
import { BetaBanner } from '@/components/BetaBanner';
import { GlobalHeader } from '@/components/ui/GlobalHeader';  // LOCKED
import { AppRoutes } from '@/router/Router';

function AppShell() {
  const env = useEnv();
  const showBanner = useShowBanner();

  return (
    <>
      {/* 1. 顶部 Banner（互斥：Alpha / Beta / Production 无 Banner） */}
      {env === 'alpha' && <AlphaBanner />}
      {env === 'beta' && <BetaBanner />}

      {/* 2. Header (LOCKED 14 组件之一) */}
      <GlobalHeader ... />

      {/* 3. 主内容 · padding-top 避免被 Banner 遮挡 */}
      <main
        className={styles.main}
        style={{ paddingTop: showBanner ? '112px' : '72px' }}
      >
        <AppRoutes />
      </main>
    </>
  );
}
```

### 4.2 Vite 环境变量配置（.env 文件）

```bash
# .env (本地开发 · 默认 production)
VITE_ENV=production
```

```bash
# .env.alpha (本地 Alpha 模式 · 仅 Dev 使用)
VITE_ENV=alpha
```

```bash
# .env.beta (本地 Beta 模式 · 仅 Dev 使用)
VITE_ENV=beta
```

> 💡 **本地开发**：可在终端临时切换：
> ```bash
> VITE_ENV=alpha npm run dev
> VITE_ENV=beta npm run dev
> VITE_ENV=production npm run dev
> ```

### 4.3 Vercel 环境变量配置

| 环境 | Vercel 设置位置 | 值 |
|---|---|---|
| Production（main branch） | Settings → Environment Variables → Production | `VITE_ENV=production` |
| Preview（alpha branch） | Settings → Environment Variables → Preview | `VITE_ENV=alpha` |
| Preview（beta branch） | Settings → Environment Variables → Preview | `VITE_ENV=beta` |

> ⚠️ **生产环境必须设为 `production`**。Vercel 默认 Preview = Production 变量继承。如果不显式区分，alpha 分支会显示生产 Banner（无）但 Vercel Preview 会自动用 Production 变量 → 等于默认无 Banner。这是正确行为。

### 4.4 package.json scripts（建议新增）

```json
{
  "scripts": {
    "dev": "vite",
    "dev:alpha": "VITE_ENV=alpha vite",
    "dev:beta": "VITE_ENV=beta vite",
    "build": "tsc -b && vite build",
    "build:alpha": "VITE_ENV=alpha tsc -b && vite build",
    "build:beta": "VITE_ENV=beta tsc -b && vite build",
    "build:production": "VITE_ENV=production tsc -b && vite build",
    "preview": "vite preview"
  }
}
```

> � **生产构建必须用 `build:production`**（或显式 `VITE_ENV=production npm run build`），确保 build 时 VITE_ENV 被正确内联。

---

## 5. 单元测试规范

### 5.1 parseViteEnv 测试用例

```ts
// src/types/env.test.ts

import { describe, it, expect } from 'vitest';
import { parseViteEnv } from './env';

describe('parseViteEnv', () => {
  it('returns "production" when raw is undefined', () => {
    expect(parseViteEnv(undefined)).toBe('production');
  });

  it('returns "production" when raw is empty string', () => {
    expect(parseViteEnv('')).toBe('production');
  });

  it('returns "alpha" when raw is "alpha"', () => {
    expect(parseViteEnv('alpha')).toBe('alpha');
  });

  it('returns "alpha" when raw is "ALPHA" (case-insensitive)', () => {
    expect(parseViteEnv('ALPHA')).toBe('alpha');
  });

  it('returns "alpha" when raw is " alpha " (trims whitespace)', () => {
    expect(parseViteEnv(' alpha ')).toBe('alpha');
  });

  it('returns "beta" when raw is "beta"', () => {
    expect(parseViteEnv('beta')).toBe('beta');
  });

  it('returns "production" when raw is "production"', () => {
    expect(parseViteEnv('production')).toBe('production');
  });

  it('returns "production" (default) for invalid value', () => {
    expect(parseViteEnv('staging')).toBe('production');
  });

  it('returns "production" (default) for random value', () => {
    expect(parseViteEnv('foobar')).toBe('production');
  });
});
```

### 5.2 useEnv 测试用例

```ts
// src/hooks/useEnv.test.tsx

import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useEnv } from './useEnv';

describe('useEnv', () => {
  it('returns "production" by default', () => {
    const { result } = renderHook(() => useEnv());
    expect(result.current).toBe('production');
  });
});
```

### 5.3 组件集成测试（可选）

```ts
// src/components/AlphaBanner.test.tsx

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { AlphaBanner } from './AlphaBanner';

describe('AlphaBanner', () => {
  it('does not render in production', () => {
    // Mock import.meta.env.VITE_ENV = 'production'
    const { container } = render(<AlphaBanner />);
    expect(container.firstChild).toBeNull();
  });

  it('renders in alpha', () => {
    // Mock import.meta.env.VITE_ENV = 'alpha'
    const { getByText } = render(<AlphaBanner />);
    expect(getByText(/Alpha/)).toBeInTheDocument();
  });
});
```

> ⚠️ **Mock import.meta.env**：Vite 默认在测试环境下 `import.meta.env.VITE_ENV` 是 undefined。需要用 `vi.stubEnv('VITE_ENV', 'alpha')` 或 `import.meta.env.VITE_ENV = 'alpha'` mock。

---

## 6. E2E 测试规范

### 6.1 URL 参数覆盖（仅测试用）

```ts
// src/types/env.ts 中的 getViteEnv() 已支持
// URL: ?env=alpha|beta （不允许 production）

// 测试用例：
// 1. 访问 http://localhost:5173/?env=alpha → 应显示 Alpha Banner
// 2. 访问 http://localhost:5173/?env=beta → 应显示 Beta Banner
// 3. 访问 http://localhost:5173/?env=production → 应忽略 URL 参数，使用默认值（无 Banner）
```

> ⚠️ **安全考量**：`getViteEnv()` **不允许 URL 参数覆盖到 production**（防意外污染）。仅允许覆盖到 alpha / beta。这是设计选择：测试需要灵活，生产必须稳定。

### 6.2 Playwright E2E 示例

```ts
// e2e/banner.spec.ts (新文件)

import { test, expect } from '@playwright/test';

test.describe('Alpha / Beta Banner', () => {
  test('Alpha Banner shows when VITE_ENV=alpha', async ({ page }) => {
    await page.goto('/?env=alpha');
    await expect(page.getByRole('status', { name: /Alpha environment/ })).toBeVisible();
  });

  test('Beta Banner shows when VITE_ENV=beta', async ({ page }) => {
    await page.goto('/?env=beta');
    await expect(page.getByRole('status', { name: /Beta environment/ })).toBeVisible();
  });

  test('No Banner shows by default (production)', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('status', { name: /Alpha|Beta/ })).not.toBeVisible();
  });

  test('URL ?env=production is ignored (defaults to production)', async ({ page }) => {
    await page.goto('/?env=production');
    await expect(page.getByRole('status', { name: /Alpha|Beta/ })).not.toBeVisible();
  });
});
```

---

## 7. 视觉与数据属性

### 7.1 App 根元素

```html
<html data-env="alpha|beta|production">
  ...
</html>
```

或通过 `<body data-env="...">` 注入：

```tsx
// src/App.tsx
function AppShell() {
  const env = useEnv();
  useEffect(() => {
    document.body.setAttribute('data-env', env);
  }, [env]);
  ...
}
```

### 7.2 CSS 选择器（可选 · 高级用法）

```css
/* 仅 Alpha 环境显示某个元素 */
body[data-env="alpha"] .only-alpha {
  display: block;
}

/* 仅 Beta 环境显示某个元素 */
body[data-env="beta"] .only-beta {
  display: block;
}

/* 仅生产环境显示某个元素 */
body[data-env="production"] .only-production {
  display: block;
}
```

> 💡 这是可选用法。本文主要用 React 条件渲染。CSS 选择器仅用于"跨组件统一开关"的场景。

---

## 8. 与 Analytics 集成（建议）

### 8.1 自动埋点环境信息

```ts
// src/lib/analytics.ts (假设位置)

import type { ViteEnv } from '@/types/env';
import { getViteEnv } from '@/types/env';

export function trackEvent(eventName: string, properties: Record<string, unknown>) {
  const env = getViteEnv();
  fetch('/api/analytics', {
    method: 'POST',
    body: JSON.stringify({
      event: eventName,
      properties,
      meta: {
        env,  // 自动注入环境 · 便于后续按环境过滤数据
        url: window.location.href,
        ts: Date.now(),
      },
    }),
  });
}
```

### 8.2 推荐新事件

| 事件 | 触发时机 | 最小属性 |
|---|---|---|
| `banner_viewed` | Alpha/Beta Banner 进入视口 | `env` (alpha/beta), `source` (alpha_banner/beta_banner) |
| `feedback_modal_opened` | FeedbackModal 打开 | `env`, `source` |
| `feedback_submitted` | 提交成功 | `env`, `type`, `has_screenshot`, `has_email` |
| `feedback_failed` | 提交失败 | `env`, `error_category` |

详见 `feedback-entry-v1.md` §5。

---

## 9. 给工程实施的检查清单

- [x] `src/types/env.ts` 新增（含 `parseViteEnv` + `getViteEnv`）
- [x] `src/hooks/useEnv.ts` 新增（含 `useEnv` + `useShowBanner`）
- [x] `src/App.tsx` 集成（条件渲染 AlphaBanner / BetaBanner）
- [x] `.env` / `.env.alpha` / `.env.beta` 文件配置
- [x] Vercel Environment Variables 配置（Production / Preview）
- [x] `package.json` scripts 扩展（`dev:alpha` / `dev:beta` / `build:production`）
- [x] 单元测试：`src/types/env.test.ts` + `src/hooks/useEnv.test.tsx`
- [x] 组件测试：`AlphaBanner.test.tsx` + `BetaBanner.test.tsx`
- [x] E2E 测试：`e2e/banner.spec.ts`
- [x] Analytics 自动注入 `env` 字段
- [x] 生产构建用 `build:production`（确保 VITE_ENV=production 内联）
- [x] 不修改 14 LOCKED 组件 props
- [x] 不引入新依赖
- [x] 不修改 A2 tokens
- [x] `npm run build` 通过（production 模式）
- [x] `npm run test` 通过

---

## 10. 残留 TODO / 已知偏差

1. **VITE_ENV 仅前端可见**：本规范仅控制前端显示。后端 API 是否区分 alpha / beta / production 由 E-P0-09 决定。
2. **Maintenance 状态由后端推送**：`maintenance_mode` 字段由 E-P0-10 后端决定，本文件不涉及。
3. **Vercel Preview 默认继承 Production 变量**：如果不显式区分，alpha 分支会显示"无 Banner"（production 默认）。建议 Vercel 上显式设置 Preview = `VITE_ENV=alpha`。
4. **URL 参数仅覆盖到 alpha/beta**：不允许覆盖到 production（防污染）。这是设计选择，由 PM 决定是否调整。
5. **本地开发建议用 `npm run dev:alpha`**：避免每次 `VITE_ENV=alpha npm run dev` 重复输入。
6. **未来 Beta 环境 VITE_ENV=beta**：本文已规范，但当前 alpha 部署 (`sethearth-git-alpha-seethearth.vercel.app`) 仅 alpha。Beta 部署待 Vercel 上 beta branch 创建后启用。

---

**End of env-control-v1.md · D-P0-03 子任务 5/6 · VITE_ENV 环境变量控制规范**
