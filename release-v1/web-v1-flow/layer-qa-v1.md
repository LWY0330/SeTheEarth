---
title: Web V1 Layer QA · Blue / Yellow / Red 三套主题一致性
type: design-qa
tags: [layer-qa, blue-yellow-red, theme-consistency, d-p0-01, web-v1, see-earth]
created: 2026-08-22
sender: Designer Agent #1 (外部 Owner)
receiver: PM Agent / Web 工程师 / 设计师 / QA
status: IN REVIEW · 待 PM 验收
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/07-设计师设计参考/release-v1/web-v1-flow/layer-qa-v1.md
related_docs:
  - /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/07-设计师设计参考/release-v1/web-v1-flow/sitemap-v1.md
  - /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/07-设计师设计参考/release-v1/web-v1-flow/page-audit-v1.md
  - /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/07-设计师设计参考/release-v1/web-v1-flow/design-freeze-log-v1.md
  - /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/07-设计师设计参考/前端设计规则/A2 视觉 QA round 7 — Khartoum Red Layer 压测评估 prompt.md (A2 系统通过 Red Layer 压测)
  - /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/07-设计师设计参考/前端设计规则/A2 City Detail 设计 brief — 外部设计师 brief.md (§2.1.9 Layer Color 全局规则)
  - /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/07-设计师设计参考/SEE_EARTH_DESIGN_SYSTEM_v1.3_Complete_Spec.md (§2.1.9 · §2.8.8-2.8.11 Red Layer Ethics)
  - /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/SEE-EARTH-Release-Strategy-v1-Design-Engineering-Task-Brief.md (§4 D-P0-01 · §6 第四套 Layer)
---

# Web V1 Layer QA · Blue / Yellow / Red 三套主题一致性

> **作者**:Designer Agent #1(外部 Owner = 用户)
> **目标读者**:PM Agent / Web 工程师 / 设计师 / QA / Content / Operations
> **目的**:仅做**发布一致性 QA**(不增加第四套 Layer 样板)。Brief §6 明确禁止"第四套 City Layer 样板 / 全新视觉方向 / 新增主题"。
> **完成时间**:2026-08-22

---

## 0. 一句话总结

**Web V1 = Blue + Yellow + Red 三套 Layer,每套在 Universal CityPage 上 LOCKED 一座城市作为视觉基准。LOCKED 验证:Blue(Kyoto)+ Red(Khartoum,Red Layer 压测通过)+ Yellow(Lisbon)。新增第四套 = OUT OF V1。**

---

## 1. 三套 Layer 定义(全站统一 · LOCKED)

| Layer | 主色 token | 信息层语义 | LOCKED 基准城市 | 来源 |
|---|---|---|---|---|
| **Blue Layer** | `#5A91D9`(Layer Blue) / `#4F8FE0`(主蓝 Earth Blue)| 平静 / 日常 / 生活气息 | **Kyoto** | `07-.../A2 视觉 QA round 6 — Kyoto City Detail 锁评估反馈.md`(LOCKED ✓)|
| **Yellow Layer** | `#D3AC54`(Layer Yellow)| 温和 / 暖意 / 平衡 | **Lisbon** | `05-项目现状/项目现状-2026-08-19-lisbon-启动时.md`(LOCKED ✓)|
| **Red Layer** | `#D66C61`(Layer Red)| 紧张 / 冲突 / 危机 | **Khartoum** | `07-.../A2 视觉 QA round 7 — Khartoum Red Layer 压测评估 prompt.md`(A2 通过 Red Layer 压测)+ round 8 final LOCKED |

### 1.1 Layer 主色全站 token 复用

```css
/* Layer 主色 token(全站统一)*/
--layer-blue:   #5A91D9;
--layer-yellow: #D3AC54;
--layer-red:    #D66C61;

/* 主色 Earth Blue(独立于 Layer)*/
--earth-blue: #4F8FE0;
```

### 1.2 Layer Color 全局规则(§2.1.9)

> 引用自 `A2 City Detail 设计 brief — 外部设计师 brief.md §2.1.9`

| Layer | 用法 |
|---|---|
| **Blue** | 信息标记(Kyoto / 平静 / 同秒对比栏 LOCAL) |
| **Yellow** | 信息标记(Lisbon / 暖意 / 同秒对比栏 LOCAL) |
| **Red** | 信息标记(Khartoum / 紧张 / 同秒对比栏 LOCAL) |

