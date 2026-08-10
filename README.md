# 看见地球 / SeTheEarth

> A curated view of the world — 看见此刻世界正在发生什么。

看见地球是一个**编辑视角的世界观察窗口**，帮助用户暂时跳出个人信息茧房，观察此刻世界不同角落正在发生什么。

不是新闻聚合，不是社交推荐，不是搜索引擎。

是**编辑视角 +真实数据**的轻量观察器。

---

## 立即体验

```bash
npm install
npm run build
npm run start
# → http://localhost:8080
```

---

## v1.1 状态

- ✅ **基线版本**：v2.60.0
- ✅ **4 /4 P0 阻塞项完成**：
  - feat(weather): open-meteo 真实天气接入 + env flag
  - feat(sun): sunrise-sunset 日出日落接入
  - feat(time): Intl.DateTimeFormat 时区统一化
  - chore(deploy): serve -s dist + SPA fallback（修复 /cities/* 404）
- ✅ **远程仓库**：github.com/LWY0330/SeTheEarth
- ✅ **主分支**：main
- ⏳ **部署**：v1.1.1（待 Vercel / Netlify）

---

## 核心功能

### 板块 1 · Hero- 品牌主视觉
- 一句话价值主张
- 城市搜索入口

### 板块 2 · 城市精选（City Atlas）

- 1 个 Featured 主视觉 + 5 个精选城市
- 右侧城市列表，hover 同步主图
- 点击进入 `/cities/[slug]` 详情页
- CITY NOW 组件：当前时间 +天气 + 一句编辑观察

### 板块 3 · 世界此刻（World Snapshot）

- 全球时间轴 + 实时事件列表
- 同一时间，不同地区，不同命运
- 板块3 顶部 UTC 时间实时更新
- 状态字段：`developing` → `live`（接真实数据后切换）

---

## 数据源

| 数据 | 来源 | 用途 |
|---|---|---|
| 天气 | open-meteo.com/v1/forecast | 板块 2城市天气 |
| 日出日落 | sunrise-sunset.org/json | 多时段图片选择 |
| 时区 | Intl.DateTimeFormat | 真实当地时间 |
| 城市数据 | 编辑视角 | 12座城市简介 |

所有外部 API：

- 免费，无需 API Key
- 15 分钟或24 小时服务端缓存
- 失败兜底 UI：'Weather temporarily unavailable'

---

## 路由结构

```text
/ 首页（板块 1 / 2 / 3）
/cities城市地图集（v1.2）
/cities/[slug]     城市详情页（v1.2）
/about 关于 + 编辑方法（v1.2）
```

当前 v1.1 中 `/cities/*` 路由已配置 SPA fallback。

---

## 项目结构

```text
src/
  components/ UI 组件
  sections/         Section 1 / 2 / 3
  lib/
    weather.ts        open-meteo 接入
    sun.ts            sunrise-sunset 接入
    timezone.ts       Intl 时区计算
    cities.ts 12 城市数据
outputs/ 生成产物
scripts/             辅助脚本
work/sections/       板块组件
public/              静态资源
V1.1_ROADMAP.md      v1.1 上线路线图
```

---

## 技术栈

- **前端**：Vite + React + TypeScript
- **样式**：原生 CSS /衬线字体
- **数据**：fetch + Intl.DateTimeFormat
- **构建**：Vite build → dist/
- **部署**：serve -s dist（v1.1）/ Vercel（v1.1.1）

---

## 编辑方法

看见地球的内容来自**编辑筛选 +真实数据**，不是算法推荐。

- **不个性化**：不基于用户历史偏好排序；
- **跨地域**：覆盖亚洲、欧洲、非洲、北美、南美、大洋洲；
- **跨主题**：金融、文化、自然、天气、交通、日常；
- **大事件 + 小事并存**：世界大事与普通生活片段同时呈现。

打破信息茧房不是产品功能，是**默认行为**。

---

## 上线路线图

- **v1.0**：视觉 Demo- **v1.1**（当前）：真实数据接入 + 部署修复
- **v1.2**：/cities 列表 + 详情页 + SEO
- **v2.0**：PWA + 推送 + 用户留存

详见 `V1.1_ROADMAP.md`。
