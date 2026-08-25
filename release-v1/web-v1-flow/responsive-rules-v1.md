---
title: Web V1 Responsive Rules · 三档断点规则
type: design-rules
tags: [responsive, breakpoints, desktop-tablet-mobile, d-p0-01, web-v1, see-earth]
created: 2026-08-22
sender: Designer Agent #1 (外部 Owner)
receiver: PM Agent / Web 工程师 / 设计师 / QA
status: IN REVIEW · 待 PM 验收
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/07-设计师设计参考/release-v1/web-v1-flow/responsive-rules-v1.md
related_docs:
  - /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/07-设计师设计参考/release-v1/web-v1-flow/sitemap-v1.md
  - /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/07-设计师设计参考/release-v1/web-v1-flow/page-audit-v1.md
  - /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/07-设计师设计参考/release-v1/web-v1-flow/layer-qa-v1.md
  - /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/07-设计师设计参考/SEE_EARTH_DESIGN_SYSTEM_v1.3_Complete_Spec.md (§5 Responsive · §7 Component Responsive)
  - /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/SEE-EARTH-Release-Strategy-v1-Design-Engineering-Task-Brief.md (§4 D-P0-01)
---

# Web V1 Responsive Rules · 三档断点规则

> **作者**:Designer Agent #1(外部 Owner = 用户)
> **目标读者**:Web 工程师 / 设计师 / QA / PM
> **重要原则**:**响应式三档规则 ≠ 机械缩放**。Task Card DO NOT 明确写"不做机械缩放"。本文档定义 Desktop / Tablet / Mobile 三档下,**信息层级如何调整 + 交互如何重排**,而不仅是尺寸缩小。
> **完成时间**:2026-08-22

---

## 0. 一句话总结

**Web V1 三档 = Desktop (≥ 1280px) + Tablet (768-1279px) + Mobile (< 768px)。Desktop 是设计主轴;Tablet 是阅读轴;Mobile 是 Presence 轴(优先可达性,不优先美学)。任何锁定页面在 Tablet / Mobile 都不允许出现"屏幕被裁切"或"字号过小"。**

---

## 1. 三档断点定义(全站统一)

| 档位 | 范围 | 设计角色 | 信息密度 |
|---|---|---|---|
| **Desktop** | **≥ 1280px** | **设计主轴** | 高(全要素可见)|
| **Tablet** | **768-1279px** | **阅读轴** | 中(信息重排,内容不变)|
| **Mobile** | **< 768px** | **Presence 轴** | 低(留白增加,核心优先)|

> **不要再切细分档**(Brief 不要求)。三档足够,且避免工程师实现碎片化。

---

## 2. 全局响应式规则(三档通用)

### 2.1 Typography 缩放表

| 元素 | Desktop | Tablet | Mobile | 缩放原则 |
|---|---|---|---|---|
| **城市名(Serif Display)** | 120px | 96px | 64px | 桌面主轴 → 移动降权不破坏层级 |
| **Hero 大标题(Serif)** | 72-80px | 56-64px | 40-48px | 大尺度,但移动不超过 48px |
| **章节标题(Serif)** | 28-36px | 24-28px | 20-24px | |
| **正文** | 17-18px | 16-17px | 16px | **移动不小于 16px**(可读性下限)|
| **Meta / 11px META** | 11px | 11px | 11px | 不缩(行业标准下限)|
| **Local Time(Serif)** | 64px | 56px | 44-48px | 移动仍为视觉重点 |
| **Time Mono(World Time Rail)** | 22-64px | 20-48px | 16-32px | 移动时间字号必须 ≥ 16px |
| **Line Height** | 1.7-1.85 | 1.7-1.85 | 1.6-1.75 | 移动正文略密,但仍保留呼吸 |
| **Max Width(正文)** | 580-680px | 560-640px | 100% - 32px | 移动不强制 max-width |

### 2.2 Spacing 缩放表

| 间距类型 | Desktop | Tablet | Mobile | 缩放原则 |
|---|---|---|---|---|
| **Hero → Chapter 1** | 120-160px | 96-128px | 72-96px | |
| **Chapter → Chapter** | 160px | 128px | 96px | |
| **正文 → Image** | 64-96px | 56-80px | 48-64px | |
| **Image → 下一文字** | 96-128px | 80-96px | 64-80px | |
| **Page Padding(横向)** | 32px | 32px | 20px | 移动边距更紧 |
| **Grid Container 宽度** | 1376 / 1616 / 1856px(3 desktop breakpoint)| 720-1184px | 100% - 40px | |

