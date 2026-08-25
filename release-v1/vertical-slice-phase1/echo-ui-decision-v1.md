---
title: SEE EARTH V1 · Echo UI Decision · Phase 1 (OD-01)
type: ui-decision
tags: [release-v1, e-p0-02, echo, od-01, remove-ui, see-earth]
task_id: E-P0-02
phase: Phase 1 · Vertical Slice
dispatched_at: 2026-08-22
status: DRAFT · IN REVIEW
author: Engineer Agent (Round 2B)
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/vertical-slice-phase1/echo-ui-decision-v1.md
source_inputs:
  - PM 2026-08-22 OD-01 (REMOVE Echo UI)
  - release-v1/web-v1-flow/sitemap-v1.md §1.1 P0-7 (Privacy page)
  - release-v1/minimal-witness/copy-final-v1.md
  - src/components/ui/EchoInput.tsx (current state)
  - src/components/UniversalEcho.tsx (current state)
  - release-v1/api-contract/zod-schemas/echo.ts
  - release-v1/backend-reality-audit-v1.md §5.6 (fake success risk)
---

# SEE EARTH V1 · Echo UI Decision · Phase 1 (OD-01)

> **作者**：Engineer Agent（Round 2B · Phase 1 子集）
> **目标读者**：PM Agent（验收）、Web 工程师、Designer
> **任务卡**：E-P0-02 Launch Vertical Slice（Phase 1 子集 · §F）
> **PM 决议**：**OD-01** = Echo backend V1 范围 = **REMOVE UI**（消除假成功风险，与 Brief §E-P1-01 一致）
> **决策日期**：2026-08-22

---

## 0. 一句话结论

**Phase 1 Echo UI 决策 = 保留 UI 但禁用提交能力（推荐方案 A）**：CityPage Screen 04 Echo 区域显示提示文案 "Echo 暂未开放 · 我们正在准备安全的接收渠道" + 灰色 textarea（disabled / readonly）+ 不显示 submit button。理由：保留 UniversalCityPage LOCKED 4 屏布局（不破坏 22 设计 LOCKED），同时彻底消除"提交成功"的假象（满足 OD-01 核心要求）。完全下架（方案 B）破坏设计 LOCK，不采纳。**

---

## 1. 当前状态评估

### 1.1 `src/components/ui/EchoInput.tsx` 当前行为

```typescript
// src/components/ui/EchoInput.tsx · 现状（v1.6.4）
const [internalState, setInternalState] = useState<EchoInputState>('default');
const [text, setText] = useState('');

// 用户可输入文字 + 点击 submit
// onClick 后：
//   - if (text.trim().length === 0) return;
//   - onSubmit?.(text);
//   - setInternalState('submitted');  // ← 假成功！仅本地 setState，无网络请求
```

**关键问题**：

- ✅ `EchoInput` 是 **纯 UI 组件**，无任何网络请求
- ❌ 但用户点击 submit 后 → 立即显示"已记录 ✓"对勾（fake success）
- ❌ 用户相信"echo 已记录"，实际未保存到任何 backend
- ❌ 违反 D-P0-05 analytics event map（"echo_submitted" 事件未发生）
- ❌ 违反 `forbidden-fields-v1.md`（free text PII 风险）

### 1.2 `src/components/UniversalEcho.tsx` 当前行为

```typescript
// src/components/UniversalEcho.tsx · 现状（v1.6.2）
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  if (text.trim().length === 0) return;
  setInternalState('submitted');  // ← 同样 fake success
  onSubmit?.(text);
};
```

**完全相同的问题**：仅本地 setState 切换为 submitted 显示对勾，**无网络请求**。

### 1.3 `EchoInput.test.tsx` 已有 6 状态测试

- default / hover / focus / active / success / disabled
- "success" 状态 = 假成功，测试仅验证 UI 切换，**不验证 backend 提交**

---

## 2. OD-01 决议全文（PM 2026-08-22）

> **OD-01** Echo backend V1 范围 = **REMOVE UI**（消除假成功风险，与 Brief §E-P1-01 一致）

**核心要求**：

1. **不允许** 用户提交 Echo 文本（即使本地模拟）
2. **不允许** 显示"已记录 ✓"对勾
3. 必须明确告知用户 **Echo 功能暂未开放**
4. 必须有未来恢复路径（Phase 3+ 评估）

---

## 3. 候选方案对比

### 3.1 方案 A：保留 UI 但禁用提交（**推荐 · 采纳**）

