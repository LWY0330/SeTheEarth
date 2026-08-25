---
title: SEE EARTH V1 · Alpha / Beta 状态矩阵 · 6 对象 + 环境状态
type: state-matrix
tags: [release-v1, design, d-p0-03, state-matrix, alpha-beta, maintenance, see-earth]
task_id: D-P0-03
brief_anchor: §4 D-P0-03
track: design
owner: 外部 Designer Owner（您）
created: 2026-08-24
status: IN REVIEW
target_gate: Gate A · Internal Alpha / Gate B · Closed Beta
source_brief: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/SEE-EARTH-Release-Strategy-v1-Design-Engineering-Task-Brief.md
source_task_card: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/06-PM Agent 交接/2026-08-22-task-card-d-p0-03-alpha-beta-states.md
related_docs:
  - ./alpha-banner-v1.md
  - ./beta-banner-v1.md
  - ./feedback-entry-v1.md
  - ./env-control-v1.md
  - ./component-contract-v1.md
depends_on: [D-P0-01 ✓ ACCEPTED, D-P0-04 ✓ IN REVIEW]
blocks: [E-P0-08 · Web Alpha Environment]
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/07-设计师设计参考/release-v1/alpha-beta-states/state-matrix-v1.md
---

# SEE EARTH V1 · Alpha / Beta 状态矩阵（6 对象 + 环境状态）

> **用途**：把 Alpha / Beta / Maintenance / Content Pending / Unsupported 等"环境 / 产品级"状态覆盖到 6 个核心对象，避免内部测试版本和真实发布混淆。
> **本文不是**：5 类系统状态（Loading / Error / Empty / Permission / Privacy）的视觉实现，那是 D-P0-04 的范围。
> **DO NOT**：不引入新视觉方向 / 不修改 A2 tokens / 不修改 14 LOCKED 组件 props。

---

## 0. 阅读指南

- **对象**：6 个核心 UI 对象（Daily 12 / Moment / City / Unknown / Witness / Echo）。
- **环境状态（Alpha / Beta / Maintenance）**：跨对象生效，由 `VITE_ENV` 控制（详见 `env-control-v1.md`）。
- **产品状态（Content Pending / Unsupported / 占位）**：由后端 / 数据决定，不依赖环境变量。
- **状态触发**：见每对象最后一列（`data-state` 属性 / 组件 prop）。

---

## 1. 环境状态总览（跨对象）

| 环境状态 | 触发条件 | 视觉标识 | 反馈入口 | URL 例子 | 文档 |
|---|---|---|---|---|---|
| **Alpha** | `VITE_ENV === 'alpha'` | 暖色顶部 Banner · `--earth-blue-mist` 背景 | "反馈问题" 按钮 | `sethearth-git-alpha-seethearth.vercel.app` | `alpha-banner-v1.md` |
| **Beta** | `VITE_ENV === 'beta'` | 冷色顶部 Banner · `--earth-blue-subtle` 背景 | "反馈问题" 按钮 | `sethearth-beta-xxx.vercel.app`（未来） | `beta-banner-v1.md` |
| **Maintenance** | 后端主动推送 `maintenance_mode = true`（via `VITE_MAINTENANCE` 或运行时 API） | 内容区中央 Notice · 白底 · muted 文字 | "反馈问题" 按钮（可选） | 任何环境 · 临时 | 本文件 §7 |
| **Production（默认）** | `VITE_ENV === 'production'` 或 `VITE_ENV` 缺失 | **无 Banner** · 干净发布 | 不显示 | `see-earth.vercel.app`（未来） | `env-control-v1.md` |

> ⚠️ **强制约束**：Alpha / Beta 必须有 Banner（任务卡 § DO NOT）。生产无 Banner 是默认行为。

---

## 2. Daily 12 状态矩阵

