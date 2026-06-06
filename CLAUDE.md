# Panchanga Calculator - Project Documentation

## Overview
A comprehensive Hindu calendar (panchanga) calculator integrated into a Jekyll GitHub Pages site. Performs accurate daily astronomical calculations using modern Drik Ayanamsa system.

## Technology Stack

### Backend & Build
- **Jekyll 4.4.1** - Static site generator
- **Ruby 3.1** - Jekyll runtime
- **Podman/Docker** - Containerization for Ubuntu testing (port 5080)

### Frontend
- **Vanilla JavaScript** - No framework dependencies
- **Astronomy Engine v2.0+** - NASA JPL ephemeris (local, 413KB)
- **NOAA Solar Calc** - Sunrise/sunset with atmospheric refraction (local, @noaa/solar-calc)
- **Nominatim API** - Free geocoding for location lookup (OpenStreetMap)
- **Temporal API** - Modern date/time handling (progressive migration from Date)

### Styling
- **Cayman Theme CSS** - GitHub Pages theme (local, 9.4KB)
- **Custom CSS** - Site-specific styling (3.5KB)
- **Panchanga CSS** - Calculator widgets (9.7KB)

## Project Structure

```
/home/jsnadmin/apps/shivavakkiyar/
├── assets/
│   ├── js/
│   │   ├── astronomy.browser.js (413KB) - Astronomy Engine
│   │   ├── panchanga-calculator.js (22KB) - Core calculations
│   │   └── location-manager.js (9.4KB) - Geolocation & caching
│   └── css/
│       ├── cayman-theme.css (9.4KB)
│       ├── panchanga.css (9.7KB)
│       └── custom.css (3.5KB)
├── _includes/
│   ├── panchanga-widget-simple.html - Pradosha page widget
│   └── panchanga-widget-full.html - Dedicated calculator page
├── _layouts/
│   └── default.html - Main layout with version display
├── _data/
│   ├── nav.yml - Navigation menu
│   └── version.yml - Version info
├── panchanga.md - Dedicated calculator page
├── pradoshakalapooja.md - Pradosha worship page with widget
├── VERSION - Semantic version (1.0.0-beta.2)
└── Dockerfile + podman-compose.yml - Container setup
```

## Key Features

### 1. Panchanga Calculations
- **Tithi** (Lunar Day) - 30 tithis per lunar month
- **Nakshatra** (Constellation) - 27 lunar mansions
- **Yoga** - 27 auspicious combinations
- **Karana** - 60 half-tithis
- **Hora** (Planetary Hour) - 24-hour cycle
- **Rahu Kalam** - Inauspicious 90-minute window
- **Abhijit Muhurta** - Auspicious 48-minute window
- **Pradosha Times** - Next 3 occurrences

### 2. Location Management
- **Geolocation API** - Auto-detect user location (optional)
- **Nominatim Geocoding** - Search by city/state/ZIP code
- **LocalStorage Caching** - Remember user location (30-day expiry)
- **Global Support** - Works worldwide (USA, India, etc.)

### 3. Astronomical Accuracy
- **Drik Ayanamsa** - Modern precession correction (~24.14° for 2026)
- **Sidereal Coordinates** - Hindu calendar (tropical → sidereal conversion)
- **Sunrise/Sunset** - Location-based calculations
- **Approximate Formulas** - When Astronomy Engine unavailable

### 4. UI/UX
- **Two Widget Variants**:
  - Simple: Pradosha page (shows next 3 dates + expandable details)
  - Full: Dedicated page (complete calculator with date picker)
- **Responsive Design** - Mobile-first, CSS grid layout
- **Version Display** - Widget badge + page footer
- **Accessibility** - Focus states, keyboard navigation, high contrast support

## Development Workflow

### Version Management
- **VERSION file** - Semantic versioning (1.0.0-beta.2)
- **Git post-commit hook** - Auto-increment minor version on each commit
- **Version display** - Widget badge + page footer for quick verification

### Local Testing
```bash
# Start container
podman-compose up

# Access locally
http://localhost:5080/pradoshakalapooja/
http://localhost:5080/panchangam/

# Test from Windows
http://<ubuntu-ip>:5080/pradoshakalapooja/
```

### Running Tests
```bash
# Run unit tests (JavaScript)
npm test
# or
node tests/panchanga-calculator.test.js
```

## Critical Implementation Details

### Astronomy Engine API
- **Working Functions**:
  - `Equator(body, date, observer, bool, bool)` - Equatorial coordinates
  - `SearchRiseSet(body, observer, direction, date, days)` - Rise/set times
  - Manual ecliptic conversion from equatorial
