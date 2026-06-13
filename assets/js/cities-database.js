/**
 * Local Cities Database - Pre-loaded common global cities
 * Reduces API calls to Nominatim and handles rate limiting gracefully
 *
 * Format matches Nominatim API response for seamless integration
 */

const LOCAL_CITIES_DATABASE = [
  // India
  { name: 'Chennai, Tamil Nadu, India', latitude: 13.0827, longitude: 80.2707 },
  { name: 'Thiruvananthapuram, Kerala, India', latitude: 8.5241, longitude: 76.9366 },
  { name: 'Trivandrum, Kerala, India', latitude: 8.5241, longitude: 76.9366 },
  { name: 'Delhi, India', latitude: 28.7041, longitude: 77.1025 },
  { name: 'Mumbai, Maharashtra, India', latitude: 19.0760, longitude: 72.8777 },
  { name: 'Bangalore, Karnataka, India', latitude: 12.9716, longitude: 77.5946 },
  { name: 'Kolkata, West Bengal, India', latitude: 22.5726, longitude: 88.3639 },
  { name: 'Hyderabad, Telangana, India', latitude: 17.3850, longitude: 78.4867 },
  { name: 'Pune, Maharashtra, India', latitude: 18.5204, longitude: 73.8567 },
  { name: 'Ahmedabad, Gujarat, India', latitude: 23.0225, longitude: 72.5714 },
  { name: 'Karur, Tamil Nadu, India', latitude: 11.1271, longitude: 78.7618 },

  // United States
  { name: 'New York, NY, USA', latitude: 40.7128, longitude: -74.0060 },
  { name: 'Los Angeles, CA, USA', latitude: 34.0522, longitude: -118.2437 },
  { name: 'Chicago, IL, USA', latitude: 41.8781, longitude: -87.6298 },
  { name: 'Houston, TX, USA', latitude: 29.7604, longitude: -95.3698 },
  { name: 'Phoenix, AZ, USA', latitude: 33.4484, longitude: -112.0742 },
  { name: 'Philadelphia, PA, USA', latitude: 39.9526, longitude: -75.1652 },
  { name: 'San Antonio, TX, USA', latitude: 29.4241, longitude: -98.4936 },
  { name: 'San Diego, CA, USA', latitude: 32.7157, longitude: -117.1611 },
  { name: 'Dallas, TX, USA', latitude: 32.7767, longitude: -96.7970 },
  { name: 'San Jose, CA, USA', latitude: 37.3382, longitude: -121.8863 },
  { name: 'Austin, TX, USA', latitude: 30.2672, longitude: -97.7431 },
  { name: 'Denver, CO, USA', latitude: 39.7392, longitude: -104.9903 },
  { name: 'Seattle, WA, USA', latitude: 47.6062, longitude: -122.3321 },
  { name: 'Boston, MA, USA', latitude: 42.3601, longitude: -71.0589 },
  { name: 'Miami, FL, USA', latitude: 25.7617, longitude: -80.1918 },
  { name: 'Atlanta, GA, USA', latitude: 33.7490, longitude: -84.3880 },
  { name: 'Tempe, AZ, USA', latitude: 33.4255, longitude: -111.9400 },
  { name: 'Olympia, WA, USA', latitude: 47.0379, longitude: -122.9007 },

  // Middle East
  { name: 'Dubai, UAE', latitude: 25.2048, longitude: 55.2708 },
  { name: 'Abu Dhabi, UAE', latitude: 24.4539, longitude: 54.3773 },
  { name: 'Cairo, Egypt', latitude: 30.0444, longitude: 31.2357 },
  { name: 'Istanbul, Turkey', latitude: 41.0082, longitude: 28.9784 },
  { name: 'Tehran, Iran', latitude: 35.6892, longitude: 51.3890 },
  { name: 'Riyadh, Saudi Arabia', latitude: 24.7136, longitude: 46.6753 },

  // Africa
  { name: 'Addis Ababa, Ethiopia', latitude: 9.0320, longitude: 38.7469 },
  { name: 'Lagos, Nigeria', latitude: 6.5244, longitude: 3.3792 },
  { name: 'Johannesburg, South Africa', latitude: -26.2044, longitude: 28.0456 },
  { name: 'Cape Town, South Africa', latitude: -33.9249, longitude: 18.4241 },
  { name: 'Nairobi, Kenya', latitude: -1.2921, longitude: 36.8219 },
  { name: 'Accra, Ghana', latitude: 5.6037, longitude: -0.1870 },

  // Europe
  { name: 'London, UK', latitude: 51.5074, longitude: -0.1278 },
  { name: 'Paris, France', latitude: 48.8566, longitude: 2.3522 },
  { name: 'Berlin, Germany', latitude: 52.5200, longitude: 13.4050 },
  { name: 'Madrid, Spain', latitude: 40.4168, longitude: -3.7038 },
  { name: 'Rome, Italy', latitude: 41.9028, longitude: 12.4964 },
  { name: 'Amsterdam, Netherlands', latitude: 52.3676, longitude: 4.9041 },
  { name: 'Vienna, Austria', latitude: 48.2082, longitude: 16.3738 },
  { name: 'Moscow, Russia', latitude: 55.7558, longitude: 37.6173 },
  { name: 'Athens, Greece', latitude: 37.9838, longitude: 23.7275 },
  { name: 'Lisbon, Portugal', latitude: 38.7223, longitude: -9.1393 },
  { name: 'Prague, Czech Republic', latitude: 50.0755, longitude: 14.4378 },
  { name: 'Budapest, Hungary', latitude: 47.4979, longitude: 19.0402 },
  { name: 'Warsaw, Poland', latitude: 52.2297, longitude: 21.0122 },
  { name: 'Stockholm, Sweden', latitude: 59.3293, longitude: 18.0686 },
  { name: 'Copenhagen, Denmark', latitude: 55.6761, longitude: 12.5683 },

  // East Asia
  { name: 'Tokyo, Japan', latitude: 35.6762, longitude: 139.6503 },
  { name: 'Beijing, China', latitude: 39.9042, longitude: 116.4074 },
  { name: 'Shanghai, China', latitude: 31.2304, longitude: 121.4737 },
  { name: 'Hong Kong', latitude: 22.3193, longitude: 114.1694 },
  { name: 'Seoul, South Korea', latitude: 37.5665, longitude: 126.9780 },
  { name: 'Bangkok, Thailand', latitude: 13.7563, longitude: 100.5018 },
  { name: 'Singapore', latitude: 1.3521, longitude: 103.8198 },
  { name: 'Manila, Philippines', latitude: 14.5994, longitude: 120.9842 },
  { name: 'Hanoi, Vietnam', latitude: 21.0285, longitude: 105.8542 },

  // South Asia
  { name: 'Kathmandu, Nepal', latitude: 27.7172, longitude: 85.3240 },
  { name: 'Dhaka, Bangladesh', latitude: 23.8103, longitude: 90.4125 },
  { name: 'Islamabad, Pakistan', latitude: 33.6844, longitude: 73.0479 },
  { name: 'Karachi, Pakistan', latitude: 24.8607, longitude: 67.0011 },
  { name: 'Colombo, Sri Lanka', latitude: 6.9271, longitude: 80.7789 },

  // Southeast Asia
  { name: 'Jakarta, Indonesia', latitude: -6.2088, longitude: 106.8456 },
  { name: 'Kuala Lumpur, Malaysia', latitude: 3.1390, longitude: 101.6869 },
  { name: 'Yangon, Myanmar', latitude: 16.8661, longitude: 96.1951 },

  // South America
  { name: 'São Paulo, Brazil', latitude: -23.5505, longitude: -46.6333 },
  { name: 'Rio de Janeiro, Brazil', latitude: -22.9068, longitude: -43.1729 },
  { name: 'Buenos Aires, Argentina', latitude: -34.6037, longitude: -58.3816 },
  { name: 'Lima, Peru', latitude: -12.0462, longitude: -77.0371 },
  { name: 'Bogotá, Colombia', latitude: 4.7110, longitude: -74.0721 },
  { name: 'Caracas, Venezuela', latitude: 10.4806, longitude: -66.9036 },
  { name: 'Santiago, Chile', latitude: -33.4489, longitude: -70.6693 },

  // Oceania
  { name: 'Sydney, Australia', latitude: -33.8688, longitude: 151.2093 },
  { name: 'Melbourne, Australia', latitude: -37.8136, longitude: 144.9631 },
  { name: 'Brisbane, Australia', latitude: -27.4698, longitude: 153.0251 },
  { name: 'Auckland, New Zealand', latitude: -37.0882, longitude: 174.7765 },
  { name: 'Wellington, New Zealand', latitude: -41.2865, longitude: 174.7762 }
];

/**
 * Search local database for cities
 * Fast, offline, no rate limits
 *
 * @param {string} query - Search query (e.g., "Chennai", "New York, USA")
 * @returns {Array} Array of matching cities with coordinates
 */
function searchLocalCitiesDatabase(query) {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const searchTerm = query.toLowerCase().trim();

  return LOCAL_CITIES_DATABASE.filter(city => {
    const cityLower = city.name.toLowerCase();
    return cityLower.includes(searchTerm);
  }).slice(0, 5);  // Return top 5 matches
}