### 2.3 Grid 规则

| 档位 | 列数 | Gutter |
|---|---|---|
| **Desktop** | 12 列 | 24px |
| **Tablet** | 8 列 | 20px |
| **Mobile** | 4 列 | 16px |

### 2.4 图片规则

| 档位 | 行为 |
|---|---|
| **Desktop** | 全幅 / 8 columns / 5 columns / 4 columns 多样尺寸(图片参与叙事)|
| **Tablet** | 全幅 / 8 columns / 4 columns(简化版)|
| **Mobile** | 全幅 / 4 columns(移动一律 4 列宽度,无 5 / 8 列细分)|

### 2.5 焦点圈 / 触控

| 档位 | 焦点圈 | 触控目标 |
|---|---|---|
| **Desktop** | Earth Blue `0 0 0 2px rgba(26, 77, 126, 0.40)` | hover 状态可交互;最小触控目标 ≥ 32px |
| **Tablet** | 同 Desktop | 触控 + hover 双支持;最小触控目标 ≥ 44px(iOS HIG)|
| **Mobile** | 同 Desktop | 仅触控;最小触控目标 ≥ 44px;DistanceNavigation 触摸区域 ≥ 48px |

---

## 3. 逐页面规则

### 3.1 Homepage(P0-1)· LOCKED ✓

| 档位 | 行为 |
|---|---|
| **Desktop ≥ 1280px** | 7 块(Hero / 12 Coordinates / Live Events / Spotlight / Worlds Collide / Witness CTA / Footer)按 A2 v2-phase15 布局 |
| **Tablet 768-1279px** | Hero / 12 Coordinates / Spotlight / Worlds Collide 全宽;Live Events 改为 2 列(Live Events 4 条 → 2x2);Footer 保持 |
| **Mobile < 768px** | Hero 全屏高(100vh - 56px nav);12 Coordinates 横向滚动(保留 World Time Rail);Live Events 改为单列(4 条纵向);Spotlight / Worlds Collide 单列;Footer 折叠为汉堡菜单 |

**移动特别规则**:
- ⚠️ **Live Events 时间列绝不允许被裁切**(8/17 round 2 P0 bug 已识别,移动布局必须 fix)
- ⚠️ **World Time Rail 横向滚动必须有视觉提示**(右侧 fade-out gradient 暗示可滚动)
- ⚠️ **Hero 大标题在移动不超过 48px**(防止占满屏幕)

### 3.2 Universal CityPage(P0-3)· LOCKED ✓

| 档位 | 行为 |
|---|---|
| **Desktop ≥ 1280px** | 4 屏 Pattern(Arrival / One Scene / Same Second / Echo)+ DistanceNavigation |
| **Tablet 768-1279px** | 4 屏保留;Hero 图缩为 80vh;Same Second 3 栏平权保留(栏宽自适应);正文 max-width = 640px |
| **Mobile < 768px** | 4 屏 Pattern 保留但**顺序不变**;Arrival 屏:城市名 64px + 双时区上下排列(LOCAL 上 / YOUR 下 / +H 在中间);One Scene:大图 + 极短文字 1 屏;Same Second:3 栏改为单列纵向(LOCAL → YOUR → 远端);Echo:大提问 64px + textarea 全宽 |

**移动特别规则**:
- ⚠️ **Same Second 1px 极细竖线在移动不可见**(纵向排列后用 24px 空白替代)
- ⚠️ **DistanceNavigation 在移动变为 sticky bottom bar**(3 个 a 链接等宽分布)
- ⚠️ **Hero 图高度 = 60vh**(避免占满屏幕,留视觉空间)

### 3.3 Unknown Coordinate(P0-4)· LOCKED ✓ (CONDITIONAL)

| 档位 | 行为 |
|---|---|
| **Desktop ≥ 1280px** | full-bleed 100vh - 56px nav;顶部 30% 标题区 + 底部 9% UTC 块 |
| **Tablet 768-1279px** | full-bleed 90vh - 56px nav;Reveal 阶段字号略缩 |
| **Mobile < 768px** | full-bleed 80vh;Reveal 字号 16px 起步;Logo + 1 dot 简化为 Logo + 状态文字 |

