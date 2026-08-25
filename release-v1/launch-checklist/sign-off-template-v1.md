---
title: Sign-Off Template v1 · PM / Design / Engineering / Content / Operations Go / No-Go 签字模板
type: launch-checklist-sub
tags: [release-v1, d-p0-06, launch-checklist, sign-off, gate-c, go-no-go, see-earth]
task_id: D-P0-06
brief_anchor: §9 Gate C + 任务卡 Acceptance Criteria
track: cross-functional
target_gate: Gate C · Launch Candidate
created: 2026-08-24
sender: Designer Agent #6
receiver: PM Agent / Design Lead / Engineering Lead / Content Lead / Operations Lead
status: IN REVIEW
depends_on:
  - checklist-v1.md (主清单)
  - placeholders-audit-v1.md (文案)
  - url-routing-audit-v1.md (路由)
  - privacy-compliance-v1.md (合规)
  - accessibility-audit-v1.md (a11y)
  - content-freshness-v1.md (内容)
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/06-PM Agent 交接/release-v1/launch-checklist/sign-off-template-v1.md
workspace_canonical_path: /Users/lwy/Documents/ChatGPT/看见地球/release-v1/launch-checklist/sign-off-template-v1.md
related_docs:
  - ./checklist-v1.md
  - ./placeholders-audit-v1.md
  - ./url-routing-audit-v1.md
  - ./privacy-compliance-v1.md
  - ./accessibility-audit-v1.md
  - ./content-freshness-v1.md
  - /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/SEE-EARTH-Release-Strategy-v1-Design-Engineering-Task-Brief.md §9 Gate C
---

# Sign-Off Template v1 · Gate C Launch Candidate Go / No-Go 签字模板

> **作者**：Designer Agent #6（外部 Owner = 您）  
> **目标读者**：PM Agent（Gate C 决策者）/ Design Lead / Engineering Lead / Content Lead / Operations Lead  
> **目的**：把 6 份子清单（checklist / placeholders / url-routing / privacy / a11y / content）合并为**4 角色签字表**，每个角色负责自己领域的检查项 + 签字 → Gate C GO。  
> **完成时间**：2026-08-24

---

## 0. 一句话总结

**Gate C 必须由 4 角色共同签字（PM + Design + Engineering + Content/Ops · 隐私 / 法务作为受邀评审）。每个角色按本模板逐项检查 → 全勾 → 签字 → Gate C PASS。任意 1 项未勾 = NO-GO。**

---

## 1. 4 角色责任矩阵

| 角色 | 负责子清单 | 主要检查 | 不可妥协项 |
|---|---|---|---|
| **PM Agent**（Orchestrator）| 全局风险 / 业务可发布性 | Brief §9 Gate C 全部项 | 全部 AC 100% 闭合 |
| **Design Lead** | checklist-v1.md（10 项 AC）+ accessibility-audit-v1.md | 视觉 / 交互 / a11y | AC #1-4 + a11y |
| **Engineering Lead** | url-routing-audit-v1.md + content-freshness-v1.md（实现部分）| 路由 / build / 性能 / 部署 | AC #2 + #6-10 |
| **Content / Operations Lead** | placeholders-audit-v1.md + content-freshness-v1.md + privacy-compliance-v1.md | 文案 / 图源 / 城市 / 隐私 / 法务 | AC #5 + #7-9 |
| **Privacy / Legal**（受邀评审）| privacy-compliance-v1.md | 法律合规 / 隐私文案 | AC #7 + 隐私声明 |

---

## 2. PM Agent 总签字（Gate C 决策者）

> Brief §9 Gate C 标准 + PM Agent 全局风险评估

### 2.1 Brief §9 Gate C 必须满足（10 项）

> 来源：Brief §9 Gate C · 与 D-P0-06 任务卡对齐

- [ ] **Scope Freeze 生效；新增功能数 = 0**
  - 证据：`git log` + 任务卡 status · Scope 锁定
  - 验证：v2-phase15 + fixes + nav-fix 之外无新增功能
- [ ] **Release Blocker = 0；未解决 Major 均有书面接受或降级，不破坏核心假设**
  - 证据：Blocker Log + Major Item Tracker
- [ ] **完整 smoke / regression / privacy / location leakage 检查通过**
  - 证据：E-P1-03 smoke suite + E-P0-05 leakage test
- [ ] **Daily 12 已有发布日历、fallback Edition 与值班 owner**
  - 证据：E-P0-06 Daily 12 Supply Chain
- [ ] **Production 配置、迁移、备份、回滚、Secrets、权限完成审核**
  - 证据：E-P0-08 Web Alpha + Production readiness
