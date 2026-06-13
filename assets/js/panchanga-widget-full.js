/**
 * Panchanga Widget - Full Calculator with Modal UI
 * Handles location/date input, URL state management, and calculations
 */

class PanchangaWidgetFull {
  constructor() {
    this.calculator = null;
    this.locationManager = null;
    this.selectedLocation = null;
    this.today = new Date();
    this.modalSelectedLocation = null;
    this.urlDate = null;
    this.urlLocationId = null;
    this.effectiveLocation = null;
  }

  async init() {
    try {
      await this.waitForLibraries();
      this.calculator = new PanchangaCalculator();
      this.locationManager = new LocationManager();
      await this.calculator.init();

      await this.parseUrlParams();
      this.restoreLocation();
      this.setupModalHandlers();
      this.setupHistoryHandlers();
      await this.autoLoadAndCalculate();
    } catch (error) {
      console.error('Widget initialization error:', error);
      this.showError('❌ Initialization Error: ' + error.message);
    }
  }

  async waitForLibraries(timeout = 10000) {
    const startTime = Date.now();
    while (typeof PanchangaCalculator === 'undefined' || typeof LocationManager === 'undefined') {
      if (Date.now() - startTime > timeout) {
        throw new Error('Required libraries not loaded.');
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  async parseUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    this.urlDate = urlParams.get('date');
    this.urlLocationId = urlParams.get('locationid');

    if (this.urlDate) {
      const [year, month, day] = this.urlDate.split('-').map(Number);
      // Parse as UTC to avoid timezone shift issues with location-specific timezones
      this.today = new Date(Date.UTC(year, month - 1, day));
      const dateInput = document.getElementById('panchanga-date-input');
      if (dateInput) {
        dateInput.valueAsDate = this.today;
      }
    }

    if (this.urlLocationId) {
      const [lat, lon] = this.urlLocationId.split(',').map(parseFloat);
      if (!isNaN(lat) && !isNaN(lon)) {
        try {
          // Reverse-geocode to get location name instead of coordinates
          const locationName = await this.locationManager.reverseGeocode(lat, lon);
          this.selectedLocation = {
            name: locationName || `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
            latitude: lat,
            longitude: lon
          };
          console.log('[Widget] Loaded location from URL params:', this.selectedLocation);
        } catch (error) {
          console.error('[Widget] Error loading location from URL:', error);
          // Fallback to coordinates
          this.selectedLocation = {
            name: `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
            latitude: lat,
            longitude: lon
          };
        }
      }
    }
  }

  restoreLocation() {
    const savedLocation = this.locationManager.getStoredLocation();
    this.effectiveLocation = this.selectedLocation || savedLocation;
    if (this.effectiveLocation) {
      const locationInput = document.getElementById('panchanga-location-input');
      if (locationInput) {
        locationInput.value = this.effectiveLocation.name;
      }
      const currentLocDisplay = document.getElementById('panchanga-current-location');
      if (currentLocDisplay) {
        currentLocDisplay.textContent =
          `📍 ${this.effectiveLocation.name} (${this.effectiveLocation.latitude.toFixed(4)}, ${this.effectiveLocation.longitude.toFixed(4)})`;
      }
      // Update subtitle with local date and timezone (use today's date initially)
      this.updateSubtitleWithTimezone(this.effectiveLocation, this.today);
    }
    this.selectedLocation = this.effectiveLocation;
  }

  updateSubtitleWithTimezone(location, dateValue = null) {
    const displayDate = dateValue || new Date();
    const ianaTimezone = this.getIANATimezone(location);

    // Get timezone abbreviation and offset using Intl API
    const tzAbbr = this.getTimezoneAbbr(location, displayDate);
    const tzOffset = this.getTimezoneOffsetFromIntl(ianaTimezone, displayDate);

    // Get local date in location's timezone using Intl API
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: ianaTimezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });

    const localDateStr = formatter.format(displayDate);
    const tzOffset_str = tzOffset >= 0 ? `UTC+${tzOffset}` : `UTC${tzOffset}`;

    const subtitle = `${localDateStr} (${tzAbbr}, ${tzOffset_str})`;
    document.getElementById('panchanga-subtitle').textContent = subtitle;
  }

