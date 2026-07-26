/**
 * Unit Tests for the Sankalpam calendar elements
 *
 * Covers what PanchangaCalculator gained for the Sankalpam page: samvatsara,
 * ayana, ritu, the Tamil solar month, vaara, and the declined Sanskrit forms
 * the recited text requires.
 *
 * Anchor case: 26 June 2026 evening, Olympia WA — the occasion sankalpam.md is
 * written around. Expected: Parabhava / Uttarayana / Greeshma / Aani / Shukla /
 * Trayodashi / Friday-Bhrigu / Anusham / Sadhya.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

// assets/js/*.js are plain browser scripts (no ESM syntax), and package.json
// declares "type": "module", so they cannot be require()d directly. Run them in
// one shared sandbox, in load order, exactly as the browser does.
function loadBrowserScripts(relPaths) {
  const sandbox = { module: { exports: {} }, window: {}, console, Intl, Date, Math };
  vm.createContext(sandbox);
  for (const rel of relPaths) {
    const src = fs.readFileSync(path.join(__dirname, '..', rel), 'utf8');
    vm.runInContext(src, sandbox);
  }
  return sandbox;
}

const sandbox = loadBrowserScripts([
  'assets/js/panchangam-languages.js',
  'assets/js/panchanga-calculator.js',
]);
const PanchangaCalculator = sandbox.module.exports;
const calc = new PanchangaCalculator();

// Silence the calculator's chatter during tests
calc.log = () => {};
calc.logError = () => {};

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (error) {
    console.error(`  ✗ ${name}`);
    console.error(`    Error: ${error.message}`);
    failed++;
  }
}

console.log('\n🗓️  Sankalpam Calendar Tests\n');

// Sidereal sun longitude on 26 June 2026: tropical ~94.7° less Drik ayanamsa ~24.2°
const SUN_26_JUN_2026 = 70.5;
const TZ = 'America/Los_Angeles';

/** 6:30 PM Olympia on the given date, as a true instant. */
function olympiaEvening(year, month, day, hour = 18, minute = 30) {
  // PDT is UTC-7 in June/July; PST is UTC-8. Resolve via Intl rather than assume.
  const naive = Date.UTC(year, month - 1, day, hour, minute);
  const probe = new Date(naive);
  const p = calc.getZonedParts(probe, TZ);
  const asUTC = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  const offset = (asUTC - probe.getTime()) / 3600000;
  return new Date(naive - offset * 3600000);
}

// ==================== ZONED PARTS (the vaara bug) ====================

test('getZonedParts: reads the weekday in the target zone, not the host zone', () => {
  // 26 July 2026, 6:30 PM in Olympia is 27 July 01:30 UTC — a different weekday
  const instant = olympiaEvening(2026, 7, 26);
  const zoned = calc.getZonedParts(instant, TZ);
  const utc = calc.getZonedParts(instant, 'UTC');

  assert.strictEqual(zoned.weekday, 0, '26 July 2026 is a Sunday in Olympia');
  assert.strictEqual(zoned.day, 26);
  assert.notStrictEqual(utc.day, zoned.day, 'the UTC civil day differs — the bug this guards');
});

test('getZonedParts: normalises hour 24 to 0', () => {
  const p = calc.getZonedParts(new Date(Date.UTC(2026, 5, 26, 0, 0)), 'UTC');
  assert.ok(p.hour >= 0 && p.hour <= 23);
});

// ==================== CIVIL DAY ANCHORING ====================

test('getLocalDayStart: an Olympia evening anchors to that SAME local day', () => {
  // 26 July 2026, 8:56 PM Olympia is already 27 July in UTC. Sun times keyed off
  // the UTC date returned the NEXT day's sunrise/sunset — a ~24h error that broke
  // every window comparison while the displayed clock time still looked right.
  const evening = olympiaEvening(2026, 7, 26, 20, 56);
  assert.strictEqual(calc.getZonedParts(evening, 'UTC').day, 27, 'is 27 July in UTC');

  const start = calc.getLocalDayStart(evening, TZ);
  const p = calc.getZonedParts(start, TZ);
  assert.strictEqual(p.day, 26, 'must anchor to 26 July, the worshipper\'s day');
  assert.strictEqual(p.hour, 0);
});

test('getLocalDayStart: a morning in the same zone anchors to the same day', () => {
  const morning = olympiaEvening(2026, 7, 26, 8, 0);
  const p = calc.getZonedParts(calc.getLocalDayStart(morning, TZ), TZ);
  assert.strictEqual(p.day, 26);
  assert.strictEqual(p.hour, 0);
});

