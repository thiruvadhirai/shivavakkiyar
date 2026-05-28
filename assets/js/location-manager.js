/**
 * Location Manager - Geolocation & Geocoding
 * Handles user location detection, searching, and caching
 */

class LocationManager {
  constructor() {
    this.STORAGE_KEY = 'panchanga_location';
    this.GEOCODING_CACHE_KEY = 'panchanga_geocoding_cache';
    this.CACHE_EXPIRY_DAYS = 30;
    this.NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
  }

  // ============================================================
  // LOCATION DETECTION & STORAGE
  // ============================================================

  async detectUserLocation() {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            name: `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`,
            timestamp: Date.now()
          };
          resolve(location);
        },
        (error) => {
          console.log('Geolocation error:', error.message);
          resolve(null);
        }
      );
    });
  }

  getStoredLocation() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return null;

      const location = JSON.parse(stored);
      const age = Date.now() - location.timestamp;
      const expiry = this.CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

      if (age > expiry) {
        localStorage.removeItem(this.STORAGE_KEY);
        return null;
      }

      return location;
    } catch (e) {
      return null;
    }
  }

  saveLocationToStorage(location) {
    try {
      const toStore = {
        ...location,
        timestamp: Date.now()
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(toStore));
    } catch (e) {
      console.error('Failed to save location:', e);
    }
  }

  clearStoredLocation() {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // ============================================================
  // GEOCODING (Nominatim API)
  // ============================================================

  async geocodeLocation(query) {
    if (!query || query.trim() === '') {
      return [];
    }

    // Check cache first
    const cached = this.getCachedGeocodingResult(query);
    if (cached) {
      return cached;
    }

    try {
      const response = await fetch(
        `${this.NOMINATIM_URL}?q=${encodeURIComponent(query)}&format=json&limit=5`,
        {
          headers: {
            'User-Agent': 'PanchangaCalculator/1.0'
          }
        }
      );

      if (!response.ok) {
        return [];
      }

      const results = await response.json();
      const locations = results.map((result) => ({
        name: result.display_name,
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        type: result.type,
        importance: result.importance
      }));

      // Cache the results
      this.cacheGeocodingResult(query, locations);

      return locations;
    } catch (error) {
      console.error('Geocoding error:', error);
      return [];
    }
  }

  async reverseGeocode(lat, lon) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
        {
          headers: {
            'User-Agent': 'PanchangaCalculator/1.0'
          }
        }
      );

      if (!response.ok) {
        return null;
      }

      const result = await response.json();
      return {
        name: result.display_name,
        latitude: lat,
        longitude: lon
      };
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  }

  // ============================================================
  // CACHING HELPERS
  // ============================================================

  getCachedGeocodingResult(query) {
    try {
      const cache = JSON.parse(localStorage.getItem(this.GEOCODING_CACHE_KEY) || '{}');
      return cache[query.toLowerCase()] || null;
    } catch (e) {
      return null;
    }
  }

  cacheGeocodingResult(query, results) {
    try {
      const cache = JSON.parse(localStorage.getItem(this.GEOCODING_CACHE_KEY) || '{}');
      cache[query.toLowerCase()] = results;
      localStorage.setItem(this.GEOCODING_CACHE_KEY, JSON.stringify(cache));
    } catch (e) {
      console.error('Failed to cache geocoding result:', e);
    }
  }

  getGeocodingCache() {
    try {
      return JSON.parse(localStorage.getItem(this.GEOCODING_CACHE_KEY) || '{}');
    } catch (e) {
      return {};
    }
  }

  clearGeocodingCache() {
    localStorage.removeItem(this.GEOCODING_CACHE_KEY);
  }

  // ============================================================
  // UTILITY FUNCTIONS
  // ============================================================

  formatLocationName(location) {
    if (!location) return 'Unknown Location';
    return location.name || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
  }

  isValidCoordinates(lat, lon) {
    return (
      typeof lat === 'number' &&
      typeof lon === 'number' &&
      lat >= -90 &&
      lat <= 90 &&
      lon >= -180 &&
      lon <= 180
    );
  }
}

// ============================================================
// EXPORTS
// ============================================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = LocationManager;
}
