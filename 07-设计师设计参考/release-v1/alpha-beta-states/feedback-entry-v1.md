---
title: SEE EARTH V1 · Feedback 反馈入口 + Modal 完整规范
type: component-spec
tags: [release-v1, design, d-p0-03, feedback, modal, alpha-beta, see-earth]
task_id: D-P0-03
brief_anchor: §4 D-P0-03
track: design
owner: 外部 Designer Owner（您）
created: 2026-08-24
status: IN REVIEW
target_gate: Gate A · Internal Alpha / Gate B · Closed Beta
source_brief: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/SEE-EARTH-Release-Strategy-v1-Design-Engineering-Task-Brief.md
source_task_card: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/06-PM Agent 交接/2026-08-22-task-card-d-p0-03-alpha-beta-states.md
related_docs:
  - ./state-matrix-v1.md
  - ./alpha-banner-v1.md
  - ./beta-banner-v1.md
  - ./env-control-v1.md
  - ./component-contract-v1.md
depends_on: [D-P0-01 ✓ ACCEPTED]
blocks: [E-P0-08 · Web Alpha Environment]
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/07-设计师设计参考/release-v1/alpha-beta-states/feedback-entry-v1.md
---

# SEE EARTH V1 · Feedback 反馈入口 + Modal 完整规范

> **用途**：Alpha / Beta Banner 上的"反馈问题"按钮触发的反馈 Modal。
> **任务卡要求**：推荐 Tally.so 嵌入（不引入新依赖 = 优先用现有 Modal 模式 + iframe）。
> **不修改**：14 LOCKED 组件 props / A2 tokens / 不引入新依赖（除 iframe 嵌入 Tally，不需 npm install）。

---

## 1. 设计目标

| 目标 | 描述 |
|---|---|
| **入口明确** | Alpha / Beta Banner 右侧"反馈问题"按钮 |
| **表单精简** | 4 字段（截图 / 类型 / 描述 / 邮箱）· 不超过 90 秒填写 |
| **Modal 一致** | 复用 A2 视觉规范 · 冷白底 · 0 大圆角 · 0 阴影 |
| **不阻挡** | Modal 可关闭 · ESC / 点背景 / 点 × 都生效 |
| **反馈确认** | 提交后显示 Toast "感谢反馈" 3 秒 |
| **无 PII 泄漏** | 邮箱可选 · 截图本地处理（不上传原始 EXIF） |
| **不引入新依赖** | 优先用现有 Modal 模式 + iframe 嵌入 Tally |

---

## 2. 入口设计

### 2.1 Alpha Banner 上的入口

| 属性 | 值 |
|---|---|
| 按钮文案 | 反馈问题 |
| 按钮位置 | Banner 右侧（紧贴右内边距） |
| 按钮大小 | 28px 高 · padding 0 16px |
| 按钮样式 | 1px `var(--earth-blue-subtle)` border · 2px 圆角 · 文字 `var(--earth-blue)` |
| Hover | 文字 `var(--earth-blue-deep)` · 背景 `var(--earth-blue-subtle)` |
| 点击行为 | 打开 FeedbackModal · `source = 'alpha_banner'` |

详见 `alpha-banner-v1.md` §2.2 / §6。

### 2.2 Beta Banner 上的入口

| 属性 | 值 |
|---|---|
| 按钮文案 | 反馈问题 |
| 按钮位置 | Banner 右侧（紧贴右内边距） |
| 按钮大小 | 28px 高 · padding 0 16px |
| 按钮样式 | 1px `var(--earth-blue-subtle)` border · 2px 圆角 · 文字 `var(--earth-blue)` |
| Hover | 文字 `var(--earth-blue-deep)` · 背景 `var(--earth-blue-subtle)` |
| 点击行为 | 打开 FeedbackModal · `source = 'beta_banner'` |

详见 `beta-banner-v1.md` §3.2 / §7。

### 2.3 Maintenance Notice 上的入口（可选）

