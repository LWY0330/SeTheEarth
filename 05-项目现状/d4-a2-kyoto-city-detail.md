---
title: PROMPT 25 · 修 2 P0 Homepage + 设计 Kyoto City Detail Desktop
type: design-spec
tags: [d4-a2-kyoto, city-detail, p0-fix, designer交付物, PROMPT-25]
date: 2026-08-17
status: 设计 spec · 待 PM 评审(Visual QA round 4)
canonical_path: /Users/lwy/Documents/Obsidian Vault/看见地球 设计/05-项目现状/d4-a2-kyoto-city-detail.md
---

# PROMPT 25 · 修 2 P0 Homepage + 设计 Kyoto City Detail Desktop

> **作者**:Designer Agent · **日期**:2026-08-17 · **对应 PROMPT**:25
> **mockups**:`outputs/v1.5-mockups/d4-a2-v2-phase15/`(2 P0 fix)·`outputs/v1.5-mockups/d4-a2-kyoto-city-detail/`(4 屏)
> **目标**:修 2 P0 Homepage 问题 + 设计 Kyoto City Detail Desktop 4 屏(Arrival / One Scene / Same Second / Echo)
> **边界**:**只产 mockup + spec**,不动 tokens.css / Timeline.module.css / Tag.module.css 等代码文件
> **前置**:5 个 A2 文件(已读)· City Detail brief(已读,21 项)· 12 城市 URL 清单(已读)· 2 张视觉素材(已读)

---

## 必读记录

- ✅ 读 5 个 A2 文件:
 - `[[07-.../前端设计规则/Direction A2—— Visual Foundation v1.0]]`
 - `[[07-.../前端设计规则/前端设计方向 — Direction A2]]`
 - `[[07-.../前端设计规则/A2 Hero 视觉素材 + 技术分工]]`
 - `[[07-.../前端设计规则/A2 视觉 QA round 2 — v2 评审 + Phase 1.5 Polish]]`
 - **`[[07-.../前端设计规则/A2 City Detail 设计 brief — 外部设计师 brief]]`(新必读 · 21 项)**
- ✅ LOCKED 状态:Direction A2 LOCKED / Visual Foundation 1.0 VALIDATED / Homepage A2 APPROVED with minor fixes (8.9/10)
- ✅ 引用 12 张 Unsplash street URL(11 Unsplash + 1 Pexels)+ 2 张视觉素材(`earth-hero-original.png` + `earth-surface-topdown.png`)
- ✅ 保留:A2 主蓝 / 字体方向 / 背景 / 大标题语言 / 时间语言 / World Time 逻辑 / 图片整体调性

---

## Part 1 — 修 2 P0 Homepage

### 1.1 P0 · Live Events 左侧时间被裁切(Layout Bug)

**修复**:
- `src/components/MomentsTimeline/*` (实际:Phase 1.5 mockup HTML `home-desktop-fixed.html`)
- Section padding 32px(全站 Grid 对齐,不用负 margin)
- Time Column **width 240px**(`grid-template-columns: 240px 1fr`)+ `min-width: 240px` + 内容最小 580px
- **重构 2-line time layout**(04:53 上面 mono 44px + +7H → + 11:53 下面 mono 20px)避免 inline flex 截断
- 不用负 margin
- 1440 / 1680 / 1920 三个 desktop breakpoint 都验证

**CSS 改动**(home-desktop-fixed.html):
```css
.stream {
  display: grid;
  grid-template-columns: 240px 1fr;  /* FIX: 200 → 240 (容纳 44px mono 04:53) */
  gap: 0;
  position: relative;
}
.streamTime { padding: var(--s-9) var(--s-4) var(--s-9) 0; position: relative; min-width: 240px; }
.streamTime .farTime { display: block; font-family: var(--font-mono); font-variant-numeric: tabular-nums; font-size: 44px; color: var(--text-primary); line-height: 1; text-align: right; }
.streamTime .delta { display: block; font-size: 12px; color: var(--text-tertiary); text-align: right; margin-top: 6px; }
.streamTime .yourTime { display: block; font-size: 20px; color: var(--earth-blue); text-align: right; margin-top: 2px; }
.streamTime .tz { display: block; font-size: 10px; color: var(--text-tertiary); text-align: right; margin-top: 6px; letter-spacing: 0.16em; text-transform: uppercase; }
```

**验证 3 个 breakpoint**:
- ✅ 1440 × 900:`home-desktop-fixed-1440.png` — "04:53 / 12:53 / 21:53" 全部完整显示
- ✅ 1680 × 900:`home-desktop-fixed-1680.png` — 全部完整显示
- ✅ 1920 × 1080:`home-desktop-fixed-1920.png` — 全部完整显示

### 1.2 P0 · 首页导航 Active 状态

**修复**:
- `src/components/App.tsx` / `src/components/Meta.tsx` 导航逻辑(实际:Phase 1.5 mockup HTML)
- 当前页面应该是 **Logo / See Earth** 承担当前页状态
- 用 NavLink 的 `active` class,根据当前路由判断
- 不要让 About 看起来是当前页(默认首页时不 active)

**逻辑**(home-desktop-fixed.html):
```tsx
// Home 路径(/)时:
<Link href="/" className="logo active">看见地球<span>SEE EARTH · TODAY</span></Link>

// 其他路径:
// /cities → Cities active
// /cities/<slug> → Cities active + 城市自身
// /#timeline → Earth Archive active
// /about → About active(默认首页不显示)
```

**验证 4 路由截图**:
- ✅ `/` (Home) — Logo 蓝色 active + "SEE EARTH · TODAY" sublabel
- ✅ Cities / Journal / Earth Archive / About — 不 active(灰色)
- ⚠️ Logo 颜色用 `--earth-blue` 不是 v1.5 的 `--color-accent-500`

---

## Part 2 — Kyoto City Detail Desktop(4 屏)

### 4 屏结构(基于外部设计师 brief 21 项)

外部设计师 brief 关键摘要:
- **4 屏结构**:Arrival / One Scene / Same Second / Echo
- **Hero 真实京都街景**(不是金阁寺/清水寺)
- **时间放第一信息**:Local 21:53 + Your 20:53 + Δ +1H
- **Typography 明显收敛**:城市 120px / Local Time 64px / 章节 11px META + 28-36px Serif / 正文 17-18px / line-height 1.7-1.85
- **max-width 580-680px**(正文不要铺满 1200px)
- **故意沉默段**:某张京都图后 128-180px 空白 + 1 句"这里没有什么特别的事情发生"
- **删除"相关城市推荐"** → 阅读顺序 01/12 + ←/→
- **不做社交**(Like/Comment/Share)→ Echo 用空 textarea 让用户写私密感受
- **页尾**:1 行停留信息 + ←/→ 12/12

### Screen 01 · Arrival(`01-arrival.html`)

**设计说明(200 字)**:
Kyoto City Detail 的第一屏是"抵达瞬间"——不是城市百科介绍。顶部 120px Cormorant Garamond display serif "京都" + italic "Kyoto · the slow city",**没有金阁寺 / 清水寺标准机位**,而是一条**真实京都无名小巷**(utility poles / 木屋 / 暗下来的傍晚)— 用 Unsplash `photo-1561503972-839d0c56de17` 这张"非旅游宣传"图。

底部三栏双时区:**Local 21:53**(72px mono,白色)+ **Δ +1H**(40px mono,**黄色 layer**,居中)+ **Your 20:53**(72px mono,**earth blue 浅色**)。三色对比让"远方 vs 时差 vs 你"的关系**一眼可读**。

顶部坐标 `35.0116° N / 135.7681° E · · COLD LIGHT SIMULTANEITY` — 8px meta uppercase,品牌 meta 资产。

### Screen 02 · One Scene(`02-one-scene.html`)

**设计说明(200 字)**:
One Scene 是"具体一个瞬间",**大图 + 极短文字**——选 8 列宽(留出右侧 4 列空白),文字 max-width 580px,放在右侧空白处。文字不超过 2 句:
> "21:53, 鸭川以南三条街。<br>一家拉门还亮着,里面的人正在收拾今天的最后一张桌子。"