| # | 状态 | 触发条件 | 视觉 | 文案（中/英） | 行为 | 备注 |
|---|---|---|---|---|---|---|
| 1 | **首次加载** | edition API 首次 200 之前 | Daily 12 12 个槽位全部 Skeleton（per D-P0-04 §2 Loading） | — | 用户等待 · 不闪烁 | D-P0-04 范围 |
| 2 | **刷新** | edition API 已就绪 + 用户主动 refresh | Skeleton 闪现 → 真实数据 fade-in（`--motion-base` 220ms） | — | 进度条或顶部细线 | D-P0-04 范围 |
| 3 | **部分缺失** | edition API 200 但 `slots[]` 长度 < 12 | 已就绪槽位真实数据 · 缺失槽位 "Coming Soon" 占位卡（白底 + 浅虚线框） | "即将上线" / "Coming soon" | 用户可滚动查看已就绪 | 占位卡不喧宾夺主 |
| 4 | **整版不可用** | edition API 5xx / network error | 顶部中央 Error Notice · 12 槽位全部占位 | "Daily 12 暂不可用，请稍后再试" / "Daily 12 unavailable, please retry" | "重试"按钮 → 重新拉取 | D-P0-04 范围 |
| 5 | **旧版回退** | edition API 返回 `fallback = true`（E-P0-06 实现） | Daily 12 顶部加 1px muted 边 · 文案标识 | "今日内容稍后更新 · 显示昨日切片" / "Today's edition pending · showing yesterday" | 用户可继续浏览昨日 | D-P0-04 §3 范围 |
| 6 | **🔶 Alpha 状态** | `VITE_ENV === 'alpha'` | 顶部 Alpha Banner（暖色） + Daily 12 顶部加 1px Earth Blue Mist 边 · 文案标识 | "测试环境 · 数据可能重置" / "Alpha · Data may reset" | Banner 不挡内容 | 详见 `alpha-banner-v1.md` |
| 7 | **🔵 Beta 状态** | `VITE_ENV === 'beta'` | 顶部 Beta Banner（冷色）+ Daily 12 顶部加 1px Earth Blue Subtle 边 · 文案标识 | "测试环境 · 邀请制" / "Beta · Invitation only" | Banner 不挡内容 | 详见 `beta-banner-v1.md` |
| 8 | **🟡 Maintenance 状态** | `maintenance_mode = true`（仅 Daily 12 维度） | 内容区中央 Notice · Daily 12 整版不可见 | "Daily 12 暂时维护中，预计 [HH:MM] 恢复" / "Daily 12 under maintenance, expected back at HH:MM" | Banner 上加反馈入口 | 见本文件 §7 |

**数据属性**：

```html
<section data-state="loading|refresh|partial|error|fallback|alpha|beta|maintenance">
  ...
</section>
```

---

## 3. Moment 状态矩阵

| # | 状态 | 触发条件 | 视觉 | 文案（中/英） | 行为 | 备注 |
|---|---|---|---|---|---|---|
| 1 | **图片加载失败** | `<img>` onError | 占位块（白底 + 1px hairline + 中心 muted 文字 + "图片不可用"） | "图片暂不可用" / "Image unavailable" | 用户可继续浏览其他 Moment | D-P0-04 §5 |
| 2 | **内容撤下** | Moment 状态 = `withdrawn`（API 返回） | 占位块 + 中央 muted icon · 文字解释 | "此 Moment 已撤下" / "This Moment has been withdrawn" | 用户不可交互 | D-P0-04 §5 |
| 3 | **来源待核验** | Moment `source_type` = `unverified`（editorial 标识） | Moment 卡片右上角小 chip · Earth Blue Mist 底色 · 0 大圆角 · 1px border | "来源待核验" / "Source pending review" | 用户可点击查看说明 modal | D-P0-04 §5 |
| 4 | **城市未知** | Moment `city_id` 为空 / 不在收录列表 | Moment 占位块 + muted 文字 | "城市信息暂缺" / "City info unavailable" | 不可进入 City Detail | D-P0-04 §5 |
| 5 | **🔶 占位（Alpha 期）** | `VITE_ENV === 'alpha'` + Moment 数据缺失 | 占位块 + 中心 muted 文字 | "(待补 · 占位)" / "(Pending · placeholder)" | 不可交互 | 区别于真实图片加载失败 |

