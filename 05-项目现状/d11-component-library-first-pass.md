---
title: Component Library first pass · 14 组件规格
type: design-spec
tags: [component-library, v1.3, phase-3, first-pass, see-earth-redesign]
date: 2026-08-22
sender: 内部 Designer Agent
status: first pass LOCKED (PM 评审后定)
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/d11-component-library-first-pass.md
related_docs:
  - /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/07-设计师设计参考/SEE_EARTH_DESIGN_SYSTEM_v1.3_Complete_Spec.md (v1.3 LOCKED)
  - /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/04-路线图/global-city-coverage-system-v1.0.md (V2 IA + §7 5 States + §19 copy direction)
  - /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/d10-unknown-coordinate-first-pass.md (Unknown Coordinate first pass)
---

# Component Library first pass · 14 组件规格

> **顶部声明**:本 first pass 在 3 套 LOCKED 页面 mockup(Kyoto v3 / Khartoum final / Lisbon v12)+ Unknown Coordinate first pass 基础上,首次抽出 14 个跨页面组件。每个组件包含:用途 / 视觉结构 / slots / 6 状态视觉 / 依赖 / tokens / 可复用性。
> **模式**:Addendum(不重做现有 mockup,只抽象 + 视觉规范)
> **触发**:8/19 用户指引「03 Unknown 完成后才做 Component Library。这个时间点最合适」

---

## 0. 14 组件清单(8/19 路线图指定)

| # | 组件 | 跨页面 | 复用范围 |
|---|---|---|---|
| 01 | GlobalHeader | ✅ | 全局 |
| 02 | SectionHeader | ✅ | Homepage + City Detail |
| 03 | HeroMedia | ✅ | Homepage + City Detail + Unknown |
| 04 | WorldTimeRail | ✅ | Homepage + City Detail |
| 05 | TimeDisplay | ✅ | Homepage + City Detail + Unknown |
| 06 | TimeComparison | 局部 | City Detail 专用 |
| 07 | CoordinateWindow | 局部 | Unknown 专用 |
| 08 | LocationMeta | 局部 | City Detail 专用 |
| 09 | LayerIndicator | 局部 | City Detail 专用 |
| 10 | OneScene | 局部 | City Detail 专用 |
| 11 | SameSecond | 局部 | City Detail 专用 |
| 12 | EchoInput | 局部 | City Detail 专用 |
| 13 | DistanceNavigation | 局部 | City Detail 专用 |
| 14 | RevealMeta | 局部 | Unknown 专用 |

---

## 6 状态规范(适用于所有 14 组件)

| 状态 | 触发 | 视觉特征 |
|---|---|---|
| **Default** | 初始 / 静止 | 基础视觉,border / bg 默认色,无 transform |
| **Hover** | 鼠标移入 | 轻微增强(底色 / 边框 / 透明度),220ms ease |
| **Focus** | 键盘 Tab | Earth Blue 焦点圈 `0 0 0 2px rgba(26, 77, 126, 0.40)` |
| **Active** | 按下 / 选中 | 强对比 + 状态色,scale(0.99) 120ms |
| **Disabled** | 不可用 | opacity 0.5 + `cursor: not-allowed` + 无 pointer event |
| **Success** | 完成 / 提交 | 绿色对勾 #4A8A4A 或 Layer Red 对勾(Khartoum),220ms 渐入 |

> **Earth Blue 焦点圈全局规则**:
> - 仅交互组件需要(GlobalHeader / EchoInput / DistanceNavigation / CoordinateWindow / RevealMeta)
> - Focus ring 必须包含 `outline: 0`(去除浏览器默认)+ 自定义 `box-shadow`
> - 键盘可达性 100% 覆盖

---

## 1. GlobalHeader

**用途**:全站顶部导航(Logo + 主导航 + 当前状态)

**使用页面**:Homepage / City Detail / Unknown Coordinate(简化版,仅 logo + 1 dot)

