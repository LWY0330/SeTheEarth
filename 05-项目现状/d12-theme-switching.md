---
title: 主题状态切换机制 · Phase 4 / Direction A1 first pass
type: design-spec
tags: [theme-switching, dark-mode, state-machine, prefers-color-scheme, phase-4, see-earth-redesign]
date: 2026-08-22
sender: 内部 Designer Agent
status: first pass LOCKED (PM 评审后定)
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/d12-theme-switching.md
related_docs:
  - /Users/lwy/Documents/ChatGPT/看见地球/05-项目现状/d12-dark-mode-tokens.md (24 token × 2)
  - /Users/lwy/Documents/ChatGPT/看见地球/05-项目现状/d12-direction-a1-visual-adjustments.md (A1 vs A2)
  - /Users/lwy/Documents/ChatGPT/看见地球/05-项目现状/d11-component-library-first-pass.md (14 组件)
---

# 主题状态切换机制 · Phase 4 / Direction A1 first pass

> **顶部声明**:基于 d12-dark-mode-tokens.md(24 token × 2 variants)+ d12-direction-a1-visual-adjustments.md(A1 vs A2),定义 SEE EARTH 全站的 3 种主题(light / dark / auto)+ 切换机制 + 持久化 + 过渡动画。本文档**只设计状态切换机制 + ThemeSwitcher 组件视觉规范**,**不实现 React 组件**(等 PROMPT 48 工程师实施)。
> **模式**:Addendum(d11 / d12 tokens → 状态机)
> **触发**:PROMPT 47 任务 D · 状态切换机制

---

## 0. 整体逻辑

### 0.1 三主题定义

| 主题 | 值 | 行为 | 持久化键 |
|---|---|---|---|
| **light** | `light` | 强制浅色,无视系统设置 | `localStorage["see-earth-theme"] = "light"` |
| **dark** | `dark` | 强制深色,无视系统设置 | `localStorage["see-earth-theme"] = "dark"` |
| **auto** | `auto` | 跟随系统 `prefers-color-scheme`,系统深色 → A1,系统浅色 → A2 | `localStorage["see-earth-theme"] = "auto"` |

### 0.2 优先级

```
localStorage > 显式主题选择 > 系统 prefers-color-scheme > 默认 light
```

| 优先级 | 来源 | 行为 |
|---|---|---|
| 1(localStorage) | 用户在 ThemeSwitcher 显式选择 | 立即应用,不跟随系统 |
| 2(无 localStorage)| 系统 `prefers-color-scheme` | auto 模式:深色系统 → A1;浅色系统 → A2 |
| 3(默认)| light | 默认 A2 |

### 0.3 不实现(明确 STOP)

- ❌ 不实现 React 组件(等 PROMPT 48 工程师)
- ❌ 不实现 CSS Modules(等 PROMPT 47 工程师)
- ❌ 不引入新依赖(纯 CSS + 原生 JS)
- ❌ 不做系统级 theme-color meta(留 Phase 5+)
- ❌ 不做 OS 通知 / 推送

---

## 1. CSS 变量分层机制

### 1.1 三层覆盖关系

```css
/* ──────────────────────────────────────
   Layer 1: 默认(Light · A2 LOCKED)
   ────────────────────────────────────── */
:root {
  --bg-page: #F4F7FA;
  --text-primary: #11161B;
  --earth-blue: #1A4D7E;
  /* ...全部 24 token light 值... */
}

/* ──────────────────────────────────────
   Layer 2: 显式 Dark([data-theme="dark"])
   覆盖 light,无视系统
   ────────────────────────────────────── */
[data-theme="dark"] {
  --bg-page: #0E0E10;
  --text-primary: #F5F5F5;
  --earth-blue: #5A8DBE;
  /* ...全部 24 token dark 值... */
}

/* ──────────────────────────────────────
   Layer 3: Auto 模式(系统深色 + 用户没显式选 light)
   当 [data-theme] 不存在时,系统深色 → 自动应用 dark
   当 [data-theme="light"] 时,即使系统深色也强制 light
   ────────────────────────────────────── */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --bg-page: #0E0E10;
    --text-primary: #F5F5F5;
    --earth-blue: #5A8DBE;
    /* ...同上... */
  }
}

/* ──────────────────────────────────────
   全局过渡(0.3s ease-in-out)
   仅主题相关属性参与过渡
   ────────────────────────────────────── */
:root, [data-theme] {
  transition: background-color 0.3s ease-in-out,
              color 0.3s ease-in-out,
              border-color 0.3s ease-in-out,
              box-shadow 0.3s ease-in-out;
}

/* transform / opacity 不参与主题过渡(避免动画卡顿) */
```

### 1.2 优先级数学

