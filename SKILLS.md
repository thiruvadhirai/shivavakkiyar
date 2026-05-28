# Panchanga Calculator - Skills & Components

## JavaScript Modules

### panchanga-calculator.js (22KB)
Complete astronomical calculation engine for Hindu calendar.

**Key Methods:**
```javascript
// Initialization
init() - Setup Astronomy Engine

// Astronomical Longitudes (Sidereal)
getSunLongitude(date, lat, lon) → degrees
getMoonLongitude(date, lat, lon) → degrees
getDrikAyanamsa(date) → degrees (precession correction)

// Panchanga Calculations
calculateTithi(sunLon, moonLon) → {name, phase, number, percent}
calculateNakshatra(moonLon) → {name, tamil, number, degree, percent}
calculateYoga(sunLon, moonLon) → {name, tamil, number}
calculateKarana(tithiNum) → {name, tamil, number}
calculateHora(date, sunrise) → {planet, number}
calculateRahuKalam(sunrise, sunset, date) → {startTime, endTime}
calculateAbhijitMuhurta(sunrise, sunset) → {startTime, endTime}

// Time Calculations
getSunrise(date, lat, lon) → {date, timeIST, hours, minutes}
getSunset(date, lat, lon) → {date, timeIST, hours, minutes}
findNextPradosha(date, lat, lon) → [{date, tithi, pradoshaStart, pradoshaEnd}, ...]
calculateFullPanchanga(date, lat, lon) → Complete panchanga object

// Utilities
normalizeDegrees(deg) → 0-360 degrees
convertToIST(date, lon) → "HH:MM IST" string
formatDate(date) → "DD MMM YYYY" string
formatTime(hours, minutes) → "HH:MM" string
getDayOfYear(date) → 1-366
getJulianDate(date) → Julian Day Number
```

**Calculation Methods:**
- **Drik Ayanamsa**: Precession-corrected (~0.01391°/year from J2000)
- **Tithi**: Moon-Sun angular distance / 12°
- **Nakshatra**: Moon longitude / 13.33° (27 nakshatras)
- **Yoga**: (Sun + Moon longitude) / 13.33° (27 yogas)
- **Karana**: Half-tithi (60 total, 4 repeating + 1 unique)
- **Hora**: Planetary hour based on sunrise + duration
- **Rahu Kalam**: 90-minute window, varies by weekday
- **Abhijit Muhurta**: 48-minute window centered on noon

**Data Structures:**
```javascript
// Hardcoded: 27 Nakshatras with Tamil names
// Hardcoded: 27 Yogas with Tamil names  
// Hardcoded: 60 Karanas with Tamil names
// Dynamic: Calculated from astronomical positions
```

---

### location-manager.js (9.4KB)
Geolocation detection, geocoding, and caching system.

**Key Methods:**
```javascript
// Location Detection
detectUserLocation() → Promise {name, latitude, longitude}
reverseGeocode(lat, lon) → Promise location_name
geocodeLocation(query) → Promise [{name, lat, lon, boundingbox}, ...]

// Caching
getStoredLocation() → {name, lat, lon, timestamp}
saveLocationToStorage(location) → boolean
getCachedLocation(query) → [{name, lat, lon}, ...]
cacheGeocodingResult(query, locations) → void
getGeocodingCache() → Object (all cached results)
clearStoredLocation() → boolean
clearGeocodingCache() → boolean
clearAllCache() → void

// Utilities
formatLocationName(nominatimResult) → string
isValidCoordinates(lat, lon) → boolean
```

**Geocoding Provider:**
- **Service**: Nominatim (OpenStreetMap)
- **Endpoint**: `https://nominatim.openstreetmap.org/search`
- **Rate Limit**: 1 request/second (auto-cached)
- **Format**: JSON with city, state, country support

**Caching Strategy:**
```
localStorage['panchanga_location'] = {
  name: "Chennai, Tamil Nadu, India",
  latitude: 13.0827,
  longitude: 80.2707,
  timestamp: Date.now()
}

localStorage['panchanga_geocoding_cache'] = {
  "chennai": [{name, lat, lon}, ...],
  "delhi": [{name, lat, lon}, ...],
  ...
}
```

---

## HTML Widgets

### panchanga-widget-simple.html (370 lines)
Simplified widget for Pradosha page showing next 3 Pradosha dates.

**Features:**
- Manual location input with autocomplete suggestions
- Recently used locations dropdown (from cache)
- Display today's Pradosha time window
- Expandable full panchanga details
- Change location button
- Version display (development)

**UI States:**
1. **Location Input** - User enters city/state/ZIP
2. **Loading** - Calculating panchanga
3. **Results** - Shows Pradosha times + expandable details
4. **Error** - Clear error messages

**Responsive:** Mobile-first, CSS grid, <768px breakpoint

---

### panchanga-widget-full.html (420 lines)
Complete calculator for dedicated panchanga.md page.

**Features:**
- Location input with Nominatim autocomplete
- Date picker (any date, defaults to today)
- All panchanga elements display
- Celestial data (Sun/Moon longitudes, Ayanamsa)
- Next 3 Pradosha dates
- Save location checkbox (localStorage)
- Clear cache button
- Progress bars for tithi/nakshatra completion

**Calculation Flow:**
1. User enters location → Nominatim search
2. Clicks "Calculate Pradosha Times"
3. Fetches stored or enters new date
4. Calls calculator.calculateFullPanchanga()
5. Updates all UI elements
6. Optionally saves location for future visits

---

## CSS Styling

