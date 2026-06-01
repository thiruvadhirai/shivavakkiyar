/**
 * NOAA Solar Calculation Module
 *
 * Implements the NOAA standard for sunrise/sunset calculations with
 * atmospheric refraction correction based on Astronomical Algorithms
 * by Jean Meeus. Uses Temporal API for precise date/time handling.
 *
 * Reference: https://gml.noaa.gov/grad/solcalc/calcdetails.html
 *
 * Accuracy: ±1 minute for ±72° latitude, ±10 minutes outside
 *
 * Note: Uses Temporal API (immutable, nanosecond precision, timezone-aware)
 * Maintains backward compatibility with Date objects via conversion methods
 */
class NOAACalculator {
  constructor(astronomy = null) {
    // Reference to Astronomy Engine (passed in or use global)
    this.astronomy = astronomy || (typeof Astronomy !== 'undefined' ? Astronomy : null);

    // NOAA Standard atmospheric refraction for visible upper limb of sun
    // = 34 arcminutes (atmospheric refraction) + 16 arcminutes (solar disk radius)
    // = 50 arcminutes = 0.833 degrees
    this.STANDARD_REFRACTION_DEGREES = 0.833;

    // Constants for formulas
    this.SUN = 'Sun';
    this.DIRECTION_RISE = 1;
    this.DIRECTION_SET = -1;

    // Temporal API availability
    this.hasTemporalAPI = typeof globalThis.Temporal !== 'undefined';
  }

  /**
   * Convert Date to Temporal.Instant for calculations
   * Handles both Date objects and Temporal types gracefully
   * @param {Date|Temporal.Instant|Temporal.ZonedDateTime} dateInput - Date to convert
   * @returns {Temporal.Instant} Temporal instant in UTC
   */
  toTemporalInstant(dateInput) {
    if (!this.hasTemporalAPI) {
      throw new Error('Temporal API not available. Use temporal-polyfill or Node.js 18+');
    }

    if (dateInput instanceof Date) {
      // Convert Date to ISO string then to Temporal.Instant
      return Temporal.Instant.from(dateInput.toISOString());
    }

    if (dateInput instanceof Temporal.Instant) {
      return dateInput;
    }

    if (dateInput instanceof Temporal.ZonedDateTime) {
      return dateInput.toInstant();
    }

    // Try parsing as string
    return Temporal.Instant.from(dateInput);
  }

  /**
   * Convert Temporal.Instant back to Date for backward compatibility
   * @param {Temporal.Instant} instant - Temporal instant to convert
   * @returns {Date} JavaScript Date object
   */
  toDate(instant) {
    return new Date(instant.toJSON());
  }

  /**
   * Get current time as Temporal.Instant with timezone awareness
   * @param {string} timeZone - IANA timezone name (e.g., 'America/Los_Angeles')
   * @returns {Temporal.ZonedDateTime} Current time in specified timezone
   */
  getNowInTimezone(timeZone = 'UTC') {
    if (!this.hasTemporalAPI) {
      throw new Error('Temporal API not available');
    }
    return Temporal.Now.zonedDateTimeISO(timeZone);
  }

  /**
   * Calculate atmospheric refraction correction based on solar elevation angle
   * Implements NOAA methodology from Meeus, Astronomical Algorithms (2nd Ed.)
   *
   * The atmosphere bends light rays, making celestial objects appear higher
   * than their geometric position. The amount depends on elevation angle.
   *
   * @param {number} elevationDegrees - Solar elevation angle in degrees above horizon
   * @returns {number} Refraction correction in degrees (always positive)
   */
  getAtmosphericRefraction(elevationDegrees) {
    const h = elevationDegrees;

    // Case 1: High sun (85° to 90° elevation)
    // At zenith, refraction is essentially zero (rays are vertical)
    if (h >= 85) {
      return 0;
    }

    // Case 2: Normal sun (5° to 85° elevation)
    // Standard NOAA formula for visible sun above low horizon
    // Refraction = (1/3600) * ((58.1/tan(h)) - (0.07/tan³(h)) + (0.000086/tan⁵(h)))
    if (h >= 5) {
      const tanH = Math.tan((h * Math.PI) / 180);
      const refraction =
        58.1 / tanH -
        0.07 / Math.pow(tanH, 3) +
        0.000086 / Math.pow(tanH, 5);
      return refraction / 3600; // Convert arcseconds to degrees
    }

    // Case 3: Low sun (-0.575° to 5° elevation)
    // Polynomial approximation for near-horizon region where standard formula breaks down
    // Refraction = (1/3600) * (1735 - 518.2*h + 103.4*h² - 12.79*h³ + 0.711*h⁴)
    if (h >= -0.575) {
      const h2 = h * h;
      const h3 = h2 * h;
      const h4 = h3 * h;
      const refraction = 1735 - 518.2 * h + 103.4 * h2 - 12.79 * h3 + 0.711 * h4;
      return refraction / 3600; // Convert arcseconds to degrees
    }

    // Case 4: Very low sun (< -0.575° elevation)
    // Below visible horizon (twilight calculations)
    // Refraction = (1/3600) * (-20.774/tan(h))
    const tanH = Math.tan((h * Math.PI) / 180);
    return (-20.774 / tanH) / 3600; // Convert arcseconds to degrees
  }

