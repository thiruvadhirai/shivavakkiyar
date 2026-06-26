---
id: 0052
title: "BUG: Yoga calculation and meaning incorrect"
status: open
impact: High
priority: 050
complexity: "2-4 hours"
created: 2026-06-24
assignee: dev
raci:
  responsible: dev
  accountable: tech-lead
  consulted: []
  informed: []
dependencies: []
blocked_by: []
related: [0027, 0040]
---

# Bug: Yoga calculation and meaning incorrect

## Issue

The Yoga (auspicious combination) shown by the panchangam calculator is wrong on
three fronts:

1. **Terminology / meaning (documentation)** — the panchanga "Yoga" element is
   specifically the **Nitya Yoga** (नित्ययोग, the daily Soorya–Chandra yoga),
   one of 27 formed from the *sum* of the Sun and Moon sidereal longitudes. This
   is a distinct concept from "yoga" in the broader sense of Jyotisha planetary
   combinations — of which there are **well over 100** (Raja yogas, Dhana yogas,
   Pancha Mahapurusha yogas, etc.). The page text in `panchangam.md` (lines
   29–32) conflates the two and implies "yoga = 27 total," which is incorrect:

   ```
   ### Yoga (Auspicious Combination)
   - Combination of Sun and Moon positions      ← only true for Nitya Yoga
   - 27 yogas create different energy patterns   ← wrong: there are 100+ yogas;
                                                   only the *Nitya* yogas number 27
   - Some are highly auspicious, others require caution  ← vague / misleading
   ```

2. **Meaning (data + UI)** — the widget card is labelled "Yoga (Auspiciousness)"
   but no per-yoga meaning is ever displayed. The meanings catalogued in task
   0040 (e.g. *Vishakumbha → Triumphant*, *Preeti → Happy*) were never stored in
   the data layer, so users see only a name with no indication of whether the
   yoga is auspicious or inauspicious. There is also no reference page where a
   user can read about all 27 Nithya Yogas.

3. **Calculation** — the active yoga and/or its end-time do not match reference
   panchang sources for some dates/locations.

## Requested Solution (from product owner)

- Add a new page **`nithyayoga.md`** that lists **all 27 Nithya Yogas** with
  their descriptions.
- Drive both the new page and the panchangam widget from a **single source of
  truth** (a data/JSON file), so the panchangam page shows the description for
  **only the specific Nithya Yoga currently being displayed**.
- Change the widget card title to **"Nithya Yoga (Auspiciousness)"**.

## Reproduction

```
1. Open /panchangam/ (full widget) for a known date/location
2. Compare the displayed Yoga name + "until HH:MM" against a trusted panchang
   (e.g. drikpanchang.com) for the same location/date
3. Observe: yoga name and/or end-time differs from reference
4. Note: no meaning/description text is shown for the yoga at all
```

## Root Cause (hypotheses to confirm)

### Calculation (`assets/js/panchanga-calculator.js`)

- `calculateYoga(sunLon, moonLon)` is fed **sidereal** longitudes
  (`getSunLongitude` / `getMoonLongitude` already subtract Drik Ayanamsa). The
  yoga index math (`floor((sunLon + moonLon) / 13.333) + 1`) is correct in
  principle — verify the boundary/off-by-one at the 27→1 wrap and at exact
  13.333° multiples.
- `getYogaEndTime()` (line ~1040) uses a **fixed combined motion of 14°/day**.
  The Moon's true speed varies (~11.7°–15.3°/day), so the "until HH:MM" end-time
  drifts from reality — this is the most likely source of the timing error.
- End-time is computed from the longitudes at `date` (local midnight / start of
  day) rather than at sunrise, so the reported transition can be off by hours.

### Meaning (`assets/js/panchangam-languages.js` + missing data/page)

- `PanchangaLanguages.YOGA` entries contain only `{ name, tamil }` — there is
  **no description/meaning**. The meanings enumerated in task 0040 were never
  added, and there is no canonical data file for them.
- The widgets (`yoga-name`, `result-yoga-name`) render name + Tamil only; there
  is no element bound to a description, so the "Auspiciousness" promise is unmet.
- No `nithyayoga.md` reference page exists.

## Data Model & Single Source of Truth

Create one canonical data file describing all 27 Nithya Yogas, e.g.
**`_data/nithya_yoga.json`** (Jekyll `_data`, readable by Liquid). Suggested
schema per entry:

```json
{
  "number": 1,
  "name": "Vishakumbha",
  "tamil": "விஷ்கம்பம்",
  "nature": "auspicious",          // auspicious | inauspicious | mixed
  "meaning": "Triumphant",          // short gloss (task 0040)
  "description": "Longer 1–2 sentence description of the yoga's quality…"
}
```

Consumption (both derive from the ONE file):

- **`nithyayoga.md`** renders the full 27-row table directly from
  `site.data.nithya_yoga` via Liquid (no JS needed).
- **Panchangam widget** needs the data at runtime in the browser. Jekyll does
  not serve `_data/` directly, so expose it as a fetchable asset — the
  recommended pattern is a generated passthrough file
  **`assets/data/nithya-yoga.json`** (a templated file with front matter that
  loops `site.data.nithya_yoga` and emits JSON). The widget `fetch()`es this
  once and looks up the active yoga by its 1–27 number.

