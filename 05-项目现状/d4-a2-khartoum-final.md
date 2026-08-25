---
title: PROMPT 30 v2 · Khartoum Final Asset & QA Pass
type: design-spec
tags: [d4-a2-khartoum, final-asset, real-photo, red-layer, designer交付物, PROMPT-30-v2]
date: 2026-08-18
status: 设计 spec · 待 PM 评审(Visual QA round 9)
canonical_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/d4-a2-khartoum-final.md
---

# PROMPT 30 v2 · Khartoum Final Asset & QA Pass

> **作者**:Designer Agent · **日期**:2026-08-18 · **对应 PROMPT**:30 v2
> **mockups**:`outputs/v1.5-mockups/d4-a2-khartoum-final/`(1 张 PNG + 2 个 breakpoint + 1 个 HTML 源)
> **目标**:**1 件事**:用用户提供的真摄影替换 Hero 的 PLACEHOLDER(只 1 件,禁重做版式)
> **边界**:**只换图**,不改 4 屏 Pattern / One Scene / Same Second / Echo / A2 / VF 1.2

---

## 必读记录

- ✅ 读 4 个文件:SEE_EARTH_DESIGN_SYSTEM_v1.2 / See Earth Design System v1.2 同步设计师必读 / City Detail brief 21 项 / d4-a2-khartoum-round2 v8 报告
- ✅ LOCKED 状态:Direction A2 / VF 1.2 / 4 屏 Pattern / LOCAL-YOUR-+5H / 5 维度 Red Layer Template Rules v1
- ✅ 用户 8/18 提供真摄影:`outputs/a2-visual-assets/khartoum-real-nile-sunset.jpg`(1920×1079, 16:9)

---

## Hero 最终图替换 ✅

### mockup
`outputs/v1.5-mockups/d4-a2-khartoum-final/01-arrival-final-desktop.png`(1440×900)

### 改动
| 项 | v8(PLACEHOLDER) | FINAL |
|---|---|---|
| 删 PLACEHOLDER 标记 | 红色虚线 "◌ PLACEHOLDER · PM 待补真图" | **✅ 删除** |
| 替换 background-image | `url('...khartoum-real-daily-park.jpg')`(Image A 公园孩子) | `url('...khartoum-real-nile-sunset.jpg')`(**用户提供的真摄影**) |
| 暗 gradient 色调 | 冷暗灰(0,0,0,~0.7) | **改为何**:**暖暗棕**(`rgba(40,24,16,~0.5)`)— 适应新图暖金色光 |
| 文字安全区不变 | 左侧 45% 暗 gradient | **✅ 不变** |
| 4 屏 Pattern 不变 | Arrival / One Scene / Same Second / Echo | **✅ 不变** |

### 视觉效果
- ✅ **真实 Khartoum 摄影**(尼罗河日落 + al-Mogran 风格建筑 + 远景天际线 + 暖金色光)
- ✅ 暖金色 Red Layer 温度(完全符合 §2.8.8 Red Layer Image Ethics)
- ✅ 城市识别度强(去掉"喀土穆"字也能识别这是 Khartoum)
- ✅ 顶部有热雾感 → §2.8.11 Overlay Rules 适用
- ✅ 横向 16:9 完美 Hero 尺寸
- ✅ "喀土穆" 120px 大字 完美可读,文字背后有暖金光 halo(太阳)
- ✅ 双时区 15:53 ↔ 20:53 清晰

---

## Metadata 12 字段(§2.8.9 Required)

| 字段 | 值 |
|---|---|
| `asset_id` | `khartoum_real_nile_sunset_v1` |
| `city` | Khartoum |
| `country` | Sudan |
| `source` | 用户 8/18 提供 |
| `source_url` | **(待 PM 补充原始来源 URL — Wikimedia Commons / Reuters / AP 检索,PM 沙箱访问限制)** |
| `photographer` | **(待 PM 补充)** |
| `date` | 2026-08-18 |
| `resolution` | 1920×1079(16:9) |
| `license` | **(待 PM 补充 — 需 editorial use 许可)** |
| `editorial_only` | 是(Red Layer 必 editorial) |
| `credit_requirement` | **(待 PM 补充)** |
| `usage_restriction` | Khartoum City Detail Hero only |
| `content_description` | 蓝色尼罗河日落 + al-Mogran 风格建筑(蛋形+塔形+远景)+ 桥 + 远景城市天际线 + 暖金色光 + 0 人物特写 |

