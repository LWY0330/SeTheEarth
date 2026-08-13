/* ============================================================
   看见地球 · v1.3 · useHotkeys (PR #13)
   - 9 个全局快捷键集中管理（避免散落在各组件 useEffect 里）
   - 移动端自动 disable（pointer:coarse 或 maxTouchPoints>0）
   - input/textarea 聚焦时除 Esc 外全部失效（与 search box 共存）
   - Ctrl/Meta/Alt 一律放行给系统快捷键；Shift 单独不影响
   - g+字母 前缀：500ms 超时自动取消
   - 0 依赖：纯 keydown listener（不引 react-router / 其他库）
   ============================================================ */

import { useEffect, useRef } from 'react';

export type HotkeyActions = {
  prevCity: () => void;       // ←           板块 2 上一城
  nextCity: () => void;       // →           板块 2 下一城
  moveDown: () => void;       // j           板块 2 列表向下移动焦点
  moveUp: () => void;         // k           板块 2 列表向上移动焦点
  focusSearch: () => void;    // /           聚焦搜索框
  showHelp: () => void;       // ? (toggle)  首次按：打开帮助 Modal
  hideHelp: () => void;       // ? (toggle)  再次按：关闭
  escape: () => void;         // Esc         关闭 drawer / 退出当前态（Modal 优先）
  goHome: () => void;         // g h         跳 /  home
  goCities: () => void;       // g c         跳 /cities
  goAbout: () => void;        // g a         跳 /about
};

const PRESS_G_TIMEOUT_MS = 500;

const isMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  // touch-first device：没有 hover、触屏主导
  if (window.matchMedia('(pointer: coarse)').matches) return true;
  if (typeof navigator !== 'undefined' && (navigator.maxTouchPoints ?? 0) > 0) return true;
  return false;
};

const isTypingTarget = (e: KeyboardEvent): boolean => {
  const t = e.target as HTMLElement | null;
  if (!t) return false;
  // button[type="button"] 等不在 input 列表里；但一些自定义 input role="textbox" 也算
  if (t.matches('input, textarea, [contenteditable="true"]')) return true;
  // aria role 兜底
  const role = t.getAttribute('role');
  if (role === 'textbox' || role === 'combobox' || role === 'searchbox') return true;
  return false;
};

const hasBlockingModifier = (e: KeyboardEvent): boolean =>
  // Ctrl/Cmd/Alt 一律不接管
  e.ctrlKey || e.metaKey || e.altKey;

const isLetter = (k: string): boolean => k.length === 1 && (k >= 'a' && k <= 'z');

/**
 * 在 App 顶层调用一次即可。
 * @param actions   各快捷键触发的业务回调
 * @param helpOpen  当前 HotkeyHelp Modal 是否打开。
 *                  必传，否则 `?` 无法判断是打开还是关闭。
 */
export function useHotkeys(actions: HotkeyActions, helpOpen?: boolean): void {
  // ref 持有最新 actions；避免 actions 变化时反复 add/remove listener
  const actionsRef = useRef(actions);
  actionsRef.current = actions;

  // helpOpen 也用 ref 镜像，避免 ? 触发的 showHelp/hideHelp 判断依赖外部重渲染
  const helpOpenRef = useRef<boolean>(!!helpOpen);
  helpOpenRef.current = !!helpOpen;

  // g+字母 前缀：gRef 记录"刚按 g 的时间戳"
  const gRef = useRef<number | null>(null);
  const gTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isMobile()) return;

    const clearG = () => {
      if (gTimerRef.current != null) {
        window.clearTimeout(gTimerRef.current);
        gTimerRef.current = null;
      }
      gRef.current = null;
    };

    const onKey = (e: KeyboardEvent) => {
      if (hasBlockingModifier(e)) return; // Ctrl/Meta/Alt 一律放行系统

      const key = e.key;
      const a = actionsRef.current;
      const typing = isTypingTarget(e);

      // Esc 是唯一在 input/textarea 聚焦时仍然生效的快捷键
      if (key === 'Escape') {
        e.preventDefault();
        a.escape();
        return;
      }
      if (typing) return;

      // g+字母 第二字母
      if (gRef.current != null) {
        if (isLetter(key)) {
          if (key === 'h') { e.preventDefault(); a.goHome(); clearG(); return; }
          if (key === 'c') { e.preventDefault(); a.goCities(); clearG(); return; }
          if (key === 'a') { e.preventDefault(); a.goAbout(); clearG(); return; }
          // 其它字母：取消 g 状态（不触发前缀）
          clearG();
        } else {
          // 非字母：取消 g 状态（不阻止 key 冒泡）
          clearG();
        }
      }

      // 单独按 g 启动前缀状态
      if (key === 'g') {
        e.preventDefault();
        gRef.current = Date.now();
        if (gTimerRef.current != null) window.clearTimeout(gTimerRef.current);
        gTimerRef.current = window.setTimeout(() => {
          gRef.current = null;
          gTimerRef.current = null;
        }, PRESS_G_TIMEOUT_MS);
        return;
      }

      // ? 切换 HotkeyHelp（无 modifier 强制）
      if (key === '?' || (key === '/' && e.shiftKey)) {
        e.preventDefault();
        if (helpOpenRef.current) a.hideHelp();
        else a.showHelp();
        return;
      }
      if (key === '/')       { e.preventDefault(); a.focusSearch(); return; }

      if (key === 'ArrowLeft')  { e.preventDefault(); a.prevCity(); return; }
      if (key === 'ArrowRight') { e.preventDefault(); a.nextCity(); return; }
      if (key === 'j' || key === 'ArrowDown') { e.preventDefault(); a.moveDown(); return; }
      if (key === 'k' || key === 'ArrowUp')   { e.preventDefault(); a.moveUp();   return; }
    };

    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      clearG();
    };
  }, []);
}
