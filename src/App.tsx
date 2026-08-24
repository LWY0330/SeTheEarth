/* ============================================================
   看见地球 · v2-phase15 · App.tsx · HomeShell Comprehensive Rewrite
   ------------------------------------------------------------
   - 集成 4 个新板块组件：HomeHero / HomeLiveEvents / HomeCoordinates / HomeWorldsCollide
   - 顶部导航：GlobalHeader 7 项（Cities | Journal | Earth Archive | Spotlight | Unknown | My Coordinates | About）
   - 移除 SVG EarthGlobe import（被真实地球图替换）
   - 保留 11 城 / 6 moment / 12 live event 数据（不删除）
   - 不实现 Witness POST / Echo 提交 / Phase 2 范围
   - 复用 tokens.css / globals.css / ui/GlobalHeader
   ============================================================ */

import { Router, useRoute } from '@/router/Router';
import CityPage from '@/components/CityPage';
import UniversalCityPage from '@/components/UniversalCityPage';
import UnknownCoordinate from '@/components/UnknownCoordinate';
import { isUniversalCityPageEnabled } from '@/lib/featureFlags';
import CityIndexPage from '@/components/CityIndexPage';
import AboutPage from '@/components/AboutPage';
import Meta from '@/components/Meta';

import { GlobalHeader as DesignSystemHeader } from '@/components/ui/GlobalHeader';
import HomeHero from '@/components/HomeHero';
import HomeLiveEvents from '@/components/HomeLiveEvents';
import HomeCoordinates from '@/components/HomeCoordinates';
import HomeWorldsCollide from '@/components/HomeWorldsCollide';
import HomeEarthArchive from '@/components/HomeEarthArchive';

import styles from './App.module.css';

/* ============================================================
   7 项导航（per v2-phase15 mockup · home-hero-desktop.png）
   ============================================================ */
const HOME_NAV_ITEMS = [
  { label: 'Cities',          href: '#cities' },
  { label: 'Journal',         href: '#events' },
  { label: 'Earth Archive',   href: '#archive' },
  { label: 'Spotlight',       href: '#spotlight' },
  { label: 'Unknown',         href: '/unknown' },
  { label: 'My Coordinates',  href: '#my-coordinates' },
  { label: 'About',           href: '#about', active: true },
] as const;

function HomeShell() {
  return (
    <div className={styles.app}>
      <main id="main-content">
        <Meta
          title="看见地球 · See Earth"
          description="看见地球 — 沿时间轴穿越地球历史与生态"
          ogType="website"
          canonicalPath="/"
        />

        {/* ── 顶部透明导航（覆盖在 Hero 上） ── */}
        <div className={styles.headerWrap}>
          <DesignSystemHeader
            logo={{ cn: '看见地球', en: 'SEE EARTH' }}
            navItems={HOME_NAV_ITEMS.map((item) => ({
              label: item.label,
              href: item.href,
              active: 'active' in item ? item.active : false,
            }))}
            simplified
          />
        </div>

        {/* ── 板块 1：Hero（全屏真实地球 + 4 角时间 + 主标题） ── */}
        <HomeHero />

        {/* ── 板块 2：12 个同时运转的远方（真实街景图） ── */}
        <HomeCoordinates />

        {/* ── 板块 3：地球上正在发生的事（4 行 live event） ── */}
        <HomeLiveEvents />

        {/* ── 板块 4：三座城市 · 同一秒（同秒对比） ── */}
        <HomeWorldsCollide />

        {/* ── 板块 5：地球档案 · 一条 46 亿年的弧线（时间尺度叙事） ── */}
        <HomeEarthArchive />
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
