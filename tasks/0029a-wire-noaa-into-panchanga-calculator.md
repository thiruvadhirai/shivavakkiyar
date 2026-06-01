---
id: 0029a
title: "IMPLEMENT: Wire NOAACalculator refraction into PanchangaCalculator"
status: pending
impact: Critical
priority: 023
complexity: "2-3 hours"
assignee: dev
raci:
  responsible: dev
  accountable: tech-lead
  consulted: []
  informed: []
dependencies: [0028b]
blocked_by: []
related: [0027a, 0028b, 0029b]
---

# Problem Statement

**Decision Gate Cleared**: Task 0028b confirmed using NOAACalculator for refraction-corrected sunrise/sunset times.

**Current State**:
- ✅ NOAACalculator implemented with Temporal API support
- ✅ 80+ integration tests passing (100%)
- ✅ Comparison analysis confirms ±0-1 minute accuracy vs NOAA official (30 test cases across 6 locations)
- ✅ Karur, Tamil Nadu data validated (refraction effect +2.1 min, matches latitude formula)
- ❌ Not yet integrated into PanchangaCalculator

**Objective**: Replace current Astronomy Engine sunrise/sunset calculations with refraction-corrected NOAACalculator results.

---

## Important: Refraction Effect on Tithi Calculations

**Key insight for Indian astrology compatibility:**

Atmospheric refraction (-0.833° elevation) ONLY affects sunrise/sunset timing, NOT tithi calculations:

```
Tithi Calculation:
  Tithi = (Moon Sidereal Longitude - Sun Sidereal Longitude) / 12
  Inputs: Celestial positions (using Ayanamsa for sidereal conversion)
  Impact of refraction: ❌ NONE (uses actual sun/moon positions, not when we see them)

Event Timing Calculations:
  Rahu Kalam: Based on sunrise/sunset times
  Abhijit Muhurta: Based on sun's position timing
  Impact of refraction: ✅ MORE ACCURATE (precise sunrise/sunset times)
```

**Result**: 
- Tithi numbers remain unchanged (no conflict with Hindu calendar method)
- Event timings become more precise (Rahu Kalam, Abhijit Muhurta, ritual scheduling)
- Already using Drik Ayanamsa correctly for sidereal coordinates

This improvement is COMPLEMENTARY to traditional Indian astrology, not a replacement.

---

## Implementation Plan

### Phase 1: Update PanchangaCalculator methods

**File**: `assets/js/panchanga-calculator.js`

#### Step 1: Import NOAACalculator
```javascript
// At top of file
class PanchangaCalculator {
  constructor(astronomyEngine = null) {
    // Existing code...
    this.astronomy = astronomyEngine || (typeof Astronomy !== 'undefined' ? Astronomy : null);
    
    // NEW: Initialize NOAACalculator for refraction-corrected times
    this.noaaCalculator = new NOAACalculator(this.astronomy);
  }
}
```

#### Step 2: Update getSunrise() method
Replace current Astronomy Engine call with NOAACalculator:

**Current**:
```javascript
getSunrise(date, latitude, longitude) {
  // Uses Astronomy Engine geometric time (no refraction)
  const time = this.astronomy.MakeTime(date);
  const observer = new this.astronomy.Observer(latitude, longitude, 0);
  const event = this.astronomy.SearchRiseSet(this.astronomy.Sun, observer, 1, time, 1);
  return event ? new Date(event.date) : null;
}
```

**New**:
```javascript
async getSunrise(date, latitude, longitude) {
  // Use NOAACalculator for refraction-corrected time
  const result = await this.noaaCalculator.getSunriseWithRefraction(
    date, 
    latitude, 
    longitude
  );
  
  // Return Date for backward compatibility
  return result ? result.date : null;
}
```

#### Step 3: Update getSunset() method
Apply same pattern as getSunrise:

```javascript
async getSunset(date, latitude, longitude) {
  const result = await this.noaaCalculator.getSunsetWithRefraction(
    date,
    latitude,
    longitude
  );
  
  return result ? result.date : null;
}
```

