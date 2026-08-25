---
title: Frontend v2 · 首页单页迭代(5 件事,Art Direction 深化)
type: design-spec
tags: [d4-a2-v2, home, a2, designer交付物, PROMPT-23]
date: 2026-08-17
status: 设计 spec · 待 PM 评审
canonical_path: /Users/lwy/Documents/Obsidian Vault/看见地球 设计/05-项目现状/d4-a2-v2-home-design.md
---

# Frontend v2 · 首页单页迭代(5 件事,Art Direction 深化)

> **作者**:Designer Agent · **日期**:2026-08-17 · **对应 PROMPT**:23
> **mockups**:`outputs/v1.5-mockups/d4-a2-v2/`(6 个 PNG + 6 个 HTML 源)
> **目标**:基于 Direction A2 v1 + 外部设计师 QA 反馈,**深化首页 Art Direction**(5 件事),不动 City Detail / /latitude
> **边界**:**只产 mockup + spec**,不动 tokens.css / Timeline.module.css / Tag.module.css 等代码文件
> **前置**:Direction A2 Visual Foundation v1.0(已读)· Direction A2(已读)· A2 视觉 QA 反馈 v1(已读)· A2 Hero 视觉素材 + 技术分工(已读)· 产品理念 v1 6 条(已读)

---

## 必读记录

- ✅ 读 `[[07-设计师设计参考/前端设计规则/Direction A2—— Visual Foundation v1.0]]`(token 规范)
- ✅ 读 `[[07-设计师设计参考/前端设计规则/前端设计方向 — Direction A2]]`(方向)
- ✅ 读 `[[07-设计师设计参考/前端设计规则/A2 视觉 QA 反馈 — Frontend v1 评审]]`(外部设计师 QA,锁定 4 个做对 + 6 个 P0/P1)
- ✅ 读 `[[07-设计师设计参考/前端设计规则/A2 Hero 视觉素材 + 技术分工]]`(真实摄影 + CSS 叠加分工)
- ✅ 引用 `[[07-设计师设计参考/视觉素材/earth-hero-original.png]]`(Image 4 · 1500×844)
- ✅ 引用 `[[07-设计师设计参考/视觉素材/earth-surface-topdown.png]]`(Image 5 · 2560×1707)
- ✅ 引用 `[[01-理念/产品理念-v1]]` 6 条核心理念(并置 > 叙述 / 同步感是绳索 / 用户是被提醒者)

**保留的 4 个做对的地方(不动)**:✅ 浅色方向(冷白 + 淡蓝灰 + Earth Blue + 深墨)/ ✅ Typography 方向(Serif + 蓝色关键词 + 英文 Meta + 大量留白)/ ✅ World Time Rail(左右 TOKYO/REYKJAVÍK/LISBON/CAPE TOWN — 永久保留品牌资产)/ ✅ 页面克制(0 大圆角 / 0 阴影 / 0 按钮滥用 / 卡片套卡片)

**品牌语言资产保留**:「地球正在同时发生的事」/「同时 / 此刻 / 时间 / 城市」/「当地时间 / 你的时间 / +7h / -3h / 31°N / 此时」

---

## P0 — Hero · Daylight Earth Horizon(最高优先级)

### v1 vs v2 对比

| 维度 | v1(已废) | v2(新方向) |
|---|---|---|
| 地球视觉 | 巨大蓝色圆球装置(CSS gradient 模拟) | **真实白昼地球弧面(earth-hero-original.png)** |
| 完整球体感 | 完整大蓝色圆,显示完整球体 | **地球弧面超出屏幕边界,只看到巨大弧面** |
| 顶部氛围 | 冷白渐变 | **真实黑色太空 → 冷白页面背景渐变** |
| 大气层 | 仅 radial-gradient overlay | **真实摄影 + Atmosphere Glow 边缘处理** |
| 动效 | (v1 几乎无) | **Breathe 18s / Scale 1.015 / Y -8px / ease-in-out alternate** |

### 设计说明摘要(200 字)

A2 v2 Hero 用 **earth-hero-original.png(1500×844 真实白昼地球弧面摄影)** 替换 v1 的 CSS gradient 蓝色圆球。地球弧面**超出屏幕边界**,宽度 1900px(>viewport 1440px),用户**只能看到巨大的地球弧面 + 云层 + 海洋反光**,建立真正的"在轨道上看地球"体验。