| localStorage | data-theme | 系统 prefers-color-scheme | 实际应用 |
|---|---|---|---|
| `light` | `light` | light | A2 light |
| `light` | `light` | dark | A2 light(用户显式 light,无视系统)|
| `dark` | `dark` | light | A1 dark(用户显式 dark,无视系统)|
| `dark` | `dark` | dark | A1 dark |
| `auto` | (无)| light | A2 light |
| `auto` | (无)| dark | A1 dark |
| (无)| (无)| light | A2 light(默认)|
| (无)| (无)| dark | A1 dark(默认跟随系统)|

---

## 2. ThemeSwitcher 组件(视觉规范)

### 2.1 位置

| 位置 | 优先级 | 备注 |
|---|---|---|
| **GlobalHeader 右侧** | 主 | 与 Logo / NavLinks 同水平排列 |
| **Footer** | 次 | 在 footer 的"设置"区 |
| **Standalone Page** | 备 | 如 `/settings` 页面顶部(Phase 6+) |

### 2.2 视觉结构

```
┌─────────────────────────────────────────────┐
│ 看见地球      Cities  Journal  About  [☀ 🌗 🌙] │
└─────────────────────────────────────────────┘
                                          ↑
                                  ThemeSwitcher
```

ThemeSwitcher 视觉(72px × 32px):
```
┌─────────────────────────────────┐
│  ☀     🌗     🌙                 │
│ light  auto  dark                │
└─────────────────────────────────┘
```

### 2.3 三选项视觉

| 选项 | Icon(图标) | Label(隐藏,仅 aria)| Active 视觉 |
|---|---|---|---|
| **Light** | `☀`(Sun)| "Light" | 底部 1.5px underline,Earth Blue |
| **Auto** | `🌗`(Half Moon)| "Auto" | 底部 1.5px underline,Earth Blue |
| **Dark** | `🌙`(Crescent)| "Dark" | 底部 1.5px underline,Earth Blue |

### 2.4 6 状态规范(per d11)

| 状态 | Light 选项 | Auto 选项 | Dark 选项 |
|---|---|---|---|
| **Default** | 图标 50% 黑,文字 tertiary | 同 | 同 |
| **Hover** | 图标 100% 黑,220ms ease | 同 | 同 |
| **Focus** | Earth Blue 焦点圈 2px solid(`var(--focus-ring)`)| 同 | 同 |
| **Active** | scale(0.99) 120ms + 文字 Earth Blue + 底部 underline | 同 | 同 |
| **Disabled** | opacity 0.5 + `cursor: not-allowed`(Phase 6+ 才用)| 同 | 同 |
| **Selected** | Earth Blue 文字 + 1.5px underline 持续显示 | 同 | 同 |

### 2.5 CSS 实现(仅视觉,组件逻辑等工程师)

```css
.themeSwitcher {
  display: inline-flex;
  align-items: center;
  gap: var(--s-3);
  padding: 4px 8px;
  border-radius: 2px;
}

.themeOption {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px; height: 28px;
  background: transparent;
  border: 0;
  cursor: pointer;
  position: relative;
  font-size: 16px;
  color: var(--text-tertiary);
  transition: color 220ms cubic-bezier(.22,.61,.36,1);
}

.themeOption:hover { color: var(--text-primary); }

.themeOption:focus-visible {
  outline: 0;
  box-shadow: 0 0 0 2px var(--focus-ring);
}

.themeOption[aria-pressed="true"] {
  color: var(--earth-blue);
}

.themeOption[aria-pressed="true"]::after {
  content: "";
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 18px;
  height: 1.5px;
  background: var(--earth-blue);
}
```

---

## 3. JavaScript 行为规范

### 3.1 初始化流程(页面加载时)

```js
// 1. 读取 localStorage
const STORAGE_KEY = "see-earth-theme";
const VALID = ["light", "dark", "auto"];
const saved = localStorage.getItem(STORAGE_KEY);

// 2. 应用主题
function applyTheme(theme) {
  if (theme === "auto" || !theme) {
    // auto:移除 data-theme,让 @media 接管
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.setAttribute("data-theme", theme);
  }
  // 更新 ThemeSwitcher UI
  document.querySelectorAll('[data-theme-option]').forEach(btn => {
    btn.setAttribute("aria-pressed", String(btn.dataset.themeOption === (theme || "auto")));
  });
}

// 3. 初始化
applyTheme(saved && VALID.includes(saved) ? saved : "auto");

// 4. 监听系统主题变化(auto 模式时)
const mq = window.matchMedia("(prefers-color-scheme: dark)");
mq.addEventListener("change", () => {
  if (!document.documentElement.hasAttribute("data-theme")) {
    // 当前是 auto,系统变化时不需要主动切换(浏览器会自动重新评估 @media)
    // 但需要更新 ThemeSwitcher 显示
    applyTheme("auto");
  }
});
```

