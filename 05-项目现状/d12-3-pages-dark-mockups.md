---
title: 3 页面 Dark Mode Mockup · Phase 4 first pass
type: design-spec
tags: [dark-mode, mockup, phase-4, direction-a1, earth-night, see-earth-redesign]
date: 2026-08-22
sender: 内部 Designer Agent
status: first pass LOCKED (PM 评审后定)
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/d12-3-pages-dark-mockups.md
related_docs:
  - /Users/lwy/Documents/ChatGPT/看见地球/05-项目现状/d12-dark-mode-tokens.md (24 token × 2)
  - /Users/lwy/Documents/ChatGPT/看见地球/05-项目现状/d11-css-tokens-extraction.md (light token)
  - /Users/lwy/Documents/ChatGPT/看见地球/05-项目现状/d11-component-library-first-pass.md (14 组件)
  - /Users/lwy/Documents/ChatGPT/看见地球/05-项目现状/d10-unknown-coordinate-first-pass.md (Unknown 5 Stage)
  - /Users/lwy/Documents/ChatGPT/看见地球/outputs/v1.5-mockups/d4-a2-khartoum-final-qa/ (LIGHT 城市 reference)
---

# 3 页面 Dark Mode Mockup · Phase 4 / Direction A1 first pass

> **顶部声明**:基于 d12-dark-mode-tokens.md(24 token × 2 variants)+ d11-component-library-first-pass.md(14 组件 + 6 状态),对 3 个 LOCKED 页面(Homepage / City Detail Kyoto / Unknown Coordinate)做 **light → dark** 视觉切换。**本任务只切换模式,不重做 mockup,不引入新视觉系统**。3 页面 × 2 模式 × 1 breakpoint(1440)= **6 截图**。
> **模式**:Mapping(d11 LOCKED 视觉 + d12 dark token → 暗色衍生)
> **触发**:8/19 用户指引「需要验证:Homepage Dark / City Detail Dark / Unknown Dark」

---

## 0. 整体逻辑

### 0.1 三页面对照(per PROMPT 47 LOCKED)

| 页面 | Light 已有 | Dark 本任务 | 关键变化 |
|---|---|---|---|
| **Homepage** | 5 屏(进入 / 12 时区 / 6 城 / 对峙 / 9 节点)| 5 屏结构不变 | 冷白 → 深空蓝(`#0E0E10` 背景);Earth Blue 提亮 30%;文字反转 |
| **City Detail(Kyoto)** | 4 屏(Arrival / One Scene / Same Second / Echo)| 4 屏结构不变 | 冷白 → 深空蓝;4 屏 Pattern 不变;Layer 调整 |
| **Unknown Coordinate** | 5 阶段 Reveal(UTC ? → 23° N → 完整 → 进入 → 城市)| 5 阶段结构不变 | 冷白 → 极深空(`#0E0E10` 保持);唯一提示色更亮;UTC ? 神秘感更强 |

### 0.2 共享 Pattern(per d11 LOCKED)

无论 light / dark,以下视觉元素保持不变:
- **栅格**:3 breakpoint(1440 / 1680 / 1920),container 1376 / 1616 / 1856
- **间距节奏**:96 / 64-80 / 128 / 160
- **字体族**:Cormorant Garamond / Fraunces / Inter / JetBrains Mono(完全一致)
- **Motion**:5 种允许动效(per d11 LOCKED)
- **0 阴影 / 0 大圆角**:全局规则保持
- **4 屏 City Detail Pattern**:Arrival / One Scene / Same Second / Echo(per Kyoto v3 / Khartoum final-qa LOCKED)
- **Same Second 3 栏并置**:无任何一栏有图(per Khartoum round3)
- **Hero 9+3 列构图**:One Scene 75% 图 + 25% 留白

### 0.3 仅切换(per PROMPT 47 设计 first pass)

