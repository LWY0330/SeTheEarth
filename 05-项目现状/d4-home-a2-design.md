---
title: D4 · 首页 A2 设计 spec
type: design-spec
tags: [d4, home, a2, designer交付物, PROMPT-22]
date: 2026-08-17
status: 设计 spec · 待 PM 评审
canonical_path: /Users/lwy/Documents/Obsidian Vault/看见地球 设计/05-项目现状/d4-home-a2-design.md
---

# D4 · 首页 A2 设计 spec

> **作者**:Designer Agent · **日期**:2026-08-17 · **对应 PROMPT**:22
> **mockups**:`outputs/v1.5-mockups/d4-a2/home-desktop.png`(1440×900)·`home-mobile.png`(375×812)·`home-desktop.html` / `home-mobile.html`
> **目标**:基于 Direction A2 重新设计,**覆盖** v1.5 cream 暖色系,建立白昼地球观察站气质
> **边界**:**只产 mockup + spec**,不动 tokens.css / Timeline.module.css / Tag.module.css 等代码文件
> **前置**:Direction A2—— Visual Foundation v1.0(已读)·前端设计方向 — Direction A2(已读)·产品理念 v1 6 条(已读)·v1.4 / v1.5 已 merge 工作(不动)

---

## 🎯 设计目标

### v1.5 被覆盖的边界

| v1.5(已废) | A2(新方向) |
|---|---|
| 奶白 canvas #F5F1EA + 暖橘 #B25E40 | **冷白 #F4F7FA + 地球蓝 #4F8FE8**(≤ 5% 面积) |
| Fraunces serif + Inter sans + JetBrains Mono | **Cormorant Garamond display + Fraunces editorial + Inter sans + JetBrains Mono**(4 角色字体) |
| 5 关键词:克制/编辑感/奶白温度/时间感/对峙感 | **6 主关键词**:Simultaneity/Observation/Atmosphere/Orbit/Global Presence/Quiet Precision |
| 4 档动效 100-500ms | **3 档动效** 140/240/480/720/12000ms(Drift/Reveal/Breathe) |
| 9 节点时间轴(暗色 → 仓促 cream 适配) | **24 经度横向条带 + 5 时刻左右对峙** |
| Tag 11 tone + level-* 3 色调 | **保留 11 tone 结构**(色值覆盖为 A2 earth blue 系) |

### 设计说明摘要(200 字)

A2 首页的核心是**"白昼轨道视角"**——hero 是 1200px 直径的地球白昼弧面,云层丰富、大气层轻发光,占据首屏 80% 视觉面积。左右两侧各 2 个世界时钟(Tokyo/Reykjavík, Lisbon/Cape Town),共 4 个远方同时显示。中央是 Display XL 72px 主标题"世界此刻,同时发生", "同时发生" 用 earth blue accent 强调。中央下方 1 个轻量 CTA"选择你的城市 →"。

12 城坐标用 4×3 横向条带(不是网格),每张卡片 220px 高,左下 city name + time + layer dot,右上 01/12 序号 + 中英城市名,背景是模拟真实地点的城市自然光渐变(低饱和,有真实感)。WORLDS COLLIDE 3 列对峙,严格 red/yellow/blue 8px 圆点作为信息标记,正文用 Editorial Serif italic。Earth Archive 复用 v1.5 对数刻度结构 + 4px earth-blue 侧栏(从 v1.5 cream accent 改为 A2 earth-blue accent),active node scale 1.6× + 双层 glow。Live Events 是 5 行单列时间轴,每行 mono time + city + title + 11 tone tag + 经纬度(33°31′N 13°24′E 格式)。

---

## 🧭 A2 5 关键词 → mockup 映射

