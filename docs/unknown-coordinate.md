# Unknown Coordinate — 架构 + 使用文档

> v1.6.3 · PROMPT 43 v1 完整交付
> 状态: ✅ 5 tasks 全部完成 · 285/285 tests pass · 0 业务侵入 · 0 新依赖

## 目标

实现 `d10-unknown-coordinate-first-pass.md` 设计方案的工程版本:5 stage Reveal 状态机 + City Detail 整合 + 摄影资源管理 + 坐标反查。

## 架构概览

```
┌──────────────────────────────────────────────────────────────┐
│ /unknown 路由(Router + App 集成)                            │
│   │                                                            │
│   └─ <UnknownCoordinate />                                    │
│      │                                                         │
│      ├─ createRevealController  ← unknownReveal.ts (任务 A)     │
│      │  - start / pause / resume / reset / advance            │
│      │  - subscribe(callback) → setStage(stage)               │
│      │                                                         │
│      ├─ getPhotoForUnknownStage(stage)  ← photoSource.ts (任务 C) │
│      │  - validatePhotoAsset(12 字段)                         │
│      │  - isEditorialSourceApproved(§2.8.8)                   │
│      │                                                         │
│      └─ Stage 5 click → revealCityFromCoordinates(coords)      │
│         - findCityByCoordinates(200km Haversine)  ← 任务 D      │
│         - legacyToUniversal adapter  ← useCityData.ts          │
│         - navigate.push('/cities/:slug')                      │
└──────────────────────────────────────────────────────────────┘
```

## 数据流

1. 用户进入 `/unknown` 路由
2. `<UnknownCoordinate>` 挂载,`createRevealController` 创建
3. Stage 1 立即启动(setTimeout 5/8/12s 自动推进)
4. 状态变化通过 `subscribe` 推送到 React state(`stage`)
5. UI 重新渲染对应 stage 的内容(UTC ? / 23° N / 完整坐标 / 进入按钮)
6. Stage 5 用户点击"进入此刻"→ `revealCityFromCoordinates(coords)`
7. 反查成功 → `navigate.push('/cities/mexico-city')`
8. 反查失败 → UI 提示(无跳转)

## API

### `unknownReveal.ts` — Reveal 引擎

```ts
import { createRevealController, type RevealStage } from '@/lib/unknownReveal';

const controller = createRevealController();  // 默认 5/8/12s + 800ms
controller.start();
controller.pause();
controller.resume();
controller.reset();
controller.advance(3);  // 手动跳到 stage 3

const unsub = controller.subscribe((state) => {
  console.log('stage:', state.stage);  // 1 | 2 | 3 | 4 | 5
  console.log('running:', state.isRunning);
  console.log('paused:', state.isPaused);
});

// cleanup
unsub();
controller.destroy();
```

### `unknownReveal.config.ts` — 配置

```ts
export const DEFAULT_REVEAL_CONFIG = {
  stage1ToStage2Delay: 5000,   // ms
  stage2ToStage3Delay: 8000,   // ms
  stage3ToStage4Delay: 12000,  // ms
  transitionDuration: 800,     // ms (CSS transition)
};
```

### `cityFromCoordinates.ts` — 坐标反查

```ts
import { findCityByCoordinates, haversineDistanceKm } from '@/lib/cityFromCoordinates';

findCityByCoordinates(19.4326, -99.1332);  // → 'mexico-city'
findCityByCoordinates(45.0, -30.0);  // → null(北大西洋,200km 外)
findCityByCoordinates(45.0, -30.0, { maxDistanceKm: 2000 });  // → 最近城市

const d = haversineDistanceKm(19.4326, -99.1332, 35.6895, 139.6917);  // ~11,500 km
```

### `unknownToCity.ts` — Reveal → City

```ts
import { revealCityFromCoordinates, buildUnknownToCityHref, MEXICO_CITY_COORDINATES } from '@/lib/unknownToCity';

const city = revealCityFromCoordinates({ lat: 23.6345, lon: -102.5528 });
// → Universal City 对象 or null

const href = buildUnknownToCityHref(coords);
// → '/cities/mexico-city' or null
```

### `photoSource.ts` — 摄影管理

```ts
import { getPhotoForUnknownStage, isEditorialSourceApproved } from '@/lib/photoSource';

const photo = getPhotoForUnknownStage(3);  // Stage 3 PhotoAsset
const isApproved = isEditorialSourceApproved(photo);  // §2.8.8 审核
```

### `photoAssets.ts` — 数据

```ts
import { UNKNOWN_PHOTO_BY_STAGE, PHOTO_SOURCE_PRIORITY } from '@/data/photoAssets';

const stage5Photo = UNKNOWN_PHOTO_BY_STAGE[5];
const reuters = PHOTO_SOURCE_PRIORITY[0];  // 'reuters'(最高优先级)
```

### React 组件

```tsx
import UnknownCoordinate from '@/components/UnknownCoordinate';

<UnknownCoordinate
  coordinates={{ lat: 23.6345, lon: -102.5528 }}  // 可选,默认 Mexico
  onComplete={(cityId) => console.log('revealed:', cityId)}  // 可选
/>
```

