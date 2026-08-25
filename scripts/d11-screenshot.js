#!/usr/bin/env node
// See Earth · Component Library · first pass · Screenshot Tool
// 不引入新依赖 — 使用系统 Chrome headless 生成 84 mockup PNG
// 14 组件 × 6 状态 = 84 PNG
//
// 用法:node scripts/d11-screenshot.js

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const OUT_DIR = join(root, 'outputs/v1.5-mockups/d11-component-library');
const HTML_PATH = join(OUT_DIR, 'component-library.html');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const COMPONENTS = [
  { num: '01', slug: 'globalheader',      name: 'GlobalHeader' },
  { num: '02', slug: 'sectionheader',     name: 'SectionHeader' },
  { num: '03', slug: 'heromedia',         name: 'HeroMedia' },
  { num: '04', slug: 'worldtimerail',     name: 'WorldTimeRail' },
  { num: '05', slug: 'timedisplay',       name: 'TimeDisplay' },
  { num: '06', slug: 'timecomparison',    name: 'TimeComparison' },
  { num: '07', slug: 'coordinatewindow',  name: 'CoordinateWindow' },
  { num: '08', slug: 'locationmeta',      name: 'LocationMeta' },
  { num: '09', slug: 'layerindicator',    name: 'LayerIndicator' },
  { num: '10', slug: 'onescene',          name: 'OneScene' },
  { num: '11', slug: 'samesecond',        name: 'SameSecond' },
  { num: '12', slug: 'echoinput',         name: 'EchoInput' },
  { num: '13', slug: 'distancenavigation',name: 'DistanceNavigation' },
  { num: '14', slug: 'revealmeta',        name: 'RevealMeta' },
];

const STATES = ['default', 'hover', 'focus', 'active', 'disabled', 'success'];

const BREAKPOINTS = [1440]; // 主 mockup 1440px(per §2.4.6)

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
if (!existsSync(CHROME)) {
  console.error('Chrome not found at', CHROME);
  process.exit(1);
}

const masterHtml = readFileSync(HTML_PATH, 'utf-8');

// 提取 styles 和 body 之前的所有内容
const styleMatch = masterHtml.match(/<style>([\s\S]*?)<\/style>/);
const cssBlock = styleMatch ? styleMatch[1] : '';

// 提取 head 部分
const headMatch = masterHtml.match(/<head>([\s\S]*?)<\/head>/);
const headBlock = headMatch ? headMatch[1].replace(/<style>[\s\S]*?<\/style>/, '') : '<meta charset="UTF-8">';

// 提取每个 cmpSection 的内容
function extractSection(num) {
  const startMarker = `<!-- ====== ${num} `;
  const nextNum = String(parseInt(num, 10) + 1).padStart(2, '0');
  const endMarker = `<!-- ====== ${nextNum} `;
  const startIdx = masterHtml.indexOf(startMarker);
  if (startIdx === -1) return null;
  const endIdx = masterHtml.indexOf(endMarker, startIdx);
  const slice = endIdx === -1
    ? masterHtml.slice(startIdx)
    : masterHtml.slice(startIdx, endIdx);
  return slice;
}

// 为每个 component + state 生成独立 HTML
function buildHtml(cmp, state, bp) {
  const section = extractSection(cmp.num);
  if (!section) return null;
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
${headBlock}
<meta name="viewport" content="width=${bp}">
<title>${cmp.num} ${cmp.name} · state:${state} · ${bp}px</title>
<style>${cssBlock}
html, body { width: ${bp}px !important; }
.stateSwitch, .libHeader { display: none !important; }
</style>
</head>
<body class="lib-state-${state}">
${section}
</body>
</html>`;
}

console.log('See Earth · Component Library · Screenshot Tool');
console.log('================================================');
console.log(`Components: ${COMPONENTS.length} · States: ${STATES.length} · Total: ${COMPONENTS.length * STATES.length} PNG`);

let ok = 0, fail = 0;
const total = COMPONENTS.length * STATES.length * BREAKPOINTS.length;
let count = 0;

for (const cmp of COMPONENTS) {
  for (const state of STATES) {
    for (const bp of BREAKPOINTS) {
      count++;
      const html = buildHtml(cmp, state, bp);
      if (!html) { fail++; continue; }
      const tmpFile = join(OUT_DIR, `_tmp_${cmp.slug}_${state}_${bp}.html`);
      const outFile = join(OUT_DIR, `${cmp.num}-${cmp.slug}-state-${state}-${bp}.png`);
      writeFileSync(tmpFile, html);
      try {
        execSync(
          `"${CHROME}" --headless=new --disable-gpu --no-sandbox --hide-scrollbars --disable-dev-shm-usage ` +
          `--window-size=${bp},900 ` +
          `--screenshot="${outFile}" ` +
          `--virtual-time-budget=2000 ` +
          `file://${tmpFile}`,
          { stdio: 'pipe', timeout: 15000 }
        );
        // 清理 tmp
        try { execSync(`rm -f "${tmpFile}"`); } catch {}
        console.log(`  ✓ [${count}/${total}] ${cmp.num}-${cmp.slug}-state-${state}-${bp}.png`);
        ok++;
      } catch (e) {
        console.error(`  ✗ [${count}/${total}] ${cmp.num}-${state}-${bp}: ${e.message.slice(0, 100)}`);
        fail++;
      }
    }
  }
}

console.log(`\nDone. ${ok} ok, ${fail} failed. ${total} total.`);
process.exit(fail > 0 ? 1 : 0);
