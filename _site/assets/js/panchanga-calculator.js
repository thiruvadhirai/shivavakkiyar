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

    this.initialized = false;
    this.astronomy = null;
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
    try {
      // Use SearchSunLongitude to find sun's longitude
      if (this.astronomy && this.astronomy.SearchSunLongitude) {
        const search = this.astronomy.SearchSunLongitude(0);
        const sunEvent = search.nextEvent(date);

        if (sunEvent && sunEvent.lon !== undefined) {
          const sunEcl = sunEvent.lon;
          const ayanamsa = this.getDrikAyanamsa(date);
          return this.normalizeDegrees(sunEcl - ayanamsa);
        }
      }
    } catch (e) {
      console.log('SearchSunLongitude failed, using fallback:', e.message);
    }

    // Fallback: approximate sun longitude (moves ~0.9856° per day)
    const j2000 = new Date(2000, 0, 1, 12, 0, 0);
    const daysSinceJ2000 = (date - j2000) / (1000 * 60 * 60 * 24);
    const approxSunLon = 280.46 + (0.9856474 * daysSinceJ2000);
    const ayanamsa = this.getDrikAyanamsa(date);

    return this.normalizeDegrees(approxSunLon - ayanamsa);
  }

  /**
   * Get Moon's ecliptic longitude (sidereal)
   * @param {Date} date
   * @param {number} latitude
   * @param {number} longitude
   * @returns {number} Longitude in degrees (0-360)
   */
  async getMoonLongitude(date, latitude, longitude) {
    try {
      // Use Equator to get moon position then convert to ecliptic
      const observer = new this.astronomy.Observer(latitude, longitude, 0);
      const moonEq = this.astronomy.Equator('MOON', date, observer, true, true);

      // Convert equatorial to ecliptic (approximate)
      const eclipticObliquity = 23.439291; // degrees
      const lat = moonEq.dec;
      const lon = moonEq.ra * 15; // Convert RA from hours to degrees

      const cosObliq = Math.cos(eclipticObliquity * Math.PI / 180);
      const sinObliq = Math.sin(eclipticObliquity * Math.PI / 180);
      const tanLat = Math.tan(lat * Math.PI / 180);

      const moonEcl = Math.atan2(
        Math.sin(lon * Math.PI / 180) * cosObliq - tanLat * sinObliq,
        Math.cos(lon * Math.PI / 180)
      ) * 180 / Math.PI;

      const ayanamsa = this.getDrikAyanamsa(date);
      return this.normalizeDegrees(moonEcl - ayanamsa);
    } catch (e) {
      console.log('Moon calculation failed, using fallback:', e.message);
      // Fallback: approximate moon longitude (moves ~13° per day, with variation)
      const j2000 = new Date(2000, 0, 1, 12, 0, 0);
      const daysSinceJ2000 = (date - j2000) / (1000 * 60 * 60 * 24);
      const moonMeanLon = 218.32 + (13.176358 * daysSinceJ2000);
      const ayanamsa = this.getDrikAyanamsa(date);
      return this.normalizeDegrees(moonMeanLon - ayanamsa);
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
    // Simple sunrise calculation using sunrise formula
    const J2000 = 2451545.0;
    const jd = this.getJulianDate(date);
    const dayOfYear = this.getDayOfYear(date);

    // Sunrise hour (approximate, valid for ±60° latitude)
    const n = dayOfYear + ((6 - longitude / 15) / 24);
    const J = n + 0.0172 * Math.sin(0.2163108 + 2 * Math.atan(0.9671574 * Math.tan(0.00860 * (dayOfYear - 186))));

    const sunriseHours = 6.0 - Math.acos(-Math.tan(latitude * Math.PI / 180) * Math.tan(23.44 * Math.PI / 180 * Math.sin(2 * Math.PI * (dayOfYear - 1) / 365.25))) / Math.PI * 12;

    const sunriseDate = new Date(date);
    sunriseDate.setUTCHours(Math.floor(sunriseHours), Math.round((sunriseHours % 1) * 60), 0, 0);

    const istTime = this.convertToIST(sunriseDate, longitude);
    return {
      date: sunriseDate,
      timeIST: istTime,
      hours: sunriseDate.getHours(),
      minutes: sunriseDate.getMinutes()
    };
  }

  /**
   * Get sunset time for location and date
   * @param {Date} date
   * @param {number} latitude
   * @param {number} longitude
   * @returns {Object} {date: Date, timeIST: string}
   */
  async getSunset(date, latitude, longitude) {
    // Simple sunset calculation (approximate)
    const dayOfYear = this.getDayOfYear(date);

    const sunsetHours = 18.0 + Math.acos(-Math.tan(latitude * Math.PI / 180) * Math.tan(23.44 * Math.PI / 180 * Math.sin(2 * Math.PI * (dayOfYear - 1) / 365.25))) / Math.PI * 12;

    const sunsetDate = new Date(date);
    sunsetDate.setUTCHours(Math.floor(sunsetHours), Math.round((sunsetHours % 1) * 60), 0, 0);

    const istTime = this.convertToIST(sunsetDate, longitude);
    return {
      date: sunsetDate,
      timeIST: istTime,
      hours: sunsetDate.getHours(),
      minutes: sunsetDate.getMinutes()
    };
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

    const tithiName = this.getTithiName(tithiNumber);

    return {
      number: tithiNumber,
      name: tithiName,
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
    const hoursSinceSunrise = (dateTime - sunrise.date) / (1000 * 60 * 60);
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
    // Abhijit is approximately at noon, 48 minutes duration
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
  }

  /**
   * Find next Pradosha dates (Triyodashi - 13th lunar day)
   * Returns array of next 3 Pradosha occurrences
   * @param {Date} startDate
   * @param {number} latitude
   * @param {number} longitude
   * @param {number} maxSearch - Maximum days to search (default 60)
   * @returns {Promise<Array>} Array of {date: Date, tithi: Object, sunrise: Object, sunset: Object, rahuKalam: Object}
   */
  async findNextPradosha(startDate, latitude, longitude, maxSearch = 60) {
    const pradoshaList = [];
    let searchDate = new Date(startDate);
    let daysSearched = 0;

    while (pradoshaList.length < 3 && daysSearched < maxSearch) {
      const sunLon = await this.getSunLongitude(searchDate, latitude, longitude);
      const moonLon = await this.getMoonLongitude(searchDate, latitude, longitude);
      const tithi = this.calculateTithi(sunLon, moonLon);

      // Check if this is Triyodashi (13th)
      if (tithi.number === 13) {
        const sunrise = await this.getSunrise(searchDate, latitude, longitude);
        const sunset = await this.getSunset(searchDate, latitude, longitude);
        const rahuKalam = this.calculateRahuKalam(sunrise, sunset, searchDate);

        pradoshaList.push({
          date: new Date(searchDate),
          tithi: tithi,
          sunrise: sunrise,
          sunset: sunset,
          rahuKalam: rahuKalam,
          // Pradosha time: 1.5 hours before and after sunset
          pradoshaStart: new Date(sunset.date.getTime() - 90 * 60 * 1000),
          pradoshaEnd: new Date(sunset.date.getTime() + 90 * 60 * 1000)
        });
      }

      // Move to next day
      searchDate.setDate(searchDate.getDate() + 1);
      daysSearched++;
    }

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
    const sunset = await this.getSunset(date, latitude, longitude);

    const tithi = this.calculateTithi(sunLon, moonLon);
    const nakshatra = this.calculateNakshatra(moonLon);
    const yoga = this.calculateYoga(sunLon, moonLon);
    const karana = this.calculateKarana(tithi.number);
    const hora = this.calculateHora(date, sunrise);
    const rahuKalam = this.calculateRahuKalam(sunrise, sunset, date);
    const abhijitMuhurta = this.calculateAbhijitMuhurta(sunrise, sunset);

    return {
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
   * Convert UTC date to IST (Indian Standard Time)
   * @param {Date} date - UTC date
   * @param {number} longitude - For reference (IST is UTC+5:30)
   * @returns {string} Formatted time string HH:MM IST
   */
  convertToIST(date, longitude) {
    // IST is UTC+5:30
    const istDate = new Date(date.getTime() + (5.5 * 60 * 60 * 1000));
    const hours = String(istDate.getUTCHours()).padStart(2, '0');
    const minutes = String(istDate.getUTCMinutes()).padStart(2, '0');
    return `${hours}:${minutes} IST`;
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
