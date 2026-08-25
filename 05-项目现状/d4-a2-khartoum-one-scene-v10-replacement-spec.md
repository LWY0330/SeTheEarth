---
title: PROMPT 32 v1 · Khartoum One Scene v10 替换说明(用户选图 + 文案)
type: design-spec
tags: [d4-a2-khartoum, one-scene, v10, user-provided-image, prompt-32, red-layer]
date: 2026-08-19
status: PM 已拍板 · 待 designer 替换 v9 → v10
sender: 2026-08-19 接管 PM Agent
receiver: 内部 Designer Agent
canonical_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/d4-a2-khartoum-one-scene-v10-replacement-spec.md
related_docs:
  - /Users/lwy/Documents/ChatGPT/看见地球/05-项目现状/d4-a2-khartoum-round3-pm-review.md (PM 评审 ACCEPTED)
  - /Users/lwy/Documents/ChatGPT/看见地球/05-项目现状/d4-a2-khartoum-round3.md (PROMPT 31)
  - /Users/lwy/Documents/ChatGPT/看见地球/05-项目现状/d4-a2-khartoum-one-scene-image-source-decision.md (图源决策)
  - /Users/lwy/Documents/ChatGPT/看见地球/outputs/a2-visual-assets/khartoum-real-apartment-v1.png (用户提供的图)
---

# PROMPT 32 v1 · Khartoum One Scene v10 替换说明

> **作者**:PM Agent · **日期**:2026-08-19 · **PROMPT**:32 v1
> **目标**:把 v9 占位(深暖棕 gradient + PLACEHOLDER)替换为 v10 真摄影 + 改写文案
> **边界**:**只动 One Scene**,Hero 已 LOCKED 不动,Same Second / Echo / 4 屏 Pattern / LOCAL-YOUR-+5H 不动
> **触发**:用户 8/19 14:00 拍板 — 选项 C + 文案 B

---

## 🎯 任务(2 件事)

### 任务 1:One Scene 图替换 v9 → v10

**原 v9**:
- 图源:深暖棕 gradient + "◌ PLACEHOLDER · PM 待补真图(喀土穆小商铺)"
- HTML: `outputs/v1.5-mockups/d4-a2-khartoum-round3/02-one-scene-v9.html`

**新 v10**:
- 图源:用户提供的公寓楼图(已保存)
- 路径: `outputs/a2-visual-assets/khartoum-real-apartment-v1.png`
- 原始尺寸:**1035×1380(4:5 竖向)**
- **必须旋转 90°** → 横图(详见 §3 操作)
- 替换方法:
  1. 用 ImageMagick 旋转 90° + 裁剪到 1920×1080
  2. 替换 v9.html 的 `background-image: url(...)` URL
  3. 删除 PLACEHOLDER div
  4. 暖暗棕 overlay 调整(原占位是 gradient;真图需要暗 gradient 在左侧文字安全区)
  5. 文字位置不动(图本身已适配 9 列 + 3 列留白)

### 任务 2:One Scene 文案改写 v8 → v10

**v8 文案**(已通过 round 9 验证,但与原图不符):
> "15:53,/ 喀土穆南部。/ 一家小商铺 / **今天没开门**。"

**v10 新文案**(PM 8/19 拍板,选项 B):
> "15:53,/ 喀土穆南部。/ 一栋公寓楼 / **今天很安静**。"

**改写依据**:
- §2.8.7 Image / Copy Matching Rule:图文高度一致
- 图是"多层公寓楼",文案对应"一栋公寓楼"
- "今天很安静" 保持 v8 的"反日常"句式,4 行节奏不变
- §2.8.8 Red Layer Image Ethics:
  - ✅ 不猎奇 / 不美化苦难 / 0 人物面部 / 0 武器
  - ✅ 暖色调适配(暖棕色外墙)
  - ✅ 普通住宅楼,日常化

**新文案与 v8 区别**:
| 维度 | v8 | v10 |
|---|---|---|
| 主体 | 一家小商铺 | 一栋公寓楼 |
| 反常动作 | 今天没开门 | 今天很安静 |
| 文学化程度 | 具体(开门/关门)| 抽象(安静)|
| §2.8.6 一个具体状态 | ✅ 小商铺关门 | ⚠️ 公寓楼安静(略抽象) |
| §2.8.7 图文一致 | ❌ 与 v8 Image A 不符 | ✅ 与 v10 公寓楼图对位 |

**PM 备注**:新文案"今天很安静"略文学化,设计师如认为需要更具体,可以微调到"今天没动静"或"今天没开灯",等设计师判断。

---

## 📐 ImageMagick 操作步骤(PM 已验证)

### 步骤 1:旋转 90° + 裁剪到 1920×1080(16:9)

```bash
cd /Users/lwy/Documents/ChatGPT/看见地球/outputs/a2-visual-assets/

# 旋转 90° 顺时针(把仰拍变侧拍)
convert khartoum-real-apartment-v1.png \
  -rotate -90 \
  khartoum-real-apartment-v1-rotated.png
# 旋转后:1380×1035(横向 4:3)

# 裁剪到 1920×1080(16:9)
# 1380×1035 → scale up + crop center to 1920×1080
convert khartoum-real-apartment-v1-rotated.png \
  -resize 1920x \
  -gravity center \
  -crop 1920x1080+0+0 \
  +repage \
  khartoum-real-apartment-v1-final.png

# 验证
file khartoum-real-apartment-v1-final.png
# 期望:PNG image data, 1920 x 1080
```

