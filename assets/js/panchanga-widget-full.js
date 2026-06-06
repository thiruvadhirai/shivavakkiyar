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

      this.parseUrlParams();
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

  parseUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    this.urlDate = urlParams.get('date');
    this.urlLocationId = urlParams.get('locationid');

    if (this.urlDate) {
      const [year, month, day] = this.urlDate.split('-').map(Number);
      this.today = new Date(year, month - 1, day);
      document.getElementById('panchanga-date-input').valueAsDate = this.today;
    }

    if (this.urlLocationId) {
      const [lat, lon] = this.urlLocationId.split(',').map(parseFloat);
      if (!isNaN(lat) && !isNaN(lon)) {
        this.selectedLocation = {
          name: `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
          latitude: lat,
          longitude: lon
        };
      }
    }
  }

  restoreLocation() {
    const savedLocation = this.locationManager.getStoredLocation();
    this.effectiveLocation = this.selectedLocation || savedLocation;
    if (this.effectiveLocation) {
      document.getElementById('panchanga-location-input').value = this.effectiveLocation.name;
      document.getElementById('panchanga-current-location').textContent =
        `📍 ${this.effectiveLocation.name} (${this.effectiveLocation.latitude.toFixed(4)}, ${this.effectiveLocation.longitude.toFixed(4)})`;
    }
    this.selectedLocation = this.effectiveLocation;
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
    const loadingEl = document.getElementById('panchanga-full-loading');
    const resultsEl = document.getElementById('panchanga-full-results');
    const errorEl = document.getElementById('panchanga-full-error');

    try {
      loadingEl.style.display = 'block';
      resultsEl.style.display = 'none';
      errorEl.style.display = 'none';

      const tzOffset = this.calculator.getTimezoneOffsetFromLongitude(location.longitude, dateValue);
      const adjustedDate = new Date(dateValue.getTime() - tzOffset * 60 * 60 * 1000);

      const panchanga = await this.calculator.calculateFullPanchanga(
        adjustedDate,
        location.latitude,
        location.longitude
      );

      this.displayResults(panchanga, dateValue, location, tzOffset, adjustedDate);

      loadingEl.style.display = 'none';
      resultsEl.style.display = 'block';
      document.getElementById('panchanga-collapsed-view').style.display = 'block';

      // Save location
      if (document.getElementById('panchanga-save-location-checkbox').checked) {
        this.locationManager.saveLocationToStorage(location);
      }
    } catch (error) {
      console.error('Calculation error:', error);
      loadingEl.style.display = 'none';
      errorEl.style.display = 'block';
      errorEl.textContent = '❌ Error: ' + error.message;
    }
  }

  displayResults(panchanga, dateValue, location, tzOffset, adjustedDate) {
    const p = panchanga.panchanga;

    // Header
    document.getElementById('panchanga-result-date').textContent = `📅 ${this.calculator.formatDate(dateValue)}`;
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
        this.selectedLocation = {
          name: `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
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
    if (this.urlDate && this.urlLocationId) {
      setTimeout(async () => {
        await this.calculate(this.today, this.selectedLocation);
      }, 500);
    } else if (this.effectiveLocation && !this.urlLocationId) {
      this.selectedLocation = this.effectiveLocation;
      document.getElementById('panchanga-location-input').value = this.effectiveLocation.name;
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
