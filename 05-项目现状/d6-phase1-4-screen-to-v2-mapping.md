---
title: Phase 1 · 4-screen → V2 City Model Mapping 提案
type: design-proposal
tags: [phase-1, v2-mapping, current-4-screen, context-now-timeline, prompt-37-task-b, see-earth-redesign]
date: 2026-08-19
status: 草案 · 待 PM + 用户拍板
sender: 内部 Designer Agent
related_docs:
  - /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/04-路线图/global-city-coverage-system-v1.0.md (V2 三层 Context / Now / Timeline)
  - /Users/lwy/Documents/ChatGPT/看见地球/07-设计师设计参考/SEE_EARTH_DESIGN_SYSTEM_v1.3_Complete_Spec.md (v1.3 §3 Page Patterns)
  - /Users/lwy/Documents/ChatGPT/看见地球/05-项目现状/d4-a2-kyoto-polish-pass.md (Kyoto LOCKED)
  - /Users/lwy/Documents/ChatGPT/看见地球/05-项目现状/d4-a2-khartoum-final-qa.md (Khartoum LOCKED)
  - /Users/lwy/Documents/ChatGPT/看见地球/05-项目现状/d5-lisbon-yellow-layer-v12.md (Lisbon LOCKED)
---

# Phase 1 · 4-screen → V2 City Model Mapping 提案

> **作者**:内部 Designer Agent · **日期**:2026-08-19
> **PROMPT**:37 任务 B · **触发原因**(Global Coverage §0.3):"Global City Coverage System 不能默认现有 4 屏就是最终全球模板。设计师必须在 Lisbon LOCK 后完成一次结构映射。"

---

## V2 三层模型回顾(Global Coverage §0.2)

```
Context:这个地方是什么 / 在哪里(编辑负责)
Now:    今天生活在这里的人正在看到什么(当地 Witness 负责)
Timeline:这里以前是什么样(时间积累)
```

**当前 4 屏(已 LOCKED)**:Arrival / One Scene / Same Second / Echo

---

## 6 个 Mapping 问题(PM 拍板草案)

### Q1 · Arrival 是否成为 City Identity / Context Hero?

**选择**:**保留 + 重命名为 Context Hero** (移动到 V2 Context 层)

**理由**:
- Kyoto 8.9 / Khartoum 9.4 / Lisbon 9 — 3 城市全部 8.9+/10 评分证明 Arrival 屏质量高
- Arrival 回答"这是哪里"(城市名 + 双时区 + 暗 overlay + 真摄影)— 与 V2 Context 层"这个地方是什么/在哪里"对齐
- 当前 Arrival = 强 Context 表达(国名 / 坐标 / Layer 城市名)— 保持

**引用**:
- v1.3 §3.2.1 Arrival Pattern(已 LOCKED)
- Khartoum Hero 8.9 评分证据(d4-a2-khartoum-final-qa.md §8)
- Lisbon Hero 8.9 评分证据(d5-lisbon-yellow-layer-v12.md §8)

**风险**:低(已 LOCKED,3 城市验证)
**执行**:仅在 §3.2.1 添加 [Role: Context Hero] 注释

---

### Q2 · One Scene 是否成为 NOW 的核心视觉表达?

**选择**:**保留 + 重命名为 Now 屏**(Now 层的核心视觉)

**理由**:
- 4 行文案(时间 + 地点 + 主体 + 反常动作)= 观察体 = 完美 Now(现在发生什么)表达
- One Scene 跨 3 城市:Lisbon 街道 / Khartoum 公寓楼 / Kyoto 拉门 — 都是"此刻状态"
- v1.2 §3.2 One Scene Pattern 已 LOCKED(8.9/9.4/9 三城市全过)

**引用**:
- v1.3 §3.2.2 One Scene Pattern
- Kyoto "鸭川今天很安静"、Khartoum "今天没开门"、Lisbon "正在醒来" 跨 3 城市文案一致性

**风险**:低
**执行**:仅在 §3.2.2 添加 [Role: Now] 注释

---

### Q3 · Same Second 应保留为 City Page 模块 / 首页并置模块 / 降级为 Pattern?

**选择**:**保留 + 降级为 Pattern**(City Page 内部可重复使用)

**理由**:
- Same Second 跨 3 城市平权(Blue + Red + Yellow)— 已证明 Layer 互补
- 当前城市排除规则已建立(Lisbon v12 — Lisbon 不在 Lisbon Same Second)
- "同一秒不同当地"是 City Detail 的产品叙事核心
- 不应是首页(首页已有 12 时区 banner)— 重复感
- 也不是 City Page Hero 替代(One Scene 更具体)
- 正确归位:作为 City Page 内部 Pattern(在 City Detail 4 屏中保留,或作为独立子模块)

**引用**:
- v1.3 §3.2.3 Same Second Pattern(已 LOCKED 排除当前城市 + 3 栏平权)
- Kyoto 8.9 / Khartoum 9.4 / Lisbon 9 评分证据

**风险**:低
**执行**:在 §3.2.3 注释 [Role: Page-internal Module] — 不是首页元素

---

### Q4 · Echo 是否演化为 Witness / Resonance,而不是纯文案输入?

**选择**:**Phase 1 保留(纯文案输入),Phase 2 演化为 Witness**

