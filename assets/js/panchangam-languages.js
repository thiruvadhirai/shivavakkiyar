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

  // ==================== CALENDAR ELEMENTS ====================
  // Used by the Sankalpam, which states the full position in cosmic time.

  /**
   * Samvatsara — the 60-year Prabhava cycle.
   * Anchor: the Tamil year beginning April 1987 is Prabhava (index 0).
   */
  static SAMVATSARA = [
    { name: 'Prabhava', tamil: 'ப்ரப⁴வ', iast: 'prabhava' },
    { name: 'Vibhava', tamil: 'விப⁴வ', iast: 'vibhava' },
    { name: 'Shukla', tamil: 'ஶுக்ல', iast: 'śukla' },
    { name: 'Pramoduta', tamil: 'ப்ரமோது³த', iast: 'pramoduta' },
    { name: 'Prajotpatti', tamil: 'ப்ரஜோத்பத்தி', iast: 'prajotpatti' },
    { name: 'Angirasa', tamil: 'ஆங்கீ³ரஸ', iast: 'āṅgīrasa' },
    { name: 'Shrimukha', tamil: 'ஶ்ரீமுக²', iast: 'śrīmukha' },
    { name: 'Bhava', tamil: 'பா⁴வ', iast: 'bhāva' },
    { name: 'Yuva', tamil: 'யுவ', iast: 'yuva' },
    { name: 'Dhatri', tamil: 'தா⁴த்ரு', iast: 'dhātṛ' },
    { name: 'Ishvara', tamil: 'ஈஶ்வர', iast: 'īśvara' },
    { name: 'Bahudhanya', tamil: 'ப³ஹுதா⁴ந்ய', iast: 'bahudhānya' },
    { name: 'Pramathi', tamil: 'ப்ரமாதீ²', iast: 'pramāthī' },
    { name: 'Vikrama', tamil: 'விக்ரம', iast: 'vikrama' },
    { name: 'Vrisha', tamil: 'வ்ருஷ', iast: 'vṛṣa' },
    { name: 'Chitrabhanu', tamil: 'சித்ரபா⁴னு', iast: 'citrabhānu' },
    { name: 'Subhanu', tamil: 'ஸுபா⁴னு', iast: 'subhānu' },
    { name: 'Tarana', tamil: 'தாரண', iast: 'tāraṇa' },
    { name: 'Parthiva', tamil: 'பார்தி²வ', iast: 'pārthiva' },
    { name: 'Vyaya', tamil: 'வ்யய', iast: 'vyaya' },
    { name: 'Sarvajit', tamil: 'ஸர்வஜித்', iast: 'sarvajit' },
    { name: 'Sarvadhari', tamil: 'ஸர்வதா⁴ரி', iast: 'sarvadhāri' },
    { name: 'Virodhi', tamil: 'விரோதி⁴', iast: 'virodhi' },
    { name: 'Vikriti', tamil: 'விக்ருதி', iast: 'vikṛti' },
    { name: 'Khara', tamil: 'க²ர', iast: 'khara' },
    { name: 'Nandana', tamil: 'நந்த³ன', iast: 'nandana' },
    { name: 'Vijaya', tamil: 'விஜய', iast: 'vijaya' },
    { name: 'Jaya', tamil: 'ஜய', iast: 'jaya' },
    { name: 'Manmatha', tamil: 'மன்மத²', iast: 'manmatha' },
    { name: 'Durmukhi', tamil: 'து³ர்முகீ²', iast: 'durmukhī' },
    { name: 'Hevilambi', tamil: 'ஹேவிளம்பி³', iast: 'hevilambi' },
    { name: 'Vilambi', tamil: 'விளம்பி³', iast: 'vilambi' },
    { name: 'Vikari', tamil: 'விகாரி', iast: 'vikāri' },
    { name: 'Sharvari', tamil: 'ஶார்வரி', iast: 'śārvari' },
    { name: 'Plava', tamil: 'ப்லவ', iast: 'plava' },
    { name: 'Shubhakrit', tamil: 'ஶுப⁴க்ருத்', iast: 'śubhakṛt' },
    { name: 'Shobhakrit', tamil: 'ஶோப⁴க்ருத்', iast: 'śobhakṛt' },
    { name: 'Krodhi', tamil: 'க்ரோதி⁴', iast: 'krodhi' },
    { name: 'Vishvavasu', tamil: 'விஶ்வாவஸு', iast: 'viśvāvasu' },
    { name: 'Parabhava', tamil: 'பராப⁴வ', iast: 'parābhava' },
    { name: 'Plavanga', tamil: 'ப்லவங்க³', iast: 'plavaṅga' },
    { name: 'Kilaka', tamil: 'கீலக', iast: 'kīlaka' },
    { name: 'Saumya', tamil: 'ஸௌம்ய', iast: 'saumya' },
    { name: 'Sadharana', tamil: 'ஸாதா⁴ரண', iast: 'sādhāraṇa' },
    { name: 'Virodhikrit', tamil: 'விரோத⁴க்ருத்', iast: 'virodhakṛt' },
    { name: 'Paridhavi', tamil: 'பரிதா⁴வி', iast: 'paridhāvi' },
    { name: 'Pramadicha', tamil: 'ப்ரமாதீ³ச', iast: 'pramādīca' },
    { name: 'Ananda', tamil: 'ஆனந்த³', iast: 'ānanda' },
    { name: 'Rakshasa', tamil: 'ராக்ஷஸ', iast: 'rākṣasa' },
    { name: 'Nala', tamil: 'நள', iast: 'naḷa' },
    { name: 'Pingala', tamil: 'பிங்க³ள', iast: 'piṅgaḷa' },
    { name: 'Kalayukti', tamil: 'காளயுக்தி', iast: 'kāḷayukti' },
    { name: 'Siddharthi', tamil: 'ஸித்³தா⁴ர்தி²', iast: 'siddhārthi' },
    { name: 'Raudri', tamil: 'ரௌத்³ரி', iast: 'raudri' },
    { name: 'Durmati', tamil: 'து³ர்மதி', iast: 'durmati' },
    { name: 'Dundubhi', tamil: 'து³ந்து³பி⁴', iast: 'dundubhi' },
    { name: 'Rudhirodgari', tamil: 'ருதி⁴ரோத்³கா³ரி', iast: 'rudhirodgāri' },
    { name: 'Raktakshi', tamil: 'ரக்தாக்ஷி', iast: 'raktākṣi' },
    { name: 'Krodhana', tamil: 'க்ரோத⁴ன', iast: 'krodhana' },
    { name: 'Akshaya', tamil: 'அக்ஷய', iast: 'akṣaya' },
  ];

  /** Gregorian year whose Tamil new year begins samvatsara index 0 (Prabhava). */
  static SAMVATSARA_EPOCH_YEAR = 1987;

  /**
   * Tamil solar months, from Mesha (sidereal 0°).
   * Index i covers sidereal longitude [i*30, (i+1)*30).
   */
  static TAMIL_MONTH = [
    { name: 'Chithirai', tamil: 'சித்திரை', iast: 'cittirai', rasi: 'Mesha' },
    { name: 'Vaikasi', tamil: 'வைகாசி', iast: 'vaikāsi', rasi: 'Rishabha' },
    { name: 'Aani', tamil: 'ஆனி', iast: 'āni', rasi: 'Mithuna' },
    { name: 'Aadi', tamil: 'ஆடி', iast: 'āḍi', rasi: 'Kataka' },
    { name: 'Aavani', tamil: 'ஆவணி', iast: 'āvaṇi', rasi: 'Simha' },
    { name: 'Purattasi', tamil: 'புரட்டாசி', iast: 'puraṭṭāsi', rasi: 'Kanya' },
    { name: 'Aippasi', tamil: 'ஐப்பசி', iast: 'aippasi', rasi: 'Tula' },
    { name: 'Karthigai', tamil: 'கார்த்திகை', iast: 'kārttikai', rasi: 'Vrischika' },
    { name: 'Margazhi', tamil: 'மார்கழி', iast: 'mārkaḻi', rasi: 'Dhanus' },
    { name: 'Thai', tamil: 'தை', iast: 'tai', rasi: 'Makara' },
    { name: 'Maasi', tamil: 'மாசி', iast: 'māsi', rasi: 'Kumbha' },
    { name: 'Panguni', tamil: 'பங்குனி', iast: 'paṅkuni', rasi: 'Meena' },
  ];

  /** Six ritus, two solar months each, from Chithirai. */
  static RITU = [
    { name: 'Vasanta', tamil: 'வஸந்த', iast: 'vasanta', english: 'spring' },
    { name: 'Greeshma', tamil: 'க்³ரீஷ்ம', iast: 'grīṣma', english: 'summer' },
    { name: 'Varsha', tamil: 'வர்ஷ', iast: 'varṣa', english: 'monsoon' },
    { name: 'Sharad', tamil: 'ஶரத்³', iast: 'śarad', english: 'autumn' },
    { name: 'Hemanta', tamil: 'ஹேமந்த', iast: 'hemanta', english: 'pre-winter' },
    { name: 'Shishira', tamil: 'ஶிஶிர', iast: 'śiśira', english: 'winter' },
  ];

  /** Ayana, in the locative form the sankalpa uses. */
  static AYANA = {
    uttarayana: { name: 'Uttarayana', tamil: 'உத்தராயணே', iast: 'uttarāyaṇe' },
    dakshinayana: { name: 'Dakshinayana', tamil: 'த³க்ஷிணாயநே', iast: 'dakṣiṇāyane' },
  };

  /**
   * Weekday in sankalpa form, indexed 0 = Sunday.
   * The parenthetical is the planetary alternative: "ப்⁴ருகு³ வாஸரே (ஶுக்ரவாஸரே)".
   */
  static VAARA = [
    { english: 'Sunday', tamil: 'பா⁴னு வாஸரே', alt: 'ரவிவாஸரே', iast: 'bhānu vāsare', iastAlt: 'ravi-vāsare' },
    { english: 'Monday', tamil: 'இந்து³ வாஸரே', alt: 'ஸோமவாஸரே', iast: 'indu vāsare', iastAlt: 'soma-vāsare' },
    { english: 'Tuesday', tamil: 'பௌ⁴ம வாஸரே', alt: 'மங்க³ளவாஸரே', iast: 'bhauma vāsare', iastAlt: 'maṅgaḷa-vāsare' },
    { english: 'Wednesday', tamil: 'ஸௌம்ய வாஸரே', alt: 'பு³த⁴வாஸரே', iast: 'saumya vāsare', iastAlt: 'budha-vāsare' },
    { english: 'Thursday', tamil: 'கு³ரு வாஸரே', alt: 'ப்³ருஹஸ்பதிவாஸரே', iast: 'guru vāsare', iastAlt: 'bṛhaspati-vāsare' },
    { english: 'Friday', tamil: 'ப்⁴ருகு³ வாஸரே', alt: 'ஶுக்ரவாஸரே', iast: 'bhṛgu vāsare', iastAlt: 'śukra-vāsare' },
    { english: 'Saturday', tamil: 'ஸ்தி²ர வாஸரே', alt: 'ஶநிவாஸரே', iast: 'sthira vāsare', iastAlt: 'śani-vāsare' },
  ];

  // ==================== SANKALPA DECLENSIONS ====================
  // The recited text needs declined forms: "trayodaśyāṃ śubha tithau",
  // not the nominative "Trayodashi" the display widgets show.

  /** Tithi in the LOCATIVE. Keyed 1-15 within a paksha; 30 is Amavasya. */
  static TITHI_LOCATIVE = {
    1: { tamil: 'ப்ரத²மாயாம்', iast: 'prathamāyāṃ' },
    2: { tamil: 'த்³விதீயாயாம்', iast: 'dvitīyāyāṃ' },
    3: { tamil: 'த்ருதீயாயாம்', iast: 'tṛtīyāyāṃ' },
    4: { tamil: 'சதுர்த்²யாம்', iast: 'caturthyāṃ' },
    5: { tamil: 'பஞ்சம்யாம்', iast: 'pañcamyāṃ' },
    6: { tamil: 'ஷஷ்ட்²யாம்', iast: 'ṣaṣṭhyāṃ' },
    7: { tamil: 'ஸப்தம்யாம்', iast: 'saptamyāṃ' },
    8: { tamil: 'அஷ்டம்யாம்', iast: 'aṣṭamyāṃ' },
    9: { tamil: 'நவம்யாம்', iast: 'navamyāṃ' },
    10: { tamil: 'த³ஶம்யாம்', iast: 'daśamyāṃ' },
    11: { tamil: 'ஏகாத³ஶ்யாம்', iast: 'ekādaśyāṃ' },
    12: { tamil: 'த்³வாத³ஶ்யாம்', iast: 'dvādaśyāṃ' },
    13: { tamil: 'த்ரயோத³ஶ்யாம்', iast: 'trayodaśyāṃ' },
    14: { tamil: 'சதுர்த³ஶ்யாம்', iast: 'caturdaśyāṃ' },
    15: { tamil: 'பௌர்ணமாஸ்யாம்', iast: 'paurṇamāsyāṃ' },
    30: { tamil: 'அமாவாஸ்யாயாம்', iast: 'amāvāsyāyāṃ' },
  };

  /**
   * Punya kala — the sanctified period named just before "…pūjāṃ kariṣye".
   *
   * Pradosha is a special case: it is not simply "the Trayodashi period" but
   * the twilight around sunset ON Trayodashi. When the chosen moment falls in
   * that window, PUNYAKALA_PRADOSHA is used; otherwise the tithi names its own
   * punya kala. Keyed 1-15 within a paksha; 30 is Amavasya.
   */
  static PUNYAKALA_PRADOSHA = {
    tamil: 'ப்ரதோ³ஷ', iast: 'pradoṣa', english: 'Pradosha',
  };

  static TITHI_PUNYAKALA = {
    1: { tamil: 'ப்ரத²மா', iast: 'prathamā', english: 'Prathama' },
    2: { tamil: 'த்³விதீயா', iast: 'dvitīyā', english: 'Dwitiya' },
    3: { tamil: 'த்ருதீயா', iast: 'tṛtīyā', english: 'Tritiya' },
    4: { tamil: 'சதுர்தீ²', iast: 'caturthī', english: 'Chaturthi' },
    5: { tamil: 'பஞ்சமீ', iast: 'pañcamī', english: 'Panchami' },
    6: { tamil: 'ஷஷ்டீ', iast: 'ṣaṣṭhī', english: 'Shashthi' },
    7: { tamil: 'ஸப்தமீ', iast: 'saptamī', english: 'Saptami' },
    8: { tamil: 'அஷ்டமீ', iast: 'aṣṭamī', english: 'Ashtami' },
    9: { tamil: 'நவமீ', iast: 'navamī', english: 'Navami' },
    10: { tamil: 'த³ஶமீ', iast: 'daśamī', english: 'Dasami' },
    11: { tamil: 'ஏகாத³ஶீ', iast: 'ekādaśī', english: 'Ekadashi' },
    12: { tamil: 'த்³வாத³ஶீ', iast: 'dvādaśī', english: 'Dwadashi' },
    13: { tamil: 'த்ரயோத³ஶீ', iast: 'trayodaśī', english: 'Trayodashi' },
    14: { tamil: 'சதுர்த³ஶீ', iast: 'caturdaśī', english: 'Chaturdashi' },
    15: { tamil: 'பௌர்ணமாஸீ', iast: 'paurṇamāsī', english: 'Purnima' },
    30: { tamil: 'அமாவாஸ்யா', iast: 'amāvāsyā', english: 'Amavasya' },
  };

  /** Paksha in the locative: "ஶுக்ல பக்ஷே". */
  static PAKSHA_LOCATIVE = {
    shukla: { tamil: 'ஶுக்ல பக்ஷே', iast: 'śukla pakṣe', english: 'Shukla (waxing)' },
    krishna: { tamil: 'க்ருஷ்ண பக்ஷே', iast: 'kṛṣṇa pakṣe', english: 'Krishna (waning)' },
  };

  /**
   * Nakshatra stem for "X நக்ஷத்ரே".
   * `tamil` follows the Tamil star names this site uses and which the Sankalpam
   * page carries today (அனுஷ நக்ஷத்ரே); `sanskrit` is the Sanskrit stem
   * (அனுராதா⁴ நக்ஷத்ரே), which some paddhatis prefer.
   */
  static NAKSHATRA_SANKALPA = {
    1: { tamil: 'அஸ்வினி', sanskrit: 'அஶ்வினீ', iast: 'aśvinī', iastTamil: 'asvini' },
    2: { tamil: 'ப⁴ரணி', sanskrit: 'ப⁴ரணீ', iast: 'bharaṇī', iastTamil: 'bharaṇi' },
    3: { tamil: 'கார்த்திகை', sanskrit: 'க்ருத்திகா', iast: 'kṛttikā', iastTamil: 'kārttikai' },
    4: { tamil: 'ரோஹிணி', sanskrit: 'ரோஹிணீ', iast: 'rohiṇī', iastTamil: 'rohiṇi' },
    5: { tamil: 'ம்ருக³ஶீர்ஷ', sanskrit: 'ம்ருக³ஶீர்ஷ', iast: 'mṛgaśīrṣa', iastTamil: 'mṛgaśīrṣa' },
    6: { tamil: 'திரு ஆதிரை', sanskrit: 'ஆர்த்³ரா', iast: 'ārdrā', iastTamil: 'tiru ātirai' },
    7: { tamil: 'புனர்பூச', sanskrit: 'புனர்வஸு', iast: 'punarvasu', iastTamil: 'punarpūca' },
    8: { tamil: 'பூச', sanskrit: 'புஷ்ய', iast: 'puṣya', iastTamil: 'pūca' },
    9: { tamil: 'ஆயில்ய', sanskrit: 'ஆஶ்லேஷா', iast: 'āśleṣā', iastTamil: 'āyilya' },
    10: { tamil: 'மக', sanskrit: 'மகா⁴', iast: 'maghā', iastTamil: 'maka' },
    11: { tamil: 'பூர', sanskrit: 'பூர்வப²ல்கு³னீ', iast: 'pūrvaphalgunī', iastTamil: 'pūra' },
    12: { tamil: 'உத்தர', sanskrit: 'உத்தரப²ல்கு³னீ', iast: 'uttaraphalgunī', iastTamil: 'uttara' },
    13: { tamil: 'ஹஸ்த', sanskrit: 'ஹஸ்த', iast: 'hasta', iastTamil: 'hasta' },
    14: { tamil: 'சித்திரை', sanskrit: 'சித்ரா', iast: 'citrā', iastTamil: 'cittirai' },
    15: { tamil: 'ஸ்வாதி', sanskrit: 'ஸ்வாதீ', iast: 'svātī', iastTamil: 'svāti' },
    16: { tamil: 'விசாக', sanskrit: 'விஶாகா²', iast: 'viśākhā', iastTamil: 'vicāka' },
    17: { tamil: 'அனுஷ', sanskrit: 'அனுராதா⁴', iast: 'anurādhā', iastTamil: 'anuṣa' },
    18: { tamil: 'கேட்டை', sanskrit: 'ஜ்யேஷ்டா²', iast: 'jyeṣṭhā', iastTamil: 'kēṭṭai' },
    19: { tamil: 'மூல', sanskrit: 'மூல', iast: 'mūla', iastTamil: 'mūla' },
    20: { tamil: 'பூராட', sanskrit: 'பூர்வாஷாடா⁴', iast: 'pūrvāṣāḍhā', iastTamil: 'pūrāṭa' },
    21: { tamil: 'உத்திராட', sanskrit: 'உத்தராஷாடா⁴', iast: 'uttarāṣāḍhā', iastTamil: 'uttirāṭa' },
    22: { tamil: 'திரு ஓண', sanskrit: 'ஶ்ரவண', iast: 'śravaṇa', iastTamil: 'tiru ōṇa' },
    23: { tamil: 'அவிட்ட', sanskrit: 'த⁴னிஷ்டா²', iast: 'dhaniṣṭhā', iastTamil: 'aviṭṭa' },
    24: { tamil: 'சதய', sanskrit: 'ஶதபி⁴ஷக்', iast: 'śatabhiṣak', iastTamil: 'cataya' },
    25: { tamil: 'பூரட்டாதி', sanskrit: 'பூர்வபா⁴த்³ரபதா³', iast: 'pūrvabhādrapadā', iastTamil: 'pūraṭṭāti' },
    26: { tamil: 'உத்திரட்டாதி', sanskrit: 'உத்தரபா⁴த்³ரபதா³', iast: 'uttarabhādrapadā', iastTamil: 'uttiraṭṭāti' },
    27: { tamil: 'ரேவதி', sanskrit: 'ரேவதீ', iast: 'revatī', iastTamil: 'rēvati' },
  };

  /**
   * Which nakshatra naming the Sankalpam uses.
   * 'tamil'    → அனுஷ நக்ஷத்ரே   (preserves the page's existing wording)
   * 'sanskrit' → அனுராதா⁴ நக்ஷத்ரே
   */
  static NAKSHATRA_SANKALPA_STYLE = 'tamil';

  /** Yoga stem for "X யோகே³". */
  static YOGA_SANKALPA = {
    1: { tamil: 'விஷ்கம்ப⁴', iast: 'viṣkambha' },
    2: { tamil: 'ப்ரீதி', iast: 'prīti' },
    3: { tamil: 'ஆயுஷ்மத்', iast: 'āyuṣmat' },
    4: { tamil: 'ஸௌபா⁴க்³ய', iast: 'saubhāgya' },
    5: { tamil: 'ஶோப⁴ன', iast: 'śobhana' },
    6: { tamil: 'அதிக³ண்ட³', iast: 'atigaṇḍa' },
    7: { tamil: 'ஸுகர்ம', iast: 'sukarma' },
    8: { tamil: 'த்⁴ருதி', iast: 'dhṛti' },
    9: { tamil: 'ஶூல', iast: 'śūla' },
    10: { tamil: 'க³ண்ட³', iast: 'gaṇḍa' },
    11: { tamil: 'வ்ருத்³தி⁴', iast: 'vṛddhi' },
    12: { tamil: 'த்⁴ருவ', iast: 'dhruva' },
    13: { tamil: 'வ்யாகா⁴த', iast: 'vyāghāta' },
    14: { tamil: 'ஹர்ஷண', iast: 'harṣaṇa' },
    15: { tamil: 'வஜ்ர', iast: 'vajra' },
    16: { tamil: 'ஸித்³தி⁴', iast: 'siddhi' },
    17: { tamil: 'வ்யதீபாத', iast: 'vyatīpāta' },
    18: { tamil: 'வரீயஸ்', iast: 'varīyas' },
    19: { tamil: 'பரிக⁴', iast: 'parigha' },
    20: { tamil: 'ஶிவ', iast: 'śiva' },
    21: { tamil: 'ஸித்³த⁴', iast: 'siddha' },
    22: { tamil: 'ஸாத்⁴ய', iast: 'sādhya' },
    23: { tamil: 'ஶுப⁴', iast: 'śubha' },
    24: { tamil: 'ஶுக்ல', iast: 'śukla' },
    25: { tamil: 'ப்³ரஹ்ம', iast: 'brahma' },
    26: { tamil: 'ஐந்த்³ர', iast: 'aindra' },
    27: { tamil: 'வைத்⁴ருதி', iast: 'vaidhṛti' },
  };

  /** Karana stem for "X கரணே". */
  static KARANA_SANKALPA = {
    1: { tamil: 'ப³வ', iast: 'bava' },
    2: { tamil: 'பா³லவ', iast: 'bālava' },
    3: { tamil: 'கௌலவ', iast: 'kaulava' },
    4: { tamil: 'தைதில', iast: 'taitila' },
    5: { tamil: 'க³ர', iast: 'gara' },
    6: { tamil: 'வணிஜ', iast: 'vaṇija' },
    7: { tamil: 'விஷ்டி', iast: 'viṣṭi' },
    8: { tamil: 'ஶகுனி', iast: 'śakuni' },
    9: { tamil: 'சதுஷ்பாத³', iast: 'catuṣpāda' },
    10: { tamil: 'நாக³', iast: 'nāga' },
    11: { tamil: 'கிம்ஸ்துக்⁴ன', iast: 'kiṃstughna' },
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
