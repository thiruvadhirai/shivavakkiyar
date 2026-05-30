# Panchanga Calculator API Specification

This document defines the contract for the `PanchangaCalculator` class and location management. Use as the authoritative reference for function signatures, return shapes, cache formats, and breaking changes.

---

## Class: PanchangaCalculator

Location: `assets/js/panchanga-calculator.js`

### Constructor

```javascript
const calculator = new PanchangaCalculator();
await calculator.init();  // Initialize Astronomy Engine (optional)
```

---

## Core Calculation Methods

### `async calculateFullPanchanga(date, latitude, longitude)`

**Complete panchanga calculation for a given date and location.**

**Parameters:**
- `date` (Date) — JavaScript Date object (any timezone, will be converted to local)
- `latitude` (number) — Geographic latitude in degrees (-90 to 90, negative = south)
- `longitude` (number) — Geographic longitude in degrees (-180 to 180, negative = west)

**Returns:** Promise resolving to panchanga object:
```javascript
{
  date: Date,                    // The input date
  location: {
    latitude: number,
    longitude: number,
    timezone: string             // IANA timezone (e.g., "America/Los_Angeles")
  },
  ayanamsa: number,              // Drik Ayanamsa in degrees (~24.14° for 2026)
  sunrise: { hours, minutes },   // Local time
  sunset: { hours, minutes },    // Local time
  tithi: {
    name: string,                // "Ashwini", "Bharani", etc.
    number: 1-30,
    phase: string,               // "Shukla" (waxing) or "Krishna" (waning)
    percent: number              // 0-100, completion of this tithi
  },
  nakshatra: {
    name: string,                // "Ashwini", "Bharani", etc.
    tamil: string,               // Tamil transliteration
    number: 1-27,
    degree: number,              // Moon's exact degree (0-360)
    percent: number              // 0-100, completion of this nakshatra
  },
  yoga: {
    name: string,                // "Vishkumbha", "Preeti", etc.
    number: 1-27
  },
  karana: {
    name: string,                // "Bava", "Balava", etc.
    number: 1-60
  },
  hora: {
    planet: string,              // "Sun", "Moon", "Mars", etc. (7 planets)
    number: 1-24
  },
  rahuKalam: {
    startTime: string,           // "HH:MM IST"
    endTime: string,             // "HH:MM IST"
    duration: 90                 // minutes (fixed)
  },
  abhijitMuhurta: {
    startTime: string,           // "HH:MM IST"
    endTime: string,             // "HH:MM IST"
    duration: 48                 // minutes (fixed)
  },
  pradosha: {
    date: Date,                  // Next Pradosha date
    tithi: 13 | 28,              // Always 13th or 28th
    startTime: string,           // "HH:MM IST"
    endTime: string,             // "HH:MM IST"
    duration: 180                // minutes (3 hours)
  }
}
```

**Error Behavior:**
- May throw if `date` is invalid
- May throw if timezone detection fails
- Returns object with `undefined` fields if Astronomy Engine unavailable (fallback mode)
- Any field may be `undefined` — caller must use optional chaining

**Examples:**
```javascript
// Valid usage
const panchanga = await calculator.calculateFullPanchanga(
  new Date(2026, 4, 29),  // May 29, 2026
  13.0827,                 // Chennai latitude
  80.2707                  // Chennai longitude
);

// Safe access
const tithi = panchanga?.tithi?.name ?? 'N/A';
const phase = panchanga?.tithi?.phase?.toUpperCase?.() ?? 'UNKNOWN';
```

---

### `async findNextPradosha(startDate, latitude, longitude, maxSearch=60)`

**Find the next 3 Pradosha dates from a start date.**

**Parameters:**
- `startDate` (Date) — Starting date for search
- `latitude` (number) — Geographic latitude
- `longitude` (number) — Geographic longitude
- `maxSearch` (number, optional) — Max days to search (default 60)

**Returns:** Promise resolving to array of 3 Pradosha objects:
```javascript
[
  {
    date: Date,           // Pradosha date
    tithi: 13 | 28,       // 13th or 28th lunar day
    pradoshaStart: string, // "HH:MM IST"
    pradoshaEnd: string,   // "HH:MM IST"
  },
  // ... 2 more items
]
```

**Error Behavior:**
- May return fewer than 3 Pradosha dates if `maxSearch` is too short
- Any field may be `undefined` — use optional chaining

