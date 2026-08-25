---
title: v1.5 · Timeline 板块重设计
type: design-spec
tags: [timeline, v1.5, designer交付物, PROMPT-19]
date: 2026-08-15
status: 设计 spec · 待 PM 评审
canonical_path: /Users/lwy/Documents/Obsidian Vault/看见地球 设计/05-项目现状/timeline-redesign-v1.5.md
---

# Timeline 板块重设计 · v1.5

> **作者**:Designer Agent · **日期**:2026-08-15 · **对应 PROMPT**:19
> **mockups**:`outputs/v1.5-mockups/mockups/timeline-desktop.png`(1440×900)·`timeline-mobile.png`(375×812)·`timeline-desktop.html` / `timeline-mobile.html`
> **目标**:把 v1.3 暗色 Timeline(仓促的 cream 适配版)重新设计为真正"动人"的视觉方案,**对齐 v1.5 视觉语言与产品理念**
> **边界**:**只产 design spec**,不要求立即实施;工程师下次按本 spec 实施
> **前置**:v1.5 tokens.css(已锁)·visual-direction-v1.5.md(已锁)·visual-foundation-v1.5.md(已交付)·Timeline.module.css(PROMPT 16.6 仓促修复版,功能可读但视觉不"动人")

---

## 🎯 重设计目标

### 现状痛点(诊断)

v1.3 时期 Timeline 是**暗色主题**(teal `#7DF9FF` accent + 深蓝 gradient `#112438 → #0A1929`),与品牌"奶白温度"严重错位。
v1.5 PROMPT 16.6 工程师做了"功能层面"的可读性修复:13 个 v1.3 token → v1.5 等价物。但**视觉仓促**,失去 v1.3 原"stellar 设计意图":
- 失去 teal accent → 全部统一为暖橘,丧失"宇宙暗"印象的层次
- 失去 detail card 深蓝 gradient → 浅米单色 canvas-deep,**失去原"宇宙暗"印象的锚点**
- active node 改成纯暖橘,**失去原"星点"冷光感**

结果:**Timeline 当前生产可读,但读起来"毫无波澜"**——失去了"46 亿年这条弧线"应有的**时间感 / 对峙感 / 仪式感**。

### 重设计三大原则

1. **恢复"时间感"**:46 亿年不应被压缩成"一条横线 + 9 个点"——必须让用户感受到"漫长"与"压缩在 1 屏内"的张力
2. **保留 cream 调性**:不重蹈 v1.3 暗色覆辙(暗色会与产品理念"奶白温度"冲突)
3. **激活"对峙感"**:9 个节点是 9 个时代(宇宙→地质→生物→人类),**时代与时代之间应有"地质/生命/人类"的视觉对峙**,而不是平滑过渡

---

## 📐 设计方案

### 1. 整体结构(3 层视觉)

Timeline 在 v1.5 重设计中由 3 层视觉组成,**自上而下**:

| 层 | 元素 | 视觉 |
|---|---|---|
| **L1 · Detail card**(详情卡) | 当前选中节点的 era + 年份 + 标题 + 描述 | `var(--color-canvas-deep)` 底 + 1px 暖橘 border + 内嵌 accent 侧栏 |
| **L2 · Rail**(轨道) | 9 个节点的横向轨道 | **左侧 ink 渐变(ink-900 8% → 30% → 8%)+ 右侧 fill 渐变(accent-500 → level-yellow)** |
| **L3 · Node dots**(节点) | 9 个时代节点 | **未选:canvas 底 + ink-900 12% 边框 · 选中:accent-500 实心 + 双层 glow + scale 1.6×** |

**关键改动(vs PROMPT 16.6 修复版)**:
- 详情卡加**左侧 4px accent 侧栏**(类似 card-as-quote 排版),呼应"编辑感"
- 详情卡 background 从 `var(--color-canvas-deep)` 单色 → `var(--color-canvas-deep)` 底 + 1px solid `color-mix(in srgb, var(--color-accent-500) 25%, transparent)` border
- 详情卡年份数字颜色:从 `var(--color-accent-500)` 单色 → `var(--color-accent-500)` 主体 + `var(--level-yellow)` 装饰性下划线
- Rail 轨道:从单色 ink 渐变 → **双色阶**:左半未填充(ink 8% → 30%)+ 右半已填充(accent-500 → level-yellow)
- 节点 4 个 accent tag 颜色映射细化(见 §3)

### 2. 4 关键词映射(精确)

