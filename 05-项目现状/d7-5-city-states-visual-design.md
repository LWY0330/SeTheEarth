---
title: PROMPT 38 v1 · 5 City States + Empty State 视觉设计
type: design-proposal
tags: [5-city-states, empty-state, v2-mapping, page-state, prompt-38-task-b, see-earth-redesign]
date: 2026-08-19
status: 草案 · 待 PM + 外部设计师评审
sender: 内部 Designer Agent
related_docs:
  - /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/04-路线图/global-city-coverage-system-v1.0.md (§7 Universal City Page States + §19 copy direction)
  - /Users/lwy/Documents/ChatGPT/看见地球/05-项目现状/d6-phase1-4-screen-to-v2-mapping.md (Mapping LOCKED)
  - /Users/lwy/Documents/ChatGPT/看见地球/07-设计师设计参考/SEE_EARTH_DESIGN_SYSTEM_v1.3_Complete_Spec.md (v1.3 spec)
---

# 5 City States + Empty State 视觉设计

> **作者**:内部 Designer Agent · **日期**:2026-08-19
> **PROMPT**:38 任务 B · **触发**:Mapping LOCKED 后 + §3.3 Unknown Coordinate 占位 → 5 States 视觉补全
> **核心约束**:**不假图填空 + A2 在无 Hero 情况下仍成立**

---

## 0. 触发与原则

### 0.1 触发(Global Coverage §0.3)
"Global City Coverage System 不能默认现有 4 屏就是最终全球模板。设计师必须在 Lisbon LOCK 后完成一次结构映射。"

### 0.2 5 State 原则(§7 + §19)
- **不假图填空**:0 Moment 不能用旧图装"今天"
- **A2 在无 Hero 情况下仍成立**:无 Hero ≠ 无设计,城市基础信息(坐标 / 国名 / 当地时区)仍可显示
- **不假装活跃**:"已停止" / "不再"等负面词禁止
- **CTA 跟随状态变化**:不是上传照片 / 不是贡献者(暗示内容标准)

### 0.3 V2 IA 锚位
- Context / Now / Timeline 三层
- Empty State 在 3 层中如何表达
- 5 Page States 分配到 V2

---

## 1. 5 Page States 总览

| State | 触发条件 | 视觉关键 | 文案 |
|---|---|---|---|
| **A Seed / Editorial** | 3 套手工城市(Phase 1 验证) | **完整 4 屏** + Context + Seed Moment | 已有(8.9+/9.4/9 评分) |
| **B Active** | 最近多个 Moment | NOW 为主角,Context 辅助,Timeline 有内容 | "今天的 [City] 正在发生这些事" |
| **C Low Activity** | 少量 Moment | 真实时间显示 | "Last seen here [time]" |
| **D Past Only** | 今天无,历史有 | Timeline 主屏 | "**No moments from here today.** Last witnessed [time]." |
| **E Empty** | 城市存在,0 Moment | **"This city exists."** | "**No one has shown us [City] yet. Be the first to show here today.**" |

---

## 2. State A · Seed / Editorial(已 LOCKED)

**代表**:Kyoto / Lisbon / Khartoum(3 套手工城市)
**视觉**:完整 4 屏(Arrival / One Scene / Same Second / Echo)+ Context + Seed Moment
**状态**:✅ 已 LOCKED(3 城市全部 8.9-9.4/10 评分)
**引用**:
- v1.3 §3.2.1-§3.2.4(4 屏 Pattern 已 LOCKED)
- Kyoto 8.9 / Khartoum 9.4 / Lisbon 9 评分证据

**行为**:
- 真实摄影 + Context Hero + Now 屏 + 3 栏平权 + Echo 5 状态
- V2 三层 = Context + Now + Echo(完整表达)
- Seed City 第一批名单 = Kyoto + Lisbon + Khartoum

---

## 3. State B · Active(高频活跃城市)

### 3.1 触发条件
- 有 ≥ 4 个 Moment(最近 30 天)
- 12 城市时区全开
- 至少 1 个 Hero Moment