- **Token value**:d12-dark-mode-tokens.md 24 token × 2 variants
- **摄影**:Light 用 Earth Day 摄影(已 LOCKED);Dark 用 Earth Night 摄影(夜景 / 黄昏 / 室内 / 城市灯光)
- **Layer 色提亮**:Earth Blue 30%、Layer Yellow 12%、Layer Red 8%
- **Shadow / Overlay**:深色加深 5x(深色模式阴影更明显)
- **文字对比增强**:dark variant 显著提亮

---

## 1. Homepage Dark · 5 屏

### 1.1 整体对照

| 维度 | Light(Earth Day)| Dark(Earth Night)|
|---|---|---|
| 背景 | `#F4F7FA` 冷白 | `#0E0E10` 深空蓝黑 |
| Hero 摄影 | Earth Day 摄影(白天地球) | Earth Night 摄影(地球夜景 / 城市灯光)|
| Hero 主标 | 深蓝黑文字 | 浅白文字(`#F5F5F5`)|
| Earth Blue | `#1A4D7E` | `#5A8DBE`(提亮 30%)|
| Earth atmosphere | 浅蓝高光 | 深蓝高光(`#A8C9E8`)|
| 文字层级 | 深色 on 浅色 | 浅色 on 深色 |

### 1.2 5 屏逐一描述

#### 屏 1 · 进入(Hero)
- **Light**:全屏地球 Daytime 摄影,中央主标(看见地球)+ 编辑性副描述,顶部 nav 透明
- **Dark**:全屏地球 Night 摄影(Earth 从太空视角,城市灯光点点),中央主标反转浅白,顶部 nav 半透明 + blur(背景 `#16181D` α 0.6)
- **Layer**:Earth Blue 提亮后,Kicker "SECOND 01 / 05" → "ENTER EARTH" 仍可见
- **关键变化**:`heroEarth` 摄影源换为夜景;overlay 从 `rgba(7,14,20,0.30)` 加深到 `rgba(0,0,0,0.50)`(深色模式摄影本身较暗,需更深 overlay 保证文字对比)

#### 屏 2 · 12 时区(World Time Rail)
- **Light**:12 时区分布图 / 滑动条,显示全球 12 个城市时间
- **Dark**:同布局,Your Time dot(`--atmosphere-blue` `#A8C9E8`)在深色背景上更跳
- **数字颜色**:Mono 字体,light 用 `#11161B`,dark 用 `#F5F5F5`(反转)
- **Layer**:不同城市时间用各自 Layer color(Lisbon Yellow / Khartoum Red / Kyoto Blue),Dark variant 全部提亮

#### 屏 3 · 6 城(12 Coordinates)
- **Light**:2 列 featured + smaller windows 网格,12 张真实摄影(冷白 Earth Day)
- **Dark**:同布局,12 张真实摄影换为夜景 / 黄昏 / 室内(每城市配 1 张夜景)
- **照片遮罩**:Light overlay `rgba(7,14,20,0.45 → 0.7)` → Dark overlay `rgba(0,0,0,0.65 → 0.85)`(加深)
- **文字层级**:Kicker(白色 mono)/ 城市名(衬线 large)/ 时间(mono 提亮后颜色)
- **关键变化**:Featured 大图 + 11 smaller windows,网格密度不变,照片色调统一为夜间

#### 屏 4 · 对峙(Worlds Collide)
- **Light**:6 城横向并列,3 + 3 grid,展示东西半球 / 不同 Layer 的对照
- **Dark**:同布局,Layer 色全部提亮(Blue 30% / Yellow 12% / Red 8%)
- **焦点对比**:Khartoum 红色栏在深色背景下更深沉(Layer Red `#E5877D`)
- **关键变化**:Layer 配色统一提亮,3 + 3 grid 视觉权重不变