**数据属性**：

```html
<article data-state="image-failed|withdrawn|source-unverified|city-unknown|placeholder">
  ...
</article>
```

---

## 4. City 状态矩阵

| # | 状态 | 触发条件 | 视觉 | 文案（中/英） | 行为 | 备注 |
|---|---|---|---|---|---|---|
| 1 | **无 Moment** | `city.moments.length === 0` | City Detail One Scene 屏显示空状态 · 中心文字 | "这座城市暂无 Moment" / "No Moments yet for this city" | "去 Daily 12" 链接 CTA | D-P0-04 §6 |
| 2 | **仅基础资料** | `city.data_state = 'minimal'` | City Detail 屏 · One Scene 用占位图 · 城市基础信息正常 | "资料加载中 · 敬请期待" / "Loading more · Stay tuned" | 可浏览基础信息 | D-P0-04 §6 |
| 3 | **时区失败** | timezone API 5xx / fallback | City Detail 顶部时区显示 "—" · muted 文字 | "时区暂不可用" / "Timezone unavailable" | 不影响城市浏览 | D-P0-04 §6 |
| 4 | **天气失败** | weather API 5xx / fallback | City Detail One Scene 天气不显示 · 文字 "—" | "天气暂不可用" / "Weather unavailable" | 不影响城市浏览 | D-P0-04 §6 |
| 5 | **❌ Unsupported 状态** | city 不在 `SUPPORTED_CITIES` 列表 / URL slug 不匹配 | 404 页面 · 白底 · 大字号 · 0 大圆角 · 推荐其他城市 | "该城市尚未在 SEE EARTH 收录范围内" / "This city is not yet covered by SEE EARTH" | "看看已收录城市" CTA | 见本文件 §8 |

**数据属性**：

```html
<article data-state="empty-moments|minimal|timezone-failed|weather-failed|unsupported">
  ...
</article>
```

---

## 5. Unknown 状态矩阵

| # | 状态 | 触发条件 | 视觉 | 文案（中/英） | 行为 | 备注 |
|---|---|---|---|---|---|---|
| 1 | **无可用题目** | Unknown API 返回 0 条 / 5xx | Unknown 屏显示空状态 · 中央 muted | "今日 Unknown 暂未上线" / "No Unknown moments today" | "回到 Today" CTA | D-P0-04 §7 |
| 2 | **Reveal 失败** | Reveal API 5xx / network | Reveal 屏显示 retry 状态 · Earth Blue 提示 | "无法揭示位置，请稍后再试" / "Cannot reveal yet, please retry" | "重试" 按钮 | D-P0-04 §7 |
| 3 | **内容已下线** | Unknown `state = withdrawn` | Reveal 屏占位 · 文字解释 | "此坐标已撤下" / "This coordinate has been withdrawn" | 用户无法 Reveal | D-P0-04 §7 |

**数据属性**：

```html
<section data-state="empty|reveal-failed|withdrawn">
  ...
</section>
```

---

## 6. Witness 状态矩阵

