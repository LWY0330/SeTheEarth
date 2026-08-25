#!/bin/bash
# ============================================================
# SEE EARTH · v1 · Bundle Secret Check (CI)
# ------------------------------------------------------------
# 任务: E-P0-08-D · 访问控制 + Secrets 管理
# 验收: 客户端 bundle 不含任何 secret（任务卡 Acceptance Criteria）
# 用法:
#   1. 直接运行: bash scripts/check-bundle-secrets.sh
#   2. 在 package.json prebuild 钩子: "prebuild": "bash scripts/check-bundle-secrets.sh"
#   3. 在 GitHub Actions: ./scripts/check-bundle-secrets.sh
# ------------------------------------------------------------
# ⚠️ 占位实现: 当前 dist/ 目录存在历史 build 产物。
#    实际生产场景应先 npm run build 再检查 dist/ 是否含 secret。
# ============================================================

set -uo pipefail

echo "[check-bundle-secrets] Verifying client bundle has no secrets..."

# 0. 路径设置
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
cd "$PROJECT_ROOT"

# 1. 检查 src/ + public/ 不含已知敏感关键字（HARD-CODED SECRETS）
SECRET_PATTERNS=(
  'PASSWORD[[:space:]]*=[[:space:]]*.'
  'SECRET_KEY[[:space:]]*=[[:space:]]*.'
  'PRIVATE_KEY[[:space:]]*=[[:space:]]*.'
  'API_KEY[[:space:]]*=[[:space:]]*.'
  'ACCESS_TOKEN[[:space:]]*=[[:space:]]*.'
  'JWT_SECRET[[:space:]]*=[[:space:]]*.'
  'DATABASE_URL[[:space:]]*=[[:space:]]*postgres'
)

FAIL=0

# 注: 禁用 set -e 在 grep 调用周围 (grep 无匹配返回 exit 1)
set +e

echo "[check-bundle-secrets] Step 1: Checking src/ + public/ for hardcoded secrets..."
for pattern in "${SECRET_PATTERNS[@]}"; do
  HITS=$(grep -rE "$pattern" src/ public/ 2>/dev/null | wc -l | tr -d ' ')
  if [ "$HITS" -gt 0 ]; then
    echo "  ❌ Found $HITS occurrences of pattern: $pattern"
    grep -rE "$pattern" src/ public/ 2>/dev/null | head -3
    FAIL=1
  fi
done

# 2. 检查 VITE_ 前缀变量不含敏感语义
echo "[check-bundle-secrets] Step 2: Checking VITE_ prefix for sensitive semantics..."
SENSITIVE_VITE_PATTERNS=(
  "VITE_SECRET"
  "VITE_PASSWORD"
  "VITE_PRIVATE_KEY"
  "VITE_API_KEY"
  "VITE_ACCESS_TOKEN"
  "VITE_JWT_SECRET"
)
for pattern in "${SENSITIVE_VITE_PATTERNS[@]}"; do
  HITS=$(grep -rE "$pattern" src/ .env.example .env.production 2>/dev/null | wc -l | tr -d ' ')
  if [ "$HITS" -gt 0 ]; then
    echo "  ❌ Found $HITS occurrences of '$pattern' (VITE_ prefix should NEVER be used for secrets)"
    grep -rE "$pattern" src/ .env.example .env.production 2>/dev/null | head -3
    FAIL=1
  fi
done

# 3. 检查 dist/ bundle（如存在）
if [ -d "dist" ]; then
  echo "[check-bundle-secrets] Step 3: Checking dist/ bundle..."
  # 只检查真正的 secret 模式（key-value 格式），避免误报占位
  DIST_PATTERNS=(
    "AKIA[0-9A-Z]{16}"
    "AIza[0-9A-Za-z_-]{35}"
    "ghp_[0-9a-zA-Z]{36}"
  )
  for pattern in "${DIST_PATTERNS[@]}"; do
    HITS=$(grep -rE "$pattern" dist/ 2>/dev/null | wc -l | tr -d ' ')
    if [ "$HITS" -gt 0 ]; then
      echo "  ❌ Found $HITS occurrences of pattern: $pattern in dist/"
      FAIL=1
    fi
  done
else
  echo "[check-bundle-secrets] Step 3: dist/ not found · skipping (run 'npm run build' first)"
fi

# 4. 检查 .env 文件未入仓
echo "[check-bundle-secrets] Step 4: Checking .env files not tracked in git..."
if command -v git >/dev/null 2>&1; then
  TRACKED_ENV=$(git ls-files 2>/dev/null | grep -E "^\.env$|^\.env\.local$" || true)
  if [ -n "$TRACKED_ENV" ]; then
    echo "  ❌ Found .env or .env.local tracked in git:"
    echo "$TRACKED_ENV"
    FAIL=1
  else
    echo "  ✅ No .env or .env.local tracked in git"
  fi
else
  echo "  ⚠️ git not available · skipping .env tracking check"
fi

# 5. 检查 VITE_USE_UNIVERSAL_CITYPAGE 是否有 .env 漏入（应在 .gitignore）
echo "[check-bundle-secrets] Step 5: Checking .gitignore includes .env patterns..."
if [ -f ".gitignore" ]; then
  if grep -E "^\.env$|^\.env\.local" .gitignore > /dev/null 2>&1; then
    echo "  ✅ .gitignore includes .env patterns"
  else
    echo "  ❌ .gitignore missing .env patterns"
    FAIL=1
  fi
fi

# 最终结论
echo ""
if [ $FAIL -eq 0 ]; then
  echo "✅ All checks passed · bundle is clean of secrets"
  exit 0
else
  echo "❌ Secret leak detected. See above. Aborting."
  exit 1
fi
