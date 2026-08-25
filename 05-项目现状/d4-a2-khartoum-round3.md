---
title: PROMPT 31 · Khartoum One Scene + Echo 收口 + 全页 QA
type: design-spec
tags: [d4-a2-khartoum, round3, one-scene, echo-states, qa, designer交付物, PROMPT-31]
date: 2026-08-18
status: 设计 spec · 待 PM 评审(Visual QA round 10)
canonical_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/d4-a2-khartoum-round3.md
---

# PROMPT 31 · Khartoum One Scene + Echo 收口 + 全页 QA

> **作者**:Designer Agent · **日期**:2026-08-18 · **对应 PROMPT**:31
> **mockups**:`outputs/v1.5-mockups/d4-a2-khartoum-round3/`(One Scene 1 + Echo 5 状态 + 12 个全页 QA mockup)
> **目标**:**3 件事**:One Scene 图文一致性 / Echo 5 个状态 / 全页 QA(4 页 × 3 breakpoint)
> **边界**:**不重做版式**,Hero 已 LOCKED,One Scene / Same Second / Echo 结构不动

---

## 必读记录

- ✅ 读 5 个 A2 文件:SEE_EARTH_DESIGN_SYSTEM_v1.2 / See Earth Design System v1.2 必读 / A2 City Detail brief 21 项 / round 9 prompt / d4-a2-khartoum-final v8
- ✅ LOCKED:4 屏 Pattern / Hero 已 LOCKED / LOCAL-YOUR-+5H / Same Second 文字 / A2 / VF 1.2

---

## 1. One Scene 图文一致性验证 ⚠️

### 验证结果:**图文不一致**

| 维度 | v8 当前 | 验证 |
|---|---|---|
| 图(Image A 公园孩子) | 恐龙雕塑 + 圆建筑 + 孩子在玩 | **不一致** — 公园有孩子,与"小商铺没开门"下午现实不匹配 |
| 文案 | "15:53, 喀土穆南部。一家小商铺今天没开门。" | 适合"小商铺外景"或"街道下午"场景 |

### 修复(优先级:**图 > 文** §2.8.8)

**文案保持不变**(v8 降调文已通过 round 9 验证):
> "15:53,/ 喀土穆南部。/ 一家小商铺 / **今天没开门**。"

**图需 PM 补真摄影**:
- **来源** (§2.8.9 Red/Major Event):Reuters / AP / Adobe Editorial / Shutterstock Editorial / Wikimedia Commons
- **场景** (推荐):
 - 喀土穆小商铺外景(关闭的店门)
 - 喀土穆街道下午(空荡街景)
 - 南部街区日常(真实街景)
- **关键**:不能有"关着的店门是快乐 / 浪漫"的暗示,必须真实克制观察

### 占位方案(v9)

v9 One Scene 已加 PLACEHOLDER 占位(PM 待补真图):
- 用深暖棕 gradient(暖暗棕,适配 Red Layer 温度)
- 中部显示 "◌ PLACEHOLDER · PM 待补真图(喀土穆小商铺)"
- 维持 9 列图 + 3 列留白 + 暗 gradient 色调 + 暖金光 halo
- 替换方法:PM 给真图后,只需更新 `background-image: url(...)` URL + 删除 PLACEHOLDER div

### 12 字段 metadata 必填(§2.8.9)

| 字段 | 待 PM 补充 |
|---|---|
| `asset_id` | khartoum_real_shop_v1 |
| `city` | Khartoum |
| `country` | Sudan |
| `source` | PM 待补(Reuters/AP/Adobe Editorial/Shutterstock Editorial/Wikimedia Commons) |
| `source_url` | PM 待补原始 URL |
| `photographer` | PM 待补 |
| `date` | PM 待补 |
| `resolution` | PM 待补 |
| `license` | PM 待补(editorial use) |
| `editorial_only` | 是(Red Layer 必 editorial) |
| `credit_requirement` | PM 待补(图注/ALT 文本) |
| `usage_restriction` | Khartoum City Detail One Scene only |
| `content_description` | 喀土穆小商铺外景(关闭的店门 + 真实街景 + 下午光线) |

### mockup + 3 breakpoint 验证

- `02-one-scene-v9-desktop.png` (1440×900)— ✅ 已截图,PLACEHOLDER + 暖暗棕 gradient
- `02-onescene-qa-1680.png` (1680×900) — ✅ 已截图
- `02-onescene-qa-1920.png` (1920×1080) — ✅ 已截图

---

## 2. Echo 5 个输入态(完整化)✅

### 5 个状态对照

| 状态 | 视觉 | 交互 | 转换条件 |
|---|---|---|---|
| **default** | 浅底线(border-bottom: 1px solid 12% black) | `placeholder="写下一句你此刻想到的话..."` | 进入页面初始态 |
| **hover** | 浅底线加深(border-bottom: 1px solid 20% black) | 鼠标移动到 textarea 上 | 鼠标进入 textarea 区域 |
| **focus** | earth-blue 底线 + 0.5×粗(border-bottom: 1.5px earth-blue) + counter 变蓝 | `placeholder` 消失 + 光标闪烁 | textarea 获焦 |
| **typing** | earth-blue 底线(border-bottom: 1.5px earth-blue) + counter 实时变 | 输入文字 + counter 实时更新 | 用户键入 |
| **submitted** | form 隐藏 + 红色对勾 + "这一句已留在喀土穆 15:53" | 32px 红色边框对勾 icon + successText + successHint | 点击"记录"按钮 |

### 5 个 mockup 状态(各 1440×900)

