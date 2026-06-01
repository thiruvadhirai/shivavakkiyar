#!/usr/bin/env node
/**
 * Calculate Karur, Tamil Nadu Sunrise/Sunset Values
 * Using simplified astronomical formulas (NOAA-compatible)
 *
 * Location: Karur, Tamil Nadu, India
 * Coordinates: 11.1408°N, 78.1309°E
 * Timezone: Asia/Kolkata (UTC+5:30)
 *
 * This uses simplified solar position calculations that match NOAA methodology
 * Reference: https://gml.noaa.gov/grad/solcalc/calcdetails.html
 *
 * Run: node tests/calculate-karur-simple.cjs
 */

const fs = require('fs');
const path = require('path');

// Karur location
const KARUR = {
  name: 'Karur, Tamil Nadu',
  latitude: 11.1408,
  longitude: 78.1309,
  timezone: 'Asia/Kolkata',
  utc_offset: 5.5 // hours
};

// Test dates
const TEST_DATES = [
  { id: 'winter', date: new Date(2025, 11, 21), name: 'Winter Solstice (Dec 21, 2025)' },
  { id: 'spring', date: new Date(2026, 2, 20), name: 'Spring Equinox (Mar 20, 2026)' },
  { id: 'summer', date: new Date(2026, 5, 21), name: 'Summer Solstice (Jun 21, 2026)' },
  { id: 'fall', date: new Date(2026, 8, 22), name: 'Fall Equinox (Sep 22, 2026)' },
  { id: 'random', date: new Date(2026, 4, 31), name: 'Random Date (May 31, 2026)' }
];

/**
 * Calculate day of year (1-366)
 */
function getDayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

/**
 * Calculate solar declination (Meeus formula)
 * Simplified calculation for solar position
 */
function calculateDeclination(dayOfYear) {
  // Simplified formula: declination varies from -23.44° to +23.44°
  // This is accurate to within ±0.5°
  const N = dayOfYear;
  const gamma = (2 * Math.PI * (N - 1)) / 365.0;

  const declinationRad =
    0.006918 -
    0.399912 * Math.cos(gamma) + 0.070257 * Math.sin(gamma) -
    0.006758 * Math.cos(2 * gamma) + 0.000907 * Math.sin(2 * gamma) -
    0.002697 * Math.cos(3 * gamma) + 0.00148 * Math.sin(3 * gamma);

  return (declinationRad * 180) / Math.PI; // Convert to degrees
}

/**
 * Calculate hour angle at sunrise/sunset
 * H = -cos⁻¹(-tan(lat) * tan(dec))
 * Negative for sunrise, positive for sunset
 */
function calculateHourAngle(latitude, declination, elevationDegrees = -0.833) {
  const latRad = (latitude * Math.PI) / 180;
  const decRad = (declination * Math.PI) / 180;
  const elRad = (elevationDegrees * Math.PI) / 180;

  const cosH =
    (-Math.sin(elRad) - Math.sin(latRad) * Math.sin(decRad)) /
    (Math.cos(latRad) * Math.cos(decRad));

  // Handle edge cases (e.g., polar regions)
  if (cosH > 1) return null; // Sun below horizon all day
  if (cosH < -1) return null; // Sun above horizon all day

  return Math.acos(cosH) * (180 / Math.PI); // Convert to degrees
}

/**
 * Calculate NOAA-style sunrise/sunset times
 */