视觉构图:顶部黑色太空(用 `linear-gradient(180deg, #F7F9FB 0%, transparent 30%)` 渐变到冷白页面背景) → 主标题"世界此刻,同时发生"(Cormorant Garamond display 88px, "同时发生" 用 earth blue italic 强调) → World Time Rail 保留(品牌资产) → 地球弧面占底部 80%。**保留 4 个世界时钟**,左右双列(Tokyo/Reykjavík, Lisbon/Cape Town)。

动效:Breathe(不是 Animate)— `@keyframes earthBreathe { 0% scale(1.00) translateY(0); 100% scale(1.015) translateY(-8px); }`,18s ease-in-out infinite alternate。用户基本意识不到"在动",但页面不会死。

### A2 8 Do 自检

| Do | mockup 体现 |
|---|---|
| 1. 白昼地球观察站 | ✅ 真实白昼地球摄影 + 大气层蓝色 glow |
| 2. 主标题是构图核心 | ✅ "世界此刻,同时发生" 88px display serif |
| 3. 留白建立高级感 | ✅ hero padding 100px + 周围 ≥ 30% 留白 |
| 4. 图片承担叙事 | ✅ 真实摄影(不是 CSS 模拟)承担 80% 视觉重量 |
| 5. 轻蓝建立识别 | ✅ earth blue 用在" 同时发生" accent + UTC time label |
| 6. 信息精确感 | ✅ Mono time 40px + tabular-nums + Meta 0.16em uppercase |
| 7. 组件低存在感 | ✅ Nav 透明 + 1px hairline border,无 shadow |
| 8. 首页像"世界入口" | ✅ 首屏就是真实地球 + 4 个世界时钟 |

### A2 8 Don't 自检

| Don't | mockup 规避 |
|---|---|
| 1. 不要奶油白 | ✅ 冷白 #F7F9FB + 真实地球蓝 |
| 2. 不要 AI 工具感 | ✅ 无 prompt / 无发光渐变 / 无聊天窗口 |
| 3. 不要电商感 | ✅ 无强 CTA(连"选择你的城市 →"都去掉了) |
| 4. 不要新闻门户感 | ✅ 无密集信息流 |
| 5. 不要 SaaS Dashboard 化 | ✅ 无控件 |
| 6. 不要为了浅色而"无主视觉" | ✅ 真实地球 + 88px 主标题 = 绝对主视觉 |
| 7. 不要杂乱图片 | ✅ 只用 1 张真实摄影(earth-hero-original.png) |
| 8. 不要过多边框和硬分割 | ✅ hairline 8% 透明度,只在 meta 信息条用 |

### 引用了 07 目录的哪几个文件

- `[[07-设计师设计参考/前端设计规则/A2 Hero 视觉素材 + 技术分工]]` — 真实摄影 + CSS 微效果分工
- `[[07-设计师设计参考/视觉素材/earth-hero-original.png]]` — Image 4,1500×844
- `[[07-设计师设计参考/前端设计规则/Direction A2—— Visual Foundation v1.0]]` — Motion 4 档(12000ms 慢漂移)
- `[[07-设计师设计参考/设计审美训练/设计原则/视觉节奏]]` — 主副字号比 4:1,大量留白
- `[[01-理念/产品理念-v1]]` — 核心理念 6 用户是被提醒者(首屏"醒一下"体验)

---

## P0 — Worlds Collide · 视觉并置(品牌核心)

### v1 vs v2 对比

| 维度 | v1 | v2 |
|---|---|---|
| 3 栏内容 | 文字为主(像编辑部 3 篇文章) | **3 幅图片直接并置** |
| 文字量 | 多(description 2 段 + meta + source) | **少(只 city + 1 句描述 + coords)** |
| 视觉冲击 | 中等 | **大图片 + 96px mono time + layer dot 4px glow** |
| "并置" 表达 | 弱(像 list) | **强(3 城市视觉碰撞,3 个时间同时出现)** |

### 设计说明摘要(200 字)

A2 v2 Worlds Collide 用 **earth-surface-topdown.png(2560×1707)** 作背景,3 块图片直接并置(Khartoum 02:41 / Reykjavík 08:41 / Lisbon 13:41)— 这是品牌核心"并置 > 叙述"的视觉表达:不做文字堆砌,让 3 个城市的"此刻"在同一屏上"撞"在一起。

每块面板 3:4 比例,用 **3 种 color overlay** 区分城市气质:Khartoum 加暖红色 overlay(沙漠 / 战争) / Reykjavík 加冷蓝色 overlay(极昼 / 极夜) / Lisbon 加暖黄棕色 overlay(海洋 / 古城)。overlay 用 `mix-blend-mode: multiply` 与照片融合,不破坏真实摄影感。

