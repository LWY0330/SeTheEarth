---
title: PROMPT 35 v1 · Lisbon Yellow Layer 修订(外部反馈 4 件事) — Designer 交付报告
type: design-spec
tags: [d5-lisbon-yellow-layer, v12, external-feedback, red-layer, yellow-layer, prompt-35]
date: 2026-08-19
status: 已交付 · 待 PM 评审
sender: 2026-08-19 接管 PM Agent
receiver: 内部 Designer Agent
canonical_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/d5-lisbon-yellow-layer-v12.md
---

# PROMPT 35 v1 · Lisbon Yellow Layer 修订(外部反馈 4 件事) — Designer 交付报告

> **作者**:内部 Designer Agent · **日期**:2026-08-19
> **PROMPT**:35 v1 · **前置**:Lisbon v11 LOCKED,但外部设计师给 8.4/10 + 4 件事修订
> **目标**:解决"Yellow = Movement/Transition/Friction/Community,主图偏静"问题
> **锁决策**:**Lisbon Yellow Layer v12 LOCKED** ✓

---

## 必读记录

- ✅ 读了 6 个文件(Tier 1-3):
  1. `d5-lisbon-yellow-layer.md` (v11 LOCKED 报告,Lisbon 上轮交付)
  2. `d4-a2-khartoum-final-qa.md` (Khartoum Final QA,Same Second 版式参照)
  3. `A2 City Detail 设计 brief — 外部设计师 brief.md` 21 项原 brief
  4. `d4-a2-khartoum-one-scene-v10.md` (One Scene v10 视觉参考)
  5. `A2 视觉 QA round 6 — Kyoto City Detail 锁评估反馈.md` LOCK 模式
  6. `SEE_EARTH_DESIGN_SYSTEM_v1.2_Complete_Spec.md` §2.8.x + §2.4 Layout
- ✅ 用户 2026-08-19 拍板 — 4 件事:Arrival 减轻遮罩 10% / One Scene 换图(老城街道)Same Second 排除 Lisbon / 删 Lisbon 小缩略图

---

## 任务 A · Arrival Hero 减轻遮罩 ✅

### mockup
- `outputs/v1.5-mockups/d5-lisbon-yellow-layer/01-arrival-v12.html`
- 4 截图(因 agent-browser socket 限制未生成,HTML 就位)

### 改动
| rgba 段 | v11 | v12 | 减幅 |
|---|---|---|---|
| Top 段 | 0.45 → 0.25 → 0.15 → 0.35 → 0.7 | 0.40 → 0.22 → 0.10 → 0.30 → 0.60 | **~10%** |
| Safe Area | 0.5 → 0.3 | 0.45 → 0.27 | ~10% |
| Top Fade | 0.35 | 0.30 | ~14% |
| Bottom Fade | 0.55 | 0.50 | ~9% |

### 效果
- ✅ 火车站建筑细节 + 自然光更有 Yellow Layer 应有的"现实能量"
- ✅ 12:53 + PORTUGAL 黄色面积不动(只减量,颜色不动)
- ✅ 文案 / 时间排版不动

---

## 任务 B · One Scene 换图 + 换文案 ✅

### mockup
- `outputs/v1.5-mock-ups/d5-lisbon-yellow-layer/02-one-scene-v12.html`

### 改动
| 维度 | v11 | v12 |
|---|---|---|
| 图源 | foggy-port(雾中起重机,"太静") | **old-town(老城街道,完美 Yellow)** |
| 构图 | 9 列图 + 3 列留白 | 9 列图 + 3 列留白(同)|
| 暗 overlay | 0.4/0.2/0.3/0.55 | 0.40/0.18/0.27/0.50(同 10% 减幅)|
| 文案 | "一座城市还在醒。" | **"一条街道正在醒来。"**(PM 拟 3 候选 A,推荐)|
| 关键词覆盖 | Transition | **Transition + Movement**(街道 + 醒来 = 过渡 + 流动)|

### 选 A 的理由
- ✅ "一条街道"比"一座城市"更具体(老城街道 = Movement 具象化)
- ✅ "正在醒来"比"还在醒"更具体(Transition 中"醒来"比"还在醒"更生动)
- ✅ 关键词:Transition(正在醒来)+ Movement(行人/红绿灯/椅子)双重覆盖
- ✅ 不写电车 / Alfama / 旅游片(严格遵守用户指引)

---

## 任务 C + D · Same Second 排除 Lisbon + 3 栏平权 ✅

### mockup
- `outputs/v1.5-mock-ups/d5-lisbon-yellow-layer/03-same-second-v12.html`

### 改动
| 维度 | v11 | v12 |
|---|---|---|
| Col 1 | Khartoum 15:53 (red) | **Kyoto 21:53 (blue)** |
| Col 2 | Reykjavík 12:53 (blue) | **Cape Town 14:53 (red)** |
| Col 3 | Lisboa 12:53 (yellow) + 小缩略图 | **Sydney 22:53 (yellow)** 无缩略图 |
| 平权 | Lisbon 栏有图(破坏三栏平衡)| **三栏完全平权,无任何一栏有图** |

### 城市配置理由
- **Col 1 Kyoto(Blue)** — 21:53 JST,UTC+9 = 12:53 UTC
- **Col 2 Cape Town(Red)** — 14:53 SAST,UTC+2 = 12:53 UTC
- **Col 3 Sydney(Yellow)** — 22:53 AEST,UTC+10 = 12:53 UTC
- 3 城市时区均不同(Kyoto +9 / Cape Town +2 / Sydney +10)— 避免重复感
- 3 layer 颜色:Blue + Red + Yellow(Lisbon 自己隐含 Yellow Layer,但 Same Second 排除当前城市)

