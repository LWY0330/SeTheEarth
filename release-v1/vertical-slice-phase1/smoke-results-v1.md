---
title: SEE EARTH V1 · Phase 1 Smoke Test Results
type: smoke-test-results
tags: [release-v1, e-p0-02, smoke-test, see-earth, alpha]
task_id: E-P0-02
phase: Phase 1 · Vertical Slice
dispatched_at: 2026-08-22
status: DRAFT · IN REVIEW (待用户部署后填入实际结果)
author: Engineer Agent (Round 2B)
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/vertical-slice-phase1/smoke-results-v1.md
source_inputs:
  - release-v1/vertical-slice-phase1/api-implementation-v1.md
  - release-v1/vertical-slice-phase1/alpha-deployment-evidence-v1.md
  - release-v1/api-contract/error-code-dict-v1.md
---

# SEE EARTH V1 · Phase 1 Smoke Test Results

> **作者**：Engineer Agent（Round 2B · Phase 1 子集）
> **目标读者**：PM Agent（验收）、用户（执行）、SRE
> **任务卡**：E-P0-02 Launch Vertical Slice（Phase 1 子集 · §G smoke test）
> **运行时间**：⏳ 用户部署后执行（预计 5-10 分钟）
> **决策日期**：2026-08-22

---

## 0. 状态

**当前**：⏳ PENDING · 待用户完成 `alpha-deployment-evidence-v1.md` Step 1-5 后执行

**预计执行时间**：2026-08-23（用户部署后）

**执行环境**：本地终端 + `curl` + `jq`（无需特殊工具）

---

## 1. Smoke Test 脚本（`scripts/smoke-phase1.sh`）

> **保存位置**：`/Users/lwy/Documents/ChatGPT/看见地球/scripts/smoke-phase1.sh`（Phase 1 新增）
>
> **可执行**：`chmod +x scripts/smoke-phase1.sh && ./scripts/smoke-phase1.sh`

