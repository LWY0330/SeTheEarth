# Component Library · 14 组件架构与使用

> v1.6.4 · PROMPT 46 v1
> 状态:✅ 14 组件 + 14 CSS Modules + 14 tests(typecheck OK,runtime 待 Vitest)交付
> 设计依据:`d11-component-library-first-pass.md` LOCKED

## 目标

把 3 套 LOCKED 页面 mockup(Kyoto v3 / Khartoum final / Lisbon v12)+ Unknown Coordinate first pass 抽取出 14 个可复用 React 组件,统一设计 token,支持 Phase 3 Component Library 启动。

## 架构概览

```
┌────────────────────────────────────────────────────────────────┐
│ src/components/ui/  ←  Component Library 根目录                   │
│   ├── types.ts        ←  共享类型(ComponentState / LayerColor)   │
│   ├── index.ts        ←  14 组件 barrel export                │
│   ├── {Name}.tsx      ←  14 组件实现(React 18)                 │
│   ├── {Name}.module.css ←  14 组件样式(CSS Modules)            │
│   ├── {Name}.test.tsx ←  14 组件测试(.tsx, runtime 待 Vitest)  │
│   ├── types.test.ts   ←  14 类型测试(runtime OK)              │
│   ├── ComponentStates.module.css  ←  6 状态共享 token        │
│   └── README.md       ←  Quick Index                          │
└────────────────────────────────────────────────────────────────┘

外部集成:
├── src/components/UniversalCityPage.tsx  ←  5 屏组件(Phase 2 收口)
├── src/components/UnknownCoordinate.tsx  ←  Unknown Coordinate 入口
└── src/components/CityPage.tsx  ←  legacy v1.4 5 段(feature flag off 保留)
```

## 14 组件 Catalog

### P0 · 基础(6)

#### 01. GlobalHeader
- **用途**:全站顶部导航(Logo + 主导航 + 当前状态)
- **变体**:default / simplified(Unknown)/ withBack(City Detail)
- **Token**:`--bg-page` 半透明 + backdrop-filter blur、`--border-hairline`、`--header-height: 72px`
- **复用范围**:全局(3 页面)
- **API**:
  ```ts
  interface GlobalHeaderProps {
    logo: { cn: string; en: string };
    navItems?: NavItem[];
    backHref?: string;
    backLabel?: string;
    simplified?: boolean;
    state?: ComponentState;
  }
  ```

#### 03. HeroMedia
- **用途**:全幅摄影 + 暗 gradient overlay + 文字安全区
- **变体**:detail(720px)/ unknown(100vh)/ homepage(720px 中央)
- **Token**:`--overlay-hero-top/bottom/left/warm-bottom`
- **复用范围**:3 页面共享
- **API**:
  ```ts
  interface HeroMediaProps {
    src: string; alt: string;
    height?: '720px' | '100vh';
    overlay?: 'top-bottom' | 'left' | 'warm-bottom' | 'none';
    safeArea?: 'left' | 'center' | 'bottom';
    children?: ReactNode;
  }
  ```

#### 05. TimeDisplay
- **用途**:时间数字(mono + tabular-nums,防数字跳动)
- **尺寸**:sm(22px)/ md(32px)/ lg(64px)/ xl(80px)
- **复用范围**:3 页面共享
- **API**:
  ```ts
  interface TimeDisplayProps {
    value: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    layer?: 'blue' | 'yellow' | 'red';
    format?: 'time' | 'coord';
  }
  ```

#### 09. LayerIndicator
- **用途**:Layer 圆点 + kicker 文本
- **依赖中枢**:被 6 组件依赖(SameSecond / TimeComparison / HeroMedia / OneScene / EchoInput / LocationMeta)
- **API**:
  ```ts
  interface LayerIndicatorProps {
    layer: 'blue' | 'yellow' | 'red';
    label: string;
    kicker?: string;
  }
  ```

#### 11. SameSecond
- **用途**:3 城并置 + 1px hairline
- **数据契约**:CityComparison[] + currentCityId(排除当前)
- **API**:
  ```ts
  interface SameSecondProps {
    cities: CityComparison[];
    currentCityId?: string;
    dividerStyle?: 'hairline' | 'none';
  }
  ```

#### 12. EchoInput
- **用途**:私密留痕(textarea + CTA + microcopy + 6 状态)
- **已 6 状态验证**:Khartoum final-qa `04-echo-state-*.html`
- **API**:
  ```ts
  interface EchoInputProps {
    question: string;
    placeholder?: string;
    maxLength?: number;
    submitLabel?: string;
    microcopy?: string;
    hint?: string;
    state?: ComponentState;
    echoState?: 'default' | 'typing' | 'submitted';
    onSubmit?: (text: string) => void;
  }
  ```

### P1 · 常用(6)

#### 02. SectionHeader
- **用途**:章节标题(kicker + 64px Serif 大标题 + italic 副描述)
- **静态组件,无状态**
- **API**:kicker / title / subtitle / layerAccent

#### 04. WorldTimeRail
- **用途**:横向 12 城时间条带(滚动)
- **API**:cities: CityTime[] / yourTime / layerAccent

#### 06. TimeComparison
- **用途**:3 段时间并置 + delta
- **API**:items: TimeComparisonItem[] / delta / align

#### 08. LocationMeta
- **用途**:城市/国家/坐标 meta + 日期
- **API**:cityEn / countryEn / coords / date / layer

#### 10. OneScene
- **用途**:9/3 列图 + 4 行 italic 描述
- **API**:image / description / time / location / layer