  getTimezoneOffsetFromIntl(ianaTimezone, date) {
    // Get actual UTC offset from Intl API by comparing UTC time with local time
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

    console.log('[Timezone Debug] UTC time:', `${utcHour}:${String(utcMinute).padStart(2,'0')}`, 'Local time:', `${localHour}:${String(localMinute).padStart(2,'0')}`);

    // Calculate offset in hours and minutes
    let offsetMinutes = (localHour * 60 + localMinute) - (utcHour * 60 + utcMinute);

    // Handle day boundaries (e.g., UTC 23:00 -> local 03:00 next day = +4 hours)
    if (offsetMinutes > 12 * 60) offsetMinutes -= 24 * 60; // Past noon diff = went to prev day
    if (offsetMinutes < -12 * 60) offsetMinutes += 24 * 60; // Before neg noon = went to next day

    const offsetHours = offsetMinutes / 60;
    console.log('[Timezone Debug] Offset calculation:', offsetMinutes, 'minutes =', offsetHours, 'hours');

    return Math.round(offsetHours * 100) / 100; // Round to 2 decimal places
  }

  getTimezoneAbbr(location, date) {
    // Get IANA timezone for the location
    const ianaTimezone = this.getIANATimezone(location);

    try {
      // Use Intl API to get timezone abbreviation for any IANA timezone
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
      console.warn(`[Timezone Error] Could not get abbreviation for ${ianaTimezone}:`, error);
      return 'UTC';
    }
  }

  getIANATimezone(location) {
    // Find timezone using nearest-neighbor lookup from geo-tz reference data
    // Intl API is then used to get abbreviation and verify offset
    const lat = location.latitude;
    const lon = location.longitude;

    // If timezone data is available (Jekyll _data/timezones.json), use it
    if (window.timezoneTestCases && Array.isArray(window.timezoneTestCases)) {
      return this.findNearestTimezone(lat, lon, window.timezoneTestCases);
    }

    // Fallback to geographic ranges if data not loaded
    return this.getIANATimezoneFallback(lat, lon);
  }

  findNearestTimezone(lat, lon, testCases) {
    // Calculate distance to each test point and find nearest
    let nearest = null;
    let minDistance = Infinity;

    testCases.forEach(point => {
      // Simple Euclidean distance (good enough for timezone lookup)
      const dLat = point.lat - lat;
      const dLon = point.lon - lon;
      const distance = Math.sqrt(dLat * dLat + dLon * dLon);

      if (distance < minDistance) {
        minDistance = distance;
        nearest = point;
      }
    });

    console.log('[Timezone] Nearest test point:', nearest?.name || 'Unknown', 'Distance:', minDistance.toFixed(2),'°', 'Timezone:', nearest?.tz || 'UTC');
    return nearest?.tz || 'UTC';
  }