- [ ] **性能 budget 根据 Alpha / Beta 实测锁定，并在代表性设备与网络达到**
  - 证据：E-P0-10 监控 + Web Vitals
- [ ] **告警、日志、Dashboard、事故处理入口可用**
  - 证据：E-P0-10 监控
- [ ] **Analytics 事件版本、测试流量过滤与发布后查询准备完成**
  - 证据：E-P0-07 Analytics
- [ ] **所有占位内容、测试 Banner、假 CTA、内部路径已移除**
  - 证据：[placeholders-audit-v1.md](./placeholders-audit-v1.md) + [url-routing-audit-v1.md](./url-routing-audit-v1.md)
- [ ] **PM、Design、Engineering、Content / Operations 共同签署 Go / No-Go**
  - 证据：**本签字模板**（§3-§6）

### 2.2 Brief §10 全局 AC（10 项）

- [ ] 产品闭环（Observe + Witness vertical slice）
- [ ] 事实可信（时间 / 来源 / 位置不误表达）
- [ ] 隐私安全（精确位置与敏感 metadata 不进入公共面）
- [ ] 内容可持续（Daily 12 连续供应演练）
- [ ] 可观察（关键行为 / 错误 / 性能数据可用）
- [ ] 跨端一致（Web / iOS 共享 API contract）
- [ ] 可恢复（上传 / 发布 / 部署均有失败处理）
- [ ] 设计完整（P0 流程所有关键状态已设计）
- [ ] 范围受控（未支撑 V1 假设的扩展已移出 Gate）
- [ ] 可决策（Closed Beta 数据支持继续 / 调整 / 停止）

### 2.3 PM Agent 签字

```text
┌─────────────────────────────────────────────────┐
│ PM Agent 签字                                    │
├─────────────────────────────────────────────────┤
│ ✅ Brief §9 Gate C 10 项全部 PASS                │
│ ✅ Brief §10 全局 AC 10 项全部 PASS              │
│ ✅ 4 角色（Design / Engineering / Content / Ops）│
│    全部签字（见 §3-§6）                          │
│ ✅ Blocker Log = 0                                │
│ ✅ Scope Freeze 生效                              │
├─────────────────────────────────────────────────┤
│ 签字: ____________________                       │
│ 日期: ____________                               │
│ Go / No-Go: □ GO   □ NO-GO                       │
│ 备注: _________________________________________ │
└─────────────────────────────────────────────────┘
```

---

## 3. Design Lead 签字

> 负责：[checklist-v1.md](./checklist-v1.md) AC #1-4 + [accessibility-audit-v1.md](./accessibility-audit-v1.md)

### 3.1 Brief §D-P0-06 AC 检查

- [ ] **AC #1 · 22 LOCKED 设计文件全部应用**
  - 证据：`design-freeze-log-v1.md §1` + 部署截图 + DevTools
- [ ] **AC #2 · 关键流程通过键盘、触屏和基础读屏顺序检查**
  - 证据：[accessibility-audit-v1.md §3](./accessibility-audit-v1.md) + VoiceOver / NVDA 实测
- [ ] **AC #3 · 文本对比度、Focus、Reduced Motion 有明确规则**
  - 证据：[accessibility-audit-v1.md §2 / §4 / §6](./accessibility-audit-v1.md)
- [ ] **AC #4 · A1 / A2 在 P0 路径无不可读或品牌漂移问题**
  - 证据：DevTools computed style · 视觉 QA · 7 P0 页面截图

### 3.2 14 LOCKED 组件验证

| # | 组件 | 6 状态 LOCKED | LC 一致性 |
|---|---|---|---|
| 1 | GlobalHeader | ✅ | [ ] |
| 2 | SectionHeader | ✅ | [ ] |
| 3 | HeroMedia | ✅ | [ ] |
| 4 | WorldTimeRail | ✅ | [ ] |
| 5 | TimeDisplay | ✅ | [ ] |
| 6 | TimeComparison | ✅ | [ ] |
| 7 | CoordinateWindow | ✅ | [ ] |
| 8 | LocationMeta | ✅ | [ ] |
| 9 | LayerIndicator | ✅ | [ ] |
| 10 | OneScene | ✅ | [ ] |
| 11 | SameSecond | ✅ | [ ] |
| 12 | EchoInput | ✅ | [ ] |
| 13 | DistanceNavigation | ✅ | [ ] |
| 14 | RevealMeta | ✅ | [ ] |

### 3.3 5 City States A-E 验证

