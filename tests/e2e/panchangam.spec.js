import { test, expect } from '@playwright/test';

const BASE_URL = process.env.TEST_URL || 'http://localhost:5080';
const TIMEOUT = 10000;

test.describe('Panchangam Modal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/panchangam/`, { timeout: TIMEOUT });
    await page.waitForLoadState('networkidle');
  });

  test('Modal is hidden by default', async ({ page }) => {
    const modal = page.locator('[data-testid="panchanga-modal"]');
    const isVisible = await modal.isVisible();
    expect(isVisible).toBe(false);
  });

  test('Modal opens when "Change Location/Date" button is clicked', async ({ page }) => {
    const button = page.locator('[data-testid="panchanga-change-location-btn"]');
    await button.click();

    const modal = page.locator('[data-testid="panchanga-modal"]');
    const isVisible = await modal.isVisible();
    expect(isVisible).toBe(true);
  });

  test('Modal closes when close button (X) is clicked', async ({ page }) => {
    const openBtn = page.locator('[data-testid="panchanga-change-location-btn"]');
    await openBtn.click();

    const closeBtn = page.locator('[data-testid="panchanga-modal-close-btn"]');
    await closeBtn.click();

    const modal = page.locator('[data-testid="panchanga-modal"]');
    const isVisible = await modal.isVisible();
    expect(isVisible).toBe(false);
  });
});

test.describe('Modal Form Submission', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/panchangam/`, { timeout: TIMEOUT });
    await page.waitForLoadState('networkidle');
  });

  test('Modal Calculate button validates form', async ({ page }) => {
    const changeBtn = page.locator('[data-testid="panchanga-change-location-btn"]');
    await changeBtn.click();

    const modal = page.locator('[data-testid="panchanga-modal"]');
    let isVisible = await modal.isVisible();
    expect(isVisible).toBe(true);

    const calculateBtn = page.locator('[data-testid="panchanga-modal-calculate-btn"]');
    await calculateBtn.click();

    await page.waitForTimeout(500);

    const errorMsg = page.locator('[id="panchanga-modal-error"]');
    let errorVisible = await errorMsg.isVisible().catch(() => false);
    expect(errorVisible).toBe(true);

    isVisible = await modal.isVisible();
    expect(isVisible).toBe(true);
  });

  test('Modal closes after successful calculation and updates URL', async ({ page }) => {
    const changeBtn = page.locator('[data-testid="panchanga-change-location-btn"]');
    await changeBtn.click();

    const locationInput = page.locator('[data-testid="panchanga-modal-location-input"]');
    await locationInput.fill('Chennai');
    await page.waitForTimeout(300);

    const suggestion = page.locator('.panchanga-suggestion-item').first();
    const exists = await suggestion.isVisible().catch(() => false);
    if (exists) {
      await suggestion.click();
    }

    const dateInput = page.locator('[data-testid="panchanga-modal-date-input"]');
    await dateInput.fill('2026-06-06');

    const calculateBtn = page.locator('[data-testid="panchanga-modal-calculate-btn"]');
    await calculateBtn.click();

    await page.waitForTimeout(2000);

    const url = page.url();
    expect(url).toMatch(/date=2026-06-06/);
    expect(url).toMatch(/locationid=/);

    const modal = page.locator('[data-testid="panchanga-modal"]');
    const isVisible = await modal.isVisible();
    expect(isVisible).toBe(false);
  });
});
