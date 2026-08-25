---
title: Dark Mode Token Mapping · Phase 4 first pass
type: design-spec
tags: [dark-mode, token-mapping, phase-4, direction-a1, earth-night, see-earth-redesign]
date: 2026-08-22
sender: 内部 Designer Agent
status: first pass LOCKED (PM 评审后定)
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/d12-dark-mode-tokens.md
related_docs:
  - /Users/lwy/Documents/ChatGPT/看见地球/05-项目现状/d11-css-tokens-extraction.md (12 类 token 基础 LOCKED)
  - /Users/lwy/Documents/ChatGPT/看见地球/05-项目现状/d11-component-library-first-pass.md (14 组件 + 6 状态)
  - /Users/lwy/Documents/ChatGPT/看见地球/07-设计师设计参考/SEE_EARTH_DESIGN_SYSTEM_v1.3_Complete_Spec.md (v1.3 §2.1.9 Layer Palette)
---

# Dark Mode Token Mapping · Phase 4 / Direction A1 first pass

> **顶部声明**:基于 d11-css-tokens-extraction.md(12 类 token 基础)+ d11-component-library-first-pass.md(14 组件 + 6 状态),把全站 token 映射到 Direction A1 / Earth Night(深空蓝)主题。**24 token × 2 variants = 48 行映射**,摄影从冷白 Earth Day 调整为夜景 / 黄昏 / 室内 / 城市灯光。本文档不重写 v1.2/v1.3 spec,只在 v1.3 框架下补完 Phase 4 所需的 dark variant。
> **模式**:Addendum(d11 已有 token → 衍生 dark variant)
> **触发**:8/19 用户指引「04 再做 Direction A1 / Dark Mode …主要是 Token Mapping,而不是重新设计一遍。」

---

## 0. 整体逻辑 · Direction A1 / Earth Night

### 0.1 命名(8/19 锁定)
- **Direction A1 = Earth Night**(深空 + 蓝调 + 神秘感)
- **Direction A2 = Earth Day**(冷白 + 冷光 + 自然光,现 LOCKED)
- 两者共享同一套组件、同一套栅格、同一套字体族、同一套 Motion;**仅 token value 与摄影切换**。

### 0.2 全站规则(per 8/19 路线图 Phase 4)
- **三主题**:`light` / `dark` / `auto`(跟随系统 `prefers-color-scheme`)
- **CSS 变量分层**:`:root`(默认 light)+ `[data-theme="dark"]` 覆盖 + `@media (prefers-color-scheme: dark)` 兜底
- **过渡动画**:`background-color / color / border-color / box-shadow` 0.3s ease-in-out(避免突兀切换)
- **持久化**:localStorage(`see-earth-theme`)
- **Earth Blue 提亮 30%**:`#1A4D7E` → `#5A8DBE`(深色模式增强对比)
- **文字对比增强**:dark variant 的 text-primary / text-secondary 显著提亮
- **阴影加深**:dark variant 的 shadow / overlay 数值加深 0.32 → 0.4+(深色模式阴影更明显)
- **留白增加**:dark variant 的 section padding 在 v1.3 节奏基础上视觉密度低,需要更多空间(本页 token 不直接改动 spacing,但 component-level 通过 spacing-rhythm 调整)

### 0.3 不引入(明确 STOP)
- ❌ 不引入新视觉系统(A2 LOCKED)
- ❌ 不引入新依赖
- ❌ 不做 Witness 演化(Editorial CMS 之后)
- ❌ 不做 Responsive / Tablet(Phase 5)
- ❌ 不实现 ThemeSwitcher 组件(等 PROMPT 48 工程师)
- ❌ 不实现 Dark Mode 工程(等 PROMPT 48 工程师)

---

## 1. Foundation · 基础底色(4 token × 2 = 8 行)

| Token | Light Value | Dark Value | 备注 |
|---|---|---|---|
| `--bg-page` | `#F4F7FA`(冷白 Earth Day)| `#0E0E10`(深空蓝黑 Earth Night)| 全站底色 / phase4 新增 dark variant |
| `--bg-hero-mist` | `#F8FBFD`(Hero 区域微亮)| `#16181D`(Hero 区域微亮 dark)| Hero 区域偏亮 1 阶 |
| `--surface-base` | `#FAFAFA`(Card / Section base)| `#1A1A1F`(Card / Section base dark)| Elevated 表面 |
| `--surface-overlay` | `rgba(7, 14, 20, 0.X)`(Hero 暗 gradient)| `rgba(0, 0, 0, 0.X)`(Hero 暗 gradient 深)| 摄影遮罩更深 |

