#!/usr/bin/env node
/* ============================================================
   看见地球 · v1.3 · parse-lighthouse (PR #15)
   - 读取 3 份 lighthouse-report-N.report.json
   - 取 median of 4 categories
   - 输出指标 + 退出码
   ============================================================ */

import fs from 'node:fs';

const SCORES = ['performance', 'accessibility', 'best-practices', 'seo'];
const THRESHOLD_FAIL = 90;
const THRESHOLD_WARN = 95;
const RUNS = 3;

const results = {};
for (const cat of SCORES) results[cat] = [];

// 读 3 份报告
for (let i = 1; i <= RUNS; i++) {
  const path = `lighthouse-report-${i}.report.json`;
  if (!fs.existsSync(path)) {
    console.error(`❌ Missing report: ${path}`);
    process.exit(1);
  }
  const report = JSON.parse(fs.readFileSync(path, 'utf-8'));
  for (const cat of SCORES) {
    const score = report.categories[cat]?.score;
    if (score === null || score === undefined) {
      console.error(`❌ Run ${i}: ${cat} score is null`);
      process.exit(1);
    }
    results[cat].push(Math.round(score * 100));
  }
}

// median
function median(arr) {
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

const medians = {};
for (const cat of SCORES) {
  medians[cat] = median(results[cat]);
}

// 输出
console.log("");
console.log("=== Lighthouse CI Result (median of 3 runs) ===");
for (const cat of SCORES) {
  const score = medians[cat];
  const marker = score >= THRESHOLD_WARN ? "✅" : score >= THRESHOLD_FAIL ? "⚠️ " : "❌";
  console.log(`  ${marker} ${cat.padEnd(20)} ${score}`);
}
console.log("================================================");
console.log("");

// 显示每次跑分（透明）
console.log("--- Individual runs (debug) ---");
for (const cat of SCORES) {
  console.log(`  ${cat.padEnd(20)} [${results[cat].join(", ")}]`);
}
console.log("");

// 阈值判断
let hasFail = false;
let hasWarn = false;
for (const cat of SCORES) {
  if (medians[cat] < THRESHOLD_FAIL) hasFail = true;
  else if (medians[cat] < THRESHOLD_WARN) hasWarn = true;
}

if (hasFail) {
  console.error(`❌ FAIL: At least one score < ${THRESHOLD_FAIL}`);
  process.exit(1);
}
if (hasWarn) {
  console.warn(`⚠️  WARN: At least one score < ${THRESHOLD_WARN} (but ≥ ${THRESHOLD_FAIL})`);
  process.exit(0);
}
console.log(`✅ PASS: All scores ≥ ${THRESHOLD_WARN}`);