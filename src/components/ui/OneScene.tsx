/* ============================================================
   看见地球 · v1.6.4 · PROMPT 46 v1 · OneScene
   ------------------------------------------------------------
   - 一个具体瞬间(图 + 4 行 italic 描述)
   - 9 列图 + 3 列文字(spec §2.4.6 LOCKED)
   - City Detail 专用
   ============================================================ */

import type { ComponentState, LayerColor } from './types';
import { LAYER_CSS_VAR } from './types';
import styles from './OneScene.module.css';

export interface OneSceneProps {
  image: string;
  description: string;
  time: string;
  location: string;
  layer?: LayerColor;
  state?: ComponentState;
  className?: string;
}

export function OneScene({
  image,
  description,
  time,
  location,
  layer,
  state = 'default',
  className,
}: OneSceneProps) {
  const rootClass = [
    styles.oneScene,
    styles[`oneScene--${state}`],
    className,
  ].filter(Boolean).join(' ');

  const colorStyle = layer ? { color: LAYER_CSS_VAR[layer] } : undefined;

  return (
    <section className={rootClass} data-state={state} data-layer={layer ?? 'none'}>
      <div className={styles.grid}>
        <div className={styles.imageCol}>
          <img className={styles.image} src={image} alt={description} loading="lazy" />
        </div>
        <div className={styles.textCol}>
          <span className={styles.time} style={colorStyle}>
            {time}
          </span>
          <p className={styles.description}>
            <span className={styles.location}>{location}</span>
            <br />
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}

export default OneScene;