# Project Architecture - File Organization & Relationships

**For step-by-step setup and development procedures**, see [DEVELOPMENT.md](./DEVELOPMENT.md).

## Directory Structure

```
shivavakkiyar/
├── .claude/                          # Project documentation & configuration
│   ├── WORKFLOW.md                   # Mandatory development workflow
│   ├── DEVELOPMENT.md                # Setup & development guide
│   ├── SKILLS.md                     # Technical stack & domain knowledge
│   ├── features.json                 # Feature inventory & test coverage
│   ├── architecture.md               # This file - file relationships
│   ├── file-impacts.md               # Change impact tracking
│   └── settings.json                 # Claude Code configuration
│
├── assets/
│   ├── js/
│   │   ├── panchanga-calculator.js   # Core astronomical calculations
│   │   ├── location-manager.js       # Geolocation & geocoding
│   │   └── astronomy.browser.js      # NASA JPL ephemeris (413KB, local)
│   │
│   └── css/
│       ├── cayman-theme.css          # GitHub Pages theme (local)
│       ├── custom.css                # Site-wide styling
│       └── panchanga.css             # Calculator widget styles
│
├── _includes/
│   ├── panchanga-widget-full.html    # Complete calculator widget
│   └── panchanga-widget-simple.html  # Simplified Pradosha widget
│
├── _layouts/
│   └── default.html                  # Main layout (includes JS scripts)
│
├── _data/
│   ├── nav.yml                       # Navigation menu
│   └── version.yml                   # Version info (deprecated - use VERSION file)
│
├── tests/
│   ├── panchanga-calculator.test.js              # Unit tests (15/15 passing)
│   ├── panchanga-calculator-integration.test.js  # Integration tests (70/70 passing)
│   ├── e2e.spec.js                              # E2E tests (15 tests ready)
│   ├── playwright.config.js                     # Playwright configuration
│   └── widget-issues.test.js                    # Widget null check tests
│
├── scripts/
│   ├── README-scripts.md             # Documentation for utility scripts
│   ├── feature-workflow.sh           # Feature branch workflow enforcement
│   ├── push-to-github.sh             # Push to GitHub safely
│   └── tests/                        # Tests for utility scripts
│       ├── test-generate-features.py
│       ├── test-sync-docs.py
│       └── test-validate-commits.py
│
├── panchanga.md                      # Full calculator page
├── pradoshakalapooja.md              # Pradosha page (needs widget integration)
├── [other content files].md          # Mantras, poems, documentation
│
├── .gitignore                        # Exclude _site/, node_modules/, etc
├── package.json                      # npm dependencies & test scripts
├── podman-compose.yml                # Container orchestration
├── Dockerfile.test                   # E2E test container
├── VERSION                           # Semantic version (1.0.0-beta.7)
│
└── _site/                            # Jekyll build output (excluded from git)
    └── [generated HTML/CSS/JS files]
```

---

## Component Relationships

### Data Flow: User Input → Calculation → Display

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  User Enters Location (Widget HTML)                                │
│         ↓                                                            │
│  location-manager.js: geocodeLocation()                            │
│  ├─ Query Nominatim API                                            │
│  ├─ Cache result in localStorage                                   │
│  └─ Return coordinates to widget                                   │
│         ↓                                                            │
│  User Selects Date (Widget HTML)                                   │
│         ↓                                                            │
│  User Clicks Calculate                                             │
│         ↓                                                            │
│  panchanga-calculator.js: calculateFullPanchanga()                │
│  ├─ getDrikAyanamsa(date)                                          │
│  ├─ getSunLongitude(date, lat, lon)                               │
│  ├─ getMoonLongitude(date, lat, lon)                              │
│  ├─ calculateTithi(sunLon, moonLon)                               │
│  ├─ calculateNakshatra(moonLon)                                    │
│  ├─ calculateYoga(sunLon, moonLon)                                │
│  ├─ calculateKarana(tithiNum)                                      │
│  ├─ calculateHora(date, sunrise)                                   │
│  ├─ calculateRahuKalam(sunrise, sunset, date)                     │
│  ├─ calculateAbhijitMuhurta(sunrise, sunset)                      │
│  ├─ findNextPradosha(date, lat, lon)                              │
│  └─ Return results object                                          │
│         ↓                                                            │
│  Widget HTML: Display Results                                      │
│  ├─ Tithi name, phase, completion%                                │
│  ├─ Nakshatra name, completion%                                    │
│  ├─ Yoga, Karana, Hora names                                       │
│  ├─ Rahu Kalam times                                               │
│  ├─ Abhijit Muhurta times                                          │
│  └─ Next 3 Pradosha dates & times                                 │
│         ↓                                                            │
│  CSS: Style Results (panchanga.css)                                │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## File Dependency Map

### panchanga-calculator.js (Core Engine)
**Depends On:**
- None (standalone, no external dependencies)
- Optional: astronomy.browser.js (Astronomy Engine for precision)

**Used By:**
- `_includes/panchanga-widget-full.html` (widget calculations)
- `_includes/panchanga-widget-simple.html` (widget calculations)
- `tests/panchanga-calculator.test.js` (unit testing)
- `tests/panchanga-calculator-integration.test.js` (integration testing)
- `tests/e2e.spec.js` (E2E testing via browser)

