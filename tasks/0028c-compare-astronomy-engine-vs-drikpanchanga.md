---
id: 0028c
title: "RESEARCH: 365-day Kundali comparison — Astronomy Engine vs Drik Panchang"
status: pending
impact: High
priority: 026
complexity: "3-4 hours"
assignee: dev
raci:
  responsible: dev
  accountable: tech-lead
  consulted: []
  informed: []
dependencies: [0028b, 0029a]
blocked_by: []
related: [0028b, 0029a, 0029b]
---

# RESEARCH Task: 365-Day Kundali Comparison Dataset

## Problem Statement

Task 0028b validated that Astronomy Engine sunrise/sunset timing differs from NOAA by the atmospheric refraction effect (~2-5 minutes, latitude-dependent). Task 0029a wired NOAACalculator into PanchangaCalculator.

This task extends the comparison to **complete Kundali (birth chart) generation**: all 9 grahas (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu), Lagna (Ascendant), and derived values (Nakshatra, lord, sub-lord, pada, Bhava houses, Navamsha D-9 chart) for **365 days × 2 times (AM/PM) × 2 locations**, compared against Drik Panchang reference data.

**Goal**: Establish which astronomical algorithms are accurate enough to generate Kundali data programmatically, and quantify error margins for each component (planets, Lagna, house cusps, etc.).

## Reference Data

Both Drik Panchang URLs extracted via WebFetch on 2026-06-01:

### Olympia, WA (geoname-id=5805687)
**Date/Time**: November 2, 2026 at 15:11:24 local (23:11:24 UTC)

| Graha | Longitude | Rashi | Nakshatra | Pada | Lord | Sub-Lord | Bhava |
|---|---|---|---|---|---|---|---|
| Lagna | 29°20'50" | Kumbha | P Bhadrapada | 3 | Guru | Surya | 1 |
| Surya | 16°18'22" | Tula | Swati | 3 | Rahu | Shukra | 9 |
| Chandra | 00°31'29" | Simha | Magha | 1 | Ketu | Ketu | 7 |
| Mangal | 25°22'02" | Karka | Ashlesha | 3 | Budha | Rahu | 6 |
| Budha ↺🔥 | 20°03'48" | Tula | Vishakha | 1 | Guru | Guru | 9 |
| Guru | 00°19'09" | Simha | Magha | 1 | Ketu | Ketu | 7 |
| Shukra ↺ | 01°05'28" | Tula | Chitra | 3 | Mangal | Budha | 9 |
| Shani ↺ | 14°55'33" | Meena | U Bhadrapada | 4 | Shani | Guru | 2 |
| Rahu | 01°43'42" | Kumbha | Dhanishtha | 3 | Mangal | Budha | 1 |
| Ketu | 01°43'42" | Simha | Magha | 1 | Ketu | Shukra | 7 |

Navamsha Lagna: 24°07'32" Mithuna, Punarvasu 2, Guru/Budha

### Karur, India (geoname-id=1267648)
**Date/Time**: November 2, 2026 at 15:11:24 local (09:41:24 UTC)

| Graha | Longitude | Rashi | Nakshatra | Pada | Lord | Sub-Lord | Bhava |
|---|---|---|---|---|---|---|---|
| Lagna | 00°12'13" | Meena | P Bhadrapada | 4 | Guru | Chandra | 1 |
| Surya | 15°44'35" | Tula | Swati | 3 | Rahu | Shukra | 8 |
| Chandra | 22°49'16" | Karka | Ashlesha | 2 | Budha | Chandra | 5 |
| Mangal | 25°05'14" | Karka | Ashlesha | 3 | Budha | Rahu | 5 |
| Budha ↺ | 20°46'12" | Tula | Vishakha | 1 | Guru | Guru | 8 |
| Guru | 00°15'11" | Simha | Magha | 1 | Ketu | Ketu | 6 |
| Shukra ↺ | 01°20'28" | Tula | Chitra | 3 | Mangal | Budha | 8 |
| Shani ↺ | 14°57'37" | Meena | U Bhadrapada | 4 | Shani | Guru | 1 |
| Rahu | 01°45'29" | Kumbha | Dhanishtha | 3 | Mangal | Budha | 12 |
| Ketu | 01°45'29" | Simha | Magha | 1 | Ketu | Shukra | 6 |

