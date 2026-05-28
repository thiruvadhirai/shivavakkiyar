/**
 * Location Manager - Handles geolocation detection, geocoding, and caching
 * Uses Nominatim (OpenStreetMap) for free geocoding without API key
 */
class LocationManager {
  constructor() {
    this.STORAGE_KEY = 'panchanga_location';
    this.GEOCODING_CACHE_KEY = 'panchanga_geocoding_cache';
    this.CACHE_EXPIRY_DAYS = 30;
    this.NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
    this.REVERSE_NOMINATIM_URL = 'https://nominatim.openstreetmap.org/reverse';
  }

  /**
   * Get stored location from localStorage
   * @returns {Object|null} Location object with name, latitude, longitude, timestamp
   */
  getStoredLocation() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return null;

      const location = JSON.parse(stored);

      // Check if cache has expired (30 days)
      if (location.timestamp) {
        const age = Date.now() - location.timestamp;
        const maxAge = this.CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
        if (age > maxAge) {
          return null; // Cache expired
        }
      }

      return location;
    } catch (error) {
      console.error('Error reading stored location:', error);
      return null;
    }
  }

  /**
   * Save location to localStorage
   * @param {Object} location - Location object with name, latitude, longitude
   */
  saveLocationToStorage(location) {
    try {
      const locationData = {
        name: location.name,
        latitude: location.latitude,
        longitude: location.longitude,
        timestamp: Date.now()
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(locationData));
      return true;
    } catch (error) {
      console.error('Error saving location:', error);
      return false;
    }
  }

  /**
   * Clear stored location from localStorage
   */
  clearStoredLocation() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing location:', error);
      return false;
    }
  }

  /**
   * Detect user location using Geolocation API
   * @returns {Promise<Object>} Promise resolving to location object or null
   */
  detectUserLocation() {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.log('Geolocation not supported');
        resolve(null);
        return;
      }

      const timeout = 5000; // 5 second timeout
      const timer = setTimeout(() => {
        console.log('Geolocation timeout');
        resolve(null);
      }, timeout);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          clearTimeout(timer);
          const { latitude, longitude } = position.coords;

          // Try to get location name via reverse geocoding
          const locationName = await this.reverseGeocode(latitude, longitude);
          const location = {
            name: locationName || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            latitude,
            longitude
          };

          this.saveLocationToStorage(location);
          resolve(location);
        },
        (error) => {
          clearTimeout(timer);
          console.log('Geolocation error:', error.message);
          resolve(null);
        }
      );
    });
  }

  /**
   * Geocode location from query (city, state, country, or ZIP code)
   * @param {string} query - Location query (e.g., "Chennai", "New Delhi, India", "10001")
   * @returns {Promise<Array>} Array of matching locations with coordinates
   */
  async geocodeLocation(query) {
    if (!query || query.trim().length === 0) {
      return [];
    }

    // Check cache first
    const cached = this.getCachedLocation(query);
    if (cached && cached.length > 0) {
      return cached;
    }

    try {
      const params = new URLSearchParams({
        q: query.trim(),
        format: 'json',
        limit: 5
        // Allow global search - works for any country
      });

      const response = await fetch(`${this.NOMINATIM_URL}?${params.toString()}`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'PanchangaCalculator/1.0' // Required by Nominatim ToS
        }
      });

      if (!response.ok) {
        throw new Error(`Geocoding failed: ${response.statusText}`);
      }

      const results = await response.json();

      // Format results
      const locations = results.map(result => ({
        name: this.formatLocationName(result),
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        boundingbox: result.boundingbox
      }));

      // Cache the results
      if (locations.length > 0) {
        this.cacheGeocodingResult(query, locations);
      }

      return locations;
    } catch (error) {
      console.error('Geocoding error:', error);
      return [];
    }
  }

  /**
   * Reverse geocode coordinates to location name
   * @param {number} latitude
   * @param {number} longitude
   * @returns {Promise<string|null>} Location name or null
   */
  async reverseGeocode(latitude, longitude) {
    try {
      const params = new URLSearchParams({
        lat: latitude,
        lon: longitude,
        format: 'json',
        zoom: 10
      });

      const response = await fetch(`${this.REVERSE_NOMINATIM_URL}?${params.toString()}`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'PanchangaCalculator/1.0'
        }
      });

      if (!response.ok) {
        return null;
      }

      const result = await response.json();
      return this.formatLocationName(result);
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  }

  /**
   * Format location name from Nominatim result
   * @param {Object} result - Nominatim API result object
   * @returns {string} Formatted location name
   */
  formatLocationName(result) {
    if (result.address) {
      // Nominatim reverse geocoding result
      const { city, state, country } = result.address;
      const parts = [];

      if (city) parts.push(city);
      if (state) parts.push(state);
      if (country) parts.push(country);

      return parts.filter(Boolean).join(', ') || result.display_name;
    } else if (result.display_name) {
      // Nominatim search result - truncate for readability
      const parts = result.display_name.split(',').slice(0, 3);
      return parts.map(p => p.trim()).join(', ');
    }

    return '';
  }

  /**
   * Get cached geocoding results for a query
   * @param {string} query - Location query
   * @returns {Array|null} Cached locations or null
   */
  getCachedLocation(query) {
    try {
      const cache = JSON.parse(localStorage.getItem(this.GEOCODING_CACHE_KEY) || '{}');
      const key = query.toLowerCase().trim();
      return cache[key] || null;
    } catch (error) {
      console.error('Error reading geocoding cache:', error);
      return null;
    }
  }

  /**
   * Cache geocoding results
   * @param {string} query - Location query
   * @param {Array} locations - Array of location results
   */
  cacheGeocodingResult(query, locations) {
    try {
      const cache = JSON.parse(localStorage.getItem(this.GEOCODING_CACHE_KEY) || '{}');
      const key = query.toLowerCase().trim();
      cache[key] = locations;
      localStorage.setItem(this.GEOCODING_CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.error('Error caching geocoding result:', error);
    }
  }

  /**
   * Get entire geocoding cache object
   * @returns {Object} Geocoding cache object
   */
  getGeocodingCache() {
    try {
      return JSON.parse(localStorage.getItem(this.GEOCODING_CACHE_KEY) || '{}');
    } catch (error) {
      console.error('Error reading geocoding cache:', error);
      return {};
    }
  }

  /**
   * Clear all geocoding cache
   */
  clearGeocodingCache() {
    try {
      localStorage.removeItem(this.GEOCODING_CACHE_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing geocoding cache:', error);
      return false;
    }
  }

  /**
   * Clear all location-related cache
   */
  clearAllCache() {
    this.clearStoredLocation();
    this.clearGeocodingCache();
  }

  /**
   * Validate coordinates
   * @param {number} latitude
   * @param {number} longitude
   * @returns {boolean} True if valid coordinates
   */
  isValidCoordinates(latitude, longitude) {
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    return !isNaN(lat) && !isNaN(lon) &&
           lat >= -90 && lat <= 90 &&
           lon >= -180 && lon <= 180;
  }

  /**
   * Get location with fallback chain:
   * 1. Stored location
   * 2. Geolocation API detection
   * 3. Default location (null)
   * @returns {Promise<Object|null>} Location object or null
   */
  async getLocationWithFallback() {
    // Try stored location first
    const stored = this.getStoredLocation();
    if (stored) {
      return stored;
    }

    // Try geolocation detection
    const detected = await this.detectUserLocation();
    if (detected) {
      return detected;
    }

    return null;
  }

  /**
   * Get location info string for display
   * @param {Object} location - Location object
   * @returns {string} Human-readable location string
   */
  getLocationString(location) {
    if (!location) return 'Auto-detect location';
    return `${location.name} (${location.latitude.toFixed(2)}, ${location.longitude.toFixed(2)})`;
  }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LocationManager;
}
