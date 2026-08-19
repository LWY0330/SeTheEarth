---
title: PROMPT 36 v1 · Phase 0 → Phase 1 过渡工程文档
type: engineering-transition-doc
version: v1.6.1
date: 2026-08-19
status: 🟡 Phase 1 READY TO START · 4 design gates pending
author: Codex engineering agent (Phase 1 接管)
related_docs:
  - /Users/lwy/Documents/ChatGPT/看见地球/05-项目现状/d6-global-coverage-data-architecture.md (Phase 0 交付报告)
  - /Users/lwy/Documents/ChatGPT/看见地球/05-项目现状/d6-phase-1-prep-cross-validation.md (字段级验证)
  - /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/04-路线图/global-city-coverage-system-v1.0.md (spec)
  - /Users/lwy/Documents/ChatGPT/看见地球/06-PM Agent 交接/2026-08-19-engineer-pr-plan.md (Khartoum PR 拆解)
  - /Users/lwy/Documents/ChatGPT/看见地球/06-PM Agent 交接/2026-08-19-pm-takeover-audit.md (PM 接管审计)
---

# PROMPT 36 v1 · Phase 0 → Phase 1 过渡工程文档

> **目的**:把 Phase 0 工程产出转化为 Phase 1 启动清单,标注依赖、阻塞、可立即推进项
> **读者**:Phase 1 工程师 / PM / 设计师
> **核心结论**:✅ 工程接口已就绪,⏳ 4 项设计 Gate 阻塞 Phase 1 启动

---

## 📋 一句话状态

**Phase 0 完整交付(77/77 测试,229KB bundle,零业务侵入)。Phase 1 接口/类型/逻辑层全部就绪,等待 4 项设计 Gate(Lisbon Yellow Layer / 4-screen → V2 Mapping / Context source policy / Khartoum mockup LOCKED)拍板后立即接入。**

---

## 1. Phase 0 已交付资产清单(工程侧)

| 资产 | 路径 | 行数 | 测试 | 状态 |
|---|---|---|---|---|
| City 类型 | `src/types/city.ts` | 191 | — | ✅ |
| Moment 类型 | `src/types/moment.ts` | 128 | — | ✅ |
| CityState 类型 | `src/types/cityState.ts` | 76 | — | ✅ |
| 类型 barrel | `src/types/index.ts` | 45 | — | ✅ |
| momentTime 逻辑 | `src/lib/momentTime.ts` | 139 | 23 | ✅ |
| cityState 逻辑 | `src/lib/cityState.ts` | 158 | 18 | ✅ |
| locationPrivacy 逻辑 | `src/lib/locationPrivacy.ts` | 159 | 18 | ✅ |
| ingestion 逻辑 | `src/lib/ingestion.ts` | 322 | 18 | ✅ |
| tsconfig 微调 | `tsconfig.json` | +1 | — | ✅ |
| package test script | `package.json` | +1 | — | ✅ |

**总计**:8 新文件 + 2 配置微调,**77 测试全过**,**typecheck 0 错**,**build 229KB**(与 v1.5 持平)

### 1.1 工程微调说明

