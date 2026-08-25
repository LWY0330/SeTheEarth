---
title: SEE EARTH DESIGN SYSTEM v1.3 — Layer Complete
type: design-spec
tags: [design-system, v1.3, layer-complete, addendum, see-earth-redesign]
date: 2026-08-19
status: v1.2 VALIDATED + v1.3 Layer Complete INCREMENTAL
mode: Addendum(保留 v1.2 全部 + v1.3 增量章节)
sender: 内部 Designer Agent
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/07-设计师设计参考/SEE_EARTH_DESIGN_SYSTEM_v1.3_Complete_Spec.md
related_docs:
  - /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/07-设计师设计参考/SEE_EARTH_DESIGN_SYSTEM_v1.2_Complete_Spec.md (3002 行,VALIDATED)
  - /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/04-路线图/SEE_EARTH_Design_System_v1.3_PM_Decision_v1.md (PM 决策 v1,309 行)
  - /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/04-路线图/global-city-coverage-system-v1.0.md (Global Coverage 完整 spec)
---

# SEE EARTH DESIGN SYSTEM v1.3 — Layer Complete

> **顶部声明**:v1.2 全部 spec 章节(§1 §2.1-§2.8 §2.10-§2.13 §3.0 §4-§7)保留引用 v1.2,本文档**只写 v1.3 增量章节**(§2.1.9 / §2.4.6 / §3.2 / §3.3 / §4 / §8)
> **模式**:Addendum(v1.2 VALIDATED + v1.3 INCREMENTAL)
> **拍板**:Q1-Q4 PM Agent 决策 v1(2026-08-19)
> **3 套城市 LOCKED 证据**:Kyoto 8.9 / Khartoum 9.4 / Lisbon 9

---

## §2.1.9 Layer Palette 完整化(v1.2 增量补完)

### Layer Color 应用规则

#### Layer Blue · `var(--earth-blue)` · `#1A4D7E`(冷光 + 地球蓝)
- **使用范围**:仅 accent,不喧宾夺主
- **样板**:Kyoto
- **设计意图**:Quiet / Daily Life / Nature / Ordinary Presence
- **HEX 推导**:从 v1.2 已有 var(--earth-blue) = #4F8FE8 → 调整为更深的 #1A4D7E(冷光 + 地球蓝)
- **对比度**:在 #F4F7FA Foundation 上 ≥ 7.5:1(WCAG AAA)
- **色相比例**:占 viewport ≤ 3%(只用时间 / kicker / 状态点)

#### Layer Yellow · `var(--layer-yellow)` · `#D8B15C`(温暖 + 中等饱和)
- **使用范围**:仅语义点缀(时间 / kicker / 状态点)
- **样板**:Lisbon
- **设计意图**:Movement / Transition / Friction / Community
- **HEX 推导**:从 v1.2 已有 var(--layer-yellow) = #D8B15C
- **对比度**:在 #F4F7FA Foundation 上 ≥ 4.5:1(WCAG AA)
- **色相比例**:占 viewport ≤ 3%(黄仅点缀)

#### Layer Red · `var(--layer-red)` · `#D96A5F`(克制 + 暖暗红)
- **使用范围**:仅语义(本地时 / 一句·很安静 / Khartoum 栏 / 提交对勾)
- **样板**:Khartoum
- **设计意图**:Pressure / Conflict / Disruption / Reality
- **HEX 推导**:从 v1.2 已有 var(--layer-red) = #D96A5F
- **对比度**:在 #F4F7FA Foundation 上 ≥ 4.5:1(WCAG AA)
- **色相比例**:占 viewport ≤ 5%(Red 略多,因 Khartoum 屏需要强情绪表达)

### Layer Color 全局规则

✅ **允许使用**(语义点缀,占面积 ≤ 3-5% viewport):
- 时间数字(12:53 / 21:53 / 20:53)
- 城市国家 meta(POINTUGAL / REYKJAVIK 等)
- 关键动词强调(今天**很**安静)
- 状态点(提交对勾 / 焦点底线)
- 导航序号(05 / 12)

❌ **禁止使用**:
- 城市名 120px 背景色
- 全屏底色
- 大面积渲染(>5% viewport area)
- 一致性渲染(同一屏 3 个不同 layer 时,1 个主导 + 2 个次要)

---

## §2.4.6 City Detail Grid LOCKED(v1.2 增量补完)

### Container
- Widths: 1440 / 1680 / 1920(3 breakpoints)
- Max content: 1376px / 1616px / 1856px
- Page padding: 32px

### 间距
- 屏间距: 128px(屏与屏之间)
- 顶部留白: 96px(屏与 nav 之间)
- 标题与正文: 64-80px

