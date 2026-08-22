/* ============================================================
   看见地球 · v1.6.4 · PROMPT 46 v1 · EchoInput
   ------------------------------------------------------------
   - 私密留痕输入区(textarea + CTA + microcopy)
   - 6 状态:default / hover / focus / active(typing) / disabled / success
   - Khartoum final-qa 已验证 6 状态
   ============================================================ */

import { useState } from 'react';
import type { ComponentState, EchoInputState } from './types';
import styles from './EchoInput.module.css';

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
  placeholder = '写下一句你此刻想到的话...',
  maxLength = 80,
  submitLabel = '记录 →',
  microcopy = '仅记录这一刻的触动,不显示头像,不追踪身份',
  hint = '你也可以只留下一个词',
  state = 'default',
  echoState,
  onSubmit,
  className,
}: EchoInputProps) {
  const [internalState, setInternalState] = useState<EchoInputState>('default');
  const [text, setText] = useState('');
  const current = echoState ?? internalState;
  const disabled = state === 'disabled';
  const isSubmitted = current === 'submitted';

  const rootClass = [
    styles.echo,
    styles[`echo--${state}`],
    isSubmitted && styles['echo--submitted'],
    className,
  ].filter(Boolean).join(' ');

  if (isSubmitted) {
    return (
      <section className={rootClass} data-state="success" data-echo="submitted">
        <div className={styles.submitted}>
          <span className={styles.check} aria-label="已记录">✓</span>
          <p className={styles.thanks}>已记录</p>
          <p className={styles.privacy}>{microcopy}</p>
        </div>
      </section>
    );
  }

  return (
    <section className={rootClass} data-state={state} data-echo={current}>
      <h2 className={styles.question}>{question}</h2>
      <textarea
        className={styles.textarea}
        value={text}
        maxLength={maxLength}
        disabled={disabled}
        readOnly={disabled}
        placeholder={placeholder}
        onChange={(e) => {
          setText(e.target.value);
          if (echoState === undefined) {
            setInternalState(e.target.value.length > 0 ? 'typing' : 'default');
          }
        }}
        onFocus={() => {
          if (echoState === undefined) setInternalState('typing');
        }}
        rows={3}
        aria-label="私密留痕"
      />
      <div className={styles.footer}>
        <span className={styles.count}>{text.length} / {maxLength}</span>
        <button
          type="button"
          className={styles.submit}
          disabled={disabled || text.trim().length === 0}
          onClick={() => {
            if (text.trim().length === 0) return;
            onSubmit?.(text);
            if (echoState === undefined) setInternalState('submitted');
          }}
        >
          {submitLabel}
        </button>
      </div>
      <p className={styles.microcopy}>{microcopy}</p>
      <p className={styles.hint}>{hint}</p>
    </section>
  );
}

export default EchoInput;