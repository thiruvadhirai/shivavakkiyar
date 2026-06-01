#!/usr/bin/env node
/**
 * Calculate Karur, Tamil Nadu Sunrise/Sunset Values
 * Using NOAACalculator with Astronomy Engine (Node.js compatible)
 *
 * Location: Karur, Tamil Nadu, India
 * Coordinates: 11.1408°N, 78.1309°E
 * Timezone: Asia/Kolkata (UTC+5:30)
 *
 * Run: node tests/calculate-karur-direct.cjs
 */

const path = require('path');

// Load Astronomy Engine (it supports CommonJS via UMD)
const Astronomy = require('../assets/js/astronomy.browser.js');

// Load NOAACalculator
const NOAACalculator = require('../assets/js/noaa-calculator.js');

// Karur location
const KARUR = {
  name: 'Karur, Tamil Nadu',
  latitude: 11.1408,
  longitude: 78.1309,
  timezone: 'Asia/Kolkata',
  utc_offset: 5.5
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
 * Format time from Date object to HH:MM format
 */
function formatTime(date) {
  if (!date) return 'N/A';
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Main calculation function
 */
async function calculateKarurValues() {
  console.log('╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║        Karur, Tamil Nadu - NOAA Sunrise/Sunset Calculation                ║');
  console.log('║           Using Astronomy Engine + NOAACalculator                         ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════╝');
  console.log();

  console.log(`📍 Location: ${KARUR.name}`);
  console.log(`   Latitude:  ${KARUR.latitude}°N`);
  console.log(`   Longitude: ${KARUR.longitude}°E`);
  console.log(`   Timezone:  ${KARUR.timezone} (UTC+${KARUR.utc_offset})`);
  console.log();

  console.log(`Using:`);
  console.log(`  • Astronomy Engine: VSOP87 ephemeris (JPL-validated)`);
  console.log(`  • NOAACalculator: Atmospheric refraction correction (-0.833° elevation)`);
  console.log();

  // Initialize NOAACalculator
  const noaaCalc = new NOAACalculator(Astronomy);

  console.log('Calculating sunrise/sunset with atmospheric refraction...');
  console.log();

  const results = {};

  for (const testDate of TEST_DATES) {
    console.log(`📅 ${testDate.name}`);
    console.log('─'.repeat(80));

    try {
      // Calculate sunrise with refraction
      const sunriseResult = await noaaCalc.getSunriseWithRefraction(
        testDate.date,
        KARUR.latitude,
        KARUR.longitude
      );

      // Calculate sunset with refraction
      const sunsetResult = await noaaCalc.getSunsetWithRefraction(
        testDate.date,
        KARUR.latitude,
        KARUR.longitude
      );

      if (!sunriseResult || !sunsetResult) {
        console.log('   ⚠️  Could not calculate (polar region edge case)');
        console.log();
        continue;
      }

      const sunriseTime = formatTime(sunriseResult.date);
      const sunsetTime = formatTime(sunsetResult.date);

      console.log(`   Sunrise (IST):      ${sunriseTime}`);
      console.log(`   Sunset (IST):       ${sunsetTime}`);
      console.log();

      console.log(`   Refraction Details:`);
      console.log(`   ├─ Refraction applied: ${sunriseResult.refractionDegrees.toFixed(4)}°`);
      console.log(`   ├─ Refraction in arcmin: ${(sunriseResult.refractionDegrees * 60).toFixed(1)}'`);
      console.log(`   ├─ Sunrise correction:  ${sunriseResult.correctionMinutes.toFixed(1)} minutes`);
      console.log(`   └─ Sunset correction:   ${sunsetResult.correctionMinutes.toFixed(1)} minutes`);
      console.log();

      results[`karur-${testDate.id}`] = {
        sunrise: sunriseTime,
        sunset: sunsetTime
      };

    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      console.log();
    }
  }

  // Output for code entry
  console.log();
  console.log('╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                   DATA FOR CODE ENTRY                                     ║');
  console.log('║        Update tests/run-comparison-analysis.cjs with these values         ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════╝');
  console.log();

  Object.entries(results).forEach(([key, value]) => {
    console.log(`  '${key}': { sunrise: '${value.sunrise}', sunset: '${value.sunset}' },`);
  });
  console.log();

  // Save to JSON
  const fs = require('fs');
  const jsonOutput = {
    location: KARUR,
    method: 'Astronomy Engine (VSOP87) + NOAACalculator (refraction correction)',
    refraction: {
      angle_degrees: -0.833,
      description: '34 arcmin atmospheric refraction + 16 arcmin solar disk radius'
    },
    calculated_timestamp: new Date().toISOString(),
    results: results
  };

  fs.writeFileSync(
    path.join(__dirname, 'karur-calculated-values.json'),
    JSON.stringify(jsonOutput, null, 2)
  );

  console.log(`💾 Results saved to: tests/karur-calculated-values.json`);
  console.log();

  console.log('📊 Expected Latitude-Based Refraction Effect:');
  console.log('─'.repeat(80));
  console.log('Location              Latitude    Expected Effect  Actual Effect');
  console.log('─'.repeat(80));
  console.log('Equator               0.00°N      ~1.5 min');
  console.log('Karur, TN            11.14°N      ~2.0 min         (calculated above)');
  console.log('Bangalore            12.97°N      ~2.2 min');
  console.log('Olympia, WA          47.04°N      ~4.1 min');
  console.log('Tromsø, Norway       69.65°N      ~5.4 min');
  console.log('─'.repeat(80));
  console.log();

  console.log('✅ Calculation complete!');
}

// Run with proper error handling
calculateKarurValues().catch(err => {
  console.error('❌ Calculation failed:', err.message);
  if (err.stack) {
    console.error(err.stack);
  }
  process.exit(1);
});