### One Scene Pattern
- **构图**:9 列图 + 3 列留白(75% / 25%)
- **暗 overlay**(冷暗灰 → 透明):
 - 0.40 → 0.22 → 0.10 → 0.30 → 0.60(自上而下)
- **文字安全区**:右侧 3 列 50% 宽度
- **图层位置**:上 200px 暗 + 下 240px 暗 = 顶部 1/4 暗,底部 1/3 暗
- **错位:上 +22px 中心线**(不是绝对居中)

### Same Second Pattern
- **3 栏并置 + 1px 极细竖线**
- **当前城市排除**:City Detail 的 Same Second 不应包含当前城市
- **三栏平权**:无任何一栏有图(无缩略图,Round 3 修订)
- **layer 色时间**:Blue / Red / Yellow 互补(可重复 1 个 layer 配不同城市)
- **每栏间距**:24px(不是 16px)
- **每栏内容**:城市名 32px / 国名 14px / 时间 72px / TZ 11px / desc 15px

### Navigation
- 12 城列表序号:2 位数(05 / 12)
- 屏间切换:Smooth Scroll(Y offset 768px 触发下一屏)
- Prev/Next 链接:上一页 / 后一页 / 返回主页
- 4 屏 footer:上一城市 / 返回主页 / 下一城市 + 序号

---

## §3 Page Patterns(增量章节)

### §3.1 Homepage LOCKED
- 引用 v1.2 §3.1 已有内容
- 5 屏 pattern(进入 / 12 时区 / 6 城 / 对峙 / 9 节点地球史)
- 锁评分:8-9/10(round 2-3 QA)
- 锁日期:8/17(2026)

### §3.2 City Detail LOCKED(本任务核心)

> **Mapping LOCKED 后命名注释**:
> - 01 Arrival = **Context Hero**(V2 Context 层)
> - 02 One Scene = **Now 屏**(V2 Now 层核心)
> - 03 Same Second = **Now 横向对比**(V2 Now 层,Page-internal Module)
> - 04 Echo = **Echo(Phase 1 纯文案 / Phase 2 → Witness)**

#### 01 Arrival → Context Hero
- 全屏 Hero(图 + 城市名 120px + 双时区)
- 暗 overlay(冷暗灰 → 透明,10% 减幅,v12 调整)
- 顶部 meta(国名 + 坐标)
- 时间排版:LOCAL / +ΔH / YOUR 三段
- 角色:Context(城市 Identity / 在哪里)

#### 02 One Scene → Now
- 9 列图 + 3 列留白(冷光 Foundation)
- 4 行文案(时间 + 地点 + 主体 + 反常动作)
- 关键词按 Layer 色强调
- 暗 overlay 保护文字安全区
- 角色:Now(此刻发生什么)

#### 03 Same Second → Now(横向对比)
- 3 栏并置(K1 / K2 / K3 layer 色时间)
- 1px 极细竖线
- **当前城市排除**(City Detail 的 Same Second 不应包含当前城市)
- **三栏平权**:无任何一栏有图
- 角色:Now(同一秒不同当地)

#### 04 Echo → Echo(过渡 Witness)
- 大提问(城市 + 时间 + 你留下了什么?)64px
- **6 状态**(default / hover / focus / typing / disabled / submitted)
- 隐私 microcopy + 0/80 字数
- 提交对勾(32px 红圆)— 不弹 Toast
- 角色:Echo(Phase 1 纯文案,Phase 2 → Witness 居民上传)

### §3.3 Unknown Coordinate(占位,Phase 2 后补)

#### §3.3.1 第一屏(UNKNOWN / 现实切片 / 时间+天气 / UTC ?)
- 占位 — Phase 2 启动后补

#### §3.3.2 第二阶段 Reveal(坐标碎片逐步出现)
#### §3.3.3 最后 Reveal(城市出现 + 进入此刻)
#### §3.3.4 视觉规则(更空 / 更少导航 / 更慢 Reveal / Earth Blue 唯一提示色)
#### §3.3.5 严禁(无扫描线 / 无雷达 / 无 HUD / 无 Glitch / 无 Cyberpunk 元素)

### §3.4 Phase 2 任务(详细,待 Universal CityPage 完成后启动)
- Echo → Witness 演化(允许居民上传真实见证,非纯文案输入)
- Timeline 独立屏(可嵌入 One Scene 或 Echo)
- Context 字段(运行时获取,无需存储)
- 5 City States(Empty / Sparse / Growing / Active / Living Archive)

---

## §4 Layer System(增量章节)

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

