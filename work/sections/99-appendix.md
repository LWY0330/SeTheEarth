## 附录 A · 与 Product Spec v1 的引用关系

| Product Spec v1 章节 | Design Spec v1 对应章节 | 说明 |
| --- | --- | --- |
| §1 定位 / 愿景 | §1 设计原则 | 原则 1.1–1.6 落地"安静 · 深邃 · 真实"调性 |
| §2.2 非目标 | §7 响应式 | 移动端"能用即可"，不做触屏优化 |
| §7 信息架构 | §6 8 个页面线框 | 一一对应 |
| §9 视觉设计方向 | §2–§5 色彩/字体/间距/组件 | 落地为 token + 组件库 |
| §10 技术架构 | §5 组件库 Props / §8 动效 | 组件映射到 React + Zustand |
| §13 边界与错误 | §9 状态全集 + §10 A11y | 错误态 + 屏幕阅读器 |
| §15 发布里程碑 | §5 组件库优先级 | M1 内核期优先实现 P0 组件 |

---

## 附录 B · CSS 变量一次性导出（完整）

> 以下为 §2–§4 全部 token 的 CSS 源码，建议通过 Style Dictionary / 自定义脚本从本文自动生成，避免手抄出错。

```css
/* ============================================================
 * 看见地球 · Design Tokens v1.0.0
 * 2026-08-05 · 自动生成自 Design Spec v1
 * ============================================================ */

:root {
  /* ── Colors · Primary ── */
  --color-primary-300: #A6CCFF;
  --color-primary-400: #82C0FF;
  --color-primary-500: #5BA8FF;
  --color-primary-600: #3D8FE8;
  --color-primary-700: #2B6FBE;
  --color-primary-hover:  var(--color-primary-400);
  --color-primary-active: var(--color-primary-600);

  /* ── Colors · Accent ── */
  --color-accent-400: #F8C887;
  --color-accent-500: #F4B860;
  --color-accent-600: #D69A3A;

  /* ── Colors · Neutral ── */
  --color-neutral-0:    #FFFFFF;
  --color-neutral-50:   #F5F7FA;
  --color-neutral-100:  #E8EEF5;
  --color-neutral-200:  #C7D0DB;
  --color-neutral-300:  #A1AAB8;
  --color-neutral-400:  #6B7889;
  --color-neutral-600:  #3A4452;
  --color-neutral-800:  #1A1F2A;
  --color-neutral-900:  #0F141B;
  --color-neutral-1000: #000000;

  /* ── Colors · Status ── */
  --color-success: #4ADE80;
  --color-warning: #FBBF24;
  --color-error:   #F87171;
  --color-info:    var(--color-primary-500);

  /* ── Spacing ── */
  --space-0:   0;
  --space-1:   4px;
  --space-2:   8px;
  --space-3:   12px;
  --space-4:   16px;
  --space-6:   24px;
  --space-8:   32px;
  --space-12:  48px;
  --space-16:  64px;
  --space-24:  96px;
  --space-32:  128px;

  /* ── Radius ── */
  --radius-sm:   4px;
  --radius-md:   8px;
  --radius-lg:   12px;
  --radius-xl:   16px;
  --radius-2xl:  24px;
  --radius-full: 9999px;

  /* ── Shadow ── */
  --shadow-none:          none;
  --shadow-sm:            0 1px 2px rgba(0,0,0,0.4);
  --shadow-md:            0 4px 12px rgba(0,0,0,0.5);
  --shadow-lg:            0 8px 24px rgba(0,0,0,0.6);
  --shadow-xl:            0 16px 48px rgba(0,0,0,0.7);
  --shadow-glow-primary:  0 0 24px rgba(91,168,255,0.4);

  /* ── Z-Index ── */
  --z-canvas:    0;
  --z-base:      10;
  --z-hud:       50;
  --z-dropdown:  100;
  --z-modal:     1000;
  --z-toast:     1100;
  --z-tooltip:   1200;

  /* ── Typography · Font Families ── */
  --font-ui-en:     "Inter", "Söhne", -apple-system, system-ui, sans-serif;
  --font-ui-zh:     "Noto Serif SC", "Source Han Serif SC", "Songti SC", serif;
  --font-ui:        var(--font-ui-zh), var(--font-ui-en);
  --font-mono:      "JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace;
  --font-handwrite: "Caveat", "Liu Jian Mao Cao", cursive;

  /* ── Typography · Size ── */
  --text-xs:      12px;
  --text-sm:      14px;
  --text-base:    16px;
  --text-md:      18px;
  --text-lg:      20px;
  --text-xl:      24px;
  --text-2xl:     32px;
  --text-3xl:     40px;
  --text-display: 64px;

  /* ── Typography · Weight ── */
  --weight-regular:  400;
  --weight-medium:   500;
  --weight-semibold: 600;

  /* ── Duration ── */
  --duration-instant:   0ms;
  --duration-fast:     150ms;
  --duration-base:     250ms;
  --duration-slow:     400ms;
  --duration-cinematic: 800ms;

  /* ── Easing ── */
  --ease-standard:    cubic-bezier(0.4, 0, 0.2, 1);
  --ease-decelerate:  cubic-bezier(0.0, 0, 0.2, 1);
  --ease-accelerate:  cubic-bezier(0.4, 0, 1, 1);
  --ease-emphatic:    cubic-bezier(0.22, 1, 0.36, 1);
  --ease-linear:      linear;

  /* ── Breakpoints (for JS use only) ── */
  --bp-mobile:  640px;
  --bp-tablet:  1024px;
  --bp-wide:    1920px;
}
```

