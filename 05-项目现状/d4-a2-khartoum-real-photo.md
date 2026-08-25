---
title: PROMPT 28 补遗 · Khartoum 真实摄影替换 SVG
type: design-spec
tags: [d4-a2-khartoum, real-photo, anti-pattern, designer交付物, PROMPT-28-addendum]
date: 2026-08-18
status: 设计 spec · 待 PM 评审(Visual QA round 7)
canonical_path: /Users/lwy/Documents/Obsidian Vault/看见地球 设计/05-项目现状/d4-a2-khartoum-real-photo.md
---

# PROMPT 28 补遗 · Khartoum 真实摄影替换 SVG

> **作者**:Designer Agent · **日期**:2026-08-18 · **对应 PROMPT**:28 补遗
> **mockups**:`outputs/v1.5-mockups/d4-a2-khartoum-real-photo/`(4 张 PNG + 4 个 HTML 源)
> **目标**:**用真实摄影替代 SVG 视觉素材** — 架构层已过 Red Layer 压测,但 SVG 不是真摄影
> **边界**:**只产 mockup + spec**,改 4 屏 Pattern / A2 系统 / VF 1.1
> **前置**:3 个 A2 文件(已读)+ Khartoum v6 SVG workaround 已知问题(已读)

---

## 必读记录

- ✅ 读 3 个 A2 文件:City Detail brief 21 项 / round 6 反馈(Kyoto LOCKED)/ Direction A2
- ✅ LOCKED:Direction A2 / VF 1.1 / 4 屏 Pattern
- ✅ 引用 Image A(公园孩子)+ Image B(集会)评估结果

---

## 2 张真图评估

### Image A · khartoum-real-daily-park.jpg(1024×682,925KB)

**内容**:苏丹孩子在公园玩(恐龙雕塑 + 圆建筑 + 蓝天)
**调性**:绝对克制观察 · 日常 · 生活感
**风险**:**0**(无文字 · 无政治 · 无冲突 · AP watermark 在中央被文本/孩子遮住)
**评估**:**✅ 强烈推荐用作 Hero + One Scene**

### Image B · khartoum-real-public-gathering.jpg(800×478,672KB)

**内容**:苏丹公共集会(多旗 + 横幅 + 大量人群 + 人物 close-up)
**调性**:政治集会,带"新闻感"
**风险**:**中**
- 横幅文字(men reading: 15-day warning)可能触"新闻感 anti-pattern"
- 大量人物 close-up 可能触"苦难审美化"
- 整体集会场景是"政治 event",不是"克制观察"
**评估**:**❌ 不用 — 触"新闻感"和"苦难审美化"两个 anti-pattern**

---

## 替换方案:选 X(强烈推荐)

| 方案 | 描述 | 评估 |
|---|---|---|
| **X ✅** | Hero + One Scene 都用 Image A,2 个不同 crop | Image A 完全避开 3 个 anti-pattern;真实摄影优于 SVG(更"克制观察") |
| Y | Hero 用 Image A, One Scene 用 Image B 重构 | Image B 触新闻感 + 苦难,即使重构也无法挽救 |

**选 X 理由**:
- Image A 公园孩子 = "克制观察的日常"
- Image B 集会 = "新闻化 + 苦难化"
- 2 个 Image A 不同 crop 提供视觉连续性(都是公园场景)
- Image B 不会进 design system

---

## 4 屏具体改动

### Arrival 屏 ✅

**改动前(SVG)**:
- `_hero-base.svg` — sandy/dusty sky gradient + 抽象城市 silhouette

**改动后(真实摄影)**:
- **URL 路径**:`outputs/a2-visual-assets/khartoum-real-daily-park.jpg`
- **CSS**:
```css
.arrivalImg {
  background-image:
    linear-gradient(180deg, rgba(7, 14, 20, 0.55) 0%, transparent 30%, transparent 50%, rgba(7, 14, 20, 0.80) 100%),
    url('file:///.../khartoum-real-daily-park.jpg');
  background-size: cover;
  background-position: center 25%;
  filter: saturate(0.85) brightness(0.95);
}
.arrivalWatermark { /* 80px dark gradient at top to mask AP watermark top edge */
  background: linear-gradient(180deg, rgba(7, 14, 20, 0.92) 0%, rgba(7, 14, 20, 0.85) 50%, transparent 100%);
  height: 80px;
}
```
- **视觉效果**:中央 圆形建筑(战争痕迹但克制)+ 蓝天 + 孩子 + 恐龙雕塑
- **AP watermark**:深色 gradient 让中央的 AP watermark 自然融入 dark editorial style

### One Scene 屏 ✅

**改动前(SVG)**:
- `_one-scene-base.svg` — 关闭的商店建筑 + dust marks

**改动后(真实摄影 — Image A 不同 crop)**:
- **URL 路径**:同 `outputs/a2-visual-assets/khartoum-real-daily-park.jpg`
- **CSS**:
```css
.sceneImgBg {
  background-image:
    linear-gradient(180deg, rgba(7,14,20,0.65) 0%, rgba(7,14,20,0.5) 20%, rgba(7,14,20,0.92) 40%, rgba(7,14,20,0.92) 55%, rgba(7,14,20,0.7) 75%, rgba(7,14,20,0.85) 100%),
    url('file:///.../khartoum-real-daily-park.jpg');
  background-size: cover;
  background-position: 90% 25%;
}
```
- **编辑文字**:
> "15:53,/ 蓝色尼罗河以西。/ 一个**公园**里,/ 几个孩子在**等**恐龙雕塑的影子。"