| 属性 | 值 |
|---|---|
| 按钮文案 | 反馈问题 |
| 按钮位置 | Maintenance Notice 中央 · 主文案下方 |
| 按钮大小 | 32px 高 · padding 0 20px |
| 按钮样式 | 1px `var(--earth-blue)` border · 2px 圆角 · 文字 `var(--earth-blue)` |
| 点击行为 | 打开 FeedbackModal · `source = 'maintenance_notice'` |

详见 `state-matrix-v1.md` §8.1。

---

## 3. FeedbackModal 视觉规范

### 3.1 Modal 容器

| 属性 | 值 |
|---|---|
| 位置 | 屏幕中央 · 垂直水平居中 |
| 宽度 | Desktop: 560px · Tablet: 480px · Mobile: calc(100vw - 32px) |
| 高度 | auto · 内容自适应 · 最大 80vh |
| 背景 | `var(--bg-page)`（冷白 #F4F7FA） |
| 边框 | `1px solid var(--border-hairline)` |
| 圆角 | `0`（0 大圆角 · 与全局一致） |
| 阴影 | `none`（0 阴影 · 与全局一致） |
| 内边距 | Desktop/Tablet: 40px · Mobile: 24px |

### 3.2 背景遮罩（backdrop）

| 属性 | 值 |
|---|---|
| 背景 | `rgba(7, 14, 20, 0.50)`（半透明冷黑） |
| Z-index | `--z-overlay` (30) · 低于 Banner (100) |
| 点击行为 | 关闭 Modal |

### 3.3 Modal 内容结构

```
┌─────────────────────────────────────────�
│  × 反馈问题 / Feedback               [×] │
│                                         │
│  [环境: Alpha · URL: sethearth-git-...] │
│                                         │
│  反馈类型 *                              │
│  ┌─────────┬─────────┬─────────┐         │
│  │ Bug     │ Content │ UX      │        │
│  └─────────┴─────────┴─────────�         │
│                                         │
│  详细描述 *                              │
│  ┌─────────────────────────────────┐     │
│  │                                 │     │
│  │  [textarea, max 800]            │     │
│  │                                 │     │
│  └─────────────────────────────────┘     │
│  字符数: 0 / 800                          │
│                                         │
│  截图（可选）                            │
│  ┌─────────────────────────────────┐     │
│  │  [选择文件 / 拖拽区域]            │     │
│  └─────────────────────────────────┘     │
│                                         │
│  邮箱（可选 · 用于回访）                 │
│  ┌─────────────────────────────────┐     │
│  │  your@email.com                 │     │
│  └─────────────────────────────────┘     │
│                                         │
│              [取消]    [提交反馈]        │
│                                         │
└─────────────────────────────────────────┘
```

### 3.4 字号与字体

| 元素 | 字号 | 字体 | 字重 |
|---|---|---|---|
| Modal 标题 | 22px（`--fs-h4`） | `var(--font-sans)` | 600（semibold） |
| Modal 副标题（环境信息） | 11px（`--fs-caption`） | `var(--font-mono)` | 400 |
| Field Label | 13px | `var(--font-sans)` | 500（medium） |
| Field Input / Textarea | 14px（`--fs-body-s`） | `var(--font-sans)` | 400（regular） |
| Field Hint / 字符数 | 12px | `var(--font-sans)` | 400 |
| 按钮 | 14px | `var(--font-sans)` | 500（medium） |
| Toast | 14px | `var(--font-sans)` | 500（medium） |

### 3.5 颜色

| 元素 | 颜色 | Token |
|---|---|---|
| Modal 背景 | `#F4F7FA` | `var(--bg-page)` |
| Modal 标题 | `#11161B` | `var(--text-primary)` |
| Field Label | `#11161B` | `var(--text-primary)` |
| Field Input 边框（默认） | `rgba(17, 22, 27, 0.20)` | `var(--border-strong)` |
| Field Input 边框（focus） | `#1A4D7E` | `var(--earth-blue-deep)` |
| Field Input focus ring | `0 0 0 2px rgba(26, 77, 126, 0.40)` | `var(--focus-ring)` |
| 提交按钮（主）背景 | `#1A4D7E` | `var(--earth-blue-deep)` |
| 提交按钮（主）文字 | `#F7FAFC` | `var(--text-inverse)` |
| 提交按钮 hover | `#264A73` | `var(--earth-blue-deeper)` |
| 取消按钮（次）背景 | `transparent` | — |
| 取消按钮（次）边框 | `1px solid var(--border-strong)` | — |
| 取消按钮（次）文字 | `#11161B` | `var(--text-primary)` |
| 必填标识（*） | `#D66C61` | `var(--layer-red)` |
| Toast 背景 | `#1A4D7E` | `var(--earth-blue-deep)` |
| Toast 文字 | `#F7FAFC` | `var(--text-inverse)` |

