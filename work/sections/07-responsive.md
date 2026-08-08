## 7. 响应式断点

### 7.1 断点定义

| 断点 | 宽度范围 | 设备 | 主要变化 |
| --- | --- | --- | --- |
| `mobile` | < 640 px | 手机竖屏 | 单列；HUD 折叠；TopBar 仅 Logo + 用户 |
| `tablet` | 640–1023 px | 平板 / 手机横屏 / 小笔电 | 双列；Canvas 占 60% 视口；TopBar 完整 |
| `desktop` | 1024–1919 px | 笔记本 / 台机（**默认设计稿**） | 默认规格 |
| `wide` | ≥ 1920 px | 4K / 大屏 | Canvas 限定最大 1600px 高，居中 |

### 7.2 CSS 实现

```css
:root { --bp: desktop; }

@media (max-width: 1023px) { :root { --bp: tablet; } }
@media (max-width: 639px)  { :root { --bp: mobile; } }
@media (min-width: 1920px) { :root { --bp: wide; } }
```

```ts
// 运行时判断（仅用于必须用 JS 的场景）
function getBp(): 'mobile' | 'tablet' | 'desktop' | 'wide' {
  const w = window.innerWidth;
  if (w < 640)  return 'mobile';
  if (w < 1024) return 'tablet';
  if (w < 1920) return 'desktop';
  return 'wide';
}
```

### 7.3 各断点下的页面布局

| 页面 | mobile | tablet | desktop（默认） | wide |
| --- | --- | --- | --- | --- |
| **首页** | Canvas 占 50%；TimeBar 上移到顶部；HUD 折叠为浮按钮 | Canvas 占 60%；TopBar + 底部 TimeBar | 默认 | Canvas 居中，最大 1600px 高；左右留暗色边距 |
| **城市详情** | 单列，主图在上 | 单列，主图在上 | 双列（左主图右元数据） | 双列，最大宽度 1200px 居中 |
| **我的** | 单列 | 双列 | 双列 | 三列 |
| **寄明信片** | 单列，stepper 顶部 | 单列 | 双列预览（左表单右预览） | 同 desktop，最大宽度 960px 居中 |
| **收件箱** | 单列 | 单列 | 单列，最大宽度 720px 居中 | 同 desktop |
| **贡献** | 单列 | 双列 | 三列 | 三列，最大宽度 1200px 居中 |
| **设置** | 单列 | 单列，最大宽度 640px 居中 | 单列，最大宽度 720px 居中 | 同 desktop |
| **关于** | 单列 | 单列，最大宽度 720px 居中 | 单列，最大宽度 720px 居中 | 同 desktop |

### 7.4 移动端"能用即可"原则

> **v1 明确不为移动端做触屏手势优化**（与 Product Spec §2.2 非目标一致）。
>
> 移动端需要保证：
> - 页面不破版；
> - 主流程（打开 → 拖动 → 点击城市 → 寄明信片）能走通；
> - 不出现触屏不可用的硬阻塞（如 hover-only 菜单）。
>
> v1.x 再补：
> - 触屏手势（pinch zoom、双指旋转）；
> - 底部安全区适配；
> - 触屏键盘适配。

### 7.5 断点使用禁令

| 禁令 | 原因 |
| --- | --- |
| ❌ 在 mobile 断点强制启用 TimeBar 拖拽 | 与触屏体验冲突 |
| ❌ 在 mobile 断点隐藏"寄明信片"CTA | v1 主流程必须可走通 |
| ❌ 自定义断点（如 900px） | 与本规范不统一 |
| ❌ 在 desktop 布局中固定使用 `width: 100vw` | 与 §6.8 About 等最大宽度冲突 |

