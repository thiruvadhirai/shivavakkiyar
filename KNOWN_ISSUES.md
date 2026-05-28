# Known Issues & Limitations

## 1. Pradosha Date Calculation Bug (FIXED ✅)

**Status:** ✅ RESOLVED in commit 44a47031b

**Issue:** Pradosha dates were 6-8 days off from correct astronomical values.

**Root Cause (CRITICAL BUG):**
1. **Missing Astronomy Engine Library** - Was in git history but not in current branch
2. **Wrong Moon Reference Value** - MOON_JAN_1_2000 = 318.351° was systematically wrong
3. **Crude Linear Approximation** - Moon calculation used simple daily motion formula
   - This caused 8-day error: full moons on June 22 instead of June 14

**Evidence of Bug:**
- June 14, 2026 (correct full moon): Our angle was 85.27° (should be ~180°)
- June 22, 2026 (8 days later): Our angle was 182.80° (correct full moon angle)
- Moon position was systematically offset by 8 days

**The Fix (Commit 44a47031b):**
1. **Restored Astronomy Engine** - NASA JPL accurate ephemeris (413KB library)
2. **Updated Calculation Functions:**
   - `getSunLongitude()` now uses `Astronomy.EclipticGeoSun()`
   - `getMoonLongitude()` now uses `Astronomy.EclipticGeoMoon()`
   - Falls back with corrected reference value (213.9° instead of 318.351°)
3. **Result:** Pradosha dates now match traditional calendars (June 12, 26, July 11)

**Impact:** ✅ Bug fixed - calculations now scientifically accurate

---

## 2. Widget Null Checks (FIXED)

**Issue:** ✅ RESOLVED in commit c58b847f4
- Widgets crashed when `tithi.phase` was undefined
- Fixed with optional chaining: `p?.tithi?.phase?.toUpperCase?.()`

**Status:** Complete

---

## 3. E2E Tests (Browser Setup)

**Issue:** Playwright E2E tests cannot run on Ubuntu 26.04 (Playwright not officially supported)

**Tests Available:**
- Unit tests: ✅ 15/15 passing
- Integration tests: ✅ 70/70 passing  
- Deployment validation: ✅ 5/5 passing
- E2E tests: ⚠️ Browser setup required (Ubuntu 22.04 or earlier)

**Workaround:** Test on Ubuntu 22.04 or use deployment validation tests

---

## 4. Version Management (FIXED)

**Issue:** ✅ RESOLVED - Single VERSION file replaces version.yml duplication
- Safe bash arithmetic with validation
- Auto-increments on commits via post-commit hook
- No more corruption from malformed inputs

**Status:** Complete

---

## Future Enhancements

1. **Multiple Ayanamsa Systems**
   - Drik (modern, scientific) - Currently implemented ✅
   - Lahiri (traditional) - For compatibility with Hindu calendar systems
   - BV Raman - Alternative calculation method
   - User selectable ayanamsa option

2. **Additional Astronomical Data**
   - Planetary positions and calculations
   - Lunar apsis (apogee/perigee) data
   - Eclipse predictions
   - Historical panchang data

3. **Localization & Timezone Improvements**
   - Support more timezone variations
   - Local time vs UTC options
   - Regional calendar variants

---

*Last Updated: May 28, 2026*
