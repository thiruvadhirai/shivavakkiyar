/**
 * Verify Pradosha dates for Olympia, Washington 98502
 * Using correct Google coordinates: 47.08466°N, -123.02958°W
 * Expected dates: 6/12, 6/26, 7/11
 */

const fs = require('fs');
const calc = fs.readFileSync('./assets/js/panchanga-calculator.js', 'utf8');
eval(calc);

// Correct Google coordinates for Olympia, WA 98502
const lat = 47.08466;
const lon = -123.02958;

console.log("\n═══════════════════════════════════════════════════════════");
console.log("  Pradosha Verification: Olympia, WA 98502");
console.log("  Coordinates: 47.08466°N, -123.02958°W");
console.log("═══════════════════════════════════════════════════════════\n");

const testDates = [
  '2026-06-11', '2026-06-12', '2026-06-13',
  '2026-06-25', '2026-06-26', '2026-06-27',
  '2026-07-10', '2026-07-11', '2026-07-12'
];

console.log("Tithi values on test dates:\n");

const pradoshas = [];
testDates.forEach(dateStr => {
  const date = new Date(dateStr);
  const sunLon = getSunLongitude(date, lat, lon);
  const moonLon = getMoonLongitude(date, lat, lon);
  const tithi = calculateTithi(sunLon, moonLon);

  const isPradosha = tithi.num === 13 || tithi.num === 28;
  const mark = isPradosha ? '✅' : '  ';

  console.log(`${mark} ${dateStr}: Tithi ${tithi.num} (${tithi.name}, ${tithi.phase})`);

  if (isPradosha) {
    pradoshas.push(dateStr);
  }
});

console.log("\n───────────────────────────────────────────────────────────");
console.log("RESULTS:\n");

console.log("Expected Pradosha dates (user verified):");
console.log("  1. 2026-06-12");
console.log("  2. 2026-06-26");
console.log("  3. 2026-07-11\n");

console.log("Calculated Pradosha dates (Tithi 13 or 28):");
if (pradoshas.length > 0) {
  pradoshas.forEach((date, i) => {
    console.log(`  ${i + 1}. ${date}`);
  });
} else {
  console.log("  ❌ No Pradoshas found!");
}

console.log("\n═══════════════════════════════════════════════════════════\n");