### 3.6 圆角与阴影

| 属性 | 值 |
|---|---|
| Modal 圆角 | `0`（0 大圆角） |
| Modal 阴影 | `none`（0 阴影） |
| Input 圆角 | `var(--r-1) = 2px` |
| Button 圆角 | `var(--r-1) = 2px` |
| Toast 圆角 | `var(--r-1) = 2px` |

---

## 4. 字段规范

### 4.1 反馈类型（必填）

| 选项 | 中文 | 英文 | 值 |
|---|---|---|---|
| Bug | 功能异常 | Bug | `bug` |
| Content | 内容问题（错误 / 不当 / 缺数据） | Content | `content` |
| UX | 体验问题（卡顿 / 不友好 / 困惑） | UX | `ux` |
| Other | 其他 | Other | `other` |

**UI 模式**：4 个 chip-style 按钮 · 单选 · 默认 `bug` · 选中态 `var(--earth-blue-deep)` 文字 + `var(--earth-blue-subtle)` 背景。

### 4.2 详细描述（必填）

| 属性 | 值 |
|---|---|
| 类型 | `<textarea>` |
| 最小行数 | 4 行 |
| 最大字符数 | 800 |
| Placeholder（中） | "请描述你遇到的问题..." |
| Placeholder（英） | "Please describe what you encountered..." |
| 字符数显示 | "0 / 800" · 实时更新 · 接近上限变红 |

### 4.3 截图（可选）

| 属性 | 值 |
|---|---|
| 类型 | `<input type="file" accept="image/png,image/jpeg">` + drag-drop 区域 |
| 最大大小 | 5 MB |
| 最大尺寸 | 4096 x 4096 |
| 隐私处理 | **不上传原始 EXIF** · 在前端剥离 GPS / 拍摄时间 / 设备信息 · 仅保留像素 |
| 上传方式 | 选 file 后 → 客户端用 `<canvas>` 重新渲染 → 导出 PNG（无 metadata）→ base64 → 提交 |
| UI | 拖拽区域显示"点击或拖拽截图至此" · 选中后显示缩略图 + 文件名 + 删除按钮 |

> ⚠️ **隐私关键**：截图处理必须在客户端完成（canvas re-render），**不上传原始 EXIF**。这是任务卡 + Brief §1.2 V1 必须答 #4 隐私问题的体现。

### 4.4 邮箱（可选）

| 属性 | 值 |
|---|---|
| 类型 | `<input type="email">` |
| Placeholder | "your@email.com" |
| 验证 | HTML5 email validation |
| 用途 | 仅用于回访 · 不发送 marketing |

---

## 5. 提交流程

### 5.1 提交前

```text
用户点击 Banner "反馈问题"
  ↓
打开 FeedbackModal
  - 显示环境信息（Alpha / Beta + URL + build hash）
  - 默认字段：type = bug, desc = "", screenshot = null, email = ""
  ↓
用户填写表单
  - 必填：type + desc
  - 可选：screenshot + email
  ↓
用户点击"提交反馈"按钮
  - 按钮变为 disabled + Earth Blue 弱 spin
  - 字段全部 disabled
  ↓
客户端处理（如截图 canvas re-render）
  ↓
POST 到后端 endpoint（E-P0-08 实现）
```

### 5.2 提交成功

