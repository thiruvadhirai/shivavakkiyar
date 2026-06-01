# NOAA Calculator Guide

## Overview

The `NOAACalculator` class implements the NOAA standard for sunrise/sunset calculations with atmospheric refraction correction. It works alongside the `Astronomy Engine` to provide accurate, validated solar position calculations.

## Key Differences: Astronomy Engine vs NOAA

| Aspect | Astronomy Engine | NOAA Standard |
|--------|-----------------|---------------|
| **Method** | Geometric horizon calculations | Apparent horizon with refraction |
| **Sunrise/Sunset Definition** | Sun's center at 0° elevation | Sun's upper limb at 0° elevation |
| **Refraction Correction** | None applied | 0.833° (50.2 arcminutes) |
| **Time Accuracy** | Geometric (no refraction) | ±1 min within ±72° latitude |
| **Typical Error** | 3-5 minutes | 0-1 minute |

## Why Atmospheric Refraction Matters

The Earth's atmosphere bends light rays, making the sun appear higher than its geometric position. For sunrise/sunset:

- **Atmosphere bends light ~0.5°** (34 arcminutes)
- **Solar disk adds another ~0.3°** (16 arcminutes)  
- **Total effect: ~0.833°** → shifts sunrise/sunset by **~3-4 minutes**

Without refraction correction, integration tests with ±1 minute tolerance will fail.

## Refraction by Elevation Angle

The NOAA formula has 4 cases depending on solar elevation:

```
┌─────────────────────────────────────────────────────┐
│  Elevation Range    │  Formula                      │
├─────────────────────────────────────────────────────┤
│  h ≥ 85°           │  No refraction (zenith)       │
│  5° ≤ h < 85°      │  Standard NOAA formula        │
│  -0.575° ≤ h < 5°  │  Polynomial (near horizon)    │
│  h < -0.575°       │  Twilight formula             │
└─────────────────────────────────────────────────────┘
```

The elevation angle for standard sunrise/sunset is **-0.833°** (geometric 0° minus refraction).

## Usage

### Basic Usage

```javascript
// Initialize with Astronomy Engine
const noaa = new NOAACalculator(Astronomy);

// Calculate sunrise with refraction correction
const sunrise = await noaa.getSunriseWithRefraction(
  new Date(2026, 4, 31),  // May 31, 2026
  47.0379,                 // Olympia latitude
  -122.9007               // Olympia longitude
);

console.log(noaa.formatResult(sunrise));
// Output: Sunrise: 05:21:00 (correction: -1.5 min, refraction: 50.2 arcmin)

// Calculate sunset with refraction correction
const sunset = await noaa.getSunsetWithRefraction(
  new Date(2026, 4, 31),
  47.0379,
  -122.9007
);

console.log(noaa.formatResult(sunset));
// Output: Sunset: 20:58:00 (correction: +1.5 min, refraction: 50.2 arcmin)
```

### Get Refraction Analysis

```javascript
// Understand refraction at different angles
const analysis = noaa.getRefractionAnalysis(0.833); // Standard sunrise/sunset
console.log(analysis);
/*
{
  elevation: 0.833,
  refraction: 0.38,           // degrees
  refractionArcmin: 22.8,     // arcminutes
  refractionArcsec: 1368,     // arcseconds
  formula: "Case 2: Normal sun...",
  description: "At 0.833° elevation, atmospheric refraction is 22.8 arcminutes"
}
*/

// Analysis for different elevations
console.log(noaa.getRefractionAnalysis(0));    // Geometric horizon
console.log(noaa.getRefractionAnalysis(-6));   // Nautical twilight
console.log(noaa.getRefractionAnalysis(-18));  // Astronomical twilight
```

### Get Atmospheric Refraction Value

```javascript
// Get refraction for a specific elevation
const refraction = noaa.getAtmosphericRefraction(0.833); // degrees
console.log(refraction);  // 0.3800 degrees ≈ 22.8 arcminutes

// Get standard NOAA value
const stdRefr = noaa.getStandardRefractionArcminutes();
console.log(stdRefr);  // 49.98 ≈ 50 arcminutes
```

