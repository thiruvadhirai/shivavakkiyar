/**
 * Panchanga Calculator - Language Support
 *
 * Provides multi-language support for panchanga items:
 * - English (canonical names)
 * - Tamil (தமிழ் transliterations)
 * - Future: Kannada, Telugu, Malayalam
 */

class PanchangaLanguages {
  /**
   * Tithi names (Lunar Days) - 30 items
   * Tamil: தமிழ்
   */
  static TITHI = {
    1: { name: 'Pratipad', tamil: 'பிரதமை' },
    2: { name: 'Dwitiya', tamil: 'துதியை' },
    3: { name: 'Tritiya', tamil: 'திருதியை' },
    4: { name: 'Chaturthi', tamil: 'சதுர்த்தி' },
    5: { name: 'Panchami', tamil: 'பஞ்சமி' },
    6: { name: 'Shashthi', tamil: 'ஷஷ்டி' },
    7: { name: 'Saptami', tamil: 'சப்தமி' },
    8: { name: 'Ashtami', tamil: 'அஷ்டமி' },
    9: { name: 'Navami', tamil: 'நவமி' },
    10: { name: 'Dasami', tamil: 'தசமி' },
    11: { name: 'Ekadashi', tamil: 'எகாதசி' },
    12: { name: 'Dwadashi', tamil: 'துவாதசி' },
    13: { name: 'Trayodashi', tamil: 'திரயோதசி' },
    14: { name: 'Chaturdashi', tamil: 'சதுர்த்தசி' },
    15: { name: 'Purnima', tamil: 'பௌர்ணமி' },
    16: { name: 'Pratipad', tamil: 'பிரதமை' },
    17: { name: 'Dwitiya', tamil: 'துதியை' },
    18: { name: 'Tritiya', tamil: 'திருதியை' },
    19: { name: 'Chaturthi', tamil: 'சதுர்த்தி' },
    20: { name: 'Panchami', tamil: 'பஞ்சமி' },
    21: { name: 'Shashthi', tamil: 'ஷஷ்டி' },
    22: { name: 'Saptami', tamil: 'சப்தமி' },
    23: { name: 'Ashtami', tamil: 'அஷ்டமி' },
    24: { name: 'Navami', tamil: 'நவமி' },
    25: { name: 'Dasami', tamil: 'தசமி' },
    26: { name: 'Ekadashi', tamil: 'எகாதசி' },
    27: { name: 'Dwadashi', tamil: 'துவாதசி' },
    28: { name: 'Trayodashi', tamil: 'திரயோதசி' },
    29: { name: 'Chaturdashi', tamil: 'சதுர்த்தசி' },
    30: { name: 'Amavasya', tamil: 'அமாவாசை' },
  };

  /**
   * Nakshatra names (Lunar Mansions) - 27 items
   * Reference: test-results/starnames.md with proper Tamil unicode encoding
   */
  static NAKSHATRA = {
    1: { name: 'Ashwini', tamil: 'அஸ்வினி' },
    2: { name: 'Bharani', tamil: 'பரணி' },
    3: { name: 'Krittika', tamil: 'கார்த்திகை' },
    4: { name: 'Rohini', tamil: 'ரோஹிணி' },
    5: { name: 'Mrigasira', tamil: 'மிருகசீர்ஷம்' },
    6: { name: 'Ardra', tamil: 'திரு ஆதிரை' },
    7: { name: 'Punarvasu', tamil: 'புனர் பூசம்' },
    8: { name: 'Pushyami', tamil: 'பூசம்' },
    9: { name: 'Aslesha', tamil: 'ஆயில்யம்' },
    10: { name: 'Magha', tamil: 'மகம்' },
    11: { name: 'Purva Phalguni', tamil: 'பூரம்' },
    12: { name: 'Uttara Phalguni', tamil: 'உத்தரம்' },
    13: { name: 'Hasta', tamil: 'ஹஸ்தம்' },
    14: { name: 'Chitra', tamil: 'சித்திரை' },
    15: { name: 'Swati', tamil: 'ஸ்வாதி' },
    16: { name: 'Vishakha', tamil: 'விசாகம்' },
    17: { name: 'Anuradha', tamil: 'அனுஷம்' },
    18: { name: 'Jyeshtha', tamil: 'கேட்டை' },
    19: { name: 'Mula', tamil: 'மூலம்' },
    20: { name: 'Purva Ashadha', tamil: 'பூராடம்' },
    21: { name: 'Uttara Ashadha', tamil: 'உத்திராடம்' },
    22: { name: 'Sravana', tamil: 'திரு ஓணம்' },
    23: { name: 'Dhanishtha', tamil: 'அவிட்டம்' },
    24: { name: 'Shatabhisha', tamil: 'சதயம்' },
    25: { name: 'Purva Bhadrapada', tamil: 'பூரட்டாதி' },
    26: { name: 'Uttara Bhadrapada', tamil: 'உத்திரட்டாதி' },
    27: { name: 'Revati', tamil: 'ரேவதி' },
  };

