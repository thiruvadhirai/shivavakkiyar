# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests/e2e.spec.js >> Panchanga Calculator Page >> Calculate button initiates panchanga calculation
- Location: tests/e2e.spec.js:67:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('#panchanga-location-input')
    - locator resolved to <input type="text" id="panchanga-location-input" class="panchanga-location-input" placeholder="Enter city, state, country, or ZIP code"/>
    - fill("New York, USA")
  - attempting fill action
    2 × waiting for element to be visible, enabled and editable
      - element is not visible
    - retrying fill action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and editable
      - element is not visible
    - retrying fill action
      - waiting 100ms
    58 × waiting for element to be visible, enabled and editable
       - element is not visible
     - retrying fill action
       - waiting 500ms

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - link "Skip to main content" [ref=e2] [cursor=pointer]:
    - /url: "#main-content"
  - banner [ref=e3]:
    - button "Open navigation menu" [ref=e4] [cursor=pointer]: ☰
    - heading "Saivam - Ancient Tamil & Other Spiritual Texts" [level=1] [ref=e5]
  - navigation "Main navigation" [ref=e6]:
    - button "Close navigation menu" [ref=e7] [cursor=pointer]: ×
    - navigation [ref=e8]:
      - link "Sri Rudram Namakam" [ref=e9] [cursor=pointer]:
        - /url: /namakkam/
      - link "Sri Rudram Chamakam" [ref=e10] [cursor=pointer]:
        - /url: /chamakkam/
      - link "Shiva Puranam" [ref=e11] [cursor=pointer]:
        - /url: /shivapuranam/
      - link "Purusa Suktham" [ref=e12] [cursor=pointer]:
        - /url: /purusasuktham/
      - link "Sri Suktam" [ref=e13] [cursor=pointer]:
        - /url: /srisuktam/
      - link "Shivavakkiyam" [ref=e14] [cursor=pointer]:
        - /url: /shivavakkiyar/
      - link "Natarajar Pathu" [ref=e15] [cursor=pointer]:
        - /url: /natarajarpathu/
      - link "Nindra Thiruthandagam" [ref=e16] [cursor=pointer]:
        - /url: /nindrathiruthandagam/
      - link "Thiruneetru Pathigam" [ref=e17] [cursor=pointer]:
        - /url: /thiruneetrupathigam/
      - link "Nandhi Pradosha Song" [ref=e18] [cursor=pointer]:
        - /url: /nandhi-pradosha-song/
      - link "Mantra Pushpam" [ref=e19] [cursor=pointer]:
        - /url: /mantrapushpam/
      - link "Arathi" [ref=e20] [cursor=pointer]:
        - /url: /arathi/
      - link "Panchanga Calculator" [ref=e21] [cursor=pointer]:
        - /url: /panchanga/
      - link "Pradosha Kala Pooja" [ref=e22] [cursor=pointer]:
        - /url: /pradoshakalapooja/
      - link "License" [ref=e23] [cursor=pointer]:
        - /url: /license/
  - main "Content" [ref=e24]:
    - generic [ref=e25]:
      - heading "Panchanga Calculator" [level=1] [ref=e26]
      - paragraph [ref=e27]: Calculate the Hindu calendar (panchanga) for any date and location using the Drik Ayanamsa system.
      - generic [ref=e28]:
        - generic [ref=e29]:
          - heading "🔮 Panchanga Calculator" [level=2] [ref=e30]
          - paragraph [ref=e31]: Hindu Calendar - Daily Astronomical Calculations
          - paragraph [ref=e32]: Based on Drik Panchang (modern astronomical system with accurate precession)
        - generic [ref=e33]:
          - generic [ref=e34]:
            - generic [ref=e35]: 📅 Next Pradosha Dates
            - list [ref=e36]:
              - listitem [ref=e37]: Loading dates...
          - button "📍 Change Location or Show Full Details" [ref=e38] [cursor=pointer]
      - separator [ref=e39]
      - heading "About Panchanga" [level=2] [ref=e40]
      - paragraph [ref=e41]:
        - strong [ref=e42]: Panchanga
        - text: (पञ्चाङ्ग) literally means “five limbs” in Sanskrit. The
        - strong [ref=e43]: Panchanga
        - text: "is the Hindu calendar system that divides each day into five main components:"
      - heading "Tithi (Lunar Day)" [level=3] [ref=e44]:
        - strong [ref=e45]: Tithi
        - text: (Lunar Day)
      - list [ref=e46]:
        - listitem [ref=e47]: 30 tithis per lunar month
        - listitem [ref=e48]: Determined by the angle between Sun and Moon
        - listitem [ref=e49]: Each tithi is associated with specific auspicious activities
      - heading "Nakshatra (Lunar Mansion)" [level=3] [ref=e50]:
        - strong [ref=e51]: Nakshatra
        - text: (Lunar Mansion)
      - list [ref=e52]:
        - listitem [ref=e53]: 27 constellations the Moon passes through
        - listitem [ref=e54]: Each takes approximately one day to cross
        - listitem [ref=e55]: Important for planning ceremonies and rituals
      - heading "Yoga (Auspicious Combination)" [level=3] [ref=e56]:
        - strong [ref=e57]: Yoga
        - text: (Auspicious Combination)
      - list [ref=e58]:
        - listitem [ref=e59]: Combination of Sun and Moon positions
        - listitem [ref=e60]: 27 yogas create different energy patterns
        - listitem [ref=e61]: Some are highly auspicious, others require caution
      - heading "Karana (Half-Tithi)" [level=3] [ref=e62]:
        - strong [ref=e63]: Karana
        - text: (Half-Tithi)
      - list [ref=e64]:
        - listitem [ref=e65]: 60 half-day periods in a lunar month
        - listitem [ref=e66]: Two per tithi
        - listitem [ref=e67]: Each has specific characteristics for actions
      - heading "Hora (Planetary Hour)" [level=3] [ref=e68]:
        - strong [ref=e69]: Hora
        - text: (Planetary Hour)
      - list [ref=e70]:
        - listitem [ref=e71]: 24-hour cycle divided into planetary hours
        - listitem [ref=e72]: Each hour is ruled by a different planet
        - listitem [ref=e73]: Important for timing specific activities
      - separator [ref=e74]
      - heading "Additional Calculations" [level=2] [ref=e75]
      - heading "Rahu Kalam (Inauspicious Time)" [level=3] [ref=e76]:
        - strong [ref=e77]: Rahu Kalam
        - text: (Inauspicious Time)
      - list [ref=e78]:
        - listitem [ref=e79]: 90-minute period each day
        - listitem [ref=e80]: Time of day varies by day of week
        - listitem [ref=e81]: Considered unsuitable for important activities
      - heading "Abhijit Muhurta (Auspicious Time)" [level=3] [ref=e82]:
        - strong [ref=e83]: Abhijit Muhurta
        - text: (Auspicious Time)
      - list [ref=e84]:
        - listitem [ref=e85]: 48-minute window around noon
        - listitem [ref=e86]: Considered highly auspicious
        - listitem [ref=e87]: Good for starting important endeavors
      - heading "Pradosha Times (Worship Period)" [level=3] [ref=e88]:
        - strong [ref=e89]: Pradosha Times
        - text: (Worship Period)
      - list [ref=e90]:
        - listitem [ref=e91]: Occurs twice monthly on the 13th lunar day
        - listitem [ref=e92]: 3-hour window around sunset
        - listitem [ref=e93]: Sacred time for Shiva worship
      - separator [ref=e94]
      - heading "Using the Calculator" [level=2] [ref=e95]
      - list [ref=e96]:
        - listitem [ref=e97]:
          - strong [ref=e98]: Enter your location
          - text: "- City, State, or Coordinates"
        - listitem [ref=e99]:
          - strong [ref=e100]: Select a date
          - text: "- Today or any date you wish to calculate"
        - listitem [ref=e101]:
          - strong [ref=e102]: Click Calculate
          - text: "- Results will appear instantly"
      - paragraph [ref=e103]:
        - text: The calculator uses the
        - strong [ref=e104]: Drik Ayanamsa
        - text: ", the most accurate modern system for Hindu calendar calculations, based on actual astronomical observations."
      - separator [ref=e105]
      - heading "Data Sources" [level=2] [ref=e106]
      - list [ref=e107]:
        - listitem [ref=e108]:
          - strong [ref=e109]: Astronomy Engine
          - text: "- NASA JPL ephemeris data"
        - listitem [ref=e110]:
          - strong [ref=e111]: Drik Ayanamsa
          - text: "- Modern precession correction (~24.14° for 2026)"
        - listitem [ref=e112]:
          - strong [ref=e113]: Nominatim API
          - text: "- OpenStreetMap geocoding"
      - separator [ref=e114]
      - paragraph [ref=e115]:
        - emphasis [ref=e116]: "Last Updated: May 28, 2026"
  - contentinfo [ref=e117]:
    - link "Licensed under Creative Commons (CC0)" [ref=e119] [cursor=pointer]:
      - /url: /license
  - contentinfo [ref=e120]:
    - generic [ref=e121]: "Panchanga Calculator v • Updated:"