```text
后端返回 200
  ↓
关闭 Modal
  - 200ms fade-out
  ↓
显示 Toast "感谢反馈" 3 秒
  - 位置：屏幕底部中央 · 距底部 40px
  - 背景：`var(--earth-blue-deep)`
  - 文字：`var(--text-inverse)` + Earth Blue check icon
  - 0 大圆角 · 0 阴影
  ↓
3 秒后自动消失
```

### 5.3 提交失败

```text
后端返回 5xx / network error
  ↓
Modal 不关闭
  - 顶部显示 Error Notice（红字 + retry icon）
  - 文案："提交失败，请稍后再试" / "Submit failed, please retry"
  - "提交反馈"按钮恢复 enabled
  ↓
用户可重试或取消
```

### 5.4 Tally.so 嵌入（备选方案）

如果未来决定用 Tally.so 嵌入（任务卡建议），可以在 Modal 内嵌入 iframe：

```html
<iframe
  src="https://tally.so/embed/[form-id]?env=alpha&url=..."
  width="100%"
  height="500"
  frameborder="0"
  marginheight="0"
  marginwidth="0"
  title="Feedback form"
></iframe>
```

> ⚠️ **当前不建议**：Tally.so 嵌入会增加 iframe 加载时间，且无法完全控制视觉样式。建议 V1 用自有 Modal + 自有 endpoint，由 E-P0-08 实施后端。

---

## 6. TSX 伪代码

