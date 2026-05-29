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
- **Nominatim API** - Free geocoding for location lookup (OpenStreetMap)

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
http://localhost:5080/panchanga/

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

## Future Enhancements
- [ ] Add Ayanamsa comparison (Drik vs Lahiri)
- [ ] Support for different calendar systems
- [ ] Historical panchang data
- [ ] Batch calculations export
- [ ] PWA support for offline access