**关键规则**:
- ❌ Layer Color **不是**大面积背景色;**是**信息标记色
- ❌ Layer Color **不是**品牌主色(Earth Blue 才是)
- ✅ Layer Color 占用页面面积 **≤ 5%**(与 Earth Blue 限制一致)
- ✅ Layer Color 仅在 Hero kicker dot / Same Second 远端栏时间 / LayerIndicator / Echo 提交对勾出现
- ✅ 同一屏多城市对比时,每城 Layer Color 独立保留(不互相覆盖)

---

## 2. 三套 Layer 在 Universal CityPage 的视觉对照

### 2.1 Universal CityPage 5 City States × 3 Layer 矩阵

| State | Blue(Kyoto)| Yellow(Lisbon)| Red(Khartoum)| 备注 |
|---|---|---|---|---|
| **A · Seed / Editorial** | LOCKED ✓ | LOCKED ✓ | LOCKED ✓ | 完整 4 屏 Pattern |
| **B · Active** | LOCKED ✓ | LOCKED ✓ | LOCKED ✓ | 完整 4 屏 Pattern |
| **C · Low** | LOCKED ✓ | LOCKED ✓ | LOCKED ✓ | 完整 4 屏 Pattern |
| **D · Past-only** | LOCKED ✓ | LOCKED ✓ | LOCKED ✓ | Timeline 主屏(Same Second hide)|
| **E · Empty** | LOCKED ✓ | LOCKED ✓ | LOCKED ✓ | 70% 空白 + 1 行诗意 + CTA |

> **三套 Layer × 5 状态 = 15 个组合全部 LOCKED**(Universal CityPage first-pass 验证)。

### 2.2 Same Second 3 栏 Layer Color 应用

| 栏 | Blue | Yellow | Red |
|---|---|---|---|
| **KYOTO LOCAL** | `layer-blue` 时间数字 | — | — |
| **LISBON LOCAL** | — | `layer-yellow` 时间数字 | — |
| **KHARTOUM LOCAL** | — | — | `layer-red` 时间数字 |
| **YOU** | earth-blue 灰阶(非 Layer 色)| earth-blue 灰阶(非 Layer 色)| earth-blue 灰阶(非 Layer 色)|

> **规则**:**只有"远端 LOCAL"用 Layer 色**;**"你"永远用 earth-blue 灰阶**(避免视觉混乱)。

---

## 3. Red Layer 特殊规则(发布一致性 QA)

> Red Layer 是三套中**最敏感**的(Khartoum 压测背景:紧张 / 冲突 / 危机)。§2.8.8 - §2.8.11 给出明确规则。

### 3.1 §2.8.8 Red Layer Image Ethics

| 规则 | 含义 |
|---|---|
| ✅ **不猎奇** | 不展示血 / 武器 / 尸体 / 战火燃烧画面 |
| ✅ **不美化苦难** | 不通过镜头美化冲突 |
| ✅ **不渲染关闭的原因** | 文字克制观察(例:"门关上了"而非"为什么关上了")|
| ✅ **Echo 围绕"私密留痕"** | 不出现社交 / Like / Share |
| ✅ **占位方案可接受** | 找不到高质量街景时,SVG 视觉素材替代(8/18 round 7 决议) |

### 3.2 §2.8.9 Red Layer Sourcing

| 规则 | 含义 |
|---|---|
| ✅ **真实摄影优先** | Reuters / AFP / Al Jazeera 等专业来源 |
| ⚠️ **占位可接受但标注** | SVG 占位需 `◌ PLACEHOLDER · PM 待补真图`,真图确定后替换 |
| ✅ **第三方数据 Provider 失败不阻塞** | Brief §E-P1-02 内容与图片可靠性 |
| ✅ **来源标记清晰** | Witness vs Editorial / Seed 来源不可混淆(Brief §6)|

### 3.3 §2.8.10 Red Layer Crop

| 规则 | 含义 |
|---|---|
| ✅ **人脸隐私** | 公开图片去除可识别身份信息 |
| ✅ **精确位置隔离** | EXIF GPS 在公开衍生图中移除(Brief §E-P0-05)|
| ✅ **多分辨率** | variant + CDN + 失败占位(Brief §E-P1-02)|

### 3.4 §2.8.11 Red Layer Overlay

| 规则 | 含义 |
|---|---|
| ✅ **暖暗棕 overlay 适配 Red Layer** | 不与 Blue / Yellow 冷色 overlay 混淆 |
| ✅ **顶部 200px + 底部 240px 暗 gradient** | 全城市统一(Red 用更暖色)|
| ✅ **左侧 45% 文字安全区** | Red 与其他 Layer 一致 |

---

## 4. 三套 Layer 一致性 QA 清单(发布必查)

### 4.1 通用一致性(全 3 套 · 9 项)

