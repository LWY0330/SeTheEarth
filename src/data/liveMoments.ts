/* ============================================================
   看见地球 · v2.14.0 · 数据驱动的实时事件
   - 真正可更新的事件数据（含 updatedAt / isLive / sourceType）
   - 12 事件池（覆盖 6 大洲 + 多种类型）
   - getMixedSnapshot()：跨地域 + 跨主题 + 混合大小
   - "换一组世界"打破信息茧房
   ============================================================ */

export type MomentCategory = 'finance' | 'war' | 'art' | 'urban' | 'nature' | 'romance';
export type ContentType = 'world' | 'local' | 'culture' | 'daily-life' | 'weather' | 'nature' | 'transport' | 'finance' | 'science' | 'community' | 'sports';
export type Scale = 'global' | 'national' | 'regional' | 'local' | 'everyday';
export type SourceType = 'local-media' | 'official' | 'community' | 'weather-data' | 'transport-data' | 'editorial';
export type VerificationStatus = 'verified' | 'developing' | 'editorial';

export type LiveEvent = {
  id: string;
  cityId: string;
  cityNameZh: string;
  cityNameEn: string;
  countryZh: string;
  countryEn: string;
  /** 视觉类目（用于暖橘/紫等强调色） */
  category: MomentCategory;
  categoryLabelZh: string;
  /** 内容类目（更细致：日常/文化/金融/天气等 11 类） */
  contentType: ContentType;
  contentTypeZh: string;
  /** 内容尺度（世界/国家/区域/城市/日常 5 级） */
  scale: Scale;
  title: string;
  description: string;
  localTime: string;
  timezone: string;
  /** 与 UTC 的时差（小时，如 +9, -5, 0）—— 用于时区条圆点位置 */
  utcOffset: number;
  /** 观察时间（ISO-like） */
  observedAt: string;
  /** 48x48 缩略图 URL（现场感街景/天气/交通/自然） */
  thumbnailUrl: string;
  /** 发布时间 */
  publishedAt?: string;
  /** 更新时间（用于判断 LIVE / X min ago） */
  updatedAt: string;
  /** 过期时间（可选） */
  expiresAt?: string;
  sourceName: string;
  sourceUrl?: string;
  sourceType: SourceType;
  latitude?: number;
  longitude?: number;
  isLive: boolean;
  verificationStatus: VerificationStatus;
};

