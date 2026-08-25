/* ============================================================
   SEE EARTH · v1 · Alpha Seed Data Report Generator
   ------------------------------------------------------------
   任务: E-P0-08-C · 部署 / 回滚 / 数据重置文档
   用途: 从 src/data/*.ts 硬编码数据生成 JSON seed report
   用法: node --experimental-strip-types release-v1/alpha-environment/scripts/seed-data.ts [env]
   ------------------------------------------------------------
   ⚠️ PLACEHOLDER: V1 当前无真实数据库。本脚本仅生成 seed report JSON
   用于审计 / 备份 / 未来 DB seed 参考。E-P0-02 后端落地后,
   需替换为真实 DB 写入逻辑（参见 deployment-guide-v1.md §6.3）。
   ============================================================ */

import { cities } from '../../../src/data/cities.ts';
import { moments } from '../../../src/data/moments.ts';
import { liveEvents } from '../../../src/data/liveMoments.ts';
import { UNKNOWN_PHOTO_BY_STAGE } from '../../../src/data/photoAssets.ts';

export interface SeedReportCity {
  id: string;
  slug: string;
  nameZh: string;
  nameEn: string;
  countryZh: string;
  countryEn: string;
  timezone: string;
  isFeatured: boolean;
  lon: number;
  lat: number;
}

export interface SeedReportMoment {
  id: string;
  cityZh: string;
  cityEn: string;
  category: string;
  captured_at: string;
}

export interface SeedReportLiveEvent {
  id: string;
  cityId: string;
  cityNameZh: string;
  title: string;
  observedAt: string;
  sourceType: string;
}

export interface SeedReport {
  generated_at: string;
  environment: string;
  version: string;
  cities_count: number;
  moments_count: number;
  live_events_count: number;
  photo_assets_count: number;
  cities: SeedReportCity[];
  moments: SeedReportMoment[];
  live_events: SeedReportLiveEvent[];
  photo_asset_ids: string[];
}

export function generateSeedReport(env: string = 'alpha'): SeedReport {
  return {
    generated_at: new Date().toISOString(),
    environment: env,
    version: '1.6.4',
    cities_count: cities.length,
    moments_count: moments.length,
    live_events_count: liveEvents.length,
    photo_assets_count: Object.keys(UNKNOWN_PHOTO_BY_STAGE).length,
    cities: cities.map((c) => ({
      id: c.id,
      slug: c.slug,
      nameZh: c.nameZh,
      nameEn: c.nameEn,
      countryZh: c.countryZh,
      countryEn: c.countryEn,
      timezone: c.timezone,
      isFeatured: c.isFeatured ?? false,
      lon: c.lon,
      lat: c.lat,
    })),
    moments: moments.map((m) => ({
      id: m.id,
      cityZh: m.cityZh,
      cityEn: m.cityEn,
      category: m.category,
      captured_at: new Date().toISOString(),
    })),
    live_events: liveEvents.map((e) => ({
      id: e.id,
      cityId: e.cityId,
      cityNameZh: e.cityNameZh,
      title: e.title,
      observedAt: e.observedAt,
      sourceType: e.sourceType,
    })),
    photo_asset_ids: Object.values(UNKNOWN_PHOTO_BY_STAGE).map((p) => p.asset_id),
  };
}

// CLI 入口（Node 22+ strip-types 支持 · 直接执行时调用）
// 注: 当文件被直接运行（`node script.ts`）时立即执行
// 注: 当文件被 import 时不执行（避免 side effect）

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const isMainModule = process.argv[1] === __filename ||
  process.argv[1].endsWith('seed-data.ts') ||
  process.argv[1].endsWith('seed-data');

if (isMainModule) {
  const env = process.argv[2] || 'alpha';
  const report = generateSeedReport(env);

  // 输出到 stdout
  console.log(JSON.stringify(report, null, 2));

  // 写入文件
  const outputPath = path.resolve(`./release-v1/alpha-environment/seed-report-${env}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
  console.error(`\n✅ Seed report saved to: ${outputPath}`);
}
