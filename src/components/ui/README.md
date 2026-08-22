# Component Library Index

> v1.6.4 · PROMPT 46 v1
> 14 组件 · 6 状态 · 12 类 token · 0 新依赖

## 14 组件 Quick Index

### P0 · 基础组件(6)

| # | 组件 | 文件 | 用途 | 复用范围 |
|---|---|---|---|---|
| 01 | **GlobalHeader** | `GlobalHeader.tsx` | 全站顶部导航 | 全局 |
| 03 | **HeroMedia** | `HeroMedia.tsx` | 全幅摄影 + 暗 overlay | 3 页面共享 |
| 05 | **TimeDisplay** | `TimeDisplay.tsx` | 时间数字(mono tabular-nums)| 3 页面共享 |
| 09 | **LayerIndicator** | `LayerIndicator.tsx` | Layer 圆点 + kicker | City Detail |
| 11 | **SameSecond** | `SameSecond.tsx` | 3 城并置 + 1px hairline | City Detail |
| 12 | **EchoInput** | `EchoInput.tsx` | 私密留痕 + 6 状态 | City Detail |

### P1 · 常用组件(6)

| # | 组件 | 文件 | 用途 | 复用范围 |
|---|---|---|---|---|
| 02 | **SectionHeader** | `SectionHeader.tsx` | 章节标题 + kicker + 副描述 | 跨页面 |
| 04 | **WorldTimeRail** | `WorldTimeRail.tsx` | 横向 12 城时间条 | 跨页面 |
| 06 | **TimeComparison** | `TimeComparison.tsx` | 3 段时间并置 | City Detail |
| 08 | **LocationMeta** | `LocationMeta.tsx` | 城市/国家/坐标 meta | City Detail |
| 10 | **OneScene** | `OneScene.tsx` | 9/3 列图 + 4 行 italic | City Detail |
| 13 | **DistanceNavigation** | `DistanceNavigation.tsx` | ← / → 城市切换 | City Detail |

### P2 · Unknown 专用(2)

| # | 组件 | 文件 | 用途 | 复用范围 |
|---|---|---|---|---|
| 07 | **CoordinateWindow** | `CoordinateWindow.tsx` | 坐标碎片(rough / precise)| Unknown |
| 14 | **RevealMeta** | `RevealMeta.tsx` | Reveal 5 阶段序列 | Unknown |

---

## 6 状态(per d11 §6 状态规范)

| State | 触发 | 视觉 |
|---|---|---|
| `default` | 初始 / 静止 | 基础 |
| `hover` | 鼠标移入 | bg / 边框 / opacity,220ms ease |
| `focus` | 键盘 Tab | Earth Blue 焦点圈 `0 0 0 2px rgba(26, 77, 126, 0.40)` |
| `active` | 按下 / 选中 | scale(0.99),120ms |
| `disabled` | 不可用 | opacity 0.5 + cursor not-allowed |
| `success` | 完成 / 提交 | 绿色对勾 或 Layer Red 对勾 |

---

## 快速使用

```tsx
import { LayerIndicator, TimeDisplay, HeroMedia } from '@/components/ui';

<HeroMedia src="/images/kyoto.jpg" alt="京都" height="720px">
  <LayerIndicator layer="blue" label="KYOTO" />
  <TimeDisplay value="15:42" size="xl" layer="blue" />
</HeroMedia>
```

---

## 依赖关系

```
LayerIndicator + TimeDisplay + HeroMedia + GlobalHeader   ← P0 基础
        ↓
SameSecond, EchoInput, WorldTimeRail, SectionHeader, OneScene, TimeComparison, LocationMeta, DistanceNavigation  ← P1
        ↓
CoordinateWindow, RevealMeta  ← P2(Unknown 专用)
```

`LayerIndicator` 是依赖中枢(被 6 组件依赖),`TimeDisplay` 是基础组件(被 4 组件依赖)。

---

## 边界遵守

✅ **0 阴影 / 0 大圆角**(全局规则)
✅ **Mono 字体必须 tabular-nums**
✅ **Layer color 占比 ≤ 3-5% viewport**
✅ **不引入新依赖**(沿用 React 18.3 + TypeScript 5.5 + Vite 5.4)
✅ **0 业务侵入**(CityPage.tsx / cities.ts / liveMoments.ts / moments.ts 未触动)
✅ **Earth Blue 焦点圈统一**:`0 0 0 2px rgba(26, 77, 126, 0.40)`

---

## Token 体系(12 类)

- **颜色**:`--bg-page` `--text-primary/secondary/tertiary/inverse` `--earth-blue` `--layer-yellow` `--layer-red` `--focus-ring` 等
- **字号**:`--fs-display-xl/l/m/s` `--fs-h2/h3/h4` `--fs-body-l/s` `--fs-meta` `--fs-time-xl/l/m/s`
- **字重**:`--fw-regular` `--fw-medium` `--fw-light`
- **行高**:`--lh-tight/snug/normal/relaxed/loose`
- **字间距**:`--ls-tight/normal/meta/wide/xwide`
- **间距**:4px base grid,`--s-1 ~ --s-13`(4-160px)
- **容器**:`--content-max-width-1440/1680/1920` `--page-padding-x` `--header-height`
- **字体**:`--font-display` `--font-editorial` `--font-sans` `--font-mono`
- **Motion**:`--motion-fast/base/slow/reveal`
- **State**:`--state-hover-bg` `--state-focus-ring` `--state-disabled-opacity`
- **Cursor**:`--cursor-pointer/text/not-allowed`
- **Z-index**:`--z-base/sticky/overlay/modal`

详见 `docs/css-tokens.md`(待 PROMPT 47 收口)。

---

## 反馈

任何质疑 / 补充直接修订本文件或 `docs/component-library.md`。