```

# Test source

```ts
  1   | /**
  2   |  * End-to-End Tests for Panchanga Calculator
  3   |  * Uses Playwright to test actual browser behavior
  4   |  * Tests: UI rendering, calculations, location search, date picker, error handling
  5   |  */
  6   | 
  7   | import { test, expect } from '@playwright/test';
  8   | 
  9   | // Test configuration
  10  | const BASE_URL = process.env.TEST_URL || 'http://localhost:5080';
  11  | const TIMEOUT = 10000;
  12  | 
  13  | // ============================================================
  14  | // TEST SUITE: Panchanga Page
  15  | // ============================================================
  16  | 
  17  | test.describe('Panchanga Calculator Page', () => {
  18  |   test.beforeEach(async ({ page }) => {
  19  |     // Navigate to panchanga page
  20  |     await page.goto(`${BASE_URL}/panchanga/`, { timeout: TIMEOUT });
  21  | 
  22  |     // Wait for page to load
  23  |     await page.waitForLoadState('networkidle');
  24  |   });
  25  | 
  26  |   // Test: Page loads and contains basic elements
  27  |   test('Page loads and renders main elements', async ({ page }) => {
  28  |     const title = await page.title();
  29  |     expect(title).toContain('Panchanga');
  30  | 
  31  |     // Check main widget container exists
  32  |     const widget = await page.locator('.panchanga-widget').isVisible();
  33  |     expect(widget).toBeTruthy();
  34  | 
  35  |     // Check calculator button exists
  36  |     const calcBtn = await page.locator('button:has-text("Calculate")').isVisible();
  37  |     expect(calcBtn).toBeTruthy();
  38  |   });
  39  | 
  40  |   // Test: Location input works
  41  |   test('Location input accepts text input', async ({ page }) => {
  42  |     const locationInput = page.locator('#panchanga-location-input');
  43  | 
  44  |     // Type location
  45  |     await locationInput.fill('Chennai, India');
  46  | 
  47  |     // Verify text was entered
  48  |     const value = await locationInput.inputValue();
  49  |     expect(value).toBe('Chennai, India');
  50  |   });
  51  | 
  52  |   // Test: Date picker works
  53  |   test('Date picker accepts date input', async ({ page }) => {
  54  |     const datePicker = page.locator('#panchanga-date-input');
  55  | 
  56  |     if (await datePicker.isVisible()) {
  57  |       // Set a specific date
  58  |       await datePicker.fill('2026-05-28');
  59  | 
  60  |       // Verify date was set
  61  |       const value = await datePicker.inputValue();
  62  |       expect(value).toContain('2026');
  63  |     }
  64  |   });
  65  | 
  66  |   // Test: Calculate button triggers calculation
  67  |   test('Calculate button initiates panchanga calculation', async ({ page }) => {
  68  |     const locationInput = page.locator('#panchanga-location-input');
  69  |     const calcBtn = page.locator('button:has-text("Calculate")');
  70  | 
  71  |     // Fill location
> 72  |     await locationInput.fill('New York, USA');
      |                         ^ Error: locator.fill: Test timeout of 30000ms exceeded.
  73  | 
  74  |     // Click calculate button
  75  |     await calcBtn.click();
  76  | 
  77  |     // Wait for calculation (may show loading state or results)
  78  |     try {
  79  |       await page.waitForTimeout(2000); // Wait for calculation
  80  | 
  81  |       // Check for results or error message
  82  |       const resultArea = page.locator('[class*="result"]');
  83  |       const errorArea = page.locator('[class*="error"]');
  84  | 
  85  |       const resultsVisible = await resultArea.first().isVisible().catch(() => false);
  86  |       const errorVisible = await errorArea.first().isVisible().catch(() => false);
  87  | 
  88  |       // Either results or error should be visible
  89  |       expect(resultsVisible || errorVisible).toBeTruthy();
  90  |     } catch (e) {
  91  |       console.log('Calculation handling test note:', e.message);
  92  |     }
  93  |   });
  94  | 
  95  |   // Test: Panchanga results display when calculation succeeds
  96  |   test('Panchanga results display with all components', async ({ page }) => {
  97  |     const locationInput = page.locator('#panchanga-location-input');
  98  |     const calcBtn = page.locator('button:has-text("Calculate")');
  99  | 
  100 |     // Fill location and calculate
  101 |     await locationInput.fill('Chennai, India');
  102 |     await calcBtn.click();
  103 | 
  104 |     // Wait for results to appear
  105 |     try {
  106 |       const tithiName = page.locator('[id*="tithi-name"], [class*="tithi"]').first();
  107 |       await tithiName.waitFor({ timeout: TIMEOUT });
  108 | 
  109 |       // Check various panchanga elements
  110 |       const elements = {
  111 |         tithi: page.locator('text=/Tithi|तिथि/i').first(),
  112 |         nakshatra: page.locator('text=/Nakshatra|नक्षत्र/i').first(),
  113 |         yoga: page.locator('text=/Yoga|योग/i').first(),
  114 |         karana: page.locator('text=/Karana|करण/i').first(),
  115 |         hora: page.locator('text=/Hora|होरा/i').first()
  116 |       };
  117 | 
  118 |       for (const [key, element] of Object.entries(elements)) {
  119 |         const visible = await element.isVisible().catch(() => false);
  120 |         console.log(`${key}: ${visible}`);
  121 |       }
  122 |     } catch (e) {
  123 |       console.log('Results display test timeout/error:', e.message);
  124 |       // This is acceptable - may indicate calculation failed
  125 |     }
  126 |   });
  127 | 
  128 |   // Test: Error handling when location not found
  129 |   test('Shows error message when location cannot be geocoded', async ({ page }) => {
  130 |     const locationInput = page.locator('#panchanga-location-input');
  131 |     const calcBtn = page.locator('button:has-text("Calculate")');
  132 | 
  133 |     // Try invalid location
  134 |     await locationInput.fill('XYZABC Nonexistent Place 12345');
  135 |     await calcBtn.click();
  136 | 
  137 |     // Wait for error or timeout
  138 |     try {
  139 |       await page.waitForTimeout(3000);
  140 | 
  141 |       // Check for error message
  142 |       const errorMsg = page.locator('[class*="error"]');
  143 |       const errorVisible = await errorMsg.isVisible().catch(() => false);
  144 | 
  145 |       if (errorVisible) {
  146 |         const text = await errorMsg.textContent();
  147 |         expect(text).toBeTruthy();
  148 |       }
  149 |     } catch (e) {
  150 |       console.log('Error handling test note:', e.message);
  151 |     }
  152 |   });
  153 | 
  154 |   // Test: Version display
  155 |   test('Version is displayed on page', async ({ page }) => {
  156 |     const version = page.locator('text=/v\\d+\\.\\d+\\.\\d+/');
  157 |     const versionVisible = await version.isVisible().catch(() => false);
  158 | 
  159 |     if (versionVisible) {
  160 |       const text = await version.textContent();
  161 |       expect(text).toMatch(/v\d+\.\d+\.\d+/);
  162 |     }
  163 |   });
  164 | 
  165 |   // Test: No critical errors in console
  166 |   test('Page loads without critical JavaScript errors', async ({ page }) => {
  167 |     const errors = [];
  168 | 
  169 |     page.on('console', msg => {
  170 |       if (msg.type() === 'error') {
  171 |         errors.push(msg.text());
  172 |       }
```