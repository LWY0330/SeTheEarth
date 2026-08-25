---
title: Accessibility Audit v1 · 可访问性审计清单
type: launch-checklist-sub
tags: [release-v1, d-p0-06, launch-checklist, a11y, wcag, contrast, keyboard, focus, reduced-motion, aria, see-earth]
task_id: D-P0-06
brief_anchor: §4 D-P0-06 AC #2 + AC #3 + 任务卡 §E
track: design
target_gate: Gate C · Launch Candidate
created: 2026-08-24
sender: Designer Agent #6
receiver: PM Agent / Design / Engineering / QA
status: IN REVIEW
depends_on:
  - checklist-v1.md §AC #2 + §AC #3
  - D-P0-01 LOCKED (A2 VF 1.2 tokens)
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/06-PM Agent 交接/release-v1/launch-checklist/accessibility-audit-v1.md
workspace_canonical_path: /Users/lwy/Documents/ChatGPT/看见地球/release-v1/launch-checklist/accessibility-audit-v1.md
related_docs:
  - ./checklist-v1.md
  - /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/07-设计师设计参考/release-v1/web-v1-flow/design-freeze-log-v1.md
  - /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/07-设计师设计参考/release-v1/web-v1-flow/responsive-rules-v1.md
  - /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/07-设计师设计参考/release-v1/minimal-witness/state-matrix-v1.md
---

# Accessibility Audit v1 · 可访问性审计清单

> **作者**：Designer Agent #6（外部 Owner = 您）  
> **目标读者**：PM Agent（Gate C 决策者）/ Design / Engineering / QA  
> **目的**：把 Brief §D-P0-06 AC #2（键盘 / 触屏 / 读屏）+ AC #3（对比度 / Focus / Reduced Motion）+ 任务卡 §E（6 项可访问性）合并为**WCAG 2.1 AA 基础合规**清单。  
> **完成时间**：2026-08-24

---

## 0. 一句话总结

**Launch Candidate 必须达到 WCAG 2.1 AA 基础合规：6 项基础检查（对比度 / 键盘 / 焦点 / alt / Reduced Motion / ARIA）必须 100% 闭合。任何 Lighthouse Accessibility < 95 或 axe-core 0 critical 违规未清 → Gate C 不签字。**

---

## 1. 适用范围与基础规则

### 1.1 WCAG 2.1 等级目标

| 等级 | 目标 | Gate C 要求 |
|---|---|---|
| **A**（基础）| 必过 | ✅ 100% |
| **AA**（推荐）| 目标 | ✅ 100% |
| **AAA**（高级）| 不在 V1 范围 | ⚠️ P2 后续 |

### 1.2 适用范围

- 7 P0 页面
- 14 LOCKED 组件
- 5 类状态层（Loading / Error / Empty / Permission / Privacy）
- 5 内部锚点
- Witness Flow 6 段
- Echo Input 5 态

---

## 2. 检查项 1 · 文字对比度 ≥ 4.5:1（WCAG 1.4.3 · AA）

### 2.1 规则

| 文字类型 | 最小对比度 |
|---|---|
| 普通文字（< 18pt / < 14pt bold） | **≥ 4.5:1** |
| 大字号（≥ 18pt / ≥ 14pt bold） | **≥ 3:1** |
| UI 组件 / 图形对象 | **≥ 3:1** |
| Logo / 装饰性文字 | 不要求 |

### 2.2 A2 VF 1.2 token 对比度（LOCKED）

> 来源：`/src/styles/tokens.css` + `globals.css`

| Token | 值 | 用途 | vs `--bg-page` (冷白) | 期望 |
|---|---|---|---|---|
| `--text-primary` | Cold Light 1 档 | 正文 / 主标题 | ~14:1 | ✅ ≥ 12:1 |
| `--text-secondary` | Cold Light 4 档 | 副文 / caption | ~7:1 | ✅ ≥ 4.5:1 |
| `--text-tertiary` | Cold Light 5 档 | 弱化文字 | ~5:1 | ✅ ≥ 4.5:1 |
| `--text-meta` | Cold Light 6 档 | meta / 时间 | ~4.5:1 | ⚠️ 边界 |
| `--earth-blue` | 主蓝 | 强调 / 链接 | ~6:1 | ✅ ≥ 4.5:1 |
| `--earth-blue-deep` | 强调深蓝 | active / 焦点 | ~9:1 | ✅ ≥ 7:1 |

### 2.3 验证工具

```bash
# Lighthouse 自动扫描
npx lighthouse https://see-earth.com \
  --only-categories=accessibility \
  --view

# axe-core DevTools 扩展
# Chrome DevTools → Lighthouse 面板 → Accessibility

# WebAIM Contrast Checker (https://webaim.org/resources/contrastchecker/)
```

