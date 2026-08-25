---
title: SEE EARTH V1 · 候选池 + 资格校验 + 排序算法 · E-P0-06 D2
type: engineering-rules
tags: [release-v1, engineering, e-p0-06, daily-12, eligibility, sort, candidate-pool, see-earth]
task_id: E-P0-06
brief_anchor: §5 E-P0-06 §B (组版流程) / 任务卡 §B (5 项资格校验)
track: engineering
owner: Engineer Agent (Backend / DB)
created: 2026-08-24
status: IN REVIEW
target_gate: Gate B · Closed Beta
related_docs:
  - ./edition-entity-v1.md
  - ./group-process-v1.md
  - ./fallback-v1.md
  - ./scheduling-v1.md
  - ./14-day-test-plan-v1.md
  - ../api-contract/zod-schemas/moment.ts (PublicMoment / DomainSourceType)
  - ../api-contract/openapi.yaml (§1057–1118 Edition)
  - ../system-states/state-matrix-v1.md (§1 Daily 12 / §2 Moment 状态)
depends_on: [E-P0-09 LOCKED ✓, E-P0-04 LOCKED ✓]
blocks: [E-P0-10 Monitoring]
source_brief: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/SEE-EARTH-Release-Strategy-v1-Design-Engineering-Task-Brief.md §5 E-P0-06
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/e-p0-06-daily-12-supply-chain/eligibility-v1.md
workspace_canonical_path: /Users/lwy/Documents/ChatGPT/看见地球/release-v1/e-p0-06-daily-12-supply-chain/eligibility-v1.md
note: 本文件已就绪，需 PM Agent 由 Obsidian 写入权限落地到 canonical 路径。
---

# SEE EARTH V1 · 候选池 + 资格校验 + 排序算法

> **作者**：Engineer Agent · E-P0-06 Owner
> **目标读者**：PM Agent · E-P0-09 Contract Owner · E-P0-10 Monitoring Owner · 后端工程师 · Cron Job Owner · QA
> **目的**：把 Brief §B 的"5 项资格校验 + 智能排序"**算法化 + 可测试**——输入候选池（status=published Moment），输出 12 槽 + 来源标记（witness / seed / editorial）。
> **完成时间**：2026-08-24
> **配套文件**：`edition-entity-v1.md`（持久化）` `group-process-v1.md`（cron 时序）` `fallback-v1.md`（兜底）

---

## 0. 一句话总结

**Daily 12 资格校验 = 5 项硬过滤 + 1 个软约束 + 1 个排序算法**。任何 Moment **5 项硬过滤有 1 项不过即出局**；12 城内每城 24h 内**至多 1 张**（软约束：保证每日多样性）；排序按"**witness 优先 · editorial 兜底 · 时间最近**"4 级权重。

---

## 1. 阅读指南

- **§2 输入 / 输出定义**：候选池边界 + 输出 schema
- **§3 5 项硬过滤（资格校验）**：每项的 SQL 谓词 / 失败原因 / 处理策略
- **§4 软约束**：24h 同城去重 + 12 城配额
- **§5 排序算法**：4 级权重 + tie-breaker
- **§6 槽位填充**：12 个位置分配策略
- **§7 候选不足处理**：fallback 触发条件
- **§8 不做的校验**（明确越界项）

---

## 2. 输入 / 输出定义

### 2.1 输入

```text
eligibility_check_input:
  target_date: DATE                  # Edition 所属日历日
  reference_now: TIMESTAMPTZ         # 当前 UTC 时间（cron / admin 触发时刻）
  candidate_pool: 全部 status='published' Moment
                  （moderation_status='approved' ∧ published_at ≤ reference_now ∧ city_id ∈ 12 城内）
  available_cities: TEXT[12]         # 12 城内 slug 列表（kyoto/lisbon/shanghai/...）
```

### 2.2 输出

```text
eligibility_check_output:
  filled_slots: Slot[12]             # 12 个 slot（部分可空 → 触发 fallback §7）
  dropped_moments: {moment_id, reason}[]
  warnings: {city_id, count}[]
```

每个 Slot 结构：

```typescript
{
  position: 1..12,                  // 槽位号
  moment_id: UUID | null,           // null → 触发 fallback 路径
  city_id: TEXT | null,             // null ⇔ moment_id null
  source_type: 'witness'|'seed'|'editorial',  // brief §B
  fallback_reason: SlotFallbackReason | null,
  is_editorial_fill: boolean,       // 区别"editorial 内容" vs "editorial 兜底"
}
```

---

## 3. 5 项硬过滤（资格校验）