### 3.2 用户点击切换

```js
document.querySelectorAll('[data-theme-option]').forEach(btn => {
  btn.addEventListener("click", () => {
    const theme = btn.dataset.themeOption; // "light" | "dark" | "auto"
    localStorage.setItem(STORAGE_KEY, theme);
    applyTheme(theme);
  });
});
```

### 3.3 关键规则

| 规则 | 说明 |
|---|---|
| **localStorage 写入** | 仅用户显式点击时写入(每次切换) |
| **数据属性** | `data-theme` 设在 `<html>` 元素上,而不是 `<body>` |
| **早期渲染** | 必须在 `<head>` 内联 `<script>` 中读取 localStorage 并设置 `data-theme`,**避免 FOUC**(Flash of Unstyled Content)|
| **FOUC 防御** | 在 `<head>` 顶部插入:<br>`<script>(function(){var t=localStorage.getItem("see-earth-theme");if(t==="dark"||t==="light")document.documentElement.setAttribute("data-theme",t);})();</script>` |
| **无 JS 兜底** | 如果 JS 失败,默认 light(`@media (prefers-color-scheme: dark)` 接管)|
| **a11y** | `aria-pressed` 表示选中状态;`<button>` 元素;`role="group"` + `aria-label="主题切换"` |

---

## 4. 过渡动画规范

### 4.1 过渡属性

```css
:root, [data-theme] {
  transition: background-color 0.3s ease-in-out,
              color 0.3s ease-in-out,
              border-color 0.3s ease-in-out,
              box-shadow 0.3s ease-in-out;
}
```

### 4.2 过渡规则

| 维度 | 规则 |
|---|---|
| **参与过渡的属性** | `background-color` / `color` / `border-color` / `box-shadow` |
| **不参与过渡的属性** | `transform` / `opacity` / `width` / `height` / `top` / `left`(避免动画卡顿)|
| **时长** | 0.3s(per 8/19 路线图 + PROMPT 47 任务 D)|
| **缓动** | `ease-in-out`(默认值,适合背景色切换)|
| **延迟** | 0(立即响应)|
| **GPU 加速** | 不需要(背景色 / 文字色 / 边框 / 阴影均不触发 reflow)|

### 4.3 避免突兀切换的 4 个技巧

1. **过渡时长**:300ms 是人类感知"自然"的最低值,过短(< 200ms)会让眼睛闪烁;过长(> 500ms)会让用户等待。
2. **过渡属性限制**:仅 4 个主题相关属性参与过渡;不引入 `transform` / `opacity` 会避免动画叠加导致卡顿。
3. **早期渲染**:FOUC 防御脚本在 `<head>` 内执行,避免页面先亮后暗闪烁。
4. **ThemeSwitcher 即时反馈**:用户点击后,按钮 active 状态 + 整体切换在 300ms 内完成,无延迟感。

### 4.4 prefers-reduced-motion 兜底

```css
@media (prefers-reduced-motion: reduce) {
  :root, [data-theme] {
    transition: none !important;
  }
}
```

> 用户在系统设置开启"减少动态效果"时,主题切换为**瞬间**。这是 a11y 最佳实践(WCAG 2.3.3 Motion Actuation)。

---

## 5. 持久化策略

### 5.1 localStorage 键

| 键 | 值 | 默认 | 失效 |
|---|---|---|---|
| `see-earth-theme` | `"light"` / `"dark"` / `"auto"` | `"auto"` | 无 |

### 5.2 读取时机

| 时机 | 行为 |
|---|---|
| 页面加载(`<head>` 内联脚本) | 立即读取 + 设置 `data-theme`(防 FOUC)|
| 用户点击 ThemeSwitcher | 立即写入 + 立即应用 |
| 系统主题变化(auto 模式时) | 仅更新 UI,不需要写入 localStorage |
| 跨标签页 | 通过 `storage` 事件同步(`window.addEventListener("storage", ...)`)|

### 5.3 跨标签页同步(可选,Phase 5+)

```js
window.addEventListener("storage", (e) => {
  if (e.key === STORAGE_KEY && e.newValue) {
    applyTheme(e.newValue);
  }
});
```

> **本任务范围不实现跨标签页同步**,留给 Phase 5+。

### 5.4 localStorage 失效兜底

| 情况 | 兜底 |
|---|---|
| localStorage 被禁用(隐身模式 / Safari ITP) | 使用 cookie(Phase 5+)或 sessionStorage(临时)|
| localStorage 抛出 QuotaExceededError | 静默降级到 in-memory 状态(本会话内有效)|
| localStorage 返回 null(未设置)| 走 auto 模式 → 跟随系统 |