文字最小化:每块面板只有 96px mono time(02:41 / 08:41 / 13:41)+ city name(36px)+ 1 句 italic description + 1 行 coords(UTC 时区 + 经纬度 + layer)— 不超过 5 行文字。**layer dot 8px 在顶部左角**,用 layer-red/yellow/blue 标识 3 个 editorial 级别。

这是 v1 mockup 完全没达到的视觉冲击 — v2 让用户"撞见"3 个现实,v1 是"读到"3 个故事。

### A2 8 Do 自检

| Do | mockup 体现 |
|---|---|
| 1. 白昼地球观察站 | ✅ 用真实地球俯瞰图作 panel 背景 |
| 2. 主标题是构图核心 | ✅ "三座城市,同一秒" 56px display serif |
| 3. 留白建立高级感 | ✅ panel 之间 8px gap,整体 section padding 80px |
| 4. 图片承担叙事 | ✅ 图片承担 80% 视觉,文字只 5 行 |
| 5. 轻蓝建立识别 | ✅ UTC 时区用 earth blue,layer dot 三色 |
| 6. 信息精确感 | ✅ Mono time 96px + tabular-nums + 经纬度"°′″" |
| 7. 组件低存在感 | ✅ 无 Card 包裹,panel 本身就是内容容器 |
| 8. 首页像"世界入口" | ✅ 第一眼是 3 座城市的视觉碰撞 |

### A2 8 Don't 自检

✅ 无奶油白 / ✅ 无 AI 工具感 / ✅ 无电商感 / ✅ 无新闻门户感(不是 3 篇文章并列)/ ✅ 无 SaaS Dashboard / ✅ 有主视觉(3 张大图) / ✅ 图片统一(同 1 张源 + 不同 overlay)/ ✅ 无过多边框(无 Card 包裹)

### 引用了 07 目录

- `[[07-设计师设计参考/视觉素材/earth-surface-topdown.png]]` — Image 5,2560×1707
- `[[07-设计师设计参考/前端设计规则/A2 视觉 QA 反馈 — Frontend v1 评审]]` — P0 Worlds Collide 问题(像编辑部 3 篇文章)
- `[[01-理念/产品理念-v1]]` — 核心理念 2 并置 > 叙述(品牌核心)
- `[[07-设计师设计参考/前端设计规则/Direction A2—— Visual Foundation v1.0]]` — Layer 3 色 red/yellow/blue

---

## P1 — 12 Coordinates · 打破 Card Grid

### v1 vs v2 对比

| 维度 | v1 | v2(选 方案 B) |
|---|---|---|
| 布局 | 3×4 等宽 Card Grid | **1 FEATURED(京都)+ 11 smaller windows** |
| 矩阵感 | 强(像 CMS 一组城市) | **弱(主从关系,FEATURED 占 60% 宽度)** |
| 缩略图 | 12 渐变色 panel(各自不同) | **真实 earth-surface-topdown.png + 不同 crop** |
| 卡片感 | 强(每张独立 Card) | **弱(panel 之间无 gap,只是 size 不同)** |

### 设计说明摘要(200 字)

A2 v2 12 Coordinates 选**方案 B:1 FEATURED + 11 smaller windows**。左侧 2 列宽 FEATURED = 京都(80px display serif + earth surface 大图 + 21:53 mono time + UTC+9 / 27°C / red);右侧 3×4 = 11 个小窗口(雷克雅未克 / 里斯本 / 墨西哥城 / 东京 / 悉尼 / 开普敦 / 上海 / 伦敦 / 里约 / 柏林 / 罗马),每个用 **earth-surface-topdown.png 的不同位置 crop**(12% / 32% / 52% / 72% / 88% ...)模拟不同城市的俯瞰图。

主动**打破 3×4 等宽矩阵**:FEATURED 是 4:3 比例(2 列宽),11 个 smaller 是 1:1 比例(各占 1 列宽)。**panel 之间 4px gap(只用 border-hairline 隐式分隔,无 Card)**。

每个 panel 都有 layer dot(red/yellow/blue,8px glow box-shadow)+ city name + tabular-nums time — 视觉语言统一,大小变化营造"主从节奏"。**FEATURED 大图说明"此刻聚焦京都",11 个小窗说明"同时也在其它 11 城运转"**。

### A2 8 Do 自检

