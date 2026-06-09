---
id: 0049
title: Fix incorrect date display for Dubai timezone in panchangam
status: in-progress
priority: high
complexity: medium
impact: |
  Users viewing panchanga for non-UTC timezones see wrong date in panchangam section.
  Dubai and other UTC+4 locations show date -1 day.
raci:
  accountable: vairam.svs@outlook.com
  responsible: vairam.svs@outlook.com
blocked_by: []
---

## Description

When accessing `/panchangam/?date=2026-06-06&locationid=25.0791,55.4797` (Dubai), the panchangam section displays 2026/06/05 instead of the requested date 2026/06/06.

**Root Cause**: Likely timezone conversion issue when handling location-based date/time calculations.

## Reproduction

1. Visit: `http://localhost:5080/panchangam/?date=2026-06-06&locationid=25.0791,55.4797`
2. Observe date display in panchangam section
3. Expected: 2026-06-06
4. Actual: 2026-06-05

## Acceptance Criteria

- [ ] Date displayed correctly matches URL `date` parameter regardless of location timezone
- [ ] Dubai (UTC+4) shows correct date
- [ ] Other timezones (India UTC+5:30, US timezones) tested and working
- [ ] All existing tests pass
- [ ] No regression in other date-based calculations

## Technical Notes

- Dubai coordinates: 25.0791°N, 55.4797°E (UTC+4 timezone)
- Bug appears when timezone offset creates date boundary conditions
- Related to recent Temporal API migration (Task 0029)
- Check: NOAACalculator, panchanga-calculator date handling

## Links

- Related: Task 0029 (Temporal API migration)
- Related: Task 0047 (auto-calculate with cached location)
- Related: Task 0048 (temporal-polyfill fixes)