```bash
#!/usr/bin/env bash
# ============================================================================
# SEE EARTH V1 · Phase 1 Smoke Test
# ----------------------------------------------------------------------------
# - 验证所有 Phase 1 endpoint 返回 200 + 正确结构
# - 验证 privacy gate（response 不含 lat/lng）
# - 验证 CORS + rate limit
# - 验证 12 城 + 12 slots（Daily 12 主入口）
# ============================================================================

set -euo pipefail

# 配置
API_BASE="${API_BASE:-https://alpha-api-see-earth.vercel.app/v1}"
WEB_BASE="${WEB_BASE:-https://alpha-see-earth.vercel.app}"

# 颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 计数
PASS=0
FAIL=0
WARN=0

pass() {
  echo -e "  ${GREEN}✓${NC} $1"
  PASS=$((PASS + 1))
}

fail() {
  echo -e "  ${RED}✗${NC} $1"
  FAIL=$((FAIL + 1))
}

warn() {
  echo -e "  ${YELLOW}⚠${NC} $1"
  WARN=$((WARN + 1))
}

section() {
  echo ""
  echo -e "${YELLOW}== $1 ==${NC}"
}

# 检查工具
command -v curl >/dev/null 2>&1 || { echo "curl required"; exit 1; }
command -v jq >/dev/null 2>&1 || { echo "jq required (brew install jq)"; exit 1; }

echo "🧪 SEE EARTH V1 Phase 1 Smoke Test"
echo "API: $API_BASE"
echo "WEB: $WEB_BASE"

# ============================================================================
# 1. Health Check
# ============================================================================
section "1. GET /healthz"

HEALTH=$(curl -fsS "$API_BASE/healthz" 2>&1) || {
  fail "/healthz returned non-2xx"
  echo "  Response: $HEALTH"
  exit 1
}

STATUS=$(echo "$HEALTH" | jq -r '.status')
PHASE=$(echo "$HEALTH" | jq -r '.phase')
[ "$STATUS" = "ok" ] && pass "status=ok" || fail "status=$STATUS (expected ok)"
[ "$PHASE" = "phase1" ] && pass "phase=phase1" || warn "phase=$PHASE (expected phase1)"

# ============================================================================
# 2. Cities List
# ============================================================================
section "2. GET /cities"

CITIES=$(curl -fsS "$API_BASE/cities?limit=50" 2>&1) || {
  fail "/cities returned non-2xx"
  exit 1
}

CITY_COUNT=$(echo "$CITIES" | jq '.data | length')
[ "$CITY_COUNT" = "12" ] && pass "12 cities returned" || fail "$CITY_COUNT cities (expected: 12)"

# Privacy gate check (CRITICAL)
if echo "$CITIES" | jq -e '.. | objects | select(has("latitude") or has("longitude"))' >/dev/null 2>&1; then
  fail "❌ PRIVACY LEAK: lat/lng found in /cities response"
  echo "$CITIES" | jq '.. | objects | select(has("latitude") or has("longitude"))'
  exit 1
else
  pass "no raw lat/lng in /cities response (privacy gate OK)"
fi

# public_location_only flag
PLO=$(echo "$CITIES" | jq '[.data[].public_location_only] | all')
[ "$PLO" = "true" ] && pass "public_location_only=true on all cities" || fail "public_location_only mismatch"

# ============================================================================
# 3. City Detail (kyoto)
# ============================================================================
section "3. GET /cities/kyoto"

KYOTO=$(curl -fsS "$API_BASE/cities/kyoto" 2>&1) || {
  fail "/cities/kyoto returned non-2xx"
  exit 1
}

TZ=$(echo "$KYOTO" | jq -r '.data.timezone')
[ "$TZ" = "Asia/Tokyo" ] && pass "timezone=Asia/Tokyo" || fail "timezone=$TZ"

LAYER=$(echo "$KYOTO" | jq -r '.data.layer')
[ "$LAYER" = "yellow" ] && pass "layer=yellow (seed featured)" || warn "layer=$LAYER (expected yellow for Kyoto)"

# Privacy gate on city detail
if echo "$KYOTO" | jq -e '.. | objects | select(has("latitude") or has("longitude"))' >/dev/null 2>&1; then
  fail "❌ PRIVACY LEAK: lat/lng in /cities/kyoto"
  exit 1
else
  pass "no raw lat/lng in /cities/kyoto"
fi

# ============================================================================
# 4. City Moments (kyoto)
# ============================================================================
section "4. GET /cities/kyoto/moments"

MOMENTS=$(curl -fsS "$API_BASE/cities/kyoto/moments" 2>&1) || {
  fail "/cities/kyoto/moments returned non-2xx"
  exit 1
}

MOMENT_COUNT=$(echo "$MOMENTS" | jq '.data | length')
[ "$MOMENT_COUNT" -gt "0" ] && pass "$MOMENT_COUNT moments returned" || warn "0 moments (Kyoto may have empty moments)"

# Check no raw_location
if echo "$MOMENTS" | jq -e '.. | objects | select(has("raw_location"))' >/dev/null 2>&1; then
  fail "❌ PRIVACY LEAK: raw_location in /cities/kyoto/moments"
  exit 1
else
  pass "no raw_location in moments"
fi

# ============================================================================
# 5. Editions Today (Daily 12)
# ============================================================================
section "5. GET /editions/today"

TODAY=$(curl -fsS "$API_BASE/editions/today" 2>&1) || {
  fail "/editions/today returned non-2xx"
  exit 1
}

SLOT_COUNT=$(echo "$TODAY" | jq '.data.slots | length')
[ "$SLOT_COUNT" = "12" ] && pass "12 slots returned" || fail "$SLOT_COUNT slots (expected: 12)"

VERSION=$(echo "$TODAY" | jq '.data.version')
[ "$VERSION" -ge "1" ] && pass "version=$VERSION" || fail "version=$VERSION"

IS_FALLBACK=$(echo "$TODAY" | jq '.data.is_fallback')
echo "  is_fallback=$IS_FALLBACK"

DATE=$(echo "$TODAY" | jq -r '.data.date')
echo "  date=$DATE"

# ============================================================================
# 6. Editions List
# ============================================================================
section "6. GET /editions"

EDITIONS=$(curl -fsS "$API_BASE/editions?limit=10" 2>&1) || {
  fail "/editions returned non-2xx"
  exit 1
}

EDITION_COUNT=$(echo "$EDITIONS" | jq '.data | length')
[ "$EDITION_COUNT" -gt "0" ] && pass "$EDITION_COUNT editions returned" || warn "0 editions"

# ============================================================================
# 7. CORS Preflight
# ============================================================================
section "7. CORS preflight"

CORS_RESP=$(curl -fsS -o /dev/null -w "%{http_code}" \
  -X OPTIONS \
  -H "Origin: https://alpha-see-earth.vercel.app" \
  -H "Access-Control-Request-Method: GET" \
  "$API_BASE/cities")

[ "$CORS_RESP" = "204" ] && pass "OPTIONS /cities returned 204" || fail "OPTIONS returned $CORS_RESP (expected 204)"

CORS_HEADER=$(curl -fsS -o /dev/null -w "%{header_json}" \
  -X OPTIONS \
  -H "Origin: https://alpha-see-earth.vercel.app" \
  "$API_BASE/cities" 2>/dev/null | jq -r '.["access-control-allow-origin"][0] // empty')

[ -n "$CORS_HEADER" ] && pass "Access-Control-Allow-Origin present" || fail "no CORS header"

# ============================================================================
# 8. Rate Limit
# ============================================================================
section "8. Rate limit (100 req/min/IP per OD-05)"

# 快速发 105 个请求，预期第 101 个返回 429
SUCCESS_COUNT=0
RATE_LIMITED=0
for i in $(seq 1 105); do
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$API_BASE/healthz")
  if [ "$HTTP_CODE" = "200" ]; then
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
  elif [ "$HTTP_CODE" = "429" ]; then
    RATE_LIMITED=$((RATE_LIMITED + 1))
  fi
done

echo "  Sent 105 requests · 200=$SUCCESS_COUNT · 429=$RATE_LIMITED"
[ "$RATE_LIMITED" -gt "0" ] && pass "rate limit triggered ($RATE_LIMITED × 429)" || warn "no rate limit detected (may be per-instance bucket · Phase 1 in-memory)"

# ============================================================================
# 9. Error Handling
# ============================================================================
section "9. Error responses"

# 404
HTTP_404=$(curl -s -o /tmp/err.json -w "%{http_code}" "$API_BASE/cities/non-existent-city")
[ "$HTTP_404" = "404" ] && pass "GET non-existent city → 404" || fail "expected 404, got $HTTP_404"

ERR_CODE=$(jq -r '.error_code' /tmp/err.json)
[ "$ERR_CODE" = "city_not_found" ] && pass "error_code=city_not_found" || fail "error_code=$ERR_CODE"

# 400 (invalid query)
HTTP_400=$(curl -s -o /tmp/err2.json -w "%{http_code}" "$API_BASE/cities?limit=999")
[ "$HTTP_400" = "400" ] && pass "GET invalid query → 400" || warn "expected 400, got $HTTP_400"

# ============================================================================
# 10. Web SPA Accessibility
# ============================================================================
section "10. Web SPA accessibility"

WEB_HOME=$(curl -fsS -o /dev/null -w "%{http_code}" "$WEB_BASE/")
[ "$WEB_HOME" = "200" ] && pass "GET / → 200" || fail "GET / → $WEB_HOME"

WEB_CITY=$(curl -fsS -o /dev/null -w "%{http_code}" "$WEB_BASE/cities/kyoto")
[ "$WEB_CITY" = "200" ] && pass "GET /cities/kyoto → 200" || fail "GET /cities/kyoto → $WEB_CITY"

# ============================================================================
# Summary
# ============================================================================
section "Summary"
echo -e "  ${GREEN}Passed${NC}: $PASS"
echo -e "  ${RED}Failed${NC}: $FAIL"
echo -e "  ${YELLOW}Warnings${NC}: $WARN"

if [ $FAIL -eq 0 ]; then
  echo ""
  echo -e "${GREEN}✅ All critical smoke tests passed${NC}"
  exit 0
else
  echo ""
  echo -e "${RED}❌ $FAIL critical tests failed${NC}"
  exit 1
fi
```