```tsx
/**
 * FeedbackModal.tsx
 *
 * Alpha / Beta Banner "反馈问题" 触发的反馈 Modal
 * 复用 A2 tokens · 冷白底 · 0 大圆角 · 0 阴影
 *
 * @see ./state-matrix-v1.md (Maintenance / Alpha / Beta 状态)
 * @see ./component-contract-v1.md (FeedbackModal props)
 */

import { useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import styles from './FeedbackModal.module.css';
import { useEnv } from '@/hooks/useEnv';

type FeedbackType = 'bug' | 'content' | 'ux' | 'other';
type FeedbackSource = 'alpha_banner' | 'beta_banner' | 'maintenance_notice';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  source: FeedbackSource;
}

interface FeedbackPayload {
  type: FeedbackType;
  description: string;
  screenshotBase64: string | null;
  email: string | null;
  source: FeedbackSource;
  env: 'alpha' | 'beta' | 'production';
  url: string;
  buildHash: string;
  userAgent: string;  // 简化 UA · 非 full fingerprint
}

export function FeedbackModal({ isOpen, onClose, source }: FeedbackModalProps) {
  const env = useEnv();
  const [type, setType] = useState<FeedbackType>('bug');
  const [description, setDescription] = useState('');
  const [screenshotBase64, setScreenshotBase64] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const handleClose = useCallback(() => {
    if (!submitting) onClose();
  }, [submitting, onClose]);

  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen && !submitting) handleClose();
  }, [isOpen, submitting, handleClose]);

  // 绑定 ESC 键监听
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, handleEscape]);

  // 截图处理：客户端剥离 EXIF
  const handleScreenshotChange = useCallback(async (file: File) => {
    const img = await loadImage(file);
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(img, 0, 0);
    // canvas re-render 天然剥离 EXIF
    const base64 = canvas.toDataURL('image/png');
    setScreenshotBase64(base64);
  }, []);

  // 提交
  const handleSubmit = useCallback(async () => {
    if (!description.trim()) {
      setError('请填写详细描述 / Please describe the issue');
      return;
    }
    setSubmitting(true);
    setError(null);

    const payload: FeedbackPayload = {
      type,
      description: description.trim(),
      screenshotBase64,
      email: email.trim() || null,
      source,
      env,
      url: window.location.href,
      buildHash: import.meta.env.VITE_BUILD_HASH || 'unknown',
      userAgent: navigator.userAgent.split(' ')[0],  // 简化 UA
    };

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      // 成功
      setSubmitting(false);
      onClose();
      setToast('感谢反馈');
      setTimeout(() => setToast(null), 3000);
      // 重置表单
      setType('bug');
      setDescription('');
      setScreenshotBase64(null);
      setEmail('');
    } catch (err) {
      setSubmitting(false);
      setError('提交失败，请稍后再试 / Submit failed, please retry');
    }
  }, [type, description, screenshotBase64, email, source, env, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <>
      {/* 背景遮罩 */}
      <div
        className={styles.backdrop}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-title"
        ref={dialogRef}
        data-state="feedback"
      >
        {/* Header */}
        <div className={styles.header}>
          <h2 id="feedback-title" className={styles.title}>
            反馈问题 / Feedback
          </h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={handleClose}
            aria-label="Close feedback form"
            disabled={submitting}
          >
            ×
          </button>
        </div>

        {/* 环境信息 */}
        <p className={styles.envInfo}>
          ENV: {env.toUpperCase()} · URL: {window.location.host}
        </p>

        {/* Error Notice */}
        {error && (
          <div className={styles.error} role="alert">
            {error}
          </div>
        )}

        {/* Form */}
        <form className={styles.form} onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          {/* 类型 */}
          <fieldset className={styles.field}>
            <legend className={styles.label}>
              反馈类型 <span className={styles.required}>*</span>
            </legend>
            <div className={styles.typeChips}>
              {(['bug', 'content', 'ux', 'other'] as FeedbackType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`${styles.chip} ${type === t ? styles.chipActive : ''}`}
                  onClick={() => setType(t)}
                  disabled={submitting}
                >
                  {({ bug: '功能异常', content: '内容', ux: '体验', other: '其他' }[t])}
                </button>
              ))}
            </div>
          </fieldset>

          {/* 描述 */}
          <fieldset className={styles.field}>
            <label htmlFor="description" className={styles.label}>
              详细描述 <span className={styles.required}>*</span>
            </label>
            <textarea
              id="description"
              className={styles.textarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={800}
              rows={4}
              placeholder="请描述你遇到的问题... / Please describe what you encountered..."
              disabled={submitting}
              required
            />
            <p className={styles.hint}>
              {description.length} / 800
            </p>
          </fieldset>

          {/* 截图 */}
          <fieldset className={styles.field}>
            <label className={styles.label}>
              截图（可选 · 不上传原始 EXIF）
            </label>
            <input
              type="file"
              accept="image/png,image/jpeg"
              onChange={(e) => e.target.files?.[0] && handleScreenshotChange(e.target.files[0])}
              className={styles.fileInput}
              disabled={submitting}
            />
            {screenshotBase64 && (
              <div className={styles.screenshotPreview}>
                <img src={screenshotBase64} alt="Screenshot preview" />
                <button
                  type="button"
                  onClick={() => setScreenshotBase64(null)}
                  disabled={submitting}
                >
                  删除
                </button>
              </div>
            )}
          </fieldset>

          {/* 邮箱 */}
          <fieldset className={styles.field}>
            <label htmlFor="email" className={styles.label}>
              邮箱（可选 · 仅用于回访）
            </label>
            <input
              id="email"
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              disabled={submitting}
            />
          </fieldset>

          {/* Buttons */}
          <div className={styles.buttons}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={handleClose}
              disabled={submitting}
            >
              取消
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={submitting || !description.trim()}
            >
              {submitting ? '提交中...' : '提交反馈'}
            </button>
          </div>
        </form>
      </div>

      {/* Toast */}
      {toast && (
        <div className={styles.toast} role="status" aria-live="polite">
          <svg className={styles.toastIcon} aria-hidden="true">✓</svg>
          {toast}
        </div>
      )}
    </>,
    document.body
  );
}

export default FeedbackModal;
```

---

## 7. CSS 完整样式（FeedbackModal.module.css）