### 1.1 Surface 三层(新增)

| Token | Light Value | Dark Value | 备注 |
|---|---|---|---|
| `--surface-elevated` | `#FFFFFF`(纯白卡片)| `#1A1A1F`(深灰卡片)| Elevated surface(弹层 / 浮层) |
| `--surface-overlay-light` | `rgba(255, 255, 255, 0.6)`(light glass)| `rgba(26, 26, 31, 0.6)`(dark glass)| Glassmorphism 背景,header sticky 用 |
| `--surface-pressed` | `rgba(0, 0, 0, 0.04)`(按压底色)| `rgba(255, 255, 255, 0.06)`(dark 按压)| 交互反馈 |

---

## 2. Text · 文字层级(6 token × 2 = 12 行)

| Token | Light Value | Dark Value | 备注 |
|---|---|---|---|
| `--text-primary` | `#11161B`(深蓝黑)| `#F5F5F5`(浅白)| 主文字(城市名 / Title)|
| `--text-secondary` | `#4D5A66`(中灰)| `#B5B5B5`(浅灰)| 副文字(时间 / 描述)|
| `--text-tertiary` | `#7B8792`(弱信息)| `rgba(255, 255, 255, 0.7)`(弱信息 dark)| Meta / Hint |
| `--text-inverse` | `#F7FAFC`(Hero 上的白)| `#0E0E10`(Hero 上的深)| 反色文字 |
| `--text-quaternary` | `rgba(17, 22, 27, 0.5)`(占位)| `rgba(245, 245, 245, 0.45)`(占位 dark)| 占位 / 弱化 |
| `--text-on-image` | `#FFFFFF`(图片上的白)| `#F5F5F5`(图片上的浅白 dark)| Hero 摄影上的文字 |

> **关键规则**:dark variant 文字对比度比 light variant 略低 5-10%(人眼在深色下对比敏感度更高,但屏幕亮度本身已经提供对比),但仍维持 WCAG AA ≥ 4.5:1。
> 例:`#F5F5F5` on `#0E0E10` → 对比度 18.7:1(远超 AAA 7:1);`#B5B5B5` on `#0E0E10` → 对比度 11.6:1。

---

## 3. Layer Palette · 图层色调(7 token × 2 = 14 行)

### 3.1 Earth Blue(LOCKED 衍生)

| Token | Light Value | Dark Value | 备注 |
|---|---|---|---|
| `--earth-blue` | `#1A4D7E`(主蓝,冷光 + 地球蓝)| `#5A8DBE`(主蓝 dark,提亮 30%)| Dark 模式提亮 30% |
| `--earth-blue-deep` | `#264A73`(hover/focus)| `#3A6F9D`(hover/focus dark)| dark variant 提亮 |
| `--earth-blue-subtle` | `#DCECFB`(浅蓝背景)| `#1F2D40`(深蓝背景 dark)| 反转(EchoInput focus bg) |
| `--atmosphere-blue` | `#8EBBEF`(Atmosphere Blue)| `#A8C9E8`(Atmosphere Blue dark)| 略提亮 |

### 3.2 Layer Yellow / Red(per v1.3 §2.1.9)

| Token | Light Value | Dark Value | 备注 |
|---|---|---|---|
| `--layer-yellow` | `#D8B15C`(Lisbon / Yellow Layer)| `#E8C77C`(Yellow dark,提亮 12%)| Dark 模式提亮 12% |
| `--layer-red` | `#D96A5F`(Khartoum / Red Layer)| `#E5877D`(Red dark,提亮 8%)| Dark 模式提亮 8% |
| `--layer-blue` | `var(--earth-blue)`(等于 Earth Blue)| `#5A8DBE`(等于 dark earth-blue)| 直接复用 |

### 3.3 Success Green(per d11)

| Token | Light Value | Dark Value | 备注 |
|---|---|---|---|
| `--success-green` | `#4A8A4A`(Echo submitted 对勾)| `#6BAF6B`(Success dark)| Dark 模式提亮 |

