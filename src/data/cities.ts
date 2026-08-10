/* ============================================================
   看见地球 · v2.60.0 · 城市数据 + DayPeriod + CityImage + isFeatured
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
  nameZh: string;
  nameEn: string;
  countryZh: string;
  countryEn: string;
  description: string;
  momentZh: string;
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
    nameZh: '京都', nameEn: 'Kyoto',
    countryZh: '日本', countryEn: 'Japan',
    description: '京都的节奏不在时钟上，而在光与水的呼吸里。千年古都的街巷里，寺庙与庭园在四季里静默呼吸。\n\n作为日本旧时首都，京都在公元 794 年到 1868 年间是日本的政治与文化中心。今天的京都仍在祭祀、节令和手工艺上保留着江户时代的气息。\n\n走在哲学之道上，樱花季的三四月是粉白色；盛夏的鸭川河床立起川床料理的竹席与风铃；深秋的岚山被枫叶烧成一片红；冬雪落在金阁寺的镜湖池上，又是一年。茶道、华道、香道、书道——这些被列为“传统文化”的事，在这里仍有人每天练习，不是表演，是日常。\n\n鸭川河床边，水流过卵石带走时间。坐在岸边看一只苍鹭等鱼，京都的节奏会自己慢下来。',
    momentZh: '有人正在伏见稻荷的鸟居下，系一个祈愿。',
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
    oneObservation: '伏见稻荷的鸟居正被清晨的阳光慢慢照亮，狐狸神使蹲在殿前，尾巴上还挂着露水。',
    weather: { summary: '晴转多云', temperatureC: 12, icon: 'sun-cloud' },
    livingNote: '京都的早晨安静得只剩水琴窟的声音。町屋的格子门被轻轻推开，豆腐店里刚摆出今早的嫩豆腐。九条葱的香气从厨房里飘出来，和着木地板上被擦过的肥皂味。鸭川岸边，遛狗的老人和晨跑的人在同一段河床上交错而过，互不打扰。',
    cultureNote: '作为旧时日本首都，京都在公元 794 年到 1868 年间是日本的政治与文化中心。今天的京都仍在祭祀、节令和手工艺上保留着江户时代的气息。祇园祭、葵祭、时代祭三大祭贯穿全年，五月的都舞、十二月的献茶式都按古制进行。京料理、京菓子、西阵织、清酒——这些名词背后，是一条从宫廷到町屋的活水。',
    isFeatured: true,
  },
  {
    id: 'lisbon', slug: 'lisbon',
    nameZh: '里斯本', nameEn: 'Lisbon',
    countryZh: '葡萄牙', countryEn: 'Portugal',
    description: '大西洋的风从塔霍河口吹来，把老城山坡上的窗玻璃轻轻推开。大航海时代的余温仍留在老城山坡的石板路上。\n\n里斯本是欧洲大陆最西端的大城市，历史上是 15-16 世纪大航海时代的出发港之一。法朵音乐仍留在老城的小酒馆里，几把吉他和一把葡萄牙吉他，就能把夜晚唱得很长。\n\nAlfama 老城的房子叠在半山，墙面被阳光晒成奶黄、橘红、灰蓝三种颜色；电车的黄色车身从狭窄的街巷里滑过，铃声掠过晾在窗外的被单。Bairro Alto 到了夜晚又换了一副面孔，fado 酒馆的灯亮起来，歌声从门缝里漏出去。28 路电车还在爬坡，制图师还在用老式罗盘，贝伦区老店的葡式蛋挞还在按 1837 年的方子出炉。',
    momentZh: '28 路电车正爬上 Alfama 的老坡，铃铛响了两声。',
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
    oneObservation: '清晨，海风刚刚把夜晚吹散。塔霍河口有一艘帆船正慢慢收锚，桔色的帆在风里发亮。',
    weather: { summary: '多云', temperatureC: 16, icon: 'cloud' },
    livingNote: '阿尔法玛老城的鹅卵石街面在清晨还没被游客踏响。第 28 路电车从格拉萨下山，铃声划过整条坡道。楼下咖啡馆把椅子搬到门口，老头端着浓缩咖啡看报，谁也不催谁。空气里有海风的咸、面包房刚烤出的甜，还有不知哪一家飘来的鳕鱼香。',
    cultureNote: '里斯本是欧洲大陆最西端的大城市，历史上是 15-16 世纪大航海时代的出发港之一。法朵音乐仍留在老城的小酒馆里，几把吉他和一把葡萄牙吉他，就能把夜晚唱得很长。1755 年一场大地震几乎把整座城市夷平，今天的 Pombalina 下城是当时欧洲最早按“网格规划”重建的城区之一。贝伦塔、热罗尼莫斯修道院、发现者纪念碑——这些石头记得大航海的来路。',
    isFeatured: true,
  },
  {
    id: 'shanghai', slug: 'shanghai',
    nameZh: '上海', nameEn: 'Shanghai',
    countryZh: '中国', countryEn: 'China',
    description: '外滩的钟声和浦东的灯光，在江面相遇了一个世纪。上海开埠于 1843 年，是近代中国最早接触西方商业的城市之一。外滩万国建筑群记录了那一段历史。\n\n外滩的 52 栋老楼被叫做“万国建筑博览会”，罗马柱、哥特尖顶、巴洛克山花一字排开，背后是浦东 632 米的上海中心。夜里看两岸，浦西是金色，浦东是冷蓝；早上反过来，浦西被阳光照醒，浦东还在玻璃幕墙的反光里眯着眼睛。\n\n法租界的梧桐树在十一月开始落叶；武康大楼的船头造型永远有人在拍；田子坊的弄堂被改成小店，咖啡和本帮酱油鸭的味道在同一条巷子里撞上。一百年前这里是远东的金融中心，今天它仍然是——只是钱换了种算法。',
    momentZh: '外滩的灯一盏一盏亮起来，黄浦江的风带着凉。',
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
    oneObservation: '外滩的灯一盏一盏亮起来，黄浦江的风带着凉，对岸有人在练萨克斯。',
    weather: { summary: '晴', temperatureC: 28, icon: 'sun' },
    livingNote: '外滩的钟楼刚响过八点，南京路步行街上行人渐渐密起来。本帮菜馆子刚把酱油鸭摆上外卖柜。永康路的咖啡店把椅子搬到人行道上，隔壁是一家开了三十年的老式理发店。有人在便利店门口抽第一根烟，有人在地铁口刚下夜班。',
    cultureNote: '上海开埠于 1843 年，是近代中国最早接触西方商业的城市之一。外滩万国建筑群记录了那一段历史。1920-1930 年代这里是亚洲的金融与文化中心，左翼作家、电影公司、爵士乐队都从这一带长出来。今天的上海是 2,400 万人的家，本帮菜、海派文化、弄堂生活与陆家嘴的金融数据并存——浦西和浦东隔江对望，一百年也没合上。',
    isFeatured: true,
  },
  {
    id: 'mexico-city', slug: 'mexico-city',
    nameZh: '墨西哥城', nameEn: 'Mexico City',
    countryZh: '墨西哥', countryEn: 'Mexico',
    description: '高原上的彩色之城，每个街角都在演奏自己的旋律。墨西哥城在阿兹特克时期是特诺奇提特兰城，西班牙殖民后又重建为新西班牙的首都。今天的 Coyoacán、Centro Histórico 还保存着殖民时代的石头房子。\n\n海拔 2,240 米让这里的天空格外透蓝。早上八点的太阳还温柔，Coyoacán 的彩色街上已经有人在卖 tamales；Frida Kahlo 的蓝色房子外排着长队，街对面是巴斯孔塞洛斯图书馆。Catedral Metropolitana 用五百年时间慢慢下沉，今天地基已经比初建时低了几米。\n\n地铁里有人卖橘子和吉他弦；Mercado de la Merced 的早市把整条街染成香料色；周末的 Xochimilco 还能租一只彩船在运河上慢慢漂。墨西哥城不是一座“看一眼就走”的城市——它要你住下来。',
    momentZh: 'Coyoacán 的彩色街上，有人正在卖刚出炉的玉米饼。',
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
    oneObservation: 'Coyoacán 的彩色街上，街头画家刚支起画架，第一笔的橘色还没干透。',
    weather: { summary: '晴', temperatureC: 19, icon: 'sun' },
    livingNote: '海拔 2,240 米的清晨凉得舒服。Frida Kahlo 的蓝色房子外已经有人在排队。街角面包店刚把 concha 摆出来，墨西哥咖啡的香味从门里一直飘到对面。有人在等公交车，有人在遛那只三条腿的狗。天空蓝得几乎不真实。',
    cultureNote: '墨西哥城在阿兹特克时期是特诺奇提特兰城，西班牙殖民后又重建为新西班牙的首都。今天的 Coyoacán、Centro Histórico 还保存着殖民时代的石头房子。Frida Kahlo、Diego Rivera、Octavio Paz——这些名字都在这座城市的某条街上走过。死亡节（Día de Muertos）期间，整个城市用橘色万寿菊把街道铺满，家人和逝者一起吃饭、唱歌、回忆。今天的墨西哥城是 2,200 万人的家，是拉丁美洲最大的都市。',
    isFeatured: true,
  },
  {
    id: 'tokyo', slug: 'tokyo',
    nameZh: '东京', nameEn: 'Tokyo',
    countryZh: '日本', countryEn: 'Japan',
    description: '新旧交织的巨型都市，地铁和神社共享同一条街道。江户改称东京是 1868 年的事。但东京作为日本首都的概念更早，1603 年德川幕府已经在这里设立了幕府。\n\n涩谷十字路口一次绿灯放 3,000 人过马路，转过街角就是明治神宫的千年古木。新宿的歌舞伎町夜里 11 点比白天还亮，3 分钟外的 Golden Gai 还有 6 平米的小酒吧开了 50 年。秋叶原的电器店和扭蛋机并排，浅草寺的雷门前有人在拍“今户烧”招财猫。\n\n东京不是一座“看”的城市，是一座“走”的城市。每走 200 米就换一种声音、一种味道、一种节奏。地下铁 13 条线把一切缝起来，电车到站的铃声和神社的钟声会在同一个下午响。',
    momentZh: '涩谷十字路口的红灯刚转绿，3000 人同时起步。',
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
    oneObservation: '涩谷十字路口的红灯刚转绿，3,000 人同时起步，没有一个人撞到。',
    weather: { summary: '阴', temperatureC: 27, icon: 'cloud' },
    livingNote: '末班地铁刚走，第一班即将出发。便利店门口的关东煮冒着小泡，刚下夜班的人站在暖灯前犹豫选萝卜还是年糕。自动贩卖机在凌晨三点还亮着，洒水车在住宅区已经开工。东京不分昼夜地运转，但每个角落都有自己的时区。',
    cultureNote: '江户改称东京是 1868 年的明治维新。但东京作为日本首都的概念更早——1603 年德川幕府已经在这里设立了江户幕府。浅草寺是东京最古老的寺庙（公元 628 年），明治神宫是 1920 年为祭明治天皇而建。今天的东京是 1,400 万人的家，是全球 GDP 最高的城市之一，也是把江户时代的“町”文化和 21 世纪的赛博朋克装进同一张地图的城市。',
  },
  {
    id: 'rio', slug: 'rio',
    nameZh: '里约', nameEn: 'Rio de Janeiro',
    countryZh: '巴西', countryEn: 'Brazil',
    description: '山海之间的桑巴城，海滩、森林和基督像共同呼吸。里约 1960 年曾经是巴西的首都。桑巴、嘉年华和基督像共同构成了今天世界对这座城市的印象。\n\n基督像张开双臂站在 Corcovado 山顶，面朝瓜纳巴拉湾。从 Copacabana 到 Ipanema 是一条 4 公里的白色沙滩；Sugarloaf 山（甜面包山）从海面拔起 396 米；Tijuca 森林是世界上最大的城市森林之一，里面的猴子比人还多。\n\n嘉年华前的四旬斋，桑巴学校每天晚上在 Sambadrome 彩排；嘉年华的最后一晚，整个城市在鞭炮声里停止运转。沙滩上永远有人在踢 futebol，海滩酒吧永远有人在切青柠——Caipirinha 的诞生比这座城市的现代化还早。里约不只是一座“旅游城市”，它是把狂欢和生活穿在身上的城市。',
    momentZh: '科帕卡巴纳海滩上有人在踢足球，影子被阳光拉得很长。',
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
    oneObservation: '科帕卡巴纳海滩上有人在踢足球，影子被阳光拉得很长，Caipirinha 冰块在杯中轻轻撞响。',
    weather: { summary: '晴', temperatureC: 25, icon: 'sun' },
    livingNote: 'Ipanema 的海滩伞刚撑开。Caipirinha 的青柠被切得嘎嘎响，海浪在 5 米外拍着沙滩。一个老人在慢跑，一个小孩在挖沙坑，一辆卖 mate 的小推车在海滩步道上叫卖。阳光把每个人的影子拉得很长。',
    cultureNote: '里约 1960 年曾经是巴西的首都。桑巴、嘉年华和基督像共同构成了今天世界对这座城市的印象。葡萄牙人 1502 年第一次抵达瓜纳巴拉湾，把它误认作一条大河的入口，因此叫它“Rio de Janeiro”（一月之河）。2016 年里约举办了奥运会，是南美洲第一座举办奥运的城市。今天的里约是 670 万人的家，是把狂欢、足球、森巴和海浪穿在身上的城市。',
  },
  {
    id: 'reykjavik', slug: 'reykjavik',
    nameZh: '雷克雅未克', nameEn: 'Reykjavík',
    countryZh: '冰岛', countryEn: 'Iceland',
    description: '世界最北的首都，等待极光和午夜阳光的交替。雷克雅未克是世界最北的首都，建城于 874 年。今天它几乎 100% 使用地热和水电能。\n\n这座城市只有 13 万人，但有 60 多家泳池——地热温泉是日常生活的中心，而不是旅游的奢侈品。冬天只有 4 小时光照，夏天太阳几乎不落。Hallgrímskirkja 教堂的尖顶是全城最高点，74 米；它起飞的时候像一柱凝固的熔岩。\n\n夏天的午夜阳光让人忘了几点；冬天的极光让人忘了日期。雷克雅未克的生活节奏跟着光走，跟着温泉的水温走，跟着鲸鱼在 Faxaflói 湾的呼吸走。它不大，但它是世界最北的首都，也是“如何用最少的能源生活”的活样板。',
    momentZh: 'Hallgrímskirkja 的尖顶在等一场极光。',
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
    oneObservation: 'Hallgrímskirkja 的尖顶在等一场极光，教堂前的喷泉已经先一步被冻住。',
    weather: { summary: '多云', temperatureC: 9, icon: 'cloud' },
    livingNote: '夏天里太阳还在低空徘徊。咖啡馆门口晒着羊毛毯子，主街上有人在遛那只被雷克雅未克人公认的“市猫”。游泳池里 42°C 的温泉水冒着白气，远处 Faxaflói 湾有一头鲸鱼正在跃出水面。',
    cultureNote: '雷克雅未克是世界最北的首都，建城于 874 年（最初是维京人的定居点）。今天它几乎 100% 使用地热和水电能，是全球碳排放最低的首都之一。Hallgrímskirkja 教堂 1986 年完工，设计灵感来自冰岛的玄武岩柱；Harpa 音乐厅 2011 年落成，玻璃外墙能在极夜里反射出整片天空。冰岛人口约 38 万，其中三分之一住在雷克雅未克。',
  },
  {
    id: 'cape-town', slug: 'cape-town',
    nameZh: '开普敦', nameEn: 'Cape Town',
    countryZh: '南非', countryEn: 'South Africa',
    description: '两洋交汇之地，桌山下的港口城市。好望角就在开普敦南边，是 1488 年 Bartolomeu Dias 绕过非洲最南端的航海节点。\n\n桌山（Table Mountain）像一块平顶的石头，1,085 米高，从城市正中隆起。它的“桌布”——山顶的云层——被当地人叫做 table cloth，是这座城市每天的天气预报。V&A 滨水区是 1980 年代改造的老港口，仓库被改成餐厅、设计店、电影院，木栈道一直延伸到 Quay Four 的啤酒花园。\n\nBo-Kaap 区的房子被刷成粉、绿、蓝、橙，是 17 世纪马来奴隶后代的街区。Cape Point 在城市南边 60 公里，是非洲大陆的西南角；好望角的灯塔下，两大洋的水流以肉眼可见的方式相遇。开普敦不只是一座“非洲城市”，它是大航海时代的最后一站，也是非洲最欧化的城市之一。',
    momentZh: '桌山的"桌布"刚被风扯开一角，露出整片晴空。',
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
    oneObservation: '桌山的“桌布”刚被风扯开一角，露出整片晴空，好望角方向有一艘货船在慢慢靠近。',
    weather: { summary: '晴', temperatureC: 18, icon: 'sun' },
    livingNote: 'V&A 滨水区的餐厅开始摆出早午餐桌。桌山的云被叫做“table cloth”，今天的它被风扯开一角。Bo-Kaap 区的彩色房子在阳光下格外亮，隔壁就是 350 年前荷兰东印度公司留下的花园。空气里有烤面包和海风的混合。',
    cultureNote: '好望角就在开普敦南边，是 1488 年 Bartolomeu Dias 绕过非洲最南端的航海节点。1652 年荷兰东印度公司在这里建立补给站，开普敦成为大航海时代从欧洲到亚洲航线的“中点”。Bo-Kaap 区的房子被刷成粉、绿、蓝、橙，是 17 世纪马来奴隶后代的街区。今天的开普敦是 470 万人的家，是桌山、葡萄园、好望角三件套组成的世界级风景城市。',
    isFeatured: true,
  },
  {
    id: 'london', slug: 'london',
    nameZh: '伦敦', nameEn: 'London',
    countryZh: '英国', countryEn: 'United Kingdom',
    description: '泰晤士河两岸的钟声与塔桥，写着几个世纪的史诗。伦敦自 1066 年诺曼底公爵征服英格兰之后基本是英国首都。City of London 城内那一平方英里仍是世界的金融心脏之一。\n\n泰晤士河把伦敦切成南北。河北岸是 Westminster，国会大厦、大本钟、Westminster Abbey 一字排开；河南岸是 South Bank，皇家节日音乐厅、泰特现代美术馆、London Eye 顺河而立。Tower Bridge 1894 年通车，今天仍在为往来的船只开合。\n\n红色双层巴士、黑色出租车、红色电话亭——这些是“伦敦的封面”；东伦敦的 Brick Lane、Spitalfields、Shoreditch 是它的“后院”。Camden Market 的朋克和 Notting Hill 的彩色房子隔了几个邮编区。伦敦的每个邮编都有自己的腔调。',
    momentZh: '大本钟刚敲完整点，伦敦眼的灯光同步亮起。',
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
    oneObservation: '大本钟刚敲完整点，伦敦眼的灯光同步亮起，Waterloo 桥下的水反射成两片。',
    weather: { summary: '小雨', temperatureC: 14, icon: 'rain' },
    livingNote: '泰晤士河南岸的旧市场刚开市。Waterloo 桥上有通勤的人在跑。South Bank 的书摊还没开门，老头在桥下喂鸽子。远处 Westminster 的大本钟正在整点报时，London Eye 的摩天轮开始第一圈。空气里有巴士尾气和泰晤士河的潮气。',
    cultureNote: '伦敦自 1066 年诺曼底公爵征服英格兰之后基本是英国首都。City of London 城内那一平方英里仍是世界的金融心脏之一。Westminster Abbey 自 1066 年起是英国君主加冕地，Tower of London 守护过伊丽莎白一世和皇冠珠宝，伦敦大火（1666）和伦敦大轰炸（1940-41）两次几乎把城市夷平。今天的伦敦是 900 万人的家，是把莎士比亚、披头士、哈利·波特和全球金融数据装进同一张地图的城市。',
    isFeatured: true,
  },
  {
    id: 'berlin', slug: 'berlin',
    nameZh: '柏林', nameEn: 'Berlin',
    countryZh: '德国', countryEn: 'Germany',
    description: '东西方的缝合处，墙虽不在，但对话仍在。柏林在 19 世纪是德意志帝国的首都，又在 20 世纪经历了两次世界大战和冷战分隔。今天的柏林墙遗址是一座露天画廊。\n\n柏林的地铁不叫 subway，叫 U-Bahn；它的地上电车叫 Tram；这两种交通工具在 1961-1989 年间被柏林墙切断。墙倒之后，东边的 Mitte 区和西边的 Kreuzberg 区被缝合，今天的柏林是欧洲最不像首都的首都——它没有 Skyline，但它的街道比任何 Skyline 都厚。\n\n勃兰登堡门前 6 根多立克柱撑起的门楣，象征着和平；隔一条街就是 Holocaust 纪念碑，2,711 根灰色混凝土碑按网格排列。柏林不是“看风景”的城市，是“读历史”的城市。它的每一条街都有自己的过去。',
    momentZh: '勃兰登堡门前有人刚放下一束花，献给柏林墙倒塌的日子。',
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
    oneObservation: '勃兰登堡门前有人刚放下一束花，献给柏林墙倒塌的日子，鸽群在门楣前飞过。',
    weather: { summary: '阴', temperatureC: 20, icon: 'cloud' },
    livingNote: 'Mitte 的面包店刚开门。Friedrichstraße 上通勤的自行车比车多。有人在勃兰登堡门前停下来看鸽群，有人在柏林墙遗址的画廊前拍了三张照片。咖啡馆里有人读报，隔壁桌有人在改博士论文——柏林的早晨有点学术味。',
    cultureNote: '柏林在 19 世纪是德意志帝国的首都，又在 20 世纪经历了两次世界大战和冷战分隔。1961 年东德建起柏林墙，1989 年 11 月 9 日被推倒。今天的柏林墙遗址（East Side Gallery）是一座露天画廊，全长 1.3 公里。勃兰登堡门建于 1791 年，原是和平女神庙；国会大厦 1933 年被焚毁，今天的玻璃穹顶是 1999 年诺曼·福斯特的改造。今天的柏林是 380 万人的家。',
  },
  {
    id: 'rome', slug: 'rome',
    nameZh: '罗马', nameEn: 'Rome',
    countryZh: '意大利', countryEn: 'Italy',
    description: '两千年的石头在阳光下讲故事，每一块都是历史。罗马的建城年份传说在公元前 753 年。今天罗马老城被完整地保留在现代都市的中心，是 UNESCO 世界遗产。\n\n罗马的 7 座山丘各有各的教堂；2,000 多座喷泉各有各的传说；500 多座教堂各有各的画。斗兽场建在公元 70 年代；万神殿建在公元 126 年，今天的罗马人每天从它前面经过。Spanish Steps 的台阶上永远有人坐着，Trevi 喷泉永远有人在扔硬币许愿。\n\nTrastevere 的老巷子到了晚上就变成露天餐厅，Vespa 从狭窄的广场中穿过；Centro Storico 的中世纪街巷在白天是游客的迷宫，傍晚就是罗马人的客厅。罗马不是“看一座城市”，是“走进一个没有屋顶的博物馆”。',
    momentZh: '特莱维喷泉前有人刚扔下一枚硬币，许了个愿。',
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
    oneObservation: '特莱维喷泉前有人刚扔下一枚硬币，许了个愿，背对着海神，背对着身后整个罗马。',
    weather: { summary: '晴', temperatureC: 26, icon: 'sun' },
    livingNote: 'Trastevere 老巷的 espresso 吧台围满了人。Vespa 从广场中穿过，意大利语和英语的招呼混在一起。面包房刚把 pizza bianca 切片，cappuccino 还在冒泡。教堂的钟声每十五分钟响一次，老鼠都不抬头。',
    cultureNote: '罗马的建城年份传说在公元前 753 年。罗马帝国时期（公元前 27 年 - 公元 476 年）的版图横跨欧亚非三大洲。斗兽场建于公元 70-80 年代，万神殿建于公元 126 年，罗马广场是古罗马的政治中心。今天罗马老城被完整地保留在现代都市的中心，是 UNESCO 世界遗产（1980 年列入）。今天的罗马是 280 万人的家，是把帝国废墟、巴洛克教堂、文艺复兴广场和 espresso bar 装进同一张地图的城市。',
  },
  {
    id: 'sydney', slug: 'sydney',
    nameZh: '悉尼', nameEn: 'Sydney',
    countryZh: '澳大利亚', countryEn: 'Australia',
    description: '海港之城，帆船与歌剧院共享同一种蔚蓝。1788 年 1 月 26 日英国第一舰队到达悉尼湾。今天的悉尼是澳大利亚人口最多的城市，歌剧院和海港大桥是它的视觉标志。\n\n悉尼港（Port Jackson）是一个被切得支离破碎的海湾，帆船从 Circular Quay 一路开到 Mosman，背景是 Sydney Opera House 的白帆和 Sydney Harbour Bridge 的钢铁拱。海港大桥 1932 年通车，被当地人叫做“The Coathanger”（衣架）；歌剧院 1973 年落成，是 20 世纪最年轻的 UNESCO 世界遗产之一。\n\nBondi 的浪从南冰洋一路冲过来；Surry Hills 的咖啡店把早午餐做到下午三点；Paddy\'s Market 的水果从没有标签。悉尼不是“澳大利亚”——它是澳大利亚最不像澳大利亚的那一座城市。',
    momentZh: '歌剧院刚亮起灯，白色的帆在夜色里发亮。',
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
    oneObservation: '歌剧院刚亮起灯，白色的帆在夜色里发亮，港口的帆船正一艘一艘归港。',
    weather: { summary: '晴', temperatureC: 17, icon: 'sun' },
    livingNote: 'Bondi 海滩的救生员刚换上早班。Surry Hills 的咖啡店排起了队，隔壁酒吧的吊灯还亮着——昨夜的人没散，今早的人又到了。港口有一艘渡轮刚离港，海鸥在桅杆上等。悉尼的早晨从一杯 flat white 开始。',
    cultureNote: '1788 年 1 月 26 日英国第一舰队到达悉尼湾，悉尼是澳大利亚最古老的欧洲殖民地。歌剧院 1973 年落成，是 20 世纪最年轻的 UNESCO 世界遗产之一；海港大桥 1932 年通车，被当地人叫做“The Coathanger”（衣架）。今天的悉尼是 530 万人的家，是把歌剧院、海港大桥、Bondi 浪和 Parramatta 的中餐装进同一张地图的城市。',
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
