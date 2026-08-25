---
title: 工程师 PR 拆解草案 · 2026-08-19
type: engineer-pr-plan
tags: [pr-plan, code-refactor, khartoum, citypage, cities-data, see-earth-redesign]
created: 2026-08-19
sender: 2026-08-19 接管 PM Agent
receiver: 工程师
status: 草案 v1 · 等用户拍板节奏 + 等 Khartoum mockup LOCKED
depends_on:
  - Khartoum City Detail mockup LOCKED(等外部设计师 round 8 反馈)
  - One Scene 图源确定(用户拍板 A/C)
related_docs:
  - /Users/lwy/Documents/ChatGPT/看见地球/06-PM Agent 交接/2026-08-19-pm-takeover-audit.md
  - /Users/lwy/Documents/ChatGPT/看见地球/05-项目现状/d4-a2-khartoum-final.md
  - /Users/lwy/Documents/ChatGPT/看见地球/05-项目现状/d4-a2-khartoum-round3.md
  - /Users/lwy/Documents/ChatGPT/看见地球/outputs/v1.5-mockups/d4-a2-khartoum-final/01-arrival-final.html
  - /Users/lwy/Documents/ChatGPT/看见地球/outputs/v1.5-mockups/d4-a2-khartoum-round3/02-one-scene-v9.html
  - /Users/lwy/Documents/ChatGPT/看见地球/outputs/v1.5-mockups/d4-a2-khartoum-round3/04-echo-state-default.html
  - /Users/lwy/Documents/ChatGPT/看见地球/src/components/CityPage.tsx
  - /Users/lwy/Documents/ChatGPT/看见地球/src/data/cities.ts
  - /Users/lwy/Documents/ChatGPT/看见地球/src/data/liveMoments.ts
  - /Users/lwy/Documents/ChatGPT/看见地球/src/lib/imageUrl.ts
---

# 工程师 PR 拆解草案 · 2026-08-19

> **作者**:2026-08-19 接管 PM Agent
> **接收**:工程师
> **目标**:把 mockup(Khartoum 4 屏 A2)翻译成生产代码
> **依赖**:Khartoum mockup LOCKED(等外部设计师 round 8)+ One Scene 图源确定
> **节奏建议**:1 个大 PR 收掉(2 个 commit 可拆),详见 §4

---

## 📋 一句话 PR 计划

**把 mockup 翻译成生产代码,1 个 PR 收掉:** (1) 把 `src/components/CityPage.tsx` 从 v1.4 5 段重构为 A2 4 屏 (Arrival / One Scene / Same Second / Echo) + (2) 把 Khartoum 接入 `src/data/cities.ts` + (3) 清理 `liveMoments.ts` 旧 Khartoum 条目。Self-host Hero 图 + 4 张 mockup HTML 直接复用作为 production 模板。**

---

## 🎯 PR 目标(3 件事)

### 1. CityPage.tsx 重构:v1.4 5 段 → A2 4 屏

**当前结构**(v1.4):
```
<section className={styles.hero}>          ← Hero (仅图,无 120px 城市名 + 双时区)
<section className={styles.syncMoment}>   ← SyncMoment v1.4 PR #29 角落小卡片
<section className={styles.summary}>      ← 城市简介 + 时间 + 一句观察
<section className={styles.section}>      ← 城市此刻 (CityNow)
<section className={styles.section}>      ← 当地生活 (LivingNote)
<section className={styles.section}>      ← 文化背景
<section className={styles.related}>      ← 相关城市
```

**目标结构**(A2 4 屏,严格对齐 mockup):
```
<section className={styles.arrival}>      ← 01 Arrival:大图 + 城市名 120px + 双时区 + KYOTO·JAPAN/坐标
<section className={styles.oneScene}>     ← 02 One Scene:大图 9 列 + 文案 3 列 + 留白
<section className={styles.sameSecond}>   ← 03 Same Second:3 城市并置 + 1px 极细竖线 + layer 色时间
<section className={styles.echo}>         ← 04 Echo:大提问 64px + textarea + 5 态
```

**实施方式**(2 选项):

| 选项 | 描述 | 优点 | 缺点 |
|---|---|---|---|
| A) 渐进重构(推荐) | 保留 v1.4 文件,新增 v2 文件 `CityPageV2.tsx`,路由切换 → 测试 → 弃旧 | 风险小,可回滚 | 短期双文件维护 |
| B) 一次性重构 | 直接改 `CityPage.tsx`,跑通后再提 PR | 0 双文件 | 风险高,出问题难回滚 |

