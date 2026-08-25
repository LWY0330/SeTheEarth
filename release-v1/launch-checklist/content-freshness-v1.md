---
title: Content Freshness Audit v1 · 内容时效审计清单
type: launch-checklist-sub
tags: [release-v1, d-p0-06, launch-checklist, content, freshness, khartoum, cities, live-events, see-earth]
task_id: D-P0-06
brief_anchor: §4 D-P0-06 AC #5 + AC #10 + 任务卡 §F
track: design
target_gate: Gate C · Launch Candidate
created: 2026-08-24
sender: Designer Agent #6
receiver: PM Agent / Design / Content / Operations
status: IN REVIEW
depends_on:
  - checklist-v1.md §AC #5 + §AC #10
  - v2-phase15-fixes-report.md (Khartoum 文案已修 · Gaza 数据已替换)
  - design-freeze-log-v1.md §4.3 (Khartoum Red Layer LOCKED)
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/06-PM Agent 交接/release-v1/launch-checklist/content-freshness-v1.md
workspace_canonical_path: /Users/lwy/Documents/ChatGPT/看见地球/release-v1/launch-checklist/content-freshness-v1.md
related_docs:
  - ./checklist-v1.md
  - ./placeholders-audit-v1.md
  - ./url-routing-audit-v1.md
  - /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/design-implementation/v2-phase15-fixes-report.md
  - /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/design-implementation/v2-phase15-report.md
  - /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/07-设计师设计参考/release-v1/web-v1-flow/design-freeze-log-v1.md
---

# Content Freshness Audit v1 · 内容时效审计清单

> **作者**：Designer Agent #6（外部 Owner = 您）  
> **目标读者**：PM Agent（Gate C 决策者）/ Design / Content / Operations  
> **目的**：把 Brief §D-P0-06 AC #5（图片来源）+ AC #10（无占位图）+ 任务卡 §F（内容时效 5 项）合并为**图源 / 城市数据 / 时刻数据 / 文案时效**的内容合规清单。  
> **完成时间**：2026-08-24

---

## 0. 一句话总结

**Launch Candidate 必须保证：所有图源为 production-grade 真实摄影 · 12 城 100% 数据完整 · Khartoum 占位已替换 · Live Events 0 争议内容 · "待补 · 占位" 标记全部清除。任何一项缺失 → Gate C 不签字。**

---

## 1. 图源合规性（任务卡 §F · 检查项 1）

### 1.1 测试时使用的真实摄影 · 替换为 production 图源

| 类别 | 当前状态 | LC 期望 | Owner |
|---|---|---|---|
| **Hero 地球图** | `public/images/home/earth-hero-original.png` 真实摄影 | ✅ Production-ready | Design |
| **12 城市图** | 12 城全部 4 张 / 城（共 48 张）| ✅ 100% Unsplash / Pexels 真实摄影 | Content |
| **Live Events 配图** | 4 行 Live Events | ✅ Unsplash / Pexels 真实配图 | Content |
| **Earth Archive 9 节点图** | 组件内 inline 数据（无外部图） | N/A | OK |
| **Unknown Coordinate** | 装饰性图 / 文字为主 | N/A | OK |
| **Witness 用户提交** | 临时 / mock 占位 | ❌ Gate C 前必须有真实 Witness submission | Content + E-P0-02 |

### 1.2 图源来源清单（Production-grade）

| Provider | 当前使用 | License | 状态 |
|---|---|---|---|
| **Unsplash** | 11 城市主图（京都 / 东京 / 里斯本 / ...） | Unsplash License（免费商用） | ✅ LOCKED |
| **Pexels** | Lisbon 文化图（待确认）| Pexels License（免费商用）| ✅ LOCKED |
| **NASA Visible Earth** | Hero 地球图（如使用）| Public Domain | ⚠️ 需确认 credit |
| **自有** | Witness 提交 | 由 Witness 自标 | ✅ 见 §5 |

### 1.3 验证方法

```bash
# 1. 扫描所有 public/images/
ls -la public/images/cities/*/

# 2. 验证每张图 > 50KB（避免占位小图）
find public/images/cities -name "*.jpg" -size -50k

# 3. 验证每张图 imageCredit 字段
grep "imageCredit" src/data/cities.ts | wc -l
# 期望: 12 条
```

---

## 2. 12 城数据完整性（任务卡 §F · 检查项 4）

### 2.1 当前 12 城清单（来源：`/src/data/cities.ts`）

