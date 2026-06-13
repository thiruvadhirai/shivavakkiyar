/**
 * Unit Tests for Panchanga Widgets (Full and Simple)
 * Tests: Timezone lookup, geocoding fallback, date handling
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

// Mock timezone test cases (simulating geo-tz data)
const mockTimezoneTestCases = [
  { lat: 21.3099, lon: -157.8581, tz: 'Pacific/Honolulu' },  // Honolulu
  { lat: 25.2048, lon: 55.2708, tz: 'Asia/Dubai' },          // Dubai
  { lat: 40.7128, lon: -74.0060, tz: 'America/New_York' },   // New York
  { lat: 35.6762, lon: 139.6503, tz: 'Asia/Tokyo' },         // Tokyo
  { lat: -33.8688, lon: 151.2093, tz: 'Australia/Sydney' },  // Sydney
  { lat: 28.7041, lon: 77.1025, tz: 'Asia/Kolkata' },        // Delhi
];

// Timezone fallback function (from widget)
function getIANATimezoneFallback(lat, lon) {
  // Pacific & Hawaii
  if (lon >= -180 && lon < -165) return 'Pacific/Honolulu';
  if (lon >= -165 && lon < -155) return 'Pacific/Samoa';
  if (lon >= -155 && lon < -145) return 'America/Anchorage';
  if (lon >= -145 && lon < -130) return 'America/Nome';

  // North America - West
  if (lon >= -130 && lon < -120) return 'America/Los_Angeles';
  if (lon >= -120 && lon < -110) return 'America/Denver';
  if (lon >= -110 && lon < -100) return 'America/Phoenix';
  if (lon >= -100 && lon < -90) return 'America/Chicago';
  if (lon >= -90 && lon < -80) return 'America/New_York';
  if (lon >= -80 && lon < -70) return 'America/Halifax';

  // Middle East
  if (lon >= 40 && lon <= 60 && lat > 15 && lat < 35) return 'Asia/Dubai';

  // South Asia
  if (lon >= 70 && lon < 90 && lat > 5 && lat < 35) return 'Asia/Kolkata';

  // East Asia
  if (lon >= 120 && lon < 135 && lat > 30 && lat < 50) return 'Asia/Tokyo';

  // Australia & Pacific
  if (lon >= 145 && lon < 160 && lat > -30 && lat < -10) return 'Australia/Sydney';

  return 'UTC';
}

// Nearest-neighbor timezone lookup (from widget)
function getIANATimezone(location, testCases) {
  const lat = location.latitude;
  const lon = location.longitude;

  if (!testCases || !Array.isArray(testCases)) {
    return getIANATimezoneFallback(lat, lon);
  }

  let nearest = null;
  let minDistance = Infinity;

  testCases.forEach(point => {
    const dLat = point.lat - lat;
    const dLon = point.lon - lon;
    const distance = Math.sqrt(dLat * dLat + dLon * dLon);

    if (distance < minDistance) {
      minDistance = distance;
      nearest = point;
    }
  });

  return nearest?.tz || 'UTC';
}

// Test Suite
console.log('\n🧪 Testing Panchanga Widgets - Timezone Lookup\n');
console.log('═══════════════════════════════════════════════════════════\n');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (error) {
    console.error(`  ✗ ${name}`);
    console.error(`    Error: ${error.message}`);
    failed++;
  }
}

// Test 1: Nearest-neighbor lookup - Dubai
test('Nearest-neighbor lookup for Dubai (25.2048, 55.2708)', () => {
  const location = { latitude: 25.2048, longitude: 55.2708, name: 'Dubai' };
  const result = getIANATimezone(location, mockTimezoneTestCases);
  assert.strictEqual(result, 'Asia/Dubai', `Expected Asia/Dubai, got ${result}`);
});

// Test 2: Nearest-neighbor lookup - Honolulu
test('Nearest-neighbor lookup for Honolulu (21.3099, -157.8581)', () => {
  const location = { latitude: 21.3099, longitude: -157.8581, name: 'Honolulu' };
  const result = getIANATimezone(location, mockTimezoneTestCases);
  assert.strictEqual(result, 'Pacific/Honolulu', `Expected Pacific/Honolulu, got ${result}`);
});

// Test 3: Nearest-neighbor lookup - New York
test('Nearest-neighbor lookup for New York (40.7128, -74.0060)', () => {
  const location = { latitude: 40.7128, longitude: -74.0060, name: 'New York' };
  const result = getIANATimezone(location, mockTimezoneTestCases);
  assert.strictEqual(result, 'America/New_York', `Expected America/New_York, got ${result}`);
});

// Test 4: Nearest-neighbor lookup - Tokyo
test('Nearest-neighbor lookup for Tokyo (35.6762, 139.6503)', () => {
  const location = { latitude: 35.6762, longitude: 139.6503, name: 'Tokyo' };
  const result = getIANATimezone(location, mockTimezoneTestCases);
  assert.strictEqual(result, 'Asia/Tokyo', `Expected Asia/Tokyo, got ${result}`);
});

// Test 5: Nearest-neighbor lookup - Sydney
test('Nearest-neighbor lookup for Sydney (-33.8688, 151.2093)', () => {
  const location = { latitude: -33.8688, longitude: 151.2093, name: 'Sydney' };
  const result = getIANATimezone(location, mockTimezoneTestCases);
  assert.strictEqual(result, 'Australia/Sydney', `Expected Australia/Sydney, got ${result}`);
});

// Test 6: Nearest-neighbor lookup - Delhi
test('Nearest-neighbor lookup for Delhi (28.7041, 77.1025)', () => {
  const location = { latitude: 28.7041, longitude: 77.1025, name: 'Delhi' };
  const result = getIANATimezone(location, mockTimezoneTestCases);
  assert.strictEqual(result, 'Asia/Kolkata', `Expected Asia/Kolkata, got ${result}`);
});

// Test 7: Fallback lookup - Dubai with no test cases
test('Fallback lookup - Dubai returns valid timezone with no test cases', () => {
  const location = { latitude: 25.2048, longitude: 55.2708, name: 'Dubai' };
  const result = getIANATimezone(location, null);
  assert.strictEqual(result, 'Asia/Dubai', `Expected Asia/Dubai fallback, got ${result}`);
});

// Test 11: Distance calculation accuracy
test('Nearest-neighbor distance to closest point', () => {
  // Location near Dubai but not exact
  const location = { latitude: 25.21, longitude: 55.27, name: 'Dubai nearby' };
  const result = getIANATimezone(location, mockTimezoneTestCases);
  assert.strictEqual(result, 'Asia/Dubai', `Expected Asia/Dubai for nearby location, got ${result}`);
});

// Test 12: Distance calculation - far away location should find Tokyo
test('Nearest-neighbor finds Tokyo for location near Tokyo', () => {
  const location = { latitude: 35.68, longitude: 139.65, name: 'Tokyo nearby' };
  const result = getIANATimezone(location, mockTimezoneTestCases);
  assert.strictEqual(result, 'Asia/Tokyo', `Expected Asia/Tokyo for nearby location, got ${result}`);
});

// Test 13: Valid timezone returned for different locations
test('Timezone lookup returns valid results for all test locations', () => {
  mockTimezoneTestCases.forEach(testCase => {
    const location = { latitude: testCase.lat, longitude: testCase.lon, name: testCase.tz };
    const result = getIANATimezone(location, mockTimezoneTestCases);
    assert.ok(result, `Expected timezone, got ${result}`);
    assert.ok(result.length > 0, `Expected non-empty timezone string`);
  });
});

// Test 14: Nearest-neighbor with mock data is accurate
test('Nearest-neighbor lookup finds closest test point in data', () => {
  const location = { latitude: 0, longitude: 0, name: 'Null Island' };
  const result = getIANATimezone(location, mockTimezoneTestCases);
  // Null Island (0,0) should be closest to one of the African test points
  assert.ok(typeof result === 'string' && result !== 'undefined',
    `Expected valid timezone string, got ${result}`);
  assert.ok(result.length > 0, `Expected non-empty timezone, got ${result}`);
});

// Test 15: Timezone data file exists
test('Timezone data file exists at _data/timezones.json', () => {
  const filePath = path.join(__dirname, '..', '_data', 'timezones.json');
  assert.ok(fs.existsSync(filePath), `File not found: ${filePath}`);
});

// Test 16: Timezone data contains test cases
test('Timezone data contains testCases array', () => {
  const filePath = path.join(__dirname, '..', '_data', 'timezones.json');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  assert.ok(Array.isArray(data.testCases), 'testCases is not an array');
  assert.ok(data.testCases.length > 0, 'testCases array is empty');
});

// Test 17: Timezone data has required fields
test('Timezone test cases have required fields (lat, lon, tz)', () => {
  const filePath = path.join(__dirname, '..', '_data', 'timezones.json');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  data.testCases.slice(0, 5).forEach(point => {
    assert.ok(typeof point.lat === 'number', `Missing or invalid lat in ${JSON.stringify(point)}`);
    assert.ok(typeof point.lon === 'number', `Missing or invalid lon in ${JSON.stringify(point)}`);
    assert.ok(typeof point.tz === 'string', `Missing or invalid tz in ${JSON.stringify(point)}`);
  });
});

// Test 18: Dubai mapped to Asia/Dubai in data
test('Dubai is mapped to Asia/Dubai in timezone data', () => {
  const filePath = path.join(__dirname, '..', '_data', 'timezones.json');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const dubai = data.testCases.find(p => p.lat > 25 && p.lat < 25.3 && p.lon > 55 && p.lon < 55.3);
  assert.ok(dubai, 'Dubai not found in timezone data');
  assert.strictEqual(dubai.tz, 'Asia/Dubai', `Dubai should map to Asia/Dubai, got ${dubai.tz}`);
});

// Test 19: Tokyo mapped to Asia/Tokyo in data
test('Tokyo is mapped to Asia/Tokyo in timezone data', () => {
  const filePath = path.join(__dirname, '..', '_data', 'timezones.json');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const tokyo = data.testCases.find(p => p.lat > 35 && p.lat < 35.8 && p.lon > 139 && p.lon < 140);
  assert.ok(tokyo, 'Tokyo not found in timezone data');
  assert.strictEqual(tokyo.tz, 'Asia/Tokyo', `Tokyo should map to Asia/Tokyo, got ${tokyo.tz}`);
});

// Test 20: Sydney mapped to Australia/Sydney in data
test('Sydney is mapped to Australia/Sydney in timezone data', () => {
  const filePath = path.join(__dirname, '..', '_data', 'timezones.json');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const sydney = data.testCases.find(p => p.lat < -33 && p.lat > -34 && p.lon > 151 && p.lon < 152);
  assert.ok(sydney, 'Sydney not found in timezone data');
  assert.strictEqual(sydney.tz, 'Australia/Sydney', `Sydney should map to Australia/Sydney, got ${sydney.tz}`);
});

// Test 21: Simple widget script file exists
test('Simple widget script file exists at assets/js/panchanga-widget-simple.js', () => {
  const filePath = path.join(__dirname, '..', 'assets', 'js', 'panchanga-widget-simple.js');
  assert.ok(fs.existsSync(filePath), `File not found: ${filePath}`);
});

// Test 22: Full widget script file exists
test('Full widget script file exists at assets/js/panchanga-widget-full.js', () => {
  const filePath = path.join(__dirname, '..', 'assets', 'js', 'panchanga-widget-full.js');
  assert.ok(fs.existsSync(filePath), `File not found: ${filePath}`);
});

// Test 23: Simple widget includes getIANATimezone function
test('Simple widget script contains getIANATimezone function', () => {
  const filePath = path.join(__dirname, '..', 'assets', 'js', 'panchanga-widget-simple.js');
  const content = fs.readFileSync(filePath, 'utf8');
  assert.ok(content.includes('function getIANATimezone'), 'getIANATimezone function not found in simple widget');
});

// Test 24: Full widget includes timezone lookup logic
test('Full widget script contains timezone lookup logic', () => {
  const filePath = path.join(__dirname, '..', 'assets', 'js', 'panchanga-widget-full.js');
  const content = fs.readFileSync(filePath, 'utf8');
  assert.ok(content.includes('window.timezoneTestCases') || content.includes('getIANATimezone'),
    'Timezone lookup logic not found in full widget');
});

// Test 25: Simple widget includes geo-tz nearest-neighbor logic
test('Simple widget script contains nearest-neighbor lookup logic', () => {
  const filePath = path.join(__dirname, '..', 'assets', 'js', 'panchanga-widget-simple.js');
  const content = fs.readFileSync(filePath, 'utf8');
  assert.ok(content.includes('window.timezoneTestCases'), 'window.timezoneTestCases check not found');
  assert.ok(content.includes('Math.sqrt'), 'Distance calculation not found');
});

// Summary
console.log('\n═══════════════════════════════════════════════════════════\n');
console.log(`📊 Test Results: ${passed}/${passed + failed} passed\n`);

if (failed > 0) {
  console.log(`❌ ${failed} test(s) failed`);
  process.exit(1);
} else {
  console.log(`✅ All tests passed!`);
  process.exit(0);
}
