---
name: tdd
description: Test-Driven Development patterns for panchanga calculator
---

# TDD Skill

## Core Pattern: Test → Fail → Code → Pass

### Step 1: Understand Requirement

Read task acceptance criteria. Example:

```
# Task 0001: Fix Widget Null-Check Crashes
## Acceptance Criteria
- [ ] Widget handles undefined panchanga gracefully
- [ ] No console errors when calculation fails
- [ ] E2E tests pass
```

### Step 2: Write Failing Test

Create test matching the criterion:

```javascript
// tests/panchanga-calculator.test.js
tests.push({
  name: 'Tithi should handle undefined panchanga',
  test: () => {
    const p = undefined;
    const phase = p?.tithi?.phase?.toUpperCase?.() ?? 'N/A';
    assertEqual(phase, 'N/A', 'Should return N/A for undefined panchanga');
  }
});
```

### Step 3: Run Test (Fail)

```bash
./scripts/feature-workflow.sh test

# Output:
# ❌ Test: Tithi should handle undefined...
#    Expected: 'N/A', Got: undefined
#    FAIL
```

### Step 4: Implement Code

Fix the code to make test pass:

```javascript
// In widget HTML or JavaScript
const phase = p?.tithi?.phase?.toUpperCase?.() ?? 'N/A';  // Safe now
```

### Step 5: Run Test (Pass)

```bash
./scripts/feature-workflow.sh test

# Output:
# ✅ PASS: Tithi should handle undefined...
# ✅ All 15 unit tests passed
# ✅ All 70 integration tests passed
```

### Step 6: Commit

```bash
./scripts/feature-workflow.sh commit "Fix: Null-check in panchanga access

- Add optional chaining to tithi.phase
- Handle undefined panchanga gracefully
- Test now passing

Fixes #0001"
```

## Test Organization

| Test Type | Location | Purpose |
|-----------|----------|---------|
| Unit | `assets/js/foo.test.js` (future) or `tests/` | Pure function tests with mocks |
| Integration | `tests/*integration*.js` | Real astronomical formulas, no mocks |
| E2E | `tests/e2e.spec.js` | Browser workflows, multi-device |

## Where to Add Tests

**Widget HTML changes** → `tests/widget-issues.test.js` or `tests/e2e.spec.js`

**Calculation logic** → `tests/panchanga-calculator.test.js`

**Accuracy/real-world** → `tests/panchanga-calculator-integration.test.cjs`

## BDD Approach (Behavior-Driven Development)

Frame tests as user behaviors:

```javascript
// Instead of: "test null check"
// Frame as: "widget gracefully handles undefined results"

tests.push({
  name: 'Widget displays N/A when calculation fails',
  test: () => {
    // Simulate calculation returning undefined
    const result = undefined;
    // User sees N/A instead of crash
    const display = result?.tithi?.name ?? 'N/A';
    assertEqual(display, 'N/A');
  }
});
```

## Test Debugging

### Test Fails: What to Check

1. **Is the test correct?** (Check assertion logic)
2. **Is the code right?** (Check implementation)
3. **Is the environment ready?** (Container running?)

### Run Single Test

```bash
podman exec saivamcloud-test node tests/panchanga-calculator.test.js 2>&1 | grep -A 5 "failing test name"
```

### Read Detailed Error

```bash
podman exec saivamcloud-test node tests/panchanga-calculator.test.js 2>&1 | head -50
```

## Tips

- **One criterion = one test** (don't combine multiple checks)
- **Test names are documentation** ("Widget handles undefined" is better than "Test 1")
- **Fix code, not tests** (if test fails, code is wrong—don't weaken test)
- **Test first, code second** (forces you to think about design)
- **Run tests frequently** (catch regressions early)
- **All tests pass before committing** (never commit failing tests)
