---
id: 0053
title: Sankalpam calendar elements, timezone fixes, and site page index
status: in-progress
priority: medium
complexity: high
created: 2026-07-26
---

# Feature: Dynamic Sankalpam + site index

## Part 1 — Sankalpam calendar

### Issue
`sankalpam.md` was hardcoded to a single occasion — Pradosha Kalam on Friday 26 June 2026
at Olympia, Washington. Every panchanga value and every place-name was static text repeated
three times over: Tamil grantha, IAST, and English.

### Goal
The worshipper chooses a **date and time**; every value that follows from that moment fills
in across the table and all three renderings. **Location stays fixed to Olympia** and is
bracketed and colour-coded so anyone worshipping elsewhere knows exactly what to replace.

### Gap analysis
`calculateFullPanchanga()` already returned tithi, nakshatra, yoga, karana and sunrise/sunset.
Missing entirely from `assets/js/`, and added here:
- **Samvatsara** (60-year Prabhava cycle), **ayana**, **ritu**, **masa** (Tamil solar month),
  **vaara** (weekday in sankalpa form)
- **Declined Sanskrit forms** the recited text needs — the verse says "trayodaśyāṃ śubha
  tithau", not the nominative "Trayodashi" the display widgets show
- **Punya kala** selection

### Decisions
- **Month**: Tamil calendar name. Verse keeps ஸௌரமானேன — wording unchanged.
- **Location**: fixed to Olympia; geography bracketed and colour-coded, with a reference
  table for the India / North America dvipa-varsha-khanda identities.
- **Punya kala**: "ப்ரதோ³ஷ புண்ய காலே" **only** when the moment genuinely falls in Pradosha
  (Trayodashi, within sunset ±90 min). Otherwise "&lt;tithi&gt; காலே" — only Pradosha carries
  the word புண்ய. The text must never claim a Pradosha worship that is not happening.
- **No wording changes** to the recited text beyond the variable slots.
- Calendar logic lives in the **existing** `panchanga-calculator.js`; naming and declension
  data in the **existing** `panchangam-languages.js`. No parallel module.

## Part 2 — Timezone correctness (bugs found while building Part 1)

Both are pre-existing and affect the whole site, not just this page.

### Bug A — vaara read in the wrong zone
The weekday was taken from the raw instant, i.e. the *browser's* zone. An Olympia evening is
already the next day in UTC, so 6:30 PM Sunday 26 July 2026 displayed as **Saturday**.
Fixed by resolving the weekday in the location's own timezone (`getZonedParts`), and by only
applying the sunrise-to-sunrise rollback when sunrise falls on the *same* civil day.

### Bug B — sunrise/sunset a full day late
`SearchRiseSet` returns the next event *after* the instant it is given. Passing the moment of
worship meant an evening search found **tomorrow's** sunrise; that then tripped the existing
"sunset before sunrise" correction in `calculateFullPanchanga`, pushing sunset another day
out. Result: sun times ~24h late while their displayed clock times still looked plausible —
which silently broke every window comparison (pradosha, rahu kalam, abhijit).
Fixed by anchoring the search to the start of the location's civil day (`getLocalDayStart`).

Symptom that exposed it: 8:56 PM on 26 July 2026, four minutes after a 20:52 sunset on
Trayodashi, was reported as *not* Pradosha.

## Part 3 — Site page index and front matter

- **`index.md`** — new alphabetical index of all pages, listing `title` with `custom_heading`
  as the native-script subtitle.
- **Front matter added** to pages that had none, so they gain the site layout and appear in
  the index: `arathi.md`, `deepa-pooja.md`, `license.md`, `nindrathiruthandagam.md`,
  `sanskritforms.md`, `sivavakkiyartranslation.md`, `stotram.md`, `thiruneetrupathigam.md`,
  `thiruthandagamwithmeaning.md`.
- **`vinayagapooja.md`** — grantha spelling corrections (ப்ருத்²வி, விஷ்ணுநா, சாஸநம்).

## Part 4 — Tooling fix

`scripts/feature-workflow.py` — `branch_exists()` treated `git show-ref --quiet`'s silent
failure as success, so it reported every branch as already existing and `start` could never
create one. Now checks the exit code.

## Acceptance Criteria
- [x] Date and time chooser on the Sankalpam page
- [x] Table reflects the chosen moment, including ayanamsa, sunrise and sunset
- [x] Tamil grantha, IAST and English renderings all update together
- [x] Samvatsara correct: 26 June 2026 → Parabhava
- [x] Tamil month correct: 26 June 2026 → Aani; ritu → Greeshma; ayana → Uttarayana
- [x] Vaara agrees with the displayed moment in the location's timezone
- [x] Sun times anchored to the worshipper's civil day
- [x] Pradosha claimed only when the moment is genuinely in it
- [x] Location slots bracketed and colour-coded, with a region reference table
- [x] Calendar logic in the existing calculator, not a parallel module
- [x] All pages carry front matter and appear in the index
- [ ] Full suite green (unit + integration + E2E)

## Files Affected
- `assets/js/panchanga-calculator.js` — calendar elements, timezone fixes
- `assets/js/panchangam-languages.js` — samvatsara/month/ritu/ayana/vaara + declensions
- `assets/js/sankalpam-widget.js` — NEW: thin binder over the shared calculator
- `_includes/sankalpam-widget.html` — NEW: picker, table, colour-coding
- `sankalpam.md` — bound slots + colour-coded location brackets
- `index.md` — NEW: alphabetical page index
- 9 content pages — front matter; `vinayagapooja.md` — grantha corrections
- `scripts/feature-workflow.py` — branch_exists fix
- `tests/sankalpam-calendar.test.cjs`, `tests/e2e/sankalpam.spec.js` — NEW

## Testing
```bash
podman exec saivamcloud-test npm test
```
Anchor case: 26 June 2026 evening, Olympia WA → Parabhava / Uttarayana / Greeshma / Aani /
Shukla / Trayodashi / Friday-Bhrigu / Anusham / Sadhya.
Regression cases: 26 July 2026 6:30 PM → Sunday (not Saturday); 26 July 2026 8:56 PM →
Pradosha punya kala.
