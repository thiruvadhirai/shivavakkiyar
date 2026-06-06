# Task 0038: Fix Karana and Hora Display Bugs

## Summary
Fix two related panchanga display bugs:
1. **Karana** displaying as "Karana 41" instead of correct name (cyclic mapping issue)
2. **Hora** displaying as single value instead of 24-hour table (architecture issue)

## Root Causes

### Bug 1: Karana Cyclic Mapping
- `getKaranaName()` normalizes to 1-60 but only 11 unique karanas exist
- Karana 41 → lookup fails → returns fallback "Karana 41"
- Fix: Use modulo 11 instead of 60

### Bug 2: Hora Display Design
- Current: Shows only current hora at calculation time
- Should: Display all 24 horas for the day in table format
- Root cause: Display architecture doesn't iterate through all horas

## Acceptance Criteria

### Bug Fixes
- [x] Karana displays correct name for all 1-60 values (cyclic 1-11 mapping)
- [x] Karana displays Tamil translation
- [x] Hora displays table with all 24 horas (sunrise to sunrise)
- [x] Hora shows planet name and time range for each hour
- [x] Hora displays Tamil translations
- [x] Hora starting planet based on day of week (not always Sun)
  - Sunday: Sun → Monday: Moon → ... → Saturday: Saturn
  - First hora always starts at sunrise

### Usability Improvements
- [x] Pradosha dates in collapsible section (expand/collapse with arrow)
- [x] Hora table collapsible (expand/collapse with arrow) 
- [x] Remove duplicate pradosha list (consolidate to one)
- [x] Add celestial data to main panchanga table
  - Sun longitude and degree
  - Moon longitude and degree
  - Display alongside tithi/nakshatra/etc.
- [x] Reorder table rows for logical flow:
  1. Sunrise
  2. Sunset
  3. Tithi
  4. Nakshatra
  5. Abhijit Muhurtam
  6. Rahu Kalam
  7. Yoga
  8. Karana
  9. Hora (collapsible with 24-hour table)
  10. Sun Longitude
  11. Moon Longitude
- [x] Collapsible sections default state:
  - Pradosha dates: Collapsed by default (▶ arrow)
  - Hora table: Collapsed by default (▶ arrow)
  - Both with proper toggle functionality (expand/collapse)
- [x] Display Paksha separately with Tamil translation:
  - Added Paksha (Lunar Phase) row before Tithi
  - Display as "KRISHNA" or "SHUKLA" (English)
  - Include Tamil translation for paksha
  - Uses PanchangaLanguages.PAKSHA for translations
- [x] Display Tithi with Tamil translation:
  - Added Tamil translation field for tithi name
  - Shows English tithi name + Tamil translation
  - Displays below paksha in table for logical flow
- [x] Replace progress bar with time-based display (inline format, consistent font size):
  - **Tithi**: Name on same line as end time + next tithi
    - Format: "Dwadashi (until HH:MM, Next: Trayodashi)"
    - Time inline with consistent font size
  - **Nakshatra**: Name on same line as end time + next nakshatra
    - Format: "Dhanishtha (until HH:MM, Next: Shatabhisha)"
    - Time inline with consistent font size
  - **Yoga**: Name on same line as end time + next yoga
    - Format: "Shiva (until HH:MM, Next: Priti)"
    - Time inline with consistent font size
  - **Karana**: Name on same line as end time + next karana
    - Format: "Bava (until HH:MM, Next: Balava)"
    - Time inline with consistent font size
    - Uses same motion-rate calculation as tithi/nakshatra/yoga
  
### Quality
- [ ] All tests pass (unit + integration + E2E)
- [ ] No regressions in other panchanga displays

## Implementation Plan

### Phase 1: Karana & Hora Fixes (DONE)
- ✅ Change `getKaranaName()` modulo from 60 to 11
- ✅ Use `PanchangaLanguages.KARANA` for names and Tamil
- ✅ Create `calculateAllHoras()` function
- ✅ Update widget display with 24-hora table

### Phase 2: Usability Refactor (IN PROGRESS)
- [ ] **Consolidate Pradosha Display**
  - Remove duplicate pradosha list from full results section
  - Keep pradosha in collapsed view only
  - Make pradosha section collapsible (expand/collapse button)

- [ ] **Add Celestial Data to Table**
  - Add rows for Sun Longitude and degree
  - Add rows for Moon Longitude and degree
  - Display alongside tithi/nakshatra/etc. in main table
  - Format: "Sun Longitude: 65.55° (in Gemini)"

- [ ] **Update both widget templates**
  - Remove duplicate pradosha list
  - Add celestial data rows
  - Implement collapsible pradosha section
  - Update JavaScript for new layout

## Test Plan
- Verify karana 41 shows as "Shakuni" (correct name)
- Verify hora table shows all 24 planets cycling
- Verify times are accurate (sunrise-based calculation)
- Verify Tamil displays correctly for both

## Testing & Validation
- [x] Update test fixtures with Drik Panchang data
  - Added new fields to result structure:
    - tithi.endTime, tithi.nextTithi, tithi.nextTithiTamil
    - nakshatra.endTime, nakshatra.nextNakshatra, nakshatra.nextNakshatraTamil
    - yoga.endTime, yoga.nextYoga, yoga.nextYogaTamil
  - Calculator functions compute end times based on celestial motion rates
  - All 22 tests passing with new data structure
- [x] Simple widget regression analysis
  - Identified: Progress bars displayed in simple widget (inconsistent with full widget)
  - Changes made: Updated simple widget to match full widget
    - Replaced tithi progress bar with end-time display
    - Replaced nakshatra progress bar with end-time display
    - Added yoga end-time display
  - All E2E tests passing - no regressions detected

## Status
- Created: 2026-06-06
- Branch: `feature/0038-karana-display-number-instead-of-name`
- Tests: 22/22 passing (awaiting test data updates)