### 2.4 验证方法

| 步骤 | 操作 | 工具 | 期望 |
|---|---|---|---|
| 2.4.1 | Lighthouse Accessibility 评分 | Lighthouse CLI | ≥ 95 |
| 2.4.2 | axe-core 自动扫描 | axe DevTools | 0 critical / 0 serious |
| 2.4.3 | 人工对比度检查 7 P0 页面 | DevTools + WebAIM | 100% 通过 |
| 2.4.4 | Hero 4 角时间文字 vs 地球图 | DevTools | ≥ 4.5:1（半透明背景） |
| 2.4.5 | Live Events 4 行 vs bg | DevTools | ≥ 4.5:1 |
| 2.4.6 | 12 Coordinates cell vs bg | DevTools | ≥ 4.5:1 |
| 2.4.7 | Echo Input placeholder vs input bg | DevTools | ≥ 4.5:1 |

### 2.5 已知风险点

| 位置 | 风险 | Gate C 前必须 |
|---|---|---|
| Hero 副标题（半透明 / 在地球图上）| 可能 < 4.5:1 | 验证 + 加渐变遮罩 |
| Live Events meta 时间（小字号）| 可能 < 4.5:1 | 验证 + 加 background |
| Earth Archive 大字（220px Mono）| ≥ 3:1 即可（大字号） | 验证 |
| Khartoum (Red Layer) 紧张感文案 | 红 vs 冷白 | 验证 |

---

## 3. 检查项 2 · 键盘 Tab 顺序合理（WCAG 2.1.1 · A + 2.4.3 · A）

### 3.1 规则

- 所有功能必须键盘可达
- Tab 顺序符合视觉顺序
- 无跳序 / 无循环 / 无键盘陷阱

### 3.2 验证方法（5 大关键流程）

#### 流程 1：Homepage 浏览

```text
Tab 顺序期望:
1. Logo (返回首页)
2. 顶部导航 7 项(Today / Cities / My Coordinates / Archive / Journal / Spotlight / About)
3. Hero 4 角时间(链接如有)
4. 12 Coordinates featured cell (Kyoto)
5. 12 Coordinates 网格 11 cell
6. Live Events 4 行
7. Spotlight Today's Unknown CTA
8. Worlds Collide 3 cell
9. Earth Archive 时间轴 9 节点
10. Footer 链接(Privacy / Method / Feedback)
```

#### 流程 2：CityPage 4 屏阅读

```text
Tab 顺序期望:
1. Logo
2. 顶部导航(当前 /cities/:cityId 时不显示 Home logo / 同首页)
3. Hero CTA(如有)
4. CoordinateWindow 链接
5. One Scene(图 + 文字)
6. Same Second 3 cell(本地 / 你 / 远端)
7. Echo Input(textarea)
8. Echo Submit 按钮
9. DistanceNavigation(← / 中 / →)
10. Footer
```

#### 流程 3：Unknown Reveal

```text
Tab 顺序期望:
1. Logo
2. Stage 1 (UTC ?) — 装饰性,无 Tab
3. Stage 2-3 (23° N · 102° W) — 装饰性
4. Stage 4 "进入此刻 →" 按钮
5. Footer
```

#### 流程 4：Witness Flow 6 段

```text
每段 Tab 顺序:
1. Logo
2. 进度指示(段 1/6 / 2/6 ...)
3. 段 H1 / 说明文案
4. 主 CTA(拍一张 / 从相册选)
5. 次 CTA(取消 / 跳过)
6. 隐私说明链接
7. Footer(精简)
```

#### 流程 5：404 / 错误回退

```text
Tab 顺序期望:
1. Logo
2. "返回首页 →" CTA
3. 12 城推荐链接
4. Footer
```

### 3.3 验证工具

```bash
# 手动键盘测试
1. 打开 Chrome
2. 访问 https://see-earth.com/
3. 按 Tab 逐个聚焦
4. 验证:
   · 顺序符合预期
   · 焦点圈可见(Earth Blue 2px)
   · 无跳序 / 无循环
   · Enter / Space 激活

# 自动化 (axe-core)
npx axe https://see-earth.com
```

---

## 4. 检查项 3 · 焦点圈可见（WCAG 2.4.7 · AA）

### 4.1 规则（LOCKED）

```css
/* 全局焦点圈规则 */
:focus-visible {
  outline: 2px solid var(--earth-blue);
  outline-offset: 2px;
}

/* 不覆盖 :focus-visible */
/* 不使用 outline: none 而无替代 */
```

### 4.2 验证方法