- `tsconfig.json`: `allowImportingTsExtensions: false → true`(与 v1.4 PR #29 对齐)
- `package.json`: 新增 `"test": "node --test --experimental-strip-types src/lib/*.test.ts"`

**零新依赖**。

---

## 2. Phase 1 启动条件(Gate 状态)

### 2.1 设计 Gate(需 PM / 设计师拍板)

| Gate | 来源 | 状态 | 阻塞什么 |
|---|---|---|---|
| **Lisbon Yellow Layer LOCKED** | PROMPT 35 收口 | ⏳ 未拍板 | Universal CityPage 模板细节 |
| **4-screen → V2 City Model Mapping** | spec §0.3 强制要求 | ⏳ 未拍板 | CityPage 重构方向(Arrival → Context? One Scene → Context hero? Same Second → Now? Echo → ?) |
| **Context source policy** | spec §4.2 | ⏳ 未拍板 | Context 字段从哪些外部源获取(Wikipedia / GeoNames / OpenWeather / World Bank / Wikidata) |
| **Khartoum mockup LOCKED** | 外部设计师 round 8 反馈 | ⏳ 未拍板 | Khartoum cities.ts 接入 + CityPage 重构样例 |

**4 项全部为设计 / PM 决策,工程不背锅**。

### 2.2 工程 Gate(就绪状态)

| 项 | 状态 | 备注 |
|---|---|---|
| `City` / `Moment` 类型稳定 | ✅ | 已与 spec §4.1 / §5.2 字段级对齐 |
| `getMomentTimeBucket` 函数 | ✅ | NOW/TODAY/PAST + NOW_WINDOW_HOURS 可配 |
| `getCityStateLevel` / `getCityPageState` | ✅ | L0-L4 + A-E + 18 测试 |
| `canAccessRawLocation` 权限矩阵 | ✅ | 4 角色全覆盖 |
| `validateCity` 最小校验 | ✅ | Phase 3 接入前够用 |
| `normalizeCity` / `findDuplicates` / `ingestBatch` | ⏳ STUB | Phase 3 接入,接口已稳定 |
| 测试基础设施 | ✅ | `npm run test` 即可,Node 22 原生 runner |
| CI | ❌ 无 | 需后续加 `.github/workflows/test.yml` |

### 2.3 运营 Gate(就绪状态)

| 项 | 状态 | 备注 |
|---|---|---|
| Hero 图 metadata 12 字段 | ⚠️ 4/12 已填 | 8 字段待补(Khartoum 实摄影 `source_url` / `photographer` / `license` 等) |
| `cities.ts` Khartoum 接入 | ⏳ | 等 mockup LOCKED + 4 类图 URL 到位 |
| `liveMoments.ts:411-422` 旧 Khartoum 文案清理 | ⏳ | PM 拍板方案 A(删除),独立 PR |

---

## 3. Phase 1 工程师任务分解(预排)

### 3.1 无 Gate 阻塞(可立即启动)✅

| ID | 任务 | 估时 | 风险 | 优先级 |
|---|---|---|---|---|
| T1 | `validateCity` 加 `source_url` warn(非阻塞) | 0.5h | 极低 | P0 |
| T2 | `ContextSource` 接口 + `getCityContext(cityId)` stub | 1h | 极低 | P0 |
| T3 | `city.page_state` 渲染 state-machine 接口(纯数据→state,无视觉) | 1h | 低 | P0 |
| T4 | Phase 3 ingestion 架构设计 doc | 1h | 0 | P1 |
| T5 | 现有 11 城市 → 新 Universal City 字段映射 doc | 1.5h | 0 | P0 |
| T6 | 现有 Moment 数据 → 新 Moment 字段映射 doc | 1h | 0 | P0 |
| T7 | 11 城市 gap analysis(每城市缺哪些新字段) | 2h | 0 | P0 |
| T8 | 加 CI:`.github/workflows/test.yml` (typecheck + test + build) | 1h | 极低 | P1 |
| T9 | README 更新 v1.6 status section | 0.5h | 极低 | P1 |
| T10 | CHANGELOG.md 创建 + v1.6 条目 | 0.5h | 0 | P1 |
| T11 | Phase 0→1 transition doc(本文档) | 0.5h | 0 | P1 |

**累计 ~10h**。

### 3.2 有 Gate 阻塞(等拍板)

| ID | 任务 | Gate | 估时 |
|---|---|---|---|
| T12 | Khartoum 接入 `src/data/cities.ts` | Khartoum mockup LOCKED + 4 类图 URL | 2h |
| T13 | CityPage.tsx v1.4 5 段 → A2 4 屏 | 4-screen → V2 Mapping 拍板 | 4-6h |
| T14 | `liveMoments.ts:411-422` 旧 Khartoum 文案删除 | (独立 PR,非 Gate) | 0.5h |
| T15 | Context 字段运行时获取实现 | Context source policy 拍板 | 3h |
| T16 | 50 城市批量导入 | T12 完成 + Phase 3 ingestion 实现 | 8h+ |

### 3.3 远期(Phase 2+)

- Witness 上传流程(Phase 5)
- Earth Explore 地图(Phase 4)
- Search 系统(Phase 4)

---

## 4. Phase 1 启动仪式(给 Phase 1 工程师)

### 4.1 启动前必读(5 件)

1. **本文档**(phase-1-prep-transition.md)— 整体状态 + Gate
2. **spec**: `global-city-coverage-system-v1.0.md` — 设计意图权威
3. **交付报告**: `d6-global-coverage-data-architecture.md` — Phase 0 交付快照(注:字段计数有笔误,见 cross-validation)
4. **cross-validation**: `d6-phase-1-prep-cross-validation.md` — 代码 vs spec 字段级对齐
5. **PM 接管审计**: `06-PM Agent 交接/2026-08-19-pm-takeover-audit.md` — mockup LOCKED ≠ 数据层 LOCKED 的边界

### 4.2 启动时本地检查

```bash
git checkout codex/v1.6-p36-data-arch
git pull origin codex/v1.6-p36-data-arch  # 当前 sandbox 无 SSH,需手动 push + pull
npm install
npm run typecheck   # 应 0 error
npm run test        # 应 77/77 pass
npm run build       # 应 ~500ms, 229KB
```

### 4.3 启动后第一件事

读 `src/types/index.ts` 确认所有类型可访问:

```ts
import type { City, Moment, CityStateLevel, CityPageState } from '@/types';
import { getMomentTimeBucket, getCityStateLevel, getCityPageState } from '@/lib/momentTime';
// ... 等等
```

如果类型 import 报错,说明 tsconfig path alias 没生效,先修这个。

---

## 5. 风险登记(Phase 1 上线前必须解决)

### 5.1 高风险(必须解决)

| 风险 | 影响 | 缓解 |
|---|---|---|
| CI 缺失 | 上线前无法自动化验证 typecheck/test/build | T8 加 GitHub Actions |
| Hero metadata 8/12 字段缺失 | Khartoum 上线时 license/credit 无法显示 | PM 催用户给 source / photographer |
| Khartoum cities.ts 未接入 | `/cities/khartoum` 404 | T12 启动 |
| liveMoments.ts:411-422 旧文案 | 与 §2.8.8 Red Layer Image Ethics 冲突 | T14 启动 |
| README 是 M0 版 | 误导新工程师 | T9 更新 |

### 5.2 中风险(应解决)

| 风险 | 影响 | 缓解 |
|---|---|---|
| Phase 0 报告字段笔误 | 误导读者 | PM 修改报告或加 disclaimer |
| `media` 和 `media_type` 字段冗余 | 数据建模有歧义 | spec §5.2 应明确 / Phase 1 PR 加注 |
| spec `author_id / witness_id` 语义模糊 | 字段定义歧义 | PM + 设计师拍板 |

### 5.3 低风险(可选)

| 风险 | 影响 | 缓解 |
|---|---|---|
| 沙箱无 SSH,无法自动 push | 工程师手动 push | 文档化 |
| 沙箱无 `gh` CLI | PR 创建需手动 | 文档化 |

---

## 6. Phase 1 交付契约(给 PM 的验收清单)

Phase 1 工程师完成下列项后,PM 可验收:

- [ ] `cities.ts` Khartoum 接入,4 类图 URL 填齐(或 visual_status: 'placeholder')
- [ ] CityPage v2 4 屏渲染(对齐 mockup LOCKED 后的设计)
- [ ] `liveMoments.ts:411-422` 旧文案清理(方案 A)
- [ ] `city.page_state` 渲染状态机在 CityPage 中正确分支(A → B/C/D/E 不同视觉)
- [ ] `npm run test` 通过 + Phase 0 77 测试不退化
- [ ] `npm run typecheck` 0 错
- [ ] `npm run build` 通过,bundle size 与 v1.5 持平(229KB)
- [ ] Lighthouse 不退化(参考 v1.5 ≥ 90)
- [ ] Khartoum 路径(`/cities/khartoum`)1440 / 1680 / 1920 三断点视觉与 mockup 95% 一致
- [ ] Hero 12 字段 metadata 全部填齐(Khartoum)
- [ ] Context 字段运行时从至少 1 个外部源获取(待 source policy 拍板)

---

## 7. 与历史版本的关系

| 版本 | 状态 | 关系 |
|---|---|---|
| v1.4 | merged | 5 段 CityPage + 11 城市 + PR #29 syncMoment |
| v1.5 | merged | Lighthouse + a11y + PWA + hotkeys |
| **v1.6 Phase 0** | ✅ delivered | **类型/逻辑层,不动业务文件** |
| v1.6 Phase 1 | ⏳ pending | 业务接入(等 Gate) |

**Phase 0 是 v1.5 → v1.6 的架构桥,不替代任何已交付业务**。

---

## 8. 给用户的下一步建议

### 8.1 立刻可做(无 Gate)

- 工程:本过渡文档列表的 §3.1(10h 工作量,纯本地,零风险)
- 运营:催 Hero metadata 8 字段
- 文档:催 PM 修正交付报告笔误

### 8.2 等 Gate 才能做

- Lisbon Yellow Layer LOCKED → 启动 CityPage v2 设计
- 4-screen → V2 Mapping 拍板 → 启动 CityPage.tsx 重构
- Context source policy 拍板 → 启动 Context 运行时获取
- Khartoum mockup LOCKED → 启动 cities.ts Khartoum 接入

### 8.3 建议决策优先级

1. **先拍板 4-screen → V2 Mapping**(因为 CityPage 重构是最大块,延迟成本高)
2. **再拍板 Khartoum mockup**(因为 Khartoum 是 cities.ts 首个非 11 城接入的验证点)
3. **Context source policy**(可以延后,Phase 1 stub + Phase 2 接源)
4. **Lisbon Yellow Layer**(设计驱动,可以与 Khartoum 并行)

---

**最后更新**:2026-08-19(Phase 1 接管)
**下次更新**:Phase 1 Gate 触发后立即补 Phase 1 启动报告
**反馈**:任何质疑 / 补充直接修订本文件,version 号追加到 status 字段