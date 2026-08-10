/* ============================================================
   看见地球 · v2 · SearchBox (液态玻璃)
   - 半透明 + 折射高光 + 流动光带
   - 暖橘 focus ring
   - 输入支持中英 / city slug / 城市名模糊匹配
   ============================================================ */

import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import { cities } from '@/data/cities';
import styles from './SearchBox.module.css';

export type SearchBoxProps = {
  /** 触发搜索：返回被选中的城市 slug，未匹配返回 undefined */
  onSearch?: (slug: string | undefined, raw: string) => void;
  /** 自动聚焦 */
  autoFocus?: boolean;
};

export function SearchBox({ onSearch, autoFocus = false }: SearchBoxProps) {
  const [value, setValue] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // 模糊匹配：中文名 / 英文名 / 国家中英 / slug
  const matches = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return [];
    return cities
      .map((c, i) => {
        const haystack = [
          c.nameZh,
          c.nameEn,
          c.countryZh,
          c.countryEn,
          c.slug,
        ]
          .join(' ')
          .toLowerCase();
        const score = haystack.includes(q) ? i : -1;
        return { city: c, score };
      })
      .filter((m) => m.score >= 0)
      .map((m) => m.city);
  }, [value]);

  useEffect(() => {
    setActiveIdx(0);
  }, [matches.length]);

  // 外部点击关闭下拉
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: globalThis.MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  function commit(slug: string | undefined, raw: string) {
    onSearch?.(slug, raw);
    setOpen(false);
    inputRef.current?.blur();
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (matches.length > 0) {
      commit(matches[activeIdx]?.slug, value);
    } else {
      commit(undefined, value);
    }
  }

  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      setOpen(true);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, matches.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      <form className={styles.glass} onSubmit={onSubmit} role="search">
        {/* 顶部折射光带（液态玻璃特征） */}
        <span className={styles.shimmer} aria-hidden="true" />

        <span className={styles.icon} aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
            <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </span>

        <input
          ref={inputRef}
          type="text"
          className={styles.input}
          placeholder="搜索一座城市 · Search a city"
          value={value}
          autoFocus={autoFocus}
          autoComplete="off"
          spellCheck={false}
          onChange={(e) => {
            setValue(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKey}
          aria-label="搜索城市"
          aria-autocomplete="list"
          aria-expanded={open && matches.length > 0}
          aria-controls="search-suggestions"
        />

        <button
          type="submit"
          className={styles.submit}
          aria-label="搜索"
          tabIndex={-1}
        >
          <span>↵</span>
        </button>
      </form>

      {open && matches.length > 0 && (
        <ul id="search-suggestions" className={styles.suggest} role="listbox">
          {matches.map((c, i) => (
            <li
              key={c.slug}
              role="option"
              aria-selected={i === activeIdx}
              className={`${styles.suggestItem} ${
                i === activeIdx ? styles.suggestItemActive : ''
              }`}
              onMouseEnter={() => setActiveIdx(i)}
              onMouseDown={(e) => {
                e.preventDefault();
                commit(c.slug, c.nameZh);
              }}
            >
              <span className={styles.suggestName}>{c.nameZh}</span>
              <span className={styles.suggestEn}>{c.nameEn}</span>
              <span className={styles.suggestCountry}>
                {c.countryZh} · {c.countryEn}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SearchBox;
