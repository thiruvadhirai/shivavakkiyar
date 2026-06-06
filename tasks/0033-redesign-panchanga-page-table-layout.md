---
id: 0033
title: "FEA: Redesign Panchanga page with table layout instead of large boxes"
status: open
impact: High
priority: 010
complexity: "3-4 hours"
assignee: dev
raci:
  responsible: dev
  accountable: tech-lead
  consulted: []
  informed: []
dependencies: []
blocked_by: []
related: [0034]
---

# Feature: Panchanga Page Table Redesign

## Problem Statement

Current panchanga page displays each calculation result in large individual boxes/cards, which:
- Takes up significant vertical space
- Makes it hard to see all results at once
- Inefficient for users comparing multiple values
- Not mobile-friendly for landscape view

## Objective

Replace the large box layout with a clean, compact table layout that displays all panchanga data in an organized tabular format.

## Scope

**File**: `panchanga.md` (dedicated calculator page)  
**Components**: 
- Panchanga calculator widget (`_includes/panchanga-widget-full.html`)
- CSS styling (`assets/css/panchanga.css`)
- JavaScript result rendering (`assets/js/panchanga-calculator.js`)

## Design Requirements

### Table Layout
```
┌─────────────────────────────────────────────┐
│ Panchanga Results for [Location] [Date]     │
├──────────────────────┬──────────────────────┤
│ Component            │ Value                │
├──────────────────────┼──────────────────────┤
│ Tithi                │ Dwitiya (2)          │
│ Nakshatra            │ Jyeshtha (18)        │
│ Yoga                 │ [Yoga name]          │
│ Karana               │ [Karana name]        │
│ Hora                 │ [Hour name]          │
│ Sunrise              │ 05:21 AM (UTC-8)     │
│ Sunset               │ 08:45 PM (UTC-8)     │
│ Rahu Kalam           │ 03:15 PM - 04:45 PM  │
│ Abhijit Muhurta      │ 12:15 PM - 01:15 PM  │
│ Next Pradosha        │ [Date] at [Time]     │
│ Next 3 Pradoshas     │ [Date 1], [Date 2]...│
└──────────────────────┴──────────────────────┘
```

### Styling Requirements
- **Clean, minimal design**: Light borders, no shadows
- **Responsive**: Stack columns on mobile if needed
- **Alternating row colors**: Subtle contrast (gray/white)
- **High contrast text**: Readable font sizes (14-16px)
- **Print-friendly**: Maintains table format on print

### Functionality
- ✅ Two-column layout (Component name | Value)
- ✅ All existing data displayed (no omissions)
- ✅ Same calculation accuracy (no logic changes)
- ✅ Optional chaining preserved (null-safety)
- ✅ Responsive design (mobile, tablet, desktop)

## Implementation Strategy

### Phase 1: HTML Structure
Update `_includes/panchanga-widget-full.html`:
- Replace card/box divs with `<table>` element
- Rows for each panchanga component
- Two columns: label and value

### Phase 2: CSS Styling
Update `assets/css/panchanga.css`:
- Table border styling (light, minimal)
- Row styling (alternating colors)
- Responsive table layout
- Print styles

### Phase 3: JavaScript Rendering
Update result rendering in widget JavaScript:
- Populate table rows instead of div boxes
- Maintain null-safety (optional chaining)
- Update any conditional styling

## Acceptance Criteria

- [ ] Table layout implemented in panchanga widget
- [ ] All 10+ panchanga components displayed in table
- [ ] Responsive design works on mobile (< 600px)
- [ ] Responsive design works on tablet (600-1024px)
- [ ] Responsive design works on desktop (> 1024px)
- [ ] Optional chaining still protects against null values
- [ ] No calculation logic changed
- [ ] Print layout is readable
- [ ] Manual testing: calculator works with multiple locations
- [ ] All existing tests still pass (85+ tests)

## Testing Strategy

### Visual Testing
```
1. Desktop (1920x1080):
   - Table displays all data clearly
   - No horizontal scrolling needed
   
2. Tablet (768x1024):
   - Table readable
   - Proper spacing
   
3. Mobile (375x667):
   - Table either stacks or scrolls horizontally
   - Text readable
```

### Functional Testing
```
1. Test locations:
   - Olympia, WA (US location)
   - Karur, India (India location)
   - Sydney, Australia (Southern hemisphere)
   
2. Verify calculations unchanged:
   - Tithi values match expected
   - Nakshatra values match expected
   - Times match expected
```

## Benefits

- ✅ More compact display
- ✅ Easier to compare values
- ✅ Better use of screen space
- ✅ Mobile-friendly
- ✅ Cleaner, more professional appearance
- ✅ Faster to scan all results

## Related Tasks

- Task 0034: Replace "Panchanga" with "Panchangam" and remove Sanskrit text