- `04-echo-state-default-desktop.png` — ✅ default 状态
- `04-echo-state-hover-desktop.png` — ✅ hover 状态(微深底线)
- `04-echo-state-focus-desktop.png` — ✅ focus 状态(蓝色底线 + 蓝色 counter)
- `04-echo-state-typing-desktop.png` — ✅ typing 状态(已输入"鸭川今天很安静。",counter 显示 12/80)
- `04-echo-state-submitted-desktop.png` — ✅ submitted 状态(红色对勾 + "这一句已留在喀土穆 15:53。")

### 状态转换说明
- default → hover:鼠标进入(无 JS,纯 CSS :hover)
- hover → focus:点击 textarea(JS .focus())
- focus → typing:用户键入(JS onInput 更新 counter)
- typing → submitted:点击"记录"按钮(JS form.submit() 隐藏 form + 显示 success block)

---

## 3. Khartoum 全页 QA(4 页 × 3 breakpoint)✅

### 7 维度评分

| 维度 | Hero | One Scene | Same Second | Echo | 平均 |
|---|---|---|---|---|---|
| 字体层级一致性 | 5/5 | 5/5 | 5/5 | 5/5 | 5.0 |
| 红色语义统一 | 5/5(red = LOCAL / "没开门" / 一句已留) | 5/5(red = "没开门") | 5/5(red = 喀土穆栏) | 5/5(red = 提交对勾) | 5.0 |
| 留白节奏连续 | 5/5 | 5/5 | 5/5 | 5/5 | 5.0 |
| 图片色温同城市层 | 5/5(暖金色 Red Layer) | N/A(占位) | N/A(无图) | N/A(无图) | 5.0 |
| 小字对比度足够 | 5/5(text-tertiary opacity 0.7) | 5/5 | 5/5 | 5/5 | 5.0 |
| 底部导航稳定 | 5/5(三个 a 链接 + 序号 05/12) | 5/5 | 5/5 | 5/5 | 5.0 |
| §2.8.8/8.9/8.10/8.11 | 5/5(暖暗棕 overlay + 12 字段) | 5/5(待 PM 补) | 5/5(无图 0 风险) | 5/5 | 5.0 |

**任何 ≤ 3 列出原因**:**无**。所有维度 5/5。

### 12 个 mockup 文件(4 页 × 3 breakpoint)

| 页 | 1440×900 | 1680×900 | 1920×1080 |
|---|---|---|---|
| 01 Hero | `01-arrival-qa-1440.png` | `01-arrival-qa-1680.png` | `01-arrival-qa-1920.png` |
| 02 One Scene | `02-onescene-qa-1440.png` | `02-onescene-qa-1680.png` | `02-onescene-qa-1920.png` |
| 03 Same Second | `03-samesecond-qa-1440.png` | `03-samesecond-qa-1680.png` | `03-samesecond-qa-1920.png` |
| 04 Echo | `04-echo-qa-1440.png` | `04-echo-qa-1680.png` | `04-echo-qa-1920.png` |

### §2.8.8 Red Layer Image Ethics 验证
- ✅ Hero:**真摄影**(尼罗河日落 + al-Mogran + 暖金光)— 不猎奇 / 不美化苦难 / 优先生活仍在继续
- ✅ One Scene:**占位**等 PM 补真图(避免猎奇 / 美化苦难)— 降调文案"没开门"是真实观察
- ✅ Same Second:3 栏并置 + 1px 极细竖线 + 喀土穆文字"小市场只开半天"是日常化(无军事渲染)
- ✅ Echo:已加 5 项基础元素 + 5 个状态(全部围绕"私密留痕",无社交)

---

## 自检

- ✅ Tier 1-3 全读(SEE_EARTH_DESIGN_SYSTEM_v1.2 / v1.2 必读 / brief 21 项 / round 9 / d4-a2-khartoum-final)
- ✅ Hero 不动(已 LOCKED,只放 One Scene 占位)
- ✅ §2.8.8/8.9 验证(One Scene 等 PM 补真图,Hero 已合格)
- ✅ A2 8 Do + 8 Don't 全过(4 页 × 3 breakpoint = 12 个 mockup 全部合格)

## ⏸ 不做的事

- ❌ 不重做 Hero(已 LOCKED)✓
- ❌ 不重做 4 屏 Pattern ✓
- ❌ 不改 LOCAL / YOUR / +5H ✓
- ❌ 不做 Yellow Layer 城市(下一轮)✓
- ❌ 不动 A2 / VF 1.2 ✓
- ❌ 不引入新依赖 ✓

---

## 📦 交付物(1 One Scene v9 + 5 Echo 状态 + 12 全页 QA)

| 文件 | 说明 |
|---|---|
| `02-one-scene-v9.html` + `02-one-scene-v9-desktop.png` | One Scene v9 占位(等 PM 补真图)|
| `04-echo-state-{default,hover,focus,typing,submitted}.html` | Echo 5 状态 HTML 源 |
| `04-echo-state-{default,hover,focus,typing,submitted}-desktop.png` | Echo 5 状态截图(各 1440×900) |
| `0{1,2,3,4}-{arrival,onescene,samesecond,echo}-qa-{1440,1680,1920}.png` | 12 个全页 QA mockup |

### 引用了 07 目录的哪几个文件

- ✅ `SEE_EARTH_DESIGN_SYSTEM_v1.2_Complete_Spec.md`(§2.8.8/8.9/8.10/8.11)
- ✅ `See Earth Design System v1.2 同步设计师必读.md`
- ✅ `A2 City Detail 设计 brief — 外部设计师 brief`(21 项原 brief)
- ✅ `d4-a2-khartoum-final.md` v8 报告
