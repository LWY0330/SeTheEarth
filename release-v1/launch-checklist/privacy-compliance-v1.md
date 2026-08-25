---
title: Privacy & Compliance Audit v1 · 隐私 / 合规审计清单
type: launch-checklist-sub
tags: [release-v1, d-p0-06, launch-checklist, privacy, compliance, about, method, cookies, gdpr, see-earth]
task_id: D-P0-06
brief_anchor: §4 D-P0-06 AC #7 + 任务卡 §D
track: design
target_gate: Gate C · Launch Candidate
created: 2026-08-24
sender: Designer Agent #6
receiver: PM Agent / Design / Engineering / Content / Operations / Privacy-Legal
status: IN REVIEW
depends_on:
  - checklist-v1.md §AC #7 (公开位置城市级)
  - D-P0-02 copy-final-v1.md (Witness 隐私文案)
  - E-P0-05 位置隔离(后端)
  - E-P0-07 Analytics Instrumentation(后端)
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/06-PM Agent 交接/release-v1/launch-checklist/privacy-compliance-v1.md
workspace_canonical_path: /Users/lwy/Documents/ChatGPT/看见地球/release-v1/launch-checklist/privacy-compliance-v1.md
related_docs:
  - ./checklist-v1.md
  - ./accessibility-audit-v1.md
  - /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/07-设计师设计参考/release-v1/minimal-witness/copy-final-v1.md
  - /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/07-设计师设计参考/release-v1/minimal-witness/state-matrix-v1.md
  - /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/SEE-EARTH-Release-Strategy-v1-Design-Engineering-Task-Brief.md §E-P0-05 §E-P0-10
---

# Privacy & Compliance Audit v1 · 隐私 / 合规审计清单

> **作者**：Designer Agent #6（外部 Owner = 您）  
> **目标读者**：PM Agent（Gate C 决策者）/ Design / Engineering / Content / Operations / Privacy-Legal  
> **目的**：把 Brief §D-P0-06 AC #7（公开位置只显示城市级）+ 任务卡 §D（隐私 / 合规 5 项）合并为**可逐项验收**的合规清单。  
> **完成时间**：2026-08-24

---

## 0. 一句话总结

**Launch Candidate 必须满足 5 类合规基线：About / Method / Privacy 三页齐全 · Cookie 提示（如启用 Analytics）· 第三方图源标注 · 数据收集声明 · 联系方式。任何一项缺失 → Gate C 不签字。**

---

## 1. About / Method / Privacy 三页内容齐全

### 1.1 三页路由 & 现状

| # | 路由 | 页面 | LC 期望内容 | 当前状态 |
|---|---|---|---|---|
| 1 | `/about` | About | 产品使命 · 看世界的方式 · 团队 | NEEDS LOCK · 应由 Content / Design 落地 |
| 2 | `/about#method` | Method (锚点) | 内容筛选标准 · 来源标记 · 编辑原则 | NEEDS LOCK |
| 3 | `/privacy` | Privacy | 隐私原则 · 数据收集 · 位置处理 · 联系方式 | NEEDS LOCK · §E-P0-05 后端实现后落地 |

### 1.2 /about 内容 checklist

- [ ] **产品使命**：「看见地球」是什么 · 解决什么问题
- [ ] **看世界的方式**：Daily 12 + Witness 闭环说明
- [ ] **编辑原则**：什么内容会被收录 · Seed / Editorial / Witness 区分
- [ ] **时间语言**：captured_at / 当地显示时间 / UTC 储存
- [ ] **位置语言**：城市级公开 · 精确位置私密 · 不暴露坐标
- [ ] **团队**：（可选）· 联系方式 · 致谢
- [ ] **最后更新日期**：`Last updated: 2026-08-XX`
- [ ] **Footer 链接**：「Privacy」「Method」CTA

### 1.3 /about#method 内容 checklist

- [ ] **来源分类**：Witness 提交 / Seed 编辑 / Editorial 内容 三类明确区分
- [ ] **入选标准**：时间可信度 · 图像质量 · 内容合规 · 红层伦理（§2.8.8-2.8.11）
- [ ] **Daily 12 流程**：连续 14 天供应演练（Gate B 验证）· fallback Edition
- [ ] **撤下 / 替换流程**：单项失效可替换 · 整版可回滚
- [ ] **i18n 状态**：当前仅中文 / 英文准备中