---

## 2. 预期测试结果（部署后填写）

### 测试执行时间：⏳ TBD

### 环境

| 项 | 值 |
|---|---|
| API Base | `https://alpha-api-see-earth.vercel.app/v1` |
| Web Base | `https://alpha-see-earth.vercel.app` |
| 浏览器 | Chrome 126.0 / Safari 17.0 |
| 测试客户端 IP | (用户本地 ISP IP) |
| 测试时间 | 2026-08-23 (TBD) |

### 测试结果矩阵

| # | 测试项 | 预期 | 实际 | 通过? |
|---|---|---|---|---|
| 1 | GET /healthz → 200 + status=ok | ✅ | ⏳ | ⏳ |
| 1 | GET /healthz → phase=phase1 | ✅ | ⏳ | ⏳ |
| 2 | GET /cities → 12 cities | ✅ | ⏳ | ⏳ |
| 2 | GET /cities → NO lat/lng | ✅ | ⏳ | ⏳ |
| 2 | GET /cities → public_location_only=true | ✅ | ⏳ | ⏳ |
| 3 | GET /cities/kyoto → 200 + timezone=Asia/Tokyo | ✅ | ⏳ | ⏳ |
| 3 | GET /cities/kyoto → NO lat/lng | ✅ | ⏳ | ⏳ |
| 4 | GET /cities/kyoto/moments → ≥0 moments | ✅ | ⏳ | ⏳ |
| 4 | GET /cities/kyoto/moments → NO raw_location | ✅ | ⏳ | ⏳ |
| 5 | GET /editions/today → 12 slots | ✅ | ⏳ | ⏳ |
| 5 | GET /editions/today → version≥1 | ✅ | ⏳ | ⏳ |
| 6 | GET /editions → ≥0 editions | ✅ | ⏳ | ⏳ |
| 7 | OPTIONS /cities → 204 | ✅ | ⏳ | ⏳ |
| 7 | OPTIONS /cities → CORS header | ✅ | ⏳ | ⏳ |
| 8 | Rate limit → 429 after 100 reqs | ✅ | ⏳ | ⏳ |
| 9 | GET non-existent → 404 + city_not_found | ✅ | ⏳ | ⏳ |
| 9 | Invalid query → 400 | ✅ | ⏳ | ⏳ |
| 10 | Web SPA → 200 | ✅ | ⏳ | ⏳ |
| 10 | Web /cities/kyoto → 200 | ✅ | ⏳ | ⏳ |

