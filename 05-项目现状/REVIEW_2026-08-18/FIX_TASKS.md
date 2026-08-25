# 「看见地球」 · 修复 / 优化任务清单

> 对应审查:`AUDIT_REPORT.md`(`05-项目现状/REVIEW_2026-08-18/`)
> 优先级规则:
> - **P0** = 上线阻塞(安全 / 数据丢失 / 严重性能 / 核心功能崩溃)
> - **P1** = 上线后第一周必修
> - **P2** = 后续迭代

---

## P0 · 上线必修(2 项 / ~0.5 工日)

- [ ] P0 | CityIndex 颜色对比度 a11y fail(Lighthouse 0 分) | `src/components/CityIndex.module.css:79` + `:144` | (1) `.item.active .number` 改用 `--color-accent-600`(#B85F40,对比度 ≈ 5.0:1)替换 `var(--color-accent-500)`;(2) `.nameEn` 删除 `opacity: 0.7` 改为 `color: var(--color-ink-700)` 对比度 ≈ 9.5:1 | 0.5h
- [ ] P0 | 首屏"纽约 / 上海 / 伦敦"按钮的纽约点击无反应 | `src/App.tsx:244` + `src/data/cities.ts:477-507` | `findCityIdx('newyork')` 改 `findCityByAnyKey('newyork')`(后者已实现 alias 返回 undefined → click noop,至少不抛);或根本性方案:在 `cities` 数组新增 `new-york` 城市并补一张主图 | 1h

---

## P1 · 上线后第一周必修(9 项 / ~2.5 工日)

- [ ] P1 | 全 App 无 ErrorBoundary,任何 throw 即白屏 | `src/main.tsx:15-19` | 新增 `src/components/ErrorBoundary.tsx`(class component,getDerivedStateFromError),在 `<App />` 外包一层;fallback 给"出了点问题,刷新看看"按钮 + 重试 `window.location.reload()` | 1h
- [ ] P1 | tokens.css 第 2 个 `:root {` 嵌套未闭合 | `src/styles/tokens.css:335-389` | 把 sections 18(contentType)· 19(SearchBox)· 20(SyncMoment)· 21(Modal)的所有变量**全部挪到文件顶部主 :root 块**(行 25-289),只保留单层 :root + 2 个 @media 块 | 1h
- [ ] P1 | AboutPage GitHub 仓库链接大小写错误导致 404 | `src/components/AboutPage.tsx:72` | `lwy0330` 改为 `LWY0330`(与 git remote `git@github.com:LWY0330/SeTheEarth.git` 对齐) | 5min
- [ ] P1 | Vite config 缺 sourcemap 策略 + preview security headers | `vite.config.ts:7-19` | 加 `build: { sourcemap: 'hidden' }`(产 .map 但不挂 URL 引用 → Sentry/Stack 仍可上传)+ `preview: { headers: { 'X-Frame-Options': 'DENY', 'Referrer-Policy': 'strict-origin-when-cross-origin', 'X-Content-Type-Options': 'nosniff', 'Permissions-Policy': 'camera=(), microphone=(), geolocation=()' } }` | 0.5h
- [ ] P1 | Service Worker 图片缓存策略 dead branch | `public/sw.js:25-30 + :70-73` | 删除 IMAGE_HOSTS 白名单相关代码;改成对**所有同源 GET 图片**走 stale-while-revalidate(更简单也更准) | 0.5h
- [ ] P1 | `getMixedSnapshot` + `onReshuffle` 是 dead code | `src/data/liveMoments.ts:715-719` + `src/components/MomentsTimeline.tsx:24` + `src/App.tsx:362-368` | 二选一:(A) 真正接入 → App.tsx 用 `useState<readonly LiveEvent[]>` 保存,setEvents 接 onReshuffle;(B) 删掉函数和 onReshuffle 类型/prop。**建议先选 B**,因为 v2.x 接真实数据时这条会被整体重写 | 0.5h
- [ ] P1 | `tsconfig.node.json` composite + noEmit 组合让 typecheck 与 build 不对齐 | `tsconfig.node.json:3-9` + `package.json:13` | typecheck 脚本改 `tsc -b --noEmit`;或拆 tsconfig 让 typecheck 单跑 tsconfig.json + lint 单独跑 | 0.5h
- [ ] P1 | `MomentsTimeline` 列表项兼任 listitem + button,违反 ARIA | `src/components/MomentsTimeline.tsx:255-313` | 改成 `<li><button>...</button></li>` 嵌套结构,让 button 接管交互 + li 接管语义 | 0.5h
- [ ] P1 | 完全没有 ESLint / Prettier / EditorConfig / .nvmrc | 项目根 | 加 `.editorconfig`(LF / 2-space / utf-8)+ `.nvmrc`(20)+ ESLint(`eslint-plugin-react-hooks` + `eslint-plugin-jsx-a11y`)+ Prettier;在 `lighthouse-ci.sh` 之前加 `lint` 一步做 CI gate | 2h

---

## P2 · 后续迭代(已按主题分组)

### 安全 / 可观测性

- [ ] P2 | 无前端埋点 / 错误上报 | 全 src/ | v1.6 加 Sentry(`@sentry/react` + `@sentry/vite-plugin`),最少加 `window.addEventListener('error', n.sendBeacon)` 兜底 | 4h
- [ ] P2 | 无 CSP 头 | `vite.config.ts` | 加 `Content-Security-Policy: script-src 'self' 'unsafe-inline'; img-src 'self' https://*.vercel-storage.com data:;` 等(SPA + 内联需要 unsafe-inline,严格化可后续改 nonce) | 1h
- [ ] P2 | 404 路由不返回 404 HTTP 状态 | `src/router/Router.tsx` + `src/components/CityPage.tsx:60-74` | Router 维护 `notFound` 状态 + `<CityPage>` 找不到 slug 时在 useEffect 内 `history.replaceState({}, '', '/404'); document.title = '404'` + 在 Vercel 层用 `vercel.json` `notFound` 配置 SPA fallback;严格化需 SSR 改造 | 2h
- [ ] P2 | Dependabot / Renovate 未配置 | `.github/` | 加 `dependabot.yml` 每月 npm audit | 0.5h

### 性能

- [ ] P2 | Google Fonts `@import` 阻塞首屏 | `src/styles/globals.css:7` | 改成 `<link rel="preconnect" href="https://fonts.googleapis.com">` + `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?...&display=swap" media="print" onload="this.media='all'">`(异步 + swap) | 0.5h
- [ ] P2 | Bundle 未拆 vendor chunk | `vite.config.ts` | 加 `build.rollupOptions.output.manualChunks: { 'react-vendor': ['react', 'react-dom'] }`,便于二级路由复用缓存 | 0.5h
- [ ] P2 | Bundle size 监控缺位 | package.json devDeps | 加 `vite-plugin-bundlesize` 或 CI 跑 `size-limit` 卡阈值(JS gzip ≤ 100KB / CSS gzip ≤ 20KB) | 1h
- [ ] P2 | 所有 `setInterval` 不响应 reduce-motion | `src/components/CityFeatured.tsx:32-35`, `CityNow.tsx:55-58,61-71,74-82`, `CityPage.tsx:54-57`, `MomentsTimeline.tsx:57-67`, `ConfrontationalFlow/ConfrontCard.tsx:35-38`, `SyncMoment/SyncMoment.tsx:146-149`, `SyncMoment/TimeBlock.tsx:19-22` | 新增 `src/hooks/useReducedMotion.ts`(封装 `matchMedia` + addEventListener + cleanup);在每个 setInterval 守卫 — reduce 时把频率 ×10 或直接 stop | 2h

### a11y 持续

- [ ] P2 | CityNow 的 `aria-live` 包整张卡片是噪音 | `src/components/CityNow.tsx:99-138` | 只把 weatherRow + dayPeriod 行放进 `aria-live="polite"`,其他用静态 `<div>` | 0.5h
- [ ] P2 | 无 skip-nav 链接 | `src/App.tsx` 或 `src/components/` | 在 `<main>` 之前加 `<a href="#main-content" className="skip-nav">跳到主内容</a>`,CSS 控制默认隐藏,`:focus-visible` 时显示 | 0.5h
- [ ] P2 | 无 JSON-LD 结构化数据 | `src/components/Meta.tsx` 或各 Page | Meta 接受可选 `jsonLd: object` prop,在 useEffect 内 `document.head.appendChild(Object.assign(document.createElement('script'), { type: 'application/ld+json', textContent: JSON.stringify(jsonLd) }))`,各 Page 注入 Organization / Article / BreadcrumbList | 2h
- [ ] P2 | og:image 用相对路径(分享失效) | `src/components/Meta.tsx:61-67` | `ogImage ? SITE_URL + ogImage : removeMeta('og:image')` | 5min
- [ ] P2 | `<img>` 无 onError 兜底 | `src/components/CityFeatured.tsx:57-71`, `CityPage.tsx:113-124`, `CityCard.tsx:35-45`, `CityIndex.tsx:129-138`, `CityIndexPage.tsx:60-70`, `MomentsTimeline.tsx:281` | 各 `<img>` 加 `onError={(e) => { e.currentTarget.src = '/images/fallback.webp'; }}`;或封装 `<SafeImage>` 组件 | 2h

### 工程化

- [ ] P2 | `App.tsx.bak` 残留工作树 | `src/App.tsx.bak` | `git rm --cached` 或直接物理删除;改用 `git stash` / branch 而不是 .bak | 5min
- [ ] P2 | `tokens.css` 拆分为多文件 | `src/styles/tokens.css` | 拆成 `src/styles/tokens/{colors,typography,spacing,level,component}.css`,Vite 自动合并;v1.6 删除 v1.4 alias 旧名 | 3h
- [ ] P2 | `ui/Modal` 是 dead component | `src/components/ui/Modal/Modal.tsx` | 重写 `HotkeyHelp.tsx` 用 `<Modal size="sm" title="快捷键">` 替换 inline style,既收敛抽象又消 dead code | 1h
- [ ] P2 | `userCityToCity` 用 `as unknown as` 强类型断言 | `src/lib/userCity.ts:80-83` | 改 useWeather 接受 5 字段子集 type:`function useWeather(city: {slug:string,lat:number,lon:number,timezone:string} | null | undefined)` | 0.5h
- [ ] P2 | 单元测试覆盖严重不足 | `src/lib/*.test.ts` | 加 `weather.test.ts`(mock fetch,测正常返回 + 失败 safe 返回 + 缓存命中 + in-flight 去重)· `sun.test.ts`(mock fetch + 极昼/极夜分支)· `imageUrl.test.ts`(相对路径旁路 + Unsplash URL 加参数)· `editorialLevel.test.ts`· `userCity.test.ts`(localStorage 抛异常 fallback sessionStorage) | 4h
- [ ] P2 | 引入 React Testing Library + Vitest 组件级测试 | package.json devDeps | 加 vitest + @testing-library/react;选 CityPage / SearchBox / SearchBox combobox 行为测 | 6h
- [ ] P2 | GitHub Actions 自动跑 lighthouse + typecheck + lint | `.github/workflows/ci.yml` | 加 `pull_request` 触发:`npm ci → npm run lint → npm run typecheck → npm run build → bash scripts/lighthouse-ci.sh` | 3h
- [ ] P2 | 2026-08-07 硬编码"实时"事件 | `src/data/liveMoments.ts` 各事件 + `AboutPage.tsx` | AboutPage 加一行"事件池是 v1.x 编辑精选快照,真实接入在 v2.x 规划";或干脆把 status 标签改为 "EDITORIAL CURATED" 更明确 | 0.5h

### 文档

- [ ] P2 | 无面向贡献者的快速上手指南 | `/README.md` 或 `CONTRIBUTING.md` | 写一节"本地开发 5 分钟":克隆 → npm install → npm run dev → 访问 http://localhost:5173 | 1h
- [ ] P2 | 无 CHANGELOG | `/CHANGELOG.md` | 用 `standard-version` 自动从 commit message 生成 | 1h
- [ ] P2 | 无 Runbook(事故响应) | `/RUNBOOK.md` | 写"open-meteo 5xx 时"、"Vercel 部署失败时"、"Lighthouse 跑分突降"的应急步骤 | 2h

---

## 总结

| 类别 | P0 | P1 | P2 | 总计 |
|---|---|---|---|---|
| 安全 / 可观测性 | 0 | 0 | 4 | 4 |
| a11y | 1 | 3 | 4 | 8 |
| 业务逻辑 | 1 | 1 | 1 | 3 |
| 性能 | 0 | 0 | 4 | 4 |
| 错误处理 | 0 | 1 | 1 | 2 |
| 工程化 | 0 | 4 | 6 | 10 |
| 文档 | 0 | 0 | 3 | 3 |
| **总计** | **2** | **9** | **25** | **36** |

**总估时**:P0 ~0.5 工日;P1 + P2 全清 ~4-5 工日。

**建议上线窗口**:
1. **今日**:清 P0(0.5h)。
2. **本周**:清 P1(2.5 工日)。
3. **下次 Sprint**:清 P2 高优先(再 ~3 工日),其余按优先级滚动。

---

**审查生成于**: 2026-08-18
**关联文档**: `AUDIT_REPORT.md` · `ARCHITECTURE.md`
