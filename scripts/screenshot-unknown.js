// scripts/screenshot-unknown.js
//
// 用户独立运行的 Playwright 脚本 — 把 unknown-coordinate.html + SVG mockups 转为 PNG
// 仅当用户安装 Playwright 后可用(0 新依赖硬约束,所以 sandbox 不自动安装)
//
// 用法:
//::  npm install -D playwright
//::  npx playwright install chromium
//::  node scripts/screenshot-unknown.js
//
// 输出:outputs/v1.5-mockups/d10-unknown-coordinate/stage-{1,2,3,4,5}-{1440,1680,1920}.png

import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const OUT_DIR = 'outputs/v1.5-mockups/d10-unknown-coordinate';
const HTML_PATH = join(OUT_DIR, 'unknown-coordinate.html');

const BREAKPOINTS = [1440, 1680, 1920];
const STAGES = [1, 2, 3, 4, 5];

async function main() {
  console.log('Unknown Coordinate Screenshot Tool');
  console.log('====================================');

  const browser = await chromium.launch({ headless: true });

  // 1. HTML:5 stage screenshots × 3 breakpoints
  console.log('\n[1/2] Screenshotting HTML mockup (5 stages × 3 breakpoints = 15 PNG)...');
  for (const bp of BREAKPOINTS) {
    const ctx = await browser.newContext({
      viewport: { width: bp, height: 900 },
      deviceScaleFactor: 1,
    });
    const page = await ctx.newPage();
    await page.goto('file://' + join(process.cwd(), HTML_PATH));
    await page.waitForLoadState('networkidle');

    for (const stage of STAGES) {
      // 切换 stage
      await page.evaluate((s) => {
        document.body.className = `stage-${s}`;
      }, stage);
      await page.waitForTimeout(800); // CSS transition 800ms

      const out = join(OUT_DIR, `stage-${stage}-${bp}.png`);
      await page.screenshot({ path: out, fullPage: false });
      console.log(`  ✓ ${out}`);
    }
    await ctx.close();
  }

  await browser.close();
  console.log('\nDone. 15 PNG written to', OUT_DIR);
}

main().catch((e) => {
  console.error('Failed:', e.message);
  process.exit(1);
});