| # | slug | 中文名 | 英文名 | 国家 | 4 张图 | description | imageCredit | momentZh | oneObservation | weather |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | kyoto | 京都 | Kyoto | 日本 | ✅ | ✅ | "Sorasak · Unsplash" | ✅ | ✅ | ✅ |
| 2 | lisbon | 里斯本 | Lisbon | 葡萄牙 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 3 | shanghai | 上海 | Shanghai | 中国 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 4 | mexico-city | 墨西哥城 | Mexico City | 墨西哥 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 5 | tokyo | 东京 | Tokyo | 日本 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 6 | rio | 里约热内卢 | Rio | 巴西 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 7 | reykjavik | 雷克雅未克 | Reykjavík | 冰岛 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 8 | cape-town | 开普敦 | Cape Town | 南非 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 9 | london | 伦敦 | London | 英国 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 10 | berlin | 柏林 | Berlin | 德国 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 11 | rome | 罗马 | Rome | 意大利 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 12 | sydney | 悉尼 | Sydney | 澳大利亚 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

**当前数据状态**：12 城 100% 完整 · 字段齐全。

### 2.2 ⚠️ 关键缺失 · Khartoum

> 来源：Gate A 视觉验收报告 · `gate-a-visual-acceptance.md` §已知偏差 #3

**问题**：

- 当前 `cities.ts` 无 Khartoum 条目
- 但 `design-freeze-log-v1.md §4.3` 标注 Khartoum 为 **Red Layer 基准 + Red Layer 压测通过 LOCKED ✓**
- 12 Coordinates 板块以 11 真实城 + 1 Khartoum 占位 = 12 城
- 前端显示 `(待补 · 占位)` / `(待补图)` / `(Red Layer · 占位)`

**Gate C 要求（必须二选一）**：

| 选项 | 描述 | 适用 |
|---|---|---|
| **A · 补齐 Khartoum 数据** | 添加 Khartoum 到 `cities.ts` · 4 张真实图（公寓楼真图 LOCKED） · imageCredit · description · momentZh · oneObservation · weather | 资源就绪（推荐） |
| **B · 明确标 "Coming soon"** | 11 城 + 1 "Coming soon" cell · 不渲染 `(待补 · 占位)` 灰色样式 · 用 Coming soon 标记 | 资源未就绪 |

### 2.3 12 城 URL 可达性（任务卡 §F · 检查项 4）

> 见 [url-routing-audit-v1.md §2](./url-routing-audit-v1.md) 完整 12 城 URL 清单 + 验证脚本。

**当前可达**：11 城（缺 Khartoum）  
**LC 期望**：12 城 100% 可达

---

## 3. Khartoum 占位（任务卡 §F · 检查项 2 · ⚠️ 必须闭合）

### 3.1 当前占位文案清单（来源：`check-placeholders.sh` 自动扫描）

| 位置 | 当前文案 | LC 期望 |
|---|---|---|
| `src/components/HomeCoordinates.tsx:145` | `aria-label="Khartoum · 占位 · 待补"` | 删除占位 · 改为真实城市或"Coming soon" |
| `src/components/HomeCoordinates.tsx:151` | `(待补 · 占位)` | 删除 / "Coming soon" |
| `src/components/HomeCoordinates.tsx:191` | `(待补图)` | 删除 / 真实图 |
| `src/components/HomeWorldsCollide.tsx:118` | `(Red Layer · 占位)` | 删除 / 真实 Khartoum 文案 |

### 3.2 Khartoum 真实数据要求（选项 A · 推荐）

> 来源：`design-freeze-log-v1.md §4.3` + v2-phase15-fixes-report.md §1

| 字段 | LC 期望值 |
|---|---|
| `id` | `'khartoum'` |
| `slug` | `'khartoum'` |
| `nameZh` | `'喀土穆'` |
| `nameEn` | `'Khartoum'` |
| `countryZh` | `'苏丹'` |
| `countryEn` | `'Sudan'` |
| `description` | ⚠️ 严格遵守 §2.8.8-2.8.11 Red Layer Ethics · 避开新闻 / NGO / 苦难审美 |
| `lon` / `lat` | 32.5599 / 15.5007（喀土穆坐标）|
| `images` | 4 张真实图（避免苦难审美 · 公寓楼真图 v10 已就绪）|
| `imageCredit` | 各图摄影师 + Provider |
| `momentZh` | 诗意 + Layer Red 谨慎 · 避免战争 / 苦难 |
| `timezone` | `'Africa/Khartoum'` |
| `oneObservation` | 当下真实时刻的诗意观察 |
| `weather` | 真实 API 或占位 summary |

### 3.3 红层文案伦理规则（必须遵守）

> 来源：`design-freeze-log-v1.md §4.3` + `v2-phase15-fixes-report.md §1`

**§2.8.8-2.8.11 Red Layer Ethics**：

- ❌ **不展示**：军事 / 战争 / 苦难 / 死伤 / 武装冲突
- ❌ **不暗示**：援助 / NGO / 新闻报道视角
- ✅ **聚焦**：日常生活 / 街道 / 灯光 / 儿童 / 文化 / 食物 / 节庆
- ✅ **诗意**：克制 · 留白 · 不评价
- ✅ **一致**：Layer Red 与 Blue / Yellow 视觉一致 · 不特殊化