> Design note: keep `PanchangaLanguages.YOGA` (name + Tamil) unchanged so the
> calculator return-shape contract and 85+ tests are unaffected
> (`.claude/rules/calculator.md`). The new data file supplies *descriptions*
> only; the widget joins them by yoga number. Alternative (simpler, but
> duplicates name/Tamil): add `description` directly to `PanchangaLanguages.YOGA`
> and have `nithyayoga.md` read a generated JSON. Decide during implementation.

## Impact

- Users see an incorrect yoga and/or wrong transition time — undermines trust in
  the panchangam, the core feature of the site.
- Auspicious vs inauspicious guidance (the whole point of yoga) is absent.
- Affects both widgets (simple Pradosha page + full Panchangam page).

## Solution Approach

### Phase 0 — Data + new page + terminology
1. Create canonical **`_data/nithya_yoga.json`** with all 27 entries (number,
   name, tamil, nature, meaning, description) — source names/meanings from task
   0040.
2. Create **`nithyayoga.md`** (`permalink: /nithyayoga/`) rendering the full 27
   table from `site.data.nithya_yoga`; add it to `_data/nav.yml`.
3. Generate **`assets/data/nithya-yoga.json`** as a fetchable passthrough of the
   same data for the widget.
4. Correct the `panchangam.md` "Yoga" section. Proposed copy (confirm wording):

   ```
   ### Nithya Yoga (Auspiciousness)
   - Derived from the *sum* of the Sun's and Moon's sidereal longitudes
   - There are 27 Nithya Yogas in the daily cycle (this is the panchanga "yoga");
     distinct from the 100+ planetary yogas of natal astrology
   - Each carries its own quality — some favourable, some to be avoided
   - See the [Nithya Yoga reference](/nithyayoga/) for all 27 and their meanings
   ```

### Phase 1 — Calculation
1. Add integration test cases (date/location → expected yoga name + end-time)
   verified against a trusted external panchang.
2. Confirm `calculateYoga` index against reference; fix any wrap/boundary bug.
3. Replace the fixed `14°/day` end-time estimate with the actual combined
   sun+moon angular velocity at the calculation instant (sample two close times
   and differentiate, consistent with how tithi/nakshatra end-times are derived).
4. Anchor the yoga evaluation to sunrise (matching panchang convention).

### Phase 2 — Widget wiring + title
1. Update the widget card title to **"Nithya Yoga (Auspiciousness)"** (full and
   simple widgets).
2. Load `assets/data/nithya-yoga.json` in the widget JS (fetch once, cache), and
   display the **description for only the currently-shown yoga** (looked up by
   the calculated yoga number 1–27) beneath the name.
3. Keep `getYogaName()` return-shape unchanged; the description is joined in the
   widget layer by yoga number (additive — see `.claude/rules/calculator.md`).
4. Handle the async load gracefully (show name/Tamil immediately; fill the
   description when the JSON resolves; null-safe per `.claude/rules/widgets.md`).

## Acceptance Criteria

- [ ] New `nithyayoga.md` page lists all **27** Nithya Yogas with descriptions,
      rendered from the canonical data file (`/nithyayoga/` permalink)
- [ ] Page linked in `_data/nav.yml`
- [ ] Single source of truth: `_data/nithya_yoga.json` drives both the page and
      the widget (no hand-duplicated description text)
- [ ] Panchangam widget shows the description for **only the currently-displayed
      yoga**, looked up by yoga number
- [ ] Widget card title reads **"Nithya Yoga (Auspiciousness)"** (both widgets)
- [ ] `panchangam.md` description corrected (Sun+Moon longitude *sum*; 27 Nithya
      yogas vs 100+ astrological yogas; links to `/nithyayoga/`)
- [ ] Yoga name matches reference panchang for ≥5 verified date/location cases
- [ ] Yoga end-time within tolerance (±a few minutes) of reference
- [ ] End-time uses real sun+moon velocity, not a hardcoded 14°/day
- [ ] Existing unit + integration + E2E tests still pass (no return-shape,
      form-ID, or cache-key changes)

## Files Affected

- `_data/nithya_yoga.json` — NEW: canonical 27-yoga data (single source of truth)
- `assets/data/nithya-yoga.json` — NEW: generated fetchable passthrough for widget
- `nithyayoga.md` — NEW: reference page listing all 27 Nithya Yogas
- `_data/nav.yml` — add Nithya Yoga page to navigation
- `panchangam.md` — correct the Nithya Yoga description, lines 29–32
- `_includes/panchanga-widget-full.html` — title + description element
- `_includes/panchanga-widget-simple.html` — title + description element
- `assets/js/panchanga-widget-full.js` — fetch data, show active-yoga description
- `assets/js/panchanga-calculator.js` — `calculateYoga`, `getYogaEndTime`
- `tests/panchanga-calculator-integration.test.js` — new yoga test cases

## Testing

```bash
# All tests run in container (never on host)
./scripts/feature-workflow.sh test
podman exec saivamcloud-test npm run test:e2e
```

## References

- Task 0040 — approved 27 (Nitya) yoga Sanskrit names + meanings
- Task 0027 — panchanga calculation accuracy / integration test harness
- **Nitya Yoga** = (sidereal Sun longitude + sidereal Moon longitude) ÷ 13.333°
  → 1–27. This is the panchanga "yoga" (one of 27 daily yogas).
- Broader **Jyotisha yogas** (Raja, Dhana, Pancha Mahapurusha, etc.) number
  100+ and are *not* what the panchanga computes — do not conflate.
- `.claude/rules/calculator.md` — do not change return shapes or number ranges
