# v2-phase15 首页完整重写 · 实施计划

**任务卡**：IN PROGRESS
**目标**：让 HomeShell 实际部署与设计 LOCK 完全一致

---

## 现状分析（v2-phase15 mockup 与 alpha 部署差距）

### Mockup 设计意图（v2-phase15）

HomeShell 设计 LOCK 包括 **5 个板块 + 完整 7 项导航**：

1. **Hero**：全屏真实地球图 + 顶部日期 / COORDINATES / EARTH DAY 元信息 + 中央 "世界此刻,同时发生。" 标题 + 4 角城市时间（Tokyo/Lisbon/Reykjavík/Cape Town）
2. **Live Events**："地球上正在发生的事"（标题）+ 4 行 live event + 右上副标 "不是新闻流。是此刻的时间切片。"
3. **12 Coordinates**："12 个同时运转的远方" + 11+1 城网格 + 真实街景图（京都主视觉 + 11 城缩略）
4. **Worlds Collide**："三座城市,同一秒。" + 3 城同秒对比（Khartoum/Reykjavík/Lisbon）
5. **Earth Archive**："一条 46 亿年的弧线" + "YOU × 1/77,000,000"（本任务范围外，由 Phase 2 接管）

完整 7 项顶部导航：`Cities | Journal | Earth Archive | Spotlight | Unknown | My Coordinates | About`

### alpha 部署现状（src/App.tsx）

- **Hero**：用 SVG EarthGlobe（暖色暖橘海陆配色），标题 "世界·不止方寸"，无 4 角时间，无真实图片
- **Live Events**：不在首页（仅 /cities 内的 6 条数据流）
- **12 Coordinates**：11 城无图色块（cities.ts images 是本地 /images/cities/ 路径，但实际图片资源未必就位）
- **Worlds Collide**：不在首页
- **顶部导航**：仅 3 项（Cities / Journal / About）

### 差距总结

| 板块 | Mockup 要求 | Alpha 现状 | 差距等级 |
|------|------|------|------|
| Hero 背景 | 真实地球图（earth-hero-original.png） | SVG 球体 | 🔴 P0 |
| Hero 标题 | 世界此刻,同时发生 | 世界·不止方寸 | 🔴 P0 |
| Hero 4 角时间 | Tokyo/Lisbon/Reykjavík/Cape Town | WorldTimeRail 12 城横条 | 🟡 P1 |
| Live Events 板块 | "地球上正在发生的事" + 4 行 | 不在首页 | 🔴 P0 |
| 12 Coordinates | 11 城 + 真实 Unsplash 图片 | 11 城无图 | 🔴 P0 |
| Worlds Collide | 3 城同秒对比 | 不在首页 | 🔴 P0 |
| 顶部导航 | 7 项 | 3 项 | 🔴 P0 |
| A2 视觉系统 | 已应用（tokens.css） | 已应用 | ✅ |
| 响应式 | 三档 | 三档 | ✅ |

---

## 实施计划（严格按 mockup）

### Phase A · 读取 + 分析 ✅ 已完成

- 读取 5 张 mockup PNG
- 读取 home-hero.html 交互
- 读取 src/App.tsx / App.module.css / tokens.css / globals.css
- 读取 cities.ts / liveMoments.ts
- 读取 12 城 URL 清单（12 个真实 Unsplash URL）
- 读取 WorldTimeRail 复用逻辑

### Phase B · 数据准备 ✅ 进行中

1. ✅ 复制 `earth-hero-original.png` 到 `public/images/home/`
2. ✅ 验证 12 城 URL 清单（已读取并准备嵌入到 HomeCoordinates 组件）
3. 🟡 Khartoum 缺失：先用 kyoto 的本地色块占位（符合任务"Phase 1 不强求补 Khartoum"）

### Phase C · 实施（即将开始）

#### 新文件

