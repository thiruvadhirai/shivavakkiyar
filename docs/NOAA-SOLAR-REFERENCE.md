# NOAA Solar Calculation Reference

## Overview

The Panchanga Calculator uses sunrise and sunset calculations that must be validated against NOAA Solar Position Calculator for accuracy.

## NOAA Solar Position Calculator

**Website**: https://gml.noaa.gov/grad/solcalc/calcdetails.html

**API**: https://api.weather.gov/
- Endpoint: `/stations?state=WA&limit=500`
- Example: AW082 = Olympia, Washington station

## Scientific Basis

**Source**: "Astronomical Algorithms" by Jean Meeus
- Industry standard for solar and astronomical calculations
- Used by NOAA, NASA, and other governmental agencies
- Highly accurate when properly implemented

## Accuracy Standards

### Tolerance Ranges

| Latitude Range | Tolerance |
|---|---|
| Between +/- 72° | ±1 minute |
| Outside ±72° | ±10 minutes |

**Note**: Olympia, WA is at 47.04°N, which falls within the ±1 minute accuracy range.

### Variability Factors

Observed values may vary from calculations due to:
- Atmospheric composition variations
- Temperature and pressure changes
- Local horizon conditions
- Refraction variations
- Elevation differences

## Test Data Validation

### NOAA Reference Values for Olympia, WA (May 31, 2026)

**Location**: AW082 (Olympia Weather Station)
- Latitude: 47.0379°N
- Longitude: -122.9007°W
- Timezone: America/Los_Angeles (UTC-7)

**Expected Values** (from NOAA Solar Position Calculator):
- Sunrise: 05:21 AM
- Sunset: 08:58 PM
- Solar Noon: 02:10 PM
- Day Length: 15 hours 37 minutes

## Implementation Requirements

1. **Use NOAA Standard Tolerance**: ±1 minute for Olympia
2. **Test Against NOAA Values**: Validate all sunrise/sunset calculations
3. **Document Discrepancies**: Any variance >1 minute must be investigated
4. **Reference Multiple Dates**: Test across multiple dates and locations
5. **Use Temporal Libraries**: Properly handle timezone and date calculations

## Related Resources

- **NOAA Spreadsheets**: Valid for dates 1901-2099
  - Microsoft Excel format
  - OpenOffice compatible
  - Available for direct calculation

- **GitHub Integration**: https://github.com/hebcal/noaa
  - NOAA data integration with calendar calculations
  - Temporal-based calculations

## Test Files

- `tests/integration-test-data.json` - Expected reference values
- `tests/panchanga-calculator-integration.test.js` - Integration test suite
- `assets/js/panchanga-calculator.js` - Implementation to validate

## References

1. Meeus, Jean. "Astronomical Algorithms" (2nd Edition)
2. NOAA Solar Position Calculator: https://gml.noaa.gov/grad/solcalc/
3. NOAA Weather API: https://api.weather.gov/
4. Hebcal NOAA: https://github.com/hebcal/noaa
