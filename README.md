# 看见地球 · See Earth

> 沿时间轴穿越地球四十六亿年历史的交互式应用 — **M0 原型**

M0 目标:搭建可运行的项目骨架,验证核心叙事组件 —— 一颗会自转的地球 + 一条
9 节点的时间轴。后续 milestone 会逐步替换静态数据并接入真实地图瓦片。

---

## 技术栈

| 层级            | 选型                          |
| --------------- | ----------------------------- |
| 构建工具        | **Vite 5**                    |
| UI 框架         | **React 18** (函数组件 + Hooks) |
| 类型系统        | **TypeScript 5** (strict)     |
| 样式            | **原生 CSS Modules** + `tokens.css` 设计令牌 |
| 包管理          | npm                           |
| 运行时依赖      | 仅 `react` / `react-dom`      |

> M0 不引第三方 UI 库、动画库、地图库。所有视觉(自转/光影/辉光/时间轴进度条)由
> 手写 CSS + SVG + CSS 动画完成,可离线、零额外下载。

---

## 目录结构

```
看见地球/
├─ index.html                 # 入口 HTML,Vite 直接读
├─ vite.config.ts             # @vitejs/plugin-react + @ alias
├─ tsconfig.json              # 主项目配置 (src)
├─ tsconfig.node.json         # Vite 工具链配置
├─ public/
│  └─ earth.svg               # favicon
├─ src/
│  ├─ main.tsx                # createRoot 挂载
│  ├─ App.tsx                 # 顶层布局 (Hero + Timeline)
│  ├─ App.module.css
│  ├─ styles/
│  │  ├─ tokens.css           # ★ 所有颜色/字体/间距/动画令牌
│  │  └─ globals.css          # reset + body 背景
│  ├─ components/
│  │  ├─ EarthGlobe.tsx       # ★ 自转的地球
│  │  ├─ EarthGlobe.module.css
│  │  ├─ Timeline.tsx         # ★ 时间轴 + 详情卡
│  │  └─ Timeline.module.css
│  ├─ data/
│  │  └─ timelineEvents.ts    # 9 个静态节点 (M1 会替换为 JSON 数据源)
│  └─ vite-env.d.ts
```

---

## 设计令牌 (tokens.css)

所有视觉常量都集中在 `src/styles/tokens.css`,组件只引用 `--xxx`
变量、永不写死值。分七组:

1. **Color · Space**:页面/卡片/抬升面背景分级
2. **Color · Earth & Atmosphere**:海洋、陆地、冰盖
3. **Color · Accent**:四个 marker 类型(stellar/life/warm/human)
4. **Color · Text**:三档文字色 + 反色
5. **Color · Border / Divider**
6. **Typography**:三套字体 (sans/serif/mono) + 6 级字号 + line-height
7. **Spacing / Radius / Shadow / Glow / Motion / Layout / Z-Index**

`prefers-reduced-motion` 会把所有动效时长归零 — 无障碍默认开启。

---

## 核心组件

### 🌍 EarthGlobe

- 内嵌 SVG,viewBox 200x100,程序绘制六大洲 + 冰盖
- 两份大陆带横向并列,通过 CSS `transform: translateX(-50%)` 实现无缝循环自转
- 叠层:
  - **海洋径向渐变**(`--ocean-deep` → `--space-deepest`)
  - **shading** (右侧暗化,模拟昼夜)
  - **specular** (左上高光,模拟太阳直射)
  - **clouds** (CSS dataURL 云带,独立缓慢漂移)
  - **atmosphere** (外圈蓝色辉光,`--glow-earth`)
  - **stars** (12 个随机闪烁的小点,背景层)
- 自转默认周期 9s,云层 28s,可被 `prefers-reduced-motion` 暂停

### ⏳ Timeline

- 9 个静态地球历史节点(太阳星云 → 月球 → 海洋 → 生命 → 大氧化 →
  寒武纪 → 恐龙灭绝 → 智人 → 此刻)
- 节点下方 rail 高亮"已发生"区段(渐变 + glow)
- 活动节点上方浮出一张详情卡(年份 + 标题 + 中英副标题 + 描述)
- **键盘**:聚焦后 ← → 切换,Home/End 跳首尾
- **鼠标**:直接点击节点
- aria-live="polite",aria-pressed,role="toolbar",roving tabindex

---

## 跑起来

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # 类型检查 + 生产打包到 dist/
npm run preview      # 预览构建产物
npm run typecheck    # 仅跑 tsc --noEmit
```

构建产物 (M0):

```
dist/index.html                   0.58 kB │ gzip:  0.42 kB
dist/assets/index-*.css          15.08 kB │ gzip:  4.22 kB
dist/assets/index-*.js          151.96 kB │ gzip: 50.69 kB
```

---

## 下一步 (M1)

- [ ] 替换程序绘制的地球为真实 equirectangular 地图瓦片
- [ ] 时间轴数据迁移到 `/public/data/earth-events.json`
- [ ] 接入 ScrollTrigger,把时间轴与地球视差绑定
- [ ] 加入详情页路由 + 节点详情展开视图
- [ ] 引入真实经纬度标记 (替换扁平 9 节点)
- [ ] i18n (中文 / English)

---

## 仓库约定

- 分支:`codex/<milestone>-<topic>`(例如 `codex/m1-real-tiles`)
- `outputs/` 与 `work/` 为历次设计稿与设计章节笔记(M0 之前的内容),
  不参与构建,默认不进版本控制外的强制隔离,但允许保留作为参考。