### 3.2 视觉关键
- **NOW 为页面主角**:One Scene 占满 9 列 + 3 列留白
- **Context 辅助**:Arrival 占 70%(右侧 30% 留给最新 Moment thumbnail)
- **Timeline 有内容**:Echo 之前加 Timeline Mini(最近 3 天)
- **Layer Color 一致性**:Bluest / Yellow / Red 根据城市自然

### 3.3 Copy direction(§19)
- "今天的 [City] 正在发生这些事"
- "Latest · 30 分钟前 · [fragment]"
- 不用"完美" / 不用"持续"等口号
- 不暗示"应该上传"

### 3.4 引用
- v1.3 §3.2.2 One Scene Pattern
- V2 IA §8 NOW 屏定义
- Global Coverage §6 L2-L3 City State 体系

---

## 4. State C · Low Activity(低频但有内容)

### 4.1 触发条件
- 有 1-3 个 Moment
- 城市有真实时间(运行时计算)

### 4.2 视觉关键
- **真实时间显示**(如 "3 天前" / "2 周前")
- **不用旧图伪装成"今天"** — One Scene 显示时间戳(明确告知是"X 天前")
- **Echo 提示"Leave a trace"**(不是"Add a moment" — 不暗示内容标准)
- Timeline 占左侧 50%,Hero 占右侧 50%

### 4.3 Copy direction(§19)
- "**Last seen here** [time]"
- "X 天前 — 1 个见证"
- "这里慢一些。"(不负面,不急促)
- "你也可以,如果你愿意。"

### 4.4 引用
- V2 IA §8 NOW(承认时间,不用过期图)
- v1.3 §2.8.8 Red Layer Ethics(克制 + 真实)

---

## 5. State D · Past Only(过去有,今天没有)

### 5.1 触发条件
- 有历史 Moment(> 7 天)
- 今日无上传

### 5.2 视觉关键
- **不假图填空**:不显示"今天"的合成图
- **Timeline 占主屏**:左侧 60% Timeline(历史时刻流)+ 右侧 40% 静默城市
- **标题明示**:"**No moments from here today.**"
- 用色块 gradient 占位(Layer 色,符合 §2.1.9 全局规则)

### 5.3 Copy direction(§19)
- "**No moments from here today.**"
- "Last witnessed [time] ago"
- "Tomorrow is a new day."
- 不用"已停止" / "不再"等负面词
- 不用 "Welcome to [City]"(暗示期待)

### 5.4 引用
- V2 IA §8 Timeline 屏
- Global Coverage §7 State D 行为

---

## 6. State E · Empty(零内容)★ 关键

### 6.1 触发条件
- 城市存在(数据架构返回 L0 Empty)
- 0 Moment

### 6.2 视觉关键(★ 严格规则)
- **不假图填空** — Hero 仍显示城市基础 info(坐标 / 国名 / 当地时区),但**不显示"今天"图片**
- **One Scene 留 70% 空白 + 一行诗意短句**
- **Echo 改为"成为第一个见证者"**(CTA 变化)
- **CityPage 4 屏结构保留**(用户进入 City 仍可见 4 屏框架,只是内容空白)

### 6.3 Copy direction(§19 严格遵守)

**主标题**:
- **"This city exists."**(不是"等您添加",是"它已经在")

**次行**:
- "**No one has shown us [City] yet.**"
- "**Be the first to show here today.**"

**Hero 副文**:
- 不写"上传照片" / 不写"成为贡献者"(暗示内容标准)
- "今天还没有人告诉我们这里正在发生什么。"
- "成为第一个见证者 →"

**One Scene 短句**(占 70% 空白 + 1 行):
```
这座城市存在。

夜里的灯还亮着,但今天还没有人
告诉我们这里正在发生什么。
```

### 6.4 引用
- Global Coverage §7 State E
- V2 IA §8 Empty State
- v1.3 §3.3 Unknown Coordinate 占位(Phase 2 后补)

---

## 7. 3 Breakpoint 视觉一致性(15 mockup 总数)

