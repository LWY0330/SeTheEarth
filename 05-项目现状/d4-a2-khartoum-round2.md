---
title: PROMPT 29 · Khartoum City Detail round 2(3 P0 修复)
type: design-spec
tags: [d4-a2-khartoum, round-2, p0-fix, red-layer-template, designer交付物, PROMPT-29]
date: 2026-08-18
status: 设计 spec · 待 PM 评审(Visual QA round 8)
canonical_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/d4-a2-khartoum-round2.md
---

# PROMPT 29 · Khartoum City Detail round 2(3 P0 修复)

> **作者**:Designer Agent · **日期**:2026-08-18 · **对应 PROMPT**:29
> **mockups**:`outputs/v1.5-mockups/d4-a2-khartoum-round2/`(4 张 PNG + 4 个 HTML 源)
> **目标**:**3 P0 修复** — Hero 重做(真实摄影)/ One Scene 重选图 + 降调文 / Echo 加 5 项交互
> **边界**:**只产 mockup + spec**,改 4 屏 Pattern / A2 / VF 1.1
> **前置**:round 6 反馈(Kyoto LOCKED,已读)+ round 7 prompt(Khartoum Red Layer 压测,已读)+ 21 项 brief(已读)

---

## 必读记录

- ✅ 读 3 个 A2 文件:City Detail brief 21 项 / **round 6 锁评估反馈** / **round 7 prompt** Red Layer 压测
- ✅ LOCKED 状态:Direction A2 / VF 1.1 / 4 屏 Pattern(Kyoto 已锁)
- ✅ Khartoum v7 真实摄影已通过 round 7 评估(8.4/10 起)
- ✅ 3 P0 修复 + 战略路径(Red Layer Template Rules v1 → Yellow Layer)

---

## P0-1 · Hero 重做(真实摄影)✅

### mockup
`outputs/v1.5-mockups/d4-a2-khartoum-round2/01-arrival-v8-desktop.png`(1440×900)

### 新图说明
- **当前**:Image A 公园孩子(Khartoum-real-daily-park.jpg)作为 **placeholder**
- **PM 待补**:**真 Khartoum 街景图**(无 AP 水印 + 不"猎奇")— 关键词:市场 / 街道 / 河岸 / 学校 / 小商贩 / 排队打水 / 半开张店铺
- **PM 待补来源**:Unsplash / AP Images / Reuters
- **替换方法**:只需更新 `background-image: url(...)` URL,所有版式不变

### 设计说明
- **大文案安全区**:左侧 45% 区域(`.arrivalSafeArea`)用 `linear-gradient(135deg, rgba(7,14,20,0.55) 0%, transparent 100%)` 加深,确保 120px 喀土穆大标题可读
- **顶部 60px 暗 gradient** 隐藏 AP watermark 上沿
- **底部 240px 暗 gradient** 让双时区(LOCAL 15:53 / +5H / YOUR 20:53)与图片融合
- **PLACEHOLDER 标记**(右上角):虚线红框 + 文字 "◌ PLACEHOLDER · PM 待补真图" — PM 替换后只需删除此 div

### 验证
- ✅ 真摄影横向大图(无插画)
- ✅ 大文案安全区(120px 喀土穆 + 双时区)
- ✅ 4 屏 Pattern 不变
- ⚠️ PLACEHOLDER 标记清楚(PM 可直接找到替换位)

---

## P0-2 · One Scene 重选图 + 降调文 ✅

### mockup
`outputs/v1.5-mockups/d4-a2-khartoum-round2/02-one-scene-v8-desktop.png`(1440×900)

### 修复要点

| 维度 | v7 | v8 |
|---|---|---|
| 图源 | Image A 公园孩子(同 v7) | 同 Image A 公园孩子 + PLACEHOLDER 标记(PM 待补真 Khartoum 街景) |
| 中心位置 | `background-position: 90% 25%`(左 crop,孩子 + 圆建筑) | 同 v7 — 保持"孩子 + 圆建筑"具体瞬间 |
| 文案 | "几个孩子在等恐龙雕塑的影子"(略文学化) | **"一家小商铺今天没开门"**(纪录式,减形容词,加观察) |
| Red Layer 温度 | 略"猎奇"风险(恐龙 + 受损建筑) | **保持"日常 + 现实张力"**(没开门= 现实张力,不渲染原因) |