```text
┌─────────────────────────────────────────┐
│  这一刻，你留下了什么？                  │  ← 保留 64px 大提问
│  ┌───────────────────────────────────┐  │
│  │  [灰底 textarea · readonly]       │  │  ← 禁用输入
│  │  此刻,这座城市的回声暂未开放...     │  │  ← 提示文案
│  └───────────────────────────────────┘  │
│  Echo 暂未开放                           │  ← 红字提示
│  我们正在准备安全的接收渠道,           │  ← 原因
│  敬请期待                               │
│                                          │
│  (无 submit 按钮 · 无字数计数)           │
└─────────────────────────────────────────┘
```

**实现要点**：

```typescript
// src/components/ui/EchoInput.tsx (修改)
export function EchoInput({
  question,
  placeholder = '此刻,这座城市的回声暂未开放...',
  state = 'disabled',  // 🔒 强制 disabled
  // 移除 onSubmit prop（或 noop）
  // ...
}) {
  return (
    <section className={rootClass} data-state="disabled" data-echo="unavailable">
      <h2 className={styles.question}>{question}</h2>
      <textarea
        className={styles.textarea}
        disabled
        readOnly
        placeholder={placeholder}
        // 🔒 移除 onChange / onFocus handlers
        aria-label="Echo 暂未开放"
      />
      <p className={styles.unavailable}>
        Echo 暂未开放 · 我们正在准备安全的接收渠道
      </p>
      <p className={styles.microcopy}>{microcopy}</p>
    </section>
  );
}
```

**新增 CSS**：`EchoInput.module.css` 加 `.unavailable` 样式（小字 · 灰色 · 居中）

**优点**：

- ✅ 满足 OD-01 核心要求（禁用提交 + 明确告知）
- ✅ **保留** UniversalCityPage LOCKED 4 屏布局（屏 04 Echo 仍在）
- ✅ 保留 14 组件 LOCKED（仅改 `EchoInput` props 默认值 + 移除 submit handler）
- ✅ 与 P0-7 Privacy 页面兼容性（Privacy 页面文案可链接到这里）
- ✅ Phase 3+ 恢复路径清晰（移除 `state='disabled'` 强制 + 重新挂 onSubmit）

**缺点**：

- ⚠️ 仍占用屏 04 空间（用户可能期待更多功能）
- ⚠️ `EchoInput.test.tsx` 需更新（删除 success 状态测试）

### 3.2 方案 B：完全下架（不采纳）

```text
CityPage 屏 04 区域：
  → 整块删除 EchoInput
  → 改为 "感谢你的观察 · 此刻这里没有更多" 静态文字
  → DistanceNavigation 提前上移
```

**优点**：

- ✅ 彻底消除假成功
- ✅ 视觉简洁

**缺点**：

- ❌ **破坏** UniversalCityPage LOCKED 4 屏布局（屏 04 必须存在）
- ❌ **破坏** 22 设计 LOCKED（屏 04 比例 / 间距 LOCKED）
- ❌ 不符合 sitemap-v1.md §1.3 Universal CityPage 4 屏定义
- ❌ Designer 后续恢复需重新设计屏 04
- ❌ 与 P0-7 Privacy 页面失联（Privacy 原本链接到 Echo 流程）

### 3.3 方案 C：保留 UI 但显示"Coming Soon" overlay（备选）

类似 A，但加一层 overlay（半透明遮罩 + "Coming Soon" 文案）。

**评价**：与方案 A 等价但视觉更差（覆盖效果破坏 LOCKED 视觉）。不采纳。

### 3.4 决策矩阵

| 维度 | 方案 A（推荐） | 方案 B | 方案 C |
|---|---|---|---|
| OD-01 满足度 | ✅ 100% | ✅ 100% | ✅ 100% |
| 设计 LOCK 兼容性 | 🟢 兼容（仅 props 改） | 🔴 破坏屏 04 | 🟡 视觉破坏 |
| 14 组件 LOCK 兼容性 | 🟢 仅 EchoInput 改 | 🟢 0 改 | 🟢 仅 EchoInput 改 |
| Privacy 页面联动 | 🟢 兼容 | 🔴 失联 | 🟢 兼容 |
| Phase 3 恢复成本 | 🟢 低（移除禁用） | 🔴 高（重建屏 04） | 🟢 低 |
| 用户体验 | 🟡 中（告知暂未开放） | 🟢 简洁 | 🟡 中 |
| **总分** | **24/30** | 17/30 | 19/30 |

