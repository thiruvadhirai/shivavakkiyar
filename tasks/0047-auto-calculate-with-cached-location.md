---
id: 0047
title: Auto-calculation Not Triggered with URL Date + Cached Location
status: done
priority: high
complexity: low
created: 2026-06-06
---

# Bug: Auto-calculation Not Triggered with URL Date + Cached Location

## Issue
When visiting panchangam page with URL date parameter (`?date=2026-06-27`) and a cached location from previous visit:
- Panchanga does NOT auto-calculate
- User must manually click "Calculate Panchang" button in modal to see results
- Expected: Should auto-calculate immediately since both date and location are available

## Root Cause
In `autoLoadAndCalculate()` function in PanchangaWidgetFull class:
- Only checks: `if (this.urlDate && this.urlLocationId)`
- Missing case: URL has date + cached location (no locationid in URL)

## Impact
- Poor user experience - requires manual click instead of instant display
- Inconsistent behavior compared to Task 0045 expectations
- URL parameter feature incomplete

## Acceptance Criteria
- [ ] When visiting `?date=YYYY-MM-DD` with cached location, auto-calculate
- [ ] When visiting `?date=YYYY-MM-DD&locationid=lat,lon`, auto-calculate (already works)
- [ ] When visiting with no params and cached location, load location (already works)
- [ ] All existing tests still pass
- [ ] Modal not shown if auto-calculation triggers

## Files Affected
- `assets/js/panchanga-widget-full.js` - Update `autoLoadAndCalculate()` method

## Testing
```bash
1. Clear browser cache/localStorage to reset cached location
2. Visit panchangam with location, get location cached
3. Visit https://saivam.cloud/panchangam/?date=2026-06-27
4. Verify: Panchanga calculates automatically without clicking Calculate button
```

## Notes
- Related to Task 0045: URL State Management feature
- Regression likely introduced during Task 0045 implementation
- Need to handle 3 scenarios in autoLoadAndCalculate:
  1. URL date + URL locationid → auto-calculate
  2. URL date + cached location → auto-calculate (FIX)
  3. No URL params + cached location → load location only
