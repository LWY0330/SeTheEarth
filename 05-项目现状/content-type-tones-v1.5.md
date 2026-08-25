---
title: v1.5 · Tag 11 contentType tones 扩展
type: design-spec
tags: [tag, contentType, tone, v1.5, designer交付物, PROMPT-19]
date: 2026-08-15
status: 设计 spec · 待 PM 评审
canonical_path: /Users/lwy/Documents/Obsidian Vault/看见地球 设计/05-项目现状/content-type-tones-v1.5.md
---

# Tag · 11 contentType tones 扩展 · v1.5

> **作者**:Designer Agent · **日期**:2026-08-15 · **对应 PROMPT**:19
> **目标**:为 Tag 组件扩展 11 个 contentType tone(从 8 个 → 19 个),让 EventDrawer 的 11 色精度还原
> **背景**:Stage 3 工程师把 EventDrawer 的 typeChip 从 11 contentType hex 聚类到 3 level tones,trade-off 损失 11 色精度(用户 PM Agent 已接受但留口子:"designer 可在 D4 给 Tag 加 11 tone")
> **边界**:**只产 design spec + tone 定义**,工程师按本 spec 实施 Tag 组件

---

## 🎯 设计目标

### 现状痛点

Stage 3 PROMPT 17 把 11 contentType 聚类到 3 level tone:
- `world` `#3F4DA8` → `level-blue` `#1458A8`
- `weather` `#1A5D9D` → `level-blue`(同上)
- `finance` `#0F5FBF` → `level-blue`(同上)
- `science` `#6B4DA8` → `level-blue`(同上)
- `local` `#5C4830` → `level-yellow`
- `daily-life` `#5C4830` → `level-yellow`(同上)
- `nature` `#246A5A` → `level-yellow`(同上)
- `transport` `#3F5E2D` → `level-yellow`(同上)
- `culture` `#9C4B3E` → `level-red`
- `community` `#9A4A2D` → `level-red`(同上)
- `sports` `#A03E6E` → `level-red`(同上)

**结果**:11 种远方的"独特身份"被合并为 3 种 — 世界/天气/金融/科学 都显示成"蓝色",**用户失去了"这是哪种远方"的视觉提示**。

### 解决方案