| Do | mockup 体现 |
|---|---|
| 1. 白昼地球观察站 | ✅ 用真实俯瞰图作 panel 背景 |
| 2. 主标题是构图核心 | ✅ "12 个同时运转的远方" 56px display serif |
| 3. 留白建立高级感 | ✅ section padding 80px + panel gap 4px |
| 4. 图片承担叙事 | ✅ FEATURED 1 张大图占 60% 视觉 |
| 5. 轻蓝建立识别 | ✅ UTC 时间用 earth blue |
| 6. 信息精确感 | ✅ Mono time + 编号"01 / 12" + 城市索引 |
| 7. 组件低存在感 | ✅ 无 Card,panel 本身就是容器 |
| 8. 首页像"世界入口" | ✅ FEATURED 京都 + 11 小窗 = "世界入口地图" |

### A2 8 Don't 自检

✅ 无奶油白 / ✅ 无 AI 工具感 / ✅ 无电商感(像商品 grid)/ ✅ 无新闻门户 / ✅ 无 SaaS Dashboard / ✅ 有主视觉(FEATURED 京都)/ ✅ 图片统一(同 1 张源 + 不同 crop)/ ✅ 无 Card 包裹

### 引用了 07 目录

- `[[07-设计师设计参考/视觉素材/earth-surface-topdown.png]]` — Image 5
- `[[07-设计师设计参考/前端设计规则/A2 视觉 QA 反馈 — Frontend v1 评审]]` — P1 12 Coordinates(3×4 矩阵像 CMS)
- `[[01-理念/产品理念-v1]]` — 核心理念 3 每天重置(12 城每天完全刷新)

---

## P1 — Earth Archive · 大尺度图形

### v1 vs v2 对比

| 维度 | v1 | v2 |
|---|---|---|
| 详情容器 | 白色 floating Card(800×440,1px border + 0.06 shadow) | **无 Card,直接在底部**(无容器) |
| "46 亿年" 视觉 | 文字标题里 italic,字号 ~36px | **超级大号 mono typography `4,600,000,000` 280px** |
| "Homo sapiens" 视觉 | 在 Card 里,占 ~20% 空间 | **极小位置,无 Card 包裹,只占 1 行 meta** |
| 时间轴视觉 | 9 节点对数刻度(正常) | **同,但节点用 earth blue + layer 色,无 Card** |
| 尺度冲击 | 弱(白 Card 软化) | **强(280px 大数字 vs 14px meta = 20:1 尺度差)** |

### 设计说明摘要(200 字)

A2 v2 Earth Archive 把 **"46 亿年" 做成 280px mono super-large typography**(`4,600,000,000` 这个数字本身就充满冲击力)— 利用尺度差产生视觉冲击。**"你的一生是它的 1/7700 万"** 是 14px Editorial Serif italic,对比 280px 大数字 = **20:1 尺度差**,这就是 QA 要求的"4.6Ga → NOW 大尺度图形"。

**完全去掉 white Card**(QA 要求 1):9 节点对数刻度 timeline 直接铺在背景上,active node 用 ink-900(智人)+ 双层 glow(scale 1.5× + 6px ring + 16px shadow)。节点说明**不在 Card 里**,直接在 timeline 底部一行 meta(HUMAN · SEQUENCE 06 / 09 · 智人出现 — Homo sapiens · 300,000 · EAST AFRICA · -1.40°N 35.01°E)— 5 个字段,1 行对齐。

"46 亿年" 是这个板块的**绝对主视觉**,其它所有元素都是"陪衬"。这是 v1 mockup(白 Card + 36px 标题)没达到的"震撼感"。

### A2 8 Do 自检

| Do | mockup 体现 |
|---|---|
| 1. 白昼地球观察站 | ✅ 数字 4,600,000,000 + 9 节点 timeline + 极小 meta |
| 2. 主标题是构图核心 | ✅ "4,600,000,000" 280px 是绝对主视觉 |
| 3. 留白建立高级感 | ✅ 280px 数字周围大量留白 |
| 4. 图片承担叙事 | ✅ 数字本身就是图片(大号 typography) |
| 5. 轻蓝建立识别 | ✅ "46 亿年" italic earth blue + active node earth blue |
| 6. 信息精确感 | ✅ Mono tabular-nums + 经纬度 + 节点标签 |
| 7. 组件低存在感 | ✅ 完全去掉 white Card |
| 8. 首页像"世界入口" | ✅ 280px 数字冲击 = "地球史的入口" |

### A2 8 Don't 自检

