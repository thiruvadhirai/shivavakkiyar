#!/usr/bin/env node
/**
 * Verify Pradosha dates for Olympia, Washington 98502
 * Using correct Google coordinates
 */

const fs = require('fs');
const path = require('path');

const calcPath = path.join(__dirname, '../assets/js/panchanga-calculator.js');
const calcCode = fs.readFileSync(calcPath, 'utf8');
eval(calcCode);

// Correct coordinates from Google
const lat = 47.08466;
const lon = -123.02958;

console.log("\n=== Pradosha Verification: Olympia, WA 98502 ===");
console.log(`Coordinates: ${lat}°N, ${lon}°W\n`);

const testDates = [
  '2026-06-11', '2026-06-12', '2026-06-13',
  '2026-06-25', '2026-06-26', '2026-06-27',
  '2026-07-10', '2026-07-11', '2026-07-12'
];

console.log("Testing for Pradosha dates (Tithi 13 or 28):\n");

testDates.forEach(dateStr => {
  const date = new Date(dateStr);
  const sunLon = getSunLongitude(date, lat, lon);
  const moonLon = getMoonLongitude(date, lat, lon);
  const tithi = calculateTithi(sunLon, moonLon);
  
  const isPradosha = tithi.num === 13 || tithi.num === 28;
  const mark = isPradosha ? '✅ PRADOSHA' : '';
  
  console.log(`${dateStr}: Tithi ${tithi.num} (${tithi.name}, ${tithi.phase}) ${mark}`);
});

console.log("\nExpected dates (user verified):");
console.log("  1. 2026-06-12");
console.log("  2. 2026-06-26");
console.log("  3. 2026-07-11");
