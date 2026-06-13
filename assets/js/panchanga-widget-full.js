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

    if (this.urlDate) {
      const [year, month, day] = this.urlDate.split('-').map(Number);
      // Parse as UTC to ensure consistent date handling across all timezones
      // The calculate() method will adjust this based on the selected location's timezone
      this.today = new Date(Date.UTC(year, month - 1, day));
      const dateInput = document.getElementById('panchanga-date-input');
      if (dateInput) {
        dateInput.valueAsDate = this.today;
      }
    }

    // Support new URL format: ?lat=X&lon=Y&location=name&tz=TZ
    const lat = parseFloat(urlParams.get('lat'));
    const lon = parseFloat(urlParams.get('lon'));
    const locationStr = urlParams.get('location');
    const tz = urlParams.get('tz');

    if (!isNaN(lat) && !isNaN(lon)) {
      this.selectedLocation = {
        name: decodeURIComponent(locationStr) || `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
        latitude: lat,
        longitude: lon,
        city: null,
        state: null,
        country: null,
        timezone: tz || window.getTimezone(lat, lon) || 'UTC'
      };
      console.log('[Widget] Loaded location from URL params:', this.selectedLocation);
    }

    // Fallback: Support old URL format: ?locationid=lat,lon for backward compatibility
    if (!this.selectedLocation) {
      const urlLocationId = urlParams.get('locationid');
      if (urlLocationId) {
        const [oldLat, oldLon] = urlLocationId.split(',').map(parseFloat);
        if (!isNaN(oldLat) && !isNaN(oldLon)) {
          try {
            // Reverse-geocode to get location name instead of coordinates
            const locationName = await this.locationManager.reverseGeocode(oldLat, oldLon);
            this.selectedLocation = {
              name: locationName || `${oldLat.toFixed(4)}, ${oldLon.toFixed(4)}`,
              latitude: oldLat,
              longitude: oldLon,
              timezone: window.getTimezone(oldLat, oldLon) || 'UTC'
            };
            console.log('[Widget] Loaded location from URL params (legacy):', this.selectedLocation);
          } catch (error) {
            console.error('[Widget] Error loading location from URL:', error);
            // Fallback to coordinates
            this.selectedLocation = {
              name: `${oldLat.toFixed(4)}, ${oldLon.toFixed(4)}`,
              latitude: oldLat,
              longitude: oldLon,
              timezone: window.getTimezone(oldLat, oldLon) || 'UTC'
            };
          }
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
    const subtitleEl = document.getElementById('panchanga-subtitle');
    if (subtitleEl) subtitleEl.textContent = subtitle;
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
    // Find timezone using local cached timezone lookup (400+ regions)
    const lat = location.latitude;
    const lon = location.longitude;

    // Use the timezone lookup function
    if (typeof window.getTimezone === 'function') {
      const tz = window.getTimezone(lat, lon);
      if (tz && tz !== 'UTC') {
        return tz;
      }
    }

    // Fallback to geographic ranges if timezone lookup not available
    console.log('[Timezone] Using fallback geographic lookup');
    return this.getIANATimezoneFallback(lat, lon);
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

    // Modal location autocomplete with debouncing (non-blocking)
    let geocodeTimeout;
    let lastQuery = '';

    modalLocationInput.addEventListener('input', async (e) => {
      const query = e.target.value.trim();
      lastQuery = query;

      // Clear previous timeout
      clearTimeout(geocodeTimeout);

      if (query.length < 2) {
        modalLocationSuggestions.innerHTML = '';
        modalLocationSuggestions.classList.remove('active');
        return;
      }

      // Debounce: wait 300ms before making API call (user can keep typing)
      geocodeTimeout = setTimeout(async () => {
        // If query changed while waiting, skip this search
        if (lastQuery !== query) return;

        try {
          console.log('[Modal] Searching for:', query);
          const results = await this.locationManager.geocodeLocation(query);
          console.log('[Modal] Found results:', results.length);

          // If user typed something else while we were loading, skip
          if (lastQuery !== query) return;

          if (results.length === 0) {
            // Don't show anything for no results - just keep dropdown hidden
            modalLocationSuggestions.classList.remove('active');
            modalLocationSuggestions.innerHTML = '';
            return;
          }

          // Display results
          modalLocationSuggestions.innerHTML = results.map((loc, idx) =>
            `<div class="panchanga-suggestion-item" data-idx="${idx}" style="cursor: pointer; padding: 8px 12px; border-bottom: 1px solid #eee;">${loc.name}</div>`
          ).join('');

          modalLocationSuggestions.classList.add('active');

          // Add click handlers
          document.querySelectorAll('#panchanga-modal-location-suggestions .panchanga-suggestion-item').forEach((item) => {
            item.onclick = () => {
              const idx = parseInt(item.dataset.idx);
              this.modalSelectedLocation = results[idx];

              // Auto-detect timezone from coordinates
              const tz = window.getTimezone(this.modalSelectedLocation.latitude, this.modalSelectedLocation.longitude);
              this.modalSelectedLocation.timezone = tz;

              modalLocationInput.value = this.modalSelectedLocation.name;
              modalLocationSuggestions.classList.remove('active');
              modalLocationSuggestions.innerHTML = '';

              updateCalculateButtonState();
              console.log('[Modal] Selected:', this.modalSelectedLocation);
            };
          });
        } catch (error) {
          console.error('[Modal] Geocoding error:', error);
          // Silently fail - don't show error message, just keep input available
          modalLocationSuggestions.classList.remove('active');
          modalLocationSuggestions.innerHTML = '';
        }
      }, 300);
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

    // Update calculate button state based on form validity
    const updateCalculateButtonState = () => {
      const hasLocation = this.modalSelectedLocation !== null;
      const hasDate = modalDateInput.value !== '';
      const isValid = hasLocation && hasDate;

      modalCalculateBtn.disabled = !isValid;
      modalCalculateBtn.style.opacity = isValid ? '1' : '0.5';
      modalCalculateBtn.style.cursor = isValid ? 'pointer' : 'not-allowed';
    };

    // Modal Calculate button
    modalCalculateBtn.onclick = async () => {
      if (!modalCalculateBtn.disabled) {
        await this.handleModalCalculate(modalLocationInput, modalDateInput);
      }
    };

    // Update button state when location changes
    const originalOnClick = expandBtn.onclick;
    expandBtn.onclick = () => {
      originalOnClick();
      updateCalculateButtonState();
    };

    // Update button state when date changes
    modalDateInput.addEventListener('change', updateCalculateButtonState);

    // Update button state when location is selected
    const originalModalAutoDetectClick = modalAutoDetectBtn.onclick;
    modalAutoDetectBtn.onclick = async () => {
      await originalModalAutoDetectClick();
      updateCalculateButtonState();
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

    // Tab switching
    const tabSearchBtn = document.getElementById('panchanga-tab-search');
    const tabManualBtn = document.getElementById('panchanga-tab-manual');
    const searchTab = document.getElementById('panchanga-search-tab');
    const manualTab = document.getElementById('panchanga-manual-tab');

    tabSearchBtn.onclick = () => {
      searchTab.style.display = 'block';
      manualTab.style.display = 'none';
      tabSearchBtn.style.borderBottom = '2px solid #0366d6';
      tabSearchBtn.style.color = '#0366d6';
      tabManualBtn.style.borderBottom = '2px solid transparent';
      tabManualBtn.style.color = '#666';
    };

    tabManualBtn.onclick = () => {
      searchTab.style.display = 'none';
      manualTab.style.display = 'block';
      tabManualBtn.style.borderBottom = '2px solid #0366d6';
      tabManualBtn.style.color = '#0366d6';
      tabSearchBtn.style.borderBottom = '2px solid transparent';
      tabSearchBtn.style.color = '#666';
    };

    // Manual entry handlers
    const manualLatInput = document.getElementById('panchanga-manual-lat');
    const manualLonInput = document.getElementById('panchanga-manual-lon');
    const manualCityInput = document.getElementById('panchanga-manual-city');
    const manualStateInput = document.getElementById('panchanga-manual-state');
    const manualCountryInput = document.getElementById('panchanga-manual-country');
    const manualTzInput = document.getElementById('panchanga-manual-tz');
    const manualEntryBtn = document.getElementById('panchanga-manual-entry-btn');
    const manualLocationDisplay = document.getElementById('panchanga-manual-location-display');

    // Auto-detect timezone when coordinates change
    const updateManualTimezone = () => {
      const lat = parseFloat(manualLatInput.value);
      const lon = parseFloat(manualLonInput.value);

      if (!isNaN(lat) && !isNaN(lon)) {
        const tz = window.getTimezone(lat, lon);
        manualTzInput.value = tz || 'Not found - check coordinates';
        manualTzInput.style.color = tz ? '#24292e' : '#dc3545';
      }
    };

    manualLatInput.addEventListener('change', updateManualTimezone);
    manualLonInput.addEventListener('change', updateManualTimezone);

    // Handle manual entry confirmation
    manualEntryBtn.onclick = () => {
      const manualData = {
        lat: manualLatInput.value,
        lon: manualLonInput.value,
        city: manualCityInput.value,
        state: manualStateInput.value,
        country: manualCountryInput.value,
        timezone: manualTzInput.value
      };

      const validated = this.locationManager.validateManualEntry(manualData);
      if (!validated) {
        this.showModalError('Invalid entry: Check latitude/longitude and ensure at least one location field is filled');
        return;
      }

      // Auto-detect timezone if not set
      if (!validated.timezone || validated.timezone.includes('Not found')) {
        validated.timezone = window.getTimezone(validated.latitude, validated.longitude);
      }

      this.modalSelectedLocation = validated;
      manualLocationDisplay.textContent = `✓ ${validated.name} (${validated.latitude.toFixed(4)}, ${validated.longitude.toFixed(4)}) - ${validated.timezone}`;
      manualLocationDisplay.style.color = '#28a745';

      updateCalculateButtonState(); // Enable/disable calculate button

      // Switch back to search tab to show it's set
      tabSearchBtn.click();
      modalLocationInput.value = validated.name;
    };
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
        location.longitude,
        location.timezone || window.getTimezone(location.latitude, location.longitude)
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
    const lat = location.latitude.toFixed(4);
    const lon = location.longitude.toFixed(4);
    const locationId = `${lat},${lon}`;

    // Build location string from parts
    const locationParts = [];
    if (location.city) locationParts.push(location.city);
    if (location.state) locationParts.push(location.state);
    if (location.country) locationParts.push(location.country);
    const locationStr = locationParts.length > 0 ? locationParts.join(',') : location.name;

    // Auto-detect timezone if not set
    const tz = location.timezone || window.getTimezone(parseFloat(lat), parseFloat(lon)) || 'UTC';

    const url = `?date=${dateStr}&lat=${lat}&lon=${lon}&location=${encodeURIComponent(locationStr)}&tz=${encodeURIComponent(tz)}`;

    window.history.pushState(
      { date: dateStr, lat, lon, location: locationStr, tz },
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