**移动特别规则**:
- ⚠️ **Reveal 阶段(Stage 1-4)坐标数字字号 ≥ 24px**(可读性下限)
- ⚠️ **Stage 5 揭示后跳转 CityPage** 在移动端直接进入 Arrival 屏,不重载

### 3.4 Minimal Witness Flow(P0-5)· 由 D-P0-02 出稿

| 档位 | 行为 |
|---|---|
| **Desktop ≥ 1280px** | 6 段流程 + 隐私文案(待 Lock)|
| **Tablet 768-1279px** | 同 Desktop |
| **Mobile < 768px** | **优先档位**(Witness 大概率在移动端发生);相机/相册全屏;位置权限 modal 全屏;textarea 全宽;隐私确认按钮 sticky bottom |

**移动特别规则**(本卡预留给 D-P0-02):
- ⚠️ **相机权限拒绝后必须显示跳过路径**(Brief §D-P0-02)
- ⚠️ **位置权限拒绝后必须有"手动选择城市" CTA**
- ⚠️ **上传进度条在移动端 ≥ 4px 高度**(可视性)

### 3.5 About / Method(P0-6)· NEEDS STATE

| 档位 | 行为 |
|---|---|
| **Desktop ≥ 1280px** | 文档类页面,12 列网格;标题 56px Serif,正文 18px |
| **Tablet 768-1279px** | 8 列网格;标题 48px,正文 17px |
| **Mobile < 768px** | 4 列网格;标题 36px,正文 16px;TOC 折叠 |

### 3.6 Privacy(P0-7)· NEEDS STATE

| 档位 | 行为 |
|---|---|
| 同 About | 文档类页面 |

---

## 4. 交互差异(三档规则)

### 4.1 导航交互

| 档位 | 顶部导航 | 底部导航 |
|---|---|---|
| **Desktop** | 横向 4 项 + Witness CTA + Logo | Footer 含 About / Method / Privacy |
| **Tablet** | 横向 4 项(可缩为 3 项:Today / Unknown / About)+ Witness CTA + Logo | Footer 同 Desktop |
| **Mobile** | Logo + Witness CTA + 汉堡菜单(展开后 4 项) | Footer 折叠 |

### 4.2 CTA 触发

| 档位 | 触发方式 |
|---|---|
| **Desktop** | hover(轻提示)+ click |
| **Tablet** | touch(主要)+ hover 双支持 |
| **Mobile** | touch only;无 hover |

### 4.3 滚动行为

| 档位 | 滚动行为 |
|---|---|
| **Desktop** | 自然滚动;World Time Rail 横向滚动(独立) |
| **Tablet** | 自然滚动;World Time Rail 横向滚动 + fade-out 提示 |
| **Mobile** | 自然滚动;World Time Rail 横向滚动 + 右侧 fade gradient |

### 4.4 模态 / Sheet

| 档位 | 模态行为 |
|---|---|
| **Desktop** | 居中 modal + 背景遮罩 |
| **Tablet** | 居中 modal 或底部 sheet(根据内容长度)|
| **Mobile** | 底部 sheet 全屏(Witness 6 段每段可用 sheet)|

---

## 5. 信息层级调整(关键 · 非机械缩放)

### 5.1 桌面 → 移动的层级重构原则

| 原则 | 含义 |
|---|---|
| **优先级保留** | 移动保留 80% 桌面优先级,放弃 20% 次要信息(如 Footer 链接层级压缩) |
| **视觉重量守恒** | 城市名 / Hero 大标题 / 大提问(Echo)在三档下保持视觉重量(降字号但升字重 / 反之) |
| **留白反转** | 移动增加**纵向**留白,允许页面变长;桌面**横向**留白多,允许页面变宽 |
| **横向 → 纵向** | Same Second 3 栏、Live Events 4 条、World Time Rail → 移动一律纵向排列或保留横向滚动 |
| **Hover → Touch** | 桌面 hover 状态在移动端要么 always-on(默认状态),要么去掉;不能悬空 |

### 5.2 桌面 → 平板的层级重构原则

| 原则 | 含义 |
|---|---|
| **保留全要素** | Tablet 不缩内容,只重排布局 |
| **列数 12 → 8** | 网格简化;Same Second 3 栏保留 |
| **字号 -10%** | 整体缩 ~10%,不留过多纵向空白 |
| **容器自适应** | Container 720-1184px |

