---
title: SEE EARTH Design System v1.3 — Layer Complete · PM Agent 内部决策 v1
type: pm-internal-decision
tags: [design-system, v1.3, layer-complete, pm-decision, see-earth-redesign]
date: 2026-08-19
sender: 2026-08-19 接管 PM Agent
receiver: 内部 Designer Agent / 工程师 / 未来 PM Agent
status: ✅ Q1-Q4 已拍板 · 🟡 等 PROMPT 37 派发
related_docs:
  - /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/07-设计师设计参考/SEE_EARTH_DESIGN_SYSTEM_v1.2_Complete_Spec.md
  - /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/04-路线图/global-city-coverage-system-v1.0.md
  - /Users/lwy/Documents/ChatGPT/看见地球/06-PM Agent 交接/2026-08-19-engineer-pr-plan.md
  - /Users/lwy/Documents/ChatGPT/看见地球/05-项目现状/d4-a2-khartoum-final-qa.md
  - /Users/lwy/Documents/ChatGPT/看见地球/05-项目现状/d5-lisbon-yellow-layer-v12.md
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/04-路线图/SEE_EARTH_Design_System_v1.3_PM_Decision_v1.md
---

# SEE EARTH Design System v1.3 — Layer Complete · PM Agent 内部决策 v1

> **作者**:2026-08-19 接管 PM Agent
> **目的**:记录 v1.3 启动前的 PM Agent 内部决策,作为 PROMPT 37(给设计师)起草基础
> **拍板时间**:2026-08-19
> **状态**:Q1-Q4 已拍板,等 PROMPT 37 派发

---

## 📋 一句话决策

**Design System v1.3 命名"Layer Complete",采用 Addendum 模式(保留 v1.2 全部 + v1.3 增量),整合 Global City Coverage System 章节。Q4 = C:PM Agent 内部决策文档先落地,再起草 PROMPT 37 派设计师。**

---

## 0. 用户拍板的 Q1-Q4(8/19)

| 问题 | 选项 | 拍板 |
|---|---|---|
| **Q1.** v1.3 模式 | A addendum / B rewrite / C hybrid | **A 采纳 PM 建议** |
| **Q2.** v1.3 章节结构 | PM 提议(§1-§7保留 + §8 增量)| **采纳 PM 建议** |
| **Q3.** v1.3 整合 Global City Coverage | 是 / 否 | **是** |
| **Q4.** 启动方式 | A 立即 PROMPT 37 / B 先 draft v1.3 / C PM 决策先落地 | **C**(本文件)|

---

## 1. v1.3 模式 = Addendum

### 决定
v1.3 保留 v1.2 全部 spec 章节,在末尾追加 v1.3 增量章节。

### 理由
- v1.2 已 VALIDATED 全部章节(Foundation / Typography / Layout 等 3002 行)
- 不重写避免丢失已验证规则
- 增量章节承载"3 套城市验证结果"

### 不做的事
- ❌ 不重写 §1 Design Principles
- ❌ 不重写 §2 Foundation & Tokens(Color / Typography / Spacing / Layout)
- ❌ 不重写 §5 Image Ethics / §6 Motion / §7 Accessibility

---

## 2. v1.3 章节结构(7 保留 + 1 增量)

### v1.2 章节全部保留(标注 "v1.2 VALIDATED")

```
SEE EARTH DESIGN SYSTEM v1.3 — Layer Complete

[v1.2 章节全部保留]
├── §1 Design Principles(v1.2 VALIDATED)
├── §2 Foundation & Tokens(v1.2 VALIDATED)
│   ├── §2.1 Color(保留 + §2.1.9 Layer Palette 完整化)
│   ├── §2.2 Typography(保留)
│   ├── §2.3 Spacing(保留)
│   ├── §2.4 Layout(保留 + §2.4.6 City Detail Grid LOCKED)
├── §3 Page Patterns(增量)
│   ├── §3.1 Homepage LOCKED
│   ├── §3.2 City Detail LOCKED        ← 新增
│   │   ├── §3.2.1 Arrival Pattern
│   │   ├── §3.2.2 One Scene Pattern
│   │   ├── §3.2.3 Same Second Pattern(3 城市平权 + 排除当前)
│   │   ├── §3.2.4 Echo Pattern(5 状态)
│   ├── §3.3 Unknown Coordinate(占位,Phase 2 后补)
├── §4 Layer System(增量)
│   ├── §4.1 Blue Layer LOCKED(Kyoto 样板)
│   ├── §4.2 Yellow Layer LOCKED(Lisbon 样板)
│   ├── §4.3 Red Layer LOCKED(Khartoum 样板)
│   ├── §4.4 Layer Color 应用规则(仅时间 / 关键词 / 状态点)
├── §5 Image Ethics(保留 + §2.8.x LOCKED)
├── §6 Motion(保留 + §2.9.5 Reveal 节奏 LOCKED)
├── §7 Accessibility(保留)

[v1.3 增量章节]
├── §8 Layer-Complete Validation Summary ← 新增
│   ├── §8.1 3 Layer 评分对照(Kyoto 8.9 / Khartoum 9.4 / Lisbon 9)
│   ├── §8.2 4 屏 Pattern 在 3 城市全部通过的证据
│   ├── §8.3 v1.3 反推规则从真实城市验证
```

