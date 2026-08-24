/* ============================================================
   看见地球 · v2-phase15 · HomeEarthArchive
   - 第 5 板块：地球档案（46 亿年弧线）
   - 数据：自包含的 9 节点时间轴（per mockup · home-earth-archive-desktop.png）
   - 不使用 liveMoments / moments（这是时间尺度叙事，不是 live event）
   - A2 LOCK:冷白底 + Earth Blue 强调 + 0 大圆角 + 0 阴影
   ============================================================ */

import styles from './HomeEarthArchive.module.css';

/* ---------- 9 节点数据（自包含 · per mockup） ---------- */

interface ArchiveNode {
  id: string;
  yearLabel: string;          // "13.8B" / "4.6B" / ...
  yearLabelZh: string;        // "138 亿年" / "46 亿年" / ...
  titleZh: string;            // "宇宙起源" / "地球形成" / ...
  titleLatin: string;         // 拉丁名 / 英文名（如 "Homo sapiens"）
  descriptionZh: string;      // 一句描述
  location?: string;          // "EAST AFRICA · -1.40°N 35.01°E"
  accent: 'stellar' | 'life' | 'warm' | 'human';
}

const ARCHIVE_NODES: readonly ArchiveNode[] = [
  {
    id: 'big-bang',
    yearLabel: '13.8B',
    yearLabelZh: '138 亿年',
    titleZh: '宇宙起源',
    titleLatin: 'Big Bang',
    descriptionZh: '一次密度与温度的极端事件,开启了时间、空间与一切后续。',
    accent: 'stellar',
  },
  {
    id: 'earth-form',
    yearLabel: '4.6B',
    yearLabelZh: '46 亿年',
    titleZh: '太阳星云凝聚',
    titleLatin: 'Solar nebula condenses',
    descriptionZh: '一片由气体与尘埃构成的原始星云在引力作用下塌缩,中央点燃了太阳,周围的盘面上开始聚集成团——这就是地球的摇篮。',
    accent: 'stellar',
  },
  {
    id: 'moon-form',
    yearLabel: '4.4B',
    yearLabelZh: '44 亿年',
    titleZh: '第一片海洋',
    titleLatin: 'First oceans',
    descriptionZh: '火山排气带出水汽,冷却后汇聚成全球性的海洋。液态水让地球从此区别于其他岩质行星,也成为后续生命反应的溶剂。',
    accent: 'stellar',
  },
  {
    id: 'life-begins',
    yearLabel: '3.8B',
    yearLabelZh: '38 亿年',
    titleZh: '生命起源',
    titleLatin: 'Earliest life',
    descriptionZh: '深海热泉附近的化学梯度催生了最早的原核生命。几十亿年里,它们将以氧气重塑大气,也将改写整个星球的命运。',
    accent: 'life',
  },
  {
    id: 'great-oxidation',
    yearLabel: '2.4B',
    yearLabelZh: '24 亿年',
    titleZh: '大氧化事件',
    titleLatin: 'Great Oxidation Event',
    descriptionZh: '蓝藻光合作用产生的氧气开始在地表富集,让海洋的铁沉淀成今天的铁矿层,也为更复杂的生命铺平了路。',
    accent: 'life',
  },
  {
    id: 'cambrian',
    yearLabel: '540M',
    yearLabelZh: '5.4 亿年',
    titleZh: '寒武纪大爆发',
    titleLatin: 'Cambrian explosion',
    descriptionZh: '短短两千万年内出现了几乎所有现代动物门类的祖先。眼睛、骨骼、掠食者——可识别的复杂生命在海洋里大规模登陆。',
    accent: 'life',
  },
  {
    id: 'dinosaurs-end',
    yearLabel: '66M',
    yearLabelZh: '6600 万年',
    titleZh: '恐龙纪终结',
    titleLatin: 'End of the dinosaurs',
    descriptionZh: '一颗小行星终结了白垩纪。失去恐龙的生态位,小型哺乳动物迅速多样化——这是智人几千万年后的遥远序章。',
    accent: 'warm',
  },
  {
    id: 'hominin',
    yearLabel: '300K',
    yearLabelZh: '30 万年',
    titleZh: '智人出现',
    titleLatin: 'Homo sapiens',
    descriptionZh: '在东非的大平原上,一群直立行走的灵长类开始用符号思考。约 7 万年后,他们的后代会把一颗蓝珠改造成此刻的样子。',
    location: 'EAST AFRICA · -1.40°N 35.01°E',
    accent: 'human',
  },
  {
    id: 'now',
    yearLabel: 'NOW',
    yearLabelZh: '此刻',
    titleZh: '看见地球',
    titleLatin: 'See Earth — now',
    descriptionZh: '站在这里,从近地轨道看到的地球:一粒在虚空中自转的蓝珠。这颗行星的下一幕,由你我的每一个选择书写。',
    accent: 'human',
  },
];