## Integration with PanchangaCalculator

The `NOAACalculator` is separate from but compatible with `PanchangaCalculator`:

```javascript
// Both use Astronomy Engine, but with different approaches
const calc = new PanchangaCalculator();
const noaa = new NOAACalculator(Astronomy);

await calc.init();

// Astronomy Engine (geometric)
const astroSunrise = await calc.getSunrise(date, lat, lon);

// NOAA standard (with refraction)
const noaaSunrise = await noaa.getSunriseWithRefraction(date, lat, lon);

// Compare
console.log(`Astronomy: ${astroSunrise.timeIST}`);
console.log(`NOAA: ${noaaSunrise.date.toLocaleTimeString()}`);
// Difference: ~3-4 minutes
```

## Mathematical Details

### Standard NOAA Formula (5° ≤ h < 85°)

```
Refraction = (1/3600) * ((58.1/tan(h)) - (0.07/tan³(h)) + (0.000086/tan⁵(h)))
```

Where:
- `h` = solar elevation angle in degrees
- Result in arcseconds (divide by 3600 to get degrees)

### Polynomial Formula (-0.575° ≤ h < 5°)

```
Refraction = (1/3600) * (1735 - 518.2*h + 103.4*h² - 12.79*h³ + 0.711*h⁴)
```

Used near the horizon where the standard formula becomes inaccurate.

### Time Shift Calculation

```
Time Shift (minutes) = Refraction (degrees) × cos(latitude) × 4 (min/degree)
```

For mid-latitudes (like 47°N Olympia), 1° of sun angle ≈ 3.5-4 minutes.

## Accuracy Specifications

From NOAA documentation:

- **Within ±72° latitude**: ±1 minute accuracy
- **Outside ±72° latitude**: ±10 minutes accuracy
- **Caveat**: Atmospheric conditions (temperature, pressure, composition) affect observed values
- **Our use**: ±1 minute tolerance for integration tests (well within spec)

## References

1. **NOAA Solar Calculation Details**  
   https://gml.noaa.gov/grad/solcalc/calcdetails.html

2. **NOAA Online Solar Calculator**  
   https://gml.noaa.gov/grad/solcalc/
   - Use for manual validation

3. **Astronomical Algorithms, 2nd Edition**  
   Jean Meeus (1998)
   - Theoretical foundation for formulas

4. **Integration Test Data**  
   File: `tests/integration-test-data.json`
   - Contains verified NOAA values for comparison

## Testing

See `tests/panchanga-calculator-integration.test.js` for integration test examples that use NOAA reference values.

Run tests:
```bash
./scripts/feature-workflow.sh test
```

## Common Pitfalls

1. **Forgetting that sunrise/sunset elevation is -0.833°, not 0°**
   - Geometric horizon is 0°
   - Apparent horizon (NOAA) is -0.833° due to refraction

2. **Mixing geometric and apparent times**
   - Always apply refraction correction consistently
   - Don't apply refraction twice

3. **Using wrong units**
   - Formulas work in degrees (not radians, not arcminutes)
   - Results from formulas are in arcseconds (divide by 3600)

4. **Assuming constant refraction**
   - Refraction varies with elevation angle
   - Use appropriate formula case for the angle

## Advanced: Custom Elevation Angles

For twilight calculations or other custom elevations:

```javascript
// Civil twilight (sun 6° below horizon)
const civil = noaa.getAtmosphericRefraction(-6);
console.log(`Civil twilight refraction: ${(civil * 60).toFixed(1)} arcminutes`);

// Nautical twilight (sun 12° below horizon)
const nautical = noaa.getAtmosphericRefraction(-12);

// Custom elevation
const custom = noaa.getAtmosphericRefraction(-8.5);
const analysis = noaa.getRefractionAnalysis(-8.5);
console.log(analysis);
```

## See Also

- `assets/js/noaa-calculator.js` - Implementation
- `docs/calculator-spec.md` - Full calculator specification
- `tasks/0027a-sunrise-sunset-noaa-integration.md` - Task specification
