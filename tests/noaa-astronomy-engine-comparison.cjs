#!/usr/bin/env node
/**
 * NOAA Calculator vs Astronomy Engine Comparison
 *
 * Compares sunrise/sunset calculations between:
 * 1. NOAACalculator (with Temporal API, atmospheric refraction)
 * 2. Astronomy Engine (current implementation, no refraction)
 *
 * Determines whether to:
 * - Option A: Fix Astronomy Engine by adding refraction
 * - Option B: Replace Astronomy Engine sunrise/sunset with NOAACalculator
 *
 * Run: node tests/noaa-astronomy-engine-comparison.cjs
 */

// Test data: 5 locations × 5 dates = 25 test cases
const TEST_CASES = [
  // Olympia, WA (47°N - temperate)
  { id: 'olympia-winter', location: 'Olympia, WA', lat: 47.0379, lon: -122.9007, date: new Date(2025, 11, 21) },
  { id: 'olympia-spring', location: 'Olympia, WA', lat: 47.0379, lon: -122.9007, date: new Date(2026, 2, 20) },
  { id: 'olympia-summer', location: 'Olympia, WA', lat: 47.0379, lon: -122.9007, date: new Date(2026, 5, 21) },
  { id: 'olympia-fall', location: 'Olympia, WA', lat: 47.0379, lon: -122.9007, date: new Date(2026, 8, 22) },
  { id: 'olympia-random', location: 'Olympia, WA', lat: 47.0379, lon: -122.9007, date: new Date(2026, 4, 31) },

  // Equator (0°N - reference)
  { id: 'equator-winter', location: 'Equator', lat: 0, lon: 0, date: new Date(2025, 11, 21) },
  { id: 'equator-spring', location: 'Equator', lat: 0, lon: 0, date: new Date(2026, 2, 20) },
  { id: 'equator-summer', location: 'Equator', lat: 0, lon: 0, date: new Date(2026, 5, 21) },
  { id: 'equator-fall', location: 'Equator', lat: 0, lon: 0, date: new Date(2026, 8, 22) },
  { id: 'equator-random', location: 'Equator', lat: 0, lon: 0, date: new Date(2026, 4, 31) },

  // High Latitude (70°N - max refraction)
  { id: 'high-lat-winter', location: 'Tromsø, Norway', lat: 69.6492, lon: 18.9553, date: new Date(2025, 11, 21) },
  { id: 'high-lat-spring', location: 'Tromsø, Norway', lat: 69.6492, lon: 18.9553, date: new Date(2026, 2, 20) },
  { id: 'high-lat-summer', location: 'Tromsø, Norway', lat: 69.6492, lon: 18.9553, date: new Date(2026, 5, 21) },
  { id: 'high-lat-fall', location: 'Tromsø, Norway', lat: 69.6492, lon: 18.9553, date: new Date(2026, 8, 22) },
  { id: 'high-lat-random', location: 'Tromsø, Norway', lat: 69.6492, lon: 18.9553, date: new Date(2026, 4, 31) },

  // Sydney (33°S - southern hemisphere)
  { id: 'sydney-winter', location: 'Sydney, Australia', lat: -33.8688, lon: 151.2093, date: new Date(2025, 11, 21) },
  { id: 'sydney-spring', location: 'Sydney, Australia', lat: -33.8688, lon: 151.2093, date: new Date(2026, 2, 20) },
  { id: 'sydney-summer', location: 'Sydney, Australia', lat: -33.8688, lon: 151.2093, date: new Date(2026, 5, 21) },
  { id: 'sydney-fall', location: 'Sydney, Australia', lat: -33.8688, lon: 151.2093, date: new Date(2026, 8, 22) },
  { id: 'sydney-random', location: 'Sydney, Australia', lat: -33.8688, lon: 151.2093, date: new Date(2026, 4, 31) },

  // Additional reference (India)
  { id: 'bangalore-winter', location: 'Bangalore, India', lat: 12.9716, lon: 77.5946, date: new Date(2025, 11, 21) },
  { id: 'bangalore-spring', location: 'Bangalore, India', lat: 12.9716, lon: 77.5946, date: new Date(2026, 2, 20) },
  { id: 'bangalore-summer', location: 'Bangalore, India', lat: 12.9716, lon: 77.5946, date: new Date(2026, 5, 21) },
  { id: 'bangalore-fall', location: 'Bangalore, India', lat: 12.9716, lon: 77.5946, date: new Date(2026, 8, 22) },
  { id: 'bangalore-random', location: 'Bangalore, India', lat: 12.9716, lon: 77.5946, date: new Date(2026, 4, 31) },
];

/**
 * Convert minutes to HH:MM:SS string
 */
function formatTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  const secs = Math.floor((minutes % 1) * 60);
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Calculate difference in minutes between two times
 */
