---
title: SEE EARTH V1 · Analytics Trigger Diagram · 触发时机图
type: analytics-trigger-diagram
tags: [release-v1, design, d-p0-05, analytics, events, trigger, mermaid, see-earth]
task_id: D-P0-05
brief_anchor: §4 D-P0-05
track: design
owner: 外部 Designer Owner（您）
created: 2026-08-22
status: IN REVIEW
target_gate: Gate A · Internal Alpha
source_brief: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/SEE-EARTH-Release-Strategy-v1-Design-Engineering-Task-Brief.md
related_docs:
  - ./event-map-v1.md
  - ./forbidden-fields-v1.md
  - ./consent-placement-v1.md
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/07-设计师设计参考/release-v1/analytics-events/trigger-diagram-v1.md
note: 本文件已就绪，需 PM Agent 由 Obsidian 写入权限落地到 canonical 路径。
---

# SEE EARTH V1 · Analytics Trigger Diagram（触发时机图）

> **目的**：把 14 个 P0 事件按"组件 → 状态 → 触发器 → 事件"四级链条全部画清。任何事件都必须由 UI 状态变化或服务端结果触发；**禁止定时器触发"成功"事件**。
> **图例**：`[页面]` = 路由级页面；`{组件}` = React/Vue 组件；`(状态)` = 组件内部 state；`→event` = 发出事件；`S2S` = Server-to-Server，服务端已记录；`C2S` = Client-to-Server，前端发送给埋点后端。

---

## 1. 总览：四级触发链（mermaid）

```mermaid
flowchart LR
    classDef page fill:#f4e3c2,stroke:#8b6f3a,color:#3a2c12
    classDef comp fill:#dceafc,stroke:#2f5a91,color:#112a4a
    classDef state fill:#e8f4dc,stroke:#4a7a3a,color:#1f3a14
    classDef ev fill:#fde2e2,stroke:#a13a3a,color:#4a1414

    subgraph P1 [Daily 12 入口]
      P_Home[Homepage / Today]:::page
      C_Grid{Daily12Grid}:::comp
      S_Ready1(state = ready):::state
      P_Home --> C_Grid --> S_Ready1
      S_Ready1 -->|视口进入 + API 200| EV_ED[edition_viewed]:::ev
    end

    subgraph P2 [Daily 12 卡片]
      C_Card{Daily12Card}:::comp
      S_Vis(state ≥ 50% in view ≥ 500ms):::state
      C_Grid --> C_Card --> S_Vis
      S_Vis --> EV_MI[moment_impression]:::ev
    end

    subgraph P3 [Moment Detail]
      P_MD[Moment Detail]:::page
      C_MD{MomentDetailScreen}:::comp
      S_MDr(state = ready):::state
      P_MD --> C_MD --> S_MDr
      S_MDr --> EV_MO[moment_opened]:::ev
    end

    subgraph P4 [City Detail]
      P_CD[City Detail]:::page
      C_CD{CityPageShell}:::comp
      S_CDr(state = ready):::state
      P_CD --> C_CD --> S_CDr
      S_CDr --> EV_CO[city_opened]:::ev

      C_Sec{CitySectionPanel}:::comp
      S_SVis(≥ 60% in view ≥ 800ms):::state
      C_CD --> C_Sec --> S_SVis
      S_SVis --> EV_CSV[city_section_viewed]:::ev
    end

    subgraph P5 [Unknown]
      P_UK[Unknown Clues]:::page
      C_UK{UnknownCluesBoard}:::comp
      S_UKr(state = ready):::state
      P_UK --> C_UK --> S_UKr
      S_UKr --> EV_USt[unknown_started]:::ev

      P_UR[Unknown Reveal]:::page
      C_UR{UnknownRevealScreen}:::comp
      S_URv(state = server_confirmed):::state
      P_UR --> C_UR --> S_URv
      S_URv --> EV_URv[unknown_revealed]:::ev
    end

    subgraph P6 [Echo]
      C_EC{EchoComposer}:::comp
      S_ECf(state = focused + input ≥ 1 char):::state
      C_CD --> C_EC --> S_ECf
      S_ECf --> EV_ES[echo_started]:::ev
      S_EC_OK(state = server_confirmed):::state
      S_EC_OK --> EV_EU[echo_submitted]:::ev
    end

    subgraph P7 [Witness]
      P_WS[Witness Intro]:::page
      C_WI{WitnessIntroStep}:::comp
      S_WI(state = user_continue_clicked):::state
      P_WS --> C_WI --> S_WI
      S_WI --> EV_WSt[witness_started]:::ev

      S_WP(state = permission_resolved):::state
      S_WP --> EV_WPR[witness_permission_result]:::ev

      C_WU{WitnessUploadStep}:::comp
      S_WUS(state = submitting):::state
      C_WU --> S_WUS
      S_WUS --> EV_WUS[witness_upload_started]:::ev

      S_WOK(state = server_confirmed):::state
      S_WOK --> EV_WSM[witness_submitted]:::ev
      S_WF(state = failed):::state
      S_WF --> EV_WSF[witness_submit_failed]:::ev
    end

    EV_MO -. entry_point=daily12 .-> C_CD
    EV_URv -. entry_point=unknown_reveal .-> C_CD
    EV_ED --> EV_MI
    EV_MI --> EV_MO
    EV_MO --> EV_CO
```

