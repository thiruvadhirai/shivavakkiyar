/**
 * Panchanga Calculator - Hindu Calendar Calculations
 * Uses Astronomy Engine for ephemeris data
 * Uses Drik Ayanamsa for accurate modern calculations
 */
class PanchangaCalculator {
  constructor() {
    // Drik Ayanamsa base value (at J2000 epoch: 2000-01-01 12:00 UTC)
    this.DRIK_AYANAMSA_2000 = 23.856389; // degrees
    this.J2000_DATE = new Date(2000, 0, 1, 12, 0, 0); // J2000 epoch

    // Astronomy Engine constants
    this.ASTRONOMY_SUN = 'Sun';
    this.DIRECTION_RISE = 1;
    this.DIRECTION_SET = -1;

    // NOAA standard atmospheric refraction (visible upper limb of sun)
    // = 34 arcminutes (atmospheric refraction) + 16 arcminutes (solar disk radius)
    this.STANDARD_REFRACTION = 0.833; // degrees

    this.initialized = false;
    this.astronomy = null;

    // Initialize NOAACalculator for refraction-corrected sunrise/sunset
    this.noaaCalculator = null;
  }

  /**
   * Initialize NOAA Calculator for refraction-corrected calculations
   * Must be called after Astronomy Engine is available
   */
  initializeNOAACalculator() {
    if (typeof NOAACalculator !== 'undefined') {
      this.noaaCalculator = new NOAACalculator(this.astronomy);
      this.log('NOAACalculator initialized for refraction-corrected times');
    } else {
      this.logError('NOAACalculator class not available');
    }
  }

  log(...args) {
    console.log('[Panchanga]', ...args);
  }

  logError(...args) {
    console.error('[Panchanga Error]', ...args);
  }

  /**
   * Detect if a date is in DST for a given longitude (US/common regions)
   */
  isDaylightSavingTime(date, longitude) {
    const month = date.getUTCMonth();
    const dayOfMonth = date.getUTCDate();
    const dayOfWeek = date.getUTCDay();

    // US DST: 2nd Sunday in March to 1st Sunday in November
    // Find 2nd Sunday in March
    let secondSundayMarch = 8;
    while (dayOfWeek !== 0 || dayOfMonth > 14) { // Find second Sunday
      if (dayOfMonth === 1) break; // Safety check
      secondSundayMarch++;
    }

    // Find 1st Sunday in November
    let firstSundayNov = 1;
    while (dayOfWeek !== 0) {
      if (dayOfMonth > 7) break; // Safety check
      firstSundayNov++;
    }

    // Approximate but effective: March-October (except first week of March and after first week of Nov)
    // More accurate: starts 2nd Sunday of March, ends 1st Sunday of November
    if (month > 2 && month < 10) return true;
    if (month === 2 && dayOfMonth >= 8) return true;  // After early March
    if (month === 10 && dayOfMonth <= 30) return true; // Through early November

    return false;
  }