**Exports:**
- `calculateFullPanchanga(date, lat, lon)`
- `calculateTithi(sunLon, moonLon)`
- `calculateNakshatra(moonLon)`
- `calculateYoga(sunLon, moonLon)`
- `calculateKarana(tithiNum)`
- `calculateHora(date, sunrise)`
- `calculateRahuKalam(sunrise, sunset, date)`
- `calculateAbhijitMuhurta(sunrise, sunset)`
- `findNextPradosha(date, lat, lon, maxSearch)`
- `getDrikAyanamsa(date)`
- `getSunLongitude(date, lat, lon)`
- `getMoonLongitude(date, lat, lon)`
- `getSunrise(date, lat, lon)`
- `getSunset(date, lat, lon)`

---

### location-manager.js (Location Handler)
**Depends On:**
- None (standalone, pure JavaScript)
- External: Nominatim API (OpenStreetMap)

**Used By:**
- `_includes/panchanga-widget-full.html` (location search)
- `_includes/panchanga-widget-simple.html` (location search)
- `tests/panchanga-calculator.test.js` (geocoding tests)
- `tests/e2e.spec.js` (E2E location input tests)

**Exports:**
- `class LocationManager` with methods:
  - `geocodeLocation(query)`
  - `getStoredLocation()`
  - `saveLocationToStorage(location)`
  - `getCachedLocation(query)`
  - `getGeocodingCache()`
  - `isValidCoordinates(lat, lon)`

---

### Widget HTML Files
**panchanga-widget-full.html**
- Depends On:
  - `assets/js/panchanga-calculator.js`
  - `assets/js/location-manager.js`
  - `assets/css/panchanga.css`
  - `_layouts/default.html` (parent layout)
- Included In:
  - `panchanga.md` (via Jekyll include tag)
- Tested By:
  - `tests/e2e.spec.js` (8 test cases)

**panchanga-widget-simple.html**
- Depends On:
  - `assets/js/panchanga-calculator.js`
  - `assets/js/location-manager.js`
  - `assets/css/panchanga.css`
  - `_layouts/default.html` (parent layout)
- Should Be Included In:
  - `pradoshakalapooja.md` (PENDING INTEGRATION)
- Tested By:
  - `tests/e2e.spec.js` (2 test cases)

---

### Page Files
**panchanga.md**
- Includes: `_includes/panchanga-widget-full.html`
- Uses: `_layouts/default.html`
- Tested By: `tests/e2e.spec.js` (load, interaction, results)
- Status: ✅ Complete, widget integrated

**pradoshakalapooja.md**
- Should Include: `_includes/panchanga-widget-simple.html` (PENDING)
- Uses: `_layouts/default.html`
- Tested By: `tests/e2e.spec.js` (load, interaction)
- Status: ⚠️ Documentation in place, widget not yet integrated

---

### Layout Files
**_layouts/default.html**
- Parent Layout For: All pages (panchanga.md, pradoshakalapooja.md, etc.)
- Includes Scripts:
  ```html
  <script src="/assets/js/panchanga-calculator.js"></script>
  <script src="/assets/js/location-manager.js"></script>
  <script src="/assets/js/astronomy.browser.js"></script>
  ```
- Includes CSS:
  ```html
  <link rel="stylesheet" href="/assets/css/panchanga.css">
  ```
- Displays: Version number in footer

---

### Test Files
**panchanga-calculator.test.js** (Unit Tests - 15/15 passing)
- Tests: `assets/js/panchanga-calculator.js`
- Coverage: Ayanamsa, Tithi, Nakshatra, normalization, edge cases
- Framework: Vanilla Node.js (no dependencies)
- Run: `npm run test:unit`

**panchanga-calculator-integration.test.js** (Integration Tests - 70/70 passing)
- Tests: Real astronomical calculations without browser
- Coverage: Fallback formulas, location edge cases, accuracy validation
- Framework: Vanilla Node.js
- Run: `npm run test:integration`

**e2e.spec.js** (E2E Tests - 15 tests ready)
- Tests: Actual browser interaction with widgets
- Coverage: Page load, forms, calculations, results, errors, accessibility
- Framework: Playwright
- Browsers: Chromium, Firefox, Mobile Chrome
- Run: `npm run test:e2e` (requires browser binaries setup)

**widget-issues.test.js** (Widget Safety Tests)
- Tests: Null check safety in widget code
- Coverage: Optional chaining patterns, error handling
- Framework: Vanilla Node.js
- Status: Identifies issues that need fixing

---

## Data Storage Schema

### localStorage Keys

**panchanga_location**
```javascript
{
  name: "Chennai, Tamil Nadu, India",
  latitude: 13.0827,
  longitude: 80.2707,
  timestamp: 1716891234
}
```
- **Purpose:** Persist user's selected location
- **Expiry:** 30 days from timestamp
- **Used By:** Both widgets for pre-filling location input