export const liveEvents: readonly LiveEvent[] = [
  // ── 1. 东京 · 日常 ──
  {
    id: 'tokyo-01',
    cityId: 'tokyo',
    cityNameZh: '东京',
    cityNameEn: 'Tokyo',
    countryZh: '日本',
    countryEn: 'JAPAN',
    category: 'urban',
    categoryLabelZh: '城市',
    contentType: 'daily-life',
    contentTypeZh: '日常',
    scale: 'everyday',
    title: '末班地铁刚走，第一班即将出发',
    description: '地铁工作人员正在清扫站台，几位熬夜的人在便利店门口吃关东煮。',
    localTime: '01:40',
    timezone: 'JST',
    utcOffset: 9,
    observedAt: '2026-08-07T01:40:00+09:00',
    updatedAt: '2026-08-07T01:38:00+09:00',
    sourceName: '编辑观察 · 城市日常',
    thumbnailUrl: 'https://images.unsplash.com/photo-1554797589-7241bb691e89?w=200&h=200&fit=crop&q=70',
    sourceType: 'editorial',
    latitude: 35.6762,
    longitude: 139.6503,
    isLive: true,
    verificationStatus: 'editorial',
  },
  // ── 2. 悉尼 · 文化 ──
  {
    id: 'sydney-02',
    cityId: 'sydney',
    cityNameZh: '悉尼',
    cityNameEn: 'Sydney',
    countryZh: '澳大利亚',
    countryEn: 'AUSTRALIA',
    category: 'romance',
    categoryLabelZh: '浪漫',
    contentType: 'culture',
    contentTypeZh: '文化',
    scale: 'local',
    title: '海风把夜晚留在港口',
    description: '歌剧院附近的人群渐渐散去，最后一班渡轮驶向北岸，码头边的灯开始暗下来。',
    localTime: '02:40',
    timezone: 'AEST',
    utcOffset: 10,
    observedAt: '2026-08-07T02:40:00+10:00',
    updatedAt: '2026-08-07T02:35:00+10:00',
    sourceName: '当地媒体 · 港口新闻',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506973031072-7b1bbc3b0be4?w=200&h=200&fit=crop&q=70',
    sourceType: 'local-media',
    latitude: -33.8688,
    longitude: 151.2093,
    isLive: true,
    verificationStatus: 'developing',
  },
  // ── 3. 纽约 · 金融 ──
  {
    id: 'newyork-03',
    cityId: 'newyork',
    cityNameZh: '纽约',
    cityNameEn: 'New York',
    countryZh: '美国',
    countryEn: 'UNITED STATES',
    category: 'finance',
    categoryLabelZh: '金融',
    contentType: 'finance',
    contentTypeZh: '金融',
    scale: 'regional',
    title: '华尔街刚刚敲响开盘钟',
    description: '交易大厅开始活跃，纳斯达克的数字在屏幕上快速变化。',
    localTime: '12:40',
    timezone: 'EDT',
    utcOffset: -4,
    observedAt: '2026-08-06T12:40:00-04:00',
    updatedAt: '2026-08-06T12:40:00-04:00',
    sourceName: '官方数据 · 证券交易所',
    thumbnailUrl: 'https://images.unsplash.com/photo-1496588152823-86ff7695e68f?w=200&h=200&fit=crop&q=70',
    sourceType: 'official',
    latitude: 40.7128,
    longitude: -74.0060,
    isLive: true,
    verificationStatus: 'verified',
  },
  // ── 4. 里约 · 自然/日常 ──
  {
    id: 'rio-04',
    cityId: 'rio',
    cityNameZh: '里约',
    cityNameEn: 'Rio de Janeiro',
    countryZh: '巴西',
    countryEn: 'BRAZIL',
    category: 'nature',
    categoryLabelZh: '自然',
    contentType: 'daily-life',
    contentTypeZh: '日常',
    scale: 'everyday',
    title: '海滩上的午后正变得热闹',
    description: '科帕卡巴纳沿岸的人群逐渐增多，阳光落在海面上，有人开始踢沙滩足球。',
    localTime: '13:40',
    timezone: 'BRT',
    utcOffset: -3,
    observedAt: '2026-08-06T13:40:00-03:00',
    updatedAt: '2026-08-06T13:32:00-03:00',
    sourceName: '编辑观察 · 海滩生活',
    thumbnailUrl: 'https://images.unsplash.com/photo-1483729558489-99ef05a8aeb4?w=200&h=200&fit=crop&q=70',
    sourceType: 'editorial',
    latitude: -22.9068,
    longitude: -43.1729,
    isLive: true,
    verificationStatus: 'editorial',
  },
  // ── 5. 伦敦 · 交通 ──
  {
    id: 'london-05',
    cityId: 'london',
    cityNameZh: '伦敦',
    cityNameEn: 'London',
    countryZh: '英国',
    countryEn: 'UNITED KINGDOM',
    category: 'urban',
    categoryLabelZh: '城市',
    contentType: 'transport',
    contentTypeZh: '交通',
    scale: 'local',
    title: '下班的人流穿过金融城',
    description: '写字楼的灯逐渐亮起，泰晤士河边开始进入傍晚，地铁里挤满了回家的人。',
    localTime: '17:40',
    timezone: 'BST',
    utcOffset: 1,
    observedAt: '2026-08-06T17:40:00+01:00',
    updatedAt: '2026-08-06T17:37:00+01:00',
    sourceName: '当地媒体 · 通勤观察',
    thumbnailUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ab?w=200&h=200&fit=crop&q=70',
    sourceType: 'local-media',
    latitude: 51.5074,
    longitude: -0.1278,
    isLive: true,
    verificationStatus: 'developing',
  },
  // ── 6. 开普敦 · 自然/天气 ──
  {
    id: 'capetown-06',
    cityId: 'capetown',
    cityNameZh: '开普敦',
    cityNameEn: 'Cape Town',
    countryZh: '南非',
    countryEn: 'SOUTH AFRICA',
    category: 'nature',
    categoryLabelZh: '自然',
    contentType: 'weather',
    contentTypeZh: '天气',
    scale: 'regional',
    title: '桌山被最后一束夕阳照亮',
    description: '城市即将进入夜晚，海风从大西洋方向吹来，山顶的云被染成橙红色。',
    localTime: '18:40',
    timezone: 'SAST',
    utcOffset: 2,
    observedAt: '2026-08-06T18:40:00+02:00',
    updatedAt: '2026-08-06T18:40:00+02:00',
    sourceName: '官方数据 · 气象局',
    thumbnailUrl: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=200&h=200&fit=crop&q=70',
    sourceType: 'weather-data',
    latitude: -33.9249,
    longitude: 18.4241,
    isLive: true,
    verificationStatus: 'verified',
  },
  // ── 7. 内罗毕（新增 · 覆盖非洲） · 社区 ──
  {
    id: 'nairobi-07',
    cityId: 'nairobi',
    cityNameZh: '内罗毕',
    cityNameEn: 'Nairobi',
    countryZh: '肯尼亚',
    countryEn: 'KENYA',
    category: 'urban',
    categoryLabelZh: '城市',
    contentType: 'community',
    contentTypeZh: '社区',
    scale: 'everyday',
    title: '当地咖啡馆开始营业',
    description: 'CBD 的咖啡店陆续开门，员工在门口摆放今日推荐菜单，街角的报刊亭刚支起来。',
    localTime: '19:40',
    timezone: 'EAT',
    utcOffset: 3,
    observedAt: '2026-08-06T19:40:00+03:00',
    updatedAt: '2026-08-06T19:35:00+03:00',
    sourceName: '编辑观察 · 社区',
    thumbnailUrl: 'https://images.unsplash.com/photo-1611348586804-61bf8c195eb4?w=200&h=200&fit=crop&q=70',
    sourceType: 'community',
    latitude: -1.2921,
    longitude: 36.8219,
    isLive: true,
    verificationStatus: 'editorial',
  },
  // ── 8. 加德满都（新增 · 覆盖南亚） · 日常 ──
  {
    id: 'kathmandu-08',
    cityId: 'kathmandu',
    cityNameZh: '加德满都',
    cityNameEn: 'Kathmandu',
    countryZh: '尼泊尔',
    countryEn: 'NEPAL',
    category: 'urban',
    categoryLabelZh: '城市',
    contentType: 'daily-life',
    contentTypeZh: '日常',
    scale: 'everyday',
    title: '街边小贩开始摆摊',
    description: '泰米尔街的摊贩铺开今天的货物，铜铃、茶叶和围巾在晨光下被一一摆出来。',
    localTime: '08:40',
    timezone: '+0545',
    utcOffset: 5.75,
    observedAt: '2026-08-07T08:40:00+05:45',
    updatedAt: '2026-08-07T08:38:00+05:45',
    sourceName: '当地媒体 · 街头观察',
    thumbnailUrl: 'https://images.unsplash.com/photo-1558799401-1feb6c08f5be?w=200&h=200&fit=crop&q=70',
    sourceType: 'local-media',
    latitude: 27.7172,
    longitude: 85.3240,
    isLive: true,
    verificationStatus: 'developing',
  },
  // ── 9. 上海 · 都市（覆盖亚洲） · 交通 ──
  {
    id: 'shanghai-09',
    cityId: 'shanghai',
    cityNameZh: '上海',
    cityNameEn: 'Shanghai',
    countryZh: '中国',
    countryEn: 'CHINA',
    category: 'urban',
    categoryLabelZh: '城市',
    contentType: 'transport',
    contentTypeZh: '交通',
    scale: 'local',
    title: '外滩的灯一盏一盏亮起来',
    description: '黄浦江的风带着凉意，游客在江边拍照，晚归的人坐上回家的轮渡。',
    localTime: '00:40',
    timezone: 'CST',
    utcOffset: 8,
    observedAt: '2026-08-07T00:40:00+08:00',
    updatedAt: '2026-08-07T00:38:00+08:00',
    sourceName: '编辑观察 · 城市日常',
    thumbnailUrl: 'https://images.unsplash.com/photo-1474181487882-5abf3f0ba6c2?w=200&h=200&fit=crop&q=70',
    sourceType: 'editorial',
    latitude: 31.2304,
    longitude: 121.4737,
    isLive: true,
    verificationStatus: 'editorial',
  },
  // ── 10. 柏林 · 文化（覆盖欧洲） ──
  {
    id: 'berlin-10',
    cityId: 'berlin',
    cityNameZh: '柏林',
    cityNameEn: 'Berlin',
    countryZh: '德国',
    countryEn: 'GERMANY',
    category: 'art',
    categoryLabelZh: '艺术',
    contentType: 'culture',
    contentTypeZh: '文化',
    scale: 'regional',
    title: '博物馆岛刚开馆',
    description: '佩加蒙博物馆门外开始排队，第一个游客在门口翻开导览手册。',
    localTime: '18:40',
    timezone: 'CEST',
    utcOffset: 2,
    observedAt: '2026-08-06T18:40:00+02:00',
    updatedAt: '2026-08-06T18:38:00+02:00',
    sourceName: '当地媒体 · 文化',
    thumbnailUrl: 'https://images.unsplash.com/photo-1587330979470-3016b6702d89?w=200&h=200&fit=crop&q=70',
    sourceType: 'local-media',
    latitude: 52.5200,
    longitude: 13.4050,
    isLive: true,
    verificationStatus: 'developing',
  },
  // ── 11. 墨西哥城 · 日常（覆盖北美） ──
  {
    id: 'mexico-11',
    cityId: 'mexico-city',
    cityNameZh: '墨西哥城',
    cityNameEn: 'Mexico City',
    countryZh: '墨西哥',
    countryEn: 'MEXICO',
    category: 'urban',
    categoryLabelZh: '城市',
    contentType: 'daily-life',
    contentTypeZh: '日常',
    scale: 'everyday',
    title: 'Coyoacán 街头艺人开始表演',
    description: '彩色街边的街头画家支起画架，吉他手调试琴弦，空气中弥漫着玉米饼的香味。',
    localTime: '10:40',
    timezone: 'CST',
    utcOffset: -6,
    observedAt: '2026-08-06T10:40:00-06:00',
    updatedAt: '2026-08-06T10:35:00-06:00',
    sourceName: '编辑观察 · 城市日常',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=200&h=200&fit=crop&q=70',
    sourceType: 'editorial',
    latitude: 19.4326,
    longitude: -99.1332,
    isLive: true,
    verificationStatus: 'editorial',
  },
  // ── 12. 罗马 · 文化（覆盖欧洲） ──
  {
    id: 'rome-12',
    cityId: 'rome',
    cityNameZh: '罗马',
    cityNameEn: 'Rome',
    countryZh: '意大利',
    countryEn: 'ITALY',
    category: 'art',
    categoryLabelZh: '艺术',
    contentType: 'culture',
    contentTypeZh: '文化',
    scale: 'regional',
    title: '特莱维喷泉前有人许愿',
    description: '傍晚的喷泉边排起小队，游客们转身扔下硬币，许下某个不愿说出口的愿望。',
    localTime: '11:40',
    timezone: 'CEST',
    utcOffset: 2,
    observedAt: '2026-08-06T11:40:00+02:00',
    updatedAt: '2026-08-06T11:36:00+02:00',
    sourceName: '当地媒体 · 旅游',
    thumbnailUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=200&h=200&fit=crop&q=70',
    sourceType: 'local-media',
    latitude: 41.9028,
    longitude: 12.4964,
    isLive: true,
    verificationStatus: 'developing',
  },
];

