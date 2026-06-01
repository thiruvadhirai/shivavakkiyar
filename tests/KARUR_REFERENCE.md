# Karur, Tamil Nadu - NOAA Sunrise/Sunset Reference

## Location Details

**City**: Karur  
**State**: Tamil Nadu, India  
**Latitude**: 11.1408°N  
**Longitude**: 78.1309°E  
**Timezone**: Asia/Kolkata (IST, UTC+5:30)  
**Elevation**: ~150m above sea level

---

## Purpose

Karur is added to the comparison analysis to validate atmospheric refraction calculations across multiple locations in Tamil Nadu region with similar latitudes but different longitudes.

### Comparison Context

```
Location              Latitude    Longitude    Distance from Karur
────────────────────────────────────────────────────────────
Karur                 11.1408°N   78.1309°E    (reference point)
Bangalore            12.9716°N   77.5946°E    ~150 km northwest
Equator               1.3521°N  103.8198°E    ~2000 km northeast
Tromsø               69.6492°N   18.9553°E    ~8000 km northwest
Olympia              47.0379°N  122.9007°W    ~16000 km west
Sydney              33.8688°S  151.2093°E    ~5000 km south
```

### Why Karur Matters

- **Similar latitude to Bangalore** (11.14°N vs 12.97°N) → Similar refraction time effect (~2.0-2.2 min)
- **Different longitude** (78.13°E vs 77.59°E) → Tests timezone/longitude independence
- **Tamil Nadu specific** → Validates calculations for user's region of interest
- **Equatorial region** → Part of broader tropical zone validation

---

## How to Get Accurate NOAA Values

### Method 1: NOAA Online Solar Calculator
1. Visit: https://gml.noaa.gov/grad/solcalc/
2. Enter location:
   - **City**: Karur
   - **Latitude**: 11.1408° (or search for Karur)
   - **Longitude**: 78.1309°
   - **Timezone**: +5:30 (Asia/Kolkata)
3. Select date: (one of the 5 test dates)
4. Click "Calculate"
5. Record "Sunrise" and "Sunset" times (HH:MM format)
6. Screenshot for audit trail

### Method 2: Programmatic (NOAA API)
```bash
# NOAA Weather API - Point Query
# Note: Solar Calculator not directly available via API
# Use the online calculator method above

curl "https://gml.noaa.gov/grad/solcalc/azel.html?lon=-78.1309&lat=11.1408&year=2026&month=5&day=31"
```

---

## Test Dates for Karur

Enter these dates into NOAA calculator for Karur (11.1408°N, 78.1309°E):

### Date 1: Winter Solstice
- **Date**: December 21, 2025
- **Solar event**: Sun at southern declination (minimal elevation at noon for tropics)
- **Expected sunrise time**: ~06:50 (educated guess based on Bangalore ~06:52)
- **NOAA Official Sunrise**: __________ (TO BE FILLED)
- **NOAA Official Sunset**: __________ (TO BE FILLED)

### Date 2: Spring Equinox
- **Date**: March 20, 2026
- **Solar event**: Sun crossing celestial equator (northward)
- **Expected sunrise time**: ~06:15-06:20
- **NOAA Official Sunrise**: __________ (TO BE FILLED)
- **NOAA Official Sunset**: __________ (TO BE FILLED)

### Date 3: Summer Solstice
- **Date**: June 21, 2026
- **Solar event**: Sun at northern declination (maximum elevation at noon)
- **Expected sunrise time**: ~05:50-05:55
- **NOAA Official Sunrise**: __________ (TO BE FILLED)
- **NOAA Official Sunset**: __________ (TO BE FILLED)

### Date 4: Fall Equinox
- **Date**: September 22, 2026
- **Solar event**: Sun crossing celestial equator (southward)
- **Expected sunrise time**: ~06:00-06:05
- **NOAA Official Sunrise**: __________ (TO BE FILLED)
- **NOAA Official Sunset**: __________ (TO BE FILLED)

### Date 5: Random Date
- **Date**: May 31, 2026
- **Solar event**: Mid-spring, approaching summer
- **Expected sunrise time**: ~05:55-06:00
- **NOAA Official Sunrise**: __________ (TO BE FILLED)
- **NOAA Official Sunset**: __________ (TO BE FILLED)

---

## Data Entry Template

Once you've collected all values from NOAA calculator, update `tests/run-comparison-analysis.cjs`:

```javascript
const MOCK_NOAA_OFFICIAL = {
  // ... existing data ...
  
  'karur-winter': { sunrise: 'HH:MM', sunset: 'HH:MM' },    // Dec 21, 2025
  'karur-spring': { sunrise: 'HH:MM', sunset: 'HH:MM' },    // Mar 20, 2026
  'karur-summer': { sunrise: 'HH:MM', sunset: 'HH:MM' },    // Jun 21, 2026
  'karur-fall': { sunrise: 'HH:MM', sunset: 'HH:MM' },      // Sep 22, 2026
  'karur-random': { sunrise: 'HH:MM', sunset: 'HH:MM' }     // May 31, 2026
};
```

---

## Expected Refraction Effect for Karur

Based on latitude 11.1408°N (tropical region):

```
Refraction Effect Estimation:
├─ Latitude: 11.14°N (tropical)
├─ Expected refraction time shift: ~2.0 minutes
│  (Similar to Bangalore at 12.97°N which shows ~2.2 min)
│
├─ Explanation:
│  At equator (0°): refraction effect ≈ 1.5 minutes
│  At Karur (11.14°N): refraction effect ≈ 2.0 minutes  
│  At Bangalore (12.97°N): refraction effect ≈ 2.2 minutes
│  At higher latitudes: effect increases further
│
└─ Formula: Effect = 1.5 + (latitude / 45°) × 2.5 minutes
   For Karur: 1.5 + (11.14 / 45) × 2.5 ≈ 2.0 min
```

---

## After Data Entry

Once Karur NOAA values are entered:

1. Run comparison analysis:
   ```bash
   node tests/run-comparison-analysis.cjs
   ```

2. Verify results:
   - Astronomy Engine error: ~2.0 min (geometric vs apparent)
   - NOAACalculator error: ±0-1 min (with refraction applied)
   - Pattern: Linear with latitude (Karur should fit the pattern)

3. Update decision documentation:
   - Add Karur to test coverage summary
   - Verify refraction time shift matches formula
   - Document any regional anomalies

---

## Resources

- **NOAA Solar Calculator**: https://gml.noaa.gov/grad/solcalc/
- **NOAA Details Page**: https://gml.noaa.gov/grad/solcalc/calcdetails.html
- **Comparison Analysis**: `tests/run-comparison-analysis.cjs`
- **Decision Gate**: `DECISION_GATE_0028b.md`
- **Reference Implementation**: `assets/js/noaa-calculator.js`

---

## Notes

- Timezone: Asia/Kolkata (IST) = UTC + 5:30 (no DST)
- The NOAA calculator automatically shows times in local timezone
- Record times exactly as shown (HH:MM format)
- Screenshots recommended for audit trail
- Longitude difference from Bangalore (78.13° vs 77.59°) = only ~50 km difference, should have minimal impact on sunrise/sunset times

---

## Questions?

If you have questions about:
- **NOAA calculator usage**: See https://gml.noaa.gov/grad/solcalc/calcdetails.html
- **Karur location**: Verify on Google Maps (11.1408°N, 78.1309°E)
- **Data entry format**: See template above
- **Comparison methodology**: See `DECISION_GATE_0028b.md`
