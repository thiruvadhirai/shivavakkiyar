---
id: 0035
title: "REFACTOR: Test data architecture - move hardcoded data to stored artifacts"
status: open
impact: Medium
priority: 030
complexity: "2-3 hours"
assignee: dev
raci:
  responsible: dev
  accountable: tech-lead
  consulted: []
  informed: []
dependencies: []
blocked_by: []
related: [0030]
---

# Refactor Test Data Architecture

## Problem Statement

Current E2E tests have hardcoded reference data embedded in test files:
- `tests/panchanga-e2e-drik-panchang-comparison.cjs` (lines 19-51)
- `tests/panchanga-e2e-365day-pradosha-validation.cjs` (lines 23-41)

This causes:
- ❌ Data not version-controlled separately
- ❌ Reference data cannot be updated without editing test files
- ❌ Tests depend on hardcoded URLs (fragile)
- ❌ No separation between "fetch data" and "validate calculator"
- ❌ Artifact `365day-astronomy-vs-drikpanchang-2026.json` exists but unused

## Objective

Implement proper test data architecture:
1. **Utility script**: Fetch/generate reference data from Drik Panchang
2. **Stored artifacts**: Version-controlled test reference data (JSON files)
3. **Clean tests**: Tests read artifacts and validate calculator output

## Solution Architecture

```
scripts/utils/
└── fetch-drik-panchang-data.cjs
    └─ Fetches from Drik Panchang URLs
    └─ Generates test artifacts
    └─ Output: tests/artifacts/*.json

tests/artifacts/
├── drik-panchang-2026-pradosha.json
│   └─ Pradosha dates (Olympia, Karur)
├── drik-panchang-2026-comparison.json
│   └─ Comparison reference data
└── (version controlled in git)

tests/
├── panchanga-e2e-drik-panchang-comparison.cjs
│   └─ Reads: tests/artifacts/drik-panchang-2026-comparison.json
├── panchanga-e2e-365day-pradosha-validation.cjs
│   └─ Reads: tests/artifacts/drik-panchang-2026-pradosha.json
└── (tests remain simple - just validate)
```

## Implementation Steps

### Phase 1: Create Utility Script
**File**: `scripts/utils/fetch-drik-panchang-data.cjs`

```javascript
/**
 * Fetch reference data from Drik Panchang and generate test artifacts
 * 
 * Usage: node scripts/utils/fetch-drik-panchang-data.cjs
 * Output: tests/artifacts/drik-panchang-*.json
 */

// Fetch Pradosha dates for 2026
// - Olympia: geoname-id=5805687
// - Karur: geoname-id=1267648
// URLs: https://www.drikpanchang.com/vrats/pradoshdates.html?geoname-id=XXX&year=2026

// Generate: tests/artifacts/drik-panchang-2026-pradosha.json
// {
//   "olympia": ["2026-01-15", "2026-01-30", ...],
//   "karur": ["2026-01-01", "2026-01-16", ...]
// }

// Generate: tests/artifacts/drik-panchang-2026-comparison.json
// {
//   "olympia_2026_11_02": { sunrise, sunset, tithi, nakshatra, ... },
//   "karur_2026_11_02": { ... }
// }
```

### Phase 2: Create Test Artifact Files
**Files to create**:
- `tests/artifacts/drik-panchang-2026-pradosha.json` (extracted from test file)
- `tests/artifacts/drik-panchang-2026-comparison.json` (extracted from test file)

### Phase 3: Refactor Test Files
**Files to modify**:
- `tests/panchanga-e2e-drik-panchang-comparison.cjs` 
  - Remove hardcoded data (lines 19-51)
  - Add: `const REFERENCE_DATA = require('../artifacts/drik-panchang-2026-comparison.json');`
  
- `tests/panchanga-e2e-365day-pradosha-validation.cjs`
  - Remove hardcoded data (lines 23-41)
  - Add: `const PRADOSHA_REFERENCE = require('../artifacts/drik-panchang-2026-pradosha.json');`

### Phase 4: Add to Version Control
**Add to git**:
- `scripts/utils/fetch-drik-panchang-data.cjs`
- `tests/artifacts/` directory with all JSON files

## Acceptance Criteria

- [ ] Utility script `scripts/utils/fetch-drik-panchang-data.cjs` created
- [ ] Test artifact files created in `tests/artifacts/`
  - [ ] `drik-panchang-2026-pradosha.json` 
  - [ ] `drik-panchang-2026-comparison.json`
- [ ] Test files refactored to read from artifacts
  - [ ] `panchanga-e2e-drik-panchang-comparison.cjs`
  - [ ] `panchanga-e2e-365day-pradosha-validation.cjs`
- [ ] All tests still pass with new architecture
- [ ] Artifact files are version-controlled in git
- [ ] Hardcoded data removed from test files
- [ ] README added explaining:
  - How to update reference data (run utility script)
  - Where artifacts are stored
  - How tests use artifacts

## Benefits

✅ Clear separation: fetch vs validate logic  
✅ Data is version-controlled  
✅ Reference data easily updatable (run utility script)  
✅ Tests are simpler (just validate)  
✅ Reusable artifacts across multiple test suites  
✅ Follows industry best practice (fixtures/test data separation)

## Notes

- Existing artifact `365day-astronomy-vs-drikpanchang-2026.json` should be moved to `tests/artifacts/`
- Consider adding `.gitignore` rules if artifacts are regenerated on CI
- Document the Drik Panchang URLs for future reference updates

## Related Tasks

- Task 0030: E2E tests for Panchanga Calculator validation (original test suite)
- Task 0026: Cleanup old workflow artifacts

## Timeline

- Phase 1-2: Create utility + artifacts (30 min)
- Phase 3: Refactor tests (30 min)
- Phase 4: Test + commit (30 min)
- **Total: 1.5-2 hours**