**panchanga_geocoding_cache**
```javascript
{
  "chennai": [
    { name: "Chennai, Tamil Nadu, India", lat: 13.0827, lon: 80.2707 },
    { name: "Chennai, Oklahoma, USA", lat: 35.1234, lon: -97.5678 }
  ],
  "new york": [ ... ],
  ...
}
```
- **Purpose:** Cache Nominatim geocoding results
- **Expiry:** Indefinite (location names don't change)
- **Used By:** location-manager.js for autocomplete dropdown

---

## Build & Deployment Pipeline

```
Local Development:
  ├─ Edit source files
  ├─ Run: npm test (unit + integration)
  ├─ Run: podman-compose up (Jekyll dev server on :5080)
  ├─ Test in browser: http://localhost:5080/panchanga/
  └─ Commit when tests pass

GitHub Push:
  ├─ Push to feature branch
  ├─ GitHub Actions runs tests
  └─ PR requires tests to pass

GitHub Pages:
  ├─ Merge to main
  ├─ GitHub automatically builds Jekyll
  ├─ Outputs to _site/ (excluded from git)
  └─ Published to github.io/shivavakkiyar

Jekyll Build Process:
  ├─ Reads: .md files, _layouts/, _includes/
  ├─ Generates: HTML in _site/
  ├─ Copies: assets/ → _site/assets/
  └─ Result: Static site ready for GitHub Pages
```

---

## Critical Paths (What Can Break What)

### If panchanga-calculator.js breaks:
- ❌ Both widgets stop working
- ❌ All tests fail
- ✅ Unit/integration tests will catch it immediately

### If location-manager.js breaks:
- ❌ Location search fails
- ❌ localStorage caching fails
- ❌ Widgets can't initialize
- ✅ Unit tests will catch it

### If widget HTML breaks:
- ❌ Widget doesn't display
- ❌ User can't interact
- ❌ E2E tests fail
- ⚠️ Unit tests won't catch (they test JS logic, not HTML)
- ⚠️ Need E2E tests or manual testing

### If CSS breaks:
- ❌ Widget looks broken (but may still function)
- ✅ Won't break JavaScript logic
- ⚠️ Detected by visual E2E test failures

### If _layouts/default.html breaks:
- ❌ All pages break
- ❌ Scripts won't load
- ✅ Will be caught when pushing to GitHub Pages

---

## Future Extension Points

### Add Ayanamsa Comparison:
- Modify: `panchanga-calculator.js` (add `getLahiriAyanamsa()`)
- Modify: Widgets to show side-by-side comparison
- Add Tests: Compare against known Lahiri values

### Add Different Calendar Systems:
- New File: `assets/js/lunar-calendar.js` (alternative system)
- New File: `assets/js/solar-calendar.js` (alternative system)
- Modify: Widgets with selection dropdown

### Add Historical Data Export:
- New File: `assets/js/data-exporter.js`
- Modify: Widget with export button
- New File: Export handler in server-side code (or client-side download)

### Add Offline PWA Support:
- New File: `service-worker.js`
- Modify: `assets/js/app-init.js` (register service worker)
- Cache: All JS, CSS, HTML needed for offline operation

---

---

## Developer Infrastructure

### scripts/ Folder
**Purpose:** Store all Claude-generated utility scripts to prevent duplication and loss.

**Structure:**
```
scripts/
├── README-scripts.md       # Script documentation
├── feature-workflow.sh     # Feature branch enforcement
├── push-to-github.sh       # Safe GitHub push
├── generate-features.py    # Auto-generate features.json from FEATURES.md
├── sync-docs.py            # Sync all documentation
├── validate-commits.py     # Pre-commit validation
└── tests/                  # Script tests
    ├── test-generate-features.py
    ├── test-sync-docs.py
    └── test-validate-commits.py
```

**Why it matters:**
- Claude reads `scripts/README-scripts.md` and `features.json` to know what scripts exist
- Prevents "create a new validation script" when it already exists
- Enables reuse and versioning of tools
- Tracked in git for institutional memory

### ITERATION_LOG.md
**Purpose:** Track all development iterations, clarifications, and decisions.

**Structure:**
```
## Feature: [Name]
**Started:** YYYY-MM-DD
**Status:** In Development / Complete

### Iteration 1: [Description]
**Created:** List of files created/modified
**Key Decisions:** Why things were done
**Clarifications:** Q&A with BA

### Iteration 2: ...
```

**Why it matters:**
- Single source of truth for "why we did this"
- Enables pause/clarify/resume cycles
- Future developers understand design decisions
- Git-controlled for full traceability

### Development Workflow Loop
```
Developer starts work (feature branch)
    ↓
Development reveals unclear requirement
    ↓
Add question to .claude/FEATURES.md
    ↓
Commit: "Question: clarification needed"
    ↓
BA responds with clarification in FEATURES.md
    ↓
Commit: "Clarification: BA decision"
    ↓
Developer continues with Claude (shows clarification)
    ↓
Claude updates code based on clarification
    ↓
Update ITERATION_LOG.md with resolution
    ↓
Commit: "Implement clarification: [decision]"
    ↓
Feature complete, merge to main
```

---

*Last Updated: May 28, 2026*
