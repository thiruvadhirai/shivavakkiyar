/**
 * Integration Tests for Panchanga Calculator
 * Tests the actual implementation with real data and browser APIs
 * Run with: node tests/integration.test.js
 */

// Mock Astronomy Engine (since we can't load it in Node)
global.Astronomy = {
  SearchSunLongitude: () => {
    throw new Error('SearchSunLongitude: Not available in test environment');
  },
  SearchMoonLongitude: () => {
    throw new Error('SearchMoonLongitude: Not available in test environment');
  }
};

// Mock localStorage
global.localStorage = {
  data: {},
  getItem(key) {
    return this.data[key] || null;
  },
  setItem(key, value) {
    this.data[key] = value;
  },
  removeItem(key) {
    delete this.data[key];
  },
  clear() {
    this.data = {};
  }
};

// Load the actual implementation
const fs = require('fs');
const path = require('path');

// Read panchanga-calculator.js and location-manager.js
const panchangaCode = fs.readFileSync(
  path.join(__dirname, '../assets/js/panchanga-calculator.js'),
  'utf8'
);
const locationCode = fs.readFileSync(
  path.join(__dirname, '../assets/js/location-manager.js'),
  'utf8'
);

// Execute the code
eval(panchangaCode);
eval(locationCode);

// ============================================================
// TEST SUITE
// ============================================================

let testsPassed = 0;
let testsFailed = 0;
const failures = [];

function assert(condition, message) {
  if (!condition) {
    testsFailed++;
    failures.push(`❌ ${message}`);
    console.error(`  ❌ ${message}`);
  } else {
    testsPassed++;
    console.log(`  ✓ ${message}`);
  }
}

function describe(name) {
  console.log(`\n${name}`);
  console.log('─'.repeat(60));
}

// ============================================================
// PANCHANGA CALCULATOR TESTS
// ============================================================

describe('PanchangaCalculator - Initialization & Utilities');

const calc = new PanchangaCalculator();

// Test 1: Initialization
assert(calc instanceof PanchangaCalculator, 'Creates PanchangaCalculator instance');
assert(calc.initialized === false, 'Starts uninitialized');
assert(calc.DRIK_AYANAMSA_2000 === 23.856389, 'Drik Ayanamsa J2000 value correct');
assert(typeof calc.J2000_DATE === 'object', 'J2000 epoch date defined');

// Test 2: Utility functions
const testDate = new Date(2026, 4, 28); // May 28, 2026
const dayOfYear = calc.getDayOfYear(testDate);
assert(dayOfYear >= 1 && dayOfYear <= 366, `getDayOfYear returns valid value (${dayOfYear})`);

// Test 3: Julian Date calculation
const jd = calc.getJulianDate(testDate);
assert(jd > 2400000, 'getJulianDate returns valid Julian Date');

// Test 4: Degree normalization
assert(calc.normalizeDegrees(370) === 10, 'Normalizes 370° to 10°');
assert(calc.normalizeDegrees(-10) === 350, 'Normalizes -10° to 350°');
assert(calc.normalizeDegrees(45) === 45, 'Keeps valid degree 45° unchanged');

// Test 5: Drik Ayanamsa calculation
describe('PanchangaCalculator - Drik Ayanamsa');

const ayanamsa2000 = calc.getDrikAyanamsa(new Date(2000, 0, 1, 12, 0, 0));
assert(Math.abs(ayanamsa2000 - 23.856389) < 0.01, `Ayanamsa at J2000 correct (${ayanamsa2000.toFixed(2)}°)`);

const ayanamsa2026 = calc.getDrikAyanamsa(testDate);
assert(ayanamsa2026 > 24.1, `Ayanamsa in 2026 increased (~${ayanamsa2026.toFixed(2)}°)`);
assert(ayanamsa2026 < 24.3, `Ayanamsa in 2026 reasonable (~${ayanamsa2026.toFixed(2)}°)`);

// Test 6: Tithi calculation
describe('PanchangaCalculator - Tithi Calculation');

// Test various moon-sun angles
const tithi1 = calc.calculateTithi(0, 10);  // 10° moon-sun angle
assert(tithi1.number >= 1 && tithi1.number <= 30, `Tithi 10° moon-sun gives valid tithi (${tithi1.number})`);
assert(typeof tithi1.name === 'string', 'Tithi name returned');