#### 13. DistanceNavigation
- **用途**:← / → 城市切换 + N/12 位置
- **API**:prev / next / position / cityEn

### P2 · Unknown 专用(2)

#### 07. CoordinateWindow
- **用途**:坐标碎片(rough / precise)
- **API**:lat / lon / precision

#### 14. RevealMeta
- **用途**:Reveal 5 阶段序列(UTC ? → 23° N → 完整坐标 → 进入 → MEXICO CITY)
- **API**:stage / time / coords / cityEn / onEnterClick

---

## 6 状态(全部 14 组件共享)

| State | 触发 | 视觉 |
|---|---|---|
| `default` | 初始 | 基础 |
| `hover` | 鼠标 | bg / 边框 / opacity,220ms ease |
| `focus` | 键盘 Tab | Earth Blue 焦点圈 `0 0 0 2px rgba(26, 77, 126, 0.40)` |
| `active` | 按下 | scale(0.99),120ms |
| `disabled` | 不可用 | opacity 0.5 + cursor not-allowed |
| `success` | 完成 | 绿色 / Layer Red 对勾 |

---

## 依赖关系图

```
LayerIndicator (无依赖,基础原子)
TimeDisplay (无依赖,基础原子)
GlobalHeader (无依赖,基础原子)
HeroMedia (依赖 LayerIndicator)

SameSecond (依赖 TimeComparison + LocationMeta + LayerIndicator)
WorldTimeRail (依赖 TimeDisplay + LayerIndicator)
EchoInput (依赖 LayerIndicator)
OneScene (依赖 LocationMeta)
TimeComparison (依赖 TimeDisplay + LayerIndicator)
LocationMeta (依赖 LayerIndicator)
DistanceNavigation (依赖 LocationMeta)
SectionHeader (无依赖,基础原子)

CoordinateWindow (依赖 RevealMeta)
RevealMeta (依赖 CoordinateWindow + TimeDisplay)
```

`LayerIndicator` + `TimeDisplay` + `GlobalHeader` + `SectionHeader` 是 P0 基础组件(无依赖或仅依赖彼此)。

---

## 集成示例

### City Detail Arrival(屏 01)

```tsx
<GlobalHeader
  logo={{ cn: '看见地球', en: 'SEE EARTH' }}
  navItems={[
    { label: 'Cities', href: '/cities', active: true },
    { label: 'About', href: '/about' },
  ]}
  backHref="/cities"
  backLabel="CITIES"
/>

<HeroMedia src={city.visual.hero_media.url} alt={city.identity.canonical_name} height="720px" safeArea="left">
  <DistanceNavigation prev={prev} next={next} position={{ current: 5, total: 12 }} cityEn={city.identity.canonical_name} />
  <LayerIndicator layer="blue" label={city.identity.canonical_name} />
  <TimeDisplay value={dynamic.local_time} size="xl" layer="blue" />
</HeroMedia>

<LocationMeta
  cityEn={city.identity.canonical_name}
  countryEn={city.identity.country_name}
  coords={`${city.identity.latitude}° N · ${city.identity.longitude}° E`}
  date="17 AUG 2026"
  layer="blue"
/>
```

### Unknown Coordinate 5 阶段

```tsx
<HeroMedia src={photo.url} alt="Unknown" height="100vh" overlay="warm-bottom" safeArea="bottom">
  <RevealMeta
    stage={stage}
    time="15:42"
    coords={stage >= 2 ? "23.6345° N · 102.5528° W" : null}
    cityEn={stage === 5 ? "MEXICO CITY" : null}
    onEnterClick={() => navigate.push(`/cities/mexico-city`)}
  />
</HeroMedia>
```

---

## 设计契约

- **0 阴影 / 0 大圆角**(全局规则,所有 14 组件)
- **Mono 字体必须 `font-variant-numeric: tabular-nums`**(防数字跳动)
- **Layer color 占比 ≤ 3-5% viewport**(语义点缀)
- **3 Layer 色 ≤ 5% viewport 占比**(Blue / Yellow / Red)
- **不引入新视觉系统**(A2 LOCKED)
- **不引入新依赖**(沿用 React 18.3 + TypeScript 5.5 + Vite 5.4)

---

## 上线标准对照

| Criteria | v1.6.4 状态 |
|---|---|
| 14 组件可复用 + 一致视觉 | ✅ 全部交付,data-attribute 一致 |
| 6 状态规范统一 | ✅ ComponentState enum + 每组件 6 个 state class |
| 12 类 token 体系 | ✅ types.ts + ComponentStates.module.css |
| Phase 0/1/2/3 数据架构不退化 | ✅ 303/303 runtime tests pass |
| 0 业务侵入 | ✅ CityPage.tsx / cities.ts 等未触动 |
| 0 新依赖 | ✅ 沿用 React 18.3 + TypeScript 5.5 + Vite 5.4 |

---

## Phase 3 启动条件

✅ v1.3 spec + 5 City States + Mapping LOCKED
✅ Phase 0 + Phase 1 数据架构 DELIVERED
✅ Phase 2 + Phase 2.5 UniversalCityPage + UnknownCoordinate LOCKED
✅ **Phase 3 Component Library 14 组件 + CSS Modules + tests typecheck 收口**

→ **Phase 4 启动**:Dark Mode / Direction A1(8/19 路线图下一站)

---

## 反馈

任何质疑 / 补充直接修订本文件或 `src/components/ui/README.md`。