/* ---------- 默认 active = 智人出现 (sequence 06/09 = 第 8 个,index 7) ---------- */
const ACTIVE_INDEX = 7;  // 智人出现

export function HomeEarthArchive() {
  const active = ARCHIVE_NODES[ACTIVE_INDEX];

  return (
    <section className={styles.section} id="archive" aria-label="地球档案 · 一条 46 亿年的弧线">
      <div className={styles.inner}>
        {/* ── Header ── */}
        <header className={styles.headerRow}>
          <div className={styles.headerLeft}>
            <div className={styles.kicker}>
              <span className={styles.kickerNum}>03</span>
              <span className={styles.kickerSep}>/</span>
              04
              <span className={styles.kickerSep}>·</span>
              EARTH ARCHIVE
            </div>
            <h2 className={styles.sectionTitle}>
              一条 <em>46 亿年</em>
              <br />
              的弧线
            </h2>
          </div>
          <div className={styles.headerRight}>
            <p className={styles.subtitleText}>
              9 个关键节点,沿对数时间轴慢慢看去。<br />
              地球不是凭空出现的,你的存在是其中一格。
            </p>
          </div>
        </header>

        {/* ── 双大字体区: 4.6B + 1/77,000,000 ── */}
        <div className={styles.megaNumbers}>
          <div className={styles.megaNum1}>
            <span className={styles.megaLabel}>EARTH · 地球年龄</span>
            <span className={styles.bigNumber}>4.6B</span>
            <span className={styles.bigNumberUnit}>YEARS · 46 亿年</span>
          </div>
          <div className={styles.megaNum2}>
            <span className={styles.megaLabel}>YOUR LIFE · 你的生命</span>
            <span className={styles.megaNum2Prefix}>YOU ×</span>
            <span className={styles.bigNumberBlue}>1 / 77,000,000</span>
            <span className={styles.megaSub}>
              你的一生,是地球年龄的 1/7700 万。你出现了 0.3 秒。
            </span>
          </div>
        </div>

        {/* ── Timeline (9 节点 + 进度条) ── */}
        <div className={styles.archiveStage}>
          <div className={styles.archiveRail}>
            <div className={styles.archiveTrack} aria-hidden="true" />
            <div
              className={styles.archiveProgress}
              style={{ width: `${(ACTIVE_INDEX / (ARCHIVE_NODES.length - 1)) * 100}%` }}
              aria-hidden="true"
            />
            {ARCHIVE_NODES.map((node, i) => {
              const isActive = i === ACTIVE_INDEX;
              return (
                <button
                  key={node.id}
                  type="button"
                  className={[
                    styles.archNode,
                    styles[`accent-${node.accent}`],
                    isActive && styles['archNode--active'],
                  ].filter(Boolean).join(' ')}
                  aria-label={`${node.yearLabel} ${node.titleZh}`}
                  aria-pressed={isActive}
                >
                  <span className={styles.archNodeYear}>{node.yearLabel}</span>
                  <span className={styles.archNodeDot} aria-hidden="true" />
                </button>
              );
            })}
          </div>

          {/* ── Active Node Meta ── */}
          <div className={styles.nodeMeta}>
            <div className={styles.nodeMetaLeft}>
              <span className={styles.nodeMetaLabel}>
                {active.accent === 'human' ? 'HUMAN' : active.accent === 'life' ? 'LIFE' : active.accent === 'warm' ? 'EARTH' : 'COSMIC'}
                {' · SEQUENCE '}
                {String(ACTIVE_INDEX + 1).padStart(2, '0')}
                {' / '}
                {String(ARCHIVE_NODES.length).padStart(2, '0')}
              </span>
              <h3 className={styles.nodeMetaName}>
                {active.titleZh}
                <em> — {active.titleLatin}</em>
              </h3>
              <p className={styles.nodeMetaDesc}>{active.descriptionZh}</p>
            </div>
            <div className={styles.nodeMetaRight}>
              <span className={styles.nodeMetaTime}>{active.yearLabel}</span>
              {active.location && (
                <span className={styles.nodeMetaCoords}>{active.location}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomeEarthArchive;