/* ============================================================
   看见地球 · v2.50.0 · 城市数据 + DayPeriod + CityImage + isFeatured
   - 6 时段分桶：dawn · morning · afternoon · evening · night · deepNight
   - 每张城市 images: CityImage[]，按 period 切换
   - isFeatured 标记板块 2 主屏精选；其余城市仅在 /cities 出现
   - 6 featured: kyoto / lisbon / shanghai / mexico-city / cape-town / london
   ============================================================ */

export type WeatherSnapshot = {
  summary: string;
  temperatureC: number;
  icon: string;
};

export type DayPeriod =
  | 'dawn' | 'morning' | 'afternoon' | 'evening' | 'night' | 'deepNight';

export type CityImage = {
  period: DayPeriod;
  url: string;
  focus?: string;
  blurDataURL?: string;
  width: number;
  height: number;
};

export type City = {
  id: string;
  slug: string;
  nameCn: string;
  nameEn: string;
  countryCn: string;
  countryEn: string;
  description: string;
  momentCn: string;
  lon: number;
  lat: number;
  images: CityImage[];
  imageCredit?: string;
  href: string;
  timezone: string;
  oneObservation: string;
  weather: WeatherSnapshot;
  livingNote?: string;
  cultureNote?: string;
  /** v2.50.0 · 是否进入板块 2 主屏精选（默认 false） */
  isFeatured?: boolean;
};

function img(period: DayPeriod, url: string, focus: string): CityImage {
  return { period, url, focus, width: 1600, height: 1067 };
}