### 1.4 /privacy 内容 checklist

> 与 E-P0-05 位置隔离 + D-P0-02 Witness 隐私文案对齐。

- [ ] **我们收集什么**：
  - 匿名 Analytics 事件（`edition_viewed` / `moment_impression` 等）
  - Witness 提交时的：照片 / EXIF 时间 / 城市级位置 / 短描述 / IP（短期）
- [ ] **我们不收集什么**：
  - 精确 GPS（公开面）
  - 个人账号（无登录）
  - Cookie 追踪（可选启用 Analytics cookie）
- [ ] **数据保留期限**：
  - Analytics：90 天
  - Witness 精确位置：审核发布后 ≤ 30 天清除
  - 已发布 Moment：永久（除非撤下）
- [ ] **公开 vs 私密**：
  - 公开：城市名 / 国家 / 当地时刻 / 照片
  - 私密：精确 GPS / EXIF 原始 / IP / 用户标识
- [ ] **撤回路径**：Moment 撤下 · Witness submission 撤回 · 数据删除请求
- [ ] **儿童隐私**：不针对 13 岁以下用户 · 不主动收集
- [ ] **国际传输**：明确说明（如使用海外 CDN）
- [ ] **联系方式**：privacy@see-earth.com
- [ ] **法律基础**：GDPR / CCPA / 中国《个人信息保护法》合规说明
- [ ] **最后更新日期**

### 1.5 三页验证脚本

```bash
for path in "/about" "/privacy" "/about#method"; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}${path}")
  echo "${path}: ${STATUS} (期望 200)"
done

# 关键字检查(Privacy 应包含)
curl -s "${BASE_URL}/privacy" | grep -q "数据保留" && echo "✓ 数据保留"
curl -s "${BASE_URL}/privacy" | grep -q "撤回" && echo "✓ 撤回路径"
curl -s "${BASE_URL}/privacy" | grep -q "联系方式\|contact" && echo "✓ 联系方式"
curl -s "${BASE_URL}/privacy" | grep -q "精确位置" && echo "✓ 精确位置说明"
```

---

## 2. Cookie / Tracking 提示

### 2.1 是否启用 Analytics Cookie

| 项 | 决策 | 备注 |
|---|---|---|
| 是否启用 Cookie | **决策中** | 若启用 → 必须 Banner；若仅 LocalStorage / session → Banner 可选 |
| Analytics Provider | 待 E-P0-07 决定 | Plausible / Umami / 自建 / 暂时不开 |
| IP 匿名化 | 必须 | GDPR / CCPA 合规 |
| Do Not Track | 尊重 | DNT: 1 时不发送事件 |

### 2.2 Cookie Banner 规则（**如启用 Cookie**）

- [ ] 首次访问时显示
- [ ] 「接受 / 拒绝 / 仅必要」三选项
- [ ] 默认「仅必要」（最小化追踪）
- [ ] 拒绝不影响核心 Observe 体验
- [ ] 选择持久化在 LocalStorage
- [ ] 提供「撤回同意」入口（Footer 「Cookie 设置」）

### 2.3 当前实现检查

```bash
# 检查 Cookie / LocalStorage 使用
grep -rn "document.cookie\|localStorage\.setItem" src/
```

**期望**：
- Analytics SDK（如启用）使用 `localStorage` 不写入 `document.cookie`（更友好）
- 任何写入前必须经同意

### 2.4 Privacy-First 模式建议（V1 推荐）

```text
策略:
· 无 Cookie
· Analytics 仅用 LocalStorage session_id(UUID, ≤ 90 天)
· 服务端不持久化 IP 至 Analytics
· Analytics 仅用于产品内部决策,不与第三方共享
· DNT header 检测:不发送事件
```

---

## 3. 第三方图源版权标注

### 3.1 当前图源清单

> 来源：`/src/data/cities.ts` `imageCredit` 字段 + 当前 LOCKED 设计稿

