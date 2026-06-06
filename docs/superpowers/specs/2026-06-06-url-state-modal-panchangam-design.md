---
title: URL State Management + Modal UI for Panchangam Calculator
date: 2026-06-06
status: approved
relates_to: Task 0045
---

# Design Specification: URL State Management + Modal UI for Panchangam

## Executive Summary

Add URL state management and modal-based location/date picker to the full panchanga calculator (panchangam.md). Users will be able to share/bookmark calculation results via URLs, use a cleaner modal dialog for input, and experience automatic calculations on page load.

**Scope**: panchanga.md (full widget) only. Simple widget (pradoshakalapooja.md) is unchanged.

---

## 1. URL State Management

### URL Format
```
/panchangam/?date=YYYY-MM-DD&locationid=lat,lon
Example: /panchangam/?date=2026-06-06&locationid=13.0827,80.2707
```

**Design Decision**: lat/lon format (not OSM ID or hash) because:
- Stateless (no cache lookup required)
- Coordinates are the source of truth for calculations
- Survives cache clearing
- Cross-page navigation works via localStorage fallback

### URL Updates
- Only updates when user clicks Calculate button in modal
- Uses `window.history.pushState()` to add to browser history
- Enables browser back/forward navigation through calculation history

---

## 2. Modal Dialog UI

### Current State (Collapsed View)
- Shows next 3 Pradosha dates (collapsible)
- Button: "Change Location or Show Full Details" → rename to "🔄 Change Location/Date"

### Modal Structure
**When user clicks "Change Location/Date" button:**

```
┌─────────────────────────────────────┐
│  📍 Change Location / Date          │  [X]
├─────────────────────────────────────┤
│  Location:                          │
│  [________________________]          │
│  (with autocomplete suggestions)    │
│                                     │
│  Date:                              │
│  [2026-06-06] (date picker)        │
│                                     │
│  [Calculate] [Close]               │
└─────────────────────────────────────┘
```

**Modal Behavior:**
- Opens when user clicks button
- Location input has autocomplete (existing functionality)
- Date input has date picker (existing functionality)
- Calculate button validates both fields and triggers calculation
- Close button (X) closes without calculating

---

## 3. Auto-Calculation Logic

**Trigger Condition**: Calculate when **both** location AND date are valid

**Update Events**:
- Date field: `change` event (fires on date picker selection OR after manual entry + blur)
- Location field: Autocomplete selection (user clicks suggestion)

**No Events**: 
- ❌ No blur event on location (user might still be typing)
- ❌ No input event on date (fires too frequently)
- ❌ No keystroke events (premature calculations)

**Button Behavior**:
- Kept visible (not obsolete) for explicit user action
- User can click to force recalculation if needed
- Styled secondary/less prominent

---

## 4. Page Load Behavior

### Scenario A: URL has both date + locationid
```javascript
Parse URL (?date=2026-06-06&locationid=13.0827,80.2707)
  ↓
Auto-populate fields
  ↓
Auto-calculate
  ↓
Show results (collapsed view visible)
```

### Scenario B: Cached location exists, no URL params
```javascript
Load from localStorage (panchanga_location)
  ↓
Auto-populate location field
  ↓
Date field empty (user must select)
  ↓
Show collapsed view (waiting for date)
```

### Scenario C: No URL, no cache
```javascript
Show empty collapsed view
  ↓
User clicks "Change Location/Date"
  ↓
Modal opens
```

---

## 5. Modal Button Naming

**Change**: 
- Old: "Change Location or Show Full Details"
- New: "🔄 Change Location/Date"

**Rationale**: Clearer, shorter, emoji for visual consistency

---

## 6. Browser History Management

**Current Behavior**: No history tracking

**New Behavior**: 
- Each calculation adds to browser history via `window.history.pushState()`
- User can click browser back button to restore previous location/date
- URL changes as user navigates history

**Example**:
```
1. Calculate Chennai, June 6 → URL: ?date=2026-06-06&locationid=13.08,80.27
2. Calculate Delhi, June 10 → URL: ?date=2026-06-10&locationid=28.61,77.23
3. User clicks back → URL: ?date=2026-06-06&locationid=13.08,80.27 (results restore)
4. User clicks back → URL: empty (no calculation state)
```

---

## 7. Cross-Page Behavior

**panchanga.md (full widget)**: Modal + URL state management (THIS FEATURE)