**当前已修文案**（参考 · v2-phase15-fixes-report.md §1）：

```diff
- 南郊 30 公里,一处军事据点在午后遭到第二轮炮击。当地志愿者正在转移伤员。
+ 街道的灯光在傍晚亮起,广场上有孩子经过。
```

### 3.4 Khartoum 验证脚本

```bash
# Gate C 前必跑
grep -rn "占位\|待补\|Red Layer · 占位" src/components/ src/data/cities.ts
# 期望: 0 匹配(Khartoum 真实数据)或仅"Coming soon"
```

---

## 4. "待补 · 占位" 标记全部清除（任务卡 §F · 检查项 3）

### 4.1 当前占位标记清单

> 来源：`check-placeholders.sh` 自动扫描 + 手动深度审计

| 文件 | 行号 | 内容 | LC 处理 |
|---|---|---|---|
| `src/components/HomeCoordinates.tsx` | 145 | `aria-label="Khartoum · 占位 · 待补"` | 删除 / "Coming soon" |
| `src/components/HomeCoordinates.tsx` | 151 | `(待补 · 占位)` | 删除 / "Coming soon" |
| `src/components/HomeCoordinates.tsx` | 191 | `(待补图)` | 删除 / 真实图 |
| `src/components/HomeWorldsCollide.tsx` | 118 | `(Red Layer · 占位)` | 删除 / 真实 Khartoum 文案 |
| `src/data/cities.ts:86`（注释）| — | `placeholder: 用系统级地理视觉 / Context 模式占位` | 仅注释 OK |
| `src/components/UniversalArrival.tsx` | — | `占位文案`（State E Empty LOCKED 设计性占位） | ✅ 保留 |
| `src/components/UniversalOneScene.tsx` | 24 | `占位结构(9/3 列骨架 + 文案引导)` | 仅注释 OK |
| `src/data/photoAssets.ts:139` | — | `Empty State 占位` | 仅注释 OK |
| `src/lib/cityPageRenderPlan.ts` | — | `render-empty` 决策 | ✅ LOCKED 设计性占位 |

### 4.2 验证方法

```bash
bash scripts/check-placeholders.sh
```

**期望**：Khartoum 占位 100% 修复或转为 "Coming soon"。

### 4.3 "Coming soon" 文案建议（选项 B · 备选）

```text
显示位置: HomeCoordinates 占位 cell
文案格式: 
  · 主标:"Coming soon"
  · 副标:"这座城市正在准备加入"
  · aria-label:"Khartoum · Coming soon"
  · 无(图待补)字样
```

---

## 5. Live Events 数据池（任务卡 §F · 检查项 5）

### 5.1 Live Events 当前 4 行（来源：`v2-phase15-report.md §Live Events`）

| 行 | 城市 | 当前文案 | 红层伦理 | LC 状态 |
|---|---|---|---|---|
| 1 | Berlin | "夏末的施普雷河..." | ✅ OK | ✅ |
| 2 | Reykjavík | "太阳即将落山..." | ✅ OK | ✅ |
| 3 | Kyoto | "祇园祭后..." | ✅ OK | ✅ |
| 4 | Lisbon | "电车 28 路..." | ✅ OK | ✅ |

### 5.2 ⚠️ 已修复内容（来源：`v2-phase15-fixes-report.md §2`）

**Gaza 条目**（已删除）：

```diff
- {
-   id: 'gaza',
-   cityZh: '加沙',
-   category: 'war',
-   categoryLabelZh: '战火',
-   textZh: '有人在废墟里翻找家人的照片。',
- }
+ {
+   id: 'marrakesh',
+   cityZh: '马拉喀什',
+   category: 'art',
+   categoryLabelZh: '艺术',
+   textZh: 'Jemaa el-Fnaa 广场上,铜壶被慢慢摆上木桌...',
+ }
```

### 5.3 Live Events 内容质量基线（V1 持续维护）

> 来源：`gate-a-visual-acceptance.md` · D-P0-06 任务卡

| 规则 | 描述 | 验证 |
|---|---|---|
| **时效性** | 每行反映"此刻" · 不放过期新闻 | Content 每天审核 |
| **来源标记** | 来自 Witness / Seed / Editorial 三类清晰标记 | E-P0-06 + Analytics |
| **避免争议** | 不放政治 / 战争 / 宗教争议话题 | Content Ops 红线清单 |
| **避红层伦理** | Khartoum 等 Layer Red 城市 → 严格 §2.8.8-2.8.11 | Design 红线 |
| **去新闻化** | 不是新闻流 · 不放标题党 | Design 红线 |
| **诗意克制** | 短句 · 留白 · 不评价 | Content 调性 |

