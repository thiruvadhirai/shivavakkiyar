/**
 * Panchanga Calculator - Drik Ayanamsa System
 * Core astronomical and Hindu calendar calculations
 */

// ============================================================
// DRIK AYANAMSA CALCULATION
// ============================================================

function getDrikAyanamsa(date) {
  // Drik Ayanamsa for J2000 epoch (Jan 1, 2000, 12:00:00 TT)
  const J2000_AYANAMSA = 23.856389; // degrees
  const J2000_JD = 2451545.0;
  const PRECESSION_RATE = 0.01391; // degrees per year (approximate)

  const jd = getJulianDate(date);
  const yearsFromJ2000 = (jd - J2000_JD) / 365.25;

  return J2000_AYANAMSA + (PRECESSION_RATE * yearsFromJ2000);
}

// ============================================================
// JULIAN DATE CONVERSION
// ============================================================

function getJulianDate(date) {
  const d = new Date(date);
  const year = d.getUTCFullYear();
  const month = d.getUTCMonth() + 1;
  const day = d.getUTCDate();
  const hour = d.getUTCHours();
  const minute = d.getUTCMinutes();
  const second = d.getUTCSeconds();

  let a = Math.floor((14 - month) / 12);
  let y = year + 4800 - a;
  let m = month + 12 * a - 3;

  let jdn = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  let jd = jdn + (hour - 12) / 24 + minute / 1440 + second / 86400;

  return jd;
}

// ============================================================
// DEGREE NORMALIZATION
// ============================================================

function normalizeDegrees(degrees) {
  degrees = degrees % 360;
  if (degrees < 0) degrees += 360;
  return degrees;
}

// ============================================================
// APPROXIMATE ASTRONOMICAL CALCULATIONS
// ============================================================

function getSunLongitude(date, lat, lon) {
  // Approximate sun longitude using simple daily motion (~1° per day)
  const jd = getJulianDate(date);
  const J2000_JD = 2451545.0;

  // Sun at approximately 0° (Aries) on Jan 1, 2000 (vernal equinox)
  const SUN_JAN_1_2000 = 279.403; // degrees
  const DAILY_MOTION = 0.9856; // degrees per day

  const daysSinceJ2000 = jd - J2000_JD;
  let sunLon = SUN_JAN_1_2000 + (DAILY_MOTION * daysSinceJ2000);

  return normalizeDegrees(sunLon);
}

function getMoonLongitude(date, lat, lon) {
  // Approximate moon longitude using mean motion (~13° per day)
  const jd = getJulianDate(date);
  const J2000_JD = 2451545.0;

  // Moon at approximately 0° (Aries) on Jan 1, 2000
  const MOON_JAN_1_2000 = 318.351; // degrees
  const DAILY_MOTION = 13.1761; // degrees per day

  const daysSinceJ2000 = jd - J2000_JD;
  let moonLon = MOON_JAN_1_2000 + (DAILY_MOTION * daysSinceJ2000);

  return normalizeDegrees(moonLon);
}

function getSunrise(date, lat, lon) {
  // Approximate sunrise using declination formula
  // Returns hours (0-24) for given date and location
  const doy = getDayOfYear(date);

  // Solar declination approximation
  const declination = 23.44 * Math.sin((2 * Math.PI * (doy - 81)) / 365);
  const declinationRad = (declination * Math.PI) / 180;
  const latRad = (lat * Math.PI) / 180;

  // Hour angle at sunrise
  const cosH = -Math.tan(latRad) * Math.tan(declinationRad);

  if (cosH > 1) {
    // Sun never rises
    return null;
  } else if (cosH < -1) {
    // Sun never sets
    return null;
  }

  const H = Math.acos(cosH) * (180 / Math.PI);

  // Equation of time (simplified)
  const B = (360 / 365) * (doy - 81);
  const Brad = (B * Math.PI) / 180;
  const eot = 9.87 * Math.sin(2 * Brad) - 7.53 * Math.cos(Brad) - 1.5 * Math.sin(Brad);

  // Sunrise in UTC (in minutes, convert to hours)
  const sunrise = 12 - H / 15 - (lon / 15) - eot / 60;

  return sunrise < 0 ? sunrise + 24 : sunrise > 24 ? sunrise - 24 : sunrise;
}