| A2 关键词 | mockup 上具体位置 |
|---|---|
| **Simultaneity 同时发生** | Hero 中央主标题 + 4 个世界时钟 + Live Events 5 行并发事件 |
| **Observation 观察** | "NOW · ON EARTH · 12 CITIES" 状态指示 + world clock 数据精确感 + 经纬度 tabular-nums |
| **Atmosphere 空气感** | hero earth 大气层薄雾(径向 gradient) + 城市卡片背景低饱和度自然光渐变 + 整体冷白基调 |
| **Orbit 轨道视角** | hero 1200px 直径地球白昼弧面 + meta typography 12px/0.12em 报志感 |
| **Global Presence 全球在场** | 12 城市 4×3 横向条带 + 左右双侧世界时钟(地理对称)+ Meta Typography UTC 时区标识 |
| **Quiet Precision 安静而精确** | 12px/0.12em 大写标签 + mono time tabular-nums + hairline border(8% 透明度)+ 整体留白 ≥ 30% |

---

## ✅ A2 8 Do 自检

| Do | mockup 上如何体现 |
|---|---|
| 1. 白昼地球观察站 | hero 1200px 地球白昼弧面 + 大气层薄雾 + 冷白基调 |
| 2. 主标题是构图核心 | "世界此刻,同时发生" 168px display serif 居中,字号占 hero 40% 高度 |
| 3. 留白建立高级感 | hero section padding 80px + section 之间 128px + footer 64px |
| 4. 图片承担叙事 | 12 城市卡片背景用真实地点渐变(每城市独立 hue),不用图标 |
| 5. 轻蓝建立识别 | earth blue #4F8FE8 用在 CTA / active link / 时间同时发生 / 对数刻度 progress |
| 6. 信息精确感 | mono time + tabular-nums + Meta 12px/0.12em + 经纬度"°′″ 格式 |
| 7. 组件低存在感 | hairline border(8% 透明度) + 卡片无阴影(只 micro 0 2px 8px rgba)+ 圆角 ≤ 12px |
| 8. 首页像"世界入口" | hero 是 80vh,地球 + 时间 + 主标题 + CTA = 4 元素,其它全部下沉 |

---

## ❌ A2 8 Don't 自检

| Don't | mockup 上如何规避 |
|---|---|
| 1. 不要奶油白 | 整页背景 #F4F7FA(冷白雾灰),**0 米白/暖 beige/咖啡奶油色** |
| 2. 不要 AI 工具感 | 无 prompt 输入框 / 无发光渐变 / 无聊天窗口感;CTA 是"选择你的城市 →" |
| 3. 不要电商感 | 无模块卖点堆砌 / 无强 CTA 导向;CTA 只有 1 个,在 hero |
| 4. 不要新闻门户感 | 无密集信息流 / 无多列标题;Live Events 5 行,大间距 |
| 5. 不要 SaaS Dashboard 化 | 无小卡片矩阵 / 无控件;12 城市条带是观察窗,不是数据网格 |
| 6. 不要为了浅色而"无主视觉" | hero 1200px 地球白昼弧面,占首屏 80% 视觉面积 |
| 7. 不要杂乱图片 | 12 城市统一"低饱和 / 自然光 / 真实地点摄影"气质(每城市独立渐变) |
| 8. 不要过多边框和硬分割 | border-hairline 8% 透明度,只在必要时用;section 之间靠留白分隔 |

---

## 🏗️ 结构清单(4 板块 + footer)

### 板块 1 · 12 坐标横向条带(ATLAS)

- 标题:`01 / 04 · ATLAS · 此刻的世界` + `12 个同时运转的远方坐标`(42px display serif)
- 副标:右侧 italic "同一时刻里,这些城市正在发生不同的现实——不是新闻,而是正在发生的同步切片。"
- 12 城市 4×3 grid,每卡片:
  - 左下:city name(Fraunces 28px)+ UTC time(mono 16px)+ layer dot(red/yellow/blue 8px)
  - 右上:01/12 序号 + 中英城市名(meta 12px)
  - 背景:低饱和度自然光渐变(每城市独立)

### 板块 2 · WORLDS COLLIDE(red/yellow/blue 信息标记)

