/* ============================================================
   Modal · v1.5 · ui/Modal
   - size: sm / md / lg (320 / 560 / 720)
   - closable: 显示右上 ✕,Esc 关闭由 useHotkeys 集中处理
   - role="dialog" aria-modal="true" aria-labelledby 关联标题 id
   - 受控 open + onClose(0 业务逻辑)
   ============================================================ */

import type { ReactNode } from 'react';
import { useEffect, useId } from 'react';
import styles from './Modal.module.css';

export type ModalSize = 'sm' | 'md' | 'lg';

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  size?: ModalSize;
  closable?: boolean;            /* 默认 true · 显示右上关闭按钮 */
  /** 必填 · Modal 标题(屏幕阅读器读出) */
  title: string;
  /** 右上角关闭按钮 aria-label */
  closeLabel?: string;
  children: ReactNode;
};

/**
 * 通用 Modal。
 *
 * @example basic
 *   <Modal open={isOpen} onClose={() => setIsOpen(false)} title="选择城市">
 *     <UserCityPicker />
 *   </Modal>
 *
 * @example HotkeyHelp 风格
 *   <Modal open={helpOpen} onClose={hideHelp} title="快捷键" size="sm">
 *     <HotkeyHelpTable />
 *   </Modal>
 */
export function Modal({
  open,
  onClose,
  size = 'md',
  closable = true,
  title,
  closeLabel = '关闭',
  children,
}: ModalProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    // body scroll lock
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
      role="presentation"
    >
      <div
        className={[styles.dialog, styles[`s-${size}`]].join(' ')}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.header}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          {closable && (
            <button
              type="button"
              className={styles.close}
              onClick={onClose}
              aria-label={closeLabel}
            >
              ✕
            </button>
          )}
        </header>
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
}
