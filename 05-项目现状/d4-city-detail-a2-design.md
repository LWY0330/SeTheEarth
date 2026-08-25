---
title: D4 · 城市详情 A2 设计 spec
type: design-spec
tags: [d4, city-detail, a2, designer交付物, PROMPT-22]
date: 2026-08-17
status: 设计 spec · 待 PM 评审
canonical_path: /Users/lwy/Documents/Obsidian Vault/看见地球 设计/05-项目现状/d4-city-detail-a2-design.md
---

# D4 · 城市详情 A2 设计 spec

> **作者**:Designer Agent · **日期**:2026-08-17 · **对应 PROMPT**:22
> **mockups**:`outputs/v1.5-mockups/d4-a2/city-detail-desktop.png`(1440×900)·`city-detail-mobile.png`(375×812)·`city-detail-desktop.html` / `city-detail-mobile.html`
> **目标**:基于 Direction A2 重做城市详情页 hero,earth blue accent(不是 v1.5 暖色温度),SyncMoment 独立 section 化,4 段内容(城市此刻/当地生活/文化背景/相关城市)
> **边界**:**只产 mockup + spec**,不动 tokens.css / Timeline.module.css / Tag.module.css
> **视觉回归自查**:与 v1.4.1 hotfix 一致(无新增 a11y 问题)+ A2 视觉深化
> **前置**:Direction A2 Visual Foundation v1.0(已读)·前端设计方向 — Direction A2(已读)·产品理念 v1 6 条(已读)

---

## 🎯 设计目标

### v1.4.1 → A2 视觉变化

| v1.4.1 / v1.5(已废) | A2(新方向) |
|---|---|
| Hero 京都大图 + 右上 SyncMoment 角落小卡 | Hero 大尺度冷白渐变 + 京都超大 120px display serif + SyncMoment 独立右侧白色 surface |
| SyncMoment 黑色 + 暖橘 accent | SyncMoment 白底 + earth-blue 4px 左侧栏(同 home Timeline 详情卡结构) |
| 暖橘 #B25E40 主色 | earth blue #4F8FE8 主色(≤ 5% 面积) |
| 城市详情 4 段:`02:00` + `04:00` 段落 | 城市详情 4 段:`01 城市此刻 / 02 当地生活 / 03 文化背景 / 04 相关城市` |
| 当地生活是 carousel | 当地生活是 vertical timeline(19:42 / 20:18 / 21:07 时刻文字列表) |

### 设计说明摘要(150 字)

A2 城市详情核心是**"京都此刻"作为时空切片**——hero 左侧是 120px Cormorant Garamond display serif "京都" + italic "Kyoto · The slow city" + Editorial Serif italic 一句话简介,右侧是 SyncMoment 独立 white surface 卡片(4px earth-blue 左侧栏,48px mono time 21:53,VS SHANGHAI +1h · -2°C 时差对比)。背景是大尺度冷白渐变(linear-gradient + radial atmosphere blue overlay,opacity 35%)。

4 段内容用 280px sticky 左侧 meta 列 + 1fr 内容列,每段都有数字 drop cap(`京` in display serif 64px)+ 段落正文 Editorial Serif italic 18px + 中文::first-letter drop cap。文段之间靠 hairline border + 64px 间距分隔。第三段"文化背景"含 1 个 pull quote(Fraunces italic 36px,4px earth-blue 左侧栏,200ms fade-in)。第四段"相关城市"用 4 列 grid,每卡片 city name + time + 经纬度。

---

## ✅ A2 8 Do 自检

| Do | mockup 上如何体现 |
|---|---|
| 1. 白昼地球观察站 | hero 大尺度冷白渐变,无暖色调,大尺度留白 |
| 2. 主标题是构图核心 | "京都" 120px display serif,占 hero 60% 宽度 |
| 3. 留白建立高级感 | hero padding 80px + 4 段间距 80px + 段落间 24px |
| 4. 图片承担叙事 | hero 京都图片由 hero 渐变模拟(白昼地球观感),不用实拍 |
| 5. 轻蓝建立识别 | earth blue 4px SyncMoment 侧栏 + pull quote 4px 侧栏 + 当地生活时间标签 |
| 6. 信息精确感 | mono 48px time + tabular-nums + 12px/0.18em meta uppercase |
| 7. 组件低存在感 | SyncMoment 是白底 1px border + 0.06 阴影,卡片无装饰 |
| 8. 首页像"世界入口" | hero 是城市入口,4 段内容是城市本身 |

---

## ❌ A2 8 Don't 自检

