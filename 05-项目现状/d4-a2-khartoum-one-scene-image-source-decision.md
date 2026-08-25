---
title: Khartoum One Scene 图源决策 · 2026-08-19
type: pm-decision-decided
tags: [khartoum, one-scene, image-sourcing, red-layer, decided, v10]
created: 2026-08-19
decided: 2026-08-19 14:00 (用户拍板)
sender: 2026-08-19 接管 PM Agent
receiver: 用户 → 内部 Designer Agent
status: ✅ 决策完成 · C 选项 + B 文案 · v10 图已生成
decision:
  option: C (用用户提供的公寓楼图 + 改写 One Scene 文案)
  copy: B ("一栋公寓楼 · 今天很安静")
  image: outputs/a2-visual-assets/khartoum-real-apartment-v1-final.png (1920×1080,旋转 + 裁剪 + 放大后)
---

# Khartoum One Scene 图源决策 · 2026-08-19

> **背景**:PROMPT 31 One Scene v9 占位方案已就绪(深暖棕 gradient + PLACEHOLDER),等 PM 补真图
> **约束**:§2.8.9 Red/Major Event 必须 Reuters / AP / Adobe Editorial / Shutterstock Editorial / Wikimedia Commons(不用 Unsplash)
> **伦理**:§2.8.8 Red Layer Image Ethics — 不猎奇 / 不美化苦难 / 优先生活仍在继续
> **PM 测试结果**:Codex 沙箱 DNS 受限,web fetch 不可行(commons.wikimedia.org / api.unsplash.com / google.com 全部 resolution failed)

---

## 🎯 3 个选项(PM 评估)

### 选项 A · 用户提供真摄影 ⭐ 推荐

**做法**:您 8/19-20 自行在沙箱外找 1 张喀土穆小商铺外景真摄影

**来源**:
- ✅ **Wikimedia Commons**(免费,CC 许可)— 推荐用此
- Reuters / AP / Adobe Editorial(付费订阅,通常无 web 公开访问)

**筛选标准**:
- 16:9 横版,1920×1079 或更高
- 暖色调(适配 Red Layer 暖暗棕 overlay)
- 场景:小商铺外景(关闭的店门)/ 街道下午(空荡街景)/ 南部街区日常
- ❌ 不要:战争 / 武器 / 难民 / 政治标语 / 完全黑夜

**提交方式**:
- 您把图给我,我存到 `outputs/a2-visual-assets/khartoum-real-shop-v1.jpg`
- 我替您填 12 字段 metadata(您告诉我 photographer / license / source_url 即可)

**PM 我的工作**:图源到了后,我立即:
1. 写 `outputs/a2-visual-assets/khartoum-real-shop-v1.jpg`
2. 填 12 字段 metadata
3. 更新 `outputs/v1.5-mockups/d4-a2-khartoum-round3/02-one-scene-v9.html` 的 background-image URL
4. 删 PLACEHOLDER div
5. 重新截图 v10 mockup
6. 触发 round 10 全页 QA(已在 round 8 prompt 中预留)

**优点**:最准 / 最快 / 您对图源敏感度高于 PM
**缺点**:占您时间(预计 30-60 分钟)

### 选项 B · PM 反查 Wikimedia Commons ❌ 不可行

**做法**:我用 web fetch 检索 Wikimedia Commons Khartoum 街道图

**实测**:**❌ 不可行**
- Codex 沙箱 DNS 完全受限(`commons.wikimedia.org` 解析失败)
- 我没有 web 工具(只有 shell `curl`,网络不可达)
- 必须由沙箱外执行

**结论**:此选项排除

### 选项 C · 接受 v9 SVG 占位 🎯 兜底方案

**做法**:不换图,用 v9 深暖棕 gradient + 几何抽象(沙漠傍晚 + 关上的商铺 + 远处 1 人 1 车)

**来源**:已在 `outputs/v1.5-mockups/d4-a2-khartoum-round3/02-one-scene-v9.html` 实现

**优点**:
- 0 资源负担(0 元数据要补)
- 0 伦理风险(纯抽象,无真摄影)
- 已通过内部 7 维度 QA(5/5)
- 不影响 Khartoum LOCK 决策(只是图源"接受抽象而非真摄影")

**缺点**:
- 不像真摄影(用户能看到是抽象)
- 与 Hero 真摄影视觉风格不一致(Hero 真摄影 vs One Scene 抽象)
- 失去"4 屏都用真摄影"的视觉一致性(但 Kyoto v5 的 Hero + One Scene 也是混合:京都 Hero 真摄影 + One Scene 也是占位)

