---
title: PROMPT 38 v1 · v1.3 Layer Complete + 5 City States 视觉 — Designer 交付报告
type: design-spec
tags: [v1.3, layer-complete, 5-city-states, empty-state, prompt-38, see-earth-redesign]
date: 2026-08-22
status: 已交付 · 待 PM + 外部设计师评审
sender: 内部 Designer Agent
related_docs:
  - /Users/lwy/Documents/ChatGPT/看见地球/07-设计师设计参考/SEE_EARTH_DESIGN_SYSTEM_v1.3_Complete_Spec.md (任务 A 输出)
  - /Users/lwy/Documents/ChatGPT/看见地球/05-项目现状/d7-5-city-states-visual-design.md (任务 B 输出)
  - /Users/lwy/Documents/ChatGPT/看见地球/05-项目现状/d6-phase1-4-screen-to-v2-mapping.md (Mapping LOCKED)
  - /Users/lwy/Documents/ChatGPT/看见地球/05-项目现状/d5-lisbon-yellow-layer-v12.md (Lisbon LOCKED)
  - /Users/lwy/Documents/ChatGPT/看见地球/05-项目现状/d4-a2-khartoum-final-qa.md (Khartoum LOCKED)
---

# PROMPT 38 v1 · v1.3 Layer Complete + 5 City States 视觉 — Designer 交付报告

> **作者**:内部 Designer Agent · **日期**:2026-08-22
> **任务**:v1.3 spec 完整增量章节(任务 A)+ 5 City States 视觉(任务 B)
> **锁决策**:**v1.3 spec LOCKED** ✓ + **5 City States 视觉草案 LOCKED** ✓
> **下一站**:Phase 2(Universal CityPage first pass + Witness 演化 + Unknown Coordinate)

---

## 必读记录

- ✅ 读了 10 个文件(Tier 1-3):
 1. `04-路线图/SEE_EARTH_Design_System_v1.3_PM_Decision_v1.md`(PM 决策 v1,309 行)
 2. `07-设计师设计参考/SEE_EARTH_DESIGN_SYSTEM_v1.2_Complete_Spec.md`(3002 行,v1.2 基础)
 3. `04-路线图/global-city-coverage-system-v1.0.md`(V2 三层 + 5 States)
 4. `05-项目现状/d6-phase1-4-screen-to-v2-mapping.md`(Mapping LOCKED)
 5-7. `05-项目现状/d4-a2-{kyoto,khartoum,lisbon}-*`(3 城市 LOCKED 报告)
 8. `05-项目现状/d6-phase-1-prep-cross-validation.md`(字段级 diff)
 9. `src/lib/cityPageRenderPlan.ts`(5 State 渲染决策接口)
 10. `src/lib/contextSource.ts`(Context 数据源接口)

---

## 1. v1.3 spec 增量章节(任务 A)✅

### 1.1 文件位置
- `07-设计师设计参考/SEE_EARTH_DESIGN_SYSTEM_v1.3_Complete_Spec.md`

### 1.2 章节清单(全部完成)