> **每个 Moment 必须通过全部 5 项；任 1 不过即从候选池移除。**

### 3.1 过滤 1：时间合法性（captured_at 不在未来）

```sql
-- 硬过滤 1：captured_at < now()
-- 防止未来时间（客户端 clock skew / 篡改）
WHERE m.captured_at < :reference_now
```

| 项 | 规则 |
|---|---|
| 通过条件 | `captured_at < reference_now`（不是 ≤，防止同一秒重复） |
| 失败处理 | 丢弃 + `dropped_moments[].reason = 'future_timestamp'` |
| 备注 | 与 E-P0-09 §4.3（前端硬阻塞 future）一致；服务端再校验一次防绕过 |

### 3.2 过滤 2：城市白名单（city_id 在 12 城内）

```sql
-- 硬过滤 2：city_id 必须命中 Seed 12 城
WHERE m.city_id = ANY(ARRAY['kyoto','lisbon','shanghai','mexico-city','tokyo','rio',
                            'reykjavik','cape-town','london','berlin','rome','sydney'])
```

| 项 | 规则 |
|---|---|
| 通过条件 | `city_id ∈ available_cities` |
| 失败处理 | 丢弃 + `dropped_moments[].reason = 'city_not_in_seed'` |
| 备注 | 12 城锁定（V1）；新增城市需 E-P0-04 重审 |

### 3.3 过滤 3：发布元数据完整（published_at 不空）

```sql
-- 硬过滤 3：published_at 必须非空且早于 reference_now
WHERE m.published_at IS NOT NULL
  AND m.published_at <= :reference_now
```

| 项 | 规则 |
|---|---|
| 通过条件 | `published_at IS NOT NULL ∧ published_at ≤ now` |
| 失败处理 | 丢弃 + `reason = 'not_published_yet'` |
| 备注 | 与 E-P0-09 PublicMoment `published_at` optional 字段一致——AdminEdition 必填，PublicMoment 可空（审核中）；Daily 12 候选池仅取 published |

### 3.4 过滤 4：媒体完整（image_variants 齐全）

```sql
-- 硬过滤 4：image_variants 至少有 1 个 variant 且全部 URL 可访问（健康检查）
--   - 由 E-P0-03 asset pipeline 写入时已校验（CDN HEAD 200）
--   - Daily 12 cron 仅做"非空"校验，避免冷启动时 CDN 抖动
WHERE jsonb_array_length(m.image_variants) >= 1
```

| 项 | 规则 |
|---|---|
| 通过条件 | `image_variants ≥ 1`（不深入查 URL） |
| 失败处理 | 丢弃 + `reason = 'missing_image_variants'` |
| 备注 | CDN 健康检查由 monitoring（E-P0-10）持续做；cron 不重复（O(N) 慢查询） |
| **V1 强化（可选）** | 若 candidate 数 ≤ 12 → 触发 deep check（HEAD probe）防单图失败拖垮 |

### 3.5 过滤 5：rights 不冲突（版权 / 上传合规）

```sql
-- 硬过滤 5：rights 字段必须 = 'cleared' 或 'editorial_owned' 或 'cc_by' 等合法状态
WHERE m.rights IN ('cleared','editorial_owned','cc_by','cc_by_sa','public_domain')
  AND m.moderation_status = 'approved'
```

| 项 | 规则 |
|---|---|
| 通过条件 | `rights ∈ LEGIT_STATUS ∧ moderation_status = 'approved'` |
| 失败处理 | 丢弃 + `reason = 'rights_conflict'` 或 `reason = 'moderation_pending'` |
| 备注 | `rights` 字段由 E-P0-03 Witness backend + 运营录入；与 E-P0-09 `RightsStatusSchema` 对齐 |
| **与 brief 不一致点** | Brief §B-5 只说"rights 不冲突"；本文件**收紧为枚举白名单**（更易审计） |

---

## 4. 软约束（同城去重 + 配额）

### 4.1 同城去重（同 Edition 24h 内不重复 Moment）

```sql
-- 软约束 1：同一个 Moment 不可出现在本 Edition 多个 slot
-- 实现：候选池内去重（distinct moment_id）

-- 软约束 2：同 city 24h 内最多 1 张（避免 Daily 12 全是 Kyoto）
-- 实现：在排序 + 配额算法中处理（§5）
```

| 项 | 规则 |
|---|---|
| **同城去重** | 同一 Edition 内 `moment_id` 不可重复（候选池 DISTINCT） |
| **同城配额** | 同 city 在本 Edition 中**至多 1 张**（V1 hard cap） |
| 例外（V1.1+） | Editorial 标记的"城市周"主题可临时放宽；V1 不启用 |
| 失败处理 | 多于 1 张 → 按排序算法选最优（详见 §5） |

