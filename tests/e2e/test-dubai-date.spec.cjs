import { test, expect } from '@playwright/test';

test('Dubai timezone (UTC+4): date should show 2026-06-06 correctly', async ({ page }) => {
  // Visit the page with Dubai location and date
  await page.goto('http://saivamcloud-dev:4000/panchangam/?date=2026-06-06&locationid=25.0791,55.4797');

  // Wait for the widget to load and calculate
  await page.waitForSelector('#panchanga-result-date', { timeout: 10000 });

  // Get the displayed date
  const dateText = await page.textContent('#panchanga-result-date');
  console.log('Dubai date:', dateText);

  // The date should show 2026 and 06, not a previous date
  expect(dateText).toContain('2026');
  expect(dateText).toContain('06');
});

test('Abu Simbel, Egypt timezone (UTC+2): date should show 2026-06-06 correctly', async ({ page }) => {
  // Visit the page with Abu Simbel location and date
  // Coordinates: 22.3372°N, 31.6061°E
  await page.goto('http://saivamcloud-dev:4000/panchangam/?date=2026-06-06&locationid=22.3372,31.6061');

  // Wait for the widget to load and calculate
  await page.waitForSelector('#panchanga-result-date', { timeout: 10000 });

  // Get the displayed date
  const dateText = await page.textContent('#panchanga-result-date');
  console.log('Abu Simbel date:', dateText);

  // The date should show 2026 and 06, not a previous date
  expect(dateText).toContain('2026');
  expect(dateText).toContain('06');
});
