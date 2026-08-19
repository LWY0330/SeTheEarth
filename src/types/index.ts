/* ============================================================
   看见地球 · v1.6 · PROMPT 36 Phase 0 · Types barrel
   ------------------------------------------------------------
   统一从 '@/types' 导入所有 v1.6 schema 类型
   ============================================================ */

export type {
  // City
  PlaceType,
  CityIdentity,
  CityDynamic,
  WeatherSnapshot,
  CityVisual,
  HeroMedia,
  VisualStatus,
  City,
  MomentStats,
  PublicCityLocation,
  FullCityLocation,
  CityResolved,
} from './city';

export type {
  // City State
  CityStateLevel,
  CityPageState,
} from './cityState';

export {
  CITY_STATE_LEVEL_LABELS,
  CITY_PAGE_STATE_LABELS,
} from './cityState';

export type {
  // Moment
  Moment,
  MomentMedia,
  MomentMediaType,
  MomentTimeBucket,
  RawLocation,
  LocationVerification,
  ProvenanceStatus,
  ModerationStatus,
  RightsStatus,
} from './moment';
