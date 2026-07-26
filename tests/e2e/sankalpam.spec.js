import { test, expect } from '@playwright/test';

const BASE_URL = process.env.TEST_URL || 'http://localhost:5080';
const TIMEOUT = 15000;

/**
 * The Sankalpam page is a worked example for a FIXED location (Olympia WA);
 * only the moment is chooseable. These tests drive it to the occasion the page
 * prose is written around — Pradosha Kalam, 26 June 2026 — and check that the
 * calendar values reach all three renderings.
 */
test.describe('Sankalpam page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/sankalpam/`, { timeout: TIMEOUT });
    await page.waitForLoadState('networkidle');
  });

  async function setMoment(page, date, time) {
    await page.fill('#sankalpam-date', date);
    await page.fill('#sankalpam-time', time);
    await page.dispatchEvent('#sankalpam-time', 'change');
    // Wait for a real value to land in place of the placeholder dash
    await expect(page.locator('[data-sk="masa"][data-lang="en"]').first())
      .not.toHaveText('—', { timeout: TIMEOUT });
  }

  test('date and time chooser is present', async ({ page }) => {
    await expect(page.locator('#sankalpam-date')).toBeVisible();
    await expect(page.locator('#sankalpam-time')).toBeVisible();
    await expect(page.locator('#sankalpam-now-btn')).toBeVisible();
  });

  test('defaults to a populated moment without user input', async ({ page }) => {
    await expect(page.locator('#sankalpam-date')).not.toHaveValue('');
    await expect(page.locator('[data-sk="samvatsara"][data-lang="en"]').first())
      .not.toHaveText('—', { timeout: TIMEOUT });
  });

  test('26 June 2026 evening yields the page\'s anchor values', async ({ page }) => {
    await setMoment(page, '2026-06-26', '18:30');

    const en = (f) => page.locator(`[data-sk="${f}"][data-lang="en"]`).first();

    await expect(en('samvatsara')).toHaveText('Parabhava');
    await expect(en('ayana')).toHaveText('Uttarayana');
    await expect(en('ritu')).toHaveText('Greeshma');
    await expect(en('masa')).toHaveText('Aani');
    await expect(en('vaara')).toHaveText('Friday');
  });

  test('calendar values reach all three renderings', async ({ page }) => {
    await setMoment(page, '2026-06-26', '18:30');

    // Tamil grantha
    await expect(page.locator('[data-sk="masa"][data-lang="ta"]').first())
      .toHaveText('ஆனி');
    // IAST
    await expect(page.locator('[data-sk="masa"][data-lang="ia"]').first())
      .toHaveText('āni');
    // English
    await expect(page.locator('[data-sk="masa"][data-lang="en"]').first())
      .toHaveText('Aani');
  });

  test('tithi is given in the Sanskrit locative in the recited text', async ({ page }) => {
    await setMoment(page, '2026-06-26', '18:30');

    const tithiTa = page.locator('[data-sk="tithi"][data-lang="ta"]').first();
    await expect(tithiTa).toContainText('யாம்', { timeout: TIMEOUT });
  });

  test('vaara agrees with the displayed moment (timezone regression)', async ({ page }) => {
    // An Olympia evening is the NEXT day in UTC; reading the weekday off the raw
    // instant used to yield Saturday for a Sunday evening.
    for (const [date, weekday] of [
      ['2026-07-26', 'Sunday'],
      ['2026-06-26', 'Friday'],
      ['2026-01-15', 'Thursday'],
    ]) {
      await setMoment(page, date, '18:30');
      await expect(page.locator('[data-sk="vaara"][data-lang="en"]').first())
        .toHaveText(weekday);
      await expect(page.locator('[data-sk="datetime"]').first())
        .toContainText(weekday);
    }
  });

  test('ayanamsa, sunrise and sunset are shown', async ({ page }) => {
    await setMoment(page, '2026-06-26', '18:30');

    await expect(page.locator('[data-sk="ayanamsa"]').first()).toContainText('°');
    await expect(page.locator('[data-sk="sunrise"]').first()).not.toHaveText('—');
    await expect(page.locator('[data-sk="sunset"]').first()).not.toHaveText('—');
  });

  test('changing the date changes the calendar values', async ({ page }) => {
    await setMoment(page, '2026-06-26', '18:30');
    const before = await page.locator('[data-sk="masa"][data-lang="en"]').first().textContent();

    await setMoment(page, '2026-02-10', '18:30');
    const after = await page.locator('[data-sk="masa"][data-lang="en"]').first().textContent();

    expect(before).not.toBe(after);
    expect(after.trim()).toBe('Thai');
  });

  test('location slots are colour-coded and left fixed to Olympia', async ({ page }) => {
    const amber = page.locator('.sk-loc');
    expect(await amber.count()).toBeGreaterThan(5);
    await expect(page.locator('.sk-loc', { hasText: 'ஒலிம்பியா' }).first()).toBeVisible();
    // No data binding on location — it must stay put when the moment changes
    expect(await page.locator('.sk-loc[data-sk]').count()).toBe(0);
  });

  test('page reports no JavaScript errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.reload({ waitUntil: 'networkidle' });
    await expect(page.locator('[data-sk="masa"][data-lang="en"]').first())
      .not.toHaveText('—', { timeout: TIMEOUT });
    expect(errors).toEqual([]);
  });
});
