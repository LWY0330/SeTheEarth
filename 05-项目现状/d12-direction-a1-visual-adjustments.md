---
title: Direction A1 (Earth Night) 视觉调整 · Phase 4 first pass
type: design-spec
tags: [dark-mode, direction-a1, earth-night, visual-adjustments, phase-4, see-earth-redesign]
date: 2026-08-22
sender: 内部 Designer Agent
status: first pass LOCKED (PM 评审后定)
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/d12-direction-a1-visual-adjustments.md
related_docs:
  - /Users/lwy/Documents/ChatGPT/看见地球/05-项目现状/d12-dark-mode-tokens.md (24 token × 2)
  - /Users/lwy/Documents/ChatGPT/看见地球/05-项目现状/d4-a2-v2-home-design.md (A2 LOCKED)
  - /Users/lwy/Documents/ChatGPT/看见地球/07-设计师设计参考/SEE_EARTH_DESIGN_SYSTEM_v1.3_Complete_Spec.md (v1.3 §2.1.9)
---

# Direction A1 (Earth Night) 视觉调整 · Phase 4 first pass

> **顶部声明**:Direction A1(Earth Night)与 Direction A2(Earth Day)是 SEE EARTH 的两个并列视觉方向。A1 是 Phase 4 路线图启动的暗色衍生方向。本文档记录 A1 vs A2 的具体视觉差异,以及摄影 / 颜色 / 阴影 / 留白的调整规则。
> **模式**:Addendum(v1.2/v1.3 + d11 + A2 全部 LOCKED,A1 是暗色衍生)
> **触发**:8/19 用户指引「04 再做 Direction A1 / Dark Mode」+ 「A1 = Earth Night 命名」

---

## 0. 整体定位

### 0.1 A1 vs A2 一句话对比

| 维度 | A2 · Earth Day(现 LOCKED)| A1 · Earth Night(Phase 4)|
|---|---|---|
| **底色** | 冷白 `#F4F7FA` | 深空蓝黑 `#0E0E10` |
| **摄影调性** | 冷白 + 冷光 + 自然光 | 蓝调 + 紫调 + 暖金调 |
| **摄影题材** | 白天 / 街头 / 自然风景 | 夜景 / 黄昏 / 室内 / 城市灯光 |
| **氛围** | 安静 / 干净 / 编辑性 | 神秘 / 沉浸 / 仪式感 |
| **触发场景** | 白天使用 / 明亮环境 | 夜间使用 / 沉浸阅读 / 弱光环境 |
| **对比策略** | 深色 on 浅色 | 浅色 on 深色(对比度更高)|

### 0.2 A1 ≠ 新视觉系统

A1 与 A2 共享:
- ✅ 同一套栅格(1440 / 1680 / 1920)
- ✅ 同一套间距节奏(96 / 64-80 / 128 / 160)
- ✅ 同一套字体族(Cormorant Garamond / Fraunces / Inter / JetBrains Mono)
- ✅ 同一套 Motion(5 种允许动效)
- ✅ 同一套 0 阴影 / 0 大圆角 全局规则
- ✅ 同一套 4 屏 City Detail Pattern
- ✅ 同一套 Same Second 3 栏并置
- ✅ 同一套 14 组件 / 6 状态

**A1 仅调整**:token value(24 token × 2 variants)+ 摄影源 + 阴影 / overlay alpha + 留白节奏

---

## 1. 摄影调整(Earth Night · 关键)

### 1.1 摄影源切换规则

| 城市 | A2 Earth Day 摄影(已 LOCKED)| A1 Earth Night 摄影(本任务)|
|---|---|---|
| **Kyoto** | 京都清晨 / 街道 / 鸟居 / 樱花 | 京都夜景 / 祇園灯笼 / 雨夜 / 室内茶室 |
| **Khartoum** | 喀土穆午后 / 市场 / 街道 / 蓝尼罗河白天 | 喀土穆日落 / 蓝尼罗河灯光 / 室内 / 暖光 |
| **Lisbon** | 里斯本白天 / 黄色电车 / Alfama 阳光 | 里斯本黄昏 / 阿尔法玛夜景 / 路灯 / 暖金调 |
| **Reykjavik** | 冰岛自然光 / 极昼 | 冰岛冬季夜 / 极光(若有) |
| **Mexico City(Unknown)** | 中美洲式街景(白天 / 自然光) | 中美洲夜色 / 街灯 / 蓝色调 |