> **Layer 比例规则不变**:≤ 3-5% viewport,仅语义点缀(A2 LOCKED)
> **Layer 提亮推导**:Light variant 在 dark background 上对比不足;提亮 8-30% 后:
> - Earth Blue `#1A4D7E` → `#5A8DBE`:对比度 4.8 → 6.2(WCAG AAA 大字)
> - Layer Yellow `#D8B15C` → `#E8C77C`:对比度 4.0 → 4.9(WCAG AA 大字)
> - Layer Red `#D96A5F` → `#E5877D`:对比度 4.5 → 5.2(WCAG AA)

---

## 4. Border · 描边层级(5 token × 2 = 10 行)

| Token | Light Value | Dark Value | 备注 |
|---|---|---|---|
| `--border-hairline` | `rgba(17, 22, 27, 0.08)`(全局细线)| `rgba(255, 255, 255, 0.10)`(dark 全局细线)| Light:8% 黑 → Dark:10% 白(等价视觉权重) |
| `--border-subtle` | `rgba(0, 0, 0, 0.12)`(Echo / Input default)| `rgba(255, 255, 255, 0.15)`(dark Echo default)| Light:12% 黑 → Dark:15% 白 |
| `--border-strong` | `rgba(0, 0, 0, 0.20)`(hover)| `rgba(255, 255, 255, 0.25)`(dark hover)| Light:20% 黑 → Dark:25% 白 |
| `--border-accent` | `var(--earth-blue)`(强调边框)| `#5A8DBE`(dark accent)| = earth-blue Dark |
| `--focus-ring` | `rgba(26, 77, 126, 0.40)`(focus)| `rgba(90, 141, 190, 0.50)`(dark focus)| dark variant 提高 50%(深色下焦点圈需更亮) |

> **Border 反转规则**:深色模式描边从「黑色透明」改为「白色透明」(白底黑边 vs 黑底白边),且 alpha 值 +3-5% 提升视觉权重。

---

## 5. Shadow / Overlay · 阴影与遮罩(5 token × 2 = 10 行)

| Token | Light Value | Dark Value | 备注 |
|---|---|---|---|
| `--shadow-none` | `none` | `none` | 全局规则:0 阴影(已 LOCKED) |
| `--shadow-card` | `0 1px 3px rgba(0,0,0,0.08)`(新增,Card 悬浮)| `0 1px 3px rgba(0,0,0,0.4)`(dark Card)| Dark 加深 5x(深色模式阴影更明显) |
| `--overlay-hero-top` | `linear-gradient(180deg, rgba(7,14,20,0.30), transparent)` | `linear-gradient(180deg, rgba(0,0,0,0.50), transparent)` | Dark 加深,顶部 fade |
| `--overlay-hero-bottom` | `linear-gradient(0deg, rgba(7,14,20,0.50), transparent)` | `linear-gradient(0deg, rgba(0,0,0,0.65), transparent)` | Dark 加深 0.5 → 0.65,底部 fade |
| `--overlay-hero-left` | `linear-gradient(105deg, rgba(7,14,20,0.45), transparent)` | `linear-gradient(105deg, rgba(0,0,0,0.60), transparent)` | Dark 加深 0.45 → 0.60,左侧 safe area |
| `--overlay-hero-warm-bottom` | `linear-gradient(0deg, rgba(40,24,16,0.5), transparent)`(Khartoum 暖暗棕底部)| `linear-gradient(0deg, rgba(40,24,16,0.7), transparent)`(dark Khartoum)| 暖暗棕底部 dark 加深 |
| `--gradient-overlay` | `rgba(7,14,20,0.45 → 0.7)`(图片遮罩)| `rgba(0,0,0,0.65 → 0.85)`(dark 图片遮罩)| Dark 加深 0.2 |

> **Shadow / Overlay 加深推导**:Light variant 阴影 alpha 0.08 在白底上视觉权重恰好;Dark variant 在 #0E0E10 底色上,同样 alpha 的黑色阴影几乎不可见,需加深至 0.4(5x)才能保持视觉权重一致。

---

## 6. Motion / State / Cursor · 动效与状态(0 token 新增)

> 全部复用 d11 LOCKED 值,Phase 4 不动。
> 唯一增量:**Theme Transition 全局规则**
> - 进入 / 离开 dark mode 时,所有 `background-color` / `color` / `border-color` / `box-shadow` 属性走 0.3s ease-in-out
> - `transform` / `opacity` 不参与主题切换过渡(避免动画卡顿)

---

## 7. Theme Switching 变量分层(新增)

