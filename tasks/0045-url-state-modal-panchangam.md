---
id: 0045
title: URL State Management + Modal UI for Panchangam Calculator
status: open
impact: High
priority: 035
complexity: "3-4 hours"
assignee: Claude
created: 2026-06-06
completed: (pending)
raci:
  responsible: Claude
  accountable: Vairam
  consulted: []
  informed: []
linked_tasks: []
blocked_by: []
related: []
---

# Description

Add URL state management and modal-based location/date picker to the full panchanga calculator (panchangam.md page). Users should be able to:

1. **Share/bookmark calculation results** via URL with location (lat,lon) and date
2. **Use a modal dialog** for changing location and date (cleaner UX than inline expansion)
3. **Auto-calculate on page load** if both location and date are present in URL
4. **Calculate with manual button click** for explicit user action
5. **Maintain browser history** for back/forward navigation through calculation history

This improves the SPA (single-page app) experience and allows users to share specific panchanga calculations.

# Location / Context

- **File**: `_includes/panchanga-widget-full.html` (full widget on panchangam.md)
- **Related files**:
  - `assets/js/location-manager.js` (location handling)
  - `assets/js/panchanga-calculator.js` (calculation logic)
  - `assets/css/panchanga.css` (styling)

**Important**: The simple widget (pradoshakalapooja.md) is NOT included in this task scope — no changes needed there.

# Acceptance Criteria

## Scenario: URL State Persistence
- **Given** user is on panchangam.md page with a previous calculation (location + date)
- **When** user clicks "Change Location/Date" button
- **Then** modal dialog opens with location/date fields pre-populated

## Scenario: Modal Calculation & URL Update
- **Given** modal is open with location and date fields
- **When** user enters/selects a location and date, then clicks "Calculate"
- **Then** (if valid) calculation executes, URL updates to `?date=YYYY-MM-DD&locationid=lat,lon`, browser history is pushed, modal closes, results display

## Scenario: Auto-Calculate on Page Load
- **Given** user visits URL with `?date=YYYY-MM-DD&locationid=lat,lon` params
- **When** page loads
- **Then** fields auto-populate, calculation auto-runs, results display immediately

## Scenario: Cached Location Auto-Load
- **Given** user has previously saved a location (cached in localStorage)
- **When** user visits panchangam.md page without URL params
- **Then** location field auto-populates from cache, but date field is empty (user must select)

## Scenario: Modal Validation
- **Given** modal is open
- **When** user clicks "Calculate" with missing or invalid location/date
- **Then** validation error displays in modal, modal stays open

## Scenario: Browser History Navigation
- **Given** user has made two calculations (location A + location B)
- **When** user clicks browser back button
- **Then** URL reverts to previous calculation, results update to show previous location/date

# Test Plan

1. **Unit Tests**:
   - URL parameter parsing (`?date=...&locationid=...`)
   - Location validation
   - Browser history state management

2. **E2E Tests**:
   - Open modal, select location + date, calculate
   - Verify URL updates correctly
   - Verify results display after modal closes
   - Test browser back/forward navigation
   - Test cached location auto-population

3. **Manual Testing**:
   - Share URL with another user, verify they see same results
   - Bookmark URL, revisit later, verify calculation restores
   - Test on mobile (modal responsive)
   - Test with network latency (loading state during modal)

4. **Run**: `podman exec saivamcloud-test npm run test:e2e`

# Implementation Notes

**URL Format**: `?date=YYYY-MM-DD&locationid=lat,lon`
- Example: `/panchangam/?date=2026-06-06&locationid=13.0827,80.2707`

**Modal Structure**:
- Location input with autocomplete (existing functionality)
- Date input with date picker (existing functionality)
- "Calculate" button (validates both fields)
- Close button (X)

**Key Changes**:
- Replace inline expand/collapse with modal dialog
- Remove individual field change event listeners (no auto-calc on field blur)
- Add modal open/close handlers
- Add URL parsing on page load
- Add `window.history.pushState()` after successful calculation
- Rename button: "Change Location or Show Full Details" → "🔄 Change Location/Date"

**No Changes to**:
- `location-manager.js` (works as-is)
- `panchanga-calculator.js` (works as-is)
- Simple widget (pradoshakalapooja.md)

# Dependencies

None — this is standalone UI/UX improvement.

# Time Estimate

- Design review: 15 min
- HTML/CSS modal implementation: 45 min
- JavaScript state management + URL sync: 60 min
- Testing (unit + E2E): 45 min
- Total: 3-4 hours

# Notes

- Modal must be responsive (mobile-friendly)
- URL state must survive page reload
- Browser back/forward should work seamlessly
- Error handling: show validation errors in modal (not alert boxes)
- Loading state: show spinner during calculation (existing)
