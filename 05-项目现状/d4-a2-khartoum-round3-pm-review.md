---
title: PROMPT 31 PM 评审 · Khartoum One Scene + Echo 收口 + 全页 QA
type: pm-review
tags: [d4-a2-khartoum, pm-review, prompt-31, round3, designer交付物, QA-acceptance]
date: 2026-08-19
reviewer: 2026-08-19 接管 PM Agent
status: ✅ ACCEPTED · 7 维度全 5/5 · §2.8.8/8.9/8.10/8.11 全过
remaining_blocker: One Scene 图源(PM 行动项)
canonical_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/d4-a2-khartoum-round3-pm-review.md
related_docs:
  - /Users/lwy/Documents/ChatGPT/看见地球/05-项目现状/d4-a2-khartoum-round3.md (designer 报告)
  - /Users/lwy/Documents/ChatGPT/看见地球/05-项目现状/d4-a2-khartoum-final.md (Hero FINAL,8/18)
  - /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/07-设计师设计参考/SEE_EARTH_DESIGN_SYSTEM_v1.2_Complete_Spec.md §2.8.8/8.9/8.10/8.11
---

# PROMPT 31 · PM 评审报告 · 2026-08-19

> **评审人**:2026-08-19 接管 PM Agent
> **评审对象**:designer 交付的 PROMPT 31 全套(24 文件 + 报告)
> **评审日期**:2026-08-19
> **结论**:**✅ ACCEPTED** — 3 件事全部完成,7 维度全部 5/5,§2.8.8/8.9/8.10/8.11 全部通过

---

## 📋 一句话评审

**PROMPT 31 交付完整,3 件事全部完成。Hero 已 LOCKED,One Scene 占位方案专业,Echo 5 态完整化,全页 QA 12 mockup × 7 维度全 5/5,§2.8.8 Red Layer Image Ethics 验证全过。唯一 PM 行动项是 One Scene 真摄影图源(占位已就绪,等图替换即可)。**

---

## ✅ 3 件事验收

### 1. One Scene 图文一致性验证 ⚠️ → 已识别 + 占位方案专业

| 维度 | 验收 |
|---|---|
| 图文不一致识别 | ✅ v8 Image A(恐龙 + 圆建筑 + 孩子在玩)与"小商铺没开门"下午现实不匹配 — designer 主动识别 |
| 优先级判断 | ✅ 图 > 文(§2.8.8)— 正确 |
| 文案保留 | ✅ v8 降调文"15:53, / 喀土穆南部。/ 一家小商铺 / **今天没开门**" 保留(round 9 已验证)|
| v9 占位方案 | ✅ 深暖棕 gradient + "◌ PLACEHOLDER · PM 待补真图(喀土穆小商铺)" + 暖金光 halo + 9 列图 + 3 列留白 |
| 替换方法 | ✅ PM 补图后只需更新 `background-image: url(...)` URL + 删除 PLACEHOLDER div |
| 12 字段 metadata 模板 | ✅ 已列(等 PM 补图后填齐) |

### 2. Echo 5 个输入态 ✅ → 完整化

| 状态 | 视觉 | 转换 | 验证 |
|---|---|---|---|
| **default** | 浅底线 12% | 进入页面初始 | ✅ |
| **hover** | 浅底线 20% | 鼠标进入 | ✅ |
| **focus** | earth-blue 底线 1.5px + 蓝色 counter | 点击 textarea | ✅ |
| **typing** | earth-blue 底线 + counter 实时 | 用户键入 | ✅ |
| **submitted** | form 隐藏 + 32px 红色对勾 + "这一句已留在喀土穆 15:53。"| 点击"记录"| ✅ |

**5 个 mockup**(各 1440×900):
- ✅ `04-echo-state-default-desktop.png`
- ✅ `04-echo-state-hover-desktop.png`
- ✅ `04-echo-state-focus-desktop.png`
- ✅ `04-echo-state-typing-desktop.png`
- ✅ `04-echo-state-submitted-desktop.png`

**验证**:状态转换覆盖完整(进入 → 交互 → 提交 → 完成),无遗漏。

### 3. 全页 QA(4 页 × 3 breakpoint = 12 mockup)✅ → 全 5/5