### 总体通过率：⏳ TBD / 19 项

**Acceptance 阈值**：所有 PASS 项 ≥ 17 项（critical）= 通过

---

## 3. 手动测试项（UI 验证）

### 3.1 浏览器手动测试

| # | 操作 | 预期 | 状态 |
|---|---|---|---|
| 1 | 打开 `https://alpha-see-earth.vercel.app/` | Alpha Banner 显示 + 6 cities grid + Live Events | ⏳ |
| 2 | 点击 Kyoto 城市卡 | 跳转到 `/cities/kyoto` + Hero 图 + 4 屏 layout | ⏳ |
| 3 | 滚到 CityPage 屏 04 (Echo) | 显示"Echo 暂未开放"+ disabled textarea | ⏳ |
| 4 | 滚到 CityPage 屏 03 (Same Second) | 显示 3 栏对比 + 远端 cell | ⏳ |
| 5 | 点击 DistanceNavigation "下一个远方" | 跳转到下一城市 | ⏳ |
| 6 | 硬刷新任意页面 | 0.2s 内 skeleton + Loading 文案 | ⏳ |
| 7 | DevTools → Network → 关闭 throttle | 所有 API 调用 < 500ms | ⏳ |
| 8 | DevTools → Network → 模拟 5xx | 显示 Error 状态 + 重试按钮 | ⏳ |
| 9 | 点击 Footer Privacy | 跳转到 `/privacy` | ⏳ |
| 10 | 任何 URL `?city_id=evil` | 忽略 query 参数 · 无安全影响 | ⏳ |

