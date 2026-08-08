#!/usr/bin/env node
/* ============================================================
   See Earth · v2.9.0 · 自检脚本
   不依赖任何第三方包。node scripts/visual-check.mjs
   ============================================================ */

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

let pass = 0, fail = 0, warn = 0;

function check(name, ok, detail = '') {
  if (ok) { pass++; console.log(`  ✅ ${name}`); }
  else { fail++; console.log(`  ❌ ${name}${detail ? ' — ' + detail : ''}`); }
}

function warnCheck(name, condition, detail = '') {
  if (!condition) { warn++; console.log(`  ⚠️  ${name}${detail ? ' — ' + detail : ''}`); }
  else { console.log(`  ✅ ${name}`); }
}

function readAllSrc() {
  const out = [];
  function walk(dir) {
    if (!existsSync(dir)) return;
    for (const f of readdirSync(dir)) {
      const p = join(dir, f);
      const s = statSync(p);
      if (s.isDirectory()) walk(p);
      else if (/\.(ts|tsx|css)$/.test(f)) out.push(readFileSync(p, 'utf-8'));
    }
  }
  walk(join(root, 'src'));
  return out.join('\n');
}

const srcContent = readAllSrc();

const codeOnly = srcContent
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^\s*\/\/.*$/gm, '');

// ──────────────────── 1. dist 存在性 ────────────────────
console.log('\n📦 1. dist 存在性');
const distDir = join(root, 'dist');
const distAssets = join(root, 'dist/assets');
check('dist/ 存在', existsSync(distDir));
check('dist/assets/ 存在', existsSync(distAssets));

if (!existsSync(distAssets)) {
  console.log('\n💥 dist 不存在，请先跑 `npm run build`\n');
  process.exit(1);
}

const distFiles = readdirSync(distAssets);
const jsFile = distFiles.find((f) => f.startsWith('index-') && f.endsWith('.js'));
const cssFile = distFiles.find((f) => f.startsWith('index-') && f.endsWith('.css'));
check('dist JS 文件存在', !!jsFile, jsFile || '');
check('dist CSS 文件存在', !!cssFile, cssFile || '');

const jsContent = jsFile ? readFileSync(join(distAssets, jsFile), 'utf-8') : '';
const cssContent = cssFile ? readFileSync(join(distAssets, cssFile), 'utf-8') : '';
const allDist = jsContent + cssContent;
const allSrc = srcContent + allDist;

// ──────────────────── 2. 关键 token ────────────────────
console.log('\n🎨 2. 关键 token（颜色 / 字体）');
check('奶白 #F5F1EA', allDist.includes('F5F1EA'));
check('墨黑 #1A1A1A', allDist.includes('1A1A1A'));
check('暖橘 #D97757', allDist.includes('D97757'));
check('Fraunces 字体', allDist.includes('Fraunces'));
check('Inter 字体', allDist.includes('Inter'));

// ──────────────────── 3. 版式（v2.9.0 Full-screen） ────────────────────
console.log('\n📐 3. 版式（v2.9.0 主+索引 60/40）');
check('min-height: 100svh', allSrc.includes('min-height: 100svh'));
check('height: 100svh', allSrc.includes('height: 100svh'));
check('grid-template-columns: 60% 40%', allSrc.includes('60% 40%'));
check('backdrop-filter (液态玻璃)', allDist.includes('backdrop-filter') || allDist.includes('blur(40px)'));

// ──────────────────── 4. v2.9.0 Full-screen Editorial ────────────────────
console.log('\n🎬 v2.9.0 · Full-screen Editorial Section（主+索引）');
const v290 = [
  { key: 'CityFeatured', name: 'CityFeatured 组件（主视觉城市）' },
  { key: 'CityIndex', name: 'CityIndex 组件（5 城市索引）' },
  { key: 'FEATURED CITY', name: '主视觉城市标签' },
  { key: 'transform: scaleY', name: '选中态暖橘色竖线' },
  { key: 'clamp(32px, 3.5vw + 0.5rem, 48px)', name: '主视觉城市名 32-48px' },
];
v290.forEach((v) => check(v.name, srcContent.includes(v.key)));

// v2.9.0 反向检查：3×2 等尺寸应已删除
const removedV290 = [
  { key: 'grid-template-columns: repeat(3, 1fr)', reason: 'v2.9.0 取消 3×2 等尺寸网格' },
  { key: 'grid-template-rows: 1fr 1fr', reason: 'v2.9.0 取消 2 行等高网格' },
];
removedV290.forEach((r) => {
  check(`v2.9.0 简化: 不应包含 "${r.key}"`, !srcContent.includes(r.key));
});

