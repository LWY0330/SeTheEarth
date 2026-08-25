#!/usr/bin/env bash
# ============================================================
# SEE EARTH V1 · Launch Candidate 占位文案自动审计脚本
# 任务卡: D-P0-06 · Launch UI Checklist
# 关联文档: release-v1/launch-checklist/placeholders-audit-v1.md
# ============================================================
# 用法:
#   bash scripts/check-placeholders.sh
# 退出码:
#   0 = PASS (可进 Gate C)
#   1 = FAIL (存在占位文案 / 开发痕迹 / 红层伦理违规)
# ============================================================

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# ----------------------------------------------------------
# 排除路径（避免误报）
# ----------------------------------------------------------
GREP_EXCLUDES=(
  --exclude-dir=node_modules
  --exclude-dir=dist
  --exclude-dir=.git
  --exclude-dir=outputs
  --exclude-dir=work
  --exclude-dir=release-v1/launch-checklist
  --exclude='*.test.ts'
  --exclude='*.test.tsx'
  --exclude='*.snap'
  --exclude='check-placeholders.sh'
)

P0_FAIL=0
P1_FAIL=0
P2_WARN=0
P3_WARN=0

# ----------------------------------------------------------
# 工具函数
# ----------------------------------------------------------
red()    { printf "\033[31m%s\033[0m\n" "$*"; }
green()  { printf "\033[32m%s\033[0m\n" "$*"; }
yellow() { printf "\033[33m%s\033[0m\n" "$*"; }
bold()   { printf "\033[1m%s\033[0m\n" "$*"; }

scan_keyword() {
  local category="$1"
  local severity="$2"
  local keyword="$3"
  local pattern="$4"

  local result
  # -I 跳过二进制文件
  result=$(grep -rnI "${GREP_EXCLUDES[@]}" "$pattern" src/ public/ index.html 2>/dev/null || true)

  # 过滤常见合理命中(注释行 / URL 示例占位 photo-XXX)
  if [ -n "$result" ]; then
    filtered=$(echo "$result" | grep -vE "^[^-]*:[[:space:]]*//.*$pattern|photo-XXX" || true)
    if [ -z "$filtered" ]; then
      result=""
    else
      result="$filtered"
    fi
  fi

  if [ -n "$result" ]; then
    case "$severity" in
      P0)
        red "[FAIL-P0] [$category] 关键词 '$keyword' 命中:"
        echo "$result" | head -10
        P0_FAIL=$((P0_FAIL + 1))
        ;;
      P1)
        yellow "[FAIL-P1] [$category] 关键词 '$keyword' 命中:"
        echo "$result" | head -10
        P1_FAIL=$((P1_FAIL + 1))
        ;;
      P2)
        yellow "[WARN-P2] [$category] 关键词 '$keyword' 命中:"
        echo "$result" | head -5
        P2_WARN=$((P2_WARN + 1))
        ;;
      P3)
        echo "[INFO-P3] [$category] 关键词 '$keyword' 命中:"
        echo "$result" | head -3
        P3_WARN=$((P3_WARN + 1))
        ;;
    esac
  fi
}

# ----------------------------------------------------------
# Banner
# ----------------------------------------------------------
echo "===================================================="
bold "  SEE EARTH V1 · Launch Candidate 占位文案审计"
echo "  $(date '+%Y-%m-%d %H:%M:%S')"
echo "  Root: $ROOT"
echo "===================================================="
echo ""

# ----------------------------------------------------------
# P0 · 开发痕迹 / 假内容
# ----------------------------------------------------------
bold "--- P0 · 开发痕迹 / Lorem ipsum ---"
for kw in "Lorem ipsum" "lorem ipsum" "ipsum dolor" "FIXME" "HACK" "XXX"; do
  scan_keyword "开发痕迹" "P0" "$kw" "$kw"
done

echo ""
bold "--- P0 · Alpha / Beta 内部标识 ---"
scan_keyword "Alpha" "P0" "测试中" "测试中"
scan_keyword "Alpha" "P0" "测试版" "测试版"
scan_keyword "Alpha" "P0" "数据可能重置" "数据可能重置"
scan_keyword "Alpha" "P0" "Internal Alpha" "Internal Alpha"
scan_keyword "Alpha" "P0" "Closed Beta" "Closed Beta"

echo ""
bold "--- P0 · 假 CTA ---"
scan_keyword "假CTA" "P0" 'href="#"' 'href="#"'
scan_keyword "假CTA" "P0" 'href="javascript:void(0)"' 'href="javascript:void(0)"'
scan_keyword "假CTA" "P0" 'href="javascript:;' 'href="javascript:;'

echo ""
bold "--- P0 · 占位图（文件名） ---"
PLACEHOLDER_IMG=$(find public/ -type f \( -iname '*placeholder*' -o -iname '*dummy*' -o -iname '*sample*' \) 2>/dev/null || true)
if [ -n "$PLACEHOLDER_IMG" ]; then
  red "[FAIL-P0] 占位图存在:"
  echo "$PLACEHOLDER_IMG"
  P0_FAIL=$((P0_FAIL + 1))
fi

