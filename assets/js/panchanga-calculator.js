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

    this.initialized = false;
    this.astronomy = null;
  }

  log(...args) {
    console.log('[Panchanga]', ...args);
  }

  logError(...args) {
    console.error('[Panchanga Error]', ...args);
  }

  /**
   * Map longitude to IANA timezone names (for Intl API)
   * Covers major timezones globally
   */
  getTimezonesForLongitude(longitude) {
    // Normalized longitude to 0-360 range
    const lon = ((longitude + 180) % 360 + 360) % 360;

    // Map longitude ranges to IANA timezone identifiers
    // Format: [minLon, maxLon, [timezone names to test]]
    const timezoneMaps = [
      // Western US & Canada (UTC-8/-7)
      [-130, -100, ['America/Los_Angeles', 'America/Denver', 'America/Chicago']],
      // Eastern US & Canada (UTC-5/-4)
      [-85, -65, ['America/New_York', 'America/Toronto']],
      // UK & Western Europe (UTC+0/+1)
      [-10, 15, ['Europe/London', 'Europe/Paris', 'Europe/Berlin']],
      // Central Europe (UTC+1/+2)
      [10, 30, ['Europe/Warsaw', 'Europe/Istanbul']],
      // India (UTC+5:30, no DST)
      [70, 90, ['Asia/Kolkata']],
      // East Asia (UTC+8/+9)
      [100, 140, ['Asia/Shanghai', 'Asia/Tokyo', 'Asia/Hong_Kong']],
      // Australia (UTC+8-+10 with varying DST)
      [110, 160, ['Australia/Sydney', 'Australia/Perth', 'Australia/Melbourne']]
    ];

    for (const [minLon, maxLon, zones] of timezoneMaps) {
      if (lon >= minLon && lon <= maxLon) {
        return zones;
      }
    }

    // Fallback: return empty array, will use simple offset calculation
    return [];
  }

  /**
   * Calculate timezone offset in hours from longitude using Intl API for accurate DST detection
   * @param {number} longitude - Geographic longitude in degrees (negative = west)
   * @param {Date} date - Date to calculate offset for (DST varies by date)
   * @returns {number} Timezone offset in hours from UTC
   */
  getTimezoneOffsetFromLongitude(longitude, date = new Date()) {
    // Get likely timezones for this longitude
    const timezones = this.getTimezonesForLongitude(longitude);

    // Try to detect actual offset using Intl API
    if (timezones.length > 0) {
      try {
        for (const tz of timezones) {
          try {
            // Format the date in the target timezone to detect its offset
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

            // Calculate offset: (local_time_as_UTC - UTC_time) = offset in hours
            // Example: UTC=12:00, local=05:00 PDT (UTC-7) => offset = 05:00-12:00 = -7
            const offset = (tzDate - date) / (1000 * 60 * 60);

            // Check if offset makes sense (within ±14 hours)
            if (Math.abs(offset) <= 14) {
              this.log(`Using Intl API offset for ${tz}: ${offset} hours`);
              return offset;
            }
          } catch (e) {
            // This timezone name might not be supported, try next
            continue;
          }
        }
      } catch (e) {
        this.logError('Intl API timezone detection failed:', e);
      }
    }

    // Fallback: simple longitude-based calculation without DST
    this.log('Falling back to simple longitude-based offset calculation');
    return -longitude / 15;
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

    // Fallback: approximate sun longitude (moves ~0.9856° per day)
    this.log('Using fallback sun calculation');
    try {
      const j2000 = new Date(2000, 0, 1, 12, 0, 0);
      const daysSinceJ2000 = (date - j2000) / (1000 * 60 * 60 * 24);
      const approxSunLon = 280.46 + (0.9856474 * daysSinceJ2000);
      const ayanamsa = this.getDrikAyanamsa(date);
      const result = this.normalizeDegrees(approxSunLon - ayanamsa);
      this.log('Fallback sun longitude:', result);

      if (typeof result !== 'number' || isNaN(result)) {
        throw new Error('Fallback sun calculation produced invalid result: ' + result);
      }
      return result;
    } catch (e) {
      this.logError('CRITICAL: Even fallback sun calculation failed!', e);
      return 0; // Emergency fallback
    }
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

    // Fallback: approximate moon longitude (moves ~13° per day, with variation)
    this.log('Using fallback moon calculation');
    try {
      const j2000 = new Date(2000, 0, 1, 12, 0, 0);
      const daysSinceJ2000 = (date - j2000) / (1000 * 60 * 60 * 24);
      const moonMeanLon = 218.32 + (13.176358 * daysSinceJ2000);
      const ayanamsa = this.getDrikAyanamsa(date);
      const result = this.normalizeDegrees(moonMeanLon - ayanamsa);
      this.log('Fallback moon longitude:', result);
      if (typeof result !== 'number' || isNaN(result)) {
        throw new Error('Fallback moon calculation produced invalid result: ' + result);
      }
      return result;
    } catch (e) {
      this.logError('CRITICAL: Even fallback moon calculation failed!', e);
      return 0; // Emergency fallback
    }
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

    // Use Astronomy Engine for accurate sunrise calculation
    if (!this.astronomy || !this.astronomy.SearchRiseSet) {
      throw new Error('Astronomy Engine not available for sunrise calculation');
    }

    try {
      const observer = new this.astronomy.Observer(latitude, longitude, 0);
      this.log('Observer created:', observer);

      // Convert local date to UTC for search
      const tzOffset = this.getTimezoneOffsetFromLongitude(longitude, date);
      const utcDate = this.localToUTC(date, tzOffset);
      this.log('Timezone conversion:', { timezone_offset_hours: tzOffset, local_date: date, utc_date: utcDate });

      const time = this.astronomy.MakeTime(utcDate);
      this.log('Time object created for UTC:', time);

      // Search for sunrise: direction 1 = Rise
      this.log('Calling SearchRiseSet with:', { body: this.ASTRONOMY_SUN, direction: this.DIRECTION_RISE });
      const riseEvent = this.astronomy.SearchRiseSet(this.ASTRONOMY_SUN, observer, this.DIRECTION_RISE, time, 1);

      if (!riseEvent) {
        throw new Error('Could not calculate sunrise - check latitude/longitude and date');
      }

      this.log('Sunrise from Astronomy Engine:', {
        riseEvent: riseEvent,
        has_date: riseEvent && !!riseEvent.date,
        date_iso: riseEvent?.date?.toISOString?.()
      });

      const sunriseDate = new Date(riseEvent.date.toISOString());
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

    // Use Astronomy Engine for accurate sunset calculation
    if (!this.astronomy || !this.astronomy.SearchRiseSet) {
      throw new Error('Astronomy Engine not available for sunset calculation');
    }

    try {
      const observer = new this.astronomy.Observer(latitude, longitude, 0);
      this.log('Observer created:', observer);

      // Convert local date to UTC for search
      const tzOffset = this.getTimezoneOffsetFromLongitude(longitude, date);
      const utcDate = this.localToUTC(date, tzOffset);
      this.log('Timezone conversion:', { timezone_offset_hours: tzOffset, local_date: date, utc_date: utcDate });

      const time = this.astronomy.MakeTime(utcDate);
      this.log('Time object created for UTC:', time);

      // Search for sunset: direction -1 = Set
      this.log('Calling SearchRiseSet with:', { body: this.ASTRONOMY_SUN, direction: this.DIRECTION_SET });
      const setEvent = this.astronomy.SearchRiseSet(this.ASTRONOMY_SUN, observer, this.DIRECTION_SET, time, 1);

      if (!setEvent) {
        throw new Error('Could not calculate sunset - check latitude/longitude and date');
      }

      this.log('Sunset from Astronomy Engine:', {
        setEvent: setEvent,
        has_date: setEvent && !!setEvent.date,
        date_iso: setEvent?.date?.toISOString?.()
      });

      const sunsetDate = new Date(setEvent.date.toISOString());
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
    const norms = Math.abs((number - 1) % 30) + 1;

    const tithis = [
      { name: 'Pratipad', tamil: 'ப்ரதிபாத்' },
      { name: 'Dwitiya', tamil: 'த்விதீய' },
      { name: 'Tritiya', tamil: 'த்ருதீய' },
      { name: 'Chaturthi', tamil: 'சதுர்த்தி' },
      { name: 'Panchami', tamil: 'பஞ்சமி' },
      { name: 'Shashthi', tamil: 'ஷஷ்டி' },
      { name: 'Saptami', tamil: 'ஸப்தமி' },
      { name: 'Ashtami', tamil: 'அஷ்டமி' },
      { name: 'Navami', tamil: 'நவமி' },
      { name: 'Dasami', tamil: 'த³ஶமி' },
      { name: 'Ekadashi', tamil: 'ஏகாத³ஶி' },
      { name: 'Dwadashi', tamil: 'த்வாத³ஶி' },
      { name: 'Triyodashi', tamil: 'த்ரியோத³ஶி' },
      { name: 'Chaturdashi', tamil: 'சதுர்த்³த³ஶி' },
      { name: 'Poornima', tamil: 'பூர்ணிமா' }
    ];

    const phase = number <= 15 ? 'shukla' : 'krishna';
    const index = (norms - 1) % 15;
    const tithi = tithis[index];

    return {
      name: tithi.name,
      tamil: tithi.tamil,
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

    const nakshatras = [
      { name: 'Ashwini', tamil: 'அஶ்வினி', symbol: '♈', degree: '0-13.33' },
      { name: 'Bharani', tamil: 'பரணி', symbol: '♈', degree: '13.33-26.67' },
      { name: 'Kritika', tamil: 'க்ருத்திகா', symbol: '♉', degree: '26.67-40' },
      { name: 'Rohini', tamil: 'ரோஹிணி', symbol: '♉', degree: '40-53.33' },
      { name: 'Mrigashira', tamil: 'ம்ருக³ஶிரா', symbol: '♉', degree: '53.33-66.67' },
      { name: 'Ardra', tamil: 'அர்த்ரா', symbol: '♊', degree: '66.67-80' },
      { name: 'Punarvasu', tamil: 'புனர்வஸு', symbol: '♊', degree: '80-93.33' },
      { name: 'Pushya', tamil: 'புஷ்ய', symbol: '♋', degree: '93.33-106.67' },
      { name: 'Ashlesha', tamil: 'அஶ்லேஷா', symbol: '♋', degree: '106.67-120' },
      { name: 'Magha', tamil: 'ம³க³ா', symbol: '♌', degree: '120-133.33' },
      { name: 'Purva Phalguni', tamil: 'பூர்வ ப⁴ல்³குனி', symbol: '♌', degree: '133.33-146.67' },
      { name: 'Uttara Phalguni', tamil: 'உத्தர ப⁴ல्३குனी', symbol: '♌', degree: '146.67-160' },
      { name: 'Hasta', tamil: 'ஹஸ்த', symbol: '♍', degree: '160-173.33' },
      { name: 'Chitra', tamil: 'சித்ரா', symbol: '♍', degree: '173.33-186.67' },
      { name: 'Swati', tamil: 'ஸ்வாதி', symbol: '♎', degree: '186.67-200' },
      { name: 'Visakha', tamil: 'விஶாக', symbol: '♎', degree: '200-213.33' },
      { name: 'Anuradha', tamil: 'அனுரா³த', symbol: '♏', degree: '213.33-226.67' },
      { name: 'Jyeshtha', tamil: 'ஜ்யேஷ்ட', symbol: '♏', degree: '226.67-240' },
      { name: 'Mool', tamil: 'மூல', symbol: '♏', degree: '240-253.33' },
      { name: 'Purva Ashadha', tamil: 'பூர்வ அஷ³த', symbol: '♐', degree: '253.33-266.67' },
      { name: 'Uttara Ashadha', tamil: 'உத्तர अषढा', symbol: '♐', degree: '266.67-280' },
      { name: 'Sravana', tamil: 'ஶ்ரவணம்', symbol: '♑', degree: '280-293.33' },
      { name: 'Dhanishtha', tamil: 'த³னிष्ठ', symbol: '♑', degree: '293.33-306.67' },
      { name: 'Shatabhisha', tamil: 'ஶத⁴பி', symbol: '♒', degree: '306.67-320' },
      { name: 'Purva Bhadrapada', tamil: 'பூர்வ ப⁴த்³ரபாத', symbol: '♒', degree: '320-333.33' },
      { name: 'Uttara Bhadrapada', tamil: 'உத्तर ப⁴த्रपाद', symbol: '♓', degree: '333.33-346.67' },
      { name: 'Revati', tamil: 'ரேவதி', symbol: '♓', degree: '346.67-360' }
    ];

    return nakshatras[norm - 1];
  }

  /**
   * Get Yoga name
   * @param {number} number - 1-27
   * @returns {Object} {name: string, tamil: string}
   */
  getYogaName(number) {
    const norm = ((number - 1) % 27) + 1;

    const yogas = [
      { name: 'Vaidhriti', tamil: 'வைத்ரிதி' },
      { name: 'Vaidhriti', tamil: 'வைத்ரிதி' },
      { name: 'Vaidhriti', tamil: 'வைத்ரிதி' },
      { name: 'Vishkambha', tamil: 'விஷ்கம்ப' },
      { name: 'Priti', tamil: 'ப்ரீதி' },
      { name: 'Ayushman', tamil: 'ஆயுஷ்மான்' },
      { name: 'Saubhagya', tamil: 'ஸௌப⁴க்ய' },
      { name: 'Shobhana', tamil: 'ஶோப⁴ன' },
      { name: 'Atiganda', tamil: 'அதிக³ண்ட' },
      { name: 'Sukarma', tamil: 'ஸுக³ர්ம' },
      { name: 'Dhriti', tamil: 'த्ಥವ್ರೃತಿ' },
      { name: 'Shula', tamil: 'ஶூல' },
      { name: 'Ganda', tamil: 'கண்ட' },
      { name: 'Vriddhi', tamil: 'வ்ரூத்³தி' },
      { name: 'Dhruva', tamil: 'த्ಥರುವ' },
      { name: 'Vyagata', tamil: 'வ్్ర' },
      { name: 'Harshana', tamil: 'ஹர್ஷண' },
      { name: 'Vajra', tamil: 'வஜ்ஜ' },
      { name: 'Siddhi', tamil: 'ஸிദ్్ಧಿ' },
      { name: 'Vyatipata', tamil: 'வ್ར్్ತ்' },
      { name: 'Variyan', tamil: 'வरिया' },
      { name: 'Parigha', tamil: 'பरिघ' },
      { name: 'Shiva', tamil: 'ஶிவ' },
      { name: 'Siddha', tamil: 'ஸిद్థ' },
      { name: 'Sadhya', tamil: 'ஸा್ಧ್್ಯ' },
      { name: 'Shubha', tamil: 'ಶುಭ' },
      { name: 'Shukla', tamil: 'ಶುಕ್ಲ' }
    ];

    return yogas[norm - 1] || { name: 'Unknown', tamil: 'அஜ்ஞात' };
  }

  /**
   * Get Karana name
   * @param {number} number - 1-60
   * @returns {Object} {name: string, tamil: string}
   */
  getKaranaName(number) {
    const norm = ((number - 1) % 60) + 1;

    const karanas = [
      { name: 'Bava', tamil: 'பவ' },
      { name: 'Balava', tamil: 'బલవ' },
      { name: 'Kaulava', tamil: 'కౌలవ' },
      { name: 'Taitila', tamil: 'తైతిల' },
      { name: 'Gara', tamil: 'గర' },
      { name: 'Vanija', tamil: 'వనిజ' },
      { name: 'Vishti', tamil: 'విష్టి' },
      { name: 'Shakuni', tamil: 'శకుని' },
      { name: 'Chatushpada', tamil: 'చతుష్పద' },
      { name: 'Naga', tamil: 'నాగ' },
      { name: 'Kintamani', tamil: 'కింతమణి' },
      { name: 'Bava', tamil: 'బవ' } // Repeats
    ];

    const idx = ((norm - 1) % 12);
    return karanas[idx];
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

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PanchangaCalculator;
}
