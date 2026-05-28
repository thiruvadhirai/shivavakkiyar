/**
 * Test: Pradosha date discrepancy for Olympia, WA 98502
 *
 * Issue: Our calculation finds Pradosha on:
 *   - June 5, June 19, July 4 (with approximate coords)
 *
 * But traditional calendars (drikpanchangam.com, prokerala.com) show:
 *   - June 12, June 26, July 11
 *
 * Possible causes:
 *   1. Different ayanamsa system (we use Drik, but traditional might use different)
 *   2. Different tithi calculation method (instant vs midpoint)
 *   3. Timezone/local time adjustment (calendar shows local date, not UTC)
 *   4. Precision/rounding differences
 */

const fs = require('fs');
const calc = fs.readFileSync('./assets/js/panchanga-calculator.js', 'utf8');
eval(calc);

// Correct Google coordinates for Olympia, WA 98502
const lat = 47.08466;
const lon = -123.02958;

console.log("\n╔═══════════════════════════════════════════════════════════╗");
console.log("║  DISCREPANCY REPORT: Pradosha Dates                      ║");
console.log("║  Location: Olympia, WA 98502                             ║");
console.log("║  Coords: 47.08466°N, -123.02958°W                        ║");
console.log("╚═══════════════════════════════════════════════════════════╝\n");

console.log("Our Calculation (Drik Ayanamsa, UTC-based):");
console.log("  Searching for Tithi 13 or 28...\n");

let currentDate = new Date('2026-06-01');
const endDate = new Date('2026-07-31');
const calculatedPradoshas = [];

while (currentDate <= endDate) {
  const sunLon = getSunLongitude(currentDate, lat, lon);
  const moonLon = getMoonLongitude(currentDate, lat, lon);
  const tithi = calculateTithi(sunLon, moonLon);

  const dateStr = currentDate.toISOString().split('T')[0];

  if (tithi.num === 13 || tithi.num === 28) {
    calculatedPradoshas.push({ date: dateStr, tithi: tithi.num });
    console.log(`  ✅ ${dateStr}: Tithi ${tithi.num} (${tithi.name})`);
  }

  currentDate.setUTCDate(currentDate.getUTCDate() + 1);
}

console.log(`\nCalculated: ${calculatedPradoshas.length} Pradoshas found\n`);

console.log("─".repeat(63));
console.log("\nTraditional Calendars (drikpanchangam.com, prokerala.com):");
console.log("  1. June 12, 2026 (Thirayodasi - 13th tithi)");
console.log("  2. June 26, 2026 (Thirayodasi - 13th tithi)");
console.log("  3. July 11, 2026 (Thirayodasi - 13th tithi)\n");

console.log("─".repeat(63));
console.log("\nANALYSIS:\n");

const expectedDates = ['2026-06-12', '2026-06-26', '2026-07-11'];
const matches = calculatedPradoshas.filter(p =>
  expectedDates.includes(p.date)
).length;

console.log(`Matches: ${matches}/${expectedDates.length}`);
console.log(`Status: ${matches === expectedDates.length ? '✅ MATCH' : '⚠️  MISMATCH'}\n`);

if (calculatedPradoshas.length > 0) {
  console.log("POTENTIAL CAUSES:");
  console.log("  1. Tithi timing - traditional calendars may use local time");
  console.log("  2. Ayanamsa differences - different precision/system");
  console.log("  3. Calculation method - instant vs average tithi duration");
  console.log("  4. Time zone adjustment - calendar shows local date\n");
}

console.log("═".repeat(63) + "\n");