**Examples:**
```javascript
const pradoshas = await calculator.findNextPradosha(
  new Date(2026, 4, 29),
  13.0827,
  80.2707
);

// Safe access
pradoshas.forEach((p, idx) => {
  const date = p?.date?.toLocaleDateString?.() ?? 'N/A';
  const start = p?.pradoshaStart ?? '--:--';
  console.log(`Pradosha ${idx + 1}: ${date} @ ${start}`);
});
```

---

## Intermediate Calculation Methods

### `async getSunLongitude(date, latitude, longitude)`

**Get the Sun's ecliptic longitude in sidereal coordinates.**

**Returns:** Promise resolving to number (0-360 degrees)

**Note:** Uses Astronomy Engine if available, falls back to approximate formula (~1°/day motion)

---

### `async getMoonLongitude(date, latitude, longitude)`

**Get the Moon's ecliptic longitude in sidereal coordinates.**

**Returns:** Promise resolving to number (0-360 degrees)

**Note:** Uses Astronomy Engine if available, falls back to approximate formula (~13°/day motion)

---

### `getDrikAyanamsa(date)`

**Get the Drik Ayanamsa (precession correction) for a given date.**

**Returns:** number in degrees

**Formula:**
```
Base (at J2000, 2000-01-01): 23.856389°
Increase per year: ~0.01391°/year
Example: 2026 (~26 years after 2000) ≈ 23.856 + (26 × 0.01391) ≈ 24.22°
```

**Examples:**
```javascript
const ayanamsa2000 = calculator.getDrikAyanamsa(new Date(2000, 0, 1));
// ≈ 23.856389°

const ayanamsa2026 = calculator.getDrikAyanamsa(new Date(2026, 4, 29));
// ≈ 24.22°
```

---

### `calculateTithi(sunLongitude, moonLongitude)`

**Calculate tithi (lunar day) from Sun and Moon longitudes.**

**Parameters:**
- `sunLongitude` (number) — Sun's longitude in degrees
- `moonLongitude` (number) — Moon's longitude in degrees

**Returns:** object:
```javascript
{
  name: string,                     // "Ashwini", "Bharani", etc. (30 names)
  number: 1-30,
  phase: "Shukla" | "Krishna",      // Waxing or waning
  percent: number                   // 0-100, progress through this tithi
}
```

**Formula:**
- Tithi = `(moonLong - sunLong) / 12°`, clamped to 1-30
- Phase: "Shukla" if tithi <= 15, else "Krishna"

**Breaking Changes (these would break 85+ tests):**
- Changing return object structure (e.g., `phase` → `phaseName`)
- Changing phase names ("Waxing" instead of "Shukla")
- Changing number range (e.g., 0-29 instead of 1-30)

---

### `calculateNakshatra(moonLongitude)`

**Calculate nakshatra (lunar mansion) from Moon's longitude.**

**Parameters:**
- `moonLongitude` (number) — Moon's longitude in degrees

**Returns:** object:
```javascript
{
  name: string,        // "Ashwini", "Bharani", ... (27 names)
  tamil: string,       // "அஶ்வினி", etc.
  number: 1-27,
  degree: number,      // Moon's exact position within nakshatra (0-13.33°)
  percent: number      // 0-100, progress through this nakshatra
}
```

**Formula:**
- Nakshatra = `moonLong / 13.33°`, normalized to 1-27

**Breaking Changes:**
- Removing Tamil names
- Changing number range or order of the 27 nakshatras
- Changing degree calculation

---

### `calculateYoga(sunLongitude, moonLongitude)`

**Calculate yoga (auspicious combination) from Sun and Moon longitudes.**

**Parameters:**
- `sunLongitude` (number) — Sun's longitude
- `moonLongitude` (number) — Moon's longitude

**Returns:** object:
```javascript
{
  name: string,      // "Vishkumbha", "Preeti", ... (27 names)
  number: 1-27
}
```

**Formula:**
- Yoga = `(sunLong + moonLong) / 13.33°`, normalized to 1-27

---

### `calculateKarana(tithiNumber)`

**Calculate karana (half-tithi) from tithi number.**

**Parameters:**
- `tithiNumber` (number) — Tithi number (1-30)

**Returns:** object:
```javascript
{
  name: string,      // "Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti" (repeating pattern)
  number: 1-60       // Total 60 karanas (8 unique names, 1 Vishti)
}
```

**Formula:**
- Each tithi has 2 karanas (except last)
- Total: 30 tithis × 2 = 60 karanas
- Names cycle in fixed pattern

**Breaking Changes:**
- Changing karana names
- Changing the 60-count structure

