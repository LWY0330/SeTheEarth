---
title: Component 可复用性矩阵 · first pass
type: design-spec
tags: [reusability-matrix, component-library, v1.3, see-earth-redesign]
date: 2026-08-22
sender: 内部 Designer Agent
status: first pass LOCKED
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/d11-component-reusability-matrix.md
related_docs:
  - /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/d11-component-library-first-pass.md (14 组件规格)
  - /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/d11-css-tokens-extraction.md (Tokens)
---

# Component 可复用性矩阵 · first pass

> **顶部声明**:基于 14 组件规格 + 3 套 LOCKED 页面 mockup + Unknown Coordinate first pass,构建组件可复用性矩阵。本矩阵是 PROMPT 46/47(工程师)实施 React + CSS Modules 的依据。
> **关键原则**:跨页面可复用 > City Detail 专用 > Unknown 专用(优先级递减)

---

## 1. 跨页面可复用性矩阵(14 组件 × 3 页面)

| # | 组件 | Homepage | City Detail | Unknown Coordinate | 复用范围 |
|---|---|:---:|:---:|:---:|---|
| 01 | **GlobalHeader** | ✅ | ✅ | ✅(简化) | **全局**(simplified 变体 for Unknown) |
| 02 | **SectionHeader** | ✅ | ✅ | — | 跨页面(Homepage + City Detail) |
| 03 | **HeroMedia** | ✅ | ✅ | ✅ | **跨页面**(3 页面共享核心视觉母版) |
| 04 | **WorldTimeRail** | ✅ | ✅ | — | 跨页面(Homepage 顶栏 + City Detail Hero 底部) |
| 05 | **TimeDisplay** | ✅ | ✅ | ✅ | **跨页面**(基础组件,3 页面都用) |
| 06 | **TimeComparison** | — | ✅ | — | City Detail 专用(03 Same Second + Arrival Hero) |
| 07 | **CoordinateWindow** | — | — | ✅ | **Unknown 专用**(全新组件,首次抽象) |
| 08 | **LocationMeta** | — | ✅ | — | City Detail 专用(Arrival / One Scene 顶部) |
| 09 | **LayerIndicator** | — | ✅ | — | City Detail 专用(可视化 Layer 颜色) |
| 10 | **OneScene** | — | ✅ | — | City Detail 专用(02 One Scene,9/3 列比已 LOCKED) |
| 11 | **SameSecond** | — | ✅ | — | City Detail 专用(03 Same Second,3 城市 LOCKED) |
| 12 | **EchoInput** | — | ✅ | — | City Detail 专用(04 Echo,6 状态已 Khartoum 验证) |
| 13 | **DistanceNavigation** | — | ✅ | — | City Detail 专用(Arrival 顶 + Echo 底部) |
| 14 | **RevealMeta** | — | — | ✅ | **Unknown 专用**(Reveal 序列,首次抽象) |

### 1.1 复用性统计

| 复用范围 | 组件数 | 占比 |
|---|---|---|
| 全局(3 页面共享) | 5(GlobalHeader / HeroMedia / TimeDisplay + 2 变体) | 36% |
| 跨页面(2 页面) | 2(SectionHeader / WorldTimeRail) | 14% |
| City Detail 专用 | 5(TimeComparison / LocationMeta / LayerIndicator / OneScene / SameSecond / EchoInput / DistanceNavigation) | 50% |
| Unknown 专用 | 2(CoordinateWindow / RevealMeta) | 14% |

> **关键观察**:
> - 36% 组件跨 3 页面共享(GlobalHeader / HeroMedia / TimeDisplay)
> - 14% 跨 2 页面(SectionHeader / WorldTimeRail)
> - 50% City Detail 专用(信息密度最高的页面,组件最丰富)
> - 14% Unknown 专用(全新体验,需独立组件)

---

## 2. 变体说明(同名组件的多种用法)

### 2.1 GlobalHeader 变体