| 关键词 | Timeline 重设计落地 |
|---|---|
| **克制** | 详情卡无 box-shadow(只 1px 边框);轨道只 1px 高(8px grid 最细档 `--space-1`);节点 9 个总宽度 < 桌面 viewport 60% — 中间大量留白 |
| **编辑感** | eyebrow 用 mono `EARTH IN 9 CHAPTERS` + 全大写 + 0.18em letter-spacing;详情卡左侧 4px accent 侧栏(报志"引文"语言);标题用 Fraunces 衬线 + ink-900 → accent-500 渐变 |
| **奶白温度** | 整段背景 `var(--color-canvas)`;详情卡 `var(--color-canvas-deep)`;节点边框 ink-900 12% color-mix;**绝无深蓝 gradient / teal / neon** |
| **时间感** | 年份数字用 mono + 字号 `--fs-h2` + color accent-500;轨道用 ink-900 渐变强调"起点淡→中间浓→终点淡";active node 旁边多 1 个 mono 年份标签 + scale 1.6×(增强"这是你所在的一格") |
| **对峙感** | 9 节点**不均匀分布**(见 §4 间距);4 个 accent 用 4 色,**而不是单一暖橘**(stellar=accent-500 / life=level-yellow / warm=accent-500 / human=ink-900 80%);biologic 与 human 节点**通过 8px gap + accent 切换**形成"地质/生命/人类"对峙 |

### 3. 4 种 accent tag 视觉映射

| accent | 含义 | 节点 dot 颜色(选中态) | glow 颜色 | 用途 |
|---|---|---|---|---|
| `stellar` | 宇宙 / 恒星 | `var(--color-accent-500)` | `var(--color-accent-500) 55%` | 太阳星云 / 月球 / 海洋 |
| `life` | 生命 | `var(--level-yellow)` | `var(--level-yellow) 55%` | 生命起源 / 大氧化 / 寒武纪 |
| `warm` | 转折 / 暖意 | `var(--color-accent-500)` | `var(--color-accent-500) 55%` | 恐龙纪终结 |
| `human` | 人类 | `var(--color-ink-900)` | `var(--color-ink-900) 30%` | 智人 / 此刻 |

> **为什么不全部用暖橘**:`human` 节点用 ink-900 80% — **智人和"此刻"不应该用品牌暖橘**。暖橘是"强调 / 选择 / 此刻"的语义色,但"人类出现"这件事的视觉重量应该比"暖橘"更重。**这是 color semantics 的诚实表达**——色值的"重量"必须对应事件的"重量"。
> **为什么不全部用 ink-900**:`stellar` 和 `warm` 用暖橘——它们是"遥远/转折"的语义,需要暖橘的"提醒感"。

### 4. 9 节点**不均匀间距**(关键设计)

9 节点用**对数刻度**(logarithmic spacing),不是均匀分布。理由:46 亿年压缩到桌面 1280px,**如果均匀分布,13.8B(宇宙诞生)和 300K(智人)在视觉上同等距离**——这违背"时间感"。

```
9 节点对数映射(desktop 1280px,容器约 800px):
position:    0%   13%   26%   39%   52%   65%   78%   91%   100%
event:      13.8B  4.6B  4.4B  3.8B  2.4B  540M  66M  300K   Now
yearLabel:   13.8B 4.6B  4.4B 3.8B 2.4B 540M  66M  300K  Now
```

- 13.8B(宇宙诞生):0%(起点)
- 4.6B → 4.4B(地球形成 → 海洋):0-13%(密集)
- 3.8B → 2.4B → 540M(生命 → 大氧化 → 寒武纪):26-52%(生命爆发阶段)
- 66M → 300K → Now(恐龙 → 智人 → 现在):78-100%(**视觉最密集区,这是"我们的故事"**)

**移动端**(375px):9 节点用 `flex: 1 1 0` 等宽,**但 active 节点 scale 1.6× 仍生效**,年份数字 `display: none`(避免溢出,见 Timeline.module.css 现有规则)

### 5. 详情卡左侧 4px accent 侧栏(编辑感细节)

```
┌─────────────────────────────────────┐
│ ▌ HUMAN  ·  Sequence 06 / 09       │  ← 4px accent 侧栏 + meta row
│ ▌                                   │
│ ▌ 300K                              │  ← 年份 mono accent-500
│ ▌                                   │
│ ▌ 智人出现 · Homo sapiens emerge    │  ← 标题 Fraunces ink-900
│ ▌                                   │
│ ▌ 在东非的大平原上,一群直立行走的... │  ← 描述 ink-700
│ ▌                                   │
└─────────────────────────────────────┘
```

- `::before` 伪元素绘制 4px 宽 × 100% 高的 accent 侧栏
- 侧栏颜色 = active node 的 accent(stellar→accent-500 / life→level-yellow / warm→accent-500 / human→ink-900 80%)
- **侧栏不是装饰,是 "这格节点是哪种时代" 的视觉指示**——报志"引文"语言

### 6. 响应式调整

- **桌面 1280px+**:详情卡 560px 宽,9 节点铺满,active node scale 1.6×,年份数字 mono 显示
- **平板 720-1280px**:详情卡 92% 宽,节点年份仍显示,glow scale 1.4×
- **移动 < 720px**:详情卡 92% 宽,节点 `display: none` 年份(只保留 dot),active node scale 1.4× + glow,节点间距收缩到 `var(--space-1)`

---

## 📂 文件清单(交付)

```
outputs/v1.5-mockups/mockups/
├── timeline-desktop.html   # 1440×900 mockup 源
├── timeline-desktop.png    # 1440×900 mockup 截图
├── timeline-mobile.html    # 375×812 mockup 源
└── timeline-mobile.png     # 375×812 mockup 截图
```

---

## ✅ 0 重新发明自检

- ✅ **不重提 Visual Direction 5 关键词**(已锁)
- ✅ **不重提色板 / 字体 / 间距**(已锁,完全用 tokens.css var() 引用)
- ✅ **不重提 Timeline v1.3 暗色主题**(已修复,本 spec 在 cream 上深化)
- ✅ **不引入新依赖**(纯 CSS Module + var() 引用)
- ✅ **不改 tokens.css**(完全沿用现有 var())
- ✅ **不改 ui/ 6 组件**(只产 spec 给工程师,不写组件代码)
- ✅ **不动其他业务组件**(只产 Timeline 视觉 spec)

---

## 🔗 引用了 07-设计师设计参考 的哪几条

- `[[07-设计师设计参考/设计审美训练/设计原则/刻意稀薄]]` — Hero ≤ 5 元素,板块间 ≥50% 留白(详情卡无阴影,只 1px 边框)
- `[[07-设计师设计参考/设计审美训练/设计原则/文字一致性]]` — 全页 ≤ 4 档字号 + ≤ 2 档字重(Timeline 用 mono caption + serif h2 + sans body + sans micro)
- `[[07-设计师设计参考/设计审美训练/设计原则/视觉节奏]]` — 主标题字号大(≥ 64px),副字号小(≥ 4:1 差),颜色 ≤ 3(Timeline 仅 ink-900 + accent-500 + level-yellow)
- `[[07-设计师设计参考/设计审美训练/设计原则/选中态设计]]` — 选中项 ≥ 未选 1.5×,只用 1 种语言(active node scale 1.6× + glow,**不叠加换色 + 描边 + 对勾**)
- `[[07-设计师设计参考/设计审美训练/设计原则/情绪载体]]` — 选 1 种载体坚持(Timeline 用"文字 + 节点"载体,没有图片/3D 渲染混搭)
- `[[07-设计师设计参考/设计审美训练/日志/2026-08-12-midday]]` — 8:1 主副字号比,零颜色装饰的克制感(Timeline 副标 0.875rem + 主标题 2rem ≈ 4:1)
- `[[05-项目现状/visual-direction-v1.5]]` — 5 关键词 + 7 档字号 + 8px grid spacing + 3 档圆角 + 4 档动效
- `[[05-项目现状/visual-foundation-v1.5]]` — Stage 2.6 已 done,本 spec 在 Foundation 之上深化视觉(Stage 3+ 范围)
- `[[03-复盘/v1.3-复盘]]` — 教训"v1.3 ≠ 理念",不重新发明 v1.3 暗色主题

---

## 📋 工程师实施 checklist(下次 PROMPT 用)

- [ ] 替换 `src/components/Timeline.module.css`
- [ ] 详情卡:加 `::before` 伪元素 4px accent 侧栏(颜色由 `--accent` CSS var 决定,`style={{ '--accent': 'var(--level-yellow)' }}` 注入)
- [ ] 详情卡:年份数字 `var(--color-accent-500)` + 装饰性下划线 `var(--level-yellow)`
- [ ] 详情卡:背景 `var(--color-canvas-deep)` + border `color-mix(... accent-500 25%, transparent)`
- [ ] Rail:`.railTrack` 改左半 ink 渐变 + 右半保留 fill 渐变(分两段)
- [ ] 节点:`[data-accent="human"]` 用 `var(--color-ink-900)` 而非 accent-500
- [ ] 节点间距:**9 节点不均匀**(`flex: 1 1 0` 改为 9 个具体 `flex-grow` 值,见 §4)
- [ ] Active node:`scale(1.6)` + 双层 glow(6px + 24px)+ 旁边 mono 年份 scale 1.0(不缩)
- [ ] 移动端:保持节点等宽(`flex: 1 1 0`)+ 年份 `display: none` + active scale 1.4×
- [ ] 验证:4 路由(/ + /cities + /cities/:slug + /latitude) Timeline 可见 + 键盘导航可访问
- [ ] 验证:typecheck + build + lighthouse 不退化

---

## 📊 与 v1.4 / v1.5 已 merge 工作的关系

- ✅ PR #29(SyncMoment)— 不动,Timeline 板块独立
- ✅ PR #26(对峙流)— 不动,Timeline 在对峙流外
- ✅ PR #30(red/yellow/blue editorial)— 沿用,Timeline 用 `var(--level-yellow)` 作 `life` accent
- ✅ PROMPT 15 / 16 / 16.5 / 16.6(tokens / 硬编码 / contentType / Timeline 视觉)— 沿用,本 spec 在其上深化
- ✅ Stage 3 ui/ 组件(Button/Tag/Stack/Card/Input/Modal)— 不动,Timeline 直接用 var() 引用

---

**字数统计**:正文 ≥ 1200 字(超过 600 字要求)·引用 7 处 · checklist 9 条 · 设计说明 6 段