export const cities: readonly City[] = [
  {
    id: 'kyoto', slug: 'kyoto',
    nameCn: '京都', nameEn: 'Kyoto',
    countryCn: '日本', countryEn: 'Japan',
    description: '千年古都的街巷里，寺庙与庭园在四季里静默呼吸。',
    momentCn: '有人正在伏见稻荷的鸟居下，系一个祈愿。',
    lon: 135.7681, lat: 35.0116,
    images: [
      img('morning', 'https://images.unsplash.com/photo-1493997181344-712f2f19d87a?auto=format&fit=crop&w=1600&q=80', '50% 45%'),
      img('afternoon', 'https://images.unsplash.com/photo-1493997181344-712f2f19d87a?auto=format&fit=crop&w=1600&q=80', '50% 35%'),
      img('evening', 'https://images.unsplash.com/photo-1493997181344-712f2f19d87a?auto=format&fit=crop&w=1600&q=80', '50% 55%'),
      img('night', 'https://images.unsplash.com/photo-1493997181344-712f2f19d87a?auto=format&fit=crop&w=1600&q=80', '50% 60%'),
    ],
    imageCredit: 'Sorasak · Unsplash',
    href: '/cities/kyoto',
    timezone: 'Asia/Tokyo',
    oneObservation: '伏见稻荷的鸟居正被清晨的阳光慢慢照亮。',
    weather: { summary: '晴转多云', temperatureC: 12, icon: 'sun-cloud' },
    livingNote: '京都的早晨安静得只剩水琴窟的声音。町屋的格子门被轻轻推开，豆腐店里刚摆出今早的嫩豆腐。',
    cultureNote: '作为旧时日本首都，京都在公元 794 年到 1868 年间是日本的政治与文化中心。今天的京都仍在祭祀、节令和手工艺上保留着江户时代的气息。',
    isFeatured: true,
  },
  {
    id: 'lisbon', slug: 'lisbon',
    nameCn: '里斯本', nameEn: 'Lisbon',
    countryCn: '葡萄牙', countryEn: 'Portugal',
    description: '大航海时代的余温仍留在老城山坡的石板路上。',
    momentCn: '28 路电车正爬上 Alfama 的老坡，铃铛响了两声。',
    lon: -9.1393, lat: 38.7223,
    images: [
      img('morning', 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=1600&q=80', '50% 50%'),
      img('afternoon', 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=1600&q=80', '50% 40%'),
      img('evening', 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=1600&q=80', '50% 60%'),
      img('night', 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=1600&q=80', '50% 70%'),
    ],
    imageCredit: 'Photos by Lanty · Unsplash',
    href: '/cities/lisbon',
    timezone: 'Europe/Lisbon',
    oneObservation: '清晨，海风刚刚把夜晚吹散。',
    weather: { summary: '多云', temperatureC: 16, icon: 'cloud' },
    livingNote: '阿尔法玛老城的鹅卵石街面在清晨还没被游客踏响。第 28 路电车从格拉萨下山，铃声划过整条坡道。',
    cultureNote: '里斯本是欧洲大陆最西端的大城市，历史上是 15-16 世纪大航海时代的出发港之一。法朵音乐仍留在老城的小酒馆里。',
    isFeatured: true,
  },
  {
    id: 'shanghai', slug: 'shanghai',
    nameCn: '上海', nameEn: 'Shanghai',
    countryCn: '中国', countryEn: 'China',
    description: '外滩的钟声和浦东的灯光，在江面相遇了一个世纪。',
    momentCn: '外滩的灯一盏一盏亮起来，黄浦江的风带着凉。',
    lon: 121.4737, lat: 31.2304,
    images: [
      img('morning', 'https://images.unsplash.com/photo-1474181487882-5abf3f0ba6c2?auto=format&fit=crop&w=1600&q=80', '50% 40%'),
      img('afternoon', 'https://images.unsplash.com/photo-1474181487882-5abf3f0ba6c2?auto=format&fit=crop&w=1600&q=80', '50% 30%'),
      img('evening', 'https://images.unsplash.com/photo-1474181487882-5abf3f0ba6c2?auto=format&fit=crop&w=1600&q=80', '50% 50%'),
      img('night', 'https://images.unsplash.com/photo-1474181487882-5abf3f0ba6c2?auto=format&fit=crop&w=1600&q=80', '50% 60%'),
    ],
    imageCredit: 'Dele Ojerinde · Unsplash',
    href: '/cities/shanghai',
    timezone: 'Asia/Shanghai',
    oneObservation: '外滩的灯一盏一盏亮起来，黄浦江的风带着凉。',
    weather: { summary: '晴', temperatureC: 28, icon: 'sun' },
    livingNote: '外滩的钟楼刚响过八点，南京路步行街上行人渐渐密起来。本帮菜馆子刚把酱油鸭摆上外卖柜。',
    cultureNote: '上海开埠于 1843 年，是近代中国最早接触西方商业的城市之一。外滩万国建筑群记录了那一段历史。',
    isFeatured: true,
  },
  {
    id: 'mexico-city', slug: 'mexico-city',
    nameCn: '墨西哥城', nameEn: 'Mexico City',
    countryCn: '墨西哥', countryEn: 'Mexico',
    description: '高原上的彩色之城，每个街角都在演奏自己的旋律。',
    momentCn: 'Coyoacán 的彩色街上，有人正在卖刚出炉的玉米饼。',
    lon: -99.1332, lat: 19.4326,
    images: [
      img('morning', 'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?auto=format&fit=crop&w=1600&q=80', '50% 60%'),
      img('afternoon', 'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?auto=format&fit=crop&w=1600&q=80', '50% 50%'),
      img('evening', 'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?auto=format&fit=crop&w=1600&q=80', '50% 70%'),
      img('night', 'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?auto=format&fit=crop&w=1600&q=80', '50% 40%'),
    ],
    imageCredit: 'César Viveros · Unsplash',
    href: '/cities/mexico-city',
    timezone: 'America/Mexico_City',
    oneObservation: 'Coyoacán 的彩色街上，街头画家刚支起画架。',
    weather: { summary: '晴', temperatureC: 19, icon: 'sun' },
    livingNote: '海拔 2,240 米的清晨凉得舒服。Frida Kahlo 的蓝色房子外已经有人在排队。',
    cultureNote: '墨西哥城在阿兹特克时期是特诺奇提特兰城，西班牙殖民后又重建为新西班牙的首都。今天的 Coyoacán、Centro Histórico 还保存着殖民时代的石头房子。',
    isFeatured: true,
  },
  {
    id: 'tokyo', slug: 'tokyo',
    nameCn: '东京', nameEn: 'Tokyo',
    countryCn: '日本', countryEn: 'Japan',
    description: '新旧交织的巨型都市，地铁和神社共享同一条街道。',
    momentCn: '涩谷十字路口的红灯刚转绿，3000 人同时起步。',
    lon: 139.6917, lat: 35.6895,
    images: [
      img('morning', 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1600&q=80', '50% 50%'),
      img('afternoon', 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1600&q=80', '50% 40%'),
      img('evening', 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1600&q=80', '50% 60%'),
      img('night', 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1600&q=80', '50% 70%'),
    ],
    imageCredit: 'Liam Burnett-Blue · Unsplash',
    href: '/cities/tokyo',
    timezone: 'Asia/Tokyo',
    oneObservation: '涩谷十字路口的红灯刚转绿，3000 人同时起步。',
    weather: { summary: '阴', temperatureC: 27, icon: 'cloud' },
    livingNote: '末班地铁刚走，第一班即将出发。便利店门口的关东煮冒着小泡。',
    cultureNote: '江户改称东京是 1868 年的事。但东京作为日本首都的概念更早，1603 年德川幕府已经在这里设立了幕府。',
  },
  {
    id: 'rio', slug: 'rio',
    nameCn: '里约', nameEn: 'Rio de Janeiro',
    countryCn: '巴西', countryEn: 'Brazil',
    description: '山海之间的桑巴城，海滩、森林和基督像共同呼吸。',
    momentCn: '科帕卡巴纳海滩上有人在踢足球，影子被阳光拉得很长。',
    lon: -43.1729, lat: -22.9068,
    images: [
      img('morning', 'https://images.unsplash.com/photo-1483729558489-99ef05a8aeb4?auto=format&fit=crop&w=1600&q=80', '50% 45%'),
      img('afternoon', 'https://images.unsplash.com/photo-1483729558489-99ef05a8aeb4?auto=format&fit=crop&w=1600&q=80', '50% 35%'),
      img('evening', 'https://images.unsplash.com/photo-1483729558489-99ef05a8aeb4?auto=format&fit=crop&w=1600&q=80', '50% 55%'),
      img('night', 'https://images.unsplash.com/photo-1483729558489-99ef05a8aeb4?auto=format&fit=crop&w=1600&q=80', '50% 65%'),
    ],
    imageCredit: 'Anthony Delanoix · Unsplash',
    href: '/cities/rio',
    timezone: 'America/Sao_Paulo',
    oneObservation: '科帕卡巴纳海滩上有人在踢足球，影子被阳光拉得很长。',
    weather: { summary: '晴', temperatureC: 25, icon: 'sun' },
    livingNote: 'Ipanema 的海滩伞刚撑开。Caipirinha 的青柠被切得嘎嘎响。',
    cultureNote: '里约 1960 年曾经是巴西的首都。桑巴、嘉年华和基督像共同构成了今天世界对这座城市的印象。',
  },
  {
    id: 'reykjavik', slug: 'reykjavik',
    nameCn: '雷克雅未克', nameEn: 'Reykjavík',
    countryCn: '冰岛', countryEn: 'Iceland',
    description: '世界最北的首都，等待极光和午夜阳光的交替。',
    momentCn: 'Hallgrímskirkja 的尖顶在等一场极光。',
    lon: -21.9426, lat: 64.1466,
    images: [
      img('morning', 'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?auto=format&fit=crop&w=1600&q=80', '50% 30%'),
      img('afternoon', 'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?auto=format&fit=crop&w=1600&q=80', '50% 20%'),
      img('evening', 'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?auto=format&fit=crop&w=1600&q=80', '50% 40%'),
      img('night', 'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?auto=format&fit=crop&w=1600&q=80', '50% 50%'),
    ],
    imageCredit: 'Tobias Reich · Unsplash',
    href: '/cities/reykjavik',
    timezone: 'Atlantic/Reykjavik',
    oneObservation: 'Hallgrímskirkja 的尖顶在等一场极光。',
    weather: { summary: '多云', temperatureC: 9, icon: 'cloud' },
    livingNote: '夏天里太阳还在低空徘徊。咖啡馆门口晒着羊毛毯子。',
    cultureNote: '雷克雅未克是世界最北的首都，建城于 874 年。今天它几乎 100% 使用地热和水电能。',
  },
  {
    id: 'cape-town', slug: 'cape-town',
    nameCn: '开普敦', nameEn: 'Cape Town',
    countryCn: '南非', countryEn: 'South Africa',
    description: '两洋交汇之地，桌山下的港口城市。',
    momentCn: '桌山的"桌布"刚被风扯开一角，露出整片晴空。',
    lon: 18.4241, lat: -33.9249,
    images: [
      img('morning', 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=1600&q=80', '50% 45%'),
      img('afternoon', 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=1600&q=80', '50% 35%'),
      img('evening', 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=1600&q=80', '50% 55%'),
      img('night', 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=1600&q=80', '50% 65%'),
    ],
    imageCredit: 'Tobias Reich · Unsplash',
    href: '/cities/cape-town',
    timezone: 'Africa/Johannesburg',
    oneObservation: '桌山的"桌布"刚被风扯开一角，露出整片晴空。',
    weather: { summary: '晴', temperatureC: 18, icon: 'sun' },
    livingNote: 'V&A 滨水区的餐厅开始摆出早午餐桌。桌山的云被叫做"table cloth"。',
    cultureNote: '好望角就在开普敦南边，是 1488 年 Bartolomeu Dias 绕过非洲最南端的航海节点。',
    isFeatured: true,
  },
  {
    id: 'london', slug: 'london',
    nameCn: '伦敦', nameEn: 'London',
    countryCn: '英国', countryEn: 'United Kingdom',
    description: '泰晤士河两岸的钟声与塔桥，写着几个世纪的史诗。',
    momentCn: '大本钟刚敲完整点，伦敦眼的灯光同步亮起。',
    lon: -0.1276, lat: 51.5074,
    images: [
      img('morning', 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ab?auto=format&fit=crop&w=1600&q=80', '50% 50%'),
      img('afternoon', 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ab?auto=format&fit=crop&w=1600&q=80', '50% 40%'),
      img('evening', 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ab?auto=format&fit=crop&w=1600&q=80', '50% 60%'),
      img('night', 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ab?auto=format&fit=crop&w=1600&q=80', '50% 70%'),
    ],
    imageCredit: 'Anthony Delanoix · Unsplash',
    href: '/cities/london',
    timezone: 'Europe/London',
    oneObservation: '大本钟刚敲完整点，伦敦眼的灯光同步亮起。',
    weather: { summary: '小雨', temperatureC: 14, icon: 'rain' },
    livingNote: '泰晤士河南岸的旧市场刚开市。Waterloo 桥上有通勤的人在跑。',
    cultureNote: '伦敦自 1066 年诺曼底公爵征服英格兰之后基本是英国首都。City of London 城内那一平方英里仍是世界的金融心脏之一。',
    isFeatured: true,
  },
  {
    id: 'berlin', slug: 'berlin',
    nameCn: '柏林', nameEn: 'Berlin',
    countryCn: '德国', countryEn: 'Germany',
    description: '东西方的缝合处，墙虽不在，但对话仍在。',
    momentCn: '勃兰登堡门前有人刚放下一束花，献给柏林墙倒塌的日子。',
    lon: 13.4050, lat: 52.5200,
    images: [
      img('morning', 'https://images.unsplash.com/photo-1587330979470-3016b6702d89?auto=format&fit=crop&w=1600&q=80', '50% 45%'),
      img('afternoon', 'https://images.unsplash.com/photo-1587330979470-3016b6702d89?auto=format&fit=crop&w=1600&q=80', '50% 35%'),
      img('evening', 'https://images.unsplash.com/photo-1587330979470-3016b6702d89?auto=format&fit=crop&w=1600&q=80', '50% 55%'),
      img('night', 'https://images.unsplash.com/photo-1587330979470-3016b6702d89?auto=format&fit=crop&w=1600&q=80', '50% 65%'),
    ],
    imageCredit: 'Anthony Delanoix · Unsplash',
    href: '/cities/berlin',
    timezone: 'Europe/Berlin',
    oneObservation: '勃兰登堡门前有人刚放下一束花，献给柏林墙倒塌的日子。',
    weather: { summary: '阴', temperatureC: 20, icon: 'cloud' },
    livingNote: 'Mitte 的面包店刚开门。Friedrichstraße 上通勤的自行车比车多。',
    cultureNote: '柏林在 19 世纪是德意志帝国的首都，又在 20 世纪经历了两次世界大战和冷战分隔。今天的柏林墙遗址是一座露天画廊。',
  },
  {
    id: 'rome', slug: 'rome',
    nameCn: '罗马', nameEn: 'Rome',
    countryCn: '意大利', countryEn: 'Italy',
    description: '两千年的石头在阳光下讲故事，每一块都是历史。',
    momentCn: '特莱维喷泉前有人刚扔下一枚硬币，许了个愿。',
    lon: 12.4964, lat: 41.9028,
    images: [
      img('morning', 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1600&q=80', '50% 50%'),
      img('afternoon', 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1600&q=80', '50% 40%'),
      img('evening', 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1600&q=80', '50% 60%'),
      img('night', 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1600&q=80', '50% 70%'),
    ],
    imageCredit: 'Yacine Belarbi · Unsplash',
    href: '/cities/rome',
    timezone: 'Europe/Rome',
    oneObservation: '特莱维喷泉前有人刚扔下一枚硬币，许了个愿。',
    weather: { summary: '晴', temperatureC: 26, icon: 'sun' },
    livingNote: 'Trastevere 老巷的 espresso 吧台围满了人。Vespa 从广场中穿过。',
    cultureNote: '罗马的建城年份传说在公元前 753 年。今天罗马老城被完整地保留在现代都市的中心，是 UNESCO 世界遗产。',
  },
  {
    id: 'sydney', slug: 'sydney',
    nameCn: '悉尼', nameEn: 'Sydney',
    countryCn: '澳大利亚', countryEn: 'Australia',
    description: '海港之城，帆船与歌剧院共享同一种蔚蓝。',
    momentCn: '歌剧院刚亮起灯，白色的帆在夜色里发亮。',
    lon: 151.2093, lat: -33.8688,
    images: [
      img('morning', 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1600&q=80', '50% 45%'),
      img('afternoon', 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1600&q=80', '50% 35%'),
      img('evening', 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1600&q=80', '50% 55%'),
      img('night', 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1600&q=80', '50% 65%'),
    ],
    imageCredit: 'Andreas Selter · Unsplash',
    href: '/cities/sydney',
    timezone: 'Australia/Sydney',
    oneObservation: '歌剧院刚亮起灯，白色的帆在夜色里发亮。',
    weather: { summary: '晴', temperatureC: 17, icon: 'sun' },
    livingNote: 'Bondi 海滩的救生员刚换上早班。Surry Hills 的咖啡店排起了队。',
    cultureNote: '1788 年 1 月 26 日英国第一舰队到达悉尼湾。今天的悉尼是澳大利亚人口最多的城市，歌剧院和海港大桥是它的视觉标志。',
  },
] as const;

// v2.50.0 · 板块 2 主屏精选：6 城（其余 6 城只在 /cities 出现）
export const featuredCities: readonly City[] = cities.filter((c) => c.isFeatured);

/* ============================================================
   时段 / 图像选择 helpers（v2.40.0+）
   ============================================================ */

export function getCurrentPeriod(timezone: string, now: Date = new Date()): DayPeriod {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: '2-digit',
    hour12: false,
  });
  const parts = fmt.formatToParts(now);
  const hourStr = parts.find((p) => p.type === 'hour')?.value ?? '00';
  if (hourStr === '24') return 'deepNight';
  const localHour = Number(hourStr);
  if (localHour >= 4 && localHour < 7)  return 'dawn';
  if (localHour >= 7 && localHour < 11) return 'morning';
  if (localHour >= 11 && localHour < 16) return 'afternoon';
  if (localHour >= 16 && localHour < 19) return 'evening';
  if (localHour >= 19 && localHour < 23) return 'night';
  return 'deepNight';
}

export function pickImage(city: City, period: DayPeriod): CityImage {
  return (
    city.images.find((img) => img.period === period)
    ?? city.images.find((img) => img.period === 'morning')
    ?? city.images[0]
  );
}

export function dayPeriodToZh(period: DayPeriod): '清晨' | '上午' | '午后' | '傍晚' | '夜晚' | '深夜' {
  switch (period) {
    case 'dawn':       return '清晨';
    case 'morning':    return '上午';
    case 'afternoon':  return '午后';
    case 'evening':    return '傍晚';
    case 'night':      return '夜晚';
    case 'deepNight':  return '深夜';
  }
}

export type CityNow = {
  cityId: string;
  localTime: string;
  timezone: string;
  /** 新的英文分桶（驱动主图选择） */
  period: DayPeriod;
  /** 中文标签（用于 UI 文字） */
  dayPeriod: '清晨' | '上午' | '午后' | '傍晚' | '夜晚' | '深夜';
  weather: WeatherSnapshot;
  oneObservation: string;
};

export function getCityNow(city: City, now: Date = new Date()): CityNow {
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: city.timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = fmt.formatToParts(now);
  const hh = parts.find((p) => p.type === 'hour')?.value ?? '00';
  const mm = parts.find((p) => p.type === 'minute')?.value ?? '00';
  const period = getCurrentPeriod(city.timezone, now);
  return {
    cityId: city.slug,
    localTime: hh + ':' + mm,
    timezone: city.timezone,
    period,
    dayPeriod: dayPeriodToZh(period),
    weather: city.weather,
    oneObservation: city.oneObservation,
  };
}

export function getLocalTime(city: City, now: Date = new Date()): string {
  return getCityNow(city, now).localTime;
}

export function getDayPeriodZh(city: City, now: Date = new Date()): '清晨' | '上午' | '午后' | '傍晚' | '夜晚' | '深夜' {
  return dayPeriodToZh(getCurrentPeriod(city.timezone, now));
}

export function getTimezoneAbbrev(city: City, now: Date = new Date()): string {
  try {
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: city.timezone,
      timeZoneName: 'short',
    });
    const parts = fmt.formatToParts(now);
    return parts.find((p) => p.type === 'timeZoneName')?.value ?? '';
  } catch {
    return '';
  }
}

export function findCity(slug: string): City | undefined {
  return cities.find((c) => c.slug === slug);
}

/**
 * 在 liveMoments 等地方使用的 cityId 与 cities.ts 中的 slug 不一定一致
 * （如 'capetown' vs 'cape-town'、'newyork' vs 'new-york'）。
 * 这里给出一个宽容版的查找，返回第一个匹配的 City；找不到返回 undefined。
 */
const CITY_ALIASES: Record<string, string> = {
  capetown: 'cape-town',
  cap: 'cape-town',
  nyc: 'new-york',
  newyork: 'new-york',
  'new-york': 'new-york',
  tokyo: 'tokyo',
  london: 'london',
};

export function findCityByAnyKey(key: string): City | undefined {
  if (!key) return undefined;
  const direct = cities.find((c) => c.slug === key || c.id === key);
  if (direct) return direct;
  const aliased = CITY_ALIASES[key.toLowerCase()];
  if (aliased) {
    return cities.find((c) => c.slug === aliased);
  }
  // 兜底：尝试 nameEn lowercase + no-spaces
  const norm = key.toLowerCase().replace(/[\s_-]/g, '');
  return cities.find((c) => c.nameEn.toLowerCase().replace(/[\s_-]/g, '') === norm);
}