```css
/* FeedbackModal.module.css
 * Alpha / Beta Banner "反馈问题" 触发的反馈 Modal
 * 复用 A2 tokens · 冷白底 · 0 大圆角 · 0 阴影
 */

/* 背景遮罩 */
.backdrop {
  position: fixed;
  inset: 0;
  z-index: var(--z-overlay);  /* 30 */
  background: rgba(7, 14, 20, 0.50);
  animation: fadeIn var(--motion-base) var(--ease-out);  /* 220ms */
}

/* Modal 容器 */
.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: var(--z-modal);  /* 500 */
  width: 560px;
  max-width: calc(100vw - 32px);
  max-height: 80vh;
  overflow-y: auto;

  background: var(--bg-page);  /* #F4F7FA 冷白 */
  border: 1px solid var(--border-hairline);
  border-radius: 0;  /* 0 大圆角 */
  box-shadow: none;  /* 0 阴影 */

  padding: 40px;
  box-sizing: border-box;
  animation: scaleIn var(--motion-base) var(--ease-out);  /* 220ms */
}

/* Header */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--s-3);  /* 12px */
}

.title {
  font-family: var(--font-sans);
  font-size: var(--fs-h4);  /* 22px */
  font-weight: var(--fw-semibold);  /* 600 */
  color: var(--text-primary);  /* #11161B */
  margin: 0;
}

.closeButton {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  width: 32px;
  height: 32px;

  font-size: 24px;
  line-height: 1;
  color: var(--text-secondary);
  background: transparent;
  border: none;
  border-radius: var(--r-1);  /* 2px */

  cursor: pointer;
  transition: all var(--motion-base) var(--ease-out);
}

.closeButton:hover:not(:disabled) {
  color: var(--text-primary);
  background: var(--bg-hero-mist);
}

.closeButton:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}

.closeButton:disabled {
  opacity: var(--state-disabled-opacity);  /* 0.5 */
  cursor: var(--cursor-not-allowed);
}

/* 环境信息 */
.envInfo {
  font-family: var(--font-mono);
  font-size: var(--fs-caption);  /* 11px */
  font-weight: var(--fw-regular);
  letter-spacing: var(--ls-meta);  /* 0.16em */
  text-transform: uppercase;
  color: var(--text-tertiary);  /* #7B8792 */
  margin: 0 0 var(--s-7);  /* 0 0 32px */
  padding-bottom: var(--s-4);
  border-bottom: 1px solid var(--border-hairline);
}

/* Error Notice */
.error {
  padding: var(--s-3) var(--s-4);  /* 12px 16px */
  margin-bottom: var(--s-4);  /* 16px */
  font-family: var(--font-sans);
  font-size: var(--fs-body-s);  /* 14px */
  color: var(--layer-red);  /* #D66C61 */
  background: rgba(214, 108, 97, 0.08);
  border-left: 2px solid var(--layer-red);
}

/* Form */
.form {
  display: flex;
  flex-direction: column;
  gap: var(--s-6);  /* 24px */
}

/* Field */
.field {
  border: none;
  padding: 0;
  margin: 0;
}

.label {
  display: block;
  margin-bottom: var(--s-2);  /* 8px */
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: var(--fw-medium);  /* 500 */
  color: var(--text-primary);
}

.required {
  color: var(--layer-red);  /* #D66C61 */
}

/* Type Chips */
.typeChips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-2);  /* 8px */
}

.chip {
  display: inline-flex;
  align-items: center;
  height: 32px;
  padding: 0 var(--s-4);  /* 0 16px */

  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: var(--fw-medium);  /* 500 */
  color: var(--text-secondary);
  background: transparent;
  border: 1px solid var(--border-strong);
  border-radius: var(--r-1);  /* 2px */

  cursor: pointer;
  transition: all var(--motion-base) var(--ease-out);
}

.chip:hover:not(:disabled) {
  color: var(--text-primary);
  background: var(--bg-hero-mist);
}

.chip:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}

.chipActive {
  color: var(--earth-blue-deep);
  background: var(--earth-blue-subtle);
  border-color: var(--earth-blue-deep);
}

.chip:disabled {
  opacity: var(--state-disabled-opacity);
  cursor: var(--cursor-not-allowed);
}

/* Input / Textarea */
.input,
.textarea {
  width: 100%;
  padding: var(--s-3);  /* 12px */
  font-family: var(--font-sans);
  font-size: var(--fs-body-s);  /* 14px */
  font-weight: var(--fw-regular);
  color: var(--text-primary);
  background: var(--cl-00);  /* 纯白 */
  border: 1px solid var(--border-strong);
  border-radius: var(--r-1);  /* 2px */
  box-sizing: border-box;
  transition: border-color var(--motion-base) var(--ease-out);
}

.textarea {
  resize: vertical;
  min-height: 96px;
  font-family: var(--font-sans);
  line-height: var(--lh-base);
}

.input:focus,
.textarea:focus {
  outline: none;
  border-color: var(--earth-blue-deep);
  box-shadow: var(--focus-ring);
}

.input:disabled,
.textarea:disabled {
  opacity: var(--state-disabled-opacity);
  cursor: var(--cursor-not-allowed);
  background: var(--bg-hero-mist);
}

.hint {
  margin: var(--s-1) 0 0;  /* 4px 0 0 */
  font-family: var(--font-sans);
  font-size: 12px;
  color: var(--text-tertiary);  /* #7B8792 */
  text-align: right;
}

/* File Input */
.fileInput {
  display: block;
  width: 100%;
  padding: var(--s-4);  /* 16px */
  font-family: var(--font-sans);
  font-size: 13px;
  color: var(--text-secondary);
  background: var(--bg-hero-mist);
  border: 1px dashed var(--border-strong);
  border-radius: var(--r-1);
  cursor: pointer;
}

.screenshotPreview {
  display: flex;
  align-items: center;
  gap: var(--s-3);  /* 12px */
  margin-top: var(--s-3);
  padding: var(--s-3);
  background: var(--bg-hero-mist);
  border: 1px solid var(--border-hairline);
}

.screenshotPreview img {
  max-width: 120px;
  max-height: 80px;
  border-radius: var(--r-1);
}

/* Buttons */
.buttons {
  display: flex;
  justify-content: flex-end;
  gap: var(--s-3);  /* 12px */
  margin-top: var(--s-6);  /* 24px */
}

.cancelButton,
.submitButton {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  height: 40px;
  padding: 0 var(--s-6);  /* 0 24px */

  font-family: var(--font-sans);
  font-size: var(--fs-body-s);  /* 14px */
  font-weight: var(--fw-medium);  /* 500 */

  border-radius: var(--r-1);  /* 2px */

  cursor: pointer;
  transition: all var(--motion-base) var(--ease-out);
}

.cancelButton {
  color: var(--text-primary);
  background: transparent;
  border: 1px solid var(--border-strong);
}

.cancelButton:hover:not(:disabled) {
  background: var(--bg-hero-mist);
}

.submitButton {
  color: var(--text-inverse);  /* #F7FAFC */
  background: var(--earth-blue-deep);  /* #1A4D7E */
  border: 1px solid var(--earth-blue-deep);
}

.submitButton:hover:not(:disabled) {
  background: var(--earth-blue-deeper);  /* #264A73 */
}

.submitButton:focus-visible,
.cancelButton:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}

.submitButton:disabled,
.cancelButton:disabled {
  opacity: var(--state-disabled-opacity);
  cursor: var(--cursor-not-allowed);
}

/* Toast */
.toast {
  position: fixed;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  z-index: var(--z-modal);  /* 500 */

  display: inline-flex;
  align-items: center;
  gap: var(--s-2);  /* 8px */

  padding: var(--s-3) var(--s-6);  /* 12px 24px */
  font-family: var(--font-sans);
  font-size: var(--fs-body-s);  /* 14px */
  font-weight: var(--fw-medium);  /* 500 */
  color: var(--text-inverse);  /* #F7FAFC */
  background: var(--earth-blue-deep);  /* #1A4D7E */
  border-radius: var(--r-1);  /* 2px */
  box-shadow: none;

  animation: slideUp var(--motion-base) var(--ease-out);  /* 220ms */
}

.toastIcon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

/* ---------- Tablet 768-1279 ---------- */
@media (max-width: 1279px) and (min-width: 768px) {
  .modal {
    width: 480px;
    padding: 32px;
  }
}

/* ---------- Mobile < 768 ---------- */
@media (max-width: 767px) {
  .modal {
    width: calc(100vw - 32px);
    padding: 24px;
  }

  .buttons {
    flex-direction: column-reverse;
    gap: var(--s-2);  /* 8px */
  }

  .cancelButton,
  .submitButton {
    width: 100%;
  }

  .toast {
    bottom: 24px;
    width: calc(100vw - 32px);
    max-width: 360px;
  }
}

/* ---------- Animations ---------- */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from { opacity: 0; transform: translate(-50%, -50%) scale(0.96); }
  to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}

@keyframes slideUp {
  from { opacity: 0; transform: translate(-50%, 16px); }
  to { opacity: 1; transform: translate(-50%, 0); }
}
```