**视觉结构**:
```
┌────────────────────────────────────────────────────┐
│ 看见地球      [Cities] [Journal] [Timeline] [About]│
│ SEE EARTH                                          │
└────────────────────────────────────────────────────┘
```

**Slots / props**:
| slot | 类型 | 必填 | 说明 |
|---|---|---|---|
| logo | LogoPair | ✅ | 中英双语(看见地球 / SEE EARTH) |
| navItems | NavItem[] | ✅ | 4 个主导航 + 当前路由高亮 |
| backHref | string | 局部 | 仅 City Detail 用,显示「← 城市名 / N / 12」 |
| simplified | boolean | 局部 | Unknown 用,只显示 logo + 1 dot |

**6 状态视觉**:
- **Default**:sticky top,半透明 `rgba(244, 247, 250, 0.85)` + `backdrop-filter: blur(12px)`,bottom border hairline
- **Hover**(navLink):`color: var(--earth-blue)`,220ms ease
- **Focus**(navLink):Earth Blue 焦点圈,2px solid
- **Active**(当前路由):navLink 加 underline,4px 高度,Earth Blue
- **Disabled**:navLink opacity 0.5(暂时未使用,保留)
- **Success**:N/A

**依赖**:无
**Tokens**:`--bg-page`, `--border-hairline`, `--earth-blue`, `--header-height: 72px`
**可复用性**:**全局**(3 个页面共享,Unknown 用 simplified 变体)

---

## 2. SectionHeader

**用途**:Section 顶部标题(kicker + 大标题 + 副描述)

**使用页面**:Homepage / City Detail

**视觉结构**:
```
EARTH · ON THIS DAY                       11px META uppercase
─────────────────────────────────────
地球此刻,同时发生。                  64-72px Serif
此刻,这颗行星上有 12 个远方在运转。   17-18px Italic
```

**Slots / props**:
| slot | 类型 | 必填 | 说明 |
|---|---|---|---|
| kicker | string | ✅ | 11px META uppercase + letter-spacing 0.18em |
| title | string | ✅ | 64-72px Serif |
| subtitle | string | ❓ | 17-18px Italic,Editorial Serif |
| layerAccent | 'blue' \| 'yellow' \| 'red' | ❓ | kicker dot 颜色 |

**6 状态**:静态组件,无状态(无 hover/focus 行为)

**依赖**:无
**Tokens**:`--font-display`, `--fs-h1: 48-72px`, `--earth-blue/yellow/red`
**可复用性**:**跨页面**(Homepage / City Detail 通用,Unknown 不需要)

---

## 3. HeroMedia

**用途**:全幅摄影区域 + 暗 gradient overlay + 文字安全区

**使用页面**:Homepage / City Detail / Unknown Coordinate

**视觉结构**:
```
┌──────────────────────────────────────────────┐
│ ◌ Hero Photo (full-bleed, editorial source) │
│  ┌──────────┐                                  │
│  │ Safe Area│← 左侧 / 中央 / 底部文字安全区   │
│  │ (text)   │                                  │
│  └──────────┘                                  │
│  ▼ Bottom Fade (240px 暗 gradient)            │
└──────────────────────────────────────────────┘
```

**Slots / props**:
| slot | 类型 | 必填 | 说明 |
|---|---|---|---|
| src | string | ✅ | 摄影 URL(editorial source,§2.8.9) |
| alt | string | ❓ | 描述(无障碍) |
| height | '720px' \| '100vh' | ✅ | City Detail 用 720px / Unknown 用 100vh |
| overlay | OverlayConfig | ✅ | 顶部 200px + 底部 240px + 左侧 45% 暗 gradient |
| safeArea | 'left' \| 'center' \| 'bottom' | ✅ | 文字安全区位置 |

**6 状态**:静态视觉组件
- **Default**:基础摄影 + overlay
- **Hover**(Unknown 唯一):照片轻微 `scale(1.02)`,700ms ease(Reveal 体验)
- **Focus**:N/A
- **Active**:N/A
- **Disabled**:N/A
- **Success**:N/A