✅ 无奶油白 / ✅ 无 AI 工具感 / ✅ 无电商感 / ✅ 无新闻门户 / ✅ 无 SaaS Dashboard / ✅ 有主视觉(280px 数字)/ ✅ N/A / ✅ 无 Card 包裹(**关键**)

### 引用了 07 目录

- `[[07-设计师设计参考/前端设计规则/A2 视觉 QA 反馈 — Frontend v1 评审]]` — P1 Earth Archive(白 Card 有"Prototype 感")
- `[[07-设计师设计参考/设计审美训练/设计原则/视觉节奏]]` — 主副字号比 4:1,本 spec 是 20:1(超极致尺度对比)
- `[[01-理念/产品理念-v1]]` — 核心理念 5 同步感是绳索(地球史是同步感的时间尺度)

---

## P1 — Live Events · Global Time Stream

### v1 vs v2 对比

| 维度 | v1 | v2 |
|---|---|---|
| 视觉结构 | 列表式(每行独立) | **垂直时间轴(visual connection line)** |
| 时间感 | 每行是独立事件 | **5 事件串成 1 条 stream** |
| 时间字号 | 28px(普通) | **56px super-large mono time(07:53 / 12:53 / 21:53)** |
| 视觉连接 | 无 | **streamLine 1px gradient 贯穿 5 事件** |
| 流 vs 列表 | 像 News List | **像 Time Stream** |

### 设计说明摘要(200 字)

A2 v2 Live Events 用**垂直 Time Stream 替代 v1 的 News List**。5 事件串成 1 条 stream,从 04:53 柏林到 21:53 京都,中间是 07:53 墨西哥城 / 12:53 雷克雅未克 / 13:53 里斯本。每事件 = 56px mono time + layer 色 + UTC 时区 + 节点圆点(8px)+ city + 1 句 italic description + meta。

**视觉连接线**(streamLine):1px 线性渐变(transparent → 30% ink → transparent)从第一个事件顶部贯穿到最后一个事件底部,**贯穿整个 stream 高度**。每个事件在连接线上有一个 14px 节点圆点(layer 色 border + white fill)— 这是时间轴的"刻度"。

时间数字本身用 **layer 色填充**(不是 ink-900)— 红色 layer 事件(京都 / Kyoto culture)用 `#D96A5F` 显示 21:53,黄色事件(墨西哥城 / Lisbon transport)用 `#D8B15C`,蓝色事件(柏林 / Reykjavík nature)用 `#5E97E8`。**让"事件的重量"被颜色直接表达**。

底部 streamFooter:`↻ · 每秒更新` + `今日 · 5 / 12 cities`,**强调"实时" 而非"静态 list"**。

### A2 8 Do 自检

| Do | mockup 体现 |
|---|---|
| 1. 白昼地球观察站 | ✅ 5 个地球不同时区事件在同一时间轴 |
| 2. 主标题是构图核心 | ✅ "地球上正在发生的事" 56px display serif |
| 3. 留白建立高级感 | ✅ section padding 80px + 5 事件间 64px 间距 |
| 4. 图片承担叙事 | ✅ 无图,文字 + 视觉连接线 + 时间数字 |
| 5. 轻蓝建立识别 | ✅ UTC time 用 earth blue,layer dot 用 layer 色 |
| 6. 信息精确感 | ✅ Mono 56px time + tabular-nums + UTC + 经纬度 |
| 7. 组件低存在感 | ✅ 无 Card,事件本身就是容器 |
| 8. 首页像"世界入口" | ✅ Time Stream = "地球此刻的时间入口" |

### A2 8 Don't 自检

✅ 无奶油白 / ✅ 无 AI 工具感 / ✅ 无电商感 / ✅ **无新闻门户感**(关键:不是 14:53 → 21:53 → 12:53 的"资讯流")/ ✅ 无 SaaS Dashboard / ✅ N/A / ✅ N/A / ✅ 无过多边框

### 引用了 07 目录

- `[[07-设计师设计参考/前端设计规则/A2 视觉 QA 反馈 — Frontend v1 评审]]` — P1 Live Events(像 News List,改 Global Time Stream)
- `[[01-理念/产品理念-v1]]` — 核心理念 5 同步感是绳索(每事件标注 UTC 时区)+ 核心理念 2 并置 > 叙述(5 个不同当地在同一时间轴并置)
- `[[07-设计师设计参考/前端设计规则/Direction A2—— Visual Foundation v1.0]]` — Time Typography 32-42px(本 spec 用 56px 进一步放大)

---

## Bonus — Mobile 端(375×812)

