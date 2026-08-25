---
title: SEE EARTH V1 · Web Vitals 性能基线 v1 · 5 维度 + Budget + 实测方法
type: monitoring-performance-baseline
tags: [release-v1, e-p0-10, monitoring, performance, web-vitals, lcp, fid, cls, tti, budget, see-earth]
task_id: E-P0-10
brief_anchor: §5 E-P0-10 §C §F
gate_target: Gate A · Internal Alpha（实测建立 baseline）· Gate B（对照）· Gate C（锁定）
dispatched_at: 2026-08-24
dispatch_round: Round 4
status: DRAFT · IN REVIEW
author: Engineer Agent #2
source_inputs:
  - /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/SEE-EARTH-Release-Strategy-v1-Design-Engineering-Task-Brief.md §5 E-P0-10 §C §F
  - /Users/lwy/Documents/ChatGPT/看见地球/release-v1/alpha-environment/env-decision-v1.md (Alpha 部署)
  - /Users/lwy/Documents/ChatGPT/看见地球/scripts/lighthouse-ci.sh (既有脚本)
  - /Users/lwy/Documents/ChatGPT/看见地球/lighthouse-report-*.report.json (Round 1 实测)
related_docs:
  - ./error-categories-v1.md
  - ./alert-policy-v1.md
  - ./implementation-roadmap-v1.md
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/e-p0-10-monitoring/web-vitals-baseline-v1.md
workspace_canonical_path: /Users/lwy/Documents/ChatGPT/看见地球/release-v1/e-p0-10-monitoring/web-vitals-baseline-v1.md
sync_required: true · sandbox 拒绝写入 Obsidian
---

# SEE EARTH V1 · Web Vitals 性能基线 v1

> **作者**：Engineer Agent #2（外部 Owner = 用户）
> **派发时间**：2026-08-24 · Round 4
> **目的**：为 SEE EARTH V1 锁定 **5 维度性能基线** + **bundle 体积限制** + **实测方法**。让团队能**在每个 Release Gate 前对照 baseline 检测回归**。
> **核心承诺**：**Alpha 实测建 baseline · Beta 对照 · Production 锁定**。超出 budget = P0 告警。
> **依赖**：Vercel Analytics（自带 Web Vitals）· Lighthouse CI（已部署）· Bundle analyzer（新增）。

---

## 0. 阅读指南

- **§1** 5 维度性能基线（LCP / FID / CLS / TTI / FCP）
- **§2** Bundle 体积限制
- **§3** API + 上传 latency 基线
- **§4** 实测方法（Alpha / Beta / Production 三阶段）
- **§5** Budget 锁 + 超出阈值策略
- **§6** 优化项清单（Hero / Daily 12 图片 · critical CSS · 资源预算）
- **§7** 自验收

---

## 1. 5 维度性能基线

### 1.1 Performance Budget 总表

```ts
/**
 * SEE EARTH V1 · 性能预算
 * Source of truth: web-vitals-baseline-v1.md §1.1
 * 锁定值 · 超出 budget = P0 告警（alert-policy-v1.md §2.1 P0-6）
 */
export const performanceBudget = {
  /** Largest Contentful Paint (ms) */
  LCP: 2500,
  /** First Input Delay (ms) — Vercel 用 INP 替代（FID 即将弃用） */
  FID: 100,
  /** Cumulative Layout Shift (unitless) */
  CLS: 0.1,
  /** Time to Interactive (ms) */
  TTI: 3500,
  /** First Contentful Paint (ms) — 附加指标 */
  FCP: 1800,
} as const;

/** Web Vitals 评价等级（Google 官方阈值） */
export const webVitalsGrade = {
  LCP: { good: 2500, needsImprovement: 4000, poor: Infinity },
  FID: { good: 100, needsImprovement: 300, poor: Infinity },
  CLS: { good: 0.1, needsImprovement: 0.25, poor: Infinity },
  TTI: { good: 3500, needsImprovement: 5000, poor: Infinity },
  FCP: { good: 1800, needsImprovement: 3000, poor: Infinity },
} as const;
```

