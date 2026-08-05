/* App · See Earth — M0 layout shell.
 *
 * Two stacked regions:
 *   1. Hero with the rotating Earth
 *   2. Horizontal timeline
 *
 * All styling tokens flow from styles/tokens.css; everything else lives in
 * the per-component CSS module.
 */

import EarthGlobe from '@/components/EarthGlobe';
import Timeline from '@/components/Timeline';
import heroStyles from './App.module.css';

export function App() {
  return (
    <main className={heroStyles.shell}>
      <section className={heroStyles.hero} aria-labelledby="hero-heading">
        <div className={heroStyles.heroCopy}>
          <span className={heroStyles.eyebrow}>
            <span className={heroStyles.eyebrowDot} aria-hidden="true" />
            See Earth · M0 prototype
          </span>
          <h1 id="hero-heading" className={heroStyles.title}>
            看见<span className={heroStyles.titleAccent}>地球</span>
          </h1>
          <p className={heroStyles.lede}>
            一段跨越四十六亿年的旅程。我们已习惯抬头看见月亮,
            却很少凝视脚下这颗蓝色星球的全部时间——
            它从何而来,如何变成今天的样子,又将往哪里去。
          </p>
          <ul className={heroStyles.metaList}>
            <li>
              <strong>9</strong>
              <span>关键节点</span>
            </li>
            <li>
              <strong>4.6 Ga</strong>
              <span>向后回望</span>
            </li>
            <li>
              <strong>Now</strong>
              <span>刚刚开始</span>
            </li>
          </ul>
          <a className={heroStyles.scrollHint} href="#timeline-heading">
            沿时间轴向下查看 ↓
          </a>
        </div>

        <div className={heroStyles.heroGlobe} aria-hidden="false">
          <EarthGlobe />
        </div>
      </section>

      <Timeline
        eyebrow="A 4.6-billion-year arc"
        title="沿着时间轴,慢慢看"
        subtitle="点击任意节点,或用键盘 ← → 切换。每一格都是这颗星球的一次转身。"
      />
    </main>
  );
}

export default App;
