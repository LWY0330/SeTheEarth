#!/usr/bin/env node
/* ============================================================
   看见地球 · v1.3.x · PR #16 · download-city-images
   - 从 src/data/cities.ts 解析 12 城 × 4 场景 = 48 张图
   - 下载到 public/images/cities/<id>/<scene>.jpg
   - 用 Node 22+ fetch + stream
   - 0 依赖
   ============================================================ */

import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import http from 'node:http';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CITIES_TS = path.join(ROOT, "src/data/cities.ts");
const PUBLIC_DIR = path.join(ROOT, "public/images/cities");

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith("https:") ? https : http;
    const doIt = (targetUrl, redirectsLeft = 5) => {
      lib.get(targetUrl, (res) => {
        if ([301, 302, 303, 307, 308].includes(res.statusCode)) {
          if (redirectsLeft <= 0) return reject(new Error("too many redirects: " + targetUrl));
          const next = res.headers.location;
          if (!next) return reject(new Error("redirect without location: " + targetUrl));
          res.resume();
          return doIt(next, redirectsLeft - 1);
        }
        if (res.statusCode !== 200) {
          res.resume();
          return reject(new Error("HTTP " + res.statusCode + " " + targetUrl));
        }
        const file = fs.createWriteStream(dest);
        res.pipe(file);
        file.on("finish", () => file.close(() => resolve(Number(res.headers["content-length"] ?? 0))));
      }).on("error", reject);
    };
    doIt(url);
  });
}

// 解析 cities.ts：按 id 分块，提取每个城市的 img() 调用
const src = fs.readFileSync(CITIES_TS, "utf-8");
const lines = src.split("\n");

// 遍历找城市 id 出现处作为章节起点（在 img("...) 之前最近的 { id: "..." })
// 简化：先扫所有 id 出现处的行号，再扫 img() 行的行号，按行号区间分配

const idRegex = /^\s*id:\s*'(.+?)',\s*slug:/;
const imgRegex = /^\s*img\(\s*'(.+?)',\s*'(.+?)',\s*'(.+?)',\s*'(.+?)'\s*\)/;

const cityByLine = []; // [{ line, id }]
for (let i = 0; i < lines.length; i++) {
  const m = lines[i].match(idRegex);
  if (m) cityByLine.push({ line: i, id: m[1] });
}

const tasks = [];
for (const item of cityByLine) {
  const nextCity = cityByLine.find((c) => c.line > item.line);
  const endLine = nextCity ? nextCity.line : lines.length;
  for (let i = item.line + 1; i < endLine; i++) {
    const m = lines[i].match(imgRegex);
    if (m) {
      tasks.push({ cityId: item.id, scene: m[1], period: m[2], url: m[3], focus: m[4], fileLine: i });
    }
  }
}

console.log(`Found ${tasks.length} images across ${cityByLine.length} cities.`);

// 并发限制 4
async function runPool(items, fn, concurrency = 4) {
  const results = new Array(items.length);
  let i = 0;
  const workers = Array.from({ length: concurrency }, async () => {
    while (true) {
      const idx = i++;
      if (idx >= items.length) return;
      results[idx] = await fn(items[idx], idx);
    }
  });
  await Promise.all(workers);
  return results;
}

let downloaded = 0, skipped = 0, failed = 0;
const renames = []; // { fileLine, newUrl }

await runPool(tasks, async (t) => {
  const dir = path.join(PUBLIC_DIR, t.cityId);
  fs.mkdirSync(dir, { recursive: true });
  const dest = path.join(dir, `${t.scene}.jpg`);
  if (fs.existsSync(dest) && fs.statSync(dest).size > 1024) {
    skipped++;
  } else {
    try {
      await download(t.url, dest);
      downloaded++;
    } catch (e) {
      failed++;
      console.error(`  ✗ ${t.cityId}/${t.scene}: ${e.message}`);
      return;
    }
  }
  renames.push({ fileLine: t.fileLine, cityId: t.cityId, scene: t.scene, rawUrl: t.url });
}, 4);

console.log(`Done. downloaded=${downloaded} skipped=${skipped} failed=${failed}`);

// 替换 cities.ts 中的 URL：本文件 src 在内存里反向替换
let out = src;
for (const r of renames) {
  const lineArr = out.split("\n");
  // 只替换当前 fileLine 行（避免重复 URL 替换到错地方）
  lineArr[r.fileLine] = lineArr[r.fileLine].replace(`'${r.rawUrl}'`, `'/images/cities/${r.cityId}/${r.scene}.jpg'`);
  out = lineArr.join("\n");
}
fs.writeFileSync(CITIES_TS, out);
console.log(`Replaced ${renames.length} URLs in cities.ts`);