  getIANATimezoneFallback(lat, lon) {
    // Fallback geographic range mapping (for when JSON data not loaded)
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

  setupModalHandlers() {
    const expandBtn = document.getElementById('panchanga-expand-details-btn');
    const modalLocationInput = document.getElementById('panchanga-modal-location-input');
    const modalLocationSuggestions = document.getElementById('panchanga-modal-location-suggestions');
    const modalDateInput = document.getElementById('panchanga-modal-date-input');
    const modalAutoDetectBtn = document.getElementById('panchanga-modal-auto-detect-btn');
    const modalCalculateBtn = document.getElementById('panchanga-modal-calculate-btn');
    const modalCloseBtn = document.getElementById('panchanga-modal-close-btn');
    const modalCloseBottomBtn = document.getElementById('panchanga-modal-close-bottom-btn');

    expandBtn.onclick = () => {
      this.openModal();
      if (this.selectedLocation) {
        modalLocationInput.value = this.selectedLocation.name;
      }
      if (this.today) {
        modalDateInput.valueAsDate = this.today;
      }
    };

    // Modal location autocomplete
    modalLocationInput.addEventListener('input', async (e) => {
      const query = e.target.value;
      if (query.length < 2) {
        modalLocationSuggestions.classList.remove('active');
        return;
      }

      const results = await this.locationManager.geocodeLocation(query);
      modalLocationSuggestions.innerHTML = results.map((loc, idx) =>
        `<div class="panchanga-suggestion-item" data-idx="${idx}">${loc.name}</div>`
      ).join('');

      modalLocationSuggestions.classList.add('active');

      document.querySelectorAll('.panchanga-suggestion-item').forEach((item) => {
        item.onclick = async () => {
          const results = await this.locationManager.geocodeLocation(query);
          this.modalSelectedLocation = results[item.dataset.idx];
          modalLocationInput.value = this.modalSelectedLocation.name;
          modalLocationSuggestions.classList.remove('active');
        };
      });
    });

    // Modal auto-detect
    modalAutoDetectBtn.onclick = async () => {
      const location = await this.locationManager.detectUserLocation();
      if (location) {
        this.modalSelectedLocation = location;
        modalLocationInput.value = location.name;
      } else {
        this.showModalError('Could not detect location. Please enable location access or enter manually.');
      }
    };

    // Modal Calculate button
    modalCalculateBtn.onclick = async () => {
      await this.handleModalCalculate(modalLocationInput, modalDateInput);
    };

    // Modal close buttons (X and Close button)
    modalCloseBtn.onclick = () => this.closeModal();
    modalCloseBottomBtn.onclick = () => this.closeModal();

    // Close modal when clicking outside (on overlay)
    const modalOverlay = document.getElementById('panchanga-modal-overlay');
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        this.closeModal();
      }
    });
  }

  async handleModalCalculate(locationInput, dateInput) {
    this.clearModalError();

    // Validate form
    if (!this.modalSelectedLocation && !locationInput.value) {
      this.showModalError('Please enter a location or use Auto-Detect');
      return;
    }

    // Get location if user typed but didn't select
    if (locationInput.value && (!this.modalSelectedLocation || this.modalSelectedLocation.name !== locationInput.value)) {
      const results = await this.locationManager.geocodeLocation(locationInput.value);
      if (results.length === 0) {
        this.showModalError('Location not found. Please try again.');
        return;
      }
      this.modalSelectedLocation = results[0];
    }

    // Validate date
    const dateValue = dateInput.valueAsDate;
    if (!dateValue) {
      this.showModalError('Please select a date');
      return;
    }

    // Update state
    this.selectedLocation = this.modalSelectedLocation;
    this.today = dateValue;

    // Update URL
    this.updateUrlState(dateValue, this.selectedLocation);

    // Calculate
    await this.calculate(dateValue, this.selectedLocation);
    this.closeModal();
  }

  async calculate(dateValue, location) {
    if (!location) {
      console.error('Calculate called without location:', { dateValue, location, selectedLocation: this.selectedLocation, effectiveLocation: this.effectiveLocation });
      const errorEl = document.getElementById('panchanga-full-error');
      if (errorEl) {
        errorEl.style.display = 'block';
        errorEl.textContent = '❌ Error: Location not found. Please select a location.';
      }
      return;
    }

    const loadingEl = document.getElementById('panchanga-full-loading');
    const resultsEl = document.getElementById('panchanga-full-results');
    const errorEl = document.getElementById('panchanga-full-error');

    try {
      if (loadingEl) loadingEl.style.display = 'block';
      if (resultsEl) resultsEl.style.display = 'none';
      if (errorEl) errorEl.style.display = 'none';

      const ianaTimezone = this.getIANATimezone(location);
      const tzOffset = this.getTimezoneOffsetFromIntl(ianaTimezone, dateValue);
      const adjustedDate = new Date(dateValue.getTime() - tzOffset * 60 * 60 * 1000);

      const panchanga = await this.calculator.calculateFullPanchanga(
        adjustedDate,
        location.latitude,
        location.longitude
      );

      this.displayResults(panchanga, dateValue, location, tzOffset, adjustedDate);

      if (loadingEl) loadingEl.style.display = 'none';
      if (resultsEl) resultsEl.style.display = 'block';
      const collapsedView = document.getElementById('panchanga-collapsed-view');
      if (collapsedView) collapsedView.style.display = 'block';

      // Update subtitle with timezone and selected date
      this.updateSubtitleWithTimezone(location, dateValue);

      // Save location
      const saveCheckbox = document.getElementById('panchanga-save-location-checkbox');
      if (saveCheckbox && saveCheckbox.checked) {
        this.locationManager.saveLocationToStorage(location);
      }
    } catch (error) {
      console.error('Calculation error:', error);
      if (loadingEl) loadingEl.style.display = 'none';
      if (errorEl) {
        errorEl.style.display = 'block';
        errorEl.textContent = '❌ Error: ' + error.message;
      }
    }
  }

  displayResults(panchanga, dateValue, location, tzOffset, adjustedDate) {
    const p = panchanga.panchanga;

    // Header - Display the selected calendar date, not the timezone-adjusted UTC time
    // dateValue is UTC midnight for the selected date, but we want to show the selected date
    const year = dateValue.getUTCFullYear();
    const month = String(dateValue.getUTCMonth() + 1).padStart(2, '0');
    const day = String(dateValue.getUTCDate()).padStart(2, '0');
    const displayDate = `${year}-${month}-${day}`;
    document.getElementById('panchanga-result-date').textContent = `📅 ${displayDate}`;
    document.getElementById('panchanga-result-location').textContent = `📍 ${location.name}`;
    document.getElementById('panchanga-result-ayanamsa').textContent = panchanga.ayanamsa.toFixed(2);

    // Tithi
    const pakshaData = PanchangaLanguages.PAKSHA[p.tithi.phase] || { name: p.tithi.phase, tamil: '' };
    document.getElementById('result-paksha-name').textContent = pakshaData.name?.toUpperCase?.() || '';
    document.getElementById('result-paksha-tamil').textContent = pakshaData.tamil || '';
    document.getElementById('result-tithi-name').textContent = p.tithi.name;
    document.getElementById('result-tithi-tamil').textContent = p.tithi.tamil || '';
    document.getElementById('result-tithi-endtime').textContent = p.tithi.endTime || '--:--';
    document.getElementById('result-tithi-next').textContent = p.tithi.nextTithi || '--';
    document.getElementById('result-tithi-next-tamil').textContent = p.tithi.nextTithiTamil || '--';

    // Nakshatra
    document.getElementById('result-nakshatra-name').textContent = p.nakshatra.name;
    document.getElementById('result-nakshatra-tamil').textContent = p.nakshatra.tamil;
    document.getElementById('result-nakshatra-degree').textContent = p.nakshatra.degree;
    document.getElementById('result-nakshatra-endtime').textContent = p.nakshatra.endTime || '--:--';
    document.getElementById('result-nakshatra-next').textContent = p.nakshatra.nextNakshatra || '--';
    document.getElementById('result-nakshatra-next-tamil').textContent = p.nakshatra.nextNakshatraTamil || '--';

    // Yoga
    document.getElementById('result-yoga-name').textContent = p.yoga.name;
    document.getElementById('result-yoga-tamil').textContent = p.yoga.tamil;
    document.getElementById('result-yoga-endtime').textContent = p.yoga.endTime || '--:--';
    document.getElementById('result-yoga-next').textContent = p.yoga.nextYoga || '--';
    document.getElementById('result-yoga-next-tamil').textContent = p.yoga.nextYogaTamil || '--';

    // Karana
    document.getElementById('result-karana-name').textContent = p.karana.name;
    document.getElementById('result-karana-tamil').textContent = p.karana.tamil;
    document.getElementById('result-karana-endtime').textContent = p.karana.endTime || '--:--';
    document.getElementById('result-karana-next').textContent = p.karana.nextKarana || '--';
    document.getElementById('result-karana-next-tamil').textContent = p.karana.nextKaranaTamil || '--';

    // Horas
    const horasBody = document.getElementById('result-horas-body');
    horasBody.innerHTML = '';
    if (p.horas && Array.isArray(p.horas)) {
      p.horas.forEach(hora => {
        const row = document.createElement('tr');
        row.style.borderBottom = '1px solid #eee';
        if (hora.number === p.hora.number) {
          row.style.backgroundColor = '#fffacd';
          row.style.fontWeight = 'bold';
        }
        row.innerHTML = `
          <td style="padding: 5px;">#${hora.number}</td>
          <td style="padding: 5px;"><strong>${hora.planet}</strong></td>
          <td style="padding: 5px;">${hora.startTime} - ${hora.endTime}</td>
          <td style="padding: 5px; color: #666;">${hora.tamil}</td>
        `;
        horasBody.appendChild(row);
      });
    }

    // Times
    document.getElementById('result-rahu-time').textContent = `${panchanga.times.rahuKalam.startTime} to ${panchanga.times.rahuKalam.endTime}`;
    document.getElementById('result-sunrise').textContent = panchanga.times.sunrise.timeIST;
    document.getElementById('result-sunset').textContent = panchanga.times.sunset.timeIST;
    document.getElementById('result-abhijit').textContent = `${panchanga.times.abhijitMuhurta.startTime} to ${panchanga.times.abhijitMuhurta.endTime}`;

    // Celestial
    document.getElementById('result-sun-lon').textContent = panchanga.celestial.sunLongitude.toFixed(2) + '°';
    document.getElementById('result-moon-lon').textContent = panchanga.celestial.moonLongitude.toFixed(2) + '°';
  }

  updateUrlState(date, location) {
    if (!date || !location) return;

    const dateStr = date.toISOString().split('T')[0];
    const locationId = `${location.latitude.toFixed(4)},${location.longitude.toFixed(4)}`;
    const url = `?date=${dateStr}&locationid=${locationId}`;

    window.history.pushState(
      { date: dateStr, locationid: locationId },
      '',
      url
    );
  }

  setupHistoryHandlers() {
    window.addEventListener('popstate', async (event) => {
      const urlParams = new URLSearchParams(window.location.search);
      const dateParam = urlParams.get('date');
      const locationIdParam = urlParams.get('locationid');

      if (dateParam && locationIdParam) {
        const [lat, lon] = locationIdParam.split(',').map(parseFloat);
        // Reverse-geocode to get location name
        const locationName = await this.locationManager.reverseGeocode(lat, lon);
        this.selectedLocation = {
          name: locationName || `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
          latitude: lat,
          longitude: lon
        };

        const [year, month, day] = dateParam.split('-').map(Number);
        const dateValue = new Date(year, month - 1, day);

        document.getElementById('panchanga-location-input').value = this.selectedLocation.name;
        document.getElementById('panchanga-date-input').valueAsDate = dateValue;

        await this.calculate(dateValue, this.selectedLocation);
      } else {
        document.getElementById('panchanga-collapsed-view').style.display = 'block';
        document.getElementById('panchanga-full-results').style.display = 'none';
      }
    });
  }

  async autoLoadAndCalculate() {
    console.log('[Widget] autoLoadAndCalculate check:', {
      urlDate: this.urlDate,
      selectedLocation: this.selectedLocation?.name || 'null',
      today: this.today,
      effectiveLocation: this.effectiveLocation?.name || 'null'
    });

    if (this.urlDate && this.selectedLocation) {
      // URL has both date and location - auto-calculate
      console.log('[Widget] Auto-calculating from URL params');
      setTimeout(async () => {
        await this.calculate(this.today, this.selectedLocation);
      }, 500);
    } else if (this.urlDate && this.effectiveLocation) {
      // URL has date + cached location - auto-calculate
      this.selectedLocation = this.effectiveLocation;
      const locationInput = document.getElementById('panchanga-location-input');
      if (locationInput) {
        locationInput.value = this.effectiveLocation.name;
      }
      console.log('[Widget] Auto-calculating from URL date + cached location');
      setTimeout(async () => {
        await this.calculate(this.today, this.selectedLocation);
      }, 500);
    } else if (this.effectiveLocation && !this.urlDate) {
      // No URL params but have cached location - just load location
      this.selectedLocation = this.effectiveLocation;
      const locationInput = document.getElementById('panchanga-location-input');
      if (locationInput) {
        locationInput.value = this.effectiveLocation.name;
      }
      console.log('[Widget] Loaded cached location');
    }
  }

  openModal() {
    const modalOverlay = document.getElementById('panchanga-modal-overlay');
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    const modalOverlay = document.getElementById('panchanga-modal-overlay');
    modalOverlay.classList.remove('active');
    document.body.style.overflow = 'auto';
  }

  showModalError(message) {
    const errorDiv = document.getElementById('panchanga-modal-error') || document.createElement('div');
    errorDiv.id = 'panchanga-modal-error';
    errorDiv.className = 'panchanga-modal-error';
    errorDiv.textContent = message;

    const modalBody = document.querySelector('.panchanga-modal-body');
    if (!document.getElementById('panchanga-modal-error')) {
      modalBody.insertBefore(errorDiv, modalBody.firstChild);
    } else {
      errorDiv.style.display = 'block';
    }
  }

  clearModalError() {
    const errorDiv = document.getElementById('panchanga-modal-error');
    if (errorDiv) {
      errorDiv.style.display = 'none';
    }
  }

  showError(message) {
    const errorEl = document.getElementById('panchanga-full-error');
    if (errorEl) {
      errorEl.style.display = 'block';
      errorEl.textContent = message;
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const widget = new PanchangaWidgetFull();
    widget.init();
  });
} else {
  const widget = new PanchangaWidgetFull();
  widget.init();
}