**依赖**:`LayerIndicator`(顶部 kicker dot)
**Tokens**:`--bg-page`, `--text-inverse`, gradient rgba 黑系列
**可复用性**:**跨页面**(3 个页面共享,是 Project 的核心视觉母版)

---

## 4. WorldTimeRail

**用途**:横向滚动的时间条带(展示 12 城市当前时间)

**使用页面**:Homepage / City Detail

**视觉结构**:
```
─────────────────────── Scroll → ───────────────────────
02:53   03:53   04:53   05:53   06:53   07:53   08:53
Berlin  Cairo  Kyoto Lisbon  London  Mexico  Tokyo
        ↕ +5H  ↕ +1H
```

**Slots / props**:
| slot | 类型 | 必填 | 说明 |
|---|---|---|---|
| cities | CityTime[] | ✅ | 12 个城市,每个含 `time`, `name`, `offset` |
| yourTime | YourTime | ✅ | 高亮当前用户时区,Atmosphere Blue dot |
| layerAccent | LayerColor | ❓ | 主城市 layer 颜色 |

**6 状态**:
- **Default**:12 列等宽 64px 时间 + 11px 城市名
- **Hover**(city cell):`background: var(--bg-hero-mist)`,透明度提升
- **Focus**(city cell):Earth Blue 焦点圈
- **Active**(当前选中城市):时间字号 80px + Earth Blue underline
- **Disabled**:N/A(全元素都可选)
- **Success**:N/A

**依赖**:`TimeDisplay`, `LayerIndicator`
**Tokens**:`--font-mono`, `--fs-time-md: 22-64px`, `--atmosphere-blue`
**可复用性**:**跨页面**(Homepage 顶栏 / City Detail Hero 底部时间块)

---

## 5. TimeDisplay

**用途**:时间数字展示(mono 字体 + tabular-nums)

**使用页面**:Homepage / City Detail / Unknown Coordinate

**视觉结构**:
```
04:53
21° 32' N  ·  100° 25' W
```

**Slots / props**:
| slot | 类型 | 必填 | 说明 |
|---|---|---|---|
| value | string | ✅ | "04:53" / "15:42" |
| size | 'sm' \| 'md' \| 'lg' \| 'xl' | ✅ | 22 / 32 / 64 / 80px |
| layer | LayerColor | ❓ | Earth Blue / Layer Yellow / Layer Red |
| format | 'time' \| 'coord' | ✅ | 时间 vs 经纬度 |

**6 状态**:静态
- **Default** / **Hover** / **Focus** / **Active** / **Disabled** / **Success**:N/A(纯展示)

**依赖**:无
**Tokens**:`--font-mono`, `--fs-time-xl: 64-80px`, `--earth-blue/yellow/red`, `--atmosphere-blue`
**可复用性**:**跨页面**(基础组件,3 页面都使用)

---

## 6. TimeComparison

**用途**:3 段时间并置(主城市 / 中间对比 / Your Time)

**使用页面**:City Detail(03 Same Second / Arrival Hero 底部)

**视觉结构**:
```
15:53          12:53          13:53
LOCAL          ICELAND        LISBON
──────  ────  ──────
+5H
```

**Slots / props**:
| slot | 类型 | 必填 | 说明 |
|---|---|---|---|
| items | TimeComparisonItem[] | ✅ | 3-4 个城市时间并置 |
| delta | string | ❓ | "+5H" / "-3H" |
| align | 'horizontal' \| 'vertical' | ✅ | 横向 / 纵向 |

**6 状态**:静态(纯展示)

**依赖**:`TimeDisplay`, `LayerIndicator`
**Tokens**:`--font-mono`, `--fs-time-md`, layer 三色
**可复用性**:**City Detail 专用**(3 城市 LOCKED mockup 同结构)

---

## 7. CoordinateWindow

**用途**:Unknown Coordinate 坐标碎片展示(23° N / 102° W 等)