### 4.2 12 城配额（理想分配）

```text
理想 Daily 12 = 12 城各 1 张（每城 1 slot）
但 candidate_pool 通常远 < 12 * 12（每个 city 候选不够 12 张）
→ 算法：每城选最优 1 张，剩余 slot 留给"次优候选"（其它城的次优 1 张）
```

| 城数（合格候选 ≥ 1 张） | Edition 行为 |
|---|---|
| 12 | ✅ 完美 12 城各 1 张 |
| 8~11 | ✅ 8~11 城各 1 张 + 剩余 slot 填"次优候选"（其它城 #2） |
| 4~7 | ⚠️ 部分 slot 触发 fallback（§7） |
| < 4 | 🔴 全 fallback edition（§7） |

---

## 5. 排序算法（4 级权重 + tie-breaker）

> **目标**：从候选池选 12 个最合适的 Moment。算法是 **stable sort**：同 weight 时按确定顺序，不引入随机性。

### 5.1 4 级权重

| 优先级 | 字段 | 排序方向 | 说明 |
|---|---|---|---|
| **P0** | `source_type = 'witness'` | witness > editorial > seed | Witness 优先（用户真实在场感） |
| **P1** | 同城内候选排名 | recent → old | captured_at 越近 → 越优先 |
| **P2** | `rights` 质量 | `cleared` > `editorial_owned` > `cc_*` > `public_domain` | 合规高 → 优先 |
| **P3** | `moderation_status` | `approved` > 其它 | 仅 approved 入候选 |

### 5.2 算法伪代码

```text
function rank_candidates(candidates):
  # P0 + P3 先过滤（硬条件在 §3 已过；此处仅排序）
  candidates = candidates
    .filter(m => m.source_type in ['witness','seed','editorial'])
    .filter(m => m.moderation_status == 'approved')

  # 4 级权重打分（数字越大越优）
  for m in candidates:
    m.score = (
      (m.source_type == 'witness') ? 1000 :
      (m.source_type == 'editorial') ? 500 : 0
    ) + (
      # captured_at 越近越好：reference_now - captured_at（秒数取负）
      -(reference_now - m.captured_at).total_seconds() / 3600   # 每 1 小时 = -1 分
    ) + (
      (m.rights == 'cleared') ? 100 :
      (m.rights == 'editorial_owned') ? 80 :
      (m.rights == 'cc_by' || 'cc_by_sa') ? 60 : 40
    )

  # 同城分组，按 score DESC
  grouped = group_by(candidates, m => m.city_id)
  for city in grouped:
    grouped[city].sort(by_score_desc)

  return candidates.sort(by_score_desc)
```

### 5.3 Tie-breaker（分数相同时）

1. `captured_at DESC`（越新越好）
2. `published_at DESC`（越新越好）
3. `moment_id ASC`（确定性 ID 顺序，避免每日震荡）

### 5.4 示例

```text
候选池（12 城各 3 张，共 36 张）：

  Kyoto:
    - M-A: witness · captured_at=2026-08-22 09:00 · rights=cleared
    - M-B: witness · captured_at=2026-08-21 18:00 · rights=cleared
    - M-C: editorial · captured_at=2026-08-20 12:00 · rights=editorial_owned

  排序后 Kyoto 候选：
    1. M-A: 1000 + (recent-9h) + 100 = 1100+  ← 选 M-A
    2. M-B: 1000 + (~24h ago) + 100 = ...
    3. M-C: 500 + (48h ago) + 80 = ...

Daily 12 选择：12 城各选 #1（最优）→ 完美 12 城版。
```

---

## 6. 槽位填充（12 个位置分配）

### 6.1 槽位分配原则

| 规则 | 说明 |
|---|---|
| **Position 1（主图位）** | 优先 Editorial（可控制视觉冲击）→ 否则最高 score |
| **Position 2~12（grid 位）** | 按"12 城 → 候选 score DESC → 剩余 slot 填次优"顺序填充 |
| **主图位置可被 admin 调整** | admin 在 preview 阶段可手动 drag-reorder |

### 6.2 算法

