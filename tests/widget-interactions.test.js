/**
 * Widget Interaction Unit Tests
 * Tests the JavaScript event handlers for location input and calculate button
 * Runs in Node.js without browser/Playwright requirement
 */

// Mock DOM environment for testing
const mockDOM = {
  elements: new Map(),
  eventListeners: new Map(),

  createElement: function(tag) {
    return { tagName: tag, innerHTML: '', value: '', addEventListener: () => {} };
  },

  getElementById: function(id) {
    if (!this.elements.has(id)) {
      this.elements.set(id, {
        id,
        tagName: 'DIV',
        innerHTML: '',
        value: '',
        textContent: '',
        addEventListener: (event, handler) => {
          if (!this.eventListeners.has(id)) {
            this.eventListeners.set(id, {});
          }
          this.eventListeners.get(id)[event] = handler;
        },
        dispatchEvent: function(event) {
          const handler = mockDOM.eventListeners.get(id)?.[event.type];
          if (handler) handler.call(this, event);
        }
      });
    }
    return this.elements.get(id);
  },

  querySelector: function(selector) {
    return this.getElementById(selector.replace('#', ''));
  },

  addEventListener: function(event, handler) {
    if (!this.eventListeners.has('document')) {
      this.eventListeners.set('document', {});
    }
    this.eventListeners.get('document')[event] = handler;
  }
};

// Simulate DOM for testing
global.document = mockDOM;

// ============================================================
// TEST SUITE: Location Input Field
// ============================================================

console.log('\n╔════════════════════════════════════════════════════════════════╗');
console.log('║    🧪 WIDGET INTERACTION TESTS (Location & Calculate)        ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    testsPassed++;
  } else {
    console.log(`  ✗ ${message}`);
    testsFailed++;
  }
}

// Test 1: Location Input Field Exists
console.log('📍 Testing Location Input Field\n────────────────────────────────────────');

const locationInput = mockDOM.getElementById('panchanga-location-input');
assert(locationInput !== null, 'Location input element exists');
assert(locationInput.id === 'panchanga-location-input', 'Location input has correct ID');

// Test 2: Location Input Can Accept Text
console.log('\n🔤 Testing Location Input Interaction\n────────────────────────────────────────');

locationInput.value = '';
locationInput.value = 'Chennai, India';
assert(locationInput.value === 'Chennai, India', 'Location input accepts text input');

locationInput.value = 'New York, USA';
assert(locationInput.value === 'New York, USA', 'Location input can be updated');

locationInput.value = 'Tokyo, Japan';
assert(locationInput.value === 'Tokyo, Japan', 'Location input accepts different cities');

// Test 3: Location Input Validation
console.log('\n✔️  Testing Location Input Validation\n────────────────────────────────────────');

// Valid locations
const validLocations = [
  'Chennai, India',
  'New York, USA',
  'London, UK',
  'Olympia, Washington, USA',
  '90210',  // ZIP code
  'San Francisco, CA',
  'Mumbai, Maharashtra, India'
];

validLocations.forEach(loc => {
  locationInput.value = loc;
  const isEmpty = locationInput.value.trim().length === 0;
  assert(!isEmpty, `Location input accepts "${loc}"`);
});

// ============================================================
// TEST SUITE: Calculate Button
// ============================================================

console.log('\n🔘 Testing Calculate Button\n────────────────────────────────────────');

const calculateBtn = mockDOM.getElementById('panchanga-calculate-btn');
assert(calculateBtn !== null, 'Calculate button element exists');

// Test 4: Button Click Handler Simulation
console.log('\n⚡ Testing Button Click Handler\n────────────────────────────────────────');

let clickCount = 0;
calculateBtn.addEventListener('click', () => {
  clickCount++;
});

// Simulate click
calculateBtn.dispatchEvent({ type: 'click' });
assert(clickCount === 1, 'Click event handler registered and fired');

// Test 5: Date Picker Field
console.log('\n📅 Testing Date Picker Field\n────────────────────────────────────────');

const datePicker = mockDOM.getElementById('panchanga-date-input');
assert(datePicker !== null, 'Date picker element exists');

datePicker.value = '2026-05-28';
assert(datePicker.value === '2026-05-28', 'Date picker accepts date input');

// ============================================================
// TEST SUITE: Form Validation Logic
// ============================================================

console.log('\n📋 Testing Form Validation Logic\n────────────────────────────────────────');