#### Step 4: Handle async/await changes

**Issue**: `getSunrise()` and `getSunset()` now return Promises

**Solution**: Update all calling code to use async/await:

Files affected:
- `assets/js/panchanga-calculator.js` - findNextPradosha() method
- `assets/js/location-manager.js` - any calls to sunrise/sunset
- Test files that call these methods
- Widget HTML (if calling directly)

#### Step 5: Update findNextPradosha() method

**Current**:
```javascript
findNextPradosha(date, latitude, longitude) {
  const sunrise = this.getSunrise(date, latitude, longitude);
  const sunset = this.getSunset(date, latitude, longitude);
  // ... calculation logic
}
```

**New**:
```javascript
async findNextPradosha(date, latitude, longitude) {
  const sunrise = await this.getSunrise(date, latitude, longitude);
  const sunset = await this.getSunset(date, latitude, longitude);
  // ... calculation logic (unchanged)
  return results; // Same structure as before
}
```

#### Step 6: Update calculate() method

If `calculate()` calls sunrise/sunset:
```javascript
async calculate(date, latitude, longitude) {
  // ... existing code
  const sunrise = await this.getSunrise(date, latitude, longitude);
  const sunset = await this.getSunset(date, latitude, longitude);
  // ... rest of calculation
}
```

### Phase 2: Update integration tests

**File**: `tests/panchanga-calculator-integration.test.cjs`

Update test functions that call getSunrise/getSunset:

**Example**:
```javascript
// OLD
const sunrise = calculator.getSunrise(date, lat, lon);
this.assert(sunrise !== null, 'Sunrise calculated');

// NEW
const sunrise = await calculator.getSunrise(date, lat, lon);
this.assert(sunrise !== null, 'Sunrise calculated');
```

Affected test functions:
- `testSunriseCalculation()`
- `testSunsetCalculation()`
- `testRahuKalaam()`
- `testFindNextPradosha()`

### Phase 3: Widget integration

**File**: `_includes/panchanga-widget-full.html` and `panchanga-widget-simple.html`

Update JavaScript event handlers:

**Current**:
```javascript
calculateBtn.addEventListener('click', () => {
  const panchanga = calculator.calculate(date, lat, lon);
  // display results
});
```

**New**:
```javascript
calculateBtn.addEventListener('click', async () => {
  const panchanga = await calculator.calculate(date, lat, lon);
  // display results
});
```

---

## Acceptance Criteria

- [ ] NOAACalculator imported into PanchangaCalculator
- [ ] getSunrise() updated to use NOAACalculator.getSunriseWithRefraction()
- [ ] getSunset() updated to use NOAACalculator.getSunsetWithRefraction()
- [ ] All calls to sunrise/sunset use async/await
- [ ] findNextPradosha() converted to async function
- [ ] Integration tests updated for async/await
- [ ] All 80+ integration tests passing
- [ ] Widget forms updated for async button handlers
- [ ] Manual testing:
  - [ ] Sunrise/sunset times show within ±1 minute of NOAA official
  - [ ] Pradosha dates calculated correctly with refracted times
  - [ ] Works with both northern and southern hemisphere locations
- [ ] Backward compatibility maintained (returns Date objects)

---

## Testing Strategy

### Unit Tests
```javascript
// Before: compare against mock values
// After: compare against NOAA official values within ±1 minute

testSunriseWithRefraction() {
  const date = new Date(2026, 4, 31); // May 31, 2026
  const lat = 47.0379; // Olympia, WA
  const lon = -122.9007;
  
  // NOAA official for Olympia on May 31: 05:21 sunrise
  const result = await calculator.getSunrise(date, lat, lon);
  const minutes = (result.getHours() * 60) + result.getMinutes();
  
  // Should be within ±1 minute of 05:21 (321 minutes)
  const diff = Math.abs(minutes - 321);
  this.assert(diff <= 1, `Sunrise within ±1 min: ${diff} min error`);
}
```