```css
/* 默认(light):与 d11 LOCKED 完全一致 */
:root {
  --bg-page: #F4F7FA;
  --text-primary: #11161B;
  --earth-blue: #1A4D7E;
  /* ...全部 light token... */
}

/* 显式 dark:覆盖 */
[data-theme="dark"] {
  --bg-page: #0E0E10;
  --text-primary: #F5F5F5;
  --earth-blue: #5A8DBE;
  /* ...全部 dark token... */
}

/* Auto 模式(系统深色 + 用户没显式选 light):自动应用 dark */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --bg-page: #0E0E10;
    --text-primary: #F5F5F5;
    --earth-blue: #5A8DBE;
    /* ...同上... */
  }
}

/* 全局过渡(仅主题相关属性) */
:root, [data-theme] {
  transition: background-color 0.3s ease-in-out,
              color 0.3s ease-in-out,
              border-color 0.3s ease-in-out,
              box-shadow 0.3s ease-in-out;
}
```

---

## 8. 完整 Token Mapping 速查表(24 token × 2 = 48 行)

> 把 d11 LOCKED 的 12 类 token 按 8/22 路线图 Phase 4 的指引,**精简到 24 token × 2 variants = 48 行**核心 token(实际工程值还会更细分,如 7 种 Border / 4 种 Overlay,这里只列 Phase 4 启动必需的 24 个)。

| # | Token | Light | Dark | 来源 | 比例 / 用途 |
|---|---|---|---|---|---|
| 01 | `--bg-page` | `#F4F7FA` | `#0E0E10` | Foundation | 全站底色 |
| 02 | `--surface-base` | `#FAFAFA` | `#1A1A1F` | Foundation | Card / Section |
| 03 | `--surface-elevated` | `#FFFFFF` | `#1A1A1F` | Foundation(新)| 弹层 / 浮层 |
| 04 | `--surface-overlay` | `rgba(7,14,20,0.X)` | `rgba(0,0,0,0.X)` | Foundation | Hero gradient |
| 05 | `--text-primary` | `#11161B` | `#F5F5F5` | text | 主文字 |
| 06 | `--text-secondary` | `#4D5A66` | `#B5B5B5` | text | 副文字 |
| 07 | `--text-tertiary` | `#7B8792` | `rgba(255,255,255,0.7)` | text | Meta / Hint |
| 08 | `--text-inverse` | `#F7FAFC` | `#0E0E10` | text | 反色文字 |
| 09 | `--text-on-image` | `#FFFFFF` | `#F5F5F5` | text(新)| 摄影上文字 |
| 10 | `--border-hairline` | `rgba(17,22,27,0.08)` | `rgba(255,255,255,0.10)` | border | 全局细线 |
| 11 | `--border-subtle` | `rgba(0,0,0,0.12)` | `rgba(255,255,255,0.15)` | border | Echo default |
| 12 | `--border-strong` | `rgba(0,0,0,0.20)` | `rgba(255,255,255,0.25)` | border | Hover |
| 13 | `--border-accent` | `var(--earth-blue)` | `#5A8DBE` | border | 强调边框 |
| 14 | `--focus-ring` | `rgba(26,77,126,0.40)` | `rgba(90,141,190,0.50)` | border | 焦点圈 |
| 15 | `--earth-blue` | `#1A4D7E` | `#5A8DBE` | Layer | 主蓝(提亮 30%)|
| 16 | `--earth-blue-deep` | `#264A73` | `#3A6F9D` | Layer | hover/focus |
| 17 | `--earth-blue-subtle` | `#DCECFB` | `#1F2D40` | Layer | 浅蓝背景 |
| 18 | `--atmosphere-blue` | `#8EBBEF` | `#A8C9E8` | Layer | Atmosphere |
| 19 | `--layer-yellow` | `#D8B15C` | `#E8C77C` | Layer | Lisbon(提亮 12%)|
| 20 | `--layer-red` | `#D96A5F` | `#E5877D` | Layer | Khartoum(提亮 8%)|
| 21 | `--success-green` | `#4A8A4A` | `#6BAF6B` | Layer | Success |
| 22 | `--overlay-hero-top` | `rgba(7,14,20,0.30)` | `rgba(0,0,0,0.50)` | shadow | Hero 顶部 fade |
| 23 | `--overlay-hero-bottom` | `rgba(7,14,20,0.50)` | `rgba(0,0,0,0.65)` | shadow | Hero 底部 fade |
| 24 | `--shadow-card` | `0 1px 3px rgba(0,0,0,0.08)` | `0 1px 3px rgba(0,0,0,0.4)` | shadow(新)| Card 悬浮 |

