# Panchanga Calculator - Technical Skills & Infrastructure

## 🛠️ Technology Stack

### Backend & Build
- **Jekyll 4.4.1** - Static site generator
- **Ruby 3.1** - Jekyll runtime
- **Podman/Docker** - Containerization for local development (port 5080)

### Frontend
- **Vanilla JavaScript** (ES6+) - No framework dependencies
- **Astronomy Engine v2.0+** - NASA JPL ephemeris (413KB, local copy)
- **Nominatim API** - Free geocoding via OpenStreetMap
- **localStorage API** - Browser-based caching

### CSS & Design
- **Cayman Theme CSS** - GitHub Pages theme (local)
- **Custom CSS** - Project-specific styling
- **Responsive Grid Layout** - Mobile-first design
- **Accessibility** - WCAG 2.1 compliant (focus states, keyboard nav, high contrast)

### Testing & Quality
- **Playwright** - End-to-end testing framework
- **C8** - Code coverage tool
- **Vanilla Node.js** - Zero external test dependencies

---

## 📚 Core Modules

### panchanga-calculator.js (14KB)
Complete astronomical calculation engine using Drik Ayanamsa system.

**Key Responsibilities:**
- Astronomical position calculations (Sun, Moon longitudes)
- Drik Ayanamsa precession correction (modern ~24.14° for 2026)
- Panchanga element calculations (5 main + 4 derived)
- Time zone handling (IST conversion)
- Date/time formatting and utilities

**Critical Functions:**
- `getDrikAyanamsa(date)` - Modern precession correction
- `calculateTithi(sunLon, moonLon)` - Lunar day (1-30)
- `calculateNakshatra(moonLon)` - Constellation (1-27)
- `calculateYoga(sunLon, moonLon)` - Auspicious combination (1-27)
- `calculateKarana(tithiNum)` - Half-tithi (1-60)
- `calculateRahuKalam(sunrise, sunset, date)` - Inauspicious period
- `calculateAbhijitMuhurta(sunrise, sunset)` - Auspicious period
- `findNextPradosha(date, lat, lon)` - Next 3 Pradosha occurrences
- `calculateFullPanchanga(date, lat, lon)` - Complete calculation

**Calculation System:**
- Tithi: Moon-Sun angle ÷ 12° = 30 tithis per lunar month
- Nakshatra: Moon longitude ÷ 13.33° = 27 nakshatras
- Yoga: (Sun + Moon longitude) ÷ 13.33° = 27 yogas
- Karana: Half-tithi cycle (repeating pattern)
- Rahu Kalam: 90-minute window, position varies by weekday

**Dependencies:**
- None (Astronomy Engine optional, has fallback calculations)

---

### location-manager.js (5.5KB)
Location detection, geocoding, and caching management.

**Key Responsibilities:**
- User location input handling (manual entry only - NO auto-detect)
- Nominatim API integration for city/state/ZIP/country search
- localStorage caching with 30-day expiry
- Recently used locations dropdown population
- Location validation and formatting

**Critical Functions:**
- `geocodeLocation(query)` - Search by city/state/ZIP/country
- `getStoredLocation()` - Retrieve cached location
- `saveLocationToStorage(location)` - Persist location (30-day expiry)
- `getCachedLocation(query)` - Check geocoding cache
- `getGeocodingCache()` - Get all cached results for dropdown
- `isValidCoordinates(lat, lon)` - Validate coordinates

**Geocoding Strategy:**
- **Provider:** Nominatim (OpenStreetMap, free, no API key)
- **Rate Limit:** 1 request/second (caching prevents rate issues)
- **Query Support:** City name, State, Country, ZIP code (any combination)
- **User Requirement:** Manual entry (NO auto-detect geolocation)

**Cache Structure:**
```javascript
panchanga_location: {name, latitude, longitude, timestamp}
panchanga_geocoding_cache: {query: [{results}]}
```

**Dependencies:**
- None (Nominatim API is external, rate-limited)

---

## 🎨 CSS Architecture

### panchanga.css (9.7KB)
Styling for calculator widgets, responsive design, accessibility.

**Key Components:**
- Grid-based layout (mobile-first, 768px breakpoint)
- Color-coded cards (Tithi=blue, Nakshatra=purple, etc.)
- Progress bars for tithi/nakshatra completion
- Form styling (inputs, buttons, date picker)
- Responsive typography (18px base → 16px mobile)

**Accessibility Features:**
- Focus-visible states on all interactive elements
- High contrast mode support
- Reduced-motion media queries
- Dark mode support
- Keyboard navigation (Tab, Enter, Esc)

**Breakpoints:**
- Mobile: 320px - 767px (single column, stacked)
- Tablet: 768px - 1023px (2 columns)
- Desktop: 1024px+ (3+ columns, full layout)

---

## 🔧 Widget HTML Architecture

### panchanga-widget-full.html (18KB)
Complete interactive calculator for dedicated `/panchanga/` page.

**Elements:**
- Location input with Nominatim autocomplete
- Date picker (HTML5 input type=date)
- Calculate button
- Results display grid (Tithi, Nakshatra, Yoga, Karana, Hora)
- Rahu Kalam and Abhijit Muhurta display
- Next 3 Pradosha dates table
- Error message container

**Known Issues:**
- Line 311: `p.tithi.phase.toUpperCase()` - null check missing
- Needs optional chaining: `p?.tithi?.phase?.toUpperCase?.()`

