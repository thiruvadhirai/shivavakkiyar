# Testing Guide - Panchanga Calculator

## Overview

The Panchanga Calculator has three levels of testing:

1. **Unit Tests** — Test isolated calculation functions
2. **Integration Tests** — Test real astronomical calculations with fallbacks
3. **E2E Tests** — Test actual browser UI and user interactions

This guide explains how to run each test suite.

---

## Quick Start

### Run All Tests (Local)

```bash
# Unit + Integration tests (no additional setup)
bash tests/run-tests.sh
```

### Run All Tests in Container (Including E2E)

```bash
# Start dev server
podman-compose up -d

# Run tests in isolated test container
podman-compose --profile test up saivamcloud-test

# View results
open tests/test-results/index.html  # HTML report
```

---

## Test Suites

### 1. Unit Tests (15 tests)

**File:** `tests/panchanga-calculator.test.js`

**What it tests:**
- Drik Ayanamsa calculation
- Tithi (lunar day) boundaries
- Nakshatra (constellation) calculation
- Degree normalization
- Leap year handling
- Month boundary handling

**Run:**
```bash
node tests/panchanga-calculator.test.js
```

**Expected output:**
```
✅ ALL TESTS PASSED!
✓ Passed:     15
✗ Failed:     0
Success Rate: 100.0%
```

**Why use Unit Tests?**
- Fast execution (<1 second)
- Validates algorithm logic
- Uses mocked Astronomy Engine
- Safe to run anywhere (no browser needed)

---

### 2. Integration Tests (70 tests)

**File:** `tests/panchanga-calculator-integration.test.js`

**What it tests:**
- Real Drik Ayanamsa calculation
- Tithi calculation with actual formulas
- Nakshatra calculation with 27 mansions
- Hora (24 planetary hours)
- Rahu Kalam (1.5-hour inauspicious period)
- Sunrise/Sunset approximation formulas
- Moon/Sun longitude with fallbacks
- Pradosha date finding algorithm
- Full Panchanga calculation flow

**Run:**
```bash
node tests/panchanga-calculator-integration.test.js
```

**Expected output:**
```
✅ ALL TESTS PASSED!
✓ Passed:     70
✗ Failed:     0
Success Rate: 100.0%
```

**Why use Integration Tests?**
- Tests actual astronomical formulas
- Validates fallback calculations
- No mocking (real logic path)
- Identifies algorithm issues before browser testing

---

### 3. End-to-End Tests (Browser)

**File:** `tests/e2e.spec.js`

**What it tests:**
- Page loads correctly
- Location input accepts text
- Date picker works
- Calculate button triggers calculation
- Panchanga results display
- Error handling
- Version display
- Console errors
- Responsive design (mobile/tablet/desktop)
- Keyboard accessibility
- Button labels

**Run:**

#### Option A: Local Machine (requires Playwright)

```bash
# Install Playwright (one time)
npm install @playwright/test

# Run tests
TEST_URL=http://localhost:5080 npx playwright test tests/e2e.spec.js
```

#### Option B: Container (no host bloat)

```bash
# Start dev server
podman-compose up -d saivamcloud-dev

# Run tests in isolated container
podman-compose --profile test up saivamcloud-test

# View HTML report
open tests/test-results/index.html
```

**Expected output:**
```
14 passed (2.5s)

Browsers: chromium, firefox, mobile
Screenshots: tests/test-results/screenshots/
HTML Report: tests/test-results/index.html
```

**Why use E2E Tests?**
- Tests real browser behavior
- Validates UI rendering
- Tests user interactions
- Catches browser-specific issues
- Multi-device testing (mobile/tablet/desktop)

---

## Test Architecture

```
tests/
├── panchanga-calculator.test.js
│   └─ 15 unit tests (mocked, <1s)
│
├── panchanga-calculator-integration.test.js
│   └─ 70 integration tests (real formulas, ~2s)
│
├── e2e.spec.js
│   └─ 30+ E2E tests (browser UI, ~5-10s)
│
├── run-tests.sh
│   └─ Script to run all tests sequentially
│
├── playwright.config.js
│   └─ E2E test configuration
│
└── test-results/
    ├── index.html     (HTML report)
    ├── results.json   (JSON results)
    └── screenshots/   (failure screenshots)
```