### 3.2 Console / Network 截图

> **待用户在浏览器执行后粘贴 DevTools 截图**

- [ ] 首页 Loading → API call → render 完整截图
- [ ] CityPage Kyoto 完整截图（4 屏）
- [ ] Echo UI 禁用状态截图
- [ ] Network tab: API 调用时间轴（healthz, cities, cities/kyoto, editions/today）
- [ ] Console: 无 error log

---

## 4. EXIF Privacy 深度验证（独立测试）

### 4.1 测试方法

```bash
# 1. 取一个 seed moment 的 variant URL
MOMENT_URL=$(curl -fsS https://alpha-api-see-earth.vercel.app/v1/cities/kyoto/moments | \
  jq -r '.data[0].image_variants[] | select(.variant == "card_640") | .url')

echo "Testing URL: $MOMENT_URL"

# 2. 下载并检查 EXIF GPS
curl -fsS "$MOMENT_URL" -o /tmp/variant.webp

# 3. 用 exiftool 检查 GPS tag（应为空）
exiftool -GPS:GPSLatitude -GPS:GPSLongitude /tmp/variant.webp
# 预期：empty / "GPSLatitude: (empty)"

# 4. 用 exifr Node 库检查
node -e "
  const exifr = require('exifr');
  exifr.gps('/tmp/variant.webp').then(gps => {
    if (gps === null || gps === undefined) {
      console.log('✅ NO GPS EXIF found');
      process.exit(0);
    } else {
      console.error('❌ GPS EXIF FOUND:', gps);
      process.exit(1);
    }
  });
"
```

### 4.2 预期结果

| 验证项 | 预期 | 状态 |
|---|---|---|
| `card_640` variant 无 GPS EXIF | ✅ | ⏳ |
| `thumb_320` variant 无 GPS EXIF | ✅ | ⏳ |
| `detail_1280` variant 无 GPS EXIF | ✅ | ⏳ |
| `full_2560` variant 无 GPS EXIF | ✅ | ⏳ |
| DateTime EXIF 保留（用于 captured_at） | ✅ | ⏳ |

**Privacy Acceptance Criteria 6**：`公开图片不含 GPS EXIF` · 必须 100% 通过

---

## 5. 失败处理流程

### 5.1 Critical 失败（部署回滚）

如果 smoke test ≥ 3 项 critical 失败：

1. **立即暂停**（Vercel Dashboard → Deployments → 选中 alpha deployment → "Promote to Production" 不点）
2. 检查 Vercel Build logs（找具体错误）
3. 检查 Supabase Dashboard → Logs（SQL query 失败？）
4. 检查 Network 截图（API 4xx/5xx？）
5. 修复后重新触发部署（push 到 alpha branch）
6. 重新跑 smoke test

### 5.2 Privacy Leak 失败（最严重 · 立即响应）

如果 privacy gate 失败（lat/lng 出现在公共 response）：