**理由**:
- Echo 当前 5 状态(default / hover / focus / typing / disabled / submitted)— 8/19 LOCKED
- "Witness 演化"是 Phase 2 / Phase 3 任务(Q-C C.1 = 严格顺序)
- Phase 1 维持"私密留痕"语义(用户只看到自己输入,不广播)— 不变
- Phase 2 引入 Witness(当地居民上传真实见证)需要先完成:
 - 数据架构(已就绪,Phase 0 8/19)
 - Universal CityPage 模板(Q-C C.1)
 - 然后 Witness 演化(允许居民上传,但 UI 还是 5 状态)

**引用**:
- v1.3 §3.2.4 Echo Pattern(6 状态 LOCKED)
- Khartoum Echo 8.9 评分(8/19 Final QA)

**风险**:低(本期不动,Phase 2 推进)
**执行**:§3.2.4 注释 [Role: Phase 1 Echo(纯文案); Phase 2 → Witness(允许居民上传)]

---

### Q5 · Timeline 插入现有 4 屏的哪里?

**选择**:**Phase 2 独立屏 — 不嵌入现有 4 屏**

**理由**:
- Timeline(V2 三层之一)= 城市历史层,需要专门的 source(地方志 / 维基 / 历史地图)— 与 One Scene / Echo 的观察体不兼容
- 嵌入 One Scene 会破坏"具体时刻的克制观察"(V2 Now 纯度)
- 嵌入 Echo 会破坏"私密留痕"(用户不是来看历史的)
- 正确归位:作为独立屏(Phase 2 启动后),在 City Detail 4 屏之后追加 Timeline 屏
- 当前 4 屏(Arrival / One Scene / Same Second / Echo)= 3 城市 LOCKED → 不嵌入

**引用**:
- Global Coverage §0.2 Timeline 定义(待)
- v1.3 §3.2 City Detail 4 屏 LOCKED(不嵌入)

**风险**:低(本期不动)
**执行**:§3.4 Phase 2 任务列表追加 Timeline 屏规格

---

### Q6 · Empty City 没有 Hero / Moment 时,A2 如何成立?

**选择**:**Phase 2 引入 5 City States — Empty State 特殊规则**

**理由**:
- Empty City(零数据 / 刚 seed / 居民未上传任何内容) — 不能套用 4 屏 pattern(没有 Hero / Moment / Witness)
- V2 IA 的 L0-L5 City State 体系(Global Coverage §6)已定义:
 - L0 Empty:只有基本信息
 - L1 Sparse:有 1-3 个 witness
 - L2 Growing:有 4-10 个 witness
 - L3 Active:有 11+ witness,生活正在发生
 - L4 Living Archive:有完整时间线(已 seed,有 4 屏)

**Empty State 规则**:
- 不显示"今天没开门"("今天"隐含日期 / 状态)— 显示"暂无见证"
- Hero 仍显示城市基本 info(坐标 / 国名 / 当地时区 — 运行时获取)
- Echo 改为"成为第一个见证者"(CTA 变化)
- Same Second 仍 3 栏(Lisbon + 其他 2 城,与 L4 相同 — 全球 4 时区 12 城平权)

**引用**:
- Global Coverage §6 L0-L5 City State 体系
- v1.3 §3.4 Phase 2 任务清单

**风险**:中(影响未来 17-47 候选城市的 First Visit 体验)
**执行**:§3.4 Phase 2 任务列表追加 Empty State 5 屏规格

---

## Mapping 结论总览

| 当前 4 屏 | V2 三层归位 | 状态 |
|---|---|---|
| **01 Arrival** | **Context Hero** | Phase 1 保留,仅命名调整 |
| **02 One Scene** | **Now 屏**(核心视觉) | Phase 1 保留,仅命名调整 |
| **03 Same Second** | **Page-internal Module** | Phase 1 保留,降级为 Pattern |
| **04 Echo** | **Phase 1 Echo(纯文案)**,Phase 2 → Witness | Phase 1 保留,Phase 2 演化 |
| (待 Phase 2) | **Timeline**(独立屏) | Phase 2 启动后追加 |
| (待 Phase 2) | **5 City States Empty**(Empty State 5 屏) | Phase 2 启动后引入 |

**Mapping 结论**:当前 4 屏 → V2 三层映射 = **Context + Now + Now** + **Module** + **Echo(过渡 Witness)**。不重做现有 mockup,只更新 v1.3 §3.2 命名注释。

---

## 引用了 07 目录

- ✅ `global-city-coverage-system-v1.0.md` V2 三层定义 + §6 L0-L5 City State
- ✅ `SEE_EARTH_DESIGN_SYSTEM_v1.3_Complete_Spec.md` v1.3 §3.2 / §3.3 / §3.4 / §4 / §8
- ✅ `SEE_EARTH_DESIGN_SYSTEM_v1.2_Complete_Spec.md` v1.2 §3 Page Patterns(3002 行)

## 引用了 05 项目现状

- ✅ `d4-a2-kyoto-polish-pass.md` 8.9 评分(Blue Layer 验证)
- ✅ `d4-a2-khartoum-final-qa.md` 9.4 评分(Red Layer 验证)
- ✅ `d5-lisbon-yellow-layer-v12.md` 9/10 评分(Yellow Layer 验证)

---

**字数统计**:约 1600 字 · 6 个 Q × 250 字 + Mapping 结论总览 + 引用