- 标题:`02 / 04 · WORLDS COLLIDE · 同时性的对撞` + `三座城市,三个尺度,同一秒`
- 副标:右侧 italic "不评价,不叙述,不消化——只是把今天这一刻并置在同一屏上。"
- 3 列对峙:
  - 苏丹喀土穆 · red · "炮弹,此刻落点"
  - 里约热内卢 · yellow · "雨季,来得更早"
  - 雷克雅未克 · blue · "极昼最后一夜"

### 板块 3 · Earth Archive(Timeline 对数刻度)

- 标题:`03 / 04 · EARTH ARCHIVE · 地球史` + `一条46 亿年的弧线`
- 副标:右侧 italic "9 个关键节点,沿对数时间轴慢慢看去。"
- 详情卡:4px earth-blue 侧栏 + HUMAN era tag + 300K 年份 + "智人出现 — Homo sapiens emerge" + 描述
- 9 节点对数刻度(flex-grow 0.4/1.2/1.4/1.6/1.7/1.9/2.2/2.4/2.8)
- active node(300K, index 7)= 黑色 scale 1.5× + 双层 glow

### 板块 4 · Live Events(MomentsTimeline A2)

- 标题:`04 / 04 · LIVE EVENTS · 此刻正在发生` + `地球上正在同时发生的事`
- 副标:右侧 italic "不是新闻流,而是此刻的切片。"
- 5 行单列:140px 时间列 + 城市 + 标题 + 11 tone tag + 经纬度
- 11 tone 沿用 v1.5 数据(色值覆盖为 A2 earth blue 系)

---

## 🔄 复用 v1.5 结构经验(不重复)

| v1.5 结构经验 | 在 A2 中如何复用 |
|---|---|
| 9 节点对数刻度(flex-grow) | 沿用,但用 A2 earth blue progress 替换 v1.5 accent-500/yellow 渐变 |
| 4px accent 侧栏(详情卡) | 沿用,但侧栏色用 `--earth-blue` 替换 v1.5 active node accent |
| Tag 11 contentType tone 系统 | 沿用,色值从 v1.5 hex 替换为 A2 earth blue 系列 |
| 板块编号报志头 `01 / 04 · 标题` | 沿用,字号/颜色按 A2 Meta Typography 12px/0.12em 调整 |

> **不重复发明的 07 目录已有内容**:5 条设计原则(刻意稀薄/情绪载体/文字一致性/视觉节奏/选中态设计)+ Visual Direction v1.5 + Visual Foundation v1.5 + Tokens v1.5 — 全部作为"已废"参考,不取色值

---

## 🔗 引用了 07 目录的哪几个文件

- `[[07-设计师设计参考/前端设计规则/Direction A2—— Visual Foundation v1.0]]` — Color / Typography / Spacing / Layout / Motion / Dark Mode 全部 token
- `[[07-设计师设计参考/前端设计规则/前端设计方向 — Direction A2]]` — 6 主关键词 + Do 8 + Don't 8 + 参照 useorigin.com
- `[[01-理念/产品理念-v1]]` — 6 核心理念(远方是感受 / 并置 / 同步 / 每天重置 / 不讨好 / 用户是被提醒者)
- `[[07-设计师设计参考/设计审美训练/设计原则/刻意稀薄]]` — Hero ≤ 5 元素
- `[[07-设计师设计参考/设计审美训练/设计原则/视觉节奏]]` — 主副字号 4:1

---

## 📦 交付物

| 文件 | 路径 |
|---|---|
| 文档 | `05-项目现状/d4-home-a2-design.md` |
| mockup desktop | `outputs/v1.5-mockups/d4-a2/home-desktop.png` (1440×900) |
| mockup mobile | `outputs/v1.5-mockups/d4-a2/home-mobile.png` (375×812) |
| HTML 源 desktop | `outputs/v1.5-mockups/d4-a2/home-desktop.html` |
| HTML 源 mobile | `outputs/v1.5-mockups/d4-a2/home-mobile.html` |

---

**字数统计**:正文 ≥ 1300 字 · 8 Do + 8 Don't 全过 · A2 5 关键词全映射 · 4 板块结构清晰