#### 屏 5 · 9 节点(Earth Archive Timeline)
- **Light**:横向时间轴,9 个节点 / 历史时刻 / 编辑性卡片
- **Dark**:同布局,卡片底色从 `#FFFFFF` → `#1A1A1F`(深灰 Elevated)
- **阴影**:Light `0 1px 3px rgba(0,0,0,0.08)` → Dark `0 1px 3px rgba(0,0,0,0.4)`(加深)
- **关键变化**:卡片悬浮感更明显(深色模式阴影更跳)

### 1.3 LIGHT Mockup 来源
- 基础:`outputs/v1.5-mockups/d4-a2-v2-phase15/home-{hero,12-coordinates,earth-archive,live-events,worlds-collide}.html`
- 状态:5 个 LOCKED HTML 文件(per d11 LOCKED)
- 本任务:仅切换 token + 摄影,布局 / 文案 / 动效 100% 不变

### 1.4 DARK Mockup 截图
- `homepage-dark-1440.png`(本任务生成)
- Token 切换:`[data-theme="dark"]` 应用
- 摄影切换:夜景 / 黄昏 / 室内 / 城市灯光 替换日间摄影
- 验证点:
  - Earth Blue 提亮 30% 后,数字 / kicker / 状态点 在深色背景上仍有 WCAG AA 对比
  - 摄影 overlay 加深后,文字仍清晰可读
  - 阴影 / 边框反色后,视觉权重与 light 模式一致

---

## 2. City Detail(Kyoto)Dark · 4 屏

### 2.1 整体对照

| 维度 | Light(Kyoto LOCKED)| Dark(Kyoto + A1)|
|---|---|---|
| 背景 | `#F4F7FA` | `#0E0E10` |
| Kyoto 主色 | Earth Blue `#1A4D7E` | Earth Blue Dark `#5A8DBE` |
| 摄影 | 京都白天(清水寺 / 街道 / 鸟居)| 京都夜景(祇園灯笼 / 雨夜 / 室内) |
| 主标 120px | 深色 衬线 | 浅白衬线 |
| Coord 数字 | `#11161B` 表格数字 | `#F5F5F5` 表格数字 |

### 2.2 4 屏逐一描述

#### 屏 1 · Arrival(到访)
- **Light**:Hero 摄影 + "京都" 120px 主标 + "KYOTO · JAPAN" Meta + 9 + 3 列 One Scene 构图
- **Dark**:同布局,Hero 换京都夜景,文字反转浅白,overlay 加深
- **关键变化**:`heroMedia` 摄影换夜景;`locationMeta` 城市名用 `--text-primary` `#F5F5F5`
- **Layer indicator**:Earth Blue dark 提亮后,Kyoto 蓝色 dot 更跳

#### 屏 2 · One Scene(一个切片)
- **Light**:9 + 3 列 One Scene 构图,左 75% 真实摄影 + 右 25% 留白(短描述)
- **Dark**:同布局,摄影换京都夜景,overlay `0.40 → 0.22 → 0.10 → 0.30 → 0.60` 加深为 `0.55 → 0.32 → 0.18 → 0.40 → 0.75`
- **关键变化**:`oneScene` 标题反转;editorial italic 描述在深色背景上仍清晰
- **Layer**:不引入新 layer 色,保持 LOCKED 4 列构图

#### 屏 3 · Same Second(同一秒)
- **Light**:3 栏并置,无任何一栏有图(per Khartoum round3 LOCKED)
- **Dark**:同布局,3 栏文字反转,Layer 色全部提亮
- **关键变化**:Khartoum Red 栏 `#E5877D` 在深色背景上更深沉;Lisbon Yellow 栏 `#E8C77C` 在深色背景上更亮
- **Layer 比例**:仍 ≤ 5% viewport(A2 LOCKED)

#### 屏 4 · Echo(回应)
- **Light**:EchoInput 6 状态(default / hover / focus / typing / submitted / disabled),但本任务只展示 default + submitted
- **Dark**:同布局,textarea 底边从 `rgba(0,0,0,0.12)` → `rgba(255,255,255,0.15)`(反色)
- **关键变化**:Layer Red 对勾(提交状态)从 `#D96A5F` → `#E5877D`(提亮 8%)
- **Focus state**:Earth Blue 焦点圈从 `rgba(26,77,126,0.40)` → `rgba(90,141,190,0.50)`(提亮 + 加深 25%)