function getSunset(date, lat, lon) {
  const doy = getDayOfYear(date);

  const declination = 23.44 * Math.sin((2 * Math.PI * (doy - 81)) / 365);
  const declinationRad = (declination * Math.PI) / 180;
  const latRad = (lat * Math.PI) / 180;

  const cosH = -Math.tan(latRad) * Math.tan(declinationRad);

  if (cosH > 1 || cosH < -1) {
    return null;
  }

  const H = Math.acos(cosH) * (180 / Math.PI);

  const B = (360 / 365) * (doy - 81);
  const Brad = (B * Math.PI) / 180;
  const eot = 9.87 * Math.sin(2 * Brad) - 7.53 * Math.cos(Brad) - 1.5 * Math.sin(Brad);

  const sunset = 12 + H / 15 - (lon / 15) - eot / 60;

  return sunset < 0 ? sunset + 24 : sunset > 24 ? sunset - 24 : sunset;
}

function getDayOfYear(date) {
  const d = new Date(date);
  const start = new Date(d.getUTCFullYear(), 0, 0);
  const diff = d - start;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

// ============================================================
// PANCHANGA CALCULATIONS
// ============================================================

function calculateTithi(sunLon, moonLon) {
  // Tithi = Moon angle - Sun angle (12° per tithi)
  // 30 tithis per lunar month
  let angle = normalizeDegrees(moonLon - sunLon);
  let tithiNum = Math.floor(angle / 12) + 1;
  let completion = (angle % 12) / 12 * 100;

  if (tithiNum > 30) tithiNum = 30;
  if (tithiNum < 1) tithiNum = 1;

  const phase = tithiNum <= 15 ? 'shukla' : 'krishna';
  const phaseNum = tithiNum <= 15 ? tithiNum : tithiNum - 15;

  return {
    num: tithiNum,
    phase: phase,
    phaseNum: phaseNum,
    name: getTithiName(phaseNum, phase),
    completion: Math.round(completion)
  };
}

function calculateNakshatra(moonLon) {
  // Nakshatra = Moon longitude / 13.33° (27 nakshatras)
  let nakshatraNum = Math.floor(normalizeDegrees(moonLon) / 13.333) + 1;
  if (nakshatraNum > 27) nakshatraNum = 27;
  if (nakshatraNum < 1) nakshatraNum = 1;

  const completion = ((normalizeDegrees(moonLon) % 13.333) / 13.333) * 100;

  return {
    num: nakshatraNum,
    name: getNakshatraName(nakshatraNum),
    completion: Math.round(completion)
  };
}

function calculateYoga(sunLon, moonLon) {
  // Yoga = (Sun + Moon longitude) / 13.33° (27 yogas)
  let combined = normalizeDegrees(sunLon + moonLon);
  let yogaNum = Math.floor(combined / 13.333) + 1;
  if (yogaNum > 27) yogaNum = 27;
  if (yogaNum < 1) yogaNum = 1;

  return {
    num: yogaNum,
    name: getYogaName(yogaNum)
  };
}

function calculateKarana(tithiNum) {
  // Karana = repeated twice per tithi (60 total, 27 unique names)
  const karanas = [
    'Bava', 'Balava', 'Kaulava', 'Taitila', 'Gara', 'Vanija', 'Vishti',
    'Shakuni', 'Chatushpada', 'Naga', 'Kintamani', 'Bava', 'Balava', 'Kaulava',
    'Taitila', 'Gara', 'Vanija', 'Vishti', 'Shakuni', 'Chatushpada', 'Naga',
    'Kintamani', 'Bava', 'Balava', 'Kaulava', 'Taitila', 'Gara'
  ];

  let karanaNum = (tithiNum * 2) % 60;
  if (karanaNum === 0) karanaNum = 60;

  let index = (karanaNum - 1) % karanas.length;

  return {
    num: karanaNum,
    name: karanas[index]
  };
}

function calculateHora(date, sunrise) {
  // Hora = planetary hours (24 hours divided into 2-hour blocks)
  if (!sunrise) return null;

  const d = new Date(date);
  const hours = d.getUTCHours() + d.getUTCMinutes() / 60;

  // Hours since sunrise
  const hoursSinceSunrise = hours - sunrise;
  let horaNum = Math.floor(hoursSinceSunrise / 1) + 1;

  if (horaNum < 1) horaNum = 1;
  if (horaNum > 24) horaNum = 24;

  return {
    num: horaNum,
    name: getHoraName(horaNum)
  };
}

function calculateRahuKalam(sunrise, sunset, date) {
  // Rahu Kalam = 90-minute inauspicious period varying by day of week
  if (!sunrise || !sunset) return null;

  const d = new Date(date);
  const dayOfWeek = d.getUTCDay(); // 0 = Sunday, 6 = Saturday

  // Duration of day in hours
  const dayDuration = sunset - sunrise;
  const hourDuration = dayDuration / 8; // Divide day into 8 equal parts

  // Rahu Kalam starts at different hours based on day of week
  const rahuStart = [
    8, // Sunday - 8th hora
    7, // Monday - 7th hora
    6, // Tuesday - 6th hora
    5, // Wednesday - 5th hora
    4, // Thursday - 4th hora
    3, // Friday - 3rd hora
    2  // Saturday - 2nd hora
  ];

  const startHora = rahuStart[dayOfWeek];
  const rahuStartTime = sunrise + (startHora - 1) * hourDuration;
  const rahuEndTime = rahuStartTime + hourDuration;

  return {
    startTime: rahuStartTime,
    endTime: rahuEndTime,
    startFormatted: formatTime(rahuStartTime),
    endFormatted: formatTime(rahuEndTime)
  };
}

function calculateAbhijitMuhurta(sunrise, sunset) {
  // Abhijit Muhurta = 48-minute auspicious period around noon
  if (!sunrise || !sunset) return null;

  const midday = (sunrise + sunset) / 2;
  const muhurtaDuration = 0.8; // 48 minutes in hours

  return {
    startTime: midday - muhurtaDuration / 2,
    endTime: midday + muhurtaDuration / 2,
    startFormatted: formatTime(midday - muhurtaDuration / 2),
    endFormatted: formatTime(midday + muhurtaDuration / 2)
  };
}

function findNextPradosha(date, lat, lon, maxSearch = 30) {
  // Find next 3 Pradosha dates (13th lunar day)
  // Pradosha occurs on both Shukla Triyodashi (tithi 13) and Krishna Triyodashi (tithi 28)
  const pradoshas = [];
  let currentDate = new Date(date);

  for (let i = 0; i < maxSearch && pradoshas.length < 3; i++) {
    const sunLon = getSunLongitude(currentDate, lat, lon);
    const moonLon = getMoonLongitude(currentDate, lat, lon);
    const tithi = calculateTithi(sunLon, moonLon);

    // Pradosha is on Triyodashi (13th tithi of light moon or dark moon)
    // Tithi 13 = Shukla Triyodashi (light moon 13th)
    // Tithi 28 = Krishna Triyodashi (dark moon 13th)
    if (tithi.num === 13 || tithi.num === 28) {
      const sunrise = getSunrise(currentDate, lat, lon);
      const sunset = getSunset(currentDate, lat, lon);

      pradoshas.push({
        date: new Date(currentDate),
        dateFormatted: formatDate(currentDate),
        tithi: tithi,
        sunrise: sunrise,
        sunset: sunset,
        pradoshaStart: sunset ? sunset - 1.5 : null,
        pradoshaEnd: sunset ? sunset + 1.5 : null
      });
    }

    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }

  return pradoshas;
}

// ============================================================
// FULL PANCHANGA CALCULATION
// ============================================================

function calculateFullPanchanga(dateStr, latitude, longitude) {
  const date = new Date(dateStr);
  const sunLon = getSunLongitude(date, latitude, longitude);
  const moonLon = getMoonLongitude(date, latitude, longitude);
  const sunrise = getSunrise(date, latitude, longitude);
  const sunset = getSunset(date, latitude, longitude);

  return {
    date: formatDate(date),
    ayanamsa: getDrikAyanamsa(date),
    tithi: calculateTithi(sunLon, moonLon),
    nakshatra: calculateNakshatra(moonLon),
    yoga: calculateYoga(sunLon, moonLon),
    karana: calculateKarana(calculateTithi(sunLon, moonLon).num),
    hora: calculateHora(date, sunrise),
    rahuKalam: calculateRahuKalam(sunrise, sunset, date),
    abhijitMuhurta: calculateAbhijitMuhurta(sunrise, sunset),
    sunrise: sunrise ? formatTime(sunrise) : null,
    sunset: sunset ? formatTime(sunset) : null,
    nextPradoshas: findNextPradosha(date, latitude, longitude, 60)
  };
}

// ============================================================
// NAME LOOKUPS
// ============================================================

const TITHI_NAMES = {
  shukla: ['', 'Pratipad', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi',
           'Saptami', 'Ashtami', 'Navami', 'Dashami', 'Ekadashi', 'Dwadashi', 'Triyodashi',
           'Chaturdashi', 'Purnima'],
  krishna: ['', 'Pratipad', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi',
            'Saptami', 'Ashtami', 'Navami', 'Dashami', 'Ekadashi', 'Dwadashi', 'Triyodashi',
            'Chaturdashi', 'Amavasya']
};

const NAKSHATRA_NAMES = [
  '', 'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu',
  'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra',
  'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha',
  'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
];

const YOGA_NAMES = [
  '', 'Vaidhriti', 'Vrihat', 'Shukla', 'Brahma', 'Indra', 'Vaidhriti', 'Vaidhriti',
  'Siddhi', 'Sadhya', 'Shubha', 'Shukla', 'Brahma', 'Indra', 'Vaidhriti', 'Pairs',
  'Vaidhriti', 'Vaidhriti', 'Siddhi', 'Sadhya', 'Shubha', 'Shukla', 'Brahma', 'Indra',
  'Vaidhriti', 'Vaidhriti', 'Vaidhriti'
];

const HORA_NAMES = [
  'Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars',
  'Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars',
  'Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars',
  'Sun', 'Venus', 'Mercury', 'Moon'
];

function getTithiName(num, phase) {
  return (TITHI_NAMES[phase] && TITHI_NAMES[phase][num]) || 'Unknown';
}

function getNakshatraName(num) {
  return NAKSHATRA_NAMES[num] || 'Unknown';
}

function getYogaName(num) {
  return YOGA_NAMES[num] || 'Unknown';
}

function getHoraName(num) {
  return HORA_NAMES[num - 1] || 'Unknown';
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

function formatTime(hours) {
  if (hours === null || hours === undefined) return 'N/A';

  let h = Math.floor(hours);
  let m = Math.round((hours - h) * 60);

  if (m === 60) {
    h += 1;
    m = 0;
  }

  h = h % 24;

  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function formatDate(date) {
  const d = new Date(date);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

// ============================================================
// EXPORTS
// ============================================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    calculateFullPanchanga,
    calculateTithi,
    calculateNakshatra,
    calculateYoga,
    calculateKarana,
    calculateHora,
    calculateRahuKalam,
    calculateAbhijitMuhurta,
    findNextPradosha,
    getDrikAyanamsa,
    getSunLongitude,
    getMoonLongitude,
    getSunrise,
    getSunset,
    getJulianDate,
    normalizeDegrees,
    getDayOfYear,
    formatTime,
    formatDate
  };
}