> **关键约束**：所有 `→event` 边均源自 UI state 变化或服务端 confirmation；任何从 `(state = server_confirmed)` 触发的事件都依赖服务端先返回 success。

---

## 2. 触发矩阵（页面 × 事件 × 触发器）

| 事件 | 页面 | 组件 | 触发 state | 触发器 | 服务端确认 | 防重复键 |
|---|---|---|---|---|---|---|
| `edition_viewed` | Homepage / Today | `<Daily12Grid>` | `state = ready` | IntersectionObserver + edition API 200 | 否 | `edition_id` + `app_surface` |
| `moment_impression` | Homepage / Today | `<Daily12Card>` | `state = ready` | IntersectionObserver（≥ 50% + ≥ 500 ms） | 否 | `moment_id` + `edition_id` |
| `moment_opened` | Moment Detail | `<MomentDetailScreen>` | `state = ready` | 路由切换 + 主图 200 | 否 | `moment_id` + `entry_point` |
| `city_opened` | City Detail | `<CityPageShell>` | `state = ready` | URL 切换 + city API 200 | 否 | `city_id` + `entry_point` |
| `city_section_viewed` | City Detail | `<CitySectionPanel>` | `state = ready` | IntersectionObserver（≥ 60% + ≥ 800 ms） | 否 | `city_id` + `section` |
| `unknown_started` | Unknown Clues | `<UnknownCluesBoard>` | `state = ready` | 主页就绪 + 第 1 个 clue API 200 | 否 | `unknown_id` |
| `unknown_revealed` | Unknown Reveal | `<UnknownRevealScreen>` | `state = server_confirmed` | 服务端 `reveal_token` 校验通过 + Reveal 页就绪 | **是** | `unknown_id` |
| `echo_started` | City Detail / Echo | `<EchoComposer>` | `state = focused + input ≥ 1 char` | 用户首次键入非空字符（input 事件） | 否 | `city_id` |
| `echo_submitted` | City Detail / Echo | `<EchoComposer>` | `state = server_confirmed` | Echo submit API 返回 `200` + `submission_id` 已落库 | **是** | 服务端 confirmation 1:1 |
| `witness_started` | Witness Intro | `<WitnessIntroStep>` | `state = user_continue_clicked` | 用户点击第一个 `Continue` 按钮 | 否 | session_id |
| `witness_permission_result` | Witness 任一步骤 | `<WitnessStep>` 状态机 | `state = permission_resolved` | 系统权限回调（granted / denied / restricted / not_determined） | 否 | `permission_type` + session |
| `witness_upload_started` | Witness Upload | `<WitnessUploadStep>` | `state = submitting` | Submit 点击 + 校验通过 + `fetch` 发起 | 否 | session 内 Submit 次数 |
| `witness_submitted` | Witness Result | `<WitnessResultStep>` | `state = server_confirmed` | 服务端 `submission_id` 已返回 + 状态 `submitted` / `under_review` | **是** | `submission_id` |
| `witness_submit_failed` | Witness Result | `<WitnessResultStep>` | `state = failed` | 上传 / 提交错误 + 前端判定不可重试 / 重试耗尽 | 否（双源：前端 + 错误码） | `submission_id`（若有） |

---

## 3. 状态机：Minimal Witness Flow（精细化）

```mermaid
stateDiagram-v2
    [*] --> Idle : 进入 Witness Intro
    Idle --> Started : 点击第一个 Continue\n→ witness_started
    Started --> PermCamera : 请求相机权限
    Started --> PermPhoto : 请求相册权限
    Started --> PermLocation : 请求位置权限
    PermCamera --> PermResolved : 系统回调\n→ witness_permission_result (camera)
    PermPhoto --> PermResolved : 系统回调\n→ witness_permission_result (photo_library)
    PermLocation --> PermResolved : 系统回调\n→ witness_permission_result (location)
    PermResolved --> ContentPicking : 进入选图 / 拍摄
    ContentPicking --> CapturedAtConfirm : 用户确认 captured_at
    CapturedAtConfirm --> LocationConfirm : 城市 / 位置确认
    LocationConfirm --> DescriptionEntry : 输入短描述（可选）
    DescriptionEntry --> Submitting : 点击 Submit\n+ 校验通过
    Submitting --> Uploading : 上传请求 fetch 发起\n→ witness_upload_started
    Uploading --> ServerConfirmed : 服务端 200 + submission_id\n→ witness_submitted
    Uploading --> Failed : 服务端错误 / 超时 / 不可重试\n→ witness_submit_failed
    ServerConfirmed --> [*] : 显示成功 / 待审核 Banner
    Failed --> ContentPicking : retryable = true\n回到选图
    Failed --> [*] : retryable = false\n显示错误终止页
```

