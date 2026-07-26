/**
 * Sankalpam Widget
 *
 * A thin binder: it chooses a moment, asks the shared PanchangaCalculator for
 * the panchanga and calendar elements, and writes them into the page.
 * All calculation lives in panchanga-calculator.js; all naming and declension
 * data lives in panchangam-languages.js.
 *
 * The LOCATION is deliberately fixed — this page is a worked example for
 * Olympia, Washington. The geographic phrases in the recited text (dvipa,
 * varsha, khanda, river, city) are static, bracketed and colour-coded in the
 * page so a worshipper elsewhere knows exactly what to replace.
 *
 * Markup contract: any element carrying data-sk="<field>" is filled, with
 * data-lang selecting the rendering ("ta" grantha, "ia" IAST, "en" English).
 */

class SankalpamWidget {
  /** The place this page is written around. */
  static LOCATION = {
    name: 'Olympia, Thurston County, Washington',
    latitude: 47.0451,
    longitude: -122.8950,
    timezone: 'America/Los_Angeles',
  };

  constructor() {
    this.calculator = null;
    this.dateInput = document.getElementById('sankalpam-date');
    this.timeInput = document.getElementById('sankalpam-time');
    this.statusEl = document.getElementById('sankalpam-status');
  }

  async init() {
    if (!this.dateInput || !this.timeInput) return;

    try {
      if (typeof PanchangaCalculator === 'undefined') {
        throw new Error('PanchangaCalculator not loaded');
      }
      this.calculator = new PanchangaCalculator();
      await this.calculator.init();
    } catch (e) {
      this.setStatus(`Could not start the calculator: ${e.message}`, true);
      return;
    }

    this.setCurrentMoment();

    const recalc = () => this.update();
    this.dateInput.addEventListener('change', recalc);
    this.timeInput.addEventListener('change', recalc);

    const nowBtn = document.getElementById('sankalpam-now-btn');
    if (nowBtn) {
      nowBtn.addEventListener('click', () => {
        this.setCurrentMoment();
        this.update();
      });
    }

    await this.update();
  }

  /** Set the inputs to the present moment, as the clock reads in Olympia. */
  setCurrentMoment() {
    const p = this.calculator.getZonedParts(new Date(), SankalpamWidget.LOCATION.timezone);
    const pad = (n) => String(n).padStart(2, '0');
    this.dateInput.value = `${p.year}-${pad(p.month)}-${pad(p.day)}`;
    this.timeInput.value = `${pad(p.hour)}:${pad(p.minute)}`;
  }

  /** Zone offset in hours at a given instant (negative west of Greenwich). */
  offsetHours(date, timeZone) {
    const p = this.calculator.getZonedParts(date, timeZone);
    const asUTC = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
    return (asUTC - date.getTime()) / 3600000;
  }

  /**
   * Turn the chosen wall-clock into a true instant in the fixed location's zone.
   * Resolved twice so a choice near a DST transition lands correctly.
   */
  chosenInstant() {
    const [y, m, d] = (this.dateInput.value || '').split('-').map(Number);
    const [hh, mm] = (this.timeInput.value || '').split(':').map(Number);
    if (!y || !m || !d || Number.isNaN(hh) || Number.isNaN(mm)) return null;

    const tz = SankalpamWidget.LOCATION.timezone;
    const naive = Date.UTC(y, m - 1, d, hh, mm);
    let instant = naive - this.offsetHours(new Date(naive), tz) * 3600000;
    instant = naive - this.offsetHours(new Date(instant), tz) * 3600000;
    return new Date(instant);
  }

  async update() {
    const instant = this.chosenInstant();
    if (!instant) {
      this.setStatus('Choose a date and time.', true);
      return;
    }

    const loc = SankalpamWidget.LOCATION;
    this.setStatus('Calculating…');

    try {
      const panchanga = await this.calculator.calculateFullPanchanga(
        instant, loc.latitude, loc.longitude, loc.timezone
      );
      this.render(panchanga.calendar, panchanga, instant);
      this.setStatus('');
    } catch (e) {
      console.error('Sankalpam calculation failed:', e);
      this.setStatus(`Calculation failed: ${e.message}`, true);
    }
  }

  /**
   * Resolve one field in one rendering. Fixed liturgical words stay in the
   * page; only the variable word is supplied, except where the data already
   * carries a full phrase (ayana, paksha, vaara).
   */
  valueFor(field, lang, s, panchanga, instant) {
    const v = s.vaara;

    const map = {
      samvatsara: { ta: s.samvatsara.tamil, ia: s.samvatsara.iast, en: s.samvatsara.name },
      ayana: { ta: s.ayana.tamil, ia: s.ayana.iast, en: s.ayana.name },
      ritu: { ta: s.ritu.tamil, ia: s.ritu.iast, en: s.ritu.name },
      masa: { ta: s.masa.tamil, ia: s.masa.iast, en: s.masa.name },
      paksha: { ta: s.paksha.tamil, ia: s.paksha.iast, en: s.paksha.english },
      tithi: { ta: s.tithi.tamil, ia: s.tithi.iast, en: s.tithi.name },
      vaara: {
        ta: `${v.tamil} (${v.alt})`,
        ia: `${v.iast} (${v.iastAlt})`,
        en: v.english,
      },
      nakshatra: { ta: s.nakshatra.tamil, ia: s.nakshatra.iast, en: s.nakshatra.name },
      yoga: { ta: s.yoga.tamil, ia: s.yoga.iast, en: s.yoga.name },
      karana: { ta: s.karana.tamil, ia: s.karana.iast, en: s.karana.name },

      punyakala: {
        ta: s.punyaKala.phraseTamil,
        ia: s.punyaKala.phraseIast,
        en: s.punyaKala.phraseEnglish,
      },

      // Table-only readings
      punyakalaNote: {
        en: s.punyaKala.isPradosha
          ? 'Pradosha — this moment falls within sunset ±90 min on Trayodashi'
          : `Not Pradosha at this moment — reciting ${s.punyaKala.phraseEnglish}`,
      },
      tithiTamil: { en: s.tithi.tamilName },
      nakshatraTamil: { en: s.nakshatra.tamilName },
      rituEnglish: { en: s.ritu.english },
      masaRasi: { en: s.masa.rasi },
      ayanamsa: { en: `${panchanga.ayanamsa.toFixed(2)}°` },
      sunrise: { en: panchanga.times?.sunrise?.timeIST || '—' },
      sunset: { en: panchanga.times?.sunset?.timeIST || '—' },
      datetime: { en: this.formatMoment(instant) },
    };

    const entry = map[field];
    if (!entry) return '';
    return entry[lang] !== undefined ? entry[lang] : (entry.en || '');
  }

  formatMoment(instant) {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: SankalpamWidget.LOCATION.timezone,
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: 'numeric', minute: '2-digit',
    }).format(instant);
  }

  render(s, panchanga, instant) {
    document.querySelectorAll('[data-sk]').forEach((el) => {
      const field = el.getAttribute('data-sk');
      const lang = el.getAttribute('data-lang') || 'en';
      const value = this.valueFor(field, lang, s, panchanga, instant);
      if (value !== '') el.textContent = value;
    });
  }

  setStatus(message, isError = false) {
    if (!this.statusEl) return;
    this.statusEl.textContent = message;
    this.statusEl.style.display = message ? 'block' : 'none';
    this.statusEl.style.color = isError ? '#b31d28' : '#586069';
  }
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('sankalpam-date')) {
      new SankalpamWidget().init();
    }
  });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SankalpamWidget;
}
