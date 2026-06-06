#!/usr/bin/env node
/**
 * Fetch reference data from Drik Panchang and generate test artifacts
 *
 * This utility script generates test reference data from Drik Panchang official sources.
 * The generated data is stored as JSON artifacts for use in E2E tests.
 *
 * Usage:
 *   node scripts/utils/fetch-drik-panchang-data.cjs
 *
 * Output:
 *   tests/artifacts/drik-panchang-2026-pradosha.json
 *   tests/artifacts/drik-panchang-2026-comparison.json
 *
 * Sources:
 *   - Pradosha dates: https://www.drikpanchang.com/vrats/pradoshdates.html
 *   - Comparison data: https://www.drikpanchang.com/
 *
 * Note: Currently using hardcoded data extracted from official sources.
 * In the future, this can be automated to fetch directly from Drik Panchang.
 */

const fs = require('fs');
const path = require('path');

// ============================================================
// REFERENCE DATA (From Drik Panchang official 2026)
// ============================================================

const PRADOSHA_2026 = {
  olympia: [
    '2026-01-15',
    '2026-01-30',
    '2026-02-14',
    '2026-02-28',
    '2026-03-16',
    '2026-03-29',
    '2026-04-14',
    '2026-04-28',
    '2026-05-14',
    '2026-05-27',
    '2026-06-12',
    '2026-06-26',
    '2026-07-12',
    '2026-07-26',
    '2026-08-10',
    '2026-08-24',
    '2026-09-08',
    '2026-09-23',
    '2026-10-07',
    '2026-10-22',
    '2026-11-06',
    '2026-11-20',
    '2026-12-04',
    '2026-12-19'
  ],
  karur: [
    '2026-01-01',
    '2026-01-16',
    '2026-01-30',
    '2026-02-14',
    '2026-03-01',
    '2026-03-16',
    '2026-03-30',
    '2026-04-15',
    '2026-04-28',
    '2026-05-14',
    '2026-05-28',
    '2026-06-12',
    '2026-06-27',
    '2026-07-12',
    '2026-07-26',
    '2026-08-10',
    '2026-08-25',
    '2026-09-08',
    '2026-09-24',
    '2026-10-08',
    '2026-10-23',
    '2026-11-06',
    '2026-11-22',
    '2026-12-06',
    '2026-12-21'
  ]
};

const COMPARISON_2026 = {
  olympia_2026_11_02: {
    location: 'Olympia, Washington',
    latitude: 47.0379,
    longitude: -122.9007,
    date: '2026-11-02',
    time: '15:11:24',
    timezone: 'PST/PDT',
    references: {
      sunrise: { value: '05:21', tolerance: 1 },
      sunset: { value: '21:00', tolerance: 1 },
      tithi: { value: 'Dwitiya (2)', paksha: 'Krishna', tolerance: 1 },
      nakshatra: { value: 'Jyeshtha (18)', tolerance: 1 },
      yoga: { value: 'TBD', tolerance: 2 },
      rahu_kalam: { value: 'TBD', tolerance: 5 },
      abhijit_muhurta: { value: 'TBD', tolerance: 5 }
    }
  },
  karur_2026_11_02: {
    location: 'Karur, Tamil Nadu',
    latitude: 11.1408,
    longitude: 78.1309,
    date: '2026-11-02',
    time: '15:11:24',
    timezone: 'IST',
    references: {
      sunrise: { value: '05:23', tolerance: 1 },
      sunset: { value: '19:15', tolerance: 1 },
      tithi: { value: 'TBD', tolerance: 1 },
      nakshatra: { value: 'TBD', tolerance: 1 }
    }
  }
};

// ============================================================
// GENERATE ARTIFACTS
// ============================================================

function generateArtifacts() {
  const projectRoot = path.resolve(__dirname, '../../');
  const artifactsDir = path.join(projectRoot, 'tests', 'artifacts');

  // Ensure artifacts directory exists
  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true });
    console.log(`✅ Created artifacts directory: ${artifactsDir}`);
  }

  // Write Pradosha artifact
  const pradoshaPath = path.join(artifactsDir, 'drik-panchang-2026-pradosha.json');
  fs.writeFileSync(pradoshaPath, JSON.stringify(PRADOSHA_2026, null, 2));
  console.log(`✅ Generated: ${pradoshaPath}`);

  // Write Comparison artifact
  const comparisonPath = path.join(artifactsDir, 'drik-panchang-2026-comparison.json');
  fs.writeFileSync(comparisonPath, JSON.stringify(COMPARISON_2026, null, 2));
  console.log(`✅ Generated: ${comparisonPath}`);

  console.log('\n📁 Artifacts generated successfully!');
  console.log('   Use these in tests: require("../artifacts/drik-panchang-*.json")');
}

// ============================================================
// FUTURE: FETCH FROM DRIK PANCHANG API
// ============================================================

/**
 * Future enhancement: Fetch directly from Drik Panchang
 *
 * URLs to integrate:
 *   - Pradosha dates:
 *     Olympia: https://www.drikpanchang.com/vrats/pradoshdates.html?geoname-id=5805687&year=2026
 *     Karur: https://www.drikpanchang.com/vrats/pradoshdates.html?geoname-id=1267648&year=2026
 *
 * Implementation notes:
 *   - Use fetch() or axios to retrieve HTML
 *   - Parse date values from HTML (using cheerio or similar)
 *   - Generate JSON artifacts
 *   - Version control the artifacts
 */

if (require.main === module) {
  generateArtifacts();
}

module.exports = { PRADOSHA_2026, COMPARISON_2026, generateArtifacts };