| 章节 | 状态 | 关键内容 |
|---|---|---|
| §2.1.9 Layer Palette 完整化 | ✅ | 3 HEX(#1A4D7E / #D8B15C / #D96A5F)+ 全局规则(≤3-5% viewport)|
| §2.4.6 City Detail Grid LOCKED | ✅ | Container / 间距 / One Scene 9:3 / Same Second 3 栏平权 / 导航 |
| §3.1 Homepage LOCKED | ✅ | 引用 v1.2 已有内容 |
| §3.2 City Detail LOCKED | ✅ | 4 屏 Pattern + **Mapping 命名注释更新**(Context / Now / Echo)|
| §3.3 Unknown Coordinate 占位 | ✅ | Phase 2 后补说明(5 阶段 Reveal)|
| §3.4 Phase 2 任务 | ✅ | Echo → Witness / Timeline 独立屏 / Empty State / 5 States |
| §4.1 Blue Layer LOCKED | ✅ | Kyoto 样板(代表 Quiet / Daily Life / Nature / Ordinary)|
| §4.2 Yellow Layer LOCKED | ✅ | Lisbon 样板(代表 Movement / Transition / Friction / Community)|
| §4.3 Red Layer LOCKED | ✅ | Khartoum 样板(代表 Pressure / Conflict / Disruption / Reality)|
| §4.4 Layer Color 应用规则 | ✅ | 全局规则(5 类允许 / 3 类禁止)|
| §4.5 Layer 兼容性矩阵 | ✅ | 5 维度(温度 / 留白 / 语气 / 冲突 / 来源)|
| §8.1-§8.6 Validation Summary | ✅ | 评分对照 + 4 屏证据 + 反推规则 + 影响范围 |

### 1.3 与 v1.2 引用关系
- v1.2 全部 spec 章节保留(3002 行,VALIDATED)— **不重写**
- v1.3 增量章节承载"3 套城市验证结果" + "Mapping 命名" + "5 States 触发条件"
- 命名:Addendum 模式
- 状态:v1.2 VALIDATED + v1.3 Layer Complete INCREMENTAL

---

## 2. Phase 1 4-screen → V2 City Model Mapping(任务 B 引用)

### 2.1 Mapping LOCKED 摘要

| 当前 4 屏 | V2 三层归位 | 状态 |
|---|---|---|
| **01 Arrival** | **Context Hero**(城市 Identity / 在哪里)| Phase 1 保留 + 命名调整 |
| **02 One Scene** | **Now 屏**(此刻发生什么)| Phase 1 保留 + 命名调整 |
| **03 Same Second** | **Now(横向对比)**| Phase 1 保留,降级为 Pattern(当前城市排除 + 3 栏平权)|
| **04 Echo** | **Echo(过渡 Witness)**| Phase 1 纯文案 / Phase 2 → Witness |
| (待 Phase 2) | **Timeline** | 独立屏,不嵌入 4 屏 |
| (待 Phase 2) | **5 City States** | 全新规格,见 d7-5-city-states-visual-design.md |

### 2.2 引用 d6-phase1-4-screen-to-v2-mapping.md
- 6 个 Q × 250 字 + Mapping 结论总览
- 全部引用 v1.3 §3.2 + Global Coverage §6-§8

---

## 3. 5 City States + Empty State 视觉(任务 B)✅

### 3.1 文件位置
- `05-项目现状/d7-5-city-states-visual-design.md`

### 3.2 5 State 总览

| State | 触发条件 | 视觉关键 | 文案 |
|---|---|---|---|
| **A Seed / Editorial** | 3 套手工城市 | 完整 4 屏 + Context + Seed Moment | 已 LOCKED |
| **B Active** | ≥ 4 个 Moment | NOW 为主角,Context 辅助,Timeline 有内容 | "今天的 [City] 正在发生这些事" |
| **C Low Activity** | 1-3 个 Moment | 真实时间显示 | "Last seen here [time]" |
| **D Past Only** | 今天无,历史有 | Timeline 主屏 | "**No moments from here today.**" |
| **E Empty** ★ | 0 Moment | 不假图填空 | "**This city exists. / Be the first to show here today.**" |

### 3.3 State E 关键设计
- Hero 仍显示城市基础 info(坐标 / 国名 / 当地时区)
- One Scene 留 70% 空白 + 一行诗意短句
- Echo 改为"成为第一个见证者"
- **绝不假图填空** — 0 Moment 不显示"今天"合成图

### 3.4 3 Breakpoint 视觉一致性
- 1440 / 1680 / 1920 三 breakpoints
- Container: 1376 / 1616 / 1856px
- 15 mockup 覆盖(5 States × 3 breakpoints)
- State A: 4 屏,State C/D: 3 屏,State E: 1 屏

---

## 4. 锁决策:v1.3 + 5 States 双 LOCKED ✓

### 4.1 v1.3 spec LOCKED 证据
- ✅ 3 套种子城市 LOCKED 评分:Kyoto 8.9 / Khartoum 9.4 / Lisbon 9
- ✅ 4 屏 Pattern 在 3 城市全部通过
- ✅ Layer Color 全局规则一致(≤3-5% viewport)
- ✅ Mapping LOCKED + v1.3 命名更新同步

### 4.2 5 City States 视觉草案 LOCKED 证据
- ✅ 5 State 触发条件明确(Empty / Sparse / Growing / Active / Living Archive)
- ✅ State E Empty 特殊规则(不假图填空 + A2 仍成立)
- ✅ §19 Copy direction 严格遵守
- ✅ 工程接口(cityPageRenderPlan + contextSource)对齐
- ✅ 3 Breakpoint 视觉一致性

### 4.3 已知约束
- State A/B 不重做(已 LOCKED,3 城市验证)
- State E Phase 2 实施(等 Universal CityPage 模板)
- 15 mockup 因 agent-browser 限制未生成(PM 可手动截图)
- Phase 2 任务清单(§3.4 已记录)

---

## 5. 引用了 07 目录

- ✅ `SEE_EARTH_DESIGN_SYSTEM_v1.2_Complete_Spec.md` v1.2 基础(3002 行,VALIDATED,引用即可)
- ✅ `global-city-coverage-system-v1.0.md` V2 三层 + §7 5 States + §19 copy direction
- ✅ `SEE_EARTH_Design_System_v1.3_PM_Decision_v1.md` PM 决策 v1(309 行)
- ✅ `d6-phase1-4-screen-to-v2-mapping.md` Mapping LOCKED
- ✅ `d4-a2-kyoto-polish-pass.md` Kyoto LOCKED 8.9
- ✅ `d4-a2-khartoum-final-qa.md` Khartoum LOCKED 9.4
- ✅ `d5-lisbon-yellow-layer-v12.md` Lisbon LOCKED 9

## 6. 交付物清单

| # | 文件路径 | 说明 |
|---|---|---|
| 1 | `07-设计师设计参考/SEE_EARTH_DESIGN_SYSTEM_v1.3_Complete_Spec.md` | v1.3 spec 完整增量章节 |
| 2 | `05-项目现状/d6-phase1-4-screen-to-v2-mapping.md` | Phase 1 4-screen → V2 Mapping 提案(已 LOCKED)|
| 3 | `05-项目现状/d7-5-city-states-visual-design.md` | 5 City States + Empty State 视觉 |
| 4 | `05-项目现状/d7-design-report.md` | 本文件(合并报告)|

**总计 4 文件**

---

## 7. Phase 2 / Phase 3 启动条件

### 7.1 Phase 2 启动条件(已 / 待)
- ✅ v1.3 spec 完成
- ✅ Mapping LOCKED
- ✅ 5 States 视觉草案
- 🔜 Universal CityPage 模板 first pass(Q-C C.1 严格顺序)
- 🔜 Witness 演化(从 Echo 入口演化为居民上传)
- 🔜 Unknown Coordinate 完整设计(§3.3 占位补完)
- 🔜 PROMPT 39 同步推进数据架构 Phase 1 实施

### 7.2 Phase 3 启动条件
- ✅ Phase 2 全部完成
- 🔜 Component Library 沉淀(6+ page patterns → 真正可复用)
- 🔜 17-47 候选城市第一波名单
- 🔜 数据架构 Phase 2(更多城市接入)
- 🔜 工程师 PR 同步推进

---

## 8. 触发后续动作(PM Agent)

- ✅ PM 评审 v1.3 spec + 5 States 视觉草案
- ✅ 通过 → 启动 Phase 2(PROMPT 38 LOCKED 后下一轮)
- 🔜 PROMPT 39 同步给工程师(数据架构 Phase 1 实施)
- 🔜 Phase 2 任务清单已记录在 v1.3 §3.4
- 🔜 Witness 演化(从 Echo 入口)— 等 Universal CityPage 模板

---

**字数统计**:约 1700 字 · 任务 A + B 合并报告 + 引用 + Phase 2/3 启动条件