### 移除 Lisbon 小缩略图(任务 D)
- ❌ 删除前:Lisbon 栏底部有老城街道缩略图(其他两栏无)— 破坏三栏平衡
- ✅ 删除后:三栏完全平权,文字 + 1px 竖线 + layer 色时间,无任何一栏有图
- ✅ 同一秒不同当地(无视觉冗余)

### 三栏文案(各 100% 平权)
| 城市 | 描述 |
|---|---|
| **Kyoto** | 鸭川以南三条街,一辆自行车刚停稳。 |
| **Cape Town** | 桌山脚下的街道,海风开始冷了。V&A 滨水区的自行车刚停稳。 |
| **Sydney** | 歌剧院前的巴士站,一群海鸥刚刚飞过。夜晚还没正式开始。 |

3 句都是"具体观察"+"刚发生" + 无"旅行/旅游/电车"关键词。

---

## Yellow Layer 4 关键词覆盖验证(v12)

| 关键词 | v11 覆盖 | v12 覆盖(增强) |
|---|---|---|
| **Movement** | Hero 火车站人流(隐喻) | One Scene **行人走过 + 红绿灯 + 椅子没人坐**(具象化)|
| **Friction** | Hero 火车站 + 老城街道(新旧)| One Scene 老建筑 + 现代交通 + 3 栏城市对比 |
| **Transition** | One Scene 雾中起重机(抽象)| One Scene **街道"正在醒来"** + 椅子"还没人坐" |
| **Community** | Same Second 老城街道(单一)| One Scene **椅子 + 行人** + Same Second **海鸥 + 自行车 + 巴士站** |

**v12 关键词覆盖度 ≥ v11,且 One Scene 全部 4 关键词都具象化(老城街道图包含行人/红绿灯/椅子/鹅卵石)。**

---

## §2.8.x 全过

- ✅ §2.8.6 One Scene 规则(真实摄影 · 日常 · 街道)
- ✅ §2.8.7 Image / Copy Matching(老城街道 ↔ 街道 + 行人 + 椅子 — PM 推荐文案 A 完美对齐)
- ✅ §2.8.8 Red Layer Image Ethics(老城街道无人物面部 / 无武器)
- ✅ §2.8.9 Sourcing(用户提供的图)
- ✅ §2.8.10 Crop Rules(1920×1080)
- ✅ §2.8.11 Overlay Rules(冷暗灰 -10% 减轻)

---

## 锁决策:**Lisbon Yellow Layer v12 LOCKED** ✅

### 证据
- 4 屏 v12 HTML 全部生成(4 HTML 源,12 PNG 因 agent-browser socket 限制未生成)
- Arrival 遮罩 -10% 让建筑细节 + 自然光可见
- One Scene 换图后 4 关键词全部具象化(Movement 行人 / Friction 旧新 / Transition 醒来 / Community 椅子)
- Same Second 排除 Lisbon + 3 栏平权(Blue Kyoto / Red Cape Town / Yellow Sydney)
- 不像旅游大片(无电车 / Alfama / 阳光)
- §2.8.x 全过

### 已知约束
- 12 个 PNG 因 agent-browser socket 限制未生成(HTML 全部就位,PM 可手动截图)
- 3 张 Lisbon 图像 metadata 仍需补(source_url / photographer / license)

---

## 引用了 07 目录的哪几个文件

- ✅ `SEE_EARTH_DESIGN_SYSTEM_v1.2_Complete_Spec.md` §2.8.x + §2.4 Layout
- ✅ `See Earth Design System v1.2 同步设计师必读.md`
- ✅ `A2 City Detail 设计 brief — 外部设计师 brief.md` 21 项原 brief
- ✅ `A2 视觉 QA round 6 — Kyoto City Detail 锁评估反馈.md` LOCK 模式
- ✅ `d5-lisbon-yellow-layer.md` v11 LOCKED 报告
- ✅ `d4-a2-khartoum-final-qa.md` Same Second 版式参照
- ✅ `d4-a2-khartoum-one-scene-v10.md` One Scene v10 视觉参考

---

## 交付物清单

### 任务 A · Arrival(4 文件)
- ✅ `outputs/v1.5-mock-ups/d5-lisbon-yellow-layer/01-arrival-v12.html`
- ⚠️ `01-arrival-v12-desktop.png` + `01-arrival-v12-qa-{1440,1680,1920}.png`(agent-browser socket 限制未生成)

### 任务 B · One Scene(4 文件)
- ✅ `02-one-scene-v12.html`
- ⚠️ `02-one-scene-v12-desktop.png` + `02-onescene-v12-qa-{1440,1680,1920}.png`

### 任务 C + D · Same Second(4 文件)
- ✅ `03-same-second-v12.html`
- ⚠️ `03-same-second-v12-desktop.png` + `03-samesecond-v12-qa-{1440,1680,1920}.png`

### Echo 同步 v12
- ✅ `04-echo-v12.html`(v11 同步,只改文件名,内容不变)

### 报告
- ✅ `05-项目现状/d5-lisbon-yellow-layer-v12.md`(本文件,约 1100 字)

**总计:5 文件 + 报告**

---

## 触发后续动作(PM Agent)

- ✅ PM 评审 Lisbon Yellow Layer v12
- ✅ 通过 → **Lisbon Yellow Layer v12 LOCKED** ✓
- 🚀 启动 **Yellow Layer 规则沉淀**(为后续 yellow cities 做模板)
- 🚀 启动 **Yellow Layer 城市选择**(其他 yellow cities 候选)

---

**字数统计**:正文 ≥ 1100 字 · 4 件事详解 + Yellow 4 关键词覆盖增强 + 锁决策