**接受场景**:
- 您时间紧 / 不愿花时间找图
- Khartoum 是 Red Layer,SVG 抽象其实符合"克制观察"原则
- 反过来,设计师曾说过"Red Layer Unsplash 几乎 0 可用" — 抽象是已知妥协

### 选项 D · 用 Hero 同款尼罗河日落图(变体 crop)

**做法**:把 Hero 的 `khartoum-real-nile-sunset.jpg` 做不同 crop,放到 One Scene

**优点**:0 资源负担,有视觉一致性
**缺点**:
- 同一张图 2 个屏,违反"4 屏不同视觉"
- Hero 已经展示城市全貌,One Scene 再放同一图变体无新信息
- One Scene 文案是"小商铺没开门"街道级,与 Hero 城市全景尺度不匹配
- 评分会更低

**不推荐**

---

## 💡 PM 我的建议

**先 A(您找图),保留 C(抽象占位)作 fallback**

理由:
- Wikimedia Commons 有 Khartoum 街道公开图(英文搜 "Khartoum street" / "Omdurman market")
- 30-60 分钟能找到合适图
- 真摄影视觉一致性 > 抽象占位
- 12 字段 metadata 是必填项,正好补 Hero 缺的 source_url / photographer / license 等

如果您:
- 时间紧 / 不想找图 → 选 C(接受 SVG 抽象)
- 想快速锁 Khartoum → 选 C

如果您:
- 想保持视觉一致性 → 选 A
- 想展示 Red Layer 真实克制观察 → 选 A

---

## 📋 12 字段 metadata 模板(选项 A 时填)

```yaml
asset_id: khartoum_real_shop_v1
city: Khartoum
country: Sudan
source: # 您告诉我(Wikimedia Commons / Reuters / AP 具体哪个)
source_url: # 您提供原始 URL
photographer: # 您告诉我
date: # 拍摄日期(您能查到的)
resolution: # 您给图尺寸
license: # CC BY-SA / CC BY / editorial use 等
editorial_only: true  # Red Layer 必 true
credit_requirement: # 图注/ALT 文本用
usage_restriction: Khartoum City Detail One Scene only
content_description: 喀土穆小商铺外景(关闭的店门 + 真实街景 + 下午光线)
```

---

## ⏰ 时间敏感性

- **Khartoum LOCK 决策**:等 One Scene 图源确定后,designer 替换 → 外部设计师 round 10 → 锁
- **Yellow Layer 启动**:Khartoum LOCK 后立即启动(Lisbon 候选)
- **3 周路线图**:本周锁 Khartoum → 下周 Lisbon → 再下周 DS v1.3

**PM 当前可并行推进**:
- One Scene 图源决策(本决策)
- Hero 12 字段 metadata 补 8 字段(等用户给 Hero 图源信息)
- 工程师 PR 拆解草案(代码层,Khartoum mockup LOCKED 后启动)
- PROMPT 32 起草(Lisbon,Khartoum LOCK 后立即用)

---

## 🎬 您拍板后我的立即动作

| 选项 | 我的动作 |
|---|---|
| A(您给图) | 存图 → 填 metadata → 替换 v9 → 触发 round 10 |
| C(接受 SVG) | 把 v9 升级为 v10 FINAL(删 PLACEHOLDER div,改注释 "FINAL SVG 占位")→ 触发 round 10 |
| B(网络受限) | 排除 |

**请直接回复 A / C,或您的新方案**。

---

## ✅ 决策记录(2026-08-19 14:00)

**用户拍板**:**选项 C + 文案 B**

| 决策项 | 选择 |
|---|---|
| 图源 | C · 用户提供的公寓楼图 |
| 文案 | B · "15:53, / 喀土穆南部。/ 一栋公寓楼 / 今天很安静。" |
| 图处理 | 旋转 90° + 裁剪到 1920×1080 + LANCZOS 放大 |

### 已生成文件
- `outputs/a2-visual-assets/khartoum-real-apartment-v1.png`(原图,1035×1380)
- `outputs/a2-visual-assets/khartoum-real-apartment-v1-rotated.png`(旋转后,1380×1035)
- `outputs/a2-visual-assets/khartoum-real-apartment-v1-final.png`(最终,1920×1080,2.1 MB)
- `outputs/a2-visual-assets/khartoum-real-apartment-v1-final.jpg`(JPG 副本,451 KB)

### Designer 待办
按 `05-项目现状/d4-a2-khartoum-one-scene-v10-replacement-spec.md` 替换 v9 → v10

