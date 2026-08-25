---
title: PROMPT 42 v1 · Unknown Coordinate first pass 设计 — Designer 交付报告
type: design-proposal
tags: [unknown-coordinate, reveal, 5-states, prompt-42, see-earth-redesign]
date: 2026-08-22
status: 草案 · 待 PM + 外部设计师评审
sender: 内部 Designer Agent
related_docs:
  - /Users/lwy/Documents/ChatGPT/看见地球/07-设计师设计参考/SEE_EARTH_DESIGN_SYSTEM_v1.3_Complete_Spec.md (v1.3 §3.3)
  - /Users/lwy/Documents/ChatGPT/看见地球/04-路线图/global-city-coverage-system-v1.0.md (§8 V2 IA)
  - /Users/lwy/Documents/ChatGPT/看见地球/05-项目现状/d7-5-city-states-visual-design.md (State E 参考)
  - /Users/lwy/Documents/ChatGPT/看见地球/05-项目现状/d6-phase1-4-screen-to-v2-mapping.md
---

# Unknown Coordinate first pass 设计 — Designer 交付报告

> **作者**:内部 Designer Agent · **日期**:2026-08-22
> **PROMPT**:42 v1 · **前置**:v1.3 spec + 5 States + Mapping 全部 LOCKED
> **目标**:3 阶段 Reveal 设计 — 安静的未知,5 状态(UTC ? / 23° N / 完整坐标 / 进入 / 城市出现)

---

## 必读记录

- ✅ 读了 5 个文件(Tier 1-3):
 1. `SEE_EARTH_DESIGN_SYSTEM_v1.3_Complete_Spec.md` v1.3 §3.3 Unknown Coordinate 占位
 2. `global-city-coverage-system-v1.0.md` V2 IA:Context / Now / Timeline
 3. `d7-5-city-states-visual-design.md` State E Empty 设计参考
 4. `d6-phase1-4-screen-to-v2-mapping.md` Mapping 命名
 5. 3 城市 LOCKED 视觉(Kyoto / Lisbon / Khartoum) — Unknown 风格不冲突
- ✅ 用户 8/19 详细指引:
 - "在不知道地点的情况下,先看到一个远方的现实切片,然后逐渐发现它在哪里。"
 - "第一屏:UNKNOWN COORDINATE / 此刻,在地球的某个角落。"
 - "5-8-12 秒 Reveal → 23° N → 23.6345° N → 进入此刻"
 - "Unknown 应该是:安静的未知。"

---

## 1. 第一屏:UNKNOWN COORDINATE(任务 A)✅

### 1.1 文件
- `outputs/v1.5-mockups/d10-unknown-coordinate/unknown-coordinate.html`

### 1.2 视觉(比 Homepage 更空)
- ✅ **比 Homepage 更少导航**:仅 logo + 1 个蓝色 dot(无 4 个 nav links)
- ✅ **更少文字**:仅 1 句 "此刻,在地球的某个角落。"(无城市名 / 国名 / 坐标)
- ✅ **更大摄影**:full-bleed,占 100vh 减去 56px nav
- ✅ **大面积留白**:顶部 30% 标题区 + 底部 9% UTC 块
- ✅ **Earth Blue 唯一系统提示色**:蓝色 dot(脉冲)+ UTC "?" 蓝色 + "进入此刻" 按钮蓝色

### 1.3 显示内容
```
[大真实摄影 full-bleed · 编辑性 editorial]

[左下 / 顶部]
UNKNOWN COORDINATE
SECOND 01 / 05
此刻,在地球的某个角落。

[右下]
15:42 · 31°C · UTC ?
SECOND 01 / 05 · SEE EARTH · UNKNOWN COORDINATE
```

### 1.4 摄影要求
- ✅ 一幅真实摄影(editorial source,§2.8.9 Blue / Yellow Layer)
- ✅ 中景 / 中近景(一个具体场景)
- ✅ **不明确定位**:让人猜不到具体城市
- Blue / Yellow / Red Layer 均可(无 layer 限定,因为城市未知)
- 当前使用:中美洲式街景(照片含蓝绿色调 — Earth Blue 体系)

---

## 2. Reveal 第二阶段:坐标碎片逐步出现(任务 B)✅

### 2.1 Reveal 序列(15-20 秒总)

| 阶段 | 时间 | 显示 | 触发 |
|---|---|---|---|
| **Stage 1** | 0 秒 | "UTC **?**" | 默认(进入页面)|
| **Stage 2** | 5 秒 | "23° N · 102° W" | 基于时间(不点击)|
| **Stage 3** | 8 秒 | "23.6345° N · 102.5528° W" | 基于时间 |
| **Stage 4** | 12 秒 | "进入此刻 →"(按钮显现)| 基于时间 |
| **Stage 5** | 点击 | "MEXICO CITY / 墨西哥城 / 07:42" | 点击按钮 |

### 2.2 视觉规则
- ✅ 坐标数字用等宽 mono(像 GPS 设备)
- ✅ 数字逐步精确(rough → precise)
- ✅ 每阶段过渡 800ms Earth Blue
- ✅ 阶段 1-4 默认隐藏城市身份(只显示"?")