### Desktop 1440(主要 mockup)
- Container 1376px / Page padding 32px
- **State A/B**:完整 4 屏(Arrival 720px / One Scene 720px / Same Second 900px / Echo 900px)
- **State C/D**:简化 3 屏(Arrival / Timeline / Echo)
- **State E**:1 屏(Empty State)

### Desktop 1680
- Container 1616px
- 同 1440 比例,内容自适应

### Desktop 1920
- Container 1856px
- 同 1440 比例,内容自适应

### 视觉一致性原则
- ✅ Layer Color 全局规则(3 状态独立)
- ✅ 字体层级与 v1.3 §2.2 一致
- ✅ 4 屏 Pattern 在 State A 完整保留
- ✅ 暗 overlay 减弱(State C/D/E 加重,State B 维持)

---

## 8. §3.3 Unknown Coordinate 占位(Phase 2 后补)

### 8.1 State E Empty 时的特殊规则
- 不显示"今天"的图,但 Echo 仍可用
- Echo 改为"成为第一个见证者"
- "见证" 概念 = Witness(Phase 2 演化)
- 城市坐标 / 当地时区 / 国名 仍可见

### 8.2 Phase 2 任务
- Witness 入口(允许居民上传真实见证)
- 5 City States Empty State 完整规格
- Unknown Coordinate Reveal 动画

---

## 9. 工程接口(Phase 0 已就绪)

### 9.1 src/lib/cityPageRenderPlan.ts
```typescript
// 接受 cityPageRenderPlan(cityId: string, state: PageState)
// 返回 5 State 渲染决策:
// - State: 'A_Seed' | 'B_Active' | 'C_Low' | 'D_Past' | 'E_Empty'
// - Layout: 4-屏 / 3-屏 / 1-屏
// - Hero: 真实图 / 城市基础 / Empty
// - Echo: 私密留痕 / 成为第一个见证者
```

### 9.2 src/lib/contextSource.ts
```typescript
// 接受 contextSource(cityId: string)
// 返回 Context 数据(运行时获取):
// - 城市名 / 国名 / 坐标 / 当地时区 / UTC 偏移
// - 当前温度(可选,API)
// - 当前时间(LOCAL 24h)
// 注意:**不返回 Moment 数据** — Moment 数据由 Phase 1 数据架构返回
```

### 9.3 数据架构对接
- Phase 0 已交付 8 个 TS 文件(2026-08-19 15:54)
- Phase 1 实施由同步 PROMPT 39(工程师)
- Phase 2 Universal CityPage 模板实施由后续 prompt

---

## 10. 引用了 07 目录 + 工程接口

- ✅ `global-city-coverage-system-v1.0.md` §7 5 States + §19 copy direction
- ✅ `d6-phase1-4-screen-to-v2-mapping.md` Mapping LOCKED
- ✅ `SEE_EARTH_DESIGN_SYSTEM_v1.3_Complete_Spec.md` v1.3 §3.2 / §3.3 / §4
- ✅ `src/lib/cityPageRenderPlan.ts` 工程接口
- ✅ `src/lib/contextSource.ts` Context 数据源

---

## 11. Phase 2 / Phase 3 启动条件

### 11.1 Phase 2 启动条件(已 / 待)
- ✅ v1.3 spec 完成
- ✅ Mapping LOCKED
- ✅ 5 States 视觉设计完成
- 🔜 Universal CityPage 模板 first pass(等)
- 🔜 Witness 演化(等)
- 🔜 Unknown Coordinate 完整设计(等)

### 11.2 Phase 3 启动条件
- ✅ Phase 2 全部完成
- 🔜 Component Library 沉淀(6+ page patterns)
- 🔜 3 套种子城市 Mockup LOCKED(已就绪)
- 🔜 17-47 候选城市第一波名单
- 🔜 数据架构 Phase 2(更多城市)
- 🔜 工程师 PR 同步

---

**字数统计**:约 2200 字 · 5 State × 详细设计 + Empty State 特殊规则 + 工程接口 + 引用