| Provider | License | 是否需标注 | 当前实现 |
|---|---|---|---|
| **Unsplash** | Unsplash License（免费商用 · 无强制署名但建议）| ✅ 强烈建议 | `imageCredit: 'Sorasak · Unsplash'` |
| **Pexels** | Pexels License（免费商用 · 无强制署名但建议）| ✅ 强烈建议 | `imageCredit: 'Wiktor · Pexels'` 等 |
| **Wikimedia Commons** | CC BY-SA / CC BY / 公共领域 | ✅ 必须 | N/A（当前未使用）|
| **NASA Visible Earth** | 公共领域 | ✅ 建议 | Hero 地球图（如使用）|
| **自摄影** | SEE EARTH 自有 | ✅ 建议 | Witness 提交（由 Witness 自标）|

### 3.2 标注规则

```text
1. 城市图(每张)
   · imageCredit: "{摄影师} · {Provider}"
   · 示例: imageCredit: "Sorasak · Unsplash"

2. Hero / 装饰图
   · 在 Privacy / About / Footer "图源" 页集中列出

3. Witness 提交
   · 由 Witness 自行选择是否署名(Witness 可匿名)
   · 系统不强制填写 author_name
   · 提交预览页面显示"署名 / 匿名"选项
```

### 3.3 集中图源清单（建议新增页面）

| 路径 | 内容 |
|---|---|
| `/about#sources` 或 `/sources` | 12 城图源清单 + Hero 图源 + Earth Archive 图源 |
| Footer "图源" 链接 | 跳转至上方 |

**当前状态**：⚠️ NEEDS LOCK · 建议 Gate C 前由 Content 落地

### 3.4 验证脚本

```bash
# 检查 imageCredit 完整性
for slug in kyoto lisbon shanghai tokyo mexico-city rio reykjavik cape-town london berlin rome sydney khartoum; do
  CREDIT=$(grep -A 50 "slug: '$slug'" src/data/cities.ts | grep "imageCredit" | head -1)
  if [ -z "$CREDIT" ]; then
    echo "FAIL: /cities/$slug 缺 imageCredit"
  fi
done
```

**期望**：12 城 100% 有 `imageCredit`。

---

## 4. 数据收集声明（Witness 上传相关）

### 4.1 Witness 提交时收集的数据

| 字段 | 公开? | 私密? | 保留期限 |
|---|---|---|---|
| 照片（processed 1200x800）| ✅ 公开 | 服务器保留 | 永久（除非撤下）|
| 照片（original）| ❌ 不公开 | 服务器保留 | 处理后 ≤ 30 天清除 |
| EXIF `captured_at` | ✅ 公开（显示为当地时间）| 服务器保留 | 永久 |
| EXIF `DateTimeOriginal` 原始时区 | ✅ 公开（i18n 解释）| 服务器保留 | 永久 |
| EXIF GPS 原始坐标 | ❌ 不公开 | 服务器保留（受限访问）| 审核发布后 ≤ 30 天清除 |
| **城市级位置** (`cityId`) | ✅ 公开 | 服务器保留 | 永久 |
| **精确位置** (`lat`, `lon` 全精度) | ❌ 不公开 | 受限字段 · 仅审核 / 风控 | 审核发布后 ≤ 30 天清除 |
| 短描述（≤ 280 字）| ✅ 公开 | 服务器保留 | 永久 |
| IP 地址 | ❌ 不公开 | 服务器短期保留（滥用检测）| ≤ 7 天 |
| User Agent | ❌ 不公开 | 服务器短期保留 | ≤ 7 天 |
| `submission_id` | ❌ 不公开 | 服务器保留 | 永久 |
| `witness_id`（匿名 UUID）| ❌ 不公开 | 服务器保留 | 永久（仅系统内）|

### 4.2 公开预览（Witness 提交前）

> 来源：D-P0-02 `copy-final-v1.md §6 段 5 公开预览文案`

必须显式列出将公开的字段：

- [ ] 城市名 + 国家
- [ ] 当地时刻（来自 `captured_at`）
- [ ] 短描述
- [ ] 处理后照片

必须**不**显示的字段：

- [ ] 精确 GPS
- [ ] 原始 EXIF
- [ ] IP / User Agent
- [ ] Witness 标识

### 4.3 撤回 / 删除路径

- [ ] Witness 可通过 `submission_id` + 邮箱请求撤回（V1 可暂用邮件流程）
- [ ] 撤回后：照片删除 · `submission` 状态改为 `withdrawn` · 公开页 404
- [ ] 数据删除请求：`privacy@see-earth.com` 邮件处理 ≤ 30 天

