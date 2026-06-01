---
id: 0029
title: "FEA: Progressive migration from Date to Temporal API"
status: open
impact: Medium
priority: 025
complexity: "4-6 hours"
assignee: dev
raci:
  responsible: dev
  accountable: tech-lead
  consulted: []
  informed: []
dependencies: []
blocked_by: []
related: [0005, 0006, 0027]
---

# Problem Statement

JavaScript's `Date` object has limitations for astronomical calculations:
- **Mutable** - Date objects can be accidentally modified
- **Timezone-unaware** - Always operates in UTC internally, no native timezone support
- **Weak precision** - Millisecond granularity insufficient for some calculations
- **Inflexible** - No separation of concerns (date vs time vs timezone)

The **Temporal API** (TC39 standard) solves these issues:
- **Immutable** - Cannot be modified after creation
- **Timezone-aware** - `Temporal.ZonedDateTime` handles timezones explicitly
- **Precise** - Nanosecond granularity available
- **Composable** - Separate types: PlainDate, PlainTime, PlainDateTime, ZonedDateTime

## Objective

Progressively migrate from `Date` to `Temporal` API across the calculator.

## Implementation Approach

### Phase 1: Foundation (panchanga-calculator.js)
Target: Drik Ayanamsa and basic date calculations

```javascript
// Current (Date)
const j2000 = new Date(2000, 0, 1, 12, 0, 0);
const daysSinceJ2000 = (date - j2000) / (1000 * 60 * 60 * 24);

// New (Temporal)
const j2000 = Temporal.Instant.from('2000-01-01T12:00:00Z');
const daysSinceJ2000 = j2000.until(date).days;
```

Changes:
- Replace `new Date()` with `Temporal.PlainDate.from()` or `.ZonedDateTime.from()`
- Update date arithmetic (use `until()`, `add()`, `subtract()`)
- Update getters (`getFullYear()` → `.year`, etc.)

### Phase 2: Astronomy Engine (astronomy.browser.js)
Target: Ephemeris calculations that need precise timestamps

```javascript
// Convert Date parameters to Temporal
const calculate = (date) => {
  const temporal = Temporal.Instant.from(date.toISOString());
  // ... calculations
  return new Date(temporal.toJSON());
};
```

### Phase 3: Location Manager (location-manager.js)
Target: Cache timestamps for expiry tracking

```javascript
// Current
const now = new Date();
const stored = JSON.parse(localStorage.getItem('...'));
const age = now - stored.timestamp;

// New
const now = Temporal.Now.instant();
const stored = Temporal.Instant.from(stored.timestamp);
const age = now.since(stored);
```

### Phase 4: Complete Migration
Target: All date handling throughout codebase

## Compatibility Strategy

**Do NOT break during migration:**

1. **Keep Date support** - Accept both Date and Temporal objects
2. **Convert at boundaries** - Entry points convert Date to Temporal
3. **Return as needed** - Wrap return values for backward compatibility
4. **Test both paths** - Unit tests verify both Date and Temporal work

Example:
```javascript
calculatePanchanga(dateOrTemporal, lat, lon) {
  // Accept both
  const date = dateOrTemporal instanceof Date
    ? Temporal.Instant.from(dateOrTemporal.toISOString())
    : Temporal.ZonedDateTime.from(dateOrTemporal);
  
  // ... calculations with Temporal
  
  // Return Date for backward compat
  return {
    date: new Date(result.toJSON()),
    temporalDate: result  // Also include Temporal result
  };
}
```

## Acceptance Criteria

- [ ] Phase 1: panchanga-calculator.js uses Temporal for date math
  - getDrikAyanamsa() uses Temporal
  - Date arithmetic uses until/add/subtract
  - Tests pass with both Date and Temporal inputs
  
- [ ] Phase 2: astronomy.browser.js compatible with Temporal
  - Accepts Temporal.Instant parameters
  - Maintains precision for ephemeris
  - Tests validate accuracy
  
- [ ] Phase 3: location-manager.js uses Temporal for timestamps
  - Cache expiry uses Temporal.Duration
  - Tests verify expiry logic works
  
- [ ] Phase 4: Complete migration
  - All date operations use Temporal
  - Backward compatibility maintained
  - Performance benchmarks show no regression
  - All tests (unit, integration, E2E) pass

## Files to Modify

**Phase 1**:
- `assets/js/panchanga-calculator.js`
- `assets/js/__tests__/panchanga-calculator.test.js`

**Phase 2**:
- `assets/js/astronomy.browser.js` (if source available)

**Phase 3**:
- `assets/js/location-manager.js`

**Phase 4**:
- Integration test files
- Any other date usage in codebase

## Polyfill Strategy

The Temporal proposal is still in Stage 3 (not yet stable in all browsers).

- **Option 1**: Use `temporal-polyfill` for browser compatibility
- **Option 2**: Use Node.js 18+ with `--enable-temporal` flag
- **Option 3**: Conditional imports (use native if available, polyfill otherwise)

Recommendation: **Node.js native + temporal-polyfill for browsers**

## References

- **Temporal Proposal**: https://tc39.es/proposal-temporal/
- **Temporal Documentation**: https://js-temporal.github.io/temporal/
- **Polyfill**: temporal-polyfill (npm)
- **Champion Group**: TC39 standards body

## Known Challenges

1. **Browser support** - Temporal not in browsers yet (needs polyfill)
2. **String parsing** - ISO 8601 format required for `.from()`
3. **Timezone handling** - More explicit than Date (requires IANA timezone names)
4. **Ecosystem** - Fewer libraries use Temporal yet

## Benefits

After migration, we gain:
- ✅ Immutable date objects (prevents accidental mutations)
- ✅ Explicit timezone handling (no ambiguity)
- ✅ Better precision (nanoseconds vs milliseconds)
- ✅ Cleaner API (`.until()` vs manual math)
- ✅ Standards compliance (official TC39 standard)
- ✅ Future-proof (will be native in all browsers)

## Timeline

- Phase 1: 1-2 hours (foundation)
- Phase 2: 1.5-2 hours (astronomy engine)
- Phase 3: 0.5-1 hour (location manager)
- Phase 4: 1-2 hours (complete + testing)

**Total**: 4-6 hours

## Notes

- This is a **progressive migration** - no "big bang" rewrite
- Backward compatibility maintained throughout
- Can be done incrementally across multiple PRs
- Unit tests validate both Date and Temporal paths
