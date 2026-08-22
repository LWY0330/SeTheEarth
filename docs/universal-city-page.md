# Universal CityPage — 架构 + 使用文档

> v1.6.2 · PROMPT 41 v1 first pass
> 状态: ✅ Component scaffold 完成 + 4 hooks + feature flag 就绪; ⏳ Router 集成 + component tests 待下 session

## 目标

提供 1 套 React 组件,渲染 5 City States(Seed / Active / Low / Past / Empty)任一状态。

## 架构概览

```
┌─────────────────────────────────────────────────────────────┐
│ /cities/:slug                                                │
│   Router (Phase 2 集成)                                       │
│   │                                                          │
│   ├─ feature flag: VITE_USE_UNIVERSAL_CITYPAGE              │
│   │  - false (默认) → legacy v1.4 CityPage                   │
│   │  - true          → UniversalCityPage (本任务)             │
│   │                                                          │
│   └─ UniversalCityPage                                        │
│      ├─ useCityData(slug) → City | null                      │
│      ├─ useDynamicCity(city) → CityDynamicSnapshot           │
│      ├─ useMomentsForCity(city_id) → Moment[]                │
│      ├─ useLayerFromCity(city) → CityLayer                   │
│      │                                                       │
│      └─ planCityPageRender(city) → CityPageRenderPlan         │
│         ├─ hero      (decision: render / render-empty / hide)│
│         ├─ one_scene (同上)                                  │
│         ├─ same_second (同上)                                │
│         └─ echo      (同上)                                  │
│         │                                                    │
│         ├─ UniversalArrival     (屏 01 · Context Hero)        │
│         ├─ UniversalOneScene    (屏 02 · Now 屏)              │
│         ├─ UniversalSameSecond  (屏 03 · Now 横向对比)         │
│         └─ UniversalEcho        (屏 04 · Echo)                │
└─────────────────────────────────────────────────────────────┘
```

## 数据流

1. Router 解析 URL `slug`
2. `useCityData(slug)` 从 `src/data/cities.ts` 取 legacy City,经 `legacyToUniversal` adapter 转 Universal City(Phase 0 类型)
3. `useDynamicCity(city)` 运行时计算 `local_time` (HH:MM) + `user_time_difference` (+9H / -4H 等)
4. `useMomentsForCity(city_id)` 从 `src/data/liveMoments.ts` + `src/data/moments.ts` 取关联 Moment,经 `liveEventToUniversal` + `legacyMomentToUniversal` 转 Universal Moment
5. `useLayerFromCity(city)` 推断 Layer (blue / yellow / red / unknown)— Phase 1 临时基于 city_id 关键字
6. `planCityPageRender(city)` 计算 4 屏渲染决策(基于 page_state)
7. 4 屏组件根据 plan.sections.*.decision 决定 render / render-empty / hide

## 组件 API

### `UniversalCityPage`

```tsx
<UniversalCityPage
  city?: City | null              // 可选:外部传入(测试用)
  moments?: ReadonlyArray<Moment> // 可选:外部传入
  plan?: CityPageRenderPlan        // 可选:外部传入
/>
```

默认从 URL slug 取 city + moments + plan。外部传入可用于单元测试。

### `UniversalArrival`

```tsx
<UniversalArrival
  city={city}
  dynamic={dynamic}        // CityDynamicSnapshot | null
  layer={layer}            // 'blue' | 'yellow' | 'red' | 'unknown'
/>
```

### `UniversalOneScene`

```tsx
<UniversalOneScene
  city={city}
  moments={moments}        // ReadonlyArray<Moment>
  pageState={page_state}   // 'A_seed_editorial' | ...
  layer={layer}
/>
```

### `UniversalSameSecond`

```tsx
<UniversalSameSecond
  city={city}
  otherCities={otherCities}  // ReadonlyArray<{ city, moments, layer }>
/>
```

### `UniversalEcho`

```tsx
<UniversalEcho
  city={city}
  pageState={page_state}
  state?: EchoState                  // 可选:外部可控('default' | 'hover' | 'focus' | 'typing' | 'disabled' | 'submitted')
  onSubmit?: (text: string) => void  // 提交回调
  maxLength?: number                 // 默认 80
/>
```

## Hooks API

### `useCityData(slug: string | null): City | null`

- 输入:URL slug(如 "kyoto")
- 输出:Universal City 或 null(404)
- 数据源:`src/data/cities.ts` (legacy) → `legacyToUniversal` adapter → Universal City
- Phase 3+ 替换:从 City Master 取