**PM 建议 A**(渐进),参考 v1.3 → v1.4 过渡的模式(PR #29)。

**实现细节**:
- Hero 视觉:`outputs/v1.5-mockups/d4-a2-khartoum-final/01-arrival-final.html` 是 production 模板,直接复用 CSS 结构(改 absolute positioning + 城市名 120px Serif + 双时区 60px Serif + KYOTO·JAPAN 12px sans)
- One Scene:`outputs/v1.5-mockups/d4-a2-khartoum-round3/02-one-scene-v9.html` 是 v9 占位,One Scene 文案从城市数据读
- Same Second:`outputs/v1.5-mockups/d4-a2-khartoum-round3/03-samesecond-qa-1440.html` (待生成)
- Echo:`outputs/v1.5-mockups/d4-a2-khartoum-round3/04-echo-state-default.html` 是 default 态,其他 4 态(hover/focus/typing/submitted)用 React state 管理

**LOCKED 不能动**(per handoff §5):
- ❌ 不重做 4 屏 Pattern
- ❌ 不重做 Hero
- ❌ 不重做 Same Second
- ❌ 不重做 Echo 5 项基础元素
- ❌ 不改 LOCAL / YOUR / Δ 时间排版
- ❌ 不动 Direction A2 / VF 1.2

### 2. Khartoum 接入 src/data/cities.ts

**当前 cities.ts 有 11 城**(Berlin / Cape Town / Kyoto / Lisbon / Shanghai / Mexico City / Tokyo / Rio / Reykjavík / London / Rome / Sydney),需要加 Khartoum。

**建议字段**(参考 Kyoto 完整字段):
```ts
{
  id: 'khartoum',
  slug: 'khartoum',
  nameZh: '喀土穆',
  nameEn: 'Khartoum',
  countryZh: '苏丹',
  countryEn: 'Sudan',
  lat: 15.5007,
  lon: 32.5599,
  timezone: 'Africa/Khartoum',
  layer: 'red',  // Red Layer 标识
  description: '蓝尼罗河与白尼罗河汇流处的首都。',
  oneObservation: '15:53 · 喀土穆 · 一家小商铺今天没开门',
  livingNote: '...',
  images: {
    landmark: { url: '...', focus: '...', width: 1920, height: 1079 },
    nature: { url: '...', focus: '...', width: ..., height: ... },
    street: { url: '...', focus: '...', width: ..., height: ... },  // One Scene 用
    culture: { url: '...', focus: '...', width: ..., height: ... },
  },
  heroImage: { url: 'public/images/khartoum-hero-nile-sunset.jpg', focus: '50% 50%', width: 1920, height: 1079 },
  // ... 其他参考 Kyoto 字段
}
```

**字段必填 vs 选填**:
- 必填:id / slug / nameZh / nameEn / countryZh / countryEn / lat / lon / timezone / images (4 类)
- 选填:description / oneObservation / livingNote / heroImage (CityPage 4 屏用)

**位置确定**(重要 — mockup 标 5/12):
- handoff 说"05/12 · · KHARTOUM"
- 但当前 12 城清单只有 11 城,需确认位置
- **PM 建议**:把 Khartoum 放在 cities.ts 数组的第 5 位(Lisbon 之后),等所有城市接入后再统一调位置

**具体操作**:
- 把 Khartoum 加到 `src/data/cities.ts` 数组第 5 位(Lisbon 之后)
- 4 类 URL 字段:
  - Hero: `public/images/khartoum-hero-nile-sunset.jpg`(已提供,见 §3)
  - landmark / nature / street / culture:**TBD**(等 PM 反查或用户提供 — 当前不可行,见 audit #3)

### 3. Self-host Hero 真摄影

**当前**:`outputs/a2-visual-assets/khartoum-real-nile-sunset.jpg`(805 KB,1920×1079)

**目标**:`public/images/khartoum-hero-nile-sunset.jpg`

**为什么 self-host**:
- 当前 `/cities/:slug` 走的是 Unsplash/Pexels CDN,但 Hero 用的是用户提供图,需要 self-host
- `imageUrl.ts` 已经支持相对路径(PR #16 落地)
- Self-host 配 WebP + 正确尺寸(PR #9 优化)

**操作**:
```bash
mkdir -p public/images/
cp outputs/a2-visual-assets/khartoum-real-nile-sunset.jpg public/images/khartoum-hero-nile-sunset.jpg
```

**注意**:文件名是 .jpg 但实际是 PNG(file 检测到 PNG image data)。建议保留 .jpg 后缀(与 mockup 一致),但用 `file` 命令确认格式。如需要,加 `.jpg` 副本 + `.webp` 副本给 picture 元素用。

### 4. 清理 liveMoments.ts:411-422 旧 Khartoum 条目

**当前**:`src/data/liveMoments.ts:411-422` 引用"喀土穆的炮弹声在凌晨三点再次响起"(category: 'war', categoryLabelZh: '冲突')

**为什么清理**:见 `06-PM Agent 交接/2026-08-19-pm-takeover-audit.md` 漏报 #4
- 与 §2.8.8 Red Layer Image Ethics 冲突(不利用受害者面部作为情绪素材 → 同样不利用文字做情绪素材)
- 与 handoff §5 关键约束冲突(不写战时相关 Echo 文案)

**3 个方案**:
- A) 删除整个条目(最干净)
- B) 改写文案为克制观察风格
- C) 保留条目 + 标记 superseded

**PM + 前 PM 共识**:**方案 A**(删除最干净,符合"数据层不在 product 调性内")

**注意**:liveMoments.ts:411-422 这条 `cityId: 'cape-town'` 是 v1.4 PR #26 设计(借 Cape Town 路由避免 404),**删除后会破坏 v1.4 对峙式阅读流**。需谨慎:
- 选项 1:把 cityId 也改回 Khartoum(但 Khartoum 不在 cities.ts → 404)
- 选项 2:改写文案保持 v1.4 对峙流结构
- 选项 3:删除整个条目,v1.4 对峙流少 1 条 Red Layer 维度

**PM 我的建议**:**等工程师评估 v1.4 对峙流依赖关系后,选最稳妥方案**。不建议直接删除。

---

## 📁 文件改动清单(预计)

| 路径 | 改动 | 优先级 |
|---|---|---|
| `src/components/CityPage.tsx` | 重构 v1.4 5 段 → A2 4 屏(渐进:新增 CityPageV2.tsx) | P0 |
| `src/components/CityPageV2.tsx` | 新文件,A2 4 屏生产实现 | P0 |
| `src/router/Router.tsx` | 路由切换 v1 → v2(feature flag 或环境变量) | P0 |
| `src/data/cities.ts` | 加 Khartoum 字段(第 5 位) | P0 |
| `public/images/khartoum-hero-nile-sunset.jpg` | self-host 真摄影 | P0 |
| `src/data/liveMoments.ts:411-422` | 清理(待工程师评估 v1.4 对峙流依赖) | P1 |
| `src/styles/tokens.css` | 加 Red Layer 色值(已有 var(--layer-red)) | P2(可能不需要)|
| `src/lib/imageUrl.ts` | 加 Khartoum hero support(已支持相对路径) | P2(可能不需要)|

**总预计改动**:
- 新增 1 个文件(`CityPageV2.tsx`)
- 修改 4-5 个文件(`CityPage.tsx` / `Router.tsx` / `cities.ts` / `liveMoments.ts` / 可能 `tokens.css`)
- self-host 1 个图
- 总代码量 +500-800 行

---

## ⏰ 节奏建议(3 选项)

### 选项 A · 1 个大 PR(推荐)

**节奏**:1 个 PR,2 个 commit
- commit 1:`feat(cities): add Khartoum + self-host Hero`(数据 + 资源)
- commit 2:`feat(citypage): refactor to A2 4-screen + cleanup liveMoments`(UI 重构 + 数据清理)

**优点**:整体推进快,2-3 天可以合
**缺点**:PR 大(500-800 行),review 慢,合并冲突风险

### 选项 B · 2 个串行 PR

**节奏**:
- PR-1:`feat(cities): add Khartoum + self-host Hero`(数据 + 资源)→ 0.5 天
- PR-2:`feat(citypage): refactor to A2 4-screen + cleanup liveMoments`(UI 重构)→ 2 天

**优点**:风险小,可回滚
**缺点**:节奏慢(2.5 天 vs 3 天)

### 选项 C · 并行分工

**节奏**:
- 工程师 A:`feat(cities)` → 0.5 天
- 工程师 B:`feat(citypage)` → 2 天(可与 A 并行)
- 合 master 前集成测试 → 0.5 天

**优点**:最快(2 天 vs 2.5)
**缺点**:需要 2 个工程师,集成测试风险

**PM 建议**:**选项 A(1 个大 PR,2 个 commit)**。理由:
- 团队规模小(估计 1-2 个工程师),不需要并行
- 数据层和 UI 重构耦合度高(城市数据驱动 4 屏渲染)
- review 一次到位更高效

---

## ⚠️ 不做的事(明确 STOP)

- ❌ 不引入新依赖(沿用 React 18.3 + TypeScript 5.5 + Vite 5.4)
- ❌ 不动 Direction A2 / VF 1.2
- ❌ 不重做 4 屏 Pattern
- ❌ 不重做 Hero(已 LOCKED)
- ❌ 不重做 Same Second
- ❌ 不改 LOCAL / YOUR / Δ 时间排版
- ❌ 不改 mockup(等外部设计师 round 8 反馈)
- ❌ 不动 One Scene 占位(等用户拍板图源)

---

## ✅ 验收清单(PM 视角)

工程师 PR merge 后,我会:
1. ✅ `npm run dev` 启动 dev server
3. ✅ 浏览器实测 12 城路径(`/cities/kyoto` / `/cities/khartoum` 等)
4. ✅ 1440 / 1680 / 1920 三 breakpoint 验证
5. ✅ Khartoum 4 屏视觉对比 mockup(95% 一致即 OK)
6. ✅ Lighthouse score 不退化(参考 v1.5 ≥ 90)
7. ✅ a11y 通过(参考 v1.5 PR #29 22 处修复)
8. ✅ timeDiff 单测不破坏(15/15)

如果验收不通过,工程师补 commit 修复。

---

## 📎 关联文档(必读)

- `06-PM Agent 交接/2026-08-19-pm-takeover-audit.md`(接管审计,4 漏报 + 1 误报)
- `06-PM Agent 交接/2026-08-19-pm-handoff-corrections.md`(校正 v2,5 校正)
- `06-PM Agent 交接/2026-08-18-pm-agent-handoff-complete-status.md`(原 handoff,设计层权威)
- `05-项目现状/d4-a2-khartoum-final.md`(Hero FINAL,8/18)
- `05-项目现状/d4-a2-khartoum-round3.md`(PROMPT 31,8/18 16:56)
- `05-项目现状/d4-a2-khartoum-round3-pm-review.md`(PM 评审 ACCEPTED)
- `07-设计师设计参考/SEE_EARTH_DESIGN_SYSTEM_v1.2_Complete_Spec.md` §2.8.8/8.9/8.10/8.11
- `07-设计师设计参考/前端设计规则/A2 City Detail 设计 brief — 外部设计师 brief.md`(21 项原 brief)
- `outputs/v1.5-mockups/d4-a2-khartoum-final/01-arrival-final.html`(Hero 模板)
- `outputs/v1.5-mockups/d4-a2-khartoum-round3/02-one-scene-v9.html`(One Scene v9 占位)
- `outputs/v1.5-mockups/d4-a2-khartoum-round3/04-echo-state-default.html`(Echo 5 态基础)

---

## 🟢 PM Agent 当前并行推进项

工程师 PR 启动前,PM 在做:
1. ⏳ One Scene 图源决策(等用户拍板 A/C)→ 决策后补图 → Khartoum LOCK
2. ⏳ Hero 12 字段 metadata 补 8 字段(等用户给 Hero 图源信息)
3. ⏳ PROMPT 32 起草(Lisbon,Khartoum LOCK 后启动)
4. ⏳ README.md 更新(7 目录加 round 8 prompt 引用 + Khartoum LOCK 状态)
5. ✅ PM 评审报告(8/19 已完成)
6. ✅ Round 8 外部设计师 QA prompt(8/19 已写好,等用户转发)

**工程师 PR 启动条件**:
- [x] Khartoum mockup 已交付(designer + PM 已 ACCEPT)
- [ ] Khartoum mockup LOCKED(等外部设计师 round 8)
- [ ] One Scene 图源确定(等用户拍板)
- [ ] PR 计划被工程师接受(等工程师 review 本文档)

---

**最后更新**:2026-08-19(2026-08-19 接管 PM Agent)
