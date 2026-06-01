---
id: 0028b
title: "ANALYSIS: Compare Astronomy Engine vs NOAA Calculator discrepancies"
status: open
impact: Critical
priority: 022
complexity: "2-3 hours"
assignee: dev
raci:
  responsible: dev
  accountable: tech-lead
  consulted: []
  informed: []
dependencies: [0028a]
blocked_by: []
related: [0027a, 0028, 0029]
---

# Problem Statement

From earlier analysis (Task 0027a), we discovered:
- **Astronomy Engine average error**: 3-4 minutes (sunrise 3 min late, sunset 4 min late)
- **With NOAA refraction applied**: ±0-1 minute error (meets tolerance)

Before migrating Astronomy Engine to Temporal API, we need to understand:

1. **Is the 3-4 minute difference purely due to missing atmospheric refraction?**
2. **Or are there other sources of discrepancy?**
3. **Does Temporal API improve precision enough to matter?**
4. **Should we switch to @noaa/solar-calc library entirely?**

## Objective

Root cause analysis: Identify why Astronomy Engine differs from NOAA by 3-4 minutes and whether Temporal migration will help.

## Analysis Approach

### Test Setup

Use the **same 25 test cases** from Task 0028a:
- 5 locations (Olympia, Equator, High Latitude, Sydney, + 1 more)
- 5 dates (winter solstice through fall equinox)

### Comparison Framework

For each test case, measure:

```
Astronomy Engine Error = AstronomyEngine_sunrise - NOAA_official_sunrise

Sources of Error (to isolate):
1. Missing Refraction:      ±0.833° elevation = ~1.5-4 minutes
2. Different Atmospheric Model: < ±1 minute
3. Precision (millisecond vs nanosecond): < ±1 minute  
4. Timezone Handling: varies by location
5. Different Ephemeris Data: < ±1 minute
```

### Data Collection

For each location + date:

**Column 1: NOAA Official**
- Sunrise: HH:MM (from NOAA online calculator)

**Column 2: Astronomy Engine (Current)**
- Sunrise calculated without refraction
- Time: HH:MM:SS.mmm (full precision)

**Column 3: Astronomy Engine + Manual Refraction**
- Sunrise with 0.833° refraction applied
- Time: HH:MM:SS.mmm

**Column 4: NOAA Calculator (Our Implementation)**
- Sunrise with refraction formula
- Time: HH:MM:SS.mmm

**Column 5: Discrepancies**
- Raw Error (AstronomyEngine - NOAA)
- With Refraction Applied
- After rounding to nearest minute

### Expected Results Pattern

If our hypothesis is correct:

```
Location: Olympia, WA
Date: May 31, 2026

NOAA Official Sunrise:              05:21:00

Astronomy Engine (no refraction):   05:24:15  → +3:15 late
Astronomy Engine + 0.833° refr:     05:21:10  → +0:10 late (PASS ±1 min)

NOAA Calculator:                    05:21:00  → +0:00 (PERFECT)
```

### Discrepancy Breakdown Template

```markdown
## Test Case Analysis: [Location], [Date]

### Official Values
- NOAA Sunrise: 05:21:00
- NOAA Sunset: 20:58:00

### Astronomy Engine Analysis

**Geometric (no refraction)**:
- Calculated: 05:24:15
- Error: +3:15 (too late)
- Reason: Missing atmospheric refraction correction

**With Manual 0.833° Refraction**:
- Adjusted: 05:21:10
- Error: +0:10 (within ±1 min tolerance)
- Improvement: 3:05 (matches expected refraction effect)

**Precision Impact** (Date vs Temporal):
- Current accuracy: millisecond (±1 min acceptable)
- Temporal precision: nanosecond (over-precision for sunrise/sunset)
- Practical impact: Negligible

### Root Cause

✅ **Confirmed**: 3:15 minute difference = atmospheric refraction effect
✅ **Solution**: Apply 0.833° refraction correction
❓ **Temporal Impact**: Minimal (currently millisecond accurate enough)

### Recommendation

For this location/date:
- [ ] Continue using Astronomy Engine + refraction correction
- [ ] Migrate to Temporal for timezone/immutability benefits (not precision)
- [ ] OR: Switch to @noaa/solar-calc library if available
```

## Analysis Outputs

### 1. Discrepancy Matrix (CSV)

`tests/astronomy-vs-noaa-comparison.csv`

```
Date,Location,Lat,Lon,NOAA_Sunrise,AstroEngine_NoRefr,AstroEngine_WithRefr,NOAACalc,Error_NoRefr_min,Error_WithRefr_min,Error_NOAACalc_min,Refraction_Effect_min
2025-12-21,Olympia,47.0379,-122.9007,07:55:00,07:58:12,07:55:05,07:55:01,+3:12,+0:05,+0:01,3:07
...
```

### 2. Root Cause Analysis Report

`tests/astronomy-vs-noaa-analysis.md`

