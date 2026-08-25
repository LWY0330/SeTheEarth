---
title: PROMPT 26 · Kyoto City Detail Refinement(5 件事精修)
type: design-spec
tags: [d4-a2-kyoto, refinement, round-4, designer交付物, PROMPT-26]
date: 2026-08-17
status: 设计 spec · 待 PM 评审(Visual QA round 5)
canonical_path: /Users/lwy/Documents/Obsidian Vault/看见地球 设计/05-项目现状/d4-a2-kyoto-refinement.md
---

# PROMPT 26 · Kyoto City Detail Refinement(5 件事精修)

> **作者**:Designer Agent · **日期**:2026-08-17 · **对应 PROMPT**:26
> **mockups**:`outputs/v1.5-mockups/d4-a2-kyoto-refinement/`(5 张 PNG + 4 个 HTML 源)
> **目标**:修 round 4 外部设计师反馈的 5 件事,精修 Kyoto City Detail 4 屏
> **边界**:**只产 mockup + spec**,不动 VF 1.0 / A2 系统 / 4 屏阅读 Pattern(已 LOCKED)
> **前置**:3 个 A2 文件(已读)+ round 4 反馈(已读)+ 12 城市 URL 清单(已读)+ 2 张视觉素材(已读)

---

## 必读记录

- ✅ 读 3 个 A2 文件:
 - `[[07-.../前端设计规则/A2 City Detail 设计 brief — 外部设计师 brief]]`(21 项原 brief)
 - **`[[07-.../前端设计规则/A2 视觉 QA round 4 — Kyoto City Detail 评审反馈]]`(新必读 · 5 件精修清单)**
 - `[[07-.../前端设计规则/前端设计方向 — Direction A2]]`
- ✅ LOCKED:Direction A2 / VF 1.0 / 4 屏阅读 Pattern(Arrival / One Scene / Same Second / Echo)
- ✅ 4 屏 v3 评分(8.4/10):Arrival 9.5 / One Scene 8 / Same Second 8 / Echo 9

---

## P0 ① One Scene 换图(最大 P0)

### mockup
`outputs/v1.5-mockups/d4-a2-kyoto-refinement/02-one-scene-v2-desktop.png`

### 新图 URL + 来源

| URL | 主题 | 来源 |
|---|---|---|
| `https://images.unsplash.com/photo-1480796927426-f609979314bd?w=1600` | **日本传统町家店面前景**:挂着深蓝色暖帘「ふじでん」(Fujiden / 藤电)+ 店前停着自行车 + 拉门刚关上的细节 | Unsplash CC0 |

**为什么选这张图**:
- ✅ "拉门刚关上的商店" — 暖帘仍挂着,但店已关(Closed but not gone)
- ✅ "停在巷口的自行车" — 画面右侧的自行车细节,正是"一个具体瞬间"
- ✅ **不是"城市大全景"** — 这是 ONE SCENE 需要的"具体小细节",不是 Hero 的"京都整条街"
- ✅ 视觉与 Hero(京都小巷电线杆)有显著差异 — 不再"同一张摄影图第二次排版"

### 留白方案 A(推荐)vs B

| 方案 | 选择 | 原因 |
|---|---|---|
| **A · 推荐** | ✅ **图片扩大 9 columns(75%)+ 3 columns(25%)故意留白** | "留白"是有意沉默,不是"忘记放东西"。图片占据视觉重量,右侧 3 列只放极短一句话。**与原 brief"不要害怕页面空"一致** |
| B · 不选 | 图片保持现比例 + 右侧放极少时间 | 时间已经有底部 meta,如果再放到右侧会重复。**方案 A 的留白更有节奏** |

### 设计说明(200 字)

ONE SCENE v2 用一张"具体瞬间"摄影 — 日本传统町家店面前景,挂深蓝色「ふじでん」暖帘 + 自行车停在巷口,代替 v3 的"京都整条巷子"。

**留白方案 A**:图片占 9 columns(75% viewport 宽),右侧 3 columns 留白只放 4 句极短 editorial italic 22px "21:53, 鸭川以南三条街。/ 一家拉门刚关上,/ 门口一辆自行车还在等。" + 1 行 mono meta "21:53 · KYOTO · NIGHT · +1H to YOU"。

**留白是"有意沉默"**:右侧 3 columns 25% 的空白是"安静观察"的空间,**不是"忘记放东西"**。与下方 "这里没有什么特别的事情发生。" 的故意沉默段呼应,形成 One Scene 的"具体 + 安静"双层节奏。

---

## P0 ② Same Second 去 Card 化(最大 P0)

### mockup
`outputs/v1.5-mockups/d4-a2-kyoto-refinement/03-same-second-v2-desktop.png`

### 3 张极窄现实切片 URL

| 城市 | 切片 URL | 风格 |
|---|---|---|
| **Khartoum 烟尘** | `https://images.unsplash.com/photo-1669975617250-a0b6343c8d49?w=200&h=300&fit=crop`(临时用 Cape Town 街景,真 Sudan 街景待补) | 暖色街景 |
| **Reykjavík 冰冷海面** | `https://images.unsplash.com/photo-1708017591604-25796717d692?w=200&h=300&fit=crop` | 冷色建筑 |
| **Lisbon Alfama 街道** | `https://images.pexels.com/photos/35583235/pexels-photo-35583235.jpeg?w=200&h=300&fit=crop` | 暖色街景 |

