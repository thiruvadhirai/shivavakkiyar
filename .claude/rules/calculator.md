---
description: Calculator API contracts and breaking changes
globs: ["assets/js/panchanga-calculator.js", "assets/js/location-manager.js"]
---

# Calculator Rules

Full API spec: see `docs/calculator-spec.md`

## Breaking Changes (Avoid These)

- Changing function return shapes (tithi.phase, nakshatra.name, etc.)
- Changing number ranges (tithi 1-30, nakshatra 1-27, karana 1-60)
- Renaming calculation functions
- Changing cache key names (`panchanga_location`, `panchanga_geocoding_cache`)

Any of these breaks 85+ tests and both widgets.

## Safe Changes

- Adding new calculation functions
- Fixing bugs in calculations
- Optimizing performance (if results unchanged)
- Adding new exports

## Astronomy Engine Functions

✅ Working:
- `Astronomy.Equator(body, date, observer, bool, bool)`
- `Astronomy.SearchRiseSet(body, observer, direction, date, days)`

❌ Broken/unreliable:
- `Astronomy.GeoVector()`
- `Astronomy.EclipticLongitude()` (HelioVector dependency)

Use fallback formulas instead.

## Before Editing

1. Run: `./scripts/feature-workflow.sh test` (85 tests must pass)
2. Don't change return shapes
3. Don't rename cache keys
4. All tests pass before commit