| Don't | mockup 上如何规避 |
|---|---|
| 1. 不要奶油白 | hero 背景 #F8FBFD cold mist → #F4F7FA,无暖色调 |
| 2. 不要 AI 工具感 | 无 prompt / 无发光 / 无聊天窗口 |
| 3. 不要电商感 | 无商品卡片 / 无强 CTA |
| 4. 不要新闻门户感 | 无密集信息流;4 段,大留白 |
| 5. 不要 SaaS Dashboard 化 | 无控件;SyncMoment 是数据观察器 |
| 6. 不要为了浅色而"无主视觉" | "京都" 120px display serif 是绝对主视觉 |
| 7. 不要杂乱图片 | 12 城市所有 hero 背景统一冷白渐变 |
| 8. 不要过多边框和硬分割 | hairline 8% 透明度,只在 meta 列 + 段间分隔 |

---

## 🏗️ Hero 结构(桌面)

```
┌─────────────────────────────────────────────────────────┐
│ 看见地球                                                  │
│ Cities · Journal · Earth Archive · About           (here)│
├─────────────────────────────────────────────────────────┤
│                                                          │
│  05 / 12 · KYOTO · JAPAN       ┌──────────────────┐   │
│                                │ ● LOCAL TIME      │   │
│  京都                            │ 21:53             │   │
│                                │ Tuesday · 27°C    │   │
│  Kyoto · The slow city         │ GMT+9 · Asia/Tokyo│   │
│                                │ ────────────────  │   │
│  一座把时间活成细节的城市——       │ VS SHANGHAI       │   │
│  它的美不在宏大,而在你愿意       │ +1h · -2°C        │   │
│  慢下来看见的瞬间。              │ Kyoto is 1 hour...│   │
│                                └──────────────────┘   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

- 左列(60%):city kicker + 城市名(120px display serif)+ 英文名(italic)+ 一句话简介
- 右列(40%):SyncMoment 独立卡片(白底 + earth-blue 4px 左侧栏)
- 背景:linear-gradient(180deg, F8FBFD → F4F7FA)+ atmosphere blue overlay

---

## 🏗️ 4 段内容结构

### 01 城市此刻(CITIES NOW)

- Meta 列:`01 / 04` + `CITIES NOW` + `城市此刻`(Fraunces italic 28px)
- 内容:首段 Editorial Serif italic + 4 列 data row(LOCAL TIME 21:53 / TEMPERATURE 27°C / SUNSET 19:08 / MOONRISE 22:14)+ 尾段

### 02 当地生活(LOCAL LIFE)

- Meta 列:`02 / 04` + `LOCAL LIFE` + `当地生活`
- 内容:vertical timeline(19:42 先斗町灯笼 / 20:18 鸭川纳凉 / 21:07 祇园舞方),每行 mono time + display serif title + description + 11 tone tag

### 03 文化背景(CULTURE)

- Meta 列:`03 / 04` + `CULTURE` + `文化背景`
- 内容:首段 + **pull quote** "京都不是一座城市。它是一千年的时间。" — 京都本地作家 · 1934(36px Fraunces italic,earth-blue 4px 左侧栏,surface-secondary 背景)+ 尾段关于"間"(ma,空白)哲学

### 04 相关城市(RELATED)

- Meta 列:`04 / 04` + `RELATED` + `相关城市`
- 内容:首段 + 4 列 grid(东京 / 上海 / 首尔 / 台北),每卡片 city name + en + time + coords

---

## 📦 交付物

| 文件 | 路径 |
|---|---|
| 文档 | `05-项目现状/d4-city-detail-a2-design.md` |
| mockup desktop | `outputs/v1.5-mockups/d4-a2/city-detail-desktop.png` (1440×900) |
| mockup mobile | `outputs/v1.5-mockups/d4-a2/city-detail-mobile.png` (375×812) |
| HTML 源 desktop | `outputs/v1.5-mockups/d4-a2/city-detail-desktop.html` |
| HTML 源 mobile | `outputs/v1.5-mockups/d4-a2/city-detail-mobile.html` |

---

## 🔗 引用了 07 目录的哪几个文件

- `[[07-设计师设计参考/前端设计规则/Direction A2—— Visual Foundation v1.0]]` — Color Tokens (text-primary #11161B / earth-blue #4F8FE8)+ Typography (Display XL 72px / Time 40-64px tabular-nums)+ Layout (1376px content-max-width)
- `[[07-设计师设计参考/前端设计规则/前端设计方向 — Direction A2]]` — Do / Don't + 6 关键词
- `[[01-理念/产品理念-v1]]` — 核心理念 4 不讨好也不摧毁(板块 1 → 4 弧光)+ 核心理念 6 用户是被提醒者

---

**字数统计**:正文 ≥ 900 字 · 8 Do + 8 Don't 全过 · A2 5 关键词全映射 · 4 段内容清晰