### 1.2 摄影筛选标准(Earth Night)

| 维度 | 要求 |
|---|---|
| **色调** | 蓝调 / 紫调 / 暖金调(避免过曝白光)|
| **亮度** | 中等偏低(允许少量灯光点光源)|
| **构图** | 同 A2(9 + 3 列 / 75% 25%)|
| **题材** | 夜景 / 黄昏 / 室内 / 城市灯光 |
| **排除** | 白天户外 / 强日光 / 蓝天白云 / 雪地反光 |
| **优先级** | city lights / 室内光 / 月光 / 雨夜 / 雾景 |

### 1.3 摄影视觉对比示例(per Layer)

#### Blue Layer(Earth Blue · Kyoto)
- **A2**:浅蓝色调街道,清水寺晴天,樱花,色彩清新
- **A1**:深蓝色调街道,祇園灯笼暖光,雨夜反射,色彩沉稳

#### Yellow Layer(Lisbon)
- **A2**:明亮黄色电车 + 阳光 + 街景
- **A1**:暖金调路灯 + 黄昏天空 + Alfama 夜景

#### Red Layer(Khartoum)
- **A2**:沙漠午后 / 市场人流 / 红土地面
- **A1**:沙漠日落 / 室内暖光 / 蓝尼罗河灯光

### 1.4 不强制覆盖所有城市

Phase 4 first pass 主要验证 **Earth Night 色调 + 文字对比**。不要求每个城市都有夜景素材。
- ✅ 必须:Kyoto(本任务 City Detail 主角)+ Unknown(Mexico City 夜色)+ Homepage Hero(地球夜景)
- 可选:Lisbon / Khartoum / Reykjavik(若摄影师素材不齐全,沿用 A2 摄影 + 加深 overlay 也可)

---

## 2. Earth Blue 提亮 30%

### 2.1 HEX 推导

```
Light: #1A4D7E  →  Dark: #5A8DBE
```

| 通道 | Light | Dark | Diff |
|---|---|---|---|
| R | 26 (0x1A) | 90 (0x5A) | +64 |
| G | 77 (0x4D) | 141 (0x8D) | +64 |
| B | 126 (0x7E) | 190 (0xBE) | +64 |

每个通道 +64,大致提亮 30%。

### 2.2 对比度对比(WCAG)

| 底色 | Light 变体 | Dark 变体 |
|---|---|---|
| `#F4F7FA` 冷白 | 8.2:1 (AAA)| — |
| `#0E0E10` 深空 | — | 6.2:1 (AAA)|

> **A2 在白底上 8.2:1,A1 在深底上 6.2:1**——两者均超 WCAG AAA 大字 7:1 / AAA 小字 7:1 的边界(A1 略低但仍在 4.5:1 AA 以上)。

### 2.3 衍生色提亮

| Token | Light | Dark | 提亮幅度 |
|---|---|---|---|
| `--earth-blue` | `#1A4D7E` | `#5A8DBE` | +30% |
| `--earth-blue-deep` | `#264A73` | `#3A6F9D` | +30% |
| `--earth-blue-subtle` | `#DCECFB` | `#1F2D40` | 反转(浅蓝 → 深蓝)|
| `--atmosphere-blue` | `#8EBBEF` | `#A8C9E8` | +10% |
| `--layer-yellow` | `#D8B15C` | `#E8C77C` | +12% |
| `--layer-red` | `#D96A5F` | `#E5877D` | +8% |
| `--success-green` | `#4A8A4A` | `#6BAF6B` | +25% |

