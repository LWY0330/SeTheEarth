#!/usr/bin/env bash
# ============================================================
# 看见地球 · v1.3 · Lighthouse 性能门禁 (PR #15)
# 双阈值: < 90 fail, < 95 warn, ≥ 95 pass
# 用法: npm run lighthouse
# ============================================================
set -euo pipefail

# 1. Lighthouse 不在 PATH 则全局装
if ! command -v lighthouse >/dev/null 2>&1; then
  echo "[lighthouse-ci] Installing lighthouse globally..."
  npm install -g lighthouse
fi

# 清理上次报告
rm -f lighthouse-report-*.report.json lighthouse-report-*.html /tmp/lighthouse-*.log /tmp/preview.log

# 2. build 生产环境
echo "[lighthouse-ci] Building production bundle..."
npm run build

# 3. 启动 preview（默认端口 4173），后台
echo "[lighthouse-ci] Starting preview server..."
npm run preview > /tmp/preview.log 2>&1 &
PREVIEW_PID=$!
trap "kill $PREVIEW_PID 2>/dev/null || true" EXIT

# 等 preview 就绪
for i in 1 2 3 4 5 6 7 8 9 10; do
  if curl -sS -o /dev/null --max-time 1 http://localhost:4173/ 2>/dev/null; then
    echo "[lighthouse-ci] preview ready after ${i}s"
    break
  fi
  sleep 1
done

# 4. 跑 3 次 lighthouse
echo "[lighthouse-ci] Running Lighthouse 3 times..."
for i in 1 2 3; do
  echo "[lighthouse-ci] run ${i}/3 ..."
  lighthouse "http://localhost:4173/" \
    --output=json \
    --output=html \
    --output-path="./lighthouse-report-${i}" \
    --chrome-flags="--headless --no-sandbox --disable-gpu" \
    --only-categories=performance,accessibility,best-practices,seo \
    --quiet \
    --form-factor=desktop \
    --screenEmulation.disabled \
    --throttling-method=provided \
    > "/tmp/lighthouse-${i}.log" 2>&1
done

# 5. 解析 3 份报告，计算 median
echo "[lighthouse-ci] Parsing 3 reports..."
node scripts/parse-lighthouse.mjs