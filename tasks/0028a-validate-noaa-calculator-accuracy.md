---
id: 0028a
title: "TEST: Validate NOAACalculator accuracy against NOAA official sources"
status: done
impact: Critical
priority: 021
complexity: "2-3 hours"
assignee: dev
raci:
  responsible: dev
  accountable: tech-lead
  consulted: []
  informed: []
dependencies: []
blocked_by: []
related: [0027a, 0028, 0029]
---

# Problem Statement

Before migrating to Temporal API in `astronomy.browser.js`, we need to establish baseline understanding of calculation accuracy.

**Decision Gate**: Only proceed with Temporal migration if NOAACalculator meets ±1 minute tolerance against official NOAA sources.

## Objective

Validate NOAACalculator refraction formulas against three official NOAA sources:
1. NOAA Online Solar Calculator (web interface)
2. NOAA API (weather.gov)
3. NOAA Spreadsheets (Excel/LibreOffice formulas)

## Test Plan

### Test Locations

```
1. Olympia, WA (47.0379°N, -122.9007°W)
   - US location, temperate zone
   - Existing reference data

2. Equator (0°N, 0°W - or nearest major city)
   - Equatorial location
   - Different refraction behavior

3. High Latitude (70°N, 0°E - or nearest major city)
   - Arctic region
   - Maximum refraction effects

4. Southern Hemisphere (-33.8688°S, 151.2093°E - Sydney)
   - Different hemisphere
   - Verify algorithm works at all latitudes
```

### Test Dates

```
1. Winter Solstice (Dec 21, 2025)
2. Spring Equinox (Mar 20, 2026)
3. Summer Solstice (Jun 21, 2026)
4. Fall Equinox (Sep 22, 2026)
5. Random dates: May 31, 2026 (existing test data)
```

Total: 5 locations × 5 dates = 25 test cases

### Comparison Method

For each location + date combination:

**Step 1: Get NOAA Official Values**
- Visit https://gml.noaa.gov/grad/solcalc/
- Enter location and date
- Record: Sunrise time, Sunset time, Solar noon
- Screenshot for documentation

**Step 2: Run NOAACalculator**
```javascript
const noaa = new NOAACalculator();
const result = await noaa.getSunriseWithRefraction(date, lat, lon);
```
- Record: Calculated sunrise, sunset
- Note: Any refraction applied

**Step 3: Calculate Discrepancy**
```
Discrepancy (minutes) = Math.abs(calculated - official) * 60
```

**Step 4: Document**
- If ≤ 1 minute: ✅ PASS
- If > 1 minute: ❌ FAIL (note reason)

## Acceptance Criteria

- [ ] 25 test cases created (5 locations × 5 dates)
- [ ] NOAA official values documented (screenshots + CSV)
- [ ] NOAACalculator tested for all 25 cases
- [ ] Discrepancy report generated
  - [ ] All discrepancies ≤ 1 minute → **GREEN LIGHT for Temporal migration**
  - [ ] Some discrepancies > 1 minute → **ROOT CAUSE ANALYSIS** required
- [ ] Test data stored in `tests/noaa-validation-data.json`
- [ ] Report generated: `tests/noaa-validation-report.md`

## Output Files

### tests/noaa-validation-data.json
```json
{
  "testCases": [
    {
      "date": "2025-12-21",
      "location": "Olympia, WA",
      "latitude": 47.0379,
      "longitude": -122.9007,
      "noaa_official": {
        "sunrise": "07:55",
        "sunset": "16:47",
        "source": "https://gml.noaa.gov/grad/solcalc/"
      },
      "noaa_calculator": {
        "sunrise": "07:55",
        "sunset": "16:47",
        "refraction_applied": 0.833
      },
      "discrepancy_minutes": {
        "sunrise": 0,
        "sunset": 0
      },
      "status": "PASS"
    }
  ],
  "summary": {
    "total_cases": 25,
    "passed": 25,
    "failed": 0,
    "avg_discrepancy_minutes": 0.2,
    "max_discrepancy_minutes": 0.8
  }
}
```