  /**
   * Estimate solar elevation angle at sunrise/sunset
   * For sunrise/sunset with atmospheric refraction, the geometric sun disk
   * touches the horizon when elevation is approximately -0.833°
   *
   * @returns {number} Elevation angle in degrees for standard sunrise/sunset
   */
  getStandardSunriseSetElevation() {
    // Standard is -0.833° (geometric horizon is 0°, but we need -0.833° accounting for refraction)
    return -this.STANDARD_REFRACTION_DEGREES;
  }

  /**
   * Calculate time shift (in minutes) caused by atmospheric refraction
   * Estimates how many minutes earlier/later sunrise/sunset occurs compared to
   * geometric calculations
   *
   * @param {number} latitudeDegrees - Geographic latitude in degrees
   * @param {number} refractionDegrees - Refraction angle in degrees
   * @returns {number} Time shift in minutes (negative = earlier, positive = later)
   */
  calculateTimeShiftMinutes(latitudeDegrees, refractionDegrees) {
    // At the equator: 1° of sun angle change ≈ 4 minutes
    // At higher latitudes: decreases with cosine of latitude
    // At sunrise/sunset, the sun moves roughly along horizon
    // Rate = 15°/hour of local time = 0.25°/minute

    // Simple approximation: 1° ≈ 4 minutes (for mid-latitudes)
    // More accurate: 1° * cos(latitude) * 4 minutes

    const latRad = (latitudeDegrees * Math.PI) / 180;
    const minutesPerDegree = 4 * Math.cos(latRad);

    return refractionDegrees * minutesPerDegree;
  }

  /**
   * Get standard NOAA refraction value in arcminutes
   * This is the typical refraction used for sunrise/sunset
   *
   * @returns {number} Refraction in arcminutes (typically ~50.2 arcmin)
   */
  getStandardRefractionArcminutes() {
    return this.STANDARD_REFRACTION_DEGREES * 60; // Convert degrees to arcminutes
  }

  /**
   * Calculate sunrise/sunset with NOAA atmospheric refraction correction
   *
   * This method corrects Astronomy Engine results by applying NOAA standard
   * atmospheric refraction. The key insight: apparent sunrise/sunset occurs
   * when the sun is at -0.833° elevation (geometric -0° with +0.833° refraction)
   *
   * Supports both Date and Temporal inputs. Temporal provides:
   * - Immutability (prevents accidental modification)
   * - Nanosecond precision (beyond current millisecond needs)
   * - Explicit timezone handling
   *
   * @param {Date|Temporal.Instant|Temporal.ZonedDateTime} dateInput - Date for calculation
   * @param {number} latitude - Geographic latitude in degrees (N positive)
   * @param {number} longitude - Geographic longitude in degrees (E positive)
   * @param {boolean} isRise - true for sunrise, false for sunset
   * @returns {Promise<Object>} {date: Date, temporal: Instant, correction: minutes, elevation: degrees}
   */
  async calculateSunriseSetWithRefraction(dateInput, latitude, longitude, isRise) {
    if (!this.astronomy || !this.astronomy.SearchRiseSet) {
      throw new Error('Astronomy Engine not available - required for NOAA calculations');
    }

    try {
      // Convert input to both Date (for Astronomy Engine) and Temporal (for results)
      const date = dateInput instanceof Date ? dateInput : this.toDate(this.toTemporalInstant(dateInput));
      const temporalInstant = this.toTemporalInstant(dateInput);

      const observer = new this.astronomy.Observer(latitude, longitude, 0);

      // Calculate geometric sunrise/sunset (0° elevation)
      const time = this.astronomy.MakeTime(date);
      const direction = isRise ? this.DIRECTION_RISE : this.DIRECTION_SET;
      const event = this.astronomy.SearchRiseSet(this.SUN, observer, direction, time, 1);

      if (!event) {
        throw new Error(`Could not calculate ${isRise ? 'sunrise' : 'sunset'}`);
      }

      // Get geometric time
      const geometricDate = new Date(event.date);
      const geometricTemporal = this.toTemporalInstant(geometricDate);

      // Calculate solar elevation at this time for refraction lookup
      // For sunrise/sunset calculations, we use the standard NOAA refraction
      const refraction = this.getAtmosphericRefraction(this.getStandardSunriseSetElevation());

      // Estimate time correction in minutes
      // Positive refraction means sun appears higher, so sunrise is earlier (negative correction)
      // and sunset is later (positive correction)
      const timeShiftMinutes = this.calculateTimeShiftMinutes(latitude, refraction);
      const correctionMinutes = isRise ? -timeShiftMinutes : timeShiftMinutes;

      // Apply correction to get apparent time
      // Using Temporal for precise duration handling
      const correctionDuration = this.hasTemporalAPI
        ? Temporal.Duration.from({ minutes: correctionMinutes })
        : null;

      const apparentDate = new Date(geometricDate.getTime() + correctionMinutes * 60 * 1000);
      const apparentTemporal = this.hasTemporalAPI
        ? geometricTemporal.add(correctionDuration)
        : this.toTemporalInstant(apparentDate);

      return {
        // Backward compatible: Date objects
        date: apparentDate,
        geometricDate: geometricDate,

        // Temporal: immutable, precise, timezone-aware
        temporal: apparentTemporal,
        temporalGeometric: geometricTemporal,

        // Metadata
        correctionMinutes: correctionMinutes,
        refractionDegrees: refraction,
        refractionArcmin: refraction * 60,
        isRise: isRise,
        latitude: latitude,
        longitude: longitude
      };
    } catch (error) {
      throw new Error(
        `NOAA calculation failed for ${isRise ? 'sunrise' : 'sunset'}: ${error.message}`
      );
    }
  }

