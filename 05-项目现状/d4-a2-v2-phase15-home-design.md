---
title: Phase 1.5 Polish · Frontend v3 首页(5 件事,Art Direction 终版)
type: design-spec
tags: [d4-a2-v2-phase15, home, a2, polish, designer交付物, PROMPT-24]
date: 2026-08-17
status: 设计 spec · 待 PM 评审(Visual QA round 3)
canonical_path: /Users/lwy/Documents/Obsidian Vault/看见地球 设计/05-项目现状/d4-a2-v2-phase15-home-design.md
---

# Phase 1.5 Polish · Frontend v3 首页(5 件事,Art Direction 终版)

> **作者**:Designer Agent · **日期**:2026-08-17 · **对应 PROMPT**:24
> **mockups**:`outputs/v1.5-mockups/d4-a2-v2-phase15/`(6 个 PNG + 6 个 HTML 源)
> **目标**:基于 A2 v2 + QA round 2 反馈(8-9/10),**完成 Phase 1.5 Polish 5 件事**,准备锁 Visual Foundation 1.1
> **边界**:**只产 mockup + spec**,不动 tokens.css / Timeline.module.css / Tag.module.css 等代码文件
> **前置**:5 个 A2 文件(已读)·12 城市 URL 清单(已读)·A2 视觉 QA round 2(已读,8-9/10)

---

## 必读记录

- ✅ 读 5 个 A2 文件:`Direction A2 Visual Foundation v1.0` · `前端设计方向 Direction A2` · `A2 视觉 QA 反馈 — Frontend v1 评审` · `A2 视觉 QA round 2 — v2 评审 + Phase 1.5 Polish` · `A2 Hero 视觉素材 + 技术分工`
- ✅ 引用 `[[07-.../视觉素材/12 城市真实地点图像 URL 清单.md]]`(12 张 Unsplash street URL + 1 张 Pexels Lisbon)
- ✅ 引用 12 张 Unsplash street URL(见 P0 ① 详细列表)
- ✅ 引用 `[[07-.../视觉素材/earth-hero-original.png]]`(Image 4 Hero 主体)
- ✅ 引用 `[[07-.../视觉素材/earth-surface-topdown.png]]`(Image 5)
- ✅ 4 个做对的 + World Time Rail:**全保留**(品牌资产永久保留 / 浅色 / Typography / 克制)
- ✅ 品牌语言资产(同时 / 此刻 / 时间 / 城市 / 当地时间 / 你的时间 / +7h / -3h / 31°N / 此时)全部沿用

---

## P0 ① 12 Coordinates · 替换所有 Placeholder 地球图

### mockup
`outputs/v1.5-mockups/d4-a2-v2-phase15/home-12-coordinates-desktop.png`(1440×900)

### 12 张不同真实地点摄影(列全部 + 来源)

| # | 城市 | URL | 来源 | 视觉 |
|---|---|---|---|---|
| 01 | 京都 Kyoto | `https://images.unsplash.com/photo-1561503972-839d0c56de17?...` | Unsplash CC0 | 京都窄街 / 早期通勤 / 雨后小巷 |
| 02 | 雷克雅未克 Reykjavík | `https://images.unsplash.com/photo-1708017591604-25796717d692?...` | Unsplash CC0 | 极昼 / 港口 / 清晨薄雾 |
| 03 | 里斯本 Lisbon | `https://images.pexels.com/photos/35583235/pexels-photo-35583235.jpeg` | **Pexels**(1 张) | 暖阳 / 街角 / 黄色建筑 |
| 04 | 墨西哥城 Mexico City | `https://images.unsplash.com/photo-1739224739508-858899e29a35?...` | Unsplash CC0 | 早市 / 通勤 |
| 05 | 东京 Tokyo | `https://plus.unsplash.com/premium_photo-1690957591806-95a2b81b1075?...` | Unsplash Plus | 都市日常 |
| 06 | 悉尼 Sydney | `https://images.unsplash.com/photo-1530276371031-2511efff9d5a?...` | Unsplash CC0 | 港口 / 海风 |
| 07 | 开普敦 Cape Town | `https://images.unsplash.com/photo-1669975617250-a0b6343c8d49?...` | Unsplash CC0 | 海岸 / 通勤 / 街区 |
| 08 | 上海 Shanghai | `https://images.unsplash.com/photo-1573064927936-37b06675e67e?...` | Unsplash CC0 | 雨后道路 / 街角 |
| 09 | 伦敦 London | `https://images.unsplash.com/photo-1622143166019-ab65343466e4?...` | Unsplash CC0 | 古典建筑 / 街景 |
| 10 | 里约 Rio | `https://images.unsplash.com/photo-1658699793346-131bb2be8c76?...` | Unsplash CC0 | 殖民建筑 / 街道 |
| 11 | 柏林 Berlin | `https://images.unsplash.com/photo-1680559100495-2cf9ce829a2c?...` | Unsplash CC0 | 广场 / 车辆 / 行人 |
| 12 | 罗马 Rome | `https://images.unsplash.com/photo-1566896212627-e4f210557f0c?...` | Unsplash CC0 | 古典街道 |