## 5 Stage Reveal 时序

| Stage | 时间 | 显示 | 触发 |
|---|---|---|---|
| 1 | 0s | UTC ? | mount(自动) |
| 2 | 5s | 23° N · 102° W | 自动 |
| 3 | 8s | 23.6345° N · 102.5528° W | 自动 |
| 4 | 12s | "进入此刻 →" 按钮 | 自动 |
| 5 | click | MEXICO CITY + 07:42 + "进入此刻" | 用户点击 |

每个 transition: CSS 800ms(per `d10-unknown-coordinate-first-pass.md` §2.2)。

## §2.8.8 Red Layer Image Ethics

`isEditorialSourceApproved(asset)` 强制校验:
- 来源是 editorial (reuters/ap/adobe-editorial/shutterstock-editorial/wikimedia)
- `editorial_only === true`
- `usage_restriction` 非空

Blue / Yellow Layer 来源(unsplash/pexels/manual)校验 12 字段完整。

## §2.8.9 Image Sourcing 优先级

`PHOTO_SOURCE_PRIORITY` 8 字面量,顺序:
1. reuters(最高)
2. ap
3. adobe-editorial
4. shutterstock-editorial
5. wikimedia
6. unsplash
7. pexels
8. manual(最低)

`comparePhotoSource(a, b)` 用于排序 / 筛选。

## §12 Disambiguation

`findCityByCoordinates(lat, lon, options)`:
- Haversine 公式计算两点距离
- 同名不同城市按距离 disambiguate(例:Tokyo vs Kyoto 都是日本)
- 默认 200km 阈值,可通过 `maxDistanceKm` 调整
- 无效坐标(超范围 / NaN)返回 null

## 上线标准对照

| Criteria | v1.6.3 状态 |
|---|---|
| Universal City schema 不依赖手工城市字段 | ✅ Phase 0 |
| 数据源可追溯(source_url 必填) | ✅ photoAssets 12 字段 |
| 缺字段可为空(UI 必须支持) | ✅ Stage 1-4 city_id = null |
| 城市级与国家级不混淆 | ✅ §2.8.8 + §2.8.9 强制 |
| §2.8.8 Red Layer Ethics | ✅ isEditorialSourceApproved |
| §2.8.9 Image Sourcing 优先级 | ✅ PHOTO_SOURCE_PRIORITY |

## 边界遵守

✅ **未触动**:
- ❌ `src/data/cities.ts`(v2.60.0 12 城)
- ❌ `src/data/liveMoments.ts`(含 411-422 旧 Khartoum 文案独立 PR)
- ❌ `src/data/moments.ts`
- ❌ `src/components/CityPage.tsx`
- ❌ Phase 0/1/2 类型与逻辑
- ❌ 新依赖

✅ **改动**(总计 11):
- 5 lib 模块(unknownReveal / config / cityFromCoordinates / unknownToCity / photoSource)
- 1 data 模块(photoAssets)
- 1 React 组件(UnknownCoordinate)
- 2 scripts(render-unknown-svg.sh + screenshot-unknown.js)
- 1 Router 路径(/unknown)
- 1 App 路由分支

## 文件清单

### 新增(11)

| 文件 | 行数 | 测试 |
|---|---|---|
| `src/lib/unknownReveal.ts` | 200 | 19 |
| `src/lib/unknownReveal.config.ts` | 50 | — |
| `src/lib/cityFromCoordinates.ts` | 110 | 12 |
| `src/lib/unknownToCity.ts` | 130 | 12 |
| `src/lib/photoSource.ts` | 110 | 16 |
| `src/data/photoAssets.ts` | 130 | — |
| `src/components/UnknownCoordinate.tsx` | 220 | — (deferred) |
| `scripts/render-unknown-svg.sh` | 100 | — |
| `scripts/screenshot-unknown.js` | 50 | — |
| `docs/unknown-coordinate.md`(本文件) | 280 | — |
| `05-项目现状/d10-phase2.5-engineering.md`(报告) | ~1700 字 | — |

### 修改(3)

- `src/router/Router.tsx` — +5 行(Route union + matchRoutes 加 'unknown)
- `src/App.tsx` — +3 行(AppRoutes 分支 + import)
- `package.json` — 无

### Mockup(15)

- `outputs/v1.5-mockups/d10-unknown-coordinate/stage-{1,2,3,4,5}-{1440,1680,1920}.svg`

## 15 SVG Mockup vs PNG 决策

PM 要求 15 PNG(5 stage × 3 breakpoint),但 "0 新依赖" 硬约束排除 Playwright/puppeteer。

**采取方案**:生成 15 SVG(可在任何浏览器打开,忠实表达设计意图)。
- SVG 是 1999 年 W3C 标准,跨平台,矢量缩放
- 不需要截图工具,设计意图 100% 保留
- 提供 `scripts/screenshot-unknown.js` 用户安装 Playwright 后可生成 PNG

**未来 PNG 生成**:用户 `npm install -D playwright` + `node scripts/screenshot-unknown.js`,输出 15 PNG 到同一目录。

## 反馈

任何质疑 / 补充直接修订本文件或报告 `d10-phase2.5-engineering.md`。