### 5.3 三档共通禁忌(发布阻塞项)

| ❌ 禁忌 | 原因 |
|---|---|
| ❌ **不允许字号过小** | 移动正文 < 16px / Meta < 11px = 触发可读性 blocker |
| ❌ **不允许屏幕被裁切** | Live Events 时间列 / Same Second 远端列绝不允许横向裁切 |
| ❌ **不允许横向滚动主体** | 只有 World Time Rail 允许;其他主体内容横向滚动 = 阻塞 |
| ❌ **不允许 hover-only 交互** | 移动无 hover,所有桌面 hover 行为必须有 touch 替代 |
| ❌ **不允许机械缩放** | 仅按 viewport 缩放而无视信息层级 = Task Card DO NOT |
| ❌ **不允许隐藏 CTA** | Witness / DistanceNavigation 在移动必须可见,不可藏到汉堡菜单深层 |

---

## 6. 设计验证清单(每页发布前必查)

### 6.1 通用(所有页面)

- [ ] 1440 / 1680 / 1920 Desktop 三 breakpoint 视觉一致
- [ ] 1024 / 768 Tablet 两档无裁切
- [ ] 390 / 375 / 360 Mobile 三宽度(iPhone 14 / SE / 旧款)无 overflow
- [ ] Touch target ≥ 44px(iOS HIG)/ ≥ 48px(Material)
- [ ] Focus 圈在 keyboard Tab 顺序下完整(Earth Blue 2px)
- [ ] 滚动行为符合预期(无主体横向滚动)
- [ ] 字号下限 ≥ 16px(移动正文)

### 6.2 页面特定

| 页面 | 必查 |
|---|---|
| Homepage | Live Events 时间列无裁切;World Time Rail 横向滚动有 fade 提示 |
| CityPage | Same Second 3 栏平权在 Tablet / Mobile 重排正确;DistanceNavigation 在 Mobile sticky bottom |
| Unknown | Reveal 阶段坐标数字 ≥ 24px;Stage 5 跳转不重载 |
| Witness | 权限拒绝有跳过路径;上传进度 ≥ 4px 高度(移动)|
| About / Privacy | TOC 折叠正确;锚点跳转平滑 |

---

## 7. 已知边界与待解决

### 7.1 本卡未解决

| 项 | Owner | 状态 |
|---|---|---|
| Component Library 14 组件的 responsive 细节 | Phase 5 + PROMPT 46 工程实现 | ⏸ |
| Witness Flow 6 段移动端交互细节 | D-P0-02 | NOT STARTED |
| 触摸手势(swipe to next city)| P1 / 不阻塞 V1 | OUT OF V1 |
| 横竖屏切换策略 | P1 / 不阻塞 V1 | OUT OF V1 |

### 7.2 Brief §6 不做项对齐

- ✅ Native Android:不在 responsive 范围(Brief §6)
- ✅ 横竖屏 iPad Pro 等"特殊断点":不做细分档(三档足够)
- ✅ 触控手势(swipe 等):OUT OF V1

### 7.3 与 Phase 5 路线图对齐

| Phase 5 任务 | 本卡覆盖 |
|---|---|
| Tablet 启动 | ✅ 三档规则已定义 |
| Mobile 启动 | ✅ 三档规则已定义 |
| 横竖屏策略 | ⏸ OUT OF V1 / P1 |
| 触摸手势 | ⏸ OUT OF V1 / P1 |

---

## 8. PM 验收 checklist

- [x] **响应式三档规则明确,不是简单缩放**(见 §5 信息层级调整原则)
- [x] **Desktop 是设计主轴**(1440 / 1680 / 1920 三 breakpoint 一致性由 Universal CityPage LOCKED 验证)
- [x] **Tablet 是阅读轴**(保留全要素,只重排布局)
- [x] **Mobile 是 Presence 轴**(留白增加,核心优先,可读性优先)
- [x] **每页三档规则明确**(见 §3 逐页面规则)
- [x] **交互差异明确**(见 §4 导航 / CTA / 滚动 / 模态)
- [x] **设计验证清单完备**(见 §6)
- [x] **三档共通禁忌明确**(见 §5.3 发布阻塞项)

---

**End of responsive-rules-v1.md · D-P0-01 子产物 3/5**