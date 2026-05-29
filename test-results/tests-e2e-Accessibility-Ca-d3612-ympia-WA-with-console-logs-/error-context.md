# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests/e2e.spec.js >> Accessibility >> Calculate Panchanga for 06/12/2026 + Olympia, WA (with console logs)
- Location: tests/e2e.spec.js:408:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('#panchanga-location-input')
    - locator resolved to <input type="text" id="panchanga-location-input" class="panchanga-location-input" placeholder="Enter city, state, country, or ZIP code"/>
    - fill("Olympia, Thurston, Washington")
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
  324 |         await calc.init();
  325 | 
  326 |         const date = new Date('2026-05-28');
  327 |         const lat = 47.08466;  // Olympia, WA
  328 |         const lon = -123.02958;
  329 | 
  330 |         const sunLon = await calc.getSunLongitude(date, lat, lon);
  331 |         const moonLon = await calc.getMoonLongitude(date, lat, lon);
  332 |         const tithi = calc.calculateTithi(sunLon, moonLon);
  333 | 
  334 |         return {
  335 |           success: true,
  336 |           sunLon: parseFloat(sunLon.toFixed(2)),
  337 |           moonLon: parseFloat(moonLon.toFixed(2)),
  338 |           tithiNumber: tithi.number,
  339 |           tithiName: tithi.name
  340 |         };
  341 |       } catch (error) {
  342 |         return {
  343 |           success: false,
  344 |           error: error.message
  345 |         };
  346 |       }
  347 |     });
  348 | 
  349 |     expect(result.success).toBeTruthy();
  350 |     expect(result.tithiNumber).toBeGreaterThanOrEqual(1);
  351 |     expect(result.tithiNumber).toBeLessThanOrEqual(30);
  352 |     expect(result.tithiName).toBeTruthy();
  353 |   });
  354 | 
  355 |   test('Pradosha widget calculates next 3 Pradosha dates', async ({ page }) => {
  356 |     await page.goto(`${BASE_URL}/pradoshakalapooja/`, { timeout: TIMEOUT });
  357 |     await page.waitForLoadState('networkidle');
  358 | 
  359 |     // Check if widget container exists
  360 |     const widgetVisible = await page.locator('[id*="panchanga"]').first().isVisible().catch(() => false);
  361 |     expect(widgetVisible).toBeTruthy();
  362 | 
  363 |     // The widget should load and initialize
  364 |     await page.waitForTimeout(2000);
  365 | 
  366 |     // Check for Pradosha date display
  367 |     const pradoshaText = page.locator('text=/Pradosha|tithi|date/i').first();
  368 |     const hasContent = await pradoshaText.isVisible().catch(() => false);
  369 | 
  370 |     if (hasContent) {
  371 |       const text = await pradoshaText.textContent();
  372 |       expect(text).toBeTruthy();
  373 |     }
  374 |   });
  375 | });
  376 | 
  377 | // ============================================================
  378 | // TEST SUITE: Accessibility
  379 | // ============================================================
  380 | 
  381 | test.describe('Accessibility', () => {
  382 |   test('Form inputs are keyboard accessible', async ({ page }) => {
  383 |     await page.goto(`${BASE_URL}/panchanga/`, { timeout: TIMEOUT });
  384 |     await page.waitForLoadState('networkidle');
  385 | 
  386 |     const locationInput = page.locator('#panchanga-location-input');
  387 | 
  388 |     // Tab to input
  389 |     await page.keyboard.press('Tab');
  390 | 
  391 |     // Check if input is focused
  392 |     const focused = await locationInput.evaluate(el => el === document.activeElement);
  393 |     console.log('Location input focused:', focused);
  394 |   });
  395 | 
  396 |   test('Buttons have accessible labels', async ({ page }) => {
  397 |     await page.goto(`${BASE_URL}/panchanga/`, { timeout: TIMEOUT });
  398 |     await page.waitForLoadState('networkidle');
  399 | 
  400 |     const calcBtn = page.locator('button:has-text("Calculate")').first();
  401 |     const text = await calcBtn.textContent();
  402 | 
  403 |     expect(text).toBeTruthy();
  404 |     expect(text.length).toBeGreaterThan(0);
  405 |   });
  406 | 
  407 |   // Test: Specific case - 06/12/2026 + Olympia, WA (known problematic date)
  408 |   test('Calculate Panchanga for 06/12/2026 + Olympia, WA (with console logs)', async ({ page }) => {
  409 |     // Capture all console messages
  410 |     const consoleLogs = [];
  411 |     page.on('console', msg => {
  412 |       consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
  413 |       console.log(`[Browser Console] ${msg.text()}`);
  414 |     });
  415 | 
  416 |     await page.goto(`${BASE_URL}/panchanga/`, { timeout: TIMEOUT });
  417 |     await page.waitForLoadState('networkidle');
  418 | 
  419 |     // Fill in the known problematic case
  420 |     const locationInput = page.locator('#panchanga-location-input');
  421 |     const dateInput = page.locator('#panchanga-date-input');
  422 |     const calcBtn = page.locator('button:has-text("Calculate")').first();
  423 | 
> 424 |     await locationInput.fill('Olympia, Thurston, Washington');
      |                         ^ Error: locator.fill: Test timeout of 30000ms exceeded.
  425 |     await dateInput.fill('2026-06-12');
  426 | 
  427 |     console.log('TEST: Clicking Calculate button for 06/12/2026 + Olympia, WA');
  428 | 
  429 |     // Click calculate and wait for results or error
  430 |     await calcBtn.click();
  431 | 
  432 |     // Wait for either success or error message
  433 |     try {
  434 |       await page.waitForSelector('#panchanga-result-date, #panchanga-error, [id*="error"]', { timeout: 5000 });
  435 |     } catch (e) {
  436 |       console.log('TEST: No result/error element found within 5s');
  437 |     }
  438 | 
  439 |     // Check if calculation succeeded
  440 |     const resultDate = await page.locator('#panchanga-result-date').isVisible();
  441 |     const errorMsg = await page.locator('[id*="error"]').isVisible();
  442 | 
  443 |     console.log('TEST SUMMARY:');
  444 |     console.log('- Result visible:', resultDate);
  445 |     console.log('- Error visible:', errorMsg);
  446 |     console.log('- Total console messages:', consoleLogs.length);
  447 |     console.log('- All logs:', consoleLogs);
  448 | 
  449 |     // The test passes if we get here without crash
  450 |     expect(resultDate || errorMsg).toBeTruthy();
  451 |   });
  452 | });
  453 | 
```