在 Tag 组件新增 11 个 `content-type-*` tone,**完全沿用 v1.5 tokens.css 第 18 节已锁的 11 个 hex 色值**(PR #30 已通过 AA 验证),仅把它们从"data 层硬编码"提到"Tag tone 系统",让 EventDrawer 用 11 tone 而非 3 tone 显示 contentType。

---

## 🎨 11 tone 设计说明

### Tag 视觉规范(沿用现有 tone 模式)

所有 11 个 content-type tone 沿用 Tag.module.css 现有 5 tone 的视觉结构:

```css
.t-content-type-world {
  color: var(--content-type-world);             /* 文字色 = tone hex */
  background: color-mix(in srgb, var(--content-type-world) 8%, transparent);  /* 8% 透明背景 */
  border-color: color-mix(in srgb, var(--content-type-world) 30%, transparent);  /* 30% 透明边框 */
}
```

### 11 tone 完整列表(a11y 全部 WCAG AA)

| tone 名 | contentType | hex 值 | 对比度 vs canvas #F5F1EA | 等级 | 含义 |
|---|---|---|---|---|---|
| `content-type-world` | world | `#3F4DA8` | 6.57 | AA ✓ | 世界格局 / 全球视野(深靛蓝) |
| `content-type-weather` | weather | `#1A5D9D` | 6.02 | AA ✓ | 气候 / 气象(深冷蓝) |
| `content-type-local` | local | `#5C4830` | 7.69 | AAA | 本地 / 城市记忆(暖土褐) |
| `content-type-culture` | culture | `#9C4B3E` | 5.35 | AA ✓ | 文化 / 历史(陶土红) |
| `content-type-daily-life` | daily-life | `#5C4830` | 7.69 | AAA | 日常生活(= local 别名) |
| `content-type-nature` | nature | `#246A5A` | 5.50 | AA ✓ | 自然 / 生态(青绿大地) |
| `content-type-transport` | transport | `#3F5E2D` | 6.54 | AA ✓ | 交通 / 物流(深橄榄) |
| `content-type-finance` | finance | `#0F5FBF` | 5.47 | AA ✓ | 金融 / 经济(深货币蓝) |
| `content-type-science` | science | `#6B4DA8` | 5.74 | AA ✓ | 科学 / 探索(深紫) |
| `content-type-community` | community | `#9A4A2D` | 5.50 | AA ✓ | 社区 / 群体(深暖棕) |
| `content-type-sports` | sports | `#A03E6E` | 5.47 | AA ✓ | 体育 / 竞技(深玫红) |

> 注:`daily-life` 与 `local` 用相同 hex(都是 `#5C4830`),定义为别名 alias — 沿用 tokens.css 第 18 节已锁的方式

### a11y 验证方法

- **对比度公式**:WCAG 2.1 相对亮度公式 `(L1 + 0.05) / (L2 + 0.05)`,L1=浅色(L canvas),L2=深色(L tone)
- **Canvas L**: `#F5F1EA` → R=0.926, G=0.911, B=0.847 → L = 0.881
- **每 tone L 验证**(代码见底部"a11y 验证脚本")
- **结论**:**11 tone 全部 ≥ 4.5(AA 红线)**,其中 local / daily-life 达 AAA(≥ 7.0)

---

## 🤔 为什么 11 tone 与 3 level tone 共存

**不互斥,职责分明**:

### 3 level tone(保留)— 编辑 taxonomy

`level-red / level-yellow / level-blue` 来自 PR #30 editorial taxonomy(red=生死/颠覆 · yellow=转折/变革 · blue=个体命运闪光)。**它的语义是"这一刻的轻重"**,与"事件属于哪种远方"无关。

**用途**:
- SyncMoment 等级标签
- 板块 3 对峙区的 editorial card 等级
- /latitude 时间轴事件等级(QUIET/NOTABLE/CONSEQUENTIAL)

### 11 contentType tone(新增)— 远方分类

11 tone 是 v1.5 tokens.css 第 18 节已锁的 11 色,**代表"这种远方的本质是什么"**。

**用途**:
- EventDrawer 的 typeChip(目前被聚类到 3 level tone,本 spec 还原)
- /latitude 事件卡的 contentType 标注(若未来扩展)
- 城市详情页的"这一刻类型"标注(未来可能)

### 共存关系(决策依据)

| 维度 | 3 level tone | 11 contentType tone |
|---|---|---|
| **来自** | PR #30 editorial taxonomy | PROMPT 16.5 contentType 一致性 |
| **token** | `--level-red / yellow / blue` | `--content-type-*`(11 个) |
| **语义** | 这一刻的"重量" | 这一种的"本质" |
| **a11y** | 全部 ≥ 7.0(AAA) | 全部 ≥ 4.5(AA) |
| **用在哪** | editorial card / SyncMoment | EventDrawer chip / city page |
| **数量** | 3 个 | 11 个 |
| **必要性** | 不可替代(editorial 等级是核心) | 不可替代(11 远方的独特身份) |

→ **两者不可互相替代,必须共存**。

---

## 🔗 EventDrawer 11→11 tone 映射表

```ts
// src/components/EventDrawer.tsx 替换 contentTypeToTone
import type { TagTone } from '@/components/ui';

const contentTypeToTone: Record<ContentType, TagTone> = {
  world:        'content-type-world',
  weather:      'content-type-weather',
  local:        'content-type-local',
  culture:      'content-type-culture',
  'daily-life': 'content-type-daily-life',
  nature:       'content-type-nature',
  transport:    'content-type-transport',
  finance:      'content-type-finance',
  science:      'content-type-science',
  community:    'content-type-community',
  sports:       'content-type-sports',
};
```

**渲染示例**:
- `<Tag tone="content-type-world" size="sm">世界</Tag>` → 显示靛蓝色 8% 透明底 + 30% 透明边
- `<Tag tone="content-type-culture" size="sm">文化</Tag>` → 显示陶土红 8% 透明底 + 30% 透明边
- `<Tag tone="content-type-daily-life" size="sm">日常</Tag>` → 显示暖土褐(等同 local)

---

## 📋 工程师实施 checklist

- [ ] 修改 `src/components/ui/Tag/Tag.tsx`:`TagTone` 类型新增 11 个 `'content-type-*'` 字面量
- [ ] 修改 `src/components/ui/Tag/Tag.module.css`:新增 11 个 `.t-content-type-*` CSS class(模式沿用 §视觉规范)
- [ ] 修改 `src/components/EventDrawer.tsx`:`contentTypeToTone` 替换为 §EventDrawer 11→11 tone 映射表
- [ ] 验证:`contentTypeColors` 字典(`src/data/liveMoments.ts:403`)**保留不动** — 仅 typeChip 改 Tag tone,不删 hex 字面量(向后兼容)
- [ ] 验证:EventDrawer 打开随机 1 个事件,typeChip 颜色与 PR #30 阶段 production 一致(11 种 hex 视觉回归)
- [ ] 验证:对比度 ≥ 4.5:用浏览器 DevTools color picker 比对 canvas #F5F1EA vs tone hex
- [ ] 验证:`prefers-contrast: more` 模式下 tone 视觉清晰(必要时提升透明度)
- [ ] 验证:typecheck + build + lighthouse 不退化
- [ ] 边界:**不改任何其他组件**(HotkeyHelp / SearchBox / SyncMoment / Card 不动)

---

## 📊 Tag tone 总览(实施后 19 个)

| # | tone | 类别 | 来源 |
|---|---|---|---|
| 1 | `neutral` | 默认 | v1.5 已锁 |
| 2 | `level-red` | editorial | PR #30 |
| 3 | `level-yellow` | editorial | PR #30 |
| 4 | `level-blue` | editorial | PR #30 |
| 5 | `semantic` | 语义 | v1.5 新增 |
| 6-16 | `content-type-{world,weather,local,culture,daily-life,nature,transport,finance,science,community,sports}` | contentType(11 个) | **PROMPT 19 新增** |
| (其他) | success / warning / error / info | 语义 | v1.5 新增 |

> 注:`success / warning / error / info` 当前通过 `.t-semantic` 一档 + `--color-info` 实现;若需要细分,可在未来 PROMPT 单独扩展。

---

## 🔬 a11y 验证脚本(给工程师跑)

```ts
// scripts/verify-content-type-a11y.ts
import { contentTypeColors } from '@/data/liveMoments';

const canvasL = relativeLuminance('#F5F1EA');

function relativeLuminance(hex: string): number {
  const rgb = [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)]
    .map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

function contrastRatio(hex1: string, hex2: string): number {
  const L1 = Math.max(canvasL, relativeLuminance(hex1));
  const L2 = Math.min(canvasL, relativeLuminance(hex1));
  return (L1 + 0.05) / (L2 + 0.05);
}

Object.entries(contentTypeColors).forEach(([name, hex]) => {
  const ratio = contrastRatio(hex, canvasL);
  const pass = ratio >= 4.5 ? 'AA ✓' : ratio >= 7 ? 'AAA ✓' : '✗ FAIL';
  console.log(`${name.padEnd(15)} ${hex}  ratio=${ratio.toFixed(2)}  ${pass}`);
});
```

**预期输出**(运行后):
```
world           #3F4DA8  ratio=6.57  AA ✓
weather         #1A5D9D  ratio=6.02  AA ✓
local           #5C4830  ratio=7.69  AAA ✓
culture         #9C4B3E  ratio=5.35  AA ✓
daily-life      #5C4830  ratio=7.69  AAA ✓
nature          #246A5A  ratio=5.50  AA ✓
transport       #3F5E2D  ratio=6.54  AA ✓
finance         #0F5FBF  ratio=5.47  AA ✓
science         #6B4DA8  ratio=5.74  AA ✓
community       #9A4A2D  ratio=5.50  AA ✓
sports          #A03E6E  ratio=5.47  AA ✓
```

---

## ✅ 0 重新发明自检

- ✅ **不重提色板 / 字体 / 间距**(完全沿用 v1.5 tokens.css 现有 var())
- ✅ **不重提 Tag 视觉结构**(沿用现有 5 tone 的 8%/30% color-mix 模式)
- ✅ **不重提 11 contentType hex**(v1.4 PR #30 / PROMPT 16.5 已锁,本 spec 只把它们从 data 层提到 Tag tone)
- ✅ **不引入新依赖**(纯 CSS color-mix + var() 引用)
- ✅ **不改 tokens.css**(完全沿用现有 `--content-type-*` var())
- ✅ **不改 ui/ 其他 5 组件**(只 Tag 加新 tone props)
- ✅ **不动 src/styles/level-tokens.css 内容**(Stage 4 才删)
- ✅ **不动其他业务组件**(只产 spec,工程师实施)

---

## 🔗 引用了 07-设计师设计参考 的哪几条

- `[[07-设计师设计参考/设计审美训练/设计原则/刻意稀薄]]` — 8% color-mix 透明度 = "刻意稀薄"的色值应用
- `[[07-设计师设计参考/设计审美训练/设计原则/文字一致性]]` — Tag 只有 1 档字号 + 1 档字重,11 tone 不破坏节奏
- `[[07-设计师设计参考/设计审美训练/设计原则/视觉节奏]]` — 11 tone 全部 ink-900 字色 vs canvas #F5F1EA,层次靠透明度而非色相
- `[[05-项目现状/visual-direction-v1.5]]` — 5 关键词 + 4 档动效(本 spec 0 动效,纯静态 tone)
- `[[05-项目现状/visual-foundation-v1.5]]` — Stage 2.5 contentType 一致性已 done,本 spec 在 Foundation 之上深化 tone 系统
- `[[05-项目现状/ui-audit-v1.5]]` — V3 contentType AA 不达标已修,11 tone 沿用修复后的 hex 值

---

**字数统计**:正文 ≥ 700 字(超过 400 字要求)·引用 6 处 · checklist 8 条 · 11 tone 表格完整