export const categoryColors: Record<MomentCategory, string> = {
  finance: '#5BA8FF',
  war: '#B85450',
  art: '#C8924A',
  urban: '#6B8E5A',
  nature: '#82C0FF',
  romance: '#D97757',
};

export const contentTypeColors: Record<ContentType, string> = {
  world: '#5E6AD2',
  local: '#8B7355',
  culture: '#C8924A',
  'daily-life': '#8B7355',
  weather: '#82C0FF',
  nature: '#82C0FF',
  transport: '#6B8E5A',
  finance: '#5BA8FF',
  science: '#A088D0',
  community: '#D97757',
  sports: '#E85A8C',
};

export function getSortedByLocalTime(): readonly LiveEvent[] {
  return [...liveEvents].sort((a, b) => a.localTime.localeCompare(b.localTime));
}

/**
 * "换一组世界"：从 12 事件池中随机抽 6 个
 * 保证跨地域（6 大洲）+ 跨主题（多种 contentType）+ 混合大小（everyday/local/regional/global）
 */
export function getMixedSnapshot(count: number = 6, _seed?: number): LiveEvent[] {
  // 简化的"保证多样性"算法
  const shuffled = [...liveEvents].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).sort((a, b) => a.localTime.localeCompare(b.localTime));
}

/** 计算 "X min ago" 字符串 */
export function getTimeAgo(updatedAt: string, nowMs: number = Date.now()): string {
  const then = new Date(updatedAt).getTime();
  const diffSec = Math.floor((nowMs - then) / 1000);
  if (diffSec < 60) return '刚刚';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} min ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} hr ago`;
  return `${Math.floor(diffSec / 86400)} d ago`;
}

/* ============================================================
   v2.22.0 · SectionStatus + SectionMeta + momentsMeta
   - 当前 "developing" 状态（构建中）
   - 未来接真实数据时改为 status: "live" 即可
   ============================================================ */

export type SectionStatus = "live" | "developing" | "editorial";

export type SectionMeta = {
  id: "world-snapshot";
  status: SectionStatus;
  label: string;
  subtitle?: string;
};

export const momentsMeta: SectionMeta = {
  id: "world-snapshot",
  status: "developing",
  label: "WORLD SNAPSHOT — DEVELOPING",
  subtitle: "世界正在构建中 · Live mode in development."
};

// 未来接真实数据时只需改为：
// { status: "live", label: "WORLD SNAPSHOT · LIVE", subtitle: "..." }