  /**
   * Yoga names (Auspicious Combinations) - 27 items
   * Reference: Corrected Sanskrit names with proper mapping
   */
  static YOGA = {
    1: { name: 'Vishakumbha', tamil: 'விஷ்கம்பம்' },
    2: { name: 'Preeti', tamil: 'ப்ரீதி' },
    3: { name: 'Aayushman', tamil: 'ஆயுஷ்மான்' },
    4: { name: 'Saubhagya', tamil: 'சவுபாக்கியம்' },
    5: { name: 'Shobhana', tamil: 'சோபனம்' },
    6: { name: 'Atiganda', tamil: 'அதிகண்டம்' },
    7: { name: 'Sukarma', tamil: 'சுகர்மம்' },
    8: { name: 'Dhriti', tamil: 'திருதி' },
    9: { name: 'Shoola', tamil: 'சூலம்' },
    10: { name: 'Ganda', tamil: 'கண்டம்' },
    11: { name: 'Vriddhi', tamil: 'விருத்தி' },
    12: { name: 'Dhruva', tamil: 'துருவம்' },
    13: { name: 'Vyaghaata', tamil: 'வியாகதம்' },
    14: { name: 'Harshana', tamil: 'ஹர்ஷனம்' },
    15: { name: 'Vajra', tamil: 'வச்சிரம்' },
    16: { name: 'Siddhi', tamil: 'சித்தி' },
    17: { name: 'Vyatipaata', tamil: 'வியதீபாதம்' },
    18: { name: 'Variyaana', tamil: 'வரியான்' },
    19: { name: 'Parigha', tamil: 'பரிகம்' },
    20: { name: 'Shiva', tamil: 'சிவம்' },
    21: { name: 'Siddha', tamil: 'சித்தர்' },
    22: { name: 'Saaddhya', tamil: 'சாத்தியம்' },
    23: { name: 'Shubha', tamil: 'சுபம்' },
    24: { name: 'Shukla', tamil: 'சுக்கிலம்' },
    25: { name: 'Brahma', tamil: 'பிரம்மம்' },
    26: { name: 'Indra', tamil: 'இந்திரம்' },
    27: { name: 'Vaidhriti', tamil: 'வைதிருதி' },
  };

  /**
   * Karana names (Half-Tithis) - 60 items (12 unique, repeating)
   * Reference: Tamil Wikipedia - கரணம் (சோதிடம்)
   * https://ta.wikipedia.org/wiki/%E0%AE%95%E0%AE%B0%E0%AE%A3%E0%AE%AE%E0%AF%8D_(%E0%AE%9A%E0%AF%8B%E0%AE%A4%E0%AE%BF%E0%AE%9F%E0%AE%AE%E0%AF%8D)
   */
  static KARANA = {
    1: { name: 'Bava', tamil: 'பவ கரணம்' },
    2: { name: 'Balava', tamil: 'பாலவ கரணம்' },
    3: { name: 'Kaulava', tamil: 'கௌலவ கரணம்' },
    4: { name: 'Taitila', tamil: 'தைதுலை கரணம்' },
    5: { name: 'Gara', tamil: 'கரசை கரணம்' },
    6: { name: 'Vanija', tamil: 'வன்னிசை கரணம்' },
    7: { name: 'Vishti', tamil: 'விஷ்டி கரணம்' },
    8: { name: 'Shakuni', tamil: 'சகுனி கரணம்' },
    9: { name: 'Chatushpada', tamil: 'சதுஷ்பத கரணம்' },
    10: { name: 'Naga', tamil: 'நாக கரணம்' },
    11: { name: 'Kistughan', tamil: 'கிஸ்துகன் கரணம்' },
  };

  /**
   * Hora names (Planetary Hours) - 7 items (repeating)
   */
  static HORA = {
    0: { name: 'Sun', tamil: 'சூரியன்' },
    1: { name: 'Moon', tamil: 'சந்த்ரன்' },
    2: { name: 'Mars', tamil: 'செவ்வாய்' },
    3: { name: 'Mercury', tamil: 'புத​ன்' },
    4: { name: 'Jupiter', tamil: 'குரு' },
    5: { name: 'Venus', tamil: 'சுக்ரன்' },
    6: { name: 'Saturn', tamil: 'சனி' },
  };

  /**
   * Paksha (Lunar Phase)
   */
  static PAKSHA = {
    shukla: { name: 'Shukla', tamil: 'வளர்பிறை' },
    krishna: { name: 'Krishna', tamil: 'தேய்பிறை' },
  };

  /**
   * Get name by language
   * @param {Object} item - Item with name and language fields
   * @param {string} language - 'en', 'ta', etc. (default: 'en')
   * @returns {string} Name in requested language
   */
  static getDisplayName(item, language = 'en') {
    if (!item) return '';
    if (language === 'ta' && item.tamil) {
      return item.tamil;
    }
    return item.name || '';
  }

  /**
   * Get formatted display string (e.g., "Name (Tamil)")
   * @param {Object} item - Item with name and language fields
   * @param {string} primaryLang - Primary language ('en', 'ta', etc.)
   * @returns {string} Formatted display string
   */
  static getFormatted(item, primaryLang = 'en') {
    if (!item) return '';

    if (primaryLang === 'en') {
      return item.name || '';
    } else if (primaryLang === 'ta') {
      return item.tamil ? `${item.tamil} (${item.name})` : item.name || '';
    }

    return item.name || '';
  }
}
