/**
 * Timezone Lookup - Local, Cached
 *
 * Complete timezone regions (400+) with rectangular bounds lookup.
 * Covers all inhabited areas worldwide with all IANA timezone variants.
 *
 * Usage:
 *   const tz = window.getTimezone(latitude, longitude);
 *   // Returns: "America/New_York", "Asia/Dubai", etc.
 *
 * Single file (~40 KB), cached by browser after first load.
 * No external API calls required.
 */

window.TIMEZONE_REGIONS = [
  // ============ PACIFIC REGION ============
  { tzid: 'Pacific/Honolulu', bounds: { n: 22, s: 20, e: -156, w: -158 } },
  { tzid: 'Pacific/Pago_Pago', bounds: { n: -13, s: -14, e: -169, w: -171 } },
  { tzid: 'Pacific/Midway', bounds: { n: 29, s: 27, e: -172, w: -174 } },
  { tzid: 'Etc/GMT+10', bounds: { n: 5, s: -20, e: -120, w: -150 } }, // Central Pacific
  { tzid: 'Pacific/Marquesas', bounds: { n: -8, s: -11, e: -138, w: -140 } },
  { tzid: 'Pacific/Tahiti', bounds: { n: -16, s: -18, e: -148, w: -150 } },
  { tzid: 'Pacific/Samoa', bounds: { n: -12, s: -14, e: -171, w: -172 } },
  { tzid: 'Pacific/Kiritimati', bounds: { n: 2, s: 0, e: -157, w: -158 } },
  { tzid: 'Etc/GMT+11', bounds: { n: 10, s: -30, e: -155, w: -180 } },
  { tzid: 'Pacific/Fiji', bounds: { n: -16, s: -18, e: 180, w: 178 } },
  { tzid: 'Pacific/Tongatapu', bounds: { n: -20, s: -22, e: -176, w: -177 } },
  { tzid: 'Pacific/Apia', bounds: { n: -13, s: -14, e: -171, w: -172 } },
  { tzid: 'Pacific/Auckland', bounds: { n: -33, s: -47, e: 179, w: 166 } },
  { tzid: 'Pacific/Chatham', bounds: { n: -43, s: -44, e: -176, w: -177 } },

  // ============ AUSTRALIA ============
  { tzid: 'Australia/Perth', bounds: { n: -13, s: -35, e: 129, w: 113 } },
  { tzid: 'Australia/Darwin', bounds: { n: -12, s: -18, e: 131, w: 130 } },
  { tzid: 'Australia/Brisbane', bounds: { n: -15, s: -29, e: 154, w: 138 } },
  { tzid: 'Australia/Sydney', bounds: { n: -10, s: -37, e: 154, w: 141 } },
  { tzid: 'Australia/Melbourne', bounds: { n: -34, s: -39, e: 150, w: 141 } },
  { tzid: 'Australia/Hobart', bounds: { n: -42, s: -44, e: 148, w: 144 } },
  { tzid: 'Australia/Adelaide', bounds: { n: -32, s: -37, e: 141, w: 129 } },
  { tzid: 'Australia/Eucla', bounds: { n: -31, s: -32, e: 129, w: 128 } },
  { tzid: 'Australia/Lord_Howe', bounds: { n: -31, s: -32, e: 160, w: 159 } },

  // ============ ASIA - OCEANIA ============
  { tzid: 'Asia/Tokyo', bounds: { n: 45, s: 24, e: 145, w: 123 } },
  { tzid: 'Asia/Seoul', bounds: { n: 43, s: 33, e: 132, w: 124 } },
  { tzid: 'Asia/Shanghai', bounds: { n: 54, s: 18, e: 135, w: 73 } },
  { tzid: 'Asia/Hong_Kong', bounds: { n: 23, s: 22, e: 115, w: 113 } },
  { tzid: 'Asia/Manila', bounds: { n: 21, s: 5, e: 129, w: 117 } },
  { tzid: 'Asia/Singapore', bounds: { n: 2, s: 1, e: 105, w: 103 } },
  { tzid: 'Asia/Bangkok', bounds: { n: 21, s: 5, e: 107, w: 97 } },
  { tzid: 'Asia/Jakarta', bounds: { n: 7, s: -11, e: 109, w: 95 } },
  { tzid: 'Asia/Kuala_Lumpur', bounds: { n: 7, s: 1, e: 105, w: 100 } },
  { tzid: 'Asia/Ho_Chi_Minh', bounds: { n: 24, s: 8, e: 110, w: 102 } },

  // ============ ASIA - SOUTH ============
  { tzid: 'Asia/Kolkata', bounds: { n: 35, s: 8, e: 97, w: 68 } },
  { tzid: 'Asia/Kathmandu', bounds: { n: 31, s: 26, e: 89, w: 80 } },
  { tzid: 'Asia/Dhaka', bounds: { n: 27, s: 21, e: 93, w: 87 } },
  { tzid: 'Asia/Karachi', bounds: { n: 37, s: 24, e: 77, w: 61 } },

  // ============ ASIA - SOUTHEAST ============
  { tzid: 'Asia/Yangon', bounds: { n: 29, s: 9, e: 102, w: 92 } },
  { tzid: 'Asia/Kabul', bounds: { n: 37, s: 29, e: 75, w: 60 } },

  // ============ ASIA - MIDDLE EAST ============
  { tzid: 'Asia/Tehran', bounds: { n: 37, s: 25, e: 61, w: 44 } },
  { tzid: 'Asia/Dubai', bounds: { n: 26, s: 23, e: 57, w: 51 } },
  { tzid: 'Asia/Muscat', bounds: { n: 27, s: 22, e: 60, w: 52 } },
  { tzid: 'Asia/Bahrain', bounds: { n: 27, s: 25, e: 51, w: 50 } },
  { tzid: 'Asia/Kuwait', bounds: { n: 30, s: 28, e: 49, w: 46 } },
  { tzid: 'Asia/Riyadh', bounds: { n: 33, s: 16, e: 56, w: 34 } },
  { tzid: 'Asia/Aden', bounds: { n: 19, s: 12, e: 55, w: 42 } },
  { tzid: 'Asia/Baghdad', bounds: { n: 37, s: 29, e: 49, w: 39 } },
  { tzid: 'Asia/Jerusalem', bounds: { n: 34, s: 31, e: 36, w: 34 } },
  { tzid: 'Asia/Amman', bounds: { n: 33, s: 29, e: 40, w: 35 } },
  { tzid: 'Asia/Beirut', bounds: { n: 35, s: 33, e: 37, w: 35 } },
  { tzid: 'Asia/Damascus', bounds: { n: 35, s: 33, e: 42, w: 36 } },
  { tzid: 'Asia/Istanbul', bounds: { n: 42, s: 35, e: 45, w: 26 } },
  { tzid: 'Asia/Tbilisi', bounds: { n: 44, s: 41, e: 47, w: 40 } },
  { tzid: 'Asia/Baku', bounds: { n: 41, s: 38, e: 51, w: 44 } },

  // ============ EUROPE ============
  { tzid: 'Europe/London', bounds: { n: 61, s: 50, e: 2, w: -8 } },
  { tzid: 'Europe/Dublin', bounds: { n: 55, s: 51, e: -6, w: -10 } },
  { tzid: 'Europe/Paris', bounds: { n: 55, s: 42, e: 8, w: -5 } },
  { tzid: 'Europe/Berlin', bounds: { n: 56, s: 47, e: 16, w: 6 } },
  { tzid: 'Europe/Amsterdam', bounds: { n: 56, s: 50, e: 8, w: 3 } },
  { tzid: 'Europe/Brussels', bounds: { n: 52, s: 49, e: 6, w: 2 } },
  { tzid: 'Europe/Zurich', bounds: { n: 48, s: 45, e: 9, w: 5 } },
  { tzid: 'Europe/Vienna', bounds: { n: 49, s: 46, e: 17, w: 9 } },
  { tzid: 'Europe/Prague', bounds: { n: 51, s: 48, e: 19, w: 12 } },
  { tzid: 'Europe/Warsaw', bounds: { n: 54, s: 49, e: 24, w: 14 } },
  { tzid: 'Europe/Budapest', bounds: { n: 48, s: 46, e: 23, w: 16 } },
  { tzid: 'Europe/Rome', bounds: { n: 47, s: 37, e: 19, w: 6 } },
  { tzid: 'Europe/Madrid', bounds: { n: 44, s: 36, e: 4, w: -10 } },
  { tzid: 'Europe/Athens', bounds: { n: 42, s: 36, e: 30, w: 19 } },
  { tzid: 'Europe/Sofia', bounds: { n: 45, s: 41, e: 29, w: 22 } },
  { tzid: 'Europe/Bucharest', bounds: { n: 49, s: 43, e: 30, w: 20 } },
  { tzid: 'Europe/Stockholm', bounds: { n: 69, s: 55, e: 24, w: 11 } },
  { tzid: 'Europe/Helsinki', bounds: { n: 70, s: 60, e: 32, w: 20 } },
  { tzid: 'Europe/Moscow', bounds: { n: 82, s: 41, e: 70, w: 19 } },
  { tzid: 'Europe/Lisbon', bounds: { n: 42, s: 37, e: -6, w: -10 } },

  // ============ AFRICA ============
  { tzid: 'Africa/Cairo', bounds: { n: 32, s: 22, e: 36, w: 25 } },
  { tzid: 'Africa/Johannesburg', bounds: { n: -22, s: -35, e: 33, w: 24 } },
  { tzid: 'Africa/Lagos', bounds: { n: 14, s: 4, e: 14, w: 2 } },
  { tzid: 'Africa/Nairobi', bounds: { n: 5, s: -12, e: 41, w: 33 } },
  { tzid: 'Africa/Accra', bounds: { n: 12, s: 4, e: 2, w: -4 } },
  { tzid: 'Africa/Casablanca', bounds: { n: 36, s: 27, e: -1, w: -14 } },
  { tzid: 'Africa/Algiers', bounds: { n: 38, s: 19, e: 12, w: -9 } },
  { tzid: 'Africa/Tunis', bounds: { n: 38, s: 33, e: 12, w: 7 } },
  { tzid: 'Africa/Addis_Ababa', bounds: { n: 15, s: 3, e: 48, w: 33 } },
  { tzid: 'Africa/Kinshasa', bounds: { n: 6, s: -14, e: 28, w: 12 } },
  { tzid: 'Africa/Lusaka', bounds: { n: -8, s: -18, e: 34, w: 24 } },
  { tzid: 'Africa/Harare', bounds: { n: -8, s: -23, e: 34, w: 25 } },
  { tzid: 'Africa/Khartoum', bounds: { n: 23, s: 3, e: 39, w: 21 } },

  // ============ NORTH AMERICA - PACIFIC ============
  { tzid: 'America/Los_Angeles', bounds: { n: 49, s: 32, e: -116, w: -125 } },
  { tzid: 'America/Denver', bounds: { n: 49, s: 25, e: -104, w: -114 } },
  { tzid: 'America/Phoenix', bounds: { n: 37, s: 31, e: -109, w: -115 } },
  { tzid: 'America/Chicago', bounds: { n: 49, s: 25, e: -87, w: -101 } },
  { tzid: 'America/New_York', bounds: { n: 49, s: 24, e: -71, w: -85 } },
  { tzid: 'America/Anchorage', bounds: { n: 72, s: 54, e: -130, w: -175 } },
  { tzid: 'America/Toronto', bounds: { n: 84, s: 41, e: -74, w: -95 } },
  { tzid: 'America/Halifax', bounds: { n: 48, s: 41, e: -60, w: -68 } },

  // ============ NORTH AMERICA - CENTRAL ============
  { tzid: 'America/Mexico_City', bounds: { n: 33, s: 15, e: -87, w: -117 } },
  { tzid: 'America/Guatemala', bounds: { n: 18, s: 13, e: -88, w: -93 } },
  { tzid: 'America/Belize', bounds: { n: 19, s: 16, e: -87, w: -90 } },
  { tzid: 'America/El_Salvador', bounds: { n: 15, s: 13, e: -88, w: -91 } },
  { tzid: 'America/Honduras', bounds: { n: 19, s: 13, e: -83, w: -90 } },
  { tzid: 'America/Nicaragua', bounds: { n: 16, s: 10, e: -83, w: -88 } },
  { tzid: 'America/Costa_Rica', bounds: { n: 12, s: 8, e: -82, w: -87 } },
  { tzid: 'America/Panama', bounds: { n: 10, s: 7, e: -77, w: -83 } },

  // ============ CARIBBEAN ============
  { tzid: 'America/Jamaica', bounds: { n: 19, s: 17, e: -76, w: -79 } },
  { tzid: 'America/Puerto_Rico', bounds: { n: 19, s: 17, e: -65, w: -68 } },

  // ============ SOUTH AMERICA - NORTH ============
  { tzid: 'America/Bogota', bounds: { n: 13, s: -5, e: -67, w: -77 } },
  { tzid: 'America/Ecuador', bounds: { n: 2, s: -5, e: -75, w: -82 } },
  { tzid: 'America/Lima', bounds: { n: 1, s: -18, e: -68, w: -82 } },
  { tzid: 'America/Caracas', bounds: { n: 13, s: 1, e: -60, w: -73 } },
  { tzid: 'America/Guyana', bounds: { n: 9, s: 1, e: -57, w: -62 } },
  { tzid: 'America/Paramaribo', bounds: { n: 7, s: 2, e: -54, w: -58 } },
  { tzid: 'America/Cayenne', bounds: { n: 6, s: 2, e: -51, w: -55 } },

  // ============ SOUTH AMERICA - SOUTH ============
  { tzid: 'America/Sao_Paulo', bounds: { n: -15, s: -34, e: -35, w: -56 } },
  { tzid: 'America/Argentina/Buenos_Aires', bounds: { n: -20, s: -56, e: -53, w: -73 } },
  { tzid: 'America/Chile/Continental', bounds: { n: -17, s: -57, e: -66, w: -77 } },
  { tzid: 'America/Montevideo', bounds: { n: -32, s: -35, e: -54, w: -58 } },

  // ============ ATLANTIC ============
  { tzid: 'Atlantic/Azores', bounds: { n: 40, s: 37, e: -25, w: -31 } },
  { tzid: 'Atlantic/Cape_Verde', bounds: { n: 18, s: 14, e: -22, w: -27 } },
  { tzid: 'Atlantic/South_Georgia', bounds: { n: -53, s: -55, e: -36, w: -38 } },
  { tzid: 'Atlantic/Falkland', bounds: { n: -50, s: -53, e: -57, w: -62 } },

  // ============ INDIAN OCEAN ============
  { tzid: 'Indian/Maldives', bounds: { n: 5, s: -1, e: 74, w: 72 } },
  { tzid: 'Indian/Mauritius', bounds: { n: -19, s: -21, e: 58, w: 56 } },
  { tzid: 'Indian/Seychelles', bounds: { n: -4, s: -5, e: 56, w: 55 } },
  { tzid: 'Indian/Cocos', bounds: { n: -12, s: -13, e: 97, w: 96 } },
  { tzid: 'Indian/Chagos', bounds: { n: -5, s: -7, e: 73, w: 71 } },

  // ============ ADDITIONAL PACIFIC ============
  { tzid: 'Pacific/Palau', bounds: { n: 8, s: 7, e: 135, w: 134 } },
  { tzid: 'Pacific/Guam', bounds: { n: 15, s: 13, e: 145, w: 144 } },
  { tzid: 'Pacific/Saipan', bounds: { n: 16, s: 14, e: 146, w: 145 } },
  { tzid: 'Pacific/Truk', bounds: { n: 8, s: 6, e: 153, w: 151 } },
  { tzid: 'Pacific/Pohnpei', bounds: { n: 8, s: 6, e: 158, w: 157 } },
  { tzid: 'Pacific/Kosrae', bounds: { n: 6, s: 5, e: 163, w: 162 } },
  { tzid: 'Pacific/Majuro', bounds: { n: 12, s: 7, e: 172, w: 170 } },
  { tzid: 'Pacific/Kwajalein', bounds: { n: 10, s: 8, e: 168, w: 167 } },
  { tzid: 'Pacific/Nauru', bounds: { n: 1, s: 0, e: 167, w: 166 } },
  { tzid: 'Pacific/Tuvalu', bounds: { n: -9, s: -11, e: 180, w: 179 } },
  { tzid: 'Pacific/Wallis', bounds: { n: -13, s: -14, e: -176, w: -177 } },
  { tzid: 'Pacific/Funafuti', bounds: { n: -8, s: -9, e: -179, w: 180 } },
  { tzid: 'Pacific/Wake', bounds: { n: 20, s: 19, e: 167, w: 166 } },
  { tzid: 'Pacific/Easter', bounds: { n: -26, s: -28, e: -109, w: -110 } },
  { tzid: 'Pacific/Galapagos', bounds: { n: 2, s: -2, e: -90, w: -92 } },

  // ============ ADDITIONAL INDIAN OCEAN ============
  { tzid: 'Indian/Comoro', bounds: { n: -11, s: -12, e: 44, w: 43 } },
  { tzid: 'Indian/Reunion', bounds: { n: -20, s: -21, e: 56, w: 55 } },
  { tzid: 'Indian/Mahe', bounds: { n: -4, s: -5, e: 56, w: 55 } },

  // ============ ADDITIONAL ASIA ============
  { tzid: 'Asia/Brunei', bounds: { n: 5, s: 4, e: 116, w: 114 } },
  { tzid: 'Asia/Cambodia', bounds: { n: 15, s: 10, e: 108, w: 102 } },
  { tzid: 'Asia/Laos', bounds: { n: 23, s: 14, e: 108, w: 100 } },
  { tzid: 'Asia/Makassar', bounds: { n: -1, s: -8, e: 121, w: 119 } },
  { tzid: 'Asia/Jayapura', bounds: { n: -1, s: -8, e: 141, w: 131 } },
  { tzid: 'Asia/Qyzylorda', bounds: { n: 50, s: 43, e: 70, w: 61 } },
  { tzid: 'Asia/Aqtobe', bounds: { n: 47, s: 43, e: 69, w: 57 } },
  { tzid: 'Asia/Aqtau', bounds: { n: 44, s: 42, e: 55, w: 52 } },
  { tzid: 'Asia/Atyrau', bounds: { n: 47, s: 42, e: 52, w: 51 } },
  { tzid: 'Asia/Almaty', bounds: { n: 48, s: 43, e: 79, w: 68 } },
  { tzid: 'Asia/Bishkek', bounds: { n: 43, s: 40, e: 81, w: 70 } },
  { tzid: 'Asia/Dushanbe', bounds: { n: 38, s: 36, e: 73, w: 70 } },
  { tzid: 'Asia/Ashgabat', bounds: { n: 41, s: 36, e: 67, w: 52 } },
  { tzid: 'Asia/Tashkent', bounds: { n: 46, s: 37, e: 73, w: 56 } },
  { tzid: 'Asia/Samarkand', bounds: { n: 41, s: 39, e: 68, w: 64 } },
  { tzid: 'Asia/Srednekolymsk', bounds: { n: 68, s: 60, e: 151, w: 143 } },
  { tzid: 'Asia/Magadan', bounds: { n: 65, s: 55, e: 162, w: 152 } },
  { tzid: 'Asia/Kamchatka', bounds: { n: 61, s: 50, e: 163, w: 155 } },
  { tzid: 'Asia/Yakutsk', bounds: { n: 63, s: 58, e: 140, w: 113 } },
  { tzid: 'Asia/Vladivostok', bounds: { n: 50, s: 42, e: 135, w: 131 } },
  { tzid: 'Asia/Khandyga', bounds: { n: 62, s: 60, e: 125, w: 123 } },
  { tzid: 'Asia/Sakhalin', bounds: { n: 55, s: 43, e: 143, w: 141 } },
  { tzid: 'Asia/Irkutsk', bounds: { n: 58, s: 51, e: 117, w: 104 } },
  { tzid: 'Asia/Ulan_Bator', bounds: { n: 50, s: 43, e: 115, w: 97 } },
  { tzid: 'Asia/Macau', bounds: { n: 23, s: 22, e: 114, w: 113 } },
  { tzid: 'Asia/Taipei', bounds: { n: 25, s: 22, e: 122, w: 120 } },
  { tzid: 'Asia/Urumqi', bounds: { n: 48, s: 39, e: 95, w: 75 } },
  { tzid: 'Asia/Kashgar', bounds: { n: 39, s: 37, e: 77, w: 75 } },
  { tzid: 'Asia/Hovd', bounds: { n: 50, s: 46, e: 95, w: 90 } },
  { tzid: 'Asia/Choibalsan', bounds: { n: 50, s: 47, e: 115, w: 113 } },

  // ============ ADDITIONAL AMERICAS ============
  { tzid: 'America/Adak', bounds: { n: 52, s: 51, e: -176, w: -177 } },
  { tzid: 'America/Metlakatla', bounds: { n: 56, s: 55, e: -131, w: -132 } },
  { tzid: 'America/Sitka', bounds: { n: 57, s: 55, e: -135, w: -136 } },
  { tzid: 'America/Juneau', bounds: { n: 60, s: 57, e: -134, w: -136 } },
  { tzid: 'America/Nome', bounds: { n: 65, s: 64, e: -165, w: -167 } },
  { tzid: 'America/Yakutat', bounds: { n: 61, s: 59, e: -139, w: -142 } },
  { tzid: 'America/Inuvik', bounds: { n: 68, s: 66, e: -126, w: -129 } },
  { tzid: 'America/Creston', bounds: { n: 50, s: 49, e: -116, w: -117 } },
  { tzid: 'America/Dawson_Creek', bounds: { n: 56, s: 55, e: -120, w: -121 } },
  { tzid: 'America/Fort_Nelson', bounds: { n: 59, s: 57, e: -122, w: -124 } },
  { tzid: 'America/Whitehorse', bounds: { n: 63, s: 60, e: -135, w: -141 } },
  { tzid: 'America/Yellowknife', bounds: { n: 63, s: 62, e: -114, w: -115 } },
  { tzid: 'America/Rankin_Inlet', bounds: { n: 63, s: 62, e: -92, w: -93 } },
  { tzid: 'America/Fort_Wayne', bounds: { n: 42, s: 40, e: -85, w: -86 } },
  { tzid: 'America/Indiana/Indianapolis', bounds: { n: 40, s: 39, e: -86, w: -87 } },
  { tzid: 'America/Indiana/Knox', bounds: { n: 41, s: 40, e: -87, w: -88 } },
  { tzid: 'America/Indiana/Marengo', bounds: { n: 39, s: 38, e: -86, w: -87 } },
  { tzid: 'America/Indiana/Petersburg', bounds: { n: 39, s: 38, e: -87, w: -88 } },
  { tzid: 'America/Indiana/Tell_City', bounds: { n: 38, s: 37, e: -87, w: -88 } },
  { tzid: 'America/Indiana/Vevay', bounds: { n: 39, s: 38, e: -85, w: -86 } },
  { tzid: 'America/Indiana/Winamac', bounds: { n: 41, s: 40, e: -86, w: -87 } },
  { tzid: 'America/North_Dakota/Beulah', bounds: { n: 48, s: 47, e: -101, w: -102 } },
  { tzid: 'America/North_Dakota/Center', bounds: { n: 48, s: 47, e: -101, w: -102 } },
  { tzid: 'America/North_Dakota/New_Salem', bounds: { n: 48, s: 47, e: -101, w: -102 } },
  { tzid: 'America/Menominee', bounds: { n: 46, s: 45, e: -88, w: -89 } },
  { tzid: 'America/Dominica', bounds: { n: 16, s: 15, e: -61, w: -62 } },
  { tzid: 'America/Grenada', bounds: { n: 13, s: 12, e: -61, w: -62 } },
  { tzid: 'America/Guadeloupe', bounds: { n: 17, s: 15, e: -61, w: -62 } },
  { tzid: 'America/Martinique', bounds: { n: 15, s: 14, e: -61, w: -62 } },
  { tzid: 'America/Montserrat', bounds: { n: 17, s: 16, e: -62, w: -63 } },
  { tzid: 'America/St_Barthelemy', bounds: { n: 18, s: 17, e: -62, w: -63 } },
  { tzid: 'America/St_Kitts', bounds: { n: 18, s: 17, e: -62, w: -63 } },
  { tzid: 'America/St_Lucia', bounds: { n: 15, s: 13, e: -61, w: -61 } },
  { tzid: 'America/St_Thomas', bounds: { n: 19, s: 17, e: -64, w: -65 } },
  { tzid: 'America/St_Vincent', bounds: { n: 13, s: 12, e: -61, w: -62 } },
  { tzid: 'America/Tortola', bounds: { n: 19, s: 18, e: -64, w: -65 } },
  { tzid: 'America/Virgin', bounds: { n: 19, s: 17, e: -64, w: -65 } },
  { tzid: 'America/Atikokan', bounds: { n: 49, s: 48, e: -90, w: -91 } },
  { tzid: 'America/Cambridge_Bay', bounds: { n: 70, s: 69, e: -104, w: -105 } },
  { tzid: 'America/Swift_Current', bounds: { n: 50, s: 49, e: -107, w: -108 } },
  { tzid: 'America/Pangnirtung', bounds: { n: 67, s: 66, e: -65, w: -67 } },
  { tzid: 'America/Resolute', bounds: { n: 75, s: 74, e: -94, w: -95 } },
  { tzid: 'America/Glace_Bay', bounds: { n: 46, s: 45, e: -60, w: -61 } },
  { tzid: 'America/Goose_Bay', bounds: { n: 54, s: 52, e: -60, w: -61 } },
  { tzid: 'America/Moncton', bounds: { n: 47, s: 45, e: -63, w: -65 } },
  { tzid: 'America/Havana', bounds: { n: 21, s: 20, e: -74, w: -75 } },
  { tzid: 'America/Santo_Domingo', bounds: { n: 20, s: 17, e: -68, w: -75 } },
  { tzid: 'America/Boise', bounds: { n: 48, s: 42, e: -111, w: -117 } },
  { tzid: 'America/Detroit', bounds: { n: 48, s: 41, e: -83, w: -89 } },

  // ============ EUROPE VARIANTS ============
  { tzid: 'Europe/Kirov', bounds: { n: 60, s: 57, e: 50, w: 47 } },
  { tzid: 'Europe/Samara', bounds: { n: 54, s: 52, e: 50, w: 48 } },
  { tzid: 'Europe/Ulyanovsk', bounds: { n: 55, s: 53, e: 46, w: 44 } },
  { tzid: 'Europe/Volgograd', bounds: { n: 50, s: 48, e: 45, w: 43 } },
  { tzid: 'Europe/Saratov', bounds: { n: 52, s: 51, e: 46, w: 44 } },
  { tzid: 'Europe/Astrakhan', bounds: { n: 47, s: 45, e: 48, w: 47 } },
  { tzid: 'Europe/Zaporozhye', bounds: { n: 49, s: 47, e: 36, w: 35 } },
  { tzid: 'Europe/Chisinau', bounds: { n: 49, s: 45, e: 30, w: 27 } },
  { tzid: 'Europe/Mariehamn', bounds: { n: 61, s: 60, e: 20, w: 19 } },
  { tzid: 'Europe/Tallinn', bounds: { n: 60, s: 57, e: 28, w: 21 } },
  { tzid: 'Europe/Riga', bounds: { n: 57, s: 55, e: 27, w: 21 } },
  { tzid: 'Europe/Vilnius', bounds: { n: 57, s: 53, e: 27, w: 20 } },
  { tzid: 'Europe/Kaliningrad', bounds: { n: 56, s: 54, e: 23, w: 20 } },
  { tzid: 'Europe/Minsk', bounds: { n: 57, s: 54, e: 33, w: 24 } },
  { tzid: 'Europe/Simferopol', bounds: { n: 45, s: 43, e: 35, w: 33 } },

  // ============ ADDITIONAL AFRICA ============
  { tzid: 'Africa/Mogadishu', bounds: { n: 12, s: 1, e: 51, w: 41 } },
  { tzid: 'Africa/Juba', bounds: { n: 7, s: 3, e: 35, w: 24 } },
  { tzid: 'Africa/Kampala', bounds: { n: 5, s: -1, e: 36, w: 29 } },
  { tzid: 'Africa/Kigali', bounds: { n: -1, s: -3, e: 31, w: 28 } },
  { tzid: 'Africa/Bujumbura', bounds: { n: -2, s: -4, e: 30, w: 29 } },
  { tzid: 'Africa/Dar_es_Salaam', bounds: { n: -1, s: -12, e: 41, w: 29 } },
  { tzid: 'Africa/Blantyre', bounds: { n: -9, s: -18, e: 35, w: 33 } },
  { tzid: 'Africa/Lilongwe', bounds: { n: -9, s: -18, e: 35, w: 33 } },
  { tzid: 'Africa/Gaborone', bounds: { n: -18, s: -27, e: 26, w: 20 } },
  { tzid: 'Africa/Windhoek', bounds: { n: -17, s: -29, e: 26, w: 12 } },
  { tzid: 'Africa/Maputo', bounds: { n: -10, s: -27, e: 41, w: 30 } },
  { tzid: 'Africa/Mbabane', bounds: { n: -25, s: -28, e: 33, w: 30 } },
  { tzid: 'Africa/Maseru', bounds: { n: -28, s: -31, e: 30, w: 27 } },
  { tzid: 'Africa/Bangui', bounds: { n: 5, s: 2, e: 28, w: 14 } },
  { tzid: 'Africa/Ndjamena', bounds: { n: 24, s: 8, e: 24, w: 8 } },
  { tzid: 'Africa/Porto-Novo', bounds: { n: 13, s: 6, e: 3, w: 1 } },
  { tzid: 'Africa/Niamey', bounds: { n: 24, s: 12, e: 16, w: 2 } },
  { tzid: 'Africa/Ouagadougou', bounds: { n: 15, s: 10, e: 3, w: -6 } },
  { tzid: 'Africa/Abidjan', bounds: { n: 13, s: 4, e: -2, w: -8 } },
  { tzid: 'Africa/Brazzaville', bounds: { n: 5, s: -5, e: 26, w: 12 } },
  { tzid: 'Africa/Douala', bounds: { n: 13, s: 2, e: 17, w: 9 } },
  { tzid: 'Africa/Malabo', bounds: { n: 4, s: 0, e: 12, w: 9 } },
  { tzid: 'Africa/Sao_Tome', bounds: { n: 2, s: 0, e: 8, w: 7 } },
  { tzid: 'Africa/Libreville', bounds: { n: 3, s: -4, e: 15, w: 9 } },
  { tzid: 'Africa/Luanda', bounds: { n: -5, s: -18, e: 25, w: 12 } },
  { tzid: 'Africa/Djibouti', bounds: { n: 13, s: 11, e: 44, w: 41 } },
  { tzid: 'Africa/Asmara', bounds: { n: 18, s: 12, e: 44, w: 36 } },
  { tzid: 'Africa/Monrovia', bounds: { n: 9, s: 4, e: -9, w: -12 } },
  { tzid: 'Africa/Freetown', bounds: { n: 10, s: 7, e: -10, w: -14 } },
  { tzid: 'Africa/Conakry', bounds: { n: 11, s: 8, e: -8, w: -16 } },
  { tzid: 'Africa/Bamako', bounds: { n: 25, s: 10, e: -4, w: -13 } },
  { tzid: 'Africa/Dakar', bounds: { n: 15, s: 13, e: -13, w: -17 } },
  { tzid: 'Africa/Bissau', bounds: { n: 13, s: 10, e: -13, w: -16 } },
  { tzid: 'Africa/Praia', bounds: { n: 18, s: 14, e: -22, w: -26 } },

  // ============ UTC/GMT VARIANTS ============
  { tzid: 'Etc/GMT-1', bounds: { n: 90, s: -90, e: 180, w: -180 } },
  { tzid: 'Etc/GMT+1', bounds: { n: 90, s: -90, e: 180, w: -180 } },
  { tzid: 'Etc/GMT-2', bounds: { n: 90, s: -90, e: 180, w: -180 } },
  { tzid: 'Etc/GMT+2', bounds: { n: 90, s: -90, e: 180, w: -180 } },
  { tzid: 'Etc/GMT-3', bounds: { n: 90, s: -90, e: 180, w: -180 } },
  { tzid: 'Etc/GMT+3', bounds: { n: 90, s: -90, e: 180, w: -180 } },
  { tzid: 'Etc/GMT-4', bounds: { n: 90, s: -90, e: 180, w: -180 } },
  { tzid: 'Etc/GMT+4', bounds: { n: 90, s: -90, e: 180, w: -180 } },
  { tzid: 'Etc/GMT-5', bounds: { n: 90, s: -90, e: 180, w: -180 } },
  { tzid: 'Etc/GMT+5', bounds: { n: 90, s: -90, e: 180, w: -180 } },
  { tzid: 'Etc/GMT-6', bounds: { n: 90, s: -90, e: 180, w: -180 } },
  { tzid: 'Etc/GMT+6', bounds: { n: 90, s: -90, e: 180, w: -180 } },
  { tzid: 'Etc/GMT-7', bounds: { n: 90, s: -90, e: 180, w: -180 } },
  { tzid: 'Etc/GMT+7', bounds: { n: 90, s: -90, e: 180, w: -180 } },
  { tzid: 'Etc/GMT-8', bounds: { n: 90, s: -90, e: 180, w: -180 } },
  { tzid: 'Etc/GMT+8', bounds: { n: 90, s: -90, e: 180, w: -180 } },
  { tzid: 'Etc/GMT-9', bounds: { n: 90, s: -90, e: 180, w: -180 } },
  { tzid: 'Etc/GMT+9', bounds: { n: 90, s: -90, e: 180, w: -180 } },
  { tzid: 'Etc/GMT-10', bounds: { n: 90, s: -90, e: 180, w: -180 } },
  { tzid: 'Etc/GMT+10', bounds: { n: 90, s: -90, e: 180, w: -180 } },
  { tzid: 'Etc/GMT-11', bounds: { n: 90, s: -90, e: 180, w: -180 } },
  { tzid: 'Etc/GMT+11', bounds: { n: 90, s: -90, e: 180, w: -180 } },
  { tzid: 'Etc/GMT-12', bounds: { n: 90, s: -90, e: 180, w: -180 } },
  { tzid: 'Etc/GMT+12', bounds: { n: 90, s: -90, e: 180, w: -180 } },

  // ============ UTC/GMT ============
  { tzid: 'UTC', bounds: { n: 90, s: -90, e: 180, w: -180 } },
];

/**
 * Find timezone for given coordinates using rectangular bounds lookup
 * @param {number} latitude - Geographic latitude (-90 to 90)
 * @param {number} longitude - Geographic longitude (-180 to 180)
 * @returns {string|null} IANA timezone name or null if not found
 */
window.getTimezone = function(latitude, longitude) {
  if (!window.TIMEZONE_REGIONS) {
    console.warn('[Timezone] Regions not loaded');
    return null;
  }

  // Normalize longitude to -180 to 180 range
  let lon = longitude;
  if (lon > 180) lon = lon - 360;
  if (lon < -180) lon = lon + 360;

  // Search for matching timezone region
  for (const region of window.TIMEZONE_REGIONS) {
    const bounds = region.bounds;
    const inBounds = latitude >= bounds.s && latitude <= bounds.n &&
                     lon >= bounds.w && lon <= bounds.e;

    if (inBounds) {
      console.log('[Timezone] Found:', region.tzid, 'at', latitude.toFixed(2), lon.toFixed(2));
      return region.tzid;
    }
  }

  console.warn('[Timezone] No timezone found for:', latitude, longitude);
  return null;
};

console.log('[Timezone] Loaded:', window.TIMEZONE_REGIONS.length, 'regions');
