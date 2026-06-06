---
id: 0046
title: Pradosha Regression - Null Reference Error
status: done
priority: high
complexity: low
created: 2026-06-06
---

# Bug: Pradosha Regression - Null Reference Error

## Issue
Error on pradoshakalapooja page when calculating pradosha times:
```
Error: Cannot set properties of null (setting 'textContent')
```

Location: `_includes/panchanga-widget-simple.html` line 624+ (calculateBtn.onclick handler)

## Root Cause
- Missing null checks on DOM element references in simple widget
- `expandBtn` and `collapseBtn` may be null but code tries to use them without validation
- Regression likely introduced during Task 0045 refactoring

## Impact
- Simple widget (pradosha page) broken - cannot calculate pradosha times
- User cannot interact with location selection
- High priority - breaks core functionality

## Acceptance Criteria
- [ ] Simple widget loads without JavaScript errors
- [ ] Can select location and calculate pradosha times
- [ ] Modal/full widget unaffected
- [ ] All existing tests still pass
- [ ] No console errors on page load

## Files Affected
- `_includes/panchanga-widget-simple.html` - Add null checks for DOM elements

## Testing
```bash
1. Navigate to pradoshakalapooja page
2. Verify no console errors
3. Click "Select Location" button
4. Enter location and calculate
5. Verify results display correctly
```

## Notes
- Task 0045 refactored full widget to external JS
- Simple widget still uses inline script
- Need defensive programming: check all DOM queries before using