| # | 状态 | 触发条件 | 视觉 | 文案（中/英） | 行为 | 备注 |
|---|---|---|---|---|---|---|
| 1 | **权限** | 相机 / 相册 / 位置 权限状态 | 权限说明屏 · Earth Blue 强调 · 隐私文案 | "需要 [相机/相册/位置] 权限" / "Permission required for [camera/photos/location]" | "允许" / "稍后" CTA · 不惩罚拒绝 | D-P0-02 范围 |
| 2 | **上传** | 提交中 / 后台上传 | 进度条 · Earth Blue · 百分比 | "上传中 · X%" / "Uploading · X%" | 用户可最小化 | D-P0-02 范围 |
| 3 | **校验** | 服务端校验中 | 屏中央 Earth Blue 弱 spin | "校验中" / "Validating" | 用户等待 | D-P0-02 范围 |
| 4 | **审核** | submission = `under_review` | 屏中央文字 · Earth Blue check icon | "已提交，待审核" / "Submitted, under review" | 用户可退出 | D-P0-02 范围 |
| 5 | **失败重试** | submission 失败 | 屏中央 muted error + retry 按钮 | "提交失败，请重试" / "Submit failed, please retry" | "重试" / "取消" CTA | D-P0-02 范围 |
| 6 | **🔶 Alpha 期 "暂不开放"** | `VITE_ENV === 'alpha'` + Witness 功能未就绪 | Witness 入口显示 muted 占位 · 文字 + icon | "Witness 功能暂未开放（Alpha 期）" / "Witness not available in Alpha" | 入口 disabled · 不诱导点击 | 关键：避免假成功 |

**数据属性**：

```html
<section data-state="permission|uploading|validating|reviewing|retry|alpha-unavailable">
  ...
</section>
```

---

## 7. Echo 状态矩阵

| # | 状态 | 触发条件 | 视觉 | 文案（中/英） | 行为 | 备注 |
|---|---|---|---|---|---|---|
| 1 | **Default** | Echo 屏初始态 | 输入框 placeholder · Earth Blue focus ring | "这座城市,你留下了什么?" / "What did you leave in this city?" | 可输入 | D-P0-02 范围 |
| 2 | **Focus** | 输入框聚焦 | Earth Blue 2px focus ring · 输入光标可见 | — | 可输入 | — |
| 3 | **Typing** | 输入字符数 > 0 | 字符计数 · Earth Blue · 0-80 限制 | "X / 80" / "X / 80" | 可继续输入 | D-P0-02 范围 |
| 4 | **Disabled** | Echo 屏在 Alpha 期 / 后端未就绪 | 输入框 muted · placeholder 显示 "暂不开放" | "Echo 暂不开放（Alpha 期）" / "Echo not available in Alpha" | 输入框 disabled · 不诱导提交 | 关键：避免假成功 |
| 5 | **Submitting** | 用户点击提交 | 提交按钮 Earth Blue 弱 spin · 不可重复点击 | "提交中" / "Submitting" | 用户等待 | — |
| 6 | **Success** | 服务端确认 | Layer Red check icon（per D-P0-02 §2.4.6）· **不弹 Toast** | "已记录" / "Recorded" | 屏保持 · 不打扰 | D-P0-02 范围 |
| 7 | **Error** | 提交失败 | 文字 muted error · retry 按钮 | "提交失败，请重试" / "Submit failed, please retry" | "重试" CTA | — |
| 8 | **🔶 Alpha 期 "暂不开放"** | `VITE_ENV === 'alpha'` + Echo 后端未就绪 | Echo 屏 disabled · 顶部 Banner 提示 | "Echo 功能暂未开放（Alpha 期）" / "Echo not available in Alpha" | 屏全部 disabled · 不诱导提交 | 同 Witness · 关键 |

**数据属性**：

```html
<section data-state="default|focus|typing|disabled|submitting|success|error|alpha-unavailable">
  ...
</section>
```

---

## 8. 特殊状态视觉规范

### 8.1 Maintenance Notice（中央内容区）

| 属性 | 值 |
|---|---|
| 位置 | 内容区中央 · 上下居中 · 左右居中 · 非顶部 |
| 高度 | auto · 单屏 50% |
| 背景 | `--bg-page`（冷白） |
| 边框 | 无 |
| 圆角 | `0`（0 大圆角） |
| 阴影 | `none` |
| 字号（主） | 28px（`--fs-h3`）· text-primary |
| 字号（副） | 14px（`--fs-body-s`）· text-secondary |
| 文案 | 主："暂时维护中，预计 [HH:MM] 恢复" · 副："Service under maintenance, expected back at HH:MM" |
| CTA | 可选 "反馈问题" 按钮 → 打开 FeedbackModal |
| 响应式 | Mobile：上下内边距 80px · 文字居中 |

