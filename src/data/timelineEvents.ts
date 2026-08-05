/* Static M0 timeline events — a curated set of moment-defining beats
 * along Earth's history. Future milestones will replace this with a
 * structured dataset (probably JSON under /public/data/).
 */

export type EraTag = 'cosmic' | 'geological' | 'biological' | 'human';
export type AccentTag = 'stellar' | 'life' | 'warm' | 'human';

export interface TimelineEvent {
  id: string;
  /** Short, human-readable label, e.g. "4.6 Ga" or "10k BCE". */
  yearLabel: string;
  /** Browsable title shown in the rail tooltip and detail card. */
  title: string;
  /** Optional English subtitle (for the global audience). */
  subtitle?: string;
  /** Two- to three-sentence description. */
  description: string;
  /** High-level era — used for iconography & color grouping. */
  era: EraTag;
  /** Marker accent — drives the dot/glow color. */
  accent: AccentTag;
}

export const TIMELINE_EVENTS: readonly TimelineEvent[] = [
  {
    id: 'solar-system',
    yearLabel: '4.6 Ga',
    title: '太阳星云凝聚',
    subtitle: 'Solar nebula condenses',
    description:
      '一片由气体与尘埃构成的原始星云在引力作用下塌缩,中央点燃了太阳,周围的盘面上开始聚集成团——这就是地球的摇篮。',
    era: 'cosmic',
    accent: 'stellar',
  },
  {
    id: 'moon-form',
    yearLabel: '4.5 Ga',
    title: '月球诞生',
    subtitle: 'Theia impact · Moon forms',
    description:
      '一颗火星大小的天体撞击原始地球,抛出的碎屑在轨道上重新聚合,形成了月球。从此地球有了稳定倾角的轴,有了潮汐,也有了温柔的长夜。',
    era: 'cosmic',
    accent: 'stellar',
  },
  {
    id: 'oceans',
    yearLabel: '4.4 Ga',
    title: '第一片海洋',
    subtitle: 'First oceans',
    description:
      '火山排气带出水汽,冷却后汇聚成全球性的海洋。液态水让地球从此区别于其他岩质行星,也成为后续生命反应的溶剂。',
    era: 'geological',
    accent: 'stellar',
  },
  {
    id: 'life-begins',
    yearLabel: '3.8 Ga',
    title: '生命起源',
    subtitle: 'Earliest life',
    description:
      '深海热泉附近的化学梯度催生了最早的原核生命。几十亿年里,它们将以氧气重塑大气,也将改写整个星球的命运。',
    era: 'biological',
    accent: 'life',
  },
  {
    id: 'great-oxidation',
    yearLabel: '2.4 Ga',
    title: '大氧化事件',
    subtitle: 'Great Oxidation Event',
    description:
      '蓝藻光合作用产生的氧气开始在地表富集,让海洋的铁沉淀成今天的铁矿层,也为更复杂的生命铺平了路。',
    era: 'biological',
    accent: 'life',
  },
  {
    id: 'cambrian',
    yearLabel: '540 Ma',
    title: '寒武纪大爆发',
    subtitle: 'Cambrian explosion',
    description:
      '短短两千万年内出现了几乎所有现代动物门类的祖先。眼睛、骨骼、掠食者——可识别的复杂生命在海洋里大规模登陆。',
    era: 'biological',
    accent: 'life',
  },
  {
    id: 'dinosaurs-end',
    yearLabel: '66 Ma',
    title: '恐龙纪终结',
    subtitle: 'End of the dinosaurs',
    description:
      '一颗小行星终结了白垩纪。失去恐龙的生态位,小型哺乳动物迅速多样化——这是智人几千万年后的遥远序章。',
    era: 'biological',
    accent: 'warm',
  },
  {
    id: 'hominin',
    yearLabel: '300 ka',
    title: '智人出现',
    subtitle: 'Anatomically modern humans',
    description:
      '在东非,具备现代解剖特征的人类登场。我们将发明语言、艺术、农业、城市,也第一次有能力看清自己星球的形状。',
    era: 'human',
    accent: 'human',
  },
  {
    id: 'now',
    yearLabel: '此刻',
    title: '看见地球',
    subtitle: 'See Earth — now',
    description:
      '站在这里,从近地轨道看到的地球:一粒在虚空中自转的蓝珠。这颗行星的下一幕,由你我的每一个选择书写。',
    era: 'human',
    accent: 'human',
  },
] as const;