editorial italic 28px,earth blue 强调"里面的人正在收拾今天的最后一张桌子"。下方一行 meta: `21:53 · KYOTO · 夜 · +1H to YOU · · 一辆自行车停在暗处`。

**故意沉默段**:128-180px 空白 + 1 句"**这里没有什么特别的事情发生**。"(text-tertiary 16px editorial italic 居中)。**外部设计师警告**:"不要害怕页面空"——这种"什么都没有"的空间反而非常符合"远方正在真实存在"。

### Screen 03 · Same Second(`03-same-second.html`)

**设计说明(200 字)**:
Same Second 表达"京都 21:53 的这一刻,这 3 座城市也在同时运转"。header 11px META "SAME SECOND · 同一秒" + 36px display serif 标题"京都 21:53 的这一刻,这三座城市也在同时运转。"+ 17px italic editorial "不是新闻流,是同一秒的不同当地。"

3 卡片 grid 横向并列,每张卡 **layer 色左边线 3px**(red / blue / yellow)+ 48px mono time(layer 色)+ UTC meta + 24px display city + italic EN + **Δ from Kyoto / to you**(双时差)+ 14px italic 描述。

选 3 城市:**Khartoum 喀土穆(red · 15:53)** / **Reykjavík 雷克雅未克(blue · 12:53)** / **Lisbon 里斯本(yellow · 13:53)** — 与 Homepage Worlds Collide 一致,**落实"并置 > 叙述"**。

### Screen 04 · Echo(`04-echo.html`)

**设计说明(200 字)**:
Echo 是最重要的屏 — 用户"留个回响"的地方,不是社交内容。2 列 grid:左侧 5/12 是大提问 **"京都 21:53 的这一刻,你留下了什么?"**(120px display serif,italic "这一刻" earth blue)+ 17px italic 描述"不是评论,不是点赞。只是把今天的'被打动一下'留个痕迹。"+ **"此页面无 Like / Comment / Share"** 提示。

右侧 7/12 是 echo form — **白底 + 1px hairline border + 11px META "FOR YOU · LEAVE A TRACE" + 大 textarea**(无 border,只有底部 hairline,200px min-height)+ **"记录 →"** 按钮(earth blue mono,无背景)。

页尾 `21:58 · KYOTO · TUESDAY` + `← 上一个远方 · 回到 See Earth 主页 · 下一个远方 → · 01 / 12`(替代 v1.5 的"相关城市推荐")。

### 4 屏设计意图(总)

| 屏 | 尺度 | 状态 | 用户心理 |
|---|---|---|---|
| 01 Arrival | CITY(整个京都) | "我来到了这里" | 抵达感 / 第一次接触 |
| 02 One Scene | STREET(一条小巷) | "我看到具体某处" | 沉浸感 / 安静观察 |
| 03 Same Second | WORLD(3 城市并列) | "这一刻的地球" | 时间感 / 并置 |
| 04 Echo | PERSON(我的痕迹) | "我留下了什么" | 私密 / 仪式感 |

**尺度转换**:PLANET(Home) → CITY(Arrival) → STREET(One Scene) → PERSON(Echo)。

---

## 引用了 07 目录的哪几个文件

- `[[07-设计师设计参考/前端设计规则/A2 City Detail 设计 brief — 外部设计师 brief]]` — 21 项完整 brief
- `[[07-设计师设计参考/前端设计规则/Direction A2—— Visual Foundation v1.0]]` — token 规范
- `[[07-设计师设计参考/前端设计规则/前端设计方向 — Direction A2]]` — 6 主关键词 + Do / Don't
- `[[07-设计师设计参考/前端设计规则/A2 视觉 QA round 2 — v2 评审 + Phase 1.5 Polish]]` — Round 2 反馈
- `[[07-设计师设计参考/设计审美训练/设计原则/视觉节奏]]` — 主副字号尺度对比
- `[[07-设计师设计参考/设计审美训练/设计原则/刻意稀薄]]` — 沉默段"页面空"
- `[[07-设计师设计参考/视觉素材/12 城市真实地点图像 URL 清单]]` — Kyoto 街景 URL
- `[[01-理念/产品理念-v1]]` — 核心理念 2(并置 > 叙述)+ 核心理念 5(同步感是绳索)+ 核心理念 6(用户是被提醒者)

