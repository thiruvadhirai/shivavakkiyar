# Panchanga Widget Behavioral Specification

This document defines the contract that all developers must follow when modifying widget HTML files. Use as the source of truth for widget behavior, DOM structure, and E2E test dependencies.

---

## Null-Safety Contract (CRITICAL)

All panchanga result object access MUST use optional chaining. The calculation may return `undefined` for any field if preconditions aren't met.

### Required Pattern
```javascript
// Always use optional chaining (?.) with function calls
p?.tithi?.phase?.toUpperCase?.()

// Always chain deeply for nested objects
selectedLocation?.latitude
result?.panchanga?.pradosha?.[0]?.date

// Fallback values are recommended
value ?? 'N/A'
value?.toString() ?? '--'
```

### Anti-Pattern (WILL CRASH)
```javascript
// Never assume objects exist
p.tithi.phase.toUpperCase()  // ❌ crashes if tithi is undefined

// Never assume nested properties
selectedLocation.latitude   // ❌ crashes if selectedLocation is undefined

// Never chain without optional chaining
result.panchanga.pradosha[0].date  // ❌ crashes at first undefined
```

### When Null Can Occur

- `selectedLocation` → undefined if user hasn't picked location yet
- `p.tithi` → undefined if calculation failed
- `p.nakshatra` → undefined if calculation failed
- Any panchanga calculation field may be undefined if Astronomy Engine fails

---

## DOM Contract (E2E Test Dependency)

E2E tests locate and interact with elements by ID and text. **Do NOT rename these without updating tests.**

### Form Input IDs (Cannot Rename)

**Full Widget (`panchanga-widget-full.html`):**
- `#panchanga-location-input` — location search textbox
- `#panchanga-date-input` — date picker
- `#panchanga-calculate-btn` — "Calculate Panchanga" button
- `#panchanga-expand-details-btn` — initial expand button

**Simple Widget (`panchanga-widget-simple.html`):**
- `#panchanga-simple-location-input` — location search textbox
- `#panchanga-simple-calculate-btn` — "Calculate Pradosha Times" button
- `#panchanga-expand-location-btn` — initial expand button

### Result Container Classes (E2E Expects These)

- `.result` or `[class*="result"]` — container holding panchanga results
- `.panchanga-error` — error message display
- `.panchanga-spinner` — loading indicator

### Button Text (E2E Clicks by Text)

- "Calculate Panchanga" — full widget calculate button
- "Calculate Pradosha Times" — simple widget calculate button
- "Show Details" — expand button text (if used)
- "Change Location" — location change button (simple widget)

---

## State Machine

Widgets follow a strict state flow:

```
INIT
  ↓
LOCATION_INPUT ← (user clicks "Change Location")
  ↓
CALCULATING (button disabled, spinner showing)
  ↓
RESULTS (display panchanga, allow location change)
  ↓
ERROR (show error message, allow retry)
```

### State Transitions

| From | To | Trigger | UI Change |
|------|----|---------|----|
| INIT | LOCATION_INPUT | Click "Expand" or "Change Location" | Show form |
| LOCATION_INPUT | CALCULATING | Click "Calculate" button | Hide form, show spinner |
| CALCULATING | RESULTS | Success | Hide spinner, show panchanga grid |
| CALCULATING | ERROR | Failure | Hide spinner, show error message |
| RESULTS | LOCATION_INPUT | Click "Change Location" | Hide results, show form |
| ERROR | LOCATION_INPUT | Click "Change Location" | Hide error, show form |

---

## File Dependencies

### Full Widget (`_includes/panchanga-widget-full.html`)

**Required to function:**
- `assets/js/panchanga-calculator.js` — provides `PanchangaCalculator` class
- `assets/js/location-manager.js` — provides `LocationManager` class
- `assets/css/panchanga.css` — styling and layout
- `assets/js/astronomy.browser.js` — NASA JPL ephemeris (optional, fallback available)

**Breaking Change:** Removing any of these files breaks the widget entirely.

### Simple Widget (`_includes/panchanga-widget-simple.html`)

