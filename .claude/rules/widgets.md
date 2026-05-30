---
description: Widget safety rules and E2E test dependencies
globs: ["_includes/*.html"]
---

# Widget Rules

Full behavioral spec: see `docs/widget-spec.md`

## Null-Safety Contract (CRITICAL)

All panchanga result access MUST use optional chaining:

✅ `p?.tithi?.phase?.toUpperCase?.()`  
❌ `p.tithi.phase.toUpperCase()`

Optional chaining is mandatory—crashes break production.

## E2E Test Selectors (Do NOT rename)

Form IDs:
- `#panchanga-location-input` (full widget)
- `#panchanga-simple-location-input` (simple widget)
- `#panchanga-calculate-btn` / `#panchanga-simple-calculate-btn`

Button text:
- "Calculate Panchanga" (full)
- "Calculate Pradosha Times" (simple)

Result containers: `.result` or `[class*="result"]`

## Before Editing

1. ✅ Every panchanga access uses `?.`?
2. ✅ Form IDs unchanged?
3. ✅ Button text matches E2E tests?
4. ✅ Run: `podman exec saivamcloud-test npm run test:e2e`

If E2E tests fail, the spec was violated.