**使用页面**:Unknown Coordinate(Reveal 阶段 2-3)

**视觉结构**:
```
23.6345° N
102.5528° W
```

**Slots / props**:
| slot | 类型 | 必填 | 说明 |
|---|---|---|---|
| lat | string | ✅ | "23° N" → "23.6345° N"(渐进精确) |
| lon | string | ✅ | "102° W" → "102.5528° W" |
| precision | 'rough' \| 'precise' | ✅ | rough = 整数度 / precise = 4 位小数 |
| layer | 'earth-blue' | ✅ | 唯一系统提示色 |

**6 状态**:
- **Default**:`UTC ?` 占位
- **Hover**:N/A
- **Focus**:Earth Blue 焦点圈(无障碍)
- **Active**:N/A
- **Disabled**:N/A
- **Success**:Reveal 完成 → 进入 "进入此刻 →"

**依赖**:`RevealMeta`
**Tokens**:`--font-mono`, `--earth-blue`, `--fs-time-xl`
**可复用性**:**Unknown 专用**(全新组件,3 城市 mockup 不用)

---

## 8. LocationMeta

**用途**:城市 / 国家 / 坐标 meta 信息(顶部)

**使用页面**:City Detail(Arrival / One Scene 顶部)

**视觉结构**:
```
KHARTOUM · SUDAN
15.5007° N · 32.5599° E
17 AUG 2026
```

**Slots / props**:
| slot | 类型 | 必填 | 说明 |
|---|---|---|---|
| cityEn | string | ✅ | "KHARTOUM" |
| countryEn | string | ✅ | "SUDAN" |
| coords | string | ✅ | "15.5007° N · 32.5599° E" |
| date | string | ❓ | "17 AUG 2026" |

**6 状态**:静态

**依赖**:`LayerIndicator`
**Tokens**:`--font-mono`, `--fs-meta: 11-12px`, `--text-tertiary`
**可复用性**:**City Detail 专用**

---

## 9. LayerIndicator

**用途**:Layer 颜色小圆点 + kicker 文本(Blue / Yellow / Red)

**使用页面**:City Detail / Homepage(点缀)

**视觉结构**:
```
◌ KYOTO · JAPAN     (Blue dot)
◌ LISBOA · PORTUGAL (Yellow dot)
◌ KHARTOUM · SUDAN  (Red dot)
```

**Slots / props**:
| slot | 类型 | 必填 | 说明 |
|---|---|---|---|
| layer | 'blue' \| 'yellow' \| 'red' | ✅ | 三选一 |
| label | string | ✅ | "KYOTO" |
| kicker | string | ❓ | 11px META uppercase |

**6 状态**:静态

**依赖**:无
**Tokens**:`--earth-blue`, `--layer-yellow`, `--layer-red`
**可复用性**:**City Detail 专用**(可视化当前城市 Layer)

---

## 10. OneScene

**用途**:一个具体瞬间(图 + 极短文字描述)

**使用页面**:City Detail(02 One Scene)

**视觉结构**:
```
┌──────────────────────────────────┐
│                                  │
│   [Editorial 摄影,9 列宽]        │
│                                  │
└──────────────────────────────────┘
15:53, 喀土穆南部。
一栋公寓楼 / 今天很安静。        ← 4 行 italic 22px
```

**Slots / props**:
| slot | 类型 | 必填 | 说明 |
|---|---|---|---|
| image | string | ✅ | 摄影 URL(editorial) |
| description | string | ✅ | 4 行 italic editorial 描述 |
| time | string | ✅ | "15:53" |
| location | string | ✅ | "喀土穆南部" |

**6 状态**:
- **Default**:基础 9 列图 + 3 列文字
- **Hover**(image):`scale(1.02)`,700ms ease,文字块轻微浮现
- **Focus**:N/A
- **Active**:N/A
- **Disabled**:N/A
- **Success**:N/A