function calculateSunriseSunset(date, latitude, longitude, utcOffset) {
  const dayOfYear = getDayOfYear(date);
  const year = date.getFullYear();

  // Calculate solar declination
  const declination = calculateDeclination(dayOfYear);

  // Calculate equation of time (minutes)
  const B = (360 * (dayOfYear - 1)) / 365;
  const Brad = (B * Math.PI) / 180;
  const eot = 229.18 * (
    0.000075 +
    0.001868 * Math.cos(Brad) -
    0.032077 * Math.sin(Brad) -
    0.014615 * Math.cos(2 * Brad) -
    0.040849 * Math.sin(2 * Brad)
  );

  // Calculate hour angle
  const hourAngle = calculateHourAngle(latitude, declination, -0.833); // Standard refraction

  if (hourAngle === null) {
    return { sunrise: null, sunset: null };
  }

  // Solar noon in local solar time
  const solarNoon = 12 - (longitude / 15) - (eot / 60);

  // Sunrise and sunset in local solar time
  const sunriseTime = solarNoon - (hourAngle / 15); // Convert degrees to hours (360° = 24h)
  const sunsetTime = solarNoon + (hourAngle / 15);

  // Convert to UTC-relative hours, then to local time
  const sunriseUTC = sunriseTime - (longitude / 15); // Convert longitude to time
  const sunsetUTC = sunsetTime - (longitude / 15);

  // Convert UTC to local time
  const sunriseLocal = sunriseUTC + utcOffset;
  const sunsetLocal = sunsetUTC + utcOffset;

  // Handle day wraparound
  const sunriseFinal = ((sunriseLocal % 24) + 24) % 24;
  const sunsetFinal = ((sunsetLocal % 24) + 24) % 24;

  // Convert to hours and minutes
  const toTime = (decimalHours) => {
    const h = Math.floor(decimalHours);
    const m = Math.floor((decimalHours - h) * 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  return {
    sunrise: toTime(sunriseFinal),
    sunset: toTime(sunsetFinal),
    sunriseHours: sunriseFinal,
    sunsetHours: sunsetFinal,
    declination: declination,
    hourAngle: hourAngle,
    eot: eot
  };
}

/**
 * Main function
 */
function main() {
  console.log('╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║   Karur, Tamil Nadu - NOAA-Compatible Sunrise/Sunset Calculation         ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════╝');
  console.log();

  console.log(`📍 Location: ${KARUR.name}`);
  console.log(`   Latitude:  ${KARUR.latitude}°N`);
  console.log(`   Longitude: ${KARUR.longitude}°E`);
  console.log(`   Timezone:  ${KARUR.timezone} (UTC+${KARUR.utc_offset})`);
  console.log();

  console.log('Calculating sunrise/sunset with atmospheric refraction (-0.833° elevation)...');
  console.log();

  const results = {};

  for (const testDate of TEST_DATES) {
    console.log(`📅 ${testDate.name}`);
    console.log('─'.repeat(80));

    const result = calculateSunriseSunset(
      testDate.date,
      KARUR.latitude,
      KARUR.longitude,
      KARUR.utc_offset
    );

    if (!result.sunrise || !result.sunset) {
      console.log('   ⚠️  Could not calculate (polar day/night)');
      console.log();
      continue;
    }

    console.log(`   Sunrise (IST): ${result.sunrise}`);
    console.log(`   Sunset  (IST): ${result.sunset}`);
    console.log();
    console.log(`   Technical Details:`);
    console.log(`   ├─ Solar declination: ${result.declination.toFixed(2)}°`);
    console.log(`   ├─ Hour angle (H):    ${result.hourAngle.toFixed(2)}°`);
    console.log(`   └─ Equation of time:  ${result.eot.toFixed(2)} minutes`);
    console.log();

    results[`karur-${testDate.id}`] = {
      sunrise: result.sunrise,
      sunset: result.sunset
    };
  }

  // Output for code entry
  console.log();
  console.log('╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                   DATA FOR CODE ENTRY                                     ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════╝');
  console.log();

  console.log('Update tests/run-comparison-analysis.cjs:');
  console.log();
  Object.entries(results).forEach(([key, value]) => {
    console.log(`  '${key}': { sunrise: '${value.sunrise}', sunset: '${value.sunset}' },`);
  });
  console.log();

  // Save to JSON
  const jsonOutput = {
    location: KARUR,
    method: 'NOAA-compatible simplified astronomical formulas',
    refraction_applied: '-0.833° (atmospheric refraction)',
    calculated_timestamp: new Date().toISOString(),
    results: results
  };

  const outputPath = path.join(__dirname, 'karur-calculated-values.json');
  fs.writeFileSync(outputPath, JSON.stringify(jsonOutput, null, 2));

  console.log(`💾 Results saved to: tests/karur-calculated-values.json`);
  console.log();

  console.log('✅ Calculation complete!');
}

// Run
main();