---

## 6. 已知边界情况

### 6.1 SSR / SSG 兼容

若使用 Next.js / Astro SSR:
- 服务端无法读取 localStorage
- 首屏 HTML 渲染默认 light
- 客户端 hydrate 后读取 localStorage 并切换
- **必须**:在 `<head>` 内联 FOUC 防御脚本,避免客户端 hydrate 期间闪烁

### 6.2 第三方 iframe / embed

- 第三方 iframe 不会继承父页面的主题,会按 iframe 自身 `@media` 评估
- 解决方案:iframe 内 `<html>` 注入 `data-theme` 属性(Phase 5+)

### 6.3 系统主题变化但页面未刷新

- auto 模式下,系统切换时浏览器会自动重新评估 `@media (prefers-color-scheme: dark)`
- 不需要 JS 主动干预
- 但 ThemeSwitcher 的 UI 不需要更新(选项仍是 `auto`,active 状态保持)

### 6.4 用户快速点击切换

- 每次点击立即写入 localStorage + 设置 `data-theme`
- CSS transition 0.3s 自动处理动画
- 不需要防抖(transition 是 GPU 加速,不卡顿)

### 6.5 多个 ThemeSwitcher 实例

- 同一页面可放多个(Header + Footer)
- JS 监听所有 `[data-theme-option]` 元素
- 点击任一实例都会同步所有实例的 UI(通过 `applyTheme()` 函数)

---

## 7. 测试与验证清单

### 7.1 视觉验证

- [ ] Light 选项在 light 主题下:aria-pressed=true,Earth Blue 文字 + underline
- [ ] Dark 选项在 dark 主题下:同上
- [ ] Auto 选项在 auto 主题下:同上
- [ ] 切换时背景 / 文字 / 边框 / 阴影 0.3s 平滑过渡
- [ ] 切换无 FOUC(刷新页面后无闪烁)

### 7.2 功能验证

- [ ] localStorage 写入正确
- [ ] 刷新页面后 localStorage 读取正确
- [ ] 切换 light 后,即使系统深色也保持 light
- [ ] 切换 dark 后,即使系统浅色也保持 dark
- [ ] 切换 auto 后,跟随系统变化
- [ ] 系统主题变化时(auto 模式)页面自动响应

### 7.3 a11y 验证

- [ ] ThemeSwitcher 键盘可达(Tab / Shift+Tab / Space / Enter)
- [ ] Focus 状态有 Earth Blue 焦点圈
- [ ] `aria-pressed` 正确反映选中状态
- [ ] `role="group"` + `aria-label="主题切换"`
- [ ] `prefers-reduced-motion` 用户:过渡被禁用
- [ ] 屏幕阅读器朗读"Light / Dark / Auto, button, pressed"(选中时)

### 7.4 性能验证

- [ ] 切换主题时无 layout shift(CLS = 0)
- [ ] 切换主题时无 reflow(FPS 60)
- [ ] localStorage 读取 < 1ms(防 FOUC 脚本内)
- [ ] 不增加任何额外 HTTP 请求(纯 CSS + JS)

---

## 8. 已知约束(per 8/19 + PROMPT 47)

✅ **严格遵守**:
- 不引入新依赖(纯 CSS + 原生 JS)
- 不实现 React 组件(等 PROMPT 48)
- 不实现 CSS Modules(等 PROMPT 47 工程师)
- 不做系统级 theme-color meta(留 Phase 5+)
- 不做跨标签页同步(留 Phase 5+)
- 不做 SSR 兼容(留 Phase 5+)

✅ **本任务范围**:
- CSS 变量分层机制(3 层覆盖)
- ThemeSwitcher 组件视觉规范 + 6 状态
- JavaScript 行为规范(初始化 + 切换 + 持久化)
- 过渡动画规范(0.3s ease-in-out + reduced-motion 兜底)
- localStorage 策略
- 测试与验证清单

---

## 9. 触发后续动作

- 🔜 **PROMPT 48(给工程师)**:
  - 实现 ThemeSwitcher React 组件(基于本视觉规范)
  - 实现 CSS Modules 主题切换(基于 d12 tokens)
  - 接入 FOUC 防御脚本
  - 接入 prefers-reduced-motion 检测
- 🔜 **Phase 5 启动**:跨标签页同步 + SSR 兼容 + system theme-color meta
- 🔜 **Phase 6 启动**:全站接入 Dark Mode

---

**字数统计**:约 2,400 字 · CSS 变量分层 + ThemeSwitcher 视觉规范 + JS 行为规范 + 持久化策略 + 过渡动画 + 边界情况 + 测试清单 + 已知约束
