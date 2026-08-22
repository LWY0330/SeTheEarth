/* ============================================================
   看见地球 · v2.32.0 · App
   - 集成 Router：city 路由直接渲染 CityPage
   - 板块 2 三态合并（focused ?? hovered ?? active）→ 单一 displayCity
   - 鼠标 hover 列表项 → 主图预热（带 80ms 防抖，由 CityIndex 控制）
   - 键盘 ↑ / ↓ 列表项 → 焦点 + focusedCityId 同步，主图预热
   - Esc 取消键盘焦点，恢复默认 active
   - 键盘 ← / → 不止翻主图，同时清掉 focusedCityId 防止它压制 active
   ============================================================ */

import { useCallback, useMemo, useRef, useState } from 'react';
import { cities, getFeaturedCities } from '@/data/cities';
import { liveEvents } from '@/data/liveMoments';
import { Router, useRoute, useNavigate } from '@/router/Router';
import SearchBox from '@/components/SearchBox';
import CityFeatured from '@/components/CityFeatured';
import CityIndex from '@/components/CityIndex';
import MomentsTimeline from '@/components/MomentsTimeline';
import EventDrawer from '@/components/EventDrawer';
import CityPage from '@/components/CityPage';
import UniversalCityPage from '@/components/UniversalCityPage';
import UnknownCoordinate from '@/components/UnknownCoordinate';
import { isUniversalCityPageEnabled } from '@/lib/featureFlags';
import CityIndexPage from '@/components/CityIndexPage';
import AboutPage from '@/components/AboutPage';
import Meta from '@/components/Meta';
import HotkeyHelp from '@/components/HotkeyHelp';
import { useHotkeys, type HotkeyActions } from '@/hooks/useHotkeys';
import styles from './App.module.css';