| 步骤 | 操作 | 期望 |
|---|---|---|
| 4.2.1 | 鼠标点击 Logo | ❌ 不显示焦点圈（仅 `:focus-visible` 触发） |
| 4.2.2 | 键盘 Tab 到 Logo | ✅ 显示 Earth Blue 2px 焦点圈 |
| 4.2.3 | 键盘 Tab 到 12 Coordinates 任一 cell | ✅ 焦点圈可见 |
| 4.2.4 | 键盘 Tab 到 Echo Input | ✅ 焦点圈 + textarea 边框高亮 |
| 4.2.5 | 键盘 Tab 到 Submit 按钮 | ✅ 焦点圈 |
| 4.2.6 | 键盘 Tab 到 Footer 链接 | ✅ 焦点圈 |
| 4.2.7 | 鼠标 hover 任意元素 | 不显示焦点圈（hover ≠ focus） |

### 4.3 已知风险点

| 位置 | 风险 | Gate C 前必须 |
|---|---|---|
| `GlobalHeader` 14 LOCKED 组件 | 焦点圈规则 LOCKED ✓ | 验证 |
| `Hero` CTA 链接 | outline 可能在地球图上不可见 | 加 outline-offset + 半透明背景 |
| `Echo Input` | 当前 LOCKED 5 态 | 验证 focus 态 |
| `Submit` 按钮 | 当前 LOCKED 5 态 | 验证 focus 态 |

---

## 5. 检查项 4 · Alt 文本完整（WCAG 1.1.1 · A）

### 5.1 规则（见 checklist-v1.md §AC #5）

| 图片类型 | alt 策略 |
|---|---|
| 信息性图片（场景 / 城市 / 时刻）| `alt="{城市} · {场景} · {时段}"` |
| 装饰性图片（背景 / 渐变 / SVG 装饰）| `alt=""` |
| 功能性图片（链接 / 按钮内）| `alt` 描述功能 |
| Live Events 缩略图 | `alt="此刻{城市} · {分类}"` |
| Hero 地球图 | `alt="地球 · 当前 UTC 时刻下的明暗分布"` |

### 5.2 验证方法

```bash
# 扫描所有 <img> 标签
grep -rn '<img' src/ --include="*.tsx" --include="*.ts" | grep -v "alt=" 
```

**期望**：所有 `<img>` 必须有 `alt` 属性（信息性或 alt="" 装饰性）。

```javascript
// 浏览器 console 检查
document.querySelectorAll('img').forEach(img => {
  if (!img.hasAttribute('alt')) {
    console.warn('Missing alt:', img.src);
  }
});
```

### 5.3 当前实现检查

```bash
# 全仓 alt 检查
grep -rn "<img" src/components/ | grep -v "alt=" 
```

**当前已知**：`HomeHero.tsx` `earth-hero-original.png` 应有 alt（需确认）  
`HomeCoordinates.tsx` 11 城图应有 alt（需确认）  
`LiveEvents.tsx` 4 行配图应有 alt（需确认）  
`EarthArchive.tsx` 9 节点图（如有）应有 alt（需确认）

---

## 6. 检查项 5 · Reduced Motion 支持（WCAG 2.3.3 · AAA · 建议 AA）

### 6.1 规则

```css
/* 全局 reduced motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### 6.2 验证范围（动效清单）

| 板块 | 动效类型 | reduce 降级 |
|---|---|---|
| Hero | 渐入 / 4 角时间 | 立即显示 |
| 12 Coordinates | 网格 fade-in | 立即显示 |
| Live Events | 时间滚动 / 编号动画 | 立即显示 |
| Earth Archive | 时间轴进度条 | 立即显示 |
| Spotlight | 装饰动效 | 立即显示 |
| Unknown Reveal | 5 阶段 15-20s 切换 | 不降级（信息本身依赖时间）· 仅装饰动效降级 |
| CityPage 屏切换 | 屏间渐入 | 立即显示 |
| DistanceNavigation | hover 缩放 | 取消 |
| Echo Submit | loading spinner | 静态文字 |
| Witness 上传 | progress 动画 | 静态文字 |

### 6.3 验证方法

```bash
# macOS 启用 Reduce Motion
System Preferences > Accessibility > Display > Reduce motion → ON

# 或 Chrome DevTools
DevTools → Rendering → Emulate CSS media feature prefers-reduced-motion → reduce

