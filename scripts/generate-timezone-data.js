#!/usr/bin/env node

/**
 * Generate timezone data from geo-tz
 * Creates a JSON file with timezone lookup data for Jekyll site
 * Run: npm run build:timezones
 */

import { find } from 'geo-tz';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', '_data');
const outputFile = path.join(dataDir, 'timezones.json');

// Test points for major cities/regions worldwide
const testPoints = [
  // Hawaii
  { lat: 21.3099, lon: -157.8581, name: 'Honolulu' },
  { lat: 21.9749, lon: -159.7834, name: 'Samoa' },
  // Alaska
  { lat: 61.2181, lon: -149.9003, name: 'Anchorage' },
  { lat: 64.2008, lon: -141.0023, name: 'Juneau' },
  // North America West
  { lat: 47.6062, lon: -122.3321, name: 'Seattle' },
  { lat: 34.0522, lon: -118.2437, name: 'Los Angeles' },
  { lat: 39.7392, lon: -104.9903, name: 'Denver' },
  { lat: 33.4484, lon: -112.0742, name: 'Phoenix' },
  // North America Central
  { lat: 41.8781, lon: -87.6298, name: 'Chicago' },
  { lat: 35.0895, lon: -97.0752, name: 'Oklahoma City' },
  // North America East
  { lat: 40.7128, lon: -74.0060, name: 'New York' },
  { lat: 42.3601, lon: -71.0589, name: 'Boston' },
  // Canada
  { lat: 43.6629, lon: -79.3957, name: 'Toronto' },
  { lat: 45.5017, lon: -73.5673, name: 'Montreal' },
  // South America
  { lat: 4.7110, lon: -74.0721, name: 'Bogota' },
  { lat: -23.5505, lon: -46.6333, name: 'São Paulo' },
  { lat: -34.6037, lon: -58.3816, name: 'Buenos Aires' },
  { lat: -33.8688, lon: -51.2093, name: 'Santiago' },
  // Atlantic
  { lat: 37.7412, lon: -25.6756, name: 'Azores' },
  { lat: 16.2650, lon: -23.6350, name: 'Cape Verde' },
  // Europe West
  { lat: 51.5074, lon: -0.1278, name: 'London' },
  { lat: 48.8566, lon: 2.3522, name: 'Paris' },
  { lat: 52.5200, lon: 13.4050, name: 'Berlin' },
  { lat: 52.3676, lon: 4.9041, name: 'Amsterdam' },
  // Europe East
  { lat: 37.9838, lon: 23.7275, name: 'Athens' },
  { lat: 59.3293, lon: 18.0686, name: 'Stockholm' },
  { lat: 55.7558, lon: 37.6173, name: 'Moscow' },
  // Africa
  { lat: 30.0444, lon: 31.2357, name: 'Cairo' },
  { lat: 6.5244, lon: 3.3792, name: 'Lagos' },
  { lat: -33.9249, lon: 18.4241, name: 'Cape Town' },
  { lat: -1.2921, lon: 36.8219, name: 'Nairobi' },
  { lat: 9.0320, lon: 38.7469, name: 'Addis Ababa' },
  // Middle East
  { lat: 35.6892, lon: 51.3890, name: 'Tehran' },
  { lat: 25.2048, lon: 55.2708, name: 'Dubai' },
  { lat: 31.5454, lon: 74.3569, name: 'Lahore' },
  // South Asia
  { lat: 28.7041, lon: 77.1025, name: 'Delhi' },
  { lat: 19.0760, lon: 72.8777, name: 'Mumbai' },
  { lat: 13.0827, lon: 80.2707, name: 'Chennai' },
  { lat: 27.7172, lon: 85.3240, name: 'Kathmandu' },
  // Southeast Asia
  { lat: 13.7563, lon: 100.5018, name: 'Bangkok' },
  { lat: -6.2088, lon: 106.8456, name: 'Jakarta' },
  { lat: 14.5994, lon: 120.9842, name: 'Manila' },
  { lat: 1.3521, lon: 103.8198, name: 'Singapore' },
  // East Asia
  { lat: 31.2304, lon: 121.4737, name: 'Shanghai' },
  { lat: 39.9042, lon: 116.4074, name: 'Beijing' },
  { lat: 35.6762, lon: 139.6503, name: 'Tokyo' },
  { lat: 37.5665, lon: 126.9780, name: 'Seoul' },
  // Australia & Pacific
  { lat: -12.4634, lon: 130.8456, name: 'Darwin' },
  { lat: -31.9505, lon: 115.8605, name: 'Perth' },
  { lat: -37.8136, lon: 144.9631, name: 'Melbourne' },
  { lat: -33.8688, lon: 151.2093, name: 'Sydney' },
  { lat: -41.2865, lon: 174.7762, name: 'Auckland' },
];

// Create timezone lookup table
const timezoneMap = {};

console.log('Generating timezone data from geo-tz...');

testPoints.forEach(point => {
  try {
    const tzArray = find(point.lat, point.lon);
    const timezone = tzArray && tzArray.length > 0 ? tzArray[0] : 'UTC';

    if (!timezoneMap[timezone]) {
      timezoneMap[timezone] = [];
    }
    timezoneMap[timezone].push({
      name: point.name,
      lat: point.lat,
      lon: point.lon
    });

    console.log(`✓ ${point.name.padEnd(20)} → ${timezone}`);
  } catch (error) {
    console.warn(`✗ ${point.name}: ${error.message}`);
  }
});

// Create browser-compatible lookup function
const timezoneData = {
  version: '1.0',
  generated: new Date().toISOString(),
  // For browser, include a simple function that finds nearest timezone
  // This will be stringified and used in browser
  testCases: testPoints.map(p => ({
    lat: p.lat,
    lon: p.lon,
    tz: find(p.lat, p.lon)[0] || 'UTC'
  }))
};

// Ensure _data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log(`Created directory: ${dataDir}`);
}

// Write to file
fs.writeFileSync(outputFile, JSON.stringify(timezoneData, null, 2));
console.log(`\n✓ Generated timezone data: ${outputFile}`);
console.log(`  Total test cases: ${timezoneData.testCases.length}`);
console.log(`  Unique timezones: ${new Set(timezoneData.testCases.map(t => t.tz)).size}`);