---

## 4. 状态机：Unknown Coordinate（精细化）

```mermaid
stateDiagram-v2
    [*] --> Idle : 用户进入 Unknown
    Idle --> Started : 主页就绪\n→ unknown_started
    Started --> ClueBrowsing : 浏览线索
    ClueBrowsing --> ClueInteracted : 用户操作线索\n（不触发事件）
    ClueInteracted --> ClueBrowsing : 继续浏览
    ClueInteracted --> RevealRequested : 点击 Reveal
    RevealRequested --> ServerValidated : 服务端 reveal_token 校验
    ServerValidated --> Revealed : Reveal 页就绪\n→ unknown_revealed
    Revealed --> CityOpened : 自动跳转 / 点击进入城市\n→ city_opened (entry_point = unknown_reveal)
    Revealed --> [*] : 用户离开
```

---

## 5. 状态机：Echo（City Detail Echo 章节）

```mermaid
stateDiagram-v2
    [*] --> Idle : Echo 章节可见
    Idle --> Started : 用户键入 ≥ 1 非空字符\n→ echo_started
    Started --> Editing : 用户继续编辑
    Editing --> Submitting : 点击 Submit
    Submitting --> ServerConfirmed : Echo submit API 200 + 落库\n→ echo_submitted
    Submitting --> Failed : Echo submit API 错误 / 限流\n→ echo_submitted (result=rate_limited)\n（与 witness_submit_failed 不同，Echo 仅在 result=rate_limited 时也视为成功事件失败的收口，由 E-P0-07 决定是否拆为 echo_submit_failed；当前表暂不引入该事件，详见 P1 决策）
    ServerConfirmed --> [*] : 显示成功 Banner
```

> **设计决策**：Echo 失败（如限流）当前归入 `echo_submitted.result=rate_limited`，**不引入** `echo_submit_failed` 事件。理由：Echo 在 P1 阶段可能整体降级为不可用；此时事件保持稳定 schema 比新增事件更利于 E-P0-07 schema 收敛。如未来 Echo 失败需要细粒度分类，再走"新增事件 + PM 评审"流程。

---

## 6. Daily 12 → Moment → City 转化漏斗（mermaid）

```mermaid
flowchart TB
    classDef ev fill:#fde2e2,stroke:#a13a3a,color:#4a1414
    EV_E[edition_viewed]:::ev
    EV_MI[moment_impression]:::ev
    EV_MO[moment_opened]:::ev
    EV_CO[city_opened]:::ev
    EV_CSV[city_section_viewed]:::ev

    EV_E -->|用户浏览 Daily 12| EV_MI
    EV_MI -->|用户点击某 Moment| EV_MO
    EV_MO -->|用户点'打开城市'| EV_CO
    EV_CO -->|用户深入章节| EV_CSV
```

> 此图同时回答 V1 问题 #1 与 #2：`edition_viewed` + `moment_impression` 验证浏览深度；`moment_opened` → `city_opened` → `city_section_viewed` 验证 Moment → City 转化。

---

## 7. Witness 全漏斗（mermaid）

```mermaid
flowchart TB
    classDef ev fill:#fde2e2,stroke:#a13a3a,color:#4a1414
    EV_WSt[witness_started]:::ev
    EV_WPR[witness_permission_result]:::ev
    EV_WUS[witness_upload_started]:::ev
    EV_WSM[witness_submitted]:::ev
    EV_WSF[witness_submit_failed]:::ev

    EV_WSt -->|权限弹窗| EV_WPR
    EV_WPR -->|用户进入选图/拍摄/位置| EV_WUS
    EV_WUS -->|上传请求发起| EV_WSM
    EV_WUS -.不可恢复.-> EV_WSF
```

> 漏斗在 `witness_permission_result` 后**强制分叉**：根据 `result` 决定是否进入下一阶段；`denied` / `restricted` 直接结束 session（仍保留 `witness_started` 作为入口计费，但不计入"成功提交率"分母）。

---

## 8. 关键设计决策（精细化触发规则）

### 8.1 "有效可见"判定（`moment_impression` / `city_section_viewed`）