**Key Note**: "15:11:24 local" is 13.5 hours apart (Olympia UTC-8 vs Karur UTC+5:30), so planetary positions differ significantly.

## Acceptance Criteria

- [ ] **All 9 grahas** computed for 365 days × 2 times × 2 locations (730 × 2 × 9 = 13,140 graha positions)
- [ ] **Lagna (Ascendant)** within 1.0° of Drik Panchang (≈4 minutes of RA error)
- [ ] **Sun longitude** within 2 arc-minutes of Drik Panchang
- [ ] **Moon longitude** within 5 arc-minutes of Drik Panchang
- [ ] **Inner planets** (Mercury, Venus) within 5 arc-minutes
- [ ] **Outer planets** (Mars, Jupiter, Saturn) within 5 arc-minutes
- [ ] **Rahu/Ketu** within 25 arc-minutes (mean node, not true node)
- [ ] **Nakshatra** (1-27) matches for all grahas (except at boundaries where 2-3 off acceptable)
- [ ] **Nakshatra pada** (1-4) matches for all grahas
- [ ] **Nakshatra lord** correctly assigned per 27-graha lord table
- [ ] **KP sub-lord** calculated per Vimsottari dasha system (27 sub-divisions within each Nakshatra)
- [ ] **Rashi** (zodiac sign 1-12) correct for all grahas
- [ ] **Bhava** (Whole Sign houses, 1-12) correct based on Lagna rashi
- [ ] **Navamsha (D-9)** for all grahas: longitude, rashi, nakshatra calculated
- [ ] **Retrograde flags** correct: Budha↺, Shukra↺, Shani↺ on Nov 2, 2026
- [ ] **Reference validation** embedded in JSON: Nov 2 calculated vs Drik Panchang with error deltas
- [ ] **Output file** `tests/365day-kundali-2026.json` (~15-20 MB, 730 days × 2 locs × 2 times)
- [ ] **Committed to git** with clear commit message referencing this task

## Key Algorithmic Findings (Pre-Implementation)

### Navamsha formula (VALIDATED against reference data)
```
navamshaLon = (floor(siderealLon / 3.3333) % 12) * 30 + (siderealLon % 3.3333) * 9
```
Test: Surya 196.306° sidereal → calculated 326.757° = 26°45' Kumbha ✓ (Drik Panchang: 26°45'25" ✓)

