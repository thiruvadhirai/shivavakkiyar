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

1. Add temporal-polyfill CDN to `_layouts/default.html`
2. Load synchronously (no defer) to ensure it's available before other scripts
3. Add graceful fallback in NOAACalculator if Temporal is still unavailable

## Acceptance Criteria

- ✅ Temporal-polyfill CDN link added to layout
- ✅ Polyfill loads before NOAACalculator and Astronomy Engine
- ✅ URL `https://saivam.cloud/panchangam/?date=2026-06-06&locationid=47.0451,-122.8950` works without errors
- ✅ Sunrise/sunset calculations show correct refraction-corrected values
- ✅ NOAACalculator provides fallback warning if Temporal unavailable

## Implementation Notes

- Temporal polyfill version: 0.2.5 from cdn.jsdelivr.net
- Load order: Temporal polyfill → Astronomy Engine → NOAA Calculator
- Backward compatibility: NOAACalculator can fall back to Date objects if needed

## Testing

Test on the live URL to verify calculations work with proper refraction correction.

Fixes #0048