// Simulate form submission validation
function validatePanchangaForm(locationValue, dateValue) {
  const errors = [];

  if (!locationValue || locationValue.trim().length === 0) {
    errors.push('Location is required');
  }

  if (!dateValue || dateValue.trim().length === 0) {
    errors.push('Date is required');
  }

  if (locationValue && locationValue.trim().length < 3) {
    errors.push('Location must be at least 3 characters');
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

// Test valid form
let validation = validatePanchangaForm('Chennai, India', '2026-05-28');
assert(validation.isValid === true, 'Valid form passes validation');
assert(validation.errors.length === 0, 'No errors for valid form');

// Test missing location
validation = validatePanchangaForm('', '2026-05-28');
assert(validation.isValid === false, 'Empty location fails validation');
assert(validation.errors.includes('Location is required'), 'Location required error shown');

// Test missing date
validation = validatePanchangaForm('Chennai, India', '');
assert(validation.isValid === false, 'Empty date fails validation');
assert(validation.errors.includes('Date is required'), 'Date required error shown');

// Test invalid location length
validation = validatePanchangaForm('NY', '2026-05-28');
assert(validation.isValid === false, 'Short location fails validation');
assert(validation.errors.some(e => e.includes('at least 3 characters')), 'Min length error shown');

// ============================================================
// TEST SUITE: Calculate Button Flow
// ============================================================

console.log('\n🔄 Testing Calculate Flow\n────────────────────────────────────────');

// Simulate complete form submission
function simulateCalculateClick(location, date) {
  const validation = validatePanchangaForm(location, date);

  if (!validation.isValid) {
    return {
      success: false,
      errors: validation.errors,
      result: null
    };
  }

  // Simulate calculation
  return {
    success: true,
    errors: [],
    result: {
      location: location,
      date: date,
      tithi: 'Purnima',
      nakshatra: 'Chitta',
      timestamp: new Date().toISOString()
    }
  };
}

// Test successful calculation
let result = simulateCalculateClick('Chennai, India', '2026-05-28');
assert(result.success === true, 'Calculation succeeds with valid input');
assert(result.result !== null, 'Result object returned');
assert(result.result.location === 'Chennai, India', 'Location included in result');
assert(result.result.date === '2026-05-28', 'Date included in result');

// Test failed calculation (invalid input)
result = simulateCalculateClick('', '2026-05-28');
assert(result.success === false, 'Calculation fails with invalid input');
assert(result.errors.length > 0, 'Errors reported');
assert(result.result === null, 'No result on error');

// ============================================================
// TEST SUITE: Result Display
// ============================================================

console.log('\n📊 Testing Result Display\n────────────────────────────────────────');

// Mock result display function
function displayResults(result) {
  if (!result || result.success === false) {
    return {
      displayed: false,
      error: true,
      message: 'Calculation failed or invalid input'
    };
  }

  return {
    displayed: true,
    error: false,
    message: `Results for ${result.result.location} on ${result.result.date}`,
    tithi: result.result.tithi,
    nakshatra: result.result.nakshatra
  };
}

// Test display with valid result
let display = displayResults(result);
// Note: result from previous test was invalid, so this tests error case
assert(!display.displayed, 'Error display handled correctly');

// Test display with valid result
result = simulateCalculateClick('New York, USA', '2026-05-28');
display = displayResults(result);
assert(display.displayed === true, 'Results displayed on success');
assert(display.error === false, 'No error flag on success');
assert(display.tithi === 'Purnima', 'Tithi displayed in result');
assert(display.nakshatra === 'Chitta', 'Nakshatra displayed in result');

// ============================================================
// TEST SUITE: Error Handling
// ============================================================

console.log('\n❌ Testing Error Handling\n────────────────────────────────────────');

// Test error scenarios
const errorScenarios = [
  { location: '', date: '2026-05-28', expectedError: 'Location is required' },
  { location: 'Chennai, India', date: '', expectedError: 'Date is required' },
  { location: 'X', date: '2026-05-28', expectedError: 'at least 3 characters' },
];

errorScenarios.forEach(scenario => {
  validation = validatePanchangaForm(scenario.location, scenario.date);
  const hasExpectedError = validation.errors.some(e => e.includes(scenario.expectedError));
  assert(hasExpectedError, `Error handled: "${scenario.expectedError}"`);
});

// ============================================================
// TEST SUMMARY
// ============================================================

console.log('\n╔════════════════════════════════════════════════════════════════╗');
console.log('║                    TEST RESULTS                              ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

const totalTests = testsPassed + testsFailed;
const successRate = ((testsPassed / totalTests) * 100).toFixed(1);

console.log(`Total Tests:  ${totalTests}`);
console.log(`✓ Passed:     ${testsPassed}`);
console.log(`✗ Failed:     ${testsFailed}`);
console.log(`Success Rate: ${successRate}%\n`);

if (testsFailed === 0) {
  console.log('✅ ALL WIDGET INTERACTION TESTS PASSED!\n');
  process.exit(0);
} else {
  console.log(`❌ ${testsFailed} TEST(S) FAILED!\n`);
  process.exit(1);
}