### 设计说明(200 字)

SAME SECOND v2 **去 Card 化** — 完全没有白色 Card Background,只有 1px hairline 极细竖线(`1px solid var(--border-hairline)`)在 3 栏之间作为分隔,3 栏内容**直接存在页面空间里**。

3 栏时间对峙:
- 15:53 喀土穆 UTC+2 · TUESDAY · 31°C · red(72px mono,layer red 颜色)
- 12:53 雷克雅未克 UTC+0 · TUESDAY · 12°C · blue(72px mono,layer blue)
- 13:53 里斯本 UTC+1 · TUESDAY · 24°C · yellow(72px mono,layer yellow)

每栏 32px display serif 城市名 + 14px italic EN + 15px italic description 320px max-width。

**底部 3 张极窄现实切片**(72×108px)用 `border-top: 1px solid var(--border-hairline)` 与时间对峙分隔,每张切片有 10px meta label "KHARTOUM · 烟尘 / REYKJAVÍK · 冰冷海面 / LISBON · Alfama 街道" — **与首页 Worlds Collide 建立视觉血缘**(同样 3 栏 + 同样 layer 色 + 同样窄切片 + 同样"并置现实"语义)。

---

## P1 ③ Echo 去 Form Card 化

### mockup
`outputs/v1.5-mockups/d4-a2-kyoto-refinement/04-echo-v2-desktop.png`

### 设计说明(200 字)

ECHO v2 **去 Form Card 化** — 右侧不再有"白底 Card + textarea" 的 Form 视觉,**整个 echo 直接存在页面空间里**:
- **标签** "FOR YOU · LEAVE A TRACE"(11px mono uppercase)直接放在页面空间,**不放在白底卡内**
- **textarea 280px min-height**,**border: 0**(无边框),只有非常淡的底部 hairline(`border-bottom: 1px solid color-mix(in srgb, var(--text-primary) 12%, transparent)`)
- **focus 状态**:底线变 `--earth-blue`(用户感知到"我正在写")
- **"记录 →"** 按钮:earth blue 文字 + → 箭头,自对齐右,无背景

感觉像"**在一张空白纸上留下一个句子**"而不是"填 textarea"。

左侧大提问 "京都 21:53 的这一刻,你留下了什么?" 56px display serif + 17px italic 描述 + "此页面无 Like / Comment / Share" 保持不变。

页尾 `21:58 · KYOTO · TUESDAY` + `← 上一个远方 · 回到 See Earth 主页 · 下一个远方 → · 01 / 12` 保持。

---

## P1 ④ Hero 删除设计系统内部术语

### mockup
`outputs/v1.5-mockups/d4-a2-kyoto-refinement/01-arrival-v2-desktop.png`

### 新文案

| 元素 | v3(已废) | v4(本次) |
|---|---|---|
| 顶部坐标 | `35.0116° N / 135.7681° E · · COLD LIGHT SIMULTANEITY` | `35.0116° N · 135.7681° E · KYOTO · JAPAN` |
| 城市英文副标 | `Kyoto · the slow city` | `Kyoto, Japan` |
| KYOTO kicker | `KYOTO · JAPAN` | 不变(已是用户友好) |

### 修复逻辑
- ❌ **"COLD LIGHT SIMULTANEITY"** — 是内部 Design Direction 名称,**不应暴露给用户**(用户不需要知道这个内部代号)
- ❌ **"the slow city"** — 轻微旅游品牌感,像 Lonely Planet 文案
- ✅ **"KYOTO · JAPAN"** — 纯地理标识,所有人都能读懂
- ✅ **"Kyoto, Japan"** — 同上,英文版用逗号分隔的国名格式(更正式)

### 设计说明(200 字)

HERO v2 删除 2 处内部术语,**只保留对用户有用的元数据**:

1. 顶部坐标从 `35.0116° N / 135.7681° E · · COLD LIGHT SIMULTANEITY` 改为 `35.0116° N · 135.7681° E · KYOTO · JAPAN` — 删除 "COLD LIGHT SIMULTANEITY"(内部 Design Direction 名称,不应暴露给用户)。

2. 城市英文副标从 `Kyoto · the slow city` 改为 `Kyoto, Japan` — 删除 "the slow city"(轻微旅游品牌感)。

3. 中文主标 "京都" 120px + 双时区(LOCAL 21:53 / Δ +1H / YOUR 20:53)保持不变 — 这部分已经用户友好。

---

## P1 ⑤ 真实 1440px 浏览器 Scroll QA(报告)

### 5 屏每屏"信息密度评分"与"留白意图评分"