// ──────────────────── 5. v2.8.0 简化（保留向后兼容） ────────────────────
console.log('\n🧹 v2.8.0 简化（部分保留 · 6 城等权）');
// 6 城等权（v2.8.0）保留，但 3×2 网格已删
// v2.7.0 CityCard 已被替换（不再用 styles.featured/standard）
// v2.9.0 用新组件 CityFeatured/MomentFeatured，类名是 styles.featured（同名不同模块）
// 这里跳过（不强制反向检查）
// v2.7.0 CityCard 已被替换（不再用 styles.featured/standard）
// 这里跳过（不强制反向检查）

// ──────────────────── 6. 关键动效 ────────────────────
console.log('\n✨ 6. 关键动效');
check('shimmer 折射光带', allSrc.includes('shimmer'));
check('ease-emphatic 强减速曲线', allSrc.includes('ease-emphatic') || allSrc.includes('0.16, 1, 0.3, 1'));
check('v2.11.0 板块 2 切换动画 cityImageIn', allSrc.includes('cityImageIn'));

// ──────────────────── 7. 6 城市数据 + 此刻叙事 ────────────────────
console.log('\n🌍 7. 6 城市数据 + 此刻叙事');
const cities = [
  { slug: 'kyoto', cn: '京都', moment: '伏见稻荷' },
  { slug: 'lisbon', cn: '里斯本', moment: 'Alfama' },
  { slug: 'shanghai', cn: '上海', moment: '外滩' },
  { slug: 'mexico-city', cn: '墨西哥', moment: 'Coyoacán' },
  { slug: 'reykjavik', cn: '雷克雅未克', moment: 'Hallgrímskirkja' },
  { slug: 'cape-town', cn: '开普敦', moment: '桌山' },
];
cities.forEach((c) => {
  check(`城市 ${c.cn} slug`, srcContent.includes(`slug: '${c.slug}'`));
  check(`城市 ${c.cn} 此刻叙事含 "${c.moment}"`, srcContent.includes(c.moment));
});

// ──────────────────── 8. 主文案（v2.9.0 必含） ────────────────────
console.log('\n🎯 8. 主文案（v2.9.0 必含）');
const mainCopy = ['世界 · 不止', '方寸'];
mainCopy.forEach((k) => check(`主文案: "${k}"`, srcContent.includes(k)));

// ──────────────────── 9. 反愿景自检 ────────────────────
console.log('\n🚫 9. 反愿景自检（必须没有这些）');
const forbidden = [
  { key: '快来', reason: '营销话术' },
  { key: '立即', reason: '营销话术' },
  { key: '限时', reason: '营销话术' },
];
forbidden.forEach((f) => {
  warnCheck(`反愿景: 不应包含 "${f.key}" (${f.reason})`, !srcContent.includes(f.key));
});

// ──────────────────── 10. 关键组件类名 ────────────────────
console.log('\n🧩 10. 关键组件类名（v2.9.0）');
const classNames = ['title', 'titleEm', 'searchMount', 'logo', 'logoDot',
                    'citiesLayout', 'featuredCol', 'indexCol',
                    'citiesSection', 'moments', 'momentsTitle'];
classNames.forEach((c) => check(`类名 .${c}`, srcContent.includes(c)));

// ──────────────────── 11. 设计稿 + spec 同步 ────────────────────
console.log('\n🖼  11. 设计稿 + 设计规格同步');
const mockupPath = join(root, 'outputs/mockups/home.html');
const specPath = join(root, 'outputs/design-spec-v2.md');
const mockupContent = existsSync(mockupPath) ? readFileSync(mockupPath, 'utf-8') : '';
const specContent = existsSync(specPath) ? readFileSync(specPath, 'utf-8') : '';

check('home.html 设计稿存在', existsSync(mockupPath));
check('design-spec-v2.md 存在', existsSync(specPath));
if (existsSync(specPath)) {
  check('spec 升 v2.21.0', specContent.includes('v2.21.0'));
  check('spec 含 v2.11.0 时间轴说明', specContent.includes('时间轴') || specContent.includes('Timeline'));
  check('spec 含 10 城市说明', specContent.includes('伦敦') && specContent.includes('柏林') && specContent.includes('罗马') && specContent.includes('悉尼'));
  check('spec 含 6 城市此刻叙事表', specContent.includes('伏见稻荷') && specContent.includes('Alfama'));
  check('spec 含验收 checklist', specContent.includes('验收 checklist'));
}

// ──────────────────── 总结 ────────────────────
console.log(`\n${'━'.repeat(50)}`);
console.log(`📊 v2.21.0 自检结果：${pass} 通过 · ${fail} 失败 · ${warn} 警告`);
console.log('━'.repeat(50));

if (fail > 0) {
  console.log('\n💥 有失败项，必须修复后再交付。\n');
  process.exit(1);
} else if (warn > 0) {
  console.log('\n⚠️  有警告，建议排查（不阻塞）。\n');
  process.exit(0);
} else {
  console.log('\n✨ v2.21.0 全部通过，可以交付。\n');
  process.exit(0);
}