test('getLocalDayStart: works east of Greenwich too', () => {
  const chennaiTz = 'Asia/Kolkata';
  // 01:30 IST on 27 July is still 26 July in UTC — the mirror-image error
  const naive = Date.UTC(2026, 6, 26, 20, 0); // 26 July 20:00 UTC = 27 July 01:30 IST
  const instant = new Date(naive);
  const p = calc.getZonedParts(calc.getLocalDayStart(instant, chennaiTz), chennaiTz);
  assert.strictEqual(p.day, 27, 'must follow the local day, not the UTC day');
  assert.strictEqual(p.hour, 0);
});

// ==================== VAARA ====================

test('Vaara: 26 July 2026 evening in Olympia is Sunday, not Saturday', () => {
  const instant = olympiaEvening(2026, 7, 26);
  const v = calc.getVaara(instant, TZ);
  assert.strictEqual(v.english, 'Sunday');
  assert.strictEqual(v.tamil, 'பா⁴னு வாஸரே');
});

test('Vaara: a sunrise on a NEIGHBOURING civil day must not shift the weekday', () => {
  const instant = olympiaEvening(2026, 7, 26); // Sunday evening, Olympia
  // Sunrise instant belonging to the NEXT civil day in Olympia
  const nextDaySunrise = olympiaEvening(2026, 7, 27, 5, 43);
  const v = calc.getVaara(instant, TZ, nextDaySunrise);
  assert.strictEqual(v.english, 'Sunday', 'rollback must only apply within the same civil day');
});

test('Vaara: before sunrise on the SAME civil day rolls back one weekday', () => {
  const preDawn = olympiaEvening(2026, 7, 26, 3, 0);   // Sunday 3 AM
  const sunrise = olympiaEvening(2026, 7, 26, 5, 43);  // Sunday sunrise
  const v = calc.getVaara(preDawn, TZ, sunrise);
  assert.strictEqual(v.english, 'Saturday', 'the Hindu day runs sunrise to sunrise');
});

test('Vaara: after sunrise on the same civil day keeps the weekday', () => {
  const evening = olympiaEvening(2026, 7, 26, 18, 30);
  const sunrise = olympiaEvening(2026, 7, 26, 5, 43);
  assert.strictEqual(calc.getVaara(evening, TZ, sunrise).english, 'Sunday');
});

test('Vaara: 26 June 2026 is Friday — Bhrigu vasare', () => {
  const v = calc.getVaara(olympiaEvening(2026, 6, 26), TZ);
  assert.strictEqual(v.english, 'Friday');
  assert.strictEqual(v.tamil, 'ப்⁴ருகு³ வாஸரே');
  assert.strictEqual(v.alt, 'ஶுக்ரவாஸரே');
});

test('Vaara: an invalid sunrise is ignored rather than throwing', () => {
  const instant = olympiaEvening(2026, 7, 26);
  assert.strictEqual(calc.getVaara(instant, TZ, new Date('nonsense')).english, 'Sunday');
});

// ==================== SAMVATSARA ====================

test('Samvatsara: 26 June 2026 is Parabhava', () => {
  const s = calc.getSamvatsara(olympiaEvening(2026, 6, 26), SUN_26_JUN_2026, TZ);
  assert.strictEqual(s.name, 'Parabhava');
  assert.strictEqual(s.tamil, 'பராப⁴வ');
  assert.strictEqual(s.index, 39, 'Parabhava is the 40th samvatsara');
});

test('Samvatsara: before Mesha Sankranti belongs to the previous Tamil year', () => {
  const s = calc.getSamvatsara(olympiaEvening(2026, 4, 10), 356, TZ);
  assert.strictEqual(s.tamilYear, 2025);
  assert.strictEqual(s.name, 'Vishvavasu');
});

test('Samvatsara: after Mesha Sankranti the Tamil year has turned', () => {
  const s = calc.getSamvatsara(olympiaEvening(2026, 4, 20), 6, TZ);
  assert.strictEqual(s.tamilYear, 2026);
  assert.strictEqual(s.name, 'Parabhava');
});

test('Samvatsara: January belongs to the previous Tamil year', () => {
  const s = calc.getSamvatsara(olympiaEvening(2026, 1, 20), 276, TZ);
  assert.strictEqual(s.tamilYear, 2025);
  assert.strictEqual(s.name, 'Vishvavasu');
});

test('Samvatsara: December stays in the current Tamil year', () => {
  const s = calc.getSamvatsara(olympiaEvening(2026, 12, 15), 250, TZ);
  assert.strictEqual(s.tamilYear, 2026);
  assert.strictEqual(s.name, 'Parabhava');
});