**HTML 伪代码**：

```html
<section class="maintenance-notice" data-state="maintenance" role="status" aria-live="polite">
  <div class="notice-inner">
    <h2 class="notice-title">暂时维护中，预计 14:30 恢复</h2>
    <p class="notice-subtitle">Service under maintenance, expected back at 14:30</p>
    <button class="feedback-trigger" type="button" onclick="openFeedbackModal()">
      反馈问题
    </button>
  </div>
</section>
```

### 8.2 Content Pending（城市 / 板块占位）

| 属性 | 值 |
|---|---|
| 位置 | 城市 / 板块占位处 |
| 背景 | `--bg-page`（冷白） |
| 边框 | `1px dashed var(--border-hairline)`（浅虚线框） |
| 圆角 | `0` |
| 阴影 | `none` |
| 字号 | 18px（`--fs-body-l`）· text-tertiary |
| 文案 | 主："该城市即将上线,敬请期待" · 副："This city is coming soon" |
| 响应式 | Mobile：宽度 100% · 内边距 32px |

### 8.3 Unsupported City（404 页面）

| 属性 | 值 |
|---|---|
| 位置 | 路由 `/cities/:slug` slug 不匹配 |
| 背景 | `--bg-page`（冷白） |
| 边框 | 无 |
| 圆角 | `0` |
| 阴影 | `none` |
| 字号（主） | 64px（`--fs-display-m`）· text-primary · Display 字体 |
| 字号（副） | 18px（`--fs-body-l`）· text-secondary |
| 文案 | 主："该城市尚未在 SEE EARTH 收录范围内" · 副："This city is not yet covered by SEE EARTH" |
| CTA | "看看已收录城市" / "Browse covered cities" → 链接 `/cities` |
| 推荐 | 列出 3-6 个热门城市卡片（复用 `CityCard` 组件 · LOCKED） |
| 响应式 | Mobile：字号降到 40px（`--fs-display-xs`）· 推荐城市卡片 1 列 |

**HTML 伪代码**：

```html
<main class="unsupported-city" data-state="unsupported">
  <div class="unsupported-inner">
    <p class="unsupported-meta">404 · CITY NOT COVERED</p>
    <h1 class="unsupported-title">该城市尚未在 SEE EARTH 收录范围内</h1>
    <p class="unsupported-subtitle">This city is not yet covered by SEE EARTH</p>
    <a class="unsupported-cta" href="/cities">看看已收录城市 / Browse covered cities</a>
    <section class="unsupported-recommend">
      <h2 class="recommend-title">也许你想看看这些城市</h2>
      <ul class="recommend-list">
        <li><CityCard city={kyoto} /></li>
        <li><CityCard city={lisbon} /></li>
        <li><CityCard city={reykjavik} /></li>
      </ul>
    </section>
  </div>
</main>
```

---

## 9. 状态矩阵摘要表（PM 验收用）

| 对象 | Alpha 状态 | Beta 状态 | Maintenance 状态 | 其他产品状态 |
|---|---|---|---|---|
| **Daily 12** | 暖色 Banner + Daily 12 顶部 1px Earth Blue Mist 边 + "测试环境 · 数据可能重置" | 冷色 Banner + 1px Earth Blue Subtle 边 + "测试环境 · 邀请制" | 中央 Maintenance Notice + ETA + 反馈入口 | 加载 / 刷新 / 部分缺失 / 整版不可用 / 旧版回退 |
| **Moment** | 占位块 "(待补 · 占位)" | 占位块 "(待补 · Beta 预览)" | 单 Moment 显示 muted "(暂不可用)" | 图片失败 / 撤下 / 来源待核验 / 城市未知 |
| **City** | Unsupported 状态 + 推荐已收录城市 | 同 Alpha · 略弱化标识 | Central Maintenance Notice | 无 Moment / 仅基础 / 时区失败 / 天气失败 |
| **Unknown** | 入口 muted "(Alpha 期暂未上线)" | 入口 muted "(Beta 期暂未上线)" | Central Maintenance Notice | 无题目 / Reveal 失败 / 已下线 |
| **Witness** | 入口 disabled + Banner 提示 "暂不开放" | 入口正常（若后端就绪） | Central Maintenance Notice | 权限 / 上传 / 校验 / 审核 / 失败重试 |
| **Echo** | 输入框 disabled + "暂不开放" | 输入框 enabled（若后端就绪） | Central Maintenance Notice | Default / Focus / Typing / Submitting / Success / Error |

