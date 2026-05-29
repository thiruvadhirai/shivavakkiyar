/**
 * Playwright Configuration
 * E2E tests for Panchanga Calculator with Code Coverage
 */

const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.js',
  timeout: 30000,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 1,

  reporter: [
    ['html', { outputFolder: 'tests/test-results', open: 'never' }],
    ['json', { outputFile: 'tests/test-results.json' }],
    ['junit', { outputFile: 'tests/test-results.xml' }],
    ['list'],
  ],

  use: {
    baseURL: process.env.TEST_URL || 'http://localhost:5080',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  webServer: {
    command: 'echo "Jekyll server should be running separately: podman-compose up -d saivamcloud-dev"',
    reuseExistingServer: true,
    timeout: 120000,
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchArgs: [
          '--disable-blink-features=AutomationControlled',
          '--headless', // Ensure headless mode for CI/containers
        ],
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        launchArgs: ['--headless'],
      },
    },
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
        launchArgs: ['--headless'],
      },
    },
  ],
});