  /**
   * Calculate timezone offset in hours from longitude using Intl API for accurate DST detection
   * @param {number} longitude - Geographic longitude in degrees (negative = west)
   * @param {Date} date - Date to calculate offset for (DST varies by date)
   * @returns {number} Timezone offset in hours from UTC
   */
  getTimezoneOffsetFromLongitude(longitude, date = new Date()) {
    // Map longitude to timezone for Intl API
    const timezoneMap = {
      // Western US & Canada
      '-122.9': 'America/Los_Angeles',  // Olympia, WA
      '-87.6': 'America/Chicago',
      '-74.0': 'America/New_York',
      // India
      '88.4': 'Asia/Kolkata',
      // East Asia
      '120.0': 'Asia/Shanghai',
      '139.7': 'Asia/Tokyo',
      // Australia
      '151.2': 'Australia/Sydney'
    };

    // Find closest timezone based on longitude
    let tz = null;
    let minDiff = Infinity;

    for (const [lon, timezone] of Object.entries(timezoneMap)) {
      const diff = Math.abs(parseFloat(lon) - longitude);
      if (diff < minDiff) {
        minDiff = diff;
        tz = timezone;
      }
    }

    // If no close match, use general timezone mapping
    if (!tz) {
      if (longitude >= -130 && longitude <= -100) tz = 'America/Los_Angeles';
      else if (longitude >= -100 && longitude <= -85) tz = 'America/Chicago';
      else if (longitude >= -85 && longitude <= -65) tz = 'America/New_York';
      else if (longitude >= 70 && longitude <= 90) tz = 'Asia/Kolkata';
      else if (longitude >= 100 && longitude <= 140) tz = 'Asia/Shanghai';
      else if (longitude >= 110 && longitude <= 160) tz = 'Australia/Sydney';
    }

    // Use Intl API to get exact offset for this date
    if (tz) {
      try {
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: tz,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        });

        const parts = formatter.formatToParts(date);
        const tzDate = new Date(Date.UTC(
          parseInt(parts.find(p => p.type === 'year').value),
          parseInt(parts.find(p => p.type === 'month').value) - 1,
          parseInt(parts.find(p => p.type === 'day').value),
          parseInt(parts.find(p => p.type === 'hour').value),
          parseInt(parts.find(p => p.type === 'minute').value),
          parseInt(parts.find(p => p.type === 'second').value)
        ));

        const offset = (tzDate - date) / (1000 * 60 * 60);

        if (Math.abs(offset) <= 14) {
          console.log(`[Timezone] ${tz}: offset=${offset}h for ${date.toISOString()}`);
          return offset;
        }
      } catch (e) {
        console.error(`[Timezone Error] Failed for ${tz}:`, e.message);
        throw new Error(`Timezone detection failed for timezone ${tz}: ${e.message}`);
      }
    }

    throw new Error(`No timezone found for longitude ${longitude}. Intl API failed.`);
  }

  /**
   * Convert local time to UTC given timezone offset
   * @param {Date} localDate - Date in local time
   * @param {number} timezoneOffset - Offset from UTC in hours
   * @returns {Date} Equivalent UTC date
   */
  localToUTC(localDate, timezoneOffset) {
    const utcDate = new Date(localDate);
    utcDate.setHours(utcDate.getHours() - timezoneOffset);
    return utcDate;
  }

  /**
   * Convert UTC time to local time given timezone offset
   * @param {Date} utcDate - Date in UTC
   * @param {number} timezoneOffset - Offset from UTC in hours
   * @returns {Date} Equivalent local date
   */
  utcToLocal(utcDate, timezoneOffset) {
    const localDate = new Date(utcDate);
    localDate.setHours(localDate.getHours() + timezoneOffset);
    return localDate;
  }

  /**
   * Initialize Astronomy Engine
   * Must be called before any calculations
   */
  async init() {
    if (this.initialized) return;

    try {
      if (typeof Astronomy === 'undefined') {
        throw new Error('Astronomy Engine not loaded. Include CDN script in page.');
      }
      this.astronomy = Astronomy;
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize Astronomy Engine:', error);
      throw error;
    }
  }

  /**
   * Calculate atmospheric refraction correction based on solar elevation angle
   * Based on NOAA Solar Calculation methodology (Meeus, Astronomical Algorithms)
   * @param {number} elevationDegrees - Solar elevation angle in degrees above horizon
   * @returns {number} Refraction correction in degrees
   */
  getAtmosphericRefraction(elevationDegrees) {
    const h = elevationDegrees;

    // Case 1: High sun (85° to 90°) - no refraction at zenith
    if (h >= 85) {
      return 0;
    }

    // Case 2: Normal sun (5° to 85°) - standard NOAA formula
    // Refraction = (1/3600) * ((58.1/tan(h)) - (0.07/tan³(h)) + (0.000086/tan⁵(h)))
    if (h >= 5) {
      const tanH = Math.tan((h * Math.PI) / 180);
      const refraction =
        58.1 / tanH -
        0.07 / Math.pow(tanH, 3) +
        0.000086 / Math.pow(tanH, 5);
      return refraction / 3600; // Convert arcseconds to degrees
    }

    // Case 3: Low sun (-0.575° to 5°) - polynomial formula near horizon
    // Refraction = (1/3600) * (1735 - 518.2*h + 103.4*h² - 12.79*h³ + 0.711*h⁴)
    if (h >= -0.575) {
      const refraction =
        1735 -
        518.2 * h +
        103.4 * h * h -
        12.79 * h * h * h +
        0.711 * h * h * h * h;
      return refraction / 3600; // Convert arcseconds to degrees
    }

    // Case 4: Very low sun (< -0.575°) - below horizon
    // Refraction = (1/3600) * (-20.774/tan(h))
    const tanH = Math.tan((h * Math.PI) / 180);
    return (-20.774 / tanH) / 3600; // Convert arcseconds to degrees
  }

  /**
   * Get Drik Ayanamsa for given date
   * Drik Ayanamsa more accurately reflects current Earth precession
   * @param {Date} date
   * @returns {number} Ayanamsa in degrees
   */
  getDrikAyanamsa(date) {
    // Calculate days since J2000 epoch
    const daysSinceJ2000 = (date - this.J2000_DATE) / (1000 * 60 * 60 * 24);

    // Drik precession rate: ~50.256 arcseconds per year = ~0.01391 degrees per year
    const precessionRate = 0.01391;
    const yearsSinceJ2000 = daysSinceJ2000 / 365.25;

    const ayanamsa = this.DRIK_AYANAMSA_2000 + (precessionRate * yearsSinceJ2000);

    return ayanamsa;
  }

  /**
   * Get Sun's ecliptic longitude (sidereal)
   * @param {Date} date
   * @param {number} latitude
   * @param {number} longitude
   * @returns {number} Longitude in degrees (0-360)
   */
  async getSunLongitude(date, latitude, longitude) {
    this.log('getSunLongitude called with date:', date, 'lat:', latitude, 'lon:', longitude);

    try {
      if (this.astronomy && this.astronomy.SunPosition) {
        this.log('Using Astronomy Engine SunPosition for sun longitude');
        const time = this.astronomy.MakeTime(date);
        this.log('MakeTime result:', time);

        const pos = this.astronomy.SunPosition(time);
        this.log('SunPosition returned:', pos);

        if (pos && pos.elon !== undefined) {
          const sunEcl = pos.elon;
          const ayanamsa = this.getDrikAyanamsa(date);
          const result = this.normalizeDegrees(sunEcl - ayanamsa);
          this.log('Sun longitude calculated via SunPosition:', result);
          if (typeof result !== 'number' || isNaN(result)) {
            throw new Error('Sun longitude result is not a valid number: ' + result);
          }
          return result;
        } else {
          console.warn('[Panchanga] SunPosition returned invalid position:', pos);
        }
      }
    } catch (e) {
      this.logError('SunPosition failed:', {
        message: e.message,
        name: e.name,
        stack: e.stack,
        fullError: e
      });
    }

    throw new Error('Astronomy Engine SunPosition failed. Cannot calculate sun longitude without accurate ephemeris data.');
  }

  /**
   * Get Moon's ecliptic longitude (sidereal)
   * @param {Date} date
   * @param {number} latitude
   * @param {number} longitude
   * @returns {number} Longitude in degrees (0-360)
   */
  async getMoonLongitude(date, latitude, longitude) {
    this.log('getMoonLongitude called with date:', date, 'lat:', latitude, 'lon:', longitude);

    try {
      if (this.astronomy && this.astronomy.EclipticGeoMoon) {
        this.log('Using Astronomy Engine EclipticGeoMoon for moon longitude');
        const moonEcliptic = this.astronomy.EclipticGeoMoon(date);
        this.log('EclipticGeoMoon returned:', moonEcliptic);

        // EclipticGeoMoon returns Spherical object with 'lon' property, not 'elon'
        if (moonEcliptic && moonEcliptic.lon !== undefined) {
          const moonEcl = moonEcliptic.lon;
          const ayanamsa = this.getDrikAyanamsa(date);
          const result = this.normalizeDegrees(moonEcl - ayanamsa);
          this.log('Moon longitude calculated via EclipticGeoMoon:', result);
          if (typeof result !== 'number' || isNaN(result)) {
            throw new Error('Moon longitude result is not a valid number: ' + result);
          }
          return result;
        } else {
          console.warn('[Panchanga] EclipticGeoMoon returned invalid position:', moonEcliptic);
        }
      }
    } catch (e) {
      this.logError('EclipticGeoMoon failed:', {
        message: e.message,
        name: e.name,
        stack: e.stack,
        fullError: e
      });
    }

    throw new Error('Astronomy Engine EclipticGeoMoon failed. Cannot calculate moon longitude without accurate ephemeris data.');
  }

  /**
   * Get sunrise time for location and date
   * @param {Date} date
   * @param {number} latitude
   * @param {number} longitude
   * @returns {Object} {date: Date, timeIST: string}
   */
  async getSunrise(date, latitude, longitude) {
    this.log('getSunrise called with lat:', latitude, 'lon:', longitude);

    try {
      // Use NOAACalculator for refraction-corrected sunrise
      if (!this.noaaCalculator) {
        this.initializeNOAACalculator();
      }

      if (!this.noaaCalculator) {
        throw new Error('NOAACalculator not available - cannot calculate refraction-corrected sunrise');
      }

      const result = await this.noaaCalculator.getSunriseWithRefraction(date, latitude, longitude);

      this.log('Sunrise from NOAACalculator (refraction-corrected):', {
        date: result.date.toISOString(),
        correctionMinutes: result.correctionMinutes,
        refractionDegrees: result.refractionDegrees
      });

      const sunriseDate = result.date;
      const istTime = this.convertToIST(sunriseDate, longitude);

      return {
        date: sunriseDate,
        timeIST: istTime,
        hours: sunriseDate.getHours(),
        minutes: sunriseDate.getMinutes()
      };
    } catch (e) {
      this.logError('getSunrise failed:', e.message, e);
      throw e;
    }
  }

  /**
   * Get sunset time for location and date
   * @param {Date} date
   * @param {number} latitude
   * @param {number} longitude
   * @returns {Object} {date: Date, timeIST: string}
   */
  async getSunset(date, latitude, longitude) {
    this.log('getSunset called with lat:', latitude, 'lon:', longitude);

    try {
      // Use NOAACalculator for refraction-corrected sunset
      if (!this.noaaCalculator) {
        this.initializeNOAACalculator();
      }

      if (!this.noaaCalculator) {
        throw new Error('NOAACalculator not available - cannot calculate refraction-corrected sunset');
      }

      const result = await this.noaaCalculator.getSunsetWithRefraction(date, latitude, longitude);

      this.log('Sunset from NOAACalculator (refraction-corrected):', {
        date: result.date.toISOString(),
        correctionMinutes: result.correctionMinutes,
        refractionDegrees: result.refractionDegrees
      });

      const sunsetDate = result.date;
      const istTime = this.convertToIST(sunsetDate, longitude);

      return {
        date: sunsetDate,
        timeIST: istTime,
        hours: sunsetDate.getHours(),
        minutes: sunsetDate.getMinutes()
      };
    } catch (e) {
      this.logError('getSunset failed:', e.message, e);
      throw e;
    }
  }

  /**
   * Calculate Tithi (lunar day)
   * Tithi is based on Moon-Sun angle: 0-12° = 1 Tithi, 12-24° = 2 Tithi, etc.
   * @param {number} sunLon - Sun's sidereal longitude
   * @param {number} moonLon - Moon's sidereal longitude
   * @returns {Object} {number: 1-30, name: string, percent: 0-100}
   */
  calculateTithi(sunLon, moonLon) {
    // Calculate angular distance (Moon - Sun)
    let angle = moonLon - sunLon;
    angle = this.normalizeDegrees(angle);

    // Each tithi is 12 degrees
    const tithiNumber = Math.floor(angle / 12) + 1;
    const tithiPercent = ((angle % 12) / 12) * 100;

    const tithiData = this.getTithiName(tithiNumber);

    return {
      number: tithiNumber,
      name: tithiData.name,
      tamil: tithiData.tamil,
      phase: tithiNumber <= 15 ? 'shukla' : 'krishna',
      percent: Math.round(tithiPercent),
      angle: angle
    };
  }

  /**
   * Calculate Nakshatra (lunar constellation)
   * @param {number} moonLon - Moon's sidereal longitude
   * @returns {Object} {number: 1-27, name: string, percent: 0-100}
   */
  calculateNakshatra(moonLon) {
    // Each nakshatra is 13.333 degrees (360/27)
    const nakshatraSize = 360 / 27;
    const nakshatraNumber = Math.floor(moonLon / nakshatraSize) + 1;
    const nakshatraPercent = ((moonLon % nakshatraSize) / nakshatraSize) * 100;

    const nakshatraData = this.getNakshatraName(nakshatraNumber);

    return {
      number: nakshatraNumber,
      name: nakshatraData.name,
      tamil: nakshatraData.tamil,
      percent: Math.round(nakshatraPercent),
      symbol: nakshatraData.symbol,
      degree: nakshatraData.degree
    };
  }

  /**
   * Calculate Yoga
   * Yoga = (Sun + Moon longitude) / 13.333, where 13.333 degrees = 1 yoga
   * @param {number} sunLon
   * @param {number} moonLon
   * @returns {Object} {number: 1-27, name: string}
   */
  calculateYoga(sunLon, moonLon) {
    const combined = sunLon + moonLon;
    const normalized = this.normalizeDegrees(combined);
    const yogaSize = 360 / 27;
    const yogaNumber = Math.floor(normalized / yogaSize) + 1;

    const yogaData = this.getYogaName(yogaNumber);

    return {
      number: yogaNumber,
      name: yogaData.name,
      tamil: yogaData.tamil
    };
  }

  /**
   * Calculate Karana (half-tithi)
   * @param {number} tithiNumber
   * @returns {Object} {number: 1-60, name: string}
   */
  calculateKarana(tithiNumber) {
    // Karana numbers cycle: 1-60 (60 karanas total)
    // Formula: for each tithi position, get first or second karana
    const karanaNumber = ((tithiNumber - 1) * 2) % 60 + 1;

    const karanaData = this.getKaranaName(karanaNumber);

    return {
      number: karanaNumber,
      name: karanaData.name,
      tamil: karanaData.tamil
    };
  }

  /**
   * Calculate Hora (hourly planetary division)
   * Each day is divided into 24 horas (1 hour each)
   * Planets rule in sequence: Sun, Venus, Mercury, Moon, Saturn, Jupiter, Mars
   * @param {Date} dateTime - Current date and time (UTC)
   * @param {Object} sunrise - Sunrise time object from getSunrise()
   * @returns {Object} {planet: string, number: 1-24}
   */
  calculateHora(dateTime, sunrise) {
    const planets = ['Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars'];

    // Calculate hours since sunrise
    // Use sunrise time as the base (start of day) if dateTime is midnight
    // Otherwise calculate from dateTime to determine current hora
    let baseTime = sunrise.date;

    // If dateTime appears to be midnight (for full panchanga calculation),
    // start from sunrise. Otherwise use dateTime.
    if (dateTime.getHours() === 0 && dateTime.getMinutes() === 0) {
      baseTime = sunrise.date;
    } else {
      baseTime = dateTime;
    }

    const hoursSinceSunrise = Math.abs((baseTime - sunrise.date) / (1000 * 60 * 60));
    const horaNumber = Math.floor(hoursSinceSunrise % 24) + 1;
    const planetIndex = (horaNumber - 1) % 7;

    return {
      planet: planets[planetIndex],
      number: horaNumber
    };
  }

  /**
   * Calculate Rahu Kalam (inauspicious time period)
   * Rahu Kalam is 1.5 hours, occurrence varies by day of week
   * @param {Object} sunrise - Sunrise time
   * @param {Object} sunset - Sunset time
   * @param {Date} date - Date
   * @returns {Object} {startTime: string, endTime: string, startHours: number}
   */
  calculateRahuKalam(sunrise, sunset, date) {
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday

    // Rahu Kalam duration in minutes
    const rahuDurationMinutes = 90; // 1.5 hours

    // Rahu Kalam start time varies by day of week (in units of 1/8 of day)
    // Sunday: 4/8, Monday: 7/8, Tuesday: 6/8, Wednesday: 4/8, Thursday: 5/8, Friday: 6/8, Saturday: 3/8
    const rahuStartFactors = [4, 7, 6, 4, 5, 6, 3]; // 0=Sunday

    const dayDurationMs = sunset.date - sunrise.date;
    const oneEighthDay = dayDurationMs / 8;
    const rahuStartFactor = rahuStartFactors[dayOfWeek];

    const rahuStartTime = new Date(sunrise.date.getTime() + (oneEighthDay * rahuStartFactor));
    const rahuEndTime = new Date(rahuStartTime.getTime() + rahuDurationMinutes * 60 * 1000);

    return {
      startTime: this.formatTime(rahuStartTime.getHours(), rahuStartTime.getMinutes()),
      endTime: this.formatTime(rahuEndTime.getHours(), rahuEndTime.getMinutes()),
      startDate: rahuStartTime,
      endDate: rahuEndTime,
      dayOfWeek: dayOfWeek
    };
  }

  /**
   * Calculate Abhijit Muhurta (most auspicious time)
   * Occurs around noon, varies by date and location
   * Typically 48 minutes duration during midday
   * @param {Object} sunrise
   * @param {Object} sunset
   * @returns {Object} {startTime: string, endTime: string}
   */
  calculateAbhijitMuhurta(sunrise, sunset) {
    try {
      if (!sunrise || !sunset) {
        throw new Error('Sunrise or sunset not provided to calculateAbhijitMuhurta');
      }
      if (!sunrise.date || !sunset.date) {
        throw new Error(`Invalid sunrise/sunset objects: sunrise=${JSON.stringify(sunrise)}, sunset=${JSON.stringify(sunset)}`);
      }

      const dayDurationMs = sunset.date - sunrise.date;
      const noonTime = new Date(sunrise.date.getTime() + dayDurationMs / 2);

      const abhijitDurationMinutes = 48;
      const abhijitStart = new Date(noonTime.getTime() - (abhijitDurationMinutes / 2) * 60 * 1000);
      const abhijitEnd = new Date(noonTime.getTime() + (abhijitDurationMinutes / 2) * 60 * 1000);

      return {
        startTime: this.formatTime(abhijitStart.getHours(), abhijitStart.getMinutes()),
        endTime: this.formatTime(abhijitEnd.getHours(), abhijitEnd.getMinutes()),
        startDate: abhijitStart,
        endDate: abhijitEnd
      };
    } catch (e) {
      this.logError('calculateAbhijitMuhurta failed:', e.message);
      throw e;
    }
  }

  /**
   * Find next Pradosha dates (Triyodashi - 13th lunar day)
   * Checks if startDate has Pradosha first, then searches for future ones
   * @param {Date} startDate - Date to check first, then search after for more Pradoshas
   * @param {number} latitude
   * @param {number} longitude
   * @param {number} maxSearch - Maximum days to search (default 60)
   * @returns {Promise<Array>} Array of {date: Date, tithi: Object, sunrise: Object, sunset: Object, rahuKalam: Object, isPradoshaToday: boolean}
   */
  async findNextPradosha(startDate, latitude, longitude, maxSearch = 60) {
    const pradoshaList = [];
    let searchDate = new Date(startDate);
    let daysSearched = 0;
    let isPradoshaToday = false;

    this.log('findNextPradosha: starting search from', startDate, 'looking for 3 Pradosha dates (Triyodashi at sunset)');

    while (pradoshaList.length < 3 && daysSearched < maxSearch) {
      // Get sunrise and sunset for the day
      const sunrise = await this.getSunrise(searchDate, latitude, longitude);
      const sunset = await this.getSunset(searchDate, latitude, longitude);

      // Calculate tithi at sunset time (not at midnight)
      // Pradosha is observed when sunset falls on Triyodashi
      const sunLonAtSunset = await this.getSunLongitude(sunset.date, latitude, longitude);
      const moonLonAtSunset = await this.getMoonLongitude(sunset.date, latitude, longitude);
      const tithiAtSunset = this.calculateTithi(sunLonAtSunset, moonLonAtSunset);

      this.log(`findNextPradosha: ${searchDate.toISOString()} - Tithi at sunset: ${tithiAtSunset.number} (${tithiAtSunset.name})`);

      // Check if sunset falls on Triyodashi (13th) - occurs in both Shukla and Krishna paksha
      // Shukla Triyodashi = tithi 13, Krishna Triyodashi = tithi 28
      if (tithiAtSunset.number === 13 || tithiAtSunset.number === 28) {
        const rahuKalam = this.calculateRahuKalam(sunrise, sunset, searchDate);

        this.log(`findNextPradosha: Found Pradosha on ${searchDate.toISOString()} (sunset at ${sunset.date.toISOString()})`);

        const pradoshaData = {
          date: new Date(searchDate),
          tithi: tithiAtSunset,
          sunrise: sunrise,
          sunset: sunset,
          rahuKalam: rahuKalam,
          // Pradosha time: 1.5 hours before and after sunset
          pradoshaStart: new Date(sunset.date.getTime() - 90 * 60 * 1000),
          pradoshaEnd: new Date(sunset.date.getTime() + 90 * 60 * 1000),
          isPradoshaToday: daysSearched === 0
        };

        pradoshaList.push(pradoshaData);

        // Mark if the first found Pradosha is on the startDate
        if (daysSearched === 0) {
          isPradoshaToday = true;
        }
      }

      // Move to next day
      searchDate.setDate(searchDate.getDate() + 1);
      daysSearched++;
    }

    this.log('findNextPradosha: Found', pradoshaList.length, 'Pradosha dates:', pradoshaList.map(p => p.date.toISOString()), 'isPradoshaToday:', isPradoshaToday);

    return pradoshaList;
  }

  /**
   * Calculate full panchanga for a date and location
   * @param {Date} date
   * @param {number} latitude
   * @param {number} longitude
   * @returns {Promise<Object>} Complete panchanga object
   */
  async calculateFullPanchanga(date, latitude, longitude) {
    const sunLon = await this.getSunLongitude(date, latitude, longitude);
    const moonLon = await this.getMoonLongitude(date, latitude, longitude);
    const sunrise = await this.getSunrise(date, latitude, longitude);
    let sunset = await this.getSunset(date, latitude, longitude);

    // Fix sunset date if it's on the wrong day (can happen with timezone conversions)
    // Sunset should always be after sunrise on the same local day
    if (sunset.date < sunrise.date) {
      this.log('Sunset date is before sunrise, adding 1 day to sunset');
      const correctedSunsetDate = new Date(sunset.date);
      correctedSunsetDate.setDate(correctedSunsetDate.getDate() + 1);
      sunset = {
        ...sunset,
        date: correctedSunsetDate,
        timeIST: this.convertToIST(correctedSunsetDate, longitude)
      };
    }

    const tithi = this.calculateTithi(sunLon, moonLon);
    const nakshatra = this.calculateNakshatra(moonLon);
    const yoga = this.calculateYoga(sunLon, moonLon);
    const karana = this.calculateKarana(tithi.number);
    const hora = this.calculateHora(date, sunrise);
    const rahuKalam = this.calculateRahuKalam(sunrise, sunset, date);
    const abhijitMuhurta = this.calculateAbhijitMuhurta(sunrise, sunset);

    const result = {
      date: date,
      location: {
        latitude: latitude,
        longitude: longitude
      },
      ayanamsa: this.getDrikAyanamsa(date),
      celestial: {
        sunLongitude: sunLon,
        moonLongitude: moonLon
      },
      panchanga: {
        tithi: tithi,
        nakshatra: nakshatra,
        yoga: yoga,
        karana: karana,
        hora: hora
      },
      times: {
        sunrise: sunrise,
        sunset: sunset,
        rahuKalam: rahuKalam,
        abhijitMuhurta: abhijitMuhurta
      }
    };

    this.log('calculateFullPanchanga result structure:', {
      panchanga_keys: Object.keys(result.panchanga),
      times_keys: Object.keys(result.times),
      times_sunrise: result.times.sunrise,
      times_sunset: result.times.sunset,
      times_rahuKalam: result.times.rahuKalam,
      times_abhijitMuhurta: result.times.abhijitMuhurta,
      panchanga_hora: result.panchanga.hora
    });

    return result;
  }

  // ==================== NAME & DATA LOOKUPS ====================

  /**
   * Get Tithi name
   * @param {number} number - 1-30
   * @returns {Object} {name: string, tamil: string, phase: 'shukla'|'krishna'}
   */
  getTithiName(number) {
    const norm = Math.abs((number - 1) % 30) + 1;
    const phase = number <= 15 ? 'shukla' : 'krishna';

    // Use PanchangaLanguages for correct Tamil unicode
    const langData = PanchangaLanguages.TITHI[norm] || { name: `Tithi ${norm}`, tamil: '' };

    return {
      name: langData.name,
      tamil: langData.tamil,
      phase: phase,
      number: number
    };
  }

  /**
   * Get Nakshatra (star) name
   * @param {number} number - 1-27
   * @returns {Object} {name: string, tamil: string, symbol: string, degree: string}
   */
  getNakshatraName(number) {
    const norm = ((number - 1) % 27) + 1;
    const langData = PanchangaLanguages.NAKSHATRA[norm] || { name: `Nakshatra ${norm}`, tamil: '' };
    return { name: langData.name, tamil: langData.tamil };
  }

  /**
   * Get Yoga name
   * @param {number} number - 1-27
   * @returns {Object} {name: string, tamil: string}
   */
  getYogaName(number) {
    const norm = ((number - 1) % 27) + 1;
    const langData = PanchangaLanguages.YOGA[norm] || { name: `Yoga ${norm}`, tamil: '' };
    return { name: langData.name, tamil: langData.tamil };
  }

  /**
   * Get Karana name
   * @param {number} number - 1-60
   * @returns {Object} {name: string, tamil: string}
   */
  getKaranaName(number) {
    const norm = ((number - 1) % 60) + 1;
    const langData = PanchangaLanguages.KARANA[norm] || { name: `Karana ${norm}`, tamil: '' };
    return { name: langData.name, tamil: langData.tamil };
  }

  // ==================== UTILITY FUNCTIONS ====================

  /**
   * Normalize degrees to 0-360 range
   * @param {number} degrees
   * @returns {number}
   */
  /**
   * Get day of year (1-366)
   */
  getDayOfYear(date) {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date - start;
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  }

  /**
   * Get Julian Date number
   */
  getJulianDate(date) {
    const a = Math.floor((14 - (date.getMonth() + 1)) / 12);
    const y = date.getFullYear() + 4800 - a;
    const m = (date.getMonth() + 1) + 12 * a - 3;
    return date.getDate() + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  }

  normalizeDegrees(degrees) {
    return ((degrees % 360) + 360) % 360;
  }

  /**
   * Convert UTC date to local time based on longitude
   * @param {Date} date - UTC date
   * @param {number} longitude - Geographic longitude to determine timezone
   * @returns {string} Formatted time string HH:MM (local time)
   */
  convertToIST(date, longitude) {
    // Get local timezone offset from longitude (accounting for DST on this date)
    const tzOffset = this.getTimezoneOffsetFromLongitude(longitude, date);

    // Convert UTC to local time
    const localDate = new Date(date.getTime() + (tzOffset * 60 * 60 * 1000));
    const hours = String(localDate.getUTCHours()).padStart(2, '0');
    const minutes = String(localDate.getUTCMinutes()).padStart(2, '0');

    return `${hours}:${minutes}`;
  }

  /**
   * Format time as HH:MM
   * @param {number} hours
   * @param {number} minutes
   * @returns {string}
   */
  formatTime(hours, minutes) {
    const h = String(hours).padStart(2, '0');
    const m = String(minutes).padStart(2, '0');
    return `${h}:${m}`;
  }

  /**
   * Format date as YYYY-MM-DD
   * @param {Date} date
   * @returns {string}
   */
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

// Export for use in other scripts (CommonJS)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PanchangaCalculator;
}

// Export for ES modules (Jest testing)
if (typeof exports === 'object' && typeof window === 'undefined') {
  globalThis.PanchangaCalculator = PanchangaCalculator;
}