---

## 10. 关键约束（设计师自检）

- [x] 6 对象全部覆盖 Alpha / Beta / Maintenance 状态
- [x] 不引入新视觉方向（仅复用 A2 tokens + 既有 Layer 色）
- [x] 不修改 14 LOCKED 组件 props（仅消费其 `data-state` 属性 + `disabled` 行为）
- [x] 不修改 A2 tokens（Banner / Notice / 404 全部用 `var(--earth-blue-mist/subtle)` 等已有 token）
- [x] 不引入新依赖（无 Tally.so / 无新 Modal 库 · 仅复用现有 Modal 模式）
- [x] Maintenance 不阻挡内容（中央 Notice 而非全屏覆盖）

---

## 11. 给后续任务的接口

### 11.1 给 E-P0-08（Web Alpha Environment）

- ✅ `VITE_ENV` 行为已规范（详见 `env-control-v1.md`）
- ✅ Alpha Banner + Feedback 入口已设计
- ⚠️ 后端 `maintenance_mode` API 由 E-P0-10 决定 · 本文件仅定义前端展示

### 11.2 给 E-P0-06（Daily 12 Supply Chain）

- ✅ Daily 12 各状态（加载 / 刷新 / 部分缺失 / 整版不可用 / 旧版回退）已覆盖
- ✅ `fallback` 标识（"显示昨日切片"）已规范
- ⚠️ `data-state` 属性需由 E-P0-06 API 响应字段映射

### 11.3 给 D-P0-04（关键系统状态 · 并行子代理）

- ✅ 本文专注 Alpha / Beta / Maintenance / Content Pending / Unsupported
- ⚠️ Loading / Error / Empty / Permission / Privacy 视觉由 D-P0-04 出稿
- ⚠️ D-P0-04 的 Loading 骨架屏样式可直接被本文件的 "首次加载 / 刷新" 引用

### 11.4 给 E-P0-07（Analytics Instrumentation）

- ✅ 新事件建议：`alpha_feedback_submitted` / `beta_feedback_submitted` / `maintenance_notice_seen`
- ⚠️ 由 E-P0-07 决定事件 schema（snake_case · 无 PII）

---

## 12. 残留 TODO / 已知偏差

1. **Maintenance ETA 时间格式**：本文示例 "HH:MM" 是简略格式。实际可能为 "预计 2 小时后恢复" / "预计 14:30 恢复"。由 E-P0-10 后端推送格式决定。
2. **Unsupported City 推荐城市**：本文示例为 Kyoto / Lisbon / Reykjavik。实际由 E-P0-09 推荐 API 决定。
3. **Maintenance 反馈入口可选**：本文标注"可选"。建议 Alpha 期开启（用户可反馈），Beta 期保持，Production 关闭（无 Banner 也无入口）。
4. **Witness / Echo "暂不开放" 在 Beta 期**：本文规定 Beta 期 Witness / Echo 后端若就绪则正常开启。若未就绪，仍显示 muted。Beta 期由 E-P0-08 决定。
5. **三档响应式细节**：本文仅给出核心规则，Mobile 字号具体值见 `responsive-rules-v1.md`（Phase 1 实施范围）。

---

**End of state-matrix-v1.md · D-P0-03 子任务 1/6 · 6 对象状态矩阵**