### 1.2 维度详解

| # | 指标 | 单位 | Budget | 含义 | 测量方式 |
|---|---|---|---|---|---|
| 1 | **LCP** (Largest Contentful Paint) | ms | **2500** | 最大可见元素（Hero 图 / 主标题）渲染完成 | PerformanceObserver · elementTiming API |
| 2 | **FID** / **INP** | ms | **100** | 首次输入延迟（FID 已弃用，Vercel 用 INP；预算兼容两者） | PerformanceObserver · EventTiming |
| 3 | **CLS** (Cumulative Layout Shift) | (unitless) | **0.1** | 视觉稳定性（页面元素意外移动） | PerformanceObserver · LayoutShift |
| 4 | **TTI** (Time to Interactive) | ms | **3500** | 页面完全可交互（主线程 idle 5s 后） | Lighthouse · 自己实现（PerformanceObserver + long task） |
| 5 | **FCP** (First Contentful Paint) | ms | **1800** | 首次内容绘制（任何文本 / 图像 / SVG） | PerformanceObserver · paint |

### 1.3 路由预算

| 路由 | 角色 | 预算（vs 全站） | 备注 |
|---|---|---|---|
| `/` (Home / Daily 12) | **首屏** | LCP ≤ 2500ms（最严格）· CLS ≤ 0.1 | Hero 图 + Daily 12 12 tiles |
| `/cities/:cityId` (City Detail) | 二级路由 | LCP ≤ 3000ms（+500ms 容差）· CLS ≤ 0.1 | Hero 图 + 4 layers |
| `/cities` (City 列表) | 二级路由 | LCP ≤ 2200ms（更简单）· CLS ≤ 0.1 | 12 cards |
| `/unknown` (Unknown Coordinate) | 二级路由 | LCP ≤ 2000ms（最简单）· CLS ≤ 0.05 | 单页交互 |
| `/about` | 二级路由 | LCP ≤ 1800ms（静态）· CLS ≤ 0.05 | 纯文本 |

> **路由预算原则**：首屏最严格（用户最频繁访问），后续路由可放宽 500-1000ms。CLS 严格度不放松（视觉稳定性是品牌关键）。

### 1.4 网络分级预算

| 网络环境 | LCP 上限 | FID 上限 | CLS 上限 | 备注 |
|---|---|---|---|---|
| WiFi | 2500ms | 100ms | 0.1 | 全预算 |
| 4G/5G | 3500ms | 150ms | 0.1 | +40% |
| 3G | 5000ms | 300ms | 0.15 | +100% |
| Slow 2G | 不承诺（仍 < 10000ms） | 500ms | 0.2 | 不告警 |

> **网络分级**通过 `navigator.connection.effectiveType` 区分（仅 Chromium 支持；其他浏览器按 `navigator.connection.type === 'cellular'` 兜底）。

---

## 2. Bundle 体积限制

### 2.1 总体预算

```ts
export const bundleBudget = {
  /** 初始 JS（main entry + critical chunks） */
  initial: 250,  // KB · gzipped
  /** 单路由 lazy chunk（按需加载） */
  perRoute: 100, // KB · gzipped
  /** 总体积（首屏 + 全部 routes lazy sum） */
  total: 600,    // KB · gzipped
  /** CSS 总体积 */
  css: 50,       // KB · gzipped
  /** 单张图片（首屏关键图片） */
  heroImage: 250, // KB · webp
} as const;
```

### 2.2 当前实测（Round 1 Lighthouse 报告 · 2026-08-18）

| 资源 | 体积 | 占预算 | 状态 |
|---|---|---|---|
| Initial JS (gzipped) | 195 KB | 78% | ✅ |
| Initial CSS (gzipped) | 38 KB | 76% | ✅ |
| 路由 chunks (合计) | 180 KB | 60% / route | ✅ |
| 总体积 | 580 KB | 97% | ⚠️ 接近上限 |
| Hero 图片（Unsplash） | 320 KB (jpeg) | 128% | ❌ 超预算 |

