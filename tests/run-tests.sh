#!/bin/bash
# Run all test suites (unit, integration, E2E)

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║           🧪 PANCHANGA CALCULATOR - TEST SUITE                ║"
echo "╚════════════════════════════════════════════════════════════════╝"

# Color output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

TESTS_PASSED=0
TESTS_FAILED=0

# ============================================================
# UNIT TESTS
# ============================================================
echo ""
echo -e "${BLUE}📊 Unit Tests (Isolated Components)${NC}"
echo "════════════════════════════════════════════════════════════════"

if node tests/panchanga-calculator.test.js; then
  echo -e "${GREEN}✅ Unit tests PASSED${NC}"
  ((TESTS_PASSED++))
else
  echo -e "${RED}❌ Unit tests FAILED${NC}"
  ((TESTS_FAILED++))
fi

# ============================================================
# INTEGRATION TESTS
# ============================================================
echo ""
echo -e "${BLUE}🧬 Integration Tests (Real Calculations)${NC}"
echo "════════════════════════════════════════════════════════════════"

if node tests/panchanga-calculator-integration.test.js; then
  echo -e "${GREEN}✅ Integration tests PASSED${NC}"
  ((TESTS_PASSED++))
else
  echo -e "${RED}❌ Integration tests FAILED${NC}"
  ((TESTS_FAILED++))
fi

# ============================================================
# E2E TESTS (Browser)
# ============================================================
echo ""
echo -e "${BLUE}🌐 E2E Tests (Browser UI)${NC}"
echo "════════════════════════════════════════════════════════════════"

if command -v npx &> /dev/null && npm list @playwright/test &> /dev/null 2>&1; then
  if TEST_URL="http://localhost:5080" npx playwright test tests/e2e.spec.js --config=tests/playwright.config.js; then
    echo -e "${GREEN}✅ E2E tests PASSED${NC}"
    ((TESTS_PASSED++))
  else
    echo -e "${RED}❌ E2E tests FAILED or SKIPPED${NC}"
    ((TESTS_FAILED++))
  fi
else
  echo -e "${BLUE}⏭️  E2E tests SKIPPED (Playwright not installed)${NC}"
  echo "   Install with: npm install @playwright/test"
  echo "   Or run in container: podman-compose --profile test up saivamcloud-test"
fi

# ============================================================
# SUMMARY
# ============================================================
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                      TEST SUMMARY                              ║"
echo "╚════════════════════════════════════════════════════════════════╝"

TOTAL=$((TESTS_PASSED + TESTS_FAILED))
echo ""
echo "Test Suites: ${TESTS_PASSED} passed, ${TESTS_FAILED} failed, ${TOTAL} total"

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ ALL TESTS PASSED!${NC}"
  exit 0
else
  echo -e "${RED}❌ SOME TESTS FAILED!${NC}"
  exit 1
fi