function calculateDifference(time1Str, time2Str) {
  const parse = (str) => {
    const [h, m, s] = str.split(':').map(Number);
    return h * 60 + m + (s || 0) / 60;
  };
  return parse(time1Str) - parse(time2Str);
}

/**
 * Format difference as +X or -X minutes
 */
function formatDifference(minutes) {
  const sign = minutes >= 0 ? '+' : '';
  return `${sign}${minutes.toFixed(1)} min`;
}

console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║  NOAACalculator vs Astronomy Engine Comparison (Task 0028b)   ║');
console.log('╚════════════════════════════════════════════════════════════════╝');
console.log();

console.log('Test Configuration:');
console.log(`  Total test cases: ${TEST_CASES.length}`);
console.log(`  Locations: 5 (Olympia, Equator, High Latitude, Sydney, Bangalore)`);
console.log(`  Dates: 5 (Winter, Spring, Summer, Fall, Random)`);
console.log();

console.log('Comparison Matrix:');
console.log('─'.repeat(120));
console.log(
  'Location'.padEnd(20) +
  'Date'.padEnd(12) +
  'NOAA Sunrise'.padEnd(14) +
  'Astro Sunrise'.padEnd(14) +
  'Difference'.padEnd(12) +
  'NOAA Sunset'.padEnd(12) +
  'Astro Sunset'.padEnd(14) +
  'Difference'.padEnd(12)
);
console.log('─'.repeat(120));

console.log();
console.log('📋 TEST CASE TEMPLATE');
console.log('─'.repeat(120));
console.log();
console.log('For each test case, you need to:');
console.log();
console.log('1. Get NOAA Official Values:');
console.log('   - Visit: https://gml.noaa.gov/grad/solcalc/');
console.log('   - Enter location and date');
console.log('   - Record sunrise and sunset times');
console.log();
console.log('2. Run NOAACalculator:');
console.log('   - Use NOAACalculator class (with Temporal API)');
console.log('   - Record calculated sunrise and sunset');
console.log();
console.log('3. Run Astronomy Engine:');
console.log('   - Use current Astronomy Engine implementation');
console.log('   - Record calculated sunrise and sunset');
console.log();
console.log('4. Calculate Discrepancies:');
console.log('   - NOAA - Astronomy Engine (in minutes)');
console.log();
console.log('5. Analyze:');
console.log('   - If difference ≈ 3-4 minutes → Refraction effect (expected)');
console.log('   - If difference < 1 minute → Acceptable, no fix needed');
console.log('   - If difference > 4 minutes → Investigate other sources');
console.log();

console.log('═'.repeat(120));
console.log();
console.log('DATA COLLECTION RESULTS');
console.log('═'.repeat(120));
console.log();

// This is where you'll populate results from manual testing
const RESULTS_PLACEHOLDER = `
[After running 25 test cases against NOAA official calculator and Astronomy Engine,
populate these results to determine the comparison:]

Test Case: olympia-random (Olympia, WA | 2026-05-31)
┌────────────────────────────────────────┐
│ NOAA Official:    05:21 | 20:58        │
│ Astronomy Engine: 05:24 | 20:54        │
│ Difference:       -3:00 | +4:00 min    │
│ Status:           ❓ NEEDS VALIDATION  │
└────────────────────────────────────────┘

Pattern Analysis (After all 25 tests):
┌────────────────────────────────────────┐
│ Average sunrise difference:   -3.0 min │
│ Average sunset difference:    +4.0 min │
│ Std Dev sunrise:              ±0.5 min │
│ Std Dev sunset:               ±0.8 min │
│ Root cause:                   Unclear  │
│ Recommendation:               ???      │
└────────────────────────────────────────┘
`;

console.log(RESULTS_PLACEHOLDER);

console.log();
console.log('═'.repeat(120));
console.log();
console.log('DECISION FRAMEWORK');
console.log('─'.repeat(120));
console.log();
console.log('After completing all 25 test cases, use this framework to decide:');
console.log();
console.log('IF (avg_difference ≈ ±3-4 minutes) {');
console.log('  Root Cause = Atmospheric Refraction (0.833°)');
console.log('  Decision = OPTION A: Fix Astronomy Engine');
console.log('    - Add refraction correction to Astronomy Engine');
console.log('    - OR: Use NOAACalculator for sunrise/sunset');
console.log('} ELSE IF (avg_difference < ±1 minute) {');
console.log('  Root Cause = Precision/Rounding only');
console.log('  Decision = Acceptable, no fix needed');
console.log('} ELSE {');
console.log('  Root Cause = UNKNOWN (investigate)');
console.log('  Decision = Investigate further');
console.log('}');
console.log();

console.log('═'.repeat(120));
console.log();
console.log('NOTE: This is a placeholder harness.');
console.log('For actual comparison, implement NOAACalculator calls and');
console.log('Astronomy Engine calculations for each test case.');
console.log('Store results in: tests/astronomy-noaa-comparison-results.json');
console.log();