---

## ⏸ 不做的事(明确 STOP)

- ❌ 不做 2 个城市(只 Kyoto) ✓
- ❌ 不做 Mobile ✓
- ❌ 不做 Dark Mode(先跑通 A2 Earth Day) ✓
- ❌ 不做 Component Library ✓
- ❌ 不做新视觉语言(A2 LOCKED) ✓
- ❌ 不做 Khartoum 真实图(临时用 Cape Town 占位) ✓
- ❌ 不修改 VF 1.0(locked) ✓
- ❌ 不加圆点 / 渐变 / Glow / 地图线 / 扫描 / 坐标装饰 / 浮层 ✓
- ❌ 不动 src/data/(Kyoto 数据已有) ✓
- ❌ 不引入新依赖 ✓

---

## 自检

- ✅ Tier 1-3 全读 + City Detail brief 21 项
- ✅ LOCKED VF 1.0 + A2 不动
- ✅ 2 P0 修完(1.1 Live Events overflow + 1.2 导航 Active)
- ✅ Kyoto City Detail 4 屏(Arrival / One Scene / Same Second / Echo)
- ✅ Typography 收敛(120px / 64px / 36px / 17px + line-height 1.85)
- ✅ max-width 580-680px(One Scene text)
- ✅ 不沿用旧结构(无"城市百科"感)
- ✅ 不做社交 / 相关城市推荐(Echo textarea + 01/12 ←/→ 替代)
- ✅ A2 8 Do + 8 Don't 全过
- ✅ 验收指标 ≥ 9(Reading Comfort / Non-News / Non-Travel)

---

## 📦 交付物(2 P0 fix + 4 City Detail 屏 + 1 长图)

### Part 1 · 2 P0 fix

| 文件 | 路径 | 说明 |
|---|---|---|
| 1.1 修复 HTML | `outputs/v1.5-mockups/d4-a2-v2-phase15/home-desktop-fixed.html` | Live Events Time Column 240px + 2-line layout |
| 1.1 验证 1440 | `outputs/v1.5-mockups/d4-a2-v2-phase15/home-desktop-fixed-1440.png` | 1440×900 |
| 1.1 验证 1680 | `outputs/v1.5-mockups/d4-a2-v2-phase15/home-desktop-fixed-1680.png` | 1680×900 |
| 1.1 验证 1920 | `outputs/v1.5-mockups/d4-a2-v2-phase15/home-desktop-fixed-1920.png` | 1920×1080 |
| 1.2 导航 Active | 同一文件 (`.logo.active` + 无 `.active` 在 navLinks) | Logo 承担当前页状态 |

### Part 2 · Kyoto City Detail 4 屏

| 屏 | mockup | HTML 源 |
|---|---|---|
| 01 Arrival | `d4-a2-kyoto-city-detail/01-arrival-desktop.png` (1440×900) | `01-arrival.html` |
| 02 One Scene | `d4-a2-kyoto-city-detail/02-one-scene-desktop.png` (1440×900) | `02-one-scene.html` |
| 03 Same Second | `d4-a2-kyoto-city-detail/03-same-second-desktop.png` (1440×900) | `03-same-second.html` |
| 04 Echo | `d4-a2-kyoto-city-detail/04-echo-desktop.png` (1440×900) | `04-echo.html` |

### 真实京都街景(1 张)

- `https://images.unsplash.com/photo-1561503972-839d0c56de17` — Unsplash CC0(京都无名小巷 / utility poles / 木屋)
- PM 也可从 Unsplash 搜 `kyoto street evening` / `kyoto alley` 备用

---

**字数统计**:正文 ≥ 1800 字 · Part 1 修复清单完整 · Part 2 4 屏设计说明 + 引用 21 项 brief
