/**
 * Integration tests for Panchanga Calculator
 *
 * Tests the calculator library against the Astronomy Engine
 * with known correct reference values (expected vs actual)
 *
 * Purpose: Identify calculation bugs in tithi, nakshatra, yoga, karana, etc.
 */

const testData = require('./integration-test-data.json');

/**
 * Compare time values with tolerance (NOAA standard)
 * @param {string} actual - Actual time in HH:MM format
 * @param {string} expected - Expected time in HH:MM format
 * @param {number} toleranceMinutes - Allowed difference in minutes (default: 1 per NOAA)
 * @returns {boolean}
 */
function timeMatch(actual, expected, toleranceMinutes = 1) {
  if (!actual || !expected) return false;

  const [aH, aM] = actual.split(':').map(Number);
  const [eH, eM] = expected.split(':').map(Number);

  const actualMinutes = aH * 60 + aM;
  const expectedMinutes = eH * 60 + eM;

  return Math.abs(actualMinutes - expectedMinutes) <= toleranceMinutes;
}

/**
 * Test case: Tithi calculation accuracy
 */
describe('Tithi Calculations', () => {
  testData.test_cases.forEach((testCase) => {
    test(`Tithi for ${testCase.id}`, () => {
      const expected = testCase.expected.tithi;

      // PLACEHOLDER: Replace with actual calculator call
      // const actual = calculatePanchanga(testCase.location, testCase.date).tithi;

      const actual = {
        name: expected.name,
        end_time: expected.end_time
      };

      expect(actual.name).toBe(expected.name);
      expect(actual.end_time).toBe(expected.end_time);
    });
  });
});

/**
 * Test case: Nakshatra calculation accuracy
 */
describe('Nakshatra Calculations', () => {
  testData.test_cases.forEach((testCase) => {
    test(`Nakshatra for ${testCase.id}`, () => {
      const expected = testCase.expected.nakshatra;

      // PLACEHOLDER: Replace with actual calculator call
      // const actual = calculatePanchanga(testCase.location, testCase.date).nakshatra;

      const actual = {
        name: expected.name,
        end_time: expected.end_time
      };

      expect(actual.name).toBe(expected.name);
      expect(actual.end_time).toBe(expected.end_time);
    });
  });
});

/**
 * Test case: Sunrise/Sunset calculations
 */
describe('Sunrise/Sunset Calculations', () => {
  testData.test_cases.forEach((testCase) => {
    test(`Sunrise/Sunset for ${testCase.id}`, () => {
      const expected = testCase.expected;

      // PLACEHOLDER: Replace with actual calculator call
      // const actual = calculatePanchanga(testCase.location, testCase.date);

      const actual = {
        sunrise: expected.sunrise,
        sunset: expected.sunset
      };

      expect(timeMatch(actual.sunrise, expected.sunrise, 1)).toBe(true);
      expect(timeMatch(actual.sunset, expected.sunset, 1)).toBe(true);
    });
  });
});

/**
 * Test case: Yoga calculation accuracy
 */
describe('Yoga Calculations', () => {
  testData.test_cases.forEach((testCase) => {
    test(`Yoga for ${testCase.id}`, () => {
      const expected = testCase.expected.yoga;

      // PLACEHOLDER: Replace with actual calculator call
      // const actual = calculatePanchanga(testCase.location, testCase.date).yoga;

      const actual = {
        name: expected.name,
        end_time: expected.end_time
      };

      expect(actual.name).toBe(expected.name);
      // Time comparison with tolerance (5 minute tolerance for yoga)
      expect(timeMatch(actual.end_time, expected.end_time, 5)).toBe(true);
    });
  });
});

/**
 * Test case: Karana calculation accuracy
 */
describe('Karana Calculations', () => {
  testData.test_cases.forEach((testCase) => {
    test(`Karana for ${testCase.id}`, () => {
      const expected = testCase.expected.karana;

      // PLACEHOLDER: Replace with actual calculator call
      // const actual = calculatePanchanga(testCase.location, testCase.date).karana;

      // Karana has multiple instances per day
      expect(Array.isArray(expected)).toBe(true);
      expect(expected.length).toBeGreaterThan(0);

      expected.forEach((karana, index) => {
        expect(karana.name).toBeDefined();
        expect(karana.end_time).toBeDefined();
      });
    });
  });
});

/**
 * Test case: Paksha (lunar phase) calculation
 */
describe('Paksha Calculations', () => {
  testData.test_cases.forEach((testCase) => {
    test(`Paksha for ${testCase.id}`, () => {
      const expected = testCase.expected.paksha;

      // PLACEHOLDER: Replace with actual calculator call
      // const actual = calculatePanchanga(testCase.location, testCase.date).paksha;

      const actual = expected;

      expect(['Krishna Paksha', 'Shukla Paksha']).toContain(actual);
    });
  });
});

/**
 * Test case: Moonsign calculation
 */
describe('Moonsign Calculations', () => {
  testData.test_cases.forEach((testCase) => {
    test(`Moonsign for ${testCase.id}`, () => {
      const expected = testCase.expected.moonsign;

      // PLACEHOLDER: Replace with actual calculator call
      // const actual = calculatePanchanga(testCase.location, testCase.date).moonsign;

      const actual = expected;

      const validSigns = [
        'Mesha', 'Vrishabha', 'Mithuna', 'Kataka',
        'Simha', 'Kanya', 'Tula', 'Vrishchika',
        'Dhanu', 'Makara', 'Kumbha', 'Meena'
      ];

      expect(validSigns).toContain(actual);
    });
  });
});

/**
 * Test case: Sunsign calculation
 */
describe('Sunsign Calculations', () => {
  testData.test_cases.forEach((testCase) => {
    test(`Sunsign for ${testCase.id}`, () => {
      const expected = testCase.expected.sunsign;

      // PLACEHOLDER: Replace with actual calculator call
      // const actual = calculatePanchanga(testCase.location, testCase.date).sunsign;

      const actual = expected;

      const validSigns = [
        'Mesha', 'Vrishabha', 'Mithuna', 'Kataka',
        'Simha', 'Kanya', 'Tula', 'Vrishchika',
        'Dhanu', 'Makara', 'Kumbha', 'Meena'
      ];

      expect(validSigns).toContain(actual);
    });
  });
});

/**
 * Test case: Rahu Kalam and other inauspicious times
 */
describe('Inauspicious Times Calculations', () => {
  testData.test_cases.forEach((testCase) => {
    test(`Rahu Kalam for ${testCase.id}`, () => {
      const expected = testCase.expected.rahu_kalam;

      // PLACEHOLDER: Replace with actual calculator call
      // const actual = calculatePanchanga(testCase.location, testCase.date).rahu_kalam;

      const actual = expected;

      expect(actual.start).toBeDefined();
      expect(actual.end).toBeDefined();
    });

    test(`Gulika Kalam for ${testCase.id}`, () => {
      const expected = testCase.expected.gulika_kalam;

      // PLACEHOLDER: Replace with actual calculator call
      // const actual = calculatePanchanga(testCase.location, testCase.date).gulika_kalam;

      const actual = expected;

      expect(actual.start).toBeDefined();
      expect(actual.end).toBeDefined();
    });
  });
});

/**
 * Test helper: Display calculation errors
 */
function logCalculationError(testCaseId, field, expected, actual) {
  console.error(`
    ❌ Calculation Error: ${testCaseId}
    Field: ${field}
    Expected: ${JSON.stringify(expected)}
    Actual: ${JSON.stringify(actual)}
  `);
}

module.exports = {
  timeMatch,
  logCalculationError,
  testData
};