const tithi2 = calc.calculateTithi(0, 180);  // 180° angle (opposite)
assert(tithi2.number >= 15, 'Tithi 180° angle in second half');

const tithi3 = calc.calculateTithi(0, 0);    // 0° angle
assert(tithi3.number === 30 || tithi3.number === 1, 'Tithi 0° angle is new moon tithi');

// Test 7: Nakshatra calculation
describe('PanchangaCalculator - Nakshatra Calculation');

const nakshatra1 = calc.calculateNakshatra(0);     // 0° moon
assert(nakshatra1.number === 1, 'Nakshatra 0° gives Ashwini (1)');
assert(nakshatra1.name === 'Ashwini', 'Nakshatra name correct');

const nakshatra2 = calc.calculateNakshatra(13.34); // Bharani
assert(nakshatra2.number === 2, 'Nakshatra 13.34° gives Bharani (2)');

const nakshatra3 = calc.calculateNakshatra(180);   // Mid-sky
assert(nakshatra3.number >= 1 && nakshatra3.number <= 27, `Nakshatra 180° valid (${nakshatra3.number})`);

// Test 8: Yoga calculation
describe('PanchangaCalculator - Yoga Calculation');

const yoga1 = calc.calculateYoga(0, 0);           // Both 0°
assert(yoga1.number === 1, 'Yoga sun+moon=0° gives first yoga');

const yoga2 = calc.calculateYoga(180, 180);       // Both 180°
assert(yoga2.number >= 1 && yoga2.number <= 27, `Yoga sun+moon=360° valid (${yoga2.number})`);

// Test 9: Karana calculation
describe('PanchangaCalculator - Karana Calculation');

const karana1 = calc.calculateKarana(1);
assert(karana1.number >= 1 && karana1.number <= 60, `Karana for tithi 1 valid (${karana1.number})`);
assert(typeof karana1.name === 'string', 'Karana name defined');

const karana2 = calc.calculateKarana(15);
assert(karana2.number >= 1, 'Karana for mid-tithi valid');

// Test 10: Sunrise/Sunset calculation
describe('PanchangaCalculator - Sunrise/Sunset Calculation');

// Test Chennai, India
const testChennai = new Date(2026, 4, 28);
const sunrise = calc.getSunrise(testChennai, 13.0827, 80.2707);
assert(sunrise.date instanceof Date, 'Sunrise returns Date object');
assert(sunrise.hours >= 0 && sunrise.hours < 24, `Sunrise hours valid (${sunrise.hours}h)`);
assert(sunrise.minutes >= 0 && sunrise.minutes < 60, `Sunrise minutes valid (${sunrise.minutes}m)`);

const sunset = calc.getSunset(testChennai, 13.0827, 80.2707);
assert(sunset.date instanceof Date, 'Sunset returns Date object');
assert(sunset.hours > sunrise.hours, 'Sunset after sunrise');
assert(typeof sunset.timeIST === 'string', 'Sunset time in IST returned');

// Test Rahu Kalam calculation
describe('PanchangaCalculator - Rahu Kalam');

const rahuKalam = calc.calculateRahuKalam({
  hours: 6,
  minutes: 30
}, {
  hours: 18,
  minutes: 30
});
assert(rahuKalam.start >= 6 && rahuKalam.start <= 18, 'Rahu Kalam start valid');
assert(rahuKalam.end > rahuKalam.start, 'Rahu Kalam end after start');

// ============================================================
// LOCATION MANAGER TESTS
// ============================================================

describe('LocationManager - Initialization & Storage');

const locationMgr = new LocationManager();
assert(locationMgr instanceof LocationManager, 'Creates LocationManager instance');
assert(typeof locationMgr.STORAGE_KEY === 'string', 'Storage key defined');

// Test localStorage operations
describe('LocationManager - localStorage Operations');

const testLocation = {
  name: 'Chennai, Tamil Nadu, India',
  latitude: 13.0827,
  longitude: 80.2707,
  timestamp: Date.now()
};