```css
/* ── Glass / HUD ── */
.hud {
  background: rgba(15, 20, 27, 0.55);
  backdrop-filter: blur(20px) saturate(140%);
  -webkit-backdrop-filter: blur(20px) saturate(140%);
  border: 1px solid rgba(232, 238, 245, 0.08);
  border-radius: var(--radius-lg);
}

@supports not (backdrop-filter: blur(20px)) {
  .hud { background: rgba(15, 20, 27, 0.92); }
}

/* ── Focus Ring ── */
:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
  border-radius: inherit;
}
:focus:not(:focus-visible) { outline: none; }

/* ── Reduced Motion ── */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 附录 C · 验收 checklist（实现完成后自检）

> AI / 工程师在交付前必须逐条勾选。任意一项未过则视为 v1 未完成。

### C.1 Token 完整性

- [ ] 附录 B 全部变量已落到 `tokens.css`
- [ ] 无任何硬编码 hex / px / ms（仅 `:root` 与 token 派生）
- [ ] Storybook（或等价展示）按 token 顺序展示色彩 / 字体 / 间距 / 圆角 / 阴影

### C.2 组件完整性（§5）

- [ ] Button / Card / Input / Modal / Navigation / Loading / EmptyState / Tag 全部实现
- [ ] 每个组件 4 种变体 + 3 种尺寸（如适用）
- [ ] 每个组件覆盖 9 种状态（§9.1）

### C.3 页面完整性（§6）

- [ ] 8 个页面按 ASCII 线框 1:1 映射
- [ ] 首页飞回初始视角、首屏入场动效符合 §6.1
- [ ] 寄明信片三步流程可走通，含 §6.4 全部状态
- [ ] 收件箱空状态、加载状态、错误状态都有
- [ ] 页面跳转矩阵（§6.9）所有路径可达

### C.4 横切规范（§7–§10）

- [ ] §7 响应式：4 个断点全部生效，移动端"能用"
- [ ] §8 动效：所有 duration / easing 取自 token
- [ ] §9 状态：9 种状态全覆盖
- [ ] §10 A11y：axe-core 0 critical；键盘可达；屏幕阅读器朗读无障碍

### C.5 专项（§11–§12）

- [ ] §11 图标：21 个必备图标全部到位；装饰性图标 `aria-hidden`
- [ ] §12 明信片：5 种边框变体可切换；邮票 + 邮戳占位可渲染

### C.6 文档一致性

- [ ] 与 Product Spec v1 无矛盾
- [ ] 与本 Spec §0 阅读指引中的章节顺序一致
- [ ] 所有 ADR（待补）已记录到仓库 `docs/adr/`

---

## 附录 D · 后续版本路线（v1.1+ 预告）

| 版本 | 主要新增 | 与本 Spec 关系 |
| --- | --- | --- |
| **v1.1** | 明信片 PNG 导出、URL 状态同步、快捷地点、5 种边框变体已可切 | 复用 §12 + 新增 §13 |
| **v1.2** | 暗色 / 浅色切换（破 §1.6） | 需新增主题系统 + 重审 §2 |
| **v2.0** | 双语切换、多图层叠加、AI 解读 | 需新增 i18n token + 文案表 |

> v1.x 增量不得破坏 §1.6（暗色原生）+ §1.4（克制）两条原则，否则升 v2。

---

## 附录 E · 待补（评审中收集）

- [ ] Figma 主设计稿链接
- [ ] 关键页静态视觉稿（首页 / 城市详情 / 寄明信片 步骤 2）
- [ ] 性能预算分解表（与 §9 加载时长规则对照）
- [ ] 文案与术语对照表（简中 / 英文 · §18.3 同步）

---

> **本 Spec 解释权归项目所有人 lwy**。
> 修订需更新 §0 元信息中的版本号，并在仓库 `docs/adr/` 留 ADR 记录。