### panchanga-widget-simple.html (18KB)
Simplified widget for `/pradoshakalapooja/` page.

**Elements:**
- Manual location input with Nominatim autocomplete
- Recently used locations dropdown
- Calculate button
- Next 3 Pradosha dates display
- "Show Details" expandable section (full panchanga)

**Known Issues:**
- Line 344: `p.tithi.phase.toUpperCase()` - null check missing
- Needs optional chaining: `p?.tithi?.phase?.toUpperCase?.()`

---

## 📊 Domain Knowledge

### Panchanga System (Hindu Calendar)

**Five Main Elements:**
1. **Tithi** (Lunar Day) - 30 per lunar month, named phases
2. **Nakshatra** (Constellation) - 27 lunar mansions
3. **Yoga** (Auspicious Combination) - 27 yogas with qualities
4. **Karana** (Half-Tithi) - 60 periods, 8 unique names
5. **Hora** (Planetary Hour) - 24-hour cycle, 7 planets

**Derived Elements:**
- **Rahu Kalam** - Inauspicious 90-minute period
- **Abhijit Muhurta** - Auspicious 48-minute period
- **Pradosha** - Worship time (13th lunar day, 3-hour window)

### Ayanamsa Systems

**Drik Ayanamsa (Current Implementation):**
- Modern precession correction based on actual observations
- ~23.856° at J2000 epoch (Jan 1, 2000)
- Increases ~0.01391° per year
- ~24.14° in 2026
- More accurate for current astronomical positions

**Lahiri Ayanamsa (Traditional):**
- Traditional system based on Spica as reference
- Fixed value at J2000 epoch
- Used in many Tamil calendars
- Slightly different results (~0.3° difference)

**User Implication:** Results may differ from traditional Tamil panchang calculators

---

## 🧪 Testing Infrastructure

### Unit Tests (15/15 passing ✅)
File: `tests/panchanga-calculator.test.js`
- Ayanamsa calculation (J2000 epoch, precession rate)
- Tithi boundaries and completion percentage
- Nakshatra calculations with Tamil names
- Degree normalization (360° wrap-around)
- Edge cases (leap years, month boundaries, hemispheres)
- Calculation consistency (identical inputs = identical outputs)

### Integration Tests (70/70 passing ✅)
File: `tests/panchanga-calculator-integration.test.js`
- Real astronomical formula validation
- Fallback calculation accuracy
- Location edge cases (equator, poles, date line)
- Rahu Kalam correctness by weekday
- Pradosha finder accuracy

### E2E Tests (15 tests, browser binaries pending setup)
File: `tests/e2e.spec.js`
- Page load and rendering
- Form input validation
- Date picker interaction
- Calculate button functionality
- Results display accuracy
- Error message handling
- Version display
- Console error detection
- Responsive design (mobile, tablet, desktop)
- Keyboard accessibility
- Button label accessibility

**Browser Coverage:**
- Chromium (headless)
- Firefox (headless)
- Mobile Chrome (Pixel 5 emulation)

---

## 📁 Critical File Locations

**JavaScript Engines:**
- `assets/js/panchanga-calculator.js` - Core calculations
- `assets/js/location-manager.js` - Location handling
- `assets/js/astronomy.browser.js` - NASA ephemeris (413KB, local)

**Widget HTML:**
- `_includes/panchanga-widget-full.html` - Full calculator widget
- `_includes/panchanga-widget-simple.html` - Pradosha widget

**Pages:**
- `panchanga.md` - Dedicated calculator page
- `pradoshakalapooja.md` - Pradosha worship page (needs widget integration)

**Configuration:**
- `.claude/config.json` - Project rules
- `.claude/features.json` - Feature inventory
- `.claude/WORKFLOW.md` - Development workflow

**Tests:**
- `tests/panchanga-calculator.test.js` - Unit tests
- `tests/panchanga-calculator-integration.test.js` - Integration tests
- `tests/e2e.spec.js` - E2E tests

---

## 🚀 Container Setup

### Development Container (saivamcloud-dev)
- **Base:** Ruby 3.1 image
- **Port:** 5080 (maps to Jekyll 4000)
- **Command:** `jekyll serve --host 0.0.0.0 --port 4000`
- **Volumes:** Source code mounted, _site/ excluded from .gitignore
- **Health Check:** HTTP 200 on http://localhost:4000

### Test Container (saivamcloud-test)
- **Base:** Node.js 20 slim + headless browsers
- **Browsers:** Chromium, Firefox (system packages, not Playwright downloads)
- **Framework:** Playwright v1.60+
- **Command:** `npm run test:e2e` (after browser binary setup)
- **Network:** Connects to dev container for integration tests

---

## 💡 Key Concepts

### Drik Ayanamsa Precision
- Precession of Earth's axis changes zodiac reference over time
- Modern observations show ~0.01391°/year change
- Affects all zodiac-based calculations
- Critical for accurate panchanga in current era

### localStorage Caching Strategy
- 30-day expiry on user-selected location (prevents stale data)
- Indefinite cache for geocoding results (location names don't change)
- Reduces API calls to Nominatim significantly
- Enables offline-first UX (cached results used immediately)

### Fallback Calculation Approach
- Sun: ~0.9856°/day motion from J2000 epoch
- Moon: ~13.18°/day motion (approximate mean)
- Calculations work without Astronomy Engine
- Accuracy: ±30 minutes acceptable for panchanga

---

*Last Updated: May 28, 2026*
