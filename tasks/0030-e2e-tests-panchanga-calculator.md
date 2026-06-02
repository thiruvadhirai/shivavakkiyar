---
id: 0030
title: "E2E TESTS: Panchanga Calculator validation against Drik Panchang"
status: in_progress
impact: High
priority: 030
complexity: "2-3 hours"
assignee: dev
raci:
  responsible: dev
  accountable: tech-lead
  consulted: []
  informed: []
dependencies: [0029a]
blocked_by: []
related: [0029a, 0028c, 0029b]
---

# E2E Tests: Panchanga Calculator Validation

**Objective**: Verify that the panchanga calculator (http://localhost:5080/panchanga/) produces output that matches Drik Panchang reference values within acceptable tolerances.

**Date Created**: 2026-06-01  
**Status**: Ready for testing  
**Confidence Level**: 99% (based on Task 0029a integration validation)

## Test Strategy

### Reference Data (Nov 2, 2026)

#### Olympia, Washington (47.0379°N, 122.9007°W)

**Drik Panchang Official Values:**
| Component | Value | Notes |
|-----------|-------|-------|
| **Date/Time** | Nov 2, 2026, 15:11:24 local | UTC 23:11:24 |
| **Sunrise** | ~05:21 (±0-1 min) | Refraction-corrected |
| **Sunset** | ~21:00 (±0-1 min) | Refraction-corrected |
| **Tithi** | Dwitiya (2) | Krishna Paksha |
| **Nakshatra** | Jyeshtha (18) | Anuradha area |
| **Yoga** | Specific value | To be verified |
| **Karana** | Derived from tithi | To be verified |
| **Rahu Kalam** | Time window | To be verified |
| **Abhijit Muhurta** | Time window | To be verified |

#### Karur, Tamil Nadu (11.1408°N, 78.1309°E)

**Drik Panchang Official Values:**
| Component | Value | Notes |
|-----------|-------|-------|
| **Date/Time** | Nov 2, 2026, 15:11:24 local | UTC 09:41:24 |
| **Sunrise** | ~05:23 (±0-1 min) | Refraction-corrected |
| **Sunset** | ~19:15 (±0-1 min) | Refraction-corrected |
| **Tithi** | Varies (different UTC) | To be verified |
| **Nakshatra** | Varies | To be verified |

## Test Cases

### TC1: Sunrise/Sunset Times (Olympia)
**Steps:**
1. Open http://localhost:5080/panchanga/
2. Enter location: "Olympia, Washington"
3. Select date: November 2, 2026
4. Click "Calculate Panchanga"

**Expected Results:**
- Sunrise: 05:21 ± 1 minute
- Sunset: 21:00 ± 1 minute (or ~20:59)

**Acceptance Criteria:**
- ✅ Sunrise within [05:20–05:22]
- ✅ Sunset within [20:58–21:01]

**Status**: [To be filled in with test results]

---

### TC2: Tithi Calculation (Olympia)
**Steps:**
1. Same setup as TC1
2. Verify Tithi value displayed

**Expected Results:**
- Tithi: Dwitiya (2), Krishna Paksha
- Or close to transition time (Dwitiya→Tritiya)

**Acceptance Criteria:**
- ✅ Tithi number: 1–3 (within transition window)
- ✅ Paksha: Krishna

**Status**: [To be filled in with test results]

---

### TC3: Nakshatra Calculation (Olympia)
**Steps:**
1. Same setup as TC1
2. Verify Nakshatra value displayed

**Expected Results:**
- Nakshatra: Jyeshtha (18) or nearby (17–19)

**Acceptance Criteria:**
- ✅ Nakshatra number: 17–19
- ✅ Matches Drik Panchang

**Status**: [To be filled in with test results]

---

### TC4: Rahu Kalam (Olympia)
**Steps:**
1. Same setup as TC1
2. Verify Rahu Kalam time window

**Expected Results:**
- Rahu Kalam: Specific time window (±5 min tolerance)

**Acceptance Criteria:**
- ✅ Rahu Kalam start/end within ±5 minutes of Drik Panchang

**Status**: [To be filled in with test results]

---

### TC5: Abhijit Muhurta (Olympia)
**Steps:**
1. Same setup as TC1
2. Verify Abhijit Muhurta time window

**Expected Results:**
- Abhijit Muhurta: ~11:52–12:47 (or calculated window, ±5 min)

**Acceptance Criteria:**
- ✅ Abhijit Muhurta within ±5 minutes of Drik Panchang

**Status**: [To be filled in with test results]

---

### TC6: Sunrise/Sunset Times (Karur)
**Steps:**
1. Clear previous location
2. Enter location: "Karur, Tamil Nadu" (or "Karur, India")
3. Select date: November 2, 2026
4. Click "Calculate Panchanga"

**Expected Results:**
- Sunrise: 05:23 ± 1 minute
- Sunset: 19:15 ± 1 minute

**Acceptance Criteria:**
- ✅ Sunrise within [05:22–05:24]
- ✅ Sunset within [19:14–19:16]

**Status**: [To be filled in with test results]

---

### TC7: Multiple Dates (Olympia)
**Steps:**
1. Test 3 different dates across 2026
   - Solstices: June 21, December 21
   - Equinoxes: March 20, September 22
   - Other: January 15, August 1
2. Verify consistency & expected trends

**Expected Results:**
- Sunrise/sunset times follow seasonal pattern
- Summer: earlier sunrise, later sunset
- Winter: later sunrise, earlier sunset
- Panchanga values consistent with date progression

**Acceptance Criteria:**
- ✅ Seasonal pattern matches expectations
- ✅ No calculation errors or jumps
- ✅ All values reasonable for date

**Status**: [To be filled in with test results]

---

## Acceptance Criteria (All Tests)

**PASS if:**
- ✅ Sunrise/Sunset: ±0–1 minute vs Drik Panchang
- ✅ Tithi: Correct number (exact match or ±1 if at transition)
- ✅ Nakshatra: Correct number (±1 acceptable if at boundary)
- ✅ Yoga, Karana: Correct values
- ✅ Rahu Kalam: ±5 minute tolerance
- ✅ Abhijit Muhurta: ±5 minute tolerance
- ✅ No JavaScript errors in browser console
- ✅ No performance issues (< 2 sec calculation time)

**FAIL if:**
- ❌ Sunrise/Sunset: > 2 minute difference
- ❌ Tithi: Wrong number by > 1
- ❌ Nakshatra: Wrong number by > 1
- ❌ Any JavaScript errors
- ❌ Calculation takes > 5 seconds

## Test Environment

**Dev Server:**
```bash
podman-compose up -d saivamcloud-dev
# Access: http://localhost:5080/panchanga/
```

**Browser:**
- Chrome/Chromium (latest)
- Firefox (latest)
- Test both

**Test Framework:**
- Playwright (if available) or manual E2E
- Record screenshots for each test

**Reference Data Source:**
- Drik Panchang: https://www.drikpanchang.com/panchang/day-panchang.html
- Dataset: tests/365day-kundali-2026.json (embedded reference values)

## Test Results

### Summary
**Date Tested**: [YYYY-MM-DD]  
**Tester**: [Name]  
**Environment**: [Browser + OS]  
**Total Tests**: 7  
**Passed**: [#]  
**Failed**: [#]  
**Success Rate**: [#]%

### Detailed Results

#### Test 1: Sunrise/Sunset Times (Olympia)
- **Status**: [✅ PASS / ❌ FAIL]
- **Sunrise Calculated**: [HH:MM]
- **Sunrise Expected**: 05:21
- **Difference**: [±X min]
- **Sunset Calculated**: [HH:MM]
- **Sunset Expected**: 21:00 (or 20:59)
- **Difference**: [±X min]
- **Notes**: [Any issues or observations]

#### Test 2: Tithi Calculation (Olympia)
- **Status**: [✅ PASS / ❌ FAIL]
- **Tithi Calculated**: [Number & Name]
- **Tithi Expected**: Dwitiya (2), Krishna Paksha
- **Match**: [Yes/No]
- **Notes**: [Any issues or observations]

#### Test 3: Nakshatra Calculation (Olympia)
- **Status**: [✅ PASS / ❌ FAIL]
- **Nakshatra Calculated**: [Number & Name]
- **Nakshatra Expected**: Jyeshtha (18) or nearby
- **Match**: [Yes/No]
- **Notes**: [Any issues or observations]

#### Test 4: Rahu Kalam (Olympia)
- **Status**: [✅ PASS / ❌ FAIL]
- **Rahu Kalam Calculated**: [HH:MM – HH:MM]
- **Rahu Kalam Expected**: [To be checked against Drik]
- **Difference**: [±X min]
- **Notes**: [Any issues or observations]

#### Test 5: Abhijit Muhurta (Olympia)
- **Status**: [✅ PASS / ❌ FAIL]
- **Abhijit Calculated**: [HH:MM – HH:MM]
- **Abhijit Expected**: [To be checked against Drik]
- **Difference**: [±X min]
- **Notes**: [Any issues or observations]

#### Test 6: Sunrise/Sunset Times (Karur)
- **Status**: [✅ PASS / ❌ FAIL]
- **Sunrise Calculated**: [HH:MM]
- **Sunrise Expected**: 05:23
- **Difference**: [±X min]
- **Sunset Calculated**: [HH:MM]
- **Sunset Expected**: 19:15
- **Difference**: [±X min]
- **Notes**: [Any issues or observations]

#### Test 7: Multiple Dates (Olympia)
- **Status**: [✅ PASS / ❌ FAIL]
- **June 21 (Summer Solstice)**: 
  - Sunrise: [HH:MM] (Expected: ~05:15)
  - Sunset: [HH:MM] (Expected: ~21:06)
- **December 21 (Winter Solstice)**:
  - Sunrise: [HH:MM] (Expected: ~07:55)
  - Sunset: [HH:MM] (Expected: ~16:25)
- **Pattern Check**: [Correct seasonal variation? Yes/No]
- **Notes**: [Any issues or observations]

---

## Issues Found

[Document any bugs, unexpected behavior, or discrepancies]

### Issue 1
- **Description**: [What doesn't match]
- **Severity**: [Critical / High / Medium / Low]
- **Reproduction**: [Steps to reproduce]
- **Expected**: [What should happen]
- **Actual**: [What actually happened]
- **Suggestion**: [Potential fix]

---

## Recommendations

[Based on test results, recommend next steps]

1. [Recommendation 1]
2. [Recommendation 2]
3. [Recommendation 3]

---

## Sign-Off

**Tested By**: [Name]  
**Date**: [YYYY-MM-DD]  
**Status**: [✅ APPROVED / ⚠️ CONDITIONAL / ❌ NEEDS WORK]  
**Notes**: [Final notes]

---

## Related Documentation

- Task 0029a: Wire NOAACalculator into PanchangaCalculator
- Task 0028c: 365-day Kundali comparison dataset
- Test files: tests/validate-noaa-integration.cjs, tests/test-refraction-accuracy.cjs
- Reference: tests/KUNDALI_DATASET_SUMMARY.md
