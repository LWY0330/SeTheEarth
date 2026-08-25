---
type: pm-handoff-corrections
tags: [handoff, corrections-v2, see-earth-redesign, fact-checks]
created: 2026-08-19
status: 4 件漏报 + 1 件误报 · 全部已落地修复建议
related_docs:
  - /Users/lwy/Documents/ChatGPT/看见地球/06-PM Agent 交接/2026-08-18-pm-agent-handoff-complete-status.md (原 handoff)
  - /Users/lwy/Documents/ChatGPT/看见地球/06-PM Agent 交接/2026-08-19-pm-takeover-audit.md (完整审计)
---

# PM Agent 交接校正 v2 · 2026-08-19

> **状态**:✅ 已校正 · 原 handoff 仍作为 8/18 14:00 快照保留
> **触发**:8/19 接管 PM Agent 实测发现 5 件不符 + 8/19 上午与前 PM 沟通确认
> **范围**:仅校正事实错误 + 显式声明未完成项。设计/产品决策层不受影响
> **配套**:完整分析与背景见 `2026-08-19-pm-takeover-audit.md`

---

## 📋 一句话校正总结

**8/18 handoff 漏报 4 件代码/数据层事实(Khartoum 不在 cities.ts + handoff 时序 + Hero 8 字段 metadata + LiveMoments 旧文案),误报 1 件 Obsidian 写权限原因不全。校正后:handoff 应作为"设计/视觉层快照"读,代码/数据层以本校正为准。**

---

## 🔧 校正 1 · Khartoum 不在数据层 + CityPage 仍是 v1.4 结构(代码层完全漏报)

### 原 handoff 写的(缺)
- 1.1 LOCKED 表覆盖到 City Detail 设计层
- 6. 下一步 3 步走法只涉及设计/QA,没提代码 PR

### 真相(8/19 实测 + 前 PM 自述)
- `src/data/cities.ts` 只有 11 城,**无 Khartoum**
- `src/components/CityPage.tsx` **仍是 v1.4 5 段结构**(Hero/SyncMoment/Summary/CityNow/Local Life),**不是 mockup 的 A2 4 屏结构**
- `07-设计师设计参考/khartoum.md` 不存在
- `outputs/a2-visual-assets/12 城市真实地点图像 URL 清单.md` 只有 11 行
- 前 PM 8/19 自述:"这一轮 PM Agent 周期(8/15-8/18)全在跑设计验证循环,没动过 data/cities.ts 或 CityPage.tsx"

### 校正影响
- ❌ handoff 1.1 LOCKED 表不全 — 应区分**设计层 LOCKED** vs **代码层 NOT STARTED**
- ✅ 设计决策(A2/VF 1.2/4 屏 Pattern)不受影响
- ⚠️ 工程师下一步必做独立 PR:**mockup LOCKED 后**才动代码

### handoff §5 关键约束**新增一条**
```text
❌ 不动 src/data/cities.ts 和 CityPage.tsx(代码实现)
   → 等 Khartoum 全部 mockup LOCKED 后,工程师独立 PR 处理
```

---

## 🔧 校正 2 · handoff §9.3 时序错位(文档同步问题)

### 原 handoff 写的(过时)
> §9.3 当前焦点:"等待设计师回 PROMPT 31"

### 真相
- handoff 写于 **8/18 14:00**,当时 PROMPT 31 未交
- **8/18 16:56** 设计师交付 PROMPT 31(round 3 mockup)
- handoff 顶部没有 status timestamp,导致 §9.3 滞后于实际状态

### 校正
- handoff §9.3 改为:**"PROMPT 31 已交付(8/18 16:56),等用户转发外部设计师做 round 10 全页 QA → 锁 Khartoum → 启动 Yellow Layer(Lisbon)"**
- handoff §10 顶部加 `created_at: 2026-08-18 14:00` + `as_of_now(接管 PM 视角):2026-08-19 接管后更新`

### 教训
**handoff 模板必须含双时间戳**:`created_at`(写作快照)+ `as_of_now`(接管 PM 视角实际状态)

---

## 🔧 校正 3 · Hero 8 字段 metadata 缺失(未显式声明)

### 原 handoff 写的(模糊)
> 1.1 表:Khartoum Hero FINAL = LOCKED ✓
> 7. 关键资源表:`outputs/a2-visual-assets/khartoum-real-nile-sunset.jpg`

### 真相
12 字段 metadata 已填 4 项(resolution / date / content_description / usage_restriction),缺 8 项:
- source_url
- photographer
- license
- credit_requirement
- editorial_only
- source(完整源)
- (外加 editorial_only 是布尔值,未填)

前 PM 8/19 自述:"用户 8/18 提供图时,没给 source / photographer / license 信息。PM 当时无法填齐。"

### 校正
- handoff §7 关键资源表给 `khartoum-real-nile-sunset.jpg` 加注:
  > ⚠️ 8/12 字段待补:source_url / photographer / license / credit_requirement / editorial_only
