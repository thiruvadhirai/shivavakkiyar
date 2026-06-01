---
id: 0027
title: "BUG: Nakshatra, tithi, and timing calculations returning incorrect values"
status: open
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
related: [0005, 0006]
---

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

- [ ] Integration test suite created with at least 10 test cases
- [ ] Test cases compare expected vs actual for: tithi, nakshatra, yoga, karana, sunrise, sunset, moonsign, sunsign
- [ ] All tests initially fail (identify bugs)
- [ ] Bugs fixed until all integration tests pass
- [ ] E2E tests still passing
- [ ] Reference values verified against external sources

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