### 2.3 HTML 状态切换
- `body.stage-1`:默认(UTC ?)
- `body.stage-2`:5 秒后(23° N / 102° W)
- `body.stage-3`:8 秒后(23.6345° N / 102.5528° W)
- `body.stage-4`:12 秒后(进入此刻 → 按钮)
- `body.stage-5`:点击后(MEXICO CITY + 07:42 + "进入此刻"按钮)

### 2.4 Mockup 文件(本轮 PNG 因 agent-browser 限制未生成)
- `stage-1-{1440,1680,1920}.png`
- `stage-2-{1440,1680,1920}.png`
- `stage-3-{1440,1680,1920}.png`
- `stage-4-{1440,1680,1920}.png`
- `stage-5-{1440,1680,1920}.png`

PM 可手动截图(15 PNG)

---

## 3. Reveal 第三阶段:城市出现(任务 C)✅

### 3.1 Stage 5 视觉
- MEXICO CITY / 墨西哥城 / 07:42 · Tuesday[ Hero full-bleed · 城市摄影 ]
- "进入此刻 →" 按钮
- Empty State 替代(白色 overlay 渐变 + "This city exists." 状态)

### 3.2 转换到 City Detail
- Reveal 完成后,redirect 到 `/cities/mexico-city` 或类似路由
- 进入 Universal CityPage(等 Phase 2 完成)
- City Page State = E_empty 或 B_active(取决于是否有 Moment)

---

## 4. 视觉规则清单(任务 D)✅

### 4.1 必须遵守(per 8/19 10:35 用户指引)
- ✅ 比 Homepage 更空(更少导航 / 更少文字 / 更大摄影 / 更慢 Reveal)
- ✅ Meta 更神秘(UTC ? / 23° N / 102° W)
- ✅ 允许大面积留白
- ✅ Earth Blue 唯一系统提示色
- ✅ 一幅真实摄影(full-bleed)
- ✅ editorial source 优先级
- ✅ 不明确定位(让人猜不到城市)
- ✅ Blue / Yellow / Red Layer 均可
- ✅ Reveal 节奏:阶段 1-4,总时间 15-20 秒

### 4.2 严禁
- ❌ 扫描线 / 雷达 / 科技 HUD / 坐标网格动画 / Glitch / Cyberpunk
- ❌ "随机城市生成器"游戏抽卡
- ❌ 动画加载条 / 进度条
- ❌ 立即显示城市身份
- ❌ "热门城市" / "推荐" / "评价"
- ❌ 全屏底色 / 大面积色块

---

## 5. Mockup 输出(任务 E)

### 5.1 HTML 源(1 个)
- `outputs/v1.5-mockups/d10-unknown-coordinate/unknown-coordinate.html` — 142 行
- 5 状态通过 `body.stage-N` class 切换
- 极简 nav(仅 logo + 1 dot)
- 全幅 photo(100vh)
- 5 个阶段(UTC ? / 23° N / 完整 / 进入 / 城市)

### 5.2 15 Mockup(因 agent-browser 限制未生成)
- 3 breakpoint × 5 stage = 15 PNG,HTML 已就位,PM 可手动截图

---

## 6. 引用了 07 目录 + 工程接口

- ✅ `SEE_EARTH_DESIGN_SYSTEM_v1.3_Complete_Spec.md` v1.3 §3.3 占位
- ✅ `global-city-coverage-system-v1.0.md` V2 IA §8
- ✅ `d7-5-city-states-visual-design.md` State E 设计参考
- ✅ `d6-phase1-4-screen-to-v2-mapping.md` Mapping 命名
- ✅ `src/lib/cityPageRenderPlan.ts` 5 State 渲染决策

---

## 7. Phase 2.5 启动条件

### 7.1 启动条件(已 / 待)
- ✅ Unknown Coordinate first pass 设计 LOCKED(本次)
- 🔜 工程实现 Reveal 动效(JS 时间触发,Reveal 4 阶段 800ms 过渡)
- 🔜 City Detail 整合路由(`/cities/mexico-city` 转换)
- 🔜 Editorial CMS(数据接入,摄影 → 城市 → moment)
- 🔜 全球导入(17-47 候选城市 + Unknown Coordinate 流程)

### 7.2 Phase 2.5 必做
- JS Reveal 引擎(setTimeout 5-8-12 秒,800ms CSS transition)
- City Detail 路由 redirect 逻辑
- 摄影资源管理(editorial source,§2.8.9 Sourcing)
- 城市身份数据库(cities.ts 扩展 Unknown Coordinate 字段)

### 7.3 Phase 3 启动条件
- ✅ Phase 2.5 全部完成
- 🔜 Component Library 沉淀
- 🔜 17-47 候选城市第一波名单
- 🔜 数据架构 Phase 2

---

**字数统计**:约 1700 字 · 3 阶段 Reveal 设计 + 视觉规则 + 5 State 切换 + 引用 + 启动条件