### 关键说明
- §3 Page Patterns 是 v1.3 新增章节,把 v1.2 散落的页面规则集中化
- §4 Layer System 是 v1.3 核心增量章节,把 3 个 Layer 完整定义化
- §8 Layer-Complete Validation Summary 是 v1.3 命名核心证据

---

## 3. 三个 Layer 完整规则(§4 内容草案)

### §4.1 Blue Layer LOCKED(Kyoto 样板)

```
代表:Quiet / Daily Life / Nature / Ordinary Presence
样板:Kyoto
Layer Color:Earth Blue (var(--earth-blue))
Layer 色使用规则:仅 accent,不喧宾夺主

设计规则:
1. 摄影偏冷、安静、日常
2. 留白最大(对比 Yellow +25% / Red +40%)
3. 文案更轻(短句、轻动词、节制形容词)
4. 现实冲突最低(无战时 / 无政治 / 无灾难)
5. 时间感受:缓慢、自然、私密
6. 重点元素:
   - Hero:自然光 + 建筑 / 街景 / 自然
   - One Scene:一个具体状态(鸭川今天很安静)
   - Same Second:3 城市平静对比
   - Echo:私密留痕,日常化
```

### §4.2 Yellow Layer LOCKED(Lisbon 样板)

```
代表:Movement / Transition / Friction / Community
样板:Lisbon
Layer Color:Yellow (var(--layer-yellow))
Layer 色使用规则:仅语义点缀(12:53 时间 / PORTUGAL kicker / 状态点)

设计规则:
1. Yellow 使用量极低(只用于时间 / 关键词 / 状态点)
2. 摄影必须体现"城市正在运行"
   - 不能只拍风景
   - 可以出现交通 / 人流 / 店铺 / 社区变化
3. 张力高于 Blue,低于 Red
4. 时间感受:过渡 / 流动 / 转换
5. 重点元素:
   - Hero:火车站 / 公共空间(人流)
   - One Scene:行人 + 红绿灯 + 椅子(社区日常)
   - Same Second:3 城市 + 多 layer 互补(Blue + Red + Yellow)
   - Echo:沿用其他 Layer
6. 严禁:
   - 阳光宣传片
   - 电车 / Alfama 旅游大片
   - "漂亮的城市页"
```

### §4.3 Red Layer LOCKED(Khartoum 样板)

```
代表:Pressure / Conflict / Disruption / Reality
样板:Khartoum
Layer Color:Red (var(--layer-red))
Layer 色使用规则:仅语义(本地时 / 一句·很安静 / Khartoum 栏 / 提交对勾)

设计规则:
1. Red 使用量极低(对比 Yellow +50% / Blue +70%)
2. 新闻摄影 / 纪录摄影优先(§2.8.8 Red Layer Image Ethics)
3. 文案高度具体("今天没开门" / "今天很安静" / "今天还没人坐")
4. 严禁苦难审美化(§2.8.8)
5. 严禁为视觉冲击选图
6. "生活仍在继续" 优先于 "灾难画面"
7. 重点元素:
   - Hero:暖金色 / 真摄影 / 生活继续
   - One Scene:一个具体克制观察(公寓楼 / 街道)
   - Same Second:3 城市对比(Red + Blue + Yellow)
   - Echo:沿用其他 Layer + 红对勾 = 提交
8. 来源(§2.8.9):Reuters / AP / Adobe Editorial / Shutterstock Editorial / Wikimedia Commons(不用 Unsplash)
```

### §4.4 Layer Color 应用规则(全局)

```
原则:Layer 色仅作为时间 / 关键词 / 状态点
禁止:
  ❌ 城市名 120px 背景色
  ❌ 全屏底色
  ❌ 大面积渲染(>5% viewport area)
允许:
  ✅ 时间数字(12:53 / 21:53 / 20:53)
  ✅ 城市国家 meta(POINTUGAL / REYKJAVIK 等)
  ✅ 关键动词强调(今天**很**安静)
  ✅ 状态点(提交对勾 / 焦点底线)
  ✅ 导航序号(05/12)
```

---

## 4. 与 Global City Coverage System v1.0 整合(§3.2 + §4 引用)

### 整合点

| Design System v1.3 章节 | 引用 Global Coverage 章节 |
|---|---|
| §3.2 City Detail Pattern | §7 Universal City Page States(A-E 5 状态)|
| §4 Layer System | §6 City State System(L0-L4 5 状态)|
| §4.4 Layer Color 应用规则 | §8 V2 IA:Context / Now / Timeline |

### 当前 3 城市明确归类