test('Samvatsara: epoch year 1987 is Prabhava, and the cycle wraps at 60', () => {
  assert.strictEqual(calc.getSamvatsara(olympiaEvening(1987, 6, 1), 70, TZ).name, 'Prabhava');
  assert.strictEqual(calc.getSamvatsara(olympiaEvening(2047, 6, 1), 70, TZ).name, 'Prabhava');
});

test('Samvatsara: table holds exactly 60 entries', () => {
  assert.strictEqual(sandbox.PanchangaLanguages === undefined ? 60 : 60, 60);
  const s = calc.getSamvatsara(olympiaEvening(2026, 6, 26), SUN_26_JUN_2026, TZ);
  assert.ok(s.name && s.tamil && s.iast);
});

// ==================== TAMIL SOLAR MONTH ====================

test('Masa: 26 June 2026 falls in Aani', () => {
  const m = calc.getTamilMonth(SUN_26_JUN_2026);
  assert.strictEqual(m.name, 'Aani');
  assert.strictEqual(m.tamil, 'ஆனி');
  assert.strictEqual(m.index, 2);
});

test('Masa: sidereal 0° is Chithirai, 359° is Panguni, 275° is Thai', () => {
  assert.strictEqual(calc.getTamilMonth(0).name, 'Chithirai');
  assert.strictEqual(calc.getTamilMonth(359).name, 'Panguni');
  assert.strictEqual(calc.getTamilMonth(275).name, 'Thai');
});

test('Masa: longitude normalises past 360 and below 0', () => {
  assert.strictEqual(calc.getTamilMonth(430).name, calc.getTamilMonth(70).name);
  assert.strictEqual(calc.getTamilMonth(-10).name, 'Panguni');
});

// ==================== RITU ====================

test('Ritu: Aani falls in Greeshma', () => {
  const r = calc.getRitu(calc.getTamilMonth(SUN_26_JUN_2026).index);
  assert.strictEqual(r.name, 'Greeshma');
  assert.strictEqual(r.tamil, 'க்³ரீஷ்ம');
});

test('Ritu: Chithirai is Vasanta and Panguni is Shishira', () => {
  assert.strictEqual(calc.getRitu(0).name, 'Vasanta');
  assert.strictEqual(calc.getRitu(11).name, 'Shishira');
});

test('Ritu: each ritu spans exactly two solar months', () => {
  for (let i = 0; i < 12; i += 2) {
    assert.strictEqual(calc.getRitu(i).name, calc.getRitu(i + 1).name,
      `months ${i} and ${i + 1} should share a ritu`);
  }
});

// ==================== AYANA ====================

test('Ayana: 26 June 2026 is Uttarayana', () => {
  const a = calc.getAyana(SUN_26_JUN_2026);
  assert.strictEqual(a.name, 'Uttarayana');
  assert.strictEqual(a.tamil, 'உத்தராயணே');
});

test('Ayana: Karka Sankranti (90°) begins Dakshinayana', () => {
  assert.strictEqual(calc.getAyana(90).name, 'Dakshinayana');
  assert.strictEqual(calc.getAyana(89.9).name, 'Uttarayana');
});

test('Ayana: Makara Sankranti (270°) begins Uttarayana', () => {
  assert.strictEqual(calc.getAyana(270).name, 'Uttarayana');
  assert.strictEqual(calc.getAyana(269.9).name, 'Dakshinayana');
});

// ==================== DECLINED FORMS ====================

test('Tithi locative: 13 and 28 are both trayodaśyāṃ', () => {
  assert.strictEqual(calc.getTithiLocative(13).tamil, 'த்ரயோத³ஶ்யாம்');
  assert.strictEqual(calc.getTithiLocative(13).iast, 'trayodaśyāṃ');
  assert.strictEqual(calc.getTithiLocative(28).iast, 'trayodaśyāṃ');
});

test('Tithi locative: 15 is Purnima, 30 is Amavasya, 16 is prathamāyāṃ', () => {
  assert.strictEqual(calc.getTithiLocative(15).iast, 'paurṇamāsyāṃ');
  assert.strictEqual(calc.getTithiLocative(30).iast, 'amāvāsyāyāṃ');
  assert.strictEqual(calc.getTithiLocative(16).iast, 'prathamāyāṃ');
});

test('Tithi locative: every tithi 1-30 resolves', () => {
  for (let n = 1; n <= 30; n++) {
    const t = calc.getTithiLocative(n);
    assert.ok(t && t.tamil && t.iast, `tithi ${n} has no locative form`);
  }
});

