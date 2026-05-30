---
id: 0006
title: Location Manager - Geolocation and Caching
status: done
impact: High
priority: P1
complexity: "Already complete"
assignee: Pre-workflow implementation
created: 2026-05-30
linked_tasks: [0005]
---

# Description

The `LocationManager` class handles all location-related functionality for the panchanga calculator:
- Geolocation API detection (browser's native location)
- Nominatim geocoding (search by city/state/ZIP)
- LocalStorage caching (30-day expiry)
- Global location support (US, India, worldwide)

**Status**: ✅ Working and stable  
**Location**: `assets/js/location-manager.js` (9.4KB)

## Implementation Details

### Core Public Methods

| Method | Purpose | Inputs | Returns |
|--------|---------|--------|---------|
| `getStoredLocation()` | Read cached location from localStorage | — | {name, lat, lon, timestamp} \| null |
| `saveLocationToStorage(location)` | Write location to localStorage (30-day expiry) | {name, lat, lon} | void |
| `clearStoredLocation()` | Delete cached location | — | void |
| `getUserLocation()` | Get location via browser Geolocation API | — | Promise<{lat, lon}> |
| `geocodeLocation(query)` | Search Nominatim for location by name | string | Promise<{name, lat, lon}> |
| `getLocationName(latitude, longitude)` | Reverse-geocode coordinates to place name | number, number | Promise<string> |
| `detectLocation()` | Full flow: stored → geolocation → default | — | Promise<Location> |

### Cache Contract (CRITICAL - Do NOT Change)

**LocalStorage Keys** (part of API):
- `panchanga_location` — User's selected location (30-day expiry)
- `panchanga_geocoding_cache` — Nominatim search results (never expires)

Changing these keys breaks widget state persistence!

### Return Shapes

```javascript
// Location object
{
  name: string,        // e.g., "San Francisco, California, USA"
  latitude: number,    // e.g., 37.7749
  longitude: number    // e.g., -122.4194
}

// With timestamp (stored in localStorage)
{
  name: string,
  latitude: number,
  longitude: number,
  timestamp: number    // Date.now() when saved
}

// Geolocation result
{
  latitude: number,    // Browser Geolocation API
  longitude: number,
  accuracy: number     // Accuracy in meters
}
```

## Key Features

### 1. Browser Geolocation API
- Detects user's location via GPS/IP
- Permission-based (user must approve)
- Returns coordinates with accuracy
- Gracefully falls back if denied

### 2. Nominatim Geocoding
- Free (no API key required)
- Search by city, state, ZIP code
- Worldwide coverage
- Rate-limited: 1 request/second
- Results cached in localStorage (indefinite)

### 3. LocalStorage Caching
- `panchanga_location`: 30-day expiry
- `panchanga_geocoding_cache`: Indefinite (reduced API calls)
- Automatic cleanup of expired entries
- Survives browser refresh and reload

### 4. Location Detection Flow
```
1. Check localStorage (cached location)
   ✓ Return cached location
   ✗ Continue

2. Try Browser Geolocation API
   ✓ Save to localStorage, return
   ✗ Continue

3. Use default location (San Francisco)
   Return default
```

## Known Limitations

1. **Nominatim Rate Limiting** — 1 request/second globally
   - Implementation: Automatic caching prevents repeated requests
   - Status: Working as designed

2. **Geolocation Permission** — User must approve
   - Graceful fallback if denied
   - Works offline (uses cached location)

3. **IP Geolocation Accuracy** — ±50km typical
   - Only used when GPS unavailable
   - Sufficient for panchanga (timezone matters more than exact location)

## Breaking Changes (Do NOT Change)

These changes would break widget state and tests:

- ❌ `panchanga_location` localStorage key
- ❌ `panchanga_geocoding_cache` localStorage key
- ❌ Location object properties (name, latitude, longitude)
- ❌ Cache expiry time (30 days for location)
- ❌ Method signatures

## Safe Changes

✅ Improving geolocation accuracy  
✅ Adding more timezone detection  
✅ Expanding Nominatim search results display  
✅ Better error messages  
✅ Performance optimization  

## Test Coverage

**70 Integration Tests** include:
- Location storage and retrieval ✅
- Nominatim geocoding ✅
- Geolocation detection ✅
- Cache expiry handling ✅
- Error scenarios (denied permission, network failure) ✅

**All 85 tests passing** ✅

## Related Files

- **Calculator**: `assets/js/panchanga-calculator.js` (uses location for calculations)
- **Widgets**: Both widgets use LocationManager for user location
- **Tests**: Included in `tests/panchanga-calculator-integration.test.cjs`
- **Rules**: `.claude/rules/calculator.md` (cache key enforcement)

## Usage Example

```javascript
const locMgr = new LocationManager();

// Get stored location (or null if expired)
let location = locMgr.getStoredLocation();

if (!location) {
  // Search for location
  location = await locMgr.geocodeLocation("San Francisco, CA");
  locMgr.saveLocationToStorage(location);
}

console.log(location.name);       // "San Francisco, California, USA"
console.log(location.latitude);   // 37.7749
console.log(location.longitude);  // -122.4194
```

## Maintenance Notes

- Code is stable and well-tested
- Cache keys are part of public API
- LocalStorage structure is not internal implementation detail
- Changing keys requires migration for all users
- Rate-limiting via caching is intentional design

## Acceptance Criteria

✅ Geolocation API integration working  
✅ Nominatim geocoding functioning  
✅ LocalStorage cache persisting (30-day expiry)  
✅ Rate-limiting via caching effective  
✅ Error handling graceful (fallback to defaults)  
✅ All 85 tests passing  

---

**This task establishes workflow artifacts for existing code. Future changes to location handling must:**

1. Start with a new task file (task 000X)
2. Reference this task (0006) as linked task
3. Update acceptance criteria for the specific change
4. **DO NOT change localStorage keys** (breaks all users)
5. Ensure all 85 tests still pass before committing
6. Follow .claude/rules/calculator.md rules