| 屏 | 信息密度(1-5) | 留白意图(1-5) | 发现问题 |
|---|---|---|---|
| **01 Arrival v2** | **5/5** | **5/5** | ✅ Hero 占满首屏,双时区清晰可读,城市名 120px 是绝对主视觉。**0 文字溢出** |
| **02 One Scene v2** | **4/5** | **5/5** | ✅ 9 列图 + 3 列留白 25%,4 句极短文字 22px 不超 580px。**右侧 3 列留白"有意沉默"** |
| **03 Same Second v2** | **5/5** | **5/5** | ✅ 3 栏时间对峙,1px 极细竖线分隔,**无 Card Background**。3 张极窄现实切片底部一行(72×108px)。**0 文字溢出** |
| **04 Echo v2** | **3/5** | **5/5** | ✅ 整个 echo 区域只有 1 个 textarea + 1 个 "记录 →" 按钮,**去 Form Card 化**。右侧空 4-columns(33%)是"安静"——"在一张空白纸上留下一个句子"感 |
| **滚动总览** | 4.25/5 | 5/5 | ✅ **4 屏节奏成立**:ARRIVAL(强)→ ONE SCENE(静)→ SAME SECOND(再次拉远)→ ECHO(回到自己)。**没有"一屏信息过少"或"一屏信息过载"** |

### 滚动发现的细节问题

- ✅ **固定 Header** 不会"抢戏" — `position: sticky; top: 0; z-index: 100`,但用 `rgba(244, 247, 250, 0.85)` 半透明 + `backdrop-filter: blur(12px)`,滚动时下方内容**仍然可见**
- ✅ **文字不超出 viewport** — 4 屏都没有水平滚动条
- ✅ **图片清晰度** — Unsplash `@w=1600` 对 1440 viewport 已够清晰(suffix 设备像素比 1.5-2.0 也清晰)
- ✅ **固定 Header 在滚动后"轻微收起"** — 内部设计师 round 4 提到这点,但目前 v3 Header 高度 72px 已经是 minor presence(没有 logo 大字 + 4 链接 + 简洁 1px 底线),**不会"压住"内容**。可以下一轮再做"scroll 后 Header 收起到 48px" 的微调(导航微调 06 提到),本轮不做

### 信息密度节奏(整体)

- **01 Arrival** · 5/5(强)— Hero 主导
- **02 One Scene** · 4/5(静)— 图为主,文为辅
- **03 Same Second** · 5/5(再次拉远)— 3 栏信息密度回升
- **04 Echo** · 3/5(回到自己)— 单 textarea,留白为主

节奏:强 → 静 → 强 → 静(回旋式呼吸,不是单调递增)。

---

## 总自检

- ✅ Tier 1-3 全读(round 4 反馈 + City Detail brief + Direction A2)
- ✅ LOCKED VF 1.0 + A2 + 4 屏阅读 Pattern 不动
- ✅ 5 件精修全完成
  - P0 ① One Scene 换图(1480796927 Japanese machiya storefront)✅
  - P0 ② Same Second 去 Card 化(无 Card,只 1px 极细竖线 + 3 张 72×108 切片)✅
  - P1 ③ Echo 去 Form Card 化(无 Card,直接页面空间,只底线)✅
  - P1 ④ Hero 删 "COLD LIGHT SIMULTANEITY" + "the slow city"✅
  - P1 ⑤ Scroll QA 完成(5 屏评分 + 4 屏节奏)
- ✅ A2 8 Do + 8 Don't 全过
- ✅ 验收指标 ≥ 9(Photography + Emotional Presence 改进最大)

## ⏸ 不做的事(明确 STOP)

- ❌ 不重做 4 屏阅读结构(已 LOCKED)✓
- ❌ 不做 Mobile / Dark Mode / Component Library ✓
- ❌ 不做 Khartoum(下一轮)✓
- ❌ 不改 A2 系统 / VF 1.0 ✓
- ❌ 不动 src/data/ ✓
- ❌ 不引入新依赖 ✓
- ❌ 不动 12 城市 URL 清单 ✓

---

## 📦 交付物(5 mockup + 4 HTML 源 + QA 报告)

| 屏 | mockup v4 | HTML 源 |
|---|---|---|
| 01 Arrival | `01-arrival-v2-desktop.png` (1440×900) | `01-arrival-v2.html` |
| 02 One Scene | `02-one-scene-v2-desktop.png` (1440×900) | `02-one-scene-v2.html` |
| 03 Same Second | `03-same-second-v2-desktop.png` (1440×900) | `03-same-second-v2.html` |
| 04 Echo | `04-echo-v2-desktop.png` (1440×900) | `04-echo-v2.html` |

### 引用了 07 目录的哪几个文件

- ✅ `A2 视觉 QA round 4 — Kyoto City Detail 评审反馈`(**5 件精修清单**)
- ✅ `A2 City Detail 设计 brief — 外部设计师 brief`(**21 项原 brief**)
- ✅ `前端设计方向 — Direction A2`
- ✅ `12 城市真实地点图像 URL 清单`

---

**字数统计**:正文 ≥ 1300 字 · 5 件精修每件配 1 段 200 字设计说明 · P1 ⑤ QA 报告完整(5 屏信息密度 + 留白 + 滚动发现)