### Integration Tests
- Run all 25 location/date combinations from comparison analysis
- Verify sunrise/sunset within ±1 minute of NOAA official
- Document any outliers (if > ±1 minute)

### Manual Testing
1. Start dev container: `podman-compose up`
2. Navigate to http://localhost:5080/panchanga/
3. Enter location (Olympia, WA)
4. Select date (May 31, 2026)
5. Click "Calculate Panchanga"
6. Verify sunrise ≈ 05:21 (±1 minute tolerance)
7. Verify sunset ≈ 20:58 (±1 minute tolerance)
8. Test 2-3 other locations

---

## Error Handling

### Async Errors
If NOAACalculator.getSunrise/Sunset() throws:
```javascript
async getSunrise(date, latitude, longitude) {
  try {
    const result = await this.noaaCalculator.getSunriseWithRefraction(
      date, latitude, longitude
    );
    return result ? result.date : null;
  } catch (error) {
    console.error('Sunrise calculation failed:', error);
    // Fall back to approximate calculation
    return this.getApproximateSunrise(date, latitude, longitude);
  }
}
```

### Null Handling
Ensure widgets handle null results gracefully:
```javascript
if (sunrise && sunset) {
  // Display times
} else {
  // Show error message (e.g., "Sunrise/sunset not calculable for this location")
}
```

---

## Files Modified

1. `assets/js/panchanga-calculator.js` - Main integration
2. `assets/js/noaa-calculator.js` - No changes (already complete)
3. `tests/panchanga-calculator-integration.test.cjs` - Update async tests
4. `_includes/panchanga-widget-full.html` - Update async handlers
5. `_includes/panchanga-widget-simple.html` - Update async handlers
6. `assets/js/location-manager.js` - If it calls sunrise/sunset (check)

---

## Performance Implications

**Async Calculation Impact**:
- NOAACalculator.getSunrise/Sunset() is async (uses Temporal API)
- Adds ~10-50ms per calculation (negligible for user experience)
- Widget remains responsive (no blocking)

**Optimization Opportunity** (post-implementation):
- Cache sunrise/sunset for same location/date
- Batch calculate multiple dates at once
- Use Temporal.Duration for recurring calculations

---

## Validation

After implementation, verify against known dates:

| Location | Date | NOAA Official | Calc Result | Error | Status |
|---|---|---|---|---|---|
| Olympia, WA | May 31, 2026 | 05:21 | TBD | ? | ⏳ |
| Equator | Jun 21, 2026 | 06:27 | TBD | ? | ⏳ |
| Sydney, AU | Dec 21, 2025 | 04:50 | TBD | ? | ⏳ |
| Tromsø, NO | Mar 20, 2026 | 05:48 | TBD | ? | ⏳ |
| Bangalore, IN | Sep 22, 2026 | 06:08 | TBD | ? | ⏳ |

Expected: All within ±1 minute

---

## Acceptance Signoff

**Ready to merge when**:
- ✅ All 80+ integration tests passing
- ✅ Manual testing confirms ±0-1 minute accuracy
- ✅ No console errors in widget
- ✅ Backward compatibility verified (Date objects returned)
- ✅ Async/await patterns consistent throughout

---

## Related Tasks

- **Task 0027a** - Initial refraction implementation ✅
- **Task 0028b** - Decision gate comparison ✅ COMPLETED
- **Task 0029b** - Complete Temporal migration (after this)
- **Task 0031** - Optimize caching performance (future)

---

## Notes

- This task is the first step of Task 0029 (complete Temporal migration)
- We're not migrating entire codebase to async yet - just sunrise/sunset methods
- Full async/await migration for Temporal happens in Task 0029b
- Maintain Date return type for backward compatibility with existing code
- Temporal API support is available but optional at this stage

---

## Testing Timeline

1. **Implementation**: ~1-2 hours
2. **Testing**: ~30-60 minutes
3. **Documentation**: ~15 minutes
4. **Total**: 2-3 hours

See `.claude/rules/testing.md` for container test execution.