- **Avoid**:
  - `GeoVector()` - Parameter issues
  - `EclipticLongitude()` - HelioVector dependency
  - `Direction.Rise/Set` - Use fallback calculations

### Location Caching
- Key: `panchanga_location` - User's selected location
- Key: `panchanga_geocoding_cache` - Search results cache
- Expiry: 30 days for stored location, indefinite for geocoding
- Usage: Reduces API calls, faster subsequent loads

### Approximate Calculations (Fallback)
When Astronomy Engine fails:
- **Sun Longitude**: Linear motion (~1°/day) from J2000 epoch
- **Moon Longitude**: Mean motion (~13°/day) with approximation
- **Sunrise/Sunset**: Declination-based formula for latitude
- **Accuracy**: ±30 minutes acceptable for panchanga

## Known Issues & Workarounds

### 1. Astronomy Engine API Complexity
- **Issue**: Functions have unclear parameter requirements
- **Workaround**: Use approximate astronomical formulas when precise API calls fail
- **Status**: Tests validate fallback calculations

### 2. Nominatim Rate Limiting
- **Limit**: 1 request/second
- **Implementation**: Automatic caching prevents repeated requests
- **Status**: Working as designed

### 3. CDN Reliability
- **Removed**: astronomy-engine.com (domain doesn't exist)
- **Solution**: Local copy of Astronomy Engine
- **Benefit**: No external CDN dependency, faster loading

## Testing Strategy

### Unit Tests (Development Only)
**Framework**: Vanilla Node.js (no Jest/external dependencies)  
**File**: `tests/panchanga-calculator.test.js`  
**Run**: `node tests/panchanga-calculator.test.js`  
**Status**: ✅ 15/15 tests passing (100%)

**Why Vanilla Node.js?**
- Production code has zero test dependencies
- No npm install required for development
- Lightweight and self-contained
- Easy to audit test logic
- Fast execution (<1 second)

### Test Coverage
```javascript
// Core calculations
- getDrikAyanamsa(date) ✓
- calculateTithi(sunLon, moonLon) ✓
- calculateNakshatra(moonLon) ✓
- calculateYoga(sunLon, moonLon) ✓
- calculateKarana(tithiNum) ✓

// Time calculations
- getSunLongitude(date, lat, lon) ✓
- getMoonLongitude(date, lat, lon) ✓
- getSunrise(date, lat, lon) ✓
- getSunset(date, lat, lon) ✓
- calculateRahuKalam(sunrise, sunset, date) ✓
- findNextPradosha(date, lat, lon) ✓

// Location management
- geocodeLocation(query) ✓
- getStoredLocation() ✓
- saveLocationToStorage(location) ✓

// Utility functions
- normalizeDegrees(deg) ✓
- Leap year handling ✓
- Month boundary handling ✓
- Southern hemisphere support ✓
```

### Test Scenarios
- **Known Dates**: Verify against traditional panchang calendars
- **Edge Cases**: Leap years, month transitions, hemispheres
- **Location Variants**: Different timezones, hemispheres, latitudes
- **Browser Cache**: LocalStorage functionality

## Deployment

### GitHub Pages
1. Push to main branch
2. GitHub Pages auto-builds Jekyll
3. No special configuration needed (remote theme handled)

### Container (Local Testing)
```bash
podman-compose up -d
# Access on localhost:5080
podman-compose down
```

## Performance Metrics
- **Total Asset Size**: ~475KB
  - Astronomy Engine: 413KB
  - All CSS: 32KB
  - All JS: 22KB
- **Load Time**: <2 seconds on 4G
- **Calculation Time**: <500ms per location

## Development Conventions

### Git Commit Messages
- **Format**: Clear, descriptive messages focused on what and why
- **No footers**: Never include `Co-Authored-By:` or similar metadata in commit messages
- **Body**: Use bullet points for detailed changes when needed
- **Example**: 
  ```
  Fix: Adjust Pradosha dates from UTC to local timezone
  
  Pradosha dates are calculated in UTC but should display in the
  user's local timezone. Convert UTC dates by adding timezone offset.
  ```

## Temporal API Migration (In Progress)

**Status**: ✅ DECIDED - Implement Temporal in NOAACalculator

**Objective**: Replace JavaScript `Date` with `Temporal` API for better date/time handling

**Rationale**:
- `Date` is mutable and lacks timezone support
- `Temporal` provides immutable, timezone-aware, precision-based dates
- Better for astronomical calculations requiring precision

**Implementation Strategy**:

### 1. Temporal in NOAACalculator ✅ (In Progress)
- Use `Temporal.PlainDate` for date handling
- Use `Temporal.ZonedDateTime` for timezone-aware times
- Maintain backward compatibility with Date objects
- Update refraction calculations to use Temporal precision

### 2. Comparison: NOAACalculator (Temporal) vs Astronomy Engine (Task 0028b) ✅ RESOLVED

**Status**: Decision gate completed - integration strategy determined

**Comparison Results** (25 test cases across 5 locations and 5 dates):
- **Astronomy Engine geometric times**: +1.6 to +5.4 minutes later than NOAA official
- **Root cause**: Atmospheric refraction effect (0.833° elevation difference)
- **Pattern**: Linear with latitude (expected for refraction formula)
- **Conclusion**: NO BUG IN ASTRONOMY ENGINE — working exactly as designed

**Key Insight**: 
- Astronomy Engine (VSOP87-based, JPL-validated) calculates **geometric** sunrise/sunset (0° elevation)
- NOAA official values show **apparent** sunrise/sunset (-0.833° elevation accounting for atmosphere)
- The 3.2 ± 1.3 minute difference is scientifically correct refraction effect

**Resolved Decision**:
- ✅ **Keep Astronomy Engine** - accurate within ±1 arcminute (VSOP87 standards)
- ✅ **Apply NOAACalculator refraction correction** - achieves ±0-1 minute accuracy vs NOAA
- ❌ Do NOT replace Astronomy Engine (unnecessary, already optimal for its purpose)

See `DECISION_GATE_0028b.md` for full analysis.

### 3. Integration Strategy (Task 0029 - Temporal Migration)

**Scope** (Progressive migration with backward compatibility):
1. ✅ noaa-calculator.js - Temporal API implemented + refraction complete
2. ⏳ panchanga-calculator.js - Wire NOAACalculator.getSunrise/Sunset() into existing methods
3. ⏳ astronomy.browser.js - Replace Date with Temporal in ephemeris calculations
4. ⏳ location-manager.js - Use Temporal for caching timestamps

**Implementation**:
- NOAACalculator provides: Geometrically-calculated sunrise/sunset + atmospheric refraction correction + Temporal support
- Astronomy Engine provides: VSOP87 ephemeris accuracy
- PanchangaCalculator combines: Gets refraction-corrected times from NOAACalculator, passes to panchanga algorithms

**Timeline**: 
- Phase 1: Wire NOAACalculator into PanchangaCalculator.getSunrise/Sunset() (Task 0029a)
- Phase 2: Complete Temporal migration through codebase (Task 0029b)
- All phases maintain backward compatibility with Date objects

**References**:
- Temporal Proposal: https://tc39.es/proposal-temporal/
- Polyfill: temporal-polyfill (if needed)
- NOAA Online: https://gml.noaa.gov/grad/solcalc/
- NOAA API: https://api.weather.gov/
- NOAA Spreadsheet: Available on NOAA solar calculation details page

## NOAA Solar Calculation Integration

**Implementation**: Custom NOAACalculator (assets/js/noaa-calculator.js)  
**Alternative Considered**: @noaa/solar-calc library (hebcal/noaa)  
**Decision**: ✅ Custom implementation selected (Task 0028b)

**Why Custom NOAACalculator**:
- ✅ Implements NOAA atmospheric refraction formulas (Meeus Astronomical Algorithms)
- ✅ Temporal API support built-in (nanosecond precision, timezone-aware)
- ✅ 80+ integration tests passing (100% accuracy vs NOAA official ±0-1 min)
- ✅ No external library dependency management needed
- ✅ Maintains focus on Astronomy Engine's VSOP87 accuracy

**Refraction Implementation**:
- **Standard refraction**: 0.833° elevation (34 arcmin atmosphere + 16 arcmin solar disk)
- **4 cases handled**:
  - Case 1 (h ≥ 85°): No refraction
  - Case 2 (5° ≤ h < 85°): Standard formula (tan-based)
  - Case 3 (-0.575° ≤ h < 5°): Polynomial formula
  - Case 4 (h < -0.575°): Twilight formula
- **Accuracy**: ±0-1 minute vs NOAA official values (validated across 25 test cases)

## Future Enhancements
- [ ] Complete Temporal API migration (Date → Temporal throughout codebase)
- [ ] Add Ayanamsa comparison (Drik vs Lahiri)
- [ ] Support for different calendar systems
- [ ] Historical panchang data
- [ ] Batch calculations export
- [ ] PWA support for offline access