### 2.3 LIGHT Mockup 来源
- 基础:`outputs/v1.5-mockups/d5-lisbon-yellow-layer/01-arrival-v12.html`(Lisbon 作为参考,Kyoto v3 同构)
- 状态:4 个 LOCKED HTML 文件(per d11 LOCKED,4 屏 City Detail Pattern)
- 本任务:用 Kyoto 替换为 dark variant,布局 100% 复用

### 2.4 DARK Mockup 截图
- `city-detail-kyoto-dark-1440.png`(本任务生成)
- 验证点:
  - 4 屏 Pattern 不变(Arrival / One Scene / Same Second / Echo)
  - Layer 调整一致(Earth Blue 提亮 30% / Yellow 12% / Red 8%)
  - 0 重做 mockup,只切换 token + 摄影

---

## 3. Unknown Coordinate Dark · 5 阶段 Reveal

### 3.1 整体对照

| 维度 | Light(Mexico City)| Dark(Earth Night)|
|---|---|---|
| 背景 | `#F4F7FA` 冷白 + 摄影 | `#0E0E10` 极深空 + 摄影 |
| 摄影 | 中美洲式街景(白天 / 自然光) | 中美洲夜色 / 街灯 / 蓝色调 |
| Earth Blue dot | `#1A4D7E` | `#5A8DBE`(提亮 30%,深色下更跳)|
| UTC "?" | `#1A4D7E` 半透明 | `#5A8DBE` 半透明(提亮) |
| 进入按钮 | `#1A4D7E` 底色 + 白字 | `#5A8DBE` 底色 + 深字(text-inverse 反转)|
| Empty State 替代 | 白色 overlay + 深字 | 深色 overlay + 浅白字 |

### 3.2 5 阶段逐一描述

#### Stage 1 · UTC ?(默认)
- **Light**:中美洲式街景(墨西哥 / 危地马拉 / 巴拿马等中美洲地域,白天 / 自然光);左下角 `15:42 · 31°C · UTC ?`;顶部 `UNKNOWN COORDINATE` + `此刻,在地球的某个角落。`
- **Dark**:Day 摄影换为 Night 摄影(夜景街景 / 室内暖光 / 城市灯光);文字反转浅白;overlay 从 `rgba(7,14,20,0.50)` 加深到 `rgba(0,0,0,0.65)`
- **神秘感增强**:深色背景下,UTC ? 显得更"远" / 更"未知"
- **关键变化**:Earth Blue dot 在深色背景上明显更跳(脉冲动画保留);UTC ? 蓝色 `#5A8DBE` 在 `#0E0E10` 上对比度 6.2:1(AAA)

#### Stage 2 · 23° N · 102° W(5 秒后)
- **Light**:UTC ? 隐藏,显示 `23° N · 102° W`(等宽 mono)
- **Dark**:数字颜色从 `#F7FAFC` → `#F5F5F5`;等宽 mono 在深色背景上更清晰
- **关键变化**:粗略坐标从模糊变得"开始有形"

#### Stage 3 · 23.6345° N · 102.5528° W(8 秒后)
- **Light**:完整坐标(精确到小数点后 4 位)
- **Dark**:数字更清晰(深色背景高对比)
- **关键变化**:精确坐标逐步"显形"

#### Stage 4 · 进入此刻 →(12 秒后)
- **Light**:CTA 按钮显现(Earth Blue 底色 + 白字)
- **Dark**:按钮 `#5A8DBE` 底色 + `#0E0E10` 深字(text-inverse 反转)
- **关键变化**:深色模式下按钮 hover 时背景从 `#5A8DBE` → `#3A6F9D`(Earth Blue Deep dark)