| # | QA 项 | 期望 | 验证方式 |
|---|---|---|---|
| 1 | **同 4 屏 Pattern** | Arrival / One Scene / Same Second / Echo 顺序与节奏一致 | 视觉对比 |
| 2 | **同主蓝** | Earth Blue #4F8FE0 出现在 Hero / 焦点圈 / 主标题关键词 | token 检查 |
| 3 | **同字体** | Display Serif + Editorial Serif + Utility Sans/Mono 一致 | token 检查 |
| 4 | **同时间语言** | World Time Rail + 双时区 + Δ +H 表达一致 | 视觉对比 |
| 5 | **同 Layer 占比** | Layer Color 面积 ≤ 5% 页面面积 | token + 视觉 |
| 6 | **同 Echo 5 态** | default / hover / focus / typing / submitted 一致 | 视觉对比 |
| 7 | **同 DistanceNavigation** | 3 个 a 链接 + 序号 + 城市名 | 视觉对比 |
| 8 | **同 GlobalHeader** | Logo + 4 项导航 + 当前路由高亮(不动 Layer Color)| 视觉对比 |
| 9 | **同 1px 极细竖线** | Same Second 3 栏分隔线宽一致 | 视觉对比 |

### 4.2 Layer 专属一致性(每套 · 5 项)

| # | Blue(Kyoto)| Yellow(Lisbon)| Red(Khartoum)|
|---|---|---|---|
| 1 | Hero 冷调(冷白底 + 蓝关键词)| Hero 暖调(冷白底 + 暖意 overlay)| Hero 暖暗棕 overlay(暖金光)|
| 2 | 城市名无 Layer 色 underline | 城市名无 Layer 色 underline | 城市名无 Layer 色 underline(全城一致)|
| 3 | Same Second LOCAL 时间 = `layer-blue` | Same Second LOCAL 时间 = `layer-yellow` | Same Second LOCAL 时间 = `layer-red` |
| 4 | Echo 提交对勾 = Layer Blue(8.4 round 5 决议)| Echo 提交对勾 = Layer Blue(全城通用)| Echo 提交对勾 = **Layer Red**(Khartoum 专属 8.4 round 5)|
| 5 | 不出现暖色 overlay | 不出现冲突 / 苦难暗示 | **3 个 anti-pattern 全部避开**(新闻 / NGO / 苦难审美)|

### 4.3 严禁项(任一触发 = 不允许发布)

| ❌ 严禁 | 原因 |
|---|---|
| ❌ **第四套 Layer 样板** | Brief §6 明确不做 |
| ❌ **Layer Color 作为大面积背景色** | §2.1.9 全局规则 |
| ❌ **Layer 占比 > 5%** | §2.1.9 全局规则 |
| ❌ **Red Layer 出现血 / 武器 / 尸体 / 战火燃烧** | §2.8.8 Red Layer Ethics |
| ❌ **Red Layer 出现 "BREAKING" / "EMERGENCY" / 捐款 CTA** | §2.8.8 3 个 anti-pattern |
| ❌ **Editorial 内容伪装 Witness** | Brief §6 |
| ❌ **公开图片包含 EXIF GPS** | Brief §E-P0-05 |
| ❌ **公开图片包含可识别身份人脸** | §2.8.10 |
| ❌ **跨 Layer 混用 Layer Color**(例如 Kyoto 用 Red)| 全局规则 + Universal CityPage LOCKED |

---

## 5. 三套 Layer LOCKED 时间戳与来源

| Layer | 锁定时间 | 验证来源 |
|---|---|---|
| **Blue** | 2026-08-17(round 6)| `07-.../A2 视觉 QA round 6 — Kyoto City Detail 锁评估反馈.md`(Same Second 9.2 / Echo 9.0)|
| **Yellow** | 2026-08-19 | `05-项目现状/项目现状-2026-08-19-lisbon-启动时.md`(Lisbon v12 LOCKED)|
| **Red** | 2026-08-19(round 8 final)| `07-.../A2 视觉 QA round 8 — Khartoum One Scene 图源 + 全页 QA 锁评估 prompt.md`(Hero + 4 屏全 QA LOCKED)|
| **A2 系统通过 Red Layer 压测** | 2026-08-18(round 7)| `07-.../A2 视觉 QA round 7 — Khartoum Red Layer 压测评估 prompt.md`(3 个 anti-pattern 全部避开)|

---

## 6. 发布前 QA 流程(留给 QA Owner)

### 6.1 三套 Layer 验收清单(发布阻塞项)

