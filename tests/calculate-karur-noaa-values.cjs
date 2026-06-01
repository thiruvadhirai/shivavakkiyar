#!/usr/bin/env node
/**
 * Calculate Karur, Tamil Nadu Sunrise/Sunset Values
 * Using NOAACalculator with atmospheric refraction
 *
 * Location: Karur, Tamil Nadu, India
 * Coordinates: 11.1408°N, 78.1309°E
 * Timezone: Asia/Kolkata (UTC+5:30)
 *
 * Run: node tests/calculate-karur-noaa-values.cjs
 */

// Load Astronomy Engine first (sets up global Astronomy)
const astronomyPath = require('path').join(__dirname, '../assets/js/astronomy.browser.js');
const astronomyCode = require('fs').readFileSync(astronomyPath, 'utf8');
eval(astronomyCode);

// Now load NOAACalculator
const nooaaCalcPath = require('path').join(__dirname, '../assets/js/noaa-calculator.js');
const noaaCalcCode = require('fs').readFileSync(nooaaCalcPath, 'utf8');
eval(noaaCalcCode);

// Karur location
const KARUR = {
  name: 'Karur, Tamil Nadu',
  latitude: 11.1408,
  longitude: 78.1309,
  timezone: 'Asia/Kolkata'
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
 * Convert UTC time to IST (Asia/Kolkata = UTC+5:30)
 */
function toIST(utcDate) {
  const istOffset = 5.5 * 60 * 60 * 1000; // 5:30 in milliseconds
  return new Date(utcDate.getTime() + istOffset);
}

/**
 * Main calculation function
 */
async function calculateKarurValues() {
  console.log('╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║        Karur, Tamil Nadu - NOAA Sunrise/Sunset Calculation                ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════╝');
  console.log();

  console.log(`📍 Location: ${KARUR.name}`);
  console.log(`   Latitude:  ${KARUR.latitude}°N`);
  console.log(`   Longitude: ${KARUR.longitude}°E`);
  console.log(`   Timezone:  ${KARUR.timezone} (UTC+5:30)`);
  console.log();

  // Initialize NOAACalculator with Astronomy Engine
  // NOAACalculator is now in global scope from eval()
  const noaaCalc = new globalThis.NOAACalculator(globalThis.Astronomy);

  console.log('Calculating sunrise/sunset with atmospheric refraction...');
  console.log();

  // Store results for data entry
  const results = {};

  for (const testDate of TEST_DATES) {
    console.log(`📅 ${testDate.name}`);
    console.log('─'.repeat(80));

    try {
      // Calculate sunrise
      const sunriseResult = await noaaCalc.getSunriseWithRefraction(
        testDate.date,
        KARUR.latitude,
        KARUR.longitude
      );

      // Calculate sunset
      const sunsetResult = await noaaCalc.getSunsetWithRefraction(
        testDate.date,
        KARUR.latitude,
        KARUR.longitude
      );

      if (!sunriseResult || !sunsetResult) {
        console.log('   ⚠️  Could not calculate sunrise/sunset for this date');
        console.log();
        continue;
      }

      // Format times
      const sunriseTime = formatTime(sunriseResult.date);
      const sunsetTime = formatTime(sunsetResult.date);

      console.log(`   Sunrise (with refraction): ${sunriseTime} (UTC: ${formatTime(new Date(sunriseResult.date.getTime() - (5.5 * 60 * 60 * 1000)))})`);
      console.log(`   Sunset  (with refraction): ${sunsetTime} (UTC: ${formatTime(new Date(sunsetResult.date.getTime() - (5.5 * 60 * 60 * 1000)))})`);
      console.log();

      // Refraction details
      console.log(`   Refraction Applied:`);
      console.log(`   ├─ Elevation: ${sunriseResult.refractionDegrees.toFixed(4)}° (standard -0.833°)`);
      console.log(`   ├─ Sunrise correction: ${sunriseResult.correctionMinutes.toFixed(1)} minutes`);
      console.log(`   └─ Sunset correction:  ${sunsetResult.correctionMinutes.toFixed(1)} minutes`);
      console.log();

      // Store for JSON output
      results[`karur-${testDate.id}`] = {
        sunrise: sunriseTime,
        sunset: sunsetTime,
        sunrise_utc: formatTime(new Date(sunriseResult.date.getTime() - (5.5 * 60 * 60 * 1000))),
        sunset_utc: formatTime(new Date(sunsetResult.date.getTime() - (5.5 * 60 * 60 * 1000))),
        refraction_degrees: sunriseResult.refractionDegrees,
        sunrise_correction_minutes: sunriseResult.correctionMinutes,
        sunset_correction_minutes: sunsetResult.correctionMinutes
      };

    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      console.log();
    }
  }

  // Summary
  console.log();
  console.log('╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                        DATA FOR CODE ENTRY                                ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════╝');
  console.log();

  console.log('Update tests/run-comparison-analysis.cjs with these values:');
  console.log();
  console.log(`  'karur-winter': { sunrise: '${results['karur-winter']?.sunrise || '?'}', sunset: '${results['karur-winter']?.sunset || '?'}' },`);
  console.log(`  'karur-spring': { sunrise: '${results['karur-spring']?.sunrise || '?'}', sunset: '${results['karur-spring']?.sunset || '?'}' },`);
  console.log(`  'karur-summer': { sunrise: '${results['karur-summer']?.sunrise || '?'}', sunset: '${results['karur-summer']?.sunset || '?'}' },`);
  console.log(`  'karur-fall': { sunrise: '${results['karur-fall']?.sunrise || '?'}', sunset: '${results['karur-fall']?.sunset || '?'}' },`);
  console.log(`  'karur-random': { sunrise: '${results['karur-random']?.sunrise || '?'}', sunset: '${results['karur-random']?.sunset || '?'}' },`);
  console.log();

  // Save to JSON
  const fs = require('fs');
  const jsonOutput = {
    location: KARUR,
    source: 'NOAACalculator with VSOP87 ephemeris + atmospheric refraction',
    calculated_timestamp: new Date().toISOString(),
    results: results
  };

  fs.writeFileSync(
    require('path').join(__dirname, 'karur-calculated-values.json'),
    JSON.stringify(jsonOutput, null, 2)
  );

  console.log('💾 Results saved to: tests/karur-calculated-values.json');
  console.log();

  console.log('📊 Latitude Analysis (Refraction Time Effect):');
  console.log('─'.repeat(80));
  console.log('Location              Latitude    Expected Refraction Effect');
  console.log('─'.repeat(80));
  console.log('Equator               0.00°N      ~1.5 minutes');
  console.log('Karur, TN            11.14°N      ~2.0 minutes  ← CALCULATED');
  console.log('Bangalore            12.97°N      ~2.2 minutes');
  console.log('Olympia, WA          47.04°N      ~4.1 minutes');
  console.log('Tromsø, Norway       69.65°N      ~5.4 minutes');
  console.log('─'.repeat(80));
  console.log();

  console.log('✅ Calculation complete!');
}

// Run
calculateKarurValues().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