---

## Astronomy Engine API Contract

### Working Functions (✅ Use These)

- `Astronomy.Equator(body, date, observer, bool, bool)` — Get equatorial coordinates ✅
  - Parameters: body ("Sun", "Moon"), date (Date), observer (Astronomy.Observer), bool, bool
  - Returns: object with `x`, `y`, `z` coordinates

- `Astronomy.SearchRiseSet(body, observer, direction, date, days)` — Find rise/set times ✅
  - Parameters: body, observer, direction (1 for rise, -1 for set), date, days
  - Returns: Date object of rise/set event

### Broken/Unreliable Functions (❌ Avoid These)

- `Astronomy.GeoVector(body, date, bool)` — Parameter issues ❌
- `Astronomy.EclipticLongitude(body, date)` — Requires HelioVector ❌
- Direct ecliptic longitude calculation — use fallback formulas instead ❌

---

## Cache Contract (localStorage)

### Cache Keys (CANNOT CHANGE without migration)

**Location Storage Key:** `panchanga_location`
```javascript
{
  name: string,        // e.g., "Chennai, Tamil Nadu, India"
  latitude: number,
  longitude: number,
  timestamp: number    // milliseconds since epoch
}

// Expiry: 30 days
// Checked by: LocationManager.getStoredLocation()
```

**Geocoding Results Cache Key:** `panchanga_geocoding_cache`
```javascript
{
  "chennai": [         // query as key
    {
      name: string,
      latitude: number,
      longitude: number
    },
    // ... more results
  ],
  "new york": [...],
  // ... other queries
}

// Expiry: indefinite (location names don't change)
// Checked by: LocationManager.getCachedLocation(query)
```

**Breaking Changes (data migration required):**
- Renaming these keys (users' cached locations are lost)
- Changing the object structure (`{name, lat, lon}` → something else)
- Changing expiry logic (30 days → different)

---

## Calculation Accuracy Guarantee

### What's Guaranteed

- Tithi, Nakshatra, Yoga, Karana calculations match traditional panchang systems (within observational variation)
- Sunrise/Sunset: ±5 minutes accuracy (depends on Astronomy Engine)
- Rahu Kalam: 90-minute window, position varies by weekday (correct formula)
- Abhijit Muhurta: 48-minute window centered on noon

### What's Approximate (Fallback Mode)

- Sun motion: assumed ~0.9856°/day (linear approximation)
- Moon motion: assumed ~13.18°/day (mean motion, not true motion)
- Accuracy: ±30 minutes for panchanga purposes
- Used when Astronomy Engine unavailable or fails

### What Can Vary

- Different ayanamsa systems give different results (this project uses Drik, ~0.3° difference from Lahiri)
- Different timezone handling (DST, UTC offset)
- Rounding in intermediate calculations

---

## Error Handling

### Expected Errors

```javascript
// Invalid date
new Date('invalid')  // → Date is Invalid → throws in calculation

// Invalid coordinates
calculateFullPanchanga(date, 91, 0)  // latitude > 90 → may throw or return undefined fields

// Timezone detection failure
new Date() with longitude that has no timezone mapping → throws
```

### Graceful Degradation

```javascript
// Astronomy Engine unavailable
// → Fallback formulas used
// → Results less accurate but functional
// → No error thrown

// Partial failure
// → Some fields undefined
// → Other fields populated with calculated values
// → Caller must use optional chaining
```

---

## Testing This Spec

Unit tests in `tests/panchanga-calculator.test.js`:
- ✅ All 15 unit tests verify function signatures and return shapes
- ✅ Integration tests verify accuracy against known panchang values
- ✅ Edge cases (poles, date line, leap years)

If unit tests fail, the spec has been violated.

---

## Before Modifying

When editing `panchanga-calculator.js`:

1. **Check return shapes:** Did you change what a function returns? 85 tests + 2 widgets break.
2. **Check function signatures:** Did you add/remove/rename parameters? Test updates needed.
3. **Check cache keys:** Did you rename a localStorage key? User caches lost on next version.
4. **Check numeric ranges:** Tithi is 1-30, Nakshatra is 1-27, Karana is 1-60 — don't change.
5. **Run tests:** `podman exec saivamcloud-test npm test` (85 tests must pass)

---

## References

- Drik Ayanamsa system: https://en.wikipedia.org/wiki/Ayanamsa
- Panchanga elements: https://en.wikipedia.org/wiki/Panchang
- Tithi calculation: Traditional formula based on lunar month (29.53 days)