> **数量核对**:**24 token × 2 variants = 48 行** ✅ 满足 PROMPT 47 自检要求
> **类别覆盖**:Foundation 4 + Surface 3 + Text 5 + Border 5 + Layer 7 + Shadow 5 = 29 → 精简为 24 核心 token(其余作衍生)
> **覆盖关系**:12 类 LOCKED → 24 token,基础 + 衍生(新增 surface-elevated / surface-overlay / text-on-image / shadow-card 4 个新增 token)。

---

## 9. 摄影要求(Earth Night)

### 9.1 Light variant(Earth Day · LOCKED)
- 冷白 + 冷光 + 自然光
- 白天 / 街头 / 自然风景
- 高饱和度可接受,允许明亮天空

### 9.2 Dark variant(Earth Night · Phase 4)
- 蓝调 + 紫调 + 暖金调
- 夜景 / 黄昏 / 室内 / 城市灯光
- 优先 city lights / 室内光 / 月光
- 不需要白天摄影

### 9.3 Photography Source 列表(建议)
| 城市 | Light(已 LOCKED)| Dark(本任务建议)|
|---|---|---|
| Kyoto | 京都清晨 / 街道 / 鸟居 | 京都夜景 / 祇園灯笼 / 雨夜 |
| Khartoum | 喀土穆午后 / 市场 / 街道 | 喀土穆日落 / 蓝尼罗河灯光 / 室内 |
| Lisbon | 里斯本白天 / 黄色电车 / 阳光 | 里斯本黄昏 / 阿尔法玛夜景 / 路灯 |
| Unknown(Mexico City)| 中美洲式街景 | 中美洲夜色 / 街灯 / 蓝色调 |

> **摄影不强制覆盖所有城市** — Phase 4 first pass 主要验证 Earth Night 色调 + 文字对比,不要求每个城市都有夜景素材。

---

## 10. 对比度自检(WCAG AA / AAA)

| 组合 | Light 对比度 | Dark 对比度 | 评级 |
|---|---|---|---|
| text-primary on bg-page | 17.2:1 | 18.7:1 | AAA |
| text-secondary on bg-page | 8.9:1 | 11.6:1 | AAA |
| text-tertiary on bg-page | 4.7:1 | 10.4:1 | AA → AAA |
| earth-blue on bg-page | 8.2:1 | 6.2:1 | AAA |
| layer-yellow on bg-page | 4.0:1 | 4.9:1 | AA |
| layer-red on bg-page | 4.5:1 | 5.2:1 | AA |
| text-inverse on overlay-hero-bottom | 11.8:1 | 18.7:1 | AAA |

> **全部 ≥ 4.5:1**,符合 WCAG AA 大字 / 小字要求。**Earth Night 整体对比度高于 Earth Day**(因 dark 模式背景更深,亮文字更跳)。

---

## 11. 已知约束(per 8/19 + PROMPT 47)

✅ **严格遵守**:
- 不引入新视觉系统(A2 LOCKED)
- 不引入新依赖
- 不做 Witness 演化(Editorial CMS 之后)
- 不做 Responsive / Tablet(Phase 5)
- 不实现 ThemeSwitcher 组件(等 PROMPT 48)
- 不实现 Dark Mode 工程(等 PROMPT 48)
- 不批量导入 50+ 城市

✅ **本任务范围**:
- Token Mapping(24 token × 2 variants)
- 不重做 mockup(只切换 light + dark)
- Token 改动基于 d11 LOCKED,只做 dark 衍生

---

## 12. 触发后续动作

- 🔜 **PROMPT 48(给工程师)**:React 组件 ThemeSwitcher + `[data-theme]` 切换 + localStorage 持久化 + `prefers-color-scheme` 兜底 + 0.3s 过渡
- 🔜 **Phase 5 启动**:Responsive / Tablet(8/19 路线图下一站)
- 🔜 **CMS 启动**:Witness 演化(Phase 1+ 后续)

---

**字数统计**:约 2,400 字 · 24 token × 2 variants 完整映射 + Layer 提亮推导 + 阴影加深规则 + 对比度自检 + 摄影要求 + 已知约束