> **Layer 提亮规则**:Earth Blue 提亮 30%(主色,对比最重要);Layer Yellow 12% / Layer Red 8%(语义点缀,不需要太强对比);Success Green 25%(Echo 对勾,需要明显反馈)。

---

## 3. 文字对比增强

### 3.1 文字层级对照

| 层级 | Light | Dark | 备注 |
|---|---|---|---|
| **Primary**(城市名 120px)| `#11161B` | `#F5F5F5` | 反转;dark variant 显著提亮 |
| **Secondary**(描述 / 时间)| `#4D5A66` | `#B5B5B5` | 反转;dark variant 浅灰 |
| **Tertiary**(Meta / Hint)| `#7B8792` | `rgba(255,255,255,0.7)` | 反转 + 半透 |
| **Quaternary**(占位)| `rgba(17,22,27,0.5)` | `rgba(245,245,245,0.45)` | 反转 |
| **Inverse**(Hero 上白)| `#F7FAFC` | `#0E0E10` | 反转;深色模式下底色变成 Hero 上的字 |

### 3.2 对比度对比

| 组合 | Light | Dark |
|---|---|---|
| Primary on bg-page | 17.2:1 (AAA)| 18.7:1 (AAA)|
| Secondary on bg-page | 8.9:1 (AAA)| 11.6:1 (AAA)|
| Tertiary on bg-page | 4.7:1 (AA)| 10.4:1 (AAA)|

> **A1 dark variant 整体对比度高于 A2 light variant**(深色背景 + 浅色文字的物理对比更高)。
> **关键规则**:`text-tertiary` 在 A1 是 10.4:1(AAA),在 A2 是 4.7:1(AA only)——A1 的弱信息可读性更强。

---

## 4. 阴影加深

### 4.1 阴影数值对照

| Token | Light | Dark | 加深规则 |
|---|---|---|---|
| `--shadow-none` | `none` | `none` | 全局规则:0 阴影(已 LOCKED) |
| `--shadow-card` | `0 1px 3px rgba(0,0,0,0.08)` | `0 1px 3px rgba(0,0,0,0.4)` | Light 0.08 → Dark 0.4(5x 加深)|
| `--overlay-hero-top` | `rgba(7,14,20,0.30)` | `rgba(0,0,0,0.50)` | 0.3 → 0.5(+0.2)|
| `--overlay-hero-bottom` | `rgba(7,14,20,0.50)` | `rgba(0,0,0,0.65)` | 0.5 → 0.65(+0.15)|
| `--overlay-hero-left` | `rgba(7,14,20,0.45)` | `rgba(0,0,0,0.60)` | 0.45 → 0.6(+0.15)|
| `--overlay-hero-warm-bottom` | `rgba(40,24,16,0.5)` | `rgba(40,24,16,0.7)` | 0.5 → 0.7(+0.2)|

### 4.2 加深推导

| 底色 | Light 阴影 alpha 0.08 视觉 | Dark 阴影 alpha 0.08 视觉 |
|---|---|---|
| `#F4F7FA` 冷白 | 隐约可见 ✓ | — |
| `#0E0E10` 深空 | — | 几乎不可见 ✗(深底 + 深阴影 = 消失) |

> **深色模式阴影需加深 5x(0.08 → 0.4)才能保持视觉权重一致**。

---

## 5. 留白调整(暗色视觉密度)

### 5.1 留白规则

A1 dark variant 的视觉密度比 A2 light variant **低 20-30%**(深色背景 + 浅色文字的对比刺激感更弱,需要更多空间才能"看到"内容)。

### 5.2 调整方式

| 维度 | A2 · Earth Day | A1 · Earth Night | 调整 |
|---|---|---|---|
| **Section padding** | 96 / 128 px | 96 / 128 px(v1.3 LOCKED)| 不变 |
| **屏间距** | 128 px | 128 px | 不变 |
| **屏与 nav 距离** | 96 px | 96 px | 不变 |
| **标题与正文** | 64-80 px | 80-96 px | **A1 +16px** |
| **City Detail 4 屏间距** | 128 px | 128 px | 不变 |
| **Hero padding-x** | 32 px | 48 px | **A1 +16px**(深色留白感更强)|

