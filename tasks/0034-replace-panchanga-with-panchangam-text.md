---
id: 0034
title: "FEA: Replace 'Panchanga' with 'Panchangam' and remove Sanskrit text"
status: open
impact: Medium
priority: 020
complexity: "1-2 hours"
assignee: dev
raci:
  responsible: dev
  accountable: tech-lead
  consulted: []
  informed: []
dependencies: []
blocked_by: []
related: [0033]
---

# Feature: Terminology & Text Standardization

## Problem Statement

Current codebase uses inconsistent terminology:
- "Panchanga" (5-part in Sanskrit) used throughout
- Should be "Panchangam" (Anglicized form used in Western Hindu communities)
- Sanskrit text labels (e.g., "Tithi", "Nakshatra") not localized
- Mixed English/Sanskrit terminology creates confusion

## Objective

Standardize terminology across the project:
1. Replace "Panchanga" → "Panchangam" (term standardization)
2. Keep calculation output names but add English labels (e.g., "Tithi (Lunar Day)")
3. Remove/replace non-English text in UI labels

## Scope

### Files to Update

**HTML/Documentation**:
- `README.md` - Remove/replace Sanskrit references
- `CLAUDE.md` - Update terminology in project description
- `panchanga.md` - Page title and descriptions
- `pradoshakalapooja.md` - Page title and descriptions
- `_data/nav.yml` - Navigation menu text
- `_layouts/default.html` - Header/footer text
- `_includes/panchanga-widget-*.html` - Widget labels

**JavaScript**:
- `assets/js/panchanga-calculator.js` - Comment text, not function names
- `tests/panchanga-calculator.test.js` - Test descriptions

**CSS**:
- No changes needed (CSS is style-focused)

**Package/Version Files**:
- No changes needed

### Text Replacements

| Current | Replace With | Context |
|---------|--------------|---------|
| "Panchanga" | "Panchangam" | Page titles, descriptions, comments |
| "Panchanga Calculator" | "Panchangam Calculator" | Widget titles, nav, headings |
| "Panchanga Calculation" | "Panchangam Calculation" | Process descriptions |

### Labels to Update (Optional: Add English translations)

| Sanskrit Label | Suggested Update |
|---|---|
| "Tithi" | "Tithi (Lunar Day)" |
| "Nakshatra" | "Nakshatra (Star)" |
| "Yoga" | "Yoga (Auspicious Combination)" |
| "Karana" | "Karana (Half-Tithi)" |
| "Hora" | "Hora (Planetary Hour)" |
| "Rahu Kalam" | "Rahu Kalam (Inauspicious Period)" |
| "Abhijit Muhurta" | "Abhijit Muhurta (Auspicious Period)" |
| "Pradosha" | "Pradosha (Sacred Evening)" |

## Implementation Strategy

### Phase 1: Documentation & Config
- `README.md`: Replace "Panchanga" → "Panchangam"
- `CLAUDE.md`: Update terminology in overview
- `panchanga.md`: Page title and intro text
- `pradoshakalapooja.md`: Page title and intro text
- `_data/nav.yml`: Navigation menu text
- `_layouts/default.html`: Header/footer references

### Phase 2: HTML/Includes
- `_includes/panchanga-widget-full.html`:
  - Widget title: "Panchangam Calculator"
  - Button text: "Calculate Panchangam"
  - Result label: "Panchangam Results"
  - Optional: Add English translations next to Sanskrit labels

- `_includes/panchanga-widget-simple.html`:
  - Button text: "Calculate Pradosha Times"
  - Widget title: "Pradosha Timing"

### Phase 3: JavaScript Comments
- `assets/js/panchanga-calculator.js`:
  - Update file header comment
  - Update function comments (not function names)
  - Update result object descriptions

- `tests/panchanga-calculator.test.js`:
  - Update test descriptions
  - Update assertion messages

## Acceptance Criteria

- [ ] All instances of "Panchanga" replaced with "Panchangam" (except code identifiers)
- [ ] No Sanskrit text appears in UI labels (optional English translations added)
- [ ] Documentation updated (README, CLAUDE.md)
- [ ] Page titles updated (panchanga.md, pradoshakalapooja.md)
- [ ] Navigation menu updated
- [ ] Widget titles and button text updated
- [ ] Comments updated (not function/variable names)
- [ ] All tests still pass (no logic changes)
- [ ] Manual testing: Pages load correctly with new terminology
- [ ] Search/indexing still works (Google can find "Panchangam")

## Testing Strategy

### Verification Checklist
```
1. Page Load Test:
   - panchanga.md displays correctly
   - pradoshakalapooja.md displays correctly
   - Widget renders without errors

2. Text Search:
   - No remaining "Panchanga" (except in comments/git history)
   - "Panchangam" appears in all expected places

3. Widget Test:
   - Button text correct
   - Result labels correct
   - Calculation still works

4. Test Suite:
   - npm test passes (85+ tests)
   - No test failures due to text changes
```

## Impact

- ✅ Clearer terminology for Western audiences
- ✅ Better SEO (common English term)
- ✅ More professional appearance
- ✅ Consistent branding
- ❌ No calculation changes (same accuracy)

## Notes

**Scope**: This task is about terminology and labels only. Do NOT:
- Change function names (`getTithi()`, `getNakshatra()`, etc.)
- Change variable names (`tithi`, `nakshatra`, etc.)
- Change code logic
- Change calculation results

**Git Impact**: This is a text-only refactor, easy to grep/review.

## Related Tasks

- Task 0033: Redesign panchanga page with table layout