> **关键发现**：Hero 图片超过 budget 28%（jpeg 320KB vs budget 250KB）。优化方向：转 webp + 响应式 srcset。

### 2.3 Bundle 监控

- **构建时**：`scripts/lighthouse-ci.sh` 集成 bundle size 检查（CI 阻断超预算 commit）。
- **运行时**：Vercel Analytics 自动监控真实用户的 JS 下载/解析时间。
- **超预算告警**：P2（Slack #alerts）+ Bundle 体积报告自动 attach。

---

## 3. API + 上传 latency 基线

### 3.1 API latency

```ts
export const apiLatencyBudget = {
  /** Edition API（Daily 12 主屏） */
  edition: { p50: 200, p95: 800, p99: 1500 }, // ms
  /** City Detail API */
  cityDetail: { p50: 250, p95: 1000, p99: 1800 },
  /** Witness 提交 API */
  witnessSubmit: { p50: 500, p95: 1500, p99: 2500 },
  /** Unknown Reveal API */
  unknownReveal: { p50: 150, p95: 600, p99: 1200 },
} as const;
```

### 3.2 上传 latency

```ts
export const uploadLatencyBudget = {
  /** EXIF 剥离（客户端） */
  exifStrip: { p50: 300, p95: 800 }, // ms · 5MB jpeg
  /** 压缩 / 转 webp（客户端） */
  compress: { p50: 500, p95: 1500 },
  /** Supabase Storage 上传 */
  upload: { p50: 1500, p95: 4000, p99: 8000 }, // ms · 4G
  /** 总流程（提交 + 审核入队） */
  totalSubmit: { p50: 3000, p95: 7000, p99: 12000 },
} as const;
```

### 3.3 测量方式

- **客户端**：Analytics SDK 自动采集 `performance.now()` 在 API 调用前后。
- **服务端**：Vercel Runtime Logs 自带 `x-vercel-duration` header；通过 Vercel Analytics Server 聚合。
- **告警阈值**：当 p95 连续 5 分钟超出 budget → P1；p99 连续 5 分钟超出 budget → P0。

---

## 4. 实测方法（Alpha / Beta / Production 三阶段）

### 4.1 Phase 1 · Alpha 实测建立 baseline（Gate A 必做）

**目标**：在 `https://setheearth-git-alpha-seethearth.vercel.app/` 实测 5 维度 + Bundle + API latency，建立 baseline 文件。

**步骤**：

```bash
# Step 1. Lighthouse CI（自动化 · 已部署）
cd "/Users/lwy/Documents/ChatGPT/看见地球"
./scripts/lighthouse-ci.sh alpha  # 跑 5 个核心路由

# Step 2. 解析 Lighthouse 输出
node scripts/parse-lighthouse.mjs > release-v1/e-p0-10-monitoring/baseline-alpha-lighthouse.json

# Step 3. Vercel Analytics（自动）· 等待 7 天真实流量
# 在 Vercel Dashboard → setheearth project → Analytics → Web Vitals
# 导出 CSV 至 release-v1/e-p0-10-monitoring/baseline-alpha-vercel.csv

# Step 4. Bundle 体积检查（构建时）
npm run build -- --mode production
# 自定义 rollup plugin 输出 bundle-size.json
# 校验 vs §2.1 budget
```

**实测时长**：Lighthouse（1 天） + Vercel Analytics（7 天真实流量） = 8 天。

**Baseline 文件位置**：
- `release-v1/e-p0-10-monitoring/baseline-alpha-lighthouse.json`（机器生成）
- `release-v1/e-p0-10-monitoring/baseline-alpha-vercel.md`（人工汇总）

**Baseline 表格示例**：

| 路由 | LCP (p75) | FID/INP (p75) | CLS (p75) | TTI (p75) | FCP (p75) | 来源 |
|---|---|---|---|---|---|---|
| `/` | TBD | TBD | TBD | TBD | TBD | Vercel Analytics 7d p75 |
| `/cities/kyoto` | TBD | TBD | TBD | TBD | TBD | Vercel Analytics 7d p75 |
| `/unknown` | TBD | TBD | TBD | TBD | TBD | Vercel Analytics 7d p75 |

