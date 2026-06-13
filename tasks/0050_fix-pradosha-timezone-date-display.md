---
id: 0050
title: Fix Pradosha page timezone date display and URL state
status: todo
priority: high
impact: Users see incorrect Pradosha dates (off by 1 day in different timezones)
complexity: medium
raci:
  accountable: claude
  responsible: claude
  consulted: []
  informed: [user]
blocked_by: []
---

## Problem

Pradosha dates on `/pradoshakalapooja/` display in browser's local timezone, not the selected location's timezone.

**Example**: Dubai (UTC+4) shows "2026-06-13 (GMT+4, UTC+4)" as page date, but "Next Pradosha Dates" lists "2026-06-12" (which is the UTC date, not Dubai date).

**Root Cause**: Pradosha calculations return UTC dates. When displayed, dates aren't converted to location's timezone.

## Requirements

### 1. Timezone-Aware Date Display
- Convert UTC pradosha dates to location's timezone
- Show dates as they appear in location (not UTC)
- Use location's timezone offset for conversion

### 2. URL State Syncing
- Support `?location=<name>` parameter
- Support `?locationid=<lat>,<lon>` parameter
- Support `?date=<YYYY-MM-DD>` parameter
- Load and apply on page load
- Update URL when location/date changes (via popstate)

### 3. Maintain Backward Compatibility
- Auto-load cached location if no URL params
- Fall back to browser geolocation if no cache
- Pre-fill date picker with current date

## Acceptance Criteria

- [ ] Pradosha dates display in location's timezone (not browser's or UTC's)
- [ ] URL parameter `?location=Dubai` loads Dubai location
- [ ] URL parameter `?locationid=25.2048,55.2708` loads by coordinates
- [ ] URL parameter `?date=2026-06-15` pre-fills date picker
- [ ] Browser back/forward navigation works (popstate)
- [ ] Dates match between full calculator and simple widget
- [ ] All 131+ tests passing
- [ ] E2E test: Dubai (UTC+4) shows correct local dates
- [ ] E2E test: Olympia, WA (PDT) shows correct local dates

## Test Cases

### Dubai (UTC+4)
- **Current time**: 2026-06-13 00:00:00 Dubai local
- **UTC equivalent**: 2026-06-12 20:00:00 UTC
- **Expected display**: 
  - Header: "2026-06-13 (GST, UTC+4)" ✓
  - Pradosha dates: 2026-06-12 (local), 2026-06-27 (local), 2026-07-12 (local)
  - **Current bug**: Shows 2026-06-12 (UTC date instead of local)

### New York (EDT, UTC-4)
- **Same UTC dates** as Dubai example
- **Expected display**: 
  - Header: "2026-06-12 (EDT, UTC-4)"
  - Pradosha dates: 2026-06-12 (local), 2026-06-27 (local), 2026-07-12 (local)

### Olympia, WA (PDT, UTC-7)
- **Expected display**:
  - Header: "2026-06-12 (PDT, UTC-7)"
  - Pradosha dates: 2026-06-12 (local), 2026-06-27 (local), 2026-07-12 (local)

## Implementation Notes

### Date Conversion Algorithm
```javascript
// UTC date from calculation: 2026-06-12 (sunset in UTC)
const utcDate = new Date('2026-06-12');
const tzOffset = 4; // Dubai offset in hours

// Convert to local date
const localDate = new Date(utcDate.getTime() + tzOffset * 60 * 60 * 1000);
// Result: 2026-06-12 (local) — because UTC 2026-06-12 + 4 hours = local 2026-06-12
```

### Files to Modify
- `_includes/panchanga-widget-simple.html` - Add URL param parsing + popstate handler
- `assets/js/panchanga-widget-simple.js` - Add timezone conversion for displayed dates

### Files to Create
- `tests/pradosha-widget-timezone.test.cjs` - Unit tests for timezone date conversion

## Related

- Feature 0045: URL state modal panchangam (similar URL syncing)
- BUG: Pradosha dates show browser's local date, not location's

## Definition of Done

- [ ] All 131 tests passing
- [ ] Pradosha dates correct for Dubai, New York, Olympia, Tokyo, Sydney
- [ ] URL params work: location, locationid, date
- [ ] Browser navigation works (popstate)
- [ ] Dates match full calculator output
- [ ] Code reviewed and merged to main