### Rahu formula (mean ascending node, Meeus Ch.22)
```
Ω = 125.04452 - 1934.136261*T + 0.0020708*T²  [T = Julian centuries from J2000]
```
Test: Nov 2, 2026 T=0.26827 → calculated 302.07° sidereal (Drik: 301.73°, diff=20' — expected for mean vs true node)

### Lagna formula (GMST-based)
```
GMST = 280.46061837 + 360.98564736629 * (JD - 2451545.0)  [degrees]
LST = (GMST + longitude) % 360  [Local Sidereal Time]
tan(ASC) = -cos(LST) / (sin(ε)*tan(φ) + cos(ε)*sin(LST))
if sin(LST) < 0: ASC += 180°
ASC_sidereal = ASC_tropical - ayanamsa
```
Expected error: ~0.5-1° (GMST formula is approximate; full precision requires EOP corrections)

### VSOP87 Planet Longitude (truncated series)
For Mercury, Venus, Mars, Jupiter, Saturn: Use Meeus Table 33.a L0+L1 terms.
Expected accuracy: 1-5 arc-minutes (truncated series near J2000)

### Retrograde detection
Planet retrograde if: `lon(T+1day) < lon(T)` (checking decreasing ecliptic longitude)

## Implementation Strategy

### File: `tests/generate-365day-kundali.cjs` (~900 lines)

1. **Constants** (100 lines)
   - 27 Nakshatra lords, names, degree ranges
   - 12 Rashi owners (zodiac lords)
   - Vimsottari dasha periods (120-year cycle split)
   - KP sub-lord lookup tables

2. **Utilities** (150 lines)
   - `julianDay(y, m, d, utHours)`
   - `T_from_JD(JD)` → Julian centuries
   - `getDrikAyanamsa(T)` → 23.856389 + 0.01391 * T * 100
   - `normalize(degrees)` → [0, 360)
   - Time parsing, DST detection

3. **Meeus Algorithms** (400 lines)
   - `getGMST(JD)` → Greenwich Mean Sidereal Time (degrees)
   - `getObliquity(T)` → obliquity of ecliptic (degrees)
   - `getSunLon(T, ayanamsa)` → sidereal ecliptic longitude
   - `getMoonLon(T, ayanamsa)` → sidereal (truncated ELP2000)
   - `getPlanetLon(body, T, ayanamsa)` → for Mercury, Venus, Mars, Jupiter, Saturn (VSOP87 truncated)
   - `getRahuLon(T, ayanamsa)` → mean ascending node
   - `getKetuLon(rahuLon)` → rahuLon + 180°
   - `getLagna(JD, lat, lon, ayanamsa)` → Ascendant degree

4. **Derived Calculations** (150 lines)
   - `getRashi(sidLon)` → {num, name, owner}
   - `getNakshatra(sidLon)` → {num, name, lord, pada, lonWithin}
   - `getSubLord(nakNum, lonWithin)` → KP sub-lord name
   - `getNavamsha(sidLon)` → {longitude, rashi, nakshatra, pada, lord, sublord}
   - `getBhava(grahaRashi, lagnaRashi)` → Whole Sign house (1-12)
   - `isRetrograde(body, T)` → boolean

5. **Main Kundali function** (50 lines)
   - Calls all above for all 10 bodies (including Lagna)
   - Returns structured object

6. **365-day loop** (80 lines)
   - 2 locations × 365 days × 2 times = 1,460 entries
   - AM time: 06:00:00 local
   - PM time: 15:11:24 local
   - Locations: Olympia (PST/PDT), Karur (IST)

7. **Reference validation** (60 lines)
   - Embed Drik Panchang Nov 2, 2026 values
   - Calculate errors for both locations
   - Include in output JSON

8. **Output** (60 lines)
   - Write `tests/365day-kundali-2026.json`
   - Include metadata (locations, reference, expected errors)
   - Console summary with statistics

### JSON Structure
```json
{
  "metadata": {
    "generated": "2026-06-01T...",
    "dataset_period": "2026-01-01 to 2026-12-31",
    "locations": [
      { "name": "Olympia, WA", "lat": 47.0379, "lon": -122.9007, "tz": "PST/PDT" },
      { "name": "Karur, India", "lat": 11.1408, "lon": 78.1309, "tz": "IST" }
    ]
  },
  "data": [
    {
      "date": "2026-01-01",
      "olympia": {
        "am": { "time_local": "06:00:00", "time_utc": "14:00:00", "lagna": {...}, "grahas": {...}, "bhavas": {...} },
        "pm": {...}
      },
      "karur": {...}
    },
    ...365 entries...
  ],
  "reference_validation": {
    "date": "2026-11-02",
    "olympia_pm": {
      "calculated": { "lagna": "29°20'50\"", "surya": "16°18'22\"", ... },
      "drik_panchang": { "lagna": "29°20'50\"", "surya": "16°18'22\"", ... },
      "errors": { "lagna": "+0.0°", "surya": "+0.1'", ... }
    },
    "karur_pm": {...}
  }
}
```

## Testing & Validation

**Before commit:**
1. Run script: `node tests/generate-365day-kundali.cjs` → check for errors
2. Verify JSON is valid: `cat tests/365day-kundali-2026.json | jq . > /dev/null && echo OK`
3. Spot-check 3 random dates/times for plausibility
4. Compare Nov 2, 2026 calculated vs Drik Panchang reference:
   - Lagna error < 1°
   - Sun error < 2'
   - Moon error < 5'
   - Rahu error < 25'

**Expected file size**: ~15-20 MB (730 entries × ~24 KB each)

## References

- Meeus, Jean. *Astronomical Algorithms*, 2nd ed. (1998)
  - Ch. 7: Julian Day
  - Ch. 12: Obliquity of the Ecliptic
  - Ch. 21: Precession
  - Ch. 22: Nutation
  - Ch. 25: Solar Coordinates (VSOP87, accuracy ~0.005°)
  - Ch. 33: VSOP87 Planetary Theory (truncated series)
  - Ch. 47: Lunar Theory (ELP2000)
- Drik Panchang: https://www.drikpanchang.com/
- Task 0028b: Astronomy Engine vs NOAA comparison (refraction)
- Task 0029a: NOAACalculator wired into PanchangaCalculator
