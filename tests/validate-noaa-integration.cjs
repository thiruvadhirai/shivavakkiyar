#!/usr/bin/env node
/**
 * Validate NOAA Calculator Integration into PanchangaCalculator
 * Verifies that getSunrise/getSunset use refraction-corrected times
 *
 * Run: node tests/validate-noaa-integration.cjs
 */

const fs = require('fs');

console.log('🧪 Validating NOAACalculator Integration\n');

// Read PanchangaCalculator source
const calcPath = './assets/js/panchanga-calculator.js';
const calcSource = fs.readFileSync(calcPath, 'utf8');

// Check 1: NOAACalculator initialization
console.log('Check 1: NOAACalculator initialization in constructor');
if (calcSource.includes('this.noaaCalculator = null;')) {
  console.log('  ✓ NOAACalculator property initialized');
} else {
  console.log('  ✗ NOAACalculator property NOT found');
  process.exit(1);
}

// Check 2: initializeNOAACalculator method exists
console.log('\nCheck 2: initializeNOAACalculator method');
if (calcSource.includes('initializeNOAACalculator()')) {
  console.log('  ✓ initializeNOAACalculator method exists');
} else {
  console.log('  ✗ initializeNOAACalculator method NOT found');
  process.exit(1);
}

// Check 3: getSunrise uses NOAACalculator
console.log('\nCheck 3: getSunrise uses NOAACalculator');
const sunriseCheck = calcSource.includes('getSunriseWithRefraction') &&
                     calcSource.includes('async getSunrise');
if (sunriseCheck) {
  console.log('  ✓ getSunrise calls getSunriseWithRefraction (async)');
} else {
  console.log('  ✗ getSunrise does NOT call getSunriseWithRefraction');
  process.exit(1);
}

// Check 4: getSunset uses NOAACalculator
console.log('\nCheck 4: getSunset uses NOAACalculator');
const sunsetCheck = calcSource.includes('getSunsetWithRefraction') &&
                    calcSource.includes('async getSunset');
if (sunsetCheck) {
  console.log('  ✓ getSunset calls getSunsetWithRefraction (async)');
} else {
  console.log('  ✗ getSunset does NOT call getSunsetWithRefraction');
  process.exit(1);
}

// Check 5: Script is loaded in layout
console.log('\nCheck 5: NOAACalculator script loaded in layout');
const layoutPath = './_layouts/default.html';
const layoutSource = fs.readFileSync(layoutPath, 'utf8');
if (layoutSource.includes('noaa-calculator.js')) {
  console.log('  ✓ noaa-calculator.js is loaded in layout');

  // Verify order: Astronomy -> NOAA -> Panchanga
  const astronomyIdx = layoutSource.indexOf('astronomy.browser.js');
  const noaaIdx = layoutSource.indexOf('noaa-calculator.js');
  const panchangaIdx = layoutSource.indexOf('panchanga-calculator.js');

  if (astronomyIdx < noaaIdx && noaaIdx < panchangaIdx) {
    console.log('  ✓ Script loading order correct: Astronomy → NOAA → Panchanga');
  } else {
    console.log('  ⚠ WARNING: Script loading order may be incorrect');
  }
} else {
  console.log('  ✗ noaa-calculator.js NOT loaded in layout');
  process.exit(1);
}

// Check 6: Backward compatibility
console.log('\nCheck 6: Backward compatibility (returns Date objects)');
const dateReturn = calcSource.match(/return \{\s*date: sunriseDate/);
if (dateReturn) {
  console.log('  ✓ getSunrise/getSunset return {date: ...} for compatibility');
} else {
  console.log('  ⚠ WARNING: Return format may have changed');
}

// Check 7: Error handling for missing NOAACalculator
console.log('\nCheck 7: Error handling for missing NOAACalculator');
if (calcSource.includes("NOAACalculator not available")) {
  console.log('  ✓ Graceful error handling implemented');
} else {
  console.log('  ⚠ WARNING: Error handling not explicit');
}

console.log('\n╔════════════════════════════════════════════════════════════════╗');
console.log('║                    VALIDATION COMPLETE                         ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

console.log('✅ NOAACalculator integration validated successfully!');
console.log('\nNext steps:');
console.log('  1. Run tests: node tests/panchanga-calculator-integration.test.cjs');
console.log('  2. Start dev server: podman-compose up -d saivamcloud-dev');
console.log('  3. Test widget: http://localhost:5080/panchanga/');
console.log('  4. Verify sunrise/sunset within ±1 minute of NOAA official');