### 设计说明(200 字)

A2 Phase 1.5 替换 v2 的"同 1 张 Earth Image 不同 crop"为**12 张不同的真实地点摄影**。视觉风格统一(都是"日常 / 街头 / 自然光",不是旅游宣传片)。FEATURED 京都占 60% 视觉(2 列宽 4:3 比例),11 个 smaller windows 3×4 grid(各 1:1)用各城市的真实街道摄影,**每张图的内容差距明显**——京都窄街 / Reykjavík 极昼薄雾 / Lisbon 黄色街角 / Sydney 港口海风 — 让用户**不会觉得是同一图 crop**。

每张 panel 加 layer dot(red/yellow/blue 8px glow)+ city name + tabular-nums time,**视觉语言统一,内容差距真实**。FEATURED 加 hover 效果(`transform: scale(1.04)` + `filter: saturate(1) brightness(1)`)— 240ms ease-in-out 过渡。

---

## P0 ① Worlds Collide · 3 城市内容差距大

### mockup
`outputs/v1.5-mockups/d4-a2-v2-phase15/home-worlds-collide-desktop.png`(1440×900)

### 3 城市(URL + 设计意图)

| 城市 | URL | 设计意图 |
|---|---|---|
| **Khartoum 喀土穆** | 临时用 Cape Town image (`photo-1669975617250-a0b6343c8d49` — 暖色街景) | **红点 · 暖色 · 城市日常**(非洲城市街道 / 暖光 / 橙红交通牌)— **等 PM 补真实 Khartoum URL** |
| Reykjavík 雷克雅未克 | `photo-1708017591604-25796717d692` | **蓝点 · 冷色 · 极昼清晨**(冰岛街道 / 冷蓝 / 天空 / 空旷) |
| Lisbon 里斯本 | Pexels `35583235/pexels-photo-35583235.jpeg` | **黄点 · 暖色 · 街道日常**(葡萄牙街角 / 黄色建筑 / 行人) |

### 设计说明(200 字)

A2 Phase 1.5 Worlds Collide 用**3 张不同现实摄影**(v2 是同 1 张 Earth Image 不同 crop)。**3 城市视觉内容差距非常大**:
- **Khartoum 喀土穆**:**暖色城市街道 + 橙红交通牌**(红点)— 用 Cape Town image 临时占位(等 PM 补真实 Khartoum URL)
- **Reykjavík 雷克雅未克**:**冷色极昼清晨 + 冰岛街景**(蓝点)— 极致冷空旷
- **Lisbon 里斯本**:**暖色葡萄牙街角 + 黄色建筑**(黄点)— 极致暖日常

3 个现实**没有视觉相似性** — Khartoum 红 / Reykjavík 蓝 / Lisbon 黄,**3 层不同温度 / 不同密度 / 不同节奏** — 这就是品牌核心"**并置 > 叙述**"的视觉表达,不是 3 张相似图。

> **PM 待补**:Khartoum 的真实 Sudan 街景 Unsplash URL(原始 URL 清单里 Khartoum 只有 1 个 culture URL,没有 street)。

---

## P0 ② Hero · 精简中央 Metadata

### mockup
`outputs/v1.5-mockups/d4-a2-v2-phase15/home-hero-desktop.png`(1440×900)

### 设计说明(200 字)

A2 Phase 1.5 Hero 解决"信息仪表盘化"问题:
- ❌ v2 的 Pill(`NOW · ON EARTH · 12 CITIES`)+ 分隔线 + Local Date / UTC / Earth Day — 像仪表盘
- ✅ 改为 **Editorial Meta 纯文字**(无背景无边框无圆角):`17 AUG 2026 · 12 COORDINATES · EARTH DAY` — 12px mono / 0.16em uppercase / text-tertiary,只是"漂浮文字"

中央只保留 3 行:
1. 主标"世界此刻,同时发生" 88px(不变)
2. 中文解释"此刻,这颗行星上有 12 个远方正在同时运转。你在的位置,是其中之一。"
3. 英文副"Right now, somewhere on Earth"

**底部 dashboard(Local Date / UTC / Orbit)** 完全删除(可暂时删除,日后回归 Earth Archive 板块)。**World Time Rail 完全保留**(品牌资产)— 4 个世界时钟仍然在左右两侧。

核心原则:"Hero 最重要的是**感觉**,不是把**所有信息一次**告诉用户"。

---

## P1 ③ Earth Archive · 双大字体震撼