- 接管 PM 已启动 web fetch 反查(al-Mogran + 蓝尼罗河日落 + 桥 视觉特征)
- round 10 QA prompt 必加 sub-task "补 12 字段 metadata"

---

## 🔧 校正 4 · `liveMoments.ts:411-422` 旧文案冲突(数据层污染,真冲突)

### 原 handoff 写的(没提)
> handoff 完全没提这条数据

### 真相
```ts
// src/data/liveMoments.ts (production data 层)
411:    cityNameZh: '喀土穆',
420:    title: '喀土穆的炮弹声在凌晨三点再次响起',
421:    description: '喀土穆的炮弹声在凌晨三点再次响起。',
422:    momentZh: '喀土穆的炮弹声在凌晨三点再次响起',
```

### 冲突分析
| 维度 | handoff §5 / DS v1.2 §2.8.8 | liveMoments.ts:411-422 |
|---|---|---|
| 关键约束 | ❌ 不写战时相关 Echo 文案 | "炮弹声在凌晨三点再次响起" |
| Red Layer Ethics | 不利用受害者面部作为情绪素材 | 不利用文字做情绪素材(同源)|
| 调性 | 纪录感观察、克制 | "凌晨三点"已越过灾难事件领域 |

前 PM 8/19 自述:"这条数据是 v1.5 mockup 早期设计师放进 liveMoments.ts 做'参考'用的,而不是 production 数据。当时没完全删掉。"

### 校正方案(前 PM 建议 A,我同意)
**删除 Khartoum 条目(411-422 行)** — 符合"数据层不在 product 调性内"原则
- 与工程师 PR(Khartoum 数据接入)一起处理
- 在工程师 PR 拆解中明确"删除 liveMoments.ts 旧 Khartoum 条目"

### handoff §5 关键约束**新增一条**
```text
❌ 不保留 liveMoments.ts:411-422 旧"喀土穆的炮弹声"文案 → 必须删
   (v1.5 mockup 早期参考数据残留,与 §2.8.8 Red Layer Image Ethics 冲突)
```

---

## 🔧 校正 5 · Obsidian vault 写权限问题(原因不全,误导为"无法写",8/19 实测更深)

### 原 handoff 写的(误导)
> §9.2:"Obsidian vault 写权限问题 — 写不进去(0 字节)需手动 copy"

### 真相(8/19 三层实测)

| 写方式 | 默认 sandbox | require_escalated sandbox |
|---|---|---|
| Codex **file write tool** | ❌ 失败(0 字节) | ❌ 仍失败 |
| Codex shell `cp` 命令 | ❌ 失败(`Operation not permitted`) | ✅ **成功**(9903+11126+7772 字节全过)|

- 不是"写工具 vs shell 权限分离"
- 是 **Codex 沙箱默认禁止写 `/Users/lwy/Documents/Obsidian Vault/...`**
- 必须 `sandbox_permissions: "require_escalated"` 才能 cp 成功

### 校正
- handoff §9.2 改写为完整原因 + 解决方案
- **新 PM 工作模式标准化**:写 Obsidian vault 永远 `require_escalated` + `cp` 同步

### 教训(给未来 PM)
**不要在 handoff 里写"无法写 + 需手动 copy"** — 误导未来 PM 浪费时间。任何 Obsidian 同步任务,接到即 `require_escalated`。

---

## 📚 校正后阅读路径

1. **本文件**(校正记录,必读)
2. **`2026-08-19-pm-takeover-audit.md`**(完整审计,5 件不符的根因 + 修复)
3. **原 handoff** `2026-08-18-pm-agent-handoff-complete-status.md`(作为 8/18 14:00 快照读,设计/视觉层权威)
4. **决策记录** `02-决策/决策记录.md`(产品决策不受本校正影响)

---

## 🎯 校正后的一句话

**8/18 handoff 是设计/视觉层完整快照,但漏报代码/数据层(Khartoum cities.ts / CityPage.tsx / LiveMoments)和资源细节(Hero 12 字段)。接管 PM 8/19 已盘点 5 件不符 + 给出修复,工程师下一步做"Khartoum 数据接入 + CityPage refactor"独立 PR。设计/产品决策层不受影响。**

---

## 📎 关联文档

- `2026-08-19-pm-takeover-audit.md`(完整审计 — 推荐先读这个)
- `2026-08-18-pm-agent-handoff-complete-status.md`(原 handoff)
- `2026-08-15-pm-agent-handoff-v1.5.md`(上轮 handoff)
- `pm-handoff-corrections-2026-08-15.md`(上轮 corrections 模式)
- `05-项目现状/d4-a2-khartoum-final.md`(Hero LOCKED 报告)
- `05-项目现状/d4-a2-khartoum-round3.md`(PROMPT 31 交付物)
- `07-设计师设计参考/SEE_EARTH_DESIGN_SYSTEM_v1.2_Complete_Spec.md` §2.8.8/§2.8.9

---

**最后更新**:2026-08-19(接管 PM Agent)