### tests/noaa-validation-report.md
```markdown
# NOAA Calculator Validation Report

**Date**: [generated date]
**Test Cases**: 25 (5 locations × 5 dates)

## Summary
- ✅ All tests passed (discrepancy ≤ 1 minute)
- ⚠️ Average discrepancy: 0.2 minutes
- ⚠️ Maximum discrepancy: 0.8 minutes

## Test Results by Location
### Olympia, WA
[table with all 5 dates]

### Equator
[table with all 5 dates]

... [other locations]

## Conclusion
✅ **NOAACalculator is accurate within ±1 minute tolerance**
✅ **GREEN LIGHT: Proceed with Temporal migration (Task 0029)**
```

## Data Collection Steps

1. **Create test spreadsheet** (Google Sheets or CSV)
   - Columns: Location | Date | NOAA Sunrise | NOAA Sunset | Calculator Sunrise | Calculator Sunset | Discrepancy
   
2. **Manually fetch NOAA values**
   - Use https://gml.noaa.gov/grad/solcalc/
   - Enter each location + date
   - Document sunrise/sunset times
   - Save screenshots as evidence
   
3. **Run NOAACalculator for each case**
   - Use test harness: `tests/noaa-validation-harness.js` (NEW)
   - Record calculated times
   
4. **Generate report**
   - Calculate discrepancies
   - Aggregate statistics
   - Determine PASS/FAIL for each case
   
5. **Publish results**
   - Save to `tests/noaa-validation-data.json`
   - Generate `tests/noaa-validation-report.md`
   - Commit to repository

## Test Harness Script

Create `tests/noaa-validation-harness.js`:

```javascript
/**
 * NOAA Calculator Validation Harness
 * Runs NOAACalculator against test data and compares with official NOAA values
 */

const NOAACalculator = require('../assets/js/noaa-calculator.js');
const fs = require('fs');

const testCases = [
  { date: '2025-12-21', location: 'Olympia, WA', lat: 47.0379, lon: -122.9007 },
  // ... more test cases
];

async function runValidation() {
  const noaa = new NOAACalculator();
  const results = [];

  for (const test of testCases) {
    const date = new Date(test.date);
    const sunrise = await noaa.getSunriseWithRefraction(date, test.lat, test.lon);
    const sunset = await noaa.getSunsetWithRefraction(date, test.lat, test.lon);

    results.push({
      ...test,
      calculated: {
        sunrise: sunrise.date.toLocaleTimeString(),
        sunset: sunset.date.toLocaleTimeString()
      }
    });
  }

  return results;
}

// Run and save
runValidation().then(results => {
  fs.writeFileSync('tests/noaa-validation-results.json', JSON.stringify(results, null, 2));
  console.log('Validation complete. Results saved to noaa-validation-results.json');
});
```

## Decision Gate

**BEFORE proceeding to Temporal migration (Task 0029):**

```
IF (all_discrepancies ≤ 1_minute) {
  ✅ GREEN LIGHT: Proceed with Task 0029 (Temporal migration)
} ELSE IF (discrepancies > 1_minute) {
  ❌ RED LIGHT: 
     1. Run root cause analysis (Task 0028b)
     2. Determine if issue is in:
        - Refraction formula
        - Atmospheric model
        - Precision (Date vs Temporal)
        - Timezone handling
     3. Fix before proceeding
}
```

## References

- **NOAA Solar Calculator**: https://gml.noaa.gov/grad/solcalc/
- **NOAA API**: https://api.weather.gov/
- **Integration Test Data**: tests/integration-test-data.json
- **Current Validation**: Task 0027a results show 3-4 minute difference (without refraction)
- **Expected After Refraction**: Should be ≤ 1 minute

## Notes

- Screenshots of NOAA values are evidence for audit trail
- Store all 25 test cases + official values in JSON for future regression testing
- This validation is a prerequisite for Temporal migration decision
- After migration, re-run this validation to ensure Temporal doesn't introduce precision issues
