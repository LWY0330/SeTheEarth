#!/bin/bash
# Generate 15 SVG mockups for Unknown Coordinate Reveal(5 stages × 3 breakpoints)
#
# Reason: PM wants 15 PNG(per spec d10 §2.4)but "0 新依赖" rules out Playwright/puppeteer.
# SVG mockups替代:可在任何浏览器打开,忠实表达设计意图。
# 后期若需真 PNG,运行 'node scripts/screenshot-unknown.js'(需用户单独 npm install playwright)
#
# Stages(per spec d10 §2.1):
#   1. UTC ?  (默认)
#   2. 23° N / 102° W  (粗坐标,5s 后)
#   3. 23.6345° N / 102.5528° W  (精确坐标,8s 后)
#   4. 进入此刻 →  (按钮,12s 后)
#   5. MEXICO CITY  (城市出现,点击后)

set -e

OUT_DIR="outputs/v1.5-mockups/d10-unknown-coordinate"
mkdir -p "$OUT_DIR"

# Helper:render one SVG
render_stage() {
  local stage=$1
  local bp=$2
  local width=$3
  local out="$OUT_DIR/stage-${stage}-${bp}.svg"

  case $stage in
    1) label="UTC ?"; coords="15:42 · 31°C · UTC ?"; hero="Stage 1: UTC 未知" ;;
    2) label="23° N / 102° W"; coords="15:42 · 31°C · 23° N · 102° W"; hero="Stage 2: 粗坐标" ;;
    3) label="23.6345° N / 102.5528° W"; coords="15:42 · 31°C · 23.6345° N · 102.5528° W"; hero="Stage 3: 精确坐标" ;;
    4) label="进入此刻 →"; coords="15:42 · 31°C · 23.6345° N · 102.5528° W"; hero="Stage 4: 进入按钮" ;;
    5) label="MEXICO CITY"; coords="墨西哥城 · 07:42 · Tuesday"; hero="Stage 5: 城市出现" ;;
  esac

  cat > "$out" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} 900" width="${width}" height="900" preserveAspectRatio="xMidYMid meet">
  <!-- Background:深色 + Earth Blue 渐变(per spec §4.1) -->
  <defs>
    <linearGradient id="bg-${bp}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1A2D40" />
      <stop offset="60%" stop-color="#264A73" />
      <stop offset="100%" stop-color="#0F1A28" />
    </linearGradient>
  </defs>

  <!-- Page background -->
  <rect width="${width}" height="900" fill="url(#bg-${bp})" />

  <!-- Top nav:logo + dot(per spec §1.1) -->
  <text x="32" y="36" font-family="Cormorant Garamond, serif" font-size="20" fill="#F7FAFC" opacity="0.9">看见地球</text>
  <circle cx="${width}-48" cy="28" r="4" fill="#4F8FE8" />

  <!-- Stage meta header -->
  <text x="32" y="300" font-family="JetBrains Mono, monospace" font-size="11" fill="#4F8FE8" letter-spacing="3.2" font-weight="500">
    <tspan>●</tspan> UNKNOWN COORDINATE
  </text>
  <text x="32" y="324" font-family="JetBrains Mono, monospace" font-size="14" fill="#F7FAFC" opacity="0.5" letter-spacing="3">
    SECOND 0${stage} / 05
  </text>

  <!-- Quote(Stage 1-4) -->
EOF

  if [ "$stage" -lt 5 ]; then
    cat >> "$out" <<EOF
  <text x="32" y="380" font-family="Fraunces, serif" font-style="italic" font-size="22" fill="#F7FAFC" opacity="0.75">
    <tspan x="32" dy="0">此刻,在地球的某个角落。</tspan>
  </text>
EOF
  fi

  # Bottom UTC block
  if [ "$stage" -lt 5 ]; then
    cat >> "$out" <<EOF

  <!-- UTC 块 -->
  <text x="32" y="800" font-family="JetBrains Mono, monospace" font-size="56" fill="#F7FAFC" font-weight="400">
    ${coords}
  </text>
  <text x="32" y="850" font-family="JetBrains Mono, monospace" font-size="12" fill="#F7FAFC" opacity="0.6" letter-spacing="2">
    SECOND 0${stage} / 05   ·   SEE EARTH   ·   UNKNOWN COORDINATE
  </text>
EOF
  else
    # Stage 5: Empty State 替代
    cat >> "$out" <<EOF

  <!-- Stage 5: 城市出现 -->
  <text x="${width}/2" y="380" text-anchor="middle" font-family="Cormorant Garamond, serif" font-size="56" fill="#11161B" font-weight="500">
    MEXICO CITY
  </text>
  <text x="${width}/2" y="420" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" fill="#7B8792" letter-spacing="3">
    墨西哥城 · 07:42 · Tuesday
  </text>

  <!-- CTA 按钮 -->
  <rect x="${width}/2-90" y="450" width="180" height="48" fill="#4F8FE8" rx="2" />
  <text x="${width}/2" y="480" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="12" fill="#F7FAFC" letter-spacing="2" font-weight="500">
    进入此刻 →
  </text>
EOF
  fi

  # Stage 4: CTA 按钮
  if [ "$stage" -eq 4 ]; then
    cat >> "$out" <<EOF

  <!-- Stage 4: 进入按钮 -->
  <rect x="${width}/2-90" y="780" width="180" height="48" fill="#4F8FE8" rx="2" />
  <text x="${width}/2" y="810" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="12" fill="#F7FAFC" letter-spacing="2" font-weight="500">
    进入此刻 →
  </text>
EOF
  fi

  # Footer
  cat >> "$out" <<EOF

  <!-- Footer label(SVG mockup 标识) -->
  <text x="${width}-32" y="${bp}" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="9" fill="#F7FAFC" opacity="0.3">
    PROMPT 43 v1 mockup · stage ${stage} · ${bp}px
  </text>
</svg>
EOF

  echo "✓ Generated: $out"
}

# 5 stages × 3 breakpoints = 15 SVG
for stage in 1 2 3 4 5; do
  render_stage "$stage" "1440" 1440
  render_stage "$stage" "1680" 1680
  render_stage "$stage" "1920" 1920
done

echo ""
echo "Total: 15 SVG mockups generated in $OUT_DIR/"
echo "Open in any browser to view the design."
echo ""
echo "To convert to PNG (requires Playwright,not installed here):"
echo "  npm install -D playwright"
echo "  node scripts/screenshot-unknown.js"