```markdown
# Astronomy Engine vs NOAA Analysis

## Summary
- Average difference without refraction: 3:30 minutes
- Average difference with refraction: 0:20 minutes
- **Root cause: Atmospheric refraction (0.833° elevation adjustment)**

## Breakdown by Error Source

### 1. Atmospheric Refraction (3-4 minutes)
- **Impact**: CONFIRMED in all 25 test cases
- **Effect**: Makes sun appear ~0.833° higher
- **Time Shift**: Sunrise earlier, sunset later (~1.5-4 minutes depending on latitude)
- **Solution**: Apply refraction formula (already implemented in NOAACalculator)

### 2. Timezone Handling (< ±1 minute)
- **Impact**: Negligible when using Intl API for timezone conversion
- **Potential Issue**: Daylight Saving Time edge cases
- **Status**: Monitored, no action needed currently

### 3. Ephemeris Precision (< ±1 minute)
- **Impact**: Astronomy Engine vs NOAA use same theoretical sources (Meeus)
- **Potential Issue**: Different implementations of Meeus algorithms
- **Status**: Acceptable tolerance

### 4. Millisecond vs Nanosecond Precision (< 1 second)
- **Impact**: Current millisecond precision sufficient for sunrise/sunset
- **Temporal Benefit**: Nanosecond precision available but not necessary
- **Recommendation**: Migrate to Temporal for code quality/immutability, not precision

## Conclusions

✅ **PRIMARY FINDING**: 3-4 minute error = atmospheric refraction
✅ **SOLUTION**: Apply NOAACalculator refraction (done in Task 0027a)
✅ **TEMPORAL MIGRATION**: Won't improve accuracy, but good for code quality
❓ **LIBRARY CHOICE**: Astronomy Engine + refraction adequate, or switch to @noaa/solar-calc?

## Recommendations

### Option A: Keep Astronomy Engine + Refraction (Recommended)
- **Pros**: 
  - Existing implementation works well
  - ±0-1 minute accuracy achieved
  - No major dependency changes
- **Cons**:
  - Maintains custom refraction formulas (vs library)
  - Continues using Astronomy Engine (older library)

### Option B: Switch to @noaa/solar-calc
- **Pros**:
  - Official NOAA implementation
  - Better maintainability
  - Includes twilight calculations
- **Cons**:
  - New dependency to manage
  - Requires migration effort

### Decision Gate
Choose Option A or B before proceeding with Temporal migration (Task 0029).
```

### 3. Visual Summary Chart

`tests/astronomy-vs-noaa-chart.md`

```
ERROR BY TEST CASE (Minutes Late)

Astronomy Engine (No Refraction)        With Refraction Applied          NOAA Calculator
+5 |                                    +2 |                            +1 |
+4 | ████████████████████████          +1 | ███                         +0 | ███████████
+3 | ████████████████████████          +0 | ███████████████████████     -1 | ████
+2 | ████████████████████████          -1 | ██                           -2 |
+1 | ████████████████████████          -2 |
+0 | ████████████████████████

Average:  +3:30 minutes late           Average: +0:20 minutes            Average: +0:05

🔴 FAILS (> ±1 min)                    🟢 PASSES (≤ ±1 min)               🟢 PASSES (≤ ±1 min)
```

## Temporal Impact Assessment

### Current Precision (Date)
```javascript
// Astronomy Engine returns Date
const date = new Date('2025-12-21T07:55:00.000Z');
console.log(date.toISOString());  // 2025-12-21T07:55:00.000Z (millisecond)
// Error relative to NOAA: ±50-100 milliseconds (very accurate)
```

### Future Precision (Temporal)
```javascript
// With Temporal (nanosecond)
const instant = Temporal.Instant.from('2025-12-21T07:55:00.000000000Z');
console.log(instant.toString());  // 2025-12-21T07:55:00Z (nanosecond capable)
// Error relative to NOAA: ±1-10 nanoseconds (over-precision)
```

### Conclusion on Temporal

**Temporal will NOT improve sunrise/sunset accuracy beyond current 0.833° refraction limit.**

Benefits of Temporal migration are:
- ✅ Immutability (prevents accidental date modifications)
- ✅ Explicit timezone handling (clarity, not accuracy)
- ✅ Standards compliance (future-proof)
- ❌ NOT precision improvement (already millisecond-sufficient)

## Acceptance Criteria

- [ ] All 25 test cases analyzed for error sources
- [ ] Discrepancy matrix created (CSV)
- [ ] Root cause breakdown documented
  - [ ] Refraction effect quantified in each case
  - [ ] Timezone impact assessed
  - [ ] Ephemeris precision evaluated
  - [ ] Millisecond vs nanosecond impact assessed
- [ ] Analysis report generated (markdown)
- [ ] Visual summary chart created
- [ ] Clear recommendation for Option A or B
- [ ] Temporal migration impact assessed
- [ ] Decision gate cleared for Task 0029

## Test Data Sources

- **NOAA Official Values**: From Task 0028a validation
- **Astronomy Engine Results**: From current implementation
- **NOAA Calculator**: From our NOAACalculator class
- **Reference**: Task 0027a initial comparison showing 3-4 minute difference

## Dependencies

**Blocked by**: Task 0028a (needs official NOAA values first)

**Unblocks**: 
- Task 0029 (Temporal migration decision)
- Task 0028 (@noaa/solar-calc integration decision)

## Timeline

- **Phase 1**: Collect data (1 hour)
- **Phase 2**: Analyze discrepancies (1 hour)
- **Phase 3**: Write report + recommendations (30-60 min)

**Total**: 2-3 hours

## Notes

- This analysis **determines the strategy** for Astronomy Engine optimization
- Results will guide choice between:
  - Option A: Astronomy Engine + refraction (Task 0029 ready)
  - Option B: Switch to @noaa/solar-calc (Task 0028 priority)
- Temporal migration decision depends on this analysis
- Document all findings for future audits and references