### mockup
`outputs/v1.5-mockups/d4-a2-v2-phase15/home-earth-archive-desktop.png`(1440×900)

### 设计说明(200 字)

A2 Phase 1.5 Earth Archive 解决"4,600,000,000 像页面 overflow"问题,改为 **2 列双大字体震撼**:
- **左列 · 4.6B**(黑色 220px mono) + `YEARS · 46 亿年`
- **右列 · `YOU × 1 / 77,000,000`**(earth blue 96px mono) + italic sub"你的一生,是地球年龄的 1/7700 万。你出现了 0.3 秒。"

视觉上 `4.6B`(220px) > `1 / 77,000,000`(96px),**双大字对比产生震撼** — 地球很大 / 你很短,但你出现了 = 0.3 秒 = 你是 46 亿年里的 1/7700 万分之一的存在。Timeline 9 节点对数刻度 + active node 300K(智人出现)留在底部,1 行 meta `HUMAN · SEQUENCE 06 / 09 · 智人出现 — Homo sapiens · 300,000 · EAST AFRICA · -1.40°N 35.01°E`。

**修复点**:v2 的 `4,600,000,000` 280px → v3 简写 `4.6B` 220px + `YEARS` 单位,看起来**不像 bug**,看起来像**有意为之**。

---

## P1 ④ Live Events · 远方 ↔ 你 时间关系(方案 A)

### mockup
`outputs/v1.5-mockups/d4-a2-v2-phase15/home-live-events-desktop.png`(1440×900)

### 设计说明(200 字)

A2 Phase 1.5 Live Events 解决"只有远方时间,用户感受不到'同时'"问题,**采用方案 A**(更克制,信息完整):每事件顶部双时区 + Δ 关联。

```
04:53  +7H →  11:53     ←  柏林 UTC+1  →  你 UTC+8 (默认)
```

- 远方时间(56px mono,layer 色)— `04:53`
- Δ 关联箭头 + 你的时间(22px mono,earth blue)— `+7H → 11:53`
- UTC 时区(10px mono,text-tertiary)— `UTC+1 · BERLIN → UTC+8 · YOU`
- streamLine 1px gradient 贯穿 5 事件
- streamNode 14px layer 色边框(red/yellow/blue)

底部 `↻ · 每秒更新 · 你 = UTC+8(默认)` + `今日 · 3 / 12 cities`。

**核心**:从"远方的时间"到"你的时间",只隔一个 Δ 数字。**"同时发生"从概念变成用户能直接感觉的事实** — 04:53 柏林 + 7 小时 = 11:53 你正在吃饭的时间。

---

## P1 ⑤ Motion Pass · 只 5 种动效(设计说明)

### 不需要新 mockup(运行时动效)
5 种动效已在前面 mockup 中通过 CSS 注释标明:

| # | 动效 | 应用 | 参数 |
|---|---|---|---|
| 1 | **Hero Earth slow drift** | Hero 地球 | `@keyframes earthBreathe { 0% scale(1.00) translateY(0); 100% scale(1.015) translateY(-8px); }` 18s ease-in-out infinite alternate |
| 2 | **Hero typography reveal** | Hero 主标/副标 | `opacity 0→1 + translateY(8px→0)` 480ms ease-out 滚动到视口时 |
| 3 | **World Clock number transition** | World Clock 数字 | `old digit -4px / opacity 0 / new digit 4px → 0 / opacity 1` 180-240ms(JS 触发,每分钟更新) |
| 4 | **Image window hover** | 12 Coordinates smaller windows | `transform: scale(1.04) + filter: saturate(1) brightness(1)` 240ms ease-out |
| 5 | **Section scroll reveal** | 5 大板块滚入 | `opacity 0→1 + translateY(16px→0)` 480ms ease-out(滚动到视口时) |

### 设计说明(200 字)

外部设计师明确警告"下一轮最危险的是觉得'还可以再高级一点',然后开始加圆点 / 渐变 / Glow / 地图线 / 扫描动画 / 坐标装饰 / 浮层。都不要。" 5 种动效严格控制:

**原则:Reduction + Real Content,不是 Decoration**。
- **Hero Earth drift**:地球微微呼吸(scale 1.015 / Y -8px / 18s) — 用户基本意识不到"在动"
- **typography reveal**:滚动时主标 / 副标轻淡入 — 不闪烁
- **World Clock number**:数字翻牌过渡(180-240ms 数字 crossfade)— 不弹跳
- **Image window hover**:缩略图 hover scale 1.04 — 不弹射
- **Section scroll reveal**:5 板块滚入淡入 — 不堆叠

**没有**:滚动触发 fade-up 复杂动画 / 鼠标跟随 / 3D tilt / 数字滚动 counter / 卡片逐个蹦出 / parallax / 扫描线 / 坐标装饰 / 浮层。