locationMgr.saveLocationToStorage(testLocation);
const retrieved = locationMgr.getStoredLocation();
assert(retrieved !== null, 'Location saved and retrieved from storage');
assert(retrieved.latitude === testLocation.latitude, 'Latitude preserved');
assert(retrieved.longitude === testLocation.longitude, 'Longitude preserved');

// Test geocoding cache
describe('LocationManager - Geocoding Cache');

const testCoords = [
  { lat: 13.0827, lon: 80.2707, name: 'Chennai' },
  { lat: 12.9716, lon: 77.5946, name: 'Bangalore' }
];

locationMgr.cacheGeocodingResult('chennai', testCoords[0]);
const cached = locationMgr.getCachedLocation('chennai');
assert(cached !== null, 'Geocoding result cached');
assert(cached.lat === 13.0827, 'Cached latitude correct');

// Test get all geocoding cache
describe('LocationManager - Cache Management');

const allCache = locationMgr.getGeocodingCache();
assert(typeof allCache === 'object', 'getGeocodingCache returns object');

locationMgr.clearStoredLocation();
const afterClear = locationMgr.getStoredLocation();
assert(afterClear === null, 'clearStoredLocation removes data');

// ============================================================
// INTEGRATION TESTS - calculateFullPanchanga
// ============================================================

describe('PanchangaCalculator - Full Panchanga Calculation');

// Note: This will use approximate calculations since Astronomy Engine isn't loaded
const fullResult = calc.calculateFullPanchanga(testDate, 13.0827, 80.2707);
assert(typeof fullResult === 'object', 'calculateFullPanchanga returns object');
assert(fullResult.date !== undefined, 'Result contains date');
assert(fullResult.tithi !== undefined, 'Result contains tithi');
assert(fullResult.nakshatra !== undefined, 'Result contains nakshatra');
assert(fullResult.yoga !== undefined, 'Result contains yoga');
assert(fullResult.karana !== undefined, 'Result contains karana');

// Verify structure of panchanga elements
assert(fullResult.tithi.number >= 1 && fullResult.tithi.number <= 30, 'Tithi number valid');
assert(fullResult.nakshatra.number >= 1 && fullResult.nakshatra.number <= 27, 'Nakshatra number valid');
assert(fullResult.yoga.number >= 1 && fullResult.yoga.number <= 27, 'Yoga number valid');

// ============================================================
// EDGE CASE TESTS
// ============================================================

describe('PanchangaCalculator - Edge Cases');

// Test leap year handling
const leapDate = new Date(2024, 1, 29); // Feb 29, 2024 (leap year)
const leapDOY = calc.getDayOfYear(leapDate);
assert(leapDOY === 60, `Leap year day-of-year correct (${leapDOY})`);

// Test year boundary
const yearEnd = new Date(2025, 11, 31);
const yearEndDOY = calc.getDayOfYear(yearEnd);
assert(yearEndDOY === 365, `Year-end day-of-year correct (${yearEndDOY})`);

// Test negative/positive degrees
assert(calc.normalizeDegrees(360) === 0, 'Normalizes 360° to 0°');
assert(calc.normalizeDegrees(-90) === 270, 'Normalizes -90° to 270°');
assert(calc.normalizeDegrees(720) === 0, 'Normalizes 720° to 0°');

// Test southern hemisphere sunrise/sunset
const southernHem = calc.getSunrise(testDate, -33.8688, 151.2093); // Sydney
assert(southernHem.date instanceof Date, 'Southern hemisphere sunrise calculated');
assert(southernHem.hours >= 0 && southernHem.hours < 24, 'Southern hemisphere hours valid');

// Test equator
const equator = calc.getSunrise(testDate, 0, 0);
assert(equator.hours >= 5 && equator.hours <= 7, 'Equator sunrise ~6am');

// ============================================================
// SUMMARY
// ============================================================

console.log('\n' + '='.repeat(60));
console.log('TEST SUMMARY');
console.log('='.repeat(60));
console.log(`✅ Passed: ${testsPassed}`);
console.log(`❌ Failed: ${testsFailed}`);
console.log(`Total: ${testsPassed + testsFailed}`);

if (testsFailed > 0) {
  console.log('\nFailures:');
  failures.forEach(f => console.log(f));
  process.exit(1);
}

console.log('\n🎉 ALL TESTS PASSED!');
process.exit(0);
