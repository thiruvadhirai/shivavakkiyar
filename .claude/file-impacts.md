# File Impact Analysis - Change Propagation Map

When you modify a file, what else breaks or needs updating? This document maps the impact chain.

---

## 📂 Core Calculation Files

### ⚙️ assets/js/panchanga-calculator.js
**When you modify this file:**

**Tests That Fail:**
- `tests/panchanga-calculator.test.js` (15 unit tests)
- `tests/panchanga-calculator-integration.test.js` (70 integration tests)
- `tests/e2e.spec.js` (8+ E2E tests via widgets)

**Widgets Affected:**
- `_includes/panchanga-widget-full.html` (CRITICAL - depends on calculation functions)
- `_includes/panchanga-widget-simple.html` (CRITICAL - depends on calculation functions)

**Pages Affected:**
- `panchanga.md` (widget won't display correct results)
- `pradoshakalapooja.md` (widget won't display correct results)

**Breaking Changes to Watch:**
- Changing function signature (e.g., `calculateTithi()` parameters)
- Removing exported functions
- Changing calculation algorithm (may break expected values)
- Changing return object structure (e.g., `tithi.phase` → `tithi.phaseName`)

**Safe Changes:**
- Adding new calculation functions
- Fixing bugs in existing calculations
- Adding new exports (backward compatible)
- Internal refactoring (if function signatures unchanged)

**Action:** Always run `npm test` before committing

---

### 📍 assets/js/location-manager.js
**When you modify this file:**

**Tests That Fail:**
- `tests/panchanga-calculator.test.js` (geocoding tests)
- `tests/e2e.spec.js` (location input tests 1-2)

**Widgets Affected:**
- `_includes/panchanga-widget-full.html` (location search breaks)
- `_includes/panchanga-widget-simple.html` (location search breaks)

**Features Affected:**
- Location input autocomplete
- localStorage caching
- Recently used locations dropdown
- Location validation

**Breaking Changes to Watch:**
- Changing `geocodeLocation()` return format
- Changing cache key names (`panchanga_location`, `panchanga_geocoding_cache`)
- Removing `getGeocodingCache()` method (breaks dropdown)
- Changing coordinate validation rules

**Safe Changes:**
- Improving Nominatim query handling
- Optimizing cache performance
- Adding new location utilities
- Fixing bugs in geocoding logic

**Action:** Always run `npm test` before committing

---

## 🎨 Widget HTML & CSS Files

### 📝 _includes/panchanga-widget-full.html
**When you modify this file:**

**Tests That Fail:**
- `tests/e2e.spec.js` (8 Panchanga Calculator Page tests)

**Pages Affected:**
- `panchanga.md` (widget display broken or functional)

**Dependencies:**
- `assets/js/panchanga-calculator.js` (must be loaded, or widget can't calculate)
- `assets/js/location-manager.js` (must be loaded, or location search fails)
- `assets/css/panchanga.css` (widget styling)

**Known Issues to Fix:**
- **Line 311:** `p.tithi.phase.toUpperCase()` - needs null check
  - Fix: `p?.tithi?.phase?.toUpperCase?.()`
  - Impact: Widget crashes if tithi is undefined

**Areas to Touch Carefully:**
- Form input IDs (E2E tests locate by ID)
- Button text (E2E tests click "Calculate" button)
- Result container class (E2E tests check for `.result`, `[class*="result"]`)
- Error message container (E2E tests look for error display)

**Safe Changes:**
- Fixing the null check issues (CRITICAL)
- Improving form UX
- Adding new display fields
- Enhancing accessibility

**Action:** Run E2E tests after changes: `npm run test:e2e`

---

### 📝 _includes/panchanga-widget-simple.html
**When you modify this file:**

**Tests That Fail:**
- `tests/e2e.spec.js` (2 Pradosha Calculator Widget tests)

**Pages Affected:**
- `pradoshakalapooja.md` (once widget is integrated)

**Dependencies:**
- `assets/js/panchanga-calculator.js` (must be loaded)
- `assets/js/location-manager.js` (must be loaded)
- `assets/css/panchanga.css` (widget styling)

**Known Issues to Fix:**
- **Line 344:** `p.tithi.phase.toUpperCase()` - needs null check
  - Fix: `p?.tithi?.phase?.toUpperCase?.()`
  - Impact: Widget crashes when displaying results

**Areas to Touch Carefully:**
- Form input IDs (E2E tests depend on them)
- Button IDs and text
- Result display class names
- Expandable details section (E2E may test expand/collapse)

**Action:** Run E2E tests after changes: `npm run test:e2e`

---

### 🎨 assets/css/panchanga.css
**When you modify this file:**

**Tests That Might Fail:**
- `tests/e2e.spec.js` (if visual layout breaks, some tests may timeout)

**Widgets Affected:**
- `_includes/panchanga-widget-full.html` (visual display)
- `_includes/panchanga-widget-simple.html` (visual display)

**Safe Changes:**
- Colors, fonts, spacing
- Layout adjustments
- Responsive breakpoints
- Adding hover/focus states
- Dark mode improvements

**Careful Changes:**
- Grid layout changes (might break responsive design)
- Hide/show elements with `display: none` (might break E2E expectations)
- Changing class names (if E2E tests depend on them)

**Action:** Visual inspection after changes - run widgets in browser

---

## 📄 Page Files

### 📰 panchanga.md
**When you modify this file:**

**Tests That Fail:**
- `tests/e2e.spec.js` (page load test)

**Dependencies:**
- `_includes/panchanga-widget-full.html` (must include this)
- `_layouts/default.html` (parent layout)
- All JS/CSS files included by layout

**What Changes Matter:**
- Changing the widget include tag breaks E2E tests
- Removing documentation doesn't affect functionality
- Changing page title/header affects page load test

**Safe Changes:**
- Adding documentation
- Improving instructions
- Adding examples
- Fixing typos

**Critical Changes:**
- Do NOT remove or comment out `{% include panchanga-widget-full.html %}`

---

### 📰 pradoshakalapooja.md
**When you modify this file:**

**Status:** Widget needs to be integrated (PENDING)

**When Widget is Added:**
- Add this line: `{% include panchanga-widget-simple.html %}`
- `tests/e2e.spec.js` Pradosha widget tests will start passing

**Dependencies (Once Added):**
- `_includes/panchanga-widget-simple.html`
- `_layouts/default.html`
- All JS/CSS files

**Safe Changes Now:**
- Adding documentation about Pradosha
- Fixing content typos
- Adding navigation links

**Action After Widget Integration:**
- Run `tests/e2e.spec.js` to verify widget works on page

---

## 🧪 Test Files

### 🧪 tests/panchanga-calculator.test.js
**When you modify this file:**

**Impact:** Only on development process
- Other tests not affected
- But unit test failures will block commits (if using workflow script)

**Why Modify:**
- Add new test cases when adding calculations
- Fix test expectations if calculations intentionally change
- Add edge case tests

**When to Worry:**
- Don't change test file without understanding why test exists
- Removing tests hides bugs
- If test fails, fix the code, not the test

---

### 🧪 tests/panchanga-calculator-integration.test.js
**When you modify this file:**

**Impact:** Only on development
- Validates real calculations work correctly
- Integration test failures indicate algorithm bugs

**Why Modify:**
- Add new integration scenarios
- Test edge cases
- Validate against known astronomical values

---

### 🧪 tests/e2e.spec.js
**When you modify this file:**

**Impact:** Only on development
- E2E tests validate browser interactions
- Widget HTML/CSS/JS changes might require test updates

**When Tests Need Updating:**
- Changed button text? Update test selectors
- Changed form IDs? Update locators
- Added new fields? Add new assertions
- Changed workflow? Update test steps

**When Tests Break:**
- Don't disable tests, fix the code
- E2E test failures indicate real user impact

---

## 🎯 Configuration Files

### .gitignore
**When you modify this file:**

**Impact:** What gets committed to git
- Adding `_site/` ensures build output doesn't bloat repo
- Adding `node_modules/` keeps dependencies out
- Incorrect .gitignore leads to huge commits

**Breaking Changes:**
- Removing important exclusions pollutes git history
- Adding **necessary** files to ignore prevents deployment

**Example Impact:**
- Remove `_site/` from .gitignore → 1000s of build files committed
- Remove `node_modules/` from .gitignore → 300MB+ of deps committed

**Action:** Verify .gitignore with `git status` after changes

---

### package.json
**When you modify this file:**

**Impact:** Project dependencies and scripts

**Critical Changes:**
- Adding dependencies → must run `npm install`
- Changing test scripts → tests won't run as expected
- Removing scripts → workflow scripts break

**Breaking Changes to Watch:**
- Changing `"type": "module"` affects ES6 imports
- Changing test script paths breaks CI/CD
- Removing test scripts prevents testing

**Safe Changes:**
- Adding new dependencies (properly)
- Updating version numbers
- Adding new scripts
- Updating descriptions

---

### VERSION
**When you modify this file:**

**Impact:** Version display in footer + development workflow
- Displayed in widget footer
- Tracked in git history
- Referenced in deployment

**Rules:**
- Format: `MAJOR.MINOR.PATCH-STAGE.NUM`
- Example: `1.0.0-beta.7`
- Should auto-increment on commits (via git hook)

**If You Must Modify:**
- Only increment MINOR for feature completions
- Fix inconsistencies (e.g., `1.0.0-1.0.0.` is broken)
- Increment before merging to main

---

## 🔄 Dependency Chain Summary

### "Golden Path" - All Tests Pass
```
1. Edit panchanga-calculator.js or location-manager.js
   ↓
2. npm test runs automatically (via workflow script)
   ↓
3. Unit tests (15) pass ✅
   ↓
4. Integration tests (70) pass ✅
   ↓
5. If tests pass: git commit creates new version
   ↓
6. Feature complete: merge to main
```

### "Broken Path" - Tests Fail
```
1. Edit widget HTML (e.g., fix null check)
   ↓
2. E2E tests might show new errors
   ↓
3. Run tests: npm run test:e2e
   ↓
4. Fix widget HTML based on errors
   ↓
5. Re-run tests until passing
   ↓
6. Commit when tests pass
```

### "Silent Break" - No Tests Catch It
```
1. Edit CSS only (colors, spacing)
   ↓
2. All tests still pass (CSS not tested by unit/integration)
   ↓
3. Widget looks broken in browser
   ↓
4. Caught by: Visual inspection during testing
   ↓
5. Fix CSS, test manually in browser
```

---

## 🚨 Critical Dependencies (If These Break, Everything Breaks)

| File | Why Critical | Impact |
|------|-------------|--------|
| `_layouts/default.html` | Loads all JS/CSS | All pages broken, no scripts run |
| `assets/js/panchanga-calculator.js` | Core engine | Widgets don't calculate, all tests fail |
| `assets/js/location-manager.js` | Location lookup | Location search broken, E2E fails |
| `panchanga.md` | Widget host | Widget page doesn't exist |
| `package.json` | Test scripts | Can't run tests |
| `.gitignore` | Repo management | Huge commits, slow git |

---

## ✅ Checklist: Before Committing

- [ ] **Identify** what file you're changing
- [ ] **Look up** impact chain above
- [ ] **Run** affected test suites
- [ ] **Fix** any test failures
- [ ] **Manual test** if needed (CSS, HTML changes)
- [ ] **Verify** no unrelated files were modified
- [ ] **Commit** only related changes
- [ ] **Check** git log to verify version incremented

---

*Last Updated: May 28, 2026*