**依赖**:`LocationMeta`
**Tokens**:`--font-editorial`, `--fs-h4: 22px`, layer color
**可复用性**:**City Detail 专用**(9/3 列比 + 4 行描述已 LOCKED)

---

## 11. SameSecond

**用途**:3 座城市并置(横向对比),极细竖线分隔

**使用页面**:City Detail(03 Same Second)

**视觉结构**:
```
15:53         │  12:53         │  13:53
              │                │
喀土穆        │  雷克雅未克     │  里斯本
KHARTOUM      │  REYKJAVÍK     │  LISBON
              │                │
炮火……        │  港口水面……     │  电车……
```

**Slots / props**:
| slot | 类型 | 必填 | 说明 |
|---|---|---|---|
| cities | SameSecondCity[] | ✅ | 3 个城市,含 time/name/description |
| dividerStyle | 'hairline' \| 'none' | ✅ | 极细竖线或无 |

**6 状态**:静态

**依赖**:`TimeComparison`, `LocationMeta`
**Tokens**:`--border-hairline`, `--font-mono`, layer color
**可复用性**:**City Detail 专用**(3 城市 LOCKED 验证)

---

## 12. EchoInput

**用途**:私密留痕输入区(textarea + CTA + microcopy)

**使用页面**:City Detail(04 Echo)

**视觉结构**:
```
FOR YOU · LEAVE A TRACE
________________________________________________
                                      记录 →
0 / 80
仅记录这一刻的触动,不显示头像,不追踪身份
你也可以只留下一个词
```

**Slots / props**:
| slot | 类型 | 必填 | 说明 |
|---|---|---|---|
| question | string | ✅ | "这一刻,你留下了什么?" |
| placeholder | string | ✅ | "写下一句你此刻想到的话..." |
| maxLength | number | ✅ | 80 |
| submitLabel | string | ✅ | "记录 →" |
| microcopy | string | ✅ | 隐私提示 |
| hint | string | ✅ | "你也可以只留下一个词" |
| state | 'default' \| 'typing' \| 'submitted' | ✅ | 6 状态映射(见下) |

**6 状态**(参考 Khartoum final-qa `04-echo-state-*.html` 已落地):
- **Default**:底色 transparent,底边 hairline 12% 黑,placeholder 灰 italic
- **Hover**:底边提升到 20% 黑,220ms ease
- **Focus**:底边变 Earth Blue 1.5px,字数提示变 Earth Blue
- **Active**(= typing):与 Focus 同,但 textarea 内容已输入
- **Disabled**:opacity 0.5,not-allowed cursor,textarea readonly
- **Success**(submitted):底边 Layer Red 1.5px,显示 ✓ 对勾 + "已记录"

**依赖**:`LayerIndicator`
**Tokens**:`--font-editorial`, `--font-mono`, `--earth-blue`, `--layer-red`
**可复用性**:**City Detail 专用**(Khartoum 已 6 状态验证)

---

## 13. DistanceNavigation

**用途**:城市间切换(← / → + 城市序号 / 总数)

**使用页面**:City Detail(Arrival 顶部 / Echo 底部)

**视觉结构**:
```
← KHARTOUM · 05 / 12               ← / → 跳转
12 / 12 →
```

**Slots / props**:
| slot | 类型 | 必填 | 说明 |
|---|---|---|---|
| prev | NavCityRef \| null | ✅ | 上一城市 |
| next | NavCityRef \| null | ✅ | 下一城市 |
| position | { current: number; total: number } | ✅ | 5/12 |
| cityEn | string | ✅ | 当前城市英文名 |

**6 状态**:
- **Default**:底边 hairline,11px META uppercase
- **Hover**(← / →):`color: var(--earth-blue)`,220ms ease
- **Focus**:**Earth Blue 焦点圈(2px solid)**
- **Active**(`pressed`):`scale(0.98)`,120ms
- **Disabled**(到达终点):opacity 0.4,cursor not-allowed
- **Success**:N/A

