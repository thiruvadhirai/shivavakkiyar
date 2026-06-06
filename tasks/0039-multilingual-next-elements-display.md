---
id: 0039
title: Add Tamil language support for next tithi/nakshatra/yoga/karana
description: Fix bug where panchanga widget displays only English names for next tithi, nakshatra, yoga, and karana elements instead of supporting Tamil translations
status: in-progress
priority: medium
complexity: low
created: 2026-06-06
---

## Problem Statement

The panchanga calculator provides both English and Tamil names for next elements (nextTithi, nextTithiTamil, nextNakshatra, nextNakshatraTamil, etc.), but the widgets only display the English versions.

**Impact**: Tamil-speaking users see incomplete panchanga information (only English for "next" values).

## Acceptance Criteria

- [ ] Both widgets (simple and full) display Tamil versions of next tithi/nakshatra/yoga/karana
- [ ] Tamil names appear in gray color (matching current style)
- [ ] All 4 next elements have bilingual display:
  - Next Tithi: English + Tamil
  - Next Nakshatra: English + Tamil
  - Next Yoga: English + Tamil
  - Next Karana: English + Tamil
- [ ] All tests pass (85 calculator tests, E2E tests)
- [ ] Manual verification: Both widgets show Tamil for next elements

## Technical Approach

1. Add Tamil `id` elements to HTML templates for each next value
2. Update JavaScript to populate both English and Tamil versions from calculator
3. Style Tamil text to match existing pattern (gray, smaller font)
4. Test both widgets on pradoshakalapooja page and dedicated panchangam page

## Files to Modify

- `_includes/panchanga-widget-simple.html` (4 next elements + JS)
- `_includes/panchanga-widget-full.html` (4 next elements + JS)

## Related Tasks

- Depends on: (none)
- Blocks: (none)