### 步骤 2:评估放大效果

⚠️ **警告**:原图 1035×1380 → 旋转后 1380×1035 → 放大到 1920×1080 = **1.4× 放大**。  
这种放大可能产生轻微模糊。designer 需评估:
- ✅ 可接受:轻微软糊可接受(暖色调 + 阳台细节丰富,模糊感反而有"老照片"质感)
- ❌ 不可接受:升级备选方案 — 找别的真摄影

**如不可接受,fallback**:
- 保留用户图作为 cities.ts images.street 缩略图(竖向直接用)
- One Scene 回到 v9 占位,等 Wikimedia 真摄影

### 步骤 3:替换 v9.html 的 URL

```html
<!-- v9 (原占位) -->
<div class="oneScenePlaceholder">◌ PLACEHOLDER · PM 待补真图</div>

<!-- v10 (新) -->
<!-- 删除上面 div -->
<!-- background-image 改为 url('...khartoum-real-apartment-v1-final.png') -->
```

---

## 🖼️ 12 字段 metadata(v10)

```yaml
asset_id: khartoum_real_apartment_v1
city: Khartoum
country: Sudan
source: ⚠️ 用户提供 2026-08-19,出处待补
source_url: ⚠️ 待补
photographer: ⚠️ 待补
date: 2026-08-19 (用户提供日)
resolution: 1920×1080 (16:9,旋转 + 裁剪 + 放大后)
original_resolution: 1035×1380 (4:5 竖向原图)
license: ⚠️ 待补
editorial_only: ⚠️ 待确认 (Red Layer 必 editorial)
credit_requirement: ⚠️ 待补
usage_restriction: Khartoum City Detail One Scene only
content_description: 多层公寓楼侧拍(原仰拍旋转 90°)+ 棕榈树叶 + 蓝天 + 暖棕色外墙 + 多层阳台 + 底部有 1 个深色门
proposed_role: One Scene v10 替换图
```

---

## ✅ LOCKED 不动(本轮也未动)

- ✅ 4 屏 Pattern(Arrival / One Scene / Same Second / Echo)
- ✅ LOCAL / YOUR / +5H 时间排版
- ✅ Hero(8/18 LOCKED)
- ✅ Same Second 文案
- ✅ Echo 5 项基础元素 + 5 个状态
- ✅ Direction A2 / VF 1.2

---

## ⏸ 不做的事(明确 STOP)

- ❌ 不重做 Hero(已 LOCKED,8/18)
- ❌ 不重做 4 屏 Pattern
- ❌ 不改 LOCAL / YOUR / +5H
- ❌ 不改 Same Second
- ❌ 不改 Echo(5 态)
- ❌ 不做 Yellow Layer 城市(Lisbon 下一轮)
- ❌ 不动 A2 / VF 1.2
- ❌ 不引入新依赖
- ❌ 不动 src/data/cities.ts(代码实现,Khartoum mockup LOCKED 后工程师独立 PR)
- ❌ 不动 src/components/CityPage.tsx(同上)

---

## 📦 交付物(预计)

| 文件 | 状态 |
|---|---|
| `outputs/a2-visual-assets/khartoum-real-apartment-v1-final.png`(旋转 + 裁剪 + 放大后) | 待生成 |
| `outputs/v1.5-mockups/d4-a2-khartoum-round3/02-one-scene-v10.html`(替换 v9) | 待生成 |
| `outputs/v1.5-mockups/d4-a2-khartoum-round3/02-one-scene-v10-desktop.png`(截图 1440×900) | 待生成 |
| `outputs/v1.5-mockups/d4-a2-khartoum-round3/02-onescene-qa-v10-{1440,1680,1920}.png`(3 breakpoint QA) | 待生成 |
| `05-项目现状/d4-a2-khartoum-one-scene-v10.md`(designer 交付报告) | 待生成 |

**预计文件数**:5 个图 + 2 个 HTML + 1 个报告 = 8 文件

---

## 🎯 触发后续动作(自动)

v10 替换完成后,PM Agent 立即触发:
1. **round 10 全页 QA 转发外部设计师**(round 8 prompt 已在 Obsidian,直接复用 + 标注 v10)
2. **Hero 12 字段 metadata 同步补 8 字段**(用户 8/19 给的图也是同样模式,需 source_url 等)
3. **Khartoum City Detail LOCKED**(等外部设计师 round 10 反馈)
4. **启动 Yellow Layer PROMPT 32 起草**(Lisbon 4 屏)

---

## 📎 关联文档

- `05-项目现状/d4-a2-khartoum-round3.md`(PROMPT 31 原报告)
- `05-项目现状/d4-a2-khartoum-round3-pm-review.md`(PM 评审 ACCEPTED)
- `05-项目现状/d4-a2-khartoum-one-scene-image-source-decision.md`(图源决策 C+B)
- `05-项目现状/d4-a2-khartoum-final.md`(Hero FINAL 锁定参照)
- `07-设计师设计参考/SEE_EARTH_DESIGN_SYSTEM_v1.2_Complete_Spec.md` §2.8.6/8.7/8.8
- `07-设计师设计参考/前端设计规则/A2 视觉 QA round 8 — Khartoum One Scene 图源 + 全页 QA 锁评估 prompt.md`(待发外部设计师)
- `06-PM Agent 交接/2026-08-19-engineer-pr-plan.md`(工程师 PR 计划)

---

**PM Agent 拍板**:C + B · 等 designer 替换 v9 → v10 · 完成后触发 round 10