| 维度 | 阈值 | 理由 |
|---|---|---|
| 面积占比 | ≥ 50%（impression）/ ≥ 60%（section） | impression 更宽松，section 因有章节纵深要求更严格 |
| 停留时间 | ≥ 500 ms / ≥ 800 ms | 防止快速滑动产生噪声曝光 |
| 触发器 | IntersectionObserver（`rootMargin: 0px`） | 不使用 scroll listener / ResizeObserver，避免性能与定时器假设 |
| 防滑回 | 滑出 ≥ 1 个卡片宽度后再进入视口才重计 | **明确 DO NOT**：滑回不重复计 |
| 防刷新 | 同 `moment_id` + `edition_id` 在 30 分钟去重窗口内仅计一次 | 防止刷新页面产生大量噪声曝光 |

### 8.2 "开始 Witness"边界（`witness_started`）

| 选项 | 是否采用 | 理由 |
|---|---|---|
| 进入 Witness 页面路由 | 否 | 用户可能误入或自动打开（如 deeplink） |
| 点击 FAB / 入口按钮 | 否 | 不计入正式 started；FAB 点击是"曝光"信号但不是"承诺"信号 |
| **点击第一个 `Continue` 按钮** | **是** | 用户已明确表达"我要开始贡献" |
| 弹出第一个权限弹窗 | 否 | 用户可能拒绝；过早计 started 会污染漏斗 |

### 8.3 "完成 Reveal"成功语义（`unknown_revealed`）

| 选项 | 是否采用 | 理由 |
|---|---|---|
| 用户点击 Reveal 按钮 | 否 | 仅是客户端行为；服务端未确认 |
| 服务端返回 `reveal_token` | 是（前置） | 必须先服务端校验 |
| **Reveal 页（答案 / 城市信息）就绪** | **是** | 用户实际"看到答案"才算 Reveal 完成 |
| 用户跳转进入城市 | 否 | 由 `city_opened.entry_point = unknown_reveal` 单独计 |

### 8.4 Echo / Witness 成功反馈设计

| 场景 | 反馈组件 | 反馈文案原则 | 触发事件 |
|---|---|---|---|
| Echo Submit 成功 | `<EchoResultBanner>`（Success） | "已记录，会在审核后出现" | `echo_submitted.result=accepted` |
| Echo Submit 待审核 | `<EchoResultBanner>`（Info） | "已记录；不会立即显示" | `echo_submitted.result=queued_for_review` |
| Echo 限流 | `<EchoResultBanner>`（Warning） | "稍后再试；不计入本次失败" | `echo_submitted.result=rate_limited` |
| Witness Submit 成功 | `<WitnessResultStep>`（Success） | "已提交；审核后会出现在 Daily 12" | `witness_submitted` |
| Witness 待审核 | `<WitnessResultStep>`（Info） | "已提交；进入审核队列" | `witness_submitted`（同上） |
| Witness 失败可重试 | `<WitnessResultStep>`（Error） + Retry 按钮 | 简短原因 + "重试"按钮 | `witness_submit_failed.retryable=true` |
| Witness 失败不可重试 | `<WitnessResultStep>`（Error） | 解释原因 + "返回首页" | `witness_submit_failed.retryable=false` |

> **统一原则**：成功反馈文案**不暗示"立即可见"**；不假装审核通过；不展示精确时间或位置。

---

## 9. 客户端去重实现建议（给 E-P0-07）

- **存储**：使用 `sessionStorage`（session 级）+ `localStorage`（跨 session，用于 `edition_viewed` / `unknown_revealed` 等生命周期事件）。
- **键格式**：`{event}__{dedupe_key_1}__{dedupe_key_2}`，例如 `moment_impression__m_42__e_2026-08-22`。
- **过期**：TTL 由前端运行时按"事件表 §6"中的窗口管理；TTL 过期键自动清除。
- **可见性事件**：IntersectionObserver + timer 协同，**仅在元素进入视口后启动定时器**，离开视口即清除定时器。
- **服务端 confirmation**：前端必须等待 `fetch` resolve 才发送 success 事件；reject 路径走 failure 事件。

---

## 10. 自验收

- [x] 14 个事件全部有"组件 → 状态 → 触发器"四级链条（无遗漏）。
- [x] 无 setTimeout / setInterval 触发 success 事件（`unknown_revealed` / `echo_submitted` / `witness_submitted` 全部以服务端 confirmation 为前置）。
- [x] 可见性事件使用 IntersectionObserver + 停留阈值，不用 scroll listener / 定时器。
- [x] 滑回 / 重复刷新有明确去重窗口（见 §6 + `event-map-v1.md` §6）。
- [x] 成功 / 失败反馈组件、文案原则、触发事件三者一一对应。
- [x] 漏斗图覆盖 Daily 12、Moment → City、Unknown、Witness 四条主路径。

---

**End of Trigger Diagram v1**