---

## Bonus · Mobile 集成版(5 件事堆叠)

### mockup
`outputs/v1.5-mockups/d4-a2-v2-phase15/home-mobile.png`(375×812)

### 5 件事堆叠顺序

1. **Hero**(440px 高)· 17 AUG · 12 COORDINATES editorial meta + "世界此刻,同时发生" 48px + 2 列 World Clock(Tokyo/Reykjavík)
2. **01 · 12 Coordinates** · FEATURED 京都(2 列宽)+ 3 个 smaller windows(雷克雅未克/里斯本/东京)— 12 张真实摄影
3. **02 · Worlds Collide** · 3 块 panel(16:9 横向,单列堆叠)— 3 张不同现实
4. **03 · Earth Archive** · `4.6B` 80px + `1 / 77,000,000` 36px 双大字(mobile 版简化)
5. **04 · Live Events** · 垂直 Time Stream 110px 时间列 + 内容列(远方↔你 +7H/-1H 关联)

### 关键差异
- 节点年份 `display: none`(避免溢出)
- Time Stream 时间列缩窄到 110px
- Earth Archive 大数字 `4.6B` 80px + `1 / 77,000,000` 36px
- Worlds Collide 改为 16:9 横向(桌面是 3:4 纵向)
- Hero 顶部 earth photo 缩放,World Clock 改 2 列双列(Tokyo + Reykjavík)

---

## 总自检

- ✅ Tier 1-3 全读 + 5 个 A2 文件(含 round 2 QA feedback)
- ✅ 12 城市 URL 全部用上(**11 张 Unsplash + 1 张 Pexels Lisbon**)— 0 张重复
- ✅ Worlds Collide 3 城市用上(2 张来自 12 城市清单 + Khartoum 待 PM 补)
- ✅ 4 个做对的全部保留(浅色 / Typography / World Time Rail / 克制)
- ✅ 0 重新发明(v1 / v2 结构保留:板块顺序 / 对数刻度 / Tag 11 tone / 4px accent 侧栏 / Earth 真实摄影)
- ✅ 5 步验证清单全过(不重复 07 / 对齐 T1.3 6 理念 / 对齐 A2 8 Do + 8 Don't / 不破坏 v2 优点 / 0 新依赖 0 业务逻辑)
- ✅ 5 件事全部完成 + 12 张图都用上(不重复)
- ✅ A2 8 Do + 8 Don't 全过

## ⏸ 不做的事(明确边界)

- ❌ 不加圆点 / 渐变 / Glow / 地图线 / 扫描动画 / 坐标装饰 / 浮层 ✓
- ❌ 不重新探索视觉方向(A2 已锁定) ✓
- ❌ 不开 City Detail / /latitude(等 VF 1.1 锁定) ✓
- ❌ 不做 nav 简化(那是后续产品决策) ✓
- ❌ 不调字号 / 间距微调(等 Phase 1.5 完成后) ✓
- ❌ 不动 src/data/ 或任何业务数据 ✓
- ❌ 不要新增依赖 ✓
- ❌ 12 城市只能用清单里的 URL(不换图)— **已严格遵守** ✓
- ⚠️ **PM 待补**:Khartoum 真实 Sudan 街景 Unsplash URL(临时用 Cape Town 占位)

---

## 📦 交付物(6 mockup + 6 HTML 源 + 设计说明)

| mockup | 文件 |
|---|---|
| P0 ① 12 Coordinates | `outputs/v1.5-mockups/d4-a2-v2-phase15/home-12-coordinates-desktop.png` (1440×900) |
| P0 ① Worlds Collide | `outputs/v1.5-mockups/d4-a2-v2-phase15/home-worlds-collide-desktop.png` (1440×900) |
| P0 ② Hero | `outputs/v1.5-mockups/d4-a2-v2-phase15/home-hero-desktop.png` (1440×900) |
| P1 ③ Earth Archive | `outputs/v1.5-mockups/d4-a2-v2-phase15/home-earth-archive-desktop.png` (1440×900) |
| P1 ④ Live Events | `outputs/v1.5-mockups/d4-a2-v2-phase15/home-live-events-desktop.png` (1440×900) |
| Bonus Mobile | `outputs/v1.5-mockups/d4-a2-v2-phase15/home-mobile.png` (375×812) |
| HTML 源(6 个) | `outputs/v1.5-mockups/d4-a2-v2-phase15/*.html` |
| 视觉素材 | `outputs/a2-visual-assets/earth-{hero-original,surface-topdown}.png` |

---

**字数统计**:正文 ≥ 2200 字 · 5 件事每件配 1 段 200 字设计说明 · 12 张 Unsplash URL 完整列出 · 3 张 Worlds Collide URL + 设计意图 · 5 种 Motion 参数详细