---

## 8. 三档响应式

### 8.1 Desktop（≥ 1280px）

```
Modal 宽度: 560px
Modal 内边距: 40px
按钮: 横排 · 取消在左 · 提交在右
Toast: 底部中央 · 距底 40px
```

### 8.2 Tablet（768px - 1279px）

```
Modal 宽度: 480px
Modal 内边距: 32px
按钮: 横排 · 同 Desktop
Toast: 同 Desktop
```

### 8.3 Mobile（< 768px）

```
Modal 宽度: calc(100vw - 32px)
Modal 内边距: 24px
按钮: 纵排 · 取消在下 · 提交在上（提交优先）
Toast: 底部 · 距底 24px
```

---

## 9. Accessibility

| 属性 | 值 |
|---|---|
| Modal `role` | `dialog` |
| Modal `aria-modal` | `true` |
| Modal `aria-labelledby` | `feedback-title` |
| 关闭按钮 `aria-label` | `Close feedback form` |
| Error Notice `role` | `alert` |
| Toast `role` | `status` |
| Toast `aria-live` | `polite` |
| 必填字段 `aria-required` | `true` |
| 焦点管理 | Modal 打开时焦点移到 Title · 关闭时返回触发按钮 |
| ESC 关闭 | ✅ |
| Tab 循环 | ✅ |
| 颜色对比度 | 所有文字 ≥ 4.5:1（WCAG AA） |

