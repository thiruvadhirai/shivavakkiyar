/**
 * Unit Tests for PanchangaWidget Class
 */

describe('PanchangaWidgetFull', () => {
  let widget;

  beforeEach(() => {
    widget = new PanchangaWidgetFull();
  });

  describe('URL Parameter Parsing', () => {
    test('parseUrlParams extracts date and locationid correctly', () => {
      // Mock window.location.search
      Object.defineProperty(window, 'location', {
        value: {
          search: '?date=2026-06-06&locationid=13.0827,80.2707'
        },
        writable: true
      });

      widget.parseUrlParams();

      expect(widget.urlDate).toBe('2026-06-06');
      expect(widget.urlLocationId).toBe('13.0827,80.2707');
    });

    test('parseUrlParams handles missing locationid', () => {
      Object.defineProperty(window, 'location', {
        value: {
          search: '?date=2026-06-06'
        },
        writable: true
      });

      widget.parseUrlParams();

      expect(widget.urlDate).toBe('2026-06-06');
      expect(widget.urlLocationId).toBeNull();
    });

    test('parseUrlParams creates location object from coordinates', () => {
      Object.defineProperty(window, 'location', {
        value: {
          search: '?date=2026-06-06&locationid=13.0827,80.2707'
        },
        writable: true
      });

      widget.parseUrlParams();

      expect(widget.selectedLocation).not.toBeNull();
      expect(widget.selectedLocation.latitude).toBeCloseTo(13.0827, 4);
      expect(widget.selectedLocation.longitude).toBeCloseTo(80.2707, 4);
    });

    test('parseUrlParams sets today date from URL', () => {
      Object.defineProperty(window, 'location', {
        value: {
          search: '?date=2026-06-06&locationid=13.0827,80.2707'
        },
        writable: true
      });

      widget.parseUrlParams();

      expect(widget.today.getFullYear()).toBe(2026);
      expect(widget.today.getMonth()).toBe(5); // 0-indexed
      expect(widget.today.getDate()).toBe(6);
    });
  });

  describe('Modal Error Handling', () => {
    beforeEach(() => {
      // Create mock modal error element
      const errorDiv = document.createElement('div');
      errorDiv.id = 'panchanga-modal-error';
      errorDiv.style.display = 'none';
      document.body.appendChild(errorDiv);

      // Create mock modal body
      const modalBody = document.createElement('div');
      modalBody.className = 'panchanga-modal-body';
      document.body.appendChild(modalBody);
    });

    afterEach(() => {
      // Clean up
      const errorDiv = document.getElementById('panchanga-modal-error');
      if (errorDiv) errorDiv.remove();
      const modalBody = document.querySelector('.panchanga-modal-body');
      if (modalBody) modalBody.remove();
    });

    test('showModalError creates error element with message', () => {
      widget.showModalError('Test error message');

      const errorDiv = document.getElementById('panchanga-modal-error');
      expect(errorDiv).not.toBeNull();
      expect(errorDiv.textContent).toBe('Test error message');
      expect(errorDiv.className).toContain('panchanga-modal-error');
    });

    test('clearModalError hides error element', () => {
      const errorDiv = document.getElementById('panchanga-modal-error');
      errorDiv.style.display = 'block';

      widget.clearModalError();

      expect(errorDiv.style.display).toBe('none');
    });
  });

  describe('URL State Management', () => {
    test('updateUrlState creates correct URL format', () => {
      const mockPushState = jest.fn();
      window.history.pushState = mockPushState;

      const date = new Date(2026, 5, 6); // June 6, 2026
      const location = {
        latitude: 13.0827,
        longitude: 80.2707
      };

      widget.updateUrlState(date, location);

      expect(mockPushState).toHaveBeenCalledWith(
        expect.objectContaining({
          date: '2026-06-06',
          locationid: '13.0827,80.2707'
        }),
        '',
        '?date=2026-06-06&locationid=13.0827,80.2707'
      );
    });

    test('updateUrlState handles null location gracefully', () => {
      const mockPushState = jest.fn();
      window.history.pushState = mockPushState;

      widget.updateUrlState(new Date(), null);

      expect(mockPushState).not.toHaveBeenCalled();
    });

    test('updateUrlState handles null date gracefully', () => {
      const mockPushState = jest.fn();
      window.history.pushState = mockPushState;

      widget.updateUrlState(null, { latitude: 13.0827, longitude: 80.2707 });

      expect(mockPushState).not.toHaveBeenCalled();
    });
  });

  describe('Location Restoration', () => {
    beforeEach(() => {
      // Create mock DOM elements
      const locationInput = document.createElement('input');
      locationInput.id = 'panchanga-location-input';
      document.body.appendChild(locationInput);

      const currentLocationDiv = document.createElement('div');
      currentLocationDiv.id = 'panchanga-current-location';
      document.body.appendChild(currentLocationDiv);
    });

    afterEach(() => {
      document.getElementById('panchanga-location-input')?.remove();
      document.getElementById('panchanga-current-location')?.remove();
    });

    test('restoreLocation sets effective location from URL location', () => {
      widget.selectedLocation = {
        name: 'Chennai, India',
        latitude: 13.0827,
        longitude: 80.2707
      };

      widget.locationManager = {
        getStoredLocation: () => null
      };

      widget.restoreLocation();

      expect(widget.effectiveLocation).toBe(widget.selectedLocation);
      expect(widget.selectedLocation.name).toBe('Chennai, India');
    });

    test('restoreLocation falls back to saved location', () => {
      widget.selectedLocation = null;
      const savedLocation = {
        name: 'Delhi, India',
        latitude: 28.6139,
        longitude: 77.2090
      };

      widget.locationManager = {
        getStoredLocation: () => savedLocation
      };

      widget.restoreLocation();

      expect(widget.effectiveLocation).toBe(savedLocation);
      expect(widget.selectedLocation).toBe(savedLocation);
    });
  });

  describe('Modal State Management', () => {
    beforeEach(() => {
      const modal = document.createElement('div');
      modal.id = 'panchanga-modal-overlay';
      modal.classList.remove('active');
      document.body.appendChild(modal);
    });

    afterEach(() => {
      document.getElementById('panchanga-modal-overlay')?.remove();
    });

    test('openModal adds active class to modal overlay', () => {
      const modal = document.getElementById('panchanga-modal-overlay');
      modal.classList.remove('active');

      widget.openModal();

      expect(modal.classList.contains('active')).toBe(true);
      expect(document.body.style.overflow).toBe('hidden');
    });

    test('closeModal removes active class from modal overlay', () => {
      const modal = document.getElementById('panchanga-modal-overlay');
      modal.classList.add('active');

      widget.closeModal();

      expect(modal.classList.contains('active')).toBe(false);
      expect(document.body.style.overflow).toBe('auto');
    });
  });

  describe('Widget Initialization', () => {
    test('widget constructor initializes properties correctly', () => {
      const newWidget = new PanchangaWidgetFull();

      expect(newWidget.calculator).toBeNull();
      expect(newWidget.locationManager).toBeNull();
      expect(newWidget.selectedLocation).toBeNull();
      expect(newWidget.modalSelectedLocation).toBeNull();
      expect(newWidget.today).toBeInstanceOf(Date);
    });
  });
});
