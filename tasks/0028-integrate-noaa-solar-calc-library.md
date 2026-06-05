---
id: 0028
title: "FEA: Integrate @noaa/solar-calc library for official NOAA sunrise/sunset"
status: cancelled
impact: High
priority: 020
complexity: "2-3 hours"
assignee: dev
raci:
  responsible: dev
  accountable: tech-lead
  consulted: []
  informed: []
dependencies: []
blocked_by: []
related: [0027a]
---

# Problem Statement

Currently using custom NOAA atmospheric refraction implementation. The official `@noaa/solar-calc` library (hebcal/noaa) provides:
- Validated NOAA sunrise/sunset calculations
- Official atmospheric refraction handling
- Better maintainability (uses proven library vs custom formulas)
- Active upstream maintenance

## Objective

Replace custom `NOAACalculator` refraction implementation with @noaa/solar-calc library.

## Implementation Approach

### Phase 1: Copy Library Locally
- Clone or download @noaa/solar-calc to `assets/js/noaa-solar-calc/`
- Keep it local (no CDN dependency)
- Document version and source

### Phase 2: Create Wrapper
- New class: `NOAALibraryCalculator` wrapping @noaa/solar-calc
- Maintain same API as current `NOAACalculator`
- Support both Temporal and Date (progressive migration)

### Phase 3: Integration Testing
- Run integration tests against library results
- Verify ±1 minute tolerance still met
- Compare with online NOAA calculator

### Phase 4: Migration
- Update `panchanga-calculator.js` to use new wrapper
- Deprecate custom refraction formulas
- Keep for reference (historical documentation)

## Acceptance Criteria

- [ ] @noaa/solar-calc library copied to `assets/js/noaa-solar-calc/`
- [ ] Wrapper class created with compatible API
- [ ] Integration tests pass (±1 minute tolerance)
- [ ] Manual validation against NOAA online calculator
- [ ] Documentation updated with library reference
- [ ] All sunrise/sunset tests use library results
- [ ] Backward compatibility maintained during transition

## Files to Create/Modify

- `assets/js/noaa-solar-calc/` - Library directory (NEW)
- `assets/js/noaa-library-calculator.js` - Wrapper class (NEW)
- `assets/js/panchanga-calculator.js` - Update to use wrapper
- `tests/panchanga-calculator-integration.test.cjs` - Update tests
- `CLAUDE.md` - Document library integration

## References

- **GitHub**: https://github.com/hebcal/noaa
- **NPM**: @noaa/solar-calc
- **NOAA Calculator**: https://gml.noaa.gov/grad/solcalc/
- **Implementation**: Meeus, Astronomical Algorithms

## Notes

- Library handles timezones and DST automatically
- Includes civil/nautical/astronomical twilight calculations
- Can be extended for future enhancements
- Version pinning recommended for reproducibility
