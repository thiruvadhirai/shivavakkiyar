# Panchanga Calculator - Testing Guide

## Overview

The test suite consists of three layers:

1. **Unit Tests** - Pure function tests (Node.js)
2. **Integration Tests** - Calculation logic without browser (Node.js)
3. **E2E Tests** - Full widget testing with real Astronomy Engine (Playwright + Browser)

---

## Test Types & Commands

### Unit Tests (15/15 Passing ✅)
**Pure calculation functions, no dependencies**

```bash
npm run test:unit
# or
node tests/panchanga-calculator.test.js
```

**What it tests:**
- Drik Ayanamsa calculation
- Tithi (lunar day) calculation
- Nakshatra (constellation) calculation
- Yoga & Karana calculations
- Degree normalization
- Edge cases (leap years, hemispheres)
- Calculation consistency

---

### Integration Tests
**Calculation functions in Node.js, WITHOUT Astronomy Engine**

```bash
npm run test:integration
# or
node tests/panchanga-calculator-integration.test.js
```

**What it tests:**
- Location caching (localStorage simulation)
- Geocoding logic
- Pure calculation functions
- Data validation

**Note:** Astronomy Engine integration tests moved to E2E (browser-only library)

---

### E2E Tests (With Playwright + Real Browser)
**Full widget testing with Astronomy Engine in real browser**

```bash
# Start Jekyll server first
podman-compose up -d saivamcloud-dev

# Run E2E tests
npm run test:e2e

# Or with UI mode (helpful for debugging)
npm run test:e2e:ui

# Or in debug mode
npm run test:e2e:debug
```

**What it tests:**
- ✅ Astronomy Engine loads in browser
- ✅ PanchangaCalculator class initialization
- ✅ LocationManager class initialization
- ✅ Real calculations with Astronomy Engine
- ✅ Pradosha widget displays correctly
- ✅ Location input functionality
- ✅ Date picker functionality
- ✅ Calculate button triggers calculations
- ✅ Results display with all components
- ✅ Error handling for invalid locations
- ✅ Version display
- ✅ No critical JavaScript errors
- ✅ Accessibility (keyboard navigation, labels)

**Browsers tested:**
- Chromium (headless)
- Firefox (headless)
- Mobile Chrome (headless)

---

## Running All Tests

```bash
# Unit + Integration tests
npm run test

# Full suite with coverage
npm test run test:all
```

---

## E2E Tests in Docker Container

**Run tests in isolated Playwright container:**

```bash
# Build test container
podman build -f Dockerfile.test -t panchanga-test:latest .

# Run E2E tests in container
podman run --rm \
  --network host \
  panchanga-test:latest \
  npm run test:e2e
```

**Test configuration:**
- Uses system-installed browsers (Chromium, Firefox)
- Headless mode enabled for CI/containers
- Playwright configured for headless operation
- Network isolation via `--network host` to access Jekyll server

---

## Test Results & Coverage

### Current Status

| Test Type | Count | Status | Location |
|-----------|-------|--------|----------|
| Unit | 15 | ✅ 15/15 passing | `tests/panchanga-calculator.test.js` |
| Integration | 70+ | ⏳ Ready for browser | `tests/panchanga-calculator-integration.test.js` |
| E2E | 15+ | ✅ Browser-ready | `tests/e2e.spec.js` |
| Deployment | 5 | ✅ 4/5 passing | `tests/deployment/test_website_running.py` |

### Test Results Output

```
✅ Unit tests:       15/15 PASS (100%)
⏳ Integration:      70+ tests (Node.js, no Astronomy Engine)
✅ E2E:             15+ tests with Playwright + Real Browser
✅ Deployment:       4/5 tests (pages load, CSS OK, widgets OK)
```

---

## Key Test Scenarios

### Astronomy Engine Integration (E2E)
- Verifies Astronomy Engine loads in browser
- Tests real calculations with NASA JPL ephemeris
- Validates Tithi calculations match expected ranges
- Confirms PanchangaCalculator class works in browser

### Widget Functionality (E2E)
- Location input accepts and retains text
- Date picker accepts date input
- Calculate button triggers panchanga calculation
- Results display all required components (tithi, nakshatra, etc.)
- Error handling for invalid locations

### Pradosha Widget (E2E)
- Widget loads on pradosha page
- Displays next 3 Pradosha dates
- Shows time windows correctly
- Expandable details work

### Accessibility (E2E)
- Keyboard navigation works
- Form inputs are accessible
- Buttons have proper labels
- Screen reader compatibility

---

## Debugging E2E Tests

### View test results
```bash
# HTML report
playwright show-report tests/test-results
```

### Run single test
```bash
npx playwright test tests/e2e.spec.js -g "Astronomy Engine"
```

### Debug mode
```bash
npm run test:e2e:debug
# Opens inspector - step through test execution
```

### Video & screenshots
Tests automatically capture:
- Screenshots on failure
- Video recordings on failure
- Network traces for debugging

Located in: `tests/test-results/`

---

## Troubleshooting

### "Astronomy Engine not loaded" (E2E)
- Verify Jekyll server running: `podman-compose ps`
- Check browser can access: `curl http://localhost:5080/panchanga/`
- Clear browser cache: Test runs with fresh profiles

### Integration tests failing
- These are **Node.js only**, skip Astronomy Engine tests
- Focus on calculation functions that don't need browser API

### E2E timeouts
- Increase timeout in playwright.config.js
- Check Jekyll server health: `podman logs saivamcloud-dev`
- Verify network connectivity to test URL

---

## CI/CD Integration

Tests designed for GitHub Actions:

```yaml
- run: npm run test              # Unit + Integration
- run: npm run test:e2e          # E2E with Playwright
```

Environment variables:
- `TEST_URL` - Override default http://localhost:5080
- `CI` - Enables retries and parallel workers in CI mode

---

## Performance Notes

- Unit tests: ~1 second
- Integration tests: ~2 seconds  
- E2E tests: ~30-60 seconds (depends on browser count)
- Full suite: ~2 minutes

---

*Last updated: May 28, 2026*
