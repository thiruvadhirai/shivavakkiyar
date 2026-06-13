/**
 * Panchanga Widget - Simple Version
 * Displays today's Pradosha timing with location selection
 */

// Wait for required libraries to load
async function waitForLibraries(timeout = 10000) {
  const startTime = Date.now();
  while (typeof PanchangaCalculator === 'undefined' || typeof LocationManager === 'undefined') {
    if (Date.now() - startTime > timeout) {
      throw new Error('Required libraries not loaded. Please ensure Astronomy Engine CDN and calculator scripts are included.');
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

// Get IANA timezone name using nearest-neighbor lookup from geo-tz data
// Falls back to geographic ranges if timezone data not loaded
function getIANATimezone(location) {
  const lat = location.latitude;
  const lon = location.longitude;

  // Use geo-tz reference data if available
  if (window.timezoneTestCases && Array.isArray(window.timezoneTestCases)) {
    let nearest = null;
    let minDistance = Infinity;

    window.timezoneTestCases.forEach(point => {
      const dLat = point.lat - lat;
      const dLon = point.lon - lon;
      const distance = Math.sqrt(dLat * dLat + dLon * dLon);

      if (distance < minDistance) {
        minDistance = distance;
        nearest = point;
      }
    });

    console.log('[TZ] Nearest:', nearest?.name || 'Unknown', 'Distance:', minDistance.toFixed(2)+'°', 'TZ:', nearest?.tz || 'UTC');
    return nearest?.tz || 'UTC';
  }

  // Fallback to geographic ranges
  return getIANATimezoneFallback(lat, lon);
}

function getIANATimezoneFallback(lat, lon) {

  // Pacific & Hawaii
  if (lon >= -180 && lon < -165) return 'Pacific/Honolulu';
  if (lon >= -165 && lon < -155) return 'Pacific/Samoa';
  if (lon >= -155 && lon < -145) return 'America/Anchorage';
  if (lon >= -145 && lon < -130) return 'America/Nome';

  // North America - West
  if (lon >= -130 && lon < -120) return 'America/Los_Angeles';
  if (lon >= -120 && lon < -110) return 'America/Denver';
  if (lon >= -110 && lon < -100) return 'America/Phoenix';
  if (lon >= -100 && lon < -90) return 'America/Chicago';
  if (lon >= -90 && lon < -80) return 'America/New_York';
  if (lon >= -80 && lon < -70) return 'America/Halifax';

  // North America - Central & South
  if (lon >= -100 && lon < -80 && lat < 20) return 'America/Mexico_City';
  if (lon >= -85 && lon < -75 && lat < 15) return 'America/Panama';
  if (lon >= -85 && lon < -60 && lat < 10) return 'America/Cayenne';

  // South America
  if (lon >= -75 && lon < -50 && lat > 0 && lat < 15) return 'America/Bogota';
  if (lon >= -75 && lon < -50 && lat <= 0 && lat > -20) return 'America/Sao_Paulo';
  if (lon >= -75 && lon < -60 && lat <= -20) return 'America/Argentina/Buenos_Aires';
  if (lon >= -75 && lon < -65 && lat > -50 && lat < -20) return 'America/Santiago';

  // Atlantic
  if (lon >= -50 && lon < -30) return 'Atlantic/South_Georgia';
  if (lon >= -30 && lon < -25) return 'Atlantic/Azores';
  if (lon >= -25 && lon < -15) return 'Atlantic/Cape_Verde';

  // Europe & Africa - West
  if (lon >= -15 && lon < 0) return 'Europe/Lisbon';
  if (lon >= 0 && lon < 5) return 'Europe/London';
  if (lon >= 5 && lon < 15) return 'Europe/Paris';
  if (lon >= 15 && lon < 25) return 'Europe/Berlin';
  if (lon >= 25 && lon < 35) return 'Europe/Athens';
  if (lon >= 35 && lon < 50) return 'Europe/Moscow';

  // Africa
  if (lon >= -15 && lon < 25 && lat < 10 && lat > -25) return 'Africa/Lagos';
  if (lon >= 10 && lon < 40 && lat < 35 && lat > 20) return 'Africa/Cairo';
  if (lon >= 25 && lon < 40 && lat < 0 && lat > -30) return 'Africa/Johannesburg';
  if (lon >= 30 && lon < 45 && lat > 0 && lat < 20) return 'Africa/Nairobi';
  if (lon >= 45 && lon < 60 && lat > 0 && lat < 25) return 'Africa/Addis_Ababa';

  // Middle East & Central Asia
  if (lon >= 35 && lon < 50 && lat > 30 && lat < 45) return 'Asia/Tehran';
  if (lon >= 50 && lon < 65 && lat > 25 && lat < 45) return 'Asia/Tehran';
  if (lon >= 40 && lon <= 60 && lat > 15 && lat < 35) return 'Asia/Dubai';
  if (lon >= 50 && lon < 75 && lat > 30 && lat < 45) return 'Asia/Tashkent';
  if (lon >= 60 && lon < 80 && lat > 15 && lat < 40) return 'Asia/Karachi';

  // South Asia
  if (lon >= 70 && lon < 90 && lat > 5 && lat < 35) return 'Asia/Kolkata';
  if (lon >= 85 && lon < 100 && lat > 20 && lat < 35) return 'Asia/Kathmandu';

  // Southeast Asia
  if (lon >= 95 && lon < 110 && lat > 5 && lat < 30) return 'Asia/Bangkok';
  if (lon >= 95 && lon < 110 && lat < 5 && lat > -10) return 'Asia/Jakarta';
  if (lon >= 110 && lon < 125 && lat > 0 && lat < 20) return 'Asia/Manila';

  // East Asia
  if (lon >= 105 && lon < 125 && lat > 20 && lat < 40) return 'Asia/Shanghai';
  if (lon >= 120 && lon < 135 && lat > 30 && lat < 50) return 'Asia/Tokyo';
  if (lon >= 125 && lon < 135 && lat > 30 && lat < 45) return 'Asia/Seoul';
  if (lon >= 110 && lon < 125 && lat > -30 && lat < 0) return 'Asia/Manila';

  // Southeast Asia & Pacific
  if (lon >= 125 && lon < 145 && lat > -15 && lat < 5) return 'Australia/Darwin';
  if (lon >= 145 && lon < 160 && lat > -30 && lat < -10) return 'Australia/Sydney';
  if (lon >= 130 && lon < 145 && lat > -40 && lat < -20) return 'Australia/Melbourne';
  if (lon >= 115 && lon < 135 && lat > -40 && lat < -20) return 'Australia/Perth';

  // Pacific Islands
  if (lon >= 160 && lon < 180) return 'Pacific/Auckland';
  if (lon >= 175 && lon < 180) return 'Pacific/Tongatapu';
  if (lon >= 170 && lon < 180 && lat < -30 && lat > -50) return 'Pacific/Auckland';

  return 'UTC';
}

// Get actual UTC offset from Intl API
function getTimezoneOffsetFromIntl(ianaTimezone, date) {
  const utcFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  const localFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: ianaTimezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  const utcParts = utcFormatter.formatToParts(date);
  const localParts = localFormatter.formatToParts(date);

  // Extract components
  const utcHour = parseInt(utcParts.find(p => p.type === 'hour').value);
  const utcMinute = parseInt(utcParts.find(p => p.type === 'minute').value);
  const localHour = parseInt(localParts.find(p => p.type === 'hour').value);
  const localMinute = parseInt(localParts.find(p => p.type === 'minute').value);

  console.log('[TZ Debug] UTC:', utcHour + ':' + String(utcMinute).padStart(2,'0'), 'Local:', localHour + ':' + String(localMinute).padStart(2,'0'));

  // Calculate offset in hours and minutes
  let offsetMinutes = (localHour * 60 + localMinute) - (utcHour * 60 + utcMinute);

  // Handle day boundaries
  if (offsetMinutes > 12 * 60) offsetMinutes -= 24 * 60;
  if (offsetMinutes < -12 * 60) offsetMinutes += 24 * 60;

  const offsetHours = offsetMinutes / 60;
  console.log('[TZ Debug] Offset:', offsetMinutes, 'min =', offsetHours, 'hrs');
  return Math.round(offsetHours * 100) / 100;
}

// Get timezone abbreviation using Intl API - Works for all IANA timezones
function getTimezoneAbbr(location, date) {
  const ianaTimezone = getIANATimezone(location);

  try {
    // Use Intl.DateTimeFormat to get timezone abbreviation for ANY IANA timezone
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: ianaTimezone,
      timeZoneName: 'short'
    });

    const parts = formatter.formatToParts(date);
    const tzPart = parts.find(part => part.type === 'timeZoneName');
    const abbr = tzPart ? tzPart.value : 'UTC';

    console.log('[Timezone] Location:', location.name, '| IANA:', ianaTimezone, '| Abbreviation:', abbr);

    return abbr;
  } catch (error) {
    console.warn('[Timezone Error] Could not get abbreviation for', ianaTimezone, ':', error);
    return 'UTC';
  }
}

// Initialize and run simple panchanga widget
async function initSimplePanchangaWidget() {
  const widget = document.getElementById('panchanga-simple-widget');
  const locationInputState = document.getElementById('panchanga-location-input-state');
  const loadingEl = document.getElementById('panchanga-loading');
  const errorEl = document.getElementById('panchanga-error');
  const resultsEl = document.getElementById('panchanga-results');
  const locationInput = document.getElementById('panchanga-simple-location-input');
  const suggestionsDiv = document.getElementById('panchanga-simple-location-suggestions');
  const calculateBtn = document.getElementById('panchanga-simple-calculate-btn');
  const cachedLocationsDiv = document.getElementById('panchanga-simple-cached-locations');

  try {
    // Wait for required libraries to load
    await waitForLibraries();

    const calculator = new PanchangaCalculator();
    const locationManager = new LocationManager();

    await calculator.init();

    let selectedLocation = null;

    // Collapsed/Expanded view toggle
    const collapsedView = document.getElementById('panchanga-collapsed-view');
    const expandBtn = document.getElementById('panchanga-expand-location-btn');
    const collapseBtn = document.getElementById('panchanga-collapse-location-btn');

    if (expandBtn) {
      expandBtn.onclick = () => {
        collapsedView.style.display = 'none';
        locationInputState.style.display = 'block';
        locationInput.focus();
      };
    }

    if (collapseBtn) {
      collapseBtn.onclick = () => {
        collapsedView.style.display = 'block';
        locationInputState.style.display = 'none';
        // Keep results visible (which includes location display with Change link)
        resultsEl.style.display = 'block';
      };
    }

    // Auto-load location from URL params or cache
    const autoLoadLocation = () => {
      // 1. Check URL parameters first (highest priority)
      if (window.initialLocation) {
        selectedLocation = window.initialLocation;
        console.log('[Widget] Loaded location from URL params:', selectedLocation);
        return true;
      }

      if (window.initialLocationName) {
        locationInput.value = window.initialLocationName;
        // Will geocode when calculateBtn is clicked
        console.log('[Widget] Will geocode location from URL:', window.initialLocationName);
        return true;
      }

      // 2. Fall back to cached location
      const storedLocation = locationManager.getStoredLocation();
      if (storedLocation) {
        selectedLocation = storedLocation;
        console.log('[Widget] Loaded location from cache:', selectedLocation);
        return true;
      }

      return false;
    };

    // Load cached locations and show suggestions
    const loadCachedLocations = () => {
      const cache = locationManager.getGeocodingCache();
      const uniqueLocations = new Set();

      Object.values(cache).forEach(results => {
        results.forEach(loc => uniqueLocations.add(JSON.stringify(loc)));
      });

      if (uniqueLocations.size > 0) {
        const locations = Array.from(uniqueLocations).map(s => JSON.parse(s));
        cachedLocationsDiv.innerHTML = `
          <div style="font-size: 12px; color: #666; margin-bottom: 8px;">📚 Recently Used Locations:</div>
          <div style="display: grid; gap: 6px;">
            ${locations.slice(0, 5).map(loc => `
              <button class="panchanga-btn panchanga-btn-secondary" style="text-align: left; white-space: normal; cursor: pointer;"
                onclick="document.getElementById('panchanga-simple-location-input').value = '${loc.name}';
                  document.getElementById('panchanga-simple-location-input').dispatchEvent(new Event('input')); return false;">
                ${loc.name}
              </button>
            `).join('')}
          </div>
        `;
      }
    };

    loadCachedLocations();

    // Location input autocomplete
    locationInput.addEventListener('input', async (e) => {
      const query = e.target.value;
      if (query.length < 2) {
        suggestionsDiv.style.display = 'none';
        return;
      }

      const results = await locationManager.geocodeLocation(query);
      if (results.length === 0) {
        suggestionsDiv.innerHTML = '<div style="padding: 10px; color: #666; font-size: 12px;">No locations found</div>';
        suggestionsDiv.style.display = 'block';
        return;
      }

      suggestionsDiv.innerHTML = results.map((loc, idx) => `
        <div class="panchanga-suggestion-item" style="padding: 10px 12px; cursor: pointer; border-bottom: 1px solid #e1e4e8; font-size: 13px;"
          onmouseover="this.style.background='#f6f8fa'"
          onmouseout="this.style.background='white'"
          onclick="selectLocation('${loc.name.replace(/'/g, "\\'")}', ${loc.latitude}, ${loc.longitude})">
          ${loc.name}
        </div>
      `).join('');
      suggestionsDiv.style.display = 'block';
    });

    // Select location and update URL
    window.selectLocation = (name, lat, lon) => {
      selectedLocation = { name, latitude: lat, longitude: lon };
      locationInput.value = name;
      suggestionsDiv.style.display = 'none';
      calculateBtn.focus();

      // Update URL with selected location
      const url = new URL(window.location);
      url.searchParams.set('location', name);
      url.searchParams.set('locationid', `${lat.toFixed(4)},${lon.toFixed(4)}`);
      window.history.pushState({ location: selectedLocation }, '', url);
      console.log('[Widget] Updated URL with location:', name);
    };

    // Calculate button
    calculateBtn.onclick = async () => {
      if (!selectedLocation && locationInput.value.trim()) {
        const results = await locationManager.geocodeLocation(locationInput.value);
        if (results.length === 0) {
          errorEl.style.display = 'block';
          errorEl.textContent = '❌ Error: Location not found. Please try again.';
          resultsEl.style.display = 'none';
          return;
        }
        selectedLocation = results[0];
      }

      if (!selectedLocation) {
        errorEl.style.display = 'block';
        errorEl.textContent = '❌ Error: Please enter a location.';
        resultsEl.style.display = 'none';
        return;
      }

      try {
        errorEl.style.display = 'none';
        locationInputState.style.display = 'none';
        loadingEl.style.display = 'block';
        resultsEl.style.display = 'none';

        // Update URL with selected location
        const url = new URL(window.location);
        url.searchParams.set('location', selectedLocation.name);
        url.searchParams.set('locationid', `${selectedLocation.latitude.toFixed(4)},${selectedLocation.longitude.toFixed(4)}`);
        window.history.pushState({ location: selectedLocation }, '', url);
        console.log('[Widget] Updated URL with location:', selectedLocation.name);

        // Save location to cache
        locationManager.saveLocationToStorage(selectedLocation);

        // Get IANA timezone first, then calculate today in LOCATION's timezone
        const now = new Date();
        const ianaTimezone = getIANATimezone(selectedLocation);

        // Calculate today's date in the LOCATION's timezone (not browser's)
        const dateFormatter = new Intl.DateTimeFormat('en-CA', {
          timeZone: ianaTimezone,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });

        const localDateStr = dateFormatter.format(now);
        const [year, month, day] = localDateStr.split('-').map(Number);
        const today = new Date(year, month - 1, day, 0, 0, 0);

        console.log('[Widget] Browser now:', now.toISOString(), 'Location timezone:', ianaTimezone, 'Local date:', localDateStr);

        const panchanga = await calculator.calculateFullPanchanga(
          today,
          selectedLocation.latitude,
          selectedLocation.longitude
        );

        // Get timezone offset and abbreviation
        const tzOffset = getTimezoneOffsetFromIntl(ianaTimezone, now);
        const tzAbbr = getTimezoneAbbr(selectedLocation, now);

        // Get local date in location's timezone using Intl API
        const dateFormatter = new Intl.DateTimeFormat('en-CA', {
          timeZone: ianaTimezone,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });

        const localDate = dateFormatter.format(now);
        const tzOffset_str = tzOffset >= 0 ? `UTC+${tzOffset}` : `UTC${tzOffset}`;

        const dateDisplayEl = document.getElementById('panchanga-date-display');
        if (dateDisplayEl) dateDisplayEl.textContent = `${localDate} (${tzAbbr}, ${tzOffset_str})`;

        // Update location display
        const locationDisplayEl = document.getElementById('panchanga-location-display');
        if (locationDisplayEl) locationDisplayEl.textContent = selectedLocation.name;

        // Update Pradosha info
        const pradoshaSunsetEl = document.getElementById('pradosha-sunset');
        if (pradoshaSunsetEl) pradoshaSunsetEl.textContent = panchanga.times.sunset.timeIST;

        const pradoshaStart = new Date(panchanga.times.sunset.date.getTime() - 90 * 60 * 1000);
        const pradoshaEnd = new Date(panchanga.times.sunset.date.getTime() + 90 * 60 * 1000);
        const pradoshaWindowEl = document.getElementById('pradosha-window');
        if (pradoshaWindowEl) {
          pradoshaWindowEl.textContent =
            `${calculator.formatTime(pradoshaStart.getHours(), pradoshaStart.getMinutes())} to ${calculator.formatTime(pradoshaEnd.getHours(), pradoshaEnd.getMinutes())}`;
        }

        // Update full panchanga details
        const p = panchanga.panchanga;

        // Tithi
        const tithiNameEl = document.getElementById('tithi-name');
        if (tithiNameEl) tithiNameEl.textContent = p.tithi.name;

        const tithiPhaseEl = document.getElementById('tithi-phase');
        if (tithiPhaseEl) tithiPhaseEl.textContent = p.tithi.phase?.toUpperCase?.() || '';

        const tithiEndtimeEl = document.getElementById('tithi-endtime');
        if (tithiEndtimeEl) tithiEndtimeEl.textContent = p.tithi.endTime || '--:--';

        const tithiNextEl = document.getElementById('tithi-next');
        if (tithiNextEl) tithiNextEl.textContent = p.tithi.nextTithi || '--';

        const tithiNextTamilEl = document.getElementById('tithi-next-tamil');
        if (tithiNextTamilEl) tithiNextTamilEl.textContent = p.tithi.nextTithiTamil || '--';

        // Nakshatra
        const nakshatraNameEl = document.getElementById('nakshatra-name');
        if (nakshatraNameEl) nakshatraNameEl.textContent = p.nakshatra.name;

        const nakshatraTamilEl = document.getElementById('nakshatra-tamil');
        if (nakshatraTamilEl) nakshatraTamilEl.textContent = p.nakshatra.tamil;

        const nakshatraEndtimeEl = document.getElementById('nakshatra-endtime');
        if (nakshatraEndtimeEl) nakshatraEndtimeEl.textContent = p.nakshatra.endTime || '--:--';

        const nakshatraNextEl = document.getElementById('nakshatra-next');
        if (nakshatraNextEl) nakshatraNextEl.textContent = p.nakshatra.nextNakshatra || '--';

        const nakshatraNextTamilEl = document.getElementById('nakshatra-next-tamil');
        if (nakshatraNextTamilEl) nakshatraNextTamilEl.textContent = p.nakshatra.nextNakshatraTamil || '--';

        // Yoga
        const yogaNameEl = document.getElementById('yoga-name');
        if (yogaNameEl) yogaNameEl.textContent = p.yoga.name;

        const yogaTamilEl = document.getElementById('yoga-tamil');
        if (yogaTamilEl) yogaTamilEl.textContent = p.yoga.tamil;

        const yogaEndtimeEl = document.getElementById('yoga-endtime');
        if (yogaEndtimeEl) yogaEndtimeEl.textContent = p.yoga.endTime || '--:--';

        const yogaNextEl = document.getElementById('yoga-next');
        if (yogaNextEl) yogaNextEl.textContent = p.yoga.nextYoga || '--';

        const yogaNextTamilEl = document.getElementById('yoga-next-tamil');
        if (yogaNextTamilEl) yogaNextTamilEl.textContent = p.yoga.nextYogaTamil || '--';

        // Karana
        const karanaNameEl = document.getElementById('karana-name');
        if (karanaNameEl) karanaNameEl.textContent = p.karana.name;

        const karanaTamilEl = document.getElementById('karana-tamil');
        if (karanaTamilEl) karanaTamilEl.textContent = p.karana.tamil;

        const karanaEndtimeEl = document.getElementById('karana-endtime');
        if (karanaEndtimeEl) karanaEndtimeEl.textContent = p.karana.endTime || '--:--';

        const karanaNextEl = document.getElementById('karana-next');
        if (karanaNextEl) karanaNextEl.textContent = p.karana.nextKarana || '--';

        const karanaNextTamilEl = document.getElementById('karana-next-tamil');
        if (karanaNextTamilEl) karanaNextTamilEl.textContent = p.karana.nextKaranaTamil || '--';

        // Hora
        const horaPlanetEl = document.getElementById('hora-planet');
        if (horaPlanetEl) horaPlanetEl.textContent = p.hora.planet;

        const horaNumberEl = document.getElementById('hora-number');
        if (horaNumberEl) horaNumberEl.textContent = `${p.hora.tamil ? p.hora.tamil + ' - ' : ''}Hour #${p.hora.number}`;

        // Rahu Kalam
        const rahuTimeEl = document.getElementById('rahu-time');
        if (rahuTimeEl) rahuTimeEl.textContent = `${panchanga.times.rahuKalam.startTime} to ${panchanga.times.rahuKalam.endTime}`;

        // Times
        const timesSunriseEl = document.getElementById('times-sunrise');
        if (timesSunriseEl) timesSunriseEl.textContent = panchanga.times.sunrise.timeIST;

        const timesSunsetEl = document.getElementById('times-sunset');
        if (timesSunsetEl) timesSunsetEl.textContent = panchanga.times.sunset.timeIST;

        const timesAbhijitEl = document.getElementById('times-abhijit');
        if (timesAbhijitEl) timesAbhijitEl.textContent = `${panchanga.times.abhijitMuhurta.startTime} to ${panchanga.times.abhijitMuhurta.endTime}`;

        // Next 3 Pradosha dates
        const nextPradosha = await calculator.findNextPradosha(today, selectedLocation.latitude, selectedLocation.longitude);
        const pradoshaListCollapsedEl = document.getElementById('pradosha-next-list-collapsed');

        const pradoshaHTML = nextPradosha.slice(0, 3).map((pd) => {
          // pd.date is UTC sunset time - convert to location's timezone
          // Example: UTC 2026-06-12 20:00 + Dubai (UTC+4) = 2026-06-13 00:00 Dubai local
          const adjustedMs = pd.date.getTime() + (tzOffset * 60 * 60 * 1000);
          const localDateAdjusted = new Date(adjustedMs);
          const localDateStr = localDateAdjusted.toISOString().split('T')[0];

          console.log('[Pradosha] UTC date:', pd.date.toISOString(), 'TZ offset:', tzOffset, 'Local date:', localDateStr);

          return `
          <li class="panchanga-pradosha-item" style="cursor: pointer;" onclick="window.location.href = '/panchangam/?date=${localDateStr}&locationid=${selectedLocation.latitude.toFixed(4)},${selectedLocation.longitude.toFixed(4)}'; return false;">
            <div class="panchanga-pradosha-date">${localDateStr}</div>
            <div class="panchanga-pradosha-time">Tithi: ${pd.tithi.name} (${pd.tithi.phase?.toUpperCase?.() || ''})</div>
            <div class="panchanga-pradosha-time" style="margin-top: 3px;">Pradosha: ${calculator.formatTime(pd.pradoshaStart.getHours(), pd.pradoshaStart.getMinutes())} to ${calculator.formatTime(pd.pradoshaEnd.getHours(), pd.pradoshaEnd.getMinutes())}</div>
          </li>
          `;
        }).join('');

        // Update collapsed view
        if (pradoshaListCollapsedEl) {
          pradoshaListCollapsedEl.innerHTML = pradoshaHTML;
        }

        // Check if today is Pradosha (first date in nextPradosha is today)
        // Compare dates properly - use local date strings with careful timezone handling
        const todayDateStr = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toDateString();
        const firstPradoshaDateStr = nextPradosha.length > 0 ?
          new Date(nextPradosha[0].date.getFullYear(), nextPradosha[0].date.getMonth(), nextPradosha[0].date.getDate()).toDateString() :
          null;
        const isTodayPradosha = firstPradoshaDateStr === todayDateStr;

        const pradoshaTodaySection = document.getElementById('panchanga-pradosha-today-section');
        const expandBtnToday = document.getElementById('panchanga-expand-btn-today');
        const expandableContentToday = document.getElementById('panchanga-expandable-content-today');

        if (isTodayPradosha && pradoshaTodaySection && expandableContentToday) {
          // Show Pradosha today section
          pradoshaTodaySection.style.display = 'block';
          document.getElementById('pradosha-location').textContent = selectedLocation.name;

          // Populate full panchanga details in expandable section
          const detailsTemplate = document.getElementById('panchanga-full-details-template');
          if (detailsTemplate) {
            expandableContentToday.innerHTML = detailsTemplate.innerHTML;
          }

          // Toggle expand/collapse for Pradosha day details
          expandBtnToday.onclick = () => {
            const isOpen = expandableContentToday.style.display === 'block';
            expandableContentToday.style.display = isOpen ? 'none' : 'block';
            document.getElementById('panchanga-expand-icon-today').textContent = isOpen ? '▼' : '▲';
          };
        } else if (pradoshaTodaySection) {
          pradoshaTodaySection.style.display = 'none';
        }

        loadingEl.style.display = 'none';
        resultsEl.style.display = 'block';
        collapsedView.style.display = 'block';
        if (expandBtn) {
          expandBtn.style.display = 'none';  // Hide the location picker button when showing results
        }

        // Reload cached locations
        loadCachedLocations();

      } catch (error) {
        console.error('Calculation error:', error);
        loadingEl.style.display = 'none';
        errorEl.style.display = 'block';
        errorEl.textContent = '❌ Error: ' + error.message;
        resultsEl.style.display = 'none';
      }
    };

    // Change location button
    document.getElementById('panchanga-change-location-btn').onclick = () => {
      selectedLocation = null;
      locationInput.value = '';
      locationInputState.style.display = 'block';
      resultsEl.style.display = 'none';
      loadingEl.style.display = 'none';
      errorEl.style.display = 'none';
      collapsedView.style.display = 'none';
      locationInput.focus();
    };

    // Handle browser back/forward navigation
    window.addEventListener('popstate', (event) => {
      if (event.state && event.state.location) {
        selectedLocation = event.state.location;
        console.log('[Widget] Loaded location from browser history:', selectedLocation);
        calculateBtn.click();
      }
    });

    // Auto-load location from URL params or cache on page load
    const hasLocation = autoLoadLocation();

    if (hasLocation) {
      // Automatically calculate with loaded location
      console.log('[Widget] Auto-calculating with loaded location');
      calculateBtn.click();
    } else {
      // No location found - show the "Select Location" button
      if (expandBtn) {
        expandBtn.style.display = 'block';
      }
      locationInputState.style.display = 'none';
      collapsedView.style.display = 'block';
    }

  } catch (error) {
    console.error('Widget error:', error);
    errorEl.style.display = 'block';
    errorEl.textContent = '❌ Error: ' + error.message;
    locationInputState.style.display = 'none';
    loadingEl.style.display = 'none';
    resultsEl.style.display = 'none';
  }
}

// Run on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSimplePanchangaWidget);
} else {
  initSimplePanchangaWidget();
}