**采纳**：**方案 A**

---

## 4. 实施细节（方案 A）

### 4.1 `src/components/ui/EchoInput.tsx` 改动

```diff
 export interface EchoInputProps {
   question: string;
   placeholder?: string;
   maxLength?: number;
   submitLabel?: string;
   microcopy?: string;
   hint?: string;
   state?: ComponentState;
   echoState?: EchoInputState;
   onSubmit?: (text: string) => void;
   className?: string;
 }

 export function EchoInput({
   question,
-  placeholder = '写下一句你此刻想到的话...',
+  placeholder = '此刻,这座城市的回声暂未开放...',
   maxLength = 80,
-  submitLabel = '记录 →',
-  microcopy = '仅记录这一刻的触动,不显示头像,不追踪身份',
+  submitLabel = '', // 空字符串 = 不渲染按钮
+  microcopy = 'Echo 暂未开放 · 我们正在准备安全的接收渠道',
   hint = '敬请期待',
-  state = 'default',
+  state = 'disabled', // 🔒 强制 disabled
   echoState,
-  onSubmit,
+  onSubmit, // 保留 prop 但 UI 不调用（兼容 Phase 3 恢复）
   className,
 }: EchoInputProps) {
-  const [internalState, setInternalState] = useState<EchoInputState>('default');
-  const [text, setText] = useState('');
-  const current = echoState ?? internalState;
   const disabled = true; // 🔒 永久 disabled（Phase 1）
-  const isSubmitted = current === 'submitted';

-  const rootClass = [
-    styles.echo,
-    styles[`echo--${state}`],
-    isSubmitted && styles['echo--submitted'],
-    className,
-  ].filter(Boolean).join(' ');

-  if (isSubmitted) {
-    return ( /* submitted 状态 */ );
-  }
+  const rootClass = [
+    styles.echo,
+    styles['echo--disabled'],
+    styles['echo--unavailable'], // 新增 unavailable 样式
+    className,
+  ].filter(Boolean).join(' ');

   return (
-    <section className={rootClass} data-state={state} data-echo={current}>
+    <section className={rootClass} data-state="disabled" data-echo="unavailable">
       <h2 className={styles.question}>{question}</h2>
       <textarea
         className={styles.textarea}
-        value={text}
-        maxLength={maxLength}
         disabled
         readOnly
         placeholder={placeholder}
-        onChange={...}
-        onFocus={...}
         rows={3}
-        aria-label="私密留痕"
+        aria-label="Echo 暂未开放"
       />
-      <div className={styles.footer}>
-        <span className={styles.count}>{text.length} / {maxLength}</span>
-        <button>...submit...</button>
-      </div>
+      {/* 🔒 完全移除 submit 按钮 + 字数计数 */}
       <p className={styles.microcopy}>{microcopy}</p>
       <p className={styles.hint}>{hint}</p>
+      <a href="/privacy" className={styles.privacyLink}>
+        为什么暂未开放？查看 Privacy →
+      </a>
     </section>
   );
 }
```

### 4.2 `src/components/ui/EchoInput.module.css` 改动

```diff
 /* 新增 unavailable 样式 */
+.echo--unavailable {
+  opacity: 0.85;
+  pointer-events: none;
+}
+
+.echo--unavailable .textarea {
+  background: #f5f5f5;
+  color: #999;
+  cursor: not-allowed;
+}
+
+.privacyLink {
+  display: inline-block;
+  margin-top: 8px;
+  color: #666;
+  text-decoration: underline;
+  font-size: 0.875em;
+}
```

### 4.3 `src/components/UniversalEcho.tsx` 改动