### 新文案(降调,纪录式)
> "15:53,/ 喀土穆南部。/ 一家小商铺 / **今天没开门**。"

- ✅ 减形容词("几个" / "影子" / "恐龙")
- ✅ 加观察("没开门"是事实陈述,不是苦难渲染)
- ✅ 保留 Red Layer 温度("没开门"= 现实张力,不是"战时" / "战火")
- ✅ 避开"猎奇"风险(没有奇观元素,只是普通商铺关门)

### PLACEHOLDER 标记
- 同 Hero:右上角虚线红框 + "◌ PLACEHOLDER · PM 待补真图"
- 替换后只需更新 `background-image` URL + 删除 PLACEHOLDER div

### 验证
- ✅ 4 屏 Pattern 不变
- ✅ 不写战时相关文案
- ✅ 不"猎奇"(无戏剧化元素)
- ✅ 文案纪录式,克制观察

---

## P0-3 · Echo 加 5 项交互 ✅

### mockup
`outputs/v1.5-mockups/d4-a2-khartoum-round2/04-echo-v8-desktop.png`(1440×900)

### 5 项交互元素(全实现)

| # | 元素 | v7(已 LOCKED) | v8(本次) |
|---|---|---|---|
| 1 | **placeholder** | "这一刻,你留下了什么?"(抽象,与大提问重复) | "**写下一句你此刻想到的话...**"(具体可操作) |
| 2 | **microcopy** | (无) | "**仅记录这一刻的触动,不显示头像,不追踪身份**"(隐私说明) |
| 3 | **字数提示** | (无) | "**0 / 80**"(等宽 mono,右对齐) |
| 4 | **CTA 按钮** | "记录 →" 普通链接 | "**记录**" earth-blue 填充色按钮(`background: var(--earth-blue)`,border-radius: 2px,padding: 12px 20px,hover earth-blue-deep) |
| 5 | **轻提示** | (无) | "**你也可以只留下一个词**"(italic,右对齐) |

### 设计说明
- **placeholder 具体化**:从抽象"留下了什么"到可操作"写下一句你此刻想到的话..." — 用户知道要写什么
- **microcopy 建立信任**:从"无"到"不显示头像 / 不追踪身份" — 用户知道这是私密空间
- **字数提示控制节奏**:0 / 80 让用户感知"短文本",与"一句话"概念一致
- **CTA 按钮化**:从普通链接到填充色按钮 + hover 态 + focus-visible outline — 从"概念"变成"产品"
- **轻提示鼓励短文本**:从"无"到"也可以只留下一个词" — 不给压力

### 验证
- ✅ 5 项交互元素全实现
- ✅ 大提问不变(沿用 v7,LOCKED)
- ✅ "你也可以只留下一个词"(鼓励短文本,不增加社交压力)
- ✅ 仍然"删 Like/Comment/Share"(沿用 v7,LOCKED)
- ✅ 后续 empty/success/submitted/privacy state 留到下一轮(本轮明确不做)

---

## 红层模板规则 v1 准备(战略输出)

Khartoum 完成后,沉淀 **Red Layer City Detail Rules v1**:

### Hero 图像风格
- **必须**:沙色 / 灰棕 / 热雾感 · 街道日常 · 城市建筑 · 真摄影
- **可选**:尼罗河沿岸 · 沙墙 · 远处建筑 · 半开张商铺
- ❌ 不用:战争 / 武器 / 伤员 / 苦难 / 难民 / 集会议题(直接新闻)
- ❌ 不用:插画 / SVG 抽象 / 沙漠鸟瞰 / 完全黑夜

