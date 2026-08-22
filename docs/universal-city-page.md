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

1. **Router 集成**(任务 A.6)— 修改 `src/router/Router.tsx` + `src/App.tsx` 根据 feature flag 切换
2. **Component tests**(任务 C 剩余)— 90 个 component 测试,需 react-dom/server 渲染 + 断言
3. **Mockup 视觉对齐**(任务 A.7)— Phase 2 designer mockup LOCKED 后,对齐 v1.3 §3.2.1-§3.2.4 视觉
4. **CSS module 文件**(任务 A.8)— 5 个 `*.module.css`(Phase 2+ 视觉)

## 反馈

任何质疑 / 补充直接修订本文件或报告 `d9-universal-city-page-engineering.md`。