**pradoshakalapooja.md (simple widget)**: 
- No URL state management
- Uses cached location fallback
- No changes required
- User can navigate between pages; cached location persists

**Why separate**?
- Full widget: Users do detailed calculations they'd want to share
- Simple widget: Users just browse Pradosha dates (no need for shareable links)

---

## 8. Implementation Approach

### No Breaking Changes
- LocationManager API unchanged
- PanchangaCalculator API unchanged
- Cache key names unchanged (`panchanga_location`, `panchanga_geocoding_cache`)
- All existing tests still pass

### HTML Changes
- Replace "Change Location or Show Full Details" button text
- Add modal dialog markup (overlay + centered dialog)
- Modal contains location + date inputs + Calculate button

### JavaScript Changes
- Add URL parsing on page load (`new URLSearchParams(window.location.search)`)
- Add modal open/close event handlers
- Add form validation on Calculate button click
- Add `window.history.pushState()` after successful calculation
- Remove all individual field change listeners (no more blur/input handlers)
- Update Calculate button logic to be in modal context

### CSS Changes
- Modal styling (overlay, centered dialog, responsive)
- Modal animations (fade in/out)
- Responsive on mobile

### No Changes to
- `location-manager.js` (works as-is)
- `panchanga-calculator.js` (works as-is)
- `pradoshakalapooja.md` (simple widget stays unchanged)
- Testing framework (existing tests unaffected)

---

## 9. Error Handling

### Validation Errors
- Location input empty → Show: "Please enter a location or use Auto-Detect"
- Location not found → Show: "Location not found. Please try again."
- Date not selected → Show: "Please select a date"
- All errors display **in modal**, not alert boxes

### Calculation Errors
- Astronomy Engine failure → Show: "Calculation failed: [error message]"
- Timezone detection failure → Show: "Unable to determine timezone for this location"

---

## 10. Testing Strategy

### Unit Tests
- URL parameter parsing
- Location validation
- Form validation

### E2E Tests
- Open modal, select location + date, click Calculate
- Verify URL updates correctly
- Verify results display after modal closes
- Verify modal closes on successful calculation
- Test browser back/forward navigation
- Test cached location auto-population
- Test with various locations (different hemispheres, poles)
- Test with invalid coordinates

### Manual Testing
- Share URL with another user → verify they see same results
- Bookmark URL → revisit later → verify calculation restores
- Test on mobile (responsive modal)
- Test with network latency (loading spinner during modal)

---

## 11. Success Criteria (Acceptance)

✅ Modal dialog appears when user clicks "Change Location/Date"  
✅ Modal contains location input (with autocomplete) and date input  
✅ Calculate button validates both fields before proceeding  
✅ Calculation updates URL with `?date=...&locationid=...`  
✅ Modal closes on successful calculation  
✅ Results display below in collapsed view  
✅ Browser back button restores previous calculation state  
✅ Page load with URL params auto-populates and auto-calculates  
✅ Cached location auto-loads when no URL params present  
✅ All E2E tests pass  
✅ No console errors  
✅ Modal is responsive on mobile  
✅ Simple widget (pradoshakalapooja.md) unchanged  

---

## 12. Design Decisions & Rationale

| Decision | Why |
|----------|-----|
| **Modal vs inline expand** | Cleaner separation of input/results phases; clearer UX |
| **lat,lon in URL (not hash)** | Stateless; no cache lookup; survives cache clearing |
| **Button not removed** | Explicit user action available if needed; familiar pattern |
| **Calculate on validation** | Simple logic; no premature calculations; predictable |
| **Browser history via pushState** | Native browser support; back/forward works naturally |
| **Simple widget unchanged** | Pragmatic: different use cases don't need URL sharing |

---

## 13. Known Limitations & Future Work

- URL length increases with long location names → use lat,lon instead
- Nominatim API has 1 req/sec rate limit → caching handles this
- Browser history not persisted across sessions → acceptable (localStorage handles restoration)

---

## 14. References

- [Calculator Rules](../../../.claude/rules/calculator.md)
- [Widget Spec](../widget-spec.md)
- [WORKFLOW.md - Three-Phase Development](../../../.claude/WORKFLOW.md)
- [Task 0045](../../../tasks/0045-url-state-modal-panchangam.md)

---

**Design approved by**: User (June 6, 2026)  
**Status**: Ready for implementation planning