| State | 渲染 | LC 一致性 |
|---|---|---|
| A · Seed / Editorial | Hero + One Scene + Same Second + Echo | [ ] |
| B · Active | 同 A + "active" 标记 | [ ] |
| C · Low | "Last seen" / "Be the first" | [ ] |
| D · Past-only | Same Second hide · "Be the first today" | [ ] |
| E · Empty | 70% 空白 + 1 行诗意 + CTA | [ ] |

### 3.4 a11y 6 项基础检查

- [ ] 文字对比度 ≥ 4.5:1（普通文字）/ 3:1（大字号）
- [ ] 键盘 Tab 顺序合理（5 大关键流程）
- [ ] 焦点圈可见（Earth Blue 2px + :focus-visible）
- [ ] Alt 文本完整（所有图片）
- [ ] Reduced Motion 支持（`@media (prefers-reduced-motion: reduce)`）
- [ ] ARIA labels 关键交互元素（Logo / nav / form / button）

### 3.5 Design Lead 签字

```text
┌─────────────────────────────────────────────────┐
│ Design Lead 签字                                │
├─────────────────────────────────────────────────┤
│ ✅ AC #1-4 全部 PASS                             │
│ ✅ 14 LOCKED 组件 100% 一致                      │
│ ✅ 5 City States 全部 LOCKED                     │
│ ✅ a11y 6 项基础检查 100% PASS                   │
│ ✅ 不修改 A2 tokens                              │
│ ✅ 不修改 14 LOCKED 组件 props / API             │
├─────────────────────────────────────────────────┤
│ 签字: ____________________                       │
│ 日期: ____________                               │
│ Go / No-Go: □ GO   □ NO-GO                       │
│ 备注: _________________________________________ │
└─────────────────────────────────────────────────┘
```

---

## 4. Engineering Lead 签字

> 负责：[checklist-v1.md](./checklist-v1.md) AC #2 + #6-10 工程部分 + [url-routing-audit-v1.md](./url-routing-audit-v1.md)

### 4.1 Brief §D-P0-06 AC 工程部分

- [ ] **AC #2 键盘 / 触屏 / 读屏** · 工程配合（焦点 / aria-label / Tab order）
- [ ] **AC #6 时间区分** · `captured_at` / `uploaded_at` / `published_at` 数据原则实现
- [ ] **AC #7 公开位置只显示城市级** · E-P0-05 位置隔离 + 前端 payload 验证
- [ ] **AC #8 状态齐全** · D-P0-04 + 6 类对象 × 5 状态实现
- [ ] **AC #10 无未定义链接** · 7 P0 路由 + 12 城 + 5 锚点 + 404 + rel 属性

### 4.2 路由 & URL 检查（来源：[url-routing-audit-v1.md](./url-routing-audit-v1.md)）

- [ ] **7 P0 路由 100% 可达**（200 OK）
- [ ] **12 城 URL 100% 可达**（200 OK）
- [ ] **5 内部锚点 100% 命中**（**#spotlight 必须实现**）
- [ ] **404 页面友好**（HTTP 404 + 文案 + CTA）
- [ ] **跨域链接 100% 配对 rel="noopener noreferrer"**
- [ ] **旧测试链接清理完毕**

### 4.3 Build & 部署

- [ ] `npm run build` 成功（exit 0）
- [ ] `tsc -b` 无 type error
- [ ] Bundle size 合理（< 350KB gzip）
- [ ] Lighthouse Performance ≥ 85
- [ ] Lighthouse Accessibility ≥ 95
- [ ] Lighthouse Best Practices ≥ 95
- [ ] Lighthouse SEO ≥ 90

### 4.4 性能 / 监控（E-P0-10）

- [ ] Web Vitals LCP < 2.5s
- [ ] Web Vitals FID < 100ms
- [ ] Web Vitals CLS < 0.1
- [ ] 首屏图片 lazy load
- [ ] Hero 图响应式尺寸（srcset）
- [ ] 错误监控（Sentry / 自建）启用
- [ ] Analytics 流量过滤（VITE_ENV = production）
- [ ] API 5xx 告警 owner 配置

### 4.5 Engineering Lead 签字