### 5.4 Live Events 红线清单（建议 Content Ops 维护）

| 类别 | 禁止内容示例 |
|---|---|
| **新闻 / 头条** | 「突发」/「刚刚」/「官宣」等新闻语态 |
| **政治争议** | 选举 / 抗议 / 政策辩论 |
| **军事 / 战争** | 武装冲突 / 伤亡 / 武器（除非严格遵守 Red Layer Ethics）|
| **宗教争议** | 教派冲突 / 宗教审判 |
| **歧视 / 仇恨** | 任何指向种族 / 性别 / 性取向的贬损 |
| **援助 / NGO 视角** | 「施舍」/「帮助」/「拯救」 |
| **苦难审美** | 过度渲染贫穷 / 病痛 / 死亡 |
| **品牌 / 商业** | 任何商业品牌名（除文化地标固有名称）|

### 5.5 验证方法

```bash
# 1. 扫描 Live Events 数据池
cat src/data/liveMoments.ts

# 2. 检查红线关键词
grep -E "突发|刚刚|官宣|抗议|战火|加沙|Gaza|难民|施舍" src/data/liveMoments.ts
# 期望: 0 匹配

# 3. 检查 4 行覆盖不同 Layer（建议）
# Blue (平静) / Yellow (暖意) / Red (紧张但克制) / 自由
```

---

## 6. 文案时效（任务卡 §F · 隐含项）

### 6.1 文本时效检查

| 文案 | 当前 | LC 期望 | Owner |
|---|---|---|---|
| Hero 编辑元信息 | `17 AUG 2026 · 12 COORDINATES · EARTH DAY` | 当天日期 · 不锁死"17 AUG" | Design |
| Hero 副标 | "此刻,这颗行星上有 12 个远方正在同时运转..." | LOCKED ✓ | OK |
| Hero 4 角时间 | Tokyo / Lisbon / Reykjavík / Cape Town 动态 | 动态 · 实时 | Engineering |
| Live Events 副标 | "不是新闻流。是此刻的时间切片。远方 + 你,同时发生。" | LOCKED ✓ | OK |
| 12 Coordinates 标题 | "12 个 同时运转 的远方" | LOCKED ✓ | OK |
| Worlds Collide 标题 | "三座城市, 同一秒。" | LOCKED ✓ | OK |
| Earth Archive 时间轴 | "13.8B → 4.6B → 4.4B → 3.8B → 2.4B → 540M → 66M → 300K → NOW" | NOW 节点动态 · 实时 | Engineering |
| Earth Archive "YOU × 1 / 77,000,000" | 静态 | 动态（世界人口实时）| Engineering |
| Footer 版权 | `© 2026 SEE EARTH` | 当前年份 | Engineering |
| Privacy 页 "Last updated" | — | 当前日期（每月更新）| Privacy-Legal |

### 6.2 Hero 编辑元信息修复建议

```diff
- "17 AUG 2026 · 12 COORDINATES · EARTH DAY"
+ "{TODAY_ISO} · 12 COORDINATES · EARTH DAY"
```

实现：`new Date().toISOString().split('T')[0]` · 格式 `2026-08-24`

---

## 7. 与 AC 关系

| AC | 本清单覆盖 |
|---|---|
| AC #5 图片裁切 / 版权 / 来源 / alt 策略 | §1 + §2 + §5 |
| AC #10 无占位图 | §1 + §3 + §4 |
| 任务卡 §F 内容时效 5 项 | §1-§6 |

---

## 8. Gate C 签字要求

### 8.1 图源 / 城市数据

- [ ] 12 城 100% 数据完整（§2.1）
- [ ] 每城 4 张图 + imageCredit（§2.1）
- [ ] Khartoum 数据补齐（选项 A）或明确标 "Coming soon"（选项 B）
- [ ] 12 城 URL 100% 可达

### 8.2 占位文案

- [ ] `check-placeholders.sh` 输出 PASS
- [ ] 4 处 Khartoum 占位文案已修复
- [ ] 所有"待补 · 占位"标记已清除

### 8.3 Live Events 数据池

- [ ] 4 行内容质量符合 §5.3 基线
- [ ] 红线清单 0 命中
- [ ] 红层伦理（Khartoum / 任何 Red Layer 城市）合规

### 8.4 文案时效

- [ ] Hero 编辑元信息日期动态化
- [ ] Footer 版权年份正确
- [ ] Privacy 页 Last updated 当前日期

### 8.5 红层伦理

- [ ] Khartoum 文案遵守 §2.8.8-2.8.11
- [ ] 红层城市无苦难审美 / 无 NGO 视角
- [ ] 全数据池 0 战争 / 军事 / 苦难文案

---

**End of content-freshness-v1.md**
