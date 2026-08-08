/* ============================================================
   看见地球 · v2.30.0 · 极简 client-side router
   - 0 依赖，纯 History API + popstate + patched pushState/replaceState
   - 路由形态：
       /                    -> home (App 顶层)
       /cities/:slug        -> city detail
       其他                 -> home
   - 组件：
       <Router>             => 注册 popstate 监听、暴露 route context
       <Link href="...">    => 真实 <a> 元素，左键点击不刷新只 pushState
       useRoute()           => 返回当前 route
       useNavigate()        => 返回 push/replace/back 函数
       matchRoutes(path)    => 工具：解析 path → { name, params }
   ============================================================ */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

/* ─────── 路由形态 ─────── */
export type Route =
  | { name: 'home'; path: '/' }
  | { name: 'cities-index'; path: '/cities' }
  | { name: 'city'; slug: string; path: string };

export type RouteMatch = {
  name: Route['name'];
  params: Record<string, string>;
  path: string;
};

export function matchRoutes(path: string): RouteMatch {
  // 标准化：去掉 query/hash，方便解析
  const clean = path.split('?')[0].split('#')[0];
  if (clean === '/' || clean === '') {
    return { name: 'home', params: {}, path: '/' };
  }
  // /cities 单独 → 全集索引页
  if (clean === '/cities' || clean === '/cities/') {
    return { name: 'cities-index', params: {}, path: '/cities' };
  }
  // /cities/<slug> → 城市详情
  const cityMatch = clean.match(/^\/cities\/([a-z0-9-]+)\/?$/i);
  if (cityMatch) {
    return { name: 'city', params: { slug: cityMatch[1] }, path: clean };
  }
  // 未知路由 → 退回 home
  return { name: 'home', params: {}, path: '/' };
}

/* ─────── Router Context ─────── */
type RouterContextValue = {
  route: RouteMatch;
  push: (href: string) => void;
  replace: (href: string) => void;
  back: () => void;
};

const RouterContext = createContext<RouterContextValue | null>(null);

export function useRoute(): RouteMatch {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('useRoute must be used within <Router>');
  return ctx.route;
}

export function useNavigate(): RouterContextValue {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('useNavigate must be used within <Router>');
  return ctx;
}

/* ─────── 拦截 pushState/replaceState 让 popstate 总能接到 ─────── */
if (typeof window !== 'undefined') {
  const origPush = window.history.pushState.bind(window.history);
  const origReplace = window.history.replaceState.bind(window.history);
  // 用全局事件让 <Router> 监听
  window.history.pushState = function (...args: Parameters<typeof origPush>) {
    origPush(...args);
    window.dispatchEvent(new Event('pushstate'));
  };
  window.history.replaceState = function (...args: Parameters<typeof origReplace>) {
    origReplace(...args);
    window.dispatchEvent(new Event('replacestate'));
  };
}

/* ─────── <Router> Provider ─────── */
export type RouterProps = {
  children: ReactNode;
  /** 默认起点（SSR/初次载入使用） */
  initialPath?: string;
};

export function Router({ children, initialPath }: RouterProps) {
  const [route, setRoute] = useState<RouteMatch>(() =>
    matchRoutes(initialPath ?? (typeof window !== 'undefined' ? window.location.pathname : '/'))
  );

  useEffect(() => {
    const sync = () => setRoute(matchRoutes(window.location.pathname));
    window.addEventListener('popstate', sync);
    window.addEventListener('pushstate', sync);
    window.addEventListener('replacestate', sync);
    return () => {
      window.removeEventListener('popstate', sync);
      window.removeEventListener('pushstate', sync);
      window.removeEventListener('replacestate', sync);
    };
  }, []);

  // 路由切换时让浏览器滚动到 top
  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [route.name, route.path]);

  const push = useCallback((href: string) => {
    window.history.pushState({}, '', href);
  }, []);
  const replace = useCallback((href: string) => {
    window.history.replaceState({}, '', href);
  }, []);
  const back = useCallback(() => {
    window.history.back();
  }, []);

  const value = useMemo<RouterContextValue>(
    () => ({ route, push, replace, back }),
    [route, push, replace, back]
  );

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

/* ─────── <Link> 真实 <a> 元素 + 左键拦截 ─────── */
/**
 * Link 渲染为真实的 <a href>。
 * 中键 / Ctrl / Cmd / Shift / 外链 → 浏览器原生行为（不拦截，新标签页打开）。
 * 左键无修饰键 → preventDefault + pushState（原地 SPA 导航）。
 *
 * 其余 React / DOM 属性通过 ...rest 直接落到 <a> 上。
 */
export type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  external?: boolean;
};

export function Link({
  href,
  className,
  children,
  external,
  onClick,
  style,
  ...rest
}: LinkProps) {
  return (
    <a
      {...rest}
      href={href}
      className={className}
      style={style}
      onClick={(e) => {
        // 中键 / Ctrl/Cmd/Shift 点击 / 外链 → 放行浏览器原生
        if (external) return;
        if (e.button !== 0) return;
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        onClick?.(e);
        e.preventDefault();
        window.history.pushState({}, '', href);
      }}
    >
      {children}
    </a>
  );
}