1. **立即禁用 API endpoint**（Vercel → Project → Settings → Environment → 加 maintenance flag）
2. 检查 `api/src/lib/privacy.ts` 的 `toPublicCity` / `toPublicMoment` 是否被绕过
3. 检查 OpenAPI serializer 是否被错误地使用 raw row
4. 回滚到上一个 known-good deployment
5. 修复后 + 完整 smoke test 通过 + Privacy Leak 100% 修复 → 才重新开放

### 5.3 Rate Limit 失败

如果 rate limit 未触发：

- Phase 1 用 in-memory token bucket（per-instance · 不跨 Vercel instance 共享）
- 警告级别（Phase 2 升级为 Upstash Redis 跨实例共享）
- 不阻塞 Phase 1 验收

---

## 6. 测试报告模板（用户填写）

### 6.1 必填字段

```markdown
## Smoke Test 执行报告

- 执行时间：2026-08-23 HH:MM
- 执行人：<name>
- 测试版本（alpha deploy SHA）：<git-sha>
- 总计：PASS=__  FAIL=__  WARN=__

### Critical 测试（必须全通过）

| 项 | 通过 | 备注 |
|---|---|---|
| /healthz 200 | ☐ | |
| /cities 12 cities | ☐ | |
| /cities NO lat/lng | ☐ | |
| /cities/kyoto timezone | ☐ | |
| /cities/kyoto NO lat/lng | ☐ | |
| /editions/today 12 slots | ☐ | |
| OPTIONS CORS 204 | ☐ | |
| 404 city_not_found | ☐ | |

### Non-Critical 测试

| 项 | 通过 | 备注 |
|---|---|---|
| /cities/kyoto/moments 有数据 | ☐ | |
| Rate limit 触发 | ☐ | |
| Web SPA 200 | ☐ | |
| EXIF GPS 剥离 | ☐ | |

### 失败项详细

（如有 FAIL · 列出 error message + 截图链接）

### 结论

☐ ACCEPTED · Phase 1 验收通过
☐ BLOCKED · 需修复后重测
```

### 6.2 用户上传证据清单

- [ ] `smoke-phase1.sh` 完整输出（terminal capture）
- [ ] Vercel Deployment 日志（前端 + 后端）
- [ ] Supabase Storage bucket 截图
- [ ] DevTools Network tab 截图
- [ ] CityPage Kyoto 截图（4 屏）
- [ ] Echo UI 禁用状态截图
- [ ] EXIF 检查命令输出

---

## 7. Phase 1 不实现（明确排除）

| 项 | Phase | 备注 |
|---|---|---|
| 性能测试（k6 / Artillery） | Phase 2 | Phase 1 验证功能即可 |
| 安全测试（OWASP） | Phase 3 | |
| 视觉回归测试（Percy / Chromatic） | Phase 2 | |
| E2E 浏览器测试（Playwright） | Phase 2 | |
| 移动端响应式测试 | Phase 2 | D-P0-01 已 LOCK 响应式规则 |

---

## 8. Blockers

1. ⏳ 用户部署后执行 smoke test（依赖 `alpha-deployment-evidence-v1.md` Step 1-5）
2. ⏳ PM 评审 smoke test 报告

---

## 9. 元数据

| 字段 | 值 |
|---|---|
| 文档版本 | v1 |
| 创建时间 | 2026-08-22 |
| 创建人 | Engineer Agent (Round 2B) |
| 文档 ID | `smoke-results-v1.md` |
| 目标 Gate | Gate A · Internal Alpha · Phase 1 |
| 决策状态 | ⏳ PENDING（待用户执行） |
| Workspace 路径 | `/Users/lwy/Documents/ChatGPT/看见地球/release-v1/vertical-slice-phase1/smoke-results-v1.md` |
| Obsidian canonical 路径 | `/Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/vertical-slice-phase1/smoke-results-v1.md` |
| Obsidian 同步状态 | ❌ 未同步（sandbox 拒绝写入 Obsidian） |

---

**End of smoke-results-v1.md**