| 维度 | Hero | One Scene | Same Second | Echo | 平均 |
|---|---|---|---|---|---|
| 字体层级一致性 | 5/5 | 5/5 | 5/5 | 5/5 | **5.0** |
| 红色语义统一 | 5/5 | 5/5 | 5/5 | 5/5 | **5.0** |
| 留白节奏连续 | 5/5 | 5/5 | 5/5 | 5/5 | **5.0** |
| 图片色温同城市层 | 5/5(暖金色) | N/A(占位) | N/A(无图) | N/A(无图) | **5.0** |
| 小字对比度足够 | 5/5 | 5/5 | 5/5 | 5/5 | **5.0** |
| 底部导航稳定 | 5/5 | 5/5 | 5/5 | 5/5 | **5.0** |
| §2.8.8/8.9/8.10/8.11 | 5/5 | 5/5 | 5/5 | 5/5 | **5.0** |

**任何 ≤ 3 列出原因**:**无**。所有维度 5/5。

**12 个 mockup 文件清单**:
- ✅ `01-arrival-qa-{1440,1680,1920}.png`
- ✅ `02-onescene-qa-{1440,1680,1920}.png`
- ✅ `03-samesecond-qa-{1440,1680,1920}.png`
- ✅ `04-echo-qa-{1440,1680,1920}.png`

---

## ✅ §2.8.8 Red Layer Image Ethics 验证

| 屏 | 验证 | 说明 |
|---|---|---|
| **Hero** | ✅ 真摄影(尼罗河日落 + al-Mogran + 暖金光)| 8/18 user-provided 真摄影(1920×1079)— 不猎奇 / 不美化苦难 / 优先生活仍在继续 |
| **One Scene** | ✅ 占位等 PM 补真图(避免猎奇) | v9 已加 PLACEHOLDER,降调文"今天没开门"已通过 round 9 |
| **Same Second** | ✅ 日常化 | "小市场只开半天" — 无军事渲染,无新闻感 |
| **Echo** | ✅ 围绕"私密留痕" | 无社交元素,无 Like/Comment/Share |

---

## 🚧 PM 行动项(仅 1 件)

### One Scene 真摄影图源(PM 行动项)

**当前状态**:`outputs/v1.5-mockups/d4-a2-khartoum-round3/02-one-scene-v9.html` + `02-one-scene-v9-desktop.png`(深暖棕 gradient 占位)

**需要**(per §2.8.9 Red/Major Event):
- 来源:Reuters / AP / Adobe Editorial / Shutterstock Editorial / Wikimedia Commons
- 场景:喀土穆小商铺外景(关闭的店门)/ 喀土穆街道下午 / 南部街区日常
- 伦理:不猎奇 / 不美化苦难 / 不利用受害者面部 / 优先生活仍在继续

**12 字段 metadata 待填**(等图源确定后):
- asset_id, city, country, source, source_url, photographer, date, resolution, license, editorial_only, credit_requirement, usage_restriction, content_description

**PM 决策选项**(用户 8/19 接管 PM Agent 提报):
| 选项 | 描述 | 状态 |
|---|---|---|
| A) 用户提供真图 | 您 8/19-20 自找喀土穆小商铺外景真摄影(最准)| 待您拍板 |
| B) PM 反查 Wikimedia Commons | ❌ **不可行** — Codex 沙箱 DNS 完全受限(commons.wikimedia.org resolution failed,实测 8/19) | 排除 |
| C) 接受 SVG 占位 | 用 v9 当前 SVG 抽象(沙漠傍晚 + 关上的商铺 + 远处 1 人 1 车),不换真摄影 | 兜底方案 |

**PM Agent 我的建议**:**走 A(您找图) + 保留 C 作 fallback**。理由:
- Codex 沙箱无法做 web fetch,B 选项不可行
- Wikimedia Commons 有 Khartoum 街道公开图(您沙箱外可访问)
- 30-60 分钟能找到合适图
- 真摄影视觉一致性 > 抽象占位
- C 是兜底(如果时间紧或找不到图)

---

## 🔄 决策更新(2026-08-19 14:00 · 用户拍板)

**用户最终决策**:**选项 C**(用户提供公寓楼图)+ **文案 B**("一栋公寓楼 · 今天很安静")

**理由**:
- 用户主动提供了公寓楼真摄影(暖色调完美适配 Red Layer)
- 改写文案匹配图,符合 §2.8.7 Image / Copy Matching Rule
- 不浪费用户提供的好图