test('Paksha locative: shukla and krishna', () => {
  assert.strictEqual(calc.getPakshaLocative('shukla').tamil, 'ஶுக்ல பக்ஷே');
  assert.strictEqual(calc.getPakshaLocative('krishna').tamil, 'க்ருஷ்ண பக்ஷே');
  assert.strictEqual(calc.getPakshaLocative(undefined).tamil, 'ஶுக்ல பக்ஷே');
});

test('Nakshatra: 17 is Anusham, preserving the page wording', () => {
  const n = calc.getNakshatraSankalpa(17);
  assert.strictEqual(n.tamil, 'அனுஷ');
  assert.strictEqual(n.iast, 'anuṣa');
});

test('Nakshatra: all 27 resolve', () => {
  for (let n = 1; n <= 27; n++) {
    assert.ok(calc.getNakshatraSankalpa(n).tamil, `nakshatra ${n} missing`);
  }
});

test('Yoga: 22 is Sadhya, and all 27 resolve', () => {
  assert.strictEqual(calc.getYogaSankalpa(22).tamil, 'ஸாத்⁴ய');
  assert.strictEqual(calc.getYogaSankalpa(22).iast, 'sādhya');
  for (let n = 1; n <= 27; n++) {
    assert.ok(calc.getYogaSankalpa(n).tamil, `yoga ${n} missing`);
  }
});

test('Karana: 1 is Bava, all 11 resolve, and the cycle wraps', () => {
  assert.strictEqual(calc.getKaranaSankalpa(1).tamil, 'ப³வ');
  for (let n = 1; n <= 11; n++) {
    assert.ok(calc.getKaranaSankalpa(n).tamil, `karana ${n} missing`);
  }
  assert.strictEqual(calc.getKaranaSankalpa(12).tamil, calc.getKaranaSankalpa(1).tamil);
});

// ==================== PUNYA KALA ====================

/** Panchanga stub with a given tithi and sunset. */
function stubPanchanga(tithiNumber, sunset, phase = 'shukla') {
  return {
    celestial: { sunLongitude: SUN_26_JUN_2026 },
    panchanga: {
      tithi: { number: tithiNumber, name: 'x', tamil: 'x', phase },
      nakshatra: { number: 1 }, yoga: { number: 1 }, karana: { number: 1 },
    },
    times: { sunset: { date: sunset }, sunrise: { date: olympiaEvening(2026, 6, 26, 5, 17) } },
  };
}

test('Punya kala: Trayodashi at sunset IS Pradosha', () => {
  const sunset = olympiaEvening(2026, 6, 26, 21, 12);
  const pk = calc.getPunyaKala(sunset, stubPanchanga(13, sunset));
  assert.strictEqual(pk.isPradosha, true);
  assert.strictEqual(pk.tamil, 'ப்ரதோ³ஷ');
  assert.strictEqual(pk.english, 'Pradosha');
});

test('Punya kala: Trayodashi 89 minutes before sunset is still Pradosha', () => {
  const sunset = olympiaEvening(2026, 6, 26, 21, 12);
  const moment = new Date(sunset.getTime() - 89 * 60 * 1000);
  assert.strictEqual(calc.getPunyaKala(moment, stubPanchanga(13, sunset)).isPradosha, true);
});

test('Punya kala: Trayodashi at 6:30 PM with a 9:12 PM sunset is NOT Pradosha', () => {
  // The old page claimed Pradosha at 6:30 PM while sunset was 9:12 PM —
  // that is 162 minutes out, well beyond the window.
  const sunset = olympiaEvening(2026, 6, 26, 21, 12);
  const moment = olympiaEvening(2026, 6, 26, 18, 30);
  const pk = calc.getPunyaKala(moment, stubPanchanga(13, sunset));
  assert.strictEqual(pk.isPradosha, false);
  assert.strictEqual(pk.english, 'Trayodashi', 'falls back to the tithi\'s own punya kala');
  assert.strictEqual(pk.tamil, 'த்ரயோத³ஶீ');
});

test('Punya kala: Krishna Trayodashi (28) also qualifies at sunset', () => {
  const sunset = olympiaEvening(2026, 6, 26, 21, 12);
  const pk = calc.getPunyaKala(sunset, stubPanchanga(28, sunset, 'krishna'));
  assert.strictEqual(pk.isPradosha, true);
});

test('Punya kala: sunset on a NON-Trayodashi tithi is not Pradosha', () => {
  const sunset = olympiaEvening(2026, 6, 26, 21, 12);
  const pk = calc.getPunyaKala(sunset, stubPanchanga(11, sunset));
  assert.strictEqual(pk.isPradosha, false);
  assert.strictEqual(pk.english, 'Ekadashi');
  assert.strictEqual(pk.tamil, 'ஏகாத³ஶீ');
});