### panchanga.css (9.7KB)
Complete styling for both widgets.

**Features:**
- **Responsive Grid**: Mobile-first, auto-layout
- **Color-Coded Cards**:
  - Tithi: Blue (#0366d6)
  - Nakshatra: Purple (#6f42c1)
  - Yoga: Green (#28a745)
  - Karana: Red (#dc3545)
  - Hora: Orange (#fd7e14)
  - Rahu Kalam: Pink (#e83e8c)
- **Accessibility**:
  - Focus-visible states
  - High contrast mode support
  - Reduced motion support
  - Dark mode compatible
- **Progress Bars**: Tithi/Nakshatra completion percentage
- **Expandable Sections**: Smooth transitions
- **Animations**: Spinner, fade-in, slide

---

## Infrastructure

### Version Management
**File**: VERSION + _data/version.yml
- Format: Semantic versioning (MAJOR.MINOR.PATCH-STAGE.NUM)
- Example: 1.0.0-beta.2
- Display: Widget badge + page footer
- Auto-increment: Git post-commit hook

**Git Hook** (`.git/hooks/post-commit`):
```bash
# Increments 1.0.0-beta.2 → 1.0.0-beta.3
# Updates _data/version.yml with date
# Auto-amends commit
```

### Layout Integration (_layouts/default.html)
```html
<!-- Local Astronomy Engine -->
<script src="/assets/js/astronomy.browser.js" defer></script>

<!-- Version Display Footer -->
<footer>
  Panchanga Calculator v{{ site.data.version.version }}
  Updated: {{ site.data.version.date }}
</footer>
```

### Navigation (_data/nav.yml)
```yaml
- title: Panchanga Calculator
  url: /panchanga/
- title: Pradosha Kala Pooja
  url: /pradoshakalapooja/
```

---

## Testing Framework

### Testing Approach
**Framework**: Vanilla Node.js (zero external dependencies)  
**File**: `tests/panchanga-calculator.test.js`  
**Dependencies**: None (Node.js built-in only)  
**Status**: ✅ 15/15 tests passing (100%)

**Why No Test Framework?**
- Production code is 100% standalone (no npm/Jest required)
- Tests are development-only (not included in deployment)
- Simple assert pattern - easy to understand and audit
- Fast execution without framework overhead
- No `package.json` needed for the calculator to work

**Run Tests:**
```bash
node tests/panchanga-calculator.test.js
```

**Expected Output:**
```
✅ ALL TESTS PASSED
Passed: 15/15
Coverage: 100%
```

**Test Categories:**
1. **Ayanamsa Calculations** - Drik precession accuracy
2. **Tithi Calculations** - Against known dates
3. **Nakshatra Calculations** - Constellation identification
4. **Yoga/Karana** - Auspicious combinations
5. **Time Calculations** - Sunrise, sunset, Rahu Kalam
6. **Edge Cases** - Leap years, month boundaries, hemispheres
7. **Caching** - LocalStorage read/write
8. **Geocoding** - Location search validation

**Coverage Target:** >80% code paths

---

## Development Requirements

### Production
- **No npm required**
- **No package.json needed**
- **No external dependencies**
- **Zero test framework dependencies**
- Pure JavaScript + HTML + CSS

### Development (Optional Testing)
```bash
# Run tests (Node.js built-in only)
node tests/panchanga-calculator.test.js

# No npm install needed - tests are self-contained
```

**Note**: Tests are for development validation only. Production site runs without any test code or test framework.

---

## Build & Deployment

### Container Setup
**Dockerfile**:
- Base: Ruby 3.1 Alpine (~150MB)
- Builds: Jekyll with all dependencies
- Exposes: Port 4000 (mapped to 5080 in compose)

**podman-compose.yml**:
- Service: saivamcloud-dev
- Build: Current directory (Dockerfile)
- Mount: Project volume for live reload
- Env: JEKYLL_ENV=development

**Commands:**
```bash
podman-compose up -d      # Start
podman-compose logs       # View logs
podman-compose restart    # Restart
podman-compose down       # Stop
```

### Local Access
- **Container**: http://localhost:5080
- **Windows PC**: http://<ubuntu-ip>:5080

### GitHub Pages Deployment
1. Push to main branch
2. GitHub Actions builds Jekyll
3. Deployed to `https://username.github.io`
4. Works seamlessly (remote theme auto-handled)

---

## Performance Profile

**Asset Sizes:**
- Astronomy Engine: 413KB (minified, necessary)
- Cayman CSS: 9.4KB
- Panchanga CSS: 9.7KB
- Location Manager: 9.4KB
- Panchanga Calculator: 22KB
- **Total**: ~475KB

**Load Time:** <2 seconds on 4G
**Calculation Time:** <500ms per location

**Optimization:**
- Assets loaded via CDN alternative (local copy)
- CSS minified + concatenated
- JS deferred (proper execution order)
- Location caching reduces API calls

---

## Browser Compatibility
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

**Requires:**
- ES6+ JavaScript
- LocalStorage API
- Geolocation API (optional)
- CSS Grid & Flexbox

---

## API Dependencies

### Required
- **Nominatim API** - Free geocoding (OpenStreetMap)
  - Rate: 1 req/sec
  - No API key needed
  - Results cached locally

### Optional
- **Geolocation API** - Browser's location service
  - User must grant permission
  - Falls back to manual entry

### Not Required (Self-Contained)
- Astronomy Engine - Local copy (413KB)
- All CSS/JS - Local files
- No third-party analytics
- No tracking cookies