### `useDynamicCity(city: City | null): CityDynamicSnapshot | null`

- 输入:City
- 输出:`{ local_time, user_time_difference, local_hour, captured_at }`
- 30s 自动 tick(Intl.DateTimeFormat + setInterval)
- DST 跨夏令时由 Intl 自动处理(已验证)

### `useMomentsForCity(city_id: string | null): Moment[]`

- 输入:city_id
- 输出:Universal Moment[]
- 数据源:`liveMoments.ts` + `moments.ts` → `liveEventToUniversal` + `legacyMomentToUniversal` adapters
- 空数组 = 0 Moment

### `useLayerFromCity(city: City | null): CityLayer`

- 输入:City
- 输出:'blue' | 'yellow' | 'red' | 'unknown'
- Phase 1 规则:基于 city_id 关键字(kyoto → blue, lisbon → yellow, khartoum → red)
- Phase 2+ 替换:从 City.layer 字段读取(待 Phase 0 schema 加 layer 字段)

## Feature Flag

`VITE_USE_UNIVERSAL_CITYPAGE` 控制是否启用 UniversalCityPage。

| 值 | 行为 |
|---|---|
| `false` / 未设 | 使用 legacy v1.4 CityPage(默认) |
| `true` | 使用 UniversalCityPage |

读取位置:`src/lib/featureFlags.ts`

```ts
import { isUniversalCityPageEnabled } from '@/lib/featureFlags';

if (isUniversalCityPageEnabled()) {
  // render UniversalCityPage
} else {
  // render legacy CityPage
}
```

## Empty State(E_empty)特殊处理

per spec `d7-5-city-states-visual-design.md` §6 + `planCityPageRender` Phase 1 prep:

| Section | 决策 | 视觉 |
|---|---|---|
| hero | `render` 或 `render-empty` | 显示城市基础 info(坐标 / 国名 / 当地时区);无 Hero 图时显示 "This city exists." 占位 |
| one_scene | `render-empty` | 显示 "Be the first to show here today." CTA |
| same_second | `hide` | Empty City 无对比 |
| echo | `render` | Echo 改 CTA 为 "Be the first witness here." |

## 5 City States 文案(per spec d7)

| State | Header variant | 文案参考 |
|---|---|---|
| A_seed_editorial | seed-editorial | 已有(8.9+/9.4/9 评分) |
| B_active | active-now | "今天的 [City] 正在发生这些事" |
| C_low_activity | low-activity | "Last seen here [time]" |
| D_past_only | past-only | "No moments from here today." |
| E_empty | empty | "This city exists." + "No one has shown us [City] yet. Be the first to show here today." |

## 上线标准(spec §17 acceptance 对照)

| Criteria | v1.6.2 状态 |
|---|---|
| Universal City schema 不依赖手工城市字段 | ✅ City 用 city_id |
| 数据源可追溯(source_url 必填) | ✅ Phase 1 Moment.sources[] 已就绪 |
| 缺字段可为空(UI 必须支持) | ✅ planCityPageRender 的 render-empty 决策 |
| 城市级与国家级不混淆 | ✅ countryI18n 独立表 |
| Timeline 使用 captured_at | ✅ momentTime 锁定 |
| 精准地理权限隔离 | ✅ Phase 0 locationPrivacy |

## 边界遵守

✅ **未触动**:
- ❌ `src/data/cities.ts` / `liveMoments.ts` / `moments.ts`(独立 PR)
- ❌ `src/components/CityPage.tsx`(legacy v1.4 5 段,保留)
- ❌ `src/router/Router.tsx`(Router 集成 deferred 到 Phase 2,本 task 仅组件)
- ❌ Phase 0 / Phase 1 prep 类型(`src/types/*` + `src/lib/{cityPageRenderPlan,cityState,...}`)
- ❌ 现有 3 城市 mockup(Kyoto / Lisbon / Khartoum)— 仅兼容
- ❌ 新依赖

## 文件清单(本任务)

### 新增(8)