```diff
 export function UniversalEcho({
   city,
   pageState,
-  state: externalState,
-  onSubmit,
-  maxLength = DEFAULT_MAX_LENGTH,
+  state: externalState = 'disabled', // 🔒 默认 disabled
+  onSubmit, // 保留 prop
+  maxLength = DEFAULT_MAX_LENGTH,
 }: UniversalEchoProps) {
-  const [internalState, setInternalState] = useState<EchoState>('default');
-  const [text, setText] = useState('');
-  const state = externalState ?? internalState;
-  const isEmpty = pageState === 'E_empty';
-
-  const cta = isEmpty ? 'Be the first witness here.' : 'What did you leave behind?';
-  const privacyMicrocopy = 'Your note is private — only you can see it.';

-  const handleSubmit = (e: React.FormEvent) => {
-    e.preventDefault();
-    if (text.trim().length === 0) return;
-    setInternalState('submitted');
-    onSubmit?.(text);
-  };

-  if (state === 'submitted') {
-    return ( /* submitted 状态 */ );
-  }

-  return (
-    <section className="universal-echo" data-state={state} data-city={city.identity.city_id}>
-      <form onSubmit={handleSubmit} className="universal-echo__form">
-        <h2 className="universal-echo__prompt">{cta}</h2>
-        ...
-      </form>
-    </section>
-  );

+  // 🔒 OD-01: Phase 1 Echo 完全禁用
+  // 保留 UI 但不允许输入/提交
+  return (
+    <section
+      className="universal-echo universal-echo--unavailable"
+      data-state="disabled"
+      data-echo="unavailable"
+      data-city={city.identity.city_id}
+    >
+      <h2 className="universal-echo__prompt">这一刻,你留下了什么？</h2>
+      <div className="universal-echo__locked" aria-disabled="true">
+        <p>Echo 暂未开放 · 我们正在准备安全的接收渠道</p>
+        <p className="universal-echo__hint">敬请期待</p>
+        <a href="/privacy" className="universal-echo__privacy-link">
+          为什么暂未开放？查看 Privacy →
+        </a>
+      </div>
+    </section>
+  );
 }
```

### 4.4 单元测试更新（`EchoInput.test.tsx`、`UniversalEcho.test.tsx`）

```diff
-// 删除测试：
-test('EchoInput · state=success', () => {
-  render(<EchoInput state="success" />);
-  expect(screen.getByText('已记录')).toBeInTheDocument();
-});

-// 新增测试：
+test('EchoInput · unavailable state (OD-01)', () => {
+  render(<EchoInput question="这一刻" />);
+  expect(screen.getByText(/Echo 暂未开放/)).toBeInTheDocument();
+  expect(screen.queryByRole('button', { name: /记录/ })).not.toBeInTheDocument();
+  expect(screen.getByLabelText('Echo 暂未开放')).toBeDisabled();
+});

+test('UniversalEcho · 不显示 submit form (OD-01)', () => {
+  render(<UniversalEcho city={fixtureCity()} pageState="A_seed_editorial" />);
+  expect(screen.getByText(/Echo 暂未开放/)).toBeInTheDocument();
+  expect(screen.queryByRole('button', { name: /留痕/ })).not.toBeInTheDocument();
+});
```

---

## 5. Privacy 页面联动（P0-7）

### 5.1 当前 Privacy 页面（NEEDS STATE）

**sitemap-v1.md §1.1 P0-7**：`/privacy` · "NEEDS STATE（待 Lock，文档类页面）"

**Phase 1 Echo 决策对 Privacy 页面文案的建议**：

```markdown
# Privacy 页面新增 section

## Echo 暂未开放（OD-01）

为了确保你留下的每一句话都得到妥善处理,我们正在准备以下基础设施:

- **匿名提交渠道**: 无登录、无追踪、无 IP 记录
- **本地优先存储**: 文字仅在你确认提交后才离开设备
- **可见性控制**: 你可以选择"仅自己可见"或"经审核后公开"
- **撤回路径**: 任何 Echo 都可在 90 天内无条件撤回

当前 Alpha 版本不开放 Echo 提交。我们认为"假成功"比"暂未开放"更糟糕。

了解更多: [Echo 设计草案 (设计参考)] / [Privacy 完整文档]
```

### 5.2 Privacy 页面改动清单（建议 · 待 Designer）

- [ ] 新增 "Echo 暂未开放" section（200-400 字）
- [ ] 引用 `release-v1/minimal-witness/copy-final-v1.md`（已 LOCKED 字段映射）
- [ ] 链接到 EchoInput 的 "为什么暂未开放" 文案
- [ ] 提供 Feedback 入口（PM Agent 后续接）

> **Phase 1 Privacy 页面不强制改动**：本文仅作为建议；Privacy 页面本身 D-P0-01 标记 NEEDS STATE，待 Designer Lock 后实施。

---

## 6. 与现有组件的兼容性

### 6.1 `CityPage.tsx`（v2.30.0）

- ❌ **不修改**（LOCKED）
- ✅ 已不直接用 `EchoInput`（用 `UniversalCityPage`）

### 6.2 `UniversalCityPage.tsx`（v1.6.2）

- ❌ **不修改**（LOCKED）
- ✅ 已挂 `<UniversalEcho city={city} pageState={plan.page_state} />`
- ✅ `UniversalEcho` 内部已禁用（per §4.3）