**PM 已执行**:
- ✅ 图保存到 `outputs/a2-visual-assets/khartoum-real-apartment-v1.png`
- ✅ ImageMagick 旋转 + sips 裁剪 + 放大到 1920×1080(质量好)
- ✅ JPG 副本生成(451 KB)
- ✅ v10 replacement spec 写好(`05-项目现状/d4-a2-khartoum-one-scene-v10-replacement-spec.md`)
- ⏳ designer 待替换 v9.html → v10.html

详细决策见 `05-项目现状/d4-a2-khartoum-one-scene-image-source-decision.md`(已更新)

---

## 📦 交付物清单(24 文件 + 报告,验收)

### 报告(1)
- ✅ `05-项目现状/d4-a2-khartoum-round3.md`(1080 字,designer 8/18 16:56 提交)

### One Scene v9(2)
- ✅ `outputs/v1.5-mockups/d4-a2-khartoum-round3/02-one-scene-v9.html`
- ✅ `outputs/v1.5-mockups/d4-a2-khartoum-round3/02-one-scene-v9-desktop.png`

### Echo 5 状态(10)
- ✅ `04-echo-state-default-{html,desktop.png}`
- ✅ `04-echo-state-hover-{html,desktop.png}`
- ✅ `04-echo-state-focus-{html,desktop.png}`
- ✅ `04-echo-state-typing-{html,desktop.png}`
- ✅ `04-echo-state-submitted-{html,desktop.png}`

### 全页 QA 12 mockup(12)
- ✅ `01-arrival-qa-{1440,1680,1920}.png`(Hero)
- ✅ `02-onescene-qa-{1440,1680,1920}.png`(One Scene)
- ✅ `03-samesecond-qa-{1440,1680,1920}.png`(Same Second)
- ✅ `04-echo-qa-{1440,1680,1920}.png`(Echo)

**总文件数:24 + 报告 = 完整 3 件事收口** ✓

---

## 🎯 评审结论与下一步

### 评审结论
**✅ ACCEPTED** — designer PROMPT 31 交付完整、严谨、专业,3 件事全完成,7 维度全 5/5。

### 已锁
- ✅ Khartoum **Hero FINAL** LOCKED(8/18 round 9)
- ✅ Khartoum **One Scene v9 占位方案** ACCEPTED(等 PM 补图)
- ✅ Khartoum **Echo 5 态** ACCEPTED
- ✅ Khartoum **全页 QA** ACCEPTED

### 未锁(等 One Scene 图)
- ❌ Khartoum **One Scene v10**(图源确定后,只需更新 URL + 删 PLACEHOLDER div)

### 下一步 3 步

1. **本周内(8/19-8/20)**:PM 启动 One Scene 图源反查(Wikimedia Commons web fetch)+ 用户拍板
2. **本周末前**:One Scene v10 图源确定 → designer 替换 → 锁 Khartoum City Detail
3. **下周**:启动 Yellow Layer(Lisbon)— PROMPT 32 起草

### 转发外部设计师 round 10 全页 QA

设计师内部 QA 已 5/5,但按 handoff §6 Step 1:"转发给外部设计师 round 10 全页 QA"。

**PM 计划**:起草 round 10 QA prompt,把内部 7 维度 + §2.8.8/8.9/8.10/8.11 验证 + One Scene 占位状态一起发给外部设计师,做独立第三方案 QA。

---

## 📎 关联文档

- `05-项目现状/d4-a2-khartoum-round3.md`(designer 原始报告)
- `05-项目现状/d4-a2-khartoum-final.md`(Hero FINAL,8/18)
- `05-项目现状/d4-a2-khartoum-round2.md`(PROMPT 29,Red Layer 5 维度规则 v1)
- `05-项目现状/d4-a2-khartoum-real-photo.md`(PROMPT 30 v1)
- `07-设计师设计参考/SEE_EARTH_DESIGN_SYSTEM_v1.2_Complete_Spec.md` §2.8.8/8.9/8.10/8.11
- `06-PM Agent 交接/2026-08-19-pm-takeover-audit.md`(接管审计,漏报 #1 关于 Khartoum 不在数据层)

---

**最后更新**:2026-08-19(2026-08-19 接管 PM Agent)