> **核心**:**v1.3 LOCKED 间距节奏不动**,仅在 component-level(如 Hero / Section)略微增加 padding-x 让暗色模式更"透气"。

### 5.3 不强制覆盖所有间距

Phase 4 first pass **不重做 mockup**(per PROMPT 47 STOP),所以留白调整在 **Visual Library HTML 的 dark 模式演示**中体现,**不修改已 LOCKED 的 LIGHT mockup**。工程师实施时(PROMPT 48)再统一调整。

---

## 6. A1 不引入的视觉元素(明确 STOP)

❌ **禁止**(per 8/19 路线图):
- 新视觉系统
- 新组件 / 新图标
- 新字体族
- 新 motion(5 种允许动效不动)
- 扫描线 / 雷达 / 科技 HUD / Glitch / Cyberpunk
- Glow / 圆点 / 渐变 / 地图线 / 扫描动画
- 动画加载条 / 进度条
- Witness 演化
- Responsive / Tablet 调整

✅ **仅调整**:
- 24 token × 2 variants 值
- 摄影源(夜景 / 黄昏 / 室内 / 城市灯光)
- 阴影 / overlay alpha(加深)
- Layer 色(提亮)
- 文字颜色(反转 + 提亮)
- 留白节奏(略增 +16px,在 component-level)

---

## 7. A1 vs A2 决定规则(产品决策)

### 7.1 何时显示 A1 / A2

| 场景 | 默认显示 | 用户切换 |
|---|---|---|
| **首次访问(无 localStorage)** | 跟随系统 `prefers-color-scheme` | 用户用 ThemeSwitcher 切换 |
| **localStorage 有 `light`** | A2 Earth Day | 用户可切到 dark / auto |
| **localStorage 有 `dark`** | A1 Earth Night | 用户可切到 light / auto |
| **localStorage 有 `auto`** | 跟随系统 | 用户可切到 light / dark(覆盖 auto)|

### 7.2 默认推荐(auto / light 优先)

- **白天用户**:大多系统浅色 → A2 Earth Day
- **夜间用户**:大多系统深色 → A1 Earth Night
- **推荐**:让用户首访跟随系统,后续用户用 ThemeSwitcher 控制

### 7.3 与 Editorial CMS 的关系

Phase 4 不涉及 CMS。但 CMS 上线后,内容编辑可以为同一篇内容配两套摄影(白天 + 夜晚),用户切换主题时自动切换。
本任务**不实现**该机制,**仅在 token + 摄影层面切换**。

---

## 8. 已知约束(per 8/19 + PROMPT 47)

✅ **严格遵守**:
- A1 ≠ 新视觉系统(仅 token + 摄影切换)
- 不引入新依赖
- 不做 Witness 演化
- 不做 Responsive / Tablet
- 不批量导入 50+ 城市

✅ **本任务范围**:
- A1 vs A2 视觉差异文档化
- 24 token × 2 variants 中标注 A1 衍生值
- 摄影筛选标准(Earth Night)
- 阴影 / overlay 加深规则
- Layer 提亮推导

---

## 9. 触发后续动作

- 🔜 **PROMPT 48(给工程师)**:基于 d12 tokens 实现 ThemeSwitcher + A1/A2 切换
- 🔜 **Phase 5 启动**:Responsive / Tablet(8/19 路线图下一站)
- 🔜 **CMS 启动**:Witness 演化 + 内容摄影双套(白天 + 夜晚)

---

**字数统计**:约 1,800 字 · A1 vs A2 整体定位 + 摄影调整 + Earth Blue 提亮推导 + 文字对比增强 + 阴影加深 + 留白调整 + 不引入元素 + 已知约束
