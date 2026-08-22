# Component Tests Runtime Limitation

## 现状

`src/components/*.test.tsx` 已写好(5 个文件,共 90 tests),`typecheck` 通过。

**当前 `npm run test` 不执行 .tsx 测试**:
- Node 22.22 的 `--experimental-strip-types` 仅支持 `.ts`,不支持 `.tsx` JSX
- `src/components/*.test.tsx` 已从 test glob 排除

## 运行测试的 3 个方案

### 方案 1:Vitest(推荐)

```bash
npm install -D vitest @vitest/ui
# vitest.config.ts
```

Vitest 原生支持 TSX + React + snapshot, 是 PM 期望的现代方案。

### 方案 2:tsx loader(快速尝鲜)

```bash
npm install -D tsx
npm run test:tsx  # 自定义命令:tsx --test src/components/*.test.tsx
```

`tsx` 提供 Node ESM 加载器, 支持 .tsx + JSX transform。

### 方案 3:VM-based 自定义 loader(0 依赖 hack)

写一个 Node `--loader` 在 ESM 解析时把 .tsx 转 createElement。复杂度高,不推荐。

## 当前 commit 的 90 tests

| 文件 | tests | 主题 |
|---|---|---|
| `src/components/UniversalArrival.test.tsx` | 12 | 屏 01 · 3 breakpoint × 4 边界 |
| `src/components/UniversalOneScene.test.tsx` | 12 | 屏 02 · 4 state × 3 边界 |
| `src/components/UniversalSameSecond.test.tsx` | 12 | 屏 03 · 3 城市 × 平权 |
| `src/components/UniversalEcho.test.tsx` | 24 | 屏 04 · 6 state × 4 |
| `src/components/UniversalCityPage.test.tsx` | 30 | 主组件 · 5 state × 6 边界 |
| **总计** | **90** | |

## Phase 3 建议

迁移到 Vitest(0 新依赖 → 1 新依赖):
- `npm install -D vitest @testing-library/react jsdom`
- `vitest.config.ts` 配置 jsx + jsdom env
- `package.json` 加 `"test:components": "vitest run"`
- 删除 `@ts-nocheck` 注释, 启用严格类型

## 反馈

任何质疑 / 补充直接修订本文件。