---

## Container Testing

### Setup

```bash
# Build both dev and test containers
podman-compose build

# Start only dev server
podman-compose up -d saivamcloud-dev

# Verify dev server is running
curl http://localhost:5080/panchanga/
```

### Run E2E Tests in Container

```bash
# Option 1: Run test container once
podman-compose --profile test run saivamcloud-test

# Option 2: Run test container as service
podman-compose --profile test up saivamcloud-test

# View results (from host machine)
cat tests/test-results.json
open tests/test-results/index.html
```

### Why Container Testing?

✓ No npm/Playwright installation on host  
✓ Isolated test environment  
✓ Chrome/Firefox bundled in container  
✓ Reproducible across machines  
✓ CI/CD ready  
✗ Slightly slower (container overhead)

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      jekyll:
        image: saivamcloud-dev
        ports:
          - 5080:4000

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Run Unit Tests
        run: node tests/panchanga-calculator.test.js

      - name: Run Integration Tests
        run: node tests/panchanga-calculator-integration.test.js

      - name: Run E2E Tests
        run: |
          npm install @playwright/test
          TEST_URL=http://localhost:5080 npx playwright test

      - name: Upload Test Report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: test-results
          path: tests/test-results/
```

---

## Troubleshooting

### Unit/Integration Tests Fail

```bash
# Check Node.js version
node --version  # Should be 14+

# Run with verbose output
node tests/panchanga-calculator-integration.test.js 2>&1 | head -50
```

### E2E Tests Timeout

```bash
# Check if dev server is running
curl http://localhost:5080/panchanga/

# Increase timeout in tests
TEST_URL=http://localhost:5080 npx playwright test --timeout=60000
```

### Container Issues

```bash
# Check if containers are running
podman ps

# View container logs
podman logs saivamcloud-dev
podman logs saivamcloud-test

# Rebuild containers
podman-compose down
podman-compose build --no-cache
```

---

## Test Coverage

| Component | Unit | Integration | E2E |
|-----------|------|-------------|-----|
| Ayanamsa Calculation | ✓ | ✓ | ✗ |
| Tithi Calculation | ✓ | ✓ | ✗ |
| Nakshatra Calculation | ✓ | ✓ | ✗ |
| Hora Calculation | ✓ | ✓ | ✗ |
| Rahu Kalam | ✓ | ✓ | ✗ |
| Sunrise/Sunset | ✗ | ✓ | ✗ |
| Moon/Sun Longitude | ✗ | ✓ | ✗ |
| Pradosha Finding | ✗ | ✓ | ✗ |
| Location Input | ✗ | ✗ | ✓ |
| Calculate Button | ✗ | ✗ | ✓ |
| Results Display | ✗ | ✗ | ✓ |
| Error Handling | ✓ | ✓ | ✓ |
| Responsiveness | ✗ | ✗ | ✓ |
| Accessibility | ✗ | ✗ | ✓ |

---

## Performance

| Test Suite | Time | Environment |
|-----------|------|-------------|
| Unit Tests | <1s | Local |
| Integration Tests | ~2s | Local |
| E2E Tests (1 browser) | ~5-10s | Local |
| E2E Tests (3 browsers) | ~15-30s | Local |
| All Tests (Container) | ~30-45s | Container |

---

## Next Steps

1. **Fix UI Bugs:** Run E2E tests to identify rendering issues
2. **Add More E2E Tests:** Test edge cases and error scenarios
3. **CI/CD Pipeline:** Integrate tests into GitHub Actions
4. **Performance Testing:** Add Lighthouse scores
5. **Visual Regression:** Add screenshot comparison tests

---

## References

- [Playwright Documentation](https://playwright.dev/)
- [Podman Compose](https://github.com/containers/podman-compose)
- [Jest Testing Framework](https://jestjs.io/) (if moving to Jest)
- [Test Pyramid](https://martinfowler.com/bliki/TestPyramid.html)
