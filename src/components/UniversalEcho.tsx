/* ============================================================
   看见地球 · v1.6.2 · PROMPT 41 v1 · UniversalEcho 组件
   ------------------------------------------------------------
   - 4 屏之 04 · Echo (Phase 1 纯文案 / Phase 2 → Witness)
   - 6 状态:default / hover / focus / typing / disabled / submitted
   - 大提问 64px + 隐私 microcopy + 0/80 字数 + 提交对勾(per spec §3.2.4)
   - Empty State 特殊处理:E_empty 时 CTA = "Be the first witness"
   ============================================================ */

import { useState } from 'react';
import type { CityPageState } from '@/types';
import type { City } from '@/types';

export type EchoState =
  | 'default'      // 初始态
  | 'hover'        // hover(纯视觉,通过 CSS 处理,此处为占位)
  | 'focus'        // 聚焦 textarea
  | 'typing'       // 用户正在输入(>0 chars)
  | 'disabled'     // 暂时禁用(Phase 1 不实现,但 enum 预留)
  | 'submitted';   // 已提交(显示对勾 + microcopy)

export interface UniversalEchoProps {
  city: City;
  pageState: CityPageState;
  /** 外部可控状态(可选);若不传则内部 useState */
  state?: EchoState;
  /** 提交回调 */
  onSubmit?: (text: string) => void;
  /** 最大字数 */
  maxLength?: number;
}

const DEFAULT_MAX_LENGTH = 80;

/**
 * UniversalEcho · 屏 04 · Echo。
 *
 * Phase 1 first pass:6 状态切换 + 字数计数 + 提交后态
 * Phase 2+ 计划:对接 v1.3 §3.2.4 mockup,加隐私 microcopy + Layer Color 红对勾
 */
export function UniversalEcho({
  city,
  pageState,
  state: externalState,
  onSubmit,
  maxLength = DEFAULT_MAX_LENGTH,
}: UniversalEchoProps) {
  const [internalState, setInternalState] = useState<EchoState>('default');
  const [text, setText] = useState('');
  const state = externalState ?? internalState;
  const isEmpty = pageState === 'E_empty';

  const cta = isEmpty ? 'Be the first witness here.' : 'What did you leave behind?';
  const privacyMicrocopy = 'Your note is private — only you can see it.';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim().length === 0) return;
    if (externalState === undefined) {
      setInternalState('submitted');
    }
    onSubmit?.(text);
  };

  if (state === 'submitted') {
    return (
      <section className="universal-echo" data-state="submitted" data-city={city.identity.city_id}>
        <div className="universal-echo__submitted">
          <span className="universal-echo__check" aria-label="已提交">✓</span>
          <p className="universal-echo__thanks">感谢你的留痕。</p>
          <p className="universal-echo__privacy">{privacyMicrocopy}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="universal-echo" data-state={state} data-city={city.identity.city_id}>
      <form onSubmit={handleSubmit} className="universal-echo__form">
        <h2 className="universal-echo__prompt">{cta}</h2>
        <label className="universal-echo__label">
          <span className="universal-echo__label-text">你的留痕</span>
          <textarea
            className="universal-echo__textarea"
            value={text}
            maxLength={maxLength}
            onChange={(e) => {
              setText(e.target.value);
              if (externalState === undefined) {
                setInternalState(e.target.value.length > 0 ? 'typing' : 'focus');
              }
            }}
            onFocus={() => {
              if (externalState === undefined) setInternalState('focus');
            }}
            onBlur={() => {
              if (externalState === undefined && text.length === 0) {
                setInternalState('default');
              }
            }}
            disabled={state === 'disabled'}
            rows={3}
            placeholder="..." />
        </label>
        <div className="universal-echo__footer">
          <span className="universal-echo__count">{text.length} / {maxLength}</span>
          <button
            type="submit"
            className="universal-echo__submit"
            disabled={text.trim().length === 0 || state === 'disabled'}
          >
            留痕
          </button>
        </div>
        <p className="universal-echo__privacy">{privacyMicrocopy}</p>
      </form>
    </section>
  );
}

export default UniversalEcho;