---

## 5. 联系方式

### 5.1 必备联系方式

| 类别 | 邮箱 | 用途 |
|---|---|---|
| **General** | hello@see-earth.com | 一般咨询 |
| **Privacy** | privacy@see-earth.com | 隐私请求 · 数据删除 |
| **Feedback** | feedback@see-earth.com | 产品反馈 · Bug 报告 |
| **Witness Support** | witness@see-earth.com | Witness 提交相关 · 撤下请求 |
| **Press** | press@see-earth.com | 媒体咨询（如适用）|

### 5.2 联系方式展示位置

| 位置 | 内容 |
|---|---|
| `/about` 页底部 | 团队 / 联系邮箱 |
| `/privacy` 页底部 | privacy@see-earth.com |
| Footer 全站 | "Feedback" CTA → feedback@see-earth.com |
| Witness 提交结果页 | "有问题？联系 witness@see-earth.com" |
| 404 页面 | "找不到想要的内容？hello@see-earth.com" |

### 5.3 当前实现检查

```bash
# 当前邮箱字段
grep -rn "@see-earth.com\|@gmail.com\|@qq.com" src/ public/ 2>/dev/null | head -20
```

**当前状态**：⚠️ NEEDS LOCK · 当前为 Alpha 阶段 · Gate C 前必须落实

---

## 6. 与 AC 关系

| AC | 本清单覆盖 |
|---|---|
| AC #7 公开位置只显示城市级 | §1.4 Privacy 页文案 + §4.1 数据收集表 |
| 任务卡 §D 隐私 / 合规 5 项 | §1 About/Method/Privacy + §2 Cookie + §3 图源 + §4 数据收集 + §5 联系方式 |

---

## 7. Gate C 签字要求

- [ ] `/about` 内容齐全（§1.2）
- [ ] `/about#method` 内容齐全（§1.3）
- [ ] `/privacy` 内容齐全（§1.4）
- [ ] Cookie / Tracking 决策已定（启用 / 关闭）
- [ ] 如启用 Analytics → Cookie Banner 实现 + Privacy-First 默认
- [ ] 12 城 100% 有 `imageCredit`
- [ ] 图源清单页面或 Footer 链接落地
- [ ] Witness 数据收集表与实际后端一致
- [ ] 公开预览不显示私密字段（§4.2）
- [ ] 撤回 / 删除路径可执行（§4.3）
- [ ] 5 类联系方式邮箱落地（§5.1）
- [ ] 隐私 / 合规法务审核完成（Privacy-Legal 签字）

---

## 8. 法律 / 合规框架参考

> V1 主要市场：全球（含中国 · 欧盟 · 美国）。建议 Privacy / Legal 评审：

| 法律 | 适用 | 关键要求 |
|---|---|---|
| **GDPR**（欧盟）| ✅ 适用（不针对欧盟用户主动营销，但 EU 用户可能访问） | 数据收集透明 · 撤回 · 数据可携带 · DPO |
| **CCPA**（加州）| ✅ 适用 | 「Do Not Sell」· 数据访问 / 删除 |
| **中国《个人信息保护法》**| ✅ 适用（境内运营） | 最小化 · 知情同意 · 跨境传输评估 |
| **儿童在线隐私（COPPA / 中国儿童信息保护）**| ✅ 适用 | 不针对 13 岁以下 · 不主动收集 |

### 8.1 必备法务文档（Privacy-Legal Owner）

- [ ] `/privacy` 页面终稿（Privacy Officer 签字）
- [ ] Cookie Banner（启用时）
- [ ] 数据处理协议模板（如与第三方 Analytics 共享）
- [ ] 数据删除流程 SOP
- [ ] 用户请求响应时限 SOP（≤ 30 天）

### 8.2 强制声明

- [ ] Privacy 页含「不向第三方出售个人信息」声明
- [ ] Privacy 页含「无登录 · 无账号」声明
- [ ] Privacy 页含「精确位置仅审核 · 不公开」声明
- [ ] Privacy 页含「数据保留期限」明确数字
- [ ] Privacy 页含「撤回同意路径」明确步骤

---

**End of privacy-compliance-v1.md**
