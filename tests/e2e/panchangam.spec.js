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
