/* EarthGlobe · A programmatically drawn, continuously rotating Earth.
 *
 * Why not a real equirectangular world map?
 *   - M0 must run fully offline (no asset downloads).
 *   - A stylised continent set keeps the file tiny while still reading as
 *     "the Earth" — and it leaves room for a proper dataset in M1.
 *
 * Layout:
 *   - viewBox is 2:1 (200 x 100), matching a flat world map.
 *   - Two identical continent strips are placed side-by-side; the wrapping
 *     `<g>` translates by -50% forever, producing a seamless spin.
 *   - CSS layers add day/night shading, specular highlight, drifting clouds,
 *     atmospheric glow and a starfield.
 */

import styles from './EarthGlobe.module.css';

const CONTINENTS = (
  <g fill="var(--land-mass)">
    {/* North America */}
    <path d="M8,32 Q14,18 28,22 Q38,24 42,32 Q44,40 38,46 Q30,52 22,50 Q12,46 8,38 Z"
          opacity="0.92" />
    {/* South America */}
    <path d="M32,52 Q40,50 44,58 Q46,68 42,76 Q36,84 30,80 Q24,72 28,60 Z"
          opacity="0.92" />
    {/* Europe */}
    <path d="M52,24 Q60,20 66,24 Q72,28 70,34 Q62,38 56,36 Q50,32 52,24 Z"
          opacity="0.88" />
    {/* Africa */}
    <path d="M58,38 Q68,36 74,44 Q78,56 72,66 Q64,72 56,64 Q52,52 58,38 Z"
          opacity="0.92" />
    {/* Asia */}
    <path d="M72,18 Q90,12 110,18 Q124,22 128,32 Q126,44 116,48 Q100,50 86,44 Q72,36 72,18 Z"
          opacity="0.92" />
    {/* Australia */}
    <path d="M128,62 Q140,58 148,62 Q154,68 150,74 Q140,78 132,74 Q126,68 128,62 Z"
          opacity="0.85" />
    {/* Antarctica strip */}
    <path d="M0,90 Q40,86 80,90 Q120,86 200,90 L200,100 L0,100 Z"
          fill="var(--ice-pale)" opacity="0.85" />
    {/* Greenland dot */}
    <path d="M44,16 Q50,12 54,16 Q54,22 48,22 Q42,20 44,16 Z"
          fill="var(--ice-pale)" opacity="0.9" />
  </g>
);

const OCEAN_GRADIENT_ID = 'earth-ocean';
const SHINE_GRADIENT_ID = 'earth-shine';

export interface EarthGlobeProps {
  /** Accessible label for screen readers. */
  label?: string;
}

/**
 * Drop the globe into any block. It will fill the width of its parent while
 * keeping a perfect 1:1 aspect ratio, capped at 520px on wide screens.
 */
export function EarthGlobe({ label = '自转的地球' }: EarthGlobeProps) {
  return (
    <div className={styles.globe} role="img" aria-label={label}>
      {/* Twinkling star backdrop (purely decorative) */}
      <div className={styles.stars} aria-hidden="true">
        <span /><span /><span /><span /><span /><span />
        <span /><span /><span /><span /><span /><span />
      </div>

      {/* Earth — SVG stripes are duplicated horizontally and translated by -50%
          forever to simulate rotation. */}
      <div className={styles.frame}>
        <div className={styles.surface}>
          <svg
            className={styles.svg}
            viewBox="0 0 200 100"
            preserveAspectRatio="xMidYMid slice"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <defs>
              <radialGradient id={OCEAN_GRADIENT_ID} cx="35%" cy="35%" r="80%">
                <stop offset="0%"  stopColor="var(--ocean-mid)" />
                <stop offset="60%" stopColor="var(--ocean-deep)" />
                <stop offset="100%" stopColor="var(--space-deepest)" />
              </radialGradient>
              <radialGradient id={SHINE_GRADIENT_ID} cx="25%" cy="20%" r="50%">
                <stop offset="0%"  stopColor="rgba(233,244,255,.35)" />
                <stop offset="100%" stopColor="rgba(233,244,255,0)" />
              </radialGradient>
            </defs>

            {/* Two side-by-side hemisphere strips so the -50% loop is seamless. */}
            <g>
              <rect x="0" y="0" width="200" height="100" fill={`url(#${OCEAN_GRADIENT_ID})`} />
              <g transform="translate(0,0)">{CONTINENTS}</g>
              <g transform="translate(100,0)">{CONTINENTS}</g>
              <rect x="0" y="0" width="200" height="100" fill={`url(#${SHINE_GRADIENT_ID})`} />
            </g>
          </svg>

          <div className={styles.clouds} aria-hidden="true" />
          <div className={styles.shading} aria-hidden="true" />
          <div className={styles.specular} aria-hidden="true" />
        </div>
        <div className={styles.atmosphere} aria-hidden="true" />
      </div>
    </div>
  );
}

export default EarthGlobe;