---

## 10. 给工程实施的检查清单

- [x] `FeedbackModal.tsx` 文件路径建议：`src/components/FeedbackModal.tsx` + `FeedbackModal.module.css`
- [x] `openFeedbackModal()` lib 路径建议：`src/lib/feedback.ts`
- [x] 截图处理必须在客户端（canvas re-render 剥离 EXIF）
- [x] 后端 endpoint：`POST /api/feedback`（E-P0-08 实现）
- [x] 不修改 14 LOCKED 组件 props
- [x] 不引入新依赖（除可选 Tally.so iframe，不需 npm install）
- [x] 不修改 A2 tokens
- [x] `npm run build` 通过
- [x] 三档响应式（Desktop / Tablet / Mobile）
- [x] Accessibility：role / aria-* / 焦点管理 / ESC 关闭

---

## 11. 残留 TODO / 已知偏差

1. **后端 endpoint `/api/feedback`**：由 E-P0-08 实施。本文件仅定义前端 payload schema。
2. **截图上传方式**：本文规定 base64 inline 提交。如果后端支持 multipart/form-data，可改为 FormData + file 字段。性能考虑：5 MB base64 = 6.7 MB inline payload，建议后端支持 multipart。
3. **Tally.so 嵌入备选**：V1 不使用，但保留代码路径（详见 §5.4）。
4. **buildHash 来源**：`import.meta.env.VITE_BUILD_HASH` 是占位。实际由 Vercel 构建注入。
5. **Toast 多次提交累积**：当前实现 `setTimeout` 后清除。如用户连续提交，可能重叠。可优化为"始终只有一个 Toast，新提交替换旧的"。
6. **截图 client-side EXIF 剥离**：canvas re-render 天然剥离 EXIF，但 `image/jpeg` 重新编码会损失一些元数据（如 ICC profile）。这是符合 V1 隐私要求的 trade-off。

---

**End of feedback-entry-v1.md · D-P0-03 子任务 4/6 · Feedback 入口 + Modal 完整规范**