```text
┌─────────────────────────────────────────────────┐
│ Engineering Lead 签字                            │
├─────────────────────────────────────────────────┤
│ ✅ AC #2 + #6-10 工程部分全部 PASS               │
│ ✅ 7 P0 路由 100% 可达                           │
│ ✅ 12 城 URL 100% 可达                           │
│ ✅ 5 内部锚点 100% 命中                          │
│ ✅ 404 页面友好                                   │
│ ✅ 跨域链接 100% 配对 rel 属性                   │
│ ✅ Build 0 error · Bundle 合理                   │
│ ✅ Lighthouse A11y ≥ 95 · Perf ≥ 85              │
│ ✅ Web Vitals 全部达到目标                       │
│ ✅ 错误监控 + 性能监控 + 告警启用                │
├─────────────────────────────────────────────────┤
│ 签字: ____________________                       │
│ 日期: ____________                               │
│ Go / No-Go: □ GO   □ NO-GO                       │
│ 备注: _________________________________________ │
└─────────────────────────────────────────────────┘
```

---

## 5. Content / Operations Lead 签字

> 负责：[placeholders-audit-v1.md](./placeholders-audit-v1.md) + [content-freshness-v1.md](./content-freshness-v1.md) + [privacy-compliance-v1.md](./privacy-compliance-v1.md) 内容部分

### 5.1 Brief §D-P0-06 AC 内容部分

- [ ] **AC #5 图片裁切 / 版权 / 来源 / alt 策略已标注**
  - 证据：[content-freshness-v1.md §1-3](./content-freshness-v1.md)
- [ ] **AC #8 状态齐全** · Empty / Permission / Privacy 文案
- [ ] **AC #9 Alpha / Beta 不进入 LC**
  - 证据：[placeholders-audit-v1.md §B](./placeholders-audit-v1.md) + 部署截图
- [ ] **AC #10 无占位内容**
  - 证据：`bash scripts/check-placeholders.sh` PASS

### 5.2 占位文案审计（来源：[placeholders-audit-v1.md](./placeholders-audit-v1.md)）

- [ ] **`scripts/check-placeholders.sh` 输出 PASS**（P0=0 / P1=0）
- [ ] **手动深度审计 100% 通过**
- [ ] **Khartoum 占位已修复**（真实数据 或 "Coming soon"）
- [ ] **Meta.tsx SITE_URL TODO 已修复**
- [ ] **红层伦理 0 违规**

### 5.3 内容时效（来源：[content-freshness-v1.md](./content-freshness-v1.md)）

- [ ] **12 城 100% 数据完整**（4 张图 + imageCredit）
- [ ] **图源合规**（Unsplash / Pexels / 自有）
- [ ] **Live Events 数据池 0 争议内容**
- [ ] **红层伦理**（Khartoum / 任何 Red Layer 城市合规）
- [ ] **Hero 编辑元信息日期动态化**
- [ ] **Footer 版权年份正确**

### 5.4 隐私 / 合规（来源：[privacy-compliance-v1.md](./privacy-compliance-v1.md)）

> 此部分可由 Privacy / Legal 受邀评审。

- [ ] **/about 内容齐全**
- [ ] **/about#method 内容齐全**
- [ ] **/privacy 内容齐全**
- [ ] **Cookie / Tracking 决策已定**
- [ ] **第三方图源标注完整**
- [ ] **Witness 数据收集表与实际后端一致**
- [ ] **撤回 / 删除路径可执行**
- [ ] **5 类联系方式邮箱落地**
- [ ] **隐私 / 合规法务审核完成（Privacy-Legal 签字）**

### 5.5 Operations 准备（E-P0-06 Daily 12 Supply Chain）

- [ ] Daily 12 发布日历已制定
- [ ] Fallback Edition 准备完成
- [ ] 值班 owner 已指派
- [ ] Edition 替换 / 回滚 SOP 文档化
- [ ] 内容撤下流程可执行

### 5.6 Content / Operations Lead 签字

```text
┌─────────────────────────────────────────────────┐
│ Content / Operations Lead 签字                  │
├─────────────────────────────────────────────────┤
│ ✅ AC #5 + #8-10 内容部分全部 PASS              │
│ ✅ scripts/check-placeholders.sh PASS            │
│ ✅ Khartoum 占位已修复                           │
│ ✅ 12 城 100% 数据完整                           │
│ ✅ Live Events 0 争议内容                        │
│ ✅ /about + /privacy + /about#method 齐全        │
│ ✅ 5 类联系方式邮箱落地                           │
│ ✅ 撤回 / 删除路径可执行                          │
│ ✅ Daily 12 发布日历 + Fallback Edition 准备     │
│ ✅ Privacy / Legal 评审完成                      │
├─────────────────────────────────────────────────┤
│ 签字: ____________________                       │
│ 日期: ____________                               │
│ Go / No-Go: □ GO   □ NO-GO                       │
│ 备注: _________________________________________ │
└─────────────────────────────────────────────────┘
```

---