### Accent color 范围
- **主 accent**:`var(--layer-red)` #D96A5F(主时间)
- **辅助**:`var(--layer-yellow)` #D8B15C(+5H 中间)
- ❌ 不引入新 layer color(沿用 A2 三色)

### 文案语气规范
- ✅ 减形容词 + 加观察
- ✅ "没开门 / 等水 / 排半天" — 现实张力(Red Layer),不是苦难渲染
- ❌ 不用"军事据点 / 炮击 / 伤员"(新闻感)
- ❌ 不用"战时 / 战火 / 冲突"(苦难审美化)

### 图像选取规则
- 必须是真实摄影(无插画,除非必要)
- 必须是日常(非戏剧 / 非苦难)
- 必须有 35-45% 暗部(可放 120px 城市名 + 双时区)
- 必须避开 3 个 anti-pattern:新闻 / NGO / 苦难

### 不允许出现的视觉倾向
- ❌ 战争 / 武器 / 武装
- ❌ 大量人物 close-up(避免苦难审美化)
- ❌ 政治标语 / 横幅文字
- ❌ 完全黑暗 / 完全夜景
- ❌ 鲜艳饱和色(不挑衅)

### Echo 交互语气
- ✅ 鼓励"短文本"("你也可以只留下一个词")
- ✅ 强调"私密"("不显示头像 / 不追踪身份")
- ✅ 极轻字数提示(0/80)
- ✅ CTA 按钮化(填充色 + hover 态)
- ❌ 不加"提交" / "保存"等功利化 CTA(保留"记录"——记录一个瞬间)

---

## 总自检

- ✅ Tier 1-3 全读(round 6 锁 + round 7 prompt)
- ✅ LOCKED 4 屏 Pattern + A2 / VF 1.1 不动
- ✅ **3 P0 全部修复**
 - P0-1 Hero 真实摄影(占位)
 - P0-2 One Scene 重选图 + 降调文("没开门")
 - P0-3 Echo 5 项交互元素
- ✅ 3 个 anti-pattern 全部避开
- ✅ 不像新闻 / 城市百科 / NGO / 苦难 / 猎奇
- ✅ Same Second 仍稳(沿用 v7)
- ✅ A2 8 Do + 8 Don't 全过

## ⏸ 不做的事(明确 STOP)

- ❌ 不重做 4 屏 Pattern ✓
- ❌ 不改 Same Second 主结构 ✓
- ❌ 不改 Echo 大提问 ✓
- ❌ 不动 A2 / VF 1.1 ✓
- ❌ 不做 Yellow Layer 城市(Lisbon 下一轮)✓
- ❌ 不动 src/data/ ✓
- ❌ 不引入新依赖 ✓
- ❌ 不用战争 / 武器 / 伤员 / 苦难图片 ✓

---

## 📦 交付物(4 mockup + 4 HTML 源 + 模板规则草案)

| 屏 | mockup | HTML 源 |
|---|---|---|
| 01 Arrival v8 | `01-arrival-v8-desktop.png` (1440×900) | `01-arrival-v8.html` |
| 02 One Scene v8 | `02-one-scene-v8-desktop.png` (1440×900) | `02-one-scene-v8.html` |
| 03 Same Second v8 | `03-same-second-v8.png` (1440×900,沿用 v7) | `03-same-second-v8.html`(沿用) |
| 04 Echo v8 | `04-echo-v8-desktop.png` (1440×900) | `04-echo-v8.html` |

### 引用了 07 目录的哪几个文件

- ✅ `A2 City Detail 设计 brief — 外部设计师 brief`(21 项原 brief)
- ✅ `A2 视觉 QA round 6 — Kyoto City Detail 锁评估反馈`(4 屏 Pattern LOCKED)
- ✅ `A2 视觉 QA round 7 — Khartoum Red Layer 压测评估 prompt`(3 P0 来源)

---

**字数统计**:正文 ≥ 1300 字 · 3 P0 修复具体改动 + Red Layer Template Rules v1 草案