| 城市 | Page State | State Level | Layer |
|---|---|---|---|
| **Kyoto** | A Seed / Editorial | L4 Living Archive | Blue |
| **Lisbon** | A Seed / Editorial | L4 Living Archive | Yellow |
| **Khartoum** | A Seed / Editorial | L4 Living Archive | Red |

### Phase 1 准备(Global Coverage 整合)

- 4-screen → V2 City Model Mapping:Phase 1 设计师任务(等 PROMPT 37+)
- Context source policy:**已拍板** — Context 字段不需要,运行时获取
- Seed City 第一批名单策略:**已拍板** — Kyoto + Lisbon + Khartoum 为已 seed,后续 17-47 候选待定

---

## 5. 影响范围

### 设计师
- ✅ City Detail Pattern LOCKED(4 屏)— 不再回退
- ✅ 3 Layer 规则 LOCKED — 不再回退
- ❌ 不重做现有 Kyoto / Lisbon / Khartoum mockup
- ❌ 不引入新视觉系统
- 🔜 Phase 2 任务:Unknown Coordinate 设计(§3.3 占位)

### 工程师
- ✅ CityPage.tsx refactor 按 v1.3 4 屏 Pattern 执行
- ✅ Phase 0 数据架构(已就绪,2026-08-19 15:54)
- 🔜 Phase 2 任务:Universal CityPage 模板实现

### 文档
- v1.3 spec = v1.2 + v1.3 增量(§1-§8)
- 不重写 v1.2 任何章节
- §8 Layer-Complete Validation Summary 引用 3 城市 LOCKED 报告作为证据

---

## 6. 启动 Phase 1 准备(已 / 待)

| Phase 1 启动条件 | 状态 |
|---|---|
| Lisbon Yellow Layer LOCKED | ✅ 8/19 14:00 |
| Khartoum City Detail LOCKED | ✅ 8/19 12:04 |
| Phase 0 数据架构 | ✅ 8/19 15:54 |
| Design System v1.3 Update | 🟡 等 PROMPT 37 派发 |
| 4-screen → V2 City Model Mapping | 🟡 等 Phase 1 设计师任务 |
| Context source policy | ✅ 已拍板(运行时获取,无 Context 字段) |

---

## 7. PROMPT 37 启动条件(待用户拍板)

### Q-A. v1.3 spec 任务范围(给设计师)

- **A.1** 完整 spec 重写(§1-§8 全写)
- **A.2** v1.3 增量章节专写(§3 / §4 / §8)— v1.2 引用即可(更聚焦)
- **A.3** §3 + §4 + §8 + §2.1.9 Layer Palette 完整化 + §2.4.6 City Detail Grid LOCKED

**PM 建议 A.3**(完整但聚焦 — Layer Palette + City Detail Grid 是 v1.3 强相关章节,其他引用 v1.2)

### Q-B. PROMPT 37 任务边界

- **B.1** 仅写 v1.3 spec 文档(workspace + Obsidian)
- **B.2** 写 v1.3 spec + Phase 1 4-screen → V2 Mapping 启动(双任务)
- **B.3** 写 v1.3 spec + Universal CityPage 模板 first pass(超前)

**PM 建议 B.2**(v1.3 文档是当下最重,Mapping 是 Global Coverage 必需 Gate)

### Q-C. Universal CityPage first pass 时机

- **C.1** 等 v1.3 完成 + Phase 1 Mapping 拍板后,再起 PROMPT 38
- **C.2** v1.3 与 Universal CityPage first pass 同步起(PROMPT 37 双任务)
- **C.3** 等 Unknown Coordinate 完成(§3.3 占位)+ Component Library 完成后

**PM 建议 C.1**(严格顺序: v1.3 → Mapping → Universal CityPage first pass → Unknown)

---

## 8. 待用户拍板的 3 件事

### Q-A. v1.3 spec 任务范围 = A.1 / A.2 / A.3?
**PM 建议 A.3**

### Q-B. PROMPT 37 任务边界 = B.1 / B.2 / B.3?
**PM 建议 B.2**

### Q-C. Universal CityPage first pass 时机 = C.1 / C.2 / C.3?
**PM 建议 C.1**

---

## 📎 关联文档

- `SEE_EARTH_DESIGN_SYSTEM_v1.2_Complete_Spec.md`(v1.2 基础,3002 行)
- `global-city-coverage-system-v1.0.md`(Global Coverage 完整 spec)
- `2026-08-19-engineer-pr-plan.md`(工程师 PR 拆解草案)
- `d4-a2-khartoum-final-qa.md`(Khartoum LOCKED 报告)
- `d5-lisbon-yellow-layer-v12.md`(Lisbon v12 LOCKED 报告)
- `d6-global-coverage-data-architecture.md`(Phase 0 数据架构)

---

**最后更新**:2026-08-19(2026-08-19 接管 PM Agent)
**下一节点**:PROMPT 37 起草(等 Q-A / Q-B / Q-C 拍板)