# 验证所有动效降级
1. 打开 https://see-earth.com/
2. 滚动各板块
3. 验证:无动画 / 无 transition / 无 transform
```

### 6.4 当前实现检查

```bash
# 检查 prefers-reduced-motion 支持
grep -rn "prefers-reduced-motion" src/ --include="*.css"
```

**期望**：至少有 1 处全局规则（建议 `globals.css`） + 关键组件级覆盖。

---

## 7. 检查项 6 · ARIA labels 关键交互元素（WCAG 4.1.2 · A）

### 7.1 必备 aria-label 清单

| 元素 | aria-label | 当前实现 |
|---|---|---|
| Logo | `"看见地球 · 返回首页"` 或 `"SEE EARTH · Home"` | 需验证 |
| 顶部导航 link | `"今日" / "城市" / "我的坐标" / ...` | 需验证 |
| 12 Coordinates cell | `"{城市名} · {国家} · {当前时刻}"` | 需验证 |
| Live Events 行 | `"{城市} · {标题} · {分类}"` | 需验证 |
| Earth Archive 节点 | `"{节点名} · {年份} · {描述}"` | 需验证 |
| Hero CTA / 表单 | 描述功能 | 需验证 |
| Echo Submit 按钮 | `"留下这一刻"` | 需验证 |
| DistanceNavigation ← / 中 / → | `"上一个远方" / "回到此刻" / "下一个远方"` | 需验证 |
| Logo (back variant) | `backLabel ?? 'back'` | 已 LOCKED ✓ |
| 关闭 / 取消按钮 | `"关闭" / "取消"` | 需验证 |
| Cookie Banner CTA | `"接受" / "拒绝" / "仅必要"` | 需验证 |

### 7.2 验证脚本

```bash
# 检查所有 <button> 和 <a> 有 aria-label 或可见文字
for f in $(find src/components -name "*.tsx"); do
  python3 -c "
import re
with open('$f') as fp:
    content = fp.read()
buttons = re.findall(r'<button[^>]*>', content)
for b in buttons:
    if 'aria-label' not in b and '>' in b:
        # 检查是否有内部文字
        pass
" 2>/dev/null
done
```

### 7.3 表单字段 label

```html
<!-- 错误 ❌ -->
<input type="text" placeholder="你的城市" />

<!-- 正确 ✅ -->
<label for="city">城市</label>
<input id="city" type="text" placeholder="你的城市" />

<!-- 或 aria-label -->
<input type="text" aria-label="城市" placeholder="你的城市" />
```

**验证范围**：Witness Flow 所有输入字段 + Echo Input。

---

## 8. 自动化工具清单

| 工具 | 用途 | 命令 |
|---|---|---|
| **Lighthouse** | 综合评分（accessibility / performance / SEO）| `npx lighthouse URL --view` |
| **axe-core / axe DevTools** | 自动 a11y 扫描 | Chrome Ext: axe DevTools |
| **WAVE** | 视觉化 a11y 检查 | Chrome Ext: WAVE |
| **Pa11y** | CI 集成 a11y | `npx pa11y URL` |
| **VoiceOver** | macOS 读屏 | 系统自带 |
| **NVDA** | Windows 读屏 | 第三方 |
| **WebAIM Contrast Checker** | 对比度计算 | webaim.org |

---

## 9. Gate C 签字要求

### 9.1 自动化指标

- [ ] Lighthouse Accessibility 评分 **≥ 95**
- [ ] axe-core 自动扫描 **0 critical / 0 serious 违规**
- [ ] Pa11y CI 通过（如已集成）

### 9.2 人工验证

- [ ] **6 项基础检查 100% 通过**（§2-7）
- [ ] 5 大关键流程键盘 Tab 顺序合理（§3.2）
- [ ] 所有动效支持 `prefers-reduced-motion: reduce`（§6）
- [ ] macOS + Windows 读屏测试（VoiceOver + NVDA）
- [ ] 移动端 320px-767px 触屏命中区 ≥ 44×44 px

### 9.3 文档

- [ ] 焦点圈规则文档化（§4.1 CSS 代码 LOCKED）
- [ ] 对比度 token 表归档（§2.2）
- [ ] Alt 策略文档（§5.1）
- [ ] ARIA label 清单（§7.1）

---

## 10. 已知偏差 · 需 Gate C 前确认

| # | 偏差 | 来源 | Gate C 决策 |
|---|---|---|---|
| 1 | 移动端 7 项导航水平拥挤（无汉堡菜单）| gate-a-visual-acceptance.md | ⚠️ 影响 AC #2 触屏命中区 · Major |
| 2 | Khartoum Red Layer 缺失数据 | gate-a-visual-acceptance.md | ⚠️ 影响 AC #5 alt / AC #10 占位 · Major |
| 3 | 锚点 `scroll-margin-top` 未统一 | gate-a-visual-acceptance.md | 🟢 Minor · 建议修复 |
| 4 | 焦点圈 LOCKED 但未在所有组件验证 | design-freeze-log-v1.md §6 | ⚠️ Major · 必须验证 |

---

**End of accessibility-audit-v1.md**