## 6. Privacy / Legal 受邀评审签字（可选）

> 受邀角色 · 对隐私 / 合规负最终责任

### 6.1 法律 / 合规框架

- [ ] **GDPR**（欧盟）：数据收集透明 · 撤回 · 数据可携带 · DPO
- [ ] **CCPA**（加州）：Do Not Sell · 数据访问 / 删除
- [ ] **中国《个人信息保护法》**：最小化 · 知情同意 · 跨境传输评估
- [ ] **儿童在线隐私**（COPPA / 中国儿童信息保护）：不针对 13 岁以下

### 6.2 必备法务文档

- [ ] `/privacy` 页面终稿
- [ ] Cookie Banner（启用时）
- [ ] 数据处理协议模板
- [ ] 数据删除流程 SOP
- [ ] 用户请求响应时限 SOP（≤ 30 天）

### 6.3 强制声明

- [ ] 「不向第三方出售个人信息」
- [ ] 「无登录 · 无账号」
- [ ] 「精确位置仅审核 · 不公开」
- [ ] 「数据保留期限」明确数字
- [ ] 「撤回同意路径」明确步骤

### 6.4 Privacy / Legal 签字

```text
┌─────────────────────────────────────────────────┐
│ Privacy / Legal 签字                             │
├─────────────────────────────────────────────────┤
│ ✅ GDPR / CCPA / PIPL / 儿童隐私 全部合规       │
│ ✅ /privacy 页终稿法律审核 PASS                  │
│ ✅ 数据收集 / 保留 / 撤回 / 删除流程可执行       │
│ ✅ Cookie Banner（如启用）合规                   │
│ ✅ 强制声明全部覆盖                              │
├─────────────────────────────────────────────────┤
│ 签字: ____________________                       │
│ 日期: ____________                               │
│ Go / No-Go: □ GO   □ NO-GO                       │
│ 备注: _________________________________________ │
└─────────────────────────────────────────────────┘
```

---

## 7. 签字汇总 & Gate C 决议

### 7.1 签字汇总表

| 角色 | 责任人 | 签字 | 日期 | Go / No-Go |
|---|---|---|---|---|
| PM Agent | _____________ | _____________ | _____________ | □ GO □ NO-GO |
| Design Lead | _____________ | _____________ | _____________ | □ GO □ NO-GO |
| Engineering Lead | _____________ | _____________ | _____________ | □ GO □ NO-GO |
| Content / Ops Lead | _____________ | _____________ | _____________ | □ GO □ NO-GO |
| Privacy / Legal（受邀）| _____________ | _____________ | _____________ | □ GO □ NO-GO |

### 7.2 Gate C 决议规则

- **全 GO** → Gate C PASS · 进入发布准备（生产部署 + 监控 + 上线）
- **任意 NO-GO** → Gate C FAIL · 修复对应项 → 重新评审
- **弃权 / N/A** → 需 PM Agent 书面记录理由 + 风险接受

### 7.3 NO-GO 时修复流程

```text
1. NO-GO 角色记录具体未通过项 + 证据
2. PM Agent 召集修复会议（4 角色 + 相关 Owner）
3. 修复期限:Bloker 24h / Major 3-5 天 / Minor 14 天
4. 修复后重新走本签字流程
5. 所有角色重新签字
```

### 7.4 Gate C PASS 后

- [ ] PM Agent 发布内部公告
- [ ] Engineering 触发 Production 部署（E-P0-08 + 部署 SOP）
- [ ] Content / Ops 启动 Daily 12 发布
- [ ] Monitoring 启用 24h 值班
- [ ] Privacy / Legal 归档所有签字文件

---

## 8. 关联文档索引

| 文档 | 路径 | 角色 |
|---|---|---|
| 主清单 | [checklist-v1.md](./checklist-v1.md) | 全部 |
| 占位文案 | [placeholders-audit-v1.md](./placeholders-audit-v1.md) | Content / Ops |
| URL / 路由 | [url-routing-audit-v1.md](./url-routing-audit-v1.md) | Engineering |
| 隐私 / 合规 | [privacy-compliance-v1.md](./privacy-compliance-v1.md) | Content / Ops + Privacy |
| 可访问性 | [accessibility-audit-v1.md](./accessibility-audit-v1.md) | Design |
| 内容时效 | [content-freshness-v1.md](./content-freshness-v1.md) | Content / Ops |
| 占位检查脚本 | `scripts/check-placeholders.sh` | 自动 |
| Brief Gate C | §9 (Brief 文件) | PM |

---

**End of sign-off-template-v1.md · D-P0-06 第 7 交付物**