### 4.2 Phase 2 · Beta 对照 baseline（Gate B 必做）

**目标**：Beta 部署实测 vs Alpha baseline，确认**无回归**。

**步骤**：
1. 在 `https://see-earth-beta.vercel.app/`（Gate B 创建）跑同样的 Lighthouse CI。
2. 解析输出，与 `baseline-alpha-lighthouse.json` 对比。
3. 任一指标 p75 偏差 > 10% → 标注 regression，需 PM Agent 决定是否阻塞发布。
4. 任一指标 p75 偏差 > 25% → 强制阻塞发布。

**对比报告位置**：`release-v1/e-p0-10-monitoring/baseline-beta-vs-alpha.md`

### 4.3 Phase 3 · Production 锁定 budget（Gate C 必做）

**目标**：Production 部署锁定 budget，超出 P0 告警。

**步骤**：
1. Beta 通过后部署到 Production `https://see-earth.vercel.app/`。
2. 24 小时真实流量后，确认 baseline 与 Beta 一致。
3. 在 `vercel.json` 锁定 alert threshold = budget（详见 `alert-policy-v1.md §5.3`）。
4. 在 Sentry / Vercel 配置 P0-6 告警（LCP > 4000ms 立即触发）。

---

## 5. Budget 锁 + 超出阈值策略

### 5.1 Budget 锁的三道防线

```text
防线 1 · 构建时
  CI 阻断：bundle size 超 budget → PR 无法 merge
  
防线 2 · 部署时
  Lighthouse CI：p75 超 budget 1.2× → 部署标记 warning
  Lighthouse CI：p75 超 budget 1.5× → 部署阻断
  
防线 3 · 运行时
  Vercel Analytics：实时 p75 超 budget → P1 告警（Slack #alerts）
  Vercel Analytics：实时 p75 超 budget 1.5× → P0 告警（PagerDuty）
```

### 5.2 超出阈值策略

| 偏差幅度 | 措施 |
|---|---|
| **< 10%** | ✅ 正常范围 · 记录到 baseline 周报 |
| **10% ~ 25%** | ⚠️ warning · Slack #alerts P2 通知 · 下一 Sprint 处理 |
| **25% ~ 50%** | 🟠 regression · P1 告警 · 24h 内修复或回滚 |
| **> 50%** | 🔴 P0 告警 · PagerDuty · 立即调查 + 回滚 |

### 5.3 Vercel Web Vitals Alert 配置

```yaml
# vercel.json (Phase 3 锁定)
{
  "analytics": {
    "webVitals": {
      "LCP": {
        "alertThreshold": 2500,
        "warnThreshold": 2000,
        "p0Threshold": 3750  # 1.5x budget
      },
      "FID": {
        "alertThreshold": 100,
        "warnThreshold": 75,
        "p0Threshold": 150
      },
      "CLS": {
        "alertThreshold": 0.1,
        "warnThreshold": 0.05,
        "p0Threshold": 0.15
      },
      "TTI": {
        "alertThreshold": 3500,
        "warnThreshold": 2800,
        "p0Threshold": 5250
      }
    }
  }
}
```

---

## 6. 优化项清单

### 6.1 Hero / Daily 12 图片（最高优先级）

| # | 优化 | 实施方式 | 预期收益 |
|---|---|---|---|
| 1 | 响应式图片（`srcset`） | `<img srcset="...320w ...640w ...1280w" sizes="...">` | LCP -300ms |
| 2 | 转换 webp（vs jpeg） | Unsplash 自动 `?fm=webp&q=80` 或本地构建时转换 | 图片体积 -40% |
| 3 | **可选**：转换 avif | Unsplash `?fm=avif&q=60`（Chromium / Firefox 支持） | 图片体积 -60%（但 Safari 兼容性差） |
| 4 | Lazy load（非首屏 tile） | `<img loading="lazy" decoding="async">` | TTI -200ms |
| 5 | Preload Hero 图 | `<link rel="preload" as="image" href="/hero.webp">` | LCP -200ms |
| 6 | CDN 缓存破坏 | Unsplash 自动 `?w=...&fit=max` · Vercel 自动加 hash | 缓存命中率 +20% |