PLACEHOLDER_SVG=$(grep -rn "${GREP_EXCLUDES[@]}" "dummyimage\|placeimg\|placeholder.com" src/ public/ 2>/dev/null || true)
if [ -n "$PLACEHOLDER_SVG" ]; then
  red "[FAIL-P0] 第三方占位图服务 URL:"
  echo "$PLACEHOLDER_SVG"
  P0_FAIL=$((P0_FAIL + 1))
fi

# ----------------------------------------------------------
# P1 · 红层 / Khartoum 占位
# ----------------------------------------------------------
echo ""
bold "--- P1 · 红层伦理文案（应已被 v2-phase15-fixes-report.md §1 修复） ---"
# 排除 cities.ts 数据文件(历史/考古描述性"废墟"是合法用法,非渲染文案)
# 仅扫描 components/ 下的渲染文案
for kw in "南郊 30 公里" "军事据点" "炮击" "炮弹声" "炮火" "战火" "战区" "伤员" "伤亡"; do
  scan_keyword "红层伦理" "P1" "$kw" "$kw"
done

# "废墟" 单独检查:仅在 components/ 下,且排除 cities.ts 的历史描述
echo "  检查 '废墟' 在 components/(排除 cities.ts 的历史描述):"
RUINS_RESULT=$(grep -rnI "${GREP_EXCLUDES[@]}" "废墟" src/components/ 2>/dev/null || true)
if [ -n "$RUINS_RESULT" ]; then
  yellow "[FAIL-P1] [红层伦理] '废墟' 在 components/ 下命中:"
  echo "$RUINS_RESULT"
  P1_FAIL=$((P1_FAIL + 1))
fi

echo ""
bold "--- P1 · Gaza 数据（应已被 v2-phase15-fixes-report.md §2 替换） ---"
for kw in "加沙" "Gaza" "巴勒斯坦" "Palestine"; do
  scan_keyword "Gaza数据" "P1" "$kw" "$kw"
done

echo ""
bold "--- P1 · Khartoum 前端占位文案 ---"
KHARTOUM_RESULT=$(grep -rn "${GREP_EXCLUDES[@]}" "(待补 · 占位)\|(待补图)\|(Red Layer · 占位)" src/components/ 2>/dev/null || true)
if [ -n "$KHARTOUM_RESULT" ]; then
  yellow "[FAIL-P1] Khartoum 前端占位文案命中:"
  echo "$KHARTOUM_RESULT"
  P1_FAIL=$((P1_FAIL + 1))
fi

# ----------------------------------------------------------
# P2 · 文案质量
# ----------------------------------------------------------
echo ""
bold "--- P2 · TODO 注释计数（信息性） ---"
TODO_COUNT=$(grep -rn "${GREP_EXCLUDES[@]}" "TODO" src/ 2>/dev/null | wc -l | tr -d ' ')
echo "TODO 注释总数: $TODO_COUNT"
if [ "$TODO_COUNT" -gt 5 ]; then
  yellow "[WARN-P2] TODO 注释 > 5,建议清理"
fi

# ----------------------------------------------------------
# P3 · 跨域链接 rel 属性
# ----------------------------------------------------------
echo ""
bold "--- P3 · 跨域链接 rel 属性 ---"
TARGET_BLANK_FILES=$(grep -rln "${GREP_EXCLUDES[@]}" 'target="_blank"' src/ 2>/dev/null || true)
if [ -n "$TARGET_BLANK_FILES" ]; then
  for f in $TARGET_BLANK_FILES; do
    if grep -q "noopener" "$f" 2>/dev/null; then
      echo "[OK] $f: target=_blank + rel=noopener ✓"
    else
      yellow "[WARN-P3] $f: target=_blank 但缺 rel=noopener"
    fi
  done
fi

# ----------------------------------------------------------
# P3 · 12 城 URL 可达性（基础）
# ----------------------------------------------------------
echo ""
bold "--- P3 · 12 城数据完整性 ---"
CITIES_FILE="src/data/cities.ts"
if [ -f "$CITIES_FILE" ]; then
  CITY_COUNT=$(grep -c "^  {$" "$CITIES_FILE" 2>/dev/null || echo "0")
  echo "[INFO] $CITIES_FILE 中城市条目数: $CITY_COUNT"
  if [ "$CITY_COUNT" -lt 11 ]; then
    yellow "[WARN-P3] 城市数 < 11,可能影响 12 Coordinates 板块"
  fi
fi

# ----------------------------------------------------------
# 汇总
# ----------------------------------------------------------
echo ""
echo "===================================================="
bold "  汇总"
echo "===================================================="
echo "P0 失败: $P0_FAIL"
echo "P1 失败: $P1_FAIL"
echo "P2 警告: $P2_WARN"
echo "P3 警告: $P3_WARN"
echo ""

if [ "$P0_FAIL" -gt 0 ] || [ "$P1_FAIL" -gt 0 ]; then
  red "❌ Gate C 占位文案审计 FAIL"
  echo ""
  echo "请修复 P0/P1 命中项后重新运行本脚本。"
  echo "详细审计清单: release-v1/launch-checklist/placeholders-audit-v1.md"
  exit 1
fi

green "✅ Gate C 占位文案审计 PASS"
exit 0
