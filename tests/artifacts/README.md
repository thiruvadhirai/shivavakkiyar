# Test Artifacts

This directory contains reference data used by E2E tests to validate the Panchanga Calculator against official Drik Panchang values.

## Files

### `drik-panchang-2026-pradosha.json`
Pradosha dates for 2026 from Drik Panchang official sources.
- **Location 1**: Olympia, Washington (geoname-id: 5805687)
- **Location 2**: Karur, Tamil Nadu (geoname-id: 1267648)
- **Source**: https://www.drikpanchang.com/vrats/pradoshdates.html?geoname-id=XXX&year=2026
- **Used by**: `tests/panchanga-e2e-365day-pradosha-validation.cjs`

### `drik-panchang-2026-comparison.json`
Sample reference data for Panchanga comparison tests.
- **Date**: November 2, 2026
- **Locations**: Olympia, WA and Karur, India
- **References**: Sunrise/sunset, Tithi, Nakshatra, Yoga, Rahu Kalam, Abhijit Muhurta
- **Source**: Drik Panchang official
- **Used by**: `tests/panchanga-e2e-drik-panchang-comparison.cjs`

## Updating Reference Data

To update reference data with fresh values from Drik Panchang:

```bash
# Generate/regenerate artifacts
node scripts/utils/fetch-drik-panchang-data.cjs
```

This script:
1. Reads reference data from official Drik Panchang sources
2. Generates/overwrites JSON files in this directory
3. Outputs confirmation messages

## Architecture

This separation of concerns provides:
- **Clean test files**: Tests contain only validation logic
- **Version-controlled data**: Reference data is tracked in git
- **Maintainability**: Update data without editing test files
- **Reusability**: Artifacts can be used across multiple test suites

## Future Enhancement

The utility script is currently configured to use hardcoded data extracted from official sources. In the future, it can be enhanced to:
1. Fetch directly from Drik Panchang API/web pages
2. Parse HTML responses (using cheerio or similar)
3. Generate artifacts automatically
4. Validate against multiple years and locations

## Quality Assurance

When updating artifacts:
1. Verify data from official Drik Panchang sources
2. Run tests to ensure calculator matches reference data
3. Commit updates with clear commit messages
4. Document any changes to reference values

```bash
# Run tests to validate calculator against artifacts
npm test -- panchanga-e2e-drik-panchang-comparison.cjs
npm test -- panchanga-e2e-365day-pradosha-validation.cjs
```