function HomeShell() {
  // 板块 2/3 的所有本地 state + refs 都收敛在 HomeShell；
  // CityPage 自己持有自己的 state（避免全屏重渲染）。
  // v2.50.0 · 板块 2 只列 6 个精选城市（其余 6 个仅在 /cities 出现）
  // ── 三态：focused（键盘）> hovered（鼠标）> active（默认 / ← → 浏览）
  const [hoveredCityId, setHoveredCityId] = useState<string | null>(null);
  const [focusedCityId, setFocusedCityId] = useState<string | null>(null);
  const [activeCityId, setActiveCityId] = useState<string>(() => {
    const featured = getFeaturedCities();
    return featured[0]?.id ?? cities[0].id;
  });

  // v1.3 · 板块 2 精选：mount 时算 1 次，整个 App 生命周期内不变（每次刷新页面 = 重新 mount）
  const featuredCities = useMemo(() => getFeaturedCities(), []);

  const displayCity =
    (focusedCityId ? cities.find((c) => c.id === focusedCityId) : undefined) ??
    (hoveredCityId ? cities.find((c) => c.id === hoveredCityId) : undefined) ??
    cities.find((c) => c.id === activeCityId) ??
    cities[0];

  const displayCityIndex = cities.findIndex((c) => c.id === displayCity.id);

  const goPrev = useCallback(() => {
    const i = featuredCities.findIndex((c) => c.id === activeCityId);
    const j = i < 0 ? 0 : (i - 1 + featuredCities.length) % featuredCities.length;
    setActiveCityId(featuredCities[j].id);
  }, [activeCityId, featuredCities]);
  const goNext = useCallback(() => {
    const i = featuredCities.findIndex((c) => c.id === activeCityId);
    const j = i < 0 ? 0 : (i + 1) % featuredCities.length;
    setActiveCityId(featuredCities[j].id);
  }, [activeCityId, featuredCities]);

  // ── 板块 3：硬性 6 条事件（v2.21 数据层约束 · 超出数据源在详情页/Archive 用） ──
  const events = useMemo(() => liveEvents.slice(0, 6), []);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const activeEvent = activeEventId
    ? events.find((e: { id: string }) => e.id === activeEventId) ?? null
    : null;

  // v1.3 · PR #13 · HotkeyHelp Modal 状态
  const [helpOpen, setHelpOpen] = useState<boolean>(false);

  // v1.3 · PR #13 · 路由导航（g h / g c / g a 用）
  const { push: navigate } = useNavigate();

  // v1.3 · PR #13 · 焦点检查：prevCity/nextCity/jk 只在 #cities 区域内触发
  const insideCities = (): boolean => {
    const root = citiesRef.current;
    if (!root) return false;
    const active = document.activeElement as HTMLElement | null;
    return !!active && (active === document.body || root.contains(active));
  };

  // v1.3 · PR #13 · 11 个快捷键 action 回调
  const actions: HotkeyActions = useMemo(() => ({
    prevCity: () => {
      if (!insideCities()) return;
      setFocusedCityId(null); // 清掉 focused，避免压制 active
      goPrev();
    },
    nextCity: () => {
      if (!insideCities()) return;
      setFocusedCityId(null);
      goNext();
    },
    moveDown: () => {
      if (!insideCities()) return;
      const i = featuredCities.findIndex((c) => c.id === (focusedCityId ?? activeCityId));
      const cur = i < 0 ? 0 : i;
      const next = featuredCities[(cur + 1) % featuredCities.length];
      setFocusedCityId(next.id);
    },
    moveUp: () => {
      if (!insideCities()) return;
      const i = featuredCities.findIndex((c) => c.id === (focusedCityId ?? activeCityId));
      const cur = i < 0 ? 0 : i;
      const prev = featuredCities[(cur - 1 + featuredCities.length) % featuredCities.length];
      setFocusedCityId(prev.id);
    },
    focusSearch: () => {
      const input = document.querySelector<HTMLInputElement>('input[aria-label="搜索城市"]');
      input?.focus();
      input?.select();
    },
    showHelp: () => setHelpOpen(true),
    hideHelp: () => setHelpOpen(false),
    // Esc 优先级：help modal > drawer > focused city
    escape: () => {
      if (helpOpen) { setHelpOpen(false); return; }
      if (activeEventId) { setActiveEventId(null); return; }
      if (focusedCityId) setFocusedCityId(null);
    },
    goHome:   () => navigate('/'),
    goCities: () => navigate('/cities'),
    goAbout:  () => navigate('/about'),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [goPrev, goNext, navigate, helpOpen, activeEventId, focusedCityId, activeCityId, featuredCities]);

  useHotkeys(actions, helpOpen);

  // ── Refs（用于导航） ──
  const heroRef = useRef<HTMLElement>(null);
  const citiesRef = useRef<HTMLElement>(null);
  const momentsRef = useRef<HTMLElement>(null);
  const whyRef = useRef<HTMLDetailsElement>(null);

  const scrollTo = (ref: React.RefObject<HTMLElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const findCityIdx = (slug: string): string | null => {
    const c = cities.find((x) => x.slug === slug);
    return c ? c.id : null;
  };

  return (
    <div className={styles.app}>
      <main id="main-content">
      <Meta
        title="看见地球 · See Earth"
        description="看见地球 — 沿时间轴穿越地球历史与生态"
        ogType="website"
        canonicalPath="/"
      />
      {/* ═══════ 首屏（v2.20 加价值主张 + 搜索建议 + 为什么看见地球） ═══════ */}
      <section className={styles.hero} ref={heroRef} id="hero">
        <header className={styles.header}>
          <a
            className={styles.logo}
            onClick={(e) => {
              e.preventDefault();
              scrollTo(heroRef);
            }}
            href="#hero"
          >
            <span className={styles.logoDot} aria-hidden="true" />
            <span className={styles.logoCn}>看见地球</span>
            <span className={styles.logoEn}>See Earth</span>
          </a>
          <nav className={styles.nav} aria-label="主导航">
            <a
              className={styles.navLink}
              onClick={(e) => { e.preventDefault(); scrollTo(citiesRef); }}
              href="#cities"
            >
              Cities
            </a>
            <a
              className={styles.navLink}
              onClick={(e) => { e.preventDefault(); scrollTo(momentsRef); }}
              href="#moments"
            >
              Journal
            </a>
            <a
              className={styles.navLink}
              onClick={(e) => {
                e.preventDefault();
                whyRef.current?.setAttribute('open', '');
                whyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              href="#about"
            >
              About
            </a>
          </nav>
        </header>

        <div className={styles.heroContent}>
          <h1 className={styles.title}>
            世界 · 不止<em className={styles.titleEm}>方寸</em>
          </h1>

          {/* 价值主张（v2.20 新增） */}
          <p className={styles.valueProp}>此刻，世界各地正在发生什么。</p>
          <p className={styles.valuePropEn}>Right now, somewhere on Earth.</p>

          <div className={styles.searchMount}>
            <SearchBox />
          </div>

          {/* 搜索建议（v2.20 新增） */}
          <div className={styles.suggestions} role="group" aria-label="搜索建议">
            <button
              type="button"
              className={styles.suggestion}
              onClick={() => {
                scrollTo(momentsRef);
                const tokyoEvent = events.find((e) => e.cityId === 'tokyo');
                if (tokyoEvent) setActiveEventId(tokyoEvent.id);
              }}
            >
              看东京此刻在发生什么
            </button>
            <button
              type="button"
              className={styles.suggestion}
              onClick={() => {
                scrollTo(citiesRef);
                const nycId = findCityIdx('newyork');
                if (nycId) {
                  setActiveCityId(nycId);
                  setFocusedCityId(null);
                }
              }}
            >
              纽约 / 上海 / 伦敦
            </button>
            <button
              type="button"
              className={styles.suggestion}
              onClick={() => {
                const input = document.querySelector<HTMLInputElement>('input[type="search"]');
                input?.focus();
                input?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
            >
              搜索一个城市
            </button>
          </div>

          {/* 为什么看见地球（v2.20 新增 · 可展开） */}
          <details className={styles.why} ref={whyRef} id="about">
            <summary className={styles.whySummary}>
              <span>为什么看见地球</span>
              <span className={styles.whySummaryEn}>Why See Earth?</span>
              <span className={styles.whyArrow} aria-hidden="true">↓</span>
            </summary>
            <div className={styles.whyContent}>
              <p>
                看见地球是观察世界的窗口。
                <br />
                看到不同城市此刻正在发生的事。
                <br />
                不依赖个人推荐算法。
                <br />
                内容由编辑筛选 + 真实数据混合。
              </p>
            </div>
          </details>

          <p className={styles.scrollHint}>
            <span aria-hidden="true">↓</span> 上滑探索
          </p>
        </div>
      </section>

      {/* ═══════ 板块 2：6 城市（主+索引） ═══════ */}
      <section
        ref={citiesRef}
        id="cities"
        className={styles.citiesSection}
        aria-label="城市精选"
      >
        <header className={styles.sectionHeader}>
          <span className={styles.sectionNumber}>
            {String(displayCityIndex + 1).padStart(2, '0')} / {String(featuredCities.length).padStart(2, '0')} ATLAS
          </span>
          <div className={styles.sectionTitleBlock}>
            <h2 className={styles.sectionTitle}>
              此刻 · {featuredCities.length} 座城市
            </h2>
            <p className={styles.sectionSubtitle}>
              Six cities, right now.
            </p>
          </div>
        </header>

        <div className={styles.citiesLayout}>
          <div className={styles.featuredCol}>
            <CityFeatured
              key={displayCity.id}
              city={displayCity}
              index={displayCityIndex}
              total={featuredCities.length}
              onPrev={goPrev}
              onNext={goNext}
            />
          </div>
          <div className={styles.indexCol}>
            <CityIndex
              cities={featuredCities}
              activeCityId={displayCity.id}
              baseIndex={0}
              totalCityCount={cities.length}
              onHover={setHoveredCityId}
              onFocus={setFocusedCityId}
            />
          </div>
        </div>
      </section>

      {/* ═══════ 板块 3：v2-E 实时事件（编辑精选 · 单组件全宽） ═══════ */}
      <section
        ref={momentsRef}
        id="moments"
        className={styles.momentsSection}
        aria-labelledby="moments-title"
      >
        <header className={styles.momentsHeader}>
          <span className={styles.momentsNumber}>02 / EDITORIAL</span>
          <h2 id="moments-title" className={styles.momentsTitle}>
            同一时间，不同地方，不同命运
          </h2>
          <p className={styles.momentsSubtitle}>
            Right now, somewhere on Earth — these 6 things are happening.
          </p>
        </header>

        <div className={styles.momentsTimelineWrap}>
          <MomentsTimeline
            events={events}
            activeEventId={activeEventId}
            onSelectEvent={(ev) => setActiveEventId(ev.id)}
          />
        </div>
      </section>

      {/* 详情抽屉 */}
      <EventDrawer event={activeEvent} onClose={() => setActiveEventId(null)} />

      {/* v1.3 · PR #13 · 中央快捷键帮助 Modal */}
      <HotkeyHelp open={helpOpen} onClose={() => setHelpOpen(false)} />
      </main>
    </div>
  );
}


function AppRoutes() {
  const route = useRoute();
  if (route.name === 'cities-index') {
    return <main><CityIndexPage /></main>;
  }
  if (route.name === 'about') {
    return <main><AboutPage /></main>;
  }
  if (route.name === 'city') {
    // v1.6.3 · PROMPT 44 v1:Router 双轨
    // - VITE_USE_UNIVERSAL_CITYPAGE=true  → UniversalCityPage(Phase 2 收口组件)
    // - VITE_USE_UNIVERSAL_CITYPAGE=false → 保留 legacy v1.4 CityPage(默认)
    if (isUniversalCityPageEnabled()) {
      return <main><UniversalCityPage /></main>;
    }
    return <main><CityPage /></main>;
  }
  if (route.name === 'unknown') {
    return <main><UnknownCoordinate /></main>;
  }
  return <HomeShell />;
}

export function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
