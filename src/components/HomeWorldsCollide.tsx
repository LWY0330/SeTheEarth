/* ============================================================
   看见地球 · v2-phase15 · HomeWorldsCollide
   - 3 城同秒对比：Khartoum (red) / Reykjavík (blue) / Lisbon (yellow)
   - 数据：mockup 中的具体时刻 + 一句观察
   - Khartoum 占位（数据缺）
   ============================================================ */

import styles from './HomeWorldsCollide.module.css';

const CITY_STREET_IMAGES: Record<string, string> = {
  reykjavik: 'https://images.unsplash.com/photo-1708017591604-25796717d692?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  lisbon:    'https://images.pexels.com/photos/35583235/pexels-photo-35583235.jpeg',
  khartoum:  '', // 占位
};

interface CollideRow {
  id: string;
  cityNameZh: string;
  cityNameEn: string;
  country: string;
  layer: 'red' | 'blue' | 'yellow';
  time: string;        // 显示时间（如 "02:41"）
  offset: string;      // UTC offset（如 "UTC+2"）
  imageUrl: string;    // '' = 用占位
  observation: string;
  timezone: string;
  latitude: string;
  longitude: string;
}

const COLLIDE_DATA: CollideRow[] = [
  {
    id: 'khartoum',
    cityNameZh: '喀土穆',
    cityNameEn: 'Khartoum',
    country: 'SUDAN',
    layer: 'red',
    time: '02:41',
    offset: 'UTC+2',
    imageUrl: '',
    observation: '南郊 30 公里,一处军事据点在午后遭到第二轮炮击。当地志愿者正在转移伤员。',
    timezone: 'Africa/Khartoum',
    latitude: '15°35′N',
    longitude: '32°33′E',
  },
  {
    id: 'reykjavik',
    cityNameZh: '雷克雅未克',
    cityNameEn: 'Reykjavík',
    country: 'ICELAND',
    layer: 'blue',
    time: '08:41',
    offset: 'UTC+0',
    imageUrl: CITY_STREET_IMAGES.reykjavik,
    observation: '极昼前最后一夜。港口外的水面正反射着不肯落下的太阳。',
    timezone: 'Atlantic/Reykjavik',
    latitude: '64°08′N',
    longitude: '21°56′W',
  },
  {
    id: 'lisbon',
    cityNameZh: '里斯本',
    cityNameEn: 'Lisbon',
    country: 'PORTUGAL',
    layer: 'yellow',
    time: '13:41',
    offset: 'UTC+1',
    imageUrl: CITY_STREET_IMAGES.lisbon,
    observation: '电车 28 路在 Alfama 老坡爬坡。司机按喇叭,不是因为危险,而是因为高兴。',
    timezone: 'Europe/Lisbon',
    latitude: '38°43′N',
    longitude: '9°08′W',
  },
];

export function HomeWorldsCollide() {
  return (
    <section className={styles.section} id="collide" aria-label="三座城市,同一秒 · Worlds Collide">
      <div className={styles.inner}>
        <header className={styles.headerRow}>
          <div className={styles.headerLeft}>
            <div className={styles.kicker}>
              <span className={styles.kickerNum}>02</span>
              <span className={styles.kickerSep}>/</span>
              04
              <span className={styles.kickerSep}>·</span>
              WORLDS COLLIDE
            </div>
            <h2 className={styles.sectionTitle}>
              三座城市,<br />
              <em>同一秒</em>。
            </h2>
          </div>
          <div className={styles.headerRight}>
            <p className={styles.subtitleText}>
              不评价,不叙述,不消化。<br />
              只是把今天这一刻,并置在同一屏上。
            </p>
          </div>
        </header>

        <div className={styles.row}>
          {COLLIDE_DATA.map((row) => {
            return (
              <article key={row.id} className={styles.cityCard} data-layer={row.layer}>
                {row.imageUrl ? (
                  <img
                    className={styles.cardImage}
                    src={row.imageUrl}
                    alt={`${row.cityNameEn} 街景`}
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className={styles.cardPlaceholder}>
                    <div className={styles.cardPlaceholderLabel}>
                      KHARTOUM<br />
                      (Red Layer · 占位)
                    </div>
                  </div>
                )}
                <div className={styles.cardOverlay} aria-hidden="true" />
                <span
                  className={`${styles.cardDot} ${styles[row.layer]}`}
                  aria-hidden="true"
                />

                <div className={styles.cardBody}>
                  <span className={styles.bigTime}>{row.time}</span>
                  <div>
                    <h3 className={styles.cityNameZh}>{row.cityNameZh}</h3>
                    <span className={styles.cityNameEn}>
                      {row.cityNameEn} · {row.country}
                    </span>
                  </div>
                  <p className={styles.observation}>{row.observation}</p>

                  <div className={styles.cardMeta}>
                    <span>{row.offset}</span>
                    <span>{row.latitude}</span>
                    <span>{row.longitude}</span>
                    <span className={`${styles.cardMetaLayer} ${styles[row.layer]}`}>
                      · &nbsp; {row.layer}
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default HomeWorldsCollide;
