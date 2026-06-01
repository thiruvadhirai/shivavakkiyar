---
id: 0027
title: "BUG: Nakshatra, tithi, and timing calculations returning incorrect values"
status: in_progress
impact: Critical
priority: 010
complexity: "4-6 hours"
assignee: dev
raci:
  responsible: dev
  accountable: tech-lead
  consulted: []
  informed: []
dependencies: []
blocked_by: []
related: [0005, 0006, 0027a]
---

## Progress Summary

**Session Work Completed (June 1, 2026)**:
- ✅ Test framework exists (tests/panchanga-calculator-integration.test.js)
- ✅ Test data created with reference values (tests/integration-test-data.json)
- ✅ Created sub-task 0027a for NOAA sunrise/sunset (blocking issue for ±1 min tolerance)
- ⏳ **Remaining**: Wire tests to actual calculator, identify failing cases, fix bugs

**Current Test Status**:
- Tests exist but have PLACEHOLDERS (echo expected values instead of calling calculator)
- Need to connect to actual `calculatePanchanga()` function
- Tests will reveal which calculations are broken

# Problem Statement

Calculator library returns incorrect values for:
- **Tithi** (lunar day) - wrong timing endpoints
- **Nakshatra** (lunar constellation) - wrong identification or timing
- **Yoga** (auspicious combinations) - incorrect calculations
- **Karana** (half-tithis) - timing misalignment
- **Sunrise/Sunset** timing variations by location
- **Moonsign** and **Sunsign** calculations

**Root Cause**: Astronomical calculations rely on Astronomy Engine API, but calculations may have:
- Incorrect coordinate transformations (ecliptic ↔ equatorial)
- Wrong ayanamsa application (Drik Ayanamsa ~24.14° for 2026)
- Timezone/location handling issues
- Accumulating rounding errors

## Blocking Issue: Sunrise/Sunset Accuracy

**Task 0027a** addresses a critical blocker for this task:
- Integration tests require ±1 minute accuracy for sunrise/sunset
- Astronomy Engine alone produces ~3-4 minute errors
- NOAA atmospheric refraction correction is required
- **Status**: Refraction function implemented, ready to integrate

See task 0027a for details on NOAA implementation.

## Known Test Failures

Reference values from verified panchang sources show systematic discrepancies:

**Test Case 1: Olympia, USA - May 31, 2026**
- Expected Tithi: Pratipada upto 04:07 AM, Jun 01
- Expected Nakshatra: Jyeshtha (full night)
- Expected Yoga: Siddha upto 17:49
- Expected Rahu Kalam: 09:15 to 11:12

**Test Case 2: Tamil Nadu, India - May 31, 2026**
- Expected Tithi: Pournami upto 01:44
- Expected Nakshatra: Anusha upto 03:42
- Expected Yoga: Shiva upto 16:55

## Solution Approach

### Phase 1: Add Integration Tests
- Create test data file with expected vs actual values
- Build integration test suite
- Test all calculations against reference data
- Identify which calculations are wrong

### Phase 2: Fix Calculations
- Debug coordinate transformation issues
- Verify ayanamsa application
- Test with multiple locations and dates
- Ensure timezone handling is correct

### Phase 3: Validate
- All integration tests passing
- E2E tests still passing
- Cross-reference with external panchang sources

## Test Data Format

```json
{
  "location": "Olympia, United States",
  "latitude": 47.0379,
  "longitude": -122.9007,
  "date": "2026-05-31",
  "expected": {
    "tithi": "Pratipada upto 04:07, Jun 01",
    "nakshatra": "Jyeshtha",
    "yoga": "Siddha upto 17:49",
    "sunrise": "05:21",
    "sunset": "20:58",
    "moonsign": "Vrishchika",
    "sunsign": "Vrishabha"
  }
}
```

## Acceptance Criteria

- [x] Integration test suite created with at least 10 test cases
  - ✓ File: `tests/panchanga-calculator-integration.test.js`
  - ✓ Covers: tithi, nakshatra, yoga, karana, sunrise/sunset
  - ⚠️ Tests are placeholders (need wiring to actual calculator)
- [ ] Test cases compare expected vs actual for: tithi, nakshatra, yoga, karana, sunrise, sunset, moonsign, sunsign
  - Ready once tests are wired to calculator functions
- [ ] All tests initially fail (identify bugs)
  - Pending: Run tests to see which calculations fail
- [ ] Bugs fixed until all integration tests pass
  - Pending: Identify root causes and fix calculations
- [ ] E2E tests still passing
  - Pending: Verify no regressions after bug fixes
- [ ] Reference values verified against external sources
  - ✓ Sunrise/sunset verified against NOAA (sub-task 0027a)
  - ⏳ Tithi/nakshatra/yoga need verification against traditional panchang sources

## Files to Modify

- `assets/js/panchanga-calculator.js` - Core calculation logic
- `tests/panchanga-calculator-integration.test.js` - NEW: Integration tests
- `tests/integration-test-data.json` - NEW: Test data with expected values

## Why This Matters

- UI tests (E2E) catch display bugs, not calculation bugs
- Unit tests test functions in isolation
- **Integration tests verify the full pipeline**: Astronomy Engine → Calculations → Correct Results

Without integration tests, calculation errors can slip through and produce wrong panchang data for users.

## References

- **Drik Ayanamsa**: ~24.14° for 2026 (must apply to all ecliptic calculations)
- **Tithi**: 30 tithis per lunar month (360° ÷ 30 = 12°)
- **Nakshatra**: 27 constellations per month (360° ÷ 27 = 13.33°)
- **Yoga**: 27 combinations (sun + moon longitude divided by 13.33°)
- **Karana**: 60 half-tithis (two per tithi)

