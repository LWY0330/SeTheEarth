/* ============================================================
   看见地球 · v1.4 · UserCityPicker (PR #29)
   - 一次性城市选择 modal
   - 大洲 tab + 单列城市列表 + 隐私副标题
   - 键盘：Esc 关闭、Enter 确认、Tab 切换大洲、↑↓ 选城市
   - a11y：role="dialog" + aria-modal + aria-labelledby
   ============================================================ */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SUPPORTED_USER_CITIES, type UserCity } from '@/data/cities';
import { useUserCity } from './UserCityContext';
import styles from './UserCityPicker.module.css';

type Region = '亚洲' | '欧洲' | '美洲' | '非洲' | '大洋洲';

const REGIONS: ReadonlyArray<Region> = ['亚洲', '欧洲', '美洲', '非洲', '大洋洲'];

const TITLE_ID = 'user-city-picker-title';

export function UserCityPicker() {
  const { pickerOpen, closePicker, setUserCity } = useUserCity();
  const [region, setRegion] = useState<Region>('亚洲');
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // 当前 region 下的城市
  const citiesInRegion = useMemo<UserCity[]>(
    () => SUPPORTED_USER_CITIES.filter((c) => belongsTo(c, region)),
    [region],
  );

  // 默认选中当前 region 第一项；切换 region 时也重置选中
  useEffect(() => {
    if (citiesInRegion.length > 0) {
      setSelectedSlug(citiesInRegion[0].slug);
    } else {
      setSelectedSlug(null);
    }
  }, [citiesInRegion]);

  // 打开时记录 opener 以便关闭后还回焦点
  const lastFocusedRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (pickerOpen) {
      lastFocusedRef.current = document.activeElement as HTMLElement | null;
      // 把焦点放到 dialog 的第一个 tabbable
      requestAnimationFrame(() => {
        const first = dialogRef.current?.querySelector<HTMLElement>(
          'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        first?.focus();
      });
      // 锁滚动
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
        lastFocusedRef.current?.focus?.();
      };
    }
    return undefined;
  }, [pickerOpen]);

  // Esc 关闭
  useEffect(() => {
    if (!pickerOpen) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        closePicker();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [pickerOpen, closePicker]);

  const handleConfirm = useCallback(() => {
    if (!selectedSlug) return;
    const c = SUPPORTED_USER_CITIES.find((x) => x.slug === selectedSlug);
    if (c) setUserCity(c);
  }, [selectedSlug, setUserCity]);

  const onListKey = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const idx = citiesInRegion.findIndex((c) => c.slug === selectedSlug);
        if (idx < 0) return;
        const next =
          e.key === 'ArrowDown'
            ? (idx + 1) % citiesInRegion.length
            : (idx - 1 + citiesInRegion.length) % citiesInRegion.length;
        setSelectedSlug(citiesInRegion[next].slug);
        // 滚动到可见
        requestAnimationFrame(() => {
          const el = listRef.current?.querySelector<HTMLElement>(
            `[data-slug="${citiesInRegion[next].slug}"]`,
          );
          el?.scrollIntoView({ block: 'nearest' });
        });
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleConfirm();
      }
    },
    [citiesInRegion, selectedSlug, handleConfirm],
  );

  if (!pickerOpen) return null;

  return (
    <div
      className={styles.overlay}
      onClick={closePicker}
      role="presentation"
    >
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={TITLE_ID}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.header}>
          <h2 id={TITLE_ID} className={styles.title}>
            告诉我你在哪儿
          </h2>
          <button
            type="button"
            className={styles.close}
            onClick={closePicker}
            aria-label="关闭"
          >
            ×
          </button>
        </header>

        <p className={styles.subtitle}>
          只在你的浏览器里记一次，不上传任何服务器，不追踪。
        </p>

        {/* 大洲 tabs */}
        <div className={styles.tabs} role="tablist" aria-label="选择大洲">
          {REGIONS.map((r) => (
            <button
              key={r}
              type="button"
              role="tab"
              aria-selected={r === region}
              className={`${styles.tab}${r === region ? ` ${styles.tabActive}` : ''}`}
              onClick={() => setRegion(r)}
            >
              {r}
            </button>
          ))}
        </div>

        {/* 城市列表 */}
        <div
          ref={listRef}
          className={styles.list}
          role="listbox"
          aria-label="选择城市"
          tabIndex={0}
          onKeyDown={onListKey}
        >
          {citiesInRegion.length === 0 ? (
            <p className={styles.empty}>该大洲暂无可选城市。</p>
          ) : (
            citiesInRegion.map((c) => (
              <button
                key={c.slug}
                type="button"
                role="option"
                aria-selected={c.slug === selectedSlug}
                data-slug={c.slug}
                className={`${styles.option}${
                  c.slug === selectedSlug ? ` ${styles.optionActive}` : ''
                }`}
                onClick={() => setSelectedSlug(c.slug)}
              >
                <span className={styles.optZh}>{c.nameZh}</span>
                <span className={styles.optEn}>{c.nameEn}</span>
              </button>
            ))
          )}
        </div>

        <p className={styles.footnote}>
          未列出的城市暂不支持 · 我们只用它在浏览器里比对时差 / 温差
        </p>

        <footer className={styles.footer}>
          <button
            type="button"
            className={styles.cancel}
            onClick={closePicker}
          >
            取消
          </button>
          <button
            type="button"
            className={styles.confirm}
            onClick={handleConfirm}
            disabled={!selectedSlug}
          >
            确认
          </button>
        </footer>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   大洲归类（按 timezone 前缀）
   ──────────────────────────────────────────────────────────── */
function belongsTo(c: UserCity, region: Region): boolean {
  const tz = c.timezone;
  if (region === '亚洲') return tz.startsWith('Asia/');
  if (region === '欧洲') return tz.startsWith('Europe/');
  if (region === '美洲') return tz.startsWith('America/');
  if (region === '非洲') return tz.startsWith('Africa/');
  // 大洋洲（含 Pacific）
  return tz.startsWith('Australia/') || tz.startsWith('Pacific/');
}

export default UserCityPicker;