### 6.3 `UniversalEcho.tsx`

- ✅ 修改（per §4.3）
- ✅ 不破坏 `UniversalCityPage` 的 props interface

### 6.4 `UniversalEcho.test.tsx`

- ✅ 修改测试（per §4.4）
- ✅ 验证 fake submit 已移除

---

## 7. Analytics 影响（per D-P0-05 event-map §5）

| Event | Phase 1 处理 |
|---|---|
| `echo_input_focused` | ❌ 不发（textarea readonly） |
| `echo_text_typed` | ❌ 不发 |
| `echo_submitted` | ❌ **不发**（核心 · 消除 fake success 风险） |
| `echo_submission_failed` | ❌ 不发 |
| `echo_unavailable_viewed` | ✅ **新增**（OD-01 替代事件） |

**Phase 1 Analytics 处理**：移除 `echo_*` 事件代码路径；新增 `echo_unavailable_viewed` 事件（D-P0-05 后续 patch）。

> **注意**：Phase 1 **不实现** Analytics SDK 集成（per 任务卡 §DO NOT）。本文仅记录 event 影响，不要求实施。

---

## 8. Phase 3+ 恢复路径（如重启 Echo）

### 8.1 重启前置条件

1. Echo backend schema 已建（`echoes` 表 + admin moderation UI）
2. OD-01 决议被 PM 重新评估并批准重启
3. Zod schemas（`zod-schemas/echo.ts`）保持 LOCKED · 无需改动

### 8.2 重启步骤

1. `src/components/ui/EchoInput.tsx`：
   - 移除 `state = 'disabled'` 强制
   - 恢复 `useState` + `onChange` + `onFocus` handlers
   - 恢复 submit button + onClick handler（改为真实 API 调用）
2. `src/components/UniversalEcho.tsx`：
   - 恢复 form + handleSubmit（改为真实 API 调用）
3. `src/lib/api-client.ts`：
   - 添加 `api.createEcho()` + `api.getEcho()` 函数（指向 `/v1/echoes` POST/GET）
4. `api/src/app/api/v1/echoes/route.ts`：
   - 实现 POST endpoint（per OpenAPI §Echo）
   - 实现 GET endpoint（per OpenAPI §Echo）
5. Analytics：
   - 恢复 `echo_*` 事件
   - 删除 `echo_unavailable_viewed` 事件
6. Tests：
   - 添加 `submitEcho → backend → 200` 集成测试
   - 删除 `unavailable` 相关测试

### 8.3 回滚 OD-01

如果 PM 决定彻底放弃 Echo（不仅是 UI disable）：

- 采纳方案 B：完全下架屏 04
- 同步更新 sitemap-v1.md / design-freeze-log-v1.md / UniversalCityPage
- 这是 **设计 LOCK 破坏** 决策，需 Designer + PM + 用户三方确认

---

## 9. Phase 1 不实现（明确排除）

| 项 | Phase | 备注 |
|---|---|---|
| Echo POST `/v1/echoes` | 不做（per OD-01） | Echo 表都不建 |
| Echo 提交 UI | 不做 | 当前 Phase 1 禁用 |
| Echo queue / moderation | 不做 | |
| Echo notification（"你的 Echo 被审核通过"） | 不做 | |

---

## 10. Blockers（详见 `phase1-blockers-v1.md`）

1. Designer 验收文案（"Echo 暂未开放"等）
2. 测试更新（`EchoInput.test.tsx` + `UniversalEcho.test.tsx`）
3. UniversalEcho 与 Privacy 页面文案一致性

---

## 11. 元数据

| 字段 | 值 |
|---|---|
| 文档版本 | v1 |
| 创建时间 | 2026-08-22 |
| 创建人 | Engineer Agent (Round 2B) |
| 文档 ID | `echo-ui-decision-v1.md` |
| 目标 Gate | Gate A · Internal Alpha · Phase 1 |
| 决策状态 | ✅ ACCEPTED（待 PM 评审） |
| Workspace 路径 | `/Users/lwy/Documents/ChatGPT/看见地球/release-v1/vertical-slice-phase1/echo-ui-decision-v1.md` |
| Obsidian canonical 路径 | `/Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/vertical-slice-phase1/echo-ui-decision-v1.md` |
| Obsidian 同步状态 | ❌ 未同步（sandbox 拒绝写入 Obsidian） |

---

**End of echo-ui-decision-v1.md**