```text
function fill_slots(candidates_ranked, target_city_rotation):
  # target_city_rotation = 12 城的轮播序列（admin 可配；默认 Kyoto 起）
  filled = []
  used_moment_ids = set()
  used_cities_today = {city_id: count}  # 同城 24h 限额

  # Step 1：每城选最优 1 张（保证多样性）
  for city in target_city_rotation:
    slot = pick_best(candidates_ranked.filter(c => c.city_id == city),
                     used_moment_ids, used_cities_today)
    if slot:
      filled.append(slot)
      used_moment_ids.add(slot.moment_id)
      used_cities_today[city] += 1

  # Step 2：剩余 slot（如果 filled.length < 12）填次优候选
  while filled.length < 12:
    remaining = candidates_ranked.filter(c => c.moment_id ∉ used_moment_ids
                                          && used_cities_today[c.city_id] < 2)
    if remaining.empty: break
    slot = remaining[0]
    filled.append(slot)
    used_moment_ids.add(slot.moment_id)
    used_cities_today[slot.city_id] += 1

  # Step 3：补齐 12 个 slot（不足部分创建 placeholder）
  while filled.length < 12:
    filled.append({
      moment_id: null,
      city_id: null,
      source_type: 'editorial',
      fallback_reason: 'no_candidate_for_city',
      is_editorial_fill: false,
    })

  return filled
```

### 6.3 Position 1 主图特殊规则

- **主图候选**：从 12 个 filled slot 中选 score 最高者（如 tie，按 §5.3 tie-breaker）
- **主图城市**：admin 可强制指定（如"今天主图是 Lisbon"），覆盖默认

---

## 7. 候选不足处理（fallback 触发）

详见 `fallback-v1.md`。摘要：

```text
if filled.length < 12:
  slots_with_moment = filled.filter(s => s.moment_id != null).length
  if slots_with_moment >= 8:
    → 标 status='preview'，is_fallback=FALSE，slots 保留 placeholder（"等待来自这里的切片"）
    → admin 可手动调整
  elif slots_with_moment >= 4:
    → 标 status='preview'，is_fallback=TRUE，fallback_reason='no_sufficient_candidates'
    → UI 显示"内容待补充"标识（D-P0-04 §1 partial_missing）
  else:
    → 触发全 fallback（§7 fallback-v1.md）：自动创建 fallback Edition
```

---

## 8. 不做的校验（明确越界项）

- ❌ **不做内容质量打分**（图像美感 / 描述字数等）—— V1 不引入 CV/NLP 模型
- ❌ **不做语言检测**—— multilingual 支持由 `captions.zh/en` 双字段提供（E-P0-09 已锁）
- ❌ **不做"全球均衡"**—— Daily 12 仅覆盖 12 城，无国别配额
- ❌ **不做"故事性"匹配**—— Daily 12 是 12 个独立 moment，非 narrative
- ❌ **不做 popularity 排序**（浏览 / 点赞）—— 0 互动指标（V1 设计）
- ❌ **不做 i18n 候选筛选**（如"中文用户看中文描述优先"）—— captions 双字段已覆盖
- ❌ **不做未来时刻硬过滤的 UX**—— 仅服务端硬过滤；前端 E-P0-05 负责（前端已实现硬阻塞）

---

## 9. 自验收 Checklist（资格 + 排序）

- [x] 5 项硬过滤 SQL 谓词明确
- [x] 软约束：同城去重 + 配额
- [x] 12 城配额算法（4 个分支）
- [x] 4 级权重排序算法（伪代码 + 示例）
- [x] Tie-breaker 规则（确定性顺序）
- [x] 槽位填充算法（3 step）
- [x] Position 1 主图规则
- [x] 候选不足处理（与 fallback-v1.md 衔接）

---

## 10. 单元测试场景（与 `14-day-test-plan-v1.md §4` 衔接）

| 场景 | 输入 | 期望 |
|---|---|---|
| E1：完美 12 城 | 12 城各 ≥ 1 张合格候选 | 12 槽全填，无 fallback |
| E2：候选不足 1 城 | 11 城有，1 城 0 | 11 槽填 + 1 槽 placeholder |
| E3：候选不足 5 城 | 7 城有，5 城 0 | 7 槽填 + 5 槽 placeholder + fallback=TRUE |
| E4：Witness 优先 | 同城 witness + editorial 各 1 | witness 入选 |
| E5：未来时间过滤 | 1 张 captured_at > NOW | 该 Moment 被丢 |
| E6：同城去重 | 同 Moment 出现 2 次 | 候选池去重（DISTINCT） |
| E7：rights 冲突 | rights='pending' | 该 Moment 被丢 |
| E8：CDN 失败 | image_variants 为空 | 该 Moment 被丢 |
| E9：moderation pending | moderation_status='pending' | 该 Moment 被丢 |
| E10：稳定排序 | 完全相同分数的 2 Moment | tie-breaker 规则生效 |

---

> **下一步**：阅读 `group-process-v1.md`，理解每日组版的时序与 cron 实现。