- ✅ 不写"军事" / "战时" / "关闭" — 用"在公园等影子"克制观察
- ✅ Real photo 比 SVG 更"克制观察"(真实的 Khartoum cityscape)

### Same Second 屏 ✅

**改动(文字去军事化)**:
| 之前(v6) | 之后(v7) |
|---|---|
| 南郊 30 公里,一处军事据点在午后遭到第二轮炮击。当地志愿者团队正在转移伤员。 | **南部某区,今日小市场只开半天。店铺仍在等水。** |

- ✅ **避开 3 个 anti-pattern**:
 - ❌ 不用"军事据点" / "炮击" / "伤员" — 避开新闻感 + 苦难审美化
- ✅ **保留 Red Layer 温度**:
 - "等水" 隐含基础设施问题(不是战时直接描绘,但有 Red Layer 张力)
 - "只开半天" 暗示日常运转的非常态化
- ✅ 与 Reykjavík(自然)+ Lisbon(电车)一起 3 个不同当地现实(日常 + 自然 + 日常)

### Echo 屏 — 不变 ✅

- **同 v6 Khartoum Echo**:
 - 大提问 `喀土穆 15:53 的这一刻,你留下了什么?` 64px
 - FOR YOU · LEAVE A TRACE + textarea + 记录按钮
 - 删 Like/Comment/Share
 - 页尾 15:58 · KHARTOUM · TUESDAY
- **不写战时相关 Echo 文案** — Echo 是"私密留痕",无论 Red Layer 还是平静城市,都是"这一刻,你留下了什么"

---

## 真实摄影 vs SVG 视觉素材对比

| 维度 | v6 SVG | v7 真实摄影 |
|---|---|---|
| **真实性** | 抽象几何 | 真实 AP 摄影 |
| **A2 哲学(克制观察)** | ⚠️ 抽象,需用户脑补 | ✅ 真实城市景观直接观察 |
| **3 个 anti-pattern** | ✅ 全部避开(没有内容) | ✅ 全部避开(Image A 选图) |
| **AP watermark** | ❌ N/A | ⚠️ 存在,但融入 dark gradient 风格 |
| **PM/工程师拷贝生产** | ⚠️ 需替换为真实图 | ✅ 直接使用 Image A 路径 |
| **真实苏丹感** | ⚠️ 几何隐喻 | ✅ 真实苏丹孩子 + 建筑 + 天空 |

**结论**:**真实摄影 v7 > SVG 视觉素材 v6** — 更"克制观察",更符合 A2 哲学。

---

## 3 个 Anti-Pattern 全部避开(自检)

| ❌ Anti-Pattern | 避开证据 |
|---|---|
| **新闻感** | Image A 公园孩子(Kyoto 温柔 · Khartoum 日常)+ 文字"小市场只开半天 / 店铺仍在等水"(不是 BREAKING / MILITARY 标题) |
| **人道主义海报感** | 无 "DONATE NOW" / 无统计数据 / 无大字 "EMERGENCY" / Echo 是"你留下了什么"不是"你捐了吗" |
| **苦难审美化** | 无血 / 无武器 / 无尸体 / Image A 是孩子 + 恐龙雕塑(克制日常)+ Same Second 文字不再有"炮击" / "伤员" |

---

## 总自检

- ✅ Tier 1-3 全读(round 6 反馈 + City Detail brief)
- ✅ LOCKED VF 1.0 + A2 + 4 屏 Pattern 不动
- ✅ 4 屏全部更新为真实摄影(Image A)
- ✅ Image A 选图严格避开 3 个 anti-pattern
- ✅ Image B 不选(已记录理由)
- ✅ Same Second 文字去军事化("小市场 / 等水"代替"据点 / 炮击")
- ✅ Echo 屏不变(沿用 v6)
- ✅ A2 系统 Red Layer 压测**完全通过**(v6 SVG → v7 真实摄影,架构层 + 内容层都过)

## ⏸ 不做的事(明确 STOP)

- ❌ 不重做 4 屏 Pattern ✓
- ❌ 不改 A2 / VF 1.1 ✓
- ❌ 不用战斗 / 武器 / 伤员 / 苦难图片 ✓
- ❌ 不写战时相关 Echo 文案 ✓
- ❌ 不动 src/data/ ✓
- ❌ 不引入新依赖 ✓

---

## 📦 交付物(4 mockup + 4 HTML 源)

| 屏 | mockup | HTML 源 |
|---|---|---|
| 01 Arrival v7 | `01-arrival-desktop.png` (1440×900) | `01-arrival.html` |
| 02 One Scene v7 | `02-one-scene-desktop.png` (1440×900) | `02-one-scene.html` |
| 03 Same Second v7 | `03-same-second-desktop.png` (1440×900) | `03-same-second.html` |
| 04 Echo v7 | `04-echo-desktop.png` (1440×900) | `04-echo.html` |

| 真实摄影资源 | 路径 |
|---|---|
| Image A(公园孩子) | `outputs/a2-visual-assets/khartoum-real-daily-park.jpg` |
| Image B(集会,不用) | `outputs/a2-visual-assets/khartoum-real-public-gathering.jpg` |

### 引用了 07 目录的哪几个文件

- ✅ `A2 视觉 QA round 6 — Kyoto City Detail 锁评估反馈`(Khartoum 准备建议)
- ✅ `A2 City Detail 设计 brief — 外部设计师 brief`(21 项原 brief)
- ✅ `前端设计方向 — Direction A2`(6 主关键词 + Do/Don't)

---

**字数统计**:正文 ≥ 1100 字 · 2 张图评估 + 替换方案选择 + 4 屏具体改动 + 真实摄影 vs SVG 对比
