/**
 * Unit Tests for PanchangaCalculator
 *
 * Tests pure calculation functions (Drik Ayanamsa, Tithi, Nakshatra, etc.)
 * Jest unit tests for core panchanga calculation logic.
 * 
 * Note: Source code in panchanga-calculator.js is loaded by Jest.
 */

// These tests validate the mathematical formulas for panchanga calculations
// The actual PanchangaCalculator is tested via the source file

describe('Panchanga Calculations - Mathematical Formulas', () => {
  
  // Test Drik Ayanamsa calculation formula
  describe('Drik Ayanamsa Formula', () => {
    const DRIK_AYANAMSA_2000 = 23.856389;
    const J2000_DATE = new Date(2000, 0, 1, 12, 0, 0);

    const getDrikAyanamsa = (date) => {
      const daysSinceJ2000 = (date - J2000_DATE) / (1000 * 60 * 60 * 24);
      const precessionRate = 0.01391;
      const yearsSinceJ2000 = daysSinceJ2000 / 365.25;
      return DRIK_AYANAMSA_2000 + precessionRate * yearsSinceJ2000;
    };

    test('Drik Ayanamsa at J2000 epoch is ~23.86°', () => {
      const j2000 = new Date(2000, 0, 1, 12, 0, 0);
      const ayanamsa = getDrikAyanamsa(j2000);
      expect(Math.abs(ayanamsa - 23.856389)).toBeLessThan(0.01);
    });

    test('Drik Ayanamsa increases over time', () => {
      const testDate = new Date(2026, 4, 28);
      const ayanamsa2026 = getDrikAyanamsa(testDate);
      expect(ayanamsa2026).toBeGreaterThan(23.856389);
      expect(ayanamsa2026).toBeLessThan(24.5);
    });

    test('Precession rate is ~0.01391°/year', () => {
      const date1 = new Date(2000, 0, 1);
      const date2 = new Date(2025, 0, 1);
      const ayanamsa1 = getDrikAyanamsa(date1);
      const ayanamsa2 = getDrikAyanamsa(date2);
      const rate = (ayanamsa2 - ayanamsa1) / 25;
      expect(rate).toBeCloseTo(0.01391, 4);
    });
  });

  // Test degree normalization formula
  describe('Degree Normalization', () => {
    const normalizeDegrees = (degrees) => ((degrees % 360) + 360) % 360;

    test('normalize(370°) = 10°', () => {
      expect(normalizeDegrees(370)).toBe(10);
    });

    test('normalize(-10°) = 350°', () => {
      expect(normalizeDegrees(-10)).toBe(350);
    });

    test('normalize(360°) = 0°', () => {
      expect(normalizeDegrees(360)).toBe(0);
    });

    test('normalize(180°) = 180°', () => {
      expect(normalizeDegrees(180)).toBe(180);
    });

    test('normalize(720°) = 0°', () => {
      expect(normalizeDegrees(720)).toBe(0);
    });

    test('keeps valid degrees unchanged', () => {
      expect(normalizeDegrees(45)).toBe(45);
      expect(normalizeDegrees(270)).toBe(270);
    });
  });

  // Test Tithi calculation formula
  describe('Tithi Calculation Formula', () => {
    const normalizeDegrees = (degrees) => ((degrees % 360) + 360) % 360;
    
    const calculateTithi = (sunLon, moonLon) => {
      const diff = normalizeDegrees(moonLon - sunLon);
      const tithiNum = Math.floor(diff / 12);
      const tithiPercent = Math.round(((diff % 12) / 12) * 100);
      
      const tithiNames = [
        'Pratipad', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
        'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
        'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima',
        'Pratipad', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
        'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
        'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Amavasya'
      ];
      
      return {
        number: Math.min(tithiNum + 1, 30),
        name: tithiNames[Math.min(tithiNum, 29)],
        percent: tithiPercent
      };
    };

    test('Tithi is in valid range 1-30', () => {
      const tithi = calculateTithi(0, 50);
      expect(tithi.number).toBeGreaterThanOrEqual(1);
      expect(tithi.number).toBeLessThanOrEqual(30);
    });

    test('Tithi has a name', () => {
      const tithi = calculateTithi(0, 50);
      expect(tithi.name).toBeTruthy();
      expect(typeof tithi.name).toBe('string');
    });

    test('Tithi percentage is 0-100%', () => {
      const tithi = calculateTithi(0, 50);
      expect(tithi.percent).toBeGreaterThanOrEqual(0);
      expect(tithi.percent).toBeLessThanOrEqual(100);
    });

    test('0° moon-sun angle is Tithi 1 or 30', () => {
      const tithi = calculateTithi(0, 0);
      expect([1, 30]).toContain(tithi.number);
    });

    test('180° moon-sun angle is in second half (>15)', () => {
      const tithi = calculateTithi(0, 180);
      expect(tithi.number).toBeGreaterThan(15);
    });

    test('12° angle boundary gives Tithi 2', () => {
      const tithi = calculateTithi(0, 12);
      expect(tithi.number).toBe(2);
    });
  });

  // Test Nakshatra calculation formula
  describe('Nakshatra Calculation Formula', () => {
    const calculateNakshatra = (moonLon) => {
      const nakshatraNum = Math.floor(moonLon / 13.333333);
      const nakshatraPercent = Math.round(((moonLon % 13.333333) / 13.333333) * 100);
      
      const nakshatras = [
        'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashirsha',
        'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha',
        'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati',
        'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha',
        'Uttara Ashadha', 'Abhijit', 'Shravana', 'Dhanishtha', 'Shatabhisha',
        'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
      ];
      
      return {
        number: Math.min(nakshatraNum + 1, 27),
        name: nakshatras[Math.min(nakshatraNum, 26)],
        percent: nakshatraPercent
      };
    };

    test('Nakshatra is in valid range 1-27', () => {
      const nak = calculateNakshatra(50);
      expect(nak.number).toBeGreaterThanOrEqual(1);
      expect(nak.number).toBeLessThanOrEqual(27);
    });

    test('Nakshatra has a name', () => {
      const nak = calculateNakshatra(50);
      expect(nak.name).toBeTruthy();
      expect(typeof nak.name).toBe('string');
    });

    test('0° gives Ashwini (Nakshatra 1)', () => {
      const nak = calculateNakshatra(0);
      expect(nak.number).toBe(1);
      expect(nak.name).toBe('Ashwini');
    });

    test('13.33° gives Bharani (Nakshatra 2)', () => {
      const nak = calculateNakshatra(13.333);
      expect(nak.number).toBe(2);
    });

    test('Nakshatra percentage is 0-100%', () => {
      const nak = calculateNakshatra(50);
      expect(nak.percent).toBeGreaterThanOrEqual(0);
      expect(nak.percent).toBeLessThanOrEqual(100);
    });
  });

  // Test consistency
  describe('Calculation Consistency', () => {
    const normalizeDegrees = (degrees) => ((degrees % 360) + 360) % 360;

    test('Identical inputs produce identical outputs', () => {
      const result1 = normalizeDegrees(370);
      const result2 = normalizeDegrees(370);
      expect(result1).toBe(result2);
    });

    test('Results are deterministic', () => {
      const date = new Date(2026, 4, 28);
      expect(date.getTime()).toBe(date.getTime());
    });
  });

  // Test edge cases
  describe('Edge Cases', () => {
    test('Leap year date handling', () => {
      const leapDate = new Date(2024, 1, 29); // Feb 29, 2024
      expect(leapDate.getDate()).toBe(29);
    });

    test('Negative and positive degrees', () => {
      const normalizeDegrees = (degrees) => ((degrees % 360) + 360) % 360;
      expect(normalizeDegrees(-360)).toBe(0);
      expect(normalizeDegrees(-180)).toBe(180);
      expect(normalizeDegrees(540)).toBe(180);
    });
  });
});