---

## 3 breakpoint 验证(§2.8.11 Overlay Rules)

| breakpoint | 状态 | 文件 |
|---|---|---|
| **1440×900** | ✅ 暗 gradient 适配 — "喀土穆" 大字 + 暖金光 halo | `01-arrival-final-desktop.png` |
| **1680×900** | ✅ 同上,无视觉退化 | `01-arrival-final-1680.png` |
| **1920×1080** | ✅ 同上,无视觉退化 | `01-arrival-final-1920.png` |

---

## 已 LOCKED(不许动,本轮也未动)

- ✅ 4 屏 Pattern(Arrival / One Scene / Same Second / Echo)
- ✅ LOCAL / YOUR / +5H 时间排版
- ✅ One Scene 文案
- ✅ Same Second 3 栏 + 文字
- ✅ Echo 5 项交互
- ✅ Direction A2 / VF 1.2

---

## 自检

- ✅ Tier 1-3 全读 + Design System v1.2
- ✅ LOCKED 4 屏 Pattern + LOCAL-YOUR-+5H
- ✅ 用了用户提供的真摄影(不用 Image A 公园孩子)
- ✅ 删 PLACEHOLDER 标记
- ✅ 暗 gradient 改为暖暗棕(适应暖金色光)
- ✅ §2.8.8 Red Layer Image Ethics 验证(不猎奇 / 不美化苦难 / 优先生活仍在继续)
- ✅ §2.8.9 Sourcing + 12 字段 metadata(部分等 PM 补充)
- ✅ §2.8.10-11 Crop / Overlay 适配 3 breakpoint
- ✅ A2 8 Do + 8 Don't 全过
- ✅ 没有重做版式(只换图 + 调 gradient)

## ⏸ 不做的事(明确 STOP)

- ❌ 不重做 4 屏 Pattern ✓
- ❌ 不重做 One Scene ✓
- ❌ 不重做 Same Second ✓
- ❌ 不重做 Echo ✓
- ❌ 不做 QA Pass(已通过 v8,本轮不重做)✓
- ❌ 不找其他 Khartoum 图 ✓
- ❌ 不做 Yellow Layer 城市(下一轮 PROMPT 31)✓
- ❌ 不动 A2 / VF 1.2 ✓
- ❌ 不引入新依赖 ✓
- **绝对不要做 Khartoum 第三遍** ✓

---

## 📦 交付物(1 张 mockup + 3 breakpoint + 1 个 HTML 源)

| 屏 | mockup | HTML 源 |
|---|---|---|
| 01 Arrival FINAL | `01-arrival-final-desktop.png` (1440×900) | `01-arrival-final.html` |
| 01 Arrival FINAL @ 1680 | `01-arrival-final-1680.png` (1680×900) | 同上 |
| 01 Arrival FINAL @ 1920 | `01-arrival-final-1920.png` (1920×1080) | 同上 |

### 引用了 07 目录的哪几个文件

- ✅ `SEE_EARTH_DESIGN_SYSTEM_v1.2_Complete_Spec.md`(§2.8.8/8.9/10/11 Red Layer Image Ethics/Sourcing/Crop/Overlay)
- ✅ `See Earth Design System v1.2 同步设计师必读.md`(5 章节核心摘要)
- ✅ `A2 City Detail 设计 brief — 外部设计师 brief`(21 项原 brief)
- ✅ `d4-a2-khartoum-round2.md` v8 报告(Red Layer Template Rules v1)

---

**字数统计**:正文 ≥ 900 字 · 1 件事具体改动 + metadata 12 字段 + 3 breakpoint 验证
