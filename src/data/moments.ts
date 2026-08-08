/* ============================================================
   看见地球 · v2.2.2 · 「此刻」全球动态数据
   围绕愿景："别把世界活的只有眼前这么小"
   → 同一时间，不同地方，不同命运
   ============================================================ */

export type MomentCategory = 'finance' | 'war' | 'art' | 'urban' | 'nature' | 'romance';

export type Moment = {
  id: string;
  cityCn: string;
  cityEn: string;
  countryCn: string;
  countryEn: string;
  /** 经度 */
  lon: number;
  /** 纬度 */
  lat: number;
  /** 类别（用于视觉标签） */
  category: MomentCategory;
  /** 类别中文标签 */
  categoryLabelCn: string;
  /** 此刻叙事（中文，一句话） */
  textCn: string;
  /** 此刻叙事（英文） */
  textEn: string;
};

export const moments: readonly Moment[] = [
  {
    id: 'nyc',
    cityCn: '纽约',
    cityEn: 'New York',
    countryCn: '美国',
    countryEn: 'United States',
    lon: -74.006,
    lat: 40.7128,
    category: 'finance',
    categoryLabelCn: '金融',
    textCn: 'Wall Street 刚敲响开盘钟，今天纳斯达克又涨了 2%。',
    textEn: 'The opening bell just rang on Wall Street — Nasdaq up 2% today.',
  },
  {
    id: 'gaza',
    cityCn: '加沙',
    cityEn: 'Gaza',
    countryCn: '巴勒斯坦',
    countryEn: 'Palestine',
    lon: 34.4668,
    lat: 31.5018,
    category: 'war',
    categoryLabelCn: '战火',
    textCn: '有人在废墟里翻找家人的照片。',
    textEn: 'Someone is searching for family photos in the rubble.',
  },
  {
    id: 'paris',
    cityCn: '巴黎',
    cityEn: 'Paris',
    countryCn: '法国',
    countryEn: 'France',
    lon: 2.3522,
    lat: 48.8566,
    category: 'art',
    categoryLabelCn: '艺术',
    textCn: '塞纳河边的旧书摊刚开张，老板在整理雨果的初版。',
    textEn: 'A used bookstall on the Seine just opened — sorting Hugo first editions.',
  },
  {
    id: 'tokyo',
    cityCn: '东京',
    cityEn: 'Tokyo',
    countryCn: '日本',
    countryEn: 'Japan',
    lon: 139.6917,
    lat: 35.6895,
    category: 'urban',
    categoryLabelCn: '都市',
    textCn: '涩谷十字路口的红灯刚转绿，3000 人同时起步。',
    textEn: 'Shibuya crossing just turned green — 3000 people start walking at once.',
  },
  {
    id: 'cape-town',
    cityCn: '开普敦',
    cityEn: 'Cape Town',
    countryCn: '南非',
    countryEn: 'South Africa',
    lon: 18.4241,
    lat: -33.9249,
    category: 'nature',
    categoryLabelCn: '自然',
    textCn: '桌山的"桌布"刚被风扯开一角，露出整片晴空。',
    textEn: 'The "tablecloth" on Table Mountain just lifted — blue sky revealed.',
  },
  {
    id: 'reykjavik',
    cityCn: '雷克雅未克',
    cityEn: 'Reykjavík',
    countryCn: '冰岛',
    countryEn: 'Iceland',
    lon: -21.9426,
    lat: 64.1466,
    category: 'romance',
    categoryLabelCn: '浪漫',
    textCn: 'Hallgrímskirkja 的尖顶在等一场极光。',
    textEn: "Hallgrímskirkja's spire is waiting for aurora.",
  },
] as const;

export const momentCategoryColors: Record<MomentCategory, string> = {
  finance: '#5BA8FF',  // 蓝
  war: '#B85450',      // 红
  art: '#C8924A',      // 棕
  urban: '#6B8E5A',    // 绿
  nature: '#82C0FF',   // 浅蓝
  romance: '#D97757',  // 暖橘
};
