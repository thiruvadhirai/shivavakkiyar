---
id: 0005
title: Panchanga Calculator - Core Implementation
status: done
impact: Critical
priority: P1
complexity: "Already complete"
assignee: Pre-workflow implementation
created: 2026-05-30
linked_tasks: [0001, 0002]
---

# Description

The `PanchangaCalculator` class is the core engine for all Hindu calendar (panchanga) calculations in the application. It provides accurate astronomical calculations using the NASA JPL Astronomy Engine and Drik Ayanamsa system.

**Status**: ✅ Working and stable  
**Location**: `assets/js/panchanga-calculator.js` (22KB)

## Implementation Details

### Core Public Methods

| Method | Purpose | Inputs | Returns |
|--------|---------|--------|---------|
| `init()` | Initialize Astronomy Engine | — | Promise<void> |
| `calculate(date, latitude, longitude)` | Full panchanga for a date/location | Date, number, number | PanchangaResult |
| `getDrikAyanamsa(date)` | Modern precession correction | Date | number |
| `calculateTithi(sunLon, moonLon)` | Lunar day (1-30) | number, number | {num, phase, name} |
| `calculateNakshatra(moonLon)` | Lunar mansion (1-27) | number | {num, name} |
| `calculateYoga(sunLon, moonLon)` | Auspicious combination (1-27) | number, number | {num, name} |
| `calculateKarana(tithiNum)` | Half-tithi (1-60) | number | {num, name} |
| `getSunrise(date, lat, lon)` | Sunrise time | Date, number, number | Date |
| `getSunset(date, lat, lon)` | Sunset time | Date, number, number | Date |
| `calculateRahuKalam(sunrise, sunset, date)` | Inauspicious 90-min window | Date, Date, Date | {start, end} |
| `findNextPradosha(date, lat, lon, count)` | Next Pradosha dates (tithis 23 or 8) | Date, number, number, number | [{date, tithi}...] |

### Return Shape

```javascript
{
  date: Date,
  location: { latitude, longitude, name },
  tithi: { num: 1-30, phase, name },
  nakshatra: { num: 1-27, name },
  yoga: { num: 1-27, name },
  karana: { num: 1-60, name },
  sunrise: Date,
  sunset: Date,
  rahuKalam: { start: Date, end: Date },
  abhijitMuhurta: { start: Date, end: Date },
  nextPradoshas: [{ date, tithi }...],
  error: null | string
}
```

## Key Features

### 1. Drik Ayanamsa System
- Modern precession correction (~24.14° for 2026)
- Accurate for tropical → sidereal conversion
- Based on J2000 epoch (2000-01-01 12:00 UTC)

### 2. Astronomy Engine Integration
- NASA JPL ephemeris data (accurate to seconds)
- Rise/set calculations for sunrise/sunset
- Equatorial coordinate transformations
- Fallback formulas when Astronomy Engine unavailable (±30 min acceptable)

### 3. Timezone Handling
- Longitude-based timezone detection
- DST handling for US regions via Intl API
- Supports worldwide locations
- Converts UTC ↔ local time correctly

### 4. Fallback Calculations
When Astronomy Engine unavailable:
- Sun longitude: Linear motion (~1°/day from J2000)
- Moon longitude: Mean motion (~13°/day)
- Sunrise/Sunset: Declination-based formula
- Accuracy: ±30 minutes (acceptable for panchanga)

## Known Limitations

1. **DST Detection** — Only accurate for US regions (uses Intl API for others)
2. **Polar Regions** — Sunrise/sunset undefined during polar night
3. **Astronomy Engine CDN** — Local copy required (astronomy-engine.com defunct)
4. **Approximate Formulas** — When engine unavailable, accuracy drops to ±30 min

## Breaking Changes (Do NOT Change)

These changes would break 85+ tests and both widgets:

- ❌ `tithi.phase` property (required for display)
- ❌ `nakshatra.name` property (required for display)
- ❌ `karana` numbering (1-60 range)
- ❌ Return object shape
- ❌ Method signatures

## Safe Changes

✅ Adding new calculation methods  
✅ Fixing bugs in calculations  
✅ Optimizing performance (if results unchanged)  
✅ Adding fallback formulas  
✅ Improving documentation  

## Test Coverage

**15 Unit Tests** (`tests/panchanga-calculator.test.js`):
- Core calculations: getDrikAyanamsa, calculateTithi, calculateNakshatra, etc.
- Timezone handling: getTimezoneOffsetFromLongitude
- Date conversions: localToUTC, utcToLocal
- Edge cases: leap years, month boundaries, hemispheres

**70 Integration Tests** (`tests/panchanga-calculator-integration.test.cjs`):
- Known dates: verified against traditional panchang calendars
- Accuracy: sunrise/sunset ±5 minutes
- Fallback formulas: ±30 minutes acceptable
- Worldwide locations: US, India, Australia, etc.

**All 85 tests passing** ✅

## Future Improvements

- [ ] Add Ayanamsa comparison (Drik vs Lahiri vs Chandra)
- [ ] Support for different calendar systems
- [ ] Historical panchang data (1900-2100)
- [ ] Batch calculations for export
- [ ] Performance optimization for multiple dates

## Related Files

- **Widgets**: `_includes/panchanga-widget-full.html`, `_includes/panchanga-widget-simple.html`
- **Tests**: `tests/panchanga-calculator.test.js`, `tests/panchanga-calculator-integration.test.cjs`
- **Specs**: `docs/calculator-spec.md`
- **Rules**: `.claude/rules/calculator.md` (breaking changes enforcement)

## Usage Example

```javascript
const calc = new PanchangaCalculator();
await calc.init();

const result = calc.calculate(
  new Date(2026, 4, 29),  // May 29, 2026
  37.7749,                // San Francisco latitude
  -122.4194               // San Francisco longitude
);

console.log(result.tithi.name);        // "Krishna Chaturdashi"
console.log(result.nakshatra.name);    // "Rohini"
console.log(result.sunrise);           // 5:30 AM PDT
console.log(result.rahuKalam.start);   // 3:00 PM PDT
```

## Maintenance Notes

- Code is stable and well-tested
- Future changes should be minimal (bug fixes only)
- Any new features should be additive (new methods, not modifying existing ones)
- All changes must pass 85+ test suite
- Document changes in CLAUDE.md if they affect API

## Acceptance Criteria

✅ Code working correctly for all 85 tests  
✅ No breaking changes to method signatures  
✅ Return objects maintain current shape  
✅ Timezone handling works worldwide  
✅ Fallback formulas activated when engine unavailable  

---

**This task establishes workflow artifacts for existing code. Future changes to this calculator must:**

1. Start with a new task file (task 000X)
2. Reference this task (0005) as linked task
3. Update acceptance criteria for the specific change
4. Ensure all 85 tests still pass before committing
5. Follow .claude/rules/calculator.md rules