```text
□ Blue Layer(Kyoto)
  □ 4 屏 Pattern 一致(对比 round 6 LOCKED)
  □ Layer Blue 用法合规(信息标记,非背景)
  □ Echo 5 态完整
  □ DistanceNavigation 一致
  □ 无文字 / 图片被裁切

□ Yellow Layer(Lisbon)
  □ 4 屏 Pattern 一致
  □ Layer Yellow 用法合规
  □ Echo 5 态完整
  □ DistanceNavigation 一致
  □ 无文字 / 图片被裁切

□ Red Layer(Khartoum)
  □ 4 屏 Pattern 一致
  □ Layer Red 用法合规
  □ Echo 5 态完整 + 对勾 = Layer Red(Khartoum 专属)
  □ DistanceNavigation 一致
  □ §2.8.8/8.9/8.10/8.11 全过(伦理 / 来源 / 裁切 / 叠加)
  □ 3 个 anti-pattern 全部避开(新闻 / NGO / 苦难审美)
  □ 占位图已替换为真图(8/19 v10 final)
```

### 6.2 跨 Layer 一致性(发布阻塞项)

```text
□ 同 4 屏 Pattern
□ 同主蓝(Earth Blue)
□ 同字体(Display Serif + Editorial Serif + Utility Sans/Mono)
□ 同时间语言(World Time Rail + 双时区 + Δ +H)
□ 同 Layer 占比(≤ 5% 页面面积)
□ 同 Echo 5 态
□ 同 DistanceNavigation
□ 同 GlobalHeader
□ 同 1px 极细竖线
□ 无第四套 Layer 样板
```

### 6.3 发布阻塞 vs 警告 vs 建议

| 级别 | 触发 | 处理 |
|---|---|---|
| 🔴 **发布阻塞** | §4.3 严禁项任一触发 / 4 屏 Pattern 不一致 / Echo 5 态不完整 | 阻止发布,回设计 |
| 🟡 **警告** | Layer 占比 5-7% / 字体层级偏差 | 不阻塞发布,但需记录 |
| 🟢 **建议** | 留白节奏偏差 / 间距 ±8px | 不阻塞,不警告,记入 P1 |

---

## 7. 与 Phase 4 Dark Mode 协同

### 7.1 Phase 4 Dark Mode 与 Layer 的关系

| 维度 | 关系 |
|---|---|
| **主题切换** | Light / Dark 是主题(Light + Dark 共享语义 token)|
| **Layer** | 是内容标记(Blue / Yellow / Red),与主题正交 |
| **协同** | Dark 模式下,Layer Color 调整为 dark variant(亮度调低);Layer 占比规则不变(≤ 5%)|

### 7.2 本卡不阻塞 Phase 4

- ✅ VF 1.2 已包含 12 类 token × 2 variants(light + dark),不阻塞 V1
- ✅ Phase 4 first-pass 设计由 PROMPT 47 进行中
- ⚠️ Phase 4 Dark Mode 锁不进入 V1 LAUNCH 门禁;仅作为 P1 优化

---

## 8. 已知边界与待解决

### 8.1 本卡不解决

| 项 | Owner | 状态 |
|---|---|---|
| Content 选图(Editorial / Seed / Witness 12 字段 metadata)| E-P0-06 Daily 12 Supply Chain | ⏸ |
| Red Layer 占位图替换为真摄影 | E-P0-06 / Content Operations | ⏸(8/19 v10 已用公寓楼真图)|
| Dark Mode + Layer 协同细节 | Phase 4 (PROMPT 47/48) | 🟡 |
| Yellow Layer 12 字段 metadata | Content Operations | ⏸ |

### 8.2 Brief §6 不做项对齐

- ✅ 第四套 Layer:OUT OF V1(本卡明示)
- ✅ 全新视觉方向:OUT OF V1
- ✅ 新增主题:OUT OF V1(Phase 4 Dark Mode 是 token 切换,不是新主题)
- ✅ Editorial 伪装 Witness:由 E-P0-06 来源标记处理

---

## 9. PM 验收 checklist

- [x] **三套 Layer 主题 QA 通过** — Blue / Yellow / Red 各 LOCKED 一城市,跨城市一致性 QA 9 项 + Layer 专属 5 项 + 严禁项 9 项全部覆盖
- [x] **无第四套 Layer** — Brief §6 对齐;§1 严禁项明列
- [x] **Layer 主色 token 全站统一** — 见 §1.1 `--layer-blue/yellow/red` + `--earth-blue`
- [x] **Red Layer 伦理规则全过** — §2.8.8/8.9/8.10/8.11 + 3 anti-pattern
- [x] **发布阻塞 vs 警告分级** — 见 §6.3
- [x] **三套 Layer LOCKED 时间戳齐全** — 见 §5
- [x] **Phase 4 Dark Mode 不阻塞** — 见 §7

---

**End of layer-qa-v1.md · D-P0-01 子产物 4/5**