**依赖**:`LocationMeta`
**Tokens**:`--font-mono`, `--fs-meta`, `--earth-blue`
**可复用性**:**City Detail 专用**

---

## 14. RevealMeta

**用途**:Unknown Coordinate Reveal 序列(UTC ? → 23° N → 完整坐标)

**使用页面**:Unknown Coordinate(Reveal 阶段 1-3)

**视觉结构**:
```
Stage 1:  UTC ?
Stage 2:  23° N · 102° W
Stage 3:  23.6345° N · 102.5528° W
Stage 4:  进入此刻 →
Stage 5:  MEXICO CITY · 07:42 · TUESDAY
```

**Slots / props**:
| slot | 类型 | 必填 | 说明 |
|---|---|---|---|
| stage | 1 \| 2 \| 3 \| 4 \| 5 | ✅ | 当前 Reveal 阶段 |
| time | string | ✅ | 当前时间 |
| coords | string \| null | ✅ | null = 显示 "UTC ?" |
| cityEn | string \| null | ✅ | Stage 5 才显示 |

**6 状态**:
- **Default**:Stage 1 → "UTC ?"
- **Hover**:N/A(时间触发,非 hover)
- **Focus**:Earth Blue 焦点圈(Stage 4 CTA 唯一可交互)
- **Active**(= 进入此刻 → 已点击):Scale 0.98 + redirect 触发
- **Disabled**:N/A
- **Success**:Stage 5 显示 → 进入 City Detail

**依赖**:`CoordinateWindow`, `TimeDisplay`
**Tokens**:`--font-mono`, `--earth-blue`, `--fs-time-xl`
**可复用性**:**Unknown 专用**(全新组件,首次抽象)

---

## 15. 组件依赖关系图(简表)

```
GlobalHeader ──→ 无依赖
SectionHeader ──→ 无依赖
HeroMedia ──→ LayerIndicator
WorldTimeRail ──→ TimeDisplay + LayerIndicator
TimeDisplay ──→ 无依赖
TimeComparison ──→ TimeDisplay + LayerIndicator
CoordinateWindow ──→ RevealMeta
LocationMeta ──→ LayerIndicator
LayerIndicator ──→ 无依赖
OneScene ──→ LocationMeta
SameSecond ──→ TimeComparison + LocationMeta
EchoInput ──→ LayerIndicator
DistanceNavigation ──→ LocationMeta
RevealMeta ──→ CoordinateWindow + TimeDisplay
```

**关键观察**:
- `LayerIndicator` 是依赖中枢(被 6 个组件依赖)
- `TimeDisplay` 是基础组件(被 4 个组件依赖)
- 3 个专用组件不互相依赖(CoordinateWindow / OneScene / DistanceNavigation)
- 总共 14 组件 + 5 个底层基础组件(GlobalHeader / SectionHeader / LayerIndicator / TimeDisplay / LocationMeta)

---

## 16. 已知约束(per 8/19 用户指引)

✅ **严格遵守**:
- 不重做现有 3 页面 mockup
- 不引入新视觉系统
- 不引入新依赖
- 不做 Dark Mode / Direction A1(Phase 4)
- 不做 Responsive / Tablet(Phase 5)
- 不做 Witness 演化(8/19 路线图未列)
- 不实现 CSS Modules(等工程师 PROMPT 47)
- 不实现 React 组件(等工程师 PROMPT 46)

✅ **本任务范围**:
- 14 组件规格 + 6 状态视觉规范
- 跨页面可复用性矩阵
- CSS Tokens 提取
- Visual Library HTML + 84 mockup

---

## 17. 触发后续动作

- 🔜 PROMPT 46(给工程师):React 组件实现
- 🔜 PROMPT 47(给工程师):CSS Modules 实现
- 🔜 Phase 4 启动:Dark Mode / Direction A1(8/19 路线图下一站)

---

**字数统计**:约 4,200 字 · 14 组件规格 + 6 状态规范 + 依赖关系图 + 已知约束 + 触发后续