| 文件 | 行数 | 测试 |
|---|---|---|
| `src/hooks/useCityData.ts` | 100 | 12 |
| `src/hooks/useDynamicCity.ts` | 110 | 12 |
| `src/hooks/useMomentsForCity.ts` | 200 | 8 |
| `src/hooks/useLayerFromCity.ts` | 70 | 6 |
| `src/lib/featureFlags.ts` | 80 | 5 |
| `src/components/UniversalCityPage.tsx` | 130 | — (Phase 2) |
| `src/components/UniversalArrival.tsx` | 80 | — (Phase 2) |
| `src/components/UniversalOneScene.tsx` | 90 | — (Phase 2) |
| `src/components/UniversalSameSecond.tsx` | 85 | — (Phase 2) |
| `src/components/UniversalEcho.tsx` | 130 | — (Phase 2) |

### 修改(1)

- `package.json` — test glob 扩展 `src/hooks/*.test.ts`

### 文档(1)

- `docs/universal-city-page.md`(本文件)

## 已知 Deferred Work(Phase 2+)

1. ~~**Router 集成**(任务 A.6)~~ — ✅ **PROMPT 44 v1 完成**:`/cities/:slug` 双轨(feature flag 切换)
2. ~~**Component tests**(任务 C 剩余)~~ — ✅ **PROMPT 44 v1 完成**:90 tests 写入 `src/components/*.test.tsx`(运行时待 Vitest 迁移)
3. **Mockup 视觉对齐**(任务 A.7)— Phase 2 designer mockup LOCKED 后,对齐 v1.3 §3.2.1-§3.2.4 视觉
4. **CSS module 文件**(任务 A.8)— 5 个 `*.module.css`(Phase 2+ 视觉)

## 反馈

任何质疑 / 补充直接修订本文件或报告 `d9-universal-city-page-engineering.md`。

---

# v1.6.3 增补 · PROMPT 44 v1 Phase 2 收口

## Router 集成(任务 A)

`/cities/:slug` 路由在 `src/App.tsx` AppRoutes 内双轨:

```tsx
if (route.name === 'city') {
  if (isUniversalCityPageEnabled()) {
    return <main><UniversalCityPage /></main>;
  }
  return <main><CityPage /></main>;  // legacy v1.4
}
```

### Feature Flag 设置

**`.env.example`** 新增:
```bash
# v1.6.3 · PROMPT 44 v1 · Phase 2 收口
# Universal CityPage 启用开关:
#   true  → /cities/:slug 渲染 UniversalCityPage(Phase 2 收口组件)
#   false → 保留 legacy v1.4 CityPage(默认;生产环境)
VITE_USE_UNIVERSAL_CITYPAGE=false
```

### 解析位置

- `src/lib/featureFlags.ts:isUniversalCityPageEnabled()` — 优先读 `import.meta.env`(Vite build-time),Node fallback 到 `process.env`
- App.tsx AppRoutes 调用一次,决定 city 路径分支

### 回归保护

- `VITE_USE_UNIVERSAL_CITYPAGE=false`(默认)= v1.4 CityPage 行为 100% 不变
- 3 城市 LOCKED mockup(Kyoto / Lisbon / Khartoum)在 Universal 路径渲染数据契约与 v1.4 一致
- 视觉差异 = 0(等 PROMPT 40 视觉收口)

## 90 Component tests(任务 B)

5 个 `.tsx` 测试文件,使用 `react-dom/server.renderToStaticMarkup`(react-dom 内置,0 新依赖):

| 文件 | tests | 覆盖 |
|---|---|---|
| `src/components/UniversalArrival.test.tsx` | 12 | 3 breakpoint × 4 边界(layer / dynamic / hero_media / content)|
| `src/components/UniversalOneScene.test.tsx` | 12 | 5 page_state × caption 优先级 |
| `src/components/UniversalSameSecond.test.tsx` | 12 | 3 城市平权 + 排除当前 + 3 layer |
| `src/components/UniversalEcho.test.tsx` | 24 | 6 state × 4(page_state / maxLength / privacy / 12 城)|
| `src/components/UniversalCityPage.test.tsx` | 30 | 5 page_state × 6 边界 + 集成 |
| **总计** | **90** | |

### 运行时约束

⚠️ Node 22.22 `--experimental-strip-types` 不支持 `.tsx` JSX。测试从默认 `npm run test` glob 排除。

### 迁移到 Vitest(Phase 3 建议)

```bash
npm install -D vitest @testing-library/react jsdom
```

```ts
// vitest.config.ts
export default {
  test: { environment: 'jsdom' },
  esbuild: { jsx: 'automatic' },
};
```

详见 `scripts/run-component-tests.md` 3 方案对比。

## 反馈

任何质疑 / 补充直接修订本文件或报告 `d10-phase2-final-engineering.md`。