  /**
   * Calculate sunrise with NOAA refraction correction
   *
   * Accepts Date or Temporal input. Returns both Date and Temporal results.
   *
   * @param {Date|Temporal.Instant|Temporal.ZonedDateTime} dateInput - Date for calculation
   * @param {number} latitude - Geographic latitude in degrees
   * @param {number} longitude - Geographic longitude in degrees
   * @returns {Promise<Object>} Sunrise data with refraction correction
   */
  async getSunriseWithRefraction(dateInput, latitude, longitude) {
    return this.calculateSunriseSetWithRefraction(dateInput, latitude, longitude, true);
  }

  /**
   * Calculate sunset with NOAA refraction correction
   *
   * Accepts Date or Temporal input. Returns both Date and Temporal results.
   *
   * @param {Date|Temporal.Instant|Temporal.ZonedDateTime} dateInput - Date for calculation
   * @param {number} latitude - Geographic latitude in degrees
   * @param {number} longitude - Geographic longitude in degrees
   * @returns {Promise<Object>} Sunset data with refraction correction
   */
  async getSunsetWithRefraction(dateInput, latitude, longitude) {
    return this.calculateSunriseSetWithRefraction(dateInput, latitude, longitude, false);
  }

  /**
   * Get detailed refraction analysis for a given elevation
   * Useful for understanding refraction at different angles
   *
   * @param {number} elevationDegrees - Solar elevation in degrees
   * @returns {Object} Detailed refraction data
   */
  getRefractionAnalysis(elevationDegrees) {
    const h = elevationDegrees;
    const refraction = this.getAtmosphericRefraction(h);

    let formula = '';
    if (h >= 85) {
      formula = 'Case 1: High sun (h ≥ 85°) - No refraction';
    } else if (h >= 5) {
      formula = 'Case 2: Normal sun (5° ≤ h < 85°) - Standard NOAA formula';
    } else if (h >= -0.575) {
      formula = 'Case 3: Low sun (-0.575° ≤ h < 5°) - Polynomial formula';
    } else {
      formula = 'Case 4: Very low sun (h < -0.575°) - Twilight formula';
    }

    return {
      elevation: h,
      elevationDegrees: h,
      refraction: refraction,
      refractionDegrees: refraction,
      refractionArcmin: refraction * 60,
      refractionArcsec: refraction * 3600,
      formula: formula,
      description: `At ${h}° elevation, atmospheric refraction is ${(refraction * 60).toFixed(1)} arcminutes`
    };
  }

  /**
   * Format result as human-readable string
   *
   * @param {Object} result - Result from getSunriseWithRefraction or getSunsetWithRefraction
   * @returns {string} Formatted result
   */
  formatResult(result) {
    const timeStr = result.date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    const correction = result.correctionMinutes.toFixed(1);
    const refraction = result.refractionArcmin.toFixed(1);

    return (
      `${result.isRise ? 'Sunrise' : 'Sunset'}: ${timeStr} ` +
      `(correction: ${correction} min, refraction: ${refraction} arcmin)`
    );
  }
}

// Export for CommonJS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NOAACalculator;
}

// Export for ES modules (Jest testing)
if (typeof exports === 'object' && typeof window === 'undefined') {
  globalThis.NOAACalculator = NOAACalculator;
}