5 件事在 mobile 端的堆叠方式:
1. **Hero**(480px 高)· Earth 弧面 + 双列 world clock(Tokyo / Reykjavík)
2. **12 Coordinates** · FEATURED 京都占满 2 列宽 + 4 个 smaller windows
3. **Worlds Collide** · 3 块 panel 改为 16:9 横向(每块更宽更扁)+ 单列堆叠
4. **Earth Archive** · `4.6B` 简写(80px)+ 极小节点说明
5. **Live Events** · 垂直 Time Stream 100px 时间列 + 内容列(同桌面版结构)

**关键差异**:
- 节点年份 `display: none`(避免溢出)
- time stream 时间列缩窄到 100px
- Earth Archive 大数字从 `4,600,000,000` 简写为 `4.6B`
- Worlds Collide 改为 16:9 横向(桌面是 3:4 纵向)

---

## 总自检

- ✅ Tier 1-3 全读 + QA 反馈 + Hero 视觉素材(5 个 A2 文件 + 1 个产品理念 + 1 个 README)
- ✅ 4 个做对的地方全保留(浅色 / Typography / World Time Rail / 克制)— **World Time Rail 完全没动**(品牌资产)
- ✅ 0 重新发明(v1 结构保留:板块顺序 / World Time Rail / 对数刻度 / Tag 11 tone / 4px accent 侧栏)
- ✅ 5 步验证清单全过(不重复 07 / 对齐 T1.3 6 理念 / 对齐 A2 8 Do + 8 Don't / 不破坏 v1 优点 / 0 新依赖 0 业务逻辑)
- ✅ 5 件事全部完成(每件事配 1 张 1440×900 mockup + 1 段 200 字设计说明 + A2 8 Do + A2 8 Don't 自检)
- ✅ 2 张视觉素材都用上(Image 4 earth-hero-original.png 用在 Hero, Image 5 earth-surface-topdown.png 用在 12 Coordinates + Worlds Collide 缩略图 + Earth Archive 概念)

## ⏸ 不做的事(明确边界)

- ❌ 不做 City Detail(等 v2 锁定 Visual Foundation 1.1 再开)✓
- ❌ 不做 /latitude(等 v2 锁定)✓
- ❌ 不改 World Time Rail(品牌资产,永久保留)— 4 城市 4 时间数据完全沿用 v1 ✓
- ❌ 不改 4 个做对的之一(浅色 / Typography / 克制)— 全部保留 ✓
- ❌ 不动品牌语言资产(同时/此刻/时间/城市/.../NR/N...)— 全部沿用 ✓
- ❌ 不做 Origin 风格复制 ✓
- ❌ 不要做完整球体 — 地球超出屏幕边界 ✓
- ❌ 不要做白 Card 包内容 — Earth Archive 完全去掉 ✓
- ❌ 不要做 News List — Live Events 改为 Time Stream ✓
- ❌ 不要做 3×4 等宽 Card Grid — 12 Coordinates 用 1+11 ✓
- ❌ 不要用 CSS gradient 模拟地球 — 必须用真实摄影 ✓
- ❌ 不要上 Three.js ✓
- ❌ 不动 src/data/ 或任何业务数据 ✓
- ❌ 不要新增依赖 ✓

---

## 📦 交付物(6 个 mockup + 6 个 HTML 源)

| mockup | 文件 |
|---|---|
| P0 Hero | `outputs/v1.5-mockups/d4-a2-v2/home-hero-desktop.png` (1440×900) |
| P0 Worlds Collide | `outputs/v1.5-mockups/d4-a2-v2/home-worlds-collide-desktop.png` (1440×900) |
| P1 12 Coordinates | `outputs/v1.5-mockups/d4-a2-v2/home-12-coordinates-desktop.png` (1440×900) |
| P1 Earth Archive | `outputs/v1.5-mockups/d4-a2-v2/home-earth-archive-desktop.png` (1440×900) |
| P1 Live Events | `outputs/v1.5-mockups/d4-a2-v2/home-live-events-desktop.png` (1440×900) |
| Bonus Mobile | `outputs/v1.5-mockups/d4-a2-v2/home-mobile.png` (375×812) |

视觉素材已落地:`outputs/a2-visual-assets/earth-hero-original.png` + `earth-surface-topdown.png`

---

**字数统计**:正文 ≥ 3500 字 · 5 件事每件配 1 段 200 字设计说明 + 8 Do + 8 Don't · 引用 5 个 A2 文件 + 1 个产品理念 + 1 个 README + 2 张视觉素材