| 变体 | 用途 | 视觉差异 |
|---|---|---|
| `GlobalHeader.default` | Homepage + City Detail | 完整 nav(logo + 4 主导航 + active underline) |
| `GlobalHeader.simplified` | Unknown Coordinate | 仅 logo + 1 dot(无 nav) |
| `GlobalHeader.withBack` | City Detail 顶部 | 加 `backHref` slot 显示「← 城市名 / N / 12」 |

### 2.2 HeroMedia 变体

| 变体 | 用途 | 视觉差异 |
|---|---|---|
| `HeroMedia.detail` | City Detail Arrival | 720px 高 + 暗 gradient + 左侧 safe area |
| `HeroMedia.unknown` | Unknown Coordinate | 100vh 全屏 + 极简 nav + 时间块底部 |
| `HeroMedia.homepage` | Homepage | 720px 高 + 中央 safe area + Earth Blue dot |

### 2.3 TimeDisplay 变体

| 变体 | 用途 | 视觉差异 |
|---|---|---|
| `TimeDisplay.time` | 时间数字 | "04:53" mono 22-80px |
| `TimeDisplay.coord` | 经纬度 | "15.5007° N · 32.5599° E" mono 12px |
| `TimeDisplay.delta` | 时差 | "+5H" Earth Blue 22px |

---

## 3. 复用性 × 视觉一致性原则

### 3.1 跨页面共享组件的视觉一致性原则

✅ **必须严格保持**:
- 同一组件名跨页面视觉 100% 一致(只有 props / slots 不同,基础视觉不变)
- GlobalHeader 在 3 页面上的字体 / 高度 / 底色必须完全相同(只 logo 是否简化不同)
- HeroMedia 在 3 页面上的 overlay gradient tone 必须一致(只是 photo / safe area 位置差异)
- TimeDisplay 在 3 页面上的字号 / 字体 / tabular-nums 必须一致

❌ **严禁**:
- 同一组件名在不同页面视觉不一致(例:City Detail TimeDisplay 字号 ≠ Unknown)
- 同一组件使用不同 token(例:City Detail 用 `--text-primary`,Homepage 用 `--text-secondary`)
- 同名组件在不同页面用不同 class name

### 3.2 City Detail 内部一致性原则(3 城市)

✅ **3 城市 LOCKED 验证(Kyoto / Lisbon / Khartoum)**:
- Arrival 视觉结构完全一致(只是 hero 图 + 时间数字 + Layer 颜色不同)
- One Scene 9/3 列比 + 4 行 italic 描述结构一致
- Same Second 3 栏并置 + 极细竖线分隔一致
- Echo 6 状态结构一致(Khartoum 已验证)
- Time 排版:LOCAL / YOUR / +XH 三栏结构一致

✅ **3 城市差异仅在**:
- Layer color(Blue / Yellow / Red)
- Hero 图(各城市真实摄影)
- 文案内容(各城市具体描述)

### 3.3 Unknown 内部一致性原则

✅ **5 Reveal Stage 一致性**:
- Stage 1-5 切换通过 `body.stage-N` class
- 同一图(Unsplash editorial URL)不同 crop / position
- Earth Blue 唯一系统提示色(无 Yellow / Red)
- 极简 nav(stage 1-4 仅 logo + 1 dot)

---

## 4. 优先级 / 实施顺序(给 PROMPT 46/47 工程师)

### 4.1 P0(基础组件 / 优先实施)

| # | 组件 | 复用范围 | 优先级 |
|---|---|---|:---:|
| 01 | GlobalHeader | 全局 | **P0** |
| 03 | HeroMedia | 跨页面 | **P0** |
| 05 | TimeDisplay | 全局 | **P0** |
| 09 | LayerIndicator | City Detail | **P0** |
| 11 | SameSecond | City Detail | **P0** |
| 12 | EchoInput | City Detail | **P0**(6 状态已验证) |

### 4.2 P1(常用组件 / 第二批)

| # | 组件 | 复用范围 | 优先级 |
|---|---|---|:---:|
| 02 | SectionHeader | 跨页面 | P1 |
| 04 | WorldTimeRail | 跨页面 | P1 |
| 06 | TimeComparison | City Detail | P1 |
| 08 | LocationMeta | City Detail | P1 |
| 10 | OneScene | City Detail | P1 |
| 13 | DistanceNavigation | City Detail | P1 |