**Required to function:**
- `assets/js/panchanga-calculator.js` — provides `PanchangaCalculator` class
- `assets/js/location-manager.js` — provides `LocationManager` class
- `assets/css/panchanga.css` — styling and layout
- `assets/js/astronomy.browser.js` — NASA JPL ephemeris (optional, fallback available)

**Breaking Change:** Removing any of these files breaks the widget entirely.

---

## Location Input Behavior

### User Flow

1. User types in location input
2. Widget calls `LocationManager.geocodeLocation(query)`
3. Results render as suggestions below input
4. User clicks a suggestion → location selected
5. City/state/country/ZIP support

### Caching

- Recently used locations populate dropdown from `localStorage['panchanga_geocoding_cache']`
- `localStorage['panchanga_location']` stores the selected location (30-day expiry)

### Error Handling

- Network error → show "Unable to search location. Check connection."
- No results → show "No locations found. Try a different query."
- Nominatim rate limit (1 req/sec) → wait and retry (automatic)

---

## Calculate Button Behavior

### Full Widget

1. Require: location selected + date entered
2. Click "Calculate Panchanga"
3. Show spinner, disable button
4. Call `calculator.calculateFullPanchanga(date, lat, lon)`
5. Render all panchanga elements (tithi, nakshatra, yoga, karana, hora, rahu kalam, abhijit muhurta, pradosha)
6. Display sunrise/sunset times
7. Show ayanamsa value

### Simple Widget

1. Require: location selected (no date input, uses today)
2. Click "Calculate Pradosha Times"
3. Show spinner, disable button
4. Call `calculator.findNextPradosha(today, lat, lon)`
5. Display next 3 Pradosha dates in table
6. Allow expandable "Show Details" for full panchanga

---

## Result Display Contract

### Panchanga Element Display

Each panchanga element card must show:
- **Element name** (English + Sanskrit): "तिथि - Tithi (Lunar Day)"
- **Value**: e.g., "Kritika (Krithika)" with number
- **Progress bar** (for tithi/nakshatra): shows completion percentage
- **Additional info**: name in Tamil, degree, phase

### Tithi Display Format

```
Name: Ashwini
Number: 1
Phase: Shukla (Waxing)
Progress: 15% complete
```

### Nakshatra Display Format

```
Name: Ashwini
Tamil: அஶ்வினி
Number: 1
Degree: 12.5°
Progress: 45% complete
```

### Rahu Kalam Display Format

```
Inauspicious Time: 14:30 - 15:20 IST
Duration: 90 minutes
Note: Avoid important activities
```

### Error Message Display

Clear, user-friendly messages:
- "Location not found. Please try again."
- "Unable to calculate. Check your date and location."
- "Network error. Please check your connection."

---

## Version Display

Both widgets should display the version from `site.data.version.version` (Jekyll templating):
```html
<!-- Development only (hidden in production) -->
Version: {{ site.data.version.version }}
```

---

## Accessibility Requirements

- All buttons must have visible text (not icons-only)
- Form inputs must have associated `<label>` tags
- Error messages must be associated with `aria-describedby` on the input
- Loading spinner should use `role="status"` with `aria-live="polite"`
- Progress bars should have `aria-valuenow` and `aria-valuemax`

---

## Before Modifying

When editing widget HTML:

1. **Check null-safety:** Is every panchanga result access guarded with `?.`?
2. **Check form IDs:** Did you rename an input ID? Update E2E tests.
3. **Check button text:** Did you change button labels? Update E2E tests.
4. **Test state flow:** Can user complete the INIT → LOCATION_INPUT → CALCULATING → RESULTS flow?
5. **Test error flow:** Does error message display correctly? Can user retry?
6. **Run E2E tests:** `podman exec saivamcloud-test npm run test:e2e`

---

## Testing This Spec

E2E tests in `tests/e2e.spec.js` validate:
- ✅ Form inputs render correctly
- ✅ Location search works
- ✅ Calculate button triggers calculation
- ✅ Results display without crashing
- ✅ Error messages appear on failure
- ✅ State transitions work correctly
- ✅ No console errors or uncaught exceptions

If E2E tests fail, the spec has been violated.