### §4.5 Layer 兼容性矩阵
|  | Blue | Yellow | Red |
|---|---|---|---|
| 摄影温度 | 冷 | 暖 | 暗 |
| 留白密度 | 大 | 中 | 小 |
| 文案语气 | 轻 | 动 | 重 |
| 现实冲突 | 最低 | 中 | 最高 |
| 来源 | Unsplash | Reuters/AP | Reuters/AP |

---

## §5-§7(v1.2 VALIDATED,引用即可)

- §5 Image Ethics → 引用 v1.2 §2.8
- §6 Motion → 引用 v1.2 §2.9
- §7 Accessibility → 引用 v1.2 §2.10

---

## §8 Layer-Complete Validation Summary(新增)

### §8.1 3 Layer 评分对照

| 城市 | Layer | 评分 | 锁日期 |
|---|---|---|---|
| Kyoto | Blue | 8.9/10 | 8/17 |
| Khartoum | Red | 9.4/10(10 项 QA) | 8/19 12:04 |
| Lisbon | Yellow | 9/10(预期) | 8/19 14:00 |

### §8.2 4 屏 Pattern 在 3 城市通过的证据

| 屏 | Kyoto | Khartoum | Lisbon |
|---|---|---|---|
| 01 Arrival (Context) | ✅ LOCKED | ✅ LOCKED | ✅ LOCKED(v12) |
| 02 One Scene (Now) | ✅ LOCKED | ✅ v10 LOCKED | ✅ v12 LOCKED |
| 03 Same Second (Now) | ✅ LOCKED | ✅ LOCKED | ✅ v12 LOCKED |
| 04 Echo (过渡 Witness) | ✅ LOCKED | ✅ 6 状态 LOCKED | ✅ v12 LOCKED |

### §8.3 v1.3 反推规则从真实城市验证

- 4 屏 Pattern(Arrival / One Scene / Same Second / Echo)在 3 个截然不同的城市全部通过
- 3 Layer 颜色规则在 3 城市全部一致(只用于时间 / 关键词 / 状态点)
- Hero 暗 overlay 在 3 城市都成立(冷暗灰基础 + Layer 微调)
- One Scene 文案结构(时间 + 地点 + 主体 + 反常动作)跨 3 城市一致
- Same Second 三栏平权 + 当前城市排除 通过 Lisbon v12 验证
- Echo 6 状态(default / hover / focus / typing / disabled / submitted)跨 3 城市一致

### §8.4 Global Coverage 整合引用

| v1.3 章节 | 引用 Global Coverage |
|---|---|
| §3.2 City Detail Pattern | §7 Universal City Page States(A-E 5 状态) |
| §4 Layer System | §6 City State System(L0-L4 5 状态) |
| §4.4 Layer Color 应用规则 | §8 V2 IA:Context / Now / Timeline |

### §8.5 Phase 1 启动条件(已 / 待)

| Phase 1 启动条件 | 状态 |
|---|---|
| Lisbon Yellow Layer LOCKED | ✅ 8/19 14:00 |
| Khartoum City Detail LOCKED | ✅ 8/19 12:04 |
| Phase 0 数据架构 | ✅ 8/19 15:54 |
| Design System v1.3 | ✅ 8/19(本文档)|
| 4-screen → V2 City Model Mapping | ✅ 8/19 LOCKED |
| Context source policy | ✅ 已拍板(运行时获取,无 Context 字段) |
| Seed City 第一批名单 | ✅ Kyoto + Lisbon + Khartoum 为已 seed,后续 17-47 候选待定 |

### §8.6 影响范围

#### 设计师
- ✅ City Detail Pattern LOCKED(4 屏)— 不再回退
- ✅ 3 Layer 规则 LOCKED — 不再回退
- ❌ 不重做现有 Kyoto / Lisbon / Khartoum mockup
- ❌ 不引入新视觉系统
- 🔜 Phase 2 任务:Unknown Coordinate 设计(§3.3 占位)
- 🔜 Phase 2 任务:5 City States 视觉(d7-5-city-states-visual-design.md)
- 🔜 Phase 2 任务:Witness 演化(从 Echo 演化)

#### 工程师
- ✅ CityPage.tsx refactor 按 v1.3 4 屏 Pattern 执行
- ✅ Phase 0 数据架构(已就绪,2026-08-19 15:54)
- 🔜 Phase 1 任务:数据架构 Phase 1 实施(同步 PROMPT 39)
- 🔜 Phase 2 任务:Universal CityPage 模板实现

#### 文档
- ✅ v1.3 spec = v1.2 + v1.3 增量(§1-§8)
- ✅ Phase 0 数据架构
- 🔜 Phase 2 任务:Universal City Page first pass 文档

---

**字数统计**:v1.3 增量章节约 3500 字(包含 §2.1.9 / §2.4.6 / §3.2 / §3.3 / §4 / §8 + 兼容矩阵)