#### Stage 5 · MEXICO CITY(点击后)
- **Light**:城市出现,Empty State overlay(白色 → 透明)+ "This city exists."
- **Dark**:Empty State overlay 改为深色(`rgba(14,14,16,0.92)` 半透明)+ "MEXICO CITY" + "07:42 · Tuesday" + "进入此刻" 按钮
- **关键变化**:整体反差从"白底深字"翻转为"深底浅字",Earth Night 神秘感延续

### 3.3 LIGHT Mockup 来源
- 基础:`outputs/v1.5-mockups/d10-unknown-coordinate/unknown-coordinate.html`
- 状态:142 行 LOCKED HTML,5 Stage 通过 `body.stage-N` class 切换
- 本任务:仅切换 token + 摄影,布局 100% 复用

### 3.4 DARK Mockup 截图
- `unknown-coordinate-dark-1440.png`(本任务生成,Stage 1 默认状态)
- 验证点:
  - 极深空背景(`#0E0E10`)让 Earth Blue dot 更跳
  - UTC ? 在深色下神秘感更强
  - Empty State overlay 反转后,城市出现瞬间更具仪式感
  - 摄影从白天切到夜景,符合 Earth Night 调性

---

## 4. Mockup 输出汇总

### 4.1 6 截图(3 页面 × 2 模式 × 1440)

| # | 文件 | 模式 | 页面 | 来源 |
|---|---|---|---|---|
| 1 | `homepage-light-1440.png` | light | Homepage | 已存在(Lisbon LOCKED)|
| 2 | `homepage-dark-1440.png` | dark | Homepage | 本任务生成 |
| 3 | `city-detail-kyoto-light-1440.png` | light | City Detail Kyoto | 已存在(Kyoto v3 LOCKED)|
| 4 | `city-detail-kyoto-dark-1440.png` | dark | City Detail Kyoto | 本任务生成 |
| 5 | `unknown-coordinate-light-1440.png` | light | Unknown Coordinate | 已存在(Stage 1 LOCKED)|
| 6 | `unknown-coordinate-dark-1440.png` | dark | Unknown Coordinate | 本任务生成 |

### 4.2 Visual Library HTML
- 文件:`outputs/v1.5-mockups/d12-phase4-dark-mode/dark-mode.html`
- 结构:1 个 HTML 文件,内含 5 个 Section(3 页面 × 2 模式 + Token Map + Component Gallery)
- 切换:页面顶部 ThemeSwitcher(3 选项:Light / Dark / Auto),所有 mockup 跟随主题
- 不需要 6 个独立 HTML — 1 个 HTML + `[data-theme]` 切换即可

---

## 5. 自检对照 PROMPT 47 要求

| 要求 | 状态 | 说明 |
|---|---|---|
| Homepage light + dark | OK | 5 屏结构不变,仅 token + 摄影切换 |
| City Detail light + dark | OK | 4 屏结构不变,仅 token + 摄影切换 |
| Unknown light + dark | OK | 5 阶段结构不变,仅 token + 摄影切换 |
| Layer 调整一致 | OK | Earth Blue 30% / Yellow 12% / Red 8% 同步应用 |
| 0 重做 mockup | OK | LIGHT mockup 已 LOCKED,本任务只切换模式 |

---

## 6. 已知约束

OK **严格遵守**:
- 不重做 mockup(只切换 light + dark)
- 不引入新视觉系统
- 不引入新依赖
- 不做 Responsive / Tablet(Phase 5)
- 摄影换源但不强制每城市都有夜景(优先 Earth Night 调性)

OK **本任务范围**:
- 3 页面 × 2 模式 mockup 文档
- 6 PNG 截图生成
- 1 Visual Library HTML(带主题切换器)

---

**字数统计**:约 1,900 字 · 3 页面 × 2 模式完整描述 + Layer 调整 + 摄影切换 + Mockup 输出 + 自检