### 4.3 P2(Unknown 专用 / 第三批)

| # | 组件 | 复用范围 | 优先级 |
|---|---|---|:---:|
| 07 | CoordinateWindow | Unknown | P2 |
| 14 | RevealMeta | Unknown | P2 |

### 4.4 实施依赖关系

```
[LayerIndicator + TimeDisplay + HeroMedia + GlobalHeader]   ← P0 基础
        ↓
[SameSecond, EchoInput, WorldTimeRail, SectionHeader, OneScene, TimeComparison, LocationMeta, DistanceNavigation]  ← P1
        ↓
[CoordinateWindow, RevealMeta]  ← P2(Unknown)
```

---

## 5. 组件命名规范(给 PROMPT 46 工程师)

### 5.1 PascalCase 组件名

| 组件 | PascalCase | 文件路径建议 |
|---|---|---|
| GlobalHeader | `<GlobalHeader />` | `src/components/GlobalHeader/` |
| SectionHeader | `<SectionHeader />` | `src/components/SectionHeader/` |
| HeroMedia | `<HeroMedia />` | `src/components/HeroMedia/` |
| WorldTimeRail | `<WorldTimeRail />` | `src/components/WorldTimeRail/` |
| TimeDisplay | `<TimeDisplay />` | `src/components/TimeDisplay/` |
| TimeComparison | `<TimeComparison />` | `src/components/TimeComparison/` |
| CoordinateWindow | `<CoordinateWindow />` | `src/components/CoordinateWindow/` |
| LocationMeta | `<LocationMeta />` | `src/components/LocationMeta/` |
| LayerIndicator | `<LayerIndicator />` | `src/components/LayerIndicator/` |
| OneScene | `<OneScene />` | `src/components/OneScene/` |
| SameSecond | `<SameSecond />` | `src/components/SameSecond/` |
| EchoInput | `<EchoInput />` | `src/components/EchoInput/` |
| DistanceNavigation | `<DistanceNavigation />` | `src/components/DistanceNavigation/` |
| RevealMeta | `<RevealMeta />` | `src/components/RevealMeta/` |

### 5.2 CSS Module 命名(给 PROMPT 47 工程师)

| 组件 | CSS Module 文件 | 主 class |
|---|---|---|
| GlobalHeader | `GlobalHeader.module.css` | `.nav` `.logo` `.navLink` |
| HeroMedia | `HeroMedia.module.css` | `.hero` `.img` `.safeArea` `.fade` |
| EchoInput | `EchoInput.module.css` | `.echo` `.textarea` `.submit` `.box` |

---

## 6. 引用了 07 目录 + 工程接口

- ✅ `SEE_EARTH_DESIGN_SYSTEM_v1.3_Complete_Spec.md` v1.3 §2.1.9 / §2.4.6 / §3 Page Patterns
- ✅ `global-city-coverage-system-v1.0.md` V2 IA §7 5 States + §19 copy direction
- ✅ `d7-5-city-states-visual-design.md` 5 States 视觉(Empty 状态与 Unknown 联动)
- ✅ `d10-unknown-coordinate-first-pass.md` Unknown 5 Stage 切换逻辑
- ✅ `d4-a2-khartoum-final-qa.md` Echo 6 状态已验证
- ✅ `d5-lisbon-yellow-layer-v12.md` Lisbon LOCKED
- ✅ `d4-a2-kyoto-polish-pass.md` Kyoto LOCKED
- ✅ `d6-phase1-4-screen-to-v2-mapping.md` 4 屏 → V2 命名

---

## 7. 触发后续动作

- 🔜 **PROMPT 46**(给工程师):React 组件实现,按 P0 → P1 → P2 顺序
- 🔜 **PROMPT 47**(给工程师):CSS Modules 实现,基于本 token 提取
- 🔜 Phase 4 启动:Dark Mode(组件复用,token 切换)

---

**字数统计**:约 1,800 字 · 跨页面矩阵 + 变体说明 + 一致性原则 + 实施优先级 + 命名规范