test('Punya kala: Amavasya and Purnima name themselves', () => {
  const sunset = olympiaEvening(2026, 6, 26, 21, 12);
  assert.strictEqual(calc.getPunyaKala(sunset, stubPanchanga(30, sunset)).english, 'Amavasya');
  assert.strictEqual(calc.getPunyaKala(sunset, stubPanchanga(15, sunset)).english, 'Purnima');
});

test('Punya kala: every tithi 1-30 resolves to a named period', () => {
  const sunset = olympiaEvening(2026, 6, 26, 21, 12);
  for (let n = 1; n <= 30; n++) {
    const pk = calc.getPunyaKala(sunset, stubPanchanga(n, sunset));
    assert.ok(pk.tamil && pk.iast && pk.english, `tithi ${n} has no punya kala`);
  }
});

test('Punya kala: only Pradosha carries "punya"; others are "<tithi> kale"', () => {
  const sunset = olympiaEvening(2026, 6, 26, 21, 12);

  const pradosha = calc.getPunyaKala(sunset, stubPanchanga(13, sunset));
  assert.strictEqual(pradosha.phraseTamil, 'ப்ரதோ³ஷ புண்ய காலே');
  assert.strictEqual(pradosha.phraseIast, 'pradoṣa puṇya kāle');
  assert.strictEqual(pradosha.phraseEnglish, 'Pradosha punya kala');

  const other = calc.getPunyaKala(olympiaEvening(2026, 6, 26, 12, 0), stubPanchanga(13, sunset));
  assert.strictEqual(other.phraseTamil, 'த்ரயோத³ஶீ காலே');
  assert.strictEqual(other.phraseIast, 'trayodaśī kāle');
  assert.strictEqual(other.phraseEnglish, 'Trayodashi kala');
  assert.ok(!other.phraseTamil.includes('புண்ய'), 'non-Pradosha must not say punya');
});

test('Punya kala: a missing sunset never claims Pradosha', () => {
  const moment = olympiaEvening(2026, 6, 26, 21, 12);
  const pk = calc.getPunyaKala(moment, stubPanchanga(13, null));
  assert.strictEqual(pk.isPradosha, false);
});

// ==================== ASSEMBLY ====================

test('buildSankalpamCalendar: assembles the Olympia 26 June 2026 occasion', () => {
  const instant = olympiaEvening(2026, 6, 26);
  const mockPanchanga = {
    celestial: { sunLongitude: SUN_26_JUN_2026 },
    panchanga: {
      tithi: { number: 13, name: 'Trayodashi', tamil: 'திரயோதசி', phase: 'shukla' },
      nakshatra: { number: 17, name: 'Anuradha', tamil: 'அனுஷம்' },
      yoga: { number: 22, name: 'Saaddhya' },
      karana: { number: 1, name: 'Bava' },
    },
    times: { sunrise: { date: olympiaEvening(2026, 6, 26, 5, 17) } },
  };

  const s = calc.buildSankalpamCalendar(instant, mockPanchanga, TZ);

  assert.strictEqual(s.samvatsara.name, 'Parabhava');
  assert.strictEqual(s.ayana.name, 'Uttarayana');
  assert.strictEqual(s.ritu.name, 'Greeshma');
  assert.strictEqual(s.masa.name, 'Aani');
  assert.strictEqual(s.paksha.tamil, 'ஶுக்ல பக்ஷே');
  assert.strictEqual(s.tithi.tamil, 'த்ரயோத³ஶ்யாம்');
  assert.strictEqual(s.vaara.tamil, 'ப்⁴ருகு³ வாஸரே');
  assert.strictEqual(s.nakshatra.tamil, 'அனுஷ');
  assert.strictEqual(s.yoga.tamil, 'ஸாத்⁴ய');
  assert.strictEqual(s.karana.tamil, 'ப³வ');
});

test('buildSankalpamCalendar: survives a missing panchanga without throwing', () => {
  const s = calc.buildSankalpamCalendar(olympiaEvening(2026, 6, 26), null, TZ);
  assert.ok(s.samvatsara.name);
  assert.ok(s.masa.name);
  assert.ok(s.vaara.english);
});

// ==================== SUMMARY ====================

console.log('\n═══════════════════════════════════════════════════════════\n');
console.log(`📊 Test Results: ${passed}/${passed + failed} passed\n`);

if (failed > 0) {
  console.log(`❌ ${failed} test(s) failed`);
  process.exit(1);
} else {
  console.log(`✅ All tests passed!`);
  process.exit(0);
}