1. `src/components/HomeHero.tsx` + `.module.css` — 全屏 Hero
2. `src/components/HomeLiveEvents.tsx` + `.module.css` — Live Events 板块
3. `src/components/HomeCoordinates.tsx` + `.module.css` — 12 Coordinates 板块
4. `src/components/HomeWorldsCollide.tsx` + `.module.css` — Worlds Collide 板块

#### 修改

1. `src/App.tsx` HomeShell —— 集成 4 个新组件，删除 SVG EarthGlobe import
2. `src/App.module.css` —— 调整整体响应式布局（Hero 100vh + 4 板块纵向流）
3. `src/components/CityCard.tsx` —— 支持可选 `imageUrl` prop（兼容 Unsplash 街景）

#### 复用（不修改）

- `src/components/GlobalHeader.tsx` (ui/GlobalHeader.tsx) —— 7 项导航
- `src/components/WorldTimeRail.tsx` —— 12 城时间逻辑（Hero 内嵌选择 4 角）
- `src/data/cities.ts` —— 数据源
- `src/data/liveMoments.ts` —— 数据源

#### 不删（保留兼容）

- `src/components/EarthGlobe.tsx` —— 不 import
- `src/components/EarthGlobe.module.css` —— 保留

### Phase D · Build 验证

```bash
cd "/Users/lwy/Documents/ChatGPT/看见地球"
npm run build
```

### Phase E · Commit

```
feat(design): comprehensive v2-phase15 homepage rewrite
```

### Phase F · 交付物报告

写到 `release-v1/design-implementation/v2-phase15-report.md`

---

## 风险点 / 数据缺失

### 数据缺失

| 项 | 状态 | 影响 | 决策 |
|---|---|---|---|
| Khartoum 12 城数据 | 缺 | 第 12 个城市缩略图占位 | 用其他 11 城 + 占位符标注 "(Khartoum · 待补)" |
| Khartoum 街景 URL | 缺（清单标记 PENDING） | Worlds Collide 第 3 列 | 用 kyoto 或 lisbon 替代 + 备注 |
| 4 城温度 27/24/12/19°C | 来自 cities.ts weather | 实时显示 | ✅ 使用 weather.temperatureC |

### 技术风险

| 风险 | 等级 | 处理 |
|---|---|---|
| Vite 静态资源加载 earth-hero-original.png | 🟢 低 | 已复制到 public/images/home/ |
| Unsplash URL 加载（12 张图片） | 🟡 中 | 已知稳定，但加 alt + lazy loading + 容错（onerror 显示 placeholder） |
| 移除 EarthGlobe 后 package.json deps 检查 | 🟢 低 | 不引用即可，EarthGlobe 文件保留 |
| 4 板块滚动到 Live Events 等锚点 | 🟢 低 | 用 #events / #coordinates / #collide 锚 |
| Mobile 4 角时间堆叠 | 🟡 中 | Media query 改为单列堆叠 |

---

## 自验收 checklist

- [x] 5 张 mockup PNG 都已读取 + 理解
- [ ] HomeHero 用真实地球图（`earth-hero-original.png`）
- [ ] Hero 4 角时间显示 4 城动态时间（Tokyo/Lisbon/Reykjavík/Cape Town）
- [ ] Hero 主标题 "世界此刻,同时发生" · 副标题 "此刻,这颗行星..."
- [ ] 7 项顶部导航（Cities | Journal | Earth Archive | Spotlight | Unknown | My Coordinates | About）
- [ ] Live Events 板块有 4 行 live event
- [ ] 12 Coordinates 板块有 12 城（11 城可接受但需说明）+ 真实街景图
- [ ] Worlds Collide 板块有 3 城同秒对比
- [ ] A2 视觉系统：冷白底 / Earth Blue 强调 / 0 大圆角 / 0 阴影
- [ ] 三档响应式
- [ ] 不修改 14 LOCKED 组件 props / API
- [ ] npm run build 编译通过（exit code 0）
- [ ] 不引入新依赖
- [ ] git commit 成功（本地 alpha 分支）
