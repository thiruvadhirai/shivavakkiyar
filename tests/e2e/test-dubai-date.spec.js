const { test, expect } = require('@playwright/test');

test('Dubai timezone: date should not shift from 2026-06-06 to 2026-06-05', async ({ page }) => {
  // Visit the page with Dubai location and date
  await page.goto('http://localhost:5080/panchangam/?date=2026-06-06&locationid=25.0791,55.4797');
  
  // Wait for the widget to load
  await page.waitForSelector('#panchanga-result-date', { timeout: 5000 });
  
  // Get the displayed date
  const dateText = await page.textContent('#panchanga-result-date');
  console.log('Displayed date:', dateText);
  
  // The date should show 2026/06/06, NOT 2026/06/05
  expect(dateText).toContain('2026');
  expect(dateText).toContain('06');
  expect(dateText).not.toContain('2026/06/05');
});