> **当前 Hero 图（jpeg 320KB）超预算 28%**。实施 #1+#2 后预计降至 ~190KB，回到 budget 内。

### 6.2 首屏资源（critical CSS）

| # | 优化 | 实施方式 | 预期收益 |
|---|---|---|---|
| 1 | Critical CSS inline | `vite-plugin-critical` 或手工提取首屏 CSS | FCP -150ms |
| 2 | 字体 subset | `@font-face` subset latin + latin-ext（避免下载完整 CJK 字体） | 字体 -80% |
| 3 | 字体 preload | `<link rel="preload" as="font" crossorigin>` | LCP -100ms |
| 4 | JS async / defer | `<script type="module">` 自动 defer | TTI -200ms |
| 5 | Tree shaking unused CSS | PurgeCSS 集成 Vite | CSS -30% |

### 6.3 API + 上传

| # | 优化 | 实施方式 | 预期收益 |
|---|---|---|---|
| 1 | Edge cache（Vercel KV） | Edition API 缓存 5 分钟 | p95 -300ms |
| 2 | SWR（stale-while-revalidate） | 客户端缓存 + 后台刷新 | Edition p50 -150ms |
| 3 | 图片压缩（客户端） | `browser-image-compression` 转 webp q=80 | Upload p95 -1000ms |
| 4 | Chunked upload | `tus-js-client` 或自实现 5MB chunk | Upload 失败率 -50% |
| 5 | 进度反馈 | 上传进度条 + 取消按钮 | 感知速度 +++ |

### 6.4 通用 Vite 优化

| # | 优化 | 实施方式 | 预期收益 |
|---|---|---|---|
| 1 | Code splitting per route | `React.lazy()` + `<Suspense>` | Initial -30% |
| 2 | Manual chunks（vendor split） | `vite.config.ts` `build.rollupOptions.output.manualChunks` | Cache 命中率 +50% |
| 3 | Compression（Brotli） | Vercel 自动启用 | Bundle -15% |
| 4 | Terser minification | Vite 默认 esbuild · 关键路径加 terser | Bundle -5% |

---

## 7. 自验收 Acceptance Criteria

- [x] 5 维度性能基线（LCP / FID / CLS / TTI / FCP）锁定值
- [x] Performance Budget 总表 + 路由预算 + 网络分级预算
- [x] Bundle 体积限制（initial / perRoute / total / css / heroImage）
- [x] API + 上传 latency 基线（p50 / p95 / p99）
- [x] 三阶段实测方法（Alpha 建 baseline / Beta 对照 / Production 锁定）
- [x] 三道防线（构建时 / 部署时 / 运行时）
- [x] 超出阈值策略（4 档偏差幅度）
- [x] Vercel Web Vitals Alert 配置
- [x] 优化项清单（Hero 图 / critical CSS / API+上传 / Vite）
- [x] 当前实测数据（Round 1 Lighthouse）记录
- [x] 与 `alert-policy-v1.md` §2.1 P0-6 / P0-5 对齐
- [x] 与 `implementation-roadmap-v1.md` Phase 1-3 对齐

---

## 8. 元数据

| 字段 | 值 |
|---|---|
| 文档版本 | v1 |
| 创建时间 | 2026-08-24 |
| 创建人 | Engineer Agent #2 |
| 文档 ID | `web-vitals-baseline-v1.md` |
| 目标 Gate | Gate A（Phase 1）· Gate B（Phase 2）· Gate C（Phase 3） |
| Workspace 路径 | `/Users/lwy/Documents/ChatGPT/看见地球/release-v1/e-p0-10-monitoring/web-vitals-baseline-v1.md` |
| Obsidian canonical 路径 | `/Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/e-p0-10-monitoring/web-vitals-baseline-v1.md` |
| Obsidian 同步状态 | ❌ 未同步 |

---

**End of Web Vitals Baseline v1**