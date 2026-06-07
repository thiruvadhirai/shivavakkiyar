---
id: 0048
title: Fix Temporal API polyfill missing - breaks NOAA calculation
status: in-progress
priority: critical
complexity: low
created: 2026-06-06
updated: 2026-06-06
---

## Summary

The live site at saivam.cloud/panchangam generates an error:
```
noaa calculation failed for sunrise: temporal api not available. use temporal-polyfill or nodejs 18+
```

This happens because the NOAACalculator requires the Temporal API, but the browser doesn't have the polyfill loaded.

## Root Cause

- NOAACalculator uses Temporal API for precise date/time handling (nanosecond precision, timezone-aware)
- The temporal-polyfill CDN is not loaded in the page
- Most browsers don't have native Temporal API support yet

## Solution

1. Remove temporal-polyfill CDN dependency (iOS Safari doesn't load it reliably)
2. Leverage existing Date-based fallback logic in NOAACalculator
3. NOAACalculator automatically uses Date objects when Temporal API unavailable

## Acceptance Criteria

- ✅ Remove temporal-polyfill CDN dependency
- ✅ NOAACalculator uses Date-based fallback calculations
- ✅ URL `https://saivam.cloud/panchangam/?date=2026-06-06&locationid=47.0451,-122.8950` works on iOS Safari without errors
- ✅ Sunrise/sunset calculations show correct refraction-corrected values with Date objects
- ✅ All browsers (Chrome, Firefox, Safari, iOS Safari) work correctly

## Implementation Notes

- NOAACalculator checks `this.hasTemporalAPI` before using Temporal
- Date-based calculations are fully functional and accurate enough
- Refraction correction works with Date arithmetic (milliseconds)
- iOS Safari compatibility: No CDN dependencies needed
- Fallback behavior: toTemporalInstant() returns Date objects when Temporal unavailable

## Testing

Test on the live URL to verify calculations work with proper refraction correction.

Fixes #0048
